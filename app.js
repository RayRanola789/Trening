// Treningslogg – enkel app for program, økter, øvelser og logging av styrke og cardio.
// All data lagres lokalt på enheten (localStorage).

const STORE_KEY = 'treningsapp-v1';

// ---------- Styrke ----------

// Muskelgrupper (lagres i feltet "category" på øvelsen)
const CATEGORIES = [
  { id: 'armer',   name: 'Armer',   subs: ['Bicep', 'Tricep', 'Forearm'] },
  { id: 'rygg',    name: 'Rygg',    subs: ['Lats', 'Traps', 'Lower back'] },
  { id: 'bryst',   name: 'Bryst',   subs: ['Upper', 'Lower'] },
  { id: 'skuldre', name: 'Skuldre', subs: ['Front', 'Lateral', 'Rear'] },
  { id: 'bein',    name: 'Bein',    subs: ['Quads', 'Hamstring', 'Calf'] },
  { id: 'mage',    name: 'Mage',    subs: [] },
];

// Kategori = type utstyr (lagres i feltet "equipment")
const EQUIPMENT = [
  { id: 'maskin',   name: 'Maskin' },
  { id: 'barbell',  name: 'Barbell' },
  { id: 'smith',    name: 'Smith' },
  { id: 'dumbbell', name: 'Dumbbell' },
  { id: 'cable',    name: 'Cable' },
  { id: 'annet',    name: 'Annet' },
];

// ---------- Cardio ----------

// Type cardioøvelse (lagres i feltet "kind")
const KINDS = [
  { id: 'tur',       name: 'Tur' },
  { id: 'intervall', name: 'Intervaller' },
];

// Kategori for cardio (lagres i feltet "sport")
const SPORTS = [
  { id: 'loping',   name: 'Løping' },
  { id: 'sykkel',   name: 'Sykkel' },
  { id: 'svomming', name: 'Svømming' },
  { id: 'ski',      name: 'Ski' },
  { id: 'roing',    name: 'Roing' },
];

// Små ikoner i samme strekstil som menylinja
const ICONS = {
  // Kettlebell
  styrke: '<svg viewBox="0 0 24 24"><path d="M7.4 11.2C6 5.5 8.4 3.3 12 3.3s6 2.2 4.6 7.9"/><path d="M8.6 9.8c.4-2.3 1.6-3.2 3.4-3.2s3 .9 3.4 3.2"/><path d="M8.8 20.8a6.4 6.4 0 1 1 6.4 0z"/></svg>',
  // Hjerte med puls
  cardio: '<svg viewBox="0 0 24 24"><path d="M20.4 12.6c1.8-2.4 1.6-6-.8-7.6-2.4-1.6-5.4-.7-7.6 2-2.2-2.7-5.2-3.6-7.6-2-2.4 1.6-2.6 5.2-.8 7.6"/><path d="M3 12.5h4l1.8-3 3 6 2-4.2 1.2 1.2H21"/><path d="M6.5 15.8L12 20.5l5.5-4.7"/></svg>',
  // Badevekt
  vekt: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8 9.5a5 5 0 0 1 8 0"/><path d="M12 9.8l1.3-2"/></svg>',
  // Søylediagram
  stats: '<svg viewBox="0 0 24 24"><path d="M4 20.5h16"/><path d="M6.5 17V12M11 17V6.5M15.5 17V9.5M20 17v-4" stroke-width="2.6"/></svg>',
  // Forstørrelsesglass
  search: '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L20.5 20.5"/></svg>',
  // Blyant
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="M13.5 7l3 3"/></svg>',
  // Dra-håndtak
  grip: '<svg viewBox="0 0 24 24"><path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" stroke-width="3.2"/></svg>',
  // Del (iOS-stil: firkant med pil opp)
  share: '<svg viewBox="0 0 24 24"><path d="M12 3.5v11M8 7.2l4-3.7 4 3.7"/><path d="M8.5 10.5H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5"/></svg>',
  // Legg til (pluss i firkant)
  addHome: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8.5v7M8.5 12h7"/></svg>',
  // Malerpalett
  palette: '<svg viewBox="0 0 24 24"><path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.3 0 2-.8 2-1.8 0-1.3-1.2-1.7-1.2-2.9 0-1 .8-1.8 1.8-1.8h2.2a3.7 3.7 0 0 0 3.7-3.7C20.5 6.6 16.7 3.5 12 3.5z"/><circle cx="7.8" cy="11" r="1.1"/><circle cx="10.2" cy="7.3" r="1.1"/><circle cx="14.6" cy="7.6" r="1.1"/></svg>',
  // Glidebrytere
  settings: '<svg viewBox="0 0 24 24"><path d="M4 6.5h9M17 6.5h3M4 12h3M11 12h9M4 17.5h11M19 17.5h1"/><circle cx="15" cy="6.5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17.5" r="2"/></svg>',
};
// Muskelgrupper i øvelsesbiblioteket
// Felles figur (hode, overkropp og armer) for bryst, rygg og mage
const FIGURE = '<circle cx="12" cy="4.2" r="2.2"/>' +
  '<path d="M7.6 8.2c1.4-.9 7.4-.9 8.8 0"/>' +                       // skuldre
  '<path d="M8.2 8.8l.8 11.4h6l.8-11.4"/>' +                         // overkropp
  '<path d="M7.6 8.2c-1.6.4-2.4 1.6-2.6 3.6l-.4 6.4"/>' +            // venstre arm
  '<path d="M16.4 8.2c1.6.4 2.4 1.6 2.6 3.6l.4 6.4"/>';              // høyre arm
const MUSCLE_ICONS = {
  // Flexet arm: overarm vannrett, albue ~90°, tydelig biceps og knyttneve
  armer: '<svg viewBox="0 0 24 24"><path d="M3 14.6c1.4-.8 2.4-1.8 3-3 2-4 7-3.8 8.2.2L13 6.6c-.5-2 .5-3.6 2.5-3.6H17c1.8 0 2.8 1.3 2.5 3.3l.3 9.2c.2 2.7-1.2 4.3-3.8 4.3H3"/><path d="M13.4 6.4c1 .4 2.2.4 3.2 0"/><path d="M14.2 11.8c.6 1.2 1.6 1.8 2.8 2"/></svg>',
  // Figur bakfra med V-form: brede skuldre, smal midje, ryggrad og skulderblader
  rygg: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.2" r="2.2"/><path d="M6.4 8.2c1.8-1 9.4-1 11.2 0"/><path d="M6.8 8.8L10 20.2h4l3.2-11.4"/><path d="M6.4 8.2c-1.6.4-2.4 1.6-2.6 3.6l-.4 6.4M17.6 8.2c1.6.4 2.4 1.6 2.6 3.6l.4 6.4"/><path d="M12 9.5v9"/><path d="M9.2 10.2c.4 1.4 1.2 2.1 2.1 2.2M14.8 10.2c-.4 1.4-1.2 2.1-2.1 2.2"/></svg>',
  // Zoomet inn på brystet
  bryst: `<svg viewBox="5.5 6.8 13 13"><g stroke-width="1.15">${FIGURE}</g><path d="M8.6 10.3c1.1 1.8 2.4 2.2 3.4 1.3 1 .9 2.3.5 3.4-1.3" stroke-width="1.4"/></svg>`,
  // Skulder (tykk) med flexet arm
  skuldre: '<svg viewBox="0 0 24 24"><path d="M1.8 6.2c1.6.7 2.9 1.8 3.8 3.3"/><path d="M4.6 11.2c.6-3.4 5.4-3.8 6.6-.4" stroke-width="3.2"/><path d="M11.2 10.8c1.4-2 4.4-2 5.3.8l-.9-4.8c-.3-1.8.4-2.8 2-2.8h1.2c1.5 0 2.2 1 2 2.6l.4 6.8c.1 1.9-.9 2.9-2.8 2.9H5.2"/><path d="M5 11.6V21"/><path d="M15.9 6.4c.9.3 2 .3 2.9 0"/></svg>',
  // To bein
  bein: '<svg viewBox="0 0 24 24"><path d="M6.5 3c-.5 4 0 7 1 9.5L7 21h3l1-8.5L11.5 3"/><path d="M17.5 3c.5 4 0 7-1 9.5L17 21h-3l-1-8.5L12.5 3"/></svg>',
  // Sixpack
  // Figur forfra: sixpack
  mage: `<svg viewBox="0 0 24 24">${FIGURE}<path d="M12 10.8v7M10 12.2h4M10 14.6h4M10 17h4"/></svg>`,
  '': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5"/><path d="M9.5 9.8a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.6-.8 1.1v.7M12 16.6v.01"/></svg>',
};

const icon = name => `<span class="ic">${ICONS[name]}</span>`;

const MODES = [
  { id: 'styrke', name: 'Styrke' },
  { id: 'cardio', name: 'Cardio' },
];

// Oppsett for intervalløkter
const PLANS = [
  { id: 'fast',     name: 'Fast' },
  { id: 'dynamisk', name: 'Dynamisk' },
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY));
    if (data) return data;
  } catch (e) { /* ignorer */ }
  return {
    exercises: [],   // styrke: { id, type:'styrke', name, category, subs, equipment, timed }
                     // cardio: { id, type:'cardio', name, kind, sport }
    programs: [],    // { id, type, name, workouts: [{ id, name, exerciseIds: [] }] }
    history: [],     // fullførte økter (begge typer)
    active: null,    // pågående økt
    bodyweight: [],  // { id, date, kg }
  };
}

let db = load();

// Oppgrader data fra eldre versjoner
db.exercises.forEach(e => {
  e.type ??= 'styrke'; e.category ??= ''; e.subs ??= []; e.equipment ??= ''; e.timed ??= false;
});
db.programs.forEach(p => { p.type ??= 'styrke'; });
db.history.forEach(h => { h.type ??= 'styrke'; });
if (db.active) db.active.type ??= 'styrke';
db.bodyweight ??= [];
db.lastProgramByMode ??= { styrke: db.lastProgramId ?? null, cardio: null };

db.settings ??= { colors: {} };
// To egne temaer som kan lagres og justeres. activeSlot = indeks på eget tema som er i bruk (eller null)
db.settings.custom ??= [{ name: 'Mitt tema 1', colors: null }, { name: 'Mitt tema 2', colors: null }];
db.settings.activeSlot ??= null;
db.settings.mode ??= 'styrke';

// Cardio er egne økter (ikke program/øvelser):
// { id, name, sport, kind:'tur'|'intervall', plan:'fast'|'dynamisk', work, rest, rounds, sets:[{ work, rest }] }
if (!db.cardioWorkouts) {
  db.cardioWorkouts = db.exercises.filter(e => e.type === 'cardio').map(e => ({
    id: uid(), name: e.name, sport: e.sport || 'loping', kind: e.kind || 'intervall',
    plan: 'fast', work: '4', rest: '2', rounds: '4', sets: [{ work: '4', rest: '2' }],
  }));
  db.exercises = db.exercises.filter(e => e.type !== 'cardio');
  db.programs = db.programs.filter(p => p.type !== 'cardio');
}

const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(db));
const mode = () => db.settings.mode;

// ---------- Farger / tema ----------

const DEFAULT_COLORS = {
  accent: '#22c55e', bg: '#0f172a', card: '#1e293b', text: '#e2e8f0',
  muted: '#94a3b8', line: '#334155', danger: '#ef4444',
};

const COLOR_FIELDS = [
  ['accent', 'Aksentfarge (knapper, timer)'],
  ['bg', 'Bakgrunn'],
  ['card', 'Kort'],
  ['text', 'Tekst'],
  ['muted', 'Sekundærtekst'],
  ['line', 'Kanter og knapper'],
  ['danger', 'Slett / fare'],
];

