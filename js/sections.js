// Section render functions. Each returns HTML; variant styling lives in css/style.css under .A / .C.

/* ---------- tiny SVG kit (from the prototype) ---------- */
const CROWN = `<svg class="crown" viewBox="0 0 64 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M5 38 L8 12 L21 25 L32 5 L43 25 L56 12 L59 38 Z" fill="#f5c542" stroke="#a87b12" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M10 20 L21 29 L32 12 L43 29 L54 20 L56 34 L8 34 Z" fill="#ffd96b" opacity=".6"/>
  <rect x="4" y="35" width="56" height="8" rx="2.5" fill="#e0ab25" stroke="#a87b12" stroke-width="2.2"/>
  <circle cx="32" cy="5" r="3.8" fill="#e53950" stroke="#a87b12"/><circle cx="8" cy="12" r="3.2" fill="#3d7bf0" stroke="#a87b12"/>
  <circle cx="56" cy="12" r="3.2" fill="#3d7bf0" stroke="#a87b12"/><circle cx="20" cy="39" r="2.4" fill="#2fbf55"/>
  <circle cx="32" cy="39" r="2.8" fill="#e53950"/><circle cx="44" cy="39" r="2.4" fill="#2fbf55"/></svg>`;
const BUS = (cls = 'bus') => `<svg class="${cls}" viewBox="0 0 170 86" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="4" y="8" width="156" height="58" rx="12" fill="#ffc928" stroke="#c98f00" stroke-width="3"/>
  <rect x="140" y="16" width="16" height="26" rx="3" fill="#bfe9ff" stroke="#c98f00" stroke-width="2"/>
  ${[14, 46, 78, 110].map((x) => `<rect x="${x}" y="16" width="26" height="20" rx="3" fill="#bfe9ff" stroke="#c98f00" stroke-width="2"/>`).join('')}
  <rect x="4" y="44" width="156" height="5" fill="#2d2a32"/><circle cx="158" cy="56" r="3" fill="#fff6c2"/>
  <circle cx="38" cy="68" r="12" fill="#2d2a32"/><circle cx="38" cy="68" r="4.5" fill="#bbb"/>
  <circle cx="128" cy="68" r="12" fill="#2d2a32"/><circle cx="128" cy="68" r="4.5" fill="#bbb"/></svg>`;
