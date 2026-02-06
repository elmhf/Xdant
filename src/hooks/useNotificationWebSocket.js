// hooks/useNotificationWebSocket.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useNotificationStore from '@/stores/notificationStore';
import { changeTitle } from '@/utils/titleUtils';

/**
 * Hook لإدارة WebSocket الخاص بالإشعارات
 * @param {string} userId - معرف المستخدم
 * @param {string} clinicId - معرف العيادة (اختياري)
 * @returns {Object} حالة الاتصال والدوال المتاحة
 */
export const useNotificationWebSocket = (userId, clinicId = null) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // مرجع لملف الصوت - يتم إنشاؤه فقط في المتصفح
    const notificationSound = useRef(typeof window !== 'undefined' ? new Audio('/sounds/notificationSound.mp3') : null);

    // الحصول على دوال من notification store
    const { addNotificationFromSocket, updateNotificationStatus, removeNotification } = useNotificationStore();

    // دالة لتشغيل صوت الإشعار
    const playNotificationSound = () => {
        try {
            // التحقق من وجود الصوت (في حالة SSR)
            if (!notificationSound.current) {
                console.log('⚠️ Audio not available (SSR)');
                return;
            }

            notificationSound.current.currentTime = 0;
            notificationSound.current.volume = 1.0;
            notificationSound.current.play().catch(err => {
                console.log('⚠️ Could not play notification sound:', err);
            });
        } catch (error) {
            console.error('Error playing notification sound:', error);
        }
        console.log("playNotificationSound");
    };

    useEffect(() => {
        // التحقق من وجود userId
        if (!userId) {
            console.log('⚠️ No userId provided for notification WebSocket');
            return;
        }

        console.log('🔌 Initializing notification WebSocket for user:', userId);

        // إنشاء اتصال WebSocket
        const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || 'https://serverrouter.onrender.com';
        socketRef.current = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            query: {
                userId,
                type: 'notification' // تحديد نوع الاتصال
            }
        });

        const socket = socketRef.current;

        // عند الاتصال
        socket.on('connect', () => {
            console.log('✅ WebSocket connected for notifications');
            setIsConnected(true);
            setConnectionStatus('connected');

            // الدخول في room خاص بالإشعارات
            const notificationRoom = `notifications:user:${userId}`;
            console.log('🚪 Joining notification room:', notificationRoom);

            socket.emit('join_notification_room', {
                userId,
            });

            // تسجيل المستخدم لاستقبال الإشعارات (للتوافق مع الخوادم القديمة)
            socket.emit('register_for_notifications', { userId, clinicId });
        });

        // عند إعادة الاتصال
        socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 WebSocket reconnected after ${attemptNumber} attempts`);
            setIsConnected(true);
            setConnectionStatus('reconnected');

            // إعادة الدخول في room الإشعارات
            const notificationRoom = `notifications:user:${userId}`;
            console.log('🚪 Rejoining notification room:', notificationRoom);

            socket.emit('join_notification_room', {
                userId,
            });

            // إعادة تسجيل المستخدم
            socket.emit('register_for_notifications', { userId });
        });

        // عند قطع الاتصال
        socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            setIsConnected(false);
            setConnectionStatus('disconnected');
        });

        // عند حدوث خطأ
        socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error);
            setConnectionStatus('error');
        });

        // تأكيد الانضمام لـ notification room
        socket.on('notification_room_joined', (data) => {
            console.log('✅ Notification room joined successfully:', data);
            setConnectionStatus('room_joined');
        });

        // خطأ في الانضمام لـ notification room
        socket.on('notification_room_error', (error) => {
            console.error('❌ Failed to join notification room:', error);
            setConnectionStatus('room_error');
        });

        // استقبال إشعار جديد
        socket.on('new_notification', (notification) => {
            console.log('🔔 New notification received:', notification);

            // إضافة الإشعار إلى الـ store
            if (addNotificationFromSocket) {
                addNotificationFromSocket(notification);
            }


            // تشغيل صوت الإشعار
            playNotificationSound();
            changeTitle('New Notification', 3000);
            // تغيير عنوان الصفحة مؤقتاً
        });

        // تحديث حالة قراءة الإشعار
        socket.on('notification_read', (data) => {
            console.log('👁️ Notification marked as read:', data);

            if (updateNotificationStatus) {
                updateNotificationStatus(data.notificationId, { read_at: data.readAt });
            }
        });

        // حذف إشعار
        socket.on('notification_deleted', (data) => {
            console.log('🗑️ Notification deleted:', data);

            if (removeNotification) {
                removeNotification(data.notificationId);
            }
        });

        // مسح جميع الإشعارات
        socket.on('bulk_notifications_cleared', (data) => {
            console.log('🗑️ All notifications cleared for user:', data.userId);

            // سيتم التعامل مع هذا في الـ store
        });

        // استقبال دعوة جديدة
        socket.on('new_invitation', (invitation) => {
            console.log('📨 New invitation received:', invitation);

            // تحويل الدعوة إلى إشعار
            const notification = {
                id: invitation.id || Date.now(),
                type: 'invitation',
                title: 'New Invitation',
                message: invitation.message,
                meta_data: invitation.meta_data,
                token: invitation.token,
                created_at: invitation.created_at || new Date().toISOString(),
                read_at: null
            };

            if (addNotificationFromSocket) {
                addNotificationFromSocket(notification);
            }
        });

        // استقبال تحديث تقرير
        socket.on('report_status_updated', (data) => {
            console.log('📊 Report status updated:', data);

            const notification = {
                id: Date.now(),
                type: 'report_update',
                title: 'Report Status Updated',
                message: `Report status changed to ${data.newStatus}`,
                meta_data: {
                    reportId: data.reportId,
                    patientId: data.patientId,
                    oldStatus: data.oldStatus,
                    newStatus: data.newStatus
                },
                created_at: new Date().toISOString(),
                read_at: null
            };

            if (addNotificationFromSocket) {
                addNotificationFromSocket(notification);
            }
        });

        // تنظيف عند إلغاء الـ component
        return () => {
            console.log('🔌 Disconnecting notification WebSocket');
            if (socket) {
                const notificationRoom = `notifications:user:${userId}`;
                console.log('🚪 Leaving notification room:', notificationRoom);

                // الخروج من room الإشعارات
                socket.emit('leave_notification_room', {
                    userId,
                    room: notificationRoom
                });

                socket.emit('unregister_from_notifications', { userId });
                socket.disconnect();
            }
        };
    }, [userId, addNotificationFromSocket, updateNotificationStatus, removeNotification]);

    // دالة لإرسال إشارة بأن الإشعار تم قراءته
    const markAsRead = (notificationId) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('mark_notification_read', {
                userId,
                notificationId
            });
        }
    };

    // دالة لحذف إشعار
    const deleteNotification = (notificationId) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('delete_notification', {
                userId,
                notificationId
            });
        }
    };

    // دالة لمسح جميع الإشعارات
    const clearAllNotifications = () => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('clear_all_notifications', {
                userId
            });
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        connectionStatus,
        markAsRead,
        deleteNotification,
        clearAllNotifications
    };
};
