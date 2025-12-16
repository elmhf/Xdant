import { toast } from "sonner";

/**
 * A wrapper around the native fetch API that handles errors with toast notifications.
 * 
 * @param {string} url - The URL to fetch.
 * @param {object} options - The options for the fetch request.
 * @returns {Promise<any>} - The JSON response from the server.
 * @throws {Error} - Throws an error if the request fails, after showing a toast.
 */
export const fetchWithToast = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            // Attempt to parse the error message from the response body
            const errorData = await response.json().catch(() => ({}));
            const message = errorData.message || "An unexpected error occurred.";

            // Show error toast
            toast.error(message);

            // Throw error to allow caller to handle loading states etc.
            throw new Error(message);
        }

        // Return parsed JSON
        // Note: If some endpoints return void (204), this might fail. 
        // But for this use case (API calls expecting JSON), it's standard.
        // We can check Content-Length or code 204 if needed, but keeping it simple for now.
        return await response.json();
    } catch (error) {
        // If the error was already handled/thrown by the !response.ok block, we don't need to toast again?
        // Actually, if we throw above, it lands here.
        // So we need to distinguish between "already toasted" and "network error/other".

        // A simple hack: check if the error message matches what we just threw? 
        // Or just toast here ONLY.

        // REVISED STRATEGY: 
        // Do the toast inside the catch block for network errors.
        // Do the toast inside the !ok block for API errors.
        // BUT if I throw inside !ok, it comes to catch.

        // So:
        // Don't toast in catch if it was an API error (which we know by some flag? or just rethrow).

        // Better:
        // toast.error is idempotent-ish visually (stacking), but we don't want doubles.

        // Implementation:
        // If it's an API error (response !ok), we toast AND throw.
        // The catch block will catch it. We need to know not to toast again.

        // Let's rely on the caller structure. 
        // Actually, simpler: 

        if (error.message === "Failed to fetch") {
            toast.error("Network error. Please check your connection.");
        }

        // For checks that happened inside try block (API errors), we already toasted.
        // However, if we didn't toast yet (e.g. JSON parse error on success?), we might want to.

        throw error;
    }
};
