# Solvyr Prime: Siege Protocol – fejlesztői indítás és referencia

Környezet, parancsok, forrásstruktúra és tartalomkezelés.
[Fejlesztői index](./README.md) · [Játékosútmutató](../user/guide.md)

## Tech stack

Windows, Node.js 24, pnpm, Vite, React 18, TypeScript, PixiJS 8 (WebGL),
Zustand, Tailwind CSS 4, Vitest + React Testing Library.

## Parancsok

A repository gyökerében:

```powershell
pnpm.cmd install
pnpm.cmd dev          # fejlesztői szerver
pnpm.cmd build        # típusellenőrzés + build
pnpm.cmd test         # Vitest
pnpm.cmd lint
pnpm.cmd fmt
```

Ha a PowerShell a `pnpm` szkriptet letiltja, a `pnpm.cmd` használható.
A `fmt` a teljes repositoryt formázza; célzott változtatásnál csak az érintett fájlokat formázd.

Online módhoz a PHP API és MySQL/MariaDB is szükséges. A repository gyökeréből:

```powershell
php -S 127.0.0.1:8000 -t server\api server\api\index.php
```

A Vite a `/api` kéréseket ide proxyzza. A konfiguráció, adatbázis-előkészítés,
végpontok és telepítés részletei: [backend README](../../server/README.md).
A korábbi éles telepítés megtörtént; ez nem minden későbbi módosítás éles validációja.

## Forrásstruktúra

Az alábbi utak a repository gyökeréhez viszonyítottak:

```text
server/                 # PHP/MySQL backend, nem része a Vite buildnek
  api/                  # HTTP router és .htaccess
  lib/                  # HTTP-ről tiltott szerveroldali segédek
  config.example.php    # minta; a config.php nincs verziókezelve
  schema.sql
src/
  main.tsx, App.tsx
  ui/                   # React HUD, menü, lobby, bolt és ResultScreen; Pixi UI dekoráció
    main-menu/          # főmenü-vezérlő, kezdőpanel, beállítások, lobby, nyelvváltó és stáblista
  i18n/                 # magyar forráskatalógus, angol/német fordítások, t() / useT()
  test/                 # Vitest setup
  game/
    engine/             # Game, AudioManager, FxRenderer és háttérrétegek
    assets/             # tank/dekoráció SVG, háttér JPG, FX PNG, OGG és MP3 hangok
    entities/           # tank
    multiplayer/        # HTTP API kliens és protokoll
    systems/            # körkezelés, AI, upgrade, profil, seedelt véletlen, speech
    terrain/            # heightmap, TerrainMask, Terrain RenderTexture
    physics/            # ballisztika
    state/              # Zustand HUD-nézet, multiplayer, közlések és beállítások
    data/               # upgrade-definíciók és zenekatalógus
docs/
  user/                 # jelenlegi játék használata
  developer/            # architektúra, roadmap, design és fejlesztési referencia
    archive/            # lezárt vizuális iterációk
```

A frontend és a backend szétválasztott; a PHP források nem részei a TypeScript/Vite
buildnek. A frontend API-alap URL-je a `VITE_MULTIPLAYER_API_URL`, alapértelmezésben
`/api`; az éles konfiguráció a `.env.production` fájlban van.

A nagy gyakoriságú fizikai adat az engine-ben él; a gameStore a HUD számára ad nézetet.
Online a körönkénti szél közös seedből számolódik, nem külön lövési payload.
A helyi profilboríték (`ballistic-front:profiles`, `version: 2`) nem online protokollverzió;
a legacy `ballistic-front:profiles:v1` kulcs átvehető. Részletek:
[fejlesztői kontextus](./dev-notes.md).

## Nyelvek és szövegek

A beépített katalógusok magyar, angol és német nyelvűek; a mentett választás kulcsa
`ballistic-front:locale`. A játékosi nyelvválasztást az [útmutató](../user/guide.md) írja le.

