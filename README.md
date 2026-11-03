# Solvyr Prime: Siege Protocol

A Solvyr Prime univerzumban játszódó böngészős, körökre osztott taktikai tüzérségi játék.

- két (vagy több) tank egymást lövi
- ballisztikus fizika (szög, erő, szél)
- rombolható terep
- tank mozgás korlátozott lépésszámmal
- fejleszthető ágyú, lövedék, páncél
- XP, bolt, meta-progresszió
- szép grafika (particle effektek, animációk, shaderek)
- Web Audio hangrendszer OGG assetekkel (lövés, robbanás, tankmozgás) és háttérzene (MP3, loop)
- parancsnoki konzol és felolvasott közlések (Web Speech API, magyar és angol), győzelmi fanfár
- beállítható játékosnevek (offline módban is)

## Tech stack

Windows, Node.js 24, Vite, React 18, TypeScript, PixiJS 8 (WebGL), Zustand, Vitest + React Testing Library.

## Jelenlegi állapot

Játszható két játékos hot-seat módban: körökre osztott lövés, szeles ballisztika, rombolható terep, robbanás- és füstrészecskék, XP és fejlesztési bolt a meccsek között. Az XP és a fejlesztések `localStorage`-ban maradnak meg. A pálya fix 1280×720 logikai méretű, az ablakhoz skálázódik.

Online mód (v1): szobakódos lobby, két kliens közös seed alapján futtatott determinisztikus szimulációval, a mozgás- és lövésesemények HTTP-pollinggal szinkronizálódnak egy PHP/MySQL backenden. Meccs után fejlesztés és host által indított visszavágó. A backend részletei, helyi indítás és telepítés: [server/README.md](server/README.md). A két klienses szinkront és a determinisztikus visszajátszást tesztek fedik; az éles telepítés megtörtént.

## Irányítás

- Főmenü: Játék indítása, Online játék, Beállítások (nyelv, hang, játékosnevek), Mentés törlése (megerősítéssel)
- Beállítások → Hangcsoportok: Zene, Parancsnok (felolvasás) és Effektek (lövés, robbanás, tankmozgás, fanfár) külön ki/be kapcsolható (`localStorage`: `ballistic-front:audio-settings`). A HUD-os némítás (M) mindhármat felülírja. Az alapértelmezett zene a `energysound-cyberpunk-neon-city` (az első kattintás/billentyű után indul); a számok listája a `src/game/data/music.ts`-ben van, a választó a beállításokban később jön.
- Beállítások → Játékosnevek: P1 és P2 neve (legfeljebb 16 karakter, `localStorage`: `ballistic-front:player-names`); üresen az alapértelmezett P1/P2 marad. A név megjelenik a HUD-on, az eredményképernyőn, a boltban és a felolvasott közlésekben. Online meccsen a lobbyban megadott név az erősebb.
- Beállítások → Ellenfél (offline): „Második játékos" vagy „Gép (AI)". Az AI a P2 tankot vezérli (a következő meccstől). Működése (`src/game/systems/ai.ts`): a röppályát a játék saját fizikájával szimulálva keresi a legjobb szöget/erőt, szükség esetén közelít, de a szelet pontatlanul becsüli és célzási zaja van, így hibázik. A becsapódásokból meccsen belül korrigál; a meccsek közti tapasztalat (`localStorage`: `ballistic-front:ai-memory`) növeli a tudásszintjét, de sosem lesz tökéletes. Meccs végén maga költi el az XP-jét: a meccs alapján választ (sok elszenvedett sebzés → páncél/pajzs, pontatlan lövés → robbanás/sebzés). AI-meccsen az eredményképernyő boltjában csak a P1 fejleszthető. A tapasztalat a beállításokban törölhető. A tapasztalati erő külön 0–1 skálán fut (`experienceStrength`), és rendfokozatként 0–5 csillaggal jelenik meg a HUD-on mindkét játékos neve alatt: az AI-é a tapasztalatából (`rankStars`), az emberi játékosé a megvásárolt fejlesztések arányából (`profileStars`). Az AI a szöget és az erőt egész értékre kerekítve állítja. A parancsnoki közléseket a két játékos eltérő hangon mondja: ha a böngészőben van legalább két megfelelő (lehetőleg férfi) hang az adott nyelven, mindkettő a sajátját kapja, egyetlen hangnál a P2 magasabb hangmagassággal és gyorsabb tempóval szól (`voiceForSlot`). A „Cél befogva", találat- és mellélövés-közlést a soron lévő lövő mondja, a „kritikus sérülést kaptunk" közlést a megsérült fél, a győzelmit a győztes.
- ◀ / ▶ nyilak: mozgás (körönként korlátozott távolság)
- ▲ / ▼ nyilak: lövés ereje (±10, Shift: ±50)
- Ctrl + ◀ / ▶: cső szöge (±1°, Shift: ±5°; ◀ a bal oldali irány felé forgat)
- T: röppálya-előnézet (játékosonként meccsenként egyszer, az adott kör végéig)
- M: némítás be/ki (a beállítás megmarad; a hangot és a felolvasást is érinti)
- Szög és erő csúszók a HUD-on
- Szóköz: tűz
- Parancsnoki konzol (HUD, jobb oldalt): időbélyeges taktikai napló „gépelési effekttel", a szöveget a böngésző `speechSynthesis` hangja az aktuális nyelven fel is mondja (mélyebb, lehetőleg férfi hang). Közlések: „Cél befogva" (körönként egyszer, az első célzás/mozgás után), lövésenként legfeljebb egy eredményjelzés (megsemmisítés, kritikus sérülés, páncélsérülés, pajzsösszeomlás, találat, nem sikerült), meccs végén fanfár és „A csatát {név} nyerte!". A szövegek a `command.*` i18n kulcsok; a hang jellemzői (`VoiceSettings`) később a beállításokból módosíthatók lesznek.
- Meccs végén: eredményképernyő statisztikával, bolt (XP-ből fejlesztés), Visszavágó és Főmenü
- Védelem: három réteg, ebben a sorrendben kopnak: erőtér pajzs → fizikai páncél → HP (1:1 arányban, `src/game/systems/damage.ts`). A pajzs a soron lévő egységnél körönként a maximum 20%-ával töltődik vissza, kivéve ha az egységet a két köre között találat érte (akkor abban a körben nem). A páncél nem töltődik vissza. A HUD és a tank fölötti kijelzés egymás feletti vékony csíkokat mutat: HP, pajzs, páncél; a pajzs és a páncél csíkja csak akkor látszik, ha az egységnek van (alapból nincs, a boltban vehető: Erőtér pajzs, Páncél). Az XP a pajzsnak, a páncélnak és a HP-nak okozott sebzés után is jár.
- Mentés: az XP és a szintek verziózott borítékban (`ballistic-front:profiles`, `version: 2`) maradnak meg; a régi `…:profiles:v1` mentést a játék első betöltéskor átveszi. Online meccsen mindkét kliensnek ugyanazt a buildet kell futtatnia.

