import type { Profile } from "@/game/systems/upgrades";

export type UnitDomain = "ground" | "space" | "air" | "mech";
export type UnitAccent = "cyan" | "gold" | "orange";

export interface UnitPresentation {
  domain: UnitDomain;
  displayName: string;
  silhouetteAsset?: string;
  secondaryAsset?: string;
  detailAsset?: string;
  accentAsset?: string;
  primaryColor: number;
  secondaryColor: number;
  iconSet: string;
  accent: UnitAccent;
}

export interface UnitPanelProps {
  id: string;
  profile: Profile;
  presentation: UnitPresentation;
  editable: boolean;
  disabled: boolean;
}
