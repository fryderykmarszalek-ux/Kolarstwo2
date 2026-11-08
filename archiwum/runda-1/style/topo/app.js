/* TOPO — logika strony */
(function () {
  'use strict';
  const K = window.K2, f = K.fmt, h = W.h, M = K.mapa;
  const $ = (s) => document.querySelector(s);
  const J = K.ostatnia.jazda, P = K.ostatnia.probki, C = K.cel, F = K.forma;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const odm = (n, a, b, c) => { n = Math.abs(Math.round(n)); if (n === 1) return a; const d = n % 10, s = n % 100; return d >= 2 && d <= 4 && (s < 12 || s > 14) ? b : c; };
  const sciezka = (pts, rz) => 'M' + pts.map((p) => { const q = rz(p); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('L');

  // nazwa drogi: wał albo najbliższa miejscowość
  const nazwaDrogi = (d) => {
    if (d.rodzaj === 'wal') return 'Wał wiślany';
    const mid = d.pts[Math.floor(d.pts.length / 2)];
    const a = M.wezly[d.a].miejsce, b = M.wezly[d.b].miejsce;
    if (a === 'Konstancin-Jeziorna' || b === 'Konstancin-Jeziorna') return 'Wyjazd z Konstancina';
    if (a && b) return `${a} — ${b}`;
    let best = null, bd = Infinity; for (const m of M.miejsca) { const q = Math.hypot(m.x - mid[0], m.y - mid[1]); if (q < bd) { bd = q; best = m; } }
    return `Droga lokalna · ${best.nazwa}`;
  };

  // ───────── mapa sezonu ─────────
  (function mapaSezonu() {
    const host = $('#hero-mapa');
    const tip = h('div', { class: 'hm-tip', role: 'status' }); host.parentElement.append(tip);
    const poziomy = []; for (let v = 82; v <= 128; v += 2) poziomy.push(v);
    const kont = W.kontury(M.wysokosc, -3, -3, M.szer + 3, M.wys + 3, 0.15, poziomy);
    const uzyte = M.drogi.filter((d) => d.uzycia > 0).sort((a, b) => a.uzycia - b.uzycia);
    const maxU = uzyte[uzyte.length - 1].uzycia;
    const najczestsza = uzyte[uzyte.length - 1];
    const R = K.okresy.wszystko;
    $('#rok-h').textContent = '2025/26';
    $('#hero-liczby').append(
      h('div', { class: 'w' }, h('dt', { text: 'Dystans' }), h('dd', null, f.liczba(R.km), h('small', { text: 'km' }))),
      h('div', { class: 'w' }, h('dt', { text: 'Jazdy' }), h('dd', null, String(R.jazdy), h('small', { text: `${R.szosa} na szosie` }))),
      h('div', { class: 'w' }, h('dt', { text: 'W górę' }), h('dd', null, f.liczba(R.przewyzszenie), h('small', { text: 'm' }))),
      h('div', { class: 'w' }, h('dt', { text: 'W siodle' }), h('dd', null, f.liczba(R.czas / 3600), h('small', { text: 'h' }))),
      h('div', { class: 'w szer' }, h('dt', { text: 'Najczęściej' }), h('dd', { text: `${nazwaDrogi(najczestsza)} — ${najczestsza.uzycia} ${odm(najczestsza.uzycia, 'przejazd', 'przejazdy', 'przejazdów')}` })));

    // legenda
    const probka = (w, op, extra) => { const s = W.svg('svg', { width: 34, height: 10, 'aria-hidden': 'true' }); W.svg('line', Object.assign({ x1: 2, x2: 32, y1: 5, y2: 5, stroke: '#FF7A3D', 'stroke-width': w, 'stroke-opacity': op, 'stroke-linecap': 'round' }, extra || {}), s); return s; };
    const leg = $('#hero-legenda');
    const skalaSvg = W.svg('svg', { width: 60, height: 10, 'aria-hidden': 'true' });
    leg.append(h('h3', { text: 'Legenda' }),
      h('div', { class: 'lw' }, probka(3.4, 1), `ponad ${Math.round(maxU * 0.5)} ${odm(Math.round(maxU * 0.5), 'przejazd', 'przejazdy', 'przejazdów')}`),
      h('div', { class: 'lw' }, probka(1.8, 0.6), 'kilka–kilkanaście'),
      h('div', { class: 'lw' }, probka(1, 0.25), 'raz, dwa razy'),
      h('div', { class: 'lw' }, probka(1, 1, { stroke: '#4B6B58' }), 'poziomica co 10 m'),
      h('div', { class: 'skala' }, skalaSvg, h('span', { id: 'hm-skala-t', text: '' })));

    let rzut = null;
    W.rozmiar(host, (szer) => {
      host.replaceChildren();
      const wys = host.clientHeight;
      const s = Math.max(szer / 31, wys / 22.5);
      const cx = szer < 720 ? 14.2 : 15.2, cy = 12.8;
      const ox = szer / 2 - cx * s, oy = wys / 2 - cy * s;
      rzut = (p) => [ox + p[0] * s, oy + p[1] * s];
      const inv = (px, py) => [(px - ox) / s, (py - oy) / s];

      // rzeźba: hipsometria + cieniowanie z północnego zachodu
      const kr = szer < 720 ? 2 : 3, cw = Math.ceil(szer / kr) + 2, ch = Math.ceil(wys / kr) + 2;
      const E = new Float32Array(cw * ch);
      for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) { const q = inv((i - 1) * kr, (j - 1) * kr); E[j * cw + i] = M.wysokosc(q[0], q[1]); }
      const cv = h('canvas', { width: cw - 2, height: ch - 2, 'aria-hidden': 'true' });
      host.append(cv);
      const ctx = cv.getContext('2d'), img = ctx.createImageData(cw - 2, ch - 2), D = img.data;
      const krokM = kr / s * 1000, k = 70;
      const Lx = -0.55, Ly = -0.62, Lz = 0.56;
      for (let j = 1; j < ch - 1; j++) for (let i = 1; i < cw - 1; i++) {
        const e = E[j * cw + i];
        const ex = (E[j * cw + i + 1] - E[j * cw + i - 1]) / (2 * krokM), ey = (E[(j + 1) * cw + i] - E[(j - 1) * cw + i]) / (2 * krokM);
        let nx = -ex * k, ny = -ey * k, nz = 1; const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
        const cien = clamp(nx * Lx + ny * Ly + nz * Lz, 0, 1);
        const t = clamp((e - 86) / 34, 0, 1);
        const sh = 0.5 + 0.85 * cien;
        const o = ((j - 1) * (cw - 2) + (i - 1)) * 4;
        D[o] = clamp(lerp(9, 30, t) * sh, 0, 255); D[o + 1] = clamp(lerp(19, 40, t) * sh, 0, 255); D[o + 2] = clamp(lerp(16, 27, t) * sh, 0, 255); D[o + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);

      const svg = W.svg('svg', { viewBox: `0 0 ${szer} ${wys}`, role: 'img', 'aria-label': 'Mapa wszystkich jazd z poziomicami' }, host);
      // siatka kilometrowa
      const gs = W.svg('g', null, svg);
      for (let x = 0; x <= M.szer + 2; x += 2) { const px = rzut([x, 0])[0]; if (px > 0 && px < szer) W.svg('line', { x1: px, x2: px, y1: 0, y2: wys, class: 'hm-siatka' }, gs); }
      for (let y = 0; y <= M.wys + 2; y += 2) { const py = rzut([0, y])[1]; if (py > 0 && py < wys) W.svg('line', { x1: 0, x2: szer, y1: py, y2: py, class: 'hm-siatka' }, gs); }
      // poziomice + opisy
      const gk = W.svg('g', null, svg);
      const opisy = [];
      for (const kk of kont) for (const l of kk.linie) {
        if (l.length < 4) continue;
        const gruby = kk.poziom % 10 === 0;
        W.svg('path', { d: sciezka(l, rzut), class: 'hm-kontur' + (gruby ? ' gruby' : '') }, gk);
        if (gruby && l.length > 60) opisy.push({ l, v: kk.poziom });
      }
      opisy.sort((a, b) => b.l.length - a.l.length).slice(0, 9).forEach(({ l, v }, n) => {
        const i = Math.floor(l.length * (0.3 + 0.12 * (n % 4))), a = rzut(l[i]), b = rzut(l[Math.min(l.length - 1, i + 3)]);
        if (a[0] < 30 || a[0] > szer - 30 || a[1] < 30 || a[1] > wys - 30) return;
        let kat = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; if (kat > 90) kat -= 180; if (kat < -90) kat += 180;
        W.tekst(gk, 0, 0, String(v), { class: 'hm-kontur-t', 'text-anchor': 'middle', transform: `translate(${a[0].toFixed(1)},${a[1].toFixed(1)}) rotate(${kat.toFixed(1)})`, dy: 3 });
      });
      // woda
      W.svg('path', { d: sciezka(M.rzeka, rzut), class: 'hm-rzeka', 'stroke-width': Math.max(8, 0.55 * s) }, svg);
      W.svg('path', { d: sciezka(M.jeziorka, rzut), class: 'hm-doplyw' }, svg);
      { const n = M.rzeka.length, a = rzut(M.rzeka[Math.floor(n * 0.62)]), b = rzut(M.rzeka[Math.floor(n * 0.66)]); let kat = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; if (kat > 90) kat -= 180; if (kat < -90) kat += 180; W.tekst(svg, 0, 0, 'Wisła', { class: 'hm-woda', 'text-anchor': 'middle', transform: `translate(${(a[0] + 0.7 * s).toFixed(1)},${a[1].toFixed(1)}) rotate(${kat.toFixed(1)})` }); }
      { const p = rzut(M.jeziorka[Math.floor(M.jeziorka.length * 0.22)]); W.tekst(svg, p[0], p[1] - 7, 'Jeziorka', { class: 'hm-miejsce punkt', style: 'fill:#6FA3B8' }); }
      // drogi
      const gd = W.svg('g', null, svg);
      for (const d of M.drogi) W.svg('path', { d: sciezka(d.pts, rzut), class: 'hm-droga' }, gd);
      // ciepło: im częściej, tym grubiej i jaśniej
      const gp = W.svg('g', null, svg), gc = W.svg('g', null, svg), gh = W.svg('g', null, svg);
      for (const d of uzyte) {
        const t = Math.sqrt(d.uzycia / maxU), sc = sciezka(d.pts, rzut);
        if (t > 0.45) W.svg('path', { d: sc, class: 'hm-poswiata', 'stroke-width': (4 + 8 * t).toFixed(1) }, gp);
        W.svg('path', { d: sc, class: 'hm-cieplo', 'stroke-width': (0.8 + 2.8 * t).toFixed(2), 'stroke-opacity': (0.18 + 0.82 * t).toFixed(2) }, gc);
        const hit = W.svg('path', { d: sc, class: 'hm-hit' }, gh), zz = W.svg('path', { d: sc, class: 'hm-zazn' }, gh);
        const pokaz = (e) => {
          const r = host.getBoundingClientRect();
          tip.replaceChildren(h('b', { text: `${d.uzycia} ${odm(d.uzycia, 'przejazd', 'przejazdy', 'przejazdów')}` }), `${nazwaDrogi(d)} · ${f.liczba(d.dl * 1.12, 1)} km`);
          const x = e.clientX - r.left, y = e.clientY - r.top;
          tip.style.left = Math.min(szer - tip.offsetWidth - 10, x + 14) + 'px'; tip.style.top = Math.max(10, y - tip.offsetHeight - 12) + 'px';
          tip.classList.add('on'); zz.classList.add('on');
        };
        hit.addEventListener('pointermove', pokaz);
        hit.addEventListener('pointerleave', () => { tip.classList.remove('on'); zz.classList.remove('on'); });
      }
      // miejscowości
      for (const m of M.miejsca) {
        const q = rzut([m.x, m.y]); if (q[0] < 20 || q[0] > szer - 20 || q[1] < 20 || q[1] > wys - 20) continue;
        if (m.dom) { W.svg('circle', { cx: q[0], cy: q[1], r: 5, class: 'hm-dom' }, svg); W.tekst(svg, q[0] + 10, q[1] - 9, 'Konstancin-Jeziorna', { class: 'hm-miejsce miasto' }); W.tekst(svg, q[0] + 10, q[1] + 6, 'dom · start większości jazd', { class: 'hm-miejsce punkt' }); continue; }
        W.svg('circle', { cx: q[0], cy: q[1], r: m.typ === 'miasto' ? 3 : 2, class: 'hm-kropka' }, svg);
        W.tekst(svg, q[0] + 7, q[1] - 6, m.nazwa, { class: 'hm-miejsce ' + m.typ });
      }
      // ramka z podziałką co 2 km
      W.svg('rect', { x: 10.5, y: 10.5, width: szer - 21, height: wys - 21, class: 'hm-ramka' }, svg);
      for (let x = 0; x <= M.szer + 2; x += 2) { const px = rzut([x, 0])[0]; if (px < 14 || px > szer - 14) continue; W.svg('line', { x1: px, x2: px, y1: 10, y2: 16, class: 'hm-tick' }, svg); W.svg('line', { x1: px, x2: px, y1: wys - 16, y2: wys - 10, class: 'hm-tick' }, svg); if (x % 4 === 0) W.tekst(svg, px + 3, wys - 19, String(x), { class: 'hm-tick-t' }); }
      for (let y = 0; y <= M.wys + 2; y += 2) { const py = rzut([0, y])[1]; if (py < 14 || py > wys - 14) continue; W.svg('line', { x1: 10, x2: 16, y1: py, y2: py, class: 'hm-tick' }, svg); W.svg('line', { x1: szer - 16, x2: szer - 10, y1: py, y2: py, class: 'hm-tick' }, svg); if (y % 4 === 0) W.tekst(svg, szer - 20, py - 3, String(y), { class: 'hm-tick-t', 'text-anchor': 'end' }); }
      // podziałka w legendzie
      skalaSvg.replaceChildren(); const L = 2 * s * (60 / Math.max(60, 2 * s));
      W.svg('rect', { x: 0, y: 3, width: L / 2, height: 4, fill: 'var(--tekst-2)' }, skalaSvg); W.svg('rect', { x: L / 2, y: 3, width: L / 2, height: 4, fill: 'none', stroke: 'var(--tekst-2)' }, skalaSvg);
      const skalaTxt = $('#hm-skala-t'); if (skalaTxt) skalaTxt.textContent = `${f.liczba(2 * (60 / Math.max(60, 2 * s)), 1)} km · 1:${f.liczba(Math.round(1e6 / (s * 0.2646) / 1000) * 1000)}`;
      // współrzędne i wysokość pod kursorem
      svg.addEventListener('pointermove', (e) => { const r = svg.getBoundingClientRect(); const q = inv(e.clientX - r.left, e.clientY - r.top); $('#wsp').textContent = `X ${f.liczba(q[0], 1)} km · Y ${f.liczba(q[1], 1)} km · ${f.liczba(M.wysokosc(q[0], q[1]))} m n.p.m.`; });
      svg.addEventListener('pointerleave', () => { $('#wsp').textContent = '— · —'; });
    });
  })();

  // ───────── ostatnia jazda ─────────
  (function jazda() {
    $('#t-jazda').textContent = J.nazwa;
    $('#jazda-opis').textContent = `${f.dzienTyg(J.data).replace(/^./, (c) => c.toUpperCase())}, ${f.data(J.data)}, start ${f.godzina(J.data)} w Konstancinie. Najedź na mapę albo przekrój — oba pokazują to samo miejsce.`;
    const DEF = [['Dystans', 'Kilometr'], ['Czas jazdy', 'Czas'], ['Średnia', 'Prędkość'], ['Śr. tętno', 'Tętno'], ['W górę', 'Wysokość'], ['Kadencja', 'Nachylenie']];
    const host = $('#odczyty');
    const el = DEF.map((d) => { const l = h('div', { class: 'l' }), v = h('div', { class: 'v' }); host.append(h('div', { class: 'odczyt' }, l, v)); return { d, l, v }; });
    const ustaw = (i) => {
      const live = i >= 0;
      const w = live
        ? [[f.liczba(P.d[i], 1), 'km'], [f.czas(P.t[i]), ''], [f.liczba(P.v[i], 1), 'km/h'], [String(P.hr[i]), 'bpm'], [f.liczba(P.ele[i]), 'm'], [(P.grade[i] < 0 ? '−' : '') + f.liczba(Math.abs(P.grade[i]), 1), '%']]
        : [[f.liczba(J.km, 1), 'km'], [f.czas(J.czas), ''], [f.liczba(J.predkosc, 1), 'km/h'], [String(J.tetno), 'bpm'], [f.liczba(J.przewyzszenie), 'm'], [String(J.kadencja), 'rpm']];
      el.forEach(({ d, l, v }, k) => { l.textContent = d[live ? 1 : 0]; v.replaceChildren(w[k][0], w[k][1] ? h('small', { text: w[k][1] }) : ''); });
      host.classList.toggle('na-zywo', live);
    };
    ustaw(-1);
    const wyk = [];
    let mapa = null;
    const sync = (i) => { wyk.forEach((w) => w.ustawKursor(i)); ustaw(i); if (mapa) mapa.kursor(i); };
    mapa = W.mapaTrasy($('#mapa'), { mapa: M, trasa: P.x.map((x, i) => [x, P.y[i]]), segmenty: P.segmenty, kontury: { krok: 0.15, poziomy: Array.from({ length: 24 }, (_, k) => 82 + k * 2), gruby: 10 }, poswiata: true, km: 10, etykietaStartu: 'Start · meta', onHover: sync, pad: 18, margines: 1.2, opis: `Mapa trasy: ${J.nazwa}` });
    const maxKm = P.d[P.d.length - 1];
    const tk = []; for (let k = 0; k <= maxKm; k += 10) tk.push({ v: k, s: String(k), kotwica: k === 0 ? 'start' : 'middle' }); tk.push({ v: maxKm, s: 'km', kotwica: 'end' });
    const e0 = Math.floor((Math.min(...P.ele) - 4) / 10) * 10, e1 = Math.ceil((Math.max(...P.ele) + 4) / 10) * 10;
    $('#przekroj-info').textContent = `${f.liczba(Math.min(...P.ele))}–${f.liczba(Math.max(...P.ele))} m n.p.m.`;
    // przekrój: teren w pasach wysokości co 10 m (jak na mapie hipsometrycznej)
    wyk.push(W.linie($('#profil'), {
      wys: 150, m: { l: 34, r: 4, t: 8, b: 22 }, krzywa: 'linia',
      serie: [{ pts: P.d.map((k, i) => [k, P.ele[i]]), klasa: 's-teren' }],
      x: { min: 0, max: maxKm, ticki: tk }, y: { min: e0, max: e1, ticki: W.ticki(e0, e1, 3), format: (v) => f.liczba(v) },
      tlo: ({ g, x, y, m, W: szer, H }) => {
        const id = 'kl-prof-' + Math.random().toString(36).slice(2, 7);
        const cp = W.svg('clipPath', { id }, W.svg('defs', null, g));
        W.svg('path', { d: W.obszar(P.d.map((k, i) => [x(k), y(P.ele[i])]), y(e0), 'linia') }, cp);
        const gb = W.svg('g', { 'clip-path': `url(#${id})` }, g);
        let k = 0; for (let v = e0; v < e1; v += 10, k++) W.svg('rect', { x: m.l, y: y(v + 10), width: szer - m.l - m.r, height: y(v) - y(v + 10) + 0.5, class: 'prof-pas-' + Math.min(4, k) }, gb);
        for (const s of P.segmenty) W.svg('rect', { x: x(s.od), y: m.t, width: Math.max(2, x(s.do) - x(s.od)), height: H - m.t - m.b, class: 'wk-pasmo' }, g);
      },
      naHover: sync, opis: 'Przekrój wysokości trasy',
    }));
    wyk.push(W.linie($('#s-v'), { wys: 86, m: { l: 30, r: 4, t: 4, b: 4 }, krzywa: 'linia', serie: [{ pts: P.d.map((k, i) => [k, P.v[i]]), klasa: 's-v', obszar: true, obszarOd: 10 }], x: { min: 0, max: maxKm, ticki: [] }, y: { min: 10, max: 50, ticki: [20, 40], format: (v) => f.liczba(v) }, naHover: sync, opis: 'Prędkość' }));
    wyk.push(W.linie($('#s-hr'), { wys: 86, m: { l: 30, r: 4, t: 4, b: 4 }, krzywa: 'linia', serie: [{ pts: P.d.map((k, i) => [k, P.hr[i]]), klasa: 's-hr', obszar: true, obszarOd: 90 }], x: { min: 0, max: maxKm, ticki: [] }, y: { min: 90, max: 190, ticki: [120, 160], format: (v) => f.liczba(v) }, naHover: sync, opis: 'Tętno' }));
  })();

  // ───────── krajobraz formy ─────────
  (function krajobraz() {
    const dni = K.dni.slice(-365);
    const ticki = []; dni.forEach((d, i) => { if (d.data.getDate() === 1 && d.data.getMonth() % 2 === 0) ticki.push({ v: i, s: f.miesiacKr(d.data.getMonth()).toUpperCase() }); });
    $('#forma-legenda').append(h('span', null, h('i', { class: 'kl kl-teren' }), 'Forma (teren)'), h('span', null, h('i', { class: 'kl kl-trasa' }), 'Zmęczenie'));
    let iMax = 0; dni.forEach((d, i) => { if (d.ctl > dni[iMax].ctl) iMax = i; });
    W.linie($('#krajobraz'), {
      wys: 340, m: { l: 30, r: 12, t: 34, b: 26 },
      serie: [{ pts: dni.map((d, i) => [i, d.ctl]), klasa: 's-kosc' }, { pts: dni.map((d, i) => [i, d.atl]), klasa: 's-zm' }],
      x: { ticki }, y: { min: 0, max: 80, ticki: [0, 20, 40, 60, 80], format: (v) => f.liczba(v) },
      tlo: ({ g, x, y, m, W: szer }) => {
        const id = 'kl-forma';
        const cp = W.svg('clipPath', { id }, W.svg('defs', null, g));
        W.svg('path', { d: W.obszar(dni.map((d, i) => [x(i), y(d.ctl)]), y(0), 'gladka') }, cp);
        const gb = W.svg('g', { 'clip-path': `url(#${id})` }, g);
        for (let k = 0; k < 7; k++) W.svg('rect', { x: m.l, y: y((k + 1) * 10), width: szer - m.l - m.r, height: y(k * 10) - y((k + 1) * 10) + 0.5, class: 'pas-' + k }, gb);
        for (let k = 1; k < 7; k++) W.svg('line', { x1: m.l, x2: szer - m.r, y1: y(k * 10), y2: y(k * 10), class: 'warstwica' }, gb);
      },
      nad: ({ g, x, y }) => {
        const px = x(iMax), py = y(dni[iMax].ctl);
        W.svg('path', { d: `M${px - 6},${py - 6} L${px + 6},${py - 6} L${px},${py - 16} Z`, class: 'szczyt-z' }, g);
        W.tekst(g, px, py - 23, `Szczyt ${f.liczba(dni[iMax].ctl)} · ${f.dataKrotka(dni[iMax].data)}`, { class: 'szczyt-t', 'text-anchor': 'middle' });
        const o = dni.length - 1; W.tekst(g, x(o) - 4, y(dni[o].ctl) - 14, `Dziś ${f.liczba(dni[o].ctl)}`, { class: 'dzis-t', 'text-anchor': 'end' });
      },
      tip: (i) => { const d = dni[i]; return [W.naglowekTip(`${f.dzienTygKr(d.data)} ${f.data(d.data)}`), W.wierszTip(f.liczba(d.ctl), 'forma', 's-teren'), W.wierszTip(f.liczba(d.atl), 'zmęczenie', 's-zm'), W.wierszTip(f.znak(Math.round(d.ctl - d.atl)), 'świeżość')]; },
      opis: 'Forma jako teren, zmęczenie jako linia — ostatnie 365 dni',
    });
    W.wykresTabela($('#forma-tab'), $('#krajobraz'), () => W.tabela([{ s: 'Dzień', f: (d) => f.dataNum(d.data) }, { s: 'Forma', num: 1, f: (d) => f.liczba(d.ctl, 1) }, { s: 'Zmęczenie', num: 1, f: (d) => f.liczba(d.atl, 1) }, { s: 'Świeżość', num: 1, f: (d) => f.znak(d.ctl - d.atl, 1) }], dni.slice().reverse(), 'Forma'));
    $('#forma-liczby').append(
      h('div', { class: 'w' }, h('dt', null, h('i', { class: 'kl kl-teren' }), 'Forma'), h('dd', null, f.liczba(F.ctl), h('small', { text: `${f.znak(F.zmiana7, 1)} / 7 dni` }))),
      h('div', { class: 'w' }, h('dt', null, h('i', { class: 'kl kl-trasa' }), 'Zmęczenie'), h('dd', null, f.liczba(F.atl))),
      h('div', { class: 'w' }, h('dt', null, 'Świeżość'), h('dd', null, (F.tsb < 0 ? '−' : '+') + f.liczba(Math.abs(F.tsb)))));
    const ik = W.svg('svg', { width: 18, height: 18, viewBox: '0 0 18 18', 'aria-hidden': 'true' });
    const kol = F.status === 'good' ? 'var(--dobry)' : F.status === 'warning' ? 'var(--uwaga)' : 'var(--zle)';
    W.svg('path', { d: 'M9 2L16.5 15.5H1.5Z', fill: 'none', stroke: kol, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, ik);
    W.svg('path', { d: 'M9 7v4', stroke: kol, 'stroke-width': 1.5, 'stroke-linecap': 'round' }, ik); W.svg('circle', { cx: 9, cy: 13.2, r: 0.9, fill: kol }, ik);
    $('#stan').classList.add('s-' + F.status);
    $('#stan').append(ik, h('div', null, h('b', { text: F.nazwa }), F.opis));
  })();

  // ───────── objętość i cel ─────────
  (function objetosc() {
    const tyg = K.tygodnie.map((t) => {
      const od = t.od, doo = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 7);
      const jj = K.jazdy.filter((j) => j.data >= od && j.data < doo);
      return { t, a: jj.filter((j) => j.typ === 'szosa').reduce((s, j) => s + j.km, 0), b: jj.filter((j) => j.typ === 'zwift').reduce((s, j) => s + j.km, 0) };
    });
    $('#obj-legenda').append(h('span', null, h('i', { class: 'kl kw', style: { background: '#B8673C' } }), 'Szosa'), h('span', null, h('i', { class: 'kl kw', style: { background: '#4D6A8E' } }), 'Zwift'), h('span', null, h('i', { class: 'kl kw kl-trasa' }), 'Ten tydzień'));
    W.slupki($('#obj'), {
      wys: 240, m: { l: 32, r: 2, t: 18, b: 24 }, maxSzer: 12, promien: 3, odstep: 2, osY: { ticki: 4, format: (v) => f.liczba(v) },
      osX: (i) => { const od = tyg[i].t.od, p = i ? tyg[i - 1].t.od : null; return !p || p.getMonth() !== od.getMonth() ? f.miesiacKr(od.getMonth()).toUpperCase() : null; },
      wartosc: (d, i) => (i === tyg.length - 1 ? f.liczba(d.v) : null),
      dane: tyg.map((w) => ({ v: w.a + w.b, klasa: w.t.biezacy ? 'akcent' : '', czesci: [{ v: w.a, klasa: 'cz-szosa' }, { v: w.b, klasa: 'cz-zwift' }], tip: () => { const od = w.t.od, dd = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 6); return [W.naglowekTip(`Tydzień ${f.tydzienISO(od)} · ${od.getDate()}–${f.dataKrotka(dd)}`), W.wierszTip(f.liczba(w.a + w.b) + ' km', 'razem'), W.wierszTip(f.liczba(w.a) + ' km', 'szosa', 'kw s-trasa'), W.wierszTip(f.liczba(w.b) + ' km', 'Zwift', 'kw s-zwift')]; } })),
      opis: 'Kilometry tygodniowo',
    });
    const POLA = [{ k: 'km', l: 'Dystans', v: (o) => f.km(o.km), u: 'km' }, { k: 'czas', l: 'Czas', v: (o) => f.liczba(o.czas / 3600, 1), u: 'h' }, { k: 'przewyzszenie', l: 'W górę', v: (o) => f.liczba(o.przewyzszenie), u: 'm' }, { k: 'jazdy', l: 'Jazdy', v: (o) => String(o.jazdy), u: '' }];
    const host = $('#obj-liczby');
    const el = POLA.map((p) => { const v = h('div', { class: 'v' }), d = h('div', { class: 'd' }); host.append(h('div', { class: 'ol' }, h('div', { class: 'l', text: p.l }), v, d)); return { p, v, d }; });
    const ustaw = (k) => {
      const o = K.okresy[k], pr = o.poprzedni;
      el.forEach(({ p, v, d }) => {
        v.replaceChildren(p.v(o), p.u ? h('small', { text: p.u }) : '');
        d.replaceChildren();
        if (pr && pr[p.k]) { const ch = (o[p.k] - pr[p.k]) / pr[p.k]; d.append(h('b', { class: ch < 0 ? 'minus' : '', text: `${ch >= 0 ? '+' : '−'}${f.liczba(Math.abs(ch) * 100)}%` }), k === 'tydzien' ? ' tydzień do tygodnia' : ' vs 1–7 paź'); }
        else d.textContent = k === 'rok' ? 'od 1 stycznia' : 'od 1 sierpnia 2025';
      });
      host.classList.remove('zmiana'); void host.offsetWidth; host.classList.add('zmiana');
    };
    const ops = [{ k: 'tydzien', s: 'Tydzień' }, { k: 'miesiac', s: 'Miesiąc' }, { k: 'rok', s: 'Rok' }, { k: 'wszystko', s: 'Całość' }];
    const bs = ops.map((o) => { const b = h('button', { type: 'button', 'aria-pressed': String(o.k === 'tydzien'), text: o.s }); b.addEventListener('click', () => { bs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); ustaw(o.k); }); return b; });
    $('#okresy').append(...bs);
    ustaw('tydzien');
    // cel
    const dzienRoku = C.narastajaco.length, plan = C.km * dzienRoku / 365;
    $('#cel-proc').textContent = f.procent(C.udzial);
    $('#cel').append(
      h('div', { class: 'cel-v' }, f.liczba(C.teraz), h('small', { text: `/ ${f.liczba(C.km)} km` })),
      h('div', { class: 'cel-tor', role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': C.km, 'aria-valuenow': Math.round(C.teraz), 'aria-label': 'Postęp celu' }, h('i', { style: { width: (C.udzial * 100).toFixed(1) + '%' } }), h('span', { class: 'plan', style: { left: (plan / C.km * 100).toFixed(1) + '%' }, title: 'plan na dziś' })),
      h('p', { class: 'cel-op' }, 'Biała kreska to plan na dziś: ', h('b', { text: `${f.liczba(plan)} km` }), '.'),
      h('div', { class: 'cel-wiersze' },
        h('div', { class: 'w' }, 'Względem planu', h('b', { text: f.znak(Math.round(C.teraz - plan)) + ' km' })),
        h('div', { class: 'w' }, 'Prognoza na koniec roku', h('b', { text: f.liczba(C.prognoza) + ' km' })),
        h('div', { class: 'w' }, 'Potrzeba tygodniowo', h('b', { text: f.liczba(C.potrzebaNaTydzien) + ' km' })),
        h('div', { class: 'w' }, 'Zostało dni', h('b', { text: String(365 - dzienRoku) }))));
  })();

  // ───────── szlaki (segmenty) ─────────
  (function szlaki() {
    const host = $('#szlaki');
    const wszystkie = K.segmenty.slice().sort((a, b) => b.historia.length - a.historia.length);
    let pokazWszystkie = false;
    const karta = (s) => {
      const k = h('article', { class: 'karta szlak' });
      if (s.typ === 'zwift') k.append(h('div', { class: 'ksztalt zw', text: 'ZWIFT' }));
      else {
        const svg = W.svg('svg', { class: 'ksztalt', viewBox: '0 0 76 76', 'aria-hidden': 'true' });
        const bb = W.bbox(s.pts, 0.6), sz = Math.max(bb[2] - bb[0], bb[3] - bb[1]), c = [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2];
        const box = [c[0] - sz / 2, c[1] - sz / 2, c[0] + sz / 2, c[1] + sz / 2], r = W.rzut(box, 76, 76, 8);
        for (const d of M.drogi) { if (d.pts.some((p) => p[0] > box[0] && p[0] < box[2] && p[1] > box[1] && p[1] < box[3])) W.svg('path', { d: sciezka(d.pts, r), class: 'd' }, svg); }
        W.svg('path', { d: sciezka(s.pts, r), class: 's' }, svg);
        const st = r(s.pts[0]); W.svg('circle', { cx: st[0], cy: st[1], r: 2.6 }, svg);
        k.append(svg);
      }
      k.append(h('h3', { text: s.nazwa }), h('div', { class: 'meta', text: `${s.dl >= 1000 ? f.liczba(s.dl / 1000, 2) + ' km' : s.dl + ' m'} · ${f.liczba(s.nach, 1)}% · ${s.typ === 'zwift' ? s.moc + ' W' : s.historia.length + ' prób'}` }));
      // przekrój z modelu terenu
      const prof = h('div', { class: 'prof' });
      if (s.typ === 'szosa') {
        let acc = 0; const dd = [0]; for (let i = 1; i < s.pts.length; i++) { acc += Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1]); dd.push(acc); }
        const ee = s.pts.map((p) => M.wysokosc(p[0], p[1]));
        let mn = Math.min(...ee), mx = Math.max(...ee); if (mx - mn < 6) { const c = (mx + mn) / 2; mn = c - 3; mx = c + 3; }
        const svg = W.svg('svg', { viewBox: '0 0 200 40', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, prof);
        const x = W.skala(0, acc, 0, 200), y = W.skala(mn - 1, mx + 1, 38, 4);
        const pts = dd.map((d, i) => [x(d), y(ee[i])]);
        W.svg('path', { d: W.obszar(pts, 40, 'gladka'), class: 'pf' }, svg); W.svg('path', { d: W.sciezka(pts, 'gladka'), class: 'pl', 'vector-effect': 'non-scaling-stroke' }, svg);
      } else prof.append(h('div', { class: 'meta', style: { padding: '12px 0 10px' }, text: `Wirtualna trasa · ${s.historia.length} prób` }));
      k.append(prof);
      const r = s.ostatnia.czas - s.pr, cz = s.historia.map((x) => x.czas);
      k.append(h('div', { class: 'dol' },
        h('div', { class: 'pr' }, h('small', { text: `Rekord · ${f.dataNumKr(s.prData)}` }), f.tempoSeg(s.pr)),
        h('div', { class: 'ost' }, h('b', { text: f.tempoSeg(s.ostatnia.czas) }), r <= 0 ? 'ostatnio: rekord' : `ostatnio · +${r} s`)),
        h('div', { class: 'spark-k' }, W.sparkline(cz, { szer: 260, wys: 22, odwroc: true, najlepszy: cz.indexOf(Math.min(...cz)) })));
      const sp = k.querySelector('.wk-spark'); sp.setAttribute('width', '100%'); sp.setAttribute('preserveAspectRatio', 'none');
      return k;
    };
    const rysuj = () => {
      host.replaceChildren(...(pokazWszystkie ? wszystkie : wszystkie.slice(0, 6)).map(karta));
      const b = h('button', { class: 'szlaki-wiecej', type: 'button', text: pokazWszystkie ? 'Pokaż mniej' : `Wszystkie szlaki · ${wszystkie.length}` });
      b.addEventListener('click', () => { pokazWszystkie = !pokazWszystkie; rysuj(); });
      host.append(b);
    };
    rysuj();
  })();

  // ───────── kalendarz, strefy, moc ─────────
  (function reszta() {
    const host = $('#kal');
    const ile = host.clientWidth < 560 ? 26 * 7 : 52 * 7;
    const dni = K.dni.slice(-ile).map((d, i, a) => ({ data: d.data, v: d.km, jazdy: d.jazdy, czas: d.czas, dzis: i === a.length - 1 }));
    W.kalendarz(host, { dni, progi: [25, 45, 70], komorka: 11, odstep: 3, promien: 2.5, etykietaMies: (d) => f.miesiacKr(d.getMonth()).toUpperCase(), tip: (d) => [W.naglowekTip(`${f.dzienTygKr(d.data)} ${f.data(d.data)}`), d.jazdy.length ? W.wierszTip(f.km(d.v) + ' km', d.jazdy.map((id) => K.jazdy[id - 1].nazwa).join(', ')) : W.wierszTip('—', 'bez jazdy')], opis: 'Kalendarz jazd' });
    $('#kal-stopka').append(h('span', null, 'Aktywne dni', h('b', { text: String(dni.filter((d) => d.jazdy.length).length) })), h('span', null, 'Seria tygodni', h('b', { text: String(K.seria.tygodnie) })), h('span', null, 'Najdłuższa', h('b', { text: K.seria.najdluzsza + ' tyg.' })));
    const mx = Math.max(...K.strefy.map((z) => z.udzial));
    $('#strefy').append(...K.strefy.map((z) => h('div', { class: 'strefa', title: `${z.nazwa}: ${f.procent(z.udzial)}` }, h('span', { class: 'z', text: 'Z' + z.nr }), h('div', { class: 'tor' }, h('i', { class: 'z' + z.nr, style: { width: (z.udzial / mx * 100).toFixed(1) + '%' } })), h('span', { class: 'p', text: f.czasHM(z.czas) }))));
    const Mo = K.moc;
    $('#moc-legenda').append(h('span', null, h('i', { class: 'kl kl-trasa' }), 'Cały okres'), h('span', null, h('i', { class: 'kl kl-kosc' }), '42 dni'));
    W.linie($('#krzywa'), {
      wys: 300, m: { l: 34, r: 10, t: 12, b: 24 },
      serie: [{ pts: Mo.czasy.map((c, i) => [c, Mo.wszech[i]]), klasa: 's-trasa', obszar: true, obszarOd: 100 }, { pts: Mo.czasy.map((c, i) => [c, Mo.ostatnie42[i]]), klasa: 's-kosc' }],
      x: { skala: 'log', min: 5, max: 3600, linie: true, ticki: [[5, '5 s'], [60, '1 min'], [300, '5 min'], [1200, '20 min'], [3600, '60 min']].map(([v, s], k) => ({ v, s, kotwica: k === 0 ? 'start' : k === 4 ? 'end' : 'middle' })) },
      y: { min: 100, max: 900, ticki: [100, 300, 500, 700, 900], format: (v) => f.liczba(v) },
      tip: (i) => [W.naglowekTip(Mo.etykiety[i]), W.wierszTip(Mo.wszech[i] + ' W', 'cały okres', 's-trasa'), Mo.ostatnie42[i] != null ? W.wierszTip(Mo.ostatnie42[i] + ' W', 'ostatnie 42 dni') : W.wierszTip('—', 'brak próby')],
      opis: 'Krzywa mocy z trenażera',
    });
  })();

  // ───────── szczyty (rekordy) ─────────
  $('#szczyty-lista').append(...K.rekordy.map((r, i) => {
    const ik = W.svg('svg', { width: 26, height: 22, viewBox: '0 0 26 22', 'aria-hidden': 'true' });
    W.svg('path', { d: 'M13 2L24 20H2Z', fill: i === 0 ? '#FF7A3D' : 'none', stroke: i === 0 ? '#FF7A3D' : '#D3B47A', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, ik);
    return h('li', { class: 'szczyt' }, ik, h('div', { class: 'n', text: r.nazwa }), h('div', { class: 'v' }, f.liczba(r.wartosc, r.jednostka === 'km/h' || r.klucz === 'dystans' ? 1 : 0), h('small', { text: r.jednostka })), h('div', { class: 'd', text: `${f.data(r.data)} · ${r.opis}` }));
  }));

  // ───────── dziennik ─────────
  $('#dziennik').append(h('table', { class: 'dz' },
    h('thead', null, h('tr', null, h('th', { text: 'Dzień' }), h('th', { text: 'Wyjazd' }), h('th', { class: 'ukryj-m', text: 'Teren' }), h('th', { class: 'num', text: 'Km' }), h('th', { class: 'num', text: 'Czas' }), h('th', { class: 'num ukryj-m', text: 'W górę' }), h('th', { class: 'num ukryj-m', text: 'Tętno' }))),
    h('tbody', null, K.jazdy.slice(-10).reverse().map((j) => h('tr', null,
      h('td', { text: `${f.dzienTygKr(j.data)} ${f.dataNumKr(j.data)}` }), h('td', { class: 'nz', text: j.nazwa.replace('Zwift · ', '') }),
      h('td', { class: 'ukryj-m' }, h('span', { class: 'typ' + (j.typ === 'zwift' ? ' zw' : ''), text: j.typ === 'zwift' ? 'Zwift' : 'Szosa' })),
      h('td', { class: 'num', text: f.km(j.km) }), h('td', { class: 'num', text: f.czas(j.czas) }), h('td', { class: 'num ukryj-m', text: f.liczba(j.przewyzszenie) + ' m' }), h('td', { class: 'num ukryj-m', text: String(j.tetno) }))))));

  // ───────── nawigacja ─────────
  (function () {
    const linki = [...document.querySelectorAll('.nawigacja a')], sek = linki.map((a) => document.querySelector(a.getAttribute('href')));
    const io = new IntersectionObserver((w) => w.forEach((x) => { if (x.isIntersecting) { const i = sek.indexOf(x.target); linki.forEach((a, k) => a.classList.toggle('aktywny', k === i)); } }), { rootMargin: '-40% 0px -55% 0px' });
    sek.forEach((s) => s && io.observe(s));
  })();
  W.typografia(document.body);
})();