const THEMES = [
  { name: 'Standard', colors: DEFAULT_COLORS },
  { name: 'Hav',      colors: { accent: '#38bdf8', bg: '#04172b', card: '#0b2a47', text: '#e0f2fe', muted: '#7dafd4', line: '#1a4569', danger: '#f87171' } },
  { name: 'Lilla',    colors: { accent: '#c084fc', bg: '#140b24', card: '#241539', text: '#f3e8ff', muted: '#a78bc9', line: '#3d2a5c', danger: '#fb7185' } },
  { name: 'Glød',     colors: { accent: '#fb923c', bg: '#1c0f08', card: '#2e1a10', text: '#fff1e6', muted: '#c49a80', line: '#4a2d1c', danger: '#ef4444' } },
  { name: 'Rosa',     colors: { accent: '#f472b6', bg: '#22081a', card: '#36122b', text: '#fde7f3', muted: '#c88fb0', line: '#572045', danger: '#f87171' } },
  { name: 'Skog',     colors: { accent: '#a3e635', bg: '#0a1a10', card: '#13291b', text: '#ecfccb', muted: '#8fae96', line: '#244030', danger: '#f87171' } },
  { name: 'Svart',    colors: { accent: '#ffd60a', bg: '#000000', card: '#1c1c1e', text: '#f2f2f7', muted: '#8e8e93', line: '#3a3a3c', danger: '#ff453a' } },
  { name: 'Lys',      colors: { accent: '#2563eb', bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', muted: '#64748b', line: '#cbd5e1', danger: '#dc2626' } },
  // Heltetemaer – bytter også profilikonet nederst
  { name: 'Batman',    icon: 'batman',    colors: { accent: '#b3121b', bg: '#09090b', card: '#18181c', text: '#e4e4e7', muted: '#8b8b96', line: '#2c2c33', danger: '#f87171' } },
  { name: 'Supermann', icon: 'supermann', colors: { accent: '#e8262b', bg: '#071338', card: '#11225c', text: '#eef3ff', muted: '#9cafe0', line: '#22397f', danger: '#ff8a3d' } },
  { name: 'Spiderman', icon: 'spiderman', colors: { accent: '#3b82f6', bg: '#170408', card: '#2b0a10', text: '#fde8ea', muted: '#c78f96', line: '#4d1822', danger: '#f87171' } },
  { name: 'Hulk',      icon: 'hulk',      colors: { accent: '#5fd12e', bg: '#0b170c', card: '#162d19', text: '#eaffdf', muted: '#93b88a', line: '#28492d', danger: '#f87171' } },
];

// Hodeikoner for heltetemaene (samme strekstil som resten av menyen)
const HERO_ICONS = {
  // Kun masken
  batman: `<svg viewBox="0 0 24 24">
    <path d="M4.6 21.5V6.4l.5-5 3.1 4.2c2.5-.7 5.1-.7 7.6 0l3.1-4.2.5 5v15.1l-2.7-7.8L12 16.4l-4.7-2.7z"/>
    <path d="M8.1 10.4l2.5 1M15.9 10.4l-2.5 1"/></svg>`,
  // Skjold med S
  supermann: `<svg viewBox="0 0 24 24">
    <path d="M2.8 8.6L6.8 4h10.4l4 4.6L12 20.5z" fill="#facc15"/>
    <path d="M16.2 6.6H9.9c-2.6 0-2.7 3.9 0 3.9h3.6c2.4 0 2.4 3.4.1 3.6l-3.3.2"/></svg>`,
  // Edderkoppen på drakta
  spiderman: `<svg viewBox="0 0 24 24">
    <ellipse cx="12" cy="8.2" rx="1.5" ry="1.8"/>
    <ellipse cx="12" cy="13.6" rx="2" ry="3.4"/>
    <path d="M10.6 9.2L7.6 6.2 7 3M10.4 11.2L5.6 9.8 3.6 6.8M10.2 14.2l-4.6 1.4-2 3.2M10.6 16.2l-3 2.8L7 21.5"/>
    <path d="M13.4 9.2l3-3 .6-3.2M13.6 11.2l4.8-1.4 2-3M13.8 14.2l4.6 1.4 2 3.2M13.4 16.2l3 2.8.6 2.5"/></svg>`,
  // Knyttet neve
  hulk: `<svg viewBox="0 0 24 24">
    <path d="M5 10V7.8a1.75 1.75 0 0 1 3.5 0V10"/>
    <path d="M8.5 9.5V6.8a1.75 1.75 0 0 1 3.5 0V10"/>
    <path d="M12 10V7.3a1.75 1.75 0 0 1 3.5 0V10.5"/>
    <path d="M15.5 10.5V8.8a1.75 1.75 0 0 1 3.5 0v4.4c0 4.2-2.8 7.3-7 7.3h-1c-3.7 0-6-2.7-6-6.5V10"/>
    <path d="M5 12.2h6a1.8 1.8 0 0 1 0 3.6H8.2"/></svg>`,
};
const DEFAULT_PROFILE_ICON = document.querySelector('#nav [data-view="profile"] .ico')?.innerHTML ?? '';

const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbHex = a => '#' + a.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mixHex = (a, b, t) => { const x = hexRgb(a), y = hexRgb(b); return rgbHex(x.map((v, i) => v + (y[i] - v) * t)); };
const lum = h => {
  const [r, g, b] = hexRgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const currentColors = () => ({ ...DEFAULT_COLORS, ...db.settings.colors });

function applyTheme() {
  const c = currentColors();
  const root = document.documentElement.style;
  Object.entries(c).forEach(([k, v]) => root.setProperty(`--${k}`, v));
  const accentDark = mixHex(c.accent, '#000000', 0.2);
  const light = lum(c.bg) > 0.4;
  root.setProperty('--accent-dark', accentDark);
  // Lesbar tekst oppå aksentfargen: mørk på lyse farger, hvit på mørke
  root.setProperty('--on-accent', lum(c.accent) > 0.3 ? mixHex(c.accent, '#000000', 0.8) : '#ffffff');
  root.setProperty('--on-accent-dark', lum(accentDark) > 0.4 ? mixHex(c.accent, '#000000', 0.85) : '#ffffff');
  root.setProperty('--raised', mixHex(c.card, c.text, 0.08));
  // iPhone-statuslinja har alltid hvit tekst – gi den mørk bakgrunn på lyse temaer
  root.setProperty('--top-bg', light ? c.text : c.bg);
  root.colorScheme = light ? 'light' : 'dark';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.bg);
  // Heltetema i bruk? Bytt profilikonet
  const same = t => Object.keys(DEFAULT_COLORS).every(k => t.colors[k].toLowerCase() === c[k].toLowerCase());
  const hero = THEMES.find(t => t.icon && same(t));
  const ico = document.querySelector('#nav [data-view="profile"] .ico');
  if (ico) ico.innerHTML = hero ? HERO_ICONS[hero.icon] : DEFAULT_PROFILE_ICON;
}

let view;              // hvilken side som vises
let editDraft = null;  // kopi av fullført økt som redigeres
let libQuery = '';     // søk i biblioteket
let newExOpen = false; // «Opprett ny øvelse» er lukket til vanlig
let historyFilter = 'alle';
const statsState = { type: null, period: 'all', days: '' };
const openCats = new Set(); // åpne grupper i biblioteket

// ---------- Hjelpere ----------

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const getExercise = id => db.exercises.find(e => e.id === id);
const exName = id => getExercise(id)?.name ?? '(slettet øvelse)';
const getProgram = id => db.programs.find(p => p.id === id);
const getWorkout = (pid, wid) => getProgram(pid)?.workouts.find(w => w.id === wid);
const catName = id => CATEGORIES.find(c => c.id === id)?.name ?? 'Uten muskelgruppe';
const eqName = id => EQUIPMENT.find(c => c.id === id)?.name ?? '';
const kindName = id => KINDS.find(k => k.id === id)?.name ?? '';
const sportName = id => SPORTS.find(s => s.id === id)?.name ?? '';

const num = v => parseFloat(String(v ?? '').replace(',', '.')) || 0;
const fmt = n => n.toLocaleString('nb-NO', { maximumFractionDigits: 1 });
const pad = n => String(n).padStart(2, '0');

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

// Sekunder -> «45 sek» / «1:30» (tidsøvelser i styrke)
function fmtSecs(v) {
  const n = Math.round(num(v));
  return n >= 60 ? `${Math.floor(n / 60)}:${pad(n % 60)}` : `${n} sek`;
}

// Cardio-tid skrives som «4» (min), «4:30» / «4,30» (min:sek) eller «1:05:30» (t:min:sek)
function parseDuration(v) {
  const parts = String(v ?? '').split(/[:.,]/).filter(p => p !== '').map(Number);
  if (!parts.length || parts.some(isNaN)) return 0;
  if (parts.length === 1) return parts[0] * 60;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

// Sekunder -> «4:30» / «1:05:30»
function fmtClock(secs) {
  secs = Math.round(secs);
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
// Klokkefelt: sifrene fylles inn fra høyre (iPhone-tastaturet har ikke kolon).
// «4» -> 00:04, «430» -> 04:30, «13000» -> 1:30:00
function clockDigits(v) {
  const d = String(v ?? '').replace(/\D/g, '').replace(/^0+/, '').slice(0, 6);
  if (!d) return '';
  const p = d.padStart(4, '0');
  return p.length <= 4 ? `${p.slice(0, 2)}:${p.slice(2)}` : `${p.slice(0, -4)}:${p.slice(-4, -2)}:${p.slice(-2)}`;
}
// Lagret tid (f.eks. «4», «4:30», «1:05:30») -> visning i klokkefelt
function clockValue(v) {
  const s = Math.round(parseDuration(v));
  if (!s) return '';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}

const fmtPace = secPerKm => (isFinite(secPerKm) && secPerKm > 0 ? `${fmtClock(secPerKm)} /km` : '–');

const formatDate = ts => new Date(ts).toLocaleString('nb-NO', {
  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});
const formatDay = ts => new Date(ts).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

// Tidspunkt -> verdi for <input type="datetime-local"> (lokal tid)
const toLocalInput = ts => new Date(ts - new Date(ts).getTimezoneOffset() * 60000).toISOString().slice(0, 16);

// Sett-typer:
//   styrke:      { weight, reps }        tidsøvelse: { weight, time (sek) }
//   intervall:   { duration, speed }     tur:        { distance, duration }
const isIntervalSet = s => s.speed !== undefined;
const isTurSet = s => s.distance !== undefined;

// Distanse (km) og tid (sek) for et cardiosett
function cardioNumbers(s) {
  const secs = parseDuration(s.duration);
  if (isIntervalSet(s)) { const speed = num(s.speed); return { secs, speed, dist: speed * secs / 3600 }; }
  const dist = num(s.distance);
  return { secs, dist, speed: secs ? dist / (secs / 3600) : 0 };
}

function setText(s) {
  if (isIntervalSet(s)) {
    const { secs, speed } = cardioNumbers(s);
    return [secs ? fmtClock(secs) : '–', speed ? `${fmt(speed)} km/t` : '', speed ? fmtPace(3600 / speed) : '']
      .filter(Boolean).join(' · ');
  }
  if (isTurSet(s)) {
    const { secs, dist, speed } = cardioNumbers(s);
    return `${fmt(dist)} km på ${secs ? fmtClock(secs) : '–'}${dist && secs ? ` · ${fmt(speed)} km/t · ${fmtPace(secs / dist)}` : ''}`;
  }
  if (s.time !== undefined) return `${num(s.weight) ? `${s.weight} kg × ` : ''}${fmtSecs(s.time)}`;
  return `${s.weight || 0} kg × ${s.reps || 0}`;
}

// Tempo / snittfart som vises mens man fyller ut
function cardioInfo(s) {
  const { secs, dist, speed } = cardioNumbers(s);
  if (isIntervalSet(s)) return speed ? fmtPace(3600 / speed) : '–';
  if (!dist || !secs) return '<span class="muted small">Fyll inn distanse og tid for å se snittfart og tempo</span>';
  return `
    <div><span class="muted small">Snittfart</span><strong>${fmt(speed)} km/t</strong></div>
    <div><span class="muted small">Tempo</span><strong>${fmtPace(secs / dist)}</strong></div>`;
}

const hasData = s => Object.values(s).some(v => v !== '');
const isTimedEx = ex => ex.timed ?? !!getExercise(ex.exerciseId)?.timed;
const cardioKindOf = ex => ex.kind ?? getExercise(ex.exerciseId)?.kind ?? null;

function emptySetFor(ex) {
  const kind = cardioKindOf(ex);
  if (kind === 'intervall') return { duration: '', speed: '' };
  if (kind === 'tur') return { distance: '', duration: '' };
  return isTimedEx(ex) ? { weight: '', time: '' } : { weight: '', reps: '' };
}

function sessionEx(id) {
  const e = getExercise(id);
  const se = {
    exerciseId: id,
    name: exName(id),
    timed: !!e?.timed,
    kind: e?.type === 'cardio' ? e.kind : null,
    sport: e?.type === 'cardio' ? e.sport : null,
  };
  se.sets = [emptySetFor(se)];
  return se;
}

// Gruppe (muskelgruppe / cardiotype) og detaljer for en øvelse
const groupName = e => (e.type === 'cardio' ? kindName(e.kind) : catName(e.category));
function exMeta(e) {
  if (e.type === 'cardio') return sportName(e.sport);
  return [eqName(e.equipment), e.subs.join(', '), e.timed ? 'På tid' : ''].filter(Boolean).join(' · ');
}
const exLabel = e => [groupName(e), exMeta(e)].filter(Boolean).join(' · ');

function matchesQuery(e, q) {
  if (!q) return true;
  return [e.name, groupName(e), exMeta(e), ...e.subs].join(' ').toLowerCase().includes(q);
}

// Bekreftelsesark i iOS-stil (erstatter confirm/alert som viser nettadressen på iPhone).
// Returnerer et Promise som gir true ved bekreftelse.
function ask(title, message = '', { ok = 'Slett', cancel = 'Avbryt', danger = true } = {}) {
  return new Promise(resolve => {
    const el = document.createElement('div');
    el.className = 'sheet-backdrop';
    el.innerHTML = `
      <div class="sheet" role="dialog" aria-modal="true">
        <div class="sheet-group">
          <div class="sheet-msg">
            <strong>${esc(title)}</strong>
            ${message ? `<span>${esc(message)}</span>` : ''}
          </div>
          <button class="sheet-btn ${danger ? 'danger' : ''}" data-r="1">${esc(ok)}</button>
        </div>
        ${cancel ? `<button class="sheet-btn cancel" data-r="0">${esc(cancel)}</button>` : ''}
      </div>`;
    const close = value => {
      el.classList.remove('open');
      setTimeout(() => el.remove(), 250);
      resolve(value);
    };
    el.addEventListener('click', e => {
      e.stopPropagation();
      const btn = e.target.closest('[data-r]');
      if (btn) close(btn.dataset.r === '1');
      else if (e.target === el) close(false); // trykk utenfor = avbryt
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
  });
}
// Ark med tekstfelt (f.eks. endre navn). Gir den nye teksten, eller null ved avbryt.
function askText(title, value = '', { ok = 'Lagre', placeholder = '' } = {}) {
  return new Promise(resolve => {
    const el = document.createElement('div');
    el.className = 'sheet-backdrop';
    el.innerHTML = `
      <form class="sheet" role="dialog" aria-modal="true">
        <div class="sheet-group">
          <div class="sheet-msg">
            <strong>${esc(title)}</strong>
            <input type="text" class="sheet-input" value="${esc(value)}" placeholder="${esc(placeholder)}" autocomplete="off">
          </div>
          <button class="sheet-btn" type="submit">${esc(ok)}</button>
        </div>
        <button class="sheet-btn cancel" type="button" data-r="0">Avbryt</button>
      </form>`;
    const input = el.querySelector('input');
    const close = v => {
      el.classList.remove('open');
      input.blur();
      setTimeout(() => el.remove(), 250);
      resolve(v);
    };
    el.addEventListener('click', e => {
      e.stopPropagation();
      if (e.target.closest('[data-r]') || e.target === el) close(null);
    });
    el.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      e.stopPropagation();
      close(input.value.trim() || null);
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
    input.focus();
    input.select();
  });
}

// ---------- Hjem-skjerm og deling ----------

const isStandalone = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const appUrl = () => location.origin + location.pathname.replace(/index\.html$/, '');
const INSTALL_KEY = 'treningsapp-install-dismissed';

function installDismissed() {
  try { return localStorage.getItem(INSTALL_KEY) === '1'; } catch (e) { return false; }
}
// Banner øverst når appen er åpnet i Safari på iPhone (ikke fra Hjem-skjermen)
const showInstallBanner = () => isIOS() && !isStandalone() && !installDismissed();

const installBannerHtml = () => `
  <div class="install-banner">
    <span class="menu-ico">${ICONS.addHome}</span>
    <div class="grow">
      <strong>Legg appen på Hjem-skjermen</strong>
      <div class="muted small">Da åpnes den i fullskjerm, som en vanlig app.</div>
    </div>
    <div class="install-actions">
      <button class="primary" data-action="install-help">Slik gjør du</button>
      <button class="link" data-action="install-dismiss">Ikke nå</button>
    </div>
  </div>`;

function showInstallHelp() {
  const el = document.createElement('div');
  el.className = 'sheet-backdrop';
  el.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true">
      <div class="sheet-group install-help">
        <strong class="install-title">Legg til på Hjem-skjerm</strong>
        <ol class="install-steps">
          <li><span class="step-ico">${ICONS.share}</span>
            <span>Trykk på <b>Del</b>-knappen i Safari. På nyere iPhone ligger den under <b>•••</b> nede til høyre.</span></li>
          <li><span class="step-ico">${ICONS.addHome}</span>
            <span>Bla ned og velg <b>Legg til på Hjem-skjerm</b>.</span></li>
          <li><span class="step-ico step-num">✓</span>
            <span>Trykk <b>Legg til</b> øverst til høyre. Appen ligger nå på Hjem-skjermen som «Trening».</span></li>
        </ol>
        <div class="muted small install-note">Tips: Åpne appen fra Hjem-skjermen etterpå. Det du har lagt inn her i Safari følger ikke med dit.</div>
      </div>
      <button class="sheet-btn cancel" data-r="0">OK</button>
    </div>`;
  const close = () => { el.classList.remove('open'); setTimeout(() => el.remove(), 250); };
  el.addEventListener('click', e => {
    e.stopPropagation();
    if (e.target.closest('[data-r]') || e.target === el) close();
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
}

async function shareApp() {
  const url = appUrl();
  if (navigator.share) {
    try { await navigator.share({ title: 'Treningslogg', text: 'Enkel app for å logge treningsøkter', url }); }
    catch (e) { /* avbrutt av brukeren */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    notice('Lenken er kopiert', url);
  } catch (e) {
    notice('Del appen', url);
  }
}

const notice = (title, message) => ask(title, message, { ok: 'OK', cancel: '', danger: false });

// ---------- Cardioøkter ----------

let cwDraft = null; // ny cardioøkt som ikke er opprettet ennå
let cwEditOpen = false; // «Rediger økt» er lukket til vanlig
const getCw = id => db.cardioWorkouts.find(w => w.id === id);
const currentCw = () => (view.id ? getCw(view.id) : cwDraft);
const newCardioDraft = () => ({
  id: null, name: '', sport: 'loping', kind: 'tur', plan: 'fast',
  work: '4', rest: '2', rounds: '4', sets: [{ work: '4', rest: '2' }],
});

// Settene i en intervalløkt som [{ work, rest }]
function cwPlanSets(w) {
  if (w.kind !== 'intervall') return [];
  if (w.plan === 'fast') return Array.from({ length: parseInt(w.rounds, 10) || 0 }, () => ({ work: w.work, rest: w.rest }));
  return w.sets;
}

function cwSummary(w) {
  const sport = sportName(w.sport);
  if (w.kind === 'tur') return `${sport} · Tur`;
  const sets = cwPlanSets(w);
  const total = sets.reduce((a, s, i) => a + parseDuration(s.work) + (i < sets.length - 1 ? parseDuration(s.rest) : 0), 0);
  const desc = w.plan === 'fast'
    ? `${sets.length} × ${fmtClock(parseDuration(w.work))}, ${fmtClock(parseDuration(w.rest))} pause`
    : `${sets.length} sett, dynamisk`;
  return `${sport} · ${desc}${total ? ` · totalt ${fmtClock(total)}` : ''}`;
}

// Forrige gjennomføring av samme cardioøkt
function lastCardio(workoutId) {
  for (let i = db.history.length - 1; i >= 0; i--) {
    const h = db.history[i];
    if (h.type === 'cardio' && h.workoutId === workoutId && h.exercises[0]?.sets.length) {
      return h.exercises[0].sets.map(setText).join(', ');
    }
  }
  return null;
}

function homeProgramView() {
  if (mode() === 'cardio') return { name: 'programs' };
  const p = getProgram(db.lastProgramByMode[mode()]);
  return p && p.type === mode() ? { name: 'program', programId: p.id } : { name: 'programs' };
}

function lastPerformance(exerciseId) {
  for (let i = db.history.length - 1; i >= 0; i--) {
    const ex = db.history[i].exercises.find(e => e.exerciseId === exerciseId);
    if (ex && ex.sets.length) return ex.sets.map(setText).join(', ');
  }
  return null;
}

// Søkbar velger for å legge til øvelse. target = navnet på handlingen i `forms`, type = styrke/cardio
function exercisePicker(target, type) {
  if (!db.exercises.some(e => e.type === type)) {
    return `
      <div class="card muted">
        Du har ingen ${type === 'cardio' ? 'cardioøvelser' : 'styrkeøvelser'} ennå.
        <button class="link" data-action="nav" data-view="library" style="color:var(--accent)">Legg inn øvelser ›</button>
      </div>`;
  }
  return `
    <div class="picker" data-target="${target}" data-type="${type}">
      <label class="search">${ICONS.search}
        <input type="search" placeholder="Søk og legg til øvelse…" autocomplete="off" data-picker-input></label>
      <div class="picker-results"></div>
    </div>`;
}

function pickerResultsHtml(target, type, query) {
  const q = query.trim().toLowerCase();
  const list = db.exercises
    .filter(e => e.type === type && matchesQuery(e, q))
    .sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  if (!list.length) {
    return `<div class="muted small" style="padding:10px 4px">Ingen treff.
      <button class="link" data-action="nav" data-view="library" style="color:var(--accent)">Lag ny øvelse ›</button></div>`;
  }
  return list.map(e => `
    <div class="list-item clickable" data-action="pick-ex" data-target="${target}" data-id="${e.id}">
      <div>${esc(e.name)}<div class="muted small">${esc(exLabel(e))}</div></div>
      <span class="add">+</span>
    </div>`).join('');
}

function subPickerHtml(catId, selected = []) {
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat || !cat.subs.length) return '';
  return `
    <div class="muted small">Under-muskelgruppe (valgfritt, flere mulig)</div>
    <div class="chips">${cat.subs.map(s => `
      <label class="chip"><input type="checkbox" name="subs" value="${esc(s)}" ${selected.includes(s) ? 'checked' : ''}>${esc(s)}</label>`).join('')}
    </div>`;
}

const options = (list, selected, placeholder) => `
  <option value="" disabled ${selected ? '' : 'selected'}>${placeholder}</option>
  ${list.map(c => `<option value="${c.id}" ${selected === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}`;

function exerciseFormFields(ex = {}, type = 'styrke') {
  if (type === 'cardio') {
    return `
      <input name="name" placeholder="Navn, f.eks. «4×4 intervaller» eller «Rolig tur»" value="${esc(ex.name || '')}" required>
      <div class="row">
        <select name="kind" required>${options(KINDS, ex.kind, 'Velg type')}</select>
        <select name="sport" required>${options(SPORTS, ex.sport, 'Velg kategori')}</select>
      </div>`;
  }
  return `
    <input name="name" placeholder="Navn på øvelse" value="${esc(ex.name || '')}" required>
    <select name="category" required>${options(CATEGORIES, ex.category, 'Velg muskelgruppe')}</select>
    <div class="sub-picker">${subPickerHtml(ex.category, ex.subs)}</div>
    <div class="row">
      <select name="equipment">
        <option value="" ${ex.equipment ? '' : 'selected'}>Kategori (valgfri)</option>
        ${EQUIPMENT.map(c => `<option value="${c.id}" ${ex.equipment === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
      <label class="switch-inline">
        <span>På tid</span>
        <input type="checkbox" name="timed" class="switch" role="switch" ${ex.timed ? 'checked' : ''}>
      </label>
    </div>`;
}

const modeSwitch = () => `
  <div class="seg mode-seg">${MODES.map(m =>
    `<button class="${mode() === m.id ? 'active' : ''}" data-action="set-mode" data-mode="${m.id}">${icon(m.id)}${m.name}</button>`).join('')}
  </div>`;

// ---------- Sett-kort (pågående økt og redigering) ----------

// scope = 'active' (pågående økt) eller 'edit' (redigering av fullført økt)
const setTarget = scope => (scope === 'edit' ? editDraft : db.active);
const fieldAttrs = (scope, i, j, field) => `data-scope="${scope}" data-i="${i}" data-s="${j}" data-field="${field}"`;

// Stoppeklokke for tidsøvelser i pågående økt: db.active.stopwatch = { i, s, startedAt }
const stopwatchSecs = sw => Math.floor((Date.now() - sw.startedAt) / 1000);

function stopStopwatch() {
  const sw = db.active?.stopwatch;
  if (!sw) return;
  const set = db.active.exercises[sw.i]?.sets[sw.s];
  if (set) set.time = String(Math.max(1, stopwatchSecs(sw)));
  db.active.stopwatch = null;
}

// ---------- Intervall-timer med lyd ----------
// db.active.intervalTimer = { i, work, rest, rounds, startedAt } (sekunder)
// Oppsett per øvelse lagres i ex.timer = { work, rest, rounds } (tekst slik det er skrevet)

const PREP_SECS = 5; // nedtelling før første drag
let audioCtx = null;
let wakeLock = null;
let lastPhaseKey = null, lastTickKey = null;

// iPhone krever at lyd «låses opp» av et trykk fra brukeren
function unlockAudio() {
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state !== 'running') audioCtx.resume();
    const b = audioCtx.createBuffer(1, 1, 22050), src = audioCtx.createBufferSource();
    src.buffer = b; src.connect(audioCtx.destination); src.start(0);
  } catch (e) { /* ingen lyd tilgjengelig */ }
}

function beep(freq, dur, at = 0, vol = 0.5) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime + at;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.type = 'square';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.setValueAtTime(vol, t + dur - 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(audioCtx.destination);
  o.start(t); o.stop(t + dur + 0.02);
}
const SOUNDS = {
  tick:  () => beep(660, 0.12, 0, 0.3),                                  // 3-2-1
  work:  () => beep(1046, 0.7),                                          // drag starter
  rest:  () => { beep(784, 0.25); beep(523, 0.45, 0.32); },              // drag ferdig -> pause
  done:  () => { beep(1046, 0.2); beep(1318, 0.2, 0.25); beep(1568, 0.6, 0.5); }, // ferdig
};

// Hvor i timeren vi er nå. t.works / t.rests = sekunder per sett
function ivState(t) {
  let x = (Date.now() - t.startedAt) / 1000;
  if (x < PREP_SECS) return { phase: 'prep', left: PREP_SECS - x, total: PREP_SECS, round: 1 };
  x -= PREP_SECS;
  const n = t.works.length;
  for (let r = 0; r < n; r++) {
    if (x < t.works[r]) return { phase: 'work', left: t.works[r] - x, total: t.works[r], round: r + 1 };
    x -= t.works[r];
    const rest = r < n - 1 ? t.rests[r] || 0 : 0;
    if (rest > 0) {
      if (x < rest) return { phase: 'rest', left: rest - x, total: rest, round: r + 1 };
      x -= rest;
    }
  }
  return { phase: 'done', left: 0, total: 1, round: n, over: x };
}

const PHASE_LABEL = { prep: 'Gjør deg klar', work: 'Aktiv', rest: 'Pause', done: 'Ferdig!' };

function ivDisplayHtml(t) {
  const st = ivState(t);
  const pct = st.phase === 'done' ? 100 : (1 - st.left / st.total) * 100;
  return `
    <div class="iv-phase ${st.phase}">
      <div class="iv-label">${PHASE_LABEL[st.phase]}${st.phase === 'work' || st.phase === 'rest' ? ` <span>${st.round}/${t.works.length}</span>` : ''}</div>
      <div class="iv-time">${fmtClock(Math.ceil(st.left))}</div>
      <div class="iv-progress"><span style="width:${pct}%"></span></div>
    </div>`;
}

function intervalTimerHtml(ex, i) {
  const t = db.active.intervalTimer;
  if (t && t.i === i) {
    return `
      <div class="iv-timer running">
        <div id="iv-display">${ivDisplayHtml(t)}</div>
        <button class="big" data-action="iv-stop">■ Stopp timer</button>
      </div>`;
  }
  return `
    <div class="iv-timer">
      <button class="primary big" data-action="iv-start" data-i="${i}" style="width:100%">⏱ Start intervall-timer</button>
      <div class="muted small" style="margin-top:6px;text-align:center">Følger aktiv tid og pause over. Pip ved start og slutt av hvert sett – slå av lydløs-bryteren og ha appen åpen.</div>
    </div>`;
}

async function keepAwake(on) {
  try {
    if (on && !wakeLock) wakeLock = await navigator.wakeLock?.request('screen');
    if (!on && wakeLock) { wakeLock.release(); wakeLock = null; }
  } catch (e) { wakeLock = null; }
}

function stopIntervalTimer() {
  if (db.active) db.active.intervalTimer = null;
  lastPhaseKey = lastTickKey = null;
  keepAwake(false);
}

// Kalles fra tick(): oppdaterer visningen og spiller lyd ved overganger
function tickIntervalTimer() {
  const t = db.active?.intervalTimer;
  if (!t) return;
  if (!t.works) { db.active.intervalTimer = null; return; } // timer fra eldre versjon
  const st = ivState(t);
  const sec = Math.ceil(st.left);
  const key = `${st.phase}-${st.round}`;
  // Lyd når en ny fase starter (ikke første gang, f.eks. når appen åpnes igjen midt i en fase)
  if (lastPhaseKey !== null && key !== lastPhaseKey) SOUNDS[st.phase]?.();
  lastPhaseKey = key;
  // Korte pip de tre siste sekundene av hver fase
  const tickKey = `${key}-${sec}`;
  if (st.phase !== 'done' && sec >= 1 && sec <= 3 && tickKey !== lastTickKey) SOUNDS.tick();
  lastTickKey = tickKey;
  const el = document.getElementById('iv-display');
  if (el) el.innerHTML = ivDisplayHtml(t);
  const hdr = document.getElementById('iv-header');
  if (hdr) hdr.textContent = `${PHASE_LABEL[st.phase]} ${fmtClock(sec)}`;
  if (st.phase === 'done' && st.over > 4) {
    stopIntervalTimer(); save(); render();
  }
}

function strengthRows(ex, i, scope) {
  const timed = isTimedEx(ex);
  const withClock = timed && scope === 'active';
  const sw = scope === 'active' ? db.active.stopwatch : null;
  const f2 = timed ? 'time' : 'reps';
  const rows = ex.sets.map((s, j) => {
    const running = sw && sw.i === i && sw.s === j;
    const val = running ? stopwatchSecs(sw) : s[f2];
    return `
      <div class="set-grid ${withClock ? 'timed' : ''}">
        <span class="num">${j + 1}</span>
        <input type="text" inputmode="decimal" autocomplete="off" placeholder="kg" value="${esc(s.weight)}" ${fieldAttrs(scope, i, j, 'weight')}>
        <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="${timed ? 'sek' : 'reps'}"
               value="${esc(val)}" ${fieldAttrs(scope, i, j, f2)} ${running ? 'readonly class="running"' : ''}>
        ${withClock ? `<button class="sw-btn ${running ? 'running' : ''}" data-action="stopwatch" data-i="${i}" data-s="${j}"
               aria-label="${running ? 'Stopp tid' : 'Start tid'}">${running ? '■' : '▶'}</button>` : ''}
        <button class="danger" data-action="remove-set" data-scope="${scope}" data-i="${i}" data-s="${j}" aria-label="Fjern sett">✕</button>
      </div>`;
  }).join('');
  return `
    <div class="set-grid head ${withClock ? 'timed' : ''}"><span class="num">Sett</span><span>Vekt (kg)</span><span>${timed ? 'Tid (sek)' : 'Reps'}</span>${withClock ? '<span></span>' : ''}<span></span></div>
    ${rows}
    <button data-action="add-set" data-scope="${scope}" data-i="${i}" style="width:100%">+ Legg til sett</button>`;
}

function intervalRows(ex, i, scope) {
  const rows = ex.sets.map((s, j) => `
    <div class="set-grid cardio">
      <span class="num">${j + 1}</span>
      <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="00:00" value="${esc(clockValue(s.duration))}" ${fieldAttrs(scope, i, j, 'duration')} data-clock>
      <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="00:00" value="${esc(clockValue(s.rest))}" ${fieldAttrs(scope, i, j, 'rest')} data-clock>
      <input type="text" inputmode="decimal" autocomplete="off" placeholder="km/t" value="${esc(s.speed)}" ${fieldAttrs(scope, i, j, 'speed')}>
      <span class="tempo" data-info="${scope}-${i}-${j}">${cardioInfo(s)}</span>
      <button class="danger" data-action="remove-set" data-scope="${scope}" data-i="${i}" data-s="${j}" aria-label="Fjern intervall">✕</button>
    </div>`).join('');
  return `
    <div class="set-grid cardio head"><span class="num">#</span><span>Aktiv</span><span>Pause</span><span>Km/t</span><span>Tempo</span><span></span></div>
    ${rows}
    <button data-action="add-set" data-scope="${scope}" data-i="${i}" style="width:100%">+ Legg til sett</button>
    ${scope === 'active' ? intervalTimerHtml(ex, i) : ''}`;
}

function turFields(ex, i, scope) {
  if (!ex.sets.length) ex.sets.push(emptySetFor(ex));
  const s = ex.sets[0];
  return `
    <div class="tur-grid">
      <label class="field"><span class="muted small">Distanse (km)</span>
        <input type="text" inputmode="decimal" autocomplete="off" placeholder="km" value="${esc(s.distance)}" ${fieldAttrs(scope, i, 0, 'distance')}></label>
      <label class="field"><span class="muted small">Tid (0430 = 04:30)</span>
        <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="00:00" value="${esc(clockValue(s.duration))}" ${fieldAttrs(scope, i, 0, 'duration')} data-clock></label>
    </div>
    <div class="tur-result" data-info="${scope}-${i}-0">${cardioInfo(s)}</div>`;
}

function setCards(exercises, scope) {
  return exercises.map((ex, i) => {
    const kind = cardioKindOf(ex);
    const cardioSession = !ex.exerciseId && kind; // cardioøkt (ikke øvelse fra biblioteket)
    const last = scope !== 'active' ? null
      : cardioSession ? lastCardio(db.active.workoutId) : lastPerformance(ex.exerciseId);
    const body = kind === 'tur' ? turFields(ex, i, scope)
      : kind === 'intervall' ? intervalRows(ex, i, scope)
      : strengthRows(ex, i, scope);
    return `
      <section class="card">
        <div class="card-head">
          <h3>${esc(ex.name)}</h3>
          ${cardioSession ? `<span class="badge">${esc(sportName(ex.sport))}</span>`
            : `<button class="danger small" data-action="remove-card-ex" data-scope="${scope}" data-i="${i}">Fjern øvelse</button>`}
        </div>
        ${last ? `<div class="muted small" style="margin-bottom:8px">Forrige gang: ${esc(last)}</div>` : ''}
        ${body}
      </section>`;
  }).join('');
}

// ---------- Visninger ----------

function renderCardioList() {
  const items = db.cardioWorkouts.map(w => `
    <div class="list-item clickable" data-action="open-cw" data-id="${w.id}">
      <div><strong>${esc(w.name || 'Uten navn')}</strong><div class="muted small">${esc(cwSummary(w))}</div></div>
      <span class="muted">›</span>
    </div>`).join('');
  return `
    ${modeSwitch()}
    <h1>Cardioøkter</h1>
    <button class="primary big" data-action="new-cw" style="margin-bottom:16px">＋ Opprett ny økt</button>
    ${items || '<p class="empty">Ingen cardioøkter ennå.</p>'}`;
}

function renderCardioWorkout() {
  const isNew = !view.id;
  const w = currentCw();
  if (!w) return go({ name: 'programs' });
  const seg = (key, list, cls = '') => `
    <div class="seg ${cls}">${list.map(o =>
      `<button class="${w[key] === o.id ? 'active' : ''}" data-action="cw-set" data-k="${key}" data-v="${o.id}">${o.name}</button>`).join('')}
    </div>`;
  // Tidsfelt (work/rest) bruker «klokkefelt» som fylles fra høyre: 0430 -> 04:30
  const inp = (key, ph, i) => {
    const clock = key !== 'rounds';
    const v = i === null ? w[key] : w.sets[i][key];
    return `
      <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="${clock ? '00:00' : ph}"
             value="${esc(clock ? clockValue(v) : v)}" data-cw="${key}" ${i === null ? '' : `data-i="${i}"`} ${clock ? 'data-clock' : ''}>`;
  };

  let plan = '';
  if (w.kind === 'intervall') {
    const body = w.plan === 'fast' ? `
      <div class="iv-setup">
        <label class="field"><span class="muted small">Aktiv tid</span>${inp('work', '4:00', null)}</label>
        <label class="field"><span class="muted small">Pause</span>${inp('rest', '2:00', null)}</label>
        <label class="field"><span class="muted small">Antall sett</span>${inp('rounds', '4', null)}</label>
      </div>` : `
      <div class="set-grid dyn head"><span class="num">Sett</span><span>Aktiv tid</span><span>Pause</span><span></span></div>
      ${w.sets.map((s, i) => `
        <div class="set-grid dyn">
          <span class="num">${i + 1}</span>
          ${inp('work', '4:00', i)}
          ${inp('rest', '2:00', i)}
          <button class="danger" data-action="cw-remove-set" data-i="${i}" aria-label="Fjern sett" ${w.sets.length < 2 ? 'disabled' : ''}>✕</button>
        </div>`).join('')}
      <button data-action="cw-add-set" style="width:100%">+ Legg til sett</button>`;
    plan = `
      <div class="field-label">Intervaller</div>
      ${seg('plan', PLANS)}
      ${body}
      <div class="muted small">Skriv tallene etter hverandre, f.eks. 0430 = 04:30.</div>`;
  }

  const fields = `
    <label class="field"><span class="muted small">Navn</span>
      <input type="text" autocomplete="off" placeholder="F.eks. «4×4 intervaller» eller «Rolig tur»" value="${esc(w.name)}" data-cw="name"></label>
    <div class="field-label">Kategori</div>
    ${seg('sport', SPORTS, 'wrap')}
    <div class="field-label">Type</div>
    ${seg('kind', KINDS)}
    ${plan}`;

  return `
    <button class="link" data-action="nav" data-view="programs">‹ Cardioøkter</button>
    <h1>${isNew ? 'Ny cardioøkt' : esc(w.name || 'Uten navn')}</h1>
    ${isNew ? '' : `
      <button class="primary big" data-action="start-cw">▶ Start økt</button>
      <div class="muted small" id="cw-summary" style="margin:8px 0 16px;text-align:center">${esc(cwSummary(w))}</div>`}
    ${isNew ? `
      <div class="card stack">${fields}</div>
      <div class="section"><button class="primary big" data-action="create-cw">Opprett økt</button></div>` : `
      <details class="card new-ex" data-cwedit ${cwEditOpen ? 'open' : ''}>
        <summary><strong>Rediger økt</strong><span class="chev">›</span></summary>
        <div class="stack" style="margin-top:12px">${fields}</div>
        <div class="section"><button class="soft-danger big" data-action="delete-cw">Slett økt</button></div>
      </details>`}`;
}

function renderPrograms() {
  if (mode() === 'cardio') return renderCardioList();
  const list = db.programs.filter(p => p.type === mode());
  const items = list.map(p => `
    <div class="list-item clickable" data-action="open-program" data-id="${p.id}">
      <div><strong>${esc(p.name)}</strong><div class="muted">${p.workouts.length} økt(er)</div></div>
      <span class="muted">›</span>
    </div>`).join('');
  const cardio = mode() === 'cardio';
  return `
    ${modeSwitch()}
    <h1>${cardio ? 'Cardioprogram' : 'Styrkeprogram'}</h1>
    <form class="row" data-form="new-program" style="margin-bottom:16px">
      <input name="name" placeholder="${cardio ? 'Nytt program, f.eks. «Løpeplan»' : 'Nytt program, f.eks. «Push/Pull/Legs»'}" required>
      <button class="primary">Legg til</button>
    </form>
    ${items || '<p class="empty">Ingen program ennå. Opprett ditt første over.</p>'}
    ${freeStartHtml()}`;
}

const freeStartHtml = () => `
  <div class="section">
    <button class="free-start" data-action="start-free">
      <span class="free-icon">▶</span>
      <strong>Start ny økt</strong>
    </button>
  </div>`;

function renderProgram() {
  const p = getProgram(view.programId);
  if (!p) return go({ name: 'programs' });
  const items = p.workouts.map(w => `
    <div class="list-item clickable" data-action="open-workout" data-id="${w.id}">
      <div><strong>${esc(w.name)}</strong><div class="muted">${w.exerciseIds.length} øvelse(r)</div></div>
      <span class="muted">›</span>
    </div>`).join('');
  return `
    ${modeSwitch()}
    <button class="link" data-action="all-programs">‹ Alle program</button>
    <h1 class="title-row">${esc(p.name)}${renameBtn('program')}</h1>
    ${items || '<p class="empty">Ingen økter i dette programmet ennå.</p>'}
    <form class="row section" data-form="new-workout">
      <input name="name" placeholder="${p.type === 'cardio' ? 'Ny økt, f.eks. «Intervalldag»' : 'Ny økt, f.eks. «Push dag»'}" required>
      <button class="primary">Legg til</button>
    </form>
    <div class="section"><button class="soft-danger big" data-action="delete-program">Slett program</button></div>`;
}

const renameBtn = what => `
  <button class="icon-btn" data-action="rename" data-what="${what}" aria-label="Endre navn">${ICONS.edit}</button>`;

function renderWorkout() {
  const p = getProgram(view.programId);
  const w = getWorkout(view.programId, view.workoutId);
  if (!w) return go({ name: 'program', programId: view.programId });
  const items = w.exerciseIds.map((id, i) => {
    const e = getExercise(id);
    return `
      <div class="list-item" data-drag-item>
        <span class="drag-handle" aria-label="Dra for å flytte">${ICONS.grip}</span>
        <div class="grow">${esc(exName(id))}
          <div class="muted small">${e ? esc(exLabel(e)) : ''}</div></div>
        <button class="remove" data-action="remove-ex" data-i="${i}">Fjern</button>
      </div>`;
  }).join('');
  return `
    <button class="link" data-action="open-program" data-id="${p.id}">‹ ${esc(p.name)}</button>
    <h1 class="title-row">${esc(w.name)}${renameBtn('workout')}</h1>
    ${items ? `<div class="drag-list" data-drag-list="workout">${items}</div>
      ${w.exerciseIds.length > 1 ? '<div class="muted small" style="margin-top:-2px">Hold i ⠿ og dra for å endre rekkefølge.</div>' : ''}`
      : '<p class="empty">Ingen øvelser ennå. Søk opp og legg til under.</p>'}
    <div class="section">${exercisePicker('add-ex-to-workout', p.type)}</div>
    <div class="section">
      <button class="primary big" data-action="start-session" ${w.exerciseIds.length ? '' : 'disabled'}>▶ Start økt</button>
    </div>
    <div class="section"><button class="soft-danger big" data-action="delete-workout">Slett økt</button></div>`;
}

function libraryItem(e, showGroup) {
  const meta = showGroup ? exLabel(e) : exMeta(e);
  return `
    <div class="list-item clickable" data-action="open-exercise" data-id="${e.id}">
      <div>${esc(e.name)}${meta ? `<div class="muted small">${esc(meta)}</div>` : ''}</div>
      <span class="muted">›</span>
    </div>`;
}

function libraryGroupsHtml() {
  const type = 'styrke'; // cardio ligger som egne økter, ikke i biblioteket
  const sorted = db.exercises.filter(e => e.type === type).sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  const q = libQuery.trim().toLowerCase();
  if (q) {
    const hits = sorted.filter(e => matchesQuery(e, q));
    return hits.map(e => libraryItem(e, true)).join('') || '<p class="empty">Ingen treff.</p>';
  }
  const groupOf = e => (type === 'cardio' ? e.kind : e.category) || '';
  const groups = type === 'cardio' ? [...KINDS] : [...CATEGORIES];
  if (sorted.some(e => !groupOf(e))) groups.push({ id: '', name: type === 'cardio' ? 'Uten type' : 'Uten muskelgruppe' });
  return groups.map(g => {
    const list = sorted.filter(e => groupOf(e) === g.id);
    return `
      <details class="group" data-cat="${type}-${g.id}" ${openCats.has(`${type}-${g.id}`) ? 'open' : ''}>
        <summary><span class="menu-row"><span class="menu-ico">${MUSCLE_ICONS[g.id] ?? MUSCLE_ICONS['']}</span><strong>${esc(g.name)}</strong></span><span class="muted">${list.length}</span></summary>
        <div class="group-body">${list.map(e => libraryItem(e, false)).join('') ||
          '<div class="muted small" style="padding:0 4px 8px">Ingen øvelser ennå</div>'}</div>
      </details>`;
  }).join('');
}

function renderLibrary() {
  return `
    <h1>Øvelser</h1>
    <details class="card new-ex" data-newex ${newExOpen ? 'open' : ''}>
      <summary><strong>＋ Opprett ny øvelse</strong><span class="chev">›</span></summary>
      <form class="stack" data-form="new-exercise" style="margin-top:12px">
        ${exerciseFormFields({}, 'styrke')}
        <button class="primary">Legg til</button>
      </form>
    </details>
    <h2 class="section">Øvelsesbibliotek</h2>
    <label class="search" style="margin-bottom:10px">${ICONS.search}
      <input type="search" placeholder="Søk i biblioteket…" autocomplete="off" data-lib-search value="${esc(libQuery)}"></label>
    <div id="lib-groups">${libraryGroupsHtml()}</div>`;
}

const statTile = (value, label) => `<div class="stat"><div class="value">${value}</div><div class="label">${label}</div></div>`;
const bestCard = (label, best, value) => `
  <div class="card">
    <div class="muted small">${label}</div>
    <strong>${best ? value : '–'}</strong>
    ${best ? `<div class="muted small">${formatDay(best.date)}</div>` : ''}
  </div>`;

function strengthExerciseStats(ex, entries) {
  let kg = 0, reps = 0, secs = 0, sets = 0, bestVol = null, heaviest = null, longest = null;
  entries.forEach(({ h, sets: ss }) => ss.forEach(s => {
    const w = num(s.weight), r = num(s.reps), t = num(s.time), vol = w * r;
    kg += vol; reps += r; secs += t; sets++;
    if (!bestVol || vol > bestVol.vol) bestVol = { s, vol, date: h.startedAt };
    if (!heaviest || w > heaviest.w || (w === heaviest.w && r > heaviest.r)) heaviest = { s, w, r, date: h.startedAt };
    if (!longest || t > longest.t) longest = { s, t, date: h.startedAt };
  }));
  const tiles = ex.timed
    ? statTile(fmtSecs(secs), 'Total tid') + statTile(longest ? fmtSecs(longest.t) : '–', 'Lengste sett')
    : statTile(`${fmt(kg)} kg`, 'Totalt løftet') + statTile(fmt(reps), 'Totalt reps');
  const bests = ex.timed
    ? (heaviest && heaviest.w ? bestCard('Sett med høyest vekt', heaviest, esc(setText(heaviest.s))) : '')
    : bestCard('Sett med høyest volum (kg × reps)', bestVol, bestVol ? `${esc(setText(bestVol.s))} = ${fmt(bestVol.vol)} kg` : '') +
      bestCard('Sett med høyest vekt', heaviest, heaviest ? esc(setText(heaviest.s)) : '');
  return `
    <div class="stat-grid">${tiles}${statTile(sets, 'Totalt sett')}${statTile(entries.length, 'Økter')}</div>
    ${bests}`;
}

function cardioExerciseStats(ex, entries) {
  let dist = 0, secs = 0, n = 0, fastest = null, longest = null;
  const interval = ex.kind === 'intervall';
  entries.forEach(({ h, sets: ss }) => ss.forEach(s => {
    const c = cardioNumbers(s);
    dist += c.dist; secs += c.secs; n++;
    if (c.speed && (!fastest || c.speed > fastest.v)) fastest = { s, v: c.speed, date: h.startedAt };
    const len = interval ? c.secs : c.dist;
    if (len && (!longest || len > longest.v)) longest = { s, v: len, date: h.startedAt };
  }));
  return `
    <div class="stat-grid">
      ${statTile(`${fmt(dist)} km`, 'Total distanse')}
      ${statTile(secs ? fmtClock(secs) : '–', 'Total tid')}
      ${statTile(n, interval ? 'Intervaller' : 'Turer')}
      ${statTile(secs ? `${fmt(dist / (secs / 3600))} km/t` : '–', 'Snittfart')}
    </div>
    ${bestCard(interval ? 'Raskeste intervall' : 'Raskeste tur (snittfart)', fastest, fastest ? esc(setText(fastest.s)) : '')}
    ${bestCard(interval ? 'Lengste intervall' : 'Lengste tur', longest, longest ? esc(setText(longest.s)) : '')}`;
}

function renderExercise() {
  const ex = getExercise(view.exerciseId);
  if (!ex) return go({ name: 'library' });

  // Alle økter der øvelsen er med, nyeste først
  const entries = db.history
    .filter(h => h.exercises.some(e => e.exerciseId === ex.id))
    .sort((a, b) => b.startedAt - a.startedAt)
    .map(h => ({ h, sets: h.exercises.filter(e => e.exerciseId === ex.id).flatMap(e => e.sets) }))
    .filter(x => x.sets.length);

  const historyHtml = entries.map(({ h, sets: ss }) => `
    <div class="card">
      <strong>${esc(formatDate(h.startedAt))}</strong>
      <div class="muted small">${esc(h.workoutName)}</div>
      <div class="muted" style="margin-top:6px">${ss.map((s, i) => `${ss.length > 1 ? `${i + 1}: ` : ''}${esc(setText(s))}`).join('<br>')}</div>
    </div>`).join('');

  return `
    <button class="link" data-action="nav" data-view="library">‹ Øvelser</button>
    <h1 style="margin-bottom:4px">${esc(ex.name)}</h1>
    <div class="muted" style="margin-bottom:16px">${esc(exLabel(ex))}</div>
    ${ex.type === 'cardio' ? cardioExerciseStats(ex, entries) : strengthExerciseStats(ex, entries)}

    <h2 class="section">Logg</h2>
    ${historyHtml || '<p class="empty">Ingen fullførte økter med denne øvelsen ennå.</p>'}

    <details class="card section">
      <summary><strong>Rediger øvelse</strong></summary>
      <form class="stack" data-form="edit-exercise" style="margin-top:12px">
        ${exerciseFormFields(ex, ex.type)}
        <button class="primary">Lagre</button>
      </form>
    </details>
    <div class="section"><button class="soft-danger big" data-action="delete-exercise">Slett øvelse</button></div>`;
}

// ---------- Statistikk ----------

function statsSince() {
  const days = statsState.period === 'custom'
    ? parseInt(statsState.days, 10) || 0
    : { '7': 7, '30': 30, '90': 90 }[statsState.period] || 0;
  return days ? Date.now() - days * 864e5 : 0;
}

function strengthStatsHtml(histories) {
  const stats = {};
  let total = 0, totalKg = 0;
  const sessions = histories.filter(h => h.type === 'styrke');
  sessions.forEach(h => h.exercises.forEach(he => {
    const ex = getExercise(he.exerciseId);
    if (!ex || ex.type !== 'styrke' || !ex.category || !he.sets.length) return;
    const st = stats[ex.category] ??= { sets: 0, kg: 0, subs: {} };
    he.sets.forEach(s => { const kg = num(s.weight) * num(s.reps); st.sets++; st.kg += kg; totalKg += kg; });
    ex.subs.forEach(sub => { st.subs[sub] = (st.subs[sub] || 0) + he.sets.length; });
    total += he.sets.length;
  }));
  if (!total) return '<p class="empty">Ingen fullførte styrkesett i denne perioden.</p>';

  const max = Math.max(1, ...Object.values(stats).map(s => s.sets));
  const rows = CATEGORIES
    .map(c => ({ c, s: stats[c.id] || { sets: 0, kg: 0, subs: {} } }))
    .sort((a, b) => b.s.sets - a.s.sets)
    .map(({ c, s }) => {
      const subs = c.subs.filter(sub => s.subs[sub]).sort((a, b) => s.subs[b] - s.subs[a]);
      return `
        <div class="card">
          <div class="card-head" style="margin:0">
            <strong>${c.name}</strong>
            <span class="muted small">${s.sets} sett · ${fmt(s.kg)} kg · ${Math.round(s.sets / total * 100)} %</span>
          </div>
          <div class="bar"><span style="width:${s.sets / max * 100}%"></span></div>
          ${subs.map(sub => `
            <div class="sub-stat">
              <span class="muted small">${esc(sub)}</span>
              <div class="bar thin"><span style="width:${s.subs[sub] / max * 100}%"></span></div>
              <span class="muted small">${s.subs[sub]}</span>
            </div>`).join('')}
        </div>`;
    }).join('');
  return `
    <div class="stat-grid">
      ${statTile(sessions.length, 'Økter')}
      ${statTile(total, 'Sett')}
    </div>
    <div class="stat-grid" style="grid-template-columns:1fr">${statTile(`${fmt(totalKg)} kg`, 'Totalt løftet')}</div>
    <h2 class="section">Muskelgrupper</h2>
    ${rows}
    <p class="muted small">Antall sett fordelt på øvelsens muskelgruppe. Kg = vekt × reps.</p>`;
}

function cardioStatsHtml(histories) {
  const sessions = histories.filter(h => h.type === 'cardio');
  const stats = {};
  let dist = 0, secs = 0;
  sessions.forEach(h => h.exercises.forEach(he => {
    const sport = getExercise(he.exerciseId)?.sport ?? he.sport;
    if (!sport) return;
    const st = stats[sport] ??= { dist: 0, secs: 0, sessions: new Set() };
    he.sets.forEach(s => {
      if (!isIntervalSet(s) && !isTurSet(s)) return;
      const c = cardioNumbers(s);
      st.dist += c.dist; st.secs += c.secs; dist += c.dist; secs += c.secs;
      st.sessions.add(h.id);
    });
  }));
  if (!sessions.length) return '<p class="empty">Ingen fullførte cardioøkter i denne perioden.</p>';

  const max = Math.max(1, ...Object.values(stats).map(s => s.secs));
  const rows = SPORTS
    .map(sp => ({ sp, s: stats[sp.id] || { dist: 0, secs: 0, sessions: new Set() } }))
    .sort((a, b) => b.s.secs - a.s.secs)
    .map(({ sp, s }) => `
      <div class="card">
        <div class="card-head" style="margin:0">
          <strong>${sp.name}</strong>
          <span class="muted small">${fmt(s.dist)} km · ${s.secs ? fmtClock(s.secs) : '0:00'} · ${s.sessions.size} økt(er)</span>
        </div>
        <div class="bar"><span style="width:${s.secs / max * 100}%"></span></div>
        ${s.dist && s.secs ? `<div class="muted small" style="margin-top:6px">Snitt ${fmt(s.dist / (s.secs / 3600))} km/t · ${fmtPace(s.secs / s.dist)}</div>` : ''}
      </div>`).join('');
  return `
    <div class="stat-grid">
      ${statTile(`${fmt(dist)} km`, 'Total distanse')}
      ${statTile(secs ? fmtClock(secs) : '–', 'Total tid')}
      ${statTile(sessions.length, 'Økter')}
      ${statTile(secs ? `${fmt(dist / (secs / 3600))} km/t` : '–', 'Snittfart')}
    </div>
    <h2 class="section">Kategorier</h2>
    ${rows}
    <p class="muted small">Stolpene viser tid brukt per kategori.</p>`;
}

function statsPeriodsHtml() {
  return [['7', '7 dager'], ['30', '30 dager'], ['90', '90 dager'], ['all', 'Alt']].map(([p, label]) =>
    `<button class="${statsState.period === p ? 'active' : ''}" data-action="stats-period" data-p="${p}">${label}</button>`).join('');
}

function statsBodyHtml() {
  const since = statsSince();
  const histories = db.history.filter(h => h.startedAt >= since);
  if (statsState.type === 'vekt') return bodyweightHtml(since);
  return statsState.type === 'cardio' ? cardioStatsHtml(histories) : strengthStatsHtml(histories);
}

function renderStats() {
  statsState.type ??= mode();
  return `
    <button class="link" data-action="nav" data-view="profile">‹ Profil</button>
    <h1>Statistikk</h1>
    <div class="seg mode-seg stats-seg">${[...MODES, { id: 'vekt', name: 'Kroppsvekt' }].map(m =>
      `<button class="${statsState.type === m.id ? 'active' : ''}" data-action="stats-type" data-t="${m.id}">${icon(m.id)}${m.name}</button>`).join('')}
    </div>
    <div class="seg" id="stats-periods">${statsPeriodsHtml()}</div>
    <label class="days-row">
      <span class="muted">Eller siste</span>
      <input type="text" inputmode="numeric" pattern="[0-9]*" placeholder="antall" value="${esc(statsState.days)}" data-stats-days>
      <span class="muted">dager</span>
    </label>
    <div id="stats-body">${statsBodyHtml()}</div>`;
}

function renderSession() {
  const a = db.active;
  if (!a) return go(homeProgramView());
  return `
    ${setCards(a.exercises, 'active') || '<p class="empty">Ingen øvelser i økta. Legg til under.</p>'}
    ${a.type === 'cardio' ? '' : exercisePicker('session-add-exercise', a.type)}
    <div class="section stack">
      <button class="primary big" data-action="finish-session">✓ Fullfør økt</button>
      <button class="soft-danger big" data-action="cancel-session">Avbryt økt</button>
    </div>`;
}

function renderHistory() {
  const list = db.history
    .filter(h => historyFilter === 'alle' || h.type === historyFilter)
    .sort((a, b) => b.startedAt - a.startedAt);
  const items = list.map(h => `
    <details class="card">
      <summary>
        <div class="row" style="justify-content:space-between">
          <strong>${esc(h.workoutName)}</strong>
          <span class="badge">${h.type === 'cardio' ? 'Cardio' : 'Styrke'}</span>
        </div>
        <div class="muted">${[esc(h.programName), formatDate(h.startedAt), formatDuration(h.endedAt - h.startedAt)].filter(Boolean).join(' · ')}</div>
      </summary>
      ${h.exercises.map(ex => `
        <div class="history-ex">
          <strong>${esc(ex.name)}</strong>
          <div class="muted">${ex.sets.map((s, i) => `${ex.sets.length > 1 ? `${i + 1}: ` : ''}${esc(setText(s))}`).join('<br>') || 'Ingen sett'}</div>
        </div>`).join('')}
      <div class="section row">
        <button class="grow" data-action="edit-history" data-id="${h.id}">Rediger</button>
        <button class="grow soft-danger" data-action="delete-history" data-id="${h.id}">Slett</button>
      </div>
    </details>`).join('');
  const seg = [['alle', 'Alle'], ['styrke', 'Styrke'], ['cardio', 'Cardio']].map(([f, label]) =>
    `<button class="${historyFilter === f ? 'active' : ''}" data-action="history-filter" data-f="${f}">${label}</button>`).join('');
  return `
    <h1>Logg</h1>
    <div class="seg">${seg}</div>
    ${items || '<p class="empty">Ingen fullførte økter her ennå.</p>'}`;
}

function renderHistoryEdit() {
  const d = editDraft;
  if (!d) return go({ name: 'history' });
  return `
    <button class="link" data-action="nav" data-view="history">‹ Logg</button>
    <h1 style="margin-bottom:4px">Rediger økt</h1>
    <div class="muted" style="margin-bottom:16px">${[esc(d.workoutName), esc(d.programName)].filter(Boolean).join(' · ')}</div>
    <div class="card stack">
      <label class="field"><span class="muted small">Starttid</span>
        <input type="datetime-local" value="${esc(d._start)}" data-meta="_start"></label>
      <label class="field"><span class="muted small">Varighet (minutter)</span>
        <input type="text" inputmode="numeric" pattern="[0-9]*" value="${esc(d._minutes)}" data-meta="_minutes"></label>
    </div>
    ${setCards(d.exercises, 'edit')}
    ${d.type === 'cardio' ? '' : exercisePicker('edit-add-exercise', d.type)}
    <div class="section stack">
      <button class="primary big" data-action="save-history">Lagre endringer</button>
      <button class="big" data-action="nav" data-view="history">Avbryt</button>
    </div>`;
}

function weightChart(list) {
  const W = 320, H = 140, P = 12;
  const xs = list.map(e => e.date), ys = list.map(e => num(e.kg));
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const sx = t => (x1 === x0 ? W / 2 : P + (t - x0) / (x1 - x0) * (W - 2 * P));
  const sy = v => (y1 === y0 ? H / 2 : H - P - (v - y0) / (y1 - y0) * (H - 2 * P));
  const pts = list.map((e, i) => `${sx(xs[i]).toFixed(1)},${sy(ys[i]).toFixed(1)}`);
  return `
    <div class="card">
      <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Utvikling i kroppsvekt">
        <polyline points="${pts.join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        ${pts.map(p => { const [x, y] = p.split(','); return `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--accent)"/>`; }).join('')}
      </svg>
      <div class="row muted small" style="justify-content:space-between;margin-top:6px">
        <span>${formatDay(x0)}</span><span>min ${fmt(y0)} · maks ${fmt(y1)} kg</span><span>${formatDay(x1)}</span>
      </div>
    </div>`;
}

// Kroppsvekt (vises under Statistikk). since = vis bare registreringer etter dette tidspunktet
function bodyweightHtml(since = 0) {
  const all = [...db.bodyweight].sort((a, b) => a.date - b.date);
  const list = all.filter(e => e.date >= since);
  const latest = all[all.length - 1];
  const prev = all[all.length - 2];
  const change = (from, label) => {
    if (!from || from === latest) return '';
    const d = num(latest.kg) - num(from.kg);
    return `<div class="muted small">${d > 0 ? '+' : ''}${fmt(d)} kg ${label}</div>`;
  };
  return `
    ${latest ? `
      <div class="stat-grid">
        <div class="stat"><div class="value">${fmt(num(latest.kg))} kg</div><div class="label">Nå (${formatDay(latest.date)})</div></div>
        <div class="stat">${change(prev, 'siden forrige') || '<div class="muted small">–</div>'}${change(list[0], since ? 'i perioden' : 'totalt')}</div>
      </div>` : ''}
    <form class="card stack" data-form="new-bodyweight">
      <strong>Legg inn vekt</strong>
      <div class="row">
        <input name="kg" type="text" inputmode="decimal" autocomplete="off" placeholder="kg" data-clean="decimal" required>
        <input name="date" type="date" value="${toLocalInput(Date.now()).slice(0, 10)}" required>
      </div>
      <button class="primary">Lagre</button>
    </form>
    ${list.length >= 2 ? weightChart(list) : ''}
    <h2 class="section">Registreringer</h2>
    ${[...list].reverse().map(e => `
      <div class="list-item">
        <span>${formatDay(e.date)}</span>
        <span class="row"><strong>${fmt(num(e.kg))} kg</strong>
          <button class="danger" data-action="delete-bw" data-id="${e.id}" aria-label="Slett">✕</button></span>
      </div>`).join('') || `<p class="empty">Ingen registreringer${since ? ' i denne perioden' : ' ennå'}.</p>`}`;
}

function renderProfile() {
  return `
    <h1>Profil</h1>
    <div class="list-item clickable" data-action="nav" data-view="stats">
      <span class="menu-row"><span class="menu-ico">${ICONS.stats}</span><strong>Statistikk</strong></span><span class="muted">›</span>
    </div>
    <div class="list-item clickable" data-action="nav" data-view="settings">
      <span class="menu-row"><span class="menu-ico">${ICONS.settings}</span><strong>Innstillinger</strong></span><span class="muted">›</span>
    </div>
    <div class="list-item clickable" data-action="share-app">
      <span class="menu-row"><span class="menu-ico">${ICONS.share}</span><strong>Del appen</strong></span><span class="muted">›</span>
    </div>
    ${isStandalone() ? '' : `
    <div class="list-item clickable" data-action="install-help">
      <span class="menu-row"><span class="menu-ico">${ICONS.addHome}</span><strong>Legg til på Hjem-skjerm</strong></span><span class="muted">›</span>
    </div>`}`;
}

const dots = colors => `<span class="dots"><span style="background:${colors.bg}"></span><span style="background:${colors.accent}"></span></span>`;

function themesHtml() {
  const c = currentColors();
  const same = colors => Object.keys(DEFAULT_COLORS).every(k => colors[k].toLowerCase() === c[k].toLowerCase());
  return THEMES.map((t, i) => `
    <button class="theme-btn" data-action="apply-theme" data-i="${i}"
            style="background:${t.colors.card};color:${t.colors.text};${db.settings.activeSlot === null && same(t.colors) ? `border-color:${c.accent}` : ''}">
      ${t.icon ? `<span class="theme-ico" style="color:${t.colors.accent}">${HERO_ICONS[t.icon]}</span>` : dots(t.colors)}${t.name}
    </button>`).join('');
}

function slotsHtml() {
  const c = currentColors();
  const { custom, activeSlot } = db.settings;
  return custom.map((s, i) => s.colors ? `
    <button class="theme-btn slot" data-action="apply-slot" data-i="${i}"
            style="background:${s.colors.card};color:${s.colors.text};${activeSlot === i ? `border-color:${c.accent}` : ''}">
      ${dots(s.colors)}${esc(s.name)}
      ${activeSlot === i ? '<span class="small" style="opacity:.7">I bruk – redigeres under</span>' : ''}
    </button>` : `
    <button class="theme-btn slot empty" data-action="apply-slot" data-i="${i}">
      <span style="font-size:1.3rem">+</span>${esc(s.name)}
      <span class="small muted">Tomt – trykk for å lage</span>
    </button>`).join('');
}

function renderSettings() {
  const s = db.settings;
  const themeName = s.activeSlot !== null ? s.custom[s.activeSlot].name
    : (THEMES.find(x => Object.keys(DEFAULT_COLORS).every(k => x.colors[k].toLowerCase() === currentColors()[k].toLowerCase())) ?? { name: 'Egne farger' }).name;
  return `
    <button class="link" data-action="nav" data-view="profile">‹ Profil</button>
    <h1>Innstillinger</h1>
    <div class="list-item clickable" data-action="nav" data-view="colors">
      <span class="menu-row"><span class="menu-ico">${ICONS.palette}</span>
        <span><strong>Farger og tema</strong><div class="muted small">${esc(themeName)}</div></span></span>
      <span class="muted">›</span>
    </div>`;
}

function renderColors() {
  const c = currentColors();
  const { custom, activeSlot } = db.settings;
  const fields = COLOR_FIELDS.map(([k, label]) => `
    <label class="color-row">
      <span>${label}</span>
      <input type="color" value="${c[k]}" data-color="${k}">
    </label>`).join('');

  const editing = activeSlot !== null ? custom[activeSlot] : null;
  const header = editing
    ? `<div class="card stack">
         <label class="field"><span class="muted small">Navn på tema</span>
           <input type="text" value="${esc(editing.name)}" maxlength="20" data-theme-name></label>
         <div class="muted small">Endringer i fargene under lagres automatisk i dette temaet.</div>
       </div>`
    : `<p class="muted small" style="margin-top:0">Juster fargene og lagre dem som ett av dine egne temaer.</p>`;
  const saveButtons = editing ? '' : `
    <div class="row section">
      ${custom.map((s, i) => `<button class="grow" data-action="save-slot" data-i="${i}">Lagre som «${esc(s.name)}»</button>`).join('')}
    </div>`;

  return `
    <button class="link" data-action="nav" data-view="settings">‹ Innstillinger</button>
    <h1>Farger og tema</h1>
    <h2>Mine temaer</h2>
    <div class="slots" id="slots">${slotsHtml()}</div>
    <h2 class="section">Ferdige temaer</h2>
    <div class="themes" id="themes">${themesHtml()}</div>
    <h2 class="section">${editing ? `Rediger «${esc(editing.name)}»` : 'Egne farger'}</h2>
    ${header}
    <div class="card" style="padding-top:4px;padding-bottom:4px">${fields}</div>
    ${saveButtons}
    <div class="section">
      <button class="soft-danger big" data-action="reset-colors">Tilbakestill farger</button>
    </div>`;
}

function renderHeader() {
  const top = document.getElementById('top');
  top.classList.toggle('has-timer', !!db.active);
  if (!db.active) { top.innerHTML = ''; return; }
  const onSession = view.name === 'session';
  top.innerHTML = `
    <div class="timer-bar">
      <span class="title">${esc(db.active.workoutName)}
        ${db.active.intervalTimer ? '<span class="iv-header" id="iv-header"></span>' : ''}</span>
      <span class="row">
        <span class="time" id="timer">${formatDuration(Date.now() - db.active.startedAt)}</span>
        ${onSession ? '' : '<button data-action="nav" data-view="session">Til økt</button>'}
      </span>
    </div>`;
}

const VIEWS = {
  programs: renderPrograms, program: renderProgram, workout: renderWorkout,
  library: renderLibrary, exercise: renderExercise, stats: renderStats,
  session: renderSession, history: renderHistory, historyEdit: renderHistoryEdit,
  profile: renderProfile, settings: renderSettings, colors: renderColors, cardioWorkout: renderCardioWorkout,
};

const TAB_OF = { program: 'programs', workout: 'programs', cardioWorkout: 'programs', exercise: 'library', stats: 'profile', settings: 'profile', colors: 'profile', historyEdit: 'history' };

function render() {
  const html = VIEWS[view.name]();
  if (html === undefined) return; // go() har allerede rendret
  document.getElementById('app').innerHTML = (showInstallBanner() && view.name !== 'session' ? installBannerHtml() : '') + html;
  if (!typesKeyboard(document.activeElement)) document.body.classList.remove('kb-open');
  renderHeader();
  const tab = TAB_OF[view.name] ?? view.name;
  document.querySelectorAll('#nav button').forEach(b =>
    b.classList.toggle('active', b.dataset.view === tab));
}

// Husker siste side i hver fane, så man kommer tilbake dit man var
const lastViewByTab = {};

function go(newView) {
  view = newView;
  const tab = TAB_OF[view.name] ?? view.name;
  if (['programs', 'library', 'history', 'profile'].includes(tab)) lastViewByTab[tab] = view;
  render();
  window.scrollTo(0, 0);
}

// ---------- Timer ----------

function tick() {
  const el = document.getElementById('timer');
  if (el && db.active) el.textContent = formatDuration(Date.now() - db.active.startedAt);
  const sw = db.active?.stopwatch;
  if (sw) {
    const input = document.querySelector(`[data-scope="active"][data-i="${sw.i}"][data-s="${sw.s}"][data-field="time"]`);
    if (input) input.value = stopwatchSecs(sw);
  }
  tickIntervalTimer();
}
setInterval(tick, 250);
document.addEventListener('visibilitychange', tick);

// ---------- Handlinger ----------

const actions = {
  // Menylinja nederst: tilbake til siste side i fanen. Trykk på fanen du allerede er i = gå til toppen av fanen.
  'tab': d => {
    const current = TAB_OF[view.name] ?? view.name;
    const last = lastViewByTab[d.view];
    if (last && current !== d.view) go(last);
    else actions.nav(d);
  },
  'nav': d => {
    if (d.view === 'stats') statsState.type = null; // start på valgt modus
    if (d.view === 'library') newExOpen = false;
    go(d.view === 'programs' ? homeProgramView() : { name: d.view });
  },
  'set-mode': d => {
    db.settings.mode = d.mode;
    libQuery = '';
    save();
    go(homeProgramView());
  },
  'all-programs': () => go({ name: 'programs' }),
  'open-program': d => go({ name: 'program', programId: d.id }),
  'open-workout': d => go({ name: 'workout', programId: view.programId, workoutId: d.id }),
  'open-exercise': d => go({ name: 'exercise', exerciseId: d.id }),
  'history-filter': d => { historyFilter = d.f; render(); },
  'stats-type': d => { statsState.type = d.t; render(); },
  'stats-period': d => { statsState.period = d.p; statsState.days = ''; render(); },

  'pick-ex': d => {
    forms[d.target]?.({ exerciseId: d.id });
    save(); render();
  },

  'rename': async d => {
    const isProgram = d.what === 'program';
    const obj = isProgram ? getProgram(view.programId) : getWorkout(view.programId, view.workoutId);
    const name = await askText(isProgram ? 'Endre navn på program' : 'Endre navn på økt', obj.name);
    if (!name || name === obj.name) return;
    obj.name = name;
    // Pågående økt fra dette programmet / denne økta får også nytt navn
    if (db.active && (isProgram ? db.active.programId === obj.id : db.active.workoutId === obj.id)) {
      db.active[isProgram ? 'programName' : 'workoutName'] = name;
    }
    save(); render();
  },
  'share-app': () => shareApp(),
  'install-help': () => showInstallHelp(),
  'install-dismiss': () => {
    try { localStorage.setItem(INSTALL_KEY, '1'); } catch (e) { /* ignorer */ }
    render();
  },
  'delete-program': async () => {
    const p = getProgram(view.programId);
    if (!await ask(`Slette «${p.name}»?`, 'Programmet og alle øktene i det slettes. Loggen beholdes.', { ok: 'Slett program' })) return;
    db.programs = db.programs.filter(x => x !== p);
    save(); go({ name: 'programs' });
  },
  'delete-workout': async () => {
    const p = getProgram(view.programId);
    const w = getWorkout(view.programId, view.workoutId);
    if (!await ask(`Slette «${w.name}»?`, 'Økta fjernes fra programmet. Loggen beholdes.', { ok: 'Slett økt' })) return;
    p.workouts = p.workouts.filter(x => x !== w);
    save(); go({ name: 'program', programId: p.id });
  },
  'remove-ex': async d => {
    const w = getWorkout(view.programId, view.workoutId);
    if (!await ask(`Fjerne «${exName(w.exerciseIds[+d.i])}»?`, `Øvelsen fjernes fra «${w.name}». Den ligger fortsatt i øvelsesbiblioteket.`, { ok: 'Fjern øvelse' })) return;
    w.exerciseIds.splice(+d.i, 1);
    save(); render();
  },
  'move-ex': d => {
    const ids = getWorkout(view.programId, view.workoutId).exerciseIds;
    const i = +d.i, j = i + +d.dir;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    save(); render();
  },
  'delete-exercise': async () => {
    const e = getExercise(view.exerciseId);
    if (!await ask(`Slette «${e.name}»?`, 'Den fjernes fra biblioteket og fra øktene den er lagt i. Loggen beholdes.', { ok: 'Slett øvelse' })) return;
    db.exercises = db.exercises.filter(x => x !== e);
    db.programs.forEach(p => p.workouts.forEach(w => {
      w.exerciseIds = w.exerciseIds.filter(id => id !== e.id);
    }));
    save(); go({ name: 'library' });
  },

  'start-session': async () => {
    const p = getProgram(view.programId);
    const w = getWorkout(view.programId, view.workoutId);
    if (db.active && !await ask('Du har allerede en økt i gang', `Vil du avbryte «${db.active.workoutName}» og starte en ny?`, { ok: 'Start ny økt' })) return;
    stopIntervalTimer();
    db.active = {
      type: p.type,
      programId: p.id,
      workoutId: w.id,
      programName: p.name,
      workoutName: w.name,
      startedAt: Date.now(),
      exercises: w.exerciseIds.map(sessionEx),
    };
    db.lastProgramByMode[p.type] = p.id;
    save(); go({ name: 'session' });
  },
  // Økt uten program – øvelser legges til underveis
  'start-free': async () => {
    if (db.active && !await ask('Du har allerede en økt i gang', `Vil du avbryte «${db.active.workoutName}» og starte en ny?`, { ok: 'Start ny økt' })) return;
    stopIntervalTimer();
    db.active = {
      type: mode(),
      programId: null,
      workoutId: null,
      programName: '',
      workoutName: mode() === 'cardio' ? 'Fri cardioøkt' : 'Fri styrkeøkt',
      startedAt: Date.now(),
      exercises: [],
    };
    save(); go({ name: 'session' });
  },
  // Cardioøkter
  'new-cw': () => { cwDraft = newCardioDraft(); go({ name: 'cardioWorkout', id: null }); },
  'open-cw': d => { cwEditOpen = false; go({ name: 'cardioWorkout', id: d.id }); },
  'cw-set': d => {
    const w = currentCw();
    // Fra fast til dynamisk: start med settene fra det faste oppsettet
    if (d.k === 'plan' && d.v === 'dynamisk' && w.plan === 'fast') {
      const sets = cwPlanSets(w);
      if (sets.length) w.sets = sets.map(s => ({ ...s }));
    }
    w[d.k] = d.v;
    if (view.id) save();
    render();
  },
  'cw-add-set': () => {
    const w = currentCw();
    const prev = w.sets[w.sets.length - 1];
    w.sets.push(prev ? { ...prev } : { work: '4', rest: '2' });
    if (view.id) save();
    render();
  },
  'cw-remove-set': d => {
    currentCw().sets.splice(+d.i, 1);
    if (view.id) save();
    render();
  },
  'create-cw': () => {
    const w = cwDraft;
    w.name = w.name.trim();
    if (!w.name) { notice('Mangler navn', 'Gi økta et navn, f.eks. «4×4 intervaller».'); return; }
    if (w.kind === 'intervall' && !cwPlanSets(w).some(s => parseDuration(s.work))) {
      notice('Mangler tid', 'Fyll inn aktiv tid og antall sett.'); return;
    }
    w.id = uid();
    db.cardioWorkouts.push(w);
    cwDraft = null;
    save(); go({ name: 'cardioWorkout', id: w.id });
  },
  'delete-cw': async () => {
    const w = getCw(view.id);
    if (!await ask(`Slette «${w.name}»?`, 'Økta slettes. Loggen beholdes.', { ok: 'Slett økt' })) return;
    db.cardioWorkouts = db.cardioWorkouts.filter(x => x !== w);
    save(); go({ name: 'programs' });
  },
  'start-cw': async () => {
    const w = getCw(view.id);
    const plan = cwPlanSets(w);
    if (w.kind === 'intervall' && !plan.some(s => parseDuration(s.work))) {
      notice('Mangler tid', 'Legg inn aktiv tid for settene først.'); return;
    }
    if (db.active && !await ask('Du har allerede en økt i gang', `Vil du avbryte «${db.active.workoutName}» og starte en ny?`, { ok: 'Start ny økt' })) return;
    stopIntervalTimer();
    db.active = {
      type: 'cardio',
      programId: null,
      workoutId: w.id,
      programName: sportName(w.sport),
      workoutName: w.name,
      startedAt: Date.now(),
      exercises: [{
        exerciseId: null, name: w.name, timed: false, kind: w.kind, sport: w.sport,
        sets: w.kind === 'tur'
          ? [{ distance: '', duration: '' }]
          : plan.map(s => ({ duration: s.work, rest: s.rest, speed: '' })),
      }],
    };
    save(); go({ name: 'session' });
  },
  'add-set': d => {
    const ex = setTarget(d.scope).exercises[+d.i];
    const prev = ex.sets[ex.sets.length - 1];
    ex.sets.push(prev ? { ...prev } : emptySetFor(ex));
    if (d.scope === 'active') save();
    render();
  },
  'stopwatch': d => {
    const sw = db.active.stopwatch;
    const same = sw && sw.i === +d.i && sw.s === +d.s;
    stopStopwatch(); // stopper (og lagrer) en eventuell klokke som går
    if (!same) db.active.stopwatch = { i: +d.i, s: +d.s, startedAt: Date.now() };
    save(); render();
  },
  'iv-start': d => {
    unlockAudio(); // må skje i selve trykket for at iPhone skal spille lyd
    const ex = db.active.exercises[+d.i];
    const works = ex.sets.map(s => parseDuration(s.duration));
    if (!works.length || works.some(w => !w)) { notice('Mangler tid', 'Fyll inn aktiv tid for alle settene.'); return; }
    stopStopwatch();
    lastPhaseKey = lastTickKey = null;
    db.active.intervalTimer = { i: +d.i, works, rests: ex.sets.map(s => parseDuration(s.rest)), startedAt: Date.now() };
    keepAwake(true);
    SOUNDS.tick();
    save(); render();
  },
  'iv-stop': () => { stopIntervalTimer(); save(); render(); },
  'remove-set': d => {
    if (d.scope === 'active') stopStopwatch(); // indekser kan endre seg
    setTarget(d.scope).exercises[+d.i].sets.splice(+d.s, 1);
    if (d.scope === 'active') save();
    render();
  },
  'remove-card-ex': async d => {
    const list = setTarget(d.scope).exercises;
    const ex = list[+d.i];
    const msg = ex.sets.some(hasData) ? 'Det du har logget på denne øvelsen forsvinner.' : 'Øvelsen fjernes fra denne økta.';
    if (!await ask(`Fjerne «${ex.name}»?`, msg, { ok: 'Fjern øvelse' })) return;
    if (d.scope === 'active') { stopStopwatch(); stopIntervalTimer(); }
    list.splice(+d.i, 1);
    if (d.scope === 'active') save();
    render();
  },
  'finish-session': async () => {
    if (!await ask('Fullføre økta?', 'Økta lagres i loggen.', { ok: 'Fullfør økt', danger: false })) return;
    stopStopwatch();
    stopIntervalTimer();
    const a = db.active;
    // Spør om endringer i øvelsene skal lagres permanent i økta
    const w = getWorkout(a.programId, a.workoutId);
    const ids = a.exercises.map(e => e.exerciseId).filter(id => getExercise(id));
    if (w && JSON.stringify(ids) !== JSON.stringify(w.exerciseIds) &&
        await ask(`Oppdatere «${w.name}»?`, 'Du har lagt til eller fjernet øvelser. Skal økta ha disse øvelsene neste gang også?',
          { ok: 'Ja, oppdater økta', cancel: 'Nei, bare denne gangen', danger: false })) {
      w.exerciseIds = ids;
    }
    db.history.push({
      id: uid(),
      type: a.type,
      programId: a.programId,
      workoutId: a.workoutId,
      programName: a.programName,
      workoutName: a.workoutName,
      startedAt: a.startedAt,
      endedAt: Date.now(),
      exercises: a.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        timed: isTimedEx(ex),
        kind: cardioKindOf(ex),
        sport: ex.sport ?? null,
        sets: ex.sets.filter(hasData),
      })),
    });
    db.active = null;
    save(); go({ name: 'history' });
  },
  'cancel-session': async () => {
    if (!await ask('Avbryte økta?', 'Det du har logget blir ikke lagret.', { ok: 'Avbryt økt', cancel: 'Fortsett økta' })) return;
    stopIntervalTimer();
    db.active = null;
    save(); go(homeProgramView());
  },

  'edit-history': d => {
    const h = db.history.find(x => x.id === d.id);
    editDraft = JSON.parse(JSON.stringify(h));
    editDraft._start = toLocalInput(h.startedAt);
    editDraft._minutes = String(Math.round((h.endedAt - h.startedAt) / 60000));
    editDraft.exercises.forEach(e => { if (!e.sets.length) e.sets.push(emptySetFor(e)); });
    go({ name: 'historyEdit' });
  },
  'save-history': () => {
    const { _start, _minutes, ...h } = editDraft;
    const start = new Date(_start).getTime();
    if (isNaN(start)) { notice('Ugyldig starttid', 'Velg dato og klokkeslett for når økta startet.'); return; }
    h.startedAt = start;
    h.endedAt = start + (parseInt(_minutes, 10) || 0) * 60000;
    h.exercises = h.exercises.map(e => ({ ...e, sets: e.sets.filter(hasData) }));
    db.history[db.history.findIndex(x => x.id === h.id)] = h;
    db.history.sort((a, b) => a.startedAt - b.startedAt);
    editDraft = null;
    save(); go({ name: 'history' });
  },
  'delete-history': async d => {
    const h = db.history.find(x => x.id === d.id);
    if (!await ask(`Slette «${h.workoutName}»?`, `Økta fra ${formatDate(h.startedAt)} slettes fra loggen for godt.`, { ok: 'Slett økt' })) return;
    db.history = db.history.filter(x => x.id !== d.id);
    save(); render();
  },
  'apply-theme': d => {
    db.settings.colors = { ...THEMES[+d.i].colors };
    db.settings.activeSlot = null;
    applyTheme(); save(); render();
  },
  'apply-slot': d => {
    const slot = db.settings.custom[+d.i];
    slot.colors ??= { ...currentColors() }; // tomt tema starter med fargene du har nå
    db.settings.colors = { ...slot.colors };
    db.settings.activeSlot = +d.i;
    applyTheme(); save(); render();
  },
  'save-slot': async d => {
    const slot = db.settings.custom[+d.i];
    if (slot.colors && !await ask(`Overskrive «${slot.name}»?`, 'Temaet erstattes med fargene du har valgt nå.', { ok: 'Overskriv', danger: false })) return;
    slot.colors = { ...currentColors() };
    db.settings.activeSlot = +d.i;
    save(); render();
  },
  'reset-colors': async () => {
    if (!await ask('Tilbakestille farger?', 'Appen går tilbake til standardfargene. Dine egne temaer beholdes.', { ok: 'Tilbakestill' })) return;
    db.settings.colors = {};
    db.settings.activeSlot = null;
    applyTheme(); save(); render();
  },
  'delete-bw': async d => {
    const e = db.bodyweight.find(x => x.id === d.id);
    if (!await ask('Slette registreringen?', `${fmt(num(e.kg))} kg – ${formatDay(e.date)}`, { ok: 'Slett' })) return;
    db.bodyweight = db.bodyweight.filter(x => x.id !== d.id);
    save(); render();
  },
};

const forms = {
  'new-program': f => {
    db.programs.push({ id: uid(), type: mode(), name: f.name, workouts: [] });
  },
  'new-workout': f => {
    getProgram(view.programId).workouts.push({ id: uid(), name: f.name, exerciseIds: [] });
  },
  'add-ex-to-workout': f => {
    getWorkout(view.programId, view.workoutId).exerciseIds.push(f.exerciseId);
  },
  'new-exercise': f => {
    if (db.exercises.some(e => e.name.toLowerCase() === f.name.toLowerCase())) {
      notice('Øvelsen finnes allerede', `«${f.name}» ligger allerede i biblioteket.`);
      return;
    }
    db.exercises.push({ id: uid(), type: 'styrke', name: f.name, category: f.category, subs: f.subs, equipment: f.equipment, timed: f.timed });
    openCats.add(`styrke-${f.category}`);
  },
  'edit-exercise': f => {
    const ex = getExercise(view.exerciseId);
    if (db.exercises.some(e => e !== ex && e.name.toLowerCase() === f.name.toLowerCase())) {
      notice('Navnet er i bruk', 'En annen øvelse har allerede dette navnet.');
      return;
    }
    if (ex.type === 'cardio') Object.assign(ex, { name: f.name, kind: f.kind, sport: f.sport });
    else Object.assign(ex, { name: f.name, category: f.category, subs: f.subs, equipment: f.equipment, timed: f.timed });
    // Oppdater navnet i historikk og pågående økt også
    [...db.history, db.active].filter(Boolean).forEach(s => s.exercises.forEach(e => {
      if (e.exerciseId === ex.id) e.name = ex.name;
    }));
  },
  'session-add-exercise': f => {
    db.active.exercises.push(sessionEx(f.exerciseId));
  },
  'edit-add-exercise': f => {
    editDraft.exercises.push(sessionEx(f.exerciseId));
  },
  'new-bodyweight': f => {
    if (!num(f.kg)) { notice('Ugyldig vekt', 'Skriv inn vekten i kg, f.eks. 82,5.'); return; }
    const date = new Date(`${f.date}T12:00`).getTime();
    // Én registrering per dag – samme dag erstattes
    db.bodyweight = db.bodyweight.filter(e => new Date(e.date).toDateString() !== new Date(date).toDateString());
    db.bodyweight.push({ id: uid(), date, kg: f.kg });
  },
};

// Går intervall-timeren (f.eks. etter at appen ble åpnet igjen), låses lyden opp ved første trykk
document.addEventListener('touchstart', () => { if (db.active?.intervalTimer) unlockAudio(); }, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && db.active?.intervalTimer) keepAwake(true);
  else wakeLock = null; // iOS slipper skjermlåsen når appen skjules
});

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const action = el.closest('#nav') ? 'tab' : el.dataset.action;
  actions[action]?.(el.dataset);
});

document.addEventListener('submit', e => {
  const form = e.target.closest('[data-form]');
  if (!form) return;
  e.preventDefault();
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);
  data.subs = fd.getAll('subs');
  data.timed = fd.has('timed');
  if (data.name !== undefined) data.name = data.name.trim();
  if (data.name === '') return;
  forms[form.dataset.form]?.(data);
  save(); render();
});

// Fargevelger og temanavn
document.addEventListener('input', e => {
  const s = db.settings;
  if (e.target.matches('[data-theme-name]')) {
    if (s.activeSlot !== null) s.custom[s.activeSlot].name = e.target.value.trim() || `Mitt tema ${s.activeSlot + 1}`;
    save();
    return;
  }
  const key = e.target.dataset?.color;
  if (!key) return;
  s.colors[key] = e.target.value;
  // Redigerer man et eget tema, lagres endringen i det temaet
  if (s.activeSlot !== null) s.custom[s.activeSlot].colors = { ...currentColors() };
  applyTheme(); save();
  refreshThemePreviews();
});
// NB: Ikke rendre hele siden på nytt her – da lukkes fargevelgeren på iPhone midt i justeringen.
document.addEventListener('change', e => {
  if (e.target.dataset?.color || e.target.matches('[data-theme-name]')) refreshThemePreviews();
});
function refreshThemePreviews() {
  const slots = document.getElementById('slots'), themes = document.getElementById('themes');
  if (slots) slots.innerHTML = slotsHtml();
  if (themes) themes.innerHTML = themesHtml();
}

// Vis riktige under-muskelgrupper når muskelgruppe velges
document.addEventListener('change', e => {
  if (e.target.name !== 'category') return;
  const picker = e.target.closest('form')?.querySelector('.sub-picker');
  if (picker) picker.innerHTML = subPickerHtml(e.target.value);
});

// Husk hvilke grupper som er åpne i biblioteket
document.addEventListener('toggle', e => {
  if (e.target.matches?.('[data-newex]')) { newExOpen = e.target.open; return; }
  if (e.target.matches?.('[data-cwedit]')) { cwEditOpen = e.target.open; return; }
  const cat = e.target.dataset?.cat;
  if (cat === undefined) return;
  e.target.open ? openCats.add(cat) : openCats.delete(cat);
}, true);

// Skjul menylinja mens tastaturet er oppe (ellers legger iPhone den rett over tastaturet)
const typesKeyboard = el => el.matches?.('textarea, input:not([type=checkbox]):not([type=radio]):not([type=color]):not([type=range]):not([type=button])');
let kbTimer = null;
document.addEventListener('focusin', e => {
  if (!typesKeyboard(e.target)) return;
  clearTimeout(kbTimer);
  document.body.classList.add('kb-open');
});
document.addEventListener('focusout', e => {
  if (!typesKeyboard(e.target)) return;
  // Liten forsinkelse, så baren ikke blinker når man hopper mellom felt
  kbTimer = setTimeout(() => {
    if (!typesKeyboard(document.activeElement)) document.body.classList.remove('kb-open');
  }, 150);
});

// ---------- Dra for å endre rekkefølge ----------
// Lister merket data-drag-list, med rader merket data-drag-item og et .drag-handle i hver rad
const DRAG_LISTS = {
  workout: (from, to) => {
    const ids = getWorkout(view.programId, view.workoutId).exerciseIds;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
  },
};
let drag = null;
const dragItems = list => [...list.querySelectorAll(':scope > [data-drag-item]')];

document.addEventListener('pointerdown', e => {
  const handle = e.target.closest('.drag-handle');
  if (!handle) return;
  const item = handle.closest('[data-drag-item]');
  const list = item?.parentElement;
  if (!list?.dataset.dragList) return;
  e.preventDefault();
  handle.setPointerCapture?.(e.pointerId);
  drag = { item, list, from: dragItems(list).indexOf(item), startY: e.clientY, startTop: item.getBoundingClientRect().top };
  item.classList.add('dragging');
  list.classList.add('is-dragging');
  document.body.classList.add('no-select');
});

document.addEventListener('pointermove', e => {
  if (!drag) return;
  e.preventDefault();
  const y = e.clientY;
  const items = dragItems(drag.list);
  const idx = items.indexOf(drag.item);
  // Bytt plass med naboen når fingeren passerer midten av den
  const prev = items[idx - 1], next = items[idx + 1];
  if (prev && y < prev.getBoundingClientRect().top + prev.offsetHeight / 2) drag.list.insertBefore(drag.item, prev);
  else if (next && y > next.getBoundingClientRect().top + next.offsetHeight / 2) drag.list.insertBefore(drag.item, next.nextSibling);
  // Raden følger fingeren
  drag.item.style.transform = '';
  const natural = drag.item.getBoundingClientRect().top;
  drag.item.style.transform = `translateY(${drag.startTop + (y - drag.startY) - natural}px)`;
}, { passive: false });

function endDrag() {
  if (!drag) return;
  const { item, list, from } = drag;
  const to = dragItems(list).indexOf(item);
  item.style.transform = '';
  item.classList.remove('dragging');
  list.classList.remove('is-dragging');
  document.body.classList.remove('no-select');
  drag = null;
  if (to !== from) {
    DRAG_LISTS[list.dataset.dragList]?.(from, to);
    save();
  }
  render();
}
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);

// Klokkefelt: marker innholdet ved trykk, så nye tall erstatter den gamle tiden
document.addEventListener('focusin', e => {
  const el = e.target;
  if (el.dataset?.clock === undefined || !el.value) return;
  setTimeout(() => el.setSelectionRange?.(0, el.value.length), 0);
});

// Vis treff når søkefeltet for å legge til øvelse får fokus
document.addEventListener('focusin', e => {
  if (!e.target.matches('[data-picker-input]')) return;
  const picker = e.target.closest('.picker');
  picker.querySelector('.picker-results').innerHTML = pickerResultsHtml(picker.dataset.target, picker.dataset.type, e.target.value);
});

document.addEventListener('input', e => {
  const el = e.target;

  // Klokkefelt: formater mens man skriver, og hold markøren på slutten
  if (el.dataset.clock !== undefined) {
    el.value = clockDigits(el.value);
    el.setSelectionRange?.(el.value.length, el.value.length);
  }

  // Søk når man legger til øvelse
  if (el.matches('[data-picker-input]')) {
    const picker = el.closest('.picker');
    picker.querySelector('.picker-results').innerHTML = pickerResultsHtml(picker.dataset.target, picker.dataset.type, el.value);
    return;
  }
  // Søk i biblioteket
  if (el.matches('[data-lib-search]')) {
    libQuery = el.value;
    document.getElementById('lib-groups').innerHTML = libraryGroupsHtml();
    return;
  }
  // Statistikk: egne antall dager
  if (el.matches('[data-stats-days]')) {
    el.value = el.value.replace(/[^0-9]/g, '');
    statsState.days = el.value;
    statsState.period = el.value ? 'custom' : 'all';
    document.getElementById('stats-periods').innerHTML = statsPeriodsHtml();
    document.getElementById('stats-body').innerHTML = statsBodyHtml();
    return;
  }
  if (el.dataset.clean === 'decimal') {
    el.value = el.value.replace(/[^0-9.,]/g, '');
    return;
  }
  // Starttid/varighet ved redigering av fullført økt
  if (el.dataset.meta && editDraft) {
    if (el.dataset.meta === '_minutes') el.value = el.value.replace(/[^0-9]/g, '');
    editDraft[el.dataset.meta] = el.value;
    return;
  }
  // Oppsett av cardioøkt
  if (el.dataset.cw) {
    const w = currentCw();
    if (!w) return;
    const k = el.dataset.cw;
    if (k !== 'name') el.value = el.value.replace(k === 'rounds' ? /[^0-9]/g : /[^0-9:.,]/g, '');
    if (el.dataset.i !== undefined) w.sets[+el.dataset.i][k] = el.value;
    else w[k] = el.value;
    if (view.id) {
      save();
      const s = document.getElementById('cw-summary');
      if (s) s.textContent = cwSummary(w);
    }
    return;
  }
  // Sett-verdier lagres fortløpende uten å rendre på nytt (beholder fokus i feltet)
  const field = el.dataset.field;
  if (!field) return;
  const target = setTarget(el.dataset.scope);
  if (!target) return;
  const clean = ['weight', 'speed', 'distance'].includes(field) ? el.value.replace(/[^0-9.,]/g, '')
    : field === 'duration' || field === 'rest' ? el.value.replace(/[^0-9:.,]/g, '')
    : el.value.replace(/[^0-9]/g, '');
  if (clean !== el.value) el.value = clean;
  const set = target.exercises[+el.dataset.i].sets[+el.dataset.s];
  set[field] = clean;
  // Oppdater tempo / snittfart live
  const info = document.querySelector(`[data-info="${el.dataset.scope}-${el.dataset.i}-${el.dataset.s}"]`);
  if (info) info.innerHTML = cardioInfo(set);
  if (el.dataset.scope === 'active') save();
});

// Offline-støtte og be om at data ikke slettes av iOS
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
navigator.storage?.persist?.().catch(() => {});

applyTheme();
view = db.active ? { name: 'session' } : homeProgramView();
render();
