// TradePOS Service Worker for Progressive Web App (PWA)
const CACHE_NAME = 'tradepos-v2';

const isLocalhost =
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1' ||
  self.location.hostname === '';

// On localhost development, never cache assets to prevent blank screens on hot reload
if (isLocalhost) {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    );
    self.clients.claim();
  });
} else {
  const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icons/icon.svg',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/terms',
    '/privacy'
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn('PWA Asset caching non-fatal error:', err);
        });
      })
    );
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
    );
    self.clients.claim();
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('/_next/webpack-hmr')) return;

    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
        })
    );
  });
}
