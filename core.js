/* ---------- Core ---------- */
const MODE = window.VB_MODE === 'app' ? 'app' : 'preview';
const APP = MODE === 'app';
const LIB = {
  qr: 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
  pdf: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  pdfw: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  xlsx: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
};
const KEY = 'vocaboard:v1', OLD_KEY = 'chalkbox:v1';
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const now = () => Date.now();
const pad = n => String(n).padStart(2, '0');
const $ = (s, r = document) => r.querySelector(s);

function h(tag, p, ...kids) {
  const n = document.createElement(tag);
  if (p) for (const k in p) {
    const v = p[k];
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) n.style.setProperty(sk, v[sk]); else n.style[sk] = v[sk]; } }
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else if (k === 'value' || k === 'checked' || k === 'selected') n[k] = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(c));
  return n;
}
function ib(icon, label, onclick, cls = 'ib') {
  return h('button', { class: cls, type: 'button', title: label, 'aria-label': label, onclick }, svg(icon));
}
function btn(label, onclick, cls = 'btn', icon) {
  return h('button', { class: cls, type: 'button', onclick }, icon ? svg(icon) : null, label);
}
function field(label, ctrl) {
  return h('div', { class: 'field' }, ctrl && ctrl.id ? h('label', { for: ctrl.id }, label) : h('span', { class: 'lbl' }, label), ctrl);
}
function seg(options, cur, onpick, label) {
  return h('div', { class: 'seg', role: 'group', 'aria-label': label || '' },
    options.map(([v, t]) => h('button', { type: 'button', 'aria-pressed': String(v === cur), onclick: () => onpick(v) }, t)));
}
function toggle(id, label, checked, onchange) {
  return h('label', { class: 'switch', for: id }, h('span', {}, label), h('input', { type: 'checkbox', id, checked, onchange: e => onchange(e.target.checked) }));
}
function confirmBtn(label, armedLabel, fn, cls = 'btn sm danger') {
  const b = h('button', { class: cls, type: 'button' }, label); let armed = false, t;
  b.onclick = () => {
    if (!armed) { armed = true; b.textContent = armedLabel; b.classList.add('armed'); t = setTimeout(() => { armed = false; b.textContent = label; b.classList.remove('armed'); }, 3500); }
    else { clearTimeout(t); fn(); }
  };
  return b;
}
function fmtHMS(sec, tenths) {
  sec = Math.max(0, sec);
  const t = Math.floor(sec), hh = Math.floor(t / 3600), mm = Math.floor(t % 3600 / 60), ss = t % 60;
  let s = (hh ? hh + ':' + pad(mm) : pad(mm)) + ':' + pad(ss);
  if (tenths) s += '.' + Math.floor((sec - t) * 10);
  return s;
}
function setDigits(el, str) {
  if (el._s === str) return; el._s = str;
  el.innerHTML = str.split('').map(ch => ch === ':' || ch === '.' ? `<i>${ch}</i>` : `<b>${ch}</b>`).join('');
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }
function normUrl(u) { u = (u || '').trim(); if (!u) return ''; if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) u = 'https://' + u; return u; }
function isUrl(t) { return /^(https?:\/\/|www\.)\S+$/i.test((t || '').trim()); }
const _scripts = {};
function loadScript(src) {
  return _scripts[src] || (_scripts[src] = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.async = true;
    s.onload = res; s.onerror = () => { delete _scripts[src]; rej(new Error('Could not load ' + src)); };
    document.head.append(s);
  }));
}

/* safe local storage */
const ls = {
  get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
};

/* files (images, PDFs, videos) live in IndexedDB on this device */
const Blobs = (() => {
  const mem = new Map(), urls = new Map(); let dbp;
  const db = () => dbp || (dbp = new Promise(res => {
    try { const r = indexedDB.open('chalkbox', 1); r.onupgradeneeded = () => r.result.createObjectStore('blobs'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); }
    catch (e) { res(null); }
  }));
  async function put(blob) {
    const id = 'b' + uid(); mem.set(id, blob);
    const d = await db();
    if (d) try { await new Promise((res, rej) => { const tx = d.transaction('blobs', 'readwrite'); tx.objectStore('blobs').put(blob, id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); }); }
    catch (e) { toast('This file is too large to keep after the app closes. It works until then.'); }
    return id;
  }
  async function get(id) {
    if (!id) return null; if (mem.has(id)) return mem.get(id);
    const d = await db(); if (!d) return null;
    return new Promise(res => { try { const r = d.transaction('blobs').objectStore('blobs').get(id); r.onsuccess = () => { if (r.result) mem.set(id, r.result); res(r.result || null); }; r.onerror = () => res(null); } catch (e) { res(null); } });
  }
  async function url(id) { if (urls.has(id)) return urls.get(id); const b = await get(id); if (!b) return null; const u = URL.createObjectURL(b); urls.set(id, u); return u; }
  async function del(id) { mem.delete(id); if (urls.has(id)) { URL.revokeObjectURL(urls.get(id)); urls.delete(id); } const d = await db(); if (d) try { d.transaction('blobs', 'readwrite').objectStore('blobs').delete(id); } catch (e) {} }
  return { put, get, url, del };
})();

