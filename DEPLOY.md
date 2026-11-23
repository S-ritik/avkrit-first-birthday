# Deploy the Invite

Live URL: `https://s-ritik.github.io/avkrit-first-birthday/`. Hosting is free, no build step.

## 0. Optional content (any time; redo step 3 after)

- Music: save MP3 (< 3 MB) as `assets/audio/theme.mp3`. Loops by default; set `music.loop` in `js/content.js`.
- Month photos 1–3: save as `photos/months/m01.jpg`, `m02.jpg`, `m03.jpg`, then run `npm run photos`.
- Nicer Ganesh: save as `assets/img/ganesh.png`, set `ganeshImg` in `js/content.js`. Credit line disappears.
- Copy, shlokas, schedule blurbs: edit `js/content.js` only.

## 1. Backend: Google Sheet + Apps Script (~5 min)

1. Create a Google Sheet, e.g. "Avkrit Invite". Tabs `RSVP` and `Wishes` are created on first use.
2. Extensions → Apps Script. Delete the sample code; paste all of `backend/Code.gs`. Save.
3. Deploy → New deployment → gear icon → Web app.
   - Execute as: **Me**
   - Who has access: **Anyone** (not "Anyone with Google account")
4. Deploy → Authorize access → pick your account → Advanced → "Go to … (unsafe)" → Allow. (Normal for your own script.)
5. Copy the **Web app URL** (ends in `/exec`).
6. Check it: open the URL in a browser. Expect `{"ok":true,"wishes":[]}`.

## 2. Connect the page

In `js/content.js`, set:

```js
backendUrl: 'https://script.google.com/macros/s/XXXX/exec',
```

## 3. Publish on GitHub Pages

```bash
cd "/mnt/backup_drive/avkrit'sbirthday"
npm test                      # optional: backend + page tests
git init -b main
git add .                     # .gitignore keeps original photos/ and node_modules out
git commit -m "Avkrit's 1st birthday Invite"
gh repo create avkrit-first-birthday --public --source . --push
gh api -X POST repos/S-ritik/avkrit-first-birthday/pages -f "source[branch]=main" -f "source[path]=/"
```

Site goes live in ~1 min at the URL above. (Or: repo Settings → Pages → Deploy from branch → `main` / root.)

Later changes: `git add . && git commit -m "..." && git push`. Live again in ~1 min.

## 4. Verify before sending (on your phone)

1. Open the live URL. Intro plays; music starts on first tap (once the clip exists).
2. Send a test RSVP and a test Wish. Wish appears at once; "Thank you" shows.
3. Check the Sheet: both rows present. Delete the test rows.
4. Reload: Wishes Wall loads (proves CORS works). On a laptop, DevTools → Network → the `exec` request should show a JSON response.
   If RSVP shows "Thank you" but the wall never loads, tell Claude: the JSONP fallback is built in, but check the Apps Script deploy settings first.
5. Try `?variant=C` too. Pick one; send that link (A is the default with no `?variant`).
6. Send the link to yourself on WhatsApp: preview card shows Avkrit's photo + "Our Little Prince Avkrit turns 1".
   Stale preview? Send the link with `?v=2` on the end.

## Moderation and updates

- Remove a Wish: delete its row in the `Wishes` tab. Gone on next page load.
- Changed `Code.gs`? Deploy → Manage deployments → pencil → Version: New version → Deploy. URL stays the same.
- Party time lives in two places: `partyStart` in `js/content.js` and `PARTY_START_MS` in `backend/Code.gs`.

## Privacy

Repo is public; anyone with the link sees the page. `noindex` keeps it out of search. Original photos in `photos/` are not uploaded; only resized copies in `assets/photos/` are.
