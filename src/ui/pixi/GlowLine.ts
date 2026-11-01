import { Graphics } from "pixi.js";

export interface GlowLineOptions {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: number;
  alpha?: number;
  width?: number;
}

export class GlowLine extends Graphics {
  public constructor(options: GlowLineOptions) {
    super();
    this.draw(options);
  }

  public draw(options: GlowLineOptions): void {
    const { x1, y1, x2, y2, color, alpha = 0.3, width = 1 } = options;

    this.clear()
      .moveTo(x1, y1)
      .lineTo(x2, y2)
      .stroke({ color, alpha: alpha * 0.35, width: width + 5 })
      .moveTo(x1, y1)
      .lineTo(x2, y2)
      .stroke({ color, alpha, width });
  }
}
