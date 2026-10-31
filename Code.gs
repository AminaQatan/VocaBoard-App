/**
 * SMART TECH ATTENDANCE + VOCABOARD LIVE — Google Sheets backend (version 2)
 * Developed by: Ms. Amina Qatan
 *
 * 1. Attendance: works exactly as before (POST fields: key, student, status, time, date, course, group).
 * 2. Live activities: students scan a QR code on the board to vote in a Poll or post on an Idea wall.
 *    Every activity has its own random code and a private teacher key, so different classes and
 *    teachers using the same board link at the same time never see each other's answers.
 *    Answers are kept for 6 hours for the live board and also written to the "Live" sheet.
 */
const SECRET_KEY = ''; // Keep blank unless you also set the same key in the app (attendance only).
const LIVE_HOURS = 6;

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.action) return live_(p);
  try {
    if (SECRET_KEY && p.key !== SECRET_KEY) return jsonOut({ok:false,error:'Invalid key'});
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = getAttendanceSheet_(ss);
    const r = {
      student:(p.student||'').trim(),
      status:(p.status||'').trim(),
      time:(p.time||'').trim(),
      date:(p.date||'').trim(),
      course:(p.course||'').trim(),
      group:(p.group||'').trim()
    };
    if (!r.student || !r.date || !r.course || !r.group) return jsonOut({ok:false,error:'Missing required fields'});
    upsertAttendance_(sh,r,new Date());
    updateSummary_(ss);
    return jsonOut({ok:true});
  } catch (err) {
    return jsonOut({ok:false,error:String(err)});
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action) return live_(p);
  return ContentService.createTextOutput('Smart Tech Attendance endpoint is ready.');
}

/* ---------- Live activities ---------- */
function live_(p) {
  try {
    if (p.action === 'ping') return jsonOut({ok:true, live:2});
    const code = String(p.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    if (!code) return jsonOut({ok:false, error:'no_code'});
    const cache = CacheService.getScriptCache(), ttl = LIVE_HOURS * 3600;
    const getMeta = () => { const m = cache.get('m_' + code); return m ? JSON.parse(m) : null; };
    if (p.action === 'info') {
      const m = getMeta(); if (!m) return jsonOut({ok:false, error:'not_found'});
      delete m.owner; return jsonOut({ok:true, meta:m});
    }
    if (p.action === 'list') {
      const m = getMeta(); if (!m || m.owner !== String(p.owner || '')) return jsonOut({ok:false, error:'not_found'});
      const items = JSON.parse(cache.get('i_' + code) || '[]'), from = Math.max(0, Number(p.from) || 0);
      return jsonOut({ok:true, n:items.length, items:items.slice(from)});
    }
    if (p.action !== 'open' && p.action !== 'close' && p.action !== 'send') return jsonOut({ok:false, error:'bad_action'});
    // Only the quick memory updates happen inside the lock; writing to the sheet happens after it.
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) return jsonOut({ok:false, error:'busy'});
    let out, logRow = null;
    try {
      const m = getMeta();
      if (p.action === 'open' || p.action === 'close') {
        if (m && m.owner !== String(p.owner || '')) out = {ok:false, error:'taken'};
        else if (p.action === 'close') { if (m) { m.open = false; cache.put('m_' + code, JSON.stringify(m), ttl); } out = {ok:true}; }
        else {
          let opts = []; try { opts = JSON.parse(p.opts || '[]'); } catch (err) {}
          const meta = { owner:String(p.owner || ''), kind:String(p.kind || ''), mode:String(p.mode || ''), title:String(p.title || '').slice(0, 120), q:String(p.q || '').slice(0, 300),
                         opts:(Array.isArray(opts) ? opts : []).slice(0, 8).map(o => String(o).slice(0, 80)), qid:String(p.qid || ''), open:true, t:Date.now() };
          if (!meta.owner) out = {ok:false, error:'no_owner'};
          else {
            cache.put('m_' + code, JSON.stringify(meta), ttl);
            cache.put('i_' + code, cache.get('i_' + code) || '[]', ttl);
            if (!m || m.qid !== meta.qid) logRow = ['open', code, meta.kind, meta.q, '', meta.qid];
            out = {ok:true};
          }
        }
      } else {
        if (!m) out = {ok:false, error:'not_found'};
        else if (!m.open) out = {ok:false, error:'closed'};
        else {
          const items = JSON.parse(cache.get('i_' + code) || '[]');
          const it = { id:Utilities.getUuid().slice(0, 8), qid:String(p.qid || ''), at:Date.now() };
          if (p.v !== undefined && p.v !== '') it.v = Number(p.v);
          if (p.t) it.t = String(p.t).slice(0, 300);
          if (p.c) it.c = String(p.c).slice(0, 12);
          if (p.n) it.n = String(p.n).slice(0, 40);
          items.push(it);
          const json = JSON.stringify(items);
          if (items.length > 500 || Utilities.newBlob(json).getBytes().length > 95000) out = {ok:false, error:'full'}; // the memory holds up to 100 KB per activity
          else {
            cache.put('i_' + code, json, ttl);
            logRow = ['send', code, m.kind, m.kind === 'poll' ? (m.opts[it.v] !== undefined ? m.opts[it.v] : it.v) : (it.t || ''), it.n || '', it.qid];
            out = {ok:true, id:it.id};
          }
        }
      }
    } finally {
      lock.releaseLock();
    }
    if (logRow) log_(logRow);
    return jsonOut(out);
  } catch (err) {
    return jsonOut({ok:false, error:String(err)});
  }
}

