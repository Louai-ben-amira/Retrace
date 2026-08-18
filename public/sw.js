/*
 * Retrace service worker.
 *
 * Two jobs:
 *   1. Web push ("word of the day") — the original contents of this file.
 *   2. Offline mode — the Pro feature advertised on the pricing page. Previously this
 *      file had no fetch handler at all, so nothing was ever available offline.
 *
 * Caching strategy, by request type:
 *   - Navigations (HTML)     → network-first, fall back to the cached copy of that exact
 *                              page, then to /offline. This is what makes a story you
 *                              have already opened readable with no connection.
 *   - Next.js build assets   → cache-first. Content-hashed filenames, so they can never
 *                              go stale; a cache hit is always correct.
 *   - Audio (blob storage)   → cache-first. Line narration is immutable once synthesised
 *                              and is the expensive thing to re-fetch.
 *   - Images / icons         → stale-while-revalidate.
 *
 * Never cached: anything under /api (except audio blobs, which live on a different
 * origin), and any non-GET request. Auth state and progress must not be served stale.
 */

const VERSION = "v1";
const PRECACHE = `retrace-precache-${VERSION}`;
const PAGES = `retrace-pages-${VERSION}`;
const ASSETS = `retrace-assets-${VERSION}`;
const MEDIA = `retrace-media-${VERSION}`;

const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [OFFLINE_URL, "/icon-192.png", "/icon-512.png", "/logo-icon.png"];

const CURRENT_CACHES = [PRECACHE, PAGES, ASSETS, MEDIA];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      // Individually, so one missing asset can't fail the whole install and leave the
      // worker permanently un-activated.
      .then((cache) => Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith("retrace-") && !CURRENT_CACHES.includes(k)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function isAudio(url) {
  return /\.(mp3|m4a|ogg|wav)$/i.test(url.pathname) || url.hostname.endsWith(".blob.vercel-storage.com");
}

function isImage(url) {
  return /\.(png|jpe?g|webp|gif|svg|ico)$/i.test(url.pathname);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  // Opaque (cross-origin, no-CORS) responses still have status 0 but are worth storing —
  // audio blobs come back this way.
  if (response && (response.ok || response.type === "opaque")) {
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => hit);
  return hit || network;
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    const offline = await caches.match(OFFLINE_URL);
    // Last resort if even the offline page failed to precache.
    return offline || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never serve a stale API response — progress, auth and review scheduling are all
  // read-your-writes. Audio blobs are exempt: they live on blob storage, not /api.
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (isAudio(url)) {
    event.respondWith(cacheFirst(request, MEDIA));
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, ASSETS));
    return;
  }

  if (isImage(url)) {
    event.respondWith(staleWhileRevalidate(request, ASSETS));
  }
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Retrace", {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url ?? "/library" },
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url ?? "/library";
  // Focus an existing tab if one is already open rather than stacking new windows.
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
