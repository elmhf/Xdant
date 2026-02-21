import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Report Update Template
 * Used when a report status changes
 */
export const ReportUpdateTemplate = ({ notification }) => {
    const { t } = useTranslation();
    const reportId = notification.meta_data?.reportId;
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
