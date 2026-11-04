# Solvyr Prime: Siege Protocol

A Solvyr Prime univerzumban játszódó böngészős, körökre osztott taktikai tüzérségi játék.

- két tank egymást lövi (hot-seat, offline AI vagy online kétjátékos mód)
- ballisztikus fizika (szög, erő, szél)
- rombolható terep
- tank mozgás korlátozott lépésszámmal
- fejleszthető ágyú, lövedék, páncél
- XP, bolt, meta-progresszió
- szép grafika (particle effektek, animációk, shaderek)
- Web Audio hangrendszer OGG assetekkel (lövés, robbanás, tankmozgás) és háttérzene (MP3, loop)
- parancsnoki konzol és felolvasott közlések (Web Speech API, magyar, angol és német), győzelmi fanfár
- beállítható játékosnevek (offline módban is)

## Tech stack

Windows, Node.js 24, Vite, React 18, TypeScript, PixiJS 8 (WebGL), Zustand, Vitest + React Testing Library.

## Jelenlegi állapot

Játszható két játékos hot-seat módban: körökre osztott lövés, szeles ballisztika, rombolható terep, robbanás- és füstrészecskék, XP és fejlesztési bolt a meccsek között. Az XP és a fejlesztések `localStorage`-ban maradnak meg. A pálya fix 1280×720 logikai méretű, az ablakhoz skálázódik.

Offline AI-ellenfél is választható. Jelenleg egy seedelt, tükrözött terepcsalád és egy
szárazföldi tanktípus van; több egység csapatonként, szektorok, környezeti modifikátorok,
orbitális képességek, prestige és kampány még nincsenek. A hét fejlesztés összesen
31 szintje 3768 XP-ből maximalizálható; az XP elkölthető egyenleg, nem életút-összesítő.

Online mód (v1): szobakódos lobby, két kliens közös seed alapján futtatott determinisztikus szimulációval, a mozgás- és lövésesemények HTTP-pollinggal szinkronizálódnak egy PHP/MySQL backenden. Meccs után fejlesztés és host által indított visszavágó. A backend részletei, helyi indítás és telepítés: [server/README.md](server/README.md). A két klienses szinkront és a determinisztikus visszajátszást tesztek fedik; az éles telepítés megtörtént.

## Irányítás

- Főmenü: Játék indítása, Online játék, Beállítások (nyelv, hang, játékosnevek), Mentés törlése (megerősítéssel)
- Beállítások → Hangcsoportok: Zene, Parancsnok (felolvasás) és Effektek (lövés, robbanás, tankmozgás, fanfár) külön ki/be kapcsolható (`localStorage`: `ballistic-front:audio-settings`). A HUD-os némítás (M) mindhármat felülírja. Az alapértelmezett és egyetlen bekötött szám energysound „Cyberpunk Neon City” (`neon-city`, az első támogatott felhasználói gesztus után indul); a katalógus a `src/game/data/music.ts`-ben van. Zeneválasztó még nincs.
- Beállítások → Játékosnevek: P1 és P2 neve (legfeljebb 16 karakter, `localStorage`: `ballistic-front:player-names`); üresen az alapértelmezett P1/P2 marad. A név megjelenik a HUD-on, az eredményképernyőn, a boltban és a felolvasott közlésekben. Online meccsen a lobbyban megadott név az erősebb.
- Beállítások → Ellenfél (offline): „Második játékos” vagy „Gép (AI)”, a következő meccstől.
  Az AI a P2-t vezérli, saját fizikával keres lövést és szükség esetén közelít.
  Normál célzása pontatlan szélbecslést és zajt használ; a becsapódásokból korrigál,
  korábbi meccseinek tapasztalata (`ballistic-front:ai-memory`) javítja a tudásszintjét.
  Smart Aim használatakor zaj nélküli találó lövést is kereshet, ha van töltete.
  A szöget és erőt egészre kerekíti, meccs végén pedig maga költi el XP-jét a harci
  statisztikák szerint. AI-meccsen csak P1 vásárolhat kézzel; az AI-tapasztalat külön törölhető.
- Rendfokozat: a HUD 0–5 csillagot mutat. Az AI-é tapasztalatból (`rankStars`),
  az emberé a megvásárolt fejlesztések arányából (`profileStars`) származik;
  nem életút-XP vagy külön profilszint.
- ◀ / ▶ nyilak: mozgás (körönként korlátozott távolság)
- ▲ / ▼ nyilak: lövés ereje (±10, Shift: ±50)
- Ctrl + ◀ / ▶: cső szöge (±1°, Shift: ±5°; ◀ a bal oldali irány felé forgat)
- T: röppálya-előnézet (alapból játékosonként 1 meccsenkénti töltet; a Célzástámogatás szintenként +1-et ad, maximum 4; egy aktiválás az adott kör végéig tart)
- M: némítás be/ki (a beállítás megmarad; a hangot és a felolvasást is érinti)
- Szög és erő csúszók a HUD-on
- Szóköz: tűz
- Parancsnoki konzol (HUD, jobb oldalt): időbélyeges taktikai napló „gépelési effekttel", a szöveget a böngésző `speechSynthesis` hangja az aktuális nyelven fel is mondja (mélyebb, lehetőleg férfi hang). Közlések: „Cél befogva" (körönként egyszer, az első célzás/mozgás után), lövésenként legfeljebb egy eredményjelzés (megsemmisítés, kritikus sérülés, páncélsérülés, pajzsösszeomlás, találat, nem sikerült), meccs végén fanfár és „A csatát {név} nyerte!". A szövegek a `command.*` i18n kulcsok; a hang jellemzői (`VoiceSettings`) később a beállításokból módosíthatók lesznek.
- Parancsnoki hangok: két megfelelő hang esetén külön hang, egyébként közös hang;
  P2 minden esetben magasabban és gyorsabban szól. A célbefogás és találateredmény a
  lövőhöz, a kritikus sérülés a sérült félhez, a győzelmi közlés a győzteshez tartozik.
