import { describe, expect, it } from "vitest";
import { ScreenShake, SHAKE_DURATION, SHAKE_MAX_PX } from "./screenShake";

describe("ScreenShake", () => {
  it("is idle until triggered", () => {
    const shake = new ScreenShake();
    expect(shake.active).toBe(false);
    expect(shake.offset(() => 1)).toEqual({ x: 0, y: 0 });
  });

  it("stays within the amplitude and decays to zero", () => {
    const shake = new ScreenShake();
    shake.trigger(1);
    expect(shake.offset(() => 1).x).toBeCloseTo(SHAKE_MAX_PX);
    shake.update(SHAKE_DURATION / 2);
    expect(shake.offset(() => 1).x).toBeCloseTo(SHAKE_MAX_PX / 2);
    shake.update(SHAKE_DURATION);
    expect(shake.active).toBe(false);
    expect(shake.offset(() => 1)).toEqual({ x: 0, y: 0 });
  });

  it("does not let a weaker hit cut a stronger shake short", () => {
    const shake = new ScreenShake();
    shake.trigger(1);
    shake.trigger(0.2);
    expect(shake.offset(() => 1).x).toBeCloseTo(SHAKE_MAX_PX);
  });
});
