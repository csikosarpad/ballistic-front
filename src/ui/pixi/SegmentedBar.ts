import { Graphics } from "pixi.js";

export interface SegmentedBarOptions {
  segments: number;
  width: number;
  height: number;
  fillColor: number;
  emptyColor: number;
  gap?: number;
}

export class SegmentedBar extends Graphics {
  private value = 0;
  private max = 0;

  public constructor(private readonly options: SegmentedBarOptions) {
    super();
    this.redraw();
  }

  public setValue(value: number, max: number): void {
    this.value = Math.max(0, value);
    this.max = Math.max(0, max);
    this.redraw();
  }

  private redraw(): void {
    const { segments, width, height, fillColor, emptyColor, gap = 3 } = this.options;
    const segmentWidth = Math.max(0, (width - gap * (segments - 1)) / segments);
    const filled = this.max > 0 ? Math.round((this.value / this.max) * segments) : 0;

    this.clear();
    for (let index = 0; index < segments; index += 1) {
      const x = index * (segmentWidth + gap);
      this.skew.x = -0.08;
      this.rect(x, 0, segmentWidth, height).fill(index < filled ? fillColor : emptyColor);
    }
  }
}
