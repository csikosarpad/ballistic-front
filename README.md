# Ballistic Front

Böngészős 2D ágyús/tankos játék (Scorched Earth / Worms / Gunbound stílus).

- két (vagy több) tank egymást lövi
- ballisztikus fizika (szög, erő, szél)
- rombolható terep
- tank mozgás korlátozott lépésszámmal
- fejleszthető ágyú, lövedék, páncél
- XP, bolt, meta-progresszió
- szép grafika (particle effektek, animációk, shaderek)

## Tech stack

Windows, Node.js 24, Vite, React 18, TypeScript, PixiJS 8 (WebGL), Zustand, Vitest + React Testing Library.

## Jelenlegi állapot

Játszható két játékos hot-seat módban: körökre osztott lövés, szeles ballisztika, rombolható terep, robbanás- és füstrészecskék, XP és fejlesztési bolt a meccsek között. Az XP és a fejlesztések `localStorage`-ban maradnak meg. A pálya fix 1280×720 logikai méretű, az ablakhoz skálázódik.

## Irányítás

- Főmenü: Játék indítása, Haladás törlése (megerősítéssel)
- ◀ / ▶ nyilak: mozgás (körönként korlátozott távolság)
- ▲ / ▼ nyilak: lövés ereje (±10, Shift: ±50)
- Ctrl + ◀ / ▶: cső szöge (±1°, Shift: ±5°; ◀ a bal oldali irány felé forgat)
- T: röppálya-előnézet (játékosonként meccsenként egyszer, az adott kör végéig)
- M: némítás be/ki (a beállítás megmarad)
- Szög és erő csúszók a HUD-on
- Szóköz: tűz
- Meccs végén: eredményképernyő statisztikával, bolt (XP-ből fejlesztés), Visszavágó és Főmenü

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

## Struktúra

```
src/
├── main.tsx, App.tsx
├── ui/                 # React: GameCanvas, HUD, MainMenu, ResultScreen, Shop, ui.css
├── test/               # Vitest setup
└── game/               # Reacttől független játékmag
    ├── engine/         # Game (Pixi app, fix időlépéses loop, skálázás)
    ├── assets/         # SVG tank sprite-ok, fx/ (Kenney Particle Pack PNG-k), audio/ (lövés, robbanás, tankmozgás)
    ├── entities/       # tank
    ├── systems/        # turnManager, upgrades, matchStats, barrelAnimation, particles, profileStorage
    ├── terrain/        # heightmap, TerrainMask (ütközés), Terrain (RenderTexture)
    ├── physics/        # ballisztika
    ├── state/          # Zustand store (HUD-nézet)
    └── data/           # adatvezérelt definíciók (upgrade-ek)
```

Elv: a nagy gyakoriságú adat (pozíciók) az engine-ben él, a Zustand store csak a HUD-hoz szükséges állapotot tartja.

## Köszönet

A robbanás- és füstsprite-ok a [Kenney Particle Pack](https://kenney.nl/assets/particle-pack) csomagból valók (CC0), a licenc a `src/game/assets/fx/License.txt` fájlban van.

A hangok (`src/game/assets/audio`) a [Freesound](https://freesound.org) oldalról valók, Creative Commons 0 (CC0) licenc szerinti szűréssel letöltve, így attribúció nem kötelező. Az egyes fájlok eredeti oldalát és szerzőjét nem rögzítettem; ha később publikálod a játékot, érdemes a forrásoldalakat egyenként is megerősíteni.

## TODO

### 0. Projekt inicializálása
- [x] Vite + React + TS projekt létrehozása
- [x] PixiJS telepítése
- [x] Zustand telepítése
- [x] Vitest + RTL telepítése
- [ ] ESLint + Prettier konfigurálása (ESLint kész, Prettier konfig hiányzik)
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
- [x] HUD (szög, erő, szél)
- [x] Menü (indítás, haladás törlése)
- [x] Upgrade képernyő (bolt az eredményképernyőn)
- [x] Eredmény kijelzés (győztes, lövés/sebzés/XP statisztika)
- [x] Animált UI elemek (CSS: fade-in, pop-in, gomb hover; `prefers-reduced-motion` támogatás)

### 9. Tesztelés
- [x] Fizika tesztek
- [x] Terrain collision tesztek
- [x] Upgrade rendszer tesztek
- [x] Turn manager tesztek
- [x] React komponens tesztek (menü, eredményképernyő)

### 10. Multiplayer (később)
- [ ] WebSocket szerver
- [ ] Autoritatív szerver logika
- [ ] Szinkronizált körök
- [ ] Anti-cheat alapok
