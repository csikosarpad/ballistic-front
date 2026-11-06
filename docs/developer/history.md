# Fejlődési napló

A projekt jelentősebb fejlődési lépései az első committól, a Git-történet és a
kapcsolódó változtatások alapján. A dátumok a commitok szerzői dátumai; a branch
mainbe olvasztásának dátuma ettől eltérhet. A merge-ek, apró formázások és önmagukban
álló referenciafeltöltések nem kapnak külön bejegyzést.

A forráscommitok az adott mérföldkő reprezentatív változtatásai, nem teljes commitlisták.
A korábbi teszt-, mérési és designállítások az akkori iterációra vonatkoznak;
nem aktuális backlog és nem folyamatos tesztjelentés.
Jelenlegi működés: [játékosútmutató](../user/guide.md); aktív státuszok: [roadmap](./roadmap.md).

## 2026-11-04 – Német nyelv és rendezett dokumentáció

### Harmadik felületi nyelv

- A magyar és angol mellé német fordítás került.
- Bővült a locale-katalógus, a nyelvválasztás és a böngészőnyelv felismerése.
- A parancsnoki felolvasás német nyelvi támogatást kapott.
- Az i18n-tesztek a német kulcsokat, helyőrzőket és nyelvváltást is ellenőrzik.

### Fejlődési plafon és dokumentációs rendszer

- Elkészült a [gameplay- és fejlődési elemzés](./gameplay-progression.md):
  a hét összeadódó statfejlesztés kifutása után új taktikai döntések szükségesek.
- A szektorok → modifikátorok → orbitális támogatás → egységosztályok sorrend
  javaslatként került dokumentálásra, nem implementált funkcióként.
- A dokumentáció egységesítette a kész funkciók, tervek és történeti ellenőrzések státuszát.
  Pontosította a helyi profilverzió és az online snapshot közötti különbséget.
- A dokumentumok célközönség szerint szétváltak: `docs/user/` a játékosoknak,
  `docs/developer/` a fejlesztőknek, `archive/` a lezárt vizuális listáknak.
- A roadmap és a fejlesztői kontextus kikerült a gyökérből; a README rövid belépési pont lett.
  Külön játékosútmutató és fejlesztői indítási referencia készült.
- Ismert nyitott pontként megmaradt a shop összes XP-re utaló, valójában egyenleget
  mutató felirata és a valós telefonos próba. A dokumentáció nem javította ezeket a játékban.

