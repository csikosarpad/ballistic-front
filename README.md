# Solvyr Prime: Siege Protocol

A Solvyr Prime univerzumban játszódó böngészős, körökre osztott taktikai tüzérségi játék:
szeles ballisztika, rombolható terep, mozgó tankok, XP és meccsek közötti fejlesztések.

Játszható két játékos hot-seat módban, offline AI ellen és online szobakódos lobbyval.
A felület magyarul, angolul és németül érhető el.

## Játékosoknak

[Játékosútmutató](./docs/user/guide.md): játékmódok, vezérlés, védelem,
célzástámogatás, fejlődés, online játék, beállítások és helyi mentés.

## Fejlesztőknek

- [Fejlesztői dokumentáció](./docs/developer/README.md) – teljes dokumentumjegyzék.
- [Indítás és technikai referencia](./docs/developer/getting-started.md) – környezet és parancsok.
- [Architektúra](./docs/developer/dev-notes.md) – játékmag és multiplayer.
- [Roadmap](./docs/developer/roadmap.md) – státuszok és nyitott fejlesztések.

## Gyors helyi indítás

Node.js 24 és pnpm szükséges. A repository gyökerében:

```powershell
pnpm.cmd install
pnpm.cmd dev
```

Online játékhoz a PHP/MySQL backend is szükséges; helyi indítás és telepítés:
[backend README](./server/README.md).

A `docs/user/` a jelenlegi játék használatát, a `docs/developer/` az implementációt és
fejlesztési terveket tartalmazza. A lezárt vizuális iterációk a fejlesztői `archive/`
almappában vannak; a gyökér README csak belépési pont, nem párhuzamos backlog.
