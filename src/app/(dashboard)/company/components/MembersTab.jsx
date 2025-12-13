import React from 'react';
import { Button } from "@/components/ui/button";

import { ChevronDown, Search, UserPlus, Trash2, UserCheck, SquarePen } from "lucide-react";
import {
  useMemberFilters,
  useInviteMember,
  useMemberBadges,
  useTableUtils,
  useDeleteMember,
  useChangeMemberRole
} from "../hooks";
import { DeleteMemberDialog } from "./DeleteMemberDialog";
import { ChangeMemberRoleDialog } from "./ChangeMemberRoleDialog";

export const MembersTab = ({ currentClinic, clinicMembers, loading, error }) => {
  // Use custom hooks with passed data
  const {
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    sorting,
    handleSort,
    filteredMembers,
    clearFilters,
    hasActiveFilters
  } = useMemberFilters(clinicMembers || []);
  const {
    inviteDialogOpen,
    setInviteDialogOpen,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviteLoading,
    inviteMessage,
    handleInviteMember
  } = useInviteMember();
  const { getStatusBadge, getRoleBadge } = useMemberBadges();
  const { renderMemberAvatar, formatDate } = useTableUtils();

  const {
    deleting,
    deleteMessage,
    showDeleteDialog,
    setShowDeleteDialog,
    memberToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete
  } = useDeleteMember(() => {
    // Refetch will be handled by parent component
    window.location.reload();
  });

  const {
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
  } = useChangeMemberRole(() => {
    // Refetch will be handled by parent component
    window.location.reload();
  }, currentClinic?.id);

  return (
    <>
      <div className="bg-white rounded-xl shadow p-4 border border-gray-100 max-w-full mx-auto">

        {/* Data Table with controlled height */}
        <div className="bg-white rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="min-w-56 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center space-x-1">
                    <span>Membre</span>
                    {sorting.column === 'name' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sorting.direction === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white cursor-pointer" onClick={() => handleSort('email')}>
                  <div className="flex items-center space-x-1">
                    <span>Email</span>
                    {sorting.column === 'email' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sorting.direction === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white cursor-pointer" onClick={() => handleSort('role')}>
                  <div className="flex items-center space-x-1">
                    <span>access level</span>
                    {sorting.column === 'role' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sorting.direction === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white cursor-pointer" onClick={() => handleSort('joinDate')}>
                  <div className="flex items-center space-x-1">
                    <span>Date d'adhésion</span>
                    {sorting.column === 'joinDate' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sorting.direction === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                    <td className="min-w-56 py-4 px-4 flex items-center space-x-3 text-base text-gray-900 font-medium">
                      {renderMemberAvatar(member)}
                      <span className="font-medium">{member.name}</span>
                    </td>
                    <td className="min-w-32 py-4 px-4 text-base">{member.email}</td>
                    <td className="min-w-32 py-4 px-4 text-base">{getRoleBadge(member.role)}</td>
                    <td className="min-w-32 py-4 px-4 text-base">{formatDate(member.joinDate)}</td>
                    <td className="min-w-32 py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-600 hover:text-[#7564ed]"
                          onClick={() => openChangeDialog(member)}
                          title="Modifier le rôle"
                        >
                          <SquarePen className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-600 hover:text-[#7564ed]"
                          onClick={() => {
                            openDeleteDialog(member);
                          }}
                          title="Supprimer le compte"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  
                  <td colSpan={6} className="text-center py-8 text-gray-500 text-lg">
                    <div className="flex flex-col items-center">
                      <UserPlus  className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-lg font-medium">Aucun membre trouvé</p>
                      <p className="text-gray-400 text-sm">
                        {hasActiveFilters ? "Aucun membre ne correspond à vos filtres" : "Commencez par inviter des membres à votre clinique"}
                      </p>
                      {hasActiveFilters && (
                        <Button
                          onClick={clearFilters}
                          variant="outline"
                          className="mt-2"
                        >
                          Effacer les filtres
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Member Dialog */}
      <DeleteMemberDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        member={memberToDelete}
        onConfirm={confirmDelete}
        loading={deleting}
        message={deleteMessage}
      />

      {/* Change Member Role Dialog */}
      <ChangeMemberRoleDialog
        open={showChangeDialog}
        onOpenChange={setShowChangeDialog}
        member={memberToChange}
        newRole={newRole}
        setNewRole={setNewRole}
        onConfirm={confirmChange}
        loading={changing}
        message={changeMessage}
      />
    </>
  );
}; 