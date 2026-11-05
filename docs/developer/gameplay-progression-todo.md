# Gameplay progression – végrehajtási TODO

A [gameplay-elemzés](./gameplay-progression.md) mellé rendelt részletes munkalista.
A [roadmap](./roadmap.md) marad a központi státuszforrás; ez annak progressziós
részterületét bontja ellenőrizhető lépésekre. Nem új, párhuzamos projekt-roadmap.

Jelölés: `[x]` elkészült, `[ ]` hátravan. **2026-11-05: elfogadott prioritás a térképmód.**
Elkészült: C1+C2 **Campaign Map Foundation**, a meglévő ALPHA-01 csatakörével.
**2026-11-05: C3 öt szektora, szabad ágbejárása, OR feloldása és bónusz nélküli
első csomagja elfogadva.** Most csak a terv véglegesült; a C3 implementáció még hátravan.

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

## 2. Campaign Map – Foundation elkészült, tartalmi bővítés következik

A [megvalósíthatósági elemzés](./gameplay-progression.md#10-campaign-map--sector-progression-megvalósíthatóság)
C1–C4 lépcsői. Először C1+C2: **menü → térkép → ALPHA-01 → eredmény → térkép**,
helyileg mentett teljesítéssel. Új pályák, modifikátorok, orbitális képességek és
osztályok nem előfeltételek. Az első katalógus csak ALPHA-01-et igényli; az új
képernyő/meccskontextus megteremtése a feladat része, nem már késznek feltételezett alap.
A 3. pont később ezt bővíti, nem új párhuzamos rendszert készít.

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
- [ ] A profiljavaslat jóváhagyása; a paraméterek még nem elfogadott balanszértékek.
- [ ] Öt valódi csatadefiníció: stabil ID, terepprofil és vizuális beállítás,
  alap fizikával; ne pusztán átnevezett ALPHA-csaták legyenek. Pontos profilparaméterek
  és vizuális csomagok az implementáció előtti tartalmi feladat részei.
- [ ] Körmentes gráf validálása, elfogadott OR feltétel, elérhető végpont és szabad ágbejárás.
- [ ] Teljesített/elérhető/zárolt állapot levezetése; aktuális kijelölés külön kiemelés.
- [ ] Kampánymentés bővítése szektor-ID alapú teljesítésekre; v1 `completed: true`
  migrációja csak ALPHA-01 teljesítésére, XP/szintek elvesztése nélkül.
- [ ] Aktív csata szektor-ID-ja vezérelje a teljesítést, főmenüt, briefinget, HUD-ot
  és eredményt; a visszavágó ugyanazt a szektort indítsa.
- [ ] Kampányvége PRIME-nál, korábbi és kihagyott csaták replay-e; „új útvonal”
  csak újonnan elérhető pont esetén, replay győzelemkor ne legyen ál-feloldás.
- [ ] Idempotens szektorteljesítés, mentési hibajelzés és újratöltés/reset tesztje.
  Extra bónusz hiányában XP+haladás jutalomtranzakció/ledger nem része a C3-nak.
- [ ] Gyorscsata és online alapkonfiguráció változatlan; kampányfeloldás nem kapuzza a PvP-t.
- [ ] Elfogadás: új mentés 0/5; ALPHA után két elérhető ág; bármelyik után VANGUARD;
  PRIME után műveletzárás; másik ág utólag teljesíthető, végül 5/5.
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
- [ ] Véglegesíteni a C3 négy új terepprofilját és vizuális eltérését a részletes javaslat alapján.
- [ ] Meghatározni a két későbbi környezeti hatást (nem C3 előfeltétel).
- [x] Kampányban teljesítésalapú hozzáférés, az elfogadott C3 gráf szerint; nincs XP-belépődíj.
- [ ] Eldönteni az online pályahozzáférést úgy, hogy a host választása mindkét félnek használható legyen.
- [ ] Rögzíteni a szabályverziót, legacy online meccsek kezelését és a visszavágó pályaválasztását.

### Implementáció – a döntések után

- [ ] Szektorkatalógus: stabil ID, név, leírás, terepprofil, vizuális beállítások.
- [ ] Közös, verziózott meccskonfiguráció és explicit hibák ismeretlen konfigurációnál.
- [ ] Offline választó és online host választása, lobby-előnézet, közös setup és replay.
- [ ] A kiválasztott szektor bekötése a főmenübe, briefingbe és HUD-ba az alap szektor helyett.
- [ ] Szektorfüggő terep és háttér; vizuális és játékmeneti véletlensorozatok elkülönítése.
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

Csak az ALPHA-01 játszható. Négy további név elfogadott C3 tartalom, de még nem kész
pálya; a többi név későbbi jelölt.

| Kód | Név | Állapot |
| --- | --- | --- |
| SECTOR ALPHA-01 | Training Grounds | Meglévő alap harctér |
| SECTOR DELTA-08 | Crystal Basin | Elfogadott C3 terv; még nem játszható |
| SECTOR FORGE-17 | Industrial Expanse | Elfogadott C3 terv; még nem játszható |
| SECTOR BOREALIS-02 | Frozen Frontier | Jelölt |
| SECTOR HELIOS-21 | Solar Wastes | Jelölt |
| SECTOR ORBITAL-05 | Elevator Nexus | Jelölt |
| SECTOR TITAN-09 | Ringfall Ridge | Jelölt |
| SECTOR VANGUARD-12 | Defense Grid | Elfogadott C3 terv; még nem játszható |
| SECTOR VEYLORA-03 | Mining Colony | Jelölt |
| SECTOR PRIME-00 | Capital Perimeter | Elfogadott C3 terv; még nem játszható |
