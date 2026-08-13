// sw.js (a service worker is ONLY needed when we have to support offline)
// This garbage website doesn't need offline support, but we blundered by adding
// this damn file and caching "/", so it needs to stay here forever -- to wave
// the white flag, and to remind me that this choice was bad and against Next.js
// standards. If someday somebody needs offline support, use Serwist instead --
// which is bullshit anyway, because offline doesn't have a db =))

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));

      await self.registration.unregister();

      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
