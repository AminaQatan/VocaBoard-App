/* ---------- Content tools ---------- */
const FONTS = [['lexend', 'Clear', 'var(--f-ui)'], ['andika', 'Early reader', '"Andika","Tajawal",system-ui,sans-serif'], ['fredoka', 'Rounded', 'var(--f-display)'], ['caveat', 'Handwriting', '"Caveat","Tajawal",cursive']];
function cleanHtml(html) {
  const doc = new DOMParser().parseFromString('<div>' + String(html) + '</div>', 'text/html');
  const OK = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'DIV', 'P', 'SPAN', 'FONT', 'UL', 'OL', 'LI']);
  const walk = n => {
    [...n.children].forEach(el => {
      if (!OK.has(el.tagName)) { el.replaceWith(...el.childNodes); return walk(n); }
      const col = el.getAttribute('color') || el.style.color;
      [...el.attributes].forEach(a => el.removeAttribute(a.name));
      if (col && /^(#[0-9a-f]{3,8}|rgb\([\d,\s.]+\)|[a-z]+)$/i.test(col)) el.style.color = col;
      walk(el);
    });
  };
  const root = doc.body.firstChild; walk(root); return root.innerHTML;
}
function mediaEmpty(c, { icon, text, accept, onFile, url }) {
  const box = h('div', { class: 'empty' }, svg(icon, 'ico'), h('p', {}, text));
  const row = h('div', { class: 'row', style: { justifyContent: 'center' } });
  if (accept) row.append(filePick(accept, onFile, 'Choose a file', 'btn pri sm'));
  box.append(row);
  if (url) {
    const inp = h('input', { class: 'inp', id: 'u-' + c.wd.id, type: 'url', placeholder: url.ph, 'aria-label': url.label, inputmode: 'url' });
    const f = h('form', { class: 'row nw', style: { width: 'min(22rem,100%)' }, onsubmit: e => { e.preventDefault(); const v = inp.value.trim(); if (v) url.go(v); } }, inp, h('button', { class: 'btn sm', type: 'submit' }, 'Add'));
    box.append(f);
  }
  if (c.editing) box.append(btn('Cancel', () => c.edit(false), 'btn sm'));
  if (accept) {
    box.addEventListener('dragover', e => { e.preventDefault(); e.stopPropagation(); box.classList.add('drag'); });
    box.addEventListener('dragleave', () => box.classList.remove('drag'));
    box.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); box.classList.remove('drag'); const f = e.dataTransfer.files[0]; if (f) onFile(f); });
  }
  c.body.append(box);
}

T.image = {
  title: 'Image', icon: 'image', w: 420, h: 320, sh: 300, minW: 160, minH: 140, edit: true,
  init: () => ({ blob: null, src: '', fit: 'contain' }),
  blobs: s => [s.blob],
  mount(c) {
    const s = c.s;
    const setFile = async f => { if (!f.type.startsWith('image/')) { toast('Choose a picture file (JPG, PNG, GIF or WebP).'); return; } if (s.blob) Blobs.del(s.blob); s.blob = await Blobs.put(f); s.src = ''; save(); c.edit(false); };
    if (c.editing || (!s.blob && !s.src)) {
      if (c.editing && (s.blob || s.src)) {
        c.body.append(h('div', { class: 'form' },
          field('Fit', seg([['contain', 'Show all'], ['cover', 'Fill the box']], s.fit, v => { s.fit = v; save(); c.rerender(); })),
          h('div', { class: 'row' }, filePick('image/*', setFile, 'Replace picture')),
          btn('Done', () => c.edit(false), 'btn pri')));
        return;
      }
      mediaEmpty(c, { icon: 'image', text: 'Drop a picture here, paste one, or choose a file.', accept: 'image/*', onFile: setFile,
        url: APP ? { ph: 'or paste a picture link', label: 'Picture link', go: v => { s.src = normUrl(v); s.blob = null; save(); c.edit(false); } } : null });
      return;
    }
    const img = h('img', { alt: s._title || 'Board picture', style: { objectFit: s.fit }, draggable: 'false' });
    img.onerror = () => { c.body.replaceChildren(h('div', { class: 'empty' }, h('p', {}, 'This picture couldn’t be loaded.'), btn('Choose another', () => { s.blob = null; s.src = ''; save(); c.rerender(); }, 'btn sm'))); };
    if (s.blob) Blobs.url(s.blob).then(u => { if (u) img.src = u; else img.onerror(); }); else img.src = s.src;
    c.body.append(h('div', { class: 'imgw' }, img));
  },
};

