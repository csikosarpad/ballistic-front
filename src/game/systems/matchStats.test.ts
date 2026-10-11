import { describe, expect, it } from "vitest";
import { newMatchStats, recordDamage, recordShot, recordXp } from "./matchStats";

describe("matchStats", () => {
  it("nulláról indul minden játékosnál", () => {
    expect(newMatchStats(["a", "b"])).toEqual({
      a: { shots: 0, damage: 0, xp: 0 },
      b: { shots: 0, damage: 0, xp: 0 },
    });
  });

  it("a rögzítés új objektumot ad, az eredetit nem módosítja", () => {
    const s0 = newMatchStats(["a"]);
    const s1 = recordXp(recordDamage(recordShot(s0, "a"), "a", 30), "a", 30);
    expect(s1.a).toEqual({ shots: 1, damage: 30, xp: 30 });
    expect(s0.a!.shots).toBe(0);
  });

  it("ismeretlen játékost figyelmen kívül hagy", () => {
    const s = newMatchStats(["a"]);
    expect(recordShot(s, "x")).toBe(s);
  });
});
