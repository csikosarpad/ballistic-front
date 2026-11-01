import { Graphics } from "pixi.js";
import { PIXI_UI_THEME } from "./PixiUiTheme";

export interface HudFrameOptions {
  width: number;
  height: number;
  color: number;
  alpha?: number;
  radius?: number;
}

export class HudFrame extends Graphics {
  public constructor(options: HudFrameOptions) {
    super();
    this.draw(options);
  }

  public draw(options: HudFrameOptions): void {
    const {
      width,
      height,
      color,
      alpha = PIXI_UI_THEME.alpha.frame,
      radius = PIXI_UI_THEME.geometry.radius,
    } = options;
    const { cornerSize, inset } = PIXI_UI_THEME.geometry;

    this.clear()
      .roundRect(1, 1, Math.max(0, width - 2), Math.max(0, height - 2), radius)
      .stroke({ color, alpha, width: 1 });

    this.moveTo(inset + cornerSize, inset)
      .lineTo(inset, inset)
      .lineTo(inset, inset + cornerSize)
      .moveTo(width - inset - cornerSize, inset)
      .lineTo(width - inset, inset)
      .lineTo(width - inset, inset + cornerSize)
      .moveTo(inset, height - inset - cornerSize)
      .lineTo(inset, height - inset)
      .lineTo(inset + cornerSize, height - inset)
      .moveTo(width - inset - cornerSize, height - inset)
      .lineTo(width - inset, height - inset)
      .lineTo(width - inset, height - inset - cornerSize)
      .stroke({ color, alpha: Math.min(1, alpha + 0.55), width: 1.5 });
  }
}
