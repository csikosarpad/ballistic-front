# Gameplay progression – végrehajtási TODO

A [gameplay-elemzés](./gameplay-progression.md) mellé rendelt részletes munkalista.
A [roadmap](./roadmap.md) marad a központi státuszforrás; ez annak progressziós
részterületét bontja ellenőrizhető lépésekre. Nem új, párhuzamos projekt-roadmap.

Jelölés: `[x]` elkészült, `[ ]` hátravan. Az első iteráció elfogadott hatókör;
a további mechanikák az elemzés ajánlásai, a jelzett döntések előtt nem implementálandók.

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

## 2. Sector Operations MVP – következő csomag

Függőség: az 1. iteráció, majd a konfigurációs döntések. Cél: összesen három
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

## 3. Orbitális támogatás – az MVP után, tervezési kapuval

Függőség: a közös meccskonfiguráció és környezeti szabályok.

- [ ] Elkülöníteni az Orbital Scan szerepét a Smart Aimtől.
- [ ] Eldönteni a slotok számát, tölteteket, célzást és akcióköltséget; kiváltja-e a lövést?
- [ ] Első képességcsomag kiválasztása: scan, drone, pajzsprojekció, supply drop vagy kinetic strike.
- [ ] Horizontális XP-feloldás és korábbi XP-egyenlegek kezelése, korlátlan erőelőny nélkül.
- [ ] Közös képességakció, backend-eseményvalidálás, determinisztikus replay.
- [ ] HUD/célzás/visszajelzés és AI képességválasztás.
- [ ] Balansz-, mentési és multiplayer-regressziótesztek.

## 4. Egységosztályok – a taktikai alapok után

- [ ] Két első szárazföldi variáns erőssége/gyengesége, nem egyértelműen jobb utód.
- [ ] Stat-, fegyver- és prezentációs konfiguráció, meglévő fejlesztések érvényessége.
- [ ] Osztályválasztás, mentés, online snapshot és AI-stratégia.
- [ ] Minden szektor/osztály/modifikátor kombináció játékpróbája.
- [ ] Hover/orbitális mozgás csak külön fizikai és ütközési specifikáció után.

## 5. Hosszú távú single player

Függőség: változatos szektorok és taktikai összeállítások.

- [ ] Szektorfoglalás: célpontok, küldetésfeltételek, jutalmak, menthető hadjárat.
- [ ] Stratégiai AI-követelmények elkülönítése a meglévő harci AI-tól.
- [ ] Roguelite: elágazó útvonalak, kockázat/jutalom, külön run- és tartós profilállapot.
- [ ] Prestige csak opcionális kihívásként, külön döntés után.

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
