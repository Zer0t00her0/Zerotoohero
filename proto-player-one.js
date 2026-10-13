/* Интерактивный прототип приложения Player One (ставки на спорт) для страницы проекта.
   Повторяет экраны из оригинального макета: заставка, главная с боем, экран матча со счётом,
   профиль с балансом, красные экраны «Ставка принята» и «Денег больше нет». Всё выдуманное: баланс и коэффициенты. */
(() => {
  const MATCHES = [
    { id: 'ucl', league: 'Лига чемпионов / полуфинал', a: 'Барселона', b: 'Реал Мадрид', day: 'Пятница, 26 авг.', time: '20:30', base: 2.1 },
    { id: 'mci', league: 'Лига чемпионов / группа C', a: 'Манчестер С.', b: 'Галатасарай', day: 'Пятница, 26 авг.', time: '22:45', base: 1.7 },
    { id: 'rpl', league: 'РПЛ / 8 тур', a: 'Спартак', b: 'Зенит', day: 'Сегодня', time: '63′', base: 2.4, live: true, now: [1, 1] },
    { id: 'epl', league: 'АПЛ / 4 тур', a: 'Ливерпуль', b: 'Арсенал', day: 'Суббота, 27 авг.', time: '19:30', base: 1.9 },
  ];
  const FIGHT = { kicker: 'UFC / главный бой', a: { name: 'Хабиб', coef: 2.58 }, b: { name: 'Конор', coef: 1.98 } };
  const FEED = [
    { who: 'Владимир Иванов', what: 'Томми Мякконен : Стиг Бломквист', win: 300, act: 'Играть', primary: true },
    { who: 'Славик', what: 'Манчестер С. : Галатасарай', win: 725, act: 'Совместная игра' },
    { who: 'Пётр Степаненко', what: 'Манчестер С. : Галатасарай', win: 542, act: 'Ответить' },
    { who: 'Иришка', what: 'Брюс Ли : Чак Норрис', win: 542, act: 'Ответить' },
  ];
  const START_BETS = [
    { title: 'С. Уильямс — М. Шарапова', pick: 'С. Уильямс', coef: 1.08, amount: 300 },
    { title: 'Манчестер С. — Галатасарай', pick: 'Галатасарай', coef: 1.04, amount: 500 },
  ];

  const ICONS = {
    home: '<path d="M4 11 12 4l8 7v9H4z"/><path d="M8 20v-6h8v6"/><path d="M8 11h8"/>',
    list: '<path d="M4 6h2M4 12h2M4 18h2M9 6h11M9 12h11M9 18h11"/>',
    live: '<path d="M13 3 6 13h5l-1 8 8-11h-5z"/>',
    gift: '<rect x="4" y="9" width="16" height="11"/><path d="M4 13h16M12 9v11M12 9c-2-4-6-4-6-1s4 1 6 1c2 0 6 2 6-1s-4-3-6 1"/>',
    me: '<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
  };
  const TABS = [['home', 'Главная'], ['list', 'Матчи'], ['live', 'Live'], ['gift', 'Бонусы'], ['me', 'Профиль']];

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const money = n => Math.round(n).toLocaleString('ru-RU');
  const coefFor = (m, [a, b]) => +(m.base * 0.6 + (a + b) * 0.25 + Math.abs(a - b) * 0.15 + 0.4).toFixed(2);
  const icon = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;

  function mount(root, { images }) {
    const logo = images[1]?.src; // 01 — логотип-куб
    const pattern = images[0]?.src; // обложка — паттерн из логотипов
    let st, timers = [];
    const reset = () => {
      timers.forEach(clearTimeout);
      timers = [];
      st = { screen: 'splash', balance: 5678, week: 10, bets: START_BETS.map(b => ({ ...b })),
             match: null, score: [3, 2], fighter: null, sheet: null, stake: 500, bonus: false, last: null };
    };
    reset();

    root.innerHTML = `
      <div class="p1-intro">
        <p class="mono p1-label">Interactive prototype</p>
        <h3 class="p1-title">Try the app</h3>
        <p class="p1-lead">Player One is a sports betting app. The identity is built around one big red hexagon button, and every screen leads to it. This prototype brings the original screens to life.</p>
        <ol class="p1-how mono">
          <li><b>01</b> Pick a fighter on the main screen or open a match</li>
          <li><b>02</b> Predict the exact score with the number columns</li>
          <li><b>03</b> Press «Сделать ставку» and choose the stake</li>
          <li><b>04</b> Check the balance and your bets in the profile</li>
        </ol>
        <p class="mono p1-note">Concept prototype. Odds, balance and friends are made up.</p>
      </div>
      <div class="p1-stage">
        <div class="p1-phone">
          <div class="p1-screen">
            <div class="p1-status"><span>9:41</span><span class="p1-notch"></span><span>58%</span></div>
            <div class="p1-view" data-lenis-prevent></div>
            <nav class="p1-nav" aria-label="App navigation">${TABS.map(([k, label]) =>
              `<button type="button" data-act="tab" data-tab="${k}" aria-label="${label}">${icon(k)}</button>`).join('')}</nav>
            <div class="p1-sheet-wrap" data-act="close"><div class="p1-sheet" data-lenis-prevent></div></div>
            <div class="p1-toast" role="status"></div>
          </div>
        </div>
        <button type="button" class="p1-restart mono" data-act="restart">Restart prototype ↺</button>
      </div>`;

    const screen = root.querySelector('.p1-screen');
    const view = root.querySelector('.p1-view');
    const sheetWrap = root.querySelector('.p1-sheet-wrap');
    const sheet = root.querySelector('.p1-sheet');
    const toastEl = root.querySelector('.p1-toast');
    const later = (fn, ms) => timers.push(setTimeout(() => root.isConnected && fn(), ms));

    function toast(msg) {
      toastEl.textContent = msg;
      toastEl.classList.add('on');
      later(() => toastEl.classList.remove('on'), 1800);
    }
    const go = s => { st.screen = s; render(); view.scrollTop = 0; };

    /* ——— Экраны ——— */
    const matchCard = m => `
      <button type="button" class="p1-card" data-act="open" data-id="${m.id}">
        <span class="p1-card-teams">${esc(m.a)}<br>${esc(m.b)}</span>
        <span class="p1-card-date">${esc(m.day)} ${m.live ? `· идёт ${m.time} · ${m.now.join(':')}` : `· ${m.time}`}</span>
        ${m.live ? '<span class="p1-live">LIVE</span>' : ''}
        <span class="p1-corner"></span>
      </button>`;

    const SCREENS = {
      splash: () => `<div class="p1-splash" data-act="skip">${logo ? `<img src="${logo}" alt="Player One">` : '<b>PLAYER ONE</b>'}</div>`,

      home: () => `
        <div class="p1-fight" style="--pat:url('${pattern || ''}')">
          <p class="p1-kicker">${FIGHT.kicker}</p>
          ${['a', 'b'].map(k => `
            <button type="button" class="p1-fighter${st.fighter === k ? ' on' : ''}" data-act="fighter" data-f="${k}">
              <span class="p1-coef">${FIGHT[k].coef}</span><span class="p1-name">${FIGHT[k].name}</span>
            </button>`).join('')}
          <p class="p1-hint">${st.fighter ? `Ваш выбор: ${FIGHT[st.fighter].name}` : 'Нажмите на бойца, чтобы выбрать'}</p>
        </div>
        <button type="button" class="p1-hex" data-act="bet-fight" aria-disabled="${!st.fighter}"><span>Сделать<br>ставку</span></button>
        <h4 class="p1-h">Ближайшие матчи</h4>
        ${MATCHES.filter(m => !m.live).slice(0, 2).map(matchCard).join('')}`,

      list: () => `<h4 class="p1-h p1-h-top">Все матчи</h4>${MATCHES.map(matchCard).join('')}`,

      live: () => `
        <h4 class="p1-h p1-h-top">Live <span class="p1-live p1-live-inline">сейчас</span></h4>
        ${MATCHES.filter(m => m.live).map(matchCard).join('')}
        <p class="p1-empty">Больше live-матчей пока нет. Загляните вечером.</p>`,

      gift: () => `
        <div class="p1-gift">
          <p class="p1-gift-sum">+500 ₽</p>
          <p class="p1-gift-text">Бонус на первую ставку недели</p>
          <button type="button" class="p1-btn solid" data-act="claim" ${st.bonus ? 'disabled' : ''}>${st.bonus ? 'Бонус получен' : 'Забрать бонус'}</button>
        </div>`,

      match: () => {
        const m = st.match;
        const digits = side => `<div class="p1-digits">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d =>
          `<button type="button" data-act="digit" data-side="${side}" data-d="${d}" class="${st.score[side] === d ? 'on' : ''}" aria-label="${side ? m.b : m.a}: ${d}">${d}</button>`).join('')}</div>`;
        return `
          <div class="p1-match">
            <button type="button" class="p1-back" data-act="back" aria-label="Назад"></button>
            <p class="p1-league">${esc(m.league)}</p>
            <p class="p1-ticket">Билет на 3 игры</p>
            <p class="p1-steps"><i>1</i><i>2</i><b>3</b></p>
            <p class="p1-when"><span class="p1-time">${m.live ? m.time : m.time}</span><span>${esc(m.day)}</span></p>
            <div class="p1-score">
              ${digits(0)}
              <div class="p1-team"><b>${st.score[0]}</b><span>${esc(m.a)}</span></div>
              <div class="p1-team"><b>${st.score[1]}</b><span>${esc(m.b)}</span></div>
              ${digits(1)}
            </div>
            <p class="p1-coefline">Коэффициент на точный счёт <b>${coefFor(m, st.score)}</b></p>
            <button type="button" class="p1-hex" data-act="bet-score"><span>Сделать<br>ставку</span></button>
          </div>`;
      },

      me: () => {
        const waiting = st.bets.length;
        return `
          <div class="p1-prof-head">
            <div class="p1-ava">Я</div>
            <p class="p1-balance">${money(st.balance)} ₽</p>
            <p class="p1-stats"><b>${waiting}</b> ${waiting === 1 ? 'ставка не сыграна' : 'ставок не сыграно'}<br><b>4</b> ставки сыграно: <b>3</b> победы, <b>1</b> проигрыш, <b>+800 ₽</b></p>
          </div>
          <div class="p1-prof-cards">
            <div class="p1-week"><span>Ставок за неделю</span><b>${st.week}</b></div>
            <div class="p1-mybets"><span>Ставки</span>${st.bets.slice(0, 3).map(b =>
              `<p><i>${b.coef}</i>${esc(b.pick)}</p>`).join('')}</div>
          </div>
          <h4 class="p1-h">Друзья</h4>
          <div class="p1-feed">${FEED.map(f => `
            <div class="p1-feed-row">
              <span class="p1-fava">${esc(f.who[0])}</span>
              <p>${esc(f.who)}<small>${esc(f.what)} <em>+${f.win}</em></small></p>
              <button type="button" class="${f.primary ? 'primary' : ''}" data-act="toast" data-msg="${f.act === 'Играть' ? 'Вы в игре!' : 'Приглашение отправлено'}">${f.act}</button>
            </div>`).join('')}</div>
          <h4 class="p1-h">Мои ставки</h4>
          ${st.bets.map(b => `
            <div class="p1-bet${b === st.last ? ' new' : ''}">
              <p>${esc(b.title)}</p>
              <small>${esc(b.pick)} · ${money(b.amount)} ₽ × ${b.coef} = <b>${money(b.amount * b.coef)} ₽</b></small>
            </div>`).join('')}`;
      },

      accepted: () => `
        <div class="p1-red">
          <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M18 52 40 74 84 26"/></svg>
          <h3>Ставка<br>принята!</h3>
          <p>${esc(st.last.pick)} · ${money(st.last.amount)} ₽<br>Возможный выигрыш ${money(st.last.amount * st.last.coef)} ₽</p>
          <button type="button" class="p1-btn" data-act="tab" data-tab="me">В профиль</button>
          <button type="button" class="p1-btn ghost" data-act="tab" data-tab="home">Ещё ставка</button>
        </div>`,

      broke: () => `
        <div class="p1-red">
          <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 14v72M14 50h72" transform="rotate(45 50 50)"/></svg>
          <h3>Денег<br>больше<br>нет!</h3>
          <p>На балансе ${money(st.balance)} ₽. Пополните счёт или уменьшите ставку.</p>
          <button type="button" class="p1-btn" data-act="topup">Пополнить +5 000 ₽</button>
          <button type="button" class="p1-btn ghost" data-act="back-sheet">Изменить ставку</button>
        </div>`,
    };

    function renderSheet() {
      const s = st.sheet;
      if (!s) { sheetWrap.classList.remove('on'); return; }
      sheet.innerHTML = `
        <p class="p1-sheet-title">Ваша ставка</p>
        <p class="p1-sheet-pick">${esc(s.title)}<br><b>${esc(s.pick)}</b></p>
        <p class="p1-sheet-coef">Коэффициент <b>${s.coef}</b></p>
        <div class="p1-chips">${[100, 500, 1000, 10000].map(v =>
          `<button type="button" data-act="stake" data-v="${v}" class="${v === st.stake ? 'on' : ''}">${money(v)}</button>`).join('')}</div>
        <p class="p1-win">Возможный выигрыш <b>${money(st.stake * s.coef)} ₽</b></p>
        <button type="button" class="p1-btn solid" data-act="confirm">Поставить ${money(st.stake)} ₽</button>
        <button type="button" class="p1-btn plain" data-act="close">Отмена</button>`;
      sheetWrap.classList.add('on');
    }

    function render() {
      const s = st.screen;
      screen.dataset.screen = s;
      view.innerHTML = `<div class="p1-page">${SCREENS[s]()}</div>`;
      const tab = s === 'match' ? 'list' : s;
      root.querySelectorAll('.p1-nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
      renderSheet();
    }

    /* ——— Действия ——— */
    const openSheet = (title, pick, coef) => { st.sheet = { title, pick, coef }; renderSheet(); };
    const ACTIONS = {
      skip: () => go('home'),
      tab: el => { st.sheet = null; go(el.dataset.tab); },
      fighter: el => { st.fighter = el.dataset.f; render(); },
      'bet-fight': () => {
        if (!st.fighter) { toast('Сначала выберите бойца'); return; }
        const f = FIGHT[st.fighter];
        openSheet(`${FIGHT.a.name} — ${FIGHT.b.name}`, `Победа: ${f.name}`, f.coef);
      },
      open: el => { st.match = MATCHES.find(m => m.id === el.dataset.id); st.score = st.match.now ? [...st.match.now] : [3, 2]; go('match'); },
      back: () => go('list'),
      digit: el => { st.score[+el.dataset.side] = +el.dataset.d; render(); root.querySelectorAll('.p1-team b')[+el.dataset.side].classList.add('pop'); },
      'bet-score': () => {
        const m = st.match;
        openSheet(`${m.a} — ${m.b}`, `Точный счёт ${st.score.join(':')}`, coefFor(m, st.score));
      },
      stake: el => { st.stake = +el.dataset.v; renderSheet(); },
      // Фон окна закрывает его, клики внутри окна — нет
      close: (el, e) => { if (el !== sheetWrap || e.target === sheetWrap) { st.sheet = null; renderSheet(); } },
      confirm: () => {
        const s = st.sheet;
        if (st.stake > st.balance) { st.pending = s; st.sheet = null; go('broke'); return; }
        st.balance -= st.stake;
        st.week += 1;
        st.last = { title: s.title, pick: s.pick, coef: s.coef, amount: st.stake };
        st.bets.unshift(st.last);
        st.sheet = null;
        go('accepted');
      },
      topup: () => { st.balance += 5000; toast('Баланс пополнен'); st.sheet = st.pending; go(st.match ? 'match' : 'home'); },
      'back-sheet': () => { st.sheet = st.pending; go(st.match ? 'match' : 'home'); },
      claim: () => { if (!st.bonus) { st.bonus = true; st.balance += 500; toast('+500 ₽ на балансе'); render(); } },
      toast: el => toast(el.dataset.msg),
      restart: () => { reset(); render(); later(() => st.screen === 'splash' && go('home'), 1600); },
    };
    root.addEventListener('click', e => {
      const el = e.target.closest('[data-act]');
      if (!el || !root.contains(el)) return;
      const fn = ACTIONS[el.dataset.act];
      if (fn) fn(el, e);
    });

    render();
    later(() => st.screen === 'splash' && go('home'), 1600);
  }

  window.PROTOS = window.PROTOS || {};
  window.PROTOS['player-one_2'] = { mount };
})();
