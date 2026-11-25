// Guest-level tests of the Invite page. Backend faked by intercepting script.google.com.
import { test, expect } from '@playwright/test';

const FAKE = 'https://script.google.com/macros/s/TEST/exec';
const BEFORE = new Date('2026-11-25T09:30:00Z'); // 9 d 3 h 30 m before party start
const PARTY = new Date('2026-12-04T13:00:00Z');
const CORS = { 'access-control-allow-origin': '*' };

/** Open the Invite. Options: time, backend (bool), wishes, postResult, postDelay, query, motion, frozen (clock moves only via runFor). */
async function open(page, { time = BEFORE, backend = true, wishes = [], postResult = { ok: true }, postDelay = 0, query = '', motion = 'reduce', frozen = false } = {}) {
  await page.emulateMedia({ reducedMotion: motion });
  await page.clock.install({ time });
  if (frozen) await page.clock.pauseAt(time);
  await page.route('**/js/content.js', async (route) => {
    const res = await route.fetch();
    route.fulfill({ response: res, body: (await res.text()).replace(/backendUrl: '[^']*'/, `backendUrl: '${backend ? FAKE : ''}'`) });
  });
  const posts = [];
  await page.route('https://script.google.com/**', async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      posts.push({ body: JSON.parse(req.postData()), type: req.headers()['content-type'] });
      if (postDelay) await new Promise((r) => setTimeout(r, postDelay));
      return route.fulfill({ json: typeof postResult === 'function' ? postResult() : postResult, headers: CORS });
    }
    return route.fulfill({ json: { ok: true, wishes }, headers: CORS });
  });
  await page.goto(`/${query}`);
  return posts;
}

test('renders every section in order, noindex, Superhero (S) by default', async ({ page }) => {
  await open(page);
  await expect(page.locator('body')).toHaveClass(/\bS\b/);
  const ids = await page.locator('#app > section, #app > footer').evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(['hero', 'months', 'countdown', 'hosts', 'schedule', 'venue', 'gallery', 'wishes', 'footer']);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('h1')).toContainText('Our Little Prince Avkrit turns 1');
  await expect(page.locator('#hero')).toContainText('श्री गणेशाय नमः');
  await expect(page.locator('#hero .shloka .tr')).toContainText('remove every obstacle');
  await expect(page.locator('#hosts')).toContainText('Mr. Ashok Saxena & Mrs. Suman Saxena');
  await expect(page.locator('#hosts')).toContainText('Mr. Kritik Saxena & Mrs. Avantika Saxena');
  await expect(page.locator('.timeline li')).toHaveText([/6:30 PM.*Welcome/, /7:00 PM.*Cake Cutting/, /8:00 PM.*Dinner/]);
  await expect(page.locator('#footer')).toContainText('Your blessings are the gift');
  await expect(page.locator('#footer .deva')).toContainText('पश्येम शरदः शतं');
  await expect(page.locator('#switcher')).toHaveCount(0);
});

test('?variant=C switches look; ?theme=A shows the arch; unknown variant falls back to S', async ({ page }) => {
  await open(page, { query: '?variant=C' });
  await expect(page.locator('body')).toHaveClass(/\bC\b/);
  await expect(page.locator('.C-hero .polaroid')).toBeVisible();
  await expect(page.locator('.C-months .pc')).toHaveCount(12);
  await page.goto('/?theme=A');
  await expect(page.locator('#arch .b').first()).toBeAttached();
  await page.goto('/?variant=Z');
  await expect(page.locator('body')).toHaveClass(/\bS\b/);
  await expect(page.locator('.S-months .m')).toHaveCount(12);
});

for (const v of ['R', 'S']) {
  test(`?theme=${v} renders its own hero and 12 month tiles`, async ({ page }) => {
    await open(page, { query: `?theme=${v}` });
    await expect(page.locator('body')).toHaveClass(new RegExp(`\\b${v}\\b`));
    await expect(page.locator(`.${v}-hero`)).toBeVisible();
    await expect(page.locator('h1')).toContainText('Our Little Prince Avkrit turns 1');
    await expect(page.locator('#hero .shloka .tr')).toContainText('remove every obstacle');
    await expect(page.locator('#months .tag')).toHaveCount(12);
  });
}

test('theme picker lists all four themes and switches by reloading with ?theme=', async ({ page }) => {
  await open(page);
  const sel = page.locator('#theme-pick select');
  await expect(sel.locator('option')).toHaveText([/Balloon Arch/, /Storybook Polaroid/, /Royal Prince/, /Superhero/]);
  await sel.selectOption('R');
  await expect(page).toHaveURL(/theme=R/);
  await expect(page.locator('body')).toHaveClass(/\bR\b/);
  await expect(page.locator('#theme-pick select')).toHaveValue('R');
});

