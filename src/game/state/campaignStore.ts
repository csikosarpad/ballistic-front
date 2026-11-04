import { create } from "zustand";
import type { MessageKey } from "@/i18n";

export const CAMPAIGN_STORAGE_KEY = "ballistic-front:campaign";
const VERSION = 1;

interface CampaignState {
  completed: boolean;
  error: MessageKey | null;
  complete: () => void;
  reset: () => void;
}

function load(): Pick<CampaignState, "completed" | "error"> {
  try {
    const text = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (text === null) return { completed: false, error: null };
    const raw: unknown = JSON.parse(text);
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("version" in raw) ||
      raw.version !== VERSION ||
      !("completed" in raw) ||
      typeof raw.completed !== "boolean"
    ) {
      throw new Error("Invalid or unsupported campaign save");
    }
    return { completed: raw.completed, error: null };
  } catch (error) {
    console.error("Campaign save could not be loaded", error);
    return { completed: false, error: "campaign.loadError" };
  }
}

function save(completed: boolean): MessageKey | null {
  try {
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify({ version: VERSION, completed }));
    return null;
  } catch (error) {
    console.error("Campaign save could not be written", error);
    return "campaign.saveError";
  }
}

/** One playable sector, no extra rewards: completion is an idempotent boolean. */
export const useCampaignStore = create<CampaignState>((set, get) => ({
  ...load(),
  complete: () => {
    if (get().completed && !get().error) return;
    if (get().error === "campaign.loadError") return;
    set({ completed: true, error: save(true) });
  },
  reset: () => set({ completed: false, error: save(false) }),
}));
