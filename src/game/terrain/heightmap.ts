import type { TerrainProfile } from "../data/sectors";

/** Determinisztikus 1D value-noise alapú magasságtérkép (seedelhető, szerveren is reprodukálható). */
function hash(n: number, seed: number): number {
  const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const smooth = (t: number) => t * t * (3 - 2 * t);

function noise1D(x: number, seed: number): number {
  const i = Math.floor(x);
  const f = x - i;
  return hash(i, seed) * (1 - smooth(f)) + hash(i + 1, seed) * smooth(f);
}

/** Visszaadja oszloponként a talaj felszínének y koordinátáját (px, fentről mérve). */
export function generateHeightmap(width: number, height: number, seed = 1): Float32Array {
  const map = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    let n = 0;
    let amp = 1;
    let freq = 1 / 160;
    let norm = 0;
    for (let o = 0; o < 4; o++) {
      n += noise1D(x * freq, seed + o) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    map[x] = height * (0.45 + 0.35 * (n / norm));
  }
  return map;
}

/** A bal felét tükrözi a jobb oldalra, hogy a két játékos azonos terepviszonyokat kapjon. */
export function mirrorHeightmap(map: Float32Array): Float32Array {
  const last = map.length - 1;
  return Float32Array.from(map, (_, x) => map[Math.min(x, last - x)]!);
}

export function generateSectorHeightmap(
  width: number,
  height: number,
  seed: number,
  profile: TerrainProfile | null,
): Float32Array {
  if (!profile) return mirrorHeightmap(generateHeightmap(width, height, seed));
  const { points, amplitude } = profile;
  if (
    points.length < 2 ||
    points[0]?.[0] !== 0 ||
    points.at(-1)?.[0] !== 0.5 ||
    !Number.isFinite(amplitude) ||
    amplitude < 0 ||
    points.some(
      ([x, y], i) =>
        !Number.isFinite(x) || !Number.isFinite(y) || y < 0.46 || y > 0.8 || (i > 0 && x <= points[i - 1]![0]),
    )
  )
    throw new Error("Invalid terrain profile");
  const map = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    const u = Math.min(x, width - 1 - x) / (width - 1);
    const end = points.findIndex(([position]) => position >= u);
    const [x1, y1] = points[Math.max(1, end)]!;
    const [x0, y0] = points[Math.max(1, end) - 1]!;
    const base = y0 + (y1 - y0) * smooth((u - x0) / (x1 - x0));
    const sampleX = Math.min(x, width - 1 - x);
    const noise = (noise1D(sampleX / 160, seed) + 0.5 * noise1D(sampleX / 80, seed + 1)) / 1.5;
    map[x] = height * (base + amplitude * (noise * 2 - 1));
  }
  return map;
}
