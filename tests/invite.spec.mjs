// Guest-level tests of the Invite page. Backend faked by intercepting script.google.com.
import { test, expect } from '@playwright/test';

const FAKE = 'https://script.google.com/macros/s/TEST/exec';
const BEFORE = new Date('2026-11-25T09:30:00Z'); // 9 d 3 h 30 m before party start
const PARTY = new Date('2026-12-04T13:00:00Z');
const CORS = { 'access-control-allow-origin': '*' };

/** Open the Invite. Options: time, backend (bool), wishes, postResult, postDelay, query, motion. */
async function open(page, { time = BEFORE, backend = true, wishes = [], postResult = { ok: true }, postDelay = 0, query = '', motion = 'reduce' } = {}) {
  await page.emulateMedia({ reducedMotion: motion });
  await page.clock.install({ time });
  if (backend) {
    await page.route('**/js/content.js', async (route) => {
      const res = await route.fetch();
      route.fulfill({ response: res, body: (await res.text()).replace("backendUrl: ''", `backendUrl: '${FAKE}'`) });
    });
  }
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

test('renders every section in order, noindex, variant A by default', async ({ page }) => {
  await open(page);
  await expect(page.locator('body')).toHaveClass(/\bA\b/);
  const ids = await page.locator('#app > section, #app > footer').evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(['hero', 'months', 'countdown', 'hosts', 'schedule', 'venue', 'gallery', 'rsvp', 'wishes', 'footer']);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('h1')).toContainText('Our Little Prince Avkrit turns 1');
  await expect(page.locator('#hero')).toContainText('श्री गणेशाय नमः');
  await expect(page.locator('#hero .shloka .tr')).toContainText('remove every obstacle');
  await expect(page.locator('#arch .b').first()).toBeAttached();
  await expect(page.locator('#hosts')).toContainText('Mr. Ashok Saxena & Mrs. Suman Saxena');
  await expect(page.locator('#hosts')).toContainText('Mr. Kritik Saxena & Mrs. Avantika Saxena');
  await expect(page.locator('.timeline li')).toHaveText([/6:30 PM.*Welcome/, /7:00 PM.*Cake Cutting/, /8:00 PM.*Dinner/]);
  await expect(page.locator('#footer')).toContainText('Your blessings are the gift');
  await expect(page.locator('#footer .deva')).toContainText('पश्येम शरदः शतं');
  await expect(page.locator('#footer .credit')).toContainText('Ameya Narvankar');
  await expect(page.locator('#switcher')).toHaveCount(0);
});

test('?variant=C switches look; unknown variant falls back to A', async ({ page }) => {
  await open(page, { query: '?variant=C' });
  await expect(page.locator('body')).toHaveClass(/\bC\b/);
  await expect(page.locator('.C-hero .polaroid')).toBeVisible();
  await expect(page.locator('.C-months .pc')).toHaveCount(12);
  await page.goto('/?variant=Z');
  await expect(page.locator('body')).toHaveClass(/\bA\b/);
  await expect(page.locator('.A-months .m')).toHaveCount(12);
});

