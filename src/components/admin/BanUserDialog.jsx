"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addDays, addWeeks, addMonths, format } from "date-fns";
import { ShieldOff, Circle, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BanUserDialog({ open, onOpenChange, onConfirm, loading, userName }) {
    // Two mutually exclusive states
    const [isPermanent, setIsPermanent] = useState(false);
    const [isTemporary, setIsTemporary] = useState(false);

    // Only custom date is needed now
    const [customDate, setCustomDate] = useState(undefined);
    const [banReason, setBanReason] = useState('');

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            setIsPermanent(false);
            setIsTemporary(false);
            setBanReason('');
            setCustomDate(undefined);
        }
    }, [open]);

    // Handlers to ensure mutual exclusivity
    const handlePermanentChange = (checked) => {
        setIsPermanent(checked);
        if (checked) setIsTemporary(false);
    };

    const handleTemporaryChange = (checked) => {
        setIsTemporary(checked);
        if (checked) setIsPermanent(false);
    };

    // Calculate end date based on custom date
    const getEndDate = () => {
        if (!isTemporary) return null;
        return customDate;
    };

    const handleSubmit = () => {
        // Enforce selection
        if (!isPermanent && !isTemporary) return;

        onConfirm({
            type: isTemporary ? 'TEMPORARY' : 'PERMANENT',
            reason: banReason,
            end_date: isTemporary ? getEndDate() : null
        });
    };

    // Check if form is valid to submit
    const isValid = (isPermanent || isTemporary) &&
        (!isTemporary || customDate);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white p-6 border-0 shadow-2xl gap-8">
                <DialogHeader className="pb-0 border-0">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Restrict Access
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 text-base">
                        Manage access permissions for <span className="font-medium text-gray-900">{userName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8">

                    {/* Render Toggles */}
                    <div className="space-y-6">
                        {/* Option 1: Permanent Ban */}
                        <div className="flex items-center justify-between group">
                            <div className="space-y-1">
                                <Label className="text-lg font-semibold text-gray-900 cursor-pointer" onClick={() => handlePermanentChange(!isPermanent)}>
                                    Permanent Ban
                                </Label>
                                <p className="text-sm text-gray-500 max-w-[280px]">
                                    Completely revoke access to the account indefinitely.
                                </p>
                            </div>
                            <Switch
                                checked={isPermanent}
                                onCheckedChange={handlePermanentChange}
                                className={cn(
                                    "data-[state=checked]:bg-indigo-600 scale-110", // Indigo color and slightly larger
                                    isPermanent ? "" : "bg-gray-200"
                                )}
                            />
                        </div>

                        {/* Option 2: Temporary Ban */}
                        <div>
                            <div className="flex items-center justify-between group">
                                <div className="space-y-1">
                                    <Label className="text-lg font-semibold text-gray-900 cursor-pointer" onClick={() => handleTemporaryChange(!isTemporary)}>
                                        Temporary Restriction
                                    </Label>
                                    <p className="text-sm text-gray-500 max-w-[280px]">
                                        Suspend access for a specific period of time.
                                    </p>
                                </div>
                                <Switch
                                    checked={isTemporary}
                                    onCheckedChange={handleTemporaryChange}
                                    className={cn(
                                        "data-[state=checked]:bg-indigo-600 scale-110",
                                        isTemporary ? "" : "bg-gray-200"
                                    )}
                                />
                            </div>

                            {/* Date Selection (Only if Temporary) */}
                            {isTemporary && (
                                <div className="mt-6 pl-0 space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ban Expiration Date</Label>
                                    <div className="relative">
                                        <Popover modal={true}>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className={cn(
                                                        "w-full flex items-center justify-between p-4 rounded-xl text-base font-medium transition-all duration-200 border",
                                                        customDate
                                                            ? "bg-white text-indigo-900 border-indigo-100 ring-2 ring-indigo-50"
                                                            : "bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <CalendarIcon className={cn("h-5 w-5", customDate ? "text-indigo-600" : "text-gray-400")} />
                                                        <span>
                                                            {customDate
                                                                ? format(customDate, "PPP")
                                                                : "Select a date to lift the ban..."}
                                                        </span>
                                                    </div>
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0 rounded-2xl border-gray-100 shadow-xl z-[9999]"
                                                align="start"
                                                side="bottom"
                                                sideOffset={10}
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={customDate}
                                                    onSelect={setCustomDate}
                                                    initialFocus
                                                    disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                                                    className="rounded-xl bg-white p-4"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-lg font-semibold text-gray-900">
                                Reason
                            </Label>
                        </div>
                        <Input
                            placeholder="Why is this user being restricted?"
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            className="bg-gray-50 border-gray-200 h-12 rounded-xl focus-visible:ring-indigo-500 font-medium text-gray-900 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-6"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleSubmit}
                        disabled={loading || !isValid}
                        className={cn(
                            "px-8 rounded-xl font-medium transition-all duration-300 shadow-lg shadow-indigo-100",
                            !isValid
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        )}
                    >
                        {loading ? "Processing..." : "Confirm"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
