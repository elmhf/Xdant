import Link from 'next/link';
import React from 'react';
import { format } from 'date-fns';
import { FileText, User, ArrowRight } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

export default function RecentReportsTable({ reports, loading }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-4xl font-semibold text-gray-900">Recent Reports</p>
                    <p className="text-md font-medium text-gray-500">Most recent radiological reports generated.</p>
                </div>
                <Link href="/admin/dashboard/reports">
                    <button className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </Link>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="w-full">
                    <thead className="bg-gray-100/20 border-b border-gray-200 sticky top-0 z-10 filter backdrop-blur-sm">
                        <tr>
                            <th className="min-w-32 text-left py-3 px-6 text-lg font-medium text-gray-700">Type</th>
                            <th className="min-w-64 text-left py-3 px-6 text-lg font-medium text-gray-700">Patient</th>
                            <th className="min-w-32 text-left py-3 px-6 text-lg font-medium text-gray-700">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                </tr>
                            ))
                        ) : reports.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <FileText className="h-10 w-10 text-gray-400" />
                                            </EmptyMedia>
                                            <EmptyTitle className="text-xl font-semibold">
                                                No reports found
                                            </EmptyTitle>
                                            <EmptyDescription className="text-gray-600 text-base">
                                                No recent analysis reports.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </td>
                            </tr>
                        ) : (
                            reports.slice(0, 5).map((report) => (
                                <tr key={report.id || report.report_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="min-w-32 py-4 px-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${report.raport_type === 'pano'
                                            ? 'bg-orange-50 text-orange-700 border-orange-100'
                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {report.raport_type || 'General'}
                                        </span>
                                    </td>
                                    <td className="min-w-64 py-4 px-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-base">{report.patient_name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="min-w-32 py-4 px-4 text-gray-500 text-sm">
                                        {report.created_at ? format(new Date(report.created_at), 'MMM d, yyyy') : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
