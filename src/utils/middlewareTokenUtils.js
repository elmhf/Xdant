/**
 * Lightweight JWT utilities for use in Next.js Middleware (Edge Runtime).
 * IMPORTANT: No external imports allowed here — Edge Runtime is very limited.
 */

/** Parse a JWT payload without verification (middleware only checks expiry). */
function parseJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // atob is available in Edge Runtime
        const json = atob(base64);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

/** Returns true if the token is expired or invalid. */
export function isTokenExpired(token) {
    if (!token) return true;
    const payload = parseJwtPayload(token);
    if (!payload || !payload.exp) return true;
    return Date.now() > payload.exp * 1000;
}

/** Extract a specific cookie value from a raw cookie header string. */
function getCookieValue(cookieString, name) {
    if (!cookieString) return null;
    const match = cookieString
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith(`${name}=`));
    return match ? match.slice(name.length + 1) : null;
}

/** Get the regular user access token from the cookie string. */
export function getUserToken(cookieString) {
    return getCookieValue(cookieString, 'access_token');
}

/** Get the admin access token from the cookie string. */
export function getAdminToken(cookieString) {
    return getCookieValue(cookieString, 'access_token_admin');
}
