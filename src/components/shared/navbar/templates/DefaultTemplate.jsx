import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Default Template
 * Used for generic notifications that don't match any specific type
 */
export const DefaultTemplate = ({ notification }) => {
    const { t } = useTranslation();
    const title = notification.meta_data?.titleKey ? t(notification.meta_data.titleKey, notification.meta_data) : notification.title;
    const message = notification.meta_data?.messageKey ? t(notification.meta_data.messageKey, notification.meta_data) : notification.message;

    return (
        <div className="text-[15px] text-gray-700 leading-relaxed">
            <span className="text-gray-900 font-medium">{title}</span>
            {message && (
                <p className="text-sm text-gray-500 mt-1">{message}</p>
            )}
        </div>
    );
};
