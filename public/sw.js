const CACHE_NAME = 'home-finance-v32';
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

  // HARDENING [SW-1]: Validación estricta de origen para prevenir Open Redirect.
  // Si la URL apunta a un dominio externo o es inválida, se redirige a '/' de forma segura.
  let destination = '/';
  try {
    const rawUrl = event.notification.data?.url || '/';
    const parsed = new URL(rawUrl, self.location.origin);
    if (parsed.origin === self.location.origin) {
      destination = parsed.pathname + parsed.search + parsed.hash;
    }
    // Si el origen no coincide, destination permanece '/' (default seguro)
  } catch {
    // URL inválida o malformada → default seguro '/'
  }

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
  const url = new URL(event.request.url);

  // HARDENING [SW-2]: Nunca interceptar peticiones cross-origin.
  // Si el SW cachea respuestas "opacas" de CDNs externos (Font Awesome, Google Fonts),
  // puede servir respuestas corruptas/fallidas en cargas normales.
  // Ctrl+Shift+R bypasea el SW y las trae frescas, reproduciendo el bug.
  // Solución: dejar que el navegador maneje peticiones externas directamente.
  if (url.origin !== self.location.origin) {
    return;
  }

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

  // Estrategia Cache-First para assets del mismo origen (imágenes estáticas, assets)
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