for (const v of ['A', 'C', 'R', 'S']) {
  test(`variant ${v} fits 320px with no horizontal scroll`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await open(page, { query: `?variant=${v}` });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

for (const v of ['A', 'C', 'R', 'S']) {
  test(`variant ${v} on a 1366px laptop: wide page, 2-column hero, months fit without side-scroll`, async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await open(page, { query: `?variant=${v}` });
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      pageW: document.querySelector('.page').clientWidth,
      heroCols: getComputedStyle(document.querySelector('#hero')).gridTemplateColumns.split(' ').length,
      line: (() => { const l = document.querySelector('.C-months .line'); return l ? l.scrollWidth - l.clientWidth : 0; })(),
    }));
    expect(r.overflow).toBeLessThanOrEqual(0);
    expect(r.pageW).toBeGreaterThan(1000);
    expect(r.heroCols).toBe(2);
    expect(r.line).toBeLessThanOrEqual(0);
  });
}

test('slogans: ribbons, hero tagline and month tags come from content', async ({ page }) => {
  await open(page);
  await expect(page.locator('.ribbon')).toHaveCount(2);
  await expect(page.locator('.ribbon').first()).toContainText('Four generations, one cake');
  await expect(page.locator('#hero .tagline')).toHaveText('One year old, four generations proud');
  await expect(page.locator('#months .eyebrow')).toHaveText('A new photo every 4th');
  await expect(page.locator('#months .tag')).toHaveCount(12);
});

test('intro: envelope opens, then reveals the page after ~3.3 s', async ({ page }) => {
  await open(page, { motion: 'no-preference', frozen: true });
  await expect(page.locator('#intro')).toBeVisible();
  await expect(page.locator('#intro .env-card')).toContainText('Avkrit turns 1');
  await expect(page.locator('#intro .env-seal')).toBeAttached();
  await page.clock.runFor(4000);
  await expect(page.locator('#intro')).toHaveCount(0);
});

test('tap skips the intro', async ({ page }) => {
  await open(page, { motion: 'no-preference', frozen: true });
  await page.locator('#intro').dispatchEvent('pointerdown');
  await page.clock.runFor(400);
  await expect(page.locator('#intro')).toHaveCount(0);
});

test('reduced motion skips the intro', async ({ page }) => {
  await open(page);
  await expect(page.locator('#intro')).toHaveCount(0);
});

// Simulate a browser that blocks autoplay: first play() rejects, later ones succeed.
const countPlays = (page) => page.addInitScript(() => {
  window.__plays = 0;
  HTMLMediaElement.prototype.play = function () {
    window.__plays++;
    return window.__plays === 1 ? Promise.reject(new DOMException('blocked', 'NotAllowedError')) : Promise.resolve();
  };
});

test('music: blocked autoplay starts on first tap; no controls', async ({ page }) => {
  await page.route('**/assets/audio/theme.mp3', (r) => r.fulfill({ path: 'tests/fixtures/silence.mp3', contentType: 'audio/mpeg' }));
  await countPlays(page);
  await open(page);
  await expect.poll(() => page.evaluate(() => window.__plays)).toBe(1);
  await page.locator('#hosts').click();
  await expect.poll(() => page.evaluate(() => window.__plays)).toBe(2);
  await expect(page.locator('audio, [aria-label*=mute i], .mute, .play')).toHaveCount(0);
});

test('music: missing clip stays silent', async ({ page }) => {
  await page.route('**/assets/audio/theme.mp3', (r) => r.fulfill({ status: 404, body: '' }));
  await countPlays(page);
  await open(page);
  await page.waitForTimeout(300);
  await page.locator('#hosts').click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__plays)).toBe(1);
});

test('countdown counts to 4 Dec 6:30 pm IST', async ({ page }) => {
  await open(page);
  await expect(page.locator('[data-u=d]')).toHaveText('09');
  await expect(page.locator('[data-u=h]')).toHaveText('03');
  await expect(page.locator('.cd-done')).toBeHidden();
});

