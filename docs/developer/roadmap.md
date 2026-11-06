# Solvyr Prime: Siege Protocol – ütemterv

Hosszú távú cél: sci-fi, Galaxy Tactics-hoz hasonló látvány (több karakter csapatonként,
lebegő szigetek, képességek, erőterek, neon effektek). A korábbi több hónapos, akár
1–2 éves becslés tájékoztató nagyságrend, nem vállalt ütemezés.

Ez a központi fejlesztési státusz- és döntési dokumentum. A milestone-azonosítók
tematikus csoportok, nem kötelező végrehajtási sorrend; az M7 vizuális munkái például
részben elkészültek az M2–M6 új játékmenete előtt. A tényleges függőségeket az adott
implementáció előtt kell rögzíteni. A fejlesztések külön branchen és PR-ban készülnek.

A jelenlegi használatot a [játékosútmutató](../user/guide.md), a technikai korlátokat a
[fejlesztői kontextus](./dev-notes.md), a történetet a [napló](./history.md) írja le.
A részletes designlisták saját részterületük leírásai, nem párhuzamos prioritási listák.
Jelölések: `[x]` megvalósított vagy dokumentált korábbi ellenőrzés; `[ ]` nyitott feladat.
A „javaslat” külön jóváhagyást igényel, és nem kész funkció.

A fejlődési plafon kódbázis-alapú elemzése és a szektorok, környezeti modifikátorok,
orbitális képességek, egységosztályok és kampány rangsora:
[Játékmenet és hosszú távú fejlődés](./gameplay-progression.md).
A jelenlegi és tervezett fejlesztési ágak áttekintő ábrája:
[Játékmenet-fejlesztési útvonal](./gameplay-development-path.md).

## Aktuális állapot (2026-11)

- A ResultScreen, a HUD és a játéktér sci-fi katonai vizuális rendszere működik.
- A játéktér rétegezett hátteret használ: csillagos ég, hegyek, atmoszféra, terrain és visszafogott szikla-dekorációk.
- A terrain fizikája, a ballisztika, a szél és a multiplayer determinisztikus működése megmaradt.
- A robbanással leválasztott talajdarabok azonnal eltűnnek a maszkból és a látványból;
  porladás, lehullás és omlási sebzés még nincs. A külön dekorációs réteg nem érintett.
- A ResultScreen részletes, rétegezett tank-SVG-t, a játéktér külön body/barrel asseteket használ.
  A terep RenderTexture és pixelmaszk, nem SVG; aktív dekorációként szikla-SVG-k vannak,
  a fa- és antennaassetek megmaradtak, de nincsenek a pályán.
- A hangassetek OGG formátumra lettek optimalizálva; a hangrendszer jelenleg lövés-, robbanás- és tankmozgás-hangot kezel.
- A röppálya-előnézet most játékosonként és meccsenként fejleszthető töltetekkel működik; a fejlesztés neve magyarul **Célzástámogatás**, angolul **Smart Aim**.
- Elkészült a parancsnoki konzol: gépelési effektes taktikai napló, a közlések felolvasása
  Web Speech API-val (hu/en/de, elérhető böngészőhangtól függően), szintetizált győzelmi
  fanfár és a győztes bemondása. Offline a játékosnevek a Beállításokban állíthatók.
- Offline AI és érintésbarát célzás működik; valódi telefonos ellenőrzés még hátravan.
- Öt seedelt terepprofil, két tank és hét összeadódó statfejlesztés van. A kampány
  aktuális művelete a főmenüben, a tényleges csataszektor a HUD-ban és 2,5 másodperces
  briefingben látható. Modifikátor, orbitális képesség, osztályválasztás és stratégiai hadjárat még nincs.
- Campaign Map C3 működik: öt szektoros elágazó térkép, P1 vs AI, OR feloldás,
  eredmény utáni visszatérés, helyileg mentett 0/5 → 5/5 teljesítés és v1→v2 migráció.
  Külön kampányreset és teljes mentéstörlés; extra kampányjutalom nincs.
