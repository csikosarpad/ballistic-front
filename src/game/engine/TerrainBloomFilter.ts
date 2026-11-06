import { Texture, type FilterSystem, type RenderSurface } from "pixi.js";
import { AdvancedBloomFilter } from "pixi-filters";

export class TerrainBloomFilter extends AdvancedBloomFilter {
  override apply(manager: FilterSystem, input: Texture, output: RenderSurface, clear: boolean): void {
    try {
      super.apply(manager, input, output, clear);
    } finally {
      // A képernyőméret-váltás törölheti a pool textúráit; a draw után már nem tarthatjuk kötve őket.
      this.resources.uMapTexture = Texture.EMPTY.source;
      const inputs = this.groups[0];
      if (inputs) {
        inputs.setResource(Texture.EMPTY.source, 1);
        inputs.setResource(Texture.EMPTY.source.style, 2);
      }
    }
  }
}
