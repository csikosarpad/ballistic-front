import { describe, expect, it } from "vitest";
import { HoldGate } from "./holdGate";

describe("HoldGate", () => {
  it("jelzés előtt inaktív", () => {
    expect(new HoldGate(250).isActive(1000)).toBe(false);
  });

  it("a jelzés után a megadott ideig aktív, utána lejár", () => {
    const g = new HoldGate(250);
    g.touch(1000);
    expect(g.isActive(1200)).toBe(true);
    expect(g.isActive(1250)).toBe(false);
  });

  it("az ismételt jelzés meghosszabbítja", () => {
    const g = new HoldGate(250);
    g.touch(1000);
    g.touch(1200);
    expect(g.isActive(1400)).toBe(true);
  });
});
