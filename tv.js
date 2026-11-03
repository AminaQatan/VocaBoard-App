/* ---------- TV remote (Sony and other Google TV / Android TV sets, smart boards with a remote) ----------
   Arrows move between buttons, OK presses, Back closes the top window.
   On a tool's name (or a sticker), OK starts "move": arrows move it, OK again changes its size, Back finishes. */
const TV_UA = /Android ?TV|Google ?TV|GoogleTV|BRAVIA|SmartTV|SMART-TV|Tizen|Web0S|webOS|NetCast|HbbTV|\bAFT[A-Z]{1,5}\b|CrKey|TV ?Bro|; ?TV[;)]/i;
const isTV = (() => {
  try {
    if (TV_UA.test(navigator.userAgent || '')) return true;
    // no mouse and no touch screen at all: only a remote or keyboard can drive the page
    return !matchMedia('(any-pointer: fine)').matches && !matchMedia('(any-pointer: coarse)').matches && matchMedia('(any-pointer: none)').matches;
  } catch (e) { return false; }
})();
const tvOn = () => !!S && (S.remote === 'on' || (S.remote !== 'off' && isTV));
const TV_SEL = 'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';
const TV_DIR = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };

function applyTV() {
  const on = tvOn(), r = document.documentElement;
  r.classList.toggle('tv', on);
  document.querySelectorAll('.wg-t').forEach(t => { if (on) { t.tabIndex = 0; t.title = 'Press OK to move or resize this tool'; } else { t.removeAttribute('tabindex'); t.title = 'Double-tap to rename'; } });
  if (on) tvGuard(); else tvUnguard();
}
function tvTitle(t) { if (tvOn()) { t.tabIndex = 0; t.title = 'Press OK to move or resize this tool'; } }

