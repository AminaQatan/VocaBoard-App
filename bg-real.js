/* ---------- Realistic backgrounds, painted on this device from noise (no downloads, works offline) ---------- */
const RBG = {
  rgreen: ['Green chalkboard', 'board', '#2e4b40'], rblack: ['Blackboard', 'board', '#25292c'], rwhite: ['Whiteboard', 'board', '#eef0f2'], rcork: ['Cork board', 'board', '#b98a55'],
  lake: ['Sunrise lake', 'nature', '#d98a86'], peaks: ['Snowy mountains', 'nature', '#6fa8dc'], hills: ['Green hills', 'nature', '#8cc4e8'], forest: ['Misty forest', 'nature', '#c9d6d2'],
  beach: ['Tropical beach', 'nature', '#7cc7ea'], dunes: ['Desert dunes', 'nature', '#e8a86a'], oasis: ['Palm oasis', 'nature', '#f0b46a'], night: ['Starry night', 'nature', '#0b1030'],
};
if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); };
/* noise */
function rbRng(seed) { let s = ((seed + 1) * 2654435761) | 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; }; }
function rbNoise(seed) {
  const r = rbRng(seed), p = new Uint8Array(512), q = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = q[i]; q[i] = q[j]; q[j] = t; }
  for (let i = 0; i < 512; i++) p[i] = q[i & 255];
  const gx = [1, -1, 1, -1, 1, -1, 0, 0], gy = [1, 1, -1, -1, 0, 0, 1, -1];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), X = xi & 255, Y = yi & 255; x -= xi; y -= yi;
    const u = x * x * x * (x * (x * 6 - 15) + 10), v = y * y * y * (y * (y * 6 - 15) + 10);
    const h00 = p[p[X] + Y] & 7, h10 = p[p[X + 1] + Y] & 7, h01 = p[p[X] + Y + 1] & 7, h11 = p[p[X + 1] + Y + 1] & 7;
    const n00 = gx[h00] * x + gy[h00] * y, n10 = gx[h10] * (x - 1) + gy[h10] * y, n01 = gx[h01] * x + gy[h01] * (y - 1), n11 = gx[h11] * (x - 1) + gy[h11] * (y - 1);
    const a = n00 + u * (n10 - n00), b = n01 + u * (n11 - n01);
    return a + v * (b - a);
  };
}
const rbFbm = (n, x, y, o = 5) => { let s = 0, a = 1, f = 1, t = 0; for (let i = 0; i < o; i++) { s += a * n(x * f, y * f); t += a; f *= 2.03; a *= .5; } return s / t; };
const rbSs = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const rbMix = (a, b, t) => a + (b - a) * t;
const rbCv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
function rbField(w, h, fn) {
  const c = rbCv(w, h), g = c.getContext('2d'), W = c.width, H = c.height, im = g.createImageData(W, H), d = im.data, o = [0, 0, 0, 255];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { o[3] = 255; fn(x / W, y / H, o, x, y); const i = (y * W + x) * 4; d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; d[i + 3] = o[3]; }
  g.putImageData(im, 0, 0); return c;
}
const rbLin = (g, x0, y0, x1, y1, st) => { const gr = g.createLinearGradient(x0, y0, x1, y1); st.forEach(s => gr.addColorStop(s[0], s[1])); return gr; };
const rbRad = (g, x, y, r0, r1, st) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); st.forEach(s => gr.addColorStop(s[0], s[1])); return gr; };
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
function rbGrain(g, W, H, amt, seed, mode = 'overlay') {
  const r = rbRng(seed), t = rbField(256, 256, (u, v, o) => { const k = 128 + (r() - .5) * 255; o[0] = o[1] = o[2] = k; });
  g.save(); g.globalAlpha = amt; g.globalCompositeOperation = mode; g.fillStyle = g.createPattern(t, 'repeat'); g.fillRect(0, 0, W, H); g.restore();
}
function rbVignette(g, W, H, a, cy = .48) { g.fillStyle = rbRad(g, W / 2, H * cy, Math.min(W, H) * .32, Math.hypot(W, H) * .62, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${a})`]]); g.fillRect(0, 0, W, H); }
/* a line of hills or mountains: heights in pixels for every `st` pixels */
function rbLine(W, H, o) {
  const n = rbNoise(o.seed), st = o.st || 2, ys = [];
  for (let x = 0; x <= W + st; x += st) {
    const u = x / W * (o.aspect || W / H) * .5625;
    let v = rbFbm(n, u * o.freq + 3.1, o.seed * .137, o.oct || 6);
    v = o.ridged ? Math.pow(Math.max(0, 1 - Math.abs(v) * 1.75), 1.5) : v * .9 + .5;
    ys.push(o.base * H - v * o.amp * H);
  }
  return ys;
}
function rbFill(g, ys, W, H, st, fill, sink = 0) { g.beginPath(); g.moveTo(-2, H + 2); ys.forEach((y, i) => g.lineTo(i * st, y + sink)); g.lineTo(W + 2, H + 2); g.closePath(); g.fillStyle = fill; g.fill(); }
function rbShadeFaces(g, ys, W, H, st, lit, dark, depth, seed = 1) {
  /* rock faces lit from the left: a ridged noise height map, stretched downwards like gullies */
  const n = rbNoise(seed + 101), asp = W / H;
  const c = rbField(W / 4, H / 4, (u, v, o) => {
    const y = v * H, i = Math.min(ys.length - 1, Math.round(u * W / st));
    if (y < ys[i] - 6) { o[3] = 0; return; }
    const fx = u * asp * 7, fy = v * 3.2, e = .06;
    const h0 = 1 - Math.abs(rbFbm(n, fx, fy, 5)), hx = 1 - Math.abs(rbFbm(n, fx + e, fy, 5));
    const sh = Math.max(-1, Math.min(1, -(hx - h0) / e * .55)), fall = Math.exp(-Math.max(0, y - ys[i]) / depth);
    const col = sh < 0 ? dark : lit; o[0] = col[0]; o[1] = col[1]; o[2] = col[2]; o[3] = Math.abs(sh) * (sh < 0 ? .8 : .45) * fall * 255;
  });
  g.save(); g.beginPath(); g.moveTo(-2, H + 2); ys.forEach((y, i) => g.lineTo(i * st, y)); g.lineTo(W + 2, H + 2); g.closePath(); g.clip();
  g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, W, H); g.restore();
}
const rbAt = (ys, x, st) => ys[Math.max(0, Math.min(ys.length - 1, Math.round(x / st)))];
function rbPine(g, x, y, h, r) {
  const w = h * (.26 + r() * .08), T = 6 + Math.floor(r() * 3), pts = [];
  for (let i = 1; i <= T; i++) { const t = i / T, yy = y - h + h * t * .92, ww = w * Math.pow(t, .9) * (.85 + r() * .3); pts.push([ww, yy], [ww * .38, yy - h * .02]); }
  g.moveTo(x, y - h); pts.forEach(p => g.lineTo(x + p[0], p[1])); g.lineTo(x + w * .08, y); g.lineTo(x - w * .08, y);
  for (let i = pts.length - 1; i >= 0; i--) g.lineTo(x - pts[i][0] * (.92 + r() * .16), pts[i][1]);
  g.closePath();
}
function rbForest(g, W, H, ys, st, o) {
  const r = rbRng(o.seed); g.beginPath();
  for (let x = -20; x < W + 20; x += o.gap * (.35 + r() * .9)) { const y = rbAt(ys, x, st) + o.sink * (.6 + r() * .8); rbPine(g, x, y, o.h * (.55 + r() * .9), r); }
  g.fillStyle = o.color; g.fill(); rbFill(g, ys, W, H, st, o.color, o.sink);
}
function rbClouds(g, W, H, o) {
  const n = rbNoise(o.seed), sc = o.res || 4, top = o.top * H, hh = (o.bottom - o.top) * H;
  const c = rbField(W / sc, hh / sc, (u, v, out) => {
    const x = u * o.sx, y = v * o.sy, d = rbFbm(n, x, y, 6) + o.cover, d2 = rbFbm(n, x, y + .045 * o.sy, 6) + o.cover;
    const a = rbSs(0, o.soft || .3, d) * rbSs(0, .18, v) * rbSs(1, .55, v);
    const lit = Math.min(1, Math.max(0, .55 + (d - d2) * 5));
    out[0] = rbMix(o.shade[0], o.color[0], lit); out[1] = rbMix(o.shade[1], o.color[1], lit); out[2] = rbMix(o.shade[2], o.color[2], lit); out[3] = a * 255 * (o.alpha || 1);
  });
  g.save(); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, top, W, hh); g.restore();
}
function rbSun(g, x, y, r, col, glow = 7, alpha = .85) {
  g.save(); g.globalCompositeOperation = 'screen';
  g.fillStyle = rbRad(g, x, y, 0, r * glow, [[0, rgba(col, alpha)], [.12, rgba(col, alpha * .55)], [.4, rgba(col, alpha * .18)], [1, rgba(col, 0)]]); g.fillRect(0, 0, g.canvas.width, g.canvas.height);
  g.fillStyle = rbRad(g, x, y, 0, r, [[0, 'rgba(255,255,250,1)'], [.7, 'rgba(255,250,235,1)'], [1, rgba(col, 0)]]); g.beginPath(); g.arc(x, y, r * 1.1, 0, 7); g.fill();
  g.restore();
}
function rbWater(g, W, H, hy, o) {
  const src = rbCv(W, hy); src.getContext('2d').drawImage(g.canvas, 0, 0);
  g.save(); g.beginPath(); g.rect(0, hy, W, H - hy); g.clip();
  g.translate(0, hy * 2); g.scale(1, -1); g.globalAlpha = o.refl; g.drawImage(src, 0, 0); g.restore();
  g.fillStyle = rbLin(g, 0, hy, 0, H, o.tint); g.fillRect(0, hy, W, H - hy);
  const r = rbRng(o.seed || 5), N = W * (H - hy) / 700;
  for (let i = 0; i < N; i++) {
    const t = Math.pow(r(), 1.5), y = hy + 1 + t * (H - hy), len = (8 + r() * 50) * (1 + t * 5), x = r() * W - len / 2;
    g.fillStyle = r() < .55 ? `rgba(255,255,255,${.04 + .07 * r()})` : `rgba(0,0,0,${.05 + .08 * r()})`; g.fillRect(x, y, len, Math.max(1, t * 3.2));
  }
  if (o.sunX != null) {
    for (let i = 0; i < N * .35; i++) {
      const t = Math.pow(r(), 1.3), y = hy + 1 + t * (H - hy), spread = W * (.02 + t * .1), x = o.sunX + (r() + r() + r() - 1.5) * spread, len = (4 + r() * 22) * (1 + t * 4);
      g.fillStyle = `rgba(${o.glit || '255,236,190'},${(.25 + r() * .55) * (1 - t * .6)})`; g.fillRect(x - len / 2, y, len, Math.max(1, t * 3));
    }
  }
  g.fillStyle = rbLin(g, 0, hy - 2, 0, hy + 6, [[0, 'rgba(255,255,255,0)'], [.5, `rgba(255,255,255,${o.line || .25})`], [1, 'rgba(255,255,255,0)']]); g.fillRect(0, hy - 2, W, 8);
}
function rbHaze(g, W, y0, y1, col, a) { const y2 = y1 + (y1 - y0) * .35; g.fillStyle = rbLin(g, 0, y0, 0, y2, [[0, rgba(col, 0)], [.74, rgba(col, a)], [1, rgba(col, 0)]]); g.fillRect(0, y0, W, y2 - y0); }
function rbPalm(g, x, y, h, lean, col, r) {
  const tx = x + lean * h, ty = y - h, cx = x + lean * h * .15, cy = y - h * .5, P = (t) => [(1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * tx, (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * ty];
  const wd = t => h * (.034 - .016 * t), L = [], R = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24, [px, py] = P(t), [qx, qy] = P(Math.min(1, t + .01)), a = Math.atan2(qy - py, qx - px) + Math.PI / 2, w = wd(t) * (1 + (i % 3 === 0 ? .12 : 0)); L.push([px + Math.cos(a) * w, py + Math.sin(a) * w]); R.unshift([px - Math.cos(a) * w, py - Math.sin(a) * w]); }
  g.fillStyle = col; g.beginPath(); [...L, ...R].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
  const fr = 10 + Math.floor(r() * 3);
  for (let k = 0; k < fr; k++) {
    const ang = -Math.PI / 2 + (k / (fr - 1) - .5) * Math.PI * 1.95 + (r() - .5) * .25, Lf = h * (.4 + r() * .18), droop = Lf * (.3 + Math.abs(Math.cos(ang)) * .55);
    const ex = tx + Math.cos(ang) * Lf, ey = ty + Math.sin(ang) * Lf * .5 + droop, mx = tx + Math.cos(ang) * Lf * .55, my = ty + Math.sin(ang) * Lf * .55 - Lf * .14;
    const F = t => [(1 - t) * (1 - t) * tx + 2 * (1 - t) * t * mx + t * t * ex, (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * my + t * t * ey];
    const up = [], dn = [], N = 70;
    for (let i = 0; i <= N; i++) {
      const t = i / N, [px, py] = F(t), [qx, qy] = F(Math.min(1, t + .01)), a = Math.atan2(qy - py, qx - px), nx = Math.cos(a + Math.PI / 2), ny = Math.sin(a + Math.PI / 2);
      const w = Lf * .15 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), .55) * (i % 2 ? .62 : 1) * (.9 + r() * .2);
      up.push([px - nx * w * .45, py - ny * w * .45 + w * .35]); dn.unshift([px + nx * w, py + ny * w + w * .55]);
    }
    g.fillStyle = col; g.beginPath(); g.moveTo(tx, ty); up.forEach(p => g.lineTo(p[0], p[1])); dn.forEach(p => g.lineTo(p[0], p[1])); g.closePath(); g.fill();
    g.strokeStyle = col; g.lineWidth = h * .008; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(mx, my, ex, ey); g.stroke();
  }
  g.beginPath(); g.arc(tx, ty, h * .03, 0, 7); g.fill();
}
function rbTree(g, x, y, s, dark, light, r) {
  g.fillStyle = '#4a3624'; g.fillRect(x - s * .06, y - s * .55, s * .12, s * .55);
  const blobs = []; for (let i = 0; i < 9; i++) blobs.push([x + (r() - .5) * s * .9, y - s * .75 - r() * s * .55, s * (.22 + r() * .2)]);
  g.fillStyle = dark; blobs.forEach(b => { g.beginPath(); g.arc(b[0], b[1], b[2], 0, 7); g.fill(); });
  g.fillStyle = light; blobs.forEach(b => { g.beginPath(); g.arc(b[0] - b[2] * .25, b[1] - b[2] * .3, b[2] * .62, 0, 7); g.fill(); });
}

/* ---------- boards ---------- */
function rbWoodTile(w, h, seed, light, dark) {
  const n = rbNoise(seed), n2 = rbNoise(seed + 3);
  return rbField(w, h, (u, v, o) => {
    const warp = rbFbm(n, u * 2.2, v * 1.4, 4) * 2.2, rings = Math.sin((v * 9 + warp * 1.6 + u * .6) * Math.PI * 2), fine = rbFbm(n2, u * 60, v * 3, 3);
    let t = .52 + rings * .16 + fine * .45; t = Math.min(1, Math.max(0, t));
    o[0] = rbMix(dark[0], light[0], t); o[1] = rbMix(dark[1], light[1], t); o[2] = rbMix(dark[2], light[2], t);
  });
}
function rbRot(tile) { const c = rbCv(tile.height, tile.width), g = c.getContext('2d'); g.translate(c.width, 0); g.rotate(Math.PI / 2); g.drawImage(tile, 0, 0); return c; }
function rbBrushTile(w, h, seed, base) { const n = rbNoise(seed), r = rbRng(seed); return rbField(w, h, (u, v, o) => { const k = base + rbFbm(n, u * 3, v * 90, 3) * 26 + (r() - .5) * 10; o[0] = o[1] = k; o[2] = k + 4; }); }
function rbFrame(g, W, H, F, tileH, opt = {}) {
  const tileV = rbRot(tileH), pH = g.createPattern(tileH, 'repeat'), pV = g.createPattern(tileV, 'repeat');
  const sides = [[[0, 0], [W, 0], [W - F, F], [F, F], pH, 'rgba(255,255,255,.16)'], [[0, H], [F, H - F], [W - F, H - F], [W, H], pH, 'rgba(0,0,0,.22)'], [[0, 0], [F, F], [F, H - F], [0, H], pV, 'rgba(255,255,255,.07)'], [[W, 0], [W, H], [W - F, H - F], [W - F, F], pV, 'rgba(0,0,0,.14)']];
  sides.forEach(([a, b, c, d, pat, shade]) => { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(...c); g.lineTo(...d); g.closePath(); g.fillStyle = pat; g.fill(); g.fillStyle = shade; g.fill(); });
  // rounded bevel: light outer edge, dark inner edge, shadow onto the surface
  g.lineWidth = Math.max(1, F * .08); g.strokeStyle = 'rgba(255,255,255,.28)'; g.strokeRect(F * .04, F * .04, W - F * .08, H - F * .08);
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = Math.max(1, F * .07); g.strokeRect(F, F, W - 2 * F, H - 2 * F);
  const s = F * (opt.shadow || .9);
  [[F, F, W - 2 * F, s, 0, F, 0, F + s], [F, H - F - s, W - 2 * F, s, 0, H - F, 0, H - F - s], [F, F, s, H - 2 * F, F, 0, F + s, 0], [W - F - s, F, s, H - 2 * F, W - F, 0, W - F - s, 0]].forEach(([x, y, w, hh, x0, y0, x1, y1]) => { g.fillStyle = rbLin(g, x0, y0, x1, y1, [[0, `rgba(0,0,0,${opt.shadowA || .35})`], [1, 'rgba(0,0,0,0)']]); g.fillRect(x, y, w, hh); });
}
function rbChalkSurface(g, W, H, F, base, seed) {
  const sx = F, sy = F, sw = W - 2 * F, sh = H - 2 * F, n = rbNoise(seed), r = rbRng(seed);
  g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
  g.drawImage(rbField(sw / 6, sh / 6, (u, v, o) => { const d = rbFbm(n, u * 5, v * 5 * sh / sw, 5) * 22 + rbFbm(n, u * 22, v * 22 * sh / sw, 3) * 8; o[0] = base[0] + d; o[1] = base[1] + d; o[2] = base[2] + d; }), sx, sy, sw, sh);
  // eraser swipes and chalk dust, drawn small then enlarged so they stay soft
  const sm = rbCv(sw / 8, sh / 8), s2 = sm.getContext('2d'); s2.lineCap = 'round';
  for (let i = 0; i < 9; i++) {
    const x0 = r() * sm.width, y0 = r() * sm.height, len = sm.width * (.2 + r() * .45), ang = (r() - .5) * .5;
    s2.strokeStyle = `rgba(255,255,255,${(.025 + r() * .04) * (base[0] < 40 ? .75 : 1)})`; s2.lineWidth = sm.height * (.05 + r() * .09);
    s2.beginPath(); s2.moveTo(x0, y0); s2.bezierCurveTo(x0 + len * .3, y0 + Math.sin(ang) * len - sm.height * .05, x0 + len * .7, y0 + Math.sin(ang) * len + sm.height * .05, x0 + len, y0 + Math.sin(ang) * len); s2.stroke();
  }
  for (let i = 0; i < 5; i++) { const x = r() * sm.width, y = r() * sm.height, rr = sm.width * (.06 + r() * .1); s2.fillStyle = rbRad(s2, x, y, 0, rr, [[0, `rgba(255,255,255,${.05 + r() * .05})`], [1, 'rgba(255,255,255,0)']]); s2.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  g.save(); g.imageSmoothingQuality = 'high'; g.drawImage(sm, sx, sy, sw, sh); g.restore();
  // faint words that were rubbed out
  g.lineCap = 'round'; g.lineJoin = 'round';
  for (let l = 0; l < 8; l++) {
    const y = sy + sh * (.1 + r() * .72), x0 = sx + sw * (.04 + r() * .45), len = sw * (.12 + r() * .35), amp = sh * (.008 + r() * .008);
    g.strokeStyle = `rgba(255,255,255,${.02 + r() * .025})`; g.lineWidth = Math.max(1.1, sh * .003); g.beginPath();
    let pen = false;
    for (let t = 0; t < len; t += 1.5) {
      if (r() < .006) { pen = false; t += amp * 3; continue; }
      const k = t / amp, fq = .9 + .5 * Math.sin(k * .07 + l), px = x0 + t + Math.sin(k * fq) * amp * .7, py = y - Math.cos(k * fq) * amp * (.5 + .5 * Math.abs(Math.sin(k * .11 + l))) - (Math.sin(k * .23 + l) > .8 ? amp * 1.4 * Math.sin(k * fq * .5) : 0);
      pen ? g.lineTo(px, py) : g.moveTo(px, py); pen = true;
    }
    g.stroke();
  }
  // chalk grain specks
  const gt = rbField(256, 256, (u, v, o) => { o[0] = o[1] = o[2] = 255; o[3] = r() < .2 ? r() * 20 : 0; });
  g.fillStyle = g.createPattern(gt, 'repeat'); g.fillRect(sx, sy, sw, sh);
  // dust settled above the tray, light from the windows, darker corners
  g.fillStyle = rbLin(g, 0, sy + sh, 0, sy + sh * .86, [[0, 'rgba(255,255,255,.1)'], [1, 'rgba(255,255,255,0)']]); g.fillRect(sx, sy + sh * .86, sw, sh * .14);
  g.fillStyle = rbRad(g, sx + sw * .3, sy + sh * .25, 0, sw * .6, [[0, 'rgba(255,255,255,.07)'], [1, 'rgba(255,255,255,0)']]); g.fillRect(sx, sy, sw, sh);
  rbVignette(g, W, H, .28);
  g.restore();
}
function rbTray(g, W, H, F, pat, kind) {
  const th = F * 1.45, x0 = F * .35, x1 = W - F * .35, top = H - th, lip = th * .4;
  g.fillStyle = rbLin(g, 0, top - F * .7, 0, top, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.32)']]); g.fillRect(F, top - F * .7, W - 2 * F, F * .7);
  g.fillStyle = pat; g.fillRect(x0, top, x1 - x0, th);
  g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x0, top, x1 - x0, lip);
  g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(x0, top + lip, x1 - x0, th - lip);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x0, top, x1 - x0, Math.max(1, F * .05));
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x0, top + lip - Math.max(1, F * .04), x1 - x0, Math.max(1, F * .04));
  const stick = (x, len, d, c1, c2, cap) => { const y = top + lip * .5 - d * .55; g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(x + len / 2, top + lip * .78, len / 2, d * .22, 0, 0, 7); g.fill(); g.fillStyle = rbLin(g, 0, y, 0, y + d, [[0, c1], [1, c2]]); g.beginPath(); g.roundRect(x, y, len, d, d / 2); g.fill(); if (cap) { g.fillStyle = rbLin(g, 0, y, 0, y + d, [[0, cap[0]], [1, cap[1]]]); g.beginPath(); g.roundRect(x + len * .72, y - d * .06, len * .28, d * 1.12, d / 2); g.fill(); } };
  if (kind === 'chalk') {
    const ex = Math.max(W * .55, x1 - F * 6.5), ew = F * 3.4, eh = F * .95, ey = top + lip * .55 - eh, cx = ex - F * 7.2;
    if (cx > W * .3) { stick(cx, F * 2.1, F * .34, '#ffffff', '#d9d9d4'); stick(cx + F * 2.5, F * 1.4, F * .34, '#fff3a6', '#d8c45f'); stick(cx + F * 4.2, F * 1.7, F * .34, '#ffd0de', '#d796ab'); }
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(ex + ew / 2, top + lip * .8, ew / 2, eh * .18, 0, 0, 7); g.fill();
    g.fillStyle = rbLin(g, 0, ey, 0, ey + eh * .55, [[0, '#c99a62'], [1, '#8d6438']]); g.beginPath(); g.roundRect(ex, ey, ew, eh * .58, eh * .12); g.fill();
    g.fillStyle = rbLin(g, 0, ey + eh * .55, 0, ey + eh, [[0, '#59544f'], [1, '#3b3733']]); g.fillRect(ex + ew * .02, ey + eh * .55, ew * .96, eh * .45);
    const r = rbRng(9); for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${.2 + r() * .4})`; g.fillRect(ex + r() * ew, ey + eh * .58 + r() * eh * .4, 1.2, 1.2); }
  } else {
    const ex = Math.max(W * .55, x1 - F * 6), ew = F * 3, eh = F * .85, ey = top + lip * .55 - eh, mx = ex - F * 11.4;
    if (mx > W * .25) { stick(mx, F * 3.1, F * .5, '#fbfbfb', '#bfc3c6', ['#2a2d31', '#0e0f11']); stick(mx + F * 3.6, F * 3.1, F * .5, '#fbfbfb', '#bfc3c6', ['#2f6fd6', '#1a47a0']); stick(mx + F * 7.2, F * 3.1, F * .5, '#fbfbfb', '#bfc3c6', ['#e24a4a', '#a52626']); }
    g.fillStyle = rbLin(g, 0, ey, 0, ey + eh, [[0, '#3a3d42'], [.6, '#22252a'], [1, '#111']]); g.beginPath(); g.roundRect(ex, ey, ew, eh, eh * .25); g.fill();
    g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(ex + ew * .1, ey + eh * .15, ew * .8, eh * .1);
  }
}
function rbBoard(g, W, H, kind) {
  const F = Math.max(6, Math.round(Math.min(W, H) * .03)), r = rbRng(3);
  if (kind === 'rgreen' || kind === 'rblack' || kind === 'rcork') {
    const wood = kind === 'rcork' ? rbWoodTile(700, 90, 21, [196, 150, 98], [120, 80, 44]) : rbWoodTile(700, 90, 11, [176, 124, 74], [96, 60, 30]);
    if (kind === 'rcork') {
      const t = rbCv(420, 420), tg = t.getContext('2d'), n = rbNoise(4);
      tg.drawImage(rbField(420, 420, (u, v, o) => { const d = rbFbm(n, u * 6, v * 6, 4) * 30; o[0] = 186 + d; o[1] = 136 + d * .8; o[2] = 84 + d * .5; }), 0, 0);
      for (let i = 0; i < 5200; i++) { const x = r() * 420, y = r() * 420, s = .6 + r() * 2.4, k = r(); tg.fillStyle = k < .45 ? `rgba(110,66,28,${.35 + r() * .4})` : k < .8 ? `rgba(232,186,128,${.3 + r() * .4})` : `rgba(70,40,15,${.4 + r() * .4})`; for (const dx of [0, -420, 420]) for (const dy of [0, -420, 420]) { tg.beginPath(); tg.ellipse(x + dx, y + dy, s, s * (.6 + r() * .6), r() * 3, 0, 7); tg.fill(); } }
      g.fillStyle = g.createPattern(t, 'repeat'); g.fillRect(0, 0, W, H);
      g.save(); g.beginPath(); g.rect(F, F, W - 2 * F, H - 2 * F); g.clip(); rbVignette(g, W, H, .3); g.restore();
    } else rbChalkSurface(g, W, H, F, kind === 'rgreen' ? [44, 74, 62] : [34, 38, 40], kind === 'rgreen' ? 17 : 23);
    rbFrame(g, W, H, F, wood);
    if (kind !== 'rcork') rbTray(g, W, H, F, g.createPattern(wood, 'repeat'), 'chalk');
    rbGrain(g, W, H, .05, 7);
    return;
  }
  // whiteboard
  const sx = F, sy = F, sw = W - 2 * F, sh = H - 2 * F, n = rbNoise(31);
  g.fillStyle = rbLin(g, 0, sy, 0, sy + sh, [[0, '#fbfcfc'], [1, '#e9ecee']]); g.fillRect(0, 0, W, H);
  g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
  g.drawImage(rbField(sw / 8, sh / 8, (u, v, o) => { const d = rbFbm(n, u * 4, v * 4 * sh / sw, 5); o[0] = o[1] = o[2] = 120; o[3] = Math.max(0, d) * 26; }), sx, sy, sw, sh);
  g.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const x = sx + r() * sw * .85, y = sy + r() * sh * .85, len = sw * (.06 + r() * .2); g.strokeStyle = r() < .5 ? 'rgba(40,70,160,.035)' : 'rgba(30,30,30,.035)'; g.lineWidth = sh * (.006 + r() * .006); g.beginPath(); g.moveTo(x, y); for (let k = 1; k < 14; k++) g.lineTo(x + len * k / 13, y + Math.sin(k * 1.3 + i) * sh * .012); g.stroke(); }
  [[.12, .3, .55], [.5, .62, .35], [.78, .85, .28]].forEach(([a, b, al]) => { g.fillStyle = rbLin(g, sx + sw * a, sy, sx + sw * b, sy + sh, [[0, 'rgba(255,255,255,0)'], [.5, `rgba(255,255,255,${al})`], [1, 'rgba(255,255,255,0)']]); g.fillRect(sx, sy, sw, sh); });
  g.fillStyle = rbRad(g, sx + sw * .65, sy + sh * .2, 0, sw * .5, [[0, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]); g.fillRect(sx, sy, sw, sh);
  rbVignette(g, W, H, .12);
  g.restore();
  const alu = rbBrushTile(700, 60, 5, 196);
  rbFrame(g, W, H, F, alu, { shadow: .5, shadowA: .18 });
  const cs = F * 1.35; [[0, 0], [W - cs, 0], [0, H - cs], [W - cs, H - cs]].forEach(([x, y]) => { g.fillStyle = rbLin(g, x, y, x + cs, y + cs, [[0, '#6b6f75'], [1, '#2e3135']]); g.beginPath(); g.roundRect(x + F * .05, y + F * .05, cs - F * .1, cs - F * .1, cs * .28); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.roundRect(x + cs * .18, y + cs * .14, cs * .5, cs * .14, cs * .07); g.fill(); });
  rbTray(g, W, H, F, g.createPattern(alu, 'repeat'), 'marker');
  rbGrain(g, W, H, .03, 7);
}

