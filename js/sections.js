// Section render functions. Each returns HTML; variant styling lives in css/style.css under .A / .C.
// Extra themes (R, S) add their HERO / MONTHS_SEC entries and CSS from js/theme-*.js and css/theme-*.css.

// Every theme the picker offers. A theme shows only once its HERO and MONTHS_SEC entries exist.
const THEMES = {
  A: { name: 'Balloon Arch', icon: '🎈' },
  C: { name: 'Storybook Polaroid', icon: '📸' },
  R: { name: 'Royal Prince', icon: '👑' },
  S: { name: 'Superhero', icon: '🦸' },
};
// Optional per-theme setup run after render (e.g. build decorations sized to the screen).
const THEME_INIT = {};

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
// Marigold toran (door garland): swags of genda flowers with mango leaves and bells.
const GARLAND = () => {
  const W = 400, N = 4, sw = W / N, sag = 13;
  let str = '', leaves = '', flowers = '', bells = '';
  for (let i = 0; i < N; i++) {
    const x0 = i * sw, x1 = x0 + sw;
    str += `<path d="M${x0} 5 Q${x0 + sw / 2} ${5 + 2 * sag} ${x1} 5" fill="none" stroke="#8a5a00" stroke-width="1.2"/>`;
    for (let k = 0; k < 8; k++) {
      const t = (k + 0.5) / 8, x = x0 + t * sw, y = 5 + 4 * sag * t * (1 - t);
      if (k % 2) leaves += `<ellipse cx="${x.toFixed(1)}" cy="${(y + 10).toFixed(1)}" rx="3.2" ry="8" fill="${k % 4 === 1 ? '#3a9d3a' : '#5cb338'}" transform="rotate(${(t - 0.5) * 30} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
      const [c, d] = k % 2 ? ['#ffc21a', '#e89b00'] : ['#ff8c1a', '#d95f00'];
      flowers += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="7" fill="${c}"/><circle r="5.6" fill="none" stroke="${d}" stroke-width="2.4" stroke-dasharray="1.8 1.4"/><circle r="2" fill="${d}"/></g>`;
    }
  }
  for (let i = 0; i <= N; i++) {
    const x = Math.min(W - 6, Math.max(6, i * sw));
    bells += `<path d="M${x} 4 V28" stroke="#c98f00" stroke-width="1.2"/><circle cx="${x}" cy="8" r="6" fill="#e53950"/><path d="M${x - 5} 36 Q${x} 22 ${x + 5} 36Z" fill="#f5c542" stroke="#a87b12" stroke-width="1"/><circle cx="${x}" cy="37.5" r="1.6" fill="#a87b12"/>`;
  }
  return `<svg class="toran" viewBox="0 0 ${W} 46" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${str}${leaves}${flowers}${bells}</svg>`;
};
// Two garlands side by side; the second only shows on wide screens so the toran stays short.
const TORAN = () => `<div class="torans">${GARLAND()}${GARLAND()}</div>`;

const RAINBOW = ['#f0453a', '#ff8c2a', '#ffd23f', '#2fbf55', '#3d7bf0', '#8e44ad'];
const PARTY = ['#f0453a', '#ff8c2a', '#ffd23f', '#2fbf55', '#3d7bf0', '#8e44ad', '#ff6fb5', '#ffffff'];
const STAR = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="#ffc928"/><circle cx="12" cy="12" r="2.4" fill="#fff"/></svg>`;

let seed = 11;
const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

/* Fixed party backdrop the glass cards float over: balloon-colour orbs, confetti, sparkles, drifting balloons. */
function partyBackdrop() {
  seed = 21;
  const pct = () => (rnd() * 100).toFixed(1);
  const PASTEL = ['#ff8fab', '#ffd166', '#7cc8ff', '#ffb38a', '#c3a6ff', '#8be0b4'];
  const orbs = [[6, 10, 48], [92, 6, 40], [84, 46, 54], [4, 58, 46], [58, 92, 50], [34, 30, 30], [98, 86, 36]]
    .map(([x, y, s], i) => `<i class="orb" style="left:${x}%;top:${y}%;--s:${s}vmax;--c:${PASTEL[i % 6]}"></i>`).join('');
  const confetti = Array.from({ length: 46 }, () => {
    const w = 4 + rnd() * 6, dot = rnd() < 0.35;
    return `<i class="cf" style="left:${pct()}%;top:${pct()}%;width:${w.toFixed(1)}px;height:${(dot ? w : w * 2.2).toFixed(1)}px;`
      + `background:${PARTY[Math.floor(rnd() * 7)]};border-radius:${dot ? '50%' : '1px'};rotate:${Math.round(rnd() * 360)}deg"></i>`;
  }).join('');
  const sparkles = Array.from({ length: 12 }, () =>
    `<i class="tw" style="left:${pct()}%;top:${pct()}%;--w:${Math.round(10 + rnd() * 14)}px;--d:${(2 + rnd() * 3).toFixed(1)}s">${STAR}</i>`).join('');
  const balloons = Array.from({ length: 6 }, (_, i) =>
    `<div class="fb" style="left:${(4 + i * 16 + rnd() * 6).toFixed(1)}%;--d:${(24 + rnd() * 14).toFixed(1)}s;--delay:${(-rnd() * 34).toFixed(1)}s">`
    + `${BALLOON(PARTY[(i * 3) % 7], Math.round(34 + rnd() * 24))}</div>`).join('');
  return `<div class="party-bg" aria-hidden="true">${orbs}${confetti}${sparkles}${balloons}</div>`;
}

