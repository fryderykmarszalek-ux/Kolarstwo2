/* ŚWIAT — aplikacja */
(function () {
  'use strict';
  const K = window.K2, f = K.fmt, h = W.h, s = W.svg, ik = A.ik;
  const J = K.ostatnia.jazda, F = K.forma, C = K.cel, T = K.okresy.tydzien, LV = A.poziom;

  // ───────── ilustracja świata (niebo zmienia się z porą dnia) ─────────
  const PALETY = {
    dzien: { niebo: ['#3A88D8', '#9FD0F7'], slonce: '#FFF7D1', blask: '#FFFFFF', gory: ['#B5D3F1', '#8DB8E6', '#6597D3', '#3F73B8'], snieg: '#F7FBFF', chmura: '#FFFFFF', droga: '#EAF0F8', theme: '#3A88D8' },
    swit: { niebo: ['#5C7FD0', '#FFC9A8'], slonce: '#FFE3B0', blask: '#FFD7A8', gory: ['#C9C3E6', '#A3A6DA', '#7C86C8', '#5263A8'], snieg: '#FFF4EC', chmura: '#FFE9DE', droga: '#F4ECEA', theme: '#5C7FD0' },
    zmierzch: { niebo: ['#4F4FA0', '#F49A6A'], slonce: '#FFD08A', blask: '#FF9D66', gory: ['#B59ACB', '#8C7DBE', '#6162A6', '#3E4687'], snieg: '#FCE8E0', chmura: '#FFD6C2', droga: '#EDE3EA', theme: '#4F4FA0' },
    noc: { niebo: ['#0A1533', '#2B4780'], slonce: '#F2F4FF', blask: '#9DB5FF', gory: ['#3B5590', '#2E467C', '#223766', '#172850'], snieg: '#C9D6F5', chmura: '#5C70A6', droga: '#3A4E7E', theme: '#0A1533' },
  };
  function krajobraz(pora) {
    const P = PALETY[pora];
    const svg = s('svg', { class: 'krajobraz', viewBox: '0 0 430 370', preserveAspectRatio: 'xMidYMax slice', 'aria-hidden': 'true' });
    const defs = s('defs', null, svg);
    const lg = (id, a, b, x2 = 0, y2 = 1) => { const g = s('linearGradient', { id, x1: 0, y1: 0, x2, y2 }, defs); s('stop', { offset: 0, 'stop-color': a }, g); s('stop', { offset: 1, 'stop-color': b }, g); };
    lg('niebo', P.niebo[0], P.niebo[1]);
    P.gory.forEach((c, i) => lg('g' + i, c, P.gory[Math.min(3, i + 1)]));
    const rg = s('radialGradient', { id: 'blask' }, defs); s('stop', { offset: 0, 'stop-color': P.blask, 'stop-opacity': 0.75 }, rg); s('stop', { offset: 1, 'stop-color': P.blask, 'stop-opacity': 0 }, rg);
    s('rect', { width: 430, height: 370, fill: 'url(#niebo)' }, svg);
    if (pora === 'noc') { let a = 7; for (let i = 0; i < 46; i++) { a = (a * 9301 + 49297) % 233280; const x = (a / 233280) * 430; a = (a * 9301 + 49297) % 233280; const y = (a / 233280) * 190; s('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: i % 7 === 0 ? 1.4 : 0.8, fill: '#fff', opacity: 0.55 + (i % 3) * 0.15 }, svg); } }
    const sx = pora === 'swit' ? 96 : 344, sy = pora === 'noc' ? 192 : 200;
    s('circle', { cx: sx, cy: sy, r: 84, fill: 'url(#blask)' }, svg);
    s('circle', { cx: sx, cy: sy, r: pora === 'noc' ? 18 : 24, fill: P.slonce }, svg);
    if (pora === 'noc') s('circle', { cx: sx + 9, cy: sy - 7, r: 19, fill: P.niebo[0], opacity: 0.9 }, svg);
    // pozycja w zewnętrznej grupie, animacja w wewnętrznej — inaczej CSS nadpisałby transform
    const chmura = (x, y, sk, kl) => { const g = s('g', { class: 'chmura ' + kl, fill: P.chmura }, s('g', { transform: `translate(${x},${y}) scale(${sk})` }, svg)); [[0, 10, 22], [22, 0, 28], [50, 8, 22], [70, 16, 16], [-18, 18, 14]].forEach(([cx, cy, r]) => s('circle', { cx, cy, r }, g)); s('rect', { x: -30, y: 14, width: 114, height: 20, rx: 10 }, g); g.setAttribute('opacity', pora === 'noc' ? 0.35 : 0.92); };
    chmura(40, 188, 0.62, 'c1'); chmura(196, 172, 0.45, 'c2'); chmura(282, 214, 0.5, 'c3');
    // pasma gór: od najdalszego
    s('path', { d: 'M0 258 L32 226 L58 240 L96 196 L132 232 L170 204 L206 238 L244 188 L284 230 L318 206 L356 236 L394 198 L430 222 V370 H0Z', fill: 'url(#g0)' }, svg);
    s('path', { d: 'M-10 290 L44 230 L78 258 L128 196 L176 262 L214 238 L262 182 L316 252 L352 226 L398 266 L440 236 V370 H-10Z', fill: 'url(#g1)' }, svg);
    // śnieżne czapy
    [['M128 196 L116 210 L124 208 L130 214 L136 207 L142 211Z'], ['M262 182 L249 198 L257 195 L264 202 L270 194 L277 199Z']].forEach(([d]) => s('path', { d, fill: P.snieg, opacity: 0.95 }, svg));
    s('path', { d: 'M-10 318 C 60 288, 120 300, 180 286 S 300 262, 352 284 S 420 300, 440 292 V370 H-10Z', fill: 'url(#g2)' }, svg);
    s('path', { d: 'M-10 344 C 80 318, 150 334, 230 322 S 380 312, 440 330 V370 H-10Z', fill: 'url(#g3)' }, svg);
    // droga wijąca się w góry
    const droga = 'M110 372 C 150 350, 250 352, 236 334 S 170 318, 214 306 S 300 296, 286 286';
    s('path', { d: droga, fill: 'none', stroke: P.droga, 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0.85 }, svg);
    s('path', { d: droga, fill: 'none', stroke: P.gory[3], 'stroke-width': 1.2, 'stroke-dasharray': '5 6', opacity: 0.55 }, svg);
    // kolarz na drodze
    const k = s('g', { class: 'kolarz' }, s('g', { transform: 'translate(206 296)' }, svg));
    s('circle', { cx: 0, cy: 8, r: 5.2, fill: 'none', stroke: '#1C2944', 'stroke-width': 1.6 }, k);
    s('circle', { cx: 17, cy: 8, r: 5.2, fill: 'none', stroke: '#1C2944', 'stroke-width': 1.6 }, k);
    s('path', { d: 'M0 8 L6 1 L14 1 L17 8 M6 1 L9 8 L14 1', fill: 'none', stroke: '#1C2944', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, k);
    s('path', { d: 'M7 0 C 8 -6, 11 -9, 15 -8 L 16 -4 L 12 -3 L 9 2Z', fill: '#FC6B1E' }, k);
    s('circle', { cx: 16.5, cy: -10, r: 2.6, fill: '#1C2944' }, k);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', P.theme);
    return svg;
  }

  // ───────── drobne klocki ─────────
  const awatar = (r = 46) => {
    const el = h('div', { class: 'awatar', style: { width: r + 'px', height: r + 'px' } });
    el.append(A.pierscienie([{ udzial: LV.postep }], { rozmiar: r, grubosc: 3.5, odstep: 0 }), h('span', { text: 'FM' }));
    const tor = el.querySelector('.pierscien-tor'); tor.style.stroke = 'rgba(255,255,255,.35)';
    el.querySelector('.pierscien').style.stroke = '#fff';
    return el;
  };
  const kafelekTrasy = (j, w = 96) => { const box = h('div', { class: 'mapka-box' }); const m = A.mapka(j, { w, h: w, pad: 10, drogi: true, cien: true }); box.append(m || h('div', { class: 'zw-kafel' }, ik('monitor-play', 'fill'))); return box; };
  const otworzJazde = (j) => A.arkusz(() => A.szczegolyJazdy(j), { tytul: j.nazwa });
  const medal = (o) => {
    const el = h('div', { class: 'odz' + (o.zdobyta ? '' : ' zablokowana'), title: `${o.opis} — ${o.szczegol}` });
    const m = h('div', { class: 'medal' });
    if (!o.zdobyta) m.append(A.pierscienie([{ udzial: o.postep }], { rozmiar: 64, grubosc: 4, odstep: 0 }));
    m.append(h('div', { class: 'wnetrze' }, ik(o.ikona, 'fill')));
    el.append(m, h('b', { text: o.nazwa }), h('small', { text: o.zdobyta ? o.opis : `${f.liczba(o.postep * 100)}% · ${o.opis}` }));
    return el;
  };

  // ───────── ekran: Start ─────────
  function start(el) {
    const swiat = h('div', { class: 'swiat' }, krajobraz(A.poraDnia()));
    const dzw = h('button', { class: 'dzwonek dotyk', type: 'button', 'aria-label': 'Powiadomienia: 3 nowe' }, ik('bell', 'fill'), h('span', { class: 'odznaka', text: '3' }));
    dzw.addEventListener('click', powiadomienia);
    const lv = h('b'), sr = h('span', { class: 'klapki' }), km = h('b'), fo = h('b'), jz = h('b');
    String(A.seria.tygodnie).padStart(2, '0').split('').forEach((c) => sr.append(h('em', { text: c })));
    swiat.append(
      h('div', { class: 'gora-app' }, awatar(), h('div', { class: 'znak' }, 'Kola', h('b', { text: 'r' }), 'stwo'), dzw),
      h('div', { class: 'staty' },
        h('div', { class: 'stat' }, lv, h('span', null, ik('bicycle', 'fill'), 'Poziom')),
        h('div', { class: 'stat' }, h('b', null, sr), h('span', { text: 'Seria tyg.' })),
        h('div', { class: 'stat' }, km, h('span', { text: 'Km / tydz.' })),
        h('div', { class: 'stat' }, fo, h('span', { text: 'Forma' })),
        h('div', { class: 'stat' }, jz, h('span', { text: 'Jazdy' }))));
    A.licz(lv, LV.nr, (v) => String(Math.round(v))); A.licz(km, T.km, (v) => f.liczba(Math.round(v))); A.licz(fo, F.ctl, (v) => String(Math.round(v))); A.licz(jz, T.jazdy, (v) => String(Math.round(v)));

    const P = A.propozycja;
    const kProp = h('section', { class: 'karta', 'aria-label': 'Propozycja treningu' },
      A.dzisZaliczone ? h('div', { class: 'zaliczone' }, ik('check-circle', 'fill'), `Dziś zaliczone: ${f.km(J.km)} km`) : null,
      h('div', { class: 'karta-nag' }, h('span', { class: 'etyk' }, ik('sparkle', 'fill'), A.dzisZaliczone ? 'Na jutro' : 'Na dziś'), h('span', { class: 'etyk', text: `gotowość ${A.gotowosc}%` })),
      h('div', { class: 'propozycja' }, h('div', { class: 'kolko' }, ik(P.ikona, 'fill')), h('h3', { text: P.tytul }), h('p', { class: 'meta', text: `${P.czas} · ${P.strefa}` }), h('p', { class: 'opis', text: P.opis })));

    const os = A.osiagniecia(J);
    const kJazda = h('section', { class: 'karta dotyk', role: 'button', tabindex: 0, 'aria-label': `Ostatnia jazda: ${J.nazwa}` },
      h('div', { class: 'karta-nag' }, h('span', { class: 'etyk', text: 'Ostatnia jazda' }), h('span', { class: 'link' }, 'Szczegóły', ik('caret-right', 'bold'))),
      h('div', { class: 'jazda-karta' }, kafelekTrasy(J), h('div', null,
        h('h3', { text: J.nazwa }), h('p', { class: 'kiedy', text: `${A.wielka(f.kiedy(J.data))}, ${f.godzina(J.data)}` }),
        h('div', { class: 'mini-staty' }, h('div', null, h('b', { text: f.km(J.km) }), h('small', { text: 'km' })), h('div', null, h('b', { text: f.czasHM(J.czas).replace(' min', '') }), h('small', { text: 'czas' })), h('div', null, h('b', { text: f.liczba(J.predkosc, 1) }), h('small', { text: 'km/h' }))),
        os.length ? h('span', { class: 'osiag' }, ik('trophy', 'fill'), `${os.length} ${A.odm(os.length, 'segment', 'segmenty', 'segmentów')}`) : null)));
    kJazda.addEventListener('click', () => otworzJazde(J));
    kJazda.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); otworzJazde(J); } });

    const wz = A.wyzwania[0], brak = Math.max(0, wz.cel - wz.wart);
    const kWyz = h('section', { class: 'karta wyzwanie', 'aria-label': 'Wyzwanie tygodnia' },
      ilustracjaPucharu(),
      h('span', { class: 'etyk' }, ik('trophy', 'fill'), 'Wyzwanie tygodnia'),
      h('h3', { text: 'Przejedź 200 km do niedzieli' }),
      h('p', { text: brak > 0 ? `Zostało ${f.liczba(brak)} km. Jedna dłuższa jazda jutro i odznaka jest Twoja.` : 'Zrobione! Odznaka już czeka w profilu.' }),
      h('div', { class: 'postep-txt' }, h('span', null, h('b', { text: f.liczba(wz.wart) }), ` / ${wz.cel} km`), h('span', { text: f.procent(wz.udzial) })),
      A.pasek(wz.udzial));

    const kTydz = h('section', { class: 'karta', 'aria-label': 'Twój tydzień' },
      h('div', { class: 'karta-nag' }, h('span', { class: 'etyk', text: 'Twój tydzień' }), h('span', { class: 'etyk', text: `tydzień ${f.tydzienISO(K.dzis)}` })),
      h('div', { class: 'tydzien' }, A.tydzienDni.map((d) => h('div', { class: `dzien ${d.typ || ''}${d.dzis ? ' dzis' : ''}${d.przyszly ? ' przyszly' : ''}`, title: d.km ? `${f.km(d.km)} km` : '' },
        h('div', { class: 'kolo' }, d.typ ? ik(d.typ === 'zwift' ? 'monitor-play' : 'bicycle', 'fill') : d.przyszly ? null : ik('moon-stars')),
        h('span', { text: f.dzienTygKr(d.data) }), h('small', { text: d.km ? f.liczba(d.km) : '' })))),
      h('div', { class: 'tydz-suma' }, h('div', null, h('b', { text: f.liczba(T.km) }), h('small', { text: 'km' })), h('div', null, h('b', { text: f.liczba(T.czas / 3600, 1) }), h('small', { text: 'godzin' })), h('div', null, h('b', { text: f.liczba(T.przewyzszenie) }), h('small', { text: 'm w górę' })), h('div', null, h('b', { text: f.znak(Math.round((T.km - T.poprzedni.km) / T.poprzedni.km * 100)) + '%' }), h('small', { text: 'vs poprz.' }))));

    const kPoziom = h('section', { class: 'karta' },
      h('div', { class: 'poziom-karta' }, h('div', { class: 'poziom-nr' }, h('div', null, h('b', { text: String(LV.nr) }), h('small', { text: 'poziom' }))),
        h('div', null, h('h3', { text: `${f.liczba(LV.brakuje)} km do poziomu ${LV.nr + 1}` }), h('p', { text: `${f.liczba(LV.km)} km łącznie · każdy kilometr to punkt` }), A.pasek(LV.postep))));

    const zdobyte = A.odznaki.filter((o) => o.zdobyta).length;
    const kOdz = h('div', null, h('div', { class: 'sekcja-t' }, h('h2', { text: 'Odznaki' }), h('span', { class: 'etyk', text: `${zdobyte} z ${A.odznaki.length}` })),
      h('div', { class: 'karuzela odznaki' }, A.odznaki.slice().sort((a, b) => b.zdobyta - a.zdobyta || b.postep - a.postep).map(medal)));

    const kCel = h('section', { class: 'karta' },
      h('div', { class: 'karta-nag' }, h('span', { class: 'etyk', text: 'Cel na 2026' }), h('span', { class: 'etyk', text: `prognoza ${f.liczba(C.prognoza)} km` })),
      h('div', { class: 'cel-wiersz' }, h('b', null, f.liczba(C.teraz), h('small', { text: ` / ${f.liczba(C.km)} km` })), h('span', { text: f.procent(C.udzial) })),
      A.pasek(C.udzial), h('p', { class: 'cel-opis', text: `Do sylwestra ${f.liczba(C.potrzebaNaTydzien)} km tygodniowo i cel jest Twój.` }));

    el.append(swiat, h('div', { class: 'karty' }, kProp, kJazda, kWyz, kTydz, kPoziom, kOdz, kCel));
  }
  function ilustracjaPucharu() {
    const svg = s('svg', { class: 'ilustracja', viewBox: '0 0 128 128', 'aria-hidden': 'true' });
    s('circle', { cx: 70, cy: 58, r: 46, fill: '#2A3A5E' }, svg);
    s('path', { d: 'M48 30 H92 V52 C92 66 82 76 70 76 C58 76 48 66 48 52Z', fill: '#FFC53D' }, svg);
    s('path', { d: 'M48 36 H38 C38 50 44 56 52 58 M92 36 H102 C102 50 96 56 88 58', fill: 'none', stroke: '#FFC53D', 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
    s('rect', { x: 64, y: 74, width: 12, height: 14, fill: '#E0A100' }, svg);
    s('rect', { x: 54, y: 86, width: 32, height: 9, rx: 3, fill: '#FC6B1E' }, svg);
    s('path', { d: 'M58 36 V52 C58 58 62 63 67 65', fill: 'none', stroke: '#FFE39A', 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
    [[22, 30], [110, 20], [114, 84], [28, 92]].forEach(([x, y]) => s('path', { d: `M${x} ${y - 5} L${x + 1.6} ${y - 1.6} L${x + 5} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 5} L${x - 1.6} ${y + 1.6} L${x - 5} ${y} L${x - 1.6} ${y - 1.6}Z`, fill: '#FFC53D' }, svg));
    return svg;
  }
  function powiadomienia() {
    const nowe = A.odznaki.find((o) => o.id === 'moc');
    A.arkusz(() => h('div', { class: 'powiad' }, h('h2', { text: 'Powiadomienia' }),
      h('div', { class: 'pw' }, h('div', { class: 'ik' }, ik('barbell', 'fill')), h('div', null, h('b', { text: `Nowa odznaka: ${nowe.nazwa}` }), h('small', { text: A.wielka(nowe.szczegol) }))),
      h('div', { class: 'pw' }, h('div', { class: 'ik' }, ik('flame', 'fill')), h('div', null, h('b', { text: `Seria ${A.seria.tygodnie} tygodni!` }), h('small', { text: 'Co tydzień przynajmniej jedna jazda. Tak trzymaj.' }))),
      h('div', { class: 'pw' }, h('div', { class: 'ik' }, ik('check-circle', 'fill')), h('div', null, h('b', { text: 'Wyzwanie: 4 jazdy w tygodniu' }), h('small', { text: 'Zaliczone dzisiejszą sobotnią pętlą.' })))), { tytul: 'Powiadomienia' });
  }

  // ───────── ekran: Jazdy ─────────
  function jazdy(el) {
    let filtr = 'wszystkie';
    const lista = h('div', { class: 'zawartosc' });
    const przyc = [['wszystkie', 'Wszystkie'], ['szosa', 'Szosa'], ['zwift', 'Zwift']].map(([k, n]) => { const b = h('button', { type: 'button', 'aria-pressed': String(k === filtr), text: n }); b.addEventListener('click', () => { filtr = k; przyc.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); rysuj(); }); return b; });
    el.append(h('header', { class: 'naglowek' }, h('h1', { text: 'Jazdy' }), h('p', { text: `${K.jazdy.length} jazd od sierpnia 2025 · ${f.liczba(K.okresy.wszystko.km)} km` }), h('div', { class: 'filtry', role: 'group', 'aria-label': 'Rodzaj' }, przyc)), lista);
    function rysuj() {
      lista.replaceChildren();
      const jj = K.jazdy.filter((j) => filtr === 'wszystkie' || j.typ === filtr).slice(-40).reverse();
      let tyg = null, grupa = null;
      for (const j of jj) {
        const t = K.tygodnie.find((x) => j.data >= x.od && j.data < new Date(x.od.getFullYear(), x.od.getMonth(), x.od.getDate() + 7));
        if (t !== tyg) { tyg = t; grupa = h('div', { class: 'lista' }); lista.append(h('div', { class: 'grupa-t' }, h('span', { text: t && t.biezacy ? 'Ten tydzień' : t ? `Tydzień ${f.dataKrotka(t.od)}` : '' }), t ? h('b', { text: `${f.liczba(t.km)} km` }) : null), grupa); }
        const os = A.osiagniecia(j).filter((x) => x.typ === 'pr').length;
        const w = h('article', { class: 'wiersz-jazdy dotyk', role: 'button', tabindex: 0, 'aria-label': j.nazwa },
          kafelekTrasy(j, 64),
          h('div', null, h('h3', null, j.nazwa.replace('Zwift · ', ''), os ? ik('trophy', 'fill', 'puchar') : null), h('p', { text: `${A.wielka(f.kiedy(j.data))} · ${f.czasHM(j.czas)} · ${j.typ === 'zwift' ? j.moc + ' W' : f.liczba(j.predkosc, 1) + ' km/h'}` })),
          h('div', { class: 'km' }, f.km(j.km), h('small', { text: 'km' })));
        w.addEventListener('click', () => otworzJazde(j));
        w.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); otworzJazde(j); } });
        grupa.append(w);
      }
    }
    rysuj();
  }

  // ───────── ekran: Postępy ─────────
  function postepy(el) {
    const zaw = h('div', { class: 'zawartosc' });
    el.append(h('header', { class: 'naglowek' }, h('h1', { text: 'Postępy' }), h('p', { text: 'Forma, kilometry i rekordy' })), zaw);
    const kForma = h('section', { class: 'karta' }, h('div', { class: 'karta-nag' }, h('span', { class: 'etyk', text: 'Forma · 90 dni' }), h('span', { class: 'etyk', text: F.nazwa })),
      h('div', { class: 'duza-liczba' }, h('b', { text: f.liczba(F.ctl) }), h('span', null, ik('trend-up', 'bold'), f.znak(F.zmiana7, 1) + ' w tydzień')), h('div', { id: 'w-forma' }),
      h('div', { class: 'legenda' }, h('span', null, h('i', { style: { background: 'var(--pom)' } }), 'forma'), h('span', null, h('i', { style: { background: '#9DB7D9' } }), 'zmęczenie')));
    const kTyg = h('section', { class: 'karta' }, h('div', { class: 'karta-nag' }, h('span', { class: 'etyk', text: 'Kilometry · 12 tygodni' }), h('span', { class: 'etyk', text: `średnio ${f.liczba(K.tygodnie.slice(-12).reduce((a, t) => a + t.km, 0) / 12)} km` })), h('div', { id: 'w-tyg' }),
      h('div', { class: 'legenda' }, h('span', null, h('i', { style: { background: 'var(--pom)' } }), 'szosa'), h('span', null, h('i', { style: { background: 'var(--zwift)' } }), 'Zwift')));
    const top = K.segmenty.slice().sort((a, b) => b.historia.length - a.historia.length).slice(0, 5);
    const kSeg = h('section', { class: 'karta' }, h('div', { class: 'karta-nag' }, h('span', { class: 'etyk', text: 'Ulubione segmenty' })), top.map((sg, i) => h('div', { class: 'seg-wiersz' }, h('span', { class: 'nr', text: String(i + 1) }), h('div', null, h('b', { text: sg.nazwa }), h('small', { text: `${sg.historia.length} prób · ostatnio ${f.tempoSeg(sg.ostatnia.czas)}` })), h('div', { class: 'c' }, f.tempoSeg(sg.pr), h('small', { text: 'rekord' })))));
    const ikR = { dystans: 'path', predkosc: 'lightning', przewyzszenie: 'mountains', tydzien: 'calendar-blank', moc20: 'barbell', tetno: 'heartbeat' };
    const kRek = h('div', null, h('div', { class: 'sekcja-t' }, h('h2', { text: 'Rekordy' })), h('div', { class: 'rekordy', style: { marginTop: '10px' } }, K.rekordy.map((r) => h('div', { class: 'rek' }, ik(ikR[r.klucz], 'fill'), h('b', null, f.liczba(r.wartosc, r.jednostka === 'km/h' || r.klucz === 'dystans' ? 1 : 0), h('small', { text: r.jednostka })), h('span', { text: r.nazwa })))));
    const kMoc = h('section', { class: 'karta' }, h('div', { class: 'karta-nag' }, h('span', { class: 'etyk', text: 'Krzywa mocy · Zwift' }), h('span', { class: 'etyk', text: `20 min: ${K.moc.wszech[8]} W` })), h('div', { id: 'w-moc' }), h('p', { class: 'pod', text: 'Tylko z trenażera — na szosie nie mamy miernika mocy.' }));
    zaw.append(kForma, kTyg, kSeg, kRek, kMoc);
    requestAnimationFrame(() => {
      const dni = K.dni.slice(-90);
      W.linie(kForma.querySelector('#w-forma'), { wys: 130, m: { l: 4, r: 8, t: 12, b: 6 }, siatka: false, serie: [{ pts: dni.map((d, i) => [i, d.ctl]), klasa: 's-pom', obszar: true, koniec: true }, { pts: dni.map((d, i) => [i, d.atl]), klasa: 's-nieb' }], x: { ticki: [] }, y: { min: 0, max: 80, format: null, ticki: [] }, tip: (i) => [W.naglowekTip(f.dataKrotka(dni[i].data)), W.wierszTip(f.liczba(dni[i].ctl), 'forma', 's-pom'), W.wierszTip(f.liczba(dni[i].atl), 'zmęczenie')], opis: 'Forma, 90 dni' });
      const t12 = K.tygodnie.slice(-12).map((t) => { const od = t.od, doo = new Date(od.getFullYear(), od.getMonth(), od.getDate() + 7), jj = K.jazdy.filter((j) => j.data >= od && j.data < doo); return { t, a: jj.filter((j) => j.typ === 'szosa').reduce((x, j) => x + j.km, 0), b: jj.filter((j) => j.typ === 'zwift').reduce((x, j) => x + j.km, 0) }; });
      W.slupki(kTyg.querySelector('#w-tyg'), { wys: 150, m: { l: 4, r: 4, t: 18, b: 20 }, maxSzer: 18, promien: 6, odstep: 3, siatka: false, osY: { ticki: 1, format: null }, osX: (i) => (i % 3 === 2 ? f.dataKrotka(t12[i].t.od) : null), wartosc: (d, i) => (i === 11 ? f.liczba(d.v) : null), dane: t12.map((w) => ({ v: w.a + w.b, klasa: w.t.biezacy ? 'akcent' : '', czesci: [{ v: w.a, klasa: 'cz-szosa' }, { v: w.b, klasa: 'cz-zwift' }], tip: () => [W.naglowekTip(`tydzień ${f.dataKrotka(w.t.od)}`), W.wierszTip(f.liczba(w.a + w.b) + ' km', 'razem'), W.wierszTip(f.liczba(w.a) + ' km', 'szosa', 's-pom'), W.wierszTip(f.liczba(w.b) + ' km', 'Zwift', 's-zw')] })), opis: 'Kilometry tygodniowo' });
      const M = K.moc;
      W.linie(kMoc.querySelector('#w-moc'), { wys: 150, m: { l: 30, r: 8, t: 10, b: 20 }, serie: [{ pts: M.czasy.map((c, i) => [c, M.wszech[i]]), klasa: 's-pom', obszar: true, obszarOd: 100 }], x: { skala: 'log', min: 5, max: 3600, ticki: [[5, '5 s'], [60, '1 min'], [300, '5 min'], [1200, '20 min'], [3600, '1 h']].map(([v, t], k) => ({ v, s: t, kotwica: k === 0 ? 'start' : k === 4 ? 'end' : 'middle' })) }, y: { min: 100, max: 900, ticki: [100, 500, 900], format: (v) => v }, tip: (i) => [W.naglowekTip(M.etykiety[i]), W.wierszTip(M.wszech[i] + ' W', 'najlepiej', 's-pom')], opis: 'Krzywa mocy' });
    });
  }

  // ───────── ekran: Profil ─────────
  function profil(el) {
    const Wsz = K.okresy.wszystko;
    el.append(
      h('div', { class: 'profil-gora' }, awatar(104), h('h1', { text: 'Fryderyk Marszałek' }), h('p', { text: `Poziom ${LV.nr} · Konstancin-Jeziorna` })),
      h('div', { class: 'zawartosc' },
        h('div', { class: 'liczby-profil' }, h('div', null, h('b', { text: f.liczba(Wsz.km) }), h('small', { text: 'km' })), h('div', null, h('b', { text: String(Wsz.jazdy) }), h('small', { text: 'jazd' })), h('div', null, h('b', { text: f.liczba(Wsz.czas / 3600) }), h('small', { text: 'godzin' }))),
        h('div', { class: 'sekcja-t' }, h('h2', { text: 'Wszystkie odznaki' })),
        h('div', { class: 'odznaki-siatka' }, A.odznaki.map(medal)),
        h('section', { class: 'karta ustawienia', style: { padding: '4px 0' } },
          [['strava', 'Strava', 'Połączona · dane przykładowe', 'strava'], ['heartbeat', 'Strefy tętna', `maks. ${K.zawodnik.tetnoMax} · próg ${K.zawodnik.tetnoProg} bpm`, ''], ['target', 'Cel roczny', `${f.liczba(C.km)} km w 2026`, ''], ['ruler', 'Jednostki', 'kilometry, metry', '']].map(([i, n, o, kl]) => h('div', { class: 'ust' }, h('span', { class: 'ik ' + kl }, ik(i === 'strava' ? 'link' : i === 'ruler' ? 'ruler' : i, 'bold')), h('span', null, h('b', { text: n }), h('small', { text: o })), h('span', null, ik('caret-right', 'bold'))))),
        h('p', { class: 'przypis', text: 'Kolarstwo · styl Świat. Liczby są przykładowe — prawdziwe dane ze Stravy podepniemy do wybranego stylu.' })));
  }

  A.aplikacja({
    tytul: 'Kolarstwo',
    zakladki: [{ id: 'start', nazwa: 'Start', ikona: 'house' }, { id: 'jazdy', nazwa: 'Jazdy', ikona: 'bicycle' }, { id: 'postepy', nazwa: 'Postępy', ikona: 'chart-line-up' }, { id: 'profil', nazwa: 'Profil', ikona: 'user' }],
    ekrany: { start, jazdy, postepy, profil },
  });
})();