/* sounds, made with Web Audio so they work offline */
const Snd = {
  c: null,
  ctx() {
    if (!this.c) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; try { this.c = new AC(); } catch (e) { return null; } }
    if (this.c.state === 'suspended') this.c.resume().catch(() => {});
    return this.c;
  },
  tone(f, d, { type = 'sine', v = .25, t = 0, a = .006 } = {}) {
    const c = this.ctx(); if (!c) return; const t0 = c.currentTime + t;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(v, t0 + a); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + d + .05);
  },
  play(name) {
    if (S && S.mute) return;
    switch (name) {
      case 'bell': [0, 1.3, 2.6].forEach(t => { this.tone(880, 1.5, { t, v: .22 }); this.tone(1318, 1.1, { t, v: .1 }); this.tone(2217, .5, { t, v: .05 }); }); break;
      case 'chime': [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 1, { t: i * .17, v: .18, type: 'triangle' })); break;
      case 'beep': [0, .28, .56, 1.2, 1.48, 1.76].forEach(t => this.tone(1000, .17, { t, v: .14, type: 'square' })); break;
      case 'alarm': [0, .2, .4, .6].forEach((t, i) => this.tone(i % 2 ? 680 : 960, .17, { t, v: .16, type: 'sawtooth' })); break;
      case 'tick': this.tone(1700, .035, { v: .05, type: 'square' }); break;
      case 'cute': { const c = this.ctx(); if (!c) return; const n = c.currentTime;
        const o1 = c.createOscillator(), g1 = c.createGain(); o1.type = 'sine'; o1.frequency.setValueAtTime(920, n); o1.frequency.exponentialRampToValueAtTime(620, n + .08); g1.gain.setValueAtTime(.001, n); g1.gain.linearRampToValueAtTime(.14, n + .012); g1.gain.exponentialRampToValueAtTime(.001, n + .12); o1.connect(g1); g1.connect(c.destination); o1.start(n); o1.stop(n + .12);
        const o2 = c.createOscillator(), g2 = c.createGain(); o2.type = 'triangle'; o2.frequency.setValueAtTime(540, n + .015); o2.frequency.exponentialRampToValueAtTime(760, n + .09); g2.gain.setValueAtTime(.001, n + .01); g2.gain.linearRampToValueAtTime(.06, n + .03); g2.gain.exponentialRampToValueAtTime(.001, n + .16); o2.connect(g2); g2.connect(c.destination); o2.start(n + .015); o2.stop(n + .16); break; }
      case 'pop': this.tone(620, .09, { v: .12, type: 'triangle' }); this.tone(930, .08, { t: .03, v: .08, type: 'triangle' }); break;
      case 'win': [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, .45, { t: i * .08, v: .15, type: 'triangle' })); break;
      case 'rattle': for (let i = 0; i < 6; i++) this.tone(260 + Math.random() * 520, .05, { t: i * .07, v: .07, type: 'square' }); break;
    }
  },
};
const SOUNDS = [['bell', 'Bell'], ['chime', 'Chime'], ['beep', 'Beeps'], ['none', 'No sound']];
function soundPick(s, key = 'snd') {
  return h('div', { class: 'chips' }, SOUNDS.map(([v, t]) => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(s[key] === v), onclick: e => { s[key] = v; save(); e.target.parentNode.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === e.target))); if (v !== 'none') Snd.play(v); } }, t)));
}

/* ---------- State ---------- */
let S = null;
const T = {};                // tool definitions
const live = new Map();      // widget id -> runtime record
const RT = new Map();        // non-saved runtime objects (streams etc.)
const tickers = new Set();
let zTop = 10;
let app, bgEl, boardEl, stkEl, dockEl, toastEl, bnameEl;

function exampleClass() {
  return { id: uid(), name: 'Example class', names: ['Aisha', 'Omar', 'Maryam', 'Yousef', 'Layla', 'Hamed', 'Noor', 'Salim', 'Fatma', 'Khalid', 'Huda', 'Saif', 'Reem', 'Ali', 'Zainab', 'Majid', 'Sara', 'Ahmed'], absent: [] };
}
function defaults() {
  const b = { id: uid(), name: 'Lesson board', bg: { k: 'scene', v: 'brhills' }, widgets: [] };
  return { v: 1, cur: b.id, boards: [b], classes: [exampleClass()], theme: 'auto', ui: 'auto', wake: true, mute: false, dock: true, first: true };
}
function load() {
  const d = ls.get(KEY) || ls.get(OLD_KEY);
  if (d && d.v === 1 && Array.isArray(d.boards) && d.boards.length) {
    d.classes = Array.isArray(d.classes) && d.classes.length ? d.classes : [exampleClass()];
    d.boards.forEach(b => { b.widgets = (b.widgets || []).filter(w => w && (T[w.type] || isItem(w))); b.bg = b.bg || { k: 'grid' }; });
    return d;
  }
  return defaults();
}
let saveT, saveWarned = false;
function save() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    if (!ls.set(KEY, S) && !saveWarned) { saveWarned = true; toast("This browser isn't keeping changes. They last until you close the page."); }
  }, 350);
}
function flushSave() { clearTimeout(saveT); if (S) ls.set(KEY, S); }
addEventListener('pagehide', flushSave);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushSave(); });
const board = () => S.boards.find(b => b.id === S.cur) || S.boards[0];
const isStack = () => app.clientWidth < 700;
function boardSize() { return { W: app.clientWidth || innerWidth, H: app.clientHeight || innerHeight }; }
function scaleK() { const { W, H } = boardSize(); return clamp(Math.min(W / 1366, H / 768), .8, 1.7); }

