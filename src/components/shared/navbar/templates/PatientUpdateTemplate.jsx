import React from 'react';

/**
 * Patient Update Template
 * Used when patient information is updated
 */
export const PatientUpdateTemplate = ({ notification }) => {
    const patientName = notification.meta_data?.patient_name || 'Patient';
    const updateType = notification.meta_data?.update_type || 'updated';

    return (
        <div className="text-[15px] text-gray-700 leading-relaxed">
            <span className="font-semibold text-gray-900">{patientName}'s</span>
            <span className="text-gray-500"> information was {updateType}</span>
        </div>
    );
};
