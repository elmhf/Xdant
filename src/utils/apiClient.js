"use client";
import { toast } from "sonner";
import axios from "axios";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
// const BACKEND_URL = RAW_BACKEND_URL.replace(/\/$/, '');
/**
 * Custom error class for API requests
 */
export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/**
 * General API client for making authenticated requests.
 * Handles:
 * - Base URL prepending
 * - Credentials (HttpOnly cookies)
 * - JSON parsing
 * - Error handling (toast & throwing)
 * - Automatic token refreshing on 401
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/api/users').
 * @param {object} [options={}] - Fetch options (method, headers, body, etc.).
 * @returns {Promise<any>} - The parsed JSON response.
 */
export async function apiClient(endpoint, options = {}) {

    // Ensure endpoint starts with / if not a full URL
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${BACKEND_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    // If body is FormData, remove Content-Type to let browser set it with boundary
    if (options.body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include', // Important for HttpOnly cookies
    };

    try {
        let response = await fetch(url, config);
        console.log(response);
        // Handle 401 Unauthorized (Token Expiry)
        if (response.status === 401) {
            // Attempt to refresh token
            try {
                const refreshResponse = await fetch(`${BACKEND_URL}/api/refresh-token`, {
                    method: 'POST',
                    credentials: 'include',
                });

                if (refreshResponse.ok) {
                    // Retry the original request
                    response = await fetch(url, config);
                } else {
                    // Refresh failed - redirect to login
                    throw new Error('Session expired');
                }
            } catch (refreshError) {
                // If refresh fails, or network error during refresh
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                throw new ApiError('Session expired. Please login again.', 401);
            }
        }

        // Read response data once
        let data = null;
        try {
            // Check if there is content to read (204 No Content has no body)
            if (response.status !== 204) {
                data = await response.json();
            }
        } catch (e) {
            // Failed to parse JSON, data remains null
        }

        // Handle errors
        if (!response.ok) {
            let errorMessage = 'An error occurred';

            if (data) {
                errorMessage = data.message || data.error || errorMessage;
            } else {
                errorMessage = response.statusText;
            }

            // Show toast for non-401 errors (401 is handled by redirect usually)
            if (response.status !== 401) {
                toast.error(errorMessage);
            }

            // Throw error with data if available
            throw new ApiError(errorMessage, response.status, data);
        }

        return data;

    } catch (error) {
        // If it's already our ApiError, rethrow it
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle network errors or other unexpected errors
        const message = error.message || 'Network error';
        // toast.error(message); // Optional: decide if you want to toast generic network errors
        throw new ApiError(message, 500, null);
    }
}

/**
 * API Client specifically for file uploads (uses Axios for progress tracking).
 * Handles:
 * - Credentials (HttpOnly cookies)
 * - Automatic token refreshing on 401
 * - Upload progress
 * 
 * @param {string} endpoint - The API endpoint.
 * @param {FormData} formData - The data to upload.
 * @param {function} onUploadProgress - Callback for upload progress.
 * @param {object} options - Additional axios options.
 */
export async function apiUploadClient(endpoint, formData, onUploadProgress, options = {}) {
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${BACKEND_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const config = {
        ...options,
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
            ...options.headers,
        },
        onUploadProgress,
    };

    try {
        const response = await axios.post(url, formData, config);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            // Attempt refresh
            try {
                await axios.post(`${BACKEND_URL}/api/refresh-token`, {}, { withCredentials: true });
                // Retry original request
                const response = await axios.post(url, formData, config);
                return response.data;
            } catch (refreshError) {
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                throw new ApiError('Session expired. Please login again.', 401);
            }
        }

        // Handle other errors
        const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Upload failed';
        toast.error(message);
        throw new ApiError(message, error.response?.status || 500, error.response?.data);
    }
}
