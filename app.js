// Treningslogg – enkel app for program, økter, øvelser og logging av sett.
// All data lagres lokalt på enheten (localStorage).

const STORE_KEY = 'treningsapp-v1';

const CATEGORIES = [
  { id: 'armer',   name: 'Armer',   subs: ['Bicep', 'Tricep', 'Forearm'] },
  { id: 'rygg',    name: 'Rygg',    subs: ['Lats', 'Traps', 'Lower back'] },
  { id: 'bryst',   name: 'Bryst',   subs: ['Upper', 'Lower'] },
  { id: 'skuldre', name: 'Skuldre', subs: ['Front', 'Lateral', 'Rear'] },
  { id: 'bein',    name: 'Bein',    subs: ['Quads', 'Hamstring', 'Calf'] },
  { id: 'mage',    name: 'Mage',    subs: [] },
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY));
    if (data) return data;
  } catch (e) { /* ignorer */ }
  return {
    exercises: [],        // { id, name, category, subs: [] }
    programs: [],         // { id, name, workouts: [{ id, name, exerciseIds: [] }] }
    history: [],          // fullførte økter
    active: null,         // pågående økt
    lastProgramId: null,  // programmet til forrige økt
  };
}

let db = load();
// Oppgrader data fra eldre versjoner
db.exercises.forEach(e => { e.category ??= ''; e.subs ??= []; });
db.lastProgramId ??= null;

const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(db));

let view;              // hvilken side som vises
let editDraft = null;  // kopi av fullført økt som redigeres
const openCats = new Set(); // åpne kategorier i biblioteket

// ---------- Hjelpere ----------

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const getExercise = id => db.exercises.find(e => e.id === id);
const exName = id => getExercise(id)?.name ?? '(slettet øvelse)';
const getProgram = id => db.programs.find(p => p.id === id);
const getWorkout = (pid, wid) => getProgram(pid)?.workouts.find(w => w.id === wid);
const catName = id => CATEGORIES.find(c => c.id === id)?.name ?? 'Uten kategori';

const num = v => parseFloat(String(v ?? '').replace(',', '.')) || 0;
const fmt = n => n.toLocaleString('nb-NO', { maximumFractionDigits: 1 });

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

const formatDate = ts => new Date(ts).toLocaleString('nb-NO', {
  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});
const formatDay = ts => new Date(ts).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });

// Tidspunkt -> verdi for <input type="datetime-local"> (lokal tid)
const toLocalInput = ts => new Date(ts - new Date(ts).getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const setText = set => `${set.weight || 0} kg × ${set.reps || 0}`;
const emptySet = () => ({ weight: '', reps: '' });
const hasData = s => s.weight !== '' || s.reps !== '';

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

// Nedtrekksliste med øvelser gruppert på kategori
function exerciseOptions() {
  const sorted = [...db.exercises].sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  return [...CATEGORIES, { id: '', name: 'Uten kategori' }].map(c => {
    const list = sorted.filter(e => (e.category || '') === c.id);
    if (!list.length) return '';
    return `<optgroup label="${esc(c.name)}">${list.map(e =>
      `<option value="${e.id}">${esc(e.name)}</option>`).join('')}</optgroup>`;
  }).join('');
}

function exercisePicker(formName, buttonText) {
  if (!db.exercises.length) {
    return `
      <div class="card muted">
        Biblioteket er tomt.
        <button class="link" data-action="nav" data-view="library" style="color:var(--accent)">Legg inn øvelser ›</button>
      </div>`;
  }
  return `
    <form class="row" data-form="${formName}">
      <select name="exerciseId" required>${exerciseOptions()}</select>
      <button>${buttonText}</button>
    </form>`;
}

function subPickerHtml(catId, selected = []) {
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat || !cat.subs.length) return '';
  return `
    <div class="muted small">Underkategori (valgfritt, flere mulig)</div>
    <div class="chips">${cat.subs.map(s => `
      <label class="chip"><input type="checkbox" name="subs" value="${esc(s)}" ${selected.includes(s) ? 'checked' : ''}>${esc(s)}</label>`).join('')}
    </div>`;
}

