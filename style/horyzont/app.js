/* Horyzont — panorama Mazowsza, w której linia wzgórz to profil Twojej ostatniej jazdy. */
(function () {
  'use strict';
  const K = K2, f = K.fmt, h = W.h, ik = A.ik;
  const P = K.ostatnia.probki, J = K.ostatnia.jazda, F = K.forma, T = K.okresy.tydzien;

  // ───── panorama ─────
  function los(seed) { return () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const NIEBO = {
    swit: { g: ['#D9E2F2', '#EBE4EC', '#FAE0CC'], s: [360, 262], kol: '#FFE6C9', blask: '#FFD0A3' },
    dzien: { g: ['#C9DDF2', '#DCE9F5', '#EEF3F6'], s: [1210, 120], kol: '#FFF8E6', blask: '#FFF0CC' },
    zmierzch: { g: ['#D2D9EC', '#E9DCE1', '#F9D6BC'], s: [1240, 236], kol: '#FFDDB5', blask: '#FFC48F' },
    noc: { g: ['#C6CCE2', '#D5D6E8', '#E5E0EC'], s: [1190, 104], kol: '#FAF7EE', blask: '#E8E6F4', ksiezyc: true },
  };
  function pejzaz(svg) {
    const s = (tag, a, p) => W.svg(tag, a, p || svg);
    const pora = NIEBO[A.poraDnia()] || NIEBO.dzien, r = los(7);
    const defs = s('defs');
    const lg = s('linearGradient', { id: 'hz-niebo', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    pora.g.forEach((c, i) => s('stop', { offset: [0, 0.55, 1][i], 'stop-color': c }, lg));
    const rg = s('radialGradient', { id: 'hz-blask' }, defs);
    s('stop', { offset: 0, 'stop-color': pora.blask, 'stop-opacity': 0.75 }, rg); s('stop', { offset: 1, 'stop-color': pora.blask, 'stop-opacity': 0 }, rg);
    const ziemia = s('linearGradient', { id: 'hz-ziemia', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    s('stop', { offset: 0, 'stop-color': '#E3E8DC' }, ziemia); s('stop', { offset: 1, 'stop-color': '#F4F3EF' }, ziemia);
    s('rect', { x: 0, y: 0, width: 1600, height: 400, fill: 'url(#hz-niebo)' });
    const [sx, sy] = pora.s;
    s('circle', { cx: sx, cy: sy, r: 150, fill: 'url(#hz-blask)' });
    s('circle', { cx: sx, cy: sy, r: 34, fill: pora.kol });
    if (pora.ksiezyc) { s('circle', { cx: sx + 13, cy: sy - 8, r: 30, fill: pora.g[0] }); for (let k = 0; k < 26; k++) s('circle', { cx: r() * 1600, cy: 20 + r() * 150, r: 0.6 + r() * 0.9, fill: '#fff', opacity: 0.5 + r() * 0.4 }); }
    // chmury: kilka płaskich pasm, bardzo spokojnie
    for (const [cx, cy, w] of [[260, 96, 210], [690, 64, 150], [1030, 128, 250], [1450, 70, 170]]) {
      const g = s('g', { opacity: 0.55 });
      s('rect', { x: cx - w / 2, y: cy, width: w, height: 12, rx: 6, fill: '#fff' }, g);
      s('rect', { x: cx - w / 2 + w * 0.18, y: cy - 9, width: w * 0.46, height: 12, rx: 6, fill: '#fff' }, g);
    }
    // krajobraz w grupie: na podstronach zsuwa się niżej, żeby zrobić miejsce na tytuł
    const lad = s('g', { class: 'hz-lad' }), L = (tag, a, p) => W.svg(tag, a, p || lad);
    // daleka mgiełka
    const pts = []; for (let x = 0; x <= 1600; x += 16) pts.push([x, 262 + 12 * Math.sin(x / 170 + 1) + 7 * Math.sin(x / 63 + 2) + 4 * Math.sin(x / 29)]);
    L('path', { d: W.sciezka(pts, 'gladka') + 'L1600,400L0,400Z', fill: '#CDD6E4', opacity: 0.75 });
    // profil ostatniej jazdy jako pasmo wzgórz
    const n = P.ele.length, okno = 12, gl = P.ele.map((_, i) => { let a = 0, c = 0; for (let k = -okno; k <= okno; k++) { const v = P.ele[i + k]; if (v != null) { a += v; c++; } } return a / c; });
    const mn = Math.min(...gl), mx = Math.max(...gl), baza = 300, amp = 104;
    const prof = gl.map((e, i) => [i / (n - 1) * 1600, baza - (e - mn) / (mx - mn) * amp]).filter((_, i) => i % 3 === 0 || i === n - 1);
    L('path', { d: W.sciezka(prof, 'gladka') + 'L1600,400L0,400Z', fill: '#B7C5D7' });
    L('path', { d: W.sciezka(prof, 'gladka'), fill: 'none', stroke: '#FC6B1E', 'stroke-width': 1.6, 'stroke-opacity': 0.7, 'stroke-linejoin': 'round' });
    const iMax = gl.indexOf(mx), px = iMax / (n - 1) * 1600, py = baza - amp;
    L('circle', { cx: px, cy: py, r: 7, fill: '#FC6B1E', opacity: 0.18 });
    L('circle', { cx: px, cy: py, r: 3.2, fill: '#fff', stroke: '#FC6B1E', 'stroke-width': 1.8 });
    // łąka, topole i drzewa
    const gr = (x) => 306 + 3 * Math.sin(x / 90) + 2 * Math.sin(x / 37);
    const lp = []; for (let x = 0; x <= 1600; x += 20) lp.push([x, gr(x)]);
    L('path', { d: W.sciezka(lp, 'gladka') + 'L1600,400L0,400Z', fill: '#D9E1D3' });
    const KOL = ['#8DA592', '#7E9888', '#97AE9A', '#86A08D'];
    const drz = L('g');
    for (let x = -10; x < 1610; x += 7 + r() * 16) {
      const gest = Math.sin(x / 150) + 0.6 * Math.sin(x / 47 + 1.3);
      if (gest < -0.35 || r() < 0.18) continue;
      const y = gr(x) + 1, kol = KOL[Math.floor(r() * KOL.length)];
      if (r() < 0.55) { const ry = 13 + r() * 17, rx = 3.4 + r() * 2.4; L('ellipse', { cx: x, cy: y - ry, rx, ry, fill: kol }, drz); }
      else { const rr = 7 + r() * 6; L('circle', { cx: x, cy: y - rr + 2, r: rr, fill: kol }, drz); }
    }
    // Wisła
    const g1 = [], g2 = []; for (let x = 0; x <= 1600; x += 20) { const t = 330 + 6 * Math.sin(x / 210 + 0.5); g1.push([x, t]); g2.push([x, t + 13 + 4 * Math.sin(x / 120)]); }
    L('path', { d: W.sciezka(g1, 'gladka') + 'L' + g2.slice().reverse().map((p) => p.join(',')).join('L') + 'Z', fill: '#D2E2EF' });
    L('path', { d: W.sciezka(g1.map(([x, y]) => [x, y + 4]), 'gladka'), fill: 'none', stroke: '#E7F0F7', 'stroke-width': 1.4 });
    // pierwszy plan łagodnie w tło strony
    const pp = g2.map(([x, y]) => [x, y + 3]);
    L('path', { d: W.sciezka(pp, 'gladka') + 'L1600,400L0,400Z', fill: 'url(#hz-ziemia)' });
    return { mx, km: P.d[iMax] };
  }
  const szczyt = pejzaz(document.querySelector('.hz-pejzaz'));
  document.querySelector('.hz-podpis').append(ik('mountains', 'fill'), h('span', null, 'Na horyzoncie profil Twojej ostatniej jazdy: ', h('b', { text: `${f.km(J.km)} km` }), `, najwyżej ${f.liczba(szczyt.mx)} m n.p.m. na ${f.liczba(szczyt.km)}. kilometrze`));

  // ───── powitanie w panoramie ─────
  function powitanie() {
    const jutro = A.propozycja;
    return h('div', { class: 'hz-pow' },
      h('div', { class: 'hz-pow-l' },
        h('p', { class: 'hz-pow-d', text: `${A.wielka(f.dzienTyg(K.dzis))}, ${f.data(K.dzis)}` }),
        h('h1', { text: `${A.powitanie()}, ${A.imie}` }),
        h('p', { class: 'hz-pow-o' }, A.dzisZaliczone ? `Dziś ${f.km(J.km)} km przez Gassy i wał. ` : '', `${F.nazwa}: ${F.opis.charAt(0).toLowerCase() + F.opis.slice(1)}`),
        h('ul', { class: 'hz-chipy' },
          h('li', null, ik('trend-up', 'bold'), 'Forma ', h('b', { text: f.liczba(F.ctl) }), h('small', { text: `${f.znak(Math.round(F.zmiana7))} w 7 dni` })),
          h('li', null, ik('battery-medium', 'bold'), 'Świeżość ', h('b', { text: f.znak(Math.round(F.tsb)) })),
          h('li', null, ik('flame', 'bold'), 'Seria ', h('b', { text: `${A.seria.tygodnie} tyg.` })),
          h('li', null, ik('path', 'bold'), 'Tydzień ', h('b', { text: `${f.liczba(T.km)} km` })))),
      h('a', { class: 'hz-nast', href: '#kalendarz' },
        h('span', { class: 'hz-nast-e', text: 'Następny trening · jutro' }),
        h('span', { class: 'hz-nast-t' }, h('span', { class: 'hz-nast-i' }, ik(jutro.ikona, 'bold')), h('span', null, h('b', { text: jutro.tytul }), h('small', { text: `${jutro.czas} · ${jutro.strefa}` }))),
        S.profilTreningu(null, { os: false })));
  }

  // ───── pulpit ─────
  function kartaOstatnia() {
    const j = J, os = A.osiagniecia(j).filter((x) => x.typ !== 'zwykly').slice(0, 3);
    const mapa = h('div', { class: 's-mapa hz-mapa' });
    const st = [['Dystans', f.km(j.km), 'km'], ['Czas', f.czas(j.czas), ''], ['Średnia', f.liczba(j.predkosc, 1), 'km/h'], ['Tętno śr.', String(j.tetno), 'bpm'], ['W górę', f.liczba(j.przewyzszenie), 'm'], ['Obciążenie', String(j.obciazenie), 'pkt']];
    const prawa = h('div', { class: 'hz-ost-p' },
      h('div', { class: 'hz-ost-meta' }, h('span', { class: 's-chip szosa', text: 'Szosa' }), `${A.wielka(f.dzienTyg(j.data))}, ${f.dataKrotka(j.data)} · start ${f.godzina(j.data)}`),
      h('h3', { class: 'hz-ost-t', text: j.nazwa }),
      h('dl', { class: 'hz-ost-st' }, st.map(([l, v, u]) => h('div', null, h('dt', { text: l }), h('dd', null, v, u ? h('small', { text: u }) : '')))),
      os.length ? h('ul', { class: 'hz-ost-os' }, os.map((x) => h('li', { class: x.typ }, ik(x.typ === 'pr' ? 'trophy' : 'star', 'fill'), h('span', null, h('b', { text: x.s.nazwa }), h('small', { text: x.typ === 'pr' ? 'nowy rekord' : `blisko rekordu (${f.tempoSeg(x.s.pr)})` })), h('em', { text: f.tempoSeg(x.czas) })))) : null,
      h('div', { class: 's-akcje' }, h('a', { class: 's-btn glowny', href: '#analiza/' + j.id }, 'Analiza jazdy', ik('arrow-right', 'bold')), h('a', { class: 's-btn', href: '#jazdy' }, 'Wszystkie jazdy')));
    const k = S.karta('Ostatnia jazda', { klasa: 's-c8 hz-ost', ikona: 'bicycle' }, h('div', { class: 'hz-ost-w' }, mapa, prawa));
    requestAnimationFrame(() => W.mapaTrasy(mapa, { mapa: K.mapa, trasa: P.x.map((x, i) => [x, P.y[i]]), segmenty: P.segmenty, km: 10, etykietaStartu: 'Start · meta', pad: 20, margines: 1.1, poswiata: true, skalaKm: 2, opis: 'Mapa ostatniej jazdy' }));
    return k;
  }
  function kartaJutro() {
    const p = A.propozycja, g = A.gotowosc;
    const ring = h('div', { class: 'hz-ring' }, A.pierscienie([{ udzial: g / 100 }], { rozmiar: 104, grubosc: 10 }), h('div', { class: 'hz-ring-t' }, h('b', { text: String(g) }), h('small', { text: 'na 100' })));
    const jutro = new Date(K.dzis.getFullYear(), K.dzis.getMonth(), K.dzis.getDate() + 1);
    return S.karta('Gotowość i plan', { klasa: 's-c4 hz-jutro', ikona: 'gauge' },
      h('div', { class: 'hz-got' }, ring, h('div', null, h('b', { text: F.nazwa }), h('p', { text: `Świeżość ${f.znak(Math.round(F.tsb))}: ${F.opis.charAt(0).toLowerCase() + F.opis.slice(1)}` }))),
      h('div', { class: 'hz-tren' },
        h('div', { class: 'hz-tren-n' }, h('span', { class: 'hz-tren-i' }, ik(p.ikona, 'bold')), h('div', null, h('small', { text: `${A.wielka(f.dzienTyg(jutro))} · plan` }), h('b', { text: p.tytul }), h('em', { text: `${p.czas} · ${p.strefa}` }))),
        S.profilTreningu(),
        h('p', { class: 'hz-tren-o', text: p.opis })));
  }
  function kartaTydzien() {
    const body = h('div'); S.tydzien(body);
    const od = T.od, doo = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 6);
    return S.karta('Ten tydzień', { klasa: 's-c12', ikona: 'calendar-blank', opis: `${f.dataKrotka(od)} – ${f.dataKrotka(doo)} · jazdy i plan dzień po dniu`, akcje: [S.legenda([['var(--s-szosa)', 'Szosa'], ['var(--s-zwift)', 'Zwift'], ['var(--s-linia-2)', 'Plan']]), h('a', { class: 's-btn', href: '#kalendarz' }, 'Kalendarz', ik('arrow-right', 'bold'))] }, body);
  }
  function kartaCele() {
    const p = A.poziom;
    const lista = h('ul', { class: 'hz-cele' }, A.wyzwania.map((w) => h('li', { class: w.zrobione ? 'ok' : '' },
      h('span', { class: 'hz-cel-i' }, ik(w.zrobione ? 'check' : w.ikona, 'bold')),
      h('div', null, h('div', { class: 'hz-cel-g' }, h('b', { text: w.nazwa }), h('span', { text: w.jedn ? `${f.liczba(w.wart)} / ${w.cel} ${w.jedn}` : `${w.wart} / ${w.cel}` })), A.pasek(w.udzial)))));
    return S.karta('Cele tygodnia', { klasa: 's-c5', ikona: 'target', opis: `${A.wyzwania.filter((w) => w.zrobione).length} z ${A.wyzwania.length} zrobione` }, lista,
      h('div', { class: 'hz-poziom' }, h('div', { class: 'hz-poziom-g' }, h('b', { text: `Poziom ${p.nr}` }), h('span', { text: `${f.liczba(p.brakuje)} km do poziomu ${p.nr + 1}` })), A.pasek(p.postep), h('small', { text: `Poziom rośnie z kilometrami: ${f.liczba(p.km)} km od sierpnia 2025.` })));
  }

  const widoki = S.widoki();
  widoki.pulpit = (host) => {
    const s = h('div', { class: 's-siatka' }); host.append(s);
    s.append(kartaOstatnia(), kartaJutro(), kartaTydzien(), S.kartaPmc({ klasa: 's-c7', zakres: 90, wys: 210, opis: 'Ostatnie 90 dni. Forma rośnie, gdy trenujesz regularnie.' }), S.kartaCel({ klasa: 's-c5', wys: 172 }), S.kartaObjetosc({ klasa: 's-c7', wys: 250 }), kartaCele());
  };

  // tytuł podstrony trafia do panoramy
  const tytul = document.querySelector('.hz-tytul');
  S.router({
    kontener: document.getElementById('tresc'), widoki, domyslny: 'pulpit', tytul: 'Kolarstwo',
    tytuly: { pulpit: 'Pulpit', kalendarz: 'Kalendarz', jazdy: 'Jazdy', postepy: 'Postępy', analiza: 'Analiza jazdy' },
    poZmianie(id) {
      document.body.dataset.widok = id;
      const nag = document.querySelector('#tresc .s-widok > .s-nag-str, #tresc .s-widok > .s-an-nag');
      tytul.replaceChildren(id === 'pulpit' ? powitanie() : nag || '');
      W.typografia(tytul);
    },
  });
})();
