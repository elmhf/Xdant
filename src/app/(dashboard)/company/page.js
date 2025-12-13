"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Building, AlertTriangle } from "lucide-react";
import {
  useClinicMembers,
  useLeaveClinic,
  usePermissions,
  useInviteMember
} from "./hooks";
import { LeaveClinicDialog } from "./components/LeaveClinicDialog";
import { AddTeamMemberDialog } from "./components/AddTeamMemberDialog";
import { ClinicProfileTab } from "./components/ClinicProfileTab";
import { MembersTab } from "./components/MembersTab";
import { InvitationsTab } from "./components/InvitationsTab";
import { AccessDenied } from "./components/AccessDenied";
import { BillingTab } from "./components/BillingTab";
import useUserStore from "@/components/features/profile/store/userStore";

export default function page() {
  // Use custom hooks
  const { clinicMembers, loading, error, refetch, currentClinic } = useClinicMembers();
  const {
    leaving,
    leaveMessage,
    showLeaveDialog,
    setShowLeaveDialog,
    clinicToLeave,
    openLeaveDialog,
    closeLeaveDialog,
    confirmLeaveClinic
  } = useLeaveClinic();

  const handleLeaveClinic = async (action, newOwnerId) => {
    const result = await confirmLeaveClinic(action, newOwnerId);
    if (result?.success) {
      // Refresh clinics data handled in useLeaveClinic usually, but if we need page refresh:
      // useClinicMembers refetch is mostly for table. 
      // if we leave current clinic, we might be redirected or need to refresh member list if we just transferred?
      // If we leave, we leave.
      window.location.reload();
    }
  };

  // Fetch invitations data once at page level
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [invitationsError, setInvitationsError] = useState(null);

  // Fetch invitations when clinic changes
  useEffect(() => {
    const fetchInvitations = async () => {
      // Skip during build/SSR
      if (typeof window === 'undefined') return;

      if (!currentClinic?.id) {
        setInvitations([]);
        return;
      }

      setInvitationsLoading(true);
      setInvitationsError(null);

      try {
        const result = await useUserStore.getState().fetchInvitedMembers(currentClinic.id);
        if (result.success) {
          setInvitations(result.invitations || []);
        } else {
          setInvitationsError(result.message);
          setInvitations([]);
        }
      } catch (error) {
        console.error('Error fetching invitations:', error);
        setInvitationsError('Erreur lors du chargement des invitations');
        setInvitations([]);
      } finally {
        setInvitationsLoading(false);
      }
    };

    fetchInvitations();
  }, [currentClinic?.id]);

  // Get permissions with memoization to prevent re-renders
  const permissions = usePermissions(currentClinic?.id);
  const {
    userRole,
    hasCompanyAccess,
    hasMemberManagement,
    hasInvitationManagement,
    hasClinicSettings,
    canEditClinic,
    isDataLoaded
  } = useMemo(() => permissions, [permissions]);

  // Use invite member hook
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

  // Track active tab
  const [activeTab, setActiveTab] = useState("profile");

  // Debug logging














  // Loading and error states
  if (loading || !isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="animate-spin rounded-xl h-16 w-16 border-b-2 border-[#7564ed] mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Chargement des données
            </h2>
            <p className="text-gray-600 text-lg">
              Veuillez patienter pendant le chargement des informations de la clinique...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has no clinic or data
  if (!currentClinic) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full  bg-transparent">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aucune clinique trouvée
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Vous n'êtes actuellement membre d'aucune clinique. Veuillez contacter votre administrateur pour être ajouté à une clinique.
            </p>
          </div>
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-[#7564ed] hover:bg-[#6a4fd8] text-white border-2 border-[#7564ed] h-12 text-base font-semibold px-8"
          >
            Aller au Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has access to company settings
  // Only block access if data is loaded and user doesn't have access
  if (isDataLoaded && !hasCompanyAccess) {

    return (
      <AccessDenied
        userRole={userRole}
        requiredRole="Membre de la clinique"
        message="Vous n'êtes pas membre de cette clinique ou n'avez pas les permissions nécessaires pour accéder aux informations de la clinique."
      />
    );
  }

  // Check if user has permission to view restricted tabs
  const canViewRestrictedTabs = userRole === 'owner' || userRole === 'admin' || userRole === 'full_access';

  // Handle dialog open change
  const handleInviteDialogChange = (open) => {
    setInviteDialogOpen(open);
    if (!open) {
      setInviteEmail('');
      setInviteRole('');
    }
  };

  return (
    <div className="bg-transparent w-full space-y-2">
      {/* Header Section */}
      <div className="bg-transparent">
        <div className="">
          <div className="text-start">
            <h2 className="text-3xl md:text-4xl font-[650] text-gray-900 mb-2">
              {currentClinic?.clinic_name || 'Paramètres de la clinique'}
            </h2>
            {userRole && (
              <p className="text-sm text-gray-500">
                Connecté en tant que : <span className="font-semibold">{userRole}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-wrap items-center justify-between mb-2">
            <TabsList className="flex flex-row space-x-2 bg-transparent h-fit items-center">
              <TabsTrigger
                value="profile"
                className="px-4 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 text-xl font-medium transition-all duration-200 hover:bg-[#bcb3f8] hover:text-[#7564ed] data-[state=active]:!bg-[#7564ed] data-[state=active]:!text-white"
              >
                Clinic info
              </TabsTrigger>
              {canViewRestrictedTabs && (
                <>
                  <TabsTrigger
                    value="members"
                    className="px-4 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 text-xl font-medium transition-all duration-200 hover:bg-[#bcb3f8] hover:text-[#7564ed] data-[state=active]:!bg-[#7564ed] data-[state=active]:!text-white"
                  >
                    Team
                  </TabsTrigger>
                  <TabsTrigger
                    value="invitations"
                    className="px-4 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 text-xl font-medium transition-all duration-200 hover:bg-[#bcb3f8] hover:text-[#7564ed] data-[state=active]:!bg-[#7564ed] data-[state=active]:!text-white"
                  >
                    Invitations
                  </TabsTrigger>
                  <TabsTrigger
                    value="billing"
                    className="px-4 h-12 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 text-xl font-medium transition-all duration-200 hover:bg-[#bcb3f8] hover:text-[#7564ed] data-[state=active]:!bg-[#7564ed] data-[state=active]:!text-white"
                  >
                    Billing
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Invite Button - Only show on Team or Invitations tabs */}
            {(activeTab === "members" || activeTab === "invitations") && canViewRestrictedTabs && (
              <AddTeamMemberDialog
                open={inviteDialogOpen}
                onOpenChange={handleInviteDialogChange}
                inviteEmail={inviteEmail}
                setInviteEmail={setInviteEmail}
                inviteRole={inviteRole}
                setInviteRole={setInviteRole}
                inviteLoading={inviteLoading}
                inviteMessage={inviteMessage}
                handleInviteMember={handleInviteMember}
              />
            )}
          </div>

          <TabsContent value="profile" className="">
            <ClinicProfileTab currentClinic={currentClinic} userRole={userRole} canEditClinic={canEditClinic} openLeaveDialog={openLeaveDialog} />
          </TabsContent>

          {canViewRestrictedTabs && (
            <>
              <TabsContent value="members" className="">
                <MembersTab currentClinic={currentClinic} clinicMembers={clinicMembers} loading={loading} error={error} />
              </TabsContent>

              <TabsContent value="invitations" className="">
                <InvitationsTab currentClinic={currentClinic} invitations={invitations} loading={invitationsLoading} error={invitationsError} />
              </TabsContent>

              <TabsContent value="billing" className="">
                <BillingTab currentClinic={currentClinic} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Leave Clinic Dialog with Verification */}
      {/* Leave Clinic Dialog */}
      <LeaveClinicDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        clinic={clinicToLeave}
        onConfirm={handleLeaveClinic}
        loading={leaving}
        message={leaveMessage}
      />
    </div>
  );
}