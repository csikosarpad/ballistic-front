import type { UnitPresentation } from "./result.types";

interface UnitIllustrationProps {
  presentation: UnitPresentation;
  facing?: "left" | "right";
}

export function UnitIllustration({ presentation, facing = "right" }: UnitIllustrationProps) {
  if (!presentation.silhouetteAsset) return null;

  return (
    <div className={`unit-illustration accent-${presentation.accent} facing-${facing}`} aria-hidden="true">
      <img className="unit-illustration-body" src={presentation.silhouetteAsset} alt="" />
      {presentation.secondaryAsset && (
        <img className="unit-illustration-secondary" src={presentation.secondaryAsset} alt="" />
      )}
      {presentation.detailAsset && <img className="unit-illustration-details" src={presentation.detailAsset} alt="" />}
      {presentation.accentAsset && <img className="unit-illustration-accent" src={presentation.accentAsset} alt="" />}
    </div>
  );
}
