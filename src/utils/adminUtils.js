import { apiClient } from './apiClient';

export async function loginAdmin(email, password) {
    const data = await apiClient('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    return data.user;
}

export async function logoutAdmin() {
    try {
        await apiClient('/api/admin/logout', { method: 'POST' });
        if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
        }
    } catch (error) {
        console.error('Admin logout failed:', error);
    }
}

export async function checkAdminAuth() {
    try {
        const data = await apiClient('/api/admin/me');
        return {
            isAuthenticated: true,
            user: data.user,
        };
    } catch {
        return { isAuthenticated: false, user: null };
    }
}