Új szöveg kulcsa a [magyar katalógusba](../../src/i18n/messages.hu.ts) kerül, majd az
[angol](../../src/i18n/messages.en.ts) és [német](../../src/i18n/messages.de.ts) fordításba is.
A TypeScript a kulcsokat, az [i18n-tesztek](../../src/i18n/i18n.test.ts) a kulcsokat és
helyőrzőket ellenőrzik. Komponensben `useT()`, Reacton kívül `t()` használható.
Fejlesztések név/leírás kulcsai: `upgrade.<id>.name`, `upgrade.<id>.desc`.

A játék UI-mértékegysége 1 px = 1 méter; a mozgás és robbanási sugár méterben jelenik meg.
A PHP API hibaüzenetei egyelőre angolul érkeznek.
Külső nyelvfájl-betöltés és admin felület még nincs; tervek a [roadmapben](./roadmap.md).

## CSS és Tailwind

A [MainMenu](../../src/ui/main-menu/MainMenu.tsx) a `home | settings | lobby`
helyi állapottal vált a kezdőpanel, a beállítások és a lobby között. A
[MainMenuHome](../../src/ui/main-menu/MainMenuHome.tsx) kezeli a kezdőpanel akcióit,
a [MainMenuSettings](../../src/ui/main-menu/MainMenuSettings.tsx) a beállítások
store-kapcsolatait; a lobby továbbra is saját komponens. Ezek, a nyelvváltó és
a stáblista a `ui/main-menu/` mappába tartoznak. A közös `gameRef` és tájoláskezelés
a `ui/` gyökerében marad. A menü CSS-e egyelőre a globális `ui.css` része;
a komponensstruktúra átrendezése nem változtatja meg a CSS betöltési sorrendjét.

A Tailwind CSS 4 a `@tailwindcss/vite` pluginnal működik. A
[ui.css](../../src/ui/ui.css) a Tailwind témáját és utility osztályait importálja;
a `src/` alatt megadott teljes classneveket automatikusan felismeri.
Például: `className="language-switch flex gap-2"`.
Feltételes stílusoknál teljes classneveket használj (`active ? "text-cyan-400" : "text-white"`),
ne dinamikusan összerakott neveket (`text-${color}-400`).

A Preflight globális reset nincs betöltve, így a meglévő UI alapstílusai megmaradnak.
A jelenlegi, rétegen kívüli saját CSS azonos tulajdonság esetén elsőbbséget élvez
a Tailwind utility rétegével szemben. Ha egy tulajdonságot utility class kezel,
az ütköző saját deklarációt távolítsd el; a meglévő CSS-t nem kell átírni.

A közös téma (`--bf-*` változók), alapstílusok (`overlay`, `panel`, `btn`) és a több
képernyőn használt osztályok a globális [ui.css](../../src/ui/ui.css) fájlban maradnak.
Az önálló komponensek saját stílusai fokozatosan melléjük emelhetők ki:
a [CampaignMap.tsx](../../src/ui/CampaignMap.tsx) közvetlenül importálja a
[CampaignMap.css](../../src/ui/CampaignMap.css) fájlt, a reszponzív szabályokkal és
animációkkal együtt. A téma változóit használja, nem hoz létre külön témát.

A [main.tsx](../../src/main.tsx) a közös CSS-t az `App` előtt importálja, így a
komponens stílusai az alapok után kerülnek betöltésre. A külön CSS-fájl nem izolált
hatóköri egység: a szelektorok továbbra is globálisak, ezért komponens-előtagot
használj (például `campaign-`), ne önálló `.is-selected` vagy általános elemszelektort.
Valódi lokális osztálynevekhez később CSS Modules vezethető be; pusztán a kiemeléshez
ez nem szükséges.

