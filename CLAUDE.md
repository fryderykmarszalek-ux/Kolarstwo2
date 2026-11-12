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
**Poza tym okno jest puste celowo; nie dokładać sekcji z własnej inicjatywy.** JOIN był tylko
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
  **Płeć na razie nic nie znaczy** — rola przyjdzie później (Fryderyk: przyda się, gdy stroną
  zacznie się posługiwać tata albo ktoś znajomy).
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
