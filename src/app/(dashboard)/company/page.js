"use client"

import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Building, AlertTriangle } from "lucide-react";
import { 
  useClinicMembers, 
  useLeaveClinicWithVerification,
  usePermissions
} from "./hooks";
import { LeaveClinicDialogWithVerification } from "./components/LeaveClinicDialogWithVerification";
import { ClinicProfileTab } from "./components/ClinicProfileTab";
import { MembersTab } from "./components/MembersTab";
import { InvitationsTab } from "./components/InvitationsTab";
import { AccessDenied } from "./components/AccessDenied";
import { BillingTab } from "./components/BillingTab";
import useUserStore from "@/app/component/profile/store/userStore";

export default function page() {
  // Use custom hooks
  const { clinicMembers, loading, error, refetch, currentClinic } = useClinicMembers();
  const { 
    step,
    password,
    setPassword,
    leaving, 
    leaveMessage, 
    showLeaveDialog, 
    setShowLeaveDialog, 
    clinicToLeave, 
    error: passwordError,
    verifyPassword,
    leaveClinic,
    openLeaveDialog, 
    closeLeaveDialog, 
    handleBack
  } = useLeaveClinicWithVerification();

  // Fetch invitations data once at page level
  const [invitations, setInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [invitationsError, setInvitationsError] = useState(null);

  // Fetch invitations when clinic changes
  useEffect(() => {
    const fetchInvitations = async () => {
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

  // Debug logging
  
  console.log("permissions", permissions);
  console.log("hasCompanyAccess", hasCompanyAccess);
  console.log("hasMemberManagement", hasMemberManagement);
  console.log("hasInvitationManagement", hasInvitationManagement);
  console.log("hasClinicSettings", hasClinicSettings);
  console.log("canEditClinic", canEditClinic);
  console.log("isDataLoaded", isDataLoaded);
  
  console.log("currentClinic", currentClinic);

  
  

  // Loading and error states
  if (loading || !isDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7c5cff] mx-auto mb-4"></div>
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
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
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
            className="bg-[#7c5cff] hover:bg-[#6a4fd8] text-white border-2 border-[#7c5cff] h-12 text-base font-semibold px-8"
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

  return (
    <div className="bg-transparent w-full">
      {/* Header Section */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="text-start">
            <h2 className="text-3xl md:text-4xl font-[900] text-gray-900 mb-2">
              Paramètres de la clinique
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
        <Tabs defaultValue="profile" className="w-full">
          <div className="flex items-center justify-between mb-2">
            <TabsList className="flex flex-row space-x-2 bg-transparent h-fit items-center">
              <TabsTrigger
                value="profile"
                className="px-4 h-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xl font-medium transition-all duration-200 hover:bg-[#bcb3f8] hover:text-[#7c5cff] data-[state=active]:!bg-[#7c5cff] data-[state=active]:!text-white"
              >
                Clinic info
              </TabsTrigger>
              {hasMemberManagement && (
              <TabsTrigger
                value="members"
                className="px-4 h-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xl font-medium transition-all duration-200 hover:bg-[#bcb3f8] hover:text-[#7c5cff] data-[state=active]:!bg-[#7c5cff] data-[state=active]:!text-white"
              >
                Team
              </TabsTrigger>
              )}
              {hasInvitationManagement && (
                <>
                <TabsTrigger
                  value="invitations"
                  className="px-4 h-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xl font-medium transition-all duration-200 hover:bg-[#bcb3f8] hover:text-[#7c5cff] data-[state=active]:!bg-[#7c5cff] data-[state=active]:!text-white"
                >
                  Invitations
                </TabsTrigger>
                            <TabsTrigger
              value="billing"
              className="px-4 h-12 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xl font-medium transition-all duration-200 hover:bg-[#bcb3f8] hover:text-[#7c5cff] data-[state=active]:!bg-[#7c5cff] data-[state=active]:!text-white"
            >
              Billing
            </TabsTrigger></>
                
              )}

          </TabsList>
            
            {currentClinic && (
              <Button 
                variant="outline" 
                className="px-4 h-12 flex items-center justify-center rounded-full bg-gray-100 text-xl font-medium text-[#ff254e] border-2 border-[#ff254e] hover:bg-[#ff254e] hover:text-white transition-all duration-200"
                onClick={() => openLeaveDialog(currentClinic)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Quitter la clinique
              </Button>
            )}
          </div>
          
          <TabsContent value="profile" className="">
            <ClinicProfileTab currentClinic={currentClinic} userRole={userRole} canEditClinic={canEditClinic} />
          </TabsContent>
          
          {hasMemberManagement && (
            <TabsContent value="members" className="">
              <MembersTab currentClinic={currentClinic} clinicMembers={clinicMembers} loading={loading} error={error} />
            </TabsContent>
          )}

          {hasInvitationManagement && (
            <TabsContent value="invitations" className="">
              <InvitationsTab currentClinic={currentClinic} invitations={invitations} loading={invitationsLoading} error={invitationsError} />
            </TabsContent>
            
          )}

          <TabsContent value="billing" className="">
            <BillingTab currentClinic={currentClinic} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Leave Clinic Dialog with Verification */}
      <LeaveClinicDialogWithVerification
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        clinic={clinicToLeave}
        step={step}
        password={password}
        setPassword={setPassword}
        error={passwordError}
        leaving={leaving}
        leaveMessage={leaveMessage}
        onVerifyPassword={verifyPassword}
        onLeaveClinic={leaveClinic}
        onBack={handleBack}
      />
    </div>
  );
}