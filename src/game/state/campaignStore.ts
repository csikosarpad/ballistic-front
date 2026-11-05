import { create } from "zustand";
import type { MessageKey } from "@/i18n";
import {
  CAMPAIGN_CONTENT_VERSION,
  isSectorId,
  nextOperation,
  SECTORS,
  sectorById,
  sectorStatus,
  type SectorId,
} from "../data/sectors";

export const CAMPAIGN_STORAGE_KEY = "ballistic-front:campaign";
const VERSION = 2;

interface CampaignState {
  completedIds: SectorId[];
  selectedId: SectorId;
  error: MessageKey | null;
  select: (id: SectorId) => boolean;
  complete: (id: SectorId) => SectorId[];
  reset: () => void;
}

function load(): Pick<CampaignState, "completedIds" | "selectedId" | "error"> {
  try {
    const text = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    if (text === null) return { completedIds: [], selectedId: "alpha-01", error: null };
    const raw: unknown = JSON.parse(text);
    if (typeof raw !== "object" || raw === null || !("version" in raw)) {
      throw new Error("Invalid or unsupported campaign save");
    }
    if (raw.version === 1 && "completed" in raw && typeof raw.completed === "boolean") {
      const completedIds: SectorId[] = raw.completed ? ["alpha-01"] : [];
      const selectedId = nextOperation(completedIds);
      return { completedIds, selectedId, error: save(completedIds, selectedId) };
    }
    if (
      raw.version !== VERSION ||
      !("contentVersion" in raw) ||
      raw.contentVersion !== CAMPAIGN_CONTENT_VERSION ||
      !("completedIds" in raw) ||
      !Array.isArray(raw.completedIds) ||
      !raw.completedIds.every(isSectorId) ||
      new Set(raw.completedIds).size !== raw.completedIds.length ||
      !("selectedId" in raw) ||
      !isSectorId(raw.selectedId)
    )
      throw new Error("Invalid campaign save");
    const completedIds = raw.completedIds;
    if (
      completedIds.some((id) => {
        const { prerequisites } = sectorById(id);
        return prerequisites.length > 0 && !prerequisites.some((required) => completedIds.includes(required));
      }) ||
      sectorStatus(raw.selectedId, completedIds) === "locked"
    )
      throw new Error("Invalid campaign progression");
    return { completedIds, selectedId: raw.selectedId, error: null };
  } catch (error) {
    console.error("Campaign save could not be loaded", error);
    return { completedIds: [], selectedId: "alpha-01", error: "campaign.loadError" };
  }
}

function save(completedIds: readonly SectorId[], selectedId: SectorId): MessageKey | null {
  try {
    localStorage.setItem(
      CAMPAIGN_STORAGE_KEY,
      JSON.stringify({
        version: VERSION,
        contentVersion: CAMPAIGN_CONTENT_VERSION,
        completedIds,
        selectedId,
      }),
    );
    return null;
  } catch (error) {
    console.error("Campaign save could not be written", error);
    return "campaign.saveError";
  }
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  ...load(),
  select: (id) => {
    sectorById(id);
    const { completedIds, error } = get();
    if (error === "campaign.loadError") return false;
    if (sectorStatus(id, completedIds) === "locked") {
      console.error(`Locked campaign operation: ${id}`);
      return false;
    }
    set({ selectedId: id, error: save(completedIds, id) });
    return true;
  },
  complete: (id) => {
    sectorById(id);
    const state = get();
    if (state.error === "campaign.loadError") return [];
    if (sectorStatus(id, state.completedIds) === "locked") {
      console.error(`Cannot complete locked campaign sector: ${id}`);
      return [];
    }
    if (state.completedIds.includes(id)) {
      if (state.error) set({ error: save(state.completedIds, state.selectedId) });
      return [];
    }
    const completedIds = [...state.completedIds, id];
    const routes = SECTORS.filter(
      (sector) =>
        sectorStatus(sector.id, state.completedIds) === "locked" &&
        sectorStatus(sector.id, completedIds) === "available",
    ).map((sector) => sector.id);
    const selectedId = nextOperation(completedIds);
    set({ completedIds, selectedId, error: save(completedIds, selectedId) });
    return routes;
  },
  reset: () => set({ completedIds: [], selectedId: "alpha-01", error: save([], "alpha-01") }),
}));
