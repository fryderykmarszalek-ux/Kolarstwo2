/* Pulpit — narzędzie analityczne: jeden zakres dat steruje całą stroną. */
(function () {
  'use strict';
  const K = K2, f = K.fmt, h = W.h, ik = A.ik, F = K.forma;
  const DZIS = K.dzis, dzien = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const polnoc = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const JUTRO = dzien(polnoc(DZIS), 1);
  const ZAKRESY = [
    { k: 'tydzien', s: 'Tydzień', od: K.okresy.tydzien.od, pmc: 90, kub: 'dzien' },
    { k: 'miesiac', s: 'Miesiąc', od: K.okresy.miesiac.od, pmc: 90, kub: 'dzien' },
    { k: '90', s: '90 dni', od: dzien(JUTRO, -90), pmc: 90, kub: 'tydzien' },
    { k: 'rok', s: 'Rok 2026', od: K.okresy.rok.od, pmc: 365, kub: 'tydzien' },
    { k: 'wszystko', s: 'Całość', od: K.okresy.wszystko.od, pmc: 9999, kub: 'miesiac' },
  ];
  let zakres = ZAKRESY[2];
  try { const z = ZAKRESY.find((x) => x.k === localStorage.getItem('k2.pu.zakres')); if (z) zakres = z; } catch (e) { /* bez pamięci */ }

  const sumy = (od, doo) => {
    const jj = K.jazdy.filter((j) => j.data >= od && j.data < doo), s = (k, t) => jj.filter((j) => !t || j.typ === t).reduce((a, j) => a + j[k], 0);
    const czas = s('czas');
    return { km: s('km'), czas, przewyzszenie: s('przewyzszenie'), jazdy: jj.length, obciazenie: s('obciazenie'), predkosc: czas ? s('km') / (czas / 3600) : 0, kmSzosa: s('km', 'szosa'), kmZwift: s('km', 'zwift') };
  };
  const kubelki = (z) => {
    const out = [];
    if (z.kub === 'dzien') for (let d = new Date(z.od); d < JUTRO; d = dzien(d, 1)) out.push({ od: d, do: dzien(d, 1) });
    else if (z.kub === 'tydzien') { let d = dzien(z.od, -((z.od.getDay() + 6) % 7)); while (d < JUTRO) { out.push({ od: d, do: dzien(d, 7) }); d = dzien(d, 7); } }
    else { let d = new Date(z.od.getFullYear(), z.od.getMonth(), 1); while (d < JUTRO) { const n = new Date(d.getFullYear(), d.getMonth() + 1, 1); out.push({ od: d, do: n }); d = n; } }
    return out.map((b) => Object.assign(b, sumy(b.od, b.do)));
  };
  const etykieta = (z, b, i, arr) => {
    if (z.kub === 'dzien') return z.k === 'tydzien' ? f.dzienTygKr(b.od) : (b.od.getDate() === 1 || b.od.getDate() % 5 === 0 ? String(b.od.getDate()) : null);
    if (z.kub === 'tydzien') return !i || arr[i - 1].od.getMonth() !== b.od.getMonth() ? f.miesiacKr(b.od.getMonth()) : null;
    return b.od.getMonth() === 0 || !i ? `${f.miesiacKr(b.od.getMonth())} ’${String(b.od.getFullYear()).slice(2)}` : f.miesiacKr(b.od.getMonth());
  };
  const nazwaKub = (z, b) => (z.kub === 'dzien' ? `${f.dzienTyg(b.od)}, ${f.dataKrotka(b.od)}` : z.kub === 'tydzien' ? `tydzień od ${f.dataKrotka(b.od)}` : `${f.miesiac(b.od.getMonth())} ${b.od.getFullYear()}`);

  // ───── KPI ─────
  const POLA = [
    { k: 'km', l: 'Dystans', u: 'km', v: (x) => f.liczba(x) },
    { k: 'czas', l: 'Czas jazdy', u: 'h', v: (x) => f.liczba(x / 3600, 1) },
    { k: 'przewyzszenie', l: 'W górę', u: 'm', v: (x) => f.liczba(x) },
    { k: 'jazdy', l: 'Jazdy', u: '', v: (x) => String(x) },
    { k: 'obciazenie', l: 'Obciążenie', u: 'pkt', v: (x) => f.liczba(x) },
    { k: 'predkosc', l: 'Śr. prędkość', u: 'km/h', v: (x) => f.liczba(x, 1), abs: true },
  ];
  function kartaKpi(z, kub) {
    const teraz = sumy(z.od, JUTRO), dl = JUTRO - z.od, pop = z.k === 'wszystko' ? null : sumy(new Date(z.od - dl), z.od);
    return h('section', { class: 's-karta s-c12 pu-kpi' }, POLA.map((p) => {
      let d = null;
      if (pop && pop[p.k]) { const ch = p.abs ? teraz[p.k] - pop[p.k] : (teraz[p.k] - pop[p.k]) / pop[p.k]; d = h('span', { class: 'pu-kpi-d ' + (ch >= 0 ? 'gora' : 'dol') }, ik(ch >= 0 ? 'arrow-up-right' : 'arrow-down-right', 'bold'), p.abs ? f.liczba(Math.abs(ch), 1) : f.liczba(Math.abs(ch) * 100) + '%'); }
      return h('div', { class: 'pu-kpi-k' }, h('div', { class: 'pu-kpi-l', text: p.l }), h('div', { class: 'pu-kpi-v' }, p.v(teraz[p.k]), p.u ? h('small', { text: p.u }) : ''),
        h('div', { class: 'pu-kpi-s' }, d || h('span', { class: 'pu-kpi-d', text: 'bez porównania' }), W.sparkline(kub.map((b) => b[p.k]), { szer: 84, wys: 22, krzywa: 'linia', obszar: true })));
    }));
  }

  // ───── stan formy ─────
  function kartaStan() {
    const t = Math.round(F.tsb), mn = -40, mx = 30, poz = (v) => ((Math.max(mn, Math.min(mx, v)) - mn) / (mx - mn) * 100);
    const STR = [[-40, -30, 'przeciążenie', 'p1'], [-30, -10, 'budowanie', 'p2'], [-10, 15, 'równowaga', 'p3'], [15, 30, 'świeżość', 'p4']];
    const ramp = F.zmiana7, rOpis = ramp > 8 ? 'szybko — pilnuj regeneracji' : ramp >= 3 ? 'w zdrowym tempie' : ramp >= 0 ? 'powoli' : 'forma spada';
    return S.karta('Stan formy', { klasa: 's-c4', opis: `Na dziś, ${f.dataKrotka(DZIS)}` },
      h('div', { class: 'pu-stan-g' }, h('div', null, h('small', { text: 'Świeżość (TSB)' }), h('b', { text: f.znak(t) })), h('span', { class: 'pu-stan-chip ' + F.klucz, text: F.nazwa })),
      h('div', { class: 'pu-skala', role: 'img', 'aria-label': `Świeżość ${t} w strefie ${F.nazwa}` }, STR.map(([a, b, n, k]) => h('i', { class: k, style: { left: poz(a) + '%', width: (poz(b) - poz(a)) + '%' }, title: n })), h('span', { class: 'pu-skala-z', style: { left: poz(t) + '%' } })),
      h('div', { class: 'pu-skala-o' }, STR.map(([a, b, n]) => h('span', { style: { left: poz((a + b) / 2) + '%' }, text: n }))),
      h('dl', { class: 'pu-stan-dl' },
        h('div', null, h('dt', null, h('i', { class: 'k-ctl' }), 'Forma (CTL)'), h('dd', { text: f.liczba(F.ctl) })),
        h('div', null, h('dt', null, h('i', { class: 'k-atl' }), 'Zmęczenie (ATL)'), h('dd', { text: f.liczba(F.atl) })),
        h('div', null, h('dt', null, h('i', { class: 'k-ramp' }), 'Przyrost formy / 7 dni'), h('dd', { text: f.znak(Math.round(ramp)) }))),
      h('p', { class: 'pu-stan-o' }, `Forma rośnie ${rOpis}. `, `${F.opis}`));
  }

  // ───── objętość w zakresie ─────
  function kartaObjetosc(z, kub) {
    const body = h('div');
    const k = S.karta('Objętość', { klasa: 's-c8', opis: z.kub === 'dzien' ? 'Dzień po dniu.' : z.kub === 'tydzien' ? 'Tydzień po tygodniu.' : 'Miesiąc po miesiącu.', akcje: [S.legenda([['var(--s-szosa)', 'Szosa'], ['var(--s-zwift)', 'Zwift']])] }, body);
    W.slupki(body, { wys: 230, m: { l: 34, r: 4, t: 14, b: 24 }, maxSzer: z.kub === 'dzien' && z.k === 'tydzien' ? 40 : 18, promien: 3, odstep: 3, osY: { ticki: 4, format: (v) => f.liczba(v) },
      osX: (i) => etykieta(z, kub[i], i, kub), opis: 'Objętość w wybranym zakresie',
      dane: kub.map((b) => ({ v: b.km, czesci: [{ v: b.kmSzosa, klasa: 'cz-szosa' }, { v: b.kmZwift, klasa: 'cz-zwift' }], tip: () => [W.naglowekTip(nazwaKub(z, b)), W.wierszTip(f.liczba(b.km) + ' km', 'razem'), W.wierszTip(f.liczba(b.kmSzosa) + ' km', 'szosa', 's-szosa'), W.wierszTip(f.liczba(b.kmZwift) + ' km', 'Zwift', 's-z'), W.wierszTip(f.czasHM(b.czas), 'czas'), W.wierszTip(f.liczba(b.obciazenie), 'obciążenie')] })) });
    return k;
  }

  // ───── pulpit ─────
  function pulpit(host) {
    const okres = h('p', { class: 'pu-okres' });
    const przel = S.przel(ZAKRESY.map((x) => ({ k: x.k, s: x.s })), zakres.k, (k) => { zakres = ZAKRESY.find((x) => x.k === k); try { localStorage.setItem('k2.pu.zakres', k); } catch (e) { /* bez pamięci */ } rysuj(); }, 'Zakres dat dla całego pulpitu');
    const siatka = h('div', { class: 's-siatka' });
    host.append(h('div', { class: 'pu-narz' }, h('div', null, h('h1', { text: 'Pulpit' }), okres), h('div', { class: 'pu-narz-p' }, h('span', { class: 'pu-narz-e' }, ik('calendar-blank', 'bold'), 'Zakres'), przel)), siatka);
    function rysuj() {
      const z = zakres, kub = kubelki(z), n = Math.round((JUTRO - z.od) / 864e5);
      okres.textContent = `${f.data(z.od)} – ${f.data(DZIS)} · ${n} ${A.odm(n, 'dzień', 'dni', 'dni')}`;
      siatka.replaceChildren();
      siatka.append(kartaKpi(z, kub));
      // forma z adnotacjami rekordów
      const pmcBody = h('div');
      S.pmc(pmcBody, { zakres: z.pmc, wys: 300, znaczniki: (dni) => { const od = dni[0].data; let ost = -99; return K.rekordy.filter((r) => r.data >= od).sort((a, b) => a.data - b.data).map((r) => { const i = dni.findIndex((d) => d.data.toDateString() === r.data.toDateString()); if (i < 0) return null; const s = i - ost > dni.length / 9 ? `${f.liczba(r.wartosc, r.jednostka === 'km/h' || r.klucz === 'dystans' ? 1 : 0)} ${r.jednostka}` : ''; if (s) ost = i; return { x: i, s }; }).filter(Boolean); } });
      siatka.append(S.karta('Forma, zmęczenie i świeżość', { klasa: 's-c8', opis: z.pmc >= 9999 ? 'Cała historia.' : `Ostatnie ${z.pmc === 365 ? '365' : z.pmc} dni. Pionowe kreski to dni rekordów.`, akcje: [S.legenda([['var(--s-akcent)', 'Forma (CTL)', 1], ['var(--s-tekst-3)', 'Zmęczenie (ATL)', 1]])] }, pmcBody), kartaStan());
      siatka.append(kartaObjetosc(z, kub));
      const kZ = S.karta('Strefy tętna', { klasa: 's-c4', opis: 'Cały rok 2026 — strefy liczymy z rocznego zestawienia.' }); S.strefy(kZ);
      siatka.append(kZ);
      const tab = h('div');
      S.tabelaJazd(tab, { naStrone: 10, filtr: (j) => j.data >= z.od });
      siatka.append(S.karta('Jazdy w zakresie', { klasa: 's-c12', opis: 'Kliknij wiersz, żeby otworzyć analizę.' }, tab));
      W.typografia(siatka);
    }
    rysuj();
  }

  const widoki = S.widoki();
  widoki.pulpit = pulpit;
  S.router({
    kontener: document.getElementById('tresc'), widoki, domyslny: 'pulpit', tytul: 'Kolarstwo',
    tytuly: { pulpit: 'Pulpit', kalendarz: 'Kalendarz', jazdy: 'Jazdy', postepy: 'Postępy', analiza: 'Analiza jazdy' },
    poZmianie(id) { document.body.dataset.widok = id; },
  });
})();
