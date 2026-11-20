const ITEMS = window.RECIPES.items;
const STORE_KEY = 'hideout-tracker-v1';
const $ = (s) => document.querySelector(s);

let state = load();
let tab = 'stash';
let plan = { target: 'white_heroin', qty: 1 };
let sel = 'low_base';
let qty = 1;

const TITLES = {
  stash: ['Stash', 'What you are carrying. Tap + and − to keep it in step with the game.'],
  recipes: ['Production', 'Pick an item, check what you hold, and start a timer.'],
  planner: ['Planner', 'Pick a target and see every step and material you still need.'],
  timers: ['Timers', 'Running jobs. Finished items are added to your stash automatically.']
};

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && s.stash) return s;
  } catch (e) { /* fall through to defaults */ }
  return { stash: { ...window.RECIPES.seedStash }, jobs: [] };
}
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

const have = (id) => state.stash[id] || 0;
const craftables = () => Object.entries(ITEMS).filter(([, v]) => v.type === 'craft');
const raws = () => Object.entries(ITEMS).filter(([, v]) => v.type === 'raw');
const canMake = (id, q) => Object.entries(ITEMS[id].inputs).every(([inId, per]) => have(inId) >= per * q);
const icon = (id, cls = '') => `<img class="ico ${cls}" src="icons/${id}.png" alt="" draggable="false">`;
const mono = (name) => name.split(/[\s-]+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

function fmt(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
}
function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

// ---------- Stash ----------
function stashView() {
  const row = ([id, it]) => {
    const n = have(id);
    return `<div class="row ${n === 0 ? 'low' : ''}">
      <span class="rico">${icon(id)}</span>
      <span class="name">${it.name}</span>
      <button class="step" data-adj="${id}" data-d="-1" aria-label="Remove one ${it.name}">−</button>
      <span class="count">${n}</span>
      <button class="step" data-adj="${id}" data-d="1" aria-label="Add one ${it.name}">+</button>
    </div>`;
  };
  return `<div class="label">Raw materials</div><div class="panel">${raws().map(row).join('')}</div>
          <div class="label">Made in the lab</div><div class="panel">${craftables().map(row).join('')}</div>`;
}

// ---------- Production ----------
function recipesView() {
  const list = craftables().map(([id, it]) => `
    <button class="item ${id === sel ? 'sel' : ''}" data-sel="${id}">
      <span class="thumb"><span class="mono">${mono(it.name)}</span>${icon(id)}</span>
      <span class="item-text">
        <span class="item-name">${it.name}</span>
        <span class="item-time">Production time:<b>${fmt(it.time)}</b></span>
      </span>
      ${canMake(id, 1) ? '<span class="dot" title="You can make this now"></span>' : ''}
    </button>`).join('');

  const it = ITEMS[sel];
  const can = canMake(sel, qty);
  const running = state.jobs.find((j) => j.item === sel);
  const tiles = Object.entries(it.inputs).map(([inId, per]) => {
    const need = per * qty;
    const ok = have(inId) >= need;
    return `<div class="tile ${ok ? '' : 'short'}">
      ${icon(inId, 'tile-ico')}
      <div class="t-name">${ITEMS[inId].name}</div>
      <div class="t-count">${have(inId)}<small> / ${need}</small></div>
    </div>`;
  }).join('');

  return `<div class="split">
    <div class="list">${list}</div>
    <div class="detail">
      <div class="d-title">${it.name}</div>
      <div class="d-sub">Laboratory</div>
      <div class="label d-desc">Required resources</div>
      ${running
      ? `<div class="muted">Production is running. Stopping it returns the resources to your stash.</div>`
      : `<div class="tiles">${tiles}</div>`}
      <div class="d-spacer"></div>
      <div class="d-foot">
        ${running
      ? `${running.qty || 1} × running <b data-timer="${running.id}">${fmtClock((running.start + running.dur - Date.now()) / 1000)}</b>`
      : `<span class="amt">Amount
              <button class="step" data-q="-1" aria-label="Decrease amount">−</button>
              <span class="qty">${qty}</span>
              <button class="step" data-q="1" aria-label="Increase amount">+</button>
            </span>
            Production time: <b>${fmt(it.time * qty)}</b>`}
      </div>
      ${running
      ? `<button class="start stop" data-cancel="${running.id}">Stop production</button>`
      : `<button class="start" data-start="${sel}" ${can ? '' : 'disabled'}>Start production</button>`}
    </div>
  </div>`;
}

// ---------- Planner ----------
function expand(targetId, n0) {
  const pool = { ...state.stash };
  const crafts = {};
  const rawShort = {};
  (function go(id, n) {
    const it = ITEMS[id];
    const take = Math.min(pool[id] || 0, n);
    pool[id] = (pool[id] || 0) - take;
    const rest = n - take;
    if (rest <= 0) return;
    if (it.type === 'raw') { rawShort[id] = (rawShort[id] || 0) + rest; return; }
    crafts[id] = (crafts[id] || 0) + rest;
    for (const [inId, per] of Object.entries(it.inputs)) go(inId, per * rest);
  })(targetId, n0);
  return { crafts, rawShort };
}

function plannerView() {
  const opts = craftables().map(([id, it]) =>
    `<option value="${id}" ${id === plan.target ? 'selected' : ''}>${it.name}</option>`).join('');
  const { crafts, rawShort } = expand(plan.target, plan.qty);
  const craftList = Object.entries(crafts);
  const totalTime = craftList.reduce((t, [id, n]) => t + ITEMS[id].time * n, 0);

  const craftHtml = craftList.length
    ? `<ol class="steps">${craftList.map(([id, n]) => `<li>${n} × ${ITEMS[id].name} <span class="muted">(${fmt(ITEMS[id].time * n)})</span></li>`).join('')}</ol>
       <div class="pad muted">Total if run back to back: ${fmt(totalTime)}</div>`
    : `<div class="pad muted">Nothing to craft. You already hold this.</div>`;

  const shortEntries = Object.entries(rawShort);
  const shortHtml = shortEntries.length
    ? shortEntries.map(([id, n]) => `<div class="row"><span class="name">${ITEMS[id].name}</span><span class="short-n">${n} short</span></div>`).join('')
    : `<div class="pad ok-note">You have everything needed.</div>`;

  return `<div class="controls">
      <select id="planTarget" aria-label="Target item">${opts}</select>
      <input type="number" id="planQty" min="1" value="${plan.qty}" aria-label="Quantity">
    </div>
    <div class="label">Craft in this order</div><div class="panel">${craftHtml}</div>
    <div class="label">Still to collect</div><div class="panel">${shortHtml}</div>`;
}

// ---------- Timers ----------
function timersView() {
  if (!state.jobs.length) {
    return `<div class="empty">No timers running. Start production from the Production tab.</div>`;
  }
  return state.jobs.map((j) => {
    const q = j.qty || 1;
    return `<div class="card">
      <div class="card-head"><strong>${q} × ${ITEMS[j.item].name}</strong><span class="muted">In progress</span></div>
      <div class="timer" data-timer="${j.id}">${fmtClock((j.start + j.dur - Date.now()) / 1000)}</div>
      <button class="act ghost" data-cancel="${j.id}">Stop production</button>
    </div>`;
  }).join('');
}

// ---------- Rendering ----------
function render() {
  const view = $('#view');
  const keep = view.scrollTop;
  view.innerHTML = { stash: stashView, recipes: recipesView, planner: plannerView, timers: timersView }[tab]();
  view.scrollTop = keep;
  $('#title').textContent = TITLES[tab][0];
  $('#subtitle').textContent = TITLES[tab][1];
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  const running = state.jobs.length;
  $('#timerBadge').hidden = !running;
  $('#timerBadge').textContent = running;
}

// ---------- Events ----------
$('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-tab]');
  if (b) { tab = b.dataset.tab; render(); }
});

