import { describe, expect, it } from "vitest";
import { regenShield, resolveDamage } from "./damage";

describe("resolveDamage", () => {
  it("védelem nélkül a teljes sebzés a HP-ból vonódik le", () => {
    expect(resolveDamage({ hp: 100, shield: 0, armor: 0 }, 30)).toEqual({ hp: 70, shield: 0, armor: 0 });
  });

  it("a pajzs előbb nyeli el a sebzést, a páncél és a HP érintetlen marad", () => {
    expect(resolveDamage({ hp: 100, shield: 40, armor: 30 }, 30)).toEqual({ hp: 100, shield: 10, armor: 30 });
  });

  it("a pajzson átjutó sebzést a páncélpontok nyelik el", () => {
    expect(resolveDamage({ hp: 100, shield: 20, armor: 30 }, 40)).toEqual({ hp: 100, shield: 0, armor: 10 });
  });

  it("a pajzs és a páncél után a HP sérül", () => {
    // 50 nyers: 20 pajzs, 15 páncél, 15 a HP-ból.
    expect(resolveDamage({ hp: 100, shield: 20, armor: 15 }, 50)).toEqual({ hp: 85, shield: 0, armor: 0 });
  });

  it("páncél pajzs nélkül is kopik", () => {
    expect(resolveDamage({ hp: 100, shield: 0, armor: 25 }, 10)).toEqual({ hp: 100, shield: 0, armor: 15 });
  });

  it("a HP nem megy nulla alá, a negatív sebzés pedig nem gyógyít", () => {
    expect(resolveDamage({ hp: 10, shield: 0, armor: 0 }, 999).hp).toBe(0);
    expect(resolveDamage({ hp: 10, shield: 5, armor: 5 }, -20)).toEqual({ hp: 10, shield: 5, armor: 5 });
  });

  it("nem módosítja a bemenetet", () => {
    const defense = { hp: 100, shield: 10, armor: 10 };
    resolveDamage(defense, 50);
    expect(defense).toEqual({ hp: 100, shield: 10, armor: 10 });
  });
});

describe("regenShield", () => {
  it("a maximum megadott részét tölti vissza", () => {
    expect(regenShield(0, 100, 0.2)).toBe(20);
    expect(regenShield(20, 100, 0.2)).toBe(40);
  });

  it("nem lépi túl a maximumot", () => {
    expect(regenShield(95, 100, 0.2)).toBe(100);
  });

  it("pajzs nélküli egységnél nulla marad", () => {
    expect(regenShield(0, 0, 0.2)).toBe(0);
  });
});
