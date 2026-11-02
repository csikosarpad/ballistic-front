# Solvyr Prime: Siege Protocol – Result screen UI asset rendszer

## Cél

A meccs végi összesítő, upgrade és shop képernyő modernizálása futurisztikus katonai HUD stílusban:
sötétkék alap, cián neon keretek, arany/narancs kiemelések, jól olvasható magyar feliratok és
desktop böngészős skálázás.

## Egységfüggetlen design

A result képernyő nem tank-specifikus komponensrendszerként készül. A `PlayerPanel` helyett
logikailag `UnitPanel`-ként kell gondolkodni, amely ugyanazt a layoutot tudja megjeleníteni
tankhoz, űrharcoshoz, drónhoz vagy más jövőbeli harci egységhez.

Az egységfüggő adatok konfigurációból érkezzenek:

```ts
type UnitDomain = "ground" | "space" | "air" | "mech";

interface UnitPresentation {
  domain: UnitDomain;
  displayName: string;
  silhouetteAsset: string;
  primaryColor: number;
  secondaryColor: number;
  iconSet: string;
  statLabels: Record<string, string>;
  upgradeTheme: "armor" | "shield" | "weapon" | "engine";
}
```

Az eredményképernyő layoutja csak absztrakt fogalmakat használjon:

- `unit`
- `unit presentation`
- `unit stats`
- `upgrade`
- `resource`
- `victory state`

Kerülendő a komponensnevekben, CSS classokban és Pixi primitive-okban a tank-specifikus
elnevezés, például `TankPanel`, `tank-armor-row` vagy `tank-body-frame`.

## Megvalósítási fázisok

- [x] Közös UI tokenek és PixiJS `Graphics` primitive-ok kialakítása.
- [x] A ResultScreen React komponens-hierarchiájának szétbontása.
- [x] A victory banner és a játékoskártyák PixiJS dekorációjának elkészítése.
- [x] Az upgrade ikonok és progress barok egységes asset API-jának kialakítása.
- [x] A tank illusztrációk és státusz-színpaletta bekötése.
- [x] A ResultScreen alsó Visszavágó/Főmenü műveleti gombjainak HUD-stílusú kialakítása.
- [x] A háttér effektek teljesítmény- és reduced-motion kezelésének megvalósítása.
- [ ] Desktop méretlépcsőkön és mobil fallback nézetben vizuális ellenőrzés.
- [x] A ResultScreen, Shop és Pixi dekorációk célzott tesztjeinek bővítése.
- [x] Tank és űrharcos presentation theme-ekkel történő vizuális contract teszt.
