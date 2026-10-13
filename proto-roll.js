/* Подача проекта Roll: слайды Roll 0–11 из макета, собранные заново из слоёв.
   Каждый слой стоит на своих координатах из Figma (в долях кадра), поэтому пропорции
   совпадают с оригиналом при любой ширине. Шрифт заказчика (Peridot Wide) платный —
   весь текст набран DM Sans и подогнан по ширине строк оригинала. Слои оживают,
   когда слайд попадает в кадр: монета катится, эмодзи плавают, таймеры сторис бегут. */
(() => {
  const A = 'img/roll/pres/';
  const V = '?v=5';
  // В однофайловой сборке картинки лежат внутри страницы (window.ROLL_ASSETS), иначе — рядом файлами
  const src = f => window.ROLL_ASSETS?.[f] || A + f + V;
  const BLUE = '#0233ff', RED = '#f54245';

  // Эмодзи по хэшу картинки в макете; у двух в макете своя кадрировка внутри рамки
  const EMO = {
    '4d74a': ['emo-wow.png'],
    '8277f': ['emo-tongue.png', { w: 100, h: 111.94, l: 0, t: 0 }],
    '96112': ['emo-starstruck.png'],
    'ba666': ['emo-laugh.png'],
    '4a55f': ['emo-party.png', { w: 139.89, h: 149.71, l: -21.99, t: -25.58 }],
  };

  // ——— Координаты: всё в пикселях макета, на выходе — проценты кадра W×H ———
  const frame = (W, H, cls, inner, extra = '') =>
    `<div class="rf ${cls}" style="aspect-ratio:${W}/${H}" ${extra}>${inner}</div>`;
  const P = (W, H) => ({
    W, H,
    box: (x, y, w, h) => `left:${(x / W) * 100}%;top:${(y / H) * 100}%;width:${(w / W) * 100}%;height:${(h / H) * 100}%;`,
    cq: px => `${(px / W) * 100}cqw`,
  });

  const LOGO_PARTS = `
    <g class="rl rl1"><path d="M0 113.454V27.2221H46.4421C54.4083 27.2221 61.1837 27.9202 66.7683 29.3163C72.4349 30.6303 77.0751 32.5603 80.6886 35.1062C84.3021 37.6521 86.9301 40.7318 88.5727 44.3453C90.2973 47.9589 91.1596 52.0651 91.1596 56.6642C91.1596 61.5096 90.092 65.9855 87.9567 70.0918C85.9036 74.1159 82.7007 77.401 78.348 79.9469C74.0775 82.4928 68.534 84.0531 61.7175 84.628L56.9132 86.4758C54.6958 86.8044 52.3141 87.0507 49.7682 87.215C47.2223 87.3792 44.7586 87.4614 42.3769 87.4614H21.9276V71.4468H40.4059C46.4832 71.4468 51.1644 70.913 54.4494 69.8454C57.8166 68.7777 60.1161 67.2584 61.348 65.2874C62.662 63.3164 63.319 60.8937 63.319 58.0193C63.319 55.1449 62.6209 52.7632 61.2248 50.8743C59.9108 48.9854 57.7344 47.5893 54.6958 46.6859C51.6571 45.7825 47.5919 45.3308 42.5001 45.3308H18.4783L26.8551 35.5989V113.454H0ZM60.5997 113.454L46.8494 80.8092L71.0228 76.2512L88.8526 113.454H60.5997Z"/></g>
    <g class="rcw"><g class="rc"><ellipse cx="146.057" cy="71.7387" rx="39.5083" ry="60.5794" transform="rotate(40.4058 146.057 71.7387)"/></g></g>
    <g class="rl rl2"><path d="M208.114 113.454V27.2221H235.216V94.6063L232.013 92.2657H288.926V113.454H208.114Z"/></g>
    <g class="rl rl3"><path d="M301.107 113.454V27.2221H328.208V94.6063L325.006 92.2657H381.919V113.454H301.107Z"/></g>`;
  // Группа логотипа в макете: 381.919 × 143.477 (монета выступает над буквами)
  const logo = (p, x, y, w, h, cls = '') =>
    `<svg class="r-logo ${cls}" style="${p.box(x, y, w, h)}" viewBox="0 0 381.919 143.477" preserveAspectRatio="none" aria-label="Roll">${LOGO_PARTS}</svg>`;

  /* Текст. Оригинал обрезан по высоте прописных (text-box-trim), поэтому y — это верх
     прописных (at:'top'), базовая линия последней строки (at:'bottom') или центр блока.
     fit — ширина самой длинной строки в оригинале: DM Sans уже Peridot Wide, строку
     подгоняем кеглем (не больше +15%, в сторис +6%, чтобы не расти в высоту) и, если не хватило, лёгкой разрядкой. */
  const text = (p, o) => {
    const anchor = o.at === 'bottom' ? 'translateY(-100%)' : o.at === 'center' ? 'translateY(-50%)' : '';
    const hx = o.cx != null ? 'translateX(-50%)' : '';
    const left = o.cx != null ? o.cx : o.x;
    const style = `left:${(left / p.W) * 100}%;top:${(o.y / p.H) * 100}%;font-size:${p.cq(o.size)};--fs:${(o.size / p.W) * 100};font-weight:${o.wt};line-height:${o.lh ?? 1};text-align:${o.cx != null ? 'center' : 'left'};transform:${hx} ${anchor};${o.w ? `width:${(o.w / p.W) * 100}%;white-space:normal;` : ''}${o.style || ''}`;
    const lines = o.lines.map(l => `<span class="ln">${l}</span>`).join('');
    return `<p class="rt ${o.cls || ''}" style="${style}"${o.fit ? ` data-fit="${o.fit / p.W}"` : ''}${o.max ? ` data-max="${o.max}"` : ''}${o.track === 0 ? ' data-notrack' : ''}>${lines}</p>`;
  };

  // Эмодзи: внешняя рамка (как в макете), внутри повёрнутый квадрат с картинкой
  const emoji = (p, hash, x, y, w, h, rot, iw, ih, o = {}) => {
    const [file, crop] = EMO[hash];
    const img = crop
      ? `<span class="crop"><img src="${src(file)}" alt="" draggable="false" style="left:${crop.l}%;top:${crop.t}%;width:${crop.w}%;height:${crop.h}%"></span>`
      : `<img src="${src(file)}" alt="" draggable="false">`;
    return `<span class="re ${o.cls || ''}" style="${p.box(x, y, w, h)}--d:${o.d ?? 20};--k:${o.k ?? 0}"><span class="re-r" style="width:${(iw / w) * 100}%;height:${(ih / h) * 100}%;transform:rotate(${rot}deg)${o.flip ? ' scaleY(-1)' : ''}">${img}</span></span>`;
  };

  // Маска как в Figma: прямоугольник с гауссовым размытием (sigma) — края картинки тают
  const erf = x => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  const phi = z => 0.5 * (1 + erf(z / Math.SQRT2));
  const ramp = (dir, len, s) => {
    const total = len + 6 * s, stops = [];
    for (let i = 0; i <= 24; i++) {
      const x = (total * i) / 24;
      const a = phi((x - 3 * s) / s) * phi((3 * s + len - x) / s);
      stops.push(`rgba(0,0,0,${a.toFixed(3)}) ${((x / total) * 100).toFixed(2)}%`);
    }
    return `linear-gradient(${dir}, ${stops.join(',')})`;
  };
  const masked = (p, m, img) => {
    const s = m.s, x = m.x - 3 * s, y = m.y - 3 * s, w = m.w + 6 * s, h = m.h + 6 * s;
    const mask = `${ramp('to right', m.w, s)}, ${ramp('to bottom', m.h, s)}`;
    // Картинка внутри — в координатах слайда, пересчитанных от угла маски
    const b = img.box, bx = ((b.x - x) / w) * 100, by = ((b.y - y) / h) * 100;
    const crop = img.crop || { w: 100, h: 100, l: 0, t: 0 };
    return `<div class="rm ${m.cls || ''}" style="${p.box(x, y, w, h)}-webkit-mask-image:${mask};mask-image:${mask};-webkit-mask-composite:source-in;mask-composite:intersect;--d:${m.d ?? 16}">
      <div class="rm-b" style="left:${bx}%;top:${by}%;width:${(b.w / w) * 100}%;height:${(b.h / h) * 100}%">
        <div class="rm-r" style="width:${(img.iw / b.w) * 100}%;height:${(img.ih / b.h) * 100}%;transform:rotate(${img.rot}deg)${img.mirror ? ' scaleX(-1)' : ''}">
          <img src="${src(img.file)}" alt="${img.alt || ''}" draggable="false" style="left:${crop.l}%;top:${crop.t}%;width:${crop.w}%;height:${crop.h}%">
        </div>
      </div>
    </div>`;
  };
  // Размытый цветной прямоугольник (подсветка), blur — как в макете
  const glow = (p, x, y, w, h, color, blur = 42) => `<i class="rg" style="${p.box(x, y, w, h)}background:${color};filter:blur(${p.cq(blur)})"></i>`;
  const fade = (p, x, y, w, h, from = 22.315) => `<i class="rfill" style="${p.box(x, y, w, h)}background:linear-gradient(rgba(2,51,255,0) ${from}%, ${BLUE})"></i>`;

  // ——— Постеры 1079 × 1378.72 ———
  const pp = P(1079, 1378.72);
  const hornMask = (p, mx, my, bx, by) => masked(p, { x: mx, y: my, w: 1180.307, h: 1207, s: 187, cls: 'is-hand is-horn' },
    { file: 'hand-horn.png', alt: 'Tattooed hand making the horns sign', box: { x: bx, y: by, w: 1388.613, h: 1526.893 }, iw: 1223.921, ih: 1383.611, rot: -7.24, crop: { w: 100, h: 132.69, l: 0, t: -10.57 } });
  const okMask = (p, mx, my, bx, by) => masked(p, { x: mx, y: my, w: 1017, h: 1040, s: 192, cls: 'is-hand is-ok' },
    { file: 'hand-ok.png', alt: 'Tattooed hand making the OK sign', box: { x: bx, y: by, w: 1403.628, h: 1756.826 }, iw: 1024, ih: 1536, rot: -15.8 });
  const awaits = p => text(p, { x: 38, y: 1253, size: 46.02, wt: 400, lh: 1.08, w: 564, lines: ['Have you seen what awaits you?'] });
  const welcome = (p, cx, y) => text(p, { cx, y, at: 'bottom', size: 108.538, wt: 1000, lh: 0.94, fit: 763, lines: ['Welcome', 'Bonus <b>100%</b>'], cls: 'is-welcome' });
  const giveRows = (p, cls) => [214.24, 650.89, 1085.36].map((y, k) =>
    text(p, { cx: 539.5, y, at: 'center', size: 290.822, wt: 1000, lh: 0.75, fit: 1100, lines: ['Give', 'away'], cls: `is-give ${cls} k${k}`, style: 'text-transform:uppercase' })).join('');

  const POSTERS = [
    // 1. Рука «коза» и логотип с подписью casino
    () => frame(pp.W, pp.H, 'rp-horn', `
      ${hornMask(pp, -8, -159, -154.9, -65.5)}
      ${logo(pp, 202, 1017, 675.255, 253.676, 'is-rise')}
      ${text(pp, { cx: 540.2, y: 1246.08, size: 109.89, wt: 400, fit: 391, lines: ['casino'] })}`),
    // 2. Give away: надпись в три яруса, эмодзи с языком сверху
    () => frame(pp.W, pp.H, 'rp-give', `
      ${glow(pp, 31, 40, 1017, 1299, RED)}
      ${giveRows(pp, '')}
      ${fade(pp, 0, 548, 1079, 512)}
      <i class="rfill" style="${pp.box(0, 1060, 1079, 319)}background:${BLUE}"></i>
      ${text(pp, { cx: 540, y: 961, size: 115.531, wt: 1000, lh: 1, fit: 971, lines: ['5 promo codes', 'no deposit!'] })}
      ${awaits(pp)}
      ${logo(pp, 739, 1238, 299.913, 112.67)}
      ${emoji(pp, '8277f', 0.5, -2, 1078, 963, 0, 1078, 963, { cls: 'is-tilt is-shadow', d: 24 })}`),
    // 3. Рука OK и Welcome Bonus
    () => frame(pp.W, pp.H, 'rp-ok', `
      ${okMask(pp, 31, 40, -104, -87)}
      ${logo(pp, 306, 8, 467.169, 175.504)}
      ${welcome(pp, 539.5, 1321)}`),
    // 4. 100%: контурные цифры и разбросанные буквы WELCOME (O — эмодзи)
    () => frame(pp.W, pp.H, 'rp-hundred', `
      ${glow(pp, 31, 40, 1017, 1299, RED)}
      ${text(pp, { cx: 539.5, y: 1095, at: 'bottom', size: 497.585, wt: 1000, lh: 0.72, fit: 1070, lines: ['100', '%'], cls: 'is-outline is-big' })}
      ${[['W', 202, 260, 174], ['E', 500, 370, 78], ['L', 784, 260, 73], ['C', 105, 480, 111], ['M', 148, 919, 137], ['E', 876, 919, 78]]
        .map(([c, x, y, w], k) => `<span class="rch" style="--x:${((x + w / 2) / pp.W) * 100}%;--y:${(y / pp.H) * 100}%;--k:${k};font-size:${pp.cq(128.6)}">${c}</span>`).join('')}
      ${emoji(pp, '4d74a', 645, 524, 202, 202, 0, 202, 202, { cls: 'is-o' })}
      ${logo(pp, 306, 8, 467.169, 175.504)}
      ${text(pp, { cx: 539.5, y: 1172, at: 'bottom', size: 128.532, wt: 1000, lh: 0.94, fit: 532, lines: ['Bonus'], style: 'text-transform:uppercase' })}
      ${logo(pp, 800, 1249, 239, 89.787)}`, 'data-word'),
    // 5. Give away контуром на красном, эмодзи со звёздами
    () => frame(pp.W, pp.H, 'rp-give2', `
      ${glow(pp, 31, 40, 1017, 1299, BLUE)}
      ${giveRows(pp, 'is-outline')}
      ${fade(pp, 0, 874, 1079, 512)}
      ${awaits(pp)}
      ${emoji(pp, '4a55f', -90.55, 32, 1220.065, 1152.651, -5.03, 1131.675, 1057.466, { cls: 'is-tilt', d: 24 })}
      ${logo(pp, 739, 1238, 299.913, 112.67)}`),
    // 6. Рука с монетами-эмодзи
    () => frame(pp.W, pp.H, 'rp-coins', `
      ${glow(pp, 31, 40, 1017, 1299, RED)}
      <img class="rimg is-float" src="${src('hand-coins.png')}" alt="Hand full of emoji coins" draggable="false" style="${pp.box(-96, 117, 1340, 894)}">
      ${awaits(pp)}
      ${logo(pp, 739, 1238, 299.913, 112.67)}
      ${welcome(pp, 539.5, 1189)}
      ${emoji(pp, '4d74a', 592, 26, 181.088, 181.088, -173.67, 164, 164, { cls: 'is-bob', k: 1 })}
      ${emoji(pp, '96112', 306, 3, 221.031, 221.031, -34.49, 158.958, 158.958, { cls: 'is-bob', k: 2 })}
      ${emoji(pp, '96112', 488.09, -20.18, 112.78, 112.78, 60.87, 82.905, 82.905, { cls: 'is-bob', k: 3 })}
      ${emoji(pp, '4a55f', 608.59, 801.68, 180.223, 188.077, 77.17, 159.054, 148.624, { cls: 'is-bob', k: 4 })}
      ${emoji(pp, '96112', 747, 895, 207.56, 207.56, 133.5, 146.818, 146.818, { cls: 'is-bob', k: 5 })}
      ${emoji(pp, '96112', 735, 709, 185.8, 185.8, -71.51, 146.818, 146.818, { cls: 'is-bob', k: 6 })}
      ${emoji(pp, 'ba666', 400.13, 757.47, 277.443, 277.443, -37.5, 197.872, 197.872, { cls: 'is-bob', k: 7 })}`),
  ];

  // ——— Сторис 1080 × 1920 ———
  const sp = P(1080, 1920);
  const bars = `<div class="rs-timer" style="${sp.box(0, 20.14, 1079, 5.75)}">${[[1.87, 20.53], [21.33, 40], [40.8, 59.2], [60, 78.67], [79.47, 98.13]]
    .map(([a, b]) => `<i style="left:${a}%;width:${b - a}%"><b></b></i>`).join('')}</div>`;
  const AVA = {
    roll: `<circle cx="42.5" cy="42.5" r="40" fill="${BLUE}" stroke="${RED}" stroke-width="5"/><ellipse cx="42.5" cy="42.5" rx="16" ry="25" transform="rotate(40.4 42.5 42.5)" fill="#ffde67"/>`,
  };
  const head = (brand, prag) => `
    <div class="rs-head" style="${sp.box(35, 59, 1009.53, 85)}">
      <svg class="rs-ava" viewBox="0 0 85 85">${AVA[brand]}</svg>
      <span class="rs-name" style="font-size:${sp.cq(33.2)}">${brand === 'roll' ? 'Roll' : 'BetRush'} <em>18h</em></span>
      <span class="rs-more"><i></i><i></i><i></i></span><span class="rs-x"></span>
    </div>
    ${prag ? `<img class="rimg" src="${src('pragmatic.png')}" alt="Pragmatic Play" style="${sp.box(391, 93, 282, 148)}opacity:.8">` : ''}`;
  const pill = word => `<span class="rs-pill" style="top:${(1631 / 1920) * 100}%;font-size:${sp.cq(56.42)}"><svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/></svg>${word}</span>`;
  const button = (red, blur, label, cx) => `
    <i class="rfill" style="${sp.box(...red.box)}background:${red.color}"></i>
    <i class="rg" style="${sp.box(...blur.box)}background:${blur.color};filter:blur(${sp.cq(15)})"></i>
    ${text(sp, { cx, y: 1503, at: 'bottom', size: 108.643, wt: 1000, lh: 0.9, fit: label.fit, lines: [label.t], cls: 'is-btn', style: 'text-transform:uppercase' })}`;
  const STORIES = [
    () => frame(sp.W, sp.H, 'rs is-frog', `
      <i class="r-zap" style="${sp.box(0, 0, 1080, 1920)}"></i><img class="rimg is-zoom is-zeus is-hero" src="${src('zeus.png')}" alt="" draggable="false" style="${sp.box(-598, 260, 2345, 2259)}object-fit:fill">
      <i class="rfill" style="${sp.box(-3.5, -20, 1087, 835)}background:linear-gradient(${BLUE} 0%, ${BLUE} 57.8%, rgba(2,51,255,0) 91.4%)"></i>
      ${text(sp, { cx: 540, y: 589, at: 'bottom', size: 57, wt: 1000, lh: 0.95, fit: 381, lines: ['22.11—28.11'] })}
      ${text(sp, { cx: 540, y: 270, size: 140, wt: 1000, lh: 0.8, fit: 900, lines: ['Frog', 'Fortune'], max: 1.15, track: 0, cls: 'is-title', style: 'text-transform:uppercase' })}
      ${fade(sp, 0, 1182, 1079, 738)}
      ${head('roll', true)}
      ${button({ box: [128, 1361, 824.87, 209], color: '#f54346' }, { box: [152.83, 1385, 774.091, 162], color: '#0a33f9' }, { t: 'Godmode', fit: 694 }, 540.5)}
      ${pill('Take free')}
      ${bars}`),
    () => frame(sp.W, sp.H, 'rs is-odyssey', `
      ${glow(sp, 31, 40, 1017, 1840, RED)}
      ${masked(sp, { x: 31, y: 40, w: 1017, h: 1840, s: 42, cls: 'is-zoom is-wizard is-hero' }, { file: 'wizard.png', box: { x: -103, y: 462, w: 1183, h: 1574 }, iw: 1183, ih: 1574, rot: 0, mirror: true })}
      ${head('roll', true)}
      ${text(sp, { cx: 540, y: 270, size: 140, wt: 1000, lh: 0.8, fit: 960, lines: ['odyssey', 'of riches'], max: 1.15, track: 0, cls: 'is-title', style: 'text-transform:uppercase' })}
      ${button({ box: [174, 1361, 731, 209], color: BLUE }, { box: [196, 1385, 686, 162], color: RED }, { t: '<i class="r-num">100.000</i>', fit: 600 }, 539)}
      ${pill('Enter')}
      ${bars}`),
    // Третья карточка — своя, Roll: монеты-эмодзи сыплются в руку, Welcome Bonus 100%
    () => frame(sp.W, sp.H, 'rs is-coins', `
      <img class="rimg is-float" src="${src('hand-coins.png')}" alt="Hand full of emoji coins" draggable="false" style="${sp.box(-130, 460, 1340, 894)}">
      ${head('roll', true)}
      ${welcome(sp, 540, 1189)}
      ${button({ box: [128, 1361, 824.87, 209], color: '#f54346' }, { box: [152.83, 1385, 774.091, 162], color: '#0a33f9' }, { t: 'Enter', fit: 300 }, 540.5)}
      ${emoji(sp, '4d74a', 592, 370, 181.088, 181.088, -173.67, 164, 164, { cls: 'is-bob', k: 1 })}
      ${emoji(sp, '96112', 306, 347, 221.031, 221.031, -34.49, 158.958, 158.958, { cls: 'is-bob', k: 2 })}
      ${emoji(sp, '96112', 488.09, 324, 112.78, 112.78, 60.87, 82.905, 82.905, { cls: 'is-bob', k: 3 })}
      ${emoji(sp, '4a55f', 608.59, 1144, 180.223, 188.077, 77.17, 159.054, 148.624, { cls: 'is-bob', k: 4 })}
      ${emoji(sp, 'ba666', 240, 1120, 160, 160, -37.5, 140, 140, { cls: 'is-bob', k: 5 })}
      ${pill('Get bonus')}
      ${bars}`),
  ];

  // ——— Слайды 1920 × 1080 ———
  const p = P(1920, 1080);
  const glowRed = glow(p, 34, 40, 1852, 1000, RED);
  const SLIDES = [
    // Roll 0 — обложка: монета вкатывается на место O
    { cls: 'rs0 is-cover', W: 4096, H: 1903, html: q => logo(q, 916, 526.2, 2264, 850.528, 'is-roll') },
    // Roll 2 — логотип с casino на красном
    { cls: 'rs2', html: () => `${glowRed}${logo(p, 560, 379, 798.831, 300.101, 'is-rise')}${text(p, { cx: 959.5, y: 650, size: 130, wt: 400, fit: 463, lines: ['casino'] })}` },
    // Roll 3 — Welcome Bonus 100%, счётчик
    { cls: 'rs3', html: () => text(p, { cx: 959.5, y: 688, at: 'bottom', size: 179.522, wt: 1000, lh: 0.94, fit: 1261, lines: ['Welcome', 'Bonus <b><i class="r-count">100</i>%</b>'], cls: 'is-welcome' }) },
    // Roll 4 — соцсети на телефоне
    { cls: 'rs4 is-photo', html: () => `<img class="rimg is-slow" src="${src('mock-phone.jpg')}" alt="Roll social media on a phone" loading="lazy" style="${p.box(-460, -556, 2840, 2556)}">` },
    // Roll 5 — постеры лентой: два ряда (как сетка в макете) едут слева направо, бесконечно
    { cls: 'rs5', html: () => [[40, [0, 1, 2, 3, 4, 5]], [547, [3, 4, 5, 0, 1, 2]]]
      .map(([y, order], r) => `<div class="rs-row${r ? ' is-slow' : ''}" style="${p.box(0, y, 1920, 492)}"><div class="rs-track">${[...order, ...order]
        .map(k => `<div class="rs-cell">${POSTERS[k]()}</div>`).join('')}</div></div>`).join('') },
    // Roll 6 — три сторис
    { cls: 'rs6', html: () => [[98, 41.6, 560.47, 996.39], [679.26, 41.6, 560.7, 996.8], [1261.53, 42.01, 560.47, 996.39]]
      .map(([x, y, w, h], k) => `<div class="rs-cell is-story" style="${p.box(x, y, w, h)}--k:${k}">${STORIES[k]()}</div>`).join('') },
    // Roll 7 — две руки
    { cls: 'rs7', html: () => {
      // Кадр Roll7 со STAKE & ROLL: DM Sans Black 598 px, трекинг −12%, интерлиньяж 0.94 (без обрезки строки)
      const word = (t, cx, bottom, color, d0) => `<p class="rt is-stake" style="left:${(cx / 1920) * 100}%;top:${(bottom / 1080) * 100}%;font-size:${p.cq(598)};font-weight:1000;line-height:.94;letter-spacing:-.12em;color:${color};transform:translate(-50%,-100%);--d0:${d0}s"><span class="ln">${t}</span></p>`;
      return `${masked(p, { x: 6, y: 20, w: 1017, h: 1040, s: 192, cls: 'is-hand is-ok' },
          { file: 'hand-ok.png', alt: 'Tattooed hand making the OK sign', box: { x: -129, y: -107, w: 1403.628, h: 1756.826 }, iw: 1024, ih: 1536, rot: -15.8 })}
        ${word('STAKE', 792, 528, '#fff', 0)}
        ${masked(p, { x: 977, y: -233, w: 1214.307, h: 1241.769, s: 187, cls: 'is-hand is-horn' },
          { file: 'hand-horn.png', alt: 'Tattooed hand making the horns sign', box: { x: 825.87, y: -136.8, w: 1428.613, h: 1570.877 }, iw: 1259.177, ih: 1423.468, rot: -7.24, crop: { w: 100, h: 132.69, l: 0, t: -10.57 } })}
        ${word('ROLL', 1261, 1135, '#fff', 0.35)}
        ${word('&amp;', 244, 1135, RED, 0.55)}`;
    } },
    // Roll 8 — эмодзи сыплются сверху и засыпают весь кадр, логотип поверх (черновик из Figma)
    { cls: 'rs8', html: () => `${glow(p, 34, 40, 1852, 1000, BLUE)}<canvas class="r-pile" aria-label="Emoji coins pouring down"></canvas>${logo(p, 373, 734, 1173.17, 440.731, 'is-rise is-front')}` },
    // Roll 9 — билборд, Roll 10 — стаканы
    { cls: 'rs9 is-photo', html: () => `<img class="rimg is-slow" src="${src('mock-board.jpg')}" alt="Roll billboard" loading="lazy" style="${p.box(-969, -362, 3604, 3604)}">` },
    { cls: 'rs10 is-photo', html: () => `<img class="rimg is-slow" src="${src('mock-cups.jpg')}" alt="Roll paper cups" loading="lazy" style="${p.box(-194, -103, 2372, 1285)}">` },
    // Roll 11 — финальный логотип
    { cls: 'rs11', html: () => `${logo(p, 305, 292, 1308.722, 491.654, 'is-rise')}${text(p, { cx: 959.5, y: 736, size: 130, wt: 400, fit: 463, lines: ['casino'] })}` },
  ];

  function mount(root) {
    root.classList.add('rp');
    root.innerHTML = SLIDES.map(s => {
      const q = P(s.W || 1920, s.H || 1080);
      return frame(q.W, q.H, `r-slide ${s.cls}`, s.html(q));
    }).join('');

    const $$ = (sel, el = root) => [...el.querySelectorAll(sel)];
    const slides = $$('.r-slide');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ——— Надписи по словам: слово — окно-маска (.rw), внутри него едет само слово (.rwi) ———
    const split = (node, acc) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(t => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.append(t); return; }
            const w = document.createElement('span');
            w.className = 'rw';
            w.innerHTML = '<span class="rwi"></span>';
            w.firstChild.textContent = t;
            frag.append(w);
            acc.push(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('r-count') && !n.classList.contains('r-num')) split(n, acc);
        else if (n.nodeType === 1) { const w = document.createElement('span'); w.className = 'rw'; w.innerHTML = '<span class="rwi"></span>'; n.replaceWith(w); w.firstChild.append(n); acc.push(w); }
      });
    };
    $$('.rt').forEach(el => {
      const words = [];
      el.querySelectorAll('.ln').forEach(l => split(l, words));
      words.forEach((w, i) => w.style.setProperty('--i', i));
    });

    // ——— Подгонка строк под ширину оригинала (пропорция не зависит от размера кадра) ———
    const fit = () => $$('[data-fit]').forEach(el => {
      const cw = el.closest('.rf').clientWidth;
      if (!cw) return;
      const base = parseFloat(el.style.getPropertyValue('--fs'));
      el.style.fontSize = `${base}cqw`;
      el.style.letterSpacing = '0em';
      const target = parseFloat(el.dataset.fit) * cw;
      const lines = [...el.querySelectorAll('.ln')];
      const widest = () => Math.max(...lines.map(l => l.getBoundingClientRect().width));
      const k = Math.min(parseFloat(el.dataset.max || 1.15), target / widest());
      el.style.fontSize = `${base * k}cqw`;
      const n = Math.max(...lines.map(l => l.textContent.length));
      const left = target - widest();
      if (left > 0 && n > 1 && !('notrack' in el.dataset)) el.style.letterSpacing = `${Math.min(el.dataset.max ? 0.07 : 0.05, left / (n - 1) / ((base * k * cw) / 100)).toFixed(4)}em`;
    });
    const fonts = ['400', '700', '800', '900', '1000'].map(w => document.fonts.load(`${w} 100px "DM Sans"`));
    Promise.all(fonts).then(fit, fit);
    let rt;
    new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(fit, 120); }).observe(root);

    // ——— Появление слайдов ———
    const counter = el => {
      const out = el.querySelector('.r-count');
      if (!out) return;
      const t0 = performance.now(), dur = reduce ? 1 : 1600;
      const step = t => {
        const k = Math.min(1, (t - t0) / dur);
        out.textContent = Math.round(100 * (1 - Math.pow(1 - k, 4)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      const el = e.target;
      el.classList.toggle('is-live', e.isIntersecting);
      if (e.isIntersecting && !el.classList.contains('is-in')) { el.classList.add('is-in'); if (!el.querySelector('.rs-cell')) el.classList.add('is-show'); counter(el); }
    }), { threshold: 0.3 });
    slides.forEach(s => io.observe(s));
    // «100.000» в сторис набегает каждый раз, когда карточка появляется
    const countUp = card => card.querySelectorAll('.r-num').forEach(out => {
      const t0 = performance.now(), dur = reduce ? 1 : 1800;
      const step = t => {
        const k = Math.min(1, (t - t0) / dur);
        out.textContent = Math.round(100000 * (1 - Math.pow(1 - k, 3))).toLocaleString('de-DE');
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    // Карточки (постеры, сторис): анимация текста и элементов — каждый раз, когда карточка входит в кадр
    slides.filter(s => s.querySelector('.rs-cell')).forEach(s => {
      const cio = new IntersectionObserver(entries => entries.forEach(e => {
        const card = e.target.firstElementChild;
        if (e.intersectionRatio >= 0.35 && !card.classList.contains('is-show')) { card.classList.add('is-show'); countUp(card); }
        else if (!e.isIntersecting) card.classList.remove('is-show');
      }), { root: s, threshold: [0, 0.35] });
      s.querySelectorAll('.rs-cell').forEach(c => cio.observe(c));
    });
    /* Карточки живут циклами: надписи (и герои сторис) уходят и возвращаются каждый раз по-новому —
       из-под маски, падением сверху, прыжком, выездом сбоку, переворотом. У каждой карточки свой ритм. */
    const FX = ['mask', 'drop', 'pop', 'slide', 'flip'];
    const cards = $$('.rs-cell > .rf');
    const play = (card, fx) => {
      card.classList.remove('fx-out', 'fx-play', ...FX.map(f => `fx-${f}`));
      void card.offsetWidth;
      card.classList.add(`fx-${fx}`, 'fx-play');
      card.dataset.fx = fx;
    };
    const cycle = card => {
      if (!card.classList.contains('is-show') || !card.closest('.r-slide').classList.contains('is-live') || card.classList.contains('fx-out')) return;
      const prev = card.dataset.fx || 'mask';
      const next = FX.filter(f => f !== prev)[Math.floor(Math.random() * (FX.length - 1))];
      card.classList.add('fx-out');
      setTimeout(() => { play(card, next); countUp(card); }, 650);
    };
    cards.forEach(card => new MutationObserver(() => {
      if (card.classList.contains('is-show') && !card.classList.contains('fx-play') && !card.classList.contains('fx-out')) play(card, 'mask');
      // remove() меняет атрибут даже без этих классов — проверяем, иначе наблюдатель зациклится
      if (!card.classList.contains('is-show') && (card.classList.contains('fx-play') || card.classList.contains('fx-out'))) card.classList.remove('fx-play', 'fx-out');
    }).observe(card, { attributes: true, attributeFilter: ['class'] }));
    if (!reduce) cards.forEach((card, k) => {
      const tick = () => { if (!root.isConnected) return; cycle(card); setTimeout(tick, 5200 + Math.random() * 3200); };
      setTimeout(tick, 4200 + k * 450);
      card.closest('.rs-cell').addEventListener('click', () => cycle(card));
    });

    // ——— Курсор и прокрутка: слои сдвигаются на свою глубину ———
    const state = new Map(slides.map(s => [s, { x: 0, y: 0, tx: 0, ty: 0 }]));
    slides.forEach(s => {
      s.addEventListener('pointermove', e => {
        const r = s.getBoundingClientRect(), st = state.get(s);
        st.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        st.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      s.addEventListener('pointerleave', () => { const st = state.get(s); st.tx = st.ty = 0; });
    });
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!root.isConnected) { cancelAnimationFrame(raf); return; }
      const vh = innerHeight;
      for (const [s, st] of state) {
        if (!s.classList.contains('is-live')) continue;
        st.x += (st.tx - st.x) * 0.08;
        st.y += (st.ty - st.y) * 0.08;
        s.style.setProperty('--mx', st.x.toFixed(4));
        s.style.setProperty('--my', st.y.toFixed(4));
        const r = s.getBoundingClientRect();
        s.style.setProperty('--sp', ((vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2)).toFixed(4));
      }
    };
    if (!reduce) raf = requestAnimationFrame(tick);

    // ——— Обложка: монета переворачивается по наведению ———
    const cover = root.querySelector('.is-cover');
    const flip = () => {
      const c = cover.querySelector('.rc');
      c.classList.remove('is-flip');
      void c.getBoundingClientRect();
      c.classList.add('is-flip');
    };
    cover.addEventListener('pointerenter', flip);
    cover.addEventListener('click', flip);

    // ——— Постер 100%: буквы собираются в WELCOME, эмодзи встаёт на место O ———
    $$('[data-word]').forEach(poster => {
      const L = [...poster.querySelectorAll('.rch')];
      const o = poster.querySelector('.re.is-o');
      const items = [L[0], L[1], L[2], L[3], o, L[4], L[5]];
      const place = () => {
        const pw = poster.clientWidth;
        if (!pw) return;
        const ws = items.map(el => (el === o ? 0.12 * pw : el.offsetWidth));
        const gap = 0.006 * pw, total = ws.reduce((a, b) => a + b, 0) + gap * 6;
        let x = (pw - total) / 2;
        items.forEach((el, k) => { el.style.setProperty('--ax', `${((x + ws[k] / 2) / pw) * 100}%`); x += ws[k] + gap; });
      };
      new ResizeObserver(place).observe(poster);
      const cell = poster.closest('.rs-cell') || poster;
      cell.addEventListener('pointerenter', () => poster.classList.add('is-word'));
      cell.addEventListener('pointerleave', () => poster.classList.remove('is-word'));
      cell.addEventListener('click', () => poster.classList.toggle('is-word'));
    });

    // ——— Roll 8: эмодзи-монеты падают, катятся и копятся до верха; потом дно открывается ———
    $$('.r-pile').forEach(cv => {
      const slide = cv.closest('.r-slide');
      const ctx = cv.getContext('2d');
      const W = 1920, H = 1080, G = 2600;
      const files = ['emo-wow.png', 'emo-tongue.png', 'emo-starstruck.png', 'emo-laugh.png', 'emo-party.png'];
      const imgs = files.map(f => Object.assign(new Image(), { src: src(f) }));
      // Монета занимает ~78% картинки; у эмодзи с колпаком (party) монета смещена
      const coin = [0.78, 0.8, 0.8, 0.8, 0.62];
      let balls = [], floor = true, phase = 'fill', timer = 0, spawnAcc = 0, scale = 1;
      const ptr = { x: -1e4, y: -1e4 };
      const resize = () => {
        const dpr = Math.min(2, devicePixelRatio || 1);
        cv.width = Math.round(slide.clientWidth * dpr);
        cv.height = Math.round(slide.clientHeight * dpr);
        scale = cv.width / W;
      };
      new ResizeObserver(resize).observe(slide);
      slide.addEventListener('pointermove', e => {
        const r = slide.getBoundingClientRect();
        ptr.x = ((e.clientX - r.left) / r.width) * W;
        ptr.y = ((e.clientY - r.top) / r.height) * H;
      });
      slide.addEventListener('pointerleave', () => { ptr.x = ptr.y = -1e4; });
      const spawn = () => {
        const r = 46 + Math.random() ** 1.6 * 120;
        balls.push({ x: r + Math.random() * (W - 2 * r), y: -r - Math.random() * 200, vx: (Math.random() - 0.5) * 300, vy: 200 + Math.random() * 300,
          r, a: Math.random() * Math.PI * 2, w: (Math.random() - 0.5) * 4, k: Math.floor(Math.random() * files.length) });
      };
      const step = dt => {
        if (phase === 'fill') {
          spawnAcc += dt * 26;
          while (spawnAcc > 1) { spawnAcc--; spawn(); }
          // Кадр засыпан: верх кучи у верхнего края
          // Кадр засыпан, когда монеты в кадре покрывают ~86% площади — дальше сыпать некуда; куча висит 2.6 с
          let area = 0;
          for (const b of balls) if (b.y - b.r > -20) area += Math.PI * b.r * b.r;
          if (area > W * H * 0.86 || balls.length > 460) { phase = 'hold'; timer = 2.6; }
        } else if (phase === 'hold') {
          timer -= dt;
          if (timer <= 0) { phase = 'drain'; floor = false; }
        } else if (phase === 'drain') {
          balls = balls.filter(b => b.y - b.r < H + 40);
          if (!balls.length) { phase = 'fill'; floor = true; }
        }
        for (const b of balls) {
          b.vy += G * dt;
          const dx = b.x - ptr.x, dy = b.y - ptr.y, d2 = dx * dx + dy * dy, R = 220 + b.r;
          if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 5200 * dt; b.vx += (dx / d) * f; b.vy += (dy / d) * f; }
          b.x += b.vx * dt; b.y += b.vy * dt;
          b.vx *= 0.995;
        }
        // Столкновения: несколько проходов, чтобы куча не проседала
        for (let it = 0; it < 4; it++) {
          for (let i = 0; i < balls.length; i++) {
            const A = balls[i];
            for (let j = i + 1; j < balls.length; j++) {
              const B = balls[j];
              const dx = B.x - A.x, dy = B.y - A.y, rr = A.r + B.r;
              if (Math.abs(dx) > rr || Math.abs(dy) > rr) continue;
              const d2 = dx * dx + dy * dy;
              if (d2 >= rr * rr || d2 === 0) continue;
              const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, over = (rr - d) / 2;
              const ma = A.r * A.r, mb = B.r * B.r, ta = mb / (ma + mb), tb = ma / (ma + mb);
              A.x -= nx * over * 2 * ta; A.y -= ny * over * 2 * ta;
              B.x += nx * over * 2 * tb; B.y += ny * over * 2 * tb;
              const rv = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
              if (rv < 0) {
                const jimp = -(1.25) * rv;
                A.vx -= nx * jimp * ta; A.vy -= ny * jimp * ta;
                B.vx += nx * jimp * tb; B.vy += ny * jimp * tb;
              }
            }
          }
          for (const b of balls) {
            if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.4; }
            if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * 0.4; }
            if (floor && b.y > H - b.r) { b.y = H - b.r; b.vy = -Math.abs(b.vy) * 0.3; b.vx *= 0.92; }
          }
        }
        // Монеты катятся: вращение следует за горизонтальной скоростью
        for (const b of balls) { b.w += (b.vx / b.r - b.w) * Math.min(1, dt * 6); b.a += b.w * dt; }
      };
      const draw = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, cv.width, cv.height);
        for (const b of balls) {
          const im = imgs[b.k];
          if (!im.complete || !im.naturalWidth) continue;
          const size = (2 * b.r) / coin[b.k];
          ctx.setTransform(scale, 0, 0, scale, b.x * scale, b.y * scale);
          ctx.rotate(b.a);
          ctx.drawImage(im, -size / 2, -size / 2, size, size);
        }
      };
      let last = 0;
      const loop = t => {
        const id = requestAnimationFrame(loop);
        if (!root.isConnected) { cancelAnimationFrame(id); last = 0; return; }
        if (!slide.classList.contains('is-live')) { last = 0; return; }
        const dt = last ? Math.min(0.033, (t - last) / 1000) : 0.016;
        last = t;
        // Два полушага — устойчивее при большой куче
        step(dt / 2); step(dt / 2);
        draw();
      };
      if (reduce) {
        // Без анимации — просто сразу полная куча
        for (let n = 0; n < 220; n++) spawn();
        for (let n = 0; n < 400; n++) step(1 / 60);
        phase = 'hold'; timer = Infinity;
        imgs.forEach(im => im.addEventListener('load', draw));
      }
      requestAnimationFrame(loop);
    });

    // ——— Сторис: полоски таймера по очереди; картинка дышит непрерывно, без перезапуска ———
    $$('.rs').forEach((st, k) => {
      const segs = [...st.querySelectorAll('.rs-timer i')];
      let i = 0;
      const next = () => {
        segs.forEach((b, j) => { b.classList.toggle('is-done', j < i); b.classList.remove('is-run'); });
        void st.offsetWidth;
        segs[i].classList.add('is-run');
      };
      segs.forEach(b => b.addEventListener('animationend', e => { if (e.target.parentElement !== b) return; i = (i + 1) % segs.length; next(); }));
      setTimeout(next, k * 900);
    });
  }

  window.PROTOS = window.PROTOS || {};
  // Живая обложка для сетки на главной: монета вкатывается на место O и крутится
  const bentoCover = () => `<span class="rb-cover"><svg class="r-logo" viewBox="0 0 381.919 143.477" aria-label="Roll">${LOGO_PARTS}</svg></span>`;
  window.PROTOS.roll = { mount, replacesGallery: true, replacesCover: true, bentoCover };
})();