A hangerőcsúszka saját stílusa a `ui.css` `.audio-volume-control` szabályaiban van.
A `--volume-track-height` a sín vastagsága, a `--volume-thumb-size` a fogantyú mérete;
az input 32 px magas kezelési területe ezektől független. A WebKit és Firefox
pszeudoelemei külön szabályokat kapnak, közös CSS-változókkal.
A `MainMenuSettings` a hangerőből számítja a `--volume-whiteness` értékét: a sín 0%-nál
semleges, 80%-ra fehérré válik. A `data-volume-high` 80%-tól fehér ragyogást kapcsol be.
A projekt sima CSS-t használ; Sass `@mixin` / `@include` nincs beállítva.

## Skinezhetőség

A [ui.css](../../src/ui/ui.css) elején CSS változók vannak, például `--bf-panel`,
`--bf-text`, `--bf-primary`. Egy változóalapú felülírás:

```css
:root[data-skin="neon"] {
  --bf-panel: #0b0220;
  --bf-primary: #00f0ff;
}
```

Ehhez a gyökérelemen a `data-skin="neon"` attribútum szükséges.
A [Theme](../../src/game/theme.ts) a Pixi színeinek egy részét kezeli: terep,
játékosok, tank fölötti sávok, lövedék és effektek. A háttérrétegek, egyes UI-elemek
és SVG-k saját színeket is használnak, ezért nem teljes skinrendszer.
A `Game.theme` belső mező; publikus skinválasztó vagy külső skinbetöltés nincs.

## Köszönet

A robbanás- és füstsprite-ok a [Kenney Particle Pack](https://kenney.nl/assets/particle-pack)
csomagból valók (CC0); [licenc](../../src/game/assets/fx/License.txt).

A hangeffektek (lövés, robbanás, tankmozgás) a [Freesound](https://freesound.org)
oldalról származó, Creative Commons 0 (CC0) licenc szerinti forrásokból készültek.
A WAV/FLAC → OGG konvertáláshoz a [FreeConvert OGG Converter](https://www.freeconvert.com/ogg-converter/)
eszközt használtam. A konvertálás a fájlméret és webes betöltés optimalizálását szolgálja;
a játék OGG fájlokat tölt be. Az eredeti Freesound-oldalak és szerzők fájlonkénti
nyilvántartása még hiányzik, ezért következő publikálás előtt ellenőrizendő.

A háttérzene **nem CC0**, hanem Pixabay Content License alatt áll:
„Cyberpunk Neon City” – [Pavel Prakapovich (energysound)](https://pixabay.com/hu/users/energysound-41316904/),
[Pixabay](https://pixabay.com/music/). A [forrás és licencmegjegyzések](../../src/game/assets/audio/music/LICENSE.txt)
külön fájlban vannak. A licenc önmagában álló terjesztést/értékesítést nem enged;
nyilvános repóba vagy publikus buildbe kerülés előtt a feltételek ellenőrizendők.

A `plans/` további próbaszámai (energysound „Dark Cyberpunk Synthwave”, Jamii
„Warhammer Background Music”) nem részei a futásidejű zenekatalógusnak;
forrásaik a [plans/license.txt](../../plans/license.txt) fájlban vannak.
A főmenü [gördülő stáblistája](../../src/ui/main-menu/MenuCredits.tsx) a beépített zene,
a Kenney képi effektek, a Freesound hangforrás és a betűtípusok ismert adatait mutatja.
A nem használt próbaanyagok és az ismeretlen szerzőjű háttérképek nincsenek felsorolva;
a stáblista nem helyettesíti a hiányzó fájlonkénti forrás- és licencellenőrzést.

A betűtípusok **Oxanium** (UI) és **Rajdhani** (HUD adatok), SIL Open Font License 1.1
alatt, a [Fontsource](https://fontsource.org) csomagjaiból önállóan hosztolva.

## Kapcsolódó dokumentáció

Architektúra: [dev-notes](./dev-notes.md). Aktív státuszok: [roadmap](./roadmap.md).
Hangrendszer és fejlesztései: [hang-redesign](./sound-redesign.md).
A teljes jegyzék a [fejlesztői indexben](./README.md) található.
