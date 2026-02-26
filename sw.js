// Service Worker for WarInfo Mobile PWA
const CACHE_NAME = 'warinfo-mobile-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/leaflet.js',
  '/data/conflict_data.json'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if available
        if (response) {
          return response;
        }
        // Otherwise fetch from network
        return fetch(event.request).then(
          (networkResponse) => {
            // Cache successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return networkResponse;
          }
        );
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for conflict data updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'update-conflict-data') {
    event.waitUntil(updateConflictData());
  }
});

async function updateConflictData() {
  try {
    const response = await fetch('/api/conflict-data/latest');
    if (response.ok) {
      const data = await response.json();
      // Store in IndexedDB or update cache
      // Trigger notification if new high-risk conflicts detected
      checkForHighRiskConflicts(data);
    }
  } catch (error) {
    console.error('Failed to update conflict data:', error);
  }
}

function checkForHighRiskConflicts(data) {
  // Check for conflicts with intensity > 80
  const highRiskConflicts = data.conflicts.filter(conflict => 
    conflict.intensity_score > 80
  );
  
  if (highRiskConflicts.length > 0) {
    // Send push notification
    self.registration.showNotification('High Risk Conflict Alert', {
      body: `${highRiskConflicts.length} new high-risk conflicts detected`,
      icon: '/icons/alert-192x192.png',
      badge: '/icons/alert-72x72.png'
    });
  }
}