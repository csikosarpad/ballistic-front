import { describe, expect, it } from "vitest";
import { BASE_STATS, type TankStats } from "../data/upgrades";
import {
  applyDamage,
  barrelTip,
  createTank,
  explosionDamage,
  isAlive,
  moveTank,
  regenTankShield,
  settleTank,
  tankContains,
  type Tank,
} from "../entities/tank";
import { DEFAULT_WORLD, launchVelocity, stepBody, type BallisticBody } from "../physics/ballistics";
import { createSeededRandom, type MatchSetup } from "../systems/seededRandom";
import { computeStats } from "../systems/upgrades";
import { TurnManager } from "../systems/turnManager";
import { generateHeightmap, mirrorHeightmap } from "../terrain/heightmap";
import { TerrainMask } from "../terrain/mask";
import type { RoomEvent } from "./protocol";

const WIDTH = 1280;
const HEIGHT = 720;
const FIXED_DT = 1 / 60;
const SELF_HIT_GRACE = 30;

/**
 * A Game engine determinisztikus magja Pixi nélkül: ugyanazokat a tiszta modulokat és szabályokat használja,
 * mint a Game (seedelt terep, körönkénti szél a seedelt PRNG-ből, fix időlépéses lövedék, robbanás, körváltás).
 */
class HeadlessMatch {
  readonly tanks: Tank[];
  readonly turns: TurnManager;
  private mask: TerrainMask;
  private random: () => number;
  private wind = 0;
  lastRevision = 0;

  constructor(setup: MatchSetup, stats: [TankStats, TankStats] = [BASE_STATS, BASE_STATS]) {
    this.mask = TerrainMask.fromHeightmap(mirrorHeightmap(generateHeightmap(WIDTH, HEIGHT, setup.seed)), HEIGHT);
    this.random = createSeededRandom(setup.seed);
    this.tanks = [createTank("P1", WIDTH * 0.12, 0, 45, stats[0]), createTank("P2", WIDTH * 0.88, 0, 135, stats[1])];
    for (const tank of this.tanks) settleTank(tank, this.mask);
    this.turns = new TurnManager(["P1", "P2"], setup.starterIndex);
    this.beginTurn();
  }

  private get current(): Tank {
    return this.tanks.find((tank) => tank.id === this.turns.current)!;
  }

  private beginTurn(): void {
    regenTankShield(this.current);
    this.current.moveLeft = this.current.stats.moveBudget;
    this.wind = Math.round((this.random() - 0.5) * 120);
  }

  /** A kliens saját lekérdezési kurzora: a már feldolgozott revisiont nem játssza újra. */
  receive(events: RoomEvent[]): void {
    for (const event of [...events].sort((a, b) => a.revision - b.revision)) {
      if (event.revision <= this.lastRevision) continue;
      this.lastRevision = event.revision;
      this.apply(event);
    }
  }

  private apply(event: RoomEvent): void {
    if (this.turns.phase === "gameOver" || event.playerId !== this.turns.current) return;
    if (event.type === "move") {
      const direction = event.payload.direction;
      if (direction === -1 || direction === 1) moveTank(this.current, direction, this.mask);
    } else if (event.type === "fire") {
      const { angle, power } = event.payload;
      if (typeof angle !== "number" || typeof power !== "number") return;
      this.fire(angle, power);
    }
  }

  private fire(angle: number, power: number): void {
    if (!this.turns.fire()) return;
    const shooter = this.current;
    shooter.angle = angle;
    shooter.power = power;
    let shell: BallisticBody = { pos: barrelTip(shooter), vel: launchVelocity(angle, power) };
    for (let age = 1; ; age++) {
      shell = stepBody(shell, { ...DEFAULT_WORLD, wind: this.wind }, FIXED_DT);
      const { x, y } = shell.pos;
      const hit =
        this.tanks.some((t) => isAlive(t) && (t.id !== shooter.id || age > SELF_HIT_GRACE) && tankContains(t, x, y)) ||
        this.mask.isSolid(x, y);
      if (hit) {
        this.explode(shooter, x, y);
        break;
      }
      if (x < 0 || x > this.mask.width || y > HEIGHT) {
        this.turns.endShot(this.tanks.filter(isAlive).map((t) => t.id));
        this.beginTurn();
        break;
      }
    }
  }

  private explode(shooter: Tank, x: number, y: number): void {
    const radius = shooter.stats.blastRadius;
    this.mask.carveCircle(x, y, radius);
    for (const tank of this.tanks) applyDamage(tank, explosionDamage(tank, x, y, radius, shooter.stats.damage));
    for (const tank of this.tanks) settleTank(tank, this.mask);
    this.turns.endShot(this.tanks.filter(isAlive).map((t) => t.id));
    if (this.turns.phase === "aiming") this.beginTurn();
  }

