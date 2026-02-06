// hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = (userId, clinicId) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // إنشاء اتصال WebSocket
    const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    const socket = socketRef.current;

    // مراقبة جميع الأحداث الواردة للتشخيص
    socket.onAny((eventName, ...args) => {
      // مراقبة خاصة لإنشاء التقارير
      if (eventName === 'report_created_realtime') {
        // ...existing code...
      }
      // مراقبة خاصة لحذف التقارير
      if (eventName === 'report_deleted_realtime' || eventName === 'report_deleted_detailed_realtime' || eventName === 'report_deleted_notification' || eventName === 'report_deleted') {
        // ...existing code...
      }
    });

    // عند الاتصال
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      // دخول العيادة
      socket.emit('user_login', {
        userId,
        clinicId
      });
    });

    // عند إعادة الاتصال
    socket.on('reconnect', (attemptNumber) => {
      setIsConnected(true);
      setConnectionStatus('reconnected');
      // إعادة دخول العيادة
      socket.emit('user_login', {
        userId,
        clinicId
      });
    });

    // عند قطع الاتصال
    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    // عند حدوث خطأ
    socket.on('connect_error', (error) => {
      setConnectionStatus('error');
    });

    // نجاح دخول العيادة
    socket.on('login_success', (data) => {
      setConnectionStatus('joined_clinic');
    });

    // خطأ في دخول العيادة
    socket.on('login_error', (error) => {
      setConnectionStatus('error');
    });

    // نجاح اختيار المريض
    socket.on('patient_selection_success', (data) => {
      // لا حاجة لشيء هنا حالياً
    });

    // خطأ في اختيار المريض
    socket.on('patient_selection_error', (error) => {
      // لا حاجة لشيء هنا حالياً
    });

    // استماع لتغييرات التقارير من Supabase Realtime
    socket.on('report_status_changed_realtime', (data) => {
      // التحقق من صحة البيانات
      if (!data.reportId) {
        return;
      }
      if (!data.newStatus) {
        return;
      }
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'report_status_changed_realtime',
        message: `تقرير ${data.patientName} تغيرت حالته من ${data.oldStatus} إلى ${data.newStatus}`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لتغييرات التقارير المفصلة من Supabase Realtime
    socket.on('report_status_changed_detailed_realtime', (data) => {
      // التحقق من صحة البيانات
      if (!data.reportId) {
        return;
      }
      if (!data.newStatus) {
        return;
      }
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'report_status_changed_detailed_realtime',
        message: `تقرير ${data.patientName} تغيرت حالته من ${data.oldStatus} إلى ${data.newStatus}`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لإنشاء تقارير جديدة من Supabase Realtime
    socket.on('report_created_realtime', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'report_created_realtime',
        message: data.message || `تم إنشاء تقرير جديد للمريض ${data.patientName}`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لإنشاء تقارير جديدة من Server Notification
    socket.on('report_created_notification', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'report_created_notification',
        message: `تم إنشاء تقرير جديد`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لإنشاء تقارير جديدة (عام)
    socket.on('report_created', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'report_created',
        message: `تم إنشاء تقرير جديد للمريض`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لحذف التقارير من Supabase Realtime
    socket.on('report_deleted_realtime', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'report_deleted_realtime',
        message: data.message || `تم حذف تقرير ${data.reportType}`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لحذف التقارير المفصل من Supabase Realtime
    socket.on('report_deleted_detailed_realtime', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'report_deleted_detailed_realtime',
        message: data.message || `تم حذف تقرير ${data.reportType} بواسطة ${data.deletedBy}`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لحذف التقارير من Server Notification
    socket.on('report_deleted_notification', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'report_deleted_notification',
        message: data.message || `تم حذف تقرير ${data.reportType}`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لحذف التقارير (عام)
    socket.on('report_deleted', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'report_deleted',
        message: `تم حذف تقرير ${data.reportType}`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لانضمام مستخدمين
    socket.on('user_joined_clinic', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'user_joined',
        message: `انضم مستخدم جديد للعيادة`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لمغادرة مستخدمين
    socket.on('user_left_clinic', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'user_left',
        message: `غادر مستخدم العيادة`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لتحديثات المريض
    socket.on('patient_updated_notification', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'patient_updated',
        message: `تم تحديث بيانات المريض`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لتحديثات المريض المفصلة
    socket.on('report_status_changed_detailed_realtime', (data) => {
      // ...existing code...
    });

    // استماع لإنشاء التقارير
    socket.on('report_created_notification', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'report_created_notification',
        message: `تم إنشاء تقرير جديد`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لتغيير حالة التقارير
    socket.on('report_status_changed_notification', (data) => {
      // التحقق من صحة البيانات
      if (!data.reportId) {
        return;
      }
      if (!data.newStatus) {
        return;
      }
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'report_status',
        message: `تقرير تغيرت حالته من ${data.oldStatus} إلى ${data.newStatus}`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لتغيير حالة التقارير المفصل
    socket.on('report_status_changed_detailed', (data) => {
      // ...existing code...
    });

    // استماع للرسائل الجديدة
    socket.on('new_message', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'new_message',
        message: `رسالة جديدة من ${data.senderName}`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع للرسائل الخاصة بالمريض
    socket.on('new_patient_message', (data) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'patient_message',
        message: `رسالة جديدة للمريض من ${data.senderName}`,
        data,
        timestamp: new Date()
      }]);
    });

    // استماع لنشاط المستخدم
    socket.on('user_activity_update', (data) => {
      // ...existing code...
    });

    // استماع لمؤشر الكتابة
    socket.on('user_typing', (data) => {
      // ...existing code...
    });

    // تنظيف عند إلغاء الـ component
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, clinicId]);

  // مراقبة الإشعارات للتشخيص
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
    }
  }, [notifications]);

  // دالة لاختيار مريض
  const selectPatient = (patientId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('select_patient', {
        userId,
        clinicId,
        patientId
      });
    }
  };

  // دالة لإرسال رسالة
  const sendMessage = (message, patientId = null) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', {
        clinicId,
        patientId,
        message,
        senderId: userId,
        senderName: 'User'
      });
    }
  };

  // دالة لتحديث نشاط المستخدم
  const updateActivity = (activity) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('user_activity', {
        userId,
        clinicId,
        activity
      });
    }
  };

  // دالة لإرسال مؤشر الكتابة
  const sendTypingIndicator = (isTyping, patientId = null) => {
    if (socketRef.current && isConnected) {
      const event = isTyping ? 'typing_start' : 'typing_stop';
      socketRef.current.emit(event, {
        clinicId,
        patientId,
        userId
      });
    }
  };

  // دالة لحذف الإشعارات
  const clearNotifications = () => {
    setNotifications([]);
  };

  // دالة لحذف إشعار واحد
  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return {
    socket: socketRef.current,
    isConnected,
    connectionStatus,
    notifications,
    selectPatient,
    sendMessage,
    updateActivity,
    sendTypingIndicator,
    clearNotifications,
    removeNotification
  };
};