/**
 * useNotificationSocket HOOK
 * Manages real-time WebSocket connection for notifications
 * Handles connection, reconnection, and event listening
 */

import { useEffect, useRef, useCallback, useState } from "react";
import io from "socket.io-client";

const useNotificationSocket = (token, userId) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

  // Heartbeat interval ref
  const heartbeatIntervalRef = useRef(null);

  /**
   * INITIALIZE SOCKET CONNECTION
   */
  useEffect(() => {
    if (!token || !userId) return;

    try {
      // Create socket instance with authentication
      const socket = io(import.meta.env.VITE_API_URL || "http://localhost:8080", {
        auth: { token },
        transports: ["websocket", "polling"], // Fallback to polling
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
      });

      // ===================== CONNECTION EVENTS =====================

      socket.on("connect", () => {
        console.log("✓ WebSocket connected");
        setConnected(true);
        setError(null);

        // Start heartbeat
        startHeartbeat(socket);
      });

      socket.on("disconnect", (reason) => {
        console.log("✗ WebSocket disconnected:", reason);
        setConnected(false);

        // Stop heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
      });

      socket.on("error", (error) => {
        console.error("WebSocket error:", error);
        setError(error);
      });

      // ===================== NOTIFICATION EVENTS =====================

      /**
       * RECEIVE NEW NOTIFICATION
       * Real-time delivery when user is online
       */
      socket.on("notification:new", (notification) => {
        console.log("📨 New notification:", notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      /**
       * BROADCAST NOTIFICATION
       * System-wide announcements
       */
      socket.on("notification:broadcast", (notification) => {
        console.log("📢 Broadcast notification:", notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      /**
       * BADGE UPDATE
       * Unread count sync
       */
      socket.on("badge:update", (data) => {
        console.log("🔔 Badge updated:", data.unreadCount);
        setUnreadCount(data.unreadCount);
      });

      /**
       * NOTIFICATION LIST SYNC
       * Periodic sync of notification list
       */
      socket.on("notifications:list", (data) => {
        console.log("📋 Notifications synced:", data);
        setNotifications(data.notifications);
      });

      /**
       * SUBSCRIPTION CONFIRMATION
       */
      socket.on("subscribed", (data) => {
        console.log(`✓ Subscribed to topic: ${data.topic}`);
      });

      socket.on("unsubscribed", (data) => {
        console.log(`✓ Unsubscribed from topic: ${data.topic}`);
      });

      /**
       * ACTION CONFIRMATIONS
       */
      socket.on("notification:read:success", (data) => {
        console.log("✓ Notification marked as read");
      });

      socket.on("notification:archive:success", (data) => {
        console.log("✓ Notification archived");
      });

      /**
       * HEARTBEAT ACKNOWLEDGMENT
       */
      socket.on("heartbeat:ack", (data) => {
        console.log("💓 Heartbeat acknowledged");
      });

      socketRef.current = socket;

      // Cleanup on unmount
      return () => {
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        socket.disconnect();
      };
    } catch (err) {
      console.error("Failed to initialize socket:", err);
      setError(err.message);
    }
  }, [token, userId]);

  /**
   * START HEARTBEAT
   * Keep-alive signal every 30 seconds
   */
  const startHeartbeat = useCallback((socket) => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit("heartbeat");
      }
    }, 30000); // Every 30 seconds
  }, []);

  /**
   * SUBSCRIBE TO TOPIC
   */
  const subscribeTopic = useCallback((topic) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("subscribe:topic", { topic });
    }
  }, []);

  /**
   * UNSUBSCRIBE FROM TOPIC
   */
  const unsubscribeTopic = useCallback((topic) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("unsubscribe:topic", { topic });
    }
  }, []);

  /**
   * MARK NOTIFICATION AS READ (via socket)
   */
  const markAsReadSocket = useCallback((userNotificationId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("notification:read", { userNotificationId });
    }
  }, []);

  /**
   * ARCHIVE NOTIFICATION (via socket)
   */
  const archiveNotificationSocket = useCallback((userNotificationId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("notification:archive", { userNotificationId });
    }
  }, []);

  /**
   * REQUEST NOTIFICATIONS SYNC
   */
  const requestNotificationsSync = useCallback((page = 1, limit = 10) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("request:notifications", { page, limit });
    }
  }, []);

  return {
    connected,
    notifications,
    unreadCount,
    error,
    subscribeTopic,
    unsubscribeTopic,
    markAsReadSocket,
    archiveNotificationSocket,
    requestNotificationsSync,
    socket: socketRef.current,
  };
};

export default useNotificationSocket;