/* ---------- Widgets ---------- */
function addWidget(type, init = {}, at) {
  const def = T[type]; if (!def) return;
  const b = board(), { W, H } = boardSize(), k = scaleK();
  const w = Math.min(Math.round(def.w * k), W - 24), hgt = Math.min(Math.round(def.h * k), H - 140);
  const n = b.widgets.filter(x => !isItem(x)).length % 7;
  let x = at ? at.x - w / 2 : (W - w) / 2 + (n - 3) * 30;
  let y = at ? at.y - 20 : (H - hgt) / 2 - 30 + (n - 3) * 26;
  ({ x, y } = clampPos(x, y, w, hgt));
  const wd = { id: uid(), type, x: x / W, y: y / H, w, h: hgt, z: ++zTop, s: Object.assign(def.init ? def.init() : {}, init) };
  b.widgets.push(wd); mountWidget(wd); updateEmpty(); save();
  const rec = live.get(wd.id);
  if (rec && isStack()) rec.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return wd;
}
function clampPos(x, y, w, h) {
  const { W, H } = boardSize();
  return { x: clamp(x, 0, Math.max(0, W - w)), y: clamp(y, 0, Math.max(0, H - h)) };
}
function place(rec) {
  const { el, wd } = rec, { W, H } = boardSize();
  const w = Math.min(wd.w, W - 8), hh = Math.min(wd.h, H - 8);
  const p = clampPos(wd.x * W, wd.y * H, w, hh);
  Object.assign(el.style, { left: p.x + 'px', top: p.y + 'px', width: w + 'px', height: hh + 'px', zIndex: wd.z });
  el.style.setProperty('--sh', (T[wd.type].sh || 320) + 'px');
}
function mountWidget(wd) {
  if (isItem(wd)) return mountItem(wd);
  const def = T[wd.type];
  // fill in any settings missing from older or imported boards
  const d0 = def.init ? def.init() : {};
  if (!wd.s || !Object.keys(wd.s).length) wd.s = d0;
  else for (const k in d0) if (k !== '_title' && !(k in wd.s)) wd.s[k] = d0[k];
  const el = h('section', { class: 'wg wg-' + wd.type, 'data-id': wd.id, 'aria-label': def.title });
  const title = h('span', { class: 'wg-t', title: 'Double-tap to rename' }, wd.s._title || def.title);
  tvTitle(title);
  const rec = { wd, el, title, editing: false, ticks: [], cleanups: [], inst: null };
  rec.editBtn = def.edit ? ib('edit', 'Edit', () => { rec.editing = !rec.editing; render(rec); }) : null;
  rec.maxBtn = ib('max', 'Enlarge', () => toggleMax(rec));
  rec.colBtn = ib('palette', 'Colour', () => openPal(rec), 'ib pal-btn');
  if (wd.s.note) el.dataset.note = wd.s.note;
  const head = h('header', { class: 'wg-h' }, svg(def.icon || wd.type), title, rec.editBtn, rec.colBtn, rec.maxBtn, ib('x', 'Close', () => removeWidget(wd.id)));
  const body = h('div', { class: 'wg-b' });
  const rz = h('div', { class: 'wg-r', 'aria-hidden': 'true' });
  el.append(head, body, rz);
  Object.assign(rec, { head, body, rz });
  live.set(wd.id, rec);
  place(rec);
  boardEl.append(el);
  dragify(rec); resizify(rec); renamable(rec);
  render(rec);
  ro && ro.observe(body);
}
/* colour palette for every tool (uses the same data-note colours as the text tool) */
const WCOL = [['', 'Default', 'var(--card)'], ['white', 'White', '#ffffff'], ['butter', 'Yellow', 'var(--butter)'], ['peach', 'Orange', 'var(--peach)'], ['pink', 'Pink', 'var(--pink)'],
  ['lav', 'Purple', 'var(--lav)'], ['sky', 'Light blue', '#cfe6ff'], ['aqua', 'Turquoise', 'var(--aqua)'], ['mint', 'Green', 'var(--mint)'], ['sand', 'Sand', '#f3e2c0'],
  ['grey', 'Grey', '#e4e7ec'], ['navy', 'Navy', '#26335f'], ['chalk', 'Chalkboard green', '#2e4a3f'], ['plum', 'Plum', '#5a2f5e'], ['night', 'Black', '#202227']];
