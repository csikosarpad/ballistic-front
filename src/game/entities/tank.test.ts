import { describe, expect, it } from "vitest";
import { TerrainMask } from "../terrain/mask";
import { applyDamage, createTank, explosionDamage, moveTank, MOVE_BUDGET, settleTank } from "./tank";

const flat = () => TerrainMask.fromHeightmap(new Float32Array(200).fill(100), 200);

describe("tank", () => {
  it("a talajra igazodik", () => {
    const t = createTank("a", 50, 0, 45);
    settleTank(t, flat());
    expect(t.y).toBe(100);
  });

  it("a mozgás fogyasztja a keretet, és a keret végén megáll", () => {
    const mask = flat();
    const t = createTank("a", 50, 0, 45);
    settleTank(t, mask);
    let steps = 0;
    while (moveTank(t, 1, mask)) steps++;
    expect(steps * 2).toBe(MOVE_BUDGET);
    expect(t.moveLeft).toBe(0);
  });

  it("a meredek fal megállítja", () => {
    const hm = new Float32Array(200).fill(100);
    for (let x = 60; x < 200; x++) hm[x] = 50;
    const mask = TerrainMask.fromHeightmap(hm, 200);
    const t = createTank("a", 55, 0, 45);
    settleTank(t, mask);
    expect(moveTank(t, 1, mask)).toBe(true);
    t.x = 59;
    expect(moveTank(t, 1, mask)).toBe(false);
  });

  it("a sebzés a távolsággal csökken, és a hp nem megy 0 alá", () => {
    const t = createTank("a", 50, 0, 45);
    settleTank(t, flat());
    const near = explosionDamage(t, 50, 94, 30);
    const far = explosionDamage(t, 150, 94, 30);
    expect(near).toBeGreaterThan(far);
    expect(far).toBe(0);
    applyDamage(t, 999);
    expect(t.hp).toBe(0);
  });
});
