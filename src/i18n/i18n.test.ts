import { afterEach, describe, expect, it } from "vitest";
import { UPGRADES } from "../game/data/upgrades";
import { de } from "./messages.de";
import { en } from "./messages.en";
import { hu, type MessageKey } from "./messages.hu";
import { LOCALES, t, translate, useLocaleStore } from "./index";

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

afterEach(() => {
  localStorage.clear();
  useLocaleStore.getState().setLocale("hu");
});

describe("i18n", () => {
  it("minden katalógus kulcsai és helyőrzői megegyeznek", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(hu).sort());
    expect(Object.keys(de).sort()).toEqual(Object.keys(hu).sort());
    for (const key of Object.keys(hu) as MessageKey[]) {
      expect(placeholders(en[key]), key).toEqual(placeholders(hu[key]));
      expect(placeholders(de[key]), key).toEqual(placeholders(hu[key]));
      expect(en[key].trim(), key).not.toBe("");
      expect(de[key].trim(), key).not.toBe("");
    }
  });

  it("minden fejlesztéshez van név és leírás mindkét nyelven", () => {
    for (const def of UPGRADES) {
      for (const locale of LOCALES) {
        const catalog = locale === "hu" ? hu : locale === "de" ? de : en;
        expect(catalog).toHaveProperty([`upgrade.${def.id}.name`]);
        expect(catalog).toHaveProperty([`upgrade.${def.id}.desc`]);
      }
    }
  });

  it("behelyettesíti a helyőrzőket", () => {
    expect(translate("hu", "result.wins", { name: "P1" })).toBe("P1 nyert!");
    expect(translate("en", "result.wins", { name: "P1" })).toBe("P1 wins!");
    expect(translate("de", "result.wins", { name: "P1" })).toBe("P1 gewinnt!");
    expect(translate("hu", "upgrade.blast.desc", { value: 4 })).toBe("+4 méter robbanási sugár");
    expect(translate("hu", "upgrade.engine.desc", { value: 10 })).toBe("+10 méter mozgás körönként");
    expect(translate("hu", "upgrade.barrel.name")).toBe("Lőtávolság");
  });

  it("a nyelvváltás elmentődik, és átállítja a dokumentum nyelvét", () => {
    useLocaleStore.getState().setLocale("en");
    expect(t("hud.fire")).toBe("FIRE!");
    expect(localStorage.getItem("ballistic-front:locale")).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    useLocaleStore.getState().setLocale("hu");
    expect(t("hud.fire")).toBe("TÜZET!");
    expect(document.documentElement.lang).toBe("hu");
    useLocaleStore.getState().setLocale("de");
    expect(t("hud.fire")).toBe("FEUER!");
    expect(localStorage.getItem("ballistic-front:locale")).toBe("de");
    expect(document.documentElement.lang).toBe("de");
  });

  it.each([
    {
      locale: "en" as const,
      sound: "Comms: muted (M)",
      critical: "Critical hit! Unit P2 has sustained system damage",
      victory: "Mission successful. Victor: P1",
    },
    {
      locale: "de" as const,
      sound: "Funk: stummgeschaltet (M)",
      critical: "Kritischer Treffer! Systemschaden bei Einheit P2",
      victory: "Einsatz erfolgreich. Sieger: P1",
    },
  ])("a katonai HUD és eseménynapló helyőrzői működnek: $locale", ({ locale, sound, critical, victory }) => {
    expect(translate(locale, "hud.sound", { state: translate(locale, "hud.soundOff") })).toBe(sound);
    expect(translate(locale, "command.critical", { id: "P2" })).toBe(critical);
    expect(translate(locale, "command.victory", { name: "P1" })).toBe(victory);
  });
});
