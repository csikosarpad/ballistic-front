import { describe, expect, it } from "vitest";
import { PreviewAllowance } from "./previewAllowance";

describe("PreviewAllowance", () => {
  it("játékosonként csak egyszer használható", () => {
    const p = new PreviewAllowance();
    expect(p.use("a")).toBe(true);
    expect(p.use("a")).toBe(false);
    expect(p.canUse("a")).toBe(false);
    expect(p.canUse("b")).toBe(true);
  });

  it("a reset új meccsre visszaadja a lehetőséget", () => {
    const p = new PreviewAllowance();
    p.use("a");
    p.reset();
    expect(p.canUse("a")).toBe(true);
  });
});
