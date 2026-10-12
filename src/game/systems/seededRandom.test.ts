import { describe, expect, it } from "vitest";
import { createSeededRandom } from "./seededRandom";

describe("createSeededRandom", () => {
  it("azonos seedből azonos sorozatot ad", () => {
    const first = createSeededRandom(12345);
    const second = createSeededRandom(12345);

    expect(Array.from({ length: 10 }, first)).toEqual(Array.from({ length: 10 }, second));
  });

  it("0 és 1 közötti értékeket ad", () => {
    const random = createSeededRandom(9876);

    for (let index = 0; index < 100; index++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});