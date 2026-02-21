import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Mail, Trash2, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useMemberBadges,
  useTableUtils,
  useDeleteInvitation
} from "../hooks";
import { DeleteInvitationDialog } from "./DeleteInvitationDialog";

export const InvitationsTab = ({ currentClinic, invitations, loading, error }) => {
  const { t } = useTranslation();
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

  // Split invitations into pending and history
  const pendingInvitations = filteredInvitations.filter(inv => inv.status !== 'accepted' && inv.status !== 'rejected');
  const historyInvitations = filteredInvitations.filter(inv => inv.status === 'accepted' || inv.status === 'rejected');

  const InvitationsTable = ({ data, emptyMessage }) => (
    <div className="overflow-x-auto">
      <table className="w-fit min-w-full text-sm">
        <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th className="min-w-56 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">{t('company.emailHeader')}</th>
            <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">{t('company.accessLevelHeader')}</th>
            <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">{t('company.status')}</th>
            <th className="min-w-56 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">{t('company.sentDateExpires')}</th>
            <th className="min-w-32 text-right py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">{t('company.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((invitation) => (
              <tr key={invitation.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                <td className="min-w-56 py-4 px-4 text-base text-gray-900 font-medium">{invitation.email}</td>
                <td className="min-w-32 py-4 px-4 text-base">{getRoleBadge(invitation.role)}</td>
                <td className="min-w-32 py-4 px-4 text-base">{invitation.status}</td>
                <td className="min-w-56 py-4 px-4 text-base">
                  {formatDate(invitation.createdAt)} — {formatDate(invitation.expiresAt)}
                </td>
                <td className="min-w-32 py-4 px-4 text-right">
                  <div className="flex gap-2 justify-end">
                    {(invitation.status === 'accepted' || invitation.status === 'rejected') ? (
                      <Button
                        variant="outline"
                        className="h-10 px-4 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-medium rounded-2xl"
                        onClick={() => openDeleteInvitationDialog(invitation)}
                      >
                        {t('company.remove')}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="h-10 px-4 text-gray-600 border-gray-200 hover:bg-gray-100 font-medium rounded-2xl"
                        onClick={() => openDeleteInvitationDialog(invitation)}
                      >
                        {t('company.cancel')}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-500 text-lg">
                <div className="flex flex-col items-center">
                  <Mail className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="bg-transparent max-w-full mx-auto space-y-8">
        <div className="rounded-md">
          <div className="max-h-100 h-100 overflow-visible">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">{t('company.loadingInvitations')}</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()} className="bg-[#7564ed] hover:bg-[#6a4fd8] text-white border-2 border-[#7564ed]">
                    {t('company.retry')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Pending Invitations Section */}
                <div className="w-full">
                  <Card className="rounded-xl shadow border border-gray-100 bg-white overflow-hidden gap-0">
                    <div className="p-6 pb-2 border-b border-gray-100">
                      <h3 className="text-3xl font-bold text-gray-900">{t('company.pendingInvitations')}</h3>
                    </div>
                    <CardContent className="p-2">
                      <InvitationsTable
                        data={pendingInvitations}
                        emptyMessage={t('company.noPendingInvitations')}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* History Section */}
                <div className="w-full">
                  <Card className="rounded-xl shadow border border-gray-100 bg-white overflow-hidden gap-0">
                    <div className="p-6 pb-2 border-b border-gray-100">
                      <h3 className="text-3xl font-bold text-gray-900">{t('company.invitationHistory')}</h3>
                    </div>
                    <CardContent className="p-2">
                      <InvitationsTable
                        data={historyInvitations}
                        emptyMessage={t('company.noHistoryInvitations')}
                      />
                    </CardContent>
                  </Card>
                </div>
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