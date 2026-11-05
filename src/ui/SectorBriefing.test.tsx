import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TRAINING_SECTOR, sectorById } from "@/game/data/sectors";
import { useGameStore } from "@/game/state/gameStore";
import { useLocaleStore } from "@/i18n";
import { Hud } from "./Hud";
import { SectorBriefing, SECTOR_BRIEFING_DURATION_MS } from "./SectorBriefing";

describe("Sector briefing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useLocaleStore.getState().setLocale("hu");
    useGameStore.setState({ matchSequence: 0, phase: "aiming", tanks: [], canControl: true, sector: TRAINING_SECTOR });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    useLocaleStore.getState().setLocale("hu");
    useGameStore.setState({ matchSequence: 0 });
  });

  it("2,5 másodpercig mutatja az alap szektort", () => {
    expect(SECTOR_BRIEFING_DURATION_MS).toBe(2500);
    render(<SectorBriefing />);
    expect(screen.getByRole("status", { name: "Szektor eligazítás" })).toHaveTextContent("SECTOR BRIEFING");
    expect(screen.getByText(TRAINING_SECTOR.code)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: TRAINING_SECTOR.name })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2499));
    expect(screen.getByRole("status", { name: "Szektor eligazítás" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("status", { name: "Szektor eligazítás" })).not.toBeInTheDocument();
  });

  it("a nyelvváltás nem indítja újra az időzítőt; a szektornév nem változik", () => {
    render(<SectorBriefing />);
    act(() => {
      vi.advanceTimersByTime(1000);
      useLocaleStore.getState().setLocale("de");
    });
    expect(screen.getByRole("status", { name: "Sektoreinweisung" })).toHaveTextContent("Übungsgelände");
    expect(screen.getByRole("heading", { name: TRAINING_SECTOR.name })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("unmountkor eltakarítja a saját időzítőjét", () => {
    const before = vi.getTimerCount();
    const { unmount } = render(<SectorBriefing />);
    expect(vi.getTimerCount()).toBe(before + 1);
    unmount();
    expect(vi.getTimerCount()).toBe(before);
  });

  it("uses the selected battle's briefing rather than the training text", () => {
    useGameStore.setState({ sector: sectorById("delta-08") });
    render(<SectorBriefing />);
    expect(screen.getByRole("heading", { name: "Crystal Basin" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Mély központi medence");
  });

  it("csak elkészült meccsnél jelenik meg, új meccsnél megismétlődik, körváltáskor nem", () => {
    render(<Hud />);
    expect(screen.queryByRole("status", { name: "Szektor eligazítás" })).not.toBeInTheDocument();
    act(() => useGameStore.getState().sync({ matchSequence: 1 }));
    expect(screen.getByRole("status", { name: "Szektor eligazítás" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2500));
    act(() => useGameStore.getState().sync({ currentId: "P2", wind: 35, phase: "flying" }));
    expect(screen.queryByRole("status", { name: "Szektor eligazítás" })).not.toBeInTheDocument();
    expect(screen.getByText(TRAINING_SECTOR.name)).toBeInTheDocument();
    act(() => useGameStore.getState().sync({ matchSequence: 2, phase: "aiming" }));
    expect(screen.getByRole("status", { name: "Szektor eligazítás" })).toBeInTheDocument();
    expect(useGameStore.getState().canControl).toBe(true);
  });
});
