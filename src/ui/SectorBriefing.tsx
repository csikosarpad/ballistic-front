import { useEffect, useState } from "react";
import { TRAINING_SECTOR } from "@/game/data/sectors";
import { useT } from "@/i18n";

export const SECTOR_BRIEFING_DURATION_MS = 2500;

export function SectorBriefing() {
  const t = useT();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), SECTOR_BRIEFING_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="sector-briefing" role="status" aria-label={t("sector.briefing")}>
      <div className="sector-briefing-panel">
        <div className="sector-briefing-eyebrow">SECTOR BRIEFING</div>
        <div className="sector-code">{TRAINING_SECTOR.code}</div>
        <h2>{TRAINING_SECTOR.name}</h2>
        <p>{t("sector.trainingBrief")}</p>
      </div>
    </div>
  );
}
