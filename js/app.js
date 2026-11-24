// Boots the Invite: variant, intro, music, countdown, Wishes Wall, gallery lightbox.

const params = new URLSearchParams(location.search);
// ?theme= (or legacy ?variant=) picks a theme; unknown or unbuilt falls back to CONTENT.theme, then A.
const themeOk = (k) => !!(k && THEMES[k] && HERO[k] && MONTHS_SEC[k]);
const VARIANT = [params.get('theme'), params.get('variant'), CONTENT.theme, 'A'].find(themeOk);
const $ = (sel, root = document) => root.querySelector(sel);

function boot() {
  document.body.classList.add(VARIANT);
  document.body.insertAdjacentHTML('afterbegin', partyBackdrop());
  $('#app').innerHTML = renderPage(VARIANT);
  if (VARIANT === 'A') {
    requestAnimationFrame(buildArch);
    let w = innerWidth;
    addEventListener('resize', () => { if (innerWidth !== w) { w = innerWidth; buildArch(); } });
  }
  if (THEME_INIT[VARIANT]) THEME_INIT[VARIANT]();
  if (CONTENT.themePicker) initThemePicker();
  let skipIntro = false;
  try { skipIntro = sessionStorage.getItem('skipIntro') === '1'; sessionStorage.removeItem('skipIntro'); } catch (_) {}
  if (!skipIntro && !matchMedia('(prefers-reduced-motion: reduce)').matches) playIntro();
  startMusic();
  startCountdown();
  initWishes();
  initLightbox();
  initDock();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) initReveal();
}

/* ---------- theme picker: preview each theme; reloads with ?theme=X and skips the intro ---------- */
function initThemePicker() {
  const opts = Object.entries(THEMES).filter(([k]) => themeOk(k));
  document.body.insertAdjacentHTML('beforeend', `
    <label class="theme-pick" id="theme-pick"><span aria-hidden="true">🎨</span><span class="sr">Theme</span>
      <select>${opts.map(([k, t]) => `<option value="${k}"${k === VARIANT ? ' selected' : ''}>${esc(t.icon)} ${esc(t.name)}</option>`).join('')}</select>
    </label>`);
  $('#theme-pick select').addEventListener('change', (e) => {
    const p = new URLSearchParams(location.search);
    p.delete('variant');
    p.set('theme', e.target.value);
    try { sessionStorage.setItem('skipIntro', '1'); } catch (_) {}
    location.search = p.toString();
  });
}

/* ---------- scroll reveal: cards rise in as they enter the screen ---------- */
function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll('.sec h2, .eyebrow, .cd-u, .invite-card, .timeline li, .ticket, .pola, .A-months .m, .C-months .pc, .R-months .rp, .S-months .m,.stat, .wish, .yr');
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach((el, i) => { el.classList.add('rv'); el.style.setProperty('--rd', `${(i % 3) * 70}ms`); io.observe(el); });
}

/* ---------- dock: show quick actions after the hero, hide over the footer ---------- */
function initDock() {
  const dock = $('.dock');
  if (!dock || !('IntersectionObserver' in window)) return;
  const seen = { hero: true, footer: false };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { seen[e.target.id] = e.isIntersecting; });
    dock.classList.toggle('show', !seen.hero && !seen.footer);
  });
  io.observe($('#hero'));
  io.observe($('#footer'));
}

/* ---------- intro: an envelope opens, the invitation card slides out, balloons fly off ---------- */
function playIntro() {
  const el = document.createElement('div');
  el.id = 'intro';
  seed = 3;
  el.innerHTML = `<div class="bg"></div>` + Array.from({ length: 34 }, () => {
    const w = 54 + rnd() * 44, x = rnd() * 100, y = 8 + rnd() * 95;
    return `<div class="ib" style="left:calc(${x}% - ${w / 2}px);top:${y}%;--d:${1.5 + rnd() * 0.8}s;--delay:${1.5 + rnd() * 0.6}s;--rot:${(rnd() - 0.5) * 40}deg">${BALLOON(PARTY[Math.floor(rnd() * 7)], w)}</div>`;
  }).join('') + `
    <div class="hello"><div class="env">
      <div class="env-back"></div>
      <div class="env-card">${CROWN}<div class="t">${esc(CONTENT.name)} turns 1</div><div class="s">You're invited!</div></div>
      <div class="env-front"></div><div class="env-flap"></div>
      <div class="env-seal">${esc(CONTENT.name[0])}</div>
    </div></div>
    <div class="skip">tap to skip</div>`;
  document.body.appendChild(el);
  let timer;
  const done = () => {
    clearTimeout(timer);
    el.classList.add('out');
    setTimeout(() => el.remove(), 350);
  };
  timer = setTimeout(done, 3300);
  el.addEventListener('pointerdown', done, { once: true });
}