let palEl = null;
function closePal() { if (!palEl) return; const had = palEl.contains(document.activeElement), r = palEl._rec; palEl.remove(); palEl = null; document.removeEventListener('pointerdown', palOut, true); if (had && tvOn() && r && r.colBtn.isConnected) tvFocus(r.colBtn); }
function palOut(e) { if (palEl && !palEl.contains(e.target) && !(e.target.closest && e.target.closest('.pal-btn'))) closePal(); }
function setCol(wd, k) { if (k) wd.s.note = k; else delete wd.s.note; const r = live.get(wd.id); if (r) { if (k) r.el.dataset.note = k; else delete r.el.dataset.note; } }
function openPal(rec) {
  if (palEl) { const same = palEl._rec === rec; closePal(); if (same) return; }
  const cur = rec.wd.s.note || '';
  palEl = h('div', { class: 'palpop', role: 'dialog', 'aria-label': 'Colour of this tool' },
    h('b', {}, 'Colour'),
    h('div', { class: 'pal-grid' }, WCOL.map(([k, n, c]) => h('button', { type: 'button', class: 'pal-sw' + (k ? '' : ' def'), title: n, 'aria-label': n, 'aria-pressed': String(k === cur), style: { background: c }, onclick: () => { setCol(rec.wd, k); save(); closePal(); } }))),
    h('button', { type: 'button', class: 'pal-all', onclick: () => { const k = rec.wd.s.note || ''; board().widgets.filter(w => !isItem(w)).forEach(w => setCol(w, k)); save(); closePal(); toast(k ? 'All the tools on this board now have this colour' : 'All the tools are back to the default colour'); } }, 'Use this colour for every tool on this board'));
  palEl._rec = rec; app.append(palEl);
  const r = rec.colBtn.getBoundingClientRect(), pw = palEl.offsetWidth, ph = palEl.offsetHeight;
  palEl.style.left = clamp(r.right - pw, 8, innerWidth - pw - 8) + 'px';
  palEl.style.top = (r.bottom + ph + 8 > innerHeight ? Math.max(8, r.top - ph - 6) : r.bottom + 6) + 'px';
  setTimeout(() => document.addEventListener('pointerdown', palOut, true));
  if (tvOn()) tvFocus(palEl.querySelector('[aria-pressed="true"]') || palEl.querySelector('button'));
}
function render(rec) {
  for (const f of rec.ticks) tickers.delete(f); rec.ticks = [];
  for (const f of rec.cleanups) try { f(); } catch (e) {} rec.cleanups = [];
  try { rec.inst && rec.inst.destroy && rec.inst.destroy(); } catch (e) {}
  rec.body.replaceChildren();
  rec.el.classList.toggle('editing', !!rec.editing);
  if (rec.editBtn) { rec.editBtn.replaceChildren(svg(rec.editing ? 'check' : 'edit')); rec.editBtn.title = rec.editing ? 'Done' : 'Edit'; rec.editBtn.setAttribute('aria-label', rec.editBtn.title); }
  const def = T[rec.wd.type];
  const c = {
    s: rec.wd.s, wd: rec.wd, body: rec.body, el: rec.el, editing: rec.editing, save,
    rerender: () => render(rec),
    edit: (v = true) => { rec.editing = v; render(rec); },
    tick: f => { tickers.add(f); rec.ticks.push(f); try { f(); } catch (e) { console.error(e); } },
    on: (t, ev, fn, o) => { t.addEventListener(ev, fn, o); rec.cleanups.push(() => t.removeEventListener(ev, fn, o)); },
    cleanup: f => rec.cleanups.push(f),
    rt: () => { if (!RT.has(rec.wd.id)) RT.set(rec.wd.id, {}); return RT.get(rec.wd.id); },
  };
  try { rec.inst = def.mount(c) || {}; }
  catch (e) { console.error(e); rec.inst = {}; rec.body.append(h('div', { class: 'empty' }, h('p', {}, 'This tool ran into a problem. Close it and add it again.'))); }
}
function removeWidget(id) {
  const rec = live.get(id); if (!rec) return;
  const b = board(), i = b.widgets.findIndex(w => w.id === id); if (i < 0) return;
  const wd = b.widgets[i];
  unmount(rec, true);
  b.widgets.splice(i, 1); updateEmpty(); save();
  const label = isItem(wd) ? { sticker: 'sticker', shape: 'shape', note: 'sticky note' }[wd.type] : (wd.s._title || T[wd.type].title);
  let undone = false;
  toast(`Removed ${label}`, {
    action: ['Undo', () => { undone = true; b.widgets.splice(Math.min(i, b.widgets.length), 0, wd); if (board() === b) { mountWidget(wd); updateEmpty(); } save(); }],
    done: () => { if (!undone) { const d = T[wd.type]; if (d && d.blobs) d.blobs(wd.s).forEach(x => x && Blobs.del(x)); if (wd.s && wd.s.live) liveClose(wd.s); } },
  });
}
function unmount(rec, disposeRt) {
  for (const f of rec.ticks) tickers.delete(f);
  for (const f of rec.cleanups) try { f(); } catch (e) {}
  try { rec.inst && rec.inst.destroy && rec.inst.destroy(); } catch (e) {}
  if (disposeRt || true) { const r = RT.get(rec.wd.id); if (r && r.dispose) try { r.dispose(); } catch (e) {} RT.delete(rec.wd.id); }
  ro && rec.body && ro.unobserve(rec.body);
  rec.el.remove(); live.delete(rec.wd.id);
}
function front(rec) {
  if (rec.wd.z >= zTop) return;
  rec.wd.z = ++zTop; rec.el.style.zIndex = rec.wd.z; save();
}
function toggleMax(rec) {
  const on = !rec.el.classList.contains('max');
  live.forEach(r => { if (r.el.classList.contains('max')) { r.el.classList.remove('max'); r.maxBtn && r.maxBtn.replaceChildren(svg('max')); } });
  if (on) { rec.el.classList.add('max'); rec.maxBtn.replaceChildren(svg('min')); rec.maxBtn.title = 'Shrink'; front(rec); }
  else rec.maxBtn.title = 'Enlarge';
}
function dragify(rec) {
  const { head, el, wd } = rec;
  el.addEventListener('pointerdown', () => front(rec), true);
  head.addEventListener('pointerdown', e => {
    if (e.button > 0 || e.target.closest('button,input,[contenteditable="true"]')) return;
    if (isStack() || el.classList.contains('max')) return;
    e.preventDefault();
    const x0 = el.offsetLeft, y0 = el.offsetTop, sx = e.clientX, sy = e.clientY;
    head.setPointerCapture(e.pointerId); el.classList.add('dragging');
    const mv = ev => { const p = clampPos(x0 + ev.clientX - sx, y0 + ev.clientY - sy, el.offsetWidth, el.offsetHeight); el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; };
    const up = () => {
      head.removeEventListener('pointermove', mv); head.removeEventListener('pointerup', up); head.removeEventListener('pointercancel', up);
      el.classList.remove('dragging'); const { W, H } = boardSize(); wd.x = el.offsetLeft / W; wd.y = el.offsetTop / H; save();
    };
    head.addEventListener('pointermove', mv); head.addEventListener('pointerup', up); head.addEventListener('pointercancel', up);
  });
}
function resizify(rec) {
  const { rz, el, wd } = rec, def = T[wd.type];
  rz.addEventListener('pointerdown', e => {
    if (isStack()) return;
    e.preventDefault(); e.stopPropagation();
    const w0 = el.offsetWidth, h0 = el.offsetHeight, sx = e.clientX, sy = e.clientY;
    rz.setPointerCapture(e.pointerId);
    const mv = ev => {
      const { W, H } = boardSize();
      el.style.width = clamp(w0 + ev.clientX - sx, def.minW || 180, W - el.offsetLeft) + 'px';
      el.style.height = clamp(h0 + ev.clientY - sy, def.minH || 150, H - el.offsetTop) + 'px';
    };
    const up = () => { rz.removeEventListener('pointermove', mv); rz.removeEventListener('pointerup', up); rz.removeEventListener('pointercancel', up); wd.w = el.offsetWidth; wd.h = el.offsetHeight; save(); };
    rz.addEventListener('pointermove', mv); rz.addEventListener('pointerup', up); rz.addEventListener('pointercancel', up);
  });
}
function renamable(rec) {
  const t = rec.title;
  const start = () => {
    if (t.isContentEditable) return;
    t.contentEditable = 'true'; t.focus();
    const r = document.createRange(); r.selectNodeContents(t); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
  };
  const finish = () => {
    if (!t.isContentEditable) return; t.contentEditable = 'false';
    const v = t.textContent.trim(); const def = T[rec.wd.type];
    if (v && v !== def.title) rec.wd.s._title = v.slice(0, 60); else delete rec.wd.s._title;
    t.textContent = rec.wd.s._title || def.title; save();
  };
  t.addEventListener('dblclick', start);
  t.addEventListener('blur', finish);
  t.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); t.blur(); } if (e.key === 'Escape') { t.textContent = rec.wd.s._title || T[rec.wd.type].title; t.blur(); } });
}
let ro = null;
if (window.ResizeObserver) ro = new ResizeObserver(entries => {
  for (const en of entries) { for (const rec of live.values()) if (rec.body === en.target && rec.inst && rec.inst.resize) { try { rec.inst.resize(); } catch (e) {} } }
});

