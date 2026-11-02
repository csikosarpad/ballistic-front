# Sound Redesign

## Aktuális állapot

- A hangrendszert a `src/game/engine/AudioManager.ts` kezeli Web Audio API-val.
- A lövés, robbanás és tankmozgás hangjai OGG formátumban töltődnek be.
- A tankmozgás egyetlen loopolt `AudioBufferSourceNode`-ot használ, fade-in/fade-out átmenettel.
- A HUD némítása a master gain értékét vezérli.
- A hangfájlok eredeti forrásai Freesound CC0 szűréssel készültek.
- A WAV/FLAC → OGG konvertáláshoz a [FreeConvert OGG Converter](https://www.freeconvert.com/ogg-converter/) eszközt használtam.

## Következő fázisok

- [ ] Lövés erőváltoztatásához throttlingolt, halk power tick.
- [ ] Lövés szögének módosításához rövid mechanikus angle click.
- [ ] `targetHit` eseményhang tényleges tanktalálat után.
- [ ] `terrainImpact` eseményhang terrainbe csapódáskor.
- [ ] `targetMissed` eseményhang csak a lövedék lezárása után, tényleges találat hiányában.
- [ ] A tankmozgás-hang lazy loadingja és további mobil optimalizálása.
- [ ] Az eredeti Freesound-oldalak és szerzők fájlonkénti rögzítése publikálás előtt.

## Hangtervezési alapelvek

- Az aim-visszajelzések ne induljanak el minden slider pixelmozgásra.
- A power és angle hang karaktere különüljön el.
- A találat, terrain impact és miss események a játékmeneti collision/lezárási eseményekből induljanak, ne az előrejelzésből.
- A rövid hangok mono OGG/Opus formátumban, visszafogott bitrátával készüljenek.
- A motorhang loop maradjon egyetlen aktív forrás, ne jöjjön létre hangrétegződés billentyűismétléskor.