function log_(row) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName('Live');
    if (!sh) {
      sh = ss.insertSheet('Live');
      sh.appendRow(['Time','Action','Code','Activity','Answer or post','Name','Question id']);
      sh.getRange(1,1,1,7).setFontWeight('bold').setBackground('#6D35A8').setFontColor('#FFFFFF');
      sh.setFrozenRows(1);
    }
    sh.appendRow([new Date()].concat(row));
  } catch (err) {}
}

/* Run this once from the editor (select "setupCheck" and press Run) to give the script permission
   to use the sheet. Then deploy as a Web app: Execute as "Me", Who has access "Anyone". */
function setupCheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  getAttendanceSheet_(ss);
  CacheService.getScriptCache().put('setup', '1', 60);
  Logger.log('Ready: ' + ss.getName());
}

/* ---------- Attendance (unchanged) ---------- */
function getAttendanceSheet_(ss) {
  let sh=ss.getSheetByName('Attendance');
  if(!sh) sh=ss.insertSheet('Attendance');
  if(sh.getLastRow()===0){
    sh.appendRow(['Date','Course','Group','Student Name','Status','Check-in Time','Recorded At']);
    sh.getRange(1,1,1,7).setFontWeight('bold').setBackground('#6D35A8').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  }
  return sh;
}

function upsertAttendance_(sh,r,now){
  const last=sh.getLastRow();
  if(last>=2){
    const vals=sh.getRange(2,1,last-1,7).getValues();
    for(let i=0;i<vals.length;i++){
      const row=vals[i];
      if(String(row[0])===r.date && String(row[1])===r.course && String(row[2])===r.group && String(row[3]).toLowerCase()===r.student.toLowerCase()){
        sh.getRange(i+2,5,1,3).setValues([[r.status,r.time,now]]);
        formatStatus_(sh,i+2,r.status); return;
      }
    }
  }
  sh.appendRow([r.date,r.course,r.group,r.student,r.status,r.time,now]);
  formatStatus_(sh,sh.getLastRow(),r.status);
}

function formatStatus_(sh,row,status){
  const c=sh.getRange(row,5).setFontWeight('bold');
  if(status==='Present') c.setBackground('#E8F7EF').setFontColor('#168157');
  else if(status==='Absent') c.setBackground('#FFF0F0').setFontColor('#BF3F3F');
  else c.setBackground('#F3E8FF').setFontColor('#6D35A8');
}

function updateSummary_(ss){
  const src=ss.getSheetByName('Attendance');
  let sh=ss.getSheetByName('Daily Summary');
  if(!sh) sh=ss.insertSheet('Daily Summary');
  sh.clearContents();
  sh.appendRow(['Date','Course','Group','Present','Absent','Total Recorded']);
  sh.getRange(1,1,1,6).setFontWeight('bold').setBackground('#6D35A8').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  if(!src || src.getLastRow()<2) return;
  const vals=src.getRange(2,1,src.getLastRow()-1,7).getValues();
  const map={};
  vals.forEach(row=>{
    const k=[row[0],row[1],row[2]].join('|||');
    if(!map[k]) map[k]={date:row[0],course:row[1],group:row[2],present:0,absent:0,total:0};
    if(row[4]==='Present') map[k].present++;
    if(row[4]==='Absent') map[k].absent++;
    map[k].total++;
  });
  const out=Object.values(map).map(x=>[x.date,x.course,x.group,x.present,x.absent,x.total]);
  if(out.length) sh.getRange(2,1,out.length,6).setValues(out);
  sh.autoResizeColumns(1,6);
}

function jsonOut(obj){
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