$('#view').addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.adj) {
    const id = t.dataset.adj;
    state.stash[id] = Math.max(0, have(id) + Number(t.dataset.d));
  } else if (t.dataset.sel) {
    sel = t.dataset.sel; qty = 1;
  } else if (t.dataset.q) {
    qty = Math.max(1, qty + Number(t.dataset.q));
  } else if (t.dataset.start) {
    const id = t.dataset.start;
    if (!canMake(id, qty)) return;
    const it = ITEMS[id];
    for (const [inId, per] of Object.entries(it.inputs)) state.stash[inId] = have(inId) - per * qty;
    state.jobs.push({
      id: Date.now() + Math.random().toString(16).slice(2),
      item: id, qty, start: Date.now(), dur: it.time * qty * 1000, notified: false
    });
    qty = 1; tab = 'timers';
  } else if (t.dataset.collect) {
    const j = state.jobs.find((x) => x.id === t.dataset.collect);
    if (j) { state.stash[j.item] = have(j.item) + (j.qty || 1); state.jobs = state.jobs.filter((x) => x !== j); }
  } else if (t.dataset.cancel) {
    const j = state.jobs.find((x) => x.id === t.dataset.cancel);
    if (j) {
      const q = j.qty || 1;
      for (const [inId, per] of Object.entries(ITEMS[j.item].inputs)) state.stash[inId] = have(inId) + per * q;
      state.jobs = state.jobs.filter((x) => x !== j);
    }
  } else return;
  save(); render();
});

$('#view').addEventListener('change', (e) => {
  if (e.target.id === 'planTarget') plan.target = e.target.value;
  if (e.target.id === 'planQty') plan.qty = Math.max(1, parseInt(e.target.value, 10) || 1);
  render();
});

document.addEventListener('load', (e) => {
  if (e.target.classList && e.target.classList.contains('ico')) e.target.parentElement.classList.add('has-img');
}, true);
document.addEventListener('error', (e) => {
  if (e.target.classList && e.target.classList.contains('ico')) e.target.remove();
}, true);

if (window.Notification && Notification.permission === 'default') Notification.requestPermission();

function finishJobs() {
  const now = Date.now();
  const done = state.jobs.filter((j) => now >= j.start + j.dur);
  if (!done.length) return false;
  for (const j of done) {
    const q = j.qty || 1;
    state.stash[j.item] = have(j.item) + q;
    if (window.Notification && Notification.permission === 'granted') {
      new Notification('Production finished', { body: `${q} × ${ITEMS[j.item].name} added to your stash` });
    }
  }
  state.jobs = state.jobs.filter((j) => !done.includes(j));
  save();
  return true;
}

setInterval(() => {
  if (finishJobs()) { render(); return; }
  document.querySelectorAll('[data-timer]').forEach((el) => {
    const j = state.jobs.find((x) => x.id === el.dataset.timer);
    if (j) el.textContent = fmtClock((j.start + j.dur - Date.now()) / 1000);
  });
}, 1000);

window.hideout.getVersion().then((v) => { $('#ver').textContent = 'v' + v; });
window.hideout.onUpdate((p) => {
  const bar = $('#updateBar');
  bar.hidden = false;
  if (p.state === 'ready') {
    bar.innerHTML = `Version ${p.version} is ready. <button id="restartBtn">Restart to update</button>`;
  } else {
    bar.textContent = `Downloading version ${p.version}...`;
  }
});
document.addEventListener('click', (e) => {
  if (e.target.id === 'restartBtn') window.hideout.installUpdate();
});

finishJobs();
render();
