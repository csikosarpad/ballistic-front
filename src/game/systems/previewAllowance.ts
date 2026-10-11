/** Játékosonként meccsenként egyszer kérhető röppálya-előnézet. */
export class PreviewAllowance {
  private used = new Set<string>();

  canUse(id: string): boolean {
    return !this.used.has(id);
  }

  /** Igaz, ha most használta fel az egyetlen lehetőségét. */
  use(id: string): boolean {
    if (this.used.has(id)) return false;
    this.used.add(id);
    return true;
  }

  reset(): void {
    this.used.clear();
  }
}
