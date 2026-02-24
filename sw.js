const PORTICO_CACHE_VERSION = "v1.0.1";
const PORTICO_STATIC_CACHE = `portico-static-${PORTICO_CACHE_VERSION}`;
const PORTICO_VENDOR_CACHE = `portico-vendor-${PORTICO_CACHE_VERSION}`;

const STATIC_ASSETS = [
  "./",
  "./Portico.html",
  "./Portico.css",
  "./manifest.webmanifest",
  "./icons/Portico_icon.svg",
  "./js/constants.js",
  "./js/state.js",
  "./js/utils.js",
  "./js/storage.js",
  "./js/settings.js",
  "./js/widgets.js",
  "./js/drag.js",
  "./js/ui-folder.js",
  "./js/ui-render.js",
  "./js/ui-modal.js",
  "./js/ui-events.js",
  "./js/ui.js",
  "./js/ambient.js",
  "./js/app.js",
  "./js/main.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PORTICO_STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                (key.startsWith("portico-static-") &&
                  key !== PORTICO_STATIC_CACHE) ||
                (key.startsWith("portico-vendor-") &&
                  key !== PORTICO_VENDOR_CACHE),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSortableCdn =
    url.hostname === "cdn.jsdelivr.net" &&
    url.pathname.includes("/sortablejs@") &&
    url.pathname.endsWith("/Sortable.min.js");
  if (isSortableCdn) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response || response.status !== 200) return response;
          const copy = response.clone();
          caches
            .open(PORTICO_VENDOR_CACHE)
            .then((cache) => cache.put(request, copy));
          return response;
        });
      }),
    );
    return;
  }

  const isWeatherApi =
    url.hostname.includes("open-meteo.com") ||
    url.hostname.includes("bigdatacloud.net");
  if (isWeatherApi) {
    event.respondWith(fetch(request));
    return;
  }

  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic")
          return response;
        const copy = response.clone();
        caches
          .open(PORTICO_STATIC_CACHE)
          .then((cache) => cache.put(request, copy));
        return response;
      });
    }),
  );
});
