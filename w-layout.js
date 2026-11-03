/* ---------- Classroom layout: ready-made seating arrangements students can follow on their own ---------- */
const GROUP_COLS = ['#9ec5ff', '#ffb3c7', '#a9e98e', '#ffe07f', '#c6a8ff', '#ffbf8f', '#74e0e4', '#f5a8ff'];
FURN.seat = ['Desk and chair', 66, 92, (w, h, it) => `<rect x="-33" y="-46" width="66" height="44" rx="5" fill="#e9c48f"/><rect x="-22" y="4" width="44" height="38" rx="9" fill="${it && it.g != null ? GROUP_COLS[it.g % GROUP_COLS.length] : '#9ec5ff'}"/><rect x="-22" y="35" width="44" height="9" rx="4" fill="#6f9fe6"/>`];
FURN.ctable = ['Meeting table', 300, 130, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="#e9c48f"/>`];
const LAYOUTS = {
  rows: ['Rows', 'Sit in rows facing the board, one student at each desk.'],
  pairs: ['Pairs', 'Sit next to your partner. Two desks side by side, facing the board.'],
  ushape: ['U-shape', 'Make a U. Everyone faces the middle so we can all see each other.'],
  doubleu: ['Double U', 'Two U shapes, one inside the other. Everyone faces the middle.'],
  circle: ['Circle', 'Make one big circle. Everyone faces the centre.'],
  half: ['Half circle', 'Make a half circle facing the board.'],
  groups4: ['Groups of 4', 'Two desks facing two desks. Find your group colour and sit together.'],
  groups6: ['Groups of 6', 'Three desks facing three desks. Find your group colour and sit together.'],
  stations: ['Stations', 'Go to your station and sit around the table.'],
  debate: ['Debate', 'Two teams face each other. Team A on the left, Team B on the right.'],
  chevron: ['V-shape', 'Rows angled towards the board, with an aisle in the middle.'],
  conference: ['Meeting table', 'One long table. Sit around it like a meeting.'],
  exam: ['Exam', 'One student at each desk, spaced apart. Face the board and work alone.'],
};
const faceTo = (x, y, tx, ty) => Math.atan2(tx - x, -(ty - y)) * 180 / Math.PI;
const norm360 = r => ((Math.round(r) % 360) + 360) % 360;
function genLayout(kind, n) {
  const it = [], lab = [];
  const seat = (x, y, r, g) => it.push({ k: 'seat', x, y, r: norm360(r), g });
  const chair = (x, y, r, g) => it.push({ k: 'chair', x, y, r: norm360(r), g });
  n = Math.max(1, n);
  const U = (n, Hw, La) => {
    const per = 92, nArm = Math.max(1, Math.round(n * La / (2 * La + 2 * Hw))), nBack = Math.max(0, n - 2 * nArm);
    La = Math.max(La, (nArm - 1) * per); Hw = Math.max(Hw, (nBack * per) / 2 + 60);
    for (let i = 0; i < nArm; i++) { const y = nArm === 1 ? La / 2 : i * La / (nArm - 1); seat(-Hw, y, 90); }
    for (let i = 0; i < nBack; i++) { const x = nBack === 1 ? 0 : -Hw + 70 + i * (2 * Hw - 140) / (nBack - 1); seat(x, La + 80, 0); }
    for (let i = nArm - 1; i >= 0; i--) { const y = nArm === 1 ? La / 2 : i * La / (nArm - 1); seat(Hw, y, 270); }
    return { Hw, La };
  };
  switch (kind) {
    case 'rows': case 'exam': {
      const exam = kind === 'exam', cols = clamp(Math.ceil(Math.sqrt(n * (exam ? 1.2 : 1.5))), 3, exam ? 7 : 8), rows = Math.ceil(n / cols), dx = exam ? 150 : 92, dy = exam ? 155 : 125;
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols), inRow = r === rows - 1 ? n - r * cols : cols, c = i % cols;
        const aisle = !exam && cols >= 6 ? (c >= cols / 2 ? 45 : -45) : 0;
        seat((c - (inRow - 1) / 2) * dx + (inRow === cols ? aisle : 0), r * dy, 0);
      }
      break;
    }
    case 'pairs': {
      const pairs = Math.ceil(n / 2), per = clamp(Math.ceil(Math.sqrt(pairs * 1.1)), 2, 4);
      for (let i = 0; i < n; i++) { const p = Math.floor(i / 2), r = Math.floor(p / per), inRow = Math.min(per, pairs - r * per), c = p % per; seat((c - (inRow - 1) / 2) * 220 + (i % 2 ? 35 : -35), r * 130, 0); }
      break;
    }
    case 'ushape': { const P = n * 95; U(n, P * .26, P * .2); break; }
    case 'doubleu': {
      const n1 = Math.round(n * .42), n2 = n - n1, P1 = n1 * 95;
      const inner = U(n1, P1 * .26, P1 * .2); const pre = it.splice(0);
      U(n2, inner.Hw + 135, inner.La + 135);
      it.push(...pre.map(s => Object.assign(s, { y: s.y + 20 })));
      break;
    }
    case 'circle': { const R = Math.max(140, n * 92 / (2 * Math.PI)); for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / n, x = R * Math.cos(a), y = R * Math.sin(a); seat(x, y, faceTo(x, y, 0, 0)); } break; }
    case 'half': {
      let left = n, R = 240;
      while (left > 0) { const cap = Math.max(2, Math.floor(Math.PI * R / 92) + 1), k = Math.min(cap, left); for (let i = 0; i < k; i++) { const a = Math.PI - (k === 1 ? Math.PI / 2 : i * Math.PI / (k - 1)), x = R * Math.cos(a), y = R * Math.sin(a); seat(x, y, faceTo(x, y, 0, -60)); } left -= k; R += 135; }
      break;
    }
    case 'groups4': case 'groups6': {
      const size = kind === 'groups4' ? 4 : 6, cols = size / 2, G = Math.ceil(n / size), per = clamp(Math.ceil(Math.sqrt(G * 1.4)), 1, 5);
      const cw = cols * 70 + 140, chh = 330;
      for (let g = 0; g < G; g++) {
        const r = Math.floor(g / per), inRow = Math.min(per, G - r * per), cx = ((g % per) - (inRow - 1) / 2) * cw, cy = r * chh, k = Math.min(size, n - g * size);
        for (let j = 0; j < k; j++) { const top = j < cols, c = top ? j : j - cols; seat(cx + (c - (cols - 1) / 2) * 70, cy + (top ? -47 : 47), top ? 180 : 0, g); }
        lab.push({ x: cx, y: cy - 125, t: 'Group ' + (g + 1), g });
      }
      break;
    }
    case 'stations': {
      const G = clamp(Math.ceil(n / 6), 2, 6), per = G <= 4 ? 2 : 3, base = Math.floor(n / G), extra = n % G; let made = 0;
      for (let g = 0; g < G; g++) {
        const k = base + (g < extra ? 1 : 0), cx = ((g % per) - (per - 1) / 2) * 360, cy = Math.floor(g / per) * 340, R = 105;
        it.push({ k: 'table', x: cx, y: cy, r: 0, g });
        for (let j = 0; j < k; j++) { const a = -Math.PI / 2 + j * 2 * Math.PI / k, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a); chair(x, y, faceTo(x, y, cx, cy) + 180, g); }
        lab.push({ x: cx, y: cy - 165, t: 'Station ' + (g + 1), g }); made += k;
      }
      break;
    }
    case 'debate': {
      const half = Math.ceil(n / 2), cols = half > 12 ? 3 : 2, rowsN = Math.ceil(half / cols);
      for (let i = 0; i < n; i++) { const right = i >= half, j = right ? i - half : i, c = Math.floor(j / rowsN), r = j % rowsN; seat((right ? 1 : -1) * (150 + c * 115), r * 90, right ? 270 : 90, right ? 1 : 0); }
      lab.push({ x: -150 - (cols - 1) * 57, y: -110, t: 'Team A', g: 0 }, { x: 150 + (cols - 1) * 57, y: -110, t: 'Team B', g: 1 });
      break;
    }
    case 'chevron': {
      const half = Math.ceil(n / 2), cols = clamp(Math.ceil(Math.sqrt(half)), 2, 4);
      for (let i = 0; i < n; i++) { const right = i >= half, j = right ? i - half : i, r = Math.floor(j / cols), c = j % cols, sgn = right ? 1 : -1; seat(sgn * (110 + c * 88), r * 130 + c * 26, sgn * -22); }
      break;
    }
    case 'conference': {
      const side = Math.ceil((n - (n > 6 ? 2 : 0)) / 2), ends = n > 6 ? 2 : 0, w = Math.max(200, side * 78 + 40);
      it.push({ k: 'ctable', x: 0, y: 0, r: 0, w, h: 130 });
      let k = 0;
      for (let i = 0; i < side && k < n; i++, k++) chair(-w / 2 + 50 + i * (w - 100) / Math.max(1, side - 1), -95, 0);
      for (let i = 0; i < side && k < n - ends; i++, k++) chair(-w / 2 + 50 + i * (w - 100) / Math.max(1, side - 1), 95, 180);
      if (ends && k < n) { chair(-w / 2 - 55, 0, 270); k++; }
      if (ends && k < n) { chair(w / 2 + 55, 0, 90); k++; }
      break;
    }
  }
  return { items: it, labels: lab };
}
function seededShuffle(a, seed) { a = a.slice(); let s = seed || 1; const r = () => (s = s * 16807 % 2147483647) / 2147483647; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function shortNames(list) {
  const first = list.map(n => String(n).trim().split(/\s+/)), count = {};
  first.forEach(p => { count[p[0]] = (count[p[0]] || 0) + 1; });
  return first.map(p => count[p[0]] > 1 && p[1] ? `${p[0]} ${p[1][0]}.` : p[0]);
}
function layoutThumb(kind) {
  const { items } = genLayout(kind, 16); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  items.forEach(i => { x0 = Math.min(x0, i.x); y0 = Math.min(y0, i.y); x1 = Math.max(x1, i.x); y1 = Math.max(y1, i.y); });
  const m = 70, vb = `${x0 - m} ${y0 - m - 60} ${x1 - x0 + 2 * m} ${y1 - y0 + 2 * m + 60}`;
  return `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect x="${(x0 + x1) / 2 - 90}" y="${y0 - m - 50}" width="180" height="16" rx="6" fill="currentColor" opacity=".5"/>${items.map(i => i.k === 'ctable' ? `<rect x="${i.x - i.w / 2}" y="${i.y - i.h / 2}" width="${i.w}" height="${i.h}" rx="16" fill="#e9c48f"/>` : i.k === 'table' ? `<circle cx="${i.x}" cy="${i.y}" r="55" fill="#e9c48f"/>` : `<g transform="translate(${i.x} ${i.y}) rotate(${i.r})"><rect x="-30" y="-42" width="60" height="40" rx="8" fill="#e9c48f"/><rect x="-20" y="4" width="40" height="34" rx="10" fill="${i.g != null ? GROUP_COLS[i.g % 8] : '#9ec5ff'}"/></g>`).join('')}</svg>`;
}
const LAYOUT_THUMBS = {};

T.room = {
  title: 'Classroom layout', icon: 'room', w: 900, h: 640, sh: 640, minW: 320, minH: 320, edit: true,
  init: () => ({ v2: true, W: 900, L: 800, floor: 'wood', layout: 'ushape', n: 20, cls: (S.classes.find(x => x.names.length) || {}).id || null, label: 'names', seed: 0, present: false, items: [{ id: uid(), k: 'board', x: 450, y: 14, r: 0, label: '' }, { id: uid(), k: 'teacher', x: 760, y: 105, r: 0, label: '' }, { id: uid(), k: 'door', x: 60, y: 140, r: 270, label: '' }], labels: [] }),
  mount(c) {
    const s = c.s, rt = c.rt();
    s.items = s.items || []; s.labels = s.labels || [];
    if (!s.v2) {
      if (s._title === 'Room designer (example)') { delete s._title; s.items = T.room.init().items; const t = c.el.querySelector('.wg-t'); if (t) t.textContent = 'Classroom layout'; }
      else if (s.items.some(i => !i.lay && (i.k === 'desk' || i.k === 'chair'))) s.layout = null;
      s.v2 = true; save();
    }
    const cls = s.cls ? S.classes.find(x => x.id === s.cls) : null;
    if (s.cls && !cls) s.cls = null;
    const names = cls ? presentOf(cls) : [];
    const seatCount = () => cls && names.length ? names.length : s.n;
    if (c.editing) {
      c.body.append(h('div', { class: 'form' },
        h('div', { class: 'two' },
          field('Room width (m)', h('input', { class: 'inp', id: 'rmw-' + c.wd.id, type: 'number', min: 3, max: 40, step: .5, value: String(s.W / 100), onchange: e => { s.W = clamp(Math.round(+e.target.value * 100) || 900, 300, 4000); s.minW = s.W; save(); } })),
          field('Room length (m)', h('input', { class: 'inp', id: 'rml-' + c.wd.id, type: 'number', min: 3, max: 40, step: .5, value: String(s.L / 100), onchange: e => { s.L = clamp(Math.round(+e.target.value * 100) || 800, 300, 4000); s.minL = s.L; save(); } }))),
        h('p', { class: 'note' }, 'If a layout needs more space for your class, the room grows to fit it.'),
        field('Floor', seg([['wood', 'Wood'], ['tile', 'Tiles'], ['carpet', 'Carpet'], ['plain', 'Plain']], s.floor, v => { s.floor = v; save(); c.rerender(); })),
        h('div', { class: 'row' }, confirmBtn('Remove all furniture', 'Tap again to remove', () => { s.items = []; s.labels = []; s.layout = null; save(); c.edit(false); })),
        btn('Done', () => { if (s.layout) apply(false); c.edit(false); }, 'btn pri')));
      return;
    }
    /* build the chosen layout into the room */
    function apply(animate = true) {
      if (!s.layout || !LAYOUTS[s.layout]) return;
      const { items, labels } = genLayout(s.layout, seatCount());
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      items.forEach(i => { const e = i.k === 'ctable' ? Math.max(i.w, i.h) / 2 : i.k === 'table' ? 60 : 50; x0 = Math.min(x0, i.x - e); y0 = Math.min(y0, i.y - e); x1 = Math.max(x1, i.x + e); y1 = Math.max(y1, i.y + e); });
      labels.forEach(l => { y0 = Math.min(y0, l.y - 30); x0 = Math.min(x0, l.x - 80); x1 = Math.max(x1, l.x + 80); });
      const FRONT = 200, M = 70;
      s.W = Math.max(s.minW || 900, Math.ceil((x1 - x0 + 2 * M) / 50) * 50);
      s.L = Math.max(s.minL || 800, Math.ceil((y1 - y0 + FRONT + M) / 50) * 50);
      const ox = s.W / 2 - (x0 + x1) / 2, oy = FRONT + Math.max(0, (s.L - FRONT - M - (y1 - y0)) / 2) - y0;
      const pool = {}; s.items.filter(i => i.lay).forEach(i => (pool[i.k] = pool[i.k] || []).push(i));
      if (animate) rt.prev = Object.fromEntries(s.items.map(i => [i.id, { x: i.x, y: i.y, r: i.r }]));
      const keep = s.items.filter(i => !i.lay);
      const made = items.map((i, idx) => { const old = pool[i.k] && pool[i.k].shift(); return { id: old ? old.id : uid(), k: i.k, x: Math.round(i.x + ox), y: Math.round(i.y + oy), r: i.r, g: i.g, w: i.w, h: i.h, lay: true, seatNo: i.k === 'seat' || i.k === 'chair' ? idx : undefined, label: '' }; });
      let sn = 0; made.forEach(m => { if (m.seatNo != null) m.seatNo = sn++; });
      keep.forEach(i => {
        if (i.k === 'board') { i.x = s.W / 2; i.y = 14; i.r = 0; }
        else if (i.k === 'teacher') { i.x = s.W - 130; i.y = 105; i.r = 0; }
        else if (i.k === 'door') { i.x = 60; i.y = 140; i.r = 270; }
        else { i.x = clamp(i.x, 20, s.W - 20); i.y = clamp(i.y, 20, s.L - 20); }
      });
      s.items = keep.concat(made);
      s.labels = labels.map(l => ({ x: Math.round(l.x + ox), y: Math.round(l.y + oy), t: l.t, g: l.g }));
      save();
    }
    if (s.layout && !s.items.some(i => i.lay)) apply(false);
    if (s.layout && s.items.filter(i => i.lay && (i.k === 'seat' || i.k === 'chair')).length !== seatCount()) apply(false);
    const order = s.seed ? seededShuffle(names, s.seed) : names, shortN = shortNames(order);
    const seatLabel = no => s.label === 'none' ? '' : s.label === 'names' && shortN[no] ? shortN[no] : String(no + 1);
    let sel = null;
    const svgW = h('div', { class: 'rm-plan' });
    const tools = h('div', { class: 'rm-sel', hidden: true });
    const count = h('span', { class: 'note' });
    const floors = { wood: '<pattern id="fl" width="120" height="30" patternUnits="userSpaceOnUse"><rect width="120" height="30" fill="#ead2ad"/><path d="M0 30H120M60 0V30" stroke="#d8bb90" stroke-width="2"/></pattern>', tile: '<pattern id="fl" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="#eef1f4"/><path d="M0 0H50V50" fill="none" stroke="#d3d9df" stroke-width="2"/></pattern>', carpet: '<pattern id="fl" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#cfe0f2"/><circle cx="20" cy="20" r="2" fill="#bcd1e8"/></pattern>', plain: '<pattern id="fl" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="#fbfbfd"/><path d="M0 0H50V50" fill="none" stroke="#eceef3" stroke-width="1.5"/></pattern>' };
    const TAGS = { board: 'Board', teacher: 'Teacher', door: 'Door', screen: 'Screen' };
    const tf = (x, y, r) => `transform:translate(${x}px,${y}px) rotate(${r || 0}deg)`;
    function draw() {
      const fs = Math.max(15, Math.min(s.W, s.L) / 34), prev = rt.prev; rt.prev = null;
      svgW.innerHTML = `<svg viewBox="-30 -30 ${s.W + 60} ${s.L + 60}" preserveAspectRatio="xMidYMid meet"><defs>${floors[s.floor] || floors.wood}</defs>
        <rect x="0" y="0" width="${s.W}" height="${s.L}" fill="url(#fl)"/>
        <g stroke="${INK}" stroke-width="2" stroke-linejoin="round">${s.items.map(it => {
          const f = FURN[it.k]; if (!f) return '';
          const w = it.w || f[1], hh = it.h || f[2], p = prev && prev[it.id], r0 = p ? p.r : it.r || 0;
          const rFin = p ? r0 + ((((it.r || 0) - r0) % 360) + 540) % 360 - 180 : it.r || 0; it._rd = rFin;
          const lbl = it.seatNo != null ? seatLabel(it.seatNo) : TAGS[it.k] || it.label || '';
          const big = it.seatNo != null, lsz = big ? Math.min(fs * 1.05, 62 / Math.max(2.4, String(lbl).length * .56)) : fs * .8;
          return `<g data-id="${it.id}" class="rm-it${it.id === sel ? ' on' : ''}${!p && prev ? ' new' : ''}" style="${p ? tf(p.x, p.y, r0) : tf(it.x, it.y, rFin)}">${f[3](w, hh, it)}${it.id === sel ? `<rect class="rm-hl" x="${-w / 2 - 8}" y="${-hh / 2 - 8}" width="${w + 16}" height="${hh + 16}" rx="8" fill="none"/>` : ''}${lbl ? `<text class="rm-lbl${big ? ' seat' : ''}" transform="rotate(${-rFin})" y="${fs * .35}" font-size="${lsz.toFixed(1)}" stroke-width="${(lsz / 4).toFixed(1)}">${String(lbl).replace(/[<&]/g, '')}</text>` : ''}</g>`;
        }).join('')}</g>
        <g class="rm-glbl" font-size="${fs * 1.25}">${s.labels.map(l => `<g transform="translate(${l.x} ${l.y})"><rect x="${-fs * 3.4}" y="${-fs * .95}" width="${fs * 6.8}" height="${fs * 1.6}" rx="${fs * .8}" fill="${GROUP_COLS[(l.g || 0) % 8]}" stroke="${INK}" stroke-width="2"/><text y="${fs * .4}">${l.t}</text></g>`).join('')}</g>
        <rect x="-8" y="-8" width="${s.W + 16}" height="${s.L + 16}" fill="none" stroke="#4b4f63" stroke-width="16"/></svg>`;
      if (prev) requestAnimationFrame(() => requestAnimationFrame(() => svgW.querySelectorAll('.rm-it').forEach(g => { const it = s.items.find(x => x.id === g.dataset.id); if (it) g.style.transform = `translate(${it.x}px,${it.y}px) rotate(${it._rd}deg)`; })));
      const seats = s.items.filter(it => it.seatNo != null).length;
      count.textContent = `${seats} seats · room ${(s.W / 100).toFixed(1)} × ${(s.L / 100).toFixed(1)} m`;
      const it = s.items.find(x => x.id === sel); tools.hidden = !it || !!s.present;
      if (it) {
        const lab = h('input', { class: 'inp', id: 'rmlab-' + c.wd.id, value: it.label || '', placeholder: 'Label', 'aria-label': 'Label', maxlength: 24, oninput: e => { it.label = e.target.value; save(); clearTimeout(lab._t); lab._t = setTimeout(draw, 400); } });
        tools.replaceChildren(...[h('b', {}, FURN[it.k][0]), it.seatNo == null ? lab : h('span', { class: 'note' }, 'Seat ' + (it.seatNo + 1) + (order[it.seatNo] ? ': ' + order[it.seatNo] : '')),
          ib('rotate', 'Turn', () => { it.r = norm360((it.r || 0) + 45); save(); draw(); }, 'btn sm ic'),
          it.lay ? null : ib('copy', 'Duplicate', () => { const n = Object.assign({}, it, { id: uid(), x: it.x + 30, y: it.y + 30 }); s.items.push(n); sel = n.id; save(); draw(); }, 'btn sm ic'),
          it.lay ? null : ib('trash', 'Remove', () => { s.items = s.items.filter(x => x !== it); sel = null; save(); draw(); }, 'btn sm ic')].filter(Boolean));
      }
    }
    const svgPt = (svgEl, e) => { const p = svgEl.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svgEl.getScreenCTM().inverse()); };
    svgW.addEventListener('pointerdown', e => {
      if (s.present) return;
      const svgEl = svgW.querySelector('svg'); if (!svgEl) return;
      const g = e.target.closest('.rm-it');
      if (!g) { if (sel) { sel = null; draw(); } return; }
      e.preventDefault(); const it = s.items.find(x => x.id === g.dataset.id); if (!it) return;
      if (sel !== it.id) { sel = it.id; draw(); }
      const node = () => svgW.querySelector(`[data-id="${it.id}"]`);
      const p0 = svgPt(svgEl, e), x0 = it.x, y0 = it.y; svgW.setPointerCapture(e.pointerId); svgW.classList.add('dragging');
      const mv = ev => { const p = svgPt(svgEl, ev); it.x = clamp(Math.round((x0 + p.x - p0.x) / 5) * 5, 0, s.W); it.y = clamp(Math.round((y0 + p.y - p0.y) / 5) * 5, 0, s.L); const n = node(); if (n) n.style.transform = `translate(${it.x}px,${it.y}px) rotate(${it.r || 0}deg)`; };
      const up = () => { svgW.removeEventListener('pointermove', mv); svgW.removeEventListener('pointerup', up); svgW.removeEventListener('pointercancel', up); svgW.classList.remove('dragging'); save(); draw(); };
      svgW.addEventListener('pointermove', mv); svgW.addEventListener('pointerup', up); svgW.addEventListener('pointercancel', up);
    });
    /* controls */
    const choose = k => { s.layout = k; s.labels = []; apply(true); c.rerender(); Snd.play('pop'); };
    const chips = h('div', { class: 'lay-chips' }, Object.keys(LAYOUTS).map(k => h('button', { type: 'button', class: 'lay-chip', 'aria-pressed': String(s.layout === k), title: LAYOUTS[k][1], onclick: () => choose(k) },
      h('span', { html: LAYOUT_THUMBS[k] || (LAYOUT_THUMBS[k] = layoutThumb(k)) }), h('small', {}, LAYOUTS[k][0]))));
    const clsSel = h('select', { class: 'inp sm', id: 'rmc-' + c.wd.id, 'aria-label': 'Students', onchange: e => { s.cls = e.target.value || null; apply(true); c.rerender(); } },
      h('option', { value: '', selected: !cls }, 'Number of seats'), S.classes.filter(x => x.names.length).map(x => h('option', { value: x.id, selected: cls && x.id === cls.id }, classLabel(x))));
    const nEl = h('b', { class: 'rm-n' }, String(seatCount()));
    const stepN = d => { s.n = clamp(s.n + d, 1, 60); nEl.textContent = s.n; apply(true); draw(); };
    const ctl = h('div', { class: 'rm-ctl' }, clsSel,
      cls ? h('span', { class: 'note' }, `${names.length} here today`) : h('span', { class: 'stp' }, ib('minus', 'Fewer seats', () => stepN(-1)), nEl, ib('plus', 'More seats', () => stepN(1))),
      seg([['names', 'Names'], ['numbers', 'Numbers'], ['none', 'Blank']], s.label, v => { s.label = v; save(); c.rerender(); }, 'Seat labels'),
      cls ? btn('Shuffle seats', () => { s.seed = Math.floor(Math.random() * 1e6) + 1; save(); c.rerender(); }, 'btn sm', 'shuffle') : null,
      h('span', { class: 'sp' }),
      btn(s.present ? 'Back to editing' : 'Show to class', () => { s.present = !s.present; save(); const mb = c.el.querySelector('.wg-h button[title="Enlarge"], .wg-h button[title="Shrink"]'); if (mb && s.present !== c.el.classList.contains('max')) mb.click(); c.rerender(); }, 'btn sm pri', s.present ? 'edit' : 'max'));
    const lay = LAYOUTS[s.layout];
    const show = h('div', { class: 'rm-show' }, s.present ? btn('Back to editing', () => { s.present = false; save(); const mb = c.el.querySelector('.wg-h button[title="Shrink"]'); if (mb) mb.click(); c.rerender(); }, 'btn sm rm-back', 'edit') : null, h('b', {}, lay ? lay[0] : 'Our classroom'), h('span', {}, lay ? lay[1] + (s.label === 'names' && cls ? ' Find your name.' : s.label === 'numbers' ? ' Find your number.' : '') : 'Look at the plan and set up the room.'));
    const palOpen = !!rt.pal;
    const pal = h('div', { class: 'rm-pal', hidden: !palOpen }, Object.keys(FURN).filter(k => k !== 'ctable').map(k => {
      const [n, w, hh, fn] = FURN[k], m = Math.max(w, hh) / 2 + 6;
      return h('button', { type: 'button', title: 'Add ' + n, onclick: () => { const it = { id: uid(), k, x: s.W / 2, y: s.L / 2, r: 0, label: '' }; s.items.push(it); sel = it.id; save(); draw(); Snd.play('pop'); } },
        h('span', { html: `<svg viewBox="${-m} ${-m} ${2 * m} ${2 * m}" stroke="${INK}" stroke-width="${m / 14}" stroke-linejoin="round">${fn(w, hh)}</svg>` }), h('small', {}, n));
    }));
    const foot = h('div', { class: 'rm-foot' }, count, h('span', { class: 'sp' }), btn(palOpen ? 'Hide furniture' : 'Add furniture', () => { rt.pal = !rt.pal; c.rerender(); }, 'btn sm', 'plus'));
    c.el.classList.toggle('presenting', !!s.present);
    c.body.append(h('div', { class: 'rm' + (s.present ? ' present' : '') }, s.present ? show : chips, s.present ? null : ctl, s.present ? null : show, svgW, tools, s.present ? null : foot, s.present ? null : pal));
    draw();
  },
};
