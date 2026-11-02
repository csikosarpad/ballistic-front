# Solvyr Prime: Siege Protocol - játék redesign terv

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

## 5. Új UI-referenciák és megvalósíthatósági elemzés

### Referenciák

- [Solvyr Prime: Siege Protocol – Steam Capsule / Store Header koncepció](../plans/solvyr-prime_siege_protocol_game.png)
- [Solvyr Prime: Siege Protocol – nyitóképernyő](../plans/solvyr-prime_siege_protocol_open.png)
- [Solvyr Prime: Siege Protocol – játékképernyő](../plans/solvyr-prime_siege_protocol_game_screen.png)
- [Solvyr Prime: Siege Protocol – eredményképernyő](../plans/solvyr-prime_siege_protocol_result.png)
- [Játékmenet és főmenü vizuális terve](../plans/visual_plan_game.png)
- [Meccs utáni fejlesztőbolt terve](../plans/ballistic-front_shop.png)

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
  XP-küszöb, eliminációs és pontszámstatisztika viszont nem mind része a jelenlegi adatmodellnek;
  ezeket nem szabad statikus képszövegből vagy ideiglenes UI-értékből megjeleníteni.

Az első implementációs kör célja a meglévő állapotok új, egységes megjelenítése, nem új
játékmeneti funkciók vagy profil-/progressziórendszer bevezetése. Új funkció csak külön
termékdöntés, adatmodell/protokoll-elemzés és saját TODO után kerülhet be.

### Siege Platform átalakíthatósági vizsgálat

- [ ] Felmérni, hogy a jelenlegi gameplay-képernyő mely UI-elemei nevezhetők és rendezhetők át
      közvetlenül a Siege Protocol világába, és melyek igényelnek új vizuális koncepciót.
- [ ] Megvizsgálni a tank body/barrel SVG-rétegeket, sziluettet, játékosaccenteket és
      csőanimációt: elegendők-e célzott grafikai módosítások, vagy új Siege Platform asset/API kell.
- [ ] Rögzíteni, hogy az első Siege Platform-változat a jelenlegi tank fizikáját és
      viselkedését használja; külön választani a későbbi, mechanikus `Tank` → új egységmodell
      átnevezéstől és a többféle platform támogatásától.
- [ ] A vizsgálat eredményeként javasolt, kis kockázatú implementációs lépéseket és becsült
      ráfordítást felvenni a Roadmapbe; új assetkészítés előtt megállni a vizuális irány
      jóváhagyásáig.

### Játéktér színvilág TODO

- [x] Paletta átvezetése a `theme.ts`-be: sötét bazalt-kék terep ciánkék felszíni éllel, hűvösebb ég, ciános lövedék/robbanás/por, a játékosszínek változatlanok.
- [x] Tank átszínezése: új, szögletes `tank-body.svg` / `tank-barrel.svg` (ugyanaz a méret és kötés, a játékosszín-tint megmarad), hűvös fémtónus és ciános fényelem; fizika és hitbox változatlan.
- [ ] Háttérrétegek (`BattlefieldLayers.ts`, `BattlefieldProps.ts`) és terep/hegyek kontrasztjának finomhangolása.
- [ ] Új sziluett/részletes tank csak jóváhagyott vizuális irány után.

### Tipográfia / fontkészlet TODO

Javaslat: **Oxanium** (UI és címek), **Orbitron** (logó), **Rajdhani** (HUD adatok). Mind
SIL OFL 1.1 licencű. Ellenőrzött tény: az Orbitron csak `latin` subsetet tartalmaz, ezért az
ő/ű karaktereket nem tudja megjeleníteni; csak ékezetmentes logófeliratra használható.

- [x] Döntés: Oxanium + Rajdhani; az Orbitron egyelőre nem kerül be (logó később, ha kell).
- [x] Önálló hosztolás `@fontsource` csomagokkal (`latin` + `latin-ext`, csak a használt súlyok).
- [x] CSS változók (`--bf-font-ui`, `--bf-font-data`) és fallback stack; `ui.css` és `Hud.tsx` cserélve.
- [x] Ellenőrzés: magyar ékezetek (latin-ext betöltve), menü és HUD böngészőben; a HUD apró feliratai Rajdhanival kisebbnek hatnak, finomhangolásra érdemesek.
- [x] Licenc és forrás rögzítése a README-ben.

### Meglévő technikai alap

- A játékteret a Pixi engine rajzolja, a HUD-ot és a képernyőket React kezeli; a renderernek
  már egyetlen, központi lifecycle-ja van.
- A játéktér 1280×720 logikai méretben fut, és az ablakhoz aránytartóan skálázódik.
- A környezet rétegzett, a mozgás reduced-motion módban kikapcsolható, a HUD és az eredmény
  képernyő mobil elrendezése is létezik.
