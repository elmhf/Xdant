import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Building2, Clock, Check, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/utils/apiClient";
import { toast } from "sonner";

export default function ReportDetailsDialog({ open, onOpenChange, report, onUpdate }) {
    const [status, setStatus] = useState(report?.status || 'pending');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (report) {
            setStatus(report.status);
        }
    }, [report]);

    if (!report) return null;

    const handleStatusUpdate = async (newStatus) => {
        setLoading(true);
        try {
            await apiClient('/api/admin/incident-report/update', {
                method: 'PUT',
                body: JSON.stringify({
                    reportId: report.id,
                    status: newStatus
                })
            });
            setStatus(newStatus);
            toast.success("Status updated successfully");
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-white text-gray-900 rounded-2xl border-gray-100 shadow-xl">
                <DialogHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold">Incident Report Details</DialogTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Status:</span>
                            <Select
                                value={status}
                                onValueChange={handleStatusUpdate}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[140px] h-8 text-xs bg-gray-50 border-gray-200 focus:ring-[#7564ed]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="investigating">Investigating</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            {loading && <Loader2 className="w-4 h-4 animate-spin text-[#7564ed]" />}
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</span>
                            <p className="font-mono text-sm text-gray-900">#{String(report.id || '').substring(0, 8)}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</span>
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {new Date(report.created_at).toLocaleString()}
                            </div>
                        </div>
                        {report.completed_at && (
                            <div className="space-y-1 col-span-2">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</span>
                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {new Date(report.completed_at).toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator className="bg-gray-100" />

                    {/* Reporter Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4" /> Reported By
                            </span>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-gray-100">
                                    <AvatarImage src={report.user?.profilePhotoUrl} />
                                    <AvatarFallback className="bg-[#F3F1FF] text-[#7564ed]">
                                        {report.user?.firstName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {report.user?.firstName} {report.user?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500">{report.user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {report.clinic && (
                            <div className="space-y-3">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> Clinic
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{report.clinic?.clinic_name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator className="bg-gray-100" />

                    {/* Content */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</span>
                            <p className="text-base font-medium text-gray-900">{report.subject}</p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</span>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
                                {report.description}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
