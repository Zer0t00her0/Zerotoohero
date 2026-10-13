/* Подача Burger Heroes — уличный граффити-стиль, красный/чёрный/белый, персонажи-монстры.
   Исходники — растровая иллюстрация (без раздельных слоёв в Figma), поэтому живость даём
   движением: дыхание/покачивание персонажей, медленная панорама у фото грузовика. */
(() => {
  const A = 'img/burger_heroes/';
  const src = f => window.BURGER_ASSETS?.[f] || A + f;

  const frame = (cls, inner) => `<div class="rf ${cls}">${inner}</div>`;
  const P = (W, H) => ({
    W, H,
    box: (x, y, w, h) => `left:${(x / W) * 100}%;top:${(y / H) * 100}%;width:${(w / W) * 100}%;height:${(h / H) * 100}%;`,
    cq: px => `${(px / W) * 100}cqw`,
  });
  const p = P(2000, 929);

  const word = (t, x, y, size, k, opts = {}) => {
    const { align, color = '#fff' } = opts;
    const style = `left:${(x / p.W) * 100}%;top:${(y / p.H) * 100}%;font-size:${p.cq(size)};color:${color};${align ? `text-align:${align};` : ''}`;
    return `<p class="bt" style="${style}--i:${k}"><span class="ln"><span class="rw"><span class="rwi">${t}</span></span></span></p>`;
  };
  const photo = (file, cls = '') => `<img class="rimg is-photo ${cls}" src="${src(file)}" alt="Burger Heroes" draggable="false">`;

  const SLIDES = [
    // 0 — обложка: герой-монстр с языком, вордмарк наплывает
    () => frame('b0', `
      ${photo('14.jpg', 'is-breathe')}
      <div class="b-plate" style="${p.box(60, 40, 920, 170)}"></div>
      ${word('BURGER HEROES', 90, 70, 72, 0)}
      ${word('Restart — Vasilchuk Brothers', 90, 160, 26, 1, { color: '#ffd9d9' })}`),

    // 1 — язык-монстр лакает
    () => frame('b1 is-photo-only', photo('03.jpg', 'is-breathe')),

    // 2 — змей-бургер
    () => frame('b2 is-photo-only', photo('05.jpg', 'is-sway')),

    // 3 — рука с бургером (жест рок)
    () => frame('b3 is-photo-only', photo('06.jpg', 'is-breathe')),

    // 4 — черепа
    () => frame('b4 is-photo-only', photo('07.jpg', 'is-sway')),

    // 5 — ингредиенты
    () => frame('b5 is-photo-only', photo('08.jpg', 'is-breathe')),

    // 6 — бургер-осьминог
    () => frame('b6 is-photo-only', photo('09.jpg', 'is-sway')),

    // 7 — скетчбук, панорама
    () => frame('b7 is-photo-only', photo('10.jpg', 'is-pan')),

    // 8 — фудтрак днём и ночью
    () => frame('b8 is-photo-only', photo('11.jpg', 'is-pan')),
    () => frame('b9 is-photo-only', photo('12.jpg', 'is-pan-slow')),
  ];

  function mount(root) {
    root.classList.add('burger');
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
  window.PROTOS.burger_heroes = { mount, replacesGallery: true, replacesCover: true };
})();
