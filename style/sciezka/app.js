/* ŚCIEŻKA — aplikacja */
(function () {
  'use strict';
  const K = window.K2, f = K.fmt, h = W.h, s = W.svg, ik = A.ik;
  const J = K.ostatnia.jazda, F = K.forma, C = K.cel, T = K.okresy.tydzien, LV = A.poziom;
  const otworzJazde = (j) => A.arkusz(() => A.szczegolyJazdy(j), { tytul: j.nazwa });
  const klik = (el, fn) => { el.addEventListener('click', fn); el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }); return el; };
  const gora = () => h('header', { class: 'gora-app' },
    h('span', { class: 'chip ogien', title: 'Seria tygodni z jazdą' }, ik('flame', 'fill'), h('span', { text: String(A.seria.tygodnie) })),
    h('span', { class: 'chip blysk', title: 'Forma' }, ik('lightning', 'fill'), h('span', { text: f.liczba(F.ctl) })),
    h('span', { class: 'chip diament', title: 'Poziom' }, ik('diamond', 'fill'), h('span', { text: String(LV.nr) })),
    h('span', { class: 'chip serce', title: 'Gotowość' }, ik('heart', 'fill'), h('span', { text: A.gotowosc + '%' })));

  // kamienie milowe co 250 km
  const dzienRoku = C.narastajaco.length, tempo = C.teraz / dzienRoku;
  const kiedyOsiagniety = (km) => { const d = C.narastajaco.find((x) => x.km >= km); return d ? d.data : null; };
  const prognozaDaty = (km) => new Date(2026, 0, Math.ceil(km / tempo));
  const KAMIENIE = [];
  for (let km = 4000; km <= C.km; km += 250) KAMIENIE.push({ km, typ: km === C.km ? 'puchar' : km === 5000 ? 'skrzynia' : 'zwykly' });
  const nastepny = KAMIENIE.find((k) => k.km > C.teraz);

  function rowerzysta() {
    const svg = s('svg', { class: 'maskotka', viewBox: '0 0 96 96', 'aria-hidden': 'true' });
    s('ellipse', { cx: 48, cy: 86, rx: 30, ry: 5, fill: '#000', opacity: 0.08 }, svg);
    s('circle', { cx: 26, cy: 66, r: 15, fill: 'none', stroke: '#3B3B3B', 'stroke-width': 5 }, svg);
    s('circle', { cx: 72, cy: 66, r: 15, fill: 'none', stroke: '#3B3B3B', 'stroke-width': 5 }, svg);
    s('path', { d: 'M26 66 L42 44 L64 44 L72 66 M42 44 L50 66 L64 44', fill: 'none', stroke: '#2BA8F0', 'stroke-width': 5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, svg);
    s('path', { d: 'M44 40 C 46 26, 54 20, 64 22 L 66 32 L 56 34 L 50 46Z', fill: '#4CC21E' }, svg);
    s('circle', { cx: 68, cy: 16, r: 8, fill: '#FFC31F' }, svg);
    s('path', { d: 'M60 13 Q68 4 77 12 Z', fill: '#FF5252' }, svg);
    return svg;
  }

  // ───────── Ścieżka ─────────
  function start(el) {
    const przew = h('button', { class: 'przew', type: 'button' }, ik('book-open', 'fill'), 'Zasady');
    przew.addEventListener('click', () => A.arkusz(() => h('div', { class: 'cel-arkusz' }, h('div', { class: 'duza' }, ik('book-open', 'fill')), h('h2', { text: 'Jak działa ścieżka?' }),
      h('p', { text: `Każdy kilometr w 2026 przesuwa Cię po ścieżce. Co 250 km kamień milowy, na 5000 km skrzynia, na ${f.liczba(C.km)} km puchar sezonu. Płomień to seria tygodni z jazdą, diament to poziom (z wszystkich kilometrów), serce to gotowość z formy i zmęczenia.` })), { tytul: 'Zasady' }));
    const etap = h('section', { class: 'etap' }, h('div', null, h('small', { text: `Etap 11 · ${A.wielka(f.miesiac(K.dzis.getMonth()))}` }), h('h2', { text: `Droga do ${f.liczba(C.km)} km` })), przew);

    const KOL = { km: 'var(--pom)', jazdy: 'var(--nieb)', dluga: 'var(--ziel)', zwift: 'var(--fiol)' };
    const zad = h('section', { class: 'ramka', 'aria-label': 'Zadania tygodnia' }, h('div', { class: 'ramka-t' }, h('span', { text: 'Zadania tygodnia' }), h('span', { text: `${A.wyzwania.filter((w) => w.zrobione).length}/${A.wyzwania.length}` })),
      A.wyzwania.map((w) => { const p = A.pasek(w.udzial); p.append(h('span', { class: 'licz', text: `${f.liczba(Math.min(w.wart, w.cel))} / ${f.liczba(w.cel)}` })); return h('div', { class: 'zadanie' + (w.zrobione ? ' ok' : '') }, h('span', { class: 'ik', style: { color: KOL[w.id] } }, ik(w.ikona, 'fill')), h('div', null, h('b', { text: w.nazwa }), p), h('span', { class: 'nagr' }, ik(w.zrobione ? 'check-fat' : 'treasure-chest', 'fill'))); }));

    // ścieżka od najstarszego kamienia, zakręty jak serpentyna
    const sc = h('div', { class: 'sciezka' });
    const off = [0, 56, 82, 56, 0, -56, -82, -56];
    let mies = null;
    KAMIENIE.forEach((k, i) => {
      const zrobiony = k.km <= C.teraz, teraz = k === nastepny;
      const data = zrobiony ? kiedyOsiagniety(k.km) : prognozaDaty(k.km);
      const m = data.getMonth();
      if (m !== mies) { mies = m; sc.append(h('div', { class: 'rozdzial', text: A.wielka(f.miesiac(m)) + (zrobiony ? '' : ' · prognoza') })); }
      const ikona = k.typ === 'puchar' ? 'trophy' : k.typ === 'skrzynia' ? 'treasure-chest' : zrobiony ? 'check-fat' : teraz ? 'bicycle' : 'lock-simple';
      const w = h('button', { type: 'button', class: `wezel ${k.typ}${zrobiony ? ' zrobiony' : ''}${teraz ? ' teraz' : ''}${!zrobiony && !teraz ? ' zablok' : ''}`, style: { transform: `translateX(${off[i % off.length]}px)` }, 'aria-label': `${f.liczba(k.km)} km — ${zrobiony ? 'zdobyty' : teraz ? 'następny' : 'zablokowany'}` }, ik(ikona, 'fill'), h('span', { class: 'km', text: `${f.liczba(k.km)} km` }));
      if (teraz) {
        const ring = A.pierscienie([{ udzial: (C.teraz - (k.km - 250)) / 250 }], { rozmiar: 104, grubosc: 8, odstep: 0 }); ring.classList.add('postep-ring');
        ring.querySelector('.pierscien-tor').style.stroke = 'transparent'; ring.querySelector('.pierscien').style.stroke = 'var(--zloto)';
        w.prepend(ring); w.append(h('span', { class: 'dymek', text: `Jeszcze ${f.liczba(k.km - C.teraz)} km!` }));
      }
      w.addEventListener('click', () => A.arkusz(() => h('div', { class: 'cel-arkusz' },
        h('div', { class: 'duza', style: zrobiony ? null : { background: teraz ? 'var(--nieb)' : 'var(--ramka)', boxShadow: teraz ? '0 8px 0 var(--nieb-c)' : '0 8px 0 #CECECE', color: teraz ? '#fff' : 'var(--tekst-3)' } }, ik(ikona, 'fill')),
        h('h2', { text: zrobiony ? `${f.liczba(k.km)} km zdobyte!` : teraz ? `Następny: ${f.liczba(k.km)} km` : `${f.liczba(k.km)} km` }),
        h('p', { text: zrobiony ? `Kamień milowy osiągnięty ${f.data(data)}.` : teraz ? `Zostało ${f.liczba(k.km - C.teraz)} km — jutrzejsza jazda w zupełności wystarczy. ${A.propozycja.tytul}, ${A.propozycja.czas}.` : `Przy obecnym tempie: około ${f.data(data)}.` }),
        teraz ? h('button', { class: 'btn', type: 'button', onclick: () => history.back() }, 'Jedziemy!') : null), { tytul: `${k.km} km` }));
      const kam = h('div', { class: 'kamien' + (teraz ? ' kamien-teraz' : '') }, w);
      if (teraz) { const mk = rowerzysta(); mk.style.left = off[i % off.length] > 0 ? '24px' : 'auto'; mk.style.right = off[i % off.length] > 0 ? 'auto' : '24px'; mk.style.top = '-6px'; kam.append(mk); }
      sc.append(kam);
    });

    const ost = klik(h('section', { class: 'wj dotyk', role: 'button', tabindex: 0, 'aria-label': 'Ostatnia jazda' }, h('div', { class: 'ikb' }, A.mapka(J, { w: 58, h: 58, pad: 6, drogi: true, cien: true })), h('div', null, h('h3', { text: J.nazwa }), h('p', { text: `Dziś · ${f.czasHM(J.czas)} · ${f.liczba(J.predkosc, 1)} km/h` }), h('span', { class: 'xp' }, ik('lightning', 'fill'), `+${Math.round(J.km)} XP`)), h('div', { class: 'km' }, f.km(J.km), h('small', { text: 'km' }))), () => otworzJazde(J));
    el.append(gora(), h('div', { class: 'zaw' }, etap, sc, zad, h('div', { class: 'grupa-t', text: 'Ostatnia jazda' }), ost));
    // przewiń tak, żeby bieżący kamień był widoczny po zadaniach
  }

  // ───────── Jazdy ─────────
  function jazdy(el) {
    let filtr = 'wszystkie';
    const lista = h('div', { class: 'zaw' });
    const przyc = [['wszystkie', 'Wszystkie'], ['szosa', 'Szosa'], ['zwift', 'Zwift']].map(([k, n]) => { const b = h('button', { type: 'button', 'aria-pressed': String(k === filtr), text: n }); b.addEventListener('click', () => { filtr = k; przyc.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); rysuj(); }); return b; });
    el.append(gora(), h('header', { class: 'naglowek' }, h('h1', { text: 'Twoje jazdy' }), h('p', { text: `Każdy kilometr to punkt doświadczenia. Razem: ${f.liczba(K.okresy.wszystko.km)} XP.` })), h('div', { class: 'filtry', role: 'group', 'aria-label': 'Rodzaj' }, przyc), lista);
    function rysuj() {
      lista.replaceChildren();
      let tyg = null;
      for (const j of K.jazdy.filter((x) => filtr === 'wszystkie' || x.typ === filtr).slice(-30).reverse()) {
        const t = K.tygodnie.find((x) => j.data >= x.od && j.data < new Date(x.od.getFullYear(), x.od.getMonth(), x.od.getDate() + 7));
        if (t !== tyg) { tyg = t; lista.append(h('div', { class: 'grupa-t', text: t && t.biezacy ? `Ten tydzień · ${f.liczba(t.km)} km` : t ? `Tydzień ${f.dataKrotka(t.od)} · ${f.liczba(t.km)} km` : '' })); }
        const box = h('div', { class: 'ikb' + (j.typ === 'zwift' ? ' zw' : '') }); box.append(A.mapka(j, { w: 58, h: 58, pad: 6 }) || ik('monitor-play', 'fill'));
        const pr = A.osiagniecia(j).filter((x) => x.typ === 'pr').length;
        lista.append(klik(h('div', { class: 'wj dotyk', role: 'button', tabindex: 0, 'aria-label': j.nazwa }, box, h('div', null, h('h3', { text: j.nazwa.replace('Zwift · ', '') }), h('p', { text: `${A.wielka(f.kiedy(j.data))} · ${f.czasHM(j.czas)}` }), h('span', { class: 'xp' }, ik(pr ? 'trophy' : 'lightning', 'fill'), pr ? `rekord! +${Math.round(j.km) + 50} XP` : `+${Math.round(j.km)} XP`)), h('div', { class: 'km' }, f.km(j.km), h('small', { text: 'km' }))), () => otworzJazde(j)));
      }
    }
    rysuj();
  }

  // ───────── Liga tygodni ─────────
  function liga(el) {
    const tyg = K.tygodnie.filter((t) => t.jazdy > 0).map((t) => t).sort((a, b) => b.km - a.km);
    const miejsce = tyg.findIndex((t) => t.biezacy) + 1;
    const top = tyg.slice(0, 10);
    const ja = tyg.find((t) => t.biezacy);
    const wiersz = (t, m) => h('div', { class: 'rk' + (t.biezacy ? ' ja' : '') },
      h('span', { class: 'm ' + (m === 1 ? 'zl' : m === 2 ? 'sr' : m === 3 ? 'br' : ''), text: m <= 3 ? '' : String(m) }, m <= 3 ? ik('medal', 'fill') : null),
      h('span', { class: 'av' }, ik(t.biezacy ? 'bicycle' : t.kmZwift > t.kmSzosa ? 'monitor-play' : 'mountains', 'fill')),
      h('span', null, h('b', { text: t.biezacy ? 'Ten tydzień (Ty teraz)' : `Tydzień ${f.dataKrotka(t.od)} ${t.od.getFullYear() !== 2026 ? t.od.getFullYear() : ''}`.trim() }), h('small', { text: `${t.jazdy} ${A.odm(t.jazdy, 'jazda', 'jazdy', 'jazd')} · ${f.liczba(t.czas / 3600, 1)} h` })),
      h('span', { class: 'v', text: `${f.liczba(t.km)} km` }));
    el.append(gora(), h('div', { class: 'liga-g' }, h('div', { class: 'tarcza' }, ik('trophy', 'fill')), h('h1', { text: 'Liga Twoich tygodni' }), h('p', { text: `Ten tydzień jest na ${miejsce}. miejscu z ${tyg.length}. Do pierwszej dziesiątki brakuje ${miejsce > 10 ? f.liczba(top[9].km - ja.km) + ' km' : 'niczego — już w niej jesteś!'}` })),
      h('div', { class: 'ranking' }, top.map((t, i) => wiersz(t, i + 1)), miejsce > 10 ? [h('div', { class: 'strefa-awansu' }, ik('caret-up', 'bold'), 'Strefa awansu wyżej'), wiersz(ja, miejsce)] : null),
      h('p', { class: 'przypis', text: 'Liga porównuje tylko Twoje tygodnie ze sobą — żadnych obcych.' }));
  }

  // ───────── Profil ─────────
  function profil(el) {
    const Wsz = K.okresy.wszystko;
    const KOL = ['var(--zloto)', 'var(--pom)', 'var(--ziel)', 'var(--nieb)', 'var(--fiol)', 'var(--czer)'];
    el.append(gora(), h('div', { class: 'profil-g' }, h('div', null, h('h1', { text: 'Fryderyk Marszałek' }), h('p', { text: `Poziom ${LV.nr} · kolarz od sierpnia 2025` })), h('div', { class: 'av', text: 'FM' })),
      h('div', { class: 'zaw' },
        h('div', { class: 'staty4' },
          h('div', { class: 'st4' }, ik('flame', 'fill', ''), h('b', { text: String(A.seria.tygodnie) }), h('small', { text: 'tygodni serii' })),
          h('div', { class: 'st4' }, ik('lightning', 'fill'), h('b', { text: f.liczba(Wsz.km) }), h('small', { text: 'XP (km)' })),
          h('div', { class: 'st4' }, ik('diamond', 'fill'), h('b', { text: String(LV.nr) }), h('small', { text: `${f.liczba(LV.brakuje)} km do ${LV.nr + 1}` })),
          h('div', { class: 'st4' }, ik('crown', 'fill'), h('b', { text: String(A.odznaki.filter((o) => o.zdobyta).length) }), h('small', { text: 'odznak' }))),
        h('section', { class: 'ramka' }, h('div', { class: 'ramka-t' }, h('span', { text: 'Osiągnięcia' }), h('span', { text: `${A.odznaki.filter((o) => o.zdobyta).length}/${A.odznaki.length}` })),
          h('div', { class: 'odznaki' }, A.odznaki.map((o, i) => h('div', { class: 'odz' + (o.zdobyta ? '' : ' zabl') }, h('div', { class: 'tar', style: { background: KOL[i % KOL.length] } }, ik(o.ikona, 'fill')), h('div', null, h('b', { text: o.nazwa }), h('small', { text: o.zdobyta ? o.szczegol : o.opis }), o.zdobyta ? null : A.pasek(o.postep)))))),
        h('p', { class: 'przypis', text: 'Kolarstwo · styl Ścieżka. Liczby są przykładowe.' })));
    el.querySelectorAll('.st4 i')[0].style.color = 'var(--pom)'; el.querySelectorAll('.st4 i')[1].style.color = 'var(--zloto)'; el.querySelectorAll('.st4 i')[2].style.color = 'var(--fiol)'; el.querySelectorAll('.st4 i')[3].style.color = 'var(--nieb)';
  }

  A.aplikacja({ tytul: 'Kolarstwo', zakladki: [{ id: 'start', nazwa: 'Ścieżka', ikona: 'path' }, { id: 'jazdy', nazwa: 'Jazdy', ikona: 'bicycle' }, { id: 'liga', nazwa: 'Liga', ikona: 'ranking' }, { id: 'profil', nazwa: 'Profil', ikona: 'user' }], ekrany: { start, jazdy, liga, profil } });
})();
