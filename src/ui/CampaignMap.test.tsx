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

vi.mock("./gameRef", () => ({
  gameRef: { current: { startCampaign: vi.fn(), leaveBattle: vi.fn(), restart: vi.fn() } },
}));
vi.mock("./result/ResultDecorCanvas", () => ({ ResultDecorCanvas: () => null }));

describe("Campaign Map Foundation UI", () => {
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
    });
  });

  it("opens the map from the menu and leaves any existing battle", () => {
    render(<MainMenu />);
    expect(screen.getByText("Teljesítve: 0 / 1")).toBeInTheDocument();
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
    expect(useGameStore.getState().screen).toBe("playing");
    expect(useAiSettings.getState().enabled).toBe(false);
  });

  it("shows 1/1 and replay after completion, and resets with confirmation only", () => {
    useCampaignStore.getState().complete();
    render(<CampaignMap />);
    expect(screen.getByText("Teljesítve: 1 / 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Művelet újrajátszása" })).toBeEnabled();
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole("button", { name: "Kampányhaladás törlése" }));
    expect(useCampaignStore.getState().completed).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Kampányhaladás törlése" }));
    expect(useCampaignStore.getState().completed).toBe(false);
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
    expect(useCampaignStore.getState().completed).toBe(false);
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
    expect(useCampaignStore.getState().completed).toBe(false);
    confirm.mockRestore();
  });

  it("surfaces unsaved progress on the map", () => {
    render(<CampaignMap />);
    act(() => useCampaignStore.setState({ completed: true, error: "campaign.saveError" }));
    expect(screen.getByRole("alert")).toHaveTextContent("mentése sikertelen");
  });
});
