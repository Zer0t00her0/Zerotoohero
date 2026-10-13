/* Подача SpinWin — крипто-казино, тёмно-синий + неоново-лаймовый, стеклянные 3D-иконки.
   Слайд-в-слайд повтор рекламного комплекта: вордмарк выезжает, хедлайн по словам,
   стекло/монеты дышат и покачиваются, мокапы (биллборд/телефон/стена) с медленной панорамой. */
(() => {
  const A = 'img/spinwin-live/';
  const V = '?v=2';
  const src = f => window.SPINWIN_ASSETS?.[f] || A + f + V;
  const NAVY = '#0b1733';
  const LIME = '#9dfb4c';

  const frame = (cls, inner) => `<div class="rf ${cls}">${inner}</div>`;
  const P = (W, H) => ({
    W, H,
    box: (x, y, w, h) => `left:${(x / W) * 100}%;top:${(y / H) * 100}%;width:${(w / W) * 100}%;height:${(h / H) * 100}%;`,
    cq: px => `${(px / W) * 100}cqw`,
  });
  const p = P(1920, 1080);
  const cardP = P(600, 1000); // локальная система одной карточки турнирной тройки (своя контейнерная ширина)

  const makeWord = cp => (t, x, y, size, k, opts = {}) => {
    const { align, color = '#fff', weight = 900, italic = false } = opts;
    const style = `left:${(x / cp.W) * 100}%;top:${(y / cp.H) * 100}%;font-size:${cp.cq(size)};color:${color};font-weight:${weight};${italic ? 'font-style:italic;' : ''}${align ? `text-align:${align};` : ''}`;
    return `<p class="st" style="${style}--i:${k}"><span class="ln"><span class="rw"><span class="rwi">${t}</span></span></span></p>`;
  };
  const word = makeWord(p);
  const cardWord = makeWord(cardP);
  const makeTag = cp => (t, x, y, w, h, k, rot = 0) => `
    <div class="s-tag" style="${cp.box(x, y, w, h)}transform:rotate(${rot}deg);--i:${k}"><span class="s-tag-i">${t}</span></div>`;
  const tag = makeTag(p);
  const cardTag = makeTag(cardP);
  const photo = (file, cls = '') => `<img class="rimg is-photo ${cls}" src="${src(file)}" alt="SpinWin" draggable="false">`;
  const cutout = (file, x, y, w, cls = '') => {
    const h = w; // квадратный холст у всех вырезанных PNG
    return `<img class="s-cut ${cls}" src="${src(file)}" alt="" draggable="false" style="${p.box(x, y, w, h)}">`;
  };

  const SLIDES = [
    // 0 — обложка: вордмарк крупно, стеклянный шар дышит в углу
    () => frame('sw0', `
      ${cutout('orb.png', 1180, -120, 760, 'is-breathe is-sway')}
      <p class="st is-logo" style="left:8.07%;top:38%;--i:0"><span class="ln"><span class="rw"><span class="rwi">SPIN<em>WIN</em></span></span></span></p>`),

    // 1 — хедлайн: криптоказино + welcome bonus 100%, шар и монета парят рядом
    () => frame('sw1', `
      ${cutout('coin.png', 1430, 90, 420, 'is-breathe')}
      ${cutout('orb.png', 1300, 560, 540, 'is-sway')}
      ${word('CRIPTOCASINO', 130, 180, 44, 0, { color: LIME, weight: 700 })}
      ${word('WELCOME', 118, 280, 150, 1)}
      ${word('BONUS <em>100%</em>', 118, 470, 150, 2)}`),

    // 2 — биллборд в городе, медленная панорама
    () => frame('sw2 is-photo-only', photo('billboard.jpg', 'is-pan')),

    // 3 — три турнирные карточки: Frog Fortune / Северное сияние / Odyssey of Riches
    () => frame('sw3', `
      <div class="s-trip">
        <div class="s-card is-green">
          ${cutout('leprechaun.png', 90, 230, 480, 'is-float')}
          ${cardWord('FROG', 40, 60, 60, 0)}${cardWord('FORTUNE', 40, 128, 60, 1)}
          ${cardTag('ПОЛУЧИ 100 FS', 40, 860, 300, 70, 2)}
        </div>
        <div class="s-card is-navy">
          ${cutout('coin.png', 110, 260, 420, 'is-sway')}
          ${cardWord('СЕВЕРНОЕ', 40, 60, 52, 3, { color: LIME })}${cardWord('СИЯНИЕ', 40, 118, 52, 4, { color: LIME })}
          ${cardWord('1.000.000', 40, 860, 68, 5)}
        </div>
        <div class="s-card is-purple">
          ${cutout('wizard.png', 70, 190, 460, 'is-float')}
          ${cardWord('ODYSSEY', 40, 60, 52, 6)}${cardWord('OF RICHES', 40, 118, 52, 7)}
          ${cardTag('100.000', 40, 860, 260, 70, 8)}
        </div>
      </div>`),

    // 4 — мерч: кепка и худи на градиенте тёмно-синий → лайм
    () => frame('sw4', `
      ${cutout('cap.png', 980, 170, 820, 'is-float is-a')}
      ${cutout('hoodie.png', 120, 230, 740, 'is-float is-b')}`),

    // 5 — набор стеклянных иконок (корона, кубик, клевер), дрейф
    () => frame('sw5 is-photo-only', photo('icons.jpg', 'is-pan-slow')),

    // 6 — летящие теги фрибетов
    () => frame('sw6', `
      ${tag('Freespin', 110, 90, 540, 150, 0, -2)}
      ${tag('Bonus play', 760, 220, 460, 110, 1, 2)}
      ${tag('получи 100 fs', 320, 400, 560, 110, 2, -1.5)}
      ${tag('1.000.000', 170, 560, 640, 150, 3, 1)}
      ${tag('Welcome', 860, 700, 460, 110, 4, -2)}`),

    // 7 — телефон: сторис в инстаграме
    () => frame('sw7 is-photo-only', photo('phone.jpg', 'is-breathe')),

    // 8 — расклейка на улице, панорама
    () => frame('sw8 is-photo-only', photo('wall.jpg', 'is-pan')),
  ];

  function mount(root) {
    root.classList.add('spinwin');
    root.innerHTML = SLIDES.map(s => s()).join('');
    const $$ = (sel, el = root) => [...el.querySelectorAll(sel)];
    const slides = $$('.rf');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const io = new IntersectionObserver(entries => entries.forEach(e => {
      e.target.classList.toggle('is-live', e.isIntersecting);
      if (e.isIntersecting) e.target.classList.add('is-in');
    }), { threshold: 0.3 });
    slides.forEach(s => io.observe(s));
    if (reduce) root.classList.add('no-anim');
  }

  window.PROTOS = window.PROTOS || {};
  window.PROTOS.spinwin = { mount, replacesGallery: true, replacesCover: true };
})();
