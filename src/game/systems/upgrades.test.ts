import { describe, expect, it } from "vitest";
import { BASE_STATS, UPGRADES } from "../data/upgrades";
import { awardXp, buyUpgrade, computeStats, newProfile, upgradeCost } from "./upgrades";

const armor = UPGRADES.find((u) => u.id === "armor")!;

describe("upgrades", () => {
  it("fejlesztés nélkül az alapértékek érvényesek", () => {
    expect(computeStats({})).toEqual(BASE_STATS);
  });

  it("a szintek hozzáadódnak az alapértékhez", () => {
    expect(computeStats({ armor: 2 }).maxHp).toBe(BASE_STATS.maxHp + 2 * armor.perLevel);
  });

  it("a költség szintenként nő", () => {
    expect(upgradeCost(armor, 1)).toBeGreaterThan(upgradeCost(armor, 0));
  });

  it("vásárláskor levonja az XP-t és növeli a szintet", () => {
    const p = awardXp(newProfile(), 100);
    const next = buyUpgrade(p, "armor")!;
    expect(next.levels.armor).toBe(1);
    expect(next.xp).toBe(100 - upgradeCost(armor, 0));
  });

  it("kevés XP-vel nem vehető", () => {
    expect(buyUpgrade(newProfile(), "armor")).toBeNull();
  });

  it("a max szint felett és ismeretlen id-ra elutasít", () => {
    const p = { xp: 99999, levels: { armor: armor.maxLevel } };
    expect(buyUpgrade(p, "armor")).toBeNull();
    expect(buyUpgrade(p, "nincs")).toBeNull();
  });
});
