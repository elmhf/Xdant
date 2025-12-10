"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useReportData } from './hook/useReportData';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, MapPin, Calendar, Users, Heart, Loader2, Plus, Wifi, WifiOff } from "lucide-react";
import useUserStore from "@/components/features/profile/store/userStore";
import { formatPatientName, formatDateOfBirth, getPatientAvatarInitials } from '../utils/patientUtils';
import AddDoctorDialog from '../components/AddDoctorDialog';
import { DeleteDoctorDialog } from '../components/DeleteDoctorDialog';
import EditPatientDialog from '../components/EditPatientDialog';
import OrderAIReport from '../components/OrderAIReport';
import AIOrdersList from '../components/AIOrdersList';
import { usePatientWebSocket } from '../hooks/usePatientWebSocket';
import Lottie from "lottie-react";
import {
  usePatientStore,
  useCurrentPatient,
  useReports as useReportsSelector,
  useReportsLoading,
  useWsConnection,
  useReportsStats,
  useFilteredReports
} from '@/stores/patientStore';
import { useDentalStore } from '@/stores/dataStore';
import ReportComments from '../components/ReportComments';

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 'Unknown';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export default function PatientDetailPage() {
  // Add useReportData hook instance
  const reportData = useReportData();
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId;
  const resetDentalStore = useDentalStore(state => state.resetData);

  // Clear dental store data when entering patient detail page
  useEffect(() => {
    // 1. Reset Zustand store state
    resetDentalStore();
    console.log("🧹 Dental store reset on patient page entry");

    // 2. Clear storage manually to be 100% sure
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dental-storage');
      localStorage.removeItem('dental-storage');
      console.log("🧹 Storage keys cleared (session & local)");
    }
  }, []); // Run once on mount

  // استخدام selectors محسنة للأداء
  const currentPatient = useCurrentPatient();
  const reports = useReportsSelector();
  console.log(reports, "reportsreports")
  const loading = usePatientStore(state => state.loading);
  const error = usePatientStore(state => state.error);
  const reportsLoading = useReportsLoading();
  const favoriteLoading = usePatientStore(state => state.favoriteLoading);
  const deleteDoctorLoading = usePatientStore(state => state.deleteDoctorLoading);
  const deleteDoctorMessage = usePatientStore(state => state.deleteDoctorMessage);
  const isAddDoctorOpen = usePatientStore(state => state.isAddDoctorOpen);
  const isDeleteDoctorOpen = usePatientStore(state => state.isDeleteDoctorOpen);
  const isEditPatientOpen = usePatientStore(state => state.isEditPatientOpen);
  const doctorToDelete = usePatientStore(state => state.doctorToDelete);

  // استخدام actions من store
  const store = usePatientStore();

  // WebSocket setup
  const user = useUserStore.getState().user;
  const userId = user?.id || 'anonymous';
  const clinicId = user?.clinic_id || 'default-clinic';

  console.log('🏥 Patient Page - WebSocket Setup:', {
    patientId,
    userId,
    clinicId,
    user: user ? 'User found' : 'No user'
  });

  // استخدام WebSocket للمريض
  const {
    isConnected: wsConnected,
    connectionStatus: wsConnectionStatus,
    patientReports: wsPatientReports,
    lastUpdate: wsLastUpdate,
    notifications: wsNotifications,
    updateReport: wsUpdateReport,
    addReport: wsAddReport,
    deleteReport: wsDeleteReport,
    clearNotifications: wsClearNotifications,
    removeNotification: wsRemoveNotification,
    hasActiveReports: wsHasActiveReports,
    pendingReports: wsPendingReports,
    completedReports: wsCompletedReports
  } = usePatientWebSocket(patientId, userId, clinicId);

  console.log('📊 WebSocket Status in Patient Page:', {
    isConnected: wsConnected,
    connectionStatus: wsConnectionStatus,
    patientReportsCount: wsPatientReports.length,
    notificationsCount: wsNotifications.length,
    hasLastUpdate: !!wsLastUpdate,
    pendingReports: wsPendingReports,
    completedReports: wsCompletedReports
  });

  // Update WebSocket connection status in store
  useEffect(() => {
    const store = usePatientStore.getState();
    if (store.wsConnected !== wsConnected || store.wsConnectionStatus !== wsConnectionStatus) {
      store.setWsConnection(wsConnected, wsConnectionStatus);
    }
  }, [wsConnected, wsConnectionStatus]);

  // Update WebSocket last update in store
  useEffect(() => {
    if (wsLastUpdate && wsLastUpdate.timestamp) {
      const store = usePatientStore.getState();
      if (!store.wsLastUpdate || store.wsLastUpdate.timestamp !== wsLastUpdate.timestamp) {
        store.setWsLastUpdate(wsLastUpdate);
      }
    }
  }, [wsLastUpdate?.timestamp]);

  // معالجة تحديثات WebSocket
  useEffect(() => {
    console.log('🔄 Syncing WebSocket Reports Update Effect:', {
      wsPatientReportsCount: wsPatientReports.length,
      currentReportsCount: reports.length
    });

    if (wsPatientReports.length > 0) {

      // دمج تقارير WebSocket مع التقارير المحلية مع تحديث الحالات
      const updatedReports = reports.map(localReport => {
        // البحث عن التقرير المقابل في WebSocket reports
        const wsReport = wsPatientReports.find(ws => ws.id === localReport.id);
        if (wsReport) {
          return {
            ...localReport,
            status: wsReport.status,
            updatedAt: wsReport.updatedAt || wsReport.updated_at,
            // إضافة البيانات الجديدة من WebSocket
            ...(wsReport.reportUrl && { reportUrl: wsReport.reportUrl }),
            ...(wsReport.dataUrl && { dataUrl: wsReport.dataUrl }),
            ...(wsReport.reportType && { reportType: wsReport.reportType }),
            ...(wsReport.patientName && { patientName: wsReport.patientName }),
            ...(wsReport.message && { message: wsReport.message })
          };
        }
        return localReport;
      });

      // إضافة التقارير الجديدة من WebSocket
      const existingReportIds = new Set(reports.map(r => r.id));
      const newReports = wsPatientReports.filter(report => !existingReportIds.has(report.id));

      console.log('📋 Reports sync:', {
        existingCount: reports.length,
        updatedCount: updatedReports.length,
        newReportsCount: newReports.length,
        totalAfterSync: updatedReports.length + newReports.length
      });

      // تحديث التقارير في الـ store
      const finalReports = [...updatedReports, ...newReports];
      if (finalReports.length !== reports.length ||
        JSON.stringify(finalReports.map(r => ({ id: r.id, status: r.status }))) !==
        JSON.stringify(reports.map(r => ({ id: r.id, status: r.status })))) {
        usePatientStore.getState().setReports(finalReports);
      }
    }
  }, [wsPatientReports]); // إزالة reports من dependency array

  // معالجة آخر تحديث
  useEffect(() => {
    if (wsLastUpdate && wsLastUpdate.timestamp) {
      console.log('🔄 Last WebSocket update:', {
        type: wsLastUpdate.type,
        timestamp: wsLastUpdate.timestamp,
        data: wsLastUpdate.data
      });

      // معالجة خاصة لتحديث الحالة
      if (
        wsLastUpdate.type === 'report_status_changed_realtime' ||
        wsLastUpdate.type === 'report_status_changed_detailed_realtime' ||
        wsLastUpdate.type === 'report_status_changed_notification' ||
        wsLastUpdate.type === 'report_status'
      ) {
        console.log('📊 Processing status change in patient page:', {
          reportId: wsLastUpdate.data.reportId,
          oldStatus: wsLastUpdate.data.oldStatus,
          newStatus: wsLastUpdate.data.newStatus
        });
        // تحديث التقرير في الـ store
        usePatientStore.getState().updateReport(wsLastUpdate.data.reportId, {
          status: wsLastUpdate.data.newStatus,
          updatedAt: wsLastUpdate.timestamp
        });
      }

      // معالجة خاصة لحذف التقارير (شامل جميع الأنواع)
      if (
        wsLastUpdate.type === 'report_deleted_realtime' ||
        wsLastUpdate.type === 'report_deleted' ||
        wsLastUpdate.type === 'report_deleted_detailed_realtime'
      ) {
        console.log('🗑️ Processing report deletion in patient page:', {
          reportId: wsLastUpdate.data.reportId,
          reportType: wsLastUpdate.data.reportType,
          deletedBy: wsLastUpdate.data.deletedBy,
          type: wsLastUpdate.type
        });
        if (wsLastUpdate.data && wsLastUpdate.data.reportId) {
          usePatientStore.getState().removeReport(wsLastUpdate.data.reportId);
          console.log('✅ Called removeReport for reportId:', wsLastUpdate.data.reportId);
        } else {
          console.warn('⚠️ No reportId found in wsLastUpdate.data for deletion');
        }
      }
    }
  }, [wsLastUpdate?.timestamp, wsLastUpdate?.type, wsLastUpdate?.data?.reportId]); // استخدام خصائص محددة بدلاً من الكائن كاملاً

  // Clear report cache on mount
  useEffect(() => {
    console.log('🗑️ Clearing report cache on mount');
    reportData.reset();
    reportData.clearCache();
  }, []);

  // Fetch patient data on mount
  useEffect(() => {
    if (patientId) {
      store.fetchPatient(patientId);
    }
  }, [patientId]);

  // Fetch additional reports from server if needed
  useEffect(() => {
    if (currentPatient?.id) {
      store.fetchReports(currentPatient.id);
    }
  }, [currentPatient?.id]); // إزالة store من dependency array

  const handleBack = useCallback(() => {
    router.push('/patient');
  }, [router]);

  const handleAddDoctor = useCallback(() => {
    store.openAddDoctorDialog();
  }, []); // إزالة store من dependency array

  const handleDeleteDoctor = useCallback((doctor) => {
    store.openDeleteDoctorDialog(doctor);
  }, []); // إزالة store من dependency array

  const handleConfirmDeleteDoctor = useCallback(async () => {
    if (!doctorToDelete || !currentPatient) return;

    const result = await store.deleteDoctor(doctorToDelete.id);
    if (result.success) {
      console.log('✅ Doctor deleted successfully');
    } else {
      console.error('❌ Failed to delete doctor:', result.message);
    }
  }, [doctorToDelete, currentPatient]); // إزالة store من dependency array

  const handleDoctorAdded = useCallback(async () => {
    // Refresh patient data after adding a doctor
    if (patientId) {
      await store.fetchPatient(patientId);
    }
  }, [patientId]); // إزالة store من dependency array

  const handlePatientUpdated = useCallback(async () => {
    // Refresh patient data after updating patient info
    if (patientId) {
      await store.fetchPatient(patientId);
    }
  }, [patientId]); // إزالة store من dependency array

  // تعديل: أضف التقرير الجديد مباشرة للـ state بدل إعادة جلب كل البيانات
  const handleReportCreated = useCallback((newReport) => {
    if (newReport) {
      store.addReport(newReport);
    }
  }, []); // لا داعي لاستعمال patientId هنا

  const handleToggleFavorite = useCallback(async () => {
    if (!currentPatient || favoriteLoading) return;

    const newFavoriteStatus = !currentPatient.isFavorite;
    const result = await store.toggleFavorite(currentPatient.id, newFavoriteStatus);

    if (!result.success) {
      console.error('Error toggling favorite:', result.message);
      alert(`Error: ${result.message}`);
    }
  }, [currentPatient, favoriteLoading]); // إزالة store من dependency array

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">

            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7564ed] mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chargement du patient
            </h2>
            <p className="text-gray-600 text-lg">
              Veuillez patienter pendant le chargement des informations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Erreur
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              {error}
            </p>
            <Button onClick={handleBack} className="bg-[#7564ed] hover:bg-[#6a4fd879] text-white">
              Retour aux patients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPatient) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Patient non trouvé
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              Le patient demandé n'existe pas.
            </p>
            <Button onClick={handleBack} className="bg-[#7564ed] hover:bg-[#6a4fd8] text-white">
              Retour aux patients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-transparent max-h-[calc(100vh-max(7vh,50px))] overflow-y-auto overflow-x-hidden p-2 scrollbar-hide" style={{
      scrollbarWidth: 'none', /* Firefox */
      msOverflowStyle: 'none', /* IE and Edge */
    }}>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
      {/* WebSocket Connection Status */}

      {/* Main Content */}
      <div className="">
        {/* Profile Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-4xl font-[700] text-gray-900">
                {formatPatientName(currentPatient)}
              </h3>
              <div className="flex items-center font-[500] space-x-3 text-gray-900">
                <span>{calculateAge(currentPatient.date_of_birth)} years</span>
                <span className="capitalize">{currentPatient.gender || 'Unknown'}</span>
                <span className="capitalize">{currentPatient.email || 'Unknown'}</span>
                <Button
                  onClick={store.openEditPatientDialog}
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 ">
          {/* Left Column - Cards */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Top Row - Doctor Cards */}
              {/* Treating doctors card */}
              <div className="bg-white rounded-lg p-[12px] shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-gray-950">Treating doctors</h2>
                  <Button
                    onClick={handleAddDoctor}
                    variant="ghost"
                    size="sm"
                    className=" p-0 border-0 border-white  text-[#7564ed] "
                  >
                    <Plus className="w-7 h-7 stroke-4 " />
                  </Button>
                </div>

                <div className="space-y-0">
                  {currentPatient.treating_doctors && currentPatient.treating_doctors.length > 0 ? (
                    currentPatient.treating_doctors.map((doctor, index) => (
                      <div key={doctor.id || index} className="flex items-center justify-between p-1 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {((doctor.first_name || '').slice(0, 1) +
                                (doctor.last_name || '').slice(0, 1)).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 text-l">
                              {doctor.first_name || ""} {doctor.last_name || ""}
                            </h5>
                            <p className="text-gray-500 text-xs"></p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteDoctor(doctor)}
                          variant="ghost"
                          size="sm"
                          className="p-1 border-0 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-6 h-6" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No doctors assigned
                    </div>
                  )}
                </div>
              </div>

              <ReportComments></ReportComments>
              {/* Bottom Row - Order AI Report */}
              <div className="">
                <OrderAIReport
                  patient={currentPatient}
                  onReportCreated={handleReportCreated}
                  addReportToState={handleReportCreated}
                />
              </div>

            </div>
          </div>

          {/* Right Column - AI Orders List */}
          <div className="lg:col-span-2">
            <AIOrdersList
              patient={currentPatient}
              reports={reports}
              loading={reportsLoading}
              onReportDeleted={store.removeReport}
              wsConnected={wsConnected}
              wsConnectionStatus={wsConnectionStatus}
              wsLastUpdate={wsLastUpdate}
            />
          </div>
        </div>
      </div>

      {/* Add Doctor Dialog */}
      <AddDoctorDialog
        isOpen={isAddDoctorOpen}
        onClose={store.closeAddDoctorDialog}
        onDoctorAdded={handleDoctorAdded}
        patient={currentPatient}
        currentTreatingDoctors={currentPatient?.treating_doctors || []}
      />

      {/* Edit Patient Dialog */}
      <EditPatientDialog
        isOpen={isEditPatientOpen}
        onClose={store.closeEditPatientDialog}
        onPatientUpdated={handlePatientUpdated}
        patient={currentPatient}
        hideTreatingDoctors={true}
      />

      {/* Delete Doctor Dialog */}
      <DeleteDoctorDialog
        open={isDeleteDoctorOpen}
        onOpenChange={(open) => {
          console.log(open, "openopen")
          if (!open) {
            store.closeDeleteDoctorDialog();
          }
        }}
        close={() => {
          store.closeDeleteDoctorDialog();
        }}
        doctor={doctorToDelete}
        patient={currentPatient}
        onConfirm={handleConfirmDeleteDoctor}
        loading={deleteDoctorLoading}
        message={deleteDoctorMessage}
      />
    </div>
  );
}