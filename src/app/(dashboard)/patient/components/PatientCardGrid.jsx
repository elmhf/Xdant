import React from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from "@/components/features/profile/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, Info, Edit, Trash2 } from "lucide-react";
import {
    formatPatientName,
    formatDateOfBirth,
    getPatientAvatarInitials
} from '../utils/patientUtils';

const PatientCardGrid = ({
    patients,
    onEditPatient,
    onDeletePatient,
    onToggleFavorite,
    onViewInfo,
    favoriteLoadingStates = {}
}) => {
    const router = useRouter();

    // Get user info and current clinic from store
    const user = useUserStore(state => state.userInfo);
    const currentClinic = useUserStore(state => state.currentClinicId);

    // Get user role for the current clinic from rolesByClinic
    const userRole = currentClinic && user?.rolesByClinic?.[currentClinic];

    // Check if user can edit/delete (admin or full_access)
    const canEditDelete = userRole === 'admin' || userRole === 'full_access';

    const handlePatientClick = (patient) => {
        router.push(`/patient/${patient.id}`);
    };

    const handleEditClick = (e, patient) => {
        e.stopPropagation();
        onEditPatient(patient);
    };

    const handleDeleteClick = (e, patient) => {
        e.stopPropagation();
        onDeletePatient(patient);
    };

    const handleFavoriteClick = (e, patient) => {
        e.stopPropagation();
        if (onToggleFavorite) {
            onToggleFavorite(patient);
        }
    };

    const handleInfoClick = (e, patient) => {
        e.stopPropagation();
        if (onViewInfo) {
            onViewInfo(patient);
        }
    };

    if (patients.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No patients found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {patients.map((patient, index) => (
                <div
                    key={patient.id || index}
                    onClick={() => handlePatientClick(patient)}
                    className="bg-white outline-0 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:outline-[#7564ed] hover:outline-offset-0 hover:outline-6"
                >
                    {/* X-ray Image */}
                    <div className="aspect-[16/9] bg-gray-900 relative overflow-hidden">
                        {patient.lastReportImageUrl ? (
                            <img
                                src={patient.lastReportImageUrl}
                                alt={formatPatientName(patient)}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#A196F3] to-[#7564ED]">
                                <span className="text-white text-6xl font-bold">
                                    {getPatientAvatarInitials(patient)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4">
                        {/* Patient Name & ID */}
                        <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
                            {formatPatientName(patient)}
                        </h3>
                        <p className="text-sm text-[#979eb0] mb-2">
                            Email: {patient.email && patient.email.length > 15
                                ? patient.email.substring(0, 15) + '...'
                                : patient.email}
                        </p>

                        {/* Date of Birth */}
                        <p className="text-sm text-gray-600 mb-3">
                            DOB: {formatDateOfBirth(patient.date_of_birth)}
                        </p>

                        {/* Treating Doctor */}
                        {patient.treating_doctors && patient.treating_doctors.length > 0 && (
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={patient.treating_doctors[0].profilePhotoUrl} />
                                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white text-xs font-semibold">
                                        {((patient.treating_doctors[0].first_name || '').slice(0, 1) +
                                            (patient.treating_doctors[0].last_name || '').slice(0, 1)).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-700 truncate">
                                    {patient.treating_doctors[0].first_name} {patient.treating_doctors[0].last_name}
                                </span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleFavoriteClick(e, patient)}
                                className={`h-9 w-9 p-0 ${patient.isFavorite
                                    ? 'text-[#ff254e] hover:bg-gray-100'
                                    : 'text-gray-400 hover:text-[#ff254e] hover:bg-gray-100'
                                    }`}
                                title={patient.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                disabled={favoriteLoadingStates[patient.id] || false}
                            >
                                {favoriteLoadingStates[patient.id] ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    <Heart className={`h-6 w-6 ${patient.isFavorite ? 'fill-current' : ''}`} />
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleInfoClick(e, patient)}
                                className="h-9 w-9 p-0 text-gray-400 hover:text-[#7564ed] hover:bg-gray-100"
                                title="View patient info"
                            >
                                <Info className="h-6 w-6" />
                            </Button>

                            {canEditDelete && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleEditClick(e, patient)}
                                        className="h-9 w-9 p-0 text-gray-400 hover:text-[#7564ed] hover:bg-gray-100"
                                        title="Edit patient"
                                    >
                                        <Edit className="h-6 w-6" />
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleDeleteClick(e, patient)}
                                        className="h-9 w-9 p-0 text-gray-400 hover:text-[#ff254e] hover:bg-gray-100"
                                        title="Delete patient"
                                    >
                                        <Trash2 className="h-6 w-6" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PatientCardGrid;
