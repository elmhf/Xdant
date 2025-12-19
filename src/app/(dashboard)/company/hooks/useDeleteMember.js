import { useState } from 'react';
import { apiClient } from '@/utils/apiClient';
import useUserStore from '@/components/features/profile/store/userStore';

export const useDeleteMember = (onSuccess) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const currentClinic = useUserStore(state => state.getCurrentClinic());

  const deleteMember = async (memberId, memberName) => {
    if (!currentClinic) {
      setDeleteMessage("Erreur: Aucune clinique sélectionnée");
      return;
    }

    setDeleting(true);
    setDeleteMessage("");

    try {
      await apiClient("/api/clinics/delete-member", {
        method: "POST",
        body: JSON.stringify({
          clinicId: currentClinic.id,
          memberId: memberId
        }),
      });

      setDeleteMessage("Membre supprimé avec succès de la clinique");
      setShowDeleteDialog(false);
      setMemberToDelete(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Delete member error:', error);
      setDeleteMessage(error.message || "Erreur lors de la suppression du membre");
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (member) => {
    setMemberToDelete(member);
    setShowDeleteDialog(true);
    setDeleteMessage("");
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setMemberToDelete(null);
    setDeleteMessage("");
  };

  const confirmDelete = async () => {
    if (memberToDelete) {
      await deleteMember(memberToDelete.user_id, memberToDelete.name);
    }
  };

  return {
    deleting,
    deleteMessage,
    showDeleteDialog,
    setShowDeleteDialog,
    memberToDelete,
    deleteMember,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  };
}; 