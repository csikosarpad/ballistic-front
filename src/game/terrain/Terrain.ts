import { Container, Graphics, RenderTexture, Sprite, type Renderer } from "pixi.js";
import { generateHeightmap, mirrorHeightmap } from "./heightmap";
import { TerrainMask } from "./mask";
import { scorchDots } from "./scorch";

/** Terep: a látvány egy RenderTexture, a rombolás `erase` blendű körökkel történik; az ütközést a TerrainMask adja. */
export class Terrain {
  readonly sprite = new Sprite();
  mask = TerrainMask.fromHeightmap([], 0);
  private texture: RenderTexture | null = null;
  private eraser = new Graphics();
  /** A gyökér konténer blend módját a Pixi nem alkalmazza, ezért a törlő kört egy szülőn keresztül rajzoljuk. */
  private eraseLayer = new Container();
  private scorch = new Graphics();

  constructor(private renderer: Renderer) {
    this.eraser.blendMode = "erase";
    this.eraseLayer.addChild(this.eraser);
  }

  build(width: number, height: number, seed = 1): void {
    const heightmap = mirrorHeightmap(generateHeightmap(width, height, seed));
    this.mask = TerrainMask.fromHeightmap(heightmap, height);

    const shape = new Graphics().moveTo(0, height);
    heightmap.forEach((y, x) => shape.lineTo(x, y));
    shape.lineTo(width, height).closePath().fill(0x6b4a2b);
    // Fűréteg a felszínen.
    shape.moveTo(0, heightmap[0]!);
    heightmap.forEach((y, x) => shape.lineTo(x, y));
    shape.stroke({ width: 4, color: 0x3d7a3a });

    this.texture?.destroy(true);
    this.texture = RenderTexture.create({ width, height });
    this.renderer.render({ container: shape, target: this.texture });
    shape.destroy();
    this.sprite.texture = this.texture;
  }

  /** Kör alakú lyuk a textúrában és a maszkban, a perem megperzselve. */
  carve(x: number, y: number, radius: number): void {
    if (!this.texture) return;
    // Előbb égetünk (a régi maszkkal), a lyuk kivájása a belső részt úgyis törli.
    this.scorch.clear();
    for (const d of scorchDots(this.mask, x, y, radius)) {
      this.scorch.circle(d.x, d.y, d.radius).fill({ color: 0x14100a, alpha: d.alpha });
    }
    this.renderer.render({ container: this.scorch, target: this.texture, clear: false });

    this.mask.carveCircle(x, y, radius);
    this.eraser.clear().circle(x, y, radius).fill(0xffffff);
    this.renderer.render({ container: this.eraseLayer, target: this.texture, clear: false });
  }

  destroy(): void {
    this.texture?.destroy(true);
    this.eraser.destroy();
    this.eraseLayer.destroy();
    this.scorch.destroy();
    this.sprite.destroy();
  }
}