test('at party start: "Avkrit is 1!" live; Wishes stay open', async ({ page }) => {
  await open(page, { time: new Date(PARTY.getTime() - 2000), frozen: true });
  await expect(page.locator('[data-cd]')).toBeVisible();
  await page.clock.runFor(3000);
  await expect(page.locator('.cd-done')).toHaveText('Avkrit is 1! 🎉');
  await expect(page.locator('[data-cd]')).toBeHidden();
  await expect(page.locator('#wish-form')).toBeVisible();
});

test('after the party, "Avkrit is 1!" on load and Wishes stay open', async ({ page }) => {
  await open(page, { time: new Date('2026-12-06T09:00:00Z') });
  await expect(page.locator('.cd-done')).toBeVisible();
  await expect(page.locator('#wish-form')).toBeVisible();
});

test('no RSVP section or RSVP button', async ({ page }) => {
  await open(page);
  await expect(page.locator('#rsvp, #rsvp-form, a[href="#rsvp"]')).toHaveCount(0);
  await expect(page.locator('.dock a').first()).toHaveAttribute('href', '#wishes');
});

test('Wish: refuses empty name without sending', async ({ page }) => {
  const posts = await open(page);
  await page.locator('#wish-form').getByLabel('Your wish').fill('Hi');
  await page.locator('#wish-form').getByRole('button', { name: /Send wish/ }).click();
  await expect(page.locator('#wish-form .msg')).toHaveText('Please enter your name.');
  expect(posts).toHaveLength(0);
});

test('Wishes Wall loads newest-first from the server', async ({ page }) => {
  await open(page, { wishes: [
    { ts: '2026-11-24T10:00:00Z', name: 'Nani', message: 'Bless you, beta' },
    { ts: '2026-11-23T10:00:00Z', name: 'Mama', message: 'Happy birthday!' },
  ] });
  await expect(page.locator('.wall .wish')).toHaveCount(2);
  await expect(page.locator('.wall .wish').first()).toContainText('Bless you, beta');
  await expect(page.locator('.wall .wish').first()).toContainText('Nani');
});

test('Wishes Wall: 5 per page, no total count; new wish jumps to page 1', async ({ page }) => {
  const wishes = Array.from({ length: 12 }, (_, i) => ({ name: `Guest ${i + 1}`, message: `Wish ${i + 1}`, ts: Date.parse('2026-11-01') - i * 864e5 }));
  await open(page, { wishes, postDelay: 300 });
  const pager = page.locator('#wishes .pager');
  await expect(page.locator('.wall .wish')).toHaveCount(5);
  await expect(page.locator('#wishes')).not.toContainText('12 wishes');
  await expect(pager.locator('.pg-info')).toHaveText('Page 1 of 3');
  await expect(pager.getByRole('button', { name: /Newer/ })).toBeDisabled();
  await pager.getByRole('button', { name: /Older/ }).click();
  await pager.getByRole('button', { name: /Older/ }).click();
  await expect(pager.locator('.pg-info')).toHaveText('Page 3 of 3');
  await expect(page.locator('.wall .wish')).toHaveCount(2);
  await expect(page.locator('.wall .wish').first()).toContainText('Wish 11');
  await expect(pager.getByRole('button', { name: /Older/ })).toBeDisabled();
  const form = page.locator('#wish-form');
  await form.getByLabel('Your name').fill('Dadi');
  await form.getByLabel('Your wish').fill('Jeete raho');
  await form.getByRole('button', { name: /Send wish/ }).click();
  await expect(pager.locator('.pg-info')).toHaveText('Page 1 of 3');
  await expect(page.locator('.wall .wish').first()).toContainText('Jeete raho');
});

test('Wish shows instantly, as plain text, before the server confirms', async ({ page }) => {
  const posts = await open(page, { postDelay: 1500 });
  await expect(page.locator('.wall-note')).toHaveText('Be the first to leave a wish 💌');
  const evil = '<img src=x onerror="window.__pwned=1">';
  const form = page.locator('#wish-form');
  await form.getByLabel('Your name').fill('Chhotu');
  await form.getByLabel('Your wish').fill(evil);
  await expect(form.locator('.count')).toHaveText(`${evil.length} / 500`);
  await form.getByRole('button', { name: /Send wish/ }).click();
  const card = page.locator('.wall .wish').first();
  await expect(card).toHaveClass(/pending/);
  await expect(card.locator('p')).toHaveText(evil);
  await expect(card).not.toHaveClass(/pending/);
  await expect(form.locator('.msg')).toContainText('Thank you for your wish');
  expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
  expect(posts[0].type).toMatch(/^text\/plain/);
  expect(posts[0].body).toMatchObject({ type: 'wish', name: 'Chhotu', message: evil, website: '' });
  expect(posts[0].body.elapsed).toBeGreaterThanOrEqual(0);
});

