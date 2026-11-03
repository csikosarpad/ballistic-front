import { describe, expect, it } from "vitest";
import { bloomSettings, DESKTOP_BLOOM, MOBILE_BLOOM } from "./bloomQuality";

describe("bloomSettings", () => {
  it("uses the lighter bloom on touch devices", () => {
    expect(bloomSettings(true)).toBe(MOBILE_BLOOM);
    expect(bloomSettings(false)).toBe(DESKTOP_BLOOM);
    expect(MOBILE_BLOOM.strength).toBeLessThan(DESKTOP_BLOOM.strength);
    expect(MOBILE_BLOOM.blur).toBeLessThan(DESKTOP_BLOOM.blur);
  });
});