const MELON = (cls = 'melon') => `<svg class="${cls}" viewBox="0 0 60 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M2 2 A28 28 0 0 0 58 2 Z" fill="#3a9d3a"/><path d="M6 2 A24 24 0 0 0 54 2 Z" fill="#e8f5c8"/>
  <path d="M9 2 A21 21 0 0 0 51 2 Z" fill="#ff5a6e"/>
  ${[[20, 9], [30, 13], [40, 9], [25, 17], [35, 17]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.4" ry="2.2" fill="#2d2a32"/>`).join('')}</svg>`;
const BALLOON = (c, w, extra = '') => `<svg width="${w}" viewBox="0 0 40 80" ${extra} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M20 2 C8 2 2 12 2 22 C2 34 12 44 20 46 C28 44 38 34 38 22 C38 12 32 2 20 2Z" fill="${c}"/>
  <ellipse cx="13" cy="15" rx="4" ry="7.5" fill="#fff" opacity=".38" transform="rotate(-22 13 15)"/>
  <path d="M17 46 L23 46 L20 50Z" fill="${c}"/><path d="M20 50 q-5 8 0 15 q4 7 0 15" stroke="#6b6b80" fill="none" stroke-width=".9"/></svg>`;
const RAINBOW = ['#f0453a', '#ff8c2a', '#ffd23f', '#2fbf55', '#3d7bf0', '#8e44ad'];
const PARTY = ['#f0453a', '#ff8c2a', '#ffd23f', '#2fbf55', '#3d7bf0', '#8e44ad', '#ff6fb5', '#ffffff'];

let seed = 11;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

const C_ = CONTENT;
const heroImg = () => photo(C_.hero.id, { pos: C_.hero.pos, size: 'lg', eager: true, alt: `${C_.name} in front of a Happy Birthday backdrop` });
const ganeshImg = () => photo(C_.littleGanesh.id, { pos: C_.littleGanesh.pos, alt: `${C_.name} dressed as Ganesh` });
const monthId = (m) => m.id || `months/m${String(m.n).padStart(2, '0')}`;
const monthImg = (m) => photo(monthId(m), { pos: m.pos, alt: `${C_.name} at ${m.n} months`, ph: 'Coming soon' });
const monthLabel = (m) => `${m.n} month${m.n > 1 ? 's' : ''}`;

const blessingTop = () => `
  <div class="ganesh"><img src="${esc(C_.ganeshImg)}" alt="Shri Ganesh"></div>
  <div class="blessing deva">${esc(C_.blessing.top)}</div>`;

const shlokaBlock = () => `
  <div class="shloka">
    <p class="deva">${C_.blessing.shloka.map(esc).join('<br>')}</p>
    <p class="tr">${esc(C_.blessing.translation)}</p>
  </div>`;

/* ---------- Blessing + Hero, per variant ---------- */
const HERO = {
  A: () => `
    <section class="A-hero" id="hero">
      <div class="top">
        ${blessingTop()}
        <div class="lg">${ganeshImg()}</div>
        <div class="lg-cap">Our little Ganesha 🙏</div>
        ${shlokaBlock()}
        <div class="kicker">Our Little Prince</div>
      </div>
      <div class="cloud" style="width:70px;height:22px;left:8%;top:42%"></div>
      <div class="cloud" style="width:90px;height:26px;right:6%;top:46%"></div>
      <div class="arch" id="arch">
        <div class="backdrop"></div><div class="rainbow"></div>
        <div class="photo-wrap">${CROWN}${heroImg()}</div>
      </div>
      <div class="stage">
        <h1 class="sr">${esc(C_.headline)}</h1>
        <div class="marquee" aria-hidden="true">${[...C_.name.toUpperCase()].map((l) => `<span>${l}</span>`).join('')}</div>
        <div class="turns" aria-hidden="true">turns <b>1</b></div>
        ${BUS('bus')}${MELON('melon')}${MELON('melon melon2')}
        <div style="height:34px"></div>
      </div>
      <div class="info">
        <div class="pill">${esc(C_.dateText)} · 6:30 PM</div>
        <div class="venue">📍 ${esc(C_.venue.name)}</div>
        <div class="scroll-cue">Scroll</div>
      </div>
    </section>`,

  C: () => `
    <section class="C-hero" id="hero">
      ${blessingTop()}
      <div class="lg">${ganeshImg()}<div class="cap">our little Ganesha</div></div>
      ${shlokaBlock()}
      <div class="bunch">
        ${BALLOON('#ff6fb5', 58, 'style="left:22%;top:18px;transform:rotate(-14deg)"')}
        ${BALLOON('#3d7bf0', 64, 'style="left:36%;top:0;transform:rotate(-4deg)"')}
        ${BALLOON('#ffd23f', 60, 'style="left:50%;top:10px;transform:rotate(8deg)"')}
        ${BALLOON('#2fbf55', 54, 'style="left:62%;top:30px;transform:rotate(18deg)"')}
        ${BALLOON('#f0453a', 50, 'style="left:44%;top:46px;transform:rotate(2deg)"')}
      </div>
      <div class="polaroid"><div class="tape"></div>${CROWN}<div class="ph">${heroImg()}</div><div class="cap">${esc(C_.name)}</div></div>
      <h1><span class="sr">${esc(C_.headline)}</span><span aria-hidden="true">Our Little Prince<br>${esc(C_.name)} turns <em>one</em></span></h1>
      <div class="meta"><b>${esc(C_.dateText)}</b><br>${esc(C_.timeText)} · 📍 ${esc(C_.venue.name)}</div>
      <div class="scroll-cue">Scroll</div>
      <div class="hill">
        <svg class="ground" viewBox="0 0 400 130" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M0 70 Q100 20 210 60 T400 50 V130 H0Z" fill="#9ad96b"/><path d="M0 95 Q140 55 260 90 T400 85 V130 H0Z" fill="#6cc04a"/></svg>
        ${BUS('bus')}${MELON('melon')}
      </div>
    </section>`,
};

/* ---------- 12 Little Birthdays, per variant ---------- */
const MONTHS_SEC = {
  A: () => `
    <section class="A-months" id="months">
      <h2>12 Little Birthdays</h2>
      <div class="sub">Every 4th, we celebrated one more month of ${esc(C_.name)}</div>
      <div class="grid">
        ${C_.months.map((m, i) => `<div class="m" style="--c:${RAINBOW[i % 6]}">
          <div class="ball">${monthImg(m)}</div><div class="knot"></div><div class="str"></div>
          <div class="lbl">${monthLabel(m)}<small>${esc(m.date)}</small></div></div>`).join('')}
        <div class="m big" style="--c:#f5c542">
          <div class="ball"><b>1</b></div><div class="knot"></div><div class="str"></div>
          <div class="lbl">1 year!<small>4 Dec · see you there</small></div></div>
      </div>
    </section>`,

  C: () => `
    <section class="C-months" id="months">
      <h2>12 Little Birthdays</h2>
      <div class="sub">Every 4th, we celebrated one more month of ${esc(C_.name)}</div>
      <div class="hint">swipe →</div>
      <div class="line"><div class="row">
        ${C_.months.map((m, i) => `<div class="pc" style="--r:${[-3, 2, -2, 3][i % 4]}deg"><div class="peg"></div>
          <div class="ph">${monthImg(m)}</div><div class="cap">${monthLabel(m)}<small>${esc(m.date)}</small></div></div>`).join('')}
        <div class="pc big" style="--r:2deg"><div class="peg"></div><div class="ph"><b>1</b></div>
          <div class="cap">1 year!<small>4 Dec · see you there</small></div></div>
      </div></div>
    </section>`,
};

/* ---------- shared sections ---------- */
const countdownSec = () => `
  <section class="sec countdown" id="countdown">
    <h2>Counting down</h2>
    <div class="cd" data-cd>
      ${[['d', 'days'], ['h', 'hours'], ['m', 'mins'], ['s', 'secs']].map(([k, l], i) =>
        `<div class="cd-u" style="--c:${RAINBOW[[0, 4, 3, 1][i]]}"><b data-u="${k}">00</b><span>${l}</span></div>`).join('')}
    </div>
    <p class="cd-done" hidden>${esc(C_.name)} is 1! 🎉</p>
  </section>`;

const hostsSec = () => `
  <section class="sec hosts" id="hosts">
    <p class="lead">${esc(C_.hosts.lead)}</p>
    <p class="hosts-names">${esc(C_.hosts.names)}</p>
    <p>${esc(C_.hosts.line)}</p>
    <p class="star">${CROWN}${esc(C_.name)}</p>
    <h3>With love from</h3>
    <div class="family">
      ${C_.family.map((f) => `<div class="fam"><span>${esc(f.role)}</span>${esc(f.names)}</div>`).join('')}
    </div>
  </section>`;

const scheduleSec = () => `
  <section class="sec schedule" id="schedule">
    <h2>The Celebration</h2>
    <p class="date">${esc(C_.dateText)}</p>
    <ol class="timeline">
      ${C_.schedule.map((s) => `<li><div class="ic" aria-hidden="true">${s.icon}</div>
        <div><time>${esc(s.time)}</time><b>${esc(s.title)}</b><p>${esc(s.blurb)}</p></div></li>`).join('')}
    </ol>
  </section>`;

const venueSec = () => `
  <section class="sec venue" id="venue">
    <h2>Venue</h2>
    <p class="place">📍 ${esc(C_.venue.name)}</p>
    <div class="btns">
      <a class="btn" id="directions" href="${esc(C_.venue.mapUrl)}" target="_blank" rel="noopener">Get directions</a>
      <a class="btn alt" id="add-cal" href="${esc(calendarUrl())}" target="_blank" rel="noopener">Add to Google Calendar</a>
    </div>
  </section>`;

function galleryIds() {
  const used = new Set([C_.hero.id, C_.littleGanesh.id, ...C_.months.map(monthId)]);
  return (typeof PHOTOS === 'undefined' ? [] : PHOTOS).filter((p) => !used.has(p.id) && !p.id.startsWith('months/'));
}

const gallerySec = () => {
  seed = 7;
  return `
  <section class="sec gallery" id="gallery">
    <h2>Moments with ${esc(C_.name)}</h2>
    <p class="sub">Tap a photo to see it bigger</p>
    <div class="polas">
      ${galleryIds().map((p) => `<button class="pola" type="button" data-id="${esc(p.id)}"
        style="--r:${((rnd() - 0.5) * 8).toFixed(1)}deg;--y:${Math.round(rnd() * 10)}px">
        <span class="ph" style="aspect-ratio:${p.w}/${p.h}">${photo(p.id, { alt: `${C_.name}` })}</span></button>`).join('')}
    </div>
  </section>`;
};

const honeypot = `<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">`;

