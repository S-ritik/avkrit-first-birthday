---
id: 0004
title: "Can a GitHub Pages site read and write a Google Sheet via Apps Script?"
parent: map
labels: [wayfinder:research]
status: closed
assignee: agent
blocked_by: []
---

## Question

Can a static page on github.io POST RSVPs and Wishes to an Apps Script web app and GET the Wishes list back? Check CORS and redirect behaviour, deploy settings ("Execute as", "Who has access"), quotas, and the gotchas (text/plain POST, 302 to googleusercontent). Also find spam protections that work without a login.

## Resolution

Yes. Deploy web app as Execute as: Me, Who has access: Anyone (`ANYONE_ANONYMOUS`); use `/exec` URL.
POST JSON with `Content-Type: text/plain` (no preflight; Apps Script can't answer OPTIONS); GET returns Wishes JSON.
Response 302s to one-time `script.googleusercontent.com` URL; `fetch` follows it. CORS header not in Google docs; verify on first deploy, fallback `no-cors`/JSONP.
Quotas (30 concurrent/user, 6 min/run) far exceed party scale. Spam: honeypot, time trap, server length caps, CacheService rate limit, LockService-serialised writes, formula-injection escape.
Details + doGet/doPost sketch: [../research/apps-script-backend.md](../research/apps-script-backend.md)
