import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronUp, ChevronDown, Edit, MapPin, Phone, Building2, Globe, Trash2 } from "lucide-react";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

const ClinicsTable = ({
    clinics,
    sorting,
    onSort,
    loading,
    onEditClinic,
    onDeleteClinic
}) => {
    return (
        <div className="border border-gray-200 rounded-2xl overflow-x-auto">
            <div className="max-h-[85vh] overflow-y-auto">
                <table className="w-full">
                    <thead className="bg-gray-100/70 border-b border-gray-200 sticky top-0 z-10 filter backdrop-blur-sm">
                        <tr>
                            <th
                                className="min-w-80 text-left py-3 px-6 text-md font-medium text-gray-500 cursor-pointer hover:bg-gray-100/50 transition-colors"
                                onClick={() => onSort && onSort('name')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Clinic</span>
                                    {onSort && (
                                        <div className="flex flex-col">
                                            <ChevronUp className="w-3 h-3 text-gray-400" />
                                            <ChevronDown className="w-3 h-3 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </th>

                            <th className="min-w-64 text-left py-3 px-6 text-md font-medium text-gray-500 hidden lg:table-cell">
                                <div className="flex items-center space-x-1">
                                    <span>Contact</span>
                                </div>
                            </th>

                            <th className="min-w-32 text-center py-3 px-6 text-md font-medium text-gray-500">
                                Patients
                            </th>

                            <th className="min-w-32 text-center py-3 px-6 text-md font-medium text-gray-500">
                                Reports
                            </th>

                            <th className="min-w-56 text-left py-3 px-6 text-md font-medium text-gray-500 hidden md:table-cell">
                                <div className="flex items-center space-x-1">
                                    <span>Website</span>
                                </div>
                            </th>

                            <th className="min-w-32 text-center py-3 px-6 text-md font-medium text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // Simple Loading skeleton matching table structure
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse border-b border-gray-100">
                                    <td className="min-w-80 py-4 px-4"><div className="h-12 w-48 bg-gray-100 rounded-3xl"></div></td>
                                    <td className="min-w-64 py-4 px-4 hidden lg:table-cell"><div className="h-4 w-32 bg-gray-100 rounded"></div></td>
                                    <td className="min-w-32 py-4 px-4 text-center"><div className="h-4 w-12 bg-gray-100 rounded mx-auto"></div></td>
                                    <td className="min-w-32 py-4 px-4 text-center"><div className="h-4 w-12 bg-gray-100 rounded mx-auto"></div></td>
                                    <td className="min-w-56 py-4 px-4 hidden md:table-cell"><div className="h-8 w-24 bg-gray-100 rounded-full"></div></td>
                                    <td className="min-w-32 py-4 px-4"><div className="h-8 w-8 bg-gray-100 rounded-lg mx-auto"></div></td>
                                </tr>
                            ))
                        ) : clinics && clinics.length > 0 ? (
                            clinics.map((clinic, index) => (
                                <tr
                                    key={clinic.id || index}
                                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onEditClinic && onEditClinic(clinic)}
                                >
                                    <td className="min-w-80 py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 rounded-3xl shrink-0">
                                                <AvatarImage src={clinic.stamp_url} className="object-cover" />
                                                <AvatarFallback className="bg-gradient-to-br from-[#A196F3] to-[#7564ED] text-white text-sm font-semibold">
                                                    {clinic.name?.charAt(0) || 'C'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-base font-medium text-gray-900 truncate">
                                                    {clinic.clinic_name}
                                                </span>
                                                <span className="text-xs text-gray-400 font-light hidden sm:block">
                                                    ID: {clinic.id}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="min-w-64 py-4 px-4 hidden lg:table-cell">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-base font-medium text-gray-600 truncate max-w-[200px]" title={clinic.email}>
                                                {clinic.email || 'No email'}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                {clinic.phone || 'No phone'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="min-w-32 py-4 px-4 text-center">
                                        <span className="text-base font-medium text-gray-700">
                                            {clinic.patientCount !== undefined ? clinic.patientCount : '-'}
                                        </span>
                                    </td>

                                    <td className="min-w-32 py-4 px-4 text-center">
                                        <span className="text-base font-medium text-gray-700">
                                            {clinic.reportCount !== undefined ? clinic.reportCount : '-'}
                                        </span>
                                    </td>

                                    <td className="min-w-56 py-4 px-4 hidden md:table-cell">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                                            {clinic.website ? (
                                                <a
                                                    href={clinic.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-base font-medium truncate max-w-[200px] hover:text-[#7564ed] hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title={clinic.website}
                                                >
                                                    {clinic.website}
                                                </a>
                                            ) : (
                                                <span className="text-base font-medium truncate max-w-[200px] text-gray-400">
                                                    No website
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="min-w-32 py-4 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditClinic && onEditClinic(clinic);
                                                }}
                                                className="h-8 w-8 p-0 stroke-[2.5] text-gray-400 hover:text-[#7564ed] hover:bg-gray-100"
                                            >
                                                <Edit className="h-5 w-5 stroke-[2.5]" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteClinic && onDeleteClinic(clinic);
                                                }}
                                                className="h-8 w-8 p-0 stroke-[2.5] text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                title="Delete Clinic"
                                            >
                                                <Trash2 className="h-5 w-5 stroke-[2.5]" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <Building2 className="h-10 w-10 text-gray-400" />
                                            </EmptyMedia>

                                            <EmptyTitle className="text-xl font-semibold">
                                                No clinics found
                                            </EmptyTitle>

                                            <EmptyDescription className="text-gray-600 text-base">
                                                No clinics match your search criteria.
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

export default ClinicsTable;
