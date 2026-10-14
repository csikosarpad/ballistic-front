import { BASE_STATS, type TankStats } from "../data/upgrades";
import type { Vec2 } from "../physics/ballistics";
import type { TerrainMask } from "../terrain/mask";

export const MOVE_BUDGET = BASE_STATS.moveBudget;
const MOVE_STEP = 2;
const MAX_CLIMB = 4;
const BARREL_LENGTH = 16;
const BARREL_PIVOT_HEIGHT = 10;

export interface Tank {
  id: string;
  x: number;
  /** A talajszint (a tank alja). */
  y: number;
  hp: number;
  angle: number;
  power: number;
  /** Az adott körben még megtehető távolság (px). */
  moveLeft: number;
  color: number;
  stats: TankStats;
}

export function createTank(id: string, x: number, color: number, angle: number, stats: TankStats = BASE_STATS): Tank {
  return {
    id,
    x,
    y: 0,
    hp: stats.maxHp,
    angle,
    power: Math.min(400, stats.maxPower),
    moveLeft: stats.moveBudget,
    color,
    stats,
  };
}

export const isAlive = (t: Tank) => t.hp > 0;

/** A tankot a talajra igazítja (indításkor és rombolás után). */
export function settleTank(tank: Tank, mask: TerrainMask): void {
  tank.y = mask.surfaceY(tank.x);
}

/** Egy lépés a mozgáskeret terhére; fal vagy pályaszél megállítja. Igaz, ha mozdult. */
export function moveTank(tank: Tank, dir: -1 | 1, mask: TerrainMask): boolean {
  if (tank.moveLeft < MOVE_STEP) return false;
  const nx = tank.x + dir * MOVE_STEP;
  if (nx < 8 || nx > mask.width - 8) return false;
  const ny = mask.surfaceY(nx);
  if (tank.y - ny > MAX_CLIMB) return false;
  tank.x = nx;
  tank.y = ny;
  tank.moveLeft -= MOVE_STEP;
  return true;
}

export function barrelTip(tank: Tank): Vec2 {
  const a = (tank.angle * Math.PI) / 180;
  return {
    x: tank.x + Math.cos(a) * BARREL_LENGTH,
    y: tank.y - BARREL_PIVOT_HEIGHT - Math.sin(a) * BARREL_LENGTH,
  };
}

/** Közvetlen találat vizsgálata a tank testén. */
export function tankContains(tank: Tank, x: number, y: number): boolean {
  return Math.abs(x - tank.x) <= 12 && y >= tank.y - 12 && y <= tank.y;
}

/** Lineárisan csökkenő sebzés a robbanás közepétől 2*radius távolságig. */
export function explosionDamage(tank: Tank, ex: number, ey: number, radius: number, multiplier = 1): number {
  const d = Math.hypot(tank.x - ex, tank.y - 6 - ey);
  return Math.max(0, Math.round(60 * multiplier * (1 - d / (radius * 2))));
}

export function applyDamage(tank: Tank, dmg: number): void {
  tank.hp = Math.max(0, tank.hp - dmg);
}
