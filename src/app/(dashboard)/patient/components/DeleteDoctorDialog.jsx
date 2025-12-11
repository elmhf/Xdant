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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const DeleteDoctorDialog = ({
  open,
  close,
  onOpenChange,
  doctor,
  patient,
  onConfirm,
  loading,
  message
}) => {
  if (!doctor || !patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" bg-white border-2 border-gray-200 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-gray-900 text-xl font-bold">
            <UserX className="h-6 w-6 text-gray-600" />
            Remove Doctor
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Are you sure you want to remove this doctor from the patient? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg font-semibold">
                    {((doctor.first_name || '').slice(0, 1) +
                      (doctor.last_name || '').slice(0, 1)).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">
                  Dr. {doctor.first_name} {doctor.last_name}
                </p>
                <p className="text-gray-600 text-base mt-1">
                  {doctor.email || 'No email'}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Patient: {patient.first_name} {patient.last_name}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="text-base text-gray-700">
                <p className="font-bold mb-2">Warning:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 font-bold">•</span>
                    <span>This doctor will no longer be assigned to this patient</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 font-bold">•</span>
                    <span>The doctor will lose access to this patient's records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-600 font-bold">•</span>
                    <span>This action cannot be undone</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-xl text-base font-medium border-2 ${message.includes('success')
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
              }`}>
              {message}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button

            onClick={close}
            disabled={loading}
            className="flex-1 h-12 font-semibold text-[#0d0c22]"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-12  font-semibold bg-[#ff254e] hover:bg-[#e01e3e] text-white border-2 border-[#ff254e]"
          >
            {loading
              ? "Removing..."
              : "Remove Doctor"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};