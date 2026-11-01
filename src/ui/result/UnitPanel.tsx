import { UPGRADES } from "@/game/data/upgrades";
import { useT } from "@/i18n";
import { UpgradeRow } from "./UpgradeRow";
import { UnitIllustration } from "./UnitIllustration";
import type { UnitPanelProps } from "./result.types";

export function UnitPanel({ id, profile, presentation, editable, disabled }: UnitPanelProps) {
  const t = useT();

  return (
    <section className={`player-upgrades-panel unit-panel accent-${presentation.accent}`} aria-labelledby={`unit-${id}`}>
      <div className="player-upgrades-header">
        <div>
          <span className="unit-domain">{presentation.displayName}</span>
          <h3 id={`unit-${id}`}>{id}</h3>
        </div>
        <div className="player-earned-xp">
          <span>{t("shop.totalXp")}</span>
          <strong>{profile.xp} XP</strong>
        </div>
      </div>
      <UnitIllustration presentation={presentation} />
      <div className="upgrade-list">
        {UPGRADES.map((definition) => (
          <UpgradeRow
            key={definition.id}
            playerId={id}
            profile={profile}
            definition={definition}
            editable={editable}
            disabled={disabled}
            iconSet={presentation.iconSet}
          />
        ))}
      </div>
    </section>
  );
}
