# Solvyr Prime: Siege Protocol – fejlesztői kontextus

A jelenlegi architektúra rövid összefoglalója, nem implementációs feladatlista.
Fejlesztői indítás: [getting started](./getting-started.md); játékfunkciók:
[játékosútmutató](../user/guide.md). Státuszok: [roadmap](./roadmap.md).
A dokumentumok szerepeit a [fejlesztői index](./README.md) rögzíti.

## Meglévő architektúra

- React 18 + TypeScript, Vite, PixiJS 8 és Zustand.
- A [játékmag](../../src/game/) koordinálja a loopot, fizikát, terepet és entitásokat;
  a [React UI](../../src/ui/) a HUD-ot, menüt, lobbyt, boltot és eredményképernyőt kezeli.
- A fizikai állapot és pozíciók az engine-ben élnek; a gameStore a HUD számára ad nézetet.
- Fix 1280×720 világ, aránytartó megjelenítési skálázás; resize nem új meccs.
- Fix időlépésű ballisztika, seedelt, tükrözött value-noise terep.
  Ütközés: pixelmaszk; látvány: RenderTexture; rombolás mindkettőt módosítja.
- Robbanás után a talajmaszk az alsó pályaszélről négy szomszédos pixel mentén
  kapcsolatvizsgálatot végez. A levált darabok azonnal törlődnek a maszkból és a
  textúrából, a tankok talajra igazítása előtt; nincs omlási sebzés vagy zuhanási fizika.
  Ez csak a talajhoz kötött terepre vonatkozik, nem a külön dekorációs rétegre.
  Jövőbeli járható lebegő sziget külön maszkot/rögzítési szabályt igényel; nem tehető
  változtatás nélkül ebbe az alsó pályaszélhez kötött maszkba. Online azonos build kell.
- A terep bloom effektje a `TerrainBloomFilter` adaptert használja: rajzolás után
  leválasztja az ideiglenes bloom textúrát és a globális filter-input forrás/sampler
  kötéseit. Így a Pixi képernyőméret-váltáskor biztonságosan törölheti a pool textúráit
  `BindGroup` figyelmeztetések nélkül; az effekt beállításai változatlanok.
- Két szárazföldi tank, hot-seat vagy offline P2 AI; online két emberi játékos.
- A Campaign Map C3 külön `campaignMap` képernyő és `campaign` meccsmód,
  mindig P1 ember vs P2 AI. Öt valódi célpont: ALPHA → DELTA / FORGE → VANGUARD → PRIME.
  Szabad ágbejárás, OR feloldás; PRIME műveletzárás akár 4/5 mellett, replay/kimaradt ág megmarad.
  A `sectors.ts` katalógus adja a gráfot, profilokat, palettát és briefingkulcsot.
  P1 győzelmekor a Game az aktív szektor-ID teljesítését idempotensen menti.
  A külön `ballistic-front:campaign` v2 boríték `contentVersion: 1`, `completedIds`,
  `selectedId` mezőket tárol; v1 booleanból csak ALPHA teljesítés migrálódik.
  Ismeretlen/verzióhibás/ellentmondó mentésnél indítás tiltott, látható hibával.
  A `campaignNewRoutes` csak a csata eredményének prezentációja, nem mentett unlock-boolean.
  XP/profil és AI-memória közös a gyorscsatával; extra jutalom nincs.
  A `leaveBattle` lezárja az elhagyott csatát/AI-időzítőket, a renderer megmarad.
- A `generateSectorHeightmap` ALPHA-n a régi generálás+tükrözés pontos eredményét adja;
  az új szektorok normalizált alapgörbét és kétoktávos seedelt hullámot használnak.
  A Terrain ugyanabból a magasságtérképből építi a maszkot és a textúrát.
  A BattlefieldLayers szektoronként tintet, hegy-/ködszínt és városfény-intenzitást kap.
  Fizika, játékosszín és állapotszínek nem szektorfüggők; online setup továbbra is csak seed/starterIndex.
- Hét adatvezérelt statfejlesztés; helyi profil `{ xp, levels }`,
  verziózott tárolási borítékban (`STORAGE_VERSION = 2`).
- A Célzástámogatás alapból 1, szintenként +1 meccsenkénti előnézet-töltetet ad.
- Web Audio effektek és szintetizált fanfár, HTMLAudioElement háttérzene,
  Web Speech API felolvasás; zene/voice/effects csatornák és globális némítás.
- Beépített magyar, angol és német katalógus; magyar forráskulcsok és közös helyőrzők.

## Multiplayer v1 – megvalósított működés

- PHP/MySQL backend, szobakódos lobby és HTTP-polling; nincs WebSocket.
- A szerver szobastátuszt, setupot és revision alapú JSON eseménynaplót tárol,
  nem a teljes fizikai világállapotot.
- A host `match_started` eseménye közös seedet, kezdőindexet és profilokat ad.
- A kliensek a `move` és `fire` parancsokat játsszák vissza. A lövés szöget és erőt küld;
  a körönkénti szél közös seedből és rögzített körsorrendből számolódik, nem külön payload.
- Meccs után `upgrade_purchased`, host-only `match_finished` és visszavágóindítás.
- A helyi `sessionStorage` sessionből újratöltés után a napló az elejétől lekérhető.
  Ütköző revision esetén frissítés történik; nincs általános automatikus parancs-újraküldés.
- A backend eseménytípust, szobastátuszt, hozzáférést és host-jogot ellenőriz,
  de nem futtat fizikát és nem nyújt teljes csalásvédelmet.
- A profilsnapshotnak nincs külön szabály-/sémaverziója; a helyi mentésverzió nem
  protokollverzió. Mindkét kliensnek azonos buildet kell futtatnia.

Részletes végpontok és telepítés: [backend README](../../server/README.md).

## Bővítési korlátok

- A fizikai szabály legyen közös a tényleges lövés, az előnézet és az AI számára.
- Az online állapotot azonos seedből, revision szerinti eseménysorrendben kell felépíteni.
  A játékmeneti véletlen ne függjön renderidőtől vagy dekorációs effektektől.
- Új profilmezőhöz migráció, új online szabályhoz explicit kompatibilitási megoldás kell.
- Az upgrade-ek adatvezéreltek; általános fegyver-/lövedékdefiníciós rendszer még nincs.
- A UnitPresentation megjelenítési szerződés, nem általános egység- vagy mozgásmodell.
- A Game jelenleg nagy koordinátor; bővítéskor célzott közös modulok használata indokolt,
  nem egy előzetes teljes engine-újraírás.
- Több szektor, modifikátor, orbitális képesség és stratégiai hadjárat jelenleg javaslat:
  [gameplay és fejlődés](./gameplay-progression.md).
