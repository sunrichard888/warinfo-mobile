// Simple Service Worker for WarInfo Mobile PWA
const CACHE_NAME = 'warinfo-mobile-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './conflict_data.json'
];

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn('Cache addAll failed:', err);
        });
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).catch(() => {
            // Return cached version if available
            return caches.match(event.request);
          });
        })
    );
  }
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});