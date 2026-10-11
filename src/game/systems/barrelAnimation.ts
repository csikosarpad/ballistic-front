export interface BarrelState {
  /** A megjelenített szög (fok); a célszög felé közelít. */
  angle: number;
  /** Visszarúgás: ennyi px-et csúszott vissza a cső (px). */
  recoil: number;
}

const ANGLE_SMOOTHING = 18;
const RECOIL_DECAY = 9;
export const RECOIL_KICK = 6;

/** Exponenciális simítás: képkockasebességtől független mozgás. */
export function stepBarrel(state: BarrelState, targetAngle: number, dt: number): BarrelState {
  const k = 1 - Math.exp(-ANGLE_SMOOTHING * dt);
  const angle = Math.abs(targetAngle - state.angle) < 0.01 ? targetAngle : state.angle + (targetAngle - state.angle) * k;
  const recoil = state.recoil < 0.01 ? 0 : state.recoil * Math.exp(-RECOIL_DECAY * dt);
  return { angle, recoil };
}

/** Lövéskor a cső a célszögre áll, és visszarúg. */
export function kick(targetAngle: number): BarrelState {
  return { angle: targetAngle, recoil: RECOIL_KICK };
}
