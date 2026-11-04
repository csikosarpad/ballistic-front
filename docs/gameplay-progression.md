# Solvyr Prime: Siege Protocol – játékmenet és hosszú távú fejlődés

Kódbázis-alapú helyzetértékelés és fejlesztési javaslat, 2026-11-04.

Ez a dokumentum döntés-előkészítő elemzés, nem elfogadott implementációs specifikáció.
A javasolt mechanikák még nem részei a játéknak. A meglévő technikai milestone-okat
a [ROADMAP](../ROADMAP.md), a vizuális irányt a [játék redesign terve](./game-redesign.md) rögzíti.
A ROADMAP milestone-jai tematikus csoportok, nem ennek az ajánlott prioritásnak az
ellentétes végrehajtási sorrendje. A meglévő játékműködés belépési pontja a [README](../README.md).

## 1. Összefoglaló

A jelenlegi fejlődés viszonylag hamar kifut: minden fejlesztés megszerezhető, és a
maximális szintek után az XP-nek nincs további érdemi felhasználása.

A probléma nem egyszerűen a rövid XP-görbe, hanem a tartós választási kényszer hiánya.
A meglévő fejlesztések összeadódnak; nincs egymást kizáró specializáció vagy korlátozott
felszerelési összeállítás. A játékosok végül ugyanahhoz a maximális statcsomaghoz jutnak.

**Ajánlott sorrend:**

1. Pálya-/szektorrendszer.
2. Egyszerű környezeti modifikátorok.
3. Korlátozott slotos orbitális képességek.
4. Eltérő erősségű és gyengeségű egységosztályok.
5. Ezekre épülő single player szektorfoglalás, később roguelite kampány.

**A legjobb jelenlegi ár-érték arány:** három szektor és két egyszerű környezeti
modifikátor közös MVP-je. Ehhez horizontális feloldásokat érdemes kapcsolni:
a változatosabb pályák önmagukban nem oldják meg az elkölthetetlen XP problémáját.

## 2. A jelenlegi fejlődési rendszer

A [fejlesztési definíciók](../src/game/data/upgrades.ts) alapján:

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

A [profil és vásárlási logika](../src/game/systems/upgrades.ts) csak XP-egyenleget
és fejlesztési szinteket tárol. Az XP elkölthető pénznem, nem az összes megszerzett
tapasztalat nyilvántartása.

A shop összes megszerzett XP-re utaló felirata ismert szöveghiba: jelenleg is ezt az
egyenleget mutatja. Feliratjavítás és új életút-XP adat bevezetése két külön feladat.

A [harci elszámolás](../src/game/engine/Game.ts) az ellenfél pajzsának, páncéljának
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
| Terep | Seedelt, tükrözött magasságtérkép és rombolható pixelmaszk | Új terepprofilok olcsóbbak; épületek és összeomlás új szabályokat igényelnek |
| Fizika | Közös gravitáció-/szélmodell, fix időlépés | Egyszerű fizikai modifikátorokhoz jó alap |
| AI | A játék fizikájával keres lövéseket, szükség esetén közelít | Terephez alkalmazkodhat; veszélykerülés és képességválasztás még nincs |
| Multiplayer | Közös seed, profilsnapshot, revision alapú eseménynapló | Determinisztikus új szabályokkal bővíthető; nem szerveroldali fizikai szimuláció |
| Egységek | Két konkrét tank, talajhoz kötött mozgás és rögzített találati geometria | Szárazföldi variáns egyszerűbb; hover és orbitális egység jelentősen drágább |
| Megjelenítés | Rétegezett Pixi háttér, külön egységprezentáció | Vizuálisan bővíthető; a prezentáció nem általános gameplay-egységmodell |
| Mentés | Verziózott helyi profiltárolás | Új feloldásokhoz migráció kell; tartós online hadjáratállapot nincs |
| Kampány | Nincs küldetés-, útvonal- vagy területfoglalási rendszer | Új stratégiai réteg szükséges a meglévő csaták fölé |

### Fontos konkrét kapcsolódások

