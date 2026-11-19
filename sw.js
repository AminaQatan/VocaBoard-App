/* VocaBoard service worker: keeps the app working offline */
const VERSION = 'vocaboard-1.9.3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png', './favicon.svg', './b01.webp', './b02.webp', './b03.webp', './b04.webp', './b05.webp', './b06.webp', './b07.webp', './b08.webp', './b09.webp', './b10.webp', './b11.webp', './b12.webp', './b13.webp', './b14.webp', './b15.webp', './b16.webp', './b17.webp', './b18.webp', './b19.webp', './b20.webp', './b21.webp', './b22.webp', './b23.webp', './b24.webp', './b25.webp', './b26.webp', './b27.webp', './b28.webp', './b29.webp', './b30.webp', './b31.webp', './b32.webp', './b33.webp', './b34.webp', './b35.webp', './b36.webp', './b37.webp', './b38.webp', './b39.webp', './b40.webp', './g01.webp', './g02.webp', './g03.webp', './g04.webp', './g05.webp', './g06.webp', './g07.webp', './g08.webp', './g09.webp', './g10.webp', './g11.webp', './g12.webp', './g13.webp', './g14.webp', './g15.webp', './g16.webp', './g17.webp', './g18.webp', './g19.webp', './g20.webp', './g21.webp', './g22.webp', './g23.webp', './g24.webp', './g25.webp', './g26.webp', './g27.webp', './g28.webp', './g29.webp', './g30.webp', './g31.webp', './g32.webp', './g33.webp', './g34.webp', './g35.webp', './g36.webp', './g37.webp', './g38.webp', './g39.webp', './g40.webp', './g41.webp', './g42.webp', './g43.webp', './g44.webp', './g45.webp'];
const REMOTE = [
  'https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Caveat:wght@500;700&family=Fredoka:wght@400..700&family=Lexend:wght@300..700&family=Tajawal:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&text=%E2%99%9A%E2%99%9B%E2%99%9C%E2%99%9D%E2%99%9E%E2%99%9F&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];
const CACHE_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com', 'upload.wikimedia.org']; // photos seen once still show offline

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
