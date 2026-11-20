const STORE_KEY = 'leonida-trophy-guide-v1';
const DEMO_EARNED = [2, 3, 4, 8, 15, 16, 28, 35, 42, 52, 53, 55];

const params = new URLSearchParams(location.search);
const paramKind = params.get('kind') || 'all';
const paramOpen = params.get('open') ? Number(params.get('open')) : null;
const paramQ = params.get('q') || '';
const paramSpoilers = params.get('spoilers') === 'on';
const paramView = params.get('view') || 'checklist';
const paramDemo = params.get('demo') === '1';

let trophies = [];
let roadmap = null;
let earned = new Set();
let kindFilter = paramKind;
let openId = paramOpen;

const $ = (id) => document.getElementById(id);
const searchInput = $('search');
const gradeFilter = $('gradeFilter');
const spoilerToggle = $('spoilerToggle');
const hideEarned = $('hideEarned');
const trophyList = $('trophyList');
const resultCount = $('resultCount');
const onlineNote = $('onlineNote');
const emptyNote = $('emptyNote');
const progressFill = $('progressFill');
const progressText = $('progressText');
const gradeCounts = $('gradeCounts');
const roadmapIntro = $('roadmapIntro');
const roadmapList = $('roadmapList');

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n) => Number.isInteger(n)));
  } catch {
    return new Set();
  }
}

function saveProgress() {
  const sorted = [...earned].sort((a, b) => a - b);
  localStorage.setItem(STORE_KEY, JSON.stringify(sorted));
}

function seedDemoIfRequested() {
  if (!paramDemo) return;
  if (localStorage.getItem(STORE_KEY)) return;
  earned = new Set(DEMO_EARNED);
  saveProgress();
}

function isSpoilerHidden(t) {
  return spoilerToggle.checked && t.kind === 'story' && !earned.has(t.id);
}

function kindMatches(t) {
  if (kindFilter === 'all') return true;
  if (kindFilter === 'missable') return t.missable;
  if (kindFilter === 'online') return t.kind === 'online';
  return t.kind === kindFilter;
}

