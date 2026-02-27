// Murabaha System — Service Worker
// Always fetches fresh from GAS, no offline caching of app data

const CACHE_NAME = 'murabaha-v1';

// Only cache the splash/loader assets
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install — cache static shell only
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
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

// Fetch — serve index.html from cache, everything else fresh from network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // For same-origin requests (index.html, manifest) — cache first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  // For GAS requests — always network (never cache user data)
  event.respondWith(fetch(event.request));
});
