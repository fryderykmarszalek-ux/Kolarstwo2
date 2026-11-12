/* Trener Pro — jasny gabinet trenera: dzień na pierwszym planie, plan, tydzień, cele. */
(function () {
  'use strict';
  const K = K2, f = K.fmt, h = W.h, ik = A.ik;
  const F = K.forma, T = K.okresy.tydzien, M = K.okresy.miesiac, C = K.cel;
  const jutro = new Date(K.dzis.getFullYear(), K.dzis.getMonth(), K.dzis.getDate() + 1);

  // ───── pasek boczny i górny ─────
  document.querySelector('.tp-bok-cel').append(
    h('div', { class: 'tp-bok-cel-g' }, h('span', { text: `Cel ${C.rok}` }), h('b', { text: f.procent(C.udzial) })),
    h('div', { class: 'tp-grad-pasek' }, h('i', { style: { width: (C.udzial * 100).toFixed(1) + '%' } })),
    h('small', { text: `${f.liczba(C.teraz)} z ${f.liczba(C.km)} km · prognoza ${f.liczba(C.prognoza)}` }));
  document.querySelector('.tp-gora-p').append(
    h('span', { class: 'tp-pig' }, ik('calendar-blank', 'bold'), `${A.wielka(f.dzienTygKr(K.dzis))}, ${f.dataKrotka(K.dzis)}`),
    h('span', { class: 'tp-pig' }, ik('trend-up', 'bold'), 'Forma ', h('b', { text: f.liczba(F.ctl) })),
    h('span', { class: 'tp-pig' }, ik('battery-medium', 'bold'), 'Świeżość ', h('b', { text: f.znak(Math.round(F.tsb)) })));

  // ───── okno „Athlete’s profile” ─────
  // Natywny <dialog>: przeglądarka sama trzyma okno na wierzchu, blokuje resztę strony i obsługuje Esc.
  // Widoki w jednym oknie (atrybut data-widok-okna na <dialog>): „profil” z listą sekcji, „edycja”
  // i po jednym widoku na sekcję (rejestr „sekcje”). Każdy widok poza profilem ma na dole wspólne „Zapisz”.
  (function () {
    const okno = document.getElementById('tp-profil'), pole = document.querySelector('.tp-bok-ja'), html = document.documentElement;
    if (!okno || !pole || !okno.showModal || !window.P) return;
    const form = okno.querySelector('#tp-profil-form'), zapisz = okno.querySelector('[type="submit"]');
    const wejscia = { imie: form.querySelector('#tp-imie'), nazwisko: form.querySelector('#tp-nazwisko') };
    const plcie = [...form.querySelectorAll('[data-plec]')];
    const podglad = form.querySelector('[data-podglad="inicjaly"]');
    const kredka = form.querySelector('.tp-zdj-kredka'), usun = form.querySelector('.tp-zdj-usun');
    const menu = form.querySelector('.tp-zdj-menu'), plik = form.querySelector('.tp-zdj-plik'), zdjBlad = form.querySelector('#tp-zdj-b');
    const ur = { d: form.querySelector('#tp-ur-d'), m: form.querySelector('#tp-ur-m'), r: form.querySelector('#tp-ur-r') };
    const urGrupa = form.querySelector('.tp-data'), urBlad = form.querySelector('#tp-ur-b'), wiekEl = form.querySelector('#tp-wiek');
    let plec = 'n', zdjecie = null, start = null;      // start = stan profilu w chwili wejścia w edycję; zdjecie = robocze, do „Zapisz”
    const dotyk = window.matchMedia && matchMedia('(pointer: coarse)').matches;

    const widok = () => okno.dataset.widokOkna;
    // sekcje profilu: id → { tytul, form, otworz(), zmienione(), fokus() }. Zapis robi sama sekcja w „submit” swojego formularza.
    const sekcje = {};
    const tytulWidoku = okno.querySelector('#tp-tyt-widoku'), wstecz = okno.querySelector('.tp-okno-wstecz'), tresc = okno.querySelector('.tp-okno-tresc');
    const brudne = () => (widok() === 'edycja' ? zmienione() : sekcje[widok()] ? sekcje[widok()].zmienione() : false);
    const data = () => P.sprawdzDate(ur.d.value, ur.m.value, ur.r.value);
    // surowy zapis trzech pól — „zmienione” musi widzieć także datę wpisaną w połowie, nie tylko poprawną
    const urSurowo = () => `${+ur.d.value || ur.d.value}|${ur.m.value}|${ur.r.value}`;
    const urZDaty = (u) => (u ? `${+u.slice(8)}|${+u.slice(5, 7)}|${u.slice(0, 4)}` : '||');
    const stan = () => ({ imie: P.oczysc(wejscia.imie.value), nazwisko: P.oczysc(wejscia.nazwisko.value), plec, zdjecie, urodziny: data().wartosc });
    const zmienione = () => { const s = stan(); return !!start && (s.imie !== start.imie || s.nazwisko !== start.nazwisko || s.plec !== start.plec || s.zdjecie !== start.zdjecie || urSurowo() !== urZDaty(start.urodziny)); };

    function ustawPlec(k, fokus) {
      plec = k;
      plcie.forEach((b) => { const on = b.dataset.plec === k; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; if (on && fokus) b.focus(); });
    }
    function licznik(n) {
      const w = wejscia[n], l = form.querySelector(`#tp-${n}-l`), ile = Array.from(w.value).length;
      l.textContent = `${ile}/${P.MAKS}`;
      l.classList.toggle('pelny', ile >= P.MAKS);
    }
    function blad(n, tekst) {
      const w = wejscia[n];
      form.querySelector(`#tp-${n}-b`).textContent = tekst;
      w.classList.toggle('zly', !!tekst);
      if (tekst) w.setAttribute('aria-invalid', 'true'); else w.removeAttribute('aria-invalid');
    }
    function odswiezFormularz() {
      zapisz.disabled = !zmienione();
      // awatar w edycji pokazuje zmiany od razu (inicjały i zdjęcie); reszta strony dopiero po „Zapisz”
      P.rysujAwatar(podglad, P.inicjaly(stan()), zdjecie);
      usun.hidden = !zdjecie;                        // „Usuń profilowe” tylko wtedy, gdy jest co usuwać
      // wiek obok etykiety — tylko przy dacie poprawnej w całości
      const w = data().wartosc;
      wiekEl.textContent = w ? P.lata(P.wiek(w)) : '';
      ur.m.classList.toggle('pusty', !ur.m.value);   // „Miesiąc” w pustym wyborze szary jak podpowiedź w polu
    }
    function bladDaty(tekst) {
      urBlad.textContent = tekst;
      [ur.d, ur.m, ur.r].forEach((x) => x.classList.toggle('zly', !!tekst));
    }

    // ── zdjęcie profilowe: kredka → okienko → wybór pliku → podgląd ──
    const menuOtwarte = () => !menu.hidden;
    function zamknijMenu() { menu.hidden = true; kredka.setAttribute('aria-expanded', 'false'); }
    function otworzMenu() {
      zdjBlad.textContent = '';
      menu.hidden = false; kredka.setAttribute('aria-expanded', 'true');
      // okienko pod kredką, ale nigdy za prawą krawędzią okna
      const rzad = kredka.parentElement;
      menu.style.left = Math.max(0, Math.min(kredka.offsetLeft - 14, rzad.clientWidth - menu.offsetWidth)) + 'px';
    }
    kredka.addEventListener('click', () => { if (menuOtwarte()) zamknijMenu(); else otworzMenu(); });
    plik.addEventListener('change', async () => {
      const f = plik.files && plik.files[0];
      plik.value = '';                               // ten sam plik da się wybrać drugi raz
      if (!f) return;
      zamknijMenu();
      try { zdjecie = await P.przygotujZdjecie(f); zdjBlad.textContent = ''; }
      catch (e) { zdjBlad.textContent = e.message; }
      odswiezFormularz();
    });
    // „Usuń profilowe” najpierw pyta (prośba Fryderyka 12.11.2026). Tak = zdjęcie znika z podglądu; na stronie — po „Zapisz”.
    // Nie, Esc i dotknięcie obok okienka zostawiają wszystko jak było.
    const pyt = document.getElementById('tp-pyt-usun');
    usun.addEventListener('click', () => {
      if (!pyt || !pyt.showModal) { zdjecie = null; zdjBlad.textContent = ''; odswiezFormularz(); kredka.focus(); return; }
      pyt.returnValue = ''; pyt.showModal(); pyt.focus();     // fokus na samym okienku — bez obwódki na „Nie”
    });
    if (pyt) {
      pyt.querySelectorAll('[data-odp]').forEach((b) => b.addEventListener('click', () => pyt.close(b.dataset.odp)));
      pyt.addEventListener('click', (e) => {
        const r = pyt.getBoundingClientRect();
        if (e.target === pyt && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) pyt.close('nie');
      });
      pyt.addEventListener('close', () => {
        if (pyt.returnValue === 'tak') { zdjecie = null; zdjBlad.textContent = ''; odswiezFormularz(); kredka.focus(); }
        else if (!usun.hidden) usun.focus();
      });
    }
    // stuknięcie gdziekolwiek obok okienka je zamyka
    okno.addEventListener('pointerdown', (e) => { if (menuOtwarte() && !menu.contains(e.target) && !kredka.contains(e.target)) zamknijMenu(); }, true);

    function pokazWidok(w) {
      const sk = sekcje[w];
      okno.dataset.widokOkna = w;
      tytulWidoku.textContent = sk ? sk.tytul : 'Edytuj profil';
      zapisz.setAttribute('form', sk ? sk.form.id : form.id);    // jedno „Zapisz” w stopce — zawsze dla otwartego widoku
      if (sk) {
        start = null; zamknijMenu();
        sk.otworz();
        tresc.scrollTop = 0;
        (dotyk ? wstecz : sk.fokus()).focus();    // na dotyku fokus w polu otwierałby klawiaturę
      } else if (w === 'edycja') {
        start = P.dane();
        wejscia.imie.value = start.imie; wejscia.nazwisko.value = start.nazwisko;
        ['imie', 'nazwisko'].forEach((n) => { licznik(n); blad(n, ''); });
        ustawPlec(start.plec);
        zdjecie = start.zdjecie; zdjBlad.textContent = ''; zamknijMenu();
        const u = start.urodziny;
        ur.d.value = u ? String(+u.slice(8)) : ''; ur.m.value = u ? String(+u.slice(5, 7)) : ''; ur.r.value = u ? u.slice(0, 4) : '';
        bladDaty('');
        odswiezFormularz();
        tresc.scrollTop = 0;
        // na iPadzie/telefonie fokus w polu otwiera klawiaturę — tam fokus idzie na „wróć”
        (dotyk ? wstecz : wejscia.imie).focus();
      } else {
        start = null; zamknijMenu();
        okno.focus();      // fokus na samym oknie, nie na „Edit” — inaczej Safari rysuje wokół niego obwódkę
      }
    }

    // ── otwieranie i zamykanie ──
    pole.addEventListener('click', () => {
      if (okno.open) return;
      // strona pod oknem przestaje się przewijać; szerokość znikającego suwaka oddajemy marginesem, żeby nic nie skoczyło
      const suwak = window.innerWidth - html.clientWidth;
      html.classList.add('tp-okno-otwarte');
      if (suwak > 0) document.body.style.paddingRight = suwak + 'px';
      okno.dataset.widokOkna = 'profil'; start = null;
      okno.showModal();
      okno.focus();        // przeglądarka sama wskazałaby pierwszy przycisk („Edit”) i obrysowała go na niebiesko
    });
    okno.querySelector('.tp-okno-x').addEventListener('click', () => okno.close());   // × zamyka całe okno; niezapisane zmiany przepadają
    okno.querySelector('.tp-edytuj').addEventListener('click', () => pokazWidok('edycja'));
    wstecz.addEventListener('click', () => pokazWidok('profil'));
    okno.querySelectorAll('.tp-sekcja').forEach((b) => b.addEventListener('click', () => { if (sekcje[b.dataset.sekcja]) pokazWidok(b.dataset.sekcja); }));
    okno.querySelector('[data-akcja="anuluj"]').addEventListener('click', () => pokazWidok('profil'));
    // Esc w edycji i w sekcji cofa do profilu zamiast zamykać okno
    // (gdy otwarte jest okienko zdjęcia, Esc zamyka najpierw tylko je)
    okno.addEventListener('cancel', (e) => {
      if (widok() === 'profil') return;
      e.preventDefault();
      if (menuOtwarte()) { zamknijMenu(); kredka.focus(); } else pokazWidok('profil');
    });
    // dotknięcie przyciemnionego tła = zdarzenie na samym <dialog>, w punkcie poza jego prostokątem
    // (sam prostokąt nie wystarczy: kliknięcie z klawiatury ma współrzędne 0,0).
    // Przy niezapisanych zmianach tło NIE zamyka — przypadkowe stuknięcie obok nie kasuje tego, co wpisane.
    okno.addEventListener('click', (e) => {
      const r = okno.getBoundingClientRect();
      if (e.target === okno && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) && !brudne()) okno.close();
    });
    okno.addEventListener('close', () => { html.classList.remove('tp-okno-otwarte'); document.body.style.paddingRight = ''; start = null; });

    // ── pola imienia i nazwiska ──
    ['imie', 'nazwisko'].forEach((n) => {
      const w = wejscia[n];
      w.addEventListener('input', () => { licznik(n); if (w.classList.contains('zly')) blad(n, P.sprawdz(n, w.value)); odswiezFormularz(); });
      w.addEventListener('blur', () => { if (widok() === 'edycja' && w.value !== '') blad(n, P.sprawdz(n, w.value)); });
    });
    wejscia.imie.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); wejscia.nazwisko.focus(); } });

    // ── data urodzenia: dzień i rok same cyfry, miesiąc z listy; błąd pokazujemy dopiero po wyjściu z całej grupy ──
    [ur.d, ur.r].forEach((x) => x.addEventListener('input', () => {
      const c = x.value.replace(/\D/g, '');
      if (c !== x.value) x.value = c;
    }));
    [ur.d, ur.m, ur.r].forEach((x) => x.addEventListener(x === ur.m ? 'change' : 'input', () => {
      if (urBlad.textContent) bladDaty(data().blad);
      odswiezFormularz();
    }));
    urGrupa.addEventListener('focusout', (e) => { if (widok() === 'edycja' && !urGrupa.contains(e.relatedTarget)) bladDaty(data().blad); });
    ur.d.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ur.m.focus(); } });
    ur.r.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ur.r.blur(); } });

    // ── płeć: trzy opcje zawsze widoczne, na stałych miejscach; strzałki jak w każdej grupie wyboru ──
    plcie.forEach((b, i) => {
      b.addEventListener('click', () => { ustawPlec(b.dataset.plec); odswiezFormularz(); });
      b.addEventListener('keydown', (e) => {
        const krok = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!krok) return;
        e.preventDefault();
        ustawPlec(plcie[(i + krok + plcie.length) % plcie.length].dataset.plec, true); odswiezFormularz();
      });
    });

    // ── powiększenie awatara: dotknięcie kółka w profilu → to samo kółko duże na środku ekranu ──
    // Zamyka dotknięcie GDZIEKOLWIEK poza kółkiem (liczone po okręgu, nie po kwadracie — róg kwadratu to już tło) i Esc.
    const lupa = document.getElementById('tp-lupa'), lupaA = lupa && lupa.querySelector('.tp-lupa-a');
    if (lupa && lupa.showModal) {
      okno.querySelector('.tp-okno-awatar-p').addEventListener('click', () => { lupa.showModal(); lupa.focus(); });
      lupa.addEventListener('click', (e) => {
        const r = lupaA.getBoundingClientRect(), x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(x, y) > r.width / 2) lupa.close();
      });
      lupa.addEventListener('close', () => { if (okno.open) okno.focus(); });   // fokus na oknie, bez obwódki na awatarze
    }


    // ───── sekcja „Budowa ciała”: wzrost, masa, BMI ─────
    // BMI nie jest zapisywane — liczy się z pól na żywo. Ocena: wspolne/bmi.js (siatki WHO), wiek i płeć z profilu.
    (function () {
      const f = okno.querySelector('#tp-cialo-form');
      if (!f || !window.BMI) return;
      const pola = { wzrost: f.querySelector('#tp-wzrost'), masa: f.querySelector('#tp-masa') };
      const karta = f.querySelector('#tp-bmi'), kiedy = f.querySelector('#tp-cialo-kiedy');
      const opis = okno.querySelector('[data-sekcja-opis="cialo"]');
      let st = null;                               // stan w chwili wejścia w sekcję
      const tekst = (n) => (n == null ? '' : P.liczba(n));
      const norm = (v) => v.trim().replace('.', ',');
      const zmienione = () => !!st && (norm(pola.wzrost.value) !== tekst(st.wzrost) || norm(pola.masa.value) !== tekst(st.masa));
      const odczyt = (n) => P.sprawdzPomiar(n, pola[n].value);
      const blad = (n, t) => {
        f.querySelector(`#tp-${n}-b`).textContent = t;
        pola[n].classList.toggle('zly', !!t);
        if (t) pola[n].setAttribute('aria-invalid', 'true'); else pola[n].removeAttribute('aria-invalid');
      };
      // ocena BMI dla danych z profilu (data urodzenia, płeć) i podanych pomiarów
      const ocena = (wzrost, masa) => {
        const p = P.dane(), bmi = BMI.oblicz(wzrost, masa);
        return { bmi, o: BMI.ocen({ bmi, plec: p.plec, wiekMies: P.wiekMies(p.urodziny), wiekLat: P.wiek(p.urodziny) }), p };
      };
      const b1 = (n) => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');   // BMI i progi zawsze z jednym miejscem: „30,0”
      const IKONY = { dobrze: 'check-circle', uwaga: 'warning-circle', zle: 'warning' };

      // skala: cztery strefy na jednej liniowej osi BMI; koniec osi to nie granica, tylko miejsce, gdzie przestajemy rysować
      function skala(bmi, pr) {
        const od = pr.niedowaga - 6, do_ = pr.otylosc + 7, x = (v) => (100 * (A.clamp(v, od, do_) - od)) / (do_ - od);
        const strefy = [['Niedowaga', od, pr.niedowaga], ['Norma', pr.niedowaga, pr.nadwaga], ['Nadwaga', pr.nadwaga, pr.otylosc], ['Otyłość', pr.otylosc, do_]];
        return h('div', { class: 'tp-bmi-skala', role: 'img', 'aria-label': `Skala BMI: niedowaga poniżej ${b1(pr.niedowaga)}, norma do ${b1(pr.nadwaga)}, nadwaga do ${b1(pr.otylosc)}, powyżej otyłość. Twój wynik: ${b1(bmi)}.` },
          h('div', { class: 'tp-bmi-tor' },
            ...strefy.map(([n, a, b], i) => h('i', { class: i === 1 ? 'norma' : '', style: { left: x(a) + '%', width: x(b) - x(a) + '%' } })),
            h('b', { class: 'tp-bmi-znak', style: { left: x(bmi) + '%' } })),
          h('div', { class: 'tp-bmi-progi' }, ...[pr.niedowaga, pr.nadwaga, pr.otylosc].map((v) => h('span', { style: { left: x(v) + '%' }, text: b1(v) }))),
          h('div', { class: 'tp-bmi-strefy' }, ...strefy.map(([n, a, b]) => h('span', { style: { left: (x(a) + x(b)) / 2 + '%' }, text: n }))));
      }
      const info = (ikona, ...dzieci) => h('p', { class: 'tp-bmi-info' }, ik(ikona), h('span', null, ...dzieci));

      function rysujBmi() {
        const w = odczyt('wzrost').wartosc, m = odczyt('masa').wartosc, { bmi, o, p } = ocena(w, m);
        karta.dataset.stan = o.stan;
        if (!bmi) {
          const czego = !w && !m ? 'Wpisz wzrost i masę ciała.' : !w ? 'Brakuje jeszcze wzrostu.' : 'Brakuje jeszcze masy ciała.';
          karta.replaceChildren(h('div', { class: 'tp-bmi-pusty' }, h('span', { class: 'tp-bmi-pusty-ik', 'aria-hidden': 'true' }, ik('calculator')),
            h('div', null, h('b', { text: 'BMI policzy się samo' }), h('small', { text: czego }))));
          return;
        }
        const glowa = h('div', { class: 'tp-bmi-g' }, h('div', { class: 'tp-bmi-l' }, h('small', { text: 'BMI' }), h('b', { text: b1(bmi) })));
        const zrodlo = (t) => h('p', { class: 'tp-bmi-zrodlo', text: t + ' BMI nie odróżnia mięśni od tłuszczu — to orientacja, nie diagnoza.' });
        if (o.stan !== 'ok') {
          const brak = {
            'brak-wieku': 'Żeby ocenić ten wynik, potrzebna jest data urodzenia — te same liczby znaczą co innego w wieku 15 i 40 lat. Dodasz ją w profilu, pod „Edit”.',
            'brak-plci': 'W wieku 13–18 lat ocena zależy od płci: WHO ma osobne siatki dla chłopców i dziewcząt. Wybierz płeć w profilu, pod „Edit”.',
            'poza-wiekiem': 'Ocena jest dostępna dla wieku od 13 do 99 lat.',
          }[o.stan];
          karta.replaceChildren(glowa, info('info', brak), zrodlo('Wzór: masa [kg] ÷ wzrost [m]².'));
          return;
        }
        glowa.append(h('span', { class: 'tp-bmi-werdykt', 'data-poziom': o.poziom }, ik(IKONY[o.poziom], 'fill'), o.nazwa));
        const zakres = `${b1(o.progi.niedowaga)}–${b1(o.progi.nadwaga)}`;
        let zdanie, skad;
        if (o.zrodlo === 'who2007') {
          const c = Math.round(o.centyl), skrajny = c < 1 || c > 99;
          zdanie = h('p', { class: 'tp-bmi-opis' }, `${p.plec === 'm' ? 'Dla chłopaka' : 'Dla dziewczyny'} w wieku ${P.wiekSlownie(p.urodziny)} norma to BMI `, h('b', { text: zakres }), '. ',
            skrajny ? ['Twój wynik jest ', h('b', { text: c < 1 ? 'poniżej 1. centyla' : 'powyżej 99. centyla' }), ' próby wzorcowej WHO.']
              : ['Twój wynik to ', h('b', { text: c + '. centyl' }), `: na 100 rówieśników z próby wzorcowej WHO ${c} ma BMI niższe.`]);
          skad = 'Źródło: siatki WHO 2007 dla wieku 5–19 lat (wiek co do miesiąca, osobno dla płci).';
        } else {
          zdanie = h('p', { class: 'tp-bmi-opis' }, 'Dla dorosłych norma to BMI ', h('b', { text: '18,5–24,9' }), ' — taka sama w każdym wieku i dla obu płci.');
          skad = 'Źródło: klasyfikacja WHO dla dorosłych.';
        }
        karta.replaceChildren(glowa, skala(bmi, o.progi), zdanie, zrodlo(skad));
      }
      function odswiez() { zapisz.disabled = !zmienione(); rysujBmi(); }

      // opis pod nazwą sekcji na liście — z danych ZAPISANYCH, nie z tego, co akurat wpisane
      function rysujOpis() {
        const p = P.dane(), { bmi, o } = ocena(p.wzrost, p.masa);
        const czesci = [p.wzrost != null ? `${P.liczba(p.wzrost)} cm` : null, p.masa != null ? `${P.liczba(p.masa)} kg` : null];
        opis.classList.toggle('pusty', p.wzrost == null && p.masa == null);
        if (p.wzrost == null && p.masa == null) opis.textContent = 'Wzrost, masa ciała i BMI — do uzupełnienia';
        else if (!bmi) opis.textContent = `${czesci[0] || czesci[1]} · ${p.wzrost == null ? 'wzrost' : 'masa ciała'} do uzupełnienia`;
        else opis.textContent = `${czesci.join(' · ')} · BMI ${b1(bmi)}${o.stan === 'ok' ? ' · ' + o.nazwa.toLowerCase() : ''}`;
      }

      ['wzrost', 'masa'].forEach((n) => {
        const w = pola[n];
        w.addEventListener('input', () => {
          const c = w.value.replace(/[^\d.,]/g, '');
          if (c !== w.value) w.value = c;
          if (w.classList.contains('zly')) blad(n, odczyt(n).blad);
          odswiez();
        });
        w.addEventListener('blur', () => { if (widok() === 'cialo') blad(n, odczyt(n).blad); });
      });
      pola.wzrost.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); pola.masa.focus(); } });

      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const w = odczyt('wzrost'), m = odczyt('masa');
        blad('wzrost', w.blad); blad('masa', m.blad);
        if (w.blad || m.blad) { pola[w.blad ? 'wzrost' : 'masa'].focus(); return; }
        const wynik = P.zapisz({ wzrost: w.wartosc, masa: m.wartosc, cialoData: w.wartosc == null && m.wartosc == null ? null : P.dzis() });
        if (!wynik.ok) return;
        okno.classList.toggle('bez-zapisu', !wynik.trwale);
        pokazWidok('profil');
      });

      sekcje.cialo = {
        tytul: 'Budowa ciała', form: f, zmienione, fokus: () => pola.wzrost,
        otworz() {
          st = P.dane();
          pola.wzrost.value = tekst(st.wzrost); pola.masa.value = tekst(st.masa);
          blad('wzrost', ''); blad('masa', '');
          kiedy.textContent = st.cialoData ? `Ostatni zapis: ${f2(st.cialoData)}` : '';
          odswiez();
        },
      };
      const f2 = (iso) => new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8)).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
      window.addEventListener('k2:profil', rysujOpis);
      rysujOpis();
    })();

    // ── Zapisz: jedno dotknięcie zapisuje imię, nazwisko, płeć, zdjęcie i datę urodzenia naraz ──
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const s = stan();
      const bledy = { imie: P.sprawdz('imie', s.imie), nazwisko: P.sprawdz('nazwisko', s.nazwisko) };
      blad('imie', bledy.imie); blad('nazwisko', bledy.nazwisko);
      const pierwszy = ['imie', 'nazwisko'].find((n) => bledy[n]);
      if (pierwszy) { wejscia[pierwszy].focus(); return; }
      const bd = data().blad;
      bladDaty(bd);
      if (bd) { (ur.d.value && ur.m.value ? ur.r : ur.d.value ? ur.m : ur.d).focus(); return; }
      const w = P.zapisz(s);
      if (!w.ok) return;
      okno.classList.toggle('bez-zapisu', !w.trwale);   // tryb prywatny: zapis tylko do zamknięcia karty
      pokazWidok('profil');
    });
  })();

  // ───── „Jak nogi?” zmienia propozycję na jutro ─────
  const NOGI = [
    { k: 'swieze', s: 'Świeże', i: 'smiley', d: 8 },
    { k: 'normalnie', s: 'Normalnie', i: 'smiley-meh', d: 0 },
    { k: 'ciezkie', s: 'Ciężkie', i: 'smiley-sad', d: -10 },
    { k: 'bola', s: 'Bolą', i: 'bandaids', d: -22 },
  ];
  let nogi = 'normalnie';
  try { nogi = localStorage.getItem('k2.tp.nogi') || nogi; } catch (e) { /* bez pamięci */ }
  const plan = () => {
    const p = A.propozycja;
    if (nogi === 'bola') return { tytul: 'Dzień wolny', czas: '—', strefa: 'odpoczynek', ikona: 'moon-stars', bloki: [], opis: 'Bolące nogi to sygnał, żeby odpuścić. Spacer, rozciąganie i sen zrobią więcej niż rower.' };
    if (nogi === 'ciezkie') return { tytul: 'Regeneracja w Z1', czas: '40 min', strefa: 'Z1 · poniżej 128 bpm', ikona: 'wind', bloki: [[40, 1]], opis: 'Ciężkie nogi po sobotniej pętli. Bardzo lekko, wysoka kadencja, bez podjazdów.' };
    if (nogi === 'swieze') return Object.assign({}, p, { bloki: S.bloki, opis: p.opis + ' Nogi świeże — jeśli chcesz, dorzuć na końcu 3 × 1 min szybciej, ale bez szaleństw.' });
    return Object.assign({}, p, { bloki: S.bloki });
  };
  const gotowosc = () => A.clamp(A.gotowosc + NOGI.find((n) => n.k === nogi).d, 5, 99);

  // ───── pulpit ─────
  function kartaDnia(odswiezPlan) {
    const ringHost = h('div', { class: 'tp-dz-ring' }), opisG = h('p', { class: 'tp-dz-got-o' });
    const rysujRing = () => {
      const g = gotowosc();
      ringHost.replaceChildren(A.pierscienie([{ udzial: g / 100, klasa: 'tp-biel' }], { rozmiar: 132, grubosc: 12 }), h('div', { class: 'tp-dz-ring-t' }, h('b', { text: String(g) }), h('small', { text: 'gotowość' })));
      opisG.textContent = g >= 60 ? 'Gotowy na mocniejszy trening.' : g >= 35 ? 'Trenuj, ale z głową — zmęczenie jeszcze siedzi w nogach.' : 'Dziś lepiej odpocząć.';
    };
    const przyciski = NOGI.map((n) => {
      const b = h('button', { type: 'button', 'aria-pressed': String(n.k === nogi) }, ik(n.i, n.k === nogi ? 'fill' : 'regular'), n.s);
      b.addEventListener('click', () => {
        nogi = n.k; try { localStorage.setItem('k2.tp.nogi', nogi); } catch (e) { /* bez pamięci */ }
        przyciski.forEach((x, i) => { const on = NOGI[i].k === nogi; x.setAttribute('aria-pressed', String(on)); x.querySelector('i').className = (on ? 'ph-fill' : 'ph') + ' ph-' + NOGI[i].i; });
        rysujRing(); odswiezPlan();
      });
      return b;
    });
    rysujRing();
    return h('section', { class: 'tp-dzien s-c8' },
      h('div', { class: 'tp-dz-l' },
        h('p', { class: 'tp-dz-d', text: `${A.wielka(f.dzienTyg(K.dzis))}, ${f.data(K.dzis)}` }),
        h('h1', null, `${A.powitanie()}, `, h('span', { 'data-profil': 'imie', text: A.imie })),   // imię z profilu — zmienia się po zapisie
        h('p', { class: 'tp-dz-o', text: `${F.nazwa}. ${F.opis}` }),
        h('div', { class: 'tp-dz-st' },
          h('div', null, h('small', { text: 'Forma' }), h('b', { text: f.liczba(F.ctl) }), h('em', { text: `${f.znak(Math.round(F.zmiana7))} w 7 dni` })),
          h('div', null, h('small', { text: 'Zmęczenie' }), h('b', { text: f.liczba(F.atl) }), h('em', { text: 'ostatnie 7 dni' })),
          h('div', null, h('small', { text: 'Ten tydzień' }), h('b', { text: `${f.liczba(T.km)} km` }), h('em', { text: `${T.jazdy} ${A.odm(T.jazdy, 'jazda', 'jazdy', 'jazd')} · ${f.czasHM(T.czas)}` }))),
        h('div', { class: 'tp-nogi' }, h('span', { class: 'tp-nogi-p', text: 'Jak nogi po wczoraj?' }), h('div', { class: 'tp-nogi-b', role: 'group', 'aria-label': 'Jak nogi' }, przyciski))),
      h('div', { class: 'tp-dz-p' }, ringHost, opisG));
  }
  function kartaPlanu() {
    const host = S.karta(null, { klasa: 's-c4 tp-plan' });
    const rysuj = () => {
      const p = plan();
      host.replaceChildren(
        h('div', { class: 'tp-plan-g' }, h('span', { class: 'tp-plan-e', text: `Jutro · ${f.dzienTyg(jutro)}` }), h('span', { class: 's-chip plan', text: 'propozycja' })),
        h('div', { class: 'tp-plan-t' }, h('span', { class: 'tp-plan-i' }, ik(p.ikona, 'bold')), h('h2', { text: p.tytul })),
        S.profilTreningu(p.bloki),
        h('dl', { class: 'tp-plan-dl' }, h('div', null, h('dt', { text: 'Czas' }), h('dd', { text: p.czas })), h('div', null, h('dt', { text: 'Intensywność' }), h('dd', { text: p.strefa }))),
        h('p', { class: 'tp-plan-o' }, h('b', { text: 'Dlaczego? ' }), p.opis));
      W.typografia(host);
    };
    rysuj();
    return { el: host, rysuj };
  }
  function kartaTygodnia() {
    const body = h('div'); S.tydzien(body);
    const cele = h('div', { class: 'tp-wyk' }, A.wyzwania.map((w) => h('div', { class: 'tp-wyk-p' + (w.zrobione ? ' ok' : '') }, h('div', { class: 'tp-wyk-g' }, h('span', { text: w.nazwa }), h('b', { text: w.jedn ? `${f.liczba(w.wart)}/${w.cel}` : `${w.wart}/${w.cel}` })), h('div', { class: 'tp-grad-pasek' }, h('i', { style: { width: (w.udzial * 100).toFixed(0) + '%' } })))));
    const od = T.od, doo = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 6);
    return S.karta('Tydzień treningowy', { klasa: 's-c12', opis: `${f.dataKrotka(od)} – ${f.dataKrotka(doo)} · wykonane i zaplanowane`, akcje: [h('a', { class: 's-btn', href: '#kalendarz' }, 'Cały miesiąc', ik('arrow-right', 'bold'))] }, cele, body);
  }
  function kartaCeli() {
    const L = [
      { n: 'Tydzień', w: T.km, c: 200, g: 'tp-g1', kol: '#14B8A6' },
      { n: 'Listopad', w: M.km, c: 600, g: 'tp-g2', kol: '#3B82F6' },
      { n: `Rok ${C.rok}`, w: C.teraz, c: C.km, g: 'tp-g3', kol: '#7C5CFA' },
    ];
    const rings = A.pierscienie(L.map((l) => ({ udzial: l.w / l.c, klasa: l.g })), { rozmiar: 150, grubosc: 13, odstep: 5, gradienty: [{ id: 'tp-g1', od: '#2DD4BF', do: '#14B8A6' }, { id: 'tp-g2', od: '#60A5FA', do: '#2563EB' }, { id: 'tp-g3', od: '#A78BFA', do: '#7C5CFA' }] });
    return S.karta('Cele kilometrowe', { klasa: 's-c4' }, h('div', { class: 'tp-cele' }, h('div', { class: 'tp-cele-r' }, rings),
      h('ul', null, L.map((l) => h('li', null, h('i', { style: { background: l.kol } }), h('span', null, h('b', { text: l.n }), h('small', { text: `${f.liczba(l.w)} z ${f.liczba(l.c)} km` })), h('em', { text: f.procent(Math.min(1, l.w / l.c)) }))))));
  }
  function kartaJazd() {
    const lista = K.jazdy.filter((j) => j.typ === 'szosa').slice(-4).reverse();
    return S.karta('Ostatnie trasy', { klasa: 's-c12', opis: 'Cztery ostatnie jazdy na szosie. Kliknij, żeby otworzyć analizę.', akcje: [h('a', { class: 's-btn', href: '#jazdy' }, 'Wszystkie', ik('arrow-right', 'bold'))] },
      h('div', { class: 'tp-trasy' }, lista.map((j) => {
        const m = j.typ === 'szosa' ? A.mapka(j, { w: 280, h: 150, pad: 16, drogi: true, cien: true }) : null;
        return h('a', { class: 'tp-trasa ' + j.typ, href: '#analiza/' + j.id },
          h('div', { class: 'tp-trasa-m' }, m || h('div', { class: 'tp-zw' }, ik('monitor-play', 'fill'), h('b', { text: `${j.moc} W` }), h('small', { text: `NP ${j.mocNP} W` }))),
          h('div', { class: 'tp-trasa-o' }, h('small', { text: `${A.wielka(f.dzienTygKr(j.data))} ${f.dataKrotka(j.data)} · ${j.typ === 'zwift' ? 'Zwift' : 'szosa'}` }), h('b', { text: j.nazwa.replace('Zwift · ', '') }),
            h('div', { class: 'tp-trasa-st' }, h('span', null, h('strong', { text: f.km(j.km) }), ' km'), h('span', null, h('strong', { text: f.czas(j.czas) })), h('span', null, h('strong', { text: f.liczba(j.predkosc, 1) }), ' km/h'))));
      })));
  }

  const widoki = S.widoki();
  widoki.pulpit = (host) => {
    const s = h('div', { class: 's-siatka' }); host.append(s);
    const kp = kartaPlanu();
    s.append(kartaDnia(kp.rysuj), kp.el, kartaTygodnia(), S.kartaPmc({ klasa: 's-c8', zakres: 90, wys: 230, opis: 'Ostatnie 90 dni.' }), kartaCeli(), kartaJazd());
  };

  const gora = document.querySelector('.tp-gora-t');
  S.router({
    kontener: document.getElementById('tresc'), widoki, domyslny: 'pulpit', tytul: 'Kolarstwo',
    tytuly: { pulpit: 'Dzisiaj', kalendarz: 'Kalendarz', jazdy: 'Jazdy', postepy: 'Postępy', analiza: 'Analiza jazdy' },
    poZmianie(id) {
      document.body.dataset.widok = id;
      const nag = document.querySelector('#tresc .s-widok > .s-nag-str');
      gora.replaceChildren(id === 'pulpit' ? h('div', { class: 's-nag-str' }, h('div', null, h('h1', { text: 'Dzisiaj' }), h('p', { text: 'Gotowość, plan na jutro i tydzień w jednym miejscu.' }))) : nag || h('div', { class: 's-okruszki' }, h('a', { href: '#jazdy', text: 'Jazdy' }), ik('caret-right', 'bold'), h('span', { text: 'Analiza jazdy' })));
      W.typografia(gora);
    },
  });
})();
