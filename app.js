// Treningslogg – enkel app for program, økter, øvelser og logging av sett.
// All data lagres lokalt på enheten (localStorage).

const STORE_KEY = 'treningsapp-v1';

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
  { id: 'dumbbell', name: 'Dumbbell' },
  { id: 'cable',    name: 'Cable' },
  { id: 'annet',    name: 'Annet' },
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY));
    if (data) return data;
  } catch (e) { /* ignorer */ }
  return {
    exercises: [],        // { id, name, category, subs: [], equipment, timed }
    programs: [],         // { id, name, workouts: [{ id, name, exerciseIds: [] }] }
    history: [],          // fullførte økter
    active: null,         // pågående økt
    lastProgramId: null,  // programmet til forrige økt
    bodyweight: [],       // { id, date, kg }
  };
}

let db = load();
// Oppgrader data fra eldre versjoner
db.exercises.forEach(e => { e.category ??= ''; e.subs ??= []; e.equipment ??= ''; e.timed ??= false; });
db.lastProgramId ??= null;
db.bodyweight ??= [];

db.settings ??= { colors: {} };
// To egne temaer som kan lagres og justeres. activeSlot = indeks på eget tema som er i bruk (eller null)
db.settings.custom ??= [{ name: 'Mitt tema 1', colors: null }, { name: 'Mitt tema 2', colors: null }];
db.settings.activeSlot ??= null;

const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(db));

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
  { name: 'Blå',      colors: { ...DEFAULT_COLORS, accent: '#3b82f6' } },
  { name: 'Lilla',    colors: { ...DEFAULT_COLORS, accent: '#a855f7' } },
  { name: 'Oransje',  colors: { ...DEFAULT_COLORS, accent: '#f97316' } },
  { name: 'Rosa',     colors: { ...DEFAULT_COLORS, accent: '#ec4899' } },
  { name: 'Gul',      colors: { ...DEFAULT_COLORS, accent: '#eab308' } },
  { name: 'Svart',    colors: { accent: '#30d158', bg: '#000000', card: '#1c1c1e', text: '#f2f2f7', muted: '#8e8e93', line: '#3a3a3c', danger: '#ff453a' } },
  { name: 'Lys',      colors: { accent: '#16a34a', bg: '#f1f5f9', card: '#ffffff', text: '#0f172a', muted: '#64748b', line: '#cbd5e1', danger: '#dc2626' } },
];

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
}

let view;              // hvilken side som vises
let editDraft = null;  // kopi av fullført økt som redigeres
let libQuery = '';     // søk i biblioteket
const openCats = new Set(); // åpne muskelgrupper i biblioteket

// ---------- Hjelpere ----------

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const getExercise = id => db.exercises.find(e => e.id === id);
const exName = id => getExercise(id)?.name ?? '(slettet øvelse)';
const getProgram = id => db.programs.find(p => p.id === id);
const getWorkout = (pid, wid) => getProgram(pid)?.workouts.find(w => w.id === wid);
const catName = id => CATEGORIES.find(c => c.id === id)?.name ?? 'Uten muskelgruppe';
const eqName = id => EQUIPMENT.find(c => c.id === id)?.name ?? '';

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

// Sekunder -> «45 sek» / «1:30»
function fmtSecs(v) {
  const n = Math.round(num(v));
  return n >= 60 ? `${Math.floor(n / 60)}:${pad(n % 60)}` : `${n} sek`;
}

const formatDate = ts => new Date(ts).toLocaleString('nb-NO', {
  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});
const formatDay = ts => new Date(ts).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

// Tidspunkt -> verdi for <input type="datetime-local"> (lokal tid)
const toLocalInput = ts => new Date(ts - new Date(ts).getTimezoneOffset() * 60000).toISOString().slice(0, 16);

// Tidsøvelser har sett med { weight, time }, vanlige med { weight, reps }
const isTimedSet = s => s.time !== undefined;
function setText(s) {
  if (isTimedSet(s)) return `${num(s.weight) ? `${s.weight} kg × ` : ''}${fmtSecs(s.time)}`;
  return `${s.weight || 0} kg × ${s.reps || 0}`;
}
const emptySet = timed => (timed ? { weight: '', time: '' } : { weight: '', reps: '' });
const hasData = s => Object.values(s).some(v => v !== '');
const isTimedEx = ex => ex.timed ?? !!getExercise(ex.exerciseId)?.timed;
const sessionEx = id => ({ exerciseId: id, name: exName(id), timed: !!getExercise(id)?.timed, sets: [emptySet(getExercise(id)?.timed)] });