  snapshot() {
    return {
      phase: this.turns.phase,
      winner: this.turns.winner,
      current: this.turns.current,
      wind: this.wind,
      tanks: this.tanks.map(({ id, x, y, hp, shield, armor, angle, power, moveLeft }) => ({
        id,
        x,
        y,
        hp,
        shield,
        armor,
        angle,
        power,
        moveLeft,
      })),
      surface: Array.from({ length: WIDTH }, (_, x) => this.mask.surfaceY(x)),
    };
  }
}

let revision = 0;
const event = (playerId: "P1" | "P2", type: string, payload: Record<string, unknown>): RoomEvent => ({
  revision: ++revision,
  playerId,
  type,
  payload,
  createdAt: "now",
});

/** Egy játszható eseménynapló: mozgások és lövések mindkét játékostól. */
function buildLog(): RoomEvent[] {
  revision = 0;
  return [
    event("P1", "move", { direction: 1 }),
    event("P1", "move", { direction: 1 }),
    event("P1", "fire", { angle: 50, power: 380 }),
    event("P2", "move", { direction: -1 }),
    event("P2", "fire", { angle: 125, power: 420 }),
    event("P1", "fire", { angle: 40, power: 450 }),
    event("P2", "fire", { angle: 130, power: 350 }),
    event("P1", "move", { direction: -1 }),
    event("P1", "fire", { angle: 55, power: 300 }),
    event("P2", "fire", { angle: 120, power: 480 }),
  ];
}

const setup: MatchSetup = { seed: 1234, starterIndex: 0 };

describe("determinisztikus visszajátszás két kliensen", () => {
  it("azonos seed és eseménynapló mellett a két kliens állapota bitre azonos", () => {
    const log = buildLog();
    const a = new HeadlessMatch(setup);
    const b = new HeadlessMatch(setup);
    a.receive(log);
    b.receive(log);

    expect(a.snapshot()).toEqual(b.snapshot());
    // A napló valóban hatott a játékra: lett mozgás, sebzés vagy terepromlás.
    const fresh = new HeadlessMatch(setup).snapshot();
    expect(a.snapshot()).not.toEqual(fresh);
  });

  it("a szétdarabolt, duplikált és rendezetlen kézbesítés ugyanarra az állapotra vezet", () => {
    const log = buildLog();
    const whole = new HeadlessMatch(setup);
    whole.receive(log);

    const polled = new HeadlessMatch(setup);
    polled.receive(log.slice(0, 3));
    polled.receive(log.slice(1, 5));
    polled.receive([...log.slice(4, 8)].reverse());
    polled.receive(log.slice(0, 10));
    polled.receive(log);

    expect(polled.snapshot()).toEqual(whole.snapshot());
    expect(polled.lastRevision).toBe(log.length);
  });

  it("a körönkénti szél csak a seedtől függ, a kezdőjátékos pedig a setuptól", () => {
    const first = new HeadlessMatch({ seed: 99, starterIndex: 1 });
    const second = new HeadlessMatch({ seed: 99, starterIndex: 1 });
    const other = new HeadlessMatch({ seed: 100, starterIndex: 1 });
    expect(first.snapshot().current).toBe("P2");
    expect(first.snapshot().wind).toBe(second.snapshot().wind);
    expect(first.snapshot().surface).not.toEqual(other.snapshot().surface);
  });

  it("pajzzsal és páncéllal is bitre azonos a két kliens, és a védett játékos kevesebbet veszít", () => {
    const log = buildLog();
    const defended = computeStats({ shield: 3, armor: 3 });
    const a = new HeadlessMatch(setup, [BASE_STATS, defended]);
    const b = new HeadlessMatch(setup, [BASE_STATS, defended]);
    const plain = new HeadlessMatch(setup);
    a.receive(log);
    b.receive(log);
    plain.receive(log);

    expect(a.snapshot()).toEqual(b.snapshot());
    const total = (m: HeadlessMatch) => {
      const unit = m.snapshot().tanks[1]!;
      return unit.hp + unit.shield + unit.armor;
    };
    expect(total(a)).toBeGreaterThan(total(plain));
  });

  it("nem soron lévő játékos eseményét mindkét kliens ugyanúgy eldobja", () => {
    revision = 0;
    const log = [event("P2", "fire", { angle: 130, power: 400 }), event("P1", "move", { direction: 1 })];
    const a = new HeadlessMatch(setup);
    const b = new HeadlessMatch(setup);
    a.receive(log);
    b.receive(log);
    expect(a.snapshot()).toEqual(b.snapshot());
    expect(a.snapshot().current).toBe("P1");
    expect(a.snapshot().tanks[1]!.hp).toBe(BASE_STATS.maxHp);
  });
});
