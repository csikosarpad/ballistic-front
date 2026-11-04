import { useState } from "react";
import { TRAINING_SECTOR } from "@/game/data/sectors";
import { useCampaignStore } from "@/game/state/campaignStore";
import { useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { useT } from "@/i18n";
import { gameRef } from "./gameRef";
import { requestLandscape } from "./orientation";

export function CampaignMap() {
  const t = useT();
  const { completed, error, reset } = useCampaignStore();
  const setScreen = useGameStore((s) => s.setScreen);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(false);
  const start = () => {
    if (!gameRef.current) {
      setStartError(true);
      return;
    }
    setStarting(true);
    useMultiplayerStore.getState().leave();
    void requestLandscape();
    gameRef.current.startCampaign();
    setScreen("playing");
  };

  return (
    <div className="overlay campaign-overlay">
      <main className="panel campaign-panel">
        <header className="campaign-header">
          <div>
            <div className="sector-code">{t("campaign.operation")}</div>
            <h1>{t("campaign.title")}</h1>
          </div>
          <span className="campaign-progress">{t("campaign.progress", { value: completed ? 1 : 0, total: 1 })}</span>
        </header>
        <div className="campaign-layout">
          <section className="campaign-star-map" aria-label={t("campaign.title")}>
            <svg className="campaign-orbits" viewBox="0 0 600 360" aria-hidden="true">
              <ellipse cx="300" cy="180" rx="220" ry="110" />
              <ellipse cx="300" cy="180" rx="130" ry="65" />
              <path d="M80 180H520M300 40V320" />
              <circle cx="300" cy="180" r="38" />
            </svg>
            <button
              className={`campaign-node${completed ? " is-complete" : ""}`}
              aria-pressed="true"
              aria-label={`${TRAINING_SECTOR.code}, ${TRAINING_SECTOR.name}, ${t(completed ? "campaign.completed" : "campaign.available")}`}
            >
              <span className="campaign-node-symbol" aria-hidden="true">
                {completed ? "●" : "★"}
              </span>
              <span className="sector-code">{TRAINING_SECTOR.code}</span>
              <strong>{TRAINING_SECTOR.name}</strong>
            </button>
            <p className="campaign-map-note">{t("campaign.foundation")}</p>
          </section>
          <section className="campaign-sector-card" aria-labelledby="campaign-sector-name">
            <div className="sector-code">{TRAINING_SECTOR.code}</div>
            <h2 id="campaign-sector-name">{TRAINING_SECTOR.name}</h2>
            <p>{t("sector.trainingBrief")}</p>
            <dl>
              <div>
                <dt>{t("campaign.status")}</dt>
                <dd>{t(completed ? "campaign.completed" : "campaign.available")}</dd>
              </div>
              <div>
                <dt>{t("menu.opponent")}</dt>
                <dd>{t("campaign.opponent")}</dd>
              </div>
              <div>
                <dt>{t("campaign.rules")}</dt>
                <dd>{t("campaign.baseRules")}</dd>
              </div>
              <div>
                <dt>{t("campaign.rewards")}</dt>
                <dd>{t("campaign.baseRewards")}</dd>
              </div>
            </dl>
            <button className="btn" disabled={starting || error === "campaign.loadError"} onClick={start}>
              {t(completed ? "campaign.replay" : "campaign.deploy")}
            </button>
          </section>
        </div>
        {error && (
          <p className="lobby-error" role="alert">
            {t(error)}
          </p>
        )}
        {startError && (
          <p className="lobby-error" role="alert">
            {t("campaign.startError")}
          </p>
        )}
        <footer className="campaign-actions">
          <button className="btn secondary" onClick={() => setScreen("menu")}>
            {t("result.mainMenu")}
          </button>
          <button
            className="btn secondary"
            onClick={() => {
              if (window.confirm(t("campaign.resetConfirm"))) reset();
            }}
          >
            {t("campaign.reset")}
          </button>
        </footer>
      </main>
    </div>
  );
}
