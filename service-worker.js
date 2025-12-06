const CACHE_NAME = "cas-tracker-v1";
const OFFLINE_PAGE = "/index.html";
const ASSETS = [
  "/",
  "/index.html",
  "/menu.html",
  "/actividades.html",
  "/reflexiones.html",
  "/horario.html",
  "/css/style.css",
  "/js/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// install
self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// activate
self.addEventListener("activate", (ev) => {
  ev.waitUntil(self.clients.claim());
});

// fetch - cache-first for app shell, network for API routes
self.addEventListener("fetch", (ev) => {
  const url = new URL(ev.request.url);
  // simple API bypass (requests to firestore go network-first)
  if (url.origin.includes("firestore.googleapis.com") || url.origin.includes("gstatic.com")) {
    ev.respondWith(fetch(ev.request).catch(() => caches.match(OFFLINE_PAGE)));
    return;
  }

  ev.respondWith(
    caches.match(ev.request).then((cached) => {
      if (cached) return cached;
      return fetch(ev.request).then((response) => {
        // put into cache for future
        return caches.open(CACHE_NAME).then((cache) => {
          // only cache GET and same-origin
          if (ev.request.method === "GET" && url.origin === location.origin) {
            cache.put(ev.request, response.clone());
          }
          return response;
        });
      }).catch(() => caches.match(OFFLINE_PAGE));
    })
  );
});
