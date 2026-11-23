---
id: 0009
title: "Spec: build the full Invite from the prototype"
parent: map
labels: [ready-for-agent]
status: open
assignee:
blocked_by: []
---

## Problem Statement

Hosts must send the Invite by ~27 Nov 2026, but only a throwaway intro + hero prototype exists. Guests can't yet see the countdown, schedule, venue, gallery, or RSVP, or leave Wishes. Variant A vs C is still undecided, so both must stay viewable.

## Solution

Grow [the prototype](../prototype-intro-hero.html) into the complete Invite, every section styled for both variants A and C. Guests open one WhatsApp link, watch the balloon intro, hear music, RSVP, and leave Wishes. RSVPs and Wishes land in the Hosts' Google Sheet via Apps Script.

## Requirements

### Page and variants

1. Render sections in order: Blessing, Hero, 12 Little Birthdays, Countdown, Hosts + family, Schedule, Venue, Gallery, RSVP, Wishes Wall, Footer.
2. Pick variant from `?variant=A|C`; default and unknown values give A.
3. Style every section for both A and C.
4. Hide the prototype switcher bar from Guests.
5. Fit phones from 320px wide without horizontal scroll.
6. Mark the page `noindex`.

### Intro

7. Play the balloon intro on load, then reveal the page after ~2.6 s.
8. Skip the intro on any tap.
9. Show "tap to skip" during the intro.
10. Skip the intro entirely under `prefers-reduced-motion`.

### Music

11. Try autoplay of the clip from ticket 0006 on load.
12. If autoplay is blocked, start on the first tap or key anywhere.
13. Show no play button or mute icon.
14. Pause when the tab is hidden; resume when visible.
15. Stay silent, without errors, while no clip exists.

### Blessing and Hero

