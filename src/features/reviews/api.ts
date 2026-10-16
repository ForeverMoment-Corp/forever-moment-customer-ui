/**
 * Reviews (platform service). Public reads are approved reviews only; a submitted review shows up
 * publicly once an admin approves it.
 */
import axios from '@/utils/Http';

const API_BASE = import.meta.env.VITE_API_URL || '/api/platform';

export interface Review {
    id: string | number;
    experienceId?: number;
    experienceName?: string;
    rating: number;
    title?: string;
    comment?: string;
    reviewerName: string;
    createdAt?: string | null;
    /** PENDING / APPROVED / REJECTED on the user's own reviews. */
    status?: string;
}

export interface RatingSummary {
    averageRating: number;
    reviewCount: number;
}

type Json = Record<string, unknown>;
const asObject = (value: unknown): Json => (value && typeof value === 'object' ? (value as Json) : {});

const toIso = (value: unknown): string | null => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.length >= 3) {
        const [y, mo, d, h = 0, mi = 0] = value.map(Number);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:00`;
    }
    return null;
};

const firstString = (o: Json, keys: string[]) => {
    for (const k of keys) if (typeof o[k] === 'string' && (o[k] as string).trim()) return (o[k] as string).trim();
    return undefined;
};

export function normalizeReview(value: unknown, index = 0): Review {
    const r = asObject(value);
    return {
        id: (r.id ?? r.reviewId ?? index) as string | number,
        experienceId: r.experienceId != null ? Number(r.experienceId) : undefined,
        experienceName: firstString(r, ['experienceName', 'experienceTitle']),
        rating: Math.max(0, Math.min(5, Number(r.rating) || 0)),
        title: firstString(r, ['title']),
        comment: firstString(r, ['comment', 'text', 'content']),
        reviewerName: firstString(r, ['reviewerName', 'userFullName', 'fullName', 'userName', 'username', 'name']) || 'Guest',
        createdAt: toIso(r.createdAt ?? r.reviewDate ?? r.updatedAt),
        status: typeof r.status === 'string' ? r.status.toUpperCase() : undefined,
    };
}

/** `{ code, msg, response }` → response; also accepts a page (`content`) or a bare array. */
function listOf(body: unknown): Review[] {
    const envelope = asObject(body);
    const data = 'response' in envelope ? envelope.response : body;
    const list = Array.isArray(data) ? data : Array.isArray(asObject(data).content) ? (asObject(data).content as unknown[]) : [];
    return list.map(normalizeReview);
}

async function getPublic(path: string): Promise<unknown> {
    const response = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Could not load reviews: ${response.status}`);
    return response.json();
}

/** GET /public/reviews?limit — approved reviews across all experiences, newest first. */
export async function fetchRecentReviews(limit = 20): Promise<Review[]> {
    return listOf(await getPublic(`/public/reviews?limit=${limit}`));
}

/** GET /public/reviews/experience/{id} — approved reviews of one experience. */
export async function fetchExperienceReviews(experienceId: number | string): Promise<Review[]> {
    return listOf(await getPublic(`/public/reviews/experience/${encodeURIComponent(String(experienceId))}`));
}

/** GET /public/reviews/experience/{id}/summary — average rating and count. */
export async function fetchRatingSummary(experienceId: number | string): Promise<RatingSummary> {
    const body = asObject(await getPublic(`/public/reviews/experience/${encodeURIComponent(String(experienceId))}/summary`));
    const data = asObject('response' in body ? body.response : body);
    return { averageRating: Number(data.averageRating) || 0, reviewCount: Number(data.reviewCount) || 0 };
}

const userHeaders = () => {
    const raw = localStorage.getItem('forever_moment_user');
    let id = '';
    try {
        id = raw ? String(JSON.parse(raw)?.id ?? '') : '';
    } catch {
        id = '';
    }
    return id ? { 'X-User-Id': id } : {};
};

const errorMessage = (e: unknown, fallback: string) => {
    const data = (e as { response?: { data?: { msg?: string; message?: string; errors?: string[] } } })?.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length) return data.errors.join(', ');
    return data?.msg || data?.message || fallback;
};

/** GET /user/reviews — the signed-in user's own reviews (any status). */
export async function fetchMyReviews(): Promise<Review[]> {
    try {
        const response = await axios.get('/user/reviews', { headers: userHeaders() });
        return listOf(response.data);
    } catch (e) {
        throw new Error(errorMessage(e, 'Could not load your reviews'));
    }
}

export interface ReviewInput {
    experienceId: number;
    rating: number;
    title?: string;
    comment?: string;
}

/** POST /user/reviews — published after admin approval. */
export async function submitReview(input: ReviewInput): Promise<Review | null> {
    try {
        const response = await axios.post(
            '/user/reviews',
            {
                experienceId: input.experienceId,
                rating: Math.round(input.rating),
                title: input.title?.trim() || undefined,
                comment: input.comment?.trim() || undefined,
            },
            { headers: userHeaders() },
        );
        const data = asObject(response.data).response;
        return data && typeof data === 'object' ? normalizeReview(data) : null;
    } catch (e) {
        throw new Error(errorMessage(e, 'Could not submit your review'));
    }
}
