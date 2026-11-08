/* TRENER — aplikacja */
(function () {
  'use strict';
  const K = window.K2, f = K.fmt, h = W.h, s = W.svg, ik = A.ik;
  const J = K.ostatnia.jazda, F = K.forma, C = K.cel, T = K.okresy.tydzien;
  const otworzJazde = (j) => A.arkusz(() => A.szczegolyJazdy(j), { tytul: j.nazwa });
  const klik = (el, fn) => { el.addEventListener('click', fn); el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); return el; };
  const czytaj = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const zapisz = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* prywatne okno */ } };

  // propozycja zależy od tego, jak się czujesz
  const PROP = {
    swieze: { tytul: 'Tempo: 3 × 10 minut', czas: 90, strefa: 'Z3', bpm: '147–158 bpm', opis: 'Nogi świeże mimo zmęczenia w danych — wykorzystaj to na odcinki w tempie, najlepiej na wale.', bloki: [[10, 1], [10, 2], [10, 3], [5, 1], [10, 3], [5, 1], [10, 3], [20, 2], [10, 1]] },
    ok: { tytul: 'Spokojna jazda w Z2', czas: 60, strefa: 'Z2', bpm: '129–146 bpm', opis: A.propozycja.opis, bloki: [[10, 1], [40, 2], [10, 1]] },
    zmeczone: { tytul: 'Regeneracja na luzie', czas: 40, strefa: 'Z1', bpm: 'poniżej 128 bpm', opis: 'Nogi mówią swoje. Krótko i bardzo lekko — tak, żeby dało się rozmawiać.', bloki: [[40, 1]] },
    bola: { tytul: 'Dzień wolny', czas: 0, strefa: '—', bpm: 'spacer, rozciąganie', opis: 'Ból to sygnał, nie wyzwanie. Odpocznij, jutro sprawdzimy jeszcze raz.', bloki: [] },
  };
  let nogi = czytaj('k2.trener.nogi') || 'ok';
  const NOGI = [['swieze', 'Świeże', 'smiley'], ['ok', 'W porządku', 'smiley-meh'], ['zmeczone', 'Zmęczone', 'smiley-sad'], ['bola', 'Bolą', 'bandaids']];

  function trening(p) {
    const suma = p.bloki.reduce((a, b) => a + b[0], 0) || 1;
    const nazwy = { 1: 'Z1 · luźno', 2: 'Z2 · wytrzymałość', 3: 'Z3 · tempo' };
    return h('div', { class: 'trening' },
      h('h2', { text: p.tytul }), h('p', { class: 'meta', text: p.czas ? `${p.czas} min · ${p.strefa} · ${p.bpm}` : p.bpm }),
      p.bloki.length ? h('div', { class: 'bloki', 'aria-hidden': 'true' }, p.bloki.map(([min, z]) => h('div', { class: 'z' + z, style: { flex: min + ' 1 0', height: (z === 1 ? 32 : z === 2 ? 58 : 88) + '%', opacity: z === 1 ? 0.55 : 1 } }))) : null,
      p.bloki.length ? h('ol', { class: 'kroki' }, p.bloki.map(([min, z], i) => h('li', null, h('b', { text: min + ' min' }), h('span', { text: nazwy[z] }), h('span', { text: i === 0 ? 'rozgrzewka' : i === p.bloki.length - 1 ? 'schłodzenie' : '' })))) : null,
      h('p', { class: 'sj-uwaga', text: `${p.opis} Plan liczony z formy (${f.liczba(F.ctl)}) i zmęczenia (${f.liczba(F.atl)}) — to sugestia, nie nakaz.` }));
  }

  // ───────── sztuka do kart tras (zamiast zdjęć) ─────────
  const PALETY = [['#2DD4BF', '#3B82F6'], ['#FB7185', '#F59E0B'], ['#818CF8', '#C084FC'], ['#34D399', '#0EA5E9'], ['#F97316', '#EC4899'], ['#60A5FA', '#A78BFA']];
  function kartaTrasy(j, i) {
    const [a, b] = PALETY[i % PALETY.length];
    const el = h('article', { class: 'trasa-karta dotyk', role: 'button', tabindex: 0, 'aria-label': j.nazwa });
    const id = 'tg' + j.id;
    const svg = s('svg', { class: 'sztuka', viewBox: '0 0 236 300', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' });
    const defs = s('defs', null, svg); const lg = s('linearGradient', { id, x1: 0, y1: 0, x2: 1, y2: 1 }, defs); s('stop', { offset: 0, 'stop-color': a }, lg); s('stop', { offset: 1, 'stop-color': b }, lg);
    const fl = s('filter', { id: id + 'f', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs); s('feGaussianBlur', { stdDeviation: 5 }, fl);
    s('rect', { width: 236, height: 300, fill: `url(#${id})` }, svg);
    for (let k = 0; k < 9; k++) s('circle', { cx: 190 - k * 6, cy: 60 + k * 4, r: 30 + k * 18, fill: 'none', stroke: '#fff', 'stroke-opacity': 0.07 + (k % 2) * 0.03 }, svg);
    const pts = K.trasaJazdy(j);
    if (pts) {
      const r = W.rzut(W.bbox(pts, 0.4), 236, 210, 26);
      const d = 'M' + pts.filter((_, q) => q % 2 === 0).map((p) => r(p).map((v) => v.toFixed(1)).join(',')).join('L');
      s('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 9, 'stroke-opacity': 0.35, filter: `url(#${id}f)`, 'stroke-linejoin': 'round' }, svg);
      s('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
      const st = r(pts[0]); s('circle', { cx: st[0], cy: st[1], r: 5, fill: '#fff' }, svg);
    }
    el.append(svg, h('span', { class: 'gora-z', text: `${f.km(j.km)} km` }), h('div', { class: 'pod' }, h('h3', { text: j.nazwa }), h('p', { text: `${A.wielka(f.kiedy(j.data))} · ${f.czasHM(j.czas)}` })));
    return klik(el, () => otworzJazde(j));
  }

  // ───────── ekran: Start ─────────
  function start(el) {
    const ustawienia = h('button', { class: 'okragly dotyk', type: 'button', 'aria-label': 'Profil i ustawienia' }, ik('gear-six'));
    ustawienia.addEventListener('click', () => { location.hash = 'profil'; });
    const aw = h('button', { class: 'okragly awatar dotyk', type: 'button', 'aria-label': 'Profil', text: 'FM' });
    aw.addEventListener('click', () => { location.hash = 'profil'; });
    const zrobione = A.wyzwania.filter((w) => w.zrobione).length;
    const tydzUdzial = A.wyzwania.reduce((a, w) => a + w.udzial, 0) / A.wyzwania.length;

    const kTydz = h('section', { class: 'karta', 'aria-label': 'Cele tygodnia' },
      h('div', { class: 'karta-t' }, h('span', { text: 'Wykorzystaj ten tydzień w pełni' }), ik('caret-right', 'bold')),
      A.pasek(tydzUdzial),
      h('div', { class: 'czipy' }, A.wyzwania.map((w) => h('div', { class: 'czip' + (w.zrobione ? ' ok' : '') },
        h('span', { class: 'kolko' }, w.zrobione ? ik('check', 'bold') : null),
        h('span', null, w.nazwa, h('small', { text: w.zrobione ? (w.opis || 'zrobione') : `${f.liczba(w.wart)} z ${f.liczba(w.cel)}${w.jedn ? ' ' + w.jedn : ''}` }))))));

    const pow = h('h1', { class: 'powitanie' }, h('span', { class: 'gr', text: A.powitanie() }), `, ${A.imie}.`, h('span', { class: 'dalej', text: zrobione >= 3 ? 'Świetny tydzień.' : 'Forma rośnie.' }));

    // gotowość + pytanie o nogi
    const gr = h('div', { class: 'pierscien-box' }, A.pierscienie([{ udzial: A.gotowosc / 100, gradient: 'gr-got' }], { rozmiar: 76, grubosc: 8, odstep: 0, gradienty: [{ id: 'gr-got', od: '#2DD4BF', do: '#3B82F6' }] }), h('b', null, String(A.gotowosc), h('small', { text: '%' })));
    const przyc = NOGI.map(([k, n, i]) => { const b = h('button', { type: 'button', 'aria-pressed': String(k === nogi) }, ik(i, k === nogi ? 'fill' : 'regular'), n); b.addEventListener('click', () => { nogi = k; zapisz('k2.trener.nogi', k); przyc.forEach((x, q) => { const on = x === b; x.setAttribute('aria-pressed', String(on)); x.querySelector('i').className = `${on ? 'ph-fill' : 'ph'} ph-${NOGI[q][2]}`; }); rysujPlan(); }); return b; });
    const kGot = h('section', { class: 'karta', 'aria-label': 'Gotowość' },
      h('div', { class: 'gotowosc' }, gr, h('div', null, h('h3', { text: `Gotowość · ${F.nazwa.toLowerCase()}` }), h('p', { text: `Liczone z formy i zmęczenia. Powiedz jeszcze, jak nogi — dopasuję plan.` }))),
      h('div', { class: 'nogi', role: 'group', 'aria-label': 'Jak nogi?' }, przyc));

    const kPlan = h('section', { class: 'karta kontynuuj', 'aria-label': 'Plan na jutro' });
    function rysujPlan() {
      const p = PROP[nogi];
      const btn = h('button', { class: 'wiersz-link', type: 'button' }, p.bloki.length ? 'Zobacz trening' : 'Dlaczego odpoczynek?', ik('caret-right', 'bold'));
      btn.addEventListener('click', () => A.arkusz(() => trening(p), { tytul: p.tytul }));
      kPlan.replaceChildren(
        A.dzisZaliczone ? h('span', { class: 'znacznik' }, ik('check-circle', 'fill'), `Dziś zaliczone · ${f.km(J.km)} km`) : null,
        h('h3', { style: { marginTop: A.dzisZaliczone ? '14px' : '0' } }, ik(p.bloki.length ? 'arrows-clockwise' : 'moon-stars', 'bold'), `Jutro: ${p.tytul.charAt(0).toLowerCase() + p.tytul.slice(1)}`),
        h('div', { class: 'info' }, ik('info', 'fill'), h('span', { text: p.czas ? `${p.czas} min w strefie ${p.strefa} (${p.bpm}). ${p.opis}` : p.opis })), btn);
    }
    rysujPlan();

    const kOst = klik(h('section', { class: 'karta dotyk', role: 'button', tabindex: 0, 'aria-label': 'Ostatnia jazda' },
      h('div', { class: 'karta-t' }, h('span', { text: 'Kontynuuj, gdzie skończyłeś' }), ik('caret-right', 'bold')),
      h('div', { class: 'wj', style: { padding: '14px 0 0' } }, h('div', { class: 'ikb' }, A.mapka(J, { w: 56, h: 56, pad: 6, drogi: true, cien: true })), h('div', null, h('h3', { text: J.nazwa }), h('p', { text: `Dziś ${f.godzina(J.data)} · ${f.czasHM(J.czas)} · ${f.liczba(J.predkosc, 1)} km/h` })), h('div', { class: 'km' }, f.km(J.km), h('small', { text: 'km' })))), () => otworzJazde(J));

    const kDni = h('section', { class: 'karta', 'aria-label': 'Ten tydzień' },
      h('div', { class: 'tydz' }, A.tydzienDni.map((d) => h('div', { class: `tdz ${d.typ || ''}${d.dzis ? ' dzis' : ''}${d.przyszly ? ' plan' : ''}` }, h('span', { text: f.dzienTygKr(d.data) }), h('div', { class: 'kk' }, d.typ ? ik('check', 'bold') : null), h('small', { text: d.km ? f.liczba(d.km) : d.przyszly ? PROP[nogi].strefa : '' })))));

    const trasy = K.jazdy.filter((j) => j.typ === 'szosa').slice(-6).reverse();
    const ileC = Math.round(C.udzial * 100);
    const kCel = h('section', { class: 'karta' }, h('div', { class: 'cel' },
      h('div', { class: 'pierscien-box' }, A.pierscienie([{ udzial: C.udzial, gradient: 'gr-cel' }], { rozmiar: 92, grubosc: 10, odstep: 0, gradienty: [{ id: 'gr-cel', od: '#2DD4BF', do: '#3B82F6' }] }), h('b', { text: ileC + '%' })),
      h('div', null, h('h3', null, f.liczba(C.teraz), h('small', { text: ` / ${f.liczba(C.km)} km` })), h('p', { text: `Cel na 2026. Wystarczy ${f.liczba(C.potrzebaNaTydzien)} km tygodniowo do końca roku — prognoza ${f.liczba(C.prognoza)} km.` }))));

    el.append(h('div', { class: 'gora-app' }, aw, h('span', { class: 'srodek', text: `Sezon 2026 · tydzień ${f.tydzienISO(K.dzis)}` }), ustawienia),
      h('div', { class: 'zaw' }, kTydz, pow, kGot, kPlan, h('div', { class: 'sekcja-t' }, h('h2', { text: 'Ten tydzień' }), h('span', { text: `${f.liczba(T.km)} km · ${T.jazdy} jazdy` })), kDni,
        kOst, h('div', { class: 'sekcja-t' }, h('h2', { text: 'Twoje trasy' }), h('span', { text: 'ostatnie 6' })), h('div', { class: 'karuzela trasy' }, trasy.map(kartaTrasy)), kCel));
  }

  // ───────── ekran: Jazdy ─────────
  function jazdy(el) {
    let filtr = 'wszystkie';
    const lista = h('div', { class: 'zaw' });
    const przyc = [['wszystkie', 'Wszystkie'], ['szosa', 'Szosa'], ['zwift', 'Zwift']].map(([k, n]) => { const b = h('button', { type: 'button', 'aria-pressed': String(k === filtr), text: n }); b.addEventListener('click', () => { filtr = k; przyc.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); rysuj(); }); return b; });
    el.append(h('header', { class: 'naglowek' }, h('h1', { text: 'Jazdy' }), h('p', { text: `${K.jazdy.length} jazd · ${f.liczba(K.okresy.wszystko.km)} km od sierpnia 2025` }), h('div', { class: 'segmenty-przelacz', role: 'group', 'aria-label': 'Rodzaj' }, przyc)), lista);
    function rysuj() {
      lista.replaceChildren();
      const jj = K.jazdy.filter((j) => filtr === 'wszystkie' || j.typ === filtr).slice(-36).reverse();
      let mies = null, karta = null;
      for (const j of jj) {
        const m = j.data.getMonth();
        if (m !== mies) { mies = m; karta = h('section', { class: 'karta lista-wierszy', style: { padding: '2px 0' } }); lista.append(h('div', { class: 'grupa-t' }, h('span', { text: A.wielka(f.miesiac(m)) + ' ' + j.data.getFullYear() })), karta); }
        const pr = A.osiagniecia(j).some((x) => x.typ === 'pr');
        const box = h('div', { class: 'ikb' + (j.typ === 'zwift' ? ' zw' : '') }); const mp = A.mapka(j, { w: 56, h: 56, pad: 6 }); box.append(mp || ik('monitor-play', 'fill'));
        karta.append(klik(h('div', { class: 'wj dotyk', role: 'button', tabindex: 0, 'aria-label': j.nazwa }, box, h('div', null, h('h3', null, j.nazwa.replace('Zwift · ', ''), pr ? ik('trophy', 'fill', 'pr') : null), h('p', { text: `${f.dzienTyg(j.data)} ${f.dataKrotka(j.data)} · ${f.czasHM(j.czas)} · ${j.typ === 'zwift' ? j.moc + ' W' : f.liczba(j.predkosc, 1) + ' km/h'}` })), h('div', { class: 'km' }, f.km(j.km), h('small', { text: 'km' }))), () => otworzJazde(j)));
      }
    }
    rysuj();
  }

  // ───────── ekran: Postępy ─────────
  function postepy(el) {
    const z = h('div', { class: 'zaw' });
    el.append(h('header', { class: 'naglowek' }, h('h1', { text: 'Postępy' }), h('p', { text: 'Jak rośnie forma i ile już za Tobą.' })), z);
    const kF = h('section', { class: 'karta' }, h('div', { class: 'karta-t' }, h('span', { text: 'Forma' }), h('span', { class: 'znacznik', text: F.nazwa })), h('div', { class: 'duza' }, h('b', { text: f.liczba(F.ctl) }), h('span', null, ik('trend-up', 'bold'), f.znak(F.zmiana7, 1) + ' w 7 dni')), h('div', { class: 'w' }),
      h('div', { class: 'legenda' }, h('span', null, h('i', { style: { background: 'var(--g2)' } }), 'forma'), h('span', null, h('i', { style: { background: '#C3C9D4' } }), 'zmęczenie')));
    const kT = h('section', { class: 'karta' }, h('div', { class: 'karta-t' }, h('span', { text: 'Kilometry tygodniowo' }), h('span', { class: 'znacznik', text: `${f.znak(Math.round((T.km - T.poprzedni.km) / T.poprzedni.km * 100))}%` })), h('div', { class: 'w', style: { marginTop: '10px' } }),
      h('div', { class: 'legenda' }, h('span', null, h('i', { style: { background: 'var(--g1)' } }), 'szosa'), h('span', null, h('i', { style: { background: 'var(--zwift)' } }), 'Zwift')));
    const top = K.segmenty.slice().sort((a, b) => b.historia.length - a.historia.length).slice(0, 5);
    const kS = h('section', { class: 'karta' }, h('div', { class: 'karta-t' }, h('span', { text: 'Ulubione segmenty' })), h('div', { class: 'lista-wierszy', style: { marginTop: '6px' } }, top.map((sg) => h('div', { class: 'lw' }, h('span', { class: 'ik' }, ik(sg.typ === 'zwift' ? 'monitor-play' : 'path', 'bold')), h('span', null, h('b', { text: sg.nazwa }), h('small', { text: `${sg.historia.length} prób · ostatnio ${f.tempoSeg(sg.ostatnia.czas)}` })), h('span', { class: 'v' }, f.tempoSeg(sg.pr), h('small', { text: ' PR' }))))));
    const ikR = { dystans: 'path', predkosc: 'lightning', przewyzszenie: 'mountains', tydzien: 'calendar-blank', moc20: 'barbell', tetno: 'heartbeat' };
    const kR = h('section', { class: 'karta' }, h('div', { class: 'karta-t' }, h('span', { text: 'Rekordy' })), h('div', { class: 'lista-wierszy', style: { marginTop: '6px' } }, K.rekordy.map((r) => h('div', { class: 'lw' }, h('span', { class: 'ik gr' }, ik(ikR[r.klucz], 'fill')), h('span', null, h('b', { text: r.nazwa }), h('small', { text: f.data(r.data) })), h('span', { class: 'v' }, f.liczba(r.wartosc, r.jednostka === 'km/h' || r.klucz === 'dystans' ? 1 : 0), h('small', { text: ' ' + r.jednostka }))))));
    const kM = h('section', { class: 'karta' }, h('div', { class: 'karta-t' }, h('span', { text: 'Moc na Zwifcie' }), h('span', { class: 'znacznik', text: `20 min · ${K.moc.wszech[8]} W` })), h('div', { class: 'w', style: { marginTop: '10px' } }), h('p', { class: 'pod', text: 'Tylko z trenażera. Na szosie nie mamy miernika mocy.' }));
    z.append(kF, kT, kS, kR, kM);
    requestAnimationFrame(() => {
      const dni = K.dni.slice(-90);
      W.linie(kF.querySelector('.w'), { wys: 130, m: { l: 4, r: 8, t: 12, b: 6 }, siatka: false, serie: [{ pts: dni.map((d, i) => [i, d.ctl]), klasa: 's-g2', obszar: true, koniec: true }, { pts: dni.map((d, i) => [i, d.atl]), klasa: 's-szary' }], x: { ticki: [] }, y: { min: 0, max: 80, format: null, ticki: [] }, tip: (i) => [W.naglowekTip(f.dataKrotka(dni[i].data)), W.wierszTip(f.liczba(dni[i].ctl), 'forma', 's-g2'), W.wierszTip(f.liczba(dni[i].atl), 'zmęczenie')], opis: 'Forma, 90 dni' });
      const t12 = K.tygodnie.slice(-12).map((t) => { const od = t.od, doo = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 7), jj = K.jazdy.filter((j) => j.data >= od && j.data < doo); return { t, a: jj.filter((j) => j.typ === 'szosa').reduce((x, j) => x + j.km, 0), b: jj.filter((j) => j.typ === 'zwift').reduce((x, j) => x + j.km, 0) }; });
      W.slupki(kT.querySelector('.w'), { wys: 150, m: { l: 4, r: 4, t: 18, b: 20 }, maxSzer: 16, promien: 8, odstep: 3, siatka: false, osY: { ticki: 1, format: null }, osX: (i) => (i % 3 === 2 ? f.dataKrotka(t12[i].t.od) : null), wartosc: (d, i) => (i === 11 ? f.liczba(d.v) : null), dane: t12.map((w) => ({ v: w.a + w.b, klasa: w.t.biezacy ? 'akcent' : '', czesci: [{ v: w.a, klasa: 'cz-szosa' }, { v: w.b, klasa: 'cz-zwift' }], tip: () => [W.naglowekTip(`tydzień ${f.dataKrotka(w.t.od)}`), W.wierszTip(f.liczba(w.a + w.b) + ' km', 'razem'), W.wierszTip(f.liczba(w.a) + ' km', 'szosa', 's-g1'), W.wierszTip(f.liczba(w.b) + ' km', 'Zwift', 's-zw')] })), opis: 'Kilometry tygodniowo' });
      const M = K.moc;
      W.linie(kM.querySelector('.w'), { wys: 150, m: { l: 30, r: 8, t: 10, b: 20 }, serie: [{ pts: M.czasy.map((c, i) => [c, M.wszech[i]]), klasa: 's-g2', obszar: true, obszarOd: 100 }], x: { skala: 'log', min: 5, max: 3600, ticki: [[5, '5 s'], [60, '1 min'], [300, '5 min'], [1200, '20 min'], [3600, '1 h']].map(([v, t], k) => ({ v, s: t, kotwica: k === 0 ? 'start' : k === 4 ? 'end' : 'middle' })) }, y: { min: 100, max: 900, ticki: [100, 500, 900], format: (v) => v }, tip: (i) => [W.naglowekTip(M.etykiety[i]), W.wierszTip(M.wszech[i] + ' W', 'najlepiej', 's-g2')], opis: 'Krzywa mocy' });
    });
  }

  // ───────── ekran: Profil ─────────
  function profil(el) {
    const Wsz = K.okresy.wszystko;
    el.append(h('div', { class: 'profil-g' }, h('div', { class: 'duzy-awatar', text: 'FM' }), h('h1', { text: 'Fryderyk Marszałek' }), h('p', { text: `Konstancin-Jeziorna · poziom ${A.poziom.nr}` })),
      h('div', { class: 'zaw' },
        h('section', { class: 'karta trzy' }, h('div', null, h('b', { text: f.liczba(Wsz.km) }), h('small', { text: 'km' })), h('div', null, h('b', { text: String(Wsz.jazdy) }), h('small', { text: 'jazd' })), h('div', null, h('b', { text: String(A.seria.tygodnie) }), h('small', { text: 'tyg. serii' }))),
        h('div', { class: 'sekcja-t' }, h('h2', { text: 'Odznaki' }), h('span', { text: `${A.odznaki.filter((o) => o.zdobyta).length} z ${A.odznaki.length}` })),
        h('div', { class: 'odz-siatka' }, A.odznaki.map((o) => h('div', { class: 'odz' + (o.zdobyta ? '' : ' zabl'), title: o.szczegol }, h('div', { class: 'med' }, ik(o.ikona, 'fill')), h('b', { text: o.nazwa }), h('small', { text: o.opis }), o.zdobyta ? null : h('div', { class: 'mini' }, h('i', { style: { width: (o.postep * 100).toFixed(0) + '%' } }))))),
        h('div', { class: 'sekcja-t' }, h('h2', { text: 'Ustawienia' })),
        h('section', { class: 'karta lista-wierszy', style: { padding: '2px 18px' } }, [['link', 'Strava', 'połączona · dane przykładowe'], ['heartbeat', 'Strefy tętna', `maks. ${K.zawodnik.tetnoMax} · próg ${K.zawodnik.tetnoProg} bpm`], ['target', 'Cel roczny', `${f.liczba(C.km)} km w 2026`], ['bell', 'Przypomnienia', 'plan na jutro o 20:00']].map(([i, n, o]) => h('div', { class: 'lw' }, h('span', { class: 'ik' }, ik(i, 'bold')), h('span', null, h('b', { text: n }), h('small', { text: o })), h('span', { class: 'v' }, ik('caret-right', 'bold'))))),
        h('p', { class: 'przypis', text: 'Kolarstwo · styl Trener. Liczby są przykładowe.' })));
  }

  A.aplikacja({ tytul: 'Kolarstwo', zakladki: [{ id: 'start', nazwa: 'Start', ikona: 'house' }, { id: 'jazdy', nazwa: 'Jazdy', ikona: 'bicycle' }, { id: 'postepy', nazwa: 'Postępy', ikona: 'chart-line-up' }, { id: 'profil', nazwa: 'Profil', ikona: 'user' }], ekrany: { start, jazdy, postepy, profil } });
})();
