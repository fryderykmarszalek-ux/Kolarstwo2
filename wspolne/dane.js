/*
 * Kolarstwo 2 — dane PRZYKŁADOWE.
 * Generowane deterministycznie (stałe ziarno), więc każde odświeżenie daje to samo.
 * Nazwy, długości, nachylenia, rekordy i liczby prób segmentów pochodzą ze starej strony;
 * cała reszta (jazdy, tętno, moc, mapa) jest wymyślona, żeby pokazać wygląd.
 * Mapa jest poglądowa: miejscowości są prawdziwe, ich położenie tylko przybliżone.
 */
(function (global) {
  'use strict';

  // ───────────────────────── losowość z ziarnem ─────────────────────────
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const R = mulberry32(0x4B3207);
  const rnd = (a = 0, b = 1) => a + (b - a) * R();
  const pick = (arr) => arr[Math.floor(R() * arr.length)];
  const gauss = () => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  // ───────────────────────── daty ─────────────────────────
  const D = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min);
  const DZIS = D(2026, 11, 7, 15, 40);
  const START = D(2025, 8, 1);
  const dzien = (d) => D(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const plusDni = (d, n) => D(d.getFullYear(), d.getMonth() + 1, d.getDate() + n, d.getHours(), d.getMinutes());
  const klucz = (d) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const dzienTyg = (d) => (d.getDay() + 6) % 7; // 0 = poniedziałek
  const P = (y, m, d) => new Date(y, m - 1, d); // północ — granice okresów
  const polnoc = (d) => P(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const poczatekTyg = (d) => { const p = polnoc(d); return P(p.getFullYear(), p.getMonth() + 1, p.getDate() - dzienTyg(p)); };
  const roznicaDni = (a, b) => Math.round((dzien(b) - dzien(a)) / 86400000);

  // ───────────────────────── teren ─────────────────────────
  function hash2(i, j) {
    let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) ^ 0x5bd1e995;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function vnoise(x, y) {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    return lerp(lerp(hash2(i, j), hash2(i + 1, j), u), lerp(hash2(i, j + 1), hash2(i + 1, j + 1), u), v);
  }
  function fbm(x, y) { let s = 0, a = 0.5, f = 1; for (let o = 0; o < 4; o++) { s += a * vnoise(x * f, y * f); f *= 2.03; a *= 0.5; } return s / 0.9375; }

  const MAPA = { szer: 36, wys: 26 }; // km; x na wschód, y na południe
  const rzekaX = (y) => 27.2 + 1.7 * Math.sin(y / 4.3 + 0.5) + 0.6 * Math.sin(y / 1.9 + 2.1);
  function wysokosc(x, y) {
    const odRzeki = rzekaX(y) - x;
    const wysoczyzna = smoothstep(1.1, 2.7, odRzeki) * 0.8 + smoothstep(2.7, 7.5, odRzeki) * 0.2;
    const n = fbm(x / 5.4 + 3.1, y / 5.4 + 7.7) - 0.5;
    const n2 = fbm(x / 1.7 + 11.3, y / 1.7 + 2.9) - 0.5;
    return 86.5 + 24 * wysoczyzna + n * (5 + 22 * wysoczyzna) + n2 * 3.2;
  }

  // ───────────────────────── sieć dróg ─────────────────────────
  const MIEJSCA = [
    { nazwa: 'Konstancin-Jeziorna', x: 9.6, y: 11.2, typ: 'miasto', dom: true },
    { nazwa: 'Piaseczno', x: 2.2, y: 9.8, typ: 'miasto' },
    { nazwa: 'Powsin', x: 12.2, y: 2.2, typ: 'wies' },
    { nazwa: 'Habdzin', x: 14.6, y: 8.4, typ: 'wies' },
    { nazwa: 'Bielawa', x: 17.6, y: 4.6, typ: 'wies' },
    { nazwa: 'Okrzeszyn', x: 23.4, y: 4.2, typ: 'wies' },
    { nazwa: 'Ciszyca', x: 23.6, y: 8.2, typ: 'wies' },
    { nazwa: 'Obórki', x: 21.2, y: 10.6, typ: 'wies' },
    { nazwa: 'Obory', x: 18.4, y: 13.2, typ: 'wies' },
    { nazwa: 'Gassy', x: 24.0, y: 15.6, typ: 'wies' },
    { nazwa: 'Lądowisko', x: 21.4, y: 17.0, typ: 'punkt' },
    { nazwa: 'Opacz', x: 23.4, y: 20.4, typ: 'wies' },
    { nazwa: 'Cieciszew', x: 17.2, y: 18.6, typ: 'wies' },
    { nazwa: 'Słomczyn', x: 12.4, y: 16.2, typ: 'wies' },
    { nazwa: 'Kawęczyn', x: 13.2, y: 21.6, typ: 'wies' },
    { nazwa: 'Góra Kalwaria', x: 22.0, y: 24.6, typ: 'miasto' },
  ];

  const wezly = [];
  const KROK = 2.7;
  const siatka = {};
  for (let j = 0; 1 + j * KROK <= MAPA.wys - 0.4; j++) {
    for (let i = 0; 1 + i * KROK <= MAPA.szer; i++) {
      const x = 1 + i * KROK + rnd(-0.7, 0.7), y = 1 + j * KROK + rnd(-0.7, 0.7);
      if (x > rzekaX(y) - 1.4) continue;
      siatka[i + ',' + j] = wezly.length;
      wezly.push({ id: wezly.length, x, y, i, j });
    }
  }
  // miejscowości przyciągają najbliższy węzeł
  for (const m of MIEJSCA) {
    let best = null, bd = Infinity;
    for (const w of wezly) { if (w.miejsce) continue; const d = Math.hypot(w.x - m.x, w.y - m.y); if (d < bd) { bd = d; best = w; } }
    best.x = m.x; best.y = m.y; best.miejsce = m.nazwa; m.wezel = best.id;
  }

  const krawedzie = [];
  const sasiedzi = [];
  function linia(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
    const nx = -dy / L, ny = dx / L;
    const n = Math.max(6, Math.ceil(L / 0.12));
    const a1 = rnd(-0.2, 0.2) * Math.min(L, 3.2), a2 = rnd(-0.08, 0.08) * Math.min(L, 3.2), ph = rnd(0, Math.PI * 2);
    const pts = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n, env = Math.sin(Math.PI * t);
      const off = env * (a1 + a2 * Math.sin(2 * Math.PI * t + ph));
      pts.push([a.x + dx * t + nx * off, a.y + dy * t + ny * off]);
    }
    return pts;
  }
  function dlugosc(pts) { let s = 0; for (let k = 1; k < pts.length; k++) s += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); return s; }
  function dodajKrawedz(ia, ib, rodzaj = 'droga') {
    const a = wezly[ia], b = wezly[ib];
    if (krawedzie.some((e) => (e.a === ia && e.b === ib) || (e.a === ib && e.b === ia))) return;
    const pts = rodzaj === 'wal' ? walLinia(a, b) : linia(a, b);
    const e = { id: krawedzie.length, a: ia, b: ib, pts, dl: dlugosc(pts), rodzaj, uzycia: 0 };
    let up = 0, down = 0, prev = wysokosc(pts[0][0], pts[0][1]);
    for (let k = 1; k < pts.length; k++) { const h = wysokosc(pts[k][0], pts[k][1]); const d = h - prev; if (d > 0) up += d; else down -= d; prev = h; }
    e.wGore = up; e.wDol = down;
    krawedzie.push(e);
    (sasiedzi[ia] = sasiedzi[ia] || []).push({ e: e.id, v: ib });
    (sasiedzi[ib] = sasiedzi[ib] || []).push({ e: e.id, v: ia });
  }
  function walLinia(a, b) {
    const n = Math.max(6, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.12)), pts = [];
    for (let k = 0; k <= n; k++) { const y = lerp(a.y, b.y, k / n); const x = k === 0 ? a.x : k === n ? b.x : rzekaX(y) - 0.7; pts.push([x, y]); }
    return pts;
  }

  for (const w of wezly) {
    const r = siatka[(w.i + 1) + ',' + w.j], d = siatka[w.i + ',' + (w.j + 1)], dg = siatka[(w.i + 1) + ',' + (w.j + 1)], da = siatka[(w.i - 1) + ',' + (w.j + 1)];
    if (r !== undefined && rnd() < 0.84) dodajKrawedz(w.id, r);
    if (d !== undefined && rnd() < 0.8) dodajKrawedz(w.id, d);
    if (dg !== undefined && rnd() < 0.12) dodajKrawedz(w.id, dg);
    if (da !== undefined && rnd() < 0.08) dodajKrawedz(w.id, da);
  }
  // wał wiślany — droga wzdłuż rzeki
  const wal = [];
  for (let y = 2.0; y <= MAPA.wys - 1.5; y += KROK) {
    const id = wezly.length; wezly.push({ id, x: rzekaX(y) - 0.7, y, wal: true }); wal.push(id);
  }
  for (let k = 1; k < wal.length; k++) dodajKrawedz(wal[k - 1], wal[k], 'wal');
  for (const id of wal) {
    const w = wezly[id]; let best = null, bd = Infinity;
    for (const v of wezly) { if (v.wal) continue; const d = Math.hypot(v.x - w.x, v.y - w.y); if (d < bd) { bd = d; best = v; } }
    if (best && bd < 5) dodajKrawedz(id, best.id);
  }
  // spójność: dołącz odcięte kawałki do reszty
  (function spojnosc() {
    const p = wezly.map((_, i) => i);
    const f = (i) => (p[i] === i ? i : (p[i] = f(p[i])));
    for (const e of krawedzie) p[f(e.a)] = f(e.b);
    const dom = f(MIEJSCA[0].wezel);
    for (const w of wezly) {
      if (f(w.id) === dom) continue;
      let best = null, bd = Infinity;
      for (const v of wezly) { if (f(v.id) !== dom) continue; const d = Math.hypot(v.x - w.x, v.y - w.y); if (d < bd) { bd = d; best = v; } }
      dodajKrawedz(w.id, best.id); p[f(w.id)] = f(best.id);
    }
  })();
  for (let i = 0; i < wezly.length; i++) sasiedzi[i] = sasiedzi[i] || [];

  // najkrótsze ścieżki (Floyd–Warshall na długościach) do szybkiego planowania
  const N = wezly.length;
  const odl = Array.from({ length: N }, () => new Float64Array(N).fill(Infinity));
  for (let i = 0; i < N; i++) odl[i][i] = 0;
  for (const e of krawedzie) { odl[e.a][e.b] = Math.min(odl[e.a][e.b], e.dl); odl[e.b][e.a] = odl[e.a][e.b]; }
  for (let k = 0; k < N; k++) for (let i = 0; i < N; i++) { const ik = odl[i][k]; if (ik === Infinity) continue; const ri = odl[i], rk = odl[k]; for (let j = 0; j < N; j++) { const v = ik + rk[j]; if (v < ri[j]) ri[j] = v; } }

  function dijkstra(s, t, waga) {
    const dist = new Float64Array(N).fill(Infinity), prev = new Array(N).fill(null), done = new Uint8Array(N);
    dist[s] = 0;
    for (;;) {
      let u = -1, b = Infinity;
      for (let i = 0; i < N; i++) if (!done[i] && dist[i] < b) { b = dist[i]; u = i; }
      if (u < 0 || u === t) break;
      done[u] = 1;
      for (const nb of sasiedzi[u]) { const nd = dist[u] + waga(nb.e); if (nd < dist[nb.v]) { dist[nb.v] = nd; prev[nb.v] = { u, e: nb.e }; } }
    }
    const kroki = []; let v = t;
    while (v !== s) { const p = prev[v]; if (!p) return []; kroki.unshift({ e: p.e, z: p.u, do: v }); v = p.u; }
    return kroki;
  }
  const DOM = MIEJSCA[0].wezel;
  const wezelMiejsca = (n) => MIEJSCA.find((m) => m.nazwa === n).wezel;

  function zaplanuj(cel, punkty) {
    // punkty: lista węzłów pośrednich (albo null — wtedy losujemy)
    let wybor = punkty;
    if (!wybor) {
      const ile = cel < 40 ? 2 : cel < 75 ? 3 : cel < 110 ? 4 : 6;
      let najlepszy = null, bd = Infinity;
      for (let proba = 0; proba < 40; proba++) {
        const pp = []; for (let k = 0; k < ile; k++) pp.push(Math.floor(R() * N));
        let s = 0, prev = DOM; for (const p of pp) { s += odl[prev][p]; prev = p; } s += odl[prev][DOM];
        const d = Math.abs(s * 1.32 - cel);
        if (d < bd) { bd = d; najlepszy = pp; }
      }
      wybor = najlepszy;
    }
    const f = krawedzie.map(() => rnd(0.85, 1.5));
    const uzyte = new Uint8Array(krawedzie.length);
    const waga = (e) => krawedzie[e].dl * f[e] * (uzyte[e] ? 2.6 : 1);
    const kroki = []; let prev = DOM;
    for (const p of [...wybor, DOM]) { for (const k of dijkstra(prev, p, waga)) { kroki.push(k); uzyte[k.e] = 1; } prev = p; }
    return kroki;
  }
  function punktyTrasy(kroki) {
    const out = [];
    for (const k of kroki) {
      const e = krawedzie[k.e]; const pts = e.a === k.z ? e.pts : e.pts.slice().reverse();
      for (let i = out.length ? 1 : 0; i < pts.length; i++) out.push(pts[i]);
    }
    return out;
  }
  const dlTrasy = (kroki) => kroki.reduce((s, k) => s + krawedzie[k.e].dl, 0);
  const wGoreTrasy = (kroki) => kroki.reduce((s, k) => { const e = krawedzie[k.e]; return s + (e.a === k.z ? e.wGore : e.wDol); }, 0);

  // ───────────────────────── segmenty (prawdziwe nazwy i rekordy) ─────────────────────────
  // trasa: [miejsce A, miejsce B] albo { krawedz przy miejscu, ułamek }
  const SEGMENTY_DEF = [
    { nazwa: 'Od lasu do pałacu', dl: 636, nach: -1.8, pr: 59, prData: D(2026, 7, 22), proby: 31, przy: 'Obory' },
    { nazwa: 'I Got Bad', dl: 551, nach: -2.3, pr: 53, prData: D(2026, 6, 8), proby: 31, przy: 'Habdzin' },
    { nazwa: 'Gassy-Opacz', dl: 3170, nach: -0.1, pr: 357, prData: D(2026, 6, 8), proby: 30, od: 'Gassy', do: 'Opacz' },
    { nazwa: 'Obory_Lądowisko', dl: 2130, nach: -0.1, pr: 209, prData: D(2026, 7, 22), proby: 29, od: 'Obory', do: 'Lądowisko' },
    { nazwa: 'The Short Gassy Sprint', dl: 451, nach: 0.3, pr: 41, prData: D(2026, 7, 22), proby: 29, przy: 'Gassy' },
    { nazwa: 'Obory-Gassy', dl: 3430, nach: 0.0, pr: 331, prData: D(2026, 7, 22), proby: 26, od: 'Obory', do: 'Gassy' },
    { nazwa: 'Habdzin - Konstancin', dl: 3470, nach: 0.2, pr: 407, prData: D(2026, 6, 8), proby: 23, od: 'Habdzin', do: 'Konstancin-Jeziorna' },
    { nazwa: 'Obory-Opacz', dl: 6940, nach: -0.1, pr: 765, prData: D(2026, 7, 22), proby: 23, od: 'Obory', do: 'Opacz' },
    { nazwa: 'Jeziorka Gassy wzdłuż wału', dl: 5260, nach: 0.0, pr: 581, prData: D(2026, 10, 4), proby: 10, wal: true },
    { nazwa: 'Konstancin-Obory Hopka', dl: 204, nach: 5.1, pr: 27, prData: D(2026, 9, 2), proby: 12, przy: 'Obory', hopka: true },
    { nazwa: 'Od Pałacu w Oborach', dl: 335, nach: 4.1, pr: 37, prData: D(2026, 10, 4), proby: 12, przy: 'Obory' },
    { nazwa: 'Cieciszew - Parcela Obory', dl: 2220, nach: 0.0, pr: 300, prData: D(2026, 6, 27), proby: 10, od: 'Cieciszew', do: 'Obory' },
    { nazwa: 'Fuego Flats Forward Sprint', dl: 497, nach: 0.2, pr: 53, prData: D(2026, 10, 17), proby: 30, zwift: true, moc: 141 },
    { nazwa: 'The Mall Sprint Forward', dl: 186, nach: -1.4, pr: 16, prData: D(2026, 9, 24), proby: 14, zwift: true, moc: 170 },
    { nazwa: 'Volcano Circuit CCW', dl: 4100, nach: 0.0, pr: 469, prData: D(2026, 10, 8), proby: 10, zwift: true, moc: 119 },
  ];
  const segmenty = SEGMENTY_DEF.map((s, i) => {
    const seg = Object.assign({ id: i, typ: s.zwift ? 'zwift' : 'szosa' }, s);
    if (s.zwift) return seg;
    let kroki = [];
    if (s.od) kroki = dijkstra(wezelMiejsca(s.od), wezelMiejsca(s.do), (e) => krawedzie[e].dl);
    else if (s.wal) kroki = (() => { const a = wal[5], b = wal[3]; return dijkstra(a, b, (e) => (krawedzie[e].rodzaj === 'wal' ? krawedzie[e].dl : 99)); })();
    else {
      const w = wezelMiejsca(s.przy);
      const opcje = sasiedzi[w].map((n) => n);
      const nb = opcje[(i * 7) % opcje.length];
      kroki = [{ e: nb.e, z: nb.v, do: w }];
    }
    seg.krawedzie = kroki.map((k) => k.e);
    let pts = punktyTrasy(kroki);
    if (s.przy) { const n = pts.length; const frac = clamp(s.dl / 1000 / krawedzie[kroki[0].e].dl, 0.08, 0.9); pts = pts.slice(Math.floor(n * (1 - frac))); }
    seg.pts = pts;
    return seg;
  });

  // ───────────────────────── kalendarz jazd ─────────────────────────
  const NAZWY_SZOSA = [
    (m) => `Pętla przez ${m}`, (m) => `${m} i z powrotem`, (m) => `Tempo do ${m}`, () => 'Wał wiślany', () => 'Rozjazd po pracy',
    () => 'Poranne kręcenie', (m) => `Interwały: ${m}`, () => 'Wieczorna pętla', (m) => `Szybka runda: ${m}`, () => 'Sprinty pod Oborami',
    () => 'Kawa w Konstancinie', () => 'Długa sobota', () => 'Spokojna regeneracja', (m) => `Wiatr w twarz: ${m}`,
  ];
  const DOPELNIACZ = { 'Gassy': 'Gassów', 'Obory': 'Obór', 'Cieciszew': 'Cieciszewa', 'Ciszyca': 'Ciszycy', 'Habdzin': 'Habdzina', 'Bielawa': 'Bielawy', 'Okrzeszyn': 'Okrzeszyna', 'Kawęczyn': 'Kawęczyna', 'Słomczyn': 'Słomczyna', 'Powsin': 'Powsina', 'Opacz': 'Opacza', 'Góra Kalwaria': 'Góry Kalwarii', 'Obórki': 'Obórek', 'Piaseczno': 'Piaseczna' };
  const BIERNIK_PRZEZ = { 'Gassy': 'Gassy', 'Obory': 'Obory', 'Cieciszew': 'Cieciszew', 'Ciszyca': 'Ciszycę', 'Habdzin': 'Habdzin', 'Bielawa': 'Bielawę', 'Okrzeszyn': 'Okrzeszyn', 'Kawęczyn': 'Kawęczyn', 'Słomczyn': 'Słomczyn', 'Powsin': 'Powsin', 'Opacz': 'Opacz', 'Góra Kalwaria': 'Górę Kalwarię', 'Obórki': 'Obórki', 'Piaseczno': 'Piaseczno' };
  const ZWIFT_TRASY = ['Volcano Circuit CCW', 'Tempus Fugit', 'London Classique', 'Fuego Flats', 'Richmond UCI Worlds', 'The Mall', 'Watopia Flat Route', 'Whitehall Loop', 'Makuri Temple Loop', 'Downtown Dolphin'];
  const ZWIFT_TYPY = ['', '', '', 'Sweet spot · ', 'Tempo · ', 'Wyścig grupowy · ', 'Spokojnie · ', 'Pace partner · '];

  function nazwaSzosa(kroki) {
    const miejsca = [];
    for (const k of kroki) { const m = wezly[k.do].miejsce; if (m && m !== 'Konstancin-Jeziorna' && m !== 'Lądowisko' && !miejsca.includes(m)) miejsca.push(m); }
    const m = miejsca.length ? miejsca[Math.floor(miejsca.length / 2)] : 'Gassy';
    const szablon = pick(NAZWY_SZOSA);
    const s = szablon.toString();
    if (s.includes('przez')) return szablon(BIERNIK_PRZEZ[m] || m);
    if (s.includes('Tempo do')) return szablon(DOPELNIACZ[m] || m);
    return szablon(m);
  }

  const jazdy = [];
  let forma = 0.0; // rośnie przez sezon, wpływa na prędkość
  function dodajSzose(data, cel, opcje = {}) {
    const kroki = opcje.kroki || zaplanuj(cel, opcje.punkty || null);
    const km = dlTrasy(kroki) * 1.12; // drogi kręcą bardziej, niż widać na mapie
    const grupa = opcje.grupa ?? (rnd() < 0.18);
    const v = clamp((opcje.v ?? (25.7 + forma * 2.3 + (grupa ? 2.2 : 0) + gauss() * 1.0)) - (km > 100 ? 1.2 : 0), 23.5, 33.5);
    const czas = Math.round((km / v) * 3600);
    const intens = clamp(0.72 + (v - 27) * 0.025 + (grupa ? 0.05 : 0) + gauss() * 0.03, 0.6, 0.95);
    const hr = Math.round(clamp(118 + intens * 42 + gauss() * 2.5, 122, 168));
    const IF = clamp((hr - 64) / (171 - 64), 0.55, 1.02);
    const j = {
      id: 0, data, typ: 'szosa', nazwa: opcje.nazwa || nazwaSzosa(kroki), km, czas, predkosc: km / (czas / 3600),
      przewyzszenie: Math.round(wGoreTrasy(kroki) * 1.35 + km * 0.6), tetno: hr, tetnoMax: Math.round(clamp(hr + 18 + rnd(0, 12), 150, 192)),
      kadencja: Math.round(84 + rnd(0, 7)), obciazenie: Math.round((czas / 3600) * IF * IF * 100), moc: null, kroki, grupa,
    };
    j.kcal = Math.round(j.czas / 3600 * (520 + intens * 260));
    for (const k of kroki) krawedzie[k.e].uzycia++;
    jazdy.push(j); return j;
  }
  function dodajZwift(data, opcje = {}) {
    const min = opcje.min ?? Math.round(clamp(rnd(40, 80), 35, 95));
    const typ = pick(ZWIFT_TYPY);
    const moc = Math.round(clamp((opcje.moc ?? (162 + forma * 22 + (typ.includes('Sweet') ? 22 : typ.includes('Spok') ? -24 : typ.includes('Wyścig') ? 18 : 0) + gauss() * 8)), 118, 222));
    const v = clamp(29 + (moc - 165) * 0.06 + gauss() * 1.2, 25, 37);
    const czas = min * 60, km = v * czas / 3600;
    const np = Math.round(moc * (typ.includes('Wyścig') ? 1.09 : typ.includes('Sweet') ? 1.03 : 1.05));
    const IF = np / 214;
    const hr = Math.round(clamp(112 + (moc - 120) * 0.42 + gauss() * 2.5, 120, 172));
    const j = {
      id: 0, data, typ: 'zwift', nazwa: 'Zwift · ' + typ + pick(ZWIFT_TRASY), km, czas, predkosc: v,
      przewyzszenie: Math.round(km * rnd(3, 12)), tetno: hr, tetnoMax: Math.round(clamp(hr + 16 + rnd(0, 10), 150, 190)), kadencja: Math.round(86 + rnd(0, 8)),
      obciazenie: Math.round((czas / 3600) * IF * IF * 100), moc, mocNP: np, kroki: null,
    };
    j.kcal = Math.round(moc * czas / 1000 * 1.05);
    jazdy.push(j); return j;
  }

  const KONIEC_GENEROWANIA = D(2026, 10, 31);
  for (let d = START; d <= KONIEC_GENEROWANIA; d = plusDni(d, 1)) {
    const m = d.getMonth() + 1, dt = dzienTyg(d), weekend = dt >= 5;
    const t = roznicaDni(START, d) / roznicaDni(START, DZIS);
    forma = clamp(0.15 + t * 0.85 + 0.15 * Math.sin(t * 9), 0, 1.1);
    const lato = m >= 5 && m <= 9, przejscie = m === 4 || m === 10, zima = !lato && !przejscie;
    const swieta = d >= D(2025, 12, 21) && d <= D(2026, 1, 3);
    const choroba = d >= D(2026, 2, 9) && d <= D(2026, 2, 18);
    const urlop = d >= D(2026, 8, 10) && d <= D(2026, 8, 16);
    if (choroba || urlop) continue;
    let pSzosa = lato ? (weekend ? 0.72 : 0.3) : przejscie ? (weekend ? 0.58 : 0.2) : (weekend ? 0.14 : 0.02);
    let pZwift = lato ? 0.03 : przejscie ? (weekend ? 0.06 : 0.13) : (weekend ? 0.26 : 0.33);
    if (dt === 0) { pSzosa *= 0.4; pZwift *= 0.4; }
    if (swieta) { pSzosa *= 0.5; pZwift *= 0.45; }
    const r = rnd();
    if (r < pSzosa) {
      const cel = weekend ? clamp(50 + gauss() * 15 + (lato ? 8 : 0), 30, 105) : clamp(30 + gauss() * 6, 20, 46);
      const h = weekend ? 8 + Math.floor(rnd(0, 3)) : 17 + Math.floor(rnd(0, 2));
      dodajSzose(D(d.getFullYear(), m, d.getDate(), h, Math.floor(rnd(0, 6)) * 10), cel);
    } else if (r < pSzosa + pZwift) {
      dodajZwift(D(d.getFullYear(), m, d.getDate(), weekend ? 9 + Math.floor(rnd(0, 3)) : 19 + Math.floor(rnd(0, 2)), Math.floor(rnd(0, 6)) * 10));
    }
  }
  // ostatni tydzień — ustawiony ręcznie, żeby „teraz" wyglądało sensownie
  forma = 1.0;
  dodajSzose(D(2026, 11, 1, 9, 10), 88, { nazwa: 'Długa niedziela: Góra Kalwaria' });
  dodajZwift(D(2026, 11, 2, 19, 30), { min: 60, moc: 168 });
  dodajZwift(D(2026, 11, 4, 19, 20), { min: 75, moc: 192 });
  dodajZwift(D(2026, 11, 6, 18, 50), { min: 45, moc: 140 });

  // najdłuższa jazda sezonu — wyprawa poza mapę
  (function () {
    const j = jazdy.find((x) => x.typ === 'szosa' && x.data >= D(2026, 6, 20) && dzienTyg(x.data) >= 5) || jazdy.find((x) => x.typ === 'szosa' && x.data >= D(2026, 6, 1));
    j.nazwa = 'Do Warki i z powrotem'; j.km = 142.6; j.czas = Math.round(142.6 / 27.1 * 3600); j.predkosc = 27.1; j.przewyzszenie = 612; j.tetno = 146;
    j.obciazenie = Math.round(j.czas / 3600 * 0.76 * 0.76 * 100); j.kcal = Math.round(j.czas / 3600 * 690);
  })();

  // ───────────────────────── dzisiejsza jazda ze strumieniami ─────────────────────────
  const wDzis = [wezelMiejsca('Obory'), wezelMiejsca('Gassy'), wal[3]];
  const krokiDzis = (function () {
    const uzyte = new Uint8Array(krawedzie.length);
    const waga = (e) => krawedzie[e].dl * (krawedzie[e].rodzaj === 'wal' ? 0.6 : 1) * (uzyte[e] ? 3 : 1);
    const out = []; let prev = DOM;
    for (const p of [...wDzis, DOM]) { for (const k of dijkstra(prev, p, waga)) { out.push(k); uzyte[k.e] = 1; } prev = p; }
    return out;
  })();
  const dzisiejsza = dodajSzose(D(2026, 11, 7, 10, 12), 0, { kroki: krokiDzis, nazwa: 'Sobotnia pętla przez Gassy i wał', grupa: false, v: 28.6 });

  jazdy.sort((a, b) => a.data - b.data);
  jazdy.forEach((j, i) => { j.id = i + 1; });

  const strumienie = (function (j) {
    const pts = punktyTrasy(j.kroki);
    const skala = j.km / dlugosc(pts);
    // równe próbki co 100 m (w km „prawdziwych")
    const krok = 0.1 / skala;
    const xs = [], ys = [];
    let seg = 0, poz = 0, acc = 0;
    xs.push(pts[0][0]); ys.push(pts[0][1]);
    for (let k = 1; k < pts.length; k++) {
      const dx = pts[k][0] - pts[k - 1][0], dy = pts[k][1] - pts[k - 1][1], L = Math.hypot(dx, dy);
      let t = 0;
      while (acc + (L - t) >= krok) { t += krok - acc; acc = 0; xs.push(pts[k - 1][0] + dx * t / L); ys.push(pts[k - 1][1] + dy * t / L); }
      acc += L - t;
    }
    const n = xs.length;
    const surowa = xs.map((x, i) => wysokosc(x, ys[i]));
    const ele = surowa.map((_, i) => { let s = 0, c = 0; for (let k = -3; k <= 3; k++) { const q = i + k; if (q >= 0 && q < n) { s += surowa[q]; c++; } } return s / c; });
    const grade = ele.map((e, i) => { const a = Math.max(0, i - 2), b = Math.min(n - 1, i + 2); return (ele[b] - ele[a]) / ((b - a) * 100); });
    // gdzie na trasie są segmenty
    const naTrasie = [];
    const krawedzieKm = []; { let acc2 = 0; for (const k of j.kroki) { const L = krawedzie[k.e].dl * skala; krawedzieKm.push({ e: k.e, od: acc2, do: acc2 + L, kier: krawedzie[k.e].a === k.z ? 1 : -1 }); acc2 += L; } }
    for (const s of segmenty) {
      if (!s.krawedzie || !s.krawedzie.length) continue;
      const hit = krawedzieKm.filter((k) => s.krawedzie.includes(k.e)).sort((a, b) => a.od - b.od);
      if (!hit.length) continue;
      // liczy się tylko najdłuższy ciągły przejazd — jak na Stravie, segment trzeba przejechać w całości
      let best = null, cur = null;
      for (const hh of hit) {
        if (cur && Math.abs(hh.od - cur.do) < 0.05) { cur.do = hh.do; } else cur = { od: hh.od, do: hh.do, kier: hh.kier };
        if (!best || cur.do - cur.od > best.do - best.od) best = Object.assign({}, cur);
      }
      const dl = s.dl / 1000;
      const dlGeom = s.krawedzie.reduce((a, e) => a + krawedzie[e].dl, 0) * skala;
      let od = best.od, dok = best.do;
      if (s.przy) { if (best.kier === 1) od = dok - dl; else dok = od + dl; }
      else { if (dok - od < dlGeom * 0.85) continue; dok = od + Math.min(dl, dok - od); }
      naTrasie.push({ id: s.id, nazwa: s.nazwa, od, do: dok });
    }
    naTrasie.sort((a, b) => a.od - b.od);
    const wysilek = (km) => naTrasie.some((s) => km >= s.od && km <= s.do);
    const v = [], hr = [], cad = [], t = [], d = [];
    let szum = 0, h = 96, czas = 0;
    const wiatr = 2.6; // wiatr z północnego zachodu
    for (let i = 0; i < n; i++) {
      const km = i * 0.1;
      d.push(+km.toFixed(1));
      const kier = i < n - 1 ? Math.atan2(ys[i + 1] - ys[i], xs[i + 1] - xs[i]) : 0;
      const czolowy = wiatr * Math.cos(kier - (-Math.PI * 0.75 + Math.PI));
      szum = szum * 0.9 + gauss() * 0.8;
      let vv = 28.9 * (1 - 5.2 * Math.max(grade[i], -0.04)) - czolowy * 0.9 + szum;
      if (wysilek(km)) vv *= 1.16;
      if (km < 2.5) vv *= 0.84 + km * 0.064;
      if (km > j.km - 1.6) vv *= 0.82;
      vv = clamp(vv, 14, 51);
      v.push(+vv.toFixed(1));
      const dt = 0.1 / vv * 3600;
      czas += dt; t.push(Math.round(czas));
      const cel = 121 + 1.8 * (vv - 18) + 420 * Math.max(grade[i], 0) + (wysilek(km) ? 12 : 0) - (km > j.km - 1.6 ? 14 : 0);
      h += (cel - h) * (1 - Math.exp(-dt / 22)) + gauss() * 0.6;
      hr.push(Math.round(clamp(h, 92, 189)));
      cad.push(grade[i] < -0.015 && R() < 0.45 ? 0 : Math.round(clamp(87 + gauss() * 3 + (wysilek(km) ? 9 : 0), 70, 112)));
    }
    return { d, x: xs, y: ys, ele: ele.map((e) => +e.toFixed(1)), grade: grade.map((g) => +(g * 100).toFixed(1)), v, hr, cad, t, segmenty: naTrasie };
  })(dzisiejsza);
  // podsumowanie dzisiejszej jazdy z próbek
  (function (j, s) {
    j.czas = s.t[s.t.length - 1];
    j.predkosc = j.km / (j.czas / 3600);
    j.tetno = Math.round(s.hr.reduce((a, b) => a + b, 0) / s.hr.length);
    j.tetnoMax = Math.max(...s.hr);
    j.vMax = Math.max(...s.v);
    let up = 0; for (let i = 1; i < s.ele.length; i++) if (s.ele[i] > s.ele[i - 1]) up += s.ele[i] - s.ele[i - 1];
    j.przewyzszenie = Math.round(up * 1.3);
    const IF = (j.tetno - 64) / (171 - 64);
    j.obciazenie = Math.round(j.czas / 3600 * IF * IF * 100);
    j.kcal = Math.round(j.czas / 3600 * 700);
    const nz = s.cad.filter((c) => c > 0); j.kadencja = Math.round(nz.reduce((a, b) => a + b, 0) / nz.length);
  })(dzisiejsza, strumienie);

  // odcinki co 5 km
  const odcinki = [];
  for (let k = 0; k * 50 < strumienie.d.length - 1; k++) {
    const a = k * 50, b = Math.min(strumienie.d.length - 1, (k + 1) * 50);
    if (b - a < 10) break;
    const km = strumienie.d[b] - strumienie.d[a], sek = strumienie.t[b] - (a ? strumienie.t[a] : 0);
    const hrS = strumienie.hr.slice(a, b + 1);
    odcinki.push({ nr: k + 1, od: strumienie.d[a], do: strumienie.d[b], czas: sek, predkosc: km / (sek / 3600), tetno: Math.round(hrS.reduce((x, y) => x + y, 0) / hrS.length), roznicaWys: Math.round(strumienie.ele[b] - strumienie.ele[a]) });
  }

  // ───────────────────────── dni, forma, tygodnie, miesiące ─────────────────────────
  const dni = [];
  const poKluczu = {};
  for (let d = START; d <= DZIS; d = plusDni(d, 1)) { const o = { data: dzien(d), km: 0, czas: 0, przewyzszenie: 0, obciazenie: 0, jazdy: [] }; poKluczu[klucz(d)] = o; dni.push(o); }
  for (const j of jazdy) { const o = poKluczu[klucz(j.data)]; o.km += j.km; o.czas += j.czas; o.przewyzszenie += j.przewyzszenie; o.obciazenie += j.obciazenie; o.jazdy.push(j.id); }
  let ctl = 24, atl = 22;
  for (const o of dni) {
    o.tsb = ctl - atl; // świeżość liczona z wczoraj
    ctl += (o.obciazenie - ctl) / 42; atl += (o.obciazenie - atl) / 7;
    o.ctl = ctl; o.atl = atl;
  }
  const dzis = dni[dni.length - 1];
  const tydzienTemu = dni[dni.length - 8];
  function stanFormy(tsb) {
    if (tsb > 15) return { klucz: 'swiezy', nazwa: 'Wypoczęty', opis: 'Dobry moment na mocny trening albo start.', status: 'good' };
    if (tsb > -10) return { klucz: 'neutralny', nazwa: 'W równowadze', opis: 'Obciążenie i regeneracja się bilansują.', status: 'good' };
    if (tsb > -30) return { klucz: 'trening', nazwa: 'Budowanie formy', opis: 'Zmęczenie pracuje na formę. Pilnuj snu.', status: 'warning' };
    return { klucz: 'przeciazenie', nazwa: 'Przeciążenie', opis: 'Zmęczenie wyraźnie wyprzedza formę. Odpocznij.', status: 'critical' };
  }

  function sumuj(lista) {
    const s = { km: 0, czas: 0, przewyzszenie: 0, obciazenie: 0, jazdy: 0, szosa: 0, zwift: 0, kmSzosa: 0, kmZwift: 0, kcal: 0 };
    for (const j of lista) { s.km += j.km; s.czas += j.czas; s.przewyzszenie += j.przewyzszenie; s.obciazenie += j.obciazenie; s.jazdy++; s.kcal += j.kcal; if (j.typ === 'szosa') { s.szosa++; s.kmSzosa += j.km; } else { s.zwift++; s.kmZwift += j.km; } }
    s.predkosc = s.czas ? s.km / (s.czas / 3600) : 0;
    return s;
  }
  const miedzy = (od, doo) => jazdy.filter((j) => j.data >= od && j.data < doo);

  const tygodnie = [];
  {
    const ostatni = poczatekTyg(DZIS);
    for (let k = 52; k >= 0; k--) {
      const od = plusDni(ostatni, -7 * k), doo = plusDni(od, 7);
      const s = sumuj(miedzy(od, doo));
      s.od = od; s.biezacy = k === 0;
      tygodnie.push(s);
    }
  }
  const miesiace = [];
  for (let y = 2025, m = 8; y < 2026 || (y === 2026 && m <= 11); m === 12 ? (y++, m = 1) : m++) {
    const od = P(y, m, 1), doo = P(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1, 1);
    const s = sumuj(miedzy(od, doo)); s.od = od; s.rok = y; s.miesiac = m; s.biezacy = y === 2026 && m === 11;
    s.dni = dni.filter((o) => o.data >= od && o.data < doo).map((o) => ({ data: o.data, km: o.km, obciazenie: o.obciazenie }));
    miesiace.push(s);
  }

  const jutro = P(2026, 11, 8);
  const okresy = {
    tydzien: { etykieta: 'Ten tydzień', krotko: 'Tydzień', od: poczatekTyg(DZIS), do: jutro },
    miesiac: { etykieta: 'Listopad', krotko: 'Miesiąc', od: P(2026, 11, 1), do: jutro },
    rok: { etykieta: '2026', krotko: 'Rok', od: P(2026, 1, 1), do: jutro },
    wszystko: { etykieta: 'Od 1 sierpnia 2025', krotko: 'Wszystko', od: P(2025, 8, 1), do: jutro },
  };
  const poprzednie = {
    tydzien: { etykieta: 'poprzedni tydzień', od: P(2026, 10, 26), do: P(2026, 11, 2) },
    miesiac: { etykieta: '1–7 października', od: P(2026, 10, 1), do: P(2026, 10, 8) },
    rok: null, wszystko: null,
  };
  for (const k in okresy) {
    Object.assign(okresy[k], sumuj(miedzy(okresy[k].od, okresy[k].do)));
    const p = poprzednie[k];
    okresy[k].poprzedni = p ? Object.assign({ etykieta: p.etykieta }, sumuj(miedzy(p.od, p.do))) : null;
  }

  // ───────────────────────── segmenty: historia prób ─────────────────────────
  const szosowe = jazdy.filter((j) => j.typ === 'szosa'), zwiftowe = jazdy.filter((j) => j.typ === 'zwift');
  for (const s of segmenty) {
    const pula = (s.typ === 'zwift' ? zwiftowe : szosowe).filter((j) => j.data <= DZIS);
    let wybrane = [];
    const wTrasie = s.typ === 'szosa' ? pula.filter((j) => j.kroki && j.kroki.some((k) => s.krawedzie.includes(k.e))) : [];
    wybrane = wTrasie.slice(-s.proby);
    if (wybrane.length < s.proby) {
      const reszta = pula.filter((j) => !wybrane.includes(j));
      while (wybrane.length < s.proby && reszta.length) wybrane.push(reszta.splice(Math.floor(R() * reszta.length), 1)[0]);
    }
    wybrane.sort((a, b) => a.data - b.data);
    if (s.nazwa === 'Jeziorka Gassy wzdłuż wału' || strumienie.segmenty.some((x) => x.id === s.id)) {
      if (!wybrane.includes(dzisiejsza)) { wybrane.push(dzisiejsza); wybrane.shift(); }
    }
    // najlepsza próba = jazda najbliżej daty rekordu
    let iPr = 0, bd = Infinity;
    wybrane.forEach((j, i) => { const d = Math.abs(j.data - s.prData); if (d < bd) { bd = d; iPr = i; } });
    const n = wybrane.length;
    s.historia = wybrane.map((j, i) => {
      const postep = 0.11 * Math.exp(-i / Math.max(4, n / 3));
      let czas = i === iPr ? s.pr : s.pr * (1 + postep + Math.abs(gauss()) * 0.045 + 0.012);
      if (s.typ === 'zwift' && i !== iPr) czas = s.pr * (1 + Math.abs(gauss()) * 0.06 + 0.01);
      return { data: j.data, jazda: j.id, czas: Math.round(czas), moc: s.moc ? Math.round(s.moc * (i === iPr ? 1 : 0.86 + rnd(0, 0.12))) : null, pr: i === iPr };
    });
    s.historia[iPr].data = s.prData; // prawdziwa data rekordu ze starej strony
    s.historia.sort((a, b) => a.data - b.data);
    s.ostatnia = s.historia[n - 1];
    s.predkoscPr = s.dl / 1000 / (s.pr / 3600);
  }

  // ───────────────────────── moc (tylko Zwift) ─────────────────────────
  const moc = {
    czasy: [5, 10, 15, 30, 60, 120, 300, 600, 1200, 1800, 3600],
    etykiety: ['5 s', '10 s', '15 s', '30 s', '1 min', '2 min', '5 min', '10 min', '20 min', '30 min', '60 min'],
    // „cały okres" zawiera ostatnie 42 dni, więc nigdy nie jest niższy — rekordy 5, 10 i 20 min padły niedawno
    wszech: [812, 768, 701, 552, 418, 338, 284, 259, 232, 216, 197],
    ostatnie42: [744, 711, 662, 531, 409, 336, 284, 259, 232, 213, null],
  };
  moc.najlepsza20 = moc.wszech[8];
  moc.noweRekordy = moc.czasy.filter((_, i) => moc.ostatnie42[i] != null && moc.ostatnie42[i] >= moc.wszech[i]).map((c) => moc.etykiety[moc.czasy.indexOf(c)]);

  // ───────────────────────── strefy tętna (ostatnie 90 dni) ─────────────────────────
  const STREFY = [
    { nr: 1, nazwa: 'Regeneracja', od: 0, do: 128 },
    { nr: 2, nazwa: 'Wytrzymałość', od: 129, do: 146 },
    { nr: 3, nazwa: 'Tempo', od: 147, do: 158 },
    { nr: 4, nazwa: 'Próg', od: 159, do: 171 },
    { nr: 5, nazwa: 'VO₂max', od: 172, do: 192 },
  ];
  const czasStref = [0, 0, 0, 0, 0];
  for (const j of jazdy) {
    if (j.data < plusDni(DZIS, -90)) continue;
    // rozkład typowy dla amatora: dużo Z2, mniej progu; mocniejsze jazdy przesuwają go w górę
    const c = clamp((j.tetno - 140) / 12, -1, 1);
    const rozklad = [0.17 - c * 0.05, 0.43 - c * 0.06, 0.23 + c * 0.04, 0.12 + c * 0.05, 0.05 + c * 0.02];
    rozklad.forEach((r, i) => { czasStref[i] += j.czas * r; });
  }
  const sumaStref = czasStref.reduce((a, b) => a + b, 0);
  const strefy = STREFY.map((z, i) => Object.assign({}, z, { czas: Math.round(czasStref[i]), udzial: czasStref[i] / sumaStref }));

  // ───────────────────────── rekordy, seria, cel ─────────────────────────
  const maxBy = (arr, f) => arr.reduce((a, b) => (f(b) > f(a) ? b : a));
  const dluga = maxBy(szosowe, (j) => j.km);
  const szybka = maxBy(szosowe.filter((j) => j.km >= 40), (j) => j.predkosc);
  const gorska = maxBy(jazdy, (j) => j.przewyzszenie);
  const najTydz = maxBy(tygodnie, (t) => t.km);
  const zwiftMax = maxBy(zwiftowe, (j) => j.moc);
  const rekordy = [
    { klucz: 'dystans', nazwa: 'Najdłuższa jazda', wartosc: dluga.km, jednostka: 'km', data: dluga.data, jazda: dluga.id, opis: dluga.nazwa },
    { klucz: 'predkosc', nazwa: 'Najszybsza średnia (40+ km)', wartosc: szybka.predkosc, jednostka: 'km/h', data: szybka.data, jazda: szybka.id, opis: szybka.nazwa },
    { klucz: 'przewyzszenie', nazwa: 'Najwięcej w górę', wartosc: gorska.przewyzszenie, jednostka: 'm', data: gorska.data, jazda: gorska.id, opis: gorska.nazwa },
    { klucz: 'tydzien', nazwa: 'Najmocniejszy tydzień', wartosc: najTydz.km, jednostka: 'km', data: najTydz.od, opis: najTydz.jazdy + ' jazd' },
    { klucz: 'moc20', nazwa: 'Najlepsze 20 min (Zwift)', wartosc: moc.najlepsza20, jednostka: 'W', data: zwiftMax.data, jazda: zwiftMax.id, opis: 'pomiar z trenażera' },
    { klucz: 'tetno', nazwa: 'Najwyższe tętno', wartosc: Math.max(...jazdy.map((j) => j.tetnoMax)), jednostka: 'bpm', data: maxBy(jazdy, (j) => j.tetnoMax).data, opis: 'w trakcie sprintu' },
  ];

  let seria = 0;
  for (let k = tygodnie.length - 1; k >= 0; k--) { if (tygodnie[k].jazdy > 0 || tygodnie[k].biezacy) seria++; else break; }
  let najdluzszaSeria = 0, biez = 0;
  for (const t of tygodnie) { if (t.jazdy > 0) { biez++; najdluzszaSeria = Math.max(najdluzszaSeria, biez); } else biez = 0; }

  const dzienRoku = roznicaDni(D(2026, 1, 1), DZIS) + 1;
  const cel = { rok: 2026, km: 5500, teraz: okresy.rok.km };
  cel.prognoza = cel.teraz / dzienRoku * 365;
  cel.udzial = cel.teraz / cel.km;
  cel.potrzebaNaTydzien = Math.max(0, cel.km - cel.teraz) / ((365 - dzienRoku) / 7);

  const rok2026 = dni.filter((o) => o.data >= D(2026, 1, 1));
  let narast = 0;
  cel.narastajaco = rok2026.map((o) => { narast += o.km; return { data: o.data, km: narast }; });

  // ───────────────────────── formatowanie (pl-PL) ─────────────────────────
  const nf = {};
  const liczba = (v, dec = 0) => { const k = dec; if (!nf[k]) nf[k] = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: dec, maximumFractionDigits: dec }); return nf[k].format(v).replace(/ /g, ' '); };
  const MIES = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  const MIES_PELNE = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
  const MIES_DOP = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  const DNI = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];
  const DNI_KR = ['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'];
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = {
    liczba,
    km: (v, dec) => liczba(v, dec ?? (v >= 100 ? 0 : 1)),
    czas: (s) => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}:${pad(m)}:${pad(x)}` : `${m}:${pad(x)}`; },
    czasHM: (s) => { const t = Math.round(s / 60), h = Math.floor(t / 60), m = t % 60; return h ? `${h} h ${pad(m)} min` : `${m} min`; },
    godziny: (s) => liczba(s / 3600, s / 3600 >= 100 ? 0 : 1),
    data: (d) => `${d.getDate()} ${MIES_DOP[d.getMonth()]} ${d.getFullYear()}`,
    dataKrotka: (d) => `${d.getDate()} ${MIES[d.getMonth()]}`,
    dataNum: (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`,
    dataNumKr: (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`,
    godzina: (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    dzienTyg: (d) => DNI[dzienTyg(d)], dzienTygKr: (d) => DNI_KR[dzienTyg(d)],
    miesiac: (i) => MIES_PELNE[i], miesiacKr: (i) => MIES[i], miesiacDop: (i) => MIES_DOP[i],
    znak: (v, dec = 0) => (v > 0 ? '+' : v < 0 ? '−' : '±') + liczba(Math.abs(v), dec),
    procent: (v, dec = 0) => liczba(v * 100, dec) + '%',
    tempoSeg: (s) => { const m = Math.floor(s / 60), x = s % 60; return `${m}:${pad(x)}`; },
    kiedy: (d) => { const r = roznicaDni(d, DZIS); return r === 0 ? 'dziś' : r === 1 ? 'wczoraj' : r < 7 ? `${r} dni temu` : `${d.getDate()} ${MIES[d.getMonth()]}`; },
    tydzienISO: (d) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y0) / 86400000 + 1) / 7); },
  };

  // ───────────────────────── eksport ─────────────────────────
  const rzeka = []; for (let y = -1; y <= MAPA.wys + 1; y += 0.25) rzeka.push([rzekaX(y), y]);
  const jeziorka = (function () { const p = []; for (let x = -1; x <= 26.4; x += 0.25) { const y = 11.9 + 0.9 * Math.sin(x / 3.1 + 0.4) + 0.35 * Math.sin(x / 0.9) + (x > 20 ? (x - 20) * 0.12 : 0); if (x > rzekaX(y)) break; p.push([x, y]); } return p; })();

  global.K2 = {
    dzis: DZIS, start: START,
    zawodnik: { imie: 'Fryderyk', nazwisko: 'Marszałek', strava: 143761800, tetnoMax: 192, tetnoProg: 171, miejsce: 'Konstancin-Jeziorna' },
    jazdy, dni, tygodnie, miesiace, okresy,
    forma: Object.assign({ ctl: dzis.ctl, atl: dzis.atl, tsb: dzis.ctl - dzis.atl, zmiana7: dzis.ctl - tydzienTemu.ctl }, stanFormy(dzis.ctl - dzis.atl)),
    stanFormy,
    ostatnia: { jazda: dzisiejsza, probki: strumienie, odcinki },
    segmenty, moc, strefy, rekordy,
    seria: { tygodnie: seria, najdluzsza: najdluzszaSeria },
    cel,
    mapa: { szer: MAPA.szer, wys: MAPA.wys, rzeka, jeziorka, miejsca: MIEJSCA, drogi: krawedzie, wezly, wysokosc, dom: { x: MIEJSCA[0].x, y: MIEJSCA[0].y } },
    trasaJazdy: (j) => (j.kroki ? punktyTrasy(j.kroki) : null),
    fmt,
    przykladowe: true,
  };
})(window);
