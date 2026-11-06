# Solvyr Prime: Siege Protocol - játék redesign terv

Státusz: a vizuális alapok megvalósultak; a dokumentum designelveket, lezárt iterációkat
és külön jelölt nyitott feladatokat tartalmaz. Aktuális működés: [játékosútmutató](../user/guide.md);
központi státuszok: [roadmap](./roadmap.md); új gameplay-rendszerek:
[fejlődési elemzés](./gameplay-progression.md).

## Cél

A játék vizuális rendszere egységes, rétegezett és később bővíthető legyen:

- modern katonai HUD a ResultScreenen;
- sötétkék, sci-fi katonai hangulat;
- jól elkülönülő játéktér-rétegek;
- skálázható desktop és mobil fallback megjelenítés;
- közös presentation API a tankhoz és jövőbeli egységekhez; jelenleg tank és asset
  nélküli space prezentációs contract létezik, nem többféle játszható egység.

## Dokumentációs felépítés

Ez a vizuális/UX redesign részletes terve, nem az összes gameplay-fejlesztés ütemterve.
A ResultScreen megvalósított szerződése és lezárt vizuális iterációi:

- [ResultScreen UI rendszer](./result-screen-ui-system.md)
- [Lezárt ResultScreen redesign](./archive/result-screen-redesign.md)
- [Lezárt neon ResultScreen polish](./archive/result-screen-neon-polish.md)

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

A `UnitPresentation` az egység megjelenítésének absztrakciója, nem gameplay-modell.
A jelenlegi szerződés forrása a [result.types.ts](../../src/ui/result/result.types.ts):

