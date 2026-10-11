export type Phase = "aiming" | "flying" | "gameOver";

/** Pixi- és Reacttől független körkezelő. */
export class TurnManager {
  phase: Phase = "aiming";
  winner: string | null = null;
  private index: number;

  constructor(
    private ids: string[],
    startIndex = 0,
  ) {
    this.index = startIndex;
  }

  get current(): string {
    return this.ids[this.index]!;
  }

  /** Csak célzás közben lehet bemenetet adni. */
  get inputLocked(): boolean {
    return this.phase !== "aiming";
  }

  fire(): boolean {
    if (this.phase !== "aiming") return false;
    this.phase = "flying";
    return true;
  }

  /** A lövés lezárult: győztes keresése, különben a következő élő játékos jön. */
  endShot(alive: string[]): void {
    if (this.phase !== "flying") return;
    if (alive.length <= 1) {
      this.phase = "gameOver";
      this.winner = alive[0] ?? null;
      return;
    }
    do {
      this.index = (this.index + 1) % this.ids.length;
    } while (!alive.includes(this.current));
    this.phase = "aiming";
  }
}
