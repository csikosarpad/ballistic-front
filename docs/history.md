# Fejlődési napló

## 2026-11-03

- Elkészült a parancsnoki konzol (`plans/solvyr-prime_siege_protocol_command_concolse.png` alapján): időbélyeges napló gépelési effekttel a HUD jobb oldalán.
- A közléseket a `speechSynthesis` az aktuális nyelven (magyar/angol) felolvassa; mélyebb hang, férfi hang előnyben, a némítás a felolvasást is elnémítja. A hangjellemzők (`VoiceSettings`) később a beállításokból módosíthatók.
- A közlések számát csökkentettük: „Cél befogva" körönként egyszer, az első célzás vagy mozgás után; lövésenként legfeljebb egy eredményjelzés; a „Tűzparancs!" egyelőre nem szól.
- Győzelemkor szintetizált fanfár (helyettesítő) és „A csatát {név} nyerte!" bemondás.
- Háttérzene került a játékba (energysound „Cyberpunk Neon City", loop; Pixabay Content License, forrás: `src/game/assets/audio/music/LICENSE.txt`); a zene, a parancsnoki hang és az effektek a Beállításokban külön kapcsolhatók.
- A játékosnevek a Beállításokban állíthatók (offline), megjelennek a HUD-on, az eredményképernyőn, a boltban és a közlésekben.
- Offline AI-ellenfél (Beállítások → Ellenfél): a P2-t a gép vezérli; szimulációval célozva, hibázva, a becsapódásokból és a korábbi meccsekből tanulva játszik, és meccs végén maga választja ki a fejlesztéseit.
- Az AI tapasztalati ereje külön skálára került (0–1); a rendfokozatot 0–5 csillag jelzi a HUD-on mindkét játékosnál (AI: tapasztalat, ember: fejlesztések aránya). Az AI egész értékre kerekített szöget/erőt állít.
- A Smart Aim bekapcsolását a konzol jelzi, és amíg az előnézet aktív, az ellenfél tankján piros célkereszt jelenik meg („becéloztak"). Az AI is használja a Smart Aimet (50% eséllyel, ha van töltete).
- A két játékos parancsnoka eltérő hangon szól (két hang esetén külön hang, egy hangnál más hangmagasság/tempó).

## 2026-11-01

- Az eredményképernyő a referencia alapján új, széles eredménykártyát kapott.
- A meccsstatisztika és a játékosonkénti fejlesztési táblák külön felületi blokkokba kerültek.
- A fejlesztések két oszlopban jelennek meg, kis képernyőn pedig egymás alá törnek.
- A result képernyő vizuális iránya a második referencia alapján neon sci-fi stílusra bővült: trófeás győztes fejléc, játékoskártyák, ikonok és szegmentált fejlesztési sávok.
- A shop első komponensbontása elkészült: egységfüggetlen `UnitPanel`, `UpgradeRow`, `UpgradeIcon` és `SegmentedProgressBar` rétegek kerültek bevezetésre.
- A ResultScreen mögé bekerült az első PixiJS dekorációs réteg: reszponzív grid, neon keret, sarokdíszek és accent színek, a React tartalom érintése nélkül.
- Elkészült a közös PixiJS UI primitive-réteg (`HudFrame`, `GlowLine`, `SegmentedBar`, `BadgeShape`, `NeonPanel`) és a hozzá tartozó theme tokenek.
- A Pixi dekoráció kiegészült külön victory banner kerettel, arany oldalszárnyakkal, valamint cián és arany játékos-panel keretekkel.
- Az upgrade ikonok és progress barok presentation API-t kaptak, így az ikon glyph, accent szín és icon set később egységtípusonként cserélhető.
- A meglévő tank SVG-k bekerültek az egységfüggetlen `UnitIllustration` komponensbe; a P1 cián, a P2 arany státuszpalettát kapott.
- A Visszavágó és Főmenü gombok egységes HUD-button variánsokat kaptak, külön cián és arany kiemeléssel.
- A háttér kapott külön `ResultBackgroundEffects` PixiJS réteget: korlátozott számú partikula, resize-kezelés, ticker cleanup és `prefers-reduced-motion` támogatás került be.
- Javítva a Visszavágó utáni üres játéktér lehetséges PixiJS lifecycle hibája: a ResultScreen dekorációs renderer most csak a saját view-ját távolítja el, és nem agresszíven pusztít megosztott renderer/textúra-erőforrásokat.
- A ResultScreen és Shop célzott contract teszteket kapott a panel-, upgrade-, jogosultság- és disabled állapotokra.
- A Pixi UI primitive-ok méret- és resize-contract tesztekkel bővültek.
- A presentation rétegben elkészült a space theme contract: a jövőbeli űrharcos egység tank-specifikus asset nélkül, saját `space-combat` icon settel és státuszpalettával használható.
- Elkészült a teljes játék vizuális redesign tervének első változata: a ResultScreen dokumentációja mellett külön terv készült a rétegezett játéktérhez és a részletesebb, rétegezett tank SVG-hez.
- A ResultScreen tank illusztrációja három rétegre bővült: részletes test és lánctalp, külön löveg, valamint kiemelő részletek. A `UnitIllustration` ezeket presentation assetként, egymásra rétegezve rendereli.
- A felhasználói referencia pontosította a tank art directiont: a következő iteráció célja egy oldalnézeti, arany/narancs kontúros, sötét blueprint/combat dossier jellegű tank, külön optika-, antenna-, technikai részlet- és accent rétegekkel.
- A tank illusztráció neutral/accent színezése szétvált: a sötét acél testrétegek semlegesek maradnak, a játékos-specifikus cyan/gold/orange színezést külön `tank-accent.svg` réteg kapja.
- A tank technikai részletei optikával, antennával és toronyfelső elemekkel bővültek. A ResultScreenen P1 jobbra, P2 balra néz, így a két tank vizuálisan egymással szemben áll.
- A játéktér terrainje mögé bekerült a determinisztikus, meccs-seedből újrarajzolt `BattlefieldLayers`: csillagos ég, távoli és közeli hegyek, valamint visszafogott atmoszferikus harctér-réteg.
- A terrain vizuális rétege finomodott: felszíni highlight, heightmap-követő talajstratifikációs vonalak és sötétebb mélységi tónusok kerültek a RenderTexture-be, a fizikai heightmap és collision mask változatlanul megmaradt.
- A szél most HUD-os `WindIndicator` komponensként és visszafogott Pixi `WindDustClouds` háttérrétegként is látható; az irány az előjelet, a sebesség és kiemelés az abszolút erősséget követi.
- A korábbi szélvonalakat talajközeli, lapos porfelhők váltották fel, hogy a szél vizuális visszajelzése jobban illeszkedjen a katonai sivatagi harctér hangulatához.
- A PixiJS bundling külön vendor chunkot kapott: a fő alkalmazási chunk mérete kb. 1,1 MB-ról 211 kB-ra csökkent, a 908 kB-os Pixi renderer pedig dokumentált, célzott chunklimittel marad külön.
- A sci-fi ResultScreen stílusa átkerült a játéktér HUD-jába: keretezett command panel, szegmentált kontrollok, neon action bar és kiemelt FIRE gomb készült.
- A játéktér hatodik vizuális rétegeként bekerült a collision nélküli `BattlefieldProps`, amely seed alapján fákat, sziklákat, antennákat és jelzőfényeket helyez el.
- Döntés született arról, hogy a tereptárgyak egyelőre dekoratívak maradnak; nem módosítják a collisiont, a ballisztikát vagy a tankmozgást.
- A dekoratív tereptárgyak robbanáskor enyhe, rövid idejű remegést és jelzőfény-erősítést kapnak, fizikai collision nélkül.
- A viewport-ellenőrzés során javítva lett a mobil HUD 2 px-es kilógása, és a Pixi háttérmozgások most valóban kikapcsolnak `prefers-reduced-motion` esetén.
- A tank semleges test- és technikai részlet rétegei további páncélpanel-, varrat-, rögzítési pont- és optikai részleteket kaptak; a játékosszínű accent réteg változatlanul külön maradt.
- Elkészültek a részletes SVG tereptárgy assetek: fa, szikla és katonai antenna. A Pixi réteg ezeket tölti be, hiba esetén pedig naplózott vektoros fallback rajzolást használ.
- A tereptárgyak mélységi elhelyezése finomodott: kisebb, terrainhez kötött előtéri skálát és alacsonyabb alpha-t kaptak, így nem keverednek a távoli hegy- és atmoszférarétegekkel.
- A szétszórt fák és antennatornyok kikerültek az aktív pályaképből; egyelőre csak a terrainhez jobban illeszkedő sziklaelemek maradtak. A fa- és antenna-SVG-k későbbi, sűrűbb környezeti rendszerhez megmaradtak.
- A hangassetek OGG formátumra váltottak; az `AudioManager` már a `shot.ogg`, `explosion.ogg` és `tank-move.ogg` fájlokat tölti be. A konvertálás forrása a FreeConvert OGG Converter, a további hangterv külön `docs/sound-redesign.md` dokumentumba került.
- A röppálya-előnézet jövőbeli fejleszthető erőforrásának neve rögzítve lett: magyarul „Célzástámogatás”, angolul „Smart Aim”. Az alap 1 meccsenkénti használat megmarad, később töltetekkel bővíthető.
- A Célzástámogatás / Smart Aim tényleges upgrade-ként bekerült: alapból 1, szintenként +1 meccsenkénti töltetet ad, a HUD és a multiplayer profiladatok játékosonként kezelik a megmaradt tölteteket.
