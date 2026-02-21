import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Report Update Template
 * Used when a report status changes
 */
export const ReportUpdateTemplate = ({ notification }) => {
    const { t } = useTranslation();

    // Check if we have translation keys first
    if (notification.meta_data?.messageKey) {
        const title = notification.meta_data?.titleKey ? t(notification.meta_data.titleKey, notification.meta_data) : t('notifications.reportStatusUpdatedTitle');
        const message = t(notification.meta_data.messageKey, notification.meta_data);

        return (
            <div className="text-[15px] text-gray-700 leading-relaxed">
                <span className="text-gray-900 font-medium">{title}</span>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
        );
    }

    const newStatus = notification.meta_data?.newStatus;
    const patientName = notification.meta_data?.patient_name;

    return (
        <div className="text-[15px] text-gray-700 leading-relaxed">
            {patientName && (
                <>
                    <span className="font-semibold text-gray-900">{patientName}</span>
                    <span className="text-gray-500"> {t('common.report')} </span>
                </>
            )}
            <span className="text-gray-500">{t('common.statusChangedTo')} </span>
            <span className="font-semibold text-gray-900">{newStatus}</span>
        </div>
    );
};
