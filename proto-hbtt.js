/* Подача Heavy Black Tattoo (Тель-Авив): только чёрное и белое, косые штрихи и перевёрнутые кресты.
   Всё набрано шрифтом студии. В шрифте два наклона: прописные — с сильным наклоном вперёд,
   строчные — прямые; логотип и монограмма лежат в шрифте знаком «)» (нарисован зеркально). Из картинок — только входная группа. */
(() => {
  // В знаке «)» лежит зеркально монограмма и вордмарк рядом — отражаем и вырезаем нужную часть
  const LOGO = '<span class="hb-wm"><span class="hb-g">)</span></span>';   // вордмарк HEAVYBLACKTATTOO
  // Монограмма HB и три креста — векторный контур с исходного макета
  const MONO_D = 'M534.8 597.0L508.0 597.0L508.0 596.3L508.0 595.5L518.0 570.0L527.9 544.5L532.3 533.0L536.7 521.5L497.4 521.2L458.0 521.0L458.0 520.7L458.0 520.3L466.5 498.9L475.0 477.5L475.0 476.2L475.0 475.0L369.0 475.0L263.0 475.0L263.0 474.5L263.0 474.0L269.9 456.3L276.8 438.5L286.4 413.5L296.1 388.5L300.7 377.0L305.2 365.5L314.5 341.5L323.8 317.5L336.8 284.0L349.8 250.5L362.5 218.0L375.1 185.5L387.1 154.6L399.0 123.6L399.8 122.8L400.6 122.0L507.2 122.2L613.7 122.5L607.3 139.0L600.9 155.5L590.5 182.0L580.1 208.5L570.0 234.2L559.9 260.0L532.8 260.2L505.8 260.5L497.4 281.8L489.0 303.2L489.0 304.1L489.0 305.0L515.5 305.0L542.0 305.0L542.0 305.4L542.0 305.7L533.9 326.6L525.9 347.5L515.8 373.0L505.8 398.5L495.0 426.0L484.2 453.5L480.5 463.0L476.8 472.5L476.3 473.8L475.8 475.0L515.3 475.0L554.8 475.0L557.8 467.2L560.8 459.5L575.0 423.0L589.2 386.5L601.0 356.0L612.8 325.5L624.5 295.5L636.2 265.5L643.7 246.0L651.2 226.5L660.0 204.0L668.8 181.5L676.9 160.5L684.9 139.5L688.4 131.0L691.8 122.5L718.6 122.0L745.4 121.5L754.4 98.8L763.3 76.0L803.7 75.8L844.1 75.5L852.4 54.5L860.7 33.5L867.1 17.0L873.6 0.5L900.8 0.2L928.0 -0.0L925.9 5.2L923.8 10.5L911.8 41.0L899.9 71.5L899.0 73.8L898.0 76.0L936.5 76.0L975.0 76.0L975.0 77.2L975.0 78.5L967.0 98.9L959.0 119.4L959.0 120.7L959.0 122.0L985.5 122.2L1011.9 122.5L1003.4 144.5L994.8 166.5L984.0 194.5L973.2 222.5L961.1 253.5L949.1 284.5L936.5 317.0L923.8 349.5L913.0 377.5L902.2 405.5L894.0 426.5L885.9 447.5L880.9 460.1L876.0 472.8L876.0 473.9L876.0 475.0L915.1 475.0L954.1 475.0L953.6 476.8L953.0 478.5L944.7 499.5L936.3 520.5L896.7 520.8L857.0 521.0L857.0 521.4L857.0 521.7L847.9 545.1L838.9 568.5L833.4 582.8L827.8 597.0L800.9 597.0L774.0 597.0L774.0 596.5L774.0 596.0L778.1 585.8L782.2 575.5L792.0 550.0L801.8 524.5L802.5 522.8L803.2 521.0L764.1 521.0L725.0 521.0L725.0 519.8L725.0 518.5L732.8 498.5L740.7 478.5L741.3 476.8L741.9 475.0L781.5 475.0L821.0 475.0L821.9 472.8L822.8 470.5L835.8 437.0L848.8 403.5L863.0 367.0L877.2 330.5L884.7 311.0L892.1 291.5L896.5 280.5L900.9 269.5L912.5 239.5L924.2 209.5L933.0 186.5L941.8 163.5L949.5 144.0L957.2 124.5L957.7 123.3L958.2 122.0L919.2 122.0L880.1 122.0L872.4 141.7L864.7 161.5L851.8 194.5L838.9 227.5L828.5 254.0L818.1 280.5L805.0 314.0L791.9 347.5L780.0 378.0L768.1 408.5L755.1 441.5L742.2 474.5L714.9 475.0L687.7 475.5L679.0 498.0L670.3 520.5L630.7 520.8L591.1 521.0L584.0 539.3L576.9 557.5L569.2 577.2L561.5 597.0L534.8 597.0ZM27.1 474.8L0.1 475.0L1.4 471.3L2.8 467.5L11.0 446.5L19.2 425.5L28.5 401.5L37.8 377.5L50.8 344.0L63.8 310.5L73.3 286.0L82.8 261.5L89.5 244.5L96.2 227.5L99.0 220.0L101.8 212.5L112.9 184.0L124.1 155.5L130.6 138.8L137.2 122.0L164.2 122.0L191.2 122.0L190.5 123.7L189.9 125.5L181.1 148.0L172.3 170.5L161.2 199.0L150.1 227.5L144.1 243.0L138.2 258.5L138.9 259.3L139.6 260.0L190.5 259.8L241.3 259.5L242.1 258.0L243.0 256.5L253.8 228.5L264.7 200.5L276.8 169.5L288.8 138.5L292.0 130.2L295.1 122.0L322.2 122.0L349.2 122.0L348.5 123.7L347.8 125.5L341.3 142.5L334.8 159.5L328.3 176.0L321.8 192.5L313.5 214.0L305.2 235.5L293.5 265.5L281.8 295.5L269.0 328.5L256.2 361.5L244.5 391.5L232.8 421.5L224.4 443.5L215.9 465.5L214.1 470.0L212.4 474.5L185.2 474.8L158.0 475.0L160.1 469.8L162.2 464.5L172.0 439.0L181.9 413.5L195.5 378.5L209.2 343.5L216.1 325.6L223.0 307.8L223.0 306.4L223.0 305.0L171.6 305.0L120.2 305.0L113.1 322.8L106.1 340.5L96.5 365.5L86.8 390.5L76.5 417.0L66.2 443.5L60.2 459.0L54.2 474.5L27.1 474.8ZM648.6 474.8L688.2 474.5L690.6 468.5L692.9 462.5L706.0 429.0L719.1 395.5L731.0 365.0L742.9 334.5L756.0 301.0L769.1 267.5L777.0 247.5L784.9 227.5L795.0 201.5L805.2 175.5L814.7 151.0L824.2 126.5L825.1 124.2L826.0 122.0L785.9 122.2L745.8 122.5L739.3 139.0L732.8 155.5L722.0 183.5L711.2 211.5L697.0 248.0L682.8 284.5L675.5 303.5L668.2 322.5L662.5 337.0L656.8 351.5L647.3 376.0L637.8 400.5L626.0 431.0L614.3 461.5L611.6 467.9L609.0 474.3L609.0 474.7L609.0 475.0L648.6 474.8ZM387.2 429.8L439.4 429.5L443.8 418.5L448.2 407.5L458.0 382.5L467.8 357.5L477.9 331.6L488.0 305.8L488.0 305.4L488.0 305.0L435.3 305.2L382.6 305.5L378.7 315.5L374.8 325.5L363.3 355.0L351.8 384.5L343.4 406.3L335.0 428.1L335.0 429.0L335.0 430.0L387.2 429.8ZM453.3 260.0L505.7 260.0L515.3 235.8L524.9 211.5L533.4 189.7L542.0 167.8L542.0 167.4L542.0 167.0L489.2 167.0L436.4 167.0L430.3 182.8L424.2 198.5L412.6 228.3L401.0 258.2L401.0 259.1L401.0 260.0L453.3 260.0Z';
  const MONO = `<svg class="hb-ms" viewBox="0 0 1012 597" aria-label="HBTT"><path fill="currentColor" fill-rule="evenodd" d="${MONO_D}"/></svg>`;
  const crosses = n => 'TT'.repeat(n);
  const units = t => t.match(/TT|./g) || [];
  // Набор как в логотипе: наклон меняется по словам (HEAVY — наклон, BLACK — прямо, TATTOO — наклон),
  // длинные слова ломаются посередине, крест TT всегда остаётся прямым крестом. Буквы стоят вплотную.
  const setLogo = (text, start = 0) => {
    const out = []; let w = start;
    text.split(/( )/).forEach(word => {
      if (word === ' ') { out.push(' '); return; }
      const us = units(word.toUpperCase());
      const half = us.length >= 7 ? Math.ceil(us.length / 2) : us.length;
      us.forEach((u, i) => {
        const up = (w + (i >= half ? 1 : 0)) % 2 === 1;   // нечётные части — прямые (строчные знаки шрифта)
        out.push(up && u !== 'TT' && u !== 'I' ? u.toLowerCase() : u);   // строчная i в шрифте читается как черта — оставляем прописную
      });
      w += us.length >= 7 ? 2 : 1;
    });
    return out;
  };
  const logoHTML = (text, start) => setLogo(text, start).map(u => (u === ' ' ? '<i class="hb-sp"></i>' : `<span class="hb-u">${u}</span>`)).join('');
  const lab = (t, cls = 'tl') => `<p class="hb-lab ${cls}">${t}</p>`;
  const QUOTE = ['SHOW A MAN', 'WITH A TATTOO', 'AND I WILL SHOW', 'YOU A MAN WITH', 'AN INTERESTING', 'PAST'];
  const ZINE = [['WE', 'MAKE', 'BLACK', 'TATTOOS'], ['ONLY', 'BLACK'], ['TLV', 'HEAVY', 'BLACK', 'TATTOO']];

  const SLIDES = [
    // 01 — обложка: ленты пересекаются, на свободном белом — монограмма: три полосы крестов и логотипа пересекаются
    () => `<section class="hb-s hb-tape">
      ${[-14, 9, -3].map((r, k) => `<div class="hb-tp" style="--r:${r}deg;--k:${k}"><div class="${k === 1 ? 'rev' : ''}">${(crosses(6) + ' ' + LOGO + ' ').repeat(6)}</div></div>`).join('')}
      ${lab('Tattoo studio · Tel Aviv', 'tl dark')}
      <div class="hb-tape-mark">${MONO}</div>
    </section>`,

    // 02 — о проекте
    () => `<section class="hb-s hb-about">
      ${lab('01 — Brief')}
      <h3 class="hb-about-h" data-gap=".05">${[['MAKE', 'FONTS'], ['NOT', 'WARS']].map((ws, k) => `<span class="hb-ln"><span style="--k:${k}">${ws.map(w => [...w].map(c => `<span class="hb-u">${c}</span>`).join('')).join(k ? '<i class="hb-sp" data-w=".1"></i>' : '')}</span></span>`).join('')}</h3>
      <div class="hb-about-t">
        <p><a href="https://heavyblacktattoo.com/" target="_blank" rel="noopener">Heavy Black Tattoo</a> is a custom logo and typeface for a Tel Aviv tattoo studio that specialises in blackwork and bold, high-contrast styles. The brief: an identity as fierce and distinctive as the tattoos made inside.</p>
        <p>Research ran from Middle Eastern tattoo culture to the raw visual noise of Tel Aviv and the studio’s own aggressive, outlined, monochrome graphics. The answer: geometric distortion, steep diagonals, an unstable rhythm and deliberate visual weight. Every letter was drawn by hand — not to blend into the city, but to cut through it.</p>
        <p>The heavy forward slant and rigid geometry evoke movement and pressure, echoing the impact of the tattoo machine. The identity quickly became a landmark: people came not only for the tattoos, but to see the studio itself.</p>
      </div>
    </section>`,

    // 03 — цитата: буквы «набиваются» по одной, наклонные вперемешку с прямыми
    () => `<section class="hb-s hb-quote">
      ${lab('02 — Manifesto')}
      <p class="hb-q">${(() => {
        // Как в исходнике: вся цитата прямыми строчными знаками шрифта, без креста-лигатуры, буквы вплотную
        let n = 0;
        return QUOTE.map((l, li) => `<span class="hb-ql${li % 2 ? ' rev' : ''}" style="--l:${li}">${[...l.toLowerCase()].map(c => (c === ' ' ? '<span class="hb-qs"></span>' : `<span class="hb-u" style="--n:${n++}">${c}</span>`)).join('')}</span>`).join('');
      })()}</p>
    </section>`,

    // 04 — монограмма: переворачивается на 180°, перевёрнутые кресты становятся прямыми
    () => `<section class="hb-s hb-mono">
      ${lab('03 — Monogram')}
      <div class="hb-mono-t"><span>${MONO}</span></div>
      ${lab('Turn it 180° — the crosses turn with it', 'bl')}
    </section>`,

    // 05 — знак: лист флэша, кресты переворачиваются волной
    () => `<section class="hb-s hb-flash">
      ${lab('04 — The mark')}
      <div class="hb-grid">${Array.from({ length: 21 }, (_, k) => `<span style="--k:${k};--x:${k % 7};--y:${Math.floor(k / 7)}"><b>TT</b></span>`).join('')}</div>
    </section>`,

    // 06 — полосы крестов (раньше обложка): полосы из крестов едут навстречу, в центре проявляется логотип; «удар машинки» инвертирует кадр
    () => `<section class="hb-s hb-cover">
      <div class="hb-rows">${Array.from({ length: 5 }, (_, k) => `<div class="hb-row${k % 2 ? ' rev' : ''}" style="--k:${k}"><span>${crosses(30)}</span></div>`).join('')}</div>
      <div class="hb-band"><h3 class="hb-word" aria-label="Heavy Black Tattoo">${LOGO}</h3></div>
      ${lab('05 — Pattern')}${lab('Only black', 'tr')}
    </section>`,

    // 07 — входная группа (картинка), медленный наезд, подпись моргает как неон
    () => `<section class="hb-s hb-door">
      <img src="img/hbttt/entrance.jpg" alt="Heavy Black Tattoo storefront in Tel Aviv" loading="lazy" draggable="false">
      <p class="hb-door-t">${logoHTML('TEL AVIV')}</p>
      ${lab('06 — Storefront')}
    </section>`,

    // 08 — мерч: логотип бежит по «рукавам», в центре монограмма на груди
    () => `<section class="hb-s hb-merch">
      <div class="hb-sleeve a"><div class="hb-rot"><div>${(LOGO + ' ').repeat(8)}</div></div></div>
      <div class="hb-sleeve b"><div class="hb-rot"><div>${(LOGO + ' ').repeat(8)}</div></div></div>
      <div class="hb-chest"><b>${MONO}</b><span>${logoHTML('ONLY BLACK')}</span></div>
      ${lab('07 — Merch', 'tl dark')}
    </section>`,

    // 09 — зин: слова переключаются между наклонными прописными и прямыми строчными того же шрифта
    () => `<section class="hb-s hb-zine">
      ${ZINE.map((ws, r) => `<div class="hb-zl" style="--r:${r}"><i>0${r + 1}</i>${ws.map((w, k) => `<span class="hb-zw" style="--k:${k}"><b>${w}</b><em>${w.toLowerCase()}</em></span>`).join('')}</div>`).join('')}
      ${lab('08 — Zine', 'tr')}
    </section>`,

    // 10 — финал: крест идёт по кругу 8 шагами с пружинкой
    () => `<section class="hb-s hb-end">
      <div class="hb-end-mq"><div>${(LOGO + ' ').repeat(6)}</div></div>
      <div class="hb-seal"><b>TT</b></div>
      <p class="hb-end-t">${logoHTML('BOOK A SESSION')}<span>Heavy Black Tattoo · Tel Aviv</span></p>
    </section>`,
  ];

  function mount(root) {
    root.classList.add('hbt');
    root.innerHTML = SLIDES.map(s => s()).join('');
    const $ = (s, el = root) => el.querySelector(s);
    const $$ = (s, el = root) => [...el.querySelectorAll(s)];
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) root.classList.add('no-anim');
    const slides = $$('.hb-s');
    const io = new IntersectionObserver(es => es.forEach(e => {
      e.target.classList.toggle('is-live', e.isIntersecting);
      if (e.isIntersecting) e.target.classList.add('is-in');
    }), { threshold: 0.3 });
    slides.forEach(s => io.observe(s));
    slides.forEach(s => {
      s.addEventListener('pointermove', e => {
        const r = s.getBoundingClientRect();
        s.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        s.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      s.addEventListener('pointerleave', () => { s.style.setProperty('--mx', 0); s.style.setProperty('--my', 0); });
    });

    /* Буквы встают вплотную: для каждой пары считаем по строкам пикселей, насколько правый край
       левой буквы заходит за левый край правой, и сдвигаем так, чтобы они касались, но не наезжали */
    const prof = new Map();
    const profile = u => {
      if (prof.has(u)) return prof.get(u);
      const S = 160, cv = document.createElement('canvas');
      cv.width = S * 4; cv.height = S * 2;
      const x = cv.getContext('2d', { willReadFrequently: true });
      x.font = `${S}px "HBTT P"`;
      const ox = S, by = S * 1.25;
      x.fillText(u, ox, by);
      const d = x.getImageData(0, 0, cv.width, cv.height).data, rows = [];
      for (let y = 0; y < cv.height; y += 3) {
        let l = -1, r = -1;
        for (let xx = 0; xx < cv.width; xx++) if (d[(y * cv.width + xx) * 4 + 3] > 90) { if (l < 0) l = xx; r = xx; }
        rows.push(l < 0 ? null : [(l - ox) / S, (r - ox) / S]);
      }
      const p = { rows, adv: x.measureText(u).width / S };
      prof.set(u, p);
      return p;
    };
    const GAP = 0.025;
    const fit = () => {
      const lines = new Set($$('.hb-u').map(el => el.parentElement));
      lines.forEach(line => {
        const gap = parseFloat(line.closest('[data-gap]')?.dataset.gap ?? GAP);
        let prev = null, extra = 0;
        [...line.children].forEach(el => {
          // Пробел внутри заголовка с data-w — не разрыв, а добавка к обычному зазору
          if (el.dataset.w) { extra += parseFloat(el.dataset.w); el.style.width = '0'; return; }
          if (!el.classList.contains('hb-u')) { prev = null; extra = 0; return; }
          const cur = profile(el.textContent);
          if (prev) {
            let need = -Infinity;
            cur.rows.forEach((r, k) => { const q = prev.rows[k]; if (r && q) need = Math.max(need, q[1] - r[0]); });
            if (need === -Infinity) need = prev.adv;
            el.style.marginLeft = `${(need + gap + extra - prev.adv).toFixed(3)}em`;
          }
          prev = cur; extra = 0;
        });
      });
    };
    document.fonts.load('100px "HBTT P"', 'HBTT').then(fit);

    const timers = [];
    const live = sel => $(sel)?.classList.contains('is-live');
    const every = (ms, fn) => timers.push(setInterval(() => { if (!root.isConnected) return timers.forEach(clearInterval); if (!reduce) fn(); }, ms));

    const cov = $('.hb-cover');
    every(3600, () => { if (!live('.hb-cover')) return; cov.classList.add('hit'); setTimeout(() => cov.classList.remove('hit'), 420); });
    cov.addEventListener('click', () => cov.classList.toggle('inv'));

    const q = $('.hb-quote'), total = QUOTE.join('').replace(/ /g, '').length;
    every(7000, () => { if (!live('.hb-quote')) return; q.classList.remove('is-in'); void q.offsetWidth; q.classList.add('is-in'); });

    const mono = $('.hb-mono-t > span'); let turn = 0;
    const flip = () => { turn += 180; mono.style.setProperty('--t', `${turn}deg`); $('.hb-mono').classList.toggle('flip', (turn / 180) % 2 === 1); };
    every(2600, () => { if (live('.hb-mono')) flip(); });
    $('.hb-mono').addEventListener('click', flip);

    const zl = $$('.hb-zl'); let zi = 0;
    every(1400, () => { if (!live('.hb-zine')) return; zl[zi % zl.length].classList.toggle('low'); zi++; });

    const seal = $('.hb-seal b'); let st = 0;
    every(700, () => { if (!live('.hb-end')) return; st++; seal.style.setProperty('--a', `${st * 45}deg`); });
  }

  // Обложка для сетки и превью: только монограмма на чёрном. HB въезжает, кресты падают сверху и снизу, потом «удары машинки»
  const bentoCover = () => `<span class="hb-bc">
    <span class="hb-bc-m">${['mid', 'top', 'bot', 'cut'].map(k => `<span class="hb-bc-l ${k}">${MONO}</span>`).join('')}</span>
  </span>`;

  window.PROTOS = window.PROTOS || {};
  window.PROTOS.hbttt = { mount, replacesGallery: true, replacesCover: true, bentoCover };
})();
