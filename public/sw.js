const CACHE_NAME = 'react-pwa-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open('api-cache').then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request)
        })
    )
  } else if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => response || fetch(request))
    )
  } else if (request.destination === 'document') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse.clone())
            })
            return networkResponse
          })
          return response || fetchPromise
        })
    )
  }
})

// Push event - Mejorado para móviles
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)
  
  let notificationData = {
    title: '📱 React PWA',
    body: 'Nueva notificación disponible',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'default',
    renotify: true
  }

  // Intentar obtener datos del push
  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (e) {
      notificationData.body = event.data.text() || notificationData.body
    }
  }

  // Opciones específicas para móviles
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    renotify: notificationData.renotify,
    requireInteraction: true, // Importante para móviles - evita que se auto-cierren
    silent: false,
    vibrate: [100, 50, 100], // Patrón de vibración
    timestamp: Date.now(),
    actions: [
      {
        action: 'open',
        title: '📖 Abrir',
        icon: '/pwa-192x192.png'
      },
      {
        action: 'close',
        title: '❌ Cerrar',
        icon: '/pwa-192x192.png'
      }
    ],
    data: {
      url: notificationData.url || '/',
      timestamp: Date.now(),
      ...notificationData.data
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  )
})

// Notification click - Mejorado para móviles
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  const notificationData = event.notification.data || {}
  const urlToOpen = notificationData.url || '/'

  // Manejar acciones específicas
  if (event.action === 'close') {
    return // Solo cerrar la notificación
  }

  // Para acción 'open' o click directo en la notificación
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Buscar si ya hay una ventana/tab abierta
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url.includes(self.location.origin)) {
            // Si encontramos una ventana abierta, enfocarla y navegar
            client.focus()
            client.navigate(urlToOpen)
            return
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        return clients.openWindow(urlToOpen)
      })
      .catch((error) => {
        console.error('Error handling notification click:', error)
        // Fallback: intentar abrir ventana directamente
        return clients.openWindow(urlToOpen)
      })
  )
})

// Background sync para móviles
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag)
  
  if (event.tag === 'background-sync-notifications') {
    event.waitUntil(sendPendingNotifications())
  }
  
  if (event.tag === 'background-sync-data') {
    event.waitUntil(syncPendingData())
  }
})

// Funciones de utilidad
async function sendPendingNotifications() {
  try {
    // Obtener notificaciones pendientes del almacenamiento
    const pendingNotifications = await getPendingNotifications()
    
    for (const notification of pendingNotifications) {
      await self.registration.showNotification(notification.title, notification.options)
    }
    
    // Limpiar notificaciones pendientes
    await clearPendingNotifications()
  } catch (error) {
    console.error('Error sending pending notifications:', error)
  }
}

async function syncPendingData() {
  try {
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_DATA' })
    })
  } catch (error) {
    console.error('Error syncing data:', error)
  }
}

async function getPendingNotifications() {
  // Implementar según tu estrategia de almacenamiento
  // Por ejemplo, desde IndexedDB o cache
  return []
}

async function clearPendingNotifications() {
  // Implementar limpieza de notificaciones pendientes
}

// Manejo de mensajes desde la aplicación principal
self.addEventListener('message', (event) => {
  console.log('SW received message:', event.data)
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting()
        break
      
      case 'SHOW_NOTIFICATION':
        const { title, options } = event.data
        self.registration.showNotification(title, {
          ...options,
          requireInteraction: true,
          vibrate: [100, 50, 100]
        })
        break
      
      case 'GET_CLIENT_ID':
        event.ports[0].postMessage({ clientId: event.source.id })
        break
    }
  }
})

// Notificación cuando la app se actualiza
self.addEventListener('activate', (event) => {
  // Mostrar notificación de actualización disponible
  event.waitUntil(
    self.registration.showNotification('🚀 App actualizada', {
      body: 'Tu Progressive Web App se ha actualizado a la última versión',
      icon: '/pwa-192x192.png',
      tag: 'app-updated',
      requireInteraction: false,
      actions: [
        {
          action: 'reload',
          title: '🔄 Recargar',
          icon: '/pwa-192x192.png'
        }
      ]
    })
  )
})

// Manejar errores
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in SW:', event.reason)
})