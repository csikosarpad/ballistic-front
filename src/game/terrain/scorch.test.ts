import { describe, expect, it } from "vitest";
import { TerrainMask } from "./mask";
import { scorchDots } from "./scorch";

const flat = () => TerrainMask.fromHeightmap(new Float32Array(200).fill(50), 200);

describe("scorchDots", () => {
  it("csak a talajban és a kráter peremén kívül ad pöttyöket", () => {
    const mask = flat();
    const dots = scorchDots(mask, 100, 50, 20, () => 0.5);
    expect(dots.length).toBeGreaterThan(0);
    for (const d of dots) {
      expect(mask.isSolid(d.x, d.y)).toBe(true);
      expect(Math.hypot(d.x - 100, d.y - 50)).toBeGreaterThanOrEqual(20);
    }
  });

  it("a levegőbe nem lóg ki (a felszín felett nincs pötty)", () => {
    const dots = scorchDots(flat(), 100, 50, 20, () => 0.5);
    expect(Math.min(...dots.map((d) => d.y))).toBeGreaterThanOrEqual(50 + 2);
  });

  it("a perem felé sötétebb, kifelé halványodik", () => {
    const dots = scorchDots(flat(), 100, 50, 20, () => 0.5);
    const near = dots.filter((d) => Math.hypot(d.x - 100, d.y - 50) < 21.5);
    const far = dots.filter((d) => Math.hypot(d.x - 100, d.y - 50) > 26);
    const avg = (xs: typeof dots) => xs.reduce((s, d) => s + d.alpha, 0) / xs.length;
    expect(avg(near)).toBeGreaterThan(avg(far));
  });

  it("a levegőben robbanva nem éget semmit", () => {
    expect(scorchDots(flat(), 100, -100, 20, () => 0.5)).toHaveLength(0);
  });
});
