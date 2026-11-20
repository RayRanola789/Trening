// Treningslogg – enkel app for program, økter, øvelser og logging av sett.
// All data lagres lokalt i nettleseren (localStorage).

const STORE_KEY = 'treningsapp-v1';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY));
    if (data) return data;
  } catch (e) { /* ignorer */ }
  return {
    exercises: [],  // { id, name } – legges inn av brukeren
    programs: [],   // { id, name, workouts: [{ id, name, exerciseIds: [] }] }
    history: [],    // fullførte økter
    active: null,   // pågående økt
  };
}

let db = load();
const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(db));

let view = db.active ? { name: 'session' } : { name: 'programs' };

// ---------- Hjelpere ----------

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const exName = id => db.exercises.find(e => e.id === id)?.name ?? '(slettet øvelse)';
const getProgram = id => db.programs.find(p => p.id === id);
const getWorkout = (pid, wid) => getProgram(pid)?.workouts.find(w => w.id === wid);

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

const setText = set => `${set.weight || 0} kg × ${set.reps || 0}`;

function lastPerformance(exerciseId) {
  for (let i = db.history.length - 1; i >= 0; i--) {
    const ex = db.history[i].exercises.find(e => e.exerciseId === exerciseId);
    if (ex && ex.sets.length) return ex.sets.map(setText).join(', ');
  }
  return null;
}

function exerciseOptions() {
  return [...db.exercises]
    .sort((a, b) => a.name.localeCompare(b.name, 'nb'))
    .map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join('');
}

// Velger for å legge til øvelse fra biblioteket (eller beskjed hvis biblioteket er tomt)
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
    <button class="link" data-action="nav" data-view="programs">‹ Alle program</button>
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
      <span>${i + 1}. ${esc(exName(id))}</span>
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
  const items = [...db.exercises]
    .sort((a, b) => a.name.localeCompare(b.name, 'nb'))
    .map(e => `
      <div class="list-item">
        <span>${esc(e.name)}</span>
        <button class="danger" data-action="delete-exercise" data-id="${e.id}" aria-label="Slett">✕</button>
      </div>`).join('');
  return `
    <h1>Øvelsesbibliotek</h1>
    <form class="row" data-form="new-exercise">
      <input name="name" placeholder="Ny øvelse" required>
      <button class="primary">Legg til</button>
    </form>
    <div class="section">${items || '<p class="empty">Biblioteket er tomt. Legg inn øvelsene du bruker over.</p>'}</div>`;
}

function renderSession() {
  const a = db.active;
  if (!a) return go({ name: 'programs' });
  const cards = a.exercises.map((ex, i) => {
    const last = lastPerformance(ex.exerciseId);
    const rows = ex.sets.map((s, j) => `
      <div class="set-grid">
        <span class="num">${j + 1}</span>
        <input type="text" inputmode="decimal" autocomplete="off" placeholder="kg"
               value="${esc(s.weight)}" data-i="${i}" data-s="${j}" data-field="weight">
        <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="reps"
               value="${esc(s.reps)}" data-i="${i}" data-s="${j}" data-field="reps">
        <button class="danger" data-action="remove-set" data-i="${i}" data-s="${j}" aria-label="Fjern sett">✕</button>
      </div>`).join('');
    return `
      <section class="card">
        <h3>${esc(ex.name)}</h3>
        ${last ? `<div class="muted" style="margin-bottom:8px">Forrige gang: ${esc(last)}</div>` : ''}
        <div class="set-grid head"><span class="num">Sett</span><span style="text-align:center">Vekt (kg)</span><span style="text-align:center">Reps</span><span></span></div>
        ${rows}
        <button data-action="add-set" data-i="${i}" style="width:100%">+ Legg til sett</button>
      </section>`;
  }).join('');
  return `
    ${cards}
    ${exercisePicker('session-add-exercise', '+ Øvelse')}
    <div class="section stack">
      <button class="primary big" data-action="finish-session">✓ Fullfør økt</button>
      <button class="danger big" data-action="cancel-session">Avbryt økt</button>
    </div>`;
}

function renderHistory() {
  const items = [...db.history].reverse().map(h => `
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
      <div class="section"><button class="danger" data-action="delete-history" data-id="${h.id}">Slett</button></div>
    </details>`).join('');
  return `
    <h1>Historikk</h1>
    ${items || '<p class="empty">Ingen fullførte økter ennå.</p>'}`;
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
  library: renderLibrary, session: renderSession, history: renderHistory,
};

