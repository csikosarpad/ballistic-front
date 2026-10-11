import { describe, expect, it } from "vitest";
import { generateHeightmap, mirrorHeightmap } from "./heightmap";
import { TerrainMask } from "./mask";

describe("heightmap", () => {
  it("determinisztikus ugyanazzal a seeddel", () => {
    expect(generateHeightmap(100, 400, 7)).toEqual(generateHeightmap(100, 400, 7));
  });

  it("a tükrözött térkép két oldala azonos", () => {
    const m = mirrorHeightmap(generateHeightmap(101, 400, 3));
    for (let x = 0; x < m.length; x++) expect(m[x]).toBe(m[m.length - 1 - x]);
  });
});

describe("TerrainMask", () => {
  const make = () => TerrainMask.fromHeightmap(new Float32Array(100).fill(50), 100);

  it("a felszín alatt szilárd, felette nem", () => {
    const m = make();
    expect(m.isSolid(10, 60)).toBe(true);
    expect(m.isSolid(10, 40)).toBe(false);
    expect(m.surfaceY(10)).toBe(50);
  });

  it("a kráter lyukat váj, és a felszín mélyebbre kerül", () => {
    const m = make();
    m.carveCircle(50, 50, 10);
    expect(m.isSolid(50, 55)).toBe(false);
    expect(m.surfaceY(50)).toBe(61);
    expect(m.isSolid(80, 55)).toBe(true);
  });

  it("a pályán kívül nem szilárd", () => {
    expect(make().isSolid(-1, 60)).toBe(false);
  });
});
