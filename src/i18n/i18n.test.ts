import { afterEach, describe, expect, it } from "vitest";
import { UPGRADES } from "../game/data/upgrades";
import { en } from "./messages.en";
import { hu, type MessageKey } from "./messages.hu";
import { LOCALES, t, translate, useLocaleStore } from "./index";

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

afterEach(() => {
  localStorage.clear();
  useLocaleStore.getState().setLocale("hu");
});

describe("i18n", () => {
  it("az angol és a magyar katalógus kulcsai és helyőrzői megegyeznek", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(hu).sort());
    for (const key of Object.keys(hu) as MessageKey[]) {
      expect(placeholders(en[key]), key).toEqual(placeholders(hu[key]));
      expect(en[key].trim(), key).not.toBe("");
    }
  });

  it("minden fejlesztéshez van név és leírás mindkét nyelven", () => {
    for (const def of UPGRADES) {
      for (const locale of LOCALES) {
        const catalog = locale === "hu" ? hu : en;
        expect(catalog).toHaveProperty([`upgrade.${def.id}.name`]);
        expect(catalog).toHaveProperty([`upgrade.${def.id}.desc`]);
      }
    }
  });

  it("behelyettesíti a helyőrzőket", () => {
    expect(translate("hu", "result.wins", { name: "P1" })).toBe("P1 nyert!");
    expect(translate("en", "result.wins", { name: "P1" })).toBe("P1 wins!");
    expect(translate("hu", "upgrade.blast.desc", { value: 4 })).toBe("+4 méter robbanási sugár");
    expect(translate("hu", "upgrade.engine.desc", { value: 10 })).toBe("+10 méter mozgás körönként");
    expect(translate("hu", "upgrade.barrel.name")).toBe("Lőtávolság");
  });

  it("a nyelvváltás elmentődik, és átállítja a dokumentum nyelvét", () => {
    useLocaleStore.getState().setLocale("en");
    expect(t("hud.fire")).toBe("Fire!");
    expect(localStorage.getItem("ballistic-front:locale")).toBe("en");
    expect(document.documentElement.lang).toBe("en");
    useLocaleStore.getState().setLocale("hu");
    expect(t("hud.fire")).toBe("Tűz!");
    expect(document.documentElement.lang).toBe("hu");
  });
});
