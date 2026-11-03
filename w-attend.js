/* ---------- Smart Tech Attendance (built from Amina's Smart Tech Attendance app) ---------- */
const AV_N = { b: 40, g: 45 };
const avatarSrc = (g, i) => `avatars/${g}${String(i % AV_N[g] + 1).padStart(2, '0')}.webp`;
const FEMALE_EN = new Set(('afnan alanood alyamamh amal amena amna asma asmaa basmah fatima fatma ghada hiba heba huda jamila jawahr lamar maryam mariam muna mona nashwa noor noora nour omaimah raghad rahma rana reema reem rithaa roya salma shahad shaima shaimaa wejdan zamzam aisha aysha hajer hind iman eman khadija khawla laila layla lujain malak manar marwa maya nada rawan ruqaya safa sara sarah sumaya wafa yasmin yasmeen zahra zainab zaynab hala lama joud jood rimas razan shatha abeer afrah alia aliya amira arwa batool bushra dana dalia duaa esraa israa ghaida haya hessa jana jumana kholood lina maha maisa mayar nadia najla nawal nouf ohood rasha ruba sabah sahar salwa samar samira sana shaikha shamsa shouq suad tasneem widad yara yusra zeinab sumaiya athari ritaj taif aseel').split(' '));
const FEMALE_AR = new Set('فاطمة مريم عائشة زينب نور سارة ريم هند أسماء اسماء ليلى حلا رغد شهد لمى جود ملاك منى هدى أمل امل خديجة آمنة امنة سلمى زمزم رنا يارا أروى اروى لجين روان رهف غلا مها نوف شما عهود بدور سعاد وجدان بشرى هاجر أسيل اسيل ريتاج'.split(' '));
const MALE_AR_TA = new Set('حمزة أسامة اسامة عبيدة طلحة معاوية عكرمة قتادة حذيفة'.split(' '));
function guessGirl(name) {
  const f = String(name || '').trim().split(/\s+/)[0] || '';
  if (/[؀-ۿ]/.test(f)) { if (FEMALE_AR.has(f)) return true; if (MALE_AR_TA.has(f)) return false; return /ة$/.test(f); }
  return FEMALE_EN.has(f.toLowerCase());
}
const isGirl = (c, n) => c.gender && c.gender[n] ? c.gender[n] === 'g' : guessGirl(n);
function classLabel(c) { return c ? (c.subject ? c.subject + (c.name ? ' · ' + c.name : '') : c.name) : ''; }
function localDate() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function attStore() {
  if (!S.att) S.att = { sheet: { url: '', key: '' }, sess: {} };
  if (!S.att.sheet.url) { const old = ls.get('smart_tech_attendance_settings_v1'); if (old && old.scriptUrl) { S.att.sheet = { url: old.scriptUrl, key: old.secretKey || '' }; save(); } }
  return S.att;
}
function attSession(c, date) { const A = attStore(), k = c.id + '__' + date; return A.sess[k] || (A.sess[k] = { fin: false, rec: {} }); }
async function attSend(c, date, name, r, test) {
  const sh = attStore().sheet; if (!sh.url) return false;
  try {
    await fetch(sh.url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ key: sh.key || '', student: name, status: r.st, time: r.t || '', date, course: c.subject || c.name || 'Class', group: c.name || c.subject || 'Class', subject: c.subject || '' }) });
    return true;
  } catch (e) { if (test) toast('Couldn’t reach Google Sheets. Check the address and the internet connection.'); return false; }
}
function saveText(filename, text, mime) {
  if (APP) { const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: mime || 'text/csv;charset=utf-8' })), download: filename }); document.body.append(a); a.click(); a.remove(); toast('Saved ' + filename); return; }
  sheet('Save ' + filename, body => {
    const ta = h('textarea', { class: 'inp', id: 'savetext', rows: 8, readonly: true }); ta.value = text;
    body.append(h('p', { class: 'note' }, 'Copy this text and paste it into Excel or Google Sheets. In the installed app this saves as a file.'), ta,
      h('div', { class: 'row' }, btn('Copy', async () => { try { await navigator.clipboard.writeText(text); toast('Copied'); } catch (e) { ta.focus(); ta.select(); toast('Press Ctrl+C or Cmd+C to copy'); } }, 'btn sm pri', 'copy')));
  });
}
const csvCell = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
/* reading student lists: CSV, TXT or Excel, with or without headings */
function parseCSV(text, d) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; continue; }
    if (ch === '"') q = true; else if (ch === d) { row.push(cell); cell = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
async function readRosterFile(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (['xlsx', 'xls', 'xlsm', 'ods'].includes(ext)) {
    await loadScript(LIB.xlsx);
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: false });
  }
  const text = (await file.text()).replace(/^﻿/, ''), first = text.split(/\r?\n/)[0] || '';
  const d = [',', ';', '\t', '،'].map(x => [x, first.split(x).length - 1]).sort((a, b) => b[1] - a[1])[0];
  return parseCSV(text, d[1] ? d[0] : '\u0000');
}
function rosterFromRows(rows, fileName) {
  rows = rows.map(r => (r || []).map(x => String(x == null ? '' : x).trim())).filter(r => r.some(Boolean));
  if (!rows.length) return [];
  const head = rows[0].map(x => x.toLowerCase()), find = re => head.findIndex(x => re.test(x));
  const iFirst = find(/first/), iLast = find(/last|surname|family/);
  let iName = find(/name|student/);
  const iSub = find(/subject|course/), iGrp = find(/group|class|section/), iGen = find(/gender|sex/);
  const hasHead = iName >= 0 || iSub >= 0 || iGrp >= 0 || iGen >= 0;
  if (!hasHead || iName < 0) iName = 0;
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const groups = new Map();
  for (const r of hasHead ? rows.slice(1) : rows) {
    let name = iFirst >= 0 && iLast >= 0 && iFirst !== iLast ? `${r[iFirst] || ''} ${r[iLast] || ''}`.trim() : r[iName];
    if (!name || /^\d+$/.test(name)) continue; name = name.replace(/\s+/g, ' ');
    const sub = iSub >= 0 ? r[iSub] || '' : '', grp = iGrp >= 0 ? r[iGrp] || '' : '', key = sub + '|' + grp;
    if (!groups.has(key)) groups.set(key, { subject: sub, name: grp || (sub ? '' : base), names: [], gender: {} });
    const g = groups.get(key); if (!g.names.includes(name)) g.names.push(name);
    if (iGen >= 0) { const v = String(r[iGen] || '').toLowerCase(); if (/^(f|g|female|girl|أنثى|انثى|بنت|طالبة)/.test(v)) g.gender[name] = 'g'; else if (/^(m|b|male|boy|ذكر|ولد|طالب)/.test(v)) g.gender[name] = 'b'; }
  }
  return [...groups.values()].filter(g => g.names.length);
}
async function importRosters(files) {
  let made = [], err = '';
  for (const f of files) {
    try {
      const groups = rosterFromRows(await readRosterFile(f), f.name);
      if (!groups.length) { err = `No student names were found in ${f.name}.`; continue; }
      for (const g of groups) {
        const same = S.classes.find(x => (x.subject || '').toLowerCase() === g.subject.toLowerCase() && (x.name || '').toLowerCase() === g.name.toLowerCase());
        if (same) { same.names = g.names; same.gender = Object.assign(same.gender || {}, g.gender); same.absent = (same.absent || []).filter(n => g.names.includes(n)); made.push(same); }
        else { const c = { id: uid(), name: g.name || 'Class', subject: g.subject, names: g.names, absent: [], gender: g.gender }; S.classes.push(c); made.push(c); }
      }
    } catch (e) { err = /xlsx|load/i.test(String(e && e.message)) ? 'Opening Excel files needs an internet connection the first time. You can also save the sheet as CSV and upload that.' : `${f.name} couldn’t be read. Upload an Excel or CSV file with one student name per row.`; }
  }
  save();
  if (made.length) toast(made.length === 1 ? `${classLabel(made[0])}: ${made[0].names.length} students saved` : `${made.length} classes saved`);
  if (err) toast(err);
  return made;
}

