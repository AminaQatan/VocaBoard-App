/* ---------- Classroom control ---------- */
T.traffic = {
  title: 'Traffic light', icon: 'traffic', w: 220, h: 330, sh: 300, minW: 140, minH: 180, edit: true,
  init: () => ({ on: 'green', labels: { red: 'Stop and listen', yellow: 'Finish up', green: 'Go ahead' } }),
  mount(c) {
    const s = c.s;
    if (c.editing) {
      c.body.append(h('div', { class: 'form' },
        ...['red', 'yellow', 'green'].map(k => field({ red: 'Red means', yellow: 'Yellow means', green: 'Green means' }[k], h('input', { class: 'inp', id: `tl-${k}-${c.wd.id}`, value: s.labels[k], maxlength: 40, oninput: e => { s.labels[k] = e.target.value; save(); } }))),
        btn('Done', () => c.edit(false), 'btn pri')));
      return;
    }
    const lbl = h('div', { class: 'tl-lbl', 'aria-live': 'polite' });
    const box = h('div', { class: 'tl-box' }, ['red', 'yellow', 'green'].map(k => h('button', { class: k, type: 'button', 'aria-label': k + ' light', onclick: () => { s.on = s.on === k ? null : k; save(); paint(); Snd.play('tick'); } })));
    c.body.append(h('div', { class: 'tl' }, box, lbl));
    const paint = () => { box.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.classList.contains(s.on)))); lbl.textContent = s.on ? s.labels[s.on] : ''; };
    paint();
  },
};

T.work = {
  title: 'Work symbols', icon: 'work', w: 330, h: 300, sh: 320, minW: 200, minH: 200,
  init: () => ({ cur: 'whisper' }),
  mount(c) {
    const s = c.s;
    const main = h('div', { class: 'ws-main', 'aria-live': 'polite' });
    const pick = h('div', { class: 'ws-pick' }, Object.keys(WSY).map(k => h('button', { type: 'button', 'data-k': k, style: { '--wsc': WSY[k].c }, onclick: () => { s.cur = k; save(); paint(); } }, h('span', { html: wsSvg(k), style: { display: 'contents' } }), WSY[k].t)));
    c.body.append(h('div', { class: 'ws' }, main, pick));
    function paint() {
      const w = WSY[s.cur] || WSY.whisper;
      main.style.setProperty('--wsc', w.c);
      main.innerHTML = wsSvg(s.cur);
      main.append(h('div', {}, h('b', {}, w.t), h('span', {}, w.d)));
      pick.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === s.cur)));
    }
    paint();
  },
};