/* ---------- nature scenes ---------- */
const RB_SCENE = {
  lake(g, W, H) {
    const hy = H * .62, st = 2;
    g.fillStyle = rbLin(g, 0, 0, 0, hy, [[0, '#1f2754'], [.32, '#5b4a86'], [.6, '#c86f8a'], [.84, '#f3a26d'], [1, '#fcd59c']]); g.fillRect(0, 0, W, hy);
    rbSun(g, W * .63, hy - H * .015, H * .028, [255, 214, 150], 9, .9);
    rbClouds(g, W, H, { top: .04, bottom: .5, seed: 11, sx: 2.6, sy: 11, cover: -.08, soft: .45, color: [255, 196, 170], shade: [118, 78, 128], alpha: .8 });
    const far = rbLine(W, H, { seed: 4, base: .6, amp: .24, freq: 2.2, ridged: true, st }); rbFill(g, far, W, H, st, rbLin(g, 0, H * .36, 0, hy, [[0, '#8f7aa8'], [1, '#b28ba6']])); rbShadeFaces(g, far, W, H, st, [255, 196, 170], [70, 50, 105], H * .2);
    rbHaze(g, W, H * .45, hy, [242, 170, 140], .45);
    const mid = rbLine(W, H, { seed: 9, base: .62, amp: .14, freq: 3.4, ridged: true, st }); rbFill(g, mid, W, H, st, rbLin(g, 0, H * .48, 0, hy, [[0, '#5a4a7a'], [1, '#7a5e86']])); rbShadeFaces(g, mid, W, H, st, [240, 170, 160], [40, 30, 70], H * .12);
    rbHaze(g, W, H * .54, hy, [240, 160, 140], .3);
    const near = rbLine(W, H, { seed: 2, base: .625, amp: .03, freq: 6, st }); rbForest(g, W, H, near, st, { seed: 3, gap: W * .007, h: H * .055, sink: H * .004, color: '#241d38' });
    rbWater(g, W, H, hy, { refl: .62, seed: 4, sunX: W * .63, tint: [[0, 'rgba(60,40,90,.2)'], [1, 'rgba(25,18,48,.65)']] });
    const sn = rbNoise(31), shore = []; for (let x = 0; x <= W + st; x += st) { const u = x / (W * .42); shore.push(u < 1 ? H - Math.pow(1 - u, 1.7) * H * .14 + rbFbm(sn, x / W * 14, 1, 4) * H * .015 : H + 4); }
    rbFill(g, shore, W, H, st, '#171226');
    rbGrain(g, W, H, .07, 2); rbVignette(g, W, H, .35);
  },
  peaks(g, W, H) {
    const st = 2;
    g.fillStyle = rbLin(g, 0, 0, 0, H * .7, [[0, '#164a8f'], [.55, '#4d8fd0'], [1, '#cfe5f6']]); g.fillRect(0, 0, W, H);
    rbClouds(g, W, H, { top: .04, bottom: .42, seed: 5, sx: 2.2, sy: 4, cover: -.2, soft: .35, color: [255, 255, 255], shade: [160, 182, 210] });
    const far = rbLine(W, H, { seed: 12, base: .64, amp: .44, freq: 1.7, ridged: true, st, oct: 7 });
    rbFill(g, far, W, H, st, rbLin(g, 0, H * .2, 0, H * .64, [[0, '#6f7f99'], [1, '#8fa2bd']])); rbShadeFaces(g, far, W, H, st, [235, 240, 250], [40, 52, 78], H * .3);
    g.save(); g.beginPath(); g.moveTo(-2, H); far.forEach((y, i) => g.lineTo(i * st, y)); g.lineTo(W + 2, H); g.closePath(); g.clip();
    const n = rbNoise(14), snow = new Path2D(); snow.moveTo(-2, far[0]); far.forEach((y, i) => snow.lineTo(i * st, y - 1));
    for (let i = far.length - 1; i >= 0; i--) { const x = i * st, line = H * .36 + rbFbm(n, x / W * 9, 2, 5) * H * .1, dep = H * .05 + Math.max(0, rbFbm(n, x / W * 25, 7, 4)) * H * .09; snow.lineTo(x, Math.max(far[i], Math.min(far[i] + dep + (line - far[i]) * .35, line))); }
    snow.closePath(); g.clip(snow);
    g.fillStyle = rbLin(g, 0, H * .15, 0, H * .45, [[0, '#ffffff'], [1, '#e3ebf5']]); g.fillRect(0, 0, W, H);
    rbShadeFaces(g, far, W, H, st, [255, 255, 255], [105, 135, 180], H * .25);
    g.restore();
    rbHaze(g, W, H * .45, H * .66, [205, 225, 242], .55);
    const mid = rbLine(W, H, { seed: 22, base: .7, amp: .18, freq: 2.6, ridged: true, st }); rbFill(g, mid, W, H, st, rbLin(g, 0, H * .52, 0, H * .7, [[0, '#4d6584'], [1, '#5f7894']])); rbShadeFaces(g, mid, W, H, st, [200, 215, 235], [30, 42, 62], H * .14);
    rbHaze(g, W, H * .6, H * .74, [200, 220, 236], .45);
    const fr = rbLine(W, H, { seed: 3, base: .77, amp: .05, freq: 4, st }); rbForest(g, W, H, fr, st, { seed: 8, gap: W * .006, h: H * .07, sink: H * .005, color: '#1f3a33' });
    const meadow = rbLine(W, H, { seed: 41, base: .86, amp: .05, freq: 1.4, st }); rbFill(g, meadow, W, H, st, rbLin(g, 0, H * .84, 0, H, [[0, '#7fae4f'], [1, '#3f6d2a']]));
    const gn = rbNoise(5); g.drawImage(rbField(W / 3, H * .2 / 3, (u, v, o) => { const d = rbFbm(gn, u * 40, v * 8, 4); o[0] = 30; o[1] = 70; o[2] = 20; o[3] = Math.max(0, d) * 120; }), 0, H * .8, W, H * .2);
    rbGrain(g, W, H, .06, 3); rbVignette(g, W, H, .25);
  },
  hills(g, W, H) {
    const st = 2, r = rbRng(6);
    g.fillStyle = rbLin(g, 0, 0, 0, H * .6, [[0, '#2f7fd0'], [.6, '#6fb2ea'], [1, '#d6eefb']]); g.fillRect(0, 0, W, H);
    rbSun(g, W * .82, H * .12, H * .03, [255, 250, 220], 8, .6);
    rbClouds(g, W, H, { top: .02, bottom: .5, seed: 3, sx: 2.8, sy: 3.2, cover: -.08, soft: .22, color: [255, 255, 255], shade: [176, 196, 222] });
    const L = [[.56, .1, 1.2, '#9cc77a', '#b9d9a0', 1], [.66, .1, 1.6, '#7fb35a', '#98c574', 2], [.78, .12, 1.3, '#5f9a3f', '#79b155', 3], [.94, .12, 1, '#4c8a31', '#3e7428', 4]];
    L.forEach(([b, a, f, c1, c2, s], k) => {
      const ys = rbLine(W, H, { seed: s * 7, base: b, amp: a, freq: f, st, oct: 4 });
      rbFill(g, ys, W, H, st, rbLin(g, 0, b * H - a * H, 0, H, [[0, c2], [1, c1]]));
      if (k === 1 || k === 2) for (let i = 0; i < (k === 1 ? 18 : 9); i++) { const x = r() * W, sc = H * (k === 1 ? .035 : .06) * (.7 + r() * .6); rbTree(g, x, rbAt(ys, x, st) + sc * .25, sc, k === 1 ? '#3d6e2c' : '#2f5e22', k === 1 ? '#5b8c3d' : '#4f8a35', r); }
      if (k < 3) rbHaze(g, W, b * H - a * H * .6, b * H + H * .03, [214, 236, 250], .25);
    });
    const gn = rbNoise(8); g.drawImage(rbField(W / 3, H * .25 / 3, (u, v, o) => { const d = rbFbm(gn, u * 50, v * 10, 4); o[0] = 25; o[1] = 60; o[2] = 15; o[3] = Math.max(0, d) * 110 * v; }), 0, H * .75, W, H * .25);
    for (let i = 0; i < 260; i++) { const x = r() * W, y = H * (.86 + r() * .14), s = 1.2 + r() * 2.2 * (y / H); g.fillStyle = ['#ffffff', '#fff27a', '#ffb3d1', '#ffffff'][i % 4]; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
    rbGrain(g, W, H, .05, 4); rbVignette(g, W, H, .2);
  },
  forest(g, W, H) {
    const st = 2;
    g.fillStyle = rbLin(g, 0, 0, 0, H, [[0, '#c9d8d6'], [.5, '#e9ece2'], [1, '#d7ddd2']]); g.fillRect(0, 0, W, H);
    rbSun(g, W * .7, H * .16, H * .03, [255, 246, 220], 10, .7);
    const cols = ['#a9bdb8', '#8ea79f', '#6f8f82', '#4f7262', '#365848', '#22402f'];
    cols.forEach((c, k) => {
      const base = .42 + k * .1, ys = rbLine(W, H, { seed: 50 + k, base, amp: .06, freq: 2 + k * .4, st, oct: 4 });
      rbForest(g, W, H, ys, st, { seed: 60 + k, gap: W * (.006 + k * .0015), h: H * (.07 + k * .035), sink: H * .01, color: c });
      if (k < cols.length - 1) rbHaze(g, W, base * H - H * .1, base * H + H * .04, [236, 240, 232], .55);
    });
    const rc = rbCv(W / 8, H / 8), rg = rc.getContext('2d'), rr = rbRng(2), sx = W * .7 / 8, sy = H * .16 / 8;
    for (let i = 0; i < 8; i++) { const x = (W * (.15 + rr() * .7)) / 8, w = W * (.01 + rr() * .03) / 8; rg.fillStyle = rbLin(rg, sx, sy, x, H / 8, [[0, 'rgba(255,248,220,.75)'], [1, 'rgba(255,248,220,0)']]); rg.beginPath(); rg.moveTo(sx - w * .1, sy); rg.lineTo(sx + w * .1, sy); rg.lineTo(x + w, H / 8); rg.lineTo(x - w, H / 8); rg.closePath(); rg.fill(); }
    g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .32; g.imageSmoothingQuality = 'high'; g.drawImage(rc, 0, 0, W, H); g.restore();
    rbGrain(g, W, H, .06, 6); rbVignette(g, W, H, .28);
  },
  beach(g, W, H) {
    const hy = H * .5, sh = H * .7, r = rbRng(3);
    g.fillStyle = rbLin(g, 0, 0, 0, hy, [[0, '#2b8ad6'], [.7, '#79c3f0'], [1, '#d8f0fb']]); g.fillRect(0, 0, W, hy);
    rbSun(g, W * .3, H * .1, H * .03, [255, 252, 230], 8, .55);
    rbClouds(g, W, H, { top: .05, bottom: .47, seed: 8, sx: 3, sy: 4, cover: -.18, soft: .25, color: [255, 255, 255], shade: [180, 205, 230] });
    g.fillStyle = rbLin(g, 0, hy, 0, sh, [[0, '#1d6fa8'], [.45, '#1c94b8'], [1, '#3fd0c7']]); g.fillRect(0, hy, W, sh - hy + H * .08);
    const sn = rbNoise(4);
    for (let i = 0; i < W * (sh - hy) / 260; i++) { const t = Math.pow(r(), 1.4), y = hy + t * (sh - hy), len = (6 + r() * 40) * (1 + t * 3); g.fillStyle = `rgba(255,255,255,${(.08 + r() * .14)})`; g.fillRect(r() * W, y, len, Math.max(1, t * 2.5)); }
    for (let i = 0; i < 260; i++) { const t = Math.pow(r(), 1.2), y = hy + t * (sh - hy) * .8, x = W * .3 + (r() + r() - 1) * W * (.03 + t * .12), len = (4 + r() * 16) * (1 + t * 3); g.fillStyle = `rgba(255,255,240,${.3 + r() * .5})`; g.fillRect(x, y, len, Math.max(1, t * 2)); }
    g.fillStyle = rbLin(g, 0, hy - 2, 0, hy + 5, [[0, 'rgba(255,255,255,0)'], [.5, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]); g.fillRect(0, hy - 2, W, 7);
    const shoreY = x => sh + Math.sin(x / W * 7) * H * .012 + rbFbm(sn, x / W * 6, 2, 3) * H * .03;
    g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 4) g.lineTo(x, shoreY(x)); g.lineTo(W, H); g.closePath();
    g.fillStyle = rbLin(g, 0, sh - H * .03, 0, H, [[0, '#cfb98d'], [.18, '#e6d2a6'], [1, '#f3e3bf']]); g.fill();
    g.save(); g.clip(); g.fillStyle = rbLin(g, 0, sh, 0, sh + H * .07, [[0, 'rgba(120,150,150,.35)'], [1, 'rgba(120,150,150,0)']]); g.fillRect(0, sh - H * .03, W, H * .12);
    const tn = rbNoise(9); g.drawImage(rbField(W / 2, (H - sh) / 2 + H * .05, (u, v, o) => { const d = rbFbm(tn, u * 70, v * 30, 3); o[0] = 150; o[1] = 120; o[2] = 80; o[3] = Math.abs(d) * 70; }), 0, sh - H * .03, W, H - sh + H * .05);
    g.restore();
    for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(255,255,255,${.75 - k * .2})`; g.lineWidth = H * (.006 - k * .0015); g.beginPath(); for (let x = 0; x <= W; x += 4) { const y = shoreY(x) - H * (.004 + k * .018) + Math.sin(x / 37 + k) * H * .003; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    rbGrain(g, W, H, .05, 8); rbVignette(g, W, H, .22);
  },
  dunes(g, W, H) {
    const r = rbRng(12);
    g.fillStyle = rbLin(g, 0, 0, 0, H * .62, [[0, '#6f5a9c'], [.45, '#d47e74'], [.8, '#f3a46a'], [1, '#fbd59a']]); g.fillRect(0, 0, W, H);
    rbSun(g, W * .22, H * .5, H * .035, [255, 214, 150], 9, .9);
    rbClouds(g, W, H, { top: .05, bottom: .4, seed: 21, sx: 2, sy: 12, cover: -.2, soft: .5, color: [255, 200, 170], shade: [150, 100, 140], alpha: .6 });
    const L = [[.6, .07, 1.4, [222, 150, 120], [190, 120, 110], .5], [.7, .11, 1.1, [236, 156, 96], [176, 98, 74], .3], [.83, .13, .9, [242, 164, 92], [164, 86, 58], .15], [1.0, .16, .7, [248, 176, 104], [150, 76, 46], 0]];
    L.forEach(([base, amp, f, lit, shade, haze], k) => {
      const n = rbNoise(70 + k), st = 2, ys = [], sl = [];
      for (let x = 0; x <= W + st; x += st) { const u = x / W * f * 2.2 + rbFbm(n, x / W * 1.5, k, 3) * .5 + k * .37, s = u - Math.floor(u), prof = s < .72 ? Math.pow(s / .72, 1.6) : Math.pow((1 - s) / .28, .9); ys.push(base * H - amp * H * (.35 + .65 * prof) - rbFbm(n, x / W * 3, 5, 3) * amp * H * .4); sl.push(s >= .72); }
      rbFill(g, ys, W, H, st, rbLin(g, 0, base * H - amp * H, 0, H, [[0, rgba(lit, 1)], [1, rgba(lit.map((c, j) => c * .8 + shade[j] * .2), 1)]]));
      g.save(); g.beginPath(); g.moveTo(-2, H + 2); ys.forEach((y, i) => g.lineTo(i * st, y)); g.lineTo(W + 2, H + 2); g.closePath(); g.clip();
      for (let i = 1; i < ys.length - 1; i++) {
        if (!(sl[i] && !sl[i - 1])) continue;
        let j = i; while (j < ys.length - 1 && sl[j]) j++;
        const x0 = (i - 1) * st, y0 = ys[i - 1], x1 = j * st, y1 = ys[j], dep = (x1 - x0) * .55 + (y1 - y0) * .4;
        g.fillStyle = rbLin(g, x0, y0, x0 + (x1 - x0) * .4, y0 + dep * 1.3, [[0, rgba(shade, .92)], [.6, rgba(shade, .7)], [1, rgba(shade, .25)]]);
        g.beginPath(); g.moveTo(x0, y0); for (let q = i; q <= j; q++) g.lineTo(q * st, ys[q]);
        for (let t = 1; t >= 0; t -= .05) g.lineTo(rbMix(x0, x1, t) - Math.sin(Math.PI * t) * (x1 - x0) * .25, rbMix(y0, y1, t) + Math.sin(Math.PI * t) * dep);
        g.closePath(); g.fill();
      }
      g.strokeStyle = rgba(lit.map(c => Math.min(255, c + 25)), .6); g.lineWidth = 1.5; g.beginPath(); ys.forEach((y, i) => i ? g.lineTo(i * st, y + .5) : g.moveTo(0, y + .5)); g.stroke();
      g.restore();
      const rip = rbNoise(80 + k); g.drawImage(rbField(W / 2, (H - (base - amp) * H) / 2, (u, v, o) => { const w = Math.sin((u * 140 * (1 + k * .3) + rbFbm(rip, u * 6, v * 4, 3) * 9 + v * 30) * Math.PI); o[0] = 120; o[1] = 60; o[2] = 30; o[3] = Math.max(0, w) * 22 * (k + 1) * .5; }), 0, (base - amp) * H, W, H - (base - amp) * H);
      if (haze) rbHaze(g, W, (base - amp - .05) * H, (base + .02) * H, [250, 200, 160], haze);
    });
    rbGrain(g, W, H, .07, 9); rbVignette(g, W, H, .3);
  },
  oasis(g, W, H) {
    const hy = H * .74, st = 2, r = rbRng(5);
    g.fillStyle = rbLin(g, 0, 0, 0, hy, [[0, '#5d4b8e'], [.4, '#c8708a'], [.75, '#f5a35e'], [1, '#fde0a0']]); g.fillRect(0, 0, W, hy);
    rbSun(g, W * .55, hy - H * .1, H * .055, [255, 210, 140], 7, .9);
    rbClouds(g, W, H, { top: .03, bottom: .45, seed: 33, sx: 2.4, sy: 10, cover: -.15, soft: .4, color: [255, 200, 160], shade: [140, 90, 130], alpha: .7 });
    const d1 = rbLine(W, H, { seed: 3, base: hy / H, amp: .07, freq: 1.4, st, oct: 3 }); rbFill(g, d1, W, H, st, rbLin(g, 0, hy - H * .07, 0, hy, [[0, '#d69a78'], [1, '#c68668']]));
    rbHaze(g, W, hy - H * .1, hy, [253, 200, 150], .35);
    rbWater(g, W, H, hy, { refl: .7, seed: 8, sunX: W * .55, glit: '255,220,160', tint: [[0, 'rgba(90,50,60,.1)'], [1, 'rgba(40,24,40,.55)']] });
    const bn = rbNoise(17), bank = []; for (let x = 0; x <= W + st; x += st) { const u = x / W, l = u < .34 ? Math.pow(1 - u / .34, 1.5) : 0, rr2 = u > .68 ? Math.pow((u - .68) / .32, 1.5) : 0; bank.push(H - Math.max(l, rr2) * H * .17 + rbFbm(bn, u * 14, 1, 4) * H * .012 - H * .005); }
    rbFill(g, bank, W, H, st, '#2a1c20');
    [[.06, 1.02, .62, .1], [.15, 1.0, .5, -.05], [.24, 1.04, .38, .12], [.86, 1.03, .58, -.12], [.95, 1.0, .46, .06], [.76, 1.05, .34, -.02]].forEach(([x, y, h, l]) => rbPalm(g, W * x, H * y, H * h, l, '#2a1c20', r));
    for (let i = 0; i < 160; i++) { const x = r() < .5 ? r() * W * .3 : W * .72 + r() * W * .28, y = H * (.9 + r() * .1), hh = H * (.01 + r() * .025); g.strokeStyle = '#2a1c20'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (r() - .5) * hh, y - hh * .6, x + (r() - .5) * hh * .8, y - hh); g.stroke(); }
    rbGrain(g, W, H, .07, 3); rbVignette(g, W, H, .3);
  },
  night(g, W, H) {
    const st = 2, r = rbRng(77);
    g.fillStyle = rbLin(g, 0, 0, 0, H, [[0, '#03051a'], [.55, '#0d1640'], [.82, '#24356c'], [1, '#3b4c80']]); g.fillRect(0, 0, W, H);
    const n = rbNoise(13), n2 = rbNoise(19);
    const mw = rbField(W / 4, H / 4, (u, v, o) => { const a = u * W / H, d = (v - (.95 - a * .42)) * Math.cos(.4), band = Math.exp(-d * d / .02) * (.55 + .45 * rbFbm(n, u * 6, v * 6, 6)), dust = rbSs(.05, .35, rbFbm(n2, u * 9, v * 9, 5)) * Math.exp(-d * d / .005); o[0] = 190 + band * 50; o[1] = 175 + band * 40; o[2] = 230; o[3] = Math.max(0, band * 120 - dust * 80); });
    g.save(); g.globalCompositeOperation = 'screen'; g.drawImage(mw, 0, 0, W, H); g.restore();
    for (let i = 0; i < W * H / 900; i++) { const x = r() * W, y = r() * H * .8, b = Math.pow(r(), 6), s = .5 + b * 1.6; g.fillStyle = `rgba(${220 + r() * 35},${225 + r() * 30},255,${.35 + b * .65})`; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); if (b > .7) { g.fillStyle = rbRad(g, x, y, 0, s * 6, [[0, 'rgba(200,215,255,.35)'], [1, 'rgba(200,215,255,0)']]); g.fillRect(x - s * 6, y - s * 6, s * 12, s * 12); } }
    const m = rbLine(W, H, { seed: 41, base: .86, amp: .2, freq: 2, ridged: true, st }); rbFill(g, m, W, H, st, '#0a0f22');
    g.strokeStyle = 'rgba(120,150,220,.25)'; g.lineWidth = 1.2; g.beginPath(); m.forEach((y, i) => i ? g.lineTo(i * st, y) : g.moveTo(0, y)); g.stroke();
    const f = rbLine(W, H, { seed: 7, base: .95, amp: .04, freq: 4, st }); rbForest(g, W, H, f, st, { seed: 9, gap: W * .008, h: H * .07, sink: H * .005, color: '#04060f' });
    rbGrain(g, W, H, .05, 4); rbVignette(g, W, H, .3);
  },
};

/* render a background (cached for this size), returns a JPEG data URL */
const _rbCache = new Map();
function rbRender(key, W, H) {
  const ck = key + ':' + W + 'x' + H;
  if (_rbCache.has(ck)) return _rbCache.get(ck);
  const c = rbCv(W, H), g = c.getContext('2d');
  try { RBG[key][1] === 'board' ? rbBoard(g, c.width, c.height, key) : RB_SCENE[key](g, c.width, c.height); }
  catch (e) { console.error(e); g.fillStyle = RBG[key][2]; g.fillRect(0, 0, c.width, c.height); }
  const url = c.toDataURL('image/jpeg', .9); _rbCache.set(ck, url); return url;
}
function rbSize() { const w = (app && app.clientWidth) || innerWidth, h = (app && app.clientHeight) || innerHeight, s = Math.min(2, 1920 / Math.max(w, h)); return [Math.round(w * s), Math.round(h * s)]; }
const rbIdle = f => setTimeout(f, 30);
