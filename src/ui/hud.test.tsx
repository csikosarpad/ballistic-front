import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Game } from "@/game/engine/Game";
import { useGameStore } from "@/game/state/gameStore";
import { gameRef } from "./gameRef";
import { Hud } from "./Hud";

const power = () => useGameStore.getState().power;
const angle = () => useGameStore.getState().angle;

describe("Hud billentyűk", () => {
  beforeEach(() => {
    useGameStore.setState({ phase: "aiming", power: 400, maxPower: 600, angle: 45, currentId: "P1", tanks: [] });
    render(<Hud />);
  });

  it("fel/le nyíl 10-zel változtatja az erőt, Shift-tel 50-nel", () => {
    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(power()).toBe(410);
    fireEvent.keyDown(window, { key: "ArrowDown", shiftKey: true });
    expect(power()).toBe(360);
  });

  it("az erő a [100, maxPower] tartományban marad", () => {
    act(() => useGameStore.setState({ power: 590 }));
    fireEvent.keyDown(window, { key: "ArrowUp", shiftKey: true });
    expect(power()).toBe(600);
    act(() => useGameStore.setState({ power: 120 }));
    fireEvent.keyDown(window, { key: "ArrowDown", shiftKey: true });
    expect(power()).toBe(100);
  });

  it("lövés közben nem változik az erő", () => {
    act(() => useGameStore.setState({ phase: "flying" }));
    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(power()).toBe(400);
  });

  it("Ctrl+bal/jobb a szöget állítja, és nem mozgatja a tankot", () => {
    const move = vi.fn();
    gameRef.current = { move } as unknown as Game;
    fireEvent.keyDown(window, { key: "ArrowLeft", ctrlKey: true });
    expect(angle()).toBe(46);
    fireEvent.keyDown(window, { key: "ArrowRight", ctrlKey: true, shiftKey: true });
    expect(angle()).toBe(41);
    expect(move).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(move).toHaveBeenCalledWith(-1);
    expect(angle()).toBe(41);
  });

  it("a T billentyű röppálya-előnézetet kér, ha még elérhető", () => {
    const requestPreview = vi.fn();
    gameRef.current = { requestPreview } as unknown as Game;
    fireEvent.keyDown(window, { key: "t" });
    expect(requestPreview).toHaveBeenCalledOnce();
  });

  it("az elhasznált előnézet gombja tiltott", () => {
    act(() => useGameStore.setState({ previewAvailable: false }));
    expect(screen.getByRole("button", { name: /elhasználva/i })).toBeDisabled();
  });

  it("a szög a [0, 180] tartományban marad", () => {
    act(() => useGameStore.setState({ angle: 2 }));
    fireEvent.keyDown(window, { key: "ArrowRight", ctrlKey: true, shiftKey: true });
    expect(angle()).toBe(0);
    act(() => useGameStore.setState({ angle: 178 }));
    fireEvent.keyDown(window, { key: "ArrowLeft", ctrlKey: true, shiftKey: true });
    expect(angle()).toBe(180);
  });
});
