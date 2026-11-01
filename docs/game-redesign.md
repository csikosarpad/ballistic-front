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
5. Terep
6. Egységek és lövedékek
7. Előtér effektek
8. HUD és interakciós réteg
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

### 2.5 Terep

Ez marad a játékmenet elsődleges geometriai rétege.

- a fizikai heightmap és a vizuális terrain ugyanabból az állapotból származzon;
- a terep sziluettje maradjon jól olvasható;
- a felső kontúr kapjon finom cyan vagy meleg földszínű kiemelést;
- robbanási nyomok és sérülések külön effekt-rétegen jelenjenek meg;
- ne kerüljön a terrain assetbe statikus tank vagy szöveg.

## 3. Renderelési és teljesítményelvek

- A statikus háttérrétegek lehetőleg cache-elhetők legyenek.
- A dinamikus részecskék száma korlátozott maradjon.
- `prefers-reduced-motion` esetén minden háttérmozgás kikapcsolható legyen.
- A játéktér Pixi rendererje maradjon egyetlen tulajdonosi lifecycle alatt.
- A ResultScreen dekorációs rendererje nem pusztíthatja a játék rendererét vagy textúráit.
- A rétegek z-indexe legyen explicit és dokumentált.

## 4. Megvalósítási fázisok

- [x] ResultScreen HUD és egységfüggetlen presentation rendszer.
- [x] Pixi UI primitive-ok és háttéreffektek.
- [x] Tank/space presentation contract tesztek.
- [ ] Részletesebb tank SVG újratervezése.
- [ ] `UnitIllustration` több rétegű asset-renderelésének kialakítása.
- [ ] Csillagos ég réteg hozzáadása.
- [ ] Távoli hegyek réteg hozzáadása.
- [ ] Közeli hegyek réteg hozzáadása.
- [ ] Harctér atmoszferikus réteg hozzáadása.
- [ ] Terep vizuális rétegének finomítása a fizikai heightmap megtartásával.
- [ ] Több viewporton történő vizuális ellenőrzés.
- [ ] Háttérrétegek teljesítmény- és reduced-motion tesztje.

## 5. Következő javasolt lépés

Elsőként a tank SVG újratervezése és a `UnitIllustration` rétegezett renderelése készüljön
el. Ezután a csillagos ég és a távoli hegyek adhatók hozzá, mert ezek nem módosítják a
terrain fizikáját, mégis azonnal javítják a játéktér mélységérzetét.
