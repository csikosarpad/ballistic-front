# Ballistic Front - játék redesign terv

## Cél

A játék vizuális rendszere egységes, rétegezett és később bővíthető legyen:

- modern katonai HUD a ResultScreenen;
- sötétkék, sci-fi katonai hangulat;
- jól elkülönülő játéktér-rétegek;
- skálázható desktop és mobil fallback megjelenítés;
- tank, űrharcos, drón és más egységtípusok támogatása közös presentation API-val.

## Dokumentációs felépítés

Ez a dokumentum a teljes játék redesign fő terve. A ResultScreen részletes, már elkészült
specifikációi továbbra is külön dokumentumokban maradnak:

- [ResultScreen UI rendszer](./todos/result-screen-ui-system.md)
- [ResultScreen redesign TODO](./todos/result-screen-redesign.md)
- [Neon ResultScreen polish](./todos/result-screen-neon-polish.md)

Az új játéktér- és asset-fejlesztések ebben a dokumentumban kapnak helyet.

## 1. Tank illusztráció redesign

### Ajánlott formátum: részletes, rétegezett SVG

A játék UI-jához elsődleges formátumnak a részletes SVG előnyösebb, mint egyetlen realisztikus
PNG:

- bármilyen viewporton élesen skálázódik;
- P1/P2 accent színezés programból megoldható;
- külön rétegként animálható a test, torony és löveg;
- a fények és outline-ok egységesen igazíthatók a HUD-hoz;
- kisebb fájlméret érhető el egy optimalizált, stilizált illusztrációnál;
- később könnyebb ugyanazt a presentation API-t űrharcosra vagy mechre átvezetni.

### Mikor indokolt PNG?

PNG akkor legyen kiegészítő vagy alternatív asset, ha:

- festményszerű, fotórealista felületet szeretnénk;
- komplex anyagtextúra, kosz, rozsda vagy álcafestés szükséges;
- az SVG túl sok útvonalat és túl nagy renderelési költséget eredményezne.

Javasolt kompromisszum:

1. SVG: sziluett, test, torony, lánctalp, kerék, löveg és fő outline.
2. Opcionális átlátszó PNG: finom acéltextúra vagy kopás.
3. PixiJS/React: cyan/gold státuszfények, selection glow és sebzésállapot.

### Tank asset specifikáció

```text
Modern battle tank side profile.
Semi realistic military vehicle.
Clean silhouette.
Visible road wheels and tracks.
Detailed turret.
Long cannon barrel.
Game UI illustration style.
Dark blue steel material.
Subtle cyan highlights.
Transparent background.
No text.
No smoke.
No battlefield.
High contrast.
Suitable for strategy game interface.
```

### Referencia szerinti végső vizuális irány

A csatolt referencia alapján a tank végső megjelenése az egyszerű katonai illusztrációnál
karakteresebb, technikai blueprint/combat dossier hangulatú legyen:

- oldalnézeti, jól olvasható modern harckocsi;
- sötét, majdnem fekete-kék háttér;
- vékony arany/narancs főkontúr;
- világosabb belső technikai vonalak és panelrészletek;
- jól elkülönülő lánctalp, road wheel-ek, páncéltest és torony;
- hosszú, hangsúlyos lövegcső;
- antenna, optikai egység és toronyfelső részletek;
- enyhén szabálytalan, kézzel rajzolt/katonai concept-art jellegű kontúr;
- minimális, de erős cyan vagy arany emissive kiemelés a játékos accentje alapján;
- átlátszó háttér az egység assetben, a környezeti blueprint/HUD-réteget a játék rajzolja.

Az új irányban nem cél a teljes fotórealizmus. A prioritás:

1. távolról is felismerhető tank-sziluett;
2. erős kontúr és olvasható komponensek;
3. ResultScreen méretben is részletgazdag megjelenés;
4. P1/P2 színezhetőség;
5. későbbi sérülés-, kijelölés- és upgrade-állapotok támogatása.

### Ajánlott végső asset-rétegek

```text
tank-base-dark
tank-track-outline
tank-road-wheels
tank-hull-outline
tank-turret-outline
tank-barrel-outline
tank-technical-details
tank-optics-and-antenna
tank-accent-glow
tank-damage-overlay
```

Az arany/narancs referencia-kontúr ne legyen beleégetve minden assetbe. A semleges
technikai rétegek maradjanak újraszínezhetők, hogy ugyanaz a tank használható legyen:

- P1 cyan;
- P2 gold/orange;
- sérült állapot;
- kijelölt állapot;
- későbbi space vagy mech presentation.

### Javasolt SVG rétegek

- `tank-shadow`
- `tank-track-left`
- `tank-track-right`
- `tank-road-wheels`
- `tank-hull`
- `tank-turret`
- `tank-barrel`
- `tank-details`
- `tank-accent-lines`
- `tank-highlight`

Az asset ne tartalmazzon játékosnevet, státuszt vagy szöveget. Ezeket a UI renderelje.

### Asset API

A `UnitPresentation` marad az egységtípus absztrakciója:

```ts
interface UnitPresentation {
  domain: "ground" | "space" | "air" | "mech";
  displayName: string;
  silhouetteAsset?: string;
  secondaryAsset?: string;
  primaryColor: number;
  secondaryColor: number;
  iconSet: string;
  accent: "cyan" | "gold" | "orange";
}
```

A tank-specifikus grafikai részletek ne kerüljenek a `UnitPanel` vagy `UpgradeRow`
komponensekbe.

## 2. Játéktér rétegezett redesign

### Rétegsorrend

```text
1. Csillagos ég
2. Távoli hegyek
3. Közeli hegyek
4. Harctér
5. Távoli tereptárgyak
6. Közeli tereptárgyak
7. Terep
8. Egységek és lövedékek
9. Előtér effektek
10. HUD és interakciós réteg
```

### 2.1 Csillagos ég

Feladata a sötét, mély háttér és a sci-fi hangulat megteremtése.

- sötétkék alap gradient;
- kis számú, alacsony alpha értékű csillag;
- opcionális halvány köd- vagy felhősáv;
- reduced-motion módban statikus;
- ne versenyezzen a HUD vagy a tank kontrasztjával.

Ajánlott megvalósítás: PixiJS `Graphics`/sprite réteg, korlátozott számú előre generált
csillaggal.

### 2.2 Távoli hegyek

- nagy távolságot érzékeltető, alacsony kontrasztú réteg;
- hideg kék/lila színárnyalat;
- lassú parallax mozgás csak akkor, ha később szükséges;
- egyszerű polygon vagy optimalizált SVG/PNG háttérasset.

### 2.3 Közeli hegyek

- sötétebb és részletesebb sziluett;
- a távoli hegyeknél nagyobb kontraszt;
- rétegezett csúcsok és völgyek;
- a játékos egységei mögött maradjon.

Ajánlott megvalósítás: PixiJS `Graphics` alapú generált sziluett, hogy a pálya seedje és
a látvány később összekapcsolható legyen.

### 2.4 Harctér

Ez a vizuális átmeneti sáv a háttér és a tényleges terep között.

- halvány köd, por vagy atmoszférikus vonalak;
- távoli fények és katonai jelzőpontok;
- nagyon visszafogott animáció;
- lövedékek és robbanások mögött jelenjen meg.

### 2.5 Szél megjelenítése

A szél egyszerre játékmeneti adat és atmoszferikus környezeti jelzés. A két információs
szint külön marad:

- a pontos érték és irány a React HUD `WindIndicator` komponensében jelenik meg;
- a játéktérben a Pixi `WindDustClouds` réteg csak visszafogott vizuális megerősítést ad.

HUD-szabályok:

- pozitív érték: jobbra mutató nyíl;
- negatív érték: balra mutató nyíl;
- nulla: szélcsend jelzés;
- az erősség a numerikus abszolút értékben marad pontos;
- erős szél esetén az indikátor kiemelése növekedhet, de nem villoghat zavaróan.

Játéktér-szabályok:

- a porfelhők laposak, ritkák és talajközeliek;
- a porfelhők mozgási iránya a fizikai szél előjelét követi;
- a sebesség, méret és alpha az abszolút szélértékből származik;
- a porfelhők a terrain mögött, az atmoszferikus rétegben maradnak;
- a porfelhők ne hasonlítsanak robbanási füstre: ne emelkedjenek függőlegesen és ne legyen lokális keletkezési pontjuk;
- reduced-motion módban a réteg statikus vagy rejtett;
- a trajectory preview továbbra is a tényleges ballisztikai wind értéket használja.

### 2.6 Terep

Ez marad a játékmenet elsődleges geometriai rétege.

