---
id: map
title: "Avkrit's 1st Birthday Invite"
labels: [wayfinder:map]
status: open
---

## Destination

SPEC.md for Avkrit's 1st-birthday Invite web page, ready to hand to a build session. Nothing left to decide.

## Notes

- Tracker: local markdown. Tickets are `issues/NNNN-*.md`; `parent: map`; blocking is `blocked_by` in frontmatter; the claim is `assignee`.
- Frontier = `status: open`, all `blocked_by` closed, `assignee` empty.
- Deadline: Invite goes out by ~27 Nov 2026; party is 4 Dec 2026.
- Skills: grilling + domain-modeling; vocabulary in [GLOSSARY.md](../GLOSSARY.md).
- Reference site: https://theweddinginvite.github.io/Yash-Mahek-Wedding/
- Hall theme: [hall_theme.jpeg](../hall_theme.jpeg).
- User preference: terse reports.

## Decisions so far

- [Charting: destination, scope, and core choices](0001-charting-destination-scope-core-choices.md): English Invite for 4 Dec, hall-style balloon theme + crown, auto balloon intro, RSVP + public Wishes via Apps Script, GitHub Pages.
- [Can a GitHub Pages site read and write a Google Sheet via Apps Script?](0004-can-pages-site-use-apps-script-sheet.md): yes, text/plain POST to `/exec`; CORS unverified, JSONP fallback.

## Not yet specified

- WhatsApp preview card image and title; waits on the hero look and photos.
- English copy for each section (hosts line, schedule blurbs, footer).
- Countdown style and placement detail.
- "12 Little Birthdays" month section (one photo per 4th, months 1–11 + the party): does it replace the polaroid gallery or sit beside it? Where does it go in the section order?
- Ganesh image credit placement, if the CC BY-SA icon stays.

## Out of scope

- Envelope/seal tap-to-open intro: user rejected it.
- Guest photo upload, live notice board, helpline, dress code: cut in charting.
- EN/हिं toggle and Hindi prose: English only, apart from shlokas.
- CoComelon characters and logo: trademarked; copy the look only.
- Music play button or mute icon: user wants none.
- [Which royalty-free tracks fit as background music?](0005-royalty-free-music-candidates.md): user provides the clip; see [Add the background music clip](0006-which-track-plays.md).
- Building and deploying the site: beyond the destination (the spec).
