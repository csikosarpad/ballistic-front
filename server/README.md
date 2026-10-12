# Ballistic Front multiplayer backend

Ez a mappa a körökre osztott multiplayer első verziójának PHP/MySQL backendjét tartalmazza. A backend szobákat hoz létre, kezeli a két játékos csatlakozását, és verziózott eseménynaplót tárol. A játék fizikáját továbbra is a kliensek futtatják.

## Jelenlegi állapot

Megvalósított HTTP-végpontok:

- Szoba létrehozása és csatlakozás hatkarakteres kóddal.
- Szobastátusz és új események lekérése revision alapján.
- Események hozzáfűzése optimista verzióellenőrzéssel.
- Szobánkénti Bearer token és 24 órás lejárat.

A lobbyból a host elindíthatja a meccset; a kliensek a közös seed és upgrade snapshot alapján szimulálják a fizikát, a mozgás- és lövésparancsokat pedig verziózott eseményként játsszák vissza. A meccs után mindkét játékos a saját tankját fejlesztheti, majd a host indíthat visszavágót. A backend a szoba státuszait és a host-only start/finish eseményeket ellenőrzi, de nem futtat fizikát és nem nyújt teljes csalásvédelmet.

## Mappastruktúra

- `public/index.php` – HTTP router és API-végpontok.
- `public/.htaccess` – Apache URL-átírás és Authorization fejléc továbbítása.
- `src/bootstrap.php` – adatbázis-kapcsolat, JSON-válaszok, autentikáció és közös segédek.
- `schema.sql` – MySQL/MariaDB táblák.

A `public/` könyvtár a webes belépési pont. A `src/` PHP kód maradjon kívül a nyilvános document rooton, de a két könyvtár egymáshoz viszonyított helye telepítéskor maradjon meg, mert az `index.php` a `../src/bootstrap.php` fájlt tölti be.

## Követelmények Windows alatt

Használható például XAMPP, Laragon, WAMP vagy külön telepített PHP és MySQL/MariaDB.

- PHP 8.1 vagy újabb.
- MySQL vagy MariaDB InnoDB- és JSON-támogatással.
- Bekapcsolt PHP `PDO`, `pdo_mysql` és `mbstring` kiterjesztés.
- Apache használatakor `mod_rewrite` és `mod_setenvif`.
- Node.js 24 és pnpm a frontendhez.

Ellenőrizd, hogy a PHP CLI elérhető-e a PowerShellből:

```powershell
php -v
php -m
```

A modulok között szerepeljen a `pdo_mysql` és az `mbstring`. Ha a `php` parancs nem található, add hozzá a PHP telepítési mappáját a `PATH` környezeti változóhoz, vagy használd a telepített környezet PHP binárisának teljes elérési útját.

## Helyi fejlesztés

### 1. Adatbázis létrehozása

Hozz létre egy adatbázist, például phpMyAdminban:

```sql
CREATE DATABASE ballistic_front
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Importáld a `server/schema.sql` fájlt ebbe az adatbázisba. A séma létrehozza a `rooms` és `room_events` táblákat.

### 2. PHP API indítása

A projekt tartalmaz egy helyi `server/config.php` fájlt, amelyet a Git figyelmen kívül hagy. Új klónnál a példából hozd létre, ha még nincs meg:

```powershell
if (-not (Test-Path server/config.php)) { Copy-Item server/config.example.php server/config.php }
```

Nyisd meg a `server/config.php` fájlt, majd állítsd be a saját MySQL host, adatbázisnév, felhasználónév és jelszó értékeit. A `api.base_path` éles értéke `/ballistic-front/api`; a `route_aliases` tartalmazza a helyi Vite proxy által használt `/api` útvonalat.

Ezután a projekt gyökérmappájából indítsd el a beépített PHP fejlesztői szervert:

```powershell
php -S 127.0.0.1:8000 -t server/public server/public/index.php
```

Ez a terminál maradjon nyitva. Ha a configot nem a `server/config.php` helyen tartod, add meg a fájl helyét a `BALLISTIC_CONFIG_PATH` környezeti változóval.

### 3. Frontend indítása

Egy másik terminálban, a projekt gyökeréből:

```powershell
pnpm.cmd install
pnpm.cmd dev
```

A Vite `/api` útvonalai alapértelmezetten a `http://127.0.0.1:8000` címre proxyzódnak. Ha a PHP szerver más címen vagy porton fut, állítsd be a Vite indítása előtt:

