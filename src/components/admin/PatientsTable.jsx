import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronUp, ChevronDown, Edit, User, Trash2, Building2 } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

const PatientsTable = ({
    patients,
    sorting,
    onSort,
    loading,
    onDeletePatient,
    onEditPatient
}) => {
    return (
        <div className="border border-gray-200 rounded-2xl overflow-x-auto">
            <div className="max-h-[85vh] overflow-y-auto">
                <table className="w-full">
                    <thead className="bg-gray-100/70 border-b border-gray-200 sticky top-0 z-10 filter backdrop-blur-sm">
                        <tr>
                            <th className="min-w-64 text-left py-3 px-6 text-md font-medium text-gray-500 cursor-pointer hover:bg-gray-100/50 transition-colors">
                                <div className="flex items-center space-x-1">
                                    <span>Patient</span>
                                </div>
                            </th>
                            <th className="min-w-64 text-left py-3 px-6 text-md font-medium text-gray-500 hidden md:table-cell">
                                <div className="flex items-center space-x-1">
                                    <span>Clinic</span>
                                </div>
                            </th>
                            <th className="min-w-48 text-left py-3 px-6 text-md font-medium text-gray-500 hidden md:table-cell">
                                <div className="flex items-center space-x-1">
                                    <span>Contact</span>
                                </div>
                            </th>
                            <th className="min-w-32 text-center py-3 px-6 text-md font-medium text-gray-500">
                                Created At
                            </th>
                            <th className="min-w-32 text-center py-3 px-6 text-md font-medium text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b border-gray-100">
                                    <td className="min-w-64 py-4 px-4"><div className="h-12 w-48 bg-gray-100 rounded-3xl"></div></td>
                                    <td className="min-w-64 py-4 px-4"><div className="h-4 w-32 bg-gray-100 rounded"></div></td>
                                    <td className="min-w-48 py-4 px-4"><div className="h-4 w-32 bg-gray-100 rounded"></div></td>
                                    <td className="min-w-32 py-4 px-4"><div className="h-4 w-24 bg-gray-100 rounded mx-auto"></div></td>
                                    <td className="min-w-32 py-4 px-4"><div className="h-8 w-8 bg-gray-100 rounded-lg mx-auto"></div></td>
                                </tr>
                            ))
                        ) : patients && patients.length > 0 ? (
                            patients.map((patient, index) => (
                                <tr
                                    key={patient.patient_id || index}
                                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onEditPatient && onEditPatient(patient)}
                                >
                                    <td className="min-w-64 py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 rounded-full shrink-0">
                                                <AvatarImage src={patient.image} />
                                                <AvatarFallback className="bg-gradient-to-br from-[#A196F3] to-[#7564ED] text-white">
                                                    {(patient.first_name?.[0] || 'P').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-base font-medium text-gray-900 truncate">
                                                    {patient.first_name} {patient.last_name}
                                                </span>
                                                <span className="text-xs text-gray-400 font-mono">
                                                    {patient.gender} • {patient.date_of_birth || 'No DOB'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="min-w-64 py-4 px-4 hidden md:table-cell">
                                        {patient.clinic_name ? (
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-700">{patient.clinic_name}</span>
                                                    <span className="text-xs text-gray-400">{patient.clinic_email}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="min-w-48 py-4 px-4 hidden md:table-cell">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-700">{patient.email || '-'}</span>
                                            <span className="text-xs text-gray-400">{patient.phone || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="min-w-32 py-4 px-4 text-center">
                                        <span className="text-sm text-gray-500">
                                            {patient.created_at ? new Date(patient.created_at).toLocaleDateString() : '-'}
                                        </span>
                                    </td>
                                    <td className="min-w-32 py-4 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditPatient && onEditPatient(patient);
                                                }}
                                                className="h-10 w-10 text-gray-400 hover:text-[#7564ed] hover:bg-[#7564ed]/10 rounded-xl transition-all duration-200"
                                                title="Edit Patient"
                                            >
                                                <Edit className="w-6 h-6 stroke-2" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeletePatient && onDeletePatient(patient);
                                                }}
                                                className="h-10 w-10 text-gray-400 hover:text-[#7564ed] hover:bg-[#7564ed]/10 rounded-xl transition-all duration-200"
                                                title="Delete Patient"
                                            >
                                                <Trash2 className="w-6 h-6 stroke-2" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <User className="h-10 w-10 text-gray-400" />
                                            </EmptyMedia>
                                            <EmptyTitle className="text-xl font-semibold">
                                                No patients found
                                            </EmptyTitle>
                                            <EmptyDescription className="text-gray-600 text-base">
                                                No patients match your search criteria.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientsTable;
