# Kolarstwo 2 — runda trzecia: szeroko, jak narzędzie, ale z charakterem

## Wnioski z rundy drugiej

- **Kierunek dobry** — najbardziej podobały się *Świat* (ilustracja, ciepło, poziom i seria)
  i *Trener* (jasno, czysto, plan i gotowość na górze).
- **Forma zła** — to miał być *styl*, nie aplikacja w ramce telefonu. Strona ma być szeroka,
  na cały ekran komputera, bo dojdą funkcje i statystyki na poziomie TrainingPeaks.
- **Za dużo kopiowania** — trzeba własnych pomysłów, nie przebieranek za Zwifta i JOIN.
- **Bez wygłupów** — schludnie, ładnie, nic dziecinnego (żadnej „Ścieżki").

## Co musi umieć każdy styl (poziom TrainingPeaks)

| Widok | Co w nim jest |
|---|---|
| **Pulpit** | stan formy, plan na jutro, tydzień, cel roczny, ostatnia jazda — każdy styl składa go po swojemu |
| **Kalendarz** | miesiąc w tygodniach, jazdy i plan w dniach, podsumowanie tygodnia (km, godziny, obciążenie, forma) |
| **Analiza jazdy** | mapa + zsynchronizowane strumienie; **zaznaczenie fragmentu przeciągnięciem** pokazuje jego statystyki i podświetla go na mapie; odcinki, segmenty, strefy |
| **Jazdy** | tabela z sortowaniem, wyszukiwaniem i filtrami |
| **Postępy** | wykres formy (CTL/ATL/TSB) z wyborem zakresu, objętość, krzywa mocy, strefy, rekordy, segmenty |

## Na ile sposobów można to zrobić? (szkice)

1. **Panorama na górze** — ilustracja jak w *Świecie*, ale *moja*: mazowiecki krajobraz
   (skarpa, topole, Wisła), a linia horyzontu to profil wysokości Twojej ostatniej jazdy. → **Horyzont**
2. **Boczne menu + plan na środku** — *Trener* przeniesiony na komputer: gotowość i plan u góry,
   tydzień jak w kalendarzu treningowym, cele po prawej. → **Trener Pro**
3. **Mapa jako tło pracy** — połowa ekranu to jasna, przyjazna mapa wszystkich jazd; panel obok
   z przeglądem, jazdami i segmentami; wybór jazdy przybliża mapę. → **Atlas**
4. **Narzędzie analityczne** — jedna belka okresu dla całej strony, kafle z trendami, duży wykres
   formy, tabela jazd; najbliżej TrainingPeaks, ale czyściej. → **Pulpit**
5. **Sezon jak oś montażowa** — cały sezon w poziomie: tygodnie jako kolumny, ścieżki dla
   kilometrów, formy i wydarzeń; klik w tydzień otwiera jego dni pod spodem. → **Oś**
6. Widżety do przeciągania (każdy układa pulpit sam) — *odłożone*: dużo pracy, mało widać na pokazie.
7. Tryb ciemny jako osobny styl — *odłożone*: lepiej jako przełącznik w wybranym stylu.
8. Strona-gazeta — *odpada*: to była runda pierwsza.

## Zasady wyglądu

- Jasne tło, białe karty, dużo powietrza; jeden akcent kolorystyczny na styl.
- Kolor ma znaczenie: szosa i Zwift zawsze w tych samych barwach w obrębie stylu.
- Ilustracja tylko tam, gdzie coś mówi (horyzont z profilu jazdy, mapa z prawdziwych tras).
- Liczby duże, etykiety ciche; wykresy bez ozdobników; tooltip zamiast tabelki na wykresie.
- Szeroko: siatka 12 kolumn, max ~1600 px; na węższym ekranie karty układają się w kolumnę.

## Co powstało

Wspólna warstwa (`wspolne/web.js`) daje każdemu stylowi te same funkcje; style różnią się układem, pulpitem i charakterem.

| Styl | Pomysł | Czym się wyróżnia |
|---|---|---|
| **Horyzont** | *Świat* dorosły i szeroki | panorama z profilu ostatniej jazdy, niebo wg pory dnia, karty na łące, cele tygodnia i poziom bez dziecinady |
| **Trener Pro** | *Trener* na komputerze | boczne menu, gradientowa karta dnia, „Jak nogi?" zmienia propozycję, profil treningu w blokach stref |
| **Atlas** | mapa jako tło pracy | mapa cieplna z liczbą przejazdów każdej drogi, podgląd trasy po najechaniu, analiza na dużej mapie |
| **Pulpit** | najbliżej TrainingPeaks | globalny zakres dat, KPI z porównaniem, forma z adnotacjami rekordów, stan formy na skali stref |
| **Oś** | sezon jak oś montażowa | 53 tygodnie w poziomie, fazy wyliczone z formy, wybrany tydzień pod spodem, najmocniejsze tygodnie |

Analiza jazdy (wszędzie): strumienie wysokości, prędkości, tętna i kadencji z jedną osią X; najechanie pokazuje punkt
na mapie, przeciągnięcie zaznacza fragment i liczy jego dystans, czas, średnią, tętno, przewyższenie i strefy.
