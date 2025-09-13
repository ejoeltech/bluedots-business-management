const CACHE_NAME = 'bluedots-v1'
const OFFLINE_URL = '/offline'

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/auth/signin',
  '/dashboard',
  '/customers',
  '/invoices',
  '/quotes',
  '/receipts',
  '/inventory',
  '/reminders',
  '/settings',
  '/manifest.json',
  // Add more static pages as needed
]

// API routes to cache (read-only operations)
const API_CACHE_PATTERNS = [
  /\/api\/dashboard\/stats/,
  /\/api\/customers/,
  /\/api\/products/,
  /\/api\/quotes/,
  /\/api\/invoices/,
  /\/api\/receipts/,
  /\/api\/reminders/,
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker installed successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('Service Worker activated successfully')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Serving from cache:', request.url)
          return cachedResponse
        }

        // For API requests, try network first, then cache
        if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
          return fetch(request)
            .then((response) => {
              // Only cache successful responses
              if (response.status === 200) {
                const responseClone = response.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone)
                  })
              }
              return response
            })
            .catch(() => {
              // If network fails, try to serve from cache
              return caches.match(request)
                .then((cachedResponse) => {
                  if (cachedResponse) {
                    return cachedResponse
                  }
                  // Return offline page for navigation requests
                  if (request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL)
                  }
                  // Return empty response for other requests
                  return new Response('Offline', { status: 503 })
                })
            })
        }

        // For page requests, try network first
        if (request.mode === 'navigate') {
          return fetch(request)
            .catch(() => {
              // If network fails, return offline page
              return caches.match(OFFLINE_URL)
            })
        }

        // For other requests, try network
        return fetch(request)
          .catch(() => {
            // If network fails and no cache, return error
            return new Response('Offline', { status: 503 })
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions when connection is restored
      handleOfflineActions()
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Bluedots Technologies',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Bluedots Technologies', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  } else if (event.action === 'close') {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Helper function to handle offline actions
async function handleOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        })
        
        // Remove successful action from offline storage
        await removeOfflineAction(action.id)
      } catch (error) {
        console.error('Failed to sync offline action:', error)
      }
    }
  } catch (error) {
    console.error('Error handling offline actions:', error)
  }
}

// Helper functions for offline storage (simplified)
async function getOfflineActions() {
  // In a real implementation, you would use IndexedDB
  return []
}

async function removeOfflineAction(id) {
  // In a real implementation, you would remove from IndexedDB
  console.log('Removing offline action:', id)
}
