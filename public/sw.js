/* Forever Moment image cache worker.
 * Scope: images only. Everything else passes straight through to the network.
 * Strategy: cache-first with background refresh for same-origin API images and Unsplash.
 */
const CACHE = 'fm-images-v1';
const MAX_ENTRIES = 300;
const IMAGE_HOSTS = ['images.unsplash.com'];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('fm-images-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isImageRequest = (request) => {
  if (request.method !== 'GET') return false;
  if (request.destination === 'image') return true;
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/platform/public/images/') || IMAGE_HOSTS.includes(url.hostname);
};

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_ENTRIES) return;
  // Oldest entries come first; drop the overflow.
  await Promise.all(keys.slice(0, keys.length - MAX_ENTRIES).map((k) => cache.delete(k)));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isImageRequest(request)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);

      const network = fetch(request)
        .then((response) => {
          if (response && (response.ok || response.type === 'opaque')) {
            cache.put(request, response.clone()).then(() => trimCache(cache));
          }
          return response;
        })
        .catch(() => undefined);

      if (cached) {
        // Serve instantly, refresh in the background so long-lived URLs stay fresh.
        event.waitUntil(network);
        return cached;
      }
      const response = await network;
      return response || Response.error();
    })(),
  );
});
