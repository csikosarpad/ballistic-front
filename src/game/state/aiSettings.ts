import { create } from "zustand";

const SETTINGS_KEY = "ballistic-front:ai-settings";
const MEMORY_KEY = "ballistic-front:ai-memory";

/** Az AI meccsek közötti „tapasztalata”; ez adja a tudásszintjét. */
export interface AiMemory {
  matches: number;
  wins: number;
  shots: number;
  hits: number;
}

export const EMPTY_AI_MEMORY: AiMemory = { matches: 0, wins: 0, shots: 0, hits: 0 };

function readJson(key: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "{}");
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Mentés nélkül is érvényes az aktuális munkamenetben.
  }
}

const count = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;

export function loadAiMemory(): AiMemory {
  const saved = readJson(MEMORY_KEY);
  return { matches: count(saved.matches), wins: count(saved.wins), shots: count(saved.shots), hits: count(saved.hits) };
}

interface AiSettingsState {
  /** Offline módban a P2 tankot a gép vezérli. */
  enabled: boolean;
  memory: AiMemory;
  setEnabled: (enabled: boolean) => void;
  recordMatch: (result: { won: boolean; shots: number; hits: number }) => void;
  resetMemory: () => void;
}

export const useAiSettings = create<AiSettingsState>((set) => ({
  enabled: readJson(SETTINGS_KEY).enabled === true,
  memory: loadAiMemory(),
  setEnabled: (enabled) => {
    writeJson(SETTINGS_KEY, { enabled });
    set({ enabled });
  },
  recordMatch: ({ won, shots, hits }) =>
    set((state) => {
      const memory: AiMemory = {
        matches: state.memory.matches + 1,
        wins: state.memory.wins + (won ? 1 : 0),
        shots: state.memory.shots + shots,
        hits: state.memory.hits + hits,
      };
      writeJson(MEMORY_KEY, memory);
      return { memory };
    }),
  resetMemory: () => {
    writeJson(MEMORY_KEY, EMPTY_AI_MEMORY);
    set({ memory: { ...EMPTY_AI_MEMORY } });
  },
}));
