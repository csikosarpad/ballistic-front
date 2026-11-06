import { describe, expect, it } from "vitest";
import { TerrainMask } from "./mask";

function cutRow(mask: TerrainMask, y: number, except = -1): void {
  for (let x = 0; x < mask.width; x++) if (x !== except) mask.carveCircle(x, y, 0);
}

describe("removeDetachedGround", () => {
  it("keeps untouched terrain and removes nothing on repeated checks", () => {
    const mask = TerrainMask.fromHeightmap([3, 2, 1, 2, 3], 8);
    expect(mask.removeDetachedGround()).toEqual([]);
    expect(mask.removeDetachedGround()).toEqual([]);
    expect(mask.surfaceY(2)).toBe(1);
  });

  it("removes a severed island from collision and returns exact horizontal spans", () => {
    const mask = TerrainMask.fromHeightmap([1, 1, 1, 1, 1], 6);
    cutRow(mask, 3);
    expect(mask.removeDetachedGround()).toEqual([
      { x: 0, y: 1, width: 5 },
      { x: 0, y: 2, width: 5 },
    ]);
    for (let x = 0; x < 5; x++) {
      expect(mask.isSolid(x, 1)).toBe(false);
      expect(mask.surfaceY(x)).toBe(4);
      expect(mask.isSolid(x, 5)).toBe(true);
    }
    expect(mask.removeDetachedGround()).toEqual([]);
  });

  it("preserves an overhang attached on one side, then removes it when its last bridge breaks", () => {
    const mask = TerrainMask.fromHeightmap([1, 1, 1, 1, 1], 6);
    cutRow(mask, 3, 0);
    expect(mask.removeDetachedGround()).toEqual([]);
    expect(mask.isSolid(4, 1)).toBe(true);
    mask.carveCircle(0, 3, 0);
    expect(mask.removeDetachedGround()).toHaveLength(2);
    expect(mask.isSolid(4, 1)).toBe(false);
  });

  it("does not wrap horizontal connections across row boundaries or accept corner-only support", () => {
    const mask = TerrainMask.fromHeightmap([0, 0, 0], 3);
    for (const [x, y] of [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
      [0, 2],
    ])
      mask.carveCircle(x!, y!, 0);
    const removed = mask.removeDetachedGround();
    expect(removed).toContainEqual({ x: 2, y: 0, width: 1 });
    expect(removed).toContainEqual({ x: 0, y: 1, width: 1 });
    expect(mask.isSolid(1, 2)).toBe(true);
  });

  it("handles empty masks and a completely destroyed foundation", () => {
    expect(TerrainMask.fromHeightmap([], 0).removeDetachedGround()).toEqual([]);
    const mask = TerrainMask.fromHeightmap([0, 0], 3);
    cutRow(mask, 2);
    expect(mask.removeDetachedGround()).toHaveLength(2);
    expect(mask.surfaceY(0)).toBe(3);
  });

  it("produces identical collision and removal spans for the same explosion sequence", () => {
    const left = TerrainMask.fromHeightmap(new Float32Array(40).fill(10), 40);
    const right = TerrainMask.fromHeightmap(new Float32Array(40).fill(10), 40);
    for (const [x, y, radius] of [
      [10, 20, 8],
      [25, 20, 10],
      [18, 18, 6],
    ]) {
      left.carveCircle(x!, y!, radius!);
      right.carveCircle(x!, y!, radius!);
      expect(left.removeDetachedGround()).toEqual(right.removeDetachedGround());
      for (let row = 0; row < 40; row++) {
        for (let column = 0; column < 40; column++) {
          expect(left.isSolid(column, row)).toBe(right.isSolid(column, row));
        }
      }
    }
  });
});
