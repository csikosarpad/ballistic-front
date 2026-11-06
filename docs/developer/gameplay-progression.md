# Solvyr Prime: Siege Protocol – játékmenet és hosszú távú fejlődés

Kódbázis-alapú helyzetértékelés, 2026-11-04; térképközpontú irány pontosítva: 2026-11-05.

**Rögzített fejlesztési irány: a Campaign Map legyen a fejlődés központi felülete.**
Ez a prioritás elfogadott; a részletes mód-, feloldás-, jutalom- és balanszszabályok
továbbra is döntést igényelnek. A dokumentum nem minden elemében kész implementációs specifikáció.
A Campaign Map C3 már öt játszható szektort, OR feloldást, helyi teljesítésmentést
és mindig P1 vs AI csatát ad. A v1 ALPHA-teljesítés migrálódik; a további mechanikák
(modifikátorok, orbitális képességek, osztályok, stratégiai hadjárat) még tervek.
Az alábbi korábbi helyzetértékelés/Foundation-hatókör történeti alap;
az aktuális C3 működést a 10.1., 10.3. és 10.10. pont rögzíti.
Az elfogadott első lépést és a további döntési kapukat a
[végrehajtási TODO](./gameplay-progression-todo.md) követi. A meglévő technikai milestone-okat
a [roadmap](./roadmap.md), a vizuális irányt a [játék redesign terve](./game-redesign.md) rögzíti.
A ROADMAP milestone-jai tematikus csoportok, nem ennek az ajánlott prioritásnak az
ellentétes végrehajtási sorrendje. A meglévő játékműködés leírása a [játékosútmutató](../user/guide.md).

## 1. Összefoglaló

A jelenlegi fejlődés viszonylag hamar kifut: minden fejlesztés megszerezhető, és a
maximális szintek után az XP-nek nincs további érdemi felhasználása.

A probléma nem egyszerűen a rövid XP-görbe, hanem a tartós választási kényszer hiánya.
A meglévő fejlesztések összeadódnak; nincs egymást kizáró specializáció vagy korlátozott
felszerelési összeállítás. A játékosok végül ugyanahhoz a maximális statcsomaghoz jutnak.

**Fejlesztési sorrend:**

1. **Campaign Map és a meglévő ALPHA-01 csata teljes navigációs köre.**
2. **Mentett műveleti haladás**, eredményfeldolgozás és visszatérés a térképre.
3. **A térkép tartalmi bővítése:** új játszható szektorok, majd elágazó útvonalak.
4. Környezeti modifikátorok és kontrollált szektornehezítés.
5. Horizontális feloldások, korlátozott slotos orbitális képességek és egységosztályok.
6. Teljes stratégiai szektorfoglalás, később roguelite kampány.

**Elkészült első csomag: Campaign Map Foundation.** Egyetlen játszható célponttal,
a meglévő **SECTOR ALPHA-01 / Training Grounds** pályával induljon. A térkép ne puszta
designbemutató legyen: innen induljon a csata, ide lehessen visszatérni, és itt látszódjon
a mentett teljesítés. A szükséges képernyő-, meccskontextus- és mentési alapokat most
ehhez a folyamathoz kell kialakítani; hiányuk nem indok a térkép későbbre halasztására.

