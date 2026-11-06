# Gameplay progression – végrehajtási TODO

A [gameplay-elemzés](./gameplay-progression.md) mellé rendelt részletes munkalista.
A [roadmap](./roadmap.md) marad a központi státuszforrás; ez annak progressziós
részterületét bontja ellenőrizhető lépésekre. Nem új, párhuzamos projekt-roadmap.

Jelölés: `[x]` elkészült, `[ ]` hátravan. **2026-11-05: elfogadott prioritás a térképmód.**
Elkészült: C1+C2 **Campaign Map Foundation**, a meglévő ALPHA-01 csatakörével.
**2026-11-05: C3 öt szektora, szabad ágbejárása, OR feloldása és bónusz nélküli
első csomagja elkészült.** Öt valódi csata és mentésmigráció működik.
Hosszabb ember/AI balanszpróba és valós telefonos ellenőrzés még hátravan.

## 1. Szektoridentitás – első iteráció

A meglévő pálya neve **SECTOR ALPHA-01 / Training Grounds**. A nevek és
szektorazonosítók nyelvtől független katonai hívójelek; a magyarázó szövegek hu/en/de
fordítást kapnak. Az alap pálya fizikája, terepgenerálása és assetjei nem változnak.

- [x] Az alap szektor kódja és neve közös adatdefinícióból érkezik.
- [x] Főmenü: a játékcím alatt az aktuális harctér kódja és neve.
- [x] Meccsindítás: 2,5 másodperces **SECTOR BRIEFING** panel rövid eligazítással.
- [x] A felső középső HUD-ban a szektorkód és név folyamatosan látható.
- [x] A briefing offline, AI és online indítás/visszavágó közös meccséletciklusához kötött;
  körváltás és HUD-frissítés nem indítja újra.
- [x] A briefing prezentáció: nem blokkolja a bevitelt, fizikát, AI-t vagy replay-t,
  nem küld online eseményt és nem fogyaszt seedelt véletlent.
- [x] Responsive panel, reduced-motion animációkikapcsolás és időzítő-cleanup.
- [x] Célzott tesztek: menüpozíció, időtartam, nyelvváltás, új meccs és körváltás.
- [ ] Valós iOS/Android ellenőrzés: név, briefing, tájolási tipp és HUD együtt.

Ez még nem többpályás rendszer és nem oldja meg az XP-plafont.
Pályaválasztás, új fizikai szabályok és feloldások nincsenek az első iterációban.

## 2. Campaign Map – Foundation és első C3 bővítés elkészült