const rsvpSec = () => `
  <section class="sec rsvp" id="rsvp">
    <h2>Will you join us?</h2>
    <form id="rsvp-form" novalidate>
      <label class="field">Your name
        <input name="name" maxlength="60" autocomplete="name" required></label>
      <fieldset class="seg"><legend>Will you attend?</legend>
        <label><input type="radio" name="attending" value="yes" checked><span>Yes, we'll be there 🎉</span></label>
        <label><input type="radio" name="attending" value="no"><span>Sorry, can't make it</span></label>
      </fieldset>
      <div class="field guests">How many of you are coming?
        <div class="stepper">
          <button type="button" data-step="-1" aria-label="Fewer">−</button>
          <input name="guests" type="number" min="1" max="10" value="1" inputmode="numeric" aria-label="Number of guests">
          <button type="button" data-step="1" aria-label="More">+</button>
        </div>
      </div>
      ${honeypot}
      <button class="btn" type="submit">Send RSVP</button>
      <p class="msg" role="status"></p>
    </form>
    <p class="closed" hidden>RSVPs are closed. Thank you! 💛</p>
    <p class="soon" hidden>RSVP opening soon.</p>
  </section>`;

const wishesSec = () => `
  <section class="sec wishes" id="wishes">
    <h2>Wishes for ${esc(C_.name)}</h2>
    <form id="wish-form" novalidate>
      <label class="field">Your name
        <input name="name" maxlength="60" autocomplete="name" required></label>
      <label class="field">Your wish
        <textarea name="message" maxlength="500" rows="3" required placeholder="Happy 1st birthday, little prince!"></textarea>
        <small class="count">0 / 500</small></label>
      ${honeypot}
      <button class="btn" type="submit">Send wish 💌</button>
      <p class="msg" role="status"></p>
    </form>
    <p class="soon" hidden>The Wishes Wall opens soon.</p>
    <ul class="wall" aria-live="polite"></ul>
    <p class="wall-note"></p>
  </section>`;

