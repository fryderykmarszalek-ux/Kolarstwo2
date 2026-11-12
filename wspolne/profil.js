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
 */
(function (global) {
  'use strict';
  const K = global.K2;
  const KLUCZ = 'k2.profil';
  const MAKS = 30;
  const PLCIE = { m: 'Mężczyzna', k: 'Kobieta', n: 'Niezdefiniowana' };
  const DOMYSLNY = { imie: K.zawodnik.imie, nazwisko: K.zawodnik.nazwisko, plec: 'n' };

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

  function poprawny(p) {
    return p && typeof p === 'object' && !P.sprawdz('imie', p.imie) && !P.sprawdz('nazwisko', p.nazwisko) && p.plec in PLCIE;
  }

  function wczytaj() {
    try {
      const p = JSON.parse(global.localStorage.getItem(KLUCZ) || 'null');
      if (poprawny(p)) return { imie: P.oczysc(p.imie), nazwisko: P.oczysc(p.nazwisko), plec: p.plec };
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
      const v = w[el.dataset.profil];
      if (v != null && el.textContent !== v) el.textContent = v;
    });
  };

  // zwraca { ok, trwale }; trwale = false, gdy przeglądarka nie dała zapisać (np. tryb prywatny)
  P.zapisz = (nowy) => {
    const p = { imie: P.oczysc(nowy.imie), nazwisko: P.oczysc(nowy.nazwisko), plec: nowy.plec };
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