## Parancsok

```shell
pnpm install
pnpm dev          # fejlesztői szerver
pnpm build        # típusellenőrzés + build
pnpm test         # Vitest
pnpm lint
pnpm fmt
```

> PowerShellben, ha a `pnpm` szkript le van tiltva, használd a `pnpm.cmd`-t.

Online módhoz a PHP API is kell (`php -S 127.0.0.1:8000 -t server/api server/api/index.php`); a Vite a `/api` kéréseket ide proxyzza. Részletek: [server/README.md](server/README.md).

## Struktúra

```
server/                 # PHP/MySQL multiplayer backend (nem része a Vite buildnek)
├── api/                # HTTP belépési pont (index.php, .htaccess) → deploy: public_html/solvyr-prime/api/
├── lib/                # szerveroldali PHP kód, HTTP-ről tiltva → deploy: public_html/solvyr-prime/lib/
├── config.example.php  # konfigurációs minta (a config.php nincs verziókezelve)
└── schema.sql
src/
├── main.tsx, App.tsx
├── ui/                 # React: GameCanvas, HUD, CommandConsole, MainMenu (beállításokkal), MultiplayerLobby, ResultScreen, Shop, LanguageSwitch, ui.css
├── i18n/               # többnyelvűség (hu/en): messages.hu.ts (forrásnyelv), messages.en.ts, t() / useT()
├── test/               # Vitest setup
└── game/               # Reacttől független játékmag
    ├── engine/         # Game (Pixi app, fix időlépéses loop, skálázás), AudioManager (hangok, szintetizált fanfár), FxRenderer
    ├── assets/         # SVG tank/terep assetek, fx/ (Kenney Particle Pack PNG-k), audio/ (OGG hangok)
    ├── entities/       # tank
    ├── multiplayer/    # API kliens és protokoll (HTTP polling)
    ├── systems/        # turnManager, upgrades, matchStats, barrelAnimation, particles, profileStorage, seededRandom, speech (Web Speech felolvasás, hangválasztás)
    ├── terrain/        # heightmap, TerrainMask (ütközés), Terrain (RenderTexture)
    ├── physics/        # ballisztika
    ├── state/          # Zustand store-ok: gameStore (HUD-nézet), multiplayerStore, commandStore (parancsnoki közlések), playerNames (játékosnevek)
    └── data/           # adatvezérelt definíciók (upgrade-ek)
```

