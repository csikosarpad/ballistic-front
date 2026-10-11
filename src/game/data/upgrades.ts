/** A tank játékmenetet befolyásoló értékei; az upgrade-ek ezeket módosítják. */
export interface TankStats {
  maxHp: number;
  /** Sebzésszorzó. */
  damage: number;
  /** Robbanás sugara (px). */
  blastRadius: number;
  maxPower: number;
  /** Körönként megtehető távolság (px). */
  moveBudget: number;
}

export const BASE_STATS: TankStats = {
  maxHp: 100,
  damage: 1,
  blastRadius: 30,
  maxPower: 600,
  moveBudget: 60,
};

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  stat: keyof TankStats;
  /** Szintenként hozzáadott érték. */
  perLevel: number;
  maxLevel: number;
  baseCost: number;
  /** A költség szorzója szintenként. */
  costGrowth: number;
}

/** Adatvezérelt: új fejlesztéshez elég egy új sor ide. */
export const UPGRADES: readonly UpgradeDef[] = [
  { id: "armor", name: "Páncél", description: "+20 max HP", stat: "maxHp", perLevel: 20, maxLevel: 5, baseCost: 40, costGrowth: 1.5 },
  { id: "warhead", name: "Robbanófej", description: "+15% sebzés", stat: "damage", perLevel: 0.15, maxLevel: 5, baseCost: 60, costGrowth: 1.6 },
  { id: "blast", name: "Nagyobb kráter", description: "+4 px robbanási sugár", stat: "blastRadius", perLevel: 4, maxLevel: 5, baseCost: 50, costGrowth: 1.5 },
  { id: "barrel", name: "Hosszabb cső", description: "+100 max erő", stat: "maxPower", perLevel: 100, maxLevel: 3, baseCost: 70, costGrowth: 1.7 },
  { id: "engine", name: "Motor", description: "+10 px mozgás/kör", stat: "moveBudget", perLevel: 10, maxLevel: 5, baseCost: 30, costGrowth: 1.4 },
];
