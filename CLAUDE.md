# CLAUDE.md — Kolarstwo 2

Plik czytany automatycznie przy starcie każdej sesji w tym repo. Ma jedno zadanie:
żeby nowa sesja, na dowolnym urządzeniu, nie cofnęła decyzji, które już zapadły.

Stara strona to osobne repo `Kolarstwo` (https://fryderykmarszalek-ux.github.io/Kolarstwo/).
Jej `CLAUDE.md` §2 opisuje, jak pracować z Fryderykiem — czytać. Skrót: nie programuje
(każde pojęcie tłumaczyć), 16 lat i umysł matematyczny, **chce krytyki bez łagodzenia**,
po polsku i kolokwialnie, **jedno pytanie na raz**, pracuje na iPadzie i telefonie.

**Na końcu KAŻDEJ wiadomości link do strony:** https://fryderykmarszalek-ux.github.io/Kolarstwo2/
(prośba Fryderyka z 11.11.2026).

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
| **Pole profilu „Athlete’s profile”** (lewy dolny róg) jest kluczowe, **widoczne zawsze** i otwiera okno na pierwszym planie (§5a) | 12.11.2026 |

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
wspolne/profil.js               profil zawodnika: jedno źródło imienia, zdjęcia, daty, pomiarów
wspolne/bmi.js                  przelicznik BMI 13–99 lat: tabela WHO 2007 + progi WHO dla dorosłych
archiwum/runda-{1,2,3}/         propozycje z rund, nietknięte (każda z własną kopią wspolne/)
docs/burza-mozgow*.md           notatki z rund
style/trener/index.html         przekierowanie ze starego adresu, zachowuje #widok
```

Archiwum rund ładuje ikony nadal z unpkg — to zapis historii, nie strona.

## 5. Urządzenia — sprawdzone 11.11.2026, zasady

Fryderyk pracuje na iPadzie i telefonie, więc strona ma działać **palcem i na każdej szerokości**.
Sonda w Chromium: 18 urządzeń (iPhone SE 1. i 3. gen, 15 Pro, 15 Pro Max, iPhone poziomo,
iPad Mini, iPad, iPad Pro 11 i 13 — pionowo i poziomo, MacBook 13″ i 14″, laptop 1440,
monitory 1920 i 2560) × 5 widoków. Po poprawkach: **0** przewijania w bok, **0** elementów
za krawędzią, **0** tekstu wylewającego się z pudełka, **0** błędów JS.

- **Wykresy palcem: `W.wskazuj()` w `wykresy.js`.** Do 11.11 żaden z 7 wykresów nie reagował
  na dotyk — dymek pokazywał się tylko po najechaniu myszką, a na dotyku „pointerleave”
  przychodzi zaraz po oderwaniu palca. Teraz: stuknięcie albo przesunięcie w poziomie
  pokazuje odczyt, odczyt zostaje po oderwaniu, stuknięcie obok go chowa. Przewijanie
  w pionie działa dalej (`touch-action: pan-y`). Analiza jazdy robi to samo ręcznie, bo ma
  zaznaczanie fragmentu. **Nowy wykres podpinać przez `W.wskazuj`, nie przez `pointermove`.**
  Myszką zachowanie bez zmian.
- **Pole trafienia na dotyku** (`@media (pointer: coarse)` na końcu `web.css`): niewidoczna
  warstwa `::before` poszerza przełączniki, przyciski i okruszki do ~44 px **bez zmiany
  wyglądu**. Myszką nic się nie zmienia (sprawdzone: 0 z 37 przycisków reaguje poza obrysem).
- **Pole tekstowe na telefonie ma 16 px** — przy mniejszej czcionce iPhone powiększa stronę.
- **Kafle liczb w wąskich kartach liczą się szerokością KARTY, nie ekranu** (container queries:
  `.s-cel-st`, `.s-wybor`, `.tp-cele`). Ta sama karta bywa wąska na dużym ekranie (przy
  bocznym menu) i szeroka na małym. Safari od iPadOS 16.
- **Telefon w kalendarzu**: komórka ma 34–55 px, więc jazda to kilometry, plan to strefa
  (`data-krotko` w `S.wpis`/`S.wpisPlan`). Nazwa jest po dotknięciu.
- **Wykres przebiegu na wąsko (< 480 px)**: nazwa pasa nad pasem, z lewej tylko skala — inaczej
  margines zabierał 40% szerokości.

Sonda pilnowała też sama siebie: dwa razy „błąd” był błędem testu (`elementFromPoint` poza
ekranem, płynne przewijanie), a porównanie ze starą wersją bez jej czcionki zawyżało różnice.
**Każdą nową kontrolę sprawdzać najpierw na znanym błędzie.**

## 4a. KAŻDE KLIKALNE POLE WIDAĆ, ŻE JEST KLIKALNE (12.11.2026, zasada Fryderyka)

„Najeżdżam kursorem i nic się nie dzieje — muszę się domyślić, że mogę kliknąć.” Fryderyk używa
iPada **z kursorem** (gładzik/mysz). Zasada dla każdego nowego elementu, który coś robi:

- **widoczna zmiana po najechaniu** (tło, kolor, cień, kreska) + `cursor: pointer`
  (pole tekstowe: `text`, wyłączony przycisk: `not-allowed`);
- **reguły najechania pod `@media (any-hover: hover)`, NIGDY pod `(hover: hover)`.**
  `hover` pyta o GŁÓWNE wejście — na iPadzie to dotyk, więc z kursorem był fałsz i nic nie
  reagowało. To był mój błąd z 11–12.11. `any-hover` = „jest jakikolwiek kursor”; sam dotyk
  dalej nie dostaje efektu, więc po stuknięciu nic się nie „przykleja”;
- na samym dotyku (bez kursora) wskazówka musi stać stale, jeśli bez niej nie widać, że coś się
  otwiera (np. strzałka › w polu profilu).

Kontrola `najechanie.js` (sesja 12.11): statycznie 0 reguł pod `(hover: hover)` w `style.css`
i `web.css`; myszą 11 elementów ramy i profilu zmienia wygląd i ma właściwy kursor; dotyk —
nic się nie przykleja. **Placeholderów jeszcze nie przeglądano** — Fryderyk: i tak wylecą.

## 5a. Pole profilu i okno „Athlete’s profile” (12.11.2026)

Fryderyk: pole w lewym dolnym rogu „jest kluczowe dla strony”, ma być **widoczne cały czas**,
nosić napis **Athlete’s profile** (po angielsku, jego wybór) i po dotknięciu otwierać okno
na środku, z × w prawym górnym rogu, na pierwszym planie, **ze stroną widoczną w tle**.
Treść okna (12.11.2026): **na górze okna awatar + imię i nazwisko + „Edit”** (zamiast
„FM · Athlete’s profile” — poprawka Fryderyka z tego samego dnia), pod spodem na razie pusto;
widok edycji opisany niżej. **Pole w lewym dolnym rogu: awatar, imię i nazwisko, pod nimi
„Athlete’s profile”**, a strzałka › pokazuje, że się otwiera.
**Pod nagłówkiem stoi lista sekcji (od 12.11.2026, niżej); nie dokładać sekcji z własnej inicjatywy —
każdą zamawia Fryderyk.** JOIN był tylko
wzorem „mniej więcej” — **żadnych grup ani obserwujących**, decyzja Fryderyka.

- **Dlaczego pole znikało:** pasek boczny miał `height: 100vh`, a w Safari na iPadzie „100vh”
  to wysokość ekranu BEZ paska adresu. Przy rozwiniętym pasku dół menu wypadał pod ekran.
  Teraz `100dvh` (to, co naprawdę widać). **Nie wracać do samego `100vh` na elementach
  przyklejonych do wysokości ekranu.**
- **Wąski ekran (≤ 1000 px, górne menu):** pole zostaje jako sam awatar po prawej stronie paska —
  „widoczne zawsze” dotyczy też telefonu i iPada pionowo. Żeby zmieścić awatar, zakładki są
  ciaśniej, a logo znika do 480 px (prowadzi tam, gdzie „Dzisiaj”). Sprawdzone co 1 px
  od 320 do 1000: wszystkie cztery zakładki i awatar mieszczą się bez przewijania.
- **Okno to natywny `<dialog>` + `showModal()`** (`#tp-profil`, kod w `app.js`): przeglądarka sama
  trzyma je na wierzchu, blokuje resztę strony, obsługuje Esc i oddaje fokus polu po zamknięciu.
  Zamyka: ×, Esc, dotknięcie przyciemnionego tła. Strona pod spodem nie przewija się i nie
  skacze (szerokość znikającego suwaka wraca jako margines).
- Efekt najechania tylko w `@media (hover: hover)` — na dotyku „hover” zostaje po stuknięciu
  i pole stało szare pod otwartym oknem.
- Sonda: 15 ekranów × (widoczność pola na starcie i po przewinięciu, napis, otwieranie
  dotykiem/myszą/Enterem, środek ekranu, ×, Esc, tło, brak skoku strony) = 449 kontroli, 0 błędów.
- **Pułapka sondy:** urządzenie Playwrighta „iPad (gen 11) landscape” ma 944×656 px, nie 1180×820.
  iPad Fryderyka ma 1180×820 (ok. 1180×700 przy rozwiniętym pasku Safari) — testować tym
  rozmiarem wprost. Wcześniejsze wpisy „iPad 1180” w §5 dotyczyły w praktyce 944 px;
  przegląd powtórzony 12.11 z prawdziwym rozmiarem: 21 urządzeń, 0 problemów.
- **Dynamicznego paska Safari nie da się odtworzyć w Chromium** — `100dvh` sprawdzone tylko
  jako dwa stałe rozmiary okna. Ostateczny test to iPad Fryderyka.

### Edycja profilu (12.11.2026)

- **„Edit”** — jasnoszara pigułka z własną kredką (kredka + kreska, którą „pisze”, inline SVG
  w `index.html`), **tuż za tytułem** „Athlete’s profile”. Prośba Fryderyka: własny rysunek, nie gotowa ikona.
  **Bez obwódek i owali** (12.11.2026): niebieski owal ze screena to była obwódka fokusu —
  `<dialog>` sam stawia fokus na pierwszym przycisku, a Safari z klawiaturą go rysuje. Teraz
  fokus po otwarciu i po powrocie z edycji stoi na samym oknie (`tabindex="-1"`, bez obrysu),
  a „Edit” z klawiatury dostaje ten sam odrobinę ciemniejszy szary co po najechaniu (`#E3E8EF`).
- Kliknięcie przełącza **TO SAMO okno** w widok edycji (`data-widok-okna="edycja"` na `<dialog>`),
  nie otwiera nowego. Nagłówek: ‹ wróć, „Edytuj profil”, ×.
- **Imię i nazwisko — osobne pola, limit 30 znaków każde** (`maxlength` + licznik „8/30”).
  Dozwolone: litery każdego alfabetu, a między nimi spacja, myślnik albo apostrof
  („Anna-Maria”, „O’Neill”). Puste i z cyframi — komunikat pod polem, nic się nie zapisuje.
  Pismo 16 px, żeby iPhone nie powiększał strony.
- **Płeć: Mężczyzna · Kobieta · Niezdefiniowana** — jeden pasek, wszystkie trzy ZAWSZE widoczne
  i na STAŁYCH miejscach, między nimi kropka. Wybrana: ciemna i powiększona (`scale(1.12)`),
  pozostałe jasne. Wszystkie mają tę samą grubość pisma, więc zmiana wyboru nie przesuwa
  niczego — sprawdzone co 1 px od 320 do 1180 dla każdego wyboru (0 przesunięć). Pismo płynne
  z szerokości okna, tak żeby powiększona opcja zostawiała ≥ 4,9 px do kropki.
  **Płeć ma już jedną rolę (12.11.2026): ocena BMI w wieku 13–18 lat** — WHO ma osobne siatki dla
  chłopców i dziewcząt. Dla dorosłych dalej nic nie zmienia. Reszta ról przyjdzie później
  (Fryderyk: przyda się, gdy stroną zacznie się posługiwać tata albo ktoś znajomy).
- **Jedno „Zapisz” na dole okna zapisuje wszystko naraz.** Wyłączone, póki nic się nie zmieniło.
  Anuluj, ‹, Esc — wracają do profilu bez zapisu. × zamyka okno. Stuknięcie w tło przy
  niezapisanych zmianach NIE zamyka (przypadkowe stuknięcie nie kasuje wpisanego).
- **Awatar w edycji zostaje** (taki jak w lewym dolnym rogu) — przyda się w następnym zadaniu.
  Inicjały w nim zmieniają się na żywo przy pisaniu; reszta strony dopiero po zapisie.
- **Jedno źródło: `wspolne/profil.js`** (ładowany przed `apka.js`). Każde miejsce z imieniem ma
  atrybut `data-profil="imie|nazwisko|pelne|inicjaly"` i po zapisie zmienia się samo, bez
  przeładowania: inicjały w lewym dolnym rogu, w nagłówku okna i w awatarze, imię i nazwisko
  w profilu, powitanie na pulpicie. **Nowe miejsce z imieniem = ten sam atrybut.**
- **Zapis: `localStorage` tej przeglądarki** (`k2.profil`). Okno mówi to wprost („Zapis w tej
  przeglądarce”), a gdy przeglądarka zapisu odmawia — na czerwono. Inne urządzenia widzą
  wartości domyślne z `dane.js`, dopóki nie będzie serwera. Druga karta tej samej przeglądarki
  przełącza się sama (zdarzenie `storage`).
- Sondy: edycja 140 kontroli na 5 urządzeniach (mysz i dotyk), **trzy celowo wstawione błędy
  złapane** (brak odświeżenia po zapisie, przesuwające się opcje płci, brak limitu znaków);
  okno 464 kontroli na 15 ekranach; przegląd 21 urządzeń bez problemów; dotyk na wykresach bez zmian.

### Zdjęcie profilowe (12.11.2026)

- **Kredka po prawej od awatara w edycji — SAMA KREDKA.** Słowa Fryderyka: „żadnych kształtów
  na niej, żadnej obwódki, nic. Sama jasnoszara kredka. Po najechaniu lekko ciemniejsza, ale
  tylko ona.” Własny rysunek (inline SVG, bez kreski pod spodem — ta jest tylko przy „Edit”),
  kolor `#AEB6C3`, po najechaniu `#7E8898`. **Zero tła, ramki, cienia i obrysu — w każdym
  stanie**, także po dotknięciu i z klawiatury (`:focus-visible` zmienia tylko kolor). Pole
  trafienia 40×40 jest niewidoczne. Ciemniejsza zostaje też, **póki okienko jest otwarte**
  (`aria-expanded="true"`) — na dotyku to jedyny znak, skąd się wzięło; po zamknięciu wraca.
- **Kredka otwiera okienko pod sobą** („Zdjęcie profilowe → Wybierz zdjęcie”). Jedna pozycja,
  bo iPhone i iPad i tak pokazują po stuknięciu własny wybór: **Zdjęcia, Pliki albo aparat**
  (`<input type="file" accept="image/*">`). Okienko nie wychodzi poza okno (przesuwa się
  w lewo na wąskim ekranie). Zamyka: wybór pliku, ponowne stuknięcie kredki, stuknięcie obok,
  Esc — **Esc najpierw zamyka samo okienko**, edycja zostaje.
- **Podgląd od razu, strona dopiero po „Zapisz”** — decyzja Fryderyka. Wybrane zdjęcie
  wskakuje do awatara w edycji; lewy dolny róg i nagłówek okna zmieniają się dopiero po
  „Zapisz”. Anuluj/‹/Esc porzucają zdjęcie tak samo jak wpisane imię.
- **„Usuń profilowe” po prawej od kredki, tylko gdy jest co usuwać.** Wraca do domyślnego,
  czyli inicjałów — też dopiero po „Zapisz”. Szary napis, po najechaniu czerwienieje.
- **Obróbka w przeglądarce, przed zapisem:** kwadrat wycięty ze ŚRODKA, zmniejszony do
  **1024×1024** (do 12.11 było 512 — za mało, odkąd zdjęcie da się powiększyć do 440 px na
  Retinie; zdjęcie zapisane wcześniej zostaje w 512, ostrzejsze będzie po ponownym wyborze;
  mniejszego niż 1024 nie powiększamy), JPEG 0,86 (przezroczysty PNG dostaje białe tło, nie czarne). Zdjęcie z aparatu
  4000×3000 (830 kB) przy 512 dawało **48 kB** — ale to był obraz sztuczny; prawdziwe
  zdjęcie przy 1024 wyjdzie rzędu 150–300 kB. Zapora: 1,1 MB (powyżej JPEG 0,7).
  `localStorage` mieści ok. 5 MB, więc zapas jest.
  HEIC z iPhone'a Safari czyta sam. Plik, który nie jest obrazem — komunikat pod awatarem,
  nic się nie zmienia. Inicjały zostają w tekście awatara (czytnik ekranu), zdjęcie leży na nich
  jako tło (`P.rysujAwatar`, klasa `ma-zdjecie`).
- **Zapis tam, gdzie reszta profilu** (`k2.profil`, pole `zdjecie`: data URL albo `null`).
  Wpis sprzed zdjęć wczytuje się dalej (brak pola = brak zdjęcia). **Na innych urządzeniach
  zdjęcia nie będzie, dopóki nie powstanie baza w chmurze** — decyzja Fryderyka: bazę robimy,
  gdy zakładka profilu będzie skończona w całości.
- Sondy: zdjęcie 96 kontroli na 4 urządzeniach (iPad 1180, laptop, iPhone 15 Pro, iPhone SE),
  w tym kontrola pikseli wycięcia (pasy czerwony–zielony–niebieski: brzegi i środek na swoim
  miejscu) i przeładowanie strony. **Pięć celowo wstawionych błędów złapanych** (podgląd
  przeciekający na stronę przed „Zapisz”, wycięcie z lewego brzegu zamiast ze środka, obwódka
  na kredce, „Usuń” niepokazujące się, Esc zamykające całą edycję). Najechanie: 37 kontroli.
  Przegląd 21 urządzeń — wynik identyczny co do linijki z wersją sprzed zdjęcia.

### Powiększenie awatara (12.11.2026)

- **Awatar na górze okna profilu jest przyciskiem** — prośba Fryderyka. Dotknięcie pokazuje
  to samo kółko duże na środku ekranu (`<dialog id="tp-lupa">`, `min(440px, 78vw, 64vh)`), tło
  przyciemnione i rozmyte, okno profilu zostaje pod spodem. Bez zdjęcia pokazuje duże inicjały.
- **Zamyka dotknięcie GDZIEKOLWIEK poza kółkiem — liczone po OKRĘGU**, nie po kwadracie
  (róg kwadratu wokół kółka wygląda jak tło, więc ma działać jak tło). Dotknięcie samego kółka
  nic nie robi. Esc zamyka samo powiększenie, nie okno profilu.
- Najechanie: ta sama obwódka co przy awatarze w lewym dolnym rogu i kursor „lupa” (`zoom-in`).
  Tylko w widoku profilu; w edycji awatar nagłówka jest schowany. Dla Tab awatar stoi
  przed „Edit”.

### Data urodzenia (12.11.2026)

- **Ostatnie pole edycji, pod płcią: Dzień · Miesiąc · Rok w jednym rzędzie.** Dzień i rok to pola
  z klawiaturą cyfrową (inne znaki wypadają przy pisaniu), miesiąc to lista z nazwami — bez
  pomyłki „który to był miesiąc”. Na iPadzie/iPhonie lista otwiera systemowe kółko.
- **Pusta data jest dozwolona** (nieustawiona = `null`). Niepełna — nie: „Uzupełnij dzień,
  miesiąc i rok — albo zostaw wszystkie trzy puste.”
- Sprawdzane: data musi istnieć w kalendarzu (lata przestępne — „Luty 2011 ma 28 dni.”),
  rok ≥ 1900, czterocyfrowy, **nie z przyszłości** (wobec zegara urządzenia).
- **Błąd pojawia się dopiero po wyjściu z trzech pól**, a znika na żywo przy poprawianiu —
  nie krzyczymy w połowie wpisywania. „Zapisz” z błędną datą nic nie zapisuje i stawia fokus
  na polu do poprawy.
- **Wiek obok etykiety** („16 lat”, polska odmiana: rok/lata/lat) — tylko przy dacie poprawnej
  w całości. To kontrola wpisu, nie nowa sekcja. `P.wiek()` liczy pełne lata (urodzeni 29 lutego
  kończą rok 1 marca w latach nieprzestępnych) — **pod przyszłą zakładkę treningową**, do której
  data ma trafić (decyzja Fryderyka; „to jeszcze kupa czasu”).
- Zapis w `k2.profil` jako `urodziny: "RRRR-MM-DD"` albo `null`; wpis sprzed daty wczytuje się dalej.
  **W `dane.js` NIE MA domyślnej daty urodzenia** — repo jest publiczne, a to dana osobowa;
  Fryderyk wpisuje ją sam na stronie.
- **Szerokości kolumn z najdłuższego napisu**, zmierzone: „Dzień” 42 px, „Październik” 87 px,
  „2010” 39 px (Plus Jakarta Sans 600 16 px). Pierwsza wersja ucinała „Październik” na iPhonie SE
  i podpowiedź „Dzień” do ~390 px szerokości — złapane miarą, nie okiem. Teraz `minmax()` na
  każdej kolumnie; sprawdzone od 320 do 1180 px. **Zmieniając krój albo nazwy, zmierzyć od nowa.**
- Pismo 16 px także na liście miesięcy — przy mniejszym iPhone powiększa stronę po dotknięciu.
- Sondy: data + powiększenie 109 kontroli na 4 urządzeniach; **sześć celowo wstawionych błędów
  złapanych** (zamykanie przy dotknięciu kółka, zamykanie w obrysie kwadratu zamiast okręgu,
  brak kontroli przyszłości, brak kontroli długości miesiąca, „Zapisz” ślepy na zmianę daty,
  stare kolumny bez minimów). Zdjęcie 96, okno 448, edycja 140, najechanie 45 — bez błędów;
  przegląd 21 urządzeń identyczny co do linijki z wersją sprzed zmian.

### Płeć pod imieniem i pytanie przed usunięciem zdjęcia (12.11.2026)

- **Pod imieniem i nazwiskiem w oknie profilu stoi wybrana płeć** (`data-profil="plec"`,
  zmienia się sama po zapisie). „Mężczyzna”, „Kobieta”, a przy trzeciej opcji **„Płeć
  niezdefiniowana”** — samo „Niezdefiniowana” pod nazwiskiem nie mówiłoby, czego dotyczy.
  Szaro, mniejszym pismem. W edycji schowana.
- Nagłówek to **siatka**: szeroko „imię | Edit”, pod spodem płeć; **wąsko (≤ 480 px) imię, płeć,
  „Edit” linię niżej**, a × przypięty do góry. Pierwsza wersja (flex) ściskała imię do
  „Frydery / k” na iPhonie SE, a z samym zawijaniem „Edit” wchodził między imię i płeć.
  Imię łamie się tylko między wyrazami albo na myślniku — sprawdzone co 10 px od 320 do 1400
  dla dwóch imion (218 z 218).
- **„Usuń profilowe” najpierw pyta**: małe okno na środku, „Usunąć zdjęcie profilowe?”, **Nie**
  i czerwone **Tak, usuń**. Nie, Esc i dotknięcie obok = Nie. Po „Tak” zdjęcie znika z podglądu,
  a **na stronie dopiero po „Zapisz”** — ta sama zasada co przy wyborze zdjęcia; okno mówi to
  wprost. Fokus po otwarciu na samym okienku (bez obwódki na „Nie”).
- Sondy: 43 kontrole (płeć i pytanie) na 3 urządzeniach, **cztery celowo wstawione błędy
  złapane** (usuwanie bez pytania, „Nie” usuwające, tło jako „Tak”, podpis płci nieodświeżany).

### Lista sekcji w oknie profilu (12.11.2026, szkic Fryderyka)

- **Wiersze oddzielone cienką kreską: nazwa, pod nią to, co zapisane, po prawej strzałka ›.**
  Szkic był „mniej więcej”; liczba wierszy nieznana — nowa sekcja to nowy `<li>` w `.tp-sekcje`.
- **ZASADA NA PRZYSZŁOŚĆ (słowa Fryderyka): każdy wiersz po kliknięciu otwiera widok z zapisem
  „tak jak ostatnio”** — w TYM SAMYM oknie, z ‹ wróć, tytułem sekcji, × i stopką „Anuluj / Zapisz”.
  „Zapisz” wyłączone bez zmian; Anuluj, ‹ i Esc wracają bez zapisu; tło przy niezapisanych
  zmianach nie zamyka. Mechanizm: rejestr `sekcje` w `app.js`
  (`{ tytul, form, otworz(), zmienione(), fokus() }`), `data-widok-okna="<id>"`, a przycisk
  „Zapisz” przepina się atrybutem `form` na formularz otwartego widoku. **Nowa sekcja = wpis
  w rejestrze + formularz + reguła CSS pokazująca panel; nie pisać drugiego okna.**
- `P.zapisz()` **scala**: sekcja podaje tylko swoje pola, reszta profilu zostaje. Test łapie
  wersję, w której edycja imienia kasowała pomiary.
- Opis pod nazwą sekcji bierze się z danych ZAPISANYCH i odświeża na zdarzenie `k2:profil`.

### Sekcja „Budowa ciała”: wzrost, masa, BMI (12.11.2026)

- Nazwa moja („nazwij i skończ kod” — Fryderyk). Pola: **wzrost [cm, 100–250]** i **masa ciała
  [kg, 20–300]**, przecinek albo kropka, jedno miejsce po przecinku; puste pole dozwolone.
  „1,78” we wzroście daje podpowiedź o centymetrach. Pod polami „Ostatni zapis: data”.
- **BMI NIE jest zapisywane** — liczy się z pól na żywo (wariant B ze starej strony). W zapisie:
  `wzrost`, `masa`, `cialoData`. **Żadnych wartości domyślnych w repo** (dane osobowe).
- **Braki pokazane wprost, nie zerami:** bez pomiarów przerywana karta „BMI policzy się samo”;
  bez daty urodzenia sama liczba i zdanie, czego brakuje; nastolatek bez płci — to samo
  z wyjaśnieniem; wiek poza 13–99 — „ocena od 13 do 99 lat”.
- **OCENA NIE JEST MOJA — `wspolne/bmi.js`, źródła w nagłówku pliku:**
  - **13–19 lat: WHO Growth Reference 2007** (BMI-for-age, wiek co do miesiąca, osobno dla płci).
    Tabela L/M/S skopiowana MASZYNOWO z pliku `bfawho2007.txt` pakietu `anthroplus` (oficjalny
    program WHO, GitHub `WorldHealthOrganization/anthroplus`); sposób liczenia przepisany z ich
    kodu: wiek = dni/30,4375, interpolacja liniowa między miesiącami, poprawka poza ±3 SD.
    Progi WHO: < −3 SD znaczna niedowaga, < −2 niedowaga, > +1 nadwaga, > +2 otyłość.
  - **od 19 lat i 1 mies.: klasyfikacja WHO dla dorosłych** (18,5 / 25 / 30 / 35 / 40, < 16 znaczna
    niedowaga), BMI zaokrąglone do 0,1 przed oceną. Siatka 2007 jest zbudowana tak, żeby w wieku
    19 lat schodzić się z tymi progami (+1 SD = 25,4 / 25,0; +2 SD = 29,7) — przejście bez skoku.
  - **NIE POPRAWIAĆ TABELI RĘCZNIE i nie „upraszczać” wzoru.** Zmiana jednej cyfry jest łapana
    przez weryfikację (niżej).
- **Weryfikacja przelicznika:** (1) 150 wierszy tabeli równe plikowi WHO; (2) **zestaw testowy
  WHO z tego samego pakietu (`tests/testthat/test_dataset_who2007.rds`): 485 z 485 przypadków
  w wieku 13–19 lat daje z-score zgodny co do 0,01**, w tym 32 poza ±3 SD; (3) punkty z publikacji
  (de Onis 2007) dla 19 lat; (4) progi dorosłych na granicach; (5) centyl wobec biblioteki
  statystycznej Pythona (różnica < 1e-5). Pięć celowo zepsutych wersji złapanych, w tym jedna
  zmieniona cyfra w jednej komórce. Wartości w teście strony (chłopak 16 lat 2 mies.: norma
  16,6–23,7, 64. centyl) policzone OSOBNO w Pythonie z pliku WHO — strona nie sprawdza sama siebie.
- **Czego NIE ma i dlaczego:** siatek CDC (USA) i polskich OLAF — inne próby wzorcowe, dałyby
  drugi, czasem sprzeczny werdykt. Jedno źródło = jedna odpowiedź. Jeśli Fryderyk zechce
  drugiego źródła, to osobna decyzja. **Wiek 65+: WHO nie ma osobnych progów**, choć część badań
  sugeruje łagodniejsze — nie dodawać z własnej inicjatywy.
- Wygląd: duża liczba, werdykt jako pigułka **z ikoną i słowem** (nigdy sama barwa), skala
  liniowa z czterema strefami (norma zielona, reszta neutralna, 2 px przerwy), znacznik-kropka,
  progi pod skalą **dla tej osoby**, zdanie z normą i centylem, źródło i zastrzeżenie, że BMI
  nie odróżnia mięśni od tłuszczu. BMI i progi zawsze z jednym miejscem po przecinku („30,0”).
- Sondy: sekcja 153 kontrole na 4 urządzeniach (zegar strony ustawiony na 12.11.2026), **siedem
  celowo wstawionych błędów złapanych**; podpisy skali bez nakładania w 144 kombinacjach wieku,
  płci, masy i szerokości (najmniejszy odstęp 6,5 px); okno 448, edycja 140, zdjęcie 96, data 109,
  pytanie 43, najechanie 53 — bez błędów; przegląd 21 urządzeń identyczny z poprzednim.

### Pusta część okna profilu — co ma tam trafić

Fryderyk (12.11.2026): **tylko dane zdrowotne i fizyczne, informacje o nim — nie analizy
treningów.** Lista pomysłów do wyboru: `docs/profil-pomysly.md` (85 pozycji z źródłami).
**Nic z niej nie jest jeszcze decyzją** — wybiera Fryderyk. **Dane zdrowotne nigdy do `dane.js`
ani żadnego pliku w repo** — repo jest publiczne.

## 6. Otwarte, nierozstrzygnięte

- **Prawdziwe dane** — strona stoi na przykładowych. Podłączenie danych ze starej strony
  (`dane.js` jako `window.DANE`) to osobny krok.
  **Pełne dane każdej jazdy leżą w repo `Kolarstwo`, katalog `surowe/`** (od 11.11.2026):
  szczegóły jazdy i wszystkie 11 strumieni w pełnej rozdzielczości, bez zaokrągleń,
  dociągane co noc. Format w `Kolarstwo/surowe/README.md`. Tam, a nie w Kolarstwie2,
  bo klucze Stravy są w sekretach tamtego repo. **Na stronie nic się od tego nie
  zmieniło** — decyzja Fryderyka: najpierw zebrać dane, AI na koniec.
- **AI** — propozycja z 11.11.2026, jeszcze nie decyzja: Cloudflare Worker + Claude
  przez API, „kod liczy, model interpretuje”. Fryderyk: „AI dodamy na koniec”.

## 7. Praca między urządzeniami — lekcja z 11.11.2026

Praca z sesji na Macu nie była nigdzie widoczna z iPada: sesja działała lokalnie, a jedyną
wspólną pamięcią jest GitHub. **Każdą zmianę kończyć wysłaniem na GitHuba**, a decyzje
dopisywać tutaj — inaczej żyją na jednym urządzeniu, tak jak koszulki w `localStorage`
na starej stronie.
