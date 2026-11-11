# CLAUDE.md — Kolarstwo 2

Plik czytany automatycznie przy starcie każdej sesji w tym repo. Ma jedno zadanie:
żeby nowa sesja, na dowolnym urządzeniu, nie cofnęła decyzji, które już zapadły.

Stara strona to osobne repo `Kolarstwo` (https://fryderykmarszalek-ux.github.io/Kolarstwo/).
Jej `CLAUDE.md` §2 opisuje, jak pracować z Fryderykiem — czytać. Skrót: nie programuje
(każde pojęcie tłumaczyć), 16 lat i umysł matematyczny, **chce krytyki bez łagodzenia**,
po polsku i kolokwialnie, **jedno pytanie na raz**, pracuje na iPadzie i telefonie.

---

## 1. Co to jest i po co

Ta sama idea co stara strona — śledzenie treningów kolarskich dla jednej osoby — zrobiona
od nowa z wiedzą zdobytą przy tamtej, **zdecydowanie ładniej i estetyczniej.**

**ESTETYKA JEST RDZENIEM PROJEKTU** — decyzja Fryderyka z 11.11.2026, „moja decyzja, kropka”.
Nie podważać jej argumentem, że coś działa, choć brzydko wygląda.

## 2. Co jest zdecydowane — i co NIE

| Zdecydowane | Kiedy |
|---|---|
| Styl **Trener Pro** z rundy 3. Pozostałe style i przełącznik poszły do `archiwum/runda-3/` | 11.11.2026 |
| **Zero zewnętrznych serwerów** — ikony i czcionka leżą w repo (§3) | 11.11.2026 |

**Wszystko inne to placeholdery.** Układ kart, treść pulpitu, wykresy, teksty, plan,
wyzwania — Fryderyk zapowiedział, że całość „pewnie będzie wyglądała kompletnie inaczej”.
**Nie traktować obecnej zawartości jako wzorca ani decyzji.** Część danych może być
zmyślona i to jest dozwolone, dopóki strona stoi na danych przykładowych.

## 3. Ikony i czcionka — w repo, nie z cudzych serwerów

Do 11.11.2026 strona ciągnęła ikony z unpkg.com i czcionkę z Google Fonts. Gdyby któryś
serwer zniknął albo zmienił adres, menu straciłoby ikony, a krój spadłby na systemowy.

- `wspolne/ikony/{regular,bold,fill}/` — Phosphor **2.1.1**, te same pliki, które podawał
  unpkg (pobrane z rejestru npm, licencja MIT w `LICENSE`). **Pełny zestaw ~1500 ikon**,
  nie wycinek — dowolna nazwa z phosphoricons.com działa od razu. Wycinek byłby lżejszy,
  ale ikona spoza niego znikałaby po cichu.
- W `@font-face` zostało tylko `woff2` — przeglądarka i tak bierze pierwszy obsługiwany
  format, a woff/ttf/svg ważyłyby 7 MB na darmo.
- `wspolne/czcionki/` — Plus Jakarta Sans, cztery zakresy znaków jak w Google
  (`latin` i `latin-ext` dla polskich liter). Wersja **z instrukcjami hintingu** (tabela
  `prep`) — Google daje Safari wariant bez nich, ale kształty liter są identyczne bajt
  w bajt, a Safari hinting ignoruje. Jedna wersja = ten sam wygląd w obu przeglądarkach.

**Sprawdzone sondą** w Chromium: 13 stanów strony (5 widoków, 4 odpowiedzi „Jak nogi?”
— zmieniają ikonę z konturowej na wypełnioną — i 4 zakresy wykresu formy)
× 4 szerokości (1440, 1180, 820, 390 px) = 52 zrzuty, porównane piksel po pikselu
z wersją sprzed zmiany: **52 z 52 identycznych**, przy zablokowanym KAŻDYM zapytaniu
poza własny serwer. Ten sam wynik po usunięciu przełącznika (porównanie z wersją, z której
pasek przełącznika zdjęto w przeglądarce).

**Dokładając czcionkę albo bibliotekę: pobrać do repo, nie linkować.**

## 4. Pliki

```
index.html, style.css, app.js   strona (Trener Pro)
wspolne/                        widoki, wykresy, dane przykładowe, ikony, czcionki
archiwum/runda-{1,2,3}/         propozycje z rund, nietknięte (każda z własną kopią wspolne/)
docs/burza-mozgow*.md           notatki z rund
style/trener/index.html         przekierowanie ze starego adresu, zachowuje #widok
```

Archiwum rund ładuje ikony nadal z unpkg — to zapis historii, nie strona.

## 5. Otwarte, nierozstrzygnięte

- **Najechanie myszką (hover)** — część interakcji (podgląd punktu na mapie, dymki wykresów)
  zakłada mysz, a Fryderyk pracuje głównie dotykiem. W starej stronie zasada brzmiała
  „dotyk, nie hover”. Tu jeszcze nie zapadła decyzja.
- **Prawdziwe dane** — strona stoi na przykładowych. Podłączenie danych ze starej strony
  (`dane.js` jako `window.DANE`) to osobny krok.

## 6. Praca między urządzeniami — lekcja z 11.11.2026

Praca z sesji na Macu nie była nigdzie widoczna z iPada: sesja działała lokalnie, a jedyną
wspólną pamięcią jest GitHub. **Każdą zmianę kończyć wysłaniem na GitHuba**, a decyzje
dopisywać tutaj — inaczej żyją na jednym urządzeniu, tak jak koszulki w `localStorage`
na starej stronie.
