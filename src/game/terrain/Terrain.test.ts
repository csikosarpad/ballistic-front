import { afterEach, describe, expect, it, vi } from "vitest";
import { Graphics, type Renderer } from "pixi.js";
import { Terrain } from "./Terrain";
import { TerrainMask } from "./mask";

vi.hoisted(() => {
  HTMLCanvasElement.prototype.getContext = () => null;
});

afterEach(() => vi.restoreAllMocks());

describe("Terrain collapse", () => {
  it("clears collision and the visual island including its outline before returning from carve", () => {
    const render = vi.fn();
    const terrain = new Terrain({ render } as unknown as Renderer);
    terrain.build(10, 10);
    terrain.mask = TerrainMask.fromHeightmap(new Float32Array(10).fill(2), 10);
    for (let x = 1; x < 10; x++) terrain.mask.carveCircle(x, 5, 0);
    const rect = vi.spyOn(Graphics.prototype, "rect");
    render.mockClear();
    terrain.carve(0, 5, 0);
    expect(terrain.mask.surfaceY(5)).toBe(6);
    expect(rect).toHaveBeenCalled();
    const erased = (x: number, y: number) =>
      rect.mock.calls.some(([rx, ry, width, height]) => x >= rx && x < rx + width && y >= ry && y < ry + height);
    expect(erased(5, 3)).toBe(true);
    expect(erased(5, 0)).toBe(true);
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (terrain.mask.isSolid(x, y)) expect(erased(x, y)).toBe(false);
      }
    }
    expect(render).toHaveBeenCalledTimes(2);
    terrain.destroy();
  });

  it("does not add visual clearing rectangles for a supported crater", () => {
    const terrain = new Terrain({ render: vi.fn() } as unknown as Renderer);
    terrain.build(40, 40);
    terrain.mask = TerrainMask.fromHeightmap(new Float32Array(40).fill(10), 40);
    const rect = vi.spyOn(Graphics.prototype, "rect");
    terrain.carve(20, 10, 4);
    expect(rect).not.toHaveBeenCalled();
    expect(terrain.mask.isSolid(20, 10)).toBe(false);
    expect(terrain.mask.isSolid(20, 30)).toBe(true);
    terrain.destroy();
  });
});