```powershell
$env:MULTIPLAYER_API_TARGET = "http://127.0.0.1:8080"
pnpm.cmd dev
```

A kliens `VITE_MULTIPLAYER_API_URL` alapértelmezése `/api`; helyi fejlesztéshez nem szükséges külön `.env` fájl.

### 4. Lobby ellenőrzése

1. Nyisd meg a frontend Vite URL-jét, majd válaszd az **Online játék** lehetőséget.
2. Az egyik böngészőablakban hozz létre szobát, és jegyezd fel a megjelenő kódot.
3. Nyiss egy másik böngészőprofilt vagy privát ablakot, majd csatlakozz ugyanazzal a kóddal.
4. Mindkét oldalon meg kell jelennie a másik játékos nevének és a csatlakozott állapotnak.

Ez a próba csak a lobbyt és a backend szinkronját ellenőrzi; a távoli játékosok közötti játékmenet még nincs bekötve.

## Konfiguráció

| Beállítás | Hol található | Jelentés |
| --- | --- | --- |
| `db.host`, `db.port` | `server/config.php` | MySQL/MariaDB szerver címe és portja. |
| `db.name` | `server/config.php` | A létrehozott adatbázis neve. |
| `db.user`, `db.pass` | `server/config.php` | Adatbázis-felhasználó és jelszó. |
| `api.base_path` | `server/config.php` | Éles API prefix; ehhez a projekthez `/ballistic-front/api`. |
| `api.route_aliases` | `server/config.php` | Helyi API prefixek; alapértelmezetten `/api`. |
| `api.allowed_origins` | `server/config.php` | Pontos böngésző-origin allowlist, például `https://delawer.hu`. |
| `api.max_payload_bytes` | `server/config.php` | Esemény payload felső méretkorlátja byte-ban. |
| `BALLISTIC_CONFIG_PATH` | PHP folyamat környezete | Opcionális, a config teljes fájlútvonala, ha nem a `server/config.php` helyen van. |
| `MULTIPLAYER_API_TARGET` | Vite környezete | Fejlesztői proxy célcíme; alapértelmezése `http://127.0.0.1:8000`. |
| `VITE_MULTIPLAYER_API_URL` | Frontend build | Böngésző API-alap URL; lokálisan `/api`, élesben `https://delawer.hu/ballistic-front/api`. |

Éles adatbázis-jelszót ne írj a `config.example.php` fájlba, és a saját `config.php` fájlt ne commitold. Ha lehet, a szerveren tartsd a configot a webrooton kívül, és a `BALLISTIC_CONFIG_PATH` változóval mutass rá.

## API

Az alábbi útvonalak az API-alap URL-hez képest értendők. Helyi fejlesztéskor az alap URL `/api`, így például a `POST /rooms` teljes útvonala `http://127.0.0.1:5173/api/rooms` a Vite proxyn keresztül.

### Szoba létrehozása

`POST /rooms`

```json
{
  "playerName": "Ada"
}
```

`201 Created` választ ad. A válasz `credentials` objektuma tartalmazza a szobakódot, a játékosazonosítót és a titkos tokent. A `update.session` tartalmazza a seedet és a kezdő játékost. A tokent a backend csak hash formájában tárolja; a kliens ezt a tokent használja a későbbi kérésekhez.

### Csatlakozás

`POST /rooms/{code}/join`

```json
{
  "playerName": "Grace"
}
```

Csak `waiting` állapotú szobához lehet csatlakozni. Siker esetén a második játékos `P2` azonosítót kap, a szoba `ready` állapotba kerül, a revision eggyel nő.

### Állapot és események lekérése

`GET /rooms/{code}?since={revision}`

Fejléc:

```http
Authorization: Bearer <room-token>
```

