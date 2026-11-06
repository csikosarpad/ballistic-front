import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Game } from "./Game";
import { TerrainMask } from "../terrain/mask";
import { useGameStore } from "../state/gameStore";
import { useCampaignStore } from "../state/campaignStore";
import { useAiSettings } from "../state/aiSettings";
import { useMultiplayerStore } from "../state/multiplayerStore";
import { tankContains, type Tank } from "../entities/tank";
import { TRAINING_SECTOR, sectorById } from "../data/sectors";
import { loadProfiles, saveProfiles } from "../systems/profileStorage";

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

  it.each([-60, 0, 60])("fires an actual direct hit with AI assistance in wind %s", (wind) => {
    game.startCampaign();
    game.restart({ seed: 42, starterIndex: 1 });
    const tanks: Tank[] = Reflect.get(game, "tanks");
    const target = tanks[0]!;
    const shooter = tanks[1]!;
    target.x = 120;
    shooter.x = 450;
    useGameStore.setState({ wind });
    vi.spyOn(Math, "random").mockReturnValue(0);
    Reflect.get(game, "aiAimAndFire").call(game);
    expect(useGameStore.getState()).toMatchObject({ previewActive: true, previewRemaining: 0 });
    vi.advanceTimersByTime(700);
    expect(useGameStore.getState().phase).toBe("flying");
    for (let i = 0; i < 900 && Reflect.get(game, "shell"); i++) {
      Reflect.get(game, "stepShell").call(game);
    }
    const [impactX, impactY] = Reflect.get(game, "terrain").carve.mock.calls[0];
    expect(tankContains(target, impactX, impactY)).toBe(true);
    expect(target.hp).toBeLessThan(100);
    expect(shooter.hp).toBe(100);
  });

  it("does not consume AI assistance when no direct hit is possible", () => {
    game.startCampaign();
    game.restart({ seed: 42, starterIndex: 1 });
    const tanks: Tank[] = Reflect.get(game, "tanks");
    tanks[1]!.stats = { ...tanks[1]!.stats, maxPower: 100 };
    useGameStore.setState({ wind: 0 });
    vi.spyOn(Math, "random").mockReturnValue(0);
    Reflect.get(game, "aiAimAndFire").call(game);
    expect(useGameStore.getState()).toMatchObject({ previewActive: false, previewRemaining: 1 });
    vi.advanceTimersByTime(700);
    expect(useGameStore.getState().phase).toBe("flying");
  });

  it.each(["skirmish", "campaign"] as const)("consumes only one preview charge while already active: %s", (mode) => {
    game.startOffline(mode);
    game.restart({ seed: 42, starterIndex: 0 });
    Reflect.get(game, "previewAllowance").reset({ P1: 3, P2: 3 });
    game.requestPreview();
    expect(useGameStore.getState()).toMatchObject({
      previewActive: true, previewAvailable: false, previewRemaining: 2,
    });
    for (let i = 0; i < 10; i++) game.requestPreview();
    expect(useGameStore.getState().previewRemaining).toBe(2);
    Reflect.get(game, "beginTurn").call(game);
    expect(useGameStore.getState()).toMatchObject({ previewActive: false, previewAvailable: true });
    game.requestPreview();
    expect(useGameStore.getState().previewRemaining).toBe(1);
    Reflect.get(game, "beginTurn").call(game);
    game.requestPreview();
    game.requestPreview();
    expect(useGameStore.getState()).toMatchObject({ previewActive: true, previewRemaining: 0 });
    Reflect.get(game, "beginTurn").call(game);
    game.requestPreview();
    expect(useGameStore.getState()).toMatchObject({ previewActive: false, previewAvailable: false, previewRemaining: 0 });
  });

  it.each(["skirmish", "campaign"] as const)("keeps purchased preview charges available across real shots: %s", (mode) => {
    game.startOffline(mode);
    endBattle("P1");
    Reflect.get(game, "profiles").P1.xp = 1000;
    for (let i = 0; i < 3; i++) game.buy("P1", "smartAim");
    expect(useGameStore.getState().profiles.P1?.levels.smartAim).toBe(3);
    game.restart({ seed: 42, starterIndex: 0 });
    const tanks: Tank[] = Reflect.get(game, "tanks");
    tanks.forEach((tank) => { tank.hp = 1000; });
    expect(useGameStore.getState().previewRemaining).toBe(4);
    for (let remaining = 3; remaining >= 0; remaining--) {
      expect(useGameStore.getState()).toMatchObject({
        currentId: "P1", previewActive: false, previewAvailable: true,
      });
      game.requestPreview();
      game.requestPreview();
      expect(useGameStore.getState()).toMatchObject({ previewActive: true, previewRemaining: remaining });
      game.fire();
      Reflect.get(game, "explode").call(game, 640, 100);
      Reflect.get(game, "launchShot").call(game, 135, 400);
      Reflect.get(game, "explode").call(game, 640, 100);
    }
    expect(useGameStore.getState()).toMatchObject({
      currentId: "P1", previewActive: false, previewAvailable: false, previewRemaining: 0,
    });
  });

  it("destroys its renderer without releasing resources shared with other Pixi canvases", () => {
    const destroy = vi.fn();
    Reflect.set(game, "app", { renderer: {}, destroy });
    game.destroy();
    expect(destroy).toHaveBeenCalledWith({ removeView: true }, { children: true });
  });

  it.each(["skirmish", "campaign"] as const)("discards unfinished XP but preserves earlier progress: %s", (mode) => {
    const profiles = { P1: { xp: 120, levels: { armor: 1 } }, P2: { xp: 80, levels: {} } };
    Reflect.set(game, "profiles", structuredClone(profiles));
    saveProfiles(profiles);
    game.startOffline(mode);
    Reflect.get(game, "award").call(game, "P1", 25);
    Reflect.get(game, "award").call(game, "P2", 10);
    expect(Reflect.get(game, "profiles").P1.xp).toBe(145);
    expect(loadProfiles(["P1", "P2"])).toEqual(profiles);
    game.leaveBattle();
    game.leaveBattle();
    expect(useGameStore.getState().profiles).toEqual(profiles);
    expect(useGameStore.getState().matchStats.P1?.xp).toBe(0);
    expect(useCampaignStore.getState().completedIds).toEqual([]);
    game.startCampaign();
    expect(useGameStore.getState().profiles).toEqual(profiles);
  });

  it("retains completed match XP when returning to the menu", () => {
    game.startCampaign();
    endBattle("P1");
    const completed = loadProfiles(["P1", "P2"]);
    expect(useGameStore.getState().matchStats.P1?.xp).toBeGreaterThanOrEqual(50);
    game.leaveBattle();
    expect(useGameStore.getState().profiles).toEqual(completed);
    expect(useCampaignStore.getState().completedIds).toContain("alpha-01");
  });

  it("does not carry provisional XP into a restarted match", () => {
    game.startOffline();
    const before = structuredClone(Reflect.get(game, "profiles"));
    Reflect.get(game, "award").call(game, "P1", 25);
    game.restart();
    expect(Reflect.get(game, "profiles")).toEqual(before);
    expect(useGameStore.getState().matchStats.P1?.xp).toBe(0);
  });

  it("keeps the existing immediate XP persistence for online matches", () => {
    game.startMultiplayer(
      { seed: 42, starterIndex: 0 },
      { P1: { xp: 100, levels: {} }, P2: { xp: 100, levels: {} } },
      0,
    );
    Reflect.get(game, "award").call(game, "P1", 25);
    expect(loadProfiles(["P1"]).P1?.xp).toBe(125);
    game.leaveBattle();
    expect(useGameStore.getState().profiles.P1?.xp).toBe(125);
  });

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
