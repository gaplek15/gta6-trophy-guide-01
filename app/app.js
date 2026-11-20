// Leonida Trophy Guide — checklist tracker, filters, spoiler mode, roadmap.
// Data lives in data/trophies.json (55 trophies) and data/roadmap.json (5 stages).
// Progress is saved in localStorage and can be exported to / imported from a file.
// URL helpers for screenshots and sharing: ?view=roadmap, ?kind=story, ?open=<id>,
// ?spoilers=on, ?demo=1 (seeds a sample 12-trophy progress when nothing is saved yet).
const STORE_KEY = 'leonida-trophy-guide-v1';
const DEMO_EARNED = [2, 3, 4, 8, 15, 16, 28, 35, 42, 52, 53, 55];
const params = new URLSearchParams(location.search);

const listEl = document.getElementById('trophyList');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const gradeCountsEl = document.getElementById('gradeCounts');
const resultCountEl = document.getElementById('resultCount');
const emptyNoteEl = document.getElementById('emptyNote');
const onlineNoteEl = document.getElementById('onlineNote');
const searchEl = document.getElementById('search');
const gradeFilterEl = document.getElementById('gradeFilter');
const spoilerToggleEl = document.getElementById('spoilerToggle');
const hideEarnedEl = document.getElementById('hideEarned');
const kindButtons = [...document.querySelectorAll('#kindFilters .kind')];

let trophies = [];
let roadmap = null;
let earned = new Set(loadSaved());
let kindFilter = params.get('kind') || 'all';
let openId = params.get('open') ? Number(params.get('open')) : null;

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}
function saveProgress() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}
function seedDemoIfRequested() {
  if (params.get('demo') === '1' && earned.size === 0) {
    earned = new Set(DEMO_EARNED);
    saveProgress();
  }
}
function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}
function trophyIsSpoilerHidden(t) {
  return spoilerToggleEl.checked && t.kind === 'story' && !earned.has(t.id);
}
function trophyMatchesKind(t) {
  if (kindFilter === 'all') return true;
  if (kindFilter === 'missable') return t.missable === true;
  if (kindFilter === 'online') return t.kind === 'online';
  return t.kind === kindFilter;
}
function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (!trophyMatchesKind(t)) return false;
    if (gradeFilterEl.value !== 'all' && t.grade !== gradeFilterEl.value) return false;
    if (hideEarnedEl.checked && earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}