- A részletes UX- és hang-redesign következő lépései külön checklistként szerepelnek alább.

## Alapelvek

- A fizikai logika Reacttől független; a Game koordinátor store-okhoz is kapcsolódik.
  Az online szimuláció közös seedre és revision szerinti eseménysorrendre épül.
  A fizika fix időlépésű, a körhatások logikai körhatárokhoz kötöttek; az eredmény
  nem függhet renderidőtől vagy pollingütemtől. Az események nem sorrendfüggetlenek.
- Új mező a mentésben csak migrációval kerülhet be. Online setup-/snapshotbővítéshez
  külön verziózás és kompatibilitáskezelés szükséges; a jelenlegi profilboríték
  `STORAGE_VERSION = 2` értéke csak helyi mentésverzió.
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
- A gameplay-képernyő és a jelenlegi tankassetek első technikai felmérését a
  [Siege Platform fejlesztési ütem](./game-redesign.md#6-siege-platform-fejlesztési-ütem) rögzíti;
  új asset készítése előtt a sziluettet és a rétegszerződést jóvá kell hagyni.
- A csatolt terveken szereplő **Siege Platform A-1 / B-2** koncepció vizuális referencia,
  nem végleges modell- vagy osztálynév-döntés.

## Designirány – Tipográfia

Megvalósított döntés: önállóan hosztolt **Oxanium + Rajdhani** (SIL OFL 1.1).
Az Orbitron korábbi logójavaslat, jelenleg nincs telepítve vagy használva.

| Szerep                   | Font         | Használat                        | Megjegyzés                                                     |
| ------------------------ | ------------ | -------------------------------- | -------------------------------------------------------------- |
| Elsődleges UI / címek    | **Oxanium**  | menü, panelcímek, gombok, shop   | `latin-ext` van: ő/ű támogatott                                |
| Logó / nagy cím akcentus | **Orbitron (opcionális terv)** | Ékezetmentes logó, ha később indokolt | Nem része a jelenlegi fontkészletnek |
| HUD adatok / kis méret   | **Rajdhani** | HP, pajzs, páncél, XP, szél      | `latin-ext` van; kis méretben jól olvasható                    |

- Önálló hosztolás (pl. `@fontsource`) a Google Fonts CDN helyett: nincs külső kérés/GDPR-kockázat, offline is működik.
- Csak a használt betűsúlyok és subsetek (`latin`, `latin-ext`) kerüljenek be; `font-display: swap`, rendszerfont fallback.
- Fontbevezetés nem módosíthat játékmenetet; a HUD-méretek és a mobil elrendezés a betűméret-különbségek miatt újraellenőrzendők.

## Döntések

- **Védelmi modell**: három réteg kopik sorban: erőtér pajzs → fizikai páncélpontok → HP, 1:1 arányban. A pajzs körönként visszatöltődik, a páncél nem. A sorrendet egyetlen tiszta függvény rögzíti, tesztekkel.
- A meglévő „páncél” fejlesztés (`armor`) a páncélpontokat adja; az azonosító megmarad, így a mentett szintek érvényesek.
- A pajzsregeneráció (kezdeti érték: a maximum 20%-a körönként, `shieldRegen`) a statokban konfigurálható; külön fejlesztés még nincs rá. Ha az egységet a két köre között találat érte, abban a körben nem töltődik.
- A T röppálya-előnézet alapból 1, a **Célzástámogatás / Smart Aim** szintenként +1 meccsenkénti töltetet ad; korlátlan előnézet nincs.
- A profil XP-je elkölthető egyenleg. A shop „ÖSSZESEN SZERZETT XP” felirata nem ezt
  tükrözi; ez ismert, nyitott UI-szöveghiba, nem létező életút-XP adat.
- A vizuális Siege Platform-irány nem jelent új egységosztályt vagy fizikát.

## Gameplay-prioritás – térképmód először (2026-11-05)

Az elfogadott szektoridentitás-iteráció elkészült: közös alap pályanév,
főmenü-/HUD-kijelzés és nem blokkoló briefing. A részletes
[progressziós TODO](./gameplay-progression-todo.md) a következő csomagok döntési
kapuit és ellenőrzéseit tartalmazza. A térképközpontú irány elfogadott prioritás;
a részletes mód-, jutalom- és balanszszabályok még döntést igényelnek.

A [gameplay-elemzés](./gameplay-progression.md) végrehajtási sorrendje:
**térkép + ALPHA-01 csatakör → mentett haladás → új szektorok és elágazások →
modifikátorok → horizontális feloldások/képességek/osztályok → stratégiai hadjárat**.

**Elkészült csomag: Campaign Map Foundation (C1+C2).**
Főmenü → térkép → meglévő ALPHA-01 csata → eredmény → térkép, helyi teljesítésmentéssel.
A képernyő/navigáció/meccskontextus alapjai elkészültek.
Csak egy pálya szükséges; nincs új fizika vagy extra kampányjutalom. A hot-seat/online
gyorscsata megmarad; a kampány mindig P1 vs AI. Kampányreset csak teljesítést,
a teljes mentéstörlés XP-t/szinteket/teljesítést töröl. Valós telefonos próba hátravan.
**Elkészült bővítés: C3 (2026-11-05); hosszabb balansz- és valódi telefonos próba még hátravan.**
Összesen öt játszható pont: ALPHA-01 / Training Grounds, DELTA-08 / Crystal Basin,
FORGE-17 / Industrial Expanse, VANGUARD-12 / Defense Grid, PRIME-00 / Capital Perimeter.
ALPHA → DELTA / FORGE → VANGUARD → PRIME; szabad ágbejárás, VANGUARD feloldása OR,
extra kampánybónusz/Smart Aim jutalom nélkül. PRIME biztosítása műveletzárás;
mind az öt szektor teljesítése 5/5, kihagyott ág és replay utólag is elérhető.
Közös szektorkatalógus, négy valódi új csatadefiníció, szektor-ID alapú mentés és
a meglévő ALPHA-teljesítés migrációja elkészült. Az ALPHA gyorscsata/online pálya változatlan.
A [részletes csataprofil-terv](./gameplay-progression.md#1010-c3-csataprofilok--részletes-tervezési-javaslat)
geometriája és palettája bekötött; a balansz játékpróbával tovább finomítandó.
Következő lépés: játékpróba, majd C4 közös modifikátor-/AI-policy fejlesztés külön döntéssel.

A Sector Operations közös katalógus-/terepkonfig része C3-at támogatja; két
modifikátor és online szektorválasztás későbbi bővítés. A korábbi háromszektoros
tartalmi javaslatot az öt célpontos C3 váltja fel. Tervezett szektor nem játszható célpont és nem
növeli a teljesítési nevezőt. A [megvalósíthatósági elemzés](./gameplay-progression.md#10-campaign-map--sector-progression-megvalósíthatóság)
elválasztja a Foundationt a teljes stratégiai hadjárattól és a közös online kampánytól.
A részletes feladatok a [progressziós TODO](./gameplay-progression-todo.md) 2. pontjában vannak.

## Milestone-ok

### M0 – Stabilizálás

- [x] Szerver mappák átnevezése (`api/`, `lib/`), README-k frissítése
- [x] Két klienses szinkron- és visszajátszási tesztek (`multiplayerSync.test.ts`, `replay.test.ts`)
- [x] Prettier konfiguráció (`.prettierrc.json`); a meglévő fájlok egységesítése még hátravan (`pnpm fmt`)
- [x] Éles telepítés és smoke test új mappanevekkel
- [x] Fejlesztések életszerűbb elnevezése és méterben megadott értékei
- [x] Többnyelvűség (magyar/angol/német), beépített katalógusok és helyőrzőtesztek
- [x] UI skin alapja: a `ui.css` színei CSS változókban (`--bf-*`)
- [x] Pixi `Theme` objektum (`src/game/theme.ts`): a terep, játékosok, tank fölötti sávok,
  lövedék és effektek színeinek közös alapja; nem teljes háttér-/SVG-skinrendszer
- [ ] Külső nyelvfájlok (`locales/<kód>.json`, `locales/index.json`): beépített katalógus a tartalék, kulcsonkénti felülírás, helyőrző-validáció, gyorsítótár, dinamikus nyelvlista
- [ ] Külső skin JSON (csak színek és textúra-útvonalak, kódvégrehajtás nélkül)
- [ ] Admin felület a fordításokhoz (API-ból; jogosultságkezeléssel), új nyelvek felvétele

### M1 – Védelmi modell

- [x] Sebzésfüggvény (pajzs, páncél) tesztekkel
- [x] Pajzsregeneráció közös `regenTankShield` helperrel a Game és a headless replay
  saját `beginTurn` folyamatában; nem a TurnManager belső funkciója
- [x] Meglévő páncél-fejlesztés összevonása (az `armor` azonosító marad, mostantól fogyó páncélpont; új `shield` fejlesztés)
- [x] HUD gyűrűmérők és tank fölötti HP-/pajzs-/páncélcsíkok; pajzs/páncél csak
  pozitív maximumnál. T gomb letiltása elfogyott töltet vagy zárolt vezérlés esetén
- [x] Találat utáni kör: nincs pajzsvisszatöltés
- [x] Helyi profilmigráció verziózott borítékkal (`STORAGE_VERSION = 2`)
- [ ] Online setup-/profilsnapshot szabály- és sémaverziózás; eltérő build kezelése
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
- [ ] Képességek korlátozott slotokkal; a korábbi 3 slot javaslat, a szám és az
  akcióköltség a gameplay-specifikáció előtt eldöntendő
- [ ] Környezeti veszély (meteorok, seedből generálva)
- [x] **Célzástámogatás / Smart Aim** fejlesztés: alap 1, szintenként +1 előnézet-töltet
- [x] Célzástámogatás-töltetek HUD-kijelzése magyar, angol és német nyelven
- [x] Célzástámogatás szintje az online profilsnapshotban; meccskezdéskor ebből
  inicializált töltetszám. Az előnézet aktiválása/fogyasztása helyi UI-állapot,
  nem külön multiplayer-esemény és nem része a headless replay tesztnek

### M5 – Terep v2

- [ ] Lebegő szigetek, több terepdarab
- [ ] Egységek leesése, esési sebzés
- [ ] Seedelt pályagenerátor-változatok

Az egyszerű szektorprofilok nem igénylik a lebegő szigeteket vagy az esési sebzést;
azok külön, későbbi terepmechanikák.

### M6 – Multiplayer v2

- [ ] 3–4 játékos vagy csapatok
- [x] Helyi session visszatöltése és eseménynapló újralekérése oldalfrissítés után (v1)
- [ ] Újracsatlakozás továbbfejlesztése: fizikai checkpoint, lejárt/elhagyott session UX
- [ ] Szerveroldali szabályellenőrzés, rate limit
- [ ] Lejárt szobák automatikus takarítása

### M7 – Sci-fi vizuális réteg

- [x] Neon, sci-fi katonai HUD és additív vizuális effektek első rétege
- [x] Rétegezett csillagos ég-, hegy-, atmoszféra- és terrain-megjelenítés
- [x] OGG hangassetek bevezetése és webes betöltésre optimalizálása
- [x] Siege Platform első kódbázis-alapú megvalósíthatósági és kockázati felmérése:
  [részletes terv](./game-redesign.md#6-siege-platform-fejlesztési-ütem).
  Vizuális prototípus, teljesítménymérés és art direction-jóváhagyás még nincs.
- [ ] SP0 – Sziluett és technikai rétegszerződés jóváhagyása a jelenlegi egyetlen játszható egységtípushoz (tank).
- [ ] SP1 – Tank redesign sci-fi ostromplatformmá, a fizikai méret és lövegkötés megtartásával.
- [ ] SP2 – Külön team-color és emissive/glow réteg; semleges páncélzat, olcsó mobil megjelenítés.
- [ ] SP3 – Meglévő lövegvisszarúgás finomítása és vizuális töltési animáció; új tüzelési késleltetés nélkül.
- [ ] SP4 – Becsapódási VFX továbbfejlesztése a meglévő részecskerendszeren: talaj/pajzs/páncél/HP szerinti visszajelzés.
- [ ] SP5 – Rétegzett terrain shader prototípus, rombolás- és bloom-kompatibilitási, valamint teljesítménykapuval.

Az SP-sorrend a vizuális munkacsomagon belüli ajánlás, nem írja felül a gameplay-prioritást.
Függőségek, becslések és ellenőrzési kapuk a
[részletes tervben](./game-redesign.md#6-siege-platform-fejlesztési-ütem).
A meglévő recoil és becsapódási effektek nem újonnan megvalósítandó alapfunkciók;
itt azok továbbfejlesztése szerepel. Új egységosztály nem része ennek az ütemnek.

**További M7 feladatok**
- [x] Mobil játszhatóság: fekvő tájolás ajánlása, érintésbarát HUD és célzás (±1°/±10 gombok, nyomva tartás, húzásos célzás); részletes felmérés: [játék redesign](./game-redesign.md), „Mobil játszhatóság felmérése”. Valós eszközös próba hátravan.
- [ ] Neon, additív blend (erőtér-villanás, pajzsbuborék)
- [x] Parallax világűr-háttér: csillagköd-kép (`src/game/assets/backgrounds/siege-sky.jpg`, 126 KB), lassan sodródó köd- és csillagréteg, három halványodó hegyréteg légköri homállyal; reduced-motion esetén mozdulatlan
- [ ] Sötét cyberpunk UI továbbfejlesztése
- [ ] Hang-redesign következő fázisai: eseményhangok, lazy loading, zeneválasztó,
  csatornánkénti hangerő, fanfár és beszédbeállítások; részletes státuszlista: [hangterv](./sound-redesign.md)
- [x] Parancsnoki konzol a HUD-ban (`CommandConsole`, `commandStore`): időbélyeges napló, gépelési effekt, reduced-motion esetén azonnali kiírás
- [x] Kompakt mobil HUD: 42 px védelmi műszerek, kisebb térközök; a konzol
  legfrissebb közlése egysoros sávként a felső HUD alatt, a csatatérre lógó napló helyett.
- [x] Parancsnoki felolvasás (`speech.ts`): `speechSynthesis`, nyelvenként férfi hang előnyben, mélyebb hangmagasság; némítás követi
- [x] Győzelmi fanfár (szintetizált helyettesítő) és „A csatát {név} nyerte!" bemondás
- [x] Játékosnevek a Beállításokban (offline), online a lobbynév az erősebb
- [x] Háttérzene (alap: energysound „Cyberpunk Neon City"); zene, parancsnok és effektek külön ki/be kapcsolható a Beállításokban
- [x] Mentett játék-hangerőcsúszka a Beállításokban (0–100%): zene, effektek és parancsnoki felolvasás; a némítás megőrzi a hangerőt
- [ ] Assetlicencek és fájlonkénti források ellenőrzése következő publikálás előtt,
  „Kreditek” nézet; a korábbi telepítés nem helyettesíti ezt az ellenőrzést
- [ ] Eredményképernyőn is látszó győzelmi közlés
- [ ] Shop XP-feliratának javítása az elkölthető egyenleghez; életút-XP csak külön adatmodelldöntéssel
- [x] Offline AI-ellenfél (tank): beállítás szerint a P2-t gép vezérli (szimulációval célzó, hibázó, tanuló, fejlesztéseit maga választó); lásd `src/game/systems/ai.ts`
- [x] Rendfokozat külön skálán, csillagokkal (0–5) a HUD-on mindkét játékosnál (a tankon nem fér el)
- [ ] AI finomhangolás: nehézségi szint választása, új képességek/osztályok értékelése,
  fegyverváltás, ha lesz több fegyver. Az AI harci közlései már megjelennek a konzolon;
  külön „AI ONLINE” / „VOICE ACTIVE” állapotjelző még nincs

### M7b – Látványugrás: „orbitális sci-fi hadviselés" (PixiJS 8)

Alapelv: nem új UI-elemek, hanem a meglévő képernyők „megélénkítése". Csak megjelenítés; a fizika, mentés és multiplayer protokoll változatlan. Minden effektnek legyen kikapcsolható/`prefers-reduced-motion` változata, és mobilon mérni kell a teljesítményt (gyengébb eszközön alacsonyabb minőség).

**Első kör – hangulat**
- [x] Glow/Bloom a terepre: `pixi-filters` `AdvancedBloomFilter` (asztalon erősség 1,2 / blur 8, érintőeszközön 0,4 / blur 2; `bloomQuality.ts`). HUD glow: CSS `box-shadow`/`text-shadow` (panelek, aktív/hover gombok, pulzáló Tűz gomb; reduced-motion esetén nem pulzál). Hátravan: bloom a lövedékre, „Alacsony minőség" beállítás a bloom teljes kikapcsolásához
- [x] Parallax háttér (köd, csillagok, 3 hegyréteg) – kész, lásd M7
- [x] Solvyr Prime bolygó a háttérben – a háttérkép tartalmazza (bolygókorong, légkörfény)
- [x] Orbitális gyűrűállomás – a háttérkép tartalmazza
- [x] Bolygó finomítás: `siege-city-glow.jpg` és `siege-city-lights.jpg` additív rétegek a háttér bolygóján (a köddel együtt sodródnak, alpha lassan pulzál, reduced-motion esetén fix); külön bolygó-asset nem kellett
- [x] Animált HUD: fade-in, scanline, hologram-reveal, energy charge (CSS/Pixi ticker, GSAP nélkül)
- [x] Műszerfal-mérők: gyűrűs HP/pajzs/páncél a HUD-ban (a tankok feletti csíkok maradtak), félkör alakú erőmérő a power csúszka mellett (`gauges.tsx`; mobil fekvő nézetben a félkör rejtett); üveg/folyadék hatás nélkül
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
- `pixi-filters`: **igen**. Jelenleg `AdvancedBloomFilter` a terrainen; a HUD glow CSS,
  a lövedéknyom additív rajzolás. GlowFilter/AdjustmentFilter használata nem kész funkció.
- GSAP: **nem**. Menü fade-in, panel slide-in, XP számláló, győzelmi banner CSS-sel vagy Pixi tickerrel megoldható; akkor kerül elő, ha kameramozgás, cinematic intro vagy komplex cutscene lesz.
- Bloom: asztalon erősség 1.2 / blur 8; mobilon 0.4 / blur 2, vagy teljesen ki „Alacsony minőség" módban (új beállítás).
- Külön bolygó-grafika: **nem**, a háttérkép bolygója marad.
- Városfény-réteg: **kész**, `siege-city-glow.jpg` és `siege-city-lights.jpg` additív
  rétegekkel. A korábbi `city_lights_overlay.png` javaslatot ezek váltották fel;
  további PNG-re nincs várakozás.
- Hatás szerinti sorrend: 1. gameplay háttér (kész), 2. bloom a terepre, 3. bloom a HUD-ra, 4. lövedéknyom, 5. screen shake találatkor.

Nyitott feladatok: alacsony minőség kapcsoló, további shader-/hologram-effektek.
A városfény-asset kérdése lezárt. Az orbitális háttérlátvány nem orbitális gameplay-képesség.

### M8 – Galaxy Tactics-szintű látvány (hosszú táv)

- [ ] Animált karakterek (skeleton alapú)
- [ ] Shaderek, kamera, hangdizájn
- [x] Érintésvezérlés alapja (M7); valós telefonos próba még nyitott
- [ ] Gamepad és további kameravezérlés
