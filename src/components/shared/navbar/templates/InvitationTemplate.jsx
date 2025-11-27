import React from 'react';

/**
 * Invitation Template
 * Used for clinic invitation notifications
 */
export const InvitationTemplate = ({ notification }) => {
    const clinicName = notification.meta_data?.clinic_name;
    const clinicRole = notification.meta_data?.role;
    const status = notification.meta_data?.status;

    // If invitation has been answered (status is 'accepted' or 'rejected'), show the answer status
    if (status === 'accepted' || status === 'rejected') {
        return (
            <div className="text-[15px] text-gray-700 leading-relaxed">
                <span className="text-gray-500">You </span>
                <span className="font-semibold text-[#0d0c22]">
                    {status}
                </span>
                <span className="text-gray-500"> </span>
                <span className="font-semibold text-[#0d0c22]">@{clinicName}</span>
                <span className="text-gray-500"> invitation</span>
            </div>
        );
    }

    // Default invitation message
    return (
        <div className="text-[15px] text-gray-700 leading-relaxed">
            <span className="font-semibold text-gray-900">@{clinicName}</span>
            <span className="text-gray-500"> invited you as </span>
            <span className="font-semibold text-gray-900">{clinicRole}</span>
        </div>
    );
};
