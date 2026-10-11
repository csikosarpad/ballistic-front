/** Egy meccs statisztikái játékosonként; a végeredmény-képernyő ezt mutatja. */
export interface PlayerMatchStats {
  shots: number;
  /** Az ellenfélnek okozott sérülés (HP). */
  damage: number;
  /** A meccsen szerzett XP. */
  xp: number;
}

export type MatchStats = Record<string, PlayerMatchStats>;

export function newMatchStats(ids: string[]): MatchStats {
  return Object.fromEntries(ids.map((id) => [id, { shots: 0, damage: 0, xp: 0 }]));
}

function update(stats: MatchStats, id: string, patch: (s: PlayerMatchStats) => PlayerMatchStats): MatchStats {
  const current = stats[id];
  return current ? { ...stats, [id]: patch(current) } : stats;
}

export const recordShot = (stats: MatchStats, id: string) => update(stats, id, (s) => ({ ...s, shots: s.shots + 1 }));

export const recordDamage = (stats: MatchStats, id: string, amount: number) =>
  update(stats, id, (s) => ({ ...s, damage: s.damage + amount }));

export const recordXp = (stats: MatchStats, id: string, amount: number) =>
  update(stats, id, (s) => ({ ...s, xp: s.xp + amount }));