/* ---------- Board ---------- */
function applyBg() {
  const b = board().bg || { k: 'grid' };
  bgEl.className = ''; bgEl.style.background = '';
  if (['grid', 'dots', 'lines', 'chalk', 'cork', 'black', 'white'].includes(b.k)) bgEl.className = 'bg-' + b.k;
  else if (b.k === 'scene' && SCENES[b.v]) bgEl.style.background = sceneCss(b.v);
  else if (b.k === 'solid' || b.k === 'grad') bgEl.style.background = b.v;
  else if (b.k === 'real' && RBG[b.v]) {
    const [w, hh] = rbSize(), show = () => { if (board().bg === b) bgEl.style.background = `center / cover no-repeat url("${rbRender(b.v, w, hh)}") ${RBG[b.v][2]}`; };
    if (_rbCache.has(b.v + ':' + w + 'x' + hh)) show(); else { bgEl.style.background = RBG[b.v][2]; rbIdle(show); }
  }
  else if (b.k === 'img') Blobs.url(b.v).then(u => { if (u && board().bg === b) bgEl.style.background = `center / cover no-repeat url("${u}")`; else if (!u) bgEl.className = 'bg-grid'; });
}
function showBoard() {
  [...live.values()].forEach(r => unmount(r));
  boardEl.querySelectorAll('.wg').forEach(n => n.remove());
  const b = board();
  const ws = b.widgets.slice().sort((a, c) => a.z - c.z);
  ws.forEach((w, i) => { w.z = i + 1; }); zTop = ws.length + 1;
  b.widgets.forEach(mountWidget);
  applyBg(); updateEmpty(); updateBoardName();
}
function updateEmpty() {
  const has = board().widgets.some(w => !isItem(w));
  let e = $('.empty-board', boardEl);
  if (has && e) e.remove();
  if (!has && !e) {
    e = h('div', { class: 'empty-board' }, h('b', {}, 'This board is empty'), h('span', {}, 'Pick a tool from the bar below to add it here.'), h('small', { class: 'credit' }, 'VocaBoard \u00b7 Developed by: Ms. Amina Qatan'));
    boardEl.prepend(e);
  }
}
function updateBoardName() {
  if (!bnameEl) return;
  bnameEl.textContent = board().name;
  const multi = S.boards.length > 1;
  $('#bprev').hidden = !multi; $('#bnext').hidden = !multi;
}
function switchBoard(id) { if (S.cur === id) return; S.cur = id; save(); showBoard(); }
function stepBoard(d) { const i = S.boards.findIndex(b => b.id === S.cur); switchBoard(S.boards[(i + d + S.boards.length) % S.boards.length].id); }
let _rbT;
function relayout() {
  boardEl.classList.toggle('stack', isStack());
  const bg = board().bg; if (bg && bg.k === 'real') { clearTimeout(_rbT); _rbT = setTimeout(applyBg, 500); }
  live.forEach(r => r.item ? placeItem(r) : place(r));
}

/* example board for the first visit */
function seedExample() {
  const ex = [
    ['text', 24, 76, 470, 196, { html: '<div><b>Today’s goal</b></div><div>I can find equivalent fractions using fraction strips.</div>', font: 'lexend', size: 30, note: 'butter', _title: 'Lesson goal (example)' }],
    ['timer', 24, 290, 300, 300, {}],
    ['clock', 512, 76, 300, 196, {}],
    ['work', 340, 290, 300, 300, { cur: 'whisper' }],
    ['traffic', 656, 290, 170, 300, { on: 'green' }],
    ['timetable', 842, 76, 360, 514, {}],
  ];
  const b = board(), { W, H } = boardSize(), k = clamp(Math.min(W / 1230, H / 768), .6, 1.7);
  ex.forEach(([type, x, y, w, hh, s]) => {
    const def = T[type];
    if (type === 'text') s.size = Math.round(30 * (isStack() ? 1 : k));
    b.widgets.push({ id: uid(), type, x: x * k / W, y: y * k / H, w: Math.round(w * k), h: Math.round(hh * k), z: ++zTop, s: Object.assign(def.init ? def.init() : {}, s) });
  });
  b.widgets.push({ id: uid(), type: 'sticker', x: 482 * k / W, y: 92 * k / H, z: ++zTop, s: { k: 'star', size: Math.round(84 * k), r: 12 } });
  S.first = false; save();
}

/* ---------- Toast & sheets ---------- */
function toast(msg, o = {}) {
  if (!toastEl) return;
  const t = h('div', { class: 'toast', role: 'status' }, h('span', {}, msg));
  let closed = false;
  const close = () => { if (closed) return; closed = true; t.remove(); o.done && o.done(); };
  if (o.action) t.append(h('button', { type: 'button', onclick: () => { o.action[1](); close(); } }, o.action[0]));
  toastEl.append(t);
  while (toastEl.children.length > 3) toastEl.firstChild.remove();
  setTimeout(close, o.ms || (o.action ? 6000 : 3500));
}
let sheetWrap = null, sheetBack = null;
const SHEET_FOC = 'button, a[href], input, select, textarea, [tabindex]';
function closeSheet() {
  if (!sheetWrap) return;
  const had = sheetWrap.contains(document.activeElement), back = sheetBack;
  sheetWrap.remove(); sheetWrap = null; sheetBack = null;
  if (had && back && back.isConnected && tvOn()) tvFocus(back);
}
function sheet(title, build, side) {
  // re-opening the same window (after a choice) keeps the place and the focused button
  let keepIdx = -1, keepTop = 0, back = document.activeElement;
  if (sheetWrap) {
    back = sheetBack;
    if (sheetWrap._title === title) { keepIdx = [...sheetWrap.querySelectorAll(SHEET_FOC)].indexOf(document.activeElement); const ob = sheetWrap.querySelector('.sheet-b'); keepTop = ob ? ob.scrollTop : 0; }
    sheetWrap.remove(); sheetWrap = null;
  }
  sheetBack = back && back !== document.body && back.isConnected ? back : null;
  const body = h('div', { class: 'sheet-b' });
  sheetWrap = h('div', { class: 'sheet-wrap' + (side ? ' side' : ''), onpointerdown: e => { if (e.target === sheetWrap) closeSheet(); } },
    h('section', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('header', { class: 'sheet-h' }, h('h2', {}, title), ib('x', 'Close', closeSheet)), body));
  sheetWrap._title = title;
  build(body);
  app.append(sheetWrap);
  if (keepTop) body.scrollTop = keepTop;
  const same = keepIdx >= 0 ? sheetWrap.querySelectorAll(SHEET_FOC)[keepIdx] : null;
  const f = same || sheetWrap.querySelector('.sheet-b button, .sheet-b input'); f && f.focus({ preventScroll: true });
  if (f && tvOn()) tvReveal(f);
}

