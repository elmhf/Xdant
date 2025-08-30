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
import { AlertTriangle, Building2 } from "lucide-react";

export const LeaveClinicDialog = ({ 
  open, 
  onOpenChange, 
  clinic, 
  onConfirm, 
  loading, 
  message 
}) => {
  if (!clinic) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Quitter la clinique
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir quitter cette clinique ? Cette action ne peut pas être annulée.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {clinic.clinic_name || clinic.clinicName || clinic.name}
              </h4>
              <p className="text-sm text-gray-500">
                {clinic.address || clinic.location || "Adresse non disponible"}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Attention :</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Vous perdrez l'accès à tous les patients de cette clinique</li>
                  <li>• Vous ne pourrez plus voir les rendez-vous et les dossiers</li>
                  <li>• Vous devrez être réinvité pour rejoindre la clinique</li>
                </ul>
              </div>
            </div>
          </div>
          
          {message && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              message.includes('succès') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Sortie en cours..." : "Quitter la clinique"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 