function render() {
  const html = VIEWS[view.name]();
  if (html === undefined) return; // go() har allerede rendret
  document.getElementById('app').innerHTML = html;
  renderHeader();
  const tab = { program: 'programs', workout: 'programs' }[view.name] ?? view.name;
  document.querySelectorAll('#nav button').forEach(b =>
    b.classList.toggle('active', b.dataset.view === tab));
}

function go(newView) {
  view = newView;
  render();
  window.scrollTo(0, 0);
}

// ---------- Timer ----------

setInterval(() => {
  const el = document.getElementById('timer');
  if (el && db.active) el.textContent = formatDuration(Date.now() - db.active.startedAt);
}, 1000);

// ---------- Handlinger ----------

const actions = {
  'nav': d => go({ name: d.view }),
  'open-program': d => go({ name: 'program', programId: d.id }),
  'open-workout': d => go({ name: 'workout', programId: view.programId, workoutId: d.id }),

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
  'delete-exercise': d => {
    const e = db.exercises.find(x => x.id === d.id);
    if (!confirm(`Slette «${e.name}» fra biblioteket? Den fjernes også fra økter den er lagt i.`)) return;
    db.exercises = db.exercises.filter(x => x !== e);
    db.programs.forEach(p => p.workouts.forEach(w => {
      w.exerciseIds = w.exerciseIds.filter(id => id !== e.id);
    }));
    save(); render();
  },

  'start-session': () => {
    if (db.active && !confirm('Du har allerede en pågående økt. Erstatte den?')) return;
    const p = getProgram(view.programId);
    const w = getWorkout(view.programId, view.workoutId);
    db.active = {
      programName: p.name,
      workoutName: w.name,
      startedAt: Date.now(),
      exercises: w.exerciseIds.map(id => ({ exerciseId: id, name: exName(id), sets: [{ weight: '', reps: '' }] })),
    };
    save(); go({ name: 'session' });
  },
  'add-set': d => {
    const sets = db.active.exercises[+d.i].sets;
    const prev = sets[sets.length - 1];
    sets.push(prev ? { ...prev } : { weight: '', reps: '' });
    save(); render();
  },
  'remove-set': d => {
    db.active.exercises[+d.i].sets.splice(+d.s, 1);
    save(); render();
  },
  'finish-session': () => {
    if (!confirm('Fullføre og lagre økta?')) return;
    const a = db.active;
    db.history.push({
      id: uid(),
      programName: a.programName,
      workoutName: a.workoutName,
      startedAt: a.startedAt,
      endedAt: Date.now(),
      exercises: a.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        sets: ex.sets.filter(s => s.weight !== '' || s.reps !== ''),
      })),
    });
    db.active = null;
    save(); go({ name: 'history' });
  },
  'cancel-session': () => {
    if (!confirm('Avbryte økta? Det du har logget blir ikke lagret.')) return;
    db.active = null;
    save(); go({ name: 'programs' });
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
    db.exercises.push({ id: uid(), name: f.name });
  },
  'session-add-exercise': f => {
    db.active.exercises.push({ exerciseId: f.exerciseId, name: exName(f.exerciseId), sets: [{ weight: '', reps: '' }] });
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
  const data = Object.fromEntries(new FormData(form));
  if (data.name !== undefined) data.name = data.name.trim();
  if (data.name === '') return;
  forms[form.dataset.form]?.(data);
  save(); render();
});

// Lagre vekt/reps fortløpende uten å rendre på nytt (beholder fokus i feltet)
document.addEventListener('input', e => {
  const el = e.target;
  if (!el.dataset.field || !db.active) return;
  // Tillat bare tall (og komma/punktum for vekt)
  const clean = el.dataset.field === 'weight'
    ? el.value.replace(/[^0-9.,]/g, '')
    : el.value.replace(/[^0-9]/g, '');
  if (clean !== el.value) el.value = clean;
  db.active.exercises[+el.dataset.i].sets[+el.dataset.s][el.dataset.field] = clean;
  save();
});

// Oppdater timeren med en gang når appen kommer tilbake i forgrunnen
document.addEventListener('visibilitychange', () => {
  const el = document.getElementById('timer');
  if (el && db.active) el.textContent = formatDuration(Date.now() - db.active.startedAt);
});

// Offline-støtte og be om at data ikke slettes av iOS
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
navigator.storage?.persist?.().catch(() => {});

render();
