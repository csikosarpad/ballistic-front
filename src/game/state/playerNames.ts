import { create } from "zustand";
import { useMultiplayerStore } from "./multiplayerStore";

export const MAX_NAME_LENGTH = 16;
const STORAGE_KEY = "ballistic-front:player-names";

export type PlayerNames = Record<string, string>;

const clean = (value: unknown): string => (typeof value === "string" ? value.trim().slice(0, MAX_NAME_LENGTH) : "");

function load(): PlayerNames {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (typeof parsed !== "object" || parsed === null) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .map(([id, name]) => [id, clean(name)] as const)
        .filter(([, name]) => name !== ""),
    );
  } catch {
    return {};
  }
}

interface PlayerNamesState {
  names: PlayerNames;
  /** Üres név esetén visszaáll az alapértelmezett azonosítóra (P1/P2). */
  setName: (id: string, name: string) => void;
}

export const usePlayerNamesStore = create<PlayerNamesState>((set) => ({
  names: load(),
  setName: (id, name) =>
    set((state) => {
      const names = { ...state.names };
      const value = clean(name);
      if (value) names[id] = value;
      else delete names[id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
      } catch {
        // Mentés nélkül is érvényes az aktuális munkamenetben.
      }
      return { names };
    }),
}));

/** Online meccsen a szobában megadott név, egyébként a beállított név, végül az azonosító. */
export function resolvePlayerName(
  id: string,
  names: PlayerNames,
  onlineNames?: Partial<Record<string, string | null>>,
): string {
  return onlineNames?.[id] || names[id] || id;
}

/** Nem React környezetben (engine) használható név-feloldás. */
export function playerName(id: string): string {
  const { credentials, session } = useMultiplayerStore.getState();
  return resolvePlayerName(id, usePlayerNamesStore.getState().names, credentials ? session?.players : undefined);
}

/** React hook: névváltozáskor újrarenderel. */
export function usePlayerName(): (id: string) => string {
  const names = usePlayerNamesStore((s) => s.names);
  const credentials = useMultiplayerStore((s) => s.credentials);
  const session = useMultiplayerStore((s) => s.session);
  return (id) => resolvePlayerName(id, names, credentials ? session?.players : undefined);
}
