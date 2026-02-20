import { notification } from "@/components/shared/jsFiles/NotificationProvider";

/**
 * Generic toast function
 * This is now a wrapper around the new custom notification system
 * for backward compatibility.
 */
export const showToast = (templateName, title, options = {}) => {
    switch (templateName) {
        case 'success':
            notification.success(title);
            break;
        case 'error':
            notification.error(title);
            break;
        default:
            notification.info(title);
            break;
    }
};

// Kept for backward compatibility if needed, but redirects to the new generic one
export const showSuccessToast = (title) => {
    notification.success(title);
};

export const showErrorToast = (title) => {
    notification.error(title);
};
