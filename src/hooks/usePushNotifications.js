/**
 * usePushNotifications HOOK
 * Registers device for push notifications
 * Requests browser permission and manages token lifecycle
 */

console.log("🔔 usePushNotifications.js FILE LOADED");

import { useEffect, useState, useCallback, useRef } from "react";
import NotificationService from "../services/notificationService";
import { getFCMToken, onForegroundMessage } from "../services/firebase";

/**
 * UTILITY FUNCTIONS
 */
function generateMockToken() {
  return `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateDeviceId() {
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
  if (ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1 || ua.indexOf("iPod") > -1) {
    return "ios";
  }
  if (ua.indexOf("Android") > -1) {
    return "android";
  }
  return "web";
}

async function getOrCreateDeviceId() {
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
}

const usePushNotifications = (token, user) => {
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState("default");
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState(null);
  const registrationAttempted = useRef(false);

  // Debug logging
  useEffect(() => {
    console.log("[PushNotifications] Hook initialized:", {
      token: !!token,
      user: user?._id || user?.id || null,
      pushSupported,
      pushPermission,
      registered,
    });
  }, [token, user, pushSupported, pushPermission, registered]);

  /**
   * CHECK PUSH NOTIFICATION SUPPORT
   */
  useEffect(() => {
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    console.log("[PushNotifications] Support check:", {
      serviceWorker: "serviceWorker" in navigator,
      PushManager: "PushManager" in window,
      Notification: "Notification" in window,
      currentPermission: "Notification" in window ? Notification.permission : "N/A",
    });

    setPushSupported(supported);

    if (supported) {
      setPushPermission(Notification.permission);
    }
  }, []);

  /**
   * LISTEN FOR FOREGROUND MESSAGES
   */
  const listenForMessages = useCallback(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "NOTIFICATION_CLICKED") {
          console.log("Notification clicked:", event.data.data);
          const actionUrl = event.data.data.actionUrl;
          if (actionUrl) {
            window.location.href = actionUrl;
          }
        }
      });
    }
  }, []);

  /**
   * REGISTER FOR PUSH NOTIFICATIONS
   * Gets FCM token and sends to backend
   */
  const registerForPush = useCallback(async () => {
    if (!pushSupported || !token || !user) {
      console.log("Cannot register: pushSupported=", pushSupported, "token=", !!token, "user=", !!user);
      return;
    }

    try {
      console.log("Starting push registration...");
      
      // Get device ID (unique per browser)
      const deviceId = await getOrCreateDeviceId();
      console.log("Device ID:", deviceId);

      // Get real FCM token from Firebase
      let fcmToken = await getFCMToken();
      console.log("FCM Token obtained:", !!fcmToken);
      
      // Fallback to mock token if Firebase not configured
      if (!fcmToken) {
        console.warn("Using mock token - configure Firebase for real push notifications");
        fcmToken = generateMockToken();
      }

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
  }, [pushSupported, token, user, listenForMessages]);

  /**
   * REGISTER SERVICE WORKER & AUTO-REGISTER IF PERMISSION GRANTED
   */
  useEffect(() => {
    console.log("[PushNotifications] Init effect check:", {
      pushSupported,
      token: !!token,
      user: !!user,
      permission: Notification.permission,
      alreadyAttempted: registrationAttempted.current,
    });

    if (!pushSupported || !token || !user) {
      console.log("[PushNotifications] Skipping init - missing requirements");
      return;
    }

    const initializePush = async () => {
      try {
        // First, register service worker
        if ("serviceWorker" in navigator) {
          console.log("[PushNotifications] Registering service worker...");
          const registration = await navigator.serviceWorker.register(
            "/service-worker.js",
            { scope: "/" }
          );
          console.log("✓ Service Worker registered:", registration);
        }

        // If permission is already granted, register for push
        if (Notification.permission === "granted" && !registrationAttempted.current) {
          registrationAttempted.current = true;
          console.log("Permission already granted, auto-registering device...");
          await registerForPush();
        } else {
          console.log("[PushNotifications] Not auto-registering:", {
            permission: Notification.permission,
            alreadyAttempted: registrationAttempted.current,
          });
        }
      } catch (error) {
        console.error("Failed to initialize push:", error);
        setError("Failed to register for notifications");
      }
    };

    initializePush();
  }, [pushSupported, token, user, registerForPush]);

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
        registrationAttempted.current = true;
        await registerForPush();
        return true;
      }

      return false;
    } catch (err) {
      console.error("Permission request failed:", err);
      setError("Failed to request notification permission");
      return false;
    }
  }, [pushSupported, registerForPush]);

  /**
   * REVOKE PUSH PERMISSIONS
   */
  const revokePushPermission = useCallback(async () => {
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

export default usePushNotifications;
