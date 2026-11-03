import { UPGRADES, type UpgradeDef } from "../data/upgrades";
import { launchVelocity, stepBody, type Vec2, type World } from "../physics/ballistics";
import { barrelTip, moveTank, tankContains, type Tank } from "../entities/tank";
import type { TerrainMask } from "../terrain/mask";
import type { AiMemory } from "../state/aiSettings";
import { buyUpgrade, upgradeCost, type Profile } from "./upgrades";

/** Ugyanaz a fix lépésköz, mint a játékban, így a számolt röppálya egyezik a valódival. */
const SIM_DT = 1 / 60;
const MAX_SKILL = 0.9;
const MIN_SKILL = 0.3;
const MAX_SIM_STEPS = 900;
const MIN_ANGLE = 5;
const MAX_ANGLE = 175;
const MIN_POWER = 100;
const MAX_CORRECTION = 160;
/** Ennyi lépésenként (2 px) értékeli újra a lövési lehetőséget mozgás közben. */
const MOVE_EVAL_INTERVAL = 6;

/** A tudásszint a meccsek számától és a találati aránytól függ, és sosem éri el a tökéletest. */
export function skillFromMemory(memory: AiMemory): number {
  const experience = Math.min(1, memory.matches / 12);
  const accuracy = memory.shots >= 10 ? memory.hits / memory.shots : 0.3;
  return Math.min(MAX_SKILL, MIN_SKILL + experience * 0.4 + accuracy * 0.2);
}

export const MAX_RANK = 5;

/** Tapasztalati erő külön skálán: 0 (újonc) – 1 (a lehetséges maximum). */
export function experienceStrength(memory: AiMemory): number {
  return Math.min(1, Math.max(0, (skillFromMemory(memory) - MIN_SKILL) / (MAX_SKILL - MIN_SKILL)));
}

/** Rendfokozat csillagokban (0–5), a tapasztalati erőből. */
export function rankStars(memory: AiMemory): number {
  return Math.min(MAX_RANK, Math.floor(experienceStrength(memory) * MAX_RANK + 1e-9));
}