/* ---------- music: autoplay, else first tap/key; no controls ---------- */
function startMusic() {
  const audio = new Audio();
  audio.loop = !!CONTENT.music.loop;
  audio.preload = 'auto';
  let broken = false, wanted = true;
  audio.addEventListener('error', () => { broken = true; });
  audio.src = CONTENT.music.src;

  const gestures = ['pointerdown', 'keydown', 'touchstart'];
  const onGesture = () => { gestures.forEach((g) => removeEventListener(g, onGesture, true)); tryPlay(false); };
  function tryPlay(armOnBlock) {
    if (broken || document.hidden) return;
    const p = audio.play();
    if (p && p.catch) {
      p.catch((e) => {
        if (armOnBlock && e && e.name === 'NotAllowedError') gestures.forEach((g) => addEventListener(g, onGesture, true));
      });
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { wanted = !audio.paused; audio.pause(); }
    else if (wanted && audio.currentTime > 0) tryPlay(false);
  });
  tryPlay(true);
}

/* ---------- countdown ---------- */
function startCountdown() {
  const pad = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const left = PARTY_START_MS - now();
    const days = daysOld();
    $('[data-yr]').style.width = `${Math.min(100, Math.max(0, ((now() - BORN_MS) / (PARTY_START_MS - BORN_MS)) * 100)).toFixed(2)}%`;
    if (left <= 0) {
      $('[data-age]').textContent = '';
      $('[data-cd]').hidden = true;
      $('.cd-done').hidden = false;
      clearInterval(iv);
      return;
    }
    const s = Math.floor(left / 1000);
    const parts = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
    for (const [k, v] of Object.entries(parts)) $(`[data-u="${k}"]`).textContent = pad(v);
    const sleeps = parts.d + (parts.h || parts.m || parts.s ? 1 : 0);
    $('[data-age]').innerHTML = `${esc(CONTENT.name)} is <b>${days}</b> days old · just <b>${sleeps}</b> sleep${sleeps === 1 ? '' : 's'} to go!`;
  };
  const iv = setInterval(tick, 1000);
  tick();
}

/* ---------- forms ---------- */
function say(form, text, kind = '') {
  const m = $('.msg', form);
  m.textContent = text;
  m.className = `msg ${kind}`;
}

function busy(form, on) {
  const b = $('button[type=submit]', form);
  b.disabled = on;
  form.classList.toggle('sending', on);
}

/* ---------- Wishes Wall ---------- */
const fmtDate = (ts) => {
  const d = new Date(ts);
  return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const WISH_STICKERS = ['🎈', '🎂', '💛', '🧸', '🌟', '🎁', '🍰', '🦋', '🌈', '👑'];
// Same name + message always gets the same tilt and sticker, so a pending card keeps its look.
// Card colour cycles by position (CSS nth-child), so neighbours always differ.
const hashStr = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.codePointAt(0)) >>> 0, 7);

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

// textContent only: Wishes are user input.
function wishCard({ name, message, ts }, pending = false) {
  const h = hashStr(name + message);
  const li = el('li', pending ? 'wish pending' : 'wish');
  li.style.setProperty('--tilt', `${(((h >>> 3) % 5) - 2) * 0.7}deg`);

  const ava = el('span', 'w-ava', ([...name.trim()][0] || '♥').toUpperCase());
  ava.setAttribute('aria-hidden', 'true');
  const stk = el('span', 'w-stk', WISH_STICKERS[(h >>> 5) % WISH_STICKERS.length]);
  stk.setAttribute('aria-hidden', 'true');

  const body = el('div', 'w-body');
  const by = el('div', 'by');
  by.append('— ', el('b', '', name), ' ', el('span', '', pending ? 'sending…' : fmtDate(ts)));
  body.append(el('p', '', message), by);

  li.append(ava, body, stk);
  return li;
}

