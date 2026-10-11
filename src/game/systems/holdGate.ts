/** Egy hang "tartása": akkor aktív, ha az utolsó jelzés óta nem telt el `holdMs`. */
export class HoldGate {
  private last = -Infinity;

  constructor(private holdMs: number) {}

  touch(now: number): void {
    this.last = now;
  }

  isActive(now: number): boolean {
    return now - this.last < this.holdMs;
  }
}
