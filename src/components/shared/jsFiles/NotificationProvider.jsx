"use client";
import React, { createContext, useState, useContext } from "react";
import { Message } from "rsuite";


// إنشاء سياق الإشعارات
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // دفع إشعار جديد
  const pushNotification = (type, content) => {
    const id = Date.now();
    const newNotification = {
      id,
      component: (
        <Message type={type} style={{
          background:'red'
        }} closable  >
          {content || `${type}`}
        </Message>
      ),
    };

    setNotifications((prev) => [...prev, newNotification]);

    // إزالة الإشعار تلقائيًا بعد 3 ثوانٍ
    setTimeout(() => {
      setNotifications((prev) => prev.filter((msg) => msg.id !== id));
    }, 2000);
  };

  return (
    <NotificationContext.Provider value={{ notifications, pushNotification }}>
      {children}
      {/* عرض الإشعارات في مكان ثابت (مثل الزاوية) */}
      <div style={{ display:"flex", gap:'5px', flexDirection:"column", position: "fixed", bottom:"5px", left:"5px", zIndex: 1050}}>
        {notifications.map((notification) => (
          <div key={notification.id}>{notification.component}</div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Hook لاستخدام الإشعارات في أي مكون
export const useNotification = () => {
  return useContext(NotificationContext);
};