T.sound = {
  title: 'Sound level', icon: 'sound', w: 370, h: 340, sh: 360, minW: 230, minH: 200, edit: true,
  init: () => ({ thr: 65, sens: 1, alarm: true, n: 0, on: true }),
  mount(c) {
    const s = c.s, rt = c.rt();
    if (c.editing) {
      c.body.append(h('div', { class: 'form' },
        field('Microphone sensitivity', h('input', { type: 'range', id: 'sls-' + c.wd.id, min: .4, max: 2.5, step: .1, value: s.sens, oninput: e => { s.sens = +e.target.value; save(); } })),
        h('p', { class: 'note' }, 'Raise it if the meter barely moves. Lower it in a noisy room.'),
        toggle('sla-' + c.wd.id, 'Alarm sound when too loud', s.alarm, v => { s.alarm = v; save(); }),
        h('div', { class: 'row' }, btn('Reset the count', () => { s.n = 0; save(); }, 'btn sm', 'reset')),
        btn('Done', () => c.edit(false), 'btn pri')));
      return;
    }
    if (!rt.an) {
      const msg = h('p', {}, APP ? 'Shows how loud the room is and rings when it gets too noisy.' : 'Shows how loud the room is. The microphone works in the installed app; this browser version may block it.');
      const start = async () => {
        if (rt.starting) return; rt.starting = true;
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
          const ac = Snd.ctx(), src = ac.createMediaStreamSource(stream), an = ac.createAnalyser(); an.fftSize = 1024; src.connect(an);
          Object.assign(rt, { stream, src, an, buf: new Float32Array(an.fftSize), lvl: 0, since: 0, cool: 0, dispose() { stream.getTracks().forEach(t => t.stop()); try { src.disconnect(); } catch (e) {} } });
          s.on = true; save(); rt.starting = false; c.rerender();
        } catch (e) {
          rt.starting = false; s.on = false; save();
          msg.textContent = e && e.name === 'NotFoundError' ? 'No microphone was found on this device.' : 'The microphone is blocked. Allow microphone access for this page in the browser settings, then tap the microphone.';
        }
      };
      c.body.append(h('div', { class: 'empty' }, h('button', { class: 'mic-big', type: 'button', 'aria-label': 'Start listening', onclick: start }, svg('mic')), msg, btn('Start listening', start, 'btn pri', 'mic')));
      if (s.on) start();
      return;
    }
    const P = v => { const a = Math.PI - v / 100 * Math.PI; return [100 + 80 * Math.cos(a), 108 - 80 * Math.sin(a)]; };
    const arc = (a, b) => { const [x1, y1] = P(a), [x2, y2] = P(b); return `M${x1.toFixed(1)} ${y1.toFixed(1)}A80 80 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`; };
    const g = h('div', { style: { minHeight: 0, height: '100%', display: 'grid', justifyItems: 'center' }, html: `<svg viewBox="0 0 200 128" aria-hidden="true"><path d="${arc(0, 100)}" stroke="var(--card-2)" stroke-width="20" fill="none"/><path class="z1" stroke="var(--go)" stroke-width="20" fill="none"/><path class="z2" stroke="var(--wait)" stroke-width="20" fill="none"/><path class="z3" stroke="var(--stop)" stroke-width="20" fill="none"/><path class="lv" stroke="var(--edge)" stroke-width="4" fill="none" stroke-linecap="round"/><line class="nd" x1="100" y1="108" x2="100" y2="40" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="108" r="8" fill="var(--ink)"/></svg>` });
    const q = k => g.querySelector(k), nd = q('.nd');
    const zones = () => { q('.z1').setAttribute('d', arc(0, s.thr * .7)); q('.z2').setAttribute('d', arc(s.thr * .7, s.thr)); q('.z3').setAttribute('d', arc(s.thr, 100)); };
    zones();
    const lbl = h('div', { class: 'sl-lbl' }), cnt = h('span', {});
    const lim = h('input', { type: 'range', id: 'slt-' + c.wd.id, min: 20, max: 95, value: s.thr, 'aria-label': 'Loudness limit', oninput: e => { s.thr = +e.target.value; save(); zones(); } });
    c.body.append(h('div', { class: 'sl' }, g, lbl,
      h('div', { class: 'ctrls', style: { flexWrap: 'nowrap' } }, h('div', { class: 'lim' }, h('label', { for: lim.id }, 'Limit'), lim, cnt), ib('stop', 'Stop listening', () => { s.on = false; save(); rt.dispose && rt.dispose(); for (const k in rt) delete rt[k]; c.el.classList.remove('alarm'); c.rerender(); }, 'btn sm ic'))));
    let lastLbl = '';
    c.tick(() => {
      if (!rt.an) return;
      rt.an.getFloatTimeDomainData(rt.buf); let sum = 0; for (let i = 0; i < rt.buf.length; i++) sum += rt.buf[i] * rt.buf[i];
      const db = 20 * Math.log10(Math.sqrt(sum / rt.buf.length) + 1e-8);
      const v = clamp((db + 72) * 1.55 * s.sens, 0, 100);
      rt.lvl = v > rt.lvl ? rt.lvl * .45 + v * .55 : rt.lvl * .82 + v * .18;
      const a = Math.PI - rt.lvl / 100 * Math.PI;
      nd.setAttribute('x2', (100 + 66 * Math.cos(a)).toFixed(1)); nd.setAttribute('y2', (108 - 66 * Math.sin(a)).toFixed(1));
      const t = now();
      if (rt.lvl >= s.thr) { if (!rt.since) rt.since = t; if (t - rt.since > 600 && t > rt.cool) { s.n++; save(); rt.cool = t + 3500; if (s.alarm) Snd.play('alarm'); c.el.classList.add('alarm'); setTimeout(() => c.el.classList.remove('alarm'), 2400); } }
      else rt.since = 0;
      const st = rt.lvl >= s.thr ? 'stop' : rt.lvl >= s.thr * .7 ? 'wait' : 'go';
      const txt = { go: 'Nice and quiet', wait: 'Getting louder', stop: 'Too loud!' }[st];
      if (txt !== lastLbl) { lastLbl = txt; lbl.textContent = txt; lbl.className = 'sl-lbl ' + st; }
      const ct = s.n ? `Too loud ${s.n}×` : ''; if (cnt.textContent !== ct) cnt.textContent = ct;
    });
  },
};

