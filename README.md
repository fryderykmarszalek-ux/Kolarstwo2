# Kolarstwo 2

Nowa wersja strony do treningów kolarskich. **Estetyka jest rdzeniem projektu.**
Wybrany styl: **Trener Pro** (z rundy 3). Treść to na razie placeholdery na danych przykładowych.

Strona: https://fryderykmarszalek-ux.github.io/Kolarstwo2/

Widoki: **Dzisiaj** (pulpit), **Kalendarz**, **Jazdy**, **Postępy** i **analiza jazdy** (`#analiza/<id>`).

## Struktura

- `index.html`, `style.css`, `app.js` — strona (Trener Pro)
- `wspolne/web.js`, `web.css` — widoki szerokiej strony (router, kalendarz, analiza, wykres formy, tabele); wygląd z tokenów `--s-*`
- `wspolne/apka.js` — liczone z danych: gotowość, propozycja treningu, wyzwania, pierścienie, ikony (`A.ik`)
- `wspolne/dane.js` — dane przykładowe (segmenty i rekordy ze starej strony)
- `wspolne/wykresy.js` — wykresy, mapa, polska typografia
- `wspolne/ikony/` — ikony Phosphor 2.1.1 (MIT), pełny zestaw, trzy grubości: `regular`, `bold`, `fill`
- `wspolne/czcionki/` — Plus Jakarta Sans (SIL OFL 1.1)
- `archiwum/` — rundy 1–3 propozycji, nietknięte (runda 3 ze swoim przełącznikiem stylów)
- `docs/burza-mozgow*.md` — notatki z trzech rund
- `style/trener/` — tylko przekierowanie ze starego adresu

Bez kroku budowania i **bez zewnętrznych serwerów**: wszystko, czego strona potrzebuje, leży w tym repo.
