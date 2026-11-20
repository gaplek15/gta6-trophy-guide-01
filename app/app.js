const STORE_KEY = 'leonida-trophy-guide-v1';
const DEMO_EARNED = [2, 3, 4, 8, 15, 16, 28, 35, 42, 52, 53, 55];

const params = new URLSearchParams(location.search);
const demoRequested = params.get('demo') === '1';
const viewParam = params.get('view');
const kindParam = params.get('kind');
const queryParam = params.get('q') ?? '';
const spoilersParam = params.get('spoilers') === 'on';
const openParam = params.get('open');

let trophies = [];
let roadmap = null;
let earned = new Set();
let kindFilter = kindParam || 'all';
let openId = openParam ? Number(openParam) : null;

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const roadmapListEl = $('roadmapList');
const progressFill = $('progressFill');
const progressText = $('progressText');
const gradeCountsEl = $('gradeCounts');
const resultCountEl = $('resultCount');
const onlineNoteEl = $('onlineNote');
const emptyNoteEl = $('emptyNote');
const searchEl = $('search');
const gradeFilterEl = $('gradeFilter');
const spoilerToggleEl = $('spoilerToggle');
const hideEarnedEl = $('hideEarned');

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
  if (!demoRequested) return;
  if (localStorage.getItem(STORE_KEY) !== null) return;
  earned = new Set(DEMO_EARNED);
  saveProgress();
}

function isSpoilerHidden(t) {
  return spoilerToggleEl.checked && t.kind === 'story' && !earned.has(t.id);
}

function kindMatches(t) {
  if (kindFilter === 'all') return true;
  if (kindFilter === 'missable') return t.missable === true;
  if (kindFilter === 'online') return t.kind === 'online';
  return t.kind === kindFilter;
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  const grade = gradeFilterEl.value;
  return trophies.filter((t) => {
    if (!kindMatches(t)) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (hideEarnedEl.checked && earned.has(t.id)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${t.steps.join(' ')} ${t.count ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function badge(text, cls) {
  const b = document.createElement('span');
  b.className = `badge ${cls}`;
  b.textContent = text;
  return b;
}

function closeOpenGuide() {
  const openBody = listEl.querySelector('.guide-body:not([hidden])');
  if (!openBody) return false;
  const toggle = openBody.parentElement.querySelector('.guide-toggle');
  openBody.hidden = true;
  if (toggle) {
    toggle.textContent = 'Show guide ▼';
    toggle.setAttribute('aria-expanded', 'false');
  }
  openId = null;
  return true;
}

function renderProgress() {
  const total = trophies.length || 55;
  const n = earned.size;
  const pct = total ? Math.round((n / total) * 100) : 0;
  progressText.textContent = `${n} of ${total} earned — ${pct}% to the platinum`;
  progressFill.style.width = `${pct}%`;
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  gradeCountsEl.textContent = grades
    .map((g) => {
      const tot = trophies.filter((t) => t.grade === g).length;
      const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
      return `${got}/${tot} ${gradeLabel(g)}`;
    })
    .join(' · ');
}

function renderList() {
  const visible = visibleTrophies();
  resultCountEl.textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
  onlineNoteEl.hidden = kindFilter !== 'online';
  emptyNoteEl.hidden = visible.length !== 0;
  listEl.innerHTML = '';
  for (const t of visible) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
    li.id = `trophy-${t.id}`;

    const head = document.createElement('div');
    head.className = 'trophy-head';

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveProgress();
      renderProgress();
      renderList();
      renderRoadmap();
    });
    head.appendChild(box);

    const titleWrap = document.createElement('div');
    titleWrap.className = 'trophy-title';
    const hidden = isSpoilerHidden(t);
    const nameEl = document.createElement('h2');
    nameEl.textContent = hidden ? 'Hidden story trophy' : t.name;
    titleWrap.appendChild(nameEl);
    const descEl = document.createElement('p');
    descEl.className = 'trophy-desc';
    if (hidden) {
      descEl.textContent = 'Earn this trophy to reveal its name and guide.';
      descEl.classList.add('spoiler-note');
    } else {
      descEl.textContent = t.description;
    }
    titleWrap.appendChild(descEl);
    head.appendChild(titleWrap);
    li.appendChild(head);

    const badges = document.createElement('div');
    badges.className = 'badges';
    badges.appendChild(badge(t.grade, `grade-${t.grade}`));
    if (t.hidden) badges.appendChild(badge('Hidden', 'hidden-badge'));
    if (t.missable) badges.appendChild(badge('Missable', 'missable-badge'));
    if (t.kind !== t.grade) badges.appendChild(badge(t.kind, 'kind-badge'));
    if (t.count) badges.appendChild(badge(t.count, 'count-badge'));
    li.appendChild(badges);

    if (!hidden) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'guide-toggle';
      const isOpen = openId === t.id;
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.textContent = isOpen ? 'Hide guide ▲' : 'Show guide ▼';
      li.appendChild(toggle);

      const body = document.createElement('div');
      body.className = 'guide-body';
      body.hidden = !isOpen;
      const guideP = document.createElement('p');
      guideP.textContent = t.guide;
      body.appendChild(guideP);
      const stepsTitle = document.createElement('h3');
      stepsTitle.textContent = 'How to do it';
      body.appendChild(stepsTitle);
      const ol = document.createElement('ol');
      for (const step of t.steps) {
        const s = document.createElement('li');
        s.textContent = step;
        ol.appendChild(s);
      }
      body.appendChild(ol);
      const srcTitle = document.createElement('h3');
      srcTitle.textContent = 'Sources';
      body.appendChild(srcTitle);
      const ul = document.createElement('ul');
      ul.className = 'sources';
      for (const src of t.sources) {
        const item = document.createElement('li');
        const a = document.createElement('a');
        a.href = src.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = src.name;
        item.appendChild(a);
        ul.appendChild(item);
      }
      body.appendChild(ul);
      li.appendChild(body);

      toggle.addEventListener('click', () => {
        const nowOpen = body.hidden;
        body.hidden = !nowOpen;
        toggle.textContent = nowOpen ? 'Hide guide ▲' : 'Show guide ▼';
        toggle.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
        if (nowOpen) openId = t.id;
        else if (openId === t.id) openId = null;
      });
    }

    listEl.appendChild(li);
  }
  if (location.hash.startsWith('#trophy-')) {
    const target = document.querySelector(location.hash);
    if (target) target.scrollIntoView();
  }
}

function renderRoadmap() {
  if (!roadmap) return;
  $('roadmapIntro').textContent = roadmap.note;
  roadmapListEl.innerHTML = '';
  for (const stage of roadmap.stages) {
    const li = document.createElement('li');
    li.className = 'roadmap-stage';
    const title = document.createElement('h2');
    title.textContent = stage.title;
    li.appendChild(title);
    const hours = document.createElement('p');
    hours.className = 'stage-hours';
    hours.textContent = `About ${stage.hours} hours`;
    li.appendChild(hours);
    const text = document.createElement('p');
    text.textContent = stage.text;
    li.appendChild(text);
    const chips = document.createElement('div');
    chips.className = 'chips';
    for (const id of stage.trophies) {
      const t = trophies.find((x) => x.id === id);
      if (!t) continue;
      const chip = document.createElement('span');
      chip.className = 'chip' + (earned.has(id) ? ' done' : '') + (t.missable ? ' missable-chip' : '');
      chip.textContent = earned.has(id) ? `✓ ${t.name}` : t.missable ? `${t.name} — missable` : t.name;
      chips.appendChild(chip);
    }
    li.appendChild(chips);
    roadmapListEl.appendChild(li);
  }
}

function applyKindButtons() {
  document.querySelectorAll('#kindFilters button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.kind === kindFilter);
    btn.setAttribute('aria-pressed', btn.dataset.kind === kindFilter ? 'true' : 'false');
  });
}

