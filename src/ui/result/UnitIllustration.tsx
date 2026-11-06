import { useId } from "react";
import type { UnitPresentation } from "./result.types";

interface UnitIllustrationProps {
  presentation: UnitPresentation;
  facing?: "left" | "right";
}

export function UnitIllustration({ presentation, facing = "right" }: UnitIllustrationProps) {
  const tintId = useId();
  if (!presentation.silhouetteAsset) return null;

  if (presentation.illustrationLayout === "body-barrel") {
    const color = presentation.primaryColor;
    const red = ((color >> 16) & 255) / 255;
    const green = ((color >> 8) & 255) / 255;
    const blue = (color & 255) / 255;
    return (
      <div
        className={`unit-illustration unit-illustration-platform accent-${presentation.accent} facing-${facing}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 36 16" focusable="false">
          <defs>
            <filter id={tintId} colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values={`${red} 0 0 0 0 0 ${green} 0 0 0 0 0 ${blue} 0 0 0 0 0 1 0`}
              />
            </filter>
          </defs>
          {presentation.secondaryAsset && (
            <image
              href={presentation.secondaryAsset}
              x="16"
              y="4"
              width="16"
              height="4"
              transform="rotate(-20 16 6)"
            />
          )}
          <image href={presentation.silhouetteAsset} x="4" y="4" width="24" height="12" filter={`url(#${tintId})`} />
        </svg>
      </div>
    );
  }

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
