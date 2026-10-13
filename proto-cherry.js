/* Подача проекта Drunk Cherry («Салон пьяная вишня») — слайд-в-слайд повтор раскадровки Figma,
   набрано собственным шрифтом бренда (Drunk Cheerry, уже есть в библиотеке шрифтов сайта).
   Бордовый фон, курсив-скоропись, вишнёвый узор. Слова выезжают при появлении, узор покачивается. */
(() => {
  const A = 'img/drunk-cherry/';
  const V = '?v=4';
  const src = f => window.CHERRY_ASSETS?.[f] || A + f + V;
  const BG = '#790132';

  const frame = (cls, inner) => `<div class="rf ${cls}">${inner}</div>`;
  const P = (W, H) => ({
    W, H,
    box: (x, y, w, h) => `left:${(x / W) * 100}%;top:${(y / H) * 100}%;width:${(w / W) * 100}%;height:${(h / H) * 100}%;`,
    cq: px => `${(px / W) * 100}cqw`,
  });
  const p = P(1920, 1080);

  // Слово — окно-маска (.rw), содержимое (.rwi) выезжает снизу при появлении кадра
  const word = (t, x, y, size, k, align) => {
    const style = `left:${(x / p.W) * 100}%;top:${(y / p.H) * 100}%;font-size:${p.cq(size)};${align ? `text-align:${align};` : ''}`;
    return `<p class="ct" style="${style}--i:${k}"><span class="ln"><span class="rw"><span class="rwi">${t}</span></span></span></p>`;
  };
  const rot = (x, y, w, h, deg, inner) =>
    `<div class="c-rot" style="${p.box(x, y, w, h)}transform:rotate(${deg}deg)">${inner}</div>`;

  const SLIDES = [
    // 1 — обложка: заголовок курсивом вразлёт, вишнёвый узор покачивается рядом
    () => frame('c0', `
      <img class="c-pattern is-sway" src="${src('cherry-pattern.svg')}" alt="" draggable="false" style="${p.box(242, 228, 1089.74, 526)}">
      ${rot(606, 34, 1344.6, 652.76, -6.52, `
        ${word('ДЕГУСТАЦИИ', 0, 0, 155, 0, 'center')}
        ${word('ВИНА и', 0, 200.4, 155, 1, 'center')}
        ${word('ШОКОЛАДА', 0, 400.8, 155, 2, 'center')}`)}`),

    // 2 — три строки статистики, каждая со своим поворотом
    () => frame('c1', `
      ${rot(162, 100, 750.28, 283.44, 8.67, `${word('456—БУТЫЛОК', 0, 0, 87.63, 0, 'center')}${word('ВЫПИТО', 0, 113.3, 87.63, 1, 'center')}`)}
      ${rot(505.55, 473, 907.895, 226.6, 0, `${word('36—ДЕГУСТАЦИЙ', 0, 0, 87.63, 2, 'center')}${word('ЗА ГОД', 0, 113.3, 87.63, 3, 'center')}`)}
      ${rot(332, 738, 1624.15, 263.12, -3.13, `${word('261—ПЛИТКА ШОКОЛАДА', 0, 0, 87.63, 4, 'center')}${word('СЪЕДЕНА', 0, 113.3, 87.63, 5, 'center')}`)}`),

    // 3 — алфавит фирменным шрифтом (у него нет строчных — показываем только прописные)
    () => frame('c2', `
      ${word('АБВГДЕЁЖЗИЙ', 0, 170, 110, 0)}
      ${word('КЛМНОПРСТУФ', 0, 440, 110, 1)}
      ${word('ЦЧШЩЪЫЬЮЯ', 0, 710, 110, 2)}`),

    // 4 — три карточки мероприятий (экспорт из Figma целиком — тонкая линейная графика)
    () => frame('c3 is-photo-only', `<img class="rimg is-events" src="${src('events.jpg')}" alt="Drunk Cherry events: Georgian feast, Champagne tasting, chocolate history" draggable="false">`),

    // 5 — постеры на стене
    () => frame('c4 is-photo-only', `<img class="rimg is-pan" src="${src('wall.jpg')}" alt="Drunk Cherry posters pasted on a wall" draggable="false">`),
  ];

  function mount(root) {
    root.classList.add('cherry');
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
  window.PROTOS['drunk-cherry'] = { mount, replacesGallery: true, replacesCover: true };
})();
