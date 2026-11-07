# Kolarstwo 2 — burza mózgów nad wyglądem

Listopad 2026. Cel: strona do analizy treningów, która wygląda jak profesjonalna
aplikacja treningowa — taka, przy której zawodowiec z World Touru powie „kurde, ale
to fajnie wygląda". Strona jest dla jednej osoby, więc może mieć charakter. Ma bawić.

---

## 1. Research — co robią najlepsi i czego się wystrzegać

**Aplikacje treningowe**
- **TrainingPeaks** — najlepsze analizy (PMC, CTL/ATL/TSB), ale interfejs wygląda jak
  „zaprojektowany na desktop w 2012". Lekcja: sama treść nie wystarczy.
- **intervals.icu** — więcej analiz za darmo i lepsze wizualizacje niż TP, ale surowy,
  przeładowany. Lekcja: gęstość danych potrzebuje hierarchii.
- **WHOOP** — trzy liczby na start, potem trendy, potem surowe dane (trzy poziomy, każdy
  na osobnym ekranie). Prawie czarne tło, żeby kolor danych świecił. Kolor ma znaczenie
  (zielony = gotowość, czerwony = ryzyko), nigdy nie jest ozdobą.
- **Oura (redesign 2025)** — odejście od kart na rzecz bardziej otwartego układu,
  semantyczny język kolorów, system wizualizacji, który się skaluje.
- **Strava** — motywacja i społeczność, nie analityka. Ich „Year in Sport" (Manual,
  Hello Monday) pokazuje, że dane mogą być rozrywką: kinetyczna typografia, kolor, ruch.
- **Hammerhead / Wahoo / Garmin (liczniki)** — czytelność na pierwszy rzut oka:
  duże wartości, małe i przygaszone etykiety. Użytkownicy narzekają, gdy etykiety
  konkurują z liczbami.

**Poza kolarstwem**
- **Grafika TV z Formuły 1 i Tour de France** — telemetria na żywo, wieża czasów,
  prędkość i nachylenie w czasie rzeczywistym, małe nakładki, które nie zasłaniają obrazu.
- **Linear / Raycast / Arc** — „premium" bierze się z powściągliwości: jeden akcent,
  głębia z kroków jasności tła (nie z cieni), cienkie linie, ciasna typografia nagłówków.
- **Rapha / magazyn Mondial** — kolarstwo jako kultura: własne kroje, styl edytorski,
  „żadnych swooshy i szalonej grafiki".
