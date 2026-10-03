import { getLoginSession } from '@/utils/storage';

const API_BASE = import.meta.env.VITE_API_URL || '/api/platform';

/**
 * Body of POST /public/support. The backend rejects unknown fields, so only these go out.
 *
 * The gateway treats /public/** as anonymous and never forwards the caller's identity, so
 * every submission is handled as a guest query: name, email and phone are always required.
 */
export interface SupportQueryRequest {
    name: string;
    email: string;
    phone: string;
    subject?: string;
    message: string;
}

export type SupportQueryStatus = 'OPEN' | 'RESOLVED' | (string & {});

export interface SupportQuery {
    id: number;
    referenceId: string;
    name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
    status: SupportQueryStatus;
    createdOn?: string | null;
    resolvedOn?: string | null;
}

/** Thrown by the signed-in endpoints when there is no session or it has expired. */
export class UnauthorizedError extends Error {
    constructor() {
        super('Please sign in to see your support queries');
        this.name = 'UnauthorizedError';
    }
}

export const getAccessToken = () => getLoginSession('access_token');

async function readEnvelope<T>(response: Response, fallbackMessage: string): Promise<T> {
    let body: { msg?: string; message?: string; response?: T } | null = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError();
    if (!response.ok) {
        throw new Error(body?.msg || body?.message || `${fallbackMessage}: ${response.statusText || response.status}`);
    }
    return (body?.response ?? null) as T;
}

/** POST /public/support — submit a contact/support query. Returns the saved query with its reference. */
export async function submitSupportQuery(request: SupportQueryRequest): Promise<SupportQuery> {
    const body: SupportQueryRequest = {
        name: request.name.trim(),
        email: request.email.trim(),
        phone: request.phone.trim(),
        message: request.message.trim(),
        ...(request.subject?.trim() ? { subject: request.subject.trim() } : {}),
    };
    const response = await fetch(`${API_BASE}/public/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
    });
    return readEnvelope<SupportQuery>(response, 'Could not send your message');
}

/** GET /user/support — the signed-in user's own queries, newest first. */
export async function fetchMySupportQueries(): Promise<SupportQuery[]> {
    const token = getAccessToken();
    if (!token) throw new UnauthorizedError();
    const response = await fetch(`${API_BASE}/user/support`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    const items = await readEnvelope<SupportQuery[] | null>(response, 'Could not load your support queries');
    return (Array.isArray(items) ? items : []).sort(
        (a, b) => new Date(b.createdOn ?? 0).getTime() - new Date(a.createdOn ?? 0).getTime(),
    );
}
