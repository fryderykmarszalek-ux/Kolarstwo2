/*
 * Kolarstwo 2 — runda 3: wspólne widoki szerokiej strony (poziom TrainingPeaks).
 * Kalendarz, analiza jazdy z zaznaczaniem fragmentu, wykres formy, objętość, moc, strefy,
 * rekordy, tabele jazd i segmentów. Wygląd z tokenów --s-* w CSS stylu.
 */
(function (global) {
  'use strict';
  const K = global.K2, f = K.fmt, h = W.h, ik = A.ik;
  const S = {};
  const kluczD = (d) => d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
  const D = (y, m, d) => new Date(y, m - 1, d);
  const jazdyDnia = new Map();
  K.jazdy.forEach((j) => { const k = kluczD(j.data); if (!jazdyDnia.has(k)) jazdyDnia.set(k, []); jazdyDnia.get(k).push(j); });
  const dniMap = new Map(K.dni.map((o) => [kluczD(o.data), o]));
  S.jazdyDnia = (d) => jazdyDnia.get(kluczD(d)) || [];
  S.dzien = (d) => dniMap.get(kluczD(d));
  S.przyszly = (d) => d > K.dzis && kluczD(d) !== kluczD(K.dzis);
  S.dzisiaj = (d) => kluczD(d) === kluczD(K.dzis);
  const nazwa = (j) => j.nazwa.replace('Zwift · ', '');

  // plan — przykładowy szkic na najbliższe dni (jutro z propozycji)
  S.plan = [
    { data: D(2026, 11, 8), tytul: A.propozycja.tytul, opis: `${A.propozycja.czas} · ${A.propozycja.strefa.split(' ·')[0]}`, typ: 'szosa' },
    { data: D(2026, 11, 10), tytul: 'Wytrzymałość', opis: '60 min · Z2 · Zwift', typ: 'zwift' },
    { data: D(2026, 11, 12), tytul: 'Tempo 3 × 10 min', opis: '75 min · Z3 · Zwift', typ: 'zwift' },
    { data: D(2026, 11, 14), tytul: 'Długa jazda', opis: '80 km · Z2', typ: 'szosa' },
    { data: D(2026, 11, 15), tytul: 'Regeneracja', opis: '45 min · Z1', typ: 'szosa' },
  ];
  S.planDnia = (d) => S.plan.filter((p) => kluczD(p.data) === kluczD(d));
  // struktura jutrzejszego treningu: [minuty, strefa]
  S.bloki = ({
    przeciazenie: [],
    trening: [[10, 1], [42, 2], [8, 1]],
    neutralny: [[15, 2], [10, 3], [5, 1], [10, 3], [5, 1], [10, 3], [25, 2], [10, 1]],
    swiezy: [[15, 2], [5, 4], [3, 1], [5, 4], [3, 1], [5, 4], [3, 1], [5, 4], [3, 1], [5, 4], [15, 2], [8, 1]],
  })[K.forma.klucz] || [];
  const NZ = ['', 'regeneracja', 'wytrzymałość', 'tempo', 'próg', 'VO₂max'];
  S.profilTreningu = (bloki, o) => {
    o = o || {};
    bloki = bloki || S.bloki;
    const suma = bloki.reduce((a, b) => a + b[0], 0);
    if (!suma) return h('div', { class: 's-pusty', text: 'Dzień wolny — bez treningu.' });
    let t = 0;
    const os = []; for (let m = 0; m <= suma; m += suma > 70 ? 15 : 10) os.push(h('span', { style: { left: (m / suma * 100) + '%' }, text: m ? m + '′' : '0' }));
    return h('div', { class: 's-profil-w' }, h('div', { class: 's-profil', role: 'img', 'aria-label': 'Struktura treningu: ' + bloki.map(([m, z]) => `${m} min Z${z}`).join(', ') }, bloki.map(([m, z]) => { const el = h('i', { class: 'z' + z, style: { flexGrow: m, height: (12 + z * 17.6) + '%' }, title: `${t}–${t + m} min · Z${z} ${NZ[z]}` }); t += m; return el; })), o.os === false ? null : h('div', { class: 's-profil-os' }, os));
  };

  // ───── drobne klocki ─────
  S.idzDo = (j) => { location.hash = 'analiza/' + j.id; };
  S.klik = (el, fn) => { el.addEventListener('click', fn); el.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target === el) { e.preventDefault(); fn(); } }); return el; };
  // data-krotko: to, co zostaje w kalendarzu na telefonie (kilometry jazdy / strefa planu) — web.css
  S.wpis = (j) => { const b = h('button', { type: 'button', class: 's-wpis ' + j.typ, title: j.nazwa, 'data-jazda': j.id, 'data-krotko': String(Math.round(j.km)) }, h('b', { text: nazwa(j) }), h('small', { text: `${f.km(j.km)} km · ${f.czasHM(j.czas).replace(' min', '')}${j.moc ? ' · ' + j.moc + ' W' : ''}` })); b.addEventListener('click', () => S.idzDo(j)); return b; };
  S.wpisPlan = (p) => h('div', { class: 's-wpis plan', title: 'Plan (przykład)', 'data-krotko': (p.opis.match(/Z\d/) || ['wolne'])[0] }, h('b', { text: p.tytul }), h('small', { text: 'plan · ' + p.opis }));
  S.karta = (tytul, o, ...tresc) => {
    o = o || {};
    const nag = tytul || o.akcje ? h('div', { class: 's-karta-nag' }, h('div', null, tytul ? h('h2', { class: 's-karta-t' }, o.ikona ? ik(o.ikona) : null, tytul) : null, o.opis ? h('p', { class: 's-karta-o', text: o.opis }) : null), o.akcje ? h('div', { class: 's-akcje' }, o.akcje) : null) : null;
    return h('section', { class: 's-karta ' + (o.klasa || ''), id: o.id || null }, nag, ...tresc);
  };
  S.przel = (opcje, aktywny, fn, etykieta) => {
    const bs = opcje.map((o) => { const b = h('button', { type: 'button', 'aria-pressed': String(o.k === aktywny), text: o.s }); b.addEventListener('click', () => { bs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); fn(o.k); }); return b; });
    return h('div', { class: 's-przel', role: 'group', 'aria-label': etykieta || 'Wybór' }, bs);
  };
  S.legenda = (lista) => h('div', { class: 's-legenda' }, lista.map(([kol, t, linia]) => h('span', null, h('i', { class: linia ? 'linia' : '', style: { background: kol } }), t)));

  // ───── router ─────
  S.router = function (o) {
    function idz() {
      const [id0, arg] = decodeURIComponent(location.hash.slice(1)).split('/');
      const id = o.widoki[id0] ? id0 : o.domyslny;
      o.kontener.replaceChildren();
      const host = h('div', { class: 's-widok s-wejscie', 'data-id': id });
      o.kontener.append(host);
      o.widoki[id](host, arg);
      if (W.typografia) W.typografia(host);
      document.querySelectorAll('[data-widok]').forEach((a) => { const on = a.dataset.widok === id; a.classList.toggle('aktywny', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      if (!o.bezPrzewijania) global.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });
      document.title = `${(o.tytuly && o.tytuly[id]) || id} · ${o.tytul}`;
      if (o.poZmianie) o.poZmianie(id, arg);
    }
    global.addEventListener('hashchange', idz);
    idz();
  };

  // ───── kafle okresu ─────
  S.kafle = function (host, okres) {
    const tyg = (o) => Math.max(1, (o.do - o.od) / 86400000 / 7);
    const POLA = [
      { k: 'km', l: 'Dystans', u: 'km', v: (o) => f.km(o.km), d: 'p', s: (o) => `${f.km(o.km / tyg(o))} km tygodniowo` },
      { k: 'czas', l: 'Czas jazdy', u: 'h', v: (o) => f.liczba(o.czas / 3600, 1), d: 'p', s: (o) => `${f.liczba(o.czas / 3600 / tyg(o), 1)} h tygodniowo` },
      { k: 'przewyzszenie', l: 'W górę', u: 'm', v: (o) => f.liczba(o.przewyzszenie), d: 'p', s: (o) => `${f.liczba(o.przewyzszenie / Math.max(1, o.km) * 10, 1)} m na 10 km` },
      { k: 'jazdy', l: 'Jazdy', u: '', v: (o) => String(o.jazdy), d: 'a', s: (o) => `${o.szosa} szosa · ${o.zwift} Zwift` },
      { k: 'predkosc', l: 'Średnia', u: 'km/h', v: (o) => f.liczba(o.predkosc, 1), d: 'a1', s: () => 'szosa i Zwift razem' },
      { k: 'obciazenie', l: 'Obciążenie', u: 'pkt', v: (o) => f.liczba(o.obciazenie), d: 'p', s: (o) => `${f.liczba(o.obciazenie / tyg(o))} pkt tygodniowo` },
    ];
    const el = h('div', { class: 's-kafle' }); host.append(el);
    const trend = (k, klucz) => (k === 'tydzien' ? K.tygodnie.slice(-12) : k === 'miesiac' ? K.miesiace.slice(-12) : K.miesiace).map((o) => o[klucz]);
    const ustaw = (k) => {
      const o = K.okresy[k], pr = o.poprzedni;
      el.replaceChildren(...POLA.map((p) => {
        let d;
        if (pr && pr[p.k] != null) {
          const ch = p.d === 'p' ? (pr[p.k] ? (o[p.k] - pr[p.k]) / pr[p.k] : 0) : o[p.k] - pr[p.k];
          const s = p.d === 'p' ? `${f.liczba(Math.abs(ch) * 100)}%` : p.d === 'a1' ? f.liczba(Math.abs(ch), 1) : String(Math.abs(ch));
          d = h('div', { class: 's-kafel-d' }, h('b', { class: ch >= 0 ? 'gora' : 'dol', text: (ch >= 0 ? '▲ ' : '▼ ') + s }), ` vs ${pr.etykieta}`);
        } else d = h('div', { class: 's-kafel-d', text: p.s(o) });
        return h('div', { class: 's-kafel' }, h('div', { class: 's-kafel-l' }, h('span', { text: p.l }), W.sparkline(trend(k, p.k), { szer: 54, wys: 18, krzywa: 'linia' })), h('div', { class: 's-kafel-v' }, p.v(o), p.u ? h('small', { text: p.u }) : ''), d);
      }));
    };
    ustaw(okres || 'tydzien');
    return { ustaw };
  };

  // ───── tydzień z planem ─────
  S.tydzien = function (host, od) {
    od = od || K.okresy.tydzien.od;
    const dni = Array.from({ length: 7 }, (_, k) => new Date(od.getFullYear(), od.getMonth(), od.getDate() + k));
    let km = 0, czas = 0, obc = 0, n = 0;
    const el = h('div', { class: 's-tydz' });
    dni.forEach((d) => {
      const jj = S.jazdyDnia(d), pl = S.przyszly(d) || S.dzisiaj(d) ? S.planDnia(d) : [];
      jj.forEach((j) => { km += j.km; czas += j.czas; obc += j.obciazenie; n++; });
      el.append(h('div', { class: 's-td' + (S.dzisiaj(d) ? ' dzis' : '') }, h('div', { class: 's-td-g' }, h('span', { text: f.dzienTygKr(d) }), h('span', { text: f.dataKrotka(d) })), jj.map(S.wpis), pl.map(S.wpisPlan)));
    });
    el.append(h('div', { class: 's-td-suma' }, h('span', { text: 'Tydzień' }), h('b', { text: f.liczba(km) + ' km' }), h('div', { class: 'w' }, 'Czas', h('strong', { text: f.czasHM(czas).replace(' min', '') })), h('div', { class: 'w' }, 'Jazdy', h('strong', { text: String(n) })), h('div', { class: 'w' }, 'Obciążenie', h('strong', { text: f.liczba(obc) }))));
    host.append(el);
    return el;
  };

  // ───── kalendarz miesiąca ─────
  S.kalendarz = function (host, o) {
    o = o || {};
    let ref = o.miesiac || new Date(K.dzis.getFullYear(), K.dzis.getMonth(), 1);
    const MIN = new Date(2025, 7, 1), MAX = new Date(2026, 11, 1);
    const maxTyg = Math.max(...K.tygodnie.map((t) => t.km));
    const nag = h('div', { class: 's-kal-nag' }), siatka = h('div', { class: 's-kal', role: 'grid', 'aria-label': 'Kalendarz treningów' });
    host.append(nag, siatka);
    function rysuj() {
      const r = ref.getFullYear(), m = ref.getMonth();
      const pierwszy = new Date(r, m, 1), start = new Date(r, m, 1 - ((pierwszy.getDay() + 6) % 7));
      const ost = new Date(r, m + 1, 0), koniec = new Date(r, m + 1, 6 - ((ost.getDay() + 6) % 7));
      const wMies = K.jazdy.filter((j) => j.data.getFullYear() === r && j.data.getMonth() === m);
      const suma = (k) => wMies.reduce((a, j) => a + j[k], 0);
      const prev = h('button', { class: 's-btn ikona', type: 'button', 'aria-label': 'Poprzedni miesiąc' }, ik('caret-left', 'bold'));
      const next = h('button', { class: 's-btn ikona', type: 'button', 'aria-label': 'Następny miesiąc' }, ik('caret-right', 'bold'));
      const dzis = h('button', { class: 's-btn', type: 'button', text: 'Dziś' });
      prev.disabled = ref <= MIN; next.disabled = ref >= MAX;
      prev.addEventListener('click', () => { ref = new Date(r, m - 1, 1); rysuj(); });
      next.addEventListener('click', () => { ref = new Date(r, m + 1, 1); rysuj(); });
      dzis.addEventListener('click', () => { ref = new Date(K.dzis.getFullYear(), K.dzis.getMonth(), 1); rysuj(); });
      nag.replaceChildren(h('div', { class: 's-akcje', style: { gap: '14px' } }, h('h2', { text: `${f.miesiac(m)} ${r}` }), h('div', { class: 's-akcje', style: { gap: '6px' } }, prev, dzis, next)),
        h('div', { class: 's-kal-sumy' }, h('div', null, 'Dystans', h('b', { text: f.liczba(suma('km')) + ' km' })), h('div', null, 'Czas', h('b', { text: f.liczba(suma('czas') / 3600, 1) + ' h' })), h('div', null, 'Jazdy', h('b', { text: String(wMies.length) })), h('div', null, 'Obciążenie', h('b', { text: f.liczba(suma('obciazenie')) }))));
      siatka.replaceChildren(...['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'].map((d) => h('div', { class: 's-kal-dn', text: d })), h('div', { class: 's-kal-dn t', text: 'tydzień' }));
      for (let d = new Date(start); d <= koniec; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
        const dd = new Date(d), jj = S.jazdyDnia(dd), pl = S.przyszly(dd) || S.dzisiaj(dd) ? S.planDnia(dd) : [];
        const km = jj.reduce((a, j) => a + j.km, 0);
        siatka.append(h('div', { class: 's-kal-d' + (dd.getMonth() !== m ? ' poza' : '') + (S.dzisiaj(dd) ? ' dzis' : ''), role: 'gridcell' }, h('div', { class: 's-kal-nr' }, h('span', { text: String(dd.getDate()) }), h('span', { text: km ? f.liczba(km) + ' km' : '' })), jj.map(S.wpis), pl.map(S.wpisPlan)));
        if ((dd.getDay() + 6) % 7 === 6) {
          const od = new Date(dd.getFullYear(), dd.getMonth(), dd.getDate() - 6), tj = [];
          for (let k = 0; k < 7; k++) tj.push(...S.jazdyDnia(new Date(od.getFullYear(), od.getMonth(), od.getDate() + k)));
          const tk = tj.reduce((a, j) => a + j.km, 0), tc = tj.reduce((a, j) => a + j.czas, 0), to = tj.reduce((a, j) => a + j.obciazenie, 0);
          const dn = S.dzien(dd) || (od <= K.dzis ? K.dni[K.dni.length - 1] : null);
          const plany = []; for (let k = 0; k < 7; k++) { const d2 = new Date(od.getFullYear(), od.getMonth(), od.getDate() + k); if (S.przyszly(d2) || S.dzisiaj(d2)) plany.push(...S.planDnia(d2)); }
          const przyszlyT = od > K.dzis;
          siatka.append(h('div', { class: 's-kal-tydz' + (przyszlyT ? ' plan' : '') }, przyszlyT && plany.length ? h('span', { class: 'km', text: `${plany.length} w planie` }) : h('span', { class: 'km', text: tk ? f.liczba(tk) + ' km' : '—' }), h('div', { class: 'tor' }, h('i', { style: { width: (tk / maxTyg * 100).toFixed(0) + '%' } })),
            h('div', { class: 'w' }, 'czas', h('strong', { text: tc ? f.czasHM(tc).replace(' min', '') : '—' })), h('div', { class: 'w' }, 'obciążenie', h('strong', { text: to ? f.liczba(to) : '—' })), h('div', { class: 'w' }, 'forma', h('strong', { text: dn ? f.liczba(dn.ctl) : '—' }))));
        }
      }
      if (W.typografia) W.typografia(host);
    }
    rysuj();
  };

  // ───── wykres formy (PMC) ─────
  S.pmc = function (host, o) {
    o = o || {};
    let zakres = o.zakres || 180;
    const wys = o.wys || 260;
    const przel = S.przel([{ k: 90, s: '90 dni' }, { k: 180, s: '180 dni' }, { k: 365, s: 'Rok' }, { k: 9999, s: 'Całość' }], zakres, (k) => { zakres = k; rysuj(); }, 'Zakres wykresu formy');
    const glowny = h('div'), tsbHost = h('div', { class: 'wk', style: { marginTop: '8px' } });
    host.append(glowny, h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: '10px', font: '600 11.5px/1 var(--s-f)', color: 'var(--s-tekst-3)' } }, h('span', { text: 'Świeżość (TSB)' }), h('span', { text: 'powyżej zera: wypoczęty · poniżej: zmęczony' })), tsbHost);
    let api = null, tsbApi = null;
    function rysuj() {
      glowny.replaceChildren(); tsbHost.replaceChildren();
      const dni = K.dni.slice(-Math.min(zakres, K.dni.length));
      const co = dni.length > 200 ? 2 : 1;
      const ticki = []; dni.forEach((d, i) => { if (d.data.getDate() === 1 && (d.data.getMonth() % co === 0)) ticki.push({ v: i, s: f.miesiacKr(d.data.getMonth()) }); });
      api = W.linie(glowny, {
        wys, m: { l: 30, r: 10, t: 12, b: 24 },
        serie: [{ pts: dni.map((d, i) => [i, d.ctl]), klasa: 's-a', obszar: true, koniec: true }, { pts: dni.map((d, i) => [i, d.atl]), klasa: 's-b' }],
        x: { ticki }, y: { min: 0, ticki: 4, format: (v) => f.liczba(v) },
        tip: (i) => { const d = dni[i]; return [W.naglowekTip(`${f.dzienTygKr(d.data)} ${f.data(d.data)}`), W.wierszTip(f.liczba(d.ctl), 'forma (CTL)', 's-a'), W.wierszTip(f.liczba(d.atl), 'zmęczenie (ATL)'), W.wierszTip(f.znak(Math.round(d.ctl - d.atl)), 'świeżość (TSB)'), W.wierszTip(d.obciazenie ? f.liczba(d.obciazenie) : '—', 'obciążenie dnia')]; },
        naHover: (i) => tsbApi && tsbApi(i), opis: 'Forma i zmęczenie', znaczniki: o.znaczniki ? o.znaczniki(dni) : null,
      });
      let svg = null, sl = [];
      tsbApi = (i) => { sl.forEach((g, k) => g.classList.toggle('wk-aktywny', k === i)); if (svg) svg.classList.toggle('wk-hover', i >= 0); };
      W.rozmiar(tsbHost, (szer) => {
        if (svg) svg.remove();
        const H = 58, m = { l: 30, r: 10 };
        svg = W.svg('svg', { width: szer, height: H, class: 'wk-svg', role: 'img', 'aria-label': 'Świeżość dzień po dniu' }); tsbHost.prepend(svg);
        const mx = Math.max(25, ...dni.map((d) => Math.abs(d.ctl - d.atl))), y = W.skala(-mx, mx, H - 2, 2), p = (szer - m.l - m.r) / Math.max(1, dni.length - 1), w = Math.max(1, Math.min(p, 12) - (p > 3 ? 1 : 0));
        const cx = (i) => m.l + i * p - w / 2;
        W.svg('line', { x1: m.l, x2: szer - m.r, y1: y(0), y2: y(0), class: 'wk-baza' }, svg);
        sl = dni.map((d, i) => { const t = d.ctl - d.atl, g = W.svg('g', { class: 'wk-sl ' + (t >= 0 ? 'tsb-plus' : 'tsb-minus') }, svg); W.svg('path', { d: t >= 0 ? W.slupek(cx(i), y(t), w, y(0) - y(t), 1.5) : W.slupek(cx(i), y(0), w, y(t) - y(0), 1.5, true), class: 'wk-slupek' }, g); return g; });
        const hit = W.svg('rect', { x: m.l - p / 2, y: 0, width: szer - m.l - m.r + p, height: H, fill: 'transparent' }, svg);
        hit.addEventListener('pointermove', (e) => { const r = svg.getBoundingClientRect(); const i = Math.max(0, Math.min(dni.length - 1, Math.round((e.clientX - r.left - m.l) / p))); tsbApi(i); api.ustawKursor(i); });
        hit.addEventListener('pointerleave', () => { tsbApi(-1); api.ustawKursor(-1); });
      });
    }
    rysuj();
    return { przel, ustaw(k) { zakres = k; rysuj(); } };
  };

  // ───── objętość ─────
  const tygTyp = K.tygodnie.map((t) => { const od = t.od, doo = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 7), jj = K.jazdy.filter((j) => j.data >= od && j.data < doo); const s = (typ, k) => jj.filter((j) => j.typ === typ).reduce((a, j) => a + j[k], 0); return { od, biezacy: t.biezacy, jazdy: t.jazdy, km: [s('szosa', 'km'), s('zwift', 'km')], czas: [s('szosa', 'czas') / 3600, s('zwift', 'czas') / 3600] }; });
  const miesTyp = K.miesiace.map((ms) => { const jj = K.jazdy.filter((j) => j.data.getFullYear() === ms.rok && j.data.getMonth() === ms.miesiac - 1); const s = (typ, k) => jj.filter((j) => j.typ === typ).reduce((a, j) => a + j[k], 0); return { od: ms.od, biezacy: ms.biezacy, jazdy: ms.jazdy, km: [s('szosa', 'km'), s('zwift', 'km')], czas: [s('szosa', 'czas') / 3600, s('zwift', 'czas') / 3600] }; });
  S.objetosc = function (host, o) {
    o = o || {};
    let tryb = o.tryb || 'tydzien', miara = 'km';
    const wyk = h('div'); host.append(wyk);
    let api = null;
    const dane = () => (tryb === 'tydzien' ? tygTyp.slice(-(o.ile || 26)) : miesTyp).map((w) => {
      const [a, b] = w[miara], fm = (v) => (miara === 'km' ? f.liczba(v) : f.liczba(v, 1)), u = miara === 'km' ? ' km' : ' h';
      return { v: a + b, klasa: w.biezacy ? 'akcent' : '', czesci: [{ v: a, klasa: 'cz-szosa' }, { v: b, klasa: 'cz-zwift' }], tip: () => [W.naglowekTip(tryb === 'tydzien' ? `tydzień od ${f.dataKrotka(w.od)}` : `${f.miesiac(w.od.getMonth())} ${w.od.getFullYear()}`), W.wierszTip(fm(a + b) + u, 'razem'), W.wierszTip(fm(a) + u, 'szosa', 's-szosa'), W.wierszTip(fm(b) + u, 'Zwift', 's-z'), W.wierszTip(String(w.jazdy), 'jazd')] };
    });
    const etyk = (i) => { const arr = tryb === 'tydzien' ? tygTyp.slice(-(o.ile || 26)) : miesTyp; const od = arr[i].od; if (tryb === 'miesiac') return f.miesiacKr(od.getMonth()); const p = i ? arr[i - 1].od : null; return !p || p.getMonth() !== od.getMonth() ? f.miesiacKr(od.getMonth()) : null; };
    const rysuj = () => { if (!api) api = W.slupki(wyk, { wys: o.wys || 220, m: { l: 32, r: 4, t: 18, b: 24 }, maxSzer: tryb === 'tydzien' ? 16 : 28, promien: 4, odstep: 3, osY: { ticki: 4, format: (v) => f.liczba(v) }, osX: etyk, dane: dane(), wartosc: (d, i, arr) => null, opis: 'Objętość' }); else api.odswiez({ dane: dane(), maxSzer: tryb === 'tydzien' ? 16 : 28, osX: etyk }); };
    rysuj();
    const przel = h('div', { class: 's-akcje' }, S.przel([{ k: 'tydzien', s: 'Tygodnie' }, { k: 'miesiac', s: 'Miesiące' }], tryb, (k) => { tryb = k; rysuj(); }, 'Okres'), S.przel([{ k: 'km', s: 'km' }, { k: 'czas', s: 'godz.' }], miara, (k) => { miara = k; rysuj(); }, 'Miara'));
    return { przel };
  };

  // ───── krzywa mocy, strefy, rekordy ─────
  S.krzywaMocy = function (host, o) {
    const M = K.moc;
    W.linie(host, { wys: (o && o.wys) || 220, m: { l: 34, r: 12, t: 12, b: 24 }, serie: [{ pts: M.czasy.map((c, i) => [c, M.wszech[i]]), klasa: 's-a', obszar: true, obszarOd: 100 }, { pts: M.czasy.map((c, i) => [c, M.ostatnie42[i]]), klasa: 's-b' }],
      x: { skala: 'log', min: 5, max: 3600, linie: true, ticki: [[5, '5 s'], [15, '15 s'], [60, '1 min'], [300, '5 min'], [1200, '20 min'], [3600, '60 min']].map(([v, s], k) => ({ v, s, kotwica: k === 0 ? 'start' : k === 5 ? 'end' : 'middle' })) },
      y: { min: 100, max: 900, ticki: [100, 300, 500, 700, 900], format: (v) => v },
      tip: (i) => [W.naglowekTip(M.etykiety[i]), W.wierszTip(M.wszech[i] + ' W', 'najlepiej', 's-a'), M.ostatnie42[i] != null ? W.wierszTip(M.ostatnie42[i] + ' W', 'ostatnie 42 dni') : W.wierszTip('—', 'brak próby')], opis: 'Krzywa mocy' });
  };
  S.strefy = function (host, strefy) {
    strefy = strefy || K.strefy;
    const mx = Math.max(...strefy.map((z) => z.udzial));
    host.append(...strefy.map((z) => h('div', { class: 's-strefy-w' }, h('b', { text: 'Z' + z.nr }), h('div', { class: 'tor', title: z.nazwa }, h('i', { class: 'z' + z.nr, style: { width: (z.udzial / mx * 100).toFixed(1) + '%' } })), h('span', { class: 'p', text: f.procent(z.udzial) }), h('span', { class: 'c', text: f.czasHM(z.czas) }))));
  };
  const IKR = { dystans: 'path', predkosc: 'lightning', przewyzszenie: 'mountains', tydzien: 'calendar-blank', moc20: 'barbell', tetno: 'heartbeat' };
  S.rekordy = function (host) {
    host.append(h('div', { class: 's-rekordy' }, K.rekordy.map((r) => S.klik(h('div', { class: 's-rek', role: r.jazda ? 'link' : null, tabindex: r.jazda ? 0 : null, style: r.jazda ? { cursor: 'pointer' } : null }, h('small', null, ik(IKR[r.klucz], 'fill'), r.nazwa), h('b', null, f.liczba(r.wartosc, r.jednostka === 'km/h' || r.klucz === 'dystans' ? 1 : 0), h('em', { text: r.jednostka })), h('span', { text: `${f.dataKrotka(r.data)} · ${r.opis}` })), () => { if (r.jazda) location.hash = 'analiza/' + r.jazda; }))));
  };

  // ───── tabela jazd ─────
  S.tabelaJazd = function (host, o) {
    o = Object.assign({ naStrone: 20, narzedzia: true }, o);
    let sort = 'data', kier = -1, typ = 'wszystkie', q = '', strona = 0;
    const KOL = [
      { k: 'data', s: 'Data', f: (j) => `${f.dzienTygKr(j.data)} ${f.dataNum(j.data)}` },
      { k: 'nazwa', s: 'Jazda' },
      { k: 'km', s: 'Dystans', num: 1, f: (j) => f.km(j.km) + ' km' },
      { k: 'czas', s: 'Czas', num: 1, f: (j) => f.czas(j.czas) },
      { k: 'predkosc', s: 'Średnia', num: 1, f: (j) => f.liczba(j.predkosc, 1) },
      { k: 'tetno', s: 'Tętno', num: 1, f: (j) => String(j.tetno) },
      { k: 'moc', s: 'Moc', num: 1, f: (j) => (j.moc ? j.moc + ' W' : '—') },
      { k: 'przewyzszenie', s: 'W górę', num: 1, f: (j) => f.liczba(j.przewyzszenie) + ' m' },
      { k: 'obciazenie', s: 'Obciążenie', num: 1 },
    ];
    const maxObc = Math.max(...K.jazdy.map((j) => j.obciazenie));
    const licznik = h('span', { class: 's-karta-o' });
    const szukaj = h('label', { class: 's-szukaj' }, ik('magnifying-glass'), h('input', { type: 'search', placeholder: 'Szukaj jazdy, np. Gassy, Zwift, wał…', 'aria-label': 'Szukaj jazdy' }));
    szukaj.querySelector('input').addEventListener('input', (e) => { q = e.target.value.toLowerCase(); strona = 0; rysuj(); });
    const narz = o.narzedzia ? h('div', { class: 's-narz', style: { marginBottom: '12px' } }, szukaj, S.przel([{ k: 'wszystkie', s: 'Wszystkie' }, { k: 'szosa', s: 'Szosa' }, { k: 'zwift', s: 'Zwift' }], typ, (k) => { typ = k; strona = 0; rysuj(); }, 'Rodzaj'), licznik) : null;
    const wrap = h('div', { class: 's-tab-wrap' }), stopka = h('div', { class: 's-stronicowanie' });
    host.append(...[narz, wrap, o.narzedzia ? stopka : null].filter(Boolean));
    function rysuj() {
      let lista = K.jazdy.filter((j) => (!o.filtr || o.filtr(j)) && (typ === 'wszystkie' || j.typ === typ) && (!q || j.nazwa.toLowerCase().includes(q)));
      lista = lista.slice().sort((a, b) => { const va = sort === 'data' ? a.data : sort === 'nazwa' ? a.nazwa : a[sort] || 0, vb = sort === 'data' ? b.data : sort === 'nazwa' ? b.nazwa : b[sort] || 0; return (va > vb ? 1 : va < vb ? -1 : 0) * kier; });
      licznik.textContent = `${lista.length} ${A.odm(lista.length, 'jazda', 'jazdy', 'jazd')} · ${f.liczba(lista.reduce((a, j) => a + j.km, 0))} km`;
      const ile = o.naStrone, stron = Math.max(1, Math.ceil(lista.length / ile)); strona = Math.min(strona, stron - 1);
      const widok = lista.slice(strona * ile, strona * ile + ile);
      const t = h('table', { class: 's-tab' }, h('thead', null, h('tr', null, KOL.map((c) => { const th = h('th', { class: (c.num ? 'num ' : '') + 'sort', scope: 'col', tabindex: 0, 'aria-sort': sort === c.k ? (kier > 0 ? 'ascending' : 'descending') : null, text: c.s }); S.klik(th, () => { if (sort === c.k) kier = -kier; else { sort = c.k; kier = c.k === 'nazwa' ? 1 : -1; } rysuj(); }); return th; }))),
        h('tbody', null, widok.map((j) => S.klik(h('tr', { tabindex: 0, 'aria-label': j.nazwa, 'data-jazda': j.id }, KOL.map((c) => {
          if (c.k === 'nazwa') return h('td', { class: 'nz' }, h('span', { class: 'kropka ' + j.typ }), nazwa(j), h('small', { text: j.typ === 'zwift' ? 'Zwift · trenażer' : `szosa · start ${f.godzina(j.data)}` }));
          if (c.k === 'obciazenie') return h('td', { class: 'num' }, h('span', { class: 'obc' }, h('i', { style: { width: Math.round(6 + 50 * j.obciazenie / maxObc) + 'px' } }), String(j.obciazenie)));
          return h('td', { class: c.num ? 'num' : '', text: c.f ? c.f(j) : j[c.k] });
        })), () => S.idzDo(j)))));
      wrap.replaceChildren(t);
      if (o.narzedzia) {
        const pr = h('button', { class: 's-btn', type: 'button' }, ik('caret-left', 'bold'), 'Nowsze'), nx = h('button', { class: 's-btn', type: 'button' }, 'Starsze', ik('caret-right', 'bold'));
        pr.disabled = strona === 0; nx.disabled = strona >= stron - 1;
        pr.addEventListener('click', () => { strona--; rysuj(); }); nx.addEventListener('click', () => { strona++; rysuj(); });
        stopka.replaceChildren(h('span', { text: `Strona ${strona + 1} z ${stron}` }), h('div', { class: 's-akcje' }, pr, nx));
      }
    }
    rysuj();
  };

  // ───── tabela segmentów ─────
  S.tabelaSegmentow = function (host, o) {
    o = o || {};
    const seg = K.segmenty.slice().sort((a, b) => b.historia.length - a.historia.length).slice(0, o.ile || 99);
    host.append(h('div', { class: 's-tab-wrap' }, h('table', { class: 's-tab' },
      h('thead', null, h('tr', null, ['Segment', 'Długość', 'Nachylenie', 'Próby', 'Rekord', 'Ostatnio', 'Strata', 'Przebieg'].map((s, i) => h('th', { class: i > 0 && i < 7 ? 'num' : '', text: s })))),
      h('tbody', null, seg.map((s) => { const r = s.ostatnia.czas - s.pr, cz = s.historia.map((x) => x.czas); return h('tr', { style: { cursor: 'default' } },
        h('td', { class: 'nz' }, h('span', { class: 'kropka ' + s.typ }), s.nazwa, h('small', { text: `rekord ${f.dataNum(s.prData)}${s.moc ? ' · ' + s.moc + ' W' : ''}` })),
        h('td', { class: 'num', text: s.dl >= 1000 ? f.liczba(s.dl / 1000, 2) + ' km' : s.dl + ' m' }), h('td', { class: 'num', text: f.liczba(s.nach, 1) + '%' }), h('td', { class: 'num', text: String(s.historia.length) }),
        h('td', { class: 'num', style: { fontWeight: 700 }, text: f.tempoSeg(s.pr) }), h('td', { class: 'num', text: f.tempoSeg(s.ostatnia.czas) }), h('td', { class: 'num', text: r <= 0 ? 'rekord' : '+' + r + ' s' }),
        h('td', null, W.sparkline(cz, { szer: 110, wys: 22, odwroc: true, najlepszy: cz.indexOf(Math.min(...cz)) }))); })))));
  };

  // ───── analiza jazdy ─────
  const STREFY = K.strefy;
  S.analiza = function (host, arg, o) {
    o = o || {};
    const j = (arg && K.jazdy.find((x) => x.id === +arg)) || K.ostatnia.jazda;
    const glowna = j.id === K.ostatnia.jazda.id, P = K.ostatnia.probki;
    const idx = K.jazdy.indexOf(j), poprz = K.jazdy[idx - 1], nast = K.jazdy[idx + 1];
    const bp = h('button', { class: 's-btn', type: 'button' }, ik('caret-left', 'bold'), 'Poprzednia'), bn = h('button', { class: 's-btn', type: 'button' }, 'Następna', ik('caret-right', 'bold'));
    bp.disabled = !poprz; bn.disabled = !nast;
    bp.addEventListener('click', () => S.idzDo(poprz)); bn.addEventListener('click', () => S.idzDo(nast));
    host.append(h('div', { class: 's-an-nag' }, h('div', null,
      h('div', { class: 's-okruszki' }, h('a', { href: '#jazdy', text: 'Jazdy' }), ik('caret-right', 'bold'), h('span', { text: f.dataNum(j.data) })),
      h('h1', { text: nazwa(j) }),
      h('div', { class: 'meta' }, h('span', { class: 's-chip ' + j.typ, text: j.typ === 'zwift' ? 'Zwift · trenażer' : 'Szosa' }), `${A.wielka(f.dzienTyg(j.data))}, ${f.data(j.data)} · start ${f.godzina(j.data)}`, j.typ === 'szosa' ? ' · Konstancin-Jeziorna' : '')),
      h('div', { class: 's-akcje' }, bp, bn)));
    const st = [['Dystans', f.km(j.km), 'km'], ['Czas', f.czas(j.czas), ''], j.typ === 'zwift' ? ['Śr. moc', String(j.moc), 'W'] : ['Średnia', f.liczba(j.predkosc, 1), 'km/h'], j.typ === 'zwift' ? ['NP', String(j.mocNP), 'W'] : (j.vMax ? ['Maks.', f.liczba(j.vMax, 1), 'km/h'] : ['Kadencja', String(j.kadencja), 'rpm']), ['Tętno śr.', String(j.tetno), 'bpm'], ['Tętno maks.', String(j.tetnoMax), 'bpm'], ['W górę', f.liczba(j.przewyzszenie), 'm'], ['Obciążenie', String(j.obciazenie), 'pkt']];
    host.append(h('div', { class: 's-karta', style: { marginBottom: '18px' } }, h('dl', { class: 's-an-staty' }, st.map(([l, v, u]) => h('div', null, h('dt', { text: l }), h('dd', null, v, u ? h('small', { text: u }) : ''))))));
    const siatka = h('div', { class: 's-siatka' }); host.append(siatka);

    if (!glowna) {
      const zew = o.mapaZew && j.typ === 'szosa';
      if (zew) o.mapaZew({ trasa: K.trasaJazdy(j), jazda: j });
      else if (o.mapaZew) o.mapaZew(null);
      const kM = zew ? null : S.karta(j.typ === 'zwift' ? 'Moc na trenażerze' : 'Trasa', { klasa: 's-c7' });
      if (kM && j.typ === 'szosa') { const m = h('div', { class: 's-mapa ' + (o.klasaMapy || '') }); kM.append(m); requestAnimationFrame(() => W.mapaTrasy(m, Object.assign({ mapa: K.mapa, trasa: K.trasaJazdy(j), km: 10, etykietaStartu: 'Start', pad: 24, margines: 1.2, poswiata: true, opis: 'Mapa trasy' }, o.mapa || {}))); }
      else if (kM) {
        const iG = K.moc.czasy.indexOf(3600), i20 = K.moc.czasy.indexOf(1200), naj = K.moc.wszech[iG], n20 = K.moc.wszech[i20];
        kM.append(h('div', { class: 's-wybor' }, [['Średnia moc', String(j.moc), 'W'], ['Moc znormalizowana', String(j.mocNP), 'W'], ['Czas', f.czasHM(j.czas).replace(' min', ''), j.czas < 3600 ? 'min' : '']].map(([l, v, u]) => h('div', null, h('small', { text: l }), h('b', null, v, u ? h('em', { text: u }) : '')))),
          h('div', { class: 's-por s-por-moc', style: { marginTop: '18px' } }, [['Ta jazda (NP)', j.mocNP], ['Najlepsze 60 min', naj], ['Najlepsze 20 min', n20]].map(([l, v], k) => h('div', { class: 's-por-w' }, h('span', { class: 's-por-l', text: l }), h('div', { class: 's-por-tor' }, h('i', { class: k ? 'sr' : 'ta', style: k ? { width: (v / n20 * 100).toFixed(1) + '%' } : { width: (v / n20 * 100).toFixed(1) + '%', top: '0', height: '14px', borderRadius: '4px' } })), h('b', { text: v + ' W' }), h('em', { text: k ? '' : f.procent(v / naj) + ' rekordu 60 min' })))),
          h('p', { class: 's-karta-o', style: { marginTop: '14px' }, text: 'Moc mierzy trenażer. Na szosie nie mamy miernika mocy, więc tam watów nie podajemy.' }));
      }
      const os = A.osiagniecia(j);
      const kS = S.karta('Segmenty', { klasa: kM ? 's-c5' : 's-c12', opis: os.length ? `${os.length} na tej jeździe` : 'brak segmentów' });
      kS.append(os.length ? listaSegmentow(os.map((x) => ({ s: x.s, czas: x.czas, typ: x.typ }))) : h('div', { class: 's-pusty', text: 'Na tej jeździe nie było ulubionych segmentów.' }),
        h('div', { class: 's-pusty', style: { marginTop: '14px' } }, h('b', { text: 'Strumienie sekunda po sekundzie' }), ' (tętno, prędkość, kadencja) pojawią się dla każdej jazdy po podpięciu Stravy. W wersji przykładowej ma je tylko ostatnia jazda.'));
      siatka.append(...[kM, kS].filter(Boolean));
      return;
    }

    // strumienie + zaznaczenie
    const trasa = P.x.map((x, i) => [x, P.y[i]]);
    const palcem = global.matchMedia && matchMedia('(hover: none)').matches; // iPad, telefon: nie ma „najechania”
    const kStr = S.karta('Przebieg jazdy', { klasa: 's-c12', opis: palcem ? 'Dotknij, żeby zobaczyć punkt na mapie. Przesuń palcem w poziomie, żeby zaznaczyć fragment.' : 'Najedź, żeby zobaczyć punkt na mapie. Przeciągnij, żeby zaznaczyć fragment.' });
    const odczyt = h('div', { class: 's-odczyt' }), strH = h('div', { class: 's-strumienie' });
    kStr.append(odczyt, strH);
    const kMapa = o.mapaZew ? null : S.karta('Trasa', { klasa: 's-c6' }), mapaEl = h('div', { class: 's-mapa ' + (o.klasaMapy || '') }); if (kMapa) kMapa.append(mapaEl);
    const tryb = h('div', { class: 's-odczyt-tryb' }), wybor = h('div', { class: 's-wybor' }), strefyZ = h('div', { style: { marginTop: '16px' } });
    const kZazn = S.karta('Zaznaczenie', { klasa: kMapa ? 's-c6' : 's-c12' }, tryb, h('div', { style: { height: '12px' } }), wybor, h('h3', { class: 's-karta-t', style: { marginTop: '18px', fontSize: '14px' } }, 'Strefy tętna w zaznaczeniu'), strefyZ);
    siatka.append(...[kStr, kMapa, kZazn].filter(Boolean));
    const O = K.ostatnia.odcinki, mxv = Math.max(...O.map((x) => x.predkosc));
    const kOdc = S.karta('Odcinki co 5 km', { klasa: 's-c6' }, h('div', { class: 's-tab-wrap' }, h('table', { class: 's-tab' }, h('thead', null, h('tr', null, ['Odcinek', 'Czas', 'Średnia', 'Tętno', 'Δ wys.'].map((s, i) => h('th', { class: i ? 'num' : '', text: s })))),
      h('tbody', null, O.map((x) => { const tr = h('tr', null, h('td', { text: `${f.liczba(x.od)}–${f.liczba(x.do)} km` }), h('td', { class: 'num', text: f.czas(x.czas) }), h('td', { class: 'num', style: x.predkosc === mxv ? { fontWeight: 700, color: 'var(--s-akcent)' } : null, text: f.liczba(x.predkosc, 1) + ' km/h' }), h('td', { class: 'num', text: x.tetno + ' bpm' }), h('td', { class: 'num', text: f.znak(x.roznicaWys) + ' m' })); tr.addEventListener('click', () => zaznacz(Math.round(x.od * 10), Math.min(P.d.length - 1, Math.round(x.do * 10)))); return tr; })))));
    const segDzis = P.segmenty.map((s) => { const sg = K.segmenty[s.id], pr = sg.historia.find((x) => x.jazda === j.id) || sg.ostatnia; return { s: sg, czas: pr.czas, typ: pr.czas <= sg.pr ? 'pr' : pr.czas <= sg.pr * 1.03 ? 'blisko' : 'zwykly', od: s.od, do: s.do }; });
    const kSeg = S.karta('Segmenty na trasie', { klasa: 's-c6', opis: 'Kliknij segment, żeby go zaznaczyć.' }, listaSegmentow(segDzis, (x) => zaznacz(Math.round(x.od * 10), Math.round(x.do * 10))));
    // na tle poprzednich 10 jazd szosowych
    const wcz = K.jazdy.filter((x) => x.typ === j.typ && x.data < j.data).slice(-10);
    const sr = (k) => wcz.reduce((a, x) => a + x[k], 0) / Math.max(1, wcz.length);
    const POR = [['Średnia', 'predkosc', 1, 'km/h', 1], ['Dystans', 'km', 1, 'km', 0], ['Tętno śr.', 'tetno', 0, 'bpm', 0], ['Obciążenie', 'obciazenie', 0, 'pkt', 0]];
    const kPor = S.karta('Na tle poprzednich jazd', { opis: `Średnia z ${wcz.length} wcześniejszych jazd ${j.typ === 'zwift' ? 'na Zwifcie' : 'szosowych'}.` },
      h('div', { class: 's-por' }, POR.map(([l, k, dec, u, dobrze]) => { const v = j[k], s = sr(k), d = v - s, max = Math.max(v, s) * 1.08; return h('div', { class: 's-por-w' },
        h('span', { class: 's-por-l', text: l }),
        h('div', { class: 's-por-tor' }, h('i', { class: 'sr', style: { width: (s / max * 100).toFixed(1) + '%' } }), h('i', { class: 'ta', style: { width: (v / max * 100).toFixed(1) + '%' } })),
        h('b', { text: `${f.liczba(v, dec)} ${u}` }), h('em', { class: dobrze === 0 ? '' : (d * dobrze > 0 ? 'gora' : 'dol'), text: `${d >= 0 ? '+' : '−'}${f.liczba(Math.abs(d), dec)}` })); })),
      h('div', { class: 's-legenda', style: { marginTop: '12px' } }, h('span', null, h('i', { style: { background: 'var(--s-akcent)' } }), 'ta jazda'), h('span', null, h('i', { style: { background: 'var(--s-linia-2)' } }), 'średnia poprzednich')));
    siatka.append(kOdc, h('div', { class: 's-c6 s-kol' }, kSeg, kPor));

    const sumaZakresu = (a, b) => {
      const dist = P.d[b] - P.d[a], czas = P.t[b] - (a ? P.t[a] : 0);
      let hr = 0, hrM = 0, gora = 0, cad = 0, nc = 0; const zt = [0, 0, 0, 0, 0];
      for (let i = a; i <= b; i++) { hr += P.hr[i]; hrM = Math.max(hrM, P.hr[i]); if (i > a && P.ele[i] > P.ele[i - 1]) gora += P.ele[i] - P.ele[i - 1]; if (P.cad[i]) { cad += P.cad[i]; nc++; } const dt = i ? P.t[i] - P.t[i - 1] : 0; const z = STREFY.findIndex((s) => P.hr[i] <= s.do); zt[z < 0 ? 4 : z] += dt; }
      const n = b - a + 1, sumT = zt.reduce((x, y) => x + y, 0) || 1;
      return { dist, czas, v: dist / Math.max(1, czas) * 3600, hr: hr / n, hrM, gora: gora * 1.3, cad: nc ? cad / nc : 0, strefy: STREFY.map((s, k) => Object.assign({}, s, { czas: zt[k], udzial: zt[k] / sumT })) };
    };
    let zazn = null;
    const pokazZaznaczenie = () => {
      const [a, b] = zazn || [0, P.d.length - 1], z = sumaZakresu(a, b);
      if (!zazn) Object.assign(z, { dist: j.km, czas: j.czas, v: j.predkosc, gora: j.przewyzszenie, hrM: j.tetnoMax });
      tryb.replaceChildren(...[zazn ? h('span', null, 'Fragment ', h('b', { text: `${f.liczba(P.d[a], 1)}–${f.liczba(P.d[b], 1)} km` })) : h('span', null, h('b', { text: 'Cała jazda' }), ' · zaznacz fragment na wykresie albo kliknij odcinek lub segment'), zazn ? (() => { const x = h('button', { class: 's-btn', type: 'button' }, ik('x', 'bold'), 'Wyczyść'); x.addEventListener('click', () => zaznacz(null)); return x; })() : null].filter(Boolean));
      wybor.replaceChildren(...[['Dystans', f.liczba(z.dist, 1), 'km'], ['Czas', f.czas(z.czas), ''], ['Średnia', f.liczba(z.v, 1), 'km/h'], ['Tętno śr.', f.liczba(z.hr), 'bpm'], ['Tętno maks.', String(z.hrM), 'bpm'], ['W górę', f.liczba(z.gora), 'm']].map(([l, v, u]) => h('div', null, h('small', { text: l }), h('b', null, v, u ? h('em', { text: u }) : ''))));
      strefyZ.replaceChildren(); S.strefy(strefyZ, z.strefy);
    };
    let mapa = null, wykres = null;
    const LAN = [{ k: 'ele', n: 'Wysokość', u: 'm', kol: 'var(--s-wys)', hh: 84 }, { k: 'v', n: 'Prędkość', u: 'km/h', kol: 'var(--s-akcent)', hh: 84 }, { k: 'hr', n: 'Tętno', u: 'bpm', kol: 'var(--s-hr)', hh: 84 }, { k: 'cad', n: 'Kadencja', u: 'rpm', kol: 'var(--s-kad)', hh: 64 }];
    const cadG = P.cad.map((c, i) => { let s = 0, n = 0; for (let k = -3; k <= 3; k++) { const q = P.cad[i + k]; if (q) { s += q; n++; } } return n ? s / n : null; });
    const serie = { ele: P.ele, v: P.v, hr: P.hr, cad: cadG };
    const ustawOdczyt = (i) => {
      const live = i != null && i >= 0;
      const w = live ? [['Kilometr', f.liczba(P.d[i], 1), 'km', null], ['Czas', f.czas(P.t[i]), '', null], ['Wysokość', f.liczba(P.ele[i]), 'm', 'var(--s-wys)'], ['Nachylenie', (P.grade[i] < 0 ? '−' : '') + f.liczba(Math.abs(P.grade[i]), 1), '%', null], ['Prędkość', f.liczba(P.v[i], 1), 'km/h', 'var(--s-akcent)'], ['Tętno', String(P.hr[i]), 'bpm', 'var(--s-hr)'], ['Kadencja', cadG[i] ? f.liczba(cadG[i]) : '—', 'rpm', 'var(--s-kad)']]
        : [['Dystans', f.liczba(j.km, 1), 'km', null], ['Czas', f.czas(j.czas), '', null], ['W górę', f.liczba(j.przewyzszenie), 'm', 'var(--s-wys)'], ['Maks. nachylenie', f.liczba(Math.max(...P.grade), 1), '%', null], ['Średnia', f.liczba(j.predkosc, 1), 'km/h', 'var(--s-akcent)'], ['Tętno śr.', String(j.tetno), 'bpm', 'var(--s-hr)'], ['Kadencja śr.', String(j.kadencja), 'rpm', 'var(--s-kad)']];
      odczyt.replaceChildren(...w.map(([l, v, u, k]) => h('div', null, h('small', null, k ? h('i', { style: { background: k } }) : null, l), h('b', null, v, u ? h('em', { text: u }) : ''))));
    };
    const zaznacz = (a, b) => { zazn = a == null || Math.abs(b - a) < 3 ? null : [Math.min(a, b), Math.max(a, b)]; if (mapa) mapa.zakres(zazn ? zazn[0] : null, zazn ? zazn[1] : null); if (wykres) wykres.zaznacz(zazn); pokazZaznaczenie(); };
    ustawOdczyt(null); pokazZaznaczenie();
    wykres = strumienie(strH, { P, LAN, serie, onHover: (i) => { ustawOdczyt(i); if (mapa) mapa.kursor(i); }, onZakres: zaznacz });
    if (o.mapaZew) mapa = o.mapaZew({ trasa, segmenty: P.segmenty, jazda: j, onHover: (i) => { ustawOdczyt(i); wykres.kursor(i); } });
    else requestAnimationFrame(() => { mapa = W.mapaTrasy(mapaEl, Object.assign({ mapa: K.mapa, trasa, segmenty: P.segmenty, km: 10, etykietaStartu: 'Start · meta', pad: 22, margines: 1.2, poswiata: true, onHover: (i) => { ustawOdczyt(i); wykres.kursor(i); }, opis: 'Mapa trasy' }, o.mapa || {})); });
  };

  // ───── cel roczny: narastająco vs równe tempo, z prognozą ─────
  S.celWykres = function (host, o) {
    o = o || {};
    const C = K.cel, N = C.narastajaco, r0 = new Date(C.rok, 0, 1), dni = 365;
    const dz = N.length - 1, teraz = N[dz].km;
    const pts = Array.from({ length: dni }, (_, i) => i);
    const ticki = []; for (let mm = 0; mm < 12; mm += (o.coMies || 2)) { const d = new Date(C.rok, mm, 1); ticki.push({ v: Math.round((d - r0) / 864e5), s: f.miesiacKr(mm) }); }
    W.linie(host, {
      wys: o.wys || 200, m: { l: 40, r: 12, t: 12, b: 24 }, krzywa: 'linia',
      serie: [{ pts: pts.map((i) => [i, i <= dz ? N[i].km : null]), klasa: 's-a', obszar: true }, { pts: pts.map((i) => [i, C.km * (i + 1) / dni]), klasa: 's-plan' }, { pts: pts.map((i) => [i, i >= dz ? teraz + (C.prognoza - teraz) * (i - dz) / (dni - 1 - dz) : null]), klasa: 's-prog' }],
      x: { ticki, min: 0, max: dni - 1 }, y: { min: 0, max: 6000, ticki: [0, 2000, 4000, 6000], format: (v) => (v ? f.liczba(v / 1000) + ' tys.' : '0') },
      tip: (i) => { const d = new Date(C.rok, 0, i + 1); return [W.naglowekTip(f.data(d)), i <= dz ? W.wierszTip(f.liczba(N[i].km) + ' km', 'przejechane', 's-a') : W.wierszTip(f.liczba(teraz + (C.prognoza - teraz) * (i - dz) / (dni - 1 - dz)) + ' km', 'prognoza'), W.wierszTip(f.liczba(C.km * (i + 1) / dni) + ' km', 'równe tempo do celu')]; },
      opis: 'Cel roczny narastająco',
    });
  };

  // ───── nagłówek podstrony ─────
  S.naglowek = (tytul, opis, akcje) => h('header', { class: 's-nag-str' }, h('div', null, h('h1', { text: tytul }), opis ? h('p', { text: opis }) : null), akcje ? h('div', { class: 's-akcje' }, akcje) : null);

  // ───── gotowe podstrony (styl może podmienić dowolną) ─────
  S.kartaPmc = (o) => {
    o = o || {};
    const body = h('div'), p = S.pmc(body, { zakres: o.zakres || 180, wys: o.wys || 260 });
    return S.karta(o.tytul || 'Forma, zmęczenie i świeżość', { klasa: o.klasa || 's-c12', opis: o.opis || 'Forma (CTL) to obciążenie z 6 tygodni, zmęczenie (ATL) z 7 dni. Świeżość to różnica.', akcje: [S.legenda([['var(--s-akcent)', 'Forma (CTL)', 1], ['var(--s-tekst-3)', 'Zmęczenie (ATL)', 1]]), p.przel] }, body);
  };
  S.kartaObjetosc = (o) => {
    o = o || {};
    const body = h('div'), p = S.objetosc(body, { wys: o.wys || 220, ile: o.ile });
    return S.karta(o.tytul || 'Objętość', { klasa: o.klasa || 's-c7', opis: o.opis || 'Szosa i Zwift jeden na drugim; bieżący okres jaśniej.', akcje: [S.legenda([['var(--s-szosa)', 'Szosa'], ['var(--s-zwift)', 'Zwift']]), p.przel] }, body);
  };
  S.kartaCel = (o) => {
    o = o || {};
    const C = K.cel, body = h('div');
    const staty = h('div', { class: 's-cel-st' }, h('div', null, h('small', { text: 'Przejechane' }), h('b', null, f.liczba(C.teraz), h('em', { text: ' km' }))), h('div', null, h('small', { text: 'Prognoza roku' }), h('b', null, f.liczba(C.prognoza), h('em', { text: ' km' }))), h('div', null, h('small', { text: 'Potrzeba na tydzień' }), h('b', null, f.liczba(C.potrzebaNaTydzien), h('em', { text: ' km' }))));
    const wyk = h('div', { style: { marginTop: '14px' } });
    body.append(staty, wyk); S.celWykres(wyk, { wys: o.wys || 180 });
    return S.karta(o.tytul || `Cel ${C.rok}: ${f.liczba(C.km)} km`, { klasa: o.klasa || 's-c5', opis: `${f.procent(C.udzial)} celu · w tym tempie wyjdzie ${f.znak(Math.round(C.prognoza - C.km))} km`, akcje: [S.legenda([['var(--s-akcent)', 'Przejechane', 1], ['var(--s-linia-2)', 'Równe tempo', 1]])] }, body);
  };
  S.kartaKafle = (o) => {
    o = o || {};
    const body = h('div'), k = S.kafle(body, o.okres || 'tydzien');
    const przel = S.przel([{ k: 'tydzien', s: 'Tydzień' }, { k: 'miesiac', s: 'Miesiąc' }, { k: 'rok', s: 'Rok' }, { k: 'wszystko', s: 'Całość' }], o.okres || 'tydzien', (x) => { k.ustaw(x); if (W.typografia) W.typografia(body); }, 'Okres');
    return S.karta(o.tytul || 'Podsumowanie', { klasa: o.klasa || 's-c12', opis: o.opis || 'Porównanie z poprzednim takim samym okresem.', akcje: [przel] }, body);
  };
  S.widoki = function (o) {
    o = o || {};
    return {
      kalendarz(host) {
        host.append(S.naglowek('Kalendarz', 'Jazdy i plan dzień po dniu. Po prawej podsumowanie każdego tygodnia. Plan to przykład.'));
        const k = S.karta(null, { klasa: 's-karta-kal' }); host.append(k); S.kalendarz(k);
      },
      jazdy(host) {
        host.append(S.naglowek('Jazdy', 'Wszystkie jazdy od sierpnia 2025. Kliknij nagłówek, żeby posortować, a wiersz, żeby otworzyć analizę.'));
        const k = S.karta(null); host.append(k); S.tabelaJazd(k, { naStrone: 25 });
      },
      postepy(host) {
        host.append(S.naglowek('Postępy', 'Forma, objętość, moc i rekordy w jednym miejscu.'));
        const s = h('div', { class: 's-siatka' }); host.append(s);
        const kM = S.karta('Krzywa mocy', { klasa: 's-c7', opis: 'Najlepsza średnia moc dla każdego czasu, tylko Zwift.', akcje: [S.legenda([['var(--s-akcent)', 'Najlepiej', 1], ['var(--s-tekst-3)', 'Ostatnie 42 dni', 1]])] });
        const kZ = S.karta('Strefy tętna', { klasa: 's-c5', opis: 'Czas w strefach w tym roku.' });
        const kR = S.karta('Rekordy', { klasa: 's-c12' });
        const kS = S.karta('Ulubione segmenty', { klasa: 's-c12', opis: 'Posortowane po liczbie prób. Przebieg: niżej znaczy szybciej, kropka to rekord.' });
        s.append(S.kartaKafle(), S.kartaPmc(), S.kartaObjetosc(), S.kartaCel(), kM, kZ, kR, kS);
        const m = h('div'); kM.append(m); S.krzywaMocy(m, { wys: 240 });
        S.strefy(kZ); S.rekordy(kR); S.tabelaSegmentow(kS);
      },
      analiza(host, arg) { S.analiza(host, arg, o.analiza); },
    };
  };

  function listaSegmentow(lista, onKlik) {
    return h('div', { class: 's-tab-wrap' }, h('table', { class: 's-tab' }, h('thead', null, h('tr', null, ['Segment', 'Czas', 'Rekord', 'Różnica'].map((s, i) => h('th', { class: i ? 'num' : '', text: s })))),
      h('tbody', null, lista.map((x) => { const r = x.czas - x.s.pr; const tr = h('tr', { style: onKlik ? null : { cursor: 'default' } }, h('td', { class: 'nz' }, x.typ === 'pr' ? ik('trophy', 'fill') : x.typ === 'blisko' ? ik('star', 'fill') : null, ' ', x.s.nazwa, h('small', { text: `${x.s.dl >= 1000 ? f.liczba(x.s.dl / 1000, 2) + ' km' : x.s.dl + ' m'} · ${f.liczba(x.s.nach, 1)}%` })), h('td', { class: 'num', style: { fontWeight: 700 }, text: f.tempoSeg(x.czas) }), h('td', { class: 'num', text: f.tempoSeg(x.s.pr) }), h('td', { class: 'num', text: r <= 0 ? 'rekord!' : '+' + r + ' s' })); if (onKlik) tr.addEventListener('click', () => onKlik(x)); return tr; }))));
  }

  // wykres strumieni: kilka pasów z własną osią Y, wspólna oś X, celownik i zaznaczanie przeciągnięciem
  function strumienie(host, o) {
    const { P, LAN, serie } = o;
    const maxKm = P.d[P.d.length - 1];
    let svg = null, x = null, krzyz = null, zR = null, zL1 = null, zL2 = null, m = null, H = 0, zaznaczony = null, kursorI = -1;
    const idxZ = (px) => Math.max(0, Math.min(P.d.length - 1, Math.round(x.inv(px) * 10)));
    const api = {
      kursor(i) { kursorI = i; if (!krzyz) return; if (i == null || i < 0) { krzyz.style.opacity = 0; return; } const px = x(P.d[i]); krzyz.setAttribute('x1', px); krzyz.setAttribute('x2', px); krzyz.style.opacity = 1; },
      zaznacz(z) { zaznaczony = z; if (!zR) return; if (!z) { zR.setAttribute('width', 0); zL1.style.opacity = 0; zL2.style.opacity = 0; return; } const a = x(P.d[z[0]]), b = x(P.d[z[1]]); zR.setAttribute('x', a); zR.setAttribute('width', b - a); [[zL1, a], [zL2, b]].forEach(([l, px]) => { l.setAttribute('x1', px); l.setAttribute('x2', px); l.style.opacity = 1; }); },
    };
    W.rozmiar(host, (szer) => {
      if (svg) svg.remove();
      // wąsko (telefon): nazwa pasa NAD pasem, z lewej zostają tylko liczby skali. Przy stałych 104 px
      // margines zabierał 40% wykresu na iPhonie SE, a nazwa stykała się z liczbą skali.
      const wasko = szer < 480;
      m = wasko ? { l: 34, r: 6, t: 22, gap: 28 } : { l: 104, r: 10, t: 8, gap: 14 };
      H = m.t + LAN.reduce((a, l) => a + l.hh + m.gap, 0) + 18;
      svg = W.svg('svg', { width: szer, height: H, role: 'img', 'aria-label': 'Wysokość, prędkość, tętno i kadencja wzdłuż trasy' }); host.prepend(svg);
      x = W.skala(0, maxKm, m.l, szer - m.r);
      const tlo = W.svg('g', null, svg);
      for (const s of P.segmenty) { W.svg('rect', { x: x(s.od), y: m.t, width: Math.max(2, x(s.do) - x(s.od)), height: H - m.t - 18, class: 's-str-seg' }, tlo); }
      let y0 = m.t;
      for (const l of LAN) {
        const dane = serie[l.k], war = dane.filter((v) => v != null);
        let mn = Math.min(...war), mx = Math.max(...war); const pad = (mx - mn) * 0.1 || 1; mn -= pad; mx += pad;
        const y = W.skala(mn, mx, y0 + l.hh, y0);
        W.svg('line', { x1: m.l, x2: szer - m.r, y1: y0 + l.hh, y2: y0 + l.hh, class: 's-str-siatka' }, svg);
        W.svg('line', { x1: m.l, x2: szer - m.r, y1: y0, y2: y0, class: 's-str-siatka', opacity: 0.5 }, svg);
        if (wasko) { const t = W.tekst(svg, m.l, y0 - 8, l.n, { class: 's-str-l' }); W.svg('tspan', { class: 's-str-j', dx: 5 }, t).textContent = l.u; }
        else { W.tekst(svg, 0, y0 + 13, l.n, { class: 's-str-l' }); W.tekst(svg, 0, y0 + 27, l.u, { class: 's-str-j' }); }
        W.tekst(svg, m.l - 8, y0 + 10, f.liczba(mx - pad), { class: 's-str-t', 'text-anchor': 'end' }); W.tekst(svg, m.l - 8, y0 + l.hh - 2, f.liczba(mn + pad), { class: 's-str-t', 'text-anchor': 'end' });
        const pts = []; dane.forEach((v, i) => { if (v != null) pts.push([x(P.d[i]), y(v)]); });
        W.svg('path', { d: W.obszar(pts, y0 + l.hh, 'linia'), class: 's-str-obsz', fill: l.kol }, svg);
        W.svg('path', { d: W.sciezka(pts, 'linia'), class: 's-str-lin', stroke: l.kol }, svg);
        y0 += l.hh + m.gap;
      }
      for (let k = 0; k <= maxKm; k += 10) W.tekst(svg, x(k), H - 4, k + (k === 0 ? ' km' : ''), { class: 's-str-t', 'text-anchor': k === 0 ? 'start' : 'middle' });
      zR = W.svg('rect', { x: 0, y: m.t, width: 0, height: H - m.t - 18, class: 's-str-zazn' }, svg);
      zL1 = W.svg('line', { y1: m.t, y2: H - 18, class: 's-str-zazn-l', style: 'opacity:0' }, svg); zL2 = W.svg('line', { y1: m.t, y2: H - 18, class: 's-str-zazn-l', style: 'opacity:0' }, svg);
      krzyz = W.svg('line', { y1: m.t, y2: H - 18, class: 's-str-krzyz', style: 'opacity:0' }, svg);
      const hit = W.svg('rect', { x: m.l, y: 0, width: szer - m.l - m.r, height: H, fill: 'transparent' }, svg);
      let start = null;
      const px = (e) => e.clientX - svg.getBoundingClientRect().left;
      // Palcem: odczyt zostaje po oderwaniu i znika po stuknięciu poza wykresem (jak W.wskazuj
      // w wykresy.js). Przewijanie w pionie przerywa gest („pointercancel”) — wtedy nie zaznaczamy.
      hit.addEventListener('pointerdown', (e) => {
        start = idxZ(px(e)); hit.setPointerCapture(e.pointerId);
        if (e.pointerType === 'touch') { W.zamykajDotykiem(hit, () => { api.kursor(-1); o.onHover(null); }); api.kursor(start); o.onHover(start); }
      });
      hit.addEventListener('pointermove', (e) => { const i = idxZ(px(e)); api.kursor(i); o.onHover(i); if (start != null && Math.abs(i - start) > 2) api.zaznacz([Math.min(start, i), Math.max(start, i)]); });
      hit.addEventListener('pointerup', (e) => { if (start == null) return; const i = idxZ(px(e)); o.onZakres(start, i); start = null; });
      hit.addEventListener('pointercancel', () => { start = null; });
      hit.addEventListener('pointerleave', (e) => { if (start == null && e.pointerType !== 'touch') { api.kursor(-1); o.onHover(null); } });
      api.zaznacz(zaznaczony); if (kursorI >= 0) api.kursor(kursorI);
    });
    return api;
  }

  global.S = S;
})(window);
