# Kolarstwo 2

Nowa wersja strony do treningów kolarskich. Runda trzecia: **pięć szerokich stron na cały ekran komputera**, z funkcjami na poziomie TrainingPeaks, na danych przykładowych.

Strona: https://fryderykmarszalek-ux.github.io/Kolarstwo2/ — najlepiej na komputerze.

| # | Styl | W skrócie |
|---|------|-----------|
| 1 | [Horyzont](style/horyzont/) | panorama Mazowsza, w której linia wzgórz to profil Twojej ostatniej jazdy; białe karty nachodzą na łąkę |
| 2 | [Trener Pro](style/trener/) | boczne menu, karta dnia z gotowością i pytaniem „Jak nogi?", plan z blokami treningu, cele w pierścieniach |
| 3 | [Atlas](style/atlas/) | pół ekranu to mapa wszystkich jazd (im ciemniejsza droga, tym częściej); panel obok, analiza na dużej mapie |
| 4 | [Pulpit](style/pulpit/) | narzędzie analityczne: jeden zakres dat steruje całą stroną, stan formy na skali stref, adnotacje rekordów |
| 5 | [Oś](style/os/) | cały sezon w poziomie: tydzień to kolumna; fazy formy, kilometry, forma, świeżość i wydarzenia na jednej osi |

Każdy styl ma te same funkcje: **pulpit** (po swojemu), **kalendarz** miesiąca z podsumowaniem tygodni i planem,
**jazdy** (tabela z sortowaniem, wyszukiwaniem i filtrem), **postępy** (forma CTL/ATL/TSB, objętość, cel roczny,
krzywa mocy, strefy, rekordy, segmenty) i **analizę jazdy** (mapa i strumienie zsynchronizowane, zaznaczanie
fragmentu przeciągnięciem, odcinki, segmenty, porównanie z poprzednimi jazdami).

Przełącznik stylów na górze (albo klawisze 1–5, `[` i `]`); otwarty widok przechodzi między stylami.
Poprzednie rundy: [archiwum](archiwum/).

## Struktura

- `style/<nazwa>/` — `index.html`, `style.css`, `app.js` każdego stylu
- `wspolne/web.js`, `web.css` — wspólne widoki szerokiej strony (router, kalendarz, analiza, wykres formy, tabele); wygląd z tokenów `--s-*`
- `wspolne/apka.js` — liczone z danych: gotowość, propozycja treningu, wyzwania, poziom, pierścienie, miniatury tras
- `wspolne/dane.js` — dane przykładowe (segmenty i rekordy ze starej strony)
- `wspolne/wykresy.js` — wykresy, mapa, polska typografia
- `wspolne/przelacznik.js` — przełącznik stylów
- `archiwum/` — runda 1 (pulpity) i runda 2 (aplikacje mobilne), nietknięte
- `docs/burza-mozgow-3.md` — runda trzecia: wnioski, szkice, zasady (`-2` i bez numeru to wcześniejsze rundy)

Ikony: Phosphor. Bez kroku budowania — czysty HTML, CSS i JavaScript.
