import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import useUserStore from "@/components/features/profile/store/userStore";
import { usePatientStore } from '@/stores/patientStore';

export const usePatientWebSocket = (patientId) => {
  const [wsConnected, setWsConnected] = useState(false);
  const user = useUserStore((state) => state.user);
  const store = usePatientStore();

  const userId = user?.id || 'anonymous';
  const clinicId = user?.clinic_id || 'default-clinic';

  useEffect(() => {
    if (!user || !patientId) return;

    // 1. Connect to Socket
    const socket = io('http://localhost:5000', {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      setWsConnected(true);

      // 2. Join Patient Room
      socket.emit('select_patient', {
        userId: user.id || userId,
        clinicId: user.clinic_id || clinicId,
        patientId: patientId
      });
      console.log('📡 Joined patient room:', patientId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
      setWsConnected(false);
    });

    // 3. Listen for Updates

    // A. New Report
    socket.on('report_created_realtime', (data) => {
      console.log('🔔 Report created:', data);
      if (data && data.report) {
        store.addReport(data.report);
      }
    });

    // B. Report Status Changed
    socket.on('report_status_changed_detailed_realtime', (data) => {
      console.log('🔄 Report status changed:', data);
      if (data && data.reportId) {
        store.updateReport(data.reportId, {
          status: data.newStatus,
          updatedAt: new Date().toISOString()
        });
      }
    });

    // C. Report Deleted
    socket.on('report_deleted_detailed_realtime', (data) => {
      console.log('🗑️ Report deleted:', data);
      if (data && data.reportId) {
        store.removeReport(data.reportId);
      }
    });

    // Cleanup
    return () => {
      console.log('🔌 Cleaning up WebSocket');
      socket.disconnect();
    };
  }, [patientId, user, userId, clinicId]); // Removed 'store' from deps to avoid unnecessary re-runs if store obj changes

  return { wsConnected };
};