/* ---------- Engagement ---------- */
function classOf(s) {
  let c = S.classes.find(x => x.id === s.cls) || S.classes[0];
  if (!c) { c = { id: uid(), name: 'My class', names: [], absent: [] }; S.classes.push(c); }
  c.absent = c.absent || []; s.cls = c.id; return c;
}
const presentOf = c => c.names.filter(n => !c.absent.includes(n));
function rosterEditor(ctx, extra) {
  const c = classOf(ctx.s), id = ctx.wd.id;
  const sel = h('select', { class: 'inp', id: 'rcl-' + id, onchange: e => { ctx.s.cls = e.target.value; save(); ctx.rerender(); } }, S.classes.map(x => h('option', { value: x.id, selected: x.id === c.id }, classLabel(x))));
  const nm = h('input', { class: 'inp', id: 'rnm-' + id, value: c.name, maxlength: 40, oninput: e => { c.name = e.target.value || 'Class'; sel.selectedOptions[0].textContent = classLabel(c); save(); } });
  const ta = h('textarea', { class: 'inp', id: 'rta-' + id, rows: 6, placeholder: 'One name per line', oninput: e => { c.names = e.target.value.split(/\n|,/).map(x => x.trim()).filter(Boolean); c.absent = c.absent.filter(n => c.names.includes(n)); save(); chipsDraw(); } });
  ta.value = c.names.join('\n');
  const chips = h('div', { class: 'chips' });
  const chipsDraw = () => chips.replaceChildren(...c.names.map(n => { const ab = c.absent.includes(n); return h('button', { class: 'chip' + (ab ? ' off' : ''), type: 'button', 'aria-pressed': String(!ab), onclick: () => { c.absent = ab ? c.absent.filter(x => x !== n) : c.absent.concat(n); save(); chipsDraw(); } }, n); }));
  chipsDraw();
  return h('div', { class: 'form' },
    field('Class', h('div', { class: 'row nw' }, sel, btn('New', () => { const nc = { id: uid(), name: 'Class ' + (S.classes.length + 1), names: [], absent: [] }; S.classes.push(nc); ctx.s.cls = nc.id; save(); ctx.rerender(); }, 'btn sm', 'plus'))),
    field('Class name', nm), field('Students, one per line', ta), field('Here today (tap a name to mark absent)', chips),
    extra || null,
    h('div', { class: 'row' }, btn('Done', () => ctx.edit(false), 'btn pri'), S.classes.length > 1 ? confirmBtn('Delete this class', 'Tap again to delete', () => { S.classes = S.classes.filter(x => x !== c); ctx.s.cls = null; save(); ctx.rerender(); }) : null));
}
function confetti(host) {
  const box = h('div', { class: 'confetti' }); const cols = ['--pink', '--butter', '--mint', '--lav', '--peach', '--card'];
  for (let i = 0; i < 26; i++) { const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 140; box.append(h('i', { style: { background: `var(${cols[i % 6]})`, '--dx': Math.cos(a) * d + 'px', '--dy': Math.sin(a) * d + 'px', '--r': Math.random() * 720 + 'deg' } })); }
  host.append(box); setTimeout(() => box.remove(), 1100);
}

