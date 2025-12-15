import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="bg-white border text-left border-gray-200 shadow-xl max-w-lg sm:max-w-[500px] p-6 gap-4">
        <DialogHeader className="p-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-4xl font-bold text-gray-900">
              Remove Doctor
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Confirmation Text */}
        <div className="flex flex-col gap-1 py-2">
          <p className="text-gray-600 text-lg">
            Are you sure you want to remove <span className="font-bold text-gray-900">Dr. {doctor.first_name} {doctor.last_name}</span> from <span className="font-bold text-gray-900">{patient.first_name} {patient.last_name}</span>?
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('success')
            ? 'bg-green-50 text-green-800'
            : 'bg-red-50 text-red-800'
            }`}>
            {message}
          </div>
        )}

        <DialogFooter className="p-0 gap-3 mt-2">
          <Button
            variant="ghost"
            onClick={close}
            disabled={loading}
            className="h-10 px-6 text-base font-semibold  text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="h-10 px-6 text-lg font-bold bg-[#EBE8FC] border-3 border-transparent hover:border-[#7564ed] cursor-pointer text-[#7564ed]  rounded-lg shadow-none"
          >
            {loading ? "Removing..." : "Remove Doctor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};