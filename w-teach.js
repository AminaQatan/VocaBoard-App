/* ---------- Spin the wheel, speech timer, calculator, tongue twisters ---------- */
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function speak(text, lang = 'en-GB', rate = .9) {
  try {
    if (!window.speechSynthesis) { toast('This device can’t read aloud.'); return false; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = lang; u.rate = rate;
    const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.replace('_', '-').toLowerCase() === lang.toLowerCase()); if (v) u.voice = v;
    speechSynthesis.speak(u); return true;
  } catch (e) { return false; }
}
/* a big message over the whole board, e.g. the name picked by the wheel */
function bigPop(text, sub) {
  const host = app || document.body;
  let t;
  const close = () => { clearTimeout(t); box.remove(); };
  const card = h('div', { class: 'bigpop-card' }, sub ? h('small', {}, sub) : null, h('b', { dir: 'auto' }, text), h('span', { class: 'hint' }, 'Tap anywhere to close'));
  const box = h('div', { class: 'bigpop', role: 'dialog', 'aria-label': sub || 'Result', onclick: close }, card);
  host.append(box); confetti(card); Snd.play('win');
  t = setTimeout(close, 10000);
  return close;
}

/* ---------- Spin the wheel ---------- */
T.wheel = {
  title: 'Spin the wheel', icon: 'wheel', w: 520, h: 540, sh: 540, minW: 260, minH: 300, edit: true,
  init: () => ({ src: 'class', cls: null, list: ['Reading', 'Writing', 'Speaking', 'Listening', 'Grammar', 'Vocabulary'], remove: false, picked: [], rot: 0, last: null }),
  mount(c) {
    const s = c.s, id = c.wd.id;
    const srcSeg = seg([['class', 'Students in a class'], ['list', 'My own list']], s.src, v => { s.src = v; s.picked = []; save(); c.rerender(); }, 'What goes on the wheel');
    const rm = toggle('whr-' + id, 'Take each one off the wheel after it’s picked', s.remove, v => { s.remove = v; s.picked = []; save(); });
    if (c.editing) {
      if (s.src === 'class') { c.body.append(rosterEditor(c, h('div', { class: 'stack' }, field('What goes on the wheel', srcSeg), rm))); return; }
      const ta = h('textarea', { class: 'inp', id: 'whl-' + id, rows: 8, placeholder: 'One item per line', oninput: e => { s.list = e.target.value.split('\n').map(x => x.trim()).filter(Boolean).slice(0, 60); s.picked = []; save(); } });
      ta.value = s.list.join('\n');
      c.body.append(h('div', { class: 'form' }, field('What goes on the wheel', srcSeg), field('Items, one per line (names, topics, questions…)', ta), rm, h('div', { class: 'row' }, btn('Done', () => c.edit(false), 'btn pri'))));
      return;
    }
    const cl = s.src === 'class' ? classOf(s) : null;
    const all = cl ? presentOf(cl) : s.list.filter(Boolean);
    const items = s.remove ? all.filter(n => !s.picked.includes(n)) : all;
    const n = items.length, seg1 = n ? 360 / n : 360;
    const pt = (a, r) => { const t = a * Math.PI / 180; return [(r * Math.sin(t)).toFixed(2), (-r * Math.cos(t)).toFixed(2)]; };
    const cols = ['--lav', '--mint', '--aqua', '--pink', '--butter', '--peach'];
    const fs = Math.max(4.2, Math.min(13, 150 / Math.max(n, 5)));
    const maxCh = Math.max(6, Math.round(64 / fs * 1.15));
    let slices = '';
    items.forEach((name, i) => {
      const a0 = i * seg1, a1 = a0 + seg1, mid = a0 + seg1 / 2;
      let col = cols[i % 6]; if (n > 1 && i === n - 1 && n % 6 === 1) col = cols[2];
      const path = n === 1 ? `<circle r="100" style="fill:var(${col})"/>` : `<path d="M0 0L${pt(a0, 100).join(' ')}A100 100 0 ${seg1 > 180 ? 1 : 0} 1 ${pt(a1, 100).join(' ')}Z" style="fill:var(${col})"/>`;
      const label = name.length > maxCh ? name.slice(0, maxCh - 1) + '…' : name;
      slices += path + `<text transform="rotate(${(mid - 90).toFixed(2)}) translate(24 0)" font-size="${fs.toFixed(1)}" dominant-baseline="central">${label.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]))}</text>`;
    });
    const wheel = h('div', { class: 'wh-stage' + (n ? '' : ' empty'), html: `<svg viewBox="-112 -116 224 228" role="img" aria-label="Wheel with ${n} items"><g class="wh-g" style="transform:rotate(${s.rot}deg)"><circle r="104" class="wh-rim"/>${slices}<circle r="100" fill="none" class="wh-edge"/></g><path d="M-9 -113h18L0 -95z" class="wh-ptr"/></svg>` });
    const hub = h('button', { class: 'wh-hub', type: 'button', 'aria-label': 'Spin the wheel', disabled: !n }, 'SPIN');
    wheel.append(hub);
    const lastEl = h('span', { class: 'wh-last' }, s.last ? 'Last: ' + s.last : (n ? `${n} on the wheel` : ''));
    const g = wheel.querySelector('.wh-g');
    let spinning = false;
    function spin() {
      if (spinning || !n) return;
      spinning = true; hub.disabled = true; go.disabled = true;
      const win = Math.floor(Math.random() * n), jitter = (Math.random() - .5) * seg1 * .6;
      const targetMod = ((360 - (win * seg1 + seg1 / 2 + jitter)) % 360 + 360) % 360, curMod = ((s.rot % 360) + 360) % 360;
      let delta = targetMod - curMod; if (delta < 0) delta += 360;
      const end = s.rot + 360 * (5 + Math.floor(Math.random() * 3)) + delta, dur = reduceMotion() ? 250 : 5200;
      g.style.transition = `transform ${dur}ms cubic-bezier(.12,.62,.08,1)`;
      requestAnimationFrame(() => { g.style.transform = `rotate(${end}deg)`; });
      // ticking as each slice passes the pointer
      const norm = a => ((a % 360) + 540) % 360 - 180;
      let prevAng = norm(s.rot), acc = s.rot, lastSlice = Math.floor(s.rot / seg1), lastTick = 0, raf;
      const watch = ts => {
        const m = getComputedStyle(g).transform, v = m && m.match(/matrix\(([^)]+)\)/);
        if (v) {
          const [a, b] = v[1].split(',').map(Number), ang = Math.atan2(b, a) * 180 / Math.PI;
          acc += norm(ang - prevAng); prevAng = ang;
          const sl = Math.floor(acc / seg1); if (sl !== lastSlice && ts - lastTick > 40) { Snd.play('tick'); lastTick = ts; } lastSlice = sl;
        }
        raf = requestAnimationFrame(watch);
      };
      if (!reduceMotion()) raf = requestAnimationFrame(watch);
      setTimeout(() => {
        cancelAnimationFrame(raf);
        s.rot = end % 3600; g.style.transition = 'none'; g.style.transform = `rotate(${s.rot}deg)`;
        const name = items[win]; s.last = name; if (s.remove) s.picked.push(name); save();
        spinning = false;
        bigPop(name, cl ? classLabel(cl) : 'The wheel says');
        c.rerender();
      }, dur + 120);
    }
    hub.onclick = spin; wheel.querySelector('svg').addEventListener('click', spin);
    const go = btn('Spin', spin, 'btn pri', 'spin'); go.disabled = !n;
    const reset = s.remove && s.picked.length ? btn('Put everyone back', () => { s.picked = []; save(); c.rerender(); }, 'btn sm', 'reset') : null;
    const empty = !n ? h('p', { class: 'wh-msg' }, all.length ? 'Everyone has had a turn.' : (cl ? 'Add the students first.' : 'Add items first.'), ' ', btn(all.length ? 'Put everyone back' : 'Add', () => { if (all.length) { s.picked = []; save(); c.rerender(); } else c.edit(true); }, 'btn sm')) : null;
    c.body.append(h('div', { class: 'wh' }, wheel, empty, h('div', { class: 'wh-bar' }, lastEl, h('span', { class: 'sp' }), reset, go)));
  },
};

