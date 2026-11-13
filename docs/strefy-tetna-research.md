# Strefy tętna — research (13.11.2026)

Cel: dwie opcje na stronie — **automatyczne liczenie stref** i **własne ustawienie**. Ten plik
zbiera metody, wzory, progi i to, co da się policzyć z danych Fryderyka. **Nic z tego nie jest
jeszcze decyzją** — wybiera Fryderyk.

## 1. Trzy liczby, z których liczy się każda metoda

| Liczba | Co to | Skąd | Jakość |
|---|---|---|---|
| **HRmax** | najwyższe tętno, jakie serce osiąga | pomiar z jazdy / testu albo wzór z wieku | pomiar ≫ wzór |
| **HRspocz** | tętno spoczynkowe | ręcznie: rano, leżąc, 3–5 min spokoju, najniższa wartość, kilka dni z rzędu | tylko pomiar |
| **LTHR** | tętno na progu mleczanowym (tempo, które da się trzymać ok. godzinę) | test: 30 min jazdy na maksa, średnia z OSTATNICH 20 min (Friel) | najlepsza kotwica dla kolarstwa |

## 2. Wzory na HRmax z wieku (tylko gdy nie ma pomiaru)

| Wzór | Postać | Uwagi |
|---|---|---|
| Fox („220 − wiek”) | 220 − wiek | najpopularniejszy, najsłabszy; Strava i Garmin używają go domyślnie |
| **Tanaka 2001** | 208 − 0,7 × wiek | metaanaliza 351 badań, 18 712 osób; błąd ~10 ud./min. **Najlepszy z wzorów także dla młodzieży** (metaanaliza 2019: dorosłe wzory zawodzą u dzieci, ale jeśli już — Tanaka) |
| Gellish 2007 | 207 − 0,7 × wiek | prawie to samo co Tanaka |
| Nes 2013 (HUNT) | 211 − 0,64 × wiek | 3320 osób; w walidacji 2020 zawyżał średnio o ~5 |
| Gulati 2010 (kobiety) | 206 − 0,88 × wiek | 5437 kobiet 35+; dla nastolatek nie badany |

**Rozrzut indywidualny jest duży: ±10 ud./min (1 SD), ±20 w granicach zgodności.** Przykład
Fryderyka: Tanaka daje 197, a zmierzone w wyścigu 10.10.2026 to **207** — 10 ud./min różnicy, czyli
dokładnie typowy błąd wzoru. Wniosek: wzór tylko jako zapas, gdy nie ma pomiaru.

## 3. Modele stref

### A. % HRmax — 5 stref (Garmin, Polar, Strava domyślnie)
Z1 50–60 · Z2 60–70 · Z3 70–80 · Z4 80–90 · Z5 90–100 % HRmax.
Najprostszy. Słabość: nie wie nic o progu — badania (Meixner 2025) pokazują, że stałe % HRmax
słabo trafiają w indywidualne progi metaboliczne.

### B. % rezerwy tętna (Karvonen, HRR) — 5 stref (WHOOP, opcja w Garminie)
Tętno = HRspocz + % × (HRmax − HRspocz), progi jak wyżej: 50/60/70/80/90 % rezerwy.
Lepszy od A, bo uwzględnia formę (spadające tętno spoczynkowe przesuwa strefy). Wymaga HRspocz.
ACSM: umiarkowana intensywność 40–59 % HRR, wysoka 60–89 % HRR.

### C. % LTHR — Joe Friel, kolarstwo — 7 stref (TrainingPeaks)
Z1 < 81 · Z2 81–89 · Z3 90–93 · Z4 94–99 · Z5a 100–102 · Z5b 103–106 · Z5c > 106 % LTHR.
Standard w kolarstwie szosowym; kotwica to próg, nie maksimum. (Bieganie ma inne Z1–Z4.)

### D. % LTHR — Coggan (Allen & Coggan, „Training and Racing with a Power Meter”) — 5 stref
Z1 < 68 · Z2 69–83 · Z3 84–94 · Z4 95–105 · Z5 > 106 % LTHR.
Odpowiada strefom mocy Coggana — przyda się, bo podzakładka „Moc” będzie stała obok.
(Źródła wtórne zgodne; książki nie czytałem.)

### E. Trzy strefy (Seiler, model spolaryzowany)
Z1 < VT1/LT1 · Z2 między progami · Z3 > VT2/LT2. Progi z badania laboratoryjnego
(wentylacja/mleczan). Bez laboratorium tylko przybliżenia — **nie liczyć automatycznie**.

## 4. Co da się policzyć z danych Fryderyka (archiwum `Kolarstwo/surowe/`, 40 jazd z tętnem)

- **HRmax: 207** — wyścig Zwift 10.10.2026; utrzymane ≥ 5 s, bez skoków (filtr: odrzucamy skok
  > 15 ud./s). Kolejne: 199 (12.09), 197 ×3. W całym archiwum **0 jazd ze skokami pasa**.
- **LTHR — kandydaci (średnia z ostatnich 20 min najlepszego 30-minutowego odcinka):**
  - test FTP 17.09 (20 min): 182,1 · czasówka Sa Calobra 03.11: 181,3 → **ok. 182**
  - wyścig 10.10: 188,8 — wyścig zawyża (zrywy, emocje), na próg słabszy kandydat.
  - **Uwaga:** reguła „× 0,95” z 20-minutowego testu dotyczy MOCY (FTP), nie tętna — dla tętna
    nie jest zwalidowana (182 × 0,95 = 173 byłoby za nisko).
