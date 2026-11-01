import { describe, expect, it } from "vitest";
import { PreviewAllowance } from "./previewAllowance";

describe("PreviewAllowance", () => {
  it("játékosonként a kiosztott töltetszámig használható", () => {
    const p = new PreviewAllowance();
    p.reset({ a: 2, b: 1 });
    expect(p.use("a")).toBe(true);
    expect(p.remainingFor("a")).toBe(1);
    expect(p.use("a")).toBe(true);
    expect(p.use("a")).toBe(false);
    expect(p.canUse("a")).toBe(false);
    expect(p.canUse("b")).toBe(true);
  });

  it("a reset új meccsre visszaadja a lehetőséget", () => {
    const p = new PreviewAllowance();
    p.reset({ a: 2 });
    p.use("a");
    p.reset();
    expect(p.canUse("a")).toBe(false);
    p.reset({ a: 2 });
    expect(p.remainingFor("a")).toBe(2);
  });
});
