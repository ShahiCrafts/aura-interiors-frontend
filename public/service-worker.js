/**
 * SERVICE WORKER
 * Handles browser-level push notifications
 * Listens to FCM messages and displays notifications
 * Works offline; syncs when online
 */

// Firebase Messaging for background messages
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker (needed for background messages)
// These values must match your firebase.js config
firebase.initializeApp({
  apiKey: "AIzaSyBjrJpQAeZhCfWYES-PgDqs2M4IASPcPOA",
  authDomain: "aura-interiors-7f112.firebaseapp.com",
  projectId: "aura-interiors-7f112",
  storageBucket: "aura-interiors-7f112.firebasestorage.app",
  messagingSenderId: "572622226094",
  appId: "1:572622226094:web:e532a6d29e8659e02a633f",
});

const messaging = firebase.messaging();

// Handle background messages from FCM
messaging.onBackgroundMessage((payload) => {
  console.log('[ServiceWorker] Background message received:', payload);
  
  const { title, body, icon, data } = payload.notification || payload.data || {};
  
  const options = {
    body: body || 'You have a new notification',
    icon: icon || '/icons/notification-icon-192.png',
    badge: '/icons/notification-badge-72.png',
    data: data || payload.data || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
    tag: data?.type || 'notification',
    timestamp: Date.now(),
  };

  self.registration.showNotification(title || 'Aura Interiors', options);
});

/**
 * BACKGROUND MESSAGE HANDLER (Fallback for non-FCM push)
 * Called when:
 * 1. App is in background
 * 2. Browser tab is closed
 * 3. User interacts with push notification
 */
self.addEventListener("push", (event) => {
  console.log("[ServiceWorker] Push notification received:", event);

  if (!event.data) {
    console.warn("[ServiceWorker] No data in push event");
    return;
  }

  try {
    // Parse notification data
    const data = event.data.json();
    const { title, body, icon, badge, tag, data: notificationData } = data;

    // Show notification with browser API
    const options = {
      body: body || "",
      icon: icon || "/icons/notification-icon-192.png",
      badge: badge || "/icons/notification-badge-72.png",
      tag: tag || "notification", // Allows replacing notifications
      data: notificationData || {},
      requireInteraction: false, // Auto-dismiss after timeout
      actions: [
        {
          action: "open",
          title: "Open",
          icon: "/icons/action-open.png",
        },
        {
          action: "close",
          title: "Dismiss",
          icon: "/icons/action-close.png",
        },
      ],
      badge: badge || "/icons/notification-badge-72.png",
      vibrate: [200, 100, 200], // Vibration pattern
      tag: tag || "notification",
      timestamp: Date.now(),
    };

    event.waitUntil(
      self.registration.showNotification(title || "Aura Interiors", options)
    );
  } catch (error) {
    console.error("[ServiceWorker] Error handling push:", error);
  }
});

/**
 * NOTIFICATION CLICK HANDLER
 * Called when user clicks on notification
 */
self.addEventListener("notificationclick", (event) => {
  console.log("[ServiceWorker] Notification clicked:", event.notification);

  event.notification.close();

  const notification = event.notification;
  const actionUrl = notification.data.actionUrl || "/";

  if (event.action === "close") {
    // User clicked "Dismiss" - do nothing
    return;
  }

  // Open or focus window
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let client of clientList) {
          if (client.url === "/" && "focus" in client) {
            client.focus();
            // Send message to app
            client.postMessage({
              type: "NOTIFICATION_CLICKED",
              data: notification.data,
            });
            return client;
          }
        }

        // App not open - open it
        if (clients.openWindow) {
          return clients.openWindow(actionUrl);
        }
      })
  );
});

/**
 * NOTIFICATION CLOSE HANDLER
 * Called when notification is dismissed
 */
self.addEventListener("notificationclose", (event) => {
  console.log("[ServiceWorker] Notification dismissed:", event.notification);
  // Optional: Track dismissal analytics
});

/**
 * MESSAGE FROM CLIENT HANDLER
 * App can send messages to service worker
 */
self.addEventListener("message", (event) => {
  console.log("[ServiceWorker] Message from client:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    // Update service worker
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLIENT_READY") {
    // Client is ready - send any pending notifications
    event.ports[0].postMessage({ type: "SERVICE_WORKER_READY" });
  }
});

/**
 * INSTALL EVENT
 * Set up cache for offline support
 */
const CACHE_NAME = "aura-notifications-v1";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/icons/notification-icon-192.png",
  "/icons/notification-badge-72.png",
];

self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Cache opened");
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        // Silently fail if offline - not critical
        console.warn("[ServiceWorker] Some resources failed to cache");
      });
    })
  );

  self.skipWaiting(); // Activate immediately
});

/**
 * ACTIVATE EVENT
 * Clean up old caches
 */
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[ServiceWorker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim(); // Claim all clients
});

/**
 * FETCH EVENT
 * Serve from cache when offline
 */
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API requests (should fail gracefully)
  if (event.request.url.includes("/api/")) return;

  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            if (
              response &&
              response.status === 200 &&
              !event.request.url.includes("/api/")
            ) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }

            return response;
          })
          .catch(() => {
            // Return cached version if available
            return caches.match("/index.html");
          });
      })
  );
});

/**
 * PERIODIC BACKGROUND SYNC
 * Sync notifications when online (requires permission)
 */
self.addEventListener("sync", (event) => {
  console.log("[ServiceWorker] Background sync triggered:", event.tag);

  if (event.tag === "sync-notifications") {
    event.waitUntil(
      fetch("/api/v1/notifications?limit=5")
        .then((response) => response.json())
        .then((data) => {
          console.log("[ServiceWorker] Synced notifications:", data);
        })
        .catch((error) => {
          console.error("[ServiceWorker] Sync failed:", error);
          // Retry later
          throw error;
        })
    );
  }
});

console.log("[ServiceWorker] Service Worker loaded");