A válasz a pillanatnyi `session` állapotot és a megadott revisionnél újabb eseményeket adja vissza, növekvő sorrendben. A session tartalmazza a státuszt, revisiont, setupot és játékosneveket.

### Esemény hozzáfűzése

`POST /rooms/{code}/events`

Fejléc: `Authorization: Bearer <room-token>`.

```json
{
  "expectedRevision": 1,
  "type": "move",
  "payload": {
    "direction": -1
  }
}
```

Az írás tranzakcióban ellenőrzi az aktuális revisiont. Sikeres íráskor az új revision az előző plusz egy. Ha közben egy másik kliens írt, a válasz `409 Conflict`; ilyenkor előbb le kell kérni az új állapotot, majd az új revision alapján dönteni az ismétlésről. A payload JSON objektum, legfeljebb 256 KiB. Az eseménytípus kisbetűvel kezdődő, legfeljebb 32 karakteres azonosító.

Státuszok:

- `waiting` – a szoba a második játékosra vár.
- `ready` – mindkét játékos csatlakozott.
- `playing` – `match_started` esemény érkezett.
- `finished` – `match_finished` esemény érkezett.

Engedélyezett események és állapotok:

- `move`, `fire` csak `playing` állapotban írható.
- `upgrade_purchased` csak `finished` állapotban írható; az esemény a hitelesített játékoshoz tartozik.
- `match_started` `ready` vagy `finished` állapotból írható, kizárólag a szoba hostja (`P1`) által.
- `match_finished` csak `playing` állapotban írható, kizárólag a host által.

Ez állapot- és jogosultságellenőrzés, nem teljes játékszabály-ellenőrzés. A backend például nem vizsgálja a lövésértékek tartományát vagy azt, hogy valóban az aktuális kör játékosa küldte-e.

Engedélyezett események és állapotok:

- `move`, `fire` csak `playing` állapotban írható.
- `upgrade_purchased` csak `finished` állapotban írható; az esemény a hitelesített játékoshoz tartozik.
- `match_started` `ready` vagy `finished` állapotból írható, kizárólag a szoba hostja (`P1`) által.
- `match_finished` csak `playing` állapotban írható, kizárólag a host által.

Ez állapot- és jogosultságellenőrzés, nem teljes játékszabály-ellenőrzés. Például a backend nem vizsgálja a lövés értéktartományát vagy azt, hogy valóban az aktuális kör játékosa küldte-e.

## Adatbázis és élettartam

- A `rooms` tárolja a szobakódot, státuszt, neveket, tokenhash-eket, kezdő setupot és revisiont.
- A `room_events` tárolja a revisionhöz rendelt játékosazonosítót, eseménytípust, JSON payloadot és időbélyeget.
- A szobakód hat karakter; lejárat után a szoba nem olvasható és nem módosítható.
- A szobák a létrehozástól számított 24 óra után lejárnak. A lejárt sorok törlése jelenleg nem automatikus; később ütemezett adatbázis-karbantartást érdemes hozzáadni.
- A backend nem ellenőrzi, hogy az esemény a soron lévő játékostól érkezett-e. A revision csak az egyidejű írásokat rendezi, nem csalásvédelem.

## Éles telepítés

### 1. Adatbázis

Hozz létre külön MySQL/MariaDB adatbázist és korlátozott jogosultságú felhasználót. Importáld a `schema.sql` fájlt. A produkciós jelszót kizárólag a tárhely szerveroldali konfigurációjában tárold.

### 2. PHP API

Az API-t a kívánt `https://delawer.hu/ballistic-front/api` címre telepítsd:

- A `server/public/` tartalma kerüljön a `public_html/ballistic-front/api/` mappába.
- A `server/src/` tartalma kerüljön a `public_html/ballistic-front/src/` mappába; a benne lévő `.htaccess` tiltja a PHP forrás HTTP-letöltését.
- A `server/config.php` kerüljön a `public_html/ballistic-front/config.php` helyre, vagy még jobb, a webrooton kívülre, `BALLISTIC_CONFIG_PATH` beállítással.
- Importáld a `server/schema.sql` fájlt a produkciós adatbázisba.

