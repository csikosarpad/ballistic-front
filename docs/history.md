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
