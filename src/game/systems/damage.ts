/** A beérkező sebzés felosztása a védelmi rétegek között. Tiszta függvények, hogy az online szimuláció determinisztikus maradjon. */

/** A fizikai páncél felső korlátja: sosem lehet sebezhetetlen. */
export const MAX_ARMOR = 0.75;

export interface Defense {
  hp: number;
  /** Az erőtér pajzs aktuális értéke. */
  shield: number;
  /** A HP-t érő sebzés százalékos csökkentése (0.2 = 20%). */
  armor: number;
}

export interface DamageResult {
  hp: number;
  shield: number;
}

/**
 * Sorrend: 1) a nyers sebzést először az erőtér pajzs nyeli el; 2) a pajzson átjutó maradékot a fizikai páncél
 * százalékosan csökkenti (kerekítve); 3) az így kapott érték vonódik le a HP-ból.
 */
export function resolveDamage(defense: Defense, damage: number): DamageResult {
  const raw = Math.max(0, damage);
  const absorbed = Math.min(defense.shield, raw);
  const armor = Math.min(MAX_ARMOR, Math.max(0, defense.armor));
  const throughShield = raw - absorbed;
  const hpLoss = Math.round(throughShield * (1 - armor));
  return { shield: defense.shield - absorbed, hp: Math.max(0, defense.hp - hpLoss) };
}

/** A páncél csíkjának töltöttsége (0–1): a páncél a korláthoz (MAX_ARMOR) képest. */
export function armorFraction(armor: number): number {
  return Math.min(MAX_ARMOR, Math.max(0, armor)) / MAX_ARMOR;
}

/** Körönkénti pajzsvisszatöltés: a maximum `fraction` része, a maximumig. */
export function regenShield(shield: number, maxShield: number, fraction: number): number {
  if (maxShield <= 0) return 0;
  return Math.min(maxShield, shield + Math.round(maxShield * Math.max(0, fraction)));
}
