/* ---------- Brainstorm maps and exit tickets (students can join with the QR code) ---------- */
const MAP_COLS = ['--lav', '--mint', '--pink', '--aqua', '--butter', '--peach', '--lav', '--mint'];
const MAP_TPL = [
  ['mind', 'Mind map', 'mind', 'Healthy lifestyle', ['Food', 'Exercise', 'Sleep', 'Habits']],
  ['five', '5 W questions', 'mind', 'The story', ['Who?', 'What?', 'When?', 'Where?', 'Why?']],
  ['tree', 'Tree chart', 'tree', 'Transport', ['Land', 'Sea', 'Air']],
  ['tchart', 'T-chart', 'cols', 'Online learning', ['Advantages', 'Disadvantages']],
  ['kwl', 'KWL chart', 'cols', 'Volcanoes', ['What I Know', 'What I Want to know', 'What I Learned']],
  ['venn', 'Venn diagram', 'venn', 'Cats and dogs', ['Cats', 'Both', 'Dogs']],
  ['flow', 'Flow chart', 'flow', 'Making tea', ['Step 1', 'Step 2', 'Step 3', 'Step 4']],
];
const MAP_VIEWS = [['mind', 'Mind map'], ['tree', 'Tree'], ['cols', 'Columns'], ['flow', 'Flow chart'], ['venn', 'Venn']];
const parseQ = it => { if (typeof it.qid === 'string' && it.qid[0] === '{') { try { return JSON.parse(it.qid) || {}; } catch (e) {} } return {}; };
const mapFromTpl = t => ({ tpl: t[0], layout: t[2], topic: t[3], br: t[4].map(x => ({ id: uid(), t: x, items: [] })), qid: uid(), sel: null });
T.mindmap = {
  title: 'Brainstorm', icon: 'mindmap', w: 780, h: 540, sh: 600, minW: 320, minH: 320, edit: true,
  init: () => { const m = mapFromTpl(MAP_TPL[0]); m.br[0].items.push({ id: uid(), t: 'Fruit and vegetables' }, { id: uid(), t: 'Drink water' }); m.br[1].items.push({ id: uid(), t: 'Walk every day' }); return m; },
  mount(c) {
    const s = c.s, id = c.wd.id;
    if (!s.qid) s.qid = uid();
    const names = () => s.br.map(b => b.t || '…');
    if (c.editing) {
      const tplChips = h('div', { class: 'chips' }, MAP_TPL.map(t => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(s.tpl === t[0]), onclick: () => { const hasIdeas = s.br.some(b => b.items.length); const m = mapFromTpl(t); if (hasIdeas) { m.br.forEach((b, i) => { if (s.br[i]) b.items = s.br[i].items; }); } Object.assign(s, m); save(); c.rerender(); } }, t[1])));
      const list = h('div', { class: 'stack' }, s.br.map((b, i) => h('div', { class: 'row nw' },
        h('span', { class: 'mm-dot', style: { background: `var(${MAP_COLS[i]})` } }),
        h('input', { class: 'inp', id: `mmb${i}-${id}`, value: b.t, maxlength: 60, 'aria-label': 'Branch ' + (i + 1), dir: 'auto', oninput: e => { b.t = e.target.value; save(); } }),
        s.br.length > 1 ? ib('trash', 'Remove this branch and its ideas', () => { s.br.splice(i, 1); save(); c.rerender(); }) : null)));
      c.body.append(h('div', { class: 'form' },
        field('Start from a template', tplChips),
        field('Topic in the middle', h('input', { class: 'inp', id: 'mmt-' + id, value: s.topic, maxlength: 80, dir: 'auto', oninput: e => { s.topic = e.target.value; save(); } })),
        h('div', { class: 'field' }, h('span', { class: 'lbl' }, s.layout === 'flow' ? 'Steps' : 'Branches (students choose one when they add an idea)'), list),
        s.br.length < 8 ? h('div', { class: 'row' }, btn('Add a branch', () => { s.br.push({ id: uid(), t: s.layout === 'flow' ? 'Step ' + (s.br.length + 1) : 'New branch', items: [] }); save(); c.rerender(); }, 'btn sm', 'plus')) : null,
        h('div', { class: 'row' }, btn('Done', () => c.edit(false), 'btn pri'), confirmBtn('Clear all ideas', 'Tap again to clear', () => { s.br.forEach(b => b.items = []); s.qid = uid(); save(); c.rerender(); }))));
      return;
    }
    const lv = liveSetup(c, 'map', () => ({ title: s._title || 'Brainstorm', q: s.topic, opts: JSON.stringify(names().map(x => x.slice(0, 60))), qid: s.qid, mode: s.layout }), items => {
      let added = 0;
      for (const it of items) {
        const x = parseQ(it), b = s.br[x.b];
        if (!b || !x.t || (x.r && x.r !== s.qid) || s.br.some(bb => bb.items.some(i => i.id === it.id))) continue;
        b.items.push({ id: it.id, t: String(x.t).slice(0, 140), n: x.n ? String(x.n).slice(0, 40) : '', live: true }); added++;
      }
      if (added) { save(); draw(); }
    });
    const view = h('select', { class: 'inp mm-view', id: 'mmv-' + id, 'aria-label': 'Show as', onchange: e => { s.layout = e.target.value; save(); c.rerender(); } }, MAP_VIEWS.map(([k, n]) => h('option', { value: k, selected: k === s.layout }, n)));
    const stage = h('div', { class: 'mm-stage', onclick: e => { if (e.target === stage) { s.sel = null; draw(); } } });
    const bsel = h('select', { class: 'inp', id: 'mma-' + id, 'aria-label': 'Add to' }, s.br.map((b, i) => h('option', { value: i }, b.t || 'Branch ' + (i + 1))));
    const tin = h('input', { class: 'inp', id: 'mmi-' + id, placeholder: 'Type an idea and press Enter', maxlength: 140, dir: 'auto', 'aria-label': 'New idea' });
    const add = h('form', { class: 'mm-add', onsubmit: e => { e.preventDefault(); const t = tin.value.trim(); if (!t) return; const b = s.br[+bsel.value] || s.br[0]; b.items.push({ id: uid(), t }); tin.value = ''; save(); draw(); Snd.play('pop'); } }, bsel, tin, h('button', { class: 'btn pri sm', type: 'submit' }, svg('plus'), 'Add'));
    const wrap = h('div', { class: 'mm' + (lv.on ? ' lvon' + (s.live.big ? ' lvbig' : '') : '') },
      h('div', { class: 'mm-bar' }, h('label', { class: 'mm-vl', for: 'mmv-' + id }, 'Show as'), view, h('span', { class: 'sp' }), lv.button), lv.panel, stage, add);
    c.body.append(wrap);
    const esc = t => String(t).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
    const editTopic = el => { el.contentEditable = 'true'; el.spellcheck = false; el.dir = 'auto'; el.oninput = () => { s.topic = el.textContent; save(); lv.sync(); }; return el; };
    const editBranch = (el, b) => { el.contentEditable = 'true'; el.spellcheck = false; el.dir = 'auto'; el.oninput = () => { b.t = el.textContent; save(); lv.sync(); }; return el; };
    const itemEl = (it, b, bi) => {
      const sel = s.sel === it.id;
      const el = h('div', { class: 'mm-item' + (sel ? ' sel' : '') + (it.live ? ' live' : ''), style: { '--bc': `var(${MAP_COLS[bi]})` }, tabindex: '0', onclick: e => { e.stopPropagation(); s.sel = sel ? null : it.id; draw(); } },
        h('span', { dir: 'auto' }, it.t), it.n ? h('small', { dir: 'auto' }, it.n) : null,
        sel ? h('button', { class: 'mm-x', type: 'button', 'aria-label': 'Delete this idea', onclick: e => { e.stopPropagation(); const i = b.items.indexOf(it); b.items.splice(i, 1); s.sel = null; save(); draw(); toast('Idea deleted', { action: ['Undo', () => { b.items.splice(i, 0, it); save(); draw(); }] }); } }, '×') : null);
      return el;
    };
    function draw() {
      stage.className = 'mm-stage ' + s.layout;
      const L = s.layout, B = s.br.length;
      if (L === 'mind') {
        const pos = (deg, rx, ry) => { const t = deg * Math.PI / 180; return [50 + rx * Math.cos(t), 50 + ry * Math.sin(t)]; };
        let lines = '';
        const nodes = [];
        s.br.forEach((b, k) => {
          const a = -90 + k * 360 / B, [bx, by] = pos(a, 25, 27);
          lines += `<path d="M50 50L${bx.toFixed(2)} ${by.toFixed(2)}" style="stroke:var(${MAP_COLS[k]})" class="br"/>`;
          const m = b.items.length, span = Math.min(70, 360 / B * .62), two = m > 3;
          b.items.forEach((it, j) => {
            const aj = m > 1 ? a + (j - (m - 1) / 2) * span / (m - 1) : a, r = two && j % 2 ? 1.17 : 1;
            let [ix, iy] = pos(aj, 40 * r, 39 * r); ix = clamp(ix, 9, 91); iy = clamp(iy, 7, 93);
            lines += `<path d="M${bx.toFixed(2)} ${by.toFixed(2)}Q${((bx + ix) / 2).toFixed(2)} ${by.toFixed(2)} ${ix.toFixed(2)} ${iy.toFixed(2)}" style="stroke:var(${MAP_COLS[k]})"/>`;
            const el = itemEl(it, b, k); el.style.left = ix + '%'; el.style.top = iy + '%'; nodes.push(el);
          });
          const bn = editBranch(h('div', { class: 'mm-br', style: { left: bx + '%', top: by + '%', '--bc': `var(${MAP_COLS[k]})` } }, b.t), b); nodes.push(bn);
        });
        stage.replaceChildren(h('div', { class: 'mm-lines', html: `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>` }), ...nodes, editTopic(h('div', { class: 'mm-topic', style: { left: '50%', top: '50%' } }, s.topic)));
        return;
      }
      if (L === 'tree') {
        stage.replaceChildren(h('div', { class: 'mt' }, h('div', { class: 'mt-root' }, editTopic(h('b', {}, s.topic))),
          h('div', { class: 'mt-cols', style: { '--n': B } }, s.br.map((b, k) => h('div', { class: 'mt-col' }, editBranch(h('div', { class: 'mt-h', style: { '--bc': `var(${MAP_COLS[k]})` } }, b.t), b), h('div', { class: 'mt-items' }, b.items.map(it => itemEl(it, b, k))))))));
        return;
      }
      if (L === 'cols' || L === 'flow') {
        stage.replaceChildren(h('div', { class: 'mc' + (L === 'flow' ? ' flow' : '') }, editTopic(h('b', { class: 'mc-title' }, s.topic)),
          h('div', { class: 'mc-cols', style: { '--n': B } }, s.br.map((b, k) => h('div', { class: 'mc-col' }, editBranch(h('div', { class: 'mc-h', style: { '--bc': `var(${MAP_COLS[k]})` } }, b.t), b), h('div', { class: 'mc-items' }, b.items.map(it => itemEl(it, b, k))))))));
        return;
      }
      if (L === 'venn') {
        if (B !== 3) { stage.replaceChildren(h('div', { class: 'empty' }, h('p', {}, 'A Venn diagram needs exactly 3 branches: the first group, “Both”, and the second group.'), btn('Use the Venn template', () => { const m = mapFromTpl(MAP_TPL[5]); Object.assign(s, m); save(); c.rerender(); }, 'btn sm'))); return; }
        stage.replaceChildren(h('div', { class: 'mv' }, editTopic(h('b', { class: 'mc-title' }, s.topic)),
          h('div', { class: 'mv-area' }, h('i', { class: 'mv-c a' }), h('i', { class: 'mv-c b' }),
            ...s.br.map((b, k) => h('div', { class: 'mv-zone z' + k }, editBranch(h('div', { class: 'mv-h' }, b.t), b), h('div', { class: 'mv-items' }, b.items.map(it => itemEl(it, b, k))))))));
      }
    }
    draw();
  },
};

