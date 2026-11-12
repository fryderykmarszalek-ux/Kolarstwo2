/* Profil zawodnika: imię, nazwisko, płeć — JEDNO źródło dla całej strony.
 *
 * Ładowany zaraz po dane.js, a przed apka.js: zapisane imię musi być w K2.zawodnik,
 * zanim cokolwiek je przeczyta (np. powitanie „Dobry wieczór, Fryderyk” na pulpicie).
 *
 * Gdzie strona pokazuje profil, element dostaje atrybut data-profil:
 *   data-profil="imie" | "nazwisko" | "pelne" | "inicjaly" | "plec"
 * P.odswiez() wpisuje do nich aktualne wartości — po zapisie zmienia się WSZYSTKO
 * naraz, bez przeładowania strony. Nowe miejsce z imieniem = ten sam atrybut, nic więcej.
 *
 * Zapis: localStorage tej przeglądarki (klucz k2.profil). Strona jest statyczna i nie ma
 * dokąd zapisać na stałe; wspólny zapis dla wszystkich urządzeń dojdzie z serwerem.
 * Bez zapisu (brak localStorage) wartości domyślne z dane.js.
 *
 * Płeć: 'm' mężczyzna, 'k' kobieta, 'n' niezdefiniowana. Na razie nic nie znaczy —
 * decyzja Fryderyka z 12.11.2026, rola przyjdzie później.
 *
 * Zdjęcie profilowe (12.11.2026): kwadrat wycięty ze środka wybranego obrazu, zmniejszony do
 * 1024×1024 (do 12.11 było 512 — za mało na powiększenie) i zapisany jako JPEG (data URL). null = brak zdjęcia, awatar pokazuje
 * inicjały. Każdy element z data-profil="inicjaly" jest awatarem i dostaje zdjęcie jako tło.
 *
 * Data urodzenia (12.11.2026): 'RRRR-MM-DD' albo null. Na razie nic nie liczy — pójdzie do bazy
 * i do jednej z zakładek treningowych (decyzja Fryderyka). P.wiek() daje pełne lata.
 *
 * Pomiary ciała (12.11.2026): wzrost [cm] i masa [kg] jako liczby albo null, cialoData = dzień ostatniej
 * zmiany. BMI NIE jest zapisywane — liczy się z nich przy wyświetlaniu (wspolne/bmi.js).
 * Żadnych wartości domyślnych w repo: to dane osobowe, a repo jest publiczne.
 */
