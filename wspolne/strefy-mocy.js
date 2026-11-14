/* Strefy mocy — cztery sposoby wyznaczenia progu i strefy własne. Research: docs/strefy-mocy-research.md.
 *
 * Strefy: 7 poziomów Coggana (Allen & Coggan, „Training and Racing with a Power Meter”) — ten sam podział
 * co Strava, TrainingPeaks, Garmin, intervals.icu i GoldenCheetah (tam liczony od CP). Granice w % progu:
 *   Z1 ≤ 55 · Z2 55–75 · Z3 75–90 · Z4 90–105 · Z5 105–120 · Z6 120–150 · Z7 > 150
 * Metody różnią się tym, SKĄD bierze się próg:
 *   ftp    — FTP wpisane wprost
 *   test20 — test 20 min: FTP = 95% średniej mocy (Allen & Coggan)
 *   rampa  — test rampowy: FTP = 75% najlepszej minuty (TrainerRoad, Zwift)
 *   cp     — Critical Power z dwóch maksymalnych wysiłków (model dwuparametrowy, Monod & Scherrer 1965):
 *            praca = CP·t + W′  ⇒  CP = (P₂t₂ − P₁t₁)/(t₂ − t₁),  W′ = (P₁ − P₂)·t₁·t₂/(t₂ − t₁)
 *
 * REGUŁA GRANIC (inna niż przy tętnie — każda idzie za znakiem nierówności w swoim źródle): Coggan pisze
 * „Z1 ≤ 55%”, więc moc RÓWNA progowi zostaje w NIŻSZEJ strefie. Górna granica strefy = floor(p% × próg),
 * następna zaczyna się o 1 W wyżej. Liczone na liczbach całkowitych (procent × próg / 100), bez ułamków
 * zmiennoprzecinkowych. Dla FTP 210: 0–115 · 116–157 · 158–189 · 190–220 · 221–252 · 253–315 · 316+
 * — tak samo jak na starej stronie i w Stravie.
 *
 * Próg wyliczony (FTP z testu, CP) jest ZAOKRĄGLANY do pełnego wata, a strefy liczą się z tej zaokrąglonej
 * liczby — kto przeliczy strefy ręcznie z liczby na ekranie, dostanie dokładnie to samo.
 */