Ha a `config.php` a frontend könyvtárába kerül, a `public_html/ballistic-front/.htaccess` fájlban tiltsd le a közvetlen elérését:

```apache
<Files "config.php">
  Require all denied
</Files>
```

Az Apache API könyvtárban legyen engedélyezve a `mod_rewrite` és `mod_setenvif`; töltsd fel a `server/public/.htaccess` fájlt is. A `server/config.php` `api.base_path` értéke legyen `/ballistic-front/api`, az engedélyezett origin tartalmazza a `https://delawer.hu` értéket. Éles API-t kizárólag HTTPS-en szolgálj ki.

### 3. Frontend build

A frontend API URL-je buildidőben kerül a JS bundle-be. Alapértelmezett, azonos domainen futó API esetén elég:

```powershell
pnpm.cmd build
```

Az éles API-alap URL a `.env.production` fájlban `/ballistic-front/api` értékre van állítva, így az alap build parancs megfelelő:

```powershell
pnpm.cmd build
```

Ezzel a böngésző a `https://delawer.hu/ballistic-front/api` címet éri el. Eltérő API-domain esetén build előtt felülírhatod a `VITE_MULTIPLAYER_API_URL` változót.

Töltsd fel a `dist/` teljes tartalmát a `public_html/ballistic-front/` könyvtárba. Az API ugyanazon az originen van, ezért a CORS allowlistben a `https://delawer.hu` origin szerepeljen (útvonal nélkül).

### 4. Feltöltési lista

Az API szerverre a következők kerüljenek:

- a `server/public/` tartalma az API publikus útvonalára;
- a `server/src/` tartalma a `ballistic-front/src/` alá, a tiltó `.htaccess` fájllal együtt;
- a saját `server/config.php` a frontend webroot védett gyökerébe vagy azon kívülre;
- az adatbázisba importált séma.

A `server/README.md`, `server/config.example.php` és `server/schema.sql` nem szükséges a webrootban. A saját `config.php` ne kerüljön a verziókezelt frontend bundle-be.

### 5. Telepítés utáni próba

Jelenleg nincs külön health végpont. A smoke testhez hozz létre egy szobát az Online játék felületen, majd egy második böngészőprofilból csatlakozz a kóddal. Ellenőrizd, hogy mindkét oldalon megjelennek a játékosnevek és a csatlakozott státusz.

## Hibaelhárítás

- `404 Endpoint not found` – ellenőrizd, hogy a kérések útvonala az API-alap URL-hez képest `/rooms` vagy `/rooms/{code}`; Apache alatt az átírási szabályok is legyenek aktívak.
- `500 Internal server error` – ellenőrizd a PHP szerver logját, a `server/config.php` adatbázis-beállításait, a jogosultságokat és hogy a `pdo_mysql` aktív-e.
- `401` – a szobához tartozó Bearer token hiányzik vagy hibás. A másik játékos tokenje nem használható.
- `404 Room not found` – ellenőrizd a kódot; a szoba lehet, hogy lejárt.
- `409 Room is no longer waiting` – a szobához már csatlakozott második játékos, vagy a szoba már játékállapotban van.
- `409 Room revision conflict` – kérd le újra az állapotot, és ne küldd el vakon még egyszer a korábbi eseményt.
- `API path does not match the configured base path` – a `server/config.php` `api.base_path` értéke egyezzen a telepítési URL prefixével.
- Böngészős CORS hiba – a frontend originje pontosan szerepeljen a `server/config.php` `api.allowed_origins` listájában; az origin nem tartalmaz útvonalat.

## Biztonsági megjegyzések

- A szobatokent kezeld jelszóként; ne írd logba és ne oszd meg a szobakódon kívül.
- A tokeneket a MySQL csak SHA-256 hash formában tárolja.
- Ne commitolj DB-jelszót vagy éles konfigurációt.
- Éles környezetben HTTPS és szűk CORS allowlist szükséges.
- A jelenlegi API egyszerű lobby- és eseménytároló. Nyilvános versengő játékhoz szerveroldali szabályellenőrzés, rate limit és a kliensoldali események felülvizsgálata is szükséges.