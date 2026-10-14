import { describe, expect, it } from "vitest";
import { armorFraction, MAX_ARMOR, regenShield, resolveDamage } from "./damage";

describe("resolveDamage", () => {
  it("védelem nélkül a teljes sebzés a HP-ból vonódik le", () => {
    expect(resolveDamage({ hp: 100, shield: 0, armor: 0 }, 30)).toEqual({ hp: 70, shield: 0 });
  });

  it("a pajzs előbb nyeli el a sebzést, a HP érintetlen marad", () => {
    expect(resolveDamage({ hp: 100, shield: 40, armor: 0.5 }, 30)).toEqual({ hp: 100, shield: 10 });
  });

  it("a pajzson átjutó maradékot a páncél százalékosan csökkenti", () => {
    // 50 nyers: 20 a pajzsba, 30 átjut, 20% páncél után 24.
    expect(resolveDamage({ hp: 100, shield: 20, armor: 0.2 }, 50)).toEqual({ hp: 76, shield: 0 });
  });

  it("a páncél csak a HP-t érő részt csökkenti, a pajzsot nem", () => {
    expect(resolveDamage({ hp: 100, shield: 100, armor: 0.5 }, 60).shield).toBe(40);
  });

  it("a HP nem megy nulla alá, a sebzés negatívja pedig nem gyógyít", () => {
    expect(resolveDamage({ hp: 10, shield: 0, armor: 0 }, 999).hp).toBe(0);
    expect(resolveDamage({ hp: 10, shield: 5, armor: 0 }, -20)).toEqual({ hp: 10, shield: 5 });
  });

  it("a páncél a korlátnál (MAX_ARMOR) többet nem véd", () => {
    expect(resolveDamage({ hp: 100, shield: 0, armor: 5 }, 100).hp).toBe(100 - Math.round(100 * (1 - MAX_ARMOR)));
  });

  it("nem módosítja a bemenetet", () => {
    const defense = { hp: 100, shield: 10, armor: 0.1 };
    resolveDamage(defense, 50);
    expect(defense).toEqual({ hp: 100, shield: 10, armor: 0.1 });
  });
});

describe("armorFraction", () => {
  it("a páncélt a korláthoz viszonyítja és 0–1 közt tartja", () => {
    expect(armorFraction(0)).toBe(0);
    expect(armorFraction(MAX_ARMOR / 2)).toBeCloseTo(0.5);
    expect(armorFraction(5)).toBe(1);
    expect(armorFraction(-1)).toBe(0);
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