const C_ = CONTENT;
const heroImg = () => photo(C_.hero.id, { pos: C_.hero.pos, size: 'lg', eager: true, alt: `${C_.name} in front of a Happy Birthday backdrop` });
const ganeshImg = () => photo(C_.littleGanesh.id, { pos: C_.littleGanesh.pos, alt: `${C_.name} dressed as Ganesh` });
const monthId = (m) => m.id || `months/m${String(m.n).padStart(2, '0')}`;
const monthImg = (m) => photo(monthId(m), { pos: m.pos, alt: `${C_.name} at ${m.n} months`, ph: 'Coming soon' });
const monthLabel = (m) => `${m.n} month${m.n > 1 ? 's' : ''}`;
// Marks a photo box as tap-to-enlarge (opens the lightbox). Nothing for missing photos.
const zoom = (id, cap, btn = false) => (id && PHOTO_IDS.has(id)
  ? ` data-zoom="${esc(id)}" data-cap="${esc(cap)}"${btn ? '' : ` role="button" tabindex="0" aria-label="Enlarge photo: ${esc(cap)}"`}` : '');
const monthZoom = (m) => zoom(monthId(m), `${monthLabel(m)} · ${m.date}`);
const tag = (t) => (t ? `<em class="tag">${esc(t)}</em>` : '');
const slogan = (k) => (C_.slogans && C_.slogans[k]) || '';
const subLine = (k) => (slogan(k) ? `<p class="sub slogan">${esc(slogan(k))}</p>` : '');

