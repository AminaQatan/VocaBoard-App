/* ---------- Shared helpers: voice input, writing checks, shape recogniser, picture library ---------- */

/* Voice input (Web Speech API). Works in Chrome, Edge and Safari; needs internet in most browsers. */
const VOICE_LANGS = [['en-GB', 'English'], ['ar-OM', 'العربية']];
function startVoice(lang, onText, onEnd) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast('Voice input isn\u2019t supported in this browser. Use Chrome, Edge or Safari.'); return null; }
  let stopped = false, fails = 0, quick = 0, t0 = 0, r = null, ended = false;
  const finish = () => { if (ended) return; ended = true; onEnd && onEnd(); };
  const ctl = { stop() { stopped = true; try { r && r.stop(); } catch (e) {} finish(); } };
  const run = () => {
    try { r = new SR(); } catch (e) { toast('Voice input isn\u2019t available here.'); stopped = true; finish(); return; }
    r.lang = lang; r.continuous = true; r.interimResults = true;
    r.onresult = e => { fails = 0; for (let i = e.resultIndex; i < e.results.length; i++) onText(e.results[i][0].transcript, e.results[i].isFinal); };
    r.onerror = e => {
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(e.error)) { stopped = true; toast(e.error === 'audio-capture' ? 'No microphone was found on this device.' : 'The microphone is blocked. Allow it for this page in the browser settings.'); }
      else if (e.error === 'language-not-supported') { stopped = true; toast('Voice input doesn\u2019t support this language on this device.'); }
      else if (e.error === 'network' && ++fails > 2) { stopped = true; toast('Voice input needs an internet connection.'); }
    };
    /* the browser ends listening after a pause; start again until the teacher taps the button */
    r.onend = () => {
      if (stopped) { finish(); return; }
      quick = now() - t0 < 1500 ? quick + 1 : 0;
      if (quick >= 6) { stopped = true; toast('The microphone keeps switching off on this device. Tap it to try again.'); finish(); return; }
      setTimeout(() => { if (!stopped) run(); }, 250);
    };
    t0 = now();
    try { r.start(); } catch (e) { stopped = true; toast('Voice input couldn\u2019t start.'); finish(); }
  };
  run();
  return stopped ? null : ctl;
}

