/**
 * FIREBASE CONFIGURATION
 * Initializes Firebase for Web Push Notifications (FCM)
 */

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration - get these from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app = null;
let messaging = null;

try {
  app = initializeApp(firebaseConfig);
  
  // Only initialize messaging if supported
  if (typeof window !== "undefined" && "Notification" in window) {
    messaging = getMessaging(app);
    console.log("✓ Firebase Messaging initialized");
  }
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

/**
 * Get FCM Token for push notifications
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const getFCMToken = async () => {
  if (!messaging) {
    console.warn("Firebase Messaging not initialized");
    return null;
  }

  try {
    // VAPID key from Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      console.warn("VAPID key not configured");
      return null;
    }

    const token = await getToken(messaging, { vapidKey });
    
    if (token) {
      console.log("✓ FCM Token obtained");
      return token;
    } else {
      console.warn("No FCM token available. Request permission first.");
      return null;
    }
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    return null;
  }
};

/**
 * Listen for foreground messages
 * @param {Function} callback - Called when message received
 */
export const onForegroundMessage = (callback) => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log("📨 Foreground message received:", payload);
    callback(payload);
  });
};

export { app, messaging };
