/**
 * FRONTEND NOTIFICATION SERVICE
 * Handles API communication for notifications
 * Works with both REST and WebSocket (real-time)
 */

import api from "../store/api/api";

class NotificationService {
  // ==================== IN-APP NOTIFICATIONS ====================

  /**
   * Fetch user notifications
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {Object} filters - { isRead, category }
   */
  async getNotifications(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters,
      });

      const response = await api.get(
        `/notifications?${params.toString()}`
      );

      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    try {
      const response = await api.get(
        `/notifications/unread-count`
      );

      return response.data.data.unreadCount;
    } catch (error) {
      console.error("Failed to get unread count:", error);
      throw error;
    }
  }

  /**
   * Get notification detail
   */
  async getNotificationDetail(id) {
    try {
      const response = await api.get(
        `/notifications/${id}`
      );

      return response.data.data.notification;
    } catch (error) {
      console.error("Failed to fetch notification:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id) {
    try {
      const response = await api.put(
        `/notifications/${id}/read`,
        {}
      );

      return response.data.data.notification;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds) {
    try {
      const response = await api.post(
        `/notifications/mark-multiple-read`,
        { notificationIds }
      );

      return response.data.data;
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      throw error;
    }
  }

  /**
   * Archive notification
   */
  async archiveNotification(id) {
    try {
      const response = await api.put(
        `/notifications/${id}/archive`,
        {}
      );

      return response.data.data.notification;
    } catch (error) {
      console.error("Failed to archive notification:", error);
      throw error;
    }
  }

  /**
   * Archive multiple notifications
   */
  async archiveMultiple(notificationIds) {
    try {
      const response = await api.post(
        `/notifications/archive-multiple`,
        { notificationIds }
      );

      return response.data.data;
    } catch (error) {
      console.error("Failed to archive notifications:", error);
      throw error;
    }
  }

  // ==================== PUSH TOKENS ====================

  /**
   * Register device for push notifications
   */
  async registerPushToken(tokenData) {
    try {
      const response = await api.post(
        `/notifications/push-tokens/register`,
        tokenData
      );

      return response.data.data.device;
    } catch (error) {
      console.error("Failed to register push token:", error);
      throw error;
    }
  }

  /**
   * Get user's registered devices
   */
  async getUserDevices() {
    try {
      const response = await api.get(
        `/notifications/push-tokens/devices`
      );

      return response.data.data.devices;
    } catch (error) {
      console.error("Failed to fetch devices:", error);
      throw error;
    }
  }

  /**
   * Unregister device
   */
  async unregisterDevice(deviceId) {
    try {
      const response = await api.delete(
        `/notifications/push-tokens/${deviceId}`
      );

      return response.data;
    } catch (error) {
      console.error("Failed to unregister device:", error);
      throw error;
    }
  }

  // ==================== PREFERENCES ====================

  /**
   * Get notification preferences
   */
  async getPreferences() {
    try {
      const response = await api.get(
        `/notifications/preferences`
      );

      return response.data.data.preferences;
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await api.put(
        `/notifications/preferences`,
        preferences
      );

      return response.data.data.preferences;
    } catch (error) {
      console.error("Failed to update preferences:", error);
      throw error;
    }
  }
}

export default new NotificationService();