T.pdf = {
  title: 'PDF', icon: 'pdf', w: 460, h: 520, sh: 520, minW: 220, minH: 220,
  init: () => ({ blob: null, name: '', page: 1 }),
  blobs: s => [s.blob],
  mount(c) {
    const s = c.s;
    const setFile = async f => { if (!(f.type === 'application/pdf' || /\.pdf$/i.test(f.name))) { toast('Choose a PDF file.'); return; } if (s.blob) Blobs.del(s.blob); s.blob = await Blobs.put(f); s.name = f.name; s.page = 1; save(); c.rerender(); };
    if (!s.blob) { mediaEmpty(c, { icon: 'pdf', text: 'Show a worksheet or slides. Drop a PDF here or choose one.', accept: 'application/pdf,.pdf', onFile: setFile }); return; }
    const pg = h('div', { class: 'pg' }, h('p', { class: 'note' }, 'Opening…'));
    const cv = h('canvas', {}); const lab = h('span', {}, '');
    const prev = ib('left', 'Previous page', () => go(-1), 'btn sm ic'), next = ib('right', 'Next page', () => go(1), 'btn sm ic');
    c.body.append(h('div', { class: 'pdfw' }, pg, h('div', { class: 'nav' }, prev, lab, next, filePick('application/pdf,.pdf', setFile, 'Open another', 'btn sm'))));
    let doc = null, task = null, alive = true, rT;
    const go = d => { if (!doc) return; s.page = clamp(s.page + d, 1, doc.numPages); save(); draw(); };
    async function draw() {
      if (!doc || !alive) return;
      lab.textContent = `${s.page} / ${doc.numPages}`; prev.disabled = s.page <= 1; next.disabled = s.page >= doc.numPages;
      const page = await doc.getPage(s.page), v1 = page.getViewport({ scale: 1 });
      const r = pg.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      const sc = Math.max(.1, Math.min((r.width - 12) / v1.width, (r.height - 12) / v1.height));
      const vp = page.getViewport({ scale: sc * dpr });
      cv.width = vp.width; cv.height = vp.height; cv.style.width = (vp.width / dpr) + 'px'; cv.style.height = (vp.height / dpr) + 'px';
      if (task) try { task.cancel(); } catch (e) {}
      task = page.render({ canvasContext: cv.getContext('2d'), viewport: vp });
      try { await task.promise; } catch (e) {}
      if (!cv.isConnected) pg.replaceChildren(cv);
    }
    (async () => {
      try {
        await loadScript(LIB.pdf); await loadScript(LIB.pdfw);
        const lib = window.pdfjsLib; lib.GlobalWorkerOptions.workerSrc = LIB.pdfw;
        const blob = await Blobs.get(s.blob); if (!blob) throw new Error('missing');
        doc = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
        if (!alive) return; s.page = clamp(s.page || 1, 1, doc.numPages); pg.replaceChildren(cv); draw();
      } catch (e) {
        if (!alive) return;
        pg.replaceChildren(h('div', { class: 'empty', style: { border: 0 } }, h('p', {}, e.message === 'missing' ? 'This PDF is no longer on this device. Choose it again.' : 'The PDF viewer needs an internet connection the first time. Connect and try again.'), filePick('application/pdf,.pdf', setFile, 'Choose PDF', 'btn sm')));
      }
    })();
    const kd = e => { if (!c.el.contains(document.activeElement) && document.activeElement !== document.body) return; if (e.key === 'ArrowRight' || e.key === 'PageDown') go(1); if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1); };
    c.on(c.el, 'keydown', kd);
    return { resize() { clearTimeout(rT); rT = setTimeout(draw, 150); }, destroy() { alive = false; try { doc && doc.destroy(); } catch (e) {} } };
  },
};