/* ---------- Background picker ---------- */
const BR_GREEN = 'radial-gradient(ellipse at 50% 28%,#2ba356,#17773c 70%,#11612f)';
const BR_SOLIDS = ['#bfe6fb', '#c6e77e', '#ff94b8', '#ffd84d', '#b49cff', '#ffae5e', '#ffffff', '#1d1b33'];
const SOLIDS = ['#ffffff', '#f6f3ea', '#fde2e4', '#fff1c1', '#dff5d6', '#d8f3f4', '#e6e1ff', '#2b2a3f', '#13324a', '#3b2c4f'];
const GRADS = [
  'linear-gradient(135deg,#ffd6e0,#fff1c1)', 'linear-gradient(135deg,#c9f2e7,#d6e4ff)', 'linear-gradient(135deg,#e6e1ff,#ffd9f0)',
  'linear-gradient(160deg,#9ad8ff,#e3f6ff 70%)', 'linear-gradient(160deg,#ffe5b4,#ffb8a3)', 'linear-gradient(135deg,#1f2b4d,#43306b)',
];
function openBackground() {
  sheet('Background', body => {
    const b = board(), cur = b.bg || { k: 'grid' };
    const pick = bg => { b.bg = bg; save(); applyBg(); openBackground(); };
    const sw = (bg, label, cls, style) => h('button', { class: 'sw ' + (cls || ''), type: 'button', style: style || {}, 'aria-pressed': String(cur.k === bg.k && cur.v === bg.v), 'aria-label': label, onclick: () => pick(bg) }, label ? h('span', {}, label) : null);
    const queue = [], rsw = k => { const el = sw({ k: 'real', v: k }, RBG[k][0], 'rsw', { background: RBG[k][2] }); queue.push(() => { if (el.isConnected) el.style.background = `center / cover no-repeat url("${rbRender(k, 320, 240)}")`; }); return el; };
    const runQ = () => { const f = queue.shift(); if (f) { f(); setTimeout(runQ, 0); } };
    setTimeout(runQ, 60);
    body.append(
      h('div', { class: 'sec' }, h('h3', {}, 'Bright'), h('div', { class: 'swatches big' },
        Object.keys(SCENES).filter(k => SCENES[k][1] === 'bright').map(k => sw({ k: 'scene', v: k }, SCENES[k][0], '', { background: sceneCss(k, true) })),
        sw({ k: 'grad', v: BR_GREEN }, 'Green board', '', { background: BR_GREEN })),
        h('div', { class: 'swatches' }, BR_SOLIDS.map(c => sw({ k: 'solid', v: c }, '', '', { background: c })))),
      h('div', { class: 'sec' }, h('h3', {}, 'Real boards'), h('div', { class: 'swatches big' }, ['rgreen', 'rblack', 'rwhite', 'rcork'].map(rsw))),
      h('div', { class: 'sec' }, h('h3', {}, 'Real nature'), h('div', { class: 'swatches big' }, Object.keys(RBG).filter(k => RBG[k][1] === 'nature').map(rsw))),
      h('div', { class: 'sec' }, h('h3', {}, 'Simple boards'), h('div', { class: 'swatches big' },
        sw({ k: 'black' }, 'Blackboard', 'bg-black'), sw({ k: 'chalk' }, 'Green board', 'bg-chalk'), sw({ k: 'white' }, 'Whiteboard', 'bg-white'), sw({ k: 'cork' }, 'Corkboard', 'bg-cork'))),
      h('div', { class: 'sec' }, h('h3', {}, 'Paper'), h('div', { class: 'swatches big' },
        sw({ k: 'grid' }, 'Grid', 'bg-grid'), sw({ k: 'dots' }, 'Dots', 'bg-dots'), sw({ k: 'lines' }, 'Lined', 'bg-lines'))),
      h('div', { class: 'sec' }, h('h3', {}, 'Nature drawings'), h('div', { class: 'swatches big' }, Object.keys(SCENES).filter(k => SCENES[k][1] === 'nature').map(k => sw({ k: 'scene', v: k }, SCENES[k][0], '', { background: sceneCss(k, true) })))),
      h('div', { class: 'sec' }, h('h3', {}, 'Cute animals'), h('div', { class: 'swatches big' }, Object.keys(SCENES).filter(k => SCENES[k][1] === 'animals').map(k => sw({ k: 'scene', v: k }, SCENES[k][0], '', { background: sceneCss(k, true) })))),
      h('div', { class: 'sec' }, h('h3', {}, 'Colour'), h('div', { class: 'swatches' }, SOLIDS.map(c => sw({ k: 'solid', v: c }, '', '', { background: c })))),
      h('div', { class: 'sec' }, h('h3', {}, 'Gradient'), h('div', { class: 'swatches' }, GRADS.map(c => sw({ k: 'grad', v: c }, '', '', { background: c })))),
      h('div', { class: 'sec' }, h('h3', {}, 'Your own picture'),
        h('div', { class: 'row' }, filePick('image/*', async f => { const id = await Blobs.put(f); const old = b.bg; b.bg = { k: 'img', v: id }; if (old && old.k === 'img') Blobs.del(old.v); save(); applyBg(); closeSheet(); }, 'Choose a picture', 'btn sm'),
          h('span', { class: 'note' }, 'Use any photo, such as a class picture or a landscape. It stays on this device.'))),
    );
  });
}
function filePick(accept, onfile, label, cls = 'btn sm', id) {
  const inp = h('input', { type: 'file', accept, hidden: true, id: id || ('f' + uid()), onchange: e => { const f = e.target.files && e.target.files[0]; if (f) onfile(f); e.target.value = ''; } });
  const b = btn(label, () => inp.click(), cls, 'upload');
  return h('span', { style: { display: 'contents' } }, inp, b);
}
function openStickers() {
  sheet('Stickers', body => {
    body.append(h('p', { class: 'note' }, 'Tap a sticker to put it on the board. Drag it to move, use the corner to resize.'),
      ...STK_GROUPS.map(([name, keys]) => h('div', { class: 'sec' }, h('h3', { dir: 'auto' }, name),
        h('div', { class: 'stk-grid' + (STK_WORDY.has(keys[0]) ? ' words' : '') }, keys.filter(k => STK[k]).map(k => h('button', { type: 'button', title: STK_NAME[k] || k, 'aria-label': 'Add sticker: ' + (STK_NAME[k] || k), html: stkSvg(k), onclick: () => { addSticker(k); closeSheet(); } }))))));
  });
}

