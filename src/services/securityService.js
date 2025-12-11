const BACKEND_URL = 'http://localhost:5000';

export async function initiate2FA() {
    const res = await fetch(`${BACKEND_URL}/api/security/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to initiate 2FA');
    return data; // { secret, qrCode }
}

export async function verify2FA(token, secret) {
    const res = await fetch(`${BACKEND_URL}/api/security/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, secret }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Verification failed');
    return data; // { success: true }
}

export async function initiateDisable2FA(password) {
    const res = await fetch(`${BACKEND_URL}/api/security/disable-initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to initiate disable 2FA');
    return data;
}

export async function confirmDisable2FA(code) {
    const res = await fetch(`${BACKEND_URL}/api/security/disable-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to confirm disable 2FA');
    return data;
}

export async function getSecurityStatus() {
    const res = await fetch(`${BACKEND_URL}/api/security/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch security status');
    return data; // { two_factor_enabled: boolean, autosave: boolean }
}

export async function updateAutoSave(autosave) {
    const res = await fetch(`${BACKEND_URL}/api/security/autosave`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ autosave }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update autosave settings');
    return data;
}

export async function initiateAccountDeletion(password) {
    const res = await fetch(`${BACKEND_URL}/api/auth/delete-account/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
        const error = new Error(data.message || 'Failed to initiate account deletion');
        error.data = data; // store data for ownedClinics check
        throw error;
    }
    return data;
}

export async function confirmAccountDeletion(code) {
    const res = await fetch(`${BACKEND_URL}/api/auth/delete-account/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to confirm account deletion');
    return data;
}
