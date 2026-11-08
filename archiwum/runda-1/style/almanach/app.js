/* ALMANACH — logika strony; tekst pisany z danych */
(function () {
  'use strict';
  const K = window.K2, f = K.fmt, h = W.h;
  const $ = (s) => document.querySelector(s);
  const J = K.ostatnia.jazda, P = K.ostatnia.probki, C = K.cel, F = K.forma;

  // ───────── narzędzia językowe ─────────
  const odm = (n, a, b, c) => { n = Math.abs(Math.round(n)); if (n === 1) return a; const d = n % 10, s = n % 100; return d >= 2 && d <= 4 && (s < 12 || s > 14) ? b : c; };
  const wielka = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const B = (s) => h('b', { text: s });
  const Z = (...s) => h('span', { class: 'zaznacz' }, ...s);
  const SUP = (n) => h('sup', { text: String(n) });
  const spark = (wart, o) => h('span', { class: 'spark-w', 'aria-hidden': 'true' }, W.sparkline(wart, Object.assign({ szer: 64, wys: 14, pad: 1.5 }, o)));
  const p = (...dz) => h('p', null, ...dz);

  // ───────── winieta ─────────
  const nrWydania = f.tydzienISO(K.dzis);
  $('#w-wydanie').textContent = `Wydanie ${nrWydania} · ${f.dzienTyg(K.dzis)}, ${f.data(K.dzis)}`;
  $('#w-cena').textContent = `Cena: ${f.liczba(C.teraz)} km`;
  $('#pg-nr').textContent = `Wydanie ${nrWydania}`;
  // pasek na górze pojawia się po przewinięciu winiety
  new IntersectionObserver(([e]) => $('#pasek-gora').classList.toggle('widoczny', !e.isIntersecting), { rootMargin: '-60px 0px 0px 0px' }).observe($('.winieta'));

  // ───────── fakty do tekstu ─────────
  const O = K.ostatnia.odcinki;
  const naj = O.reduce((a, b) => (b.predkosc > a.predkosc ? b : a));
  const najwol = O.reduce((a, b) => (b.predkosc < a.predkosc ? b : a));
  const walem = P.segmenty.find((s) => /wał/i.test(s.nazwa) && s.od < naj.do && s.do > naj.od);
  const segDzis = P.segmenty.map((s) => { const seg = K.segmenty[s.id]; const pr = seg.historia.find((x) => x.jazda === J.id) || seg.ostatnia; return { seg, czas: pr.czas, roz: pr.czas - seg.pr, km: s.od }; });
  const blisko = segDzis.reduce((a, b) => (b.roz < a.roz ? b : a)), daleko = segDzis.reduce((a, b) => (b.roz > a.roz ? b : a));
  const T = K.okresy.tydzien, tp = T.poprzedni, zmT = tp ? (T.km - tp.km) / tp.km : 0;
  const tyg = K.tygodnie; let odIlu = 0; for (let k = tyg.length - 2; k >= 0; k--) { odIlu++; if (tyg[k].km >= T.km) break; }
  const nrJazdyTyg = K.jazdy.filter((j) => j.data >= T.od && j.data <= J.data).length;
  const R = K.okresy.rok;

  // ───────── artykuł wiodący ─────────
  const tytul = odIlu >= 3 ? `Tydzień zamknięty na ${f.liczba(T.km)} km — najwięcej od ${odIlu} tygodni` : `${J.nazwa}: ${f.km(J.km)} km w ${f.czasHM(J.czas)}`;
  $('#lead-kicker').textContent = `Relacja · ${f.dzienTyg(J.data)} na wale`;
  $('#t-lead').textContent = tytul;
  $('#lead-lid').textContent = `${J.nazwa} — ${f.km(J.km)} km ze średnią ${f.liczba(J.predkosc, 1)} km/h. Forma rośnie o ${f.liczba(F.zmiana7, 1)} pkt w tydzień, choć zmęczenie wciąż ją wyprzedza.`;
  $('#lead-autor').append('Opracowanie: ', B('redakcja automatyczna'), ` na podstawie danych ze Stravy · ${f.data(K.dzis)}, 15:40`);

  const tekst = $('#lead-tekst');
  tekst.append(
    p(`Start o ${f.godzina(J.data)} spod domu w Konstancinie, meta po `, B(f.czas(J.czas)), ' jazdy. Na liczniku ', B(`${f.km(J.km)} km`), ' i ', B(`${f.liczba(J.przewyzszenie)} m`), ' w górę — jak na Mazowsze przystało, płasko. Średnie tętno ', B(`${J.tetno} bpm`), ', najwyższe ', B(`${J.tetnoMax}`), '. Prędkość przez całą trasę ', spark(P.v.filter((_, i) => i % 6 === 0), { szer: 70 }), ' trzymała się blisko średniej.'),
    p('Najszybciej poszło na odcinku ', B(`${f.liczba(naj.od)}–${f.liczba(naj.do)} km`), walem ? ', wzdłuż wału wiślanego: ' : ': ', Z(B(`${f.liczba(naj.predkosc, 1)} km/h`)), '. Najwolniej — ', B(`${f.liczba(najwol.od)}–${f.liczba(najwol.do)} km`), `, ${f.liczba(najwol.predkosc, 1)} km/h${najwol.od === 0 ? ', czyli rozgrzewka przez miasto' : ''}.`),
    p(`Na trasie ${segDzis.length} ${odm(segDzis.length, 'segment', 'segmenty', 'segmentów')} Stravy. Najbliżej rekordu było na „${blisko.seg.nazwa}”: `, B(f.tempoSeg(blisko.czas)), blisko.roz <= 0 ? ' — nowy rekord!' : [', zaledwie ', B(`${blisko.roz} s`), ` od najlepszego czasu z ${f.data(blisko.seg.prData)}.`], ' Najwięcej zabrakło na „', daleko.seg.nazwa, '”: ', B(`${daleko.roz} s`), '.'),
    p(`To była ${['', 'pierwsza', 'druga', 'trzecia', 'czwarta', 'piąta', 'szósta', 'siódma'][nrJazdyTyg] || nrJazdyTyg + '.'} jazda tygodnia. Razem `, B(`${f.liczba(T.km)} km`), tp ? [` — o ${f.liczba(Math.abs(zmT) * 100)}% ${zmT >= 0 ? 'więcej' : 'mniej'} niż tydzień wcześniej`] : '', '. Ostatnie dwanaście tygodni ', spark(tyg.slice(-12).map((t) => t.km), { szer: 64, obszar: true }), odIlu >= 3 ? ` — i najwięcej od ${odIlu} tygodni.` : '.'),
    p('Od stycznia ', B(`${f.liczba(R.km)} km`), ` w ${R.jazdy} ${odm(R.jazdy, 'jeździe', 'jazdach', 'jazdach')} `, spark(C.narastajaco.filter((_, i) => i % 7 === 0).map((d) => d.km), { szer: 58 }), '. Do celu ', B(`${f.liczba(C.km)} km`), ' brakuje ', B(`${f.liczba(C.km - C.teraz)} km`), ', czyli ', Z(B(`${f.liczba(C.potrzebaNaTydzien)} km`), ' tygodniowo'), ' do sylwestra. Przy obecnym tempie sezon zamknie się na ', B(`${f.liczba(C.prognoza)} km`), C.prognoza >= C.km ? ' — cel w zasięgu, ale bez zapasu.' : ` — zabraknie ${f.liczba(C.km - C.prognoza)} km.`),
    p('Forma', SUP(2), ' wynosi ', B(f.liczba(F.ctl)), ', zmęczenie ', B(f.liczba(F.atl)), '. Świeżość ', B(f.znak(Math.round(F.tsb))), ` oznacza ${F.nazwa.toLowerCase()}: ${F.opis.charAt(0).toLowerCase() + F.opis.slice(1)}`),
  );

  // ───────── rycina 1: mapa + profil ─────────
  (function ryc1() {
    const trasa = P.x.map((x, i) => [x, P.y[i]]);
    let wyk = null;
    const sync = (i) => { mapa.kursor(i); if (wyk) wyk.ustawKursor(i); };
    const mapa = W.mapaTrasy($('#mapa'), { mapa: K.mapa, trasa, segmenty: P.segmenty, km: 10, kmStyl: 'kropka', etykietaStartu: 'Start · meta', kontury: { krok: 0.18, poziomy: Array.from({ length: 24 }, (_, k) => 82 + k * 2), gruby: 10 }, onHover: (i) => { mapa.kursor(i); if (wyk) wyk.ustawKursor(i); }, pad: 16, margines: 1.4, opis: `Mapa trasy: ${J.nazwa}` });
    const maxKm = P.d[P.d.length - 1];
    const tk = []; for (let k = 0; k <= maxKm; k += 10) tk.push({ v: k, s: k + ' km', kotwica: k === 0 ? 'start' : 'middle' });
    const e0 = Math.floor((Math.min(...P.ele) - 4) / 10) * 10, e1 = Math.ceil((Math.max(...P.ele) + 6) / 10) * 10;
    wyk = W.linie($('#profil'), {
      wys: 132, m: { l: 34, r: 4, t: 22, b: 22 }, krzywa: 'linia',
      serie: [{ pts: P.d.map((k, i) => [k, P.ele[i]]), klasa: 's-teren', obszar: true, obszarOd: e0 }],
      x: { min: 0, max: maxKm, ticki: tk }, y: { min: e0, max: e1, ticki: [e0, e1], format: (v) => v + ' m' },
      tlo: ({ g, x, m, H }) => { for (const s of P.segmenty) { W.svg('rect', { x: x(s.od), y: m.t, width: Math.max(2, x(s.do) - x(s.od)), height: H - m.t - m.b, class: 'wk-pasmo' }, g); } },
      nad: ({ g, x, m }) => { let ost = -999; for (const s of P.segmenty) { const px = x(s.od); if (px - ost < 120) continue; W.tekst(g, px, m.t - 7, s.nazwa, { class: 'wk-pasmo-t' }); ost = px; } },
      tip: (i) => [W.naglowekTip(`kilometr ${f.liczba(P.d[i], 1)}`), W.wierszTip(`${f.liczba(P.ele[i])} m`, 'wysokość', 's-roz'), W.wierszTip(`${f.liczba(P.v[i], 1)} km/h`, 'prędkość'), W.wierszTip(`${P.hr[i]} bpm`, 'tętno')],
      naHover: (i) => mapa.kursor(i), opis: 'Profil wysokości trasy',
    });
    $('#ryc1').append(h('b', { text: 'Ryc. 1 — ' }), `Trasa sobotniej pętli (${f.km(J.km)} km) i jej profil. Różowe — segmenty Stravy na trasie. Najedź na profil albo na trasę, żeby zobaczyć to samo miejsce na obu.`, SUP(3));
  })();

  // ───────── kolumna boczna ─────────
  (function boczna() {
    const WIERSZE = [
      { k: 'km', l: 'Dystans', v: (o) => f.km(o.km), u: 'km' },
      { k: 'czas', l: 'Czas w siodle', v: (o) => f.czasHM(o.czas).replace(' min', ''), u: '' },
      { k: 'przewyzszenie', l: 'W górę', v: (o) => f.liczba(o.przewyzszenie), u: 'm' },
      { k: 'jazdy', l: 'Jazdy', v: (o) => String(o.jazdy), u: '' },
      { k: 'predkosc', l: 'Średnia', v: (o) => f.liczba(o.predkosc, 1), u: 'km/h' },
    ];
    const dl = $('#liczby');
    const el = WIERSZE.map((w) => { const dd = h('dd'), por = h('div', { class: 'por' }); dl.append(h('div', { class: 'w' }, h('dt', { text: w.l }), dd, por)); return { w, dd, por }; });
    const ustaw = (k) => {
      const o = K.okresy[k], pr = o.poprzedni;
      for (const { w, dd, por } of el) {
        dd.replaceChildren(w.v(o), w.u ? h('small', { text: w.u }) : '');
        por.replaceChildren();
        if (pr && pr[w.k]) {
          const ch = (o[w.k] - pr[w.k]) / pr[w.k];
          if (w.k === 'predkosc') por.append(B(f.znak(o[w.k] - pr[w.k], 1)), ` km/h względem ${k === 'tydzien' ? 'poprzedniego tygodnia' : 'początku października'}`);
          else por.append(B(`${f.liczba(Math.abs(ch) * 100)}%`), ` ${ch >= 0 ? 'więcej' : 'mniej'} niż ${k === 'tydzien' ? 'tydzień wcześniej' : '1–7 października'}`);
        } else if (k === 'rok') {
          if (w.k === 'km') por.append(`średnio `, B(`${f.liczba(o.km / 44.4)} km`), ' tygodniowo');
          if (w.k === 'jazdy') por.append(`${o.szosa} na szosie, ${o.zwift} na Zwifcie`);
        }
      }
      dl.classList.remove('zmiana'); void dl.offsetWidth; dl.classList.add('zmiana');
    };
    const opcje = [{ k: 'tydzien', s: 'Tydzień' }, { k: 'miesiac', s: 'Miesiąc' }, { k: 'rok', s: 'Rok' }];
    const bs = opcje.map((o) => { const b = h('button', { type: 'button', 'aria-pressed': String(o.k === 'tydzien'), text: o.s }); b.addEventListener('click', () => { bs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); ustaw(o.k); }); return b; });
    $('#okresy').append(...bs);
    ustaw('tydzien');

    // cel
    const dzienRoku = C.narastajaco.length, plan = C.km * dzienRoku / 365;
    $('#cel').append(
      h('div', { class: 'cel-liczba' }, f.liczba(C.teraz), h('small', { text: ` / ${f.liczba(C.km)} km` })),
      h('p', { class: 'cel-opis' }, `${f.procent(C.udzial)} celu po ${dzienRoku} dniach roku. Plan na dziś: `, B(`${f.liczba(plan)} km`), ` — jesteś ${C.teraz >= plan ? 'przed nim' : 'za nim'} o `, B(`${f.liczba(Math.abs(C.teraz - plan))} km`), '.'),
      h('div', { id: 'cel-wykres' }));
    const nar = C.narastajaco, ost = nar.length - 1;
    W.linie($('#cel-wykres'), {
      wys: 104, m: { l: 0, r: 0, t: 8, b: 18 }, krzywa: 'linia',
      serie: [{ pts: Array.from({ length: 365 }, (_, i) => [i, i <= ost ? nar[i].km : null]), klasa: 's-roz' }, { pts: Array.from({ length: 365 }, (_, i) => [i, C.km * (i + 1) / 365]), klasa: 's-szary' }],
      x: { min: 0, max: 364, ticki: [{ v: 0, s: 'sty', kotwica: 'start' }, { v: 181, s: 'lip' }, { v: 364, s: 'gru', kotwica: 'end' }] }, y: { min: 0, max: C.km, ticki: [0, C.km], format: null },
      tip: (i) => [W.naglowekTip(f.dataKrotka(new Date(2026, 0, i + 1))), i <= ost ? W.wierszTip(f.liczba(nar[i].km) + ' km', 'przejechane', 's-roz') : W.wierszTip('—', 'jeszcze przed nami'), W.wierszTip(f.liczba(C.km * (i + 1) / 365) + ' km', 'plan', 's-szary')],
      opis: 'Kilometry narastająco względem planu',
    });

    // cytat — segment z największą liczbą prób
    const ulub = K.segmenty.filter((s) => s.typ === 'szosa').sort((a, b) => b.historia.length - a.historia.length)[0];
    $('#cytat').append(`${ulub.historia.length} razy „${ulub.nazwa}”. Rekord z ${f.data(ulub.prData)} wciąż stoi: ${f.tempoSeg(ulub.pr)}.`, h('cite', { text: '— Tabela ligowa, pozycja 1' }));

    // segmenty dnia
    $('#seg-dnia').append(...segDzis.map((s) => h('li', null,
      h('span', { class: 'n', text: s.seg.nazwa }), h('span', { class: 'c', text: f.tempoSeg(s.czas) }),
      h('span', { class: 'r', text: s.roz <= 0 ? 'nowy rekord' : `rekord ${f.tempoSeg(s.seg.pr)}, strata ${s.roz} s · na ${f.liczba(s.km)} km` }))));
  })();

  // ───────── sezon: small multiples ─────────
  (function sezon() {
    const host = $('#miesiace');
    const maks = 150; // ta sama skala w każdym miesiącu
    for (const ms of K.miesiace) {
      const box = h('div', { class: 'mies' + (ms.biezacy ? ' biezacy' : '') });
      const najd = Math.max(...ms.dni.map((d) => d.km));
      box.append(
        h('div', { class: 'mies-nag' }, h('span', null, wielka(f.miesiac(ms.miesiac - 1)), h('em', { text: String(ms.rok) })), h('b', null, f.liczba(ms.km), h('small', { text: 'km' }))),
        h('div', { class: 'mies-wyk' }),
        h('p', { class: 'mies-opis', text: `${ms.jazdy} ${odm(ms.jazdy, 'jazda', 'jazdy', 'jazd')}${ms.zwift ? ` (${ms.zwift} Zwift)` : ''} · do ${f.liczba(najd)} km` }));
      host.append(box);
      const dzis = K.dni[K.dni.length - 1].data;
      W.slupki(box.querySelector('.mies-wyk'), {
        wys: 70, m: { l: 0, r: 0, t: 6, b: 4 }, maxSzer: 6, promien: 1.5, odstep: 2, max: maks, siatka: true, osY: { ticki: 1, format: null },
        dane: ms.dni.map((d) => {
          const jj = K.dni.find((x) => x.data.getTime() === d.data.getTime()).jazdy.map((id) => K.jazdy[id - 1]);
          const zw = jj.length && jj.every((j) => j.typ === 'zwift');
          return { v: d.km, klasa: d.data.getTime() === dzis.getTime() ? 'akcent' : zw ? 'zw' : '', tip: () => [W.naglowekTip(`${f.dzienTyg(d.data)}, ${f.data(d.data)}`), d.km ? W.wierszTip(f.km(d.km) + ' km', jj.map((j) => j.nazwa).join(', ')) : W.wierszTip('—', 'bez jazdy')] };
        }),
        opis: `${f.miesiac(ms.miesiac - 1)} ${ms.rok}: ${f.liczba(ms.km)} km`,
      });
    }
  })();

  // ───────── forma ─────────
  (function forma() {
    $('#t-forma').textContent = F.atl > F.ctl && F.zmiana7 > 0 ? 'Forma rośnie, zmęczenie wciąż o krok przed nią' : F.tsb > 15 ? 'Świeżo jak przed startem' : 'Forma w równowadze';
    $('#forma-lid').textContent = `Rok w jednym wykresie: zima na trenażerze, luty z przerwą, wiosenny rozpęd i jesienna stabilizacja. Dziś forma ${f.liczba(F.ctl)}, ${F.zmiana7 >= 0 ? 'o' : 'mniej o'} ${f.liczba(Math.abs(F.zmiana7), 1)} pkt ${F.zmiana7 >= 0 ? 'więcej' : ''} niż tydzień temu.`.replace('  ', ' ');
    const dni = K.dni.slice(-365);
    const ticki = []; dni.forEach((d, i) => { if (d.data.getDate() === 1 && d.data.getMonth() % 2 === 0) ticki.push({ v: i, s: f.miesiacKr(d.data.getMonth()) }); });
    $('#pmc-legenda').append(h('span', null, h('i', { class: 'kl' }), 'forma'), h('span', null, h('i', { class: 'kl szary' }), 'zmęczenie'));
    const idx = (data) => dni.findIndex((d) => d.data.getFullYear() === data.getFullYear() && d.data.getMonth() === data.getMonth() && d.data.getDate() === data.getDate());
    let iMax = 0; dni.forEach((d, i) => { if (d.ctl > dni[iMax].ctl) iMax = i; });
    const najT = K.rekordy.find((r) => r.klucz === 'tydzien');
    // podpisy wydarzeń: urlop po lewej od swojej linii, szczyt po prawej — nigdy na sobie
    const adn = [
      { i: idx(new Date(2026, 1, 15)), s: 'Luty: przerwa, choroba', strona: 'start', rzad: 0 },
      { i: idx(new Date(2026, 7, 13)), s: 'Urlop bez roweru', strona: 'end', rzad: 1 },
      { i: iMax, s: `Szczyt formy: ${f.liczba(dni[iMax].ctl)}, ${f.dataKrotka(dni[iMax].data)}`, strona: 'end', rzad: 2 },
    ].filter((a) => a.i >= 0);
    const api = W.linie($('#pmc'), {
      wys: 330, m: { l: 30, r: 10, t: 70, b: 26 },
      serie: [{ pts: dni.map((d, i) => [i, d.ctl]), klasa: 's-tusz', obszar: true, koniec: true }, { pts: dni.map((d, i) => [i, d.atl]), klasa: 's-szary' }],
      x: { ticki }, y: { min: 0, ticki: 4, format: (v) => f.liczba(v) },
      nad: ({ g, x, y, m, W: szer }) => {
        for (const a of adn) {
          const px = x(a.i), py = y(dni[a.i].ctl), ty = m.t - 50 + a.rzad * 17;
          let strona = a.strona;
          if (strona === 'start' && px > szer - 200) strona = 'end';
          if (strona === 'end' && px < 200) strona = 'start';
          W.svg('path', { d: `M${px},${py - 6} L${px},${ty + 4}`, class: 'adn-linia' }, g);
          W.svg('circle', { cx: px, cy: py, r: 3.5, class: 'adn-pkt' }, g);
          W.tekst(g, px + (strona === 'end' ? -6 : 6), ty, a.s, { class: 'adn-t', 'text-anchor': strona });
        }
      },
      tip: (i) => { const d = dni[i]; return [W.naglowekTip(`${f.dzienTyg(d.data)}, ${f.data(d.data)}`), W.wierszTip(f.liczba(d.ctl), 'forma', 's-tusz'), W.wierszTip(f.liczba(d.atl), 'zmęczenie', 's-szary'), W.wierszTip(f.znak(Math.round(d.ctl - d.atl)), 'świeżość')]; },
      opis: 'Forma i zmęczenie w ostatnim roku',
    });
    const btn = $('#pmc-tab'); btn.dataset.tabela = 'Pokaż tabelę'; btn.dataset.wykres = 'Pokaż wykres';
    W.wykresTabela(btn, $('#pmc'), () => W.tabela([{ s: 'Dzień', f: (d) => f.dataNum(d.data) }, { s: 'Forma', num: 1, f: (d) => f.liczba(d.ctl, 1) }, { s: 'Zmęczenie', num: 1, f: (d) => f.liczba(d.atl, 1) }, { s: 'Świeżość', num: 1, f: (d) => f.znak(d.ctl - d.atl, 1) }], dni.slice().reverse(), 'Forma'));
    $('#forma-liczby').append(
      h('div', { class: 'w' }, h('dt', null, h('i', { class: 'kl' }), 'Forma'), h('dd', { text: f.liczba(F.ctl) })),
      h('div', { class: 'w' }, h('dt', null, h('i', { class: 'kl szary' }), 'Zmęczenie'), h('dd', { text: f.liczba(F.atl) })),
      h('div', { class: 'w' }, h('dt', null, 'Świeżość'), h('dd', { text: (F.tsb < 0 ? '−' : '+') + f.liczba(Math.abs(F.tsb)) })));
    const mx = Math.max(...K.strefy.map((z) => z.udzial));
    $('#strefy').append(...K.strefy.map((z) => h('div', { class: 'strefy-w' },
      h('b', { text: 'Z' + z.nr }), h('div', { class: 'tor' }, h('i', { style: { width: (z.udzial / mx * 100).toFixed(1) + '%', opacity: (0.35 + z.nr * 0.13).toFixed(2) } })), h('span', { class: 'p', text: f.procent(z.udzial) }),
      h('span', { class: 'opis', text: `${z.nazwa.toLowerCase()} · ${f.czasHM(z.czas)}` }))));
  })();

  // ───────── tabela ligowa ─────────
  (function liga() {
    const dzis = K.dzis, seg = K.segmenty.slice().sort((a, b) => b.historia.length - a.historia.length);
    const goraco = (s) => s.historia.some((x) => (dzis - x.data) / 86400000 <= 30 && x.czas <= s.pr * 1.03);
    $('#liga').append(h('table', { class: 'liga' },
      h('thead', null, h('tr', null, h('th', { class: 'poz', text: 'Poz.' }), h('th', { text: 'Segment' }), h('th', { class: 'num', text: 'Próby' }), h('th', { class: 'num', text: 'Rekord' }), h('th', { class: 'num', text: 'Ostatnio' }), h('th', { class: 'num', text: 'Strata' }), h('th', { class: 'spark', text: 'Przebieg' }))),
      h('tbody', null, seg.map((s, i) => {
        const r = s.ostatnia.czas - s.pr, cz = s.historia.map((x) => x.czas);
        return h('tr', { class: goraco(s) ? 'goraco' : '' },
          h('td', { class: 'poz', text: String(i + 1) + '.' }),
          h('td', { class: 'nz' }, s.nazwa, h('small', { text: `${s.dl >= 1000 ? f.liczba(s.dl / 1000, 2) + ' km' : s.dl + ' m'} · ${f.liczba(s.nach, 1)}% · ${s.typ === 'zwift' ? 'Zwift, ' + s.moc + ' W' : 'szosa'} · rekord ${f.dataNum(s.prData)}` })),
          h('td', { class: 'num', text: String(s.historia.length) }), h('td', { class: 'num pr', text: f.tempoSeg(s.pr) }), h('td', { class: 'num', text: f.tempoSeg(s.ostatnia.czas) }),
          h('td', { class: 'num', text: r <= 0 ? '—' : `+${r} s` }),
          h('td', { class: 'spark' }, W.sparkline(cz, { szer: 120, wys: 22, odwroc: true, najlepszy: cz.indexOf(Math.min(...cz)), kropkaKonca: true })));
      }))));
  })();

  // ───────── trenażer ─────────
  (function moc() {
    const M = K.moc;
    $('#moc-liczby').append(...[[0, '5 sekund'], [4, '1 minuta'], [6, '5 minut'], [8, '20 minut']].map(([i, l]) => h('div', { class: 'w' }, h('dt', { text: l }), h('dd', null, String(M.wszech[i]), h('small', { text: 'W' })))));
    $('#moc-legenda').append(h('span', null, h('i', { class: 'kl' }), 'cały okres'), h('span', null, h('i', { class: 'kl roz' }), 'ostatnie 42 dni'));
    W.linie($('#krzywa'), {
      wys: 300, m: { l: 36, r: 14, t: 34, b: 26 },
      serie: [{ pts: M.czasy.map((c, i) => [c, M.wszech[i]]), klasa: 's-tusz', obszar: true, obszarOd: 100 }, { pts: M.czasy.map((c, i) => [c, M.ostatnie42[i]]), klasa: 's-roz' }],
      x: { skala: 'log', min: 5, max: 3600, ticki: [[5, '5 s'], [15, '15 s'], [60, '1 min'], [300, '5 min'], [1200, '20 min'], [3600, '60 min']].map(([v, s], k) => ({ v, s, kotwica: k === 0 ? 'start' : k === 5 ? 'end' : 'middle' })) },
      y: { min: 100, max: 900, ticki: [100, 300, 500, 700, 900], format: (v) => f.liczba(v) },
      nad: ({ g, x, y }) => {
        const px = x(1200), py = y(M.wszech[8]);
        W.svg('path', { d: `M${px},${py - 6} L${px},${py - 64} L${px - 12},${py - 64}`, class: 'adn-linia' }, g);
        W.svg('circle', { cx: px, cy: py, r: 3.5, class: 'adn-pkt' }, g);
        W.tekst(g, px - 16, py - 60, `Rekord 20 minut: ${M.wszech[8]} W — z ostatnich tygodni`, { class: 'adn-t', 'text-anchor': 'end' });
      },
      tip: (i) => [W.naglowekTip(M.etykiety[i]), W.wierszTip(M.wszech[i] + ' W', 'cały okres', 's-tusz'), M.ostatnie42[i] != null ? W.wierszTip(M.ostatnie42[i] + ' W', 'ostatnie 42 dni', 's-roz') : W.wierszTip('—', 'brak próby')],
      opis: 'Krzywa mocy z trenażera',
    });
  })();

  // ───────── tablica dni ─────────
  (function tablica() {
    const wrap = $('#tablica');
    const tip = W.tooltip(wrap);
    const t = h('table', { class: 'tab-dni' });
    const glowa = h('tr', null, h('th'), ...Array.from({ length: 31 }, (_, i) => h('th', { text: String(i + 1) })), h('th', { class: 'suma', text: 'km' }));
    t.append(h('thead', null, glowa));
    const body = h('tbody');
    const poz = (km) => (km <= 0 ? 0 : km < 25 ? 1 : km < 45 ? 2 : km < 70 ? 3 : 4);
    for (const ms of K.miesiace) {
      const tr = h('tr', null, h('th', { class: 'mies', scope: 'row' }, wielka(f.miesiacKr(ms.miesiac - 1)), h('em', { text: String(ms.rok).slice(2) })));
      for (let d = 1; d <= 31; d++) {
        const dz = ms.dni.find((x) => x.data.getDate() === d);
        if (!dz) { tr.append(h('td', { class: 'brak' })); continue; }
        const o = K.dni.find((x) => x.data.getTime() === dz.data.getTime());
        const jj = o.jazdy.map((id) => K.jazdy[id - 1]);
        const zw = jj.length && jj.every((j) => j.typ === 'zwift');
        const td = h('td', { class: `d${poz(o.km)}${zw ? ' zw' : ''}${o === K.dni[K.dni.length - 1] ? ' dzis' : ''}`, tabindex: o.km ? 0 : -1, 'aria-label': `${f.data(o.data)}: ${o.km ? f.km(o.km) + ' km' : 'bez jazdy'}` });
        const pokaz = () => { const r = td.getBoundingClientRect(), w = wrap.getBoundingClientRect(); tip.pokaz(r.left - w.left + r.width / 2, r.top - w.top, [W.naglowekTip(`${f.dzienTyg(o.data)}, ${f.data(o.data)}`), o.km ? W.wierszTip(f.km(o.km) + ' km', jj.map((j) => j.nazwa).join(', ')) : W.wierszTip('—', 'bez jazdy')]); };
        td.addEventListener('pointerenter', pokaz); td.addEventListener('focus', pokaz);
        td.addEventListener('pointerleave', () => tip.ukryj()); td.addEventListener('blur', () => tip.ukryj());
        tr.append(td);
      }
      tr.append(h('td', { class: 'suma', text: f.liczba(ms.km) }));
      body.append(tr);
    }
    t.append(body);
    wrap.append(t);
    const kw = (k) => h('i', { style: { background: ['var(--papier-3)', '#CDBFA6', '#9C8F79', '#5F574B', 'var(--tusz)'][k] } });
    $('#tablica-skala').append(h('span', null, kw(0), 'brak jazdy'), h('span', null, kw(1), 'do 25 km'), h('span', null, kw(2), '25–45'), h('span', null, kw(3), '45–70'), h('span', null, kw(4), 'ponad 70'), h('span', { text: '· kropka w rogu: tylko Zwift' }));
  })();

  // ───────── panteon i dziennik ─────────
  $('#panteon-lista').append(...K.rekordy.map((r) => h('li', null,
    h('span', { class: 'n', text: r.nazwa }), h('span', { class: 'v' }, f.liczba(r.wartosc, r.jednostka === 'km/h' || r.klucz === 'dystans' ? 1 : 0), h('small', { text: r.jednostka })),
    h('span', { class: 'd', text: `${f.data(r.data)} — ${r.opis}` }))));
  $('#dziennik-lista').append(...K.jazdy.slice(-9).reverse().map((j) => h('li', null,
    h('span', { class: 'dz', text: `${f.dzienTygKr(j.data)} ${f.dataNumKr(j.data)}` }),
    h('span', { class: 'n' }, j.nazwa.replace('Zwift · ', 'Zwift: '), h('em', { text: j.typ === 'zwift' ? `${f.czas(j.czas)} · ${j.moc} W średnio · ${j.tetno} bpm` : `${f.czas(j.czas)} · ${f.liczba(j.predkosc, 1)} km/h · ${j.tetno} bpm` })),
    h('span', { class: 'km' }, f.km(j.km), h('small', { text: 'km' })))));
  W.typografia(document.body);
})();
