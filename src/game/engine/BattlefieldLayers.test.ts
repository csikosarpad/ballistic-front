// @vitest-environment node

import { describe, expect, it } from "vitest";
import { BattlefieldLayers } from "./BattlefieldLayers";

describe("BattlefieldLayers", () => {
  it("hat külön háttérréteget rajzol és ugyanazzal a seeddel stabil marad", () => {
    const first = new BattlefieldLayers();
    const second = new BattlefieldLayers();

    first.draw(1280, 720, 42);
    second.draw(1280, 720, 42);

    expect(first.children).toHaveLength(10);
    expect(second.children).toHaveLength(10);
    expect(first.getBounds().width).toBe(second.getBounds().width);
    expect(first.getBounds().height).toBe(second.getBounds().height);
  });
});
