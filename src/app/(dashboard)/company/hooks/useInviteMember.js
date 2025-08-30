import { useState } from 'react';
import useUserStore from '../../../component/profile/store/userStore';

export const useInviteMember = (onSuccess) => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      setInviteMessage("Veuillez entrer une adresse email");
      return;
    }

    setInviteLoading(true);
    setInviteMessage("");

    try {
      const currentClinic = useUserStore.getState().getCurrentClinic();
      if (!currentClinic?.id) {
        setInviteMessage("Aucune clinique sélectionnée");
        return;
      }

      const result = await useUserStore.getState().inviteClinicMember(
        currentClinic.id,
        inviteEmail.trim(),
        inviteRole
      );

      if (result.success) {
        setInviteMessage("Invitation envoyée avec succès!");
        setInviteEmail("");
        setInviteRole("staff");
        setInviteDialogOpen(false);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setInviteMessage(result.message || "Erreur lors de l'envoi de l'invitation");
      }
    } catch (error) {
      setInviteMessage("Une erreur s'est produite lors de l'envoi de l'invitation");
    } finally {
      setInviteLoading(false);
    }
  };

  const resetInviteForm = () => {
    setInviteEmail("");
    setInviteRole("staff");
    setInviteMessage("");
  };

  const openInviteDialog = () => {
    resetInviteForm();
    setInviteDialogOpen(true);
  };

  const closeInviteDialog = () => {
    setInviteDialogOpen(false);
    resetInviteForm();
  };

  return {
    inviteDialogOpen,
    setInviteDialogOpen,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviteLoading,
    inviteMessage,
    handleInviteMember,
    resetInviteForm,
    openInviteDialog,
    closeInviteDialog
  };
}; 