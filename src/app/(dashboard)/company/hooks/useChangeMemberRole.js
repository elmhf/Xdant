import { useState } from 'react';
import useUserStore from '@/components/features/profile/store/userStore';

export const useChangeMemberRole = (refetchMembers, clinicId) => {
  const [changing, setChanging] = useState(false);
  const [changeMessage, setChangeMessage] = useState('');
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [memberToChange, setMemberToChange] = useState(null);
  const [newRole, setNewRole] = useState('');

  const { changeMemberRole, mapRoleToAPI, mapAPIToDisplay } = useUserStore();

  const openChangeDialog = (member) => {

    setMemberToChange(member);

    // Map current role to valid API role using store function
    const apiRole = mapRoleToAPI(member.role);
    setNewRole(apiRole);

    setShowChangeDialog(true);
    setChangeMessage('');
  };

  const closeChangeDialog = () => {
    setShowChangeDialog(false);
    setMemberToChange(null);
    setNewRole('');
    setChangeMessage('');
  };

  const confirmChange = async () => {
    if (!memberToChange || !newRole || !clinicId) return;

    setChanging(true);
    setChangeMessage('');



    try {
      const result = await changeMemberRole(
        clinicId,
        memberToChange.user_id,
        newRole
      );

      if (result.success) {
        setChangeMessage('Rôle mis à jour avec succès');
        // Refetch members after successful change
        if (refetchMembers) {
          setTimeout(() => {
            refetchMembers();
            closeChangeDialog();
          }, 1000);
        } else {
          closeChangeDialog();
        }
      } else {
        setChangeMessage(result.message || 'Erreur lors de la mise à jour du rôle');
      }
    } catch (error) {
      console.error('Error changing member role:', error);
      setChangeMessage('Erreur réseau lors de la mise à jour du rôle');
    } finally {
      setChanging(false);
    }
  };

  return {
    changing,
    changeMessage,
    showChangeDialog,
    setShowChangeDialog,
    memberToChange,
    newRole,
    setNewRole,
    openChangeDialog,
    closeChangeDialog,
    confirmChange
  };
}; 