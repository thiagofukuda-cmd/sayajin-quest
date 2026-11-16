// Sayajin Quest: sempre busca a versão mais nova na internet; sem internet, abre a última que guardou.
const CACHE = 'sayajin-quest-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;   // banco e outros sites: direto
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {}); }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('./') : undefined)).then((r) => r || Response.error()))
  );
});
