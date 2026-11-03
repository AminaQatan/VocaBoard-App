/* ---------- Text (with voice typing and writing check) and Draw (with shapes, auto draw, voice drawing) ---------- */
function langBtn(get, set, keep) {
  const b = keep(h('button', { class: 'ib lang', type: 'button', title: 'Voice and spelling language', 'aria-label': 'Language' }));
  const paint = () => { b.textContent = get().startsWith('ar') ? 'ع' : 'EN'; };
  b.onclick = () => { set(get().startsWith('ar') ? 'en-GB' : 'ar-OM'); S.vlang = get(); save(); paint(); };
  paint(); return b;
}
T.text = {
  title: 'Text', icon: 'text', w: 440, h: 260, sh: 280, minW: 200, minH: 140,
  init: () => ({ html: '', font: 'lexend', size: 34, note: '', al: 'left', lang: 'en-GB' }),
  mount(c) {
    const s = c.s; s.lang = s.lang || 'en-GB';
    const applyNote = () => { if (s.note) c.el.dataset.note = s.note; else delete c.el.dataset.note; };
    applyNote();
    const ed = h('div', { class: 'tx-ed', contenteditable: 'true', spellcheck: 'true', lang: s.lang.slice(0, 2), dir: 'auto', 'data-ph': 'Type here, or tap the microphone and speak…', 'data-al': s.al, html: cleanHtml(s.html) });
    const font = () => { ed.style.fontFamily = (FONTS.find(f => f[0] === s.font) || FONTS[0])[2]; ed.style.fontSize = s.size + 'px'; };
    font();
    let t, ranges = [], chkT;
    const panel = h('div', { class: 'tx-chk', hidden: true, role: 'region', 'aria-label': 'Writing check' });
    const heard = h('div', { class: 'tx-heard', hidden: true });
    ed.addEventListener('input', () => { s.html = cleanHtml(ed.innerHTML); save(); if (!panel.hidden) { clearTimeout(chkT); chkT = setTimeout(runCheck, 600); } });
    ed.addEventListener('paste', e => { const tx = e.clipboardData && e.clipboardData.getData('text/plain'); if (tx != null) { e.preventDefault(); document.execCommand('insertText', false, tx); } });
    const cmd = (name, val) => { ed.focus(); try { document.execCommand(name, false, val); } catch (e) {} s.html = cleanHtml(ed.innerHTML); save(); };
    const keep = el => { el.addEventListener('pointerdown', e => e.preventDefault()); return el; };
    const sel = h('select', { id: 'txf-' + c.wd.id, 'aria-label': 'Font', onchange: e => { s.font = e.target.value; save(); font(); } }, FONTS.map(f => h('option', { value: f[0], selected: f[0] === s.font }, f[1])));
    const cols = [['var(--ink)', 'Default'], ['#e5484d', 'Red'], ['#2f6fe4', 'Blue'], ['#1f9d55', 'Green'], ['#8e4ec6', 'Purple']];
    const notes = [['', 'var(--card)'], ['butter', 'var(--butter)'], ['mint', 'var(--mint)'], ['pink', 'var(--pink)'], ['aqua', 'var(--aqua)'], ['lav', 'var(--lav)']];
    const AL = ['left', 'center', 'right'];
    const alBtn = keep(ib('align' + s.al[0], 'Alignment', () => { s.al = AL[(AL.indexOf(s.al) + 1) % 3]; ed.dataset.al = s.al; alBtn.replaceChildren(svg('align' + s.al[0])); save(); }));
    /* writing check */
    function clearHL() { if (HL) ranges.forEach(r => HL.delete(r)); ranges = []; }
    function runCheck() {
      clearHL();
      const map = textMap(ed), issues = checkWriting(map.full);
      if (HL) issues.forEach(is => { if (is.j > is.i) { const r = rangeFor(map, is.i, is.j); if (r) { HL.add(r); ranges.push(r); } } });
      panel.replaceChildren(...[
        h('div', { class: 'tx-chk-h' }, !map.full.trim() ? h('b', {}, 'Write something first') : issues.length ? h('b', {}, `${issues.length} thing${issues.length > 1 ? 's' : ''} to check`) : h('b', { class: 'ok' }, svg('check'), 'No mistakes found'),
          h('span', { class: 'sp' }), issues.some(i => i.fix != null) ? keep(btn('Fix all', () => fix(issues.filter(i => i.fix != null)), 'btn sm pri')) : null, keep(ib('x', 'Close the check', closeCheck))),
        issues.length ? h('ul', {}, issues.slice(0, 40).map(is => h('li', {}, h('span', {}, is.msg), is.fix != null ? keep(btn('Fix', () => fix([is]), 'btn sm')) : null))) : null].filter(Boolean));
      panel.hidden = false;
    }
    function fix(list) {
      const map = textMap(ed);
      list.slice().sort((a, b) => b.i - a.i).forEach(is => {
        if (is.i === is.j) { const pn = posNode(map, is.i, true); if (pn) pn[0].insertData(pn[1], is.fix); }
        else { const r = rangeFor(map, is.i, is.j); if (r) { r.deleteContents(); r.insertNode(document.createTextNode(is.fix)); } }
      });
      ed.normalize(); s.html = cleanHtml(ed.innerHTML); save(); Snd.play('pop'); runCheck();
    }
    function closeCheck() { panel.hidden = true; clearHL(); chkBtn.setAttribute('aria-pressed', 'false'); }
    const chkBtn = keep(ib('spell', 'Check spelling and punctuation', () => { if (panel.hidden) { runCheck(); chkBtn.setAttribute('aria-pressed', 'true'); } else closeCheck(); }));
    /* voice typing */
    let voice = null;
    const mic = keep(ib('mic', 'Voice typing', () => {
      if (voice) { voice.stop(); return; }
      voice = startVoice(s.lang, (txt, fin) => {
        if (!fin) { heard.hidden = false; heard.textContent = txt; return; }
        heard.hidden = true;
        ed.focus(); const sl = getSelection(); if (!ed.contains(sl.anchorNode)) { sl.selectAllChildren(ed); sl.collapseToEnd(); }
        const before = ed.textContent; document.execCommand('insertText', false, (before && !/\s$/.test(before) ? ' ' : '') + txt.trim());
        s.html = cleanHtml(ed.innerHTML); save();
      }, () => { voice = null; mic.classList.remove('live'); heard.hidden = true; });
      if (voice) { mic.classList.add('live'); heard.hidden = false; heard.textContent = s.lang.startsWith('ar') ? 'تكلم الآن…' : 'Listening… speak now'; }
    }));
    c.cleanup(() => { voice && voice.stop(); clearHL(); });
    const lb = langBtn(() => s.lang, v => { s.lang = v; ed.lang = v.slice(0, 2); if (voice) voice.stop(); }, keep);
    const bar = h('div', { class: 'tx-bar' }, mic, lb, chkBtn, h('i', { class: 'vsep' }), sel,
      keep(ib('sizedown', 'Smaller text', () => { s.size = Math.max(12, s.size - 4); font(); save(); })),
      keep(ib('sizeup', 'Bigger text', () => { s.size = Math.min(160, s.size + 4); font(); save(); })),
      h('i', { class: 'vsep' }),
      keep(ib('bold', 'Bold', () => cmd('bold'))), keep(ib('ital', 'Italic', () => cmd('italic'))), keep(ib('under', 'Underline', () => cmd('underline'))),
      keep(ib('list', 'Bulleted list', () => cmd('insertUnorderedList'))), alBtn,
      h('i', { class: 'vsep' }),
      ...cols.map(([v, n]) => keep(h('button', { class: 'dot', type: 'button', title: n === 'Default' ? 'Clear formatting' : n + ' text', 'aria-label': n === 'Default' ? 'Clear formatting' : n + ' text', style: { background: v }, onclick: () => n === 'Default' ? cmd('removeFormat') : cmd('foreColor', v) }))),
      h('i', { class: 'vsep' }),
      ...notes.map(([k, v]) => keep(h('button', { class: 'dot', type: 'button', title: 'Note colour', 'aria-label': 'Note colour ' + (k || 'white'), style: { background: v, borderRadius: '.35rem' }, onclick: () => { s.note = k; save(); applyNote(); } }))));
    c.body.append(h('div', { class: 'tx' }, bar, h('div', { class: 'tx-area' }, ed, heard, panel)));
    if (!s.html) setTimeout(() => ed.focus({ preventScroll: true }), 60);
  },
};