// Scrolling band of catchy lines. List is doubled so the loop is seamless.
const ribbon = (items, cls = '') => (items && items.length ? `
  <div class="ribbon ${cls}" aria-hidden="true"><div class="rb-track">
    ${[...items, ...items].map((t) => `<span>${esc(t)}</span>`).join('')}
  </div></div>` : '');

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
    <section class="A-hero" id="hero" data-zoom-group>
      ${TORAN()}
      <div class="top">
        ${blessingTop()}
        <div class="lg"${zoom(C_.littleGanesh.id, 'Our little Ganesha')}>${ganeshImg()}</div>
        <div class="lg-cap">Our little Ganesha 🙏</div>
        ${shlokaBlock()}
        <div class="kicker">Our Little Prince</div>
      </div>
      <div class="cloud" style="width:70px;height:22px;left:8%;top:42%"></div>
      <div class="cloud" style="width:90px;height:26px;right:6%;top:46%"></div>
      <div class="arch" id="arch">
        <div class="backdrop"></div><div class="rainbow"></div>
        <div class="photo-wrap"${zoom(C_.hero.id, C_.name)}>${CROWN}${heroImg()}</div>
      </div>
      <div class="stage">
        <h1 class="sr">${esc(C_.headline)}</h1>
        <div class="marquee" aria-hidden="true">${[...C_.name.toUpperCase()].map((l, i) => `<span style="--i:${i}">${l}</span>`).join('')}</div>
        <div class="turns" aria-hidden="true">turns <b>1</b></div>
        ${BUS('bus')}${MELON('melon')}${MELON('melon melon2')}
        <div style="height:34px"></div>
      </div>
      <div class="info">
        ${slogan('hero') ? `<p class="tagline">${esc(slogan('hero'))}</p>` : ''}
        <div class="pill">${esc(C_.dateText)} · 6:30 PM</div>
        <div class="venue">📍 ${esc(C_.venue.name)}</div>
        <div class="scroll-cue">Scroll</div>
      </div>
    </section>`,

  C: () => `
    <section class="C-hero" id="hero" data-zoom-group>
      ${TORAN()}
      <div class="h-left">
      ${blessingTop()}
      <div class="lg"${zoom(C_.littleGanesh.id, 'Our little Ganesha')}>${ganeshImg()}<div class="cap">our little Ganesha</div></div>
      ${shlokaBlock()}
      </div>
      <div class="h-right">
      <div class="bunch">
        ${BALLOON('#ff6fb5', 58, 'style="left:22%;top:18px;transform:rotate(-14deg)"')}
        ${BALLOON('#3d7bf0', 64, 'style="left:36%;top:0;transform:rotate(-4deg)"')}
        ${BALLOON('#ffd23f', 60, 'style="left:50%;top:10px;transform:rotate(8deg)"')}
        ${BALLOON('#2fbf55', 54, 'style="left:62%;top:30px;transform:rotate(18deg)"')}
        ${BALLOON('#f0453a', 50, 'style="left:44%;top:46px;transform:rotate(2deg)"')}
      </div>
      <div class="polaroid"><div class="tape"></div>${CROWN}<div class="ph"${zoom(C_.hero.id, C_.name)}>${heroImg()}</div><div class="cap">${esc(C_.name)}</div></div>
      <h1><span class="sr">${esc(C_.headline)}</span><span aria-hidden="true">Our Little Prince<br>${esc(C_.name)} turns <em>one</em></span></h1>
      ${slogan('hero') ? `<p class="tagline">${esc(slogan('hero'))}</p>` : ''}
      <div class="meta"><b>${esc(C_.dateText)}</b><br>${esc(C_.timeText)} · 📍 ${esc(C_.venue.name)}</div>
      <div class="scroll-cue">Scroll</div>
      </div>
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
      ${slogan('months') ? eyebrow(slogan('months')) : ''}
      <h2>12 Little Birthdays</h2>
      <div class="sub">Every 4th, we celebrated one more month of ${esc(C_.name)}</div>
      <div class="grid" data-zoom-group>
        ${C_.months.map((m, i) => `<div class="m" style="--c:${RAINBOW[i % 6]}">
          <div class="ball"${monthZoom(m)}>${monthImg(m)}</div><div class="knot"></div><div class="str"></div>
          <div class="lbl">${monthLabel(m)}<small>${esc(m.date)}</small>${tag(m.tag)}</div></div>`).join('')}
        <div class="m big" style="--c:#f5c542">
          <div class="ball"><b>1</b></div><div class="knot"></div><div class="str"></div>
          <div class="lbl">1 year!<small>4 Dec · see you there</small>${tag(slogan('yearTile'))}</div></div>
      </div>
      ${firstYear()}
    </section>`,

  C: () => `
    <section class="C-months" id="months">
      ${slogan('months') ? eyebrow(slogan('months')) : ''}
      <h2>12 Little Birthdays</h2>
      <div class="sub">Every 4th, we celebrated one more month of ${esc(C_.name)}</div>
      <div class="hint">swipe →</div>
      <div class="line"><div class="row" data-zoom-group>
        ${C_.months.map((m, i) => `<div class="slot"><div class="pc" style="--r:${[-3, 2, -2, 3][i % 4]}deg"><div class="peg"></div>
          <div class="ph"${monthZoom(m)}>${monthImg(m)}</div><div class="cap">${monthLabel(m)}<small>${esc(m.date)}</small>${tag(m.tag)}</div></div></div>`).join('')}
        <div class="slot"><div class="pc big" style="--r:2deg"><div class="peg"></div><div class="ph"><b>1</b></div>
          <div class="cap">1 year!<small>4 Dec · see you there</small>${tag(slogan('yearTile'))}</div></div></div>
      </div></div>
      ${firstYear()}
    </section>`,
};

/* ---------- shared sections ---------- */
const eyebrow = (t) => `<p class="eyebrow">${esc(t)}</p>`;

const firstYear = () => `
  <div class="first-year">
    <h3>${esc(C_.name)}'s first year in numbers</h3>
    <div class="stats">
      ${C_.firstYear.map((f) => `<div class="stat"><span aria-hidden="true">${f.icon || ''}</span><b>${esc(f.value)}</b><small>${esc(f.label)}</small></div>`).join('')}
    </div>
  </div>`;

// Party date parts in IST, for the ticket stub.
const partyParts = () => {
  const d = new Date(PARTY_START_MS + 5.5 * 3600e3);
  return { wd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()], d: d.getUTCDate(), mo: MONTHS3[d.getUTCMonth()], y: d.getUTCFullYear() };
};
const countdownSec = () => `
  <section class="sec countdown" id="countdown">
    ${eyebrow('Save the date')}
    <h2>Counting down</h2>
    ${subLine('countdown')}
    <div class="cd" data-cd>
      ${[['d', 'days'], ['h', 'hours'], ['m', 'mins'], ['s', 'secs']].map(([k, l], i) =>
        `<div class="cd-u" style="--c:${RAINBOW[[0, 4, 3, 1][i]]}"><b data-u="${k}">00</b><span>${l}</span></div>`).join('')}
    </div>
    <p class="cd-done" hidden>${esc(C_.name)} is 1! 🎉</p>
    <div class="yr" aria-hidden="true">
      <div class="yr-bar"><i data-yr></i><span class="yr-cake">🎂</span></div>
      <div class="yr-ends"><span>Born · 4 Dec 2025</span><span>1st birthday</span></div>
    </div>
    <p class="cd-note" data-age></p>
  </section>`;

const hostsSec = () => `
  <section class="sec hosts" id="hosts">
   <div class="invite-card">
    ${eyebrow("You're invited")}
    <p class="lead">${esc(C_.hosts.lead)}</p>
    <p class="hosts-names">${esc(C_.hosts.names)}</p>
    <p>${esc(C_.hosts.line)}</p>
    <p class="star">${CROWN}<span class="foil">${esc(C_.name)}</span></p>
    <h3>With love from</h3>
    <div class="family">
      ${C_.family.map((f) => `<div class="fam"><span>${esc(f.role)}</span>${esc(f.names)}</div>`).join('')}
    </div>
   </div>
  </section>`;

const scheduleSec = () => `
  <section class="sec schedule" id="schedule">
    ${eyebrow('Order of the evening')}
    <h2>The Celebration</h2>
    ${subLine('schedule')}
    <p class="date">${esc(C_.dateText)}</p>
    <ol class="timeline">
      ${C_.schedule.map((s) => `<li><div class="ic" aria-hidden="true">${s.icon}</div>
        <div><time>${esc(s.time)}</time><b>${esc(s.title)}</b><p>${esc(s.blurb)}</p></div></li>`).join('')}
    </ol>
  </section>`;

const venueSec = () => `
  <section class="sec venue" id="venue">
    ${eyebrow('Where to find us')}
    <h2>Venue</h2>
    ${(() => { const p = partyParts(); return `<div class="ticket">
      <div class="stub"><span>${p.wd}</span><b>${p.d}</b><span>${p.mo} ${p.y}</span></div>
      <div class="tk-body"><small>Admit</small><b class="tk-who">You &amp; your family</b>
        <p>🕡 ${esc(C_.timeText)}</p><p class="place">📍 ${esc(C_.venue.name)}</p></div>
    </div>`; })()}
    <div class="btns">
      <a class="btn" id="directions" href="${esc(C_.venue.mapUrl)}" target="_blank" rel="noopener">Get directions</a>
      <a class="btn alt" id="add-cal" href="${esc(calendarUrl())}" target="_blank" rel="noopener">Add to Google Calendar</a>
    </div>
  </section>`;

function galleryIds() {
  const used = new Set([C_.hero.id, C_.littleGanesh.id, ...C_.months.map(monthId)]);
  const key = (p) => { const t = photoDate(p.id); return t ? t.y * 1e4 + t.mo * 100 + t.d : 0; }; // undated first
  return (typeof PHOTOS === 'undefined' ? [] : PHOTOS)
    .filter((p) => !used.has(p.id) && !p.id.startsWith('months/'))
    .sort((a, b) => key(a) - key(b));
}

const gallerySec = () => {
  seed = 7;
  return `
  <section class="sec gallery" id="gallery">
    ${eyebrow('Our favourite memories')}
    <h2>Moments with ${esc(C_.name)}</h2>
    ${subLine('gallery')}
    <p class="sub">Tap a photo to see it bigger</p>
    <div class="polas" data-zoom-group>
      ${galleryIds().map((p) => {
        const cap = photoCaption(p.id);
        return `<button class="pola" type="button" data-id="${esc(p.id)}"${zoom(p.id, cap ? `${cap.date} · ${cap.age}` : C_.name, true)}
        style="--r:${((rnd() - 0.5) * 8).toFixed(1)}deg;--y:${Math.round(rnd() * 10)}px;--tr:${((rnd() - 0.5) * 16).toFixed(1)}deg;--tc:${['#ffe58a', '#ffc2d9', '#bfe6ff', '#c8f0b0'][Math.floor(rnd() * 4)]}">
        <span class="tape" aria-hidden="true"></span>
        <span class="ph" style="aspect-ratio:${p.w}/${p.h}">${photo(p.id, { alt: cap ? `${C_.name}, ${cap.date}` : C_.name })}</span>
        ${cap ? `<span class="cap">${esc(cap.date)}<small>${esc(cap.age)}</small></span>` : ''}</button>`;
      }).join('')}
    </div>
  </section>`;
};

const honeypot = `<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">`;

