// Theme R: Royal Prince. Velvet-and-gold hero with a crowned portrait, months as a royal portrait hall.

HERO.R = () => `
  <section class="R-hero" id="hero" data-zoom-group>
    ${TORAN()}
    <i class="drape l" aria-hidden="true"></i><i class="drape r" aria-hidden="true"></i>
    <div class="h-left">
      ${blessingTop()}
      <div class="lg"${zoom(C_.littleGanesh.id, 'Our little Ganesha')}>${ganeshImg()}</div>
      <div class="lg-cap">Our little Ganesha 🙏</div>
      ${shlokaBlock()}
    </div>
    <div class="h-right">
      <p class="herald">By royal decree</p>
      <div class="frame">
        ${CROWN}
        <div class="ring"><div class="portrait"${zoom(C_.hero.id, C_.name)}>${heroImg()}</div></div>
        <div class="plaque">His Royal Cuteness</div>
      </div>
      <h1><span class="sr">${esc(C_.headline)}</span><span class="h1v" aria-hidden="true">
        <small>Our Little Prince</small><span class="nm">${esc(C_.name)}</span><em>turns One</em></span></h1>
      ${slogan('hero') ? `<p class="tagline">${esc(slogan('hero'))}</p>` : ''}
      <div class="decree"><b>${esc(C_.dateText)}</b><br>${esc(C_.timeText)} · 📍 ${esc(C_.venue.name)}</div>
      <div class="scroll-cue">Scroll</div>
    </div>
  </section>`;

MONTHS_SEC.R = () => `
  <section class="R-months" id="months">
    ${slogan('months') ? eyebrow(slogan('months')) : ''}
    <h2>12 Little Birthdays</h2>
    <div class="sub">Every 4th, we celebrated one more month of ${esc(C_.name)}</div>
    <div class="hall" data-zoom-group>
      ${C_.months.map((m) => `<figure class="rp">
        <div class="fr"><div class="ph"${monthZoom(m)}>${monthImg(m)}</div></div>
        <figcaption><b>${monthLabel(m)}</b><small>${esc(m.date)}</small>${tag(m.tag)}</figcaption></figure>`).join('')}
      <figure class="rp big">
        <div class="fr"><div class="ph">${CROWN}<b>1</b></div></div>
        <figcaption><b>1 year!</b><small>4 Dec · see you there</small>${tag(slogan('yearTile'))}</figcaption></figure>
    </div>
    ${firstYear()}
  </section>`;

// Footer: a crown in place of the party balloons.
THEME_INIT.R = () => {
  const fb = document.querySelector('#footer .f-balloons');
  if (fb) fb.innerHTML = CROWN;
};