- **Tufte** — sparklines („wykresy wielkości słowa") wplecione w tekst, small multiples,
  maksimum danych na minimum tuszu.
- **Styl szwajcarski** — siatka modułowa, grotesk, dużo bieli, jeden mocny akcent;
  hierarchia z rozmiaru i położenia, nie z ozdobników.

**Po czym poznać, że „zrobiło to AI" — lista rzeczy zakazanych**
- fioletowo-niebieskie gradienty i cyjan na granacie,
- Inter wszędzie, bo był domyślny,
- trzy zaokrąglone karty z miękkim cieniem i cienkimi ikonkami,
- glassmorphism, poświaty, gradientowy tekst,
- sprężynujące animacje,
- ogólnikowe teksty („Track smarter. Ride faster."),
- byle jakie dane przykładowe („Lorem", okrągłe liczby, „Jan Kowalski").

Wniosek: każda decyzja (krój, paleta, siatka, ton) ma być podjęta świadomie i
uzasadniona treścią — kolarstwem, okolicą (Konstancin, Gassy, Obory, wał wiślany),
sposobem trenowania (szosa bez miernika mocy + Zwift z mocą).

Źródła: garagegymreviews.com, roadmancycling.com, 925studios.co (WHOOP breakdown,
AI-slop tells), instrument.com (Oura), whoop.com, the5krunner.com, bikeradar.com,
itsnicethat.com (Rapha), edwardtufte.com, smt.com (TdF), saasui.design, superdesign.dev.

---

## 2. Kryteria oceny szkiców

1. **Pro** — czy wygląda jak narzędzie, któremu ufa zawodowiec?
2. **Inność** — czy jest wyraźnie inny od pozostałych czterech?
3. **Frajda** — czy chce się tam wracać?
4. **Uczciwość danych** — czy da się go zrobić bez mocy na szosie (moc tylko ze Zwifta)
   i bez zdjęć?
5. **Telefon** — czy przeżyje 375 px szerokości?
6. **Ryzyko „AI-looku"** — czy łatwo go zepsuć w generyczną papkę?

---

## 3. Szkice (13)

**A. Telemetria** — ekran wozu technicznego / transmisja TV / licznik rowerowy.
Prawie czarne tło, jeden sygnałowy żółty, wąskie cyfry, mono-etykiety, panele
oddzielone włosowymi liniami. Hit: zsynchronizowany kursor — najeżdżasz na profil
trasy, a punkt jedzie po mapie, tętno i prędkość pokazują tę samą chwilę.
Wieża czasów z F1 dla segmentów.
*Pro 5 · Inność 4 · Frajda 5 · Ryzyko: łatwo przesadzić z neonem.* → **TAK**

**B. Almanach** — magazyn kolarski / dziennikarstwo danych. Kremowy papier, czarny
tusz, różowy marker. Szeryfowe tytuły, tekst generowany z danych z wplecionymi
sparklines („w październiku 612 km — najwięcej od lipca"), small multiples miesięcy,
przypisy jako uczciwość („¹ moc tylko z trenażera").
*Pro 4 · Inność 5 · Frajda 4 · Ryzyko: może wyglądać jak blog, a nie aplikacja.* → **TAK**,
pod warunkiem że ma prawdziwą nawigację i interakcje.

**C. Raster** — szwajcarski plakat + raport laboratoryjny. Biel, czerń, jeden
czerwony. Ogromne cyfry, sztywna siatka 12 kolumn, zero cieni i zaokrągleń.
Smaczek: klawisz G pokazuje siatkę, na której wszystko stoi.
*Pro 5 · Inność 4 · Frajda 3 · Ryzyko: chłód.* → **TAK**, z humorem w detalach.

**D. Topo** — mapa topograficzna nocą. Ciemna zieleń, poziomice wygenerowane z
modelu terenu, wszystkie Twoje trasy nałożone na siebie (im częściej jeździsz drogą,
tym mocniej świeci). Ramka mapy ze współrzędnymi, podziałką, różą wiatrów. Metafora:
„forma to teren" — wykres formy jako profil wysokości.
*Pro 4 · Inność 5 · Frajda 5 · Ryzyko: mapa bez prawdziwych podkładów musi być
przekonująca.* → **TAK**

**E. Sezon (riso)** — zin wydrukowany na risografie. Fluorescencyjny róż, niebieski,
żółty na papierze; nadruki na siebie (multiply), lekkie przesunięcie warstw, ziarno.
Gigantyczne liczby, zabawne porównania („to jak z Konstancina do Lizbony"), karta
zawodnika jak z naklejek. Heatmapa jako raster punktów.
*Pro 3–4 · Inność 5 · Frajda 5 · Ryzyko: kicz, jeśli zabraknie dyscypliny.* → **TAK**,
z rygorem siatki pod spodem.

**F. Studio** — miękka aplikacja premium w stylu Oura/WHOOP light. Zaokrąglone karty,
cienie, pierścienie. *Odrzucone:* to dokładnie ta estetyka, którą każde AI robi
domyślnie. Dobre elementy (trzy liczby na start, progresywne odsłanianie) trafiają do
Telemetrii.

**G. Terminal** — Bloomberg dla watów: bursztyn na czerni, skróty klawiszowe,
tabele. *Odrzucone:* zabawne przez 5 minut, męczące na co dzień. Gęstość i skróty
klawiszowe → Telemetria.

**H. Retro lat 70.** — kremowe tło, pomarańczowo-brązowe pasy, zaokrąglone
slaby. *Odrzucone:* pastisz; trudno o „pro". Ciepło papieru → Almanach.

**I. Szkło / aurora** — glassmorphism, rozmyte gradienty. *Odrzucone:* podręcznikowy
znak AI.

**J. Brutalizm / zin czarno-biały** — surowy mono, ASCII. *Odrzucone jako całość:*
wygląda amatorsko. Surowość → Raster, zabawa drukiem → Sezon.

**K. Karta zawodnika (Panini/FIFA)** — cała strona jako kolekcja kart.
*Odrzucone jako styl, przyjęte jako element* Sezonu.

**L. Plakat danych / generatywna sztuka** — każda jazda jako linia na plakacie.
*Odrzucone jako aplikacja* (mało użyteczne), *przyjęte jako motyw* „mapy sezonu" w Topo.

**M. Kokpit Karoo** — strona jako ekran licznika z polami danych. *Połączone z A* —
pola danych w Telemetrii działają dokładnie tak.

---

## 4. Dyskusja

- **Czy dwa ciemne style to nie za dużo?** Telemetria i Topo są ciemne, ale robią
  co innego: Telemetria to czerń + żółty + technika, Topo to głęboka zieleń + pomarańcz
  + natura. Zostają oba — ciemny motyw to dziś standard aplikacji treningowych, warto
  mieć dwa jego warianty.
- **Almanach vs Raster — oba jasne i typograficzne.** Różnią się temperaturą:
  Almanach jest ciepły, szeryfowy, opowiada; Raster jest zimny, groteskowy, mierzy.
  Zostają oba, bo to dwa różne charaktery: „czytam o sobie" vs „analizuję".
- **Studio odpada**, mimo że byłoby bezpieczne. Bezpieczne = nijakie = AI.
- **Sezon** to najbardziej ryzykowny wybór. Zostaje, bo strona ma bawić, a żaden inny
  szkic nie daje tyle radości. Warunek: pod kolorem musi być ta sama dyscyplina siatki
  i danych co w Rastrze.
- **Wspólny mianownik wszystkich pięciu:** te same (przykładowe) dane, te same
  funkcje — forma, objętość, ostatnia jazda, kalendarz, segmenty, moc ze Zwifta,
  strefy tętna, rekordy, cel roczny. Porównujesz wygląd, nie zawartość.

---

## 5. Wybrane kierunki — specyfikacje

### 1 · Telemetria
- **Klimat:** ekran wozu technicznego, grafika TV z Touru, licznik na kierownicy.
- **Kolory:** tło `#090A0C`, panele `#0F1114`, linie `#1F2328`, tekst `#E9EBEE` /
  `#9BA1AA` / `#5F656E`, akcent sygnałowy żółty `#FFD60A`, Zwift `#5B8CFF`.
- **Kroje:** Archivo (oś szerokości — wąskie cyfry na odczytach) + JetBrains Mono
  (etykiety).
- **Siatka:** 12 kolumn, panele stykające się przez włosową linię (jak multi-view
  w reżyserce), promień 2 px, zero cieni.
- **Podpis:** zsynchronizowany kursor telemetrii; wieża czasów segmentów; pasek
  z rekordami przewijany jak w TV.

### 2 · Raster
- **Klimat:** szwajcarski plakat + raport z laboratorium wydolności.
- **Kolory:** biel `#FFFFFF`, czerń `#111111`, szarości, czerwień `#E3000F`.
- **Krój:** Helvetica Neue (systemowa na Macu i iPhonie), Host Grotesk jako zapas.
- **Siatka:** 12 kolumn widoczna jako logika, sekcje numerowane 01–08, wyrównanie do
  lewej, ogromne cyfry.
- **Podpis:** klawisz G pokazuje siatkę; czerwona linia celu rocznego przez całą
  szerokość strony.

### 3 · Almanach
- **Klimat:** magazyn kolarski / dziennikarstwo danych.
- **Kolory:** papier `#F4EFE6`, tusz `#1D1B18`, różowy marker `#F2A7BD` / `#D9487A`.
- **Kroje:** Newsreader (tytuły, tekst) + Schibsted Grotesk (liczby, podpisy, interfejs).
- **Siatka:** kolumny tekstu z pionowymi liniami, winieta, lead, small multiples.
- **Podpis:** tekst pisany z danych ze sparklines w zdaniach; przypisy; adnotacje
  na wykresach z liniami odniesienia.

### 4 · Topo
- **Klimat:** mapa topograficzna nocą, notatnik terenowy.
- **Kolory:** tło `#0C1512`, powierzchnie `#111D19`, poziomice `#1E2E28`, tekst kostny
  `#E7E2D3`, trasa `#FF7A3D`, wysokość piaskowa `#CDB27C`, woda `#5E9CB8`.
- **Kroje:** Fira Sans + Fira Sans Condensed — humanistyczny, kartograficzny;
  kursywa dla wody, rozstrzelone wersaliki dla miejscowości.
- **Siatka:** mapa na pełną szerokość jako bohater; reszta jak legenda mapy.
- **Podpis:** mapa wszystkich jazd z poziomicami; „krajobraz formy".

### 5 · Sezon
- **Klimat:** zin z risografu, plakat sportowy, naklejki.
- **Kolory (farby riso):** papier `#F3EEE4`, róż `#FF48B0`, niebieski `#3255A4`,
  żółty `#FFE800`, zielony `#00A95C`, czerń `#1C1C1C`.
- **Kroje:** Bricolage Grotesque (od wąskiego, ciężkiego display po tekst) + Martian
  Mono (etykiety).
- **Siatka:** nieregularne bloki na sztywnej siatce, każdy blok w jednej farbie.
- **Podpis:** nadruk multiply z przesunięciem warstw, heatmapa z punktów rastra,
  karta zawodnika, zabawne porównania.

---

## 6. Zasady wspólne

- Wszystkie liczby są **przykładowe** (generowane z ziarnem, więc stałe między
  odświeżeniami) i tak oznaczone w przełączniku.
- Moc pokazujemy **tylko ze Zwifta** — tak jak na starej stronie.
- Wykresy: cienkie znaczniki (linia 2 px, słupek ≤ 24 px), włosowe osie, legenda
  przy ≥ 2 seriach, tooltip na najechanie, nigdy dwóch osi Y.
- Każdy styl działa na telefonie.
- Ruch tylko tam, gdzie coś znaczy; `prefers-reduced-motion` wyłącza animacje.