/* the window or popup on top decides where the arrows can go */
function tvScope() {
  if (palEl) return palEl;
  if (sheetWrap) return sheetWrap;
  return app;
}
function scrollBox(el) {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const cs = getComputedStyle(p);
    if ((/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 1) || (/(auto|scroll)/.test(cs.overflowX) && p.scrollWidth > p.clientWidth + 1)) return p;
  }
  return null;
}
const onScreen = r => r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight;
function tvReachable(el) {
  if (el.closest('.dock-arrow, [aria-hidden="true"], [hidden], [inert]')) return false;
  const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  if (getComputedStyle(el).visibility === 'hidden') return false;
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2, sb = scrollBox(el);
  const inBox = sb ? (() => { const b = sb.getBoundingClientRect(); return cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom; })() : true;
  if (!inBox) return onScreen(sb.getBoundingClientRect()); // scrolled out of sight: reachable when its box is on screen
  if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return false;
  const hit = document.elementFromPoint(cx, cy);
  if (!hit) return false;
  if (hit === el || el.contains(hit) || hit.contains(el)) return true;
  // a decoration on top (a ring, a shadow) is fine; another tool or window on top is not
  const box = n => n.closest('.wg, .stk, .sheet-wrap, .palpop, #dock, .top, .bigpop, #toast, #dockTab');
  return box(hit) === box(el) && document.elementsFromPoint(cx, cy).includes(el);
}
function tvList(scope, not) { return [...scope.querySelectorAll(TV_SEL)].filter(e => e !== not && tvReachable(e)); }
function tvReveal(el) {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const cs = getComputedStyle(p), m = 14;
    const sy = /(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 1, sx = /(auto|scroll)/.test(cs.overflowX) && p.scrollWidth > p.clientWidth + 1;
    if (!sy && !sx) continue;
    const pr = p.getBoundingClientRect(), er = el.getBoundingClientRect();
    if (sy) { if (er.top < pr.top + m) p.scrollTop -= pr.top + m - er.top; else if (er.bottom > pr.bottom - m) p.scrollTop += Math.min(er.bottom - pr.bottom + m, er.top - pr.top - m); }
    if (sx) { if (er.left < pr.left + m) p.scrollLeft -= pr.left + m - er.left; else if (er.right > pr.right - m) p.scrollLeft += Math.min(er.right - pr.right + m, er.left - pr.left - m); }
  }
}
function tvFocus(el) {
  if (!el) return;
  document.documentElement.classList.add('kb');
  try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
  tvReveal(el);
  const it = el.closest && el.closest('.stk');
  if (it && tvOn()) { document.querySelectorAll('.stk.sel').forEach(x => x !== it && x.classList.remove('sel')); it.classList.add('sel'); it.classList.toggle('below', it.getBoundingClientRect().top < 70); }
}
function tvFirst(scope, list) {
  if (scope === sheetWrap) return list.find(e => e.closest('.sheet-b')) || list[0];
  if (scope === palEl) return list.find(e => e.getAttribute('aria-pressed') === 'true') || list[0];
  return list.find(e => e.closest('#dock')) || list[0];
}
// a switch is aimed at by its whole row, not just the little knob at the far right
const geo = el => (el.closest('.switch') || el).getBoundingClientRect();
function tvPick(cur, list, dir) {
  const a = geo(cur), H = dir === 'left' || dir === 'right', fwd = dir === 'right' || dir === 'down';
  const ca = H ? a.left + a.width / 2 : a.top + a.height / 2, co = H ? a.top + a.height / 2 : a.left + a.width / 2;
  let best = null, bs = Infinity;
  for (const e of list) {
    if (e.contains(cur)) continue;
    const b = geo(e);
    const cb = H ? b.left + b.width / 2 : b.top + b.height / 2;
    let d = dir === 'right' ? b.left - a.right : dir === 'left' ? a.left - b.right : dir === 'down' ? b.top - a.bottom : a.top - b.bottom, pen = 0;
    if (d < -3) { // overlapping along the way we are going: only if it is clearly further on
      const ahead = fwd ? cb - ca : ca - cb;
      const far = fwd ? (H ? b.right - a.right : b.bottom - a.bottom) : (H ? a.left - b.left : a.top - b.top);
      if (ahead < 8 || far < 8) continue;
      d = 0; pen = 40;
    }
    d = Math.max(0, d);
    const lo = H ? Math.max(a.top, b.top) : Math.max(a.left, b.left), hi = H ? Math.min(a.bottom, b.bottom) : Math.min(a.right, b.right);
    const gap = Math.max(0, lo - hi), off = Math.abs(co - (H ? b.top + b.height / 2 : b.left + b.width / 2));
    const sc = Math.hypot(d, gap) + gap * (H ? 4 : .3) + off * .08 + pen; // sideways: stay in the row; up and down: the nearest thing wins
    if (sc < bs) { bs = sc; best = e; }
  }
  return best;
}
function tvMove(dir) {
  const scope = tvScope(), cur = document.activeElement;
  const list = tvList(scope, cur);
  if (!cur || cur === document.body || !scope.contains(cur)) { const f = tvFirst(scope, list); if (f) { tvFocus(f); return true; } return false; }
  const nx = tvPick(cur, list, dir);
  if (nx) { tvFocus(nx); return true; }
  // nothing further that way: scroll the box the focus is in, if it can scroll
  const sb = scrollBox(cur);
  if (sb && scope.contains(sb)) {
    const k = .6, dy = dir === 'down' ? sb.clientHeight * k : dir === 'up' ? -sb.clientHeight * k : 0, dx = dir === 'right' ? sb.clientWidth * k : dir === 'left' ? -sb.clientWidth * k : 0;
    const t0 = sb.scrollTop, l0 = sb.scrollLeft; sb.scrollTop += dy; sb.scrollLeft += dx;
    if (sb.scrollTop !== t0 || sb.scrollLeft !== l0) return true;
  }
  return true; // stay put rather than letting the page scroll
}
function textish(t) {
  if (!t || !t.tagName) return false;
  if (t.isContentEditable || t.tagName === 'TEXTAREA') return true;
  return t.tagName === 'INPUT' && /^(text|search|url|email|tel|password|number|)$/.test((t.getAttribute('type') || '').toLowerCase());
}
function caretAtEdge(t, dir) {
  const back = dir === 'up' || dir === 'left';
  if (t.isContentEditable) {
    const sel = getSelection(); if (!sel.rangeCount || !t.contains(sel.anchorNode)) return true;
    const r = sel.getRangeAt(0), x = document.createRange(); x.selectNodeContents(t);
    if (back) x.setEnd(r.startContainer, r.startOffset); else x.setStart(r.endContainer, r.endOffset);
    return x.toString().length === 0;
  }
  let s, e; try { s = t.selectionStart; e = t.selectionEnd; } catch (err) { return true; }
  if (s == null) return true;
  if (t.tagName === 'INPUT' && (dir === 'up' || dir === 'down')) return true;
  const len = t.value.length;
  return back ? s === 0 && e === 0 : s === len && e === len;
}
const isSlider = t => t && (t.getAttribute && t.getAttribute('role') === 'slider' || (t.tagName === 'INPUT' && t.type === 'range'));

