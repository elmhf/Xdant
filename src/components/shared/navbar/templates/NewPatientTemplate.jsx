import React from 'react';

/**
 * New Patient Template
 * Used when a new patient is added to the clinic
 */
export const NewPatientTemplate = ({ notification }) => {
    const patientName = notification.meta_data?.patient_name || 'New patient';
    const addedBy = notification.meta_data?.added_by;

    return (
        <div className="text-[15px] text-gray-700 leading-relaxed">
            <span className="font-semibold text-gray-900">{patientName}</span>
            <span className="text-gray-500"> was added to your clinic</span>
            {addedBy && (
                <>
                    <span className="text-gray-500"> by </span>
                    <span className="font-semibold text-gray-900">{addedBy}</span>
                </>
            )}
        </div>
    );
};
