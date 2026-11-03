/** Rövid, csillapodó kamerarázkódás; a megjelenítést érinti, a játéklogikát nem. */
export const SHAKE_DURATION = 0.35;
export const SHAKE_MAX_PX = 9;

export class ScreenShake {
  private time = 0;
  private strength = 0;

  /** `intensity`: 0..1; erősebb találat felülírja a gyengébbet, de nem összegződik. */
  trigger(intensity: number): void {
    const next = Math.max(0, Math.min(1, intensity));
    if (next >= this.current()) {
      this.strength = next;
      this.time = SHAKE_DURATION;
    }
  }

  update(dt: number): void {
    this.time = Math.max(0, this.time - dt);
  }

  get active(): boolean {
    return this.time > 0;
  }

  /** Aktuális erősség (0..1), lineárisan csillapodik. */
  private current(): number {
    return this.strength * (this.time / SHAKE_DURATION);
  }

  /** Eltolás világ-pixelben; `random` 0..1 értéket ad. */
  offset(random: () => number): { x: number; y: number } {
    if (this.time <= 0) return { x: 0, y: 0 };
    const amplitude = this.current() * SHAKE_MAX_PX;
    return { x: (random() * 2 - 1) * amplitude, y: (random() * 2 - 1) * amplitude };
  }
}
