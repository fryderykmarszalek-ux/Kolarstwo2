/* Profil zawodnika: imię, nazwisko, płeć — JEDNO źródło dla całej strony.
 *
 * Ładowany zaraz po dane.js, a przed apka.js: zapisane imię musi być w K2.zawodnik,
 * zanim cokolwiek je przeczyta (np. powitanie „Dobry wieczór, Fryderyk” na pulpicie).
 *
 * Gdzie strona pokazuje profil, element dostaje atrybut data-profil:
 *   data-profil="imie" | "nazwisko" | "pelne" | "inicjaly"
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
 * 512×512 i zapisany jako JPEG (data URL, ok. 30–80 kB). null = brak zdjęcia, awatar pokazuje
 * inicjały. Każdy element z data-profil="inicjaly" jest awatarem i dostaje zdjęcie jako tło.
 */
(function (global) {
  'use strict';
  const K = global.K2;
  const KLUCZ = 'k2.profil';
  const MAKS = 30;
  const PLCIE = { m: 'Mężczyzna', k: 'Kobieta', n: 'Niezdefiniowana' };
  const DOMYSLNY = { imie: K.zawodnik.imie, nazwisko: K.zawodnik.nazwisko, plec: 'n', zdjecie: null };
  const BOK = 512;                 // bok zapisanego zdjęcia w pikselach — ostre nawet na Retinie w 72-pikselowym kółku
  const MAKS_ZDJ = 1500000;        // zapora na długość data URL (≈ 1,1 MB); 512×512 JPEG to zwykle 40–110 kB

  // litery (każdego alfabetu, z polskimi), a między nimi pojedyncza spacja, myślnik albo apostrof:
  // „Anna-Maria”, „O’Neill”, „Jan Paweł”. Bez cyfr i znaków.
  const WZOR = /^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u;

  const P = {};
  P.MAKS = MAKS;
  P.PLCIE = PLCIE;

  // spacje z brzegów out, podwójne spacje → jedna
  P.oczysc = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

  // '' = poprawne; inaczej komunikat do pokazania pod polem
  P.sprawdz = (pole, wartosc) => {
    const v = P.oczysc(wartosc);
    if (!v) return pole === 'imie' ? 'Wpisz imię.' : 'Wpisz nazwisko.';
    if (Array.from(v).length > MAKS) return `Najwyżej ${MAKS} znaków.`;
    if (!WZOR.test(v)) return 'Tylko litery, a między nimi spacja, myślnik albo apostrof.';
    return '';
  };

  P.inicjaly = (p) => {
    const pierwsza = (s) => (Array.from(P.oczysc(s))[0] || '').toLocaleUpperCase('pl');
    return (pierwsza(p.imie) + pierwsza(p.nazwisko)) || '?';
  };

  const zdjeciePoprawne = (z) => z == null || (typeof z === 'string' && z.startsWith('data:image/jpeg;base64,') && z.length < MAKS_ZDJ);

  function poprawny(p) {
    return p && typeof p === 'object' && !P.sprawdz('imie', p.imie) && !P.sprawdz('nazwisko', p.nazwisko) && p.plec in PLCIE && zdjeciePoprawne(p.zdjecie);
  }

  // Wybrany plik → kwadrat ze środka, 512×512, JPEG. Obietnica zwraca data URL albo błąd z komunikatem po polsku.
  // Orientację z aparatu (EXIF) przeglądarka uwzględnia sama przy rysowaniu <img>.
  P.przygotujZdjecie = (plik) => new Promise((ok, zle) => {
    const blad = (s) => zle(new Error(s));
    if (!plik) return blad('Nie wybrano pliku.');
    const naObraz = /^image\//.test(plik.type) || /\.(jpe?g|png|heic|heif|webp|gif|bmp|avif)$/i.test(plik.name || '');
    if (!naObraz) return blad('To nie jest zdjęcie. Wybierz plik JPG, PNG albo HEIC.');
    if (plik.size > 40e6) return blad('Plik jest za duży (ponad 40 MB).');
    const url = URL.createObjectURL(plik), img = new Image();
    img.onload = () => {
      const w = img.naturalWidth, h = img.naturalHeight, s = Math.min(w, h);
      if (!s) { URL.revokeObjectURL(url); return blad('Nie udało się odczytać tego zdjęcia.'); }
      const n = Math.min(BOK, s), c = document.createElement('canvas');
      c.width = c.height = n;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.fillStyle = '#fff'; x.fillRect(0, 0, n, n);            // przezroczysty PNG → białe tło, nie czarne
      x.drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, n, n);
      URL.revokeObjectURL(url);
      let d = c.toDataURL('image/jpeg', 0.86);
      if (d.length >= MAKS_ZDJ) d = c.toDataURL('image/jpeg', 0.7);
      if (!zdjeciePoprawne(d)) return blad('Nie udało się przygotować tego zdjęcia.');
      ok(d);
    };
    img.onerror = () => { URL.revokeObjectURL(url); blad('Nie udało się odczytać tego pliku. Wybierz JPG, PNG albo HEIC.'); };
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
      if (p && p.zdjecie === undefined) p.zdjecie = null;      // wpis sprzed zdjęć (12.11.2026) — dalej ważny
      if (poprawny(p)) return { imie: P.oczysc(p.imie), nazwisko: P.oczysc(p.nazwisko), plec: p.plec, zdjecie: p.zdjecie };
    } catch (e) { /* brak schowka albo zepsuty wpis — domyślne */ }
    return { ...DOMYSLNY };
  }

  let biezacy = wczytaj();

  // wartości wpisane tam, gdzie reszta strony już ich szuka
  function rozeslij() {
    K.zawodnik.imie = biezacy.imie;
    K.zawodnik.nazwisko = biezacy.nazwisko;
    K.zawodnik.plec = biezacy.plec;
    if (global.A) global.A.imie = biezacy.imie;
  }

  P.dane = () => ({ ...biezacy });

  P.odswiez = (korzen) => {
    const w = { imie: biezacy.imie, nazwisko: biezacy.nazwisko, pelne: `${biezacy.imie} ${biezacy.nazwisko}`, inicjaly: P.inicjaly(biezacy) };
    (korzen || document).querySelectorAll('[data-profil]').forEach((el) => {
      if (el.dataset.profil === 'inicjaly') return P.rysujAwatar(el, w.inicjaly, biezacy.zdjecie);
      const v = w[el.dataset.profil];
      if (v != null && el.textContent !== v) el.textContent = v;
    });
  };

  // zwraca { ok, trwale }; trwale = false, gdy przeglądarka nie dała zapisać (np. tryb prywatny)
  P.zapisz = (nowy) => {
    const p = { imie: P.oczysc(nowy.imie), nazwisko: P.oczysc(nowy.nazwisko), plec: nowy.plec, zdjecie: nowy.zdjecie === undefined ? biezacy.zdjecie : nowy.zdjecie };
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
