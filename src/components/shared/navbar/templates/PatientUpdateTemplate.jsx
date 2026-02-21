import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Patient Update Template
 * Used when patient information is updated
 */
export const PatientUpdateTemplate = ({ notification }) => {
    const { t } = useTranslation();
    const patientName = notification.meta_data?.patient_name || t('common.user');
    const updateType = notification.meta_data?.update_type || 'updated';

    return (
        <div className="text-[15px] text-gray-700 leading-relaxed">
            <span className="font-semibold text-gray-900">{patientName}</span>
            <span className="text-gray-500"> {t('common.informationWas')} {t(`common.${updateType}`)}</span>
        </div>
    );
};