(function (global) {
  'use strict';
  const K = global.K2;
  const KLUCZ = 'k2.profil';
  const MAKS = 30;
  const PLCIE = { m: 'Mężczyzna', k: 'Kobieta', n: 'Niezdefiniowana' };
  const DOMYSLNY = { imie: K.zawodnik.imie, nazwisko: K.zawodnik.nazwisko, plec: 'n', zdjecie: null, urodziny: null, wzrost: null, masa: null, cialoData: null };
  const BOK = 1024;                // bok zapisanego zdjęcia w pikselach — ostre na Retinie także w powiększeniu (do 440 px na ekranie)
  const MAKS_ZDJ = 1500000;        // zapora na długość data URL (≈ 1,1 MB); 1024×1024 JPEG to zwykle 100–300 kB

  // litery (każdego alfabetu, z polskimi), a między nimi pojedyncza spacja, myślnik albo apostrof:
  // „Anna-Maria”, „O’Neill”, „Jan Paweł”. Bez cyfr i znaków.
  const WZOR = /^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u;

  const P = {};
  P.MAKS = MAKS;
  P.PLCIE = PLCIE;
  // podpis pod imieniem w oknie profilu — samo „Niezdefiniowana” pod nazwiskiem nie mówiłoby, czego dotyczy
  P.PLCIE_PODPIS = { m: 'Mężczyzna', k: 'Kobieta', n: 'Płeć niezdefiniowana' };

  // spacje z brzegów out, podwójne spacje → jedna
  P.oczysc = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

  // '' = poprawne; inaczej komunikat do pokazania pod polem
  P.sprawdz = (pole, wartosc) => {
    const v = P.oczysc(wartosc);
    if (!v) return pole === 'imie' ? 'Wpisz imię' : 'Wpisz nazwisko';
    if (Array.from(v).length > MAKS) return `Maksymalnie ${MAKS} znaków`;
    if (!WZOR.test(v)) return 'Dozwolone są tylko litery';
    return '';
  };

  P.inicjaly = (p) => {
    const pierwsza = (s) => (Array.from(P.oczysc(s))[0] || '').toLocaleUpperCase('pl');
    return (pierwsza(p.imie) + pierwsza(p.nazwisko)) || '?';
  };

  // ── data urodzenia: 'RRRR-MM-DD' albo null (nieustawiona) ──
  P.MIESIACE = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  const dzisISO = (d) => { d = d || new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const dniW = (r, m) => new Date(Date.UTC(r, m, 0)).getUTCDate();      // m = 1..12

  // trzy pola → { blad, wartosc }. Wszystkie puste = brak daty (wolno). Data musi istnieć w kalendarzu i nie być z przyszłości.
  P.sprawdzDate = (dzien, miesiac, rok, dzis) => {
    const d = String(dzien == null ? '' : dzien).trim(), m = String(miesiac == null ? '' : miesiac).trim(), r = String(rok == null ? '' : rok).trim();
    if (!d && !m && !r) return { blad: '', wartosc: null };
    if (!d || !m || !r) return { blad: 'Niepełna data', wartosc: null };
    if (!/^\d{1,2}$/.test(d) || +d < 1 || +d > 31) return { blad: 'Nieprawidłowy dzień', wartosc: null };
    if (!/^\d{1,2}$/.test(m) || +m < 1 || +m > 12) return { blad: 'Wybierz miesiąc', wartosc: null };
    if (!/^\d{4}$/.test(r)) return { blad: 'Nieprawidłowy rok', wartosc: null };
    if (+r < 1900) return { blad: 'Nieprawidłowy rok', wartosc: null };
    const n = dniW(+r, +m);
    if (+d > n) return { blad: 'Nieprawidłowa data', wartosc: null };
    const w = `${r}-${String(+m).padStart(2, '0')}-${String(+d).padStart(2, '0')}`;
    if (w > dzisISO(dzis)) return { blad: 'Data nie może być z przyszłości', wartosc: null };
    return { blad: '', wartosc: w };
  };
  const urodzinyPoprawne = (u) => u == null || (typeof u === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(u) && P.sprawdzDate(+u.slice(8), +u.slice(5, 7), u.slice(0, 4)).wartosc === u);

  P.dzis = () => dzisISO();
  // wiek w miesiącach tak, jak liczy go WHO: dni życia / 30,4375 (ułamkowy) — do siatek BMI 5–19 lat
  P.wiekMies = (u, dzis) => {
    if (!u) return null;
    const t = dzisISO(dzis), dni = (Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 1, +t.slice(8)) - Date.UTC(+u.slice(0, 4), +u.slice(5, 7) - 1, +u.slice(8))) / 864e5;
    return dni / 30.4375;
  };
  // „16 lat i 2 mies.” — do zdań o wieku
  P.wiekSlownie = (u, dzis) => {
    if (!u) return '';
    const t = dzisISO(dzis), lata = P.wiek(u, dzis);
    let m = (+t.slice(5, 7)) - (+u.slice(5, 7)) - (t.slice(8) < u.slice(8) ? 1 : 0);
    m = ((m % 12) + 12) % 12;
    return P.lata(lata) + (m ? ` i ${m} mies.` : '');
  };

  // ── pomiary ciała: wzrost w cm (100–250), masa w kg (20–300); null = nieuzupełnione ──
  const POMIARY = { wzrost: [100, 250, 'cm'], masa: [20, 300, 'kg'] };
  P.POMIARY = POMIARY;
  // tekst z pola → { blad, wartosc }. Przecinek albo kropka, najwyżej jedno miejsce po przecinku. Puste pole jest dozwolone.
  P.sprawdzPomiar = (pole, tekst) => {
    const v = String(tekst == null ? '' : tekst).trim().replace(',', '.');
    if (!v) return { blad: '', wartosc: null };
    const [od, do_] = POMIARY[pole], n = Number(v);
    if (pole === 'wzrost' && /^[12][.]\d{1,2}$/.test(v)) return { blad: 'Podaj wzrost w centymetrach', wartosc: null };
    if (!/^\d{1,3}(?:\.\d)?$/.test(v)) return { blad: 'Nieprawidłowa wartość', wartosc: null };
    if (n < od || n > do_) return { blad: `Zakres ${od}–${do_} ${POMIARY[pole][2]}`, wartosc: null };
    return { blad: '', wartosc: n };
  };
  const pomiarPoprawny = (pole, n) => n == null || (typeof n === 'number' && isFinite(n) && n >= POMIARY[pole][0] && n <= POMIARY[pole][1]);
  P.liczba = (n) => String(Math.round(n * 10) / 10).replace('.', ',');     // 68.5 → „68,5”

  // pełne lata na dziś (urodzeni 29 lutego kończą rok 1 marca w latach nieprzestępnych)
  P.wiek = (u, dzis) => {
    if (!u) return null;
    const t = dzisISO(dzis), r = +t.slice(0, 4) - +u.slice(0, 4);
    return t.slice(5) >= u.slice(5) ? r : r - 1;
  };
  P.lata = (n) => {
    if (n === 1) return '1 rok';
    const j = n % 10, d = n % 100;
    return `${n} ${j >= 2 && j <= 4 && (d < 12 || d > 14) ? 'lata' : 'lat'}`;
  };

  const zdjeciePoprawne = (z) => z == null || (typeof z === 'string' && z.startsWith('data:image/jpeg;base64,') && z.length < MAKS_ZDJ);

  function poprawny(p) {
    return p && typeof p === 'object' && !P.sprawdz('imie', p.imie) && !P.sprawdz('nazwisko', p.nazwisko) && p.plec in PLCIE && zdjeciePoprawne(p.zdjecie) && urodzinyPoprawne(p.urodziny)
      && pomiarPoprawny('wzrost', p.wzrost) && pomiarPoprawny('masa', p.masa) && (p.cialoData == null || /^\d{4}-\d{2}-\d{2}$/.test(p.cialoData));
  }

  // Wybrany plik → kwadrat ze środka, 512×512, JPEG. Obietnica zwraca data URL albo błąd z komunikatem po polsku.
  // Orientację z aparatu (EXIF) przeglądarka uwzględnia sama przy rysowaniu <img>.
  P.przygotujZdjecie = (plik) => new Promise((ok, zle) => {
    const blad = (s) => zle(new Error(s));
    if (!plik) return blad('Nie wybrano pliku');
    const naObraz = /^image\//.test(plik.type) || /\.(jpe?g|png|heic|heif|webp|gif|bmp|avif)$/i.test(plik.name || '');
    if (!naObraz) return blad('Nieobsługiwany format pliku');
    if (plik.size > 40e6) return blad('Maksymalny rozmiar pliku to 40 MB');
    const url = URL.createObjectURL(plik), img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight, s = Math.min(w, h);
      if (!s) { URL.revokeObjectURL(url); return blad('Nie udało się wczytać zdjęcia'); }
      const n = Math.min(BOK, s), c = document.createElement('canvas');
      c.width = c.height = n;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.fillStyle = '#fff'; x.fillRect(0, 0, n, n);            // przezroczysty PNG → białe tło, nie czarne
      x.drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, n, n);
      URL.revokeObjectURL(url);
      let d = c.toDataURL('image/jpeg', 0.86);
      if (d.length >= MAKS_ZDJ) d = c.toDataURL('image/jpeg', 0.7);
      if (!zdjeciePoprawne(d)) return blad('Nie udało się wczytać zdjęcia');
      ok(d);
    };
    img.onerror = () => { URL.revokeObjectURL(url); blad('Nieobsługiwany format pliku'); };
    img.src = url;
  });

  // Awatar: inicjały zawsze w tekście (czytnik ekranu, brak zdjęcia), zdjęcie jako tło na wierzchu.
  P.rysujAwatar = (el, inicjaly, zdjecie) => {
    if (el.textContent !== inicjaly) el.textContent = inicjaly;
    el.classList.toggle('ma-zdjecie', !!zdjecie);
    const tlo = zdjecie ? `url("${zdjecie}")` : '';
    if (el.style.backgroundImage !== tlo) el.style.backgroundImage = tlo;
  };

  function wczytaj() {
    try {
      const p = JSON.parse(global.localStorage.getItem(KLUCZ) || 'null');
      // wpis sprzed zdjęć, daty urodzenia albo pomiarów ciała — dalej ważny, brakujące pola są puste
      if (p) ['zdjecie', 'urodziny', 'wzrost', 'masa', 'cialoData'].forEach((k) => { if (p[k] === undefined) p[k] = null; });
      if (poprawny(p)) return { imie: P.oczysc(p.imie), nazwisko: P.oczysc(p.nazwisko), plec: p.plec, zdjecie: p.zdjecie, urodziny: p.urodziny, wzrost: p.wzrost, masa: p.masa, cialoData: p.cialoData };
    } catch (e) { /* brak schowka albo zepsuty wpis — domyślne */ }
    return { ...DOMYSLNY };
  }

  let biezacy = wczytaj();

  // wartości wpisane tam, gdzie reszta strony już ich szuka
  function rozeslij() {
    K.zawodnik.imie = biezacy.imie;
    K.zawodnik.nazwisko = biezacy.nazwisko;
    K.zawodnik.plec = biezacy.plec;
    K.zawodnik.urodziny = biezacy.urodziny;
    if (global.A) global.A.imie = biezacy.imie;
  }

  P.dane = () => ({ ...biezacy });

  P.odswiez = (korzen) => {
    const w = { imie: biezacy.imie, nazwisko: biezacy.nazwisko, pelne: `${biezacy.imie} ${biezacy.nazwisko}`, inicjaly: P.inicjaly(biezacy), plec: P.PLCIE_PODPIS[biezacy.plec] };
    (korzen || document).querySelectorAll('[data-profil]').forEach((el) => {
      if (el.dataset.profil === 'inicjaly') return P.rysujAwatar(el, w.inicjaly, biezacy.zdjecie);
      const v = w[el.dataset.profil];
      if (v != null && el.textContent !== v) el.textContent = v;
    });
  };

  // zwraca { ok, trwale }; trwale = false, gdy przeglądarka nie dała zapisać (np. tryb prywatny)
  P.zapisz = (nowy) => {
    // pola, których „nowy” nie podaje, zostają jak były — każda sekcja profilu zapisuje tylko swoje
    const p = { ...biezacy };
    Object.keys(DOMYSLNY).forEach((k) => { if (nowy[k] !== undefined) p[k] = nowy[k]; });
    p.imie = P.oczysc(p.imie); p.nazwisko = P.oczysc(p.nazwisko);
    if (!poprawny(p)) return { ok: false, trwale: false };
    biezacy = p;
    let trwale = true;
    try { global.localStorage.setItem(KLUCZ, JSON.stringify({ wersja: 1, ...p, zapisano: new Date().toISOString() })); }
    catch (e) { trwale = false; }
    rozeslij();
    P.odswiez();
    global.dispatchEvent(new CustomEvent('k2:profil', { detail: P.dane() }));
    return { ok: true, trwale };
  };

  // zapis z innej karty tej samej przeglądarki — ta karta też się aktualizuje
  global.addEventListener('storage', (e) => {
    if (e.key !== KLUCZ) return;
    biezacy = wczytaj(); rozeslij(); P.odswiez();
    global.dispatchEvent(new CustomEvent('k2:profil', { detail: P.dane() }));
  });

  rozeslij();
  P.odswiez();
  global.P = P;
})(window);
