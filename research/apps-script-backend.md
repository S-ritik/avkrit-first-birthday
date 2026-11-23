# Apps Script + Sheet as backend for a github.io page

Ticket: [0004](../issues/0004-can-pages-site-use-apps-script-sheet.md). Researched 2026-11-24.

## Answer

Yes. Static page can `fetch()` POST RSVPs/Wishes and GET Wishes JSON from an Apps Script web app bound to a Sheet. Conditions: deploy as `Execute as: Me` + `Who has access: Anyone`; send only "simple" CORS requests (POST body `text/plain`, no custom headers); follow redirects (fetch default).

## Request flow, CORS, redirect

- `doGet(e)` runs on GET, `doPost(e)` on POST. [web]
- Must return `HtmlOutput` or `TextOutput` (ContentService). [web]
- ContentService output is "redirected to a one-time URL" on `script.googleusercontent.com`; clients must follow redirects (`curl -L`). Docs don't name the status code; community reports 302. [content]
- Script runs before the redirect; redirect target only serves the stored output.
- Per Fetch spec, a 301/302 after POST is re-issued as GET. Fine here: GET to googleusercontent just returns the output. [fetch]
- Google docs never mention CORS. [content]
- Apps Script has no `doOptions`; a CORS preflight (OPTIONS) can't be answered by your code. So avoid preflight entirely.
- Simple request = GET/HEAD/POST, only safelisted headers, `Content-Type` one of `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`. [mdn]
- Browsers also may reject redirects after a preflighted request; another reason to stay simple. [mdn]
- Response readable by JS only if it carries `Access-Control-Allow-Origin`. [mdn] Community-observed: googleusercontent response sends `Access-Control-Allow-Origin: *`. UNVERIFIED in Google docs; confirm with first deploy (DevTools > Network).
- Fallbacks if response unreadable: `mode: "no-cors"` POST (fire-and-forget, opaque response) or JSONP GET via `?prefix=cb` + `<script>` tag (read-only, non-sensitive only). [content]
- Don't send credentials (`credentials: "omit"`, default for cross-origin `fetch`); `*` origin only works without credentials. [mdn]
- Don't use params named `c` or `sid` (reserved). [web]

## Deploy settings

- Deploy > New deployment > type Web app. [web]
- `executeAs: USER_DEPLOYING` = "runs as the user who deployed it" (UI: Execute as Me). [manifest] Script writes Sheet with owner's rights; guests need no Google access to Sheet. [web]
- `access: ANYONE_ANONYMOUS` = "Any user, even if not logged in" (UI: Anyone). [manifest]
- `access: ANYONE` = "Any logged-in user" (UI: Anyone with Google account). Wrong choice: anonymous fetch gets a login page, not JSON. [manifest]
- `/dev` URL = latest saved code, editors only; use `/exec` in the site. [web]
- Code edits don't reach `/exec` until redeploy. Keep same URL: Deploy > Manage deployments > Edit > New version > Deploy. [deploy]
- Never send OAuth tokens to client when running as developer. [web]

## Quotas (consumer gmail.com)

- 30 simultaneous executions / user; 1,000 / script. [quotas]
- 6 min runtime / execution. [quotas]
- Properties read/write 50,000 / day. [quotas]
- URL Fetch 20,000 / day (not needed). [quotas]
- No Sheets read/write quota listed; only 250 spreadsheets created / day. [quotas]
- Birthday-scale traffic (tens–hundreds of requests) is far below every limit. Executions as Me count against owner, so concurrent burst > 30 may error; LockService serialises writes anyway.

## Minimal sketch

Sheet tabs: `RSVP` (ts, name, attending, guests), `Wishes` (ts, name, message).

