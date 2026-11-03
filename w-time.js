/* ---------- Time tools ---------- */
function numIn(id, v, max) {
  return h('input', { class: 'inp', id, type: 'number', inputmode: 'numeric', min: 0, max, value: String(v) });
}
function runClock(s) {
  // shared countdown state: dur (s), left (s), end (ms timestamp when running), done
  return {
    rem: () => s.end ? Math.max(0, (s.end - now()) / 1000) : s.left,
    start() { if (s.left <= 0) s.left = s.dur; s.end = now() + s.left * 1000; s.done = false; save(); },
    pause() { s.left = this.rem(); s.end = null; save(); },
    reset() { s.left = s.dur; s.end = null; s.done = false; save(); },
    set(sec) { s.dur = s.left = Math.max(1, Math.round(sec)); s.end = null; s.done = false; save(); },
    add(sec) { if (s.end) s.end += sec * 1000; else s.left = Math.max(0, s.left + sec); s.dur = Math.max(s.dur + sec, 1); s.done = false; save(); },
  };
}
function finishCheck(c, clock, onDone) {
  const s = c.s;
  if (s.end && clock.rem() <= 0) { s.end = null; s.left = 0; s.done = true; save(); if (s.snd !== 'none') Snd.play(s.snd || 'bell'); onDone && onDone(); }
  c.el.classList.toggle('alarm', !!s.done);
}

