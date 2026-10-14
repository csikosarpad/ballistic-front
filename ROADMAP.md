# Ballistic Front – ütemterv

Hosszú távú cél: sci-fi, Galaxy Tactics-hoz hasonló látvány (több karakter csapatonként, lebegő szigetek, képességek, erőterek, neon effektek). Ez több hónap, akár 1–2 év. A milestone-ok egymásra épülnek; mindegyik külön branchen és PR-ban készül.

## Alapelvek

- A játéklogika Reacttől független és determinisztikus; az online mód a közös seedre és az eseménynaplóra épül, ezért minden új mechanikának fix időlépésűnek és sorrendfüggetlennek kell lennie.
- Új mező a mentésben vagy az upgrade snapshotban csak verziózott migrációval kerülhet be.
- Az átnevezések külön, tisztán mechanikus commitban készülnek.
- A hot-seat mód megmarad.

## Döntések

- **Védelmi modell**: három réteg kopik sorban: erőtér pajzs → fizikai páncélpontok → HP, 1:1 arányban. A pajzs körönként visszatöltődik, a páncél nem. A sorrendet egyetlen tiszta függvény rögzíti, tesztekkel.
- A meglévő „páncél” fejlesztés (`armor`) a páncélpontokat adja; az azonosító megmarad, így a mentett szintek érvényesek.
- A pajzsregeneráció (kezdeti érték: a maximum 20%-a körönként, `shieldRegen`) a statokban konfigurálható; külön fejlesztés még nincs rá. Ha az egységet a két köre között találat érte, abban a körben nem töltődik.
- A T röppálya-előnézet meccsenként és játékosonként egyszer használható; használat után a HUD-on letiltott.

## Milestone-ok

### M0 – Stabilizálás

- [x] Szerver mappák átnevezése (`api/`, `lib/`), README-k frissítése
- [x] Két klienses szinkron- és visszajátszási tesztek (`multiplayerSync.test.ts`, `replay.test.ts`)
- [x] Prettier konfiguráció (`.prettierrc.json`); a meglévő fájlok egységesítése még hátravan (`pnpm fmt`)
- [x] Éles telepítés és smoke test új mappanevekkel
- [x] Fejlesztések életszerűbb elnevezése és méterben megadott értékei
- [x] Többnyelvűség (magyar/angol), `src/i18n`
- [x] UI skin alapja: a `ui.css` színei CSS változókban (`--bf-*`)
- [x] Pixi `Theme` objektum (`src/game/theme.ts`): terep, égbolt, játékosok, HUD-sáv, lövedék és effektek színei
- [ ] Külső nyelvfájlok (`locales/<kód>.json`, `locales/index.json`): beépített katalógus a tartalék, kulcsonkénti felülírás, helyőrző-validáció, gyorsítótár, dinamikus nyelvlista
- [ ] Külső skin JSON (csak színek és textúra-útvonalak, kódvégrehajtás nélkül)
- [ ] Admin felület a fordításokhoz (API-ból; jogosultságkezeléssel), új nyelvek felvétele

### M1 – Védelmi modell

- [x] Sebzésfüggvény (pajzs, páncél) tesztekkel
- [x] Pajzsregeneráció a turn managerben (a `beginTurn`-ben, a Game és a visszajátszási teszt is ugyanazt hívja)
- [x] Meglévő páncél-fejlesztés összevonása (az `armor` azonosító marad, mostantól fogyó páncélpont; új `shield` fejlesztés)
- [x] HUD és tank fölötti kijelzés: külön HP-, pajzs- és páncélcsík (csak ha van), jelmagyarázat, letiltott T gomb használat után
- [x] Találat utáni kör: nincs pajzsvisszatöltés
- [x] Profil- és snapshot-migráció verziószámmal (`STORAGE_VERSION`)
- [ ] Értékek hangolása játékpróbával (pajzs/páncél +20 szintenként, 20% regeneráció); döntés az alap pajzsról/páncélról (most 0)

### M2 – Egységmodell

- [ ] `Tank` → `Soldier` mechanikus átnevezés (külön commit)
- [ ] Több egység csapatonként, csapatkezelés a turn managerben
- [ ] Protokoll és snapshot bővítése (csapat, egység azonosító)
- [ ] Célzó kar/fegyver animáció a csőanimáció helyett, placeholder sprite-ok

### M3 – Fegyverrendszer

- [ ] Adatvezérelt fegyverslotok
- [ ] Lézer (hitscan)
- [ ] Célkövető (homing) lövedék: fix lépés, determinisztikus célválasztás, tesztek
- [ ] Sci-fi boltszövegek (pl. antianyag robbanófej, nanokompozit váz)

### M4 – Taktikai réteg

- [ ] Energia / akciópont körönként
- [ ] Körszámláló és időkorlát
- [ ] Képességek (3 slot)
- [ ] Környezeti veszély (meteorok, seedből generálva)

### M5 – Terep v2

- [ ] Lebegő szigetek, több terepdarab
- [ ] Egységek leesése, esési sebzés
- [ ] Seedelt pályagenerátor-változatok

### M6 – Multiplayer v2

- [ ] 3–4 játékos vagy csapatok
- [ ] Újracsatlakozás
- [ ] Szerveroldali szabályellenőrzés, rate limit
- [ ] Lejárt szobák automatikus takarítása

### M7 – Sci-fi vizuális réteg

- [ ] Neon, additív blend (erőtér-villanás, pajzsbuborék)
- [ ] Parallax világűr-háttér
- [ ] Sötét cyberpunk UI

### M8 – Galaxy Tactics-szintű látvány (hosszú táv)

- [ ] Animált karakterek (skeleton alapú)
- [ ] Shaderek, kamera, hangdizájn
- [ ] Gamepad és érintésvezérlés
