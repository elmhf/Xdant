import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, UserCheck, Users } from "lucide-react";
import useUserStore from "@/components/features/profile/store/userStore";

export const ChangeMemberRoleDialog = ({
  open,
  onOpenChange,
  member,
  newRole,
  setNewRole,
  onConfirm,
  loading,
  message
}) => {
  if (!member) return null;

  const roleOptions = [
    { value: 'limited_access', label: 'Accès limité' },
    { value: 'clinic_access', label: 'Accès clinique' },
    { value: 'assistant_access', label: 'Assistant' },
    { value: 'full_access', label: 'Accès complet' }
  ];

  // Use store's role mapping
  const { mapRoleToAPI, mapAPIToDisplay } = useUserStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-gray-900 text-xl font-bold">
            <UserCheck className="h-6 w-6 text-gray-600" />
            Modifier le rôle du membre
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Modifiez le rôle de ce membre dans la clinique. Les permissions seront mises à jour en conséquence.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  {member.name || `${member.firstName} ${member.lastName}`}
                </p>
                <p className="text-gray-600 text-base mt-1">
                  {member.email}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Rôle actuel: {mapRoleToAPI(member.role)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Nouveau rôle
              </label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="h-12 text-base border-2 border-gray-300 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="text-base text-gray-700">
                <p className="font-bold mb-2">Attention :</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 font-bold">•</span>
                    <span>Le changement de rôle affecte les permissions du membre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 font-bold">•</span>
                    <span>Vous ne pouvez pas modifier votre propre rôle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 font-bold">•</span>
                    <span>Vous ne pouvez modifier que les rôles inférieurs au vôtre</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-xl text-base font-medium border-2 ${message.includes('succès')
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
              }`}>
              {message}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={onOpenChange}
            disabled={loading}
            className="flex-1 h-12 text-base font-semibold border-2"
          >
            Annuler
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading || !newRole || newRole === mapRoleToAPI(member.role)}
            className="flex-1 h-12 text-base font-semibold bg-[#7564ed] hover:bg-[#6a4fd8] text-white border-2 border-[#7564ed]"
          >
            {loading
              ? "Mise à jour..."
              : "Mettre à jour le rôle"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 