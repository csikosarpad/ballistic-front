/** A tank játékmenetet befolyásoló értékei; az upgrade-ek ezeket módosítják. A UI-ban 1 px = 1 méter. */
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
  /** A megjelenített szöveg kulcsai: `upgrade.<id>.name` és `upgrade.<id>.desc` (lásd src/i18n). */
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
  {
    id: "armor",
    stat: "maxHp",
    perLevel: 20,
    maxLevel: 5,
    baseCost: 40,
    costGrowth: 1.5,
  },
  {
    id: "warhead",
    stat: "damage",
    perLevel: 0.15,
    maxLevel: 5,
    baseCost: 60,
    costGrowth: 1.6,
  },
  {
    id: "blast",
    stat: "blastRadius",
    perLevel: 4,
    maxLevel: 5,
    baseCost: 50,
    costGrowth: 1.5,
  },
  {
    id: "barrel",
    stat: "maxPower",
    perLevel: 100,
    maxLevel: 3,
    baseCost: 70,
    costGrowth: 1.7,
  },
  {
    id: "engine",
    stat: "moveBudget",
    perLevel: 10,
    maxLevel: 5,
    baseCost: 30,
    costGrowth: 1.4,
  },
];