function ytId(u) {
  const m = String(u).match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/);
  return m ? m[1] : null;
}
function externalCard(c, title, url, msg) {
  c.body.append(h('div', { class: 'ext' }, h('b', {}, title), h('p', {}, msg), h('a', { class: 'btn pri', href: url, target: '_blank', rel: 'noopener noreferrer' }, svg('out'), 'Open in a new tab'), btn('Change', () => c.edit(true), 'btn sm')));
}
T.video = {
  title: 'Video', icon: 'video', w: 560, h: 360, sh: 280, minW: 240, minH: 180, edit: true,
  init: () => ({ yt: '', blob: null, name: '' }),
  blobs: s => [s.blob],
  mount(c) {
    const s = c.s;
    const setFile = async f => { if (!f.type.startsWith('video/')) { toast('Choose a video file (MP4 or WebM).'); return; } if (s.blob) Blobs.del(s.blob); s.blob = await Blobs.put(f); s.name = f.name; s.yt = ''; save(); c.edit(false); };
    if (c.editing || (!s.yt && !s.blob)) {
      mediaEmpty(c, { icon: 'video', text: 'Paste a YouTube link, or choose a video file from this device.', accept: 'video/*', onFile: setFile,
        url: { ph: 'youtube.com/watch?v=…', label: 'YouTube link', go: v => { const id = ytId(v); if (!id) { toast('That doesn’t look like a YouTube link.'); return; } if (s.blob) { Blobs.del(s.blob); s.blob = null; } s.yt = id; save(); c.edit(false); } } });
      return;
    }
    if (s.yt) {
      if (!APP) { externalCard(c, 'YouTube video', 'https://www.youtube.com/watch?v=' + s.yt, 'Videos play inside the board in the installed app. Here, open it in a new tab.'); return; }
      c.body.append(h('div', { class: 'media' }, h('iframe', { src: `https://www.youtube-nocookie.com/embed/${s.yt}?rel=0&modestbranding=1`, title: 'YouTube video', allow: 'autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin' })));
      return;
    }
    const v = h('video', { controls: true, playsinline: true, preload: 'metadata' });
    v.onerror = () => c.body.replaceChildren(h('div', { class: 'empty' }, h('p', {}, 'This video can’t play here. Try an MP4 file.'), btn('Choose another', () => c.edit(true), 'btn sm')));
    Blobs.url(s.blob).then(u => { if (u) v.src = u; else v.onerror(); });
    c.body.append(h('div', { class: 'media' }, v));
    return { destroy() { try { v.pause(); } catch (e) {} } };
  },
};

