import type { CSSProperties } from "react";
import { MAX_NAME_LENGTH, usePlayerNamesStore } from "@/game/state/playerNames";
import { AUDIO_CHANNELS, useAudioSettings } from "@/game/state/audioSettings";
import { useAiSettings } from "@/game/state/aiSettings";
import { useGameStore } from "@/game/state/gameStore";
import { useT, type MessageKey } from "@/i18n";
import { LanguageSwitch } from "./LanguageSwitch";

interface MainMenuSettingsProps {
  onBack: () => void;
}

export function MainMenuSettings({ onBack }: MainMenuSettingsProps) {
  const t = useT();
  const muted = useGameStore((s) => s.muted);
  const toggleMuted = useGameStore((s) => s.toggleMuted);
  const names = usePlayerNamesStore((s) => s.names);
  const setName = usePlayerNamesStore((s) => s.setName);
  const channels = useAudioSettings((s) => s.channels);
  const setChannel = useAudioSettings((s) => s.setChannel);
  const volume = useAudioSettings((s) => s.volume);
  const volumePercent = Math.round(volume * 100);
  const volumeStyle: CSSProperties & { "--volume-whiteness": string } = {
    "--volume-whiteness": `${Math.min(100, (volumePercent / 80) * 100)}%`,
  };
  const setVolume = useAudioSettings((s) => s.setVolume);
  const audioError = useAudioSettings((s) => s.error);
  const aiEnabled = useAiSettings((s) => s.enabled);
  const setAiEnabled = useAiSettings((s) => s.setEnabled);
  const aiMatches = useAiSettings((s) => s.memory.matches);
  const resetAiMemory = useAiSettings((s) => s.resetMemory);

  return (
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
          <label htmlFor="master-volume">{t("audio.volume")}</label>
          <div className="audio-volume-control">
            <input
              id="master-volume"
              type="range"
              min={0}
              max={100}
              step={1}
              value={volumePercent}
              aria-valuetext={`${volumePercent}%`}
              style={volumeStyle}
              data-volume-high={volumePercent >= 80}
              onChange={(event) => setVolume(Number(event.target.value) / 100)}
            />
            <output htmlFor="master-volume">{volumePercent}%</output>
          </div>
          {audioError && <small role="alert">{t(audioError)}</small>}
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
          <span>{t("menu.opponent")}</span>
          <div className="audio-channel-buttons">
            <button className="btn secondary" aria-pressed={aiEnabled} onClick={() => setAiEnabled(!aiEnabled)}>
              {aiEnabled ? t("menu.opponentAi") : t("menu.opponentHuman")}
            </button>
            {aiEnabled && (
              <button className="btn secondary" onClick={resetAiMemory} disabled={aiMatches === 0}>
                {t("menu.aiExperience", { matches: aiMatches })}
              </button>
            )}
          </div>
          <small>{t("menu.opponentHint")}</small>
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
      <button className="btn secondary main-menu-back" onClick={onBack}>
        {t("lobby.back")}
      </button>
    </div>
  );
}
