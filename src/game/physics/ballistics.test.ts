import { describe, expect, it } from "vitest";
import { dashPolyline, launchVelocity, predictTrajectory, stepBody } from "./ballistics";

describe("ballistics", () => {
  it("launchVelocity: 90 fok felfelé mutat", () => {
    const v = launchVelocity(90, 100);
    expect(v.x).toBeCloseTo(0);
    expect(v.y).toBeCloseTo(-100);
  });

  it("a gravitáció lefelé gyorsít", () => {
    const next = stepBody({ pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 } }, { gravity: 600, wind: 0 }, 0.1);
    expect(next.vel.y).toBeCloseTo(60);
  });

  it("a szél oldalirányba gyorsít", () => {
    const next = stepBody({ pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 } }, { gravity: 0, wind: 100 }, 0.1);
    expect(next.vel.x).toBeCloseTo(10);
  });

  describe("dashPolyline", () => {
    it("egyenes vonalat a megadott ritmusban szaggat", () => {
      const dashes = dashPolyline(
        [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
        ],
        4,
        4,
      );
      expect(dashes).toHaveLength(13);
      expect(dashes[0]).toEqual([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
      ]);
      expect(dashes.at(-1)![1].x).toBeCloseTo(100);
    });

    it("a csomópontokon átvezeti a ritmust", () => {
      const dashes = dashPolyline(
        [
          { x: 0, y: 0 },
          { x: 6, y: 0 },
          { x: 12, y: 0 },
        ],
        4,
        4,
      );
      expect(dashes.map(([a, b]) => [a.x, b.x])).toEqual([
        [0, 4],
        [8, 12],
      ]);
    });

    it("üres bemenetre üreset ad", () => {
      expect(dashPolyline([], 2, 2)).toEqual([]);
    });
  });

  describe("predictTrajectory", () => {
    const opts = {
      dt: 1 / 240,
      maxSteps: 5000,
      width: 1000,
      height: 1000,
      isBlocked: (_x: number, y: number) => y >= 0,
    };

    it("45 fokon a távolság P²/g (üresjárati képlet)", () => {
      const pts = predictTrajectory({ x: 0, y: -0.001 }, 45, 300, { gravity: 600, wind: 0 }, opts);
      expect(pts.at(-1)!.x).toBeCloseTo(150, -1);
    });

    it("a talajnak ütközve megáll, a pályán kívül is", () => {
      const free = { ...opts, isBlocked: () => false };
      const pts = predictTrajectory({ x: 500, y: 0 }, 0, 800, { gravity: 0, wind: 0 }, free);
      expect(pts.at(-1)!.x).toBeGreaterThan(1000);
      expect(pts.length).toBeLessThan(5000);
    });

    it("a szél eltéri a pályát", () => {
      const calm = predictTrajectory({ x: 0, y: -0.001 }, 45, 300, { gravity: 600, wind: 0 }, opts);
      const windy = predictTrajectory({ x: 0, y: -0.001 }, 45, 300, { gravity: 600, wind: 100 }, opts);
      expect(windy.at(-1)!.x).toBeGreaterThan(calm.at(-1)!.x);
    });
  });
});
