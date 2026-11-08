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
        h('h1', { text: `${A.powitanie()}, ${A.imie}` }),
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
