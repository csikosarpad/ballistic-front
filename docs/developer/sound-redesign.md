# Sound Redesign

Aktuális hangarchitektúra és részletes hangfejlesztési lista. Központi ütemezés:
[roadmap](./roadmap.md); használat: [játékosútmutató](../user/guide.md);
assetforrások: [fejlesztői útmutató](./getting-started.md#köszönet).
A „Következő fázisok” nem kész funkciók.

## Aktuális állapot

- A hangrendszert a `src/game/engine/AudioManager.ts` kezeli Web Audio API-val.
- A lövés, robbanás és tankmozgás hangjai OGG formátumban töltődnek be.
- A tankmozgás egyetlen loopolt `AudioBufferSourceNode`-ot használ, fade-in/fade-out átmenettel.
- A HUD némítása a master gain értékét vezérli, és a parancsnoki felolvasást is elnémítja.
- A háttérzenét az `AudioManager` egy loopolt `HTMLAudioElement`-tel játssza (hangerő 0,25, a ~4 MB-os MP3 streamelődik, nem dekódolódik memóriába); az első felhasználói gesztus után indul. A számok az `src/game/data/music.ts`-ben vannak (alap: `neon-city`).
- Három külön kapcsolható hangcsoport van (`src/game/state/audioSettings.ts`, `localStorage`): `music`, `voice` (parancsnoki felolvasás), `effects` (lövés, robbanás, tankmozgás, fanfár). A globális némítás mindhármat felülírja.
- A győzelmi fanfárt jelenleg az `AudioManager.playFanfare()` szintetizálja oszcillátorokkal (helyettesítő); valódi OGG esetén a `SoundName`/`URLS` bővítendő, a bemondás késleltetése (`VICTORY_ANNOUNCE_DELAY_MS` a `Game.ts`-ben) a fanfár hosszához igazítandó.
- A parancsnoki beszédet a `src/game/systems/speech.ts` adja a böngésző `speechSynthesis`
  API-jával (nem előre felvett hang). A `speak(text, locale, settings, slot)` hu/en/de
  nyelv szerint választ hangot (férfi név előnyben, `voiceName` felülírhatja);
  alapértelmezett hangmagasság 0,55, tempó 0,95. P2 külön hangot kap, ha van megfelelő,
  és minden esetben magasabb hangmagassággal/gyorsabb tempóval szól, nem csak egyhangos fallbacknél.
  A `commandStore.announce()` a konzolon megjeleníti és engedélyezett voice csatornán
  felolvassa a `command.*` i18n szövegeket. Elérhető hangok böngészőnként és OS-enként eltérnek.
- A hangeffektek eredeti forrásai Freesound CC0 szűréssel készültek; a háttérzene Pixabay Content License alatt áll (nem CC0), lásd `src/game/assets/audio/music/LICENSE.txt`.
- A WAV/FLAC → OGG konvertáláshoz a [FreeConvert OGG Converter](https://www.freeconvert.com/ogg-converter/) eszközt használtam.

## Következő fázisok

- [ ] Lövés erőváltoztatásához throttlingolt, halk power tick.
- [ ] Lövés szögének módosításához rövid mechanikus angle click.
- [ ] `targetHit` eseményhang tényleges tanktalálat után.
- [ ] `terrainImpact` eseményhang terrainbe csapódáskor.
- [ ] `targetMissed` eseményhang csak a lövedék lezárása után, tényleges találat hiányában.
- [ ] A tankmozgás-hang lazy loadingja és további mobil optimalizálása.
- [ ] Valódi győzelmi fanfár OGG fájl.
- [ ] Zeneválasztó és hangerő-szabályzók csatornánként. A `plans/` próbaszámai
  (energysound „Dark Cyberpunk Synthwave”, Jamii „Warhammer Background Music”) nem
  szerepelnek a futásidejű katalógusban; bekötésük előtt forrás-/licencellenőrzés kell.
- [ ] Parancsnoki beszéd beállításai (hang, sebesség, mélység), közlések gyakorisága és felülírható szövegei.
- [ ] Opcionális „Tűzparancs!” visszakötése, ha jóváhagyott: késleltetett lövés
  pontos időzítése és online szinkronja külön design- és implementációs feladat.
- [ ] Az eredeti Freesound-oldalak és szerzők fájlonkénti rögzítése publikálás előtt.
- [ ] A Pixabay Content License feltételeinek ellenőrzése a következő publikálás előtt,
  különös tekintettel az önálló terjesztésre és nyilvános repóba/buildbe kerülésre.
  A meglévő telepítés nem helyettesíti ezt; a forrás a `src/game/assets/audio/music/LICENSE.txt`-ben van.
- [ ] „Kreditek" nézet a Beállításokban a zene és az effektek szerzőivel.

## Hangtervezési alapelvek

- Az aim-visszajelzések ne induljanak el minden slider pixelmozgásra.
- A power és angle hang karaktere különüljön el.
- A találat, terrain impact és miss események a játékmeneti collision/lezárási eseményekből induljanak, ne az előrejelzésből.
- A rövid hangok mono OGG/Opus formátumban, visszafogott bitrátával készüljenek.
- A motorhang loop maradjon egyetlen aktív forrás, ne jöjjön létre hangrétegződés billentyűismétléskor.
