/* Strefy tętna — cztery kalkulatory i strefy własne. Jedna reguła liczenia dla wszystkich.
 *
 * Metody (research: docs/strefy-tetna-research.md):
 *   hrmax  — % tętna maksymalnego, 5 stref, progi 60/70/80/90 % HRmax (Garmin, Polar, Strava)
 *   hrr    — % rezerwy tętna (Karvonen), 5 stref, progi 60/70/80/90 % rezerwy:
 *            próg = spoczynkowe + p × (maks − spoczynkowe)
 *   coggan — % tętna progowego (Allen & Coggan), 5 stref: Z1 ≤ 68 · Z2 69–83 · Z3 84–94 · Z4 95–105 · Z5 ≥ 106 %
 *   friel  — % tętna progowego, kolarstwo (Friel / TrainingPeaks), 7 stref:
 *            Z1 < 81 · Z2 81–89 · Z3 90–93 · Z4 94–99 · Z5a 100–102 · Z5b 103–106 · Z5c > 106 %
 *
 * REGUŁA (jedna, wszędzie): tętno h [ud./min, całkowite] należy do strefy k+1, gdy h ≥ prog_k,
 * gdzie prog_k to próg w liczbach rzeczywistych. Początek strefy = ceil(prog_k). Dzięki temu
 * każda całkowita wartość ma dokładnie jedną strefę: bez dziur i bez nakładania.
 * Progi procentowe Coggana i Friela są podane w CAŁYCH procentach („69–83”), więc próg między
 * strefami = dolna granica następnej strefy: Coggan 69/84/95/106 %, Friel 81/90/94/100/103/107 %.
 *
 * Strefy własne: użytkownik podaje górne granice stref 1…n−1 (całkowite, rosnące); strefa k+1
 * zaczyna się od granicy k + 1. Pierwsza strefa nie ma dolnej granicy, ostatnia — górnej.
 */
