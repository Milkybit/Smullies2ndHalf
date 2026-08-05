// Service worker van Doel1: app-schil cachen zodat de app offline en na
// herstart op het beginscherm werkt. Data staat in localStorage, niet hier.
const CACHE = 'doel1-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./'])).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((sleutels) => Promise.all(sleutels.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Netwerk eerst, cache als vangnet; gelukte antwoorden gaan de cache in.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request)
      .then((antwoord) => {
        if (antwoord.ok && e.request.url.startsWith(self.location.origin)) {
          const kopie = antwoord.clone()
          caches.open(CACHE).then((c) => c.put(e.request, kopie))
        }
        return antwoord
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then((hit) => hit || caches.match('./')))
  )
})
