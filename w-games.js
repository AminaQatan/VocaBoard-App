/* ---------- Games ---------- */
const HM_WORDS = {
  en: {
    Animals: 'elephant giraffe kangaroo penguin dolphin octopus butterfly crocodile camel turtle rabbit monkey zebra parrot squirrel cheetah flamingo hedgehog jellyfish falcon',
    'Fruit & food': 'banana mango pineapple watermelon strawberry orange dates pomegranate sandwich pancake yoghurt biscuit carrot cucumber tomato potato spaghetti cheese',
    School: 'pencil eraser notebook scissors library teacher backpack calculator dictionary homework playground classroom ruler crayon timetable',
    Colours: 'purple yellow orange turquoise silver maroon violet indigo crimson golden',
    Space: 'planet galaxy astronaut rocket comet meteor telescope satellite universe gravity eclipse jupiter saturn',
    Countries: 'oman egypt brazil canada japan india france kenya mexico australia italy china morocco jordan',
  },
  ar: {
    'حيوانات': 'جمل أسد فيل زرافة أرنب سلحفاة دلفين قطة حصان نمر غزال بطريق فراشة صقر',
    'فواكه': 'تفاح موز برتقال عنب رمان مانجو بطيخ فراولة تمر أناناس',
    'المدرسة': 'قلم كتاب مسطرة ممحاة دفتر معلم مكتبة حقيبة سبورة فصل',
    'ألوان': 'أحمر أزرق أخضر أصفر بنفسجي برتقالي أبيض أسود وردي رمادي',
  },
};
const AR_KEYS = 'ابتثجحخدذرزسشصضطظعغفقكلمنهويةء'.split('');
const hmNorm = ch => ({ 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ؤ': 'و', 'ئ': 'ي', 'ى': 'ي' })[ch] || ch.toLowerCase();
const isLetter = ch => /[\p{L}]/u.test(ch);
T.hangman = {
  title: 'Hangman', icon: 'hangman', w: 560, h: 420, sh: 520, minW: 300, minH: 300, edit: true,
  init: () => ({ lang: 'en', cat: 'Animals', word: '', hint: '', guessed: [], max: 6, shown: false }),
  mount(c) {
    const s = c.s, cats = HM_WORDS[s.lang] || HM_WORDS.en;
    const pick = () => { const list = (cats[s.cat] || Object.values(cats)[0]).split(' '); let w; do { w = list[Math.floor(Math.random() * list.length)]; } while (list.length > 1 && w === s.word); s.word = w; s.hint = s.cat; s.guessed = []; s.shown = false; save(); };
    if (c.editing) {
      const own = h('input', { class: 'inp', id: 'hmw-' + c.wd.id, type: 'password', autocomplete: 'off', placeholder: s.lang === 'ar' ? 'اكتب كلمة' : 'Type a secret word', dir: 'auto' });
      const hint = h('input', { class: 'inp', id: 'hmh-' + c.wd.id, placeholder: 'Hint (optional)', dir: 'auto' });
      c.body.append(h('div', { class: 'form' },
        field('Language', seg([['en', 'English'], ['ar', 'العربية']], s.lang, v => { s.lang = v; s.cat = Object.keys(HM_WORDS[v])[0]; save(); c.rerender(); })),
        field('Word list', h('div', { class: 'chips' }, Object.keys(cats).map(k => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(s.cat === k), onclick: () => { s.cat = k; pick(); c.edit(false); } }, k)))),
        field('Or your own word (hidden from the class)', own), hint,
        h('div', { class: 'row' }, btn('Start with my word', () => { const w = own.value.trim(); if (!w) { own.focus(); return; } s.word = w; s.hint = hint.value.trim(); s.guessed = []; s.shown = false; save(); c.edit(false); }, 'btn pri'), btn('Cancel', () => c.edit(false)))));
      return;
    }
    if (!s.word) pick();
    const letters = [...s.word], need = new Set(letters.filter(isLetter).map(hmNorm));
    const wrong = s.guessed.filter(g => !need.has(g)).length, won = !s.shown && [...need].every(l => s.guessed.includes(l)), lost = s.shown || wrong >= s.max;
    const parts = ['<circle cx="140" cy="62" r="16"/>', '<path d="M140 78V128"/>', '<path d="M140 92L116 112"/>', '<path d="M140 92L164 112"/>', '<path d="M140 128L120 160"/>', '<path d="M140 128L160 160"/>'];
    const face = lost ? '<path d="M133 58l5 5M138 58l-5 5M142 58l5 5M147 58l-5 5M134 72q6 -5 12 0" stroke-width="3"/>' : wrong ? '<circle cx="135" cy="60" r="2" fill="currentColor"/><circle cx="145" cy="60" r="2" fill="currentColor"/><path d="M134 70q6 3 12 0" stroke-width="3"/>' : '';
    const pic = h('div', { class: 'hm-pic', html: `<svg viewBox="0 0 200 190" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 180H120M50 180V18H140V46" stroke="var(--ink-soft)"/><path d="M50 50L82 18" stroke="var(--ink-soft)"/>${parts.slice(0, wrong).join('')}${wrong ? face : ''}</svg>` });
    const word = h('div', { class: 'hm-word', dir: s.lang === 'ar' || /[؀-ۿ]/.test(s.word) ? 'rtl' : 'ltr', 'aria-live': 'polite' },
      letters.map(ch => !isLetter(ch) ? h('span', { class: 'gap' }, ch === ' ' ? '' : ch) : h('span', { class: 'lt' + (lost && !s.guessed.includes(hmNorm(ch)) ? ' miss' : '') }, s.guessed.includes(hmNorm(ch)) || lost ? ch : '')));
    const keys = s.lang === 'ar' || /[؀-ۿ]/.test(s.word) ? AR_KEYS : 'abcdefghijklmnopqrstuvwxyz'.split('');
    const guess = k => { if (won || lost || s.guessed.includes(k)) return; s.guessed.push(k); save(); const ok = need.has(k); Snd.play(ok ? 'pop' : 'tick'); if (!ok) Snd.tone(220, .25, { type: 'triangle', v: .15 }); c.rerender(); const nw = [...need].every(l => s.guessed.includes(l)); if (nw) Snd.play('win'); };
    const kb = h('div', { class: 'hm-keys', dir: keys === AR_KEYS ? 'rtl' : 'ltr' }, keys.map(k => h('button', { type: 'button', class: s.guessed.includes(k) ? (need.has(k) ? 'ok' : 'no') : '', disabled: s.guessed.includes(k) || won || lost, onclick: () => guess(k) }, keys === AR_KEYS ? k : k.toUpperCase())));
    const msg = won ? h('b', { class: 'hm-win' }, s.lang === 'ar' ? 'أحسنتم!' : 'You got it!') : lost ? h('b', { class: 'hm-lose' }, (s.lang === 'ar' ? 'الكلمة: ' : 'The word was: ') + s.word) : h('span', {}, s.hint ? (s.lang === 'ar' ? 'تلميح: ' : 'Hint: ') + s.hint : '', ` · ${s.max - wrong} ${s.lang === 'ar' ? 'محاولات' : 'tries left'}`);
    c.body.append(h('div', { class: 'hm' }, h('div', { class: 'hm-top' }, pic, h('div', { class: 'hm-side' }, word, h('div', { class: 'hm-msg' }, msg))), kb,
      h('div', { class: 'ctrls' }, btn(s.lang === 'ar' ? 'كلمة جديدة' : 'New word', () => { pick(); c.rerender(); }, 'btn pri sm', 'shuffle'), !won && !lost ? btn(s.lang === 'ar' ? 'أظهر الكلمة' : 'Show the word', () => { s.shown = true; save(); c.rerender(); }, 'btn sm') : null)));
    c.on(c.el, 'keydown', e => { if (e.target.closest('input,textarea,[contenteditable="true"]')) return; const k = hmNorm(e.key); if (k.length === 1 && keys.includes(k)) guess(k); });
  },
};