T.randomizer = {
  title: 'Name picker', icon: 'randomizer', w: 360, h: 300, sh: 320, minW: 220, minH: 200, edit: true,
  init: () => ({ cls: null, norep: true, picked: [], last: null }),
  mount(c) {
    const s = c.s;
    if (c.editing) { c.body.append(rosterEditor(c, toggle('rnr-' + c.wd.id, 'Don’t pick the same name twice', s.norep, v => { s.norep = v; save(); }))); return; }
    const cl = classOf(s);
    const nameEl = h('b', {}, s.last || 'Who’s next?');
    const card = h('div', { class: 'rp-card' + (s.last ? '' : ' idle'), 'aria-live': 'polite' }, nameEl);
    const left = h('span', {});
    let spinning = false;
    const pool = () => { const p = presentOf(cl); return s.norep ? p.filter(n => !s.picked.includes(n)) : p; };
    const meta = () => { const p = presentOf(cl); left.textContent = `${classLabel(cl)} · ` + (s.norep ? `${pool().length} of ${p.length} left` : `${p.length} students`); };
    const go = btn('Pick a name', () => {
      if (spinning) return; const all = presentOf(cl);
      if (!all.length) { c.edit(true); return; }
      let p = pool(); if (!p.length) { s.picked = []; p = all.slice(); toast('Everyone has had a turn. Starting again.'); }
      const win = p[Math.floor(Math.random() * p.length)];
      spinning = true; go.disabled = true; card.className = 'rp-card spin';
      let i = 0; const steps = 18 + Math.floor(Math.random() * 6), seq = shuffle(all);
      const stepFn = () => {
        if (i < steps) { nameEl.textContent = seq[i % seq.length]; Snd.play('tick'); i++; setTimeout(stepFn, 45 + i * i * .9); return; }
        nameEl.textContent = win; card.className = 'rp-card win'; s.last = win; if (s.norep) s.picked.push(win); save();
        Snd.play('win'); confetti(card); spinning = false; go.disabled = false; meta();
      };
      stepFn();
    }, 'btn pri', 'shuffle');
    c.body.append(h('div', { class: 'rp' }, card, h('div', { class: 'ctrls' }, go), h('div', { class: 'rp-meta' }, left, s.norep ? btn('Start over', () => { s.picked = []; s.last = null; save(); c.rerender(); }, 'btn sm', 'reset') : null)));
    meta();
  },
};

T.groups = {
  title: 'Group maker', icon: 'groups', w: 470, h: 360, sh: 440, minW: 260, minH: 220, edit: true,
  init: () => ({ cls: null, by: 'count', n: 4, groups: null }),
  mount(c) {
    const s = c.s;
    if (c.editing) { c.body.append(rosterEditor(c)); return; }
    const cl = classOf(s);
    const make = () => {
      const p = shuffle(presentOf(cl)); if (!p.length) { s.groups = []; return; }
      const k = s.by === 'count' ? Math.min(s.n, p.length) : Math.max(1, Math.ceil(p.length / s.n));
      const g = Array.from({ length: k }, () => []); p.forEach((n, i) => g[i % k].push(n)); s.groups = g; save();
    };
    if (!s.groups) make();
    const nEl = h('span', {}, s.n);
    const grid = h('div', { class: 'gm-grid' });
    const cols = ['--lav', '--mint', '--aqua', '--pink', '--butter', '--peach'];
    const draw = () => {
      if (!presentOf(cl).length) { grid.replaceChildren(h('div', { class: 'empty', style: { gridColumn: '1/-1' } }, h('p', {}, 'Add your students first.'), btn('Add students', () => c.edit(true), 'btn sm', 'edit'))); return; }
      grid.replaceChildren(...(s.groups || []).map((g, i) => h('div', { class: 'gm-g', style: { '--gc': `var(${cols[i % 6]})` } }, h('h4', {}, 'Group ' + (i + 1)), h('ul', {}, g.map(n => h('li', {}, n))))));
    };
    c.body.append(h('div', { class: 'gm' },
      h('div', { class: 'gm-top' },
        seg([['count', 'Groups'], ['size', 'Per group']], s.by, v => { s.by = v; save(); make(); c.rerender(); }),
        h('span', { class: 'stp' }, ib('minus', 'Fewer', () => { s.n = Math.max(s.by === 'count' ? 2 : 2, s.n - 1); nEl.textContent = s.n; make(); draw(); save(); }), nEl, ib('plus', 'More', () => { s.n = Math.min(12, s.n + 1); nEl.textContent = s.n; make(); draw(); save(); })),
        btn('Shuffle', () => { make(); draw(); Snd.play('rattle'); }, 'btn pri sm', 'shuffle')),
      grid));
    draw();
  },
};

