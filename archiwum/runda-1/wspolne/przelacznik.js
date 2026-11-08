/*
 * Kolarstwo 2 — przełącznik stylów. Neutralny, żeby nie kłócił się z żadnym projektem.
 * Skróty: 1–5 wybór stylu, [ i ] poprzedni / następny.
 */
(function () {
  'use strict';
  const STYLE = [
    { slug: 'telemetria', nazwa: 'Telemetria', opis: 'Ciemny, techniczny — jak ekran wozu technicznego' },
    { slug: 'raster', nazwa: 'Raster', opis: 'Szwajcarska siatka — biel, czerń, czerwień' },
    { slug: 'almanach', nazwa: 'Almanach', opis: 'Magazyn kolarski — tekst pisany z danych' },
    { slug: 'topo', nazwa: 'Topo', opis: 'Mapa topograficzna nocą' },
    { slug: 'sezon', nazwa: 'Sezon', opis: 'Zin z risografu — kolor i zabawa' },
  ];
  const skrypt = document.currentScript;
  const baza = skrypt ? skrypt.src.replace(/wspolne\/przelacznik\.js.*$/, '') : '../../';
  const biezacy = document.documentElement.dataset.styl;
  const idx = Math.max(0, STYLE.findIndex((s) => s.slug === biezacy));
  const zapisz = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* prywatne okno */ } };
  const czytaj = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  zapisz('k2.styl.r1', STYLE[idx].slug);
  const url = (i) => baza + 'style/' + STYLE[(i + STYLE.length) % STYLE.length].slug + '/';

  const css = `
  .k2s{position:fixed;left:50%;bottom:max(14px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483000;
    display:flex;align-items:center;gap:2px;padding:4px;border-radius:999px;background:rgba(20,20,22,.9);
    -webkit-backdrop-filter:blur(14px) saturate(140%);backdrop-filter:blur(14px) saturate(140%);
    box-shadow:0 0 0 1px rgba(255,255,255,.08),0 10px 30px -8px rgba(0,0,0,.45);
    font:500 12.5px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif;color:#EDEDEF;
    letter-spacing:-.005em;-webkit-font-smoothing:antialiased;transition:opacity .2s,transform .25s cubic-bezier(.2,.8,.2,1)}
  .k2s *{box-sizing:border-box}
  .k2s a,.k2s button{all:unset;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;height:32px;border-radius:999px;color:inherit;white-space:nowrap;-webkit-tap-highlight-color:transparent}
  .k2s a:focus-visible,.k2s button:focus-visible{outline:2px solid #EDEDEF;outline-offset:1px}
  .k2s-strz{width:32px;color:#A1A1A8!important;font-size:16px!important}
  .k2s-strz:hover,.k2s-ikon:hover{color:#fff!important;background:rgba(255,255,255,.08)}
  .k2s ol{display:flex;gap:2px;margin:0;padding:0;list-style:none}
  .k2s ol a{padding:0 12px 0 10px;gap:7px;color:#B9B9C0}
  .k2s ol a:hover{background:rgba(255,255,255,.07);color:#fff}
  .k2s ol a[aria-current]{background:#EDEDEF;color:#111113}
  .k2s-nr{font:600 10.5px/1 ui-monospace,"SF Mono",Menlo,monospace;opacity:.55}
  .k2s ol a[aria-current] .k2s-nr{opacity:.5}
  .k2s-sep{width:1px;height:18px;background:rgba(255,255,255,.12);margin:0 4px}
  .k2s-ikon{width:32px;color:#A1A1A8!important}
  .k2s-pop{position:absolute;bottom:calc(100% + 10px);right:0;width:300px;padding:14px 16px 13px;border-radius:14px;background:rgba(20,20,22,.96);
    box-shadow:0 0 0 1px rgba(255,255,255,.08),0 18px 40px -12px rgba(0,0,0,.55);font-weight:400;font-size:12.5px;line-height:1.5;color:#C9C9CF;white-space:normal}
  .k2s-pop[hidden]{display:none}
  .k2s-pop strong{display:block;color:#fff;font-weight:600;font-size:13px;margin-bottom:4px}
  .k2s-pop p{margin:0 0 8px}
  .k2s-pop kbd{font:600 10.5px/1 ui-monospace,"SF Mono",Menlo,monospace;padding:2px 5px;border-radius:4px;background:rgba(255,255,255,.1);color:#fff}
  .k2s-pop .k2s-opis{color:#9C9CA4}
  .k2s.k2s--zw{padding:4px}
  .k2s.k2s--zw>:not(.k2s-mini){display:none}
  .k2s-mini{display:none!important}
  .k2s.k2s--zw .k2s-mini{display:inline-flex!important;padding:0 12px 0 10px;gap:7px}
  .k2s-kropka{width:6px;height:6px;border-radius:50%;background:#EDEDEF;opacity:.8}
  @media (max-width:720px){
    .k2s ol a:not([aria-current]) .k2s-naz{display:none}
    .k2s ol a:not([aria-current]){padding:0;width:28px}
    .k2s ol a:not([aria-current]) .k2s-nr{opacity:.8}
    .k2s-pop{right:-40px;width:min(300px,calc(100vw - 32px))}
  }
  @media (max-width:420px){.k2s-strz{display:none!important}}
  @media print{.k2s{display:none}}
  @media (prefers-reduced-motion:reduce){.k2s{transition:none}}`;
  const styl = document.createElement('style');
  styl.textContent = css;
  document.head.appendChild(styl);

  const h = (tag, attrs, ...dz) => { const el = document.createElement(tag); for (const k in attrs || {}) { if (k === 'text') el.textContent = attrs[k]; else el.setAttribute(k, attrs[k]); } dz.forEach((d) => el.append(d)); return el; };

  const nav = h('nav', { class: 'k2s', 'aria-label': 'Przełącznik stylu (dane przykładowe)' });
  const poprz = h('a', { class: 'k2s-strz', href: url(idx - 1), 'aria-label': 'Poprzedni styl', title: 'Poprzedni styl  [' }, '‹');
  const nast = h('a', { class: 'k2s-strz', href: url(idx + 1), 'aria-label': 'Następny styl', title: 'Następny styl  ]' }, '›');
  const lista = h('ol');
  STYLE.forEach((s, i) => {
    const a = h('a', { href: url(i), title: s.opis + '  (' + (i + 1) + ')' }, h('span', { class: 'k2s-nr', text: String(i + 1) }), h('span', { class: 'k2s-naz', text: s.nazwa }));
    if (i === idx) a.setAttribute('aria-current', 'page');
    lista.append(h('li', null, a));
  });
  const info = h('button', { class: 'k2s-ikon', type: 'button', 'aria-label': 'O przełączniku', 'aria-expanded': 'false', title: 'Informacje' });
  info.innerHTML = '<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M8 7.2v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="4.9" r=".9" fill="currentColor"/></svg>';
  const zwin = h('button', { class: 'k2s-ikon', type: 'button', 'aria-label': 'Zwiń przełącznik', title: 'Zwiń' });
  zwin.innerHTML = '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const mini = h('button', { class: 'k2s-mini', type: 'button', 'aria-label': 'Rozwiń przełącznik stylu' }, h('span', { class: 'k2s-kropka' }), h('span', { text: (idx + 1) + ' / ' + STYLE.length + ' · ' + STYLE[idx].nazwa }));
  const pop = h('div', { class: 'k2s-pop', hidden: '' });
  pop.innerHTML = '<strong>Pięć propozycji wyglądu</strong><p>Wszystkie liczby, trasy i wykresy są <b>przykładowe</b>. Segmenty, ich długości i Twoje rekordy pochodzą ze starej strony, reszta jest wymyślona. Prawdziwe dane ze Stravy podepniemy do stylu, który wybierzesz.</p><p class="k2s-opis">' + STYLE[idx].opis + '.</p><p style="margin:0">Skróty: <kbd>1</kbd>–<kbd>5</kbd> styl, <kbd>[</kbd> <kbd>]</kbd> poprzedni i następny.</p>';
  nav.append(poprz, lista, nast, h('span', { class: 'k2s-sep', 'aria-hidden': 'true' }), info, zwin, mini, pop);

  const ustawZwiniecie = (z) => { nav.classList.toggle('k2s--zw', z); zapisz('k2.zwiniety.r1', z ? '1' : '0'); };
  if (czytaj('k2.zwiniety.r1') === '1') nav.classList.add('k2s--zw');
  zwin.addEventListener('click', () => ustawZwiniecie(true));
  mini.addEventListener('click', () => ustawZwiniecie(false));
  info.addEventListener('click', (e) => { e.stopPropagation(); const o = pop.hidden; pop.hidden = !o; info.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('click', (e) => { if (!pop.hidden && !nav.contains(e.target)) { pop.hidden = true; info.setAttribute('aria-expanded', 'false'); } });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (/^[1-5]$/.test(e.key)) { const i = +e.key - 1; if (i !== idx) location.href = url(i); }
    else if (e.key === '[') location.href = url(idx - 1);
    else if (e.key === ']') location.href = url(idx + 1);
    else if (e.key === 'Escape' && !pop.hidden) { pop.hidden = true; info.setAttribute('aria-expanded', 'false'); }
  });

  const wstaw = () => document.body.appendChild(nav);
  if (document.body) wstaw(); else document.addEventListener('DOMContentLoaded', wstaw);
})();