/* ---------- Speech timer: green, yellow and red timing cards ---------- */
const SPEECH_PRESETS = [['1-2', '1–2 min', 60, 90, 120], ['2-3', '2–3 min', 120, 150, 180], ['3-4', '3–4 min', 180, 210, 240], ['4-6', '4–6 min', 240, 300, 360], ['5-7', '5–7 min', 300, 360, 420], ['8-10', '8–10 min', 480, 540, 600], ['custom', 'Custom']];
const mmss = sec => { sec = Math.max(0, Math.floor(sec)); return Math.floor(sec / 60) + ':' + pad(sec % 60); };
const parseMmss = t => { const m = String(t).trim().match(/^(\d{1,3})(?::(\d{1,2}))?$/); return m ? (+m[1]) * 60 + (+(m[2] || 0)) : null; };
T.speech = {
  title: 'Speech timer', icon: 'speech', w: 480, h: 440, sh: 460, minW: 260, minH: 280, edit: true,
  init: () => ({ preset: '5-7', g: 300, y: 360, r: 420, start: null, acc: 0, speaker: '', hide: false, sound: false, log: [], cls: null }),
  mount(c) {
    const s = c.s, id = c.wd.id;
    const el = () => (s.acc + (s.start ? now() - s.start : 0)) / 1000;
    if (c.editing) {
      const custom = h('div', { class: 'sp-cust' + (s.preset === 'custom' ? '' : ' off') },
        ...[['g', 'Green card (minimum)'], ['y', 'Yellow card'], ['r', 'Red card (maximum)']].map(([k, lb]) => field(lb, h('input', { class: 'inp', id: `sp${k}-${id}`, inputmode: 'numeric', value: mmss(s[k]), placeholder: 'm:ss', onchange: e => { const v = parseMmss(e.target.value); if (v != null) { s[k] = v; save(); } e.target.value = mmss(s[k]); } }))));
      const chips = h('div', { class: 'chips' }, SPEECH_PRESETS.map(p => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(s.preset === p[0]), onclick: () => { s.preset = p[0]; if (p[2]) { s.g = p[2]; s.y = p[3]; s.r = p[4]; } save(); c.rerender(); } }, p[1])));
      const cls = h('select', { class: 'inp', id: 'spc-' + id, onchange: e => { s.cls = e.target.value || null; save(); } }, h('option', { value: '' }, 'No class list'), S.classes.map(x => h('option', { value: x.id, selected: x.id === s.cls }, classLabel(x))));
      c.body.append(h('div', { class: 'form' },
        field('Speech length', chips), custom,
        field('Speaker names from', cls),
        toggle('sph-' + id, 'Hide the time and show only the colour', s.hide, v => { s.hide = v; save(); }),
        toggle('sps-' + id, 'Play a soft sound at each colour', s.sound, v => { s.sound = v; save(); }),
        h('div', { class: 'row' }, btn('Done', () => c.edit(false), 'btn pri'), s.log.length ? confirmBtn('Clear the speaker list', 'Tap again to clear', () => { s.log = []; save(); c.rerender(); }) : null)));
      return;
    }
    const cl = s.cls && S.classes.find(x => x.id === s.cls);
    const dl = h('datalist', { id: 'spn-' + id }, (cl ? presentOf(cl) : []).map(n => h('option', { value: n })));
    const who = h('input', { class: 'inp sp-who', id: 'spw-' + id, list: 'spn-' + id, dir: 'auto', placeholder: 'Speaker’s name', value: s.speaker, maxlength: 40, oninput: e => { s.speaker = e.target.value; save(); } });
    const dg = h('div', { class: 'sp-time' }), lbl = h('div', { class: 'sp-lbl' });
    const marks = h('div', { class: 'sp-marks' }, [['g', 'Green'], ['y', 'Yellow'], ['r', 'Red']].map(([k, n]) => h('span', { class: 'sp-mk ' + k }, h('i', {}), n + ' ' + mmss(s[k]))));
    const go = h('button', { class: 'btn pri', type: 'button', onclick: () => { if (s.start) { s.acc = el() * 1000; s.start = null; } else s.start = now(); save(); paintBtns(); } });
    const next = btn('Save and next speaker', () => {
      const t = el(); if (t < 1) return;
      const ok = t >= s.g - 30 && t <= s.r + 30;
      s.log.unshift({ n: s.speaker.trim() || 'Speaker ' + (s.log.length + 1), t: Math.round(t), ok, short: t < s.g - 30 });
      s.log = s.log.slice(0, 40); s.acc = 0; s.start = null; s.speaker = ''; save(); c.rerender();
    }, 'btn', 'check');
    const reset = ib('reset', 'Reset the time', () => { s.acc = 0; s.start = null; save(); paintBtns(); upd(); }, 'btn ic');
    const log = s.log.length ? h('div', { class: 'sp-log' }, s.log.map(x => h('div', {}, h('span', { dir: 'auto' }, x.n), h('b', {}, mmss(x.t)), h('em', { class: x.ok ? 'ok' : 'no' }, x.ok ? 'On time' : x.short ? 'Too short' : 'Too long')))) : null;
    const wrap = h('div', { class: 'spt' }, h('div', { class: 'sp-card' }, dg, lbl, marks), h('div', { class: 'sp-ctrl' }, who, dl, h('div', { class: 'row nw' }, go, reset, next)), log);
    c.body.append(wrap);
    let lastPh = null;
    function phase(t) { return t >= s.r + 30 ? 'over' : t >= s.r ? 'r' : t >= s.y ? 'y' : t >= s.g ? 'g' : '0'; }
    function paintBtns() { go.replaceChildren(svg(s.start ? 'pause' : 'play'), s.start ? 'Pause' : el() ? 'Resume' : 'Start'); }
    function upd() {
      const t = el(), ph = phase(t);
      const str = s.hide ? '' : mmss(t);
      if (dg._s !== str) { dg._s = str; dg.textContent = str; }
      if (ph !== lastPh) {
        if (lastPh !== null && s.sound && s.start && ph !== '0') Snd.play(ph === 'r' || ph === 'over' ? 'chime' : 'pop');
        lastPh = ph; wrap.dataset.ph = ph;
        lbl.textContent = { 0: s.start || t ? 'Keep going' : 'Ready when you are', g: 'Green: you’ve reached the minimum', y: 'Yellow: start to finish', r: 'Red: time to stop', over: 'Over time' }[ph];
      }
      if (ph === 'over') { const o = '+' + mmss(t - s.r); if (lbl._o !== o) { lbl._o = o; lbl.textContent = 'Over time ' + o; } }
      wrap.classList.toggle('hidetime', s.hide);
    }
    paintBtns(); upd(); c.tick(upd);
  },
};