/* chess: full rules (castling, en passant, promotion, check, mate, stalemate) for two players */
const CH0 = 'rnbqkbnrpppppppp' + '.'.repeat(32) + 'PPPPPPPPRNBQKBNR';
const chCol = p => p === '.' ? null : p === p.toUpperCase() ? 'w' : 'b';
const CH_GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const Chess = {
  gen(b, i, ep) {
    const p = b[i], c = chCol(p), r = i >> 3, f = i & 7, t = p.toLowerCase(), out = [];
    const add = (rr, ff) => { if (rr < 0 || rr > 7 || ff < 0 || ff > 7) return false; const j = rr * 8 + ff, q = b[j]; if (q === '.') { out.push(j); return true; } if (chCol(q) !== c) out.push(j); return false; };
    if (t === 'p') {
      const d = c === 'w' ? -1 : 1, st = c === 'w' ? 6 : 1, one = (r + d) * 8 + f;
      if (r + d >= 0 && r + d < 8 && b[one] === '.') { out.push(one); if (r === st && b[(r + 2 * d) * 8 + f] === '.') out.push((r + 2 * d) * 8 + f); }
      for (const df of [-1, 1]) { const ff = f + df, rr = r + d; if (ff < 0 || ff > 7 || rr < 0 || rr > 7) continue; const j = rr * 8 + ff; if ((b[j] !== '.' && chCol(b[j]) !== c) || j === ep) out.push(j); }
    } else if (t === 'n') { for (const [a, e] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) add(r + a, f + e); }
    else if (t === 'k') { for (let a = -1; a <= 1; a++) for (let e = -1; e <= 1; e++) if (a || e) add(r + a, f + e); }
    else {
      const dirs = t === 'r' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : t === 'b' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [a, e] of dirs) { let rr = r + a, ff = f + e; while (add(rr, ff)) { rr += a; ff += e; } }
    }
    return out;
  },
  attacked(b, sq, by) {
    const r = sq >> 3, f = sq & 7, at = (rr, ff) => rr >= 0 && rr < 8 && ff >= 0 && ff < 8 ? b[rr * 8 + ff] : '';
    const P = by === 'w' ? 'P' : 'p', N = by === 'w' ? 'N' : 'n', K = by === 'w' ? 'K' : 'k', B = by === 'w' ? 'B' : 'b', R = by === 'w' ? 'R' : 'r', Q = by === 'w' ? 'Q' : 'q';
    const pr = by === 'w' ? r + 1 : r - 1; if (at(pr, f - 1) === P || at(pr, f + 1) === P) return true;
    for (const [a, e] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) if (at(r + a, f + e) === N) return true;
    for (let a = -1; a <= 1; a++) for (let e = -1; e <= 1; e++) if ((a || e) && at(r + a, f + e) === K) return true;
    for (const [a, e, set] of [[1, 0, [R, Q]], [-1, 0, [R, Q]], [0, 1, [R, Q]], [0, -1, [R, Q]], [1, 1, [B, Q]], [1, -1, [B, Q]], [-1, 1, [B, Q]], [-1, -1, [B, Q]]]) {
      let rr = r + a, ff = f + e;
      while (rr >= 0 && rr < 8 && ff >= 0 && ff < 8) { const q = b[rr * 8 + ff]; if (q !== '.') { if (set.includes(q)) return true; break; } rr += a; ff += e; }
    }
    return false;
  },
  inCheck(b, c) { const k = b.indexOf(c === 'w' ? 'K' : 'k'); return k >= 0 && this.attacked(b, k, c === 'w' ? 'b' : 'w'); },
  apply(g, from, to, promo) {
    const a = g.b.split(''), p = a[from], c = chCol(p), t = p.toLowerCase(); let cap = a[to];
    if (t === 'p' && to === g.ep && cap === '.') { const cs = to + (c === 'w' ? 8 : -8); cap = a[cs]; a[cs] = '.'; }
    if (t === 'k' && Math.abs(to - from) === 2) { if (to > from) { a[from + 1] = a[from + 3]; a[from + 3] = '.'; } else { a[from - 1] = a[from - 4]; a[from - 4] = '.'; } }
    a[to] = t === 'p' && (to < 8 || to > 55) ? (c === 'w' ? (promo || 'q').toUpperCase() : (promo || 'q')) : p; a[from] = '.';
    let cs = g.cs;
    const strip = ch => { cs = cs.replace(ch, ''); };
    if (p === 'K') { strip('K'); strip('Q'); } if (p === 'k') { strip('k'); strip('q'); }
    for (const [sq, ch] of [[63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']]) if (from === sq || to === sq) strip(ch);
    return { b: a.join(''), turn: c === 'w' ? 'b' : 'w', cs, ep: t === 'p' && Math.abs(to - from) === 16 ? (from + to) / 2 : -1, cap: cap !== '.' ? cap : '' };
  },
  legal(g, i) {
    const b = g.b, p = b[i]; if (p === '.' || chCol(p) !== g.turn) return [];
    const c = g.turn, opp = c === 'w' ? 'b' : 'w';
    const res = this.gen(b, i, g.ep).filter(to => !this.inCheck(this.apply(g, i, to).b, c));
    if (p.toLowerCase() === 'k' && (i === 60 || i === 4) && !this.attacked(b, i, opp)) {
      const K = c === 'w' ? 'K' : 'k', Q = c === 'w' ? 'Q' : 'q', R = c === 'w' ? 'R' : 'r';
      if (g.cs.includes(K) && b[i + 1] === '.' && b[i + 2] === '.' && b[i + 3] === R && !this.attacked(b, i + 1, opp) && !this.attacked(b, i + 2, opp)) res.push(i + 2);
      if (g.cs.includes(Q) && b[i - 1] === '.' && b[i - 2] === '.' && b[i - 3] === '.' && b[i - 4] === R && !this.attacked(b, i - 1, opp) && !this.attacked(b, i - 2, opp)) res.push(i - 2);
    }
    return res;
  },
  anyLegal(g) { for (let i = 0; i < 64; i++) if (chCol(g.b[i]) === g.turn && this.legal(g, i).length) return true; return false; },
  status(g) {
    const chk = this.inCheck(g.b, g.turn), any = this.anyLegal(g);
    if (!any) return chk ? 'mate' : 'stalemate';
    if (!/[pnbrqPNBRQ]/.test(g.b)) return 'draw';
    return chk ? 'check' : 'play';
  },
};
T.chess = {
  title: 'Chess', icon: 'chess', w: 500, h: 560, sh: 520, minW: 280, minH: 320,
  init: () => ({ b: CH0, turn: 'w', cs: 'KQkq', ep: -1, hist: [], last: null, flip: false, capW: '', capB: '' }),
  mount(c) {
    const s = c.s; let sel = -1, targets = [];
    const board = h('div', { class: 'ch-board', role: 'grid', 'aria-label': 'Chess board' });
    const info = h('div', { class: 'ch-info', 'aria-live': 'polite' });
    const capT = h('div', { class: 'ch-cap' }), capB = h('div', { class: 'ch-cap' });
    const promo = h('div', { class: 'ch-promo', hidden: true });
    const sqs = [];
    for (let k = 0; k < 64; k++) { const b = h('button', { type: 'button', class: 'sq', onclick: () => tap(b._i) }); sqs.push(b); board.append(b); }
    const glyph = p => CH_GLYPH[p.toLowerCase()] + '︎';
    function paint() {
      const st = Chess.status(s), kIdx = s.b.indexOf(s.turn === 'w' ? 'K' : 'k');
      sqs.forEach((b, k) => {
        const i = s.flip ? 63 - k : k, r = i >> 3, f = i & 7, p = s.b[i]; b._i = i;
        b.className = 'sq ' + ((r + f) % 2 ? 'd' : 'l') + (i === sel ? ' sel' : '') + (s.last && s.last.includes(i) ? ' last' : '') + (targets.includes(i) ? (p !== '.' || i === s.ep ? ' cap' : ' tgt') : '') + ((st === 'check' || st === 'mate') && i === kIdx ? ' chk' : '');
        b.replaceChildren(p !== '.' ? h('span', { class: 'pc ' + chCol(p) }, glyph(p)) : '', (k & 7) === 0 ? h('i', { class: 'rk' }, String(8 - r)) : '', k >= 56 ? h('i', { class: 'fl' }, 'abcdefgh'[f]) : '');
        b.setAttribute('aria-label', 'abcdefgh'[f] + (8 - r) + (p !== '.' ? ' ' + (chCol(p) === 'w' ? 'white ' : 'black ') + { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' }[p.toLowerCase()] : ''));
      });
      const who = s.turn === 'w' ? 'White' : 'Black', other = s.turn === 'w' ? 'Black' : 'White';
      info.textContent = st === 'mate' ? `Checkmate! ${other} wins.` : st === 'stalemate' ? 'Stalemate. It’s a draw.' : st === 'draw' ? 'Only kings left. It’s a draw.' : st === 'check' ? `${who} is in check!` : `${who} to move`;
      info.className = 'ch-info ' + (st === 'mate' ? 'end' : st === 'check' ? 'warn' : s.turn);
      const caps = str => [...str].map(p => h('span', { class: 'pc ' + chCol(p) }, glyph(p)));
      capT.replaceChildren(...caps(s.flip ? s.capB : s.capW)); capB.replaceChildren(...caps(s.flip ? s.capW : s.capB));
    }
    function move(from, to, pr) {
      const snap = { b: s.b, turn: s.turn, cs: s.cs, ep: s.ep, last: s.last, capW: s.capW, capB: s.capB };
      const n = Chess.apply(s, from, to, pr);
      s.hist.push(snap); if (s.hist.length > 300) s.hist.shift();
      if (n.cap) { if (chCol(n.cap) === 'w') s.capW += n.cap; else s.capB += n.cap; }
      Object.assign(s, { b: n.b, turn: n.turn, cs: n.cs, ep: n.ep, last: [from, to] }); sel = -1; targets = []; save();
      const st = Chess.status(s); Snd.play(st === 'mate' ? 'win' : n.cap ? 'pop' : 'tick'); paint();
    }
    function tap(i) {
      if (Chess.status(s) === 'mate' || Chess.status(s) === 'stalemate') return;
      if (sel >= 0 && targets.includes(i)) {
        const p = s.b[sel];
        if (p.toLowerCase() === 'p' && (i < 8 || i > 55)) {
          const from = sel; promo.hidden = false;
          promo.replaceChildren(h('span', {}, 'Promote to'), ...['q', 'r', 'b', 'n'].map(t => h('button', { type: 'button', class: 'pc ' + s.turn, onclick: () => { promo.hidden = true; move(from, i, t); } }, CH_GLYPH[t] + '︎')));
          return;
        }
        move(sel, i); return;
      }
      if (chCol(s.b[i]) === s.turn) { sel = i; targets = Chess.legal(s, i); } else { sel = -1; targets = []; }
      paint();
    }
    c.body.append(h('div', { class: 'ch' }, capT, h('div', { class: 'ch-wrap' }, board, promo), capB,
      h('div', { class: 'ch-bar' }, info, h('span', { class: 'sp' }),
        ib('undo', 'Undo move', () => { const p = s.hist.pop(); if (p) { Object.assign(s, p); sel = -1; targets = []; save(); paint(); } }, 'btn sm ic'),
        ib('swap', 'Turn the board round', () => { s.flip = !s.flip; save(); paint(); }, 'btn sm ic'),
        confirmBtn('New game', 'Tap again', () => { Object.assign(s, T.chess.init(), { flip: s.flip }); sel = -1; targets = []; save(); paint(); }))));
    paint();
  },
};

/* idea wall: a Padlet-style board of posts on this screen */
const WALL_COLS = ['butter', 'mint', 'pink', 'aqua', 'lav', 'peach'];
T.wall = {
  title: 'Idea wall', icon: 'wall', w: 620, h: 460, sh: 520, minW: 280, minH: 260,
  init: () => ({ _title: 'Idea wall (example)', q: 'What did we learn today?', posts: [
    { id: uid(), t: 'Plants need sunlight, water and air to grow.', c: 'mint', likes: 2 },
    { id: uid(), t: '2/4 and 1/2 are the same amount.', c: 'butter', likes: 1 }] }),
  blobs: s => (s.posts || []).map(p => p.img),
  mount(c) {
    const s = c.s;
    const grid = h('div', { class: 'wl-grid' });
    const lv = liveSetup(c, 'wall', () => ({ title: (s._title || 'Idea wall').replace(/\s*\(example\)$/i, ''), q: s.q, qid: '' }), items => {
      const fresh = [];
      for (const it of items) {
        let x = {}; if (typeof it.qid === 'string' && it.qid[0] === '{') try { x = JSON.parse(it.qid) || {}; } catch (e) {}
        const t = it.t || x.t, nm = it.n || x.n;
        if (!t || s.posts.some(p => p.id === it.id)) continue;
        const p = { id: it.id, t: String(t).slice(0, 300), c: [it.c, x.c, it.qid].find(v => WALL_COLS.includes(v)) || WALL_COLS[s.posts.length % WALL_COLS.length], likes: 0, n: nm ? String(nm).slice(0, 40) : '', live: true };
        s.posts.unshift(p); fresh.push(p);
      }
      if (!fresh.length) return;
      save();
      const empty = grid.querySelector('.empty'); if (empty) empty.remove();
      const after = draft ? draft.card : null;
      fresh.forEach(p => { const el = postEl(p); el.classList.add('fresh'); after ? after.after(el) : grid.prepend(el); });
    });
    const q = h('div', { class: 'wl-q', contenteditable: 'true', spellcheck: 'true', dir: 'auto', 'data-ph': 'Ask a question', oninput: e => { s.q = e.target.textContent; save(); lv.sync(); } }, s.q);
    let draft = null;
    const composer = () => {
      const col = { v: WALL_COLS[s.posts.length % WALL_COLS.length] }; let img = null;
      const ta = h('textarea', { class: 'inp', id: 'wlt-' + c.wd.id, rows: 3, dir: 'auto', placeholder: 'Write your idea…', 'aria-label': 'Post text' });
      const dots = h('div', { class: 'chips' }, WALL_COLS.map(k => h('button', { class: 'chip', type: 'button', 'aria-label': k, 'aria-pressed': String(k === col.v), style: { background: `var(--${k})`, width: '2.1rem', padding: 0 }, onclick: e => { col.v = k; dots.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === e.currentTarget))); card.dataset.note = k; } })));
      const pv = h('span', { class: 'note' });
      const mic = ib('mic', 'Voice typing', () => {
        if (draft.voice) { draft.voice.stop(); return; }
        draft.voice = startVoice(S.vlang || 'en-GB', (t, fin) => { if (fin) { ta.value += (ta.value && !/\s$/.test(ta.value) ? ' ' : '') + t.trim(); } }, () => { draft.voice = null; mic.classList.remove('live'); });
        if (draft.voice) mic.classList.add('live');
      }, 'btn sm ic');
      const card = h('div', { class: 'wl-post wl-new', 'data-note': col.v }, ta, dots, h('div', { class: 'row' }, filePick('image/*', async f => { img = await Blobs.put(f); pv.textContent = f.name; }, 'Picture', 'btn sm'), mic, pv),
        h('div', { class: 'row' }, btn('Post', () => { const t = ta.value.trim(); if (!t && !img) { ta.focus(); return; } s.posts.unshift({ id: uid(), t, c: col.v, likes: 0, img }); draft.voice && draft.voice.stop(); draft = null; save(); Snd.play('pop'); draw(); }, 'btn pri sm'), btn('Cancel', () => { draft.voice && draft.voice.stop(); if (img) Blobs.del(img); draft = null; draw(); }, 'btn sm')));
      draft = { card }; setTimeout(() => ta.focus(), 30);
      return card;
    };
    function postEl(p) {
      const im = p.img ? h('img', { alt: '' }) : null; if (im) Blobs.url(p.img).then(u => { if (u) im.src = u; else im.remove(); });
      const like = h('button', { class: 'wl-like', type: 'button', 'aria-label': 'Like' }, svg('heartsm'), h('span', {}, String(p.likes || 0)));
      like.onclick = () => { p.likes = (p.likes || 0) + 1; save(); like.lastChild.textContent = p.likes; like.classList.remove('bump'); void like.offsetWidth; like.classList.add('bump'); Snd.play('pop'); };
      return h('article', { class: 'wl-post', 'data-note': p.c }, im, p.t ? h('p', { dir: 'auto' }, p.t) : null,
        h('footer', {}, like, p.n ? h('span', { class: 'wl-by', dir: 'auto' }, p.n) : null, h('span', { class: 'sp' }), ib('x', 'Delete post', () => { const i = s.posts.indexOf(p); s.posts.splice(i, 1); save(); draw(); let undone = false; toast('Post deleted', { action: ['Undo', () => { undone = true; s.posts.splice(i, 0, p); save(); draw(); }], done: () => { if (!undone && p.img) Blobs.del(p.img); } }); })));
    }
    function draw() {
      grid.replaceChildren(...(draft ? [draft.card] : []), ...s.posts.map(postEl));
      if (!s.posts.length && !draft) grid.append(h('div', { class: 'empty' }, h('p', {}, lv.on ? 'Waiting for ideas. Students scan the QR code to post.' : 'No posts yet. Add the first idea.')));
    }
    c.body.append(h('div', { class: 'wl' + (lv.on ? ' lvon' + (s.live.big ? ' lvbig' : '') : '') }, h('div', { class: 'wl-top' }, q, lv.button, btn('Add a post', () => { if (!draft) { composer(); draw(); } }, 'btn pri sm', 'plus')), lv.panel, grid));
    draw();
    c.cleanup(() => draft && draft.voice && draft.voice.stop());
  },
};

/* room designer: plan a classroom or any room, top view in centimetres */
const FURN = {
  desk: ['Student desk', 70, 50, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="4" fill="#e9c48f"/>`],
  desk2: ['Double desk', 130, 60, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="4" fill="#e9c48f"/><path d="M0 ${-h / 2}V${h / 2}" stroke-dasharray="4 4"/>`],
  chair: ['Chair', 45, 45, (w, h) => `<rect x="${-w / 2}" y="${-h / 2 + 9}" width="${w}" height="${h - 9}" rx="9" fill="#9ec5ff"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="11" rx="5" fill="#6f9fe6"/>`],
  table: ['Round table', 120, 120, (w) => `<circle r="${w / 2}" fill="#e9c48f"/>`],
  group: ['Group table', 160, 100, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="30" fill="#f1d3a3"/>`],
  teacher: ['Teacher’s desk', 150, 75, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="5" fill="#c79a6b"/><rect x="-28" y="${-h / 2 + 8}" width="56" height="8" rx="2" fill="#2b2f45"/><rect x="-22" y="${-h / 2 + 22}" width="44" height="12" rx="2" fill="#fff"/>`],
  computer: ['Computer desk', 120, 60, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="4" fill="#e3d4bf"/><rect x="-25" y="${-h / 2 + 6}" width="50" height="7" rx="2" fill="#2b2f45"/><rect x="-22" y="${-h / 2 + 22}" width="44" height="14" rx="2" fill="#cfd5dd"/>`],
  board: ['Whiteboard', 240, 12, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="2" fill="#ffffff" stroke="#8a93a0"/>`],
  screen: ['Screen / TV', 160, 12, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="2" fill="#2b2f45"/>`],
  shelf: ['Bookshelf', 100, 35, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3" fill="#b07a45"/>${[...Array(7)].map((_, i) => `<rect x="${-w / 2 + 6 + i * (w - 12) / 7}" y="${-h / 2 + 5}" width="${(w - 12) / 7 - 3}" height="${h - 10}" fill="${['#ef4f5b', '#2f6fe4', '#ffd84d', '#1f9d55', '#8e4ec6', '#ff9a3c', '#74e0e4'][i]}" stroke="none"/>`).join('')}`],
  cupboard: ['Cupboard', 100, 55, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3" fill="#d9c2a6"/><path d="M0 ${-h / 2}V${h / 2}"/>`],
  sofa: ['Sofa', 190, 85, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="14" fill="#ffb3c7"/><rect x="${-w / 2 + 18}" y="${-h / 2}" width="${w - 36}" height="22" rx="8" fill="#ff8fb1"/><rect x="${-w / 2}" y="${-h / 2}" width="20" height="${h}" rx="9" fill="#ff8fb1"/><rect x="${w / 2 - 20}" y="${-h / 2}" width="20" height="${h}" rx="9" fill="#ff8fb1"/>`],
  armchair: ['Armchair', 85, 85, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="14" fill="#c6a8ff"/><rect x="${-w / 2 + 14}" y="${-h / 2}" width="${w - 28}" height="20" rx="8" fill="#a98cf2"/>`],
  beanbag: ['Beanbag', 80, 80, (w) => `<circle r="${w / 2}" fill="#ffd166"/><circle r="${w / 4}" fill="#ffe7a3" stroke="none"/>`],
  rug: ['Rug', 220, 150, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="#c6a8ff" fill-opacity=".45" stroke-dasharray="8 6"/>`],
  bed: ['Bed', 100, 200, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="8" fill="#dbeeff"/><rect x="${-w / 2 + 12}" y="${-h / 2 + 10}" width="${w - 24}" height="34" rx="10" fill="#fff"/><rect x="${-w / 2}" y="${-h / 2 + 60}" width="${w}" height="${h - 60}" rx="6" fill="#8fc7f2"/>`],
  plant: ['Plant', 50, 50, (w) => `<circle r="${w / 2}" fill="#6dbb57"/><circle cx="${-w / 6}" cy="${-w / 6}" r="${w / 4}" fill="#8fd076" stroke="none"/><circle r="${w / 7}" fill="#d08c5a"/>`],
  bin: ['Bin', 35, 35, (w) => `<circle r="${w / 2}" fill="#aab3bd"/><circle r="${w / 3}" fill="#8a939d" stroke="none"/>`],
  sink: ['Sink', 60, 45, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="6" fill="#e6edf3"/><ellipse rx="${w / 3}" ry="${h / 3.2}" fill="#bcd6ea"/>`],
  door: ['Door', 90, 90, (w, h) => `<path d="M${-w / 2} ${h / 2}V${-h / 2}" stroke-width="3"/><path d="M${-w / 2} ${-h / 2}A${w} ${h} 0 0 1 ${w / 2} ${h / 2}" fill="none" stroke-dasharray="6 6"/><rect x="${-w / 2}" y="${h / 2 - 6}" width="${w}" height="12" fill="#fff" stroke="none"/>`],
  window: ['Window', 120, 12, (w, h) => `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#bfe6ff" stroke="#5aa9d6"/><path d="M${-w / 2} 0H${w / 2}" stroke="#5aa9d6"/>`],
};