/* ---------- Menu ---------- */
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
addEventListener('appinstalled', () => { installEvt = null; toast('VocaBoard is installed.'); });
const standalone = () => matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;

function openMenu(focusBoards) {
  sheet('VocaBoard', body => {
    const b = board();
    body.append(h('p', { class: 'credit' }, 'Developed by: ', h('b', {}, 'Ms. Amina Qatan')));
    const list = h('div', { class: 'blist' }, S.boards.map(x => h('button', { class: 'bitem', type: 'button', 'aria-current': String(x.id === S.cur), onclick: () => { switchBoard(x.id); openMenu(true); } }, x.name, h('small', {}, x.widgets.filter(w => !isItem(w)).length + ' tools'))));
    const nameIn = h('input', { class: 'inp', id: 'boardname', value: b.name, maxlength: 40, oninput: e => { b.name = e.target.value || 'Board'; save(); updateBoardName(); } });
    body.append(
      h('div', { class: 'sec' }, h('h3', {}, 'Boards'), list,
        h('div', { class: 'row' },
          btn('New board', () => { const nb = { id: uid(), name: 'Board ' + (S.boards.length + 1), bg: S.look === 'soft' ? { k: 'grid' } : { k: 'scene', v: 'brhills' }, widgets: [] }; S.boards.push(nb); switchBoard(nb.id); openMenu(true); }, 'btn sm', 'plus'),
          S.boards.length > 1 ? confirmBtn('Delete this board', 'Tap again to delete', () => { const i = S.boards.indexOf(b); S.boards.splice(i, 1); b.widgets.forEach(w => { const d = T[w.type]; d && d.blobs && d.blobs(w.s).forEach(x => x && Blobs.del(x)); }); S.cur = S.boards[Math.max(0, i - 1)].id; save(); showBoard(); openMenu(true); }) : null),
        field('Board name', nameIn),
        h('div', { class: 'row' }, confirmBtn('Clear this board', 'Tap again to clear', () => { b.widgets.slice().forEach(w => { const r = live.get(w.id); r && unmount(r, true); }); b.widgets = []; save(); showBoard(); closeSheet(); toast('Board cleared'); }))),
      h('div', { class: 'sec' }, h('h3', {}, 'Display'),
        field('Look', seg([['bright', 'Bright'], ['soft', 'Pastel']], S.look === 'soft' ? 'soft' : 'bright', v => { S.look = v; applyPrefs(); save(); openMenu(); }, 'Look')),
        APP ? field('Colours', seg([['auto', 'Match device'], ['light', 'Light'], ['dark', 'Dark']], S.theme, v => { S.theme = v; applyPrefs(); save(); openMenu(); }, 'Colours')) : null,
        field('Size of buttons and text', seg([['auto', 'Auto'], ['s', 'Small'], ['m', 'Medium'], ['l', 'Large'], ['xl', 'Extra large']], S.ui, v => { S.ui = v; applyPrefs(); save(); openMenu(); }, 'Size')),
        field('TV remote control', seg([['auto', isTV ? 'Auto (on)' : 'Auto (off)'], ['on', 'On'], ['off', 'Off']], S.remote || 'auto', v => { S.remote = v; applyTV(); applyPrefs(); save(); openMenu(); }, 'TV remote control')),
        tvOn() ? h('p', { class: 'note' }, 'Arrows move between buttons, OK presses, Back closes. On a tool’s name, press OK to move it, OK again to change its size.') : null,
        toggle('pref-sound', 'Sounds', !S.mute, v => { S.mute = !v; save(); }),
        toggle('pref-wake', 'Keep the screen awake', S.wake, v => { S.wake = v; save(); wake(); }),
        h('div', { class: 'row' }, btn('Full screen', () => { closeSheet(); goFull(); }, 'btn sm', 'fs'), btn('Save the board as a picture or PDF', () => openExport(), 'btn sm', 'download'))),
      h('div', { class: 'sec' }, h('h3', {}, 'Students join with a QR code'),
        h('p', { class: 'note' }, 'Students answer a Poll or post on the Idea wall from their own phones. Each activity gets its own code, so classes never mix.'),
        APP ? h('div', { class: 'row' }, btn(liveUrl() ? 'Connection settings' : 'Set up', () => openLiveSettings(), 'btn sm', 'qr'), liveUrl() ? h('span', { class: 'note' }, 'Address saved') : null)
            : h('p', { class: 'note' }, 'This works in the installed app on your website.')),
      installSection(),
      h('div', { class: 'sec' }, h('h3', {}, 'Back up'),
        h('p', { class: 'note' }, 'Move your boards and class lists to another device. Pictures, PDFs and videos stay on this device.'),
        h('div', { class: 'row' }, btn('Export boards', exportData, 'btn sm', 'download'), filePick('application/json,.json', importData, 'Import', 'btn sm'))),
      h('div', { class: 'sec' }, h('h3', {}, 'Tips'),
        h('p', { class: 'note' }, 'Drag a tool by its top bar and resize it from the bottom-right corner. Double-tap a title to rename it. Paste or drop pictures, PDFs and links straight onto the board.')),
    );
    if (focusBoards) setTimeout(() => { const c = body.querySelector('.bitem[aria-current="true"]'); c && c.focus({ preventScroll: true }); }, 0);
  }, true);
}
function installSection() {
  const sec = h('div', { class: 'sec' }, h('h3', {}, 'Install'));
  if (!APP) {
    sec.append(h('p', { class: 'note' }, 'You are using the browser version. The installable version works offline and adds the microphone, webcam, video and website tools.'));
    return sec;
  }
  if (standalone()) { sec.append(h('p', { class: 'note' }, 'Installed. VocaBoard opens from your home screen or apps list and works offline.')); return sec; }
  if (isTV) { sec.append(h('p', { class: 'note' }, 'On a TV: TV browsers can’t install apps. In your TV browser, set this page as the home page or add a bookmark, so VocaBoard opens when you open the browser. Your boards are saved on the TV.')); return sec; }
  if (installEvt) sec.append(btn('Install VocaBoard', async () => { try { installEvt.prompt(); await installEvt.userChoice; } catch (e) {} installEvt = null; openMenu(); }, 'btn pri', 'install'));
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  sec.append(h('p', { class: 'note' }, ios
    ? 'On iPad or iPhone: open this page in Safari, tap Share, then Add to Home Screen.'
    : 'On a smart board, Android tablet or phone: open the browser menu and choose Install app or Add to Home screen. On Windows or Mac: in Chrome or Edge, click the install icon at the right of the address bar.'));
  return sec;
}
function exportData() {
  const data = JSON.stringify({ app: 'vocaboard', v: 1, exported: new Date().toISOString(), boards: S.boards, classes: S.classes, attendance: S.att ? S.att.sess : {}, liveUrl: S.liveUrl || '' });
  if (APP) {
    const a = h('a', { href: URL.createObjectURL(new Blob([data], { type: 'application/json' })), download: 'vocaboard-boards.json' });
    document.body.append(a); a.click(); a.remove(); toast('Saved vocaboard-boards.json');
    return;
  }
  sheet('Export boards', body => {
    const ta = h('textarea', { class: 'inp', id: 'exportjson', rows: 8, readonly: true }); ta.value = data;
    body.append(h('p', { class: 'note' }, 'Copy this text, save it as a .json file, then use Import on the other device.'), ta,
      h('div', { class: 'row' }, btn('Copy', async () => { try { await navigator.clipboard.writeText(data); toast('Copied'); } catch (e) { ta.focus(); ta.select(); toast('Press Ctrl+C or Cmd+C to copy'); } }, 'btn sm pri', 'copy')));
  });
}
async function importData(file) {
  try {
    const d = JSON.parse(await file.text());
    if (!d || !['vocaboard', 'chalkbox'].includes(d.app) || !Array.isArray(d.boards)) throw new Error('bad');
    let nb = 0;
    d.boards.forEach(b => { if (!b || !Array.isArray(b.widgets)) return; b.id = uid(); b.widgets = b.widgets.filter(w => w && (T[w.type] || isItem(w))).map(w => Object.assign(w, { id: uid() })); b.bg = b.bg && b.bg.k !== 'img' ? b.bg : { k: 'grid' }; b.widgets.forEach(w => { if (w.s && w.s.live) w.s.live = null; if (w.type === 'text' && w.s) w.s.html = cleanHtml(w.s.html || ''); if (w.type === 'note' && w.s) w.s.html = cleanHtml(w.s.html || ''); }); S.boards.push(b); nb++; });
    (d.classes || []).forEach(c => { if (c && Array.isArray(c.names) && !S.classes.some(x => x.id === c.id)) S.classes.push({ id: c.id || uid(), name: String(c.name || 'Class'), subject: String(c.subject || ''), names: c.names.map(String), absent: [], gender: c.gender && typeof c.gender === 'object' ? c.gender : {} }); });
    if (d.liveUrl && !S.liveUrl && /^https:\/\//.test(d.liveUrl)) S.liveUrl = String(d.liveUrl);
    if (d.attendance && typeof d.attendance === 'object') { attStore(); for (const k in d.attendance) if (!S.att.sess[k]) S.att.sess[k] = d.attendance[k]; }
    save(); closeSheet(); toast(`Imported ${nb} board${nb === 1 ? '' : 's'}`); updateBoardName();
  } catch (e) { toast("That file isn't a VocaBoard export. Choose the .json file made by Export boards."); }
}

/* ---------- Device features ---------- */
function applyPrefs() {
  const r = document.documentElement;
  if (APP) { if (S.theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', S.theme); }
  r.classList.toggle('soft', S.look === 'soft');
  let u = { s: .875, m: 1, l: 1.2, xl: 1.45 }[S.ui];
  if (!u && tvOn()) u = innerWidth >= 1700 ? 1.45 : innerWidth >= 1200 ? 1.2 : 1; // TVs: big text only when the browser uses a large page width
  if (!u) { const big = Math.min(screen.width, screen.height) >= 1000 && matchMedia('(pointer: coarse)').matches; u = big ? 1.2 : 1; }
  r.style.setProperty('--u', u);
}
let wl = null;
async function wake() {
  try {
    if (!S.wake) { if (wl) { await wl.release(); wl = null; } return; }
    if ('wakeLock' in navigator && document.visibilityState === 'visible' && !wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); }
  } catch (e) { wl = null; }
}
function goFull() {
  const d = document;
  if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
  const el = d.documentElement, f = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!f) { toast("Full screen isn't available in this browser."); return; }
  try { const p = f.call(el); p && p.catch && p.catch(() => toast("Full screen isn't available here.")); } catch (e) { toast("Full screen isn't available here."); }
}
async function addFile(f, at) {
  const t = f.type || '';
  const kind = t.startsWith('image/') ? 'image' : t === 'application/pdf' || /\.pdf$/i.test(f.name) ? 'pdf' : t.startsWith('video/') ? 'video' : null;
  if (!kind) { toast("That kind of file can't go on the board. Use a picture, PDF or video."); return; }
  const id = await Blobs.put(f);
  addWidget(kind, kind === 'image' ? { blob: id } : kind === 'pdf' ? { blob: id, name: f.name, page: 1 } : { blob: id, name: f.name }, at);
}
