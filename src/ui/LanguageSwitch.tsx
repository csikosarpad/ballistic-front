import { LOCALES, LOCALE_LABELS, useLocaleStore, useT } from "@/i18n";

export function LanguageSwitch() {
  const t = useT();
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <div className="language-switch flex gap-2" role="group" aria-label={t("menu.language")}>
      {LOCALES.map((code) => (
        <button
          key={code}
          className="btn secondary"
          lang={code}
          aria-pressed={locale === code}
          disabled={locale === code}
          onClick={() => setLocale(code)}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
