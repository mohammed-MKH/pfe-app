const CACHE_NAME = "pfe-app-v1"

const STATIC_ASSETS = [
  "/",
  "/login",
  "/dashboard",
  "/offline",
]

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET and Firebase/API requests
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("firestore") ||
    event.request.url.includes("firebase") ||
    event.request.url.includes("/api/")
  ) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached
          // Fallback to offline page
          if (event.request.destination === "document") {
            return caches.match("/offline")
          }
        })
      })
  )
})