/* Service worker de Cedulación Pet Carnet.
   Objetivo: permitir instalar la app y dar una pantalla offline,
   SIN servir datos desactualizados. Las páginas y el API siempre van a la
   red primero; solo si no hay conexión se muestra la página /offline. */
const CACHE = "cedulacionpet-v1";
const APP_SHELL = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navegaciones (páginas): red primero, /offline como respaldo.
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/offline")));
    return;
  }

  // Íconos y estáticos: cache primero (rápido), red de respaldo.
  if (url.pathname.startsWith("/icons/") || url.pathname === "/manifest.webmanifest") {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
    return;
  }
  // Todo lo demás (incluido el API): directo a la red.
});