function exerciseFormFields(ex = {}) {
  return `
    <input name="name" placeholder="Navn på øvelse" value="${esc(ex.name || '')}" required>
    <select name="category" required>
      <option value="" disabled ${ex.category ? '' : 'selected'}>Velg kategori</option>
      ${CATEGORIES.map(c => `<option value="${c.id}" ${ex.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
    </select>
    <div class="sub-picker">${subPickerHtml(ex.category, ex.subs)}</div>`;
}

// Kort med sett for hver øvelse. scope = 'active' (pågående økt) eller 'edit' (redigering av fullført økt)
const setTarget = scope => (scope === 'edit' ? editDraft : db.active);

function setCards(exercises, scope) {
  return exercises.map((ex, i) => {
    const last = scope === 'active' ? lastPerformance(ex.exerciseId) : null;
    const rows = ex.sets.map((s, j) => `
      <div class="set-grid">
        <span class="num">${j + 1}</span>
        <input type="text" inputmode="decimal" autocomplete="off" placeholder="kg"
               value="${esc(s.weight)}" data-scope="${scope}" data-i="${i}" data-s="${j}" data-field="weight">
        <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="reps"
               value="${esc(s.reps)}" data-scope="${scope}" data-i="${i}" data-s="${j}" data-field="reps">
        <button class="danger" data-action="remove-set" data-scope="${scope}" data-i="${i}" data-s="${j}" aria-label="Fjern sett">✕</button>
      </div>`).join('');
    return `
      <section class="card">
        <div class="card-head">
          <h3>${esc(ex.name)}</h3>
          <button class="danger small" data-action="remove-card-ex" data-scope="${scope}" data-i="${i}">Fjern øvelse</button>
        </div>
        ${last ? `<div class="muted" style="margin-bottom:8px">Forrige gang: ${esc(last)}</div>` : ''}
        <div class="set-grid head"><span class="num">Sett</span><span style="text-align:center">Vekt (kg)</span><span style="text-align:center">Reps</span><span></span></div>
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
    <div class="section"><button class="danger" data-action="delete-program">Slett program</button></div>`;
}

function renderWorkout() {
  const p = getProgram(view.programId);
  const w = getWorkout(view.programId, view.workoutId);
  if (!w) return go({ name: 'program', programId: view.programId });
  const items = w.exerciseIds.map((id, i) => `
    <div class="list-item">
      <div>${i + 1}. ${esc(exName(id))}<div class="muted small">${esc(catName(getExercise(id)?.category))}</div></div>
      <span class="row">
        <button data-action="move-ex" data-i="${i}" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="Flytt opp">↑</button>
        <button data-action="move-ex" data-i="${i}" data-dir="1" ${i === w.exerciseIds.length - 1 ? 'disabled' : ''} aria-label="Flytt ned">↓</button>
        <button class="danger" data-action="remove-ex" data-i="${i}" aria-label="Fjern">✕</button>
      </span>
    </div>`).join('');
  return `
    <button class="link" data-action="open-program" data-id="${p.id}">‹ ${esc(p.name)}</button>
    <h1>${esc(w.name)}</h1>
    ${items || '<p class="empty">Ingen øvelser ennå. Legg til fra biblioteket.</p>'}
    <div class="section">${exercisePicker('add-ex-to-workout', 'Legg til')}</div>
    <div class="section">
      <button class="primary big" data-action="start-session" ${w.exerciseIds.length ? '' : 'disabled'}>▶ Start økt</button>
    </div>
    <div class="section"><button class="danger" data-action="delete-workout">Slett økt</button></div>`;
}

function renderLibrary() {
  const sorted = [...db.exercises].sort((a, b) => a.name.localeCompare(b.name, 'nb'));
  const groups = [...CATEGORIES];
  if (sorted.some(e => !e.category)) groups.push({ id: '', name: 'Uten kategori' });
  const groupHtml = groups.map(g => {
    const list = sorted.filter(e => (e.category || '') === g.id);
    const items = list.map(e => `
      <div class="list-item clickable" data-action="open-exercise" data-id="${e.id}">
        <div>${esc(e.name)}${e.subs.length ? `<div class="muted small">${esc(e.subs.join(', '))}</div>` : ''}</div>
        <span class="muted">›</span>
      </div>`).join('');
    return `
      <details class="group" data-cat="${g.id}" ${openCats.has(g.id) ? 'open' : ''}>
        <summary><strong>${esc(g.name)}</strong><span class="muted">${list.length}</span></summary>
        <div class="group-body">${items || '<div class="muted small" style="padding:0 4px 8px">Ingen øvelser ennå</div>'}</div>
      </details>`;
  }).join('');
  return `
    <h1>Øvelser</h1>
    <form class="card stack" data-form="new-exercise">
      <strong>Ny øvelse</strong>
      ${exerciseFormFields()}
      <button class="primary">Legg til</button>
    </form>
    <div class="list-item clickable" data-action="nav" data-view="stats">
      <strong>📊 Statistikk muskelgrupper</strong><span class="muted">›</span>
    </div>
    <h2 class="section">Øvelsesbibliotek</h2>
    ${groupHtml}`;
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

  let kg = 0, reps = 0, sets = 0, bestVol = null, heaviest = null;
  entries.forEach(({ h, sets: ss }) => ss.forEach(s => {
    const w = num(s.weight), r = num(s.reps), vol = w * r;
    kg += vol; reps += r; sets++;
    if (!bestVol || vol > bestVol.vol) bestVol = { s, vol, date: h.startedAt };
    if (!heaviest || w > heaviest.w || (w === heaviest.w && r > heaviest.r)) heaviest = { s, w, r, date: h.startedAt };
  }));

  const historyHtml = entries.map(({ h, sets: ss }) => `
    <div class="card">
      <strong>${esc(formatDate(h.startedAt))}</strong>
      <div class="muted small">${esc(h.workoutName)}</div>
      <div class="muted" style="margin-top:6px">${ss.map((s, i) => `${i + 1}: ${esc(setText(s))}`).join('<br>')}</div>
    </div>`).join('');

  return `
    <button class="link" data-action="nav" data-view="library">‹ Øvelser</button>
    <h1 style="margin-bottom:4px">${esc(ex.name)}</h1>
    <div class="muted" style="margin-bottom:16px">${esc(catName(ex.category))}${ex.subs.length ? ' · ' + esc(ex.subs.join(', ')) : ''}</div>

    <div class="stat-grid">
      <div class="stat"><div class="value">${fmt(kg)} kg</div><div class="label">Totalt løftet</div></div>
      <div class="stat"><div class="value">${fmt(reps)}</div><div class="label">Totalt reps</div></div>
      <div class="stat"><div class="value">${sets}</div><div class="label">Totalt sett</div></div>
      <div class="stat"><div class="value">${entries.length}</div><div class="label">Økter</div></div>
    </div>
    <div class="card">
      <div class="muted small">Sett med høyest volum (kg × reps)</div>
      <strong>${bestVol ? `${esc(setText(bestVol.s))} = ${fmt(bestVol.vol)} kg` : '–'}</strong>
      ${bestVol ? `<div class="muted small">${formatDay(bestVol.date)}</div>` : ''}
    </div>
    <div class="card">
      <div class="muted small">Sett med høyest vekt</div>
      <strong>${heaviest ? esc(setText(heaviest.s)) : '–'}</strong>
      ${heaviest ? `<div class="muted small">${formatDay(heaviest.date)}</div>` : ''}
    </div>

    <h2 class="section">Historikk</h2>
    ${historyHtml || '<p class="empty">Ingen fullførte økter med denne øvelsen ennå.</p>'}

    <details class="card section">
      <summary><strong>Rediger øvelse</strong></summary>
      <form class="stack" data-form="edit-exercise" style="margin-top:12px">
        ${exerciseFormFields(ex)}
        <button class="primary">Lagre</button>
      </form>
    </details>
    <div class="section"><button class="danger" data-action="delete-exercise">Slett øvelse</button></div>`;
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
    <button class="link" data-action="nav" data-view="library">‹ Øvelser</button>
    <h1>Muskelgrupper</h1>
    <div class="seg">${seg}</div>
    ${total ? rows : '<p class="empty">Ingen fullførte sett i denne perioden.</p>'}
    <p class="muted small">Antall sett fra fullførte økter, fordelt på øvelsens kategori. Kg = vekt × reps.</p>`;
}

function renderSession() {
  const a = db.active;
  if (!a) return go(homeProgramView());
  return `
    ${setCards(a.exercises, 'active') || '<p class="empty">Ingen øvelser i økta. Legg til under.</p>'}
    ${exercisePicker('session-add-exercise', '+ Øvelse')}
    <div class="section stack">
      <button class="primary big" data-action="finish-session">✓ Fullfør økt</button>
      <button class="danger big" data-action="cancel-session">Avbryt økt</button>
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
        <button data-action="edit-history" data-id="${h.id}">Rediger</button>
        <button class="danger" data-action="delete-history" data-id="${h.id}">Slett</button>
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
    ${exercisePicker('edit-add-exercise', '+ Øvelse')}
    <div class="section stack">
      <button class="primary big" data-action="save-history">Lagre endringer</button>
      <button class="big" data-action="nav" data-view="history">Avbryt</button>
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
};

const TAB_OF = { program: 'programs', workout: 'programs', exercise: 'library', stats: 'library', historyEdit: 'history' };

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
}
setInterval(tick, 1000);
document.addEventListener('visibilitychange', tick);

// ---------- Handlinger ----------

const actions = {
  'nav': d => go(d.view === 'programs' ? homeProgramView() : { name: d.view }),
  'all-programs': () => go({ name: 'programs' }),
  'open-program': d => go({ name: 'program', programId: d.id }),
  'open-workout': d => go({ name: 'workout', programId: view.programId, workoutId: d.id }),
  'open-exercise': d => go({ name: 'exercise', exerciseId: d.id }),
  'stats-period': d => go({ name: 'stats', period: d.p }),

  'delete-program': () => {
    const p = getProgram(view.programId);
    if (!confirm(`Slette programmet «${p.name}»?`)) return;
    db.programs = db.programs.filter(x => x !== p);
    save(); go({ name: 'programs' });
  },
  'delete-workout': () => {
    const p = getProgram(view.programId);
    const w = getWorkout(view.programId, view.workoutId);
    if (!confirm(`Slette økta «${w.name}»?`)) return;
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
  'delete-exercise': () => {
    const e = getExercise(view.exerciseId);
    if (!confirm(`Slette «${e.name}» fra biblioteket? Den fjernes også fra økter den er lagt i. Historikken beholdes.`)) return;
    db.exercises = db.exercises.filter(x => x !== e);
    db.programs.forEach(p => p.workouts.forEach(w => {
      w.exerciseIds = w.exerciseIds.filter(id => id !== e.id);
    }));
    save(); go({ name: 'library' });
  },

  'start-session': () => {
    if (db.active && !confirm('Du har allerede en pågående økt. Erstatte den?')) return;
    const p = getProgram(view.programId);
    const w = getWorkout(view.programId, view.workoutId);
    db.active = {
      programId: p.id,
      workoutId: w.id,
      programName: p.name,
      workoutName: w.name,
      startedAt: Date.now(),
      exercises: w.exerciseIds.map(id => ({ exerciseId: id, name: exName(id), sets: [emptySet()] })),
    };
    db.lastProgramId = p.id;
    save(); go({ name: 'session' });
  },
  'add-set': d => {
    const sets = setTarget(d.scope).exercises[+d.i].sets;
    const prev = sets[sets.length - 1];
    sets.push(prev ? { ...prev } : emptySet());
    if (d.scope === 'active') save();
    render();
  },
  'remove-set': d => {
    setTarget(d.scope).exercises[+d.i].sets.splice(+d.s, 1);
    if (d.scope === 'active') save();
    render();
  },
  'remove-card-ex': d => {
    const list = setTarget(d.scope).exercises;
    const ex = list[+d.i];
    if (!confirm(`Fjerne «${ex.name}» fra økta?`)) return;
    list.splice(+d.i, 1);
    if (d.scope === 'active') save();
    render();
  },
  'finish-session': () => {
    if (!confirm('Fullføre og lagre økta?')) return;
    const a = db.active;
    // Spør om endringer i øvelsene skal lagres permanent i økta
    const w = getWorkout(a.programId, a.workoutId);
    const ids = a.exercises.map(e => e.exerciseId).filter(id => getExercise(id));
    if (w && JSON.stringify(ids) !== JSON.stringify(w.exerciseIds) &&
        confirm(`Du har endret øvelsene i økta. Vil du lagre endringene i «${w.name}» permanent?`)) {
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
        sets: ex.sets.filter(hasData),
      })),
    });
    db.active = null;
    save(); go({ name: 'history' });
  },
  'cancel-session': () => {
    if (!confirm('Avbryte økta? Det du har logget blir ikke lagret.')) return;
    db.active = null;
    save(); go(homeProgramView());
  },

  'edit-history': d => {
    const h = db.history.find(x => x.id === d.id);
    editDraft = JSON.parse(JSON.stringify(h));
    editDraft._start = toLocalInput(h.startedAt);
    editDraft._minutes = String(Math.round((h.endedAt - h.startedAt) / 60000));
    editDraft.exercises.forEach(e => { if (!e.sets.length) e.sets.push(emptySet()); });
    go({ name: 'historyEdit' });
  },
  'save-history': () => {
    const { _start, _minutes, ...h } = editDraft;
    const start = new Date(_start).getTime();
    if (isNaN(start)) { alert('Ugyldig starttid.'); return; }
    h.startedAt = start;
    h.endedAt = start + (parseInt(_minutes, 10) || 0) * 60000;
    h.exercises = h.exercises.map(e => ({ ...e, sets: e.sets.filter(hasData) }));
    db.history[db.history.findIndex(x => x.id === h.id)] = h;
    db.history.sort((a, b) => a.startedAt - b.startedAt);
    editDraft = null;
    save(); go({ name: 'history' });
  },
  'delete-history': d => {
    if (!confirm('Slette denne økta fra historikken?')) return;
    db.history = db.history.filter(h => h.id !== d.id);
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
      alert('Øvelsen finnes allerede.');
      return;
    }
    db.exercises.push({ id: uid(), name: f.name, category: f.category, subs: f.subs });
    openCats.add(f.category);
  },
  'edit-exercise': f => {
    const ex = getExercise(view.exerciseId);
    if (db.exercises.some(e => e !== ex && e.name.toLowerCase() === f.name.toLowerCase())) {
      alert('En annen øvelse har allerede dette navnet.');
      return;
    }
    Object.assign(ex, { name: f.name, category: f.category, subs: f.subs });
    // Oppdater navnet i historikk og pågående økt også
    [...db.history, db.active].filter(Boolean).forEach(s => s.exercises.forEach(e => {
      if (e.exerciseId === ex.id) e.name = ex.name;
    }));
  },
  'session-add-exercise': f => {
    db.active.exercises.push({ exerciseId: f.exerciseId, name: exName(f.exerciseId), sets: [emptySet()] });
  },
  'edit-add-exercise': f => {
    editDraft.exercises.push({ exerciseId: f.exerciseId, name: exName(f.exerciseId), sets: [emptySet()] });
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
  if (data.name !== undefined) data.name = data.name.trim();
  if (data.name === '') return;
  forms[form.dataset.form]?.(data);
  save(); render();
});

// Vis riktige underkategorier når kategori velges
document.addEventListener('change', e => {
  if (e.target.name !== 'category') return;
  const picker = e.target.closest('form')?.querySelector('.sub-picker');
  if (picker) picker.innerHTML = subPickerHtml(e.target.value);
});

// Husk hvilke kategorier som er åpne i biblioteket
document.addEventListener('toggle', e => {
  const cat = e.target.dataset?.cat;
  if (cat === undefined) return;
  e.target.open ? openCats.add(cat) : openCats.delete(cat);
}, true);

// Lagre vekt/reps fortløpende uten å rendre på nytt (beholder fokus i feltet)
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.meta && editDraft) {
    if (el.dataset.meta === '_minutes') el.value = el.value.replace(/[^0-9]/g, '');
    editDraft[el.dataset.meta] = el.value;
    return;
  }
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

view = db.active ? { name: 'session' } : homeProgramView();
render();
