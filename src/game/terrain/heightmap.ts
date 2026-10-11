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