16. Show Ganesh image, "‖ श्री गणेशाय नमः ‖", and Avkrit-as-Ganesh photo (#30).
17. Show the Ganesh shloka with an English translation under it.
18. Show hero photo (#23), gold crown, "Our Little Prince Avkrit turns 1", date, venue.

### 12 Little Birthdays

19. Show months 1–11, one photo per 4th, plus a "1 year!" party tile.
20. Show "Coming soon" placeholder for any missing month photo.

### Countdown

21. Count days, hours, minutes, seconds to 4 Dec 2026, 6:30 pm IST.
22. From that moment, show "Avkrit is 1! 🎉" instead.

### Hosts, Schedule, Venue

23. Show Hosts as inviters; show grandparents and parents under "With love from".
24. Show schedule: 6:30 pm Welcome, 7:00 pm Cake Cutting, 8:00 pm Dinner.
25. Show Evergreen Compound with a directions button opening the Google Maps link.
26. Embed no map.
27. Offer "Add to Google Calendar", prefilled with title, time, and venue.

### Gallery

28. Show remaining photos as tilted polaroids, 2 columns; 3 from 480px.
29. Enlarge a photo on tap; close on tap, Esc, or back.
30. Lazy-load gallery photos.

### RSVP

31. Ask name, attending yes/no, and guest count 1–10.
32. Show guest count only when attending is yes.
33. Refuse submit without a name; keep inputs on failure and show an error.
34. Thank the Guest after a successful submit.
35. Replace the form with "RSVPs are closed" from 4 Dec, 6:30 pm IST.

### Wishes Wall

36. Ask name and message, max 500 characters.
37. Show a posted Wish on the wall instantly, before the server confirms.
38. List Wishes newest first, at most 200.
39. Render Wish text as plain text, never as HTML.
40. Keep Wishes open after the party.

### Footer and sharing

41. Show the long-life shloka with translation, then "Your blessings are the gift".
42. Offer WhatsApp share of the Invite link.
43. Credit the Ganesh icon while the CC BY-SA SVG is used.
44. Show hero photo and "Our Little Prince Avkrit turns 1" in the WhatsApp preview card.

### Backend (Apps Script)

45. Append RSVPs to tab `RSVP`: ts, name, attending, guests.
46. Append Wishes to tab `Wishes`: ts, name, message.
47. Return Wishes JSON on GET; return JSONP when a `callback` param is given.
48. Silently drop posts with the honeypot filled or sent within 3 s of load.
49. Cap name at 60 chars, message at 500.
50. Store guests 1–10 when attending, 0 when not.
51. Rate-limit one post per name per type per 30 s, so RSVP then Wish works.
52. Prefix values starting `= + - @` with `'` to block formula injection.
53. Serialise writes with a script lock; answer "busy" after 10 s.
54. Reject RSVPs after 4 Dec, 6:30 pm IST.

### Hosts (deploy)

55. Follow a deploy checklist from empty Sheet to live GitHub Pages site.

## Implementation Decisions

- Plain HTML/CSS/JS, no build step; one page, served by GitHub Pages at `s-ritik.github.io/avkrit-first-birthday`.
- Keep prototype structure: content data → section render functions → per-variant CSS scoped under root class `.A` / `.C`.
- Content module holds all copy, dates, photo filenames + focal points, shloka text, and backend URL. Edits touch nothing else.
- Month data shape (from prototype): `[month, '4 Jan', file|null, 'x% y%']`; `null` → `photos/months/mNN.jpg` with placeholder fallback.
- Month mapping: 4→#04, 5→#06, 6→#09, 7→#17, 8→#22, 9→#27, 10→#32, 11→#39 (pending confirm in 0007).
- Gallery: all photos not used by hero, Ganesh, or months.
- Publish resized copies only (long side 1600px, ~200 KB) in the assets photo folder; keep originals out of the repo.
- One clock: party start `2026-12-04T13:00:00Z` drives countdown and RSVP close; read `Date.now()` only there.
- Calendar link: Google Calendar template URL, `20261204T130000Z/20261204T163000Z`, location = venue + map link.
- WhatsApp share: `wa.me/?text=` with title + Invite URL.
- Preview card: `og:title`, `og:description`, absolute `og:image` of hero, under 300 KB.
- No slow-phone confetti fallback (user, 24 Nov); confetti intro and prototype switcher dropped.
- Shlokas (default until 0002 closes): Ganesh "वक्रतुण्ड महाकाय…" in Blessing; Yajurveda 36.24 "पश्येम शरदः शतं…" in Footer.
- Backend client: POST JSON body as `text/plain`, no custom headers, `credentials: omit`. Fall back to `no-cors` POST + JSONP GET if response unreadable.
- POST body: `{type:'rsvp'|'wish', name, attending, guests, message, website, elapsed}`; `website` = honeypot.
- `elapsed` = ms since page load, measured on the phone; server-vs-phone clock skew would break a raw `t0`.
- Response: `{ok:true}` or `{ok:false, err}`; GET → `{ok:true, wishes:[{ts,name,message}]}`.
- Backend = one Apps Script file bound to the Sheet, per [research sketch](../research/apps-script-backend.md); deploy Execute as Me, Who has access Anyone, `/exec` URL.
- Empty backend URL → RSVP and Wishes show "opening soon", page still works.
- Deploy checklist doc: Sheet + tab headers, paste script, deploy, copy `/exec` URL, verify CORS in DevTools, push repo, enable Pages, test WhatsApp preview.

## Testing Decisions

- Seam 1: page in headless Chromium via Playwright, served statically.
  - Fake backend by intercepting `script.google.com` requests; no code seam needed.
  - Control time with Playwright's clock for before/after party start.
  - Cover: intro auto-dismiss + tap skip + confetti mode, variant param, countdown both states, RSVP close, guest-count toggle, POST body shape, instant Wish, XSS string shown as text, error states, lightbox, month placeholder, share + calendar URLs, `noindex`.
- Seam 2: Apps Script file loaded in Node (`node:test` + `vm`) with fake SpreadsheetApp, LockService, CacheService, ContentService.
  - Cover: honeypot, time trap, caps, guests-0-when-no, rate limit, formula escape, lock busy, RSVP after close, GET newest-first 200, JSONP.
- Test deps live in a dev-only `package.json`; the site itself stays build-free.
- No prior art: repo has no tests yet.

## Out of Scope

- Choosing A vs C (ticket 0003); both ship until decided.
- Final shlokas (0002), music clip (0006), month 1–3 photos and mapping confirm (0007).
- Captcha, Turnstile, or reCAPTCHA.
- Wish moderation UI; Hosts edit or delete rows in the Sheet.
- Items already cut in [map](map.md): envelope intro, guest uploads, notice board, helpline, dress code, Hindi toggle, CoComelon assets, music controls.

## Further Notes

- Map still lists open copy decisions; this spec uses draft copy in the content module for Hosts edit.
- 12 Little Birthdays placed after Hero, as in prototype; map left its position open.
- Photos are of a baby on a public repo; `noindex` hides it from search, not from anyone with the link.
