/*
 * Kolarstwo 2 — przełącznik stylów (runda 3: szerokie strony).
 * Cienki pasek na samej górze; po prawej link do archiwum poprzednich rund.
 * Skróty: 1–5 styl, [ i ] poprzedni / następny. Widok (#kalendarz, #analiza/…) przechodzi między stylami.
 */
(function () {
  'use strict';
  const STYLE = [
    { slug: 'horyzont', nazwa: 'Horyzont', opis: 'Panorama z profilu Twojej jazdy, ciepło i czysto' },
    { slug: 'trener', nazwa: 'Trener Pro', opis: 'Boczne menu, plan i gotowość na pierwszym planie' },
    { slug: 'atlas', nazwa: 'Atlas', opis: 'Mapa wszystkich jazd jako tło pracy' },
    { slug: 'pulpit', nazwa: 'Pulpit', opis: 'Narzędzie analityczne, najbliżej TrainingPeaks' },
    { slug: 'os', nazwa: 'Oś', opis: 'Cały sezon w poziomie, tydzień po tygodniu' },
  ];
  const skrypt = document.currentScript;
  const baza = skrypt ? skrypt.src.replace(/wspolne\/przelacznik\.js.*$/, '') : '../../';
  const biezacy = document.documentElement.dataset.styl;
  const idx = Math.max(0, STYLE.findIndex((s) => s.slug === biezacy));
  try { localStorage.setItem('k2.styl', STYLE[idx].slug); } catch (e) { /* prywatne okno */ }
  const url = (i) => baza + 'style/' + STYLE[(i + STYLE.length) % STYLE.length].slug + '/';
  const H = 36;
  document.documentElement.style.setProperty('--k2s-h', H + 'px');

  const css = `
  .k2s{position:fixed;left:0;right:0;top:0;z-index:2147483000;height:${H}px;display:flex;align-items:center;justify-content:center;gap:4px;padding:0 8px;
    background:#141416;color:#EDEDEF;font:500 12.5px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif;letter-spacing:-.005em;
    -webkit-font-smoothing:antialiased;box-shadow:0 1px 0 rgba(255,255,255,.06)}
  .k2s *{box-sizing:border-box}
  .k2s a,.k2s button{all:unset;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;height:26px;border-radius:999px;white-space:nowrap;-webkit-tap-highlight-color:transparent}
  .k2s a:focus-visible,.k2s button:focus-visible{outline:2px solid #EDEDEF;outline-offset:1px}
  .k2s-etyk{color:#8E8E96;margin-right:6px;font-size:11.5px}
  .k2s-strz{width:26px;color:#A1A1A8;font-size:15px}
  .k2s-strz:hover{color:#fff;background:rgba(255,255,255,.08)}
  .k2s ol{display:flex;gap:2px;margin:0;padding:0;list-style:none}
  .k2s ol a{padding:0 11px 0 9px;gap:6px;color:#B9B9C0}
  .k2s ol a:hover{background:rgba(255,255,255,.08);color:#fff}
  .k2s ol a[aria-current]{background:#EDEDEF;color:#111113}
  .k2s-nr{font:600 10px/1 ui-monospace,"SF Mono",Menlo,monospace;opacity:.55}
  .k2s-info{width:26px;color:#8E8E96!important}
  .k2s-info:hover{color:#fff!important}
  .k2s .k2s-arch{position:absolute;right:10px;padding:0 11px;color:#8E8E96;font-size:11.5px}
  .k2s .k2s-arch:hover{color:#fff;background:rgba(255,255,255,.08)}
  .k2s-pop{position:fixed;top:${H + 8}px;right:8px;width:min(320px,calc(100vw - 16px));padding:14px 16px 12px;border-radius:14px;background:#1C1C1F;color:#C9C9CF;
    box-shadow:0 0 0 1px rgba(255,255,255,.08),0 18px 40px -12px rgba(0,0,0,.55);font-size:12.5px;line-height:1.5;white-space:normal}
  .k2s-pop[hidden]{display:none}
  .k2s-pop strong{display:block;color:#fff;font-weight:600;font-size:13px;margin-bottom:4px}
  .k2s-pop p{margin:0 0 8px}
  .k2s-pop a{all:unset;cursor:pointer;color:#fff;text-decoration:underline;text-underline-offset:2px}
  .k2s-pop kbd{font:600 10.5px/1 ui-monospace,"SF Mono",Menlo,monospace;padding:2px 5px;border-radius:4px;background:rgba(255,255,255,.1);color:#fff}
  @media (max-width:980px){.k2s .k2s-arch{display:none}}
  @media (max-width:640px){
    .k2s-etyk{display:none}
    .k2s ol a:not([aria-current]) .k2s-naz{display:none}
    .k2s ol a:not([aria-current]){padding:0;width:26px}
    .k2s ol a:not([aria-current]) .k2s-nr{opacity:.85}
  }
  @media print{.k2s{display:none}}`;
  const styl = document.createElement('style'); styl.textContent = css; document.head.appendChild(styl);
  const h = (tag, attrs, ...dz) => { const el = document.createElement(tag); for (const k in attrs || {}) { if (k === 'text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]); } dz.forEach((d) => el.append(d)); return el; };

  const nav = h('nav', { class: 'k2s', 'aria-label': 'Przełącznik stylu (dane przykładowe)' });
  const lista = h('ol');
  const linki = [];
  STYLE.forEach((s, i) => {
    const a = h('a', { href: url(i), title: s.opis + '  (' + (i + 1) + ')' }, h('span', { class: 'k2s-nr', text: String(i + 1) }), h('span', { class: 'k2s-naz', text: s.nazwa }));
    if (i === idx) a.setAttribute('aria-current', 'page');
    linki.push([a, i]);
    lista.append(h('li', null, a));
  });
  const strL = h('a', { class: 'k2s-strz', href: url(idx - 1), 'aria-label': 'Poprzedni styl' }, '‹');
  const strP = h('a', { class: 'k2s-strz', href: url(idx + 1), 'aria-label': 'Następny styl' }, '›');
  // ten sam widok w innym stylu
  const odswiezLinki = () => { const hs = location.hash; linki.forEach(([a, i]) => a.setAttribute('href', url(i) + hs)); strL.setAttribute('href', url(idx - 1) + hs); strP.setAttribute('href', url(idx + 1) + hs); };
  window.addEventListener('hashchange', odswiezLinki); odswiezLinki();
  const idzDo = (i) => { location.href = url(i) + location.hash; };

  const info = h('button', { class: 'k2s-info', type: 'button', 'aria-label': 'O przełączniku', 'aria-expanded': 'false' });
  info.innerHTML = '<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 7.2v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="4.9" r=".9" fill="currentColor"/></svg>';
  const pop = h('div', { class: 'k2s-pop', hidden: '' });
  pop.innerHTML = '<strong>Runda trzecia: pięć szerokich stron</strong><p>Wszystkie liczby są <b>przykładowe</b>; segmenty i rekordy pochodzą ze starej strony. Plan treningów to szkic do pokazu. Najlepiej oglądać na komputerze, na całym ekranie.</p><p style="color:#9C9CA4">' + STYLE[idx].opis + '.</p><p>Poprzednie rundy: <a href="' + baza + '../">archiwum</a>.</p><p style="margin:0">Skróty: <kbd>1</kbd>–<kbd>5</kbd>, <kbd>[</kbd> <kbd>]</kbd>.</p>';
  const arch = h('a', { class: 'k2s-arch', href: baza + '../', title: 'Poprzednie rundy propozycji' }, 'Archiwum');
  nav.append(h('span', { class: 'k2s-etyk', text: 'Styl' }), strL, lista, strP, info, pop, arch);
  info.addEventListener('click', (e) => { e.stopPropagation(); const o = pop.hidden; pop.hidden = !o; info.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('click', (e) => { if (!pop.hidden && !nav.contains(e.target)) { pop.hidden = true; info.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (/^[1-5]$/.test(e.key)) { const i = +e.key - 1; if (i !== idx) idzDo(i); }
    else if (e.key === '[') idzDo(idx - 1);
    else if (e.key === ']') idzDo(idx + 1);
  });
  const wstaw = () => document.body.prepend(nav);
  if (document.body) wstaw(); else document.addEventListener('DOMContentLoaded', wstaw);
})();
