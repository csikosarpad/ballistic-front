import { describe, expect, it } from "vitest";
import { dragToAim } from "./dragAim";

const pivot = { x: 100, y: 100 };

describe("dragToAim", () => {
  it("jobbra húzva 0°, balra húzva 180°, felfelé 90°", () => {
    expect(dragToAim(pivot, { x: 200, y: 100 }, 600).angle).toBe(0);
    expect(dragToAim(pivot, { x: 0, y: 100 }, 600).angle).toBe(180);
    expect(dragToAim(pivot, { x: 100, y: 0 }, 600).angle).toBe(90);
  });

  it("átlósan jobbra-felfelé 45°", () => {
    expect(dragToAim(pivot, { x: 150, y: 50 }, 600).angle).toBe(45);
  });

  it("a talaj alá húzott ujj a közelebbi vízszintes végállást adja", () => {
    expect(dragToAim(pivot, { x: 150, y: 150 }, 600).angle).toBe(0);
    expect(dragToAim(pivot, { x: 50, y: 150 }, 600).angle).toBe(180);
  });

  it("az erő a húzás hosszával nő, és a tartományban marad", () => {
    expect(dragToAim(pivot, { x: 100, y: -50 }, 600).power).toBe(300);
    expect(dragToAim(pivot, { x: 100, y: 99 }, 600).power).toBe(100);
    expect(dragToAim(pivot, { x: 100, y: -1000 }, 500).power).toBe(500);
  });
});