const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
T.dice = {
  title: 'Dice', icon: 'dice', w: 330, h: 300, sh: 320, minW: 200, minH: 200,
  init: () => ({ mode: 'dice', n: 2, vals: [3, 5], coin: 'Heads' }),
  mount(c) {
    const s = c.s;
    const area = h('button', { class: 'dc-area', type: 'button', 'aria-label': 'Roll' });
    const total = h('div', { class: 'dc-total', 'aria-live': 'polite' });
    const cols = ['--lav', '--mint', '--aqua', '--pink', '--butter', '--peach'];
    const die = (v, i) => h('div', { class: 'die', style: { '--dc': `var(${cols[i % 6]})` } }, [...Array(9)].map((_, k) => h('i', { class: PIPS[v].includes(k) ? 'on' : '' })));
    const paint = () => {
      area.className = 'dc-area n' + s.n;
      if (s.mode === 'coin') { area.replaceChildren(h('div', { class: 'coin' + (s.coin === 'Tails' ? ' t' : '') }, s.coin)); total.textContent = ''; return; }
      while (s.vals.length < s.n) s.vals.push(1 + Math.floor(Math.random() * 6));
      const v = s.vals.slice(0, s.n); area.replaceChildren(...v.map(die));
      total.textContent = s.n > 1 ? 'Total: ' + v.reduce((a, b) => a + b, 0) : '';
    };
    let busy = false;
    const roll = () => {
      if (busy) return; busy = true; Snd.play('rattle');
      area.classList.add('rolling');
      let k = 0; const iv = setInterval(() => {
        if (s.mode === 'coin') s.coin = Math.random() < .5 ? 'Heads' : 'Tails'; else s.vals = s.vals.map(() => 1 + Math.floor(Math.random() * 6));
        paint(); area.classList.add('rolling');
        if (++k > (s.mode === 'coin' ? 1 : 6)) { clearInterval(iv); setTimeout(() => { area.classList.remove('rolling'); busy = false; save(); }, s.mode === 'coin' ? 600 : 420); }
      }, s.mode === 'coin' ? 300 : 70);
      c.cleanup(() => clearInterval(iv));
    };
    area.onclick = roll;
    const cnt = h('span', { class: 'row nw', style: { gap: '.1rem' } }, ib('minus', 'Fewer dice', () => { s.n = Math.max(1, s.n - 1); save(); paint(); }), ib('plus', 'More dice', () => { s.n = Math.min(6, s.n + 1); save(); paint(); }));
    const top = h('div', { class: 'dc-top' }, seg([['dice', 'Dice'], ['coin', 'Coin']], s.mode, v => { s.mode = v; save(); c.rerender(); }), s.mode === 'dice' ? cnt : null);
    c.body.append(h('div', { class: 'dc' }, top, area, h('div', { class: 'ctrls' }, total, btn(s.mode === 'coin' ? 'Flip' : 'Roll', roll, 'btn pri', s.mode === 'coin' ? 'coin' : 'dice'))));
    paint();
  },
};

