import Link from 'next/link';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, MoreVertical, Eye, CheckCircle, XCircle } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import ReportDetailsDialog from './ReportDetailsDialog';

export default function IncidentReportsTable({ reports, loading, onUpdate }) {
    const [selectedReport, setSelectedReport] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const handleRowClick = (report) => {
        setSelectedReport(report);
        setIsDialogOpen(true);
    };

    const fetchReports = () => {
        if (onUpdate) onUpdate();
    }

    // Status badge helper
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</span>;
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" /> Pending</span>;
            case 'closed':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" /> Closed</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <div className="  flex flex-col h-full">
            <div className="flex mb-6 items-center justify-between">
                <div className="space-y-1">
                    <p className="text-4xl font-semibold text-gray-900">Incident Reports</p>
                    <p className="text-xl text-gray-500">Manage and track reported incidents.</p>
                </div>
            </div>
            <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 flex-1">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">ID</th>
                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Reported By</th>
                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Subject</th>
                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Date</th>
                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Completed At</th>
                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                            <th className="text-right py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : reports?.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <AlertTriangle className="h-10 w-10 text-gray-300" />
                                            </EmptyMedia>
                                            <EmptyTitle className="text-lg font-semibold text-gray-900 mt-2">
                                                No incidents found
                                            </EmptyTitle>
                                            <EmptyDescription className="text-gray-500">
                                                There are currently no incident reports to display.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </td>
                            </tr>
                        ) : (
                            reports?.map((report) => (
                                <tr
                                    key={report.id}
                                    onClick={() => handleRowClick(report)}
                                    className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                >
                                    <td className="py-4 px-6 text-sm font-mono text-gray-500">
                                        #{String(report.id || '').substring(0, 6)}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 rounded-full bg-gray-100">
                                                <AvatarImage src={report.user?.profilePhotoUrl} />
                                                <AvatarFallback className="text-xs bg-[#F3F1FF] text-[#7564ed]">
                                                    {report.user?.name?.[0] || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {report.user?.firstName} {report.user?.lastName}
                                                </span>
                                                <span className="text-xs text-gray-500">{report.user?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-900 font-medium max-w-xs truncate">
                                        {report.description?.length > 30
                                            ? `${report.description.substring(0, 30)}...`
                                            : report.description}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">
                                        {report.completed_at ? new Date(report.completed_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="py-4 px-6">
                                        {getStatusBadge(report.status)}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#7564ed] hover:bg-[#F3F1FF]">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            <ReportDetailsDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                report={selectedReport}
                onUpdate={onUpdate}
            />
        </div >
    );
}
