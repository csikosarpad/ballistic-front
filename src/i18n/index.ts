import { useCallback } from "react";
import { create } from "zustand";
import { en } from "./messages.en";
import { hu, type MessageKey } from "./messages.hu";

export type Locale = "hu" | "en";
export type { MessageKey };
export type Params = Record<string, string | number>;

export const LOCALES: readonly Locale[] = ["hu", "en"];
export const LOCALE_LABELS: Record<Locale, string> = { hu: "Magyar", en: "English" };

const STORAGE_KEY = "ballistic-front:locale";
const catalogs: Record<Locale, Record<MessageKey, string>> = { hu, en };

const isLocale = (value: unknown): value is Locale => value === "hu" || value === "en";

/** Mentett nyelv, különben a böngésző nyelve (magyar vagy angol). */
function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // A localStorage nélkül a böngésző nyelve dönt.
  }
  return typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("hu") ? "hu" : "en";
}

function applyDocumentLanguage(locale: Locale): void {
  if (typeof document !== "undefined") document.documentElement.lang = locale;
}

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: detectLocale(),
  setLocale: (locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // A választás ilyenkor csak az aktuális oldalbetöltésig érvényes.
    }
    applyDocumentLanguage(locale);
    set({ locale });
  },
}));

applyDocumentLanguage(useLocaleStore.getState().locale);

/** `{név}` helyőrzők behelyettesítése; ismeretlen helyőrző érintetlen marad. */
export function translate(locale: Locale, key: MessageKey, params?: Params): string {
  const template = catalogs[locale][key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/** Nem React környezetben (store-ok, engine) használható fordítás az aktuális nyelven. */
export const t = (key: MessageKey, params?: Params): string => translate(useLocaleStore.getState().locale, key, params);

/** React hook: nyelvváltáskor újrarenderel. */
export function useT(): (key: MessageKey, params?: Params) => string {
  const locale = useLocaleStore((state) => state.locale);
  return useCallback((key, params) => translate(locale, key, params), [locale]);
}
