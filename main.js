(() => {
  const D = window.PORTFOLIO;
  document.body.dataset.theme ||= 'dark';
  const P = D.projects;
  // \u0428\u0440\u0438\u0444\u0442\u044b \u043a\u0430\u043a \u043f\u0440\u043e\u0435\u043a\u0442\u044b: \u0443 \u043a\u0430\u0436\u0434\u043e\u0433\u043e \u0441\u0432\u043e\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441 \u0433\u0430\u043b\u0435\u0440\u0435\u0435\u0439
  const FP = D.fonts.custom.fonts.filter(f => f.project).map(f => ({
    ...f.project, name: f.name.replace(/_/g, ' '), about: f.about, isFont: true,
  }));
  // \u0416\u0438\u0432\u044b\u0435 \u043f\u0440\u0435\u0437\u0435\u043d\u0442\u0430\u0446\u0438\u0438 \u0448\u0440\u0438\u0444\u0442\u043e\u0432: \u0444\u0430\u0439\u043b\u044b WOFF2 \u0438 \u043d\u0430\u0431\u043e\u0440\u044b \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432 \u0438\u0437 build_fonts.py
  const SPEC = window.SPECIMENS || {};
  /* \u041f\u0440\u0430\u0432\u043a\u0438 \u043f\u043e \u0448\u0440\u0438\u0444\u0442\u0430\u043c: \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044f, \u0440\u0435\u0433\u0438\u0441\u0442\u0440, \u0447\u0442\u043e \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c */
  const FONT_TWEAKS = {
    'lib-drunk-cherry': { name: 'DrUNK CHErRY', text: t => (t.toUpperCase() === 'DRUNK CHERRY' ? 'DrUNK CHErRY' : t.toUpperCase().replace(/R/g, 'r')) }, // \u043f\u0440\u043e\u043f\u0438\u0441\u043d\u044b\u0435, \u00abr\u00bb \u2014 \u0441\u0442\u0440\u043e\u0447\u043d\u0430\u044f
    'lib-gameday': { name: 'The GOLLANOS', plate: '<span class="gd"><small>The</small>GOLLANOS</span>', measure: 'TGOLLANOS' },                  // \u00abThe\u00bb \u043c\u0435\u043b\u044c\u0447\u0435 \u0438 \u043f\u0440\u0438\u0436\u0430\u0442\u043e \u043a\u0432\u0435\u0440\u0445\u0443
    'lib-borome': { name: 'Rome', latinOnly: true, noItalic: true },
    'lib-tattooist': { caps: true },
    'lib-strike': { caps: true },
    'lib-letu': { name: 'Sharp' },
    'lib-coree': { name: 'GALAXY', bolder: true },
  };
  (window.FONT_LIBRARY || []).forEach(l => { const t = FONT_TWEAKS[l.slug]; if (t?.name) l.name = t.name; });
  Object.entries(FONT_TWEAKS).forEach(([slug, t]) => {
    const S = SPEC[slug];
    if (!S) return;
    S.tweak = t;
    if (t.noItalic) { const keep = S.styles.filter(st => !/italic/i.test(st.name)); S.default = Math.max(0, keep.indexOf(S.styles[S.default])); S.styles = keep; }
    if (t.latinOnly) {
      S.scripts = S.scripts.filter(x => x === 'lat');
      delete S.samples.cyr;
      Object.keys(S.groups).forEach(g => /cyril/i.test(g) && delete S.groups[g]);
    }
  });
  // Type library: \u0448\u0440\u0438\u0444\u0442\u044b \u0431\u0435\u0437 \u043f\u0440\u043e\u0435\u043a\u0442\u0430 \u043d\u0430 \u0441\u0442\u0430\u0440\u043e\u043c \u0441\u0430\u0439\u0442\u0435 \u2014 \u0442\u043e\u043b\u044c\u043a\u043e \u0436\u0438\u0432\u0430\u044f \u043f\u0440\u0435\u0437\u0435\u043d\u0442\u0430\u0446\u0438\u044f
  const scriptsOf = S => S.scripts.map(s => ({ lat: 'Latin', cyr: 'Cyrillic' })[s]).join(' \u00b7 ');
  const LIB = (window.FONT_LIBRARY || []).filter(l => SPEC[l.slug]).map(l => ({
    slug: l.slug, title: l.name, name: l.name, isFont: true, isLib: true, images: [], thumb: null,
    about: `${scriptsOf(SPEC[l.slug])} \u00b7 ${SPEC[l.slug].styles.length} ${SPEC[l.slug].styles.length === 1 ? 'style' : 'styles'}`,
  }));
  // \u041b\u043e\u0433\u043e\u0442\u0438\u043f\u044b \u2014 \u0442\u0440\u0438 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0438, \u0443 \u043a\u0430\u0436\u0434\u043e\u0439 \u0441\u0432\u043e\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430
  const LOGOS = D.logos.map(g => ({ ...g, name: g.title.replace('Logo ', 'Logos '), isLogo: true, thumb: g.images[0].src }));
  const ALL = [...P, ...FP, ...LIB, ...LOGOS];
  const findProject = slug => ALL.find(p => p.slug === slug);
  const faces = new Map();
  function loadFace(st) {
    if (!faces.has(st.family)) {
      const ff = new FontFace(st.family, window.FONTPACK?.get(st.file) || `url("${st.file}")`);
      faces.set(st.family, ff.load().then(f => { document.fonts.add(f); return f; }).catch(() => null));
    }
    return faces.get(st.family);
  }
  // \u041c\u043e\u0436\u043d\u043e \u043b\u0438 \u043d\u0430\u0431\u0440\u0430\u0442\u044c \u0442\u0435\u043a\u0441\u0442 \u044d\u0442\u0438\u043c \u0448\u0440\u0438\u0444\u0442\u043e\u043c (\u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0438 \u0443 \u043d\u0430\u0441 \u043a\u0430\u043f\u0441\u043e\u043c)
  const covers = (S, text) => [...text.toUpperCase()].every(c => c === ' ' || S.cmap.includes(c));
  // \u0415\u0441\u043b\u0438 \u0441\u0442\u0440\u043e\u0447\u043d\u044b\u0445 \u043d\u0435\u0442 \u0438\u043b\u0438 \u043e\u043d\u0438 \u043d\u0430\u0440\u0438\u0441\u043e\u0432\u0430\u043d\u044b \u043d\u0435 \u0432\u0441\u0435 \u2014 \u0448\u0440\u0438\u0444\u0442 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u043c \u0442\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u043e\u043f\u0438\u0441\u043d\u044b\u043c\u0438
  const LOWER = { lat: 'abcdefghijklmnopqrstuvwxyz', cyr: '\u0430\u0431\u0432\u0433\u0434\u0435\u0436\u0437\u0438\u0439\u043a\u043b\u043c\u043d\u043e\u043f\u0440\u0441\u0442\u0443\u0444\u0445\u0446\u0447\u0448\u0449\u044a\u044b\u044c\u044d\u044e\u044f' };
  const capsOnly = (S, script) => !!S.tweak?.caps || ![...LOWER[script]].every(c => S.cmap.includes(c));
  const scriptOf = text => (/[\u0430-\u044f\u0451]/i.test(text) ? 'cyr' : 'lat');
  const caseFor = (S, text) => (S.tweak?.text ? S.tweak.text(text) : capsOnly(S, scriptOf(text)) ? text.toUpperCase() : text);
  // Фирменный цвет проекта вместо оранжевого акцента сайта — в списках, плашках и на странице проекта
  const BRAND = { 'font-sts_sans_': '#f2c75c', sts_sans_: '#f2c75c' };
  // Круглый курсор «View» над строкой или страницей проекта с фирменным цветом — тоже этого цвета
  document.addEventListener('pointerover', e => {
    const cur = document.querySelector('.cursor');
    if (!cur) return;
    const el = e.target.closest?.('[style*="--accent"]');
    if (el) cur.style.setProperty('--accent', getComputedStyle(el).getPropertyValue('--accent').trim());
    else cur.style.removeProperty('--accent');
  });
  const SCRIPT_NAMES = { lat: 'Latin', cyr: '\u041a\u0438\u0440\u0438\u043b\u043b\u0438\u0446\u0430' };
  const codeOf = ch => 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const pad = n => String(n).padStart(2, '0');
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  /* \u0421\u0442\u0440\u0435\u043b\u043a\u0438 \u0438 \u0437\u0432\u0451\u0437\u0434\u044b \u2014 \u0442\u043e\u043d\u043a\u0438\u0435 \u043b\u0438\u043d\u0438\u0438 \u0432 1 \u043f\u0438\u043a\u0441\u0435\u043b\u044c \u0441 \u043e\u0441\u0442\u0440\u044b\u043c\u0438 \u043a\u043e\u043d\u0446\u0430\u043c\u0438 (SVG \u0432\u043c\u0435\u0441\u0442\u043e \u0441\u0438\u043c\u0432\u043e\u043b\u043e\u0432 \u0448\u0440\u0438\u0444\u0442\u0430) */
  // \u0412\u0441\u0435 \u0441\u0442\u0440\u0435\u043b\u043a\u0438 \u0441\u0430\u0439\u0442\u0430 \u043e\u0434\u043d\u043e\u0439 \u043f\u043e\u0440\u043e\u0434\u044b: \u0442\u0430 \u0436\u0435 \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u2197 \u0441 \u0434\u0443\u0433\u0430\u043c\u0438 \u043d\u0430 \u0441\u0442\u044b\u043a\u0435, \u043f\u043e\u0432\u0451\u0440\u043d\u0443\u0442\u0430\u044f \u0432 \u043d\u0443\u0436\u043d\u0443\u044e \u0441\u0442\u043e\u0440\u043e\u043d\u0443
  const ARROW_TURN = { '\u2197': 0, '\u2192': 45, '\u2193': 135, '\u2190': 225, '\u2191': -45 };
  const arrowSVG = ch => `<svg class="ar" viewBox="-12 -12 24 24" aria-hidden="true"><path transform="rotate(${ARROW_TURN[ch]})" d="${filletArrow(1.2, 5.2, 16)}"/></svg>`;
  // \u0421\u0442\u0440\u0435\u043b\u043a\u0430 \u2197 \u0442\u043e\u0439 \u0436\u0435 \u043f\u043e\u0440\u043e\u0434\u044b, \u0447\u0442\u043e \u0438 \u043a\u0440\u0435\u0441\u0442: \u0442\u043e\u043d\u043a\u0438\u0435 \u043b\u0438\u043d\u0438\u0438, \u0430 \u043d\u0430 \u0441\u0442\u044b\u043a\u0430\u0445 \u0434\u0440\u0435\u0432\u043a\u0430 \u0441 \u0443\u0433\u043e\u043b\u043a\u043e\u043c \u2014 \u0432\u043e\u0433\u043d\u0443\u0442\u044b\u0435 \u0434\u0443\u0433\u0438
  const filletArrow = (w, r, arm = 16) => {
    const f = n => +n.toFixed(2), q = Math.SQRT1_2;
    const d = [-q, q], n = [q, q];
    const IA = [8 - w - w * Math.SQRT2, -8 + w], IB = [8 - w, -8 + w + w * Math.SQRT2];
    const pts = [
      `M${f(8 - arm)} ${f(-8 - w)}`, `L${f(8 + w)} ${f(-8 - w)}`, `L${f(8 + w)} ${f(-8 + arm)}`, `L${f(8 - w)} ${f(-8 + arm)}`,
      `L${f(8 - w)} ${f(IB[1] + r)}`, `Q${f(IB[0])} ${f(IB[1])} ${f(IB[0] + r * d[0])} ${f(IB[1] + r * d[1])}`,
      `L${f(-8 + w * n[0])} ${f(8 + w * n[1])}`, `L${f(-8 - w * n[0])} ${f(8 - w * n[1])}`,
      `L${f(IA[0] + r * d[0])} ${f(IA[1] + r * d[1])}`, `Q${f(IA[0])} ${f(IA[1])} ${f(IA[0] - r)} ${f(IA[1])}`,
      `L${f(8 - arm)} ${f(-8 + w)}Z`,
    ];
    return pts.join('');
  };
  // \u0417\u0432\u0435\u0437\u0434\u0430-\u043a\u0440\u0435\u0441\u0442: \u0447\u0435\u0442\u044b\u0440\u0435 \u0442\u043e\u043d\u043a\u0438\u0445 \u043b\u0443\u0447\u0430, \u0443 \u0446\u0435\u043d\u0442\u0440\u0430 \u043e\u043d\u0438 \u043f\u043b\u0430\u0432\u043d\u043e \u0440\u0430\u0441\u0445\u043e\u0434\u044f\u0442\u0441\u044f \u0432\u043e\u0433\u043d\u0443\u0442\u044b\u043c\u0438 \u0434\u0443\u0433\u0430\u043c\u0438
  // hx, hy \u2014 \u0434\u043b\u0438\u043d\u0430 \u043b\u0443\u0447\u0435\u0439 \u043f\u043e \u0433\u043e\u0440\u0438\u0437\u043e\u043d\u0442\u0430\u043b\u0438 \u0438 \u0432\u0435\u0440\u0442\u0438\u043a\u0430\u043b\u0438, w \u2014 \u043f\u043e\u043b\u0443\u0442\u043e\u043b\u0449\u0438\u043d\u0430 \u043b\u0443\u0447\u0430, r \u2014 \u0440\u0430\u0434\u0438\u0443\u0441 \u0434\u0443\u0433 \u0443 \u0446\u0435\u043d\u0442\u0440\u0430
  const crossStar = (hx, hy, w, r) => {
    const f = n => +n.toFixed(2);
    return `M${f(-w)} ${f(-hy)}H${f(w)}V${f(-r)}Q${f(w)} ${f(-w)} ${f(r)} ${f(-w)}H${f(hx)}V${f(w)}H${f(r)}Q${f(w)} ${f(w)} ${f(w)} ${f(r)}V${f(hy)}H${f(-w)}V${f(r)}Q${f(-w)} ${f(w)} ${f(-r)} ${f(w)}H${f(-hx)}V${f(-w)}H${f(-r)}Q${f(-w)} ${f(-w)} ${f(-w)} ${f(-r)}Z`;
  };
  const STAR = crossStar(10, 10, .5, 4.2);
  // \u0412 \u0431\u0435\u0433\u0443\u0449\u0435\u0439 \u0441\u0442\u0440\u043e\u043a\u0435 \u0437\u0432\u0435\u0437\u0434\u0430 \u0432\u044b\u0442\u044f\u043d\u0443\u0442\u0430 \u043f\u043e \u0432\u0435\u0440\u0442\u0438\u043a\u0430\u043b\u0438: \u0432\u044b\u0448\u0435, \u043d\u043e \u043d\u0435 \u0448\u0438\u0440\u0435
  // \u0417\u0432\u0435\u0437\u0434\u0430 \u0432 \u0431\u0435\u0433\u0443\u0449\u0435\u0439 \u0441\u0442\u0440\u043e\u043a\u0435: \u043b\u0443\u0447\u0438 \u043e\u0434\u0438\u043d\u0430\u043a\u043e\u0432\u043e\u0439 \u0434\u043b\u0438\u043d\u044b \u0432\u043e \u0432\u0441\u0435 \u0441\u0442\u043e\u0440\u043e\u043d\u044b
  const starSVG = () => `<svg class="star" viewBox="-10 -10 20 20" aria-hidden="true"><path d="${crossStar(10, 10, .3, 4.2)}"/></svg>`;
  function arrows(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => (/[\u2190\u2192\u2191\u2193\u2197]/.test(n.data) && !n.parentElement.closest('script, style, title, svg, [contenteditable], .spec-big, .spec-wf-text, .spec-weight-word, .spec-mx') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const span = document.createElement('span');
      span.innerHTML = esc(n.data).replace(/[\u2190\u2192\u2191\u2193\u2197]/g, arrowSVG);
      n.replaceWith(...span.childNodes);
    });
  }

  // \u041a\u043e\u0440\u043e\u0442\u043a\u043e\u0435 \u0438\u043c\u044f + \u0442\u0438\u043f \u0434\u043b\u044f \u0434\u043b\u0438\u043d\u043d\u044b\u0445 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0439, \u0447\u0442\u043e\u0431\u044b \u0441\u0442\u0440\u043e\u043a\u0438 \u0441\u043f\u0438\u0441\u043a\u0430 \u043d\u0435 \u043f\u0435\u0440\u0435\u043d\u043e\u0441\u0438\u043b\u0438\u0441\u044c
  const SPLIT = {
    betrush: ['BetRush', 'Sport betting'],
    roll: ['Roll', 'iGaming'],
    spinwin: ['SpinWin', 'Crypto casino'],
    burger_heroes: ['Burger Heroes', 'Restaurant'],
    hbttt: ['Heavy Black Tattoo', 'Tel Aviv'],
    megarenton: ['MegaRenton', 'Podcast'],
    match: ['Match TV', 'Sports channel'],
    noiz: ['NOIZ', 'Media'],
    'russian-intranet-awards2022': ['Intranet Awards \u201922', 'Award'],
    ruaasianintranetawards: ['Intranet Awards \u201921', 'Award'],
    painmangementinstitute: ['Pain Management', 'Institute'],
    social_welfare_institute: ['Social Welfare', 'Institute'],
    thevoiceofrussia: ['The Voice of Russia', 'Radio'],
    sts_sans_: ['STS Sans', 'Typeface'],
    head_bar_sticker_pack: ['Head Bar', 'Sticker pack'],
    business_pandemia: ['Business Pandemia', ''],
  };
  const nameOf = p => p.name ?? SPLIT[p.slug]?.[0] ?? p.title;
  const kindOf = p => SPLIT[p.slug]?.[1] ?? 'Branding';

  // \u0420\u0430\u0437\u0431\u0438\u0432\u0430\u0435\u0442 \u0442\u0435\u043a\u0441\u0442 \u043d\u0430 \u0441\u043b\u043e\u0432\u0430 \u0438 \u0431\u0443\u043a\u0432\u044b: <span.w><span.ch style=--i>\u2026
  function chars(text) {
    let i = 0;
    return text.split(' ').map(w =>
      `<span class="w">${[...w].map(c => `<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join('')}</span>`
    ).join(' ');
  }
  const img = (im, alt, extra = '') =>
    `<img src="${im.src}" width="${im.w}" height="${im.h}" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`;

  /* \u2014\u2014\u2014 \u0422\u0451\u043c\u043d\u0430\u044f / \u0441\u0432\u0435\u0442\u043b\u0430\u044f \u0432\u0435\u0440\u0441\u0438\u044f (\u0432\u044b\u0431\u043e\u0440 \u0437\u0430\u043f\u043e\u043c\u0438\u043d\u0430\u0435\u0442\u0441\u044f \u0432 \u044d\u0442\u043e\u043c \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435) \u2014\u2014\u2014 */
  const modeBtn = $('.mode-toggle');
  function setMode(mode, save) {
    document.documentElement.dataset.mode = mode;
    modeBtn.setAttribute('aria-pressed', mode === 'light');
    $('.mode-label').textContent = mode === 'light' ? 'Dark' : 'Light';
    modeBtn.setAttribute('aria-label', mode === 'light' ? 'Switch to dark version' : 'Switch to light version');
    if (save) try { localStorage.setItem('z2h-mode', mode); } catch {}
  }
  let savedMode = 'dark';
  try { savedMode = localStorage.getItem('z2h-mode') || 'dark'; } catch {}
  setMode(savedMode, false);
  modeBtn.addEventListener('click', () => setMode(document.documentElement.dataset.mode === 'light' ? 'dark' : 'light', true));

  /* \u2014\u2014\u2014 Smooth scroll \u2014\u2014\u2014 */
  let lenis = null;
  let vel = 0;
  let lastY = scrollY;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', e => { vel = e.velocity; });
  }
  const scrollTo = (target, opts = {}) => {
    const el = typeof target === 'string' ? document.getElementById(target) : target;
    if (lenis) lenis.scrollTo(el ?? target, { duration: 1.4, ...opts });
    else if (typeof target === 'number') window.scrollTo(0, target);
    else el?.scrollIntoView({ behavior: opts.immediate ? 'auto' : 'smooth' });
  };

  const ticks = new Set();
  function frame(t) {
    if (lenis) lenis.raf(t);
    else { vel = lerp(vel, scrollY - lastY, 0.3); lastY = scrollY; }
    ticks.forEach(fn => fn(t));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  /* \u2014\u2014\u2014 Reveal on scroll \u2014\u2014\u2014 */
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  const observe = root => $$('.reveal, .reveal-img, .reveal-up', root).forEach(el => io.observe(el));

  // \u0426\u0432\u0435\u0442 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u043c\u0435\u043d\u044f\u0435\u0442\u0441\u044f \u043f\u043e \u0441\u0435\u043a\u0446\u0438\u0438 \u0432 \u0446\u0435\u043d\u0442\u0440\u0435 \u044d\u043a\u0440\u0430\u043d\u0430
  const themeIO = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) document.body.dataset.theme = e.target.dataset.theme;
  }, { rootMargin: '-50% 0px -50% 0px' });
  $$('#home [data-theme]').forEach(s => themeIO.observe(s));

  /* \u2014\u2014\u2014 Cursor \u2014\u2014\u2014 */
  const cursor = $('.cursor');
  const cursorLabel = $('.cursor-label');
  if (fine && !reduce) {
    document.documentElement.classList.add('has-cursor');
    const c = { x: mouse.x, y: mouse.y };
    ticks.add(() => {
      c.x = lerp(c.x, mouse.x, 0.22);
      c.y = lerp(c.y, mouse.y, 0.22);
      cursor.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
    });
    // \u041c\u0435\u0441\u0442\u0430, \u0433\u0434\u0435 \u043f\u043e\u0434 \u043a\u0443\u0440\u0441\u043e\u0440\u043e\u043c \u043e\u0440\u0430\u043d\u0436\u0435\u0432\u044b\u0439 \u0444\u043e\u043d (\u0441\u0442\u0440\u043e\u043a\u0438 \u0437\u0430\u043b\u0438\u0432\u0430\u044e\u0442\u0441\u044f \u0438\u043c \u043f\u0440\u0438 \u043d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0438):
    // \u0442\u0430\u043c \u043a\u0440\u0443\u0433\u0443 \u043d\u0443\u0436\u043d\u0430 \u0442\u0435\u043d\u044c, \u0438\u043d\u0430\u0447\u0435 \u043e\u043d \u0441\u043b\u0438\u0432\u0430\u0435\u0442\u0441\u044f. \u041f\u043b\u0438\u0442\u043a\u0438 \u043d\u0435 \u0432 \u0441\u043f\u0438\u0441\u043a\u0435 \u2014 \u043f\u0440\u0438 \u043d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0438 \u043e\u043d\u0438 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u044e\u0442 \u0441\u0432\u043e\u0439 \u0446\u0432\u0435\u0442
    const ACCENT_AREAS = '.row, .shop, .spec-inspector, #about';
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('[data-cursor]');
      cursor.classList.toggle('is-label', !!t);
      cursor.classList.toggle('on-accent', !!e.target.closest(ACCENT_AREAS));
      if (t) cursorLabel.textContent = t.dataset.cursor;
    });
    addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  }

  /* \u2014\u2014\u2014 Floating hover preview (\u0441\u043f\u0438\u0441\u043e\u043a \u0440\u0430\u0431\u043e\u0442, \u0448\u0440\u0438\u0444\u0442\u044b, \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u043f\u0440\u043e\u0435\u043a\u0442) \u2014\u2014\u2014 */
  const preview = $('.preview');
  const pInner = $('.preview-inner');
  const pv = { x: mouse.x, y: mouse.y, r: 0, z: 1, imgs: new Map() };
  function showPreview(src) {
    if (!fine) return;
    let el = pv.imgs.get(src);
    if (!el && src.startsWith('plate:')) {
      // \u0428\u0440\u0438\u0444\u0442: \u0432\u043c\u0435\u0441\u0442\u043e \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0438 \u2014 \u0446\u0432\u0435\u0442\u043d\u0430\u044f \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u0441 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435\u043c, \u043d\u0430\u0431\u0440\u0430\u043d\u043d\u044b\u043c \u0441\u0430\u043c\u0438\u043c \u0448\u0440\u0438\u0444\u0442\u043e\u043c
      const p = FONTS_ALL.find(f => f.slug === src.slice(6));
      el = document.createElement('div');
      el.className = 'preview-plate';
      el.innerHTML = facePlate(p);
      pInner.append(el); pv.imgs.set(src, el);
      refitPlates(el);
    }
    if (!el && src.startsWith('cover:')) {
      // Живая обложка проекта (Roll): та же, что в сетке
      el = document.createElement('div');
      el.className = 'preview-plate';
      pInner.append(el); pv.imgs.set(src, el);
    }
    // Анимация обложки каждый раз проигрывается заново
    if (el && src.startsWith('cover:')) el.innerHTML = (window.PROTOS?.[src.slice(6)]?.bentoCover || window.COVERS[src.slice(6)])();
    if (!el) { el = new Image(); el.src = src; el.alt = ''; pInner.append(el); pv.imgs.set(src, el); }
    el.style.zIndex = ++pv.z;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    preview.classList.add('on');
  }
  const hidePreview = () => preview.classList.remove('on');
  if (fine) ticks.add(() => {
    const px = pv.x;
    pv.x = lerp(pv.x, mouse.x, 0.12);
    pv.y = lerp(pv.y, mouse.y, 0.12);
    pv.r = lerp(pv.r, clamp((pv.x - px) * 0.9, -14, 14), 0.1);
    preview.style.transform = `translate3d(${pv.x}px, ${pv.y}px, 0) rotate(${pv.r}deg)`;
  });
  function bindPreviews(root) {
    $$('[data-preview]', root).forEach(el => {
      el.addEventListener('mouseenter', () => showPreview(el.dataset.preview));
      el.addEventListener('focus', () => showPreview(el.dataset.preview));
      el.addEventListener('mouseleave', hidePreview);
      el.addEventListener('blur', hidePreview);
    });
  }

  /* \u2014\u2014\u2014 Magnetic buttons \u2014\u2014\u2014 */
  function magnetic(el) {
    if (!fine) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
      el.style.transform = '';
      setTimeout(() => (el.style.transition = ''), 600);
    });
  }

  /* \u2014\u2014\u2014 Pill switcher (\u043f\u043e\u0434\u043b\u043e\u0436\u043a\u0430 \u0435\u0437\u0434\u0438\u0442 \u043f\u043e\u0434 \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u043c \u043f\u0443\u043d\u043a\u0442\u043e\u043c) \u2014\u2014\u2014 */
  function movePill(pill, active) {
    const bg = $('.pill-bg', pill);
    $$(':scope > a, :scope > button', pill).forEach(b => b.classList.toggle('is-active', b === active));
    if (!active) { bg.style.width = '0px'; return; }
    bg.style.width = active.offsetWidth + 'px';
    bg.style.transform = `translateX(${active.offsetLeft}px)`;
    // \u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0430\u0442\u0435\u043b\u044c \u0448\u0438\u0440\u0435 \u044d\u043a\u0440\u0430\u043d\u0430 \u2014 \u0434\u043e\u043a\u0440\u0443\u0447\u0438\u0432\u0430\u0435\u043c \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u044b\u0439 \u043f\u0443\u043d\u043a\u0442 \u0432 \u0441\u0435\u0440\u0435\u0434\u0438\u043d\u0443
    if (pill.scrollWidth > pill.clientWidth + 2) pill.scrollTo({ left: active.offsetLeft - (pill.clientWidth - active.offsetWidth) / 2, behavior: 'smooth' });
  }

  /* \u2014\u2014\u2014 Lightbox \u2014\u2014\u2014 */
  const lb = $('.lb');
  const lbImg = $('.lb-img');
  const lbState = { list: [], i: 0, from: null };
  function lbShow() {
    const im = lbState.list[lbState.i];
    lbImg.src = im.src;
    lbImg.alt = im.alt || '';
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    $('.lb-count').textContent = `${pad(lbState.i + 1)} / ${pad(lbState.list.length)}`;
    const many = lbState.list.length > 1;
    $('.lb-prev').hidden = $('.lb-next').hidden = !many;
  }
  function openLB(list, i) {
    if (!list?.length) return;
    Object.assign(lbState, { list, i, from: document.activeElement });
    lb.hidden = false;
    lenis?.stop();
    lbShow();
    $('.lb-close').focus();
  }
  function closeLB() {
    lb.hidden = true;
    lenis?.start();
    lbState.from?.focus?.({ preventScroll: true });
  }
  const lbStep = d => { lbState.i = (lbState.i + d + lbState.list.length) % lbState.list.length; lbShow(); };
  $('.lb-close').onclick = closeLB;
  $('.lb-prev').onclick = () => lbStep(-1);
  $('.lb-next').onclick = () => lbStep(1);
  lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });

  /* \u2014\u2014\u2014 Loader \u2014\u2014\u2014 */
  const loader = $('.loader');
  $('.loader-word').innerHTML = chars('ZERO TOO HERO');
  document.body.classList.add('is-loading');
  function runLoader(done) {
    if (reduce) { loader.remove(); document.body.classList.remove('is-loading'); done(); return; }
    // \u0416\u0434\u0451\u043c \u0442\u043e\u043b\u044c\u043a\u043e \u0448\u0440\u0438\u0444\u0442\u044b \u0441\u0430\u0439\u0442\u0430: \u043d\u0435 \u043c\u0435\u043d\u044c\u0448\u0435 MIN (\u0447\u0442\u043e\u0431\u044b \u0430\u043d\u0438\u043c\u0430\u0446\u0438\u044f \u0443\u0441\u043f\u0435\u043b\u0430), \u043d\u0435 \u0434\u043e\u043b\u044c\u0448\u0435 MAX
    const MIN = 1900, MAX = 3200; // не меньше одного полного прохода волны по надписи
    let ready = false;
    document.fonts.ready.then(() => (ready = true));
    const start = performance.now();
    const count = $('.loader-count');
    let doneAt = null, finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      ticks.delete(tick);
      count.textContent = '100';
      // Без чёрной паузы: шторка с надписью уезжает вверх, и в это же время на первом экране встаёт ZERO too HERO
      loader.classList.add('done');
      document.body.classList.remove('is-loading');
      setTimeout(done, 120);
      setTimeout(() => loader.remove(), 1400);
    };
    // \u0421\u0447\u0451\u0442\u0447\u0438\u043a \u0441\u0447\u0438\u0442\u0430\u0435\u0442 \u043f\u043e \u0432\u0440\u0435\u043c\u0435\u043d\u0438, \u0430 \u043d\u0435 \u043f\u043e \u043a\u0430\u0434\u0440\u0430\u043c: \u043d\u0435 \u0442\u043e\u0440\u043c\u043e\u0437\u0438\u0442, \u0435\u0441\u043b\u0438 \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u0440\u0435\u0436\u0435 \u0440\u0438\u0441\u0443\u0435\u0442
    const tick = t => {
      const el = t - start;
      if (doneAt === null && ((ready && el >= MIN) || el >= MAX)) doneAt = t;
      const pct = doneAt === null ? Math.min(90, (el / MIN) * 90) : Math.min(100, 90 + ((t - doneAt) / 250) * 10);
      count.textContent = String(Math.round(pct)).padStart(3, '0');
      if (pct >= 100) finish();
    };
    ticks.add(tick);
    setTimeout(finish, MAX + 500); // \u0441\u0442\u0440\u0430\u0445\u043e\u0432\u043a\u0430, \u0435\u0441\u043b\u0438 \u0432\u043a\u043b\u0430\u0434\u043a\u0430 \u0432 \u0444\u043e\u043d\u0435 \u0438 \u043a\u0430\u0434\u0440\u044b \u043d\u0435 \u0440\u0438\u0441\u0443\u044e\u0442\u0441\u044f
  }

  /* \u2014\u2014\u2014 Hero \u2014\u2014\u2014 */
  $$('.hl-word').forEach(el => (el.innerHTML = chars(el.dataset.word)));
  $('.hero-stats').textContent =
    `[ ${P.length} projects \u00b7 ${D.logos.length} logo collections \u00b7 ${D.fonts.custom.fonts.length + LIB.length} typefaces ]`;
  const heroChars = $$('.hero-title .ch').map(el => ({ el, w: 1000, s: 100 }));
  const hl1 = $('.hl-1');
  const hl2 = $('.hl-2');
  const badgeSvg = $('.badge svg');
  let badgeA = 0, badgeBoost = 0;
  let badgeArrow = null;
  const badgeChars = [];
  const badge0 = $('.badge');
  let heroHover = false;
  $('.hero').addEventListener('pointerenter', () => (heroHover = true));
  $('.hero').addEventListener('pointerleave', () => (heroHover = false));
  ticks.add(() => {
    if ($('#home').hidden) return;
    const y = scrollY;
    if (y < innerHeight * 1.3) {
      if (!reduce) {
        hl1.style.transform = `translate3d(${-y * 0.35}px, 0, 0)`;
        hl2.style.transform = `translate3d(${y * 0.35}px, 0, 0)`;
      }
      // \u0411\u0443\u043a\u0432\u044b \u0440\u044f\u0434\u043e\u043c \u0441 \u043a\u0443\u0440\u0441\u043e\u0440\u043e\u043c \u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0442\u0441\u044f \u0442\u043e\u043d\u043a\u0438\u043c\u0438 \u0438 \u0448\u0438\u0440\u043e\u043a\u0438\u043c\u0438
      if (fine && !reduce) for (const h of heroChars) {
        let tw = 1000, ts = 100;
        if (heroHover) {
          const r = h.el.getBoundingClientRect();
          const d = Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2));
          const k = clamp(1 - d / (innerWidth * 0.28), 0, 1) ** 1.6;
          tw = 1000 - k * 880; ts = 100;
        }
        h.w = lerp(h.w, tw, 0.12); h.s = lerp(h.s, ts, 0.12);
        h.el.style.fontWeight = h.w.toFixed(0);
        h.el.style.fontStretch = h.s.toFixed(1) + '%';
      }
    }
    if (!reduce) {
      // Надпись всегда крутится с одной скоростью; при наведении по ней бежит волна — буквы по очереди увеличиваются
      badgeBoost += ((badge0.classList.contains('is-hot') ? 1 : 0) - badgeBoost) * 0.06;
      badgeA += 0.12 + Math.abs(vel) * 0.25;
      badgeSvg.style.transform = `rotate(${badgeA}deg)`;
      // Буквы увеличиваются там, куда смотрит стрелка: берём её текущий угол (с пружинкой) и угол каждой буквы на экране
      let dir = 0;
      if (badgeBoost > 0.002) {
        const m = getComputedStyle(badgeArrow).transform;
        if (m && m !== 'none') { const v = m.match(/-?[\d.e]+/g).map(Number); dir = Math.atan2(v[1], v[0]) * 180 / Math.PI + 45; }
      }
      for (let i = 0; i < badgeChars.length; i++) {
        const c = badgeChars[i];
        const at = Math.atan2(c.x - 100, 100 - c.y) * 180 / Math.PI + badgeA;      // угол буквы по часовой от 12 часов
        const d = ((at - dir) % 360 + 540) % 360 - 180;
        const s = 1 + badgeBoost * 0.75 * Math.max(0, Math.cos(d * Math.PI / 180)) ** 14;
        if (Math.abs(s - c.s) < 0.004) continue;
        c.s = s;
        c.el.setAttribute('transform', `translate(${c.x.toFixed(2)} ${c.y.toFixed(2)}) rotate(${c.r.toFixed(1)}) scale(${s.toFixed(3)})`);
      }
    }
  });
  $('.badge').addEventListener('click', () => scrollTo('branding'));
  // \u041a\u0440\u0443\u0433\u043b\u0430\u044f \u043d\u0430\u0434\u043f\u0438\u0441\u044c \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u0430 \u043d\u0430\u0435\u0437\u0436\u0430\u0442\u044c \u043d\u0430 \u00abZERO HERO\u00bb: \u0441\u0442\u0430\u0432\u0438\u043c \u0435\u0451 \u0432 \u0441\u0432\u043e\u0431\u043e\u0434\u043d\u043e\u0435 \u043c\u0435\u0441\u0442\u043e \u0441\u043f\u0440\u0430\u0432\u0430 \u043e\u0442 ZERO,
  // \u0430 \u0435\u0441\u043b\u0438 \u043c\u0435\u0441\u0442\u0430 \u043c\u0430\u043b\u043e \u2014 \u0432 \u043f\u0440\u0430\u0432\u044b\u0439 \u0432\u0435\u0440\u0445\u043d\u0438\u0439 \u0443\u0433\u043e\u043b \u043d\u0430\u0434 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u043e\u043c
  function placeBadge() {
    const badge = $('.badge'), hero = $('.hero'), word = $('.hl-1 .hl-word');
    if (!badge || !word) return;
    badge.style.left = badge.style.top = badge.style.right = '';
    // \u041a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u044b \u0441\u043b\u043e\u0432\u0430 ZERO \u0432\u043d\u0443\u0442\u0440\u0438 \u043f\u0435\u0440\u0432\u043e\u0433\u043e \u044d\u043a\u0440\u0430\u043d\u0430 (\u0431\u0435\u0437 \u0443\u0447\u0451\u0442\u0430 \u0441\u0434\u0432\u0438\u0433\u0430 \u043f\u0440\u0438 \u043f\u0440\u043e\u043a\u0440\u0443\u0442\u043a\u0435)
    let x = 0, y = 0, el = word;
    while (el && el !== hero) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
    if (el !== hero) return;
    const w = badge.offsetWidth, gut = parseFloat(getComputedStyle(hero).paddingRight) || 20;
    const right = x + word.offsetWidth, space = hero.clientWidth - gut - right;
    if (space > w + 32) {
      badge.style.left = `${right + (space - w) / 2}px`;
      badge.style.top = `${y + (word.offsetHeight - w) / 2}px`;
    } else {
      badge.style.left = 'auto';
      badge.style.right = gut + 'px';
      badge.style.top = `${Math.max(80, y - w - 16)}px`;
    }
  }
  document.fonts.ready.then(placeBadge);

  /* \u2014\u2014\u2014 Marquee: \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u0438 \u043d\u0430\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u0437\u0430\u0432\u0438\u0441\u044f\u0442 \u043e\u0442 \u0441\u043a\u0440\u043e\u043b\u043b\u0430 \u2014\u2014\u2014 */
  const track = $('.marquee-track');
  const mqHTML = P.map(p => `<span class="marquee-item"><span class="mq-text">${esc(nameOf(p))}</span><span class="mq-star">${starSVG()}</span></span>`).join('');
  track.innerHTML = mqHTML + mqHTML;
  let mqX = 0, mqDir = -1, mqSkew = 0;
  // \u0421\u0442\u0440\u043e\u043a\u0443 \u043c\u043e\u0436\u043d\u043e \u0442\u044f\u043d\u0443\u0442\u044c \u043c\u044b\u0448\u044c\u044e \u0438\u043b\u0438 \u043f\u0430\u043b\u044c\u0446\u0435\u043c (\u043a\u0430\u043a \u0441\u0432\u0430\u0439\u043f); \u043f\u043e\u0441\u043b\u0435 \u043e\u0442\u043f\u0443\u0441\u043a\u0430\u043d\u0438\u044f \u043e\u043d\u0430 \u043a\u0430\u0442\u0438\u0442\u0441\u044f \u043f\u043e \u0438\u043d\u0435\u0440\u0446\u0438\u0438
  const mq = { drag: false, x: 0, v: 0, fling: 0 };
  const marquee = $('.marquee');
  marquee.addEventListener('pointerdown', e => { mq.drag = true; mq.x = e.clientX; mq.v = 0; marquee.setPointerCapture(e.pointerId); marquee.classList.add('is-drag'); });
  marquee.addEventListener('pointermove', e => { if (!mq.drag) return; const dx = e.clientX - mq.x; mq.x = e.clientX; mqX += dx; mq.v = dx; });
  const release = () => { if (!mq.drag) return; mq.drag = false; mq.fling = mq.v; if (Math.abs(mq.v) > 1) mqDir = mq.v > 0 ? 1 : -1; marquee.classList.remove('is-drag'); };
  marquee.addEventListener('pointerup', release);
  marquee.addEventListener('pointercancel', release);
  ticks.add(() => {
    if (home.hidden || reduce) return;
    if (Math.abs(vel) > 0.3) mqDir = vel > 0 ? -1 : 1;
    if (!mq.drag) { mqX += mqDir * (0.8 + Math.abs(vel) * 0.6) + mq.fling; mq.fling *= 0.94; }
    const half = track.scrollWidth / 2;
    if (half > 0) { if (mqX < -half) mqX += half; if (mqX > 0) mqX -= half; }
    // \u041d\u0430\u043a\u043b\u043e\u043d \u0441\u0438\u043b\u044c\u043d\u0435\u0435: \u043e\u0442 \u043f\u0440\u043e\u043a\u0440\u0443\u0442\u043a\u0438 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u0438 \u043e\u0442 \u0440\u044b\u0432\u043a\u0430 \u0440\u0443\u043a\u043e\u0439
    const push = -vel * 1.8 - (mq.drag ? mq.v : mq.fling) * 0.9;
    mqSkew = lerp(mqSkew, clamp(push, -28, 28), 0.12);
    track.style.transform = `translate3d(${mqX}px, 0, 0) skewX(${mqSkew}deg)`;
  });

  /* \u2014\u2014\u2014 Section titles \u2014\u2014\u2014 */
  const FONTS_ALL = [...FP, ...LIB];
  // Вкладки шрифтов: Commercial — заданный список, Type library — все остальные (кастомные проекты + библиотека)
  const COMMERCIAL = ['font-sts_sans_', 'font-neo-duplicate', 'lib-drunk-cherry', 'lib-hbttt', 'font-premium', 'font-shock', 'font-pl_grotesque', 'font-comedy', 'font-lovely'];
  const COMM = COMMERCIAL.map(s => FONTS_ALL.find(p => p.slug === s)).filter(Boolean);
  const LIBRARY = FONTS_ALL.filter(p => !COMM.includes(p));
  const counts = { Branding: P.length, Logos: LOGOS.length, Fonts: FONTS_ALL.length };
  $$('.sec-title').forEach(h => {
    const t = h.dataset.title;
    h.innerHTML = chars(t.toUpperCase()) + (counts[t] ? `<sup>(${counts[t]})</sup>` : '');
  });
  // \u041a\u0430\u043a \u043d\u0430 \u00abZERO HERO\u00bb: \u0442\u043e\u043d\u044c\u0448\u0435 \u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0442\u0441\u044f \u0442\u043e\u043b\u044c\u043a\u043e \u0431\u0443\u043a\u0432\u044b \u0440\u044f\u0434\u043e\u043c \u0441 \u043a\u0443\u0440\u0441\u043e\u0440\u043e\u043c (\u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0438 \u0440\u0430\u0437\u0434\u0435\u043b\u043e\u0432 \u0438 \u00abLet\u2019s talk\u00bb)
  if (fine && !reduce) $$('.sec-title, .big-link').forEach(h => {
    const st = { hover: false, idle: true, chars: $$('.ch', h).map(el => ({ el, w: 1000 })) };
    // \u0411\u0443\u043a\u0432\u044b \u043c\u043e\u0433\u0443\u0442 \u043f\u043e\u044f\u0432\u0438\u0442\u044c\u0441\u044f \u043f\u043e\u0437\u0436\u0435 (\u0443 \u00abLet\u2019s talk\u00bb \u0438\u0445 \u0441\u043e\u0431\u0438\u0440\u0430\u0435\u0442 \u043a\u043e\u0434 \u043d\u0438\u0436\u0435) \u2014 \u0431\u0435\u0440\u0451\u043c \u0438\u0445 \u043f\u0440\u0438 \u043f\u0435\u0440\u0432\u043e\u043c \u043d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0438
    h.addEventListener('pointerenter', () => { if (!st.chars.length) st.chars = $$('.ch', h).map(el => ({ el, w: 1000 })); st.hover = true; st.idle = false; });
    h.addEventListener('pointerleave', () => (st.hover = false));
    ticks.add(() => {
      if (st.idle) return;
      const radius = Math.max(h.offsetHeight * 1.4, innerWidth * .16);
      let moving = false;
      for (const c of st.chars) {
        let tw = 1000;
        if (st.hover) {
          const r = c.el.getBoundingClientRect();
          const k = clamp(1 - Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2)) / radius, 0, 1) ** 1.6;
          tw = 1000 - k * 880;
        }
        c.w = lerp(c.w, tw, 0.12);
        if (Math.abs(c.w - tw) > 1) moving = true;
        c.el.style.transitionProperty = 'opacity, transform';
        c.el.style.fontWeight = c.w.toFixed(0);
      }
      // \u041a\u0443\u0440\u0441\u043e\u0440 \u0443\u0448\u0451\u043b \u0438 \u0431\u0443\u043a\u0432\u044b \u0432\u0435\u0440\u043d\u0443\u043b\u0438\u0441\u044c \u2014 \u043e\u0442\u0434\u0430\u0451\u043c \u043d\u0430\u0447\u0435\u0440\u0442\u0430\u043d\u0438\u0435 \u043e\u0431\u0440\u0430\u0442\u043d\u043e \u0441\u0442\u0438\u043b\u044f\u043c
      if (!st.hover && !moving) { st.idle = true; st.chars.forEach(c => { c.el.style.fontWeight = ''; c.el.style.transitionProperty = ''; }); }
    });
  });

  /* \u2014\u2014\u2014 Work: list + grid \u2014\u2014\u2014 */
  $('.work-list').innerHTML = P.map((p, i) => `
    <li><a class="row" href="#p-${p.slug}"${BRAND[p.slug] ? ` style="--accent:${BRAND[p.slug]}"` : ''} data-cursor="View" data-preview="${window.PROTOS?.[p.slug]?.bentoCover || window.COVERS?.[p.slug] ? `cover:${p.slug}` : p.thumb}">
      <span class="mono">${pad(i + 1)}</span>
      <span class="row-title roll">${chars(nameOf(p))}</span>
      <span class="row-kind mono">${esc(kindOf(p))}</span>
      <span class="row-arrow" aria-hidden="true">\u2192</span>
    </a></li>`).join('');

  // \u0426\u0432\u0435\u0442\u043d\u0430\u044f \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0430 \u0440\u0430\u0441\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043a\u0440\u0443\u0433\u043e\u043c \u0438\u0437 \u0442\u043e\u0447\u043a\u0438, \u0433\u0434\u0435 \u043a\u0443\u0440\u0441\u043e\u0440 \u0432\u043e\u0448\u0451\u043b \u0432 \u043f\u043b\u0438\u0442\u043a\u0443 (\u043f\u0440\u043e\u0435\u043a\u0442\u044b \u0438 \u043b\u043e\u0433\u043e\u0442\u0438\u043f\u044b)
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('.tile, .logo, .logo-shot');
    if (!t || t.contains(e.relatedTarget)) return;
    const r = (t.querySelector('.tile-media') || t).getBoundingClientRect();
    t.style.setProperty('--x', `${e.clientX - r.left}px`);
    t.style.setProperty('--y', `${e.clientY - r.top}px`);
  });
  $('.work-list').addEventListener('mouseleave', hidePreview);

  /* \u2014\u2014\u2014 Logos \u2014\u2014\u2014 */
  const tabs = $('.logo-tabs');
  const logoGrid = $('.logo-grid');
  tabs.insertAdjacentHTML('beforeend', D.logos.map((g, i) =>
    `<button type="button" role="tab" data-tab="${i}">${esc(g.title.replace('Logo ', ''))}<sup>${g.images.length}</sup></button>`).join(''));
  function showLogos(i) {
    const g = D.logos[i];
    movePill(tabs, $(`[data-tab="${i}"]`, tabs));
    $$('[role=tab]', tabs).forEach(b => b.setAttribute('aria-selected', b.dataset.tab == i));
    logoGrid.classList.remove('in');
    logoGrid.innerHTML = g.images.map((im, j) =>
      `<button type="button" class="logo" style="--i:${j}" data-j="${j}" data-cursor="Zoom" aria-label="Open logo ${j + 1}">${img(im, '', 'class="duo"')}${img(im, `${g.title}, logo ${j + 1}`, 'class="full"')}</button>`).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => logoGrid.classList.add('in')));
    lenis?.resize();
  }
  $$('[data-tab]', tabs).forEach(b => b.addEventListener('click', () => showLogos(+b.dataset.tab)));
  logoGrid.addEventListener('click', e => {
    const b = e.target.closest('.logo');
    if (!b) return;
    const g = D.logos[+$('.is-active', tabs).dataset.tab];
    openLB(g.images.map((im, j) => ({ src: im.src, alt: `${g.title}, logo ${j + 1}` })), +b.dataset.j);
  });

  /* \u2014\u2014\u2014 Fonts: \u043a\u0430\u0441\u0442\u043e\u043c\u043d\u044b\u0435 \u0448\u0440\u0438\u0444\u0442\u044b \u0438 Type library \u2014\u2014\u2014 */
  const fonts = D.fonts.custom.fonts;
  // \u041a\u0438\u0440\u0438\u043b\u043b\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u0448\u0440\u0438\u0444\u0442\u044b \u0431\u0435\u0437 \u043b\u0430\u0442\u0438\u043d\u0438\u0446\u044b \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u044e\u0442 \u043f\u0440\u0438 \u043d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0438 \u0440\u0443\u0441\u0441\u043a\u043e\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435
  // \u0418\u0441\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435: \u0448\u0440\u0438\u0444\u0442\u044b \u0431\u0435\u0437 \u043b\u0430\u0442\u0438\u043d\u0438\u0446\u044b \u043d\u0430 \u0441\u0432\u043e\u0435\u0439 \u043f\u043b\u0430\u0448\u043a\u0435 (\u0438 \u043f\u0440\u0438 \u0440\u0430\u0441\u043a\u0440\u044b\u0442\u0438\u0438) \u043f\u0438\u0448\u0443\u0442 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043a\u0438\u0440\u0438\u043b\u043b\u0438\u0446\u0435\u0439, \u0441\u0432\u043e\u0438\u043c \u0448\u0440\u0438\u0444\u0442\u043e\u043c.
  // \u0412 \u043f\u043e\u0434\u043f\u0438\u0441\u044f\u0445 \u0438 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430\u0445 \u0441\u0430\u0439\u0442\u0430 \u0443 \u043d\u0438\u0445 \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f \u043b\u0430\u0442\u0438\u043d\u0441\u043a\u0438\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044f
  const CYR_NAMES = { 'font-monastery': '\u041c\u043e\u043d\u0430\u0441\u0442\u044b\u0440\u044c', 'font-harvest': '\u0425\u0430\u0440\u0432\u0435\u0441\u0442', 'lib-slovo': '\u0421\u043b\u043e\u0432\u043e' };
  const listFace = (slug, name) => {
    const S = SPEC[slug];
    if (!S) return null;
    let text = covers(S, name) ? name : CYR_NAMES[slug];
    if (!text || !covers(S, text)) return null;
    text = caseFor(S, text);
    // \u041f\u043e \u043a\u0430\u043a\u043e\u0439 \u043f\u0440\u043e\u043f\u0438\u0441\u043d\u043e\u0439 \u043c\u0435\u0440\u0438\u0442\u044c \u0432\u044b\u0441\u043e\u0442\u0443: \u043b\u0430\u0442\u0438\u043d\u0441\u043a\u0430\u044f H \u0438\u043b\u0438 \u043a\u0438\u0440\u0438\u043b\u043b\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u041d
    return { ...S.styles[S.default], text, capChar: S.cmap.includes('H') ? 'H' : '\u041d' };
  };
  const fontRow = ({ slug, name, about, preview }, i) => {
    const face = listFace(slug, name);
    const brand = BRAND[slug] ? `--accent:${BRAND[slug]}; --nc:${BRAND[slug]};` : '';
    const attrs = (face ? `class="frow has-face" style="--face:'${face.family}'; ${brand}"` : `class="frow"${brand ? ` style="${brand}"` : ''}`)
      + (window.COVERS?.[slug] ? ` data-preview="cover:${slug}"` : SPEC[slug] ? ` data-preview="plate:${slug}"` : preview ? ` data-preview="${preview}"` : '');
    return `
    <li><a ${attrs} href="#p-${slug}" data-slug="${slug}" data-name="${esc(name)}" data-cursor="View">
      <span class="mono">${pad(i + 1)}</span>
      <span class="fname"${SPEC[slug]?.tweak?.text ? ' style="text-transform:none"' : ''}>${face
        ? `<span class="fn-base">${esc(name)}</span><span class="fn-face" aria-hidden="true"><span>${esc(face.text)}</span></span>`
        : esc(name)}</span>
      <span class="fabout mono">${esc(about)}</span>
    </a></li>`;
  };
  const rowOf = p => ({ slug: p.slug, name: p.name, about: p.about, preview: SPEC[p.slug] ? null : fonts.find(f => f.project?.slug === p.slug)?.image?.src });
  $('.font-list').innerHTML = COMM.map((p, i) => fontRow(rowOf(p), i)).join('');
  $('.lib-list').innerHTML = LIBRARY.map((p, i) => fontRow(rowOf(p), i)).join('');
  $('.lib-count').textContent = LIBRARY.length;
  // \u041f\u043e\u0434\u0433\u043e\u043d\u044f\u0435\u043c \u0441\u0432\u043e\u0439 \u0448\u0440\u0438\u0444\u0442 \u043a \u0448\u0440\u0438\u0444\u0442\u0443 \u0441\u0430\u0439\u0442\u0430: \u0442\u0430 \u0436\u0435 \u0432\u044b\u0441\u043e\u0442\u0430 \u043f\u0440\u043e\u043f\u0438\u0441\u043d\u044b\u0445 \u0438 \u0442\u043e\u0442 \u0436\u0435 \u0446\u0435\u043d\u0442\u0440 \u043f\u043e \u0432\u0435\u0440\u0442\u0438\u043a\u0430\u043b\u0438.
  // \u041c\u0435\u0440\u044f\u0435\u043c \u043d\u0430 canvas: \u0432\u044b\u0441\u043e\u0442\u0443 \u00abH\u00bb \u0438 \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0431\u0430\u0437\u043e\u0432\u043e\u0439 \u043b\u0438\u043d\u0438\u0438 \u043f\u0440\u0438 line-height: 1
  const measureCtx = document.createElement('canvas').getContext('2d');
  function capBox(font, ch = 'H') {
    measureCtx.font = font;
    const m = measureCtx.measureText(ch);
    const baseline = (100 - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
    return { cap: m.actualBoundingBoxAscent, center: baseline - m.actualBoundingBoxAscent / 2 };
  }
  async function fitFaces(list) {
    await document.fonts.ready;
    const base = capBox('1000 100px "Circle VF"');
    for (const row of $$('.frow.has-face, .nx.has-face', list)) {
      if (row.style.getPropertyValue('--fs')) continue;
      const st = listFace(row.dataset.slug, row.dataset.name);
      if (!(await loadFace(st))) continue;
      const face = capBox(`400 100px "${st.family}"`, st.capChar);
      if (!face.cap) continue;
      const scale = base.cap / face.cap;
      row.style.setProperty('--fs', scale.toFixed(3));
      row.style.setProperty('--fy', ((base.center - scale * face.center) / 100).toFixed(3));
    }
  }
  $$('.font-list, .lib-list').forEach(list => {
    list.addEventListener('pointerenter', () => fitFaces(list), { once: true });
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { fitFaces(list); o.disconnect(); } }, { rootMargin: '400px' }).observe(list);
    list.addEventListener('mouseleave', hidePreview);
  });

  $('.custom-count').textContent = COMM.length;

  /* \u2014\u2014\u2014 Fonts: \u0432\u043a\u043b\u0430\u0434\u043a\u0438 Custom / Type library \u2014 \u043d\u0430 \u044d\u043a\u0440\u0430\u043d\u0435 \u043e\u0434\u0438\u043d \u0431\u043b\u043e\u043a \u0437\u0430 \u0440\u0430\u0437 \u2014\u2014\u2014 */
  const fontTabs = $('.font-tabs');
  function showFontTab(key) {
    movePill(fontTabs, $(`[data-ftab="${key}"]`, fontTabs));
    $$('[role=tab]', fontTabs).forEach(b => b.setAttribute('aria-selected', b.dataset.ftab === key));
    $$('.font-panel').forEach(p => {
      const on = p.dataset.panel === key;
      p.hidden = !on;
      p.classList.remove('in');
      if (on) requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('in')));
    });
    hidePreview();
    lenis?.resize();
  }
  $$('[data-ftab]', fontTabs).forEach(b => b.addEventListener('click', () => showFontTab(b.dataset.ftab)));


  /* \u2014\u2014\u2014 \u0416\u0438\u0432\u0430\u044f \u0441\u0435\u0442\u043a\u0430 \u043f\u043e\u0434 \u043a\u0430\u0436\u0434\u044b\u043c \u0440\u0430\u0437\u0434\u0435\u043b\u043e\u043c: \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438 \u0441\u0430\u043c\u0438 \u043c\u0435\u043d\u044f\u044e\u0442 \u0440\u0430\u0437\u043c\u0435\u0440 \u0438 \u043c\u0435\u0441\u0442\u043e,
     \u043e\u0434\u043d\u0430 \u0440\u0430\u0437\u0432\u043e\u0440\u0430\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u0432\u0441\u044e \u0441\u0435\u0442\u043a\u0443 \u0438 \u0441\u043d\u043e\u0432\u0430 \u0441\u043a\u043b\u0430\u0434\u044b\u0432\u0430\u0435\u0442\u0441\u044f (\u043a\u0430\u043a \u0432 \u0440\u0435\u0444\u0435\u0440\u0435\u043d\u0441\u0435) \u2014\u2014\u2014 */
  const fontImage = slug => D.fonts.custom.fonts.find(f => f.project?.slug === slug)?.image;
  const cover = (src, alt = '') => `<img src="${src}" alt="${esc(alt)}" decoding="async" draggable="false">`;
  const FACE_BG = ['var(--accent)', 'var(--paper)', '#ffd84d', '#9fb4ff', '#1d1d1d'];
  /* \u0426\u0432\u0435\u0442\u043d\u0430\u044f \u043f\u043b\u0430\u0448\u043a\u0430 \u0441 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435\u043c, \u043d\u0430\u0431\u0440\u0430\u043d\u043d\u044b\u043c \u0441\u0430\u043c\u0438\u043c \u0448\u0440\u0438\u0444\u0442\u043e\u043c. \u0428\u0438\u0440\u0438\u043d\u0430 \u043d\u0430\u0434\u043f\u0438\u0441\u0438 \u043c\u0435\u0440\u044f\u0435\u0442\u0441\u044f \u043f\u043e \u0448\u0440\u0438\u0444\u0442\u0443,
     \u0438 \u043a\u0435\u0433\u043b\u044c \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f \u0442\u0430\u043a, \u0447\u0442\u043e\u0431\u044b \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0432\u0441\u0435\u0433\u0434\u0430 \u043f\u043e\u043c\u0435\u0449\u0430\u043b\u043e\u0441\u044c \u0432 \u043f\u043b\u0430\u0448\u043a\u0443 \u043f\u0440\u0438 \u043b\u044e\u0431\u043e\u043c \u0435\u0451 \u0440\u0430\u0437\u043c\u0435\u0440\u0435 */
  // \u041c\u0435\u0440\u044f\u0435\u043c \u043d\u0430\u0441\u0442\u043e\u044f\u0449\u0435\u0439 \u0441\u0442\u0440\u043e\u043a\u043e\u0439 \u0432 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0435 (canvas \u043e\u0448\u0438\u0431\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u043a\u0435\u0440\u043d\u0438\u043d\u0433\u0435 \u0438 \u043d\u0435\u043a\u043e\u0442\u043e\u0440\u044b\u0445 \u0448\u0440\u0438\u0444\u0442\u0430\u0445)
  const plateProbe = document.createElement('span');
  plateProbe.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font-size:100px;line-height:1;font-weight:400;letter-spacing:0';
  document.body.append(plateProbe);
  function textWidthEm(family, text, weight = 400) {
    plateProbe.style.fontWeight = weight;
    plateProbe.style.fontFamily = `'${family}', sans-serif`;
    plateProbe.textContent = text;
    return Math.max(1, plateProbe.getBoundingClientRect().width / 100);
  }
  function plateOf(p) {
    const S = SPEC[p.slug];
    if (!S) return null;
    const i = FONTS_ALL.indexOf(p);
    const face = listFace(p.slug, nameOf(p));
    const bg = BRAND[p.slug] || FACE_BG[Math.max(0, i) % FACE_BG.length];
    const fg = bg === '#1d1d1d' ? 'var(--paper)' : 'var(--ink)';
    // \u0412 \u0448\u0440\u0438\u0444\u0442\u0435 \u043d\u0435\u0442 \u043b\u0430\u0442\u0438\u043d\u0438\u0446\u044b (Monastery, Harvest, Slovo): \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043d\u0430 \u043f\u043b\u0430\u0448\u043a\u0435 \u043f\u0438\u0448\u0435\u043c \u043b\u0430\u0442\u0438\u043d\u0438\u0446\u0435\u0439
    if (!face) return { family: null, text: nameOf(p), bg, fg };
    return { family: face.family, text: face.text, bg, fg, html: S.tweak?.plate, measure: S.tweak?.measure, bolder: S.tweak?.bolder };
  }
  // \u0426\u0432\u0435\u0442 \u043d\u0430\u0434\u043f\u0438\u0441\u0438 \u0448\u0440\u0438\u0444\u0442\u043e\u043c = \u0446\u0432\u0435\u0442 \u0435\u0433\u043e \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438; \u0441\u0432\u0435\u0442\u043b\u0430\u044f \u0438 \u0442\u0451\u043c\u043d\u0430\u044f \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438 \u0434\u0430\u043b\u0438 \u0431\u044b \u043d\u0435\u0432\u0438\u0434\u0438\u043c\u044b\u0439 \u0442\u0435\u043a\u0441\u0442 \u043d\u0430 \u0441\u0432\u043e\u0451\u043c \u0444\u043e\u043d\u0435 \u2014 \u0442\u043e\u0433\u0434\u0430 \u0446\u0432\u0435\u0442 \u0442\u0435\u043a\u0441\u0442\u0430 \u0441\u0430\u0439\u0442\u0430
  const plateInk = p => { const bg = plateOf(p)?.bg; return !bg || bg === '#1d1d1d' || bg === 'var(--paper)' ? 'var(--fg)' : bg; };
  // Буквы обложки по отдельности — чтобы по ним шла волна
  const plateLetters = t => [...t].map((c, i) => `<span class="lt" style="--i:${i}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
  // Начертания шрифта для волны насыщенности (у семейств с ширинами — только основная ширина)
  /* У каждого шрифта своё движение обложки — по смыслу заказчика.
     Шрифты с несколькими начертаниями двигаются насыщенностью (режим mode), остальные — CSS-эффектом (fx) */
  const PLATE_FX = {
    'font-sts_sans_': { mode: 'wave' },          // телеканал: эфирная волна насыщенности
    'font-fada': { mode: 'center' },             // бар: пульс от центра к краям, как басы
    'font-pl_grotesque': { mode: 'random' },     // дизайн-студия: буквы перебирают начертания вразнобой
    'lib-uport': { mode: 'stairs' },             // лесенка: каждая буква на ступень жирнее
    'lib-apatite': { mode: 'width' },            // семейство ширин: волна ширины
    'lib-borome': { mode: 'alt' },               // прямой / курсив через букву, меняются местами
    'lib-barbecue': { mode: 'alt' },             // Fat / Fat Inline через букву
    'font-neo-duplicate': { fx: 'flashlight' },  // Криминал: луч фонаря шарит по надписи
    'font-action': { fx: 'punch' },              // Экшн: удары, буквы влетают со смазом
    'font-premium': { fx: 'gold' },              // Премиум: блик по золоту, буквы неспешно раздвигаются
    'font-harvest': { fx: 'wheat' },             // ресторан Harvest: колосья качаются на ветру
    'font-comedy': { fx: 'jelly' },              // Комедия: буквы пружинят, как желе
    'font-lovely': { fx: 'heart' },              // для влюблённых: двойной удар сердца по буквам
    'font-shock': { fx: 'flicker' },             // ужасы: мигающая лампа и дрожь
    'font-slavyan': { fx: 'cards' },             // выставка современного искусства: буквы переворачиваются, как таблички
    'font-neo': { fx: 'charge' },                // электромобили: надпись заряжается, как батарея
    'font-monastery': { fx: 'candle' },          // монастырь: свеча, мягкое мерцание
    'font-khabensky': { fx: 'rise' },            // благотворительный фонд: буквы по очереди поднимаются
    'lib-hbttt': { fx: 'strike' }, 'lib-tattooist': { fx: 'type' }, 'lib-gameday': { fx: 'flap' },
    'lib-rock': { fx: 'shake' }, 'lib-robot': { fx: 'glitch' }, 'lib-drunk-cherry': { fx: 'drunk' },
    'lib-strike': { fx: 'strike' }, 'lib-transformer': { fx: 'ribbon' }, 'lib-wide': { fx: 'widen' },
    'lib-delgado': { fx: 'candle' }, 'lib-delgado-sans': { fx: 'rise' }, 'lib-nube': { fx: 'float' },
    'lib-sofya': { fx: 'ink' }, 'lib-bb-pass': { fx: 'flap' }, 'lib-letu': { fx: 'spin' },
    'lib-coree': { fx: 'drop' }, 'lib-fakk': { fx: 'shake' }, 'lib-master': { fx: 'cards' },
    'lib-piotr': { fx: 'step' }, 'lib-pike': { fx: 'slice' }, 'lib-slovo': { fx: 'type' },
    'lib-alberti': { fx: 'drop' }, 'lib-gruzi': { fx: 'jelly' },
  };
  const FX_POOL = ['drop', 'flap', 'step', 'slice', 'spin', 'stretch', 'float', 'rise'];
  const plateFx = (slug, i) => PLATE_FX[slug] || { fx: FX_POOL[Math.abs(i) % FX_POOL.length] };
  const plateFams = slug => {
    const S = SPEC[slug];
    if (!S || S.styles.length < 2) return null;
    const base = S.styles[S.default];
    if (PLATE_FX[slug]?.mode === 'width') {
      const order = S.widths || [];
      const fam = S.styles.filter(x => x.weightName === base.weightName).sort((a, b) => order.indexOf(a.width) - order.indexOf(b.width));
      return fam.length > 1 ? fam : null;
    }
    const fam = (S.widths || []).length > 1 ? S.styles.filter(x => x.width === base.width) : S.styles;
    return fam.length > 1 ? [...fam].sort((a, b) => (a.weight || 400) - (b.weight || 400)) : null;
  };
  function facePlate(p) {
    const pl = plateOf(p);
    if (!pl) { const im = fontImage(p.slug); return im ? cover(im.src) : `<span class="card-face">${esc(nameOf(p))}</span>`; }
    if (!pl.family) return `<span class="card-face is-site is-live" data-fx="${plateFx(p.slug, FONTS_ALL.indexOf(p)).fx || 'drop'}" style="background:${pl.bg}; color:${pl.fg}; --pbg:${pl.bg}; --pfg:${pl.fg}; --w:${textWidthEm('Circle VF', pl.text.toUpperCase(), 1000).toFixed(3)}; ${(([x, y]) => `--ix:${x.toFixed(3)}em; --iy:${y.toFixed(3)}em`)(inkOffset('Circle VF', pl.text.toUpperCase(), 1000))}"><span class="cf-t">${plateLetters(pl.text)}</span></span>`;
    const m = pl.measure || pl.text;
    const fams = !pl.html && plateFams(p.slug);
    const fx = plateFx(p.slug, FONTS_ALL.indexOf(p));
    return `<span class="card-face is-live${pl.bolder ? ' is-bolder' : ''}${fams ? ' has-fams' : ''}" ${fams ? `data-mode="${fx.mode || 'wave'}"` : `data-fx="${fx.fx || 'drop'}"`} data-family="${esc(pl.family)}" data-measure="${esc(m)}"${fams ? ` data-fams="${esc(fams.map(x => x.family).join('|'))}" data-slug="${p.slug}"` : ''} style="background:${pl.bg}; color:${pl.fg}; --pbg:${pl.bg}; --pfg:${pl.fg}; --w:${textWidthEm(pl.family, m).toFixed(3)}; font-family:'${pl.family}', var(--f-display)"><span class="cf-t">${pl.html || plateLetters(pl.text)}</span></span>`;
  }
  // \u041a\u043e\u0433\u0434\u0430 \u0448\u0440\u0438\u0444\u0442\u044b \u0434\u043e\u0433\u0440\u0443\u0437\u0438\u043b\u0438\u0441\u044c \u2014 \u043f\u0435\u0440\u0435\u043c\u0435\u0440\u044f\u0435\u043c \u043d\u0430\u0434\u043f\u0438\u0441\u0438 \u043d\u0430 \u0432\u0441\u0435\u0445 \u043f\u043b\u0430\u0448\u043a\u0430\u0445
  function refitPlates(root = document) {
    $$('.card-face[data-family]', root).forEach(f => {
      const fams = f.dataset.fams ? f.dataset.fams.split('|') : [f.dataset.family];
      f.style.setProperty('--w', Math.max(...fams.map(fm => textWidthEm(fm, f.dataset.measure || f.textContent))).toFixed(3));
      const [dx, dy] = inkOffset(f.dataset.family, f.dataset.measure || f.textContent);
      f.style.setProperty('--ix', dx.toFixed(3) + 'em'); f.style.setProperty('--iy', dy.toFixed(3) + 'em');
    });
  }  /* Обложка Format — по референсу «Energy in Motion»: слово лежит на горизонтальном барабане и делает полный оборот
     вокруг горизонтальной оси. Поворот идёт волной слева направо, строка закручивается спиралью: буквы уходят вверх и назад,
     проходят ребром, возвращаются снизу. Форма букв не меняется — только ракурс. Потом лёгкий наезд и пауза */
  {
    const ease = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const seg = (t, a, b) => ease(Math.min(1, Math.max(0, (t - a) / (b - a))));
    const CYCLE = 5600, START = 500, DUR = 1700, SPREAD = 900;
    const build = f => {
      const word = $$('.lt', f).map(l => l.textContent).join('');
      const ov = document.createElement('span');
      ov.className = 'fmx';
      ov.innerHTML = `<span class="fmx-ring"><span class="fmx-row">${[...word].map(c => `<span class="fmx-l">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</span></span>`;
      f.append(ov);
      f.classList.add('fmx-on');
      const ring = $('.fmx-ring', ov);
      const rr = ring.getBoundingClientRect();
      const L = $$('.fmx-l', ring).map(el => { const r = el.getBoundingClientRect(); return { el, x: r.left + r.width / 2 - (rr.left + rr.width / 2) }; });
      const xs = L.map(o => o.x), x0 = Math.min(...xs), span = (Math.max(...xs) - x0) || 1;
      L.forEach(o => { o.k = (o.x - x0) / span; });
      f._fm = { L, ring, R: rr.height * .62, w: f.offsetWidth };
    };
    const frame = now => {
      requestAnimationFrame(frame);
      if (reduce || document.hidden || home.hidden) return;
      $$('.card-face[data-fx="ribbon"]').forEach(f => {
        const r = f.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
        if (!f._t0) { f._t0 = now + 300; return; }
        if (now < f._t0) return;
        if (!f._fm || f._fm.w !== f.offsetWidth) { $('.fmx', f)?.remove(); f._fm = null; build(f); }
        const { L, ring, R } = f._fm;
        const t = (now - f._t0) % CYCLE;
        // наезд: после оборота слово медленно приближается, на следующем обороте возвращается
        const zoom = 1 + .07 * seg(t, START + DUR + SPREAD, CYCLE) * 1 + .07 * (1 - seg(t, 0, START + DUR)) * (now - f._t0 > CYCLE ? 1 : 0);
        ring.style.transform = `scale(${zoom.toFixed(4)})`;
        L.forEach(o => {
          const a = START + o.k * SPREAD;
          const p = seg(t, a, a + DUR);
          if (p <= 0 || p >= 1) { o.el.style.transform = ''; return; }
          const deg = p * 360;
          o.el.style.transform = `translateZ(${(-R).toFixed(1)}px) rotateX(${deg.toFixed(2)}deg) translateZ(${R.toFixed(1)}px)`;
        });
      });
    };
    requestAnimationFrame(frame);
  }
  /* Обложка Drunk Cherry: буквы хаотично меняют регистр. Смена — сдвигом в окне буквы:
     старая уезжает вверх, новая въезжает снизу, ширина плавно подстраивается */
  {
    const OUT = 200, IN = 320;
    const flip = l => {
      if (l._busy) return;
      l._busy = true;
      let inner = l.firstElementChild;
      if (!inner) { inner = document.createElement('span'); inner.className = 'dc'; inner.textContent = l.textContent; l.textContent = ''; l.append(inner); }
      const c = inner.textContent, next = c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
      const w0 = l.getBoundingClientRect().width;
      inner.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-1.25em)' }], { duration: OUT, easing: 'cubic-bezier(.55,0,.8,.2)', fill: 'forwards' })
        .finished.then(() => {
          inner.textContent = next;
          const w1 = l.getBoundingClientRect().width;
          l.animate([{ width: w0 + 'px' }, { width: w1 + 'px' }], { duration: IN, easing: 'cubic-bezier(.2,.9,.25,1)' });
          return inner.animate([{ transform: 'translateY(1.25em)' }, { transform: 'translateY(0)' }], { duration: IN, easing: 'cubic-bezier(.2,.9,.25,1)', fill: 'forwards' }).finished;
        })
        .then(() => { inner.getAnimations().forEach(x => x.cancel()); l._busy = false; }, () => { l._busy = false; });
    };
    setInterval(() => {
      if (reduce || document.hidden || home.hidden) return;
      $$('.card-face[data-fx="drunk"]').forEach(f => {
        const r = f.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
        const L = $$('.lt', f).filter(l => !l._busy && l.textContent.toUpperCase() !== l.textContent.toLowerCase());
        for (let n = 1 + (Math.random() < .5); n-- > 0 && L.length;) flip(L.splice(Math.random() * L.length | 0, 1)[0]);
      });
    }, 300);
  }
  /* Живые обложки шрифтов: по буквам бежит волна насыщенности — от самого светлого начертания к самому жирному и обратно.
     Тикаем только по обложкам, которые сейчас на экране; начертания догружаем, когда обложка впервые видна */
  {
    const famStyles = new Map();
    Object.values(SPEC).forEach(S => S.styles.forEach(st => famStyles.set(st.family, st)));
    let t = 0;
    setInterval(() => {
      if (reduce || document.hidden || home.hidden) return;
      t++;
      $$('.card-face.has-fams').forEach(f => {
        const r = f.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > innerHeight) return;
        const fams = f.dataset.fams.split('|');
        if (!f._ready) {
          if (!f._loading) f._loading = Promise.all(fams.map(fm => famStyles.get(fm) && loadFace(famStyles.get(fm)))).then(() => { f._ready = true; refitPlates(f.parentElement || f); });
          return;
        }
        const n = fams.length, L = $$('.lt', f), mode = f.dataset.mode;
        const seq = [...fams.keys(), ...[...fams.keys()].reverse().slice(1, -1)];   // 0 1 2 … n-1 … 1
        const at = k => seq[((k % seq.length) + seq.length) % seq.length];
        const mid = (L.length - 1) / 2;
        L.forEach((l, i) => {
          let k;
          if (mode === 'center') k = at(t - Math.round(Math.abs(i - mid) * 1.5));             // от центра к краям
          else if (mode === 'random') { if (t % 3) return; k = Math.floor(Math.random() * n); } // вразнобой, реже
          else if (mode === 'stairs') k = at(Math.floor(t / 4) + i);                            // лесенка ползёт
          else if (mode === 'alt') k = (i + Math.floor(t / 9)) % n;                             // через букву, перещёлкивается
          else k = at(t - i);                                                                   // волна
          l.style.fontFamily = `'${fams[k]}'`;
        });
      });
    }, 110);
  }

  /* \u041e\u043f\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0446\u0435\u043d\u0442\u0440: \u0443 \u0448\u0440\u0438\u0444\u0442\u043e\u0432 \u0440\u0430\u0437\u043d\u044b\u0435 \u0437\u0430\u043f\u0430\u0441\u044b \u0441\u0432\u0435\u0440\u0445\u0443 \u0438 \u0441\u043d\u0438\u0437\u0443, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u043f\u043e \u0440\u0430\u043c\u043a\u0435 \u0441\u0442\u0440\u043e\u043a\u0438 \u0431\u0443\u043a\u0432\u044b \u0441\u0442\u043e\u044f\u0442 \u043d\u0435 \u043f\u043e \u0446\u0435\u043d\u0442\u0440\u0443.
     \u041c\u0435\u0440\u044f\u0435\u043c, \u0433\u0434\u0435 \u0440\u0435\u0430\u043b\u044c\u043d\u043e \u043d\u0430\u0440\u0438\u0441\u043e\u0432\u0430\u043d\u044b \u0437\u043d\u0430\u043a\u0438, \u0438 \u0441\u0434\u0432\u0438\u0433\u0430\u0435\u043c \u043d\u0430\u0434\u043f\u0438\u0441\u044c \u0442\u0430\u043a, \u0447\u0442\u043e\u0431\u044b \u0446\u0435\u043d\u0442\u0440 \u0440\u0438\u0441\u0443\u043d\u043a\u0430 \u0441\u043e\u0432\u043f\u0430\u043b \u0441 \u0446\u0435\u043d\u0442\u0440\u043e\u043c \u043c\u0435\u0441\u0442\u0430 (\u0432 em) */
  const inkCtx = document.createElement('canvas').getContext('2d');
  function inkOffset(family, text, weight = 400) {
    inkCtx.font = `${weight} 100px '${family}', sans-serif`;
    const m = inkCtx.measureText(text);
    const base = (100 - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
    const dy = 50 - (base - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2);
    const dx = m.width / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
    return [dx / 100, dy / 100];
  }
  // Живые обложки: у проекта-подачи (PROTOS) или отдельная (COVERS — например, у шрифта)
  const liveCover = slug => window.PROTOS?.[slug]?.bentoCover || window.COVERS?.[slug];
  const BENTO = {
    branding: P.map(p => ({ slug: p.slug, name: nameOf(p), media: liveCover(p.slug)?.() || cover(p.thumb) })),
    // \u041b\u043e\u0433\u043e\u0442\u0438\u043f\u044b \u0442\u0440\u0451\u0445 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0439 \u0432\u043f\u0435\u0440\u0435\u043c\u0435\u0448\u043a\u0443; \u043a\u0430\u0436\u0434\u044b\u0439 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0441\u0432\u043e\u044e \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044e
    logos: (() => {
      const out = [], max = Math.max(...LOGOS.map(g => g.images.length));
      for (let k = 0; k < max; k++) LOGOS.forEach(g => g.images[k] && out.push({ slug: g.slug, name: nameOf(g), media: cover(g.images[k].src) }));
      return out;
    })(),
    fonts: FONTS_ALL.map(p => ({ slug: p.slug, name: nameOf(p), media: liveCover(p.slug)?.() || facePlate(p) })),
  };
  /* \u041a\u0430\u043a \u0432 \u0440\u0435\u0444\u0435\u0440\u0435\u043d\u0441\u0435: \u0441\u0435\u0442\u043a\u0430 \u2014 \u043e\u0434\u043d\u043e \u0446\u0435\u043b\u043e\u0435 \u0438\u0437 \u0432\u043b\u043e\u0436\u0435\u043d\u043d\u044b\u0445 \u0441\u0442\u0440\u043e\u043a \u0438 \u043a\u043e\u043b\u043e\u043d\u043e\u043a.
     \u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u0438\u0441\u0447\u0435\u0437\u0430\u0435\u0442 \u0438 \u043d\u0435 \u043f\u043e\u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0441\u0430\u043c\u043e \u043f\u043e \u0441\u0435\u0431\u0435: \u043d\u043e\u0432\u0430\u044f \u0433\u0440\u0443\u043f\u043f\u0430 \u0432\u044b\u0440\u0430\u0441\u0442\u0430\u0435\u0442 \u0438\u0437 \u043a\u0440\u0430\u044f,
     \u0438 \u0440\u043e\u0432\u043d\u043e \u043d\u0430\u0441\u0442\u043e\u043b\u044c\u043a\u043e \u0436\u0435 \u0441\u0436\u0438\u043c\u0430\u044e\u0442\u0441\u044f \u0441\u043e\u0441\u0435\u0434\u0438; \u043e\u0434\u043d\u0430 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u043c\u043e\u0436\u0435\u0442 \u0440\u0430\u0437\u0432\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u043d\u0430 \u0432\u0441\u0451 \u043f\u043e\u043b\u0435,
     \u0430 \u043f\u043e\u0442\u043e\u043c \u0441\u043d\u043e\u0432\u0430 \u043f\u043e\u0434\u0435\u043b\u0438\u0442\u044c\u0441\u044f. \u0410\u043d\u0438\u043c\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u0442\u043e\u043b\u044c\u043a\u043e flex-grow, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u0432\u0441\u0451 \u0441\u0432\u044f\u0437\u0430\u043d\u043e */
  const FLOW_MS = 850, HOLD_MS = 1700;
  const SCRIPT = [
    { op: 'split', dir: 'column', n: 2, w: 0.8 },          // \u043f\u043e\u0434 \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u0432\u044b\u0440\u0430\u0441\u0442\u0430\u0435\u0442 \u0440\u044f\u0434 \u0438\u0437 \u0434\u0432\u0443\u0445
    { op: 'push', dir: 'row', start: true, n: 1 },         // \u0441\u043b\u0435\u0432\u0430 \u0432\u044b\u0435\u0437\u0436\u0430\u0435\u0442 \u043d\u043e\u0432\u0430\u044f \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430, \u0441\u0442\u0430\u0440\u043e\u0435 \u0441\u0436\u0438\u043c\u0430\u0435\u0442\u0441\u044f \u0432\u043f\u0440\u0430\u0432\u043e
    { op: 'split', dir: 'row', n: 1, w: 0.9 },             // \u0441\u043f\u0440\u0430\u0432\u0430 \u0432\u044b\u0440\u0430\u0441\u0442\u0430\u0435\u0442 \u0441\u043e\u0441\u0435\u0434\u043d\u044f\u044f
    { op: 'split', dir: 'column', n: 1, w: 0.8, last: true },// \u043f\u0440\u0430\u0432\u0430\u044f \u0434\u0435\u043b\u0438\u0442\u0441\u044f, \u0441\u043d\u0438\u0437\u0443 \u0440\u0430\u0441\u0442\u0451\u0442 \u043d\u043e\u0432\u0430\u044f
    { op: 'focus', newest: true },                         // \u043d\u043e\u0432\u0430\u044f \u0440\u0430\u0437\u0432\u043e\u0440\u0430\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u0432\u0441\u0451 \u043f\u043e\u043b\u0435
    { op: 'split', dir: 'column', n: 2, w: 0.7 },          // \u0441\u043d\u0438\u0437\u0443 \u0432\u044b\u0440\u0430\u0441\u0442\u0430\u0435\u0442 \u043f\u0430\u0440\u0430
    { op: 'push', dir: 'column', n: 2 },                   // \u0441\u043d\u0438\u0437\u0443 \u043f\u043e\u0434\u043d\u0438\u043c\u0430\u0435\u0442\u0441\u044f \u043d\u043e\u0432\u0430\u044f \u0441\u0442\u0440\u043e\u043a\u0430, \u0441\u0442\u0430\u0440\u043e\u0435 \u0443\u0445\u043e\u0434\u0438\u0442 \u0432\u0432\u0435\u0440\u0445
    { op: 'focus' },                                       // \u0441\u0430\u043c\u0430\u044f \u043a\u0440\u0443\u043f\u043d\u0430\u044f \u2014 \u043d\u0430 \u0432\u0441\u0451 \u043f\u043e\u043b\u0435
  ];
  // \u0423\u0437\u043a\u0438\u0435 \u0432\u044b\u0441\u043e\u043a\u0438\u0435 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438 (\u0434\u0432\u0435-\u0442\u0440\u0438 \u0432\u0435\u0440\u0442\u0438\u043a\u0430\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u043b\u043e\u0441\u044b \u0432 \u0440\u044f\u0434) \u043f\u043b\u043e\u0445\u043e \u0447\u0438\u0442\u0430\u044e\u0442\u0441\u044f \u2014 \u0442\u0430\u043a\u0438\u0435 \u0448\u0430\u0433\u0438 \u043f\u0440\u043e\u043f\u0443\u0441\u043a\u0430\u0435\u043c
  const MIN_RATIO = 0.95, MAX_RATIO = 2.6;
  $$('[data-bento]').forEach(box => {
    const sec = box.closest('.shelf'), items = BENTO[box.dataset.bento];
    let ptr = 0, step = 0, hover = false, visible = false, busy = false, newest = null;
    const grow = (el, v) => (el.style.flexGrow = v);
    const tile = () => {
      const item = items[ptr++ % items.length];
      const el = document.createElement('a');
      el.className = 'bento-tile';
      el.href = `#p-${item.slug}`;
      el.dataset.cursor = 'Open';
      el.innerHTML = `<span class="card-media">${item.media}</span><span class="bento-cap"><b>${esc(item.name)}</b><i>${arrowSVG('\u2197')}</i></span>`;
      refitPlates(el); // \u0440\u0430\u0437\u043c\u0435\u0442\u043a\u0430 \u043f\u043b\u0430\u0448\u043a\u0438 \u0441\u043e\u0431\u0440\u0430\u043d\u0430 \u0437\u0430\u0440\u0430\u043d\u0435\u0435 \u2014 \u0448\u0438\u0440\u0438\u043d\u0443 \u043d\u0430\u0434\u043f\u0438\u0441\u0438 \u043c\u0435\u0440\u044f\u0435\u043c \u0437\u0430\u043d\u043e\u0432\u043e, \u043f\u043e \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043d\u043e\u043c\u0443 \u0448\u0440\u0438\u0444\u0442\u0443
      return el;
    };
    const group = (dir, kids, weights) => {
      const g = document.createElement('div');
      g.className = 'bento-group';
      g.style.flexDirection = dir;
      kids.forEach((k, i) => { grow(k, weights ? weights[i] : 1); g.append(k); });
      return g;
    };
    const pack = (dir, n) => {
      const kids = Array.from({ length: n }, tile);
      newest = kids[kids.length - 1];
      return n === 1 ? kids[0] : group(dir, kids, kids.map(() => (0.9 + Math.random() * 0.2).toFixed(2)));
    };
    const across = dir => (dir === 'row' ? 'column' : 'row');
    const tiles = () => $$('.bento-tile', box).filter(t => t.offsetWidth > 20 && t.offsetHeight > 20);
    const biggest = () => tiles().reduce((b, t) => (t.offsetWidth * t.offsetHeight > (b ? b.offsetWidth * b.offsetHeight : 0) ? t : b), null);
    // \u041a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u0434\u0435\u043b\u0438\u0442\u0441\u044f: \u043d\u0430 \u0435\u0451 \u043c\u0435\u0441\u0442\u0435 \u0433\u0440\u0443\u043f\u043f\u0430 \u0438\u0437 \u043d\u0435\u0451 \u0438 \u043d\u043e\u0432\u043e\u0439 \u0447\u0430\u0441\u0442\u0438, \u043d\u043e\u0432\u0430\u044f \u0440\u0430\u0441\u0442\u0451\u0442 \u043e\u0442 \u043d\u0443\u043b\u044f
    function split(target, dir, add, w, start) {
      const g = group(dir, [], null);
      grow(g, target.style.flexGrow || 1);
      target.replaceWith(g);
      grow(target, 1); grow(add, 0);
      start ? g.append(add, target) : g.append(target, add);
      void g.offsetWidth;
      grow(add, w);
      return g;
    }
    // \u041e\u0434\u043d\u0430 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u0437\u0430\u0431\u0438\u0440\u0430\u0435\u0442 \u0432\u0441\u0451 \u043f\u043e\u043b\u0435: \u0432\u0441\u0451 \u0432\u043d\u0435 \u0435\u0451 \u043f\u0443\u0442\u0438 \u043a \u043a\u043e\u0440\u043d\u044e \u0441\u0436\u0438\u043c\u0430\u0435\u0442\u0441\u044f \u0432 \u043d\u043e\u043b\u044c
    function focus(target) {
      // \u0412\u0435\u0441 \u043d\u0430 \u043f\u0443\u0442\u0438 \u043a \u043a\u043e\u0440\u043d\u044e \u043d\u0435 \u043c\u0435\u043d\u044c\u0448\u0435 1: \u0435\u0441\u043b\u0438 \u0441\u0443\u043c\u043c\u0430 \u0432\u0435\u0441\u043e\u0432 \u0432 \u0440\u044f\u0434\u0443 \u043c\u0435\u043d\u044c\u0448\u0435 1, flex \u043e\u0442\u0434\u0430\u0451\u0442 \u043d\u0435 \u0432\u0441\u0451 \u043c\u0435\u0441\u0442\u043e,
      // \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u043d\u0435 \u0434\u043e\u0442\u044f\u0433\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u0434\u043e \u043a\u0440\u0430\u044f, \u0430 \u043f\u043e\u0441\u043b\u0435 \u0443\u0431\u043e\u0440\u043a\u0438 \u0441\u043a\u0430\u0447\u043a\u043e\u043c \u0434\u043e\u0440\u0430\u0441\u0442\u0430\u0435\u0442 \u2014 \u043e\u0442\u0441\u044e\u0434\u0430 \u0431\u044b\u043b \u0440\u044b\u0432\u043e\u043a
      let el = target;
      while (el.parentElement && el.parentElement !== box) {
        [...el.parentElement.children].forEach(s => s !== el && grow(s, 0));
        if (parseFloat(el.style.flexGrow || 1) < 1) grow(el, 1);
        el = el.parentElement;
      }
    }
    // \u041f\u043e\u0441\u043b\u0435 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u044f \u0443\u0431\u0438\u0440\u0430\u0435\u043c \u0441\u0436\u0430\u0442\u044b\u0435 \u0432 \u043d\u043e\u043b\u044c \u0447\u0430\u0441\u0442\u0438 \u0438 \u0433\u0440\u0443\u043f\u043f\u044b \u0438\u0437 \u043e\u0434\u043d\u043e\u0433\u043e \u044d\u043b\u0435\u043c\u0435\u043d\u0442\u0430
    function prune(el = box) {
      [...el.children].forEach(c => {
        if (el !== box && parseFloat(c.style.flexGrow) === 0) { c.remove(); return; }
        if (c.classList.contains('bento-group')) prune(c);
      });
      if (el !== box && el.children.length === 1) {
        const only = el.firstElementChild;
        grow(only, el.style.flexGrow || 1);
        el.replaceWith(only);
      }
    }
    // \u041a\u0430\u043a\u0438\u0435 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0441\u044f \u043f\u043e\u0441\u043b\u0435 \u0448\u0430\u0433\u0430: \u043d\u0438 \u043e\u0434\u043d\u0430 \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u0430 \u0441\u0442\u0430\u0442\u044c \u0432\u0435\u0440\u0442\u0438\u043a\u0430\u043b\u044c\u043d\u043e\u0439 \u043f\u043e\u043b\u043e\u0441\u043e\u0439
    const targetOf = s => (s.last ? tiles().pop() : biggest());
    function fits(s) {
      if (s.op === 'focus') return true;
      const ok = (w, h) => w / h >= MIN_RATIO && w / h <= MAX_RATIO;
      if (s.op === 'push') {
        const W = box.clientWidth, H = box.clientHeight;
        return s.dir === 'row' ? ok(W, H / s.n) : ok(W / s.n, H);
      }
      const t = targetOf(s);
      if (!t) return false;
      const W = t.offsetWidth, H = t.offsetHeight, f = s.w / (1 + s.w);
      return s.dir === 'row'
        ? ok(W * f, H / s.n) && ok(W * (1 - f), H)
        : ok(W / s.n, H * f) && ok(W, H * (1 - f));
    }
    function run() {
      let s = null;
      for (let k = 0; k < SCRIPT.length && !s; k++) {
        const c = SCRIPT[step++ % SCRIPT.length];
        if (fits(c)) s = c;
      }
      s = s || { op: 'focus' };
      const root = box.firstElementChild;
      if (s.op === 'split') {
        const target = targetOf(s);
        split(target, s.dir, pack(across(s.dir), s.n), s.w);
      } else if (s.op === 'push') {
        const add = pack(across(s.dir), s.n);
        const g = split(root, s.dir, add, 1, s.start);
        grow(g.children[s.start ? 1 : 0], 0);
      } else {
        focus(s.newest && newest?.isConnected ? newest : biggest());
      }
      busy = true;
      setTimeout(() => { prune(); busy = false; }, flowMs() + 60);
    }
    // \u041d\u0430\u0447\u0430\u043b\u044c\u043d\u0430\u044f \u0440\u0430\u0441\u043a\u043b\u0430\u0434\u043a\u0430: \u0431\u043e\u043b\u044c\u0448\u0430\u044f \u0441\u043b\u0435\u0432\u0430, \u0441\u043f\u0440\u0430\u0432\u0430 \u0434\u0432\u0435 \u0434\u0440\u0443\u0433 \u043d\u0430\u0434 \u0434\u0440\u0443\u0433\u043e\u043c (\u0431\u0435\u0437 \u0432\u044b\u0442\u044f\u043d\u0443\u0442\u044b\u0445 \u043f\u043e\u043b\u043e\u0441)
    const t = Array.from({ length: 3 }, tile);
    const wide = box.clientWidth / Math.max(1, box.clientHeight) > 1.6;
    box.append(wide ? group('row', [t[0], group('column', [t[1], t[2]], [1, 1])], [1.2, 1]) : group('column', [t[0], group('row', [t[1], t[2]], [1, 1])], [1.2, 1]));
    grow(box.firstElementChild, 1);
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(box);
    // \u041d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0435 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u0435 \u043d\u0435 \u043e\u0441\u0442\u0430\u043d\u0430\u0432\u043b\u0438\u0432\u0430\u0435\u0442 \u0438 \u043d\u0435 \u0437\u0430\u043c\u0435\u0434\u043b\u044f\u0435\u0442
    const flowMs = () => FLOW_MS;
    const holdMs = () => HOLD_MS;
    let wait = 0;
    const loop = () => {
      wait += 100;
      if (!busy && wait >= flowMs() + holdMs()) {
        if (!(reduce || !visible || document.hidden || home.hidden || sec.classList.contains('is-open'))) run();
        wait = 0;
      }
      setTimeout(loop, 100);
    };
    wait = -Math.random() * 600;
    setTimeout(loop, 100);
    // \u041d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0435 \u2014 \u043a\u043b\u0430\u0441\u0441\u043e\u043c, \u0430 \u043d\u0435 :hover: \u043f\u0440\u0438 \u043f\u0435\u0440\u0435\u0441\u0442\u0440\u043e\u0439\u043a\u0435 \u0441\u0435\u0442\u043a\u0438 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u043f\u0435\u0440\u0435\u0435\u0437\u0436\u0430\u0435\u0442 \u0432 \u0434\u0440\u0443\u0433\u0443\u044e \u0433\u0440\u0443\u043f\u043f\u0443,
    // \u0431\u0440\u0430\u0443\u0437\u0435\u0440 \u043d\u0430 \u043c\u0438\u0433 \u0442\u0435\u0440\u044f\u0435\u0442 :hover, \u0438 \u043f\u043e\u0434\u043f\u0438\u0441\u044c \u0441 \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u043e\u0439 \u0434\u0451\u0440\u0433\u0430\u043b\u0438\u0441\u044c. \u041a\u043b\u0430\u0441\u0441 \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u0442\u0441\u044f \u043f\u0440\u0438 \u043f\u0435\u0440\u0435\u0435\u0437\u0434\u0435
    let hovered = null;
    const setHover = t => { if (t === hovered) return; hovered?.classList.remove('is-hover'); hovered = t; t?.classList.add('is-hover'); };
    const pick = () => {
      if (!fine) return;
      const el = document.elementFromPoint(mouse.x, mouse.y);
      setHover(el && box.contains(el) ? el.closest('.bento-tile') : null);
    };
    box.addEventListener('pointermove', pick, { passive: true });
    box.addEventListener('pointerleave', () => setHover(null));
    addEventListener('scroll', () => hovered && pick(), { passive: true });
    setInterval(() => {
      if (home.hidden) { setHover(null); return; }
      const r = box.getBoundingClientRect();
      const inside = mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom;
      inside ? pick() : setHover(null);
    }, 120);
    box.addEventListener('click', e => {
      const c = e.target.closest('.bento-tile');
      if (!c) return;
      e.preventDefault();
      expandTo(c, c.getAttribute('href'));
    });
  });
  // \u0428\u0440\u0438\u0444\u0442\u044b \u0431\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0438 \u043d\u0430\u0431\u0440\u0430\u043d\u044b \u0441\u0430\u043c\u0438 \u0441\u043e\u0431\u043e\u0439 \u2014 \u0433\u0440\u0443\u0437\u0438\u043c, \u043a\u043e\u0433\u0434\u0430 \u0440\u0430\u0437\u0434\u0435\u043b \u0440\u044f\u0434\u043e\u043c
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    Promise.all(FONTS_ALL.map(p => { const S = SPEC[p.slug]; return S ? loadFace(S.styles[S.default]) : null; })).then(() => refitPlates());
    o.disconnect();
  }, { rootMargin: '600px' }).observe($('#fonts'));

  /* \u2014\u2014\u2014 \u041f\u043b\u044e\u0441 \u0443 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044f \u0440\u0430\u0437\u0434\u0435\u043b\u0430: \u0440\u0430\u0441\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0440\u0430\u0437\u0434\u0435\u043b \u0441\u043e \u0441\u043f\u0438\u0441\u043a\u043e\u043c, \u043a\u0430\u043a \u0440\u0430\u043d\u044c\u0448\u0435 \u2014\u2014\u2014 */
  $$('.shelf').forEach(sec => {
    const btn = $('.shelf-plus', sec), title = $('.sec-title', sec), body = $('.shelf-body', sec);
    const name = title.dataset.title;
    const toggle = open => {
      sec.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open);
      btn.setAttribute('aria-label', `${open ? 'Close' : 'Open'} ${name}`);
      hidePreview();
      if (open) {
        requestAnimationFrame(() => {
          if (sec.id === 'logos') movePill(tabs, $('.is-active', tabs));
          if (sec.id === 'fonts') { movePill(fontTabs, $('.is-active', fontTabs)); $$('.font-list, .lib-list', sec).forEach(fitFaces); }
          observe(sec);
        });
      }
      setTimeout(() => lenis?.resize(), 900);
      if (!open && sec.getBoundingClientRect().top < 0) scrollTo(sec, { offset: -20, duration: 0.8 });
    };
    btn.addEventListener('click', () => toggle(!sec.classList.contains('is-open')));
    title.addEventListener('click', () => toggle(!sec.classList.contains('is-open')));
  });
  /* \u2014\u2014\u2014 \u041d\u0430\u0436\u0430\u0442\u0438\u0435: \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u0440\u0430\u0441\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u0432\u0435\u0441\u044c \u044d\u043a\u0440\u0430\u043d, \u043f\u043e\u0434 \u043d\u0435\u0439 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043f\u0440\u043e\u0435\u043a\u0442 \u2014\u2014\u2014 */
  const expand = $('.expand');
  let expanding = false;
  function expandTo(c, hash) {
    if (reduce) { location.hash = hash; return; }
    const media = $('.card-media', c), r = media.getBoundingClientRect();
    loadPack(findProject(hash.slice(3)));
    expand.innerHTML = media.innerHTML;
    expand.className = 'expand ' + ($('.card-face', media) ? 'is-face' : c.closest('[data-bento="logos"]') ? 'is-logo' : '');
    const cs = getComputedStyle(media);
    expand.style.cssText = `top:${r.top}px; left:${r.left}px; width:${r.width}px; height:${r.height}px; background:${cs.backgroundColor}; opacity:1`;
    lenis?.stop();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      expand.classList.add('on');
      expand.style.cssText += '; top:0; left:0; width:100vw; height:100vh; border-radius:0';
    }));
    setTimeout(() => { expanding = true; location.hash = hash; }, 620);
  }
  async function closeExpand() {
    expand.style.opacity = '0';
    setTimeout(() => { expand.className = 'expand'; expand.innerHTML = ''; expand.removeAttribute('style'); }, 500);
  }

  $('.big-link-text').innerHTML = chars($('.big-link-text').dataset.word);
  /* \u041d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0435 \u043d\u0430 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a: \u0431\u0443\u043a\u0432\u044b \u0441\u0442\u0430\u043d\u043e\u0432\u044f\u0442\u0441\u044f \u0442\u043e\u043d\u043a\u0438\u043c\u0438 \u0438 \u0448\u0438\u0440\u043e\u043a\u0438\u043c\u0438, \u043d\u043e \u0441\u0442\u0440\u043e\u043a\u0430 \u043d\u0435 \u043b\u043e\u043c\u0430\u0435\u0442\u0441\u044f.
     \u041c\u0435\u0440\u044f\u0435\u043c \u043a\u043e\u043f\u0438\u044e \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430 \u0432 \u0443\u0437\u043a\u043e\u043c/\u0448\u0438\u0440\u043e\u043a\u043e\u043c \u0432\u0438\u0434\u0435 \u0438 \u0431\u0435\u0440\u0451\u043c \u0448\u0438\u0440\u0438\u043d\u0443, \u043a\u043e\u0442\u043e\u0440\u0430\u044f \u0435\u0449\u0451 \u043f\u043e\u043c\u0435\u0449\u0430\u0435\u0442\u0441\u044f */
  function fitWide() {
    $$('.sec-title, .big-link-text').forEach(el => {
      const host = el.closest('.sec-head, .big-link');
      const others = [...host.children].filter(c => c !== el).reduce((s, c) => s + c.offsetWidth, 0);
      const gap = parseFloat(getComputedStyle(host).columnGap) || 0;
      const avail = host.clientWidth - parseFloat(getComputedStyle(host).paddingLeft) - parseFloat(getComputedStyle(host).paddingRight) - others - gap * (host.children.length - 1);
      const probe = el.cloneNode(true);
      probe.classList.add('probe');
      const cs = getComputedStyle(el);
      Object.assign(probe.style, { fontSize: cs.fontSize, fontFamily: cs.fontFamily, textTransform: cs.textTransform, letterSpacing: cs.letterSpacing, lineHeight: cs.lineHeight });
      document.body.append(probe);
      const widthAt = (s, w) => { $$('.ch', probe).forEach(c => Object.assign(c.style, { transition: 'none', opacity: 1, transform: 'none', fontStretch: s + '%', fontWeight: w })); return probe.scrollWidth; };
      const w0 = widthAt(62, 900);
      let s = 62;
      for (let t = 125; t > 62; t -= 3) if (widthAt(t, 300) <= avail * 0.98) { s = t; break; }
      probe.remove();
      el.style.setProperty('--hs', s + '%');
    });
  }
  // \u00abLet\u2019s talk\u00bb \u0438 \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u0432\u0441\u0435\u0433\u0434\u0430 \u0432 \u043e\u0434\u043d\u0443 \u0441\u0442\u0440\u043e\u043a\u0443: \u0435\u0441\u043b\u0438 \u043d\u0435 \u043f\u043e\u043c\u0435\u0449\u0430\u044e\u0442\u0441\u044f, \u043a\u0435\u0433\u043b\u044c \u0443\u043c\u0435\u043d\u044c\u0448\u0430\u0435\u0442\u0441\u044f
  function fitTalk() {
    const link = $('.big-link'), text = $('.big-link-text', link), arrow = $('.big-arrow', link);
    link.style.fontSize = '';
    const avail = link.clientWidth - arrow.offsetWidth - parseFloat(getComputedStyle(link).columnGap || 0) - 8;
    if (text.scrollWidth > avail) link.style.fontSize = (parseFloat(getComputedStyle(link).fontSize) * avail / text.scrollWidth).toFixed(1) + 'px';
    // \u041f\u0440\u043e\u043f\u0438\u0441\u043d\u044b\u0435 \u2014 \u0440\u043e\u0432\u043d\u043e \u043f\u043e\u0441\u0435\u0440\u0435\u0434\u0438\u043d\u0435 \u043c\u0435\u0436\u0434\u0443 \u0447\u0435\u0440\u0442\u043e\u0439 \u0441\u0432\u0435\u0440\u0445\u0443 \u0438 \u0447\u0435\u0440\u0442\u043e\u0439 \u043d\u0430\u0434 \u043a\u043e\u043d\u0442\u0430\u043a\u0442\u0430\u043c\u0438; \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u2014 \u0432\u044b\u0441\u043e\u0442\u043e\u0439 \u0441 \u043f\u0440\u043e\u043f\u0438\u0441\u043d\u044b\u0435
    const svg = $('svg', arrow);
    text.style.translate = ''; if (svg) svg.style.translate = '';
    const cs = getComputedStyle(link), fs = parseFloat(cs.fontSize);
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.font = `1000 ${fs}px "Circle VF"`;
    const m = ctx.measureText('H'), capH = m.actualBoundingBoxAscent;
    const tr = text.getBoundingClientRect();
    const base = tr.top + (tr.height - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
    const lineTop = link.getBoundingClientRect().top, lineBottom = $('.contacts').getBoundingClientRect().top;
    const mid = (lineTop + lineBottom) / 2;
    text.style.translate = `0 ${(mid - (base - capH / 2)).toFixed(1)}px`;
    if (svg) {
      svg.style.width = svg.style.height = (capH * 1.06).toFixed(1) + 'px'; // \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u2193 \u0437\u0430\u043d\u0438\u043c\u0430\u0435\u0442 \u043f\u043e\u0447\u0442\u0438 \u0432\u0441\u0451 \u043f\u043e\u043b\u0435
      const ar = svg.getBoundingClientRect();
      svg.style.translate = `0 ${(mid - (ar.top + ar.height / 2)).toFixed(1)}px`;
      hairlines();
    }
  }
  document.fonts.ready.then(() => { fitTalk(); fitWide(); });
  $$('.magnetic').forEach(magnetic);

  /* \u2014\u2014\u2014 Nav: \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439 \u0440\u0430\u0437\u0434\u0435\u043b \u2014\u2014\u2014 */
  const navEl = $('.nav');
  const navPill = $('.nav-pill');
  // \u0424\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u0432\u044b\u0441\u043e\u0442\u0430 \u0448\u0430\u043f\u043a\u0438 \u0432 CSS-\u043f\u0435\u0440\u0435\u043c\u0435\u043d\u043d\u043e\u0439: \u043d\u0430 \u0443\u0437\u043a\u0438\u0445 \u044d\u043a\u0440\u0430\u043d\u0430\u0445 \u043d\u0430\u0432 \u0441\u043a\u043b\u0430\u0434\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0432 2\u20133 \u0441\u0442\u0440\u043e\u043a\u0438, \u0438 \u0432\u044b\u0441\u043e\u0442\u0430 \u043c\u0435\u043d\u044f\u0435\u0442\u0441\u044f \u2014 \u0432\u0435\u0440\u0441\u0442\u043a\u0430\u043c \u043d\u0438\u0436\u0435 \u043f\u0440\u043e\u0449\u0435, \u0447\u0435\u043c \u043f\u043e\u0434\u0431\u0438\u0440\u0430\u0442\u044c \u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u043e\u0442\u0441\u0442\u0443\u043f\u044b \u043f\u043e\u0434 \u043a\u0430\u0436\u0434\u044b\u0439 breakpoint
  const syncNavH = () => document.documentElement.style.setProperty('--nav-h', navEl.offsetHeight + 'px');
  syncNavH();
  const navIO = new IntersectionObserver(entries => {
    if ($('#home').hidden) return; // \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043f\u0440\u043e\u0435\u043a\u0442\u0430 \u0440\u0430\u0437\u0434\u0435\u043b\u044b \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u043d\u0435 \u043f\u043e\u0434\u0441\u0432\u0435\u0447\u0438\u0432\u0430\u0435\u043c
    for (const e of entries) if (e.isIntersecting) {
      movePill(navPill, $(`[data-scroll="${e.target.id}"]`, navPill));
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['top', 'branding', 'logos', 'fonts', 'about'].forEach(id => navIO.observe(document.getElementById(id)));

  /* \u2014\u2014\u2014 Project page \u2014\u2014\u2014 */
  const home = $('#home');
  const pj = $('#project');
  let homeY = 0;
  let pendingSection = null;
  let pjCover = null;

  function renderProject(slug) {
    // \u0423\u0445\u043e\u0434\u044f \u0441 \u043b\u044e\u0431\u043e\u0433\u043e \u043f\u0440\u043e\u0435\u043a\u0442\u0430 \u0433\u0430\u0441\u0438\u043c \u0433\u043b\u043e\u0431\u0430\u043b\u044c\u043d\u044b\u0435 scroll/resize-\u0441\u043b\u0443\u0448\u0430\u0442\u0435\u043b\u0438 \u043f\u0440\u0435\u0437\u0435\u043d\u0442\u0430\u0446\u0438\u0438 BetRush, \u0438\u043d\u0430\u0447\u0435 \u043e\u043d\u0438 \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f \u0432\u0438\u0441\u0435\u0442\u044c \u043d\u0430 \u043e\u0442\u0441\u043e\u0435\u0434\u0438\u043d\u0451\u043d\u043d\u044b\u0445 \u0443\u0437\u043b\u0430\u0445 DOM
    Object.values(PRES).forEach(c => c.api()?.unmount());
    // \u041f\u0440\u043e\u0435\u043a\u0442 \u043b\u0438\u0441\u0442\u0430\u0435\u0442\u0441\u044f \u0432\u043d\u0443\u0442\u0440\u0438 \u0441\u0432\u043e\u0435\u0439 \u0433\u0440\u0443\u043f\u043f\u044b: \u0431\u0440\u0435\u043d\u0434\u0438\u043d\u0433 \u0438\u043b\u0438 \u0448\u0440\u0438\u0444\u0442\u044b
    const group = [COMM, LIBRARY, LOGOS].find(g => g.some(p => p.slug === slug)) || P;
    const i = group.findIndex(p => p.slug === slug);
    if (i < 0) return false;
    const p = group[i];
    const next = group[(i + 1) % group.length];
    const S = p.isFont ? SPEC[p.slug] : null;
    const titleFace = S && covers(S, nameOf(p)) ? ` style="--tf:'${S.styles[S.default].family}'"` : '';
    const meta = S && p.isLib
      ? [['Typeface', p.name], ['Scripts', scriptsOf(S)], ['Styles', S.styles.length], ['Glyphs', S.glyphs]]
      : S
      ? [['Typeface', p.name], ['About', p.about], ['Styles', S.styles.length], ['Glyphs', S.glyphs]]
      : p.isFont
      ? [['Typeface', p.name], ['About', p.about]]
      : p.isLogo
      ? [['Collection', p.name], ['Work', 'Logos drawn from letters'], ['Logos', p.images.length]]
      : [['Client', p.title], ['Discipline', 'Branding']];
    const [cover, ...rest] = p.images;
    const tall = im => im.h / im.w > 0.9;
    let n = 1;
    // \u041b\u043e\u0433\u043e\u0442\u0438\u043f\u044b \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0438 \u2014 \u043e\u0440\u0430\u043d\u0436\u0435\u0432\u044b\u0435, \u043d\u0430\u0441\u0442\u043e\u044f\u0449\u0438\u0439 \u0446\u0432\u0435\u0442 \u043f\u0440\u043e\u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u043a\u0440\u0443\u0433\u043e\u043c \u043f\u043e\u0434 \u043a\u0443\u0440\u0441\u043e\u0440\u043e\u043c
    const media = (im, alt, extra = '') => (p.isLogo ? img(im, '', 'class="duo"') + img(im, alt, `class="full" ${extra}`) : img(im, alt, extra));
    const fig = im => `<figure class="shot reveal-img${p.isLogo ? ' logo-shot' : ''}" data-n="${n++}">${media(im, `${p.title}, image ${n}`)}</figure>`;
    let gallery = '';
    for (let k = 0; k < rest.length; k++) {
      const a = rest[k], b = rest[k + 1];
      if (tall(a) && b && tall(b)) { gallery += `<div class="pair">${fig(a)}${fig(b)}</div>`; k++; }
      else gallery += fig(a);
    }
    pj.innerHTML = `
      <div class="pj-top mono">
        <a class="pj-back roll-host" href="#${p.isLogo ? 'logos' : p.isFont ? 'fonts' : 'branding'}">${arrowSVG('\u2190')}<span class="roll">${chars(p.isFont ? 'All fonts' : p.isLogo ? 'All logos' : 'All projects')}</span></a>
        <span>${COMM.includes(p) ? 'Commercial fonts \u00b7 ' : p.isFont ? 'Type library \u00b7 ' : p.isLogo ? 'Logos \u00b7 ' : ''}${pad(i + 1)} / ${pad(group.length)}</span>
      </div>
      <h1 class="pj-title${p.isFont && !PRES[p.slug] ? ' sr-only' : ''}${titleFace ? ' has-face' : ''}${S?.tweak?.text ? ' keep-case' : ''}${S?.tweak?.bolder ? ' is-bolder' : ''}"${titleFace}>${chars(S?.tweak?.text ? S.tweak.text(nameOf(p)) : nameOf(p))}</h1>
      <div class="pj-meta${meta.length === 2 ? ' is-two' : ''}">
        ${meta.map(([k, v]) => `<div><span class="mono">${k}</span>${esc(v)}</div>`).join('')}
      </div>
      ${S && !PRES[p.slug] ? `<div class="pj-plate">${facePlate(p)}</div>` + specHTML(S) : `${p.isFont && !PRES[p.slug] && fontImage(p.slug) ? `<div class="pj-plate is-img"><img src="${fontImage(p.slug).src}" alt="${esc(nameOf(p))}"></div>` : ''}
      ${PRES[p.slug] || window.PROTOS?.[p.slug]?.replacesCover ? '' : `<figure class="pj-cover shot${p.isLogo ? ' logo-shot' : ''}" data-n="0">${media(cover, `${p.title}, cover`, 'loading="eager" fetchpriority="high"')}</figure>`}
      ${PRES[p.slug] ? `<div class="pj-presentation" id="pres"></div>` : window.PROTOS?.[p.slug] ? '<div class="proto"></div>' : ''}
      ${PRES[p.slug] || window.PROTOS?.[p.slug]?.replacesGallery ? '' : `<div class="pj-gallery${p.isLogo ? ' is-logos' : ''}">${gallery}</div>`}`}
      <a class="pj-next" href="#p-${next.slug}" data-cursor="Next"${window.PROTOS?.[next.slug]?.bentoCover || window.COVERS?.[next.slug] ? ` data-preview="cover:${next.slug}"` : next.thumb && !SPEC[next.slug] ? ` data-preview="${next.thumb}"` : ''}>
        <span class="mono">${p.isFont ? 'Next typeface' : p.isLogo ? 'Next collection' : 'Next project'} \u2014 ${pad((i + 1) % group.length + 1)}</span>
        ${(() => {
          // \u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u0448\u0440\u0438\u0444\u0442: \u043f\u0440\u0438 \u043d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0438 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0441\u043c\u0435\u043d\u044f\u0435\u0442\u0441\u044f \u043d\u0430 \u043d\u0435\u0433\u043e \u0436\u0435, \u043d\u0430\u0431\u0440\u0430\u043d\u043d\u043e\u0435 \u0441\u0430\u043c\u0438\u043c \u0448\u0440\u0438\u0444\u0442\u043e\u043c (\u043a\u0430\u043a \u0432 \u0441\u043f\u0438\u0441\u043a\u0435)
          const nf = next.isFont && listFace(next.slug, nameOf(next));
          return nf
            ? `<span class="pj-next-title nx has-face" data-slug="${next.slug}" data-name="${esc(nameOf(next))}" style="--face:'${nf.family}'; --nc:${plateInk(next)}"><span class="fn-base">${esc(nameOf(next))}</span><span class="fn-face" aria-hidden="true"><span>${esc(nf.text)}</span></span></span>`
            : `<span class="pj-next-title roll-host"><span class="roll">${chars(nameOf(next))}</span></span>`;
        })()}
      </a>`;
    if (BRAND[p.slug]) pj.style.setProperty('--accent', BRAND[p.slug]); else pj.style.removeProperty('--accent');
    const all = p.images.map((im, k) => ({ src: im.src, alt: `${p.title}, image ${k + 1}` }));
    pj._images = S ? [] : all; // \u043f\u043e\u0440\u044f\u0434\u043e\u043a \u0441\u043e\u0432\u043f\u0430\u0434\u0430\u0435\u0442 \u0441 data-n \u0443 .shot
    if (S && !PRES[p.slug]) bindSpec(S); // у презентации нет спесимена, но шрифт заголовка грузим ниже как обычно
    // \u0418\u043d\u0442\u0435\u0440\u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0439 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f (\u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440, \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 Player One) \u2014 \u043f\u043e\u0434 \u043e\u0431\u043b\u043e\u0436\u043a\u043e\u0439
    if (window.PROTOS?.[p.slug] && !PRES[p.slug]) window.PROTOS[p.slug].mount($('.proto', pj), { images: p.images });
    if (PRES[p.slug]) mountPresentation(p.slug, $('#pres', pj));
    pjCover = $('.pj-cover img', pj);
    if (S) { S.styles.forEach(loadFace); loadFace(S.styles[S.default]).then(() => { if (!PRES[p.slug]) refitPlates(pj); }); }
    bindPreviews(pj);
    observe(pj);
    document.title = `${nameOf(p)} \u2014 Zero too Hero`;
    arrows(pj);
    hairlines();
    // \u00abNext typeface\u00bb: \u0441\u043b\u043e\u0439 \u0441 \u0441\u043e\u0431\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u043c \u0448\u0440\u0438\u0444\u0442\u043e\u043c \u043f\u043e\u0434\u0433\u043e\u043d\u044f\u0435\u0442\u0441\u044f \u043f\u043e \u0432\u044b\u0441\u043e\u0442\u0435 \u043f\u0440\u043e\u043f\u0438\u0441\u043d\u044b\u0445, \u043a\u0430\u043a \u0432 \u0441\u043f\u0438\u0441\u043a\u0435
    if ($('.nx.has-face', pj)) fitFaces(pj);
    return true;
  }
  // \u0412 \u043e\u0431\u043b\u0435\u0433\u0447\u0451\u043d\u043d\u043e\u0439 \u043a\u043e\u043f\u0438\u0438 \u0434\u043b\u044f \u0441\u0441\u044b\u043b\u043a\u0438 \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0438 \u043f\u0440\u043e\u0435\u043a\u0442\u0430 \u043b\u0435\u0436\u0430\u0442 \u043e\u0434\u043d\u0438\u043c JSON-\u043f\u0430\u043a\u0435\u0442\u043e\u043c
  const packs = new Map();
  function loadPack(p) {
    if (!p?.pack || PRES[p.slug]) return Promise.resolve(); // у презентаций нет галереи из пака
    if (!packs.has(p.slug)) packs.set(p.slug, fetch(p.pack).then(r => r.json()).then(list => {
      p.images.forEach((im, k) => (im.src = list[k]));
    }).catch(() => packs.delete(p.slug)));
    return packs.get(p.slug);
  }
  // Презентации проектов (готовые макеты) живут в Shadow DOM: их CSS/классы взяты как есть и не пересекаются со стилями
  // портфолио, при этом скролл остаётся одним непрерывным, как у остальных проектов (не iframe)
  const PRES = {
    betrush: { api: () => window.BetrushPresentation, v: 23, files: ['betrush-pres.html', 'betrush-pres.css'] },
    e302: { api: () => window.E302Presentation, v: 3, files: ['e302-pres.html', 'e302-pres-style.css'] },
    'font-neo-duplicate': { api: () => window.CriminalPresentation, v: 1, files: ['criminal-pres.html', 'criminal-pres.css'] },
    'font-shock': { api: () => window.ShokPresentation, v: 1, files: ['shok-pres.html', 'shok-pres.css'] },
    'lib-gameday': { api: () => window.GollanosPresentation, v: 1, files: ['gollanos-pres.html', 'gollanos-pres.css'] },
    'font-action': { api: () => window.ActionPresentation, v: 1, files: ['action-pres.html', 'action-pres.css'] },
  };
  const presCache = {};
  function mountPresentation(slug, root) {
    const c = PRES[slug];
    presCache[slug] ??= Promise.all(c.files.map(f => fetch(`${f}?v=${c.v}`).then(r => r.text())));
    presCache[slug].then(([html, ...css]) => {
      if (!root.isConnected) return; // ушли со страницы, пока грузились файлы
      const doc = new DOMParser().parseFromString(html, 'text/html');
      doc.body.querySelectorAll('script').forEach(s => s.remove());
      const shadow = root.shadowRoot ?? root.attachShadow({ mode: 'open' });
      shadow.innerHTML = css.map(x => `<style>${x}</style>`).join('') + doc.body.innerHTML;
      // якоря внутри презентации скроллим как разделы сайта: с отступом под плавающую навигацию
      c.api()?.mount(root, shadow, { scrollTo: t => t === 0 ? scrollTo(0) : scrollTo(t, { offset: -(navEl.offsetHeight + 20) }), scrollRaw: scrollTo, navEl });
    }).catch(() => { delete presCache[slug]; });
  }
  // \u041f\u043e\u0434\u0433\u0440\u0443\u0436\u0430\u0435\u043c \u043f\u0430\u043a\u0435\u0442 \u0437\u0430\u0440\u0430\u043d\u0435\u0435, \u043f\u043e\u043a\u0430 \u043a\u0443\u0440\u0441\u043e\u0440 \u043d\u0430\u0434 \u043f\u0440\u043e\u0435\u043a\u0442\u043e\u043c
  document.addEventListener('pointerover', e => {
    const a = e.target.closest('a[href^="#p-"]');
    if (a) loadPack(findProject(a.getAttribute('href').slice(3)));
  });
  function specHTML(S) {
    const st = S.styles;
    const multiWidth = (S.widths || []).length > 1;
    const weights = [...new Set(st.map(s => s.weightName))];
    const pill = (attr, items) => `<div class="pill tabs spec-pill" role="group"><span class="pill-bg"></span>${
      items.map(([v, label]) => `<button type="button" ${attr}="${v}">${esc(label)}</button>`).join('')}</div>`;
    return `
    <div class="spec${S.tweak?.bolder ? ' is-bolder' : ''}" role="region" aria-label="Type specimen">
      <div class="spec-bar">
        ${multiWidth
          ? pill('data-weight', weights.map(w => [w, w])) + pill('data-width', S.widths.map(w => [w, w]))
          : st.length > 1 ? pill('data-style', st.map((s, i) => [i, s.name])) : `<span class="mono spec-style-name">${esc(st[0].name)}</span>`}
        ${S.scripts.length > 1 ? pill('data-script', S.scripts.map(s => [s, SCRIPT_NAMES[s]])) : `<span class="mono spec-style-name">${SCRIPT_NAMES[S.scripts[0]]}</span>`}
        <label class="spec-size mono">Size <input type="range" id="spec-size" min="24" max="260" value="120"><output>120 px</output></label>
      </div>
      <div class="spec-tester" contenteditable="true" spellcheck="false" data-sample="tester" role="textbox" aria-label="Type tester \u2014 click and type"></div>
      <p class="mono spec-hint">Click the line and type your own text</p>
      ${(() => {
        // Все начертания строками, как на образце: сверху алфавит (без названия шрифта), ниже панграмма в каждой насыщенности
        const fam = multiWidth ? st.filter(x => x.width === st[S.default].width) : st;
        if (fam.length < 2) return '';
        return `
      <div class="spec-block spec-family" style="font-family:'${st[S.default].family}', var(--f-display)">
        <p class="mono spec-label">Styles \u00b7 ${fam.length}</p>
        <div class="spec-abc"><p data-sample="abcU"></p><p data-sample="abcL"></p></div>
        <ul class="spec-lines">${fam.map(x => `
          <li><button type="button" class="spec-line" data-style="${st.indexOf(x)}">
            <span class="spec-line-text" data-sample="tester" style="font-family:'${x.family}', var(--f-display)"></span>
            <span class="mono spec-line-name">${esc(x.name)}</span>
          </button></li>`).join('')}</ul>
      </div>`;
      })()}
      ${multiWidth ? `
      <div class="spec-block">
        <p class="mono spec-label">Family \u00b7 ${weights.length} weights \u00d7 ${S.widths.length} widths</p>
        <div class="spec-matrix" style="--cols:${S.widths.length}">
          <span></span>${S.widths.map(w => `<span class="mono">${w}</span>`).join('')}
          ${weights.map(wt => `<span class="mono">${wt}</span>` + S.widths.map(wd => {
            const i = st.findIndex(s => s.weightName === wt && s.width === wd);
            return i < 0 ? '<span class="spec-mx-empty mono">\u2014</span>'
              : `<button type="button" class="spec-mx" data-style="${i}" aria-label="${esc(st[i].name)}" style="font-family:'${st[i].family}', var(--f-display)" data-sample="pair"></button>`;
          }).join('')).join('')}
        </div>
      </div>` : ''}
      <div class="spec-block">
        <p class="mono spec-label">Sizes</p>
        <ul class="spec-waterfall">${(innerWidth <= 480 ? [48, 36, 24, 16, 12] : innerWidth <= 760 ? [64, 48, 32, 20, 14] : [96, 64, 40, 24, 16]).map(px => `
          <li><span class="mono">${px} px</span><span class="spec-wf-text" style="font-size:${px}px" data-sample="waterfall"></span></li>`).join('')}</ul>
      </div>
      <div class="spec-block">
        <p class="mono spec-label">Glyphs \u00b7 ${S.glyphs}</p>
        <div class="spec-glyphs">
          <button type="button" class="glyph-nav" data-g="-1" aria-label="Previous glyph">\u2190</button>
          <div class="spec-inspector" aria-live="polite" tabindex="0" aria-label="Glyphs, use arrows to scroll">
            <span class="spec-big"></span>
            <span class="mono spec-code"></span>
          </div>
          <button type="button" class="glyph-nav" data-g="1" aria-label="Next glyph">\u2192</button>
        </div>
      </div>
    </div>`;
  }

  function bindSpec(S) {
    const spec = $('.spec', pj);
    const tester = $('.spec-tester', spec);
    const big = $('.spec-big', spec);
    const code = $('.spec-code', spec);
    const state = { style: S.default, script: S.scripts[0], edited: false, glyph: null };
    // Алфавит для строки над начертаниями: из набора знаков шрифта, для каждой письменности свой
    const grp = re => Object.entries(S.groups).find(([g]) => re.test(g))?.[1] || '';
    const ABC = Object.fromEntries(S.scripts.map(sc => {
      let set = [...grp(sc === 'cyr' ? /cyril/i : /latin/i)];
      // Ё и ё — на своё место после Е, а не в начало
      for (const [yo, e] of [['\u0401', '\u0415'], ['\u0451', '\u0435']]) if (set.includes(yo) && set.includes(e)) { set = set.filter(c => c !== yo); set.splice(set.indexOf(e) + 1, 0, yo); }
      const up = set.filter(c => c !== c.toLowerCase()).join('');
      const low = set.filter(c => c !== c.toUpperCase()).join('');
      const fig = grp(/figur/i), sym = ['#', '&', '?', '!'].filter(c => S.cmap.includes(c)).join(' ');
      return [sc, { abcU: up, abcL: [capsOnly(S, sc) ? '' : low, [...fig].join(' '), sym].filter(Boolean).join(' ') }];
    }));
    function apply() {
      spec.style.setProperty('--sf', `'${S.styles[state.style].family}'`);
      const smp = S.samples[state.script];
      const caps = capsOnly(S, state.script);
      spec.classList.toggle('is-caps', caps);
      $$('[data-sample]', spec).forEach(el => {
        if ((el === tester && state.edited) || (el === big && state.glyph)) return;
        if (el.dataset.sample.startsWith('abc')) { el.textContent = ABC[state.script]?.[el.dataset.sample] || ''; return; }
        el.textContent = S.tweak?.text ? S.tweak.text(smp[el.dataset.sample]) : caps ? smp[el.dataset.sample].toUpperCase() : smp[el.dataset.sample];
      });
      const cur = S.styles[state.style];
      $$('.spec-pill', spec).forEach(pl => movePill(pl, $(`[data-style="${state.style}"], [data-script="${state.script}"], [data-weight="${cur.weightName}"], [data-width="${cur.width}"]`, pl)));
      $$('.spec-weight, .spec-mx, .spec-line', spec).forEach(b => b.classList.toggle('is-current', +b.dataset.style === state.style));
    }
    tester.addEventListener('input', () => (state.edited = true));
    spec.addEventListener('click', e => {
      const s = e.target.closest('[data-style]');
      if (s) { state.style = +s.dataset.style; apply(); showGlyph(gi); }
      // \u0422\u043e\u043b\u0449\u0438\u043d\u0430 \u0438 \u0448\u0438\u0440\u0438\u043d\u0430: \u0438\u0449\u0435\u043c \u043d\u0430\u0447\u0435\u0440\u0442\u0430\u043d\u0438\u0435 \u0441 \u043d\u0443\u0436\u043d\u043e\u0439 \u043f\u0430\u0440\u043e\u0439, \u0438\u043d\u0430\u0447\u0435 \u0431\u043b\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0441 \u0442\u043e\u0439 \u0436\u0435 \u0442\u043e\u043b\u0449\u0438\u043d\u043e\u0439/\u0448\u0438\u0440\u0438\u043d\u043e\u0439
      const wt = e.target.closest('[data-weight]'), wd = e.target.closest('[data-width]');
      if (wt || wd) {
        const cur = S.styles[state.style];
        const want = { weightName: wt ? wt.dataset.weight : cur.weightName, width: wd ? wd.dataset.width : cur.width };
        let i = S.styles.findIndex(s => s.weightName === want.weightName && s.width === want.width);
        if (i < 0) i = S.styles.findIndex(s => (wt ? s.weightName === want.weightName : s.width === want.width));
        if (i >= 0) { state.style = i; apply(); showGlyph(gi); }
      }
      const sc = e.target.closest('[data-script]');
      if (sc) { state.script = sc.dataset.script; apply(); showGlyph(firstOf(state.script)); }
    });
    const size = $('#spec-size', spec);
    // \u041d\u0430 \u0442\u0435\u043b\u0435\u0444\u043e\u043d\u0435 \u0438 \u0443\u0437\u043a\u043e\u043c \u043f\u043b\u0430\u043d\u0448\u0435\u0442\u0435 \u0442\u0435\u0441\u0442\u0435\u0440 \u0441\u0442\u0430\u0440\u0442\u0443\u0435\u0442 \u043c\u0435\u043b\u044c\u0447\u0435, \u0447\u0442\u043e\u0431\u044b \u0441\u0442\u0440\u043e\u043a\u0430 \u043f\u043e\u043c\u0435\u0449\u0430\u043b\u0430\u0441\u044c \u043d\u0430 \u044d\u043a\u0440\u0430\u043d
    const startSize = innerWidth <= 480 ? 48 : innerWidth <= 760 ? 64 : innerWidth <= 1100 ? 96 : 120;
    size.value = startSize;
    spec.style.setProperty('--ts', startSize + 'px');
    $('output', size.parentElement).textContent = startSize + ' px';
    const fillRange = () => size.style.setProperty('--fill', ((size.value - size.min) / (size.max - size.min) * 100).toFixed(1) + '%');
    fillRange();
    size.addEventListener('input', () => {
      fillRange();
      spec.style.setProperty('--ts', size.value + 'px');
      $('output', size.parentElement).textContent = size.value + ' px';
    });
    // \u0417\u043d\u0430\u043a\u0438 \u043b\u0438\u0441\u0442\u0430\u044e\u0442\u0441\u044f \u0441\u0442\u0440\u0435\u043b\u043a\u0430\u043c\u0438 (\u0438 \u043a\u043b\u0430\u0432\u0438\u0448\u0430\u043c\u0438 \u2190 \u2192, \u0438 \u0441\u0432\u0430\u0439\u043f\u043e\u043c), \u0430 \u043d\u0435 \u0432\u044b\u0431\u0438\u0440\u0430\u044e\u0442\u0441\u044f \u0438\u0437 \u0441\u0435\u0442\u043a\u0438
    const glyphs = Object.entries(S.groups).flatMap(([g, set]) => [...set].map(ch => ({ ch, g })));
    const firstOf = script => Math.max(0, glyphs.findIndex(x => (script === 'cyr' ? /cyril/i : /latin/i).test(x.g)));
    let gi = 0;
    function showGlyph(i) {
      gi = (i + glyphs.length) % glyphs.length;
      const { ch, g } = glyphs[gi];
      state.glyph = ch;
      big.textContent = ch;
      const [gx, gy] = inkOffset(S.styles[state.style].family, ch);
      big.style.translate = `${gx.toFixed(3)}em ${gy.toFixed(3)}em`; // \u0437\u043d\u0430\u043a \u2014 \u043f\u043e \u0446\u0435\u043d\u0442\u0440\u0443 \u043a\u0432\u0430\u0434\u0440\u0430\u0442\u0430 \u043f\u043e \u0440\u0438\u0441\u0443\u043d\u043a\u0443, \u0441 \u043d\u0430\u0434\u0441\u0442\u0440\u043e\u0447\u043d\u044b\u043c\u0438
      big.style.animation = 'none'; void big.offsetWidth; big.style.animation = '';
      code.textContent = `${codeOf(ch)} \u00b7 ${g} \u00b7 ${pad(gi + 1)} / ${glyphs.length}`;
    }
    const insp = $('.spec-inspector', spec);
    $('.spec-glyphs', spec).addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) showGlyph(gi + +b.dataset.g); });
    insp.addEventListener('keydown', e => { if (e.key === 'ArrowRight') showGlyph(gi + 1); if (e.key === 'ArrowLeft') showGlyph(gi - 1); });
    let sx = null;
    insp.addEventListener('pointerdown', e => { if (!e.target.closest('[data-g]')) sx = e.clientX; });
    insp.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 40) showGlyph(gi + (e.clientX < sx ? 1 : -1)); sx = null; });
    apply();
    showGlyph(firstOf(state.script));
    Promise.all(S.styles.map(loadFace)).then(() => { apply(); showGlyph(gi); lenis?.resize(); });
  }

  function onShotClick(e) {
    const s = e.target.closest('.shot');
    if (s) openLB(pj._images, +s.dataset.n);
  }
  pj.addEventListener('click', onShotClick);
  ticks.add(() => {
    if (pj.hidden || !pjCover || reduce) return;
    const r = pjCover.parentElement.getBoundingClientRect();
    if (r.bottom > 0) pjCover.style.transform = `translate3d(0, ${-r.top * 0.15 - r.height * 0.09}px, 0)`;
  });

  function showHome() {
    const wasProject = !home.hidden ? false : true;
    hidePreview();
    pj.hidden = true;
    pj.classList.remove('in');
    pj.innerHTML = '';
    pjCover = null;
    home.hidden = false;
    document.title = 'Zero too Hero';
    lenis?.resize();
    const h = location.hash.slice(1);
    const target = pendingSection || (h && h !== 'home' ? h : null);
    pendingSection = null;
    if (target && document.getElementById(target)) scrollTo(target, { immediate: true, force: true, offset: target === 'top' ? 0 : -20 });
    else if (wasProject) scrollTo(homeY, { immediate: true, force: true });
    // \u0422\u0435\u043c\u0430 \u043f\u043e \u0432\u0438\u0434\u0438\u043c\u043e\u0439 \u0441\u0435\u043a\u0446\u0438\u0438
    requestAnimationFrame(() => {
      const mid = innerHeight / 2;
      const s = $$('#home [data-theme]').find(el => { const r = el.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
      document.body.dataset.theme = s ? s.dataset.theme : 'dark';
    });
  }
  async function showProject(slug) {
    if (!home.hidden) homeY = scrollY;
    hidePreview();
    await loadPack(findProject(slug));
    if (!renderProject(slug)) { location.hash = '#home'; return; }
    home.hidden = true;
    pj.hidden = false;
    hairlines(); // \u0442\u043e\u043b\u0449\u0438\u043d\u0430 \u0441\u0442\u0440\u0435\u043b\u043e\u043a \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f \u043f\u043e \u0440\u0435\u0430\u043b\u044c\u043d\u043e\u043c\u0443 \u0440\u0430\u0437\u043c\u0435\u0440\u0443, \u043a\u043e\u0433\u0434\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0443\u0436\u0435 \u0432\u0438\u0434\u043d\u0430
    document.body.dataset.theme = 'dark';
    movePill(navPill, null);
    lenis?.resize();
    scrollTo(0, { immediate: true, force: true });
    requestAnimationFrame(() => requestAnimationFrame(() => pj.classList.add('in')));
  }
  function route() {
    const m = location.hash.match(/^#p-([\w.~-]+)$/);
    if (m) return showProject(m[1]);
    showHome();
  }

  // \u041f\u0435\u0440\u0435\u0445\u043e\u0434 \u043c\u0435\u0436\u0434\u0443 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430\u043c\u0438: \u043e\u0440\u0430\u043d\u0436\u0435\u0432\u0430\u044f \u0448\u0442\u043e\u0440\u043a\u0430 \u0437\u0430\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u044d\u043a\u0440\u0430\u043d, \u043c\u0435\u043d\u044f\u0435\u043c \u043a\u043e\u043d\u0442\u0435\u043d\u0442, \u0448\u0442\u043e\u0440\u043a\u0430 \u0443\u0445\u043e\u0434\u0438\u0442 \u0432\u0432\u0435\u0440\u0445
  const curtain = $('.curtain');
  let busy = false;
  function transition(fn) {
    if (reduce || busy) { fn(); return; }
    busy = true;
    lenis?.stop();
    curtain.classList.remove('out');
    curtain.classList.add('in');
    setTimeout(async () => {
      lenis?.start();
      try { await fn(); } finally {
        curtain.classList.add('out');
        setTimeout(() => { curtain.classList.remove('in', 'out'); busy = false; }, 700);
      }
    }, 680);
  }
  addEventListener('hashchange', async () => {
    const toProject = /^#p-/.test(location.hash);
    if (expanding) {
      expanding = false;
      lenis?.start();
      await route();
      closeExpand();
      return;
    }
    // \u042f\u043a\u043e\u0440\u044f \u0440\u0430\u0437\u0434\u0435\u043b\u043e\u0432 \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u043d\u0435 \u0432\u044b\u0437\u044b\u0432\u0430\u044e\u0442 \u0448\u0442\u043e\u0440\u043a\u0443
    if (!toProject && !home.hidden) return;
    transition(route);
  });

  document.addEventListener('click', e => {
    const a = e.target.closest('[data-scroll]');
    if (!a) return;
    e.preventDefault();
    const id = a.dataset.scroll;
    if (home.hidden) { pendingSection = id; location.hash = '#home'; }
    else scrollTo(id, { offset: id === 'top' ? 0 : -(navEl.offsetHeight + 20) });
  });

  addEventListener('keydown', e => {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowLeft') lbStep(-1);
      if (e.key === 'ArrowRight') lbStep(1);
      return;
    }
    if (e.key === 'Escape' && !pj.hidden) location.hash = '#home';
  });

  // Все, что пересчитывается по resize, собрано в один rAF-батч: непрерывный drag-ресайз или поворот экрана не накапливает очередь из пяти раскладок
  let resizeRaf = 0;
  const onResize = () => {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      syncNavH();
      placeBadge();
      fitTalk();
      fitWide();
      hairlines();
      movePill(tabs, $('.is-active', tabs));
      movePill(fontTabs, $('.is-active', fontTabs));
      movePill(navPill, $('.is-active', navPill));
    });
  };
  addEventListener('resize', onResize);

  // \u0417\u0432\u0451\u0437\u0434\u044b \u043d\u0430 \u043a\u0440\u0443\u0433\u043b\u043e\u0439 \u043d\u0430\u0434\u043f\u0438\u0441\u0438: \u043f\u0440\u044f\u0447\u0435\u043c \u0441\u0438\u043c\u0432\u043e\u043b \u0438 \u0440\u0438\u0441\u0443\u0435\u043c \u043d\u0430 \u0435\u0433\u043e \u043c\u0435\u0441\u0442\u0435 \u043e\u0441\u0442\u0440\u0443\u044e \u0437\u0432\u0435\u0437\u0434\u0443
  (() => {
    const svg = $('.badge svg'), text = $('text', svg);
    // \u0412\u0441\u0435 \u043f\u0440\u043e\u0431\u0435\u043b\u044b \u043d\u0435\u0440\u0430\u0437\u0440\u044b\u0432\u043d\u044b\u0435: \u0438\u043d\u0430\u0447\u0435 SVG \u0441\u044a\u0435\u0434\u0430\u0435\u0442 \u043f\u0440\u043e\u0431\u0435\u043b \u0432 \u043a\u043e\u043d\u0446\u0435, \u0438 \u043d\u0430 \u0441\u0442\u044b\u043a\u0435 \u043a\u0440\u0443\u0433\u0430 \u0431\u0443\u043a\u0432\u044b \u0441\u043b\u0438\u043f\u0430\u044e\u0442\u0441\u044f
    const raw = text.textContent.replace(/ /g, '\u00a0');
    $('textPath', text).innerHTML = esc(raw).replace(/\u2726/g, '<tspan fill="transparent">\u2726</tspan>');
    // \u041d\u0430\u0434\u043f\u0438\u0441\u044c \u0440\u0430\u0441\u0442\u044f\u0433\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u0432\u0441\u044e \u043e\u043a\u0440\u0443\u0436\u043d\u043e\u0441\u0442\u044c, \u0447\u0442\u043e\u0431\u044b \u0432 \u043a\u0440\u0443\u0433\u0435 \u043d\u0435 \u0431\u044b\u043b\u043e \u0434\u044b\u0440\u043a\u0438
    const ring = $('#circle', svg).getTotalLength();
    $('textPath', text).setAttribute('textLength', ring.toFixed(1));
    $('textPath', text).setAttribute('lengthAdjust', 'spacing');
    const NS = 'http://www.w3.org/2000/svg';
    // \u041c\u0435\u0441\u0442\u0430 \u0437\u0432\u0451\u0437\u0434 \u0437\u0430\u0432\u0438\u0441\u044f\u0442 \u043e\u0442 \u0448\u0438\u0440\u0438\u043d\u044b \u0431\u0443\u043a\u0432 \u2014 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u044b\u0432\u0430\u0435\u043c, \u043a\u043e\u0433\u0434\u0430 \u0448\u0440\u0438\u0444\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0441\u044f
    const place = () => {
    $$('.badge-star', svg).forEach(p => p.remove());
    [...raw].forEach((c, i) => {
      if (c !== '\u2726' || i >= text.getNumberOfChars()) return;
      const a = text.getStartPositionOfChar(i), b = text.getEndPositionOfChar(i);
      const ang = text.getRotationOfChar(i) * Math.PI / 180;
      const x = (a.x + b.x) / 2 + Math.sin(ang) * 4.6, y = (a.y + b.y) / 2 - Math.cos(ang) * 4.6;
      const p = document.createElementNS(NS, 'path');
      const unit = (svg.getBoundingClientRect().width || 140) / 200 * .42;
      p.setAttribute('d', crossStar(10, 10, Math.min(1.5, .5 / unit), 4.2));
      p.setAttribute('class', 'badge-star');
      p.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${text.getRotationOfChar(i).toFixed(1)}) scale(.42)`);
      svg.append(p);
    });
    };
    // Каждая буква — отдельным знаком на своём месте окружности: так буквы можно увеличивать по одной, не сдвигая соседей
    const letters = () => {
      $$('.badge-ch', svg).forEach(n => n.remove());
      badgeChars.length = 0;
      const n = text.getNumberOfChars();
      [...raw].forEach((c, i) => {
        if (c === '\u00a0' || c === '\u2726' || i >= n) return;
        const a = text.getStartPositionOfChar(i), b = text.getEndPositionOfChar(i);
        const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2, r = text.getRotationOfChar(i);
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('class', 'badge-ch');
        t.setAttribute('text-anchor', 'middle');
        t.textContent = c;
        t.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(1)})`);
        svg.append(t);
        badgeChars.push({ el: t, x, y, r, s: 1 });
      });
      text.style.fill = 'transparent';
    };
    place(); letters();
    document.fonts.ready.then(() => { place(); letters(); });
  })();
  /* \u2014\u2014\u2014 \u0414\u0435\u0442\u0430\u043b\u0438 \u00ab\u0431\u0438\u043b\u0435\u0442\u0430\u00bb: \u0441\u043b\u0443\u0436\u0435\u0431\u043d\u044b\u0435 \u0441\u0442\u0440\u043e\u043a\u0438, \u0448\u0442\u0440\u0438\u0445\u043a\u043e\u0434\u044b, \u043a\u043e\u0434\u044b, \u0442\u043e\u0447\u043a\u0438, \u0437\u0430\u0440\u0435\u0437\u0430\u043d\u043d\u044b\u0435 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0438 \u2014\u2014\u2014 */
  // \u0428\u0442\u0440\u0438\u0445\u043a\u043e\u0434 \u0438\u0437 \u0441\u0442\u0440\u043e\u043a\u0438: \u043e\u0434\u0438\u043d\u0430\u043a\u043e\u0432\u044b\u0439 \u043f\u0440\u0438 \u043a\u0430\u0436\u0434\u043e\u0439 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0435
  function barcode(str, n = 46) {
    let h = 2166136261;
    for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 1000) / 1000;
    let x = 0, bars = '';
    for (let k = 0; k < n; k++) {
      const w = rnd() < 0.62 ? 1 : rnd() < 0.7 ? 2 : 3;
      bars += `<rect x="${x}" y="0" width="${w}" height="40"/>`;
      x += w + (rnd() < 0.6 ? 1 : 2);
    }
    return `<svg class="barcode" viewBox="0 0 ${x} 40" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
  }
  const dots = (pattern = '\u25cf\u25cf \u25cf') => `<span class="dots" aria-hidden="true">${[...pattern].map(c => (c === ' ' ? '<i class="gap"></i>' : '<i></i>')).join('')}</span>`;
  const totalLogos = LOGOS.reduce((n, g) => n + g.images.length, 0);
  const SEC_META = {
    branding: { n: '01', code: 'BR', count: P.length, unit: 'projects', field: 'Brand identity, logo, system', access: 'Pit \u2014 identity', word: 'Identity' },
    logos: { n: '02', code: 'LG', count: totalLogos, unit: `logos in ${LOGOS.length} collections`, field: 'Logos drawn from letters', access: 'Mark \u2014 lettering', word: 'Marks' },
    fonts: { n: '03', code: 'FT', count: FONTS_ALL.length, unit: 'typefaces', field: 'Custom and library type', access: 'Type \u2014 specimen', word: 'Letters' },
  };
  $$('.shelf').forEach(sec => {
    const m = SEC_META[sec.id];
    if (!m) return;
    const code = `ZTH\u2014${m.code}\u2014${String(m.count).padStart(2, '0')}`;
    $('.shelf-head', sec).insertAdjacentHTML('beforebegin', `
      <div class="meta-rule mono" aria-hidden="true">
        <span>Section ${m.n} / 03</span><span class="meta-line"></span><span>Index: ${esc(m.field.toLowerCase())}</span><span class="meta-code">${code}</span>
      </div>`);
  });
  // \u041f\u0435\u0440\u0432\u044b\u0439 \u044d\u043a\u0440\u0430\u043d: \u0448\u0442\u0440\u0438\u0445\u043a\u043e\u0434 \u0438 \u043a\u043e\u0434 \u0440\u044f\u0434\u043e\u043c \u0441 \u00abScroll to explore\u00bb, \u0441\u043b\u0443\u0436\u0435\u0431\u043d\u0430\u044f \u0441\u0442\u0440\u043e\u043a\u0430 \u0441 \u043d\u043e\u043c\u0435\u0440\u043e\u043c
  $('.hero').insertAdjacentHTML('afterbegin', `<div class="hero-meta mono" aria-hidden="true"><span>Pass: full access</span><span class="meta-line"></span><span>No. 001</span></div>`);
  // \u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b \u043f\u0440\u043e\u043d\u0443\u043c\u0435\u0440\u043e\u0432\u0430\u043d\u044b, \u043a\u0430\u043a \u043f\u0443\u043d\u043a\u0442\u044b \u0432 \u0431\u0438\u043b\u0435\u0442\u0435
  $$('.contacts li').forEach((li, i) => $('.mono', li)?.insertAdjacentHTML('afterbegin', `${pad(i + 1)}. `));

  arrows(document.body);
  // \u041f\u043b\u044e\u0441 \u0443 \u0440\u0430\u0437\u0434\u0435\u043b\u043e\u0432 \u2014 \u0442\u043e\u0442 \u0436\u0435 \u043a\u0440\u0435\u0441\u0442: \u0442\u043e\u043d\u043a\u0438\u0435 \u043b\u0443\u0447\u0438 \u0438 \u0432\u043e\u0433\u043d\u0443\u0442\u044b\u0435 \u0434\u0443\u0433\u0438 \u0443 \u0446\u0435\u043d\u0442\u0440\u0430
  $('.badge-core').innerHTML = `<svg class="plus-star core-star" viewBox="-10 -10 20 20" aria-hidden="true"><path/></svg><svg class="plus-arrow core-arrow" viewBox="-8.5 -8.5 17 17" aria-hidden="true"><path/></svg>`;
  /* Наведение на бейдж: вместо креста — стрелка, идёт по кругу как секундная, но 8 шагами по 45°,
     с пружинкой, начиная с 12 часов. Надпись по кругу разгоняется и потом плавно сбавляет до обычной скорости */
  {
    const badge = $('.badge'), arrow = $('.core-arrow');
    badgeArrow = arrow;
    let step = 0, timer = 0;
    const set = () => arrow.style.setProperty('--a', `${-45 + step * 45}deg`);
    badge.addEventListener('pointerenter', () => {
      clearInterval(timer); step = 0; set();
      badge.classList.add('is-hot');
      if (!reduce) timer = setInterval(() => { step++; set(); }, 620);
    });
    badge.addEventListener('pointerleave', () => { clearInterval(timer); badge.classList.remove('is-hot'); });
  }
  // \u041f\u043b\u044e\u0441 \u0443 \u0440\u0430\u0437\u0434\u0435\u043b\u0430: \u043a\u0440\u0435\u0441\u0442, \u043f\u0440\u0438 \u043d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0438 \u043f\u043e\u0432\u043e\u0440\u0430\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u0438 \u043f\u0440\u0435\u0432\u0440\u0430\u0449\u0430\u0435\u0442\u0441\u044f \u0432 \u0441\u0442\u0440\u0435\u043b\u043a\u0443 \u0432 \u043f\u0440\u0430\u0432\u044b\u0439 \u0432\u0435\u0440\u0445\u043d\u0438\u0439 \u0443\u0433\u043e\u043b
  $$('.shelf-plus').forEach(b => (b.innerHTML = `<svg class="plus-star" viewBox="-10 -10 20 20" aria-hidden="true"><path/></svg><svg class="plus-arrow" viewBox="-8.5 -8.5 17 17" aria-hidden="true"><path/></svg>`));
  // \u0422\u043e\u043d\u043a\u0438\u0435 \u0447\u0430\u0441\u0442\u0438 \u043a\u0440\u0435\u0441\u0442\u043e\u0432 \u0438 \u0437\u0432\u0451\u0437\u0434 \u2014 \u0440\u043e\u0432\u043d\u043e 1 \u043f\u0438\u043a\u0441\u0435\u043b\u044c \u043d\u0430 \u044d\u043a\u0440\u0430\u043d\u0435 \u043f\u0440\u0438 \u043b\u044e\u0431\u043e\u043c \u0440\u0430\u0437\u043c\u0435\u0440\u0435
  function hairlines() {
    $$('.plus-star').forEach(svg => {
      const px = svg.clientWidth || 60;
      $('path', svg).setAttribute('d', crossStar(10, 10, 10 / px, 4.4));
    });
    // \u0412\u0441\u0442\u0440\u043e\u0435\u043d\u043d\u044b\u0435 \u0441\u0442\u0440\u0435\u043b\u043a\u0438: \u043f\u043e\u043b\u0443\u0442\u043e\u043b\u0449\u0438\u043d\u0430 0,5 px \u043f\u0440\u0438 \u043f\u043e\u043b\u0435 24 \u0435\u0434\u0438\u043d\u0438\u0446\u044b
    $$('svg.ar').forEach(svg => {
      const px = svg.clientWidth || parseFloat(getComputedStyle(svg).fontSize) * .82 || 12;
      // \u0412\u0441\u0435 \u0441\u0442\u0440\u0435\u043b\u043a\u0438 \u2014 \u0441 \u0434\u043b\u0438\u043d\u043d\u044b\u043c\u0438 \u0443\u0441\u0430\u043c\u0438, \u043a\u0430\u043a \u0443 \u0441\u0442\u0440\u0435\u043b\u043a\u0438 \u0432 \u043a\u0440\u0443\u0433\u0435
      $('path', svg).setAttribute('d', filletArrow(12 / px, 5.2, 16));
    });
    $$('.plus-arrow').forEach(svg => {
      const px = svg.clientWidth || 40; // \u0431\u0435\u0437 \u0443\u0447\u0451\u0442\u0430 \u043f\u043e\u0432\u043e\u0440\u043e\u0442\u0430 \u0438 \u043c\u0430\u0441\u0448\u0442\u0430\u0431\u0430 \u043f\u0440\u0438 \u043d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0438
      $('path', svg).setAttribute('d', filletArrow(8.5 / px, 5.2)); // \u043f\u043e\u043b\u0435 17 \u0435\u0434\u0438\u043d\u0438\u0446: \u043f\u043e\u043b\u0443\u0442\u043e\u043b\u0449\u0438\u043d\u0430 = 0,5 px
    });
    const mq = $('.mq-star svg');
    if (mq) {
      const d = crossStar(10, 10, 10 / (mq.getBoundingClientRect().width || 40), 4.2);
      $$('.mq-star svg path').forEach(p => p.setAttribute('d', d));
    }
  }
  hairlines();
  document.fonts.ready.then(hairlines);

  // \u0421\u043f\u0438\u0441\u043e\u043a Fonts: \u043f\u0440\u0438 \u043d\u0430\u0432\u0435\u0434\u0435\u043d\u0438\u0438 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0448\u0440\u0438\u0444\u0442\u043e\u043c \u2014 \u0432 \u0446\u0432\u0435\u0442 \u0435\u0433\u043e \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438
  $$('.frow.has-face').forEach(row => { const p = FONTS_ALL.find(f => f.slug === row.dataset.slug); if (p) row.style.setProperty('--nc', plateInk(p)); });

  /* \u2014\u2014\u2014 Start \u2014\u2014\u2014 */
  bindPreviews(document);
  showLogos(0);
  observe(document);
  route();
  showFontTab('custom');
  runLoader(() => document.documentElement.classList.add('is-ready'));
})();
