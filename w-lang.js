/* ---------- Word Family and Dictionary ---------- */
const POS = { n: ['Noun', 'اسم', '--lav'], v: ['Verb', 'فعل', '--mint'], a: ['Adjective', 'صفة', '--pink'], d: ['Adverb', 'ظرف', '--aqua'] };
/* common word families (checked by hand): base | n: nouns | v: verbs | a: adjectives | d: adverbs */
const WF_DATA = `create|v:create,recreate|n:creation,creativity,creator|a:creative,uncreative|d:creatively
act|v:act,react|n:act,action,actor,activity,reaction|a:active,inactive|d:actively
decide|v:decide|n:decision,indecision|a:decisive,indecisive|d:decisively
succeed|v:succeed|n:success|a:successful,unsuccessful|d:successfully,unsuccessfully
happy|n:happiness,unhappiness|a:happy,unhappy|d:happily,unhappily
educate|v:educate|n:education,educator|a:educational,educated,uneducated|d:educationally
communicate|v:communicate|n:communication,communicator|a:communicative|d:communicatively
inform|v:inform|n:information|a:informative,informed,uninformed|d:informatively
employ|v:employ|n:employment,unemployment,employer,employee|a:employed,unemployed,employable
develop|v:develop|n:development,developer|a:developed,undeveloped,developing
depend|v:depend|n:dependence,independence|a:dependent,independent,dependable|d:independently
able|v:enable,disable|n:ability,inability,disability|a:able,unable,disabled|d:ably
possible|n:possibility,impossibility|a:possible,impossible|d:possibly
care|v:care|n:care,carer|a:careful,careless,caring|d:carefully,carelessly
help|v:help|n:help,helper|a:helpful,unhelpful,helpless|d:helpfully,helplessly
use|v:use,reuse,misuse|n:use,user,usage|a:useful,useless,reusable,used|d:usefully
friend|v:befriend|n:friend,friendship,friendliness|a:friendly,unfriendly
beauty|v:beautify|n:beauty|a:beautiful|d:beautifully
danger|v:endanger|n:danger|a:dangerous,endangered|d:dangerously
safe|n:safety|a:safe,unsafe|d:safely
strong|v:strengthen|n:strength|a:strong|d:strongly
long|v:lengthen|n:length|a:long,lengthy
wide|v:widen|n:width|a:wide|d:widely
deep|v:deepen|n:depth|a:deep|d:deeply
high|v:heighten|n:height|a:high|d:highly
know|v:know|n:knowledge|a:knowledgeable,known,unknown|d:knowingly
agree|v:agree,disagree|n:agreement,disagreement|a:agreeable|d:agreeably
organize|v:organize,reorganize|n:organization,organizer|a:organized,disorganized
prepare|v:prepare|n:preparation|a:prepared,unprepared
imagine|v:imagine|n:imagination|a:imaginative,imaginary,unimaginable|d:imaginatively
explain|v:explain|n:explanation|a:explanatory,unexplained
describe|v:describe|n:description|a:descriptive|d:descriptively
compete|v:compete|n:competition,competitor|a:competitive,uncompetitive|d:competitively
differ|v:differ,differentiate|n:difference|a:different|d:differently
important|n:importance|a:important,unimportant|d:importantly
comfort|v:comfort|n:comfort,discomfort|a:comfortable,uncomfortable|d:comfortably
health|n:health|a:healthy,unhealthy|d:healthily
nature|n:nature|a:natural,unnatural|d:naturally
culture|n:culture|a:cultural|d:culturally
tradition|n:tradition|a:traditional|d:traditionally
economy|v:economize|n:economy,economics,economist|a:economic,economical|d:economically
science|n:science,scientist|a:scientific,unscientific|d:scientifically
history|n:history,historian|a:historic,historical|d:historically
technology|n:technology,technician|a:technological,technical|d:technologically,technically
manage|v:manage|n:management,manager|a:manageable,unmanageable
produce|v:produce,reproduce|n:product,production,producer,productivity|a:productive,unproductive|d:productively
protect|v:protect|n:protection,protector|a:protective|d:protectively
govern|v:govern|n:government,governor|a:governmental
invent|v:invent|n:invention,inventor|a:inventive|d:inventively
attract|v:attract|n:attraction|a:attractive,unattractive|d:attractively
respect|v:respect,disrespect|n:respect,disrespect|a:respectful,disrespectful,respectable|d:respectfully
responsible|n:responsibility,irresponsibility|a:responsible,irresponsible|d:responsibly,irresponsibly
patient|n:patience,impatience|a:patient,impatient|d:patiently,impatiently
confident|n:confidence|a:confident|d:confidently
honest|n:honesty,dishonesty|a:honest,dishonest|d:honestly,dishonestly
kind|n:kindness,unkindness|a:kind,unkind|d:kindly
free|v:free|n:freedom|a:free|d:freely
child|n:child,childhood|a:childish,childlike
power|v:empower|n:power|a:powerful,powerless|d:powerfully
hope|v:hope|n:hope|a:hopeful,hopeless|d:hopefully,hopelessly
speak|v:speak|n:speech,speaker|a:spoken,unspoken
write|v:write,rewrite|n:writer,writing|a:written
read|v:read,reread|n:reader,reading|a:readable,unreadable
teach|v:teach|n:teacher,teaching|a:teachable
learn|v:learn|n:learner,learning|a:learned
present|v:present|n:presentation,presenter|a:present,presentable
perform|v:perform|n:performance,performer
predict|v:predict|n:prediction|a:predictable,unpredictable|d:predictably,unpredictably
relate|v:relate|n:relation,relationship,relative|a:related,unrelated,relative|d:relatively
advertise|v:advertise|n:advertisement,advertising,advertiser
connect|v:connect,disconnect|n:connection|a:connected,disconnected
advise|v:advise|n:advice,adviser|a:advisable
believe|v:believe|n:belief,disbelief|a:believable,unbelievable|d:unbelievably
fail|v:fail|n:failure|a:failed
arrive|v:arrive|n:arrival
pay|v:pay|n:payment|a:paid,unpaid
move|v:move|n:movement|a:movable
enjoy|v:enjoy|n:enjoyment|a:enjoyable
excite|v:excite|n:excitement|a:exciting,excited|d:excitedly
interest|v:interest|n:interest|a:interesting,interested,uninteresting|d:interestingly
bore|v:bore|n:boredom|a:boring,bored
cook|v:cook|n:cook,cooker,cooking|a:cooked,uncooked
build|v:build,rebuild|n:building,builder|a:built
clean|v:clean|n:cleaner,cleanliness|a:clean,unclean
simple|v:simplify|n:simplicity|a:simple|d:simply
clear|v:clear,clarify|n:clarity|a:clear,unclear|d:clearly
sure|v:ensure|a:sure,unsure|d:surely
weak|v:weaken|n:weakness|a:weak|d:weakly
dark|v:darken|n:darkness|a:dark
sad|v:sadden|n:sadness|a:sad|d:sadly
improve|v:improve|n:improvement|a:improved
achieve|v:achieve|n:achievement,achiever|a:achievable
discuss|v:discuss|n:discussion
solve|v:solve|n:solution|a:solvable,unsolvable
choose|v:choose|n:choice|a:chosen
die|v:die|n:death|a:dead,deadly
live|v:live|n:life,living|a:live,alive,lively
grow|v:grow|n:growth,grower|a:grown,growing
true|n:truth|a:true,untrue,truthful|d:truly,truthfully
lose|v:lose|n:loss,loser|a:lost
sell|v:sell|n:sale,seller|a:sold
energy|v:energize|n:energy|a:energetic|d:energetically
environment|n:environment,environmentalist|a:environmental|d:environmentally
industry|v:industrialize|n:industry,industrialization|a:industrial
nation|n:nation,nationality|a:national,international|d:nationally,internationally
person|v:personalize|n:person,personality|a:personal,impersonal|d:personally
profession|n:profession,professional,professionalism|a:professional,unprofessional|d:professionally
special|v:specialize|n:specialist,speciality|a:special,specialized|d:specially
qualify|v:qualify|n:qualification|a:qualified,unqualified
apply|v:apply|n:application,applicant|a:applicable
visit|v:visit|n:visit,visitor
memory|v:memorize|n:memory|a:memorable|d:memorably
fame|n:fame|a:famous|d:famously
luck|n:luck|a:lucky,unlucky|d:luckily,unluckily
quick|v:quicken|n:quickness|a:quick|d:quickly
easy|v:ease|n:ease|a:easy,uneasy|d:easily
law|n:law,lawyer|a:legal,illegal,lawful|d:legally,illegally
finance|v:finance|n:finance|a:financial|d:financially
music|n:music,musician|a:musical|d:musically
art|n:art,artist,artwork|a:artistic|d:artistically
peace|n:peace|a:peaceful|d:peacefully
noise|n:noise|a:noisy|d:noisily
colour|v:colour|n:colour|a:colourful,colourless|d:colourfully
pollute|v:pollute|n:pollution,pollutant|a:polluted,unpolluted`;
const WF = (() => {
  const m = new Map(), idx = new Map();
  WF_DATA.split('\n').forEach(line => {
    const [base, ...parts] = line.split('|'), f = { base, n: [], v: [], a: [], d: [] };
    parts.forEach(p => { const [k, list] = p.split(':'); f[k] = list.split(','); });
    m.set(base, f);
    for (const k of 'nvad') f[k].forEach(w => { if (!idx.has(w)) idx.set(w, base); });
    if (!idx.has(base)) idx.set(base, base);
  });
  return { get: w => { const b = idx.get(w); return b ? m.get(b) : null; }, size: m.size };
})();
async function fetchJSON(url, ms = 9000) {
  const ac = window.AbortController ? new AbortController() : null, t = ac && setTimeout(() => ac.abort(), ms);
  try { const r = await fetch(url, { signal: ac ? ac.signal : undefined }); if (!r.ok) { const e = new Error('http'); e.status = r.status; throw e; } return await r.json(); }
  finally { clearTimeout(t); }
}
/* online search for words the built-in list doesn't have (Datamuse word list) */
async function familyOnline(word) {
  const strip = w => w.replace(/(isation|ization|ation|ition|tion|sion|ment|ness|ity|ance|ence|ive|ful|less|able|ible|ous|ally|al|ly|er|or|ist|ism|ize|ise|ing|ed|es|s)$/, '');
  let root = strip(word); if (root.length < 3) root = word;
  root = root.replace(/[aeiouy]+$/, ''); if (root.length < 3) root = word.slice(0, 3);
  const pre = ['', 'un', 'in', 'im', 'dis', 're'];
  const lists = await Promise.all(pre.map(p => fetchJSON(`https://api.datamuse.com/words?sp=${encodeURIComponent(p + root)}*&md=pf&max=150`).catch(() => [])));
  const OK = /^(e|y|es|ed|ing|s|ion|ions|ive|ively|iveness|ivity|ity|or|ors|er|ers|ee|ment|al|ally|ness|ful|fully|less|lessly|ly|ily|iness|ance|ence|ant|ent|able|ably|ible|ibly|ize|ise|ization|isation|ist|ism|ic|ical|ically|ous|ously|ary|ory|ative|atively|ation|ate|ated|th|ship|hood|dom)?$/;
  const cand = new Map();
  lists.forEach((arr, i) => arr.forEach(x => {
    const w = String(x.word || '').toLowerCase(); if (!/^[a-z]+$/.test(w)) return;
    const rest = w.slice(pre[i].length + root.length); if (!w.startsWith(pre[i] + root) || !OK.test(rest)) return;
    const tags = x.tags || [], f = parseFloat((tags.find(t => /^f:/.test(t)) || 'f:0').slice(2));
    if (f < (pre[i] ? .4 : .15) && w !== word) return;
    cand.set(w, { w, f, tags: tags.filter(t => /^(n|v|adj|adv)$/.test(t)) });
  }));
  if (!cand.size) return null;
  const has = w => cand.has(w);
  const out = { base: word, n: [], v: [], a: [], d: [], online: true };
  [...cand.values()].sort((a, b) => b.f - a.f).forEach(({ w, tags }) => {
    if (/s$/.test(w) && (has(w.slice(0, -1)) || has(w.slice(0, -2)) || has(w.replace(/ies$/, 'y')))) return;
    if (/(ed|ing)$/.test(w) && tags[0] === 'v') return;
    let k = /ly$/.test(w) && tags.includes('adv') ? 'd' : /(ion|ment|ness|ity|ance|ence|ism|ship|hood|dom|th)$/.test(w) ? 'n' : /(er|or|ist|ee)$/.test(w) && tags.includes('n') ? 'n'
      : /(ive|ful|less|able|ible|ous|al|ic|ical|ary|ory|ant|ent|ed|ing|y)$/.test(w) && tags.includes('adj') ? 'a' : ({ n: 'n', v: 'v', adj: 'a', adv: 'd' })[tags[0]];
    if (!k) return;
    if (out[k].length < 6) out[k].push(w);
    if (w === word && tags[1] && tags[1] !== tags[0]) { const k2 = ({ n: 'n', v: 'v', adj: 'a', adv: 'd' })[tags[1]]; if (k2 && !out[k2].includes(w)) out[k2].push(w); }
  });
  if (!['n', 'v', 'a', 'd'].some(k => out[k].length)) return null;
  return out;
}
T.family = {
  title: 'Word family', icon: 'family', w: 680, h: 460, sh: 520, minW: 300, minH: 300,
  init: () => ({ word: 'create', fam: null, recent: [], edit: false }),
  mount(c) {
    const s = c.s, id = c.wd.id;
    const inp = h('input', { class: 'inp', id: 'wfw-' + id, value: s.fam ? s.fam.base : s.word, placeholder: 'Type a word, e.g. create', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false', 'aria-label': 'Word' });
    const status = h('p', { class: 'wf-msg' });
    const area = h('div', { class: 'wf-area' });
    async function look(w) {
      w = (w || '').trim().toLowerCase().replace(/[^a-z\-' ]/g, ''); if (!w) return;
      const local = WF.get(w);
      if (local) { show({ ...JSON.parse(JSON.stringify(local)), typed: w }); return; }
      if (!APP) { status.textContent = `“${w}” isn’t in the built-in list. Other words are found online in the installed app.`; return; }
      status.textContent = 'Looking for the family of “' + w + '”…'; area.replaceChildren();
      try { const f = await familyOnline(w); if (f) show({ ...f, typed: w }); else status.textContent = `I couldn’t find a family for “${w}”. Check the spelling, or add the words yourself.`; }
      catch (e) { status.textContent = 'No internet connection. The built-in words still work.'; }
    }
    function show(f) {
      s.fam = f; s.word = f.base; s.recent = [f.base, ...s.recent.filter(x => x !== f.base)].slice(0, 8); s.edit = false; save(); c.rerender();
    }
    const form = h('form', { class: 'wf-search', onsubmit: e => { e.preventDefault(); look(inp.value); } }, inp, h('button', { class: 'btn pri', type: 'submit' }, svg('search'), 'Show family'));
    const recent = s.recent.length > 1 ? h('div', { class: 'chips wf-recent' }, s.recent.slice(1).map(w => h('button', { class: 'chip', type: 'button', onclick: () => look(w) }, w))) : null;
    c.body.append(h('div', { class: 'wf' }, form, recent, status, area));
    if (!s.fam) { Promise.resolve().then(() => look(s.word)); return; }
    const f = s.fam;
    const fam = new Set([f.base, ...f.n, ...f.v, ...f.a, ...f.d]), neg = w => { const m = w.match(/^(un|in|im|ir|il|dis|mis)(.+)$/); return !!m && fam.has(m[2]); };
    const col = k => h('div', { class: 'wf-col', style: { '--pc': `var(${POS[k][2]})` } },
      h('div', { class: 'wf-pos' }, h('b', {}, POS[k][0]), h('span', { lang: 'ar', dir: 'rtl' }, POS[k][1])),
      h('div', { class: 'wf-words' }, f[k].length ? f[k].map(w => h('span', { class: 'wf-w' + (w === f.typed ? ' typed' : '') + (neg(w) ? ' neg' : ''), title: neg(w) ? 'Opposite meaning' : '' },
        h('button', { type: 'button', class: 'wf-say', onclick: () => speak(w, 'en-GB', .85), 'aria-label': 'Say ' + w }, w),
        s.edit ? h('button', { type: 'button', class: 'wf-x', 'aria-label': 'Remove ' + w, onclick: () => { f[k] = f[k].filter(x => x !== w); save(); c.rerender(); } }, '×') : null)) : h('span', { class: 'wf-none' }, '—'),
        s.edit ? h('form', { class: 'wf-add', onsubmit: e => { e.preventDefault(); const v = e.target.elements[0].value.trim().toLowerCase(); if (v && !f[k].includes(v)) { f[k].push(v); save(); c.rerender(); } } }, h('input', { class: 'inp', id: `wfa${k}-${id}`, placeholder: 'Add', 'aria-label': 'Add a ' + POS[k][0].toLowerCase(), maxlength: 30 })) : null));
    const root = h('div', { class: 'wf-root' }, h('button', { type: 'button', class: 'wf-base', onclick: () => speak(f.base, 'en-GB', .85), 'aria-label': 'Say ' + f.base }, f.base), h('small', {}, 'word family'));
    area.append(h('div', { class: 'wf-tree' }, root, h('div', { class: 'wf-cols' }, ['n', 'v', 'a', 'd'].map(col))),
      h('div', { class: 'wf-foot' },
        h('span', { class: 'wf-key' }, h('i', {}), 'opposite meaning'),
        f.online ? h('span', { class: 'note' }, 'Found online. Check it before teaching.') : null,
        h('span', { class: 'sp' }),
        btn(s.edit ? 'Done' : 'Edit words', () => { s.edit = !s.edit; save(); c.rerender(); }, 'btn sm' + (s.edit ? ' pri' : ''), s.edit ? 'check' : 'pen'),
        btn('Dictionary', () => addWidget('dict', { word: f.typed || f.base }), 'btn sm', 'search')));
  },
};

/* ---------- Mini dictionary: English + Arabic, sound, example, picture ---------- */
const DICT_CACHE = 'vb_dict_cache';
const hasArabic = t => /[\u0600-\u06FF]/.test(t || '');
async function translateAr(text) {
  const r = await fetchJSON(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`);
  const out = [], add = t => { t = String(t || '').trim(); if (t && hasArabic(t) && !/MYMEMORY|WARNING/i.test(t) && !out.includes(t)) out.push(t); };
  if (r && r.responseStatus == 200) add(r.responseData && r.responseData.translatedText);
  (r && r.matches || []).filter(m => String(m.segment || '').trim().toLowerCase() === text.toLowerCase()).sort((a, b) => (b.quality || 0) - (a.quality || 0)).forEach(m => add(m.translation));
  return out.slice(0, 3);
}
const PEOPLE = /\b(born|politician|singer|actor|actress|footballer|player|businessman|businesswoman|president|minister|king|queen|prince|princess|rapper|musician|band|album|film|movie|song|company|brand|surname|given name|family name|television|tv series|video game|novel|character|wrestler|journalist|author|artist)\b/i;
function clipFor(word) { for (const k in CLIP) if (CLIP[k][1].split('|').includes(word)) return k; return null; }
async function dictLookup(word) {
  const res = { word, phon: '', audio: {}, means: [], ar: [], ex: null, exAr: '', img: null, syn: [] };
  const [dict, ar] = await Promise.allSettled([fetchJSON('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word)), translateAr(word)]);
  if (dict.status === 'rejected' && dict.reason && dict.reason.status === 404) res.notFound = true;
  else if (dict.status === 'rejected') throw new Error('offline');
  if (ar.status === 'fulfilled') res.ar = ar.value;
  const entries = dict.status === 'fulfilled' && Array.isArray(dict.value) ? dict.value : [];
  const exs = [], syn = new Set();
  entries.forEach(e => {
    if (!res.phon && e.phonetic) res.phon = e.phonetic;
    (e.phonetics || []).forEach(p => { if (!res.phon && p.text) res.phon = p.text; if (p.audio) { if (/-uk\./.test(p.audio)) res.audio.uk = res.audio.uk || p.audio; else if (/-us\./.test(p.audio)) res.audio.us = res.audio.us || p.audio; else res.audio.any = res.audio.any || p.audio; } });
    (e.meanings || []).forEach(m => {
      let mm = res.means.find(x => x.pos === m.partOfSpeech); if (!mm) { mm = { pos: m.partOfSpeech, defs: [] }; res.means.push(mm); }
      (m.definitions || []).forEach(d => { if (mm.defs.length < 3 && d.definition) mm.defs.push(d.definition); if (d.example) exs.push(d.example); (d.synonyms || []).forEach(x => syn.add(x)); });
      (m.synonyms || []).forEach(x => syn.add(x));
    });
  });
  res.means = res.means.slice(0, 3);
  res.syn = [...syn].filter(x => /^[a-z\- ]+$/i.test(x) && x.toLowerCase() !== word).slice(0, 8);
  const stem = word.replace(/(e|y|ies|es|s)$/, '').slice(0, Math.max(3, word.length - 2));
  res.ex = exs.find(x => x.toLowerCase().includes(stem) && x.length < 170) || exs.find(x => x.length < 170) || null;
  if (!res.ex) {
    try {
      const w = await fetchJSON('https://en.wiktionary.org/api/rest_v1/page/definition/' + encodeURIComponent(word), 7000);
      const strip = t => String(t || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      for (const sec of (w.en || [])) for (const d of (sec.definitions || [])) for (const e of (d.examples || [])) { const t = strip(e); if (!res.ex && t.length > 12 && t.length < 150 && t.toLowerCase().includes(stem)) res.ex = t; }
    } catch (e) {}
  }
  if (res.ex) { try { res.exAr = (await translateAr(res.ex))[0] || ''; } catch (e) {} }
  const ck = clipFor(word);
  if (ck) res.img = { clip: ck };
  else if (!res.means.length || res.means[0].pos === 'noun') {
    try {
      const wp = await fetchJSON('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(word.charAt(0).toUpperCase() + word.slice(1)), 7000);
      if (wp && wp.type === 'standard' && wp.thumbnail && wp.thumbnail.source && !PEOPLE.test(wp.description || '') && !PEOPLE.test((wp.extract || '').slice(0, 160))) res.img = { src: wp.thumbnail.source, alt: wp.title };
    } catch (e) {}
  }
  return res;
}
function dictCache(word, val) {
  const c = ls.get(DICT_CACHE) || {};
  if (val === undefined) return c[word] || null;
  c[word] = Object.assign({ t: Date.now() }, val);
  const keys = Object.keys(c).sort((a, b) => c[b].t - c[a].t); keys.slice(80).forEach(k => delete c[k]);
  ls.set(DICT_CACHE, c);
}
function playWord(word, which, audio) {
  const src = which === 'uk' ? (audio.uk || null) : which === 'us' ? (audio.us || null) : (audio.uk || audio.us || audio.any);
  if (src) { const a = new Audio(src); a.play().catch(() => speak(word, which === 'us' ? 'en-US' : 'en-GB', .85)); return; }
  speak(word, which === 'us' ? 'en-US' : 'en-GB', .85);
}
T.dict = {
  title: 'Dictionary', icon: 'dict', w: 600, h: 540, sh: 600, minW: 300, minH: 320,
  init: () => ({ word: '', recent: [] }),
  mount(c) {
    const s = c.s, id = c.wd.id;
    const inp = h('input', { class: 'inp', id: 'dcw-' + id, value: s.word, placeholder: 'Type an English word', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'true', 'aria-label': 'Word' });
    const out = h('div', { class: 'dc-out' });
    async function look(w) {
      w = (w || '').trim().toLowerCase().replace(/[^a-z\-' ]/g, '').slice(0, 40); if (!w) return;
      inp.value = w; s.word = w; s.recent = [w, ...s.recent.filter(x => x !== w)].slice(0, 8); save();
      const cached = dictCache(w); if (cached) { render(cached); return; }
      if (!APP) { out.replaceChildren(h('div', { class: 'empty' }, h('p', {}, 'The dictionary looks words up online, so it works in the installed app on your website, not in this preview.'))); return; }
      out.replaceChildren(h('p', { class: 'dc-msg' }, 'Looking up “' + w + '”…'));
      try { const r = await dictLookup(w); if (s.word !== w) return; if (!r.notFound || r.ar.length) dictCache(w, r); render(r); }
      catch (e) { if (s.word === w) out.replaceChildren(h('div', { class: 'empty' }, h('p', {}, 'No internet connection. Words you looked up before still open without it.'))); }
    }
    function mark(text, w) {
      const stem = w.replace(/(e|y)$/, '');
      const re = new RegExp('(\\b' + stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-z]*)', 'i');
      const p = String(text).split(re);
      return p.map((x, i) => i % 2 ? h('mark', {}, x) : x);
    }
    function render(r) {
      if (r.notFound && !r.ar.length) { out.replaceChildren(h('div', { class: 'empty' }, h('p', {}, `I couldn’t find “${r.word}”. Check the spelling.`))); return; }
      const pic = r.img ? h('div', { class: 'dc-pic' }) : null;
      if (r.img && r.img.clip) pic.innerHTML = clipSvg(r.img.clip);
      else if (r.img) pic.append(h('img', { src: r.img.src, alt: r.img.alt || r.word, loading: 'lazy', referrerpolicy: 'no-referrer', onerror: e => e.target.parentNode.remove() }));
      const sayBtns = h('div', { class: 'dc-say' },
        btn('UK', () => playWord(r.word, 'uk', r.audio || {}), 'btn sm', 'vol'), btn('US', () => playWord(r.word, 'us', r.audio || {}), 'btn sm', 'vol'));
      out.replaceChildren(
        h('div', { class: 'dc-head' },
          h('div', { class: 'dc-hw' }, h('b', { class: 'dc-word' }, r.word), r.phon ? h('span', { class: 'dc-ipa' }, r.phon) : null, sayBtns,
            r.means.length ? h('div', { class: 'chips' }, r.means.map(m => h('span', { class: 'dc-pos' }, m.pos))) : null),
          pic),
        r.ar.length ? h('section', { class: 'dc-sec dc-ar' }, h('h4', {}, 'Arabic'), h('p', { lang: 'ar', dir: 'rtl' }, r.ar.join('، '))) : null,
        r.means.length ? h('section', { class: 'dc-sec' }, h('h4', {}, 'English meaning'), h('ol', {}, r.means.flatMap(m => m.defs.slice(0, m === r.means[0] ? 2 : 1).map(d => h('li', {}, h('em', {}, m.pos + ' '), d))))) : null,
        r.ex ? h('section', { class: 'dc-sec dc-ex' }, h('h4', {}, 'Example'), h('p', { class: 'en' }, ...mark(r.ex, r.word)), r.exAr ? h('p', { class: 'ar', lang: 'ar', dir: 'rtl' }, r.exAr) : null, ib('vol', 'Read the example aloud', () => speak(r.ex, 'en-GB', .85), 'btn sm ic')) : null,
        r.syn.length ? h('section', { class: 'dc-sec' }, h('h4', {}, 'Similar words'), h('div', { class: 'chips' }, r.syn.map(x => h('button', { class: 'chip', type: 'button', onclick: () => look(x) }, x)))) : null,
        h('div', { class: 'dc-foot' }, btn('Word family', () => addWidget('family', { word: r.word }), 'btn sm', 'list'), h('span', { class: 'sp' }), h('span', { class: 'note' }, 'From Wiktionary and MyMemory'))
      );
    }
    const form = h('form', { class: 'wf-search', onsubmit: e => { e.preventDefault(); look(inp.value); } }, inp, h('button', { class: 'btn pri', type: 'submit' }, svg('search'), 'Look up'));
    const recent = s.recent.length > 1 ? h('div', { class: 'chips wf-recent' }, s.recent.slice(1).map(w => h('button', { class: 'chip', type: 'button', onclick: () => look(w) }, w))) : null;
    c.body.append(h('div', { class: 'dc' }, form, recent, out));
    if (s.word) look(s.word); else out.append(h('div', { class: 'empty' }, h('p', {}, 'Type a word to see its meaning in English and Arabic, how to say it, an example and a picture.')));
  },
};
