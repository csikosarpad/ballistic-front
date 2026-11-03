# Solvyr Prime: Siege Protocol – ütemterv

Hosszú távú cél: sci-fi, Galaxy Tactics-hoz hasonló látvány (több karakter csapatonként, lebegő szigetek, képességek, erőterek, neon effektek). Ez több hónap, akár 1–2 év. A milestone-ok egymásra épülnek; mindegyik külön branchen és PR-ban készül.

## Aktuális állapot (2026-11)

- A ResultScreen, a HUD és a játéktér sci-fi katonai vizuális rendszere működik.
- A játéktér rétegezett hátteret használ: csillagos ég, hegyek, atmoszféra, terrain és visszafogott szikla-dekorációk.
- A terrain fizikája, a ballisztika, a szél és a multiplayer determinisztikus működése megmaradt.
- A tank és a terep részletes SVG assetjei bekerültek; a fák és antennatornyok jelenleg nincsenek aktív pályadekorációként használva.
- A hangassetek OGG formátumra lettek optimalizálva; a hangrendszer jelenleg lövés-, robbanás- és tankmozgás-hangot kezel.
- A röppálya-előnézet most játékosonként és meccsenként fejleszthető töltetekkel működik; a fejlesztés neve magyarul **Célzástámogatás**, angolul **Smart Aim**.
- A részletes UX- és hang-redesign következő lépései külön checklistként szerepelnek alább.

## Alapelvek

- A játéklogika Reacttől független és determinisztikus; az online mód a közös seedre és az eseménynaplóra épül, ezért minden új mechanikának fix időlépésűnek és sorrendfüggetlennek kell lennie.
- Új mező a mentésben vagy az upgrade snapshotban csak verziózott migrációval kerülhet be.
- Az átnevezések külön, tisztán mechanikus commitban készülnek.
- A hot-seat mód megmarad.

## Designirány – Siege Platform

A jelenlegi tankok fokozatosan a Solvyr Prime világába illő **Siege Platform** egységidentitást
kapjanak. Ez elsősorban vizuális és terminológiai átpozicionálás: a mostani szárazföldi,
ágyús platform maradjon felismerhető, de ne egy valós tank közvetlen megfelelőjeként jelenjen
meg. A „Siege Platform” legyen később bővíthető egységcsalád, amelyhez eltérő fegyverzetű,
páncélzatú vagy akár más működési tartományú platformok is tartozhatnak.

- A játékos felé használt elnevezések és illusztrációk különüljenek el a jelenlegi belső
  `Tank` entitás- és fájlnevektől; a mechanikus átnevezés külön, későbbi feladat.
- Az első vizuális változat ne módosítsa a ballisztikát, a terepütközést, a mozgást, a
  mentéseket vagy a multiplayer protokollt.
- A gameplay-képernyő és a jelenlegi tankassetek Siege Protocol-világba illeszthetőségét
  külön vizsgálat rögzítse, mielőtt új egységasset vagy animáció készül.
- A csatolt terveken szereplő **Siege Platform A-1 / B-2** koncepció vizuális referencia,
  nem végleges modell- vagy osztálynév-döntés.

## Designirány – Tipográfia

Javasolt, ingyenes (SIL OFL 1.1) fontkészlet a modern military sci-fi hangulathoz:

| Szerep                   | Font         | Használat                        | Megjegyzés                                                     |
| ------------------------ | ------------ | -------------------------------- | -------------------------------------------------------------- |
| Elsődleges UI / címek    | **Oxanium**  | menü, panelcímek, gombok, shop   | `latin-ext` van: ő/ű támogatott                                |
| Logó / nagy cím akcentus | **Orbitron** | „SOLVYR PRIME”, „SIEGE PROTOCOL” | csak `latin`: **nincs ő/ű**, ezért csak ékezetmentes feliratra |
| HUD adatok / kis méret   | **Rajdhani** | HP, pajzs, páncél, XP, szél      | `latin-ext` van; kis méretben jól olvasható                    |