for (const v of ['A', 'C']) {
  test(`variant ${v} fits 320px with no horizontal scroll`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await open(page, { query: `?variant=${v}` });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('intro plays, then reveals the page after ~2.6 s', async ({ page }) => {
  await open(page, { motion: 'no-preference' });
  await expect(page.locator('#intro')).toBeVisible();
  await expect(page.locator('#intro .hello')).toContainText('Avkrit turns 1');
  await page.clock.runFor(3000);
  await expect(page.locator('#intro')).toHaveCount(0);
});

test('tap skips the intro', async ({ page }) => {
  await open(page, { motion: 'no-preference' });
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

test('at party start: "Avkrit is 1!" and RSVP closes live', async ({ page }) => {
  await open(page, { time: new Date(PARTY.getTime() - 2000) });
  await expect(page.locator('#rsvp-form')).toBeVisible();
  await page.clock.runFor(3000);
  await expect(page.locator('.cd-done')).toHaveText('Avkrit is 1! 🎉');
  await expect(page.locator('[data-cd]')).toBeHidden();
  await expect(page.locator('#rsvp-form')).toBeHidden();
  await expect(page.locator('#rsvp .closed')).toBeVisible();
  await expect(page.locator('#wish-form')).toBeVisible();
});

test('after the party, RSVP is closed on load and Wishes stay open', async ({ page }) => {
  await open(page, { time: new Date('2026-12-06T09:00:00Z') });
  await expect(page.locator('.cd-done')).toBeVisible();
  await expect(page.locator('#rsvp .closed')).toBeVisible();
  await expect(page.locator('#wish-form')).toBeVisible();
});

test('RSVP: guest count only when attending; posts text/plain JSON; thanks the Guest', async ({ page }) => {
  const posts = await open(page);
  const form = page.locator('#rsvp-form');
  await form.getByLabel('Your name').fill('Asha Mehra');
  await form.getByText("Sorry, can't make it").click();
  await expect(form.locator('.guests')).toBeHidden();
  await form.getByText("Yes, we'll be there").click();
  await expect(form.locator('.guests')).toBeVisible();
  await form.getByLabel('More').click();
  await form.getByLabel('More').click();
  await page.clock.runFor(4000);
  await form.getByRole('button', { name: 'Send RSVP' }).click();
  await expect(form.locator('.msg')).toContainText('Thank you, Asha Mehra');
  expect(posts).toHaveLength(1);
  expect(posts[0].type).toMatch(/^text\/plain/);
  expect(posts[0].body).toMatchObject({ type: 'rsvp', name: 'Asha Mehra', attending: 'yes', guests: 3, website: '' });
  expect(posts[0].body.elapsed).toBeGreaterThanOrEqual(4000);
  await expect(page.locator('#wish-form [name=name]')).toHaveValue('Asha Mehra');
});

test('RSVP: guests clamp to 1-10 and no sends 0', async ({ page }) => {
  const posts = await open(page);
  const form = page.locator('#rsvp-form');
  await form.getByLabel('Your name').fill('Ravi');
  await form.getByLabel('Number of guests').fill('50');
  await form.getByLabel('Number of guests').blur();
  await expect(form.getByLabel('Number of guests')).toHaveValue('10');
  await form.getByText("Sorry, can't make it").click();
  await form.getByRole('button', { name: 'Send RSVP' }).click();
  await expect(form.locator('.msg')).toContainText("We'll miss you");
  expect(posts[0].body).toMatchObject({ attending: 'no', guests: 0 });
});

test('RSVP: refuses empty name without sending', async ({ page }) => {
  const posts = await open(page);
  await page.locator('#rsvp-form').getByRole('button', { name: 'Send RSVP' }).click();
  await expect(page.locator('#rsvp-form .msg')).toHaveText('Please enter your name.');
  expect(posts).toHaveLength(0);
});

test('RSVP: server error keeps inputs and shows the error', async ({ page }) => {
  await open(page, { postResult: { ok: false, err: 'rate' } });
  const form = page.locator('#rsvp-form');
  await form.getByLabel('Your name').fill('Asha');
  await form.getByRole('button', { name: 'Send RSVP' }).click();
  await expect(form.locator('.msg')).toHaveText('Please wait a few seconds and try again.');
  await expect(form.getByLabel('Your name')).toHaveValue('Asha');
});

test('RSVP: server "closed" switches to closed state', async ({ page }) => {
  await open(page, { postResult: { ok: false, err: 'closed' } });
  await page.locator('#rsvp-form').getByLabel('Your name').fill('Asha');
  await page.locator('#rsvp-form').getByRole('button', { name: 'Send RSVP' }).click();
  await expect(page.locator('#rsvp .closed')).toBeVisible();
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
  expect(posts[0].body).toMatchObject({ type: 'wish', name: 'Chhotu', message: evil, website: '' });
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

test('without a backend URL, RSVP and Wishes say "opening soon"', async ({ page }) => {
  await open(page, { backend: false });
  await expect(page.locator('#rsvp .soon')).toBeVisible();
  await expect(page.locator('#rsvp-form')).toBeHidden();
  await expect(page.locator('#wishes .soon')).toBeVisible();
  await expect(page.locator('#wish-form')).toBeHidden();
});

test('12 Little Birthdays: 11 months + party tile; missing months show "Coming soon"', async ({ page }) => {
  await open(page);
  await expect(page.locator('#months .m')).toHaveCount(12);
  await expect(page.locator('#months .photo-ph')).toHaveCount(3);
  await expect(page.locator('#months .photo-ph').first()).toContainText('Coming soon');
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

test('venue, calendar and WhatsApp share links', async ({ page }) => {
  await open(page);
  await expect(page.locator('#directions')).toHaveAttribute('href', 'https://maps.app.goo.gl/F8G3ykAbDrE7Ar128');
  await expect(page.locator('#venue iframe')).toHaveCount(0);
  const cal = await page.locator('#add-cal').getAttribute('href');
  expect(cal).toContain('calendar.google.com/calendar/render');
  expect(cal).toContain('dates=20261204T130000Z%2F20261204T163000Z');
  expect(cal).toContain('Evergreen+Compound');
  const share = await page.locator('#share').getAttribute('href');
  expect(share).toMatch(/^https:\/\/wa\.me\/\?text=/);
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
  expect(errors).toEqual([]);
});