T.timer = {
  title: 'Timer', icon: 'timer', w: 300, h: 310, sh: 330, minW: 200, minH: 200, edit: true,
  init: () => ({ dur: 300, left: 300, end: null, snd: 'bell', done: false }),
  mount(c) {
    const s = c.s, clock = runClock(s);
    if (c.editing) {
      const t = Math.round(s.dur), hh = numIn('th-' + c.wd.id, Math.floor(t / 3600), 23), mm = numIn('tm-' + c.wd.id, Math.floor(t % 3600 / 60), 59), ss = numIn('ts-' + c.wd.id, t % 60, 59);
      const apply = () => clock.set((+hh.value || 0) * 3600 + (+mm.value || 0) * 60 + (+ss.value || 0));
      [hh, mm, ss].forEach(i => i.addEventListener('change', apply));
      c.body.append(h('div', { class: 'form' },
        h('div', { class: 'hms' }, field('Hours', hh), field('Minutes', mm), field('Seconds', ss)),
        field('Sound at the end', soundPick(s)),
        btn('Done', () => { apply(); c.edit(false); }, 'btn pri')));
      return;
    }
    const C = 2 * Math.PI * 44;
    const ring = h('div', { class: 'ring', html: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="trk" cx="50" cy="50" r="44"/><circle class="prg" cx="50" cy="50" r="44" stroke-dasharray="${C.toFixed(2)}"/></svg>` });
    const dg = h('span', { class: 'big-digits' }), lbl = h('small', {});
    const face = h('button', { class: 'face', type: 'button', title: 'Set the time', onclick: () => { if (s.done) { s.done = false; clock.reset(); upd(); } else if (!s.end) c.edit(true); } }, dg, lbl);
    ring.append(face);
    const prg = ring.querySelector('.prg');
    const go = h('button', { class: 'btn pri', type: 'button', onclick: () => { s.end ? clock.pause() : clock.start(); upd(); } });
    const presets = h('div', { class: 'presets' }, [1, 2, 3, 5, 10, 15, 20, 30].map(m => h('button', { class: 'chip', type: 'button', onclick: () => { clock.set(m * 60); upd(); } }, m + ' min')));
    const ctrls = h('div', { class: 'ctrls' },
      h('button', { class: 'btn sm hide-s', type: 'button', title: '1 minute less', 'aria-label': '1 minute less', onclick: () => { clock.add(-60); upd(); } }, '−1'), go,
      ib('reset', 'Reset', () => { clock.reset(); upd(); }, 'btn ic'),
      h('button', { class: 'btn sm hide-s', type: 'button', title: '1 minute more', 'aria-label': '1 minute more', onclick: () => { clock.add(60); upd(); } }, '+1'));
    c.body.append(h('div', { class: 'tm' }, ring, presets, ctrls));
    function upd() {
      finishCheck(c, clock);
      const r = clock.rem(), f = s.dur ? clamp(r / s.dur, 0, 1) : 0;
      const str = fmtHMS(Math.ceil(r - 0.001));
      setDigits(dg, str); dg.classList.toggle('long', str.length > 5);
      prg.style.strokeDashoffset = (C * (1 - f)).toFixed(2);
      ring.classList.toggle('mid', f <= .5 && f > .2); ring.classList.toggle('low', f <= .2);
      lbl.textContent = s.done ? 'Time’s up!' : s.end ? '' : (r < s.dur ? 'Paused' : 'Tap to set');
      const lab = s.end ? 'Pause' : (r < s.dur && r > 0 ? 'Resume' : 'Start');
      if (go._l !== lab) { go._l = lab; go.replaceChildren(svg(s.end ? 'pause' : 'play'), lab); }
    }
    c.tick(upd);
  },
};

T.vtimer = {
  title: 'Visual timer', icon: 'vtimer', w: 320, h: 370, sh: 400, minW: 200, minH: 230, edit: true,
  init: () => ({ max: 60, dur: 900, left: 900, end: null, col: 'pink', snd: 'chime', done: false }),
  mount(c) {
    const s = c.s, clock = runClock(s);
    if (c.editing) {
      c.body.append(h('div', { class: 'form' },
        field('Clock face', seg([[10, '10 minutes'], [30, '30 minutes'], [60, '60 minutes']], s.max, v => { s.max = v; if (s.dur > v * 60) clock.set(v * 60); save(); c.rerender(); })),
        field('Colour', h('div', { class: 'chips' }, ['pink', 'lav', 'aqua', 'mint', 'butter', 'peach'].map(k => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(s.col === k), 'aria-label': k, style: { background: `var(--${k})`, width: '2.4rem' }, onclick: () => { s.col = k; save(); c.rerender(); } })))),
        field('Sound at the end', soundPick(s)),
        btn('Done', () => c.edit(false), 'btn pri')));
      return;
    }
    const M = s.max, R = 80, cx = 100, cy = 100;
    const pt = (v, r) => { const a = v / M * 2 * Math.PI; return [cx - r * Math.sin(a), cy - r * Math.cos(a)]; };
    const step = M === 10 ? .5 : 1, lab = M === 10 ? 1 : 5;
    let ticks = '', nums = '';
    for (let v = 0; v < M; v += step) {
      const major = Math.abs(v / lab - Math.round(v / lab)) < 1e-6;
      const [x1, y1] = pt(v, R + 2), [x2, y2] = pt(v, R - (major ? 9 : 4));
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="${major ? 2.6 : 1.3}"/>`;
      if (major) { const [x, y] = pt(v, R + 12); nums += `<text x="${x.toFixed(1)}" y="${(y + 3.5).toFixed(1)}">${v}</text>`; }
    }
    const dial = h('div', { class: 'vt-dial', role: 'slider', 'aria-label': 'Drag to set minutes', tabindex: '0', html:
      `<svg viewBox="-12 -12 224 224" aria-hidden="true"><circle cx="100" cy="100" r="${R + 2}" fill="var(--card)" stroke="var(--edge)" stroke-width="3"/><path class="wedge" fill="var(--${s.col})" stroke="var(--edge)" stroke-width="2" stroke-linejoin="round"/><g stroke="var(--ink)" stroke-linecap="round">${ticks}</g><g fill="var(--ink-soft)" font-family="Lexend, sans-serif" font-size="11" font-weight="500" text-anchor="middle">${nums}</g><circle cx="100" cy="100" r="9" fill="var(--card)" stroke="var(--edge)" stroke-width="3"/></svg>` });
    const wedge = dial.querySelector('.wedge');
    const left = h('div', { class: 'vt-left big-digits' });
    const go = h('button', { class: 'btn pri', type: 'button', onclick: () => { s.end ? clock.pause() : clock.start(); upd(); } });
    c.body.append(h('div', { class: 'vt' }, dial, left, h('div', { class: 'ctrls' }, go, ib('reset', 'Reset', () => { clock.reset(); upd(); }, 'btn ic'))));
    const setFrom = e => {
      const r = dial.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      let a = Math.atan2(-dx, -dy); if (a < 0) a += 2 * Math.PI;
      let m = Math.round(a / (2 * Math.PI) * M / step) * step; if (m <= 0) m = step;
      clock.set(m * 60); upd();
    };
    dial.addEventListener('pointerdown', e => {
      if (s.end) return; e.preventDefault(); dial.setPointerCapture(e.pointerId); setFrom(e);
      const mv = ev => setFrom(ev), up = () => { dial.removeEventListener('pointermove', mv); dial.removeEventListener('pointerup', up); };
      dial.addEventListener('pointermove', mv); dial.addEventListener('pointerup', up);
    });
    dial.addEventListener('keydown', e => { if (s.end) return; const d = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -1 : 0; if (d) { e.preventDefault(); clock.set(clamp(s.dur / 60 + d * step, step, M) * 60); upd(); } });
    function upd() {
      finishCheck(c, clock);
      const r = Math.min(clock.rem(), M * 60), v = r / 60;
      if (v >= M - 1e-3) wedge.setAttribute('d', `M100 100m-${R} 0a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 -${2 * R} 0`);
      else if (v <= 0) wedge.setAttribute('d', '');
      else { const [x, y] = pt(v, R); wedge.setAttribute('d', `M100 100L100 ${100 - R}A${R} ${R} 0 ${v > M / 2 ? 1 : 0} 0 ${x.toFixed(2)} ${y.toFixed(2)}Z`); }
      setDigits(left, s.done ? '00:00' : fmtHMS(Math.ceil(r - .001)));
      dial.setAttribute('aria-valuenow', Math.round(v));
      const lab = s.end ? 'Pause' : 'Start';
      if (go._l !== lab) { go._l = lab; go.replaceChildren(svg(s.end ? 'pause' : 'play'), lab); }
    }
    c.tick(upd);
  },
};

T.stopwatch = {
  title: 'Stopwatch', icon: 'stopwatch', w: 320, h: 300, sh: 300, minW: 200, minH: 160,
  init: () => ({ start: null, acc: 0, laps: [] }),
  mount(c) {
    const s = c.s;
    const el = () => s.acc + (s.start ? now() - s.start : 0);
    const dg = h('div', { class: 'big-digits' });
    const go = h('button', { class: 'btn pri', type: 'button', onclick: () => { if (s.start) { s.acc = el(); s.start = null; } else s.start = now(); save(); paint(); } });
    const second = h('button', { class: 'btn', type: 'button', onclick: () => { if (s.start) { s.laps.unshift(el()); } else { s.acc = 0; s.laps = []; } save(); paint(); } });
    const laps = h('div', { class: 'laps' });
    c.body.append(h('div', { class: 'swc' }, dg, h('div', { class: 'ctrls' }, go, second), laps));
    function paint() {
      go.replaceChildren(svg(s.start ? 'pause' : 'play'), s.start ? 'Stop' : el() ? 'Resume' : 'Start');
      second.replaceChildren(svg(s.start ? 'flag' : 'reset'), s.start ? 'Lap' : 'Reset');
      second.disabled = !s.start && !el();
      const L = s.laps; laps.replaceChildren(...L.map((t, i) => h('div', {}, h('span', {}, 'Lap ' + (L.length - i)), h('b', {}, fmtHMS((t - (L[i + 1] || 0)) / 1000, true)))));
      upd();
    }
    function upd() {
      const ms = el(), str = fmtHMS(ms / 1000, true);
      if (dg._s === str) return; dg._s = str;
      const [main, t] = str.split('.');
      dg.innerHTML = main.split('').map(ch => ch === ':' ? '<i>:</i>' : `<b>${ch}</b>`).join('') + `<span class="t"><i>.</i><b>${t}</b></span>`;
    }
    paint(); c.tick(upd);
  },
};

T.clock = {
  title: 'Clock', icon: 'clock', w: 300, h: 196, sh: 220, minW: 180, minH: 130, edit: true,
  init: () => {
    let h24 = false; try { const hc = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hourCycle; h24 = hc === 'h23' || hc === 'h24'; } catch (e) {}
    return { mode: 'digital', h24, sec: true, date: true };
  },
  mount(c) {
    const s = c.s;
    if (c.editing) {
      c.body.append(h('div', { class: 'form' },
        field('Style', seg([['digital', 'Digital'], ['analog', 'Analogue']], s.mode, v => { s.mode = v; save(); c.rerender(); })),
        toggle('ck24-' + c.wd.id, '24-hour time', s.h24, v => { s.h24 = v; save(); }),
        toggle('cks-' + c.wd.id, 'Show seconds', s.sec, v => { s.sec = v; save(); }),
        toggle('ckd-' + c.wd.id, 'Show the date', s.date, v => { s.date = v; save(); }),
        btn('Done', () => c.edit(false), 'btn pri')));
      return;
    }
    const dfmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    const dateEl = h('div', { class: 'date' });
    if (s.mode === 'analog') {
      let marks = '', nums = '';
      for (let i = 0; i < 60; i++) { const a = i * 6 * Math.PI / 180, big = i % 5 === 0; marks += `<line x1="${100 + 92 * Math.sin(a)}" y1="${100 - 92 * Math.cos(a)}" x2="${100 + (big ? 82 : 87) * Math.sin(a)}" y2="${100 - (big ? 82 : 87) * Math.cos(a)}" stroke-width="${big ? 3 : 1.4}"/>`; }
      for (let n = 1; n <= 12; n++) { const a = n * 30 * Math.PI / 180; nums += `<text x="${(100 + 67 * Math.sin(a)).toFixed(1)}" y="${(100 - 67 * Math.cos(a) + 7).toFixed(1)}">${n}</text>`; }
      const face = h('div', { html: `<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="var(--card)" stroke="var(--edge)" stroke-width="4"/><g stroke="var(--ink)" stroke-linecap="round">${marks}</g><g font-family="Fredoka, sans-serif" font-weight="600" font-size="20" text-anchor="middle" fill="var(--ink)">${nums}</g><line class="hh" x1="100" y1="108" x2="100" y2="54" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/><line class="mh" x1="100" y1="110" x2="100" y2="30" stroke="var(--ink)" stroke-width="4.5" stroke-linecap="round"/><line class="sh" x1="100" y1="116" x2="100" y2="24" stroke="var(--stop)" stroke-width="2" stroke-linecap="round"/><circle cx="100" cy="100" r="6" fill="var(--stop)"/></svg>`, style: { height: '100%', minHeight: 0, display: 'grid', justifyItems: 'center' } });
      const [hh, mh, sh] = ['.hh', '.mh', '.sh'].map(q => face.querySelector(q));
      sh.style.display = s.sec ? '' : 'none';
      c.body.append(h('div', { class: 'clk-a' }, face, s.date ? dateEl : null));
      let last = -1;
      c.tick(() => {
        const d = new Date(), t = d.getSeconds(); if (t === last) return; last = t;
        const m = d.getMinutes() + t / 60, hr = d.getHours() % 12 + m / 60;
        hh.setAttribute('transform', `rotate(${hr * 30} 100 100)`); mh.setAttribute('transform', `rotate(${m * 6} 100 100)`); sh.setAttribute('transform', `rotate(${t * 6} 100 100)`);
        dateEl.textContent = dfmt.format(d);
      });
      return;
    }
    const tm = h('div', { class: 'time' }), main = h('span', { class: 'big-digits' }), sup = h('sup', {});
    tm.append(main, sup);
    c.body.append(h('div', { class: 'clk' }, tm, s.date ? dateEl : null));
    let last = '';
    c.tick(() => {
      const d = new Date(); let hr = d.getHours(); const ap = hr < 12 ? 'AM' : 'PM';
      if (!s.h24) hr = hr % 12 || 12;
      const str = (s.h24 ? pad(hr) : hr) + ':' + pad(d.getMinutes());
      const key = str + d.getSeconds(); if (key === last) return; last = key;
      setDigits(main, str);
      sup.replaceChildren(s.sec ? h('span', {}, pad(d.getSeconds())) : '', !s.h24 ? h('span', {}, ap) : '');
      dateEl.textContent = dfmt.format(d);
    });
  },
};

function weekPrefs() {
  try { const l = new Intl.Locale(navigator.language || 'en'); const w = (l.getWeekInfo && l.getWeekInfo()) || l.weekInfo; if (w) return { ws: w.firstDay % 7, we: w.weekend.map(d => d % 7) }; } catch (e) {}
  return { ws: 0, we: [0, 6] };
}
T.calendar = {
  title: 'Calendar', icon: 'calendar', w: 340, h: 330, sh: 340, minW: 220, minH: 220, edit: true,
  init: () => { const p = weekPrefs(); return { off: 0, ws: p.ws, we: p.we }; },
  mount(c) {
    const s = c.s;
    if (c.editing) {
      c.body.append(h('div', { class: 'form' },
        field('Week starts on', seg([[6, 'Saturday'], [0, 'Sunday'], [1, 'Monday']], s.ws, v => { s.ws = v; save(); c.rerender(); })),
        field('Weekend', seg([['5,6', 'Fri & Sat'], ['6,0', 'Sat & Sun'], ['0', 'Sunday only']], s.we.join(','), v => { s.we = v.split(',').map(Number); save(); c.rerender(); })),
        btn('Done', () => c.edit(false), 'btn pri')));
      return;
    }
    const today = new Date(), d0 = new Date(today.getFullYear(), today.getMonth() + s.off, 1);
    const mfmt = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
    const wfmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
    const go = d => { s.off += d; save(); c.rerender(); };
    const grid = h('div', { class: 'cal-g' });
    for (let i = 0; i < 7; i++) { const wd = (s.ws + i) % 7; grid.append(h('div', { class: 'wd' }, wfmt.format(new Date(2024, 0, 7 + wd)).replace('.', ''))); }
    const lead = (d0.getDay() - s.ws + 7) % 7, days = new Date(d0.getFullYear(), d0.getMonth() + 1, 0).getDate();
    const cells = Math.ceil((lead + days) / 7) * 7;
    for (let i = 0; i < cells; i++) {
      const d = new Date(d0.getFullYear(), d0.getMonth(), i - lead + 1);
      const isToday = d.toDateString() === today.toDateString();
      grid.append(h('div', { class: 'd' + (s.we.includes(d.getDay()) ? ' we' : '') + (d.getMonth() !== d0.getMonth() ? ' out' : '') + (isToday ? ' today' : '') }, h('span', {}, d.getDate())));
    }
    grid.style.gridTemplateRows = `auto repeat(${cells / 7}, minmax(0,1fr))`;
    c.body.append(h('div', { class: 'cal' },
      h('div', { class: 'cal-h' }, h('b', {}, mfmt.format(d0)), s.off ? btn('Today', () => go(-s.off), 'btn sm') : null, ib('left', 'Previous month', () => go(-1)), ib('right', 'Next month', () => go(1))), grid));
    let day = today.getDate();
    c.tick(() => { if (new Date().getDate() !== day) { day = new Date().getDate(); c.rerender(); } });
  },
};

T.countdown = {
  title: 'Event countdown', icon: 'countdown', w: 420, h: 250, sh: 270, minW: 240, minH: 170, edit: true,
  init: () => { const d = new Date(); d.setDate(d.getDate() + 21); d.setHours(8, 0, 0, 0); return { name: 'Science fair', at: d.getTime(), _title: 'Countdown (example)' }; },
  mount(c) {
    const s = c.s;
    if (c.editing) {
      const d = new Date(s.at), local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      c.body.append(h('div', { class: 'form' },
        field('Event', h('input', { class: 'inp', id: 'cdn-' + c.wd.id, value: s.name, maxlength: 60, oninput: e => { s.name = e.target.value; save(); } })),
        field('Date and time', h('input', { class: 'inp', id: 'cdt-' + c.wd.id, type: 'datetime-local', value: local, onchange: e => { const t = new Date(e.target.value).getTime(); if (!isNaN(t)) { s.at = t; save(); } } })),
        btn('Done', () => c.edit(false), 'btn pri')));
      return;
    }
    const title = h('h3', {}, s.name || 'Event');
    const units = ['Days', 'Hours', 'Minutes', 'Seconds'].map((n, i) => { const b = h('b', {}, '0'); return { b, el: h('div', { class: 'u' + (i === 0 ? ' main' : '') }, b, h('span', {}, n)) }; });
    const note = h('p', {});
    const dfmt = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' });
    c.body.append(h('div', { class: 'cd' }, title, h('div', { class: 'units' }, units.map(u => u.el)), note));
    c.tick(() => {
      let ms = s.at - now(); const past = ms < 0; ms = Math.abs(ms);
      const v = [Math.floor(ms / 864e5), Math.floor(ms % 864e5 / 36e5), Math.floor(ms % 36e5 / 6e4), Math.floor(ms % 6e4 / 1e3)];
      units.forEach((u, i) => { const t = i ? pad(v[i]) : String(v[i]); if (u.b.textContent !== t) u.b.textContent = t; });
      const n = past ? `Started ${dfmt.format(new Date(s.at))}` : dfmt.format(new Date(s.at));
      if (note.textContent !== n) note.textContent = n;
    });
  },
};

T.timetable = {
  title: 'Timetable', icon: 'timetable', w: 360, h: 470, sh: 470, minW: 220, minH: 200, edit: true,
  init: () => ({ _title: 'Today’s plan (example)', items: [
    { t: '07:30', a: 'Morning assembly' }, { t: '07:50', a: 'Arabic: reading circle' }, { t: '08:35', a: 'Maths: equivalent fractions' },
    { t: '09:20', a: 'Break' }, { t: '09:40', a: 'Science: plant cells' }, { t: '10:25', a: 'English: spelling quiz' },
    { t: '11:10', a: 'Art' }, { t: '11:55', a: 'Pack up and home time' }].map(x => Object.assign(x, { done: false })) }),
  mount(c) {
    const s = c.s;
    const mins = t => { const [a, b] = (t || '0:0').split(':').map(Number); return a * 60 + (b || 0); };
    if (c.editing) {
      const rows = h('div', { class: 'form' });
      const draw = () => {
        rows.replaceChildren(
          ...s.items.map((it, i) => h('div', { class: 'tt-e' },
            h('input', { class: 'inp', type: 'time', id: `tt-t-${c.wd.id}-${i}`, 'aria-label': 'Time', value: it.t, onchange: e => { it.t = e.target.value; save(); } }),
            h('input', { class: 'inp', id: `tt-a-${c.wd.id}-${i}`, 'aria-label': 'Activity', value: it.a, placeholder: 'Activity', oninput: e => { it.a = e.target.value; save(); } }),
            ib('trash', 'Remove row', () => { s.items.splice(i, 1); save(); draw(); }))),
          h('div', { class: 'row' },
            btn('Add a row', () => { const last = s.items[s.items.length - 1]; const m = last ? mins(last.t) + 45 : 480; s.items.push({ t: pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60), a: '', done: false }); save(); draw(); }, 'btn sm', 'plus'),
            btn('Untick all', () => { s.items.forEach(x => x.done = false); save(); }, 'btn sm')),
          btn('Done', () => { s.items.sort((a, b) => mins(a.t) - mins(b.t)); save(); c.edit(false); }, 'btn pri'));
      };
      draw(); c.body.append(rows); return;
    }
    const list = h('div', { class: 'tt' });
    if (!s.items.length) { c.body.append(h('div', { class: 'empty' }, h('p', {}, 'No activities yet.'), btn('Add activities', () => c.edit(true), 'btn sm', 'edit'))); return; }
    const rows = s.items.map((it, i) => {
      const r = h('button', { class: 'tt-r', type: 'button', onclick: () => { it.done = !it.done; save(); r.classList.toggle('done', it.done); } },
        h('time', {}, it.t), h('span', {}, it.a || '—'), h('i', { class: 'ck' }, svg('check')));
      r.classList.toggle('done', !!it.done); list.append(r); return r;
    });
    c.body.append(list);
    let lastM = -1;
    c.tick(() => {
      const d = new Date(), m = d.getHours() * 60 + d.getMinutes(); if (m === lastM) return; lastM = m;
      let cur = -1; s.items.forEach((it, i) => { if (mins(it.t) <= m) cur = i; });
      if (cur === s.items.length - 1 && m - mins(s.items[cur].t) > 60) cur = -2;
      rows.forEach((r, i) => { r.classList.toggle('now', i === cur); r.classList.toggle('past', cur === -2 || (cur >= 0 && i < cur)); });
      const n = rows[cur]; if (n && list.scrollHeight > list.clientHeight) n.scrollIntoView({ block: 'nearest' });
    });
  },
};