/* ---------- moving and resizing with the remote ---------- */
let tvMv = null;
function tvMoveStart(rec) {
  if (!rec) return;
  if (!rec.item && (isStack() || rec.el.classList.contains('max'))) { toast(rec.el.classList.contains('max') ? 'Press Back to make the tool smaller first.' : 'Tools can’t be moved on a narrow screen.'); return; }
  if (!rec.item) front(rec); else { rec.wd.z = ++zTop; rec.el.style.zIndex = rec.wd.z; }
  const tag = h('div', { class: 'tv-mv', 'aria-live': 'polite' });
  rec.el.append(tag); rec.el.classList.add('tv-moving');
  tvMv = { rec, mode: 'move', tag }; tvMvLabel();
}
function tvMvLabel() { if (tvMv) tvMv.tag.textContent = tvMv.mode === 'move' ? 'Move it with the arrows · OK: change the size · Back: done' : 'Change the size with the arrows · OK or Back: done'; }
function tvMoveEnd() {
  if (!tvMv) return;
  const { rec, tag } = tvMv; tvMv = null;
  tag.remove(); rec.el.classList.remove('tv-moving');
  const { W, H } = boardSize();
  if (rec.item) placeItem(rec);
  else { rec.wd.x = rec.el.offsetLeft / W; rec.wd.y = rec.el.offsetTop / H; rec.wd.w = rec.el.offsetWidth; rec.wd.h = rec.el.offsetHeight; }
  save();
  tvFocus(rec.item ? rec.el : rec.title);
}
function tvMoveKey(e) {
  const { rec } = tvMv, dir = TV_DIR[e.key];
  e.preventDefault(); e.stopPropagation();
  if (e.key === 'Enter' || e.key === ' ') { if (tvMv.mode === 'move') { tvMv.mode = 'size'; tvMvLabel(); } else tvMoveEnd(); return; }
  if (!dir) { if (tvBackKey(e) || e.key === 'Escape') tvMoveEnd(); return; }
  const { W, H } = boardSize(), st = Math.round(clamp(Math.min(W, H) * .04, 16, 60));
  const dx = dir === 'left' ? -st : dir === 'right' ? st : 0, dy = dir === 'up' ? -st : dir === 'down' ? st : 0;
  const { el, wd } = rec;
  if (rec.item) {
    if (tvMv.mode === 'move') { wd.x = clamp(wd.x + dx / W, 0, 1); wd.y = clamp(wd.y + dy / H, 0, 1); }
    else if (wd.type === 'sticker') wd.s.size = clamp(wd.s.size + (dx || -dy), 48, 420);
    else { wd.s.w = clamp(wd.s.w + dx, 30, 1400); wd.s.h = clamp(wd.s.h + dy, wd.s.k === 'line' ? 12 : 30, 1000); }
    placeItem(rec); return;
  }
  if (tvMv.mode === 'move') { const p = clampPos(el.offsetLeft + dx, el.offsetTop + dy, el.offsetWidth, el.offsetHeight); el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; }
  else { const def = T[wd.type]; el.style.width = clamp(el.offsetWidth + dx, def.minW || 180, W - el.offsetLeft) + 'px'; el.style.height = clamp(el.offsetHeight + dy, def.minH || 150, H - el.offsetTop) + 'px'; }
}

