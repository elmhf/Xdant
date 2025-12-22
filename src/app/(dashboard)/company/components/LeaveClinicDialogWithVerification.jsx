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
import { Input } from "@/components/ui/input";
import { AlertTriangle, LogOut, Lock, ArrowLeft } from "lucide-react";

export const LeaveClinicDialogWithVerification = ({
  open,
  onOpenChange,
  clinic,
  step,
  password,
  setPassword,
  error,
  leaving,
  leaveMessage,
  onVerifyPassword,
  onLeaveClinic,
  onBack
}) => {
  if (!clinic) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      onVerifyPassword();
    } else if (step === 2) {
      onLeaveClinic();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" bg-white border-2 border-gray-200 shadow-2xl rounded-2xl max-w-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-gray-900 text-3xl font-bold">
            <AlertTriangle className="h-8 w-8 text-gray-600" />
            {step === 1 ? "Vérification requise" : "Quitter la clinique"}
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            {step === 1
              ? "Pour des raisons de sécurité, veuillez confirmer votre mot de passe avant de quitter la clinique."
              : "Êtes-vous sûr de vouloir quitter cette clinique ? Cette action ne peut pas être annulée."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Step 1: Password Verification */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <LogOut className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {clinic.clinic_name || clinic.clinicName || clinic.name}
                    </p>
                    <p className="text-gray-600 text-base mt-1">
                      {clinic.address || clinic.location || "Adresse non disponible"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-base font-semibold text-gray-700">
                  Mot de passe
                </label>
                <Input
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 text-base rounded-xl border-gray-200 focus:border-[#7564ed] focus:ring-2 focus:ring-[#7564ed]/20"
                  disabled={leaving}
                />
                {error && (
                  <p className="text-base text-red-600 font-medium">{error}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <LogOut className="h-8 w-8 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {clinic.clinic_name || clinic.clinicName || clinic.name}
                    </p>
                    <p className="text-gray-600 text-base mt-1">
                      {clinic.address || clinic.location || "Adresse non disponible"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="text-base text-gray-700">
                    <p className="font-bold mb-2">Attention :</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-600 font-bold">•</span>
                        <span>Vous perdrez l'accès à tous les patients de cette clinique</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-600 font-bold">•</span>
                        <span>Vous ne pourrez plus voir les rendez-vous et les dossiers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-600 font-bold">•</span>
                        <span>Vous devrez être réinvité pour rejoindre la clinique</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {leaveMessage && (
            <div className={`mt-4 p-4 rounded-xl text-base font-medium ${leaveMessage.includes('succès')
              ? 'bg-green-50 text-green-800 border-2 border-green-200'
              : 'bg-red-50 text-red-800 border-2 border-red-200'
              }`}>
              {leaveMessage}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={leaving}
            className="text-lg font-semibold border text-gray-600 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
          >
            {step === 1 ? "Annuler" : "Retour"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={leaving || (step === 1 && !password.trim())}
            className={`text-lg font-bold transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw] ${step === 2
              ? "bg-[#FF254E] hover:bg-[#ff4a5f] text-white border-0"
              : "bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4"
              }`}
          >
            {leaving
              ? (step === 1 ? "Vérification..." : "Sortie en cours...")
              : (step === 1 ? "Vérifier" : "Quitter la clinique")
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 