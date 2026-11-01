import type { UnitPresentation } from "./result.types";

interface UnitIllustrationProps {
  presentation: UnitPresentation;
}

export function UnitIllustration({ presentation }: UnitIllustrationProps) {
  if (!presentation.silhouetteAsset) return null;

  return (
    <div className={`unit-illustration accent-${presentation.accent}`} aria-hidden="true">
      <img className="unit-illustration-body" src={presentation.silhouetteAsset} alt="" />
      {presentation.secondaryAsset && (
        <img className="unit-illustration-secondary" src={presentation.secondaryAsset} alt="" />
      )}
    </div>
  );
}