T.webcam = {
  title: 'Webcam', icon: 'webcam', w: 480, h: 380, sh: 320, minW: 220, minH: 180,
  init: () => ({ mirror: true, fit: 'contain', dev: '' }),
  mount(c) {
    const s = c.s, rt = c.rt();
    const start = async () => {
      try {
        rt.dispose && rt.dispose();
        const stream = await navigator.mediaDevices.getUserMedia({ video: s.dev ? { deviceId: { exact: s.dev }, width: { ideal: 1920 } } : { width: { ideal: 1920 } }, audio: false });
        rt.stream = stream; rt.dispose = () => stream.getTracks().forEach(t => t.stop());
        try { rt.cams = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput'); } catch (e) { rt.cams = []; }
        c.rerender();
      } catch (e) {
        msg.textContent = e && e.name === 'NotFoundError' ? 'No camera was found on this device.' : 'The camera is blocked. Allow camera access for this page in the browser settings, then try again.';
      }
    };
    const msg = h('p', {}, APP ? 'Show a book, a worksheet or a model on the big screen.' : 'Show a book or worksheet on the big screen. The camera works in the installed app; this browser version may block it.');
    if (!rt.stream) { c.body.append(h('div', { class: 'empty' }, svg('cam', 'ico'), msg, btn('Turn on camera', start, 'btn pri', 'cam'))); return; }
    const v = h('video', { autoplay: true, muted: true, playsinline: true, style: { objectFit: s.fit } }); v.srcObject = rt.stream;
    const wrap = h('div', { class: 'media' + (s.mirror ? ' mirror' : '') }, v);
    let frozen = false;
    const freeze = ib('pause', 'Freeze picture', () => { frozen = !frozen; frozen ? v.pause() : v.play(); freeze.replaceChildren(svg(frozen ? 'play' : 'pause')); }, 'ib');
    const snap = ib('cam', 'Take a photo onto the board', () => {
      const cv = document.createElement('canvas'); cv.width = v.videoWidth; cv.height = v.videoHeight; const g = cv.getContext('2d');
      if (s.mirror) { g.translate(cv.width, 0); g.scale(-1, 1); } g.drawImage(v, 0, 0);
      cv.toBlob(async b => { if (!b) return; const id = await Blobs.put(b); addWidget('image', { blob: id, _title: 'Snapshot' }); Snd.play('pop'); }, 'image/jpeg', .9);
    });
    const bar = h('div', { class: 'media-bar' },
      ib('flip', 'Mirror', () => { s.mirror = !s.mirror; save(); wrap.classList.toggle('mirror', s.mirror); }), freeze, snap,
      ib(s.fit === 'cover' ? 'min' : 'max', 'Fit or fill', () => { s.fit = s.fit === 'cover' ? 'contain' : 'cover'; save(); c.rerender(); }),
      (rt.cams || []).length > 1 ? ib('swap', 'Switch camera', () => { const i = rt.cams.findIndex(d => d.deviceId === s.dev); s.dev = rt.cams[(i + 1) % rt.cams.length].deviceId; save(); start(); }) : null,
      ib('stop', 'Turn off camera', () => { rt.dispose && rt.dispose(); delete rt.stream; c.rerender(); }));
    wrap.append(bar);
    c.body.append(wrap);
  },
};

function embedUrl(u) {
  const id = ytId(u); if (id) return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
  const g = u.match(/^(https:\/\/docs\.google\.com\/(?:presentation|document|spreadsheets|forms)\/d\/[\w-]+)/);
  if (g) return u.includes('/presentation/') ? g[1] + '/embed' : u.includes('/forms/') ? g[1] + '/viewform?embedded=true' : g[1] + '/preview';
  return u;
}
T.embed = {
  title: 'Website', icon: 'embed', w: 640, h: 440, sh: 440, minW: 260, minH: 200, edit: true,
  init: () => ({ url: '' }),
  mount(c) {
    const s = c.s;
    if (c.editing || !s.url) {
      const inp = h('input', { class: 'inp', id: 'em-' + c.wd.id, type: 'url', inputmode: 'url', value: s.url, placeholder: 'https://…' });
      c.body.append(h('form', { class: 'form', onsubmit: e => { e.preventDefault(); const v = normUrl(inp.value); if (!v) return; s.url = v; save(); c.edit(false); } },
        field('Website address', inp),
        h('p', { class: 'note' }, 'Works with Google Slides, Docs and Forms, YouTube, Wordwall, Padlet, PhET and many more. Some websites refuse to appear inside other pages. If the box stays blank, use the Link tool instead.'),
        h('div', { class: 'row' }, h('button', { class: 'btn pri', type: 'submit' }, 'Show website'), s.url ? btn('Cancel', () => c.edit(false), 'btn') : null)));
      return;
    }
    if (!APP) { externalCard(c, hostOf(s.url), s.url, 'Websites appear inside the board in the installed app. Here, open it in a new tab.'); return; }
    const fr = h('iframe', { src: embedUrl(s.url), title: hostOf(s.url), allow: 'autoplay; fullscreen; clipboard-write; encrypted-media; picture-in-picture', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin', loading: 'lazy' });
    const wrap = h('div', { class: 'media', style: { background: 'var(--card-2)' } }, fr,
      h('div', { class: 'media-bar' }, ib('refresh', 'Reload', () => { fr.src = embedUrl(s.url); }), h('a', { class: 'ib', href: s.url, target: '_blank', rel: 'noopener noreferrer', title: 'Open in a new tab', 'aria-label': 'Open in a new tab' }, svg('out'))));
    c.body.append(wrap);
  },
};

async function qrSvg(text) {
  await loadScript(LIB.qr);
  const q = window.qrcode(0, 'M');
  q.addData(unescape(encodeURIComponent(text)), 'Byte'); q.make();
  const n = q.getModuleCount(); let d = '';
  for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) if (q.isDark(r, col)) d += `M${col} ${r}h1v1h-1z`;
  return `<svg viewBox="-4 -4 ${n + 8} ${n + 8}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect x="-4" y="-4" width="${n + 8}" height="${n + 8}" fill="var(--qr-light)"/><path d="${d}" fill="var(--qr-dark)"/></svg>`;
}
function qrInto(el, text) {
  el.innerHTML = '';
  qrSvg(text).then(s => { el.innerHTML = s; }).catch(() => { el.replaceChildren(h('p', { class: 'note', style: { textAlign: 'center' } }, 'The QR maker needs an internet connection the first time.')); });
}
T.qr = {
  title: 'QR code', icon: 'qr', w: 300, h: 340, sh: 360, minW: 160, minH: 180, edit: true,
  init: () => ({ text: 'https://phet.colorado.edu', cap: '' }),
  mount(c) {
    const s = c.s;
    if (c.editing || !s.text) {
      c.body.append(h('form', { class: 'form', onsubmit: e => { e.preventDefault(); c.edit(false); } },
        field('Link or text', h('textarea', { class: 'inp', id: 'qrt-' + c.wd.id, rows: 3, value: s.text, oninput: e => { s.text = e.target.value.trim(); save(); } })),
        field('Caption under the code (optional)', h('input', { class: 'inp', id: 'qrc-' + c.wd.id, value: s.cap, maxlength: 60, oninput: e => { s.cap = e.target.value; save(); } })),
        h('button', { class: 'btn pri', type: 'submit' }, 'Done')));
      return;
    }
    const code = h('div', { class: 'code' });
    c.body.append(h('div', { class: 'qr' }, code, h('p', {}, s.cap || (isUrl(s.text) ? hostOf(normUrl(s.text)) : s.text))));
    qrInto(code, s.text);
  },
};

T.link = {
  title: 'Link', icon: 'link', w: 420, h: 220, sh: 220, minW: 200, minH: 140, edit: true,
  init: () => ({ url: 'https://phet.colorado.edu', label: 'PhET science simulations', qr: false }),
  mount(c) {
    const s = c.s;
    if (c.editing || !s.url) {
      c.body.append(h('form', { class: 'form', onsubmit: e => { e.preventDefault(); c.edit(false); } },
        field('Website address', h('input', { class: 'inp', id: 'lku-' + c.wd.id, type: 'url', inputmode: 'url', value: s.url, placeholder: 'https://…', oninput: e => { s.url = normUrl(e.target.value); save(); } })),
        field('Button text', h('input', { class: 'inp', id: 'lkl-' + c.wd.id, value: s.label, maxlength: 60, oninput: e => { s.label = e.target.value; save(); } })),
        toggle('lkq-' + c.wd.id, 'Show a QR code for tablets', s.qr, v => { s.qr = v; save(); }),
        h('button', { class: 'btn pri', type: 'submit' }, 'Done')));
      return;
    }
    const a = h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, h('b', {}, s.label || hostOf(s.url)), h('span', {}, svg('out'), hostOf(s.url)));
    const qrs = s.qr ? h('div', { class: 'qrs' }) : null;
    c.body.append(h('div', { class: 'lk', style: s.qr ? {} : { gridTemplateColumns: '1fr' } }, a, qrs));
    if (qrs) qrInto(qrs, s.url);
  },
};
