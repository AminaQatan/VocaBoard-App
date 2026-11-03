/* ---------- Live activities: students join a Poll or Idea wall from their phones with a QR code ---------- */
/* Server: the teacher's Google Apps Script (the updated Smart Tech Attendance Code.gs).
   Every activity gets its own random 6-letter code plus a private owner key, so classes never mix. */
const LIVE_VER = '1.6.0';
const LIVE_AB = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newLiveCode = () => Array.from({ length: 6 }, () => LIVE_AB[Math.floor(Math.random() * LIVE_AB.length)]).join('');
function liveUrl() { return (S && S.liveUrl) || window.VB_LIVE_URL || (S && S.att && S.att.sheet && S.att.sheet.url) || ''; }
function liveOwner() { if (!S.liveOwner) { S.liveOwner = uid() + uid() + uid(); save(); } return S.liveOwner; }
async function liveCall(params, url) {
  url = url || liveUrl(); if (!url) throw new Error('no_url');
  const q = new URLSearchParams(Object.assign({}, params, { _: Date.now() }));
  const ac = window.AbortController ? new AbortController() : null, tm = ac && setTimeout(() => ac.abort(), 25000);
  let txt;
  try { const r = await fetch(url + (url.includes('?') ? '&' : '?') + q.toString(), { cache: 'no-store', redirect: 'follow', signal: ac ? ac.signal : undefined }); txt = await r.text(); }
  finally { clearTimeout(tm); }
  try { return JSON.parse(txt); } catch (e) { return { ok: false, error: /endpoint is ready/i.test(txt) ? 'old_script' : 'bad_reply' }; }
}
function joinLink(code) {
  const url = liveUrl(), m = url.match(/script\.google\.com\/macros\/s\/([\w-]+)\/exec/);
  const base = location.origin + location.pathname.replace(/index\.html$/, '');
  return `${base}?join=${code}&v=${LIVE_VER.replace(/\./g, '')}` + (url && url !== window.VB_LIVE_URL ? (m ? `&g=${m[1]}` : `&u=${encodeURIComponent(url)}`) : '');
}
const LIVE_ERR = {
  no_url: 'Add your Google connection first: Menu, then Students join with a QR code.',
  old_script: 'Your Google Apps Script is the old version. Paste the new Code.gs and deploy a new version.',
  taken: 'That code is in use. A new code was made.',
  bad_reply: 'The Google connection didn’t answer properly. Check the address in Menu.',
};
function openLiveSettings() {
  sheet('Students join with a QR code', body => {
    const inp = h('input', { class: 'inp', id: 'liveurl', type: 'url', value: liveUrl(), placeholder: 'https://script.google.com/macros/s/…/exec' });
    const st = h('p', { class: 'note' });
    body.append(
      h('p', { class: 'note' }, 'Polls and the Idea wall can take answers from students’ phones and tablets. Students scan the QR code on the board, so they don’t need an account or an app.'),
      h('p', { class: 'note' }, 'This uses your Google Apps Script: the same one as Smart Tech Attendance, updated with the new Code.gs from the VocaBoard zip. Every activity gets its own code, so different classes and teachers never mix.'),
      field('Google Apps Script address (Web App URL)', inp),
      h('div', { class: 'row' },
        btn('Save', () => { S.liveUrl = inp.value.trim(); save(); toast(S.liveUrl ? 'Saved' : 'Removed'); }, 'btn sm pri'),
        btn('Test the connection', async () => {
          const u = inp.value.trim(); if (!u) { st.textContent = 'Paste the address first.'; return; }
          st.textContent = 'Testing…';
          try { const r = await liveCall({ action: 'ping', code: 'TEST' }, u); st.textContent = r.ok && r.live ? 'Connected. Students can join your activities.' : (LIVE_ERR[r.error] || 'The address answered, but not as expected: ' + r.error); }
          catch (e) { st.textContent = 'Couldn’t reach that address. Check it and the internet connection.'; }
        }, 'btn sm')),
      st);
  });
}
/* the join panel and polling, shared by Poll and Idea wall */
function liveSetup(c, kind, getMeta, onItems) {
  const s = c.s, L = s.live;
  const metaNow = () => Object.assign({ kind }, getMeta());
  const publish = async (code) => liveCall(Object.assign({ action: 'open', code, owner: liveOwner() }, metaNow()));
  async function startLive(b) {
    if (!APP) { toast('Students can join from the installed app on your website, not from this preview.'); return; }
    if (!liveUrl()) { openLiveSettings(); return; }
    if (b) { b.disabled = true; b.lastChild.textContent = 'Starting…'; }
    try {
      let code = (L && L.code) || newLiveCode(), r = await publish(code);
      for (let i = 0; r && r.error === 'taken' && i < 5; i++) { code = newLiveCode(); r = await publish(code); }
      if (!r.ok) { toast(LIVE_ERR[r.error] || 'Couldn’t start: ' + r.error); if (b) { b.disabled = false; b.lastChild.textContent = 'Students join'; } return; }
      s.live = { code, on: true, n: (L && L.code === code) ? L.n || 0 : 0, big: true, sig: JSON.stringify(metaNow()) };
      // make room for the QR code and the answers
      const need = kind === 'poll' ? [400, 490] : [660, 500], rec = live.get(c.wd.id);
      if (c.wd.w < need[0] || c.wd.h < need[1]) { const { W, H } = boardSize(), dW = Math.max(0, need[0] - c.wd.w), dH = Math.max(0, need[1] - c.wd.h); c.wd.w += dW; c.wd.h += dH; c.wd.y = Math.max(0, (c.wd.y * H - dH) / H); if ((c.wd.x * W + c.wd.w) > W) c.wd.x = Math.max(0, (W - c.wd.w - 8) / W); rec && place(rec); }
      save(); c.rerender(); Snd.play('chime');
    } catch (e) { toast(LIVE_ERR[e.message] || 'Couldn’t reach your Google connection. Check the internet.'); if (b) { b.disabled = false; b.lastChild.textContent = 'Students join'; } }
  }
  if (!L || !L.on) {
    const button = h('button', { class: 'btn sm', type: 'button', title: 'Students answer on their own phones or tablets', onclick: e => startLive(e.currentTarget) }, svg('qr'), h('span', {}, 'Students join'));
    return { button, panel: null, on: false, sync() {} };
  }
  const status = h('span', { class: 'lv-st' }, L.n ? `${L.n} received` : 'Waiting for answers…');
  const qr = h('div', { class: 'lv-qr', title: 'Students scan this with their camera' });
  const bigQr = () => sheet('Join with code ' + L.code, b => { b.parentNode.classList.add('wide'); const q = h('div', { class: 'lv-qrbig' }); b.append(q, h('p', { class: 'lv-bigcode' }, L.code), h('p', { class: 'note', style: { textAlign: 'center', overflowWrap: 'anywhere' } }, 'Scan with the phone camera, or open the board link and type the code.')); qrInto(q, joinLink(L.code)); });
  qr.onclick = bigQr;
  const panel = h('div', { class: 'lv' + (L.big ? ' big' : '') },
    qr,
    h('div', { class: 'lv-side' },
      h('div', { class: 'lv-txt' }, h('span', {}, 'Scan to join · code'), h('b', { class: 'lv-code' }, L.code), status),
      h('div', { class: 'lv-btns' },
        ib(L.big ? 'min' : 'max', L.big ? 'Make the QR code smaller' : 'Make the QR code bigger', () => { L.big = !L.big; save(); c.rerender(); }, 'btn sm ic'),
        ib('qr', 'Show the QR code full screen', bigQr, 'btn sm ic'),
        confirmBtn('Stop', 'Tap to stop', async () => { L.on = false; save(); c.rerender(); toast('Students can no longer send answers.'); try { await liveCall({ action: 'close', code: L.code, owner: liveOwner() }); } catch (e) {} }, 'btn sm danger'))));
  qrInto(qr, joinLink(L.code));
  let busy = false, fails = 0, syncT;
  const poll = async () => {
    if (busy || document.visibilityState !== 'visible' || !L.on) return; busy = true;
    try {
      const r = await liveCall({ action: 'list', code: L.code, owner: liveOwner(), from: L.n || 0 });
      if (!L.on) { busy = false; return; }
      if (r.ok) {
        fails = 0;
        if (r.n < (L.n || 0)) L.n = 0; // the server forgot (after 6 hours): start counting again
        else { if (r.items && r.items.length) { onItems(r.items); Snd.play('pop'); } L.n = r.n; }
        save(); status.textContent = L.n ? `${L.n} received` : 'Waiting for answers…'; status.classList.remove('bad');
      } else if (r.error === 'not_found') { await publish(L.code); }
      else { status.textContent = LIVE_ERR[r.error] || r.error; status.classList.add('bad'); }
    } catch (e) { if (++fails > 1) { status.textContent = 'Reconnecting…'; status.classList.add('bad'); } }
    busy = false;
  };
  const sync = () => { clearTimeout(syncT); syncT = setTimeout(async () => { const sig = JSON.stringify(metaNow()); try { const r = await publish(L.code); if (r.ok) { L.sig = sig; save(); } } catch (e) {} }, 700); };
  const iv = setInterval(poll, 3500); setTimeout(poll, 400);
  c.cleanup(() => { clearInterval(iv); clearTimeout(syncT); });
  if (L.sig !== JSON.stringify(metaNow())) sync(); // the question or answers changed while editing
  return { button: null, panel, on: true, sync };
}
function liveClose(s) { if (s && s.live && s.live.on) { s.live.on = false; liveCall({ action: 'close', code: s.live.code, owner: liveOwner() }).catch(() => {}); } }

