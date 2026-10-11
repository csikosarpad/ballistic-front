import { BASE_STATS, UPGRADES, type TankStats, type UpgradeDef } from "../data/upgrades";

/** Meta-progresszió: a játékosnál maradó XP és fejlesztési szintek. */
export interface Profile {
  xp: number;
  levels: Record<string, number>;
}

export const newProfile = (): Profile => ({ xp: 0, levels: {} });

export function computeStats(levels: Record<string, number>, defs: readonly UpgradeDef[] = UPGRADES): TankStats {
  const stats = { ...BASE_STATS };
  for (const def of defs) {
    const level = Math.min(levels[def.id] ?? 0, def.maxLevel);
    stats[def.stat] += def.perLevel * level;
  }
  return stats;
}

/** A következő szint ára. */
export function upgradeCost(def: UpgradeDef, level: number): number {
  return Math.round(def.baseCost * def.costGrowth ** level);
}

/** Új profilt ad vissza, vagy null-t, ha nincs elég XP / elérte a max szintet / ismeretlen id. */
export function buyUpgrade(profile: Profile, id: string, defs: readonly UpgradeDef[] = UPGRADES): Profile | null {
  const def = defs.find((d) => d.id === id);
  if (!def) return null;
  const level = profile.levels[id] ?? 0;
  if (level >= def.maxLevel) return null;
  const cost = upgradeCost(def, level);
  if (profile.xp < cost) return null;
  return { xp: profile.xp - cost, levels: { ...profile.levels, [id]: level + 1 } };
}

export function awardXp(profile: Profile, amount: number): Profile {
  return amount > 0 ? { ...profile, xp: profile.xp + amount } : profile;
}
