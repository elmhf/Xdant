import { useState } from 'react';
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
      const response = await fetch("http://localhost:5000/api/clinics/delete-member", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clinicId: currentClinic.id,
          memberId: memberId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDeleteMessage("Membre supprimé avec succès de la clinique");
        setShowDeleteDialog(false);
        setMemberToDelete(null);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setDeleteMessage(data.error || "Erreur lors de la suppression du membre");
      }
    } catch (error) {
      console.error('Delete member error:', error);
      setDeleteMessage("Erreur de connexion lors de la suppression");
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