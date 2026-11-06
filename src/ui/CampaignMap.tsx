import { useState } from "react";
import { SECTORS, sectorById, sectorStatus, type SectorId } from "@/game/data/sectors";
import { useCampaignStore } from "@/game/state/campaignStore";
import { useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { useT } from "@/i18n";
import { gameRef } from "./gameRef";
import { requestLandscape } from "./orientation";
import { CampaignStarfieldCanvas } from "./CampaignStarfieldCanvas";
import { CampaignSectorCard } from "./CampaignSectorCard";
import "./CampaignMap.css";

export function CampaignMap() {
  const t = useT();
  const { completedIds, selectedId, select, error, reset } = useCampaignStore();
  const [inspectedId, setInspectedId] = useState<SectorId>(selectedId);
  const setScreen = useGameStore((s) => s.setScreen);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(false);
  const [warpSequence, setWarpSequence] = useState(0);
  const [departingId, setDepartingId] = useState<SectorId | null>(null);
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
            <CampaignStarfieldCanvas warpSequence={warpSequence} />
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
                    setDepartingId(inspectedId);
                    setWarpSequence((sequence) => sequence + 1);
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
          <CampaignSectorCard
            inspectedId={inspectedId}
            completedIds={completedIds}
            starting={starting}
            loadError={error === "campaign.loadError"}
            warpSequence={warpSequence}
            departingId={departingId}
            onStart={start}
          />
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