function visibleTrophies() {
  const q = searchInput.value.trim().toLowerCase();
  const grade = gradeFilter.value;
  return trophies.filter((t) => {
    if (!kindMatches(t)) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (hideEarned.checked && earned.has(t.id)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function gradeLabel(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

function renderProgress() {
  const total = trophies.length || 55;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  progressText.textContent = `${n} of ${total} earned — ${pct}% to the platinum`;
  progressFill.style.width = `${pct}%`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return `${got}/${all} ${gradeLabel(g)}`;
  });
  gradeCounts.textContent = counts.join(' · ');
}

function badge(text, cls) {
  const span = document.createElement('span');
  span.className = `badge ${cls}`;
  span.textContent = text;
  return span;
}

function renderList() {
  const visible = visibleTrophies();
  trophyList.innerHTML = '';
  for (const t of visible) {
    const hidden = isSpoilerHidden(t);
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
    li.id = `trophy-${t.id}`;

    const head = document.createElement('div');
    head.className = 'trophy-head';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    const displayName = hidden ? 'Hidden story trophy' : t.name;
    box.setAttribute('aria-label', `Mark ${displayName} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveProgress();
      renderProgress();
      renderList();
      renderRoadmap();
    });
    head.appendChild(box);

    const body = document.createElement('div');
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    name.textContent = displayName;
    body.appendChild(name);
    const desc = document.createElement('p');
    desc.className = 'trophy-desc' + (hidden ? ' spoiler-note' : '');
    desc.textContent = hidden
      ? 'Earn this trophy to reveal its name and guide.'
      : t.description;
    body.appendChild(desc);

    const badges = document.createElement('div');
    badges.className = 'badges';
    badges.appendChild(badge(gradeLabel(t.grade), `badge-grade-${t.grade}`));
    if (t.hidden) badges.appendChild(badge('Hidden', 'badge-hidden'));
    if (t.missable) badges.appendChild(badge('Missable', 'badge-missable'));
    if (t.kind !== t.grade) badges.appendChild(badge(t.kind, 'badge-kind'));
    if (t.count) badges.appendChild(badge(t.count, 'badge-count'));
    body.appendChild(badges);

    if (!hidden) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'guide-toggle';
      const guideBody = document.createElement('div');
      guideBody.className = 'guide-body';
      guideBody.hidden = t.id !== openId;
      toggle.textContent = guideBody.hidden ? 'Show guide ▼' : 'Hide guide ▲';
      toggle.setAttribute('aria-expanded', String(!guideBody.hidden));
      toggle.addEventListener('click', () => {
        guideBody.hidden = !guideBody.hidden;
        toggle.textContent = guideBody.hidden ? 'Show guide ▼' : 'Hide guide ▲';
        toggle.setAttribute('aria-expanded', String(!guideBody.hidden));
        if (!guideBody.hidden) openId = t.id;
      });
      const guideP = document.createElement('p');
      guideP.textContent = t.guide;
      guideBody.appendChild(guideP);
      const stepsH = document.createElement('h4');
      stepsH.textContent = 'How to do it';
      guideBody.appendChild(stepsH);
      const stepsOl = document.createElement('ol');
      for (const step of t.steps) {
        const s = document.createElement('li');
        s.textContent = step;
        stepsOl.appendChild(s);
      }
      guideBody.appendChild(stepsOl);
      const srcH = document.createElement('h4');
      srcH.textContent = 'Sources';
      guideBody.appendChild(srcH);
      const srcUl = document.createElement('ul');
      for (const src of t.sources) {
        const item = document.createElement('li');
        const a = document.createElement('a');
        a.href = src.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = src.name;
        item.appendChild(a);
        srcUl.appendChild(item);
      }
      guideBody.appendChild(srcUl);
      body.appendChild(toggle);
      body.appendChild(guideBody);
    }

    head.appendChild(body);
    li.appendChild(head);
    trophyList.appendChild(li);
  }
  resultCount.textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
  onlineNote.hidden = kindFilter !== 'online';
  emptyNote.hidden = visible.length !== 0;
}

function renderRoadmap() {
  if (!roadmap) return;
  roadmapIntro.textContent = roadmap.note;
  roadmapList.innerHTML = '';
  for (const stage of roadmap.stages) {
    const li = document.createElement('li');
    li.className = 'roadmap-stage';
    const title = document.createElement('h3');
    title.textContent = stage.title;
    li.appendChild(title);
    const hours = document.createElement('p');
    hours.className = 'stage-hours';
    hours.textContent = `About ${stage.hours} hours`;
    li.appendChild(hours);
    const text = document.createElement('p');
    text.className = 'stage-text';
    text.textContent = stage.text;
    li.appendChild(text);
    const chips = document.createElement('ul');
    chips.className = 'stage-chips';
    for (const id of stage.trophies) {
      const t = trophies.find((x) => x.id === id);
      if (!t) continue;
      const chip = document.createElement('li');
      const done = earned.has(id);
      chip.className = 'chip' + (done ? ' done' : '') + (t.missable && !done ? ' missable' : '');
      chip.textContent = done ? `✓ ${t.name}` : t.missable ? `${t.name} — missable` : t.name;
      chips.appendChild(chip);
    }
    li.appendChild(chips);
    roadmapList.appendChild(li);
  }
}

function showView(view) {
  const checklist = view === 'checklist';
  $('viewChecklist').hidden = !checklist;
  $('viewRoadmap').hidden = checklist;
  $('tabChecklist').classList.toggle('active', checklist);
  $('tabRoadmap').classList.toggle('active', !checklist);
}

function applyKindButtons() {
  document.querySelectorAll('.kind-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.kind === kindFilter);
  });
}

function wireControls() {
  document.querySelectorAll('.kind-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      kindFilter = btn.dataset.kind;
      applyKindButtons();
      renderList();
    });
  });
  searchInput.addEventListener('input', renderList);
  gradeFilter.addEventListener('change', renderList);
  spoilerToggle.addEventListener('change', renderList);
  hideEarned.addEventListener('change', renderList);
  $('tabChecklist').addEventListener('click', () => showView('checklist'));
  $('tabRoadmap').addEventListener('click', () => showView('roadmap'));

  $('exportBtn').addEventListener('click', () => {
    const data = {
      game: 'Grand Theft Auto VI',
      earned: [...earned].sort((a, b) => a - b),
      exported: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leonida-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  $('importInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('bad export');
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set(ids.filter((n) => Number.isInteger(n) && valid.has(n)));
      saveProgress();
      renderProgress();
      renderList();
      renderRoadmap();
    } catch {
      alert('That file is not a Leonida Trophy Guide progress export.');
    }
    event.target.value = '';
  });
}

seedDemoIfRequested();
earned = loadSaved();

if (paramSpoilers) spoilerToggle.checked = true;
if (paramQ) searchInput.value = paramQ;
if (paramKind) {
  const known = ['all', 'story', 'missable', 'collectibles', 'activities', 'online'];
  if (known.includes(paramKind)) kindFilter = paramKind;
}

const [trophyData, roadmapData] = await Promise.all([
  fetch('data/trophies.json').then((r) => r.json()),
  fetch('data/roadmap.json').then((r) => r.json()),
]);
trophies = trophyData.trophies;
roadmap = roadmapData;

wireControls();
applyKindButtons();
renderProgress();
renderList();
renderRoadmap();
showView(paramView === 'roadmap' ? 'roadmap' : 'checklist');

if (location.hash.startsWith('#trophy-')) {
  const el = document.querySelector(location.hash);
  if (el) el.scrollIntoView();
}
