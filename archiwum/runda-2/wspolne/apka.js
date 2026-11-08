/*
 * Kolarstwo 2 — wspólny silnik aplikacji: zakładki, ekrany, arkusz od dołu,
 * grywalizacja liczona z danych i gotowe klocki (pierścienie, paski, miniatury tras, szczegóły jazdy).
 * Każdy styl składa z tego własne ekrany i nadaje im wygląd w swoim CSS.
 */
(function (global) {
  'use strict';
  const K = global.K2, f = K.fmt, h = W.h;
  const A = {};
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  A.clamp = clamp;
  A.odm = (n, a, b, c) => { n = Math.abs(Math.round(n)); if (n === 1) return a; const d = n % 10, s = n % 100; return d >= 2 && d <= 4 && (s < 12 || s > 14) ? b : c; };
  A.wielka = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ───── ikony (Phosphor) ─────
  A.ik = (nazwa, waga, klasa) => h('i', { class: `${!waga || waga === 'regular' ? 'ph' : 'ph-' + waga} ph-${nazwa}${klasa ? ' ' + klasa : ''}`, 'aria-hidden': 'true' });

  // ───── powitanie i daty ─────
  A.imie = K.zawodnik.imie;
  A.powitanie = () => { const g = new Date().getHours(); return g < 5 ? 'Dobranoc' : g < 11 ? 'Dzień dobry' : g < 18 ? 'Cześć' : 'Dobry wieczór'; };
  A.poraDnia = () => { const g = new Date().getHours(); return g < 6 || g >= 20 ? 'noc' : g < 9 ? 'swit' : g < 17 ? 'dzien' : 'zmierzch'; };

  // ───── grywalizacja ─────
  const W_ = K.okresy.wszystko, T = K.okresy.tydzien, F = K.forma, C = K.cel;
  A.poziom = (() => {
    const km = W_.km, p = Math.floor(Math.sqrt(km / 30)), od = p * p * 30, doo = (p + 1) * (p + 1) * 30;
    return { nr: p, km, od, do: doo, postep: (km - od) / (doo - od), brakuje: doo - km };
  })();
  A.seria = K.seria;

  const tydzJazdy = K.jazdy.filter((j) => j.data >= T.od && j.data < T.do);
  const najdluzszaTyg = Math.max(0, ...tydzJazdy.map((j) => j.km));
  A.wyzwania = [
    { id: 'km', ikona: 'path', nazwa: '200 km w tym tygodniu', wart: T.km, cel: 200, jedn: 'km' },
    { id: 'jazdy', ikona: 'bicycle', nazwa: '4 jazdy w tygodniu', wart: T.jazdy, cel: 4, jedn: '' },
    { id: 'dluga', ikona: 'mountains', nazwa: 'Jedna jazda 60+ km', wart: Math.min(1, najdluzszaTyg >= 60 ? 1 : 0), cel: 1, jedn: '', opis: najdluzszaTyg >= 60 ? `${f.km(najdluzszaTyg)} km w sobotę` : '' },
    { id: 'zwift', ikona: 'monitor-play', nazwa: '2 sesje na Zwifcie', wart: T.zwift, cel: 2, jedn: '' },
  ].map((w) => Object.assign(w, { udzial: clamp(w.wart / w.cel, 0, 1), zrobione: w.wart >= w.cel }));
  A.wyzwanieMiesiaca = { nazwa: 'Listopad: 600 km', wart: K.okresy.miesiac.km, cel: 600, udzial: clamp(K.okresy.miesiac.km / 600, 0, 1) };

  const najdl = K.jazdy.reduce((a, b) => (b.km > a.km ? b : a));
  const zimaZwift = K.jazdy.filter((j) => j.typ === 'zwift' && (j.data.getMonth() === 11 || j.data.getMonth() <= 1)).length;
  const wal = K.segmenty.find((s) => /wał/.test(s.nazwa));
  const maxTydzM = Math.max(...K.tygodnie.map((t) => t.przewyzszenie));
  const szybka = K.rekordy.find((r) => r.klucz === 'predkosc');
  const wczesne = K.jazdy.filter((j) => j.data.getHours() < 8).length;
  A.odznaki = [
    { id: 'setka', ikona: 'medal', nazwa: 'Setka', opis: 'Jazda ponad 100 km', zdobyta: najdl.km >= 100, kiedy: najdl.data, szczegol: `${f.km(najdl.km)} km · ${najdl.nazwa}` },
    { id: 'seria', ikona: 'flame', nazwa: 'Seria 10', opis: '10 tygodni z rzędu z jazdą', zdobyta: K.seria.najdluzsza >= 10, szczegol: `najdłuższa seria: ${K.seria.najdluzsza} tygodni` },
    { id: 'wal', ikona: 'path', nazwa: 'Wierny wałowi', opis: '10 przejazdów wału wiślanego', zdobyta: wal.historia.length >= 10, postep: wal.historia.length / 10, szczegol: `${wal.historia.length} przejazdów „${wal.nazwa}”` },
    { id: 'zima', ikona: 'snowflake', nazwa: 'Zimowy wojownik', opis: '20 sesji na Zwifcie zimą', zdobyta: zimaZwift >= 20, postep: zimaZwift / 20, szczegol: `${zimaZwift} sesji od grudnia do lutego` },
    { id: 'trzydziestka', ikona: 'lightning', nazwa: 'Trzydziestka', opis: 'Średnia 30 km/h na 40+ km', zdobyta: szybka.wartosc >= 30, kiedy: szybka.data, szczegol: `${f.liczba(szybka.wartosc, 1)} km/h · ${szybka.opis}` },
    { id: 'moc', ikona: 'barbell', nazwa: 'Nowe waty', opis: 'Rekord mocy w ostatnich 6 tygodniach', zdobyta: K.moc.noweRekordy.length > 0, szczegol: `rekordy: ${K.moc.noweRekordy.join(', ')}` },
    { id: 'gory', ikona: 'mountains', nazwa: 'Tysiąc w górę', opis: '1000 m przewyższenia w tygodniu', zdobyta: maxTydzM >= 1000, postep: maxTydzM / 1000, szczegol: `najwięcej: ${f.liczba(maxTydzM)} m w tygodniu` },
    { id: 'rok', ikona: 'crown', nazwa: '5000 w roku', opis: '5000 km w jednym roku', zdobyta: C.teraz >= 5000, postep: C.teraz / 5000, szczegol: `${f.liczba(C.teraz)} z 5000 km` },
    { id: 'ptak', ikona: 'sun-horizon', nazwa: 'Ranny ptak', opis: 'Start przed 8:00', zdobyta: wczesne > 0, postep: wczesne ? 1 : 0, szczegol: wczesne ? `${wczesne} wczesnych startów` : 'jeszcze ani razu przed ósmą' },
  ].map((o) => Object.assign(o, { postep: o.zdobyta ? 1 : clamp(o.postep || 0, 0, 0.99) }));

  // gotowość: z formy i zmęczenia (to nasz wskaźnik, nie pomiar)
  A.gotowosc = Math.round(clamp(62 + F.tsb * 1.5, 5, 99));
  A.propozycja = (() => {
    const k = F.klucz;
    if (k === 'przeciazenie') return { tytul: 'Dzień wolny', czas: '0 min', strefa: 'odpoczynek', ikona: 'moon-stars', opis: 'Zmęczenie mocno wyprzedza formę. Sen i spacer zrobią więcej niż rower.' };
    if (k === 'trening') return { tytul: 'Spokojna jazda w Z2', czas: '60 min', strefa: 'Z2 · 129–146 bpm', ikona: 'wind', opis: `Zmęczenie wyprzedza formę o ${f.liczba(F.atl - F.ctl)} pkt. Luźne kręcenie pomoże się zregenerować, a forma i tak urośnie.` };
    if (k === 'neutralny') return { tytul: 'Tempo: 3 × 10 min', czas: '90 min', strefa: 'Z3 · 147–158 bpm', ikona: 'speedometer', opis: 'Obciążenie i regeneracja w równowadze. Dobry dzień na odcinki w tempie.' };
    return { tytul: 'Interwały 5 × 5 min', czas: '75 min', strefa: 'Z4 · 159–171 bpm', ikona: 'lightning', opis: 'Jesteś wypoczęty. Wykorzystaj to na mocniejszy trening.' };
  })();
  A.dzisZaliczone = K.ostatnia.jazda.data.toDateString() === K.dzis.toDateString();

  // tydzień dzień po dniu
  A.tydzienDni = Array.from({ length: 7 }, (_, k) => {
    const d = new Date(T.od.getFullYear(), T.od.getMonth(), T.od.getDate() + k);
    const o = K.dni.find((x) => x.data.toDateString() === d.toDateString());
    const jj = o ? o.jazdy.map((id) => K.jazdy[id - 1]) : [];
    return { data: d, km: o ? o.km : 0, czas: o ? o.czas : 0, jazdy: jj, typ: jj.length ? (jj.some((j) => j.typ === 'szosa') ? 'szosa' : 'zwift') : null, dzis: d.toDateString() === K.dzis.toDateString(), przyszly: !o };
  });

  // osiągnięcia na jeździe (z historii segmentów)
  A.osiagniecia = (j) => {
    const out = [];
    for (const s of K.segmenty) for (const x of s.historia) if (x.jazda === j.id) {
      if (x.pr) out.push({ typ: 'pr', s, czas: x.czas, tekst: `Rekord: ${s.nazwa}` });
      else if (x.czas <= s.pr * 1.03) out.push({ typ: 'blisko', s, czas: x.czas, tekst: `Blisko rekordu: ${s.nazwa}` });
      else out.push({ typ: 'zwykly', s, czas: x.czas, tekst: s.nazwa });
    }
    return out.sort((a, b) => (a.typ === 'pr' ? -1 : 0) - (b.typ === 'pr' ? -1 : 0));
  };

  // ───── klocki ─────
  A.licz = (el, v, fmt, czas = 900) => {
    if (W.ruchOgraniczony()) { el.textContent = fmt(v); return; }
    const t0 = performance.now(); const krok = (t) => { const p = Math.min(1, (t - t0) / czas), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(v * e); if (p < 1) requestAnimationFrame(krok); else el.textContent = fmt(v); }; requestAnimationFrame(krok);
  };
  A.pasek = (udzial, klasa) => { const i = h('i', { style: { width: '0%' } }); const el = h('div', { class: 'pasek-postepu ' + (klasa || ''), role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(udzial * 100) }, i); requestAnimationFrame(() => requestAnimationFrame(() => { i.style.width = (clamp(udzial, 0, 1) * 100).toFixed(1) + '%'; })); return el; };
  // pierścienie: [{udzial, klasa}] od zewnątrz do środka
  A.pierscienie = (lista, o) => {
    o = Object.assign({ rozmiar: 150, grubosc: 16, odstep: 4, gradienty: null }, o);
    const R = o.rozmiar, svg = W.svg('svg', { width: R, height: R, viewBox: `0 0 ${R} ${R}`, class: 'pierscienie', 'aria-hidden': 'true' });
    if (o.gradienty) { const defs = W.svg('defs', null, svg); o.gradienty.forEach((g, i) => { const lg = W.svg('linearGradient', { id: g.id, x1: 0, y1: 0, x2: 1, y2: 1 }, defs); W.svg('stop', { offset: 0, 'stop-color': g.od }, lg); W.svg('stop', { offset: 1, 'stop-color': g.do }, lg); }); }
    lista.forEach((p, i) => {
      const r = R / 2 - o.grubosc / 2 - i * (o.grubosc + o.odstep), obw = 2 * Math.PI * r;
      W.svg('circle', { cx: R / 2, cy: R / 2, r, fill: 'none', 'stroke-width': o.grubosc, class: 'pierscien-tor ' + (p.klasa || '') }, svg);
      const luk = W.svg('circle', { cx: R / 2, cy: R / 2, r, fill: 'none', 'stroke-width': o.grubosc, 'stroke-linecap': 'round', class: 'pierscien ' + (p.klasa || ''), 'stroke-dasharray': `0 ${obw}`, transform: `rotate(-90 ${R / 2} ${R / 2})`, stroke: p.gradient ? `url(#${p.gradient})` : null }, svg);
      requestAnimationFrame(() => requestAnimationFrame(() => luk.setAttribute('stroke-dasharray', `${Math.max(0.001, clamp(p.udzial, 0, 1)) * obw} ${obw}`)));
    });
    return svg;
  };
  // miniatura trasy
  const cacheTras = new Map();
  A.mapka = (j, o) => {
    o = Object.assign({ w: 120, h: 90, pad: 8, drogi: false }, o);
    const pts = K.trasaJazdy(j); if (!pts) return null;
    const svg = W.svg('svg', { viewBox: `0 0 ${o.w} ${o.h}`, class: 'mapka', preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' });
    const r = W.rzut(W.bbox(pts, 0.3), o.w, o.h, o.pad);
    if (o.drogi) { const bb = W.bbox(pts, 2); for (const d of K.mapa.drogi) if (d.pts.some((p) => p[0] > bb[0] && p[0] < bb[2] && p[1] > bb[1] && p[1] < bb[3])) W.svg('path', { d: 'M' + d.pts.map((p) => r(p).map((v) => v.toFixed(1)).join(',')).join('L'), class: 'mapka-droga' }, svg); }
    let d = cacheTras.get(j.id + ':' + o.w + 'x' + o.h);
    if (!d) { d = 'M' + pts.filter((_, i) => i % 2 === 0).map((p) => r(p).map((v) => v.toFixed(1)).join(',')).join('L'); cacheTras.set(j.id + ':' + o.w + 'x' + o.h, d); }
    if (o.cien) W.svg('path', { d, class: 'mapka-cien' }, svg);
    W.svg('path', { d, class: 'mapka-trasa' }, svg);
    const s = r(pts[0]); W.svg('circle', { cx: s[0], cy: s[1], r: 3, class: 'mapka-start' }, svg);
    return svg;
  };

  // ───── szkielet: ekrany i zakładki ─────
  A.aplikacja = function (o) {
    const root = document.querySelector('.apka');
    const ekrany = h('div', { class: 'ekrany' });
    const pasek = h('nav', { class: 'pasek-zakladek', 'aria-label': 'Zakładki' });
    root.append(ekrany, pasek);
    const sekcje = {}, przyciski = {};
    for (const z of o.zakladki) {
      const sek = h('section', { class: 'ekran', 'data-ekran': z.id, 'aria-label': z.nazwa, tabindex: -1 });
      ekrany.append(sek); sekcje[z.id] = sek;
      const b = h('button', { type: 'button', 'aria-label': z.nazwa }, h('span', { class: 'zak-ikona' }, A.ik(z.ikona, o.wagaIkon || 'regular', 'nieakt'), A.ik(z.ikona, 'fill', 'akt')), h('span', { class: 'zak-nazwa', text: z.nazwa }));
      b.addEventListener('click', () => { if (location.hash !== '#' + z.id) location.hash = z.id; else sek.scrollTo({ top: 0, behavior: 'smooth' }); });
      pasek.append(b); przyciski[z.id] = b;
    }
    const narysowane = new Set();
    let biezacy = null;
    const pokaz = (id) => {
      if (!sekcje[id]) id = o.zakladki[0].id;
      if (!narysowane.has(id)) { o.ekrany[id](sekcje[id]); narysowane.add(id); if (W.typografia) W.typografia(sekcje[id]); }
      for (const k in sekcje) { sekcje[k].classList.toggle('aktywny', k === id); przyciski[k].classList.toggle('aktywna', k === id); if (k === id) przyciski[k].setAttribute('aria-current', 'page'); else przyciski[k].removeAttribute('aria-current'); }
      if (biezacy && biezacy !== id) A.zamknijArkusz(true);
      biezacy = id;
      document.title = `${o.zakladki.find((z) => z.id === id).nazwa} · ${o.tytul}`;
      if (o.poZmianie) o.poZmianie(id);
    };
    global.addEventListener('hashchange', () => { const id = location.hash.slice(1); if (sekcje[id]) pokaz(id); });
    pokaz(location.hash.slice(1));
    return { root, sekcje, pokaz, przejdz: (id) => { location.hash = id; } };
  };

  // ───── arkusz od dołu ─────
  let otwarty = null;
  A.arkusz = function (tresc, o) {
    o = o || {};
    if (otwarty) A.zamknijArkusz(true);
    const root = document.querySelector('.apka');
    const poprzedniFokus = document.activeElement;
    const tlo = h('div', { class: 'arkusz-tlo' });
    const zamknij = h('button', { class: 'arkusz-zamknij', type: 'button', 'aria-label': 'Zamknij' }, A.ik('x', 'bold'));
    const uchwyt = h('div', { class: 'arkusz-uchwyt', 'aria-hidden': 'true' });
    const wnetrze = h('div', { class: 'arkusz-tresc' });
    const panel = h('div', { class: 'arkusz ' + (o.klasa || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': o.tytul || 'Szczegóły' }, uchwyt, zamknij, wnetrze);
    root.append(tlo, panel);
    wnetrze.append(typeof tresc === 'function' ? tresc() : tresc);
    if (W.typografia) W.typografia(wnetrze);
    requestAnimationFrame(() => requestAnimationFrame(() => { tlo.classList.add('otwarty'); panel.classList.add('otwarty'); }));
    history.pushState({ arkusz: true }, '', location.href);
    otwarty = { tlo, panel, poprzedniFokus, wHistorii: true };
    setTimeout(() => zamknij.focus({ preventScroll: true }), 60);
    const zamknijPrzezHistorie = () => { if (otwarty && otwarty.wHistorii) history.back(); else A.zamknijArkusz(); };
    zamknij.addEventListener('click', zamknijPrzezHistorie);
    tlo.addEventListener('click', zamknijPrzezHistorie);
    // przeciąganie w dół
    let y0 = null, dy = 0;
    const start = (e) => { if (wnetrze.scrollTop > 0 && e.currentTarget === wnetrze) return; y0 = e.clientY; dy = 0; panel.classList.add('ciagniety'); };
    const ruch = (e) => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); panel.style.transform = `translateY(${dy}px)`; };
    const koniec = () => { if (y0 == null) return; panel.classList.remove('ciagniety'); panel.style.transform = ''; if (dy > 110) zamknijPrzezHistorie(); y0 = null; };
    uchwyt.addEventListener('pointerdown', (e) => { uchwyt.setPointerCapture(e.pointerId); start(e); });
    uchwyt.addEventListener('pointermove', ruch); uchwyt.addEventListener('pointerup', koniec); uchwyt.addEventListener('pointercancel', koniec);
    return panel;
  };
  A.zamknijArkusz = function (natychmiast) {
    if (!otwarty) return;
    const { tlo, panel, poprzedniFokus } = otwarty;
    otwarty = null;
    tlo.classList.remove('otwarty'); panel.classList.remove('otwarty');
    const usun = () => { tlo.remove(); panel.remove(); };
    if (natychmiast || W.ruchOgraniczony()) usun(); else setTimeout(usun, 460);
    if (poprzedniFokus && poprzedniFokus.focus) poprzedniFokus.focus({ preventScroll: true });
  };
  global.addEventListener('popstate', () => { if (otwarty) { otwarty.wHistorii = false; A.zamknijArkusz(); } });
  global.addEventListener('keydown', (e) => { if (e.key === 'Escape' && otwarty) { if (otwarty.wHistorii) history.back(); else A.zamknijArkusz(); } });

  // ───── szczegóły jazdy (treść arkusza) ─────
  A.szczegolyJazdy = function (j, o) {
    o = Object.assign({ kmMarkery: 10, klasaMapy: '' }, o);
    const P = K.ostatnia.probki, glowna = j.id === K.ostatnia.jazda.id;
    const box = h('div', { class: 'sj' });
    box.append(h('div', { class: 'sj-nag' },
      h('p', { class: 'sj-kiedy', text: `${A.wielka(f.dzienTyg(j.data))}, ${f.data(j.data)} · ${f.godzina(j.data)}` }),
      h('h2', { class: 'sj-tytul', text: j.nazwa.replace('Zwift · ', '') }),
      h('p', { class: 'sj-typ' }, A.ik(j.typ === 'zwift' ? 'monitor-play' : 'bicycle', 'fill'), j.typ === 'zwift' ? 'Zwift · trenażer' : 'Szosa · start w Konstancinie')));
    let mapa = null, wyk = [];
    if (j.typ === 'szosa') {
      const m = h('div', { class: 'sj-mapa ' + o.klasaMapy });
      box.append(m);
      const trasa = glowna ? P.x.map((x, i) => [x, P.y[i]]) : K.trasaJazdy(j);
      const sync = (i) => { if (mapa) mapa.kursor(i); wyk.forEach((w) => w.ustawKursor(i)); };
      requestAnimationFrame(() => { mapa = W.mapaTrasy(m, Object.assign({ mapa: K.mapa, trasa, segmenty: glowna ? P.segmenty : [], km: glowna ? o.kmMarkery : 0, etykietaStartu: 'Start', polnoc: false, skalaKm: 2, pad: 22, margines: 1.2, poswiata: true, onHover: glowna ? sync : null, opis: 'Mapa trasy' }, o.mapa || {})); });
      box._sync = sync;
    }
    const st = j.typ === 'zwift'
      ? [['Dystans', f.km(j.km), 'km'], ['Czas', f.czas(j.czas), ''], ['Śr. moc', String(j.moc), 'W'], ['NP', String(j.mocNP), 'W'], ['Tętno', String(j.tetno), 'bpm'], ['Kalorie', f.liczba(j.kcal), 'kcal']]
      : [['Dystans', f.km(j.km), 'km'], ['Czas', f.czas(j.czas), ''], ['Średnia', f.liczba(j.predkosc, 1), 'km/h'], ['Tętno', String(j.tetno), 'bpm'], ['W górę', f.liczba(j.przewyzszenie), 'm'], ['Kalorie', f.liczba(j.kcal), 'kcal']];
    box.append(h('dl', { class: 'sj-staty' }, st.map(([l, v, u]) => h('div', { class: 'sj-stat' }, h('dt', { text: l }), h('dd', null, v, u ? h('small', { text: u }) : '')))));
    if (glowna) {
      const prof = h('div', { class: 'sj-profil' });
      box.append(h('h3', { class: 'sj-h', text: 'Profil trasy' }), prof);
      const maxKm = P.d[P.d.length - 1], e0 = Math.floor((Math.min(...P.ele) - 4) / 10) * 10, e1 = Math.ceil((Math.max(...P.ele) + 6) / 10) * 10;
      requestAnimationFrame(() => {
        wyk.push(W.linie(prof, { wys: 110, m: { l: 30, r: 4, t: 8, b: 20 }, krzywa: 'linia', siatka: true, serie: [{ pts: P.d.map((k, i) => [k, P.ele[i]]), klasa: 's-teren', obszar: true, obszarOd: e0 }], x: { min: 0, max: maxKm, ticki: [0, 20, 40, 60].filter((v) => v <= maxKm).map((v) => ({ v, s: v + ' km', kotwica: v === 0 ? 'start' : 'middle' })) }, y: { min: e0, max: e1, ticki: [e0, e1], format: (v) => v + ' m' },
          tlo: ({ g, x, m, H }) => { for (const s of P.segmenty) W.svg('rect', { x: x(s.od), y: m.t, width: Math.max(3, x(s.do) - x(s.od)), height: H - m.t - m.b, class: 'wk-pasmo' }, g); },
          tip: (i) => [W.wierszTip(f.liczba(P.d[i], 1) + ' km', ''), W.wierszTip(f.liczba(P.v[i], 1) + ' km/h', 'prędkość'), W.wierszTip(P.hr[i] + ' bpm', 'tętno'), W.wierszTip(f.liczba(P.ele[i]) + ' m', 'wysokość')],
          naHover: (i) => box._sync && box._sync(i), opis: 'Profil wysokości' }));
      });
      const odc = K.ostatnia.odcinki, mx = Math.max(...odc.map((x) => x.predkosc));
      box.append(h('h3', { class: 'sj-h', text: 'Co 5 km' }), h('ol', { class: 'sj-odcinki' }, odc.map((x) => h('li', { class: x.predkosc === mx ? 'naj' : '' }, h('span', { class: 'o-km', text: `${f.liczba(x.od)}–${f.liczba(x.do)}` }), h('span', { class: 'o-tor' }, h('i', { style: { width: (40 + 60 * (x.predkosc - 22) / (mx - 22)).toFixed(0) + '%' } })), h('span', { class: 'o-v', text: f.liczba(x.predkosc, 1) }), h('span', { class: 'o-hr', text: x.tetno + ' bpm' })))));
    }
    const os = A.osiagniecia(j);
    if (os.length) box.append(h('h3', { class: 'sj-h', text: 'Segmenty' }), h('ul', { class: 'sj-segmenty' }, os.map((x) => h('li', { class: 'seg-' + x.typ },
      h('span', { class: 'sg-ik' }, A.ik(x.typ === 'pr' ? 'trophy' : x.typ === 'blisko' ? 'star' : 'path', x.typ === 'zwykly' ? 'regular' : 'fill')),
      h('span', { class: 'sg-n' }, x.s.nazwa, h('small', { text: x.typ === 'pr' ? 'nowy rekord!' : x.typ === 'blisko' ? `${x.czas - x.s.pr} s od rekordu` : `rekord ${f.tempoSeg(x.s.pr)}` })),
      h('span', { class: 'sg-c', text: f.tempoSeg(x.czas) })))));
    if (j.typ === 'zwift') box.append(h('p', { class: 'sj-uwaga', text: 'Moc zmierzona przez trenażer. Na szosie nie mamy miernika, więc tam watów nie podajemy.' }));
    return box;
  };

  global.A = A;
})(window);