const wishesSec = () => `
  <section class="sec wishes" id="wishes">
    ${eyebrow('Leave a blessing')}
    <h2>Wishes for ${esc(C_.name)}</h2>
    ${subLine('wishes')}
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
    <div class="board">
      <div class="board-head"><span class="board-title">Wishes Wall</span></div>
      <ul class="wall" aria-live="polite"></ul>
      <p class="wall-note"></p>
      <nav class="pager" aria-label="Wishes pages" hidden>
        <button type="button" class="pg-prev">‹ Newer</button><span class="pg-info"></span><button type="button" class="pg-next">Older ›</button>
      </nav>
    </div>
  </section>`;

const footerSec = () => `
  <footer class="sec footer" id="footer">
    <div class="f-balloons">${BALLOON('#ff6fb5', 40, 'style="transform:rotate(-12deg)"')}${BALLOON('#ffd23f', 50)}${BALLOON('#3d7bf0', 42, 'style="transform:rotate(12deg)"')}</div>
    <div class="shloka">
      <p class="deva">${esc(C_.longLife.shloka)}</p>
      <p class="tr">${esc(C_.longLife.translation)} <small>(${esc(C_.longLife.source)})</small></p>
    </div>
    <p class="gift">${esc(C_.footer.gift)} 🎁</p>
    <p class="signoff">${esc(C_.footer.signoff)}</p>
    <a class="btn wa" id="share" href="${esc(shareUrl())}" target="_blank" rel="noopener">Share on WhatsApp</a>
    ${C_.ganeshImg.endsWith('ganesh-icon.svg') && C_.ganeshCredit ? `<p class="credit">${esc(C_.ganeshCredit)}</p>` : ''}
  </footer>`;

