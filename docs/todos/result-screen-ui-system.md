# Solvyr Prime: Siege Protocol – Result screen UI asset rendszer

Státusz: megvalósított prezentációs alap, nyitott ellenőrzési korlátokkal.
Központi státusz: [ROADMAP](../../ROADMAP.md); vizuális kontextus:
[játék redesign](../game-redesign.md). Ez nem általános gameplay-egységmodell.

## Cél

A meccs végi összesítő, upgrade és shop képernyő modernizálása futurisztikus katonai HUD stílusban:
sötétkék alap, cián neon keretek, arany/narancs kiemelések, jól olvasható magyar feliratok és
desktop böngészős skálázás.

## Egységfüggetlen design

A result képernyő nem tank-specifikus komponensrendszerként készül. A `PlayerPanel` helyett
logikailag `UnitPanel`-ként kell gondolkodni, amely ugyanazt a layoutot tudja megjeleníteni
tankhoz, űrharcoshoz, drónhoz vagy más jövőbeli harci egységhez.

A megvalósított szerződés a [result.types.ts](../../src/ui/result/result.types.ts) szerint:

```ts
type UnitDomain = "ground" | "space" | "air" | "mech";

interface UnitPresentation {
  domain: UnitDomain;
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

A korábbi `statLabels` és `upgradeTheme` mezők nem kerültek a szerződésbe.
A fejlesztések neve/leírása i18n kulcsból, ikonja és accentje upgrade-prezentációból jön.
A panel továbbra is a közös `UPGRADES` listát használja; osztályonkénti stat- és
fejlesztéslista még nincs. A space konfiguráció asset nélküli contract, nem játszható űrharcos.

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
- [x] Korábbi desktop, emulált mobil és nagyított viewport ellenőrzés (lásd játék redesign).
- [ ] Valós telefonos ellenőrzés (iOS Safari, Android Chrome).
- [x] A ResultScreen, Shop és Pixi dekorációk célzott tesztjeinek bővítése.
- [x] Tank és asset nélküli space presentation adat-/komponens-contract teszt
  (nem képi snapshot és nem űrharcos-gameplay teszt).