- **HRspocz: brak** — Strava go nie zapisuje. Ręcznie albo kiedyś z Garmina.
- **Wniosek:** automat może ZAPROPONOWAĆ HRmax i LTHR z jazd, ale nie wie, która jazda była
  równą czasówką, a która wyścigiem — więc propozycja, którą Fryderyk zatwierdza, nie wpis z automatu.
- **Strona Kolarstwo2 stoi dziś na danych przykładowych** — automat z jazd zadziała dopiero po
  podłączeniu prawdziwych danych (osobny krok, §6 CLAUDE.md). Do tego czasu: wiek z profilu
  + wartości wpisane ręcznie.

## 5. Strefy Fryderyka każdą metodą (HRmax 207, LTHR 182, wiek 16)

| Metoda | Z1 | Z2 | Z3 | Z4 | Z5 |
|---|---|---|---|---|---|
| % HRmax (207) | 104–123 | 124–144 | 145–165 | 166–185 | 186+ |
| % HRmax ze wzoru Tanaki (197) | 98–117 | 118–137 | 138–157 | 158–176 | 177+ |
| % HRR (spocz. 45, przykład) | 126–141 | 142–157 | 158–174 | 175–190 | 191+ |
| % HRR (spocz. 55, przykład) | 131–145 | 146–160 | 161–176 | 177–191 | 192+ |
| Coggan (LTHR 182) | < 126 | 126–152 | 153–172 | 173–192 | 193+ |
| Friel (LTHR 182), 7 stref | < 147 | 147–163 | 164–170 | 171–181 | 5a 182–186 · 5b 187–194 · 5c 195+ |

Ta sama jazda w Z2 wg % HRmax (124–144) to w Friel jeszcze Z1 (< 147) — **metody naprawdę się
różnią**, dlatego wybór metody musi być widoczny przy strefach.

## 6. Proponowany kształt na stronie (do decyzji)

- **Automatycznie:** wybór metody (A / B / C / D), wartości wejściowe z pochodzeniem
  („z jazdy 10 paź”, „wzór Tanaka”, „wpisane”), hierarchia gdy czegoś brak:
  LTHR → metoda C/D; jest HRspocz → B; jest zmierzone HRmax → A; nic → A ze wzoru Tanaki.
- **Własne:** granice każdej strefy wpisane ręcznie; dolna granica Z1 = 0, górna ostatniej = ∞
  (lekcja ze starej strony: inaczej sekundy „wypadają” ze wszystkich stref).
- **Strefy datowane** (lekcja ze starej strony): zmiana progów od dziś albo jako poprawka wstecz.

## Źródła

- Tanaka i in. 2001, *Age-predicted maximal heart rate revisited*: https://pubmed.ncbi.nlm.nih.gov/11153730/
- Walidacja wzorów (Fox, Tanaka, Gellish, Nes, Gulati, Fairbarn), 2020: https://pmc.ncbi.nlm.nih.gov/articles/PMC7523886
- Wzory u dzieci i młodzieży (metaanaliza 2019; chłopcy 10–16 lat): https://scielo.br/j/abc/a/wGSRY7VppmxYMKDMjfXTvSL/?lang=en , https://informahealthcare.com/doi/epub/10.1080/02701367.2019.1615605
- Gulati 2010 (kobiety): https://www.sciencedaily.com/releases/2010/06/100628170928.htm
- Karvonen / ACSM: https://www.edu.gov.mb.ca/k12/cur/physhlth/docs/poster.pdf
- Friel, strefy % LTHR: https://www.trainingpeaks.com/learn/articles/joe-friel-s-quick-guide-to-setting-zones/ , https://www.220triathlon.com/training/training-zones-what-are-they-and-how-should-you-use-them
- Coggan, strefy tętna: https://rouvy.com/blog/cycling-heart-rate-zones , https://maklinbikes.com/coggan-heart-rate-training-zone-calculator/ , http://www.trainingbible.com/joesblog/2009/11/quick-guide-to-setting-zones.html
- Garmin, strefy % HRmax i % HRR: https://www8.garmin.com/manuals/webhelp/forerunner920/EN-US/GUID-297479DE-3E8E-4026-9E7A-13C6EA843198.html
- Strava, domyślne strefy (220 − wiek): https://support.strava.com/en-us/articles/15401569-training-zones-on-strava
- WHOOP, strefy z rezerwy tętna: https://www.whoop.com/thelocker/more-personalized-heart-rate-zones-with-whoop
- Seiler, trzy strefy: https://www.frontiersin.org/articles/10.3389/fphys.2015.00295/full
- Stałe % HRmax vs progi indywidualne (Meixner 2025): https://pmc.ncbi.nlm.nih.gov/articles/PMC11986187/
- Pomiar tętna spoczynkowego: https://www.polar.com/uk-en/guide/how-to-measure-resting-heart-rate , https://marcoaltini.substack.com/p/resting-heart-rate-and-wearables
- Test LTHR 20 vs 30 min: https://www.trainerroad.com/forum/t/heart-rate-hr-threshold/13970/12 , https://roadmancycling.com/blog/which-ftp-test-protocol-best-guide
- HRmax w terenie vs laboratorium: https://www.thieme-connect.com/products/ejournals/pdf/10.1055/s-2002-29081.pdf
