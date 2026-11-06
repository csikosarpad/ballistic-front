import { SECTORS, sectorById } from "@/game/data/sectors";
import { useCampaignStore } from "@/game/state/campaignStore";
import { useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { useT } from "@/i18n";
import { gameRef } from "../gameRef";
import { requestLandscape } from "../orientation";

interface MainMenuHomeProps {
  onShowLobby: () => void;
  onShowSettings: () => void;
}

export function MainMenuHome({ onShowLobby, onShowSettings }: MainMenuHomeProps) {
  const t = useT();
  const setScreen = useGameStore((s) => s.setScreen);
  const completedIds = useCampaignStore((s) => s.completedIds);
  const selectedId = useCampaignStore((s) => s.selectedId);
  const operation = sectorById(selectedId);
  const campaignError = useCampaignStore((s) => s.error);

  const start = () => {
    void requestLandscape();
    useMultiplayerStore.getState().leave();
    gameRef.current?.startOffline();
    setScreen("playing");
  };

  const reset = () => {
    if (window.confirm(t("menu.resetConfirm"))) gameRef.current?.resetProgress();
  };

  return (
    <div className="panel main-menu-panel">
      <header className="main-menu-header">
        <h1>
          <span>{t("menu.title")}</span>
        </h1>
        <div className="menu-sector" aria-label={t("sector.battlefield")}>
          <span className="sector-code">{t("campaign.operation")}</span>
          <span className="sector-code">{operation.code}</span>
          <strong>{operation.name}</strong>
          <small>{t("campaign.progress", { value: completedIds.length, total: SECTORS.length })}</small>
        </div>
        <p>{t("menu.tagline")}</p>
        <small>{t("menu.controls")}</small>
      </header>
      <nav className="main-menu-actions" aria-label={t("menu.title")}>
        <button
          className="btn main-menu-start"
          onClick={() => {
            gameRef.current?.leaveBattle();
            useMultiplayerStore.getState().leave();
            setScreen("campaignMap");
          }}
        >
          {t("campaign.title")}
        </button>
        <button className="btn main-menu-start" onClick={start}>
          {t("menu.start")}
        </button>
        <button className="btn secondary" onClick={onShowLobby}>
          {t("menu.online")}
        </button>
        <button className="btn secondary" onClick={onShowSettings}>
          {t("menu.settings")}
        </button>
        <button className="btn secondary" onClick={reset}>
          {t("menu.reset")}
        </button>
      </nav>
      {campaignError && (
        <p className="lobby-error" role="alert">
          {t(campaignError)}
        </p>
      )}
    </div>
  );
}