T.attend = {
  title: 'Smart Tech Attendance', icon: 'attend', w: 940, h: 640, sh: 680, minW: 320, minH: 320, edit: true,
  init: () => ({ cls: null, date: '' }),
  mount(c) {
    const s = c.s; attStore();
    const pickFiles = (onDone) => { const inp = h('input', { type: 'file', multiple: true, accept: '.csv,.txt,.xlsx,.xls,.ods,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel', hidden: true, onchange: async e => { const fs = [...e.target.files]; if (fs.length) { const made = await importRosters(fs); if (made.length) { s.cls = made[0].id; save(); } onDone && onDone(made); } } }); document.body.append(inp); inp.click(); setTimeout(() => inp.remove(), 60000); };
    const uploadBtn = (label, cls, after) => btn(label, () => pickFiles(made => { if (made.length) { after ? after() : c.rerender(); } }), cls || 'btn pri', 'upload');
    if (c.editing) return this.manage(c, uploadBtn);
    const cl = S.classes.find(x => x.id === s.cls) || S.classes.find(x => x.names && x.names.length) || S.classes[0];
    if (!cl || !cl.names.length) {
      c.body.append(h('div', { class: 'empty at-empty' }, h('img', { src: avatarSrc('g', 3), alt: '', class: 'at-emptyimg' }), h('b', {}, 'Add your class to take attendance'),
        h('p', {}, 'Upload an Excel or CSV file with your students’ names, or type the names in yourself.'),
        h('div', { class: 'row', style: { justifyContent: 'center' } }, uploadBtn('Upload student list'), btn('Type names', () => c.edit(true), 'btn', 'edit'))));
      return;
    }
    s.cls = cl.id;
    const date = s.date || localDate(), today = date === localDate();
    const ses = attSession(cl, date);
    const recs = ses.rec, present = cl.names.filter(n => recs[n] && recs[n].st !== 'Absent').length, absent = cl.names.filter(n => recs[n] && recs[n].st === 'Absent').length;
    const waiting = cl.names.filter(n => !recs[n]);
    const stat = (n, label, k) => h('div', { class: 'at-stat ' + k }, h('b', {}, String(n)), h('span', {}, label));
    const sel = h('select', { class: 'at-in', id: 'atc-' + c.wd.id, 'aria-label': 'Class', onchange: e => { if (e.target.value === '__new') { c.edit(true); return; } s.cls = e.target.value; save(); c.rerender(); } },
      S.classes.filter(x => x.names.length).map(x => h('option', { value: x.id, selected: x.id === cl.id }, classLabel(x))), h('option', { value: '__new' }, '+ Add or upload a class…'));
    const dt = h('input', { class: 'at-in', type: 'date', id: 'atd-' + c.wd.id, value: date, 'aria-label': 'Attendance date', onchange: e => { s.date = e.target.value === localDate() ? '' : e.target.value; save(); c.rerender(); } });
    const finishBtn = ses.fin ? btn('View results', () => this.results(c, cl, date), 'btn sm at-white', 'list') : confirmBtn('Finish attendance', 'Tap again: the rest are absent', () => {
      waiting.forEach(n => { recs[n] = { st: 'Absent', t: '' }; attSend(cl, date, n, recs[n]); });
      ses.fin = true; if (today) cl.absent = cl.names.filter(n => recs[n] && recs[n].st === 'Absent'); save(); Snd.play('chime'); c.rerender();
    }, 'btn sm at-white');
    const sheetOk = !!attStore().sheet.url;
    const hero = h('div', { class: 'at-hero' },
      h('div', { class: 'at-title' }, h('b', { dir: 'auto' }, cl.subject || cl.name), h('span', { dir: 'auto' }, (cl.subject ? cl.name + ' · ' : '') + cl.names.length + ' students')),
      h('div', { class: 'at-pick' }, sel, dt),
      h('div', { class: 'at-stats' }, stat(cl.names.length, 'Total', 't'), stat(present, 'Present', 'p'), stat(absent, 'Absent', 'a'), stat(waiting.length, 'Waiting', 'w')),
      h('div', { class: 'at-act' }, finishBtn, uploadBtn('Upload list', 'btn sm at-glass'), ib('list', 'Results and export', () => this.results(c, cl, date), 'btn sm ic at-glass'), ib('edit', 'Students, subject and Google Sheets', () => c.edit(true), 'btn sm ic at-glass')));
    const tip = h('div', { class: 'at-tip' }, svg('hand'), h('span', {}, h('b', {}, 'Students: '), 'find your name and tap your character once.'), h('span', { class: 'at-badge' + (sheetOk ? ' ok' : '') }, sheetOk ? 'Google Sheets connected' : 'Saved on this device'), h('small', { class: 'at-credit' }, 'Developed by: Ms. Amina Qatan'));
    let main;
    if (ses.fin) {
      main = h('div', { class: 'at-done' }, h('div', { class: 'at-tick' }, svg('check')), h('b', {}, 'Attendance completed'), h('p', {}, `${classLabel(cl)} · ${date} · Present: ${present} · Absent: ${absent}`),
        h('div', { class: 'row', style: { justifyContent: 'center' } }, btn('Export for Excel', () => this.exportDay(cl, date), 'btn', 'download'), btn('View results', () => this.results(c, cl, date), 'btn', 'list'),
          confirmBtn('Restart this session', 'Tap again to restart', () => { ses.rec = {}; ses.fin = false; save(); c.rerender(); }, 'btn danger')));
    } else if (!waiting.length) {
      main = h('div', { class: 'at-done' }, h('div', { class: 'at-tick' }, svg('check')), h('b', {}, 'Everyone has checked in'), h('p', {}, 'Tap Finish attendance to save the day.'));
    } else {
      main = h('div', { class: 'at-grid' }, waiting.map(n => {
        const i = cl.names.indexOf(n), girl = isGirl(cl, n);
        const card = h('button', { class: 'at-card', type: 'button', 'aria-label': n + ' check in' },
          h('span', { class: 'at-av' }, h('img', { src: avatarSrc(girl ? 'g' : 'b', i), alt: '', loading: 'lazy', draggable: 'false' }), h('i', { class: 'at-ok' }, svg('check')), h('i', { class: 'bb b1' }), h('i', { class: 'bb b2' }), h('i', { class: 'bb b3' })),
          h('span', { class: 'at-name', dir: 'auto' }, n));
        card.onclick = () => {
          if (recs[n]) return;
          recs[n] = { st: 'Present', t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
          save(); card.classList.add('marked'); Snd.play('cute'); toast(n + ' — Present'); attSend(cl, date, n, recs[n]);
          if (today && cl.absent.includes(n)) cl.absent = cl.absent.filter(x => x !== n);
          setTimeout(() => c.rerender(), 760);
        };
        return card;
      }));
    }
    c.body.append(h('div', { class: 'at' }, hero, tip, main));
  },
  results(c, cl, date) {
    const ses = attSession(cl, date), recs = ses.rec, NEXT = { Present: 'Late', Late: 'Absent', Absent: 'Present' };
    sheet('Attendance results', body => {
      const sum = h('p', { class: 'note' });
      const paintSum = () => { const p = cl.names.filter(n => recs[n] && recs[n].st === 'Present').length, l = cl.names.filter(n => recs[n] && recs[n].st === 'Late').length, a = cl.names.filter(n => recs[n] && recs[n].st === 'Absent').length; sum.textContent = `${classLabel(cl)} · ${date} · Present ${p} · Late ${l} · Absent ${a} · Waiting ${cl.names.length - p - l - a}. Tap a status to change it.`; };
      const list = h('div', { class: 'at-res' }, cl.names.map((n, i) => {
        const b = h('button', { type: 'button', class: 'at-st' });
        const paint = () => { const r = recs[n]; b.textContent = r ? r.st : 'Waiting'; b.dataset.st = r ? r.st : ''; };
        b.onclick = () => { const r = recs[n]; recs[n] = { st: r ? NEXT[r.st] : 'Present', t: r && r.t ? r.t : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }; if (date === localDate()) cl.absent = cl.names.filter(x => recs[x] && recs[x].st === 'Absent'); save(); attSend(cl, date, n, recs[n]); paint(); paintSum(); c.rerender(); };
        paint();
        return h('div', { class: 'at-row' }, h('b', {}, String(i + 1)), h('img', { src: avatarSrc(isGirl(cl, n) ? 'g' : 'b', i), alt: '' }), h('span', { dir: 'auto' }, n), b, h('small', {}, (recs[n] && recs[n].t) || ''));
      }));
      paintSum();
      body.append(sum, list, h('div', { class: 'row' }, btn('Export this day', () => this.exportDay(cl, date), 'btn sm pri', 'download'), btn('Export all dates (register)', () => this.exportAll(cl), 'btn sm', 'download')));
    });
  },
  exportDay(cl, date) {
    const recs = attSession(cl, date).rec;
    const rows = [['Student Name', 'Status', 'Check-in Time', 'Date', 'Subject', 'Class'], ...cl.names.map(n => [n, recs[n] ? recs[n].st : '', recs[n] ? recs[n].t : '', date, cl.subject || '', cl.name])];
    saveText(`Attendance_${classLabel(cl).replace(/[^\w\u0600-\u06ff]+/g, '_')}_${date}.csv`, '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\n'));
  },
  exportAll(cl) {
    const A = attStore(), dates = Object.keys(A.sess).filter(k => k.startsWith(cl.id + '__')).map(k => k.split('__')[1]).sort();
    if (!dates.length) { toast('No attendance saved for this class yet.'); return; }
    const ab = { Present: 'P', Late: 'L', Absent: 'A' };
    const rows = [['Student Name', ...dates, 'Present', 'Late', 'Absent', '% Present'], ...cl.names.map(n => {
      const v = dates.map(d => { const r = A.sess[cl.id + '__' + d].rec[n]; return r ? ab[r.st] || r.st : ''; });
      const p = v.filter(x => x === 'P').length, l = v.filter(x => x === 'L').length, a = v.filter(x => x === 'A').length, tot = p + l + a;
      return [n, ...v, p, l, a, tot ? Math.round((p + l) / tot * 100) + '%' : ''];
    })];
    saveText(`Register_${classLabel(cl).replace(/[^\w\u0600-\u06ff]+/g, '_')}.csv`, '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\n'));
  },
  manage(c, uploadBtn) {
    const s = c.s, A = attStore();
    let cl = S.classes.find(x => x.id === s.cls) || S.classes[0];
    if (!cl) { cl = { id: uid(), name: 'My class', subject: '', names: [], absent: [], gender: {} }; S.classes.push(cl); s.cls = cl.id; save(); }
    cl.gender = cl.gender || {};
    const id = c.wd.id;
    const sel = h('select', { class: 'inp', id: 'amc-' + id, onchange: e => { s.cls = e.target.value; save(); c.rerender(); } }, S.classes.map(x => h('option', { value: x.id, selected: x.id === cl.id }, classLabel(x) || 'Class')));
    const sub = h('input', { class: 'inp', id: 'ams-' + id, value: cl.subject || '', placeholder: 'e.g. Public Speaking', dir: 'auto', oninput: e => { cl.subject = e.target.value.trim(); save(); sel.selectedOptions[0].textContent = classLabel(cl); } });
    const nm = h('input', { class: 'inp', id: 'amn-' + id, value: cl.name || '', placeholder: 'e.g. Group D', dir: 'auto', oninput: e => { cl.name = e.target.value.trim(); save(); sel.selectedOptions[0].textContent = classLabel(cl); } });
    const chips = h('div', { class: 'at-chips' });
    const drawChips = () => chips.replaceChildren(...cl.names.map((n, i) => {
      const g = isGirl(cl, n);
      return h('button', { class: 'chip at-chip', type: 'button', title: 'Tap to switch the character', onclick: () => { cl.gender[n] = g ? 'b' : 'g'; save(); drawChips(); } }, h('img', { src: avatarSrc(g ? 'g' : 'b', i), alt: '' }), h('span', { dir: 'auto' }, n));
    }));
    const ta = h('textarea', { class: 'inp', id: 'amt-' + id, rows: 7, dir: 'auto', placeholder: 'One student name per line', oninput: e => { cl.names = e.target.value.split(/\n/).map(x => x.trim()).filter(Boolean); cl.absent = (cl.absent || []).filter(n => cl.names.includes(n)); save(); drawChips(); } });
    ta.value = cl.names.join('\n'); drawChips();
    const url = h('input', { class: 'inp', id: 'amu-' + id, type: 'url', value: A.sheet.url, placeholder: 'https://script.google.com/macros/s/…/exec' });
    const key = h('input', { class: 'inp', id: 'amk-' + id, value: A.sheet.key, placeholder: 'Connection key (optional)' });
    const sheets = h('details', { class: 'at-sheets' }, h('summary', {}, 'Google Sheets connection'),
      h('p', { class: 'note' }, APP ? 'Paste the Web App address from your Smart Tech Attendance Google Sheet. Every check-in is then copied to the sheet.' : 'Copying to Google Sheets works in the installed app. Here, attendance is saved on this device.'),
      field('Web App address', url), field('Connection key', key),
      h('div', { class: 'row' }, btn('Save connection', () => { A.sheet = { url: url.value.trim(), key: key.value.trim() }; save(); toast(A.sheet.url ? 'Google Sheets connected' : 'Google Sheets disconnected'); }, 'btn sm pri'),
        btn('Send a test row', async () => { A.sheet = { url: url.value.trim(), key: key.value.trim() }; save(); if (!A.sheet.url) { toast('Paste the Web App address first.'); return; } if (await attSend(cl, localDate(), 'CONNECTION TEST', { st: 'Test', t: new Date().toLocaleTimeString() }, true)) toast('Test row sent. Check your sheet.'); }, 'btn sm')));
    c.body.append(h('div', { class: 'form' },
      h('div', { class: 'at-up' }, h('div', {}, h('b', {}, 'Upload a student list'), h('p', { class: 'note' }, 'Excel or CSV. One name per row. Columns can be Student Name, Subject or Course, Class or Group, and Gender. Each subject and class becomes its own list, and uploading the same class again updates it.')), uploadBtn('Upload Excel or CSV', 'btn pri', () => c.rerender())),
      field('Class', h('div', { class: 'row nw' }, sel, btn('New', () => { const n = { id: uid(), name: 'Class ' + (S.classes.length + 1), subject: '', names: [], absent: [], gender: {} }; S.classes.push(n); s.cls = n.id; save(); c.rerender(); }, 'btn sm', 'plus'))),
      h('div', { class: 'two' }, field('Subject name', sub), field('Class or group', nm)),
      field('Students, one per line', ta),
      field('Characters (tap a name to switch between boy and girl)', chips),
      sheets,
      h('div', { class: 'row' }, btn('Done', () => c.edit(false), 'btn pri'), S.classes.length > 1 ? confirmBtn('Delete this class', 'Tap again to delete', () => { S.classes = S.classes.filter(x => x !== cl); Object.keys(A.sess).forEach(k => { if (k.startsWith(cl.id + '__')) delete A.sess[k]; }); s.cls = null; save(); c.rerender(); }) : null)));
  },
};
