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
