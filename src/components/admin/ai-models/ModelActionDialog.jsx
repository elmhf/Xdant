import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const ModelActionDialog = ({
    open,
    onOpenChange,
    actionType, // 'activate' or 'deactivate'
    targetName, // Model Name or Model Type Name
    onConfirm,
    loading
}) => {
    if (!actionType) return null;

    const isActivate = actionType === 'activate';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border text-left border-gray-200 shadow-xl max-w-lg sm:max-w-[500px] p-6 gap-4">
                <DialogHeader className="p-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            {isActivate ? 'Activate Model' : 'Revert to Default'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Confirmation Text */}
                <div className="flex flex-col gap-1 py-2">
                    <p className="text-gray-600 text-lg">
                        {isActivate ? (
                            <>
                                Are you sure you want to set <span className="font-bold text-gray-900">{targetName}</span> as the active model?
                            </>
                        ) : (
                            <>
                                Are you sure you want to revert <span className="font-bold text-gray-900">{targetName}</span> to the system default?
                            </>
                        )}
                    </p>
                    <p className="text-gray-500 text-base">
                        {isActivate
                            ? "This will immediately affect all new processings."
                            : "Any custom model currently active for this type will be deactivated."}
                    </p>
                </div>

                <DialogFooter className="p-0 gap-3 mt-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="h-10 px-6 text-base font-semibold text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-2xl"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`h-10 px-6 text-lg font-bold border-3 border-transparent rounded-2xl shadow-none cursor-pointer ${isActivate
                                ? "bg-[#EBE8FC] hover:border-[#7564ed] text-[#7564ed]"
                                : "bg-orange-50 hover:border-orange-500 text-orange-600 hover:bg-orange-100"
                            }`}
                    >
                        {loading
                            ? "Processing..."
                            : isActivate ? "Activate" : "Revert"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
