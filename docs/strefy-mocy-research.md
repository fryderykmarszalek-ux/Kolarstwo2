# Strefy mocy — research (13.11.2026)

Pytanie Fryderyka: czy metod jest kilka, czy jest tylko jedna (z FTP), i czy któraś liczy się
z konkretnych rekordów na odcinkach. Ten plik zbiera odpowiedź, wybór i uzasadnienie.

## 1. Wniosek w jednym zdaniu

**Prawie każdy system stref mocy to procent JEDNEJ liczby progowej — FTP albo CP.** Systemy różnią
się głównie (a) tym, skąd bierze się ta liczba, i (b) drobnymi przesunięciami procentów. Naprawdę
inne podejścia (wiele rekordów naraz, cała krzywa mocy) istnieją, ale są zamknięte albo wymagają
laboratorium.

## 2. Modele stref (podział na strefy)

| Model | Strefy (% progu) | Kto używa | Uwagi |
|---|---|---|---|
| **Coggan, 7 poziomów** | Z1 ≤ 55 · Z2 56–75 · Z3 76–90 · Z4 91–105 · Z5 106–120 · Z6 121–150 · Z7 > 150 | Strava, TrainingPeaks, Garmin, intervals.icu, stara strona | standard branży; Coggan woli słowo „poziomy” |
| GoldenCheetah (% CP) | 0 / 55 / 75 / 90 / 105 / 120 / 150 | GoldenCheetah | **ten sam podział, tylko od CP** — sprawdzone w kodzie źródłowym (`Zones.cpp`, `initial_zone_default`) |
| Zwift, 6 stref | < 60 · 60–75 · 76–89 · 90–104 · 105–118 · > 118 | Zwift (kolory bloków w treningach) | uproszczony Coggan |
| TrainerRoad, 7 stref | < 55 · 55–75 · 76–87 · **88–94 Sweet Spot** · 95–105 · 106–120 · > 120 | TrainerRoad | Coggan z wydzielonym Sweet Spotem (Coggan sam dodał go jako poziom 4a) |
| iLevels (WKO) | indywidualne, z krzywej moc–czas (FRC, Pmax, TTE, mFTP) | WKO5 | **algorytm niepubliczny** — nie da się odtworzyć |
| Seiler, 3 strefy | < LT1 · LT1–LT2 · > LT2 | model spolaryzowany | granica LT1 wymaga badania; szacunki w % FTP rozjeżdżają się (65–85%) |
| Domeny wysiłku | umiarkowana · ciężka · ciężka-ponadprogowa (severe) · ekstremalna | fizjologia (Jones, Poole) | granice: GET/LT1 i **CP** — CP to granica „ciężkiej” i „ponadprogowej” |

## 3. Skąd bierze się próg — tu są prawdziwe różnice

| Sposób | Co wpisać | Wzór | Źródło |
|---|---|---|---|
| FTP wpisane | FTP | — | — |
| Test 20 min | średnia moc z 20 min na maksa | FTP = 0,95 × P20 | Allen & Coggan |
| Test 2 × 8 min | lepsza ze średnich | FTP = 0,90 × P8 | TrainerRoad |
| Test rampowy | najlepsza minuta rampy | FTP = 0,75 × P1min | TrainerRoad, Zwift (TrainerRoad: **najlepsza**, nie ostatnia minuta) |
| **Critical Power** | **dwa (lub więcej) maksymalne wysiłki różnej długości**, np. 3 i 12 min | praca = CP·t + W′ ⇒ CP = (P₂t₂ − P₁t₁)/(t₂ − t₁), W′ = (P₁ − P₂)·t₁t₂/(t₂ − t₁) | Monod & Scherrer 1965; protokół 3 + 12 min najczęstszy |
| Test 3 min all-out | jeden wysiłek 3 min na maksa | CP = średnia z ostatnich 30 s | Vanhatalo 2007 (wymaga trenażera w trybie stałego oporu) |
| 4DP (Wahoo) | **cztery rekordy: 5 s (NM), 1 min (AC), ~5 min (MAP), 20 min (FTP)** | profil, nie tabela stref | Wahoo SYSTM, test Full Frontal; zamknięte |

**Odpowiedź na „czy liczy się coś z rekordów na odcinkach”: tak — CP (dwa rekordy) i 4DP (cztery).**
CP jest otwarty i ma najmocniejsze podstawy naukowe; 4DP to zamknięty system jednej firmy.

## 4. Co mówią badania

- **FTP z 20 min × 0,95 zawyża próg mleczanowy.** Inglis i in. 2020 (IJSPP): moc przy MLSS ≈ 88,5%
  średniej z 20 min ≈ 93% FTP95%; zmiany MLSS po treningu nie odbijały się w FTP95%.
- **FTP i CP to nie to samo.** Karsten i in. 2021 (Frontiers): CP 256 ± 50 W wobec FTP 249 ± 44 W,
  z prawdopodobieństwem 91,7%, że CP jest wyższe — „nie używać zamiennie”.
