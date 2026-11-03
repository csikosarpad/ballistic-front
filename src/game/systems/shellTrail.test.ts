import { describe, expect, it } from "vitest";
import { ShellTrail } from "./shellTrail";

describe("ShellTrail", () => {
  it("keeps only the latest points", () => {
    const trail = new ShellTrail(3);
    for (let i = 0; i < 5; i += 1) trail.push(i, 0);
    expect(trail.length).toBe(3);
    expect(trail.segments()[0]!.from.x).toBe(2);
  });

  it("returns segments whose t grows towards the shell", () => {
    const trail = new ShellTrail(10);
    trail.push(0, 0);
    trail.push(1, 0);
    trail.push(2, 0);
    const [first, second] = trail.segments();
    expect(first!.t).toBeLessThan(second!.t);
    expect(second!.t).toBe(1);
  });

  it("has no segments with fewer than two points and can be cleared", () => {
    const trail = new ShellTrail();
    trail.push(0, 0);
    expect(trail.segments()).toEqual([]);
    trail.push(1, 1);
    trail.clear();
    expect(trail.length).toBe(0);
  });
});
