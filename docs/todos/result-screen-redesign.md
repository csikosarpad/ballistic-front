# Eredményképernyő újratervezése

- [x] A referencia szerinti eredménykártya és győztes fejléc kialakítása.
- [x] A meccsstatisztika külön, négyoszlopos táblázatba rendezése.
- [x] A játékosok fejlesztéseinek kétoszlopos, egymás melletti elrendezése.
- [x] A fejlesztési sorok három részre bontása: név, szint/költség, leírás.
- [x] A keskeny képernyős nézet támogatása egymás alá tördeléssel.
- [x] A referencia szerinti neon sci-fi vizuális stílus és fejlesztési sávok kialakítása.
- [x] A meglévő offline/online vásárlási és visszavágó-viselkedés megőrzése.
- [x] Tesztek és production build futtatása.

## Hosszú távú, egységfüggetlen irány

- [ ] A player panel ne tank-specifikus, hanem általános `UnitPanel` komponens legyen.
- [ ] Az egységkép, az ikonok, a statnevek és az accent színek theme-adatból érkezzenek.
- [ ] A tank és az űrharcos külön `UnitPresentation` konfigurációt használjon azonos UI-hierarchiával.
- [ ] Az upgrade-ek üzleti azonosítói váljanak külön a megjelenített nevektől és ikonoktól.
- [ ] A result képernyő layoutja maradjon platform- és egységfüggetlen, csak a presentation theme változzon.
