// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { CampaignStarfield } from "./CampaignStarfield";

describe("CampaignStarfield", () => {
  it("accelerates for exactly 1.5 seconds and restarts the interval on another click", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.75);
    const normal = new CampaignStarfield();
    const warp = new CampaignStarfield();
    random.mockRestore();
    normal.resize(600, 400);
    warp.resize(600, 400);
    warp.triggerWarp(100);
    normal.update(1 / 30, 1599);
    warp.update(1 / 30, 1599);
    expect(warp.children[0]?.x).toBeGreaterThan(normal.children[0]?.x ?? 0);

    // At the deadline the same frame step must match normal drift.
    const compareStep = (now: number) => {
      const before = warp.children.map((star) => ({ x: star.x, y: star.y }));
      warp.update(1 / 30, now);
      return warp.children.map((star, i) => ({
        dx: star.x - (before[i]?.x ?? 0),
        dy: star.y - (before[i]?.y ?? 0),
      }));
    };
    const baseline = compareStep(1600);
    warp.triggerWarp(1700);
    warp.triggerWarp(1800);
    const restarted = compareStep(3299);
    expect(restarted[0]?.dx).toBeGreaterThan((baseline[0]?.dx ?? 0) * 10);
    const expired = compareStep(3300);
    expect(expired[0]?.dx).toBeLessThan((restarted[0]?.dx ?? 0) / 10);
    warp.triggerWarp(3500);
    warp.stopWarp();
    const stopped = compareStep(3501);
    expect(stopped[0]?.dx).toBeLessThan((restarted[0]?.dx ?? 0) / 10);
    normal.destroy({ children: true });
    warp.destroy({ children: true });
  });

  it("keeps a bounded star count and supports a static frame", () => {
    const field = new CampaignStarfield();
    field.resize(600, 400);
    expect(field.children).toHaveLength(160);
    const positions = field.children.map((star) => ({ x: star.x, y: star.y }));
    field.update(0);
    expect(field.children.map((star) => ({ x: star.x, y: star.y }))).toEqual(positions);
    field.destroy({ children: true });
  });

  it("moves stars gradually, resizes proportionally and stays finite after recycling", () => {
    const field = new CampaignStarfield();
    field.resize(600, 400);
    const positions = field.children.map((star) => ({ star, x: star.x, y: star.y }));
    field.update(1 / 30);
    expect(positions.some(({ star, x, y }) => star.x !== x || star.y !== y)).toBe(true);
    const beforeResize = field.children.map((star) => ({ star, x: star.x, y: star.y }));
    field.resize(300, 200);
    beforeResize.forEach(({ star, x, y }) => {
      expect(star.x).toBeCloseTo(x / 2);
      expect(star.y).toBeCloseTo(y / 2);
    });
    for (let i = 0; i < 2000; i += 1) field.update(0.1);
    for (const star of field.children) {
      expect(Number.isFinite(star.x) && Number.isFinite(star.y)).toBe(true);
      expect(star.alpha).toBeGreaterThanOrEqual(0.18);
      expect(star.alpha).toBeLessThanOrEqual(0.58);
    }
    expect(field.children).toHaveLength(160);
    field.destroy({ children: true });
  });
});
