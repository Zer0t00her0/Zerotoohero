/* Подача BetRush — жёлтый/чёрный/бирюзовый спортбук, фирменные скривлённые буквы.
   Собрана из реальных слоёв Figma (раскадровка Rush1…Rush8): буквы — не текст, а вручную
   скривлённые векторные формы, поэтому берём их как картинки. Везде, где есть слои —
   каждый элемент анимирован отдельно (параллакс от курсора, дыхание, разлёт по буквам);
   только мокап-сцены без раздельных слоёв (биллборд/сумка/телефон) оживлены Ken Burns. */
(() => {
  const A = 'img/betrush-live/';
  const V = '?v=23';
  const src = f => window.BETRUSH_ASSETS?.[f] || A + f + V;

  const frame = (cls, inner) => `<div class="rf ${cls}">${inner}</div>`;
  const P = (W, H) => ({
    W, H,
    box: (x, y, w, h) => `left:${(x / W) * 100}%;top:${(y / H) * 100}%;width:${(w / W) * 100}%;height:${(h / H) * 100}%;`,
    cq: px => `${(px / W) * 100}cqw`,
  });
  const photo = (file, cls = '') => `<img class="rimg is-photo ${cls}" src="${src(file)}" alt="BetRush" draggable="false">`;

  // Обложка 1920×1080 — настоящие слои из Figma: линии (рисуются), свечение (с параллаксом от курсора), буквы по отдельности
  const cp = P(1920, 1080);
  let lk = 0;
  const letter = (file, x, y, w, h) => `<img class="rimg bc-letter" src="${src(file)}" alt="" draggable="false" style="${cp.box(x, y, w, h)}--i:${lk++}">`;
  const cover = () => `
    <i class="bc-glow" style="${cp.box(390, 235, 1139, 610)}"></i>
    <img class="rimg bc-lines" src="${src('lines.svg')}" alt="" draggable="false" style="${cp.box(-1112.206, -1212.596, 4106.5615, 3835.2421)}">
    <span class="bc-word">
      ${letter('letter-b.svg', 523.744, 291.235, 298.475, 246.917)}
      ${letter('letter-e.svg', 805.966, 291.235, 275.327, 246.917)}
      ${letter('letter-t.svg', 1053.78, 291.235, 258.842, 246.917)}
      ${letter('letter-r.svg', 753.968, 537.842, 162.1, 246.972)}
      ${letter('letter-u.svg', 918.541, 537.842, 164.487, 249.934)}
      ${letter('letter-s.svg', 1075.42, 534.152, 143.62, 254.378)}
      ${letter('letter-h.svg', 1220.12, 537.842, 175.88, 246.972)}
    </span>`;

  // Слоган-слайды: тот же набор живых слоёв (линии + свечение), а текст — отдельные скривлённые буквы,
  // как и на обложке (в Figma это реальные отдельные векторы, не единая картинка вордмарка)
  let tagK = 0;
  const tagLetter = (file, x, y, w, h) => `<img class="rimg bc-tagletter" src="${src(file)}" alt="" draggable="false" style="${cp.box(x, y, w, h)}--i:${tagK++}">`;
  let logoK = 0;
  const logoLetter = (file, x, y, w, h) => `<img class="rimg bc-rlogo" src="${src(file)}" alt="" draggable="false" style="${cp.box(x, y, w, h)}--i:${logoK++}">`;

  const IN_BET_WE_TRUST = [
    ['ib-i.svg', 90.305, 442.755, 122.000, 193.878], ['ib-n.svg', 199.839, 442.755, 251.160, 193.878],
    ['ib-b.svg', 437.147, 442.267, 125.962, 194.366], ['ib-e1.svg', 561.710, 442.267, 120.349, 194.366],
    ['ib-t1.svg', 688.398, 442.267, 106.071, 194.366], ['ib-w.svg', 801.911, 442.755, 305.688, 193.878],
    ['ib-e2.svg', 1062.884, 442.755, 216.184, 193.878], ['ib-t2.svg', 1287.298, 442.267, 106.071, 194.366],
    ['ib-r.svg', 1373.597, 442.267, 127.572, 194.366], ['ib-u.svg', 1503.115, 442.267, 129.450, 196.697],
    ['ib-s.svg', 1626.578, 439.353, 113.028, 200.194], ['ib-t3.svg', 1751.402, 442.267, 106.071, 194.366],
  ];
  const tagline = (letters, gx, gy, gw, gh, logo = null) => {
    tagK = 0; logoK = 0;
    return `
    <i class="bc-glow" style="${cp.box(gx, gy, gw, gh)}"></i>
    <img class="rimg bc-lines" src="${src('lines.svg')}" alt="" draggable="false" style="${cp.box(-1112.206, -1212.596, 4106.5615, 3835.2421)}">
    ${logo ? logo.map(([f, x, y, w, h]) => logoLetter(f, x, y, w, h)).join('') : ''}
    ${letters.map(([f, x, y, w, h]) => tagLetter(f, x, y, w, h)).join('')}`;
  };

  // Тройка сторис-карточек: футбол / фрибет / анонс боя — каждый элемент внутри разложен на свой слой
  // (фото, заголовки, коэффициенты, бейдж) и въезжает по отдельности, как у Roll
  let tk = 0;
  // Остальные 2 карточки собраны строго по слоям реальных фреймов из Figma (Frame 56687/56685/56686):
  // у каждой свой точный размер, фото/графика, 2 слоя линий (где есть), бирюзовая подложка, те же 4 лого
  // по тем же углам, что и на карточках A/B/C — никакой придуманной шапки/аватарки/таймера сторис.
  const mc = P(595.6299438476562, 744.5374755859375);
  const partM = (Pi, file, x, y, w, h, cls = '') => `<span class="tc-part ${cls}" style="${Pi.box(x, y, w, h)}--i:${tk++}">
    <span class="rw"><span class="rwi"><img class="rimg" src="${src(file)}" alt="" draggable="false"></span></span>
  </span>`;
  const badgesM = (Pi, tl, tr, br, bl, files) => `
    <img class="rimg pc-badge" src="${src(files[0])}" alt="" draggable="false" style="${Pi.box(...tl)}">
    <span class="pc-badge-rot pc-rot-ccw" style="${Pi.box(...tr)}"><img class="rimg" src="${src(files[1])}" alt="" draggable="false"></span>
    <img class="rimg pc-badge" src="${src(files[2])}" alt="" draggable="false" style="${Pi.box(...br)}">
    <span class="pc-badge-rot pc-rot-cw" style="${Pi.box(...bl)}"><img class="rimg" src="${src(files[3])}" alt="" draggable="false"></span>`;

  const matchdayCard = () => { tk = 0; return `<div class="tc">
    <img class="rimg tc-lines" src="${src('md-lines1.svg')}" alt="" draggable="false" style="${mc.box(-272.007, -223.689, 1265.471, 1180.915)}">
    <img class="rimg tc-photo is-zoom" src="${src('md-photo.png')}" alt="Arsenal vs Chelsea matchday" draggable="false" style="${mc.box(9.376, -33.09, 560.517, 840.776)}">
    <img class="rimg tc-overlay" src="${src('md-overlay.svg')}" alt="" draggable="false" style="${mc.box(0, 366.753, 595.63, 377.784)}">
    ${badgesM(mc, [22.061, 22.061, 38.465, 21.929], [551.509, 22.061, 21.929, 38.466], [534.964, 700.417, 38.467, 21.93], [22.061, 683.872, 21.929, 38.467], ['md-badge-tl.svg', 'md-badge-tr.svg', 'md-badge-br.svg', 'md-badge-bl.svg'])}
    ${partM(mc, 'md-1412.svg', 20.877, 94.146, 128.752, 35.46, 'tc-date')}
    ${partM(mc, 'md-1630.svg', 491.018, 95.494, 83.108, 34.579, 'tc-date')}
    ${partM(mc, 'md-arsenal.svg', 75.913, 590.863, 96.608, 24.985, 'tc-team')}
    ${partM(mc, 'md-chelsea.svg', 327.016, 590.669, 191.093, 25.434, 'tc-team')}
    ${partM(mc, 'md-133.svg', 121.232, 555.541, 77.027, 24.06, 'tc-odds')}
    ${partM(mc, 'md-135.svg', 396.983, 555.707, 43.245, 24.222, 'tc-odds')}
    ${partM(mc, 'md-matchday.svg', 111.807, 614.333, 379.91, 50.357, 'tc-head')}
    ${partM(mc, 'md-premiere.svg', 161.804, 673.946, 109.53, 24.258, 'tc-sub')}
    ${partM(mc, 'md-league.svg', 269.549, 673.947, 165.84, 25.436, 'tc-sub')}
    <img class="rimg tc-lines tc-lines2" src="${src('md-lines2.svg')}" alt="" draggable="false" style="${mc.box(-271.547, -223.689, 1265.011, 1180.915)}">
  </div>`; };

  const pjc = P(596.4219360351562, 745.5274658203125);
  const pauljushuaCard = () => { tk = 0; return `<div class="tc">
    <img class="rimg tc-lines" src="${src('pj-lines.svg')}" alt="" draggable="false" style="${pjc.box(-272.37, -223.99, 1267.154, 1182.485)}">
    <img class="rimg tc-photo is-zoom" src="${src('pj-photo.png')}" alt="Paul vs Jushua" draggable="false" style="${pjc.box(60.75, 81.733, 474.929, 582.616)}">
    <img class="rimg tc-overlay" src="${src('pj-overlay.svg')}" alt="" draggable="false" style="${pjc.box(0, 367.241, 596.422, 378.286)}">
    ${badgesM(pjc, [22.089, 22.091, 38.518, 21.959], [552.242, 22.091, 21.958, 38.517], [535.675, 701.347, 38.517, 21.96], [22.09, 684.781, 21.958, 38.517], ['pj-badge-tl.svg', 'pj-badge-tr.svg', 'pj-badge-br.svg', 'pj-badge-bl.svg'])}
    ${partM(pjc, 'pj-60.svg', 115.916, 580.745, 34.961, 24.29, 'tc-odds')}
    ${partM(pjc, 'pj-105.svg', 397.519, 581.13, 79.332, 24.092, 'tc-odds')}
    ${partM(pjc, 'pj-title.svg', 110.752, 615.6, 375.116, 49.975, 'tc-head')}
    ${partM(pjc, 'pj-main.svg', 200.735, 675.402, 58.948, 24.29, 'tc-sub')}
    ${partM(pjc, 'pj-event.svg', 259.683, 675.46, 139.107, 24.229, 'tc-sub')}
  </div>`; };

  const fbc = P(595.3681640625, 744.2103271484375);
  const freebetCard = () => { tk = 0; return `<div class="tc">
    <div class="fb-glowwrap" style="${fbc.box(-45.085, -72.21, 630.46, 616.88)}"><img class="rimg" src="${src('fb-glow.svg')}" alt="" draggable="false"></div>
    <img class="rimg tc-lines" src="${src('fb-lines.svg')}" alt="" draggable="false" style="${fbc.box(-271.89, -223.59, 1264.915, 1180.396)}">
    ${badgesM(fbc, [22.05, 22.05, 38.448, 21.919], [551.133, 22.05, 21.92, 38.448], [534.59, 700.038, 38.449, 21.92], [22.05, 683.871, 21.92, 38.448], ['fb-badge-tl.svg', 'fb-badge-tr.svg', 'fb-badge-br.svg', 'fb-badge-bl.svg'])}
    <div class="fb-swirl" style="${fbc.box(78.83, 155.456, 437.848, 433.598)}"><img class="rimg" src="${src('fb-swirl.svg')}" alt="" draggable="false"></div>
    <img class="rimg fb-ball" src="${src('fb-photo.png')}" alt="" draggable="false" style="${fbc.box(128.445, 205.07, 337.375, 337.375)}">
    ${partM(fbc, 'fb-sportwbetting.svg', 226.172, 21.501, 143.188, 48.875, 'tc-head')}
    ${partM(fbc, 'fb-inbetwetrust.svg', 213.792, 674.208, 171.148, 48.571, 'tc-head')}
  </div>`; };

  // Rush5 — вторая тройка сторис. Карточки B и C в Figma — цельные готовые векторные композиции
  // (не отдельные слои), поэтому не разбираются на буквы, а анимируются целиком. У карточки A
  // слои настоящие (8 строк тикера + лого одной картинкой + 2 бейджа) — они и разложены по отдельности.
  const rc = P(595.7505493164062, 744.6882934570312);

  // Карточка A: чёрный фон + бирюзовое свечение (box-shadow, как в Figma), 8 строк тикера зациклены по вертикали, лого BETRUSH одной картинкой
  // BET (верхняя строка лого) — флип по вертикали; RUSH (нижняя) — флип по горизонтали. Те же буквы, что на обложке,
  // сгруппированы в свои локальные коробки, чтобы вращать их как единое слово.
  const betLocal = P(389.26, 121.84);
  const rushLocal = P(316.8, 125.52);
  const tickerCard = () => `<div class="rc rc-dark">
    <div class="rc-tickwrap">
      <div class="rc-tickrow rc-tick-l" style="${rc.box(-112.28, -2.24, 1124.95, 97.84)}"><img class="rimg" src="${src('r5-row1.svg')}" alt="" draggable="false"></div>
      <div class="rc-tickrow rc-tick-r" style="${rc.box(-221.10, 90.85, 1341.26, 97.84)}"><img class="rimg" src="${src('r5-row5.svg')}" alt="" draggable="false"></div>
      <div class="rc-tickrow rc-tick-l" style="${rc.box(-112.28, 183.94, 1124.95, 97.84)}"><img class="rimg" src="${src('r5-row2.svg')}" alt="" draggable="false"></div>
      <div class="rc-tickrow rc-tick-r" style="${rc.box(-221.10, 276.92, 1341.26, 97.84)}"><img class="rimg" src="${src('r5-row6.svg')}" alt="" draggable="false"></div>
      <div class="rc-tickrow rc-tick-l" style="${rc.box(-112.28, 370.22, 1124.95, 97.84)}"><img class="rimg" src="${src('r5-row3.svg')}" alt="" draggable="false"></div>
      <div class="rc-tickrow rc-tick-r" style="${rc.box(-221.10, 463.30, 1341.26, 97.84)}"><img class="rimg" src="${src('r5-row7.svg')}" alt="" draggable="false"></div>
      <div class="rc-tickrow rc-tick-l" style="${rc.box(-112.28, 556.39, 1124.95, 97.84)}"><img class="rimg" src="${src('r5-row4.svg')}" alt="" draggable="false"></div>
      <div class="rc-tickrow rc-tick-r" style="${rc.box(-221.10, 649.37, 1341.26, 97.84)}"><img class="rimg" src="${src('r5-row8.svg')}" alt="" draggable="false"></div>
    </div>
    <img class="rimg rc-lines" src="${src('r5-lines.svg')}" alt="" draggable="false" style="${rc.box(-272.06, -223.74, 1265.73, 1181.15)}">
    <div class="rc-glowwrap"><div class="rc-glowinset"><img class="rimg rc-glowimg" src="${src('r5-glow.svg')}" alt="" draggable="false"></div></div>
    <div class="rc-flip rc-flip-v" style="${rc.box(82.05, 250.14, 389.26, 121.84)}">
      <img class="rimg" src="${src('letter-b.svg')}" alt="" draggable="false" style="${betLocal.box(0, 0, 147.28, 121.84)}">
      <img class="rimg" src="${src('letter-e.svg')}" alt="" draggable="false" style="${betLocal.box(139.26, 0, 135.86, 121.84)}">
      <img class="rimg" src="${src('letter-t.svg')}" alt="" draggable="false" style="${betLocal.box(261.54, 0, 127.72, 121.84)}">
    </div>
    <div class="rc-flip rc-flip-h" style="${rc.box(195.66, 370.00, 316.8, 125.52)}">
      <img class="rimg" src="${src('letter-r.svg')}" alt="" draggable="false" style="${rushLocal.box(0, 1.82, 79.99, 121.87)}">
      <img class="rimg" src="${src('letter-u.svg')}" alt="" draggable="false" style="${rushLocal.box(81.2, 1.82, 81.16, 123.33)}">
      <img class="rimg" src="${src('letter-s.svg')}" alt="" draggable="false" style="${rushLocal.box(158.61, 0, 70.87, 125.52)}">
      <img class="rimg" src="${src('letter-h.svg')}" alt="" draggable="false" style="${rushLocal.box(230.01, 1.82, 86.79, 121.87)}">
    </div>
  </div>`;

  // Карточка C: «IN BET WE TRUST» — слои разложены как у A/B: гигантский BET-фон крутится флипом по горизонтальной
  // оси, линии дорисовываются, приплюснутое свечение под текстом, буквы текста увеличиваются вразнобой, те же 4
  // лого по тем же углам, что на карточке B.
  const trustLocal = P(549.19, 155.92);
  // [файл, x, y, w, h, задержка, длительность, пиковый масштаб] — задержки/длительности вразнобой, не кратны друг другу
  const trustLetters = [
    ['wt-i.svg', 149.14, 296.37, 48.84, 77.61, .2, 2.6, 1.22],
    ['wt-n.svg', 196.30, 296.37, 100.54, 77.61, 1.4, 3.1, 1.16],
    ['wt-b.svg', 306.98, 296.17, 50.42, 77.81, .7, 2.9, 1.2],
    ['wt-e1.svg', 353.35, 296.17, 48.18, 77.81, 2.1, 2.4, 1.18],
    ['wt-t1.svg', 400.56, 296.17, 42.46, 77.81, 0, 3.3, 1.14],
    ['wt-w.svg', 30.00, 372.29, 66.96, 77.81, 1.8, 2.7, 1.2],
    ['wt-e2.svg', 86.15, 372.29, 48.18, 77.81, .5, 3.0, 1.16],
    ['wt-t2.svg', 148.05, 372.49, 81.36, 77.61, 2.5, 2.5, 1.22],
    ['wt-r.svg', 221.78, 372.49, 92.27, 77.61, 1.1, 3.2, 1.14],
    ['wt-u.svg', 317.21, 372.49, 93.11, 79.60, 0.3, 2.8, 1.18],
    ['wt-s.svg', 407.93, 370.50, 84.78, 81.58, 1.6, 3.4, 1.2],
    ['wt-t3.svg', 497.84, 372.49, 81.36, 77.61, 2.3, 2.6, 1.16],
  ];
  const trustCard = () => `<div class="rc rc-dark">
    <img class="rimg r5c-bet r5c-bet-b" src="${src('r5c-bet-b.svg')}" alt="" draggable="false" style="${rc.box(0.0008, -0.00493, 227.268, 746.895)}">
    <img class="rimg r5c-bet r5c-bet-e" src="${src('r5c-bet-e.svg')}" alt="" draggable="false" style="${rc.box(191.965, -0.00396, 216.787, 746.895)}">
    <img class="rimg r5c-bet r5c-bet-t" src="${src('r5c-bet-t.svg')}" alt="" draggable="false" style="${rc.box(404.339, -0.00396, 191.412, 746.895)}">
    <img class="rimg rc-lines" src="${src('r5c-lines.svg')}" alt="" draggable="false" style="${rc.box(-272.06, -223.74, 1265.73, 1181.15)}">
    <div class="rc-glowwrap r5c-glow"><div class="rc-glowinset r5c-glowinset"><img class="rimg rc-glowimg" src="${src('r5c-glow.svg')}" alt="" draggable="false"></div></div>
    <div class="r5c-textwrap" style="${rc.box(30.00, 296.17, 549.19, 155.92)}">${trustLetters.map(([f, x, y, w, h, d, dur, sc]) =>
      `<img class="rimg wt-letter" src="${src(f)}" alt="" draggable="false" style="${trustLocal.box(x - 30, y - 296.17, w, h)}animation-delay:${d}s;animation-duration:${dur}s;--sc:${sc}">`).join('')}
    </div>
    <img class="rimg pc-badge" src="${src('r5c-badge.svg')}" alt="" draggable="false" style="${rc.box(22.06, 22.06, 38.47, 21.93)}">
    <span class="pc-badge-rot pc-rot-ccw" style="${rc.box(551.62, 22.06, 21.93, 38.47)}"><img class="rimg" src="${src('r5c-badge.svg')}" alt="" draggable="false"></span>
    <img class="rimg pc-badge" src="${src('r5c-badge.svg')}" alt="" draggable="false" style="${rc.box(535.07, 700.56, 38.47, 21.93)}">
    <span class="pc-badge-rot pc-rot-cw" style="${rc.box(22.06, 684.01, 21.93, 38.47)}"><img class="rimg" src="${src('r5c-badge.svg')}" alt="" draggable="false"></span>
  </div>`;

  // Карточка B: «WILL YOU BET ON SPORTS TODAY?» — слова (не буквы по одной) прилетают каждое отдельно с резким
  // "прыжком" (растёт-сжимается рывками), линии дорисовываются, чекбоксы закрашиваются бирюзовым по очереди
  let wgK = 0;
  const wordGroup = letters => {
    const minX = Math.min(...letters.map(l => l[1]));
    const minY = Math.min(...letters.map(l => l[2]));
    const maxX = Math.max(...letters.map(l => l[1] + l[3]));
    const maxY = Math.max(...letters.map(l => l[2] + l[4]));
    const local = P(maxX - minX, maxY - minY);
    const inner = letters.map(([f, x, y, w, h]) => `<img class="rimg" src="${src(f)}" alt="" draggable="false" style="${local.box(x - minX, y - minY, w, h)}">`).join('');
    return `<div class="pc-word" style="${rc.box(minX, minY, maxX - minX, maxY - minY)}--i:${wgK++}">${inner}</div>`;
  };
  const pollCard = () => { wgK = 0; return `<div class="rc">
    <img class="rimg rc-lines" src="${src('r5-lines.svg')}" alt="" draggable="false" style="${rc.box(-272.06, -223.74, 1265.73, 1181.15)}">
    <div class="rc-glowwrap pc-glow"><div class="rc-glowinset"><img class="rimg rc-glowimg" src="${src('r5-glow.svg')}" alt="" draggable="false"></div></div>
    ${wordGroup([['wb-w.svg', 34.35, 101.86, 87.57, 100.03], ['wb-i.svg', 106.86, 101.86, 44.46, 100.03], ['wb-l1.svg', 139.86, 101.86, 49.27, 100.03], ['wb-l2.svg', 190.47, 101.86, 49.27, 100.03]])}
    ${wordGroup([['wb-y.svg', 272.58, 101.86, 60.68, 100.03], ['wb-o1.svg', 319.62, 100.35, 65.71, 103.04], ['wb-u.svg', 382.90, 101.86, 70.71, 101.24]])}
    ${wordGroup([['wb-b.svg', 29.85, 200.05, 69.13, 100.03], ['wb-e.svg', 92.34, 200.05, 65.04, 100.03], ['wb-t1.svg', 154.02, 200.05, 56.93, 100.03]])}
    ${wordGroup([['wb-o2.svg', 218.56, 198.54, 65.71, 103.04], ['wb-n.svg', 277.00, 200.05, 75.40, 100.03]])}
    ${wordGroup([['wb-s1.svg', 33.71, 296.73, 60.65, 103.04], ['wb-p.svg', 88.66, 298.23, 70.30, 100.03], ['wb-o3.svg', 155.19, 296.73, 65.71, 103.04], ['wb-r.svg', 213.64, 298.23, 70.78, 100.03], ['wb-t2.svg', 283.98, 298.23, 56.93, 100.03], ['wb-s2.svg', 330.89, 296.73, 60.65, 103.04]])}
    ${wordGroup([['wb-t3.svg', 39.31, 396.42, 56.93, 100.03], ['wb-o4.svg', 84.93, 394.92, 65.71, 103.04], ['wb-d.svg', 143.53, 396.42, 70.00, 100.03], ['wb-a.svg', 203.45, 396.42, 68.79, 100.03], ['wb-y2.svg', 272.58, 396.42, 60.68, 100.03], ['wb-q.svg', 333.65, 394.92, 54.50, 101.54]])}
    <i class="rc-check" style="${rc.box(72.26, 593.54, 70.06, 70.06)}--i:0"></i>
    <i class="rc-check" style="${rc.box(354.14, 593.54, 70.06, 70.06)}--i:1"></i>
    <img class="rimg rc-yes" src="${src('yes-label.svg')}" alt="Yes" draggable="false" style="${rc.box(165.59, 614.79, 77.34, 49.53)}">
    <img class="rimg rc-yes" src="${src('yes-label.svg')}" alt="Yes" draggable="false" style="${rc.box(446.37, 614.24, 77.34, 49.53)}">
    <img class="rimg pc-badge" src="${src('r5-badge.svg')}" alt="" draggable="false" style="${rc.box(22.06, 22.06, 38.47, 21.93)}">
    <span class="pc-badge-rot pc-rot-ccw" style="${rc.box(551.62, 22.06, 21.93, 38.47)}"><img class="rimg" src="${src('r5-badge.svg')}" alt="" draggable="false"></span>
    <img class="rimg pc-badge" src="${src('r5-badge.svg')}" alt="" draggable="false" style="${rc.box(535.07, 700.56, 38.47, 21.93)}">
    <span class="pc-badge-rot pc-rot-cw" style="${rc.box(22.06, 684.01, 21.93, 38.47)}"><img class="rimg" src="${src('r5-badge.svg')}" alt="" draggable="false"></span>
  </div>`; };

  // Обе тройки карточек (Rush5 + Arsenal/FreeBet/PaulJushua) объединены в одно полотно-ленту, как блок Roll 5:
  // верхний ряд едет в одну сторону, нижний навстречу. Тройка карточек у́же экрана, поэтому дублируем её 4 раза
  // подряд (не 2) — иначе в момент склейки цикла короткий набор не успевает закрыть собой всю ширину и виден
  // пустой просвет жёлтого фона; при 4 повторах лента всегда шире видимой области, шов бесшовный.
  const BM_REPEAT = 4;
  const bmRow = (cards, cls = '') => `<div class="rs-row bm-row${cls ? ' ' + cls : ''}"><div class="rs-track">${Array(BM_REPEAT).fill(cards).flat()
    .map((c, i) => `<div class="bm-cell" style="--i:${i}">${c}</div>`).join('')}</div></div>`;
  const marquee2 = () => `<div class="bm-wrap">
    ${bmRow([tickerCard(), pauljushuaCard(), pollCard()])}
    ${bmRow([freebetCard(), matchdayCard(), trustCard()], 'is-slow')}
  </div>`;

  // Баннер RUUUSH! (Rush8) — собран строго по слоям и координатам реального фрейма из Figma (node 2:986, 1920×678.21):
  // повёрнутые линии (2.84°), эхо-вордмарк RUUUSH!, фото, крупное лого в углу, дисклеймер+18, блок «IN BET WE TRUST»
  // со своим свечением — всё на подлинных местах, без выдуманной бегущей ленты.
  const bp = P(1920, 678.2089233398438);

  // RUUUUSH! — 7 отдельных букв (R, 4×U, S, H), каждая стоит на своём подлинном Figma-месте и размере
  // (никуда не едет и не сдвигается) и по очереди, волной одна за другой, на миг раздувается во весь экран
  // и тут же садится обратно на своё место — рывком, быстро, бесконечно по кругу.
  const ruuushLetters = [
    ['rr-r.svg', -22.747, 278.866, 263.417, 401.336],
    ['rr-u1.svg', 205.963, 228.316, 300.961, 457.305],
    ['rr-u2.svg', 455.791, 178.107, 334.401, 508.117],
    ['rr-u3.svg', 733.263, 127.897, 367.842, 558.928],
    ['rr-u4.svg', 1025.263, 68.655, 350.375, 620.580],
    ['rr-s.svg', 1310.538, 27.479, 464.832, 652.723],
    ['rr-h.svg', 1704.069, -32.216, 286.653, 712.417],
  ];
  const ruuushLocal = P(2013.469, 721.45);
  const bnRuuush = () => `<div class="bn-ruuushwrap" style="${bp.box(-22.75, -32.22, 2013.469, 721.45)}">${ruuushLetters
    .map(([f, x, y, w, h], i) => `<img class="rimg bn-rletter" src="${src(f)}" alt="" draggable="false" style="${ruuushLocal.box(x + 22.747, y + 32.216, w, h)}animation-delay:${i}s">`).join('')}</div>`;

  // «IN BET WE TRUST» — 4 слова прилетают каждое со своей стороны и так же улетают обратно, по кругу:
  // IN — слева, BET — справа, WE — снизу, TRUST — справа
  const bnWord = (letters, dir, delay) => {
    const minX = Math.min(...letters.map(l => l[1]));
    const minY = Math.min(...letters.map(l => l[2]));
    const maxX = Math.max(...letters.map(l => l[1] + l[3]));
    const maxY = Math.max(...letters.map(l => l[2] + l[4]));
    const local = P(maxX - minX, maxY - minY);
    const inner = letters.map(([f, x, y, w, h]) => `<img class="rimg" src="${src(f)}" alt="" draggable="false" style="${local.box(x - minX, y - minY, w, h)}">`).join('');
    return `<div class="bn-word bn-word-${dir}" style="${bp.box(minX, minY, maxX - minX, maxY - minY)}animation-delay:${delay}s">${inner}</div>`;
  };
  const bnTrust = () => `<div class="bn-trustgroup">
    ${bnWord([['ibt-i.svg', 343.393, 225.425, 73.628, 117.007], ['ibt-n.svg', 414.483, 225.130, 151.578, 117.007]], 'left', 0)}
    ${bnWord([['ibt-b.svg', 581.347, 225.130, 76.019, 117.302], ['ibt-e1.svg', 651.246, 225.130, 72.632, 117.302], ['ibt-t1.svg', 722.427, 225.130, 64.015, 117.302]], 'right', .3)}
    ${bnWord([['ibt-w.svg', 163.774, 339.800, 100.946, 117.302], ['ibt-e2.svg', 248.426, 339.800, 72.632, 117.302]], 'bottom', .6)}
    ${bnWord([['ibt-t2.svg', 341.747, 340.095, 122.658, 117.007], ['ibt-r.svg', 452.903, 340.095, 139.112, 117.007], ['ibt-u.svg', 596.766, 340.095, 140.381, 119.999], ['ibt-s.svg', 733.542, 337.103, 127.810, 122.991], ['ibt-t3.svg', 869.085, 340.095, 122.658, 117.007]], 'right', .9)}
  </div>`;

  const banner = () => `
    <img class="rimg bn-lines" src="${src('bn-lines2.svg')}" alt="" draggable="false" style="${bp.box(-186.63, -518.61, 2128.64, 1830.52)}">
    ${bnRuuush()}
    <img class="rimg bn-photo" src="${src('bn-photo2.png')}" alt="Football action" draggable="false" style="${bp.box(618.87, -210.15, 1381.83, 1381.155)}">
    <img class="rimg bn-badge" src="${src('bn-badge.svg')}" alt="" draggable="false" style="${bp.box(23.88, 23.88, 164.776, 93.938)}">
    <div class="bn-glowwrap" style="${bp.box(-14.925, 531.343, 916.418, 146.866)}"><div class="bn-glowinset"><img class="rimg" src="${src('bn-glow2.svg')}" alt="" draggable="false"></div></div>
    <img class="rimg bn-disclaimer" src="${src('bn-disclaimer.svg')}" alt="Casino games are designed for entertainment, but remember: most players lose money over time. Gamble responsibly — set limits and quit while ahead. 18+" draggable="false" style="${bp.box(47.76, 575.522, 803.162, 54.925)}">
    ${bnTrust()}`;

  const SLIDES = [
    // 0 — обложка: вордмарк с бирюзовым свечением на жёлтом — три живых слоя, не фото
    () => frame('b0', cover()),

    // 1 — слоган «In bet we TRUST»: буквы по отдельности, во всю ширину
    () => frame('b1', tagline(IN_BET_WE_TRUST, -46, 313, 1999, 471)),

    // 2 — баннер RUUUSH!: бегущая лента вордмарка + фото игрока
    () => frame('b3 is-banner', banner()),

    // 3 — соцсети на телефоне
    () => frame('b4 is-photo-only', photo('app.jpg', 'is-breathe')),

    // 4 — биллборд, кинематографичная панорама
    () => frame('b5 is-photo-only', photo('billboard.jpg', 'is-pan')),

    // 5 — мерч: спортивная сумка
    () => frame('b6 is-photo-only', photo('merch.jpg', 'is-breathe is-sway')),

    // 6 — все 6 карточек сторис одним полотном-лентой (как блок Roll 5): верхний ряд (BET OR NO / Will you bet / In bet we trust)
    // едет в одну сторону, нижний (Arsenal / FreeBet / Paul Jushua) — навстречу, в другую
    () => frame('b7 b2 bmix', marquee2()),
  ];

  function mount(root) {
    root.classList.add('betrush');
    root.innerHTML = SLIDES.map(s => s()).join('');
    const $$ = (sel, el = root) => [...el.querySelectorAll(sel)];
    const slides = $$('.rf');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const io = new IntersectionObserver(entries => entries.forEach(e => {
      e.target.classList.toggle('is-live', e.isIntersecting);
      if (e.isIntersecting) e.target.classList.add('is-in');
    }), { threshold: 0.3 });
    slides.forEach(s => io.observe(s));

    // Параллакс от курсора на обложке и слоганах — свечение и линии чуть ведут за мышью
    slides.forEach(s => {
      s.addEventListener('pointermove', e => {
        const r = s.getBoundingClientRect();
        s.style.setProperty('--mx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
        s.style.setProperty('--my', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
      });
      s.addEventListener('pointerleave', () => { s.style.setProperty('--mx', 0); s.style.setProperty('--my', 0); });
    });
    if (reduce) root.classList.add('no-anim');
  }

  // Живая обложка в сетке на главной (bento) и на превью-ссылках: логотип BETRUSH из макета + свечение + линии
  const bentoCover = () => `<span class="bco">
    <i class="bco-glow"></i>
    <img class="bco-lines" src="${src('lines.svg')}" alt="" draggable="false">
    <img class="bco-mark" src="${src('bn-badge.svg')}" alt="" draggable="false">
  </span>`;

  window.PROTOS = window.PROTOS || {};
  window.PROTOS.betrush = { mount, replacesGallery: true, replacesCover: true, bentoCover };
})();
