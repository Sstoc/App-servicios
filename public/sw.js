const CACHE_NAME = 'home-finance-v26';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('push', event => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data?.text() };
  }

  event.waitUntil(self.registration.showNotification(payload.title || 'Home - Servicios', {
    body: payload.body || 'Tenés un vencimiento próximo.',
    icon: '/logo-notificacion.png',
    badge: '/logo-notificacion.png',
    tag: payload.tag || 'home-servicios-reminder',
    renotify: true,
    data: { url: payload.url || '/' },
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const destination = event.notification.data?.url || '/';

  event.waitUntil((async () => {
    const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find(client => new URL(client.url).origin === self.location.origin);

    if (existing) {
      await existing.focus();
      await existing.navigate(destination);
      return;
    }

    await clients.openWindow(destination);
  })());
});

self.addEventListener('fetch', event => {
  // Estrategia Network-First para HTML principal y manifest
  if (event.request.mode === 'navigate' || 
      event.request.url.endsWith('/') || 
      event.request.url.endsWith('index.html') ||
      event.request.url.includes('manifest.json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Estrategia Cache-First para el resto (imágenes estáticas, assets)
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
