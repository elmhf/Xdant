import React from 'react';
import { Clock, Activity, FileText, CheckCircle2, AlertCircle, Timer } from 'lucide-react';
import Image from 'next/image';
import Lottie from "lottie-react";
import circleLoader from "@/components/shared/lottie/Insider-loading.json";

export default function IncidentReportsCard({ reports = [], loading = false }) {
    if (loading) {
        return (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-100/20 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Incident Reports</h3>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <Lottie animationData={circleLoader} loop={true} className="w-[150px] h-[150px]" />
                </div>
            </div>
        );
    }

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'resolved':
                return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2, label: 'Completed' };
            case 'in_progress':
            case 'treatment':
            case 'en tretment':
                return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Activity, label: 'In Treatment' };
            default: // pending
                return { bg: 'bg-amber-100', text: 'text-amber-700', icon: Timer, label: 'Pending' };
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-100/20 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">

                    <p className="text-4xl font-semibold text-gray-900 leading-none">Incident Reports</p>
                </div>
                <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">
                    {reports.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3 custom-scrollbar">
                {reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-center">
                        <FileText size={48} className="mb-3 opacity-20" />
                        <p className="font-medium">No reports found</p>
                        <p className="text-xs mt-1">Everything is running smoothly</p>
                    </div>
                ) : (
                    reports.map((report) => {
                        // Mock status if missing (for demo purposes based on user request to show status)
                        const statusData = getStatusStyle(report.status || 'pending');
                        const StatusIcon = statusData.icon;
                        const user = report.user || {};
                        const userName = user.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Unknown User';
                        const userInitials = userName.slice(0, 2).toUpperCase();

                        return (
                            <div
                                key={report.id}
                                className="group bg-white p-5 rounded-2xl border-1 border-gray-300 hover:border-[#7c3aed] transition-all duration-300"
                            >
                                {/* Card Header: Type & Status */}
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-gray-900 capitalize text-lg">
                                        {report.type_de_prob || 'Report'} Issue
                                    </h4>
                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusData.bg} ${statusData.text}`}>
                                        <StatusIcon size={12} strokeWidth={3} />
                                        {statusData.label}
                                    </span>
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-4">
                                    <Clock size={12} />
                                    {new Date(report.created_at).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-50 w-full mb-1"></div>

                                {/* Sender Info */}
                                <div className="flex items-center gap-1">
                                    <div className="relative">
                                        {user.profile_photo_url ? (
                                            <Image
                                                src={user.profile_photo_url}
                                                alt={userName}
                                                width={36}
                                                height={36}
                                                className="rounded-full object-cover border-2 border-white ring-2 ring-gray-50"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white ring-2 ring-gray-50">
                                                {userInitials}
                                            </div>
                                        )}
                                        {/* Online dot mock */}
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {userName}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.email || 'No email'}
                                        </p>
                                    </div>

                                    {/* Action/Details Arrow */}
                                    <button className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-300 hover:text-indigo-600">
                                        <div className="sr-only">View Details</div>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14" />
                                            <path d="m12 5 7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