function showView(view) {
  const checklist = view !== 'roadmap';
  $('viewChecklist').hidden = !checklist;
  $('viewRoadmap').hidden = checklist;
  $('tabChecklist').classList.toggle('active', checklist);
  $('tabRoadmap').classList.toggle('active', !checklist);
}

function wireControls() {
  $('tabChecklist').addEventListener('click', () => showView('checklist'));
  $('tabRoadmap').addEventListener('click', () => showView('roadmap'));
  document.querySelectorAll('#kindFilters button').forEach((btn) => {
    btn.addEventListener('click', () => {
      kindFilter = btn.dataset.kind;
      applyKindButtons();
      renderList();
    });
  });
  searchEl.addEventListener('input', renderList);
  gradeFilterEl.addEventListener('change', renderList);
  spoilerToggleEl.addEventListener('change', renderList);
  hideEarnedEl.addEventListener('change', renderList);
  document.addEventListener('keydown', (event) => {
    if (event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA')) return;
    if (event.key === 'Escape') closeOpenGuide();
    if (event.key === 'g' || event.key === 'G') {
      const first = visibleTrophies()[0];
      if (first && openId !== first.id) {
        openId = first.id;
        renderList();
        const card = document.getElementById(`trophy-${first.id}`);
        if (card) card.scrollIntoView({ block: 'nearest' });
      }
    }
  });
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
      const parsed = JSON.parse(await file.text());
      const arr = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(arr)) throw new Error('bad export');
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set(arr.filter((n) => Number.isInteger(n) && valid.has(n)));
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

earned = loadSaved();
seedDemoIfRequested();
if (spoilersParam) spoilerToggleEl.checked = true;
if (queryParam) searchEl.value = queryParam;

trophies = await (await fetch('data/trophies.json')).json().then((d) => d.trophies);
roadmap = await (await fetch('data/roadmap.json')).json();

wireControls();
applyKindButtons();
renderProgress();
renderList();
renderRoadmap();
showView(viewParam === 'roadmap' ? 'roadmap' : 'checklist');
