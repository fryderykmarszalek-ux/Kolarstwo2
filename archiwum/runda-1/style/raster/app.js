/* RASTER — logika strony */
(function () {
  'use strict';
  const K = window.K2, f = K.fmt, h = W.h;
  const $ = (s) => document.querySelector(s);
  const J = K.ostatnia.jazda, P = K.ostatnia.probki, C = K.cel;

  const tekstowe = (host, opcje, aktywny, naKlik) => {
    const bs = opcje.map((o) => {
      const b = h('button', { type: 'button', 'aria-pressed': String(o.k === aktywny), text: o.s });
      b.addEventListener('click', () => { bs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); naKlik(o.k); });
      return b;
    });
    host.append(...bs);
  };
  const kw = (kolor) => { const s = W.svg('svg', { width: 7, height: 7, class: 'ikona', 'aria-hidden': 'true' }); W.svg('rect', { width: 7, height: 7, fill: kolor }, s); return s; };

  // ───────── nagłówek ─────────
  $('#data').textContent = `${f.dzienTyg(K.dzis).replace(/^./, (c) => c.toUpperCase())}, ${f.data(K.dzis)}`;
  $('#tydz').textContent = `Tydzień ${f.tydzienISO(K.dzis)} · aktualizacja 15:40`;

  // siatka pod klawiszem G
  const btn = $('#siatka-btn');
  const przelaczSiatke = () => { const on = !document.body.classList.contains('siatka-on'); document.body.classList.toggle('siatka-on', on); btn.setAttribute('aria-pressed', String(on)); };
  btn.addEventListener('click', przelaczSiatke);
  document.addEventListener('keydown', (e) => { if ((e.key === 'g' || e.key === 'G') && !e.metaKey && !e.ctrlKey && !e.altKey && !/INPUT|TEXTAREA/.test(e.target.tagName)) przelaczSiatke(); });

  // ───────── 01 · sezon ─────────
  (function sezon() {
    const el = $('#hero-km');
    W.licznik(el, C.teraz, (v) => f.liczba(Math.round(v)), 1100);
    const dzienRoku = C.narastajaco.length, zostalo = 365 - dzienRoku, plan = C.km * dzienRoku / 365;
    $('#hero-1').textContent = `${f.liczba(K.okresy.rok.jazdy)} jazd, ${f.czasHM(K.okresy.rok.czas)} w siodle.`;
    $('#hero-2t').textContent = `Cel ${f.liczba(C.km)} km · ${f.procent(C.udzial)}`;
    $('#hero-2').textContent = `Według planu powinno być ${f.liczba(plan)} km — jesteś ${C.teraz >= plan ? 'przed planem' : 'za planem'} o ${f.liczba(Math.abs(C.teraz - plan))} km.`;
    $('#hero-3t').textContent = `Zostało ${zostalo} dni`;
    $('#hero-3').textContent = `Do celu brakuje ${f.liczba(C.km - C.teraz)} km, czyli ${f.liczba(C.potrzebaNaTydzien)} km tygodniowo.`;
    $('#hero-4t').textContent = `Prognoza ${f.liczba(C.prognoza)} km`;
    $('#hero-4').textContent = 'Przy obecnym tempie, licząc średnią z całego roku.';

    // linia celu — przez całą szerokość siatki
    const host = $('#linia-celu');
    host.setAttribute('aria-label', `Postęp celu: ${f.liczba(C.teraz)} z ${f.liczba(C.km)} km`);
    W.rozmiar(host, (szer) => {
      host.replaceChildren();
      const H = 96, max = 6000, x = W.skala(0, max, 0, szer), y0 = 48;
      const svg = W.svg('svg', { width: szer, height: H, viewBox: `0 0 ${szer} ${H}` }, host);
      W.svg('rect', { x: 0, y: y0 - 6, width: x(C.km), height: 12, class: 'lc-tor' }, svg);
      W.svg('rect', { x: 0, y: y0 - 6, width: x(C.teraz), height: 12, class: 'lc-pasek' }, svg);
      W.svg('line', { x1: 0, x2: szer, y1: y0 + 6.5, y2: y0 + 6.5, class: 'lc-os' }, svg);
      for (let v = 0; v <= max; v += 250) {
        const duzy = v % 1000 === 0;
        W.svg('line', { x1: x(v), x2: x(v), y1: y0 + 7, y2: y0 + (duzy ? 16 : 11), class: 'lc-tick' + (duzy ? '' : ' maly') }, svg);
        if (v < max && (duzy && szer > 500 || (duzy && v % 2000 === 0))) W.tekst(svg, x(v), y0 + 30, f.liczba(v), { class: 'lc-t', 'text-anchor': v === 0 ? 'start' : 'middle' });
      }
      // cel
      W.svg('line', { x1: x(C.km), x2: x(C.km), y1: 4, y2: y0 + 6, class: 'lc-cel' }, svg);
      const naKoncu = x(C.km) + 72 > szer;
      W.tekst(svg, x(C.km) + (naKoncu ? -7 : 6), 13, `Cel ${f.liczba(C.km)}`, { class: 'lc-t mocny', 'text-anchor': naKoncu ? 'end' : 'start' });
      // plan na dziś i prognoza
      const plan = C.km * C.narastajaco.length / 365;
      W.svg('path', { d: `M${x(plan) - 5},${y0 - 16} L${x(plan) + 5},${y0 - 16} L${x(plan)},${y0 - 8} Z`, class: 'lc-plan' }, svg);
      const tPlan = W.tekst(svg, x(plan) - 8, y0 - 18, `Plan ${f.liczba(plan)}`, { class: 'lc-t', 'text-anchor': 'end' });
      W.svg('circle', { cx: x(C.prognoza), cy: y0, r: 4, class: 'lc-prog' }, svg);
      if (szer > 640) W.tekst(svg, szer, y0 + 30, `○ prognoza ${f.liczba(C.prognoza)}`, { class: 'lc-t', 'text-anchor': 'end' });
      W.tekst(svg, 0, 13, `${f.liczba(C.teraz)} km`, { class: 'lc-t mocny' });
      if (x(plan) - 80 < 70) tPlan.remove();
    });
  })();

  // ───────── 02 · okres ─────────
  (function okres() {
    const tyg = (o) => Math.max(1, (o.do - o.od) / 86400000 / 7);
    const POLA = [
      { k: 'km', l: 'Dystans', u: 'km', v: (o) => f.km(o.km), d: 'p', s: (o) => `${f.km(o.km / tyg(o))} km tygodniowo` },
      { k: 'czas', l: 'Czas', u: 'h', v: (o) => { const m = Math.round(o.czas / 60); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; }, d: 'p', s: (o) => `${f.liczba(o.czas / 3600 / tyg(o), 1)} h tygodniowo` },
      { k: 'przewyzszenie', l: 'W górę', u: 'm', v: (o) => f.liczba(o.przewyzszenie), d: 'p', s: (o) => `${f.liczba(o.przewyzszenie / Math.max(1, o.km) * 10, 1)} m na 10 km` },
      { k: 'jazdy', l: 'Jazdy', u: '', v: (o) => String(o.jazdy), d: 'a', s: (o) => `${o.szosa} szosa, ${o.zwift} Zwift` },
      { k: 'predkosc', l: 'Średnia prędkość', u: 'km/h', v: (o) => f.liczba(o.predkosc, 1), d: 'a1', s: () => 'szosa i Zwift razem' },
      { k: 'obciazenie', l: 'Obciążenie', u: 'pkt', v: (o) => f.liczba(o.obciazenie), d: 'p', s: (o) => `${f.liczba(o.obciazenie / tyg(o))} pkt tygodniowo` },
    ];
    const host = $('#kpi');
    const el = POLA.map((p) => {
      const v = h('div', { class: 'lb-v' }), d = h('div', { class: 'lb-d' });
      host.append(h('div', { class: 'lb' }, h('div', { class: 'lb-l' }, h('span', { text: p.l })), v, d));
      return { p, v, d };
    });
    const ustaw = (k) => {
      const o = K.okresy[k], pr = o.poprzedni;
      for (const { p, v, d } of el) {
        v.replaceChildren(p.v(o), p.u ? h('small', { text: p.u }) : '');
        d.replaceChildren();
        if (pr) {
          const ch = p.d === 'p' ? (pr[p.k] ? (o[p.k] - pr[p.k]) / pr[p.k] : 0) : o[p.k] - pr[p.k];
          const s = p.d === 'p' ? f.znak(Math.round(ch * 100)) + '%' : p.d === 'a1' ? f.znak(ch, 1) : f.znak(ch);
          d.append(kw(ch >= 0 ? 'var(--tusz)' : 'var(--czerwien)'), h('b', { text: s }), h('span', { class: 'dl', text: `vs ${pr.etykieta}` }), h('span', { class: 'kr', text: k === 'tydzien' ? 'tydz. do tydz.' : 'vs 1–7 paź' }));
        } else d.textContent = p.s(o);
      }
      host.classList.remove('zmiana'); void host.offsetWidth; host.classList.add('zmiana');
    };
    tekstowe($('#okresy'), [{ k: 'tydzien', s: 'Tydzień' }, { k: 'miesiac', s: 'Miesiąc' }, { k: 'rok', s: 'Rok 2026' }, { k: 'wszystko', s: 'Wszystko' }], 'tydzien', ustaw);
    ustaw('tydzien');
  })();

  // ───────── 03 · forma ─────────
  (function forma() {
    const F = K.forma;
    const fl = (n, wart, kl, pod) => h('div', { class: 'fl' }, h('div', { class: 'fl-l' }, kl ? h('i', { class: 'kl ' + kl }) : null, n), h('div', { class: 'fl-v', text: (wart < 0 ? '−' : '') + f.liczba(Math.abs(wart)) }), h('div', { class: 'fl-s' }, pod));
    $('#forma-liczby').append(
      fl('Forma (CTL)', F.ctl, '', [h('b', { text: f.znak(F.zmiana7, 1) }), ' w ostatnich 7 dniach']),
      fl('Zmęczenie (ATL)', F.atl, 'szary', 'średnia z ostatniego tygodnia'),
      fl('Świeżość (TSB)', F.tsb, null, 'forma minus zmęczenie'));
    const ik = W.svg('svg', { width: 12, height: 12, viewBox: '0 0 12 12', 'aria-hidden': 'true' });
    if (F.status === 'good') W.svg('rect', { width: 12, height: 12, fill: 'var(--tusz)' }, ik);
    else W.svg('path', { d: 'M6 0.5L11.5 11.5H0.5Z', fill: F.status === 'critical' ? 'var(--czerwien)' : 'var(--tusz)' }, ik);
    $('#stan').append(ik, h('b', { text: F.nazwa }), h('span', { text: F.opis }));

    const dni = K.dni.slice(-180);
    const ticki = []; dni.forEach((d, i) => { if (d.data.getDate() === 1) ticki.push({ v: i, s: f.miesiacKr(d.data.getMonth()) }); });
    $('#pmc-legenda').append(h('span', null, h('i', { class: 'kl' }), 'Forma'), h('span', null, h('i', { class: 'kl szary' }), 'Zmęczenie'));
    let tsbZaznacz = () => {};
    const api = W.linie($('#pmc'), {
      wys: 280, m: { l: 30, r: 34, t: 10, b: 26 },
      serie: [{ pts: dni.map((d, i) => [i, d.ctl]), klasa: 's-czarny', koniec: true }, { pts: dni.map((d, i) => [i, d.atl]), klasa: 's-szary' }],
      x: { ticki }, y: { min: 0, ticki: 4, format: (v) => f.liczba(v) },
      tip: (i) => { const d = dni[i]; return [W.naglowekTip(`${f.dzienTyg(d.data)}, ${f.dataKrotka(d.data)}`), W.wierszTip(f.liczba(d.ctl), 'forma', 's-czarny'), W.wierszTip(f.liczba(d.atl), 'zmęczenie', 's-szary'), W.wierszTip(f.znak(Math.round(d.ctl - d.atl)), 'świeżość')]; },
      naHover: (i) => tsbZaznacz(i),
      nad: ({ g, x, y }) => { const o = dni.length - 1; W.tekst(g, x(o) + 8, y(dni[o].ctl) + 4, f.liczba(dni[o].ctl), { class: 'wk-wartosc', 'text-anchor': 'start' }); },
      opis: 'Forma i zmęczenie, 180 dni',
    });
    $('#tsb-legenda').append(h('span', null, h('i', { class: 'kl kw' }), 'świeży'), h('span', null, h('i', { class: 'kl kw czerwony' }), 'zmęczony'));
    const host = $('#tsb'); host.classList.add('wk');
    let svg = null, sl = [];
    tsbZaznacz = (i) => { sl.forEach((s, k) => s.classList.toggle('wk-aktywny', k === i)); if (svg) svg.classList.toggle('wk-hover', i >= 0); };
    W.rozmiar(host, (szer) => {
      if (svg) svg.remove();
      const H = 70, m = { l: 30, r: 34 };
      svg = W.svg('svg', { width: szer, height: H, class: 'wk-svg', role: 'img', 'aria-label': 'Świeżość dzień po dniu' }); host.prepend(svg);
      const mx = Math.max(30, ...dni.map((d) => Math.abs(d.ctl - d.atl))), y = W.skala(-mx, mx, H - 2, 2), p = (szer - m.l - m.r) / dni.length;
      W.svg('line', { x1: m.l, x2: szer - m.r, y1: y(0), y2: y(0), class: 'wk-baza' }, svg);
      sl = dni.map((d, i) => { const t = d.ctl - d.atl, g = W.svg('g', { class: 'wk-sl ' + (t >= 0 ? 'tsb-plus' : 'tsb-minus') }, svg); W.svg('path', { d: t >= 0 ? W.slupek(m.l + i * p, y(t), Math.max(1, p - 1), y(0) - y(t), 0) : W.slupek(m.l + i * p, y(0), Math.max(1, p - 1), y(t) - y(0), 0, true), class: 'wk-slupek' }, g); return g; });
      const hit = W.svg('rect', { x: m.l, y: 0, width: szer - m.l - m.r, height: H, fill: 'transparent' }, svg);
      hit.addEventListener('pointermove', (e) => { const r = svg.getBoundingClientRect(); const i = Math.max(0, Math.min(dni.length - 1, Math.floor((e.clientX - r.left - m.l) / p))); tsbZaznacz(i); api.ustawKursor(i); });
      hit.addEventListener('pointerleave', () => { tsbZaznacz(-1); api.ustawKursor(-1); });
    });
    W.wykresTabela($('#pmc-tab'), $('#pmc'), () => W.tabela(
      [{ s: 'Dzień', f: (d) => f.dataNum(d.data) }, { s: 'Forma', num: 1, f: (d) => f.liczba(d.ctl, 1) }, { s: 'Zmęczenie', num: 1, f: (d) => f.liczba(d.atl, 1) }, { s: 'Świeżość', num: 1, f: (d) => f.znak(d.ctl - d.atl, 1) }],
      dni.slice().reverse(), 'Forma i zmęczenie'));
  })();

  // ───────── 04 · ostatnia jazda ─────────
  (function jazda() {
    $('#jazda-meta').textContent = `${f.dzienTyg(J.data).replace(/^./, (c) => c.toUpperCase())}, ${f.data(J.data)}, start ${f.godzina(J.data)}. Szosa, start i meta w Konstancinie.`;
    $('#jazda-tytul').textContent = J.nazwa;
    const ODCZ = [['Dystans', 'Dystans'], ['Czas jazdy', 'Czas'], ['Średnia prędkość', 'Prędkość'], ['Średnie tętno', 'Tętno'], ['Przewyższenie', 'Wysokość'], ['Kadencja', 'Nachylenie']];
    const dl = $('#odczyty');
    const tryb = h('div', { class: 'tryb' }, h('i'), h('span', { text: 'Podsumowanie' }));
    dl.append(tryb);
    const el = ODCZ.map((s) => { const dt = h('dt'), dd = h('dd'); dl.append(h('div', { class: 'o' }, dt, dd)); return { s, dt, dd }; });
    const ustaw = (i) => {
      const live = i >= 0;
      const w = live
        ? [[f.liczba(P.d[i], 1), 'km'], [f.czas(P.t[i]), ''], [f.liczba(P.v[i], 1), 'km/h'], [String(P.hr[i]), 'bpm'], [f.liczba(P.ele[i]), 'm'], [(P.grade[i] < 0 ? '−' : '') + f.liczba(Math.abs(P.grade[i]), 1), '%']]
        : [[f.liczba(J.km, 1), 'km'], [f.czas(J.czas), ''], [f.liczba(J.predkosc, 1), 'km/h'], [String(J.tetno), 'bpm'], [f.liczba(J.przewyzszenie), 'm'], [String(J.kadencja), 'obr./min']];
      el.forEach(({ s, dt, dd }, k) => { dt.textContent = s[live ? 1 : 0]; dd.replaceChildren(w[k][0], w[k][1] ? h('small', { text: w[k][1] }) : ''); });
      tryb.classList.toggle('na-zywo', live);
      tryb.lastChild.textContent = live ? `Kilometr ${f.liczba(P.d[i], 1)}` : 'Podsumowanie';
    };
    ustaw(-1);
    const wykresy = [];
    let mapa = null;
    const sync = (i) => { wykresy.forEach((w) => w.ustawKursor(i)); ustaw(i); if (mapa) mapa.kursor(i); };
    const trasa = P.x.map((x, i) => [x, P.y[i]]);
    mapa = W.mapaTrasy($('#mapa'), { mapa: K.mapa, trasa, segmenty: P.segmenty, km: 10, kmStyl: 'kropka', etykietaStartu: 'Start, meta', krzyz: true, onHover: sync, pad: 14, opis: `Mapa trasy: ${J.nazwa}` });

    const maxKm = P.d[P.d.length - 1];
    const tk = []; for (let k = 0; k <= maxKm; k += 10) tk.push({ v: k, s: String(k) }); tk.push({ v: maxKm, s: 'km', kotwica: 'end' });
    const pasma = (nazwy) => ({ g, x, m, H }) => {
      for (const s of P.segmenty) {
        W.svg('rect', { x: x(s.od), y: m.t, width: Math.max(1, x(s.do) - x(s.od)), height: H - m.t - m.b, class: 'wk-pasmo' }, g);
        if (nazwy) { const t = W.tekst(g, x(s.od), m.t - 4, s.nazwa, { class: 'wk-pasmo-t' }); if (x(s.do) - x(s.od) < s.nazwa.length * 5.6 && s !== P.segmenty.find((q) => q.do - q.od === Math.max(...P.segmenty.map((z) => z.do - z.od)))) t.remove(); }
      }
    };
    const e0 = Math.floor((Math.min(...P.ele) - 2) / 10) * 10, e1 = Math.ceil((Math.max(...P.ele) + 2) / 10) * 10;
    wykresy.push(W.linie($('#s-wys'), { wys: 110, m: { l: 30, r: 0, t: 16, b: 2 }, krzywa: 'linia', serie: [{ pts: P.d.map((k, i) => [k, P.ele[i]]), klasa: 's-wys', obszar: true, obszarOd: e0 }], x: { min: 0, max: maxKm, ticki: [] }, y: { min: e0, max: e1, ticki: [e0, e1], format: (v) => f.liczba(v) }, nad: pasma(true), naHover: sync, opis: 'Profil wysokości' }));
    wykresy.push(W.linie($('#s-v'), { wys: 80, m: { l: 30, r: 0, t: 4, b: 2 }, krzywa: 'linia', serie: [{ pts: P.d.map((k, i) => [k, P.v[i]]), klasa: 's-cienki' }], x: { min: 0, max: maxKm, ticki: [] }, y: { min: 10, max: 50, ticki: [20, 40], format: (v) => f.liczba(v) }, tlo: pasma(false), naHover: sync, opis: 'Prędkość' }));
    wykresy.push(W.linie($('#s-hr'), { wys: 100, m: { l: 30, r: 0, t: 4, b: 22 }, krzywa: 'linia', serie: [{ pts: P.d.map((k, i) => [k, P.hr[i]]), klasa: 's-cienki' }], x: { min: 0, max: maxKm, ticki: tk }, y: { min: 90, max: 190, ticki: [100, 140, 180], format: (v) => f.liczba(v) }, tlo: pasma(false), naHover: sync, opis: 'Tętno' }));

    // odcinki
    const O = K.ostatnia.odcinki, mx = Math.max(...O.map((o) => o.predkosc)), mn = Math.min(...O.map((o) => o.predkosc));
    $('#odcinki').append(h('table', { class: 't-proste' },
      h('thead', null, h('tr', null, h('th', { text: 'Km' }), h('th', { class: 'num', text: 'Czas' }), h('th', { class: 'num', text: 'km/h' }), h('th', { class: 'kres' }), h('th', { class: 'num', text: 'Tętno' }))),
      h('tbody', null, O.map((o) => h('tr', { class: o.predkosc === mx ? 'naj' : '' },
        h('td', { text: `${f.liczba(o.od)}–${f.liczba(o.do)}` }), h('td', { class: 'num', text: f.czas(o.czas) }), h('td', { class: 'num', text: f.liczba(o.predkosc, 1) }),
        h('td', { class: 'kres' }, h('div', { class: 'kres-tor' }, h('i', { class: o.predkosc === mx ? 'czerwony' : '', style: { width: (15 + 85 * (o.predkosc - mn) / (mx - mn || 1)).toFixed(1) + '%' } }))),
        h('td', { class: 'num', text: String(o.tetno) }))))));
    // segmenty na trasie
    $('#seg-dzis').append(h('table', { class: 't-proste' },
      h('thead', null, h('tr', null, h('th', { text: 'Segment' }), h('th', { class: 'num', text: 'Dziś' }), h('th', { class: 'num', text: 'Rekord' }), h('th', { class: 'num', text: 'Różnica' }))),
      h('tbody', null, P.segmenty.map((s) => {
        const seg = K.segmenty[s.id], pr = seg.historia.find((x) => x.jazda === J.id) || seg.ostatnia, r = pr.czas - seg.pr;
        return h('tr', null, h('td', { class: 'mocno', text: seg.nazwa }), h('td', { class: 'num', text: f.tempoSeg(pr.czas) }), h('td', { class: 'num', text: f.tempoSeg(seg.pr) }), h('td', { class: 'num', text: r <= 0 ? 'Rekord' : '+' + r + ' s' }));
      }))));
  })();

  // ───────── 05 · objętość ─────────
  (function objetosc() {
    const tyg = K.tygodnie.map((t) => {
      const od = t.od, doo = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 7);
      const jj = K.jazdy.filter((j) => j.data >= od && j.data < doo);
      const s = (typ, k) => jj.filter((j) => j.typ === typ).reduce((a, j) => a + j[k], 0);
      return { t, km: [s('szosa', 'km'), s('zwift', 'km')], czas: [s('szosa', 'czas') / 3600, s('zwift', 'czas') / 3600], przewyzszenie: [s('szosa', 'przewyzszenie'), s('zwift', 'przewyzszenie')] };
    });
    const MI = { km: { t: 'Kilometry tygodniowo', u: 'km', f: (v) => f.liczba(v) }, czas: { t: 'Godziny tygodniowo', u: 'h', f: (v) => f.liczba(v, 1) }, przewyzszenie: { t: 'Metry w górę tygodniowo', u: 'm', f: (v) => f.liczba(v) } };
    let m = 'km';
    $('#obj-legenda').append(h('span', null, h('i', { class: 'kl kw' }), 'Szosa'), h('span', null, h('i', { class: 'kl kw szary' }), 'Zwift'), h('span', null, h('i', { class: 'kl kw czerwony' }), 'Ten tydzień'));
    const dane = () => tyg.map((w) => {
      const [a, b] = w[m], M = MI[m], od = w.t.od, dd = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 6);
      return { v: a + b, klasa: w.t.biezacy ? 'akcent' : '', czesci: [{ v: a, klasa: 'cz-szosa' }, { v: b, klasa: 'cz-zwift' }],
        tip: () => [W.naglowekTip(`Tydzień ${f.tydzienISO(od)}, ${od.getDate()}–${f.dataKrotka(dd)}`), W.wierszTip(`${M.f(a + b)} ${M.u}`, 'razem'), W.wierszTip(`${M.f(a)} ${M.u}`, 'szosa', 'kw'), W.wierszTip(`${M.f(b)} ${M.u}`, 'Zwift', 'kw s-szary')] };
    });
    const etyk = (i) => { const od = tyg[i].t.od, p = i ? tyg[i - 1].t.od : null; return !p || p.getMonth() !== od.getMonth() ? f.miesiacKr(od.getMonth()) : null; };
    const api = W.slupki($('#obj'), { wys: 300, m: { l: 34, r: 0, t: 18, b: 24 }, maxSzer: 14, promien: 0, odstep: 2, dane: dane(), osY: { ticki: 4, format: (v) => f.liczba(v) }, osX: etyk, wartosc: (d, i) => (i === tyg.length - 1 ? MI[m].f(d.v) : null), opis: 'Objętość tygodniowa' });
    tekstowe($('#obj-miara'), [{ k: 'km', s: 'Kilometry' }, { k: 'czas', s: 'Godziny' }, { k: 'przewyzszenie', s: 'Metry w górę' }], 'km', (k) => { m = k; $('#obj-tytul').textContent = MI[k].t; api.odswiez({ dane: dane() }); });
    W.wykresTabela($('#obj-tab'), $('#obj'), () => W.tabela([{ s: 'Tydzień', f: (w) => `${f.tydzienISO(w.t.od)} · ${f.dataNum(w.t.od)}` }, { s: 'Km', num: 1, f: (w) => f.liczba(w.km[0] + w.km[1]) }, { s: 'Szosa', num: 1, f: (w) => f.liczba(w.km[0]) }, { s: 'Zwift', num: 1, f: (w) => f.liczba(w.km[1]) }, { s: 'Godz.', num: 1, f: (w) => f.liczba(w.czas[0] + w.czas[1], 1) }, { s: 'Jazdy', num: 1, f: (w) => String(w.t.jazdy) }], tyg.slice().reverse(), 'Objętość'));
    $('#miesiace').append(...K.miesiace.map((ms) => h('div', { class: 'ms' + (ms.biezacy ? ' biezacy' : '') }, `${f.miesiacKr(ms.miesiac - 1)} ${String(ms.rok).slice(2)}`, h('b', { text: f.liczba(ms.km) }))));
  })();

  // ───────── 06 · segmenty ─────────
  (function segmenty() {
    let filtr = 'wszystkie', wszystkie = false;
    const host = $('#tab-seg');
    const rysuj = () => {
      const pelne = K.segmenty.filter((s) => filtr === 'wszystkie' || s.typ === filtr).slice().sort((a, b) => b.historia.length - a.historia.length);
      const lista = wszystkie ? pelne : pelne.slice(0, 10);
      host.replaceChildren(h('table', { class: 't-seg' },
        h('thead', null, h('tr', null, h('th', { class: 'nr', text: 'Nr' }), h('th', { text: 'Segment' }), h('th', { class: 'num dl', text: 'Długość' }), h('th', { class: 'num nach', text: 'Nachylenie' }), h('th', { class: 'num', text: 'Rekord' }), h('th', { class: 'num', text: 'Ostatnio' }), h('th', { class: 'spark', text: 'Trend' }), h('th', { class: 'num', text: 'Próby' }))),
        h('tbody', null, lista.map((s, i) => {
          const r = s.ostatnia.czas - s.pr, cz = s.historia.map((x) => x.czas);
          return h('tr', null,
            h('td', { class: 'nr', text: String(i + 1).padStart(2, '0') }),
            h('td', { class: 'nz' }, s.nazwa, h('small', { text: `${s.typ === 'zwift' ? 'Zwift, ' + s.moc + ' W' : 'Szosa'} · rekord ${f.dataNum(s.prData)}` })),
            h('td', { class: 'num dl', text: s.dl >= 1000 ? f.liczba(s.dl / 1000, 2) + ' km' : s.dl + ' m' }),
            h('td', { class: 'num nach', text: f.liczba(s.nach, 1) + '%' }),
            h('td', { class: 'num pr', text: f.tempoSeg(s.pr) }),
            h('td', { class: 'num roz' + (r <= 0 ? ' zero' : ''), text: r <= 0 ? 'Rekord' : '+' + r + ' s' }),
            h('td', { class: 'spark' }, W.sparkline(cz, { szer: 110, wys: 22, odwroc: true, najlepszy: cz.indexOf(Math.min(...cz)), kropkaKonca: false })),
            h('td', { class: 'num', text: String(s.historia.length) }));
        }))));
      if (pelne.length > 10) { const b = h('button', { class: 'wiecej', type: 'button', text: wszystkie ? 'Pokaż mniej' : `Pokaż wszystkie (${pelne.length})` }); b.addEventListener('click', () => { wszystkie = !wszystkie; rysuj(); }); host.append(b); }
    };
    tekstowe($('#seg-filtr'), [{ k: 'wszystkie', s: 'Wszystkie' }, { k: 'szosa', s: 'Szosa' }, { k: 'zwift', s: 'Zwift' }], 'wszystkie', (k) => { filtr = k; rysuj(); });
    rysuj();
  })();

  // ───────── 07 · moc ─────────
  (function moc() {
    const M = K.moc, kl = [0, 4, 6, 8];
    $('#moc-legenda').append(h('span', null, h('i', { class: 'kl' }), 'Cały okres'), h('span', null, h('i', { class: 'kl szary' }), 'Ostatnie 42 dni'));
    W.linie($('#krzywa'), {
      wys: 320, m: { l: 34, r: 16, t: 20, b: 26 },
      serie: [{ pts: M.czasy.map((c, i) => [c, M.wszech[i]]), klasa: 's-czarny', obszar: true, obszarOd: 100 }, { pts: M.czasy.map((c, i) => [c, M.ostatnie42[i]]), klasa: 's-szary' }],
      x: { skala: 'log', min: 5, max: 3600, linie: true, ticki: [[5, '5 s'], [15, '15 s'], [60, '1 min'], [300, '5 min'], [1200, '20 min'], [3600, '60 min']].map(([v, s], k) => ({ v, s, kotwica: k === 0 ? 'start' : k === 5 ? 'end' : 'middle' })) },
      y: { min: 100, max: 900, ticki: [100, 300, 500, 700, 900], format: (v) => f.liczba(v) },
      tip: (i) => [W.naglowekTip(M.etykiety[i]), W.wierszTip(M.wszech[i] + ' W', 'cały okres', 's-czarny'), M.ostatnie42[i] != null ? W.wierszTip(M.ostatnie42[i] + ' W', 'ostatnie 42 dni', 's-szary') : W.wierszTip('—', 'brak próby')],
      nad: ({ g, x, y }) => kl.forEach((i) => { W.svg('circle', { cx: x(M.czasy[i]), cy: y(M.wszech[i]), r: 4.5, class: 'mk-pkt' }, g); W.tekst(g, x(M.czasy[i]) + (i === 0 ? 8 : 0), y(M.wszech[i]) - 11, M.wszech[i] + ' W', { class: 'mk-t', 'text-anchor': i === 0 ? 'start' : 'middle' }); }),
      opis: 'Krzywa mocy z trenażera',
    });
    $('#moc-liczby').append(...kl.map((i) => h('div', { class: 'o' }, h('dt', { text: 'Najlepsze ' + M.etykiety[i] }), h('dd', null, String(M.wszech[i]), h('small', { text: 'W' })))),
      h('div', { class: 'o' }, h('dt', { text: 'Sesje na Zwifcie' }), h('dd', null, String(K.jazdy.filter((j) => j.typ === 'zwift').length), h('small', { text: 'od sierpnia' }))));
  })();

  // ───────── 08 · kalendarz i strefy ─────────
  (function kalendarz() {
    const host = $('#kal');
    const ile = host.clientWidth < 560 ? 26 * 7 : 52 * 7;
    const dni = K.dni.slice(-ile).map((d, i, a) => ({ data: d.data, v: d.km, czas: d.czas, jazdy: d.jazdy, dzis: i === a.length - 1 }));
    W.kalendarz(host, {
      dni, progi: [25, 45, 70], komorka: 13, odstep: 2, promien: 0, etykietyDni: ['pn', '', '', 'cz', '', '', 'nd'], m: { l: 22, t: 16 },
      etykietaMies: (d) => f.miesiacKr(d.getMonth()),
      tip: (d) => [W.naglowekTip(`${f.dzienTyg(d.data)}, ${f.data(d.data)}`), d.jazdy.length ? W.wierszTip(f.km(d.v) + ' km', d.jazdy.map((id) => K.jazdy[id - 1].nazwa).join(', ')) : W.wierszTip('—', 'bez jazdy')],
      opis: 'Kalendarz jazd',
    });
    const akt = dni.filter((d) => d.jazdy.length).length;
    const skala = h('div', { class: 'kal-skala' }); [0, 1, 2, 3, 4].forEach((p) => { const s = W.svg('svg', { width: 14, height: 14 }); W.svg('rect', { width: 14, height: 14, class: 'wk-p' + p }, s); skala.append(s); });
    $('#kal-stopka').append(
      h('div', null, 'Aktywne dni', h('b', { text: `${akt}` })),
      h('div', null, 'Seria tygodni', h('b', { text: String(K.seria.tygodnie) })),
      h('div', null, 'Najdłuższa seria', h('b', { text: String(K.seria.najdluzsza) })),
      h('div', null, 'Skala: 0 · 25 · 45 · 70 km', skala));
    // strefy jako jeden pasek podzielony na części
    const Z = K.strefy;
    const pasek = h('div', { class: 'strefy-pasek', role: 'img', 'aria-label': 'Udział stref tętna: ' + Z.map((z) => `Z${z.nr} ${f.procent(z.udzial)}`).join(', ') });
    for (const z of Z) { const el = h('div', { class: 'z' + z.nr, style: { flex: z.udzial + ' 1 0' }, title: `Z${z.nr} ${z.nazwa}: ${f.procent(z.udzial)}, ${f.czasHM(z.czas)}` }); if (z.udzial > 0.07) el.textContent = f.procent(z.udzial); pasek.append(el); }
    $('#strefy').append(pasek, h('div', { class: 'strefy-legenda' }, Z.map((z) => h('div', null, h('b', null, h('i', { class: 'z' + z.nr }), `Z${z.nr} ${z.nazwa}`), `${z.nr === 5 ? z.od + '+' : (z.od || '<') + (z.od ? '–' : '') + z.do} bpm · ${f.czasHM(z.czas)}`))));
  })();

  // ───────── 09 · rekordy ─────────
  $('#rek').append(...K.rekordy.map((r) => h('div', { class: 'rek' },
    h('div', { class: 'l', text: r.nazwa }),
    h('div', { class: 'v' }, f.liczba(r.wartosc, r.jednostka === 'km/h' || r.klucz === 'dystans' ? 1 : 0), h('small', { text: r.jednostka })),
    h('div', { class: 'd' }, h('b', { text: f.dataNum(r.data) }), ' · ' + r.opis))));

  // ───────── 10 · jazdy ─────────
  (function jazdy() {
    $('#jazdy-opis').textContent = `${K.jazdy.length} jazd od 1 sierpnia 2025. Poniżej dwanaście ostatnich.`;
    const jj = K.jazdy.slice(-12).reverse();
    $('#tab-jazdy').append(h('table', { class: 't-jazdy' },
      h('thead', null, h('tr', null, h('th', { text: 'Data' }), h('th', { text: 'Jazda' }), h('th', { class: 'ukryj-m', text: 'Rodzaj' }), h('th', { class: 'num', text: 'Km' }), h('th', { class: 'num', text: 'Czas' }), h('th', { class: 'num ukryj-m', text: 'km/h' }), h('th', { class: 'num ukryj-m', text: 'Tętno' }), h('th', { class: 'num ukryj-m', text: 'Moc' }))),
      h('tbody', null, jj.map((j) => h('tr', null,
        h('td', { class: 'data', text: `${f.dzienTygKr(j.data)} ${f.dataNumKr(j.data)}` }),
        h('td', { class: 'nz', text: j.nazwa.replace('Zwift · ', '') }),
        h('td', { class: 'typ ukryj-m' }, h('i', { class: j.typ === 'zwift' ? 'zw' : '' }), j.typ === 'zwift' ? 'Zwift' : 'Szosa'),
        h('td', { class: 'num', text: f.km(j.km) }), h('td', { class: 'num', text: f.czas(j.czas) }),
        h('td', { class: 'num ukryj-m', text: f.liczba(j.predkosc, 1) }), h('td', { class: 'num ukryj-m', text: String(j.tetno) }), h('td', { class: 'num ukryj-m', text: j.moc ? j.moc + ' W' : '—' }))))));
  })();

  // ───────── aktywna pozycja spisu ─────────
  (function spis() {
    const linki = [...document.querySelectorAll('.spis a')];
    const sek = linki.map((a) => document.querySelector(a.getAttribute('href')));
    const io = new IntersectionObserver((w) => w.forEach((x) => { if (x.isIntersecting) { const i = sek.indexOf(x.target); linki.forEach((a, k) => a.classList.toggle('aktywny', k === i)); } }), { rootMargin: '-40% 0px -55% 0px' });
    sek.forEach((s) => s && io.observe(s));
  })();
  W.typografia(document.body);
})();
