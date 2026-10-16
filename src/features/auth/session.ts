/**
 * Keeps the login alive. Access tokens last 24 h and refresh tokens 7 days (rotated on every use):
 * POST /auth/refresh with `Authorization: Bearer <refresh token>` returns a fresh pair.
 *
 * - startSessionKeepAlive(): refreshes shortly before the access token expires (checked on load,
 *   every few minutes and when the tab comes back into view), so plain fetch() calls that read
 *   `access_token` from storage never see an expired token.
 * - refreshSession(): one refresh at a time; the axios 401 handler (utils/Http) retries through it.
 */
import { getLoginSession, removeLoginSession, setLoginSession, storage } from '@/utils/storage';

const API_BASE = import.meta.env.VITE_API_URL || '/api/platform';
const REFRESH_KEY = 'refresh_token';
/** Refresh when the access token has less than this left. */
const REFRESH_AHEAD_MS = 10 * 60_000;
const CHECK_EVERY_MS = 5 * 60_000;

/**
 * Fired on window after a refresh (`token` = the new access token) or when the session ends
 * (`token` = null; `promptLogin` when it ended because it expired, so the user can sign in again).
 */
export const SESSION_EVENT = 'fm:session';
export interface SessionEventDetail {
    token: string | null;
    promptLogin?: boolean;
}

const emit = (detail: SessionEventDetail) => window.dispatchEvent(new CustomEvent<SessionEventDetail>(SESSION_EVENT, { detail }));

export interface TokenClaims {
    /** Auth user id: the value the gateway forwards as X-User-Id. */
    userId?: number;
    /** Comma-separated role names, e.g. "USER". */
    roles?: string;
    /** The sign-in email. */
    username?: string;
    exp?: number;
}

/** The access token's payload (not verified: only for reading our own id / role / expiry). */
export function tokenClaims(token: string | null | undefined): TokenClaims {
    if (!token) return {};
    try {
        const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(
            atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), '='))
                .split('')
                .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
                .join(''),
        );
        const payload = JSON.parse(json);
        return payload && typeof payload === 'object' ? payload : {};
    } catch {
        return {};
    }
}

/** The JWT's `exp` in ms, or null when the token cannot be read. */
function expiresAt(token: string | null): number | null {
    const { exp } = tokenClaims(token);
    return typeof exp === 'number' ? exp * 1000 : null;
}

/** True when the token has an expiry and it has passed. */
export const isTokenExpired = (token: string | null) => {
    const exp = expiresAt(token);
    return exp !== null && exp <= Date.now();
};

let inFlight: Promise<string | null> | null = null;

/**
 * Exchanges the refresh token for a new access + refresh token. Resolves the new access token, or
 * null when there is no refresh token or it was rejected (the session is then over).
 */
export function refreshSession(): Promise<string | null> {
    if (inFlight) return inFlight;
    inFlight = (async () => {
        const refreshToken = getLoginSession(REFRESH_KEY);
        if (!refreshToken) return null;
        try {
            const response = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { Accept: 'application/json', Authorization: `Bearer ${refreshToken}` },
            });
            if (!response.ok) {
                // Rejected (expired / revoked): the session cannot be renewed. Network errors keep it.
                if (response.status === 401 || response.status === 403 || response.status === 400) endSession({ promptLogin: true });
                return null;
            }
            const body = await response.json();
            // Bare AuthResponse today; accept the platform envelope too.
            const auth = body?.response ?? body;
            if (!auth?.token) return null;
            storage.setToken(auth.token);
            if (auth.refreshToken) setLoginSession(REFRESH_KEY, auth.refreshToken);
            emit({ token: auth.token });
            return auth.token as string;
        } catch {
            return null;
        } finally {
            setTimeout(() => {
                inFlight = null;
            }, 0);
        }
    })();
    return inFlight;
}

/** Clears the stored session and tells the app (main.tsx listens and logs out). */
export function endSession({ promptLogin = false }: { promptLogin?: boolean } = {}) {
    storage.clearToken();
    storage.clearUser();
    removeLoginSession(REFRESH_KEY);
    emit({ token: null, promptLogin });
}

/** Refresh now if the access token is expired or about to expire. */
export async function ensureFreshToken(): Promise<string | null> {
    const token = storage.getToken();
    if (!token) return null;
    const exp = expiresAt(token);
    if (exp !== null && exp - Date.now() > REFRESH_AHEAD_MS) return token;
    const fresh = await refreshSession();
    if (fresh) return fresh;
    if (exp !== null && exp > Date.now()) return token;
    // Expired and nothing to renew it with (e.g. a session from before refresh tokens were kept).
    if (!getLoginSession(REFRESH_KEY)) endSession({ promptLogin: true });
    return null;
}

let started = false;

/** Call once at startup. */
export function startSessionKeepAlive() {
    if (started) return;
    started = true;
    void ensureFreshToken();
    window.setInterval(() => void ensureFreshToken(), CHECK_EVERY_MS);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void ensureFreshToken();
    });
    // Logged out in another tab: follow it here (that tab already called /auth/logout).
    window.addEventListener('storage', (e) => {
        if (e.key === 'access_token' && !e.newValue) emit({ token: null });
    });
}

/**
 * POST /auth/logout revokes the refresh token (the backend reads the refresh token, not the
 * access token, from the Authorization header). Best effort: the local session is cleared anyway.
 */
export async function revokeSession() {
    const refreshToken = getLoginSession(REFRESH_KEY);
    if (!refreshToken) return;
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: { Accept: 'application/json', Authorization: `Bearer ${refreshToken}` },
        });
    } catch {
        // Offline: the token simply expires.
    }
}
