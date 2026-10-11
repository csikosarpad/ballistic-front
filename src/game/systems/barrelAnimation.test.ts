import { describe, expect, it } from "vitest";
import { kick, RECOIL_KICK, stepBarrel } from "./barrelAnimation";

describe("barrelAnimation", () => {
  it("a szög a célhoz közelít, de nem ugrik át rajta", () => {
    let s = { angle: 0, recoil: 0 };
    for (let i = 0; i < 10; i++) {
      s = stepBarrel(s, 90, 1 / 60);
      expect(s.angle).toBeLessThanOrEqual(90);
    }
    expect(s.angle).toBeGreaterThan(0);
    expect(s.angle).toBeLessThan(90);
  });

  it("elég idő után pontosan a célszögre áll", () => {
    let s = { angle: 0, recoil: 0 };
    for (let i = 0; i < 600; i++) s = stepBarrel(s, 45, 1 / 60);
    expect(s.angle).toBe(45);
  });

  it("a mozgás független a képkocka-felosztástól", () => {
    const a = stepBarrel(stepBarrel({ angle: 0, recoil: 0 }, 90, 1 / 120), 90, 1 / 120);
    const b = stepBarrel({ angle: 0, recoil: 0 }, 90, 1 / 60);
    expect(a.angle).toBeCloseTo(b.angle, 5);
  });

  it("a kick visszarúgást ad, ami lecseng", () => {
    let s = kick(60);
    expect(s).toEqual({ angle: 60, recoil: RECOIL_KICK });
    for (let i = 0; i < 300; i++) s = stepBarrel(s, 60, 1 / 60);
    expect(s.recoil).toBe(0);
  });
});
