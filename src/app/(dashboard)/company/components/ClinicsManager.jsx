import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2,
  MapPin,
  Users,
  LogOut,
  Settings,
  Plus,
  AlertTriangle
} from "lucide-react";
import { useLeaveClinic } from '../hooks';
import { LeaveClinicDialog } from './LeaveClinicDialog';
import useUserStore from "@/components/features/profile/store/userStore";

export const ClinicsManager = () => {
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

  const clinicsInfo = useUserStore(state => state.clinicsInfo);
  const currentClinicId = useUserStore(state => state.currentClinicId);
  const setCurrentClinicId = useUserStore(state => state.setCurrentClinicId);
  const getImageFromCache = useUserStore.getState().getImageFromCache;

  const renderClinicLogo = (clinic, size = "h-12 w-12") => {
    const logoUrl = clinic?.logoUrl || clinic?.logo_url;
    const clinicName = clinic?.clinic_name || clinic?.clinicName || clinic?.name;

    return (
      <Avatar className={size}>
        {logoUrl ? (
          <img
            src={getImageFromCache(logoUrl)?.src || logoUrl}
            alt="Clinic Logo"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white text-sm font-medium">
          {clinicName
            ? clinicName.split(' ').map(n => n[0]).join('').slice(0, 2)
            : "CL"}
        </AvatarFallback>
      </Avatar>
    );
  };

  const handleLeaveClinic = async () => {
    const result = await confirmLeaveClinic();
    if (result?.success) {
      // Refresh clinics data
      await useUserStore.getState().fetchMyClinics();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes cliniques</h2>
          <p className="text-gray-600">Gérez vos cliniques et vos accès</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Rejoindre une clinique
        </Button>
      </div>

      {clinicsInfo.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune clinique
            </h3>
            <p className="text-gray-600 mb-4">
              Vous n'êtes membre d'aucune clinique pour le moment.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Rejoindre une clinique
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clinicsInfo.map((clinic) => (
            <Card
              key={clinic.id}
              className={`relative transition-all duration-200 hover:shadow-lg ${currentClinicId === clinic.id ? 'ring-2 ring-purple-500' : ''
                }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {renderClinicLogo(clinic)}
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {clinic.clinic_name || clinic.clinicName || clinic.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {clinic.address || clinic.location || "Adresse non disponible"}
                      </CardDescription>
                    </div>
                  </div>
                  {currentClinicId === clinic.id && (
                    <Badge className="bg-green-100 text-green-800">
                      Actuelle
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Role Info */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Votre rôle :</span>
                    <Badge
                      variant={clinic.role === 'owner' || clinic.role === 'admin' ? 'default' : 'secondary'}
                      className={
                        clinic.role === 'owner' || clinic.role === 'admin'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {clinic.role === 'owner' || clinic.role === 'admin' ? 'Admin' : 'Membre'}
                    </Badge>
                  </div>

                  {/* Member Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Membres :</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {clinic.memberCount || clinic.members_count || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {currentClinicId !== clinic.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setCurrentClinicId(clinic.id)}
                      >
                        Activer
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {/* Navigate to clinic settings */ }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => openLeaveDialog(clinic)}
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
}; 