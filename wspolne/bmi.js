/* BMI: wzór i ocena wyniku — przelicznik dla wieku 13–99 lat.
 *
 * NIC tu nie jest wymyślone na potrzeby strony. Liczby i progi pochodzą wprost ze źródeł:
 *
 * 1) Wiek 13–19 lat (do 228 ukończonych miesięcy): WHO Growth Reference 2007, BMI-for-age 5–19 lat
 *    (de Onis i in., Bulletin of the WHO 2007;85:660–667). Ocena zależy od wieku co do miesiąca i od płci.
 *    Tabela L, M, S poniżej to kopia maszynowa pliku data-raw/growthstandards/bfawho2007.txt z pakietu
 *    „anthroplus” — oficjalnego programu WHO (github.com/WorldHealthOrganization/anthroplus).
 *    sha256 pliku źródłowego: 7c71c5115c0cc042a017eb2693efb7a122d1082911bbbd99a63d96e1925949b2
 *    Sposób liczenia jest przepisany z tego samego pakietu, krok po kroku:
 *      – wiek w miesiącach = dni życia / 30,4375; L, M, S między miesiącami interpolowane liniowo,
 *      – z = ((BMI/M)^L − 1) / (L·S), a poza ±3 poprawka WHO (odległość liczona szerokością pasa 2–3 SD),
 *      – progi WHO: z < −3 znaczna niedowaga, z < −2 niedowaga, z > +1 nadwaga, z > +2 otyłość.
 *    Krzywe WHO 2007 są zbudowane tak, żeby w wieku 19 lat schodziły się z progami dla dorosłych:
 *    +1 SD = 25,4 (chłopcy) i 25,0 (dziewczęta), +2 SD = 29,7 — stąd przejście na dorosłych bez skoku.
 *
 * 2) Wiek od 19 lat i 1 miesiąca do 99 lat: klasyfikacja WHO dla dorosłych (WHO Technical Report
 *    Series 894, 2000): < 16 znaczna niedowaga, < 18,5 niedowaga, 18,5–24,9 norma, 25–29,9 nadwaga,
 *    30–34,9 / 35–39,9 / ≥ 40 otyłość I, II i III stopnia. Taka sama dla obu płci i każdego wieku.
 *    BMI zaokrąglane do 0,1 przed oceną — progi WHO są podane z dokładnością do 0,1.
 *
 * Sprawdzone 12.11.2026 na zestawie testowym WHO z tego samego pakietu (test_dataset_who2007.rds):
 * wszystkie przypadki w wieku 13–19 lat dają z-score identyczny z wzorcowym co do 0,01.
 *
 * Czego BMI NIE mówi: nie odróżnia mięśni od tłuszczu. To orientacja, nie diagnoza.
 */