const lightbox = () => `
  <div class="lightbox" id="lightbox" hidden role="dialog" aria-label="Photo">
    <figure><img alt=""><figcaption></figcaption></figure>
    <button type="button" class="lb-x" aria-label="Close">×</button>
    <button type="button" class="lb-nav prev" aria-label="Previous photo">‹</button>
    <button type="button" class="lb-nav next" aria-label="Next photo">›</button>
  </div>`;

// Quick actions pinned to the bottom once the hero scrolls away.
const dock = () => `
  <nav class="dock" aria-label="Quick actions">
    <a href="#wishes"><span aria-hidden="true">💌</span>Wish</a>
    <a href="${esc(C_.venue.mapUrl)}" target="_blank" rel="noopener"><span aria-hidden="true">📍</span>Directions</a>
    <a href="${esc(calendarUrl())}" target="_blank" rel="noopener"><span aria-hidden="true">📅</span>Calendar</a>
  </nav>`;

function renderPage(variant) {
  return [HERO[variant](), ribbon(C_.ribbon), MONTHS_SEC[variant](), countdownSec(), hostsSec(), scheduleSec(), venueSec(),
    ribbon(C_.ribbon2, 'rev'), gallerySec(), wishesSec(), footerSec()].join('') + lightbox() + dock();
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
      html += `<div class="b" style="--k:${(rnd() * 3).toFixed(2)};--c:${c};width:${s}px;height:${s * 1.05}px;left:${x}px;top:${y}px"></div>`;
    }
  }
  box.insertAdjacentHTML('beforeend', html);
}