- Az eredményképernyőn már van győztes, statisztika, két játékos fejlesztési panelje,
  fejlesztésvásárlás, visszavágó és főmenü művelet. A fejlesztések adatvezéreltek, a profilok
  offline mentése és az online vásárlások szinkronizálása is megvan.

Ezért a terv megvalósítása **közepes ráfordítással, motor- és játékszabály-átalakítás nélkül
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
- A főmenü most egyszerű overlay, benne offline/online indítással, nyelvváltással és
  haladástörléssel. A redesign első implementációja ezeket sci-fi katonai panelbe rendezi;
  a Beállítások nézet a meglévő nyelvváltót és hangkapcsolót tartalmazza. Új profilfunkció
  nem készül.
- A böngészős „Kilépés” nem zárható megbízhatóan programból; a menüpont jelenleg nincs
  implementálva, és egyelőre nem része a fejlesztési hatókörnek.
- A kép a menüt és a játékmenetet egy kompozícióban mutatja. Megvalósítási alapfeltevésként
  ezek külön képernyőállapotok, nem egyszerre megjelenő panelek. Eltérő szándék esetén az
  elrendezést előbb pontosítani kell.
- A részletes, atmoszferikus háttérhez jogtiszta assetek kellenek; a csatatér alaprétegei már
  Pixiben vannak, így az új grafika oda illeszthető anélkül, hogy az assetbe égetett szöveg
  vagy vezérlő kerülne.

### Javasolt ütemterv

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

### Megvalósítási TODO

Az ellenőrzőlista az ütemterv sorrendjét követi. A `[!]` jelölés döntésre vagy külső assetre
váró megállási pontot jelent; az ilyen feladatot jóváhagyás előtt nem implementáljuk.

- [x] Vizuális alapok: a sci-fi katonai panel, gomb, hover, fókusz és mobilméretű keret bevezetése.
- [x] Főmenü: a meglévő offline/online indítás, haladástörlés és nyelvváltás átrendezése külön menüképernyőbe.
- [x] Hatókör: „Profil” és „Kilépés” menüpont most nem készül; a Beállítások meglévő funkciókra korlátozódik.
- [x] Beállítások nézet a nyelvváltóval és a már létező hangkapcsolóval, magyar és angol feliratokkal.
- [x] Aktív HUD és vezérlők újraelrendezése a meglévő műveletekkel, fizika és vezérlési kiosztás módosítása nélkül.
- [x] Döntés: a jelenlegi billentyűzet-kiosztás marad; a redesign nem változtatja meg.
- [x] Döntés: egyelőre nem készül plusz főmenü-háttérkép; a meglévő játéktér marad a háttér.
- [x] Záróellenőrzés desktopon, mobilon és nagyított nézetben; lokalizáció, fókusz, görgetés és reduced-motion.

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

### Javasolt megvalósítási sorrend és elfogadási feltételek

1. **Vizuális alapok és képernyőfolyam:** közös színek, tipográfia, panelek és gombállapotok;
   a főmenü külön menü-, beállítás- és profilnézeteinek, valamint a menüpontok pontos
   funkcióinak rögzítése. A meglévő offline/online indítás maradjon elérhető.
2. **Aktív játékképernyő:** a HUD és vezérlők újraelrendezése Reactben, a Pixi játéktér és
   fizikai koordináták módosítása nélkül. A jelenlegi műveletek, billentyűzetes vezérlés,
   lokalizáció és reduced-motion viselkedés maradjon működőképes.
3. **Eredmény és bolt:** a meglévő komponensek referencia szerinti vizuális finomítása,
   az XP-felirat/jelentés tisztázása, az online jogosultság és szinkron megtartásával.
4. **Ellenőrzés:** desktop, keskeny mobil és nagyított nézet; magyar és angol szöveg;
   offline és online meccs; egérrel és billentyűzettel végrehajtott vásárlás/vezérlés;
   eredményképernyőn hosszú lista és túlfutó tartalom.

Új backend, külső UI-keretrendszer vagy játékszabály-módosítás a képek megvalósításához nem
szükséges. A legfontosabb nyitott termékdöntés a menüben ígért profil/beállítás funkciók
pontos tartalma; az XP-felirat eltérése pedig a shop fejlesztésének megkezdése előtt
eldöntendő.

## 6. Következő javasolt lépés

A főmenü alapvető sci-fi megjelenése, a meglévő nyelv-/hangbeállítások külön nézete és az
aktív HUD újraelrendezése elkészült. A fizika és a billentyűzet-kiosztás változatlan maradt.
A desktop, mobil és nagyított nézet záróellenőrzése megtörtént; új háttérasset nem készült.
Egyedi háttér később, opcionálisan vehető fel a tervbe.

A shop vizuális finomítása külön lépésként végezhető el, miután eldőlt, hogy az XP-felirat
elkölthető egyenleget vagy életút alatt szerzett összes XP-t mutasson.

A collision- és rombolhatósági modell külön döntési fázis marad, mert az már a pálya
stratégiáját és a ballisztikai szabályokat is megváltoztatná.