A frontend (`src/`) és a backend (`server/`) szétválasztott: a Vite és a `tsc` csak a `src/` mappát látja, a szerver mappák átnevezése nem érinti a buildet. A frontend az API-t kizárólag a `VITE_MULTIPLAYER_API_URL` URL-en éri el (éles: `/solvyr-prime/api`, lásd `.env.production`), ami az `server/api/` telepítési helyének felel meg.

Elv: a nagy gyakoriságú adat (pozíciók) az engine-ben él, a Zustand store csak a HUD-hoz szükséges állapotot tartja.

A hangrendszer fejlesztési tervei, a parancsnoki beszéd és a következő eseményhangok (angle/power, target hit, terrain impact, missed) a [sound-redesign.md](docs/sound-redesign.md) dokumentumban vannak.

## Köszönet

A robbanás- és füstsprite-ok a [Kenney Particle Pack](https://kenney.nl/assets/particle-pack) csomagból valók (CC0), a licenc a `src/game/assets/fx/License.txt` fájlban van.

A hangeffektek (`src/game/assets/audio/*.ogg`: lövés, robbanás, tankmozgás) a [Freesound](https://freesound.org) oldalról származó, Creative Commons 0 (CC0) licenc szerinti forrásokból készültek. A WAV/FLAC fájlok OGG formátumba konvertálásához a [FreeConvert OGG Converter](https://www.freeconvert.com/ogg-converter/) eszközt használtam. A konvertálás a fájlméret és a webes betöltés optimalizálását szolgálja; a játék futásidejű hangbetöltése az OGG fájlokra hivatkozik. Az egyes eredeti Freesound-oldalak és szerzők még nincsenek fájlonként rögzítve, ezért publikálás előtt ezeket külön ellenőrizni kell.

A háttérzene **nem CC0**, hanem a Pixabay Content License hatálya alá esik: „Cyberpunk Neon City" – [Pavel Prakapovich (energysound)](https://pixabay.com/hu/users/energysound-41316904/), [Pixabay](https://pixabay.com/music/). A forrás és a licenc-megjegyzések a `src/game/assets/audio/music/LICENSE.txt` fájlban vannak. A licenc önmagában álló terjesztést, értékesítést nem engedi, ezért a zenefájlt csak a játék részeként szabad terjeszteni; nyilvános repóba vagy publikus buildbe kerülés előtt a feltételeket ellenőrizni kell. A `plans/` mappában további próbaszámok vannak (energysound „Dark Cyberpunk Synthwave", Jamii „Warhammer Background Music"), ezek forrásai a `plans/license.txt`-ben vannak, és a játék nem használja őket. A játék a hang- és zenehasználatot nem jelzi a felületen; ha a megjelölést elvárjuk, a Beállításokban kell majd egy „Kreditek" nézet.

A betűtípusok az **Oxanium** (UI) és a **Rajdhani** (HUD adatok), SIL Open Font License 1.1 alatt, a [Fontsource](https://fontsource.org) csomagokból önállóan hosztolva (`@fontsource/oxanium`, `@fontsource/rajdhani`).

## Nyelvek

A felület magyarul és angolul érhető el. Az első indításkor a böngésző nyelve dönt (magyar böngészőnél magyar, egyébként angol), a választás a főmenüben módosítható, és `localStorage`-ban (`ballistic-front:locale`) marad meg.

Új szöveg hozzáadása: vedd fel a kulcsot a `src/i18n/messages.hu.ts` fájlba (ez a forrásnyelv), majd az `messages.en.ts`-be is; a TypeScript és az `i18n.test.ts` jelzi, ha hiányzik vagy a `{helyőrzők}` eltérnek. Komponensben `useT()`, Reacton kívül `t()` használható. Új fejlesztésnél a név és a leírás kulcsa `upgrade.<id>.name` és `upgrade.<id>.desc`.

Mértékegység: a játékban 1 px = 1 méter, a hosszok (mozgás, robbanási sugár) méterben jelennek meg. A szerver hibaüzenetei egyelőre angolul érkeznek.

Tervezett: a nyelvi fájlok a build-elt verzión kívülről is betölthetők lesznek (a beépített katalógus marad a tartalék), később admin felületről szerkeszthetően és új nyelvekkel; részletek a [ROADMAP.md](ROADMAP.md)-ben.

## Skinezhetőség

A felület színei a `src/ui/ui.css` elején lévő CSS változókból jönnek (`--bf-text`, `--bf-panel`, `--bf-primary`, …). Másik kinézethez elég felülírni őket, például:

```css
:root[data-skin="neon"] {
  --bf-panel: #0b0220;
  --bf-primary: #00f0ff;
}
```

és a gyökérelemen beállítani a `data-skin="neon"` attribútumot. A játéktér (Pixi) színei a `src/game/theme.ts` `Theme` objektumából jönnek (`DEFAULT_THEME`): háttér, égbolt, terep, játékosszínek, HUD-sávok, lövedék és effektek. Más kinézethez új `Theme` értéket kell adni a `Game`-nek (`theme` mező); a külső, betölthető skin még nincs meg. A tank SVG-k saját színei még nem tartoznak ide.

## Ütemterv

A sci-fi irányú továbbfejlesztés milestone-jai a [ROADMAP.md](ROADMAP.md) fájlban vannak.

## TODO

### 0. Projekt inicializálása

- [x] Vite + React + TS projekt létrehozása
- [x] PixiJS telepítése
- [x] Zustand telepítése
- [x] Vitest + RTL telepítése
- [x] ESLint + Prettier konfigurálása (a meglévő fájlok Prettier-formázása még hátravan)
- [x] `src/game` mappa létrehozása

### 1. Alap architektúra

- [x] `game/engine` létrehozása
- [x] `game/entities` létrehozása
- [x] `game/systems` létrehozása
- [x] `game/terrain` létrehozása
- [x] `game/physics` létrehozása
- [x] `game/state` létrehozása (Zustand)

### 2. PixiJS integráció

- [x] React komponens: `<GameCanvas />`
- [x] PixiJS Application inicializálása
- [x] Resize handler (fix pályaméret, skálázás, a meccs nem indul újra)
- [x] Game loop (ticker)
- [x] RenderTexture alapok

### 3. Terep

- [x] Zaj alapú generálás (value noise; Perlin később)
- [x] Terrain sprite + RenderTexture
- [x] Rombolás kör alakú `erase` körökkel + bitmaszk (barlang, kinyúló szikla is lehetséges)
- [x] Kráterperem égetése (sötét, kifelé halványodó égésnyom, csak a talajon)
- [x] Terrain collision detection

### 4. Tankok

- [x] Tank entity (pozíció, HP, mozgás)
- [x] Cső animáció (simított cénzás, visszarúgás lövéskor)
- [x] Tank sprite betöltése (SVG asset, játékosonkénti tint)
- [x] Mozgás korlátozása körönként

### 5. Lövedékek

- [x] Projectile entity
- [x] Ballisztikus fizika implementálása
- [x] Szél hatása
- [x] Ütközésvizsgálat (terep)
- [x] Robbanás logika
- [x] Particle effect (füst, robbanás; sprite-alapú: tűz, füst, törmelék, lökéshullám, torkolattűz, lövedékcsóva)

### 6. Körökre osztott rendszer

- [x] Turn manager
- [x] Input lock/unlock
- [x] HUD frissítése
- [x] Kör vége → következő játékos

### 7. Fejlesztési rendszer

- [x] Upgrade definíciók (adatvezérelt)
- [x] XP rendszer
- [x] Bolt UI
- [x] Tank statok frissítése upgrade után
- [x] XP és fejlesztések mentése (`localStorage`)

### 8. UI (React)

- [x] HUD (szög, erő, szél, HP/pajzs/páncél csíkok jelmagyarázattal)
- [x] Menü (indítás, haladás törlése)
- [x] Upgrade képernyő (bolt az eredményképernyőn)
- [x] Eredmény kijelzés (győztes, lövés/sebzés/XP statisztika)
- [x] Parancsnoki konzol (gépelési effekt, felolvasás), győzelmi fanfár és bemondás
- [x] Beállítások: nyelv, hang, játékosnevek
- [x] Animált UI elemek (CSS: fade-in, pop-in, gomb hover; `prefers-reduced-motion` támogatás)

### 9. Tesztelés

- [x] Fizika tesztek
- [x] Terrain collision tesztek
- [x] Upgrade rendszer tesztek
- [x] Turn manager tesztek
- [x] Védelmi modell tesztek (sebzésfüggvény, pajzsregeneráció)
- [x] i18n és nyelvváltó tesztek
- [x] React komponens tesztek (menü, eredményképernyő)
- [x] Parancsnoki közlések és hangválasztás tesztjei

### 10. Multiplayer (v1: PHP/MySQL, HTTP polling)

- [x] Szoba létrehozása és csatlakozás PHP API-végpontokkal
- [x] MySQL-ben tárolt, verziózott JSON eseménynapló és szinkronállapot
- [x] Determinisztikus meccsindítás (terep seedje, kezdő játékos, fejlesztések)
- [x] Mozgás- és lövésesemények visszajátszása, körönkénti szél rögzítése
- [x] Lekérdezéses szinkronizálás, újracsatlakozás és ütköző frissítések kezelése
- [x] `single` / `multi` engine mód, Reacttől függetlenül
- [x] Online meccs utáni upgrade és host által indított visszavágó
- [x] Zustand-alapú lobby állapot és lobby UI
- [x] Két klienses szinkron- és visszajátszási tesztek, telepítési leírás

WebSocket, szerveroldali fizika és anti-cheat nem része az első verziónak.
