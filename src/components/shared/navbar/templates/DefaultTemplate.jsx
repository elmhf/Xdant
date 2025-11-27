import React from 'react';

/**
 * Default Template
 * Used for generic notifications that don't match any specific type
 */
export const DefaultTemplate = ({ notification }) => {
    return (
        <div className="text-[15px] text-gray-700 leading-relaxed">
            <span className="text-gray-900 font-medium">{notification.title}</span>
            {notification.message && (
                <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
            )}
        </div>
    );
};
