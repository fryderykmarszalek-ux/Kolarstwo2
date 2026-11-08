/* FEED — aplikacja */
(function () {
  'use strict';
  const K = window.K2, f = K.fmt, h = W.h, ik = A.ik;
  const J = K.ostatnia.jazda, F = K.forma, C = K.cel, T = K.okresy.tydzien;
  const otworzJazde = (j) => A.arkusz(() => A.szczegolyJazdy(j), { tytul: j.nazwa });
  const klik = (el, fn) => { el.addEventListener('click', fn); el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); return el; };
  const gora = () => { const b1 = h('button', { type: 'button', 'aria-label': 'Szukaj' }, ik('magnifying-glass')), b2 = h('button', { type: 'button', 'aria-label': 'Powiadomienia' }, ik('bell'), h('span', { class: 'kropka' })); return h('header', { class: 'top' }, h('h1', null, 'Kola', h('b', { text: 'r' }), 'stwo'), h('div', { class: 'ikony' }, b1, b2)); };

  // opis jazdy pisany z danych
  function opis(j) {
    if (j.id === J.id) { const O = K.ostatnia.odcinki, n = O.reduce((a, b) => (b.predkosc > a.predkosc ? b : a)); return `Najszybciej na wale: ${f.liczba(n.predkosc, 1)} km/h między ${f.liczba(n.od)} a ${f.liczba(n.do)} km.`; }
    if (j.typ === 'zwift') return j.nazwa.includes('Wyścig') ? 'Wyścig grupowy — średnia moc wyżej niż zwykle.' : j.nazwa.includes('Spokojnie') ? 'Luźne kręcenie na regenerację.' : null;
    if (j.km >= 80) return 'Długa jazda — taka buduje wytrzymałość na cały sezon.';
    return null;
  }
  function kartaAkt(j) {
    const os = A.osiagniecia(j), pr = os.filter((x) => x.typ === 'pr'), bl = os.filter((x) => x.typ === 'blisko');
    const art = h('article', { class: 'akt' });
    const o = opis(j);
    art.append(
      h('div', { class: 'akt-nag' }, h('div', { class: 'av', text: 'FM' }), h('div', null, h('b', { text: 'Fryderyk Marszałek' }), h('small', null, `${A.wielka(f.kiedy(j.data))} o ${f.godzina(j.data)} · ${j.typ === 'zwift' ? 'Zwift' : 'Konstancin-Jeziorna'}`)), ik(j.typ === 'zwift' ? 'monitor-play' : 'bicycle')),
      h('h3', { text: j.nazwa.replace('Zwift · ', '') }), o ? h('p', { class: 'opis', text: o }) : null,
      h('div', { class: 'akt-staty' },
        h('div', null, h('small', { text: 'Dystans' }), h('b', null, f.km(j.km), h('em', { text: ' km' }))),
        j.typ === 'zwift' ? h('div', null, h('small', { text: 'Śr. moc' }), h('b', null, String(j.moc), h('em', { text: ' W' }))) : h('div', null, h('small', { text: 'Średnia' }), h('b', null, f.liczba(j.predkosc, 1), h('em', { text: ' km/h' }))),
        h('div', null, h('small', { text: 'Czas' }), h('b', { text: f.czasHM(j.czas) }))));
    if (j.typ === 'szosa') { const m = h('div', { class: 'akt-mapa' }); m.append(A.mapka(j, { w: 400, h: 220, pad: 22, drogi: true, cien: true })); art.append(klik(Object.assign(m, { tabIndex: 0 }), () => otworzJazde(j))); m.setAttribute('role', 'button'); m.setAttribute('aria-label', 'Mapa: ' + j.nazwa); }
    else art.append(klik(h('div', { class: 'akt-zwift', role: 'button', tabindex: 0, 'aria-label': j.nazwa }, h('b', null, String(j.moc), h('em', { text: ' W' })), h('span', null, `NP ${j.mocNP} W`, h('br'), `${j.tetno} bpm · ${f.liczba(j.kcal)} kcal`)), () => otworzJazde(j)));
    const chipy = [];
    if (pr.length) chipy.push(h('span', { class: 'os pr' }, ik('trophy', 'fill'), pr.length === 1 ? 'Rekord segmentu' : `${pr.length} rekordy`));
    if (bl.length) chipy.push(h('span', { class: 'os blisko' }, ik('star', 'fill'), `${bl.length} blisko rekordu`));
    if (!pr.length && !bl.length && os.length) chipy.push(h('span', { class: 'os' }, ik('path', 'bold'), `${os.length} ${A.odm(os.length, 'segment', 'segmenty', 'segmentów')}`));
    const lnk = h('button', { class: 'link', type: 'button' }, 'Szczegóły', ik('caret-right', 'bold'));
    lnk.addEventListener('click', () => otworzJazde(j));
    art.append(h('div', { class: 'akt-stopka' }, h('div', { class: 'osiagi' }, chipy), lnk));
    return art;
  }

  // ───────── Start: oś czasu ─────────
  function start(el) {
    const maxD = Math.max(60, ...A.tydzienDni.map((d) => d.km));
    const pas = h('section', { class: 'tydzien-pas', 'aria-label': 'Ten tydzień' },
      h('div', { class: 'tp-g' }, h('h2', { text: 'Ten tydzień' }), h('span', { text: `${f.znak(Math.round((T.km - T.poprzedni.km) / T.poprzedni.km * 100))}% vs poprzedni` })),
      h('div', { class: 'tp-staty' }, h('div', null, h('small', { text: 'Dystans' }), h('b', null, f.liczba(T.km), h('em', { text: ' km' }))), h('div', null, h('small', { text: 'Czas' }), h('b', { text: f.czasHM(T.czas).replace(' min', '') })), h('div', null, h('small', { text: 'W górę' }), h('b', null, f.liczba(T.przewyzszenie), h('em', { text: ' m' })))),
      h('div', { class: 'tp-dni' }, A.tydzienDni.map((d) => h('div', { class: `tp-d ${d.typ || ''}${d.dzis ? ' dzis' : ''}`, title: d.km ? f.km(d.km) + ' km' : '' }, h('i', { style: { height: (d.km ? 8 + d.km / maxD * 52 : 4) + 'px' } }), h('span', { text: f.dzienTygKr(d.data) })))));
    const wz = A.wyzwania[0];
    const wstWyz = h('section', { class: 'wstawka' }, h('div', { class: 'tarcza' }, ik('flag-checkered', 'fill')), h('div', null, h('small', { text: 'Wyzwanie tygodnia' }), h('h3', { text: `200 km do niedzieli · ${f.procent(wz.udzial)}` }), h('p', { text: `Zostało ${f.liczba(wz.cel - wz.wart)} km.` }), A.pasek(wz.udzial)));
    const moc = A.odznaki.find((o) => o.id === 'moc');
    const wstMoc = h('section', { class: 'wstawka zloto' }, h('div', { class: 'tarcza' }, ik('barbell', 'fill')), h('div', null, h('small', { text: 'Nowa odznaka' }), h('h3', { text: moc.nazwa }), h('p', { text: `${A.wielka(moc.szczegol)} — na Zwifcie.` })));
    const jj = K.jazdy.slice(-10).reverse();
    el.append(gora(), pas, kartaAkt(jj[0]), wstWyz, ...jj.slice(1, 4).map(kartaAkt), wstMoc, ...jj.slice(4).map(kartaAkt), h('p', { class: 'przypis', text: 'To wszystkie jazdy z ostatnich dwóch tygodni. Starsze w zakładce Kalendarz.' }));
  }

  // ───────── Kalendarz ─────────
  function kalendarz(el) {
    const miesiace = K.miesiace;
    let i = miesiace.length - 1;
    const nag = h('div', { class: 'kal-nag' }), pod = h('div', { class: 'kal-podsum' }), siatka = h('div', { class: 'kal-siatka' }), lista = h('div', { class: 'lista-m' });
    const wst = h('button', { type: 'button', 'aria-label': 'Poprzedni miesiąc' }, ik('caret-left', 'bold')), dal = h('button', { type: 'button', 'aria-label': 'Następny miesiąc' }, ik('caret-right', 'bold'));
    wst.addEventListener('click', () => { if (i > 0) { i--; rysuj(); } }); dal.addEventListener('click', () => { if (i < miesiace.length - 1) { i++; rysuj(); } });
    el.append(gora(), nag, pod, siatka, lista);
    function rysuj() {
      const ms = miesiace[i], r = ms.rok, m = ms.miesiac - 1;
      nag.replaceChildren(h('h2', { text: `${A.wielka(f.miesiac(m))} ${r}` }), h('div', { class: 'str' }, wst, dal));
      wst.disabled = i === 0; dal.disabled = i === miesiace.length - 1;
      pod.replaceChildren(h('div', null, h('small', { text: 'Dystans' }), h('b', { text: f.liczba(ms.km) + ' km' })), h('div', null, h('small', { text: 'Jazdy' }), h('b', { text: String(ms.jazdy) })), h('div', null, h('small', { text: 'Czas' }), h('b', { text: f.liczba(ms.czas / 3600, 1) + ' h' })));
      siatka.replaceChildren(...['pn', 'wt', 'śr', 'cz', 'pt', 'sb', 'nd'].map((d) => h('div', { class: 'dn', text: d })));
      const pierwszy = new Date(r, m, 1), przes = (pierwszy.getDay() + 6) % 7, dniM = new Date(r, m + 1, 0).getDate();
      for (let k = 0; k < przes; k++) siatka.append(h('div', { class: 'kd pusty' }));
      const mies = K.jazdy.filter((j) => j.data.getFullYear() === r && j.data.getMonth() === m);
      for (let d = 1; d <= dniM; d++) {
        const data = new Date(r, m, d), jj = mies.filter((j) => j.data.getDate() === d), km = jj.reduce((a, j) => a + j.km, 0);
        const typ = jj.length ? (jj.some((j) => j.typ === 'szosa') ? 'szosa' : 'zwift') : '';
        const dzis = data.toDateString() === K.dzis.toDateString(), przyszly = data > K.dzis;
        const rozm = km ? Math.round(16 + Math.min(1, km / 90) * 18) : 0;
        const kom = h('div', { class: `kd ${typ}${jj.length ? ' jazda' : ''}${dzis ? ' dzis' : ''}${przyszly ? ' przyszly' : ''}`, tabindex: jj.length ? 0 : -1, role: jj.length ? 'button' : null, 'aria-label': jj.length ? `${d} ${f.miesiacDop(m)}: ${f.km(km)} km` : null },
          jj.length ? h('span', { class: 'bab', style: { width: rozm + 'px', height: rozm + 'px' }, text: km >= 40 ? f.liczba(km) : '' }) : h('span', { text: String(d) }));
        if (jj.length) klik(kom, () => otworzJazde(jj[jj.length - 1]));
        siatka.append(kom);
      }
      lista.replaceChildren(...mies.slice().reverse().map((j) => { const box = h('div', { class: 'ikb' + (j.typ === 'zwift' ? ' zw' : '') }); box.append(A.mapka(j, { w: 52, h: 52, pad: 5, drogi: true }) || ik('monitor-play', 'fill')); return klik(h('div', { class: 'lm dotyk', role: 'button', tabindex: 0, 'aria-label': j.nazwa }, box, h('div', { style: { minWidth: 0 } }, h('h3', { text: j.nazwa.replace('Zwift · ', '') }), h('p', { text: `${f.dzienTyg(j.data)} ${j.data.getDate()} · ${f.czasHM(j.czas)}` })), h('div', { class: 'km' }, f.km(j.km), h('small', { text: 'km' }))), () => otworzJazde(j)); }));
      if (W.typografia) W.typografia(el);
    }
    rysuj();
  }

  // ───────── Postępy ─────────
  function postepy(el) {
    const sF = h('section', { class: 'sekcja' }, h('h2', null, 'Forma', h('span', { text: F.nazwa })), h('div', { class: 'duza' }, h('b', { text: f.liczba(F.ctl) }), h('span', null, ik('trend-up', 'bold'), f.znak(F.zmiana7, 1) + ' w 7 dni')), h('div', { class: 'w', style: { marginTop: '8px' } }), h('div', { class: 'legenda' }, h('span', null, h('i', { style: { background: 'var(--akc)' } }), 'forma'), h('span', null, h('i', { style: { background: '#BDBDC6' } }), 'zmęczenie')));
    const sT = h('section', { class: 'sekcja' }, h('h2', null, 'Kilometry tygodniowo', h('span', { text: '12 tyg.' })), h('div', { class: 'w', style: { marginTop: '10px' } }), h('div', { class: 'legenda' }, h('span', null, h('i', { style: { background: 'var(--akc)' } }), 'szosa'), h('span', null, h('i', { style: { background: 'var(--zwift)' } }), 'Zwift')));
    const top = K.segmenty.slice().sort((a, b) => b.historia.length - a.historia.length).slice(0, 6);
    const sS = h('section', { class: 'sekcja' }, h('h2', null, 'Segmenty', h('span', { text: 'rekord · ostatnio' })), h('div', { class: 'tabela-seg', style: { marginTop: '6px' } }, top.map((sg) => h('div', null, h('div', null, h('b', { text: sg.nazwa }), h('small', { text: `${sg.dl >= 1000 ? f.liczba(sg.dl / 1000, 1) + ' km' : sg.dl + ' m'} · ${sg.historia.length} prób` })), h('div', { class: 'c' }, f.tempoSeg(sg.pr), h('small', { text: ' PR' })), h('div', { class: 'ost', text: f.tempoSeg(sg.ostatnia.czas) })))));
    const sR = h('section', { class: 'sekcja' }, h('h2', null, 'Rekordy'), h('div', { class: 'rek-siatka' }, K.rekordy.map((r) => h('div', null, h('small', { text: r.nazwa }), h('b', null, f.liczba(r.wartosc, r.jednostka === 'km/h' || r.klucz === 'dystans' ? 1 : 0), h('em', { text: ' ' + r.jednostka }))))));
    const sM = h('section', { class: 'sekcja' }, h('h2', null, 'Krzywa mocy', h('span', { text: 'Zwift' })), h('div', { class: 'w', style: { marginTop: '10px' } }), h('p', { class: 'przypis', style: { textAlign: 'left', padding: '8px 0 0' }, text: 'Tylko z trenażera — na szosie nie mamy miernika mocy.' }));
    el.append(gora(), sF, sT, sS, sR, sM);
    requestAnimationFrame(() => {
      const dni = K.dni.slice(-90);
      W.linie(sF.querySelector('.w'), { wys: 140, m: { l: 26, r: 8, t: 10, b: 6 }, serie: [{ pts: dni.map((d, i) => [i, d.ctl]), klasa: 's-a', obszar: true, koniec: true }, { pts: dni.map((d, i) => [i, d.atl]), klasa: 's-szary' }], x: { ticki: [] }, y: { min: 0, max: 80, ticki: [0, 40, 80], format: (v) => v }, tip: (i) => [W.naglowekTip(f.dataKrotka(dni[i].data)), W.wierszTip(f.liczba(dni[i].ctl), 'forma', 's-a'), W.wierszTip(f.liczba(dni[i].atl), 'zmęczenie')], opis: 'Forma' });
      const t12 = K.tygodnie.slice(-12).map((t) => { const od = t.od, doo = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 7), jj = K.jazdy.filter((j) => j.data >= od && j.data < doo); return { t, a: jj.filter((j) => j.typ === 'szosa').reduce((x, j) => x + j.km, 0), b: jj.filter((j) => j.typ === 'zwift').reduce((x, j) => x + j.km, 0) }; });
      W.slupki(sT.querySelector('.w'), { wys: 150, m: { l: 26, r: 4, t: 16, b: 20 }, maxSzer: 16, promien: 4, odstep: 3, osY: { ticki: 2, format: (v) => v }, osX: (i) => (i % 3 === 2 ? f.dataKrotka(t12[i].t.od) : null), wartosc: (d, i) => (i === 11 ? f.liczba(d.v) : null), dane: t12.map((w) => ({ v: w.a + w.b, klasa: w.t.biezacy ? 'akcent' : '', czesci: [{ v: w.a, klasa: 'cz-szosa' }, { v: w.b, klasa: 'cz-zwift' }], tip: () => [W.naglowekTip(`tydzień ${f.dataKrotka(w.t.od)}`), W.wierszTip(f.liczba(w.a + w.b) + ' km', 'razem'), W.wierszTip(f.liczba(w.a) + ' km', 'szosa', 's-a'), W.wierszTip(f.liczba(w.b) + ' km', 'Zwift', 's-zw')] })), opis: 'Kilometry' });
      const M = K.moc;
      W.linie(sM.querySelector('.w'), { wys: 150, m: { l: 30, r: 8, t: 10, b: 20 }, serie: [{ pts: M.czasy.map((c, i) => [c, M.wszech[i]]), klasa: 's-a', obszar: true, obszarOd: 100 }], x: { skala: 'log', min: 5, max: 3600, ticki: [[5, '5 s'], [60, '1 min'], [300, '5 min'], [1200, '20 min'], [3600, '1 h']].map(([v, t], k) => ({ v, s: t, kotwica: k === 0 ? 'start' : k === 4 ? 'end' : 'middle' })) }, y: { min: 100, max: 900, ticki: [100, 500, 900], format: (v) => v }, tip: (i) => [W.naglowekTip(M.etykiety[i]), W.wierszTip(M.wszech[i] + ' W', 'najlepiej', 's-a')], opis: 'Krzywa mocy' });
    });
  }

  // ───────── Profil ─────────
  function profil(el) {
    const Wsz = K.okresy.wszystko;
    el.append(gora(), h('section', { class: 'profil-g' }, h('div', { class: 'av', text: 'FM' }), h('div', null, h('h1', { text: 'Fryderyk Marszałek' }), h('p', { text: 'Konstancin-Jeziorna · szosa i Zwift' }))),
      h('div', { class: 'profil-liczby' }, h('div', null, h('b', { text: f.liczba(Wsz.km) }), h('small', { text: 'km' })), h('div', null, h('b', { text: String(Wsz.jazdy) }), h('small', { text: 'jazd' })), h('div', null, h('b', { text: f.liczba(Wsz.przewyzszenie) }), h('small', { text: 'm w górę' }))),
      h('section', { class: 'sekcja' }, h('h2', null, 'Odznaki', h('span', { text: `${A.odznaki.filter((o) => o.zdobyta).length} z ${A.odznaki.length}` })), h('div', { class: 'tarcze' }, A.odznaki.map((o) => h('div', { class: 'tz' + (o.zdobyta ? '' : ' zabl'), title: o.szczegol }, h('div', { class: 'tarcza' }, ik(o.ikona, 'fill')), h('b', { text: o.nazwa }), h('small', { text: o.zdobyta ? o.opis : f.liczba(o.postep * 100) + '%' }))))),
      h('section', { class: 'sekcja' }, h('h2', null, 'Ustawienia'), [['link', 'Strava', 'połączona · dane przykładowe'], ['heartbeat', 'Strefy tętna', `maks. ${K.zawodnik.tetnoMax} bpm`], ['target', 'Cel roczny', `${f.liczba(C.km)} km`]].map(([i, n, o]) => h('div', { class: 'ust' }, ik(i), h('div', null, n, h('small', { text: o })), ik('caret-right', 'bold')))),
      h('p', { class: 'przypis', text: 'Kolarstwo · styl Feed. Liczby są przykładowe.' }));
  }

  A.aplikacja({ tytul: 'Kolarstwo', zakladki: [{ id: 'start', nazwa: 'Start', ikona: 'house' }, { id: 'kalendarz', nazwa: 'Kalendarz', ikona: 'calendar-blank' }, { id: 'postepy', nazwa: 'Postępy', ikona: 'chart-line-up' }, { id: 'profil', nazwa: 'Profil', ikona: 'user' }], ekrany: { start, kalendarz, postepy, profil } });
})();
