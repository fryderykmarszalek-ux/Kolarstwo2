/*
 * Kolarstwo 2 — wspólne klocki do wykresów (bez bibliotek).
 * Każdy styl rysuje własne wykresy, ale korzysta z tych samych skal, ścieżek,
 * tooltipów i obsługi klawiatury, żeby zachowanie było wszędzie tak samo dopracowane.
 * Wygląd (kolory, grubości, kroje) ustawia CSS danego stylu przez klasy .wk-*.
 */
(function (global) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const W = {};

  W.ruchOgraniczony = () => global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───── tworzenie elementów ─────
  W.svg = function (tag, attrs, parent) {
    const el = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  W.h = function (tag, attrs, ...dzieci) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of dzieci.flat(Infinity)) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    return el;
  };
  W.tekst = (parent, x, y, s, attrs) => { const t = W.svg('text', Object.assign({ x, y }, attrs || {}), parent); t.textContent = s; return t; };

  // ───── skale i podziałki ─────
  W.skala = function (d0, d1, r0, r1) {
    const f = (v) => r0 + ((v - d0) / ((d1 - d0) || 1)) * (r1 - r0);
    f.inv = (p) => d0 + ((p - r0) / ((r1 - r0) || 1)) * (d1 - d0);
    f.dom = [d0, d1]; f.zak = [r0, r1];
    return f;
  };
  W.skalaLog = function (d0, d1, r0, r1) {
    const l0 = Math.log(d0), l1 = Math.log(d1);
    const f = (v) => r0 + ((Math.log(v) - l0) / (l1 - l0)) * (r1 - r0);
    f.inv = (p) => Math.exp(l0 + ((p - r0) / (r1 - r0)) * (l1 - l0));
    return f;
  };
  W.krok = function (span, n) {
    const s0 = span / Math.max(1, n), p = Math.pow(10, Math.floor(Math.log10(s0))), e = s0 / p;
    return (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * p;
  };
  W.ticki = function (min, max, n = 4) {
    if (max === min) return [min];
    const k = W.krok(max - min, n), out = [];
    for (let v = Math.ceil(min / k - 1e-9) * k; v <= max + k * 1e-6; v += k) out.push(+v.toFixed(8));
    return out;
  };
  W.ladnyMax = (max, n = 4) => { if (max <= 0) return 1; const k = W.krok(max, n); return Math.ceil(max / k - 1e-9) * k; };

  // ───── ścieżki ─────
  const r2 = (v) => Math.round(v * 100) / 100;
  W.sciezka = function (pts, krzywa) {
    const p = pts.filter((q) => q && isFinite(q[0]) && isFinite(q[1]));
    if (!p.length) return '';
    if (krzywa === 'schodki') {
      let d = `M${r2(p[0][0])},${r2(p[0][1])}`;
      for (let i = 1; i < p.length; i++) d += `H${r2(p[i][0])}V${r2(p[i][1])}`;
      return d;
    }
    if (krzywa !== 'gladka' || p.length < 3) return 'M' + p.map((q) => r2(q[0]) + ',' + r2(q[1])).join('L');
    // monotoniczna krzywa sześcienna (nie przestrzeliwuje wartości)
    const n = p.length, dx = [], m = [], t = new Array(n);
    for (let i = 0; i < n - 1; i++) { dx[i] = p[i + 1][0] - p[i][0]; m[i] = (p[i + 1][1] - p[i][1]) / (dx[i] || 1e-9); }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (3 * (dx[i - 1] + dx[i])) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
    let d = `M${r2(p[0][0])},${r2(p[0][1])}`;
    for (let i = 0; i < n - 1; i++) {
      const h = dx[i] / 3;
      d += `C${r2(p[i][0] + h)},${r2(p[i][1] + t[i] * h)},${r2(p[i + 1][0] - h)},${r2(p[i + 1][1] - t[i + 1] * h)},${r2(p[i + 1][0])},${r2(p[i + 1][1])}`;
    }
    return d;
  };
  W.obszar = function (pts, y0, krzywa) {
    const p = pts.filter((q) => q && isFinite(q[1]));
    if (!p.length) return '';
    return W.sciezka(p, krzywa) + `L${r2(p[p.length - 1][0])},${r2(y0)}L${r2(p[0][0])},${r2(y0)}Z`;
  };
  // słupek z zaokrąglonym końcem danych i prostą podstawą
  W.slupek = function (x, y, w, h, r, wDol) {
    if (h <= 0.5) return '';
    r = Math.min(r, w / 2, h);
    if (wDol) return `M${r2(x)},${r2(y)}H${r2(x + w)}V${r2(y + h - r)}Q${r2(x + w)},${r2(y + h)} ${r2(x + w - r)},${r2(y + h)}H${r2(x + r)}Q${r2(x)},${r2(y + h)} ${r2(x)},${r2(y + h - r)}Z`;
    return `M${r2(x)},${r2(y + h)}V${r2(y + r)}Q${r2(x)},${r2(y)} ${r2(x + r)},${r2(y)}H${r2(x + w - r)}Q${r2(x + w)},${r2(y)} ${r2(x + w)},${r2(y + r)}V${r2(y + h)}Z`;
  };

  // ───── rozmiar: rysuj ponownie, gdy zmienia się szerokość ─────
  W.rozmiar = function (el, rysuj) {
    let ostatnia = -1, raf = 0;
    const go = () => { const w = Math.round(el.clientWidth); if (w && w !== ostatnia) { ostatnia = w; rysuj(w); } };
    if ('ResizeObserver' in global) new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(go); }).observe(el);
    else global.addEventListener('resize', go);
    go();
  };

  // ───── tooltip ─────
  W.tooltip = function (host) {
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    const tip = W.h('div', { class: 'wk-tip', role: 'status', 'aria-live': 'polite' });
    host.appendChild(tip);
    return {
      el: tip,
      pokaz(x, y, tresc) {
        tip.replaceChildren(...[].concat(tresc));
        tip.classList.add('wk-tip--on');
        const hw = host.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
        let left = x + 14; if (left + tw > hw - 4) left = x - tw - 14; if (left < 4) left = Math.max(4, Math.min(hw - tw - 4, x - tw / 2));
        let top = y - th - 12; if (top < 4) top = y + 16;
        tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
      },
      ukryj() { tip.classList.remove('wk-tip--on'); },
    };
  };
  // wiersz tooltipa: wartość najpierw, opis potem, kreska w kolorze serii
  W.wierszTip = function (wartosc, opis, klasaKreski) {
    return W.h('div', { class: 'wk-tip-w' },
      klasaKreski ? W.h('span', { class: 'wk-tip-kreska ' + klasaKreski }) : null,
      W.h('strong', { text: wartosc }), W.h('span', { class: 'wk-tip-o', text: opis }));
  };
  W.naglowekTip = (s) => W.h('div', { class: 'wk-tip-n', text: s });

  // ───── wykres słupkowy ─────
  /* opts: dane [{v, klasa, tip:()=>nodes, etykieta}], wys, m {l,r,t,b}, maxSzer, promien, odstep,
     osY {ticki, format, szer}, osX (i, d) => string|null, wartosc (d,i) => string|null, klasa */
  W.slupki = function (host, opts) {
    const o = Object.assign({ wys: 200, m: { l: 36, r: 8, t: 14, b: 26 }, maxSzer: 24, promien: 4, odstep: 2, osY: { ticki: 4, format: String }, siatka: true }, opts);
    host.classList.add('wk');
    const tip = W.tooltip(host);
    let svg = null, aktywny = -1;
    function rysuj(szer) {
      if (svg) svg.remove();
      const m = o.m, W0 = szer, H = o.wys;
      svg = W.svg('svg', { width: W0, height: H, viewBox: `0 0 ${W0} ${H}`, class: 'wk-svg ' + (o.klasa || ''), role: 'img', tabindex: 0, 'aria-label': o.opis || '' });
      host.prepend(svg);
      const n = o.dane.length, maxV = o.max ?? W.ladnyMax(Math.max(...o.dane.map((d) => d.v)), o.osY.ticki);
      const y = W.skala(0, maxV, H - m.b, m.t);
      const pasmo = (W0 - m.l - m.r) / n, w = Math.max(1, Math.min(o.maxSzer, pasmo - o.odstep));
      const g = W.svg('g', null, svg);
      if (o.siatka) for (const t of W.ticki(0, maxV, o.osY.ticki)) {
        W.svg('line', { x1: m.l, x2: W0 - m.r, y1: y(t), y2: y(t), class: t === 0 ? 'wk-baza' : 'wk-siatka' }, g);
        if (o.osY.format) W.tekst(g, m.l - 8, y(t) + 3.5, o.osY.format(t), { class: 'wk-os-t', 'text-anchor': 'end' });
      }
      const slupki = [];
      o.dane.forEach((d, i) => {
        const x = m.l + i * pasmo + (pasmo - w) / 2;
        const gs = W.svg('g', { class: 'wk-sl ' + (d.klasa || '') }, g);
        if (d.czesci) {
          // słupek dzielony: części od dołu, 2 px przerwy w kolorze tła, zaokrąglony tylko wierzch
          const nz = d.czesci.filter((c) => c.v > 0);
          let baza = y(0);
          nz.forEach((c, k) => {
            const hpx = y(0) - y(c.v), gora = baza - hpx, przerwa = k > 0 ? o.odstep : 0;
            const sciezka = W.slupek(x, gora, w, hpx - przerwa, k === nz.length - 1 ? o.promien : 0);
            if (sciezka) W.svg('path', { d: sciezka, class: 'wk-slupek ' + (c.klasa || '') }, gs);
            baza = gora;
          });
        } else W.svg('path', { d: W.slupek(x, y(d.v), w, y(0) - y(d.v), o.promien), class: 'wk-slupek' }, gs);
        slupki.push(gs);
        if (o.osX) { const s = o.osX(i, d); if (s) W.tekst(g, x + w / 2, H - m.b + 16, s, { class: 'wk-os-t', 'text-anchor': 'middle' }); }
        if (o.wartosc) { const s = o.wartosc(d, i); if (s) W.tekst(g, x + w / 2, y(d.v) - 6, s, { class: 'wk-wartosc', 'text-anchor': 'middle' }); }
      });
      const hit = W.svg('rect', { x: m.l, y: m.t, width: W0 - m.l - m.r, height: H - m.t - m.b + 20, fill: 'transparent', class: 'wk-hit' }, svg);
      const pokaz = (i) => {
        if (i < 0 || i >= n) return;
        aktywny = i;
        slupki.forEach((s, k) => s.classList.toggle('wk-aktywny', k === i));
        svg.classList.add('wk-hover');
        const d = o.dane[i], x = m.l + i * pasmo + pasmo / 2;
        if (d.tip) tip.pokaz(x, y(d.v), d.tip());
        if (o.naHover) o.naHover(i);
      };
      const ukryj = () => { aktywny = -1; slupki.forEach((s) => s.classList.remove('wk-aktywny')); svg.classList.remove('wk-hover'); tip.ukryj(); if (o.naHover) o.naHover(-1); };
      hit.addEventListener('pointermove', (e) => { const r = svg.getBoundingClientRect(); pokaz(Math.floor((e.clientX - r.left - m.l) / pasmo)); });
      hit.addEventListener('pointerleave', ukryj);
      svg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); pokaz(Math.max(0, Math.min(n - 1, (aktywny < 0 ? n - 1 : aktywny) + (e.key === 'ArrowRight' ? 1 : -1)))); }
        if (e.key === 'Escape') ukryj();
      });
      svg.addEventListener('blur', ukryj);
      if (o.poRysowaniu) o.poRysowaniu({ svg, y, pasmo, w, m, W: W0, H });
    }
    W.rozmiar(host, rysuj);
    return { odswiez: (nowe) => { Object.assign(o, nowe); const w = host.clientWidth; if (w) rysuj(w); } };
  };

  // ───── wykres liniowy (jedna oś Y!) z celownikiem ─────
  /* opts: serie [{klucz, nazwa, pts: [[x,y]...], klasa, obszar, krzywa}], x {min,max, ticki:[{v,s}], skala:'lin'|'log'},
     y {min,max, ticki n | [..], format}, wys, m, tip (i) => nodes, zero (y wartość linii bazowej), znaczniki [{x, s, klasa}] */
  W.linie = function (host, opts) {
    const o = Object.assign({ wys: 220, m: { l: 40, r: 12, t: 14, b: 28 }, krzywa: 'gladka' }, opts);
    host.classList.add('wk');
    const tip = W.tooltip(host);
    let svg = null;
    const api = { x: null, y: null, ustawKursor: null, odswiez: null };
    function rysuj(szer) {
      if (svg) svg.remove();
      const m = o.m, W0 = szer, H = o.wys;
      svg = W.svg('svg', { width: W0, height: H, viewBox: `0 0 ${W0} ${H}`, class: 'wk-svg ' + (o.klasa || ''), role: 'img', tabindex: 0, 'aria-label': o.opis || '' });
      host.prepend(svg);
      const xs = o.serie[0].pts.map((p) => p[0]);
      const xmin = o.x?.min ?? Math.min(...xs), xmax = o.x?.max ?? Math.max(...xs);
      const x = o.x?.skala === 'log' ? W.skalaLog(xmin, xmax, m.l, W0 - m.r) : W.skala(xmin, xmax, m.l, W0 - m.r);
      const wszystkie = o.serie.flatMap((s) => s.pts.map((p) => p[1])).filter((v) => v != null && isFinite(v));
      const ymin = o.y?.min ?? Math.min(0, ...wszystkie), ymax = o.y?.max ?? W.ladnyMax(Math.max(...wszystkie), 4);
      const y = W.skala(ymin, ymax, H - m.b, m.t);
      api.x = x; api.y = y;
      const g = W.svg('g', null, svg);
      const ticki = Array.isArray(o.y?.ticki) ? o.y.ticki : W.ticki(ymin, ymax, o.y?.ticki ?? 4);
      if (o.siatka !== false) for (const t of ticki) {
        W.svg('line', { x1: m.l, x2: W0 - m.r, y1: y(t), y2: y(t), class: t === (o.zero ?? ymin) ? 'wk-baza' : 'wk-siatka' }, g);
        if (o.y?.format !== null) W.tekst(g, m.l - 8, y(t) + 3.5, (o.y?.format || String)(t), { class: 'wk-os-t', 'text-anchor': 'end' });
      }
      for (const t of o.x?.ticki || []) {
        const px = x(t.v);
        if (o.x.linie) W.svg('line', { x1: px, x2: px, y1: m.t, y2: H - m.b, class: 'wk-siatka wk-siatka-x' }, g);
        W.tekst(g, px, H - m.b + 17, t.s, { class: 'wk-os-t', 'text-anchor': t.kotwica || 'middle' });
      }
      if (o.tlo) o.tlo({ g, x, y, m, W: W0, H });
      for (const s of o.serie) {
        const pts = s.pts.filter((p) => p[1] != null).map((p) => [x(p[0]), y(p[1])]);
        if (s.obszar) W.svg('path', { d: W.obszar(pts, y(s.obszarOd ?? Math.max(ymin, 0)), s.krzywa || o.krzywa), class: 'wk-obszar ' + (s.klasa || '') }, g);
        W.svg('path', { d: W.sciezka(pts, s.krzywa || o.krzywa), class: 'wk-linia ' + (s.klasa || ''), fill: 'none' }, g);
        if (s.koniec) { const p = pts[pts.length - 1]; W.svg('circle', { cx: p[0], cy: p[1], r: 4, class: 'wk-koniec ' + (s.klasa || '') }, g); }
      }
      for (const z of o.znaczniki || []) {
        const px = x(z.x);
        W.svg('line', { x1: px, x2: px, y1: m.t, y2: H - m.b, class: 'wk-znacznik ' + (z.klasa || '') }, g);
        if (z.s) W.tekst(g, px + 5, m.t + 10, z.s, { class: 'wk-znacznik-t' });
      }
      if (o.nad) o.nad({ g, x, y, m, W: W0, H });
      // celownik
      const krzyz = W.svg('line', { y1: m.t, y2: H - m.b, class: 'wk-krzyz' }, svg);
      const kropki = o.serie.map((s) => W.svg('circle', { r: 4, class: 'wk-kropka ' + (s.klasa || '') }, svg));
      const hit = W.svg('rect', { x: m.l, y: 0, width: Math.max(0, W0 - m.l - m.r), height: H, fill: 'transparent', class: 'wk-hit' }, svg);
      let idx = -1;
      const najblizszy = (px) => { const v = x.inv(px); let b = 0, bd = Infinity; xs.forEach((q, i) => { const d = Math.abs(q - v); if (d < bd) { bd = d; b = i; } }); return b; };
      const pokaz = (i, cichy) => {
        idx = i;
        if (i < 0) { svg.classList.remove('wk-hover'); tip.ukryj(); return; }
        const px = x(xs[i]);
        krzyz.setAttribute('x1', px); krzyz.setAttribute('x2', px);
        o.serie.forEach((s, k) => { const v = s.pts[i] && s.pts[i][1]; if (v == null) { kropki[k].setAttribute('r', 0); return; } kropki[k].setAttribute('r', 4); kropki[k].setAttribute('cx', px); kropki[k].setAttribute('cy', y(v)); });
        svg.classList.add('wk-hover');
        if (o.tip && !cichy) { const v0 = o.serie[0].pts[i][1]; tip.pokaz(px, y(v0 ?? ymax), o.tip(i)); }
        if (o.naHover && !cichy) o.naHover(i);
      };
      api.ustawKursor = (i) => { if (i < 0) { pokaz(-1); return; } pokaz(i, true); };
      hit.addEventListener('pointermove', (e) => { const r = svg.getBoundingClientRect(); pokaz(najblizszy(e.clientX - r.left)); });
      hit.addEventListener('pointerleave', () => { pokaz(-1); if (o.naHover) o.naHover(-1); });
      svg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const krok = e.shiftKey ? 10 : 1; pokaz(Math.max(0, Math.min(xs.length - 1, (idx < 0 ? xs.length - 1 : idx) + (e.key === 'ArrowRight' ? krok : -krok)))); }
        if (e.key === 'Escape') { pokaz(-1); if (o.naHover) o.naHover(-1); }
      });
      svg.addEventListener('blur', () => { pokaz(-1); if (o.naHover) o.naHover(-1); });
    }
    api.odswiez = (nowe) => { Object.assign(o, nowe); const w = host.clientWidth; if (w) rysuj(w); };
    W.rozmiar(host, rysuj);
    return api;
  };

  // ───── kalendarz-heatmapa ─────
  /* opts: dni [{data, v}], progi [..4], komorka, odstep, promien, ksztalt 'kwadrat'|'kropka', tip(d) */
  W.kalendarz = function (host, opts) {
    const o = Object.assign({ komorka: 12, odstep: 3, promien: 2, ksztalt: 'kwadrat', etykietyDni: ['pn', '', 'śr', '', 'pt', '', 'nd'], m: { l: 24, t: 18 } }, opts);
    host.classList.add('wk');
    const tip = W.tooltip(host);
    const dni = o.dni;
    const pierwszy = dni[0].data, przes = (pierwszy.getDay() + 6) % 7;
    const kolumny = Math.ceil((dni.length + przes) / 7);
    const krok = o.komorka + o.odstep;
    const Wd = o.m.l + kolumny * krok, H = o.m.t + 7 * krok;
    const svg = W.svg('svg', { viewBox: `0 0 ${Wd} ${H}`, class: 'wk-svg wk-kal ' + (o.klasa || ''), role: 'img', tabindex: 0, 'aria-label': o.opis || 'Kalendarz aktywności', preserveAspectRatio: 'xMinYMin meet' });
    if (o.szerokosc === 'naturalna') { svg.setAttribute('width', Wd); svg.setAttribute('height', H); } else svg.style.width = '100%';
    host.prepend(svg);
    const poziom = (v) => { if (!v) return 0; let p = 1; for (const t of o.progi) if (v > t) p++; return Math.min(p, o.progi.length + 1); };
    const komorki = [];
    let mies = -1;
    dni.forEach((d, i) => {
      const k = i + przes, c = Math.floor(k / 7), r = k % 7;
      const x = o.m.l + c * krok, y = o.m.t + r * krok;
      const p = poziom(d.v);
      let el;
      if (o.ksztalt === 'kropka') {
        const maxR = o.komorka / 2; const rr = p === 0 ? 1.1 : maxR * Math.sqrt(p / (o.progi.length + 1));
        el = W.svg('circle', { cx: x + maxR, cy: y + maxR, r: rr.toFixed(2), class: `wk-kom wk-p${p}` }, svg);
      } else el = W.svg('rect', { x, y, width: o.komorka, height: o.komorka, rx: o.promien, class: `wk-kom wk-p${p}` }, svg);
      if (d.dzis) el.classList.add('wk-dzis');
      komorki.push({ el, x, y, d });
      if (d.data.getMonth() !== mies && r === 0) { mies = d.data.getMonth(); if (o.etykietaMies) W.tekst(svg, x, o.m.t - 6, o.etykietaMies(d.data), { class: 'wk-os-t' }); }
    });
    o.etykietyDni.forEach((s, r) => { if (s) W.tekst(svg, 0, o.m.t + r * krok + o.komorka - 2, s, { class: 'wk-os-t' }); });
    let akt = -1;
    const pokaz = (i) => {
      if (akt >= 0) komorki[akt].el.classList.remove('wk-aktywny');
      akt = i; if (i < 0) { tip.ukryj(); return; }
      const k = komorki[i]; k.el.classList.add('wk-aktywny');
      const skala = svg.clientWidth / Wd;
      if (o.tip) tip.pokaz((k.x + o.komorka / 2) * skala, k.y * skala, o.tip(k.d));
    };
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect(), skala = r.width / Wd;
      const c = Math.floor(((e.clientX - r.left) / skala - o.m.l) / krok), rr = Math.floor(((e.clientY - r.top) / skala - o.m.t) / krok);
      const i = c * 7 + rr - przes;
      if (c < 0 || rr < 0 || rr > 6 || i < 0 || i >= dni.length) { pokaz(-1); return; }
      if (i !== akt) pokaz(i);
    });
    svg.addEventListener('pointerleave', () => pokaz(-1));
    svg.addEventListener('keydown', (e) => {
      const ruch = { ArrowRight: 7, ArrowLeft: -7, ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (ruch) { e.preventDefault(); pokaz(Math.max(0, Math.min(dni.length - 1, (akt < 0 ? dni.length - 1 : akt) + ruch))); }
      if (e.key === 'Escape') pokaz(-1);
    });
    svg.addEventListener('blur', () => pokaz(-1));
    return { svg, poziom };
  };

  // ───── tabela (widok tabelaryczny każdego wykresu) ─────
  W.tabela = function (kolumny, wiersze, podpis) {
    const t = W.h('table', { class: 'wk-tabela' });
    if (podpis) t.append(W.h('caption', { text: podpis }));
    t.append(W.h('thead', null, W.h('tr', null, kolumny.map((k) => W.h('th', { scope: 'col', class: k.num ? 'num' : null, text: k.s })))));
    t.append(W.h('tbody', null, wiersze.map((w) => W.h('tr', null, kolumny.map((k, i) => W.h(i ? 'td' : 'th', { scope: i ? null : 'row', class: k.num ? 'num' : null, text: k.f ? k.f(w) : w[k.k] }))))));
    return t;
  };
  // przycisk „Wykres / Tabela" — przełącza widok w karcie
  W.wykresTabela = function (przycisk, wykres, tabelaFn) {
    let tab = null, naTabeli = false;
    przycisk.setAttribute('aria-pressed', 'false');
    przycisk.addEventListener('click', () => {
      naTabeli = !naTabeli;
      if (naTabeli && !tab) { tab = W.h('div', { class: 'wk-tabela-wrap' }, tabelaFn()); wykres.after(tab); }
      wykres.hidden = naTabeli; if (tab) tab.hidden = !naTabeli;
      przycisk.setAttribute('aria-pressed', String(naTabeli));
      przycisk.textContent = naTabeli ? (przycisk.dataset.wykres || 'Wykres') : (przycisk.dataset.tabela || 'Tabela');
    });
  };

  // ───── sparkline ─────
  W.sparkline = function (wartosci, opts) {
    const o = Object.assign({ szer: 80, wys: 20, pad: 2.5, klasa: '', krzywa: 'linia', odwroc: false, kropkaKonca: true, minMax: null }, opts);
    const svg = W.svg('svg', { width: o.szer, height: o.wys, viewBox: `0 0 ${o.szer} ${o.wys}`, class: 'wk-spark ' + o.klasa, 'aria-hidden': 'true' });
    const v = wartosci.filter((q) => q != null);
    if (v.length < 2) return svg;
    let mn = Math.min(...v), mx = Math.max(...v); if (o.minMax) [mn, mx] = o.minMax; if (mx === mn) mx = mn + 1;
    const x = W.skala(0, wartosci.length - 1, o.pad, o.szer - o.pad);
    const y = o.odwroc ? W.skala(mn, mx, o.pad, o.wys - o.pad) : W.skala(mn, mx, o.wys - o.pad, o.pad);
    const pts = wartosci.map((q, i) => (q == null ? null : [x(i), y(q)])).filter(Boolean);
    if (o.obszar) W.svg('path', { d: W.obszar(pts, o.odwroc ? o.pad : o.wys - o.pad, o.krzywa), class: 'wk-spark-obszar' }, svg);
    W.svg('path', { d: W.sciezka(pts, o.krzywa), class: 'wk-spark-linia', fill: 'none' }, svg);
    if (o.najlepszy != null) { const p = pts[o.najlepszy]; if (p) W.svg('circle', { cx: p[0], cy: p[1], r: 2.4, class: 'wk-spark-pr' }, svg); }
    if (o.kropkaKonca) { const p = pts[pts.length - 1]; W.svg('circle', { cx: p[0], cy: p[1], r: 2.4, class: 'wk-spark-kon' }, svg); }
    return svg;
  };

  // ───── poziomice (marching squares) ─────
  W.kontury = function (fn, x0, y0, x1, y1, krok, poziomy) {
    const nx = Math.ceil((x1 - x0) / krok) + 1, ny = Math.ceil((y1 - y0) / krok) + 1;
    const v = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) v[j * nx + i] = fn(x0 + i * krok, y0 + j * krok);
    const wynik = [];
    for (const L of poziomy) {
      const odc = [];
      const interp = (xa, ya, va, xb, yb, vb) => { const t = (L - va) / (vb - va); return [xa + (xb - xa) * t, ya + (yb - ya) * t]; };
      for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
        const a = v[j * nx + i], b = v[j * nx + i + 1], c = v[(j + 1) * nx + i + 1], d = v[(j + 1) * nx + i];
        const kod = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
        if (kod === 0 || kod === 15) continue;
        const X = x0 + i * krok, Y = y0 + j * krok, X1 = X + krok, Y1 = Y + krok;
        const gora = () => interp(X, Y, a, X1, Y, b), prawo = () => interp(X1, Y, b, X1, Y1, c), dol = () => interp(X, Y1, d, X1, Y1, c), lewo = () => interp(X, Y, a, X, Y1, d);
        switch (kod) {
          case 1: case 14: odc.push([lewo(), dol()]); break;
          case 2: case 13: odc.push([dol(), prawo()]); break;
          case 3: case 12: odc.push([lewo(), prawo()]); break;
          case 4: case 11: odc.push([gora(), prawo()]); break;
          case 5: odc.push([lewo(), gora()]); odc.push([dol(), prawo()]); break;
          case 6: case 9: odc.push([gora(), dol()]); break;
          case 7: case 8: odc.push([lewo(), gora()]); break;
          case 10: odc.push([lewo(), dol()]); odc.push([gora(), prawo()]); break;
        }
      }
      // łączenie odcinków w linie
      const kl = (p) => Math.round(p[0] * 1000) + ':' + Math.round(p[1] * 1000);
      const mapa = new Map();
      odc.forEach((s, i) => { for (const p of s) { const k = kl(p); if (!mapa.has(k)) mapa.set(k, []); mapa.get(k).push(i); } });
      const uzyty = new Uint8Array(odc.length), linie = [];
      for (let i = 0; i < odc.length; i++) {
        if (uzyty[i]) continue; uzyty[i] = 1;
        const lin = [odc[i][0], odc[i][1]];
        for (const kier of [1, 0]) {
          for (;;) {
            const kon = kier ? lin[lin.length - 1] : lin[0];
            const kand = (mapa.get(kl(kon)) || []).find((q) => !uzyty[q]);
            if (kand === undefined) break;
            uzyty[kand] = 1;
            const s = odc[kand], nast = kl(s[0]) === kl(kon) ? s[1] : s[0];
            if (kier) lin.push(nast); else lin.unshift(nast);
          }
        }
        linie.push(lin);
      }
      wynik.push({ poziom: L, linie });
    }
    return wynik;
  };

  // ───── licznik (odliczanie liczby przy wejściu) ─────
  W.licznik = function (el, doWartosci, format, czas = 900) {
    if (W.ruchOgraniczony()) { el.textContent = format(doWartosci); return; }
    const t0 = performance.now();
    const krok = (t) => { const p = Math.min(1, (t - t0) / czas), e = 1 - Math.pow(1 - p, 3); el.textContent = format(doWartosci * e); if (p < 1) requestAnimationFrame(krok); };
    requestAnimationFrame(krok);
  };

  // ───── rzutowanie mapy (km → px) z zachowaniem proporcji ─────
  W.rzut = function (bbox, szer, wys, pad = 12) {
    const [x0, y0, x1, y1] = bbox; const sx = (szer - 2 * pad) / (x1 - x0), sy = (wys - 2 * pad) / (y1 - y0), s = Math.min(sx, sy);
    const ox = pad + ((szer - 2 * pad) - (x1 - x0) * s) / 2, oy = pad + ((wys - 2 * pad) - (y1 - y0) * s) / 2;
    const f = (p) => [ox + (p[0] - x0) * s, oy + (p[1] - y0) * s];
    f.s = s; f.inv = (q) => [(q[0] - ox) / s + x0, (q[1] - oy) / s + y0];
    return f;
  };
  W.bbox = function (pts, margines = 0) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of pts) { if (p[0] < x0) x0 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[0] > x1) x1 = p[0]; if (p[1] > y1) y1 = p[1]; }
    return [x0 - margines, y0 - margines, x1 + margines, y1 + margines];
  };

  // ───── polska typografia: twarde spacje tam, gdzie wiersz nie może się złamać ─────
  // jednoliterowe spójniki i przyimki nie zostają na końcu wiersza; liczba trzyma się jednostki; myślnik nie zaczyna wiersza
  W.typografia = function (root) {
    const it = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement && /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentElement.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nb = ' ';
    for (let n = it.nextNode(); n; n = it.nextNode()) {
      let t = n.nodeValue;
      if (!/\s/.test(t)) continue;
      const nowy = t
        .replace(/(^|[\s(„])([aiouwzAIOUWZ]) /g, '$1$2' + nb)
        .replace(/(^|[\s(„ ])([aiouwzAIOUWZ]) /g, '$1$2' + nb) // drugi przebieg: „i z", „a w"
        .replace(/(\d) (km\/h|km|m n\.p\.m\.|m|s|h|bpm|pkt|W|%|min|dni|tyg\.)(?=$|[\s.,;:)!?—–])/g, '$1' + nb + '$2')
        .replace(/ ([—–]) /g, nb + '$1 ');
      if (nowy !== t) n.nodeValue = nowy;
    }
  };

  // ───── mapa trasy (wspólna mechanika, wygląd z CSS: klasy .m-*) ─────
  /* opts: mapa (K.mapa), trasa [[x,y]..] co 100 m, segmenty [{od,do}] w km, kontury {krok, poziomy, gruby} | null,
     miejsca, km (co ile km znacznik, 0 = brak), etykietaStartu, rzeka ('Wisła' | null), skalaKm, polnoc,
     margines (km), pad (px), onHover(i), promienKursora, poswiata */
  W.mapaTrasy = function (host, opts) {
    const o = Object.assign({ kontury: null, miejsca: true, km: 10, etykietaStartu: 'Start · meta', rzeka: 'Wisła', skalaKm: 2, polnoc: true, margines: 1.6, pad: 12, poswiata: false, promienKursora: 5 }, opts);
    const M = o.mapa, trasa = o.trasa, bb = W.bbox(trasa, o.margines);
    const kont = o.kontury ? W.kontury(M.wysokosc, Math.max(-1, bb[0] - 9), Math.max(-1, bb[1] - 9), Math.min(M.szer + 1, bb[2] + 9), Math.min(M.wys + 1, bb[3] + 9), o.kontury.krok || 0.2, o.kontury.poziomy) : [];
    let rzut = null, kursor = null, przejechana = null, kh = null, kv = null;
    const sc = (pts, co = 1) => 'M' + pts.filter((_, i) => i % co === 0 || i === pts.length - 1).map((p) => { const q = rzut(p); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('L');
    const api = {
      kursor(i) {
        if (!kursor) return;
        if (i < 0 || i == null) { kursor.style.opacity = 0; if (kh) { kh.style.opacity = 0; kv.style.opacity = 0; } if (przejechana) przejechana.setAttribute('d', ''); return; }
        const q = rzut(trasa[i]);
        kursor.setAttribute('transform', `translate(${q[0].toFixed(1)},${q[1].toFixed(1)})`); kursor.style.opacity = 1;
        if (kh) { kh.setAttribute('y1', q[1]); kh.setAttribute('y2', q[1]); kv.setAttribute('x1', q[0]); kv.setAttribute('x2', q[0]); kh.style.opacity = 1; kv.style.opacity = 1; }
        if (przejechana) przejechana.setAttribute('d', sc(trasa.slice(0, i + 1)));
      },
    };
    W.rozmiar(host, (szer) => {
      host.querySelectorAll('svg.m-svg').forEach((s) => s.remove());
      const wys = host.clientHeight || Math.round(szer * 0.75);
      const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
      let bw = bb[2] - bb[0], bh = bb[3] - bb[1];
      if (bw / bh > szer / wys) bh = bw * wys / szer; else bw = bh * szer / wys;
      rzut = W.rzut([cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2], szer, wys, o.pad);
      api.rzut = rzut;
      const svg = W.svg('svg', { class: 'm-svg', viewBox: `0 0 ${szer} ${wys}`, width: szer, height: wys, role: 'img', 'aria-label': o.opis || 'Mapa trasy' });
      host.prepend(svg);
      if (kont.length) { const g = W.svg('g', { class: 'm-kontury' }, svg); for (const k of kont) for (const l of k.linie) if (l.length > 3) W.svg('path', { d: sc(l), class: 'm-kontur' + (o.kontury.gruby && k.poziom % o.kontury.gruby === 0 ? ' gruby' : '') }, g); }
      W.svg('path', { d: sc(M.rzeka), class: 'm-rzeka', 'stroke-width': Math.max(5, 0.5 * rzut.s) }, svg);
      W.svg('path', { d: sc(M.jeziorka), class: 'm-doplyw' }, svg);
      const gd = W.svg('g', { class: 'm-drogi' }, svg);
      for (const d of M.drogi) W.svg('path', { d: sc(d.pts), class: 'm-droga' + (d.rodzaj === 'wal' ? ' wal' : '') }, gd);
      if (o.rzeka) {
        const n = M.rzeka.length, a = rzut(M.rzeka[Math.floor(n * 0.3)]), b = rzut(M.rzeka[Math.floor(n * 0.36)]);
        let kat = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; if (kat > 90) kat -= 180; if (kat < -90) kat += 180;
        const px = Math.min(szer - 14, Math.max(14, (a[0] + b[0]) / 2 + 16)), py = (a[1] + b[1]) / 2;
        W.tekst(svg, 0, 0, o.rzeka, { class: 'm-woda', 'text-anchor': 'middle', transform: `translate(${px.toFixed(1)},${py.toFixed(1)}) rotate(${kat.toFixed(1)})` });
      }
      if (o.miejsca) for (const m of M.miejsca) {
        if (m.dom) continue;
        const q = rzut([m.x, m.y]); if (q[0] < 24 || q[0] > szer - 24 || q[1] < 24 || q[1] > wys - 18) continue;
        W.svg('circle', { cx: q[0], cy: q[1], r: m.typ === 'miasto' ? 2.6 : 1.8, class: 'm-kropka-miejsca' }, svg);
        W.tekst(svg, q[0] + 6, q[1] - 5, m.nazwa, { class: 'm-miejsce ' + m.typ });
      }
      if (o.krzyz) { kh = W.svg('line', { x1: 0, x2: szer, class: 'm-krzyz', style: 'opacity:0' }, svg); kv = W.svg('line', { y1: 0, y2: wys, class: 'm-krzyz', style: 'opacity:0' }, svg); }
      if (o.poswiata) W.svg('path', { d: sc(trasa), class: 'm-poswiata' }, svg);
      for (const s of o.segmenty || []) W.svg('path', { d: sc(trasa.slice(Math.round(s.od * 10), Math.round(s.do * 10) + 1)), class: 'm-seg' }, svg);
      W.svg('path', { d: sc(trasa), class: 'm-trasa' }, svg);
      if (o.przejechana !== false) przejechana = W.svg('path', { d: '', class: 'm-przejechana' }, svg);
      if (o.km) for (let k = o.km; k < trasa.length / 10 - 3; k += o.km) {
        const q = rzut(trasa[k * 10]); const g = W.svg('g', { class: 'm-km', transform: `translate(${q[0].toFixed(1)},${q[1].toFixed(1)})` }, svg);
        if (o.kmStyl === 'kropka') { W.svg('circle', { r: 2.6 }, g); W.tekst(g, 6, -6, String(k), {}); }
        else { W.svg('rect', { x: -9, y: -7, width: 18, height: 14, rx: o.kmPromien ?? 2 }, g); W.tekst(g, 0, 3.2, String(k), { 'text-anchor': 'middle' }); }
      }
      const st = rzut(trasa[0]); const gs = W.svg('g', { class: 'm-start', transform: `translate(${st[0].toFixed(1)},${st[1].toFixed(1)})` }, svg);
      W.svg('circle', { r: 5.5 }, gs);
      if (o.etykietaStartu) W.tekst(gs, 10, -8, o.etykietaStartu, {});
      if (o.skalaKm) {
        const L = o.skalaKm * rzut.s, sx = 14, sy = wys - 16, g = W.svg('g', { class: 'm-skala' }, svg);
        W.svg('line', { x1: sx, x2: sx + L, y1: sy, y2: sy }, g); W.svg('line', { x1: sx, x2: sx, y1: sy - 4, y2: sy + 1 }, g); W.svg('line', { x1: sx + L, x2: sx + L, y1: sy - 4, y2: sy + 1 }, g);
        W.tekst(g, sx + L + 7, sy + 3, o.skalaKm + ' km', {});
      }
      if (o.polnoc) { const g = W.svg('g', { class: 'm-polnoc', transform: `translate(${szer - 20},${22})` }, svg); W.svg('path', { d: 'M0,-10 L4,2 L0,-1 L-4,2 Z' }, g); W.tekst(g, 0, 14, 'N', { 'text-anchor': 'middle' }); }
      kursor = W.svg('g', { class: 'm-kursor', style: 'opacity:0' }, svg);
      W.svg('circle', { r: o.promienKursora * 2, class: 'r2' }, kursor); W.svg('circle', { r: o.promienKursora, class: 'r1' }, kursor);
      if (o.onHover) {
        svg.addEventListener('pointermove', (e) => {
          const r = svg.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
          let best = -1, bd = 26 * 26;
          for (let i = 0; i < trasa.length; i += 2) { const q = rzut(trasa[i]); const d = (q[0] - px) ** 2 + (q[1] - py) ** 2; if (d < bd) { bd = d; best = i; } }
          o.onHover(best);
        });
        svg.addEventListener('pointerleave', () => o.onHover(-1));
      }
      if (o.poRysowaniu) o.poRysowaniu({ svg, rzut, szer, wys });
    });
    return api;
  };

  global.W = W;
})(window);
