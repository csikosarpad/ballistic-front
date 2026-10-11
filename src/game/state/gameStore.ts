import { create } from "zustand";
import type { MatchStats } from "../systems/matchStats";
import type { Phase } from "../systems/turnManager";
import type { Profile } from "../systems/upgrades";

export type Screen = "menu" | "playing";
export const MIN_POWER = 100;
export const MIN_ANGLE = 0;
export const MAX_ANGLE = 180;

export interface TankView {
  id: string;
  hp: number;
  maxHp: number;
  moveLeft: number;
}

export interface GameState {
  angle: number;
  power: number;
  maxPower: number;
  wind: number;
  phase: Phase;
  currentId: string;
  winner: string | null;
  tanks: TankView[];
  profiles: Record<string, Profile>;
  matchStats: MatchStats;
  /** A soron lévő játékos még kérhet röppálya-előnézetet. */
  previewAvailable: boolean;
  previewActive: boolean;
  screen: Screen;
  setAim: (angle: number, power: number) => void;
  /** Az erőt a [MIN_POWER, maxPower] tartományban tartva változtatja. */
  nudgePower: (delta: number) => void;
  /** A szöget a [MIN_ANGLE, MAX_ANGLE] tartományban tartva változtatja. */
  nudgeAngle: (delta: number) => void;
  setScreen: (screen: Screen) => void;
  /** Az engine tölti; a HUD csak olvassa. */
  sync: (s: Partial<Omit<GameState, "setAim" | "nudgePower" | "nudgeAngle" | "setScreen" | "sync">>) => void;
}

/** Csak a HUD-hoz szükséges állapot; a nagy gyakoriságú adat (pozíciók) az engine-ben él. */
export const useGameStore = create<GameState>((set) => ({
  angle: 45,
  power: 400,
  maxPower: 600,
  wind: 0,
  phase: "aiming",
  currentId: "P1",
  winner: null,
  tanks: [],
  profiles: {},
  matchStats: {},
  previewAvailable: false,
  previewActive: false,
  screen: "menu",
  setAim: (angle, power) => set({ angle, power }),
  nudgePower: (delta) => set((s) => ({ power: Math.min(s.maxPower, Math.max(MIN_POWER, s.power + delta)) })),
  nudgeAngle: (delta) => set((s) => ({ angle: Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, s.angle + delta)) })),
  setScreen: (screen) => set({ screen }),
  sync: (s) => set(s),
}));
