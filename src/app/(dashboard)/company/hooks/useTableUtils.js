import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUserStore from '@/components/features/profile/store/userStore';

export const useTableUtils = () => {
  const renderMemberAvatar = (member) => {
    return (
      <Avatar className="h-11 w-11 flex-shrink-0">
        <AvatarImage
          src={member.profilePhotoUrl ? useUserStore.getState().getImageFromCache(member.profilePhotoUrl)?.src || member.profilePhotoUrl : `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`}
        />
        <AvatarFallback className="bg-purple-100 text-purple-600 text-sm font-semibold">
          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </AvatarFallback>
      </Avatar>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatMemberName = (firstName, lastName) => {
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Nom inconnu';
  };

  const getMemberInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const transformMemberData = (member) => {
    return {
      id: member.id,
      name: formatMemberName(member.user?.firstName, member.user?.lastName),
      email: member.user?.email || '',
      role: member.role || 'Unknown',
      status: member.status || 'Active',
      joinDate: member.joinedAt ? new Date(member.joinedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      profilePhotoUrl: member.user?.profilePhotoUrl,
      invitedBy: member.invitedBy,
      createdAt: member.createdAt
    };
  };

  return {
    renderMemberAvatar,
    formatDate,
    formatMemberName,
    getMemberInitials,
    transformMemberData
  };
}; 