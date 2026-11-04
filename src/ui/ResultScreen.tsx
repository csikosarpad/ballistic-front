import { useGameStore } from "@/game/state/gameStore";
import { useMultiplayerStore } from "@/game/state/multiplayerStore";
import { usePlayerName } from "@/game/state/playerNames";
import { useCampaignStore } from "@/game/state/campaignStore";
import { useT } from "@/i18n";
import { gameRef } from "./gameRef";
import { Shop } from "./Shop";
import { ResultDecorCanvas } from "./result/ResultDecorCanvas";
import { getUnitPresentation } from "./result/unitPresentation";

/** Meccs végén: győztes, statisztika, bolt és továbblépés. */
export function ResultScreen() {
  const t = useT();
  const name = usePlayerName();
  const { winner, matchStats, setScreen, matchMode, aiActive, sector } = useGameStore();
  const campaign = matchMode === "campaign";
  const campaignError = useCampaignStore((s) => s.error);
  const credentials = useMultiplayerStore((state) => state.credentials);
  const session = useMultiplayerStore((state) => state.session);
  const multiplayerError = useMultiplayerStore((state) => state.error);
  const onlineMatch = credentials !== null;
  const aiOpponent = aiActive || campaign;
  const matchFinished = session?.status === "finished";

  return (
    <div className="overlay">
      <div className="panel result-panel">
        <ResultDecorCanvas accent={getUnitPresentation(winner ?? "P1").accent} />
        <div className="winner-banner">
          <span className="winner-trophy" aria-hidden="true">
            ★
          </span>
          <h2 className="winner">{winner ? t("result.wins", { name: name(winner) }) : t("result.draw")}</h2>
          <span className="winner-subtitle">{t("result.goodGame")}</span>
        </div>
        {campaign && (
          <p className="campaign-result" role="status">
            {winner === "P1" ? t("campaign.secured", { code: sector.code }) : t("campaign.notSecured")}
          </p>
        )}
        {campaign && campaignError && (
          <p className="lobby-error" role="alert">
            {t(campaignError)}
          </p>
        )}
        <table className="stats result-stats" cellPadding={0} cellSpacing={0} border={0}>
          <thead>
            <tr>
              <th>{t("result.player")}</th>
              <th>{t("result.shots")}</th>
              <th>{t("result.damage")}</th>
              <th>{t("result.xp")}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(matchStats).map(([id, s]) => (
              <tr key={id}>
                <td>
                  <u>{name(id)}</u>
                </td>
                <td>{s.shots}</td>
                <td>{s.damage}</td>
                <td>+{s.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="result-shop">
          {onlineMatch ? (
            <Shop editablePlayerId={credentials.playerId} disabled={!matchFinished} />
          ) : aiOpponent ? (
            <Shop editablePlayerId="P1" />
          ) : (
            <Shop />
          )}
        </div>
        {onlineMatch && !matchFinished && <p role="status">{t("result.syncing")}</p>}
        {multiplayerError && onlineMatch && (
          <p className="lobby-error" role="alert">
            {multiplayerError}
          </p>
        )}
        <div className="result-actions">
          {campaign && (
            <button
              className="btn hud-button hud-button-primary"
              onClick={() => {
                gameRef.current?.leaveBattle();
                setScreen("campaignMap");
              }}
            >
              {t("campaign.title")}
            </button>
          )}
          {!onlineMatch ? (
            <button className="btn hud-button hud-button-primary" onClick={() => gameRef.current?.restart()}>
              {t("result.rematch")}
            </button>
          ) : credentials.playerId === "P1" ? (
            <button
              className="btn hud-button hud-button-primary"
              disabled={!matchFinished}
              onClick={() => gameRef.current?.requestMultiplayerRematch()}
            >
              {t("result.rematch")}
            </button>
          ) : (
            <p role="status">{t("result.waitingRematch")}</p>
          )}
          <button
            className="btn secondary hud-button hud-button-secondary"
            onClick={() => {
              if (onlineMatch) useMultiplayerStore.getState().leave();
              gameRef.current?.leaveBattle();
              setScreen("menu");
            }}
          >
            {t("result.mainMenu")}
          </button>
        </div>
      </div>
    </div>
  );
}
