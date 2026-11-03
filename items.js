/* ---------- Board items: stickers, shapes, sticky notes ---------- */
const ITEM_TYPES = new Set(['sticker', 'shape', 'note']);
const isItem = w => ITEM_TYPES.has(w.type);
const poly = (n, rot = -90) => { let d = ''; for (let i = 0; i < n; i++) { const a = (rot + i * 360 / n) * Math.PI / 180; d += (i ? 'L' : 'M') + (50 + 48 * Math.cos(a)).toFixed(1) + ' ' + (50 + 48 * Math.sin(a)).toFixed(1); } return d + 'Z'; };
const starD = (() => { let d = ''; for (let i = 0; i < 10; i++) { const a = (-90 + i * 36) * Math.PI / 180, r = i % 2 ? 20 : 48; d += (i ? 'L' : 'M') + (50 + r * Math.cos(a)).toFixed(1) + ' ' + (52 + r * Math.sin(a)).toFixed(1); } return d + 'Z'; })();
const SHP = {
  square: ['Square', 1, '<rect class="sf" x="2" y="2" width="96" height="96"/>'],
  rect: ['Rectangle', 1.6, '<rect class="sf" x="2" y="2" width="96" height="96"/>'],
  circle: ['Circle', 1, '<ellipse class="sf" cx="50" cy="50" rx="48" ry="48"/>'],
  oval: ['Oval', 1.5, '<ellipse class="sf" cx="50" cy="50" rx="48" ry="48"/>'],
  tri: ['Triangle', 1.1, '<path class="sf" d="M50 2L98 98H2Z"/>'],
  rtri: ['Right triangle', 1, '<path class="sf" d="M2 2V98H98Z"/><path d="M2 84H16V98" fill="none"/>'],
  diamond: ['Rhombus', .8, '<path class="sf" d="M50 2L98 50L50 98L2 50Z"/>'],
  para: ['Parallelogram', 1.6, '<path class="sf" d="M26 2H98L74 98H2Z"/>'],
  trap: ['Trapezium', 1.5, '<path class="sf" d="M26 2H74L98 98H2Z"/>'],
  pent: ['Pentagon', 1, `<path class="sf" d="${poly(5)}"/>`],
  hex: ['Hexagon', 1.1, `<path class="sf" d="${poly(6, 0)}"/>`],
  oct: ['Octagon', 1, `<path class="sf" d="${poly(8, 22.5)}"/>`],
  star: ['Star', 1, `<path class="sf" d="${starD}"/>`],
  heart: ['Heart', 1.1, '<path class="sf" d="M50 96C50 96 2 66 2 32A24 24 0 0 1 50 22A24 24 0 0 1 98 32C98 66 50 96 50 96Z"/>'],
  arrow: ['Arrow', 2, '<path class="sf" d="M2 34H62V6L98 50L62 94V66H2Z"/>'],
  line: ['Line', 8, '<path d="M1 50H99" fill="none"/>'],
  bubble: ['Speech bubble', 1.4, '<path class="sf" d="M12 3H88A9 9 0 0 1 97 12V62A9 9 0 0 1 88 71H42L18 96V71H12A9 9 0 0 1 3 62V12A9 9 0 0 1 12 3Z"/>'],
  cube: ['Cube', 1, '<path class="sf" d="M2 30H70V98H2Z"/><path class="sf s2" d="M2 30L30 2H98L70 30Z"/><path class="sf s3" d="M70 30L98 2V70L70 98Z"/>'],
  cuboid: ['Cuboid', 1.7, '<path class="sf" d="M2 34H78V98H2Z"/><path class="sf s2" d="M2 34L22 2H98L78 34Z"/><path class="sf s3" d="M78 34L98 2V66L78 98Z"/>'],
  cylinder: ['Cylinder', .8, '<path class="sf" d="M2 16V84A48 14 0 0 0 98 84V16"/><ellipse class="sf s2" cx="50" cy="16" rx="48" ry="14"/>'],
  cone: ['Cone', .9, '<path class="sf" d="M50 2L98 84A48 14 0 0 1 2 84Z"/><path d="M2 84A48 14 0 0 0 98 84" fill="none" stroke-dasharray="5 5"/>'],
  sphere: ['Sphere', 1, '<circle class="sf" cx="50" cy="50" r="48"/><path d="M2 50A48 15 0 0 0 98 50" fill="none"/><path d="M2 50A48 15 0 0 1 98 50" fill="none" stroke-dasharray="5 5"/>'],
  pyramid: ['Pyramid', 1, '<path class="sf" d="M50 2L98 78L62 98Z"/><path class="sf s2" d="M50 2L62 98L2 78Z"/>'],
};
const SHP_COLS = ['#2f6fe4', '#ef4f5b', '#1f9d55', '#f59e0b', '#8e4ec6', '#ec4899', '#0ea5b7', '#25223d', '#ffffff'];
const NOTE_COLS = ['butter', 'pink', 'mint', 'aqua', 'lav', 'peach'];
function shapeSvg(s) {
  const st = s.style || 'fill', col = s.col || SHP_COLS[0];
  const op = st === 'line' ? [0, 0, 0] : st === 'solid' ? [.92, 1, 1] : [.22, .36, .5];
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style="--fo:${op[0]};--fo2:${op[1]};--fo3:${op[2]}" fill="${col}" stroke="${st === 'solid' && col !== '#25223d' ? '#25223d' : col}">${(SHP[s.k] || SHP.square)[2]}</svg>`;
}
function itemBox(wd) { const s = wd.s; return wd.type === 'sticker' ? [s.size, s.size] : [s.w, s.h]; }
function placeItem(rec) {
  const { el, wd } = rec, { W, H } = boardSize(), [w, hh] = itemBox(wd);
  const cx = clamp(wd.x * W, Math.min(w / 2, W / 2), Math.max(W - w / 2, W / 2)), cy = clamp(wd.y * H, Math.min(hh / 2, H / 2), Math.max(H - hh / 2, H / 2));
  Object.assign(el.style, { left: (cx - w / 2) + 'px', top: (cy - hh / 2) + 'px', width: w + 'px', height: hh + 'px', zIndex: wd.z });
  if (rec.art) rec.art.style.rotate = (wd.s.r || 0) + 'deg';
}
function paintItem(rec) {
  const { wd, art } = rec, s = wd.s;
  if (wd.type === 'sticker') art.innerHTML = stkSvg(s.k);
  else if (wd.type === 'shape') { art.innerHTML = shapeSvg(s); rec.el.style.setProperty('--sc', s.col); }
  else if (wd.type === 'note') { rec.el.dataset.note = s.col; }
}
function mountItem(wd) {
  const el = h('div', { class: 'stk it-' + wd.type, 'data-id': wd.id, tabindex: '0', role: wd.type === 'note' ? 'group' : 'img', 'aria-label': { sticker: 'Sticker: ' + (STK_NAME[wd.s.k] || 'star'), shape: (SHP[wd.s.k] || SHP.square)[0], note: 'Sticky note' }[wd.type] });
  const art = h('div', { class: 'it-art' });
  const rec = { wd, el, art, item: true, ticks: [], cleanups: [] };
  el.append(art);
  if (wd.type === 'note') {
    const tx = h('div', { class: 'note-tx', contenteditable: 'true', spellcheck: 'true', dir: 'auto', 'data-ph': 'Write here…', html: cleanHtml(wd.s.html || '') });
    tx.addEventListener('input', () => { wd.s.html = cleanHtml(tx.innerHTML); save(); });
    tx.addEventListener('paste', e => { const x = e.clipboardData && e.clipboardData.getData('text/plain'); if (x != null) { e.preventDefault(); document.execCommand('insertText', false, x); } });
    art.append(h('i', { class: 'tape', 'aria-hidden': 'true' }), tx); rec.tx = tx;
  }
  paintItem(rec);
  const bar = h('div', { class: 'it-bar' });
  const keep = b => { b.addEventListener('pointerdown', e => e.stopPropagation()); return b; };
  if (wd.type === 'shape') bar.append(
    keep(h('button', { class: 'ib', type: 'button', title: 'Colour', 'aria-label': 'Colour', onclick: () => { wd.s.col = SHP_COLS[(SHP_COLS.indexOf(wd.s.col) + 1) % SHP_COLS.length]; paintItem(rec); save(); } }, h('i', { class: 'cdot', style: { background: 'var(--sc)' } }))),
    keep(ib('fill', 'Fill: outline, light, solid', () => { const S3 = ['line', 'fill', 'solid']; wd.s.style = S3[(S3.indexOf(wd.s.style || 'fill') + 1) % 3]; paintItem(rec); save(); })),
    keep(ib('rotate', 'Turn', () => { wd.s.r = ((wd.s.r || 0) + 15) % 360; placeItem(rec); save(); })));
  if (wd.type === 'note') {
    bar.append(keep(h('button', { class: 'ib', type: 'button', title: 'Note colour', 'aria-label': 'Note colour', onclick: () => { wd.s.col = NOTE_COLS[(NOTE_COLS.indexOf(wd.s.col) + 1) % NOTE_COLS.length]; paintItem(rec); save(); } }, h('i', { class: 'cdot', style: { background: 'var(--note)' } }))));
    const mic = keep(ib('mic', 'Voice typing', () => {
      if (rec.voice) { rec.voice.stop(); return; }
      const lang = S.vlang || 'en-GB';
      rec.voice = startVoice(lang, (txt, fin) => { if (!fin) return; rec.tx.focus(); const sel = getSelection(); if (!rec.tx.contains(sel.anchorNode)) { sel.selectAllChildren(rec.tx); sel.collapseToEnd(); } document.execCommand('insertText', false, (rec.tx.textContent && !/\s$/.test(rec.tx.textContent) ? ' ' : '') + txt.trim()); }, () => { rec.voice = null; mic.classList.remove('live'); });
      if (rec.voice) mic.classList.add('live');
    }));
    bar.append(mic);
    rec.cleanups.push(() => rec.voice && rec.voice.stop());
  }
  if (wd.type !== 'sticker') bar.append(keep(ib('copy', 'Duplicate', () => { const n = JSON.parse(JSON.stringify(wd)); n.id = uid(); n.x = Math.min(.95, wd.x + .03); n.y = Math.min(.95, wd.y + .04); n.z = ++zTop; board().widgets.push(n); mountItem(n); save(); })));
  bar.append(keep(ib('trash', 'Remove', () => removeWidget(wd.id))));
  const rz = h('div', { class: 'stk-r', 'aria-hidden': 'true' });
  el.append(bar, rz);
  live.set(wd.id, rec); placeItem(rec); stkEl.append(el);
  el.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    const editing = wd.type === 'note' && e.target.closest('.note-tx') && el.classList.contains('sel');
    document.querySelectorAll('.stk.sel').forEach(x => x !== el && x.classList.remove('sel'));
    el.classList.add('sel'); el.classList.toggle('below', el.getBoundingClientRect().top < 70);
    wd.z = ++zTop; el.style.zIndex = wd.z;
    if (editing) return;
    e.preventDefault(); e.stopPropagation(); el.focus({ preventScroll: true });
    const resizing = !!e.target.closest('.stk-r');
    const r0 = el.getBoundingClientRect(), cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
    const sx = e.clientX, sy = e.clientY, x0 = el.offsetLeft, y0 = el.offsetTop, [w0, h0] = itemBox(wd), d0 = Math.hypot(sx - cx, sy - cy) || 1;
    let moved = false;
    el.setPointerCapture(e.pointerId);
    const mv = ev => {
      if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 3) moved = true;
      if (resizing) {
        if (wd.type === 'sticker') wd.s.size = clamp(w0 * Math.hypot(ev.clientX - cx, ev.clientY - cy) / d0, 48, 420);
        else { wd.s.w = clamp(w0 + ev.clientX - sx, wd.s.k === 'line' ? 40 : 30, 1400); wd.s.h = clamp(h0 + ev.clientY - sy, wd.s.k === 'line' ? 12 : 30, 1000); }
        const [w, hh] = itemBox(wd); const { W, H } = boardSize();
        if (wd.type === 'sticker') placeItem(rec); else { wd.x = (x0 + w / 2) / W; wd.y = (y0 + hh / 2) / H; placeItem(rec); }
      } else { el.style.left = (x0 + ev.clientX - sx) + 'px'; el.style.top = (y0 + ev.clientY - sy) + 'px'; }
    };
    const up = () => {
      el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      const { W, H } = boardSize(), [w, hh] = itemBox(wd);
      if (!resizing) { wd.x = (el.offsetLeft + w / 2) / W; wd.y = (el.offsetTop + hh / 2) / H; }
      placeItem(rec); save();
      if (!moved && !resizing && wd.type === 'note' && rec.tx) { rec.tx.focus(); }
    };
    el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  });
  el.addEventListener('keydown', e => { if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.closest('.note-tx')) removeWidget(wd.id); });
}
function addItem(type, s) {
  const b = board(), { W, H } = boardSize(), k = scaleK();
  const n = b.widgets.filter(isItem).length % 6;
  const wd = { id: uid(), type, x: .5 + (n - 2.5) * .035, y: .45 + (n % 3 - 1) * .05, z: ++zTop, s };
  if (type === 'sticker') s.size = s.size || Math.round((STK_WORDY.has(s.k) ? 150 : 120) * k); // word stickers start a little bigger so they can be read
  b.widgets.push(wd); mountItem(wd); updateEmpty(); save();
  const rec = live.get(wd.id);
  document.querySelectorAll('.stk.sel').forEach(x => x.classList.remove('sel'));
  rec.el.classList.add('sel');
  Snd.play('pop');
  return rec;
}
function addSticker(k) { addItem('sticker', { k, r: Math.round(Math.random() * 24 - 12) }); }
let shapeColIdx = 0;
function addShape(k) {
  const ratio = SHP[k][1], base = Math.round(170 * scaleK());
  const w = k === 'line' ? Math.round(320 * scaleK()) : Math.round(ratio >= 1 ? base * Math.min(ratio, 2) : base), hh = k === 'line' ? 24 : Math.round(ratio >= 1 ? base : base / ratio);
  addItem('shape', { k, w, h: hh, r: 0, col: SHP_COLS[shapeColIdx++ % 7], style: 'fill' });
}
let noteColIdx = 0;
function addNote(text) {
  const sz = Math.round(220 * scaleK());
  const rec = addItem('note', { html: text || '', col: NOTE_COLS[noteColIdx++ % NOTE_COLS.length], w: sz, h: sz, r: Math.round(Math.random() * 6 - 3) });
  if (!text) setTimeout(() => rec.tx && rec.tx.focus(), 60);
}
function openShapes() {
  sheet('Shapes', body => {
    const grid = (keys) => h('div', { class: 'stk-grid shp-grid' }, keys.map(k => h('button', { type: 'button', title: SHP[k][0], 'aria-label': 'Add ' + SHP[k][0], onclick: () => { addShape(k); closeSheet(); } },
      h('span', { class: 'shp-th', html: shapeSvg({ k, col: '#2f6fe4', style: 'fill' }), style: { aspectRatio: Math.min(Math.max(SHP[k][1], .7), 2.4) } }), h('small', {}, SHP[k][0]))));
    body.append(h('p', { class: 'note' }, 'Tap a shape to put it on the board. Select it to change its colour, fill or angle, and drag the corner to resize.'),
      h('div', { class: 'sec' }, h('h3', {}, 'Flat shapes'), grid(['square', 'rect', 'circle', 'oval', 'tri', 'rtri', 'diamond', 'para', 'trap', 'pent', 'hex', 'oct', 'star', 'heart', 'arrow', 'line', 'bubble'])),
      h('div', { class: 'sec' }, h('h3', {}, 'Solid shapes'), grid(['cube', 'cuboid', 'cylinder', 'cone', 'sphere', 'pyramid'])));
  });
}