/* ---------- Back ---------- */
function tvBackKey(e) { return e.key === 'GoBack' || e.key === 'BrowserBack' || e.keyCode === 461 || e.keyCode === 10009; }
/* closes whatever is on top; false when nothing was open */
function closeTop() {
  if (tvMv) { tvMoveEnd(); return true; }
  if (palEl) { closePal(); return true; }
  const bp = app && app.querySelector('.bigpop'); if (bp) { bp.click(); return true; }
  if (sheetWrap) { closeSheet(); return true; }
  for (const r of live.values()) if (r.el && r.el.classList.contains('max')) { toggleMax(r); tvOn() && tvFocus(r.maxBtn); return true; }
  return false;
}
/* TV browsers turn the remote's Back button into "go back a page". One extra history step keeps VocaBoard open:
   Back closes the top window instead, and with nothing open it asks for a second press before leaving. */
let tvG = false, tvGT = 0;
function tvGuard() {
  if (tvG || !tvOn() || !app) return;
  const ua = navigator.userActivation; if (ua && !ua.hasBeenActive) return; // wait for the first button press
  try { history.pushState({ vbtv: 1 }, '', location.href); tvG = true; } catch (e) {}
}
function tvUnguard() { if (!tvG) return; tvG = false; try { history.back(); } catch (e) {} }
addEventListener('popstate', () => {
  if (!tvG) return;
  tvG = false;
  if (closeTop()) { tvGuard(); return; }
  toast('Press Back again to leave VocaBoard');
  clearTimeout(tvGT); tvGT = setTimeout(tvGuard, 3000);
});

/* ---------- keys ---------- */
function tvKeyCapture(e) {
  if (!tvOn() || e.altKey || e.ctrlKey || e.metaKey || !app || !app.isConnected) return;
  document.documentElement.classList.add('kb');
  if (!tvG) tvGuard();
  if (tvMv) { tvMoveKey(e); return; }
  const t = e.target, k = e.key;
  if (tvBackKey(e)) { if (closeTop()) { e.preventDefault(); e.stopPropagation(); } return; }
  if (k === 'ContextMenu' && !sheetWrap) { e.preventDefault(); openMenu(); return; }
  if (k === 'Enter') {
    const bp = app.querySelector('.bigpop'); if (bp) { e.preventDefault(); e.stopPropagation(); bp.click(); return; }
    if (t.classList && t.classList.contains('wg-t') && !t.isContentEditable) { e.preventDefault(); e.stopPropagation(); const w = t.closest('.wg'); tvMoveStart(w && live.get(w.dataset.id)); return; }
    if (t.classList && t.classList.contains('stk') && e.target === t) { e.preventDefault(); e.stopPropagation(); tvMoveStart(live.get(t.dataset.id)); return; }
    if (t.tagName === 'INPUT' && (t.type === 'checkbox' || t.type === 'radio')) { e.preventDefault(); t.click(); return; }
    if (t.tagName === 'SELECT' || (t.tagName === 'INPUT' && /^(date|time|color|datetime-local|month|week)$/.test(t.type))) { try { t.showPicker(); e.preventDefault(); } catch (err) {} return; }
    if (t.matches && t.matches('[role="button"]:not(button), .mm-item')) { e.preventDefault(); t.click(); }
    return;
  }
  const dir = TV_DIR[k]; if (!dir) return;
  if (textish(t)) { if (caretAtEdge(t, dir)) { e.preventDefault(); e.stopPropagation(); tvMove(dir); } return; }
  if (t.tagName === 'SELECT' || (isSlider(t) && (dir === 'up' || dir === 'down'))) { e.preventDefault(); e.stopPropagation(); tvMove(dir); }
  // other arrows go to the tool first (games, the timer dial); see tvKeyBubble
}
function tvKeyBubble(e) {
  if (!tvOn() || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
  const dir = TV_DIR[e.key]; if (!dir) return;
  const t = e.target; if (isSlider(t) || textish(t) || t.tagName === 'SELECT') return; // the caret or the slider moves
  if (tvMove(dir)) e.preventDefault();
}
function initTV() {
  addEventListener('keydown', tvKeyCapture, true);
  document.addEventListener('keydown', tvKeyBubble);
  document.addEventListener('pointerdown', () => document.documentElement.classList.remove('kb'), true);
  document.addEventListener('pointerdown', () => { if (!tvG) tvGuard(); });
  applyTV();
  if (tvOn() && !S.tvHint) { S.tvHint = 1; save(); setTimeout(() => toast('TV remote: the arrows move between buttons, OK presses, Back closes. On a tool’s name, press OK to move it.', { ms: 9000 }), 900); }
}
