import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
export const DeleteFileDialog = ({
    open,
    onOpenChange,
    file,
    onConfirm,
    loading
}) => {
    const { t } = useTranslation('patient');
    if (!file) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border text-left border-gray-200 shadow-xl max-w-lg sm:max-w-[500px] p-6 gap-4">
                <DialogHeader className="p-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-4xl font-bold text-gray-900">
                            {t('dentalData.deleteDialog.title')}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Confirmation Text */}
                <div className="flex flex-col gap-1 py-2">
                    <p className="text-gray-600 text-lg">
                        {t('dentalData.deleteDialog.confirm', { name: file.name })}
                    </p>
                    <p className="text-gray-500 text-base">
                        {t('dentalData.deleteDialog.undone')}
                    </p>
                </div>

                <DialogFooter className="p-0 gap-3 mt-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="h-10 px-6 text-base font-semibold  text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-2xl"
                    >
                        {t('dentalData.deleteDialog.cancel')}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className="h-10 px-6 text-lg font-bold bg-[#EBE8FC] border-3 border-transparent hover:border-[#7564ed] cursor-pointer text-[#7564ed]  rounded-2xl shadow-none"
                    >
                        {loading ? t('dentalData.deleteDialog.deleting') : t('dentalData.deleteDialog.delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
