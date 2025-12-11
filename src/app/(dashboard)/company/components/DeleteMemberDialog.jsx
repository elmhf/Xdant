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
import { AlertTriangle, UserX, Trash2 } from "lucide-react";

export const DeleteMemberDialog = ({
  open,
  onOpenChange,
  member,
  onConfirm,
  loading,
  message
}) => {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-gray-900 text-xl font-bold">
            <UserX className="h-6 w-6 text-gray-600" />
            Supprimer le membre
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Êtes-vous sûr de vouloir supprimer ce membre de la clinique ? Cette action ne peut pas être annulée.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  {member.name}
                </p>
                <p className="text-gray-600 text-base mt-1">
                  {member.email}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Rôle: {member.role}
                </p>
              </div>
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
                    <span>Le membre perdra l'accès à tous les patients de cette clinique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 font-bold">•</span>
                    <span>Il ne pourra plus voir les rendez-vous et les dossiers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 font-bold">•</span>
                    <span>Il devra être réinvité pour rejoindre la clinique</span>
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
            disabled={loading}
            className="flex-1 h-12 text-base font-semibold bg-[#ff254e] hover:bg-[#e01e3e] text-white border-2 border-[#ff254e]"
          >
            {loading
              ? "Suppression..."
              : "Supprimer le membre"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 