- Önálló hosztolás (pl. `@fontsource`) a Google Fonts CDN helyett: nincs külső kérés/GDPR-kockázat, offline is működik.
- Csak a használt betűsúlyok és subsetek (`latin`, `latin-ext`) kerüljenek be; `font-display: swap`, rendszerfont fallback.
- Fontbevezetés nem módosíthat játékmenetet; a HUD-méretek és a mobil elrendezés a betűméret-különbségek miatt újraellenőrzendők.

## Döntések

- **Védelmi modell**: három réteg kopik sorban: erőtér pajzs → fizikai páncélpontok → HP, 1:1 arányban. A pajzs körönként visszatöltődik, a páncél nem. A sorrendet egyetlen tiszta függvény rögzíti, tesztekkel.
- A meglévő „páncél” fejlesztés (`armor`) a páncélpontokat adja; az azonosító megmarad, így a mentett szintek érvényesek.
- A pajzsregeneráció (kezdeti érték: a maximum 20%-a körönként, `shieldRegen`) a statokban konfigurálható; külön fejlesztés még nincs rá. Ha az egységet a két köre között találat érte, abban a körben nem töltődik.
- A T röppálya-előnézet alapból 1, a **Célzástámogatás / Smart Aim** szintenként +1 meccsenkénti töltetet ad; korlátlan előnézet nincs.

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

- [ ] A belső `Tank` entitásnév egységmodellhez igazítása; a végleges fogalmi célnevet a Siege Platform modellel összehangolni (külön, mechanikus commit)
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
- [x] **Célzástámogatás / Smart Aim** fejlesztés: alap 1, szintenként +1 előnézet-töltet
- [x] Célzástámogatás-töltetek HUD-kijelzése magyar és angol nyelven
- [x] Célzástámogatás-töltetek multiplayer- és visszajátszás-szinkronizációja

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

- [x] Neon, sci-fi katonai HUD és additív vizuális effektek első rétege
- [x] Rétegezett csillagos ég-, hegy-, atmoszféra- és terrain-megjelenítés
- [x] OGG hangassetek bevezetése és webes betöltésre optimalizálása
- [ ] Siege Platform vizuális megvalósíthatósági vizsgálata: gameplay-képernyő, egységsziluett, SVG-rétegek és animációk; játékmeneti és multiplayer-viselkedés változatlanul hagyásával
- [x] Mobil játszhatóság: fekvő tájolás ajánlása, érintésbarát HUD és célzás (±1°/±10 gombok, nyomva tartás, húzásos célzás); részletes felmérés: `docs/game-redesign.md` „Mobil játszhatóság felmérése". Valós eszközös próba hátravan.
- [ ] Neon, additív blend (erőtér-villanás, pajzsbuborék)
- [x] Parallax világűr-háttér: csillagköd-kép (`src/game/assets/backgrounds/siege-sky.jpg`, 126 KB), lassan sodródó köd- és csillagréteg, három halványodó hegyréteg légköri homállyal; reduced-motion esetén mozdulatlan
- [ ] Sötét cyberpunk UI továbbfejlesztése
- [ ] Hang-redesign: angle/power visszajelző hangok
- [ ] Hang-redesign: target hit, terrain impact és missed hangesemények
- [ ] Tank motorhang lazy loading és további mobil optimalizálása

### M7b – Látványugrás: „orbitális sci-fi hadviselés" (PixiJS 8)

Alapelv: nem új UI-elemek, hanem a meglévő képernyők „megélénkítése". Csak megjelenítés; a fizika, mentés és multiplayer protokoll változatlan. Minden effektnek legyen kikapcsolható/`prefers-reduced-motion` változata, és mobilon mérni kell a teljesítményt (gyengébb eszközön alacsonyabb minőség).

