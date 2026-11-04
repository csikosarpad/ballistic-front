# Fejlesztői dokumentáció

Technikai működés, fejlesztési tervek és projektelőzmények. Játékosoknak:
[játékosútmutató](../user/guide.md). Projektbelépő: [gyökér README](../../README.md).

| Dokumentum | Szerep |
| --- | --- |
| [Getting started](./getting-started.md) | Környezet, parancsok, forrásstruktúra, fordítások, skinek és assetforrások |
| [Fejlesztői kontextus](./dev-notes.md) | Jelenlegi architektúra és bővítési korlátok |
| [Roadmap](./roadmap.md) | Központi fejlesztési státuszok, milestone-ok és nyitott döntések |
| [Gameplay és fejlődés](./gameplay-progression.md) | Döntés-előkészítő rangsor és javasolt MVP, nem elfogadott implementációs specifikáció |
| [Játék redesign](./game-redesign.md) | Vizuális/UX részletek, referenciák, mobil és asset-hatókör |
| [Hang-redesign](./sound-redesign.md) | Hangarchitektúra és részletes hangfejlesztési feladatok |
| [ResultScreen UI rendszer](./result-screen-ui-system.md) | Megvalósított prezentációs szerződés és korlátok |
| [Fejlődési napló](./history.md) | Dátumozott történet, nem aktuális backlog |
| [Backend README](../../server/README.md) | A backend mellett tartott API-, indítási és telepítési referencia |

## Archív vizuális iterációk

- [ResultScreen redesign](./archive/result-screen-redesign.md)
- [Neon ResultScreen polish](./archive/result-screen-neon-polish.md)

Az `archive/` lezárt ellenőrzőlistákat tartalmaz, nem aktív feladatokat.
A történeti teszteredmények nem helyettesítik az aktuális validációt.

## Hová kerüljön új dokumentum?

- `docs/user/`: jelenleg elérhető funkciók, vezérlés és játékosi segítség, implementációs részletek nélkül.
- `docs/developer/`: technikai leírás, design, nyitott döntés és fejlesztési terv.
- `docs/developer/archive/`: lezárt iteráció dokumentuma; az aktív státusz a roadmapben marad.

A részletes tervek nem jelentenek automatikus termékjóváhagyást.
Új dokumentum kapjon hivatkozást a megfelelő belépési pontból; ne készüljön új,
párhuzamos központi backlog. A forráskódra és más dokumentumokra relatív linkek mutassanak.
