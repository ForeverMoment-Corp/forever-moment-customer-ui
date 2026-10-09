const API_BASE = import.meta.env.VITE_API_URL || '/api/platform';

/**
 * POST a JSON body to an auth endpoint and unwrap `{ code, status, msg, response, errors }`.
 * Failures surface the backend's own message (e.g. "Please register before logging in...").
 */
async function postAuth<T>(path: string, payload: unknown, fallbackMessage: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    let body = null;
    try {
        body = await response.json();
    } catch {
        // ignore
    }

    if (!response.ok) {
        const validation = Array.isArray(body?.errors) && body.errors.length > 0 ? body.errors.join(', ') : null;
        throw new Error(validation || body?.msg || `${fallbackMessage}: ${response.statusText || response.status}`);
    }

    return body?.response ?? null;
}

export function googleLogin(idToken: string) {
    return postAuth('/auth/social/google', { idToken }, 'Google login failed');
}

/** POST /auth/login — email + password; returns the AuthResponse (token, refreshToken, email, ...). */
export function emailLogin(email: string, password: string) {
    return postAuth('/auth/login', { email, password }, 'Login failed');
}
