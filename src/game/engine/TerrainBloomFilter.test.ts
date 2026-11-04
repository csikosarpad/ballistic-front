import { afterEach, describe, expect, it, vi } from "vitest";
import { BindGroup, Texture, type FilterSystem } from "pixi.js";
import { AdvancedBloomFilter } from "pixi-filters";
import { TerrainBloomFilter } from "./TerrainBloomFilter";

vi.hoisted(() => {
  HTMLCanvasElement.prototype.getContext = () => null;
});

afterEach(() => vi.restoreAllMocks());

describe("TerrainBloomFilter", () => {
  it("detaches pooled texture sources and sampler after drawing, including repeated renders", () => {
    const filter = new TerrainBloomFilter({ threshold: 0.45, bloomScale: 0.5, blur: 4, quality: 2 });
    const inputs = new BindGroup();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const draw = vi.spyOn(AdvancedBloomFilter.prototype, "apply");
    const manager = {} as FilterSystem;

    for (let i = 0; i < 3; i++) {
      const input = Texture.from({ resource: new Uint8Array(4), width: 1, height: 1 });
      const bloom = Texture.from({ resource: new Uint8Array(4), width: 1, height: 1 });
      draw.mockImplementationOnce(function () {
        inputs.setResource(input.source, 1);
        inputs.setResource(input.source.style, 2);
        filter.groups[0] = inputs;
        filter.resources.uMapTexture = bloom.source;
      });
      filter.apply(manager, input, input, true);
      expect(draw).toHaveBeenLastCalledWith(manager, input, input, true);
      expect(inputs.getResource(1)).toBe(Texture.EMPTY.source);
      expect(inputs.getResource(2)).toBe(Texture.EMPTY.source.style);
      expect(filter.resources.uMapTexture).toBe(Texture.EMPTY.source);
      input.destroy(true);
      bloom.destroy(true);
    }

    expect(warn).not.toHaveBeenCalled();
    expect(filter.threshold).toBe(0.45);
    expect(filter.bloomScale).toBe(0.5);
    inputs.destroy();
    filter.destroy();
  });

  it("clears bindings and propagates rendering errors", () => {
    const filter = new TerrainBloomFilter();
    const inputs = new BindGroup();
    filter.groups[0] = inputs;
    const input = Texture.from({ resource: new Uint8Array(4), width: 1, height: 1 });
    vi.spyOn(AdvancedBloomFilter.prototype, "apply").mockImplementationOnce(() => {
      inputs.setResource(input.source, 1);
      inputs.setResource(input.source.style, 2);
      filter.resources.uMapTexture = input.source;
      throw new Error("Render failed");
    });
    expect(() => filter.apply({} as FilterSystem, input, input, true)).toThrow("Render failed");
    expect(inputs.getResource(1)).toBe(Texture.EMPTY.source);
    expect(inputs.getResource(2)).toBe(Texture.EMPTY.source.style);
    expect(filter.resources.uMapTexture).toBe(Texture.EMPTY.source);
    input.destroy(true);
    inputs.destroy();
    filter.destroy();
  });
});
