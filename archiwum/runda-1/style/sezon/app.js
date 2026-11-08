/* SEZON — logika strony */
(function () {
  'use strict';
  const K = window.K2, f = K.fmt, h = W.h;
  const $ = (s) => document.querySelector(s);
  const J = K.ostatnia.jazda, P = K.ostatnia.probki, C = K.cel, F = K.forma, R = K.okresy.rok;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const odm = (n, a, b, c) => { n = Math.abs(Math.round(n)); if (n === 1) return a; const d = n % 10, s = n % 100; return d >= 2 && d <= 4 && (s < 12 || s > 14) ? b : c; };

  $('#nr').textContent = f.tydzienISO(K.dzis);
  $('#dzis').textContent = f.dataKrotka(K.dzis);

  // ───────── A · liczba sezonu ─────────
  (function hero() {
    const el = $('#hero-km');
    const ustaw = (v) => { const s = f.liczba(Math.round(v)); el.textContent = s; el.dataset.t = s; };
    if (W.ruchOgraniczony()) ustaw(C.teraz);
    else { const t0 = performance.now(); const krok = (t) => { const p = Math.min(1, (t - t0) / 1300); ustaw(C.teraz * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(krok); }; requestAnimationFrame(krok); }
    const brak = C.km - C.teraz;
    $('#hero-zdanie').textContent = `kilometrów w 2026. Do celu ${f.liczba(C.km)} brakuje ${f.liczba(brak)} — czyli ${f.liczba(C.potrzebaNaTydzien)} km na tydzień. Dasz radę.`;
    const paczki = Math.round(R.kcal / 300);
    $('#porownania').append(
      h('li', null, h('b', { text: f.liczba(C.teraz / 1047, 1) + '×' }), ' cała Wisła, od źródła do ujścia'),
      h('li', null, h('b', { text: f.liczba(C.teraz / 3400, 1) + '×' }), ' Tour de France (Pogačar robi jeden w 3 tygodnie)'),
      h('li', null, h('b', { text: f.liczba(paczki) }), ` ${odm(paczki, 'pączek', 'pączki', 'pączków')} spalonych (${f.liczba(Math.round(R.kcal / 1000))} tys. kcal)`),
      h('li', null, h('b', { text: f.liczba(R.czas / 86400, 1) }), ' doby w siodle bez przerwy'));
  })();

  // ───────── B · forma ─────────
  (function forma() {
    $('#forma-liczba').textContent = f.liczba(F.ctl);
    $('#forma-zm').textContent = `${F.zmiana7 >= 0 ? '▲' : '▼'} ${f.liczba(Math.abs(F.zmiana7), 1)}`;
    $('#forma-zdanie').append(F.zmiana7 >= 0 ? 'Rośnie od tygodnia. ' : 'Lekko spada. ', 'Zmęczenie ', h('b', { text: f.liczba(F.atl) }), F.atl > F.ctl ? ` — o ${f.liczba(F.atl - F.ctl)} wyżej. Czyli: trenuj, ale śpij.` : ' — niżej niż forma. Świeżo!');
    const dni = K.dni.slice(-90);
    $('#forma-leg').append(h('span', null, h('i', { style: { background: 'var(--zolty)' } }), 'forma'), h('span', null, h('i', { style: { background: 'var(--roz)' } }), 'zmęczenie'));
    W.linie($('#forma-wyk'), {
      wys: 120, m: { l: 6, r: 6, t: 6, b: 6 }, siatka: false, krzywa: 'gladka',
      serie: [{ pts: dni.map((d, i) => [i, d.ctl]), klasa: 's-zolty', obszar: true, koniec: true }, { pts: dni.map((d, i) => [i, d.atl]), klasa: 's-cienka-roz' }],
      x: { ticki: [] }, y: { min: 0, max: 80, ticki: [], format: null },
      tip: (i) => [W.naglowekTip(`${f.dzienTygKr(dni[i].data)} ${f.dataKrotka(dni[i].data)}`), W.wierszTip(f.liczba(dni[i].ctl), 'forma', 's-zolty'), W.wierszTip(f.liczba(dni[i].atl), 'zmęczenie', 's-roz')],
      opis: 'Forma i zmęczenie, 90 dni',
    });
  })();

  // ───────── C · tydzień / okres ─────────
  (function tydzien() {
    const tydzOd = K.okresy.tydzien.od;
    const dni = Array.from({ length: 7 }, (_, k) => new Date(tydzOd.getFullYear(), tydzOd.getMonth(), tydzOd.getDate() + k));
    const maxKm = 70;
    $('#dni').append(...dni.map((d, k) => {
      const o = K.dni.find((x) => x.data.getFullYear() === d.getFullYear() && x.data.getMonth() === d.getMonth() && x.data.getDate() === d.getDate());
      const jj = o ? o.jazdy.map((id) => K.jazdy[id - 1]) : [];
      const km = o ? o.km : 0, typ = jj.length ? (jj.some((j) => j.typ === 'szosa') ? 'szosa' : 'zwift') : '';
      const dzis = o === K.dni[K.dni.length - 1];
      return h('li', { class: 'dzien', title: o ? `${f.dzienTyg(d)}: ${km ? f.km(km) + ' km' : 'wolne'}` : `${f.dzienTyg(d)}: jeszcze przed nami` },
        h('div', { class: `pig ${typ}${dzis ? ' dzis' : ''}`, style: { height: (km ? 18 + clamp(km / maxKm, 0, 1) * 82 : 12) + 'px', opacity: o ? 1 : 0.35 } }),
        h('span', { text: f.dzienTygKr(d) }));
    }));
    const T = K.okresy;
    let odIlu = 0; for (let k = K.tygodnie.length - 2; k >= 0; k--) { odIlu++; if (K.tygodnie[k].km >= T.tydzien.km) break; }
    const ETYK = { tydzien: 'Ten tydzień', miesiac: 'Listopad', rok: 'Rok 2026', wszystko: 'Od sierpnia 2025' };
    const zdanie = (k) => {
      const o = T[k];
      if (k === 'tydzien') return odIlu >= 3 ? `Najwięcej od ${odIlu} tygodni! ${o.jazdy} ${odm(o.jazdy, 'jazda', 'jazdy', 'jazd')}, a to dopiero sobota.` : `${o.jazdy} ${odm(o.jazdy, 'jazda', 'jazdy', 'jazd')} w tym tygodniu.`;
      if (k === 'miesiac') return `Tydzień listopada za nami. Październik miał przez ten czas ${f.liczba(o.poprzedni.km)} km.`;
      if (k === 'rok') return `${o.jazdy} jazd: ${o.szosa} na szosie, ${o.zwift} na Zwifcie.`;
      return `${o.jazdy} jazd, ${f.liczba(o.czas / 3600)} godzin, jeden kolarz.`;
    };
    const ML = [{ k: 'czas', l: 'Czas', v: (o) => f.liczba(o.czas / 3600, 1), u: 'h' }, { k: 'przewyzszenie', l: 'W górę', v: (o) => f.liczba(o.przewyzszenie), u: 'm' }, { k: 'jazdy', l: 'Jazdy', v: (o) => String(o.jazdy), u: '' }, { k: 'predkosc', l: 'Średnia', v: (o) => f.liczba(o.predkosc, 1), u: 'km/h' }];
    const dl = $('#mini-liczby');
    const el = ML.map((m) => { const dd = h('dd'); dl.append(h('div', null, h('dt', { text: m.l }), dd)); return { m, dd }; });
    const etyk = document.querySelector('.b-tydzien .etyk');
    const ustaw = (k) => {
      const o = T[k];
      etyk.textContent = ETYK[k];
      $('#t-tydz').replaceChildren(f.liczba(o.km), h('small', { text: 'km' }));
      $('#tydz-zdanie').textContent = zdanie(k);
      el.forEach(({ m, dd }) => dd.replaceChildren(m.v(o), m.u ? h('small', { text: m.u }) : ''));
      dl.classList.remove('zmiana'); void dl.offsetWidth; dl.classList.add('zmiana');
    };
    const ops = [{ k: 'tydzien', s: 'Tydzień' }, { k: 'miesiac', s: 'Miesiąc' }, { k: 'rok', s: 'Rok' }, { k: 'wszystko', s: 'Całość' }];
    const bs = ops.map((o) => { const b = h('button', { type: 'button', 'aria-pressed': String(o.k === 'tydzien'), text: o.s }); b.addEventListener('click', () => { bs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); ustaw(o.k); }); return b; });
    $('#okresy').append(...bs);
    ustaw('tydzien');
  })();

  // ───────── D · ostatnia jazda ─────────
  (function jazda() {
    $('#t-jazda').textContent = J.nazwa;
    $('#jazda-kiedy').textContent = `${f.dzienTyg(J.data)}, ${f.godzina(J.data)}`;
    const DEF = [['Dystans', 'Kilometr', 'r'], ['Czas', 'Czas', 'z'], ['Średnia', 'Prędkość', 'n'], ['Tętno', 'Tętno', ''], ['W górę', 'Wysokość', ''], ['Kadencja', 'Nachylenie', '']];
    const host = $('#naklejki-jazdy');
    const el = DEF.map((d) => { const l = h('div', { class: 'l' }), v = h('div', { class: 'v' }); host.append(h('div', { class: 'nj ' + d[2] }, l, v)); return { d, l, v }; });
    const ustaw = (i) => {
      const live = i >= 0;
      const w = live
        ? [[f.liczba(P.d[i], 1), 'km'], [f.czas(P.t[i]), ''], [f.liczba(P.v[i], 1), 'km/h'], [String(P.hr[i]), 'bpm'], [f.liczba(P.ele[i]), 'm'], [(P.grade[i] < 0 ? '−' : '') + f.liczba(Math.abs(P.grade[i]), 1), '%']]
        : [[f.liczba(J.km, 1), 'km'], [f.czas(J.czas), ''], [f.liczba(J.predkosc, 1), 'km/h'], [String(J.tetno), 'bpm'], [f.liczba(J.przewyzszenie), 'm'], [String(J.kadencja), 'rpm']];
      el.forEach(({ d, l, v }, k) => { l.textContent = d[live ? 1 : 0]; v.replaceChildren(w[k][0], w[k][1] ? h('small', { text: w[k][1] }) : ''); });
      host.classList.toggle('na-zywo', live);
    };
    ustaw(-1);
    const wyk = []; let mapa = null;
    const sync = (i) => { wyk.forEach((w) => w.ustawKursor(i)); ustaw(i); if (mapa) mapa.kursor(i); };
    mapa = W.mapaTrasy($('#mapa'), { mapa: K.mapa, trasa: P.x.map((x, i) => [x, P.y[i]]), segmenty: P.segmenty, poswiata: true, km: 10, etykietaStartu: 'Start', onHover: sync, pad: 18, margines: 1.3, promienKursora: 6, opis: `Mapa trasy: ${J.nazwa}` });
    const maxKm = P.d[P.d.length - 1];
    const tk = []; for (let k = 0; k <= maxKm; k += 20) tk.push({ v: k, s: k + ' km', kotwica: k === 0 ? 'start' : 'middle' });
    const e0 = Math.floor((Math.min(...P.ele) - 4) / 10) * 10, e1 = Math.ceil((Math.max(...P.ele) + 6) / 10) * 10;
    $('#profil-info').textContent = `${f.liczba(Math.min(...P.ele))}–${f.liczba(Math.max(...P.ele))} m`;
    wyk.push(W.linie($('#profil'), {
      wys: 120, m: { l: 4, r: 4, t: 10, b: 20 }, krzywa: 'linia', siatka: false,
      serie: [{ pts: P.d.map((k, i) => [k, P.ele[i]]), klasa: 's-teren', obszar: true, obszarOd: e0 }],
      x: { min: 0, max: maxKm, ticki: tk }, y: { min: e0, max: e1, ticki: [], format: null },
      tlo: ({ g, x, m, H }) => { for (const s of P.segmenty) W.svg('rect', { x: x(s.od), y: m.t, width: Math.max(3, x(s.do) - x(s.od)), height: H - m.t - m.b, class: 'wk-pasmo' }, g); },
      naHover: sync, opis: 'Profil wysokości',
    }));
    wyk.push(W.linie($('#s-v'), { wys: 64, m: { l: 4, r: 4, t: 4, b: 4 }, krzywa: 'linia', siatka: false, serie: [{ pts: P.d.map((k, i) => [k, P.v[i]]), klasa: 's-cienka-roz' }], x: { min: 0, max: maxKm, ticki: [] }, y: { min: 10, max: 45, ticki: [], format: null }, naHover: sync, opis: 'Prędkość' }));
    wyk.push(W.linie($('#s-hr'), { wys: 64, m: { l: 4, r: 4, t: 4, b: 4 }, krzywa: 'linia', siatka: false, serie: [{ pts: P.d.map((k, i) => [k, P.hr[i]]), klasa: 's-cienka-nieb' }], x: { min: 0, max: maxKm, ticki: [] }, y: { min: 90, max: 190, ticki: [], format: null }, naHover: sync, opis: 'Tętno' }));
  })();

  // ───────── E · karta zawodnika ─────────
  (function karta() {
    const M = K.moc, najdl = Math.max(...K.jazdy.map((j) => j.km));
    const aktywne = K.dni.slice(-365).filter((d) => d.jazdy.length).length;
    const mNaKm = K.okresy.wszystko.przewyzszenie / K.okresy.wszystko.km;
    const O = [
      { k: 'Sprint', v: 35 + (M.wszech[0] - 500) / 8, o: `najlepsze 5 s na Zwifcie: ${M.wszech[0]} W` },
      { k: 'Wytrzymałość', v: 30 + najdl / 2.6, o: `najdłuższa jazda: ${f.liczba(najdl, 1)} km` },
      { k: 'Tempo', v: (K.okresy.wszystko.predkosc - 18) * 6.5, o: `średnio ${f.liczba(K.okresy.wszystko.predkosc, 1)} km/h na wszystkich jazdach` },
      { k: 'Wspinaczka', v: 20 + mNaKm * 9, o: `${f.liczba(mNaKm, 1)} m w górę na kilometr — Mazowsze, co poradzisz` },
      { k: 'Regularność', v: 40 + aktywne / 365 * 120, o: `${aktywne} aktywnych dni w ostatnim roku` },
      { k: 'Forma', v: F.ctl * 1.6, o: `forma (CTL) ${f.liczba(F.ctl)}` },
    ].map((x) => Object.assign(x, { v: Math.round(clamp(x.v, 1, 99)) }));
    const ovr = Math.round(O.reduce((a, x) => a + x.v, 0) / O.length);
    const naj = O.reduce((a, b) => (b.v > a.v ? b : a));
    const typ = naj.k === 'Sprint' ? 'Sprinter' : naj.k === 'Wspinaczka' ? 'Grimpeur' : naj.k === 'Regularność' ? 'Metronom' : 'Rouleur';
    $('#kz-ovr').textContent = String(ovr);
    $('#kz-typ').textContent = typ;
    $('#kz-motto').textContent = typ === 'Rouleur' ? 'Płasko, równo i daleko. Wał wiślany to jego Alpe d’Huez.' : typ === 'Metronom' ? 'Jeździ zawsze. Deszcz, wiatr, listopad — nieważne.' : 'Ma w nogach więcej, niż pokazuje Strava.';
    $('#kz-staty').append(...O.map((x) => h('div', { class: 'st', title: x.o }, h('dt', null, x.k, h('b', { text: String(x.v) })), h('dd', { role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': 99, 'aria-valuenow': x.v, 'aria-label': `${x.k}: ${x.v} — ${x.o}` }, h('i', { style: { width: x.v + '%' } })))));
  })();

  // ───────── F · tygodnie ─────────
  (function tygodnie() {
    const tyg = K.tygodnie.map((t) => { const od = t.od, doo = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 7); const jj = K.jazdy.filter((j) => j.data >= od && j.data < doo); return { t, a: jj.filter((j) => j.typ === 'szosa').reduce((s, j) => s + j.km, 0), b: jj.filter((j) => j.typ === 'zwift').reduce((s, j) => s + j.km, 0) }; });
    $('#tyg-leg').append(h('span', null, h('i', { style: { background: 'var(--zolty)' } }), 'Szosa'), h('span', null, h('i', { style: { background: 'var(--roz)' } }), 'Zwift'), h('span', null, h('i', { style: { background: 'var(--papier)' } }), 'Ten tydzień'));
    W.slupki($('#tyg'), {
      wys: 260, m: { l: 32, r: 2, t: 22, b: 24 }, maxSzer: 13, promien: 5, odstep: 2, osY: { ticki: 4, format: (v) => f.liczba(v) },
      osX: (i) => { const od = tyg[i].t.od, p = i ? tyg[i - 1].t.od : null; return !p || p.getMonth() !== od.getMonth() ? f.miesiacKr(od.getMonth()) : null; },
      wartosc: (d, i) => (i === tyg.length - 1 ? f.liczba(d.v) : null),
      dane: tyg.map((w) => ({ v: w.a + w.b, klasa: w.t.biezacy ? 'akcent' : '', czesci: [{ v: w.a, klasa: 'cz-szosa' }, { v: w.b, klasa: 'cz-zwift' }], tip: () => { const od = w.t.od, dd = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 6); return [W.naglowekTip(`Tydzień ${f.tydzienISO(od)} · ${od.getDate()}–${f.dataKrotka(dd)}`), W.wierszTip(f.liczba(w.a + w.b) + ' km', 'razem', 's-papier'), W.wierszTip(f.liczba(w.a) + ' km', 'szosa', 's-zolty'), W.wierszTip(f.liczba(w.b) + ' km', 'Zwift', 's-roz')]; } })),
      opis: 'Kilometry tygodniowo',
    });
  })();

  // ───────── G · segmenty ─────────
  (function segmenty() {
    const top = K.segmenty.slice().sort((a, b) => b.historia.length - a.historia.length).slice(0, 5);
    $('#seg-lista').append(...top.map((s, i) => {
      const swiezy = s.historia.some((x) => x.pr && (K.dzis - x.data) / 86400000 <= 30);
      const r = s.ostatnia.czas - s.pr;
      return h('li', { class: 'sg' },
        h('span', { class: 'nr', text: String(i + 1) }),
        h('span', { class: 'n' }, s.nazwa, swiezy ? h('span', { class: 'gwiazdka', title: 'Rekord w ostatnich 30 dniach', 'aria-label': 'świeży rekord' }) : null),
        h('span', { class: 'c' }, f.tempoSeg(s.pr), h('small', { text: 'rekord' })),
        h('span', { class: 'm', text: `${s.dl >= 1000 ? f.liczba(s.dl / 1000, 2) + ' km' : s.dl + ' m'} · ${s.historia.length} prób · ostatnio ${f.tempoSeg(s.ostatnia.czas)}${r > 0 ? ' (+' + r + ' s)' : ' (rekord!)'}` }));
    }));
  })();

  // ───────── H · moc ─────────
  (function moc() {
    const M = K.moc;
    $('#moc-leg').append(h('span', null, h('i', { style: { background: 'var(--roz)' } }), 'Cały okres'), h('span', null, h('i', { style: { background: 'var(--zolty)' } }), 'Ostatnie 42 dni'));
    W.linie($('#krzywa'), {
      wys: 230, m: { l: 34, r: 8, t: 14, b: 24 },
      serie: [{ pts: M.czasy.map((c, i) => [c, M.wszech[i]]), klasa: 's-roz', obszar: true, obszarOd: 100 }, { pts: M.czasy.map((c, i) => [c, M.ostatnie42[i]]), klasa: 's-zolty' }],
      x: { skala: 'log', min: 5, max: 3600, ticki: [[5, '5 s'], [60, '1 min'], [300, '5 min'], [1200, '20 min'], [3600, '1 h']].map(([v, s], k) => ({ v, s, kotwica: k === 0 ? 'start' : k === 4 ? 'end' : 'middle' })) },
      y: { min: 100, max: 900, ticki: [100, 500, 900], format: (v) => f.liczba(v) },
      tip: (i) => [W.naglowekTip(M.etykiety[i]), W.wierszTip(M.wszech[i] + ' W', 'cały okres', 's-roz'), M.ostatnie42[i] != null ? W.wierszTip(M.ostatnie42[i] + ' W', 'ostatnie 42 dni', 's-zolty') : W.wierszTip('—', 'brak próby')],
      opis: 'Krzywa mocy z trenażera',
    });
    $('#moc-liczby').append(...[[0, '5 s'], [4, '1 min'], [6, '5 min'], [8, '20 min']].map(([i, l]) => h('div', { class: 'ml' }, h('div', { class: 'l', text: l }), h('div', { class: 'v' }, String(M.wszech[i]), h('small', { text: 'W' })))));
  })();

  // ───────── I · kropki ─────────
  (function kropki() {
    const host = $('#kal');
    const ile = host.clientWidth < 560 ? 26 * 7 : 52 * 7;
    const dni = K.dni.slice(-ile).map((d, i, a) => ({ data: d.data, v: d.km, jazdy: d.jazdy, dzis: i === a.length - 1 }));
    W.kalendarz(host, { dni, progi: [25, 45, 70], komorka: 13, odstep: 2, ksztalt: 'kropka', etykietaMies: (d) => f.miesiacKr(d.getMonth()), tip: (d) => [W.naglowekTip(`${f.dzienTygKr(d.data)} ${f.data(d.data)}`), d.jazdy.length ? W.wierszTip(f.km(d.v) + ' km', d.jazdy.map((id) => K.jazdy[id - 1].nazwa).join(', '), 's-nieb') : W.wierszTip('—', 'bez jazdy')], opis: 'Kalendarz jazd z kropek' });
    const S = K.strefy;
    const pas = $('#strefy');
    pas.setAttribute('role', 'img'); pas.setAttribute('aria-label', 'Strefy tętna: ' + S.map((z) => `Z${z.nr} ${f.procent(z.udzial)}`).join(', '));
    S.forEach((z) => pas.append(h('div', { class: 'str-' + z.nr, style: { flex: z.udzial + ' 1 0' }, title: `Z${z.nr} ${z.nazwa}: ${f.procent(z.udzial)}`, text: z.udzial > 0.08 ? `Z${z.nr} ${f.procent(z.udzial)}` : '' })));
    pas.after(h('p', { class: 'strefy-opis', text: `Strefy tętna z 90 dni: najwięcej ${S[1].nazwa.toLowerCase()} (Z2) — tak trzymać.` }));
  })();

  // ───────── J · naklejki-rekordy ─────────
  $('#sciana').append(...K.rekordy.map((r) => h('div', { class: 'nk', title: r.opis },
    h('div', { class: 'l', text: r.nazwa }), h('div', { class: 'v' }, f.liczba(r.wartosc, r.jednostka === 'km/h' || r.klucz === 'dystans' ? 1 : 0), h('small', { text: r.jednostka })), h('div', { class: 'd', text: f.dataNum(r.data) }))));

  // ───────── K · bilety ─────────
  $('#bilety').append(...K.jazdy.slice(-8).reverse().map((j) => h('div', { class: 'bilet' + (j.typ === 'zwift' ? ' zw' : '') },
    h('span', { class: 'dz', text: `${f.dzienTyg(j.data)} ${f.dataNumKr(j.data)} · ${f.godzina(j.data)}` }),
    h('span', { class: 'n', text: j.nazwa.replace('Zwift · ', 'Zwift: ') }),
    h('span', { class: 'km' }, f.km(j.km), h('small', { text: 'km' })),
    h('span', { class: 'x' }, f.czas(j.czas), h('br'), j.typ === 'zwift' ? `${j.moc} W · ${j.tetno} bpm` : `${f.liczba(j.predkosc, 1)} km/h · ${j.tetno} bpm`))));

  // ───────── pojawianie się bloków i aktywna sekcja ─────────
  if (!W.ruchOgraniczony() && 'IntersectionObserver' in window) {
    const bloki = [...document.querySelectorAll('.blok')];
    const vh = window.innerHeight;
    bloki.forEach((b) => { if (b.getBoundingClientRect().top > vh * 0.9) b.classList.add('ukryty'); });
    const io = new IntersectionObserver((w) => w.forEach((x) => { if (x.isIntersecting) { x.target.classList.remove('ukryty'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
    bloki.forEach((b) => io.observe(b));
  }
  (function () {
    const linki = [...document.querySelectorAll('.nawigacja a')], sek = linki.map((a) => document.querySelector(a.getAttribute('href')));
    const io = new IntersectionObserver((w) => w.forEach((x) => { if (x.isIntersecting) { const i = sek.indexOf(x.target); linki.forEach((a, k) => a.classList.toggle('aktywny', k === i)); } }), { rootMargin: '-40% 0px -55% 0px' });
    sek.forEach((s) => s && io.observe(s));
  })();
  W.typografia(document.body);
})();
