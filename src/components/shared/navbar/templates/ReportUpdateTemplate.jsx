import React from 'react';

/**
 * Report Update Template
 * Used when a report status changes
 */
export const ReportUpdateTemplate = ({ notification }) => {
    const reportId = notification.meta_data?.reportId;
    const newStatus = notification.meta_data?.newStatus;
    const patientName = notification.meta_data?.patient_name;

    return (
        <div className="text-[15px] text-gray-700 leading-relaxed">
            {patientName && (
                <>
                    <span className="font-semibold text-gray-900">{patientName}'s</span>
                    <span className="text-gray-500"> report </span>
                </>
            )}
            <span className="text-gray-500">status changed to </span>
            <span className="font-semibold text-gray-900">{newStatus}</span>
        </div>
    );
};
