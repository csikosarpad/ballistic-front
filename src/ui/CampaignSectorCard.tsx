import { SECTORS, sectorById, sectorStatus, type SectorId } from "@/game/data/sectors";
import { useT } from "@/i18n";

interface CampaignSectorCardProps {
  inspectedId: SectorId;
  completedIds: readonly SectorId[];
  starting: boolean;
  loadError: boolean;
  warpSequence: number;
  departingId: SectorId | null;
  onStart: () => void;
}

export function CampaignSectorCard({
  inspectedId,
  completedIds,
  starting,
  loadError,
  warpSequence,
  departingId,
  onStart,
}: CampaignSectorCardProps) {
  const t = useT();
  const panels = SECTORS.map((sector) => ({ sector, departing: false }));
  if (departingId !== null) panels.push({ sector: sectorById(departingId), departing: true });

  return (
    <section className="campaign-sector-card" aria-labelledby={`campaign-sector-name-${inspectedId}`}>
      {panels.map(({ sector, departing }) => {
        const active = !departing && sector.id === inspectedId;
        const status = sectorStatus(sector.id, completedIds);
        return (
          <div
            key={`${sector.id}-${departing ? "departure" : "content"}-${active || departing ? warpSequence : 0}`}
            className={`campaign-sector-content${active ? " is-active" : ""}${active && warpSequence > 0 ? " is-arriving" : ""}${departing ? " is-departing" : ""}`}
            aria-hidden={!active}
          >
            <div className="sector-code">{sector.code}</div>
            <h2 id={departing ? undefined : `campaign-sector-name-${sector.id}`}>{sector.name}</h2>
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
              disabled={!active || starting || status === "locked" || loadError}
              onClick={onStart}
            >
              {t(status === "completed" ? "campaign.replay" : "campaign.deploy")}
            </button>
          </div>
        );
      })}
    </section>
  );
}
