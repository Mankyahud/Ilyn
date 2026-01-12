const CACHE_NAME = "Ilyn";
const BASE_URL = self.registration.scope;

const urlsToCache = [
  `${BASE_URL}`,
  `${BASE_URL}index.html`,
  `${BASE_URL}offline.html`,
  `${BASE_URL}assets/style.css`,
  `${BASE_URL}manifest.json`,
  `${BASE_URL}assets/logoandroid192x192.png`,
  `${BASE_URL}assets/logoandroid512x512.png`,
  `${BASE_URL}assets/img/koko/KOKO1.jpeg`,
  `${BASE_URL}assets/img/koko/KOKO2.jpeg`,
  `${BASE_URL}assets/img/koko/KOKO3.jpeg`,
  `${BASE_URL}assets/img/koko/KOKO4.jpeg`,
  `${BASE_URL}assets/img/koko/KOKO5.jpeg`,
  `${BASE_URL}assets/img/koko/KOKO7.jpeg`,
  `${BASE_URL}assets/img/sarung/SARUNG1.jpeg`,
  `${BASE_URL}assets/img/sarung/SARUNG2.jpeg`,
  `${BASE_URL}assets/img/sarung/SARUNG4.jpeg`,
  `${BASE_URL}assets/img/celana/CELANA3.jpeg`,
  `${BASE_URL}assets/img/celana/CELANA1.jpeg`,
  `${BASE_URL}assets/img/celana/CELANA2.jpeg`,
  `${BASE_URL}assets/img/celana/CELANA4.jpeg`,
  `${BASE_URL}assets/img/peci/Peci09.jpeg`,
  `${BASE_URL}assets/img/peci/Peci10.jpeg`,
  `${BASE_URL}assets/img/gamis/GAMIS1.JPG`,
  `${BASE_URL}assets/img/gamis/GAMIS2.JPG`,
  `${BASE_URL}assets/img/gamis/GAMIS5.JPG`,
  `${BASE_URL}assets/img/gamis/GAMIS8.JPG`,

];

// Install Service Worker & simpan file ke cache
self.addEventListener("install", event => {
  self.skipWaiting(); // langsung aktif tanpa reload manual
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error("Cache gagal dimuat:", err))
  );
});

// Aktivasi dan hapus cache lama
self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("Menghapus cache lama:", key);
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim(); // langsung klaim kontrol ke halaman
    })()
  );
});

// Fetch event: cache-first untuk file lokal, network-first untuk API
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Abaikan permintaan Chrome Extension, analytics, dll.
  if (url.protocol.startsWith("chrome-extension")) return;
  if (request.method !== "GET") return;

  // File lokal (statis)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(response => {
        return (
          response ||
          fetch(request).catch(() => caches.match(`${BASE_URL}offline.html`))
        );
      })
    );
  } 
  // Resource eksternal (API, CDN, dsb.)
  else {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
  }
});
