# Solvyr Prime: Siege Protocol – játékosútmutató

A jelenleg elérhető funkciók leírása. Fejlesztési tervek és technikai részletek:
[fejlesztői dokumentáció](../developer/README.md).

## Játékmódok

- **Hot-seat:** két ember egy eszközön, felváltva vezérli a két tankot.
- **Offline AI:** a Beállításokban a „Gép (AI)” ellenfél választható; P1 az ember, P2 a gép.
  Az ellenfélválasztás a következő meccstől érvényes.
- **Online:** két ember külön böngészőből, szobakódos lobbyval.

Jelenleg egy seed alapján változó, tükrözött terepcsalád és egy tanktípus van.
Szektorválasztás, orbitális képességek, prestige és kampány még nincsenek.

## A csata menete

A játék körökre osztott. A soron lévő játékos mozoghat a körönkénti mozgáskeretéből,
beállíthatja a löveg szögét és erejét, majd tüzelhet. A szél minden körben változik
és eltéríti a lövedéket. A lövés lezárása után a következő élő játékos jön.

A terep rombolható; egy robbanás a későbbi mozgást és lövési lehetőségeket is módosítja.
A játék a győztest, a lövéseket, az okozott sebzést és a meccsen szerzett XP-t
az eredményképernyőn összesíti.

### Billentyűzet és egér

| Vezérlő | Művelet |
| --- | --- |
| Bal / jobb nyíl | Mozgás |
| Fel / le nyíl | Lövési erő ±10; Shift mellett ±50 |
| Ctrl + bal / jobb nyíl | Szög ±1°; Shift mellett ±5° |
| Szóköz | Tűz |
| T | Célzástámogatás / röppálya-előnézet |
| M | Globális némítás |
| HUD gombok és csúszkák | Mozgás, célzás, tüzelés és hang |

A 0° jobbra, a 180° balra mutat, ezért a Ctrl + bal nyíl növeli a szöget.
A lövés alatt, az ellenfél körében és meccsvégén a harci vezérlés zárolt.

### Érintésvezérlés

- A HUD ±1° / ±10 erő gombjai és a mozgásgombok nyomva tartva ismételnek.
- A soron lévő tank közeléből indított húzás iránya a szöget, hossza az erőt állítja.
- Alacsony, fekvő kijelzőn a vezérlők oldalra rendeződnek.
- Indításkor támogatott érintőböngészőben teljes képernyőt és fekvő tájolást kér a játék.
  Ha ezt a böngésző nem támogatja vagy elutasítja, a bezárható tájolási tipp marad.

A fekvő használat ajánlott. Valós iOS Safari / Android Chrome eszközös ellenőrzés
még hátravan; az emulált mobilnézet nem garantál minden telefonon azonos működést.

## Védelem és célzástámogatás

A sebzés sorrendben az **erőtér pajzsot → páncélt → HP-t** csökkenti.
A pajzs a saját kör kezdetén a maximum 20%-ával töltődik vissza, kivéve ha a tankot
a legutóbbi köre kezdete óta találat érte. A páncél nem regenerálódik.
Pajzs és páncél alapból nincs; a boltban fejleszthetők.

A HUD gyűrűmérőket, a tank fölötti kijelzés vékony állapotsávokat használ.
Pajzs és páncél kijelzése csak akkor látszik, ha az egység rendelkezik velük.

A Célzástámogatás alapból játékosonként **1 töltet meccsenként**.
A fejlesztés szintenként +1-et ad, maximum 4 töltetig. Egy aktiválás az aktuális
kör végéig mutatja a várható röppályát; a töltetek új meccsben visszaállnak.

## XP, bolt és rendfokozat

- Az ellenfél pajzsának, páncéljának és HP-jának okozott sebzésért XP jár.
- A győzelem további **50 XP-t** ad.
- XP-ből meccs után páncél, pajzs, sebzés, robbanási sugár, lőtávolság, motor és
  célzástámogatás fejleszthető.
- A hét fejlesztés összesen 31 szintje nulláról **3768 XP-be** kerül.
- A fejlesztések együtt érvényesülnek, nincs egymást kizáró specializáció.
- A bolt XP-je **elkölthető egyenleg**, vásárláskor csökken. Az összes megszerzett
  XP-re utaló felirat jelenleg félrevezető; életút-XP összesítő nincs.
- A maximális fejlesztések után az XP tovább nő, de nincs újabb vásárlási lehetőség.

Hot-seat módban mindkét profil fejleszthető. AI-meccsen csak P1 vásárolhat kézzel:
a gép a csata statisztikái alapján maga költi el XP-jét. Online csak a saját profil
módosítható, a vásárlás a meccsvége szinkronizálásáig zárolt.

A HUD rendfokozata 0–5 csillag: embernél a megvásárolt fejlesztések arányát,
AI-nál a meccsekből gyűjtött tapasztalatot jelzi, nem külön XP-szintet.

## Online játék

1. A főmenüben válaszd az **Online játék** lehetőséget.
2. Az egyik játékos hozzon létre szobát a nevével.
3. A másik játékos a szobakóddal csatlakozzon.
4. A host indítsa el a meccset; mindenki csak a saját körében vezérelhet.
5. Meccs után mindenki a saját profilját fejlesztheti, a visszavágót a host indítja.

Mindkét játékosnak azonos játékbuildet kell használnia. Oldalfrissítés után a
böngészőfülben tárolt sessionből a szoba és az eseménynapló visszatölthető, amíg a
session és a szoba érvényes. Ez nem fiókalapú, eszközök közötti felhőmentés.

## Beállítások, hang és mentés

- **Nyelv:** magyar, angol és német. Mentett választás hiányában magyar vagy német
  böngészőnyelv esetén az adott nyelv, egyébként angol indul.
- **Játékosnevek:** P1/P2 neve legfeljebb 16 karakter. Üres névnél az azonosító marad;
  online a lobbyban megadott név az elsődleges.
- **Hang:** Zene, Parancsnok és Effektek külön kapcsolhatók; az M némítás mindet felülírja.
  A háttérzene energysound „Cyberpunk Neon City”; zeneválasztó és hangerőcsúszkák még nincsenek.
- **Parancsnoki konzol:** időbélyeges taktikai közlések és böngészős felolvasás.
  A hangok a böngészőtől/operációs rendszertől függnek; P2 magasabban és gyorsabban szól.
  Győzelemkor szintetizált fanfár és győzelmi bemondás hallható.
- **AI:** a tapasztalata külön törölhető a Beállításokban; normál célzása hibázhat,
  Smart Aim használatakor pontos találó lövést is kereshet.
- **Mentés törlése:** megerősítés után a profilok XP-je és fejlesztései törlődnek.
  Ez nem azonos az AI-tapasztalat külön törlésével.

A profilok és beállítások a böngésző helyi tárolójában maradnak meg.
Nincs fiókalapú szinkron; tárolótörlés vagy másik böngésző/eszköz eltérő állapotot jelenthet.
A böngésző korlátozhatja a hang automatikus indítását: támogatott felhasználói gesztus
után indulhat a lejátszás.
