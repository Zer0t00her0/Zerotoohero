/* Скрипты презентации BetRush (script.js + design-system.js из макета), переведённые на контейнер:
   разметка и стили живут в Shadow DOM, классы режима движения и CSS-переменные ставятся на host-элемент,
   якорные ссылки макета не трогают hash страницы (им управляет роутер портфолио),
   все слушатели снимаются при размонтировании. Логика раскрытия/ритма — как в макете. */
window.BetrushPresentation = (() => {
  let controller = null;
  let observers = [];
  function mount(host, shadow, { scrollTo } = {}) {
    unmount();
    controller = new AbortController();
    const { signal } = controller;
    const $ = s => shadow.querySelector(s);
    const $$ = s => [...shadow.querySelectorAll(s)];

    /* ---- script.js ---- */
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let motion = !reduced.matches;
    const button = $('#motion');
    const progress = $('.progress');
    const player = $('.hero-player');
    function fitHero() {
      host.style.setProperty('--hero-grid-height', `${Math.floor(Math.max(480, document.documentElement.clientHeight) / 8) * 8}px`);
    }
    fitHero();
    function apply() {
      host.classList.toggle('js-motion', motion);
      host.classList.toggle('motion-off', !motion);
      if (button) {
        button.setAttribute('aria-pressed', String(!motion));
        button.setAttribute('aria-label', motion ? 'Pause motion' : 'Enable motion');
        button.querySelector('span').textContent = motion ? 'ON' : 'OFF';
      }
      if (!motion && player) player.style.transform = 'none';
      update();
    }
    const liveObserver = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('is-live', e.isIntersecting)), { threshold: 0.05 });
    const board = $('.social-board');
    if (board) liveObserver.observe(board);
    $$('.ball-art').forEach(el => liveObserver.observe(el));
    const revealObserver = new IntersectionObserver(entries => entries.forEach(e => {
      const repeat = e.target.matches('h2,h3,.sport-title,.closing-line');
      if (e.isIntersecting) { e.target.classList.add('seen'); if (!repeat) revealObserver.unobserve(e.target); }
      else if (repeat) e.target.classList.remove('seen');
    }), { threshold: 0.08 });
    $$('.reveal').forEach(el => revealObserver.observe(el));
    observers = [liveObserver, revealObserver];
    let queued = false;
    function update() {
      const y = Math.max(0, -host.getBoundingClientRect().top);
      const total = Math.max(0, host.offsetHeight - innerHeight);
      if (progress) progress.style.transform = `scaleX(${total > 0 ? Math.min(1, y / total) : 0})`;
      if (motion && player && y < innerHeight * 1.5) player.style.transform = `translateY(${Math.min(y * .09, 95)}px)`;
      queued = false;
    }
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true, signal });
    button?.addEventListener('click', () => { motion = !motion; apply(); }, { signal });
    reduced.addEventListener('change', () => { motion = !reduced.matches; apply(); }, { signal });
    shadow.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const target = id === 'top' ? 0 : shadow.getElementById(id);
      if (target === null) return;
      if (scrollTo) scrollTo(target);
      else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth' });
    }, { signal });

    /* ---- design-system.js ---- */
    const roles = { brand: '.sport-title>span', ui: '.scroll-caption', title: '.intro h2,.identity-heading h2,.media-intro h2,.merch-copy h2,.ball-break h3', closing: '.closing-line', body: '.intro p,.identity-heading p,.media-intro p,.merch-copy p', copy: '.hero-bottom p,.idea-bottom p', caption: '.hero-top>span,.hero-bottom .eyebrow,.chapter-label>span,.idea-bottom>span,.study-note,.palette>div>span,.sport-note>span,.ball-break .eyebrow,.merch-copy .eyebrow,.social-bottom>span,.full-media figcaption>span,.closing-bottom p' };
    for (const [role, selector] of Object.entries(roles)) $$(selector).forEach(el => { el.classList.add(`type-${role}`); const probe = document.createElement('span'); probe.className = 'baseline-probe'; probe.setAttribute('aria-hidden', 'true'); el.prepend(probe); });
    $$('.full-media>img').forEach(img => { const frame = document.createElement('div'); frame.className = 'media-image'; img.before(frame); frame.append(img); });
    $$('.trust-scene,.social-reel').forEach(el => { const frame = document.createElement('div'); frame.className = 'rhythm-frame'; el.before(frame); frame.append(el); });
    $$('.logo-study>.wordmark,.closing-mark>.wordmark').forEach(el => { const frame = document.createElement('div'); frame.className = 'wordmark-frame'; el.before(frame); frame.append(el); });
    const rhythms = $$('.hero-logo,.rhythm-frame,.wordmark-frame,.logo-study,.sport-scene,.ball-break,.media-image,.merch-scene,.closing-mark');
    rhythms.forEach(el => el.setAttribute('data-rhythm', ''));
    const ceil = n => Math.ceil((n - .01) / 8) * 8;
    let pending;
    function layout() {
      for (const role of Object.keys(roles)) {
        const elements = $$(`.type-${role}`);
        elements.forEach(el => { el.style.setProperty('--type-inset', '0px'); el.style.setProperty('--type-outset', '0px'); });
        const sample = elements.find(el => getComputedStyle(el).display !== 'none' && el.getClientRects().length);
        if (!sample) continue;
        const baseline = sample.querySelector('.baseline-probe').getBoundingClientRect().top - sample.getBoundingClientRect().top;
        const inset = Math.max(0, ceil(baseline) - baseline);
        const outset = inset > .01 ? 8 - inset : 0;
        elements.forEach(el => { el.style.setProperty('--type-inset', `${inset}px`); el.style.setProperty('--type-outset', `${outset}px`); });
      }
      rhythms.forEach(el => el.style.setProperty('--rhythm-tail', '0px'));
      [...rhythms].reverse().forEach(el => { const height = el.getBoundingClientRect().height; el.style.setProperty('--rhythm-tail', `${Math.max(0, ceil(height) - height)}px`); });
    }
    function schedule() { cancelAnimationFrame(pending); pending = requestAnimationFrame(() => { if (host.isConnected) layout(); }); }
    document.fonts.ready.then(schedule);
    $$('img').forEach(img => { img.addEventListener('load', schedule, { signal }); img.addEventListener('error', schedule, { signal }); });
    addEventListener('resize', () => { fitHero(); update(); schedule(); }, { signal });
    signal.addEventListener('abort', () => cancelAnimationFrame(pending));

    apply();
    schedule();
  }
  function unmount() {
    controller?.abort();
    controller = null;
    observers.forEach(o => o.disconnect());
    observers = [];
  }
  return { mount, unmount };
})();
/* Скрипт презентации e302 (script.js из макета), переведённый на контейнер: разметка и стили живут в Shadow DOM,
   классы режима движения и CSS-переменные ставятся на host-элемент, события плеера ходят через host,
   якоря не трогают hash страницы (им управляет роутер портфолио), при размонтировании звук останавливается,
   а слушатели/наблюдатели снимаются. Вся логика анимаций, бит-машины и треков — как в макете. */
