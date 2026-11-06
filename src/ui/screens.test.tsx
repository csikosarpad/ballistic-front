import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Game } from "@/game/engine/Game";
import { useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { useAudioSettings } from "@/game/state/audioSettings";
import { useCampaignStore } from "@/game/state/campaignStore";
import { gameRef } from "./gameRef";
import { MainMenu } from "./MainMenu";
import { ResultScreen } from "./ResultScreen";

const mockGame = (overrides: Partial<Record<keyof Game, unknown>>) => {
  gameRef.current = { leaveBattle: vi.fn(), ...overrides } as unknown as Game;
};

describe("MainMenu", () => {
  beforeEach(() => {
    useGameStore.setState({ screen: "menu", muted: false, matchMode: "skirmish", aiActive: false });
    useMultiplayerStore.getState().leave();
    useCampaignStore.getState().reset();
    useAudioSettings.setState({ channels: { music: true, voice: true, effects: true }, volume: 1, error: null });
  });

  it("a játékcím alatt a jelenlegi harctér azonosítója és neve szerepel", () => {
    const { container } = render(<MainMenu />);
    const header = container.querySelector(".main-menu-header");
    expect(header).toHaveTextContent("Solvyr Prime: Siege Protocol");
    expect(header).toHaveTextContent("SECTOR ALPHA-01");
    expect(header).toHaveTextContent("Training Grounds");
    expect(header?.children[1]).toHaveClass("menu-sector");
  });

  it("a nyelvváltó angolra állítja a menüt, majd vissza magyarra", () => {
    render(<MainMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Beállítások" }));
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "Start game" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play online" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Magyar" }));
    fireEvent.click(screen.getByRole("button", { name: "Vissza" }));
    expect(screen.getByRole("button", { name: "Játék indítása" })).toBeInTheDocument();
  });

  it("a stáblista csak a nyitóképernyőn jelenik meg", () => {
    render(<MainMenu />);
    expect(screen.getByRole("complementary", { name: "Köszönet" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Beállítások" }));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Vissza" }));
    expect(screen.getByRole("complementary", { name: "Köszönet" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Online játék" }));
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("a beállításokból módosítható és visszajelzett a hang állapota", () => {
    render(<MainMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Beállítások" }));

    const soundButton = screen.getByRole("button", { name: "Hang: be (M)" });
    expect(soundButton).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(soundButton);

    expect(useGameStore.getState().muted).toBe(true);
    expect(screen.getByRole("button", { name: "Hang: ki (M)" })).toHaveAttribute("aria-pressed", "false");
  });

  it("az online játék gomb megnyitja a szobalobbyt", () => {
    render(<MainMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Online játék" }));
    expect(screen.getByRole("heading", { name: "Online multiplayer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Szoba létrehozása" })).toBeInTheDocument();
  });

  it("a hangerőcsúszka ment és némítva is állítható a némítás feloldása nélkül", () => {
    render(<MainMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Beállítások" }));
    const slider = screen.getByRole("slider", { name: "Játék hangereje" });
    expect(slider).toHaveValue("100");
    fireEvent.change(slider, { target: { value: "35" } });
    expect(slider).toHaveAttribute("aria-valuetext", "35%");
    expect(screen.getByText("35%")).toBeInTheDocument();
    expect(useAudioSettings.getState().volume).toBe(0.35);
    expect(JSON.parse(localStorage.getItem("ballistic-front:audio-settings")!).volume).toBe(0.35);
    fireEvent.click(screen.getByRole("button", { name: "Hang: be (M)" }));
    fireEvent.change(slider, { target: { value: "0" } });
    expect(useGameStore.getState().muted).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Hang: ki (M)" }));
    expect(slider).toHaveValue("0");
    expect(useAudioSettings.getState().volume).toBe(0);
  });

  it("megjeleníti a hangbeállítások mentési hibáját", () => {
    useAudioSettings.setState({ error: "audio.saveError" });
    render(<MainMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Beállítások" }));
    expect(screen.getByRole("alert")).toHaveTextContent("A hangbeállítások mentése sikertelen");
  });

  it("a match_started esemény mindkét klienst a közös meccsbe lépteti", () => {
    const startMultiplayer = vi.fn();
    mockGame({ startMultiplayer });
    useMultiplayerStore.setState({
      credentials: { roomCode: "AB12CD", playerId: "P2", token: "secret" },
      session: {
        code: "AB12CD",
        status: "playing",
        revision: 2,
        setup: { seed: 42, starterIndex: 0 },
        players: { P1: "Ada", P2: "Grace" },
      },
      events: [
        {
          revision: 2,
          playerId: "P1",
          type: "match_started",
          payload: { profiles: { P1: { xp: 0, levels: {} }, P2: { xp: 0, levels: {} } } },
          createdAt: "2026-10-12T00:00:00Z",
        },
      ],
    });

    render(<MainMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Online játék" }));

    expect(startMultiplayer).toHaveBeenCalledWith(
      { seed: 42, starterIndex: 0 },
      { P1: { xp: 0, levels: {} }, P2: { xp: 0, levels: {} } },
      2,
    );
    expect(useGameStore.getState().screen).toBe("playing");
  });

  it("az indítás gomb új meccset kezd és átvált a játékra", () => {
    const startOffline = vi.fn();
    mockGame({ startOffline });
    render(<MainMenu />);
    fireEvent.click(screen.getByRole("button", { name: /indítása/i }));
    expect(startOffline).toHaveBeenCalledOnce();
    expect(useGameStore.getState().screen).toBe("playing");
  });

  it("a haladás törlése csak megerősítés után fut le", () => {
    const resetProgress = vi.fn();
    mockGame({ resetProgress });
    const confirm = vi.spyOn(window, "confirm");
    render(<MainMenu />);

    confirm.mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole("button", { name: /mentés törlése/i }));
    expect(resetProgress).not.toHaveBeenCalled();

    confirm.mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole("button", { name: /mentés törlése/i }));
    expect(resetProgress).toHaveBeenCalledOnce();
  });
});

describe("ResultScreen", () => {
  beforeEach(() => {
    useMultiplayerStore.getState().leave();
    useGameStore.setState({
      screen: "playing",
      matchMode: "skirmish",
      aiActive: false,
      phase: "gameOver",
      winner: "P1",
      matchStats: { P1: { shots: 3, damage: 100, xp: 150 }, P2: { shots: 2, damage: 40, xp: 40 } },
      profiles: { P1: { xp: 150, levels: {} }, P2: { xp: 40, levels: {} } },
    });
  });

  it("megjeleníti a győztest és a statisztikát", () => {
    render(<ResultScreen />);
    expect(screen.getByText("P1 nyert!")).toBeInTheDocument();
    expect(screen.getByText("+150")).toBeInTheDocument();
  });

  it("a főmenü gomb visszavált a menüre", () => {
    render(<ResultScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Főmenü" }));
    expect(useGameStore.getState().screen).toBe("menu");
  });

  it("a visszavágó új meccset indít", () => {
    const restart = vi.fn();
    mockGame({ restart });
    render(<ResultScreen />);
    fireEvent.click(screen.getByRole("button", { name: "Visszavágó" }));
    expect(restart).toHaveBeenCalledOnce();
  });

  it("online eredménynél a host rematch gombja a backend lezárásáig tiltott", () => {
    useMultiplayerStore.setState({
      credentials: { roomCode: "AB12CD", playerId: "P1", token: "secret" },
    });
    render(<ResultScreen />);

    expect(screen.getByRole("button", { name: "Visszavágó" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Főmenü" }));

    expect(useMultiplayerStore.getState().credentials).toBeNull();
    expect(useGameStore.getState().screen).toBe("menu");
  });

  it("lezárt online meccs után a host új meccset indíthat és csak a saját tankját fejlesztheti", () => {
    const requestMultiplayerRematch = vi.fn();
    const buy = vi.fn();
    mockGame({ requestMultiplayerRematch, buy });
    useMultiplayerStore.setState({
      credentials: { roomCode: "AB12CD", playerId: "P1", token: "secret" },
      session: {
        code: "AB12CD",
        status: "finished",
        revision: 3,
        setup: { seed: 42, starterIndex: 0 },
        players: { P1: "Ada", P2: "Grace" },
      },
    });
    render(<ResultScreen />);

    expect(screen.getByRole("button", { name: "Visszavágó" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "P1: Páncél" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "P2: Páncél" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "P1: Páncél" }));
    expect(buy).toHaveBeenCalledWith("P1", "armor");
    fireEvent.click(screen.getByRole("button", { name: "Visszavágó" }));
    expect(requestMultiplayerRematch).toHaveBeenCalledOnce();
  });
});
