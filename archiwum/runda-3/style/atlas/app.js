/* Atlas — mapa wszystkich jazd jako tło pracy; panel obok z przeglądem, kalendarzem, jazdami i analizą. */
(function () {
  'use strict';
  const K = K2, f = K.fmt, h = W.h, ik = A.ik, M = K.mapa;
  const maxUz = Math.max(...M.drogi.map((d) => d.uzycia));
  const przejechane = M.drogi.filter((d) => d.uzycia > 0);
  const kmDrog = przejechane.reduce((a, d) => a + d.dl, 0), kmSieci = M.drogi.reduce((a, d) => a + d.dl, 0);
  const sc = (pts) => 'M' + pts.map((p) => p[0].toFixed(3) + ',' + p[1].toFixed(3)).join('L');

  // ───── silnik mapy: viewBox w kilometrach, kreski stałej grubości, napisy w warstwie HTML ─────
  const mapa = (() => {
    const host = document.querySelector('.at-mapa');
    const svg = W.svg('svg', { class: 'at-svg', role: 'img', 'aria-label': 'Mapa wszystkich jazd: im ciemniejsza droga, tym częściej przejechana' });
    const nak = h('div', { class: 'at-nak' });
    host.append(svg, nak);
    const tip = W.tooltip(host);
    const g = (k) => W.svg('g', { class: k }, svg);
    const NS = { 'vector-effect': 'non-scaling-stroke' };
    // ziemia i poziomice
    W.svg('rect', { x: -30, y: -30, width: M.szer + 60, height: M.wys + 60, class: 'at-lad' }, g('at-l-lad'));
    let mn = Infinity, mx = -Infinity; for (let x = 0; x <= M.szer; x += 0.5) for (let y = 0; y <= M.wys; y += 0.5) { const v = M.wysokosc(x, y); mn = Math.min(mn, v); mx = Math.max(mx, v); }
    const poz = []; for (let v = Math.ceil(mn / 5) * 5; v < mx; v += 5) poz.push(v);
    const gk = g('at-l-kont');
    for (const k of W.kontury(M.wysokosc, -0.5, -0.5, M.szer + 0.5, M.wys + 0.5, 0.25, poz)) for (const l of k.linie) if (l.length > 4) W.svg('path', Object.assign({ d: sc(l), class: 'at-kontur' + (k.poziom % 20 === 0 ? ' gr' : '') }, NS), gk);
    // woda
    const gw = g('at-l-woda');
    W.svg('path', { d: sc(M.rzeka), class: 'at-rzeka' }, gw);
    W.svg('path', Object.assign({ d: sc(M.jeziorka), class: 'at-doplyw' }, NS), gw);
    // drogi: obramowanie, wypełnienie, ślad przejazdów
    const go = g('at-l-obr'), gd = g('at-l-drogi'), gh = g('at-l-ciepla'), gt = g('at-l-traf');
    const sciezki = new Map();
    for (const d of M.drogi) {
      W.svg('path', Object.assign({ d: sc(d.pts), class: 'at-obr' + (d.rodzaj === 'wal' ? ' wal' : '') }, NS), go);
      W.svg('path', Object.assign({ d: sc(d.pts), class: 'at-droga' + (d.rodzaj === 'wal' ? ' wal' : '') }, NS), gd);
      if (!d.uzycia) continue;
      const t = Math.log(1 + d.uzycia) / Math.log(1 + maxUz);
      const p = W.svg('path', Object.assign({ d: sc(d.pts), class: 'at-cieplo', 'stroke-width': (1.4 + 3.2 * t).toFixed(2), 'stroke-opacity': (0.22 + 0.78 * t).toFixed(2) }, NS), gh);
      sciezki.set(d.id, p);
      const hit = W.svg('path', Object.assign({ d: sc(d.pts), class: 'at-traf' }, NS), gt);
      hit.addEventListener('pointerenter', () => { p.classList.add('on'); });
      hit.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); tip.pokaz(e.clientX - r.left, e.clientY - r.top - 8, [W.naglowekTip(d.rodzaj === 'wal' ? 'Wał wiślany' : 'Droga'), W.wierszTip(`${d.uzycia} ${A.odm(d.uzycia, 'raz', 'razy', 'razy')}`, 'przejechana'), W.wierszTip(`${f.liczba(d.dl, 1)} km`, 'długość odcinka')]); });
      hit.addEventListener('pointerleave', () => { p.classList.remove('on'); tip.ukryj(); });
    }
    // mgiełka na brzegach sieci dróg, żeby mapa nie urywała się nożem
    const defs = W.svg('defs', null, svg), gm = g('at-l-mgla');
    [['l', 1, 0, 0, 0], ['p', 0, 0, 1, 0], ['g', 0, 1, 0, 0], ['d', 0, 0, 0, 1]].forEach(([k, x1, y1, x2, y2]) => { const lg = W.svg('linearGradient', { id: 'at-m-' + k, x1, y1, x2, y2 }, defs); W.svg('stop', { offset: 0, 'stop-color': '#F2EFE6', 'stop-opacity': 0 }, lg); W.svg('stop', { offset: 1, 'stop-color': '#F2EFE6', 'stop-opacity': 1 }, lg); });
    const F = 2.2;
    W.svg('rect', { x: -0.2, y: -40, width: F, height: 120, fill: 'url(#at-m-l)' }, gm); W.svg('rect', { x: -60, y: -40, width: 59.81, height: 120, class: 'at-lad' }, gm);
    W.svg('rect', { x: M.szer + 0.2 - F, y: -40, width: F, height: 120, fill: 'url(#at-m-p)' }, gm); W.svg('rect', { x: M.szer + 0.19, y: -40, width: 60, height: 120, class: 'at-lad' }, gm);
    W.svg('rect', { x: -60, y: -0.2, width: 160, height: F, fill: 'url(#at-m-g)' }, gm); W.svg('rect', { x: -60, y: -60, width: 160, height: 59.81, class: 'at-lad' }, gm);
    W.svg('rect', { x: -60, y: M.wys + 0.2 - F, width: 160, height: F, fill: 'url(#at-m-d)' }, gm); W.svg('rect', { x: -60, y: M.wys + 0.19, width: 160, height: 60, class: 'at-lad' }, gm);
    // wyróżnienia
    const gs = g('at-l-seg'), gj = g('at-l-jazda');
    const podObr = W.svg('path', Object.assign({ class: 'at-pod-obr', d: '' }, NS), gj), pod = W.svg('path', Object.assign({ class: 'at-pod', d: '' }, NS), gj);
    const wybObr = W.svg('path', Object.assign({ class: 'at-wyb-obr', d: '' }, NS), gj), wyb = W.svg('path', Object.assign({ class: 'at-wyb', d: '' }, NS), gj);
    const zak = W.svg('path', Object.assign({ class: 'at-zak', d: '' }, NS), gj);
    // warstwa HTML: miejscowości, dom, start, kursor
    const etyk = M.miejsca.map((m) => { const el = h('span', { class: 'at-miejsce ' + m.typ + (m.dom ? ' dom' : ''), text: m.nazwa }); nak.append(el); return { m, el }; });
    const dom = h('span', { class: 'at-dom', title: 'Dom' }, ik('house-simple', 'fill')); nak.append(dom);
    const start = h('span', { class: 'at-start', hidden: '' }); nak.append(start);
    const kursor = h('span', { class: 'at-kursor', hidden: '' }); nak.append(kursor);
    // sterowanie
    const btn = (ikona, opis, fn) => { const b = h('button', { type: 'button', class: 'at-ster-b', 'aria-label': opis, title: opis }, ik(ikona, 'bold')); b.addEventListener('click', fn); return b; };
    const ster = h('div', { class: 'at-ster' }, btn('plus', 'Przybliż', () => skaluj(0.7)), btn('minus', 'Oddal', () => skaluj(1.4)), btn('corners-out', 'Pokaż wszystkie jazdy', () => dopasuj(bbCalosc)));
    const skala = h('div', { class: 'at-skala' }, h('i'), h('span'));
    const leg = h('div', { class: 'at-leg' }, h('b', { text: 'Ile razy przejechana' }), h('div', { class: 'at-leg-t' }), h('div', { class: 'at-leg-o' }, h('span', { text: '1' }), h('span', { text: '10' }), h('span', { text: `${maxUz}` })));
    host.append(ster, leg, skala);

    const bbz = (pts, m) => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0 - m, y0 - m, x1 + m, y1 + m]; };
    const bbCalosc = bbz(przejechane.flatMap((d) => d.pts), 1.4);
    let vb = bbCalosc.slice(), cel = bbCalosc, W0 = 0, H0 = 0, anim = 0, trasa = null;
    const doAspektu = (b) => { const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2; let w = b[2] - b[0], hh = b[3] - b[1]; const a = W0 / H0; if (w / hh > a) hh = w / a; else w = hh * a; return [cx - w / 2, cy - hh / 2, w, hh]; };
    const rzut = ([x, y]) => { const s = W0 / vb[2]; return [(x - vb[0]) * s, (y - vb[1]) * s]; };
    const poloz = (el, p) => { const q = rzut(p); el.style.transform = `translate(${q[0].toFixed(1)}px, ${q[1].toFixed(1)}px)`; };
    let kursorI = -1;
    function rysuj() {
      svg.setAttribute('viewBox', vb.map((v) => v.toFixed(4)).join(' '));
      const s = W0 / vb[2];
      etyk.forEach(({ m, el }) => { poloz(el, [m.x, m.y]); el.hidden = m.typ === 'punkt' && s < 26; });
      poloz(dom, [M.dom.x, M.dom.y]);
      if (trasa) poloz(start, trasa[0]);
      if (trasa && kursorI >= 0) poloz(kursor, trasa[kursorI]);
      // skala: okrągła liczba km na ~90 px
      const km = [0.5, 1, 2, 5, 10].find((k) => k * s >= 70) || 10;
      skala.firstChild.style.width = (km * s).toFixed(0) + 'px'; skala.lastChild.textContent = (km < 1 ? '500 m' : km + ' km');
    }
    function dopasuj(b, natychmiast) {
      cel = b;
      if (!W0) return;
      const z = vb.slice();
      cancelAnimationFrame(anim);
      if (natychmiast || W.ruchOgraniczony()) { vb = doAspektu(b); rysuj(); return; }
      const t0 = performance.now(), T = 650;
      const krok = (t) => { const p = Math.min(1, (t - t0) / T), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2, d = doAspektu(cel); vb = z.map((v, i) => v + (d[i] - v) * e); rysuj(); if (p < 1) anim = requestAnimationFrame(krok); };
      anim = requestAnimationFrame(krok);
    }
    function skaluj(k) { const cx = vb[0] + vb[2] / 2, cy = vb[1] + vb[3] / 2, w = Math.min(60, Math.max(2, vb[2] * k)), hh = w * H0 / W0; dopasuj([cx - w / 2, cy - hh / 2, cx + w / 2, cy + hh / 2]); }
    const naRozmiar = () => { const w = host.clientWidth, hh = host.clientHeight; if (!w || !hh || (w === W0 && hh === H0)) return; W0 = w; H0 = hh; vb = doAspektu(cel); rysuj(); };
    if ('ResizeObserver' in window) new ResizeObserver(naRozmiar).observe(host); else window.addEventListener('resize', naRozmiar);
    naRozmiar();

    const api = {
      calosc() { api.jazda(null); dopasuj(bbCalosc); },
      // trwałe wyróżnienie jednej jazdy (analiza)
      jazda(o) {
        trasa = o && o.trasa; kursorI = -1; kursor.hidden = true; zak.setAttribute('d', ''); gs.replaceChildren();
        host.classList.toggle('wybrana', !!trasa);
        wyb.setAttribute('d', trasa ? sc(trasa) : ''); wybObr.setAttribute('d', trasa ? sc(trasa) : '');
        start.hidden = !trasa;
        if (o && o.segmenty) for (const s of o.segmenty) W.svg('path', Object.assign({ d: sc(trasa.slice(Math.round(s.od * 10), Math.round(s.do * 10) + 1)), class: 'at-seg' }, NS), gs);
        if (trasa) { dopasuj(bbz(trasa, 2)); rysuj(); }
        return api;
      },
      // chwilowe podświetlenie (najechanie na liście)
      podswietl(pts) { pod.setAttribute('d', pts ? sc(pts) : ''); podObr.setAttribute('d', pts ? sc(pts) : ''); host.classList.toggle('podglad', !!pts); },
      drogi(ids) { sciezki.forEach((p, id) => p.classList.toggle('seg', !!ids && ids.includes(id))); host.classList.toggle('segment', !!ids); },
      kursor(i) { kursorI = trasa && i != null && i >= 0 ? i : -1; kursor.hidden = kursorI < 0; if (kursorI >= 0) poloz(kursor, trasa[kursorI]); },
      zakres(a, b) { zak.setAttribute('d', trasa && a != null ? sc(trasa.slice(Math.min(a, b), Math.max(a, b) + 1)) : ''); },
    };
    // najechanie na mapę w trybie analizy: najbliższy punkt trasy
    let onHover = null;
    svg.addEventListener('pointermove', (e) => {
      if (!trasa || !onHover) return;
      const r = svg.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      let best = -1, bd = 24 * 24; for (let i = 0; i < trasa.length; i += 2) { const q = rzut(trasa[i]); const d = (q[0] - px) ** 2 + (q[1] - py) ** 2; if (d < bd) { bd = d; best = i; } }
      onHover(best);
    });
    svg.addEventListener('pointerleave', () => { if (onHover) onHover(-1); });
    api.naHover = (fn) => { onHover = fn; };
    return api;
  })();

  // najechanie na jazdę w panelu podświetla ją na mapie
  const panel = document.getElementById('tresc');
  panel.addEventListener('pointerover', (e) => {
    const el = e.target.closest('[data-jazda]'); if (!el) return;
    const j = K.jazdy.find((x) => x.id === +el.dataset.jazda); mapa.podswietl(j && j.typ === 'szosa' ? K.trasaJazdy(j) : null);
  });
  panel.addEventListener('pointerout', (e) => { const el = e.target.closest('[data-jazda]'); if (el && !el.contains(e.relatedTarget)) mapa.podswietl(null); });
  panel.addEventListener('pointerover', (e) => { const el = e.target.closest('[data-segment]'); if (el) mapa.drogi(K.segmenty[+el.dataset.segment].krawedzie); });
  panel.addEventListener('pointerout', (e) => { const el = e.target.closest('[data-segment]'); if (el && !el.contains(e.relatedTarget)) mapa.drogi(null); });

  // ───── przegląd ─────
  function przeglad(host) {
    const top = przejechane.slice().sort((a, b) => b.uzycia - a.uzycia)[0];
    host.append(h('header', { class: 'at-intro' },
      h('p', { class: 'at-intro-e', text: `${A.wielka(f.dzienTyg(K.dzis))}, ${f.data(K.dzis)}` }),
      h('h1', { text: 'Twoje drogi wokół Konstancina' }),
      h('p', { class: 'at-intro-o', text: `Na mapie każda droga, którą przejechałeś od sierpnia 2025. Im ciemniejsza, tym częściej po niej jeździsz. Najedź na drogę albo na jazdę z listy.` }),
      h('dl', { class: 'at-intro-st' },
        h('div', null, h('dt', { text: 'Przejechane drogi' }), h('dd', null, f.liczba(kmDrog), h('small', { text: ' km' }))),
        h('div', null, h('dt', { text: 'Pokrycie okolicy' }), h('dd', null, f.liczba(kmDrog / kmSieci * 100), h('small', { text: ' %' }))),
        h('div', null, h('dt', { text: 'Najczęstszy odcinek' }), h('dd', null, String(top.uzycia), h('small', { text: ` × ${top.rodzaj === 'wal' ? 'wał' : 'droga'}` }))))));
    const s = h('div', { class: 's-siatka' }); host.append(s);
    s.append(S.kartaKafle({ opis: 'Porównanie z poprzednim okresem.' }));
    const ost = K.jazdy.slice(-8).reverse();
    s.append(S.karta('Ostatnie jazdy', { klasa: 's-c12', opis: 'Najedź, żeby zobaczyć trasę na mapie.', akcje: [h('a', { class: 's-btn', href: '#jazdy' }, 'Wszystkie', ik('arrow-right', 'bold'))] },
      h('ul', { class: 'at-lista' }, ost.map((j) => h('li', null, h('a', { href: '#analiza/' + j.id, 'data-jazda': j.id },
        h('span', { class: 'at-lista-ik ' + j.typ }, ik(j.typ === 'zwift' ? 'monitor-play' : 'bicycle', 'bold')),
        h('span', { class: 'at-lista-n' }, h('b', { text: j.nazwa.replace('Zwift · ', '') }), h('small', { text: `${A.wielka(f.dzienTygKr(j.data))} ${f.dataKrotka(j.data)} · ${j.typ === 'zwift' ? 'Zwift' : 'szosa'}` })),
        h('span', { class: 'at-lista-v' }, h('b', { text: f.km(j.km) + ' km' }), h('small', { text: f.czas(j.czas) }))))))));
    const seg = K.segmenty.filter((x) => x.typ === 'szosa').sort((a, b) => b.historia.length - a.historia.length).slice(0, 6);
    s.append(S.karta('Segmenty na mapie', { klasa: 's-c12', opis: 'Najedź, żeby zobaczyć, gdzie leżą.' },
      h('ul', { class: 'at-lista' }, seg.map((x) => h('li', null, h('div', { class: 'at-seg-w', 'data-segment': K.segmenty.indexOf(x), tabindex: 0 },
        h('span', { class: 'at-lista-ik seg' }, ik('flag-checkered', 'bold')),
        h('span', { class: 'at-lista-n' }, h('b', { text: x.nazwa }), h('small', { text: `${x.dl >= 1000 ? f.liczba(x.dl / 1000, 2) + ' km' : x.dl + ' m'} · ${x.historia.length} prób` })),
        h('span', { class: 'at-lista-v' }, h('b', { text: f.tempoSeg(x.pr) }), h('small', { text: 'rekord' }))))))));
    s.append(S.kartaPmc({ zakres: 90, wys: 200, opis: 'Ostatnie 90 dni.' }));
  }

  const widoki = S.widoki({ analiza: { mapaZew: (o) => { if (!o) { mapa.calosc(); return null; } mapa.jazda(o); mapa.naHover(o.onHover || null); return mapa; } } });
  widoki.pulpit = przeglad;
  S.router({
    kontener: panel, widoki, domyslny: 'pulpit', tytul: 'Atlas',
    tytuly: { pulpit: 'Przegląd', kalendarz: 'Kalendarz', jazdy: 'Jazdy', postepy: 'Postępy', analiza: 'Analiza jazdy' },
    poZmianie(id) {
      document.body.dataset.widok = id;
      mapa.podswietl(null); mapa.drogi(null);
      if (id !== 'analiza') { mapa.naHover(null); mapa.calosc(); }
    },
  });
})();
