
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Ban, Trash2, ShieldAlert } from "lucide-react";
import { format } from 'date-fns';

const BanInfoDialog = ({ open, onOpenChange, user, banDetails, onUnban }) => {
    if (!banDetails) return null;

    const formattedStartDate = banDetails.start_date ? format(new Date(banDetails.start_date), 'MMM d, yyyy') : 'Unknown';
    const formattedEndDate = banDetails.end_date ? format(new Date(banDetails.end_date), 'MMM d, yyyy') : 'Permanent';
    const isPermanent = !banDetails.end_date;

    const handleUnbanClick = () => {
        if (onUnban && user) {
            onUnban(user);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white p-6 border-0 shadow-2xl">
                <DialogHeader className="pb-4 border-b border-gray-100">
                    <DialogTitle className="text-3xl font-semibold text-gray-900 flex items-center gap-2">
                        Account Restriction
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Details for {user?.firstName} {user?.lastName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Minimalist Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">Restriction Type</span>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <span className="text-sm font-semibold text-gray-900 capitalize">
                                {banDetails.type?.toLowerCase() || 'Unknown'}
                            </span>
                        </div>
                    </div>

                    {/* Clean Reason Text */}
                    <div className="space-y-2">
                        <span className="text-sm font-medium text-gray-500">Reason</span>
                        <p className="text-sm text-gray-900 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100">
                            {banDetails.description || 'No reason provided.'}
                        </p>
                    </div>

                    {/* Simple Date Row */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Banned On</span>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-900 font-medium">
                                <Calendar className="h-4 w-4 text-gray-300" />
                                {formattedStartDate}
                            </div>
                        </div>
                        <div >
                            <span className="text-xs text-gray-400  uppercase tracking-wider font-medium">Expires On</span>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-900 font-medium">
                                <Calendar className="h-4 w-4 text-gray-300" />
                                {formattedEndDate}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-gray-500 hover:text-gray-900"
                    >
                        Close
                    </Button>
                    {onUnban && (
                        <Button
                            onClick={handleUnbanClick}
                            
                            className="text-lg font-bold bg-[#EBE8FC] text-[#7564ed] hover:outline-[#7564ed] hover:outline-4 transition-all duration-150 px-3 py-2 rounded-2xl flex items-center min-w-[6vw]"
                        >
                            Revoke Restriction
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BanInfoDialog;
