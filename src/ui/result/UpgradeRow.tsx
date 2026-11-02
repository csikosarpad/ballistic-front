import { UPGRADES, type UpgradeDef } from "@/game/data/upgrades";
import { upgradeCost } from "@/game/systems/upgrades";
import type { Profile } from "@/game/systems/upgrades";
import { useT, type MessageKey } from "@/i18n";
import { gameRef } from "../gameRef";
import { SegmentedProgressBar } from "./SegmentedProgressBar";
import { UpgradeIcon } from "./UpgradeIcon";
import { getUpgradePresentation } from "./upgradePresentation";

interface UpgradeRowProps {
  playerId: string;
  profile: Profile;
  definition: UpgradeDef;
  editable: boolean;
  disabled: boolean;
  iconSet: string;
}

export function UpgradeRow({ playerId, profile, definition, editable, disabled, iconSet }: UpgradeRowProps) {
  const t = useT();
  const level = profile.levels[definition.id] ?? 0;
  const maxed = level >= definition.maxLevel;
  const cost = upgradeCost(definition, level);
  const unaffordable = !maxed && profile.xp < cost;
  const purchasable = !disabled && editable && !maxed && !unaffordable;
  const name = t(`upgrade.${definition.id}.name` as MessageKey);
  const value = definition.stat === "damage" ? Math.round(definition.perLevel * 100) : definition.perLevel;
  const presentation = getUpgradePresentation(definition.id, iconSet);

  return (
    <div className={`upgrade-row${unaffordable ? " is-unaffordable" : ""}`}>
      <UpgradeIcon upgradeId={definition.id} iconSet={iconSet} />
      <div className="upgrade-label">
        <strong>{name}</strong>
        <small>{t(`upgrade.${definition.id}.desc` as MessageKey, { value })}</small>
      </div>
      <div className="upgrade-cell">
        <SegmentedProgressBar value={level} max={definition.maxLevel} accent={presentation.accent} />
        <span className="upgrade-level-label">
          {level}/{definition.maxLevel}
        </span>
        <button
          aria-label={`${playerId}: ${name}`}
          className={`upgrade-buy${maxed ? " maxed" : ""}${purchasable ? " is-purchasable" : ""}`}
          disabled={disabled || !editable || maxed || unaffordable}
          onClick={() => gameRef.current?.buy(playerId, definition.id)}
        >
          {maxed ? t("shop.max") : t("shop.costShort", { cost })}
        </button>
      </div>
    </div>
  );
}

export { UPGRADES };
