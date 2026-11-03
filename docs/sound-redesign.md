# Sound Redesign

## Aktuális állapot

- A hangrendszert a `src/game/engine/AudioManager.ts` kezeli Web Audio API-val.
- A lövés, robbanás és tankmozgás hangjai OGG formátumban töltődnek be.
- A tankmozgás egyetlen loopolt `AudioBufferSourceNode`-ot használ, fade-in/fade-out átmenettel.
- A HUD némítása a master gain értékét vezérli, és a parancsnoki felolvasást is elnémítja.
- A háttérzenét az `AudioManager` egy loopolt `HTMLAudioElement`-tel játssza (hangerő 0,25, a ~4 MB-os MP3 streamelődik, nem dekódolódik memóriába); az első felhasználói gesztus után indul. A számok az `src/game/data/music.ts`-ben vannak (alap: `neon-city`).
- Három külön kapcsolható hangcsoport van (`src/game/state/audioSettings.ts`, `localStorage`): `music`, `voice` (parancsnoki felolvasás), `effects` (lövés, robbanás, tankmozgás, fanfár). A globális némítás mindhármat felülírja.
- A győzelmi fanfárt jelenleg az `AudioManager.playFanfare()` szintetizálja oszcillátorokkal (helyettesítő); valódi OGG esetén a `SoundName`/`URLS` bővítendő, a bemondás késleltetése (`VICTORY_ANNOUNCE_DELAY_MS` a `Game.ts`-ben) a fanfár hosszához igazítandó.
- A parancsnoki beszédet a `src/game/systems/speech.ts` adja a böngésző `speechSynthesis` API-jával (nem előre felvett hang): a `speak(text, locale, VoiceSettings)` nyelv szerint választ hangot (férfi név előnyben, `voiceName` felülírhatja), alapértelmezett hangmagasság 0,55, tempó 0,95. A közlések a `commandStore.announce()` hívással jelennek meg a konzolon és hangzanak el; a szövegek `command.*` i18n kulcsok. Elérhető hangok böngészőnként és operációs rendszerenként eltérnek.
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
- [ ] Zeneválasztó a beállításokban (további számok: `energysound-dark-cyberpunk-synthwave`, `jamii-warhammer-background-music`), hangerő-szabályzók csatornánként.
- [ ] Parancsnoki beszéd beállításai (hang, sebesség, mélység), közlések gyakorisága és felülírható szövegei.
- [ ] Az eredeti Freesound-oldalak és szerzők fájlonkénti rögzítése publikálás előtt.
- [ ] A Pixabay Content License feltételeinek ellenőrzése publikálás előtt (önálló terjesztés tilalma: a zenefájlok nyilvános repóban); a zenék forrása a `src/game/assets/audio/music/LICENSE.txt`-ben van.
- [ ] „Kreditek" nézet a Beállításokban a zene és az effektek szerzőivel.

## Hangtervezési alapelvek

- Az aim-visszajelzések ne induljanak el minden slider pixelmozgásra.
- A power és angle hang karaktere különüljön el.
- A találat, terrain impact és miss események a játékmeneti collision/lezárási eseményekből induljanak, ne az előrejelzésből.
- A rövid hangok mono OGG/Opus formátumban, visszafogott bitrátával készüljenek.
- A motorhang loop maradjon egyetlen aktív forrás, ne jöjjön létre hangrétegződés billentyűismétléskor.
