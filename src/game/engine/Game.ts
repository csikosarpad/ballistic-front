import { Application, Assets, Container, Graphics, Sprite, type Texture } from "pixi.js";
import tankBodyUrl from "../assets/tank-body.svg?url";
import tankBarrelUrl from "../assets/tank-barrel.svg?url";
import { kick, stepBarrel, type BarrelState } from "../systems/barrelAnimation";
import { DEFAULT_WORLD, dashPolyline, launchVelocity, predictTrajectory, stepBody, type BallisticBody } from "../physics/ballistics";
import { PreviewAllowance } from "../systems/previewAllowance";
import { Terrain } from "../terrain/Terrain";
import { ParticleSystem } from "../systems/particles";
import { FxRenderer } from "./FxRenderer";
import { loadFxTextures } from "./fxTextures";
import { TurnManager } from "../systems/turnManager";
import {
  applyDamage, barrelTip, createTank, explosionDamage, isAlive, moveTank, settleTank, tankContains,
  type Tank,
} from "../entities/tank";
import { awardXp, buyUpgrade, computeStats, newProfile, type Profile } from "../systems/upgrades";
import { newMatchStats, recordDamage, recordShot, recordXp, type MatchStats } from "../systems/matchStats";
import { loadProfiles, saveProfiles } from "../systems/profileStorage";
import { useGameStore } from "../state/gameStore";

const FIXED_DT = 1 / 60;
/** Fix logikai pályaméret; az ablak mérete csak a skálázást befolyásolja. */
export const WORLD_WIDTH = 1280;
export const WORLD_HEIGHT = 720;
const WIN_BONUS_XP = 50;
/** Az előnézet finom pontvonala (px). */
const PREVIEW_DASH = 2;
const PREVIEW_GAP = 4;
/** Ennyi ideig nem találhatja el a lövedék a lövő tankot (tick). */
const SELF_HIT_GRACE = 30;
/** A cső forgáspontja a tank talajszintje fölött (px); egyezik a tank.ts-ben lévővel. */
const BARREL_PIVOT_HEIGHT = 10;

interface TankView {
  root: Container;
  barrel: Sprite;
  anim: BarrelState;
}

/** Pixi-t és a játéklogikát összefogó engine; Reacttől független, így tesztelhető. */
export class Game {
  private app = new Application();
  private terrain: Terrain | null = null;
  private tanksGfx = new Graphics();
  private tankLayer = new Container();
  private tankViews = new Map<string, TankView>();
  private tankTextures: { body: Texture; barrel: Texture } | null = null;
  private shellGfx = new Graphics();
  private shellGlow = new Sprite();
  private fx: FxRenderer | null = null;
  private previewGfx = new Graphics();
  private previewAllowance = new PreviewAllowance();
  private previewActive = false;
  private particles = new ParticleSystem();
  private tanks: Tank[] = [];
  /** A meccsek között megmaradó fejlődés (meta-progresszió). */
  private profiles: Record<string, Profile> = loadProfiles(["P1", "P2"]);
  private matchStats: MatchStats = newMatchStats(["P1", "P2"]);
  private turns = new TurnManager([]);
  private nextStarter = Math.floor(Math.random() * 2);
  private shell: BallisticBody | null = null;
  private shellAge = 0;
  private acc = 0;
  private destroyed = false;

