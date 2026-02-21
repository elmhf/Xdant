import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Invitation Template
 * Used for clinic invitation notifications
 */
export const InvitationTemplate = ({ notification }) => {
    const { t } = useTranslation();
    const clinicName = notification.meta_data?.clinic_name;
    const clinicRole = notification.meta_data?.role;
    const status = notification.meta_data?.status;

    // If invitation has been answered (status is 'accepted' or 'rejected'), show the answer status
    if (status === 'accepted' || status === 'rejected') {
        return (
            <div className="text-[15px] text-gray-700 leading-relaxed">
                <span className="text-gray-500">{t('common.you')} </span>
                <span className="font-semibold text-[#0d0c22]">
                    {t(`common.${status}`)}
                </span>
                <span className="text-gray-500"> </span>
                <span className="font-semibold text-[#0d0c22]">@{clinicName}</span>
                <span className="text-gray-500"> {t('common.invitation')}</span>
            </div>
        );
    }

    // Default invitation message
    return (
        <div className="text-[15px] text-gray-700 leading-relaxed">
            <span className="font-semibold text-gray-900">@{clinicName}</span>
            <span className="text-gray-500"> {t('common.invitedYouAs')} </span>
            <span className="font-semibold text-gray-900">{clinicRole}</span>
        </div>
    );
};
