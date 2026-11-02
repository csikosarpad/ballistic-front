/** Játékosonként meccsenként korlátozott számú röppálya-előnézet. */
export class PreviewAllowance {
  private remaining = new Map<string, number>();

  canUse(id: string): boolean {
    return this.remainingFor(id) > 0;
  }

  remainingFor(id: string): number {
    return this.remaining.get(id) ?? 0;
  }

  use(id: string): boolean {
    const remaining = this.remainingFor(id);
    if (remaining <= 0) return false;
    this.remaining.set(id, remaining - 1);
    return true;
  }

  reset(allowances: Record<string, number> = {}): void {
    this.remaining = new Map(
      Object.entries(allowances).map(([id, amount]) => [id, Math.max(0, Math.floor(amount))]),
    );
  }
}
