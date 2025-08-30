import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, Search, UserPlus, Trash2, UserCheck } from "lucide-react";
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
        {/* Data Table Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher des membres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="">
                  Rôle: {filterRole === "all" ? "Tous" : filterRole}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filtrer par rôle</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterRole("all")}> 
                  Tous les rôles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole("Dentist")}> 
                  Dentiste
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole("Receptionist")}> 
                  Réceptionniste
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole("assistant_access")}> 
                  Assistant
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole("Hygienist")}> 
                  Hygiéniste
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterRole("Technician")}> 
                  Technicien
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {filteredMembers.length} membre(s) trouvé(s)
            </div>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="px-4 h-12 flex items-center justify-center rounded-full bg-white text-[#7c5cff] border-2 border-[#7c5cff] text-xl font-medium hover:bg-[#7c5cff] hover:text-white transition-all duration-200"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Inviter un membre
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white border-2 border-gray-200">
                <DialogHeader className="pb-4">
                  <DialogTitle className="flex items-center gap-3 text-[#7c5cff] text-xl font-bold">
                    <UserPlus className="h-6 w-6" />
                    Inviter un nouveau membre
                  </DialogTitle>
                  <DialogDescription className="text-base text-gray-700 mt-2">
                    Envoyez une invitation par email pour rejoindre votre clinique.
                  </DialogDescription>
                </DialogHeader>
                <div className=" space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="block text-base font-semibold text-gray-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full h-12 text-base border-2 border-gray-300 focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="role" className="block text-base font-semibold text-gray-700">
                      Rôle
                    </Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-[#7c5cff] focus:ring-2 focus:ring-[#7c5cff]/20">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_access">Full access</SelectItem>
                        <SelectItem value="clinic_access">clinic_access</SelectItem>
                        <SelectItem value="limited_access">limited_access</SelectItem>
                        <SelectItem value="assistant_access">Assistant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {inviteMessage && (
                    <div className={`p-4 rounded-xl text-base font-medium border-2 ${
                      inviteMessage.includes('successfully')
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {inviteMessage}
                    </div>
                  )}
                </div>
                <DialogFooter className="pt-4">
                  <Button
                    type="submit"
                    onClick={handleInviteMember}
                    disabled={inviteLoading}
                    className="flex-1 h-12 text-base font-semibold bg-[#7c5cff] hover:bg-[#6a4fd8] text-white border-2 border-[#7c5cff]"
                  >
                    {inviteLoading ? "Envoi..." : "Envoyer l'invitation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

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
                    <span>Rôle</span>
                    {sorting.column === 'role' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sorting.direction === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Statut</th>
                <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white cursor-pointer" onClick={() => handleSort('joinDate')}>
                  <div className="flex items-center space-x-1">
                    <span>Date d'adhésion</span>
                    {sorting.column === 'joinDate' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sorting.direction === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th className="min-w-32 text-right py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Actions</th>
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
                    <td className="min-w-32 py-4 px-4 text-base">{getStatusBadge(member.status)}</td>
                    <td className="min-w-32 py-4 px-4 text-base">{formatDate(member.joinDate)}</td>
                    <td className="min-w-32 py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => openChangeDialog(member)}
                          title="Modifier le rôle"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            openDeleteDialog(member);
                          }}
                          title="Supprimer le compte"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 text-lg">
                    <div className="flex flex-col items-center">
                      <UserPlus className="h-12 w-12 text-gray-400 mb-2" />
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