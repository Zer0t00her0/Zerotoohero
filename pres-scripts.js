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
