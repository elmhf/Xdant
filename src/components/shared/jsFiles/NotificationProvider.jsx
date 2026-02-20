"use client";
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, X, AlertTriangle, Loader2 } from "lucide-react";

const NotificationContext = createContext();

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  loading: <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />,
};

// Internal event emitter for global notifications
const listeners = new Set();
const notify = (type, content, options = {}) => {
  listeners.forEach(listener => listener(type, content, options));
};

/**
 * Global notification object that can be used outside of React components.
 */
export const notification = {
  success: (content, options) => notify('success', content, options),
  error: (content, options) => notify('error', content, options),
  info: (content, options) => notify('info', content, options),
  warning: (content, options) => notify('warning', content, options),
  loading: (content, options) => notify('loading', content, options),
  dismiss: (id) => notify('dismiss', null, { id }),
};

const Toast = ({ id, type, content, onClose }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className="flex items-start gap-4 p-4 w-[380px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl pointer-events-auto"
    >
      <div className="shrink-0 mt-0.5">
        {icons[type] || icons.info}
      </div>
      <div className="flex-1 pt-0.5">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none mb-1 capitalize">
          {type === 'error' ? 'Error' : type === 'success' ? 'Success' : type === 'loading' ? 'Loading' : 'Notification'}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {content}
        </p>
      </div>
      {type !== 'loading' && (
        <button
          onClick={() => onClose(id)}
          className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const pushNotification = useCallback((type, content, options = {}) => {
    const id = options.id || Date.now();
    const newNotification = { id, type, content };

    setNotifications((prev) => {
      const exists = prev.find(n => n.id === id);
      if (exists) {
        return prev.map(n => n.id === id ? newNotification : n);
      }
      return [...prev, newNotification];
    });

    if (type !== 'loading' && !options.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, options.duration || 4000);
    }

    return id;
  }, [removeNotification]);

  useEffect(() => {
    const handleGlobalNotification = (type, content, options) => {
      if (type === 'dismiss') {
        removeNotification(options.id);
      } else {
        pushNotification(type, content, options);
      }
    };

    listeners.add(handleGlobalNotification);
    return () => listeners.delete(handleGlobalNotification);
  }, [pushNotification, removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, pushNotification, removeNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <Toast
              key={notification.id}
              {...notification}
              onClose={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
