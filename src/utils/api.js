import { toast } from "sonner";

/**
 * A wrapper around the native fetch API that handles errors with toast notifications.
 * 
 * @param {string} url - The URL to fetch.
 * @param {object} options - The options for the fetch request.
 * @returns {Promise<any>} - The JSON response from the server.
 * @throws {Error} - Throws an error if the request fails, after showing a toast.
 */
import { apiClient, ApiError } from "./apiClient";
import { toast } from "sonner";

/**
 * A wrapper around the native fetch API that handles errors with toast notifications.
 * DEPRECATED: Use apiClient directly instead.
 * 
 * @param {string} url - The URL to fetch.
 * @param {object} options - The options for the fetch request.
 * @returns {Promise<any>} - The JSON response from the server.
 * @throws {Error} - Throws an error if the request fails, after showing a toast.
 */
export const fetchWithToast = async (url, options = {}) => {
    try {
        return await apiClient(url, options);
    } catch (error) {
        // apiClient already toasts errors, so we just rethrow
        // unless it's a specific requirement to re-toast (which duplicates it)
        // logic in original was: toast then throw. apiClient does: toast then throw.
        // So we just rethrow.
        throw error;
    }
};

