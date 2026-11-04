import { Container, Graphics, RenderTexture, Sprite, type Renderer } from "pixi.js";
import { generateHeightmap, mirrorHeightmap } from "./heightmap";
import { TerrainMask, type TerrainSpan } from "./mask";
import { scorchDots } from "./scorch";
import { DEFAULT_THEME, type Theme } from "../theme";

/** Terep: a látvány egy RenderTexture, a rombolás `erase` blendű körökkel történik; az ütközést a TerrainMask adja. */
export class Terrain {
  readonly sprite = new Sprite();
  mask = TerrainMask.fromHeightmap([], 0);
  private texture: RenderTexture | null = null;
  private eraser = new Graphics();
  /** A gyökér konténer blend módját a Pixi nem alkalmazza, ezért a törlő kört egy szülőn keresztül rajzoljuk. */
  private eraseLayer = new Container();
  private scorch = new Graphics();

  constructor(
    private renderer: Renderer,
    private colors: Theme["terrain"] = DEFAULT_THEME.terrain,
  ) {
    this.eraser.blendMode = "erase";
    this.eraseLayer.addChild(this.eraser);
  }

  build(width: number, height: number, seed = 1): void {
    const heightmap = mirrorHeightmap(generateHeightmap(width, height, seed));
    this.mask = TerrainMask.fromHeightmap(heightmap, height);

    const shape = new Graphics().moveTo(0, height);
    heightmap.forEach((y, x) => shape.lineTo(x, y));
    shape.lineTo(width, height).closePath().fill(this.colors.fill);
    // Fűréteg a felszínen.
    shape.moveTo(0, heightmap[0]!);
    heightmap.forEach((y, x) => shape.lineTo(x, y));
    shape.stroke({ width: 4, color: this.colors.grass });
    shape.moveTo(0, heightmap[0]! - 1);
    heightmap.forEach((y, x) => shape.lineTo(x, y - 1));
    shape.stroke({ width: 1, color: this.colors.surfaceHighlight, alpha: 0.7 });

    const strata = new Graphics();
    for (const offset of [18, 38, 62]) {
      strata.moveTo(0, Math.min(height - 1, heightmap[0]! + offset));
      heightmap.forEach((surfaceY, x) => strata.lineTo(x, Math.min(height - 1, surfaceY + offset)));
      strata.stroke({
        width: offset === 18 ? 2 : 1,
        color: offset === 38 ? this.colors.soilLight : this.colors.soilDeep,
        alpha: offset === 18 ? 0.24 : 0.34,
      });
    }

    const terrainVisuals = new Container();
    terrainVisuals.addChild(shape, strata);

    this.texture?.destroy(true);
    this.texture = RenderTexture.create({ width, height });
    this.renderer.render({ container: terrainVisuals, target: this.texture });
    terrainVisuals.destroy({ children: true });
    this.sprite.texture = this.texture;
  }

  /** Kör alakú lyuk a textúrában és a maszkban, a perem megperzselve. */
  carve(x: number, y: number, radius: number): void {
    if (!this.texture) return;
    // Előbb égetünk (a régi maszkkal), a lyuk kivájása a belső részt úgyis törli.
    this.scorch.clear();
    for (const d of scorchDots(this.mask, x, y, radius)) {
      this.scorch.circle(d.x, d.y, d.radius).fill({ color: this.colors.scorch, alpha: d.alpha });
    }
    this.renderer.render({ container: this.scorch, target: this.texture, clear: false });

    this.mask.carveCircle(x, y, radius);
    const detached = this.mask.removeDetachedGround();
    this.eraser.clear().circle(x, y, radius).fill(0xffffff);
    this.eraseDetached(detached);
    this.renderer.render({ container: this.eraseLayer, target: this.texture, clear: false });
  }

  private eraseDetached(spans: readonly TerrainSpan[]): void {
    // A felszíni vonal a solid pixeleken kívülre is kilóg; ezt is töröljük, de élő talajpixelhez nem nyúlunk.
    const fringe = 2;
    for (const span of spans) {
      const x0 = Math.max(0, span.x - fringe);
      const x1 = Math.min(this.mask.width, span.x + span.width + fringe);
      const y0 = Math.max(0, span.y - fringe);
      const y1 = Math.min(this.mask.height - 1, span.y + fringe);
      for (let y = y0; y <= y1; y++) {
        let start = -1;
        for (let x = x0; x <= x1; x++) {
          if (x < x1 && !this.mask.isSolid(x, y)) {
            if (start < 0) start = x;
          } else if (start >= 0) {
            this.eraser.rect(start, y, x - start, 1);
            start = -1;
          }
        }
      }
    }
    if (spans.length) this.eraser.fill(0xffffff);
  }

  destroy(): void {
    this.texture?.destroy(true);
    this.eraser.destroy();
    this.eraseLayer.destroy();
    this.scorch.destroy();
    this.sprite.destroy();
  }
}
