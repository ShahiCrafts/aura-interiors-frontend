/**
 * usePushNotifications HOOK
 * Registers device for push notifications
 * Requests browser permission and manages token lifecycle
 */

import { useEffect, useState, useCallback } from "react";
import NotificationService from "../../services/notificationService";

const usePushNotifications = (token, user) => {
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState("default");
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState(null);

  /**
   * CHECK PUSH NOTIFICATION SUPPORT
   */
  useEffect(() => {
    // Check if browser supports Web Push
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setPushSupported(supported);

    if (supported) {
      setPushPermission(Notification.permission);
    }
  }, []);

  /**
   * REGISTER SERVICE WORKER
   */
  useEffect(() => {
    if (!pushSupported || !token) return;

    const registerServiceWorker = async () => {
      try {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.register(
            "/service-worker.js",
            { scope: "/" }
          );
          console.log("✓ Service Worker registered:", registration);
        }
      } catch (error) {
        console.error("Failed to register service worker:", error);
        setError("Failed to register for notifications");
      }
    };

    registerServiceWorker();
  }, [pushSupported, token]);

  /**
   * REQUEST PUSH PERMISSION
   */
  const requestPushPermission = useCallback(async () => {
    if (!pushSupported) {
      setError("Push notifications not supported");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === "granted") {
        await registerForPush();
        return true;
      }

      return false;
    } catch (err) {
      console.error("Permission request failed:", err);
      setError("Failed to request notification permission");
      return false;
    }
  }, [pushSupported]);

  /**
   * REGISTER FOR PUSH NOTIFICATIONS
   * Gets FCM token and sends to backend
   */
  const registerForPush = useCallback(async () => {
    if (!pushSupported || !token || !user) return;

    try {
      // Get device ID (unique per browser)
      const deviceId = await getOrCreateDeviceId();

      // Request FCM token
      // Note: This requires Firebase to be initialized on the page
      // const messaging = firebase.messaging();
      // const fcmToken = await messaging.getToken({
      //   vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      // });

      // For now, generate a mock token (in production, use Firebase)
      const fcmToken = generateMockToken();

      // Get browser info
      const metadata = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        pushPermission: Notification.permission,
      };

      // Register token with backend
      const device = await NotificationService.registerPushToken({
        token: fcmToken,
        deviceId,
        deviceName: getDeviceName(),
        platform: getPlatform(),
        metadata,
      });

      console.log("✓ Push token registered:", device);
      setRegistered(true);
      setError(null);

      // Listen for incoming messages (when app is in foreground)
      listenForMessages();

      return device;
    } catch (err) {
      console.error("Failed to register for push:", err);
      setError("Failed to register device: " + err.message);
      setRegistered(false);
    }
  }, [pushSupported, token, user]);

  /**
   * GET OR CREATE DEVICE ID
   * Persists device identification across sessions
   */
  const getOrCreateDeviceId = useCallback(async () => {
    const dbName = "AuraNotifications";
    const storeName = "devices";

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const query = store.getAll();

        query.onsuccess = () => {
          const devices = query.result;
          const existingDevice = devices.find((d) => d.type === "primary");

          if (existingDevice) {
            resolve(existingDevice.id);
          } else {
            // Create new device ID
            const newDeviceId = generateDeviceId();
            const writeTransaction = db.transaction(storeName, "readwrite");
            const writeStore = writeTransaction.objectStore(storeName);
            writeStore.add({ id: newDeviceId, type: "primary" });

            writeTransaction.onerror = () => reject(writeTransaction.error);
            writeTransaction.onsuccess = () => resolve(newDeviceId);
          }
        };
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { autoIncrement: true });
        }
      };
    });
  }, []);

  /**
   * LISTEN FOR FOREGROUND MESSAGES
   * Handle notifications when app is open
   */
  const listenForMessages = useCallback(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "NOTIFICATION_CLICKED") {
          console.log("Notification clicked:", event.data.data);
          // Handle notification click in app
          const actionUrl = event.data.data.actionUrl;
          if (actionUrl) {
            window.location.href = actionUrl;
          }
        }
      });
    }
  }, []);

  /**
   * REVOKE PUSH PERMISSIONS
   */
  const revokePushPermission = useCallback(async () => {
    // Note: Cannot programmatically revoke permissions
    // User must do it through browser settings
    console.log(
      "To disable notifications, please update permissions in your browser settings"
    );
  }, []);

  /**
   * UNREGISTER DEVICE
   */
  const unregisterDevice = useCallback(async (deviceId) => {
    if (!user) return;

    try {
      await NotificationService.unregisterDevice(deviceId);
      setRegistered(false);
      console.log("✓ Device unregistered");
    } catch (err) {
      console.error("Failed to unregister device:", err);
      setError("Failed to unregister device");
    }
  }, [user]);

  return {
    pushSupported,
    pushPermission,
    registered,
    error,
    requestPushPermission,
    registerForPush,
    revokePushPermission,
    unregisterDevice,
  };
};

/**
 * UTILITY FUNCTIONS
 */

function generateMockToken() {
  // In production, use Firebase to get real FCM token
  return `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateDeviceId() {
  // Generate unique device ID
  return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getDeviceName() {
  const ua = navigator.userAgent;

  if (ua.indexOf("Win") > -1) return "Windows";
  if (ua.indexOf("Mac") > -1) return "MacBook";
  if (ua.indexOf("Linux") > -1) return "Linux";
  if (ua.indexOf("iPhone") > -1) return "iPhone";
  if (ua.indexOf("iPad") > -1) return "iPad";
  if (ua.indexOf("Android") > -1) return "Android Device";

  return "Unknown Device";
}

function getPlatform() {
  const ua = navigator.userAgent;

  if (
    ua.indexOf("iPhone") > -1 ||
    ua.indexOf("iPad") > -1 ||
    ua.indexOf("iPod") > -1
  ) {
    return "ios";
  }

  if (ua.indexOf("Android") > -1) {
    return "android";
  }

  return "web";
}

export default usePushNotifications;
