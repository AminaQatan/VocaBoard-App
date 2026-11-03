#!/usr/bin/env python3
"""Builds two outputs from src/:
  dist/app/      installable web app (index.html + manifest + service worker + icons)
  dist/preview/  single-file browser preview (published as an artifact)
"""
import json, os, shutil, re

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
DIST = os.path.join(ROOT, 'dist')
VERSION = '1.7.2'
LIVE_URL = 'https://script.google.com/macros/s/AKfycbyI7L6OEnJTLLKDpvioiIfXrVzsvhMgJERRqnRjDA7NBHSyLfNfi6XgMbsh1LHLeOthOw/exec'

def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()

css = read('styles.css')
js = '\n'.join(read(n) for n in ['icons.js', 'backgrounds.js', 'bg-real.js', 'tools.js', 'items.js', 'core.js', 'w-time.js', 'w-class.js', 'w-media.js', 'w-write.js', 'w-games.js', 'w-layout.js', 'w-attend.js', 'w-teach.js', 'w-lang.js', 'w-brain.js', 'live.js', 'capture.js', 'tv.js', 'main.js'])
js = "(function(){'use strict';\n" + js + "\n})();"
CHESS_FONT = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&text=%E2%99%9A%E2%99%9B%E2%99%9C%E2%99%9D%E2%99%9E%E2%99%9F&display=swap'
FONTS = 'https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Caveat:wght@500;700&family=Fredoka:wght@400..700&family=Lexend:wght@300..700&family=Tajawal:wght@400;500;700&display=swap'
fonts_links = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
               '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
               f'<link rel="stylesheet" href="{FONTS}">\n'
               f'<link rel="stylesheet" href="{CHESS_FONT}">')

# ---------- preview (artifact) ----------
os.makedirs(os.path.join(DIST, 'preview'), exist_ok=True)
preview = f"""<title>VocaBoard</title>
<meta name="description" content="Interactive classroom board with timers, name picker, sound meter, polls and more. Developed by Ms. Amina Qatan.">
{fonts_links}
<style>
{css}
</style>
<div id="vocaboard"></div>
<script>window.VB_MODE = 'preview';</script>
<script>
{js}
</script>
"""
with open(os.path.join(DIST, 'preview', 'chalkbox.html'), 'w', encoding='utf-8') as f:
    f.write(preview)

# ---------- installable app ----------
APPD = os.path.join(DIST, 'app')
if os.path.exists(APPD):
    shutil.rmtree(APPD)
os.makedirs(os.path.join(APPD, 'icons'))

index = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>VocaBoard</title>
<meta name="description" content="Interactive classroom board with timers, name picker, sound meter, polls and more. Works offline.">
<meta name="theme-color" content="#bfe6fb" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1b1a2a" media="(prefers-color-scheme: dark)">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="VocaBoard">
<meta name="author" content="Ms. Amina Qatan">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/favicon.svg" type="image/svg+xml">
<link rel="icon" href="icons/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
{fonts_links}
<style>
:root{{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}
[hidden]{{display:none!important}}
img{{max-width:100%}}
{css}
</style>
</head>
<body>
<div id="vocaboard"></div>
<noscript>VocaBoard needs JavaScript turned on.</noscript>
<script>window.VB_MODE = 'app';</script>
<!-- Optional: paste your Google Apps Script Web App URL between the quotes so every teacher using this link can run QR activities without setting anything up. -->
<script>window.VB_LIVE_URL = '{LIVE_URL}';</script>
<script>
{js}
</script>
</body>
</html>
"""
with open(os.path.join(APPD, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(index)

manifest = {
    "name": "VocaBoard",
    "short_name": "VocaBoard",
    "description": "Interactive classroom board: timers, attendance, name picker, games, drawing and more. Developed by Ms. Amina Qatan.",
    "id": "./",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "orientation": "any",
    "background_color": "#f6f6fb",
    "theme_color": "#f6f6fb",
    "categories": ["education", "productivity"],
    "lang": "en",
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": "icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        {"src": "icons/favicon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any"}
    ]
}
with open(os.path.join(APPD, 'manifest.webmanifest'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, indent=2)

AVS = sorted(os.listdir(os.path.join(ROOT, 'avatars')))
AVLIST = ', '.join("'./avatars/%s'" % a for a in AVS)
sw = """/* VocaBoard service worker: keeps the app working offline */
const VERSION = 'vocaboard-%s';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.svg', %s];
const REMOTE = [
  '%s',
  '%s',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];
const CACHE_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(CORE);
    await Promise.all(REMOTE.map(u => fetch(u).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) { const c = await caches.open(VERSION); c.put('./index.html', res.clone()); }
        return res;
      } catch (err) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }
  if (url.origin === location.origin || CACHE_HOSTS.includes(url.hostname)) {
    e.respondWith((async () => {
      const hit = await caches.match(req, { ignoreSearch: url.origin === location.origin });
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') { const c = await caches.open(VERSION); c.put(req, res.clone()); }
        return res;
      } catch (err) { return Response.error(); }
    })());
  }
});
""" % (VERSION, AVLIST, FONTS, CHESS_FONT)
with open(os.path.join(APPD, 'sw.js'), 'w', encoding='utf-8') as f:
    f.write(sw)

# favicon: logo with fixed colours
logo = re.search(r"const LOGO = `(.*?)`;", read('icons.js'), re.S).group(1)
fav = (logo.replace('aria-hidden="true" ', '')
           .replace('stroke="currentColor"', 'stroke="#25223d"')
           .replace('class="f-butter"', 'fill="#ffe07f"')
           .replace('class="f-pink"', 'fill="#ffa3c0"')
           .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))
with open(os.path.join(APPD, 'icons', 'favicon.svg'), 'w', encoding='utf-8') as f:
    f.write(fav)
with open(os.path.join(ROOT, 'icon-src.svg'), 'w', encoding='utf-8') as f:
    f.write(fav)

os.makedirs(os.path.join(APPD, 'avatars'), exist_ok=True)
for n in AVS:
    shutil.copy(os.path.join(ROOT, 'avatars', n), os.path.join(APPD, 'avatars', n))
os.makedirs(os.path.join(DIST, 'preview', 'avatars'), exist_ok=True)
for n in AVS:
    shutil.copy(os.path.join(ROOT, 'avatars', n), os.path.join(DIST, 'preview', 'avatars', n))
for n in os.listdir(os.path.join(ROOT, 'icons')):
    shutil.copy(os.path.join(ROOT, 'icons', n), os.path.join(APPD, 'icons', n))
shutil.copy(os.path.join(ROOT, 'HOW-TO-INSTALL.txt'), os.path.join(APPD, 'HOW-TO-INSTALL.txt'))
print('built', len(preview), 'bytes preview,', len(index), 'bytes app')
