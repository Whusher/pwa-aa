const CACHE_NAME = 'react-pwa-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // API calls - Network First strategy
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open('api-cache').then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        })
    );
  }
  // Static assets - Cache First strategy
  else if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => response || fetch(request))
    );
  }
  // HTML pages - Stale While Revalidate strategy
  else if (request.destination === 'document') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
            return networkResponse;
          });
          return response || fetchPromise;
        })
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    // Get pending data from IndexedDB or localStorage
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_DATA' });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación disponible',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore', 
        title: 'Ver más',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close', 
        title: 'Cerrar',
        icon: '/pwa-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('React PWA', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});