/* Writing checks: common misspellings, capitals, spacing, repeated words, a/an, end punctuation */
const MISSPELL = (() => {
  const m = {}; `acheive achieve|accomodate accommodate|acommodate accommodate|adress address|agian again|alot a lot|allready already|alway always|allways always|amung among|anoying annoying|apparantly apparently|arguement argument|aswell as well|atleast at least|athelete athlete|awsome awesome|basicly basically|beacuse because|becasue because|becuase because|becuz because|befor before|begining beginning|beleive believe|belive believe|benifit benefit|beautifull beautiful|beatiful beautiful|beutiful beautiful|buisness business|buisy busy|bisy busy|calender calendar|carefull careful|catagory category|cemetary cemetery|chalenge challenge|cheif chief|childen children|chocolat chocolate|choclate chocolate|collegue colleague|comming coming|commited committed|completly completely|concious conscious|couldnt couldn't|curiousity curiosity|decieve deceive|definately definitely|definitly definitely|didnt didn't|diffrent different|dinosour dinosaur|disapear disappear|dissapear disappear|dissapoint disappoint|doesnt doesn't|dont don't|eachother each other|easly easily|embarass embarrass|enjoied enjoyed|enviroment environment|enviornment environment|especialy especially|everytime every time|excercise exercise|excitment excitement|exellent excellent|experiance experience|explaination explanation|facinating fascinating|famly family|familly family|febuary February|finaly finally|foriegn foreign|fourty forty|freind friend|freinds friends|frend friend|frist first|frome from|futher further|gaurd guard|goverment government|gramar grammar|grammer grammar|greatful grateful|happend happened|happyness happiness|harrass harass|havent haven't|heigth height|hieght height|hight height|humourous humorous|imediately immediately|immediatly immediately|incase in case|independant independent|infront in front|insted instead|intresting interesting|intrested interested|interupt interrupt|isnt isn't|iland island|knowlege knowledge|knowladge knowledge|laboratary laboratory|langauge language|languege language|lerning learning|libary library|litle little|mabye maybe|mayby maybe|maintainance maintenance|mathmatics mathematics|millenium millennium|minuite minute|mischevious mischievous|neccessary necessary|necesary necessary|neice niece|nieghbor neighbour|noticable noticeable|ocasion occasion|occassion occasion|occured occurred|occurence occurrence|ofcourse of course|ofen often|oppertunity opportunity|oppurtunity opportunity|orignal original|peice piece|peopel people|peple people|pepole people|plese please|posession possession|possable possible|potatoe potato|prefered preferred|probaly probably|probebly probably|promiss promise|pronounciation pronunciation|publically publicly|realy really|reely really|reccomend recommend|recieve receive|recieved received|refered referred|relevent relevant|religous religious|remeber remember|rember remember|restaraunt restaurant|rythm rhythm|saftey safety|scaried scared|scedule schedule|scissers scissors|sentance sentence|seperate separate|shcool school|scool school|skool school|shouldnt shouldn't|sicence science|similiar similar|sincerly sincerely|sombody somebody|somthing something|speach speech|stoped stopped|strenght strength|studing studying|succesful successful|sucess success|suprise surprise|surprize surprise|teh the|techer teacher|tempature temperature|temprature temperature|thier their|togather together|tommorow tomorrow|tomorow tomorrow|tounge tongue|truely truly|tryed tried|twelth twelfth|untill until|usualy usually|vaccuum vacuum|vegtable vegetable|vegatable vegetable|wasnt wasn't|whent went|wich which|whitch which|wierd weird|wonderfull wonderful|wouldnt wouldn't|writting writing|writen written|yesturday yesterday|yestarday yesterday`.split('|').forEach(p => { const i = p.indexOf(' '); m[p.slice(0, i)] = p.slice(i + 1); });
  return m;
})();
const CAPWORDS = new Set('monday tuesday wednesday thursday friday saturday sunday january february april june july august september october november december'.split(' '));
function matchCase(src, rep) { return src[0] === src[0].toUpperCase() && src[0] !== src[0].toLowerCase() ? rep[0].toUpperCase() + rep.slice(1) : rep; }
function checkWriting(full) {
  const out = [], add = (i, j, msg, fix) => { if (!out.some(o => i < o.j && j > o.i)) out.push({ i, j, msg, fix }); };
  const latin = /[A-Za-z]/.test(full);
  let m;
  if (latin) {
    const wre = /[A-Za-z]+(?:'[A-Za-z]+)?/g;
    while ((m = wre.exec(full))) {
      const w = m[0], lw = w.toLowerCase();
      if (MISSPELL[lw]) add(m.index, m.index + w.length, `“${w}” → “${matchCase(w, MISSPELL[lw])}”`, matchCase(w, MISSPELL[lw]));
      else if (CAPWORDS.has(w)) add(m.index, m.index + w.length, `“${w}” needs a capital letter`, w[0].toUpperCase() + w.slice(1));
    }
    const ire = /(^|[^A-Za-z'’.-])(i)(?=$|['’](?:m|ve|d|ll)\b|[^A-Za-z.'’-])/g;
    while ((m = ire.exec(full))) { const k = m.index + m[1].length; add(k, k + 1, '“i” on its own is always “I”', 'I'); }
    const sre = /(^|[.!?]["'”)]?[ \t]+|\n[ \t]*)([a-z])/g;
    while ((m = sre.exec(full))) { const k = m.index + m[1].length, wd = (full.slice(k).match(/^[a-z]+/) || [m[2]])[0]; add(k, k + 1, `\u201c${wd}\u201d starts a sentence, so it needs a capital: \u201c${wd[0].toUpperCase() + wd.slice(1)}\u201d`, m[2].toUpperCase()); }
    const are = /\b(a)([ \t]+)(?=(?!one\b|once\b)[aeioAEIO][a-z])/g;
    while ((m = are.exec(full))) add(m.index, m.index + 1, '“a” → “an” before a vowel sound', m[1] === 'A' ? 'An' : 'an');
    const anre = /\b(an)([ \t]+)(?=[bcdfgjklmnpqrstvwxyzBCDFGJKLMNPQRSTVWXYZ][a-z])/g;
    while ((m = anre.exec(full))) add(m.index, m.index + 2, '“an” → “a” before a consonant sound', m[1] === 'An' ? 'A' : 'a');
    const pre = /([,;])(?=[A-Za-z])/g;
    while ((m = pre.exec(full))) add(m.index, m.index + 1, 'Add a space after the comma', m[1] + ' ');
  }
  try {
    const rep = new RegExp('(^|[^\\p{L}\\p{M}])((\\p{L}[\\p{L}\\p{M}]*)[ \\t]+\\3)(?![\\p{L}\\p{M}])', 'giu');
    while ((m = rep.exec(full))) { const k = m.index + m[1].length; add(k, k + m[2].length, `“${m[3]}” is written twice`, m[3]); }
  } catch (e) {}
  const dre = /([^\s])([ \t]{2,})(?=[^\s])/g;
  while ((m = dre.exec(full))) add(m.index + 1, m.index + 1 + m[2].length, 'Extra space between words', ' ');
  const spre = /([^\s])([ \t]+)([,.!?;:،؛؟])/g;
  while ((m = spre.exec(full))) add(m.index + 1, m.index + 1 + m[2].length, `No space before “${m[3]}”`, '');
  const t = full.replace(/\s+$/, '');
  if (t.length > 15 && /[\p{L}\p{N}]$/u.test(t)) add(t.length, t.length, 'End the last sentence with a full stop', /[؀-ۿ]$/.test(t) ? '.' : '.');
  return out.sort((a, b) => a.i - b.i);
}
/* map plain-text positions to DOM text nodes inside an editable element */
function textMap(root) {
  let full = ''; const segs = [];
  const walk = n => {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) { segs.push({ node: c, start: full.length }); full += c.data; }
      else if (c.nodeName === 'BR') full += '\n';
      else if (c.nodeType === 1) {
        const block = /^(DIV|P|LI|UL|OL)$/.test(c.nodeName);
        if (block && full && !full.endsWith('\n')) full += '\n';
        walk(c);
        if (block && full && !full.endsWith('\n')) full += '\n';
      }
    }
  };
  walk(root); return { full, segs };
}
function posNode(map, pos, preferEnd) {
  let best = null;
  for (const sg of map.segs) { const L = sg.node.data.length; if (pos >= sg.start && pos <= sg.start + L) { best = [sg.node, pos - sg.start]; if (!preferEnd || pos < sg.start + L) return best; } }
  if (!best && map.segs.length && pos >= map.full.length) { const sg = map.segs[map.segs.length - 1]; best = [sg.node, sg.node.data.length]; }
  return best;
}
function rangeFor(map, i, j) {
  const a = posNode(map, i), b = posNode(map, j, true); if (!a || !b) return null;
  const r = document.createRange(); try { r.setStart(a[0], a[1]); r.setEnd(b[0], b[1]); } catch (e) { return null; } return r;
}
const HL = (() => { try { if (window.CSS && CSS.highlights && window.Highlight) { const x = new Highlight(); CSS.highlights.set('vb-err', x); return x; } } catch (e) {} return null; })();

/* $1 unistroke recogniser (Wobbrock et al.) with built-in shape templates */
const Rec = (() => {
  const N = 64, S = 250, HALF = .5 * Math.sqrt(2 * S * S), PHI = .5 * (Math.sqrt(5) - 1);
  const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const plen = p => { let d = 0; for (let i = 1; i < p.length; i++) d += dist(p[i - 1], p[i]); return d; };
  function resample(src) {
    const p = src.map(q => ({ x: q.x, y: q.y })), I = plen(p) / (N - 1); let D = 0; const out = [p[0]];
    for (let i = 1; i < p.length; i++) {
      const d = dist(p[i - 1], p[i]);
      if (D + d >= I && d > 0) { const q = { x: p[i - 1].x + (I - D) / d * (p[i].x - p[i - 1].x), y: p[i - 1].y + (I - D) / d * (p[i].y - p[i - 1].y) }; out.push(q); p.splice(i, 0, q); D = 0; }
      else D += d;
    }
    while (out.length < N) out.push(p[p.length - 1]);
    return out.slice(0, N);
  }
  const cen = p => { let x = 0, y = 0; p.forEach(q => { x += q.x; y += q.y; }); return { x: x / p.length, y: y / p.length }; };
  const rot = (p, a) => { const c = cen(p), co = Math.cos(a), si = Math.sin(a); return p.map(q => ({ x: (q.x - c.x) * co - (q.y - c.y) * si + c.x, y: (q.x - c.x) * si + (q.y - c.y) * co + c.y })); };
  const bbox = p => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; p.forEach(q => { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; };
  const scale = p => { const b = bbox(p); return p.map(q => ({ x: q.x * S / Math.max(b.w, 1), y: q.y * S / Math.max(b.h, 1) })); };
  const trans = p => { const c = cen(p); return p.map(q => ({ x: q.x - c.x, y: q.y - c.y })); };
  function norm(pts) { let p = resample(pts); const c = cen(p); p = rot(p, -Math.atan2(c.y - p[0].y, c.x - p[0].x)); return trans(scale(p)); }
  const pdist = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d += dist(a[i], b[i]); return d / a.length; };
  function best(p, t) {
    let a = -Math.PI / 4, b = Math.PI / 4, x1 = PHI * a + (1 - PHI) * b, f1 = pdist(rot(p, x1), t), x2 = (1 - PHI) * a + PHI * b, f2 = pdist(rot(p, x2), t);
    while (Math.abs(b - a) > .035) { if (f1 < f2) { b = x2; x2 = x1; f2 = f1; x1 = PHI * a + (1 - PHI) * b; f1 = pdist(rot(p, x1), t); } else { a = x1; x1 = x2; f1 = f2; x2 = (1 - PHI) * a + PHI * b; f2 = pdist(rot(p, x2), t); } }
    return Math.min(f1, f2);
  }
  const T = [];
  const add = (name, pts) => { T.push({ name, p: norm(pts) }); T.push({ name, p: norm(pts.slice().reverse()) }); };
  const P = (arr) => arr.map(([x, y]) => ({ x, y }));
  const ring = (fn, n = 48, a0 = -Math.PI / 2) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI * 2; o.push(fn(a)); } return o; };
  add('circle', ring(a => ({ x: Math.cos(a) * 100, y: Math.sin(a) * 100 })));
  add('circle', ring(a => ({ x: Math.cos(a) * 100, y: Math.sin(a) * 100 }), 48, Math.PI / 2));
  add('rect', P([[0, 0], [100, 0], [100, 80], [0, 80], [0, 0]])); add('rect', P([[100, 0], [100, 80], [0, 80], [0, 0], [100, 0]]));
  add('tri', P([[50, 0], [100, 90], [0, 90], [50, 0]])); add('tri', P([[0, 90], [50, 0], [100, 90], [0, 90]]));
  const st = []; for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + (i * 2 % 5) * Math.PI * 2 / 5; st.push({ x: Math.cos(a) * 100, y: Math.sin(a) * 100 }); } add('star', st);
  const st2 = []; for (let i = 0; i <= 5; i++) { const a = Math.PI * .7 + (i * 2 % 5) * Math.PI * 2 / 5; st2.push({ x: Math.cos(a) * 100, y: Math.sin(a) * 100 }); } add('star', st2);
  add('heart', ring(t => ({ x: 16 * Math.pow(Math.sin(t), 3), y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) }), 60, 0));
  add('check', P([[0, 55], [35, 95], [100, 0]]));
  add('zig', P([[0, 0], [25, 100], [50, 0], [75, 100], [100, 0]])); add('zig', P([[60, 0], [20, 55], [60, 50], [25, 100]]));
  add('cloud', ring(a => { const r = 100 + 18 * Math.abs(Math.sin(a * 3.5)); return { x: Math.cos(a) * r * 1.4, y: Math.sin(a) * r * .8 }; }, 70, Math.PI));
  add('arrow', P([[0, 50], [100, 50], [78, 28], [100, 50], [78, 72]]));
  add('diamond', P([[50, 0], [100, 50], [50, 100], [0, 50], [50, 0]]));
  function recognize(pts) {
    if (pts.length < 4) return [];
    const L = plen(pts), b = bbox(pts), diag = Math.hypot(b.w, b.h) || 1;
    if (dist(pts[0], pts[pts.length - 1]) / L > .9 && L > 20) return [{ name: 'line', score: 1 }];
    const p = norm(pts), res = {};
    for (const t of T) { const s = 1 - best(p, t.p) / HALF; if (!res[t.name] || s > res[t.name]) res[t.name] = s; }
    const closed = dist(pts[0], pts[pts.length - 1]) < diag * .3;
    return Object.entries(res).map(([name, score]) => ({ name, score: score - (!closed && ['circle', 'rect', 'tri', 'diamond', 'heart', 'cloud'].includes(name) ? .08 : 0) })).sort((a, c) => c.score - a.score);
  }
  return { recognize, bbox };
})();