function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = total ? Math.round((done / total) * 100) : 0;
  progressFill.style.width = pct + '%';
  progressText.textContent = `${done} of ${total} earned — ${pct}% to the platinum`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const inGrade = trophies.filter((t) => t.grade === g);
    const got = inGrade.filter((t) => earned.has(t.id)).length;
    return `${got}/${inGrade.length} ${gradeLabel(g)}`;
  });
  gradeCountsEl.textContent = counts.join(' · ');
}
function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren();
  onlineNoteEl.hidden = kindFilter !== 'online';
  emptyNoteEl.hidden = shown.length > 0;
  resultCountEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
    li.id = 'trophy-' + t.id;
    li.dataset.id = String(t.id);
    const head = document.createElement('div');
    head.className = 'trophy-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'trophy-check';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveProgress();
      renderProgress();
      renderList();
      renderRoadmap();
    });
    const main = document.createElement('div');
    main.className = 'trophy-main';
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    const spoilerHidden = trophyIsSpoilerHidden(t);
    if (spoilerHidden) {
      name.textContent = 'Hidden story trophy';
      desc.textContent = 'Earn this trophy to reveal its name and guide.';
      desc.classList.add('spoiler-note');
    } else {
      name.textContent = t.name;
      desc.textContent = t.description;
    }
    main.append(name, desc);
    const badges = document.createElement('div');
    badges.className = 'badges';
    const gradeBadge = document.createElement('span');
    gradeBadge.className = 'badge ' + t.grade;
    gradeBadge.textContent = gradeLabel(t.grade);
    badges.append(gradeBadge);
    if (t.hidden) {
      const b = document.createElement('span');
      b.className = 'badge hidden';
      b.textContent = 'Hidden';
      badges.append(b);
    }
    if (t.missable) {
      const b = document.createElement('span');
      b.className = 'badge missable';
      b.textContent = 'Missable';
      badges.append(b);
    }
    const kindBadge = document.createElement('span');
    kindBadge.className = 'badge kind';
    kindBadge.textContent = t.kind;
    if (t.kind !== t.grade) badges.append(kindBadge);
    if (t.count) {
      const b = document.createElement('span');
      b.className = 'badge count';
      b.textContent = String(t.count);
      badges.append(b);
    }
    main.append(badges);
    if (!spoilerHidden) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'guide-toggle';
      const isOpen = openId === t.id;
      toggle.textContent = isOpen ? 'Hide guide ▲' : 'Show guide ▼';
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.addEventListener('click', () => {
        openId = openId === t.id ? null : t.id;
        renderList();
      });
      main.append(toggle);
      if (isOpen) {
        const body = document.createElement('div');
        body.className = 'guide-body';
        const guide = document.createElement('p');
        guide.textContent = t.guide;
        body.append(guide);
        if (t.steps && t.steps.length) {
          const h = document.createElement('h4');
          h.textContent = 'How to do it';
          const ol = document.createElement('ol');
          for (const s of t.steps) {
            const item = document.createElement('li');
            item.textContent = s;
            ol.append(item);
          }
          body.append(h, ol);
        }
        if (t.sources && t.sources.length) {
          const h = document.createElement('h4');
          h.textContent = 'Sources';
          const ul = document.createElement('ul');
          ul.className = 'sources';
          for (const s of t.sources) {
            const item = document.createElement('li');
            const a = document.createElement('a');
            a.href = s.url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = s.name;
            item.append(a);
            ul.append(item);
          }
          body.append(h, ul);
        }
        main.append(body);
      }
    }
    head.append(box, main);
    li.append(head);
    listEl.append(li);
  }
  renderProgress();
  if (location.hash.startsWith('#trophy-')) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
}
function renderRoadmap() {
  const list = document.getElementById('roadmapList');
  const intro = document.getElementById('roadmapIntro');
  if (!roadmap) return;
  intro.textContent = roadmap.note;
  list.replaceChildren();
  const byId = new Map(trophies.map((t) => [t.id, t]));
  for (const stage of roadmap.stages) {
    const li = document.createElement('li');
    li.className = 'roadmap-stage';
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const hours = document.createElement('p');
    hours.className = 'hours';
    hours.textContent = 'About ' + stage.hours + ' hours';
    const text = document.createElement('p');
    text.textContent = stage.text;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const id of stage.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      const chip = document.createElement('span');
      chip.className = 'chip' + (earned.has(id) ? ' done' : '') + (t.missable ? ' miss' : '');
      chip.textContent = (earned.has(id) ? '✓ ' : '') + t.name + (t.missable ? ' — missable' : '');
      chips.append(chip);
    }
    li.append(h, hours, text, chips);
    list.append(li);
  }
}
function showView(view) {
  const checklist = view !== 'roadmap';
  document.getElementById('viewChecklist').hidden = !checklist;
  document.getElementById('viewRoadmap').hidden = checklist;
  document.getElementById('tabChecklist').classList.toggle('active', checklist);
  document.getElementById('tabRoadmap').classList.toggle('active', !checklist);
}
function applyKindButtons() {
  for (const b of kindButtons) b.classList.toggle('active', b.dataset.kind === kindFilter);
}
async function loadData() {
  const [trophiesDoc, roadmapDoc] = await Promise.all([
    (await fetch('data/trophies.json')).json(),
    (await fetch('data/roadmap.json')).json(),
  ]);
  trophies = trophiesDoc.trophies;
  roadmap = roadmapDoc;
}
function wireControls() {
  searchEl.addEventListener('input', renderList);
  gradeFilterEl.addEventListener('change', renderList);
  spoilerToggleEl.addEventListener('change', renderList);
  hideEarnedEl.addEventListener('change', renderList);
  for (const b of kindButtons) {
    b.addEventListener('click', () => {
      kindFilter = b.dataset.kind;
      applyKindButtons();
      renderList();
    });
  }
  document.getElementById('tabChecklist').addEventListener('click', () => showView('checklist'));
  document.getElementById('tabRoadmap').addEventListener('click', () => showView('roadmap'));
  document.getElementById('exportBtn').addEventListener('click', () => {
    const payload = { game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b), exported: new Date().toISOString() };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    a.download = 'leonida-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById('importInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const ids = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(ids)) throw new Error('no earned list');
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set(ids.filter((n) => valid.has(n)));
      saveProgress();
      renderList();
      renderRoadmap();
    } catch {
      alert('That file is not a Leonida Trophy Guide progress export.');
    }
    e.target.value = '';
  });
}
seedDemoIfRequested();
if (params.get('spoilers') === 'on') spoilerToggleEl.checked = true;
if (params.get('kind')) kindFilter = params.get('kind');
if (params.get('q')) searchEl.value = params.get('q');
await loadData();
wireControls();
applyKindButtons();
renderList();
renderRoadmap();
showView(params.get('view') === 'roadmap' ? 'roadmap' : 'checklist');
