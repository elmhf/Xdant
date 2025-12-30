import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronUp, ChevronDown, FileText, User, Calendar, CheckCircle2, AlertCircle, Clock, Eye, Trash2, Building2 } from "lucide-react";
import { format } from 'date-fns';

const ReportsTable = ({
    reports,
    sorting,
    onSort,
    loading,
    onViewReport,
    onDeleteReport
}) => {
    console.log(reports);
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'failed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return <CheckCircle2 className="w-3.5 h-3.5" />;
            case 'processing': return <Clock className="w-3.5 h-3.5" />;
            case 'failed': return <AlertCircle className="w-3.5 h-3.5" />;
            default: return <AlertCircle className="w-3.5 h-3.5" />;
        }
    };

    return (
        <div className="border border-gray-200 rounded-2xl overflow-x-auto bg-white shadow-sm">
            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="min-w-64 text-left py-4 px-6 text-gray-600 font-semibold text-sm">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span>Report Details</span>
                                </div>
                            </th>

                            <th className="min-w-56 text-left py-4 px-6 text-gray-600 font-semibold text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>Patient</span>
                                </div>
                            </th>

                            <th className="min-w-64 text-left py-4 px-6 text-gray-600 font-semibold text-sm">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    <span>Clinic</span>
                                </div>
                            </th>

                            <th className="min-w-40 text-left py-4 px-6 text-gray-600 font-semibold text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                                    <span>Status</span>
                                </div>
                            </th>

                            <th className="min-w-40 text-left py-4 px-6 text-gray-600 font-semibold text-sm">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>Date</span>
                                </div>
                            </th>

                            <th className="min-w-32 text-center py-4 px-6 text-gray-600 font-semibold text-sm">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-10 w-48 bg-gray-100 rounded-lg"></div></td>
                                    <td className="px-6 py-4"><div className="h-10 w-32 bg-gray-100 rounded-lg"></div></td>
                                    <td className="px-6 py-4"><div className="h-10 w-40 bg-gray-100 rounded-lg"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-24 bg-gray-100 rounded-full"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                                    <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-100 rounded-lg mx-auto"></div></td>
                                </tr>
                            ))
                        ) : reports && reports.length > 0 ? (
                            reports.map((report) => {
                                const reportId = report.report_id || report.id;
                                const reportType = report.raport_type || report.type || 'Panoramic Analysis';
                                return (
                                    <tr key={reportId} className="group hover:bg-gray-50/80 transition-all duration-200">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-10 w-14 rounded-lg shrink-0">
                                                    <AvatarImage src={report.report_image} className="object-cover" />
                                                    <AvatarFallback className="bg-gradient-to-br from-[#A196F3] to-[#7564ED] text-white text-xs font-bold rounded-lg w-full h-full">
                                                        {reportType?.substring(0, 4) || 'RPT'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm line-clamp-1" title={report.image_name || reportId}>
                                                        {report.image_name || `Report #${reportId?.toString().substring(0, 8) || 'Unknown'}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5 font-medium bg-gray-100 px-2 py-0.5 rounded-md inline-block">
                                                        {reportType}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{report.patient_name || 'Unknown Patient'}</p>
                                                    <p className="text-xs text-gray-500">{report.patient_email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                                    <AvatarImage src={report.clinic?.stamp_url} />
                                                    <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 text-xs font-bold">
                                                        {report.clinic?.name?.substring(0, 1).toUpperCase() || 'C'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{report.clinic?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{report.clinic?.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                                                {getStatusIcon(report.status)}
                                                {report.status || 'Processing'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 font-medium">
                                                {report.created_at ? format(new Date(report.created_at), 'MMM dd, yyyy') : '-'}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {report.created_at ? format(new Date(report.created_at), 'h:mm a') : ''}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2  transition-opacity">

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDeleteReport && onDeleteReport(report)}
                                                    className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 text-gray-400"
                                                    title="Delete Report"
                                                >
                                                    <Trash2 className="w-6 h-6" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-gray-900 font-semibold mb-1">No reports found</h3>
                                        <p className="text-gray-500 text-sm">No analysis reports match your current filters.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsTable;
