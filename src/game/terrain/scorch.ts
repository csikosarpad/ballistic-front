import type { TerrainMask } from "./mask";

export interface ScorchDot {
  x: number;
  y: number;
  radius: number;
  alpha: number;
}

const DOT_RADIUS = 2.5;

/** Csak akkor ér rá a pötty, ha a pereme sem lóg ki a levegőbe. */
function fitsInSolid(mask: TerrainMask, x: number, y: number): boolean {
  const m = DOT_RADIUS;
  return (
    mask.isSolid(x, y) &&
    mask.isSolid(x + m, y) &&
    mask.isSolid(x - m, y) &&
    mask.isSolid(x, y + m) &&
    mask.isSolid(x, y - m)
  );
}

/**
 * A kráter pereme körüli égésnyom pöttyei. A robbanás előtti maszkkal kell hívni:
 * a kráter belsejébe lógó részt a kivájás úgyis törli, így a perem közvetlenül sötét lesz.
 */
export function scorchDots(
  mask: TerrainMask,
  cx: number,
  cy: number,
  radius: number,
  rng: () => number = Math.random,
): ScorchDot[] {
  const width = Math.max(6, radius * 0.4);
  const steps = Math.ceil((2 * Math.PI * radius) / DOT_RADIUS);
  const dots: ScorchDot[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    for (let d = 0; d <= width; d += 2) {
      const dist = radius + d + rng() * 1.5;
      const x = cx + cos * dist;
      const y = cy + sin * dist;
      if (!fitsInSolid(mask, x, y)) continue;
      const fade = 1 - d / width;
      dots.push({ x, y, radius: DOT_RADIUS, alpha: 0.5 * fade * fade * (0.6 + 0.4 * rng()) });
    }
  }
  return dots;
}
