# Fejlődési napló

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
