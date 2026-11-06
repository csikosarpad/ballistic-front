import { useState } from "react";
import { useGameStore } from "@/game/state/gameStore";
import type { MatchSetup } from "@/game/systems/seededRandom";
import type { Profile } from "@/game/systems/upgrades";
import { gameRef } from "../gameRef";
import { requestLandscape } from "../orientation";
import { MainMenuHome } from "./MainMenuHome";
import { MainMenuSettings } from "./MainMenuSettings";
import { MenuCredits } from "./MenuCredits";
import { MultiplayerLobby } from "./MultiplayerLobby";

type MenuView = "home" | "settings" | "lobby";

export function MainMenu() {
  const [view, setView] = useState<MenuView>("home");

  const startMultiplayer = (setup: MatchSetup, profiles: Record<string, Profile>, revision: number) => {
    void requestLandscape();
    gameRef.current?.startMultiplayer(setup, profiles, revision);
    useGameStore.getState().setScreen("playing");
  };

  return (
    <div className="overlay main-menu-overlay">
      {view === "lobby" ? (
        <MultiplayerLobby onBack={() => setView("home")} onStartMatch={startMultiplayer} />
      ) : view === "settings" ? (
        <MainMenuSettings onBack={() => setView("home")} />
      ) : (
        <MainMenuHome onShowLobby={() => setView("lobby")} onShowSettings={() => setView("settings")} />
      )}
      {view === "home" && <MenuCredits />}
    </div>
  );
}
