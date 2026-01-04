/**
 * FIREBASE MESSAGING SERVICE WORKER
 * Required by Firebase SDK for background push notifications
 * This file must be in the public folder root
 */

// Firebase Messaging for background messages
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
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
  console.log('[firebase-messaging-sw] Background message received:', payload);
  
  const notificationData = payload.notification || payload.data || {};
  const { title, body, icon, image } = notificationData;
  
  const options = {
    body: body || 'You have a new notification',
    icon: icon || '/icons/notification-icon-192.png',
    badge: '/icons/notification-badge-72.png',
    image: image,
    data: payload.data || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
    tag: payload.data?.type || 'notification',
    timestamp: Date.now(),
  };

  self.registration.showNotification(title || 'Aura Interiors', options);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw] Notification clicked:', event);
  event.notification.close();
  
  const actionUrl = event.notification.data?.actionUrl || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(actionUrl);
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(actionUrl);
      }
    })
  );
});

console.log('[firebase-messaging-sw] Service Worker loaded');
