import { describe, expect, it } from "vitest";
import { SECTORS, TRAINING_SECTOR, sectorById } from "../data/sectors";
import { generateHeightmap, generateSectorHeightmap, mirrorHeightmap } from "./heightmap";
import { TerrainMask } from "./mask";
import { barrelTip, createTank, moveTank, settleTank } from "../entities/tank";
import { BASE_STATS, UPGRADES } from "../data/upgrades";
import { computeStats } from "../systems/upgrades";
import { planPreciseShot, simulateImpact } from "../systems/ai";
import { DEFAULT_WORLD } from "../physics/ballistics";

const W = 1280;
const H = 720;
const maxStats = computeStats(Object.fromEntries(UPGRADES.map((upgrade) => [upgrade.id, upgrade.maxLevel])));

describe("sector terrain profiles", () => {
  it("preserves ALPHA byte-for-byte on 100 seeds", () => {
    for (let seed = 0; seed < 100; seed++) {
      expect(generateSectorHeightmap(W, H, seed, TRAINING_SECTOR.terrain)).toEqual(
        mirrorHeightmap(generateHeightmap(W, H, seed)),
      );
    }
  });

  it.each(SECTORS.filter((sector) => sector.terrain))(
    "$id is deterministic, mirrored and walkable on 100 seeds",
    (sector) => {
      for (let seed = 0; seed < 100; seed++) {
        const map = generateSectorHeightmap(W, H, seed, sector.terrain);
        expect(map).toEqual(generateSectorHeightmap(W, H, seed, sector.terrain));
        let mirrored = true;
        let maxStep = 0;
        let minHeight = H;
        let maxHeight = 0;
        for (let x = 0; x < W; x++) {
          mirrored &&= map[x] === map[W - 1 - x];
          minHeight = Math.min(minHeight, map[x]!);
          maxHeight = Math.max(maxHeight, map[x]!);
          if (x >= 2) maxStep = Math.max(maxStep, Math.abs(Math.floor(map[x]!) - Math.floor(map[x - 2]!)));
        }
        expect(mirrored).toBe(true);
        expect(maxStep).toBeLessThanOrEqual(4);
        expect(minHeight).toBeGreaterThanOrEqual(H * 0.46);
        expect(maxHeight).toBeLessThanOrEqual(H * 0.8);
        const spawn = map[154]!;
        if (sector.id === "delta-08") expect(map[640]!).toBeGreaterThan(spawn + 80);
        if (sector.id === "vanguard-12") expect(map[640]!).toBeLessThan(spawn - 60);
        if (sector.id === "prime-00") expect(map[384]!).toBeLessThan(map[512]! - 40);
        if (sector.id === "forge-17") expect(Math.abs(map[70]! - map[220]!)).toBeLessThan(10);
      }
    },
  );

  it.each(SECTORS.filter((sector) => sector.terrain))(
    "$id supports both tanks with base/max stats and has reachable hits without upgrades",
    (sector) => {
      for (const seed of [0, 7, 42]) {
        const mask = TerrainMask.fromHeightmap(generateSectorHeightmap(W, H, seed, sector.terrain), H);
        expect(mask.removeDetachedGround()).toEqual([]);
        for (const stats of [BASE_STATS, maxStats]) {
          for (const [x, angle] of [
            [W * 0.12, 45],
            [W * 0.88, 135],
          ]) {
            const tank = createTank("P1", x!, 0, angle!, stats);
            settleTank(tank, mask);
            const tip = barrelTip(tank);
            expect(mask.isSolid(tip.x, tip.y)).toBe(false);
            for (const direction of [-1, 1] as const) {
              const mover = { ...tank };
              for (let step = 0; step < stats.moveBudget / 2; step++)
                expect(moveTank(mover, direction, mask)).toBe(true);
            }
          }
        }
        const left = createTank("P1", W * 0.12, 0, 45);
        const right = createTank("P2", W * 0.88, 0, 135);
        settleTank(left, mask);
        settleTank(right, mask);
        for (let step = 0; step < 150; step++) {
          left.moveLeft = right.moveLeft = 60;
          expect(moveTank(left, 1, mask)).toBe(true);
          expect(moveTank(right, -1, mask)).toBe(true);
        }
        for (const [shooter, target] of [
          [left, right],
          [right, left],
        ]) {
          const plan = planPreciseShot(shooter!, target!, mask, 0, DEFAULT_WORLD.gravity);
          expect(plan?.hit).toBe(true);
          const impact = simulateImpact(
            barrelTip({ ...shooter!, angle: plan!.angle }),
            plan!.angle,
            plan!.power,
            DEFAULT_WORLD,
            mask,
            target,
          );
          expect(impact?.hitTarget).toBe(true);
        }
      }
    },
  );

  it("rejects malformed profile definitions rather than falling back to ALPHA", () => {
    expect(() => generateSectorHeightmap(W, H, 0, { points: [], amplitude: 0 })).toThrow("Invalid terrain profile");
    const delta = sectorById("delta-08").terrain!;
    expect(() => generateSectorHeightmap(W, H, 0, { ...delta, amplitude: NaN })).toThrow();
  });
});
