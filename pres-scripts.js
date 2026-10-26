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
/* Скрипты презентации Comedy (инлайновые скрипты макета), переведённые на контейнер: разметка и стили живут в Shadow DOM,
   поиск элементов идёт внутри него, фиксированные шапка и точки-навигация показываются только пока презентация на экране,
   слайды подгоняются под высоту окна без навигации сайта; наблюдатели, слушатели и анимации останавливаются при размонтировании. */
window.ComedyPresentation = (() => {
  let controller = null;
  let observers = [];
  let alive = false;
  let generation = 0;
  function mount(host, shadow, { scrollTo, scrollRaw, navEl } = {}) {
    unmount();
    controller = new AbortController();
    alive = true;
    const gen = ++generation;
    const live = () => alive && gen === generation;
    const { signal } = controller;
    const tracked = C => function (...a) { const o = new C(...a); observers.push(o); return o; };
    const IntersectionObserver = tracked(window.IntersectionObserver), MutationObserver = tracked(window.MutationObserver);
    const navH = () => navEl?.offsetHeight || 0;
    const slideH = () => shadow.querySelector('main>section')?.clientHeight || innerHeight;
    const scrollSlide = (el, opts = {}) => { if (!el) return; if (scrollRaw) scrollRaw(el, { offset: -navH(), ...opts }); else el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    let animateShow = null;
    const stages = [...shadow.querySelectorAll('main>section')];

    /* ---- положение контейнера: отступы для фиксированных плашек и флаг «презентация на экране» */
    function place() {
      if (!live()) return;
      const r = host.getBoundingClientRect(), nh = navH();
      host.style.setProperty('--pres-left', r.left + 'px'); host.style.setProperty('--pres-right', Math.max(0, innerWidth - r.right) + 'px');
      host.classList.toggle('pres-on', r.top <= nh + 30 && r.bottom >= nh + 90);
    }
    /* ---- «склейки» слайдов: после остановки прокрутки подтягиваем ближайший слайд, если он близко (в макете — scroll-snap) */
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

    /* ---- якоря (шапка, точки-навигация, ссылки на слайды) */
    shadow.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      e.preventDefault(); const target = shadow.getElementById(a.getAttribute('href').slice(1));
      if (target) scrollSlide(target); else if (scrollTo) scrollTo(0);
    }, { signal });

    /* ---- script 4: заголовок эфира по буквам */
    (()=>{
const title=shadow.getElementById('show'),section=shadow.getElementById('air');let animations=[];
function play(el,frames,options){const a=el.animate(frames,{fill:'both',...options});animations.push(a)}
animateShow=(mode=0)=>{
 animations.forEach(a=>a.cancel());animations=[];
 const text=title.innerText.replace(/\n+/g,'\n').trim().split('\n');title.replaceChildren();title.setAttribute('aria-label',text.join(' '));
 text.forEach((line,row)=>{const span=document.createElement('span');span.className='show-line';span.setAttribute('aria-hidden','true');title.append(span);[...line].forEach(c=>{const ch=document.createElement('i');ch.textContent=c===' '?'\u00a0':c;span.append(ch)})});
 if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const rows=[...title.children];
 rows.forEach((row,ri)=>{
 if(mode===0)[...row.children].forEach((ch,i)=>play(ch,[{translate:'0 -180px',rotate:(i%2?18:-18)+'deg',easing:'ease-in'},{translate:'0 10px',rotate:'3deg',offset:.6,easing:'ease-out'},{translate:'0 -16px',rotate:'-2deg',offset:.8},{translate:'0 0',rotate:'0deg'}],{duration:650,delay:ri*200+i*40}));
 if(mode===1){row.style.transformOrigin='12% 0';play(row,[{rotate:'-50deg',translate:'-120% 0',easing:'cubic-bezier(.15,.8,.3,1)'},{rotate:'8deg',translate:'0 0',offset:.65},{rotate:'-4deg',translate:'0 0',offset:.85},{rotate:'0deg',translate:'0 0'}],{duration:850,delay:ri*180})}
 if(mode===2){play(row,[{clipPath:'inset(0 100% -30% 0)',translate:'-40px 0'},{clipPath:'inset(-30% -10% -30% -10%)',translate:'12px 0',offset:.65},{clipPath:'none',translate:'0 0'}],{duration:700,delay:ri*220,easing:'cubic-bezier(.15,.8,.25,1)'});[...row.children].forEach((ch,i)=>play(ch,[{rotate:'0deg'},{rotate:i%2?'8deg':'-8deg',offset:.45},{rotate:'0deg'}],{duration:360,delay:220+ri*220+i*35}))}
 });
 [shadow.getElementById('time'),section.querySelector('.air-bottom .tag')].forEach((el,i)=>play(el,[{translate:i?'0 45px':'0 -100px',rotate:i?'0deg':'-18deg'},{translate:'0 -5px',rotate:i?'0deg':'4deg',offset:.7},{translate:'0 0',rotate:'0deg'}],{duration:650,delay:400+i*120,easing:'cubic-bezier(.2,.8,.3,1)'}));
};
new IntersectionObserver(es=>{if(es[0].isIntersecting){const active=section.querySelector('[data-show].active');animateShow(+(active?.dataset.show||0))}},{threshold:.6}).observe(section);
})();
    /* ---- script 1: буквы заголовков, точки-навигация, эфир, набор знаков, тестер */
    (async()=>{
const $=id=>shadow.getElementById(id),sections=[...shadow.querySelectorAll('section')];
shadow.querySelectorAll('h1>span').forEach(row=>{const word=row.textContent;row.textContent='';[...word].forEach((c,i)=>{const letter=document.createElement('i');letter.textContent=c;letter.style.setProperty('--order',i);row.append(letter)})});
sections.forEach((s,i)=>{const a=document.createElement('a');a.href='#'+s.id;a.setAttribute('aria-label','Slide '+(i+1));$('nav').append(a)});
const observer=new IntersectionObserver(es=>es.forEach(e=>{e.target.classList.toggle('inview',e.isIntersecting);if(e.isIntersecting)[...$('nav').children].forEach((a,i)=>a.classList.toggle('active',sections[i]===e.target))}),{threshold:.55});sections.forEach(s=>observer.observe(s));
$('laugh-again').onclick=()=>{const s=$('laugh');s.classList.remove('inview');void s.offsetWidth;s.classList.add('inview')};
const shows=[['21:00','Опять<br><em>соседи.</em>'],['22:30','Ну и<br><em>семейка.</em>'],['00:00','Не<br><em>спится.</em>']];shadow.querySelectorAll('[data-show]').forEach(b=>b.onclick=()=>{shadow.querySelectorAll('[data-show]').forEach(x=>x.classList.toggle('active',x===b));const [time,title]=shows[b.dataset.show];$('time').textContent=time;$('show').innerHTML=title;const p=shadow.querySelector('.programme');p.classList.remove('changing');void p.offsetWidth;p.classList.add('changing');animateShow?.(+b.dataset.show)});
const glyphs={"\u0002": {"d": "M2520 -5C2499 4 2462 11 2397 15C2391 106 2365 363 2343 430C2326 481 2236 496 2159 479C2085 462 1990 148 1921 8C1882 5 1841 3 1797 -1C1748 -4 1758 -98 1797 -95C2066 -74 2451 -101 2498 -113C2532 -122 2562 -21 2520 -5ZM294 219C359 195 580 -5 650 -14C720 -24 791 53 710 79C608 115 409 274 373 286C383 294 580 382 608 402C654 435 568 507 516 476C472 451 403 408 324 374C317 371 311 368 305 363C314 423 320 471 320 490C319 543 215 527 207 476C196 413 152 198 122 63C106 -8 242 2 254 56C258 74 270 144 283 224C286 222 290 220 294 219ZM1463 101C1463 154 1429 388 1371 388C1313 389 1243 257 1207 257C1170 257 1102 434 1041 402C988 375 952 156 944 114C934 60 1039 47 1047 80C1066 155 1070 251 1086 254C1102 257 1146 113 1199 113C1253 113 1315 241 1330 239C1345 238 1349 100 1352 84C1359 52 1462 71 1463 101ZM1875 141C1800 128 1657 143 1625 158C1615 163 1617 200 1630 200C1657 198 1807 192 1838 200C1863 206 1869 272 1837 272C1813 271 1646 266 1631 275C1624 280 1633 314 1641 320C1665 339 1917 320 1939 323C1978 329 1961 412 1907 411C1848 406 1669 419 1598 399C1579 393 1554 379 1545 337C1538 303 1525 161 1526 128C1527 96 1544 84 1559 79C1653 45 1808 54 1854 56C1896 56 1917 148 1875 141ZM4090 75C4116 26 4358 36 4377 38C4413 43 4428 121 4403 122C4347 125 4222 115 4184 129C4176 132 4176 187 4188 189C4209 194 4332 189 4359 194C4381 197 4382 263 4366 268C4342 276 4216 261 4200 272C4193 277 4202 322 4214 324C4294 345 4422 325 4438 329C4461 333 4462 404 4432 408C4422 410 4143 448 4120 384C4096 319 4071 111 4090 75ZM3358 296C3361 324 3303 337 3275 325C3216 299 3017 161 3004 174C2995 183 3036 274 3020 296C3005 315 2963 317 2942 297C2920 276 2893 131 2905 99C2917 68 2993 56 3020 71C3106 118 3235 209 3243 185C3248 174 3236 98 3233 82C3230 59 3320 54 3323 83C3326 113 3357 288 3358 296ZM3674 84C3694 67 3746 66 3750 90C3754 114 3778 306 3782 342C3787 375 3715 385 3698 361C3691 351 3682 311 3675 263C3624 262 3553 258 3506 254C3515 295 3524 330 3529 347C3536 375 3468 406 3449 368C3429 328 3394 140 3396 94C3398 45 3474 54 3476 81C3478 100 3482 125 3486 152C3538 157 3615 159 3665 154C3664 119 3666 91 3674 84ZM2842 106C2841 140 2837 259 2814 305C2806 318 2777 345 2721 301C2692 279 2569 179 2552 189C2533 200 2574 312 2581 329C2606 398 2523 384 2507 352C2489 315 2453 195 2449 117C2445 39 2512 50 2569 80C2605 98 2676 144 2730 176C2751 188 2757 99 2770 77C2784 54 2843 72 2842 106ZM915 269C932 473 640 453 632 278C623 83 900 96 915 269ZM2265 324C2278 302 2288 142 2291 19C2222 19 2135 18 2024 13C2063 108 2143 310 2170 325C2191 336 2255 340 2265 324ZM4040 202C4040 368 3806 347 3804 198C3802 33 4046 45 4040 202ZM3105 339C3141 356 3260 426 3424 466C3534 494 3477 584 3429 572C3326 544 3105 443 3072 399C3045 362 3072 322 3105 339ZM802 336C867 308 821 220 768 218C664 215 731 366 802 336ZM3916 154C3849 153 3882 245 3923 243C3988 239 3974 155 3916 154Z", "b": [120.69340811069354, -113.56640683317501, 4454.919340484622, 573.0948243170956]}, "!": {"d": "M112 239C148 208 242 207 250 250C257 293 372 675 380 740C389 800 217 819 186 774C157 732 64 281 112 239ZM271 22C276 86 228 152 155 152C103 152 36 95 31 29C25 -34 64 -92 136 -92C206 -92 266 -37 271 22Z", "b": [30.396396176348848, -92, 380.3407554814582, 798.8386348382634]}, "\"": {"d": "M22 625C33 579 95 605 110 646C125 686 152 741 160 806C169 866 64 885 40 836C20 796 10 676 22 625ZM193 625C204 579 266 605 281 646C296 686 323 741 331 806C340 866 235 885 211 836C191 796 181 676 193 625Z", "b": [16.815413458900508, 600.6191370078924, 331.5455404831999, 863.9032710645691]}, "#": {"d": "M895 495C1005 492 999 627 972 628L755 635C768 699 779 764 788 829C798 899 666 859 662 829C651 789 634 718 615 636C563 636 511 636 459 634C475 699 489 755 499 790C529 899 390 889 383 862C361 787 339 708 317 628C246 624 175 619 103 611C33 603 69 483 100 486C138 486 203 487 280 488C267 437 254 385 243 332C186 332 137 332 105 333C-4 336 2 201 29 200L214 194C201 130 191 65 182 0C172 -70 303 -30 308 0L354 192C405 191 457 192 510 193L471 39C441 -70 579 -60 587 -33L652 198C732 202 814 208 897 217C967 225 931 346 901 342C858 342 779 341 689 339C702 391 715 442 726 495C797 495 857 496 895 495ZM424 490 581 493 544 337 387 334Z", "b": [12.389211397051454, -50.82433812090527, 988.5654213731542, 879.8243381209053]}, "$": {"d": "M11 123C54 35 127 -13 203 -35C194 -61 186 -90 182 -121C173 -181 278 -200 302 -151C312 -131 319 -91 323 -50C449 -45 567 56 567 213C567 416 330 518 330 596C330 635 353 656 388 656C455 656 472 610 510 610C567 623 627 646 627 701C627 762 559 822 472 842C480 866 486 892 490 920C499 980 394 999 370 950C359 929 351 885 348 841C240 817 150 738 150 611C150 436 386 327 386 226C386 177 352 146 300 146C207 146 184 259 118 259C64 259 4 206 4 153C4 143 6 133 11 123Z", "b": [4, -178.90327106456917, 627, 977.9032710645691]}, "%": {"d": "M119 -115C180 -115 539 577 610 810C624 856 615 880 568 880C526 880 483 861 474 827C456 753 91 80 56 -34C39 -89 82 -115 119 -115ZM154 545C242 545 321 613 321 710C321 808 252 853 179 853C96 853 9 795 9 691C9 592 79 545 154 545ZM175 770C204 770 231 747 231 716C231 679 196 637 158 636C116 636 100 655 100 683C100 721 135 770 175 770ZM546 -6C634 -6 713 62 713 159C713 257 644 302 571 302C488 302 401 244 401 140C401 41 471 -6 546 -6ZM567 219C596 219 623 196 623 165C623 128 588 86 550 85C508 85 492 104 492 132C492 170 527 219 567 219Z", "b": [9, -115, 713, 880]}, "&": {"d": "M20 170C16 153 15 136 15 120C15 25 81 -35 218 -35C314 -35 397 6 465 63C497 28 527 -1 550 -24C567 -41 719 55 681 74C652 96 616 134 576 182C616 235 648 287 671 326C691 366 605 457 583 416C573 397 540 344 495 291C462 339 430 389 403 439C513 552 561 660 561 735C561 812 516 880 414 880C285 880 176 764 176 613C176 555 188 497 209 440L168 399C68 298 32 222 20 170ZM271 314C300 265 333 220 366 177C337 161 307 151 278 151C255 151 212 163 212 204C212 242 235 276 271 314ZM432 700C432 665 407 634 344 572C333 606 327 636 327 662C327 718 357 744 387 744C415 744 432 730 432 700Z", "b": [15, -35, 687.0756603884086, 880]}, "'": {"d": "M22 625C33 579 95 605 110 646C125 686 152 741 160 806C169 866 64 885 40 836C20 796 10 676 22 625Z", "b": [16.815413458900508, 600.6191370078924, 160.5455404831999, 863.9032710645691]}, "(": {"d": "M320 790C353 847 255 914 214 859C80 680 20 570 20 369C20 160 63 53 130 -160C140 -195 274 -187 250 -110C199 55 173 222 173 339C173 563 235 643 320 790Z", "b": [20, -179.8749748783371, 326.6730721650768, 879.4804319381258]}, ")": {"d": "M7 -90C-26 -147 72 -214 113 -159C247 20 307 130 307 331C307 540 264 647 197 860C187 895 53 887 77 810C128 645 154 478 154 361C154 137 92 57 7 -90Z", "b": [0.32692783492322164, -179.4804319381258, 307, 879.8749748783371]}, "*": {"d": "M204 680C195 652 187 628 184 622C152 559 313 485 328 592L332 673C356 644 379 614 385 608C425 565 552 619 490 680C480 690 422 735 384 765L493 746C556 726 598 896 478 882C542 942 483 1035 416 985L372 946L388 1002C404 1057 276 1130 267 1044L254 921C234 964 212 1018 208 1027C175 1089 22 1004 99 928L153 870C119 873 87 877 79 878C21 879 -29 749 58 752C65 752 85 754 110 757L80 741C30 714 67 572 135 626Z", "b": [11.070454740877466, 537.8384010357191, 554.4916728433714, 1083.556388071252]}, "+": {"d": "M161 378C140 377 119 376 101 377C43 378 -7 248 80 251C100 251 119 253 138 253C133 238 127 223 120 209C88 146 249 72 264 179L273 251C289 249 305 245 320 241C388 220 434 391 326 388C313 387 301 387 288 387L291 402C301 459 182 530 170 444Z", "b": [33.070454740877466, 124.8384010357191, 390.39113250078316, 484.00083412669704]}, ",": {"d": "M32 -187C-48 -267 22 -367 130 -335C265 -278 381 152 139 152C80 152 20 95 15 29C9 -34 48 -92 120 -92H121C94 -132 49 -171 32 -187Z", "b": [-2.5240412416595888, -341.12195783939825, 279.58629146760507, 152]}, "-": {"d": "M83 247C185 250 250 250 315 230C383 209 434 400 326 397C240 395 162 385 101 386C43 387 -4 244 83 247Z", "b": [35.04561202396812, 228.38664739761245, 388.4596661545272, 397.03498379945614]}, ".": {"d": "M255 22C260 86 212 152 139 152C87 152 20 95 15 29C9 -34 48 -92 120 -92C190 -92 250 -37 255 22Z", "b": [14.396396176348848, -92, 255.35676858567192, 152]}, "/": {"d": "M78 -115C139 -115 498 577 569 810C583 856 574 880 527 880C485 880 442 861 433 827C415 753 50 80 15 -34C-2 -89 41 -115 78 -115Z", "b": [11.173721147085903, -115, 575.021206486958, 880]}, "0": {"d": "M290 -51C480 -51 664 122 686 372C709 637 584 758 438 758C260 758 61 601 36 314C14 65 144 -51 290 -51ZM424 584C488 584 519 530 509 410C496 264 400 145 313 145C247 145 226 212 233 289C250 484 345 584 424 584Z", "b": [33.55761852105957, -51, 688.7435199724137, 758]}, "1": {"d": "M565 150C536 147 482 145 421 145C456 302 505 695 465 730C429 761 338 747 296 736C240 722 112 661 66 594C45 564 52 521 76 501C111 471 307 580 305 562C282 396 262 226 253 150C177 154 111 162 89 173C26 205 -40 -31 68 -31C132 -31 501 -34 537 -26C609 -11 668 172 565 150Z", "b": [10.53219336354897, -31.551020408163264, 620.4314335396125, 748.888056304687]}, "2": {"d": "M275 522C305 566 358 620 421 620C454 620 495 611 495 572C495 454 195 262 67 164C27 134 10 101 10 68C10 38 22 0 63 0C244 0 413 6 590 0C651 12 679 76 679 130C679 173 661 210 629 210C554 210 433 180 311 180C480 290 681 434 681 611C681 702 630 789 457 789C311 789 118 705 118 562C118 495 236 492 275 522Z", "b": [10, 0, 681, 789]}, "3": {"d": "M200 577C256 544 417 577 500 577C452 520 276 459 220 417C212 411 205 406 199 400C186 392 180 382 180 357C180 284 227 269 278 269C316 269 356 277 383 277C463 277 510 243 510 197C510 147 483 83 383 83C292 83 229 107 166 191C149 214 119 216 97 216C51 216 16 180 16 131C16 114 20 95 30 75C112 -32 213 -83 363 -83C560 -83 700 53 700 223C700 331 627 409 529 435C612 474 692 519 736 567C757 591 766 610 766 634C766 718 731 734 694 734C576 734 337 730 217 738C161 751 145 610 200 577Z", "b": [16, -83, 766, 738.8438967573405]}, "4": {"d": "M554 728C423 654 244 465 140 358C95 312 32 268 5 206C-20 102 71 78 122 88C220 107 308 118 386 122C376 69 369 18 368 -30C365 -115 571 -104 578 -22L590 122L633 118C732 108 778 306 704 306C671 306 641 305 613 304C631 417 657 528 701 638C706 704 669 738 626 740C606 742 582 738 554 728ZM425 291C355 284 298 277 241 277C276 316 388 421 485 504C465 433 444 361 425 291Z", "b": [0.7389198155647625, -88.82708555925231, 740.4975306722235, 740.5]}, "5": {"d": "M143 358C165 211 320 277 383 277C463 277 520 243 520 197C520 147 483 83 383 83C292 83 229 107 166 191C149 214 119 216 97 216C51 216 16 180 16 131C16 114 20 95 30 75C112 -32 213 -83 363 -83C560 -83 700 53 700 223C700 358 586 445 454 445C419 445 378 440 340 429C352 475 365 516 375 546C509 556 682 556 728 537C793 509 857 741 749 741C642 741 326 718 266 705C231 698 199 651 187 608C169 557 138 387 143 358Z", "b": [16, -83, 807.0201111070229, 741]}, "6": {"d": "M691 537C699 667 613 760 456 760C188 760 30 502 30 266C30 96 116 -51 316 -51C490 -51 644 83 644 257C644 390 537 445 426 445C376 445 291 420 242 370C256 510 374 584 436 584C479 584 506 566 512 529C519 485 566 470 606 470C650 470 691 486 691 537ZM227 235C248 267 297 290 341 292C397 293 433 266 433 216C433 157 387 120 332 120C276 120 231 172 227 235Z", "b": [30, -51, 691.5124245301508, 760]}, "7": {"d": "M157 -34C193 -65 311 -87 330 -20C399 223 585 448 638 545C644 551 648 560 649 571L652 580C653 586 651 592 649 597C642 645 606 704 567 713C507 726 191 749 84 749C-24 749 40 517 105 545C147 563 295 564 423 556C335 402 117 1 157 -34Z", "b": [25.979888892977115, -63.81056094857708, 652.2659863237109, 749]}, "8": {"d": "M294 -55C302 -55 310 -56 318 -56C502 -56 658 34 665 213C665 276 641 358 542 402C632 450 662 512 662 586C662 706 560 776 430 776C298 776 153 705 153 533C153 484 169 448 214 414C24 358 12 197 12 155C12 7 137 -49 294 -55ZM411 597C432 596 481 582 481 546C481 489 434 457 389 457C360 457 325 479 325 518C325 576 385 597 411 597ZM358 299C429 297 459 266 459 221C459 148 383 119 331 119C273 119 211 136 211 195C211 244 262 299 358 299Z", "b": [12, -56, 665, 776]}, "9": {"d": "M21 172C13 42 99 -51 256 -51C524 -51 682 207 682 443C682 613 596 760 396 760C222 760 68 626 68 452C68 319 175 264 286 264C336 264 421 289 470 339C456 199 338 125 276 125C233 125 206 143 200 180C193 224 146 239 106 239C62 239 21 223 21 172ZM485 474C464 442 415 419 371 417C315 416 279 443 279 493C279 552 325 589 380 589C436 589 481 537 485 474Z", "b": [20.487575469849133, -51, 682, 760]}, ":": {"d": "M255 22C260 86 212 152 139 152C87 152 20 95 15 29C9 -34 48 -92 120 -92C190 -92 250 -37 255 22ZM55 426C50 362 98 296 171 296C223 296 290 353 295 419C301 482 262 540 190 540C120 540 60 485 55 426Z", "b": [14.396396176348848, -92, 295.60360382365116, 540]}, ";": {"d": "M55 426C50 362 98 296 171 296C223 296 290 353 295 419C301 482 262 540 190 540C120 540 60 485 55 426ZM32 -187C-48 -267 22 -367 130 -335C265 -278 381 152 139 152C80 152 20 95 15 29C9 -34 48 -92 120 -92H121C94 -132 49 -171 32 -187Z", "b": [-2.5240412416595888, -341.12195783939825, 295.60360382365116, 540]}, "<": {"d": "M80 457C-4 378 3 329 80 249C127 200 166 143 197 107C268 25 380 195 316 225C282 241 223 293 167 353C223 412 282 464 316 481C380 511 268 681 197 599C166 563 129 503 80 457Z", "b": [19.59649430255311, 84.86222491043705, 335.0455420842866, 621.1377750895629]}, "=": {"d": "M80 310C182 313 255 320 320 300C388 279 434 450 326 447C240 445 162 435 101 436C43 437 -7 307 80 310ZM80 130C182 133 255 140 320 120C388 99 434 270 326 267C240 265 162 255 101 256C43 257 -7 127 80 130Z", "b": [33.070454740877466, 118.21224570642073, 390.39113250078316, 447.03903083214414]}, ">": {"d": "M283 457C234 503 197 563 166 599C95 681 -17 511 47 481C81 464 140 412 196 353C140 293 81 241 47 225C-17 195 95 25 166 107C197 143 236 200 283 249C360 329 367 378 283 457Z", "b": [27.95445791571342, 84.86222491043708, 343.40350569744686, 621.137775089563]}, "?": {"d": "M275 522C305 566 358 620 421 620C454 620 495 611 495 572C495 486 177 492 177 289C177 224 355 219 375 300C403 412 680 386 681 611C681 702 630 789 457 789C311 789 118 705 118 562C118 495 236 492 275 522ZM374 79C379 143 333 194 260 194C209 194 139 152 134 86C128 23 167 -35 239 -35C309 -35 369 19 374 79Z", "b": [118, -35, 681, 789]}, "@": {"d": "M690 78C707 63 736 55 763 55C959 55 1159 169 1159 419C1159 749 910 914 641 914C337 914 20 704 20 323C20 -40 278 -210 548 -210C584 -210 619 -210 655 -201C702 -189 660 -46 607 -46C588 -46 568 -50 547 -50C288 -50 185 101 185 276C185 609 400 780 654 780C830 780 1001 637 1001 447C1001 299 949 197 843 197C861 325 887 523 887 554C887 587 841 607 798 607C747 607 731 600 713 519C675 578 614 606 550 606C423 606 291 508 291 331C291 170 397 96 508 96C570 96 628 121 672 165C673 121 678 88 690 78ZM596 460C642 460 685 426 685 369C685 307 637 238 550 238C497 238 471 273 471 323C471 402 531 460 596 460Z", "b": [20, -210, 1159, 914]}, "A": {"d": "M808 50C749 151 675 631 638 720C624 813 548 841 478 825C322 793 107 280 -73 10C-90 -15 -148 -109 -21 -109C69 -109 99 -70 159 40C164 48 179 73 198 110C370 114 484 113 563 105C576 62 591 24 609 -7C643 -66 693 -97 727 -97C822 -97 852 -61 852 -24C852 4 837 0 808 50ZM516 323C464 319 396 313 300 308C345 394 393 484 430 549C447 587 474 569 477 553C491 482 503 402 516 323Z", "b": [-101.0231881233795, -109, 852, 829.2449823838749]}, "B": {"d": "M35 210C35 70 112 -20 314 -20C564 -20 705 100 705 292C705 410 598 466 508 470C582 496 639 590 639 660C639 745 581 811 431 811C314 811 201 792 125 650C107 616 35 432 35 210ZM318 173C245 173 211 190 222 268L232 330C281 344 327 350 360 350C437 350 478 328 478 275C478 218 439 173 318 173ZM443 598C443 527 345 510 272 510L285 574C294 619 333 640 378 640C422 640 443 627 443 598Z", "b": [35, -20, 705, 811]}, "C": {"d": "M761 162C785 226 685 296 614 226C560 172 530 141 427 141C282 141 221 268 221 381C221 524 314 610 443 610C502 610 570 600 615 545C693 429 843 567 800 634C710 775 584 820 441 820C213 820 20 663 20 378C20 108 214 -20 416 -20C605 -20 723 70 761 162Z", "b": [20, -20, 807.6014655821718, 820]}, "D": {"d": "M830 480C830 750 539 838 195 838C160 838 123 829 108 798C72 725 32 131 36 47C38 6 108 -8 185 -11C520 -22 830 156 830 480ZM266 653C391 653 596 630 596 469C596 272 390 175 213 169C220 248 251 514 266 653Z", "b": [35.722588362708336, -11.481223698287412, 830, 838]}, "E": {"d": "M854 151C678 121 345 155 270 190C246 202 249 289 281 288C343 283 695 270 767 288C825 303 840 455 765 455C708 454 318 441 284 464C268 475 287 554 306 569C362 614 840 583 890 590C982 603 942 798 817 796C677 784 371 801 206 753C162 740 102 708 82 610C64 529 35 197 36 121C38 45 80 17 114 5C335 -73 696 -53 804 -47C903 -47 953 166 854 151Z", "b": [35.974806866632505, -53.76480817627092, 940.2920159674126, 796.0152783655348]}, "F": {"d": "M36 70C37 -14 186 -6 231 20C255 34 254 261 286 260C348 255 583 234 655 252C713 267 728 419 653 419C596 418 323 413 289 436C273 447 293 554 312 569C368 614 716 573 766 580C858 593 818 788 693 786C553 774 377 801 212 753C168 740 108 708 88 610C70 529 35 146 36 70Z", "b": [35.97902244669475, 2.1750912478312046, 816.2920159674126, 786.0152783655348]}, "G": {"d": "M826 218C879 223 949 426 851 426C735 426 580 415 470 411C384 411 366 219 436 219C493 222 565 218 638 216C590 168 557 141 461 141C316 141 225 277 225 390C225 533 348 610 477 610C536 610 604 600 649 545C727 429 877 567 834 634C744 775 618 820 475 820C247 820 24 672 24 387C24 117 248 -20 450 -20C637 -20 768 69 819 217C821 217 823 218 826 218Z", "b": [24, -20, 900.1606184526302, 820]}, "H": {"d": "M630 20C666 -11 782 -3 790 40C797 83 862 695 870 760C879 820 732 824 694 785C684 774 662 655 644 514C528 510 373 503 263 499C285 639 307 763 317 797C330 847 188 877 154 808C118 735 32 131 36 47C40 -41 190 -60 200 50C204 94 215 180 229 278C339 284 503 284 619 277C609 147 609 38 630 20Z", "b": [35.865089049168645, -25.870721916137114, 870.396029765136, 848.4027253941471]}, "I": {"d": "M10 30C5 -18 190 -50 200 20C206 63 298 695 306 760C315 820 103 840 100 785C87 532 44 350 10 30Z", "b": [9.900468135344603, -20.5961194658412, 306.27862941455527, 817.2444304016884]}, "J": {"d": "M476 294C464 216 389 184 320 184C210 184 196 255 196 367C196 407 15 407 15 364C-25 131 46 -34 306 -34C496 -34 620 58 646 224C678 421 727 762 744 835C753 928 529 907 520 840Z", "b": [4.606913796958985, -34, 744.2640503513983, 897.6489540824391]}, "K": {"d": "M342 342C461 299 864 -66 991 -83C1119 -100 1247 39 1101 87C915 152 551 443 487 464C504 479 863 639 915 675C998 735 842 867 746 811C666 764 540 686 397 625C384 619 373 613 362 605C378 713 389 802 389 835C388 933 198 903 183 810C164 695 83 304 29 58C0 -71 248 -54 269 45C276 78 299 206 322 351C328 347 335 344 342 342Z", "b": [26.644913030026274, -84.43221248031975, 1165.9724483003927, 895.5863833508118]}, "L": {"d": "M230 230C254 383 356 832 311 871C275 902 181 903 173 860C167 822 61 312 33 159C17 70 70 8 107 0C167 -13 480 -4 587 -4C695 -4 639 268 574 240C529 221 363 220 230 230Z", "b": [30.068280931752355, -7.034339229968781, 647.8188989886647, 893.3772342566953]}, "M": {"d": "M1018 -10C1024 86 1043 750 938 750C832 751 617 420 551 420C484 420 373 835 259 778C160 728 51 99 33 22C9 -75 179 -89 197 -30C239 107 269 405 299 410C328 416 437 186 534 186C632 186 823 403 849 400C876 398 832 -10 836 -40C845 -98 1014 -65 1018 -10Z", "b": [30.683673850121043, -70.50148599514907, 1023.266432000117, 783.3766709161139]}, "N": {"d": "M876 721C892 782 730 836 708 793C689 756 659 272 620 286C574 302 460 611 374 729C317 832 187 907 146 770C105 633 42 122 34 48C27 -34 222 -98 221 35C220 68 230 512 266 498C313 480 493 85 533 14C577 -97 735 -72 746 20C756 103 861 661 876 721Z", "b": [33.8159441146226, -59.56504500316859, 877.1094137269746, 844.4698420198044]}, "O": {"d": "M456 -71C724 -71 962 133 962 428C962 722 755 857 533 857C282 857 20 684 20 369C20 69 233 -71 456 -71ZM534 683C652 683 767 587 767 459C767 303 657 125 462 125C289 125 219 227 219 344C219 568 364 683 534 683Z", "b": [20, -71, 962, 857]}, "P": {"d": "M42 -17C87 -59 203 -61 213 -2C216 17 236 152 257 302C344 306 433 314 480 320C704 345 780 493 780 630C780 884 444 902 205 854C164 845 128 787 122 739C83 595 -1 21 42 -17ZM313 692 400 700C530 710 560 659 560 610C560 539 498 484 282 472Z", "b": [30.057165648617698, -47.532575618601655, 780, 875.0996972994726]}, "Q": {"d": "M456 -71C518 -71 579 -60 636 -39C692 -119 764 -199 874 -285C953 -347 1038 -273 1060 -185C1067 -159 938 -122 789 50C894 138 962 270 962 428C962 722 755 857 533 857C282 857 20 684 20 369C20 69 233 -71 456 -71ZM534 683C652 683 767 587 767 459C767 303 657 125 462 125C289 125 219 227 219 344C219 568 364 683 534 683Z", "b": [20, -307.9250783191053, 1060.2722310481633, 857]}, "R": {"d": "M47 -17C92 -59 208 -61 218 -2C221 17 241 152 262 302C349 306 438 314 485 320C709 345 785 493 785 630C785 884 449 902 210 854C169 845 133 787 127 739C88 595 4 21 47 -17ZM318 692 405 700C535 710 565 659 565 610C565 539 503 484 287 472Z", "b": [35.0571656486177, -47.532575618601655, 785, 875.0996972994726]}, "S": {"d": "M-10 123C54 -7 185 -50 292 -50C422 -50 546 52 546 213C546 416 309 518 309 596C309 635 332 656 367 656C434 656 451 610 489 610C546 623 606 646 606 701C606 776 505 849 390 849C257 846 129 762 129 611C129 436 365 327 365 226C365 177 331 146 279 146C186 146 163 259 97 259C43 259 -17 206 -17 153C-17 143 -15 133 -10 123Z", "b": [-17, -50, 606, 849]}, "T": {"d": "M72 698C118 708 305 713 501 712C462 534 396 22 437 -13C473 -44 567 -45 575 -2C581 37 651 574 669 710C843 707 995 699 1022 688C1087 660 1151 892 1043 892C936 892 160 887 100 874C28 859 -31 676 72 698Z", "b": [16.56856646038746, -35.37723425669522, 1101.0201111070228, 892]}, "U": {"d": "M601 379C588 296 515 211 422 211C220 211 207 313 226 402L283 776C296 826 154 856 120 787C98 742 65 555 45 399C5 166 90 1 391 1C623 1 735 143 761 309C786 464 823 682 836 739C848 791 665 802 660 764Z", "b": [35.74351780628988, 1, 836.5652218422878, 827.4027253941471]}, "V": {"d": "M411 255C410 258 356 643 279 815C251 877 195 905 161 905C66 905 20 863 20 826C20 798 40 762 79 719C129 691 178 168 215 79C229 -3 276 -26 334 -26C358 -26 384 -23 410 -17C566 15 781 528 961 798C978 823 1036 917 909 917C819 917 789 878 729 768C711 739 552 426 458 259C438 224 416 226 411 255Z", "b": [20, -26, 989.0231881233794, 917]}, "W": {"d": "M839 242C839 247 845 391 845 543C845 663 841 787 827 852C802 858 778 860 756 860C696 860 644 842 607 814C560 724 358 308 319 238C309 220 298 212 289 212C281 212 274 220 272 234C272 233 291 573 291 743C287 880 169 891 132 891C70 891 51 859 51 819C51 776 73 758 73 655C73 546 61 360 61 222C61 -10 112 -48 234 -48C272 -48 313 -46 339 -21C467 102 586 375 657 572C657 489 640 213 640 107C640 -9 697 -39 762 -39C786 -39 812 -36 838 -30C994 2 1209 514 1389 785C1398 798 1417 828 1417 855C1417 881 1399 904 1337 904C1181 904 1203 810 886 246C876 228 865 220 856 220C848 220 841 228 839 242Z", "b": [51, -48, 1417, 904]}, "X": {"d": "M744 20C828 -35 922 -18 944 70C955 110 766 241 619 392C777 520 916 643 940 710C958 762 776 833 690 707C672 680 623 617 512 519C425 642 392 751 385 780C353 906 159 806 161 756C164 719 243 564 365 400C163 252 -54 152 -60 110C-75 22 44 -88 130 0C182 53 320 159 468 274C577 153 696 51 744 20Z", "b": [-61.290257613015164, -32.352361243288584, 944.4589127935485, 841.0935908835593]}, "Y": {"d": "M401 490C373 551 302 652 258 780C216 903 32 806 34 756C36 725 188 446 311 310C298 206 274 24 294 0C348 -71 494 0 484 50L474 310C583 460 681 561 771 700C827 795 634 895 589 830Z", "b": [33.98381962942881, -29.962782168311875, 781.1035238899312, 850.7544806273193]}, "Z": {"d": "M81 665C81 591 187 562 270 590C308 603 573 641 710 640C514 506 122 264 64 204C43 185 36 154 36 121C38 45 78 6 114 5C340 -4 696 -3 804 3C903 3 949 245 850 230C721 208 465 200 311 182C489 314 793 528 896 591C960 640 924 797 817 796C676 795 350 810 171 793C125 789 81 770 81 665Z", "b": [36, -1.6312733432209177, 927.7433041102216, 801.1595648100573]}, "[": {"d": "M346 793C394 799 363 888 320 891C308 891 237 894 177 892C144 898 108 889 104 862C65 600 30 221 25 -83C25 -100 44 -112 62 -113C120 -115 190 -110 213 -107C261 -101 285 -5 242 -2C233 -2 187 0 150 0C166 140 215 654 230 790C287 798 316 788 346 793Z", "b": [25, -113.45927642586989, 370.2512809088884, 893.7766924784744]}, "]": {"d": "M50 -13C2 -19 33 -108 76 -111C88 -111 159 -114 219 -112C252 -118 288 -109 292 -82C331 180 366 559 371 863C371 880 352 892 334 893C276 895 206 890 183 887C135 881 111 785 154 782C163 782 209 780 246 780C230 640 181 126 166 -10C109 -18 80 -8 50 -13Z", "b": [25.748719091111603, -113.77669247847436, 371, 893.4592764258699]}, "_": {"d": "M48 -153C150 -130 601 -132 666 -160C731 -188 785 7 677 7C570 7 127 -15 66 -14C8 -13 -39 -156 48 -153Z", "b": [0.045612023968118365, -162.75057805453173, 738.5526842176613, 7]}, "a": {"d": "M419 35C436 20 465 12 492 12C524 12 553 23 557 46C564 89 616 467 616 511C616 544 570 564 527 564C476 564 460 557 442 476C404 535 343 563 279 563C152 563 20 465 20 288C20 127 126 53 237 53C299 53 357 78 401 122C402 78 407 45 419 35ZM325 417C371 417 414 383 414 326C414 264 366 195 279 195C226 195 200 230 200 280C200 359 260 417 325 417Z", "b": [20, 12, 616, 564]}, "b": {"d": "M30 47C18 -22 175 -42 190 27L200 92C230 37 296 -3 389 -3C506 -3 650 103 650 287C650 474 526 550 419 550C369 550 317 534 273 504L330 847C339 907 193 933 176 881C168 856 59 228 30 47ZM341 167C278 167 240 199 240 242C242 328 307 372 362 372C434 372 456 323 456 280C456 225 413 168 341 167Z", "b": [29.34629926069056, -15.822196561353003, 650, 908.9152527092751]}, "c": {"d": "M595 147C627 217 494 270 447 211C424 181 395 172 344 172C243 172 200 246 200 311C200 428 297 449 340 449C390 449 430 429 465 391C514 325 664 411 616 496C560 596 453 639 360 639C200 639 40 522 40 309C40 106 185 11 336 11C478 11 565 78 595 147Z", "b": [40, 11, 625.3500026722602, 639]}, "d": {"d": "M651 925C615 956 521 957 513 914L454 484C410 537 347 563 281 563C164 563 20 457 20 273C20 86 144 10 251 10C301 10 353 26 396 56C387 -4 549 -33 550 22C551 66 685 896 651 925ZM329 393C392 393 430 361 430 318C428 232 363 188 308 188C236 188 214 237 214 280C214 335 257 392 329 393Z", "b": [20, -7.235915697758159, 656.5248227735766, 947.3772342566953]}, "e": {"d": "M324 169C264 167 211 189 202 257C252 253 334 254 362 258C506 279 553 330 550 407C546 512 433 586 295 581C158 575 8 480 16 275C23 85 200 12 336 17C417 20 520 70 517 141C515 185 465 214 430 212C400 211 395 172 324 169ZM300 442C326 443 373 437 373 402C373 357 318 347 207 347C216 400 246 440 300 442Z", "b": [15.693369271774884, 16.76088429931025, 550.1337571065121, 581.2388853180304]}, "f": {"d": "M62 340C82 344 107 348 135 350C115 231 104 120 92 43C80 -36 223 -26 230 10C246 89 255 203 286 350C358 346 423 336 454 323C519 295 573 530 465 530C430 530 383 528 334 527C370 618 417 635 450 634C530 630 534 707 524 755C518 785 498 810 465 810C336 810 220 711 175 540C173 533 171 527 170 521C131 519 98 518 80 519C22 520 -25 337 62 340Z", "b": [14.045612023968118, -17.064467504442575, 527.9259221596066, 810]}, "g": {"d": "M338 410C401 410 439 378 439 335C437 249 372 205 317 205C245 205 223 254 223 297C223 352 266 409 338 410ZM649 530C661 599 504 619 489 550L479 485C449 540 383 580 290 580C173 580 29 474 29 290C29 103 153 27 260 27C310 27 362 43 406 73C408 14 398 -14 395 -22C359 -111 252 -101 110 -85C39 -77 15 -121 15 -170C15 -260 76 -297 109 -300C355 -320 523 -236 575 80Z", "b": [15, -302.77987185083754, 649.6537007393094, 592.822196561353]}, "h": {"d": "M130 27C161 27 193 41 195 75C197 119 206 192 218 276C273 322 318 341 368 341C519 341 395 94 419 56C447 11 580 21 589 95C596 152 602 202 606 247C622 436 582 521 466 521C405 521 314 492 239 412C266 576 301 749 331 827C359 901 188 894 173 860C142 789 26 264 26 123C26 52 81 27 130 27Z", "b": [26, 27, 609.3723861270396, 884.5991436962635]}, "i": {"d": "M121 4C72 1 35 24 31 95C24 236 73 426 100 498C113 533 269 547 250 470C214 323 206 208 194 52C192 18 151 6 121 4ZM311 707C315 758 276 810 218 810C177 810 124 765 120 712C115 662 146 616 203 616C259 616 307 660 311 707Z", "b": [30.323343085471883, 3.7444616022134958, 311.2815329256836, 810]}, "j": {"d": "M-157 -253C-168 -206 -149 -173 -82 -149C-46 -137 9 -103 42 39C90 246 84 448 105 502C119 536 290 551 264 476C228 369 226 159 184 -26C146 -198 33 -301 -96 -306C-129 -307 -149 -283 -157 -253ZM317 707C321 758 282 810 224 810C183 810 130 765 126 712C121 662 152 616 209 616C265 616 313 660 317 707Z", "b": [-159.92234068280763, -306.03015375961496, 317.2815329256836, 810]}, "k": {"d": "M203 40C209 71 221 145 233 230C327 139 471 -42 556 -40C638 -38 690 51 602 109C472 203 421 251 338 340C352 354 612 483 658 516C735 572 617 671 528 619C456 576 389 515 262 466C267 515 339 818 330 840C315 876 177 869 170 811C156 695 92 312 33 67C7 -40 187 -36 203 40Z", "b": [30.436906274467653, -40.01643826328501, 682.912682404442, 862.0496620055166]}, "l": {"d": "M114 6C145 6 197 20 199 54C208 202 262 678 306 821C329 897 163 888 148 854C117 783 30 243 30 102C30 31 65 6 114 6Z", "b": [30, 6, 308.18287756626484, 879.251108478242]}, "m": {"d": "M114 39C145 39 177 53 179 87C183 161 190 230 202 297C244 332 291 358 331 358C482 358 358 111 382 73C409 28 544 38 552 112C559 169 565 219 569 264C570 279 571 292 571 306C606 331 643 348 676 348C827 348 703 101 727 63C754 18 889 28 897 102C904 159 910 209 914 254C930 443 895 528 757 528C714 528 643 507 562 435C544 505 497 538 412 538C374 538 315 522 246 469L258 501C286 575 135 568 120 534C89 463 30 276 30 135C30 64 65 39 114 39Z", "b": [30, 35.97352170786323, 917.5848209303889, 558.5991436962635]}, "n": {"d": "M105 42C136 42 167 56 170 90C177 159 184 221 196 282C253 323 321 357 378 357C528 357 405 110 429 72C456 27 590 37 599 111C606 168 612 218 616 263C632 452 608 537 459 537C404 537 328 517 239 448L258 502C286 576 120 569 105 535C74 464 45 285 21 138C10 68 56 42 105 42Z", "b": [19.355714981320148, 42, 620.2744389822637, 559.5991436962635]}, "o": {"d": "M260 47C407 47 538 159 538 321C538 483 424 557 302 557C164 557 20 462 20 289C20 124 137 47 260 47ZM296 419C343 419 389 381 389 330C389 268 331 199 268 197C198 197 171 229 171 275C171 339 229 419 296 419Z", "b": [20, 47, 538, 557]}, "p": {"d": "M23 -316C59 -347 153 -348 161 -305L216 92C260 39 323 13 389 13C506 13 650 119 650 303C650 490 526 566 419 566C369 566 317 550 273 520L278 553C287 613 155 632 124 587C95 545 -25 -274 23 -316ZM341 183C278 183 240 215 240 258C242 344 307 388 362 388C434 388 456 339 456 296C456 241 413 184 341 183Z", "b": [11.797035865435546, -338.3772342566952, 650, 611.8386348382634]}, "q": {"d": "M649 530C661 599 504 619 489 550L479 485C449 540 383 580 290 580C173 580 29 474 29 290C29 103 153 27 260 27C310 27 362 43 406 73L349 -270C340 -330 486 -356 503 -304C511 -279 620 349 649 530ZM338 410C401 410 439 378 439 335C437 249 372 205 317 205C245 205 223 254 223 297C223 352 266 409 338 410Z", "b": [29, -331.91525270927514, 649.6537007393094, 592.822196561353]}, "r": {"d": "M329 337C335 335 342 334 349 334C410 334 486 398 486 458C486 527 446 558 386 558C354 558 304 541 258 496L269 526C271 532 272 538 272 543C272 572 238 583 202 583C170 583 117 575 111 560C80 489 51 250 32 108C23 38 67 12 116 12C147 12 176 26 181 60C193 148 202 245 219 338C242 366 263 378 283 378C308 378 320 362 329 337Z", "b": [30.8225559593658, 12, 486, 583]}, "s": {"d": "M326 670C196 670 93 603 93 492C93 368 204 300 204 199C204 137 164 115 114 115C77 115 48 125 23 125C-16 125 -33 68 -33 20C-33 -59 10 -73 122 -73C250 -73 353 39 353 151C353 290 253 366 253 450C253 478 275 498 294 498C326 498 352 482 379 482C416 482 428 529 428 565C428 619 405 670 326 670Z", "b": [-33, -73, 428, 670]}, "t": {"d": "M82 377C91 378 109 380 130 381C117 330 104 277 95 229C55 30 185 2 230 2C302 2 325 16 335 64C342 94 335 128 302 137C264 148 236 156 250 229C259 283 270 336 282 386C339 385 392 380 414 370C478 339 527 548 419 548C404 548 368 546 325 542L345 604C373 678 222 671 207 637C199 619 186 579 171 529C138 525 112 522 105 520C33 505 -9 363 82 377Z", "b": [30.03844951898165, 2, 482.526650435018, 661.5991436962635]}, "u": {"d": "M578 526C556 526 504 519 492 505C422 415 320 210 235 210C205 210 191 220 199 263C213 336 279 468 265 490C237 535 101 528 85 455C70 386 41 313 35 242C26 127 54 32 197 32C310 32 366 102 457 257C440 170 434 160 405 64C382 -12 557 -3 572 31C603 102 645 290 662 430C671 500 627 526 578 526Z", "b": [33.47680238799831, 5.748891521757955, 663.1774440406342, 526]}, "v": {"d": "M109 87C115 35 145 15 201 15C254 15 313 39 349 95C416 194 502 336 580 454C625 524 601 554 544 552C503 551 466 539 430 475C351 336 300 242 260 185C250 273 225 433 192 513C152 610 29 502 20 483C21 443 96 198 109 87Z", "b": [20, 15, 603.4524187750843, 552.8893609861913]}, "w": {"d": "M512 87C530 38 548 15 604 15C657 15 716 39 752 95C821 202 823 314 904 442C949 512 925 540 868 540C827 539 787 525 770 475C716 318 676 246 650 175C624 259 585 400 570 505C564 549 434 585 398 508L240 175C226 265 204 419 190 508C178 587 6 525 8 483C10 440 82 198 95 87C101 35 131 15 187 15C240 15 280 46 320 100C379 180 404 245 439 325C466 262 494 135 512 87Z", "b": [7.982694688870083, 15, 927.4524187750843, 553.0035936896483]}, "x": {"d": "M61 509C119 435 168 365 218 299C154 240 90 178 17 96C-50 -15 50 -106 135 -7C179 63 239 127 303 192C363 120 430 51 515 -17C593 -36 651 44 626 115C556 197 517 194 450 283C442 292 435 302 428 312C478 356 530 398 585 443C700 537 615 663 564 637C484 548 417 482 353 422C306 492 261 561 197 625C116 706 10 611 61 509Z", "b": [-4.941715314720355, -49.39048582536043, 642.3689469955945, 655.4621960788672]}, "y": {"d": "M89 -326C22 -389 40 -494 165 -478C243 -468 301 -383 404 -134C481 53 590 276 711 538C743 608 714 638 657 638C617 638 576 632 545 571C468 415 393 207 361 137C324 258 307 468 242 581C162 721 33 591 41 546C52 494 224 111 276 -31C244 -110 171 -248 89 -326Z", "b": [40.64486221188454, -479.63734559535385, 724.2598627379903, 644.149672225683]}, "z": {"d": "M95 362C149 362 342 410 342 380C342 340 109 242 75 220C-4 168 12 32 120 32C227 32 471 36 535 36C570 36 600 198 510 198C453 198 247 157 247 191C247 237 505 254 580 374C621 446 605 539 520 539C413 539 169 537 99 541C44 544 22 362 95 362Z", "b": [25.511149285336543, 32, 601.5896780276943, 541.0366845102421]}, "«": {"d": "M91 457C7 378 14 329 91 249C138 200 177 143 208 107C279 25 391 195 327 225C293 241 234 293 178 353C234 412 293 464 327 481C391 511 279 681 208 599C177 563 140 503 91 457ZM364 457C280 378 287 329 364 249C411 200 450 143 481 107C552 25 664 195 600 225C566 241 507 293 451 353C507 412 566 464 600 481C664 511 552 681 481 599C450 563 413 503 364 457Z", "b": [30.59649430255311, 84.86222491043705, 619.0455420842866, 621.1377750895629]}, "»": {"d": "M275 457C226 503 189 563 158 599C87 681 -25 511 39 481C73 464 132 412 188 353C132 293 73 241 39 225C-25 195 87 25 158 107C189 143 228 200 275 249C352 329 359 378 275 457ZM548 457C499 503 462 563 431 599C360 681 248 511 312 481C346 464 405 412 461 353C405 293 346 241 312 225C248 195 360 25 431 107C462 143 501 200 548 249C625 329 632 378 548 457Z", "b": [19.95445791571342, 84.86222491043708, 608.4035056974469, 621.137775089563]}, "Ё": {"d": "M854 151C953 166 903 -47 804 -47C696 -53 335 -73 114 5C80 17 38 45 36 121C35 197 64 529 82 610C102 708 162 740 206 753C371 801 677 784 817 796C942 798 982 603 890 590C840 583 362 614 306 569C287 554 268 475 284 464C318 441 708 454 765 455C840 455 825 303 767 288C695 270 343 283 281 288C249 289 246 202 270 190C345 155 678 121 854 151ZM458 933C462 984 423 1036 365 1036C324 1036 271 991 267 938C262 888 293 842 350 842C406 842 454 886 458 933ZM539 945C535 894 574 842 632 842C673 842 726 887 730 940C735 990 704 1036 647 1036C591 1036 543 992 539 945Z", "b": [35.9748068666325, -53.76480817627092, 940.2920159674126, 1036]}, "А": {"d": "M860 50C801 151 727 631 690 720C676 813 600 841 530 825C374 793 159 280 -21 10C-38 -15 -96 -109 31 -109C121 -109 151 -70 211 40C216 48 231 73 250 110C422 114 536 113 615 105C628 62 643 24 661 -7C695 -66 745 -97 779 -97C874 -97 904 -61 904 -24C904 4 889 0 860 50ZM568 323C516 319 448 313 352 308C397 394 445 484 482 549C499 587 526 569 529 553C543 482 555 402 568 323Z", "b": [-49.02318812337949, -109, 904, 829.2449823838749]}, "Б": {"d": "M69 -13C122 -42 196 -36 258 -36C446 -36 738 61 738 312C738 418 660 519 496 519C420 519 362 516 280 499L308 696C445 709 644 711 694 690C759 662 823 894 715 894C608 894 292 871 232 858C195 850 162 799 152 754C148 650 60 250 35 57C31 24 45 -5 69 -13ZM336 143C332 143 284 146 229 150L251 296C304 302 349 305 387 305C468 305 512 291 512 257C512 209 477 143 336 143Z", "b": [34.321931647955054, -36.51397977394408, 773.0201111070229, 894]}, "В": {"d": "M35 210C35 70 112 -20 314 -20C564 -20 705 100 705 292C705 410 598 466 508 470C582 496 639 590 639 660C639 745 581 811 431 811C314 811 201 792 125 650C107 616 35 432 35 210ZM318 173C245 173 211 190 222 268L232 330C281 344 327 350 360 350C437 350 478 328 478 275C478 218 439 173 318 173ZM443 598C443 527 345 510 272 510L285 574C294 619 333 640 378 640C422 640 443 627 443 598Z", "b": [35, -20, 705, 811]}, "Г": {"d": "M47 -13C83 -44 177 -45 185 -2C191 36 297 546 325 699C458 709 627 709 672 690C737 662 801 894 693 894C586 894 270 871 210 858C173 850 140 799 130 754C93 630 2 26 47 -13Z", "b": [34.77534931515328, -35.37723425669522, 751.0201111070229, 894]}, "Д": {"d": "M1247 44C1213 58 1168 71 1089 81C1077 256 1031 707 991 827C960 919 796 947 656 916C524 886 356 337 232 73L46 62C-43 56 -15 -155 56 -150C546 -112 1122 -131 1207 -153C1269 -169 1323 14 1247 44ZM850 634C873 595 891 315 896 93C781 95 626 93 417 83C491 263 629 609 677 635C714 656 832 663 850 634Z", "b": [-9.83120916229916, -153.98900776922164, 1284.2557759841604, 928.1269240298674]}, "Е": {"d": "M854 151C678 121 345 155 270 190C246 202 249 289 281 288C343 283 695 270 767 288C825 303 840 455 765 455C708 454 318 441 284 464C268 475 287 554 306 569C362 614 840 583 890 590C982 603 942 798 817 796C677 784 371 801 206 753C162 740 102 708 82 610C64 529 35 197 36 121C38 45 80 17 114 5C335 -73 696 -53 804 -47C903 -47 953 166 854 151Z", "b": [35.974806866632505, -53.76480817627092, 940.2920159674126, 796.0152783655348]}, "Ж": {"d": "M668 580C597 636 424 860 298 860C169 860 95 773 225 707C348 646 488 520 530 478C516 457 62 77 19 26C-64 -34 92 -166 188 -110C250 -41 512 224 620 317L635 330L568 16C539 -113 787 -96 808 3C815 39 841 182 866 338L888 320C959 264 1196 -100 1322 -100C1451 -100 1578 22 1432 70C1309 131 1068 380 1026 422C1040 443 1334 670 1377 721C1460 781 1304 913 1208 857C1146 788 1044 676 936 583C922 571 910 561 899 550C916 664 928 759 928 793C927 891 737 861 722 768C715 728 701 655 684 567C679 571 673 575 668 580Z", "b": [-4.51371258692928, -123.53863898482817, 1497.1783083616665, 870.5386389848281]}, "З": {"d": "M332 580C406 643 485 679 569 679C435 596 381 478 381 425C381 283 616 344 616 237C616 150 510 110 405 110C303 110 202 150 182 230C169 283 0 294 0 218C0 40 180 -79 409 -79C650 -79 836 39 836 240C836 432 590 443 590 470C590 548 840 621 840 735C840 831 758 849 674 849C390 849 184 783 187 645C188 600 216 535 282 537C301 538 315 565 332 580Z", "b": [0, -79, 840, 849]}, "И": {"d": "M870 -50C868 13 808 595 770 680C750 725 678 760 600 670C549 616 296 221 260 240C226 260 343 659 355 690C400 815 195 820 175 740C157 668 43 120 36 -23C29 -165 177 -138 265 -60C366 24 553 330 630 330C662 330 665 -39 690 -80C715 -122 872 -112 870 -50Z", "b": [35.76036777276793, -124.04278839359982, 870.0189409506341, 793.2691310601663]}, "Й": {"d": "M848 -50C848 2 917 422 917 610C917 697 897 735 840 735C812 735 778 721 740 684C677 622 310 295 268 295C243 295 361 748 361 723C361 771 316 793 269 793C227 793 184 774 175 740C157 666 36 90 36 -34C36 -92 62 -115 99 -115C143 -115 200 -78 250 -40C375 56 620 310 698 310C716 310 663 -18 663 -50C663 -94 691 -106 744 -106C795 -106 848 -87 848 -50ZM508 659C574 691 643 768 933 858C1133 908 1028 1073 942 1050C753 1000 508 850 448 770C398 702 447 629 508 659Z", "b": [36, -115, 1047.6025568174084, 1052.185425171784]}, "К": {"d": "M351 300C470 257 873 -108 1000 -125C1128 -142 1256 -3 1110 45C924 110 560 401 496 422C513 437 872 597 924 633C1007 693 851 825 755 769C675 722 549 644 406 583C393 577 382 571 371 563C387 671 398 760 398 793C397 891 207 861 192 768C173 653 92 262 38 16C9 -113 257 -96 278 3C285 36 308 164 331 309C337 305 344 302 351 300Z", "b": [35.644913030026274, -126.43221248031975, 1174.9724483003927, 853.5863833508118]}, "Л": {"d": "M961 89C911 117 862 640 825 729C811 811 764 834 706 834C682 834 656 831 630 825C474 793 305 399 171 160C143 101 5 123 5 29C5 -60 55 -108 131 -109C221 -110 251 -70 311 40C334 72 490 388 582 549C599 587 626 569 629 553C665 370 688 122 761 -7C795 -66 845 -97 879 -97C974 -97 1020 -55 1020 -18C1020 10 1000 46 961 89Z", "b": [5, -109.01824042383552, 1020, 834]}, "М": {"d": "M1019 -10C1020 86 1004 750 899 750C793 751 595 420 529 420C462 420 330 835 219 778C122 728 46 99 32 22C13 -75 184 -89 199 -30C234 107 248 405 278 410C307 416 428 186 525 186C623 186 802 403 829 400C856 398 833 -10 839 -40C851 -98 1018 -65 1019 -10Z", "b": [30.528495160202546, -70.50148599514907, 1019.042438271605, 783.3766709161139]}, "Н": {"d": "M625 20C661 -11 777 -3 785 40C792 83 857 695 865 760C874 820 727 824 689 785C679 774 657 655 639 514C523 510 368 503 258 499C280 639 302 763 312 797C325 847 183 877 149 808C113 735 27 131 31 47C35 -41 185 -60 195 50C199 94 210 180 224 278C334 284 498 284 614 277C604 147 604 38 625 20Z", "b": [30.865089049168645, -25.870721916137114, 865.396029765136, 848.4027253941471]}, "О": {"d": "M456 -71C724 -71 962 133 962 428C962 722 755 857 533 857C282 857 20 684 20 369C20 69 233 -71 456 -71ZM534 683C652 683 767 587 767 459C767 303 657 125 462 125C289 125 219 227 219 344C219 568 364 683 534 683Z", "b": [20, -71, 962, 857]}, "П": {"d": "M580 20C616 -11 732 -3 740 40C746 80 797 565 814 677C830 780 855 864 780 864C673 864 292 850 219 843C189 840 159 793 151 743C138 664 32 135 36 47C40 -41 220 -70 230 40C240 156 299 509 329 660C415 664 539 663 622 658C588 495 533 60 580 20Z", "b": [35.889657178192266, -31.356322898193397, 831.2101732473735, 864]}, "Р": {"d": "M42 -17C87 -59 203 -61 213 -2C216 17 236 152 257 302C344 306 433 314 480 320C704 345 780 493 780 630C780 884 444 902 205 854C164 845 128 787 122 739C83 595 -1 21 42 -17ZM313 692 400 700C530 710 560 659 560 610C560 539 498 484 282 472Z", "b": [30.057165648617698, -47.532575618601655, 780, 875.0996972994726]}, "С": {"d": "M761 162C785 226 685 296 614 226C560 172 530 141 427 141C282 141 221 268 221 381C221 524 314 610 443 610C502 610 570 600 615 545C693 429 843 567 800 634C710 775 584 820 441 820C213 820 20 663 20 378C20 108 214 -20 416 -20C605 -20 723 70 761 162Z", "b": [20, -20, 807.6014655821718, 820]}, "Т": {"d": "M51 698C97 708 284 713 480 712C441 534 375 22 416 -13C452 -44 546 -45 554 -2C560 37 630 574 648 710C822 707 974 699 1001 688C1066 660 1130 892 1022 892C915 892 139 887 79 874C7 859 -52 676 51 698Z", "b": [-4.4314335396125415, -35.37723425669522, 1080.0201111070228, 892]}, "У": {"d": "M394 432C366 493 298 652 254 780C212 903 28 806 30 756C32 725 210 378 275 272C125 95 -20 2 -18 -29C-16 -118 122 -203 189 -100C404 141 577 405 749 670C796 740 774 797 729 819C680 843 592 842 532 736C516 707 509 630 429 490Z", "b": [-18.02045308800905, -147.16919822097967, 775.2344323398253, 839.7649869464988]}, "Ф": {"d": "M431 -81C467 -112 561 -113 569 -70L588 53C870 71 1078 226 1078 428C1078 563 911 664 681 693L696 797C705 857 573 876 542 831C534 820 521 771 507 701C247 692 30 577 30 377C30 194 192 85 418 58C414 -16 417 -70 431 -81ZM617 253C632 351 647 456 660 548C824 530 869 472 869 420C869 352 828 270 617 253ZM479 550C463 456 447 351 436 253C260 266 229 319 229 380C229 458 324 532 479 550Z", "b": [30, -103.37723425669522, 1078, 855.8386348382634]}, "Х": {"d": "M816 20C900 -35 994 -18 1016 70C1027 110 838 241 691 392C849 520 988 643 1012 710C1030 762 848 833 762 707C744 680 695 617 584 519C497 642 464 751 457 780C425 906 231 806 233 756C236 719 315 564 437 400C235 252 18 152 12 110C-3 22 116 -88 202 0C254 53 392 159 540 274C649 153 768 51 816 20Z", "b": [10.709742386984836, -32.352361243288584, 1016.4589127935485, 841.0935908835593]}, "Ц": {"d": "M714 -322C750 -353 867 -345 874 -302C878 -283 902 -96 915 4C930 140 898 187 810 180C789 178 764 175 736 173C757 351 790 647 796 694C805 754 658 769 620 730C600 709 592 379 590 162C477 154 349 148 244 153C271 345 326 660 343 721C356 771 184 811 150 742C114 669 32 131 36 47C38 -3 98 -34 151 -31C227 -31 525 -28 724 -27C708 -142 694 -303 714 -322Z", "b": [35.85875878290574, -340.73988316749205, 918.5546682585203, 778.8757122109347]}, "Ч": {"d": "M475 -13C517 -44 627 -45 636 -2C643 41 735 675 743 740C753 800 602 819 566 774C553 755 523 600 499 433C449 406 410 400 343 400C243 400 225 500 293 700C320 755 228 774 187 774C151 774 118 763 105 737C86 699 30 603 30 499C30 361 88 220 312 220C380 220 432 230 475 245C461 112 457 3 475 -13Z", "b": [30, -35.37723425669522, 743.4744542200207, 798.8386348382634]}, "Ш": {"d": "M294 812C258 843 142 835 134 792C127 751 73 266 60 155C26 90 19 -32 94 -32C184 -32 348 -26 507 -21C515 -21 522 -21 530 -20C696 -14 851 -8 905 -9C939 -9 974 61 977 118C1016 292 1070 662 1067 731C1063 819 883 848 873 738C864 636 817 349 785 179C730 177 669 176 606 176C633 369 686 672 703 731C716 781 544 821 510 752C482 695 441 364 426 176C363 177 304 179 253 181C287 349 339 772 294 812Z", "b": [35.4842780723735, -32, 1067.11976704147, 830.739883167492]}, "Щ": {"d": "M873 738C864 632 814 332 782 164C738 163 688 164 637 164C674 353 715 644 712 704C708 792 528 821 518 711C509 612 466 341 434 169L252 178C287 345 340 772 294 812C258 843 142 835 134 792C127 751 73 266 60 155C26 90 19 -32 94 -32C166 -32 314 -28 473 -23C503 -29 537 -30 562 -20L987 -7C968 -90 941 -168 918 -229C900 -277 1077 -319 1111 -250C1147 -177 1166 54 1162 138C1162 143 1161 147 1160 151C1155 175 1142 191 1117 190L989 176C1027 364 1070 669 1067 731C1063 819 883 848 873 738Z", "b": [35.4842780723735, -286.3367732612838, 1162.525752910741, 830.739883167492]}, "Ъ": {"d": "M168 152C168 35 221 -20 366 -20C554 -20 847 61 847 312C847 418 769 519 605 519C529 519 471 516 389 499L423 740C428 776 383 797 339 799C236 807 124 813 69 813C-39 813 25 581 90 609C112 619 167 623 231 624C205 489 177 291 168 152ZM444 159C440 159 392 162 337 166L360 296C413 302 458 305 496 305C577 305 621 291 621 257C621 209 585 159 444 159Z", "b": [10.979888892977115, -20, 847, 813]}, "Ы": {"d": "M1048 789C1006 826 895 827 886 776C879 733 761 115 753 50C743 -8 922 -41 957 2C986 44 1096 747 1048 789ZM35 152C35 35 88 -20 233 -20C421 -20 714 61 714 312C714 418 636 519 472 519C396 519 338 516 256 499L290 740C299 800 167 819 136 774C114 743 49 373 35 152ZM311 159C307 159 259 162 204 166L227 296C280 302 325 305 363 305C444 305 488 291 488 257C488 209 452 159 311 159Z", "b": [35, -20, 1059.964643048577, 815.6540489808127]}, "Ь": {"d": "M35 154C35 36 93 -20 253 -20C441 -20 734 61 734 312C734 418 656 519 492 519C416 519 358 516 276 499L310 740C320 804 171 824 136 776C114 745 49 375 35 154ZM331 159C327 159 279 162 224 166L247 296C300 302 345 305 383 305C464 305 508 291 508 257C508 209 472 159 331 159Z", "b": [35, -20, 734, 802.5799133769784]}, "Э": {"d": "M62 579C38 515 138 445 209 515C263 569 293 600 396 600C510 600 572 521 593 432C473 432 336 436 304 437C229 437 244 285 302 270C342 260 469 259 584 262C552 178 476 131 380 131C321 131 253 141 208 196C130 312 -20 174 23 107C113 -34 239 -79 382 -79C610 -79 803 78 803 363C803 633 609 761 407 761C218 761 100 671 62 579Z", "b": [15.39853441782816, -79, 803, 761]}, "Ю": {"d": "M877 -86C1145 -86 1383 118 1383 413C1383 707 1176 842 954 842C747 842 532 724 463 505C411 504 353 501 299 499C318 604 335 692 343 721C356 771 184 811 150 742C114 669 32 131 36 47C40 -41 220 -70 230 40C234 88 247 179 262 279C324 280 391 277 447 271C483 28 676 -86 877 -86ZM955 668C1073 668 1188 572 1188 444C1188 288 1078 110 883 110C710 110 640 212 640 329C640 553 785 668 955 668Z", "b": [35.85875878290574, -86, 1383, 842]}, "Я": {"d": "M616 -14C667 37 820 626 837 751C840 763 841 774 841 786C841 820 829 851 803 857C748 870 615 879 549 879C390 879 138 782 138 531C138 439 197 350 320 329C178 210 -9 88 -99 39C-178 -4 -133 -89 -63 -119C20 -154 53 -119 150 -40C181 -20 400 190 534 332C538 333 542 334 546 334C497 171 450 17 445 -3C445 -5 444 -8 444 -10C444 -59 580 -50 616 -14ZM540 700C544 700 596 697 653 692L609 545C563 540 522 538 489 538C408 538 364 552 364 586C364 634 399 700 540 700Z", "b": [-140.7832558082249, -132.56249316498804, 841, 879]}, "а": {"d": "M419 60C436 45 465 37 492 37C524 37 553 48 557 71C564 114 616 492 616 536C616 569 570 589 527 589C476 589 460 582 442 501C404 560 343 588 279 588C152 588 20 490 20 313C20 152 126 78 237 78C299 78 357 103 401 147C402 103 407 70 419 60ZM325 442C371 442 414 408 414 351C414 289 366 220 279 220C226 220 200 255 200 305C200 384 260 442 325 442Z", "b": [20, 37, 616, 589]}, "б": {"d": "M219 0C247 -7 275 -10 302 -10C457 -10 601 105 601 281C601 387 521 492 366 492C295 492 235 463 202 426C225 503 257 535 325 560C411 591 649 565 649 687C649 742 592 801 547 801C540 801 532 799 526 796C433 716 449 762 280 715C117 669 30 449 30 284C30 137 103 28 219 0ZM315 356C363 356 408 321 408 267C408 195 342 141 283 141C211 141 182 212 182 260C207 310 263 356 315 356Z", "b": [30, -10, 649, 801]}, "в": {"d": "M25 290C25 70 179 -6 303 -6C426 -6 567 52 567 211C567 292 505 346 432 361C511 380 532 447 532 489C532 594 441 670 326 670C120 670 25 475 25 290ZM293 172C220 172 198 250 216 317C260 325 396 324 396 252C396 190 339 172 293 172ZM327 517C358 517 397 505 397 466C397 393 288 412 240 424C252 474 280 517 327 517Z", "b": [25, -6, 567, 670]}, "г": {"d": "M46 29C73 -10 176 -3 184 40C190 80 223 351 234 439C335 445 455 436 502 416C567 388 631 620 523 620C416 620 220 615 160 602C55 580 3 90 46 29Z", "b": [30.875103349751953, 3.381209505858184, 581.0201111070229, 620]}, "д": {"d": "M945 148C898 166 883 172 796 171C770 280 705 465 681 570C651 700 551 710 446 680C308 641 277 351 172 153L63 150C-26 148 -21 -24 50 -20C530 5 835 -9 920 -30C982 -45 1021 119 945 148ZM541 490C564 451 585 348 629 166L351 157C389 281 445 476 471 494C490 507 523 519 541 490Z", "b": [-3.537554867732453, -30.967210025090182, 986.9036634835546, 694.0569415042095]}, "е": {"d": "M332 202C272 200 219 222 210 290C260 286 342 287 370 291C514 312 561 363 558 440C554 545 441 619 303 614C166 608 16 513 24 308C31 118 208 45 344 50C425 53 528 103 525 174C523 218 473 247 438 245C408 244 403 205 332 202ZM308 475C334 476 381 470 381 435C381 390 326 380 215 380C224 433 254 473 308 475Z", "b": [23.693369271774884, 49.76088429931025, 558.1337571065121, 614.2388853180304]}, "ж": {"d": "M609 39C615 70 630 158 644 259C744 163 905 -43 999 -41C1088 -39 1144 57 1049 120C897 221 836 274 739 370C756 385 1057 523 1109 559C1192 619 1065 726 969 670C890 623 817 556 675 503C683 578 689 639 689 669C688 767 544 733 529 640C522 596 515 539 507 471C408 551 236 672 131 710C47 740 -18 607 81 549C251 450 281 450 391 380C374 365 83 117 31 81C-52 21 75 -86 171 -30C246 14 371 136 461 240C467 247 473 253 478 260C468 198 455 133 439 66C413 -41 593 -37 609 39Z", "b": [4.121243240368756, -45.723959388077816, 1135.8787567596312, 728.0340240580223]}, "з": {"d": "M321 524C321 473 123 443 115 352C107 277 241 171 241 51C241 -59 217 -163 17 -246C-48 -344 89 -420 202 -370C346 -306 433 -159 433 30C433 141 380 260 260 330C430 410 509 524 509 601C509 650 471 678 415 686C342 696 189 682 107 690C67 694 35 675 29 617C24 565 40 516 79 512C136 521 321 560 321 524Z", "b": [0.21563345885639862, -385.813392434295, 509, 690.5116691796617]}, "и": {"d": "M747 94C745 157 738 373 695 456C682 481 629 529 527 450C473 409 249 227 218 245C184 265 259 470 271 501C316 626 165 601 136 542C104 475 38 257 31 114C24 -28 145 -7 250 47C314 79 445 163 543 221C580 243 591 82 616 41C641 -1 749 32 747 94Z", "b": [30.709876543209877, 5.959960066564975, 747.0274194938758, 590.6316517241279]}, "й": {"d": "M861 440C866 491 760 516 710 494C602 445 240 195 216 219C200 235 274 401 245 440C218 475 141 478 103 442C63 404 14 140 36 82C57 25 195 3 245 30C402 116 636 282 652 239C660 218 638 80 634 51C628 8 792 -1 797 52C803 107 859 425 861 440ZM400 518C466 550 683 678 982 751C1182 801 1077 966 991 943C802 893 400 709 340 629C290 561 339 488 400 518Z", "b": [30.542273179994766, 15.437750902866924, 1096.6025568174084, 945.1854251717839]}, "к": {"d": "M203 40C209 71 221 145 233 230C327 139 471 -42 556 -40C638 -38 690 51 602 109C472 203 421 251 338 340C352 354 612 483 658 516C735 572 617 671 528 619C456 576 389 515 262 466C267 515 270 556 270 580C269 678 125 644 110 551C91 436 92 312 33 67C7 -40 187 -36 203 40Z", "b": [30.436906274467653, -40.01643826328501, 682.912682404442, 639.0340240580223]}, "л": {"d": "M636 94C634 157 622 577 579 660C571 675 544 705 504 705C477 705 446 692 411 654C365 604 163 229 109 210C66 195 0 160 0 70C0 -1 53 -20 118 -20C250 -20 417 446 464 446C498 446 480 82 505 41C513 28 528 22 546 22C587 22 636 51 636 94Z", "b": [0, -20, 636, 705]}, "м": {"d": "M977 84C978 180 915 607 810 607C704 608 577 368 511 368C444 368 319 690 208 633C111 583 46 184 32 107C13 10 204 -14 219 45C254 182 261 358 291 363C320 369 399 106 496 106C594 106 708 339 735 336C762 334 769 83 775 53C787 -5 976 29 977 84Z", "b": [30.672544683993923, 13.081125862187534, 977.0117292616038, 639.7637774444904]}, "н": {"d": "M538 86C574 55 668 54 676 97C683 140 727 491 735 556C744 616 612 635 581 590C569 573 553 499 540 413C447 410 317 403 232 395C248 470 264 535 273 566C286 616 162 673 128 604C92 531 27 188 31 104C35 16 173 31 177 80C180 116 187 161 195 210C290 220 431 222 521 214C519 150 523 99 538 86Z", "b": [30.823623542234245, 40.56926165406442, 735.4390599193601, 635.9263791062631]}, "о": {"d": "M260 80C407 80 538 192 538 354C538 516 424 590 302 590C164 590 20 495 20 322C20 157 137 80 260 80ZM296 452C343 452 389 414 389 363C389 301 331 232 268 230C198 230 171 262 171 308C171 372 229 452 296 452Z", "b": [20, 80, 538, 590]}, "п": {"d": "M503 29C539 -2 633 -3 641 40C647 78 683 346 696 449C731 518 739 649 664 649C557 649 252 641 192 628C152 620 117 551 110 494C73 385 22 121 26 47C30 -41 230 -11 230 80C230 191 240 336 255 428C335 434 439 434 521 428C493 297 466 61 503 29Z", "b": [25.778381385765215, -5.666452970314737, 721.7503980226178, 649]}, "р": {"d": "M23 -299C59 -330 153 -331 161 -288L216 109C260 56 323 30 389 30C506 30 650 136 650 320C650 507 526 583 419 583C369 583 317 567 273 537L278 570C287 630 155 649 124 604C95 562 -25 -257 23 -299ZM341 200C278 200 240 232 240 275C242 361 307 405 362 405C434 405 456 356 456 313C456 258 413 201 341 200Z", "b": [11.797035865435546, -321.3772342566952, 650, 628.8386348382634]}, "с": {"d": "M595 147C627 217 494 270 447 211C424 181 395 172 344 172C243 172 200 246 200 311C200 428 297 449 340 449C390 449 430 429 465 391C514 325 664 411 616 496C560 596 453 639 360 639C200 639 40 522 40 309C40 106 185 11 336 11C478 11 565 78 595 147Z", "b": [40, 11, 625.3500026722602, 639]}, "т": {"d": "M64 480C101 488 177 493 260 494C229 380 190 65 231 29C267 -2 361 -3 369 40C376 81 417 413 427 492C511 488 583 481 608 470C673 442 737 674 629 674C522 674 152 669 92 656C20 641 -39 458 64 480Z", "b": [8.568566460387459, 6.622765743304786, 687.0201111070229, 674]}, "у": {"d": "M76 -300C11 -365 32 -469 156 -450C234 -438 290 -352 386 -100C458 89 562 314 676 580C706 650 676 680 619 678C579 677 538 670 509 608C436 450 366 240 336 170C296 290 274 499 206 610C122 748 -3 615 6 570C18 519 200 140 256 0C226 -80 156 -220 76 -300Z", "b": [5.539786033110715, -452.2822123731248, 687.8275394769581, 678.0935072788114]}, "ф": {"d": "M307 -299C343 -330 437 -331 445 -288L476 -31C776 -5 829 177 829 300C829 499 653 571 549 581C556 639 560 680 562 692C571 752 439 771 408 726C401 716 390 661 377 580C207 588 19 463 19 279C19 106 115 -3 305 -29C293 -173 291 -285 307 -299ZM359 455C346 365 334 262 323 161C221 191 224 274 224 309C224 376 262 449 359 455ZM499 164C511 266 524 370 534 459C604 436 624 368 624 317C624 274 591 196 499 164Z", "b": [19, -321.3772342566952, 829, 750.8386348382634]}, "х": {"d": "M86 526C144 452 193 382 243 316C179 257 115 195 42 113C-25 2 75 -89 160 10C204 80 264 144 328 209C388 137 455 68 540 0C618 -19 676 61 651 132C581 214 542 211 475 300C467 309 460 319 453 329C503 373 555 415 610 460C725 554 640 680 589 654C509 565 442 499 378 439C331 509 286 578 222 642C141 723 35 628 86 526Z", "b": [20.058284685279645, -32.39048582536043, 667.3689469955945, 672.4621960788672]}, "ц": {"d": "M788 196C767 191 729 187 681 184C716 313 755 539 752 605C748 693 610 678 606 629C595 508 545 282 519 178C416 176 304 177 222 182C251 311 283 589 245 623C209 654 115 655 107 612C100 570 57 231 48 157C17 94 11 -17 84 -17C168 -17 503 -8 670 1C648 -67 618 -122 590 -160C540 -225 723 -364 757 -295C793 -222 876 47 872 131C871 157 855 174 834 183C825 195 811 201 788 196Z", "b": [26.167218530041087, -313.73793349350024, 872.1396037972501, 668.4307383459355]}, "ч": {"d": "M61 582C26 490 16 362 53 283C106 170 279 158 399 216C392 128 394 52 413 36C449 5 533 8 541 51C548 94 592 445 600 510C609 570 487 585 456 540C448 528 437 489 427 436C385 357 230 325 208 420C208 455 217 495 233 531C276 628 98 680 61 582Z", "b": [29.583347861227914, 15.338167694771151, 600.4731565242786, 634.5063379069578]}, "ш": {"d": "M245 623C209 654 115 655 107 612C100 570 57 231 48 157C17 94 11 -17 84 -17C191 -17 772 1 832 14C862 20 890 58 905 98C907 101 909 105 910 110C910 113 911 119 912 125C914 132 915 140 915 147C929 251 962 513 969 569C978 629 846 648 815 603C793 571 752 326 754 188C697 184 624 182 548 180C578 310 605 480 603 536C599 624 461 609 457 560C448 462 413 294 387 179C326 179 269 180 222 183C251 313 283 589 245 623Z", "b": [26.167218530041087, -17, 969.4390599193601, 645.3772342566953]}, "щ": {"d": "M1028 196C1007 191 968 184 919 177C934 294 963 518 969 569C978 629 846 648 815 603C793 571 752 326 754 188C697 184 624 182 548 180C578 310 605 480 603 536C599 624 461 609 457 560C448 462 413 294 387 179C326 179 269 180 222 183C251 313 283 589 245 623C209 654 115 655 107 612C100 570 57 231 48 157C17 94 11 -17 84 -17C160 -17 477 -8 674 2C763 2 849 3 911 4C889 -65 859 -122 830 -160C780 -225 963 -364 997 -295C1033 -222 1116 47 1112 131C1111 157 1095 174 1074 183C1065 195 1051 201 1028 196Z", "b": [26.167218530041087, -313.73793349350024, 1112.13960379725, 645.3772342566953]}, "ъ": {"d": "M152 240C134 71 245 -8 366 -21C488 -34 668 34 691 241C708 400 619 484 506 496C463 501 402 490 360 472C377 592 410 604 416 643C420 679 362 704 312 704C206 709 136 709 75 709C-33 709 20 523 90 530C118 533 152 541 208 546C184 446 160 316 152 240ZM393 163C337 169 311 214 315 252C318 287 324 297 336 330C414 362 528 338 518 240C513 196 465 156 393 163Z", "b": [13.427420312037896, -22.536065069928185, 693.0891918476426, 709]}, "ы": {"d": "M800 80C800 220 849 545 870 620C883 670 759 727 725 658C689 585 592 131 596 47C600 -41 800 -11 800 80ZM34 310C10 140 111 35 232 24C350 12 523 72 545 254C563 393 471 467 355 478C317 482 256 472 219 457C251 580 270 573 276 607C283 653 146 678 109 643C84 613 46 423 34 310ZM264 185C211 185 174 240 192 332C261 360 374 346 365 260C361 221 336 185 264 185Z", "b": [30.444983623361054, -5.666452970314737, 870.950979759329, 689.9263791062631]}, "ь": {"d": "M34 310C10 140 111 35 232 24C350 12 523 72 545 254C563 393 471 467 355 478C317 482 256 472 219 457C251 580 270 573 276 607C283 653 146 678 109 643C84 613 46 423 34 310ZM264 185C211 185 174 240 192 332C261 360 374 346 365 260C361 221 336 185 264 185Z", "b": [30.444983623361054, 22.527747426708324, 547.258609923542, 659.4515227915068]}, "э": {"d": "M57 503C25 433 158 380 205 439C228 469 257 478 308 478C370 478 411 449 432 412C390 413 357 413 340 412C267 405 196 251 301 262C331 265 378 265 431 262C396 211 327 200 291 200C249 200 216 220 187 259C138 325 5 244 49 157C97 55 187 11 280 11C451 11 612 128 612 341C612 544 467 639 316 639C174 639 87 572 57 503Z", "b": [40.21036250643854, 11, 612, 639]}, "ю": {"d": "M759 52C906 52 1037 164 1037 326C1037 488 923 562 801 562C699 562 593 510 545 413C451 410 315 403 227 395C243 470 259 535 268 566C281 616 157 673 123 604C87 531 22 188 26 104C30 16 168 31 172 80C175 116 182 161 190 210C291 220 442 223 530 212C562 103 658 52 759 52ZM795 424C842 424 888 386 888 335C888 273 830 204 767 202C697 202 670 234 670 280C670 344 728 424 795 424Z", "b": [25.823623542234245, 40.56926165406442, 1037, 635.9263791062631]}, "я": {"d": "M644 431C644 633 485 662 386 662C255 662 101 577 101 422C101 321 151 271 219 247C171 204 111 177 35 138C-52 94 46 -62 143 -17C252 34 372 146 430 233C431 233 432 234 434 234C415 108 376 96 369 55C362 6 489 -18 527 16C580 63 644 312 644 431ZM378 494C445 494 510 478 464 362C434 354 400 349 368 350C360 351 351 352 343 352C301 358 270 379 270 423C270 464 312 494 378 494Z", "b": [1.3260397254609302, -25.065051077762746, 644, 662]}, "ё": {"d": "M332 182C403 185 408 224 438 225C473 227 523 198 525 154C528 83 425 33 344 30C208 25 31 98 24 288C16 493 166 588 303 594C441 599 554 525 558 420C561 343 514 292 370 271C342 267 260 266 210 270C219 202 272 180 332 182ZM308 455C254 453 224 413 215 360C326 360 381 370 381 415C381 450 334 456 308 455ZM290 707C294 758 255 810 197 810C156 810 103 765 99 712C94 662 125 616 182 616C238 616 286 660 290 707ZM351 719C347 668 386 616 444 616C485 616 538 661 542 714C547 764 516 810 459 810C403 810 355 766 351 719Z", "b": [23.693369271774873, 29.76088429931025, 558.1337571065121, 810]}, "–": {"d": "M83 247C185 270 410 258 475 230C540 202 594 397 486 397C379 397 162 385 101 386C43 387 -4 244 83 247Z", "b": [35.04561202396812, 227.24942194546827, 547.5526842176613, 397]}, "—": {"d": "M48 247C150 270 601 268 666 240C731 212 785 407 677 407C570 407 127 385 66 386C8 387 -39 244 48 247Z", "b": [0.045612023968118365, 237.24942194546827, 738.5526842176613, 407]}, "‘": {"d": "M263 785C343 865 273 965 165 933C30 876 -86 446 156 446C215 446 275 503 280 569C286 632 247 690 175 690H174C201 730 246 769 263 785Z", "b": [15.413708532394963, 446, 297.5240412416596, 939.1219578393982]}, "’": {"d": "M65 492C-15 412 55 312 163 344C298 401 414 831 172 831C113 831 53 774 48 708C42 645 81 587 153 587H154C127 547 82 508 65 492Z", "b": [30.47595875834041, 337.87804216060175, 312.58629146760507, 831]}, "‚": {"d": "M32 -187C-48 -267 22 -367 130 -335C265 -278 381 152 139 152C80 152 20 95 15 29C9 -34 48 -92 120 -92H121C94 -132 49 -171 32 -187Z", "b": [-2.5240412416595888, -341.12195783939825, 279.58629146760507, 152]}, "“": {"d": "M572 785C652 865 582 965 474 933C339 876 223 446 465 446C524 446 584 503 589 569C595 632 556 690 484 690H483C510 730 555 769 572 785ZM263 785C343 865 273 965 165 933C30 876 -86 446 156 446C215 446 275 503 280 569C286 632 247 690 175 690H174C201 730 246 769 263 785Z", "b": [15.413708532394963, 446, 606.5240412416596, 939.1219578393982]}, "”": {"d": "M32 492C-48 412 22 312 130 344C265 401 381 831 139 831C80 831 20 774 15 708C9 645 48 587 120 587H121C94 547 49 508 32 492ZM341 492C261 412 331 312 439 344C574 401 690 831 448 831C389 831 329 774 324 708C318 645 357 587 429 587H430C403 547 358 508 341 492Z", "b": [-2.5240412416595888, 337.87804216060175, 588.5862914676051, 831]}, "„": {"d": "M32 -187C-48 -267 22 -367 130 -335C265 -278 381 152 139 152C80 152 20 95 15 29C9 -34 48 -92 120 -92H121C94 -132 49 -171 32 -187ZM341 -187C261 -267 331 -367 439 -335C574 -278 690 152 448 152C389 152 329 95 324 29C318 -34 357 -92 429 -92H430C403 -132 358 -171 341 -187Z", "b": [-2.5240412416595888, -341.12195783939825, 588.5862914676051, 152]}, "•": {"d": "M384 296C391 390 321 487 213 487C137 487 38 404 31 307C22 214 80 129 185 129C288 129 377 210 384 296Z", "b": [30.087131006427718, 129, 384.48100012572604, 487]}, "…": {"d": "M255 22C260 86 212 152 139 152C87 152 20 95 15 29C9 -34 48 -92 120 -92C190 -92 250 -37 255 22ZM523 22C528 86 480 152 407 152C355 152 288 95 283 29C277 -34 316 -92 388 -92C458 -92 518 -37 523 22ZM791 22C796 86 748 152 675 152C623 152 556 95 551 29C545 -34 584 -92 656 -92C726 -92 786 -37 791 22Z", "b": [14.396396176348848, -92, 791.356768585672, 152]}, "№": {"d": "M143 785C137 723 29 98 11 16C-9 -74 132 -150 210 -60C271 -7 581 378 631 379C670 380 557 10 545 -21C500 -146 705 -151 725 -71C743 1 857 549 864 692C871 834 723 807 635 729C515 646 305 306 241 306C201 306 330 755 325 796C319 844 148 847 143 785ZM931 182C1033 185 1098 185 1163 165C1231 144 1282 335 1174 332C1088 330 1010 320 949 321C891 322 844 179 931 182ZM1098 374C1214 374 1317 462 1317 590C1317 718 1227 776 1131 776C1022 776 909 701 909 565C909 435 1001 374 1098 374ZM1124 646C1152 646 1180 623 1180 592C1180 556 1145 514 1107 511C1064 511 1048 531 1048 559C1048 599 1083 646 1124 646Z", "b": [9.07915762246818, -124.26913106016633, 1317, 831.8046662649698]}},sets={cyr:'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',lat:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',num:'0123456789!?&@#%'};let set='cyr',lower=false,selected='А';
function select(c){selected=c;const g=glyphs[c];$('big').replaceChildren();if(g){const [x,y,X,Y]=g.b,p=20;$('big').innerHTML=`<svg viewBox="${x-p} ${-Y-p} ${X-x+2*p} ${Y-y+2*p}" role="img" aria-label="${c}"><path transform="scale(1 -1)" d="${g.d}"/></svg>`}$('code').textContent='U+'+c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0');[...$('grid').children].forEach(b=>b.classList.toggle('active',b.textContent===c))}
function grid(){const chars=lower?sets[set].toLowerCase():sets[set];$('grid').replaceChildren();[...chars].forEach(c=>{const b=document.createElement('button');b.textContent=c;b.setAttribute('aria-label','Inspect '+c);b.onclick=()=>select(c);$('grid').append(b)});select(chars.includes(selected)?selected:chars[0])}shadow.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{set=b.dataset.set;shadow.querySelectorAll('[data-set]').forEach(x=>x.classList.toggle('active',x===b));grid()});shadow.querySelectorAll('[data-case]').forEach(button=>button.onclick=()=>{lower=button.dataset.case==='lower';selected=lower?selected.toLowerCase():selected.toUpperCase();shadow.querySelectorAll('[data-case]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});grid()});
grid();
const ctx=document.createElement('canvas').getContext('2d');function fit(){const t=$('text'),lines=t.value.split('\n');ctx.font='100px Comedy';const width=Math.max(1,...lines.map(l=>ctx.measureText(l).width));const ascent=Math.max(...lines.map(l=>ctx.measureText(l).actualBoundingBoxAscent||70))/100,descent=Math.max(...lines.map(l=>ctx.measureText(l).actualBoundingBoxDescent||0))/100;const factor=.24+.66+(lines.length-1)*.82+descent;const max=Math.max(40,Math.floor(Math.min(440,(t.clientWidth-20)*100/(width+5),(t.clientHeight-12)/factor)));$('size').max=max;if(+$('size').value>max)$('size').value=max;t.style.fontSize=$('size').value+'px';$('value').textContent=$('size').value+' PX'}$('size').oninput=fit;$('text').oninput=fit;$('reset').onclick=()=>{$('text').value='Всё будет\nсмешно.';$('size').value=200;fit()};$('invert').onclick=()=>$('test').classList.toggle('inverted');document.fonts.ready.then(fit);addEventListener('resize',fit,{signal});
})();
    /* ---- script 2: прыгающие буквы COMEDIC */
    (()=>{
const section=shadow.getElementById('comedic'),word=shadow.getElementById('comedic-word'),letters=[...word.children],last=letters.at(-1),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;let generation=0,animations=[],visible=false;
function stop(){generation++;animations.forEach(a=>a.cancel());animations=[];letters.forEach(el=>el.style.removeProperty('transform-origin'))}
function animate(el,frames,options){const a=el.animate(frames,{fill:'both',...options});animations.push(a);return a.finished.catch(()=>{})}
async function run(){stop();const token=generation;if(reduced)return;await document.fonts.ready;if(token!==generation||!live())return;
const fs=parseFloat(getComputedStyle(word).fontSize),home=last.offsetLeft,land=-fs*.7,drop=-Math.max(slideH(),fs*4);
const dest=el=>el.offsetLeft+el.offsetWidth/2-last.offsetWidth/2-home;
const press=el=>animate(el,[{transform:'translateY(0) rotate(0deg)'},{transform:`translateY(${fs*.15}px) rotate(-5deg)`,offset:.18},{transform:'translateY(0) rotate(0deg)',offset:.8},{transform:'translateY(0) rotate(0deg)'}],{duration:440,easing:'cubic-bezier(.2,.75,.25,1)'});
const falling=letters.slice(0,-1).map((el,i)=>animate(el,[{transform:`translateY(${drop}px) rotate(-7deg)`,easing:'cubic-bezier(.6,0,.9,.6)'},{transform:`translateY(${fs*.04}px) rotate(2deg)`,offset:.62,easing:'cubic-bezier(.1,.7,.3,1)'},{transform:`translateY(${-fs*.09}px) rotate(-1deg)`,offset:.79,easing:'ease-in'},{transform:'translateY(0) rotate(0deg)'}],{duration:780,delay:i*65}));
let x=dest(letters[0]);
const lastDrop=animate(last,[{transform:`translate(${x}px,${drop}px) rotate(12deg)`,easing:'cubic-bezier(.6,0,.9,.65)'},{transform:`translate(${x}px,${land}px) rotate(0deg)`}],{duration:600,delay:550}).then(()=>{if(token===generation)press(letters[0])});
await Promise.all([...falling,lastDrop]);if(token!==generation||!live())return;
for(let i=1;i<letters.length;i++){
 const final=i===letters.length-1,nextX=final?0:dest(letters[i]),nextY=final?0:land;
 await animate(last,[{transform:`translate(${x}px,${land}px) rotate(0deg)`,easing:'cubic-bezier(.15,.7,.4,1)'},{transform:`translate(${(x+nextX)/2}px,${land-fs*.65}px) rotate(9deg)`,offset:.5,easing:'cubic-bezier(.6,0,.85,.3)'},{transform:`translate(${nextX}px,${nextY}px) rotate(0deg)`}],{duration:470});if(token!==generation||!live())return;
 if(!final)press(letters[i]);x=nextX;
}
await animate(last,[{transform:`translateY(${fs*.04}px)`},{transform:`translateY(${-fs*.07}px)`,offset:.45},{transform:'translateY(0)'}],{duration:260,easing:'ease-out'});if(token!==generation||!live())return;
// Each rigid letter turns around its own vertical axis, after all hops finish.
animations.forEach(a=>a.cancel());animations=[];
letters.forEach(el=>{el.style.transformOrigin='50% 50%'});
await Promise.all(letters.map((el,i)=>animate(el,[{transform:'perspective(1000px) rotateY(0deg)'},{transform:'perspective(1000px) rotateY(360deg)'}],{duration:760,delay:i*200,easing:'cubic-bezier(.45,0,.25,1)'})));
if(token===generation)stop();
}
new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)run();else stop()},{threshold:.6}).observe(section);shadow.getElementById('word-replay').onclick=run;addEventListener('resize',()=>{if(visible)run()},{signal});
})();
    /* ---- script 3: карандашные кольца на кнопках */
    (()=>{
const ns='http://www.w3.org/2000/svg';
function decorate(button){if(button.querySelector('.pencil-ring'))return;const svg=document.createElementNS(ns,'svg');svg.classList.add('pencil-ring');svg.setAttribute('viewBox','0 0 200 80');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');svg.innerHTML='<path pathLength="1" d="M184 19 C160 0 48 1 15 24 C-12 44 20 73 94 72 C157 72 205 53 191 30 C175 6 49 3 13 34"/><path class="pencil-echo" pathLength="1" d="M20 19 C65 -3 186 5 194 35 C207 67 71 86 20 61 C-2 50 3 29 38 16"/>';button.append(svg)}
const selector='#grid button,.glyph-controls>button,.schedule button,.case-switch button';
const scan=()=>shadow.querySelectorAll(selector).forEach(decorate);scan();new MutationObserver(scan).observe(shadow.getElementById('grid'),{childList:true});
shadow.addEventListener('click',e=>{const b=e.target.closest(selector);if(!b||matchMedia('(prefers-reduced-motion:reduce)').matches)return;b.animate([{translate:'0 0',rotate:'0deg'},{translate:'0 -4px',rotate:'-2deg',offset:.35},{translate:'0 0',rotate:'0deg'}],{duration:260,easing:'cubic-bezier(.2,.8,.3,1)'});const glyph=shadow.querySelector('#big svg');if(glyph&&b.closest('.glyph-controls'))glyph.animate([{translate:'0 20px'},{translate:'0 -6px',offset:.7},{translate:'0 0'}],{duration:320,easing:'ease-out'})},{signal});
})();
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