/** Standard normál eloszlás (Box–Muller). */
export function gaussian(random: () => number): number {
  const u = Math.max(random(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

export interface Impact {
  pos: Vec2;
  /** Igaz, ha a lövedék a célpont testét találta el. */
  hitTarget: boolean;
}

/** A lövedék első becsapódása; null, ha elhagyja a pályát. */
export function simulateImpact(
  start: Vec2,
  angle: number,
  power: number,
  world: World,
  mask: TerrainMask,
  target?: Tank,
): Impact | null {
  let body = { pos: start, vel: launchVelocity(angle, power) };
  for (let i = 0; i < MAX_SIM_STEPS; i++) {
    body = stepBody(body, world, SIM_DT);
    const { x, y } = body.pos;
    if (target && tankContains(target, x, y)) return { pos: body.pos, hitTarget: true };
    if (mask.isSolid(x, y)) return { pos: body.pos, hitTarget: false };
    if (x < 0 || x > mask.width || y > mask.height) return null;
  }
  return null;
}

export interface ShotPlan {
  angle: number;
  power: number;
  /** A számolt (zaj nélküli) becsapódás távolsága a célponttól. */
  error: number;
}

export interface PlanInput {
  shooter: Tank;
  target: Tank;
  mask: TerrainMask;
  /** A gép által feltételezett szél (nem feltétlenül a valódi). */
  wind: number;
  gravity: number;
  /** A célpont eltolása tanult korrekcióként. */
  correctionX: number;
}

/** Szög/erő rács átvizsgálása: a legközelebb becsapódó, magát nem veszélyeztető lövést adja. */
export function planShot({ shooter, target, mask, wind, gravity, correctionX }: PlanInput): ShotPlan | null {
  const world: World = { gravity, wind };
  const aim = { x: target.x + correctionX, y: target.y - 6 };
  const safeDistance = shooter.stats.blastRadius * 2;
  let best: ShotPlan | null = null;
  for (let angle = MIN_ANGLE; angle <= MAX_ANGLE; angle += 2) {
    const tip = barrelTip({ ...shooter, angle });
    for (let power = MIN_POWER; power <= shooter.stats.maxPower; power += 10) {
      const impact = simulateImpact(tip, angle, power, world, mask, target);
      if (!impact) continue;
      if (Math.hypot(impact.pos.x - shooter.x, impact.pos.y - shooter.y) < safeDistance) continue;
      const error = Math.hypot(impact.pos.x - aim.x, impact.pos.y - aim.y);
      if (!best || error < best.error) best = { angle, power, error };
    }
  }
  return best;
}

export interface AiBrainOptions {
  skill: number;
  random?: () => number;
}

/**
 * Egy meccsnyi „agy”: a hiányos szélbecslés és a célzási zaj miatt téved,
 * de a becsapódásokból tanul (korrekció), a meccsek közti tapasztalat pedig javítja a tudásszintet.
 */
export class AiBrain {
  private readonly random: () => number;
  private correctionX = 0;
  private readonly windBias: number;
  private lastAimX: number | null = null;
  readonly skill: number;

  constructor({ skill, random = Math.random }: AiBrainOptions) {
    this.skill = Math.min(MAX_SKILL, Math.max(0, skill));
    this.random = random;
    this.windBias = gaussian(random) * 35 * (1 - this.skill);
  }

  get correction(): number {
    return this.correctionX;
  }

  /** A következő lövés szöge és ereje; null, ha nincs értelmes megoldás. */
  decide(shooter: Tank, target: Tank, mask: TerrainMask, wind: number, gravity: number): ShotPlan | null {
    const plan = planShot({
      shooter,
      target,
      mask,
      wind: wind + this.windBias,
      gravity,
      correctionX: this.correctionX,
    });
    if (!plan) return null;
    this.lastAimX = target.x;
    const slack = 1 - this.skill;
    const angle = plan.angle + gaussian(this.random) * (0.4 + 4 * slack);
    const power = plan.power * (1 + gaussian(this.random) * (0.005 + 0.05 * slack));
    return {
      angle: Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, angle)),
      power: Math.min(shooter.stats.maxPower, Math.max(MIN_POWER, power)),
      error: plan.error,
    };
  }

  /** Hány lépést tegyen az ellenfél felé, hogy elérhető és pontos lövése legyen (0 = marad). */
  planMove(shooter: Tank, target: Tank, mask: TerrainMask, wind: number, gravity: number): number {
    const dir = target.x < shooter.x ? -1 : 1;
    const probe: Tank = { ...shooter };
    let bestSteps = 0;
    let bestError = Infinity;
    for (let steps = 0; ; steps++) {
      if (steps % MOVE_EVAL_INTERVAL === 0) {
        const plan = planShot({
          shooter: probe,
          target,
          mask,
          wind: wind + this.windBias,
          gravity,
          correctionX: this.correctionX,
        });
        const error = plan?.error ?? Infinity;
        if (error < bestError - 1) {
          bestError = error;
          bestSteps = steps;
        }
        if (error <= shooter.stats.blastRadius) break;
      }
      if (!moveTank(probe, dir, mask)) break;
    }
    return bestSteps;
  }

  /** A tényleges becsapódás alapján módosítja a célpontot (a következő lövés ehhez igazodik). */
  observe(impactX: number): void {
    if (this.lastAimX === null) return;
    const miss = impactX - this.lastAimX;
    this.correctionX = Math.max(-MAX_CORRECTION, Math.min(MAX_CORRECTION, this.correctionX - miss * 0.6));
    this.lastAimX = null;
  }
}

export interface MatchSummary {
  shots: number;
  /** Az AI által okozott sérülés. */
  damageDealt: number;
  /** Az AI által elszenvedett sérülés. */
  damageTaken: number;
  won: boolean;
}

const BASE_WEIGHT: Record<string, number> = {
  armor: 1,
  shield: 1,
  warhead: 1.2,
  blast: 1,
  barrel: 0.6,
  engine: 0.3,
  smartAim: 0.25,
};

/** Az adott meccs tapasztalata szerint súlyozza a fejlesztéseket. */
export function upgradeWeight(def: UpgradeDef, level: number, summary: MatchSummary, random: () => number): number {
  let weight = BASE_WEIGHT[def.id] ?? 0.5;
  const total = summary.damageDealt + summary.damageTaken;
  const takenShare = total > 0 ? summary.damageTaken / total : 0.5;
  const accuracyPoor = summary.shots > 0 && summary.damageDealt / summary.shots < 12;
  if (def.id === "armor" || def.id === "shield") weight *= 0.6 + takenShare * 1.4;
  if (def.id === "warhead" || def.id === "blast") weight *= accuracyPoor ? 1.5 : 0.7 + (1 - takenShare) * 0.6;
  if (def.id === "engine" && !summary.won) weight *= 1.3;
  // Fogyó hozadék, kis véletlen: nem mindig ugyanazt választja.
  return (weight / (1 + level * 0.5)) * (0.8 + random() * 0.4);
}

/** A gép kiválasztja és megvásárolja a fejlesztéseket; a vásárolt azonosítókat is visszaadja. */
export function chooseUpgrades(
  profile: Profile,
  summary: MatchSummary,
  random: () => number = Math.random,
  defs: readonly UpgradeDef[] = UPGRADES,
): { profile: Profile; bought: string[] } {
  let current = profile;
  const bought: string[] = [];
  for (let guard = 0; guard < 50; guard++) {
    let bestId: string | null = null;
    let bestScore = 0;
    for (const def of defs) {
      const level = current.levels[def.id] ?? 0;
      if (level >= def.maxLevel || upgradeCost(def, level) > current.xp) continue;
      const score = upgradeWeight(def, level, summary, random) / upgradeCost(def, level);
      if (score > bestScore) {
        bestScore = score;
        bestId = def.id;
      }
    }
    if (!bestId) break;
    const next = buyUpgrade(current, bestId, defs);
    if (!next) break;
    current = next;
    bought.push(bestId);
  }
  return { profile: current, bought };
}
