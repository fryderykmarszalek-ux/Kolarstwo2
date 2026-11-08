/* TELEMETRIA — logika strony */
(function () {
  'use strict';
  const K = window.K2, f = K.fmt, h = W.h;
  const $ = (s) => document.querySelector(s);
  const J = K.ostatnia.jazda, P = K.ostatnia.probki;

  // ───────── zegar i data ─────────
  const zegar = () => { const d = new Date(); $('#zegar').textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':'); };
  zegar(); setInterval(zegar, 1000);
  $('#dzisiaj').textContent = `${f.dzienTyg(K.dzis)} · ${f.data(K.dzis)} · tydzień ${f.tydzienISO(K.dzis)}`;

  // ───────── ikony statusu (kolor zawsze z ikoną i etykietą) ─────────
  function ikonaStatusu(s) {
    const svg = W.svg('svg', { width: 22, height: 22, viewBox: '0 0 22 22', 'aria-hidden': 'true' });
    const kol = s === 'good' ? 'var(--dobry)' : s === 'warning' ? 'var(--uwaga)' : 'var(--zle)';
    if (s === 'good') { W.svg('circle', { cx: 11, cy: 11, r: 9, fill: 'none', stroke: kol, 'stroke-width': 1.6 }, svg); W.svg('path', { d: 'M7 11.3l2.6 2.6L15 8.6', fill: 'none', stroke: kol, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg); }
    else if (s === 'warning') { W.svg('path', { d: 'M11 2.8L20 18.5H2z', fill: 'none', stroke: kol, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, svg); W.svg('path', { d: 'M11 8.5v4.6', stroke: kol, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, svg); W.svg('circle', { cx: 11, cy: 15.6, r: 1.05, fill: kol }, svg); }
    else { W.svg('path', { d: 'M7.3 2.5h7.4l4.8 4.8v7.4l-4.8 4.8H7.3l-4.8-4.8V7.3z', fill: 'none', stroke: kol, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, svg); W.svg('path', { d: 'M11 7v5', stroke: kol, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, svg); W.svg('circle', { cx: 11, cy: 15, r: 1.05, fill: kol }, svg); }
    return svg;
  }
  const przyciski = (host, opcje, aktywny, naKlik) => {
    const bs = opcje.map((o) => {
      const b = h('button', { type: 'button', 'aria-pressed': String(o.k === aktywny), text: o.s });
      b.addEventListener('click', () => { bs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); naKlik(o.k); });
      return b;
    });
    host.append(...bs);
  };

  // ───────── 0 · pola okresu ─────────
  const tygodniWOkresie = (o) => Math.max(1, (o.do - o.od) / 86400000 / 7);
  const POLA = [
    { k: 'km', l: 'Dystans', u: 'km', v: (o) => f.km(o.km), d: 'proc', sr: (o) => `${f.km(o.km / tygodniWOkresie(o))} km / tydz.` },
    { k: 'czas', l: 'Czas jazdy', u: 'h', v: (o) => { const m = Math.round(o.czas / 60); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; }, d: 'proc', sr: (o) => `${f.liczba(o.czas / 3600 / tygodniWOkresie(o), 1)} h / tydz.` },
    { k: 'przewyzszenie', l: 'Przewyższenie', u: 'm', v: (o) => f.liczba(o.przewyzszenie), d: 'proc', sr: (o) => `${f.liczba(o.przewyzszenie / Math.max(1, o.km) * 10, 1)} m / 10 km` },
    { k: 'jazdy', l: 'Jazdy', u: '', v: (o) => String(o.jazdy), d: 'abs', sr: (o) => `${o.szosa} szosa · ${o.zwift} Zwift` },
    { k: 'predkosc', l: 'Śr. prędkość', u: 'km/h', v: (o) => f.liczba(o.predkosc, 1), d: 'abs1', sr: () => 'szosa i Zwift razem' },
    { k: 'obciazenie', l: 'Obciążenie', u: 'pkt', v: (o) => f.liczba(o.obciazenie), d: 'proc', sr: (o) => `${f.liczba(o.obciazenie / tygodniWOkresie(o))} pkt / tydz.` },
  ];
  const kpi = $('#kpi');
  const polaEl = POLA.map((p) => {
    const v = h('span', { class: 'pole-v-t' }), d = h('div', { class: 'pole-d' }), sp = h('div', { class: 'pole-spark', 'aria-hidden': 'true' });
    const el = h('div', { class: 'pole' }, h('div', { class: 'pole-l', text: p.l }), sp, h('div', { class: 'pole-v' }, v, p.u ? h('span', { class: 'pole-u', text: p.u }) : null), d);
    kpi.append(el);
    return { p, v, d, sp };
  });
  // trend: 12 ostatnich tygodni (dla tygodnia) albo miesięcy (dla reszty)
  const trend = (k, klucz) => {
    const zrodlo = k === 'tydzien' ? K.tygodnie.slice(-12) : k === 'miesiac' ? K.miesiace.slice(-12) : K.miesiace;
    return zrodlo.map((o) => o[klucz]);
  };
  function ustawOkres(k) {
    const o = K.okresy[k], pr = o.poprzedni;
    for (const { p, v, d, sp } of polaEl) {
      sp.replaceChildren(W.sparkline(trend(k, p.k), { szer: 64, wys: 22, krzywa: 'linia' }));
      v.textContent = p.v(o);
      d.replaceChildren();
      if (pr && p.d) {
        let tekst, gora;
        if (p.d === 'proc') { const ch = pr[p.k] ? (o[p.k] - pr[p.k]) / pr[p.k] : 0; gora = ch >= 0; tekst = `${gora ? '▲' : '▼'} ${f.liczba(Math.abs(ch) * 100)}%`; }
        else if (p.d === 'abs') { const ch = o[p.k] - pr[p.k]; gora = ch >= 0; tekst = `${gora ? '▲' : '▼'} ${Math.abs(ch)}`; }
        else { const ch = o[p.k] - pr[p.k]; gora = ch >= 0; tekst = `${gora ? '▲' : '▼'} ${f.liczba(Math.abs(ch), 1)}`; }
        d.append(h('b', { class: gora ? 'gora-d' : 'dol-d', text: tekst }), h('span', { class: 'dl', text: ` vs ${pr.etykieta}` }), h('span', { class: 'kr', text: k === 'tydzien' ? ' vs tydz. wcz.' : ' vs 1–7 paź' }));
      } else d.textContent = p.sr(o);
    }
    kpi.classList.remove('zmiana'); void kpi.offsetWidth; kpi.classList.add('zmiana');
  }
  przyciski($('#okresy'), [{ k: 'tydzien', s: 'Tydzień' }, { k: 'miesiac', s: 'Miesiąc' }, { k: 'rok', s: '2026' }, { k: 'wszystko', s: 'Wszystko' }], 'tydzien', ustawOkres);
  ustawOkres('tydzien');

  // ───────── 1 · forma ─────────
  (function forma() {
    const F = K.forma;
    const fl = (nazwa, skrot, wart, klucz, pod) => h('div', { class: 'fl' },
      h('div', { class: 'fl-l' }, klucz ? h('i', { class: 'kl ' + klucz }) : null, nazwa),
      h('div', { class: 'fl-v', text: (wart < 0 ? '−' : '') + f.liczba(Math.abs(wart)) }),
      h('div', { class: 'fl-s' }, h('span', { class: 'fl-skrot', text: skrot }), h('span', { class: 'fl-pod' + (klucz === 'kl-akcent' ? ' zostaw' : '') }, pod)));
    const host = $('#forma-tresc');
    host.append(
      h('div', { class: 'forma-liczby' },
        fl('Forma', 'CTL', F.ctl, 'kl-akcent', [h('b', { text: f.znak(F.zmiana7, 1) }), ' w 7 dni']),
        fl('Zmęczenie', 'ATL', F.atl, 'kl-szary', 'ostatnie 7 dni'),
        fl('Świeżość', 'TSB', F.tsb, null, 'forma − zmęczenie')),
      h('div', { class: 'stan s-' + F.status }, h('div', { class: 'stan-ikona' }, ikonaStatusu(F.status)), h('div', null, h('b', { text: F.nazwa }), h('p', { text: F.opis }))),
    );
    // wskaźnik świeżości: strefy z przerwą 2 px i wskazówka
    const wsk = h('div', { class: 'wskaznik', role: 'img', 'aria-label': `Świeżość ${f.liczba(F.tsb)} — ${F.nazwa}` });
    host.append(wsk);
    const STR = [{ od: -45, do: -30, s: 'Przeciąż.' }, { od: -30, do: -10, s: 'Budowanie' }, { od: -10, do: 15, s: 'Równowaga' }, { od: 15, do: 30, s: 'Świeży' }];
    W.rozmiar(wsk, (szer) => {
      wsk.replaceChildren();
      const H = 58, svg = W.svg('svg', { width: szer, height: H, viewBox: `0 0 ${szer} ${H}` }, wsk);
      const x = W.skala(-45, 30, 0, szer);
      STR.forEach((s) => {
        const akt = F.tsb >= s.od && F.tsb < s.do;
        W.svg('rect', { x: x(s.od) + (s.od > -45 ? 1 : 0), y: 18, width: x(s.do) - x(s.od) - (s.od > -45 ? 1 : 0) - (s.do < 30 ? 1 : 0), height: 8, class: 'wsk-strefa' + (akt ? ' aktywna' : '') }, svg);
        W.tekst(svg, (x(s.od) + x(s.do)) / 2, 44, s.s, { class: 'wsk-t', 'text-anchor': 'middle' });
      });
      [-30, -10, 15].forEach((t) => W.tekst(svg, x(t), 56, (t > 0 ? '+' : t < 0 ? '−' : '') + Math.abs(t), { class: 'wsk-t', 'text-anchor': 'middle', opacity: 0.7 }));
      const px = x(Math.max(-45, Math.min(30, F.tsb)));
      W.svg('path', { d: `M${px - 5},6 L${px + 5},6 L${px},13 Z`, class: 'wsk-wsk' }, svg);
      W.svg('line', { x1: px, x2: px, y1: 14, y2: 28, stroke: 'var(--tekst)', 'stroke-width': 2 }, svg);
      W.tekst(svg, Math.min(szer - 2, Math.max(2, px + 9)), 10, `TSB ${f.znak(Math.round(F.tsb))}`, { class: 'wsk-wart', 'text-anchor': px > szer - 60 ? 'end' : 'start' });
    });
  })();

  // ───────── 2 · PMC + TSB ─────────
  (function pmc() {
    const dni = K.dni.slice(-180);
    const ticki = [];
    dni.forEach((d, i) => { if (d.data.getDate() === 1) ticki.push({ v: i, s: f.miesiacKr(d.data.getMonth()).toUpperCase() }); });
    $('#pmc-legenda').append(h('span', null, h('i', { class: 'kl kl-akcent' }), 'Forma'), h('span', null, h('i', { class: 'kl kl-szary' }), 'Zmęczenie'));
    const tipDnia = (i) => {
      const d = dni[i];
      return [W.naglowekTip(`${f.dzienTygKr(d.data)} ${f.dataKrotka(d.data)}`),
        W.wierszTip(f.liczba(d.ctl), 'forma', 's-akcent'), W.wierszTip(f.liczba(d.atl), 'zmęczenie', 's-szary'),
        W.wierszTip(f.znak(Math.round(d.ctl - d.atl)), 'świeżość', d.ctl - d.atl >= 0 ? 's-plus' : 's-minus'),
        d.obciazenie ? W.wierszTip(f.liczba(d.obciazenie), 'obciążenie dnia') : W.wierszTip('—', 'dzień wolny')];
    };
    let tsbApi = null;
    const api = W.linie($('#pmc'), {
      wys: 230, m: { l: 30, r: 10, t: 12, b: 26 },
      serie: [
        { klucz: 'ctl', pts: dni.map((d, i) => [i, d.ctl]), klasa: 's-akcent', obszar: true, koniec: true },
        { klucz: 'atl', pts: dni.map((d, i) => [i, d.atl]), klasa: 's-szary' },
      ],
      x: { ticki, linie: false }, y: { min: 0, ticki: 4, format: (v) => f.liczba(v) },
      tip: tipDnia, naHover: (i) => tsbApi && tsbApi.zaznacz(i),
      opis: 'Forma i zmęczenie w ostatnich 180 dniach',
    });
    // świeżość: słupki w górę i w dół od zera
    const host = $('#tsb');
    host.classList.add('wk');
    const tip = W.tooltip(host);
    let svg = null, slupki = [];
    tsbApi = { zaznacz: (i) => { slupki.forEach((s, k) => s.classList.toggle('wk-aktywny', k === i)); if (svg) svg.classList.toggle('wk-hover', i >= 0); } };
    W.rozmiar(host, (szer) => {
      if (svg) svg.remove();
      const H = 64, m = { l: 30, r: 10 };
      svg = W.svg('svg', { width: szer, height: H, class: 'wk-svg', role: 'img', 'aria-label': 'Świeżość dzień po dniu' });
      host.prepend(svg);
      const maks = Math.max(30, ...dni.map((d) => Math.abs(d.ctl - d.atl)));
      const y = W.skala(-maks, maks, H - 4, 4), pasmo = (szer - m.l - m.r) / dni.length, w = Math.max(1, pasmo - 1);
      W.svg('line', { x1: m.l, x2: szer - m.r, y1: y(0), y2: y(0), class: 'wk-baza' }, svg);
      W.tekst(svg, m.l - 8, y(maks * 0.7) + 3, '+', { class: 'wk-os-t', 'text-anchor': 'end' });
      W.tekst(svg, m.l - 8, y(-maks * 0.7) + 3, '−', { class: 'wk-os-t', 'text-anchor': 'end' });
      slupki = dni.map((d, i) => {
        const t = d.ctl - d.atl, x = m.l + i * pasmo;
        const g = W.svg('g', { class: 'wk-sl ' + (t >= 0 ? 'tsb-plus' : 'tsb-minus') }, svg);
        const hh = Math.abs(y(t) - y(0));
        W.svg('path', { d: t >= 0 ? W.slupek(x, y(t), w, hh, 1.5) : W.slupek(x, y(0), w, hh, 1.5, true), class: 'wk-slupek' }, g);
        return g;
      });
      const hit = W.svg('rect', { x: m.l, y: 0, width: szer - m.l - m.r, height: H, fill: 'transparent' }, svg);
      hit.addEventListener('pointermove', (e) => {
        const r = svg.getBoundingClientRect(), i = Math.max(0, Math.min(dni.length - 1, Math.floor((e.clientX - r.left - m.l) / pasmo)));
        tsbApi.zaznacz(i); api.ustawKursor(i);
        const t = dni[i].ctl - dni[i].atl;
        tip.pokaz(m.l + i * pasmo, y(Math.max(0, t)), [W.naglowekTip(`${f.dzienTygKr(dni[i].data)} ${f.dataKrotka(dni[i].data)}`), W.wierszTip(f.znak(Math.round(t)), 'świeżość', t >= 0 ? 's-plus' : 's-minus')]);
      });
      hit.addEventListener('pointerleave', () => { tsbApi.zaznacz(-1); api.ustawKursor(-1); tip.ukryj(); });
    });
    W.wykresTabela($('#pmc-tab'), $('#pmc').parentElement.querySelector('#pmc'), () => W.tabela(
      [{ s: 'Dzień', f: (d) => f.dataNum(d.data) }, { s: 'Forma', num: 1, f: (d) => f.liczba(d.ctl, 1) }, { s: 'Zmęczenie', num: 1, f: (d) => f.liczba(d.atl, 1) }, { s: 'Świeżość', num: 1, f: (d) => f.znak(d.ctl - d.atl, 1) }, { s: 'Obciążenie', num: 1, f: (d) => f.liczba(d.obciazenie) }],
      dni.slice().reverse(), 'Forma, zmęczenie i świeżość — 180 dni'));
  })();

  // ───────── 3 · ostatnia jazda ─────────
  (function jazda() {
    $('#jazda-nazwa').textContent = J.nazwa;
    $('#jazda-kiedy').append(h('span', { class: 'tag szosa', text: 'Szosa' }), `${f.dzienTyg(J.data)} ${f.dataNum(J.data)} · start ${f.godzina(J.data)}`, h('span', { text: '· Konstancin-Jeziorna' }));

    // odczyty — podsumowanie albo wartości w punkcie kursora
    const ODCZ = [
      { s: ['Dystans', 'Dystans'], u: 'km' }, { s: ['Czas jazdy', 'Czas'], u: '' }, { s: ['Śr. prędkość', 'Prędkość'], u: 'km/h' },
      { s: ['Śr. tętno', 'Tętno'], u: 'bpm' }, { s: ['Przewyższenie', 'Wysokość'], u: 'm' }, { s: ['Kadencja', 'Nachylenie'], u: '' },
    ];
    const odczEl = ODCZ.map((o) => { const l = h('div', { class: 'o-l' }), v = h('div', { class: 'o-v' }); $('#odczyty').append(h('div', { class: 'odczyt' }, l, v)); return { o, l, v }; });
    const tryb = $('#odczyt-tryb');
    const ustawOdczyty = (i) => {
      const live = i >= 0;
      const w = live
        ? [[f.liczba(P.d[i], 1), 'km'], [f.czas(P.t[i]), ''], [f.liczba(P.v[i], 1), 'km/h'], [String(P.hr[i]), 'bpm'], [f.liczba(P.ele[i]), 'm n.p.m.'], [(P.grade[i] > 0 ? '+' : P.grade[i] < 0 ? '−' : '') + f.liczba(Math.abs(P.grade[i]), 1), '%']]
        : [[f.liczba(J.km, 1), 'km'], [f.czas(J.czas), ''], [f.liczba(J.predkosc, 1), 'km/h'], [String(J.tetno), 'bpm'], [f.liczba(J.przewyzszenie), 'm'], [String(J.kadencja), 'rpm']];
      odczEl.forEach(({ o, l, v }, k) => { l.textContent = o.s[live ? 1 : 0]; v.replaceChildren(w[k][0], w[k][1] ? h('small', { text: w[k][1] }) : ''); });
      tryb.textContent = live ? `Punkt na trasie · km ${f.liczba(P.d[i], 1)}` : 'Podsumowanie jazdy';
      tryb.classList.toggle('na-zywo', live);
    };
    ustawOdczyty(-1);

    // strumienie: jedna oś X (km), każdy z własną osią Y — trzy osobne wykresy, nigdy dwie osie na jednym
    const maxKm = P.d[P.d.length - 1];
    const tickiKm = []; for (let k = 0; k <= maxKm; k += 10) tickiKm.push({ v: k, s: String(k) });
    tickiKm.push({ v: maxKm, s: 'km', kotwica: 'end' });
    const pasma = (pokazNazwy) => ({ g, x, m, H }) => {
      for (const s of P.segmenty) {
        const x0 = x(s.od), x1 = x(s.do);
        W.svg('rect', { x: x0, y: m.t, width: Math.max(1, x1 - x0), height: H - m.t - m.b, class: 'wk-pasmo' }, g);
        W.svg('line', { x1: x0, x2: x0, y1: m.t, y2: H - m.b, class: 'wk-pasmo-l' }, g);
        if (pokazNazwy) {
          const t = W.tekst(g, x0 + 4, m.t + 9, s.nazwa.toUpperCase(), { class: 'wk-pasmo-t' });
          if (x1 - x0 < s.nazwa.length * 5.4 + 8) t.remove();
        }
      }
    };
    const zakres = (arr, krok, zapas) => [Math.floor((Math.min(...arr) - zapas) / krok) * krok, Math.ceil((Math.max(...arr) + zapas) / krok) * krok];
    const [e0, e1] = zakres(P.ele, 10, 3), [v0, v1] = [10, Math.ceil(Math.max(...P.v) / 10) * 10], [h0, h1] = [90, 190];
    const wykresy = [];
    const sync = (i) => { wykresy.forEach((w) => w.ustawKursor(i)); ustawOdczyty(i); mapaKursor(i); };
    wykresy.push(W.linie($('#s-wys'), { wys: 104, m: { l: 34, r: 6, t: 4, b: 4 }, krzywa: 'linia', serie: [{ pts: P.d.map((k, i) => [k, P.ele[i]]), klasa: 's-wys', obszar: true, obszarOd: e0 }], x: { min: 0, max: maxKm, ticki: [] }, y: { min: e0, max: e1, ticki: [e0, Math.round((e0 + e1) / 20) * 10, e1], format: (v) => f.liczba(v) }, tlo: pasma(true), naHover: sync, opis: 'Profil wysokości' }));
    wykresy.push(W.linie($('#s-v'), { wys: 84, m: { l: 34, r: 6, t: 4, b: 4 }, krzywa: 'linia', serie: [{ pts: P.d.map((k, i) => [k, P.v[i]]), klasa: 's-v', obszar: true, obszarOd: v0 }], x: { min: 0, max: maxKm, ticki: [] }, y: { min: v0, max: v1, ticki: [20, 30, 40].filter((t) => t < v1), format: (v) => f.liczba(v) }, tlo: pasma(false), naHover: sync, opis: 'Prędkość' }));
    wykresy.push(W.linie($('#s-hr'), { wys: 104, m: { l: 34, r: 6, t: 4, b: 22 }, krzywa: 'linia', serie: [{ pts: P.d.map((k, i) => [k, P.hr[i]]), klasa: 's-hr', obszar: true, obszarOd: h0 }], x: { min: 0, max: maxKm, ticki: tickiKm }, y: { min: h0, max: h1, ticki: [100, 140, 180], format: (v) => f.liczba(v) }, tlo: pasma(false), naHover: sync, opis: 'Tętno' }));

    // mapa
    const host = $('#mapa');
    const trasa = P.x.map((x, i) => [x, P.y[i]]);
    const bb = W.bbox(trasa, 1.6);
    const M = K.mapa;
    const kontury = W.kontury(M.wysokosc, Math.max(-1, bb[0] - 8), Math.max(-1, bb[1] - 8), Math.min(M.szer + 1, bb[2] + 8), Math.min(M.wys + 1, bb[3] + 8), 0.2, Array.from({ length: 22 }, (_, k) => 84 + k * 2));
    let rzut = null, kursor = null, krzyzH = null, krzyzV = null, przejechana = null;
    const sciezka = (pts) => 'M' + pts.map((p) => { const q = rzut(p); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('L');
    function mapaKursor(i) {
      if (!kursor) return;
      if (i < 0) { kursor.style.opacity = 0; krzyzH.style.opacity = 0; krzyzV.style.opacity = 0; przejechana.setAttribute('d', ''); return; }
      const q = rzut(trasa[i]);
      kursor.setAttribute('transform', `translate(${q[0].toFixed(1)},${q[1].toFixed(1)})`); kursor.style.opacity = 1;
      krzyzH.setAttribute('y1', q[1]); krzyzH.setAttribute('y2', q[1]); krzyzV.setAttribute('x1', q[0]); krzyzV.setAttribute('x2', q[0]);
      krzyzH.style.opacity = 1; krzyzV.style.opacity = 1;
      przejechana.setAttribute('d', sciezka(trasa.slice(0, i + 1)));
    }
    W.rozmiar(host, (szer) => {
      host.replaceChildren();
      const wys = host.clientHeight;
      // dopasuj widok do proporcji okna
      const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
      let bw = bb[2] - bb[0], bh = bb[3] - bb[1];
      if (bw / bh > szer / wys) bh = bw * wys / szer; else bw = bh * szer / wys;
      rzut = W.rzut([cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2], szer, wys, 10);
      const svg = W.svg('svg', { viewBox: `0 0 ${szer} ${wys}`, role: 'img', 'aria-label': `Mapa trasy: ${J.nazwa}` }, host);
      const gk = W.svg('g', null, svg);
      for (const k of kontury) for (const l of k.linie) if (l.length > 3) W.svg('path', { d: sciezka(l), class: 'm-kontur' + (k.poziom % 10 === 0 ? ' gruby' : '') }, gk);
      W.svg('path', { d: sciezka(M.rzeka), class: 'm-rzeka', 'stroke-width': Math.max(6, 0.5 * rzut.s) }, svg);
      W.svg('path', { d: sciezka(M.jeziorka), class: 'm-dopływ' }, svg);
      const gd = W.svg('g', null, svg);
      for (const d of M.drogi) W.svg('path', { d: sciezka(d.pts), class: 'm-droga' + (d.rodzaj === 'wal' ? ' wal' : '') }, gd);
      // podpis rzeki wzdłuż nurtu
      { const a = rzut([M.rzeka[30][0], M.rzeka[30][1]]), b = rzut([M.rzeka[38][0], M.rzeka[38][1]]); const kat = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; const t = W.tekst(svg, 0, 0, 'Wisła', { class: 'm-woda', 'text-anchor': 'middle', transform: `translate(${((a[0] + b[0]) / 2 + 16).toFixed(1)},${((a[1] + b[1]) / 2).toFixed(1)}) rotate(${(kat - (kat > 90 ? 180 : 0)).toFixed(1)})` }); }
      for (const m of M.miejsca) {
        if (m.dom) continue; // start/meta jest właśnie tutaj
        const q = rzut([m.x, m.y]); if (q[0] < 20 || q[0] > szer - 20 || q[1] < 24 || q[1] > wys - 20) continue;
        W.svg('circle', { cx: q[0], cy: q[1], r: m.typ === 'miasto' ? 2.5 : 1.8, fill: 'var(--tekst-4)' }, svg);
        W.tekst(svg, q[0] + 6, q[1] - 5, m.nazwa, { class: 'm-miejsce' + (m.dom ? ' dom' : '') });
      }
      krzyzH = W.svg('line', { x1: 0, x2: szer, class: 'm-krzyz', style: 'opacity:0' }, svg);
      krzyzV = W.svg('line', { y1: 0, y2: wys, class: 'm-krzyz', style: 'opacity:0' }, svg);
      W.svg('path', { d: sciezka(trasa), class: 'm-poswiata' }, svg);
      for (const s of P.segmenty) { const a = Math.round(s.od * 10), b = Math.round(s.do * 10); W.svg('path', { d: sciezka(trasa.slice(a, b + 1)), class: 'm-seg' }, svg); }
      W.svg('path', { d: sciezka(trasa), class: 'm-trasa' }, svg);
      przejechana = W.svg('path', { d: '', class: 'm-przejechana' }, svg);
      for (let k = 10; k < maxKm - 3; k += 10) {
        const q = rzut(trasa[k * 10]); const g = W.svg('g', { class: 'm-km', transform: `translate(${q[0].toFixed(1)},${q[1].toFixed(1)})` }, svg);
        W.svg('rect', { x: -9, y: -7, width: 18, height: 14, rx: 2 }, g); W.tekst(g, 0, 3, String(k), { 'text-anchor': 'middle' });
      }
      const st = rzut(trasa[0]); const gs = W.svg('g', { class: 'm-start', transform: `translate(${st[0].toFixed(1)},${st[1].toFixed(1)})` }, svg);
      W.svg('circle', { r: 6 }, gs); W.tekst(gs, 11, -9, 'START · META', {}); W.tekst(gs, 11, 3, 'KONSTANCIN', { class: 'm-miejsce dom' });
      // podziałka i północ
      const km2 = 2 * rzut.s, sx = 16, sy = wys - 18;
      const gsk = W.svg('g', { class: 'm-skala' }, svg);
      W.svg('line', { x1: sx, x2: sx + km2, y1: sy, y2: sy }, gsk); W.svg('line', { x1: sx, x2: sx, y1: sy - 4, y2: sy + 1 }, gsk); W.svg('line', { x1: sx + km2, x2: sx + km2, y1: sy - 4, y2: sy + 1 }, gsk);
      W.tekst(gsk, sx + km2 + 8, sy + 3, '2 KM', {});
      const gn = W.svg('g', { class: 'm-polnoc', transform: `translate(${szer - 22},${24})` }, svg);
      W.svg('path', { d: 'M0,-10 L4,2 L0,-1 L-4,2 Z' }, gn); W.tekst(gn, 0, 14, 'N', { 'text-anchor': 'middle' });
      kursor = W.svg('g', { class: 'm-kursor', style: 'opacity:0' }, svg);
      W.svg('circle', { r: 11, class: 'r2' }, kursor); W.svg('circle', { r: 5.5, class: 'r1' }, kursor);
      host.append(h('div', { class: 'mapa-wsp', text: 'Mapa poglądowa · teren z modelu' }));
      // najeżdżanie na mapę: najbliższy punkt trasy
      svg.addEventListener('pointermove', (e) => {
        const r = svg.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
        let best = -1, bd = 26 * 26;
        for (let i = 0; i < trasa.length; i += 2) { const q = rzut(trasa[i]); const d = (q[0] - px) ** 2 + (q[1] - py) ** 2; if (d < bd) { bd = d; best = i; } }
        sync(best);
      });
      svg.addEventListener('pointerleave', () => sync(-1));
    });

    // odcinki 5 km
    const maxV = Math.max(...K.ostatnia.odcinki.map((o) => o.predkosc)), minV = Math.min(...K.ostatnia.odcinki.map((o) => o.predkosc));
    $('#odcinki').append(h('table', { class: 'tab-odcinki' },
      h('thead', null, h('tr', null, ['Odcinek', 'Czas', 'Prędkość', '', 'Tętno', 'Wys.'].map((s, i) => h('th', { class: i && i !== 3 ? 'num' : null, text: s })))),
      h('tbody', null, K.ostatnia.odcinki.map((o) => h('tr', null,
        h('td', { text: `${f.liczba(o.od)}–${f.liczba(o.do)} km` }), h('td', { class: 'num', text: f.czas(o.czas) }), h('td', { class: 'num', text: f.liczba(o.predkosc, 1) }),
        h('td', { class: 'bar' }, h('div', { class: 'bar-tor' }, h('i', { class: o.predkosc === maxV ? 'naj' : '', style: { width: (20 + 80 * (o.predkosc - minV) / (maxV - minV || 1)).toFixed(1) + '%' } }))),
        h('td', { class: 'num', text: String(o.tetno) }), h('td', { class: 'num', text: f.znak(o.roznicaWys) + ' m' }))))));
    // segmenty z dzisiejszej jazdy
    const lista = h('div', { class: 'seg-dzis' });
    for (const s of P.segmenty) {
      const seg = K.segmenty[s.id], proba = seg.historia.find((x) => x.jazda === J.id) || seg.ostatnia;
      const roz = proba.czas - seg.pr;
      lista.append(h('div', { class: 'sd' },
        h('div', null, h('b', { text: seg.nazwa }), h('small', { text: `${f.liczba(seg.dl)} m · ${f.liczba(seg.nach, 1)}% · km ${f.liczba(s.od, 1)}` })),
        h('div', { class: 'pr-ref mono', style: { color: 'var(--tekst-3)', fontSize: '10px', letterSpacing: '.08em' }, text: 'PR ' + f.tempoSeg(seg.pr) }),
        h('div', { class: 'roz', text: roz <= 0 ? 'NOWY PR' : '+' + roz + ' s' }),
        h('div', { class: 'czas', text: f.tempoSeg(proba.czas) })));
    }
    $('#jazda-segmenty').append(lista);
    // zakładki
    const zak = [...document.querySelectorAll('#jazda-zakladki button')];
    zak.forEach((b) => b.addEventListener('click', () => {
      zak.forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      document.querySelectorAll('.jazda-dane .widok').forEach((v) => { v.hidden = v.dataset.widok !== b.dataset.widok; });
    }));
  })();

  // ───────── 4 · objętość ─────────
  (function objetosc() {
    const tyg = K.tygodnie.map((t) => {
      const od = t.od, doo = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 7);
      const jj = K.jazdy.filter((j) => j.data >= od && j.data < doo);
      const s = (typ, k) => jj.filter((j) => j.typ === typ).reduce((a, j) => a + j[k], 0);
      return { t, km: [s('szosa', 'km'), s('zwift', 'km')], czas: [s('szosa', 'czas') / 3600, s('zwift', 'czas') / 3600], przewyzszenie: [s('szosa', 'przewyzszenie'), s('zwift', 'przewyzszenie')] };
    });
    const MIARY = { km: { u: 'km', f: (v) => f.liczba(v) }, czas: { u: 'h', f: (v) => f.liczba(v, v < 10 ? 1 : 0) }, przewyzszenie: { u: 'm', f: (v) => f.liczba(v) } };
    $('#obj-legenda').append(h('span', null, h('i', { class: 'kl kl-prost kl-szary' }), 'Szosa'), h('span', null, h('i', { class: 'kl kl-prost kl-zwift' }), 'Zwift'), h('span', null, h('i', { class: 'kl kl-prost kl-akcent' }), 'Ten tydzień'));
    let miara = 'km';
    const dane = () => tyg.map((w, i) => {
      const [a, b] = w[miara], M = MIARY[miara];
      const od = w.t.od, dd = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 6);
      return {
        v: a + b, klasa: w.t.biezacy ? 'akcent' : '',
        czesci: [{ v: a, klasa: 'cz-szosa' }, { v: b, klasa: 'cz-zwift' }],
        tip: () => [W.naglowekTip(`Tydz. ${f.tydzienISO(od)} · ${od.getDate()}–${f.dataKrotka(dd)}`), W.wierszTip(`${M.f(a + b)} ${M.u}`, 'razem'), W.wierszTip(`${M.f(a)} ${M.u}`, 'szosa', 's-szosa'), W.wierszTip(`${M.f(b)} ${M.u}`, 'Zwift', 's-zw'), W.wierszTip(String(w.t.jazdy), w.t.jazdy === 1 ? 'jazda' : 'jazdy')],
      };
    });
    const etyk = (i) => { const od = tyg[i].t.od, prev = i ? tyg[i - 1].t.od : null; return !prev || prev.getMonth() !== od.getMonth() ? f.miesiacKr(od.getMonth()).toUpperCase() : null; };
    const api = W.slupki($('#obj'), {
      wys: 248, m: { l: 34, r: 4, t: 22, b: 24 }, maxSzer: 12, promien: 2, odstep: 2,
      dane: dane(), osY: { ticki: 4, format: (v) => f.liczba(v) }, osX: etyk,
      wartosc: (d, i) => (i === tyg.length - 1 ? MIARY[miara].f(d.v) : null), opis: 'Objętość tygodniowa',
    });
    przyciski($('#obj-miara'), [{ k: 'km', s: 'Km' }, { k: 'czas', s: 'Godz.' }, { k: 'przewyzszenie', s: 'W górę' }], 'km', (k) => { miara = k; api.odswiez({ dane: dane() }); });
    W.wykresTabela($('#obj-tab'), $('#obj'), () => W.tabela(
      [{ s: 'Tydzień', f: (w) => `${f.tydzienISO(w.t.od)} · ${f.dataNum(w.t.od)}` }, { s: 'Km', num: 1, f: (w) => f.liczba(w.km[0] + w.km[1]) }, { s: 'Szosa', num: 1, f: (w) => f.liczba(w.km[0]) }, { s: 'Zwift', num: 1, f: (w) => f.liczba(w.km[1]) }, { s: 'Godz.', num: 1, f: (w) => f.liczba(w.czas[0] + w.czas[1], 1) }, { s: 'Jazdy', num: 1, f: (w) => String(w.t.jazdy) }],
      tyg.slice().reverse(), 'Objętość tygodniowa'));
  })();

  // ───────── 5 · cel ─────────
  (function cel() {
    const C = K.cel, dzienRoku = C.narastajaco.length, plan = C.km * dzienRoku / 365, roz = C.teraz - plan;
    $('#cel-meta').textContent = `dzień ${dzienRoku} / 365`;
    const host = $('#cel');
    const miernik = h('div', { class: 'miernik', role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': C.km, 'aria-valuenow': Math.round(C.teraz), 'aria-label': 'Postęp celu rocznego' },
      h('i', { style: { width: (C.udzial * 100).toFixed(2) + '%' } }),
      ...[0.25, 0.5, 0.75].map((p) => h('span', { class: 'prog', style: { left: p * 100 + '%' } })),
      h('span', { class: 'plan', style: { left: (plan / C.km * 100).toFixed(2) + '%' }, title: 'Plan na dziś' }));
    host.append(
      h('div', { class: 'cel-glowna' }, h('span', { class: 'v', text: f.liczba(C.teraz) }), h('span', { class: 'z', text: '/ ' + f.liczba(C.km) }), h('span', { class: 'u', text: 'km' })),
      miernik,
      h('div', { class: 'miernik-opis' }, h('span', { text: f.procent(C.udzial) + ' celu' }), h('span', { text: '▮ plan na dziś' })),
      h('div', { class: 'cel-wiersze' },
        h('div', { class: 'cel-w' }, 'Względem planu', h('b', { class: roz >= 0 ? 'dobrze' : '', text: f.znak(Math.round(roz)) + ' km' })),
        h('div', { class: 'cel-w' }, 'Prognoza na 31.12', h('b', { text: f.liczba(C.prognoza) + ' km' })),
        h('div', { class: 'cel-w' }, 'Potrzeba tygodniowo', h('b', { text: f.liczba(C.potrzebaNaTydzien) + ' km' }))),
      h('div', { id: 'cel-wykres' }));
    const nar = C.narastajaco, ost = nar.length - 1;
    const ticki = [0, 90, 181, 273, 364].map((v, k) => ({ v, s: ['STY', 'KWI', 'LIP', 'PAŹ', 'GRU'][k], kotwica: k === 4 ? 'end' : k === 0 ? 'start' : 'middle' }));
    W.linie($('#cel-wykres'), {
      wys: 118, m: { l: 34, r: 6, t: 8, b: 22 }, krzywa: 'linia',
      serie: [
        { pts: Array.from({ length: 365 }, (_, i) => [i, i <= ost ? nar[i].km : null]), klasa: 's-akcent', koniec: false },
        { pts: Array.from({ length: 365 }, (_, i) => [i, C.km * (i + 1) / 365]), klasa: 's-plan' },
        { pts: Array.from({ length: 365 }, (_, i) => [i, i >= ost ? nar[ost].km + (C.prognoza - nar[ost].km) * (i - ost) / (364 - ost) : null]), klasa: 's-prognoza' },
      ],
      x: { min: 0, max: 364, ticki }, y: { min: 0, max: 6000, ticki: [0, 2000, 4000, 6000], format: (v) => (v ? f.liczba(v / 1000) + 'k' : '0') },
      tip: (i) => {
        const d = new Date(2026, 0, i + 1);
        return [W.naglowekTip(f.dataKrotka(d)), i <= ost ? W.wierszTip(f.liczba(nar[i].km) + ' km', 'przejechane', 's-akcent') : W.wierszTip(f.liczba(nar[ost].km + (C.prognoza - nar[ost].km) * (i - ost) / (364 - ost)) + ' km', 'prognoza', 's-akcent'), W.wierszTip(f.liczba(C.km * (i + 1) / 365) + ' km', 'plan')];
      },
      opis: 'Kilometry narastająco w 2026 względem planu',
    });
  })();

  // ───────── 6 · wieża czasów ─────────
  (function wieza() {
    let filtr = 'wszystkie', wszystkie = false;
    const host = $('#wieza');
    const rysuj = () => {
      const pelne = K.segmenty.filter((s) => filtr === 'wszystkie' || s.typ === filtr).slice().sort((a, b) => b.historia.length - a.historia.length);
      const segs = wszystkie ? pelne : pelne.slice(0, 10);
      const t = h('table', { class: 'wieza' },
        h('thead', null, h('tr', null,
          h('th', { class: 'poz' }), h('th', { text: 'Segment' }), h('th', { class: 'num dl', text: 'Dług.' }), h('th', { class: 'num nach', text: 'Nach.' }),
          h('th', { class: 'num', text: 'PR' }), h('th', { class: 'num', text: 'Ostatnio' }), h('th', { class: 'spark', text: 'Trend' }), h('th', { class: 'num', text: 'Próby' }))),
        h('tbody', null, segs.map((s, i) => {
          const roz = s.ostatnia.czas - s.pr, czasy = s.historia.map((x) => x.czas);
          return h('tr', { class: s.typ },
            h('td', { class: 'poz' }, h('div', { class: 'poz-box' }, h('span', { text: String(i + 1).padStart(2, '0') }))),
            h('td', { class: 'nazwa' }, h('b', { text: s.nazwa }), h('small', { text: `PR ${f.dataNum(s.prData)} · ${s.typ === 'zwift' ? 'Zwift · ' + s.moc + ' W' : 'szosa'}` })),
            h('td', { class: 'num dl', text: s.dl >= 1000 ? f.liczba(s.dl / 1000, 2) + ' km' : s.dl + ' m' }),
            h('td', { class: 'num nach', text: f.liczba(s.nach, 1) + '%' }),
            h('td', { class: 'num pr', text: f.tempoSeg(s.pr) }),
            h('td', { class: 'num delta' + (roz <= 0 ? ' zero' : ''), text: roz <= 0 ? 'PR' : '+' + roz + ' s' }),
            h('td', { class: 'spark' }, W.sparkline(czasy, { szer: 96, wys: 22, odwroc: true, najlepszy: czasy.indexOf(Math.min(...czasy)) })),
            h('td', { class: 'num proby', text: String(s.historia.length) }));
        })));
      host.replaceChildren(t);
      if (pelne.length > 10) {
        const b = h('button', { class: 'wieza-wiecej', type: 'button', text: wszystkie ? 'Pokaż pierwsze 10' : `Pokaż wszystkie · ${pelne.length}` });
        b.addEventListener('click', () => { wszystkie = !wszystkie; rysuj(); });
        host.append(b);
      }
    };
    przyciski($('#seg-filtr'), [{ k: 'wszystkie', s: 'Wszystkie' }, { k: 'szosa', s: 'Szosa' }, { k: 'zwift', s: 'Zwift' }], 'wszystkie', (k) => { filtr = k; rysuj(); });
    rysuj();
  })();

  // ───────── 7 · krzywa mocy ─────────
  (function moc() {
    const M = K.moc;
    $('#moc-legenda').append(h('span', null, h('i', { class: 'kl kl-akcent' }), 'Cały okres'), h('span', null, h('i', { class: 'kl kl-szary' }), '42 dni'));
    const pokaz = [5, 15, 60, 300, 1200, 3600], et = { 5: '5 s', 15: '15 s', 60: '1 min', 300: '5 min', 1200: '20 min', 3600: '60 min' };
    W.linie($('#krzywa'), {
      wys: 214, m: { l: 36, r: 12, t: 12, b: 24 },
      serie: [{ pts: M.czasy.map((c, i) => [c, M.wszech[i]]), klasa: 's-akcent', obszar: true, obszarOd: 100 }, { pts: M.czasy.map((c, i) => [c, M.ostatnie42[i]]), klasa: 's-szary' }],
      x: { skala: 'log', min: 5, max: 3600, ticki: pokaz.map((v, k) => ({ v, s: et[v], kotwica: k === 0 ? 'start' : k === pokaz.length - 1 ? 'end' : 'middle' })), linie: true },
      y: { min: 100, max: 900, ticki: [100, 300, 500, 700, 900], format: (v) => f.liczba(v) },
      tip: (i) => [W.naglowekTip(M.etykiety[i]), W.wierszTip(M.wszech[i] + ' W', 'cały okres', 's-akcent'), M.ostatnie42[i] != null ? W.wierszTip(M.ostatnie42[i] + ' W', 'ostatnie 42 dni', 's-szary') : W.wierszTip('—', 'brak próby 60 min')],
      opis: 'Krzywa mocy z jazd na Zwifcie',
    });
    const pola = [['5 s', M.wszech[0]], ['1 min', M.wszech[4]], ['5 min', M.wszech[6]], ['20 min', M.wszech[8]]];
    $('#moc-pola').append(...pola.map(([l, v]) => h('div', { class: 'mp' }, h('div', { class: 'l', text: 'Najlepsze ' + l }), h('div', { class: 'v' }, String(v), h('small', { text: 'W' })))));
    // ostatnie sesje na trenażerze
    const sesje = K.jazdy.filter((j) => j.typ === 'zwift').slice(-6).reverse();
    const maxNp = Math.max(...sesje.map((j) => j.mocNP));
    $('#zw-sesje').append(h('div', { class: 'mini-etykieta mono' }, 'Ostatnie sesje na trenażerze'), h('table', { class: 'tab-odcinki' },
      h('thead', null, h('tr', null, ['Dzień', 'Trasa', 'Czas', 'Śr.', 'NP', ''].map((s, i) => h('th', { class: i >= 2 && i < 5 ? 'num' : null, text: s })))),
      h('tbody', null, sesje.map((j) => h('tr', null,
        h('td', { text: `${f.dzienTygKr(j.data)} ${f.dataNumKr(j.data)}` }),
        h('td', { class: 'zw-trasa', text: j.nazwa.replace('Zwift · ', '') }),
        h('td', { class: 'num', text: f.czas(j.czas) }), h('td', { class: 'num', text: j.moc + ' W' }), h('td', { class: 'num', text: j.mocNP + ' W' }),
        h('td', { class: 'bar zw-bar' }, h('div', { class: 'bar-tor' }, h('i', { class: 'zw', style: { width: (j.mocNP / maxNp * 100).toFixed(1) + '%' } }))))))));
  })();

  // ───────── 8 · kalendarz ─────────
  (function kalendarz() {
    const host = $('#kal');
    const ile = host.clientWidth < 560 ? 26 * 7 : 52 * 7;
    const dni = K.dni.slice(-ile).map((d, i, a) => ({ data: d.data, v: d.km, czas: d.czas, jazdy: d.jazdy, dzis: i === a.length - 1 }));
    W.kalendarz(host, {
      dni, progi: [25, 45, 70], komorka: 12, odstep: 3, promien: 2,
      etykietaMies: (d) => f.miesiacKr(d.getMonth()).toUpperCase(),
      tip: (d) => {
        const w = [W.naglowekTip(`${f.dzienTygKr(d.data)} ${f.data(d.data)}`)];
        if (!d.jazdy.length) w.push(W.wierszTip('—', 'bez jazdy'));
        else { w.push(W.wierszTip(f.km(d.v) + ' km', f.czasHM(d.czas))); d.jazdy.forEach((id) => { const j = K.jazdy[id - 1]; w.push(W.wierszTip('', j.nazwa, j.typ === 'zwift' ? 's-zwift' : 's-akcent')); }); }
        return w;
      },
      opis: 'Kalendarz jazd z ostatnich 52 tygodni',
    });
    $('#kal-skala').append('Mniej', ...[0, 1, 2, 3, 4].map((p) => h('i', { class: 'wk-p' + p, style: { background: getComputedStyle(document.documentElement).getPropertyValue('--x') || null } })), 'Więcej');
    // kolory próbek w legendzie biorą się z tych samych klas co komórki
    [...$('#kal-skala').querySelectorAll('i')].forEach((el, p) => { const s = W.svg('svg', { width: 10, height: 10 }); W.svg('rect', { width: 10, height: 10, rx: 2, class: 'wk-p' + p }, s); el.replaceWith(s); });
    const aktywne = dni.filter((d) => d.jazdy.length).length;
    $('#kal-stopka').append(
      h('span', null, 'Aktywne dni', h('b', { text: `${aktywne} / ${dni.length}` })),
      h('span', null, 'Seria', h('b', { text: `${K.seria.tygodnie} tyg.` })),
      h('span', null, 'Najdłuższa seria', h('b', { text: `${K.seria.najdluzsza} tyg.` })),
      h('span', null, 'Progi', h('b', { text: '25 · 45 · 70 km' })));
  })();

  // ───────── 9 · strefy ─────────
  (function strefy() {
    const maks = Math.max(...K.strefy.map((z) => z.udzial));
    const host = $('#strefy');
    for (const z of K.strefy) {
      host.append(h('div', { class: 'strefa' },
        h('span', { class: 'z', text: 'Z' + z.nr }),
        h('span', { class: 'n' }, z.nazwa, h('span', { text: z.nr === 5 ? `${z.od}+` : `${z.od || '<'}${z.od ? '–' : ''}${z.do}` })),
        h('span', { class: 'p', text: f.procent(z.udzial) }),
        h('div', { class: 'tor', role: 'img', 'aria-label': `Strefa ${z.nr}: ${f.procent(z.udzial)}, ${f.czasHM(z.czas)}` }, h('i', { class: 'str-' + z.nr, style: { width: (z.udzial / maks * 100).toFixed(1) + '%' } }))));
    }
    const suma = K.strefy.reduce((a, z) => a + z.czas, 0);
    host.append(h('p', { class: 'strefy-stopka', text: `${f.czasHM(suma)} jazdy · progi z tętna maks. ${K.zawodnik.tetnoMax} i progowego ${K.zawodnik.tetnoProg} bpm` }));
  })();

  // ───────── 10 · ostatnie jazdy ─────────
  (function lista() {
    const jj = K.jazdy.slice(-12).reverse();
    const maxObc = Math.max(...jj.map((j) => j.obciazenie));
    const mini = (j) => {
      const pts = K.trasaJazdy(j);
      if (!pts) return h('div', { class: 'mini-zwift', text: 'ZWIFT' });
      const r = W.rzut(W.bbox(pts), 44, 30, 4), svg = W.svg('svg', { class: 'mini-trasa', viewBox: '0 0 44 30', 'aria-hidden': 'true' });
      W.svg('path', { d: 'M' + pts.filter((_, i) => i % 3 === 0).map((p) => r(p).map((v) => v.toFixed(1)).join(',')).join('L') }, svg);
      return svg;
    };
    $('#jazdy-meta').textContent = `${K.jazdy.length} jazd od sierpnia 2025`;
    $('#lista-jazd').append(h('table', { class: 'jazdy' },
      h('thead', null, h('tr', null, h('th', { class: 'miniatura' }), h('th', { text: 'Jazda' }), h('th', { class: 'num', text: 'Dystans' }), h('th', { class: 'num', text: 'Czas' }), h('th', { class: 'num ukryj-m', text: 'Km/h' }), h('th', { class: 'num ukryj-m', text: 'Tętno' }), h('th', { class: 'num ukryj-m', text: 'Moc' }), h('th', { class: 'ukryj-m', text: 'Obciążenie' }))),
      h('tbody', null, jj.map((j) => h('tr', null,
        h('td', { class: 'miniatura' }, mini(j)),
        h('td', { class: 'nz' }, h('b', { text: j.nazwa }), h('small', { text: `${f.dzienTygKr(j.data)} ${f.dataNumKr(j.data)} · ${f.godzina(j.data)}` })),
        h('td', { class: 'num km', text: f.km(j.km) + ' km' }), h('td', { class: 'num', text: f.czas(j.czas) }),
        h('td', { class: 'num ukryj-m', text: f.liczba(j.predkosc, 1) }), h('td', { class: 'num ukryj-m', text: String(j.tetno) }),
        h('td', { class: 'num ukryj-m', text: j.moc ? j.moc + ' W' : '—' }),
        h('td', { class: 'ukryj-m' }, h('span', { class: 'obc' }, h('i', { class: j.obciazenie > 110 ? 'duze' : '', style: { width: Math.round(8 + 56 * j.obciazenie / maxObc) + 'px' } }), String(j.obciazenie))))))));
  })();

  // ───────── 11 · rekordy ─────────
  (function rekordy() {
    $('#rekordy').append(...K.rekordy.map((r) => h('div', { class: 'rek' },
      h('div', { class: 'l', text: r.nazwa }),
      h('div', { class: 'v' }, f.liczba(r.wartosc, r.jednostka === 'km/h' || (r.jednostka === 'km' && r.wartosc < 1000 && r.klucz === 'dystans') ? 1 : 0), h('small', { text: r.jednostka })),
      h('div', { class: 'd', text: `${f.dataNum(r.data)} · ${r.opis}` }))));
  })();

  // ───────── ticker ─────────
  (function ticker() {
    const el = [];
    const dodaj = (tag, klasa, ...tresc) => el.push(h('span', { class: 't-el' }, h('span', { class: 't-tag ' + (klasa || ''), text: tag }), ...tresc));
    dodaj('Dziś', '', h('b', { text: J.nazwa }), `${f.km(J.km)} km · ${f.liczba(J.predkosc, 1)} km/h · ${J.tetno} bpm`);
    const pr = K.segmenty.flatMap((s) => s.historia.filter((x) => x.pr).map((x) => ({ s, x }))).sort((a, b) => b.x.data - a.x.data).slice(0, 6);
    pr.forEach(({ s, x }) => dodaj('PR', s.typ === 'zwift' ? 'zw' : 'pr', h('b', { text: s.nazwa }), `${f.tempoSeg(x.czas)} · ${f.dataNumKr(x.data)}`));
    dodaj('Forma', '', h('b', { text: 'CTL ' + f.liczba(K.forma.ctl) }), `${f.znak(K.forma.zmiana7, 1)} w 7 dni · ${K.forma.nazwa.toLowerCase()}`);
    dodaj('Cel 2026', '', h('b', { text: f.procent(K.cel.udzial) }), `${f.liczba(K.cel.teraz)} z ${f.liczba(K.cel.km)} km`);
    dodaj('Seria', '', h('b', { text: K.seria.tygodnie + ' tygodni' }), 'z rzędu z co najmniej jedną jazdą');
    dodaj('Zwift', 'zw', h('b', { text: 'Najlepsze 20 min' }), K.moc.najlepsza20 + ' W');
    const t = $('#ticker');
    t.append(...el, ...el.map((e) => { const c = e.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; }));
  })();

  // ───────── aktywna sekcja w nawigacji ─────────
  (function nawigacja() {
    const linki = [...document.querySelectorAll('.nawigacja a')];
    const sekcje = linki.map((a) => document.querySelector(a.getAttribute('href')));
    const io = new IntersectionObserver((wpisy) => {
      wpisy.forEach((w) => { if (w.isIntersecting) { const i = sekcje.indexOf(w.target); linki.forEach((a, k) => a.classList.toggle('aktywny', k === i)); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sekcje.forEach((s) => s && io.observe(s));
  })();
  W.typografia(document.body);
})();