const DSHAPES = [['line', 'line', 'Line'], ['arrow', 'arrow', 'Arrow'], ['rect', 'srect', 'Rectangle'], ['circle', 'sellipse', 'Circle'], ['tri', 'stri', 'Triangle'], ['diamond', 'sdiamond', 'Diamond'], ['star', 'sstar', 'Star'], ['heart', 'sheart', 'Heart']];
function drawShape(g, st) {
  const x = Math.min(st.x1, st.x2), y = Math.min(st.y1, st.y2), w = Math.abs(st.x2 - st.x1), hh = Math.abs(st.y2 - st.y1), cx = x + w / 2, cy = y + hh / 2;
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = st.w; g.strokeStyle = st.c; g.fillStyle = st.c;
  g.beginPath();
  switch (st.sh) {
    case 'line': g.moveTo(st.x1, st.y1); g.lineTo(st.x2, st.y2); break;
    case 'arrow': { g.moveTo(st.x1, st.y1); g.lineTo(st.x2, st.y2); const a = Math.atan2(st.y2 - st.y1, st.x2 - st.x1), L = Math.max(16, st.w * 3.5); g.moveTo(st.x2 - L * Math.cos(a - .45), st.y2 - L * Math.sin(a - .45)); g.lineTo(st.x2, st.y2); g.lineTo(st.x2 - L * Math.cos(a + .45), st.y2 - L * Math.sin(a + .45)); break; }
    case 'rect': g.rect(x, y, w, hh); break;
    case 'circle': g.ellipse(cx, cy, Math.max(w / 2, .5), Math.max(hh / 2, .5), 0, 0, Math.PI * 2); break;
    case 'tri': g.moveTo(cx, y); g.lineTo(x + w, y + hh); g.lineTo(x, y + hh); g.closePath(); break;
    case 'diamond': g.moveTo(cx, y); g.lineTo(x + w, cy); g.lineTo(cx, y + hh); g.lineTo(x, cy); g.closePath(); break;
    case 'star': for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .42 : 1; const px = cx + Math.cos(a) * w / 2 * r, py = cy + .05 * hh + Math.sin(a) * hh / 2 * r; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); break;
    case 'heart': g.moveTo(cx, y + hh * .28); g.bezierCurveTo(cx, y, x, y, x, y + hh * .3); g.bezierCurveTo(x, y + hh * .62, cx, y + hh * .8, cx, y + hh); g.bezierCurveTo(cx, y + hh * .8, x + w, y + hh * .62, x + w, y + hh * .3); g.bezierCurveTo(x + w, y, cx, y, cx, y + hh * .28); g.closePath(); break;
  }
  if (st.fill && st.sh !== 'line' && st.sh !== 'arrow') { g.globalAlpha = .28; g.fill(); g.globalAlpha = 1; }
  g.stroke();
}
T.draw = {
  title: 'Draw', icon: 'draw', w: 580, h: 460, sh: 480, minW: 280, minH: 240,
  init: () => ({ strokes: [], bg: 'white', tool: 'pen', col: '#25223d', w: 5, shape: 'rect', fill: false, auto: false, vlang: 'en-GB' }),
  mount(c) {
    const s = c.s; s.vlang = s.vlang || 'en-GB';
    const COLS = ['#25223d', '#e5484d', '#2f6fe4', '#1f9d55', '#f59e0b', '#8e4ec6', '#ffffff'];
    const pad = h('div', { class: 'dw-pad ' + s.bg }), cv = h('canvas', {}), base = document.createElement('canvas');
    const sug = h('div', { class: 'dw-sug', hidden: true }), info = h('div', { class: 'dw-info', hidden: true });
    pad.append(cv, sug, info);
    const ctx = cv.getContext('2d'), bctx = base.getContext('2d');
    let dpr = 1, cur = null, raf = 0, group = null, voice = null;
    const style = (g, st) => {
      g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = st.w * (st.t === 'hl' ? 3.2 : st.t === 'er' ? 3 : 1);
      g.globalCompositeOperation = st.t === 'er' ? 'destination-out' : 'source-over';
      g.globalAlpha = st.t === 'hl' ? .35 : 1; g.strokeStyle = st.c; g.fillStyle = st.c;
    };
    const stroke = (g, st) => {
      if (st.t === 'shape') return drawShape(g, st);
      if (st.t === 'img') { const im = clipImage(st.k); if (im.complete && im.naturalWidth) { g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(im, st.x, st.y, st.w, st.h); } else im.addEventListener('load', () => rebuild(), { once: true }); return; }
      const p = st.p; if (!p || !p.length) return; style(g, st); g.beginPath();
      if (p.length === 2) { g.arc(p[0], p[1], g.lineWidth / 2, 0, 7); g.fill(); return; }
      g.moveTo(p[0], p[1]);
      for (let i = 2; i < p.length - 2; i += 2) { const mx = (p[i] + p[i + 2]) / 2, my = (p[i + 1] + p[i + 3]) / 2; g.quadraticCurveTo(p[i], p[i + 1], mx, my); }
      g.lineTo(p[p.length - 2], p[p.length - 1]); g.stroke();
    };
    const resetCtx = g => { g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; };
    const rebuild = () => { resetCtx(bctx); bctx.clearRect(0, 0, base.width, base.height); s.strokes.forEach(st => { stroke(bctx, st); resetCtx(bctx); }); show(); };
    const show = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, cv.width, cv.height); ctx.drawImage(base, 0, 0); if (cur) { resetCtx(ctx); stroke(ctx, cur); } };
    const size = () => { const r = pad.getBoundingClientRect(); if (!r.width) return; dpr = Math.min(2, devicePixelRatio || 1); cv.width = base.width = Math.round(r.width * dpr); cv.height = base.height = Math.round(r.height * dpr); rebuild(); };
    const commit = st => { s.strokes.push(st); resetCtx(bctx); stroke(bctx, st); resetCtx(bctx); show(); save(); };
    const padSize = () => { const r = pad.getBoundingClientRect(); return { W: r.width, H: r.height }; };
    /* auto draw */
    function hideSug() { sug.hidden = true; }
    function suggest() {
      const pts = []; group.idx.forEach(i => { const p = s.strokes[i] && s.strokes[i].p; if (p) for (let k = 0; k < p.length; k += 2) pts.push({ x: p[k], y: p[k + 1] }); });
      if (pts.length < 4) return;
      const res = Rec.recognize(pts); if (!res.length) return;
      const names = res.slice(0, 2).map(r => r.name), opts = [];
      names.forEach(n => { if (DSHAPES.some(d => d[0] === n)) opts.push({ shape: n }); });
      const clips = []; names.forEach(n => (CLIP_FOR[n] || []).forEach(k => { if (!clips.includes(k)) clips.push(k); }));
      clips.slice(0, 7).forEach(k => opts.push({ clip: k }));
      sug.replaceChildren(h('span', { class: 'lbl' }, 'Did you mean'), ...opts.map(o => {
        const b = h('button', { type: 'button', title: o.shape ? 'Neat ' + SHAPE_NAMES[o.shape].toLowerCase() : CLIP[o.clip][0], 'aria-label': o.shape ? 'Neat ' + SHAPE_NAMES[o.shape] : CLIP[o.clip][0], onclick: () => choose(o, pts) });
        if (o.shape) b.append(svg(DSHAPES.find(d => d[0] === o.shape)[1])); else b.append(h('img', { src: clipImage(o.clip).src, alt: '' }));
        return b;
      }), ib('x', 'Keep my drawing', () => { hideSug(); group = null; }));
      sug.hidden = false;
    }
    function choose(o, pts) {
      const bb = Rec.bbox(pts), first = s.strokes[group.idx[0]] || {};
      group.idx.slice().sort((a, b) => b - a).forEach(i => s.strokes.splice(i, 1));
      if (o.shape) {
        let st = { t: 'shape', sh: o.shape, c: first.c || s.col, w: Math.max(3, first.w || s.w), fill: s.fill, x1: bb.x, y1: bb.y, x2: bb.x + bb.w, y2: bb.y + bb.h };
        if (o.shape === 'line' || o.shape === 'arrow') {
          const a = pts[0]; let far = pts[pts.length - 1];
          if (o.shape === 'arrow') { let d = 0; pts.forEach(p => { const dd = Math.hypot(p.x - a.x, p.y - a.y); if (dd > d) { d = dd; far = p; } }); }
          let ang = Math.atan2(far.y - a.y, far.x - a.x); const snap = Math.round(ang / (Math.PI / 4)) * Math.PI / 4; if (Math.abs(ang - snap) < .1) ang = snap;
          const L = Math.hypot(far.x - a.x, far.y - a.y); Object.assign(st, { x1: a.x, y1: a.y, x2: a.x + Math.cos(ang) * L, y2: a.y + Math.sin(ang) * L });
        } else if (['circle', 'rect', 'star', 'heart', 'diamond'].includes(o.shape) && Math.abs(bb.w / Math.max(bb.h, 1) - 1) < .25) { const m = (bb.w + bb.h) / 2, cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2; Object.assign(st, { x1: cx - m / 2, y1: cy - m / 2, x2: cx + m / 2, y2: cy + m / 2 }); }
        s.strokes.push(st);
      } else {
        const ar = clipAspect(o.clip), hh = Math.max(70, bb.h, bb.w / ar), w = hh * ar, cx = bb.x + bb.w / 2, cy = bb.y + bb.h / 2;
        s.strokes.push({ t: 'img', k: o.clip, x: cx - w / 2, y: cy - hh / 2, w, h: hh });
      }
      group = null; hideSug(); save(); rebuild(); Snd.play('pop');
    }
    /* voice drawing */
    let placeN = 0;
    function placeFound(found) {
      const { W, H } = padSize(), sz = Math.max(70, Math.min(W, H) * .32);
      found.forEach(f => {
        const ox = ((placeN % 3) - 1) * sz * 1.05, oy = ((Math.floor(placeN / 3) % 2) - .4) * sz * .9; placeN++;
        const cx = W / 2 + ox, cy = H / 2 + oy;
        if (f.clip) { const ar = clipAspect(f.clip), hh = ar >= 1 ? sz / ar : sz, w = hh * ar; s.strokes.push({ t: 'img', k: f.clip, x: cx - w / 2, y: cy - hh / 2, w, h: hh }); }
        else if (f.shape === 'line' || f.shape === 'arrow') s.strokes.push({ t: 'shape', sh: f.shape, c: s.col, w: s.w, fill: s.fill, x1: cx - sz / 2, y1: cy, x2: cx + sz / 2, y2: cy });
        else s.strokes.push({ t: 'shape', sh: f.shape, c: s.col, w: s.w, fill: s.fill, x1: cx - sz / 2, y1: cy - sz / 2, x2: cx + sz / 2, y2: cy + sz / 2 });
      });
      save(); rebuild(); Snd.play('pop');
    }
    function toggleVoice(btnEl) {
      if (voice) { voice.stop(); return; }
      voice = startVoice(s.vlang, (txt, fin) => {
        info.hidden = false; info.textContent = '“' + txt + '”';
        if (!fin) return;
        const t = txt.toLowerCase();
        if (/\b(undo|go back)\b|تراجع/.test(t)) { s.strokes.pop(); save(); rebuild(); return; }
        const found = findWords(txt);
        if (found.length) placeFound(found); else info.textContent = s.vlang.startsWith('ar') ? `لم أفهم «${txt}». جرب: شمس، قطة، نجمة` : `I heard “${txt}”. Try a word like sun, cat, star or house.`;
      }, () => { voice = null; btnEl.classList.remove('live'); setTimeout(() => { if (!voice) info.hidden = true; }, 2500); });
      if (voice) { btnEl.classList.add('live'); info.hidden = false; info.textContent = s.vlang.startsWith('ar') ? 'قل ما تريد رسمه: شمس، قطة، بيت…' : 'Say what to draw: sun, cat, house, star, circle…'; }
    }
    /* handwriting reading, only where the browser offers it (Chromebooks and some Chrome versions) */
    async function readWriting() {
      const pen = s.strokes.filter(st => st.t === 'pen' && st.p && st.p.length > 2);
      if (!pen.length) { toast('Write something with the pen first.'); return; }
      try {
        const r = await navigator.createHandwritingRecognizer({ languages: [s.vlang.slice(0, 2)] });
        const d = r.startDrawing({ recognitionType: 'text' }); let tm = 0;
        for (const st of pen) { const hs = new HandwritingStroke(); for (let i = 0; i < st.p.length; i += 2) hs.addPoint({ x: st.p[i], y: st.p[i + 1], t: (tm += 10) }); d.addStroke(hs); tm += 300; }
        const pr = await d.getPrediction(); try { d.clear(); r.finish(); } catch (e) {}
        const text = pr && pr[0] && pr[0].text;
        if (!text) { toast('No writing was found.'); return; }
        const issues = checkWriting(text);
        info.hidden = false;
        info.replaceChildren(h('b', {}, '“' + text + '”'), h('span', {}, issues.length ? issues.map(i => i.msg).join(' · ') : 'No mistakes found.'),
          btn('Make it a Text box', () => { addWidget('text', { html: text.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])) }); info.hidden = true; }, 'btn sm'), ib('x', 'Close', () => { info.hidden = true; }));
      } catch (e) { toast('Reading handwriting isn’t available on this device.'); }
    }
    cv.addEventListener('pointerdown', e => {
      if (e.button > 0) return; e.preventDefault(); cv.setPointerCapture(e.pointerId);
      const r = cv.getBoundingClientRect(), x0 = Math.round(e.clientX - r.left), y0 = Math.round(e.clientY - r.top);
      cur = s.tool === 'shape' ? { t: 'shape', sh: s.shape, c: s.col, w: s.w, fill: s.fill, x1: x0, y1: y0, x2: x0, y2: y0 } : { t: s.tool, c: s.col, w: s.w, p: [x0, y0] };
      show();
      const mv = ev => {
        if (cur.t === 'shape') { cur.x2 = Math.round(ev.clientX - r.left); cur.y2 = Math.round(ev.clientY - r.top); }
        else { const evs = ev.getCoalescedEvents ? ev.getCoalescedEvents() : [ev]; for (const q of evs.length ? evs : [ev]) { const x = Math.round(q.clientX - r.left), y = Math.round(q.clientY - r.top), p = cur.p; if (Math.abs(x - p[p.length - 2]) + Math.abs(y - p[p.length - 1]) >= 2) p.push(x, y); } }
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; show(); });
      };
      const up = () => {
        cv.removeEventListener('pointermove', mv); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
        if (!cur) return; const st = cur; cur = null;
        if (st.t === 'shape' && Math.abs(st.x2 - st.x1) + Math.abs(st.y2 - st.y1) < 6) { show(); return; }
        commit(st);
        if (s.auto && st.t === 'pen') { const tnow = now(); if (!group || tnow - group.t > 2500) group = { idx: [] }; group.idx.push(s.strokes.length - 1); group.t = tnow; suggest(); }
      };
      cv.addEventListener('pointermove', mv); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    });
    const tools = [['pen', 'pen', 'Pen'], ['hl', 'hl', 'Highlighter'], ['er', 'eraser', 'Eraser'], ['shape', 'shp', 'Shapes']];
    const bar = h('div', { class: 'dw-bar' }), sub = h('div', { class: 'dw-bar dw-sub' });
    const drawBar = () => {
      bar.replaceChildren(...[
        ...tools.map(([k, ic, n]) => { const b = ib(ic, n, () => { s.tool = k; save(); drawBar(); }); b.setAttribute('aria-pressed', String(s.tool === k)); return b; }),
        h('i', { class: 'vsep' }),
        ...COLS.map(col => h('button', { class: 'dot', type: 'button', 'aria-label': 'Colour ' + col, 'aria-pressed': String(s.col === col && s.tool !== 'er'), style: { background: col }, onclick: () => { s.col = col; if (s.tool === 'er') s.tool = 'pen'; save(); drawBar(); } })),
        ...[3, 6, 12].map(w => h('button', { class: 'sz', type: 'button', 'aria-label': 'Line size ' + w, 'aria-pressed': String(s.w === w), onclick: () => { s.w = w; save(); drawBar(); } }, h('i', { style: { width: (w * .7 + 3) + 'px', height: (w * .7 + 3) + 'px' } }))),
        h('span', { class: 'sp' }),
        (() => { const b = ib('wand', 'Auto draw: turns sketches into neat shapes and pictures', () => { s.auto = !s.auto; save(); if (!s.auto) { hideSug(); group = null; } else toast('Auto draw is on. Sketch something and pick a suggestion.'); drawBar(); }); b.setAttribute('aria-pressed', String(!!s.auto)); return b; })(),
        (() => { const b = ib('mic', 'Draw by voice', () => toggleVoice(b)); if (voice) b.classList.add('live'); return b; })(),
        langBtn(() => s.vlang, v => { s.vlang = v; if (voice) voice.stop(); }, x => x),
        'createHandwritingRecognizer' in navigator ? ib('hw', 'Read my handwriting and check it', readWriting) : null,
        ib('undo', 'Undo', () => { s.strokes.pop(); group = null; hideSug(); save(); rebuild(); }),
        ib(s.bg === 'grid' ? 'qr' : 'file', 'Change paper', () => { const B = ['white', 'grid', 'chalk', 'clear']; s.bg = B[(B.indexOf(s.bg) + 1) % B.length]; pad.className = 'dw-pad ' + s.bg; save(); drawBar(); }),
        confirmBtn('Clear', 'Clear all?', () => { s.strokes = []; group = null; hideSug(); save(); rebuild(); drawBar(); }, 'btn sm danger')].filter(Boolean));
      sub.hidden = s.tool !== 'shape';
      sub.replaceChildren(...DSHAPES.map(([k, ic, n]) => { const b = ib(ic, n, () => { s.shape = k; save(); drawBar(); }); b.setAttribute('aria-pressed', String(s.shape === k)); return b; }),
        (() => { const b = ib('fill', s.fill ? 'Filled shapes' : 'Outline shapes', () => { s.fill = !s.fill; save(); drawBar(); }); b.setAttribute('aria-pressed', String(!!s.fill)); return b; })());
    };
    drawBar();
    c.body.append(h('div', { class: 'dw' }, h('div', { class: 'dw-bars' }, bar, sub), pad));
    requestAnimationFrame(size);
    c.cleanup(() => voice && voice.stop());
    return { resize: size, destroy() { cancelAnimationFrame(raf); } };
  },
};
