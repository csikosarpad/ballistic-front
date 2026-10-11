export interface Vec2 {
  x: number;
  y: number;
}

export interface BallisticBody {
  pos: Vec2;
  vel: Vec2;
}

export interface World {
  /** Gravitációs gyorsulás px/s² (lefelé pozitív, a képernyő y-tengelye szerint). */
  gravity: number;
  /** Vízszintes szélgyorsulás px/s² (jobbra pozitív). */
  wind: number;
}

export const DEFAULT_WORLD: World = { gravity: 600, wind: 0 };

/** Kezdősebesség szögből (fok, 0 = jobbra, 90 = felfelé) és erőből. */
export function launchVelocity(angleDeg: number, power: number): Vec2 {
  const a = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(a) * power, y: -Math.sin(a) * power };
}

/**
 * Szemi-implicit Euler lépés. Fix dt mellett determinisztikus,
 * ami multiplayerhez (szerver-újraszámolás) is kell.
 */
export function stepBody(body: BallisticBody, world: World, dt: number): BallisticBody {
  const vx = body.vel.x + world.wind * dt;
  const vy = body.vel.y + world.gravity * dt;
  return {
    vel: { x: vx, y: vy },
    pos: { x: body.pos.x + vx * dt, y: body.pos.y + vy * dt },
  };
}

export interface TrajectoryOptions {
  /** Ugyanazzal a lépésközzel számol, mint a játék, így az előnézet egyezik a tényleges pályával. */
  dt: number;
  maxSteps: number;
  width: number;
  height: number;
  isBlocked: (x: number, y: number) => boolean;
}

/** A lövedék várható útja az első ütközésig vagy a pálya elhagyásáig. */
export function predictTrajectory(
  start: Vec2,
  angleDeg: number,
  power: number,
  world: World,
  { dt, maxSteps, width, height, isBlocked }: TrajectoryOptions,
): Vec2[] {
  let body: BallisticBody = { pos: start, vel: launchVelocity(angleDeg, power) };
  const points: Vec2[] = [start];
  for (let i = 0; i < maxSteps; i++) {
    body = stepBody(body, world, dt);
    points.push(body.pos);
    const { x, y } = body.pos;
    if (isBlocked(x, y) || x < 0 || x > width || y > height) break;
  }
  return points;
}

/** A törtvonalat `dash` hosszú rajzolt és `gap` hosszú kihagyott szakaszokra bontja (ívhossz szerint). */
export function dashPolyline(points: Vec2[], dash: number, gap: number): [Vec2, Vec2][] {
  const out: [Vec2, Vec2][] = [];
  const first = points[0];
  if (!first) return out;
  let pos: Vec2 = first;
  let drawing = true;
  let left = dash;
  let start: Vec2 = pos;
  for (let i = 1; i < points.length; i++) {
    const next = points[i]!;
    let segLen = Math.hypot(next.x - pos.x, next.y - pos.y);
    while (segLen > left) {
      const t = left / segLen;
      const p = { x: pos.x + (next.x - pos.x) * t, y: pos.y + (next.y - pos.y) * t };
      if (drawing) out.push([start, p]);
      drawing = !drawing;
      start = p;
      segLen -= left;
      left = drawing ? dash : gap;
      pos = p;
    }
    left -= segLen;
    pos = next;
  }
  if (drawing && (start.x !== pos.x || start.y !== pos.y)) out.push([start, pos]);
  return out;
}