Forráscommitok:
[német nyelv – f20712d](https://github.com/csikosarpad/ballistic-front/commit/f20712d),
[progressziós elemzés és dokumentációegységesítés – 0e412e1](https://github.com/csikosarpad/ballistic-front/commit/0e412e1),
[dokumentáció átrendezése – 69af171](https://github.com/csikosarpad/ballistic-front/commit/69af171).

## 2026-11-03 – Sci-fi látvány, parancsnoki rendszer és AI

### A csatatér és a harci visszajelzések látványugrása

- A korábbi generált háttér csillagköd-képpel, lassan sodródó köd-/csillagréteggel
  és három, légköri homállyal elválasztott hegyréteggel bővült.
- A bolygó városfényei külön additív glow/lights JPG-rétegeket kaptak.
  Ezek kiváltották a korábbi külön városfény-PNG tervét.
- A terepre `AdvancedBloomFilter` került, gyengébb érintőeszközös beállítással.
- Megjelent a becsapódás után elhalványuló plazma-lövedéknyom és a sebzéshez,
  robbanási sugárhoz igazított, csillapodó kamera-rázkódás.
- A robbanások szikrákkal, második lökéshullámgyűrűvel és villanással bővültek;
  a környezet további ködöt és fénysávokat kapott.
- A HUD animált reveal-, scanline- és aktívállapot-effekteket kapott.
  A védelmi csíkokat a HUD-on koncentrikus HP-/pajzs-/páncélgyűrűk,
  az erőcsúszkát félkör alakú műszer egészítette ki.
- A háttérmozgások és kamera-rázkódás reduced-motion viselkedése külön kezelést kapott.
  Ezek látványfejlesztések, nem új orbitális vagy környezeti gameplay-mechanikák.

Forráscommitok:
[parallax – 2fb4769](https://github.com/csikosarpad/ballistic-front/commit/2fb4769),
[városfények és bloom – 1f8a0a5](https://github.com/csikosarpad/ballistic-front/commit/1f8a0a5),
[lövedéknyom és rázkódás – f5793cb](https://github.com/csikosarpad/ballistic-front/commit/f5793cb),
[becsapódások – 0444ab0](https://github.com/csikosarpad/ballistic-front/commit/0444ab0),
[köd és fény – c7bca71](https://github.com/csikosarpad/ballistic-front/commit/c7bca71),
[HUD animáció – 32ede12](https://github.com/csikosarpad/ballistic-front/commit/32ede12),
[műszerek – 2e05b63](https://github.com/csikosarpad/ballistic-front/commit/2e05b63).

### Parancsnoki konzol, nevek és hangcsatornák

- Elkészült az időbélyeges, gépelési effektes taktikai konzol, a `commandStore`
  és a böngészős `speechSynthesis` felolvasás, ekkor magyar/angol támogatással.
- A közlések a tényleges harci eseményekhez kapcsolódtak:
  célbefogás, találat, pajzs-/páncélsérülés, kritikus sérülés és győzelem.
  A közlések száma csökkent; a „Tűzparancs!” nem maradt aktív bemondás.
- Győzelemkor szintetizált fanfár és késleltetett győzelmi közlés jelent meg.
- A játékosnevek a Beállításokban is szerkeszthetővé és helyileg menthetővé váltak;
  a HUD, bolt, eredményképernyő és beszéd közös névfeloldást használ.
- A háttérzene energysound „Cyberpunk Neon City” loopolt MP3-ja lett.
  A zene, parancsnoki hang és effektek külön kapcsolható csatornákat kaptak;
  a globális némítás mindet felülírja.

Forráscommitok:
[konzol és beszéd – e309304](https://github.com/csikosarpad/ballistic-front/commit/e309304),
[nevek és győzelem – b860268](https://github.com/csikosarpad/ballistic-front/commit/b860268),
[zene és hangcsatornák – 125414f](https://github.com/csikosarpad/ballistic-front/commit/125414f).

### Offline AI és pontosabb célzástámogatás

- A P2-t opcionálisan offline AI kezdte vezérelni. Saját ballisztikai szimulációval
  keres szög-/erőpárt, és szükség esetén közelítő mozgást tervez.
- Normál célzásban pontatlan szélbecslést és zajt használ; a becsapódásokból korrigál.
  Meccsek közötti, helyileg tárolt tapasztalata javítja tudásszintjét.
- Az AI a meccs statisztikái alapján maga vásárol fejlesztéseket.
  AI-meccsen az ember csak P1 boltját szerkesztheti.
- Megjelent a 0–5 csillagos rendfokozat: AI-nál tapasztalatból, embernél
  a megszerzett fejlesztések arányából, nem külön életút-XP szintként.
- A két parancsnok külön hangot használ, ha van megfelelő; P2 magasabban és gyorsabban szól.
- A már fejleszthető Smart Aim konzolos aktiválásjelzést, találati visszajelzést
  és AI-használatot kapott. A célkeresztet a szimulált közvetlen találat vezérli,
  nem az előnézet puszta bekapcsolása.
- A precíz célzás durva keresőrács után egész szög-/erőértékekkel finomít;
  az AI Smart Aim mellett zaj nélküli találó lövést is kereshet.
- Az AI, beszéd, rendfokozat és pontos célzási keresés célzott tesztekkel bővült.

Forráscommitok:
[AI és tapasztalat – 3e86ce1](https://github.com/csikosarpad/ballistic-front/commit/3e86ce1),
[Smart Aim integráció – cc1510f](https://github.com/csikosarpad/ballistic-front/commit/cc1510f),
[precíz lövéstervezés – cc107aa](https://github.com/csikosarpad/ballistic-front/commit/cc107aa),
[becsapódásszimuláció – 9157d19](https://github.com/csikosarpad/ballistic-front/commit/9157d19).

## 2026-11-02 – Solvyr Prime identitás, mobilvezérlés és fejleszthető előnézet

- A projekt megjelenített neve **Solvyr Prime: Siege Protocol** lett az UI-ban,
  oldalmetaadatokban és dokumentációban.
- A főmenü és aktív HUD egységes sci-fi panelrendszerbe rendeződött.
  Külön Beállítások nézet készült a nyelvvel és hanggal; az online lobby is új stílust kapott.
- Az Oxanium és Rajdhani önállóan hosztolt fontcsomagokkal, magyar ékezeteket is
  tartalmazó subsetekkel került be. Az Orbitron nem lett része a fontkészletnek.
- A fejlesztéssorok külön jelezni kezdték a megvásárolható és megfizethetetlen állapotot.
- A röppálya-előnézet egyszeri kerete játékosonkénti töltetszámmá alakult:
  alapból 1, a Smart Aim új fejlesztése szintenként +1-et ad.
  A statmodell, HUD és előnézet-tesztek együtt bővültek.
- A WAV/FLAC effektek OGG fájlokra váltottak, lényegesen kisebb webes assetekkel.
  Külön hangfejlesztési dokumentum készült.
- A csatatér dekoratív SVG tereptárgyakkal bővült; a kezdeti fa-/antennaelemek
  később kikerültek az aktív pályaképből, a szikla-dekoráció megmaradt.
  A dekoráció nem kapott ütközést vagy rombolhatóságot.
- A mobilvezérlés ±1°/±10 gombokat, nyomva tartásos ismétlést és tankközelből
  indított húzásos célzást kapott. Fekvő, alacsony nézetben a HUD oldalra rendeződött.
- Indításkor támogatott érintőböngészőben teljes képernyőt és fekvő tájolást kér
  a játék, visszautasítás esetére tájolási tippel. A húzásos célzás és HUD tesztjei bővültek.
- A hangfelélesztés mobil gesztuskezeléssel és láthatóságváltás utáni
  AudioContext-visszaállítással stabilizálódott.
- Az éles API-konfiguráció és telepítési leírás a `/solvyr-prime` útvonalhoz igazodott.

Forráscommitok:
[OGG, dekoráció és előnézet-töltetek – 3196950](https://github.com/csikosarpad/ballistic-front/commit/3196950),
[menü és HUD – 911854b](https://github.com/csikosarpad/ballistic-front/commit/911854b),
[projektidentitás – 6b06c5c](https://github.com/csikosarpad/ballistic-front/commit/6b06c5c),
[fontok – 1a9125c](https://github.com/csikosarpad/ballistic-front/commit/1a9125c),
[mobil és húzásos célzás – ec29ff1](https://github.com/csikosarpad/ballistic-front/commit/ec29ff1),
[hangfelélesztés javítása – cd1dba3](https://github.com/csikosarpad/ballistic-front/commit/cd1dba3),
[API-útvonal – 4b32c8b](https://github.com/csikosarpad/ballistic-front/commit/4b32c8b).

## 2026-11-01 – Egységfüggetlen eredményképernyő és rétegezett csatatér

- Az eredményképernyő széles, neon katonai kártyává alakult: külön meccsstatisztika,
  két játékospanel, trófeás győztes fejléc és szegmentált fejlesztési sorok.
  Keskeny nézetben a panelek egymás alá rendeződnek.
- A Shop `UnitPanel`, `UpgradeRow`, `UpgradeIcon`, `SegmentedProgressBar` és
  `UnitIllustration` komponensekre bomlott, külön upgrade-/egységprezentációval.
- Közös Pixi UI primitive-ok és theme-tokenek készültek: neon keretek, vonalak,
  badge-ek és panelek. A ResultScreen külön dekorációs canvast és háttérrészecskéket kapott.
- A renderer-cleanup megőrizte a játék megosztott erőforrásait, hogy visszavágó után
  ne ürüljön ki a csatatér. A méret-, panel-, jogosultság- és disabled contractok teszteket kaptak.
- A tank és asset nélküli space konfiguráció azonos prezentációs hierarchiában
  használhatóvá vált; ez nem új játszható űregység.
- A részletes tank-SVG külön test-, löveg-, technikai részlet- és játékosaccent-rétegeket kapott.
  P1 jobbra, P2 balra néz az eredményképernyőn; a semleges acél és a cyan/gold accent elkülönült.
- A csatatér seedből újrarajzolható ég-, hegy- és atmoszférarétegekkel bővült.
  A szél pontos HUD-indikátort és talajközeli porfelhős vizuális megerősítést kapott.
- A terep felszíni highlighttal és talajrétegvonalakkal részletesebb lett,
  a fizikai collision mask működésének megtartásával.
- A PixiJS külön vendor chunkba került a Vite buildben. A naplózott akkori fő chunk
  kb. 1,1 MB-ról 211 kB-ra csökkent; ez történeti mérés, nem a jelenlegi build mérete.
- A vizuális redesign terve és a ResultScreen részletes szerződésdokumentációja elkészült.

Forráscommitok:
[eredménylayout – 06def32](https://github.com/csikosarpad/ballistic-front/commit/06def32),
[prezentáció és Pixi UI – 926a099](https://github.com/csikosarpad/ballistic-front/commit/926a099),
[tank és csatatérrétegek – c3375b8](https://github.com/csikosarpad/ballistic-front/commit/c3375b8),
[vendor chunk – 6b3a2ee](https://github.com/csikosarpad/ballistic-front/commit/6b3a2ee).

## 2026-10-14 – Multiplayer-stabilizálás, lokalizáció és új védelmi modell

### Online alapok és testreszabhatóság

- A már meglévő PHP backend mappái `public` → `api` és `src` → `lib` nevekre
  változtak; a telepítési és hozzáférési leírás ehhez igazodott.
  Ez szerkezeti rendezés volt, nem a multiplayer első bevezetése.
- Két független kliens szinkronját és determinisztikus headless visszajátszást
  ellenőrző tesztek kerültek be, beleértve a revision- és kézbesítési viselkedést.
- A magyar/angol lokalizáció közös kulcsokkal, mentett nyelvválasztással és
  helyőrzőtesztekkel indult. A fejlesztések neve/leírása kikerült az üzleti definíciókból.
- Az UI CSS változókat, a Pixi játék külön `Theme` színobjektumot kapott.
  Ez a későbbi skinrendszer alapja, nem teljes külső skinbetöltés.
- Sci-fi roadmap és közös Prettier-konfiguráció készült.

### Pajzs → páncél → HP

- A korábbi max-HP-t növelő „páncél” helyett fizikai védelem és új erőtér pajzs jelent meg.
- A védelmi iteráció végére a pajzs, páncél és HP sorban, 1:1 arányban fogyó
  pontkészletté vált; a közös sebzésfüggvény külön teszteket kapott.
- A pajzs körönként visszatöltődik, a páncél nem. Találat után a következő saját
  körben a pajzsregeneráció kimarad.
- A meglévő `armor` upgrade-azonosító megmaradt a korábbi szintek megtartásához.
  A profilmentés verziózott borítékot és legacy mentésátvételt kapott.
- A HUD és a tank fölötti kijelzés külön HP-/pajzs-/páncélcsíkokkal és jelmagyarázattal bővült.

Forráscommitok:
[backendmappák – 9f1e903](https://github.com/csikosarpad/ballistic-front/commit/9f1e903),
[szinkron- és replay-tesztek – 34a9220](https://github.com/csikosarpad/ballistic-front/commit/34a9220),
[hu/en lokalizáció – e9db9d7](https://github.com/csikosarpad/ballistic-front/commit/e9db9d7),
[UI-színváltozók – 1606c18](https://github.com/csikosarpad/ballistic-front/commit/1606c18),
[Pixi Theme – 3963b23](https://github.com/csikosarpad/ballistic-front/commit/3963b23),
[védelmi alap és profilmigráció – 3f0a17d](https://github.com/csikosarpad/ballistic-front/commit/3f0a17d),
[fogyó páncélpontok – 5a16add](https://github.com/csikosarpad/ballistic-front/commit/5a16add),
[találat utáni regeneráció – c1c6ff1](https://github.com/csikosarpad/ballistic-front/commit/c1c6ff1).

## 2026-10-12 – Hangrendszer és online multiplayer v1

- Web Audio hangkezelés került be lövés-, robbanás- és tankmozgás-assetekkel.
  A motorhang loopolt, lecsengő forrást és ismételt mozgáshoz hold gate-et kapott.
- A HUD és az M billentyű globális némítást kapott, helyileg megőrzött választással.
- Megjelent a PHP/MySQL szobakezelés, az API kliens, a protokoll, a Zustand lobby-store
  és a szobakódos lobby. A backend ekkor `server/public` és `server/src` alatt volt.
- A két kliens közös seed, kezdőindex és profiladatok alapján szimulálja a meccset.
  A mozgás/lövés revision alapú eseménynaplóval és HTTP-pollinggal szinkronizálódik.
- A Game offline/online bekötést kapott; online csak a saját kör vezérelhető.
  A szerver szobastátuszt és eseményeket tárol, nem teljes fizikai világot szimulál.
- A meccs utáni fejlesztés és a host által indítható visszavágó is bekerült.
  A vásárlás saját profilra és szinkronizált meccsvégére korlátozódott.
- API-, store-, seedelt véletlen- és képernyőtesztek bővültek;
  helyi Vite-proxy és telepítési referencia készült.

Forráscommitok:
[hang és némítás – cffd35c](https://github.com/csikosarpad/ballistic-front/commit/cffd35c),
[multiplayer alap – 279a181](https://github.com/csikosarpad/ballistic-front/commit/279a181),
[online bolt és visszavágó – f5bc285](https://github.com/csikosarpad/ballistic-front/commit/f5bc285).

## 2026-10-11 – Első commit: működő tüzérségi játék és tartós fejlődés

Az első commit címe körkezelést említ, de a változtatás már a teljes kezdeti játékot
és fejlesztői környezetet tartalmazza; nem egy üres projektváz.

- Vite, React, TypeScript, PixiJS, Zustand, Vitest/React Testing Library és
  lint-/formázási környezet került be.
- A React menü/HUD/bolt/eredményképernyő és a játékmag külön modulokban indult.
- Két tankos hot-seat csata készült mozgáskerettel, szög-/erőcélzással,
  körönkénti széllel, bemenetzárolással és váltakozó meccskezdővel.
- A ballisztika fix 1/60 másodperces lépést, ütközést és röppálya-előnézetet kapott.
  Az előnézet ekkor játékosonként egyszer használható, nem fejleszthető töltetcsomag.
- Seedelhető value-noise magasságtérkép, tükrözött terep, RenderTexture-látvány,
  pixelmaszkos ütközés, kör alakú rombolás és perzselt kráterperem indult.
- Tank body/barrel SVG-k, simított lövegmozgás, visszarúgás és részecskeeffektek készültek.
- Az XP, öt adatvezérelt fejlesztés, meccsek közötti bolt és helyi profilmentés
  már része volt az első verziónak. A páncél ekkor max HP-t növelt;
  erőtér pajzs és fejleszthető Smart Aim még nem volt.
- Lövés-/sebzés-/XP statisztika, győzteskijelzés, visszavágó és haladástörlés készült.
- Fizika, tank, terep, körkezelés, fejlesztés, profilmentés, részecskék és React
  képernyők célzott tesztjei már az első commitban szerepeltek.

Forrás:
[első commit – 9a142a0](https://github.com/csikosarpad/ballistic-front/commit/9a142a0).
