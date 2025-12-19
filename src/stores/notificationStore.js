// store/notificationsStore.js
import { create } from "zustand";
import { apiClient } from '@/utils/apiClient';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,

  fetchNotifications: async (userId) => {
    console.log('fea')
    set({ loading: true });
    try {
      const data = await apiClient('/api/notifications/getNotifications', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      console.log(data, 'notificationsnotifications')
      set({ notifications: data, loading: false });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ loading: false });
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },

  // إضافة إشعار من WebSocket مع التحقق من التكرار
  addNotificationFromSocket: (notification) => {
    set((state) => {
      // التأكد من أن notifications هو array
      const notificationsList = Array.isArray(state.notifications)
        ? state.notifications
        : (state.notifications?.notifications || []);

      // التحقق من عدم وجود الإشعار مسبقاً
      const exists = notificationsList.some(n => n.id === notification.id);
      if (exists) {
        console.log('⚠️ Notification already exists:', notification.id);
        return state;
      }
      // إذا كان notifications object، نحافظ على البنية
      if (!Array.isArray(state.notifications) && state.notifications?.notifications) {
        const updatedNotifications = {
          ...state.notifications,
          notifications: [notification, ...notificationsList]
        };
        console.log('📦 Updated notifications object:', updatedNotifications);
        return {
          notifications: updatedNotifications
        };
      }
      // إذا كان array عادي
      return {
        notifications: [notification, ...notificationsList],
      };
    });
  },

  // تحديث حالة إشعار محدد
  updateNotificationStatus: (notificationId, updates) => {
    set((state) => {
      const notificationsList = Array.isArray(state.notifications)
        ? state.notifications
        : (state.notifications?.notifications || []);

      const updatedList = notificationsList.map((n) =>
        n.id === notificationId ? { ...n, ...updates } : n
      );

      // إذا كان notifications object
      if (!Array.isArray(state.notifications) && state.notifications?.notifications) {
        return {
          notifications: {
            ...state.notifications,
            notifications: updatedList
          }
        };
      }

      // إذا كان array عادي
      return {
        notifications: updatedList,
      };
    });
  },

  // حذف إشعار محدد
  removeNotification: (notificationId) => {
    set((state) => {
      const notificationsList = Array.isArray(state.notifications)
        ? state.notifications
        : (state.notifications?.notifications || []);

      const filteredList = notificationsList.filter((n) => n.id !== notificationId);

      // إذا كان notifications object
      if (!Array.isArray(state.notifications) && state.notifications?.notifications) {
        return {
          notifications: {
            ...state.notifications,
            notifications: filteredList
          }
        };
      }

      // إذا كان array عادي
      return {
        notifications: filteredList,
      };
    });
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
    }));
  },

  clearNotifications: async () => {
    try {
      await apiClient('/api/notifications/clearAll', {
        method: 'POST'
      });
      set({ notifications: [] });
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  },
}));

export default useNotificationStore;
