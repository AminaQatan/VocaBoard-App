/* ---------- Shell ---------- */
const DOCK = [
  ['timer', 'Timer'], ['vtimer', 'Visual timer'], ['stopwatch', 'Stopwatch'], ['speech', 'Speech timer'], ['clock', 'Clock'], ['calendar', 'Calendar'], ['countdown', 'Countdown'], ['timetable', 'Timetable'], '|',
  ['sound', 'Sound level'], ['work', 'Work symbols'], ['traffic', 'Traffic light'], '|',
  ['attend', 'Attendance'], ['randomizer', 'Name picker'], ['wheel', 'Spin the wheel'], ['groups', 'Groups'], ['poll', 'Poll'], ['wall', 'Idea wall'], ['mindmap', 'Brainstorm'], ['exit', 'Exit ticket'], ['scoreboard', 'Scoreboard'], '|',
  ['dict', 'Dictionary'], ['family', 'Word family'], ['tongue', 'Tongue twisters'], '|',
  ['hangman', 'Hangman'], ['chess', 'Chess'], ['dice', 'Dice'], ['calc', 'Calculator'], '|',
  ['text', 'Text'], ['note', 'Sticky note'], ['draw', 'Draw'], ['autodraw', 'Auto draw'], ['shapes', 'Shapes'], ['room', 'Class layout'], '|',
  ['image', 'Image'], ['pdf', 'PDF'], ['video', 'Video'], ['webcam', 'Webcam'], ['qr', 'QR code'], ['link', 'Link'], ['embed', 'Website'], '|',
  ['background', 'Background'], ['stickers', 'Stickers'],
];
const DOCK_ACT = { background: () => openBackground(), stickers: () => openStickers(), shapes: () => openShapes(), note: () => addNote(), autodraw: () => addWidget('draw', { auto: true, _title: 'Auto draw' }) };
function buildShell(root) {
  app = h('div', { id: 'app' });
  bgEl = h('div', { id: 'bg', 'aria-hidden': 'true' });
  boardEl = h('main', { id: 'board', 'aria-label': 'Board' });
  stkEl = h('div', { id: 'stk' });
  toastEl = h('div', { id: 'toast', 'aria-live': 'polite' });
  bnameEl = h('button', { class: 'bname', type: 'button', title: 'Boards', onclick: () => openMenu(true) });
  const left = h('div', { class: 'top l' }, h('div', { class: 'pill' }, h('button', { class: 'brand', type: 'button', 'aria-label': 'Open menu', onclick: () => openMenu() }, h('span', { html: LOGO, style: { display: 'contents', color: 'var(--ink)' } }), h('span', { class: 'bt' }, 'VocaBoard'))));
  const right = h('div', { class: 'top r' }, h('div', { class: 'pill' },
    h('button', { class: 'ib', id: 'bprev', type: 'button', title: 'Previous board', 'aria-label': 'Previous board', onclick: () => stepBoard(-1) }, svg('left')), bnameEl,
    h('button', { class: 'ib', id: 'bnext', type: 'button', title: 'Next board', 'aria-label': 'Next board', onclick: () => stepBoard(1) }, svg('right')),
    ib('download', 'Save the board as a picture or PDF', openExport), ib('dockhide', 'Hide the tool bar', () => setDock(false)), ib('fs', 'Full screen', goFull)));
  dockEl = h('nav', { id: 'dock', 'aria-label': 'Tools' }, DOCK.map(d => d === '|' ? h('i', { class: 'dsep', 'aria-hidden': 'true' }) :
    h('button', { class: 'tool', type: 'button', title: d[1], onclick: () => DOCK_ACT[d[0]] ? DOCK_ACT[d[0]]() : addWidget(d[0]) }, svg((T[d[0]] && T[d[0]].icon) || d[0]), h('span', {}, d[1]))));
  dockEl.prepend(h('button', { class: 'dock-arrow l', type: 'button', 'aria-label': 'More tools to the left', onclick: () => dockEl.scrollBy({ left: -dockEl.clientWidth * .6, behavior: 'smooth' }) }, svg('left')));
  dockEl.append(h('button', { class: 'dock-arrow r', type: 'button', 'aria-label': 'More tools to the right', onclick: () => dockEl.scrollBy({ left: dockEl.clientWidth * .6, behavior: 'smooth' }) }, svg('right')));
  const dockOvf = () => { const o = dockEl.scrollWidth > dockEl.clientWidth + 4; dockEl.classList.toggle('ovf', o); dockEl.classList.toggle('at-start', dockEl.scrollLeft < 8); dockEl.classList.toggle('at-end', dockEl.scrollLeft + dockEl.clientWidth > dockEl.scrollWidth - 8); };
  dockEl.addEventListener('scroll', dockOvf, { passive: true }); addEventListener('resize', dockOvf); setTimeout(dockOvf, 50);
  dockEl.addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { dockEl.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
  const tab = h('button', { id: 'dockTab', type: 'button', hidden: true, onclick: () => setDock(true) }, svg('up'), 'Tools');
  app.append(bgEl, boardEl, stkEl, left, right, dockEl, tab, toastEl);
  root.append(app);
}
function setDock(on) { S.dock = on; save(); dockEl.classList.toggle('hide', !on); $('#dockTab').hidden = on; }

function wireEvents() {
  let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(relayout, 80); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    closeTop();
  });
  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('.stk')) document.querySelectorAll('.stk.sel').forEach(x => x.classList.remove('sel'));
  }, true);
  document.addEventListener('pointerdown', function unlock() { Snd.ctx(); document.removeEventListener('pointerdown', unlock); });
  document.addEventListener('visibilitychange', wake);
  // drop files onto the board
  app.addEventListener('dragover', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
  app.addEventListener('drop', e => {
    const files = e.dataTransfer && e.dataTransfer.files; if (!files || !files.length) return;
    e.preventDefault(); [...files].slice(0, 6).forEach((f, i) => addFile(f, { x: e.clientX + i * 30, y: e.clientY + i * 30 }));
  });
  // paste pictures, links or text onto the board
  document.addEventListener('paste', e => {
    const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const cd = e.clipboardData; if (!cd) return;
    const file = [...(cd.files || [])][0];
    if (file) { e.preventDefault(); addFile(file); return; }
    const text = (cd.getData('text/plain') || '').trim(); if (!text) return;
    e.preventDefault();
    if (isUrl(text)) { const u = normUrl(text); ytId(u) ? addWidget('video', { yt: ytId(u) }) : addWidget('link', { url: u, label: hostOf(u) }); }
    else addWidget('text', { html: text.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])).replace(/\n/g, '<br>') });
  });
}

function start() {
  S = load();
  applyPrefs();
  const qs = new URLSearchParams(location.search);
  if (qs.has('join')) { document.documentElement.classList.add('joining'); startJoin(qs); return; }
  buildShell(document.getElementById('vocaboard') || document.body);
  setDock(S.dock !== false);
  boardEl.classList.toggle('stack', isStack());
  if (S.first) seedExample();
  showBoard();
  wireEvents();
  initTV();
  wake();
  setInterval(() => { for (const f of tickers) { try { f(); } catch (e) { console.error(e); } } }, 100);
  if (APP && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
