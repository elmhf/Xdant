import { useEffect, useRef, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

export const usePatientWebSocket = (patientId, userId, clinicId) => {
  const [patientReports, setPatientReports] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  console.log('🏥 usePatientWebSocket Hook - Initializing with:', { 
    patientId, 
    userId, 
    clinicId 
  });
  
  // استخدام WebSocket الأساسي
  const {
    socket,
    isConnected,
    connectionStatus,
    notifications,
    selectPatient,
    clearNotifications,
    removeNotification,
    sendMessage,
    updateActivity,
    sendTypingIndicator
  } = useWebSocket(userId, clinicId);

  // اختيار المريض عند تغيير patientId
  useEffect(() => {
    console.log('👤 Patient selection effect triggered:', { 
      patientId, 
      isConnected 
    });
    
    if (patientId && isConnected) {
      console.log('📡 Selecting patient in WebSocket...');
      selectPatient(patientId);
    } else {
      console.log('⚠️ Cannot select patient:', { 
        hasPatientId: !!patientId, 
        isConnected 
      });
    }
  }, [patientId, isConnected, selectPatient]);

      // مراقبة الإشعارات المتعلقة بالمريض الحالي
    useEffect(() => {
      console.log('📊 Monitoring notifications for patient:', patientId);
      console.log('📋 Total notifications:', notifications.length);
      console.log('📋 All notifications types:', notifications.map(n => n.type));
      console.log('📋 All notifications details:', notifications.map(n => ({
        type: n.type,
        message: n.message,
        data: n.data,
        timestamp: n.timestamp
      })));
      
      // مراقبة خاصة لإنشاء التقارير
      const creationNotifications = notifications.filter(n => 
        n.type === 'report_created_realtime' || 
        n.type === 'report_created_notification' || 
        n.type === 'report_created'
      );
      
      if (creationNotifications.length > 0) {
        console.log('🎯 CREATION NOTIFICATIONS FOUND:', creationNotifications);
      }
      
      // مراقبة خاصة لحذف التقارير
      const deletionNotifications = notifications.filter(n => 
        n.type === 'report_deleted_realtime' || 
        n.type === 'report_deleted_notification' || 
        n.type === 'report_deleted' ||
        n.type === 'report_deleted_detailed_realtime'
      );
      
      if (deletionNotifications.length > 0) {
        console.log('🗑️ DELETION NOTIFICATIONS FOUND:', deletionNotifications);
      }
    
    const patientNotifications = notifications.filter(notification => {
      if (notification.type === 'report_status' || notification.type === 'report_status_changed_realtime' || notification.type === 'report_status_changed_detailed_realtime' || notification.type === 'report_status_changed_notification') {
        const isRelevant = notification.data.patientId === patientId ||
                          (notification.data.reportId && notification.data.reportId.includes(patientId));
        console.log('📊 Report status notification:', { 
          reportId: notification.data.reportId, 
          patientId: notification.data.patientId,
          currentPatientId: patientId,
          type: notification.type,
          isRelevant 
        });
        return isRelevant;
      }
      if (notification.type === 'report_created' || notification.type === 'report_created_notification' || notification.type === 'report_created_realtime') {
        const isRelevant = notification.data.patientId === patientId ||
                          (notification.data.reportId && notification.data.reportId.includes(patientId));
        console.log('📝 Report created notification:', { 
          reportId: notification.data.reportId, 
          patientId: notification.data.patientId,
          currentPatientId: patientId,
          isRelevant 
        });
        return isRelevant;
      }
      if (notification.type === 'report_deleted' || notification.type === 'report_deleted_notification' || notification.type === 'report_deleted_realtime' || notification.type === 'report_deleted_detailed_realtime') {
        const isRelevant = notification.data.patientId === patientId ||
                          (notification.data.reportId && notification.data.reportId.includes(patientId));
        console.log('🗑️ Report deleted notification:', { 
          reportId: notification.data.reportId, 
          patientId: notification.data.patientId,
          currentPatientId: patientId,
          type: notification.type,
          isRelevant 
        });
        return isRelevant;
      }
      if (notification.type === 'patient_updated') {
        const isRelevant = notification.data.patientId === patientId;
        console.log('📝 Patient updated notification:', { 
          patientId: notification.data.patientId,
          currentPatientId: patientId,
          isRelevant 
        });
        return isRelevant;
      }
      if (notification.type === 'patient_message') {
        const isRelevant = notification.data.patientId === patientId;
        console.log('💬 Patient message notification:', { 
          patientId: notification.data.patientId,
          currentPatientId: patientId,
          isRelevant 
        });
        return isRelevant;
      }
      
      // إذا وصل notification من نوع غير معروف
      console.log('❓ Unknown notification type:', {
        type: notification.type,
        data: notification.data,
        message: notification.message
      });
      return false;
    });

    console.log('🎯 Patient-specific notifications:', patientNotifications.length);
    console.log('🎯 Patient-specific notifications details:', patientNotifications);

    if (patientNotifications.length > 0) {
      const lastNotification = patientNotifications[patientNotifications.length - 1];
      console.log('🔄 Setting last update:', lastNotification);
      setLastUpdate(lastNotification);
      
      // تحديث التقارير إذا كان الإشعار يتعلق بتغيير الحالة (من Supabase Realtime)
      if (lastNotification.type === 'report_status_changed_realtime' || lastNotification.type === 'report_status_changed_detailed_realtime' || lastNotification.type === 'report_status_changed_notification') {
        console.log('📊 Updating report status (Realtime):', {
          reportId: lastNotification.data.reportId,
          oldStatus: lastNotification.data.oldStatus,
          newStatus: lastNotification.data.newStatus,
          patientName: lastNotification.data.patientName
        });
        
        setPatientReports(prevReports => {
          console.log('🔍 Current reports in state:', prevReports.map(r => ({ id: r.id, status: r.status, type: r.type })));
          console.log('🔍 Looking for report with ID:', lastNotification.data.reportId);
          
          const existingReport = prevReports.find(r => r.id === lastNotification.data.reportId);
          if (!existingReport) {
            console.log('⚠️ Report not found for status update:', lastNotification.data.reportId);
            console.log('🔍 Available report IDs:', prevReports.map(r => r.id));
            return prevReports;
          }
          
          console.log('✅ Found report for status update:', {
            id: existingReport.id,
            oldStatus: existingReport.status,
            newStatus: lastNotification.data.newStatus
          });
          
          const updatedReports = prevReports.map(report => {
            if (report.id === lastNotification.data.reportId) {
              console.log('✅ Updating report status (Realtime):', {
                id: report.id,
                oldStatus: report.status,
                newStatus: lastNotification.data.newStatus
              });
              return {
                ...report,
                status: lastNotification.data.newStatus,
                updatedAt: lastNotification.timestamp,
                // إضافة البيانات الجديدة إذا كانت متوفرة
                ...(lastNotification.data.report && {
                  reportUrl: lastNotification.data.report.report_url,
                  dataUrl: lastNotification.data.report.data_url,
                  reportType: lastNotification.data.report.raport_type
                })
              };
            }
            return report;
          });
          
          console.log('📋 Updated reports count (Realtime):', updatedReports.length);
          console.log('📋 Reports after status update:', updatedReports.map(r => ({ id: r.id, status: r.status, type: r.type })));
          return updatedReports;
        });
      }
      
      // إضافة تقرير جديد إذا كان الإشعار يتعلق بإنشاء تقرير (من Supabase Realtime)
      if (lastNotification.type === 'report_created_realtime') {
        console.log('📝 Adding new report (Realtime):', {
          reportId: lastNotification.data.reportId,
          patientId: lastNotification.data.patientId,
          reportType: lastNotification.data.reportType,
          status: lastNotification.data.status,
          patientName: lastNotification.data.patientName,
          message: lastNotification.data.message
        });
        
        const newReport = {
          id: lastNotification.data.reportId,
          patientId: lastNotification.data.patientId,
          type: lastNotification.data.reportType,
          status: lastNotification.data.status || 'pending',
          createdAt: lastNotification.timestamp,
          updatedAt: lastNotification.timestamp,
          // إضافة البيانات الجديدة إذا كانت متوفرة
          ...(lastNotification.data.report && {
            reportUrl: lastNotification.data.report.report_url,
            dataUrl: lastNotification.data.report.data_url,
            reportType: lastNotification.data.report.raport_type,
            created_at: lastNotification.data.report.created_at
          }),
          // إضافة معلومات إضافية
          patientName: lastNotification.data.patientName,
          clinicId: lastNotification.data.clinicId,
          message: lastNotification.data.message
        };
        
        setPatientReports(prevReports => {
          // التحقق من عدم وجود التقرير مسبقاً
          const existingReport = prevReports.find(r => r.id === lastNotification.data.reportId);
          if (existingReport) {
            console.log('⚠️ Report already exists:', lastNotification.data.reportId);
            return prevReports;
          }
          
          console.log('➕ Adding new report to state:', {
            id: newReport.id,
            type: newReport.type,
            status: newReport.status,
            patientName: newReport.patientName
          });
          
          const updatedReports = [...prevReports, newReport];
          console.log('📋 Total reports after adding new (Realtime):', updatedReports.length);
          return updatedReports;
        });
      }
      
      // إضافة تقرير جديد إذا كان الإشعار يتعلق بإنشاء تقرير (من Server Notification)
      if (lastNotification.type === 'report_created_notification') {
        console.log('📝 Adding new report (Server Notification):', {
          reportId: lastNotification.data.reportId,
          patientId: lastNotification.data.patientId,
          reportType: lastNotification.data.reportType,
          createdBy: lastNotification.data.createdBy
        });
        
        const newReport = {
          id: lastNotification.data.reportId,
          patientId: lastNotification.data.patientId,
          type: lastNotification.data.reportType,
          status: 'pending', // عادة التقارير الجديدة تكون pending
          createdBy: lastNotification.data.createdBy,
          createdAt: lastNotification.timestamp,
          updatedAt: lastNotification.timestamp
        };
        
        setPatientReports(prevReports => {
          // التحقق من عدم وجود التقرير مسبقاً
          const existingReport = prevReports.find(r => r.id === lastNotification.data.reportId);
          if (existingReport) {
            console.log('⚠️ Report already exists:', lastNotification.data.reportId);
            return prevReports;
          }
          
          console.log('➕ Adding new report to state (Server Notification):', {
            id: newReport.id,
            type: newReport.type,
            status: newReport.status
          });
          
          const updatedReports = [...prevReports, newReport];
          console.log('📋 Total reports after adding new (Server Notification):', updatedReports.length);
          return updatedReports;
        });
      }
      
      // تحديث التقارير إذا كان الإشعار يتعلق بتغيير الحالة (عام)
      if (lastNotification.type === 'report_status') {
        console.log('📊 Updating report status (General):', {
          reportId: lastNotification.data.reportId,
          oldStatus: lastNotification.data.oldStatus,
          newStatus: lastNotification.data.newStatus
        });
        
        setPatientReports(prevReports => {
          console.log('🔍 Current reports in state (General):', prevReports.map(r => ({ id: r.id, status: r.status, type: r.type })));
          console.log('🔍 Looking for report with ID (General):', lastNotification.data.reportId);
          
          const existingReport = prevReports.find(r => r.id === lastNotification.data.reportId);
          if (!existingReport) {
            console.log('⚠️ Report not found for status update (General):', lastNotification.data.reportId);
            console.log('🔍 Available report IDs (General):', prevReports.map(r => r.id));
            return prevReports;
          }
          
          console.log('✅ Found report for status update (General):', {
            id: existingReport.id,
            oldStatus: existingReport.status,
            newStatus: lastNotification.data.newStatus
          });
          
          const updatedReports = prevReports.map(report => {
            if (report.id === lastNotification.data.reportId) {
              console.log('✅ Updating report status (General):', {
                id: report.id,
                oldStatus: report.status,
                newStatus: lastNotification.data.newStatus
              });
              return {
                ...report,
                status: lastNotification.data.newStatus,
                updatedAt: lastNotification.timestamp
              };
            }
            return report;
          });
          
          console.log('📋 Updated reports count (General):', updatedReports.length);
          console.log('📋 Reports after status update (General):', updatedReports.map(r => ({ id: r.id, status: r.status, type: r.type })));
          return updatedReports;
        });
      }
      
      // إضافة تقرير جديد إذا كان الإشعار يتعلق بإنشاء تقرير (عام)
      if (lastNotification.type === 'report_created') {
        console.log('📝 Adding new report (General):', {
          reportId: lastNotification.data.reportId,
          patientId: lastNotification.data.patientId,
          reportType: lastNotification.data.reportType,
          status: lastNotification.data.status
        });
        
        const newReport = {
          id: lastNotification.data.reportId,
          patientId: lastNotification.data.patientId,
          type: lastNotification.data.reportType,
          status: lastNotification.data.status || 'pending',
          createdAt: lastNotification.timestamp,
          updatedAt: lastNotification.timestamp
        };
        
        setPatientReports(prevReports => {
          // التحقق من عدم وجود التقرير مسبقاً
          const existingReport = prevReports.find(r => r.id === lastNotification.data.reportId);
          if (existingReport) {
            console.log('⚠️ Report already exists:', lastNotification.data.reportId);
            return prevReports;
          }
          
          console.log('➕ Adding new report to state (General):', {
            id: newReport.id,
            type: newReport.type,
            status: newReport.status
          });
          
          const updatedReports = [...prevReports, newReport];
          console.log('📋 Total reports after adding new (General):', updatedReports.length);
          return updatedReports;
        });
      }
      
      // حذف تقرير إذا كان الإشعار يتعلق بحذف تقرير (من Supabase Realtime)
      if (lastNotification.type === 'report_deleted_realtime' || lastNotification.type === 'report_deleted_notification' || lastNotification.type === 'report_deleted_detailed_realtime') {
        console.log('🗑️ Deleting report (Realtime):', {
          reportId: lastNotification.data.reportId,
          patientId: lastNotification.data.patientId,
          reportType: lastNotification.data.reportType,
          deletedBy: lastNotification.data.deletedBy
        });
        
        setPatientReports(prevReports => {
          const reportToDelete = prevReports.find(r => r.id === lastNotification.data.reportId);
          if (!reportToDelete) {
            console.log('⚠️ Report not found for deletion (Realtime):', lastNotification.data.reportId);
            console.log('📋 Available reports:', prevReports.map(r => r.id));
            return prevReports;
          }
          
          console.log('✅ Found report for deletion (Realtime):', {
            id: reportToDelete.id,
            type: reportToDelete.type || reportToDelete.raport_type,
            status: reportToDelete.status
          });
          
          const filteredReports = prevReports.filter(report => report.id !== lastNotification.data.reportId);
          console.log('📋 Reports after deletion (Realtime):', filteredReports.length);
          return filteredReports;
        });
      }
      
      // حذف تقرير إذا كان الإشعار يتعلق بحذف تقرير (من Server Notification)
      if (lastNotification.type === 'report_deleted_notification') {
        console.log('🗑️ Deleting report (Server Notification):', {
          reportId: lastNotification.data.reportId,
          patientId: lastNotification.data.patientId,
          reportType: lastNotification.data.reportType,
          deletedBy: lastNotification.data.deletedBy
        });
        
        setPatientReports(prevReports => {
          const reportToDelete = prevReports.find(r => r.id === lastNotification.data.reportId);
          if (!reportToDelete) {
            console.log('⚠️ Report not found for deletion (Server Notification):', lastNotification.data.reportId);
            console.log('📋 Available reports:', prevReports.map(r => r.id));
            return prevReports;
          }
          
          console.log('✅ Found report for deletion (Server Notification):', {
            id: reportToDelete.id,
            type: reportToDelete.type || reportToDelete.raport_type,
            status: reportToDelete.status
          });
          
          const filteredReports = prevReports.filter(report => report.id !== lastNotification.data.reportId);
          console.log('📋 Reports after deletion (Server Notification):', filteredReports.length);
          return filteredReports;
        });
      }
      
      // حذف تقرير إذا كان الإشعار يتعلق بحذف تقرير (عام)
      if (lastNotification.type === 'report_deleted') {
        console.log('🗑️ Deleting report (General):', {
          reportId: lastNotification.data.reportId,
          patientId: lastNotification.data.patientId,
          reportType: lastNotification.data.reportType
        });
        
        setPatientReports(prevReports => {
          const reportToDelete = prevReports.find(r => r.id === lastNotification.data.reportId);
          if (!reportToDelete) {
            console.log('⚠️ Report not found for deletion (General):', lastNotification.data.reportId);
            console.log('📋 Available reports:', prevReports.map(r => r.id));
            return prevReports;
          }
          
          console.log('✅ Found report for deletion (General):', {
            id: reportToDelete.id,
            type: reportToDelete.type || reportToDelete.raport_type,
            status: reportToDelete.status
          });
          
          const filteredReports = prevReports.filter(report => report.id !== lastNotification.data.reportId);
          console.log('📋 Reports after deletion (General):', filteredReports.length);
          return filteredReports;
        });
      }
      
      // حذف تقرير إذا كان الإشعار يتعلق بحذف تقرير (مفصل)
      if (lastNotification.type === 'report_deleted_detailed_realtime') {
        console.log('🗑️ Deleting report (Detailed Realtime):', {
          reportId: lastNotification.data.reportId,
          patientId: lastNotification.data.patientId,
          reportType: lastNotification.data.reportType,
          deletedBy: lastNotification.data.deletedBy
        });
        
        setPatientReports(prevReports => {
          const reportToDelete = prevReports.find(r => r.id === lastNotification.data.reportId);
          if (!reportToDelete) {
            console.log('⚠️ Report not found for deletion (Detailed Realtime):', lastNotification.data.reportId);
            console.log('📋 Available reports:', prevReports.map(r => r.id));
            return prevReports;
          }
          
          console.log('✅ Found report for deletion (Detailed Realtime):', {
            id: reportToDelete.id,
            type: reportToDelete.type || reportToDelete.raport_type,
            status: reportToDelete.status
          });
          
          const filteredReports = prevReports.filter(report => report.id !== lastNotification.data.reportId);
          console.log('📋 Reports after deletion (Detailed Realtime):', filteredReports.length);
          return filteredReports;
        });
      }
    } else {
      console.log('❌ No patient-specific notifications found!');
      console.log('🔍 Current filter criteria:', {
        patientId,
        notificationTypes: notifications.map(n => n.type),
        notificationPatientIds: notifications.map(n => n.data?.patientId)
      });
    }
  }, [notifications, patientId]);

  // دالة لتحديث تقرير محدد
  const updateReport = useCallback((reportId, updates) => {
    console.log('✏️ Updating report:', { reportId, updates });
    
    setPatientReports(prevReports => {
      const updatedReports = prevReports.map(report => {
        if (report.id === reportId) {
          console.log('✅ Found and updating report:', reportId);
          return {
            ...report,
            ...updates,
            updatedAt: new Date()
          };
        }
        return report;
      });
      
      console.log('📋 Reports after update:', updatedReports.length);
      return updatedReports;
    });
  }, []);

  // دالة لحذف تقرير
  const deleteReport = useCallback((reportId) => {
    console.log('🗑️ Deleting report:', reportId);
    
    setPatientReports(prevReports => {
      const filteredReports = prevReports.filter(report => report.id !== reportId);
      console.log('📋 Reports after deletion:', filteredReports.length);
      return filteredReports;
    });
  }, []);

  // دالة لإضافة تقرير جديد
  const addReport = useCallback((newReport) => {
    console.log('➕ Adding new report:', newReport);
    
    setPatientReports(prevReports => {
      const updatedReports = [...prevReports, newReport];
      console.log('📋 Total reports after adding:', updatedReports.length);
      return updatedReports;
    });
  }, []);

  // Log current state
  console.log('📊 Current Patient WebSocket State:', {
    patientId,
    isConnected,
    connectionStatus,
    patientReportsCount: patientReports.length,
    notificationsCount: notifications.length,
    hasLastUpdate: !!lastUpdate,
    hasActiveReports: patientReports.length > 0,
    pendingReports: patientReports.filter(r => r.status === 'pending').length,
    completedReports: patientReports.filter(r => r.status === 'completed').length
  });

  return {
    // حالة الاتصال
    isConnected,
    connectionStatus,
    
    // التقارير
    patientReports,
    lastUpdate,
    
    // الإشعارات
    notifications: notifications.filter(n => 
      n.type === 'report_status' || 
      n.type === 'report_status_changed_realtime' ||
      n.type === 'report_status_changed_detailed_realtime' ||
      n.type === 'report_status_changed_notification' ||
      n.type === 'report_created' || 
      n.type === 'report_created_notification' ||
      n.type === 'report_created_realtime' ||
      n.type === 'report_deleted' || 
      n.type === 'report_deleted_notification' ||
      n.type === 'report_deleted_realtime' ||
      n.type === 'report_deleted_detailed_realtime' ||
      n.type === 'patient_updated' || 
      n.type === 'patient_message'
    ),
    
    // الدوال
    updateReport,
    deleteReport,
    addReport,
    clearNotifications,
    removeNotification,
    sendMessage,
    updateActivity,
    sendTypingIndicator,
    
    // معلومات إضافية
    hasActiveReports: patientReports.length > 0,
    pendingReports: patientReports.filter(r => r.status === 'pending').length,
    completedReports: patientReports.filter(r => r.status === 'completed').length
  };
};