const POLL_KINDS = [['mc', 'A B C D'], ['tf', 'True / False'], ['face', 'Faces']];
T.poll = {
  title: 'Poll', icon: 'poll', w: 400, h: 380, sh: 420, minW: 250, minH: 260, edit: true,
  init: () => ({ kind: 'mc', q: 'Which fraction is the same as 1/2?', opts: { mc: ['2/4', '2/3', '3/5', '1/3'], tf: ['True', 'False'], face: ['I can explain it', 'I get it', 'Not sure yet', 'I’m lost'] }, votes: { mc: [0, 0, 0, 0], tf: [0, 0], face: [0, 0, 0, 0] }, hide: false, hist: [], qid: uid() }),
  mount(c) {
    const s = c.s, k = s.kind, opts = s.opts[k];
    s.votes[k] = opts.map((_, i) => s.votes[k][i] || 0);
    if (!s.qid) s.qid = uid();
    if (c.editing) {
      const list = h('div', { class: 'form', style: { height: 'auto', overflow: 'visible' } });
      const draw = () => list.replaceChildren(...s.opts[k].map((o, i) => h('div', { class: 'row nw' },
        h('input', { class: 'inp', id: `po-${c.wd.id}-${i}`, 'aria-label': 'Answer ' + (i + 1), value: o, oninput: e => { s.opts[k][i] = e.target.value; save(); } }),
        k === 'mc' && s.opts.mc.length > 2 ? ib('trash', 'Remove answer', () => { s.opts.mc.splice(i, 1); s.votes.mc.splice(i, 1); save(); draw(); }) : null)));
      draw();
      c.body.append(h('div', { class: 'form' },
        field('Question', h('input', { class: 'inp', id: 'pq-' + c.wd.id, value: s.q, oninput: e => { s.q = e.target.value; save(); } })),
        h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'Answers'), list),
        k === 'mc' && s.opts.mc.length < 6 ? h('div', { class: 'row' }, btn('Add an answer', () => { s.opts.mc.push(''); s.votes.mc.push(0); save(); c.rerender(); }, 'btn sm', 'plus')) : null,
        btn('Done', () => c.edit(false), 'btn pri')));
      return;
    }
    const colors = ['--lav', '--mint', '--aqua', '--pink', '--butter', '--peach'];
    const lv = liveSetup(c, 'poll', () => ({ title: s._title || 'Poll', q: s.q, opts: JSON.stringify(s.opts[k]), qid: s.qid, mode: k }), items => {
      for (const it of items) if (it.qid === s.qid && Number.isInteger(it.v) && it.v >= 0 && it.v < s.votes[k].length) { s.votes[k][it.v]++; s.hist.push(it.v); }
      save(); paint();
    });
    const q = h('div', { class: 'pl-q', contenteditable: 'true', 'data-ph': 'Type a question', spellcheck: 'false', oninput: e => { s.q = e.target.textContent; save(); lv.sync(); } }, s.q);
    const box = h('div', { class: 'pl-opts' + (k === 'face' ? ' faces' : '') });
    const tot = h('span', {});
    const items = opts.map((o, i) => {
      const col = k === 'face' ? FACES[i % 4].c : k === 'tf' ? (i ? 'var(--pink)' : 'var(--mint)') : `var(${colors[i % 6]})`;
      const bar = h('i', { class: 'bar' }), ct = h('span', { class: 'ct' });
      const b = h('button', { class: 'pl-o', type: 'button', style: { '--oc': col }, onclick: () => { s.votes[k][i]++; s.hist.push(i); save(); paint(); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); Snd.play('pop'); } },
        bar, k === 'face' ? h('span', { class: 'face', html: faceSvg(i) }) : h('span', { class: 'k' }, k === 'tf' ? (i ? '✗' : '✓') : String.fromCharCode(65 + i)), h('span', { class: 'lb' }, o || '—'), ct);
      box.append(b); return { bar, ct };
    });
    const eye = ib(s.hide ? 'eye' : 'eyeoff', s.hide ? 'Show results' : 'Hide results', () => { s.hide = !s.hide; save(); c.rerender(); }, 'btn sm ic');
    c.body.append(h('div', { class: 'pl' + (s.hide ? ' hidden' : '') + (lv.on ? ' lvon' + (s.live.big ? ' lvbig' : '') : '') }, q, seg(POLL_KINDS, k, v => { s.kind = v; s.hist = []; s.qid = uid(); save(); c.rerender(); }, 'Answer type'), lv.panel, box,
      h('div', { class: 'pl-foot' }, tot, h('span', { class: 'sp' }), lv.button, eye, ib('undo', 'Undo last vote', () => { const i = s.hist.pop(); if (i != null && s.votes[k][i] > 0) { s.votes[k][i]--; save(); paint(); } }, 'btn sm ic'), confirmBtn('Clear votes', 'Tap again', () => { s.votes[k] = s.votes[k].map(() => 0); s.hist = []; s.qid = uid(); save(); c.rerender(); if (lv.on) toast('Votes cleared. Students can vote again.'); }))));
    function paint() {
      const v = s.votes[k], sum = v.reduce((a, b) => a + b, 0), mx = Math.max(1, ...v);
      items.forEach((it, i) => {
        const pct = sum ? Math.round(v[i] / sum * 100) : 0;
        if (k === 'face') it.bar.parentNode.style.setProperty('--h', (v[i] / mx * 100) + '%'); else it.bar.style.width = (sum ? v[i] / mx * 100 : 0) + '%';
        it.ct.replaceChildren(String(v[i]), h('small', {}, pct + '%'));
      });
      tot.textContent = sum === 1 ? '1 vote' : sum + ' votes';
    }
    paint();
  },
};