/* ---------- Exit ticket ---------- */
const EXIT_TPL = [
  ['321', '3-2-1', ['3 things I learned today', '2 things I found interesting', '1 question I still have'], true],
  ['learn', 'Learned / Not sure', ['Today I learned…', 'I’m still not sure about…'], true],
  ['rate', 'Feeling + why', ['Why do you feel this way about today’s lesson?'], true],
  ['goal', 'Lesson goal', ['Did you reach today’s goal? How do you know?', 'What will you practise next?'], false],
];
T.exit = {
  title: 'Exit ticket', icon: 'exit', w: 680, h: 520, sh: 600, minW: 300, minH: 320, edit: true,
  init: () => ({ tpl: '321', qs: EXIT_TPL[0][2].slice(), mood: true, needName: true, hideNames: false, qid: uid(), resp: [] }),
  mount(c) {
    const s = c.s, id = c.wd.id;
    if (!s.qid) s.qid = uid();
    if (c.editing) {
      const chips = h('div', { class: 'chips' }, EXIT_TPL.map(t => h('button', { class: 'chip', type: 'button', 'aria-pressed': String(s.tpl === t[0]), onclick: () => { s.tpl = t[0]; s.qs = t[2].slice(); s.mood = t[3]; save(); c.rerender(); } }, t[1])));
      const qs = h('div', { class: 'stack' }, [0, 1, 2].map(i => h('input', { class: 'inp', id: `exq${i}-${id}`, value: s.qs[i] || '', maxlength: 80, dir: 'auto', placeholder: i ? 'Another question (optional)' : 'Question', 'aria-label': 'Question ' + (i + 1), oninput: e => { s.qs[i] = e.target.value; s.qs = s.qs.slice(0, 3); s.tpl = 'custom'; save(); } })));
      c.body.append(h('div', { class: 'form' },
        field('Template', chips), h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'Questions (up to 3)'), qs),
        toggle('exm-' + id, 'Students choose a face for how they feel', s.mood, v => { s.mood = v; save(); }),
        toggle('exn-' + id, 'Students must write their name', s.needName, v => { s.needName = v; save(); }),
        toggle('exh-' + id, 'Hide names on the board', s.hideNames, v => { s.hideNames = v; save(); }),
        h('div', { class: 'row' }, btn('Done', () => c.edit(false), 'btn pri'))));
      return;
    }
    const qs = s.qs.map(x => (x || '').trim()).filter(Boolean);
    const lv = liveSetup(c, 'exit', () => ({ title: s._title || 'Exit ticket', q: 'Exit ticket', opts: JSON.stringify(qs), qid: s.qid, mode: (s.mood ? 'm' : '') + (s.needName ? 'n' : '') }), items => {
      let added = 0;
      for (const it of items) {
        const x = parseQ(it); if (x.r !== s.qid || !Array.isArray(x.a) || s.resp.some(r => r.id === it.id)) continue;
        s.resp.unshift({ id: it.id, n: String(x.n || '').slice(0, 40), a: x.a.slice(0, 3).map(v => String(v || '').slice(0, 300)), m: Number.isInteger(x.m) ? x.m : null, at: it.at || Date.now() }); added++;
      }
      if (added) { save(); draw(); }
    });
    const sum = h('div', { class: 'ex-sum' }), list = h('div', { class: 'ex-list' });
    const csv = () => {
      const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
      const head = ['Name', 'Feeling', ...qs, 'Time'].map(q).join(',');
      const feel = ['Great', 'Good', 'Not sure', 'Lost'];
      const rows = s.resp.slice().reverse().map(r => [r.n, r.m == null ? '' : feel[r.m], ...qs.map((_, i) => r.a[i] || ''), new Date(r.at).toLocaleString()].map(q).join(','));
      const data = '﻿' + [head, ...rows].join('\r\n');
      if (APP) { const a = h('a', { href: URL.createObjectURL(new Blob([data], { type: 'text/csv' })), download: `Exit_ticket_${localDate()}.csv` }); document.body.append(a); a.click(); a.remove(); toast('Saved the answers as a spreadsheet file'); }
      else sheet('Exit ticket answers', b => { const ta = h('textarea', { class: 'inp', id: 'excsv', rows: 8, readonly: true }); ta.value = data; b.append(h('p', { class: 'note' }, 'Copy this and paste it into a spreadsheet.'), ta); });
    };
    c.body.append(h('div', { class: 'ex' + (lv.on ? ' lvon' + (s.live.big ? ' lvbig' : '') : '') },
      h('div', { class: 'ex-bar' }, h('b', { class: 'ex-n' }), h('span', { class: 'sp' }), lv.button,
        s.resp.length ? ib('download', 'Save the answers as a spreadsheet file', csv, 'btn sm ic') : null,
        confirmBtn('New round', 'Tap again: clears answers', () => { s.resp = []; s.qid = uid(); save(); c.rerender(); if (lv.on) toast('New round: students can send a new exit ticket.'); }, 'btn sm')),
      lv.panel, sum, list));
    function draw() {
      c.body.querySelector('.ex-n').textContent = s.resp.length === 1 ? '1 exit ticket' : s.resp.length + ' exit tickets';
      if (s.mood) {
        const cnt = [0, 0, 0, 0]; s.resp.forEach(r => { if (r.m != null && cnt[r.m] != null) cnt[r.m]++; });
        const tot = cnt.reduce((a, b) => a + b, 0), lbl = ['Great', 'Good', 'Not sure', 'Lost'];
        sum.replaceChildren(...cnt.map((n, i) => h('div', { class: 'ex-m', style: { '--w': (tot ? n / tot * 100 : 0) + '%' } }, h('span', { class: 'face', html: faceSvg(i) }), h('span', { class: 'ex-ml' }, lbl[i]), h('i', {}), h('b', {}, String(n)))));
        sum.hidden = false;
      } else sum.hidden = true;
      if (!s.resp.length) { list.replaceChildren(h('div', { class: 'empty' }, h('p', {}, lv.on ? 'Waiting for exit tickets. Students scan the QR code.' : 'Tap “Students join” to show the QR code. Students answer on their phones before they leave.'), h('ol', { class: 'ex-qs' }, qs.map(q => h('li', { dir: 'auto' }, q))))); return; }
      list.replaceChildren(...s.resp.map((r, k) => h('article', { class: 'ex-card' },
        h('header', {}, r.m != null && s.mood ? h('span', { class: 'face', html: faceSvg(r.m) }) : null, h('b', { dir: 'auto' }, s.hideNames ? 'Student ' + (s.resp.length - k) : (r.n || 'No name')),
          h('span', { class: 'sp' }), ib('x', 'Delete this exit ticket', () => { s.resp = s.resp.filter(x => x !== r); save(); draw(); }, 'ib sm')),
        ...qs.map((q, i) => r.a[i] ? h('div', { class: 'ex-a' }, h('small', { dir: 'auto' }, q), h('p', { dir: 'auto' }, r.a[i])) : null))));
    }
    draw();
  },
};
