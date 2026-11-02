import { MAX_ANGLE, MIN_ANGLE, MIN_POWER } from "../state/gameStore";

/** Ennyi erő jut egy világpixelnyi húzásra: 300 px húzás = 600 erő. */
export const DRAG_POWER_PER_PX = 2;

interface Point {
  x: number;
  y: number;
}

/** A húzás vektorából (cső forgáspontja → ujj) szöget és erőt számol; a 0° jobbra, a 180° balra mutat. */
export function dragToAim(pivot: Point, pointer: Point, maxPower: number): { angle: number; power: number } {
  const dx = pointer.x - pivot.x;
  const dy = pivot.y - pointer.y;
  const raw = (Math.atan2(dy, dx) * 180) / Math.PI;
  // A talaj alá húzott ujj a közelebbi vízszintes végállást adja.
  const angle = dy < 0 ? (dx >= 0 ? MIN_ANGLE : MAX_ANGLE) : Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, Math.round(raw)));
  const power = Math.min(maxPower, Math.max(MIN_POWER, Math.round(Math.hypot(dx, dy) * DRAG_POWER_PER_PX)));
  return { angle, power };
}
