import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Game } from "./Game";
import { TerrainMask } from "../terrain/mask";
import { useGameStore } from "../state/gameStore";
import { useCampaignStore } from "../state/campaignStore";
import { useAiSettings } from "../state/aiSettings";
import { useMultiplayerStore } from "../state/multiplayerStore";
import type { Tank } from "../entities/tank";
import { TRAINING_SECTOR, sectorById } from "../data/sectors";

vi.hoisted(() => {
  HTMLCanvasElement.prototype.getContext = () => null;
});

describe("Game campaign lifecycle", () => {
  let game: Game;

  beforeEach(() => {
    vi.useFakeTimers();
    useMultiplayerStore.getState().leave();
    useCampaignStore.getState().reset();
    useAiSettings.getState().setEnabled(false);
    useGameStore.setState({ screen: "playing", muted: true, sector: TRAINING_SECTOR, campaignNewRoutes: [] });
    game = new Game();
    Reflect.set(game, "terrain", {
      mask: TerrainMask.fromHeightmap(new Array(1280).fill(550), 720),
      build: vi.fn(),
      carve: vi.fn(),
    });
    vi.spyOn(Reflect.get(game, "battlefieldLayers"), "draw").mockImplementation(() => {});
  });

  afterEach(() => {
    game.destroy();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const endBattle = (winner: "P1" | "P2" | null) => {
    game.restart({ seed: 42, starterIndex: 0 });
    const tanks: Tank[] = Reflect.get(game, "tanks");
    tanks[1]!.hp = winner === "P2" ? 100 : 0;
    tanks[0]!.hp = winner === "P1" ? 100 : 0;
    game.fire();
    Reflect.get(game, "explode").call(game, 640, 100);
  };

  it("forces campaign AI but preserves quick-battle preference, including rematch", () => {
    game.startCampaign();
    expect(useGameStore.getState()).toMatchObject({ matchMode: "campaign", aiActive: true });
    expect(useAiSettings.getState().enabled).toBe(false);
    const firstId = useGameStore.getState().matchId;
    game.restart();
    expect(useGameStore.getState().matchId).not.toBe(firstId);
    expect(useGameStore.getState().aiActive).toBe(true);
    game.startOffline();
    expect(useGameStore.getState()).toMatchObject({ matchMode: "skirmish", aiActive: false });
  });

  it.each(["P1", "P2", null] as const)("completes ALPHA only for a campaign P1 victory: %s", (winner) => {
    game.startCampaign();
    endBattle(winner);
    expect(useGameStore.getState()).toMatchObject({ phase: "gameOver", winner });
    expect(useCampaignStore.getState().completedIds).toEqual(winner === "P1" ? ["alpha-01"] : []);
  });

  it("does not complete the sector after a quick-battle victory", () => {
    game.startOffline();
    endBattle("P1");
    expect(useCampaignStore.getState().completedIds).toEqual([]);
  });

  it("stops AI actions, physics and player controls when leaving a battle", () => {
    game.startCampaign();
    game.restart({ seed: 42, starterIndex: 1 });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    game.leaveBattle();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(10000);
    game.fire();
    game.move(-1);
    Reflect.get(game, "update").call(game, 1);
    expect(Reflect.get(game, "shell")).toBeNull();
    expect(useGameStore.getState().canControl).toBe(false);
    expect(useCampaignStore.getState().completedIds).toEqual([]);
  });

  it("full progress reset clears campaign, XP and upgrade levels", () => {
    useCampaignStore.getState().complete("alpha-01");
    game.resetProgress();
    expect(useCampaignStore.getState().completedIds).toEqual([]);
    expect(useGameStore.getState().profiles).toEqual({
      P1: { xp: 0, levels: {} },
      P2: { xp: 0, levels: {} },
    });
  });

  it("builds the selected real sector, retains it on rematch and resets it for quick battles", () => {
    useCampaignStore.getState().complete("alpha-01");
    expect(game.startCampaign("forge-17")).toBe(true);
    expect(useGameStore.getState().sector.id).toBe("forge-17");
    expect(Reflect.get(game, "terrain").build).toHaveBeenLastCalledWith(
      1280,
      720,
      expect.any(Number),
      sectorById("forge-17"),
    );
    game.restart();
    expect(useGameStore.getState().sector.id).toBe("forge-17");
    endBattle("P1");
    expect(useCampaignStore.getState().completedIds).toEqual(["alpha-01", "forge-17"]);
    expect(useGameStore.getState().campaignNewRoutes).toEqual(["vanguard-12"]);
    endBattle("P1");
    expect(useGameStore.getState().campaignNewRoutes).toEqual([]);
    game.startOffline();
    expect(useGameStore.getState().sector.id).toBe("alpha-01");
  });

  it.each(["P2", null] as const)("does not complete a selected new sector after loss/draw: %s", (winner) => {
    useCampaignStore.getState().complete("alpha-01");
    game.startCampaign("delta-08");
    endBattle(winner);
    expect(useGameStore.getState().sector.id).toBe("delta-08");
    expect(useCampaignStore.getState().completedIds).toEqual(["alpha-01"]);
  });

  it("rejects a locked campaign operation without starting a match", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(game.startCampaign("prime-00")).toBe(false);
    expect(useGameStore.getState().sector.id).toBe("alpha-01");
  });

  it("preserves a campaign selected before the terrain is initialized", () => {
    useCampaignStore.getState().complete("alpha-01");
    const terrain = Reflect.get(game, "terrain");
    Reflect.set(game, "terrain", null);
    expect(game.startCampaign("delta-08")).toBe(true);
    Reflect.set(game, "terrain", terrain);
    game.restart();
    expect(useGameStore.getState()).toMatchObject({
      sector: sectorById("delta-08"),
      matchMode: "campaign",
      aiActive: true,
    });
  });

  it("resets the sector for online battles without changing campaign progress", () => {
    useCampaignStore.getState().complete("alpha-01");
    game.startCampaign("forge-17");
    game.startMultiplayer({ seed: 42, starterIndex: 0 }, useGameStore.getState().profiles, 0);
    expect(useGameStore.getState().sector.id).toBe("alpha-01");
    expect(useGameStore.getState().aiActive).toBe(false);
    expect(useCampaignStore.getState().completedIds).toEqual(["alpha-01"]);
  });
});
