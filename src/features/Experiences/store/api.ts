import type { AddonCatalogueItem, ApiEnvelope, ExperienceAddon, ExperienceDetailResponse, ExperienceListItem } from './types';
import { preloadWhenIdle, shouldPrefetch } from '@/lib/images';
import { getPrefetchableImages } from '../utils/primaryImage';
import { isNumericId } from '../utils/slug';

const API_BASE = import.meta.env.VITE_API_URL || '/api/platform';

/**
 * Fetch a public endpoint and unwrap the `{ code, status, msg, response }` envelope.
 * On a non-2xx status the backend message (e.g. "Experience not found with slug 'x'")
 * is surfaced so the UI can show it instead of a bare status text.
 */
async function getPublic<T>(path: string, fallbackMessage: string, emptyOn404?: T): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`);
    let body: Partial<ApiEnvelope<T>> | null = null;
    try {
        body = (await response.json()) as ApiEnvelope<T>;
    } catch {
        body = null;
    }
    // List endpoints answer 404 when nothing matches. That is an empty result, not a failure,
    // so the caller gets an empty list and the UI shows its empty state instead of an error.
    if (response.status === 404 && emptyOn404 !== undefined) {
        return emptyOn404;
    }
    if (!response.ok) {
        throw new Error(body?.msg || `${fallbackMessage}: ${response.statusText || response.status}`);
    }
    return (body?.response ?? null) as T;
}

/** GET /public/experiences — all active experiences. */
export const fetchData = () =>
    getPublic<ExperienceListItem[]>('/public/experiences', 'Failed to fetch experiences', []);

/** GET /public/experiences/featured — experiences flagged as featured. */
export const fetchFeaturedExperiences = () =>
    getPublic<ExperienceListItem[]>('/public/experiences/featured', 'Failed to fetch featured experiences', []);

/* ------------------------------------------------------------------ */
/* Detail cache: dedupes in-flight requests and keeps responses briefly */
/* so a hover-prefetch is reused when the user actually navigates.     */
/* ------------------------------------------------------------------ */

const DETAIL_TTL_MS = 60_000;
const detailCache = new Map<string, { at: number; promise: Promise<ExperienceDetailResponse> }>();

function cachedDetail(path: string): Promise<ExperienceDetailResponse> {
    const hit = detailCache.get(path);
    if (hit && Date.now() - hit.at < DETAIL_TTL_MS) return hit.promise;
    const promise = getPublic<ExperienceDetailResponse>(path, 'Failed to fetch experience detail');
    detailCache.set(path, { at: Date.now(), promise });
    // Never cache a failure.
    promise.catch(() => detailCache.delete(path));
    return promise;
}

/** GET /public/experiences/{id} */
export const fetchExperienceDetail = (id: string | number) =>
    cachedDetail(`/public/experiences/${encodeURIComponent(String(id))}`);

/** GET /public/experiences/slug/{slug} */
export const fetchExperienceBySlug = (slug: string) =>
    cachedDetail(`/public/experiences/slug/${encodeURIComponent(slug)}`);

/**
 * Speculatively fetch an experience and warm its photos. Safe to call repeatedly
 * (hover, focus, touch); it is a no-op on metered/slow connections.
 */
export function prefetchExperience(e: { id: string | number; slug?: string | null }) {
    if (!shouldPrefetch()) return;
    const slug = e.slug?.trim();
    const request = slug && !isNumericId(slug) ? fetchExperienceBySlug(slug) : fetchExperienceDetail(e.id);
    request.then((detail) => preloadWhenIdle(getPrefetchableImages(detail))).catch(() => undefined);
}

/** GET /public/experiences/subcategory/{subCategoryId} */
export const fetchSubCategoryExperiences = (subCategoryId: string | number) =>
    getPublic<ExperienceListItem[]>(
        `/public/experiences/subcategory/${encodeURIComponent(String(subCategoryId))}`,
        'Failed to fetch sub-category experiences',
        [],
    );

/** GET /public/addons — every active add-on in the catalogue. */
export const fetchAddons = () =>
    getPublic<AddonCatalogueItem[]>('/public/addons', 'Failed to fetch add-ons', []);

/** GET /public/experiences/{experienceId}/addons — add-ons attached to one experience. */
export const fetchExperienceAddons = (experienceId: string | number) =>
    getPublic<ExperienceAddon[]>(
        `/public/experiences/${encodeURIComponent(String(experienceId))}/addons`,
        'Failed to fetch add-ons for this experience',
        [],
    );