```ts
interface UnitPresentation {
  domain: "ground" | "space" | "air" | "mech";
  displayName: string;
  silhouetteAsset?: string;
  secondaryAsset?: string;
  detailAsset?: string;
  accentAsset?: string;
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

- a kezdeti heightmapből származó collision mask és a vizuális terrain ugyanazokat
  a rombolási műveleteket kövesse; a heightmap nem a rombolt terep élő állapota;
- a terep sziluettje maradjon jól olvasható;
- a felső kontúr kapjon finom cyan vagy meleg földszínű kiemelést;
- a perzselési nyomok a terrain RenderTexture-be rajzolódnak; a robbanás részecskéi
  külön effektrétegen jelennek meg;
- ne kerüljön a terrain assetbe statikus tank vagy szöveg.

### 2.7 Tereptárgyak

A `BattlefieldProps` jelenleg collision nélküli, seed alapján elhelyezett sziklákat
rajzol a terrain mögé. A korábbi fa-, antenna- és jelzőfény-iteráció nem aktív;
a fa- és antenna-SVG assetek megmaradtak.

A dekorációk nem módosítják a mozgást vagy a ballisztikát. Elhelyezésük vizuális
magassági sávból származik, nem a tényleges rombolt talajfelszínhez tapadó fizikai kapcsolat.
A remegési helper megmaradt; az aktív SVG sprite-ok becsapódási animációja nem teljes,
mert a jelenlegi eltolás csak a vektoros graphics fallbackre hat.

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

## 4. Megvalósítási fázisok és korábbi iterációk

A fa-/antenna-/jelzőfény-feladatok és a terrainhez igazítás korábbi iterációkat jelölnek;
a jelenlegi aktív dekorációt a 2.7. pont írja le. A viewport-ellenőrzések böngészős/
emulált ellenőrzések, nem valós telefonos validációk.

- [x] ResultScreen HUD és egységfüggetlen presentation rendszer.
- [x] Pixi UI primitive-ok és háttéreffektek.
- [x] Tank/space presentation contract tesztek (space asset nélkül, nem játszható űregység).
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

## 5. Új UI-referenciák és megvalósíthatósági elemzés

### Referenciák

- [Solvyr Prime: Siege Protocol – Steam Capsule / Store Header koncepció](../../plans/solvyr-prime_siege_protocol_game.png)
- [Solvyr Prime: Siege Protocol – nyitóképernyő](../../plans/solvyr-prime_siege_protocol_open.png)
- [Solvyr Prime: Siege Protocol – játékképernyő](../../plans/solvyr-prime_siege_protocol_game_screen.png)
- [Solvyr Prime: Siege Protocol – eredményképernyő](../../plans/solvyr-prime_siege_protocol_result.png)
- [Játékmenet és főmenü vizuális terve](../../plans/visual_plan_game.png)
- [Meccs utáni fejlesztőbolt terve](../../plans/ballistic-front_shop.png)
- [Parancsnoki konzol terve](../../plans/solvyr-prime_siege_protocol_command_concolse.png) –
  a konzol és az offline AI megvalósult; a képen szereplő „AI ONLINE” / „VOICE ACTIVE”
  állapotjelzők még nincsenek meg.

A képek vizuális irányt és elrendezési ötletet adnak, nem kész, közvetlenül beépíthető UI-k:
a feliratokat, vezérlőket és állapotokat a meglévő React/Pixi felülettel kell újrarajzolni.
A képek teljes képernyős háttérként való használata nem javasolt, mert a beégetett szöveg nem
lokalizálható, nem hozzáférhető, és kis nézetben nem rendezhető át. A forgalomba kerülő
háttér- és egységassetek forrását/felhasználási jogát külön ellenőrizni kell.

A Steam Capsule / Store Header kép külön marketinggrafikai koncepció, nem játékon belüli
képernyő vagy háttérasset. A beégetett logót és címet tartalmazó kompozíciót a Steam
áruházhoz a szükséges képarányokra és méretekre külön kell exportálni; a játék UI-jában a
cím továbbra is szöveges, lokalizálható elem marad.

### Az új Solvyr Prime-tervek értelmezése

Az új nyitóképernyő, játékképernyő és eredményképernyő koherens sci-fi katonai art directiont
ad: sötét űrbéli háttér, cyan HUD-panelek, arany elsődleges műveletek és egyértelmű
képernyőhierarchia. A nyitóképernyő vizuális háttere új, feliratmentes assetként hasznos
lehet, de a korábbi döntés változatlan: egyelőre nem vezetünk be plusz háttérképet; a
meglévő játéktér marad a menü háttere.

A megjelenített vezérlők és értékek nem mind egyeznek a mostani játékkal:

- **Nyitóképernyő:** a Deploy az offline indítás vizuális megfelelője lehet, a Multiplayer a
  meglévő online lobbyé. A Command Profile és Exit funkció nincs a jelenlegi hatókörben; az
  Armory a meccs utáni fejlesztőbolt elé kerülő új képernyőt és új folyamatot jelentene.
- **Játékképernyő:** a játékosállapotok, szél, szög, erő, mozgás és tüzelés meglévő adatokhoz
  köthetők. A képen szereplő taktikai AI töltetek a jelenlegi röppálya-előnézet vizuális
  megfelelőjeként értelmezhetők, de csak a meglévő elérhetőségi szabályok és töltetszám
  jeleníthető meg. Az új akciópontok, orbitális támogatás, többféle terepbonusz és egyéb
  képességek nem részei ennek a UI-implementációnak.
- **Eredményképernyő:** a győztes, játékosonkénti fejlesztések, meccsstatisztikák, XP és
  meccs utáni műveletek már léteznek. A képen látható tartós összesített XP, szint/rang,
  XP-küszöb, eliminációs és pontszámstatisztika nem része a jelenlegi adatmodellnek.
  A HUD meglévő csillagrangja az embernél fejlesztési arány, AI-nál tapasztalat;
  ezeket nem szabad statikus képszövegből vagy ideiglenes UI-értékből megjeleníteni.

Az első implementációs kör célja a meglévő állapotok új, egységes megjelenítése, nem új
játékmeneti funkciók vagy profil-/progressziórendszer bevezetése. Új funkció csak külön
termékdöntés, adatmodell/protokoll-elemzés és saját TODO után kerülhet be.

### Siege Platform átalakíthatósági vizsgálat

Az első kódbázis-alapú felmérés, kockázatelemzés és javasolt sorrend a
[6. fejezetben](#6-siege-platform-fejlesztési-ütem) található.
A végrehajtási státuszok egyetlen forrása a [roadmap M7 munkacsomagja](./roadmap.md#m7--sci-fi-vizuális-réteg).
A felmérés nem jelent jóváhagyott új grafikát vagy elkészült prototípust.

### Játéktér színvilág TODO

- [x] Paletta átvezetése a `theme.ts`-be: sötét bazalt-kék terep ciánkék felszíni éllel, hűvösebb ég, ciános lövedék/robbanás/por, a játékosszínek változatlanok.
- [x] Tank átszínezése: új, szögletes `tank-body.svg` / `tank-barrel.svg` (ugyanaz a méret és kötés, a játékosszín-tint megmarad), hűvös fémtónus és ciános fényelem; fizika és hitbox változatlan.
- [x] Háttérrétegek (`BattlefieldLayers.ts`) kontrasztjának finomítása: a távoli hegyek világosabb kékes sziluettek, a közeliek sötétebbek (mélységhatás), a légköri téglalap éles széle megszűnt. A `BattlefieldProps.ts` nem változott.
- [x] Online játék (lobby) képernyő átállítva a Siege Protocol panelstílusra: címfejléc, beviteli mezők, szobakód-kijelző, hibaüzenet, egységes gombok; a lobby-logika változatlan.
- [ ] Új sziluett/részletes tank csak jóváhagyott vizuális irány után.

### Mobil játszhatóság felmérése

**Korábbi, javítás előtti mérés és javaslat.** Az alábbi hiánylista nem a jelenlegi
implementáció állapota; a megvalósult javítások és a még nyitott valós eszközös próba
a táblázat utáni ellenőrzőlistában szerepelnek.

Mérés (emulált telefon, a játéktér fix 1280×720-as világ, `layout()` arányt tartva illeszti az ablakba):

| Nézet         | Mért állapot                                                                                  | Következmény                                                      |
| ------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Álló 390×844  | a pálya 0,30× méretű, kb. 220 px magas sáv a képernyő közepén; a tank kb. 7 px széles         | a tankok és a becsapódás alig látszanak, felül és alul üres sáv   |
| Fekvő 844×390 | a pálya 0,54× méretű; a HUD felül 65 px, alul 91 px, vagyis a 390 px magasból kb. 60% foglalt | a terep alsó része és a tankok takarásba kerülhetnek              |
| Vezérlők      | a gombok 48 px magasak, a csúszkák 18–20 px magasak                                           | a gombok jók; a csúszkával pontos szög/erő beállítása ujjal nehéz |

Ami a méréskor már megvolt: a HUD-gombok (mozgás, tűz, Smart Aim, hang) érintéssel működtek,
a HUD nem csordult túl 320 px-en, a viewport meta rendben volt.

A méréskor hiányzó vagy problémás elemek:

- **Méretezés (a legnagyobb gond):** álló módban a játéktér használhatatlanul kicsi. A megoldás fekvő tájolás ösztönzése, nem a világ átméretezése.
- **Pontos célzás:** nincs ±1° / ±10 erő léptetés érintésre (a billentyűzet lépései elérhetők, a gombok nincsenek), és nincs húzásos célzás a tankon.
- **Folyamatos mozgás:** a mozgás kattintásonként egy lépés; nincs nyomva tartásos ismétlés.
- **Érintés-részletek:** nincs `touch-action` beállítás (dupla koppintásos nagyítás, görgetés zavarhat), nincs teljes képernyő, és a `Smart Aim (T)`, `Sound (M)` feliratok billentyűket említenek.
- **Elrendezés fekvőben:** a HUD a pálya kb. 60%-át takarja.

Javasolt lépések, a kockázat szerint növekvő sorrendben:

1. `touch-action: manipulation` és a billentyűs feliratok elrejtése érintőeszközön (CSS, pointer: coarse). Kis kockázat.
2. Fekvő tájolás ajánlása álló módban (fedőüzenet a játék fölött); nincs forgatáskényszerítés. Kis kockázat.
3. Fekvő elrendezés újratervezése: a HUD oldalra (bal: mozgás és szög, jobb: erő és tűz) a vászon alsó/felső sáv helyett, hogy a pálya szabad maradjon. Közepes.
4. Érintésbarát célzás: ±1° / ±10 gombok, hosszú nyomásra ismétlés (mozgás, szög, erő). Közepes; a fizikát és a protokollt nem érinti, csak a store-hívásokat.
5. Húzásos célzás a tank körül (szög és erő egy ujjal). Nagyobb; külön döntés, és vizuális/UX terv kell hozzá.
6. Nagyítás a tankra / követő kamera mobilon. Nagyobb; a render és a multiplayer megjelenítést is érinti, külön döntés.

Döntés: az 1–5. lépés megvalósult, a 6. (követő kamera) nem része a hatókörnek.
Indításkor támogatott érintőböngészőben a `requestLandscape()` teljes képernyőt és
fekvő tájolást is kér. Ez nem garantált böngészőfunkció; hiba vagy hiányzó támogatás
esetén a játék és a bezárható tipp marad.

Megvalósítás:

- [x] `touch-action: manipulation`; a billentyűs feliratok (T, M) érintőeszközön (`pointer: coarse`) elrejtve.
- [x] Fekvő tájolás ajánlása álló telefonon (bezárható tipp, nincs kényszerítés).
- [x] Fekvő, alacsony képernyőn a HUD oldalra kerül (bal: szög/erő, jobb: ikonos akciógombok, tűz), így a tankok szabadok maradnak.
- [x] ±1° / ±10 erő gombok; nyomva tartásra ismétlés (szög, erő, mozgás).
- [x] Húzásos célzás: a soron lévő tank közeléből (64 képernyő-px) indított húzás iránya a szög, hossza az erő (2 erő / világpixel), vezetővonallal; online csak a saját körben.
- [ ] Valós telefonos próba (iOS Safari, Android Chrome) még hátravan.

### Tipográfia / fontkészlet TODO

Megvalósított fontkészlet: **Oxanium** (UI és címek), **Rajdhani** (HUD adatok), SIL OFL 1.1
alatt. Az **Orbitron** korábbi opcionális logójavaslat, nincs a jelenlegi buildben;
bevezetése esetén a választott csomag glyph/subset támogatását külön ellenőrizni kell.

- [x] Döntés: Oxanium + Rajdhani; az Orbitron egyelőre nem kerül be (logó később, ha kell).
- [x] Önálló hosztolás `@fontsource` csomagokkal (`latin` + `latin-ext`, csak a használt súlyok).
- [x] CSS változók (`--bf-font-ui`, `--bf-font-data`) és fallback stack; `ui.css` és `Hud.tsx` cserélve.
- [x] Ellenőrzés: magyar ékezetek (latin-ext betöltve), menü és HUD böngészőben; a HUD apró feliratai Rajdhanival kisebbnek hatnak, finomhangolásra érdemesek.
- [x] Licenc és forrás rögzítése a README-ben.

### Meglévő technikai alap

- A játékteret a Pixi engine rajzolja, a HUD-ot és a képernyőket React kezeli.
  A Game rendererének és a ResultScreen külön dekorációs rendererének önálló lifecycle-ja
  van; a dekoráció cleanupja nem pusztíthatja a Game megosztott erőforrásait.
- A játéktér 1280×720 logikai méretben fut, és az ablakhoz aránytartóan skálázódik.
- A környezet rétegzett, a mozgás reduced-motion módban kikapcsolható, a HUD és az eredmény
  képernyő mobil elrendezése is létezik.
- Az eredményképernyőn már van győztes, statisztika, két játékos fejlesztési panelje,
  fejlesztésvásárlás, visszavágó és főmenü művelet. A fejlesztések adatvezéreltek, a profilok
  offline mentése és az online vásárlások szinkronizálása is megvan.

Ezért a meglévő funkciók vizuális átrendezése **közepes ráfordítással, motor- és játékszabály-átalakítás nélkül
megvalósítható**. A shop esetében főként vizuális illesztés és egy tartalmi pontosítás
szükséges; a főmenü és az aktív játékképernyő komolyabb React/CSS elrendezési munkát igényel.

### A játékmenet és főmenü terve

**Megvalósíthatóság: közepes.**

- A terv alsó része jól illeszkedik a meglévő Pixi csatatérhez és React HUD-hoz. A szél,
  játékosállapot, lövési előnézet, mozgás, célzás és tüzelés már rendelkezésre áll.
- A billentyűzetes vezérlés egy része eltér a képen jelzett kiosztástól (például a mozgás
  jelenleg nyílbillentyűkkel történik, a célzási szög Ctrl+nyíllal állítható). Az új gombok és
  feliratok nem változtathatják meg észrevétlenül a meglévő vezérlést; a kiosztásról és az
  esetleges újrakötésről külön döntés és célzott teszt kell.
- A főmenü sci-fi katonai overlay panel, offline/online indítással, Beállításokkal és
  haladástörléssel. A Beállítások nyelvet, globális hangot, három hangcsatornát,
  offline ellenfelet/AI-tapasztalattörlést és játékosneveket kezelnek.
  Új profilképernyő nem készült.
- A böngészős „Kilépés” nem zárható megbízhatóan programból; a menüpont jelenleg nincs
  implementálva, és egyelőre nem része a fejlesztési hatókörnek.
- A kép a menüt és a játékmenetet egy kompozícióban mutatja. Megvalósítási alapfeltevésként
  ezek külön képernyőállapotok, nem egyszerre megjelenő panelek. Eltérő szándék esetén az
  elrendezést előbb pontosítani kell.
- A részletes, atmoszferikus háttérhez jogtiszta assetek kellenek; a csatatér alaprétegei már
  Pixiben vannak, így az új grafika oda illeszthető anélkül, hogy az assetbe égetett szöveg
  vagy vezérlő kerülne.

### Korábbi vizuális implementációs becslés

Az alábbi táblázat a már megvalósult menü/HUD-iteráció eredeti becslése, nem a következő
fejlesztések aktív ütemezése. Az eredeti beállítási hatókör azóta játékosnevekkel,
hangcsatornákkal és offline AI-választással bővült.

Az alábbi becslések egy fejlesztővel, a meglévő komponensek és játékmenet megtartásával
számolnak. Fejlesztői munkanapok, nem naptári idő; képi asset készítése és a döntési
visszajelzések ideje nincs bennük. A megvalósítási feladatok az egyszerűbb, kisebb kockázatú
lépésektől haladnak a nagyobb és bizonytalanabb feladatok felé; a végső ellenőrzés a
függőségei miatt zárólépés. A megállási kapuknál a munka nem folytatódik a szükséges döntés
vagy asset tisztázásáig.

| Sorrend | Feladat                                                                                                                               |  Becsült ráfordítás | Megvalósíthatóság / megállási pont                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.      | Meglévő menü és HUD vizuális alapjainak egységesítése: színek, panelek, gombok, fókusz- és letiltott állapotok.                       |           0,5–1 nap | Egyszerű, a meglévő CSS-re és komponensekre épít; új funkciót és képet nem igényel.                                                                                          |
| 2.      | Főmenü elrendezésének és képernyőváltásainak megtervezése a már létező offline/online indítással, nyelvváltással és haladástörléssel. |           0,5–1 nap | A jelenlegi funkciók megtarthatók; a menü és a játék külön képernyő marad.                                                                                                   |
| 3.      | A menüfunkciók hatókörének rögzítése.                                                                                                 |   Döntés megtörtént | A „Profil” és „Kilépés” menüpont egyelőre nem része a fejlesztésnek; a Beállítások csak a már létező nyelv- és hangkapcsolót tartalmazza.                                    |
| 4.      | Beállítások almenü kialakítása a nyelvváltóval és a meglévő hangkapcsolóval.                                                          |             0,5 nap | Kis kockázatú UI-munka; új beállítási modellt vagy mentési formátumot nem igényel.                                                                                           |
| 5.      | Aktív HUD és vezérlők újraelrendezése a meglévő adatokkal és műveletekkel.                                                            |             1–2 nap | Közepes ráfordítású React/CSS munka. A Pixi játéktér, a fizika és a játékmeneti állapot nem változik.                                                                        |
| 6.      | Billentyűzetes vezérlés.                                                                                                              |   Döntés megtörtént | A meglévő kiosztás változatlan marad; más kiosztás csak külön kérésre kerülhet napirendre.                                                                                   |
| 7.      | Egyedi főmenü-háttér vagy további illusztráció előkészítése és beillesztése.                                                          | Későbbi, opcionális | Most nem készül új háttérkép; a főmenü a meglévő játéktér fölötti overlayt használja. Később csak felhasználási joggal rendelkező, feliratmentes assettel érdemes folytatni. |
| 8.      | Desktop, keskeny mobil és nagyított nézet ellenőrzése; fókusz, görgetés, lokalizáció és reduced-motion viselkedés javítása.           |           0,5–1 nap | Az elkészült UI után végzendő záróellenőrzés; új háttérasset nem része a hatókörnek.                                                                                         |

Az első négy lépés a meglévő funkcionalitásra támaszkodva, új menüpont-funkció kitalálása
nélkül megvalósítható. Más billentyűzet-kiosztás csak külön kérésre készül. Az egyedi háttér
jelenleg nincs a megvalósítás hatókörében; a meglévő játéktér marad a menü háttere.

### Lezárt menü/HUD-iteráció ellenőrzőlistája

Az ellenőrzőlista az ütemterv sorrendjét követi. A `[!]` jelölés döntésre vagy külső assetre
váró megállási pontot jelent; az ilyen feladatot jóváhagyás előtt nem implementáljuk.

- [x] Vizuális alapok: a sci-fi katonai panel, gomb, hover, fókusz és mobilméretű keret bevezetése.
- [x] Főmenü: a meglévő offline/online indítás, haladástörlés és nyelvváltás átrendezése külön menüképernyőbe.
- [x] Hatókör: „Profil” és „Kilépés” menüpont most nem készül; a Beállítások meglévő funkciókra korlátozódik.
- [x] Beállítások nézet a nyelvváltóval és a már létező hangkapcsolóval, magyar és angol feliratokkal.
- [x] Beállítások bővítése a játékosnevekkel (offline; `playerNames` store, `localStorage`). A hang kiválasztása, sebessége és mélysége a parancsnoki beszédhez még hátravan.
- [x] Aktív HUD és vezérlők újraelrendezése a meglévő műveletekkel, fizika és vezérlési kiosztás módosítása nélkül.
- [x] Döntés: a jelenlegi billentyűzet-kiosztás marad; a redesign nem változtatja meg.
- [x] Döntés: egyelőre nem készül plusz főmenü-háttérkép; a meglévő játéktér marad a háttér.
- [x] Korábbi záróellenőrzés desktopon, emulált mobilon és nagyított nézetben;
  lokalizáció, fókusz, görgetés és reduced-motion.

### A meccs utáni bolt terve

**Megvalósíthatóság: alacsony-közepes; a működő alap már rendelkezésre áll.**

- A jelenlegi `ResultScreen` és `Shop` már ugyanazt a kétoszlopos, játékosonkénti
  fejlesztési modellt használja; a szintcsíkok, árak, maximumszint, játékosaccentek és a
  meccs utáni műveletek léteznek.
- Online meccsen a játékos csak a saját profilját módosíthatja, a vásárlás pedig a meccs
  szinkronizálásáig le van tiltva. Ezt a szabályt a vizuális átrendezés során is meg kell
  tartani.
- Van egy tartalmi eltérés, amit a képernyő finomításakor rendezni kell: a bolt
  „ÖSSZESEN SZERZETT XP” felirata mellett jelenleg a `Profile.xp` jelenik meg, ami az
  elkölthető egyenleg, és vásárláskor csökken. A meccsben szerzett XP külön statisztika.
  Vagy az egyenleget kell „Elérhető XP”-ként feliratozni, vagy külön, tartós összesített
  XP-adatot kell bevezetni; az utóbbi már mentésverzió-váltást és online profilprotokoll-
  egyeztetést is igényelne. Egyszerű vizuális egyezéshez az első megoldás a kisebb kockázat.
- A terv képernyőjén a fejlesztéssorok sűrűbbek, ezért a meglévő mobil töréspont és a
  kis kijelzőn történő görgethetőség ellenőrzése szükséges.

### Vizuális regressziós ellenőrzési sorrend és feltételek

1. **Vizuális alapok és képernyőfolyam:** közös színek, tipográfia, panelek és gombállapotok;
   a meglévő menü-, beállítás- és lobby-nézetek megtartása. Profil- és Exit képernyő
   nincs a hatókörben. A meglévő offline/online indítás maradjon elérhető.
2. **Aktív játékképernyő:** a HUD és vezérlők újraelrendezése Reactben, a Pixi játéktér és
   fizikai koordináták módosítása nélkül. A jelenlegi műveletek, billentyűzetes vezérlés,
   lokalizáció és reduced-motion viselkedés maradjon működőképes.
3. **Eredmény és bolt:** a meglévő komponensek referencia szerinti vizuális finomítása,
   az XP-felirat/jelentés tisztázása, az online jogosultság és szinkron megtartásával.
4. **Ellenőrzés:** desktop, keskeny mobil és nagyított nézet; magyar, angol és német szöveg;
   offline és online meccs; egérrel és billentyűzettel végrehajtott vásárlás/vezérlés;
   eredményképernyőn hosszú lista és túlfutó tartalom.

A meglévő állapotok vizuális átrendezéséhez nem kell új backend vagy játékszabály.
A referenciák új profil-/képességfunkciói viszont nem részei ennek a hatókörnek.
A menüfunkciók alapvető hatóköre lezárt; a shop XP-feliratának eltérése nyitott szöveghiba.

## 6. Siege Platform fejlesztési ütem

### Hatókör és jelenlegi alapok

2026-11-06-i technikai felmérés. A tank jelenleg az egyetlen játszható egységtípus;
P1/P2 ugyanennek két példánya. A cél a meglévő tank sci-fi ostromplatformmá alakítása,
nem új osztályválasztás, fegyverrendszer vagy XP-fejlesztési ág bevezetése.
A korábbi modern tank-referenciák előzmények; az új harctéri asset végső irányát SP0-ban
kell rögzíteni, a ResultScreen combat-dossier stílusával összehangolva.

A megvalósíthatóságot ezek a meglévő felületek támasztják alá:

- [Harctéri test](../../src/game/assets/tank-body.svg) és
  [löveg](../../src/game/assets/tank-barrel.svg): külön SVG-k, jelenleg 24×12 és 16×4
  logikai képpont. A [Game](../../src/game/engine/Game.ts) ezeket textúrává tölti,
  sprite-okként kezeli; a test kap játékosszín-tintet, a löveg külön forog.
  Egyetlen SVG belső csoportjai betöltés után nem animálhatók külön: az önállóan
  mozgó vagy színezhető rétegekhez külön textúra/sprite kell.
- [Löveg állapotmodell](../../src/game/systems/barrelAnimation.ts): szögsimítás és
  visszarúgás már van; a töltési animáció új munka.
- [Terrain](../../src/game/terrain/Terrain.ts): RenderTexture-látvány, felszíni él,
  három mélységi rétegvonal és perzselés már működik. A rombolás `erase` rajzolással,
  az ütközés külön pixelmaszkkal történik; ez még nem rétegzett anyagshader.
- [ParticleSystem](../../src/game/systems/particles.ts) és
  [FxRenderer](../../src/game/engine/FxRenderer.ts): robbanás, gyűrű, villanás, szikra,
  füst és törmelék, újrahasznosított sprite-okkal. Új VFX-rendszer helyett ezt érdemes bővíteni.

### Megvalósíthatóság, kockázat és javasolt sorrend

A becslés egy fejlesztő fókuszált munkanapjainak nagyságrendje, meglévő PixiJS 8-ra
építve, implementációval és célzott teszteléssel. Nem vállalt határidő; új grafikák
elkészítése, többkörös art direction és valós eszközparkon végzett mérés külön idő.

| Sorrend / azonosító | Feladat és javasolt megoldás | Megvalósíthatóság / kockázat | Ráfordítás |
| --- | --- | --- | --- |
| 0 / SP0 | Sziluettpróba tényleges játékméretben, pivotok és semleges/accent/emissive rétegek szerződése; teljesítmény-alapmérés. | Magas; alacsony technikai, közepes vizuális kockázat: a kis tankon a részletek elveszhetnek. | 1–2 nap |
| 1 / SP1 | Szögletes, sci-fi ostromplatform-test és külön löveg; optika, páncélpanelek, energiacsatornák. A meglévő sprite-összeállítás célzott bővítése. | Magas; közepes kockázat: elcsúszó talppont, lövegforgás, sziluett/hitbox eltérés. | 2–4 nap + assetkészítés |
| 2 / SP2 | Semleges alapanyag + külön színezhető csapatjelzés és visszafogott additív emissive sprite. Bloom csak opcionális, mérés után. | Magas; alacsony–közepes kockázat: túlexponálás, kék/arany háttérbe olvadás, extra draw call. | 1–2 nap |
| 3 / SP3 | Meglévő recoil finomítása az új csőhöz; rövid energia-/töltésjelzés a lövési és körállapotokból. | Magas; közepes kockázat: az animált csővég és a fizikai lövedék indulása eltérhet. | 1–3 nap |
| 4 / SP4 | Becsapódási VFX finomítása: talajpor/perzselés, pajzsvillanás, páncélszikra és HP-találat eltérő visszajelzése. | Magas; közepes kockázat: fedés, villódzás, részecskecsúcs és több védelmi réteget érintő találat. | 2–4 nap |
| 5 / SP5 | Rétegzett terrain anyagshader prototípus, majd csak sikeres mérés után integráció: mélységi anyagsávok, finom zaj és kráterperem. | Feltételesen magas; a legkockázatosabb: rombolási alpha, textúrakoordináták, bloom/filter sorrend és mobil GPU-költség. | 2–3 nap próba + 3–5 nap integráció |

Összesen kb. **12–23 fejlesztői nap**, külön assetkészítési és jóváhagyási idő nélkül.
SP5 megállítható a prototípus után; a teljes csomag nem egyetlen nagy átírásként készül.

### Függőségek és döntési kapuk

- **SP0 → SP1 → SP2 és SP3:** a külön színezés és animáció az elfogadott réteg- és
  pivotkiosztásra épül. SP2 és SP3 ezután egymástól függetlenül is elkészíthető.
- **SP4 az SP0 effektkeretére épül**, nem függ SP3-tól vagy shadertől. A javasolt
  későbbi helye vizuális prioritás, nem technikai előfeltétel.
- **SP5 az SP0 alapmérésére épül**, SP1–SP4 nélkül is prototipizálható, de
  integrációját az összes bekapcsolt effekt mellett is mérni kell. Az utolsó hely
  oka a nagyobb kockázat és a már meglévő, használható tereplátvány.
- SP0 lezárásához desktop és keskeny mobil nézetben elfogadott sziluett kell.
  Nem növeljük meg automatikusan a tank fizikai méretét a grafika kedvéért.
- SP3-ban a „töltés” **csak vizuális visszajelzés**: nem új cooldown, nem power-töltés,
  és nem késlelteti a `launchShot` hívást. A lövés időpontjában a cső iránya és a
  torkolattűz a fizikai `barrelTip` ponthoz igazodjon; későbbi recoil csak dekoráció.
  Valódi újratöltési mechanika külön gameplay-/online protokoll-döntés lenne.
- SP5 első próbája a meglévő terrain textúra alfáját megőrző megjelenítési passz legyen.
  A shader soha nem helyettesíti a fizikai maszkot. Ha a sprite UV-ja nem ad stabil
  világkoordinátát a filter alatt, explicit koordinátaátadás kell; képernyőhöz tapadó
  zaj vagy rétegminta nem elfogadható.
- Low-quality/reduced-motion változatot a munkacsomag részeként kell bekötni.
  Statikus team-color és anyagréteg maradhat; a pulzálás, töltési mozgás és erős
  villanás csökkenjen vagy maradjon el. Mobilon a drága filter helyett emissive sprite,
  illetve a jelenlegi statikus terrain maradjon.

### Ellenőrzés és elfogadási feltételek

1. **Fizika változatlan:** a [Tank](../../src/game/entities/tank.ts) ütközési mérete,
   talppontja, `barrelTip` képlete, szöge és a lövés szimulációja nem változik.
   Assetcsere után 0°, 45°, 90°, 135°, 180° mellett ellenőrizni kell a cső/pivot,
   lövedékindulás és visszarúgás együttállását.
2. **Teljes folyamat:** offline kétjátékos, AI és kampány, valamint online két kliens
   ugyanazon eseménysorral. Animációhossz vagy frame rate nem módosíthat sebzést,
   mozgást, tüzelési jogosultságot, XP-t vagy kampányteljesítést.
3. **VFX szemantika:** külön teszteset pajzs-, páncél-, HP-, talajtalálatra és egyetlen
   robbanással több védelmi réteg áttörésére. A prioritás az aktuális sebzésfeloldásból
   származzon; dekoratív véletlen ne befolyásolja a játék seedelt állapotát.
4. **Terrain regresszió:** ismételt kráterezés, leváló talaj, új pálya és viewportváltás.
   A lyuk maradjon átlátszó, ne térjen vissza anyag/glow a törölt részekre; a látvány
   és a collision maradjon összhangban. Shader kikapcsolásakor a jelenlegi út működjön.
5. **Mérési kapu (javasolt, még nem mért):** azonos seed és rögzített lövéssorozat,
   bemelegítés után legalább 60 másodperc a kiválasztott desktopon és valódi mobilon.
   Az új effektek p95 frame time-ja legfeljebb 10%-kal romolhat az alaphoz képest;
   a high profil célja desktopon 16,7 ms, a low profilé mobilon 33,3 ms.
   Ha az alap sem teljesíti az abszolút célt, előbb külön teljesítménydöntés szükséges.
6. **Erőforráskeret:** SP0-ban rögzíteni kell a részecske- és poollimit értékét,
   túllépéskor a kevésbé fontos dekoráció kihagyásának szabályát. Húsz újraindítás/
   menüváltás után ne nőjön folyamatosan az élő sprite-, ticker- vagy GPU-erőforrásszám.
   Csak a saját erőforrás szabadítható fel; más aktív Pixi canvas nem sérülhet.
7. **Olvashatóság:** cyan/gold csapatjelzés sötét és világos terepen, glow nélkül is.
   A két egység ne csak színnel legyen azonosítható; a meglévő P1/P2 HUD-jelölés marad.
   Ellenőrzés 1440×900, 390×844 és 900×400 nézetben, reduced-motion mellett is.

**Ajánlás:** először SP0–SP3 adja meg az új egységidentitást. Utána SP4 javítsa a
harci visszajelzést; SP5 csak mérhető előny és megfelelő fallback mellett kerüljön be.
Ehhez nem indokolt új animációs könyvtár, skeleton-rendszer, általános egységframework
vagy második harctéri Pixi alkalmazás bevezetése.

## 7. További javasolt lépések

A főmenü alapvető sci-fi megjelenése, a meglévő nyelv-/hangbeállítások külön nézete és az
aktív HUD újraelrendezése elkészült. A fizika és a billentyűzet-kiosztás változatlan maradt.
A korábbi desktop, emulált mobil és nagyított nézet záróellenőrzése megtörtént;
valós telefonos próba továbbra is nyitott. Külön főmenü-háttérasset nem készült.
Egyedi háttér később, opcionálisan vehető fel a tervbe.

A shop vizuális finomítása külön lépésként végezhető el, miután eldőlt, hogy az XP-felirat
elkölthető egyenleget vagy életút alatt szerzett összes XP-t mutasson.

A collision- és rombolhatósági modell külön döntési fázis marad, mert az már a pálya
stratégiáját és a ballisztikai szabályokat is megváltoztatná.

A gameplay-fejlődési plafonra javasolt szektorok és modifikátorok nem ennek a tisztán
vizuális iterációnak a részei; elemzésük a [gameplay-dokumentumban](./gameplay-progression.md),
jóváhagyási státuszuk a [roadmapben](./roadmap.md) szerepel.
