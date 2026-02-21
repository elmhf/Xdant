import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, UserPlus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClinicMembers } from "@/app/(dashboard)/company/hooks";
import { apiClient } from '@/utils/apiClient';
import { useNotification } from "@/components/shared/jsFiles/NotificationProvider";
import { useTranslation } from 'react-i18next';

export const AddDoctorDialog = ({
    isOpen,
    onClose,
    onDoctorAdded,
    patient,
    currentTreatingDoctors = []
}) => {
    const { t } = useTranslation('patient');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { clinicMembers } = useClinicMembers();
    const { pushNotification } = useNotification();

    const availableDoctors = clinicMembers.map(member => ({
        id: member.user_id || member.id,
        first_name: member.first_name || "",
        last_name: member.last_name || "",
        name: `${member.first_name || ""} ${member.last_name || ""}`.trim(),
        email: member.email || '',
        profilePhotoUrl: member.profilePhotoUrl || null
    })).filter(doctor => !currentTreatingDoctors.some(d => d.id === doctor.id));

    const handleAddDoctor = async (doctorId) => {
        if (!patient || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const treating_doctor_ids = [
                ...currentTreatingDoctors.map(d => d.id),
                doctorId
            ];

            const patientData = {
                patientId: patient.id,
                first_name: patient.first_name,
                last_name: patient.last_name,
                gender: patient.gender,
                date_of_birth: patient.date_of_birth,
                email: patient.email || "",
                phone: patient.phone || "",
                address: patient.address || "",
                treating_doctor_id: treating_doctor_ids
            };

            await apiClient('/api/patients/update', {
                method: 'PUT',
                body: JSON.stringify(patientData)
            });

            pushNotification("success", t('addDoctor.doctorAdded'));
            if (onDoctorAdded) onDoctorAdded();
            onClose();
        } catch (error) {
            console.error('Error adding doctor:', error);
            pushNotification("error", error.message || t('addDoctor.addFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white max-w-lg shadow-xl p-6 rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
                        {t('addDoctor.title')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-gray-500 text-sm">
                        {t('addDoctor.descWithPatient', { name: `${patient?.first_name} ${patient?.last_name || ''}`.trim() })}
                    </p>

                    <div className="relative">
                        <Select onValueChange={handleAddDoctor} disabled={isSubmitting}>
                            <SelectTrigger className="h-14 w-full text-base bg-white border-2 border-gray-100 hover:border-[#7564ed] hover:bg-[#7564ed]/5 rounded-2xl px-4 transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-2 font-medium text-gray-600 group-hover:text-[#7564ed]">
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    )}
                                    <span>{t('addDoctor.selectDoctor')}</span>
                                </div>
                            </SelectTrigger>
                            <SelectContent className="max-h-64 p-1 rounded-2xl border-gray-100 shadow-xl bg-white">
                                {availableDoctors.length > 0 ? (
                                    availableDoctors.map((doctor, index) => {
                                        const colors = ['bg-[#a855f7]', 'bg-[#22c55e]', 'bg-[#3b82f6]', 'bg-[#f59e0b]', 'bg-[#ec4899]', 'bg-[#14b8a6]'];
                                        const avatarColor = colors[index % colors.length];

                                        return (
                                            <SelectItem
                                                key={doctor.id}
                                                value={doctor.id}
                                                className="rounded-xl cursor-pointer my-1 focus:bg-[#7564ed]/10 focus:text-[#7564ed]"
                                            >
                                                <div className="flex items-center gap-3 py-1">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={doctor.profilePhotoUrl} />
                                                        <AvatarFallback className={`${avatarColor} text-white text-xs font-bold`}>
                                                            {((doctor.first_name || '').slice(0, 1) +
                                                                (doctor.last_name || '').slice(0, 1)).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col text-left">
                                                        <span className="font-semibold text-sm text-gray-900">
                                                            Dr. {doctor.first_name || ""} {doctor.last_name || ""}
                                                        </span>
                                                        <span className="text-xs text-gray-400">{doctor.email}</span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        );
                                    })
                                ) : (
                                    <div className="p-8 text-sm text-gray-500 text-center flex flex-col items-center gap-2">
                                        <UserPlus className="h-10 w-10 text-gray-200" />
                                        <p className="font-medium">{t('addDoctor.allAdded')}</p>
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="h-11 px-6 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl"
                        >
                            {t('addDoctor.cancel')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddDoctorDialog;
