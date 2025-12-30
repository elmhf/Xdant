import Link from 'next/link';
import React from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Building2, ArrowRight } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

export default function RecentPatientsTable({ patients, loading }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <p className="text-4xl font-bold text-gray-900">New Patients</p>
                <Link href="/admin/dashboard/patients">
                    <button className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600">
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </Link>
            </div>
            <div className="overflow-x-auto flex-1">
                <table className="w-full">
                    <thead className="bg-gray-100/70 border-b border-gray-200 sticky top-0 z-10 filter backdrop-blur-sm">
                        <tr>
                            <th className="min-w-64 text-left py-3 px-6 text-md font-medium text-gray-500">Patient Name</th>
                            <th className="min-w-32 text-left py-3 px-6 text-md font-medium text-gray-500">Clinic</th>
                            <th className="min-w-32 text-left py-3 px-6 text-md font-medium text-gray-500">Date Added</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                </tr>
                            ))
                        ) : patients.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <User className="h-10 w-10 text-gray-400" />
                                            </EmptyMedia>
                                            <EmptyTitle className="text-xl font-semibold">
                                                No patients found
                                            </EmptyTitle>
                                            <EmptyDescription className="text-gray-600 text-base">
                                                No new patients registered.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </td>
                            </tr>
                        ) : (
                            patients.slice(0, 5).map((patient) => (
                                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="min-w-64 py-4 px-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 rounded-full shrink-0">
                                                <AvatarImage src={patient.image || patient.profilePhotoUrl} alt={`${patient.first_name} ${patient.last_name}`} />
                                                <AvatarFallback className="bg-gradient-to-br from-[#A196F3] to-[#7564ED] text-white">
                                                    {(patient.first_name?.[0] || 'P').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-base font-medium text-gray-900">
                                                {patient.first_name} {patient.last_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="min-w-32 py-4 px-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Building2 className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">{patient.clinic_name || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="min-w-32 py-4 px-4 text-gray-500 text-sm">
                                        {patient.created_at ? format(new Date(patient.created_at), 'MMM d, yyyy') : '-'}
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