const footerSec = () => `
  <footer class="sec footer" id="footer">
    <div class="shloka">
      <p class="deva">${esc(C_.longLife.shloka)}</p>
      <p class="tr">${esc(C_.longLife.translation)} <small>(${esc(C_.longLife.source)})</small></p>
    </div>
    <p class="gift">${esc(C_.footer.gift)} 🎁</p>
    <p>${esc(C_.footer.signoff)}</p>
    <a class="btn wa" id="share" href="${esc(shareUrl())}" target="_blank" rel="noopener">Share on WhatsApp</a>
    ${C_.ganeshImg.endsWith('ganesh-icon.svg') ? `<p class="credit">${esc(C_.ganeshCredit)}</p>` : ''}
  </footer>`;

const lightbox = () => `
  <div class="lightbox" id="lightbox" hidden role="dialog" aria-label="Photo">
    <img alt="">
    <button type="button" class="lb-x" aria-label="Close">×</button>
  </div>`;

function renderPage(variant) {
  return [HERO[variant](), MONTHS_SEC[variant](), countdownSec(), hostsSec(), scheduleSec(), venueSec(),
    gallerySec(), rsvpSec(), wishesSec(), footerSec()].join('') + lightbox();
}

/* Variant A balloon arch, sized to its box (from the prototype). */
function buildArch() {
  const box = document.getElementById('arch');
  if (!box) return;
  box.querySelectorAll('.b').forEach((n) => n.remove());
  seed = 11;
  const W = box.clientWidth, H = box.clientHeight, cx = W / 2, cy = H * 0.98, rx = W * 0.43, ry = H * 0.86, N = 26;
  let html = '';
  for (let i = 0; i <= N; i++) {
    const t = i / N, th = Math.PI * (1 - t), band = RAINBOW[Math.min(5, Math.floor(t * 6))];
    for (let k = 0; k < 3; k++) {
      const s = W * (0.085 + rnd() * 0.05);
      const x = cx + rx * Math.cos(th) + (rnd() - 0.5) * W * 0.06;
      const y = cy - ry * Math.sin(th) + (rnd() - 0.5) * W * 0.06;
      const c = rnd() < 0.25 ? '#ffffff' : band;
      html += `<div class="b" style="--c:${c};width:${s}px;height:${s * 1.05}px;left:${x}px;top:${y}px"></div>`;
    }
  }
  box.insertAdjacentHTML('beforeend', html);
}
