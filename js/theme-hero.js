// Superhero theme (S): comic-book pop art. Registers HERO.S, MONTHS_SEC.S and THEME_INIT.S; styles in css/theme-hero.css.
(() => {
  const INK = '#111';

  // Points of a star burst in a 100x100 box; `jag` shortens every other tip so it looks hand-inked.
  const starPts = (n, R, r, jag = 0) => Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const d = i % 2 ? r : R - (i % 4 ? 0 : jag);
    return `${(50 + d * Math.cos(a)).toFixed(1)},${(50 + d * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  const starSvg = (cls, n, R, r, jag = 0, sw = 2.5) => `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">
    <polygon points="${starPts(n, R, r, jag)}" fill="currentColor" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/></svg>`;
  // Comic sound effect: a jagged burst with a word on it.
  const burst = (word, cls) => `<span class="burst ${cls}" aria-hidden="true">${starSvg('', 11, 47, 31, 6)}<b>${word}</b></span>`;

  // Original chest emblem: shield with an "A".
  const EMBLEM = `<svg class="emblem" viewBox="0 0 100 112" aria-hidden="true">
    <path d="M50 5 L92 19 Q93 72 50 107 Q7 72 8 19 Z" fill="#ffd23f" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M50 17 L81 27 Q81 67 50 94 Q19 67 19 27 Z" fill="#e11d2a"/>
    <text x="50" y="79" text-anchor="middle" font-family="Bangers, Fredoka, sans-serif" font-size="60" fill="#ffd23f"
      stroke="${INK}" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round">${esc(C_.name[0])}</text></svg>`;

  // Little cape flowing out behind the photo.
  const CAPE = `<svg class="cape" viewBox="0 0 200 200" aria-hidden="true">
    <path d="M62 96 C50 136 46 166 40 194 Q66 180 90 192 Q112 176 136 186 Q158 168 182 172 Q176 152 196 136 Q182 124 198 102 Q172 112 150 100 C140 94 132 90 124 88 Z"
      fill="#e11d2a" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M86 150 C80 164 74 176 70 186 M124 146 C128 158 132 168 134 180 M150 128 C162 136 172 146 180 160" stroke="#a30d18" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;

  // Night-time city skyline for the footer, wide enough to slice for any screen.
  const SKYLINE = () => {
    let x = 0, i = 0, out = '';
    while (x < 1200) {
      const w = 26 + ((i * 37) % 30), h = 46 + ((i * 53) % 84), y = 150 - h;
      out += `<rect x="${x}" y="${y}" width="${w}" height="${h + 2}" fill="#081849"/>`;
      if (i % 5 === 2) out += `<rect x="${x + w / 2 - 1.5}" y="${y - 14}" width="3" height="14" fill="#081849"/>`;
      for (let wy = y + 8; wy < 140; wy += 12) {
        for (let wx = x + 5; wx + 4 <= x + w - 5; wx += 9) {
          if ((wx * 7 + wy * 3 + i) % 5 < 2) out += `<rect x="${wx}" y="${wy}" width="4" height="6" fill="#ffd23f" opacity=".8"/>`;
        }
      }
      x += w + 2;
      i++;
    }
    return `<svg class="S-sky" viewBox="0 0 1200 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${out}</svg>`;
  };

  HERO.S = () => `
    <section class="S-hero" id="hero" data-zoom-group>
      ${TORAN()}
      <div class="h-left">
        <div class="bless">
          ${blessingTop()}
          <div class="lg"${zoom(C_.littleGanesh.id, 'Our little Ganesha')}>${ganeshImg()}</div>
          <div class="lg-cap">Our little Ganesha 🙏</div>
          ${shlokaBlock()}
        </div>
      </div>
      <div class="h-right">
        <div class="panel">
          <p class="cap-box" aria-hidden="true">Meanwhile, 365 days later…</p>
          <div class="frame">
            ${starSvg('star', 16, 49, 40, 3, 2)}
            ${CAPE}
            <div class="ph"${zoom(C_.hero.id, C_.name)}>${heroImg()}</div>
            ${EMBLEM}
          </div>
          ${burst('POW!', 'b1')}${burst('ZOOM!', 'b2')}
        </div>
        <h1><span class="sr">${esc(C_.headline)}</span><span class="h1v" aria-hidden="true"><span class="k">Our Little Superhero</span>
          <span class="nm">${esc(C_.name)}</span><span class="tn">turns <em>1</em>!</span></span></h1>
        ${slogan('hero') ? `<p class="tagline">${esc(slogan('hero'))}</p>` : ''}
        <div class="meta"><b>${esc(C_.dateText)}</b><span>${esc(C_.timeText)} · 📍 ${esc(C_.venue.name)}</span></div>
        <div class="scroll-cue">Scroll</div>
      </div>
    </section>`;

  const TILT = [-1.5, 1.2, -0.8, 1.6, -1.2, 0.8];
  const DOTS = ['#cfe3ff', '#ffe1e1', '#fff0b3'];
  MONTHS_SEC.S = () => `
    <section class="S-months" id="months">
      ${slogan('months') ? eyebrow(slogan('months')) : ''}
      <h2>12 Little Birthdays</h2>
      <div class="sub">Every 4th, we celebrated one more month of ${esc(C_.name)}</div>
      <div class="strip" data-zoom-group>
        ${C_.months.map((m, i) => `<div class="m" style="--r:${TILT[i % 6]}deg;--d:${DOTS[i % 3]}">
          <div class="ph"${monthZoom(m)}>${monthImg(m)}</div>
          <b class="cap">${monthLabel(m)}</b>
          <div class="lbl"><small>${esc(m.date)}</small>${tag(m.tag)}</div></div>`).join('')}
        <div class="m big" style="--r:1.5deg">
          <div class="ph">${starSvg('star', 12, 47, 32, 5, 3)}<b aria-hidden="true">1</b></div>
          <b class="cap">1 year!</b>
          <div class="lbl"><small>4 Dec · see you there</small>${tag(slogan('yearTile'))}</div></div>
      </div>
      ${firstYear()}
    </section>`;

  THEME_INIT.S = () => {
    const f = document.getElementById('footer');
    if (f) f.insertAdjacentHTML('beforeend', SKYLINE());
  };
})();