function initWishes() {
  const sec = $('#wishes');
  const form = $('#wish-form', sec);
  const wall = $('.wall', sec);
  const note = $('.wall-note', sec);
  const countEl = $('.board-count', sec);
  const setCount = () => {
    const n = wall.children.length;
    countEl.textContent = n ? `${n} ${n === 1 ? 'wish' : 'wishes'}` : '';
  };
  if (!backendReady()) { form.hidden = true; $('.board', sec).hidden = true; $('.soon', sec).hidden = false; return; }

  const msg = form.elements.message;
  const count = $('.count', form);
  msg.addEventListener('input', () => { count.textContent = `${msg.value.length} / 500`; });

  note.textContent = 'Loading wishes…';
  apiGetWishes().then((res) => {
    if (!res || !res.ok) { note.textContent = "Couldn't load wishes right now."; return; }
    const pending = [...wall.children];
    wall.replaceChildren(...pending, ...res.wishes.map((w) => wishCard(w)));
    note.textContent = wall.children.length ? '' : 'Be the first to leave a wish 💌';
    setCount();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    const message = msg.value.trim();
    if (!name) { say(form, ERRORS.name, 'err'); form.elements.name.focus(); return; }
    if (!message) { say(form, ERRORS.message, 'err'); msg.focus(); return; }

    // Show it on the wall instantly; roll back if the server refuses.
    const card = wishCard({ name, message }, true);
    wall.prepend(card);
    note.textContent = '';
    msg.value = '';
    count.textContent = '0 / 500';
    busy(form, true);
    say(form, '');
    const res = await apiPost({ type: 'wish', name, message, website: form.elements.website.value });
    busy(form, false);
    if (res.ok) {
      card.classList.remove('pending');
      $('.by span', card).textContent = fmtDate(now());
      say(form, 'Thank you for your wish! 💛', 'ok');
      setCount();
    } else {
      card.remove();
      msg.value = message;
      count.textContent = `${message.length} / 500`;
      say(form, errorText(res.err), 'err');
    }
  });
}

/* ---------- lightbox: tap any [data-zoom] photo; ‹ › / arrows / swipe browse its group; close on tap, Esc or back ---------- */
function initLightbox() {
  const lb = $('#lightbox');
  const img = $('img', lb);
  const cap = $('figcaption', lb);
  let group = [], at = 0;
  // Only boxes whose photo actually loaded (a failed one becomes a placeholder).
  const zoomable = (root) => [...root.querySelectorAll('[data-zoom]')].filter((el) => el.querySelector('img.photo'));
  const hide = () => { lb.hidden = true; img.removeAttribute('src'); };
  const close = () => { if (!lb.hidden) history.state && history.state.lb ? history.back() : hide(); };
  const show = (i) => {
    at = (i + group.length) % group.length;
    const el = group[at], label = el.dataset.cap || CONTENT.name;
    img.src = photoSrc(el.dataset.zoom, 'lg');
    img.alt = `${CONTENT.name}, ${label}`;
    cap.textContent = group.length > 1 ? `${label}   ${at + 1} / ${group.length}` : label;
    lb.classList.toggle('single', group.length < 2);
  };
  const open = (el) => {
    if (!el || !el.querySelector('img.photo')) return;
    group = zoomable(el.closest('[data-zoom-group]') || document);
    show(group.indexOf(el));
    lb.hidden = false;
    history.pushState({ lb: 1 }, '');
  };

  $('#app').addEventListener('click', (e) => open(e.target.closest('[data-zoom]')));
  $('#app').addEventListener('keydown', (e) => {
    const el = e.target.closest('[data-zoom][role=button]');
    if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(el); }
  });
  lb.addEventListener('click', (e) => {
    const nav = e.target.closest('.lb-nav');
    if (nav) return show(at + (nav.classList.contains('next') ? 1 : -1));
    close();
  });
  let x0 = null;
  lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) { e.preventDefault(); show(at + (dx < 0 ? 1 : -1)); }
  });
  addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(at + 1);
    else if (e.key === 'ArrowLeft') show(at - 1);
  });
  addEventListener('popstate', () => { if (!lb.hidden) hide(); });
}

boot();
