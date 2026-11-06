import { useState } from "react";
import { SECTORS, sectorById, sectorStatus, type SectorId } from "@/game/data/sectors";
import { useCampaignStore } from "@/game/state/campaignStore";
import { useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { useT } from "@/i18n";
import { gameRef } from "./gameRef";
import { requestLandscape } from "./orientation";

export function CampaignMap() {
  const t = useT();
  const { completedIds, selectedId, select, error, reset } = useCampaignStore();
  const [inspectedId, setInspectedId] = useState<SectorId>(selectedId);
  const sector = sectorById(inspectedId);
  const status = sectorStatus(inspectedId, completedIds);
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
    if (!gameRef.current.startCampaign(inspectedId)) {
      setStarting(false);
      setStartError(true);
      return;
    }
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
          <span className="campaign-progress">
            {t("campaign.progress", { value: completedIds.length, total: SECTORS.length })}
          </span>
        </header>
        {completedIds.includes("prime-00") && (
          <p className="campaign-result" role="status">
            {t("campaign.operationComplete")}
          </p>
        )}
        <div className="campaign-layout">
          <section className="campaign-star-map" aria-label={t("campaign.title")}>
            <svg className="campaign-orbits" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {SECTORS.flatMap((target) =>
                target.prerequisites.map((id) => {
                  const source = sectorById(id);
                  return (
                    <line
                      key={`${id}-${target.id}`}
                      x1={source.position.x}
                      y1={source.position.y}
                      x2={target.position.x}
                      y2={target.position.y}
                      className={completedIds.includes(id) ? "is-open" : ""}
                    />
                  );
                }),
              )}
            </svg>
            {SECTORS.map((entry) => {
              const state = sectorStatus(entry.id, completedIds);
              const selected = inspectedId === entry.id;
              return (
                <button
                  key={entry.id}
                  className={`campaign-node is-${state}${selected ? " is-selected" : ""}`}
                  style={{ left: `${entry.position.x}%`, top: `${entry.position.y}%` }}
                  aria-pressed={selected}
                  aria-label={`${entry.code}, ${entry.name}, ${t(`campaign.${state}`)}`}
                  onClick={() => {
                    setInspectedId(entry.id);
                    setStartError(false);
                    if (state !== "locked") select(entry.id);
                  }}
                >
                  <span className="campaign-node-symbol" aria-hidden="true">
                    {state === "completed" ? "●" : selected ? "★" : state === "available" ? "◉" : "○"}
                  </span>
                  <span className="sector-code">{entry.code.replace("SECTOR ", "")}</span>
                  <strong>{entry.name}</strong>
                </button>
              );
            })}
          </section>
          <section className="campaign-sector-card" aria-labelledby="campaign-sector-name">
            <div className="sector-code">{sector.code}</div>
            <h2 id="campaign-sector-name">{sector.name}</h2>
            <p>{t(sector.briefing)}</p>
            <dl>
              <div>
                <dt>{t("campaign.status")}</dt>
                <dd>{t(`campaign.${status}`)}</dd>
              </div>
              {sector.prerequisites.length > 0 && (
                <div>
                  <dt>{t("campaign.requires")}</dt>
                  <dd>{sector.prerequisites.map((id) => sectorById(id).name).join(` ${t("campaign.or")} `)}</dd>
                </div>
              )}
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
            <button
              className="btn"
              disabled={starting || status === "locked" || error === "campaign.loadError"}
              onClick={start}
            >
              {t(status === "completed" ? "campaign.replay" : "campaign.deploy")}
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
              if (window.confirm(t("campaign.resetConfirm"))) {
                reset();
                setInspectedId("alpha-01");
                setStartError(false);
              }
            }}
          >
            {t("campaign.reset")}
          </button>
        </footer>
      </main>
    </div>
  );
}