function exMeta(e) {
  return [eqName(e.equipment), e.subs.join(', '), e.timed ? 'På tid' : ''].filter(Boolean).join(' · ');
}

function matchesQuery(e, q) {
  if (!q) return true;
  return [e.name, catName(e.category), eqName(e.equipment), ...e.subs].join(' ').toLowerCase().includes(q);
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
const notice = (title, message) => ask(title, message, { ok: 'OK', cancel: '', danger: false });

function homeProgramView() {
  return getProgram(db.lastProgramId)
    ? { name: 'program', programId: db.lastProgramId }
    : { name: 'programs' };
}

function lastPerformance(exerciseId) {
  for (let i = db.history.length - 1; i >= 0; i--) {
    const ex = db.history[i].exercises.find(e => e.exerciseId === exerciseId);
    if (ex && ex.sets.length) return ex.sets.map(setText).join(', ');
  }
  return null;
}

// Søkbar velger for å legge til øvelse. target = navnet på handlingen i `forms`
function exercisePicker(target) {
  if (!db.exercises.length) {
    return `
      <div class="card muted">
        Biblioteket er tomt.
        <button class="link" data-action="nav" data-view="library" style="color:var(--accent)">Legg inn øvelser ›</button>
      </div>`;
  }
  return `
    <div class="picker" data-target="${target}">
      <input type="search" placeholder="🔍 Søk og legg til øvelse…" autocomplete="off" data-picker-input>
      <div class="picker-results"></div>
    </div>`;
}

function pickerResultsHtml(target, query) {
  const q = query.trim().toLowerCase();
  const list = [...db.exercises]
    .filter(e => matchesQuery(e, q))
    .sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  if (!list.length) {
    return `<div class="muted small" style="padding:10px 4px">Ingen treff.
      <button class="link" data-action="nav" data-view="library" style="color:var(--accent)">Lag ny øvelse ›</button></div>`;
  }
  return list.map(e => `
    <div class="list-item clickable" data-action="pick-ex" data-target="${target}" data-id="${e.id}">
      <div>${esc(e.name)}<div class="muted small">${esc([catName(e.category), exMeta(e)].filter(Boolean).join(' · '))}</div></div>
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

function exerciseFormFields(ex = {}) {
  return `
    <input name="name" placeholder="Navn på øvelse" value="${esc(ex.name || '')}" required>
    <select name="category" required>
      <option value="" disabled ${ex.category ? '' : 'selected'}>Velg muskelgruppe</option>
      ${CATEGORIES.map(c => `<option value="${c.id}" ${ex.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
    </select>
    <div class="sub-picker">${subPickerHtml(ex.category, ex.subs)}</div>
    <div class="row">
      <select name="equipment" required>
        <option value="" disabled ${ex.equipment ? '' : 'selected'}>Velg kategori</option>
        ${EQUIPMENT.map(c => `<option value="${c.id}" ${ex.equipment === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
      <label class="switch-inline">
        <span>På tid</span>
        <input type="checkbox" name="timed" class="switch" role="switch" ${ex.timed ? 'checked' : ''}>
      </label>
    </div>`;
}

// Kort med sett for hver øvelse. scope = 'active' (pågående økt) eller 'edit' (redigering av fullført økt)
const setTarget = scope => (scope === 'edit' ? editDraft : db.active);

// Stoppeklokke for tidsøvelser i pågående økt: db.active.stopwatch = { i, s, startedAt }
const stopwatchSecs = sw => Math.floor((Date.now() - sw.startedAt) / 1000);

function stopStopwatch() {
  const sw = db.active?.stopwatch;
  if (!sw) return;
  const set = db.active.exercises[sw.i]?.sets[sw.s];
  if (set) set.time = String(Math.max(1, stopwatchSecs(sw)));
  db.active.stopwatch = null;
}

function setCards(exercises, scope) {
  return exercises.map((ex, i) => {
    const timed = isTimedEx(ex);
    const withClock = timed && scope === 'active';
    const sw = scope === 'active' ? db.active.stopwatch : null;
    const f2 = timed ? 'time' : 'reps';
    const last = scope === 'active' ? lastPerformance(ex.exerciseId) : null;
    const rows = ex.sets.map((s, j) => {
      const running = sw && sw.i === i && sw.s === j;
      const val = running ? stopwatchSecs(sw) : s[f2];
      return `
      <div class="set-grid ${withClock ? 'timed' : ''}">
        <span class="num">${j + 1}</span>
        <input type="text" inputmode="decimal" autocomplete="off" placeholder="kg"
               value="${esc(s.weight)}" data-scope="${scope}" data-i="${i}" data-s="${j}" data-field="weight">
        <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="${timed ? 'sek' : 'reps'}"
               value="${esc(val)}" data-scope="${scope}" data-i="${i}" data-s="${j}" data-field="${f2}"
               ${running ? 'readonly class="running"' : ''}>
        ${withClock ? `<button class="sw-btn ${running ? 'running' : ''}" data-action="stopwatch" data-i="${i}" data-s="${j}"
               aria-label="${running ? 'Stopp tid' : 'Start tid'}">${running ? '■' : '▶'}</button>` : ''}
        <button class="danger" data-action="remove-set" data-scope="${scope}" data-i="${i}" data-s="${j}" aria-label="Fjern sett">✕</button>
      </div>`;
    }).join('');
    return `
      <section class="card">
        <div class="card-head">
          <h3>${esc(ex.name)}</h3>
          <button class="danger small" data-action="remove-card-ex" data-scope="${scope}" data-i="${i}">Fjern øvelse</button>
        </div>
        ${last ? `<div class="muted" style="margin-bottom:8px">Forrige gang: ${esc(last)}</div>` : ''}
        <div class="set-grid head ${withClock ? 'timed' : ''}"><span class="num">Sett</span><span style="text-align:center">Vekt (kg)</span><span style="text-align:center">${timed ? 'Tid (sek)' : 'Reps'}</span>${withClock ? '<span></span>' : ''}<span></span></div>
        ${rows}
        <button data-action="add-set" data-scope="${scope}" data-i="${i}" style="width:100%">+ Legg til sett</button>
      </section>`;
  }).join('');
}

// ---------- Visninger ----------

function renderPrograms() {
  const items = db.programs.map(p => `
    <div class="list-item clickable" data-action="open-program" data-id="${p.id}">
      <div><strong>${esc(p.name)}</strong><div class="muted">${p.workouts.length} økt(er)</div></div>
      <span class="muted">›</span>
    </div>`).join('');
  return `
    <h1>Program</h1>
    ${items || '<p class="empty">Ingen program ennå. Opprett ditt første under.</p>'}
    <form class="row section" data-form="new-program">
      <input name="name" placeholder="Nytt program, f.eks. «Push/Pull/Legs»" required>
      <button class="primary">Legg til</button>
    </form>`;
}

function renderProgram() {
  const p = getProgram(view.programId);
  if (!p) return go({ name: 'programs' });
  const items = p.workouts.map(w => `
    <div class="list-item clickable" data-action="open-workout" data-id="${w.id}">
      <div><strong>${esc(w.name)}</strong><div class="muted">${w.exerciseIds.length} øvelse(r)</div></div>
      <span class="muted">›</span>
    </div>`).join('');
  return `
    <button class="link" data-action="all-programs">‹ Alle program</button>
    <h1>${esc(p.name)}</h1>
    ${items || '<p class="empty">Ingen økter i dette programmet ennå.</p>'}
    <form class="row section" data-form="new-workout">
      <input name="name" placeholder="Ny økt, f.eks. «Push dag»" required>
      <button class="primary">Legg til</button>
    </form>
    <div class="section"><button class="soft-danger big" data-action="delete-program">Slett program</button></div>`;
}

function renderWorkout() {
  const p = getProgram(view.programId);
  const w = getWorkout(view.programId, view.workoutId);
  if (!w) return go({ name: 'program', programId: view.programId });
  const items = w.exerciseIds.map((id, i) => {
    const e = getExercise(id);
    return `
      <div class="list-item">
        <div class="grow">${i + 1}. ${esc(exName(id))}
          <div class="muted small">${esc([catName(e?.category), e ? exMeta(e) : ''].filter(Boolean).join(' · '))}</div></div>
        <span class="row tight">
          <button data-action="move-ex" data-i="${i}" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="Flytt opp">↑</button>
          <button data-action="move-ex" data-i="${i}" data-dir="1" ${i === w.exerciseIds.length - 1 ? 'disabled' : ''} aria-label="Flytt ned">↓</button>
          <button class="remove" data-action="remove-ex" data-i="${i}">Fjern</button>
        </span>
      </div>`;
  }).join('');
  return `
    <button class="link" data-action="open-program" data-id="${p.id}">‹ ${esc(p.name)}</button>
    <h1>${esc(w.name)}</h1>
    ${items || '<p class="empty">Ingen øvelser ennå. Søk opp og legg til under.</p>'}
    <div class="section">${exercisePicker('add-ex-to-workout')}</div>
    <div class="section">
      <button class="primary big" data-action="start-session" ${w.exerciseIds.length ? '' : 'disabled'}>▶ Start økt</button>
    </div>
    <div class="section"><button class="soft-danger big" data-action="delete-workout">Slett økt</button></div>`;
}

function libraryItem(e, showGroup) {
  const meta = [showGroup ? catName(e.category) : '', exMeta(e)].filter(Boolean).join(' · ');
  return `
    <div class="list-item clickable" data-action="open-exercise" data-id="${e.id}">
      <div>${esc(e.name)}${meta ? `<div class="muted small">${esc(meta)}</div>` : ''}</div>
      <span class="muted">›</span>
    </div>`;
}

function libraryGroupsHtml() {
  const sorted = [...db.exercises].sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  const q = libQuery.trim().toLowerCase();
  if (q) {
    const hits = sorted.filter(e => matchesQuery(e, q));
    return hits.map(e => libraryItem(e, true)).join('') || '<p class="empty">Ingen treff.</p>';
  }
  const groups = [...CATEGORIES];
  if (sorted.some(e => !e.category)) groups.push({ id: '', name: 'Uten muskelgruppe' });
  return groups.map(g => {
    const list = sorted.filter(e => (e.category || '') === g.id);
    return `
      <details class="group" data-cat="${g.id}" ${openCats.has(g.id) ? 'open' : ''}>
        <summary><strong>${esc(g.name)}</strong><span class="muted">${list.length}</span></summary>
        <div class="group-body">${list.map(e => libraryItem(e, false)).join('') ||
          '<div class="muted small" style="padding:0 4px 8px">Ingen øvelser ennå</div>'}</div>
      </details>`;
  }).join('');
}

function renderLibrary() {
  return `
    <h1>Øvelser</h1>
    <form class="card stack" data-form="new-exercise">
      <strong>Ny øvelse</strong>
      ${exerciseFormFields()}
      <button class="primary">Legg til</button>
    </form>
    <h2 class="section">Øvelsesbibliotek</h2>
    <input type="search" placeholder="🔍 Søk i biblioteket…" autocomplete="off" data-lib-search value="${esc(libQuery)}" style="margin-bottom:10px">
    <div id="lib-groups">${libraryGroupsHtml()}</div>`;
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

  let kg = 0, reps = 0, secs = 0, sets = 0, bestVol = null, heaviest = null, longest = null;
  entries.forEach(({ h, sets: ss }) => ss.forEach(s => {
    const w = num(s.weight), r = num(s.reps), t = num(s.time), vol = w * r;
    kg += vol; reps += r; secs += t; sets++;
    if (!bestVol || vol > bestVol.vol) bestVol = { s, vol, date: h.startedAt };
    if (!heaviest || w > heaviest.w || (w === heaviest.w && r > heaviest.r)) heaviest = { s, w, r, date: h.startedAt };
    if (!longest || t > longest.t) longest = { s, t, date: h.startedAt };
  }));

  const bestCard = (label, best, value) => `
    <div class="card">
      <div class="muted small">${label}</div>
      <strong>${best ? value : '–'}</strong>
      ${best ? `<div class="muted small">${formatDay(best.date)}</div>` : ''}
    </div>`;

  const tiles = ex.timed
    ? `<div class="stat"><div class="value">${fmtSecs(secs)}</div><div class="label">Total tid</div></div>
       <div class="stat"><div class="value">${longest ? fmtSecs(longest.t) : '–'}</div><div class="label">Lengste sett</div></div>`
    : `<div class="stat"><div class="value">${fmt(kg)} kg</div><div class="label">Totalt løftet</div></div>
       <div class="stat"><div class="value">${fmt(reps)}</div><div class="label">Totalt reps</div></div>`;

  const bests = ex.timed
    ? (heaviest && heaviest.w ? bestCard('Sett med høyest vekt', heaviest, esc(setText(heaviest.s))) : '')
    : bestCard('Sett med høyest volum (kg × reps)', bestVol, bestVol ? `${esc(setText(bestVol.s))} = ${fmt(bestVol.vol)} kg` : '') +
      bestCard('Sett med høyest vekt', heaviest, heaviest ? esc(setText(heaviest.s)) : '');

  const historyHtml = entries.map(({ h, sets: ss }) => `
    <div class="card">
      <strong>${esc(formatDate(h.startedAt))}</strong>
      <div class="muted small">${esc(h.workoutName)}</div>
      <div class="muted" style="margin-top:6px">${ss.map((s, i) => `${i + 1}: ${esc(setText(s))}`).join('<br>')}</div>
    </div>`).join('');

  return `
    <button class="link" data-action="nav" data-view="library">‹ Øvelser</button>
    <h1 style="margin-bottom:4px">${esc(ex.name)}</h1>
    <div class="muted" style="margin-bottom:16px">${esc([catName(ex.category), exMeta(ex)].filter(Boolean).join(' · '))}</div>

    <div class="stat-grid">
      ${tiles}
      <div class="stat"><div class="value">${sets}</div><div class="label">Totalt sett</div></div>
      <div class="stat"><div class="value">${entries.length}</div><div class="label">Økter</div></div>
    </div>
    ${bests}

    <h2 class="section">Historikk</h2>
    ${historyHtml || '<p class="empty">Ingen fullførte økter med denne øvelsen ennå.</p>'}

    <details class="card section">
      <summary><strong>Rediger øvelse</strong></summary>
      <form class="stack" data-form="edit-exercise" style="margin-top:12px">
        ${exerciseFormFields(ex)}
        <button class="primary">Lagre</button>
      </form>
    </details>
    <div class="section"><button class="soft-danger big" data-action="delete-exercise">Slett øvelse</button></div>`;
}

function renderStats() {
  const period = view.period || 'all';
  const days = { '7': 7, '30': 30, '90': 90 }[period];
  const since = days ? Date.now() - days * 864e5 : 0;

  const stats = {};
  let total = 0;
  db.history.filter(h => h.startedAt >= since).forEach(h => h.exercises.forEach(he => {
    const ex = getExercise(he.exerciseId);
    if (!ex || !ex.category || !he.sets.length) return;
    const st = stats[ex.category] ??= { sets: 0, kg: 0, subs: {} };
    he.sets.forEach(s => { st.sets++; st.kg += num(s.weight) * num(s.reps); });
    ex.subs.forEach(sub => { st.subs[sub] = (st.subs[sub] || 0) + he.sets.length; });
    total += he.sets.length;
  }));

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
            <span class="muted small">${s.sets} sett · ${fmt(s.kg)} kg${total ? ` · ${Math.round(s.sets / total * 100)} %` : ''}</span>
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

  const seg = [['7', '7 dager'], ['30', '30 dager'], ['90', '90 dager'], ['all', 'Alt']].map(([p, label]) =>
    `<button class="${period === p ? 'active' : ''}" data-action="stats-period" data-p="${p}">${label}</button>`).join('');

  return `
    <button class="link" data-action="nav" data-view="profile">‹ Profil</button>
    <h1>Muskelgrupper</h1>
    <div class="seg">${seg}</div>
    ${total ? rows : '<p class="empty">Ingen fullførte sett i denne perioden.</p>'}
    <p class="muted small">Antall sett fra fullførte økter, fordelt på øvelsens muskelgruppe. Kg = vekt × reps.</p>`;
}

function renderSession() {
  const a = db.active;
  if (!a) return go(homeProgramView());
  return `
    ${setCards(a.exercises, 'active') || '<p class="empty">Ingen øvelser i økta. Legg til under.</p>'}
    ${exercisePicker('session-add-exercise')}
    <div class="section stack">
      <button class="primary big" data-action="finish-session">✓ Fullfør økt</button>
      <button class="soft-danger big" data-action="cancel-session">Avbryt økt</button>
    </div>`;
}

function renderHistory() {
  const items = [...db.history].sort((a, b) => b.startedAt - a.startedAt).map(h => `
    <details class="card">
      <summary>
        <strong>${esc(h.workoutName)}</strong>
        <div class="muted">${esc(h.programName)} · ${formatDate(h.startedAt)} · ${formatDuration(h.endedAt - h.startedAt)}</div>
      </summary>
      ${h.exercises.map(ex => `
        <div class="history-ex">
          <strong>${esc(ex.name)}</strong>
          <div class="muted">${ex.sets.map((s, i) => `${i + 1}: ${esc(setText(s))}`).join('<br>') || 'Ingen sett'}</div>
        </div>`).join('')}
      <div class="section row">
        <button class="grow" data-action="edit-history" data-id="${h.id}">Rediger</button>
        <button class="grow soft-danger" data-action="delete-history" data-id="${h.id}">Slett</button>
      </div>
    </details>`).join('');
  return `
    <h1>Historikk</h1>
    ${items || '<p class="empty">Ingen fullførte økter ennå.</p>'}`;
}

function renderHistoryEdit() {
  const d = editDraft;
  if (!d) return go({ name: 'history' });
  return `
    <button class="link" data-action="nav" data-view="history">‹ Historikk</button>
    <h1 style="margin-bottom:4px">Rediger økt</h1>
    <div class="muted" style="margin-bottom:16px">${esc(d.workoutName)} · ${esc(d.programName)}</div>
    <div class="card stack">
      <label class="field"><span class="muted small">Starttid</span>
        <input type="datetime-local" value="${esc(d._start)}" data-meta="_start"></label>
      <label class="field"><span class="muted small">Varighet (minutter)</span>
        <input type="text" inputmode="numeric" pattern="[0-9]*" value="${esc(d._minutes)}" data-meta="_minutes"></label>
    </div>
    ${setCards(d.exercises, 'edit')}
    ${exercisePicker('edit-add-exercise')}
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

function renderProfile() {
  const list = [...db.bodyweight].sort((a, b) => a.date - b.date);
  const latest = list[list.length - 1];
  const prev = list[list.length - 2];
  const change = (from, label) => {
    if (!from) return '';
    const d = num(latest.kg) - num(from.kg);
    return `<div class="muted small">${d > 0 ? '+' : ''}${fmt(d)} kg ${label}</div>`;
  };
  return `
    <h1>Profil</h1>
    <div class="list-item clickable" data-action="nav" data-view="stats">
      <strong>📊 Statistikk muskelgrupper</strong><span class="muted">›</span>
    </div>
    <div class="list-item clickable" data-action="nav" data-view="settings">
      <strong>⚙️ Innstillinger</strong><span class="muted">›</span>
    </div>
    <h2 class="section">Kroppsvekt</h2>
    ${latest ? `
      <div class="stat-grid">
        <div class="stat"><div class="value">${fmt(num(latest.kg))} kg</div><div class="label">Nå (${formatDay(latest.date)})</div></div>
        <div class="stat">${change(prev, 'siden forrige') || '<div class="muted small">–</div>'}${list.length > 2 ? change(list[0], 'totalt') : ''}</div>
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
    <h2 class="section">Logg</h2>
    ${[...list].reverse().map(e => `
      <div class="list-item">
        <span>${formatDay(e.date)}</span>
        <span class="row"><strong>${fmt(num(e.kg))} kg</strong>
          <button class="danger" data-action="delete-bw" data-id="${e.id}" aria-label="Slett">✕</button></span>
      </div>`).join('') || '<p class="empty">Ingen registreringer ennå.</p>'}`;
}

function renderSettings() {
  const c = currentColors();
  const { custom, activeSlot } = db.settings;
  const same = colors => Object.keys(DEFAULT_COLORS).every(k => colors[k].toLowerCase() === c[k].toLowerCase());
  const dots = colors => `<span class="dots"><span style="background:${colors.bg}"></span><span style="background:${colors.accent}"></span></span>`;

  const themes = THEMES.map((t, i) => `
    <button class="theme-btn" data-action="apply-theme" data-i="${i}"
            style="background:${t.colors.card};color:${t.colors.text};${activeSlot === null && same(t.colors) ? `border-color:${c.accent}` : ''}">
      ${dots(t.colors)}${t.name}
    </button>`).join('');

  const slots = custom.map((s, i) => s.colors ? `
    <button class="theme-btn slot" data-action="apply-slot" data-i="${i}"
            style="background:${s.colors.card};color:${s.colors.text};${activeSlot === i ? `border-color:${c.accent}` : ''}">
      ${dots(s.colors)}${esc(s.name)}
      ${activeSlot === i ? '<span class="small" style="opacity:.7">I bruk – redigeres under</span>' : ''}
    </button>` : `
    <button class="theme-btn slot empty" data-action="apply-slot" data-i="${i}">
      <span style="font-size:1.3rem">+</span>${esc(s.name)}
      <span class="small muted">Tomt – trykk for å lage</span>
    </button>`).join('');

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
    <button class="link" data-action="nav" data-view="profile">‹ Profil</button>
    <h1>Innstillinger</h1>
    <h2>Mine temaer</h2>
    <div class="slots">${slots}</div>
    <h2 class="section">Ferdige temaer</h2>
    <div class="themes">${themes}</div>
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
      <span class="title">${esc(db.active.workoutName)}</span>
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
  profile: renderProfile, settings: renderSettings,
};

const TAB_OF = { program: 'programs', workout: 'programs', exercise: 'library', stats: 'profile', settings: 'profile', historyEdit: 'history' };

function render() {
  const html = VIEWS[view.name]();
  if (html === undefined) return; // go() har allerede rendret
  document.getElementById('app').innerHTML = html;
  renderHeader();
  const tab = TAB_OF[view.name] ?? view.name;
  document.querySelectorAll('#nav button').forEach(b =>
    b.classList.toggle('active', b.dataset.view === tab));
}

function go(newView) {
  view = newView;
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
}
setInterval(tick, 250);
document.addEventListener('visibilitychange', tick);

// ---------- Handlinger ----------

const actions = {
  'nav': d => go(d.view === 'programs' ? homeProgramView() : { name: d.view }),
  'all-programs': () => go({ name: 'programs' }),
  'open-program': d => go({ name: 'program', programId: d.id }),
  'open-workout': d => go({ name: 'workout', programId: view.programId, workoutId: d.id }),
  'open-exercise': d => go({ name: 'exercise', exerciseId: d.id }),
  'stats-period': d => go({ name: 'stats', period: d.p }),

  'pick-ex': d => {
    forms[d.target]?.({ exerciseId: d.id });
    save(); render();
  },

  'delete-program': async () => {
    const p = getProgram(view.programId);
    if (!await ask(`Slette «${p.name}»?`, 'Programmet og alle øktene i det slettes. Historikken beholdes.', { ok: 'Slett program' })) return;
    db.programs = db.programs.filter(x => x !== p);
    save(); go({ name: 'programs' });
  },
  'delete-workout': async () => {
    const p = getProgram(view.programId);
    const w = getWorkout(view.programId, view.workoutId);
    if (!await ask(`Slette «${w.name}»?`, 'Økta fjernes fra programmet. Historikken beholdes.', { ok: 'Slett økt' })) return;
    p.workouts = p.workouts.filter(x => x !== w);
    save(); go({ name: 'program', programId: p.id });
  },
  'remove-ex': d => {
    getWorkout(view.programId, view.workoutId).exerciseIds.splice(+d.i, 1);
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
    if (!await ask(`Slette «${e.name}»?`, 'Den fjernes fra biblioteket og fra øktene den er lagt i. Historikken beholdes.', { ok: 'Slett øvelse' })) return;
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
    db.active = {
      programId: p.id,
      workoutId: w.id,
      programName: p.name,
      workoutName: w.name,
      startedAt: Date.now(),
      exercises: w.exerciseIds.map(sessionEx),
    };
    db.lastProgramId = p.id;
    save(); go({ name: 'session' });
  },
  'add-set': d => {
    const ex = setTarget(d.scope).exercises[+d.i];
    const prev = ex.sets[ex.sets.length - 1];
    ex.sets.push(prev ? { ...prev } : emptySet(isTimedEx(ex)));
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
  'remove-set': d => {
    if (d.scope === 'active') stopStopwatch(); // indekser kan endre seg
    setTarget(d.scope).exercises[+d.i].sets.splice(+d.s, 1);
    if (d.scope === 'active') save();
    render();
  },
  'remove-card-ex': async d => {
    const list = setTarget(d.scope).exercises;
    const ex = list[+d.i];
    // Spør bare hvis det er logget noe på øvelsen
    if (ex.sets.some(hasData) &&
        !await ask(`Fjerne «${ex.name}»?`, 'Settene du har logget på denne øvelsen forsvinner.', { ok: 'Fjern øvelse' })) return;
    if (d.scope === 'active') stopStopwatch();
    list.splice(+d.i, 1);
    if (d.scope === 'active') save();
    render();
  },
  'finish-session': async () => {
    if (!await ask('Fullføre økta?', 'Økta lagres i historikken.', { ok: 'Fullfør økt', danger: false })) return;
    stopStopwatch();
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
        sets: ex.sets.filter(hasData),
      })),
    });
    db.active = null;
    save(); go({ name: 'history' });
  },
  'cancel-session': async () => {
    if (!await ask('Avbryte økta?', 'Det du har logget blir ikke lagret.', { ok: 'Avbryt økt', cancel: 'Fortsett økta' })) return;
    db.active = null;
    save(); go(homeProgramView());
  },

  'edit-history': d => {
    const h = db.history.find(x => x.id === d.id);
    editDraft = JSON.parse(JSON.stringify(h));
    editDraft._start = toLocalInput(h.startedAt);
    editDraft._minutes = String(Math.round((h.endedAt - h.startedAt) / 60000));
    editDraft.exercises.forEach(e => { if (!e.sets.length) e.sets.push(emptySet(isTimedEx(e))); });
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
    if (!await ask(`Slette «${h.workoutName}»?`, `Økta fra ${formatDate(h.startedAt)} slettes fra historikken for godt.`, { ok: 'Slett økt' })) return;
    db.history = db.history.filter(h => h.id !== d.id);
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
    db.bodyweight = db.bodyweight.filter(e => e.id !== d.id);
    save(); render();
  },
};

const forms = {
  'new-program': f => {
    db.programs.push({ id: uid(), name: f.name, workouts: [] });
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
    db.exercises.push({ id: uid(), name: f.name, category: f.category, subs: f.subs, equipment: f.equipment, timed: f.timed });
    openCats.add(f.category);
  },
  'edit-exercise': f => {
    const ex = getExercise(view.exerciseId);
    if (db.exercises.some(e => e !== ex && e.name.toLowerCase() === f.name.toLowerCase())) {
      notice('Navnet er i bruk', 'En annen øvelse har allerede dette navnet.');
      return;
    }
    Object.assign(ex, { name: f.name, category: f.category, subs: f.subs, equipment: f.equipment, timed: f.timed });
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

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  actions[el.dataset.action]?.(el.dataset);
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

// Fargevelger: oppdater live mens man velger, og marker riktig tema når man er ferdig
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
});
document.addEventListener('change', e => {
  if (e.target.dataset?.color || e.target.matches('[data-theme-name]')) render();
});

// Vis riktige under-muskelgrupper når muskelgruppe velges
document.addEventListener('change', e => {
  if (e.target.name !== 'category') return;
  const picker = e.target.closest('form')?.querySelector('.sub-picker');
  if (picker) picker.innerHTML = subPickerHtml(e.target.value);
});

// Husk hvilke muskelgrupper som er åpne i biblioteket
document.addEventListener('toggle', e => {
  const cat = e.target.dataset?.cat;
  if (cat === undefined) return;
  e.target.open ? openCats.add(cat) : openCats.delete(cat);
}, true);

// Vis treff når søkefeltet for å legge til øvelse får fokus
document.addEventListener('focusin', e => {
  if (!e.target.matches('[data-picker-input]')) return;
  const picker = e.target.closest('.picker');
  picker.querySelector('.picker-results').innerHTML = pickerResultsHtml(picker.dataset.target, e.target.value);
});

document.addEventListener('input', e => {
  const el = e.target;

  // Søk når man legger til øvelse
  if (el.matches('[data-picker-input]')) {
    const picker = el.closest('.picker');
    picker.querySelector('.picker-results').innerHTML = pickerResultsHtml(picker.dataset.target, el.value);
    return;
  }
  // Søk i biblioteket
  if (el.matches('[data-lib-search]')) {
    libQuery = el.value;
    document.getElementById('lib-groups').innerHTML = libraryGroupsHtml();
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
  // Vekt/reps/tid lagres fortløpende uten å rendre på nytt (beholder fokus i feltet)
  if (!el.dataset.field) return;
  const target = setTarget(el.dataset.scope);
  if (!target) return;
  const clean = el.dataset.field === 'weight'
    ? el.value.replace(/[^0-9.,]/g, '')
    : el.value.replace(/[^0-9]/g, '');
  if (clean !== el.value) el.value = clean;
  target.exercises[+el.dataset.i].sets[+el.dataset.s][el.dataset.field] = clean;
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
