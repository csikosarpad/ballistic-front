// @vitest-environment node

import { describe, expect, it } from "vitest";
import { HudFrame } from "./HudFrame";
import { NeonPanel } from "./NeonPanel";
import { SegmentedBar } from "./SegmentedBar";

describe("Pixi UI primitive contract", () => {
  it("a HudFrame és NeonPanel a megadott méretre rajzolható és átméretezhető", () => {
    const frame = new HudFrame({ width: 320, height: 120, color: 0x24d8ff });
    expect(frame.getBounds().width).toBeGreaterThan(300);
    expect(frame.getBounds().height).toBeGreaterThan(100);

    const panel = new NeonPanel({ width: 200, height: 80, color: 0xffc52e });
    panel.resize(360, 140);
    expect(panel.frame.getBounds().width).toBeGreaterThan(340);
    expect(panel.frame.getBounds().height).toBeGreaterThan(120);
  });

  it("a SegmentedBar a ground és space theme által megadott színekkel is frissíthető", () => {
    const bar = new SegmentedBar({
      segments: 5,
      width: 250,
      height: 12,
      fillColor: 0x24d8ff,
      emptyColor: 0x07182b,
    });

    bar.setValue(3, 5);
    expect(bar.getBounds().width).toBeGreaterThan(0);
    expect(bar.getBounds().height).toBeGreaterThan(0);

    bar.setValue(5, 5);
    expect(bar.getBounds().width).toBeGreaterThan(0);
  });
});
