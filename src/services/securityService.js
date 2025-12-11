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
    return data; // { two_factor_enabled: boolean }
}
