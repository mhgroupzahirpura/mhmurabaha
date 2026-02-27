// Murabaha System — Service Worker

const CACHE_NAME = 'murabaha-v2';

const STATIC_ASSETS = [
  '/mhmurabaha/',
  '/mhmurabaha/index.html',
  '/mhmurabaha/manifest.json',
  '/mhmurabaha/icon-192.png',
  '/mhmurabaha/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Use individual adds so one failure doesn't block all
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  event.respondWith(fetch(event.request));
});