```js
const MAX_NAME = 60, MAX_MSG = 500, MAX_GUESTS = 10;

function doGet(e) {
  const rows = SpreadsheetApp.getActive().getSheetByName('Wishes')
    .getDataRange().getValues().slice(1)       // skip header
    .map(([ts, name, message]) => ({ ts, name, message }))
    .reverse().slice(0, 200);
  return json({ ok: true, wishes: rows });
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (_) { return json({ ok: false, err: 'bad json' }); }
  if (d.website) return json({ ok: true });                 // honeypot: pretend success
  if (Date.now() - Number(d.t0) < 3000) return json({ ok: true }); // filled too fast = bot
  const name = String(d.name || '').trim().slice(0, MAX_NAME);
  if (!name) return json({ ok: false, err: 'name' });
  if (rateLimited(name)) return json({ ok: false, err: 'slow down' });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json({ ok: false, err: 'busy' });
  try {
    const ss = SpreadsheetApp.getActive();
    if (d.type === 'rsvp') {
      const guests = Math.max(0, Math.min(MAX_GUESTS, parseInt(d.guests, 10) || 0));
      ss.getSheetByName('RSVP').appendRow([new Date(), safe(name), d.attending === 'yes' ? 'yes' : 'no', guests]);
    } else if (d.type === 'wish') {
      const msg = String(d.message || '').trim().slice(0, MAX_MSG);
      if (!msg) return json({ ok: false, err: 'message' });
      ss.getSheetByName('Wishes').appendRow([new Date(), safe(name), safe(msg)]);
    } else return json({ ok: false, err: 'type' });
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  return json({ ok: true });
}

function rateLimited(name) {           // max 1 post / 30 s per name
  const c = CacheService.getScriptCache(), k = 'rl:' + name.toLowerCase().slice(0, 200);
  if (c.get(k)) return true;
  c.put(k, '1', 30);
  return false;
}
const safe = s => /^[=+\-@]/.test(s) ? "'" + s : s;          // block formula injection
const json = o => ContentService.createTextOutput(JSON.stringify(o))
  .setMimeType(ContentService.MimeType.JSON);
```

Client:

```js
const URL = 'https://script.google.com/macros/s/<id>/exec';
await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify({ type: 'wish', name, message, website: hp.value, t0 }) }).then(r => r.json());
const { wishes } = await fetch(URL).then(r => r.json());
```

- Render wishes with `textContent`, never `innerHTML` (stored XSS).
- `appendRow` + `flush()` before `releaseLock()`, per Lock docs. [lock]
- `getDocumentLock()` may return null "from a standalone script or web app"; use `getScriptLock()`. [lockservice]

## Login-free spam protection

- Honeypot: hidden `website` input; bots fill it; server silently drops.
- Time trap: page-load timestamp `t0`; reject submits < 3 s.
- Length limits server-side (name 60, message 500, guests 0–10); client `maxlength` is cosmetic.
- Rate limit: `CacheService.getScriptCache()` key per name, TTL 30 s. Cache limits: key ≤ 250 chars, value ≤ 100 KB, TTL max 21,600 s, default 600 s, ≤ 1,000 items, may evict early. [cache]
- No client IP exposed in event object (`e` has parameter, postData, contentLength, pathInfo only) [web], so per-IP limits impossible; per-name + global limit (e.g. counter key per minute) instead.
- Serialise writes: `LockService.getScriptLock().tryLock(ms)` returns false on timeout; `waitLock` throws. Lock auto-released at script end. [lock]
- Formula injection: prefix `= + - @` with `'`.
- Moderation: owner deletes rows in Sheet; optional `approved` column filtered in `doGet`.
- Not solvable without third party: determined bots. Optional upgrade: Cloudflare Turnstile / reCAPTCHA verified via `UrlFetchApp` (out of scope).

## Sources

- [web] https://developers.google.com/apps-script/guides/web
- [content] https://developers.google.com/apps-script/guides/content
- [deploy] https://developers.google.com/apps-script/concepts/deployments
- [manifest] https://developers.google.com/apps-script/manifest/web-app-api-executable
- [quotas] https://developers.google.com/apps-script/guides/services/quotas
- [lockservice] https://developers.google.com/apps-script/reference/lock/lock-service
- [lock] https://developers.google.com/apps-script/reference/lock/lock
- [cache] https://developers.google.com/apps-script/reference/cache/cache
- [mdn] https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
- [fetch] https://fetch.spec.whatwg.org/#http-redirect-fetch
