/**
 * Avkrit's 1st birthday Invite backend.
 * Paste into the Apps Script editor of the Google Sheet (Extensions > Apps Script).
 * Deploy as Web app: Execute as = Me, Who has access = Anyone. Use the /exec URL.
 *
 * GET            -> {ok, wishes:[{ts,name,message}]} newest first, max 200.
 * GET ?callback= -> same, as JSONP.
 * POST (text/plain JSON body):
 *   {type:'rsvp', name, attending:'yes'|'no', guests, website, elapsed}
 *   {type:'wish', name, message, website, elapsed}
 *   -> {ok:true} or {ok:false, err:'json'|'type'|'name'|'message'|'closed'|'rate'|'busy'}
 * Hosts moderate by editing or deleting rows in the Sheet.
 */

var PARTY_START_MS = Date.UTC(2026, 11, 4, 13, 0, 0); // 4 Dec 2026, 6:30 pm IST
var MAX_NAME = 60;
var MAX_MSG = 500;
var MAX_GUESTS = 10;
var MAX_WISHES = 200;
var MIN_ELAPSED_MS = 3000; // faster than this after page load = bot
var RATE_SECONDS = 30;     // one post per name per type
var TABS = {
  RSVP: ['ts', 'name', 'attending', 'guests'],
  Wishes: ['ts', 'name', 'message'],
};

function now() { return Date.now(); }

function doGet(e) {
  var rows = sheet_('Wishes').getDataRange().getValues().slice(1);
  var wishes = rows
    .filter(function (r) { return String(r[1]).trim() && String(r[2]).trim(); })
    .map(function (r) { return { ts: iso_(r[0]), name: String(r[1]), message: String(r[2]) }; })
    .reverse()
    .slice(0, MAX_WISHES);
  return out_({ ok: true, wishes: wishes }, e && e.parameter && e.parameter.callback);
}

function doPost(e) {
  var d;
  try { d = JSON.parse(e.postData.contents); } catch (_) { return out_({ ok: false, err: 'json' }); }
  if (!d || typeof d !== 'object') return out_({ ok: false, err: 'json' });

  // Bots: pretend success, store nothing.
  if (d.website) return out_({ ok: true });
  if (!(Number(d.elapsed) >= MIN_ELAPSED_MS)) return out_({ ok: true });

  if (d.type !== 'rsvp' && d.type !== 'wish') return out_({ ok: false, err: 'type' });
  var name = clean_(d.name, MAX_NAME, false);
  if (!name) return out_({ ok: false, err: 'name' });

  var tab, row;
  if (d.type === 'rsvp') {
    if (now() >= PARTY_START_MS) return out_({ ok: false, err: 'closed' });
    var attending = d.attending === 'yes' ? 'yes' : 'no';
    var guests = attending === 'yes' ? Math.max(1, Math.min(MAX_GUESTS, parseInt(d.guests, 10) || 1)) : 0;
    tab = 'RSVP';
    row = [new Date(now()), safe_(name), attending, guests];
  } else {
    var msg = clean_(d.message, MAX_MSG, true);
    if (!msg) return out_({ ok: false, err: 'message' });
    tab = 'Wishes';
    row = [new Date(now()), safe_(name), safe_(msg)];
  }

  var cache = CacheService.getScriptCache();
  var key = ('rl:' + d.type + ':' + name.toLowerCase()).slice(0, 240);
  if (cache.get(key)) return out_({ ok: false, err: 'rate' });

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return out_({ ok: false, err: 'busy' });
  try {
    sheet_(tab).appendRow(row);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  cache.put(key, '1', RATE_SECONDS);
  return out_({ ok: true });
}

/* ---------- helpers ---------- */

// Get a tab, creating it with a header row on first use.
function sheet_(name) {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(TABS[name]);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Trim, drop control chars (keep newlines in messages), cap length.
function clean_(v, max, multiline) {
  var s = String(v == null ? '' : v);
  s = multiline ? s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').replace(/\n{3,}/g, '\n\n')
                : s.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ');
  return s.trim().slice(0, max).trim();
}

// Block formula injection: Sheets would run "=..." as a formula.
function safe_(s) { return /^[=+\-@]/.test(s) ? "'" + s : s; }

function iso_(v) {
  var d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

function out_(obj, callback) {
  var body = JSON.stringify(obj);
  if (callback && /^[A-Za-z_$][\w$]{0,63}$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + body + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}