  async init(host: HTMLElement): Promise<void> {
    await this.app.init({ resizeTo: host, background: "#0b1020", antialias: true });
    // Ha az init közben unmountoltak (StrictMode), azonnal takarítunk.
    if (this.destroyed) return this.app.destroy(true);
    host.appendChild(this.app.canvas);

    const [body, barrel, fxTextures] = await Promise.all([
      Assets.load<Texture>({ src: tankBodyUrl, data: { resolution: 3 } }),
      Assets.load<Texture>({ src: tankBarrelUrl, data: { resolution: 3 } }),
      loadFxTextures(),
    ]);
    // Az asset-betöltés alatt is megszúnhetett a komponens (StrictMode).
    if (this.destroyed) return;
    this.tankTextures = { body, barrel };
    this.fx = new FxRenderer(fxTextures);
    this.shellGlow.texture = fxTextures.glow;
    this.shellGlow.anchor.set(0.5);
    this.shellGlow.scale.set(30 / fxTextures.glow.width);
    this.shellGlow.tint = 0xffd070;
    this.shellGlow.blendMode = "add";
    this.shellGlow.visible = false;

    this.terrain = new Terrain(this.app.renderer);
    const backdrop = new Graphics().rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT).fill(0x16224a);
    this.app.stage.addChild(backdrop, this.terrain.sprite, this.previewGfx, this.tankLayer, this.tanksGfx, this.shellGfx, this.shellGlow, this.fx.layer);
    this.layout();
    this.restart();
    this.app.renderer.on("resize", () => this.layout());
    this.app.ticker.add((t) => this.update(t.deltaMS / 1000));
  }

  /** A pályát középre illeszti az ablakba, arányt tartva. */
  private layout(): void {
    const { width, height } = this.app.screen;
    const scale = Math.min(width / WORLD_WIDTH, height / WORLD_HEIGHT);
    this.app.stage.scale.set(scale);
    this.app.stage.position.set((width - WORLD_WIDTH * scale) / 2, (height - WORLD_HEIGHT * scale) / 2);
  }

  /** Új meccs: terep újragenerálása, tankok újraszórása. */
  restart(): void {
    if (!this.terrain) return;
    const width = WORLD_WIDTH;
    this.terrain.build(WORLD_WIDTH, WORLD_HEIGHT, Math.floor(Math.random() * 1_000_000));
    this.tanks = [
      createTank("P1", width * 0.12, 0x4da3ff, 45, this.statsFor("P1")),
      createTank("P2", width * 0.88, 0xff6b5a, 135, this.statsFor("P2")),
    ];
    this.tanks.forEach((t) => settleTank(t, this.terrain!.mask));
    this.buildTankViews();
    // Az első lövő meccsenként változik, hogy ne legyen fix kezdő előny.
    this.turns = new TurnManager(this.tanks.map((t) => t.id), this.nextStarter);
    this.nextStarter = (this.nextStarter + 1) % this.tanks.length;
    this.matchStats = newMatchStats(this.tanks.map((t) => t.id));
    this.previewAllowance.reset();
    this.shell = null;
    this.beginTurn();
  }

  private statsFor(id: string) {
    return computeStats(this.profiles[id]!.levels);
  }

  /** Tankonként egy sprite-pár: a cső a test mögött forog a saját forgáspontja körü. */
  private buildTankViews(): void {
    if (!this.tankTextures) return;
    for (const child of this.tankLayer.removeChildren()) child.destroy({ children: true });
    this.tankViews.clear();
    for (const t of this.tanks) {
      const barrel = new Sprite(this.tankTextures.barrel);
      barrel.anchor.set(0, 0.5);
      const body = new Sprite(this.tankTextures.body);
      body.anchor.set(0.5, 1);
      body.tint = t.color;
      const root = new Container();
      root.addChild(barrel, body);
      this.tankLayer.addChild(root);
      this.tankViews.set(t.id, { root, barrel, anim: { angle: t.angle, recoil: 0 } });
    }
  }

  private award(id: string, xp: number): void {
    this.profiles[id] = awardXp(this.profiles[id]!, xp);
    this.matchStats = recordXp(this.matchStats, id, xp);
    saveProfiles(this.profiles);
  }

  /** Minden játékos XP-jének és fejlesztéseinek törlése. */
  resetProgress(): void {
    this.profiles = Object.fromEntries(Object.keys(this.profiles).map((id) => [id, newProfile()]));
    saveProfiles(this.profiles);
    this.syncStore();
  }

  /** Fejlesztés vásárlása; csak meccsek között (játék végén) működik. */
  buy(playerId: string, upgradeId: string): void {
    if (this.turns.phase !== "gameOver") return;
    const next = buyUpgrade(this.profiles[playerId]!, upgradeId);
    if (!next) return;
    this.profiles[playerId] = next;
    saveProfiles(this.profiles);
    this.syncStore();
  }

  private get current(): Tank {
    return this.tanks.find((t) => t.id === this.turns.current)!;
  }

  private beginTurn(): void {
    const tank = this.current;
    tank.moveLeft = tank.stats.moveBudget;
    this.previewActive = false;
    // Új szél minden körben.
    const wind = Math.round((Math.random() - 0.5) * 120);
    useGameStore.getState().sync({ angle: tank.angle, power: tank.power, maxPower: tank.stats.maxPower, wind });
    this.syncStore();
  }

  private syncStore(): void {
    useGameStore.getState().sync({
      phase: this.turns.phase,
      currentId: this.turns.current,
      winner: this.turns.winner,
      tanks: this.tanks.map((t) => ({ id: t.id, hp: t.hp, maxHp: t.stats.maxHp, moveLeft: t.moveLeft })),
      profiles: { ...this.profiles },
      matchStats: this.matchStats,
      previewAvailable: this.turns.phase === "aiming" && this.previewAllowance.canUse(this.turns.current),
      previewActive: this.previewActive,
    });
  }

  /** Meccsenként és játékosonként egyszer: az aktuális kör végéig mutatja a várható röppályát. */
  requestPreview(): void {
    if (this.turns.inputLocked || !this.previewAllowance.use(this.turns.current)) return;
    this.previewActive = true;
    this.syncStore();
  }

  /** Mozgás a jelenlegi tankkal; zárolt bemenetnél nem csinál semmit. */
  move(dir: -1 | 1): void {
    if (this.turns.inputLocked || !this.terrain) return;
    if (moveTank(this.current, dir, this.terrain.mask)) this.syncStore();
  }

  /** Lövés a store-ban beállított szöggel és erővel. */
  fire(): void {
    if (!this.turns.fire()) return;
    const { angle, power } = useGameStore.getState();
    const tank = this.current;
    tank.angle = angle;
    tank.power = power;
    this.matchStats = recordShot(this.matchStats, tank.id);
    const tip = barrelTip(tank);
    this.particles.spawnMuzzleFlash(tip.x, tip.y, angle);
    this.shell = { pos: tip, vel: launchVelocity(angle, power) };
    const view = this.tankViews.get(tank.id);
    if (view) view.anim = kick(angle);
    this.shellAge = 0;
    this.syncStore();
  }

  private explode(x: number, y: number): void {
    const shooter = this.current;
    const radius = shooter.stats.blastRadius;
    this.terrain?.carve(x, y, radius);
    this.particles.spawnExplosion(x, y, radius);
    // XP: az ellenfélnek okozott sérülés (1 HP = 1 XP).
    let dealt = 0;
    for (const t of this.tanks) {
      const before = t.hp;
      applyDamage(t, explosionDamage(t, x, y, radius, shooter.stats.damage));
      if (t !== shooter) dealt += before - t.hp;
    }
    this.award(shooter.id, dealt);
    this.matchStats = recordDamage(this.matchStats, shooter.id, dealt);
    for (const t of this.tanks) if (this.terrain) settleTank(t, this.terrain.mask);
    this.shell = null;
    this.turns.endShot(this.tanks.filter(isAlive).map((t) => t.id));
    if (this.turns.phase === "aiming") this.beginTurn();
    else {
      if (this.turns.winner) this.award(this.turns.winner, WIN_BONUS_XP);
      this.syncStore();
    }
  }

  private stepShell(): void {
    if (!this.shell || !this.terrain) return;
    this.shell = stepBody(this.shell, { ...DEFAULT_WORLD, wind: useGameStore.getState().wind }, FIXED_DT);
    this.shellAge++;
    const { x, y } = this.shell.pos;
    if (this.shellAge % 3 === 0) this.particles.spawnTrail(x, y);
    const hitTank = this.tanks.some(
      (t) => isAlive(t) && (t.id !== this.turns.current || this.shellAge > SELF_HIT_GRACE) && tankContains(t, x, y),
    );
    if (hitTank || this.terrain.mask.isSolid(x, y)) this.explode(x, y);
    else if (x < 0 || x > this.terrain.mask.width || y > WORLD_HEIGHT) {
      // Pályán kívül: nincs robbanás, a kör véget ér.
      this.shell = null;
      this.turns.endShot(this.tanks.filter(isAlive).map((t) => t.id));
      this.beginTurn();
    }
  }

  private update(frameDt: number): void {
    // Fix időlépés: a fizika független a képfrissítéstől.
    this.acc += Math.min(frameDt, 0.1);
    while (this.acc >= FIXED_DT) {
      this.acc -= FIXED_DT;
      this.stepShell();
    }
    this.particles.update(frameDt);
    this.draw(frameDt);
  }

  /** Halvány szaggatott ív a várható röppályáról; a szelet is figyelembe veszi, a tankokat nem. */
  private drawPreview(): void {
    const g = this.previewGfx.clear();
    const tank = this.tanks.find((t) => t.id === this.turns.current);
    if (!this.previewActive || this.turns.phase !== "aiming" || !this.terrain || !tank || !isAlive(tank)) return;
    const { angle, power, wind } = useGameStore.getState();
    const mask = this.terrain.mask;
    const points = predictTrajectory(barrelTip({ ...tank, angle }), angle, power, { ...DEFAULT_WORLD, wind }, {
      dt: FIXED_DT,
      maxSteps: 600,
      width: mask.width,
      height: WORLD_HEIGHT,
      isBlocked: (x, y) => mask.isSolid(x, y),
    });
    for (const [a, b] of dashPolyline(points, PREVIEW_DASH, PREVIEW_GAP)) g.moveTo(a.x, a.y).lineTo(b.x, b.y);
    g.stroke({ width: 1.5, color: 0xffffff, alpha: 0.18 });
  }

  private draw(dt: number): void {
    const aiming = this.turns.phase === "aiming";
    const aimAngle = useGameStore.getState().angle;
    for (const t of this.tanks) {
      const view = this.tankViews.get(t.id);
      if (!view) continue;
      view.root.visible = isAlive(t);
      view.root.position.set(t.x, t.y);
      // Cénzás közben a soron lévő tank csőve a csúszó értékét követi.
      const target = aiming && t.id === this.turns.current ? aimAngle : t.angle;
      view.anim = stepBarrel(view.anim, target, dt);
      const rad = (view.anim.angle * Math.PI) / 180;
      view.barrel.rotation = -rad;
      view.barrel.position.set(-Math.cos(rad) * view.anim.recoil, -BARREL_PIVOT_HEIGHT + Math.sin(rad) * view.anim.recoil);
    }

    this.drawPreview();
    this.tanksGfx.clear();
    for (const t of this.tanks) {
      if (!isAlive(t)) continue;
      this.tanksGfx.rect(t.x - 14, t.y - 28, 28, 4).fill(0x222222);
      this.tanksGfx.rect(t.x - 14, t.y - 28, (28 * t.hp) / t.stats.maxHp, 4).fill(0x55dd66);
      if (t.id === this.turns.current && this.turns.phase === "aiming") {
        this.tanksGfx.poly([t.x - 4, t.y - 40, t.x + 4, t.y - 40, t.x, t.y - 34]).fill(0xffffff);
      }
    }

    this.fx?.render(this.particles.particles);
    this.shellGfx.clear();
    this.shellGlow.visible = !!this.shell;
    if (this.shell) {
      this.shellGlow.position.set(this.shell.pos.x, this.shell.pos.y);
      this.shellGfx.circle(this.shell.pos.x, this.shell.pos.y, 3).fill(0xfff2c0);
    }
  }

  destroy(): void {
    this.destroyed = true;
    if (this.app.renderer) this.app.destroy(true, { children: true });
  }
}
