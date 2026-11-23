// Runs backend/Code.gs in Node with fake SpreadsheetApp, LockService, CacheService, ContentService.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const CODE = readFileSync(new URL('../backend/Code.gs', import.meta.url), 'utf8');
const BEFORE = Date.UTC(2026, 10, 25); // 25 Nov 2026
const PARTY = Date.UTC(2026, 11, 4, 13, 0, 0);

let ctx, sheets, cache, lockFree;

function fakeSheet(name) {
  const rows = [];
  return {
    rows,
    appendRow: (r) => rows.push([...r]), // copy: vm arrays fail deepEqual across realms
    setFrozenRows: () => {},
    getDataRange: () => ({ getValues: () => rows.map((r) => [...r]) }),
    name,
  };
}

beforeEach(() => {
  sheets = {};
  cache = new Map();
  lockFree = true;
  ctx = vm.createContext({
    SpreadsheetApp: {
      getActive: () => ({
        getSheetByName: (n) => sheets[n] || null,
        insertSheet: (n) => (sheets[n] = fakeSheet(n)),
      }),
      flush: () => {},
    },
    LockService: { getScriptLock: () => ({ tryLock: () => lockFree, releaseLock: () => {} }) },
    CacheService: { getScriptCache: () => ({ get: (k) => cache.get(k) ?? null, put: (k, v) => cache.set(k, v) }) },
    ContentService: {
      MimeType: { JSON: 'json', JAVASCRIPT: 'js' },
      createTextOutput: (s) => ({ body: s, mime: null, setMimeType(m) { this.mime = m; return this; } }),
    },
  });
  vm.runInContext(CODE, ctx);
  ctx.now = () => BEFORE;
});

const post = (d) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(d) } }).body);
const get = (parameter = {}) => ctx.doGet({ parameter });
const rsvp = (o = {}) => post({ type: 'rsvp', name: 'Asha', attending: 'yes', guests: 3, website: '', elapsed: 9000, ...o });
const wish = (o = {}) => post({ type: 'wish', name: 'Asha', message: 'Happy birthday!', website: '', elapsed: 9000, ...o });
const data = (tab) => sheets[tab].rows.slice(1);

test('creates tabs with headers and appends rows', () => {
  assert.deepEqual(rsvp(), { ok: true });
  assert.deepEqual(wish(), { ok: true });
  assert.deepEqual(sheets.RSVP.rows[0], ['ts', 'name', 'attending', 'guests']);
  assert.deepEqual(sheets.Wishes.rows[0], ['ts', 'name', 'message']);
  assert.deepEqual(data('RSVP')[0].slice(1), ['Asha', 'yes', 3]);
  assert.deepEqual(data('Wishes')[0].slice(1), ['Asha', 'Happy birthday!']);
});

test('honeypot and time trap drop silently', () => {
  assert.deepEqual(wish({ website: 'http://spam' }), { ok: true });
  assert.deepEqual(wish({ elapsed: 1200 }), { ok: true });
  assert.deepEqual(wish({ elapsed: undefined }), { ok: true });
  assert.equal(sheets.Wishes, undefined);
});

test('rejects bad json, type, empty name and empty message', () => {
  assert.equal(JSON.parse(ctx.doPost({ postData: { contents: '{nope' } }).body).err, 'json');
  assert.equal(post({ type: 'x', name: 'A', elapsed: 9000 }).err, 'type');
  assert.equal(wish({ name: '   ' }).err, 'name');
  assert.equal(wish({ message: ' \n ' }).err, 'message');
});

test('caps name 60, message 500, guests 1-10 when yes, 0 when no', () => {
  wish({ name: 'n'.repeat(80), message: 'm'.repeat(900) });
  const [, n, m] = data('Wishes')[0];
  assert.equal(n.length, 60);
  assert.equal(m.length, 500);
  rsvp({ name: 'A', guests: 99 });
  rsvp({ name: 'B', guests: -4 });
  rsvp({ name: 'C', guests: 'abc' });
  rsvp({ name: 'D', attending: 'no', guests: 5 });
  rsvp({ name: 'E', attending: 'maybe' });
  assert.deepEqual(data('RSVP').map((r) => [r[2], r[3]]), [['yes', 10], ['yes', 1], ['yes', 1], ['no', 0], ['no', 0]]);
});

test('rate-limits one post per name per type for 30 s', () => {
  assert.ok(wish().ok);
  assert.equal(wish({ name: 'ASHA' }).err, 'rate');
  assert.ok(rsvp().ok, 'RSVP right after a Wish is allowed');
  assert.ok(wish({ name: 'Ravi' }).ok);
  assert.equal(data('Wishes').length, 2);
});

test('escapes leading formula characters', () => {
  wish({ name: '=HYPERLINK("x")', message: '+1 so cute' });
  wish({ name: '@bob', message: '-hello' });
  assert.deepEqual(data('Wishes').map((r) => [r[1], r[2]]), [["'=HYPERLINK(\"x\")", "'+1 so cute"], ["'@bob", "'-hello"]]);
});

test('answers busy when the lock is held, without burning the rate limit', () => {
  lockFree = false;
  assert.equal(wish().err, 'busy');
  lockFree = true;
  assert.ok(wish().ok);
});

test('rejects RSVPs from party start, still takes Wishes', () => {
  ctx.now = () => PARTY - 1;
  assert.ok(rsvp().ok);
  ctx.now = () => PARTY;
  assert.equal(rsvp({ name: 'Late' }).err, 'closed');
  assert.ok(wish({ name: 'Late' }).ok);
});

test('GET returns Wishes newest first, max 200, as JSON', () => {
  for (let i = 0; i < 205; i++) wish({ name: `G${i}` });
  const out = get();
  assert.equal(out.mime, 'json');
  const { ok, wishes } = JSON.parse(out.body);
  assert.ok(ok);
  assert.equal(wishes.length, 200);
  assert.equal(wishes[0].name, 'G204');
  assert.match(wishes[0].ts, /^2026-11-25T/);
});

test('GET skips blank rows and returns empty list for a fresh sheet', () => {
  assert.deepEqual(JSON.parse(get().body), { ok: true, wishes: [] });
  sheets.Wishes.rows.push([new Date(), '', '']);
  assert.deepEqual(JSON.parse(get().body).wishes, []);
});

test('GET with a valid callback returns JSONP; invalid callback falls back to JSON', () => {
  wish();
  const js = get({ callback: '__wishes123' });
  assert.equal(js.mime, 'js');
  assert.match(js.body, /^__wishes123\(\{"ok":true/);
  const bad = get({ callback: 'alert(1);x' });
  assert.equal(bad.mime, 'json');
});
