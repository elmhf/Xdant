import { useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import useUserStore from '@/components/features/profile/store/userStore';

export const useLeaveClinicWithVerification = () => {
  const [step, setStep] = useState(1); // 1: password verification, 2: confirmation
  const [password, setPassword] = useState("");
  const [leaving, setLeaving] = useState(false);
  const [leaveMessage, setLeaveMessage] = useState("");
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [clinicToLeave, setClinicToLeave] = useState(null);
  const [error, setError] = useState("");

  const verifyPassword = async () => {
    if (!password.trim()) {
      setError("Veuillez entrer votre mot de passe");
      return false;
    }

    setLeaving(true);
    setError("");

    try {
      const data = await apiClient("/api/auth/verify-password", {
        method: "POST",
        body: JSON.stringify({
          email: useUserStore.getState().userInfo?.email,
          password
        }),
      });

      if (data.valid === true) {
        setStep(2);
        setError("");
        return true;
      } else {
        setError("Mot de passe incorrect");
        return false;
      }
    } catch (error) {
      setError(error.message || "Erreur réseau");
      return false;
    } finally {
      setLeaving(false);
    }
  };

  const leaveClinic = async () => {
    if (!clinicToLeave?.id) {
      setLeaveMessage("ID de clinique invalide");
      return;
    }

    setLeaving(true);
    setLeaveMessage("");

    try {
      await apiClient("/api/clinics/leave-clinic", {
        method: "POST",
        body: JSON.stringify({ clinicId: clinicToLeave.id })
      });

      setLeaveMessage("Vous avez quitté la clinique avec succès");

      // Remove clinic from userStore
      const currentClinics = useUserStore.getState().clinicsInfo;
      const updatedClinics = currentClinics.filter(clinic => clinic.id !== clinicToLeave.id);

      useUserStore.getState().setClinicsInfo(updatedClinics);

      // If this was the current clinic, set another clinic as current
      const currentClinicId = useUserStore.getState().currentClinicId;
      if (currentClinicId === clinicToLeave.id && updatedClinics.length > 0) {
        useUserStore.getState().setCurrentClinicId(updatedClinics[0].id);
      } else if (updatedClinics.length === 0) {
        useUserStore.getState().setCurrentClinicId(null);
      }

      setShowLeaveDialog(false);
      setClinicToLeave(null);
      setStep(1);
      setPassword("");

      // Refresh clinics data
      await useUserStore.getState().fetchMyClinics();

      return { success: true, message: "Vous avez quitté la clinique avec succès" };

    } catch (error) {
      console.error("Error leaving clinic:", error);
      setLeaveMessage(error.message || "Erreur de réseau");
      return { success: false, message: error.message || "Erreur de réseau" };
    } finally {
      setLeaving(false);
    }
  };

  const openLeaveDialog = (clinic) => {
    setClinicToLeave(clinic);
    setShowLeaveDialog(true);
    setStep(1);
    setPassword("");
    setError("");
    setLeaveMessage("");
  };

  const closeLeaveDialog = () => {
    setShowLeaveDialog(false);
    setClinicToLeave(null);
    setStep(1);
    setPassword("");
    setError("");
    setLeaveMessage("");
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setPassword("");
      setError("");
    } else {
      closeLeaveDialog();
    }
  };

  return {
    step,
    password,
    setPassword,
    leaving,
    leaveMessage,
    showLeaveDialog,
    setShowLeaveDialog,
    clinicToLeave,
    error,
    verifyPassword,
    leaveClinic,
    openLeaveDialog,
    closeLeaveDialog,
    handleBack
  };
}; 