/* ---------- Calculator ---------- */
function calcEval(expr) {
  const nums = [], ops = []; let i = 0, wantNum = true;
  while (i < expr.length) {
    if (wantNum) { const m = expr.slice(i).match(/^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/); if (!m) return null; nums.push(parseFloat(m[0])); i += m[0].length; wantNum = false; }
    else { const ch = expr[i]; if (!/[+\-×÷]/.test(ch)) return null; ops.push(ch); i++; wantNum = true; }
  }
  if (wantNum || !nums.length) return null;
  const n2 = [nums[0]], o2 = [];
  for (let k = 0; k < ops.length; k++) {
    const o = ops[k], v = nums[k + 1];
    if (o === '×') n2[n2.length - 1] *= v; else if (o === '÷') { if (v === 0) return NaN; n2[n2.length - 1] /= v; } else { o2.push(o); n2.push(v); }
  }
  let r = n2[0]; o2.forEach((o, k) => { r = o === '+' ? r + n2[k + 1] : r - n2[k + 1]; });
  return Number(r.toPrecision(12));
}
const calcFmt = v => v == null ? '' : Number.isNaN(v) ? 'Can’t divide by 0' : !isFinite(v) ? 'Too big' : (Math.abs(v) >= 1e15 || (v !== 0 && Math.abs(v) < 1e-9)) ? v.toExponential(6) : v.toLocaleString('en', { maximumFractionDigits: 10 });
T.calc = {
  title: 'Calculator', icon: 'calc', w: 330, h: 480, sh: 480, minW: 220, minH: 340,
  init: () => ({ e: '', hist: [] }),
  mount(c) {
    const s = c.s;
    const exprEl = h('div', { class: 'cl-expr' }), resEl = h('div', { class: 'cl-res', 'aria-live': 'polite' });
    const lastNum = () => { const m = s.e.match(/(\d*\.?\d*(?:e[+-]?\d+)?)$/); let ln = m ? m[1] : ''; const i = s.e.length - ln.length; if (s.e[i - 1] === '-' && (i - 1 === 0 || /[+\-×÷]/.test(s.e[i - 2]))) ln = '-' + ln; return ln; };
    const isOp = ch => /[+\-×÷]$/.test(ch);
    function press(k) {
      let e = s.e;
      if (k === 'C') e = '';
      else if (k === '⌫') e = e.slice(0, -1);
      else if (k === '=') { const v = calcEval(e); if (v != null && !Number.isNaN(v) && isFinite(v)) { s.hist.unshift(`${e} = ${calcFmt(v)}`); s.hist = s.hist.slice(0, 6); e = String(v); } else if (Number.isNaN(v)) { toast('You can’t divide by 0.'); } }
      else if (/[+\-×÷]/.test(k)) { if (!e && k === '-') e = '-'; else if (e && !/[+\-×÷]$/.test(e)) e += k; else if (e.length > 1) e = e.slice(0, -1) + k; }
      else if (k === '.') { const ln = lastNum(); if (!ln.includes('.')) e += (ln === '' || ln === '-') ? '0.' : '.'; }
      else if (k === '±') { const ln = lastNum(); if (ln) { const base = e.slice(0, e.length - ln.length); e = base + (ln.startsWith('-') ? ln.slice(1) : '-' + ln); } }
      else if (k === '%') { const ln = lastNum(); if (ln && ln !== '-') e = e.slice(0, e.length - ln.length) + String(Number((parseFloat(ln) / 100).toPrecision(12))); }
      else if (/\d/.test(k)) { if (lastNum() === '0') e = e.slice(0, -1); if (e.replace(/[^\d]/g, '').length < 15) e += k; }
      s.e = e; save(); paint();
    }
    function paint() {
      exprEl.textContent = (s.e || '0').replace(/-/g, '−');
      const v = s.e && !isOp(s.e) ? calcEval(s.e) : null;
      resEl.textContent = v != null && /[+\-×÷]/.test(s.e.slice(1)) ? '= ' + calcFmt(v) : '';
      hist.replaceChildren(...s.hist.map(x => h('div', {}, x)));
    }
    const keys = ['C', '⌫', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '±', '0', '.', '='];
    const pad1 = h('div', { class: 'cl-keys' }, keys.map(k => h('button', { type: 'button', class: 'cl-k' + (/[+\-×÷]/.test(k) ? ' op' : k === '=' ? ' eq' : /[C⌫%±]/.test(k) ? ' fn' : ''), 'aria-label': { '⌫': 'Delete', '±': 'Change sign', '-': 'Minus', '÷': 'Divide', '×': 'Times', C: 'Clear' }[k] || k, onclick: () => press(k) }, k === '-' ? '−' : k)));
    const hist = h('div', { class: 'cl-hist' });
    const root = h('div', { class: 'cl', tabindex: '0', 'aria-label': 'Calculator. You can type numbers on the keyboard.' }, h('div', { class: 'cl-disp' }, hist, exprEl, resEl), pad1);
    c.on(root, 'keydown', e => {
      const map = { '*': '×', x: '×', '/': '÷', Enter: '=', '=': '=', Backspace: '⌫', Escape: 'C', Delete: 'C', ',': '.' };
      const k = map[e.key] || e.key;
      if (/^[\d.+\-×÷%=⌫C]$/.test(k)) { e.preventDefault(); press(k); }
    });
    c.body.append(root); paint();
  },
};

