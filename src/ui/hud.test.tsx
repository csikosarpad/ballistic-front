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

  it("a HUD külön csíkot mutat a HP-nak, a pajzsnak és a páncélnak, ha vannak", () => {
    act(() =>
      useGameStore.setState({
        tanks: [
          {
            id: "P1",
            hp: 80,
            maxHp: 100,
            shield: 12,
            maxShield: 40,
            armor: 15,
            maxArmor: 60,
            moveLeft: 0,
            color: 0xffffff,
          },
          {
            id: "P2",
            hp: 100,
            maxHp: 100,
            shield: 0,
            maxShield: 0,
            armor: 0,
            maxArmor: 0,
            moveLeft: 0,
            color: 0xffffff,
          },
        ],
      }),
    );
    expect(screen.getByText("P1: 80/100 HP")).toBeInTheDocument();
    const meters = screen.getAllByRole("meter");
    // P1: HP + pajzs + páncél, P2: csak HP.
    expect(meters).toHaveLength(4);
    const shield = screen.getByRole("meter", { name: "Pajzs" });
    expect(shield).toHaveAttribute("aria-valuenow", "12");
    expect(shield).toHaveAttribute("aria-valuemax", "40");
    expect(screen.getByRole("meter", { name: "Páncél" })).toHaveAttribute("aria-valuetext", "15/60");
  });

  it("az M billentyű némítást kapcsol, lövés közben is", () => {
    act(() => useGameStore.setState({ muted: false, phase: "flying" }));
    fireEvent.keyDown(window, { key: "m" });
    expect(useGameStore.getState().muted).toBe(true);
    fireEvent.keyDown(window, { key: "M" });
    expect(useGameStore.getState().muted).toBe(false);
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
