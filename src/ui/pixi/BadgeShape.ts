import { Graphics } from "pixi.js";

export interface BadgeShapeOptions {
  width: number;
  height: number;
  color: number;
  radius?: number;
}

export class BadgeShape extends Graphics {
  public constructor(options: BadgeShapeOptions) {
    super();
    this.draw(options);
  }

  public draw(options: BadgeShapeOptions): void {
    const { width, height, color, radius = 6 } = options;

    this.clear()
      .roundRect(1, 1, Math.max(0, width - 2), Math.max(0, height - 2), radius)
      .fill({ color, alpha: 0.2 })
      .stroke({ color, alpha: 0.9, width: 1 });
  }
}
