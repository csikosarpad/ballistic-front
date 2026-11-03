import { useState } from "react";
import { useGameStore } from "@/game/state/gameStore";
import { MAX_NAME_LENGTH, usePlayerNamesStore } from "@/game/state/playerNames";
import { AUDIO_CHANNELS, useAudioSettings } from "@/game/state/audioSettings";
import type { MatchSetup } from "@/game/systems/seededRandom";
import type { Profile } from "@/game/systems/upgrades";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { useT, type MessageKey } from "@/i18n";
import { gameRef } from "./gameRef";
import { LanguageSwitch } from "./LanguageSwitch";
import { MultiplayerLobby } from "./MultiplayerLobby";
import { requestLandscape } from "./orientation";

export function MainMenu() {
  const t = useT();
  const setScreen = useGameStore((s) => s.setScreen);
  const muted = useGameStore((s) => s.muted);
  const toggleMuted = useGameStore((s) => s.toggleMuted);
  const names = usePlayerNamesStore((s) => s.names);
  const setName = usePlayerNamesStore((s) => s.setName);
  const channels = useAudioSettings((s) => s.channels);
  const setChannel = useAudioSettings((s) => s.setChannel);
  const [showLobby, setShowLobby] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const start = () => {
    void requestLandscape();
    useMultiplayerStore.getState().leave();
    gameRef.current?.startOffline();
    setScreen("playing");
  };

  const startMultiplayer = (setup: MatchSetup, profiles: Record<string, Profile>, revision: number) => {
    void requestLandscape();
    gameRef.current?.startMultiplayer(setup, profiles, revision);
    setScreen("playing");
  };

  const reset = () => {
    if (window.confirm(t("menu.resetConfirm"))) gameRef.current?.resetProgress();
  };

  return (
    <div className="overlay main-menu-overlay">
      {showLobby ? (
        <MultiplayerLobby onBack={() => setShowLobby(false)} onStartMatch={startMultiplayer} />
      ) : showSettings ? (
        <div className="panel main-menu-panel">
          <header className="main-menu-header">
            <h1>{t("menu.settings")}</h1>
          </header>
          <section className="main-menu-settings" aria-label={t("menu.settings")}>
            <div className="main-menu-setting">
              <span>{t("menu.language")}</span>
              <LanguageSwitch />
            </div>
            <div className="main-menu-setting">
              <span>{t("menu.sound")}</span>
              <button className="btn secondary" aria-pressed={!muted} onClick={toggleMuted}>
                {t("hud.sound", { state: muted ? t("hud.soundOff") : t("hud.soundOn") })}
              </button>
            </div>
            <div className="main-menu-setting">
              <span>{t("menu.audioChannels")}</span>
              <div className="audio-channel-buttons">
                {AUDIO_CHANNELS.map((channel) => (
                  <button
                    key={channel}
                    className="btn secondary"
                    aria-pressed={channels[channel]}
                    onClick={() => setChannel(channel, !channels[channel])}
                  >
                    {t(`audio.${channel}` as MessageKey, {
                      state: channels[channel] ? t("hud.soundOn") : t("hud.soundOff"),
                    })}
                  </button>
                ))}
              </div>
            </div>
            <div className="main-menu-setting">
              <span>{t("menu.playerNames")}</span>
              <div className="player-name-fields">
                {["P1", "P2"].map((id) => (
                  <input
                    key={id}
                    maxLength={MAX_NAME_LENGTH}
                    placeholder={id}
                    aria-label={t("menu.playerName", { id })}
                    value={names[id] ?? ""}
                    onChange={(event) => setName(id, event.target.value)}
                  />
                ))}
              </div>
            </div>
          </section>
          <button className="btn secondary main-menu-back" onClick={() => setShowSettings(false)}>
            {t("lobby.back")}
          </button>
        </div>
      ) : (
        <div className="panel main-menu-panel">
          <header className="main-menu-header">
            <h1>{t("menu.title")}</h1>
            <p>{t("menu.tagline")}</p>
            <small>{t("menu.controls")}</small>
          </header>
          <nav className="main-menu-actions" aria-label={t("menu.title")}>
            <button className="btn main-menu-start" onClick={start}>
              {t("menu.start")}
            </button>
            <button className="btn secondary" onClick={() => setShowLobby(true)}>
              {t("menu.online")}
            </button>
            <button className="btn secondary" onClick={() => setShowSettings(true)}>
              {t("menu.settings")}
            </button>
            <button className="btn secondary" onClick={reset}>
              {t("menu.reset")}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
