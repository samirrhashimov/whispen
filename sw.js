const CACHE_NAME = "whispen-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles/styles.css",
  "/scripts/script.js",
  "/pdf.js/web/viewer.html",
  "/pdf.js/web/styles.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});