window.E302Presentation = (() => {
  let controller = null;
  let observers = [];
  let cleanup = [];
  function mount(host, shadow, { scrollTo } = {}) {
    unmount();
    controller = new AbortController();
    const { signal } = controller;
    const $ = s => shadow.querySelector(s);
    const $$ = s => [...shadow.querySelectorAll(s)];
    const observe = (o, el) => { observers.push(o); if (el) o.observe(el); return o; };

    const reduce = matchMedia('(prefers-reduced-motion: reduce)'), button = $('#motion'); let motion = !reduce.matches;
    const apply = () => { host.classList.toggle('js-motion', motion); host.classList.toggle('motion-off', !motion); button.setAttribute('aria-pressed', String(!motion)); button.querySelector('span').textContent = motion ? 'ON' : 'OFF'; if (!motion) shadow.getAnimations().forEach(a => { if (a.effect?.getTiming().iterations !== Infinity) a.finish(); }); };
    button.addEventListener('click', () => { motion = !motion; apply(); });
    reduce.addEventListener('change', () => { motion = !reduce.matches; apply(); }, { signal });
    apply();
    observe(new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('seen', e.isIntersecting)), { threshold: .05 }), $('.hero-art'));
    const reveal = observe(new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('seen', e.isIntersecting)), { threshold: .05 })); $$('.reveal').forEach(e => reveal.observe(e));
    /* Distinct entry choreography; final typography keeps its original line boxes. */
    const headingSpecs = [
      ['.project-intro h1', 'impact'], ['.release-copy h2', 'slice'], ['.social-heading h2', 'decode'],
      ['.campaign-heading h2', 'neon'], ['.objects-heading h2', 'assemble'],
      ['.platform-link:nth-of-type(1) .title', 'wave'], ['.platform-link:nth-of-type(2) .title', 'slice'], ['.closing-bottom .title', 'hinge']
    ];
    const headings = [];
    for (const [selector, effect] of headingSpecs) {
      const el = $(selector); if (!el) continue;
      const lines = el.innerHTML.split(/<br\s*\/?\s*>/i); el.setAttribute('aria-label', lines.map(l => l.replace(/<[^>]*>/g, '')).join(' ')); el.classList.remove('reveal'); el.classList.add('motion-heading'); el.dataset.effect = effect;
      el.replaceChildren(); lines.forEach((line, i) => { if (i) el.append(document.createElement('br')); const span = document.createElement('span'); span.className = 'motion-line'; span.setAttribute('aria-hidden', 'true');
        line.split(/(\s+)/).forEach(word => { if (/^\s+$/.test(word)) { span.append(document.createTextNode(word)); return; } const w = document.createElement('span'); w.className = 'motion-word'; for (const c of word) { const char = document.createElement('span'); char.className = 'motion-char'; char.textContent = c; w.append(char); } span.append(w); }); el.append(span); });
      el.dataset.motionPending = ''; headings.push(el);
    }
    function runHeading(el) {
      delete el.dataset.motionPending; if (!motion) return;
      const effect = el.dataset.effect, lines = [...el.querySelectorAll('.motion-line')]; let units = lines;
      if (effect === 'decode') units = [...el.querySelectorAll('.motion-char')]; if (effect === 'assemble') units = [...el.querySelectorAll('.motion-word')];
      units.forEach((unit, i) => {
        let frames, duration = 1200, delay = i * 120, easing = 'cubic-bezier(.16,1,.3,1)';
        switch (effect) {
          case 'shutter': frames = [{ opacity: 1, clipPath: 'inset(49% 0 49% 0)', transform: 'translateX(-24px)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)', transform: 'none' }]; duration = 1400; delay = i * 220; break;
          case 'impact': frames = [{ opacity: 0, transform: 'translateY(105%) scaleY(1.35)', filter: 'blur(8px)' }, { opacity: 1, transform: 'translateY(-5%) scaleY(.96)', filter: 'blur(0px)', offset: .72 }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }]; break;
          case 'slice': frames = [{ opacity: 1, clipPath: 'inset(0 100% 0 0)', transform: 'translateX(-32px)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', transform: 'none' }]; delay = i * 190; duration = 1450; break;
          case 'decode': frames = [{ opacity: 0, transform: `translateY(${i % 2 ? '-28' : '28'}px) rotate(${i % 2 ? '-12' : '12'}deg)`, filter: 'blur(9px)' }, { opacity: .65, transform: 'translateY(0) rotate(0)', filter: 'blur(3px)', offset: .5 }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }]; delay = (i % 7) * 65 + Math.floor(i / 7) * 35; duration = 950; break;
          case 'neon': frames = [{ opacity: 0, filter: 'blur(14px)', textShadow: '0 0 0 currentColor' }, { opacity: .2, filter: 'blur(6px)', textShadow: '0 0 36px currentColor', offset: .32 }, { opacity: .85, filter: 'blur(1px)', textShadow: '0 0 20px currentColor', offset: .6 }, { opacity: .5, filter: 'blur(0)', textShadow: '0 0 5px currentColor', offset: .75 }, { opacity: 1, filter: 'blur(0)', textShadow: '0 0 0 transparent' }]; duration = 1800; break;
          case 'assemble': frames = [{ opacity: 0, transform: `translateX(${i % 2 ? '60' : '-60'}px) scaleX(.7)`, filter: 'blur(3px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }]; delay = i * 160; duration = 1300; break;
          case 'wave': frames = [{ opacity: 0, clipPath: 'polygon(0 100%,100% 100%,100% 100%,0 100%)', transform: 'translateY(24px)' }, { opacity: 1, clipPath: 'polygon(0 0,100% 12%,100% 100%,0 100%)', transform: 'translateY(0)', offset: .65 }, { opacity: 1, clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', transform: 'none' }]; duration = 1400; delay = i * 180; break;
          case 'hinge': frames = [{ opacity: 0, transform: 'perspective(700px) rotateX(-85deg)', transformOrigin: '50% 100%' }, { opacity: 1, transform: 'perspective(700px) rotateX(0deg)', transformOrigin: '50% 100%' }]; duration = 1500; delay = i * 200; break;
        }
        const animation = unit.animate(frames, { duration, delay, easing, fill: 'both' }); animation.finished.then(() => animation.cancel()).catch(() => {});
      });
    }
    const headingObserver = observe(new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) runHeading(e.target); }), { threshold: .25})); headings.forEach(e => headingObserver.observe(e));
    const eventStage = $('.event-stage');
    if (eventStage) observe(new IntersectionObserver(entries => entries.forEach(e => { e.target.classList.toggle('is-live', e.isIntersecting); if (e.isIntersecting) { if (motion) e.target.querySelectorAll('.event-row').forEach((row, i) => row.animate([{ opacity: 0, clipPath: 'inset(0 0 100% 0)', transform: `translateX(${i % 2 ? 32 : -32}px)` }, { opacity: 1, clipPath: 'inset(0 0 0 0)', transform: 'none' }], { duration: 1200, delay: i * 160, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' })); } }), { threshold: .15 }), eventStage);

    $$('.flip-card').forEach(card => {
      const open = card.querySelector('.cover-open'), close = card.querySelector('.cover-close'), front = card.querySelector('.cover-front'), back = card.querySelector('.cover-back');
      function flip(value) { card.classList.toggle('is-flipped', value); open.setAttribute('aria-expanded', String(value)); front.inert = value; back.inert = !value; (value ? close : open).focus({ preventScroll: true });
        if (value && motion) { card.querySelectorAll('.cover-code,.cover-title,.cover-description,.cover-listen').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(20px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }], { duration: 700, delay: 350 + i * 110, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' })); }
      }
      card.querySelector('.cover-rotor').addEventListener('transitionend', schedule); open.addEventListener('click', () => flip(true)); close.addEventListener('click', () => flip(false)); card.addEventListener('keydown', e => { if (e.key === 'Escape' && card.classList.contains('is-flipped')) { e.preventDefault(); flip(false); } });
    });
    const palette = $('.beat-machine');
    if (palette) {
      const play = palette.querySelector('.beat-play'), tempo = palette.querySelector('input'), cells = [...palette.querySelectorAll('.beat-cell')];
      let ctx, master, noise, playing = false, visible = false, timer, preview, step = 0, next = 0; const visualTimers = new Set();
      const seconds = () => 60 / Math.max(100, Math.min(190, Number(tempo.value) || 160)) / 4;
      function show(n) { if (!visible) return; palette.dataset.step = String(n + 1); palette.querySelectorAll('.beat-playhead').forEach(p => { const row = p.parentElement, c = row.children[n]; p.style.left = `${c.offsetLeft}px`; }); cells.forEach(c => c.classList.toggle('is-hit', Number(c.dataset.step) === n && c.classList.contains('is-on'))); }
      function silentPreview() { clearInterval(preview); if (visible && !playing && motion) { show(step); preview = setInterval(() => { show(step); step = (step + 1) % 16; }, seconds() * 1000); } }
      function envelope(node, t, length, level) { const gain = ctx.createGain(); gain.gain.setValueAtTime(.0001, t); gain.gain.exponentialRampToValueAtTime(level, t + .002); gain.gain.exponentialRampToValueAtTime(.0001, t + length); node.connect(gain); gain.connect(master); return gain; }
      // 808-inspired voices, synthesized locally without sample downloads.
      function drum(voice, t) {
        if (voice === 'kick') {
          const body = ctx.createOscillator(); body.type = 'sine'; body.frequency.setValueAtTime(145, t); body.frequency.exponentialRampToValueAtTime(53, t + .028); body.frequency.exponentialRampToValueAtTime(48, t + .18);
          const amp = ctx.createGain(); amp.gain.setValueAtTime(.0001, t); amp.gain.exponentialRampToValueAtTime(1, t + .003); amp.gain.exponentialRampToValueAtTime(.28, t + .18); amp.gain.exponentialRampToValueAtTime(.0001, t + .58); body.connect(amp); amp.connect(master); body.start(t); body.stop(t + .6); body.onended = () => { body.disconnect(); amp.disconnect(); };
          const click = ctx.createBufferSource(), hp = ctx.createBiquadFilter(); click.buffer = noise; hp.type = 'highpass'; hp.frequency.value = 1800; click.connect(hp); const tickAmp = envelope(hp, t, .012, .13); click.start(t); click.stop(t + .014); click.onended = () => { click.disconnect(); hp.disconnect(); tickAmp.disconnect(); }; return;
        }
        if (voice === 'perc') {
          // Two non-harmonic square oscillators form the cowbell body.
          const mix = ctx.createGain(), filter = ctx.createBiquadFilter(); mix.gain.value = .22; filter.type = 'bandpass'; filter.frequency.value = 850; filter.Q.value = .8; mix.connect(filter); const amp = envelope(filter, t, .18, .58);
          const tones = [540, 800].map(f => { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(mix); o.start(t); o.stop(t + .2); return o; }); tones[0].onended = () => { tones.forEach(o => o.disconnect()); mix.disconnect(); filter.disconnect(); amp.disconnect(); }; return;
        }
        if (voice === 'hat') {
          // Six detuned square waves create a metallic closed hi-hat.
          const mix = ctx.createGain(), band = ctx.createBiquadFilter(), high = ctx.createBiquadFilter(); mix.gain.value = .22; band.type = 'bandpass'; band.frequency.value = 8500; band.Q.value = .65; high.type = 'highpass'; high.frequency.value = 5500; mix.connect(band); band.connect(high); const amp = envelope(high, t, .085, .7);
          const tones = [205.3, 304.4, 369.6, 522.7, 540, 800].map(f => { const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(mix); o.start(t); o.stop(t + .095); return o; }); tones[0].onended = () => { tones.forEach(o => o.disconnect()); mix.disconnect(); band.disconnect(); high.disconnect(); amp.disconnect(); }; return;
        }
        // Clap: three short noise bursts followed by a softer room-like tail.
        const clap = (at, length, level) => { const source = ctx.createBufferSource(), band = ctx.createBiquadFilter(), high = ctx.createBiquadFilter(); source.buffer = noise; band.type = 'bandpass'; band.frequency.value = 1250; band.Q.value = .65; high.type = 'highpass'; high.frequency.value = 700; source.connect(band); band.connect(high); const amp = envelope(high, at, length, level); source.start(at); source.stop(at + length + .005); source.onended = () => { source.disconnect(); band.disconnect(); high.disconnect(); amp.disconnect(); }; };
        clap(t, .012, .85); clap(t + .014, .012, .72); clap(t + .028, .012, .62); clap(t + .042, .19, .5);
      }
      function tick() { while (next < ctx.currentTime + .1) { const n = step; cells.filter(c => Number(c.dataset.step) === n && c.classList.contains('is-on')).forEach(c => drum(c.dataset.voice, next)); const id = setTimeout(() => { visualTimers.delete(id); if (playing) show(n); }, Math.max(0, (next - ctx.currentTime) * 1000)); visualTimers.add(id); next += seconds(); step = (step + 1) % 16; } }
      function stop() { playing = false; clearInterval(timer); visualTimers.forEach(clearTimeout); visualTimers.clear(); if (master) master.gain.setTargetAtTime(0, ctx.currentTime, .015); play.textContent = 'PLAY BEAT'; play.setAttribute('aria-pressed', 'false'); palette.dataset.playing = 'false'; silentPreview(); }
      host.addEventListener('e302:playback', e => { if (e.detail !== 'beat' && playing) stop(); }, { signal });
      play.addEventListener('click', async () => { if (playing) { stop(); return; } play.disabled = true; try { if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); const limiter = ctx.createDynamicsCompressor(); limiter.threshold.value = -12; limiter.ratio.value = 8; master.connect(limiter); limiter.connect(ctx.destination); noise = ctx.createBuffer(1, ctx.sampleRate * .4, ctx.sampleRate); const data = noise.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1; } await ctx.resume(); host.dispatchEvent(new CustomEvent('e302:playback', { detail: 'beat' })); clearInterval(preview); master.gain.setValueAtTime(.36, ctx.currentTime); playing = true; step = 0; next = ctx.currentTime + .05; palette.dataset.playing = 'true'; play.textContent = 'STOP BEAT'; play.setAttribute('aria-pressed', 'true'); tick(); timer = setInterval(tick, 25); } catch { play.textContent = 'TRY PLAY BEAT'; } finally { play.disabled = false; } });
      cells.forEach(c => c.addEventListener('click', () => { const on = c.classList.toggle('is-on'); c.setAttribute('aria-pressed', String(on)); if (!on) c.classList.remove('is-hit'); }));
      tempo.addEventListener('change', () => { tempo.value = String(Math.max(100, Math.min(190, Number(tempo.value) || 160))); silentPreview(); });
      observe(new IntersectionObserver(entries => { visible = entries[0].isIntersecting; palette.classList.toggle('is-live', visible); silentPreview(); }, { threshold: .1 }), palette);
      button.addEventListener('click', silentPreview); reduce.addEventListener('change', silentPreview, { signal }); document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); clearInterval(preview); } else silentPreview(); }, { signal });
      cleanup.push(() => { visible = false; stop(); clearInterval(preview); if (ctx) ctx.close().catch(() => {}); });
    }
    // Local recordings and precomputed RMS waveforms; only one source plays at a time.
    const trackPlayers = $$('.track-player'); let currentTrack = null, playRequest = 0, trackFrame;
    function formatTime(s) { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
    function paintTrack(row) { const audio = row.querySelector('audio'), duration = audio.duration || Number(row.dataset.duration), time = audio.currentTime, fraction = duration ? time / duration : 0; row.querySelector('.wave-clip').setAttribute('width', String(Math.min(360, Math.max(0, fraction * 360)))); row.querySelector('.track-wave').setAttribute('aria-valuenow', String(Math.floor(time))); row.querySelector('.track-wave').setAttribute('aria-valuetext', `${formatTime(time)} of ${formatTime(duration)}`); row.querySelector('.track-duration').textContent = `−${formatTime(Math.max(0, duration - time))}`; row.querySelector('.track-duration').setAttribute('aria-label', `${formatTime(Math.max(0, duration - time))} remaining`); }
    function stopTrack(row) { if (!row) return; const audio = row.querySelector('audio'); audio.pause(); row.classList.remove('is-playing'); const control = row.querySelector('.track-play'); control.setAttribute('aria-pressed', 'false'); control.setAttribute('aria-label', `Play ${row.dataset.title}`); control.querySelector('span').textContent = '▶'; paintTrack(row); }
    function stopTracks() { playRequest++; cancelAnimationFrame(trackFrame); trackPlayers.forEach(stopTrack); currentTrack = null; }
    function followTrack() { if (!currentTrack) return; paintTrack(currentTrack); trackFrame = requestAnimationFrame(followTrack); }
    host.addEventListener('e302:playback', e => { if (e.detail !== 'track') stopTracks(); }, { signal });
    cleanup.push(stopTracks);
    trackPlayers.forEach(row => {
      const audio = row.querySelector('audio'), control = row.querySelector('.track-play'), wave = row.querySelector('.track-wave'), error = row.querySelector('.track-error');
      async function startTrack() {
        stopTracks(); host.dispatchEvent(new CustomEvent('e302:playback', { detail: 'track' })); currentTrack = row; const request = playRequest; error.hidden = true;
        if (audio.ended) audio.currentTime = 0;
        row.classList.add('is-playing'); control.setAttribute('aria-pressed', 'true'); control.setAttribute('aria-label', `Pause ${row.dataset.title}`); control.querySelector('span').textContent = '■';
        try { await audio.play(); if (request !== playRequest) { if (currentTrack !== row) audio.pause(); return; } followTrack(); } catch { if (request === playRequest) { stopTracks(); error.hidden = false; } }
      }
      control.addEventListener('click', () => { if (currentTrack === row) { stopTracks(); return; } startTrack(); });
      function seek(value) { const duration = audio.duration || Number(row.dataset.duration); if (!Number.isFinite(duration)) return; audio.currentTime = Math.max(0, Math.min(duration, value)); paintTrack(row); }
      let dragging = false;
      function seekPointer(e) { const rect = wave.getBoundingClientRect(); seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * (audio.duration || Number(row.dataset.duration))); }
      wave.addEventListener('pointerdown', e => { if (e.button !== 0) return; dragging = true; wave.setPointerCapture(e.pointerId); wave.focus({ preventScroll: true }); row.classList.add('is-seeking'); seekPointer(e); if (currentTrack !== row || audio.paused) startTrack(); });
      wave.addEventListener('pointermove', e => { if (dragging) seekPointer(e); });
      function endSeek(e) { if (!dragging) return; dragging = false; row.classList.remove('is-seeking'); if (wave.hasPointerCapture(e.pointerId)) wave.releasePointerCapture(e.pointerId); }
      wave.addEventListener('pointerup', endSeek); wave.addEventListener('pointercancel', endSeek); wave.addEventListener('lostpointercapture', () => { dragging = false; row.classList.remove('is-seeking'); });
      wave.addEventListener('keydown', e => { if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) { e.preventDefault(); seek(e.key === 'Home' ? 0 : e.key === 'End' ? (audio.duration || Number(row.dataset.duration)) : audio.currentTime + (e.key === 'ArrowRight' ? 5 : -5)); } });
      audio.addEventListener('loadedmetadata', () => { wave.setAttribute('aria-valuemax', String(Math.floor(audio.duration))); paintTrack(row); }); audio.addEventListener('ended', () => { audio.currentTime = 0; paintTrack(row); if (currentTrack === row) stopTracks(); }); audio.addEventListener('error', () => { if (currentTrack === row) { stopTracks(); error.hidden = false; } });
    });
    const signalStage = $('.signal-stage'); if (signalStage) observe(new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('is-live', e.isIntersecting)), { threshold: .1 }), signalStage);
    const roles = ['title', 'statement', 'body', 'lead', 'caption']; for (const role of roles) $$(`.${role}`).forEach(e => { if (e.closest('.nav')) return; const p = document.createElement('span'); p.className = 'baseline-probe'; p.setAttribute('aria-hidden', 'true'); e.prepend(p); });
    $$('.wide-media>img,.print-pair figure>img,.album-frame>img,.poster-spread>img,.artist-spread>img,.social-item>img,.social-item a>img,.campaign-banner>img').forEach(e => { const w = document.createElement('div'); w.className = 'media-frame'; e.before(w); w.append(e); });
    const frames = $$('.media-frame,.hero-art,.flip-card'); frames.forEach(e => e.setAttribute('data-rhythm', ''));
    let pending; const ceil = n => Math.ceil((n - .01) / 8) * 8;
    function layout() {
      if (!host.isConnected) return;
      const ringPoster = $('.ring-poster'); if (ringPoster) ringPoster.style.setProperty('--ring-height', `${Math.ceil(Math.max(640, ringPoster.clientWidth * .7) / 8) * 8}px`);
      if (eventStage) eventStage.style.setProperty('--event-height', `${Math.ceil(Math.max(640, eventStage.clientWidth * 1.08) / 8) * 8}px`);
      host.style.setProperty('--hero-height', `${Math.floor(Math.max(640, document.documentElement.clientHeight) / 8) * 8}px`);
      $$('.baseline-probe').forEach(p => { const e = p.parentElement; e.style.setProperty('--type-inset', '0px'); e.style.setProperty('--type-outset', '0px'); const b = p.getBoundingClientRect().top - e.getBoundingClientRect().top, inset = ceil(b) - b; e.style.setProperty('--type-inset', `${inset}px`); e.style.setProperty('--type-outset', `${inset > .01 ? 8 - inset : 0}px`); });
      frames.forEach(e => e.style.setProperty('--rhythm-tail', '0px')); [...frames].reverse().forEach(e => { let h = e.getBoundingClientRect().height; e.style.setProperty('--rhythm-tail', `${ceil(h) - h}px`); });
    }
    function schedule() { cancelAnimationFrame(pending); pending = requestAnimationFrame(layout); } $$('details').forEach(e => e.addEventListener('toggle', schedule)); document.fonts.ready.then(schedule); addEventListener('resize', schedule, { signal }); if (document.readyState !== 'complete') addEventListener('load', schedule, { signal }); $$('img').forEach(e => e.addEventListener('load', schedule));
    cleanup.push(() => cancelAnimationFrame(pending));
    const progress = $('.progress');
    addEventListener('scroll', () => { const y = Math.max(0, -host.getBoundingClientRect().top), max = host.offsetHeight - innerHeight; progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`; }, { passive: true, signal });
    shadow.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const target = id === 'top' ? 0 : shadow.getElementById(id);
      if (target === null) return;
      if (scrollTo) scrollTo(target);
      else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth' });
    }, { signal });
    schedule();
  }
  function unmount() {
    cleanup.forEach(fn => { try { fn(); } catch {} });
    cleanup = [];
    controller?.abort();
    controller = null;
    observers.forEach(o => o.disconnect());
    observers = [];
  }
  return { mount, unmount };
})();
/* Скрипты презентации Criminal (app.js + motion.js + details.js + connections.js из макета), переведённые на контейнер:
   разметка и стили живут в Shadow DOM, поиск элементов идёт внутри него, якоря не трогают hash страницы,
   цикл анимации, наблюдатели и слушатели останавливаются при размонтировании. Логика — как в макете. */
window.CriminalPresentation = (() => {
  let controller = null;
  let observers = [];
  let alive = false;
  function mount(host, shadow, { scrollTo } = {}) {
    unmount();
    controller = new AbortController();
    alive = true;
    const { signal } = controller;
    const $ = id => shadow.getElementById(id);
    const $$ = s => [...shadow.querySelectorAll(s)];
    const observe = o => { observers.push(o); return o; };

    /* ---- app.js ---- */
    const shows = [['ПОСЛЕДНИЙ<br>СВИДЕТЕЛЬ', 'ДЕТЕКТИВНЫЙ СЕРИАЛ', 'СЕГОДНЯ / 21:00'], ['Без<br>следа', 'ПСИХОЛОГИЧЕСКИЙ ТРИЛЛЕР', 'ПЯТНИЦА / 23:45'], ['ЧУЖОЕ<br>АЛИБИ', 'КРИМИНАЛЬНОЕ КИНО', 'ЗАВТРА / 19:30']];
    function active(selector, b) { $$(selector).forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-pressed', String(x === b)); }); }
    $$('[data-show]').forEach(b => b.onclick = () => { const s = shows[+b.dataset.show]; $('show').innerHTML = s[0]; $('genre').textContent = s[1]; $('time').textContent = s[2]; active('[data-show]', b); });
    const scripts = { cyr: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ', lat: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', num: '0123456789!?&@%«»₽€' };
    function choose(c, b) { $('big').textContent = c; $('unicode').textContent = 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'); active('#grid button', b); }
    let currentScript = 'cyr', currentCase = 'upper';
    function render(key) { currentScript = key; const chars = currentCase === 'lower' ? scripts[key].toLowerCase() : scripts[key]; $$('[data-case]').forEach(b => b.disabled = key === 'num'); $('grid').replaceChildren(); [...chars].forEach(c => { const b = document.createElement('button'); b.textContent = c; b.setAttribute('aria-label', 'Show glyph ' + c); b.onclick = () => choose(c, b); $('grid').append(b); }); while ($('grid').children.length < 35) { const empty = document.createElement('span'); empty.className = 'glyph-placeholder'; empty.setAttribute('aria-hidden', 'true'); $('grid').append(empty); } const n = key === 'cyr' ? 7 : 0; choose(chars[n], $('grid').children[n]); }
    $$('[data-script]').forEach(b => b.onclick = () => { active('[data-script]', b); render(b.dataset.script); });
    $$('[data-case]').forEach(b => b.onclick = () => { currentCase = b.dataset.case; active('[data-case]', b); render(currentScript); });
    render('cyr');
    const measureCanvas = document.createElement('canvas'), measureContext = measureCanvas.getContext('2d'); let autoSize = true;
    function resize() { if (!alive) return; const field = $('text'), slider = $('size'); measureContext.font = '100px Criminal'; const longest = Math.max(1, ...field.value.split('\n').map(line => measureContext.measureText(line).width)); const safeWidth = Math.max(20, field.clientWidth - parseFloat(getComputedStyle(field).paddingRight) - parseFloat(getComputedStyle(field).paddingLeft) - 4); const fit = Math.max(12, Math.floor(safeWidth * 100 / longest)); const maximum = Math.min(180, fit); slider.min = Math.min(32, maximum); slider.max = maximum; if (autoSize || +slider.value > maximum) slider.value = maximum; field.style.fontSize = slider.value + 'px'; $('value').textContent = slider.value + ' PX'; field.style.height = 'auto'; field.style.height = field.scrollHeight + 4 + 'px'; }
    $('size').oninput = () => { autoSize = false; resize(); }; $('text').addEventListener('input', resize); addEventListener('resize', resize, { signal }); document.fonts.ready.then(resize);
    $('invert').onclick = function () { this.setAttribute('aria-pressed', shadow.querySelector('.tester').classList.toggle('inverted')); };
    $('reset').onclick = () => { $('text').value = 'У каждого\nесть мотив.'; autoSize = true; resize(); shadow.querySelector('.tester').classList.remove('inverted'); $('invert').setAttribute('aria-pressed', 'false'); };

    /* ---- motion.js ---- */
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const states = new Map();
    function setup(el, source) { const text = source || el.dataset.type; el.dataset.type = text; el.replaceChildren(); const letters = []; text.split('|').forEach((line, i) => { if (i) el.append(document.createElement('br')); [...line].forEach(c => { const s = document.createElement('span'); s.className = 'letter'; s.textContent = c; el.append(s); letters.push(s); }); }); const caret = document.createElement('i'); caret.className = 'type-caret'; caret.setAttribute('aria-hidden', 'true'); el.append(caret); const s = { el, letters, caret, pos: 0, elapsed: 0, hold: 0, section: el.closest('section'), done: false }; states.set(el, s); if (reduce.matches) finish(s); return s; }
    function place(s) { const letter = s.letters[Math.max(0, s.pos - 1)]; if (!letter) return; const r = letter.getBoundingClientRect(), p = s.el.getBoundingClientRect(); s.caret.style.left = (s.pos ? r.right - p.left : r.left - p.left) + 'px'; s.caret.style.top = (r.top - p.top + r.height * .15) + 'px'; s.caret.style.height = r.height * .68 + 'px'; if (s.el.tagName === 'H1') shadow.querySelector('.carriage').style.setProperty('--carriage', Math.min(98, s.pos / s.letters.length * 98) + '%'); }
    function finish(s) { s.letters.forEach(l => l.classList.add('ink')); s.pos = s.letters.length; s.done = true; place(s); }
    $$('[data-type]').forEach(el => setup(el));
    const sections = $$('main>section'); const visible = new Set();
    const observer = observe(new IntersectionObserver(es => es.forEach(e => { e.target.classList.toggle('offscreen', !e.isIntersecting); if (e.isIntersecting) { visible.add(e.target); e.target.classList.add('entered'); } else visible.delete(e.target); }), { threshold: .08 })); sections.forEach(s => { s.classList.add('reveal-section'); observer.observe(s); });
    let last = 0, clock = 0, clockPaint = 0;
    function frame(t) { if (!alive) return; const dt = Math.min(t - last, 100); last = t; if (!document.hidden && !host.classList.contains('paused') && !reduce.matches) { states.forEach(s => { if (!visible.has(s.section)) return; if (s.done) { s.hold += dt; if (s.hold > 5200) { s.letters.forEach(l => l.classList.remove('ink', 'strike')); s.pos = 0; s.done = false; s.hold = 0; s.elapsed = -600; place(s); } return; } s.elapsed += dt; const speed = s.el.classList.contains('report-line') ? 72 : 145; if (s.elapsed >= speed) { s.elapsed = 0; const l = s.letters[s.pos++]; if (l) { l.classList.add('ink', 'strike'); place(s); } if (s.pos >= s.letters.length) s.done = true; } }); if (visible.has($('air'))) { clock += dt; clockPaint += dt; if (clockPaint > 80) { clockPaint = 0; const frames = Math.floor(clock / 40), seconds = Math.floor(clock / 1000); $('timecode').textContent = [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60, frames % 25].map(n => String(n).padStart(2, '0')).join(':'); } } } requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
    $$('[data-show]').forEach(b => b.addEventListener('click', () => { const el = $('show'); const s = setup(el, el.innerHTML.replace(/<br\s*\/?\s*>/gi, '|')); el.setAttribute('aria-label', s.el.dataset.type.replaceAll('|', ' ')); const scene = shadow.querySelector('.scene'); scene.classList.remove('playing'); requestAnimationFrame(() => scene.classList.add('playing')); }));
    $$('.secret').forEach(b => b.onclick = () => { const open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', open); b.setAttribute('aria-label', open ? 'Conceal witness identity' : 'Reveal witness identity'); });
    reduce.addEventListener('change', () => { if (reduce.matches) states.forEach(finish); }, { signal }); addEventListener('resize', () => states.forEach(place), { signal }); document.fonts.ready.then(() => { if (alive) states.forEach(place); });
    { const scene = shadow.querySelector('.scene'); $('tv-replay').onclick = () => { scene.classList.remove('tracking-replay'); void scene.offsetWidth; scene.classList.add('tracking-replay'); scene.querySelectorAll('.tracking,.person').forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }); }; }

    /* ---- details.js ---- */
    { const stage = shadow.querySelector('.anatomy-stage'), svg = $('anatomy-svg'); const targets = [[131, 195], [531, 314], [1049, 389]]; let x = targets[0][0], y = targets[0][1];
      function move(nx, ny) { x = Math.max(140, Math.min(1080, nx)); y = Math.max(130, Math.min(430, ny)); for (const id of ['lens-ring', 'lens-clip-circle']) { const c = $(id); c.setAttribute('cx', x); c.setAttribute('cy', y); } $('zoom-outlines').setAttribute('transform', `translate(${x} ${y}) scale(3) translate(${-x} ${-y})`); const side = x > 850 ? -1 : 1; $('lens-handle-neck').setAttribute('d', `M${x + side * 145} ${y + 145}L${x + side * 177} ${y + 177}`); $('lens-handle').setAttribute('d', `M${x + side * 176} ${y + 176}L${x + side * 270} ${y + 270}`); const label = $('lens-label'); label.setAttribute('x', x); label.setAttribute('y', y + 235); }
      function pointer(e) { const matrix = svg.getScreenCTM(); if (!matrix) return; const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(matrix.inverse()); move(pt.x, pt.y); }
      stage.addEventListener('pointermove', pointer); stage.addEventListener('pointerdown', e => { stage.setPointerCapture(e.pointerId); pointer(e); }); stage.addEventListener('keydown', e => { const step = e.shiftKey ? 30 : 10; const offsets = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }; if (offsets[e.key]) { e.preventDefault(); move(x + offsets[e.key][0], y + offsets[e.key][1]); } });
      $$('[data-detail]').forEach(b => b.onclick = () => { const n = +b.dataset.detail; move(...targets[n]); $$('[data-detail]').forEach(a => { a.classList.toggle('active', a === b); a.setAttribute('aria-pressed', String(a === b)); }); $('detail-caption').textContent = b.textContent; });
      move(...targets[0]); const arrival = observe(new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { move(...targets[0]); arrival.disconnect(); } }, { threshold: .25 })); arrival.observe(stage); }

    /* ---- connections.js ---- */
    { const main = shadow.querySelector('main'), ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg'); svg.classList.add('case-threads'); svg.setAttribute('aria-hidden', 'true'); main.prepend(svg);
      const specs = [['.ribbon', .29, .2], ['.stamp', .5, 0], ['.tv-shell', .96, .06], ['.ink-composition', .95, .03], ['.case-number', .5, .05], ['.report', .15, .03], ['.clue', .9, .05], ['.alphabet', .01, .05], ['.anatomy-heading', .97, .03], ['.schedule-head', .97, .1], ['.tester .test-controls', .02, .05], ['.end>p', .95, .02]];
      const nodes = specs.map(([selector, x, y], i) => { const el = shadow.querySelector(selector), pin = document.createElement('button'); pin.className = 'evidence-pin'; pin.type = 'button'; pin.innerHTML = '<span></span>'; pin.setAttribute('aria-label', 'Follow connection ' + String(i + 1).padStart(2, '0')); pin.title = 'FOLLOW THE EVIDENCE'; main.append(pin); return { el, pin, x, y }; });
      const links = nodes.slice(1).map(() => { const g = document.createElementNS(ns, 'g'); g.classList.add('thread-link'); for (const cls of ['thread-red']) { const p = document.createElementNS(ns, 'path'); p.setAttribute('class', cls); g.append(p); } svg.append(g); return g; });
      let points = []; function layout() { if (!alive) return; const base = main.getBoundingClientRect(), w = main.clientWidth, h = main.offsetHeight; svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.style.height = h + 'px'; points = nodes.map(n => { const r = n.el.getBoundingClientRect(), x = r.left - base.left + r.width * n.x, y = r.top - base.top + r.height * n.y; n.pin.style.left = x + 'px'; n.pin.style.top = y + 'px'; return { x, y }; }); links.forEach((g, i) => { const a = points[i], b = points[i + 1], d = `M${a.x},${a.y} L${b.x},${b.y}`; g.querySelectorAll('path').forEach(p => p.setAttribute('d', d)); }); }
      nodes.forEach((n, i) => n.pin.onclick = () => { const next = nodes[(i + 1) % nodes.length]; next.el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); next.pin.focus({ preventScroll: true }); });
      let pending = 0; function update() { cancelAnimationFrame(pending); pending = requestAnimationFrame(layout); } const ro = new ResizeObserver(update); ro.observe(main); observers.push(ro); addEventListener('resize', update, { signal }); document.fonts.ready.then(update); layout(); }

    /* ---- якоря макета: через скролл портфолио, hash страницы не трогаем ---- */
    shadow.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const target = id === 'home' ? 0 : shadow.getElementById(id);
      if (target === null) return;
      if (scrollTo) scrollTo(target);
      else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth' });
    }, { signal });
  }
  function unmount() {
    alive = false;
    controller?.abort();
    controller = null;
    observers.forEach(o => o.disconnect());
    observers = [];
  }
  return { mount, unmount };
})();
/* Скрипты презентации SHOK (app.js + headline-motion.js из макета), переведённые на контейнер:
   разметка и стили живут в Shadow DOM, поиск элементов идёт внутри него, класс paused ставится на host,
   якоря не трогают hash страницы, наблюдатели и слушатели снимаются при размонтировании. Логика — как в макете. */
window.ShokPresentation = (() => {
  let controller = null;
  let observers = [];
  let alive = false;
  function mount(host, shadow, { scrollTo } = {}) {
    unmount();
    controller = new AbortController();
    alive = true;
    const { signal } = controller;
    const $ = id => shadow.getElementById(id);
    const $$ = s => [...shadow.querySelectorAll(s)];
    const observe = o => { observers.push(o); return o; };

    /* ---- app.js ---- */
    function activate(selector, b) { $$(selector).forEach(a => { a.classList.toggle('active', a === b); a.setAttribute('aria-pressed', String(a === b)); }); }
    const art = shadow.querySelector('.compare-art'), divider = shadow.querySelector('.divider'); let split = 50;
    function setSplit(value) { split = Math.max(0, Math.min(100, value)); $('compare').style.setProperty('--split', split + '%'); divider.setAttribute('aria-valuenow', Math.round(split)); divider.setAttribute('aria-valuetext', Math.round(split) + ' percent dense'); }
    function dragSplit(e) { const r = art.getBoundingClientRect(); setSplit((e.clientX - r.left) / r.width * 100); }
    let dragging = false; art.addEventListener('pointerdown', e => { dragging = true; art.setPointerCapture(e.pointerId); dragSplit(e); divider.focus({ preventScroll: true }); }); art.addEventListener('pointermove', e => { if (dragging) dragSplit(e); }); art.addEventListener('pointerup', () => dragging = false); art.addEventListener('pointercancel', () => dragging = false); divider.addEventListener('keydown', e => { const step = e.shiftKey ? 10 : 2; if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); setSplit(e.key === 'Home' ? 0 : e.key === 'End' ? 100 : split + (e.key === 'ArrowLeft' ? -step : step)); } });
    const films = [['кТо-То|в ДоМе.', 'ПРЕМЬЕРА / УЖАСЫ', 'СЕГОДНЯ　23:40'], ['ПоСЛедНиЙ|вЫхоД', 'НОЧНОЙ СЕАНС / СЛЕШЕР', 'ПЯТНИЦА　00:15'], ['нЕ|ДыШи.', 'ПСИХОЛОГИЧЕСКИЙ ТРИЛЛЕР', 'ЗАВТРА　22:30']]; let film = 0;
    function replay() { const a = films[film], title = $('film-title'); title.replaceChildren(); title.setAttribute('aria-label', a[0].replace('|', ' ')); let n = 0; a[0].split('|').forEach(line => { const row = document.createElement('span'); row.className = 'cutout-row'; [...line].forEach((c, i) => { const letter = document.createElement('span'); letter.className = c === ' ' ? 'cutout-space' : 'cut-letter'; letter.textContent = c; letter.setAttribute('aria-hidden', 'true'); letter.style.setProperty('--r', [-7, 4, -3, 7, -5, 2][n % 6] + 'deg'); letter.style.setProperty('--s', [1, .85, 1.12, .94, 1.04, .88][n % 6]); letter.style.setProperty('--dy', [0, 8, -5, 4, -7, 2][n % 6] + 'px'); letter.style.setProperty('--delay', n * 45 + 'ms'); letter.style.setProperty('--from-x', ((n % 2 ? 1 : -1) * (80 + n * 13)) + 'px'); letter.style.setProperty('--from-y', ((n % 3 ? 1 : -1) * (50 + n * 7)) + 'px'); const edges = []; for (let k = 0; k < 6; k++) edges.push(`${k * 20}% ${(n * 7 + k * 11) % 5}%`); for (let k = 1; k < 6; k++) edges.push(`${100 - (n + k * 3) % 5}% ${k * 20}%`); for (let k = 4; k >= 0; k--) edges.push(`${k * 20}% ${100 - (n * 3 + k * 7) % 5}%`); for (let k = 4; k > 0; k--) edges.push(`${(n + k * 5) % 4}% ${k * 20}%`); letter.style.clipPath = 'polygon(' + edges.join(',') + ')'; row.append(letter); n++; }); title.append(row); }); $('film-type').textContent = a[1]; $('film-time').textContent = a[2]; const time = $('film-time'); time.classList.remove('time-arrival'); void time.offsetWidth; time.classList.add('time-arrival'); }
    $$('[data-film]').forEach(b => b.onclick = () => { film = +b.dataset.film; activate('[data-film]', b); replay(); }); $('replay').onclick = replay; replay();
    const alphabets = { cyr: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ', lat: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', num: '0123456789!?&@#%«»' }; let script = 'cyr', surface = 'dense';
    function choose(c, b) { $('large-glyph').textContent = c; $('glyph-code').textContent = 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'); activate('#glyph-grid button', b); }
    function grid() { const chars = surface === 'worn' ? alphabets[script].toLowerCase() : alphabets[script]; $('glyph-grid').replaceChildren(); [...chars].forEach(c => { const b = document.createElement('button'); b.textContent = c; b.setAttribute('aria-label', 'Inspect ' + c); b.onclick = () => choose(c, b); $('glyph-grid').append(b); }); while ($('glyph-grid').children.length < 35) { const e = document.createElement('span'); e.setAttribute('aria-hidden', 'true'); $('glyph-grid').append(e); } $$('[data-case]').forEach(b => b.disabled = script === 'num'); const n = script === 'cyr' ? 7 : 0; choose(chars[n], $('glyph-grid').children[n]); }
    $$('[data-script]').forEach(b => b.onclick = () => { script = b.dataset.script; activate('[data-script]', b); grid(); }); $$('[data-case]').forEach(b => b.onclick = () => { surface = b.dataset.case; activate('[data-case]', b); grid(); }); grid();
    const field = $('type-text'), slider = $('size'), ctx = document.createElement('canvas').getContext('2d'); let auto = true, worn = true;
    function fit() { if (!alive) return; ctx.font = '100px Shok'; const longest = Math.max(1, ...field.value.split('\n').map(t => ctx.measureText(t).width)); const style = getComputedStyle(field); const available = field.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 8; const max = Math.max(12, Math.min(160, Math.floor(available * 100 / longest))); slider.min = Math.min(32, max); slider.max = max; if (auto || +slider.value > max) slider.value = max; field.style.fontSize = slider.value + 'px'; $('size-value').textContent = slider.value + ' PX'; field.style.height = 'auto'; field.style.height = field.scrollHeight + 4 + 'px'; }
    slider.oninput = () => { auto = false; fit(); }; field.oninput = fit; $('texture').onclick = () => { worn = !worn; field.value = worn ? field.value.toLowerCase() : field.value.toUpperCase(); $('texture').textContent = worn ? 'DISTRESSED' : 'DENSE'; $('texture').setAttribute('aria-pressed', worn); fit(); }; $('reset').onclick = () => { field.value = 'не ВыКлючай\nсВет.'; worn = true; auto = true; $('texture').textContent = 'DISTRESSED'; $('texture').setAttribute('aria-pressed', 'true'); fit(); }; document.fonts.ready.then(fit); addEventListener('resize', fit, { signal });
    const flashlight = shadow.querySelector('.flashlight'); const hidden = flashlight.querySelector('.hidden-type'), message = hidden.textContent; hidden.replaceChildren(); const bloodLetters = [...message].map(c => { const s = document.createElement('span'); s.textContent = c === ' ' ? ' ' : c; hidden.append(s); return { el: s, lit: false, last: 0 }; }); const bloodLayer = document.createElement('div'); bloodLayer.className = 'blood-layer'; bloodLayer.setAttribute('aria-hidden', 'true'); flashlight.append(bloodLayer);
    function inkPoint(letter, r) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(r.width)); c.height = Math.max(1, Math.ceil(r.height)); const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.font = getComputedStyle(hidden).fontSize + ' Shok'; ctx.fillStyle = '#fff'; const m = ctx.measureText(letter); ctx.fillText(letter, 0, (c.height + m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2); const data = ctx.getImageData(0, 0, c.width, c.height).data; const points = []; for (let yy = 0; yy < c.height; yy += 3) for (let xx = 0; xx < c.width; xx += 3) if (data[(yy * c.width + xx) * 4 + 3] > 160) points.push([xx, yy]); return points.length ? points[Math.floor(Math.random() * points.length)] : [r.width / 2, r.height * .6]; }
    function blood(x, y, radius) { const base = flashlight.getBoundingClientRect(), now = performance.now(); bloodLetters.forEach((l, i) => { const r = l.el.getBoundingClientRect(), cx = r.left - base.left + r.width / 2, cy = r.top - base.top + r.height / 2, lit = Math.hypot(cx - x, cy - y) < radius * .78 + r.width * .18; if (l.lit && !lit && now - l.last > 500 && l.el.textContent.trim()) { l.last = now; for (let n = 0; n < 2; n++) { const drip = document.createElement('i'); drip.className = 'blood-drip'; const start = inkPoint(l.el.textContent, r); drip.style.left = (r.left - base.left + start[0]) + 'px'; drip.style.top = (r.top - base.top + start[1]) + 'px'; drip.style.setProperty('--length', (40 + Math.random() * 120) + 'px'); drip.style.setProperty('--fall', (flashlight.clientHeight + 180) + 'px'); drip.style.setProperty('--delay', n * 120 + 'ms'); bloodLayer.append(drip); drip.addEventListener('animationend', () => drip.remove(), { once: true }); } while (bloodLayer.children.length > 60) bloodLayer.firstChild.remove(); } l.lit = lit; }); }
    let lx = 35, ly = 50;
    function light(px, py) { if (!alive) return; lx = Math.max(0, Math.min(100, px)); ly = Math.max(0, Math.min(100, py)); flashlight.style.setProperty('--x', lx + '%'); flashlight.style.setProperty('--y', ly + '%'); const w = flashlight.clientWidth, h = flashlight.clientHeight, x = lx * w / 100, y = ly * h / 100, ox = w * .07, oy = h * .88; const dx = x - ox, dy = y - oy, dist = Math.max(1, Math.hypot(dx, dy)), radius = window.innerWidth <= 700 ? 95 : Math.min(145, window.innerWidth * .2), nx = -dy / dist * radius, ny = dx / dist * radius; blood(x, y, radius); const gradient = flashlight.querySelector('#beam-fill'); gradient.setAttribute('gradientUnits', 'userSpaceOnUse'); gradient.setAttribute('x1', ox); gradient.setAttribute('y1', oy); gradient.setAttribute('x2', x); gradient.setAttribute('y2', y); flashlight.querySelector('.beam polygon').setAttribute('points', `${ox},${oy} ${x + nx},${y + ny} ${x - nx},${y - ny}`); flashlight.querySelector('.torch').style.transform = `translate(-85%,-50%) rotate(${Math.atan2(dy, dx)}rad)`; }
    function pointer(e) { const r = flashlight.getBoundingClientRect(); light((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100); }
    flashlight.onpointermove = pointer; flashlight.onpointerdown = e => { flashlight.setPointerCapture(e.pointerId); pointer(e); }; flashlight.onkeydown = e => { const a = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -4], ArrowDown: [0, 4] }[e.key]; if (a) { e.preventDefault(); light(lx + a[0], ly + a[1]); } };
    $('pause').onclick = () => { const p = host.classList.toggle('paused'); $('pause').textContent = p ? '▶' : 'Ⅱ'; $('pause').setAttribute('aria-pressed', p); $('pause').setAttribute('aria-label', p ? 'Resume motion' : 'Pause motion'); };
    const visible = new Set(); const observer = observe(new IntersectionObserver(es => es.forEach(e => { e.target.classList.toggle('offscreen', !e.isIntersecting); if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); }), { threshold: .03 })); $$('section').forEach(s => observer.observe(s)); light(55, 46); addEventListener('resize', () => light(lx, ly), { signal });

    /* ---- headline-motion.js ---- */
    { const reduce = matchMedia('(prefers-reduced-motion: reduce)'); $$('h1,h2,.ending>p,.blade-message').forEach(h => { if (h.id === 'film-title') return; const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); const texts = []; while (walker.nextNode()) texts.push(walker.currentNode); let index = 0; texts.forEach(t => { const f = document.createDocumentFragment(); t.textContent.split(/(\s+)/).forEach(word => { if (!word.trim()) { f.append(document.createTextNode(word)); return; } const w = document.createElement('span'); w.className = 'heading-word'; [...word].forEach(c => { const s = document.createElement('span'); s.className = 'moving-glyph'; s.textContent = c; s.style.setProperty('--order', index); s.style.setProperty('--gx', ((index % 2 ? 1 : -1) * (20 + index % 5 * 8)) + 'px'); s.style.setProperty('--gy', ((index % 3 ? 1 : -1) * (25 + index % 4 * 10)) + 'px'); index++; w.append(s); }); f.append(w); }); t.replaceWith(f); }); h.classList.add('motion-heading'); }); const io = observe(new IntersectionObserver(es => es.forEach(e => { e.target.classList.toggle('motion-entered', e.isIntersecting); }), { threshold: .16 })); $$('section').forEach(s => io.observe(s)); }

    /* ---- якоря макета: через скролл портфолио, hash страницы не трогаем ---- */
    shadow.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const target = id === 'top' ? 0 : shadow.getElementById(id);
      if (target === null) return;
      if (scrollTo) scrollTo(target);
      else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth' });
    }, { signal });
  }
  function unmount() {
    alive = false;
    controller?.abort();
    controller = null;
    observers.forEach(o => o.disconnect());
    observers = [];
  }
  return { mount, unmount };
})();
/* Скрипт презентации Gollanos (app.js из макета), переведённый на контейнер: разметка и стили живут в Shadow DOM,
   поиск элементов идёт внутри него, якоря не трогают hash страницы, наблюдатели и слушатели снимаются при размонтировании. */
window.GollanosPresentation = (() => {
  let controller = null;
  let observers = [];
  let alive = false;
  function mount(host, shadow, { scrollTo } = {}) {
    unmount();
    controller = new AbortController();
    alive = true;
    const { signal } = controller;
    const $ = id => shadow.getElementById(id);
    const $$ = s => [...shadow.querySelectorAll(s)];
    const io = new IntersectionObserver(es => es.forEach(e => { e.target.classList.toggle('inview', e.isIntersecting); e.target.classList.toggle('offscreen', !e.isIntersecting); }), { threshold: .1 }); observers.push(io); $$('section').forEach(s => io.observe(s));
    function active(sel, b) { $$(sel).forEach(n => { n.classList.toggle('active', n === b); n.setAttribute('aria-pressed', String(n === b)); }); }
    $$('[data-number]').forEach(b => b.onclick = () => { $('number').textContent = b.dataset.number; active('[data-number]', b); $('number').style.animation = 'none'; void $('number').offsetWidth; $('number').style.animation = ''; });
    $('reassemble').onclick = () => { $$('.slab').forEach(s => { s.style.animation = 'none'; void s.offsetWidth; s.style.animation = ''; }); };
    const sets = { lat: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', num: '0123456789!?&@#%' }; let set = 'lat', lower = false;
    function select(c, b) { $('big-glyph').textContent = c; $('code').textContent = 'U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'); active('#glyph-grid button', b); }
    function grid() { const chars = lower ? sets[set].toLowerCase() : sets[set]; $('glyph-grid').replaceChildren(); [...chars].forEach(c => { const b = document.createElement('button'); b.textContent = c; b.onclick = () => select(c, b); $('glyph-grid').append(b); }); select(chars[set === 'lat' ? 6 : 0], $('glyph-grid').children[set === 'lat' ? 6 : 0]); }
    $$('[data-set]').forEach(b => b.onclick = () => { set = b.dataset.set; active('[data-set]', b); grid(); }); $$('[data-case]').forEach(b => b.onclick = () => { lower = b.dataset.case === 'lower'; active('[data-case]', b); grid(); }); grid();
    const ctx = document.createElement('canvas').getContext('2d'); let auto = true;
    function fit() { if (!alive) return; const t = $('text'), s = $('size'); ctx.font = '100px Gollanos'; const width = Math.max(1, ...t.value.split('\n').map(x => ctx.measureText(x).width)), st = getComputedStyle(t), safe = t.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight) - 4, max = Math.min(360, Math.max(12, Math.floor(safe * 100 / width))); s.min = Math.min(30, max); s.max = max; if (auto || +s.value > max) s.value = max; t.style.fontSize = s.value + 'px'; $('size-value').textContent = s.value + ' PX'; t.style.height = 'auto'; t.style.height = t.scrollHeight + 4 + 'px'; }
    $('size').oninput = () => { auto = false; fit(); }; $('text').oninput = fit; $('colour').onclick = () => shadow.querySelector('.type-test').classList.toggle('inverted'); $('reset').onclick = () => { $('text').value = 'YOUR\nPOSTER.'; auto = true; fit(); }; document.fonts.ready.then(fit); addEventListener('resize', fit, { signal });
    shadow.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const target = id === 'top' ? 0 : shadow.getElementById(id);
      if (target === null) return;
      if (scrollTo) scrollTo(target);
      else if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth' });
    }, { signal });
  }
  function unmount() {
    alive = false;
    controller?.abort();
    controller = null;
    observers.forEach(o => o.disconnect());
    observers = [];
  }
  return { mount, unmount };
})();
/* Kinetic Library engine из макета ACTION (window.Kinetic): рисует кинетическую типографику на canvas; документа не касается. */
/*!
 * Kinetic Library engine v1.0 — 2026-10-23
 * 22 kinetic typography presets (KT-001…KT-022) rendered on <canvas>.
 * No dependencies. Works as a plain <script> (window.Kinetic) or CommonJS/AMD module.
 * Design stage: 800×571 units, scaled to fit any canvas size.
 */
(function(root,factory){if(typeof define==='function'&&define.amd)define([],factory);else if(typeof module==='object'&&module.exports)module.exports=factory();else root.Kinetic=factory();})(typeof self!=='undefined'?self:this,function(){
'use strict';
const FAM={sans:'Action, sans-serif',serif:'Action, sans-serif'};
const OFF={};const MIXC={};const MW={};let MWn=0;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const seg=(u,a,b)=>clamp((u-a)/(b-a));
const eio=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const eexpo=t=>t<=0?0:t>=1?1:t<.5?Math.pow(2,20*t-10)/2:(2-Math.pow(2,-20*t+10))/2;
const eout=t=>1-Math.pow(1-t,3);
const ein=t=>t*t*t;
const ebounce=t=>{const n=7.5625,d=2.75;if(t<1/d)return n*t*t;if(t<2/d)return n*(t-=1.5/d)*t+.75;if(t<2.5/d)return n*(t-=2.25/d)*t+.9375;return n*(t-=2.625/d)*t+.984375;};
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const L=P=>String(P.text??'').split('|');
const font=(c,px,P,o={})=>{const f=`${o.w??P.weight} ${Math.max(1,Math.round(px*4)/4)}px ${FAM[o.fam||P.family]||FAM.sans}`,st=o.st||'normal';if(c._f!==f){c.font=f;c._f=f;}if(c._s!==st){c.fontStretch=st;c._s=st;}c.textAlign=o.al||'center';c.textBaseline=o.bl||'middle';};
const mw=(c,s)=>{const k=c._f+'|'+c._s+'|'+s;let v=MW[k];if(v===undefined){if(++MWn>20000){for(const q in MW)delete MW[q];MWn=0;}v=MW[k]=c.measureText(s).width;}return v;};
const put=(c,B,x,y,ang,sx,sy)=>{const co=Math.cos(ang),si=Math.sin(ang),la=co*sx,lb=si*sx,lc=-si*sy,ld=co*sy;c.setTransform(B.a*la+B.c*lb,B.b*la+B.d*lb,B.a*lc+B.c*ld,B.b*lc+B.d*ld,B.a*x+B.c*y+B.e,B.b*x+B.d*y+B.f);};
const spr=(c,ch,col,px)=>{const k='g|'+c._f+'|'+c._s+'|'+ch+'|'+col;let o=OFF[k];if(!o){const w=Math.ceil(mw(c,ch)+px*.4),h=Math.ceil(px*1.5);const cv=document.createElement('canvas');cv.width=w*3;cv.height=h*3;const x=cv.getContext('2d');x.scale(3,3);x.font=c._f;x.fontStretch=c._s||'normal';x.textAlign='center';x.textBaseline='middle';x.fillStyle=col;x.fillText(ch,w/2,h/2);o=OFF[k]={cv,w,h};}return o;};
const capH=c=>{const k=c._f+'|'+c._s+'|^cap';let v=MW[k];if(v===undefined)v=MW[k]=c.measureText('H').actualBoundingBoxAscent;return v;};
const mix=(a,b,t)=>{t=Math.round(clamp(t)*32)/32;const key=a+b+t;if(MIXC[key])return MIXC[key];const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)||0);const A=p(a),B=p(b);return MIXC[key]='#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
const offc=(key,w,h,fn)=>{if(OFF[key])return OFF[key];const ks=Object.keys(OFF);if(ks.length>600)ks.forEach(k=>delete OFF[k]);const cv=document.createElement('canvas');cv.width=w*2;cv.height=h*2;const x=cv.getContext('2d');x.scale(2,2);fn(x);return OFF[key]={cv};};
const paintU=(cv,draw,P,u)=>{const c=cv.getContext('2d');const W=cv.width,H=cv.height;c._f=c._s=null;c.setTransform(1,0,0,1,0,0);c.fillStyle=P.bg;c.fillRect(0,0,W,H);const s=Math.min(W/800,H/571);c.setTransform(s,0,0,s,(W-800*s)/2,(H-571*s)/2);c.save();try{draw(c,u,P);}catch(e){console.warn(e);}c.restore();};

const PRESETS=[
{id:'KT-001',name:'Кольцо',en:'Ring',src:'b',tags:['3D','путь'],dur:5.4,
 desc:'Строка стоит лентой на наклонном кольце. Кольцо вырастает из точки, проворачивается в перспективе и сворачивается. Задняя сторона читается зеркально.',
 d:{text:'NONSTOP',weight:800},
 ps:[['size','Кегль',20,120,1,54],['radius','Радиус',80,340,1,250],['tilt','Наклон, °',0,60,1,14],['turns','Обороты за цикл',1,4,1,1]],
 draw:(c,u,P)=>{
  const R=P.radius,tl=P.tilt*Math.PI/180,f=1100;
  const rev=u<.2?eio(seg(u,0,.2)):u>.8?1-eio(seg(u,.8,1)):1;if(rev<=.001)return;
  const spin=eio(u)*Math.PI*2*P.turns;font(c,P.size,P);
  const base=L(P).join(' ')+' ';const unit=mw(c,base)||1,circ=2*Math.PI*R;
  const reps=Math.max(1,Math.round(circ/unit)),k=circ/(unit*reps);const items=[];let acc=0;
  for(const ch of base.repeat(reps)){const w=mw(c,ch)*k;const a=(acc+w/2)/R;acc+=w;if(a>2*Math.PI*rev)break;
   const th=a+spin,x=R*Math.sin(th),z=R*Math.cos(th),zz=z*Math.cos(tl),p=f/(f-zz);
   items.push({ch,x:400+x*p,y:285+z*Math.sin(tl)*p,p,sx:Math.cos(th),zz});}
  items.sort((a,b)=>a.zz-b.zz);c.fillStyle=P.fg;const B=c.getTransform();
  for(const o of items){if(Math.abs(o.sx)<.03||o.ch===' ')continue;put(c,B,o.x,o.y,0,o.sx*o.p,o.p);c.fillText(o.ch,0,0);}c.setTransform(B);
 }},
{id:'KT-002',name:'Сдвиг',en:'Shift',src:'b',tags:['строки','ритм'],dur:3,
 desc:'Строки блока шагают влево и вправо на целое число знаков, отдельные буквы проваливаются на соседнюю строку и возвращаются.',
 d:{text:'KINETIC|TYPOGRAPHY|EXPERIMENTS',weight:300},
 ps:[['size','Кегль',20,90,1,46],['hops','Шагов за цикл',2,8,1,4],['drops','Падающих букв',0,12,1,4]],
 draw:(c,u,P)=>{
  const ls=L(P),n=ls.length,px=P.size,lh=px*(P.leading??1.12);font(c,px,P,{al:'left'});
  const cw=mw(c,'E');const maxW=Math.max(...ls.map(l=>mw(c,l)));
  const x0=400-maxW/2,y0=285-(n-1)*lh/2;const r=rng(3);const H=P.hops;c.fillStyle=P.fg;
  ls.forEach((line,li)=>{
   const dirs=[];let sum=0;for(let s=0;s<H-1;s++){const d=(r()<.5?-1:1)*(1+Math.floor(r()*2));dirs.push(d);sum+=d;}dirs.push(-sum);
   let off=0;dirs.forEach((d,s)=>{const t0=(s+.1+li*.03)/H;off+=d*eexpo(seg(u,t0,t0+.5/H));});
   let x=x0+off*cw;const chars=[...line];const drops=new Set();const r2=rng(li*31+7);
   for(let k=0;k<P.drops;k++)drops.add(Math.floor(r2()*chars.length));
   chars.forEach((ch,ci)=>{let dy=0;if(drops.has(ci)){const r3=rng(li*97+ci*13+1);const a=r3()*.6+.05;const dir=li===n-1?-1:1;dy=dir*lh*(eexpo(seg(u,a,a+.08))-eexpo(seg(u,a+.22,a+.3)));}
    c.fillText(ch,x,y0+li*lh+dy);x+=mw(c,ch);});
  });
 }},
{id:'KT-003',name:'Смаз',en:'Swipe',src:'b',tags:['скорость','срезы'],dur:1.6,
 desc:'Слово уезжает влево и выезжает с другой стороны. Оно режется на вертикальные срезы, которые слегка отстают друг от друга и тянутся по скорости.',
 d:{text:'SWIPE',weight:900},
 ps:[['size','Кегль',40,220,1,120],['strips','Вертикальных срезов',10,120,1,48],['lag','Запаздывание',0,10,.5,3],['stretch','Растяжение срезов',0,3,.1,1]],
 draw:(c,u,P)=>{
  const t=L(P).join(' ');const OW=1400;
  const o=offc('sw|'+t+P.size+P.fg+P.family+P.weight,OW,571,x=>{font(x,P.size,P,{st:'expanded',bl:'alphabetic'});const cap=capH(x)||P.size*.72;x.fillStyle=P.fg;x.fillText(t,OW/2,285+cap/2);});
  font(c,P.size,P,{st:'expanded'});const tw=Math.min(OW-20,mw(c,t)+8);const left=OW/2-tw/2;const period=Math.max(820,tw+P.size*1.2);
  const N=P.strips,cw=tw/N;const r=rng(9);const pos=v=>-period*eio(seg(((v%1)+1)%1,.3,.78));
  for(let i=0;i<N;i++){const d=(i/N*.7+r()*.3)*P.lag*.006;const x=pos(u-d);const vel=Math.abs(pos(u-d+.01)-x);const sx=1+Math.min(vel/period*10,1)*P.stretch*.6;
   const s0=left+i*cw,dx=400-OW/2+s0+x;
   for(const k of [0,1]){const X=dx+k*period;if(X>820||X+cw*sx<-20)continue;c.drawImage(o.cv,s0*2,0,cw*2,571*2,X,0,cw*sx+.6,571);}}
 }},
{id:'KT-004',name:'Ливень',en:'Letter rain',src:'b',tags:['физика','хаос'],dur:4.5,
 desc:'Буквы падают с отскоком, ложатся россыпью внизу кадра, затем уходят вниз под гравитацией. Гарнитуры и начертания перемешаны.',
 d:{text:'TYPOGRAPHY',weight:600},
 ps:[['count','Букв',20,220,1,110],['size','Кегль',12,80,1,34]],
 draw:(c,u,P)=>{
  const chars=[...L(P).join('').replace(/\s/g,'')];if(!chars.length)return;const r=rng(21);c.fillStyle=P.fg;const G={};
  for(let i=0;i<P.count;i++){const ch=chars[i%chars.length];const tx=30+r()*740,ty=560-r()*r()*360-10,ta=.03+r()*.38,te=.7+r()*.2,rot=(r()-.5)*3.2,rot0=(r()-.5)*6,sz=P.size*(.5+r()*.9),serif=r()<.35,w=[300,500,700,900][Math.floor(r()*4)],drift=(r()-.5)*80;
   const f=ebounce(seg(u,ta,ta+.13));if(f<=0)continue;const ex=ein(seg(u,te,te+.14));
   const key=serif?'s':w;(G[key]||(G[key]=[])).push([ch,tx+ex*drift,lerp(-60,ty,f)+ex*700,lerp(rot0,rot,f)+ex*rot,sz/P.size]);}
  for(const key in G){font(c,P.size,P,key==='s'?{fam:'serif',w:400}:{fam:'sans',w:+key});const B=c.getTransform();for(const [ch,x,y,a,k] of G[key]){put(c,B,x,y,a,k,k);c.fillText(ch,0,0);}c.setTransform(B);}
 }},
{id:'KT-005',name:'Кубики',en:'Flip blocks',src:'b',tags:['3D','сетка'],dur:2,
 desc:'Каждая буква — грань кубика. Сначала видны плашки, затем кубики по очереди проворачиваются к букве и обратно.',
 d:{text:'GEOM|ETRIC',weight:800},
 ps:[['size','Кегль',40,200,1,118],['stagger','Задержка между буквами',0,4,.1,1.4]],
 draw:(c,u,P)=>{
  const ls=L(P),n=ls.length,px=P.size;font(c,px,P,{st:'expanded',bl:'alphabetic'});
  const cap=capH(c)||px*.72;const h=cap*1.04,lh=h*1.28;
  const total=ls.reduce((a,l)=>a+[...l].length,0);const face=mix(P.bg,P.fg,.9);let k=0;
  ls.forEach((line,li)=>{const chs=[...line];const ws=chs.map(ch=>mw(c,ch));const tot=ws.reduce((a,b)=>a+b,0);let x=400-tot/2;const yc=285+(li-(n-1)/2)*lh;
   chs.forEach((ch,ci)=>{const d=(k++/Math.max(1,total))*P.stagger*.1;
    const a=eio(seg(u,.05+d,.3+d))-eio(seg(u,.55+d,.8+d));const th=a*Math.PI/2,ca=Math.cos(th),sa=Math.sin(th);
    const w=ws[ci]*.92,cx=x+ws[ci]/2;const top=yc-h*(ca+sa)/2;
    if(ch.trim()){if(ca>.01){c.fillStyle=face;c.fillRect(cx-w/2,top,w,h*ca);}
     if(sa>.01){c.save();c.translate(cx,top+h*ca);c.scale(1,sa);c.fillStyle=P.fg;c.fillText(ch,0,cap);c.restore();}}
    x+=ws[ci];});
  });
 }},
{id:'KT-006',name:'Следы',en:'Leaving traces',src:'b',tags:['эхо','слои'],dur:2.7,
 desc:'Слова двух строк съезжают навстречу и на ходу набирают вес и ширину. За ними тянется лесенка сплошных копий разной жирности, которая сливается в один след.',
 d:{text:'LEAVING TRACES',weight:400},
 ps:[['size','Кегль',20,120,1,50],['heavy','Вес на ходу',100,900,100,900],['widen','Расширение (0/1)',0,1,1,1],['echo','Копий',2,24,1,12],['trail','Шлейф',1,10,.5,4],['travel','Ход, px',20,240,1,120]],
 draw:(c,u,P)=>{
  const words=(L(P)[0]||'').split(' ').filter(Boolean);if(!words.length)return;c.fillStyle=P.fg;const rows=[[150,1],[421,-1]];const STR=['normal','semi-expanded','expanded'];
  const ph=(v,ri,wi)=>{v=((v%1)+1)%1;const d=Math.min(.18,wi*.07+ri*.04);return eio(seg(v,.06+d,.3+d))-eio(seg(v,.54+d,.78+d));};
  for(let e=P.echo-1;e>=0;e--)rows.forEach((row,ri)=>{const v=u-e*P.trail*.004;
   const ms=words.map((w,wi)=>{const a=ph(v,ri,wi);const wt=Math.round(lerp(P.weight,P.heavy,a)/100)*100;const st=P.widen?STR[Math.min(2,Math.floor(a*2.999))]:'normal';font(c,P.size,P,{al:'left',w:wt,st});return{w,a,wt,st,width:mw(c,w)};});
   font(c,P.size,P,{al:'left'});const sp=mw(c,' ')*1.1;const tot=ms.reduce((s,m)=>s+m.width,0)+sp*(ms.length-1);let x=400-tot/2;
   ms.forEach(m=>{font(c,P.size,P,{al:'left',w:m.wt,st:m.st});c.fillText(m.w,x,row[0]+row[1]*P.travel*m.a);x+=m.width+sp;});});
 }},
{id:'KT-007',name:'Орбиты',en:'Orbits',src:'b',tags:['3D','путь'],dur:3,
 desc:'Текст бежит по нескольким кольцам, собранным в сферу. Глубина передана тоном, в начале цикла буквы разлетаются и собираются.',
 d:{text:'TYPE IN MOTION',weight:600},
 ps:[['size','Кегль',8,40,1,16],['radius','Радиус',100,260,1,190],['rings','Колец',2,14,1,8],['chaos','Разлёт',0,100,1,40]],
 draw:(c,u,P)=>{
  const s=L(P).join(' ')+' · ';const R=P.radius,f=900;font(c,P.size,P);
  const cw=mw(c,'M')*1.1||8;const per=Math.max(8,Math.floor(2*Math.PI*R/cw));const key='orb|'+P.rings+'|'+per;
  let D=OFF[key];if(!D){const r=rng(5);D=OFF[key]=[];for(let k=0;k<P.rings;k++){const a1=r()*Math.PI,a2=r()*Math.PI*2,spd=r()<.5?-1:1;const j=new Float32Array(per*3);for(let i=0;i<per*3;i++)j[i]=(r()-.5)*2;D.push({c1:Math.cos(a1),s1:Math.sin(a1),c2:Math.cos(a2),s2:Math.sin(a2),spd,j});}}
  const ay=u*Math.PI*2,ax=.45+.35*Math.sin(u*Math.PI*2);const env=Math.pow(Math.cos(u*Math.PI*2)*.5+.5,8)*P.chaos;
  const cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax);const pts=[];
  for(const g of D){const ring=[];
   for(let i=0;i<per;i++){const th=i/per*Math.PI*2+u*Math.PI*2*g.spd;const x=R*Math.cos(th)+g.j[i*3]*env,y=R*Math.sin(th)+g.j[i*3+1]*env,z=g.j[i*3+2]*env;
    const y1=y*g.c1-z*g.s1,z1=y*g.s1+z*g.c1,x2=x*g.c2-y1*g.s2,y2=x*g.s2+y1*g.c2,x3=x2*cy+z1*sy,z3=-x2*sy+z1*cy,Y=y2*cx-z3*sx,Z=y2*sx+z3*cx;
    const p=f/(f-Z);ring.push({ch:s[i%s.length],x:400+x3*p,y:285+Y*p,p,z:Z,a:0});}
   for(let i=0;i<per;i++){const o=ring[i],n=ring[(i+1)%per];o.a=Math.atan2(n.y-o.y,n.x-o.x);pts.push(o);}}
  pts.sort((a,b)=>a.z-b.z);const B=c.getTransform();let lf='';
  for(const o of pts){if(o.ch===' ')continue;const fc=mix(P.bg,P.fg,.22+.78*clamp((Math.round((o.z/R+1)*6)/12)));const g=spr(c,o.ch,fc,P.size);put(c,B,o.x,o.y,o.a,o.p,o.p);c.drawImage(g.cv,-g.w/2,-g.h/2,g.w,g.h);}c.setTransform(B);
 }},
{id:'KT-008',name:'Ширины',en:'Bolshy widths',src:'b',tags:['ширина','сетка'],dur:3.4,
 desc:'Две ячейки в строке меняются шириной и высотой в такт. Слово всегда заполняет ячейку, поэтому из узкого становится широким.',
 d:{text:'BOLSHY BOLD',weight:800},
 ps:[['rows','Строк',1,5,1,2],['beats','Тактов за цикл',1,6,1,3],['range','Размах',0,40,1,22]],
 draw:(c,u,P)=>{
  const ws=(L(P)[0]||'').split(' ').filter(Boolean);const A=ws[0]||'TYPE',B=ws[1]||A;const N=P.rows,m=34,W=800-2*m,Hh=571-2*m,g=8;
  const snap=ph=>{const p=ph*P.beats*2;const k=Math.floor(p);const f=eexpo(p-k);return k%2?1-f:f;};const rg=P.range/100;
  const hw=[];for(let r=0;r<N;r++)hw.push(1+(N>1?(r%2?1:-1)*rg*1.5*(snap(u+.25)*2-1):0));const hs=hw.reduce((a,b)=>a+b,0);
  font(c,100,P,{st:'extra-condensed',bl:'alphabetic',al:'left'});const cap=capH(c)||72;
  const wA=mw(c,A)||1,wB=mw(c,B)||1;c.fillStyle=P.fg;let y=m;
  for(let r=0;r<N;r++){const rh=(Hh-g*(N-1))*hw[r]/hs;const v=snap(u),sh=.5+(r%2?-1:1)*rg*(v*2-1);const w1=(W-g)*sh,w2=(W-g)-w1;
   const cells=r%2?[[B,wB,m,w1],[A,wA,m+w1+g,w2]]:[[A,wA,m,w1],[B,wB,m+w1+g,w2]];
   for(const [t,tw,x,w] of cells){c.save();c.translate(x,y+rh);c.scale(w/tw,rh/cap);c.fillText(t,0,0);c.restore();}
   y+=rh+g;}
 }},
{id:'KT-009',name:'Спираль',en:'Spinning top',src:'b',tags:['путь','вращение'],dur:4,
 desc:'Строка раскручивается по спирали из центра, вращается и сматывается обратно. Кегль растёт к краю.',
 d:{text:'SPINNING TOP',weight:600},
 ps:[['size','Кегль',8,40,1,18],['turns','Витков',1,8,.5,3.5],['gap','Шаг витка',16,80,1,38],['spin','Обороты за цикл',1,4,1,1]],
 draw:(c,u,P)=>{
  const s=L(P).join(' ')+'   ';const b=P.gap/(2*Math.PI),a0=30;
  const grow=u<.3?eout(seg(u,0,.3)):u>.7?1-ein(seg(u,.7,1)):1;const thMax=P.turns*2*Math.PI*grow;const rot=-eio(u)*Math.PI*2*P.spin;
  c.fillStyle=P.fg;let th=0,i=0,guard=0;
  font(c,P.size,P);const B=c.getTransform();
  while(th<thMax&&guard++<4000){const r=a0+b*th;const k=clamp(r/220,.5,1.25);const ch=s[i%s.length];const w=mw(c,ch)*k;
   const ang=th+rot;if(ch!==' '){put(c,B,400+r*Math.cos(ang),285+r*Math.sin(ang),ang+Math.PI/2,k,k);c.fillText(ch,0,0);}
   th+=(w+P.size*k*.08)/r;i++;}c.setTransform(B);
 }},
{id:'KT-010',name:'Плитки',en:'Tile glyph',src:'b',tags:['сетка','глиф'],dur:3.2,
 desc:'Крупный знак режется на сетку плиток. Волна поворачивает и разводит плитки, затем собирает знак обратно.',
 d:{text:'R',weight:800},
 ps:[['size','Кегль',120,560,1,420],['grid','Плиток в ряду',4,24,1,10],['spin','Поворот, ×90°',0,4,.5,1],['spread','Разлёт, %',0,100,1,30]],
 draw:(c,u,P)=>{
  const t=L(P)[0]||'R';const o=offc('tile|'+t+P.size+P.fg+P.family+P.weight,800,571,x=>{font(x,P.size,P,{bl:'alphabetic'});const cap=capH(x)||P.size*.7;x.fillStyle=P.fg;x.fillText(t,400,285+cap/2);});
  const n=P.grid,ts=800/n,rows=Math.ceil(571/ts);
  for(let j=0;j<rows;j++)for(let i=0;i<n;i++){const d=((i+j)/(n+rows))*.18;const a=eio(seg(u,.08+d,.36+d))-eio(seg(u,.58+d,.86+d));const sx=i*ts,sy=j*ts;
   if(a<=.001){c.drawImage(o.cv,sx*2,sy*2,(ts+1)*2,(ts+1)*2,sx,sy,ts+1,ts+1);continue;}
   const k=1-a*.55,sp=1+a*P.spread/100;c.save();c.translate(400+(sx+ts/2-400)*sp,285+(sy+ts/2-285)*sp);c.rotate(a*Math.PI/2*P.spin*((i+j)%2?1:-1));c.scale(k,k);c.drawImage(o.cv,sx*2,sy*2,ts*2,ts*2,-ts/2,-ts/2,ts,ts);c.restore();}
 }},
{id:'KT-011',name:'Рамки',en:'Nested frames',src:'b',tags:['вращение','сетка'],dur:4,
 desc:'Вложенные квадратные рамки из слова. Рамки по очереди делают четверть оборота, соседние вращаются в разные стороны.',
 d:{text:'BITTERSWEET',weight:800},
 ps:[['levels','Уровней',2,8,1,5],['shrink','Сжатие, %',50,85,1,64],['size','Кегль, % от рамки',6,20,1,11]],
 draw:(c,u,P)=>{
  const w=L(P)[0]||'TYPE';c.fillStyle=P.fg;
  for(let k=0;k<P.levels;k++){const S=500*Math.pow(P.shrink/100,k);let px=S*P.size/100;font(c,px,P,{st:'condensed',bl:'alphabetic'});
   let cap=capH(c)||px*.7;const len=S-cap*2.4;let tw=mw(c,w)||1;
   if(tw>len){px*=len/tw;font(c,px,P,{st:'condensed',bl:'alphabetic'});cap=capH(c)||px*.7;tw=mw(c,w)||1;}
   let rot=0;for(let q=0;q<4;q++){const t0=q/4+k*.012;rot+=eexpo(seg(u,t0+.04,t0+.16));}rot*=Math.PI/2*(k%2?-1:1);
   const reps=Math.max(1,Math.floor(len/(tw*1.18)));
   c.save();c.translate(400,285);c.rotate(rot);
   for(let sd=0;sd<4;sd++){c.save();c.rotate(sd*Math.PI/2);for(let rp=0;rp<reps;rp++)c.fillText(w,-len/2+(rp+.5)*len/reps,-S/2+cap*1.1);c.restore();}
   c.restore();}
 }},
{id:'KT-012',name:'Барабан',en:'Rolling',src:'b',tags:['3D','строки'],dur:3.6,
 desc:'Строки сидят на барабане и прокручиваются через верх. Дальние строки уходят в тон фона.',
 d:{text:'ROLLING',weight:900},
 ps:[['size','Кегль',20,90,1,52],['rows','Строк на барабане',8,30,1,16],['turns','Оборотов за цикл',1,4,1,1]],
 draw:(c,u,P)=>{
  const w=L(P)[0]||'ROLL';const line=w+' '+w;font(c,P.size,P,{st:'expanded'});const tw=mw(c,line)||1;const px=P.size*Math.min(1,740/tw);font(c,px,P,{st:'expanded'});
  const N=P.rows,R=Math.min(270,px*N/(2*Math.PI));const rot=eio(seg(u,.05,.85))*Math.PI*2*P.turns;
  for(let i=0;i<N;i++){const ph=i/N*Math.PI*2+rot;const z=Math.cos(ph);if(z<.04)continue;c.fillStyle=mix(P.bg,P.fg,.25+.75*z);c.save();c.translate(400,285+R*Math.sin(ph));c.scale(1,z);c.fillText(line,0,0);c.restore();}
 }},
{id:'KT-013',name:'Зеркало',en:'Zoom flip',src:'b',tags:['масштаб','глитч'],dur:2.8,
 desc:'Два блока, прямой и перевёрнутый, меняются местами и масштабом ступенчатым рывком.',
 d:{text:'ZO|OM',weight:800},
 ps:[['size','Кегль',60,260,1,170],['steps','Ступеней',1,12,1,6],['small','Малый блок, %',15,60,1,30]],
 draw:(c,u,P)=>{
  const ls=L(P);font(c,P.size,P,{st:'semi-expanded',bl:'alphabetic',al:'left'});const cap=capH(c)||P.size*.7;const lh=cap*1.12;
  const bw=Math.max(...ls.map(l=>mw(c,l))),bh=lh*(ls.length-1)+cap;const q=v=>Math.round(v*P.steps)/P.steps;
  const sw=q(eexpo(seg(u,.3,.45)))-q(eexpo(seg(u,.8,.95)));const big={x:270,y:300,s:1},sm={x:650,y:110,s:P.small/100};
  const at=(a,b)=>({x:lerp(a.x,b.x,sw),y:lerp(a.y,b.y,sw),s:lerp(a.s,b.s,sw)});
  const block=(o,flip)=>{c.save();c.translate(o.x,o.y);c.scale(o.s,o.s);if(flip)c.rotate(Math.PI);c.fillStyle=P.fg;ls.forEach((l,i)=>c.fillText(l,-bw/2,-bh/2+cap+i*lh));c.restore();};
  block(at(big,sm),false);block(at(sm,big),true);
 }},
{id:'KT-014',name:'Лента',en:'Inside out',src:'b',tags:['3D','путь'],dur:4,
 desc:'Текст на ленте вдоль кольца. Лента перекручивается, буквы уходят на изнанку и выходят обратно.',
 d:{text:'INSIDE OUT',family:'serif',weight:400},
 ps:[['size','Кегль',16,80,1,40],['radius','Радиус',80,260,1,170],['twists','Перекрутов',1,5,1,2],['band','Плашка ленты (0/1)',0,1,1,1]],
 draw:(c,u,P)=>{
  const s=L(P).join(' ')+' ';font(c,P.size,P);const R=P.radius;const unit=mw(c,s)||1,circ=2*Math.PI*R;const reps=Math.max(1,Math.round(circ/unit)),k=circ/(unit*reps);
  const spin=u*Math.PI*2,bh=P.size*1.05,back=mix(P.fg,P.bg,.35);let acc=0;const items=[];
  for(const ch of s.repeat(reps)){const w=mw(c,ch)*k;const a=(acc+w/2)/R+spin;acc+=w;items.push({ch,a,w,sy:Math.cos(a*P.twists+spin)});}
  items.sort((x,y)=>(x.sy>0)-(y.sy>0));
  const B=c.getTransform();
  for(const o of items){if(Math.abs(o.sy)<.02)continue;put(c,B,400+R*Math.cos(o.a),285+R*Math.sin(o.a),o.a+Math.PI/2,1,o.sy);
   if(P.band){c.fillStyle=o.sy>0?P.fg:back;c.fillRect(-o.w/2-.6,-bh/2,o.w+1.2,bh);c.fillStyle=P.bg;}else c.fillStyle=o.sy>0?P.fg:back;
   c.fillText(o.ch,0,0);}c.setTransform(B);
 }},
{id:'KT-015',name:'Осколки',en:'Broken',src:'b',tags:['глитч','разлом'],dur:5.4,
 desc:'Слово дрожит глитчем, затем разлетается на прямоугольные осколки и собирается.',
 d:{text:'BROKEN',weight:500},
 ps:[['size','Кегль',40,200,1,96],['force','Разлёт',10,200,1,70],['shards','Осколков',10,120,1,46]],
 draw:(c,u,P)=>{
  const t=L(P).join(' ');const o=offc('sh|'+t+P.size+P.fg+P.family+P.weight,800,571,x=>{font(x,P.size,P,{bl:'alphabetic'});const cap=capH(x)||P.size*.7;x.fillStyle=P.fg;x.fillText(t,400,285+cap/2);});
  font(c,P.size,P);const tw=Math.min(800,mw(c,t)+24),th=P.size*1.1,bx=400-tw/2,by=285-th/2;
  const amp=u<.42?0:u<.55?eout(seg(u,.42,.55)):u<.75?1:1-eio(seg(u,.75,.92));const glitch=(u>.15&&u<.42)||(u>.88&&u<.95);const fr=Math.floor(u*90);
  if(amp<=0&&!glitch){c.drawImage(o.cv,0,0,1600,1142,0,0,800,571);return;}
  const r=rng(77);const rowsN=Math.max(2,Math.round(Math.sqrt(P.shards/2)));const cols=Math.max(1,Math.round(P.shards/rowsN));const rh=th/rowsN;
  for(let j=0;j<rowsN;j++){const y=by+j*rh;const cuts=[];for(let i=0;i<cols-1;i++)cuts.push(r());cuts.sort((a,b)=>a-b);const e=[0,...cuts,1];
   for(let i=0;i<cols;i++){const sx=bx+e[i]*tw,sw=(e[i+1]-e[i])*tw;const ang=r()*Math.PI*2,dist=(.3+r())*P.force*2,rot=(r()-.5)*1.2;if(sw<.5)continue;
    const g=glitch?rng(fr*131+j*17+i)():0;const gx=g>.6?(g-.8)*44:0;
    c.save();c.translate(sx+sw/2+Math.cos(ang)*dist*amp+gx,y+rh/2+Math.sin(ang)*dist*amp);c.rotate(rot*amp);c.drawImage(o.cv,sx*2,y*2,sw*2,rh*2,-sw/2,-rh/2,sw,rh);c.restore();}}
 }},
{id:'KT-016',name:'Волна',en:'Wave',src:'b',tags:['сетка','волна'],dur:2,
 desc:'Решётка из слова, по которой проходит синусоида. Каждая буква поднимается и поворачивается по касательной.',
 d:{text:'WAVE',family:'serif',weight:400},
 ps:[['cols','Колонок',1,8,1,4],['rows','Строк',2,16,1,8],['amp','Амплитуда',0,60,1,18],['len','Длина волны',100,800,10,340]],
 draw:(c,u,P)=>{
  const w=L(P)[0]||'WAVE';const cw=720/P.cols;font(c,100,P);const tw=mw(c,w)||1;const px=100*cw*.92/tw;font(c,px,P);const lh=px*.86;const y0=285-lh*P.rows/2+lh/2;c.fillStyle=P.fg;
  const chs=[...w];const ws=chs.map(ch=>mw(c,ch));const tpx=ws.reduce((a,b)=>a+b,0);const B=c.getTransform();
  for(let r=0;r<P.rows;r++)for(let col=0;col<P.cols;col++){let x=40+col*cw+(cw-tpx)/2;
   chs.forEach((ch,i)=>{const cx=x+ws[i]/2;const ph=2*Math.PI*(cx/P.len-u);put(c,B,cx,y0+r*lh+P.amp*Math.sin(ph),Math.atan(P.amp*2*Math.PI/P.len*Math.cos(ph)),1,1);c.fillText(ch,0,0);x+=ws[i];});}c.setTransform(B);
 }},
{id:'KT-017',name:'Кассета',en:'Rings',src:'b',tags:['строки','маска'],dur:3.6,
 desc:'Строки открываются по одной в окне и бегут лентой в разные стороны, затем закрываются.',
 d:{text:'RINGS',weight:500},
 ps:[['size','Кегль',16,80,1,40],['rows','Строк',1,8,1,5],['speed','Скорость ленты',1,4,1,1],['width','Окно, px',200,760,10,460]],
 draw:(c,u,P)=>{
  const w=(L(P)[0]||'TYPE')+' ';font(c,P.size,P,{st:'condensed',al:'left'});const unit=mw(c,w)||1;const cap=P.size*.92,N=P.rows,bw=P.width,bx=400-bw/2;
  const hs=[];for(let i=0;i<N;i++)hs.push(eout(seg(u,.04+i*.05,.16+i*.05))-ein(seg(u,.6+i*.035,.72+i*.035)));
  let y=285-hs.reduce((a,b)=>a+b,0)*cap/2;c.fillStyle=P.fg;
  for(let i=0;i<N;i++){const h=hs[i]*cap;if(h<.5){y+=h;continue;}const off=((u*P.speed*(i%2?1:-1))%1+1)%1*unit;
   c.save();c.beginPath();c.rect(bx,y,bw,h);c.clip();c.translate(0,y+h/2);c.scale(1,hs[i]);for(let x=bx-2*unit+off;x<bx+bw;x+=unit)c.fillText(w,x,0);c.restore();y+=h;}
 }},
{id:'KT-018',name:'Поле',en:'Field',src:'b',tags:['сетка','волна'],dur:4,
 desc:'Сетка знаков проворачивается волной из угла. Подходит для одного символа или короткого слова.',
 d:{text:'0',weight:700},
 ps:[['cols','Колонок',4,24,1,11],['size','Кегль, % от ячейки',30,140,1,80],['delay','Растяжка волны',0,60,1,35]],
 draw:(c,u,P)=>{
  const g=[...L(P).join('').replace(/\s/g,'')];if(!g.length)g.push('0');const n=P.cols,cs=680/n,rows=Math.max(1,Math.floor(460/cs));const x0=400-cs*(n-1)/2,y0=285-cs*(rows-1)/2;
  font(c,cs*P.size/100,P,{st:'expanded'});c.fillStyle=P.fg;let k=0;
  for(let j=0;j<rows;j++)for(let i=0;i<n;i++){const d=(i/(n-1||1)*.6+j/(rows-1||1)*.4)*P.delay/100*.25;
   const a=Math.PI*(eio(seg(u,.03+d,.25+d))+eio(seg(u,.5+d,.72+d)));c.save();c.translate(x0+i*cs,y0+j*cs);c.rotate(a);c.fillText(g[k++%g.length],0,0);c.restore();}
 }},
{id:'KT-019',name:'Набивка',en:'Packed',src:'b',tags:['ширина','масштаб'],dur:3.5,
 desc:'Слово набирается по букве на весь кадр. Каждая новая буква сжимает предыдущие, затем слово разбирается.',
 d:{text:'PACKED',weight:900},
 ps:[['bleed','Вылет за край',0,80,1,10],['hold','Пауза, %',0,40,1,15]],
 draw:(c,u,P)=>{
  const t=[...(L(P)[0]||'PACK').replace(/\s/g,'')];if(!t.length)return;const N=t.length;font(c,100,P,{st:'extra-condensed',bl:'alphabetic',al:'left'});const cap=capH(c)||72;
  const hd=P.hold/100,a=.45-hd/2;const cnt=1+(N-1)*(eio(seg(u,.02,a))-eio(seg(u,a+hd+.05,.95)));
  const adv=t.map(ch=>mw(c,ch)||1);const wt=t.map((_,i)=>i===0?1:clamp(cnt-i));const tot=wt.reduce((s,w,i)=>s+w*adv[i],0);
  const W=800+P.bleed*2,H=571+P.bleed*2;let x=-P.bleed;c.fillStyle=P.fg;
  t.forEach((ch,i)=>{const sw=W*wt[i]*adv[i]/tot;if(sw<.5)return;c.save();c.translate(x,571+P.bleed);c.scale(Math.max(.001,sw-4)/adv[i],H/cap);c.fillText(ch,0,0);c.restore();x+=sw;});
 }},
{id:'KT-020',name:'Каскад',en:'Optical',src:'b',tags:['эхо','масштаб'],dur:3,
 desc:'Цепочки копий слова уменьшаются к центру и непрерывно едут на зрителя.',
 d:{text:'OPTICAL',weight:700},
 ps:[['size','Кегль',60,260,1,150],['copies','Копий',4,24,1,12],['ratio','Шаг масштаба, %',60,92,1,78]],
 draw:(c,u,P)=>{
  const t=L(P)[0]||'TYPE';font(c,P.size,P,{st:'expanded'});c.lineJoin='round';c.strokeStyle=P.bg;c.fillStyle=P.fg;const rr=P.ratio/100,f=(u*2)%1;
  const chain=(x0,y0,dx,dy,rot)=>{for(let k=P.copies;k>=0;k--){const sc=Math.pow(rr,k-f);c.save();c.translate(x0+dx*(1-sc),y0+dy*(1-sc));c.rotate(rot);c.scale(sc,sc);c.lineWidth=Math.max(2,P.size*.08);c.strokeText(t,0,0);c.fillText(t,0,0);c.restore();}};
  chain(400,62,-120,250,.1);chain(400,505,140,-240,-.12);
 }},
{id:'KT-021',name:'Спесимен',en:'Specimen',src:'p1',tags:['шрифт','сцены'],dur:9,
 desc:'Три сцены шрифтового промо: контур заполняется по строкам, лесенка кеглей, крупный кроп с прокруткой.',
 d:{text:'NEUE|MONTREAL',weight:700,fg:'#111111',bg:'#ededea'},
 ps:[['size','Кегль',40,160,1,96]],
 draw:(c,u,P)=>{
  const ls=L(P);const A=ls[0]||'TYPE',B=ls[1]||A;c.fillStyle=P.fg;c.strokeStyle=P.fg;
  font(c,11,P,{w:500,al:'left',fam:'sans'});['Regular','Medium','Bold','Black'].forEach((l,i)=>c.fillText(l,24+i*120,22));
  if(u<.34){const v=seg(u,0,.34);font(c,P.size,P,{st:'expanded',bl:'alphabetic'});const cap=capH(c)||P.size*.7;const lh=cap*1.25,n=4,y0=285-lh*(n-1)/2+cap/2;c.lineWidth=1.4;
   for(let i=0;i<n;i++){const out=ein(seg(v,.8+i*.03,.96+i*.01))*(i%2?1:-1)*1000;const y=y0+i*lh;if(v>.12+i*.12)c.fillText(A,400+out,y);else c.strokeText(A,400+out,y);}}
  else if(u<.67){const v=seg(u,.34,.67);let y=56;
   for(let k=0;k<6;k++){const px=P.size*.22*Math.pow(1.38,k);font(c,px,P,{al:'left',bl:'alphabetic'});const cap=capH(c)||px*.7;y+=cap*1.3;const e=eexpo(seg(v,k*.08,k*.08+.2))-eexpo(seg(v,.8,.98));
    c.save();c.beginPath();c.rect(0,y-cap*1.15,800,cap*1.3);c.clip();c.fillText(B,24,y+(1-e)*cap*1.3);c.restore();}}
  else{const v=seg(u,.67,1);font(c,P.size*2.6,P,{bl:'alphabetic',al:'left'});const cap=capH(c)||P.size*1.8;
   const e=eio(seg(v,.05,.5)),x2=eio(seg(v,.62,.96));const w1=mw(c,A),w2=mw(c,B);
   c.fillText(A,30-e*Math.max(0,w1-740)-x2*1200,285-12);c.fillText(B,30-(1-e)*Math.max(0,w2-740)+x2*1200,285+cap+12);}
 }},
{id:'KT-022',name:'Пролёт',en:'Fly-through',src:'p2',tags:['масштаб','постер'],dur:6,
 desc:'Афиша с плашкой и именем. Копии имени по очереди пролетают сквозь кадр с огромным увеличением.',
 d:{text:'SPATIAL|SOUND',weight:500,fg:'#0a0a0a',bg:'#f2f1ee',accent:'#d63a1f'},
 ps:[['size','Кегль',40,140,1,92],['zoom','Глубина пролёта',3,30,1,14],['passes','Пролётов за цикл',1,6,1,3]],
 draw:(c,u,P)=>{
  const ls=L(P);c.fillStyle=P.accent||'#d63a1f';c.fillRect(36,56,330,250);
  c.fillStyle=P.fg;font(c,12,P,{al:'left',w:500,fam:'sans'});['25—27','NOVEMBER','LIVE SET'].forEach((l,i)=>c.fillText(l,560,70+i*16));
  font(c,P.size,P,{al:'left',bl:'alphabetic'});const cap=capH(c)||P.size*.7;const lh=cap*1.14,by=540-(ls.length-1)*lh;
  const blk=()=>ls.forEach((l,i)=>c.fillText(l,36,by+i*lh));blk();
  const fx=36+(mw(c,ls[0])||0)*.5,fy=by-cap/2;
  for(let j=0;j<P.passes;j++){const t0=.08+j*(.7/P.passes);const f=seg(u,t0,t0+.32);if(f<=0||f>=1)continue;const s=Math.pow(P.zoom,ein(f));c.save();c.translate(fx,fy);c.scale(s,s);c.translate(-fx,-fy);blk();c.restore();}
 }}
];
const BASE={"text":"TYPE","family":"sans","weight":700,"fg":"#ffffff","bg":"#000000","speed":1};
const SOURCES={"b":{"title":"Vincenzo Marchese Ragona — Kinetic Typography Experiments (Behance)","url":"https://www.behance.net/gallery/72905057/Kinetic-Typography-Experiments"},"p1":{"title":"Motion Graphics Typography (Pinterest)","url":"https://ru.pinterest.com/pin/715579828320306498/"},"p2":{"title":"Moving identity poster (Pinterest)","url":"https://ru.pinterest.com/pin/771593348682271784/"}};
const byId=id=>{const p=PRESETS.find(p=>p.id===String(id).toUpperCase());if(!p)throw new Error('Kinetic: unknown preset '+id);return p;};
const defaults=id=>{const p=byId(id);const o={...BASE,...p.d};p.ps.forEach(r=>o[r[0]]=r[5]);return o;};
const clearCache=()=>{for(const k in OFF)delete OFF[k];for(const k in MW)delete MW[k];MWn=0;};
/** Draw one frame. u = position in the loop, 0…1. */
function render(canvas,id,u,params){const p=byId(id);paintU(canvas,p.draw,{...defaults(id),...params},((u%1)+1)%1);}
/** Start a looping animation on a canvas. Returns a controller. */
function play(canvas,id,params,opts){
  opts=opts||{};const p=byId(id);let P={...defaults(id),...params};let u=opts.start||0,paused=!!opts.paused,raf=0,last=performance.now();
  const fit=()=>{if(opts.autoSize===false)return;const dpr=Math.min(opts.maxDpr||2,window.devicePixelRatio||1);const w=Math.round(canvas.clientWidth*dpr)||canvas.width;if(w&&canvas.width!==w){canvas.width=w;canvas.height=Math.round(w*571/800);}};
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(fit):null;if(ro)ro.observe(canvas);fit();
  const frame=now=>{const dt=Math.min(.1,(now-last)/1000);last=now;if(!paused){u=(u+dt*P.speed/p.dur)%1;}paintU(canvas,p.draw,P,u);raf=requestAnimationFrame(frame);};
  const go=()=>{last=performance.now();raf=requestAnimationFrame(frame);};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{clearCache();go();});else go();
  return{
    get progress(){return u;}, get params(){return {...P};},
    pause(){paused=true;}, resume(){paused=false;}, toggle(){paused=!paused;},
    seek(v){u=((v%1)+1)%1;paintU(canvas,p.draw,P,u);},
    set(next){P={...P,...next};clearCache();},
    stop(){cancelAnimationFrame(raf);if(ro)ro.disconnect();}
  };
}
const list=()=>PRESETS.map(p=>({id:p.id,name:p.name,en:p.en,tags:p.tags.slice(),duration:p.dur,description:p.desc,source:SOURCES[p.src]||null,defaults:defaults(p.id),params:p.ps.map(([key,label,min,max,step,def])=>({key,label,min,max,step,default:def}))}));
return{version:'1.0.0',stage:{width:800,height:571},presets:list(),list,defaults,render,play,clearCache};
});
/* Скрипты презентации ACTION (инлайновые скрипты макета), переведённые на контейнер: разметка и стили живут в Shadow DOM,
   поиск элементов идёт внутри него, фиксированные плашки (логотип канала, навигация по слайдам) показываются только пока
   презентация на экране, слайды подгоняются под высоту окна без навигации сайта; наблюдатели, слушатели, звук и циклы
   анимации останавливаются при размонтировании. Движок Kinetic — отдельно (action-kinetic.js). */
window.ActionPresentation = (() => {
  let controller = null;
  let observers = [];
  let alive = false;
  let generation = 0;
  let audio = null;
  const BASE = 'img/action-pres/';
  function mount(host, shadow, { scrollTo, scrollRaw, navEl } = {}) {
    unmount();
    controller = new AbortController();
    alive = true;
    const gen = ++generation;
    const live = () => alive && gen === generation;
    const { signal } = controller;
    const tracked = C => function (...a) { const o = new C(...a); observers.push(o); return o; };
    const IntersectionObserver = tracked(window.IntersectionObserver), ResizeObserver = tracked(window.ResizeObserver), MutationObserver = tracked(window.MutationObserver);
    const navH = () => navEl?.offsetHeight || 0;
    const slideH = () => shadow.querySelector('main>.viewport-slide')?.clientHeight || innerHeight;
    const scrollSlide = (el, opts = {}) => { if (!el) return; if (scrollRaw) scrollRaw(el, { offset: -navH(), ...opts }); else el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

    /* ---- положение контейнера: отступы для фиксированных плашек и флаг «презентация на экране» */
    function place() {
      if (!live()) return;
      const r = host.getBoundingClientRect(), nh = navH();
      host.style.setProperty('--pres-left', r.left + 'px'); host.style.setProperty('--pres-right', Math.max(0, innerWidth - r.right) + 'px');
      host.classList.toggle('pres-on', r.top <= nh + 30 && r.bottom >= nh + 90);
    }
    /* ---- «монтажные склейки»: после остановки прокрутки подтягиваем ближайший слайд, если он близко (в макете — scroll-snap) */
    let snapTimer = 0;
    function snap() {
      if (!live() || !host.classList.contains('pres-on')) return;
      const nh = navH(); let best = null, dist = Infinity;
      stages.forEach(s => { const d = s.getBoundingClientRect().top - nh; if (Math.abs(d) < Math.abs(dist)) { dist = d; best = s; } });
      if (best && Math.abs(dist) > 1 && Math.abs(dist) < slideH() / 3) scrollSlide(best, { duration: .7 });
    }
    addEventListener('scroll', () => { place(); clearTimeout(snapTimer); snapTimer = setTimeout(snap, 160); }, { passive: true, signal });
    addEventListener('resize', place, { signal });
    requestAnimationFrame(place);

    /* ---- якоря: #top и #motion — слайды, прокрутка как у навигации по слайдам */
    shadow.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      e.preventDefault(); const target = shadow.getElementById(a.getAttribute('href').slice(1));
      if (target) scrollSlide(target); else if (scrollTo) scrollTo(0);
    }, { signal });

    /* ---- навигация по слайдам (script 7): кнопки ↑/↓, счётчик, текущая сцена — на хосте вместо body */
    const stages = [...shadow.querySelectorAll('main>.viewport-slide')];
    const pageNav = document.createElement('nav'); pageNav.className = 'layout-page-nav'; pageNav.setAttribute('aria-label', 'Slide navigation');
    pageNav.innerHTML = '<button type="button" aria-label="Previous slide">↑</button><output>1 / ' + stages.length + '</output><button type="button" aria-label="Next slide">↓</button>';
    shadow.querySelector('main').before(pageNav);
    let active = 0; const go = d => scrollSlide(stages[Math.max(0, Math.min(stages.length - 1, active + d))]); pageNav.children[0].onclick = () => go(-1); pageNav.children[2].onclick = () => go(1);
    const sceneIO = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting && entry.intersectionRatio > .55) { host.dataset.scene = entry.target.id; active = stages.indexOf(entry.target); pageNav.querySelector('output').textContent = (active + 1) + ' / ' + stages.length; } }), { threshold: .56 }); stages.forEach(stage => sceneIO.observe(stage));

    /* ---- звук выстрела и гильзы (script 4): контекст создаётся по первому жесту, буферы — файлы из img/action-pres */
    const AC = window.AudioContext || window.webkitAudioContext; let context = null, ready = null, buffers = {};
    function ensureAudio() {
      if (!AC) return null;
      if (!context) { context = new AC(); ready = Promise.all(Object.entries({ shot: 'gunshot.mp3', casing: 'casing-trim.mp3' }).map(async ([key, file]) => { const r = await fetch(BASE + file); if (!r.ok) throw new Error('Audio unavailable'); buffers[key] = await context.decodeAudioData(await r.arrayBuffer()); })).catch(() => {}); }
      context.resume().catch(() => {}); return context;
    }
    audio = { close: () => { context?.close().catch(() => {}); context = null; } };
    document.addEventListener('pointerdown', ensureAudio, { once: true, signal }); document.addEventListener('keydown', ensureAudio, { once: true, signal });
    function sound(buffer, time, volume, rate = 1) { if (!buffer) return; const source = context.createBufferSource(), gain = context.createGain(); source.buffer = buffer; source.playbackRate.value = rate; gain.gain.value = volume; source.connect(gain); gain.connect(context.destination); source.onended = () => { source.disconnect(); gain.disconnect(); }; source.start(time); }
    async function shotSound(flight) { try { if (!ensureAudio()) return; await context.resume(); await ready; if (!live()) return; const now = context.currentTime; sound(buffers.shot, now, .48, .97 + Math.random() * .06); sound(buffers.casing, now + flight, .62, .94 + Math.random() * .12); } catch (e) {} }

    /* ---- script 3: кинетическая типографика на canvas */
    (()=>{
 const canvas=shadow.getElementById('action-kinetic'),section=shadow.getElementById('motion');if(!canvas||!window.Kinetic)return;
 const choices={
  'KT-002':{text:'ПОЛНЫЙ|контакт.|ACTION',size:220,leading:.76,hops:3,drops:3},
  'KT-007':{text:'ACTION • В ДЕЙСТВИИ • ',size:20,radius:212,rings:7,chaos:22},
  'KT-011':{text:'ACTION',levels:5,shrink:64,size:14}
 };
 let mode='KT-002',u=.2,visible=false,manualPause=false,raf=0,last=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const editing=()=>!live()||host.classList.contains('layout-editing');
 const draw=()=>Kinetic.render(canvas,mode,u,{...choices[mode],...(mode==='KT-002'&&innerWidth<=768?{size:240}:{}),fg:'#12130f',bg:'#c6ff00',weight:400,family:'sans'});
 function fit(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);if(r.width&&r.height){canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);Kinetic.clearCache();draw()}}
 function frame(now){raf=0;if(!visible||document.hidden||editing()||manualPause||reduced){last=0;return}const duration=Kinetic.presets.find(p=>p.id===mode).duration*(mode==='KT-007'?3:1);u=(u+(last?Math.min(now-last,70):0)/1000/duration)%1;last=now;draw();raf=requestAnimationFrame(frame)}
 function start(){if(!raf&&visible&&!manualPause&&!reduced&&!editing()&&!document.hidden)raf=requestAnimationFrame(frame)}
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;start()},{threshold:.1}).observe(section);
 new ResizeObserver(fit).observe(canvas);
 document.fonts.ready.then(()=>{Kinetic.clearCache();fit();start()});
 shadow.querySelectorAll('[data-kinetic]').forEach(button=>button.addEventListener('click',()=>{if(editing())return;mode=button.dataset.kinetic;u=.2;last=0;Kinetic.clearCache();shadow.querySelectorAll('[data-kinetic]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));shadow.getElementById('kinetic-mode-name').textContent=button.textContent.replace(/[↗\d]/g,'').trim()+' / ACTION REGULAR';draw();start()}));
 shadow.getElementById('kinetic-pause').addEventListener('click',event=>{if(editing())return;manualPause=!manualPause;event.currentTarget.setAttribute('aria-pressed',String(manualPause));event.currentTarget.textContent=manualPause?'PLAY ▷':'PAUSE Ⅱ';start()});
 document.addEventListener('visibilitychange',start,{signal});
 new MutationObserver(start).observe(host,{attributes:true,attributeFilter:['class']});
 fit();
})();
    /* ---- script 5: таймер, комикс, тир, эфир, набор знаков, тестер */
    (async()=>{
const $=id=>shadow.getElementById(id),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;let paused=reduce,heroVisible=true;
host.classList.toggle('motion-paused',paused);
const observer=new IntersectionObserver(es=>es.forEach(e=>{e.target.classList.toggle('inview',e.isIntersecting);e.target.classList.toggle('offscreen',!e.isIntersecting);if(e.target.id==='top')heroVisible=e.isIntersecting}),{threshold:.12});shadow.querySelectorAll('section,.comic-panel').forEach(n=>observer.observe(n));
let last=0,elapsed=0,lastTick=-1;function tick(now){if(!live())return;const dt=last?Math.min(now-last,80):0;last=now;if(!paused&&!host.classList.contains('layout-editing')&&heroVisible&&!document.hidden)elapsed+=dt;const phase=elapsed%8000,left=Math.max(0,5000-phase),hundredths=Math.ceil(left/10),sec=Math.floor(hundredths/100),fraction=hundredths%100;if(hundredths!==lastTick){$('countdown').innerHTML='00:'+String(sec).padStart(2,'0')+'<span>.'+String(fraction).padStart(2,'0')+'</span>';$('timer-progress').style.width=(left/50)+'%';$('timer-message').textContent=left===0?'МОТОР!':left<1600?'ЦЕЛЬ УЖЕ БЛИЗКО.':'ПРИГОТОВЬТЕСЬ.';lastTick=hundredths}requestAnimationFrame(tick)}requestAnimationFrame(tick);
shadow.querySelectorAll('.comic-panel').forEach(panel=>panel.onclick=()=>{panel.classList.add('replay');const nodes=panel.querySelectorAll('.comic-art,.comic-caption,.poster-bubble,.poster-boom,.boom-impact,.bang-letter');nodes.forEach(n=>n.style.animation='none');void panel.offsetWidth;nodes.forEach(n=>n.style.animation='')});
const [paths,inkGlyphs]=await Promise.all(['glyphs.json','glyph-ink.json'].map(file=>fetch(BASE+file).then(r=>r.json())));if(!live())return;const letters=[...'ПЕРЕХВАТ'];let selected=0,lastInteraction=0,aimState="wide",lockTimer;const screen=shadow.querySelector('.tracking-screen');letters.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c;b.setAttribute('aria-label','Track '+c);b.onclick=()=>{lastInteraction=performance.now();track(i)};b.onfocus=()=>{lastInteraction=performance.now();track(i)};$('tracking-word').append(b)});
function setAim(state){aimState=state;screen.dataset.aim=state;$('fire').disabled=false;$('fire').querySelector('.fire-label').textContent='СТРЕЛЯЙ';$('lock-status').textContent=state==='locked'?'LOCKED / '+String(selected+1).padStart(2,'0'):state==='acquiring'?'ACQUIRING':'SEARCH';$('tracking-box').querySelector('span').textContent=state==='locked'?'LOCK':state==='acquiring'?'ACQUIRING':'SEARCH'}
function releaseAim(){clearTimeout(lockTimer);setAim('wide');positionBox()}
function track(index,acquire=true){const next=(index+letters.length)%letters.length;if(acquire&&next===selected&&aimState!=='wide')return;clearTimeout(lockTimer);selected=(index+letters.length)%letters.length;const buttons=[...$('tracking-word').children];buttons.forEach((b,i)=>{b.classList.toggle('active',i===selected);b.setAttribute('aria-pressed',String(i===selected))});const c=letters[selected],g=paths[c];$('glyph-path').setAttribute('d',g.path);$('glyph-outline').setAttribute('viewBox',`-50 -80 ${g.width+100} 1000`);$('glyph-outline').setAttribute('aria-label','Outline of '+c);$('target-code').textContent='U+'+c.codePointAt(0).toString(16).toUpperCase();$('glyph-index').textContent=String(selected+1).padStart(2,'0')+' / 08';setAim(acquire?'acquiring':'wide');
if(acquire){
 const box=$('tracking-box');box.style.transition='none';positionBox(true);void box.offsetWidth;
 box.style.removeProperty('transition');positionBox();
 lockTimer=setTimeout(()=>{if(!host.classList.contains('layout-editing'))setAim('locked')},650);
}else positionBox()}
function positionBox(expanded=false){const b=$('tracking-word').children[selected];if(!b)return;const rect=b.getBoundingClientRect(),parent=screen.getBoundingClientRect(),box=$('tracking-box'),sx=screen.clientWidth/parent.width,sy=screen.clientHeight/parent.height;if(expanded){const bw=rect.width*sx,bh=rect.height*sy,w=Math.min(screen.clientWidth-32,Math.max(bw*2.8,bw+150)),h=Math.min(screen.clientHeight-110,bh+90),cx=(rect.left-parent.left)*sx+bw/2,cy=(rect.top-parent.top)*sy+bh/2;box.style.left=Math.max(16,Math.min(screen.clientWidth-w-16,cx-w/2))+'px';box.style.top=Math.max(50,Math.min(screen.clientHeight-h-60,cy-h/2))+'px';box.style.width=w+'px';box.style.height=h+'px';return}const wide=aimState==='wide';box.style.left=(wide?24:(rect.left-parent.left)*sx-8)+'px';box.style.top=(wide?Math.max(135,(rect.top-parent.top)*sy-60):(rect.top-parent.top)*sy-8)+'px';box.style.width=(wide?screen.clientWidth-48:rect.width*sx+16)+'px';box.style.height=(wide?rect.height*sy+120:rect.height*sy+16)+'px';$('target-coordinates').textContent='X '+String(Math.round((rect.left-parent.left)*sx)).padStart(3,'0')+' / Y '+String(Math.round((rect.top-parent.top)*sy)).padStart(3,'0')}
$('tracking-word').onpointermove=e=>{if(host.classList.contains('layout-editing'))return;if(e.pointerType==='touch')return;lastInteraction=performance.now();let nearest=0,distance=Infinity;[...$('tracking-word').children].forEach((b,i)=>{const r=b.getBoundingClientRect(),d=Math.abs(e.clientX-r.left-r.width/2);if(d<distance){distance=d;nearest=i}});if(nearest!==selected||aimState==='wide')track(nearest)};
$('tracking-word').onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();lastInteraction=performance.now();track(selected+(e.key==='ArrowRight'?1:-1));$('tracking-word').children[selected].focus()}};
let targetIndex=-1,hitCount=0,targetChanging=false;
function nextTarget(){
 const previous=targetIndex;targetIndex=previous<0?Math.floor(Math.random()*letters.length):(previous+1+Math.floor(Math.random()*(letters.length-1)))%letters.length;
 [...$('tracking-word').children].forEach((b,i)=>{b.classList.toggle('mission-target',i===targetIndex);b.classList.remove('target-hit');b.setAttribute('aria-label','Track '+letters[i]+(i===targetIndex?' — blinking target':''))});
 targetChanging=false;releaseAim();
}
function scoreHit(x,y){
 if(targetChanging||aimState!=='locked'||selected!==targetIndex)return;
 const rect=$('tracking-word').children[targetIndex].getBoundingClientRect(),bounds=screen.getBoundingClientRect();
 const px=bounds.left+x*bounds.width/screen.clientWidth,py=bounds.top+y*bounds.height/screen.clientHeight;
 if(px<rect.left||px>rect.right||py<rect.top||py>rect.bottom)return;
 targetChanging=true;hitCount++;
 $('hit-status').textContent='HITS / '+String(hitCount).padStart(2,'0');
 const star=document.createElementNS('http://www.w3.org/2000/svg','svg');star.setAttribute('viewBox','0 0 40 40');star.innerHTML='<path d="M20 2 25.5 13.4 38 15.2 29 24 31.1 36.5 20 30.6 8.9 36.5 11 24 2 15.2 14.5 13.4Z"/>';$('hit-stars').append(star);
 const hit=$('tracking-word').children[targetIndex];hit.classList.remove('mission-target');hit.classList.add('target-hit');
 releaseAim();setTimeout(nextTarget,350);
}
track(0,false);nextTarget();screen.addEventListener('pointerleave',releaseAim);
const casingMarkup="<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" viewBox=\"220 100 696 1610\">\n  \n  \n  <path fill=\"#baff00\" d=\"M744.18,120.8l-70.09,20.55-44.21,168.81-56.32,55.62-94,299.1-206.52,762.49,24.26,36.3-19.95,19.7-37.55,37.08,18.23,67.75,39.57,11.91-6.89-16.37-6.6-63.01,56.07-15.97,120.08,4.25,54.62,29.5,10.56-10.43-24.28-33.97,36.45-47.58L826.53,377.86l-26.55-43.31,40.67-163,3.65-24.47-100.12-26.28ZM529.21,1114.13l-28.98,112.05-11.85,76.6,20.65,53.77-56.73,120.92-113.09-4.21,9.84-81.56,53.08-96.45,62.12-49.75-26.37-71.3,64.12-183.84,43.37-128.58-16.16,252.36Z\"/>\n  <polygon fill=\"#baff00\" points=\"591.7 1562.3 610.47 1543.76 866.58 498.22 879.33 511.13 632.52 1561.39 611.25 1605.57 591.7 1562.3\"/>\n  <polygon fill=\"#baff00\" points=\"859.17 378.07 845.27 363.99 876.32 247.57 896.02 267.52 859.17 378.07\"/>\n  <path fill=\"#baff00\" d=\"M562.28,1653.93l-37.52,7.23,39.82-39.32-.46-14.9-25.38-.16-31.5,8.08-6.98-30.39-44.41-44.97-81.59-10.44-47.11,34.46,11.33,40.35,28.56,20.04-35.92,9.15,138.43,9.15,30.54-6.03,17.61-17.39,15.95,7.27-13.32,13.16-65.71,8.97,18.64,18.88-63.5,7.88,24.18,14.5,93.36-.96,60.68-15.18,12.95-41.3-38.65,21.93ZM478.04,1608.6l-27.97,17.2-64.2-12.82-27.46-20.03-3.71-24.85,42.01-12.98,41.48,6.47,36.08,30.99,3.76,16.02Z\"/>\n  <polygon fill=\"#baff00\" points=\"410.22 1602.11 449.91 1607.87 449.99 1594.63 440.67 1585.19 412.3 1578.12 410.32 1586.66 397.16 1573.33 389.39 1581.01 410.22 1602.11\"/>\n</svg>";
let shotCount=0,lastTaSlot=-1;
function shotLettering(){
 const ta=document.createElement('span');ta.className='shot-ta';ta.textContent='ТА!';ta.setAttribute('aria-hidden','true');
 const slot=(lastTaSlot+1+Math.floor(Math.random()*5))%6;lastTaSlot=slot;
 const baseSize=Math.max(58,Math.min(132,screen.clientWidth*.155));
 const size=Math.min(screen.clientWidth*.68,baseSize*3*(.65+Math.random()*.7));
 const col=slot%3,row=Math.floor(slot/3),usable=Math.max(0,screen.clientWidth-size*1.4-48);
 ta.style.fontSize=size+'px';ta.style.left=(24+usable*(col/3+Math.random()*.18))+'px';
 ta.style.top=(65+Math.max(0,screen.clientHeight-220)*(row*.45+Math.random()*.15))+'px';
 ta.style.rotate=(Math.random()*30-15)+'deg';screen.append(ta);
 const active=screen.querySelectorAll('.shot-ta');if(active.length>24)active[0].remove();
 ta.addEventListener('animationend',()=>ta.remove(),{once:true});setTimeout(()=>ta.remove(),1100);
}

function shootAt(x,y){
if(host.classList.contains('layout-editing'))return;
lastInteraction=performance.now();shotLettering();const casingFlight=.95+Math.random()*.25;shotSound(casingFlight);
x=Math.max(8,Math.min(screen.clientWidth-8,x));y=Math.max(8,Math.min(screen.clientHeight-8,y));
const mark=document.createElementNS('http://www.w3.org/2000/svg','svg');mark.classList.add('bullet-mark');mark.setAttribute('aria-hidden','true');mark.innerHTML='<use href="#hole"/>';mark.style.left=(x-32)+'px';mark.style.top=(y-32)+'px';mark.style.rotate=(Math.random()*90-45)+'deg';$('bullet-layer').append(mark);while($('bullet-layer').children.length>10)$('bullet-layer').firstChild.remove();
$('fire').classList.add('is-firing');setTimeout(()=>$('fire').classList.remove('is-firing'),130);shotCount++;$('shot-status').textContent='SHOTS / '+String(shotCount).padStart(2,'0');
if(!reduce){const shell=document.createElement('span');shell.innerHTML=casingMarkup;shell.setAttribute('aria-hidden','true');shell.className='shot-casing';const sr=screen.getBoundingClientRect(),fr=$('fire').getBoundingClientRect(),sx=screen.clientWidth/sr.width,sy=screen.clientHeight/sr.height;shell.style.left=((fr.left-sr.left+fr.width/2)*sx-17+(Math.random()-.5)*24)+'px';shell.style.top=((fr.top-sr.top+fr.height/2)*sy-40)+'px';shell.style.setProperty('--eject-x',(85+Math.random()*145)+'px');shell.style.setProperty('--eject-rise',(-70-Math.random()*100)+'px');shell.style.setProperty('--eject-drop',(90+Math.random()*80)+'px');shell.style.setProperty('--eject-spin',((Math.random()<.5?-1:1)*(340+Math.random()*380))+'deg');shell.style.animationDuration=casingFlight+'s';screen.append(shell);shell.addEventListener('animationend',()=>shell.remove(),{once:true});setTimeout(()=>shell.remove(),1600)}
scoreHit(x,y);
}
$('fire').onclick=e=>{e.stopPropagation();const b=$('tracking-word').children[selected].getBoundingClientRect(),r=screen.getBoundingClientRect();shootAt((b.left-r.left+b.width/2)*screen.clientWidth/r.width,(b.top-r.top+b.height/2)*screen.clientHeight/r.height)};
screen.addEventListener('click',e=>{if(e.target.closest('#fire'))return;const r=screen.getBoundingClientRect();shootAt((e.clientX-r.left)*screen.clientWidth/r.width,(e.clientY-r.top)*screen.clientHeight/r.height)});
const films=[{title:'КРАЙНИЙ<br>терминатор',time:'21:00',copy:'ОДИН ПРОТИВ ВСЕХ.'},{title:'полный<br>контакт',time:'23:15',copy:'РАУНД ТОЛЬКО НАЧИНАЕТСЯ.'},{title:'ТОЧКА<br>ВОЗВРАТА',time:'01:30',copy:'ОБРАТНОЙ ДОРОГИ НЕТ.'}];shadow.querySelectorAll('[data-film]').forEach(b=>b.onclick=()=>{shadow.querySelectorAll('[data-film]').forEach(n=>{n.classList.toggle('active',n===b);n.setAttribute('aria-pressed',String(n===b))});const f=films[+b.dataset.film];$('film-title').innerHTML=f.title;$('film-time').textContent=f.time;$('film-description').textContent=f.copy;const stage=shadow.querySelector('.on-air-main');stage.classList.remove('changing');void stage.offsetWidth;stage.classList.add('changing')});shadow.querySelectorAll('[data-film]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===0)));
let glyphCase='upper',glyphSet='cyr';const sets={lat:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',cyr:'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',num:'0123456789!?&%#@₽€'};function selectGlyph(c,b){const glyph=inkGlyphs[c],display=$('big-glyph');display.replaceChildren();if(glyph?.bounds){const [x0,y0,x1,y1]=glyph.bounds,pad=24;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`${x0-pad} ${-y1-pad} ${x1-x0+pad*2} ${y1-y0+pad*2}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',c);const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',glyph.path);path.setAttribute('transform','scale(1 -1)');svg.append(path);display.append(svg)}else display.textContent=c;$('glyph-code').textContent='U+'+c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0');$('glyph-grid').querySelectorAll('button').forEach(n=>{n.classList.toggle('active',n===b);n.setAttribute('aria-pressed',String(n===b))})}function drawSet(set){glyphSet=set;$('glyph-grid').replaceChildren();const characters=glyphCase==='lower'&&set!=='num'?sets[set].toLowerCase():sets[set];[...characters].forEach(c=>{const b=document.createElement('button');b.textContent=c;b.setAttribute('aria-label','Inspect '+c);b.onclick=()=>selectGlyph(c,b);$('glyph-grid').append(b)});selectGlyph(characters[0],$('glyph-grid').firstChild)}shadow.querySelectorAll('[data-set]').forEach(b=>{b.setAttribute('aria-pressed',String(b.classList.contains('active')));b.onclick=()=>{shadow.querySelectorAll('[data-set]').forEach(n=>{n.classList.toggle('active',n===b);n.setAttribute('aria-pressed',String(n===b))});drawSet(b.dataset.set)}});shadow.querySelectorAll('[data-case]').forEach(button=>button.onclick=()=>{glyphCase=button.dataset.case;shadow.querySelectorAll('[data-case]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});drawSet(glyphSet)});drawSet('cyr');
const ctx=document.createElement('canvas').getContext('2d');let initial=true;function fit(){const t=$('test-text'),range=$('size');ctx.font='100px Action';const width=Math.max(1,...t.value.split('\n').map(x=>ctx.measureText(x).width));const lines=t.value.split('\n'),descent=Math.max(0,...lines.map(line=>ctx.measureText(line).actualBoundingBoxDescent||0))/100;const heightFactor=.92+(lines.length-1)*.74+descent;const max=Math.min(420,Math.max(32,Math.floor(Math.min((t.clientWidth-16)*100/width,(t.clientHeight-12)/heightFactor))));range.max=max;if(initial)range.value=Math.min(innerWidth<769?180:320,max);else if(+range.value>max)range.value=max;t.style.fontSize=range.value+'px';$('size-value').textContent=range.value+' PX';}$('size').oninput=()=>{initial=false;fit()};$('test-text').oninput=()=>{initial=false;fit()};$('reset').onclick=()=>{$('test-text').value='ПОЛНЫЙ\nконтакт.';initial=true;fit()};$('invert').onclick=()=>{const on=shadow.querySelector('.tester-section').classList.toggle('inverted');$('invert').setAttribute('aria-pressed',String(on))};document.fonts.ready.then(()=>{positionBox();fit()});addEventListener('resize',()=>{positionBox();fit()},{signal});
})();
    /* ---- script 6: наклон постера за курсором, подгонка и анимация BANG */
    (()=>{
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduced)return;
const targets=[shadow.querySelector('.poster-frame'),shadow.querySelector('.type-space .knife-stage')].filter(Boolean);
for(const target of targets){let frame;function reset(){cancelAnimationFrame(frame);target.style.setProperty('--space-pitch','0deg');target.style.setProperty('--space-yaw','0deg')}
 target.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||host.classList.contains('layout-editing')){reset();return}cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const r=target.getBoundingClientRect(),x=Math.max(-1,Math.min(1,(e.clientX-r.left)/r.width*2-1)),y=Math.max(-1,Math.min(1,(e.clientY-r.top)/r.height*2-1));target.style.setProperty('--space-pitch',(-y*4).toFixed(2)+'deg');target.style.setProperty('--space-yaw',(x*4).toFixed(2)+'deg')})});target.addEventListener('pointerleave',reset)
}
})();
shadow.querySelectorAll('.boom-impact').forEach(row=>{
const context=document.createElement('canvas').getContext('2d');
function glyphCameraScale(viewportHeight,glyphScreenHeight){return Math.max(1,viewportHeight*.94/Math.max(1,glyphScreenHeight))}
function sizeLetters(){
 const letters=[...row.querySelectorAll('.bang-letter')];if(!letters.length)return;
 const touched=[row,...letters],saved=touched.map(el=>({el,animation:el.style.getPropertyValue('animation'),priority:el.style.getPropertyPriority('animation'),transform:el.style.getPropertyValue('transform'),transformPriority:el.style.getPropertyPriority('transform')}));
 touched.forEach(el=>{el.style.setProperty('animation','none','important');el.style.setProperty('transform','none','important')});
 letters.forEach(letter=>{const style=getComputedStyle(letter),fontSize=parseFloat(style.fontSize),r=letter.getBoundingClientRect();context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;const m=context.measureText(letter.textContent),inkHeight=(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent)||fontSize*.7,screenScale=r.height/Math.max(1,letter.offsetHeight),scale=glyphCameraScale(slideH(),inkHeight*screenScale);const ascent=m.fontBoundingBoxAscent??fontSize*.8,descent=m.fontBoundingBoxDescent??fontSize*.2,baseline=(letter.offsetHeight-ascent-descent)/2+ascent,centerX=Number.isFinite(m.actualBoundingBoxRight)?(m.actualBoundingBoxRight-m.actualBoundingBoxLeft)/2:letter.offsetWidth/2,centerY=baseline-(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2;letter.style.transformOrigin=`${centerX.toFixed(3)}px ${centerY.toFixed(3)}px`;letter.style.setProperty('--camera-scale',scale.toFixed(4));letter.style.removeProperty('--impact-x');letter.style.removeProperty('--impact-y');letter.style.removeProperty('--camera-x')});
 saved.forEach(({el,animation,priority,transform,transformPriority})=>{if(animation)el.style.setProperty('animation',animation,priority);else el.style.removeProperty('animation');if(transform)el.style.setProperty('transform',transform,transformPriority);else el.style.removeProperty('transform')});
}
let frame;function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(sizeLetters)}
document.fonts.ready.then(schedule);addEventListener('resize',schedule,{signal});new ResizeObserver(schedule).observe(row);
new MutationObserver(()=>{if(!host.classList.contains('layout-editing'))schedule()}).observe(host,{attributes:true,attributeFilter:['class']});schedule();
});

