import type { CSSProperties } from "react";
import { useT } from "@/i18n";

interface WindIndicatorProps {
  wind: number;
}

export function WindIndicator({ wind }: WindIndicatorProps) {
  const t = useT();
  const strength = Math.min(1, Math.abs(wind) / 60);
  const direction = wind === 0 ? "calm" : wind > 0 ? "right" : "left";
  const arrow = direction === "calm" ? "—" : direction === "right" ? "→" : "←";

  return (
    <span
      className={`wind-indicator wind-${direction}`}
      role="status"
      aria-live="polite"
      aria-label={`${t("hud.wind")} ${wind}`}
      style={{ "--wind-strength": strength } as CSSProperties}
    >
      <span className="wind-indicator-label">{t("hud.wind")}</span>
      <span className="wind-indicator-arrow" aria-hidden="true">
        {arrow}
      </span>
      <strong>{Math.abs(wind)}</strong>
    </span>
  );
}
