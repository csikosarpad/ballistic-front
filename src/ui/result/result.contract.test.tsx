import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/game/state/gameStore";
import { Shop } from "../Shop";
import { UnitPanel } from "./UnitPanel";
import { getUnitPresentation } from "./unitPresentation";
import { getUpgradePresentation } from "./upgradePresentation";
import tankBodyUrl from "@/game/assets/tank-body.svg?url";
import tankBarrelUrl from "@/game/assets/tank-barrel.svg?url";

describe("result presentation contract", () => {
  it("ground theme tank presentationt ad a P1/P2 accentet is megtartja", () => {
    const p1 = getUnitPresentation("P1");
    const p2 = getUnitPresentation("P2");

    expect(p1).toMatchObject({
      domain: "ground",
      displayName: "Tank",
      iconSet: "ground-combat",
      accent: "cyan",
    });
    expect(p1.silhouetteAsset).toBe(tankBodyUrl);
    expect(p1.secondaryAsset).toBe(tankBarrelUrl);
    expect(p1.illustrationLayout).toBe("body-barrel");
    expect(p1.detailAsset).toBeUndefined();
    expect(p1.accentAsset).toBeUndefined();
    expect(p2).toMatchObject({
      domain: "ground",
      primaryColor: 0xffc52e,
      secondaryColor: 0xb86a12,
      accent: "gold",
    });
  });

  it("space theme tank-specifikus asset nélkül is teljes presentationt ad", () => {
    const p1 = getUnitPresentation("P1", "space");
    const p2 = getUnitPresentation("P2", "space");

    expect(p1).toMatchObject({
      domain: "space",
      displayName: "Space fighter",
      iconSet: "space-combat",
      accent: "cyan",
    });
    expect(p1.silhouetteAsset).toBeUndefined();
    expect(p2.accent).toBe("gold");
    expect(p2.iconSet).toBe("space-combat");
  });

  it("az upgrade theme az egység iconSetjét változtatás nélkül továbbviszi", () => {
    expect(getUpgradePresentation("shield", "space-combat")).toEqual({
      glyph: "ϟ",
      accent: "cyan",
      iconSet: "space-combat",
    });
    expect(getUpgradePresentation("unknown", "space-combat").iconSet).toBe("space-combat");
  });
});

describe("UnitPanel and Shop presentation contract", () => {
  beforeEach(() => {
    useGameStore.setState({
      profiles: {
        P1: { xp: 240, levels: { armor: 1 } },
      },
    });
  });

  it("a space presentation ugyanazt a panel és upgrade layoutot használja", () => {
    render(
      <UnitPanel
        id="P1"
        profile={{ xp: 240, levels: { armor: 1 } }}
        presentation={getUnitPresentation("P1", "space")}
        editable
        disabled={false}
      />,
    );

    expect(screen.getByText("Space fighter")).toBeInTheDocument();
    expect(screen.getByText("P1")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(7);
    expect(screen.getByText("1/5")).toBeInTheDocument();
  });

  it("a Shop minden profilt egységpanelként jelenít meg", () => {
    useGameStore.setState({
      profiles: {
        P1: { xp: 240, levels: {} },
        P2: { xp: 0, levels: {} },
      },
    });

    render(<Shop editablePlayerId="P1" />);

    expect(screen.getAllByText("Tank")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "P1: Páncél" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "P2: Páncél" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "P1: Páncél" })).toHaveClass("is-purchasable");
    expect(screen.getByRole("button", { name: "P2: Páncél" })).not.toHaveClass("is-purchasable");
    expect(screen.getByRole("button", { name: "P2: Páncél" }).closest(".upgrade-row")).toHaveClass("is-unaffordable");
    expect(document.querySelector(".unit-illustration.facing-right")).toBeInTheDocument();
    expect(document.querySelector(".unit-illustration.facing-left")).toBeInTheDocument();
    const illustrations = document.querySelectorAll(".unit-illustration-platform");
    expect(illustrations).toHaveLength(2);
    illustrations.forEach((illustration) => {
      expect(illustration.querySelectorAll("image")).toHaveLength(2);
      expect(illustration.querySelector("image")?.getAttribute("href")).toBe(tankBarrelUrl);
      expect(illustration.querySelector("image[filter]")?.getAttribute("href")).toBe(tankBodyUrl);
    });
    const filters = [...document.querySelectorAll(".unit-illustration-platform filter")];
    expect(new Set(filters.map((filter) => filter.id)).size).toBe(2);
  });
});
