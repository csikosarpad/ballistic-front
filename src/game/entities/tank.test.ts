import { describe, expect, it } from "vitest";
import { computeStats } from "../systems/upgrades";
import { TerrainMask } from "../terrain/mask";
import { applyDamage, createTank, explosionDamage, moveTank, MOVE_BUDGET, regenTankShield, settleTank } from "./tank";

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

  it("a sebzést előbb a pajzs, majd a páncél nyeli el, a HP csak utána sérül", () => {
    const t = createTank("a", 50, 0, 45, computeStats({ shield: 1, armor: 1 }));
    expect(t).toMatchObject({ shield: 20, armor: 20, hp: 100 });
    applyDamage(t, 10);
    expect(t).toMatchObject({ shield: 10, armor: 20, hp: 100 });
    applyDamage(t, 25);
    expect(t).toMatchObject({ shield: 0, armor: 5, hp: 100 });
    applyDamage(t, 15);
    expect(t).toMatchObject({ shield: 0, armor: 0, hp: 90 });
  });

  it("a páncél nem töltődik vissza, a pajzs igen", () => {
    const t = createTank("a", 50, 0, 45, computeStats({ shield: 1, armor: 1 }));
    applyDamage(t, 40);
    expect(t).toMatchObject({ shield: 0, armor: 0 });
    regenTankShield(t);
    expect(t).toMatchObject({ shield: 4, armor: 0 });
  });

  it("a pajzs körönként a maximum 20%-ával töltődik vissza", () => {
    const t = createTank("a", 50, 0, 45, computeStats({ shield: 5 }));
    applyDamage(t, 100);
    expect(t.shield).toBe(0);
    regenTankShield(t);
    expect(t.shield).toBe(20);
    regenTankShield(t);
    expect(t.shield).toBe(40);
  });

  it("pajzs nélküli tanknál a visszatöltés nem csinál semmit", () => {
    const t = createTank("a", 50, 0, 45);
    regenTankShield(t);
    expect(t.shield).toBe(0);
  });
});
