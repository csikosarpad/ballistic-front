import { getUpgradePresentation } from "./upgradePresentation";

interface UpgradeIconProps {
  upgradeId: string;
  iconSet?: string;
}

export function UpgradeIcon({ upgradeId, iconSet }: UpgradeIconProps) {
  const presentation = getUpgradePresentation(upgradeId, iconSet);

  return (
    <span className={`upgrade-icon accent-${presentation.accent}`} aria-hidden="true">
      <span className="upgrade-icon-glyph">{presentation.glyph}</span>
    </span>
  );
}