- a fizikai heightmap és a vizuális terrain ugyanabból az állapotból származzon;
- a terep sziluettje maradjon jól olvasható;
- a felső kontúr kapjon finom cyan vagy meleg földszínű kiemelést;
- robbanási nyomok és sérülések külön effekt-rétegen jelenjenek meg;
- ne kerüljön a terrain assetbe statikus tank vagy szöveg.

### 2.7 Tereptárgyak

A `BattlefieldProps` első változata collision nélküli, seed alapján elhelyezett dekorációkat
rajzol a terrain mögé:

- távoli és közeli fa-sziluettek;
- sziklák és földközeli kövek;
- katonai antennák;
- kis narancs jelzőfények.

Az első iterációban ezek nem módosítják a mozgást vagy a ballisztikát. A tereptárgyak
vizuális prioritása a tank, lövedék és terrain kontúrja alatt marad. Később egyenként
bekapcsolható sérülési, remegési vagy collision viselkedésük.

**Aktuális döntés:** a tereptárgyak dekoratívak maradnak; nem kapnak collisiont, nem
rombolhatók, és nem módosítják a lövedékek vagy a tankok mozgását.

## 3. Renderelési és teljesítményelvek

- A statikus háttérrétegek lehetőleg cache-elhetők legyenek.
- A dinamikus részecskék száma korlátozott maradjon.
- `prefers-reduced-motion` esetén minden háttérmozgás kikapcsolható legyen.
- A játéktér Pixi rendererje maradjon egyetlen tulajdonosi lifecycle alatt.
- A ResultScreen dekorációs rendererje nem pusztíthatja a játék rendererét vagy textúráit.
- A rétegek z-indexe legyen explicit és dokumentált.
- A dekoratív tereptárgyak ne keltsenek collision-érzetet, amíg nincs hozzájuk fizikai modell.

## 4. Megvalósítási fázisok

- [x] ResultScreen HUD és egységfüggetlen presentation rendszer.
- [x] Pixi UI primitive-ok és háttéreffektek.
- [x] Tank/space presentation contract tesztek.
- [x] Referenciahű, kontúros combat-dossier tank SVG újratervezése.
- [x] `UnitIllustration` több rétegű asset-renderelésének kialakítása.
- [x] A tank rétegek neutral/accent színezésének szétválasztása.
- [x] Optika, antenna és technikai toronyrészletek hozzáadása.
- [x] A ResultScreen játékosonkénti tankjainak egymás felé fordítása.
- [x] Csillagos ég réteg hozzáadása.
- [x] Távoli hegyek réteg hozzáadása.
- [x] Közeli hegyek réteg hozzáadása.
- [x] Harctér atmoszferikus réteg hozzáadása.
- [x] HUD-os `WindIndicator` hozzáadása.
- [x] Pixi-alapú, visszafogott `WindDustClouds` réteg hozzáadása.
- [x] Terep vizuális rétegének finomítása a fizikai heightmap megtartásával.
- [x] Sci-fi katonai HUD keret, kontrollpanel és action bar hozzáadása.
- [x] Dekoratív `BattlefieldProps` réteg hozzáadása fákkal, sziklákkal, antennákkal és jelzőfényekkel.
- [x] Terrain mögötti atmoszferikus és por-rétegek összehangolása.
- [x] Tereptárgyak lövésre adott vizuális reakciói.
- [x] Részletesebb SVG tereptárgy assetek bevezetése.
- [x] Tereptárgyak mélységi sávjainak és terrainhez kötött alapvonalának korrekciója.
- [x] Fák és antennatornyok ideiglenes eltávolítása az egységesebb harctéri sziluett érdekében.
- [ ] Opcionális collision- és rombolhatósági modell tereptárgyanként (későbbi, külön döntési fázis).
- [x] Több viewporton történő vizuális ellenőrzés.
- [x] Háttérrétegek teljesítmény- és reduced-motion tesztje.

## 5. Következő javasolt lépés

A következő nagyobb vizuális lépés a referenciahű combat-dossier tank SVG és a részletesebb
tereptárgy assetek elkészítése lehet. Ezek előtt érdemes több desktop és mobil viewporton
ellenőrizni a HUD, a tereptárgyak, a porfelhők és a lövés utáni reakciók összhangját.

A collision- és rombolhatósági modell külön döntési fázis marad, mert az már a pálya
stratégiáját és a ballisztikai szabályokat is megváltoztatná.
