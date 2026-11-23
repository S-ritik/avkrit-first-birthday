// All Invite copy, dates, photos and settings. Edit here; nothing else needs touching.
// Photo ids come from js/photos.js (run tools/prepare-photos.py after adding photos).

const CONTENT = {
  siteUrl: 'https://s-ritik.github.io/avkrit-first-birthday/',

  // Paste the Apps Script web app URL (ends in /exec) after deploying backend/Code.gs.
  // Empty = RSVP and Wishes show "opening soon".
  backendUrl: 'https://script.google.com/macros/s/AKfycbyoJDAQeqYuSiOZk7BgDEmfgQA974RHop825EuOqFbBQz2eFrjXTsL9y32epH6lkdyl/exec',

  // Background music. Missing file = silent page, no errors.
  music: { src: 'assets/audio/theme.mp3', loop: true },

  // 4 Dec 2026, 6:30 pm IST. Drives countdown and RSVP close. Keep in sync with backend PARTY_START_MS.
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

  hero: { id: 'img-20260807-wa0018', pos: '50% 40%' },          // #23
  littleGanesh: { id: 'img-20260915-wa0004', pos: '50% 22%' },  // #30, Avkrit dressed as Ganesh

  // Catchy lines. Edit freely; an empty string hides that line.
  slogans: {
    hero: 'One year of smiles, giggles & tiny miracles',
    months: 'Our 12-month journey',
    countdown: "Tick-tock, it's almost cake o'clock!",
    schedule: 'An evening of cake, candles & cuddles',
    gallery: 'Little moments, big memories',
    rsvp: "The celebration isn't complete without you",
    wishes: 'Shower the birthday boy with blessings',
    yearTile: 'ONE-derful!',
  },
  // Scrolling ribbons between sections.
  ribbon: [
    'From first cry to first candle', '365 days of giggles', 'Blessed by Bappa', 'Twelve months of magic',
    'Little feet, big adventures', 'One candle, a million wishes', '52 weeks of wonder', 'Our little prince turns one',
  ],
  ribbon2: [
    'Smiles · Giggles · Cuddles', 'A ONE-derful year', 'Cake, candles & blessings', 'Year one, full of fun',
    'Tiny hands, giant hearts', 'Party like a prince', 'Hello, year two!',
  ],

  // Month n = the 4th of each month (born 4 Dec 2025). id null -> photos/months/mNN.jpg. tag = playful caption.
  months: [
    { n: 1, date: '4 Jan', id: null, tag: 'Hello, world!' },
    { n: 2, date: '4 Feb', id: null, tag: 'Tiny toes' },
    { n: 3, date: '4 Mar', id: null, tag: "Giggle o'clock" },
    { n: 4, date: '4 Apr', id: 'img-20260408-wa0008', pos: '50% 50%', tag: 'Little explorer' },
    { n: 5, date: '4 May', id: 'img-20260504-wa0003-1', pos: '50% 30%', tag: 'Mischief loading' },
    { n: 6, date: '4 Jun', id: 'img-20260605-wa0026', pos: '50% 40%', tag: 'Halfway to one!' },
    { n: 7, date: '4 Jul', id: 'img-20260705-wa0003', pos: '50% 20%', tag: 'Sunshine smiles' },
    { n: 8, date: '4 Aug', id: 'img-20260804-wa0019', pos: '50% 50%', tag: 'Big eyes, big dreams' },
    { n: 9, date: '4 Sep', id: 'img-20260904-wa0023', pos: '50% 30%', tag: 'Busy bee' },
    { n: 10, date: '4 Oct', id: 'img-20261004-wa0012', pos: '62% 60%', tag: 'Double digits!' },
    { n: 11, date: '4 Nov', id: 'whatsapp-image-2026-11-04-at-11-33-41-pm', pos: '50% 70%', tag: 'Almost there!' },
  ],

  // "First year in numbers" tiles under the months. Swap in real milestones if you like
  // (e.g. { value: '9 mo', label: 'first steps' }, { value: 'Mumma', label: 'first word' }).
  firstYear: [
    { value: '365', label: 'days of giggles', icon: '☀️' },
    { value: '12', label: 'little birthdays', icon: '🎂' },
    { value: '52', label: 'weeks of wonder', icon: '🌙' },
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

  longLife: {
    shloka: 'पश्येम शरदः शतं जीवेम शरदः शतम्',
    source: '',
    translation: 'May we see a hundred autumns; may we live a hundred autumns.',
  },
  footer: {
    gift: 'Your blessings are the gift',
    signoff: 'With love, the Saxena family',
  },

  // Swap to 'assets/img/ganesh.png' if you add a Pixabay Ganesh; the credit then disappears.
  ganeshImg: 'assets/img/ganesh-icon.svg',
  // Shown only while the CC BY-SA icon above is used.
  ganeshCredit: 'Ganesha icon by Ameya Narvankar, The Noun Project, CC BY-SA 3.0',
};
