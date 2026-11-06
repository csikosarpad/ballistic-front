# Játékmenet-fejlesztési útvonal

Ez az ábra a jelenlegi játékmeneti alapot és a tervezett fejlesztési ágakat
mutatja, a fő függőségekkel. Nem dátumozott ütemterv és nem vállalt
végrehajtási sorrend: a központi státuszt a [roadmap](./roadmap.md), a részletes
progressziós és fegyvertervet a [gameplay-elemzés](./gameplay-progression.md)
és a [végrehajtási TODO](./gameplay-progression-todo.md) tartalmazza.

```mermaid
flowchart TD
    subgraph NOW["Jelenlegi, működő alap"]
        CORE["Körökre osztott ballisztikus csata<br/>fix lépésű fizika · rombolható terep<br/>pajzs/páncél · fejlesztések"]
        PLAY["Játékmódok<br/>gyorscsata · hot-seat/online · offline AI"]
        CAMPAIGN["Campaign Map C1–C3 kész<br/>5 szektor · elágazó útvonal<br/>helyi mentés · replay"]
        SYNC["Determinista multiplayer/replay alap<br/>közös seed · revision eseménynapló"]
        CORE --> PLAY
        CORE --> CAMPAIGN
        PLAY --> SYNC
    end

    subgraph NEXT["Következő validáció és közös szabályalap"]
        VALIDATE["C3 játékpróba és regresszió<br/>szektorbalansz · mobil/akadálymentesség"]
        C4["C4 / Sector Operations<br/>környezeti modifikátorok<br/>szektorválasztás és közös setup"]
        RULES["Verziózott meccsszabályok<br/>közös feloldás: lövés · előnézet · AI"]
        CAMPAIGN --> VALIDATE
        CAMPAIGN --> C4
        SYNC --> RULES
        C4 --> RULES
    end

    subgraph WEAPONS["Taktikai felszerelés – elfogadott tervezési irány, külön roadmap-prioritás"]
        CATALOG["Közös fegyverkatalógus<br/>stabil ID-k · egyedi fegyverjellemzők"]
        UNLOCK["XP-s feloldások és saját loadout<br/>Standard kezdőfegyver · nincs fogyó lőszer"]
        TYPES["Első lövedékcsomag<br/>Standard · HE · AP · Seismic<br/>Smart Missile opcionális"]
        FIRE["Egységes fegyveres lövés<br/>Game · AI · röppálya-előnézet"]
        ONLINE["Saját feloldott készlet meccsenként<br/>offline · online · kampánytérkép"]
        VERIFY["Replay/szinkron ellenőrzés<br/>snapshot · szabályverzió · hibás ID elutasítása"]
        ENERGY["Későbbi energiafegyver-család<br/>lézer · energiasokkoló · energiagömb · villám"]
        CATALOG --> UNLOCK
        CATALOG --> TYPES
        UNLOCK --> ONLINE
        TYPES --> FIRE
        RULES --> FIRE
        FIRE --> VERIFY
        ONLINE --> VERIFY
        VERIFY --> ENERGY
    end

    subgraph TACTICAL["További taktikai ágak"]
        ABILITIES["Orbitális képességek<br/>slotok · töltetek · akcióköltség"]
        CLASSES["Szárazföldi egységosztályok<br/>eltérő statok és fegyverzet"]
        TERRAIN["Terep v2<br/>lebegő szigetek · esés/sebzés"]
        RULES --> ABILITIES
        FIRE --> CLASSES
        C4 --> TERRAIN
    end

    subgraph LONGTERM["Hosszú távú stratégiai játék"]
        CAMPAIGN_OPS["Single-player hadjárat<br/>küldetések · szektorfoglalás · stratégiai AI"]
        ROGUE["Roguelite útvonalak<br/>run-állapot · kockázat/jutalom"]
        ONLINE_CAMPAIGN["Közös online kampány<br/>külön backend- és hitelesítési projekt"]
        CAMPAIGN --> CAMPAIGN_OPS
        C4 --> CAMPAIGN_OPS
        ABILITIES --> CAMPAIGN_OPS
        CLASSES --> CAMPAIGN_OPS
        CAMPAIGN_OPS --> ROGUE
        SYNC --> ONLINE_CAMPAIGN
    end

    subgraph PARALLEL["Párhuzamos, játékszabályt nem módosító ág"]
        VISUAL["Siege Platform vizuális irány<br/>HUD · animáció · shaderek · effektek"]
        QUALITY["Eszközös ellenőrzés<br/>mobil · reduced-motion · teljesítmény"]
        VISUAL --> QUALITY
    end

    classDef done fill:#7ec588,stroke:#27864a,color:#102a18
    classDef validate fill:#fff3bf,stroke:#c18b00,color:#382900
    classDef proposed fill:#6d55a7,stroke:#7148b8,color:#251347
    classDef long fill:#7bb0eb,stroke:#52677f,color:#172332
    classDef parallel fill:#dff3f5,stroke:#27818b,color:#10282b

    class CORE,PLAY,CAMPAIGN,SYNC done
    class VALIDATE,C4,RULES validate
    class CATALOG,UNLOCK,TYPES,FIRE,ONLINE,VERIFY,ENERGY,ABILITIES,CLASSES,TERRAIN proposed
    class CAMPAIGN_OPS,ROGUE,ONLINE_CAMPAIGN long
    class VISUAL,QUALITY parallel
```

## A diagram olvasása

- **Zöld:** megvalósított alap. A Campaign Map C3 működik, de további
  játékpróba és eszközös ellenőrzés még szükséges.
- **Sárga:** következő validációs/közös szabályalap; a C4 és a verziózott
  konfiguráció részletes döntései még nyitottak.
- **Lila:** tervezett taktikai bővítés. A fegyvereknél az alapelvek és több
  döntés elfogadott, de az implementáció és a központi roadmap-prioritás még
  nincs jóváhagyva.
- **Szürke:** hosszú távú stratégiai irány, külön specifikációt igényel.
- **Türkiz:** a gameplay-szabályoktól elkülöníthető vizuális és eszközminőségi
  munka.

A fegyvercsomagban minden fegyver saját alapkarakterisztikát kap; a játékos
Standard Shell-lel indul, további fegyvereket XP-ért old fel, és a saját
feloldott készletét viszi offline, online és kampánytérképes meccsre. A
Robbanófej upgrade ettől különálló marad. Fegyverenként külön XP-fejlesztési ág
nem része az első csomagnak; később csak új taktikai döntést adó fejlesztés
indokolt.
