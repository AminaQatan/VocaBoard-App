/* ---------- Save the board as a picture (PNG) or PDF ---------- */
/* The board is copied into an SVG <foreignObject> with the app's own styles, so the browser draws it exactly as on screen. */
const blobToData = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); });
async function urlToData(u) { if (!u || u.startsWith('data:')) return u; const r = await fetch(u); if (!r.ok) throw new Error('img'); return blobToData(await r.blob()); }
let _capFonts = null;
async function capFonts() {
  if (_capFonts !== null) return _capFonts;
  let css = '';
  for (const l of document.querySelectorAll('link[rel="stylesheet"]')) {
    try {
      const txt = await (await fetch(l.href)).text();
      const blocks = txt.split(/(?=\/\*)/).filter(b => /\/\*\s*(latin|arabic)\s*\*\//.test(b) || !/\/\*/.test(b));
      for (let b of blocks) {
        const urls = [...b.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]);
        for (const u of urls) { try { b = b.replace(u, await urlToData(u)); } catch (e) {} }
        css += b.replace(/\/\*[^*]*\*\//g, '');
      }
    } catch (e) {}
  }
  _capFonts = css; return css;
}
async function boardCanvas(withBg = true) {
  const W = app.clientWidth, H = app.clientHeight, scale = Math.min(2, 4000 / Math.max(W, H));
  const root = h('div', { class: 'cap-root' });
  const parts = withBg ? [bgEl, boardEl, stkEl] : [boardEl, stkEl];
  for (const el of parts) {
    const cl = el.cloneNode(true);
    // things a copy can't keep: drawings, typed text, videos and web pages
    const oc = el.querySelectorAll('canvas'), cc = cl.querySelectorAll('canvas');
    oc.forEach((cv, i) => { let src = ''; try { src = cv.toDataURL('image/png'); } catch (e) {} const r = cv.getBoundingClientRect(); const im = h('img', { class: cv.className, src, style: { width: r.width + 'px', height: r.height + 'px' } }); im.style.cssText = cv.style.cssText + `;width:${r.width}px;height:${r.height}px`; cc[i].replaceWith(im); });
    const oi = el.querySelectorAll('input, textarea, select'), ci = cl.querySelectorAll('input, textarea, select');
    oi.forEach((x, i) => { const y = ci[i]; if (!y) return; if (x.tagName === 'TEXTAREA') y.textContent = x.value; else if (x.tagName === 'SELECT') [...y.options].forEach((o, k) => { if (k === x.selectedIndex) o.setAttribute('selected', ''); else o.removeAttribute('selected'); }); else if (x.type === 'checkbox' || x.type === 'radio') { if (x.checked) y.setAttribute('checked', ''); else y.removeAttribute('checked'); } else y.setAttribute('value', x.value); });
    const ov = el.querySelectorAll('video'), cvd = cl.querySelectorAll('video');
    ov.forEach((v, i) => { let src = ''; try { const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0); src = c.toDataURL('image/jpeg', .9); } catch (e) {} const r = v.getBoundingClientRect(); cvd[i].replaceWith(src ? h('img', { src, style: { width: r.width + 'px', height: r.height + 'px', objectFit: 'cover' } }) : h('div', { class: 'cap-ph', style: { width: r.width + 'px', height: r.height + 'px' } }, 'Video')); });
    cl.querySelectorAll('iframe').forEach(f => { const o = el.querySelector(`iframe[src="${CSS.escape(f.getAttribute('src') || '')}"]`); const r = o ? o.getBoundingClientRect() : { width: 300, height: 200 }; f.replaceWith(h('div', { class: 'cap-ph', style: { width: r.width + 'px', height: r.height + 'px' } }, f.title || hostOf(f.src) || 'Website')); });
    cl.querySelectorAll('.confetti, .lv-btns').forEach(x => x.remove());
    for (const im of cl.querySelectorAll('img')) { const s = im.getAttribute('src'); if (s && !s.startsWith('data:')) { try { im.setAttribute('src', await urlToData(im.src)); } catch (e) { im.remove(); } } }
    for (const n of [cl, ...cl.querySelectorAll('[style*="url("]')]) { const st = n.getAttribute('style') || ''; const m = st.match(/url\("?(blob:[^")]+|https?:[^")]+)"?\)/); if (m) { try { n.setAttribute('style', st.replace(m[1], await urlToData(m[1]))); } catch (e) {} } }
    root.append(cl);
  }
  const css = [...document.querySelectorAll('style')].map(s => s.textContent).join('\n') + await capFonts() +
    `.cap-root{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${getComputedStyle(document.body).backgroundColor};color:var(--ink);font-family:var(--f-ui)}
     .cap-root *{animation:none!important;transition:none!important}
     .cap-root .wg-h .ib,.cap-root .wg-r{visibility:hidden}
     .cap-root .cap-ph{display:grid;place-items:center;background:var(--card-2);color:var(--ink-soft);font:600 1rem var(--f-ui);border-radius:.6rem}
     .cap-root .stk.sel{outline:none}`;
  const html = document.documentElement, rs = getComputedStyle(html);
  const xml = new XMLSerializer().serializeToString(root);
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(W * scale)}" height="${Math.round(H * scale)}" viewBox="0 0 ${W} ${H}"${html.dataset.theme ? ` data-theme="${html.dataset.theme}"` : ''}${html.classList.contains('soft') ? ' class="soft"' : ''} style="font-size:${rs.fontSize};--u:${rs.getPropertyValue('--u') || 1}"><style><![CDATA[${css.replace(/\]\]>/g, '] ]>')}]]></style><foreignObject x="0" y="0" width="${W}" height="${H}">${xml}</foreignObject></svg>`;
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('draw')); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr); });
  const cv = document.createElement('canvas'); cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
  const g = cv.getContext('2d'); g.fillStyle = getComputedStyle(document.body).backgroundColor || '#fff'; g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(img, 0, 0, cv.width, cv.height);
  return cv;
}
/* a one-page A4 PDF holding a JPEG picture */
function jpegPdf(bytes, iw, ih) {
  const land = iw >= ih, pw = land ? 841.89 : 595.28, ph = land ? 595.28 : 841.89, m = 18;
  const s = Math.min((pw - 2 * m) / iw, (ph - 2 * m) / ih), w = iw * s, hh = ih * s, x = (pw - w) / 2, y = (ph - hh) / 2;
  const enc = new TextEncoder(), parts = [], offs = []; let len = 0;
  const put = d => { const b = typeof d === 'string' ? enc.encode(d) : d; parts.push(b); len += b.length; };
  const obj = (n, body) => { offs[n] = len; put(`${n} 0 obj\n`); body(); put('\nendobj\n'); };
  const content = `q ${w.toFixed(2)} 0 0 ${hh.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im0 Do Q`;
  put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1, () => put('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2, () => put('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
  obj(3, () => put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`));
  obj(4, () => { put(`<< /Type /XObject /Subtype /Image /Width ${iw} /Height ${ih} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`); put(bytes); put('\nendstream'); });
  obj(5, () => put(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
  const xref = len;
  put(`xref\n0 6\n0000000000 65535 f \n${[1, 2, 3, 4, 5].map(n => String(offs[n]).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, { type: 'application/pdf' });
}
function capName(ext) { const b = board(); return `VocaBoard-${(b.name || 'Board').replace(/[^\w؀-ۿ -]+/g, '').trim().replace(/\s+/g, '-') || 'Board'}-${localDate()}.${ext}`; }
function saveBlob(blob, name) { const a = h('a', { href: URL.createObjectURL(blob), download: name }); document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 60000); }
async function exportBoard(kind, withBg) {
  closeSheet();
  await new Promise(r => setTimeout(r, 120));
  toast(kind === 'pdf' ? 'Making the PDF…' : 'Making the picture…');
  try {
    const cv = await boardCanvas(withBg);
    if (kind === 'png') {
      const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
      if (APP) { saveBlob(blob, capName('png')); toast('Saved ' + capName('png')); }
      else { const u = URL.createObjectURL(blob); sheet('Picture of the board', b => b.append(h('p', { class: 'note' }, 'Right-click or long-press the picture to save or copy it.'), h('img', { src: u, alt: 'Picture of the board', style: { width: '100%', borderRadius: '.6rem', border: '2px solid var(--edge)' } }))); }
    } else {
      const jpg = await new Promise(r => cv.toBlob(r, 'image/jpeg', .92));
      const pdf = jpegPdf(new Uint8Array(await jpg.arrayBuffer()), cv.width, cv.height);
      saveBlob(pdf, capName('pdf')); toast('Saved ' + capName('pdf'));
    }
  } catch (e) { console.error(e); toast('The board couldn’t be saved on this device. Try the picture option or a screenshot.'); }
}
function openExport() {
  let withBg = S.capBg !== false;
  sheet('Save the board', body => {
    body.append(
      h('p', { class: 'note' }, 'Saves everything on this board as it looks now: the background, tools, stickers, drawings and pictures. The tool bar is left out.'),
      h('div', { class: 'cap-opts' },
        h('button', { class: 'cap-opt', type: 'button', onclick: () => exportBoard('png', withBg) }, svg('image'), h('b', {}, 'Picture'), h('span', {}, 'PNG, to share or put in slides')),
        APP ? h('button', { class: 'cap-opt', type: 'button', onclick: () => exportBoard('pdf', withBg) }, svg('pdf'), h('b', {}, 'PDF'), h('span', {}, 'A4 page, ready to print')) : null),
      toggle('cap-bg', 'Include the background', withBg, v => { withBg = v; S.capBg = v; save(); }),
      APP ? null : h('p', { class: 'note' }, 'In this preview the picture opens here. PDF files can be saved from the installed app.'));
  });
}