- Głos przeciwny: badanie w czasopiśmie Thieme — znikome różnice FTP20 vs FTP60/MLSS przy dobrej
  powtarzalności testu (CV 2,9%).
- **CP to fizjologiczna granica:** najwyższa moc bez ciągłego zużywania W′; powyżej CP wyczerpanie
  następuje po zużyciu W′ (Jones, Poole, Vanhatalo).

## 5. Wybór na stronę

- **Model stref: Coggan, 7 poziomów** — wszystkie aplikacje Fryderyka (Strava, Zwift w uproszczeniu)
  i stara strona liczą tak samo; liczby da się porównać 1:1.
- **Cztery sposoby wyznaczenia progu (kafelki):** FTP wpisane · Test 20 min · Test rampowy ·
  Critical Power (CP i W′ z dwóch wysiłków). Każdy daje te same 7 stref.
- **Nie wzięte:** iLevels i 4DP (zamknięte), Seiler 3 strefy (wymaga LT1 z badania), test 2 × 8 min
  (rzadziej używany niż 20 min i rampa — do dodania jednym wpisem w module), wariant Zwifta i TrainerRoada (te same progi
  przesunięte o kilka procent — do dodania, jeśli Fryderyk chce kolorów jak w Zwifcie).
- **Kafelki wyniku:** próg wyliczony (FTP z testu albo CP), W′ przy CP, W/kg — gdy w profilu jest masa.

## 6. Reguła granic i zaokrągleń

- Coggan pisze „Z1 ≤ 55%”, więc **moc RÓWNA progowi zostaje w niższej strefie**: górna granica
  strefy = floor(p% × próg), następna o 1 W wyżej. FTP 210 → 0–115 · 116–157 · 158–189 · 190–220 ·
  221–252 · 253–315 · 316+ (identycznie jak na starej stronie). Przy tętnie reguła jest odwrotna,
  bo tam źródła piszą „Z1 < 81%”.
- **Próg wyliczony jest zaokrąglany do pełnego wata, a strefy liczą się z TEJ liczby** — przeliczenie
  ręczne z ekranu daje dokładnie to samo. Liczone na liczbach całkowitych (19/20 zamiast 0,95).
- Konwencje w programach różnią się o 1 W (GoldenCheetah zaokrągla dolną granicę w dół i daje ją
  wyższej strefie). To nie jest błąd żadnej strony — źródła nie rozstrzygają, kto ma 55,0%.

## 7. Liczby Fryderyka (ze starej strony)

- FTP 210 W (od 10.10.2026); rekord 5 min 258 W, rekord 20 min 222 W (wyścig 10.10.2026).
- **CP z tych dwóch rekordów:** (222 × 20 − 258 × 5) / 15 = 189 000 / 900 → **210 W**,
  W′ = (258 − 222) × 5 × 20 × 60 / 15 = **14,4 kJ**. CP wychodzi równe FTP co do wata.
- Test 20 min: 0,95 × 222 = 210,9 → **211 W**.

## Źródła

- Coggan, poziomy mocy: https://cycling.favero.com/en/blog/power-training-zones-cycling ,
  https://www.trainerroad.com/forum/t/where-do-the-ftp-of-the-different-training-zones-come-from/35706.md
- Coggan, iLevels i poziom 4a Sweet Spot: https://www.trainingpeaks.com/blog/individualized-training-the-what-why-and-how-of-the-new-wko4-ilevels/
- TrainerRoad, strefy ze Sweet Spotem: https://www.trainerroad.com/blog/cycling-power-zones-training-zones-explained/
- Zwift, strefy i kolory: https://zwiftinsider.com/power-zone-colors
- GoldenCheetah, domyślne strefy % CP (kod): https://github.com/GoldenCheetah/GoldenCheetah/blob/master/src/Metrics/Zones.cpp ,
  https://github.com/GoldenCheetah/GoldenCheetah/wiki/UG_Preferences_Athlete_Training%20Zones
- Wahoo 4DP: https://support.wahoofitness.com/hc/en-us/articles/360021387420
- Test rampowy i 8 min: https://support.trainerroad.com/hc/en-us/articles/360006903031-Ramp-Test-FAQs ,
  https://www.trainerroad.com/ftp-calculator
- Model CP i W′: https://pmc.ncbi.nlm.nih.gov/articles/PMC7552657/ ,
  https://www.gssiweb.org/en/sports-science-exchange/article/the-critical-power-concept-and-high-intensity-exercise-performance
- Domeny wysiłku: https://pmc.ncbi.nlm.nih.gov/articles/PMC5070974
- FTP vs CP (Karsten 2021): https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7862708/
- FTP vs MLSS (Inglis 2020): https://kar.kent.ac.uk/78757
- Głos przeciwny (FTP20 vs MLSS): https://www.thieme-connect.de/products/ejournals/html/10.1055/a-1018-1965?lang=en
- Seiler, 3 strefy w watach (szacunki, brak źródła pierwotnego): https://www.trainerroad.com/forum/t/polarized-training-what-are-the-3-zones/27625