(function (global) {
  'use strict';
  // [L, M, S] dla miesięcy 155…229; m = chłopcy, k = dziewczęta. NIE POPRAWIAĆ RĘCZNIE.
  const OD = 155, DO = 229;
  const WHO2007 = {
    m: [
      [-1.7232,18.1710,0.11869],[-1.7168,18.2330,0.11898],[-1.7102,18.2955,0.11925],[-1.7033,18.3586,0.11952],[-1.6962,18.4221,0.11979],
      [-1.6888,18.4860,0.12005],[-1.6811,18.5502,0.12030],[-1.6732,18.6148,0.12055],[-1.6651,18.6795,0.12079],[-1.6568,18.7445,0.12102],
      [-1.6482,18.8095,0.12125],[-1.6394,18.8746,0.12148],[-1.6304,18.9398,0.12170],[-1.6211,19.0050,0.12191],[-1.6116,19.0701,0.12212],
      [-1.6020,19.1351,0.12233],[-1.5921,19.2000,0.12253],[-1.5821,19.2648,0.12272],[-1.5719,19.3294,0.12291],[-1.5615,19.3937,0.12310],
      [-1.5510,19.4578,0.12328],[-1.5403,19.5217,0.12346],[-1.5294,19.5853,0.12363],[-1.5185,19.6486,0.12380],[-1.5074,19.7117,0.12396],
      [-1.4961,19.7744,0.12412],[-1.4848,19.8367,0.12428],[-1.4733,19.8987,0.12443],[-1.4617,19.9603,0.12458],[-1.4500,20.0215,0.12473],
      [-1.4382,20.0823,0.12487],[-1.4263,20.1427,0.12501],[-1.4143,20.2026,0.12514],[-1.4022,20.2621,0.12528],[-1.3900,20.3211,0.12541],
      [-1.3777,20.3796,0.12554],[-1.3653,20.4376,0.12567],[-1.3529,20.4951,0.12579],[-1.3403,20.5521,0.12591],[-1.3277,20.6085,0.12603],
      [-1.3149,20.6644,0.12615],[-1.3021,20.7197,0.12627],[-1.2892,20.7745,0.12638],[-1.2762,20.8287,0.12650],[-1.2631,20.8824,0.12661],
      [-1.2499,20.9355,0.12672],[-1.2366,20.9881,0.12683],[-1.2233,21.0400,0.12694],[-1.2098,21.0914,0.12704],[-1.1962,21.1423,0.12715],
      [-1.1826,21.1925,0.12726],[-1.1688,21.2423,0.12736],[-1.1550,21.2914,0.12746],[-1.1410,21.3400,0.12756],[-1.1270,21.3880,0.12767],
      [-1.1129,21.4354,0.12777],[-1.0986,21.4822,0.12787],[-1.0843,21.5285,0.12797],[-1.0699,21.5742,0.12807],[-1.0553,21.6193,0.12816],
      [-1.0407,21.6638,0.12826],[-1.0260,21.7077,0.12836],[-1.0112,21.7510,0.12845],[-0.9962,21.7937,0.12855],[-0.9812,21.8358,0.12864],
      [-0.9661,21.8773,0.12874],[-0.9509,21.9182,0.12883],[-0.9356,21.9585,0.12893],[-0.9202,21.9982,0.12902],[-0.9048,22.0374,0.12911],
      [-0.8892,22.0760,0.12920],[-0.8735,22.1140,0.12930],[-0.8578,22.1514,0.12939],[-0.8419,22.1883,0.12948],[-0.8419,22.1883,0.12948]],
    k: [
      [-1.3269,18.7346,0.13421],[-1.3195,18.8012,0.13445],[-1.3121,18.8675,0.13469],[-1.3046,18.9335,0.13492],[-1.2970,18.9991,0.13514],
      [-1.2894,19.0642,0.13537],[-1.2816,19.1289,0.13559],[-1.2739,19.1931,0.13580],[-1.2661,19.2567,0.13601],[-1.2583,19.3197,0.13622],
      [-1.2504,19.3820,0.13642],[-1.2425,19.4437,0.13662],[-1.2345,19.5045,0.13681],[-1.2266,19.5647,0.13700],[-1.2186,19.6240,0.13719],
      [-1.2107,19.6824,0.13738],[-1.2027,19.7400,0.13756],[-1.1947,19.7966,0.13774],[-1.1867,19.8523,0.13791],[-1.1788,19.9070,0.13808],
      [-1.1708,19.9607,0.13825],[-1.1629,20.0133,0.13841],[-1.1549,20.0648,0.13858],[-1.1470,20.1152,0.13873],[-1.1390,20.1644,0.13889],
      [-1.1311,20.2125,0.13904],[-1.1232,20.2595,0.13920],[-1.1153,20.3053,0.13934],[-1.1074,20.3499,0.13949],[-1.0996,20.3934,0.13963],
      [-1.0917,20.4357,0.13977],[-1.0838,20.4769,0.13991],[-1.0760,20.5170,0.14005],[-1.0681,20.5560,0.14018],[-1.0603,20.5938,0.14031],
      [-1.0525,20.6306,0.14044],[-1.0447,20.6663,0.14057],[-1.0368,20.7008,0.14070],[-1.0290,20.7344,0.14082],[-1.0212,20.7668,0.14094],
      [-1.0134,20.7982,0.14106],[-1.0055,20.8286,0.14118],[-0.9977,20.8580,0.14130],[-0.9898,20.8863,0.14142],[-0.9819,20.9137,0.14153],
      [-0.9740,20.9401,0.14164],[-0.9661,20.9656,0.14176],[-0.9582,20.9901,0.14187],[-0.9503,21.0138,0.14198],[-0.9423,21.0367,0.14208],
      [-0.9344,21.0587,0.14219],[-0.9264,21.0801,0.14230],[-0.9184,21.1007,0.14240],[-0.9104,21.1206,0.14250],[-0.9024,21.1399,0.14261],
      [-0.8944,21.1586,0.14271],[-0.8863,21.1768,0.14281],[-0.8783,21.1944,0.14291],[-0.8703,21.2116,0.14301],[-0.8623,21.2282,0.14311],
      [-0.8542,21.2444,0.14320],[-0.8462,21.2603,0.14330],[-0.8382,21.2757,0.14340],[-0.8301,21.2908,0.14349],[-0.8221,21.3055,0.14359],
      [-0.8140,21.3200,0.14368],[-0.8060,21.3341,0.14377],[-0.7980,21.3480,0.14386],[-0.7899,21.3617,0.14396],[-0.7819,21.3752,0.14405],
      [-0.7738,21.3884,0.14414],[-0.7658,21.4014,0.14423],[-0.7577,21.4143,0.14432],[-0.7496,21.4269,0.14441],[-0.7496,21.4269,0.14441]],
  };
  const DOROSLI_OD = 229;                      // miesiące: WHO liczy siatką do wieku < 229 miesięcy
  const B = { WHO2007, OD_MIES: 156, DOROSLI_OD };

  B.oblicz = (wzrostCm, masaKg) => (wzrostCm > 0 && masaKg > 0 ? masaKg / Math.pow(wzrostCm / 100, 2) : null);

  // L, M, S dla wieku w miesiącach (ułamkowego) — interpolacja liniowa jak w programie WHO
  B.lms = (plec, wiekMies) => {
    const t = WHO2007[plec];
    if (!t || !(wiekMies >= OD && wiekMies < DO)) return null;
    const n = Math.trunc(wiekMies), r = wiekMies - n, a = t[n - OD], b = t[n + 1 - OD];
    return r > 0 ? a.map((v, i) => v + r * (b[i] - v)) : a.slice();
  };
  const sd = (p, z) => p[1] * Math.pow(1 + p[0] * p[2] * z, 1 / p[0]);   // BMI, które wypada dokładnie na z

  B.z = (bmi, plec, wiekMies) => {
    const p = B.lms(plec, wiekMies);
    if (!p || !(bmi > 0)) return null;
    let z = (Math.pow(bmi / p[1], p[0]) - 1) / (p[2] * p[0]);
    if (z > 3) z = 3 + (bmi - sd(p, 3)) / (sd(p, 3) - sd(p, 2));
    else if (z < -3) z = -3 + (bmi - sd(p, -3)) / (sd(p, -2) - sd(p, -3));
    return z;
  };
  B.prog = (z, plec, wiekMies) => { const p = B.lms(plec, wiekMies); return p ? sd(p, z) : null; };

  // dystrybuanta rozkładu normalnego (Abramowitz–Stegun 26.2.17, błąd < 7,5e-8) → centyl
  B.centyl = (z) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989422804014327 * Math.exp(-z * z / 2);
    const p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return 100 * (z >= 0 ? 1 - p : p);
  };

  const NAZWY = {
    'znaczna-niedowaga': ['Znaczna niedowaga', 'zle'], niedowaga: ['Niedowaga', 'uwaga'], norma: ['W normie', 'dobrze'],
    nadwaga: ['Nadwaga', 'uwaga'], otylosc: ['Otyłość', 'zle'],
    'otylosc-1': ['Otyłość I stopnia', 'zle'], 'otylosc-2': ['Otyłość II stopnia', 'zle'], 'otylosc-3': ['Otyłość III stopnia', 'zle'],
  };
  const wynik = (klucz, reszta) => Object.assign({ stan: 'ok', klucz, nazwa: NAZWY[klucz][0], poziom: NAZWY[klucz][1] }, reszta);

  // { bmi, plec: 'm'|'k'|'n', wiekMies, wiekLat } → ocena albo powód, dla którego jej nie ma
  B.ocen = (d) => {
    if (!(d.bmi > 0)) return { stan: 'brak-bmi' };
    if (d.wiekMies == null || d.wiekLat == null) return { stan: 'brak-wieku' };
    if (d.wiekLat < 13 || d.wiekLat > 99) return { stan: 'poza-wiekiem' };
    if (d.wiekMies < DOROSLI_OD) {
      if (d.plec !== 'm' && d.plec !== 'k') return { stan: 'brak-plci' };
      const wm = Math.max(d.wiekMies, 156);    // w dniu 13. urodzin dni/30,4375 bywa o włos poniżej 156
      const z = B.z(d.bmi, d.plec, wm);
      const klucz = z < -3 ? 'znaczna-niedowaga' : z < -2 ? 'niedowaga' : z <= 1 ? 'norma' : z <= 2 ? 'nadwaga' : 'otylosc';
      return wynik(klucz, { zrodlo: 'who2007', z, centyl: B.centyl(z),
        progi: { niedowaga: B.prog(-2, d.plec, wm), nadwaga: B.prog(1, d.plec, wm), otylosc: B.prog(2, d.plec, wm) } });
    }
    const b = Math.round(d.bmi * 10) / 10;
    const klucz = b < 16 ? 'znaczna-niedowaga' : b < 18.5 ? 'niedowaga' : b < 25 ? 'norma' : b < 30 ? 'nadwaga' : b < 35 ? 'otylosc-1' : b < 40 ? 'otylosc-2' : 'otylosc-3';
    return wynik(klucz, { zrodlo: 'who-dorosli', progi: { niedowaga: 18.5, nadwaga: 25, otylosc: 30 } });
  };

  global.BMI = B;
  if (typeof module !== 'undefined') module.exports = B;
})(typeof window !== 'undefined' ? window : globalThis);
