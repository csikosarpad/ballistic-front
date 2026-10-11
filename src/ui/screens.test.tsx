import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Game } from "@/game/engine/Game";
import { useGameStore } from "@/game/state/gameStore";
import { gameRef } from "./gameRef";
import { MainMenu } from "./MainMenu";
import { ResultScreen } from "./ResultScreen";

const mockGame = (overrides: Partial<Record<keyof Game, unknown>>) => {
  gameRef.current = overrides as unknown as Game;
};

describe("MainMenu", () => {
  beforeEach(() => useGameStore.setState({ screen: "menu" }));

  it("az indítás gomb új meccset kezd és átvált a játékra", () => {
    const restart = vi.fn();
    mockGame({ restart });
    render(<MainMenu />);
    fireEvent.click(screen.getByRole("button", { name: /indítása/i }));
    expect(restart).toHaveBeenCalledOnce();
    expect(useGameStore.getState().screen).toBe("playing");
  });

  it("a haladás törlése csak megerősítés után fut le", () => {
    const resetProgress = vi.fn();
    mockGame({ resetProgress });
    const confirm = vi.spyOn(window, "confirm");
    render(<MainMenu />);

    confirm.mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole("button", { name: /haladás/i }));
    expect(resetProgress).not.toHaveBeenCalled();

    confirm.mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole("button", { name: /haladás/i }));
    expect(resetProgress).toHaveBeenCalledOnce();
  });
});

describe("ResultScreen", () => {
  beforeEach(() => {
    useGameStore.setState({
      screen: "playing",
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
});
