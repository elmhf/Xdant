import { useState } from 'react';
import useUserStore from '@/components/features/profile/store/userStore';

export const useDeleteInvitation = (refetchInvitations) => {
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState(null);

  const { deleteClinicInvitation } = useUserStore();

  const openDeleteDialog = (invitation) => {
    setInvitationToDelete(invitation);
    setShowDeleteDialog(true);
    setDeleteMessage('');
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setInvitationToDelete(null);
    setDeleteMessage('');
  };

  const confirmDelete = async () => {
    if (!invitationToDelete) return;

    setDeleting(true);
    setDeleteMessage('');

    try {
      const result = await deleteClinicInvitation(
        invitationToDelete.clinic_id || invitationToDelete.clinicId,
        invitationToDelete.id
      );

      if (result.success) {
        setDeleteMessage('Invitation supprimée avec succès');
        // Refetch invitations after successful deletion
        if (refetchInvitations) {
          setTimeout(() => {
            refetchInvitations();
            closeDeleteDialog();
          }, 1000);
        } else {
          closeDeleteDialog();
        }
      } else {
        setDeleteMessage(result.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting invitation:', error);
      setDeleteMessage('Erreur réseau lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  return {
    deleting,
    deleteMessage,
    showDeleteDialog,
    setShowDeleteDialog,
    invitationToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  };
}; 