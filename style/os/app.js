/* Oś — cały sezon w poziomie: tydzień to kolumna, pod spodem ścieżki faz, kilometrów, formy, świeżości i wydarzeń. */
(function () {
  'use strict';
  const K = K2, f = K.fmt, h = W.h, ik = A.ik;
  const dzien = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const ost = K.dni[K.dni.length - 1];
  const TYG = K.tygodnie.map((t, i) => {
    const kon = t.biezacy ? ost : S.dzien(dzien(t.od, 6)) || ost;
    return Object.assign({}, t, { i, do: dzien(t.od, 6), ctl: kon.ctl, atl: kon.atl, tsb: kon.ctl - kon.atl });
  });
  const N = TYG.length;
  const wTyg = (d) => TYG.findIndex((t) => d >= t.od && d < dzien(t.od, 7));

  // fazy sezonu z nachylenia formy (3 tygodnie)
  const NF = { bud: 'Forma rośnie', utr: 'Forma stabilna', roz: 'Forma spada' };
  let fazy = [];
  TYG.forEach((t, i) => { const s = i < 3 ? 0 : (t.ctl - TYG[i - 3].ctl) / 3, k = s > 0.9 ? 'bud' : s < -0.9 ? 'roz' : 'utr'; const p = fazy[fazy.length - 1]; if (p && p.k === k) p.do = i; else fazy.push({ k, od: i, do: i }); });
  for (let r = 0; r < 3; r++) { const out = []; for (const x of fazy) { const p = out[out.length - 1]; if (p && (x.do - x.od < 2 || p.k === x.k)) p.do = x.do; else out.push(Object.assign({}, x)); } fazy = out; }
  fazy.forEach((x) => { const a = TYG[x.od], b = TYG[x.do]; x.km = TYG.slice(x.od, x.do + 1).reduce((s, t) => s + t.km, 0); x.dCtl = b.ctl - (x.od ? TYG[x.od - 1].ctl : a.ctl); x.tyg = x.do - x.od + 1; });

  // wydarzenia
  const rekordyT = K.rekordy.map((r) => ({ r, i: wTyg(r.data) })).filter((x) => x.i >= 0);
  const prT = Array.from({ length: N }, () => []);
  K.segmenty.forEach((s) => { const i = wTyg(s.prData); if (i >= 0) prT[i].push(s); });

  let wybrany = N - 1;
  let osApi = null;

  // ───── oś sezonu ─────
  function os(host, naWybor) {
    const tip = W.tooltip(host);
    const LAN = [{ k: 'fazy', n: 'Faza', hh: 26 }, { k: 'km', n: 'Kilometry', u: 'tygodniowo', hh: 128 }, { k: 'forma', n: 'Forma', u: 'CTL i ATL', hh: 92 }, { k: 'tsb', n: 'Świeżość', u: 'TSB', hh: 46 }, { k: 'zd', n: 'Wydarzenia', u: 'rekordy i PR', hh: 30 }];
    let svg = null, kol = null, sel = null, geo = null;
    const api = {
      wybierz(i) { wybrany = Math.max(0, Math.min(N - 1, i)); if (sel && geo) { sel.setAttribute('x', geo.x(wybrany) + 1); } naWybor(wybrany); },
    };
    W.rozmiar(host, (szer) => {
      if (svg) svg.remove();
      const L = 112, R = 8, T = 24, GAP = 10;
      const H = T + LAN.reduce((a, l) => a + l.hh + GAP, 0) + 4;
      const p = (szer - L - R) / N, x = (i) => L + i * p, w = Math.max(4, Math.min(22, p - 4));
      geo = { x, p };
      svg = W.svg('svg', { width: szer, height: H, class: 'os-svg', role: 'img', tabindex: 0, 'aria-label': 'Oś sezonu: 53 tygodnie. Strzałki zmieniają tydzień, Enter go otwiera.' }); host.prepend(svg);
      // miesiące
      let m = -1;
      TYG.forEach((t, i) => { const d = dzien(t.od, 3); if (d.getMonth() !== m) { m = d.getMonth(); W.svg('line', { x1: x(i), x2: x(i), y1: T - 6, y2: H - 4, class: 'os-mies-l' }, svg); W.tekst(svg, x(i) + 5, 13, f.miesiacKr(m) + (m === 0 ? ' ’' + String(d.getFullYear()).slice(2) : ''), { class: 'os-mies' }); } });
      // kolumna wybrana i podświetlana
      kol = W.svg('rect', { x: 0, y: T - 4, width: p, height: H - T, rx: 6, class: 'os-kol', style: 'opacity:0' }, svg);
      sel = W.svg('rect', { x: x(wybrany) + 1, y: T - 4, width: p - 2, height: H - T, rx: 6, class: 'os-sel' }, svg);
      let y0 = T;
      const maxKm = W.ladnyMax(Math.max(...TYG.map((t) => t.km)), 4), maxCtl = Math.max(...TYG.map((t) => Math.max(t.ctl, t.atl))) * 1.08, maxTsb = Math.max(20, ...TYG.map((t) => Math.abs(t.tsb)));
      for (const l of LAN) {
        W.tekst(svg, 0, y0 + 14, l.n, { class: 'os-lan-n' }); if (l.u) W.tekst(svg, 0, y0 + 28, l.u, { class: 'os-lan-u' });
        if (l.k === 'fazy') fazy.forEach((fz) => { const a = x(fz.od) + 1, b = x(fz.do + 1) - 1; W.svg('rect', { x: a, y: y0, width: b - a, height: l.hh, rx: 7, class: 'os-faza ' + fz.k }, svg); if (b - a > 92) W.tekst(svg, a + 9, y0 + 17, NF[fz.k], { class: 'os-faza-t ' + fz.k }); });
        if (l.k === 'km') {
          const y = W.skala(0, maxKm, y0 + l.hh, y0);
          [maxKm / 2, maxKm].forEach((v) => { W.svg('line', { x1: L, x2: szer - R, y1: y(v), y2: y(v), class: 'os-siatka' }, svg); W.tekst(svg, L - 8, y(v) + 4, f.liczba(v), { class: 'os-os-t', 'text-anchor': 'end' }); });
          W.svg('line', { x1: L, x2: szer - R, y1: y(0), y2: y(0), class: 'os-baza' }, svg);
          TYG.forEach((t, i) => { const cx = x(i) + (p - w) / 2; let b = y(0); [[t.kmSzosa, 'cz-szosa'], [t.kmZwift, 'cz-zwift']].filter((c) => c[0] > 0).forEach(([v, k], j, arr) => { const hp = y(0) - y(v), g = j ? 2 : 0; const d = W.slupek(cx, b - hp, w, hp - g, j === arr.length - 1 ? 3 : 0); if (d) W.svg('path', { d, class: 'os-sl ' + k }, svg); b -= hp; }); });
        }
        if (l.k === 'forma') {
          const y = W.skala(0, maxCtl, y0 + l.hh, y0);
          W.svg('line', { x1: L, x2: szer - R, y1: y(0), y2: y(0), class: 'os-baza' }, svg);
          W.tekst(svg, L - 8, y(maxCtl / 1.08) + 4, f.liczba(maxCtl / 1.08), { class: 'os-os-t', 'text-anchor': 'end' });
          const cx = (i) => x(i) + p / 2;
          W.svg('path', { d: W.obszar(TYG.map((t, i) => [cx(i), y(t.ctl)]), y(0), 'gladka'), class: 'os-ctl-o' }, svg);
          W.svg('path', { d: W.sciezka(TYG.map((t, i) => [cx(i), y(t.atl)]), 'gladka'), class: 'os-atl' }, svg);
          W.svg('path', { d: W.sciezka(TYG.map((t, i) => [cx(i), y(t.ctl)]), 'gladka'), class: 'os-ctl' }, svg);
          W.svg('circle', { cx: cx(N - 1), cy: y(TYG[N - 1].ctl), r: 4, class: 'os-ctl-k' }, svg);
        }
        if (l.k === 'tsb') {
          const y = W.skala(-maxTsb, maxTsb, y0 + l.hh, y0);
          W.svg('line', { x1: L, x2: szer - R, y1: y(0), y2: y(0), class: 'os-baza' }, svg);
          TYG.forEach((t, i) => { const cx = x(i) + (p - w) / 2, v = t.tsb; const d = v >= 0 ? W.slupek(cx, y(v), w, y(0) - y(v), 2) : W.slupek(cx, y(0), w, y(v) - y(0), 2, true); if (d) W.svg('path', { d, class: 'os-tsb ' + (v >= 0 ? 'plus' : 'minus') }, svg); });
        }
        if (l.k === 'zd') {
          const cy = y0 + l.hh / 2;
          W.svg('line', { x1: L, x2: szer - R, y1: cy, y2: cy, class: 'os-siatka' }, svg);
          prT.forEach((lst, i) => { if (!lst.length) return; W.svg('circle', { cx: x(i) + p / 2, cy, r: Math.min(7, 3 + lst.length), class: 'os-pr' }, svg); });
          rekordyT.forEach(({ i }) => { const cx = x(i) + p / 2; W.svg('path', { d: `M${cx},${cy - 8}L${cx + 7},${cy}L${cx},${cy + 8}L${cx - 7},${cy}Z`, class: 'os-rek' }, svg); });
        }
        y0 += l.hh + GAP;
      }
      W.tekst(svg, x(N - 1) + p / 2, T - 8, 'teraz', { class: 'os-teraz', 'text-anchor': 'middle' });
      // trafienia
      const hit = W.svg('rect', { x: L, y: 0, width: szer - L - R, height: H, fill: 'transparent', style: 'cursor:pointer' }, svg);
      const ind = (e) => Math.max(0, Math.min(N - 1, Math.floor((e.clientX - svg.getBoundingClientRect().left - L) / p)));
      const pokaz = (i) => {
        const t = TYG[i]; kol.setAttribute('x', x(i)); kol.style.opacity = 1;
        const fz = fazy.find((q) => i >= q.od && i <= q.do), rk = rekordyT.filter((q) => q.i === i);
        tip.pokaz(x(i) + p / 2, T + 30, [W.naglowekTip(`${f.dataKrotka(t.od)} – ${f.dataKrotka(t.do)}${t.biezacy ? ' · ten tydzień' : ''}`), W.wierszTip(`${f.liczba(t.km)} km`, `${t.jazdy} ${A.odm(t.jazdy, 'jazda', 'jazdy', 'jazd')}`, 's-szosa'), W.wierszTip(f.czasHM(t.czas), 'czas'), W.wierszTip(f.liczba(t.ctl), 'forma na koniec', 's-a'), W.wierszTip(f.znak(Math.round(t.tsb)), 'świeżość'), W.wierszTip(NF[fz.k], 'faza'), ...rk.map((q) => W.wierszTip('rekord', q.r.nazwa.toLowerCase())), prT[i].length ? W.wierszTip(String(prT[i].length), A.odm(prT[i].length, 'rekord segmentu', 'rekordy segmentów', 'rekordów segmentów')) : null].filter(Boolean));
      };
      hit.addEventListener('pointermove', (e) => pokaz(ind(e)));
      hit.addEventListener('pointerleave', () => { kol.style.opacity = 0; tip.ukryj(); });
      hit.addEventListener('click', (e) => api.wybierz(ind(e)));
      svg.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); api.wybierz(wybrany + (e.key === 'ArrowRight' ? 1 : -1)); pokaz(wybrany); } if (e.key === 'Escape') { kol.style.opacity = 0; tip.ukryj(); } });
      svg.addEventListener('blur', () => { kol.style.opacity = 0; tip.ukryj(); });
    });
    return api;
  }

  // ───── wybrany tydzień ─────
  function szczegoly(host, i) {
    const t = TYG[i], rank = TYG.slice().sort((a, b) => b.km - a.km).findIndex((q) => q.i === i) + 1;
    const aktywne = TYG.filter((q) => q.km > 0), srednia = aktywne.reduce((a, q) => a + q.km, 0) / aktywne.length;
    const fz = fazy.find((q) => i >= q.od && i <= q.do);
    const bp = h('button', { class: 's-btn ikona', type: 'button', 'aria-label': 'Poprzedni tydzień' }, ik('caret-left', 'bold')), bn = h('button', { class: 's-btn ikona', type: 'button', 'aria-label': 'Następny tydzień' }, ik('caret-right', 'bold'));
    bp.disabled = i === 0; bn.disabled = i === N - 1;
    bp.addEventListener('click', () => osApi.wybierz(i - 1)); bn.addEventListener('click', () => osApi.wybierz(i + 1));
    const tyd = h('div'); S.tydzien(tyd, t.od);
    host.replaceChildren(
      S.karta(null, { klasa: 's-c12 os-tyd' },
        h('div', { class: 'os-tyd-g' },
          h('div', null, h('p', { class: 'os-tyd-e', text: t.biezacy ? 'Wybrany tydzień · bieżący' : `Wybrany tydzień · ${N - 1 - i} ${A.odm(N - 1 - i, 'tydzień', 'tygodnie', 'tygodni')} temu` }), h('h2', { text: `${f.dataKrotka(t.od)} – ${f.dataKrotka(t.do)} ${t.do.getFullYear()}` })),
          h('dl', { class: 'os-tyd-st' },
            h('div', null, h('dt', { text: 'Dystans' }), h('dd', null, f.liczba(t.km), h('small', { text: ' km' }))),
            h('div', null, h('dt', { text: 'Czas' }), h('dd', { text: f.czasHM(t.czas).replace(' min', '') })),
            h('div', null, h('dt', { text: 'Obciążenie' }), h('dd', { text: f.liczba(t.obciazenie) })),
            h('div', null, h('dt', { text: 'Forma na koniec' }), h('dd', { text: f.liczba(t.ctl) })),
            h('div', null, h('dt', { text: 'Miejsce w sezonie' }), h('dd', null, t.km ? `${rank}.` : '—', h('small', { text: ` z ${N}` })))),
          h('div', { class: 's-akcje' }, bp, bn)),
        h('p', { class: 'os-tyd-o' }, t.km ? `${t.km >= srednia ? 'Powyżej' : 'Poniżej'} średniej sezonu (${f.liczba(srednia)} km). Faza sezonu: ${NF[fz.k].toLowerCase()}.` : 'Tydzień bez jazdy.', prT[i].length ? ` ${prT[i].length} ${A.odm(prT[i].length, 'rekord', 'rekordy', 'rekordów')} na segmentach: ${prT[i].map((s) => s.nazwa).join(', ')}.` : ''),
        tyd));
    W.typografia(host);
  }

  function sezon(host) {
    const C = K.cel, T = K.okresy.tydzien;
    host.append(h('header', { class: 'os-intro' },
      h('div', null, h('p', { class: 'os-intro-e', text: `Sezon ${f.dataKrotka(TYG[0].od)} ${TYG[0].od.getFullYear()} – ${f.dataKrotka(K.dzis)} ${K.dzis.getFullYear()}` }), h('h1', { text: 'Rok jazdy na jednej osi' }), h('p', { class: 'os-intro-o', text: 'Każda kolumna to tydzień. Najedź, żeby zobaczyć szczegóły, kliknij, żeby otworzyć tydzień poniżej. Fazy wyliczamy z tego, jak zmieniała się forma.' })),
      h('dl', { class: 'os-intro-st' },
        h('div', null, h('dt', { text: '53 tygodnie' }), h('dd', null, f.liczba(TYG.reduce((a, t) => a + t.km, 0)), h('small', { text: ' km' }))),
        h('div', null, h('dt', { text: 'Forma teraz' }), h('dd', null, f.liczba(K.forma.ctl), h('small', { text: ` ${f.znak(Math.round(K.forma.zmiana7))} w 7 dni` }))),
        h('div', null, h('dt', { text: `Cel ${C.rok}` }), h('dd', null, f.procent(C.udzial), h('small', { text: ` z ${f.liczba(C.km)} km` }))),
        h('div', null, h('dt', { text: 'Seria' }), h('dd', null, String(A.seria.tygodnie), h('small', { text: ' tyg. z jazdą' }))))));
    const osHost = h('div', { class: 'os-os' });
    const leg = S.legenda([['var(--s-szosa)', 'Szosa'], ['var(--s-zwift)', 'Zwift'], ['var(--s-akcent)', 'Forma (CTL)', 1], ['var(--s-tekst-3)', 'Zmęczenie (ATL)', 1]]);
    leg.append(h('span', null, h('i', { class: 'os-leg-rek' }), 'rekord'), h('span', null, h('i', { class: 'os-leg-pr' }), 'rekord segmentu'));
    host.append(S.karta(null, { klasa: 'os-karta-os' }, h('div', { class: 'os-os-nag' }, leg, h('span', { class: 'os-os-pod', text: 'strzałki ← → zmieniają tydzień' })), h('div', { class: 'os-przewin' }, osHost)));
    const det = h('div', { class: 's-siatka', style: { marginTop: '18px' } }); host.append(det);
    const dol = h('div', { class: 's-siatka', style: { marginTop: '18px' } }); host.append(dol);
    osApi = os(osHost, (i) => szczegoly(det, i));
    szczegoly(det, wybrany);
    // fazy i najlepsze tygodnie
    const top = TYG.slice().sort((a, b) => b.km - a.km).slice(0, 6);
    const maxT = top[0].km;
    dol.append(
      S.karta('Fazy sezonu', { klasa: 's-c7', opis: 'Liczone z trzech tygodni: rośnie lub spada, gdy forma zmienia się o ponad 1 pkt tygodniowo. Kliknij, żeby przejść do początku fazy.' },
        h('ol', { class: 'os-fazy' }, fazy.slice().reverse().map((fz) => S.klik(h('li', { class: fz.k, tabindex: 0, role: 'button' },
          h('span', { class: 'os-fazy-k' }), h('div', null, h('b', { text: NF[fz.k] }), h('small', { text: `${f.dataKrotka(TYG[fz.od].od)} – ${f.dataKrotka(TYG[fz.do].do)} · ${fz.tyg} ${A.odm(fz.tyg, 'tydzień', 'tygodnie', 'tygodni')}` })),
          h('span', { class: 'os-fazy-v' }, h('b', { text: `${f.liczba(fz.km)} km` }), h('small', { text: `forma ${f.znak(Math.round(fz.dCtl))}` }))), () => osApi.wybierz(fz.od))))),
      S.karta('Najmocniejsze tygodnie', { klasa: 's-c5', opis: 'Kliknij, żeby otworzyć tydzień.' },
        h('ol', { class: 'os-top' }, top.map((t, k) => S.klik(h('li', { tabindex: 0, role: 'button' }, h('span', { class: 'os-top-n', text: String(k + 1) }), h('div', null, h('div', { class: 'os-top-g' }, h('b', { text: `${f.dataKrotka(t.od)} – ${f.dataKrotka(t.do)}` }), h('span', { text: `${f.liczba(t.km)} km` })), h('div', { class: 'os-top-t' }, h('i', { style: { width: (t.km / maxT * 100).toFixed(1) + '%' } })))), () => osApi.wybierz(t.i))))));
  }

  const widoki = S.widoki();
  widoki.pulpit = sezon;
  S.router({
    kontener: document.getElementById('tresc'), widoki, domyslny: 'pulpit', tytul: 'Oś sezonu',
    tytuly: { pulpit: 'Sezon', kalendarz: 'Kalendarz', jazdy: 'Jazdy', postepy: 'Postępy', analiza: 'Analiza jazdy' },
    poZmianie(id) { document.body.dataset.widok = id; },
  });
})();
