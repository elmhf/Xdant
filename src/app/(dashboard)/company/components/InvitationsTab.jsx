import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Mail, Trash2, ChevronDown } from "lucide-react";
import { 
  useMemberBadges, 
  useTableUtils,
  useDeleteInvitation
} from "../hooks";
import { DeleteInvitationDialog } from "./DeleteInvitationDialog";

export const InvitationsTab = ({ currentClinic, invitations, loading, error }) => {
  // Get store functions and state
  const { getStatusBadge, getRoleBadge } = useMemberBadges();
  const { formatDate } = useTableUtils();

  // Invitations state
  const [invitationSearchQuery, setInvitationSearchQuery] = useState('');
  const [invitationFilterStatus, setInvitationFilterStatus] = useState('all');

  const {
    deleting: deletingInvitation,
    deleteMessage: deleteInvitationMessage,
    showDeleteDialog: showDeleteInvitationDialog,
    setShowDeleteDialog: setShowDeleteInvitationDialog,
    invitationToDelete,
    openDeleteDialog: openDeleteInvitationDialog,
    closeDeleteDialog: closeDeleteInvitationDialog,
    confirmDelete: confirmDeleteInvitation
  } = useDeleteInvitation(() => {
    // Refetch will be handled by parent component
    window.location.reload();
  });

  // Filter invitations
  const filteredInvitations = (invitations || []).filter(invitation => {
    const matchesSearch = invitation.email.toLowerCase().includes(invitationSearchQuery.toLowerCase());
    const matchesStatus = invitationFilterStatus === 'all' || invitation.status === invitationFilterStatus;
    return matchesSearch && matchesStatus;
  });

  // Load invitations when current clinic changes
  useEffect(() => {
    if (currentClinic?.id) {
      // fetchInvitations(); // This line is removed as per the new_code
    }
  }, [currentClinic?.id]);

  return (
    <>
      <div className="bg-white rounded-xl shadow p-4 border border-gray-100 max-w-full mx-auto">
        {/* Invitations Table Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher des invitations..."
                value={invitationSearchQuery}
                onChange={(e) => setInvitationSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="">
                  Statut: {invitationFilterStatus === "all" ? "Tous" : invitationFilterStatus}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setInvitationFilterStatus("all")}> 
                  Tous les statuts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInvitationFilterStatus("pending")}> 
                  En attente
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInvitationFilterStatus("accepted")}> 
                  Acceptée
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setInvitationFilterStatus("expired")}> 
                  Expirée
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {filteredInvitations.length} invitation(s) trouvée(s)
            </div>
          </div>
        </div>

        {/* Invitations Table */}
        <div className="rounded-md">
          <div className="max-h-100 h-100 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Chargement des invitations...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()} className="bg-[#7564ed] hover:bg-[#6a4fd8] text-white border-2 border-[#7564ed]">
                    Réessayer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl  overflow-x-auto">
                <table className="w-fit min-w-full text-sm">
                  <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="min-w-56 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Email</th>
                      <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Rôle</th>
                      <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Statut</th>
                      <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Date d'envoi</th>
                      <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Expire le</th>
                      <th className="min-w-32 text-right py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvitations.length > 0 ? (
                      filteredInvitations.map((invitation) => (
                        <tr key={invitation.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                          <td className="min-w-56 py-4 px-4 text-base text-gray-900 font-medium">{invitation.email}</td>
                          <td className="min-w-32 py-4 px-4 text-base">{getRoleBadge(invitation.role)}</td>
                          <td className="min-w-32 py-4 px-4 text-base">{invitation.status}</td>
                          <td className="min-w-32 py-4 px-4 text-base">{formatDate(invitation.createdAt)}</td>
                          <td className="min-w-32 py-4 px-4 text-base">{formatDate(invitation.expiresAt)}</td>
                          <td className="min-w-32 py-4 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                  // Handle resend invitation
                                }}
                                title="Renvoyer l'invitation"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openDeleteInvitationDialog(invitation)}
                                title="Supprimer l'invitation"
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
                            <Mail className="h-12 w-12 text-gray-400 mb-2" />
                            <p className="text-gray-500 text-lg font-medium">Aucune invitation trouvée</p>
                            <p className="text-gray-400 text-sm">
                              {invitationSearchQuery || invitationFilterStatus !== 'all' 
                                ? "Aucune invitation ne correspond à vos filtres" 
                                : "Les invitations envoyées apparaîtront ici"
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Invitation Dialog */}
      <DeleteInvitationDialog
        open={showDeleteInvitationDialog}
        onOpenChange={setShowDeleteInvitationDialog}
        invitation={invitationToDelete}
        onConfirm={confirmDeleteInvitation}
        loading={deletingInvitation}
        message={deleteInvitationMessage}
      />
    </>
  );
}; 