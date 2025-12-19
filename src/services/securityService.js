import { apiClient } from '@/utils/apiClient';

export async function initiate2FA() {
    return await apiClient('/api/security/initiate', {
        method: 'POST'
    });
}

export async function verify2FA(token, secret) {
    return await apiClient('/api/security/verify', {
        method: 'POST',
        body: JSON.stringify({ token, secret }),
    });
}

export async function initiateDisable2FA(password) {
    return await apiClient('/api/security/disable-initiate', {
        method: 'POST',
        body: JSON.stringify({ password }),
    });
}

export async function confirmDisable2FA(code) {
    return await apiClient('/api/security/disable-confirm', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
}

export async function getSecurityStatus() {
    return await apiClient('/api/security/');
}

export async function updateAutoSave(autosave) {
    return await apiClient('/api/security/autosave', {
        method: 'PUT',
        body: JSON.stringify({ autosave }),
    });
}

export async function initiateAccountDeletion(password) {
    return await apiClient('/api/auth/delete-account/initiate', {
        method: 'POST',
        body: JSON.stringify({ password }),
    });
}

export async function confirmAccountDeletion(code) {
    return await apiClient('/api/auth/delete-account/confirm', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
}