(function (global) {
  'use strict';
  const S = {};
  const N5 = ['Regeneracja', 'Wytrzymałość', 'Tempo', 'Próg', 'VO2max'];
  // kolejność = kolejność kafelków na stronie (A–D z docs/strefy-tetna-research.md)
  S.METODY = {
    hrmax: { nazwa: '% tętna maks.', opis: '5 stref', wymaga: ['hrmax'], progi: [0.60, 0.70, 0.80, 0.90], etykiety: ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'], nazwy: N5 },
    hrr: { nazwa: 'Rezerwa tętna', opis: 'Karvonen · 5 stref', wymaga: ['hrmax', 'hrspocz'], progi: [0.60, 0.70, 0.80, 0.90], etykiety: ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'], nazwy: N5 },
    friel: { nazwa: 'Friel', opis: '% progu · 7 stref', wymaga: ['lthr'], progi: [0.81, 0.90, 0.94, 1.00, 1.03, 1.07],
      etykiety: ['Z1', 'Z2', 'Z3', 'Z4', 'Z5a', 'Z5b', 'Z5c'], nazwy: ['Regeneracja', 'Wytrzymałość', 'Tempo', 'Podprogowa', 'Nadprogowa', 'VO2max', 'Beztlenowa'] },
    coggan: { nazwa: 'Coggan', opis: '% progu · 5 stref', wymaga: ['lthr'], progi: [0.69, 0.84, 0.95, 1.06], etykiety: ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'], nazwy: N5 },
  };
  S.WLASNE = { etykiety: ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'], nazwy: N5 };
  // opis pól dla wspólnego kalkulatora na stronie (app.js) — ten sam kształt co w wspolne/strefy-mocy.js
  S.JEDNOSTKA = 'ud./min';
  // PARAMETRY — tętno maks. i spoczynkowe ZAWSZE na górze zakładki, niezależnie od kalkulatora (14.11.2026, Fryderyk);
  // metody korzystają z nich, a u siebie pokazują tylko to, czego tu nie ma (tętno progowe)
  S.PARAMETRY = ['hrmax', 'hrspocz'];
  S.POLA = {
    hrmax: { etykieta: 'Tętno maks.', jednostka: 'ud./min', brak: 'Wymaga tętna maks.' },
    hrspocz: { etykieta: 'Tętno spocz.', jednostka: 'ud./min', brak: 'Wymaga tętna spoczynkowego' },
    lthr: { etykieta: 'Tętno progowe', jednostka: 'ud./min', brak: 'Wymaga tętna progowego' },
  };
  // zakresy wejść — tak dobrane, że progi każdej metody są zawsze różne (min. 2 ud./min między nimi)
  S.ZAKRESY = { hrmax: [120, 240], hrspocz: [30, 100], lthr: [100, 230], wlasne: [40, 250] };
  Object.keys(S.POLA).forEach((k) => { S.POLA[k].zakres = S.ZAKRESY[k]; });   // wlasne: 250, żeby „Dostosuj ręcznie” z każdej metody dawało poprawne strefy (Coggan przy LTHR 230: Z5 od 244)

  const sufit = (x) => Math.ceil(x - 1e-9);          // 144,9999999 i 145,0000001 → 145; chroni przed błędem zapisu ułamków

  // początki stref 2…n (ud./min) dla metody i danych; null, gdy brakuje danych
  S.poczatki = (metoda, d) => {
    const m = S.METODY[metoda];
    if (!m || m.wymaga.some((k) => !(d[k] > 0))) return null;
    if (metoda === 'hrr') return m.progi.map((p) => sufit(d.hrspocz + p * (d.hrmax - d.hrspocz)));
    const baza = metoda === 'hrmax' ? d.hrmax : d.lthr;
    return m.progi.map((p) => sufit(p * baza));
  };
  // podpisy procentowe stref LICZONE Z PROGÓW, nie wpisane ręcznie — nie mogą się rozjechać z liczbami w ud./min.
  // Przedział jednostronnie domknięty, jak przy % HRmax: „69–84%” = od 69% do poniżej 84%. Źródła piszą to samo
  // w całych procentach („69–83%”), bo 83,9% to wciąż strefa niższa.
  S.procenty = (metoda) => {
    const pr = S.METODY[metoda].progi.map((p) => Math.round(p * 100));
    return S.METODY[metoda].etykiety.map((e, i) => (i === 0 ? `< ${pr[0]}%` : i === pr.length ? `≥ ${pr[i - 1]}%` : `${pr[i - 1]}–${pr[i]}%`));
  };
  // własne: górne granice stref 1…4 → początki stref 2…5
  S.poczatkiWlasne = (granice) => (granice && granice.length === 4 && granice.every((g) => Number.isInteger(g)) ? granice.map((g) => g + 1) : null);

  // początki → wiersze { etykieta, nazwa, od, do } (od/do null = bez granicy)
  S.wiersze = (poczatki, opis) => opis.etykiety.map((e, i) => ({
    etykieta: e, nazwa: opis.nazwy[i],
    od: i === 0 ? null : poczatki[i - 1],
    do: i === opis.etykiety.length - 1 ? null : poczatki[i] - 1,
  }));

  // strefa dla tętna h — ta sama reguła co wiersze: indeks pierwszej strefy, której początek > h, minus 1
  S.strefa = (h, poczatki) => { let k = 0; while (k < poczatki.length && h >= poczatki[k]) k++; return k; };

  // 7 stref Friela → 5 stref własnych (Z5 = 5a + 5b + 5c); 5 stref bez zmian. Wynik: 4 górne granice.
  S.doWlasnych = (metoda, poczatki) => (poczatki ? (metoda === 'friel' ? poczatki.slice(0, 4) : poczatki).map((p) => p - 1) : null);

  // sprawdzenie granic własnych: { blad, wartosc, zle } — zle = indeksy granic do podświetlenia.
  // Granica g to „do” strefy k i jednocześnie „od” = g + 1 strefy k+1, więc OBIE liczby, które widać na ekranie,
  // muszą leżeć w zakresie: 40 ≤ g i g + 1 ≤ 250.
  S.sprawdzWlasne = (granice) => {
    const idx = (warunek) => granice.map((g, i) => (warunek(g, i) ? i : -1)).filter((i) => i >= 0);
    if (granice.every((g) => g == null)) return { blad: '', wartosc: null, zle: [] };
    if (granice.some((g) => g == null)) return { blad: 'Uzupełnij wszystkie granice', wartosc: null, zle: idx((g) => g == null) };
    const [od, do_] = S.ZAKRESY.wlasne;
    const poza = idx((g) => g < od || g + 1 > do_);
    if (poza.length) return { blad: `Zakres ${od}–${do_} ud./min`, wartosc: null, zle: poza };
    const zle = [...new Set(granice.flatMap((g, i) => (i && g <= granice[i - 1] ? [i - 1, i] : [])))];
    if (zle.length) return { blad: 'Granice muszą rosnąć', wartosc: null, zle };
    return { blad: '', wartosc: granice.slice(), zle: [] };
  };
  S.sprawdzWejscie = (pole, tekst) => {
    const v = String(tekst == null ? '' : tekst).trim();
    if (!v) return { blad: '', wartosc: null };
    if (!/^\d{1,3}$/.test(v)) return { blad: 'Nieprawidłowa wartość', wartosc: null };
    const n = +v, [od, do_] = S.ZAKRESY[pole];
    if (n < od || n > do_) return { blad: `Zakres ${od}–${do_} ud./min`, wartosc: null };
    return { blad: '', wartosc: n };
  };

  // ustawienia zapisywane w profilu (tylko dane wejściowe — strefy liczą się przy wyświetlaniu)
  S.DOMYSLNE = { auto: true, metoda: 'hrmax', hrmax: null, hrspocz: null, lthr: null, wlasne: null };
  S.poprawne = (u) => {
    if (u == null) return true;
    if (typeof u !== 'object' || typeof u.auto !== 'boolean' || !(u.metoda in S.METODY)) return false;
    for (const k of ['hrmax', 'hrspocz', 'lthr']) if (u[k] != null && (!Number.isInteger(u[k]) || u[k] < S.ZAKRESY[k][0] || u[k] > S.ZAKRESY[k][1])) return false;
    return u.wlasne == null || (Array.isArray(u.wlasne) && S.sprawdzWlasne(u.wlasne).wartosc !== null);
  };

  global.STREFY_HR = S;
  if (typeof module !== 'undefined') module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
