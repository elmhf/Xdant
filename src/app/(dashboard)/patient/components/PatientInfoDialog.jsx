import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Mail, Calendar, Phone, Users } from "lucide-react";
import { formatPatientName, formatDateOfBirth, getPatientAvatarInitials } from '../utils/patientUtils';

const PatientInfoDialog = ({ isOpen, onClose, patient }) => {
    if (!patient) return null;

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'Unknown';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className=" rounded-2xl border-none shadow-xl p-8 bg-white">
                <div className="space-y-6">
                    {/* Patient Name and Title */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {formatPatientName(patient)}
                        </h2>
                        <p className="text-base text-gray-600 mt-1">
                            {patient.gender ? `${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}` : 'Patient'} | Age {calculateAge(patient.date_of_birth)}
                        </p>
                    </div>

                    {/* Location */}
                    {patient.address && (
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                            <p className="text-base text-gray-700">
                                {patient.address}
                            </p>
                        </div>
                    )}


                    {/* Contact Information */}
                    <div className="space-y-3 pt-2">
                        {/* Email */}
                        {patient.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                <p className="text-base text-gray-700">
                                    {patient.email}
                                </p>
                            </div>
                        )}

                        {/* Date of Birth */}
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            <p className="text-base text-gray-700">
                                {formatDateOfBirth(patient.date_of_birth)}
                            </p>
                        </div>

                        {/* Phone */}
                        {patient.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                <p className="text-base text-gray-700">
                                    {patient.phone}
                                </p>
                            </div>
                        )}

                        {/* Treating Doctors */}
                        {patient.treating_doctors && patient.treating_doctors.length > 0 && (
                            <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">Treating Doctors</p>
                                    {patient.treating_doctors.map((doctor, index) => (
                                        <p key={doctor.id || index} className="text-base text-gray-700">
                                            {doctor.first_name} {doctor.last_name}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PatientInfoDialog;
