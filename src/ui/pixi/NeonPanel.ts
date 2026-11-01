import { Container } from "pixi.js";
import { HudFrame, type HudFrameOptions } from "./HudFrame";

export class NeonPanel extends Container {
  public readonly frame: HudFrame;
  public readonly content = new Container();
  private options: HudFrameOptions;

  public constructor(options: HudFrameOptions) {
    super();
    this.options = options;
    this.frame = new HudFrame(options);
    this.addChild(this.frame, this.content);
  }

  public resize(width: number, height: number): void {
    this.options = { ...this.options, width, height };
    this.frame.draw(this.options);
  }
}
