/* VocaBoard service worker: keeps the app working offline */
const VERSION = 'vocaboard-1.4.0';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.svg', './avatars/b01.webp', './avatars/b02.webp', './avatars/b03.webp', './avatars/b04.webp', './avatars/b05.webp', './avatars/b06.webp', './avatars/b07.webp', './avatars/b08.webp', './avatars/b09.webp', './avatars/b10.webp', './avatars/b11.webp', './avatars/b12.webp', './avatars/b13.webp', './avatars/b14.webp', './avatars/b15.webp', './avatars/b16.webp', './avatars/b17.webp', './avatars/b18.webp', './avatars/b19.webp', './avatars/b20.webp', './avatars/b21.webp', './avatars/b22.webp', './avatars/b23.webp', './avatars/b24.webp', './avatars/b25.webp', './avatars/b26.webp', './avatars/b27.webp', './avatars/b28.webp', './avatars/b29.webp', './avatars/b30.webp', './avatars/b31.webp', './avatars/b32.webp', './avatars/b33.webp', './avatars/b34.webp', './avatars/b35.webp', './avatars/b36.webp', './avatars/b37.webp', './avatars/b38.webp', './avatars/b39.webp', './avatars/b40.webp', './avatars/g01.webp', './avatars/g02.webp', './avatars/g03.webp', './avatars/g04.webp', './avatars/g05.webp', './avatars/g06.webp', './avatars/g07.webp', './avatars/g08.webp', './avatars/g09.webp', './avatars/g10.webp', './avatars/g11.webp', './avatars/g12.webp', './avatars/g13.webp', './avatars/g14.webp', './avatars/g15.webp', './avatars/g16.webp', './avatars/g17.webp', './avatars/g18.webp', './avatars/g19.webp', './avatars/g20.webp', './avatars/g21.webp', './avatars/g22.webp', './avatars/g23.webp', './avatars/g24.webp', './avatars/g25.webp', './avatars/g26.webp', './avatars/g27.webp', './avatars/g28.webp', './avatars/g29.webp', './avatars/g30.webp', './avatars/g31.webp', './avatars/g32.webp', './avatars/g33.webp', './avatars/g34.webp', './avatars/g35.webp', './avatars/g36.webp', './avatars/g37.webp', './avatars/g38.webp', './avatars/g39.webp', './avatars/g40.webp', './avatars/g41.webp', './avatars/g42.webp', './avatars/g43.webp', './avatars/g44.webp', './avatars/g45.webp'];
const REMOTE = [
  'https://fonts.googleapis.com/css2?family=Andika:wght@400;700&family=Caveat:wght@500;700&family=Fredoka:wght@400..700&family=Lexend:wght@300..700&family=Tajawal:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols+2&text=%E2%99%9A%E2%99%9B%E2%99%9C%E2%99%9D%E2%99%9E%E2%99%9F&display=swap',
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
