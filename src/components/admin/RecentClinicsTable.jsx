import Link from 'next/link';
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, User, ArrowRight } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

export default function RecentClinicsTable({ clinics, loading }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-4xl font-semibold text-gray-900">New Clinics</p>
                    <p className="text-md font-medium text-gray-500">Recently onboarded dental clinics.</p>
                </div>
                <Link href="/admin/dashboard/clinics">
                    <button className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </Link>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="w-full">
                    <thead className="bg-gray-100/20 border-b border-gray-200 sticky top-0 z-10 filter backdrop-blur-sm">
                        <tr>
                            <th className="min-w-64 text-left py-3 px-6 text-lg font-medium text-gray-700">Clinic Name</th>
                            <th className="min-w-32 text-left py-3 px-6 text-lg font-medium text-gray-700">Clinic ID</th>
                            <th className="min-w-32 text-center py-3 px-6 text-lg font-medium text-gray-700">Members</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8 mx-auto"></div></td>
                                </tr>
                            ))
                        ) : clinics.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <Building2 className="h-10 w-10 text-gray-400" />
                                            </EmptyMedia>
                                            <EmptyTitle className="text-xl font-semibold">
                                                No clinics found
                                            </EmptyTitle>
                                            <EmptyDescription className="text-gray-600 text-base">
                                                No new clinics available.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </td>
                            </tr>
                        ) : (
                            clinics.slice(0, 5).map((clinic) => (
                                <tr key={clinic.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="min-w-64 py-4 px-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 rounded-full shrink-0">
                                                <AvatarImage src={clinic.logo_url} alt={clinic.clinic_name} />
                                                <AvatarFallback className="bg-gradient-to-br from-[#A196F3] to-[#7564ED] text-white">
                                                    {clinic.clinic_name?.[0] || 'C'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-base font-medium text-gray-900">{clinic.clinic_name}</span>
                                                <span className="text-xs text-gray-400 font-mono">{clinic.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="min-w-32 py-4 px-4">
                                        <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            {clinic.id}
                                        </span>
                                    </td>
                                    <td className="min-w-32 py-4 px-4 text-center">
                                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium">
                                            {clinic.memberCount || 0}
                                        </span>
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
