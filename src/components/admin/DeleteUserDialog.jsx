import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const DeleteUserDialog = ({
    open,
    onOpenChange,
    user,
    onConfirm,
    loading
}) => {
    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border text-left border-gray-200 shadow-xl max-w-lg sm:max-w-[500px] p-6 gap-4">
                <DialogHeader className="p-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            Delete User
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* Confirmation Text */}
                <div className="flex flex-col gap-1 py-2">
                    <p className="text-gray-600 text-lg">
                        Are you sure you want to delete <span className="font-bold text-gray-900">{user.firstName} {user.lastName}</span>?
                    </p>
                    {user.email && (
                        <p className="text-gray-500 text-base">
                            {user.email}
                        </p>
                    )}
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
                        className="h-10 px-6 text-lg font-bold bg-[#EBE8FC] border-3 border-transparent hover:border-[#7564ed] cursor-pointer text-[#7564ed] rounded-2xl shadow-none"
                    >
                        {loading ? "Deleting..." : "Delete User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
