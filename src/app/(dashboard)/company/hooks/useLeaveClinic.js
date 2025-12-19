import { useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import useUserStore from '@/components/features/profile/store/userStore';

export const useLeaveClinic = () => {
  const [leaving, setLeaving] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [clinicToLeave, setClinicToLeave] = useState(null);

  const leaveClinic = async (clinicId, clinicName, action = null, newOwnerId = null) => {
    if (!clinicId) {
      setLeaveMessage("ID de clinique invalide");
      return;
    }

    setLeaving(true);
    setLeaveMessage("");

    try {
      const data = await apiClient("/api/clinics/leave-clinic", {
        method: "POST",
        body: JSON.stringify({ clinicId, action, newOwnerId })
      });

      setLeaveMessage("Vous avez quitté la clinique avec succès");

      // Remove clinic from userStore
      const currentClinics = useUserStore.getState().clinicsInfo;
      const updatedClinics = currentClinics.filter(clinic => clinic.id !== clinicId);

      useUserStore.getState().setClinicsInfo(updatedClinics);

      // If this was the current clinic, set another clinic as current
      const currentClinicId = useUserStore.getState().currentClinicId;
      if (currentClinicId === clinicId && updatedClinics.length > 0) {
        useUserStore.getState().setCurrentClinicId(updatedClinics[0].id);
      } else if (updatedClinics.length === 0) {
        useUserStore.getState().setCurrentClinicId(null);
      }

      setShowLeaveDialog(false);
      setClinicToLeave(null);

      return { success: true, message: "Vous avez quitté la clinique avec succès" };

    } catch (error) {
      console.error("Error leaving clinic:", error);
      setLeaveMessage(error.message || "Erreur lors de la sortie de la clinique");
      return { success: false, message: error.message || "Erreur de réseau" };
    } finally {
      setLeaving(false);
    }
  };

  const openLeaveDialog = (clinic) => {
    setClinicToLeave(clinic);
    setShowLeaveDialog(true);
    setLeaveMessage("");
  };

  const closeLeaveDialog = () => {
    setShowLeaveDialog(false);
    setClinicToLeave(null);
    setLeaveMessage("");
  };

  const confirmLeaveClinic = async (action = null, newOwnerId = null) => {
    if (!clinicToLeave) return;

    const result = await leaveClinic(clinicToLeave.id, clinicToLeave.clinic_name, action, newOwnerId);
    return result;
  };

  return {
    leaving,
    leaveMessage,
    showLeaveDialog,
    setShowLeaveDialog,
    clinicToLeave,
    leaveClinic,
    openLeaveDialog,
    closeLeaveDialog,
    confirmLeaveClinic
  };
}; 