test('Wish failure rolls back the card and restores the message', async ({ page }) => {
  await open(page, { postResult: { ok: false, err: 'busy' } });
  const form = page.locator('#wish-form');
  await form.getByLabel('Your name').fill('Chhotu');
  await form.getByLabel('Your wish').fill('Many happy returns');
  await form.getByRole('button', { name: /Send wish/ }).click();
  await expect(form.locator('.msg')).toHaveText('Lots of messages right now! Try again in a moment.');
  await expect(page.locator('.wall .wish')).toHaveCount(0);
  await expect(form.getByLabel('Your wish')).toHaveValue('Many happy returns');
});

test('Wish needs a message', async ({ page }) => {
  const posts = await open(page);
  await page.locator('#wish-form').getByLabel('Your name').fill('A');
  await page.locator('#wish-form').getByRole('button', { name: /Send wish/ }).click();
  await expect(page.locator('#wish-form .msg')).toHaveText('Please write a wish.');
  expect(posts).toHaveLength(0);
});

test('without a backend URL, Wishes say "opening soon"', async ({ page }) => {
  await open(page, { backend: false });
  await expect(page.locator('#wishes .soon')).toBeVisible();
  await expect(page.locator('#wish-form')).toBeHidden();
});

test('12 Little Birthdays: 11 month photos + party tile', async ({ page }) => {
  await open(page);
  await expect(page.locator('#months .m')).toHaveCount(12);
  await expect(page.locator('#months .photo-ph')).toHaveCount(0);
  await expect(page.locator('#months .big')).toContainText('1 year!');
});

test('gallery: tap enlarges; tap, Esc and back close', async ({ page }) => {
  await open(page);
  const lb = page.locator('#lightbox');
  const first = page.locator('.pola').first();
  expect(await page.locator('.pola').count()).toBeGreaterThan(20);
  await first.click();
  await expect(lb).toBeVisible();
  await expect(lb.locator('img')).toHaveAttribute('src', /assets\/photos\/lg\//);
  await page.keyboard.press('Escape');
  await expect(lb).toBeHidden();
  await first.click();
  await page.goBack();
  await expect(lb).toBeHidden();
  await first.click();
  await lb.click();
  await expect(lb).toBeHidden();
  await expect(page).toHaveURL(/localhost:4173\/$/);
});

test('month photos enlarge and browse only months', async ({ page }) => {
  await open(page);
  const lb = page.locator('#lightbox');
  await page.locator('#months [data-zoom]').first().click();
  await expect(lb).toBeVisible();
  await expect(lb.locator('img')).toHaveAttribute('src', /assets\/photos\/lg\//);
  await expect(lb.locator('figcaption')).toContainText('1 month · 4 Jan');
  await expect(lb.locator('figcaption')).toContainText('1 / 11');
  await page.keyboard.press('ArrowLeft');
  await expect(lb.locator('figcaption')).toContainText('11 months');
  await page.keyboard.press('Escape');
  await expect(lb).toBeHidden();
});

test('venue, calendar and WhatsApp share links', async ({ page }) => {
  await open(page);
  await expect(page.locator('#directions')).toHaveAttribute('href', 'https://maps.app.goo.gl/F8G3ykAbDrE7Ar128');
  await expect(page.locator('#venue iframe')).toHaveCount(0);
  const cal = await page.locator('#add-cal').getAttribute('href');
  expect(cal).toContain('calendar.google.com/calendar/render');
  expect(cal).toContain('dates=20261204T130000Z%2F20261204T163000Z');
  expect(cal).toContain('Evergreen+Compound');
  const share = await page.locator('#share').getAttribute('href');
  expect(share).toMatch(/^https:\/\/api\.whatsapp\.com\/send\?text=/);
  expect(decodeURIComponent(share)).toContain('https://s-ritik.github.io/avkrit-first-birthday/');
});

test('WhatsApp preview card tags point at the hero image', async ({ page }) => {
  await open(page);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Our Little Prince Avkrit turns 1');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://s-ritik.github.io/avkrit-first-birthday/assets/og.jpg');
});

test('no page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await open(page, { motion: 'no-preference', query: '?variant=C' });
  await page.clock.runFor(3000);
  await page.goto('/?variant=A');
  await page.clock.runFor(3000);
  for (const t of ['R', 'S']) {
    await page.goto(`/?theme=${t}`);
    await page.clock.runFor(3000);
  }
  expect(errors).toEqual([]);
});