/* ---------- Tongue twisters ---------- */
const TT_LIST = [
  ['Red lorry, yellow lorry.', 1], ['Toy boat. Toy boat. Toy boat.', 1], ['Fresh fried fish.', 1], ['Big black bug bit a big black bear.', 1],
  ['Unique New York.', 1], ['A proper copper coffee pot.', 1], ['Eleven benevolent elephants.', 1], ['Truly rural.', 1], ['Green glass globes glow greenly.', 1], ['Six slippery snails slid slowly seaward.', 1],
  ['She sells seashells by the seashore.', 2], ['Peter Piper picked a peck of pickled peppers.', 2], ['How much wood would a woodchuck chuck if a woodchuck could chuck wood?', 2],
  ['I scream, you scream, we all scream for ice cream.', 2], ['Fred fed Ted bread, and Ted fed Fred bread.', 2], ['Which witch is which?', 2], ['Four fine fresh fish for you.', 2],
  ['Three free throws.', 2], ['Black background, brown background.', 2], ['A big bug bit the little beetle, but the little beetle bit the big bug back.', 2],
  ['Betty Botter bought some butter, but she said the butter’s bitter.', 3], ['Can you can a can as a canner can can a can?', 3], ['If two witches were watching two watches, which witch would watch which watch?', 3],
  ['Thirty-three thousand people think that Thursday is their thirtieth birthday.', 3], ['Lesser leather never weathered wetter weather better.', 3], ['Brisk brave brigadiers brandished broad bright blades.', 3],
  ['The thirty-three thieves thought that they thrilled the throne throughout Thursday.', 3], ['Pad kid poured curd pulled cod.', 3], ['Rolling red wagons.', 3], ['Six sticky skeletons.', 3],
];
const TT_SOUNDS = {
  s: { n: ['Sam', 'Sally', 'Simon', 'Sara', 'Salim'], v: ['saw', 'sold', 'sorted', 'served', 'sent'], q: ['six', 'seven', 'sixteen', 'sixty'], a: ['silly', 'sleepy', 'slimy', 'salty', 'small', 'sunny'], o: ['snake', 'sock', 'sandwich', 'snail', 'seal', 'star'], p: ['by the sea', 'at the seaside', 'in the city', 'at the station', 'at school'] },
  sh: { n: ['Shelly', 'Shane', 'Sharon', 'Shadi'], v: ['shined', 'shook', 'shared', 'showed', 'shipped'], a: ['shiny', 'shy', 'short', 'sharp', 'shabby'], o: ['shell', 'shoe', 'ship', 'shirt', 'shark'], p: ['on the shore', 'at the shop', 'in the shed', 'in the shower'] },
  p: { n: ['Peter', 'Polly', 'Paula', 'Paul'], v: ['packed', 'picked', 'painted', 'passed', 'pushed'], a: ['pink', 'purple', 'plump', 'pretty', 'pickled'], o: ['pepper', 'pencil', 'puppy', 'pear', 'parrot', 'pot'], p: ['in the park', 'by the pool', 'at the palace', 'on the pier'] },
  b: { n: ['Ben', 'Betty', 'Bella', 'Badr'], v: ['bought', 'baked', 'borrowed', 'bounced', 'brought'], a: ['big', 'blue', 'brown', 'bright', 'bouncy'], o: ['ball', 'banana', 'button', 'balloon', 'bear', 'bug'], p: ['at the beach', 'at the bakery', 'on the bridge', 'in the barn'] },
  t: { n: ['Tom', 'Tina', 'Ted', 'Tariq'], v: ['took', 'tied', 'tossed', 'tasted', 'touched'], q: ['two', 'ten', 'twelve', 'twenty'], a: ['tiny', 'tall', 'tasty', 'tired', 'tricky'], o: ['turtle', 'tomato', 'teapot', 'tiger', 'toy'], p: ['in town', 'on the tower', 'at the table', 'on the train'] },
  th: { n: ['Theo', 'Thea', 'Thabit'], v: ['thought about', 'threw', 'thanked', 'thumped'], q: ['three', 'thirteen', 'thirty', 'a thousand'], a: ['thin', 'thick', 'thirsty', 'thoughtful'], o: ['thimble', 'thistle', 'thing', 'thermos'], p: ['at the theatre', 'through the thicket', 'on Thursday'] },
  f: { n: ['Fred', 'Fiona', 'Fatima', 'Faisal'], v: ['found', 'fed', 'fixed', 'fried', 'fetched'], q: ['four', 'five', 'fifteen', 'fifty'], a: ['fresh', 'funny', 'fancy', 'fluffy', 'fast'], o: ['frog', 'feather', 'flower', 'flag', 'fox'], p: ['on the farm', 'in the field', 'in the forest', 'at the fair'] },
  r: { n: ['Rita', 'Rob', 'Rami', 'Rose'], v: ['rolled', 'raced', 'rescued', 'rubbed'], a: ['red', 'round', 'rusty', 'rich', 'rainy'], o: ['rabbit', 'rocket', 'ring', 'robot', 'radish'], p: ['by the river', 'on the road', 'on the roof', 'in the room'] },
  ch: { n: ['Charlie', 'Chester', 'Chad'], v: ['chose', 'chased', 'checked', 'chopped', 'chewed'], a: ['cheerful', 'cheap', 'cheesy', 'chubby', 'chilly'], o: ['chicken', 'cherry', 'chair', 'chip', 'cheetah'], p: ['at the chess club', 'at the cheese shop', 'on the chicken farm'] },
  w: { n: ['Will', 'Wendy', 'Walid', 'Wafa'], v: ['washed', 'watched', 'wished for', 'waved at'], a: ['wet', 'wild', 'white', 'woolly', 'wobbly'], o: ['whale', 'worm', 'watch', 'window', 'wagon'], p: ['in the woods', 'in the water', 'by the wall', 'on the wharf'] },
  k: { n: ['Kate', 'Carl', 'Karim', 'Kevin'], v: ['counted', 'caught', 'cooked', 'carried', 'kicked'], a: ['cute', 'cold', 'curly', 'crazy', 'cool'], o: ['cat', 'cake', 'carrot', 'camel', 'kite', 'kettle'], p: ['in the kitchen', 'at the castle', 'in the cave', 'at the café'] },
};
const ttPlural = w => ({ tomato: 'tomatoes', potato: 'potatoes', fox: 'foxes' }[w]) || (/(s|sh|ch|x)$/.test(w) ? w + 'es' : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's');
const ttPick = a => a[Math.floor(Math.random() * a.length)];
function ttMake(snd) {
  const B = TT_SOUNDS[snd]; if (!B) return '';
  const used = new Set(), pk = a => { const c = a.filter(x => !used.has(x)); const v = ttPick(c.length ? c : a); used.add(v); return v; };
  const n1 = pk(B.n), n2 = pk(B.n), qty = () => B.q ? pk(B.q) : pk(B.a), cap = w => w[0].toUpperCase() + w.slice(1);
  const t = Math.floor(Math.random() * 3);
  if (t === 0) return `${n1} ${pk(B.v)} ${qty()} ${pk(B.a)} ${ttPlural(pk(B.o))} ${pk(B.p)}.`;
  if (t === 1) return `${cap(pk(B.a))} ${n1} ${pk(B.v)} ${pk(B.a)} ${ttPlural(pk(B.o))}, but ${n2} ${pk(B.v)} ${pk(B.a)} ${ttPlural(pk(B.o))}.`;
  return `${n1} and ${n2} ${pk(B.v)} ${qty()} ${pk(B.a)} ${ttPlural(pk(B.o))} ${pk(B.p)}.`;
}
function ttMarkup(text) {
  const words = text.split(/(\s+)/), ini = w => { const l = w.toLowerCase().replace(/[^a-z]/g, ''); return /^(sh|ch|th|wh|ph)/.test(l) ? l.slice(0, 2) : l.slice(0, 1); };
  const count = {}; words.forEach(w => { const i = ini(w); if (i) count[i] = (count[i] || 0) + 1; });
  const top = Object.keys(count).sort((a, b) => count[b] - count[a])[0];
  return words.map(w => { if (!w.trim()) return w; const i = ini(w); const esc = w.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m])); if (i !== top || count[top] < 2) return esc; const k = esc.search(/[A-Za-z]/); return esc.slice(0, k) + '<mark>' + esc.slice(k, k + i.length) + '</mark>' + esc.slice(k + i.length); }).join('');
}
T.tongue = {
  title: 'Tongue twisters', icon: 'tongue', w: 600, h: 440, sh: 460, minW: 280, minH: 300,
  init: () => ({ text: 'She sells seashells by the seashore.', lvl: 0, snd: 's', best: {}, start: null, last: null }),
  mount(c) {
    const s = c.s;
    const levelSeg = seg([[0, 'All'], [1, 'Easy'], [2, 'Medium'], [3, 'Hard']], s.lvl, v => { s.lvl = v; save(); c.rerender(); }, 'Level');
    const sndSel = h('select', { class: 'inp tt-snd', id: 'tts-' + c.wd.id, 'aria-label': 'Sound', onchange: e => { s.snd = e.target.value; save(); } }, Object.keys(TT_SOUNDS).map(k => h('option', { value: k, selected: k === s.snd }, '“' + k + '” sound')));
    const card = h('div', { class: 'tt-card', dir: 'ltr' });
    const timeEl = h('div', { class: 'tt-time' }), bestEl = h('div', { class: 'tt-best' });
    const go = h('button', { class: 'btn pri', type: 'button' });
    const setText = t => { s.text = t; s.start = null; s.last = null; save(); c.rerender(); };
    const next = () => { const pool = TT_LIST.filter(x => !s.lvl || x[1] === s.lvl).map(x => x[0]).filter(x => x !== s.text); setText(ttPick(pool)); };
    go.onclick = () => {
      if (s.start) { s.last = (now() - s.start) / 1000; s.start = null; const b = s.best[s.text]; if (!b || s.last < b) { s.best[s.text] = s.last; Snd.play('win'); } else Snd.play('pop'); }
      else { s.start = now(); s.last = null; }
      save(); paint();
    };
    const len = s.text.length;
    card.style.setProperty('--fs', len > 90 ? '5.2cqw' : len > 60 ? '6.2cqw' : len > 35 ? '7.4cqw' : '9cqw');
    card.innerHTML = '<p>' + ttMarkup(s.text) + '</p>';
    c.body.append(h('div', { class: 'tt' },
      h('div', { class: 'tt-top' }, levelSeg, h('span', { class: 'sp' }), sndSel, btn('Make one', () => setText(ttMake(s.snd)), 'btn sm', 'shuffle')),
      card,
      h('p', { class: 'tt-say' }, 'Say it 3 times, as fast as you can!'),
      h('div', { class: 'tt-bar' }, timeEl, bestEl, h('span', { class: 'sp' }), ib('vol', 'Read it aloud slowly', () => speak(s.text, 'en-GB', .75), 'btn ic'), btn('Next', next, 'btn', 'right'), go)));
    function paint() {
      go.replaceChildren(svg(s.start ? 'stop' : 'play'), s.start ? 'Stop' : 'Start');
      const b = s.best[s.text]; bestEl.textContent = b ? 'Best: ' + b.toFixed(1) + ' s' : '';
      upd();
    }
    function upd() {
      const t = s.start ? (now() - s.start) / 1000 : s.last;
      const str = t == null ? '' : t.toFixed(1) + ' s'; if (timeEl._s !== str) { timeEl._s = str; timeEl.textContent = str; }
      timeEl.classList.toggle('run', !!s.start);
    }
    paint(); c.tick(upd);
  },
};