shadow.querySelectorAll('.boom-impact').forEach((row,rowIndex)=>{
 const panel=row.closest('.poster-frame');
 if(!row||!panel||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const letters=[...row.querySelectorAll('.bang-letter')];
 let played=false,animations=[],generation=0;
 const editing=()=>!live()||host.classList.contains('layout-editing');
 const play=(element,frames,options)=>{const a=element.animate(frames,{fill:'both',...options});animations.push(a);return a.finished.catch(()=>{})};
 async function run(replay=false){
  if((played&&!replay)||editing())return;played=true;
  const current=++generation;
  animations.forEach(a=>a.cancel());animations=[];
  await document.fonts.ready;
  if(rowIndex)await new Promise(resolve=>setTimeout(resolve,160));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(editing()||current!==generation)return;
  // Six adjacent phase positions form one crest; every glyph participates once.
  const step=35,travel=step*6;
  await Promise.all(letters.map((letter,i)=>{
   const peak=parseFloat(getComputedStyle(letter).getPropertyValue('--camera-scale'))||4;
   return play(letter,[
    {transform:'scale(1)',offset:0,easing:'cubic-bezier(.12,.65,.25,1)'},
    {transform:`scale(${peak})`,offset:1/6,easing:'cubic-bezier(.3,0,.6,1)'},
    {transform:'scale(1)',offset:1}
   ],{duration:travel,delay:i*step});
  }));
  if(current!==generation||editing())return;
  animations.forEach(a=>a.cancel());animations=[];
  // Project each rigid glyph onto a spherical arc, without stretching its axes.
  const width=row.offsetWidth,center=width/2,radius=width*.68;
  const sphere=letters.map(letter=>{
   const x=letter.offsetLeft+letter.offsetWidth/2-center;
   const angle=Math.asin(Math.max(-.88,Math.min(.88,x/radius)));
   const z=Math.cos(angle)*radius*.7;
   const tx=Math.sin(angle)*radius*1.12-x;
   const shape=`translate3d(${tx}px,0,${z}px) rotateY(${angle*180/Math.PI}deg)`;
   return play(letter,[
    {transform:'translate3d(0,0,0) rotateY(0deg)',offset:0,easing:'cubic-bezier(.12,.8,.2,1)'},
    {transform:shape,offset:.42,easing:'linear'},
    {transform:shape,offset:.55,easing:'cubic-bezier(.5,0,.75,1)'},
    {transform:'translate3d(0,0,-240px) rotateY(0deg)',offset:.82,easing:'cubic-bezier(.15,.7,.25,1)'},
    {transform:'translate3d(0,0,0) rotateY(0deg)',offset:1}
   ],{duration:1050});
  });
  await Promise.all(sphere);
  if(current!==generation)return;
  animations.forEach(a=>a.cancel());animations=[];
 }
 row.setAttribute('role','button');row.tabIndex=0;
 row.setAttribute('aria-label','Повторить анимацию BANG');
 row.addEventListener('click',event=>{if(!editing()){event.stopPropagation();run(true)}});
 row.addEventListener('keydown',event=>{
  if(!editing()&&(event.key==='Enter'||event.key===' ')){event.preventDefault();run(true)}
 });
 const observer=new IntersectionObserver(entries=>{
  if(entries.some(e=>e.isIntersecting&&e.intersectionRatio>=.35)&&!editing()){
   run();if(played)observer.disconnect();
  }
 },{threshold:[.35]});observer.observe(panel);
 new MutationObserver(()=>{
  if(editing()){
   generation++;animations.forEach(a=>a.cancel());animations=[];
  }
 }).observe(host,{attributes:true,attributeFilter:['class']});
});
  }
  function unmount() {
    alive = false;
    controller?.abort();
    controller = null;
    observers.forEach(o => o.disconnect());
    observers = [];
    audio?.close(); audio = null;
  }
  return { mount, unmount };
})();