/* ---------- the students' page: opened from the QR code (?join=CODE) ---------- */
function startJoin(params) {
  const root = document.getElementById('vocaboard') || document.body;
  document.title = 'Join · VocaBoard';
  const remember = (k, v) => { try { if (v === undefined) return localStorage.getItem('vbj_' + k); localStorage.setItem('vbj_' + k, v); } catch (e) { return null; } };
  let server = params.get('g') ? `https://script.google.com/macros/s/${params.get('g')}/exec` : params.get('u') ? params.get('u') : window.VB_LIVE_URL || remember('server') || '';
  if (server) remember('server', server);
  let code = (params.get('join') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const card = h('div', { class: 'jn-card' });
  const toastBox = h('div', { id: 'toast' });
  toastEl = toastBox;
  root.append(h('div', { class: 'jn' }, h('header', { class: 'jn-h' }, h('span', { html: LOGO, style: { display: 'contents' } }), h('b', {}, 'VocaBoard')), card, h('p', { class: 'jn-credit' }, 'Developed by: Ms. Amina Qatan · v' + LIVE_VER), toastBox));
  let meta = null, timer = null;
  const call = async p => { let r = await liveCall(Object.assign({ code }, p), server); if (r.error === 'busy') { await new Promise(res => setTimeout(res, 1200 + Math.random() * 1500)); r = await liveCall(Object.assign({ code }, p), server); } return r; };
  function askCode(msg) {
    clearInterval(timer);
    const inp = h('input', { class: 'inp jn-in', id: 'jcode', maxlength: 8, autocomplete: 'off', autocapitalize: 'characters', placeholder: 'ABC123', value: code });
    if (!server) { card.replaceChildren(h('h1', {}, 'Join your class'), h('p', { class: 'jn-msg' }, 'Scan the QR code on the board with your camera to join.')); return; }
    card.replaceChildren(...[h('h1', {}, 'Join your class'), msg ? h('p', { class: 'jn-msg' }, msg) : null,
      h('form', { class: 'jn-form', onsubmit: e => { e.preventDefault(); code = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (code) load(); } }, field('Code from the board', inp), h('button', { class: 'btn pri', type: 'submit' }, 'Join'))].filter(Boolean));
  }
  async function load(quiet) {
    if (!server) { askCode(); return; }
    if (!quiet) card.replaceChildren(h('p', { class: 'jn-msg' }, 'Joining…'));
    try {
      const r = await call({ action: 'info' });
      if (!r.ok) {
        if (!quiet) { askCode(r.error === 'not_found' ? `The code ${code} isn’t open right now. Check it with your teacher.` : 'Something went wrong. Try again.'); return; }
      } else {
        const m = r.meta, same = meta && meta.kind === m.kind && meta.open === m.open;
        if (same && (m.kind === 'wall' || m.kind === 'map') && meta.qid === m.qid && JSON.stringify(meta.opts) === JSON.stringify(m.opts)) { if (meta.q !== m.q) { const t = card.querySelector('h1'); if (t) t.textContent = m.q || 'Share your idea'; } meta = m; }
        else { const changed = !meta || !same || meta.qid !== m.qid || meta.q !== m.q || JSON.stringify(meta.opts) !== JSON.stringify(m.opts); meta = m; if (changed) show(); }
      }
    } catch (e) { if (!quiet) askCode('Couldn’t connect. Check the internet and try again.'); }
    clearInterval(timer); timer = setInterval(() => load(true), 6000);
  }
  function show() {
    if (!meta.open) { card.replaceChildren(h('h1', {}, 'Activity closed'), h('p', { class: 'jn-msg' }, 'Your teacher has closed this activity. Thank you!')); return; }
    if (meta.kind === 'poll') {
      const key = `vote_${code}_${meta.qid}`, done = remember(key);
      const opts = h('div', { class: 'jn-opts' + (meta.mode === 'face' ? ' faces' : '') }, meta.opts.map((o, i) => h('button', { type: 'button', class: 'jn-opt' + (done === String(i) ? ' chosen' : ''), disabled: done != null, onclick: async () => {
        opts.querySelectorAll('button').forEach(b => b.disabled = true);
        try { const r = await call({ action: 'send', qid: meta.qid, v: i }); if (r.ok) { remember(key, String(i)); show(); } else { toast(r.error === 'closed' ? 'This poll is closed.' : 'Your answer wasn’t sent. Try again.'); opts.querySelectorAll('button').forEach(b => b.disabled = false); } }
        catch (e) { toast('No connection. Try again.'); opts.querySelectorAll('button').forEach(b => b.disabled = false); }
      } }, meta.mode === 'face' ? h('span', { class: 'face', html: faceSvg(i) }) : h('b', { style: { '--oc': meta.mode === 'tf' ? (i ? 'var(--pink)' : 'var(--mint)') : `var(${['--lav', '--mint', '--aqua', '--pink', '--butter', '--peach'][i % 6]})` } }, meta.mode === 'tf' ? (i ? '✗' : '✓') : String.fromCharCode(65 + i)), h('span', { dir: 'auto' }, o || '—'))));
      card.replaceChildren(h('p', { class: 'jn-kind' }, 'Poll'), h('h1', { dir: 'auto' }, meta.q || 'Choose your answer'), opts,
        done != null ? h('p', { class: 'jn-ok' }, svg('check'), 'Your answer was sent. Look at the board!') : h('p', { class: 'jn-msg' }, 'Tap one answer.'));
      return;
    }
    if (meta.kind === 'wall') {
      let col = remember('col') || 'butter';
      const ta = h('textarea', { class: 'inp', id: 'jtext', rows: 4, dir: 'auto', maxlength: 300, placeholder: 'Write your idea…', value: remember('draft_' + code) || '', oninput: () => remember('draft_' + code, ta.value) });
      const nm = h('input', { class: 'inp', id: 'jname', maxlength: 40, dir: 'auto', autocomplete: 'given-name', value: remember('name') || '' });
      const dots = h('div', { class: 'chips' }, WALL_COLS.map(k => h('button', { class: 'chip', type: 'button', 'aria-label': k, 'aria-pressed': String(k === col), style: { background: `var(--${k})`, width: '2.4rem', padding: 0 }, onclick: e => { col = k; remember('col', k); dots.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', String(x === e.currentTarget))); } })));
      const sent = h('p', { class: 'jn-ok', hidden: true }, svg('check'), 'Posted! It’s on the board now.');
      const go = h('button', { class: 'btn pri', type: 'submit' }, 'Post');
      card.replaceChildren(h('p', { class: 'jn-kind' }, meta.title || 'Idea wall'), h('h1', { dir: 'auto' }, meta.q || 'Share your idea'),
        h('form', { class: 'jn-form', onsubmit: async e => {
          e.preventDefault(); const t = ta.value.trim(); if (!t) { ta.focus(); return; }
          go.disabled = true; go.textContent = 'Sending…'; sent.hidden = true; remember('name', nm.value.trim());
          try {
            const post = JSON.stringify({ t, c: col, n: nm.value.trim() });
            let r = await call({ action: 'send', qid: post });
            if (!r.ok && r.error === 'not_found') { await new Promise(res => setTimeout(res, 4000)); r = await call({ action: 'send', qid: post }); }
            if (r.ok) { ta.value = ''; remember('draft_' + code, ''); sent.hidden = false; setTimeout(() => sent.hidden = true, 5000); }
            else toast(r.error === 'closed' ? 'The wall is closed.' : r.error === 'full' ? 'The wall is full.' : 'Your post wasn’t sent. Tap Post again.');
          }
          catch (er) { toast('No connection. Tap Post again.'); }
          go.disabled = false; go.textContent = 'Post';
        } }, ta, dots, field('Your name (optional)', nm), go), sent);
      return;
    }
    const nameField = need => { const nm = h('input', { class: 'inp', id: 'jname', maxlength: 40, dir: 'auto', autocomplete: 'given-name', value: remember('name') || '' }); return [nm, field(need ? 'Your name' : 'Your name (optional)', nm)]; };
    const sendBtn = label => h('button', { class: 'btn pri', type: 'submit' }, label);
    const busy = (b, on, label) => { b.disabled = on; b.textContent = on ? 'Sending…' : label; };
    if (meta.kind === 'map') {
      const dk = 'draft_' + code;
      let bi = Number(remember('mapb_' + code)) || 0; if (bi >= meta.opts.length) bi = 0;
      const ta = h('textarea', { class: 'inp', id: 'jtext', rows: 3, dir: 'auto', maxlength: 140, placeholder: 'Write your idea…', value: remember(dk) || '', oninput: () => remember(dk, ta.value) });
      const [nm, nmField] = nameField(false);
      const chips = h('div', { class: 'jn-br', role: 'group', 'aria-label': 'Where does your idea go?' }, meta.opts.map((o, i) => h('button', { type: 'button', class: 'jn-b', 'aria-pressed': String(i === bi), style: { '--bc': `var(${MAP_COLS[i % MAP_COLS.length]})` }, onclick: () => { bi = i; remember('mapb_' + code, String(i)); chips.querySelectorAll('button').forEach((x, j) => x.setAttribute('aria-pressed', String(j === i))); } }, o)));
      const sent = h('p', { class: 'jn-ok', hidden: true }, svg('check'), 'Added to the board! You can add another idea.');
      const go = sendBtn('Add my idea');
      card.replaceChildren(h('p', { class: 'jn-kind' }, meta.title || 'Brainstorm'), h('h1', { dir: 'auto' }, meta.q || 'Share your ideas'),
        h('form', { class: 'jn-form', onsubmit: async e => {
          e.preventDefault(); const t = ta.value.trim(); if (!t) { ta.focus(); return; }
          busy(go, true); sent.hidden = true; remember('name', nm.value.trim());
          try {
            const r = await call({ action: 'send', qid: JSON.stringify({ r: meta.qid, b: bi, t, n: nm.value.trim() }) });
            if (r.ok) { ta.value = ''; remember(dk, ''); sent.hidden = false; setTimeout(() => sent.hidden = true, 5000); }
            else toast(r.error === 'closed' ? 'Brainstorming is closed.' : r.error === 'full' ? 'The board is full.' : 'Your idea wasn’t sent. Tap the button again.');
          } catch (er) { toast('No connection. Tap the button again.'); }
          busy(go, false, 'Add my idea');
        } }, h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'Where does your idea go?'), chips), ta, nmField, go), sent);
      return;
    }
    if (meta.kind === 'exit') {
      const key = `exit_${code}_${meta.qid}`;
      if (remember(key)) { card.replaceChildren(h('p', { class: 'jn-kind' }, meta.title || 'Exit ticket'), h('h1', {}, 'Thank you!'), h('p', { class: 'jn-ok' }, svg('check'), 'Your exit ticket was sent. See you next lesson!')); return; }
      const wantMood = /m/.test(meta.mode || ''), needName = /n/.test(meta.mode || '');
      let mood = null;
      const faces = wantMood ? h('div', { class: 'jn-faces', role: 'group', 'aria-label': 'How do you feel about today’s lesson?' }, ['Great', 'Good', 'Not sure', 'Lost'].map((l, i) => h('button', { type: 'button', class: 'jn-face', 'aria-pressed': 'false', onclick: e => { mood = i; faces.querySelectorAll('button').forEach((x, j) => x.setAttribute('aria-pressed', String(j === i))); } }, h('span', { class: 'face', html: faceSvg(i) }), h('small', {}, l)))) : null;
      const tas = meta.opts.map((q, i) => { const dk = `exd_${code}_${i}`; const ta = h('textarea', { class: 'inp', id: 'jex' + i, rows: 2, dir: 'auto', maxlength: 200, value: remember(dk) || '', oninput: () => remember(dk, ta.value) }); return [q, ta, dk]; });
      const [nm, nmField] = nameField(needName);
      const go = sendBtn('Send my exit ticket');
      card.replaceChildren(h('p', { class: 'jn-kind' }, meta.title || 'Exit ticket'), h('h1', {}, 'Before you go…'),
        h('form', { class: 'jn-form', onsubmit: async e => {
          e.preventDefault();
          if (wantMood && mood == null) { toast('Choose a face first.'); return; }
          const a = tas.map(x => x[1].value.trim());
          if (!a.some(Boolean)) { tas[0][1].focus(); toast('Write at least one answer.'); return; }
          if (needName && !nm.value.trim()) { nm.focus(); toast('Write your name.'); return; }
          busy(go, true); remember('name', nm.value.trim());
          try {
            const r = await call({ action: 'send', qid: JSON.stringify({ r: meta.qid, a, m: mood, n: nm.value.trim() }) });
            if (r.ok) { remember(key, '1'); tas.forEach(x => remember(x[2], '')); show(); return; }
            toast(r.error === 'closed' ? 'Exit tickets are closed.' : 'Your exit ticket wasn’t sent. Tap the button again.');
          } catch (er) { toast('No connection. Tap the button again.'); }
          busy(go, false, 'Send my exit ticket');
        } }, faces ? h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'How do you feel about today’s lesson?'), faces) : null,
          ...tas.map(([q, ta]) => field(q, ta)), nmField, go));
      return;
    }
    card.replaceChildren(h('p', { class: 'jn-msg' }, 'This activity can’t be shown here.'));
  }
  code ? load() : askCode();
}
