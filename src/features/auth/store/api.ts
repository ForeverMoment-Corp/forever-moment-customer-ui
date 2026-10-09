const API_BASE = import.meta.env.VITE_API_URL || '/api/platform';

export async function googleLogin(idToken: string) {
    const response = await fetch(`${API_BASE}/auth/social/google`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
    });

    let body = null;
    try {
        body = await response.json();
    } catch {
        // ignore
    }

    if (!response.ok) {
        throw new Error(body?.msg || `Google login failed: ${response.statusText || response.status}`);
    }

    return body?.response ?? null;
}