A [megvalósíthatósági elemzés](./gameplay-progression.md#10-campaign-map--sector-progression-megvalósíthatóság)
C1–C4 lépcsői. Először C1+C2: **menü → térkép → ALPHA-01 → eredmény → térkép**,
helyileg mentett teljesítéssel. Új pályák, modifikátorok, orbitális képességek és
osztályok nem előfeltételek. Az első katalógus csak ALPHA-01-et igényli; az új
képernyő/meccskontextus megteremtése a feladat része, nem már késznek feltételezett alap.
A 3. pont később ezt bővíti, nem új párhuzamos rendszert készít.
A C1/C2 alábbi listái az eredeti egycélpontos Foundation történeti elfogadási
feltételei; a jelenlegi öt szektoros működés és v2 mentés a C3 listában szerepel.

### Döntési kapuk – implementáció előtt

- [x] Mindig P1 ember vs P2 AI; a gyorscsata ellenfélválasztása változatlan.
- [x] Egy játszható ALPHA-01 pont, új pálya nélkül.
- [x] Helyi böngészőhaladás; meglévő P1/P2 profilok és AI-memória megosztása.
  Vereség/döntetlen/elhagyás nem teljesítés; eddigi harci XP megmarad, újrapróbálás lehetséges.
- [x] Progress: teljesített/összes, kezdetben 0/1; kijelölés nem teljesítés.
- [x] Külön kampányreset csak teljesítést töröl; teljes mentéstörlés XP-t, szinteket és kampányt.

### C1 – Térkép és valódi ALPHA-01 csatabelépés

Függőség: minimális ALPHA-katalógus és mód-/navigációs döntés. Nem ad kampánybónuszt.
Ez önmagában még nem a kész Foundation csomag; a C2-vel együtt szállítandó.

- [x] Minimális szektordefiníció és térképes meccskontextus kialakítása.
- [x] Új térképképernyő és menübelépés; meglévő gyorscsata indítása változatlan.
- [x] ALPHA-01 kiválasztása és indítása a meglévő tereppel/fizikával.
- [x] React gomb + SVG műveleti háló, cyan/arany stílus; külön Pixi térképmotor nélkül.
- [x] Kijelölt ALPHA, valós részletkártya, státusz és vissza gomb.
- [x] Tervezett pontokat az első verzió nem rajzol; nincs átnevezett ALPHA-csata.
- [x] Natív fókuszolható gombok és státuszfeliratok; emulált álló/fekvő mobil,
  legalább 44 px térképgombok. A térkép nem animált.
- [ ] Valós telefonos és képernyőolvasós használati próba.

### C2 – Mentett kampányváz

Függőség: C1 és offline csatakontekstus. Nincs új fizika vagy extra XP-jutalom.

- [x] Definíció, haladás és aktív csata külön adatai; kampánymentés v1, helyi UUID meccs-ID.
  Tartalomverzió/gráf csak több szektornál szükséges.
- [x] Térképes csata elkülönítése a gyorscsatától; csak a saját mód eredménye ad teljesítést.
- [x] Menü/current operation, briefing és HUD közös ALPHA-definícióból/meccskontextusból.
- [x] A Game lezáráskor teljesít; render/remount nem módosít haladást.
  Az egyetlen szektor boolean teljesítése idempotens, jutalomledger még nem szükséges.
- [x] Győzelem utáni teljesítés, vereség/döntetlen utáni újrapróbálás; térképre visszatérés.
- [x] ResultScreen kampánygomb és secured jelzés; new route nincs, mert nincs további útvonal.
- [x] Mentés, kezdeti üres kampány a régi profil mellé, kompatibilitási és tárolási hibajelzés.
  Hibás/ismeretlen mentésnél indítás tiltott, a mentést csak explicit reset írja felül.
- [x] Térképre/menübe visszatérés lezárja az elhagyott csatát és AI-időzítőit.
- [x] Tesztek: mentés-visszatöltés, duplikált teljesítés, vereség, döntetlen, visszavágó, reset.
- [x] Foundation elfogadás: teljes navigációs kör, egy pálya, kezdetben 0/1 majd 1/1;
  refresh után megmaradó teljesítés, változatlan gyorscsata/online játék.

### C3 – Elágazó művelet, öt játszható szektor

Függőség: C2 és négy további valódi csatadefiníció. A közös szektorkatalógus/
terepkonfiguráció minimális alapja a 3. pontból a C3 elé kerül; nem kell hozzá
modifikátor, online pályaválasztó vagy új fegyverrendszer.

#### Elfogadott első csomag

| Szektor | Név | Feloldás |
| --- | --- | --- |
| ALPHA-01 | Training Grounds | Kezdettől elérhető |
| DELTA-08 | Crystal Basin | ALPHA-01 teljesítése |
| FORGE-17 | Industrial Expanse | ALPHA-01 teljesítése |
| VANGUARD-12 | Defense Grid | DELTA-08 **vagy** FORGE-17 teljesítése |
| PRIME-00 | Capital Perimeter | VANGUARD-12 teljesítése |

ALPHA → DELTA / FORGE → VANGUARD → PRIME. A két ág nem zárja ki egymást;
a kihagyott ág később is bejárható. Mind az öt szektor beleszámít a teljesített/összes
haladásba. PRIME biztosítása a művelet lezárása (akár 4/5 mellett), az 5/5 minden
szektor teljesítését jelenti; a térkép és replay mindkét esetben használható marad.

- [x] Összesen 5 játszható pont: ALPHA-01, DELTA-08, FORGE-17, VANGUARD-12, PRIME-00.
- [x] DELTA-08 / Crystal Basin és VANGUARD-12 / Defense Grid nevei véglegesek ehhez a csomaghoz;
  DELTA-03 és GRID-09 nem új alias vagy további szektor.
- [x] Szabad ágbejárás, OR feloldás; nincs végleges ágkizárás.
- [x] Nincs extra kampánybónusz vagy +1 Smart Aim; a meglévő harci és győzelmi XP marad.
- [x] Részletes profiljavaslat dokumentálva: geometria, vizuális paletta, járhatóság,
  ALPHA regresszió és elfogadási próbák a
  [C3 csataprofil-tervben](./gameplay-progression.md#1010-c3-csataprofilok--részletes-tervezési-javaslat).
- [x] A profiljavaslat alapján C3 fejlesztés engedélyezve; balanszpróba továbbra is szükséges.
- [x] Öt valódi csatadefiníció: stabil ID, terepprofil és vizuális beállítás,
  alap fizikával; ALPHA változatlan, az új profilok a részletes terv paramétereit használják.
- [x] Körmentes gráf validálása, elfogadott OR feltétel, elérhető végpont és szabad ágbejárás.
- [x] Teljesített/elérhető/zárolt állapot levezetése; aktuális kijelölés külön kiemelés.
- [x] Kampánymentés bővítése szektor-ID alapú teljesítésekre; v1 `completed: true`
  migrációja csak ALPHA-01 teljesítésére, XP/szintek elvesztése nélkül.
- [x] Aktív csata szektor-ID-ja vezérli a teljesítést, briefinget, HUD-ot
  és eredményt; főmenü az elérhető kiválasztott/következő műveletet mutatja;
  a visszavágó ugyanazt a szektort indítja.
- [x] Kampányvége PRIME-nál, korábbi és kihagyott csaták replay-e; „új útvonal”
  csak újonnan elérhető pont esetén, replay győzelemkor ne legyen ál-feloldás.
- [x] Idempotens szektorteljesítés, mentési hibajelzés és újratöltés/reset tesztje.
  Extra bónusz hiányában XP+haladás jutalomtranzakció/ledger nem része a C3-nak.
- [x] Gyorscsata és online alapkonfiguráció változatlan; kampányfeloldás nem kapuzza a PvP-t.
- [x] Elfogadás: új mentés 0/5; ALPHA után két elérhető ág; bármelyik után VANGUARD;
  PRIME után műveletzárás; másik ág utólag teljesíthető, végül 5/5.
- [x] 100 seed/profil: determinisztikus, tükrözött, járható terep; ALPHA pontos regresszió.
  Alap/max stat kezdőmozgás és csőhelyzet, közeledés utáni találó lövések mindkét oldalról.
- [x] Böngészős teljes csatakör és mentés-visszatöltés; négy mobil/asztali viewporton
  nincs horizontális túlcsordulás vagy átfedő térképpont, gombmagasság legalább 64 px.
- [ ] Valós telefonos és képernyőolvasós C3 próba.
- [ ] Játékpróba: az útvonalválasztás érdemi, nem csak ágas rajz?

### C4 – Változatos csaták és opcionális polish

Függőség: C3 és a 3. pont további közös szabály-/modifikátoralapjai.

- [ ] A C3-ban elkészült terepprofilok további taktikai finomhangolása; a részletes
  profiljavaslat öt külön profilt tervez, a korábbi háromprofilos példa nem követelmény.
- [ ] Valós nehézség, gravitáció/szél, tereptípus és jutalom a kártyán.
- [ ] Kontrollált kampány-AI policy; a nehézség ne függjön észrevétlenül korábbi gyorscsatáktól.
- [ ] Közös fizika ellenőrzése lövedék/előnézet/Smart Aim/AI célzás és mozgástervezés esetén.
- [ ] Opcionális hu/en/de TTS: mute/voice kapcsoló, kijelölési bemondás, elavult beszéd törlése.
- [ ] Opcionális útvonalimpulzus/Pixi dekoráció a szabályoktól függetlenül, reduced-motionnel.
- [ ] Mobilon ne térjen vissza a harcteret takaró nagy konzol/részletpanel.

## 3. Sector Operations MVP – közös pálya- és szabályalap

Függőség: C1+C2 Foundation és a konfigurációs döntések. A minimális katalógus és
meccskontextus már a Foundation része. A valódi több-szektoros katalógus és
terep-/vizuális konfiguráció C3-at támogató része előre kerül.
A korábbi háromszektoros javaslatot az elfogadott ötcsomópontos C3 váltja fel;
a két modifikátor és az online szektorválasztás külön későbbi bővítés.

### Döntési kapuk

- [x] Az alap mellé DELTA-08, FORGE-17, VANGUARD-12 és PRIME-00 az első tartalmi csomag.
- [x] A C3 négy új terepprofilja és vizuális eltérése a részletes javaslat alapján bekötve.
- [ ] Meghatározni a két későbbi környezeti hatást (nem C3 előfeltétel).
- [x] Kampányban teljesítésalapú hozzáférés, az elfogadott C3 gráf szerint; nincs XP-belépődíj.
- [ ] Eldönteni az online pályahozzáférést úgy, hogy a host választása mindkét félnek használható legyen.
- [ ] Rögzíteni a szabályverziót, legacy online meccsek kezelését és a visszavágó pályaválasztását.

### Implementáció – a döntések után

- [x] Szektorkatalógus: stabil ID, név, leírás, terepprofil, vizuális beállítások.
- [ ] Közös, verziózott meccskonfiguráció és explicit hibák ismeretlen konfigurációnál.
- [ ] Offline választó és online host választása, lobby-előnézet, közös setup és replay.
- [x] Kampányszektor bekötése a főmenübe, briefingbe és HUD-ba; gyorscsata/online ALPHA.
- [x] Szektorfüggő terep és háttér; vizuális és játékmeneti véletlensorozatok elkülönítése.
- [ ] Közös környezeti szabályfeloldás: tényleges lövedék, előnézet, Smart Aim és AI.
- [ ] Hatások logikai körhatárokon, nem UI-időzítővel.
- [ ] Modifikátor-leírás választáskor és aktív hatás a briefingben/HUD-ban.
- [ ] Feloldás esetén profiladatok, migráció és mentés-visszatöltés.
- [ ] Régi alapkonfiguráció fizikai regressziótesztje.
- [ ] Két klienses, duplikált/darabolt eseményes és újracsatlakozási tesztek.
- [ ] Kezdőpozíciók, mozgás és találati lehetőségek ellenőrzése minden szektoron,
  alap- és maximális fejlesztésekkel, emberrel és AI-val.
- [ ] Játékpróba: az öt szektor ténylegesen eltérő döntésekre ösztönöz-e?

## 4. Orbitális támogatás – az MVP után, tervezési kapuval

Függőség: a közös meccskonfiguráció és környezeti szabályok.

- [ ] Elkülöníteni az Orbital Scan szerepét a Smart Aimtől.
- [ ] Eldönteni a slotok számát, tölteteket, célzást és akcióköltséget; kiváltja-e a lövést?
- [ ] Első képességcsomag kiválasztása: scan, drone, pajzsprojekció, supply drop vagy kinetic strike.
- [ ] Horizontális XP-feloldás és korábbi XP-egyenlegek kezelése, korlátlan erőelőny nélkül.
- [ ] Közös képességakció, backend-eseményvalidálás, determinisztikus replay.
- [ ] HUD/célzás/visszajelzés és AI képességválasztás.
- [ ] Balansz-, mentési és multiplayer-regressziótesztek.

## 4A. Választható lövedékek – megvalósíthatósági javaslat

**Státusz:** tervezési javaslat, még nem elfogadott roadmap-prioritás. A körökre
osztott játékmenethez jól illeszkedik: a játékos a lövés előtt választ típust,
majd a lövés a jelenlegi célzási és repülési fázisban oldódik fel. Külön
fegyverváltó kör vagy valós idejű célkövetés nem szükséges.

**Megvalósíthatóság: közepes, a jelenlegi engine megtartható.** A Game jelenleg
egyetlen lövedéket indít, majd becsapódáskor ugyanazt a robbanás-/tereprombolás-
folyamatot futtatja; az AI és a replay is ezt a szabályt modellezi. Az online
`fire` esemény most csak szöget és erőt visz át, a szerver pedig általános
JSON-eseményt tárol, nem szimulálja a harcot. Ezért a fegyverazonosító és a
fegyverspecifikus becsapódás-feloldás mindhárom kliensoldali útvonalon
(Game, AI-szimuláció, headless replay) azonos szabályból kell származzon.

### Döntési kapuk

- [x] Haladási modell: a játékos egy alapfegyverrel indul, a további fegyvereket
  XP-ért tartósan feloldhatja. Az MVP-ben a feloldott fegyverek lövésenként
  szabadon választhatók, nincs külön fogyó lőszer.
- [x] Fegyverkészlet-tulajdonlás: minden játékos a saját profillal feloldott
  fegyvereit viszi, offline, online és kampánytérképes meccsen egyaránt; nincs
  lobby-közös készlet. A meccssetup/snapshot rögzítse a használható ID-ket,
  hogy a készlet replay és visszavágó alatt ne változhasson.
- [x] **Robbanófej** upgrade: marad a fegyverfeloldásoktól különálló,
  kompatibilis sebzésfejlesztés. Az első fegyvercsomag rögzíti, mely
  fegyverosztályokra hat; a feloldás külön, stabil fegyver-ID-hoz kötött
  profiladat.
- [x] Fegyverenkénti XP-fejlesztés: nem része az MVP-nek. Később csak az kapjon
  fegyver-specifikus fejlesztést, amely új taktikai döntést ad (pl. AP-átütés,
  HE-sugár vagy Smart Missile-irányítás); a Robbanófej nem kerül automatikusan
  eltérő energiafegyverekre.
- [x] Fegyverenként eltérő alapértékek és hatások: egyedi sebzés, robbanási
  sugár, terephatás, valamint páncél-/pajzskölcsönhatás. Ezek adják a fegyverek
  közti taktikai változatosságot és a játékos fejlődésének új irányait; nem
  igényelnek automatikusan fegyverenként külön XP-fejlesztési ágat. Az Armor
  Piercing közvetlen találatot igényel; az átütés pontos szabálya és a
  fegyverenkénti számértékek balanszdöntést igényelnek.
- [x] Smart Missile elérhetetlen célpontja: ha a választott cél a beállított
  lövési erővel nem érhető el, a rakéta nem kap automatikus erőnövelést vagy
  garantált találatot; az addigi pályanyomvonal szerint halad tovább, majd
  annak megfelelően lehull/megsemmisül.
- [ ] Meghatározni a Smart Missile célfelvételi sugarát, fordulási korlátját,
  célpontválasztását és a fix lépésű, determinisztikus végfázisú korrekciót.
  Több lehetséges célpont esetén stabil ID szerinti döntés kell; a nem elérhető
  célpontra vonatkozó elfogadott szabály változatlanul hagyandó.
- [x] Seismic Charge: az HE-től elkülönülő, nagyobb tereprombolású,
  mérsékeltebb egységsebzésű hatás; késleltetett körhatás nélkül.
- [x] Közös fegyverkatalógus: minden játékos ugyanazokat a fegyver-ID-ket és
  definíciókat ismeri; az ismeretlen fegyver nem választható. A választó csak
  az adott játékos feloldott fegyvereit kínálja fel, offline és online is.
- [ ] Az online meccs szabály-/katalógusverzióját rögzíteni; eltérő vagy
  inkompatibilis verzió explicit hibát adjon, ne használjon csendes fallbacket.

### Javasolt végrehajtási lépések

- [ ] Típusos, stabil ID-jű `WeaponDefinition` katalógus és közös tiszta
  lövés-/becsapódás-szabályfeloldó; a szög, erő és fegyverazonosító a lövés
  paramétere legyen. A jelenlegi értékekkel a Standard Shell karakterizációs
  tesztje bizonyítsa a változatlan alapviselkedést.
- [ ] Első fegyvercsomag (4–5 típus, kiegyensúlyozva és XP-vel feloldható):
  **Standard Shell** (kezdő, jelenlegi viselkedés), **High Explosive** (nagyobb
  robbanási sugár, kisebb közvetlen sebzés), **Armor Piercing** (közvetlen
  találat, szűk hatás és páncélszabály), **Seismic Charge** (elsősorban
  tereprombolás), opcionálisan **Smart Missile** (végfázisú célkövetés).
  Az XP-költség és a feloldási sorrend balanszdöntés; a teljes csomag ne
  váljon automatikusan elérhetővé a kezdőprofilnak.
- [ ] A **Robbanófej** sebzés-upgrade, az új **High Explosive** fegyver és a
  későbbi fegyver-specifikus fejlesztések külön fogalmak/profiladatok legyenek.
  A meglévő Robbanófej-szintek kompatibilitása maradjon meg.
- [ ] Az első fegyvercsomag balanszánál ellenőrizni, hogy a közös Robbanófej
  fejlesztés mely fegyverekre érvényes; ne okozzon rejtett, nem szándékolt
  szorzóhalmozást az egyedi fegyverhatásokkal.
- [ ] A kezdőcsomag után külön fegyvernemként tervezni az energiafegyvereket:
  például lézerágyú/lézerfegyver (egyenes vagy hitscan), energiasokkoló
  (közeli hatás), energiagömb (lassú, területi lövedék) és villámcsapás
  (célpont-/lánchatás). Ezek nem részei az első lövedék-MVP-nek: eltérő
  célzási, találati, animációs és multiplayer-szabályt igényelnek.
- [ ] Az AP/HE/Seismic eltérő sebzés-/hatásszabályait, közvetlen tanktalálatot
  és terepütközést külön kezelni; sérülés és tereprombolás célzott tesztjei.
- [ ] Smart Missile csak a célfelvételi döntések után;
  az irányítás fix `dt`-vel, rendereléstől függetlenül és seedfogyasztás nélkül
  működjön. Elérhetetlen célpontnál a rakéta az addigi pályán marad, nem kap
  találati korrekciót. A pályaelhagyás, terepütközés és önsebzés szabálya legyen
  közös és determinisztikus.
- [ ] Fegyverfeloldások tárolása és migrációja a profilban; offline, online és
  kampánytérképes meccs egyaránt a játékos saját feloldott készletét használja.
  A meccssetup/snapshot rögzítse ezt a készletet, és az újrajátszás ugyanazt
  alkalmazza. A lövésnél a fegyver-ID szerepeljen a közös katalógusban, és
  tartozzon a lövő feloldott készletéhez; ettől eltérő ID-t explicit el kell
  utasítani, nem szabad másik fegyverre visszaesni.
- [ ] Játékmotor, röppálya-előnézet/Smart Aim és AI ugyanazt a fegyverdefiníciót
  és becsapódás-szabályt használja; ne legyen külön, eltérő AI- vagy preview-fizika.
- [ ] HUD-választó a meglévő célzási vezérlők mellé: billentyűzet, érintés,
  fókusz/akadálymentes címkék, hu/en/de fordítás, zárolás lövedékrepülés alatt.
  Lövés előtt a kiválasztott fegyver és releváns hatás legyen érthető.
- [ ] AI értékelje a fegyvereket várható sebzés, találati esély és saját
  kockázat alapján; azonos helyzetben és seed mellett legyen determinisztikus.
- [ ] A `fire` esemény tartalmazzon stabil `weaponId`-t; mindkét kliens azonosan
  validálja és alkalmazza. A régi, azonosító nélküli replay-esemény Standard
  lövedéket jelentsen; új, ismeretlen ID ne essen vissza Standardra.
- [ ] Replay-, kétklienses, darabolt/duplikált esemény- és újracsatlakozási
  teszt: azonos setup + eseménynapló azonos egységállapotot és terepet adjon.
  A headless replay ne csak saját magával, hanem a megosztott szabálymaggal
  egyezzen.
- [ ] Balanszpróba: minden fegyvernek legyen helyzeti előnye, de ne legyen
  domináns választás; ellenőrzés alap és fejlesztett statokkal, ember és AI ellen.

**Becsült MVP:** 10–16 nettó fejlesztői nap a tartós XP-feloldással és annak
profil-/snapshot-integrációjával; a véges lőszer, szerveroldali harcszimuláció
és új hálózati infrastruktúra nincs benne. Ez tartalmazza az első 4–5 típus
alapviselkedését, célzott UI-t, AI-, replay- és multiplayer-bekötést; a hosszas
balansziteráció és végleges VFX/hang nincs benne.
Az API jelenleg általános eseményeket tárol, így az eseménybővítés önmagában
kicsi, de a kliensek szabályazonossága és verzió-kompatibilitása elfogadási kapu.
Az egyes fegyverek saját fejlesztési ágai nem részei ennek a becslésnek: a jelenlegi
upgrade-rendszer közvetlenül közös `TankStats` értékeket módosít, ezért az egyedi
fegyverfejlesztésekhez külön, profilban mentett és online snapshotba kerülő
fegyver-szintű fejlesztési adatok és UI szükséges.

## 5. Egységosztályok – a taktikai alapok után

- [ ] Két első szárazföldi variáns erőssége/gyengesége, nem egyértelműen jobb utód.
- [ ] Stat-, fegyver- és prezentációs konfiguráció, meglévő fejlesztések érvényessége.
- [ ] Osztályválasztás, mentés, online snapshot és AI-stratégia.
- [ ] Minden szektor/osztály/modifikátor kombináció játékpróbája.
- [ ] Hover/orbitális mozgás csak külön fizikai és ütközési specifikáció után.

## 6. Hosszú távú single player

Függőség: változatos szektorok és taktikai összeállítások. A 2. pont egyszerű
útvonaltérképe ennél korábban készülhet el.

- [ ] Szektorfoglalás: célpontok, küldetésfeltételek, jutalmak, menthető hadjárat.
- [ ] Stratégiai AI-követelmények elkülönítése a meglévő harci AI-tól.
- [ ] Roguelite: elágazó útvonalak, kockázat/jutalom, külön run- és tartós profilállapot.
- [ ] Prestige csak opcionális kihívásként, külön döntés után.
- [ ] Közös online kampány csak külön backend-/tulajdon-/eredményhitelesítési specifikáció után.

## Szektornév-jelöltek

ALPHA-01, DELTA-08, FORGE-17, VANGUARD-12 és PRIME-00 játszható C3 tartalom;
a többi név későbbi jelölt.

| Kód | Név | Állapot |
| --- | --- | --- |
| SECTOR ALPHA-01 | Training Grounds | Meglévő alap harctér |
| SECTOR DELTA-08 | Crystal Basin | Játszható C3 szektor |
| SECTOR FORGE-17 | Industrial Expanse | Játszható C3 szektor |
| SECTOR BOREALIS-02 | Frozen Frontier | Jelölt |
| SECTOR HELIOS-21 | Solar Wastes | Jelölt |
| SECTOR ORBITAL-05 | Elevator Nexus | Jelölt |
| SECTOR TITAN-09 | Ringfall Ridge | Jelölt |
| SECTOR VANGUARD-12 | Defense Grid | Játszható C3 szektor |
| SECTOR VEYLORA-03 | Mining Colony | Jelölt |
| SECTOR PRIME-00 | Capital Perimeter | Játszható C3 szektor |
