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
    const brudne = () => {
      if (widok() === 'edycja') return zmienione();
      const sk = sekcje[widok()];
      return !!sk && (sk.zmienione() || (!!sk.rodzic && sekcje[sk.rodzic].zmienione()));
    };
    // ‹, Anuluj i Esc: z widoku-dziecka wracamy do rodzica (jego wpisane pola zostają), z reszty do profilu
    const cofnijWidok = () => { const sk = sekcje[widok()]; if (sk && sk.rodzic) pokazWidok(sk.rodzic, { powrot: true }); else pokazWidok('profil'); };
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

    function pokazWidok(w, opcje) {
      const sk = sekcje[w], powrot = !!(opcje && opcje.powrot);
      okno.dataset.widokOkna = w;
      tytulWidoku.textContent = sk ? sk.tytul : 'Edytuj profil';
      zapisz.setAttribute('form', sk ? sk.form.id : form.id);    // jedno „Zapisz” w stopce — zawsze dla otwartego widoku
      if (sk) {
        start = null; zamknijMenu();
        sk.otworz(powrot);
        if (!powrot) tresc.scrollTop = 0;
        if (powrot && sk.fokusPowrotu) sk.fokusPowrotu().focus();
        else (dotyk ? wstecz : sk.fokus()).focus();    // na dotyku fokus w polu otwierałby klawiaturę
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
    wstecz.addEventListener('click', cofnijWidok);
    okno.querySelectorAll('.tp-sekcja').forEach((b) => b.addEventListener('click', () => { if (sekcje[b.dataset.sekcja]) pokazWidok(b.dataset.sekcja); }));
    okno.querySelector('[data-akcja="anuluj"]').addEventListener('click', cofnijWidok);
    // Esc w edycji i w sekcji cofa do profilu zamiast zamykać okno
    // (gdy otwarte jest okienko zdjęcia, Esc zamyka najpierw tylko je)
    okno.addEventListener('cancel', (e) => {
      if (widok() === 'profil') return;
      e.preventDefault();
      if (menuOtwarte()) { zamknijMenu(); kredka.focus(); } else cofnijWidok();
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


    // ───── sekcja „Budowa ciała”: wzrost, masa, obwód talii (opcjonalny) ─────
    // Dwa przeliczniki na żywo, żaden wynik nie jest zapisywany: BMI (wspolne/bmi.js, WHO) i talia/wzrost
    // (wspolne/talia.js, NICE). Drugi działa tylko z obwodem talii; bez niego karta pokazuje, czego wymaga.
    (function () {
      const f = okno.querySelector('#tp-cialo-form');
      if (!f || !window.BMI || !window.TALIA) return;
      const POLA = ['wzrost', 'talia'];                 // masa nie jest polem — to ostatni pomiar z dziennika (przycisk niżej)
      const pola = { wzrost: f.querySelector('#tp-wzrost'), talia: f.querySelector('#tp-talia') };
      const masaPole = f.querySelector('#tp-masa-pole'), masaW = f.querySelector('#tp-masa-w');
      const masa = () => P.dane().masa;
      const karta = f.querySelector('#tp-bmi'), kartaT = f.querySelector('#tp-whtr'), kiedy = f.querySelector('#tp-cialo-kiedy');
      let st = null;                               // stan w chwili wejścia w sekcję
      const tekst = (n) => (n == null ? '' : P.liczba(n));
      const norm = (v) => v.trim().replace('.', ',');
      const zmienione = () => !!st && POLA.some((n) => norm(pola[n].value) !== tekst(st[n]));
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

      const b2 = (n) => n.toFixed(2).replace('.', ',');                              // talia/wzrost z dwoma miejscami: „0,45”
      const IKONA_BRAK = 'minus-circle';

      // skala: strefy na jednej liniowej osi; koniec osi to nie granica, tylko miejsce, gdzie przestajemy rysować.
      // Zielona jest wyłącznie strefa normy; progi podpisane liczbą, strefy nazwą.
      function skala({ od, do_, strefy, wynik, fmt, aria }) {
        const x = (v) => (100 * (A.clamp(v, od, do_) - od)) / (do_ - od);
        return h('div', { class: 'tp-bmi-skala', role: 'img', 'aria-label': aria },
          h('div', { class: 'tp-bmi-tor' },
            ...strefy.map(([n, a, b, norma]) => h('i', { class: norma ? 'norma' : '', style: { left: x(a) + '%', width: x(b) - x(a) + '%' } })),
            h('b', { class: 'tp-bmi-znak', style: { left: x(wynik) + '%' } })),
          h('div', { class: 'tp-bmi-progi' }, ...strefy.slice(1).map(([, a]) => h('span', { style: { left: x(a) + '%' }, text: fmt(a) }))),
          h('div', { class: 'tp-bmi-strefy' }, ...strefy.filter(([n]) => n).map(([n, a, b]) => h('span', { style: { left: (x(a) + x(b)) / 2 + '%' }, text: n }))));
      }
      const skalaBmi = (bmi, pr) => skala({ od: pr.niedowaga - 6, do_: pr.otylosc + 7, wynik: bmi, fmt: b1,
        strefy: [['Niedowaga', pr.niedowaga - 6, pr.niedowaga], ['Norma', pr.niedowaga, pr.nadwaga, true], ['Nadwaga', pr.nadwaga, pr.otylosc], ['Otyłość', pr.otylosc, pr.otylosc + 7]],
        aria: `Skala BMI: niedowaga poniżej ${b1(pr.niedowaga)}, norma do ${b1(pr.nadwaga)}, nadwaga do ${b1(pr.otylosc)}, powyżej otyłość. Wynik: ${b1(bmi)}.` });
      const skalaWhtr = (r) => skala({ od: 0.34, do_: 0.70, wynik: r, fmt: b2,
        strefy: [['', 0.34, TALIA.NORMA], ['Norma', TALIA.NORMA, TALIA.PODWYZSZONA, true], ['Podwyższony', TALIA.PODWYZSZONA, TALIA.WYSOKA], ['Wysoki', TALIA.WYSOKA, 0.70]],
        aria: `Skala talia do wzrostu: norma od 0,40 do 0,49, podwyższony od 0,50, wysoki od 0,60. Wynik: ${b2(r)}.` });
      const wsk = (etykieta, wartosc) => h('div', null, h('dt', { text: etykieta }), h('dd', { text: wartosc }));
      const glowaKarty = (etykieta, liczba) => h('div', { class: 'tp-bmi-g' }, h('div', { class: 'tp-bmi-l' }, h('small', { text: etykieta }), h('b', { text: liczba })));
      const werdykt = (o) => h('span', { class: 'tp-bmi-werdykt', 'data-poziom': o.poziom }, ik(o.poziom === 'brak' ? IKONA_BRAK : IKONY[o.poziom], 'fill'), o.nazwa);

      // Karta BMI ma zawsze ten sam szkielet: etykieta, liczba, werdykt; pod spodem skala i dwa wskaźniki.
      // Gdy czegoś brakuje, w miejscu werdyktu stoi krótka, wyszarzona informacja — bez zdań-wyjaśnień.
      function rysujBmi() {
        const w = odczyt('wzrost').wartosc, m = masa(), { bmi, o } = ocena(w, m);
        karta.dataset.stan = o.stan;
        const glowa = glowaKarty('BMI', bmi ? b1(bmi) : '—');
        if (o.stan !== 'ok') {
          const brak = {
            'brak-bmi': !w && !m ? 'Wymaga wzrostu i masy ciała' : !w ? 'Wymaga wzrostu' : 'Wymaga masy ciała',
            'brak-wieku': 'Ocena wymaga daty urodzenia',
            'brak-plci': 'Ocena wymaga podania płci',
            'poza-wiekiem': 'Ocena dla wieku 13–99 lat',
          }[o.stan];
          glowa.append(h('span', { class: 'tp-bmi-brak', text: brak }));
          karta.replaceChildren(glowa);
          return;
        }
        glowa.append(werdykt(o));
        const c = o.zrodlo === 'who2007' ? Math.round(o.centyl) : null;
        const lista = h('dl', { class: 'tp-bmi-wsk' }, wsk('Norma · WHO', `${b1(o.progi.niedowaga)}–${b1(o.progi.nadwaga - (o.zrodlo === 'who2007' ? 0 : 0.1))}`),
          c != null ? wsk('Centyl', c < 1 ? '< 1' : c > 99 ? '> 99' : String(c)) : null);
        karta.replaceChildren(glowa, skalaBmi(bmi, o.progi), lista);
      }

      // Druga karta: talia/wzrost (NICE). Ten sam szkielet co BMI. Pole talii jest opcjonalne, więc bez niego
      // karta stoi wyszarzona z „Wymaga obwodu talii” — przelicznik BMI działa niezależnie od niej.
      function rysujWhtr() {
        const w = odczyt('wzrost').wartosc, m = masa(), t = odczyt('talia').wartosc, p = P.dane();
        const o = TALIA.ocen({ talia: t, wzrost: w, bmi: BMI.oblicz(w, m), wiekLat: P.wiek(p.urodziny) });
        kartaT.dataset.stan = o.stan;
        const glowa = glowaKarty('WHtR', o.whtr != null ? b2(o.whtr) : '—');
        if (o.stan !== 'ok') {
          glowa.append(h('span', { class: 'tp-bmi-brak', text: {
            'brak-talii': 'Wymaga obwodu talii', 'brak-wzrostu': 'Wymaga wzrostu', 'brak-masy': 'Ocena wymaga masy ciała',
            'brak-wieku': 'Ocena wymaga daty urodzenia', 'bmi-35': 'Klasyfikacja dla BMI poniżej 35', 'poza-wiekiem': 'Ocena dla wieku 13–99 lat',
          }[o.stan] }));
          kartaT.replaceChildren(glowa);
          return;
        }
        glowa.append(werdykt(o));
        kartaT.replaceChildren(glowa, skalaWhtr(o.whtr),
          h('dl', { class: 'tp-bmi-wsk' }, wsk('Norma · NICE', '0,40–0,49'), wsk('Cel · NICE', `< ${P.liczba(o.cel)} cm`)));
      }
      function rysujMase() {
        const m = masa();
        masaPole.classList.toggle('pusty', m == null);
        masaW.replaceChildren(...(m == null ? [ik('plus', 'bold'), 'Dodaj'] : [h('b', { text: P.kg(m) }), h('small', { text: 'kg' })]));
      }
      function odswiez() { zapisz.disabled = !zmienione(); rysujMase(); rysujBmi(); rysujWhtr(); }
      masaPole.addEventListener('click', () => pokazWidok('waga'));

      POLA.forEach((n) => {
        const w = pola[n];
        w.addEventListener('input', () => {
          const c = w.value.replace(/[^\d.,]/g, '');
          if (c !== w.value) w.value = c;
          if (w.classList.contains('zly')) blad(n, odczyt(n).blad);
          odswiez();
        });
        w.addEventListener('blur', () => { if (widok() === 'cialo') blad(n, odczyt(n).blad); });
      });
      pola.wzrost.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); pola.talia.focus(); } });

      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = Object.fromEntries(POLA.map((n) => [n, odczyt(n)]));
        POLA.forEach((n) => blad(n, v[n].blad));
        const zly = POLA.find((n) => v[n].blad);
        if (zly) { pola[zly].focus(); return; }
        const nic = POLA.every((n) => v[n].wartosc == null);
        const wynik = P.zapisz({ wzrost: v.wzrost.wartosc, talia: v.talia.wartosc, cialoData: nic ? null : P.dzis() });
        if (!wynik.ok) return;
        okno.classList.toggle('bez-zapisu', !wynik.trwale);
        pokazWidok('profil');
      });

      sekcje.cialo = {
        tytul: 'Budowa ciała', form: f, zmienione, fokus: () => pola.wzrost,
        fokusPowrotu: () => masaPole,
        otworz(powrot) {
          if (powrot && st) { odswiez(); return; }          // powrót z dziennika: wpisane pola zostają, odświeża się masa i oceny
          st = P.dane();
          POLA.forEach((n) => { pola[n].value = tekst(st[n]); blad(n, ''); });
          kiedy.textContent = st.cialoData ? `Zaktualizowano ${f2(st.cialoData)}` : '';
          odswiez();
        },
      };
      const f2 = (iso) => new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8)).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
    })();

    // ───── sekcja „Strefy treningowe”: dwie podzakładki, Tętno i Moc ─────
    // Obie podzakładki to ten sam kalkulator (kalkulatorStref niżej) z innym modułem obliczeń: wspolne/strefy-tetna.js
    // i wspolne/strefy-mocy.js. Zapisujemy wyłącznie dane wejściowe (P.zapisz({ strefyTetna, strefyMocy })) —
    // granice liczą się przy wyświetlaniu.
    (function () {
      const f = okno.querySelector('#tp-strefy-form');
      if (!f) return;
      const taby = [...f.querySelectorAll('[role="tab"]')], pasek = f.querySelector('.tp-podzakladki-pasek');
      let aktywna = 'tetno';
      // pasek pod aktywną zakładką: pozycja i szerokość z jej napisu (ikona + tekst), przesuwa się animacją
      function ustawPasek() {
        const t = taby.find((b) => b.dataset.strefy === aktywna);
        if (!t.offsetWidth) return;
        // mierzone względem paska zakładek (getBoundingClientRect), nie offsetLeft — ten liczy się od różnych rodziców
        const baza = t.parentElement.getBoundingClientRect(), i = t.querySelector('i').getBoundingClientRect(), w = t.querySelector('span').getBoundingClientRect();
        const lewo = i.left - baza.left - 4, szer = w.right - i.left + 8;
        pasek.style.transform = `translateX(${lewo}px)`; pasek.style.width = szer + 'px';
      }
      function pokaz(k, fokus) {
        aktywna = k;
        taby.forEach((b) => { const on = b.dataset.strefy === k; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; if (on && fokus) b.focus();
          f.querySelector('#' + b.getAttribute('aria-controls')).hidden = !on; });
        ustawPasek();
      }
      taby.forEach((b, i) => {
        b.addEventListener('click', () => pokaz(b.dataset.strefy));
        b.addEventListener('keydown', (e) => {
          const krok = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!krok) return;
          e.preventDefault(); pokaz(taby[(i + krok + taby.length) % taby.length].dataset.strefy, true);
        });
      });
      if ('ResizeObserver' in window) new ResizeObserver(ustawPasek).observe(f.querySelector('.tp-podzakladki'));

      // ── kalkulator stref: JEDEN mechanizm dla tętna i mocy ──
      // S = moduł obliczeń (STREFY_HR, STREFY_MOC) — zna metody, pola, granice i komunikaty; tu jest tylko wygląd i zachowanie.
      // Przełącznik na górze: włączony = kafelki metod i tylko pola wybranej metody, wyłączony = strefy własne.
      // Lista stref jest jedna dla obu trybów — wyliczone liczby zamieniają się w pola na tych samych miejscach.
      // Pierwsza strefa nie ma dolnej granicy, ostatnia górnej; „do” strefy i „od” następnej to JEDNA granica.
      const KREDKA = (() => { const t = document.createElement('template');
        t.innerHTML = '<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"><path d="M12.6 3.9a1.6 1.6 0 0 1 2.3 0l1.2 1.2a1.6 1.6 0 0 1 0 2.3L7.4 16.1l-3.9.9.9-3.9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M11 5.5l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
        return () => t.content.firstElementChild.cloneNode(true); })();
      function kalkulatorStref(panel, S, id, poZmianie) {
        const WEJ = Object.keys(S.POLA), N = S.WLASNE.etykiety.length - 1;
        const pid = (k) => `tp-${id}-${k}`;
        const pustaGr = () => Array(N).fill(null);

        // ── budowa ──
        const el = {};
        el.auto = h('button', { class: 'tp-sk-auto', id: pid('auto'), type: 'button', role: 'switch', 'aria-checked': 'true' },
          h('span', { class: 'tp-sekcja-ik', 'aria-hidden': 'true' }, ik('calculator', 'bold')),
          h('span', { class: 'tp-sk-auto-t', text: 'Licz strefy automatycznie' }),
          h('span', { class: 'tp-przel', 'aria-hidden': 'true' }, h('i')));
        const kafle = Object.entries(S.METODY).map(([k, m]) => h('button', { type: 'button', role: 'radio', class: 'tp-sk-metoda', 'data-metoda': k },
          h('b', { text: m.nazwa }), h('small', { text: m.opis }), h('i', { class: 'ph-fill ph-check-circle', 'aria-hidden': 'true' })));
        const wej = {}, poleWej = {};
        WEJ.forEach((k) => {
          const d = S.POLA[k];
          wej[k] = h('input', { id: pid(k), type: 'text', inputmode: 'numeric', pattern: '[0-9]*', maxlength: String(String(d.zakres[1]).length), autocomplete: 'off',
            enterkeyhint: 'next', 'aria-describedby': pid(k) + '-b', 'aria-label': d.aria || null });
          poleWej[k] = h('div', { class: 'tp-pole', 'data-wej': k },
            h('div', { class: 'tp-pole-g' }, h('label', { for: pid(k), text: d.etykieta })),
            h('div', { class: 'tp-jedn tp-sk-jedn', 'data-jedn': d.jednostka }, wej[k], h('span', { 'aria-hidden': 'true', text: d.jednostka })),
            h('p', { class: 'tp-blad', id: pid(k) + '-b', role: 'alert' }));
        });
        el.dane = h('div', { class: 'tp-pola tp-sk-dane' }, ...WEJ.map((k) => poleWej[k]));
        el.rel = h('p', { class: 'tp-blad tp-sk-rel', id: pid('rel-b'), role: 'alert' });
        el.wynik = S.wynik ? h('dl', { class: 'tp-sk-wynik', 'aria-live': 'polite' }) : null;
        el.kalk = h('div', { class: 'tp-sk-kalk' },
          h('div', { class: 'tp-pole-g tp-sk-g' }, h('span', { id: pid('metoda-t'), text: 'Metoda' })),
          h('div', { class: 'tp-sk-metody', role: 'radiogroup', 'aria-labelledby': pid('metoda-t') }, ...kafle),
          el.dane, el.rel, el.wynik);
        el.recznie = h('button', { class: 'tp-sk-recznie', type: 'button' }, KREDKA(), h('span', { text: 'Dostosuj ręcznie' }));
        el.lista = h('div', { class: 'tp-sk-lista', id: pid('lista'), role: 'group', 'aria-labelledby': pid('strefy-t'), 'aria-describedby': pid('wl-b') });
        el.wlB = h('p', { class: 'tp-blad tp-sk-wl-b', id: pid('wl-b'), role: 'alert' });
        panel.replaceChildren(el.auto, el.kalk,
          h('div', { class: 'tp-sk-strefy-g' }, h('span', { class: 'tp-sk-g', id: pid('strefy-t'), text: `Strefy · ${S.JEDNOSTKA}` }), el.recznie),
          el.lista, el.wlB);

        // ── stan ──
        let st = null;                         // zapisane ustawienia w chwili wejścia w sekcję
        let auto = true, metoda = Object.keys(S.METODY)[0];
        let gr = pustaGr();                    // granice stref własnych: górne granice Z1…Z(n−1); null = puste pole
        let pokazBladWl = false;               // błąd stref własnych widać dopiero po wyjściu z listy albo przy „Zapisz”

        const tekstWej = (v) => (v == null ? '' : String(v));
        const normWej = (t) => (/^\d+$/.test(t.trim()) ? String(+t.trim()) : t.trim());
        const odczyt = (k) => S.sprawdzWejscie(k, wej[k].value);
        const widoczne = () => (auto ? S.METODY[metoda].wymaga : []);
        const dane = () => Object.fromEntries(WEJ.map((k) => [k, odczyt(k).wartosc]));   // błędne pole liczy się jak puste
        const poczatki = () => S.poczatki(metoda, dane());
        const relacja = () => (S.relacja ? S.relacja(metoda, dane()) : null);

        function bladWej(k, t) {
          panel.querySelector(`#${pid(k)}-b`).textContent = t;
          wej[k].classList.toggle('zly', !!t);
          if (t) wej[k].setAttribute('aria-invalid', 'true'); else wej[k].removeAttribute('aria-invalid');
        }

        // ── lista stref ──
        const pole = (s, i, gdzie, wartosc) => h('input', { type: 'text', inputmode: 'numeric', pattern: '[0-9]*', maxlength: String(String(S.ZAKRESY.wlasne[1]).length),
          autocomplete: 'off', enterkeyhint: 'next', class: 'tp-sk-wart', 'data-i': String(i), 'data-gdzie': gdzie, 'aria-label': `${s} ${gdzie}`, value: wartosc });
        function rysujListe() {
          const wl = !auto, m = wl ? S.WLASNE : S.METODY[metoda], n = m.etykiety.length;
          const pp = wl ? null : poczatki(), wiersze = pp ? S.wiersze(pp, m) : null, pr = wl ? null : S.procenty(metoda);
          el.lista.dataset.n = String(n);
          el.lista.classList.toggle('dlugie', m.etykiety.some((e) => e.length > 2));    // „Z5a”: nazwy wyrównane w jednej kolumnie
          const nagl = h('div', { class: 'tp-sk-w tp-sk-nagl', 'aria-hidden': 'true' }, h('span'), h('span'), h('span', { text: 'Od' }), h('span'), h('span', { text: 'Do' }));
          const rzad = m.etykiety.map((e, i) => {
            const pierwsza = i === 0, ostatnia = i === n - 1;
            let od = null, do_ = null;
            if (wl) {
              od = pierwsza ? null : pole(e, i - 1, 'od', gr[i - 1] == null ? '' : String(gr[i - 1] + 1));
              do_ = ostatnia ? null : pole(e, i, 'do', gr[i] == null ? '' : String(gr[i]));
            } else {
              const w = wiersze && wiersze[i];
              od = pierwsza ? null : h('span', { class: 'tp-sk-l', text: w ? String(w.od) : '—' });
              do_ = ostatnia ? null : h('span', { class: 'tp-sk-l', text: w ? String(w.do) : '—' });
            }
            const opis = wl || !wiersze ? `${e} ${m.nazwy[i]}` : `${e} ${m.nazwy[i]}: ${pierwsza ? `do ${wiersze[i].do}` : ostatnia ? `od ${wiersze[i].od}` : `${wiersze[i].od}–${wiersze[i].do}`} ${S.JEDNOSTKA}`;
            return h('div', { class: 'tp-sk-w', role: wl ? 'group' : null, 'aria-label': opis, 'data-z': `${n}-${i + 1}` },
              h('span', { class: 'tp-sk-pas', 'aria-hidden': 'true' }),
              h('span', { class: 'tp-sk-n', 'aria-hidden': wl ? null : 'true' }, h('b', null, h('span', { class: 'tp-sk-z', text: e }), h('span', { class: 'tp-sk-nazwa', text: m.nazwy[i] })),
                pr ? h('small', { text: pr[i] }) : null),
              h('span', { class: 'tp-sk-od' }, od),
              h('span', { class: 'tp-sk-kr', 'aria-hidden': 'true', text: pierwsza || ostatnia ? '' : '–' }),
              h('span', { class: 'tp-sk-do' }, do_));
          });
          let brak = null;
          if (!wl && !pp) {
            const k = S.METODY[metoda].wymaga.find((x) => dane()[x] == null);
            brak = h('p', { class: 'tp-sk-brak' }, ik('minus-circle', 'fill'), k ? S.POLA[k].brak : S.BRAK_RELACJA || '');
          }
          el.lista.classList.toggle('pusta', !!brak);
          el.lista.replaceChildren(...(brak ? [brak] : []), nagl, ...rzad);
          oznaczWlasne();
        }
        // błąd stref własnych: komunikat pod listą i czerwone pola (oba pola danej granicy — „do” i sąsiednie „od”)
        function oznaczWlasne() {
          const w = S.sprawdzWlasne(gr), widac = !auto && pokazBladWl && !!w.blad;
          el.wlB.textContent = widac ? w.blad : '';
          el.lista.querySelectorAll('.tp-sk-wart').forEach((x) => {
            const zly = widac && w.zle.includes(+x.dataset.i);
            x.classList.toggle('zly', zly);
            if (zly) x.setAttribute('aria-invalid', 'true'); else x.removeAttribute('aria-invalid');
          });
        }
        // kafelki wyniku (moc): próg, W′, W/kg — W/kg tylko przy znanej masie ciała
        function rysujWynik() {
          if (!el.wynik) return;
          const wyn = S.wynik(metoda, dane(), P.dane().masa);
          el.wynik.hidden = !wyn.length;
          el.wynik.classList.toggle('pusty', !!wyn.length && wyn[0].wartosc === '—');
          el.wynik.replaceChildren(...wyn.map((x) => h('div', null, h('dt', { text: x.etykieta }), h('dd', null, x.wartosc, x.jednostka ? h('small', { text: x.jednostka }) : null))));
        }
        function rysuj() {
          panel.dataset.tryb = auto ? 'auto' : 'wlasne';
          el.auto.setAttribute('aria-checked', String(auto));
          kafle.forEach((b) => { const on = b.dataset.metoda === metoda; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
          const wym = S.METODY[metoda].wymaga;
          WEJ.forEach((k) => { poleWej[k].hidden = !wym.includes(k); });
          el.dane.dataset.metoda = metoda;
          if (el.rel.textContent) el.rel.textContent = relacja() || '';
          rysujWynik(); rysujListe(); poZmianie();
        }

        // ── zmiany ──
        // „zmienione” porównuje to, co widać w polach (także wpisane w połowie), z tym, co zapisane
        const surowo = () => JSON.stringify([auto, metoda, ...WEJ.map((k) => normWej(wej[k].value)), gr]);
        const surowoZ = (u) => JSON.stringify([u.auto, u.metoda, ...WEJ.map((k) => tekstWej(u[k])), u.wlasne || pustaGr()]);
        const zmienione = () => !!st && surowo() !== surowoZ(st);

        function ustawAuto(on) {
          if (on === auto) return;
          // wyłączenie przy pustych strefach własnych: startują od tego, co policzył kalkulator
          if (!on && gr.every((g) => g == null)) { const pp = poczatki(); if (pp) gr = S.doWlasnych(metoda, pp); }
          auto = on; pokazBladWl = false;
          rysuj();
        }
        el.auto.addEventListener('click', () => ustawAuto(!auto));
        // „Dostosuj ręcznie”: wyliczone strefy przechodzą do własnych, kalkulator się wyłącza
        el.recznie.addEventListener('click', () => {
          const pp = poczatki();
          if (pp) gr = S.doWlasnych(metoda, pp);
          ustawAuto(false);
          el.auto.focus();
        });
        kafle.forEach((b, i) => {
          b.addEventListener('click', () => { metoda = b.dataset.metoda; rysuj(); });
          b.addEventListener('keydown', (e) => {
            const krok = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!krok) return;
            e.preventDefault(); const nb = kafle[(i + krok + kafle.length) % kafle.length]; metoda = nb.dataset.metoda; rysuj(); nb.focus();
          });
        });
        WEJ.forEach((k) => {
          const w = wej[k];
          w.addEventListener('input', () => {
            const c = w.value.replace(/\D/g, '');
            if (c !== w.value) w.value = c;
            if (w.classList.contains('zly')) bladWej(k, odczyt(k).blad);
            if (el.rel.textContent) el.rel.textContent = relacja() || '';
            rysujWynik(); rysujListe(); poZmianie();
          });
          w.addEventListener('blur', () => { if (widok() === 'strefy') bladWej(k, odczyt(k).blad); });
          w.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const wid = widoczne(), nast = wid[wid.indexOf(k) + 1];
            if (nast) wej[nast].focus(); else w.blur();
          });
        });
        // błąd między polami (dwa wysiłki CP) — po wyjściu z grupy pól
        el.dane.addEventListener('focusout', (e) => { if (S.relacja && widok() === 'strefy' && !el.dane.contains(e.relatedTarget)) el.rel.textContent = relacja() || ''; });
        // pola stref własnych: „do” strefy i „od” następnej to ta sama granica — wpisanie jednego uzupełnia drugie
        el.lista.addEventListener('input', (e) => {
          const x = e.target; if (!x.classList || !x.classList.contains('tp-sk-wart')) return;
          const c = x.value.replace(/\D/g, '');
          if (c !== x.value) x.value = c;
          const i = +x.dataset.i, od = x.dataset.gdzie === 'od';
          gr[i] = c === '' ? null : od ? +c - 1 : +c;
          const para = el.lista.querySelector(`.tp-sk-wart[data-i="${i}"][data-gdzie="${od ? 'do' : 'od'}"]`);
          if (para) para.value = gr[i] == null || gr[i] + (od ? 0 : 1) < 0 ? '' : String(gr[i] + (od ? 0 : 1));
          oznaczWlasne(); poZmianie();
        });
        el.lista.addEventListener('focusout', (e) => { if (!auto && widok() === 'strefy' && !el.lista.contains(e.relatedTarget)) { pokazBladWl = true; oznaczWlasne(); } });
        el.lista.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' || !e.target.classList.contains('tp-sk-wart')) return;
          e.preventDefault();
          const p = [...el.lista.querySelectorAll('.tp-sk-wart')], j = p.indexOf(e.target);
          if (p[j + 1]) p[j + 1].focus(); else e.target.blur();
        });

        return {
          zmienione,
          otworz(u) {
            st = u || { ...S.DOMYSLNE };
            auto = st.auto; metoda = st.metoda; gr = st.wlasne ? st.wlasne.slice() : pustaGr();
            WEJ.forEach((k) => { wej[k].value = tekstWej(st[k]); bladWej(k, ''); });
            el.rel.textContent = ''; pokazBladWl = false;
            rysuj();
          },
          // { u } do zapisu albo { fokus } — pole do poprawy. Pola widoczne muszą być poprawne;
          // błędne pole schowane (inna metoda) zostaje przy zapisanej wartości.
          doZapisu() {
            const wid = widoczne();
            wid.forEach((k) => bladWej(k, odczyt(k).blad));
            const zly = wid.find((k) => odczyt(k).blad);
            if (zly) return { fokus: wej[zly] };
            if (auto) { const r = relacja(); el.rel.textContent = r || ''; if (r) return { fokus: wej[S.METODY[metoda].wymaga[0]] }; }
            const sw = S.sprawdzWlasne(gr);
            if (!auto && sw.blad) { pokazBladWl = true; oznaczWlasne(); return { fokus: el.lista.querySelector('.tp-sk-wart.zly') }; }
            const wart = (k) => { const o = odczyt(k); return o.blad ? st[k] : o.wartosc; };
            return { u: { auto, metoda, ...Object.fromEntries(WEJ.map((k) => [k, wart(k)])), wlasne: sw.blad ? st.wlasne : sw.wartosc } };
          },
        };
      }

      const odswiezZapisz = () => { if (widok() === 'strefy') zapisz.disabled = !zmienione(); };
      const kalki = [
        ['tetno', 'strefyTetna', kalkulatorStref(f.querySelector('#tp-strefy-tetno'), window.STREFY_HR, 'hr', odswiezZapisz)],
        ['moc', 'strefyMocy', kalkulatorStref(f.querySelector('#tp-strefy-moc'), window.STREFY_MOC, 'pw', odswiezZapisz)],
      ];
      const zmienione = () => kalki.some(([, , k]) => k.zmienione());

      // ── zapis: tylko zakładki, w których coś się zmieniło; błąd najpierw w otwartej zakładce ──
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const nowy = {};
        for (const [zakl, klucz, k] of (aktywna === kalki[1][0] ? [kalki[1], kalki[0]] : kalki)) {
          if (!k.zmienione()) continue;
          const r = k.doZapisu();
          if (!r.u) { if (aktywna !== zakl) pokaz(zakl); if (r.fokus) r.fokus.focus(); return; }
          nowy[klucz] = r.u;
        }
        const wynik = P.zapisz(nowy);
        if (!wynik.ok) return;
        okno.classList.toggle('bez-zapisu', !wynik.trwale);
        pokazWidok('profil');
      });

      sekcje.strefy = {
        tytul: 'Strefy treningowe', form: f, zmienione,
        fokus: () => taby.find((b) => b.dataset.strefy === aktywna),
        otworz() {
          const d = P.dane();
          kalki.forEach(([, klucz, k]) => k.otworz(d[klucz]));
          pokaz(aktywna); requestAnimationFrame(ustawPasek);
        },
      };
    })();

    // ───── dziennik masy ciała ─────
    // Pomiary { d, kg } — jeden na dzień, dodawane nieregularnie. Zmiany (dodanie, poprawka, usunięcie) są robocze
    // do wspólnego „Zapisz”; Anuluj, ‹ i Esc je porzucają. Oś pozioma to PRAWDZIWY czas: odstęp między punktami
    // jest proporcjonalny do liczby dni, a przerwa dłuższa niż PRZERWA_DNI rysuje się przerywaną linią.
    (function () {
      const f = okno.querySelector('#tp-waga-form'), arkusz = document.getElementById('tp-pomiar');
      if (!f || !arkusz || !arkusz.showModal) return;
      const PRZERWA_DNI = 30, DZIEN = 864e5;
      const ZAKRESY = { '3m': 92, '1r': 366, all: null };
      const el = {
        liczba: f.querySelector('#tp-waga-liczba'), data: f.querySelector('#tp-waga-data'), zm: f.querySelector('#tp-waga-zm'),
        wyk: f.querySelector('#tp-waga-wyk'), stat: f.querySelector('#tp-waga-stat'), lista: f.querySelector('#tp-waga-lista'),
        dodaj: f.querySelector('.tp-waga-dodaj'), zakres: [...f.querySelectorAll('[data-zakres]')],
        toast: f.querySelector('#tp-toast'), toastT: f.querySelector('#tp-toast-t'), cofnij: f.querySelector('#tp-toast-cofnij'),
      };
      const ar = {
        form: arkusz.querySelector('form'), tytul: arkusz.querySelector('#tp-pomiar-t'), d: arkusz.querySelector('#tp-pomiar-d'), kg: arkusz.querySelector('#tp-pomiar-kg'),
        db: arkusz.querySelector('#tp-pomiar-db'), kgb: arkusz.querySelector('#tp-pomiar-kgb'), jest: arkusz.querySelector('#tp-pomiar-jest'),
        ok: arkusz.querySelector('#tp-pomiar-ok'), usun: arkusz.querySelector('.tp-pomiar-usun'),
      };
      let robocze = [], st = [], zakres = 'all', wybrany = null, edytowany = null, cofnijDane = null, cofnijZegar = 0, rys = null;

      const doDnia = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8)) / DZIEN;
      const zDnia = (n) => new Date(n * DZIEN).toISOString().slice(0, 10);
      const dataPL = (iso, o) => new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8)).toLocaleDateString('pl-PL', o || { day: 'numeric', month: 'short', year: 'numeric' });
      const kg = (n) => P.kg(n);                                   // masa zawsze z jednym miejscem: „69,0”
      const znak = (n) => (n > 0.04 ? '+' : n < -0.04 ? '−' : '±') + P.kg(Math.abs(n));
      const zmienione = () => JSON.stringify(robocze) !== JSON.stringify(st);
      const odswiezZapisz = () => { if (widok() === 'waga') zapisz.disabled = !zmienione(); };

      // punkty widoczne w wybranym zakresie (licząc wstecz od dziś)
      const wZakresie = () => { const dni = ZAKRESY[zakres]; if (!dni) return robocze; const od = doDnia(P.dzis()) - dni; return robocze.filter((x) => doDnia(x.d) >= od); };
      const poprzedni = (x) => { const i = robocze.findIndex((y) => y.d === x.d); return i > 0 ? robocze[i - 1] : null; };

      // ── nagłówek: ostatni pomiar albo pomiar wskazany na wykresie ──
      function rysujNaglowek() {
        const x = wybrany || robocze[robocze.length - 1];
        el.liczba.textContent = x ? kg(x.kg) : '—';
        el.data.textContent = x ? dataPL(x.d) : '';
        f.classList.toggle('bez-pomiarow', !robocze.length);
        const p = x && poprzedni(x);
        el.zm.textContent = p ? `${znak(x.kg - p.kg)} kg od ${dataPL(p.d, { day: 'numeric', month: 'short' })}` : '';
        el.zm.hidden = !p;
        f.classList.toggle('wskazany', !!wybrany);
      }

      // ── wykres: linia z punktami na osi prawdziwego czasu ──
      function rysujWykres(szer) {
        const pts = wZakresie(), H = szer < 480 ? 190 : 230, m = { l: 14, r: 44, t: 18, b: 30 };
        el.wyk.replaceChildren();
        rys = null;
        if (!pts.length) {
          el.wyk.append(h('div', { class: 'tp-waga-pusto', style: { height: H + 'px' } }, h('span', { class: 'tp-waga-pusto-ik' }, ik('chart-line-up')),
            h('b', { text: robocze.length ? 'Brak pomiarów w tym okresie' : 'Brak pomiarów' })));
          return;
        }
        const dzis = doDnia(P.dzis()), dni = ZAKRESY[zakres];
        let x0 = dni ? dzis - dni : doDnia(pts[0].d), x1 = dzis;
        if (x1 - x0 < 28) x0 = x1 - 28;
        const v = pts.map((p) => p.kg), lo = Math.min(...v), hi = Math.max(...v), pad = Math.max(0.8, (hi - lo) * 0.22);
        const tk = W.ticki(lo - pad, hi + pad, szer < 480 ? 3 : 4), y0 = Math.min(tk[0], lo - pad * 0.6), y1 = Math.max(tk[tk.length - 1], hi + pad * 0.6);
        const X = W.skala(x0, x1, m.l + 10, szer - m.r - 10), Y = W.skala(y0, y1, H - m.b, m.t);
        const svg = W.svg('svg', { width: szer, height: H, viewBox: `0 0 ${szer} ${H}`, class: 'tp-waga-svg', role: 'img', tabindex: 0,
          'aria-label': `Masa ciała: ${pts.length} pomiarów od ${dataPL(pts[0].d)} do ${dataPL(pts[pts.length - 1].d)}, od ${kg(lo)} do ${kg(hi)} kg` });
        const defs = W.svg('defs', null, svg), gr = W.svg('linearGradient', { id: 'tp-waga-gr', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
        W.svg('stop', { offset: '0', class: 'tp-waga-gr-0' }, gr); W.svg('stop', { offset: '1', class: 'tp-waga-gr-1' }, gr);
        // siatka i oś Y po prawej
        const gs = W.svg('g', { class: 'tp-waga-siatka' }, svg);
        tk.filter((t) => t >= y0 && t <= y1).forEach((t) => {
          W.svg('line', { x1: m.l, x2: szer - m.r, y1: Y(t), y2: Y(t) }, gs);
          W.tekst(gs, szer - m.r + 8, Y(t) + 4, P.liczba(t), { class: 'tp-waga-os' });
        });
        // oś X: początki miesięcy (krótki zakres: tygodnie)
        const gx = W.svg('g', { class: 'tp-waga-osx' }, svg), znaczniki = [];
        if (x1 - x0 <= 45) {
          // krótki okres: podpisy co tydzień, a gdy na tydzień przypada mniej niż ~58 px — co dwa
          const krokD = (szer - m.l - m.r) / ((x1 - x0) / 7) < 58 ? 14 : 7;
          for (let d = Math.ceil(x0 / 7) * 7 + 4; d <= x1; d += krokD) znaczniki.push([d, dataPL(zDnia(d), { day: 'numeric', month: 'short' })]);
        }
        else {
          const a = new Date(x0 * DZIEN), mies = [];
          for (let r = a.getUTCFullYear(), k = a.getUTCMonth() + 1; ; k++) { const t = Date.UTC(r, k, 1) / DZIEN; if (t > x1) break; mies.push(t); }
          const krok = Math.max(1, Math.ceil(mies.length / Math.max(2, Math.floor((szer - m.l - m.r) / 64))));
          mies.filter((_, i) => i % krok === 0).forEach((t) => { const d = new Date(t * DZIEN), sty = d.getUTCMonth() === 0;
            znaczniki.push([t, d.toLocaleDateString('pl-PL', { month: 'short', timeZone: 'UTC' }).replace('.', '') + (sty ? ' ' + d.getUTCFullYear() : '')]); });
        }
        znaczniki.forEach(([d, t]) => { W.svg('line', { x1: X(d), x2: X(d), y1: H - m.b, y2: H - m.b + 5 }, gx); W.tekst(gx, X(d), H - 9, t, { 'text-anchor': 'middle' }); });
        W.svg('line', { x1: m.l, x2: szer - m.r, y1: H - m.b, y2: H - m.b, class: 'tp-waga-baza' }, gx);
        // dane: wypełnienie, odcinki (przerwa > 30 dni = przerywana), punkty
        const xy = pts.map((p) => [X(doDnia(p.d)), Y(p.kg)]), gd = W.svg('g', { class: 'tp-waga-dane' }, svg);
        let bieg = [xy[0]];
        const zamknijBieg = () => { if (bieg.length > 1) W.svg('path', { d: W.obszar(bieg, H - m.b), class: 'tp-waga-pole', fill: 'url(#tp-waga-gr)' }, gd); };
        for (let i = 1; i < xy.length; i++) { if (doDnia(pts[i].d) - doDnia(pts[i - 1].d) > PRZERWA_DNI) { zamknijBieg(); bieg = []; } bieg.push(xy[i]); }
        zamknijBieg();
        for (let i = 1; i < xy.length; i++) {
          const luka = doDnia(pts[i].d) - doDnia(pts[i - 1].d) > PRZERWA_DNI;
          W.svg('line', { x1: xy[i - 1][0], y1: xy[i - 1][1], x2: xy[i][0], y2: xy[i][1], class: 'tp-waga-linia' + (luka ? ' luka' : '') }, gd);
        }
        const krzyz = W.svg('line', { class: 'tp-waga-krzyz', y1: m.t - 6, y2: H - m.b, x1: 0, x2: 0, visibility: 'hidden' }, svg);
        // ostatni pomiar wyróżniony: większy, z pierścieniem w kolorze tła (bieżąca wartość)
        const kropki = xy.map(([x, y], i) => W.svg('circle', { cx: x, cy: y, r: i === xy.length - 1 ? 6 : 4, class: 'tp-waga-pkt' + (i === xy.length - 1 ? ' ost' : '') }, gd));
        const wyb = W.svg('circle', { r: 7, class: 'tp-waga-wyb', cx: 0, cy: 0, visibility: 'hidden' }, svg);
        el.wyk.append(svg);
        rys = { pts, xy, kropki, krzyz, wyb, svg };
        zaznacz(wybrany);
      }
      // zaznaczenie zmienia atrybuty, nie przerysowuje wykresu (bez migania animacji)
      function zaznacz(x) {
        wybrany = x && rys && rys.pts.includes(x) ? x : null;
        if (rys) {
          const i = wybrany ? rys.pts.indexOf(wybrany) : -1;
          [rys.krzyz, rys.wyb].forEach((e) => e.setAttribute('visibility', i < 0 ? 'hidden' : 'visible'));
          if (i >= 0) { rys.krzyz.setAttribute('x1', rys.xy[i][0]); rys.krzyz.setAttribute('x2', rys.xy[i][0]); rys.wyb.setAttribute('cx', rys.xy[i][0]); rys.wyb.setAttribute('cy', rys.xy[i][1]); }
          rys.svg.classList.toggle('wskazany', i >= 0);
        }
        rysujNaglowek();
      }
      const najblizszy = (px) => { let b = 0; rys.xy.forEach(([x], i) => { if (Math.abs(x - px) < Math.abs(rys.xy[b][0] - px)) b = i; }); return rys.pts[b]; };
      W.wskazuj(el.wyk, (e) => { if (!rys) return; const r = rys.svg.getBoundingClientRect(); zaznacz(najblizszy(e.clientX - r.left)); }, () => zaznacz(null));
      el.wyk.addEventListener('keydown', (e) => {
        if (!rys || !['ArrowLeft', 'ArrowRight', 'Escape'].includes(e.key)) return;
        e.preventDefault(); if (e.key === 'Escape') { e.stopPropagation(); return zaznacz(null); }
        const i = wybrany ? rys.pts.indexOf(wybrany) : rys.pts.length;
        zaznacz(rys.pts[A.clamp(i + (e.key === 'ArrowLeft' ? -1 : 1), 0, rys.pts.length - 1)]);
      });

      // ── wskaźniki zakresu: zmiana, najniższa, najwyższa ──
      function rysujStat() {
        const pts = wZakresie();
        el.stat.hidden = pts.length < 2;
        if (pts.length < 2) return el.stat.replaceChildren();
        const v = pts.map((p) => p.kg), w = (e, t) => h('div', null, h('dt', { text: e }), h('dd', { text: t }));
        el.stat.replaceChildren(w('Zmiana', `${znak(v[v.length - 1] - v[0])} kg`), w('Min.', `${kg(Math.min(...v))} kg`), w('Maks.', `${kg(Math.max(...v))} kg`));
      }

      // ── lista: od najnowszego, pogrupowana miesiącami; wiersz otwiera edycję ──
      function rysujListe() {
        const grupy = new Map();
        [...robocze].reverse().forEach((x) => { const k = x.d.slice(0, 7); if (!grupy.has(k)) grupy.set(k, []); grupy.get(k).push(x); });
        el.lista.replaceChildren(...[...grupy].map(([k, xs]) => h('section', { class: 'tp-waga-mies' },
          h('h4', { text: A.wielka(dataPL(k + '-01', { month: 'long', year: 'numeric' }).replace(' r.', '')) }),
          h('ul', null, ...xs.map((x) => { const p = poprzedni(x);
            return h('li', null, h('button', { type: 'button', class: 'tp-waga-wiersz', 'data-d': x.d, 'aria-label': `${dataPL(x.d)}, ${kg(x.kg)} kg. Edytuj` },
              h('span', { class: 'tp-waga-dzien' }, h('b', { text: String(+x.d.slice(8)) }), h('small', { text: dataPL(x.d, { weekday: 'short' }).replace('.', '') })),
              h('span', { class: 'tp-waga-kg' }, h('b', { text: kg(x.kg) }), h('small', { text: 'kg' })),
              h('span', { class: 'tp-waga-roz', text: p ? znak(x.kg - p.kg) : '' }),
              ik('caret-right', 'bold', 'tp-waga-s'))); })))));
      }
      el.lista.addEventListener('click', (e) => { const b = e.target.closest('.tp-waga-wiersz'); if (b) otworzArkusz(robocze.find((x) => x.d === b.dataset.d)); });

      function rysujWszystko() {
        el.zakres.forEach((b) => { const on = b.dataset.zakres === zakres; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
        rysujNaglowek(); rysujStat(); rysujListe();
        if (el.wyk.clientWidth) rysujWykres(Math.round(el.wyk.clientWidth));
        odswiezZapisz();
      }
      W.rozmiar(el.wyk, (szer) => { if (widok() === 'waga') rysujWykres(szer); });
      el.zakres.forEach((b) => b.addEventListener('click', () => { zakres = b.dataset.zakres; wybrany = null; rysujWszystko(); }));

      // ── arkusz pomiaru: data (domyślnie dziś) + masa; ten sam dzień = zastąpienie ──
      function sprawdzArkusz(pokazBledy) {
        const d = P.sprawdzDzien(ar.d.value), m = P.sprawdzPomiar('masa', ar.kg.value), pusta = !ar.kg.value.trim();
        const kolizja = d.wartosc && robocze.find((x) => x.d === d.wartosc && (!edytowany || x.d !== edytowany.d));
        ar.jest.textContent = kolizja ? `Ten dzień ma już pomiar ${kg(kolizja.kg)} kg` : '';
        ar.ok.textContent = kolizja ? 'Zastąp' : edytowany ? 'Gotowe' : 'Dodaj';
        if (pokazBledy) {
          ar.db.textContent = d.blad; ar.d.classList.toggle('zly', !!d.blad);
          ar.kgb.textContent = pusta ? 'Wpisz masę ciała' : m.blad; ar.kg.classList.toggle('zly', pusta || !!m.blad);
        }
        return { d: d.wartosc, kg: pusta ? null : m.wartosc, ok: !!d.wartosc && !pusta && !m.blad };
      }
      function otworzArkusz(x) {
        edytowany = x || null;
        ar.tytul.textContent = x ? 'Edytuj pomiar' : 'Nowy pomiar';
        ar.d.max = P.dzis(); ar.d.value = x ? x.d : P.dzis();
        ar.kg.value = x ? kg(x.kg) : (robocze.length ? '' : '');
        ar.kg.placeholder = !x && robocze.length ? kg(robocze[robocze.length - 1].kg) : '';
        ar.usun.hidden = !x;
        [ar.db, ar.kgb].forEach((p) => { p.textContent = ''; }); [ar.d, ar.kg].forEach((i) => i.classList.remove('zly'));
        sprawdzArkusz(false);
        arkusz.showModal();
        (dotyk ? arkusz : ar.kg).focus();
      }
      el.dodaj.addEventListener('click', () => otworzArkusz(null));
      ar.d.addEventListener('input', () => sprawdzArkusz(!!ar.db.textContent));
      ar.d.addEventListener('change', () => sprawdzArkusz(!!ar.db.textContent));
      ar.kg.addEventListener('input', () => { const c = ar.kg.value.replace(/[^\d.,]/g, ''); if (c !== ar.kg.value) ar.kg.value = c; sprawdzArkusz(!!ar.kgb.textContent); });
      arkusz.querySelector('[data-odp="anuluj"]').addEventListener('click', () => arkusz.close());
      arkusz.addEventListener('click', (e) => { const r = arkusz.getBoundingClientRect(); if (e.target === arkusz && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) arkusz.close(); });
      ar.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const w = sprawdzArkusz(true);
        if (!w.ok) { (ar.d.classList.contains('zly') ? ar.d : ar.kg).focus(); return; }
        robocze = P.normujMasy([...robocze.filter((x) => x !== edytowany && x.d !== w.d), { d: w.d, kg: w.kg }]);
        wybrany = null; arkusz.close(); rysujWszystko();
      });
      ar.usun.addEventListener('click', () => {
        const x = edytowany; if (!x) return;
        cofnijDane = robocze; robocze = robocze.filter((y) => y !== x);
        wybrany = null; arkusz.close(); rysujWszystko();
        el.toastT.textContent = `Usunięto pomiar z ${dataPL(x.d, { day: 'numeric', month: 'short' })}`;
        el.toast.hidden = false; clearTimeout(cofnijZegar); cofnijZegar = setTimeout(() => { el.toast.hidden = true; }, 6000);
      });
      el.cofnij.addEventListener('click', () => { if (cofnijDane) { robocze = cofnijDane; cofnijDane = null; } el.toast.hidden = true; rysujWszystko(); });

      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const wynik = P.zapisz({ masy: robocze });
        if (!wynik.ok) return;
        okno.classList.toggle('bez-zapisu', !wynik.trwale);
        pokazWidok('cialo', { powrot: true });
      });

      sekcje.waga = {
        tytul: 'Masa ciała', form: f, rodzic: 'cialo', zmienione, fokus: () => el.dodaj,
        otworz() {
          st = P.dane().masy; robocze = st.map((x) => ({ ...x }));
          wybrany = null; edytowany = null; cofnijDane = null; el.toast.hidden = true;
          rysujWszystko();
          requestAnimationFrame(() => { if (el.wyk.clientWidth) rysujWykres(Math.round(el.wyk.clientWidth)); });
        },
      };
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
