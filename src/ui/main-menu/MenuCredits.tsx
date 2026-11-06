import { useId, useState } from "react";
import { useT } from "@/i18n";

export function MenuCredits() {
  const t = useT();
  const titleId = useId();
  const [paused, setPaused] = useState(false);

  return (
    <aside className={`menu-credits${paused ? " is-paused" : ""}`} aria-labelledby={titleId}>
      <header className="menu-credits-header">
        <h2 id={titleId}>{t("credits.title")}</h2>
        <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {t(paused ? "credits.resume" : "credits.pause")}
        </button>
      </header>
      <div className="menu-credits-viewport" tabIndex={0} role="region" aria-label={t("credits.sources")}>
        <div className="menu-credits-roll">
          <section>
            <h3>{t("credits.music")}</h3>
            <strong>Cyberpunk Neon City</strong>
            <a href="https://pixabay.com/hu/users/energysound-41316904/" target="_blank" rel="noopener noreferrer">
              Pavel Prakapovich (energysound)
            </a>
            <a href="https://pixabay.com/music/" target="_blank" rel="noopener noreferrer">
              Pixabay · #505278
            </a>
            <small>Pixabay Content License</small>
          </section>
          <section>
            <h3>{t("credits.visuals")}</h3>
            <strong>Particle Pack</strong>
            <a href="https://kenney.nl/assets/particle-pack" target="_blank" rel="noopener noreferrer">
              Kenney Vleugels · Kenney
            </a>
            <small>CC0</small>
          </section>
          <section>
            <h3>{t("credits.sound")}</h3>
            <strong>{t("credits.soundEffects")}</strong>
            <a href="https://freesound.org" target="_blank" rel="noopener noreferrer">
              Freesound
            </a>
            <small>{t("credits.soundSource")} · CC0</small>
          </section>
          <section>
            <h3>{t("credits.fonts")}</h3>
            <strong>Oxanium · Rajdhani</strong>
            <a href="https://fontsource.org" target="_blank" rel="noopener noreferrer">
              Fontsource
            </a>
            <small>SIL Open Font License 1.1</small>
          </section>
          <p className="menu-credits-thanks">{t("credits.thanks")}</p>
        </div>
      </div>
    </aside>
  );
}
