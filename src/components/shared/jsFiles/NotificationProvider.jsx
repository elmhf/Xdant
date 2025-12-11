"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, X, AlertTriangle } from "lucide-react";

const NotificationContext = createContext();

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
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
          {type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notification'}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {content}
        </p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const pushNotification = (type, content) => {
    const id = Date.now();
    const newNotification = { id, type, content };

    setNotifications((prev) => [...prev, newNotification]);

    // Remove automatically after 4 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 4000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((msg) => msg.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, pushNotification }}>
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
  return useContext(NotificationContext);
};