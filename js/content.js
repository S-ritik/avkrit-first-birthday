// All Invite copy, dates, photos and settings. Edit here; nothing else needs touching.
// Photo ids come from js/photos.js (run tools/prepare-photos.py after adding photos).

const CONTENT = {
  siteUrl: 'https://s-ritik.github.io/avkrit-first-birthday/',

  // Look of the Invite: 'A' Balloon Arch, 'C' Storybook Polaroid, 'R' Royal Prince, 'S' Superhero.
  // ?theme=R in the link overrides it. themePicker: true shows the 🎨 switcher; set false before sending.
  theme: 'S',
  themePicker: true,

  // Paste the Apps Script web app URL (ends in /exec) after deploying backend/Code.gs.
  // Empty = Wishes show "opening soon".
  backendUrl: 'https://script.google.com/macros/s/AKfycbyoJDAQeqYuSiOZk7BgDEmfgQA974RHop825EuOqFbBQz2eFrjXTsL9y32epH6lkdyl/exec',

  // Background music. Missing file = silent page, no errors.
  music: { src: 'assets/audio/theme.mp3', loop: true },

  // 4 Dec 2026, 6:30 pm IST. Drives the countdown and calendar event.
  partyStart: '2026-12-04T13:00:00Z',
  partyEnd: '2026-12-04T16:30:00Z', // calendar event end, 10:00 pm IST

  born: '2025-12-04', // drives "N days old" and photo-age captions

  name: 'Avkrit',
  headline: 'Our Little Prince Avkrit turns 1',
  dateText: 'Friday, 4 December 2026',
  timeText: '6:30 PM onwards',

  blessing: {
    top: '‖ श्री गणेशाय नमः ‖',
    shloka: ['वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।', 'निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥'],
    translation: 'O Lord with the curved trunk and mighty form, radiant as a million suns, remove every obstacle from all our work, always.',
  },

  hero: { id: 'whatsapp-image-2026-11-09-at-12-26-01-am', pos: '50% 35%' },
  littleGanesh: { id: 'img-20260915-wa0004', pos: '50% 22%' },  // #30, Avkrit dressed as Ganesh

  // Catchy lines. Edit freely; an empty string hides that line.
  slogans: {
    hero: 'One year old, four generations proud',
    months: 'A new photo every 4th',
    countdown: "Tick-tock, it's almost cake o'clock!",
    schedule: 'Come hungry. Cake at 7, dinner at 8.',
    gallery: 'He steals every frame. See for yourself.',
    wishes: "He can't read yet, so we'll read them to him",
    yearTile: 'The big ONE!',
  },
  // Scrolling ribbons between sections.
  ribbon: [
    'From first cry to first candle', '365 days, zero dull moments', 'Blessed by Bappa', 'Our little Bal Ganesh',
    'Four generations, one cake', 'One candle, one very big deal', 'The house alarm clock turns one', 'Little Prince, big party',
  ],
  ribbon2: [
    'Cake first, nap later', 'Officially one', 'Save room for cake', 'One down, a hundred autumns to go',
    'Tiny boss, big birthday', 'Party like a prince', 'Hello, year two!',
  ],

  // Month n = the 4th of each month (born 4 Dec 2025). id null -> photos/months/mNN.jpg. tag = playful caption.
  months: [
    { n: 1, date: '4 Jan', id: 'whatsapp-image-2026-11-24-at-9-51-12-pm', pos: '92% 50%', tag: 'Hello, 2026!' },
    { n: 2, date: '4 Feb', id: 'whatsapp-image-2026-11-25-at-12-15-56-am-2', pos: '72% 50%', tag: 'Who needs sleep?' },
    { n: 3, date: '4 Mar', id: 'img-20260226-wa0003', pos: '50% 55%', tag: 'Tummy-time pro' },
    { n: 4, date: '4 Apr', id: 'img-20260408-wa0008', pos: '50% 50%', tag: 'On a roll' },
    { n: 5, date: '4 May', id: 'img-20260504-wa0003-1', pos: '50% 30%', tag: 'Mischief loading' },
    { n: 6, date: '4 Jun', id: 'img-20260605-wa0026', pos: '50% 40%', tag: 'Halfway to one!' },
    { n: 7, date: '4 Jul', id: 'img-20260705-wa0002', pos: '50% 62%', tag: 'First monsoon' },
    { n: 8, date: '4 Aug', id: 'img-20260804-wa0019', pos: '50% 50%', tag: 'Zero chill mode' },
    { n: 9, date: '4 Sep', id: 'img-20260904-wa0026', pos: '50% 30%', tag: 'Little Kanha' },
    { n: 10, date: '4 Oct', id: 'img-20261004-wa0012', pos: '62% 60%', tag: 'Double digits!' },
    { n: 11, date: '4 Nov', id: 'whatsapp-image-2026-11-04-at-11-33-41-pm', pos: '50% 70%', tag: '30 days to cake!' },
  ],

  // Real dates for photos whose filename date is wrong (old photos forwarded on 24-25 Nov).
  // null = date unknown: no caption, shown first in the gallery.
  photoDates: {
    'whatsapp-image-2026-11-25-at-12-15-54-am-1': '2026-01-01', // Happy New Year
    'whatsapp-image-2026-11-25-at-12-15-55-am': '2026-01-14',   // Makar Sankranti
    'whatsapp-image-2026-11-25-at-12-15-56-am': '2026-01-26',   // Republic Day
    'whatsapp-image-2026-11-25-at-12-16-28-am': '2026-02-15',   // Mahashivratri
    'whatsapp-image-2026-11-24-at-4-14-47-pm': null,
    'whatsapp-image-2026-11-24-at-4-16-02-pm': null,
    'whatsapp-image-2026-11-24-at-4-17-12-pm': null,
    'whatsapp-image-2026-11-24-at-9-51-13-pm': null,
    'whatsapp-image-2026-11-25-at-12-15-54-am': null,
    'whatsapp-image-2026-11-25-at-12-19-12-am': null,
    'whatsapp-image-2026-11-25-at-12-20-49-am': null,
    'whatsapp-image-2026-11-25-at-12-23-40-am': null,
  },

  // "First year in numbers" tiles under the months. Swap in real milestones if you like
  // (e.g. { value: '9 mo', label: 'first steps' }, { value: 'Mumma', label: 'first word' }).
  firstYear: [
    { value: '365', label: 'days of giggles', icon: '☀️' },
    { value: '12', label: 'monthly photo shoots', icon: '📸' },
    { value: '4', label: 'generations celebrating', icon: '🏡' },
    { value: '∞', label: 'cuddles & kisses', icon: '💛' },
  ],

  hosts: {
    lead: 'With the blessings of Shri Ganesh,',
    names: 'Mr. Ashok Saxena & Mrs. Suman Saxena',
    line: 'warmly invite you and your family to celebrate the first birthday of their great-grandson',
  },
  family: [
    { role: 'Grandparents', names: 'Mr. Ashish Saxena & Mrs. Poonam Saxena' },
    { role: 'Parents', names: 'Mr. Kritik Saxena & Mrs. Avantika Saxena' },
  ],

  schedule: [
    { time: '6:30 PM', title: 'Welcome', blurb: 'Come in, say hello and find a balloon.', icon: '🎈' },
    { time: '7:00 PM', title: 'Cake Cutting', blurb: 'Sing along as Avkrit cuts the first birthday cake.', icon: '🎂' },
    { time: '8:00 PM', title: 'Dinner', blurb: 'Stay for dinner with the whole family.', icon: '🍽️' },
  ],

  venue: { name: 'Evergreen Compound', mapUrl: 'https://maps.app.goo.gl/F8G3ykAbDrE7Ar128' },

  // Text sent by the "Share on WhatsApp" button. *word* is bold in WhatsApp.
  // Order: blessing, title, Invite link, Hindi, English, wishes reminder, venue link.
  // The Invite link comes before the venue link because WhatsApp builds its preview card from the first link.
  // Emojis only at the start of header and detail lines, never inside sentences.
  shareText: {
    blessing: '🙏 *‖ श्री गणेशाय नमः ‖* 🙏',
    title: '🎈🎂 *Avkrit\'s 1st Birthday* 🎂🎈',
    hi: [
      'आप सपरिवार सादर आमंत्रित हैं।',
      'हमारे लाडले अवकृत का पहला जन्मदिन है।',
      '',
      '📅 शुक्रवार, 4 दिसंबर 2026',
      '⏰ शाम 6:30 बजे से',
      '📍 एवरग्रीन कंपाउंड',
      '',
      'आपकी उपस्थिति और आशीर्वाद की प्रतीक्षा रहेगी।',
    ],
    en: [
      'You and your family are warmly invited',
      'to celebrate Avkrit\'s 1st birthday.',
      '',
      '📅 Friday, 4 December 2026',
      '⏰ 6:30 PM onwards',
      '📍 Evergreen Compound',
      '',
      'Please come and bless our little prince.',
    ],
    wishReminder: [
      'इनवाइट पेज के सबसे नीचे अवकृत के लिए अपनी शुभकामना ज़रूर लिखें!',
      'Don\'t forget to leave a wish for Avkrit at the bottom of the invite page!',
    ],
  },

  longLife: {
    shloka: 'पश्येम शरदः शतं जीवेम शरदः शतम्',
    source: '||',
    translation: 'May we see a hundred autumns; may we live a hundred autumns.',
  },
  footer: {
    gift: 'Your blessings are the gift',
    signoff: 'With love, the Saxena family',
  },

  // Swap to 'assets/img/ganesh.png' if you add a Pixabay Ganesh; the credit then disappears.
  ganeshImg: 'assets/img/ganesh-icon.svg',
  // Shown only while the CC BY-SA icon above is used.
  ganeshCredit: '',
};
