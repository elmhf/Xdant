import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useUserStore from "@/components/features/profile/store/userStore";
import { usePatientStore } from '@/stores/patientStore';

// Badel l URL kanou mokhtalef fi production
const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:5000';

export const usePatientWebSocket = (patientId, userId, clinicId) => {
  const [wsConnected, setWsConnected] = useState(false);
  const socketRef = useRef(null);

  // Njibou user mil store
  const user = useUserStore((state) => state.userInfo);
  const store = usePatientStore();

  useEffect(() => {
    // Manconnectiw ken ma ebdech 3anna l ma3loumat lkol
    console.log(" 🐍patientId", patientId);
    console.log("🐍userId", userId);
    console.log("🐍clinicId", clinicId);
    if (!userId || !clinicId || !patientId) return;

    // 1. Connect
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      setWsConnected(true);

      // 2. Join Room
      socket.emit('select_patient', {
        userId,
        clinicId,
        patientId
      });
      console.log(`📡 Joined patient room: ${patientId}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
      setWsConnected(false);
    });

    // 3. Listen for Updates & Update Store

    // A. New Report
    socket.on('report_created_realtime', (data) => {
      console.log('🔔 Report created:', data);
      if (data && data.report) {
        store.addReport(data.report);
      }
    });

    // B. Status Changed
    socket.on('report_status_changed_detailed_realtime', (data) => {
      console.log('🔄 Report status changed:', data);
      if (data && data.reportId) {
        // Houni n-updatiw l report specific
        store.updateReport(data.reportId, {
          status: data.newStatus,
          // Ay haja okhra t7eb tbaddalha
        });
      }
    });

    // C. Deleted
    socket.on('report_deleted_detailed_realtime', (data) => {
      console.log('🗑️ Report deleted:', data);
      if (data && data.reportId) {
        store.removeReport(data.reportId);
      }
    });

    // D. Patient Info Updated
    socket.on('updated_patient', (data) => {
      console.log('👤 Patient info updated (updated_patient):', data);
      if (data) {
        // If data is the patient object itself
        if (data.id) {
          store.updatePatient(data);
        }
        // If data is wrapped in a property like { patient: ... }
        else if (data.patient) {
          store.updatePatient(data.patient);
        }
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [patientId, userId, clinicId]);

  return { wsConnected };
};
