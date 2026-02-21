import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from 'react-i18next';

export const DeleteTreatingDoctorDialog = ({
    open,
    onOpenChange,
    doctor,
    patient,
    onConfirm,
    loading
}) => {
    const { t } = useTranslation('patient');
    if (!doctor) return null;

    const avatarColor = 'bg-[#a855f7]';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border text-left border-gray-200 shadow-xl max-w-lg sm:max-w-[500px] p-6 gap-4">
                <DialogHeader className="p-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-4xl font-bold text-gray-900">
                            {t('deleteTreatingDoctor.title')}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Confirmation Text */}
                <div className="flex flex-col gap-4 py-2">
                    <p className="text-gray-600 text-lg">
                        {t('deleteDoctor.confirm')} <span className="font-bold text-gray-900">Dr. {doctor.first_name} {doctor.last_name}</span> {t('deleteTreatingDoctor.from')} <span className="font-bold text-gray-900">{patient?.first_name} {patient?.last_name}</span>?
                    </p>

                    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src={doctor.profilePhotoUrl} />
                            <AvatarFallback className={`${avatarColor} text-white text-xs font-bold`}>
                                {((doctor.first_name || '').slice(0, 1) +
                                    (doctor.last_name || '').slice(0, 1)).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                                Dr. {doctor.first_name} {doctor.last_name}
                            </span>
                            <span className="text-xs text-gray-500">{doctor.email}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-0 gap-3 mt-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="h-10 px-6 text-base font-semibold text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-2xl"
                    >
                        {t('deleteTreatingDoctor.cancel')}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className="h-10 px-6 text-lg font-bold bg-[#EBE8FC] border-3 border-transparent hover:border-[#7564ed] cursor-pointer text-[#7564ed] rounded-2xl shadow-none"
                    >
                        {loading ? t('deleteTreatingDoctor.removing') : t('deleteTreatingDoctor.remove')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteTreatingDoctorDialog;
