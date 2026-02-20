// store/notificationsStore.js
import { create } from "zustand";
import { apiClient } from '@/utils/apiClient';

const useNotificationStore = create((set, get) => ({
  notifications: { notifications: [] },
  loading: false,

  fetchNotifications: async (userId) => {
    set({ loading: true });
    try {
      const data = await apiClient('/api/notifications/getNotifications', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      // Ensure data is in the expected object format
      const formattedData = data?.notifications ? data : { notifications: data || [] };
      set({ notifications: formattedData, loading: false });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ loading: false });
    }
  },

  addNotification: (notification) => {
    set((state) => {
      const notificationsList = state.notifications?.notifications || [];
      return {
        notifications: {
          ...state.notifications,
          notifications: [notification, ...notificationsList]
        }
      };
    });
  },

  // إضافة إشعار من WebSocket مع التحقق من التكرار
  addNotificationFromSocket: (notification) => {
    set((state) => {
      const notificationsList = state.notifications?.notifications || [];

      // التحقق من عدم وجود الإشعار مسبقاً
      const exists = notificationsList.some(n => n.id === notification.id);
      if (exists) {
        return state;
      }

      return {
        notifications: {
          ...state.notifications,
          notifications: [notification, ...notificationsList]
        }
      };
    });
  },

  // تحديث حالة إشعار محدد
  updateNotificationStatus: (notificationId, updates) => {
    set((state) => {
      const notificationsList = state.notifications?.notifications || [];

      const updatedList = notificationsList.map((n) =>
        n.id === notificationId ? { ...n, ...updates } : n
      );

      return {
        notifications: {
          ...state.notifications,
          notifications: updatedList
        }
      };
    });
  },

  // حذف إشعار محدد
  removeNotification: (notificationId) => {
    set((state) => {
      const notificationsList = state.notifications?.notifications || [];
      const filteredList = notificationsList.filter((n) => n.id !== notificationId);

      return {
        notifications: {
          ...state.notifications,
          notifications: filteredList
        }
      };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const notificationsList = state.notifications?.notifications || [];
      const updatedList = notificationsList.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      );

      return {
        notifications: {
          ...state.notifications,
          notifications: updatedList
        }
      };
    });
  },

  clearNotifications: async () => {
    try {
      await apiClient('/api/notifications/clearAll', {
        method: 'POST'
      });
      // Reset to correct object structure
      set({ notifications: { notifications: [] } });
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  },
}));

export default useNotificationStore;
