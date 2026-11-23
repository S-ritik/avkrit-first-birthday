---
id: 0001
title: "Charting: destination, scope, and core choices"
parent: map
labels: [wayfinder:grilling]
status: closed
assignee: S-ritik
blocked_by: []
---

## Question

What is the Invite, who is it for, and what does it contain?

## Resolution

- Destination: SPEC.md ready to hand to a build session.
- Occasion: Avkrit's 1st birthday, Fri 4 Dec 2026.
- Schedule: 6:30 pm Welcome · 7:00 pm Cake Cutting · 8:00 pm Dinner.
- Venue: Evergreen Compound, https://maps.app.goo.gl/F8G3ykAbDrE7Ar128. Show the map link only.
- Hosts: great-grandparents Mr. Ashok Saxena, Mrs. Suman Saxena.
- "With love from": grandparents Mr. Ashish Saxena, Mrs. Poonam Saxena; parents Mr. Kritik Saxena, Mrs. Avantika Saxena.
- Audience: family, on phones, opening a WhatsApp link.
- Language: English. Hindi/Sanskrit only as shlokas; top line "‖ श्री गणेशाय नमः ‖" plus small Ganesh.
- Headline: "Our Little Prince Avkrit turns 1".
- Theme: copy the hall look ([hall_theme.jpeg](../hall_theme.jpeg)): rainbow balloon arches, grass, blue sky, school bus, watermelon. Add a small gold crown. No CoComelon characters or logo.
- Intro: opens by itself; balloons float up and reveal the page (~2.5 s, skippable). Confetti burst instead on slow phones.
- Music: track TBD. Try autoplay; if blocked, start on first tap anywhere. No button, no mute icon.
- Section order: Blessing → Hero (photo, headline, date) → Countdown → Hosts + family → Schedule → Venue (map, directions, add to Google Calendar) → Gallery → RSVP → Wishes wall → Footer ("Your blessings are the gift" + WhatsApp share).
- Gallery: scattered polaroid cards, tap to enlarge; grid on small screens.
- RSVP fields: name, attending yes/no, guest count. No phone.
- Wishes: public wall, shown instantly; Hosts edit or delete rows in the Sheet.
- Backend: Google Sheet + Apps Script in the user's Google account; user deploys from a checklist.
- After 4 Dec: countdown shows "Avkrit is 1! 🎉"; RSVP closes; Wishes stay open.
- Extras: WhatsApp preview card (photo + title); add-to-calendar button.
- Build: plain HTML/CSS/JS, no build step.
- Hosting: GitHub Pages, public repo under S-ritik (e.g. `s-ritik.github.io/avkrit-first-birthday`), `noindex`.
- No dress code. No helpline.
