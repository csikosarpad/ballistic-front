import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "@/game/state/gameStore";
import { useCampaignStore } from "@/game/state/campaignStore";
import { useAiSettings } from "@/game/state/aiSettings";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { CampaignMap } from "./CampaignMap";
import { MainMenu } from "./MainMenu";
import { ResultScreen } from "./ResultScreen";
import { Hud } from "./Hud";
import { gameRef } from "./gameRef";
import { TRAINING_SECTOR, sectorById } from "@/game/data/sectors";

vi.mock("./gameRef", () => ({
  gameRef: { current: { startCampaign: vi.fn(() => true), leaveBattle: vi.fn(), restart: vi.fn() } },
}));
vi.mock("./result/ResultDecorCanvas", () => ({ ResultDecorCanvas: () => null }));

describe("Campaign Map UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCampaignStore.getState().reset();
    useMultiplayerStore.getState().leave();
    useAiSettings.getState().setEnabled(false);
    useGameStore.setState({
      screen: "menu",
      matchMode: "skirmish",
      aiActive: false,
      winner: null,
      phase: "aiming",
      tanks: [],
      matchSequence: 0,
      profiles: {},
      matchStats: {},
      sector: TRAINING_SECTOR,
      campaignNewRoutes: [],
    });
  });

  it("opens the map from the menu and leaves any existing battle", () => {
    render(<MainMenu />);
    expect(screen.getByText("Teljesítve: 0 / 5")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Műveleti térkép" }));
    expect(gameRef.current?.leaveBattle).toHaveBeenCalledOnce();
    expect(useGameStore.getState().screen).toBe("campaignMap");
  });

  it("deploys only the real ALPHA-01 operation without changing quick-battle AI settings", () => {
    render(<CampaignMap />);
    expect(screen.getByRole("button", { name: /SECTOR ALPHA-01, Training Grounds, Elérhető/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Művelet indítása" }));
    expect(gameRef.current?.startCampaign).toHaveBeenCalledOnce();
    expect(gameRef.current?.startCampaign).toHaveBeenCalledWith("alpha-01");
    expect(useGameStore.getState().screen).toBe("playing");
    expect(useAiSettings.getState().enabled).toBe(false);
  });

  it("shows 1/5 and replay after completion, and resets with confirmation only", () => {
    useCampaignStore.getState().complete("alpha-01");
    render(<CampaignMap />);
    expect(screen.getByText("Teljesítve: 1 / 5")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /SECTOR ALPHA-01,/ }));
    expect(screen.getByRole("button", { name: "Művelet újrajátszása" })).toBeEnabled();
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole("button", { name: "Kampányhaladás törlése" }));
    expect(useCampaignStore.getState().completedIds).toEqual(["alpha-01"]);
    fireEvent.click(screen.getByRole("button", { name: "Kampányhaladás törlése" }));
    expect(useCampaignStore.getState().completedIds).toEqual([]);
    confirm.mockRestore();
  });

  it("blocks launch and displays a load error", () => {
    useCampaignStore.setState({ error: "campaign.loadError" });
    render(<CampaignMap />);
    expect(screen.getByRole("alert")).toHaveTextContent("kampánymentés");
    expect(screen.getByRole("button", { name: "Művelet indítása" })).toBeDisabled();
  });

  it.each(["P1", "P2", null])("returns from campaign results without granting progress in React: %s", (winner) => {
    useGameStore.setState({ matchMode: "campaign", aiActive: true, phase: "gameOver", winner });
    const { rerender } = render(<ResultScreen />);
    rerender(<ResultScreen />);
    expect(useCampaignStore.getState().completedIds).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Műveleti térkép" }));
    expect(gameRef.current?.leaveBattle).toHaveBeenCalledOnce();
    expect(useGameStore.getState().screen).toBe("campaignMap");
  });

  it("allows abandoning a campaign battle only after confirmation", () => {
    useGameStore.setState({ screen: "playing", matchMode: "campaign" });
    render(<Hud />);
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole("button", { name: "Vissza a térképre" }));
    expect(useGameStore.getState().screen).toBe("playing");
    fireEvent.click(screen.getByRole("button", { name: "Vissza a térképre" }));
    expect(useGameStore.getState().screen).toBe("campaignMap");
    expect(useCampaignStore.getState().completedIds).toEqual([]);
    confirm.mockRestore();
  });

  it("surfaces unsaved progress on the map", () => {
    render(<CampaignMap />);
    act(() => useCampaignStore.setState({ completedIds: ["alpha-01"], error: "campaign.saveError" }));
    expect(screen.getByRole("alert")).toHaveTextContent("mentése sikertelen");
  });

  it("allows inspection but not launch of locked sectors", () => {
    render(<CampaignMap />);
    fireEvent.click(screen.getByRole("button", { name: /SECTOR PRIME-00,/ }));
    expect(screen.getByRole("heading", { name: "Capital Perimeter" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Művelet indítása" })).toBeDisabled();
    expect(useCampaignStore.getState().selectedId).toBe("alpha-01");
  });

  it("launches an unlocked branch and persists its operation in the main menu", () => {
    useCampaignStore.getState().complete("alpha-01");
    const { unmount } = render(<CampaignMap />);
    fireEvent.click(screen.getByRole("button", { name: /SECTOR FORGE-17,/ }));
    expect(useCampaignStore.getState().selectedId).toBe("forge-17");
    fireEvent.click(screen.getByRole("button", { name: "Művelet indítása" }));
    expect(gameRef.current?.startCampaign).toHaveBeenCalledWith("forge-17");
    unmount();
    render(<MainMenu />);
    expect(screen.getByText("Industrial Expanse")).toBeInTheDocument();
  });

  it("shows real new routes on results, never grants completion from rendering", () => {
    useGameStore.setState({
      matchMode: "campaign",
      phase: "gameOver",
      winner: "P1",
      sector: sectorById("forge-17"),
      campaignNewRoutes: ["vanguard-12"],
    });
    const { rerender } = render(<ResultScreen />);
    expect(screen.getByText("Új útvonal elérhető: Defense Grid")).toBeInTheDocument();
    act(() => useGameStore.setState({ campaignNewRoutes: [] }));
    rerender(<ResultScreen />);
    expect(screen.queryByText(/Új útvonal elérhető/)).not.toBeInTheDocument();
    expect(useCampaignStore.getState().completedIds).toEqual([]);
  });

  it("keeps the skipped branch available after PRIME completes the operation at 4/5", () => {
    const store = useCampaignStore.getState();
    ["alpha-01", "delta-08", "vanguard-12", "prime-00"].forEach((id) => store.complete(sectorById(id).id));
    render(<CampaignMap />);
    expect(screen.getByText("Teljesítve: 4 / 5")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("művelet teljesült");
    expect(screen.getByRole("button", { name: /SECTOR FORGE-17, Industrial Expanse, Elérhető/ })).toBeInTheDocument();
  });
});
