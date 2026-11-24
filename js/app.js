// Boots the Invite: variant, intro, music, countdown, Wishes Wall, gallery lightbox.

const params = new URLSearchParams(location.search);
const VARIANT = params.get('variant') === 'C' ? 'C' : 'A';
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
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) playIntro();
  startMusic();
  startCountdown();
  initWishes();
  initLightbox();
  initDock();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) initReveal();
}

/* ---------- scroll reveal: cards rise in as they enter the screen ---------- */
function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll('.sec h2, .eyebrow, .cd-u, .invite-card, .timeline li, .ticket, .pola, .A-months .m, .C-months .pc, .stat, .wish, .yr');
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

// textContent only: Wishes are user input.
function wishCard({ name, message, ts }, pending = false) {
  const li = document.createElement('li');
  li.className = pending ? 'wish pending' : 'wish';
  const p = document.createElement('p');
  p.textContent = message;
  const by = document.createElement('div');
  by.className = 'by';
  const b = document.createElement('b');
  b.textContent = name;
  const t = document.createElement('span');
  t.textContent = pending ? 'sending…' : fmtDate(ts);
  by.append('— ', b, ' ', t);
  li.append(p, by);
  return li;
}

function initWishes() {
  const sec = $('#wishes');
  const form = $('#wish-form', sec);
  const wall = $('.wall', sec);
  const note = $('.wall-note', sec);
  if (!backendReady()) { form.hidden = true; $('.soon', sec).hidden = false; return; }

  const msg = form.elements.message;
  const count = $('.count', form);
  msg.addEventListener('input', () => { count.textContent = `${msg.value.length} / 500`; });

  note.textContent = 'Loading wishes…';
  apiGetWishes().then((res) => {
    if (!res || !res.ok) { note.textContent = "Couldn't load wishes right now."; return; }
    const pending = [...wall.children];
    wall.replaceChildren(...pending, ...res.wishes.map((w) => wishCard(w)));
    note.textContent = wall.children.length ? '' : 'Be the first to leave a wish 💌';
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
