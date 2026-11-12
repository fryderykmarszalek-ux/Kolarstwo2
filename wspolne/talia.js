/* Obwód talii: wskaźnik talia/wzrost (WHtR) i jego ocena — drugi przelicznik sekcji „Budowa ciała”.
 *
 * Źródło: NICE NG246 „Overweight and obesity management” (styczeń 2025, poprawka styczeń 2026),
 * rozdział „Identifying and assessing overweight, obesity and central adiposity”. Wcześniej to samo
 * w NICE CG189 (aktualizacja 2022). Liczby przepisane z cytatów tej strony, NIE wymyślone:
 *   – „healthy central adiposity: waist-to-height ratio 0.4 to 0.49, indicating no increased health risks”
 *   – „increased central adiposity: waist-to-height ratio 0.5 to 0.59, indicating increased health risks”
 *   – „high central adiposity: waist-to-height ratio 0.6 or more, indicating further increased health risks”
 * Zakres stosowania:
 *   – dorośli: „people with a BMI under 35 kg/m², of both sexes and all ethnicities, including adults
 *     with high muscle mass” — przy BMI ≥ 35 NICE tej klasyfikacji nie stosuje;
 *   – dzieci i młodzież: te same przedziały „for children and young people aged 5 years and over
 *     of both sexes and all ethnicities” (bez warunku BMI).
 *   – poniżej 0,4 NICE nie podaje klasy — strona pokazuje wtedy liczbę bez oceny.
 * Rada NICE: „keep their waist to less than half their height” → talia docelowa < 0,5 × wzrost.
 *
 * Wiek dorosły w NICE = od 18 lat. Strona ocenia w tym samym zakresie co BMI: 13–99 lat.
 * WHtR zaokrąglany do 0,01 przed oceną — tak jak przedziały NICE (0,49 / 0,5).
 */
(function (global) {
  'use strict';
  const T = { NORMA: 0.4, PODWYZSZONA: 0.5, WYSOKA: 0.6, BMI_DOROSLI_MAKS: 35, DOROSLY_OD: 18 };

  T.oblicz = (taliaCm, wzrostCm) => (taliaCm > 0 && wzrostCm > 0 ? taliaCm / wzrostCm : null);
  T.cel = (wzrostCm) => (wzrostCm > 0 ? wzrostCm / 2 : null);          // talia „mniejsza niż połowa wzrostu”

  const NAZWY = { norma: ['W normie', 'dobrze'], podwyzszona: ['Podwyższony', 'uwaga'], wysoka: ['Wysoki', 'zle'], ponizej: ['Poza klasyfikacją', 'brak'] };

  // { talia, wzrost, bmi, wiekLat } → ocena albo powód, dla którego jej nie ma
  T.ocen = (d) => {
    if (!(d.talia > 0)) return { stan: 'brak-talii' };
    if (!(d.wzrost > 0)) return { stan: 'brak-wzrostu' };
    const r = Math.round((d.talia / d.wzrost) * 100) / 100;
    const wiek = d.wiekLat;
    if (wiek != null && (wiek < 13 || wiek > 99)) return { stan: 'poza-wiekiem', whtr: r };
    const dorosly = wiek == null ? null : wiek >= T.DOROSLY_OD;
    if (dorosly !== false) {                                   // dorosły albo wiek nieznany: potrzebny warunek BMI < 35
      if (!(d.bmi > 0)) return { stan: dorosly ? 'brak-masy' : 'brak-wieku', whtr: r };
      if (d.bmi >= T.BMI_DOROSLI_MAKS) return { stan: dorosly ? 'bmi-35' : 'brak-wieku', whtr: r };
    }
    const klucz = r < T.NORMA ? 'ponizej' : r < T.PODWYZSZONA ? 'norma' : r < T.WYSOKA ? 'podwyzszona' : 'wysoka';
    return { stan: 'ok', whtr: r, klucz, nazwa: NAZWY[klucz][0], poziom: NAZWY[klucz][1], cel: T.cel(d.wzrost) };
  };

  global.TALIA = T;
  if (typeof module !== 'undefined') module.exports = T;
})(typeof window !== 'undefined' ? window : globalThis);