- Meccs végén: eredményképernyő statisztikával, bolt (XP-ből fejlesztés), Visszavágó és Főmenü
- Védelem: három réteg, ebben a sorrendben kopnak: erőtér pajzs → fizikai páncél → HP (1:1 arányban, `src/game/systems/damage.ts`). A pajzs a soron lévő egységnél körönként a maximum 20%-ával töltődik vissza, kivéve ha az egységet a két köre között találat érte (akkor abban a körben nem). A páncél nem töltődik vissza. A HUD koncentrikus gyűrűmérőket, a tank fölötti kijelzés vékony HP-, pajzs- és páncélcsíkokat használ. A pajzs és páncél csak pozitív maximumnál látszik (alapból nincs, a boltban vehető). Az ellenfél pajzsának, páncéljának és HP-jának okozott sebzés után is jár XP, győzelemért további 50.
- Mentés: az XP és a szintek verziózott borítékban (`ballistic-front:profiles`, `version: 2`) maradnak meg; a régi `…:profiles:v1` mentést a játék első betöltéskor átveszi. Online meccsen mindkét kliensnek ugyanazt a buildet kell futtatnia.
- Érintésvezérlés: ±1° / ±10 erő gombok, nyomva tartásos ismétlés és tankközelből indított húzásos célzás. Indításkor támogatott érintőböngészőben teljes képernyőt és fekvő tájolást kérünk; elutasítás vagy hiányzó támogatás esetén a bezárható tájolási tipp marad. Valós iOS/Android eszközös ellenőrzés még hátravan.

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

Online a körönkénti szél közös seedből számolódik, nem külön lövési payload.
A helyi profilboríték verziószáma nem online protokollverzió; a profilsnapshotnak
jelenleg nincs külön szabály-/sémaverziója. A helyi sessionből oldalfrissítés után a
napló újralekérhető; fizikai checkpoint és tartós online profil nincs.

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
├── i18n/               # többnyelvűség (hu/en/de): magyar forráskatalógus, angol és német fordítás, t() / useT()
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

A felület magyarul, angolul és németül érhető el. Mentett választás hiányában a böngésző
nyelve dönt: magyar esetén magyar, német esetén német, egyébként angol. A választás a
Beállításokban módosítható, és `localStorage`-ban (`ballistic-front:locale`) marad meg.

Új szöveg hozzáadása: vedd fel a kulcsot a `src/i18n/messages.hu.ts` fájlba (ez a forrásnyelv),
majd a `messages.en.ts` és `messages.de.ts` fájlokba is; a TypeScript és az `i18n.test.ts`
ellenőrzi a kulcsokat és a `{helyőrzőket}`. Komponensben `useT()`, Reacton kívül `t()`
használható. Új fejlesztésnél a név és leírás kulcsa `upgrade.<id>.name` és `upgrade.<id>.desc`.

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

és a gyökérelemen beállítani a `data-skin="neon"` attribútumot. A `src/game/theme.ts`
`Theme` objektuma a játéktér színeinek egy részét kezeli (`DEFAULT_THEME`): terep,
játékosszínek, tank fölötti sávok, lövedék és effektek. A háttérrétegek, egyes UI-elemek
és SVG-k saját színeket is használnak, ezért nem minden szín cserélhető ezzel.
A `Game.theme` jelenleg belső mező, nincs publikus skinválasztó vagy külső skinbetöltés.

## Dokumentáció és ütemterv

A README a jelenlegi működés és indítás belépési pontja; nincs külön, párhuzamos backlogja.

| Dokumentum                                                                                                                  | Szerep                                                                                |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [ROADMAP](./ROADMAP.md)                                                                                                     | Központi fejlesztési státuszok, milestone-ok és nyitott döntések                      |
| [Fejlesztői kontextus](./dev-notes.md)                                                                                      | A jelenlegi architektúra és fejlesztési korlátok rövid összefoglalója                 |
| [Játék redesign](./docs/game-redesign.md)                                                                                   | Vizuális/UX részletek, referenciaelemzések, mobil és asset-hatókör                    |
| [Hang-redesign](./docs/sound-redesign.md)                                                                                   | Hangrendszer és kapcsolódó részletes feladatok                                        |
| [Gameplay és fejlődés](./docs/gameplay-progression.md)                                                                      | Döntés-előkészítő rangsor és ajánlott MVP, nem elfogadott implementációs specifikáció |
| [ResultScreen UI rendszer](./docs/todos/result-screen-ui-system.md)                                                         | Megvalósított prezentációs szerződés és megmaradt korlátok                            |
| [ResultScreen redesign](./docs/todos/result-screen-redesign.md) és [neon polish](./docs/todos/result-screen-neon-polish.md) | A lezárt vizuális iterációk ellenőrzőlistái                                           |
| [Fejlődési napló](./docs/history.md)                                                                                        | Dátumozott történet; nem aktuális feladatlista                                        |
| [Backend README](./server/README.md)                                                                                        | API, helyi indítás és telepítés                                                       |

A részletes tervek nem jelentenek automatikus termékjóváhagyást. A történeti listák
korábbi mérési és teszteredményei nem helyettesítik az aktuális validációt.
WebSocket, szerveroldali fizika és teljes csalásvédelem nem része a multiplayer v1-nek.