T.scoreboard = {
  title: 'Scoreboard', icon: 'scoreboard', w: 420, h: 280, sh: 300, minW: 240, minH: 200, edit: true,
  init: () => ({ teams: [{ n: 'Falcons', p: 0, c: 'butter' }, { n: 'Dolphins', p: 0, c: 'aqua' }] }),
  mount(c) {
    const s = c.s, COL = ['butter', 'aqua', 'pink', 'mint', 'lav', 'peach'];
    if (c.editing) {
      c.body.append(h('div', { class: 'form' },
        ...s.teams.map((t, i) => h('div', { class: 'row nw' },
          h('input', { class: 'inp', id: `sbn-${c.wd.id}-${i}`, 'aria-label': 'Team name', value: t.n, maxlength: 30, oninput: e => { t.n = e.target.value; save(); } }),
          h('button', { class: 'chip', type: 'button', 'aria-label': 'Change colour', style: { background: `var(--${t.c})`, width: '2.6rem', flex: 'none' }, onclick: () => { t.c = COL[(COL.indexOf(t.c) + 1) % 6]; save(); c.rerender(); } }),
          s.teams.length > 1 ? ib('trash', 'Remove team', () => { s.teams.splice(i, 1); save(); c.rerender(); }) : null)),
        h('div', { class: 'row' }, s.teams.length < 6 ? btn('Add a team', () => { s.teams.push({ n: 'Team ' + (s.teams.length + 1), p: 0, c: COL[s.teams.length % 6] }); save(); c.rerender(); }, 'btn sm', 'plus') : null),
        btn('Done', () => c.edit(false), 'btn pri')));
      return;
    }
    const wrap = h('div', { class: 'sb-teams', style: { '--n': s.teams.length } });
    const els = s.teams.map(t => {
      const pts = h('button', { class: 'pts', type: 'button', 'aria-label': 'Add a point to ' + t.n, onclick: () => bump(t, 1) });
      const el = h('div', { class: 'sb-t', style: { '--tc': `var(--${t.c})` } },
        h('div', { class: 'nm', contenteditable: 'true', spellcheck: 'false', oninput: e => { t.n = e.target.textContent; save(); } }, t.n), pts,
        h('div', { class: 'pm' }, h('button', { type: 'button', 'aria-label': 'Take a point', onclick: () => bump(t, -1) }, '−'), h('button', { type: 'button', 'aria-label': 'Add a point', onclick: () => bump(t, 1) }, '+')));
      wrap.append(el); return { t, el, pts };
    });
    const bump = (t, d) => { t.p = Math.max(0, t.p + d); save(); paint(); if (d > 0) Snd.play('pop'); };
    const paint = () => { const mx = Math.max(...s.teams.map(t => t.p)); els.forEach(e => { e.pts.textContent = e.t.p; e.el.classList.toggle('lead', mx > 0 && e.t.p === mx); }); };
    c.body.append(h('div', { class: 'sb' }, wrap, h('div', { class: 'sb-foot' }, confirmBtn('Reset scores', 'Tap again to reset', () => { s.teams.forEach(t => t.p = 0); save(); paint(); }))));
    paint();
  },
};
