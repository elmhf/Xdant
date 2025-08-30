import { useState } from 'react';
import useUserStore from '../../../component/profile/store/userStore';

export const useLeaveClinic = () => {
  const [leaving, setLeaving] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [clinicToLeave, setClinicToLeave] = useState(null);

  const leaveClinic = async (clinicId, clinicName) => {
    if (!clinicId) {
      setLeaveMessage("ID de clinique invalide");
      return;
    }

    setLeaving(true);
    setLeaveMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/clinics/leave-clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ clinicId })
      });
      
      const data = await res.json();
      
      
      if (res.ok) {
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
      } else {
        setLeaveMessage(data.message || "Erreur lors de la sortie de la clinique");
        return { success: false, message: data.message || "Erreur lors de la sortie de la clinique" };
      }
    } catch (error) {
      console.error("Error leaving clinic:", error);
      setLeaveMessage("Erreur de réseau");
      return { success: false, message: "Erreur de réseau" };
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

  const confirmLeaveClinic = async () => {
    if (!clinicToLeave) return;
    
    const result = await leaveClinic(clinicToLeave.id, clinicToLeave.clinic_name);
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