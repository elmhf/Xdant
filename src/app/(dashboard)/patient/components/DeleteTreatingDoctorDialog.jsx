import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const DeleteTreatingDoctorDialog = ({
    open,
    onOpenChange,
    doctor,
    patient,
    onConfirm,
    loading
}) => {
    if (!doctor) return null;
    console.log(patient, doctor, "patientpatientpatient")
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
                        Are you sure you want to remove this doctor?
                    </p>
                    {doctor && (
                        <div className="flex items-center gap-3 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <Avatar className="h-15 w-15 border-2 border-white shadow-sm">
                                {doctor.profilePhotoUrl ? (
                                    <AvatarImage src={doctor.profilePhotoUrl} />
                                ) : null}
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold">
                                    {((doctor.first_name || '').slice(0, 1) +
                                        (doctor.last_name || '').slice(0, 1)).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-lg font-medium text-gray-900">
                                    {doctor.first_name} {doctor.last_name}
                                </span>
                                <span className="text-lg font-medium text-gray-500">
                                    {doctor.email}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-0 gap-3 mt-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
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
