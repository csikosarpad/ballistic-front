import { useState } from "react";
import { useGameStore } from "@/game/state/gameStore";
import type { MatchSetup } from "@/game/systems/seededRandom";
import type { Profile } from "@/game/systems/upgrades";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { gameRef } from "./gameRef";
import { MultiplayerLobby } from "./MultiplayerLobby";

export function MainMenu() {
  const setScreen = useGameStore((s) => s.setScreen);
  const [showLobby, setShowLobby] = useState(false);

  const start = () => {
    useMultiplayerStore.getState().leave();
    gameRef.current?.startOffline();
    setScreen("playing");
  };

  const startMultiplayer = (setup: MatchSetup, profiles: Record<string, Profile>, revision: number) => {
    gameRef.current?.startMultiplayer(setup, profiles, revision);
    setScreen("playing");
  };

  const reset = () => {
    if (window.confirm("Biztosan törlöd az összes XP-t és fejlesztést?")) gameRef.current?.resetProgress();
  };

  return (
    <div className="overlay">
      {showLobby ? (
        <MultiplayerLobby onBack={() => setShowLobby(false)} onStartMatch={startMultiplayer} />
      ) : (
        <div className="panel">
          <h1>Ballistic Front</h1>
          <p>Két játékos, egy gép. Lődd ki az ellenfeled tankját!</p>
          <p>
            <small>◀ ▶ mozgás · csúszkák: szög és erő · szóköz: tűz</small>
          </p>
          <button className="btn" onClick={start}>
            Játék indítása
          </button>
          <br />
          <button className="btn secondary" onClick={() => setShowLobby(true)}>
            Online játék
          </button>
          <br />
          <button className="btn secondary" onClick={reset}>
            Haladás törlése
          </button>
        </div>
      )}
    </div>
  );
}
