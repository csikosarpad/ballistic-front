import { useState } from "react";
import { useGameStore } from "@/game/state/gameStore";
import type { MatchSetup } from "@/game/systems/seededRandom";
import type { Profile } from "@/game/systems/upgrades";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { useT } from "@/i18n";
import { gameRef } from "./gameRef";
import { LanguageSwitch } from "./LanguageSwitch";
import { MultiplayerLobby } from "./MultiplayerLobby";

export function MainMenu() {
  const t = useT();
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
    if (window.confirm(t("menu.resetConfirm"))) gameRef.current?.resetProgress();
  };

  return (
    <div className="overlay">
      {showLobby ? (
        <MultiplayerLobby onBack={() => setShowLobby(false)} onStartMatch={startMultiplayer} />
      ) : (
        <div className="panel">
          <h1>{t("menu.title")}</h1>
          <p>{t("menu.tagline")}</p>
          <p>
            <small>{t("menu.controls")}</small>
          </p>
          <button className="btn" onClick={start}>
            {t("menu.start")}
          </button>
          <br />
          <button className="btn secondary" onClick={() => setShowLobby(true)}>
            {t("menu.online")}
          </button>
          <br />
          <button className="btn secondary" onClick={reset}>
            {t("menu.reset")}
          </button>
          <LanguageSwitch />
        </div>
      )}
    </div>
  );
}