(function (global) {
  'use strict';
  const S = {};
  S.JEDNOSTKA = 'W';
  S.PROCENTY = [55, 75, 90, 105, 120, 150];                 // całe procenty — liczymy na liczbach całkowitych
  const E7 = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7'];
  const N7 = ['Regeneracja', 'Wytrzymałość', 'Tempo', 'Próg', 'VO2max', 'Beztlenowa', 'Sprint'];
  // kolejność = kolejność kafelków na stronie
  S.METODY = {
    ftp: { nazwa: 'FTP', opis: 'Z pola FTP', wymaga: ['ftp'], prog: 'FTP' },
    test20: { nazwa: 'Test 20 min', opis: '95% średniej mocy', wymaga: ['p20'], prog: 'FTP' },
    rampa: { nazwa: 'Test rampowy', opis: '75% maks. minuty', wymaga: ['pmin'], prog: 'FTP' },
    cp: { nazwa: 'Critical Power', opis: 'CP i W′ · 2 wysiłki', wymaga: ['t1', 'w1', 't2', 'w2'], prog: 'CP' },
  };
  Object.values(S.METODY).forEach((m) => { m.etykiety = E7; m.nazwy = N7; });
  S.WLASNE = { etykiety: E7, nazwy: N7 };
  // pola wejściowe: etykieta, jednostka, zakres; brak = co pokazać, gdy metoda nie ma danych
  S.POLA = {
    ftp: { etykieta: 'FTP', jednostka: 'W', zakres: [50, 700], brak: 'Wymaga FTP', naKg: true },
    p20: { etykieta: 'Średnia moc 20 min', jednostka: 'W', zakres: [50, 750], brak: 'Wymaga średniej mocy 20 min' },
    pmin: { etykieta: 'Najlepsza minuta', jednostka: 'W', zakres: [50, 950], brak: 'Wymaga najlepszej minuty' },
    t1: { etykieta: 'Krótki wysiłek', jednostka: 'min', zakres: [2, 10], brak: 'Wymaga dwóch wysiłków', aria: 'Czas krótkiego wysiłku' },
    w1: { etykieta: 'Średnia moc', jednostka: 'W', zakres: [50, 1500], brak: 'Wymaga dwóch wysiłków', aria: 'Średnia moc krótkiego wysiłku' },
    t2: { etykieta: 'Długi wysiłek', jednostka: 'min', zakres: [8, 40], brak: 'Wymaga dwóch wysiłków', aria: 'Czas długiego wysiłku' },
    w2: { etykieta: 'Średnia moc', jednostka: 'W', zakres: [50, 1500], brak: 'Wymaga dwóch wysiłków', aria: 'Średnia moc długiego wysiłku' },
  };
  // dozwolony próg. Z okrągłych zakresów pól wychodzi FTP 38–713 W (50 × 0,75 … 950 × 0,75), więc z testów nigdy nie ma
  // błędu progu; sprawdzenie łapie tylko CP, które z dwóch wysiłków potrafi wyjść dowolne (nawet ujemne).
  S.PROG = [30, 750];
  // PARAMETRY — pola stojące ZAWSZE w tym samym miejscu na górze zakładki, niezależnie od kalkulatora i metody
  // (14.11.2026, Fryderyk: „pole z FTP zawsze w jednym i tym samym miejscu”). Metoda pokazuje u siebie tylko pola,
  // których tu nie ma. FTP to wartość zawodnika, potrzebna całej stronie; strefy liczą się z MOCY PROGOWEJ.
  S.PARAMETRY = ['ftp'];
  // okienko „Moc progowa” obok FTP — tylko do odczytu: próg, z którego liczą się strefy (FTP, FTP z testu albo CP).
  // Gdy różni się od FTP, „Ustaw jako FTP” przepisuje go do pola FTP (jak akceptacja wyniku testu w Zwifcie).
  S.PROG_OKNO = { etykieta: 'Moc progowa', jednostka: 'W', doPola: 'ftp', przycisk: 'Ustaw jako FTP' };
  S.progAktualny = (auto, metoda, d) => {
    if (!auto) return { wartosc: null, zrodlo: 'Strefy własne' };
    const r = S.prog(metoda, d);
    return { wartosc: r && r.prog ? r.prog : null, zrodlo: S.METODY[metoda].nazwa };
  };
  S.PRZELACZNIKI = [{ klucz: 'ftpAuto', etykieta: 'Aktualizuj FTP z\u00a0jazd', ikona: 'arrows-clockwise' }];
  // strefy własne: 10–1500 W, żeby „Dostosuj ręcznie” z KAŻDEGO dozwolonego progu dawało poprawne strefy
  // (próg 30 → Z1 do 16 W; próg 750 → Z7 od 1126 W)
  S.ZAKRESY = { wlasne: [10, 1500] };
  const ROZNICA_MIN = 5;                                     // dłuższy wysiłek co najmniej o 5 min dłuższy

  // próg z danych metody: { prog, wprim? } albo { blad } (dane sprzeczne) albo null (brak danych)
  S.prog = (metoda, d) => {
    const m = S.METODY[metoda];
    if (!m || m.wymaga.some((k) => !(d[k] > 0))) return null;
    let prog, wprim;
    if (metoda === 'ftp') prog = d.ftp;
    else if (metoda === 'test20') prog = Math.round((19 * d.p20) / 20);          // 0,95 × P20 = 19/20 — dokładnie, bez 0,95 w zapisie binarnym
    else if (metoda === 'rampa') prog = Math.round((3 * d.pmin) / 4);           // 0,75 × P1min = 3/4
    else {
      if (d.t2 - d.t1 < ROZNICA_MIN) return { blad: `Różnica czasów min. ${ROZNICA_MIN} min` };
      if (d.w1 <= d.w2) return { blad: 'Krótszy wysiłek musi mieć wyższą moc' };
      // czasy w minutach — jednostka czasu skraca się w CP; W′ w dżulach = W·s, stąd × 60
      prog = Math.round((d.w2 * d.t2 - d.w1 * d.t1) / (d.t2 - d.t1));
      wprim = ((d.w1 - d.w2) * d.t1 * d.t2 * 60) / (d.t2 - d.t1);               // J
    }
    if (prog < S.PROG[0] || prog > S.PROG[1]) return { blad: `${m.prog} poza zakresem ${S.PROG[0]}–${S.PROG[1]} W` };
    return wprim == null ? { prog } : { prog, wprim };
  };
  // początki stref 2…7 (W) dla progu: górna granica strefy = floor(p% × próg / 100)
  S.zProgu = (prog) => S.PROCENTY.map((p) => Math.floor((p * prog) / 100) + 1);
  S.poczatki = (metoda, d) => { const r = S.prog(metoda, d); return r && r.prog ? S.zProgu(r.prog) : null; };
  // podpisy procentowe — z tej samej tablicy co granice
  S.procenty = () => { const p = S.PROCENTY; return E7.map((e, i) => (i === 0 ? `≤ ${p[0]}%` : i === p.length ? `> ${p[i - 1]}%` : `${p[i - 1]}–${p[i]}%`)); };

  // ── wspólne z tętnem (wspolne/strefy-tetna.js) — ten sam kształt danych, ta sama lista na stronie ──
  const N = E7.length - 1;
  S.poczatkiWlasne = (granice) => (granice && granice.length === N && granice.every((g) => Number.isInteger(g)) ? granice.map((g) => g + 1) : null);
  S.wiersze = (poczatki, opis) => opis.etykiety.map((e, i) => ({
    etykieta: e, nazwa: opis.nazwy[i],
    od: i === 0 ? null : poczatki[i - 1],
    do: i === opis.etykiety.length - 1 ? null : poczatki[i] - 1,
  }));
  S.strefa = (w, poczatki) => { let k = 0; while (k < poczatki.length && w >= poczatki[k]) k++; return k; };
  S.doWlasnych = (metoda, poczatki) => (poczatki ? poczatki.map((p) => p - 1) : null);
  S.sprawdzWlasne = (granice) => {
    const idx = (warunek) => granice.map((g, i) => (warunek(g, i) ? i : -1)).filter((i) => i >= 0);
    if (granice.every((g) => g == null)) return { blad: '', wartosc: null, zle: [] };
    if (granice.some((g) => g == null)) return { blad: 'Uzupełnij wszystkie granice', wartosc: null, zle: idx((g) => g == null) };
    const [od, do_] = S.ZAKRESY.wlasne;
    const poza = idx((g) => g < od || g + 1 > do_);
    if (poza.length) return { blad: `Zakres ${od}–${do_} W`, wartosc: null, zle: poza };
    const zle = [...new Set(granice.flatMap((g, i) => (i && g <= granice[i - 1] ? [i - 1, i] : [])))];
    if (zle.length) return { blad: 'Granice muszą rosnąć', wartosc: null, zle };
    return { blad: '', wartosc: granice.slice(), zle: [] };
  };
  S.sprawdzWejscie = (pole, tekst) => {
    const v = String(tekst == null ? '' : tekst).trim();
    if (!v) return { blad: '', wartosc: null };
    const [od, do_] = S.POLA[pole].zakres;
    if (!/^\d{1,4}$/.test(v)) return { blad: 'Nieprawidłowa wartość', wartosc: null };
    const n = +v;
    if (n < od || n > do_) return { blad: `Zakres ${od}–${do_} ${S.POLA[pole].jednostka}`, wartosc: null };
    return { blad: '', wartosc: n };
  };
  // błąd między polami (dwa wysiłki CP) — null, gdy brak danych albo wszystko w porządku.
  // Na liście stref zamiast niego stoi krótka informacja BRAK_RELACJA (pełny komunikat jest pod polami).
  S.BRAK_RELACJA = 'Wymaga poprawnych wysiłków';
  S.relacja = (metoda, d) => { const r = S.prog(metoda, d); return r && r.blad ? r.blad : null; };
  // kafelki wyniku pod polami metody: dziś tylko W′ przy CP (próg stoi w okienku „Moc progowa”, W/kg przy FTP)
  S.wynik = (metoda, d) => {
    if (metoda !== 'cp') return [];
    const r = S.prog(metoda, d), ok = !!(r && r.prog), kj = ok && r.wprim / 1000;
    // od 100 kJ (fizjologicznie niemożliwe — błąd we wpisie) bez ułamka, żeby liczba mieściła się w kafelku
    return [{ etykieta: 'W′', wartosc: ok ? kj.toFixed(kj < 100 ? 1 : 0).replace('.', ',') : '—', jednostka: ok ? 'kJ' : '' }];
  };

  S.DOMYSLNE = { auto: true, metoda: 'ftp', ftp: null, p20: null, pmin: null, t1: null, w1: null, t2: null, w2: null, wlasne: null, ftpAuto: false };
  S.poprawne = (u) => {
    if (u == null) return true;
    if (typeof u !== 'object' || typeof u.auto !== 'boolean' || !(u.metoda in S.METODY)) return false;
    for (const k of Object.keys(S.POLA)) if (u[k] != null && (!Number.isInteger(u[k]) || u[k] < S.POLA[k].zakres[0] || u[k] > S.POLA[k].zakres[1])) return false;
    if (u.ftpAuto != null && typeof u.ftpAuto !== 'boolean') return false;
    return u.wlasne == null || (Array.isArray(u.wlasne) && S.sprawdzWlasne(u.wlasne).wartosc !== null);
  };

  global.STREFY_MOC = S;
  if (typeof module !== 'undefined') module.exports = S;
})(typeof window !== 'undefined' ? window : globalThis);
