import { apiClient } from './apiClient';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://serverrouter.onrender.com';

/**
 * Dedicated API client for admin requests.
 * Uses the same cookie-based auth as apiClient but:
 * - Refreshes using the admin refresh endpoint
 * - Redirects to /admin/login on auth failure (not /login)
 */
export async function apiAdminClient(endpoint, options = {}) {
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${BACKEND_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const defaultHeaders = { 'Content-Type': 'application/json' };

    if (options.body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }

    const config = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
        credentials: 'include',
    };

    let response = await fetch(url, config);

    if (response.status === 401) {
        try {
            const refreshResponse = await fetch(`${BACKEND_URL}/api/admin/refresh-token`, {
                method: 'POST',
                credentials: 'include',
            });

            if (refreshResponse.ok) {
                // Retry original request
                response = await fetch(url, config);
            } else {
                throw new Error('Admin session expired');
            }
        } catch {
            if (typeof window !== 'undefined') {
                window.location.href = '/admin/login';
            }
            throw new Error('Admin session expired. Please log in again.');
        }
    }

    let data = null;
    try {
        if (response.status !== 204) {
            data = await response.json();
        }
    } catch { /* ignore parse errors */ }

    if (!response.ok) {
        const errorMessage = data?.message || data?.error || response.statusText || 'An error occurred';
        throw new Error(errorMessage);
    }

    return data;
}

/**
 * Dedicated upload (multipart) client for admin requests.
 * Uses axios for progress tracking, with admin-specific 401 handling.
 */
export async function apiAdminUploadClient(endpoint, formData, onUploadProgress, options = {}) {
    const url = endpoint.startsWith('http')
        ? endpoint
        : `${BACKEND_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const config = {
        ...options,
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data', ...options.headers },
        onUploadProgress,
        signal: options.signal,
    };

    try {
        const response = await axios.post(url, formData, config);
        return response.data;
    } catch (error) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
            throw error;
        }

        if (axios.isAxiosError(error) && error.response?.status === 401) {
            try {
                await axios.post(`${BACKEND_URL}/api/admin/refresh-token`, {}, { withCredentials: true });
                const response = await axios.post(url, formData, config);
                return response.data;
            } catch {
                if (typeof window !== 'undefined') {
                    window.location.href = '/admin/login';
                }
                throw new Error('Admin session expired. Please log in again.');
            }
        }

        const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Upload failed';
        throw new Error(message);
    }
}

export async function loginAdmin(email, password) {
    const data = await apiAdminClient('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    return data.user;
}

export async function logoutAdmin() {
    try {
        await apiAdminClient('/api/admin/logout', { method: 'POST' });
        if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
        }
    } catch (error) {
        console.error('Admin logout failed:', error);
    }
}

export async function checkAdminAuth() {
    try {
        const data = await apiAdminClient('/api/admin/me');
        return {
            isAuthenticated: true,
            user: data.user,
        };
    } catch {
        return { isAuthenticated: false, user: null };
    }
}
