# Kolarstwo 2

Nowa wersja strony do analizy treningów kolarskich. Na razie: **pięć propozycji wyglądu** na danych przykładowych.

Strona: https://fryderykmarszalek-ux.github.io/Kolarstwo2/

| # | Styl | W skrócie |
|---|------|-----------|
| 1 | [Telemetria](style/telemetria/) | ciemny, techniczny — ekran wozu technicznego, zsynchronizowany kursor mapa ↔ wykresy |
| 2 | [Raster](style/raster/) | szwajcarski plakat — biel, czerń, czerwień, siatka 12 kolumn (klawisz G) |
| 3 | [Almanach](style/almanach/) | magazyn kolarski — tekst pisany z danych, small multiples, przypisy |
| 4 | [Topo](style/topo/) | mapa topograficzna nocą — mapa sezonu z cieniowaniem rzeźby, „krajobraz formy" |
| 5 | [Sezon](style/sezon/) | zin z risografu — fluo róż, niebieski, żółty, karta zawodnika |

Przełącznik na dole każdej strony (albo klawisze 1–5, `[` i `]`).

## Struktura

- `index.html` — przekierowuje do ostatnio oglądanego stylu
- `style/<nazwa>/` — każdy styl: `index.html`, `style.css`, `app.js`
- `wspolne/dane.js` — dane przykładowe (stałe ziarno; segmenty i rekordy ze starej strony)
- `wspolne/wykresy.js` — wspólne wykresy, mapa, poziomice, polska typografia
- `wspolne/przelacznik.js` — przełącznik stylów
- `docs/burza-mozgow.md` — research, 13 szkiców i wybór pięciu kierunków

Bez bibliotek i bez kroku budowania — czysty HTML, CSS i JavaScript.
