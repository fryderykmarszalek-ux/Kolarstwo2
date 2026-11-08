# Kolarstwo 2

Nowa wersja strony do treningów kolarskich. Runda druga: **pięć propozycji aplikacji mobilnej** na danych przykładowych.

Strona: https://fryderykmarszalek-ux.github.io/Kolarstwo2/ — najlepiej na telefonie.

| # | Styl | W skrócie |
|---|------|-----------|
| 1 | [Świat](style/swiat/) | ilustrowany świat (niebo zmienia się z porą dnia), poziom, seria, wyzwanie tygodnia — klimat Zwifta |
| 2 | [Trener](style/trener/) | jasna aplikacja trenerska: gotowość, „jak nogi?", plan na jutro, karuzela tras — klimat JOIN |
| 3 | [Puls](style/puls/) | ciemna, natywna jak iOS: pierścienie tygodnia, trendy, nagrody — klimat Apple Fitness |
| 4 | [Feed](style/feed/) | oś czasu jazd z dużymi mapami i osiągnięciami, kalendarz miesiąca — klimat Stravy |
| 5 | [Ścieżka](style/sciezka/) | droga do celu jako ścieżka kamieni milowych, zadania, liga tygodni — klimat Duolingo |

Każdy styl ma ekrany Start · Jazdy (albo Kalendarz / Liga) · Postępy · Profil i szczegóły jazdy wysuwane od dołu.
Przełącznik stylów na górze (albo klawisze 1–5, `[` i `]`).

## Struktura

- `style/<nazwa>/` — `index.html`, `style.css`, `app.js` każdego stylu
- `wspolne/apka.js`, `apka.css` — silnik aplikacji: zakładki, arkusz od dołu, grywalizacja z danych, szczegóły jazdy
- `wspolne/dane.js` — dane przykładowe (segmenty i rekordy ze starej strony)
- `wspolne/wykresy.js` — wykresy, mapa, polska typografia
- `wspolne/przelacznik.js` — przełącznik stylów
- `docs/burza-mozgow-2.md` — runda druga: research i wybór kierunków (`burza-mozgow.md` to runda pierwsza)

Ikony: Phosphor. Bez kroku budowania — czysty HTML, CSS i JavaScript.
