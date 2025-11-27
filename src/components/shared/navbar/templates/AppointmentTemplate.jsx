import React from 'react';

/**
 * Appointment Template
 * Used for appointment notifications
 */
export const AppointmentTemplate = ({ notification }) => {
    const patientName = notification.meta_data?.patient_name;
    const appointmentTime = notification.meta_data?.appointment_time;

    return (
        <div className="text-[15px] text-gray-700 leading-relaxed">
            <span className="text-gray-500">New appointment with </span>
            <span className="font-semibold text-gray-900">{patientName}</span>
            {appointmentTime && (
                <>
                    <span className="text-gray-500"> at </span>
                    <span className="font-semibold text-gray-900">{appointmentTime}</span>
                </>
            )}
        </div>
    );
};