**Első kör – hangulat**
- [x] Glow/Bloom a terepre: `pixi-filters` `AdvancedBloomFilter` (asztalon erősség 1,2 / blur 8, érintőeszközön 0,4 / blur 2; `bloomQuality.ts`). HUD glow: CSS `box-shadow`/`text-shadow` (panelek, aktív/hover gombok, pulzáló Tűz gomb; reduced-motion esetén nem pulzál). Hátravan: bloom a lövedékre, „Alacsony minőség" beállítás a bloom teljes kikapcsolásához
- [x] Parallax háttér (köd, csillagok, 3 hegyréteg) – kész, lásd M7
- [x] Solvyr Prime bolygó a háttérben – a háttérkép tartalmazza (bolygókorong, légkörfény)
- [x] Orbitális gyűrűállomás – a háttérkép tartalmazza
- [x] Bolygó finomítás: `siege-city-glow.jpg` és `siege-city-lights.jpg` additív rétegek a háttér bolygóján (a köddel együtt sodródnak, alpha lassan pulzál, reduced-motion esetén fix); külön bolygó-asset nem kellett
- [x] Animált HUD: fade-in, scanline, hologram-reveal, energy charge (CSS/Pixi ticker, GSAP nélkül)
- [ ] „Command hologram" HUD: finom zaj, scanline, villogó célkereszt, adatfolyam

**Második kör – visszajelzés**
- [x] Lövedéknyom: 26 pontos additív plazmacsík (`shellTrail.ts`), a lövedék felé vastagodó és erősödő, becsapódás után elhalványul; a korábbi füstcsík megmaradt
- [x] Részecskerendszer bővítése (becsapódás, szikra, törmelék)
- [x] Kamera-rázkódás találatkor (`screenShake.ts`): 0,35 s, lineárisan csillapodó, a robbanás sugarával és a sebzéssel arányos; reduced-motion esetén ki
- [x] Becsapódási effektek: lökéshullám, villanás
- [x] Köd és volumetrikus fény a terep fölött: űrpor, légköri köd, energia-haze

**Harmadik kör – shaderek**
- [ ] GLSL/fragment shaderek: pajzs-találat, energiafegyver, taktikai AI aktiválás
- [ ] Terep „scan" effekt: kör elején kék energiahullám fut végig a pályán („SCAN COMPLETE"), shader + maszk
- [ ] Orbitális csata a háttérben: flottaágyúk, védelmi állomások, pályán kívüli tüzek villanása (csak atmoszféra, nem játékelem)

Döntések (rögzítve):
- `pixi-filters`: **igen**. Első körben csak BloomFilter, GlowFilter, szükség esetén AdjustmentFilter (terepvonal, lövedéknyom, HUD-panelek, aktív gomb).
- GSAP: **nem**. Menü fade-in, panel slide-in, XP számláló, győzelmi banner CSS-sel vagy Pixi tickerrel megoldható; akkor kerül elő, ha kameramozgás, cinematic intro vagy komplex cutscene lesz.
- Bloom: asztalon erősség 1.2 / blur 8; mobilon 0.4 / blur 2, vagy teljesen ki „Alacsony minőség" módban (új beállítás).
- Külön bolygó-grafika: **nem**, a háttérkép bolygója marad.
- Városfény-réteg: **igen**, egyetlen új asset: `city_lights_overlay.png` (arany fények, várospöttyök, ipari zónák; átlátszó háttér), alpha 0,85↔1,0 lassú pulzálással (reduced-motion esetén fix). **Kép kell hozzá.**
- Hatás szerinti sorrend: 1. gameplay háttér (kész), 2. bloom a terepre, 3. bloom a HUD-ra, 4. lövedéknyom, 5. screen shake találatkor.

Döntési pontok: nincs nyitott; a városfény-PNG-re várunk.

### M8 – Galaxy Tactics-szintű látvány (hosszú táv)

- [ ] Animált karakterek (skeleton alapú)
- [ ] Shaderek, kamera, hangdizájn
- [ ] Gamepad és érintésvezérlés
