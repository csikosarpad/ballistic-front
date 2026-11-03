export interface TrailPoint {
  x: number;
  y: number;
}

export interface TrailSegment {
  from: TrailPoint;
  to: TrailPoint;
  /** 0 (a farok vége) .. 1 (a lövedék). */
  t: number;
}

export const TRAIL_LENGTH = 26;

/** A lövedék utolsó pozíciói; a farok szegmensekre bontva, növekvő vastagsággal rajzolható. */
export class ShellTrail {
  private points: TrailPoint[] = [];

  constructor(private readonly maxLength = TRAIL_LENGTH) {}

  push(x: number, y: number): void {
    this.points.push({ x, y });
    if (this.points.length > this.maxLength) this.points.shift();
  }

  clear(): void {
    this.points = [];
  }

  /** A lövedék nélkül is rövidül a farok, hogy a becsapódás után elhalványuljon. */
  shrink(): void {
    this.points.shift();
  }

  get length(): number {
    return this.points.length;
  }

  segments(): TrailSegment[] {
    const last = this.points.length - 1;
    const result: TrailSegment[] = [];
    for (let i = 0; i < last; i += 1) {
      result.push({ from: this.points[i]!, to: this.points[i + 1]!, t: (i + 1) / last });
    }
    return result;
  }
}
