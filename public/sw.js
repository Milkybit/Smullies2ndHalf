// Retire the previous Doel1 service worker at its existing URL.
// Personal localStorage is deliberately left untouched.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .delete("doel1-v1")
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim()),
  );
});
