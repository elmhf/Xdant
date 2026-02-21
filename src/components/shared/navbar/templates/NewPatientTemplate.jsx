import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * New Patient Template
 * Used when a new patient is added to the clinic
 */
export const NewPatientTemplate = ({ notification }) => {
    const { t } = useTranslation();
    const patientName = notification.meta_data?.patient_name || t('common.new');
    const addedBy = notification.meta_data?.added_by;

    return (
        <div className="text-[15px] text-gray-700 leading-relaxed">
            <span className="font-semibold text-gray-900">{patientName}</span>
            <span className="text-gray-500"> {t('common.wasAddedToClinic')}</span>
            {addedBy && (
                <>
                    <span className="text-gray-500"> {t('common.by')} </span>
                    <span className="font-semibold text-gray-900">{addedBy}</span>
                </>
            )}
        </div>
    );
};
