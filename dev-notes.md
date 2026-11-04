# Solvyr Prime: Siege Protocol – fejlesztői kontextus

A jelenlegi architektúra rövid összefoglalója, nem implementációs feladatlista.
Indítás és funkcióleírás: [README](./README.md). Státuszok és további fejlesztések:
[ROADMAP](./ROADMAP.md). A dokumentumok szerepeit a README dokumentációs táblája rögzíti.

## Meglévő architektúra

- React 18 + TypeScript, Vite, PixiJS 8 és Zustand.
- A [játékmag](./src/game/) koordinálja a loopot, fizikát, terepet és entitásokat;
  a [React UI](./src/ui/) a HUD-ot, menüt, lobbyt, boltot és eredményképernyőt kezeli.
- A fizikai állapot és pozíciók az engine-ben élnek; a gameStore a HUD számára ad nézetet.
- Fix 1280×720 világ, aránytartó megjelenítési skálázás; resize nem új meccs.
- Fix időlépésű ballisztika, seedelt, tükrözött value-noise terep.
  Ütközés: pixelmaszk; látvány: RenderTexture; rombolás mindkettőt módosítja.
- Két szárazföldi tank, hot-seat vagy offline P2 AI; online két emberi játékos.
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

Részletes végpontok és telepítés: [backend README](./server/README.md).

## Bővítési korlátok

- A fizikai szabály legyen közös a tényleges lövés, az előnézet és az AI számára.
- Az online állapotot azonos seedből, revision szerinti eseménysorrendben kell felépíteni.
  A játékmeneti véletlen ne függjön renderidőtől vagy dekorációs effektektől.
- Új profilmezőhöz migráció, új online szabályhoz explicit kompatibilitási megoldás kell.
- Az upgrade-ek adatvezéreltek; általános fegyver-/lövedékdefiníciós rendszer még nincs.
- A UnitPresentation megjelenítési szerződés, nem általános egység- vagy mozgásmodell.
- A Game jelenleg nagy koordinátor; bővítéskor célzott közös modulok használata indokolt,
  nem egy előzetes teljes engine-újraírás.
- Szektor, modifikátor, orbitális képesség és kampány jelenleg javaslat:
  [gameplay és fejlődés](./docs/gameplay-progression.md).