/* Picture library used by Auto draw and voice drawing (original drawings) */
const SOLID = { lav: '#b6abff', mint: '#a9e98e', aqua: '#74e0e4', pink: '#ffa3c0', butter: '#ffe07f', peach: '#ffbf8f', card: '#ffffff', ink: INK };
function solidify(s) { return s.replace(/class="f-(\w+)"/g, (m, k) => `fill="${SOLID[k] || '#ffffff'}"`).replace(/var\(--on-pastel\)/g, INK).replace(/var\(--stop\)/g, '#ef4f5b').replace(/var\(--(\w+)\)/g, (m, k) => SOLID[k] || INK); }
const stkClip = k => () => `<g fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${STK[k]}</g>`;
const CLIP = {
  sun: ['Sun', 'sun|شمس', '-110 -110 220 220', () => `<g stroke="${INK}" stroke-width="5" stroke-linecap="round">${[...Array(10)].map((_, i) => { const a = i * .628; return `<path d="M${(Math.cos(a) * 66).toFixed(1)} ${(Math.sin(a) * 66).toFixed(1)}L${(Math.cos(a) * 96).toFixed(1)} ${(Math.sin(a) * 96).toFixed(1)}"/>`; }).join('')}<circle r="52" fill="#ffd84d"/>${eye(-18, -8, 6)}${eye(18, -8, 6)}<path d="M-18 14q18 16 36 0" fill="none"/></g>`],
  star: ['Star', 'star|نجمة|نجم', '0 0 100 100', stkClip('star')],
  heart: ['Heart', 'heart|love|قلب', '0 0 100 100', stkClip('heart')],
  smile: ['Smiley', 'smile|smiley|happy|face|وجه|ابتسامة', '0 0 100 100', stkClip('smile')],
  check: ['Tick', 'tick|check|correct|right|صح', '0 0 100 100', stkClip('check')],
  thumb: ['Thumbs up', 'thumbs|good|great|ممتاز', '0 0 100 100', stkClip('thumb')],
  bulb: ['Light bulb', 'bulb|idea|lamp|light|مصباح|فكرة', '0 -4 100 108', stkClip('bulb')],
  rocket: ['Rocket', 'rocket|space|صاروخ', '0 0 100 100', stkClip('rocket')],
  crown: ['Crown', 'crown|king|queen|تاج', '0 0 100 100', stkClip('crown')],
  trophy: ['Trophy', 'trophy|cup|winner|كأس', '0 0 100 100', stkClip('trophy')],
  rainbow: ['Rainbow', 'rainbow|قوس', '0 20 100 75', stkClip('rainbow')],
  apple: ['Apple', 'apple|fruit|تفاحة|تفاح', '0 0 100 100', stkClip('apple')],
  cat: ['Cat', 'cat|kitten|kitty|قطة|قط|بس', '-58 -64 116 108', () => catFace(0, 0, '#ffb86e', '#e98a3b')],
  dog: ['Dog', 'dog|puppy|كلب', '-62 -46 124 94', () => dogFace(0, 0, '#f3d2a2', '#b9814f')],
  bunny: ['Rabbit', 'rabbit|bunny|أرنب|ارنب', '-56 -134 110 182', () => bunny(0, 0, 1, '#ffffff')],
  panda: ['Panda', 'panda|bear|باندا|دب', '-70 -110 140 168', () => panda(0, 0, 1, false)],
  penguin: ['Penguin', 'penguin|بطريق', '-56 -60 112 124', () => penguin(0, 0, 1, true)],
  fish: ['Fish', 'fish|سمكة|سمك', '-50 -44 122 80', () => fish(0, 0, 1, '#ffd166', '#ff9f43')],
  turtle: ['Turtle', 'turtle|tortoise|سلحفاة', '-124 -54 204 108', () => turtle(0, 0, 1)],
  crab: ['Crab', 'crab|سلطعون|سرطان', '-72 -66 144 114', () => crab(0, 0, 1)],
  camel: ['Camel', 'camel|جمل|ناقة', '-34 -40 90 78', () => camel(0, 0, 1).replace('#7a3f55', '#d39b5c')],
  tree: ['Tree', 'tree|شجرة|شجر', '-84 -96 168 214', () => `<rect x="-12" y="96" width="24" height="18" fill="#8a5a3b" stroke="${INK}" stroke-width="4"/><g stroke="${INK}" stroke-width="4" stroke-linejoin="round">${pine(0, 100, 190, '#4fae6a')}</g>`],
  palm: ['Palm tree', 'palm|نخلة|نخيل', '-90 -245 200 250', () => palm(0, 0, 1, '#3f8f4a')],
  flower: ['Flower', 'flower|rose|زهرة|وردة', '-50 -80 100 160', () => `<path d="M0 0V76" stroke="#4f9a45" stroke-width="7"/><ellipse cx="18" cy="44" rx="18" ry="8" fill="#6dbb57" transform="rotate(-30 18 44)"/><ellipse cx="-18" cy="58" rx="18" ry="8" fill="#6dbb57" transform="rotate(30 -18 58)"/>${flower(0, -24, 22, '#ff8fb1')}`],
  cloud: ['Cloud', 'cloud|غيمة|سحابة|غيم', '-110 -70 220 110', () => `<g fill="#fff" stroke="${INK}" stroke-width="5"><path d="M-80 26a30 30 0 0 1 4 -60a40 40 0 0 1 72 -16a34 34 0 0 1 62 18a28 28 0 0 1 6 58z"/></g>`],
  moon: ['Moon', 'moon|قمر|هلال', '-60 -60 120 120', () => `<path d="M14 -50A50 50 0 1 0 50 20A40 40 0 0 1 14 -50Z" fill="#fff1a8" stroke="${INK}" stroke-width="5"/>${eye(-10, 0, 5)}`],
  house: ['House', 'house|home|بيت|منزل', '-80 -80 160 150', () => `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><rect x="-56" y="-10" width="112" height="76" fill="#ffe07f"/><path d="M-74 -6L0 -70L74 -6Z" fill="#ff8f8f"/><rect x="-14" y="22" width="28" height="44" fill="#b07a45"/><rect x="-46" y="6" width="22" height="20" fill="#bfe6ff"/><rect x="24" y="6" width="22" height="20" fill="#bfe6ff"/></g>`],
  car: ['Car', 'car|سيارة', '-100 -60 200 110', () => `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-90 20V-6Q-90 -16 -78 -18L-50 -22L-28 -48H34L60 -20L84 -14Q92 -12 92 -2V20Z" fill="#74b9ff"/><path d="M-22 -40H8V-22H-40Z" fill="#dff3ff"/><path d="M16 -40H30L48 -22H16Z" fill="#dff3ff"/><circle cx="-52" cy="22" r="18" fill="#3b3b4f"/><circle cx="52" cy="22" r="18" fill="#3b3b4f"/><circle cx="-52" cy="22" r="6" fill="#fff"/><circle cx="52" cy="22" r="6" fill="#fff"/></g>`],
  ball: ['Ball', 'ball|football|كرة', '-56 -56 112 112', () => `<g stroke="${INK}" stroke-width="5"><circle r="50" fill="#fff"/><path d="M0 -18L17 -6L11 14H-11L-17 -6Z" fill="${INK}"/><path d="M0 -18V-50M17 -6L46 -16M11 14L28 42M-11 14L-28 42M-17 -6L-46 -16" fill="none"/></g>`],
  balloon: ['Balloon', 'balloon|بالون', '-50 -70 100 170', () => `<path d="M0 46C-6 60 8 72 0 96" fill="none" stroke="${INK}" stroke-width="3"/><g stroke="${INK}" stroke-width="5"><ellipse cx="0" cy="-12" rx="44" ry="54" fill="#ff8fb1"/><path d="M-8 44h16l-8 -8z" fill="#ff8fb1"/></g><ellipse cx="-16" cy="-34" rx="9" ry="14" fill="#fff" opacity=".7"/>`],
  clock: ['Clock', 'clock|time|ساعة', '-58 -58 116 116', () => `<g stroke="${INK}" stroke-width="5" stroke-linecap="round"><circle r="52" fill="#fff"/><path d="M0 -30V0L22 14"/><path d="M0 -44v6M0 44v-6M-44 0h6M44 0h-6"/></g><circle r="5" fill="#ef4f5b"/>`],
  book: ['Book', 'book|كتاب', '-90 -60 180 116', () => `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M0 -36C-24 -52 -60 -52 -84 -40V48C-60 36 -24 36 0 52Z" fill="#fff"/><path d="M0 -36C24 -52 60 -52 84 -40V48C60 36 24 36 0 52Z" fill="#fff"/><path d="M-66 -24C-48 -32 -26 -32 -14 -24M-66 -6C-48 -14 -26 -14 -14 -6M66 -24C48 -32 26 -32 14 -24M66 -6C48 -14 26 -14 14 -6" fill="none" stroke-width="3"/></g>`],
  pencil: ['Pencil', 'pencil|pen|قلم', '-100 -30 200 60', () => `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-60 -18H70V18H-60Z" fill="#ffd84d"/><path d="M70 -18L98 0L70 18Z" fill="#f6d2a8"/><path d="M-60 -18H-86Q-94 -18 -94 -8V8Q-94 18 -86 18H-60Z" fill="#ff8fb1"/></g>`],
  boat: ['Boat', 'boat|ship|قارب|سفينة', '-70 -120 140 156', () => `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-60 0H60L42 28H-42Z" fill="#ff7b72"/><path d="M0 -4V-110L64 -10Z" fill="#fff"/><path d="M-6 -10V-90L-50 -10Z" fill="#ffe07f"/></g>`],
  butterfly: ['Butterfly', 'butterfly|فراشة', '-80 -60 160 120', () => `<g stroke="${INK}" stroke-width="5"><ellipse cx="-36" cy="-18" rx="36" ry="30" fill="#c6a8ff"/><ellipse cx="36" cy="-18" rx="36" ry="30" fill="#c6a8ff"/><ellipse cx="-28" cy="26" rx="24" ry="20" fill="#ff8fb1"/><ellipse cx="28" cy="26" rx="24" ry="20" fill="#ff8fb1"/><ellipse cx="0" cy="4" rx="7" ry="40" fill="${INK}"/><path d="M-4 -34Q-14 -52 -24 -54M4 -34Q14 -52 24 -54" fill="none" stroke-width="3"/></g>`],
  mushroom: ['Mushroom', 'mushroom|فطر', '-36 -52 72 80', () => `<g stroke="${INK}" stroke-width="3"><rect x="-9" y="-24" width="18" height="26" rx="7" fill="#fff6e6"/><path d="M-32 -22C-32 -52 32 -52 32 -22Z" fill="#e8545a"/><circle cx="-14" cy="-34" r="5" fill="#fff" stroke="none"/><circle cx="8" cy="-40" r="4" fill="#fff" stroke="none"/><circle cx="18" cy="-28" r="4" fill="#fff" stroke="none"/></g>`],
  bolt: ['Lightning', 'lightning|bolt|thunder|برق', '-50 -70 100 140', () => `<path d="M10 -64L-36 6H0L-12 64L36 -10H2Z" fill="#ffd84d" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`],
  mountain: ['Mountain', 'mountain|hill|جبل', '-110 -80 220 110', () => `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-100 26L-30 -60L40 26Z" fill="#8b9bd3"/><path d="M-10 26L46 -40L104 26Z" fill="#b8bfe6"/><path d="M-30 -60L-14 -40L-24 -36L-34 -44L-44 -42Z" fill="#fff"/></g>`],
  pizza: ['Pizza', 'pizza|بيتزا', '-60 -70 120 130', () => `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round"><path d="M-50 -50Q0 -70 50 -50L0 56Z" fill="#ffd166"/><path d="M-50 -50Q0 -70 50 -50L44 -36Q0 -54 -44 -36Z" fill="#e0a25a"/><circle cx="-12" cy="-22" r="8" fill="#ef4f5b"/><circle cx="14" cy="-8" r="7" fill="#ef4f5b"/><circle cx="0" cy="18" r="6" fill="#ef4f5b"/></g>`],
};
const CLIP_FOR = { circle: ['sun', 'smile', 'ball', 'clock', 'apple', 'balloon', 'moon', 'cat'], rect: ['house', 'book', 'car', 'pencil'], tri: ['tree', 'mountain', 'pizza', 'rocket', 'boat'], star: ['star', 'crown', 'trophy'], heart: ['heart', 'butterfly', 'apple'], line: ['pencil', 'rocket'], check: ['check', 'thumb', 'star'], zig: ['bolt', 'crown', 'mountain'], cloud: ['cloud', 'rainbow', 'flower', 'sun'], arrow: ['rocket', 'pencil'], diamond: ['star', 'crown'] };
const SHAPE_NAMES = { circle: 'Circle', rect: 'Rectangle', tri: 'Triangle', star: 'Star', heart: 'Heart', line: 'Line', arrow: 'Arrow', diamond: 'Diamond', check: 'Tick', zig: 'Zigzag', cloud: 'Cloud' };
const VOICE_SHAPES = { circle: 'circle|دائرة', rect: 'square|rectangle|box|مربع|مستطيل', tri: 'triangle|مثلث', line: 'line|خط', arrow: 'arrow|سهم', diamond: 'diamond|معين' };
const _clipImg = {};
function clipSvg(k) { const c = CLIP[k]; const [vx, vy, vw, vh] = c[2].split(' ').map(Number); return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${c[2]}" width="${vw}" height="${vh}" stroke-linecap="round" stroke-linejoin="round">${solidify(c[3]())}</svg>`; }
function clipImage(k, onload) {
  if (_clipImg[k]) return _clipImg[k];
  const im = new Image(); im.onload = () => onload && onload(); im.src = 'data:image/svg+xml,' + encodeURIComponent(clipSvg(k)); _clipImg[k] = im; return im;
}
function clipAspect(k) { const p = CLIP[k][2].split(' ').map(Number); return p[2] / p[3]; }
function findWords(text) {
  const t = ' ' + text.toLowerCase().replace(/[.,!?،؟]/g, ' ') + ' ', found = [];
  const hit = w => w.split('|').some(x => t.includes(' ' + x + ' ') || t.includes(' ال' + x + ' ') || (x.length > 3 && t.includes(' ' + x + 's ')));
  for (const k in CLIP) if (hit(CLIP[k][1])) found.push({ clip: k });
  for (const k in VOICE_SHAPES) if (hit(VOICE_SHAPES[k])) found.push({ shape: k });
  return found;
}
