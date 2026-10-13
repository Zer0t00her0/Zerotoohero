/* Подача STS Sans — фирменный шрифт телеканала. Собрана с нуля, без картинок проекта:
   всё набрано самим шрифтом (6 начертаний), каждый слайд живой — как эфирная графика. */
(() => {
  const CYR = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
  const WEIGHTS = [['Thin', 100], ['Regular', 400], ['Medium', 500], ['Bold', 700], ['ExtraBold', 800], ['Black', 900]];
  const pad = n => String(n).padStart(2, '0');
  // Слово по буквам: каждая буква качает насыщенность со сдвигом — «волна» от Thin к Black
  const wave = (t, step = 0.14, cls = '') => [...t].map((c, i) => `<span class="st-wv ${cls}" style="--i:${i};--d:${(i * step).toFixed(2)}s">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  // Строки, выезжающие снизу из-под маски
  const lines = (arr, k0 = 0) => arr.map((l, k) => `<span class="st-ln"><span style="--k:${k0 + k}">${l}</span></span>`).join('');
  const label = (t, cls = '') => `<p class="st-lab ${cls}">${t}</p>`;
  const odo = d => `<span class="st-odo" data-v="${d}"><span>${'0123456789'.split('').map(x => `<i>${x}</i>`).join('')}</span></span>`;

  const SLIDES = [
    // 01 — обложка: название дышит насыщенностью, как заставка канала
    () => `<section class="st-s st-cover">
      ${label('Custom typeface · 2025', 'tl')}
      <p class="st-lab tr"><b class="st-dot"></b>On air</p>
      <h3 class="st-cover-t">${wave('СТС')}</h3>
      <p class="st-cover-sub">${lines(['S A N S'])}</p>
      <div class="st-cover-w">${WEIGHTS.map(([n, w], k) => `<span style="font-weight:${w};--k:${k}">${n}</span>`).join('')}</div>
    </section>`,

    // 02 — задача
    () => `<section class="st-s st-brief">
      ${label('01 — Brief', 'tl')}
      <h3 class="st-h">${lines(['A typeface', 'that speaks in', 'the channel’s voice'])}</h3>
      <div class="st-p"><p>STS Sans is the custom typeface of the STS television channel. It appears wherever the channel speaks to its audience: in promos, credits, programme schedules, on the website and in the app. It announces premieres, introduces characters and suggests what to watch tonight.</p><p>Built around simple geometric shapes and rounded forms, the typeface sets an open, friendly tone. It has a character of its own while keeping the message centre stage. Large headlines feel confident, while smaller captions stay clear and crisp. Whether on a TV watched from the sofa or a phone held in your hand, STS Sans gives the channel a familiar voice.</p></div>
      <div class="st-stats">
        <div><b data-count="6">0</b><span>styles</span></div>
        <div><b data-count="190">0</b><span>glyphs</span></div>
        <div><b data-count="2">0</b><span>scripts</span></div>
      </div>
    </section>`,

    // 03 — шесть начертаний, подсветка бежит по строкам
    () => `<section class="st-s st-weights">
      ${label('02 — Six weights', 'tl')}
      <div class="st-wrows">${WEIGHTS.map(([n, w], k) => `
        <div class="st-wrow" style="--k:${k}"><span class="st-wn">${n}<i>${w}</i></span><span class="st-ws" style="font-weight:${w}">Смотри, что дальше</span></div>`).join('')}
      </div>
    </section>`,

    // 04 — кириллица: крупная буква листается, в таблице подсвечивается её клетка
    () => `<section class="st-s st-abc">
      ${label('03 — Cyrillic', 'tl')}
      <div class="st-big"><span class="st-bigc">А</span></div>
      <div class="st-cells">${[...CYR, 'S', 'T', 'S'].map((c, k) => `<span class="${k >= CYR.length ? 'lat' : ''}" style="--k:${k}">${c}</span>`).join('')}</div>
      ${label('Same character in Latin — Aa Bb Rr Ss', 'bl')}
    </section>`,

    // 05 — эфир: плашки, бегущая строка, логотип-«жук» и живые часы
    () => `<section class="st-s st-air">
      <div class="st-pic"><i></i><i></i><i></i></div>
      <p class="st-clock"><b class="st-hh">21</b><i>:</i><b class="st-mm">00</b></p>
      <p class="st-bug">СТС</p>
      <div class="st-l3">
        <span class="st-tag">Сейчас</span>
        <div class="st-l3-t"><b>Вечернее шоу</b><span>Премьера сезона · 16+</span></div>
        <span class="st-prog"><i></i></span>
      </div>
      <div class="st-tick"><div>${'Новые серии каждый будний день · Премьера в пятницу в 21:00 · Смотрите нас в приложении · Кино на выходные · '.repeat(4)}</div></div>
      ${label('04 — On-air graphics', 'tl')}
    </section>`,

    // 06 — сетка вещания: «сейчас в эфире» спускается по программе
    () => `<section class="st-s st-sched">
      ${label('05 — Schedule', 'tl')}
      <h3 class="st-h sm">${lines(['Программа', 'передач'])}</h3>
      <ol class="st-list">${[['06:00', 'Утро на канале'], ['09:30', 'Мультфильмы'], ['13:00', 'Дневной сериал'], ['19:00', 'Семейная комедия'], ['21:00', 'Премьера: кино'], ['23:30', 'Ночное шоу']]
        .map(([t, n], k) => `<li style="--k:${k}"><time>${t}</time><span>${n}</span><i></i></li>`).join('')}</ol>
    </section>`,

    // 07 — анонс: обратный отсчёт до премьеры
    () => `<section class="st-s st-count">
      ${label('06 — Promo', 'tl')}
      <div class="st-num"><span>5</span></div>
      <div class="st-cside">
        <p class="st-cday">${lines(['Пятница'])}</p>
        <p class="st-ctime">21:00</p>
        <p class="st-cword">Премьера</p>
      </div>
    </section>`,

    // 08 — цифры: время в эфире крутится как табло
    () => `<section class="st-s st-figs">
      ${label('07 — Figures', 'tl')}
      <p class="st-odo-row">${odo(2)}${odo(1)}<span class="st-colon">:</span>${odo(0)}${odo(0)}</p>
      <p class="st-figline">0 1 2 3 4 5 6 7 8 9 · № ₽ % « » ! ?</p>
    </section>`,

    // 09 — пара: тонкий и жирный качаются навстречу
    () => `<section class="st-s st-pair">
      <div class="st-half a">${label('Ёж — Thin ↔ Black', 'tl')}<p>${wave('Ёж', 0)}</p></div>
      <div class="st-half b">${label('Rg — Black ↔ Thin', 'tl')}<p>${wave('Rg', 0, 'rev')}</p></div>
    </section>`,

    // 10 — финал: бегущие строки во всех начертаниях
    () => `<section class="st-s st-end">
      ${WEIGHTS.map(([n, w], k) => `<div class="st-mq${k % 2 ? ' rev' : ''}" style="font-weight:${w};--k:${k}"><div>${'СТС Sans · Смотри · '.repeat(6)}</div></div>`).join('')}
      <p class="st-end-t">STS Sans<span>Custom typeface for STS TV channel</span></p>
    </section>`,
  ];

  function mount(root) {
    root.classList.add('sts');
    root.innerHTML = SLIDES.map(s => s()).join('');
    const $ = (s, el = root) => el.querySelector(s);
    const $$ = (s, el = root) => [...el.querySelectorAll(s)];
    const slides = $$('.st-s');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) root.classList.add('no-anim');

    const io = new IntersectionObserver(es => es.forEach(e => {
      e.target.classList.toggle('is-live', e.isIntersecting);
      if (e.isIntersecting && !e.target.classList.contains('is-in')) { e.target.classList.add('is-in'); enter(e.target); }
    }), { threshold: 0.3 });
    slides.forEach(s => io.observe(s));

    // Курсор слегка сдвигает крупный набор
    slides.forEach(s => {
      s.addEventListener('pointermove', e => {
        const r = s.getBoundingClientRect();
        s.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        s.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      s.addEventListener('pointerleave', () => { s.style.setProperty('--mx', 0); s.style.setProperty('--my', 0); });
    });

    // Счётчики при первом появлении
    function enter(s) {
      $$('[data-count]', s).forEach(b => {
        const to = +b.dataset.count, t0 = performance.now(), dur = reduce ? 0 : 1400;
        const f = t => { const k = dur ? Math.min(1, (t - t0) / dur) : 1; b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); };
        requestAnimationFrame(f);
      });
    }

    // Общий такт: всё, что меняется по шагам, тикает только пока слайд в кадре
    const live = cls => $(cls)?.classList.contains('is-live');
    const timers = [];
    const every = (ms, fn) => timers.push(setInterval(() => { if (!root.isConnected) return timers.forEach(clearInterval); if (!reduce) fn(); }, ms));

    // Начертания: подсветка бежит по строкам
    const wrows = $$('.st-wrow'); let wi = 0;
    every(1100, () => { if (!live('.st-weights')) return; wrows.forEach((r, k) => r.classList.toggle('on', k === wi)); wi = (wi + 1) % wrows.length; });

    // Кириллица
    const big = $('.st-bigc'), cells = $$('.st-cells span').slice(0, CYR.length); let ci = 0;
    every(900, () => {
      if (!live('.st-abc')) return;
      ci = (ci + 1) % CYR.length;
      big.textContent = CYR[ci];
      big.style.fontWeight = WEIGHTS[ci % WEIGHTS.length][1];
      big.classList.remove('pop'); void big.offsetWidth; big.classList.add('pop');
      cells.forEach((c, k) => c.classList.toggle('on', k === ci));
    });
    cells[0].classList.add('on');
    cells.forEach((c, k) => c.addEventListener('pointerenter', () => { ci = k - 1; }));

    // Эфир: часы и смена плашки «Сейчас / Далее»
    const hh = $('.st-hh'), mm = $('.st-mm');
    const clock = () => { const d = new Date(); hh.textContent = pad(d.getHours()); mm.textContent = pad(d.getMinutes()); };
    clock(); every(15000, clock);
    const L3 = [['Сейчас', 'Вечернее шоу', 'Премьера сезона · 16+'], ['Далее', '22:30 · Кино на выходные', 'Только на нашем канале'], ['Завтра', 'Семейная комедия', 'Новые серии · 19:00']];
    const l3 = $('.st-l3'); let li = 0;
    every(4200, () => {
      if (!live('.st-air')) return;
      l3.classList.add('out');
      setTimeout(() => {
        li = (li + 1) % L3.length;
        const [t, a, b] = L3[li];
        $('.st-tag', l3).textContent = t; $('.st-l3-t b', l3).textContent = a; $('.st-l3-t span', l3).textContent = b;
        l3.classList.remove('out');
      }, 500);
    });

    // Сетка вещания
    const items = $$('.st-list li'); let si = 3;
    const now = () => items.forEach((r, k) => r.classList.toggle('on', k === si));
    now();
    every(1800, () => { if (!live('.st-sched')) return; si = (si + 1) % items.length; now(); });

    // Отсчёт 5…1 → «Премьера»
    const num = $('.st-num span'), cnt = $('.st-count'); let n = 5;
    every(950, () => {
      if (!live('.st-count')) return;
      n = n <= 0 ? 5 : n - 1;
      cnt.classList.toggle('is-zero', n === 0);
      num.textContent = n || '!';
      num.classList.remove('pop'); void num.offsetWidth; num.classList.add('pop');
    });

    // Табло времени
    const odos = $$('.st-odo');
    const setTime = (h, m) => [Math.floor(h / 10), h % 10, Math.floor(m / 10), m % 10].forEach((d, k) => odos[k].style.setProperty('--v', d));
    setTime(21, 0);
    const TIMES = [[21, 0], [19, 30], [6, 0], [23, 45], [13, 15], [9, 30]]; let ti = 0;
    every(2400, () => { if (!live('.st-figs')) return; ti = (ti + 1) % TIMES.length; setTime(...TIMES[ti]); });
  }

  // Живая обложка для сетки и превью на главной
  const bentoCover = () => `<span class="st-bc">
    <span class="st-bc-air"><b class="st-dot"></b>On air</span>
    <span class="st-bc-t">${wave('СТС')}</span>
    <span class="st-bc-s">Sans</span>
    <span class="st-bc-w">${WEIGHTS.map(([n, w], k) => `<i style="font-weight:${w};--k:${k}">${n}</i>`).join('')}</span>
  </span>`;

  window.PROTOS = window.PROTOS || {};
  window.PROTOS.sts_sans_ = { mount, replacesGallery: true, replacesCover: true, bentoCover };
  // Та же обложка у шрифта в разделе Fonts (у него своя страница-образец, поэтому только обложка)
  window.COVERS = window.COVERS || {};
  window.COVERS['font-sts_sans_'] = bentoCover;
})();
