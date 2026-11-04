# Gameplay progression – végrehajtási TODO

A [gameplay-elemzés](./gameplay-progression.md) mellé rendelt részletes munkalista.
A [roadmap](./roadmap.md) marad a központi státuszforrás; ez annak progressziós
részterületét bontja ellenőrizhető lépésekre. Nem új, párhuzamos projekt-roadmap.

Jelölés: `[x]` elkészült, `[ ]` hátravan. **2026-11-05: elfogadott prioritás a térképmód.**
Következő csomag: C1+C2 **Campaign Map Foundation**, a meglévő ALPHA-01 csatakörével.
A további mód-, feloldás- és jutalomszabályok döntési kapui megmaradnak.

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

## 2. Campaign Map – elsődleges következő fejlesztés

A [megvalósíthatósági elemzés](./gameplay-progression.md#10-campaign-map--sector-progression-megvalósíthatóság)
C1–C4 lépcsői. Először C1+C2: **menü → térkép → ALPHA-01 → eredmény → térkép**,
helyileg mentett teljesítéssel. Új pályák, modifikátorok, orbitális képességek és
osztályok nem előfeltételek. Az első katalógus csak ALPHA-01-et igényli; az új
képernyő/meccskontextus megteremtése a feladat része, nem már késznek feltételezett alap.
A 3. pont később ezt bővíti, nem új párhuzamos rendszert készít.

### Döntési kapuk – implementáció előtt

- [ ] Offline P1 vs AI kampány és külön megmaradó hot-seat/online gyorscsata jóváhagyása.
- [ ] Foundation mód-/szereposztása; elsőként egy játszható ALPHA-01 pont, új pálya nélkül.
- [ ] Kampány tulajdonosa, AI-memória/ellenfélprofil, vereség/döntetlen, elhagyás és újrapróbálás.
- [ ] Progress jelentése: teljesített/összes; kijelölés ne számítson teljesítésnek.
- [ ] Kampányreset és meglévő „Mentés törlése” hatása XP-re, haladásra és jutalmakra.

### C1 – Térkép és valódi ALPHA-01 csatabelépés

Függőség: minimális ALPHA-katalógus és mód-/navigációs döntés. Nem ad kampánybónuszt.
Ez önmagában még nem a kész Foundation csomag; a C2-vel együtt szállítandó.

- [ ] Minimális szektordefiníció és térképes meccskontextus kialakítása.
- [ ] Új térképképernyő és menübelépés; meglévő gyorscsata indítása változatlan.
- [ ] ALPHA-01 kiválasztása és indítása a meglévő tereppel/fizikával.
- [ ] React gombok + SVG útvonalak, cyan/arany stílus; külön Pixi térképmotor nélkül.
- [ ] Kijelölés, valós részletkártya, zárolási feltétel, vissza gomb.
- [ ] Tervezett pont csak „még nem telepített” jelzéssel; ne indítson átnevezett ALPHA-csatát.
- [ ] Billentyűzet, képernyőolvasó, érintési méretek, álló/fekvő mobil és reduced-motion próba.

### C2 – Mentett kampányváz

Függőség: C1 és offline csatakontekstus. Nincs új fizika vagy extra XP-jutalom.

- [ ] Definíció, haladás és aktív csata külön adatai; séma-/tartalomverzió, stabil meccs-ID.
- [ ] Térképes csata elkülönítése a gyorscsatától; csak a saját mód eredménye ad teljesítést.
- [ ] Menü/current operation, briefing és HUD a tényleges kontextusból.
- [ ] Egyszer feldolgozott csataeredmény; render/remount ne módosítsa a haladást.
- [ ] Győzelem utáni teljesítés, vereség/döntetlen utáni újrapróbálás; térképre visszatérés.
- [ ] ResultScreen kampánygomb és valós secured/new route jelzések.
- [ ] Mentés, kezdeti üres kampány a régi profil mellé, kompatibilitási és tárolási hibajelzés.
- [ ] Térképre/menübe visszatérés lezárja az elhagyott csatát és AI-időzítőit.
- [ ] Tesztek: mentés-visszatöltés, duplikált eredmény, vereség, döntetlen, visszavágó, reset.
- [ ] Foundation elfogadás: teljes navigációs kör, egy pálya, kezdetben 0/1 majd 1/1;
  refresh után megmaradó teljesítés, változatlan gyorscsata/online játék.

### C3 – Elágazó művelet és jutalmazás

Függőség: C2, legalább két további játszható csatadefiníció és elfogadott gráfszabályok.
Új bónuszjutalom nem kötelező az elágazáshoz, csak külön döntés után kerül be.

- [ ] Első bővítés darabszáma és nevei: javasolt későbbi cél az 5 játszható pont.
- [ ] DELTA-08 vs DELTA-03, VANGUARD-12 vs GRID-09 elnevezések véglegesítése.
- [ ] Planetáris/orbitális lépték; OR/AND feloldás, szabad vagy végleges ágkizárás.
- [ ] Körmentes gráf validálása, OR/AND feltételek, elérhető végpont és ágbejárás.
- [ ] Teljesített/elérhető/zárolt állapot levezetése; aktuális kijelölés külön kiemelés.
- [ ] Kampányvége, korábbi csaták replay-e és ténylegesen új útvonal jelzése.
- [ ] Egyszeri kampánybónusz döntése, elkülönítve a meglévő sebzés- és győzelmi XP-től.
- [ ] „+1 Smart Aim” pontos jelentése, szintplafon és maxos profil kezelése, vagy elhagyása.
- [ ] XP + haladás ismétlésbiztos mentési egysége/helyreállítása; félbeszakadt írás tesztje.
- [ ] Játékpróba: az útvonalválasztás érdemi, nem csak ágas rajz?

### C4 – Változatos csaták és opcionális polish

Függőség: C3 és a 3. pont szektor-/szabályalapjai.

- [ ] Öt csomópont / három terepprofil összerendelése vagy más elfogadott tartalomcsomag.
- [ ] Valós nehézség, gravitáció/szél, tereptípus és jutalom a kártyán.
- [ ] Kontrollált kampány-AI policy; a nehézség ne függjön észrevétlenül korábbi gyorscsatáktól.
- [ ] Közös fizika ellenőrzése lövedék/előnézet/Smart Aim/AI célzás és mozgástervezés esetén.
- [ ] Opcionális hu/en/de TTS: mute/voice kapcsoló, kijelölési bemondás, elavult beszéd törlése.
- [ ] Opcionális útvonalimpulzus/Pixi dekoráció a szabályoktól függetlenül, reduced-motionnel.
- [ ] Mobilon ne térjen vissza a harcteret takaró nagy konzol/részletpanel.

## 3. Sector Operations MVP – közös pálya- és szabályalap

Függőség: C1+C2 Foundation és a konfigurációs döntések. A minimális katalógus és
meccskontextus már a Foundation része. Tartalmi cél: összesen három
valóban eltérő szektor és két egyszerű modifikátor, legfeljebb egy aktív hatással.

### Döntési kapuk

- [ ] Kiválasztani az alap pálya mellé a két első játszható szektort a névjelöltekből.
- [ ] Meghatározni a két új terepprofilt, vizuális eltérést és a két környezeti hatást.
- [ ] Eldönteni a szektorok hozzáférését: alapból, XP-ből vagy teljesítményből.
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
- [ ] Játékpróba: három pálya ténylegesen eltérő döntésekre ösztönöz-e?

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

Csak az ALPHA-01 játszható. A többi név tartalmi jelölt, nem kész pálya és
nem végleges megvalósítási sorrend.

| Kód | Név | Állapot |
| --- | --- | --- |
| SECTOR ALPHA-01 | Training Grounds | Meglévő alap harctér |
| SECTOR DELTA-08 | Crystal Basin | Jelölt |
| SECTOR FORGE-17 | Industrial Expanse | Jelölt |
| SECTOR BOREALIS-02 | Frozen Frontier | Jelölt |
| SECTOR HELIOS-21 | Solar Wastes | Jelölt |
| SECTOR ORBITAL-05 | Elevator Nexus | Jelölt |
| SECTOR TITAN-09 | Ringfall Ridge | Jelölt |
| SECTOR VANGUARD-12 | Defense Grid | Jelölt |
| SECTOR VEYLORA-03 | Mining Colony | Jelölt |
| SECTOR PRIME-00 | Capital Perimeter | Jelölt |
