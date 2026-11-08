/* PULS — aplikacja */
(function () {
  'use strict';
  const K = window.K2, f = K.fmt, h = W.h, s = W.svg, ik = A.ik;
  const J = K.ostatnia.jazda, F = K.forma, C = K.cel, T = K.okresy.tydzien;
  const otworzJazde = (j) => A.arkusz(() => A.szczegolyJazdy(j), { tytul: j.nazwa });
  const klik = (el, fn) => { el.addEventListener('click', fn); el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); return el; };
  const CEL = { km: 200, h: 7, jazdy: 5 };
  const sr4 = (k) => K.tygodnie.slice(-5, -1).reduce((a, t) => a + t[k], 0) / 4;
  const naglowek = (tytul, nad) => { const aw = h('button', { class: 'awatar dotyk', type: 'button', 'aria-label': 'Profil', text: 'FM' }); aw.addEventListener('click', () => { location.hash = 'profil'; }); return h('header', { class: 'duzy-tytul' }, h('div', null, h('small', { text: nad }), h('h1', { text: tytul })), aw); };

  function polkole(wart) {
    const W0 = 150, H = 80, r = 62, cx = W0 / 2, cy = 74;
    const svg = s('svg', { width: W0, height: H, viewBox: `0 0 ${W0} ${H}`, 'aria-hidden': 'true' });
    const defs = s('defs', null, svg); const lg = s('linearGradient', { id: 'gr-got', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    [['0', '#FF375F'], ['.5', '#FFC83D'], ['1', '#A6F23C']].forEach(([o, c]) => s('stop', { offset: o, 'stop-color': c }, lg));
    const luk = `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`, dl = Math.PI * r;
    s('path', { d: luk, fill: 'none', stroke: 'rgba(255,255,255,.1)', 'stroke-width': 12, 'stroke-linecap': 'round' }, svg);
    s('path', { d: luk, fill: 'none', stroke: 'url(#gr-got)', 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-dasharray': `${dl} ${dl}`, 'stroke-dashoffset': dl * (1 - wart / 100), style: 'transition: stroke-dashoffset 1.4s cubic-bezier(.2,.8,.2,1)' }, svg);
    const a = Math.PI * (1 - wart / 100); s('circle', { cx: cx + r * Math.cos(a), cy: cy - r * Math.sin(a), r: 8, fill: '#fff', stroke: '#1C1C1E', 'stroke-width': 3 }, svg);
    return svg;
  }
  const odznakaKlasa = (o, i) => (o.zdobyta ? (i % 3 === 1 ? 'srebro' : '') : 'zabl');

  // ───────── Podsumowanie ─────────
  function start(el) {
    const dzis = new Date();
    const kAkt = h('section', { class: 'karta', 'aria-label': 'Aktywność tygodnia' },
      h('div', { class: 'karta-t' }, h('span', { text: 'Aktywność tygodnia' }), h('span', null, `tydzień ${f.tydzienISO(K.dzis)}`)),
      h('div', { class: 'pierscienie-uklad' },
        h('div', { class: 'wartosci' },
          h('div', { class: 'k' }, h('small', { text: 'Dystans' }), h('b', null, `${f.liczba(T.km)}/${CEL.km}`, h('em', { text: ' km' }))),
          h('div', { class: 'l' }, h('small', { text: 'Czas jazdy' }), h('b', null, `${f.liczba(T.czas / 3600, 1)}/${CEL.h}`, h('em', { text: ' h' }))),
          h('div', { class: 'n' }, h('small', { text: 'Jazdy' }), h('b', null, `${T.jazdy}/${CEL.jazdy}`))),
        A.pierscienie([{ udzial: T.km / CEL.km, klasa: 'k', gradient: 'pk' }, { udzial: T.czas / 3600 / CEL.h, klasa: 'l', gradient: 'pl' }, { udzial: T.jazdy / CEL.jazdy, klasa: 'n', gradient: 'pn' }], { rozmiar: 156, grubosc: 18, odstep: 3, gradienty: [{ id: 'pk', od: '#FF2D55', do: '#FF7A95' }, { id: 'pl', od: '#8FE51C', do: '#D7FF7A' }, { id: 'pn', od: '#1FB2F0', do: '#8BE3FF' }] })));

    const P = A.propozycja;
    const kProp = h('section', { class: 'karta propozycja' },
      A.dzisZaliczone ? h('span', { class: 'ok' }, ik('check-circle', 'fill'), 'Dzisiejsza jazda zaliczona') : null,
      h('div', { class: 't' }, ik('sparkle', 'fill'), A.dzisZaliczone ? 'Propozycja na jutro' : 'Propozycja na dziś'),
      h('h3', { text: P.tytul }), h('p', { text: `${P.czas} · ${P.strefa}. ${P.opis}` }));

    const dni = K.dni.slice(-30);
    const kForma = h('section', { class: 'karta kafel' }, h('div', { class: 't' }, ik('trend-up', 'bold', 'l-txt'), 'Forma'), h('div', { class: 'wyk' }), h('div', { class: 'v', text: f.liczba(F.ctl) }), h('div', { class: 'pod' }, h('b', { text: f.znak(F.zmiana7, 1) }), ' w 7 dni'));
    const kGot = h('section', { class: 'karta kafel' }, h('div', { class: 't' }, ik('gauge', 'fill', 'z-txt'), 'Gotowość'), h('div', { class: 'polkole' }, polkole(A.gotowosc), h('b', { text: A.gotowosc + '%' })), h('div', { class: 'pod', text: F.nazwa }));

    const s4 = { km: sr4('km'), czas: sr4('czas'), pr: sr4('predkosc') };
    const trend = (ikona, n, opis, teraz, ref, fmt, jedn) => { const w = teraz >= ref; return h('div', { class: 'trend' }, h('span', { class: 'ik ' + (w ? 'wzrost' : 'spadek') }, ik(w ? 'arrow-up' : 'arrow-down', 'bold')), h('span', null, h('b', { text: n }), h('small', { text: opis })), h('span', { class: 'v' }, fmt(teraz), h('small', { text: jedn }))); };
    const kTrend = h('section', { class: 'karta', 'aria-label': 'Trendy' }, h('div', { class: 'karta-t' }, h('span', { text: 'Trendy' }), h('span', null, 'vs średnia z 4 tygodni')),
      trend('path', 'Dystans tygodniowo', `średnio ${f.liczba(s4.km)} km`, T.km, s4.km, (v) => f.liczba(v), ' km'),
      trend('clock', 'Czas jazdy', `średnio ${f.liczba(s4.czas / 3600, 1)} h`, T.czas, s4.czas, (v) => f.liczba(v / 3600, 1), ' h'),
      trend('speedometer', 'Średnia prędkość', `średnio ${f.liczba(s4.pr, 1)} km/h`, T.predkosc, s4.pr, (v) => f.liczba(v, 1), ' km/h'),
      trend('heartbeat', 'Forma', 'tydzień temu ' + f.liczba(F.ctl - F.zmiana7), F.ctl, F.ctl - F.zmiana7, (v) => f.liczba(v), ' pkt'));

    const mini = h('div', { class: 'mapa-mini' }); const mp = A.mapka(J, { w: 400, h: 150, pad: 16, drogi: true, cien: true }); if (mp) mini.append(mp);
    const kOst = klik(h('section', { class: 'karta ostatnia dotyk', role: 'button', tabindex: 0, 'aria-label': 'Ostatnia jazda' },
      h('div', { class: 'karta-t' }, h('span', { text: J.nazwa }), h('span', null, 'Dziś', ik('caret-right', 'bold'))), mini,
      h('div', { class: 'staty-rz' }, h('div', null, h('small', { text: 'Dystans' }), h('b', null, f.km(J.km), h('em', { text: ' km' }))), h('div', null, h('small', { text: 'Czas' }), h('b', { text: f.czas(J.czas) })), h('div', null, h('small', { text: 'Tętno' }), h('b', null, String(J.tetno), h('em', { text: ' bpm' }))))), () => otworzJazde(J));

    const zdobyte = A.odznaki.filter((o) => o.zdobyta);
    const kNag = h('div', null, h('div', { class: 'sekcja-t' }, h('span', { text: 'Nagrody' }), h('span', { text: `${zdobyte.length} z ${A.odznaki.length}` })),
      h('div', { class: 'karuzela nagrody', style: { marginTop: '12px' } }, A.odznaki.slice().sort((a, b) => b.zdobyta - a.zdobyta).map((o, i) => h('div', { class: 'nagroda ' + odznakaKlasa(o, i), title: o.szczegol }, h('div', { class: 'krazek' }, ik(o.ikona, 'fill')), h('b', { text: o.nazwa }), h('small', { text: o.zdobyta ? o.opis : `${f.liczba(o.postep * 100)}%` })))));

    const kCel = h('section', { class: 'karta' }, h('div', { class: 'karta-t' }, h('span', { text: 'Cel 2026' }), h('span', null, `prognoza ${f.liczba(C.prognoza)} km`)),
      h('div', { class: 'pierscienie-uklad' }, h('div', { class: 'wartosci' }, h('div', { class: 'k' }, h('small', { class: 'z-txt', text: 'Przejechane' }), h('b', null, f.liczba(C.teraz), h('em', { text: ` / ${f.liczba(C.km)} km` }))), h('div', null, h('small', { style: { color: 'var(--tekst-2)' }, text: 'Tygodniowo do końca roku' }), h('b', null, f.liczba(C.potrzebaNaTydzien), h('em', { text: ' km' })))),
        A.pierscienie([{ udzial: C.udzial, klasa: 'z', gradient: 'pz' }], { rozmiar: 104, grubosc: 16, odstep: 0, gradienty: [{ id: 'pz', od: '#FFB020', do: '#FFE08A' }] })));

    el.append(naglowek('Podsumowanie', `${f.dzienTyg(dzis)}, ${dzis.getDate()} ${f.miesiacDop(dzis.getMonth())}`), h('div', { class: 'zaw' }, kAkt, kProp, h('div', { class: 'dwie' }, kForma, kGot), kTrend, kOst, kNag, kCel));
    requestAnimationFrame(() => W.linie(kForma.querySelector('.wyk'), { wys: 50, m: { l: 2, r: 6, t: 4, b: 2 }, siatka: false, serie: [{ pts: dni.map((d, i) => [i, d.ctl]), klasa: 's-l', koniec: true }], x: { ticki: [] }, y: { min: Math.min(...dni.map((d) => d.ctl)) - 4, max: Math.max(...dni.map((d) => d.ctl)) + 2, ticki: [], format: null }, opis: 'Forma, 30 dni' }));
  }

  // ───────── Jazdy ─────────
  function jazdy(el) {
    let filtr = 'wszystkie';
    const lista = h('div', { class: 'zaw' });
    const przyc = [['wszystkie', 'Wszystkie'], ['szosa', 'Szosa'], ['zwift', 'Zwift']].map(([k, n]) => { const b = h('button', { type: 'button', 'aria-pressed': String(k === filtr), text: n }); b.addEventListener('click', () => { filtr = k; przyc.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); rysuj(); }); return b; });
    el.append(naglowek('Jazdy', `${K.jazdy.length} jazd · ${f.liczba(K.okresy.wszystko.km)} km`), h('div', { class: 'segm', role: 'group', 'aria-label': 'Rodzaj' }, przyc), lista);
    function rysuj() {
      lista.replaceChildren();
      const jj = K.jazdy.filter((j) => filtr === 'wszystkie' || j.typ === filtr).slice(-40).reverse();
      let m0 = null, grp = null;
      for (const j of jj) {
        const m = j.data.getMonth();
        if (m !== m0) { m0 = m; grp = h('div', { class: 'lista-ios' }); const suma = jj.filter((x) => x.data.getMonth() === m && x.data.getFullYear() === j.data.getFullYear()).reduce((a, x) => a + x.km, 0); lista.append(h('div', { class: 'grupa-t' }, h('span', { text: `${f.miesiac(m)} ${j.data.getFullYear()}` }), h('span', { text: f.liczba(suma) + ' km' })), grp); }
        const box = h('div', { class: 'ikb' + (j.typ === 'zwift' ? ' zw' : '') }); const mp = A.mapka(j, { w: 44, h: 44, pad: 5 }); box.append(mp || ik('monitor-play', 'fill'));
        const pr = A.osiagniecia(j).some((x) => x.typ === 'pr');
        grp.append(klik(h('div', { class: 'wiersz dotyk', role: 'button', tabindex: 0, 'aria-label': j.nazwa }, box, h('div', { style: { minWidth: 0 } }, h('h3', null, j.nazwa.replace('Zwift · ', ''), pr ? ik('trophy', 'fill', 'pr-ik') : null), h('p', { text: `${f.dzienTyg(j.data)} · ${f.czasHM(j.czas)}` })), h('div', { class: 'km' }, f.km(j.km), h('small', { text: j.typ === 'zwift' ? j.moc + ' W' : f.liczba(j.predkosc, 1) + ' km/h' }))), () => otworzJazde(j)));
      }
    }
    rysuj();
  }

  // ───────── Postępy ─────────
  function postepy(el) {
    const z = h('div', { class: 'zaw' });
    el.append(naglowek('Postępy', 'Trendy i rekordy'), z);
    const kF = h('section', { class: 'karta' }, h('div', { class: 'karta-t' }, h('span', { text: 'Forma i zmęczenie' }), h('span', null, '90 dni')), h('div', { class: 'w', style: { marginTop: '8px' } }), h('div', { class: 'legenda' }, h('span', null, h('i', { style: { background: 'var(--lime)' } }), 'forma'), h('span', null, h('i', { style: { background: 'rgba(235,235,245,.3)' } }), 'zmęczenie')));
    const kT = h('section', { class: 'karta' }, h('div', { class: 'karta-t' }, h('span', { text: 'Kilometry' }), h('span', null, '12 tygodni')), h('div', { class: 'w', style: { marginTop: '8px' } }), h('div', { class: 'legenda' }, h('span', null, h('i', { style: { background: 'var(--koral)' } }), 'szosa'), h('span', null, h('i', { style: { background: 'var(--zwift)' } }), 'Zwift')));
    const top = K.segmenty.slice().sort((a, b) => b.historia.length - a.historia.length).slice(0, 5);
    const kS = h('div', null, h('div', { class: 'grupa-t' }, h('span', { text: 'Ulubione segmenty' })), h('div', { class: 'lista-ios' }, top.map((sg) => h('div', { class: 'wiersz' }, h('div', { class: 'ikb', style: { background: 'rgba(166,242,60,.12)', color: 'var(--lime)', fontSize: '20px' } }, ik(sg.typ === 'zwift' ? 'monitor-play' : 'path', 'bold')), h('div', { style: { minWidth: 0 } }, h('h3', { text: sg.nazwa }), h('p', { text: `${sg.historia.length} prób · ostatnio ${f.tempoSeg(sg.ostatnia.czas)}` })), h('div', { class: 'km' }, f.tempoSeg(sg.pr), h('small', { text: 'rekord' }))))));
    const ikR = { dystans: 'path', predkosc: 'lightning', przewyzszenie: 'mountains', tydzien: 'calendar-blank', moc20: 'barbell', tetno: 'heartbeat' };
    const kR = h('div', null, h('div', { class: 'grupa-t' }, h('span', { text: 'Rekordy' })), h('div', { class: 'lista-ios' }, K.rekordy.map((r) => h('div', { class: 'wiersz' }, h('div', { class: 'ikb', style: { background: 'rgba(255,200,61,.14)', color: 'var(--zloto)', fontSize: '20px' } }, ik(ikR[r.klucz], 'fill')), h('div', { style: { minWidth: 0 } }, h('h3', { text: r.nazwa }), h('p', { text: f.data(r.data) })), h('div', { class: 'km' }, f.liczba(r.wartosc, r.jednostka === 'km/h' || r.klucz === 'dystans' ? 1 : 0), h('small', { text: r.jednostka }))))));
    const kM = h('section', { class: 'karta' }, h('div', { class: 'karta-t' }, h('span', { text: 'Krzywa mocy' }), h('span', null, 'Zwift')), h('div', { class: 'w', style: { marginTop: '8px' } }), h('p', { class: 'przypis', style: { textAlign: 'left', padding: '8px 0 0' }, text: 'Tylko z trenażera — na szosie nie mamy miernika mocy.' }));
    z.append(kF, kT, kS, kR, kM);
    requestAnimationFrame(() => {
      const dni = K.dni.slice(-90);
      W.linie(kF.querySelector('.w'), { wys: 150, m: { l: 26, r: 8, t: 10, b: 6 }, serie: [{ pts: dni.map((d, i) => [i, d.ctl]), klasa: 's-l', obszar: true, koniec: true }, { pts: dni.map((d, i) => [i, d.atl]), klasa: 's-szary' }], x: { ticki: [] }, y: { min: 0, max: 80, ticki: [0, 40, 80], format: (v) => v }, tip: (i) => [W.naglowekTip(f.dataKrotka(dni[i].data)), W.wierszTip(f.liczba(dni[i].ctl), 'forma', 's-l'), W.wierszTip(f.liczba(dni[i].atl), 'zmęczenie')], opis: 'Forma' });
      const t12 = K.tygodnie.slice(-12).map((t) => { const od = t.od, doo = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 7), jj = K.jazdy.filter((j) => j.data >= od && j.data < doo); return { t, a: jj.filter((j) => j.typ === 'szosa').reduce((x, j) => x + j.km, 0), b: jj.filter((j) => j.typ === 'zwift').reduce((x, j) => x + j.km, 0) }; });
      W.slupki(kT.querySelector('.w'), { wys: 150, m: { l: 26, r: 4, t: 16, b: 20 }, maxSzer: 14, promien: 7, odstep: 3, osY: { ticki: 2, format: (v) => v }, osX: (i) => (i % 3 === 2 ? f.dataKrotka(t12[i].t.od) : null), wartosc: (d, i) => (i === 11 ? f.liczba(d.v) : null), dane: t12.map((w) => ({ v: w.a + w.b, klasa: w.t.biezacy ? 'akcent' : '', czesci: [{ v: w.a, klasa: 'cz-szosa' }, { v: w.b, klasa: 'cz-zwift' }], tip: () => [W.naglowekTip(`tydzień ${f.dataKrotka(w.t.od)}`), W.wierszTip(f.liczba(w.a + w.b) + ' km', 'razem'), W.wierszTip(f.liczba(w.a) + ' km', 'szosa', 's-k'), W.wierszTip(f.liczba(w.b) + ' km', 'Zwift', 's-zw')] })), opis: 'Kilometry' });
      const M = K.moc;
      W.linie(kM.querySelector('.w'), { wys: 150, m: { l: 30, r: 8, t: 10, b: 20 }, serie: [{ pts: M.czasy.map((c, i) => [c, M.wszech[i]]), klasa: 's-k', obszar: true, obszarOd: 100 }], x: { skala: 'log', min: 5, max: 3600, ticki: [[5, '5 s'], [60, '1 min'], [300, '5 min'], [1200, '20 min'], [3600, '1 h']].map(([v, t], k) => ({ v, s: t, kotwica: k === 0 ? 'start' : k === 4 ? 'end' : 'middle' })) }, y: { min: 100, max: 900, ticki: [100, 500, 900], format: (v) => v }, tip: (i) => [W.naglowekTip(M.etykiety[i]), W.wierszTip(M.wszech[i] + ' W', 'najlepiej', 's-k')], opis: 'Krzywa mocy' });
    });
  }

  // ───────── Profil ─────────
  function profil(el) {
    const Wsz = K.okresy.wszystko;
    el.append(h('div', { class: 'profil-g' }, h('div', { class: 'duzy', text: 'FM' }), h('h1', { text: 'Fryderyk Marszałek' }), h('p', { text: `Poziom ${A.poziom.nr} · ${f.liczba(Wsz.km)} km · ${Wsz.jazdy} jazd` })),
      h('div', { class: 'zaw' }, h('div', { class: 'grupa-t' }, h('span', { text: 'Nagrody' })), h('section', { class: 'karta' }, h('div', { class: 'nagrody-siatka' }, A.odznaki.map((o, i) => h('div', { class: 'nagroda ' + odznakaKlasa(o, i), title: o.szczegol }, h('div', { class: 'krazek' }, ik(o.ikona, 'fill')), h('b', { text: o.nazwa }), h('small', { text: o.zdobyta ? o.opis : `${f.liczba(o.postep * 100)}% · ${o.opis}` }))))),
        h('div', { class: 'grupa-t' }, h('span', { text: 'Ustawienia' })),
        h('div', { class: 'lista-ios' }, [['link', 'Strava', 'połączona · dane przykładowe', '#FC4C02'], ['heartbeat', 'Strefy tętna', `maks. ${K.zawodnik.tetnoMax} bpm`, '#FF375F'], ['target', 'Cele tygodnia', `${CEL.km} km · ${CEL.h} h · ${CEL.jazdy} jazd`, '#A6F23C'], ['bell', 'Powiadomienia', 'propozycja na jutro o 20:00', '#3BC4FA']].map(([i, n, o, c]) => h('div', { class: 'wiersz' }, h('div', { class: 'ikb', style: { background: c, color: '#000', fontSize: '22px', width: '32px', height: '32px', borderRadius: '8px' } }, ik(i, 'fill')), h('div', null, h('h3', { text: n }), h('p', { text: o })), ik('caret-right', 'bold', 'chev')))),
        h('p', { class: 'przypis', text: 'Kolarstwo · styl Puls. Liczby są przykładowe.' })));
  }

  A.aplikacja({ tytul: 'Kolarstwo', zakladki: [{ id: 'start', nazwa: 'Podsumowanie', ikona: 'circle-half' }, { id: 'jazdy', nazwa: 'Jazdy', ikona: 'bicycle' }, { id: 'postepy', nazwa: 'Postępy', ikona: 'chart-bar' }, { id: 'profil', nazwa: 'Profil', ikona: 'user-circle' }], ekrany: { start, jazdy, postepy, profil } });
})();
