// Helpers shared by sections and app: clock, HTML escaping, photos, backend client.

const PAGE_LOADED_AT = Date.now();
const PARTY_START_MS = Date.parse(CONTENT.partyStart);
const PARTY_END_MS = Date.parse(CONTENT.partyEnd);

// The one clock. Everything time-dependent reads it here.
const now = () => Date.now();
const partyStarted = () => now() >= PARTY_START_MS;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- photos ---------- */
const PHOTO_IDS = new Set((typeof PHOTOS === 'undefined' ? [] : PHOTOS).map((p) => p.id));
const photoSrc = (id, size = 'sm') => `assets/photos/${size}/${id.split('/').map(encodeURIComponent).join('/')}.jpg`;
const placeholder = (label = 'Photo coming') => `<div class="photo-ph"><div><span>📷</span>${esc(label)}</div></div>`;

function photo(id, { pos = '50% 50%', alt = CONTENT.name, size = 'sm', eager = false, ph = 'Photo coming' } = {}) {
  if (!id || !PHOTO_IDS.has(id)) return placeholder(ph);
  return `<img class="photo" style="object-position:${esc(pos)}" src="${photoSrc(id, size)}" data-ph="${esc(ph)}"
    alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

// A photo that fails to load turns into its placeholder.
document.addEventListener('error', (e) => {
  const el = e.target;
  if (el instanceof HTMLImageElement && el.classList.contains('photo')) el.outerHTML = placeholder(el.dataset.ph);
}, true);

/* ---------- links ---------- */
const gcalStamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function calendarUrl() {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${CONTENT.name}'s 1st Birthday`,
    dates: `${gcalStamp(PARTY_START_MS)}/${gcalStamp(PARTY_END_MS)}`,
    details: `${CONTENT.headline}! Welcome 6:30 PM · Cake Cutting 7:00 PM · Dinner 8:00 PM.\n${CONTENT.siteUrl}`,
    location: `${CONTENT.venue.name}, ${CONTENT.venue.mapUrl}`,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

const shareUrl = () =>
  `https://wa.me/?text=${encodeURIComponent(`${CONTENT.headline}! 🎈 ${CONTENT.dateText}, ${CONTENT.timeText}.\n${CONTENT.siteUrl}`)}`;

/* ---------- backend client (Apps Script web app) ---------- */
const backendReady = () => /^https:\/\/script\.google\.com\/.+\/exec$/.test(CONTENT.backendUrl);

// POST as text/plain so the browser sends no CORS preflight (Apps Script can't answer OPTIONS).
async function apiPost(body) {
  const init = {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...body, elapsed: now() - PAGE_LOADED_AT }),
    credentials: 'omit',
  };
  try {
    const res = await fetch(CONTENT.backendUrl, init);
    return await res.json();
  } catch (_) {
    // Response unreadable (CORS) or network down. Retry blind; success means the row landed.
    try {
      await fetch(CONTENT.backendUrl, { ...init, mode: 'no-cors' });
      return { ok: true, unverified: true };
    } catch (_) {
      return { ok: false, err: 'network' };
    }
  }
}

async function apiGetWishes() {
  try {
    const res = await fetch(CONTENT.backendUrl, { credentials: 'omit' });
    return await res.json();
  } catch (_) {
    return jsonp();
  }
}

// Fallback read via <script> tag if fetch can't read the response.
function jsonp() {
  return new Promise((resolve) => {
    const cb = `__wishes${Math.floor(Math.random() * 1e9)}`;
    const s = document.createElement('script');
    const done = (data) => { clearTimeout(t); delete window[cb]; s.remove(); resolve(data); };
    const t = setTimeout(() => done({ ok: false, err: 'network' }), 10000);
    window[cb] = (data) => done(data);
    s.onerror = () => done({ ok: false, err: 'network' });
    s.src = `${CONTENT.backendUrl}?callback=${cb}`;
    document.head.appendChild(s);
  });
}

const ERRORS = {
  name: 'Please enter your name.',
  message: 'Please write a wish.',
  rate: 'Please wait a few seconds and try again.',
  busy: 'Lots of messages right now! Try again in a moment.',
  closed: 'RSVPs are closed.',
  network: "Couldn't send. Check your connection and try again.",
};
const errorText = (err) => ERRORS[err] || ERRORS.network;