- A [terepgenerátor](../src/game/terrain/heightmap.ts) egyetlen terepcsaládot variál.
  Más seed nem jelent új pályatípust.
- A [Terrain](../src/game/terrain/Terrain.ts) a fizikai maszkot és a látványt
  párhuzamosan rombolja. Új rombolási mechanika mindkettőt érinti.
- A [ballisztika](../src/game/physics/ballistics.ts) már fogad gravitációt, de a
  [Game](../src/game/engine/Game.ts) a lövedékhez, előnézethez és AI-hívásokhoz jelenleg
  az alapgravitációt használja. Egy modifikátort minden érintett felületen át kell vezetni.
- Az [AI](../src/game/systems/ai.ts) fizikai célzási keresése új terepen is használható,
  de mozgása az ellenfél felé közelítést vizsgálja, nem általános taktikai helyezkedést.
- A [TurnManager](../src/game/systems/turnManager.ts) célzás, lövés és meccsvége
  fázisokat kezel. Általános képességfeloldási folyamat még nincs.
- A [MatchSetup](../src/game/systems/seededRandom.ts) jelenleg seedet és kezdőindexet tartalmaz.
  Szektorhoz, modifikátorhoz és szabályverzióhoz bővíteni kell.
- A helyi profilboríték verziózott, az online profilsnapshotnak viszont nincs külön
  séma-/szabályverziója. A javasolt meccskonfiguráció-verziózás új munka, nem meglévő képesség.
- A [PHP API](../server/api/index.php) explicit eseménytípusokat engedélyez.
  Új képességparancs a backend szabályait és a kliens visszajátszását is érinti.
- A [UnitPresentation](../src/ui/result/result.types.ts) ground/space/air/mech
  tartományai megjelenítési előkészítések, nem kész egységfizikák.
- A [háttérrétegek](../src/game/engine/BattlefieldLayers.ts) újrahasználhatók,
  de a jelenlegi színek és assetek nem mind a [Theme](../src/game/theme.ts) objektumból jönnek.

Nem indokolt teljes engine-újraírással vagy általános ECS bevezetésével kezdeni.
A közös meccsszabályok célzott leválasztása elegendő első lépés lehet.

## 4. Rangsor és költségbecslés

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

## 6. Ajánlott következő csomag: Sector Operations MVP

### Hatókör

- Három eltérő terepprofilú szektor.
- Két egyszerű környezeti modifikátor.
- Meccsenként legfeljebb egy aktív modifikátor.
- Offline szektorválasztás, online host által meghatározott közös pálya.
- Szabályleírás a választáskor, aktív állapot jelzése a HUD-on.
- Meglévő profilok és hot-seat működés megőrzése.

### Technikai alap

- Verziózott meccskonfiguráció: szektorazonosító, modifikátor és szabályverzió.
- Közös szabályfeloldás a lövedékhez, előnézethez és AI-hoz.
- A körönkénti hatásokat logikai körhatárok vezéreljék, ne renderidő vagy kliensoldali időzítők.
- A véletlen játékmeneti hatások közös seedből, rögzített feldolgozási sorrenddel készüljenek.
- A vizuális véletlen ne fogyassza a játékmeneti véletlensorozatot.
- Ismeretlen szektor, modifikátor vagy inkompatibilis szabályverzió explicit hibát adjon.
- Új mentési adatok migrációval kerüljenek be; régi profilszintek ne vesszenek el.

### Nem része az első csomagnak

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
A [replay-teszt](../src/game/multiplayer/replay.test.ts) részben külön headless
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

**Most szektorok és egyszerű modifikátorok, utána korlátozott slotos orbitális támogatás.**

Ez használja ki legjobban a meglévő terepet, fizikát, megjelenítést és multiplayer-modellt.
Az új egységosztályok ezután valódi horizontális fejlődést adhatnak, a kampány pedig
tartós célt biztosíthat a már változatos csatáknak.

További statok helyett olyan rendszerekbe érdemes befektetni, amelyekben a játékos
nem mindent megszerezve ér célba, hanem új helyzetekhez új összeállítást választ.
