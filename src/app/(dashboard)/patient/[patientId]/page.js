"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useReportData } from './hook/useReportData';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, MapPin, Calendar, Users, Heart, Loader2, Plus, Wifi, WifiOff } from "lucide-react";
import useUserStore from "@/components/features/profile/store/userStore";
import { formatPatientName, formatDateOfBirth, getPatientAvatarInitials } from '../utils/patientUtils';
import AddDoctorDialog from '../components/AddDoctorDialog';
import { DeleteTreatingDoctorDialog } from '../components/DeleteTreatingDoctorDialog';
import { DeletePatientDialog } from '../components/DeletePatientDialog';
import EditPatientDialog from '../components/EditPatientDialog';
import OrderAIReport from '../components/OrderAIReport';
import AIOrdersList from '../components/AIOrdersList';
import { usePatientWebSocket } from '../hooks/usePatientWebSocket';
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";
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
import useImageStore from "@/stores/ImageStore";
import ReportComments from '../components/reportComments';
import { FolderIcon } from "lucide-react";
import { DentalDateGroupCard } from './dental-data/components/DentalDateGroupCard';
import { useDentalData } from './dental-data/hooks/useDentalData';
import { FilePreviewDialog } from './dental-data/components/FilePreviewDialog';
import ErrorCard from "@/components/shared/ErrorCard";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('patient');
  // Add useReportData hook instance
  const reportData = useReportData();
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId;
  const resetDentalStore = useDentalStore(state => state.resetData);
  const resetImageStore = useImageStore(state => state.reset);
  const { pushNotification } = useNotification();

  // Clear dental store data when entering patient detail page
  useEffect(() => {
    // 1. Reset Zustand store state
    resetDentalStore();
    resetImageStore();
    console.log("🧹 Dental store reset on patient page entry");

    // 2. Clear storage manually to be 100% sure
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dental-storage');
      localStorage.removeItem('dental-storage');
      sessionStorage.removeItem('image-storage');
      localStorage.removeItem('image-storage');
      console.log("🧹 Storage keys cleared (session & local)");
    }
  }, []); // Run once on mount

  const {
    sortedDates,
    groupedFiles,
    helpers, // Expose helpers for child components if needed
    loading: dentalLoading
  } = useDentalData();

  const [selectedFile, setSelectedFile] = useState(null);

  // استخدام selectors محسنة للأداء
  const currentPatient = useCurrentPatient();
  const reports = useReportsSelector();
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

  // Delete Patient Dialog State
  const [isDeletePatientOpen, setIsDeletePatientOpen] = useState(false);
  const [deletePatientLoading, setDeletePatientLoading] = useState(false);

  // استخدام actions من store
  const store = usePatientStore();

  // WebSocket setup
  const user = useUserStore((state) => state.userInfo);
  const currentClinicId = useUserStore((state) => state.currentClinicId);
  const userId = user?.user_id || 'anonymous';
  const clinicId = currentClinicId || 'default-clinic';

  console.log('🏥 Patient Page - WebSocket Setup:', {
    patientId,
    userId,
    clinicId,
    user: user ? 'User found' : 'No user'
  });

  // WebSocket Integration via Hook
  const { wsConnected } = usePatientWebSocket(patientId, userId, clinicId);

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



  // Check permissions
  const canManageDoctors = React.useMemo(() => {
    if (!user || !currentClinicId) return false;
    const role = user.rolesByClinic?.[currentClinicId];
    return ['admin', 'owner', 'full_access'].includes(role);
  }, [user, currentClinicId]);

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

  const handleConfirmDeletePatient = useCallback(async () => {
    if (!currentPatient) return;

    setDeletePatientLoading(true);

    try {
      const result = await useUserStore.getState().deletePatient(currentPatient.id);

      if (result.success) {
        pushNotification("success", t('editPatient.updateSuccess'));
        router.push('/patient'); // Redirect to patient list
      } else {
        pushNotification("error", result.message || t('editPatient.updateFailed'));
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      pushNotification("error", "Network error while deleting patient");
    } finally {
      setDeletePatientLoading(false);
      setIsDeletePatientOpen(false);
    }
  }, [currentPatient, router, pushNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">

            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7564ed] mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('loading.title')}
            </h2>
            <p className="text-gray-600 text-lg">
              {t('loading.desc')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard error={error} onClose={handleBack} />
    );
  }

  if (!currentPatient) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('patientInfo.notFound')}
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              {t('patientInfo.noFoundDesc', { defaultValue: 'The requested patient does not exist.' })}
            </p>
            <Button onClick={handleBack} className="bg-[#7564ed] hover:bg-[#6a4fd8] text-white">
              {t('patientInfo.backToPatients')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full w-full bg-transparent max-h-[calc(100vh-max(7vh,50px))] overflow-y-auto overflow-x-hidden p-2 scrollbar-hide"
      style={{
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none', /* IE and Edge */
      }}
      suppressHydrationWarning
    >
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
                <span>{calculateAge(currentPatient.date_of_birth)} {t('patientInfo.years')}</span>
                <span className="capitalize">{currentPatient.gender ? t(`editPatient.${currentPatient.gender}`) : t('patientInfo.unknown')}</span>
                <span className="capitalize">{currentPatient.email || t('patientInfo.unknown')}</span>
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
              <div className="bg-white rounded-2xl p-[12px] shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-gray-950">{t('patientInfo.treatingDoctors')}</h2>
                  {canManageDoctors && (
                    <Button
                      onClick={handleAddDoctor}
                      variant="ghost"
                      size="sm"
                      className=" p-0 border-0 border-white  text-[#7564ed] "
                    >
                      <Plus className="w-7 h-7 stroke-4 " />
                    </Button>
                  )}
                </div>

                <div className="space-y-0">
                  {currentPatient.treating_doctors && currentPatient.treating_doctors.length > 0 ? (
                    currentPatient.treating_doctors.map((doctor, index) => (
                      <div key={doctor.id || index} className="flex items-center justify-between p-1 rounded-2xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src={doctor.profilePhotoUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white font-semibold text-sm">
                              {((doctor.first_name || '').slice(0, 1) +
                                (doctor.last_name || '').slice(0, 1)).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h5 className="font-medium text-gray-900 text-l">
                              {doctor.first_name || ""} {doctor.last_name || ""}
                            </h5>
                            <p className="text-gray-500 text-xs"></p>
                          </div>
                        </div>
                        {canManageDoctors && (
                          <Button
                            onClick={() => handleDeleteDoctor(doctor)}
                            variant="ghost"
                            size="sm"
                            className="p-1 border-0 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-6 h-6" />
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      {t('patientInfo.noDoctorsAssigned')}
                    </div>
                  )}
                </div>
              </div>

              <ReportComments
                description={currentPatient.description}
                onEdit={(newDescription) => store.updateDescription(currentPatient.id, newDescription)}
              />
              {/* Bottom Row - Order AI Report */}
              <div className="">
                <OrderAIReport
                  patient={currentPatient}
                  onReportCreated={handleReportCreated}
                  addReportToState={handleReportCreated}
                />
              </div>

              {/* Dental Data Gallery Card */}
              {dentalLoading ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-48 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#7564ed]" />
                </div>
              ) : sortedDates.length > 0 ? (
                <div onClick={() => router.push(`/patient/${patientId}/dental-data`)} className="cursor-pointer">
                  <DentalDateGroupCard
                    date={sortedDates[0]}
                    files={groupedFiles[sortedDates[0]]}
                    helpers={helpers}
                    onSelect={(file) => {
                      setSelectedFile(file);
                    }}
                  />
                </div>
              ) : null}

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
              wsConnectionStatus={wsConnected ? 'connected' : 'disconnected'}
              wsLastUpdate={null}
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
        canManageDoctors={canManageDoctors}
        onDelete={() => {
          store.closeEditPatientDialog();
          setIsDeletePatientOpen(true);
        }}
      />

      {/* Delete Patient Dialog */}
      <DeletePatientDialog
        open={isDeletePatientOpen}
        onOpenChange={setIsDeletePatientOpen}
        patient={currentPatient}
        onConfirm={handleConfirmDeletePatient}
        loading={deletePatientLoading}
      />

      {/* Delete Doctor Dialog */}
      <DeleteTreatingDoctorDialog
        open={isDeleteDoctorOpen}
        onOpenChange={(open) => {
          if (!open) {
            store.closeDeleteDoctorDialog();
          }
        }}
        doctor={doctorToDelete}
        patient={currentPatient}
        onConfirm={handleConfirmDeleteDoctor}
        loading={deleteDoctorLoading}
      />
      <FilePreviewDialog
        selectedFile={selectedFile}
        isOpen={!!selectedFile}
        onOpenChange={(open) => !open && setSelectedFile(null)}
        helpers={helpers}
      />
    </div>
  );
}