Három terepprofil és két modifikátor továbbra is jó későbbi tartalomcsomag,
de **nem előfeltétele a térképmódnak**. A térkép látható célt ad; az XP-plafont
önmagában nem oldja meg. A tartós taktikai változatosság a későbbi tartalomból és
összeállítási döntésekből jön. Részletes megvalósíthatóság:
[10. fejezet](#10-campaign-map--sector-progression-megvalósíthatóság).

## 2. A jelenlegi fejlődési rendszer

A [fejlesztési definíciók](../../src/game/data/upgrades.ts) alapján:

| Fejlesztés | Maximális szint | Teljes XP-költség nulláról |
| --- | ---: | ---: |
| Páncél | 5 | 528 |
| Erőtér pajzs | 5 | 660 |
| Sebzés / robbanófej | 5 | 949 |
| Kráter / robbanási sugár | 5 | 660 |
| Hatótáv / maximális lövési erő | 3 | 391 |
| Motor | 5 | 328 |
| Célzástámogatás / Smart Aim | 3 | 252 |
| **Összesen** | **31** | **3768** |

A költségek a szintenként kerekített `baseCost * costGrowth ** level` összegei.
Ezek aktuális konfigurációs értékek, nem hosszú távú balanszcélok.

A [profil és vásárlási logika](../../src/game/systems/upgrades.ts) csak XP-egyenleget
és fejlesztési szinteket tárol. Az XP elkölthető pénznem, nem az összes megszerzett
tapasztalat nyilvántartása.

A shop összes megszerzett XP-re utaló felirata ismert szöveghiba: jelenleg is ezt az
egyenleget mutatja. Feliratjavítás és új életút-XP adat bevezetése két külön feladat.

A [harci elszámolás](../../src/game/engine/Game.ts) az ellenfél pajzsának, páncéljának
és HP-jának okozott sebzésért ad XP-t, a győzelemért további 50-et. A regenerálódó
pajzs miatt a meccsen szerezhető XP nem azonos az ellenfél kezdő védelmi pontjaival.

Következmények:

- A vásárlási sorrend jelent döntést, a végső összeállítás nem.
- A szintlimitek emelése vagy új statok hozzáadása késlelteti, de nem szünteti meg a plafont.
- A regeneráció fejleszthetővé tétele a harci balansz mellett az XP-bevételt is módosítaná.
- A maximális szint utáni motivációhoz új helyzetek és összeállítási döntések szükségesek.

## 3. Architektúra: mire lehet építeni?

| Terület | Meglévő alap | Bővítési lehetőség és korlát |
| --- | --- | --- |
| Terep | Öt seedelt, tükrözött profil és rombolható pixelmaszk, levált földdarabok törlésével | További profilok olcsóbbak; épületek és fizikai lehullás új szabályokat igényelnek |
| Fizika | Közös gravitáció-/szélmodell, fix időlépés | Egyszerű fizikai modifikátorokhoz jó alap |
| AI | A játék fizikájával keres lövéseket, szükség esetén közelít | Terephez alkalmazkodhat; veszélykerülés és képességválasztás még nincs |
| Multiplayer | Közös seed, profilsnapshot, revision alapú eseménynapló | Determinisztikus új szabályokkal bővíthető; nem szerveroldali fizikai szimuláció |
| Egységek | Két konkrét tank, talajhoz kötött mozgás és rögzített találati geometria | Szárazföldi variáns egyszerűbb; hover és orbitális egység jelentősen drágább |
| Megjelenítés | Rétegezett Pixi háttér, külön egységprezentáció | Vizuálisan bővíthető; a prezentáció nem általános gameplay-egységmodell |
| Mentés | Verziózott helyi profiltárolás | Új feloldásokhoz migráció kell; tartós online hadjáratállapot nincs |
| Kampány | Öt ponttal működő elágazó térkép és helyi ID-alapú teljesítésmentés | Modifikátorok, tartalombővítés és stratégiai szabályok még szükségesek |

### Fontos konkrét kapcsolódások

- A [terepgenerátor](../../src/game/terrain/heightmap.ts) öt profilt variál.
  Az ALPHA régi generátora változatlan; más seed önmagában nem új pályatípus.
- A [Terrain](../../src/game/terrain/Terrain.ts) a fizikai maszkot és a látványt
  párhuzamosan rombolja. Új rombolási mechanika mindkettőt érinti.
- A [ballisztika](../../src/game/physics/ballistics.ts) már fogad gravitációt, de a
  [Game](../../src/game/engine/Game.ts) a lövedékhez, előnézethez és AI-hívásokhoz jelenleg
  az alapgravitációt használja. Egy modifikátort minden érintett felületen át kell vezetni.
- Az [AI](../../src/game/systems/ai.ts) fizikai célzási keresése új terepen is használható,
  de mozgása az ellenfél felé közelítést vizsgálja, nem általános taktikai helyezkedést.
- A [TurnManager](../../src/game/systems/turnManager.ts) célzás, lövés és meccsvége
  fázisokat kezel. Általános képességfeloldási folyamat még nincs.
- A [MatchSetup](../../src/game/systems/seededRandom.ts) jelenleg seedet és kezdőindexet tartalmaz.
  Online szektorválasztáshoz, modifikátorhoz és szabályverzióhoz bővíteni kell;
  a helyi C3 kampány ettől függetlenül kezeli a szektort.
- A helyi profilboríték verziózott, az online profilsnapshotnak viszont nincs külön
  séma-/szabályverziója. A javasolt meccskonfiguráció-verziózás új munka, nem meglévő képesség.
- A [PHP API](../../server/api/index.php) explicit eseménytípusokat engedélyez.
  Új képességparancs a backend szabályait és a kliens visszajátszását is érinti.
- A [UnitPresentation](../../src/ui/result/result.types.ts) ground/space/air/mech
  tartományai megjelenítési előkészítések, nem kész egységfizikák.
- A [háttérrétegek](../../src/game/engine/BattlefieldLayers.ts) újrahasználhatók,
  de a jelenlegi színek és assetek nem mind a [Theme](../../src/game/theme.ts) objektumból jönnek.

Nem indokolt teljes engine-újraírással vagy általános ECS bevezetésével kezdeni.
A közös meccsszabályok célzott leválasztása elegendő első lépés lehet.

## 4. Rangsor és költségbecslés

Az alábbi táblázat a különálló bővítések költség/érték összehasonlítása,
nem a 2026-11-05-én rögzített végrehajtási sorrend. A térképközpontú fejlesztés
első csomagja a 6.1. pont; költséglépcsői a 10.2. pontban szerepelnek.
Az egyszerű térképmód nem azonos a táblázat tágabb kampány-/szektorfoglalási rendszerével.

A becslések nettó fejlesztői napban értendő MVP-nagyságrendek, célzott UI-val,
tesztekkel és multiplayer-bekötéssel. Nem tartalmaznak teljes tartalomcsomagot,
végleges assetgyártást vagy hosszas balansziterációt.

| Prioritás | Irány | Kategória | Becsült költség | Kódbázisra gyakorolt hatás |
| --- | --- | --- | --- | --- |
| 1 | Pályák / szektorok | Gyors nyereség | 5–10 nap | Kicsi–közepes: konfiguráció, terepprofil, háttér, választó |
| 2 | Egyszerű környezeti modifikátorok | Gyors nyereség | 3–7 nap | Közepes: fizika, körkezdet, előnézet, AI, szinkron |
| 3 | Orbitális képességek | Közepes befektetés | 10–20 nap | Közepes–nagy: akciók, töltetek, célzás, HUD, események |
| 4 | Szárazföldi egységosztályok | Közepes befektetés | 15–30 nap | Nagy: osztályalapok, felszerelés, AI, snapshot, balansz |
| 5 | Kampány / szektorfoglalás | Hosszú távú stratégia | 20–40 nap | Új tartós stratégiai réteg |
| 6 | Roguelite kampány | Hosszú távú stratégia | 30–60 nap | Útvonalak, run-állapot, jutalmak, ideiglenes összeállítások |
| 7 | Prestige | Olcsó, de másodlagos | 3–6 nap | Profilmigráció, reset, bónuszok, multiplayer-szabályok |
| 8 | További statfejlesztések | Gyors tüneti kezelés | 1–3 nap | Kicsi, ha meglévő statot használ |
| Külön javaslat | XP-vel feloldható lövedéktípusok | Közepes befektetés | 10–16 nap | Közepes: profil/snapshot, közös lövésfeloldás, AI, HUD és replay |

A sorrend ár-érték arányt és stratégiai hasznosságot jelent, nem pusztán fejlesztési gyorsaságot.
A becslések nem adandók mechanikusan össze: a közös alapok újrahasználhatók.
Új mechanikát igénylő property, valódi hover/orbitális egység vagy összeomló terep
nem fér a legegyszerűbb változat költségkeretébe.

### Minőségi összehasonlítás

| Irány | Újrajátszhatóság | Fenntarthatóság | Multiplayer | AI | Világba illeszkedés |
| --- | --- | --- | --- | --- | --- |
| Statok | Alacsony | Gyenge: új plafon | Könnyű, de növelheti a veteránelőnyt | Meglévő statoknál könnyű | Közepes |
| Prestige | Alacsony–közepes | Közepes; bónuszinfláció veszélye | Tartós erőelőnnyel problémás | Resetstratégia kell | Feltételes |
| Szektorok | Magas, ha a terep is eltér | Jó, tartalommal bővíthető | Nagyon jó | A jelenlegi célzási AI-val jó | Nagyon erős |
| Modifikátorok | Magas | Jó, korlátozott kombinációkkal | Jó, determinisztikus szabályokkal | Egyszerű fizikánál jó; veszélyekhez bővítés kell | Erős |
| Orbitális képességek | Magas | Jó, de interakciós balanszköltséggel | Jó, közös akciószabályokkal | Új képességértékelés kell | Nagyon erős |
| Egységosztályok | Nagyon magas | Jó, ha oldalirányúak | Jó, jelentős balanszmunkával | Osztály- és fegyverfüggő döntések kellenek | Nagyon erős |
| Roguelite | Nagyon magas single playerben | Jó, jelentős tartalomigénnyel | Csaták újrahasználhatók; közös kampány drága | Harci AI használható, stratégiai rész új | Erős |
| Szektorfoglalás | Magas | Nagyon jó rendszeralap | Csatamód jó; tartós online világ külön projekt | Új stratégiai réteg kell | Nagyon erős |

A lore-értékelés a dokumentált sci-fi katonai és Siege Platform-irányon alapul.
Nem helyettesít részletes világkánont vagy külön világépítési döntést.

## 5. Az egyes irányok javasolt tartalma

### 5.1. Pályák és bolygószektorok

Ne öt új háttér készüljön, hanem eltérő taktikai terep.

Első csomag:

- **Crystal Desert:** hullámos dűnék, kevés magas fedezék, változó szél.
- **Industrial Basin:** medence és tagoltabb peremek, eltérő lövési folyosók.
- **Frozen Frontier:** eltérő terepprofil, kiszámíthatóbb időjárás.

Az Industrial Basin használhatja a meglévő városrétegeket rombolható gyárépületek nélkül.
Az Orbital Elevator Zone és Defense Grid Sector akkor következzen, amikor már hozzájuk
kapcsolható mechanika is van, nem csak dekoráció.

Az első multiplayer-pályák őrizzék meg a tükrözött terepet és a biztonságos kezdőpozíciókat.
A pályákat alap- és maximális fejlesztésekkel is ellenőrizni kell.

### 5.2. Környezeti modifikátorok

Ajánlott sorrend:

1. **Sandstorm:** előre jelzett, körönként változó szélprofil, nem pusztán rosszabb láthatóság.
2. **Ion Storm:** például előre jelzett pajzsregeneráció-kiesés bizonyos körökben.
3. **Low Gravity:** közös gravitáció a tényleges lövésben, az előnézetben és az AI-ban.

Az Ion Storm konkrét hatása még design-döntés. Alacsony gravitációhoz ugyanazon bolygó
külön szektorában magyarázat kellhet: gravitációs infrastruktúra vagy orbitális helyszín.

Későbbi, drágább változatok:

- **Magnetic Distortion:** térben változó erőtér esetén a fizikát és az AI-szimulációt is bővíteni kell.
- **Crumbling Terrain:** terepstabilitás, determinisztikus összeomlási sorrend és
  egységelhelyezési szabályok szükségesek.

A kevés szükséges asset nem jelenti automatikusan a mechanika alacsony költségét.

### 5.3. Orbitális képességek

Első MVP:

- **Orbital Scan:** a meglévő röppálya-előnézetre építhető, de nem teheti feleslegessé a Smart Aimet.
- **Shield Projection:** ideiglenes, korlátozott védelem.
- **Kinetic Strike:** determinisztikus, előre jelzett területi csapás.

A Tactical Drone tartós entitást, a Supply Drop lerakási és felvételi szabályokat is
igényelhet; ezek későbbi bővítések legyenek.

Kevés felszerelhető slot és egyértelmű használati korlát szükséges. Nem cél az összes
képesség egyidejű használata. A képességek akcióköltségét, időzítését és körlezárását
implementáció előtt el kell dönteni.

### 5.4. Egységosztályok

Elsőként ugyanabban a szárazföldi mozgási tartományban maradó osztályok készüljenek:

- nagyobb sebzés, kisebb mozgáskeret;
- erősebb védelem, gyengébb támadás;
- nagyobb területi hatás, kisebb pontsebzés.

Siege Tank és Fortress Platform jellegű variánsok jó kezdőpontok.
A Railgun Platform valódi railgun-fegyverrel fegyverrendszer-bővítés is.
A Hover Artillery és Orbital Combat Unit új mozgási és ütközési szabályokat igényel.

Új osztály ne legyen a régi minden helyzetben jobb utódja. A meglévő fejlesztések
osztályok közötti érvényességét és a profilban tárolt osztályválasztást külön meg kell tervezni.

### 5.5. Kampány és szektorfoglalás

Két külön méretű fejlesztésről van szó: a Campaign Map egy csatákat összekötő,
mentett útvonalréteg; a stratégiai szektorfoglalás ennél több, tartós hadjáratszabály.
Az egyszerű térképnek nem előfeltétele az orbitális támogatás vagy az egységosztályok.
A korábbi 20–40 napos becslés a tágabb hadjáratra vonatkozik, nem egy statikus térképre.

Először könnyű single player stratégiai réteg:

- következő célpont kiválasztása;
- néhány küldetésfeltétel;
- feloldások és stratégiai jutalmak;
- menthető hadjáratállapot.

A harci AI újrahasználható, de nem kész stratégiai tervező.
A multiplayer-csaták újrahasználása nem jelent közös, tartós online szektorfoglaló világot.
Utóbbi szerveroldali tárolás és külön termékhatókör.

### 5.6. Roguelite kampány

A szektorok, modifikátorok és képességek után érdemes bevezetni:

- elágazó útvonalak;
- ideiglenes összeállítások;
- meccsek közötti kockázat-/jutalomválasztás;
- a tartós profil és a run-állapot elkülönítése.

Ez nagy újrajátszhatóságot adhat, de tartalmi és balanszigénye jelentős.

### 5.7. Prestige

Legfeljebb opcionális kihívásként javasolt. Egy új hadjárat vagy új parancsnokság
lore-ban indokolhatja az újrakezdést, de a reset önmagában nem új taktikai rendszer.
Korlátlanul halmozódó harci bónuszok multiplayerben kerülendők.

### 5.8. További statok és upgrade-ek

Kis kiegészítésként használhatók, de nem elsődleges megoldásként.
Az adatvezérelt definícióhoz új sor csak akkor elég, ha a statnak már van működő
játékmeneti fogyasztója. Fordítás, UI-prezentáció, AI-vásárlás és balansz így is érintett.

### 5.9. Választható lövedéktípusok

Ez a körökre osztott játékmenethez jól illeszkedő, a [progressziós TODO-ban
részletezett](./gameplay-progression-todo.md#4a-választható-lövedékek--megvalósíthatósági-javaslat)
önálló bővítés; nem igényel új egységosztályt vagy új körtípust. A játékos a
lövés előtt választ, a jelenlegi célzás/szög/erő vezérlés megmarad. A feature
közepes méretű, mert a tényleges lövést, a röppálya-előnézetet, az AI-t és a
headless replay-t ugyanahhoz az új szabályhoz kell kötni.

Javasolt haladási modell: a játékos **egy Standard Shell alapfegyverrel indul**,
a további fegyvereket XP-ért tartósan feloldja, majd minden lövés előtt szabadon
választ közülük. Az MVP-ben ne legyen külön fogyó lőszer. Az első csomag 4–5
típusa: **Standard Shell** (a mai alapviselkedés), **High Explosive** (nagyobb
területi hatás, kisebb közvetlen sebzés), **Armor Piercing** (pontos közvetlen
találat, külön páncélszabály), **Seismic Charge** (elsősorban tereprombolás),
és opcionálisan **Smart Missile** (determinisztikus, fix lépésű végfázisú
célkövetés). A költségeket és feloldási sorrendet balanszdöntésben kell
rögzíteni.

Elfogadott Smart Missile-szabály: ha a választott cél a beállított lövési
erővel nem érhető el, a rakéta nem kap automatikus erőnövelést vagy garantált
találatot; az addigi pályanyomvonal szerint halad tovább, majd annak megfelelően
lehull vagy megsemmisül. A célfelvételi sugár, a fordulási korlát és a
célpontválasztás még paraméterezendő.

Elfogadott tervezési elv, hogy minden fegyver saját alapkarakterisztikát kap:
eltérő sebzést, robbanási sugarat, terephatást és páncél-/pajzskölcsönhatást.
Ezek a fegyverválasztás taktikai értelmét és a játékos fejlődésének változatosságát
adják, külön XP-fejlesztési ág nélkül is. A pontos számértékek és interakciók
balanszfeladatok; az Armor Piercing közvetlen találatot igényel, az átütés
pontos szabályát implementáció előtt kell meghatározni.

Elfogadott Seismic Charge-szerep: az HE-től elkülönülő hatás, nagyobb
tereprombolással és mérsékeltebb egységsebzéssel, késleltetett körhatás nélkül.

A jelenlegi **Robbanófej** XP-upgrade a kódban a sebzés statot növeli; nem
fegyverfeloldás. Ezt nem szabad összemosni az új High Explosive lőszerrel:
a régi upgrade kompatibilitását megőrizve külön profiladat kell a fegyverek
feloldásához. Elfogadott döntés, hogy a Robbanófej a feloldástól elkülönülő
közös sebzés-upgrade marad. Az első fegyvercsomag rögzíti, mely
fegyverosztályokra érvényes; nem kerül automatikusan eltérő energiafegyverekre.

Elfogadott döntés, hogy fegyverenként külön XP-fejlesztési ág nem része az
MVP-nek. A jelenlegi upgrade-rendszer közös `TankStats` értékeket módosít;
a fegyver-specifikus fejlesztések külön mentett szinteket, profil-/online
snapshot-migrációt, UI-t és külön egyensúlyozást igényelnek. Később csak ott
érdemes ilyen ágat nyitni, ahol saját taktikai döntést ad (például AP-átütés,
HE-hatásmező vagy Smart Missile-irányítás), nem pusztán minden fegyverhez egy
újabb sebzésszintet.

Minden játékos a saját profillal feloldott fegyverkészletét használja offline,
online és kampánytérképes meccsen is; nincs lobby-közös készlet. A meccs
setupjának/snapshotjának rögzítenie kell az adott játékos használható
fegyver-ID-it, hogy a két kliens, az AI, a replay és a visszavágó ugyanazt a
készletet alkalmazza.

Műszakilag a legkisebb kockázat egy stabil ID-jű, típusos fegyverkatalógus és
közös lövés-/becsapódás-feloldás. A `fire` multiplayer-eseményhez `weaponId`
adható; az API már tetszőleges JSON payloadot tárol, de nem validálja és nem
szimulálja a fegyver szabályait. A katalógus és annak ID-i minden játékosnál
azonosak; a játékos csak a saját feloldott részhalmazából választhat. A lövés
érvényesítése ezért a katalógustagságot és a lövő feloldását is ellenőrzi;
ismeretlen vagy fel nem oldott ID nem választható, és hibás eseményként
elutasítandó. A két kliens azonos, verziózott katalógust használjon, a
meccssetup pedig rögzítse a szabály-/katalógusverziót. A régi,
fegyverazonosító nélküli replay Standard Shell-ként értelmezhető;
inkompatibilis szabályverziót viszont explicit el kell utasítani.
Ez megőrzi a régi alapviselkedést, de önmagában nem ad szerveroldali csalásvédelmet.

Az XP-vel feloldható készlet az MVP része, de sem a korlátozott lőszer és a
szerveroldali fizikaszimuláció, sem a fegyverenként külön fejlesztési ágak nem
részei. A lézerágyú/lézerfegyver, energiasokkoló,
energiagömb és villámcsapás későbbi, külön energiafegyver-család: hitscan,
közeli/célpont- vagy lánchatásuk eltérő fizikai, UI- és szinkronszabályai miatt
nem tartoznak az első lövedékcsomagba. A részletes becslés 10–16 nettó
fejlesztői nap, célzott tesztekkel és profil-/snapshot-integrációval, hosszas
balansziteráció és végleges effektek nélkül; a végrehajtás prioritását a
központi roadmapen külön kell elfogadni.

## 6. Végrehajtási csomagok: először térkép, utána szektortartalom

### 6.1. Elkészült alap: Campaign Map Foundation

**Célfolyamat:**

```text
Main Menu → Campaign Map → ALPHA-01 Battlefield → Result Screen → Campaign Map
```

Ez külön térképmód-útvonal. A hot-seat és online gyorscsata megmaradt;
a kampány P1 ember vs P2 AI, a gyorscsata-beállítás megváltoztatása nélkül.
Külön kampányreset csak teljesítést töröl; a teljes mentéstörlés XP-t, szinteket és kampányt.
Az alábbi hatókör az eredeti Foundation szerződése; ezt azóta az öt szektoros C3 bővíti.

Hatókör:

- Új, holografikus térképképernyő, központi ALPHA-01 csomóponttal és szektorkártyával.
- ALPHA-01 indítása a meglévő tereppel, fizikával és harci fejlesztésekkel.
- Explicit térképes meccskontextus: a gyorscsata eredménye ne teljesítsen kampányszektort.
- Eredmény után térképre visszatérés, újrapróbálás és az alap szektor helyi teljesítésmentése.
- Menüben aktuális művelet; térképen kijelölés és teljesítés; briefing/HUD ugyanazon
  szektorkontextusból. A kijelölés nem teljesítés.
- Meglévő XP-/profilszintek megtartása; elsőként nincs extra kampány-XP vagy Smart Aim-jutalom.
- Az elhagyott csata és AI-időzítők lezárása; a térkép alatt ne fusson tovább rejtett csata.
- Mobilon saját, kompakt képernyő, nem a harctérre tett nagy panel.

Az első csomag végén **egy valódi térképes játékkör** működjön, ne öt fiktív célpont.
További pontok megjelenhetnek „tervezett / még nem telepített” jelöléssel, de nem
indíthatnak ALPHA-01-et más néven. A tartalmi készültség és a kampányfeltétel miatti
zárolás külön fogalom. A haladás nevezője a játszható kampánytartalomból jöjjön:
kezdetben 0/1, az ALPHA teljesítése után 1/1; tervezett szektorok ne növeljék.

Elfogadás: menü → térkép → valódi ALPHA-csata → eredmény → térkép végigjárható;
győzelem/vereség/döntetlen következetes; teljesítés refresh után megmarad;
ugyanazon eredmény nem dolgozódik fel kétszer; gyorscsata/online működés változatlan.
A mentett haladás a C2 részlépésben elkészült; a Foundation a C1+C2 közös eredménye.

### 6.2. További szabálybővítés: Sector Operations MVP

#### Hatókör

Függőség: a Foundation működő térképes köre és a szektorszabályok véglegesítése.
A katalógus/meccskontextus a Foundationnel közös alap, nem második pályarendszer.

- Az öt C3 terepprofil további finomhangolása; a korábbi háromszektoros javaslatot C3 felváltotta.
- Két egyszerű környezeti modifikátor.
- Meccsenként legfeljebb egy aktív modifikátor.
- Offline szektorválasztás, online host által meghatározott közös pálya.
- Szabályleírás a választáskor, aktív állapot jelzése a HUD-on.
- Meglévő profilok és hot-seat működés megőrzése.

#### Technikai alap

- Verziózott meccskonfiguráció: szektorazonosító, modifikátor és szabályverzió.
- Közös szabályfeloldás a lövedékhez, előnézethez és AI-hoz.
- A körönkénti hatásokat logikai körhatárok vezéreljék, ne renderidő vagy kliensoldali időzítők.
- A véletlen játékmeneti hatások közös seedből, rögzített feldolgozási sorrenddel készüljenek.
- A vizuális véletlen ne fogyassza a játékmeneti véletlensorozatot.
- Ismeretlen szektor, modifikátor vagy inkompatibilis szabályverzió explicit hibát adjon.
- Új mentési adatok migrációval kerüljenek be; régi profilszintek ne vesszenek el.

#### Nem része a Sector Operations csomagnak

- Összeomló terep vagy rombolható épületrendszer.
- Hover/orbitális egységfizika.
- Általános képességrendszer és új fegyvercsaládok.
- Teljes kampány vagy közös online területfoglalás.
- Végtelen statfejlődés vagy automatikus prestige.

## 7. Az XP hosszú távú szerepe

Két külön célt kell kezelni:

1. **Fejlődés:** új lehetőségek megszerzése.
2. **Újrajátszhatóság:** változó helyzetekben eltérő összeállítás és döntés.

Az XP új taktikákat, képességeket és felszerelési lehetőségeket oldjon fel, ne korlátlan
harci erőelőnyt. A horizontális feloldások is végesek: a tartós érdekességet a pályák,
szabályok, osztályok és felszerelési korlátok együtt adják.

Online a kiválasztott pálya mindkét fél számára elérhető legyen. A képességek erejét
közös slot- és használati korlátok szabályozzák. Ha versenyszerű mód készül, az elérhető
felszerelések normalizálása külön döntés legyen.

Implementáció előtt eldöntendő:

- A szektorok XP-ből, teljesítményből vagy alapból válnak elérhetővé?
- Kell-e külön összes megszerzett XP mutató az elkölthető egyenleg mellett?
- A korábban felhalmozott XP mire használható, és hogyan kerülhető el az azonnali teljes feloldás?
- Mi a Smart Aim és az Orbital Scan közötti funkcionális különbség?
- Hány slot van, és egy képesség használata kiváltja-e a lövést?

## 8. Ellenőrzés és elfogadási szempontok

Az eredeti, 2026-11-04-i elemzés során nyolc kapcsolódó tesztfájl összesen
**60 tesztje sikeres volt** (dátumozott eredmény, nem folyamatos tesztgarancia):

- fejlesztések és profiltárolás;
- magasságtérkép és ballisztika;
- AI és körkezelés;
- determinisztikus replay és két klienses multiplayer-szinkron.

Ez a meglévő alapokat ellenőrzi, nem a javasolt új mechanikákat.
A [replay-teszt](../../src/game/multiplayer/replay.test.ts) részben külön headless
meccsfolyamatot használ, ezért az új szabályoknál a tényleges játékmotorral való
egyezést is ellenőrizni kell.

Az MVP elfogadásához:

- Azonos konfiguráció és eseménynapló azonos fizikai állapotot eredményez két kliensen.
- Az alapkonfiguráció megőrzi a jelenlegi fizikát és viselkedést.
- Az előnézet és az AI ugyanazokat a környezeti szabályokat használja, mint a tényleges lövés.
- Újracsatlakozás és darabolt/duplikált eseménykézbesítés nem változtatja meg az eredményt.
- Minden szektoron érvényes kezdőpozíció és megvizsgált lövési/mozgási lehetőség van,
  alap- és maximális fejlesztésekkel egyaránt.
- A régi profilok megmaradnak; a feloldások mentés és újratöltés után is érvényesek.
- A modifikátor hatása előre érthető, a HUD-on látható, és mindkét játékosra azonos szabály vonatkozik.

## 9. Végső ajánlás

**Most működő térképmód a meglévő ALPHA-01 pályával; utána mentett útvonalak és új szektorok.**

A térkép legyen a műveleti fejlődés gerince, amelyhez a későbbi pályák, modifikátorok
és feloldások kapcsolódnak. Nem kell kész kampányrendszerre várni: az első implementáció
feladata éppen a hiányzó navigáció, meccskontextus és helyi haladás megteremtése.
Orbitális támogatás, osztályok és stratégiai hadjárat csak erre épüljenek.

További statok helyett olyan rendszerekbe érdemes befektetni, amelyekben a játékos
nem mindent megszerezve ér célba, hanem új helyzetekhez új összeállítást választ.

## 10. Campaign Map / Sector Progression megvalósíthatóság

### 10.1. Értékelés: jó irány, de a térkép és a kampány nem ugyanaz

A javaslat erős: láthatóvá teszi a játékos útját, célt ad a következő csatának,
és a már bevezetett szektoridentitást használja. Új fegyverrendszer nem szükséges.
Egy statikus, elágazó térkép kevés assettel, a jelenlegi React/Pixi környezetben
megvalósítható; a jelentős költség a mögöttes állapot-, csata- és jutalomszabály.

| Szempont | Értékelés |
| --- | --- |
| Implementációs költség | Kis–közepes a térkép és helyi haladás; nagyobb az eltérő szektorfizika, jutalmazás és stratégiai hadjárat |
| Kódbázisra gyakorolt hatás | Új képernyő, kampányállapot és meccskontextus; nem szükséges engine-újraírás |
| Újrajátszhatóság | Az útvonalválasztás és eltérő csaták növelik; az egyszer kipipált térkép újabb véges plafon |
| Fenntarthatóság | Jó, ha statikus definíció, mentett haladás és csataeredmény különül el, közös szabályfeloldással |
| Multiplayer | Offline MVP a legolcsóbb; a szektoros PvP újrahasználható, a közös kampány külön termékhatókör |
| AI | Meglévő harci AI használható; stabil kampánynehézséghez külön policy kell, stratégiai AI később |
| Solvyr Prime identitás | Nagyon erős: műveletek, útvonalak, fenyegetés és fővárosi célpont; a lore-t a játékszabályok támasszák alá |

**Első szállítás:** Campaign Map Foundation egy játszható ALPHA-01 célponttal.
**Megvalósított C3 (2026-11-05):** öt csomópontos,
enyhén elágazó offline hadművelet P1 vs AI, helyi mentéssel.
ALPHA-01 → DELTA-08 / FORGE-17 → VANGUARD-12 → PRIME-00.
ALPHA mindkét ágat feloldja, VANGUARD bármelyik ág teljesítése után elérhető (OR);
az ágak szabadon bejárhatók és nem zárják ki egymást. Nincs extra kampánybónusz
vagy Smart Aim jutalom. PRIME biztosítása lezárja a műveletet akár 4/5 mellett;
a kihagyott ág utólag is teljesíthető az 5/5-höz. Replay végig megmarad.
Öt célpont öt tényleges terepprofilt és szektorfüggő vizuális beállításokat használ;
ALPHA az eredeti generátort, a másik négy a 10.10. pont alapgörbéit.

Az egy célpontos Foundation az ötcsomópontos C3 előzménye.
További balansz- és valódi telefonos próbák még szükségesek.
A hot-seat és online játék
maradjon külön **Skirmish / gyors csata** útvonalon; ne kelljen minden játékosnak
kampányt teljesítenie egy egyszerű mérkőzéshez.

### 10.2. Fejlesztési lépcsők: egyszerűtől a bonyolultabbig

A napok nettó fejlesztői becslések célzott tesztekkel, nem vállalt határidők.
A C1–C4 sorok az előző lépcsőre épülő többletmunkát jelölik, nem teljes projektköltséget.
A szektorok/modifikátorok elkészítése a 4. és 6.2. fejezet külön munkája, nem számolandó
kétszer. Végleges assetek és hosszabb balansziteráció nincsenek a becslésben.

| Lépcső | Hatókör | Függőség | Többletköltség | Mit ad / mit nem ad? |
| --- | --- | --- | ---: | --- |
| C1 – Térkép és csatabelépés | ALPHA-01 pont, kijelölés/kártya, navigáció és valódi csataindítás; React + SVG | ALPHA-katalógus és új képernyő/meccskontextus kialakítása | 2–4 nap | Működő belépési útvonal; a Foundation első részlépése, még nincs mentett teljesítés |
| C2 – Helyi haladás | Csataeredmény, térképre visszatérés, ALPHA teljesítésmentése és újrapróbálás | C1, mód-/resetdöntések, meccslezárás | 4–7 nap | Kész Foundation egy pályával, meglévő harci XP-vel; új fizika és bónuszjutalom nélkül |
| C3 – Elágazó művelet | Öt játszható célpont, statikus gráf, szabad ágbejárás, OR feloldás, szektoros mentésmigráció; extra bónusz nélkül | C2, négy további valódi csatadefiníció és minimális közös szektorkonfig | 2–4 nap a gráf/haladás alapjára; a pályák és migráció további munkák | Érdemi célválasztás; még nincs erőforrás-háború vagy ellenfél-területfoglalás |
| C4 – Eltérő szektorcsaták | Közös szabálykonfig, kontrollált AI-nehézség, valós kártyaadatok, TTS és opcionális térkép-VFX | C3 és Sector Operations alapok | 5–10 nap | Taktikailag eltérő csaták; nem szükséges új fegyver vagy osztály |
| C5 – Stratégiai hadjárat | Küldetések, ellenséges ellenlépések, erőforrások, tartós veszteségek | C4 és külön design | 20–40 napos teljes hadjárat-nagyságrend, a meglévő részek beszámítandók | Új stratégiai játék, nem térkép-polish |
| C6 – Közös online kampány | Közös tulajdon, tartós szerverállapot, konfliktuskezelés, hitelesített eredmény/jutalom | Külön backend- és termékspecifikáció | Jelen adatokból nem becsülhető megbízhatóan | Nem következik a jelenlegi kétfős lobbyból |

**Végrehajtás:** minimális ALPHA-katalógus/meccskontextus → C1 → C2 →
minimális közös szektorkonfig és új csatadefiníciók → C3 → modifikátorok/C4.
A C1+C2 és az első C3 csomag már elkészült; következő feladat a játékpróba,
majd a C4 szabály-/AI-policy bővítés külön döntés után. A táblázat napértékei
az eredeti tervezési becslések, nem mért ráfordítások.
Nem kell előre véglegesíteni mind a tíz szektort vagy megírni az online pályaprotokollt.
Az „ágas” térképhez később sem kell procedurális generátor vagy stratégiai AI.

### 10.3. Konkrét architekturális kapcsolódások

- Az [App](../../src/App.tsx) menüt, játékot és `campaignMap` képernyőt jelenít meg;
  az eredmény továbbra is a játék `gameOver` fázisa. A
  [store](../../src/game/state/gameStore.ts) külön `matchMode`, helyi UUID `matchId`
  és szektoradatokat tartalmaz; ezek nem új online protokollmezők.
- A [MainMenu](../../src/ui/MainMenu.tsx) most közvetlenül indít offline/online meccset.
  A kampánygomb külön térképre megy, a gyorscsata meglévő folyamatát nem cseréli le.
- A [GameCanvas](../../src/ui/GameCanvas.tsx) az App alatt folyamatosan él.
  A térkép megnyitása önmagában nem állítja le a
  [Game](../../src/game/engine/Game.ts) AI-időzítőit, ezért a bekötött `leaveBattle`
  csatazárást végez. Rejtett csata nem fut tovább a térkép alatt.
- A [szektorkatalógus](../../src/game/data/sectors.ts) öt definíciót, OR előfeltételeket,
  térképpozíciót, terepprofilt, palettát és briefingkulcsot ad.
  A Game az aktív szektort teszi a meccsnézetbe, a briefing/HUD/eredmény ezt olvassa;
  a menü/térkép az elérhető kijelölt vagy következő műveletet mutatja.
- A [ResultScreen](../../src/ui/ResultScreen.tsx) bemutatja az eredményt és boltot,
  de ne itt, rendereléskor történjen jutalmazás. A meccs lezárása adjon egyszer
  feldolgozott eredményt a kampánylogikának; a képernyő ezt csak megjelenítse.
- A [profil](../../src/game/systems/upgrades.ts) XP-t és szinteket tárol.
  A [verziózott mentés](../../src/game/systems/profileStorage.ts) újrahasználható minta,
  mellett külön [kampánymentés](../../src/game/state/campaignStore.ts) v2 tárolja a
  `contentVersion: 1`, `completedIds` és `selectedId` adatokat.
  A v1 boolean csak ALPHA-teljesítésre migrálódik. Ez idempotens, nem jutalomledger; több tároló közti
  tranzakció nincs. Extra kampány-XP előtt továbbra is kell az ismétlésbiztos elszámolás.
- A [MatchSetup](../../src/game/systems/seededRandom.ts) csak seed/starterIndex.
  Az offline kampány helyi meccskontextusa már külön működik; online pályaválasztás csak
  verziózott, közösen ellenőrzött setupbővítéssel kerülhet be.

### 10.4. Adatmodell és feloldás

A javasolt `Sector { completed, unlocked, connections }` prototípushoz elég,
de a tartalomdefiníciót és a játékos haladását összekeveri. Célszerű három rész:

| Réteg | Javasolt adatok |
| --- | --- |
| Statikus definíció | Kampány-ID/verzió, szektor-ID, megjelenített kód/név, helyzet a térképen, irányított kapcsolatok, belépési feltétel, csataszabály-hivatkozás |
| Mentett haladás | Sémaverzió, kampány-/tartalomverzió, teljesített szektorok, kiválasztott célpont, elszámolt meccs-/jutalomazonosítók |
| Aktív csata | Stabil meccs-ID, mód, szektor, seed, szabálykonfig, játékosi oldal és lezárási státusz |

A `completed` a mentett teljesítésből, az `available/locked` a gráfból és
előfeltételekből legyen levezetve, ne három egymástól független mentett boolean.
Az „aktuális” csak kijelölés: egy teljesített szektor is lehet újra kiválasztva.
A kártya státusza és a kijelölés vizuális kiemelése ne írja felül egymást.

Elágazáskor két külön döntés:

- **OR/AND:** a főváros megnyílik egy bevezető ág vagy minden szükséges ág teljesítésével?
- **Szabad választás/ágkizárás:** a másik ág később bejárható, vagy a választás végleges?

Elsőként statikus, körmentes gráf és szabad ágbejárás ajánlott, egyértelmű OR/AND
feltételekkel. Gráfellenőrzés: egyedi ID, létező célpontok, elérhető végpont,
nincs véletlen ciklus vagy feloldhatatlan csomópont.
Visszavágó legyen új meccs-ID ugyanazon szektoron; vereség/döntetlen ne foglaljon területet.

### 10.5. Haladás és jutalmak: nem csak feliratok

- A `Progress: 1 / 12` jelentése tisztázandó. Ajánlott külön **teljesített N / összes**
  és **kiválasztott művelet**. Az ALPHA kijelölése még nem teljesítés; induláskor 0/N.
  A nevező a kampánydefinícióból jöjjön, ne kézzel rögzített 12 legyen.
- `PROTOCOL COMPLETE / SECTOR ... SECURED` csak kampánygyőzelemkor jelenjen meg.
  Az első teljesítést és az ismételt győzelmet különítse el a rendszer.
- `NEW ROUTE DISCOVERED` csak akkor igaz, ha a lezárás új elérhető útvonalat nyitott.
  Vereségnél legyen újrapróbálás/térkép; a végső szektor után kampányzáró állapot.
- A minták `+350 XP` és `+150 XP` értékei nem balanszdöntések. Most a
  [Game](../../src/game/engine/Game.ts) már harc közben ad sebzés-XP-t és +50 győzelmi XP-t.
  A kampánybónuszt külön kell megjeleníteni és elszámolni, nem újra kiosztani a meccs-XP-t.
- **C2 és az elfogadott első C3 csomag nem ad új bónuszt.** A meglévő harci XP és
  +50 győzelmi XP marad replay esetén is. Egyszeri kampányjutalom csak későbbi külön
  döntés után kerülhet be, ismétlésbiztos elszámolással.
- `+1 Smart Aim` jelenthet állandó szintet, következő csatás töltetet vagy feloldást.
  Ezek eltérő rendszerek. Állandó szintnél a 3-as plafon, maxos profil kompenzációja
  és AI-vásárlás; ideiglenes töltetnél külön csatakonfig és élettartam szükséges.
  Döntésig a kártya ne ígérjen ilyen jutalmat.

Későbbi extra kampányjutalom bevezetésekor: frissítés, ResultScreen-remount,
ismételt eredménykézbesítés és mentés közbeni hiba
nem adhat másodszor jutalmat. Ha XP és kampányhaladás külön localStorage-kulcsban él,
az „XP elmentve, teljesítés még nem” megszakítás duplázást okozhat.
Az érintett adatokat egy verziózott elszámolási egységben vagy helyreállítható
eredményrekorddal kell kezelni; sima két egymás utáni `setItem` nem tranzakció.
Meglévő profilokhoz kezdeti üres kampányhaladás tartozzon, korábbi XP elvesztése nélkül.
Ez helyi megbízhatóság, nem csalásbiztos online gazdaság. Az első C3-ban nincs
extra jutalomledger: a szektor-ID alapú teljesítés idempotens mentése és a v1
ALPHA-boolean migrációja szükséges, a meglévő XP/profilok megőrzésével.

### 10.6. Szektorcsaták és AI: olcsóbbtól a drágábbig

| Eltérés | Megvalósíthatóság | Korlát / kötelező bekötés |
| --- | --- | --- |
| Leírás, háttérpaletta, rétegek | Olcsó | Látvány, nem taktikai különbség; új assetek gyártása külön költség |
| Terepprofil | Kis–közepes | Biztonságos spawn, collision/rombolás, járhatóság és találati lehetőség |
| Állandó vagy korlátozott szélprofil | Közepes | Körkezdet és közös seed; a HUD/előnézet/AI a valós szabályt használja |
| Egyszerű AI-nehézség | Közepes | Beállított skill és ellenfélprofil; ne pusztán a helyi AI-memória rejtett növekedése |
| 85%-os gravitáció | Közepes | 600 × 0,85 = 510 px/s² az alaphoz képest; lövedék, előnézet, Smart Aim, AI-lövés és mozgástervezés együtt |
| Új AI-viselkedés | Közepes–nagy | Agresszív/defenzív/helyezkedő policy új döntési logika, nem csak pontossági csúszka |
| Stratégiai ellenfél a térképen | Nagy | Célpontválasztás, ellenlépések és hadjáratszabályok; a harci AI nem oldja meg |

Az [AI](../../src/game/systems/ai.ts) már fogad gravitációt, de a Game az alapértéket adja.
Az alacsonyabb gravitáció hosszabb röppályát okozhat: a keresés időhorizontja,
pályaelhagyás és önveszélyes lövések is tesztelendők, nem elég az érték átírása.
A csillagos nehézség csak valódi, tesztelt konfigurációból legyen képezve.
A kampány AI-memóriájának megosztása vagy leválasztása külön döntés: különben ugyanaz
a szektor korábbi gyorscsaták miatt észrevétlenül nehezebb lehet.

### 10.7. Térkép-UX, mobil, animáció és TTS

Elsőként **React gombok + statikus SVG kapcsolatok** ajánlott: öt–tíz pontnál
nincs szükség külön Pixi rendererre, pan/zoom motorra vagy új könyvtárra.
A holografikus cyan/arany stílus a meglévő fontokkal és CSS-tokenekkel kialakítható.
Pixi fényimpulzusok későbbi dekorációként készülhetnek; ne érintsék a feloldási szabályokat.

- Teljesített: cyan jelölés; kijelölt: arany keret/csillag; elérhető: halvány cyan;
  zárolt: tompa kék. Felirat/ikon is különböztesse meg őket, ne csak szín vagy pulzálás.
- A zárolt pont részletei megtekinthetők, de a csataindító legyen tiltott,
  kiírt feloldási feltétellel. Billentyűzetes fókusz és képernyőolvasós státusz szükséges.
- Mobilon a térkép ne üljön rá a csatatér HUD-jára: saját képernyő, kompakt részletkártya,
  látható indító/vissza gomb, megfelelő érintési célméret. Álló módban lista vagy
  tördelhető térkép is elfogadható; a harc tájolási tippje ne fedje le ezt a nézetet.
- Reduced-motion esetén se csomópont-pulzálás, se futó útvonalimpulzus.
  A befejezettség animáció nélkül is felismerhető maradjon.
- A Sector Card csak alkalmazott adatot mutasson: név, státusz, fenyegetés,
  tereptípus, gravitáció/szél és tényleges jutalom. Ne legyen kitalált atmoszféraérték.
- A főmenü `CURRENT OPERATION` adata a kampány kiválasztott művelete, míg
  gyorscsatában a kiválasztott harctér. A két fogalom ne keveredjen.

A [speech](../../src/game/systems/speech.ts) és
[commandStore](../../src/game/state/commandStore.ts) újrahasználható, de a térkép
közléseit nem szükséges a harci naplóban tárolni. Hu/en/de szöveg, globális mute,
voice kapcsoló és támogatás nélküli szöveges működés kell.
TTS csak tényleges belépés/kijelöléskor, nem renderenként vagy hoverenként;
gyors választásoknál az elavult bemondás törlendő. A térkép elhagyásakor ne lógjon
bele a csata beszédébe. A „Delta Zero Three” kiejtés nem garantált a kód automatikus
felolvasásával; külön beszédszöveg indokolt. A TTS nem előfeltétele C1–C3-nak.

### 10.8. A tanács pontosítandó részei

- Az eddigi **DELTA-08 / Crystal Basin** helyett a mintában DELTA-03 szerepel.
  **VANGUARD-12 / Defense Grid** helyett GRID-09 / Defense Network.
  A 2026-11-05-i C3 döntés véglegesíti a **DELTA-08** és **VANGUARD-12** neveket;
  az öt célpont már játszható. A minták eltérő kódjai nem további szektorok.
- Az eddigi lista 10 nevet ad, a főmenüminta 12-t jelez, a lineáris példa 6 szektort,
  az MVP 5–10-et. Ezek nem azonos vállalások. A Foundation egy játszható ALPHA-01 ponttal
  indult; az ötcsomópontos C3 bővítés és gráf már működik. A 6/10/12
  szektoros példák nem az első C3 csomag vállalásai.
- A „galaktikus kampány” Solvyr Prime bolygószektoraihoz képest nagyobb lépték.
  Elsőként planetáris/orbitális **műveleti hálózat** ajánlott csillagtérképes esztétikával,
  tényleges többbolygós utazás és új világkánon nélkül.
- A gravitációkülönbség ugyanazon bolygón lore-indoklást igényel.
  A képernyőpéldák nem igazolják, hogy ilyen szabály már működik.

### 10.9. Elfogadási kapuk és ajánlás

Mielőtt a következő lépcső késznek minősül:

- C1: ALPHA-01 a térképről indítható, minden pont olvasható, mobilon/billentyűzettel
  használható; a tervezett pont nem játszható és nem ígér nem létező jutalmat.
- C2: győzelem, vereség, döntetlen, visszavágó, menübe visszalépés és refresh
  következetes; a régi XP/szintek megmaradnak; a háttérben nem fut elhagyott AI-csata.
- C3: OR/AND, ágbejárás és végpont tesztelt; első teljesítés/replay/reset szabály
  explicit; ismételt eredmény és félbeszakadt mentés nem dupláz jutalmat.
- C4: kártya és tényleges csataszabály egyezik; AI/előnézet/találat ugyanazt a fizikát
  használja; a szektoros PvP-bővítéshez a meglévő replay-/szinkrontesztek is bővülnek.
- Online kampány: külön jóváhagyott szerveroldali tulajdon- és eredménykezelés nélkül
  helyi kampányadat ne váljon hitelesített multiplayer-jutalommá.

**Rögzített irány:** térkép először, ALPHA-01-re épített valódi csatakörrel és helyi
haladással. Utána új szektorok és ágas művelet, majd modifikátorok és feloldások.
Nem egyből 12 szektorral, Pixi térképmotorral, Smart Aim-jutalmakkal és közös online
kampánnyal indulunk. A térképmód nem vár ezekre a rendszerekre.
Az XP-plafont a térkép önmagában nem szünteti meg; látható célt ad, amelyet később
horizontális feloldások és valóban különböző taktikai helyzetek tesznek tartóssá.

### 10.10. C3 csataprofilok – részletes tervezési javaslat

**Státusz (2026-11-05): az első C3 profilcsomag implementálva a részletes terv alapján.**
Az alábbi geometria és paletta a jelenlegi kiindulóérték; nem végleges játékpróbás balansz.
Az automatizált ellenőrzések 100 seed/profilon igazolják a karaktert, szimmetriát
és járhatóságot; alap/max stat kezdőmozgás és közeledés utáni találó lövések is teszteltek.
A teljes 0/5→4/5 műveletzárás→5/5 csatakör és refresh böngészőben ellenőrzött.
Hosszabb ember/AI balansz, valós telefonos teljesítmény és képernyőolvasós próba még hátravan.

#### Közös keret

- Minden szektor Solvyr Prime felszíni hadszíntere; nincs bolygóváltás vagy orbitális fizika.
- Világ: 1280×720, két tank, tükrözött kezdőterep; P1 x = 153,6, P2 x = 1126,4.
  ALPHA a jelenlegi generátort használja, azonos seedhez pontosan azonos magasságtérképpel.
- Gravitáció 600 px/s²; a jelenlegi seedelt körönkénti szél, fegyverek, upgrade-ek,
  mozgás és XP változatlan. Nincs új akadálytípus, omlási sebzés vagy bónusz.
- Az új profiloknak saját szerkezeti sziluettjük legyen, ne csak más noise-seedjük vagy színük.
  Kezdetben mind az ötnek külön szektor-/profil-ID-ja van; a generálási segédek közösek lehetnek.
- Az új szektorok alapgörbéje rögzített, seedelt kisebb felszíni hullámokkal.
  A seed a csata változatosságát adja, nem írhatja felül a szektor medence/terasz/gerinc karakterét.
  Replay/visszavágó azonos profilt, új meccsnél a jelenlegi szabály szerint új seedet használ.
- A kampány a meglévő közös profilokat és AI-memóriát használja. A terep taktikai
  kihívása eltérhet, de C3 nem ígér szektorhoz kötött, rögzített AI-nehézséget vagy statbónuszt.
  A kártya terepleírást adjon, ne nem kalibrált nehézségi csillagokat.

#### Öt szektor karaktere

| Szektor | Terep és taktikai szerep | Vizuális irány | Rövid eligazítás tartalma |
| --- | --- | --- | --- |
| ALPHA-01 / Training Grounds | Meglévő tükrözött hullámos terep; kontrollpálya, általános mozgás és célzás | Jelenlegi kék-cián rétegek, sziklák és városfények változatlanul | Rombolható terep, változó szél, ellenséges egység semlegesítése |
| DELTA-08 / Crystal Basin | Széles, mély központi medence; lefelé haladva alacsonyabb tüzelőállás, a visszakapaszkodás hosszabb út | Sötét palakék talaj, türkiz felszín, kevés lila köd; gyenge városfények | A medencébe ereszkedés megváltoztatja a lövési szögeket; figyeld a kijáratokat |
| FORGE-17 / Industrial Expanse | Hosszú lapos teraszok, köztük járható rámpák; pozícióváltás és kiszámíthatóbb felszíni mozgás | Grafitszürke talaj, visszafogott réz/narancs felszín, erősebb meglévő városfények | A teraszok mozgásteret adnak; a kráterek megszakíthatják a járható útvonalakat |
| VANGUARD-12 / Defense Grid | Két alacsonyabb árok egy széles központi gerinc körül; a gerinc részben takarja a közvetlen lövéseket | Sötét acélkék talaj, jégkék felszín, tisztább háttér | Használd a magas ívű lövéseket vagy bontsd meg a központi gerincet |
| PRIME-00 / Capital Perimeter | Két kisebb védődomb és egy központi, sekély teknő; összetettebb, de nem magasabb statokra épülő zárócsata | Sötét kékes talaj, arany felszíni hangsúly, hangsúlyos meglévő városfények | A védődombok és a központi mélyedés között válassz tüzelőállást |

A DELTA nem alacsony gravitációjú pálya, FORGE nem kap működő gyárat, VANGUARD
nem kap aktív védelmi pajzsot, PRIME nem boss-statcsata. Ezek későbbi rendszerek lennének.
A különbség most a rombolható talaj geometriája és az olvasható vizuális karakter.

#### Geometriai kiindulóértékek

Az alábbiak a **bal félpálya alapgörbéjének** normalizált vezérlőpontjai `(x/W, y/H)`.
Kisebb y magasabb talaj. A jobb fél a bal tükrözése; a pontokat sima átmenet köti össze,
FORGE lapos szakaszait azonban meg kell őrizni. Nem kész magasságtérképek vagy mért balanszértékek.

| Profil | Bal félpálya vezérlőpontjai | Seedelt hullám legnagyobb amplitúdója |
| --- | --- | --- |
| ALPHA | Jelenlegi 4 oktávos value-noise, y/H = 0,45 + 0,35 × normalizált noise | Változatlan |
| DELTA | (0; 0,58), (0,12; 0,58), (0,22; 0,60), (0,34; 0,71), (0,50; 0,76) | ±0,015 H, kb. 11 px |
| FORGE | (0; 0,62), (0,20; 0,62), (0,28; 0,58), (0,40; 0,58), (0,48; 0,63), (0,50; 0,63) | ±0,006 H, kb. 4 px |
| VANGUARD | (0; 0,62), (0,20; 0,62), (0,28; 0,67), (0,40; 0,52), (0,50; 0,49) | ±0,012 H, kb. 9 px |
| PRIME | (0; 0,62), (0,20; 0,62), (0,30; 0,56), (0,40; 0,65), (0,50; 0,63) | ±0,010 H, kb. 7 px |

Az új profilok hullámaihoz a meglévő value-noise módszer használható, kezdetben két
oktávval, 160 és 80 px hullámhosszal, 1 és 0,5 súllyal; a súlyozott eredmény
középre igazítva és normalizálva adja a táblázat amplitúdóját.
Ez külön terepgenerálási véletlen: a dekoráció nem fogyaszthatja a szél/AI véletlensorozatát.

**Járhatósági korlátok az új profilokon:**

- Mindkét kezdőpont körül legalább ±110 px bejárható, szilárd felszín legyen.
  Ez a maximális, 110 px-es mozgáskerethez is ad kezdő mozgásteret.
- A jelenlegi lépés 2 px, a maximális felfelé lépés 4 px. A kezdeti, rombolás előtti
  közlekedési útvonalakon egyik irányban se legyen 4 px-nél nagyobb emelkedés egy lépés alatt.
  A teraszok rámpásak, nem függőleges falak; a hullámok ezt a korlátot nem léphetik át.
- Az új profilokon a kiinduló talaj y/H értéke 0,46–0,80 között maradjon:
  legyen hely a HUD alatt, és legalább 144 px talajvastagság a pálya aljáig.
- Minden kiinduló solid pixel kapcsolódjon az alsó pályaszélhez. Nem kerül szándékosan
  lebegő sziget ebbe a csomagba; a robbanás utáni leválás-törlés mindegyiken működik.
- ALPHA regresszióvédelem miatt nem kap utólag új simítást vagy kezdőpont-korrekciót.
  A fentiek az új profilok tervezési/tesztelési korlátai, nem az alapgenerátor átírása.

#### Vizuális kiindulóértékek és assethatár

| Profil | Talaj kitöltése | Felszíni sáv / világos perem | Városfények |
| --- | --- | --- | --- |
| ALPHA | `#2a3a4f` | `#2399ad` / `#8beeff` | Jelenlegi értékek |
| DELTA | `#26384c` | `#36b8bc` / `#b2fbf2` | A jelenlegi intenzitás 30%-a |
| FORGE | `#34343b` | `#b87843` / `#ffd0a0` | A jelenlegi intenzitás 100%-a |
| VANGUARD | `#243347` | `#477ea8` / `#a8ddff` | A jelenlegi intenzitás 50%-a |
| PRIME | `#293447` | `#b49a52` / `#ffe4a3` | A jelenlegi intenzitás 100%-a |

- A meglévő égbolt-/városképeket használjuk; árnyalat, köd- és hegyrétegszínek,
  városfény-intenzitás paraméterezhető. Nem vállalunk új részletes ipari/fővárosi hátteret.
- A szikladekoráció marad külön, collision nélküli réteg. DELTA opcionálisan kevés
  egyszerű, Pixi Graphics-szal rajzolt kristálysziluettet kaphat; ezek nem járható platformok.
  Az első elfogadáshoz nem kötelező dekorációs geometria vagy új képasset.
- A játékosszín, HP/pajzs/páncél színjelentése, célzási jelölés és kompakt HUD nem változik.
  A szektor arany/narancs színe ne tegye összetéveszthetővé a tankokat vagy állapotjelzőket.
- Reduced-motion és a meglévő bloom-kezelés marad; nincs új shader vagy kötelező VFX.
- A térképkártya és hu/en/de briefing ugyanebből a szektordefinícióból írja le a terepet.
  „Kristályos” vizuális irány nem jelent külön kristályfizikát vagy ellenőrizetlen képforrást.

#### Elfogadás a profilok implementációja után

1. ALPHA azonos seedre azonos magasságtérképet ad, a gyorscsata és online alapcsata változatlan.
2. Az új profilok legalább 100 rögzített seeden (0–99) determinisztikusak, tükrözöttek,
   és teljesítik a magasság-, járhatósági és kezdőterep-korlátokat.
3. Minden seeden megmarad a szerkezeti karakter: DELTA közepe mélyebb a kezdőpontoknál,
   VANGUARD középső gerince magasabb náluk, FORGE lapos teraszai és PRIME oldalgerincei
   a kisebb hullámok ellenére felismerhetők.
4. Alap és maximális fejlesztésekkel mindkét tank mozoghat induláskor; a lövegcső
   kiinduló vége nem lehet talajban. Mindkét kezdőjátékossal legyen ember/AI játékpróba.
5. Nem követelmény az első pozícióból közvetlen találat: az alaperő 600, a kezdőtáv
   közel 973 px, így a jelenlegi pályán is szükség lehet közeledésre. Viszont minden
   szektorban legyen elérhető találati helyzet kötelező upgrade nélkül; ne zárjuk
   a meccset bejárhatatlan terep vagy minden hasznos lövést blokkoló gerinc mögé.
6. A lövedék, Smart Aim és AI ugyanazt a tényleges maszkot használja; leszakadás után
   collision és látvány egyezzen, a tankok új talajra kerüljenek.
7. A képernyők és visszavágó a kiválasztott szektort mutassák/indítsák; az öt terep
   név nélkül is megkülönböztethető legyen sziluett és szín alapján.
8. Álló/fekvő mobilnézetben a tank és terepperem olvasható; a profilok és collapse
   futásidejét mobilon is mérjük. Az asztali/emulált eredmény nem valós telefonos mérés.

**Az első implementáció sorrendje:** közös katalógus és ALPHA
regresszióteszt → DELTA/FORGE generálás és járhatósági ellenőrzés → VANGUARD/PRIME →
vizuális paraméterezés → szektorkontextus és mentésmigráció → térképgráf és teljes C3 kör.
Nem adunk külön első szektorjutalmat, és a C4 modifikátor-/AI-nehézségrendszere nem előfeltétel.
