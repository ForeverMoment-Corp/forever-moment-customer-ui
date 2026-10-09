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

/** GET /public/locations/{locationId}/experiences — all active experiences for location. */
export const fetchData = (locationId?: number) => {
    if (locationId) {
        return getPublic<ExperienceListItem[]>(`/public/locations/${encodeURIComponent(String(locationId))}/experiences`, 'Failed to fetch experiences', []);
    }
    return getPublic<ExperienceListItem[]>('/public/experiences', 'Failed to fetch experiences', []);
};

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

/** A serviceable pincode as returned by GET /public/locations/check-pincode. */
export interface PincodeArea {
    pincodeCode: string;
    areaName?: string | null;
    locationId: number;
    locationName?: string | null;
    locationCity?: string | null;
}

export interface PincodeServiceability {
    /** This experience can be set up at the pincode. */
    serviceable: boolean;
    /** Where the pincode is, when we cover it at all (even if not for this experience). */
    area: PincodeArea | null;
}

/**
 * GET /public/experiences/{id}/serviceable?pincode= and GET /public/locations/check-pincode?pincode=,
 * in parallel. Both answer 404 for a pincode we do not cover; that is "not serviceable", not an error.
 */
export async function checkPincodeServiceability(experienceId: string | number, pincode: string): Promise<PincodeServiceability> {
    const code = encodeURIComponent(pincode.trim());
    const [serviceable, area] = await Promise.all([
        getPublic<boolean>(
            `/public/experiences/${encodeURIComponent(String(experienceId))}/serviceable?pincode=${code}`,
            'Could not check this pincode',
            false,
        ),
        // The area only improves the message, so a failure here must not fail the check.
        getPublic<PincodeArea | null>(`/public/locations/check-pincode?pincode=${code}`, 'Could not look up this pincode', null).catch(() => null),
    ]);
    return { serviceable: serviceable === true, area };
}

/** GET /public/coupons/experiences/{experienceId} */
export const fetchExperienceCoupons = (experienceId: string | number) =>
    getPublic<any[]>(
        `/public/coupons/experiences/${encodeURIComponent(String(experienceId))}`,
        'Failed to fetch coupons',
        []
    );

export interface ValidateCouponRequest {
    code: string;
    experienceId?: number;
    bookingAmount?: number;
}

export interface CouponValidationResponse {
    isValid: boolean;
    discountAmount: number;
    discountType: 'PERCENTAGE' | 'FLAT';
    message?: string;
    finalPrice?: number;
}

/** POST /public/coupons/validate */
export async function validateCoupon(data: ValidateCouponRequest): Promise<CouponValidationResponse> {
    const response = await fetch(`${API_BASE}/public/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    let body: Partial<ApiEnvelope<CouponValidationResponse>> | null = null;
    try {
        body = await response.json() as ApiEnvelope<CouponValidationResponse>;
    } catch {
        body = null;
    }
    if (!response.ok) {
        throw new Error(body?.msg || `Failed to validate coupon: ${response.statusText || response.status}`);
    }
    return body?.response as CouponValidationResponse;
}

export interface BookingRequest {
    timeSlotMapperId: number;
    bookingDate: string; // YYYY-MM-DD
    guestCount: number;
    pincode: string;
    addonMapperIds: number[];
}

export interface BookingResponse {
    bookingId: string;
    // other fields as returned by the backend
    [key: string]: any;
}

/** POST /user/booking */
export async function createBooking(data: BookingRequest, user: { id: string | number; role: string }): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE}/user/booking`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-User-Id': String(user.id),
            'X-User-Roles': user.role,
            'Idempotency-Key': crypto.randomUUID(),
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify(data),
    });
    let body: Partial<ApiEnvelope<BookingResponse>> | null = null;
    try {
        body = await response.json() as ApiEnvelope<BookingResponse>;
    } catch {
        body = null;
    }
    if (!response.ok) {
        throw new Error(body?.msg || `Failed to create booking: ${response.statusText || response.status}`);
    }
    return body?.response as BookingResponse;
}

export interface BookingStatusResponse {
    // fields based on what the API returns, e.g. status
    [key: string]: any;
}

/** GET /api/payments/admin/bookings/{bookingId}/status */
export async function checkBookingStatus(bookingId: string, user: { id: string | number; role: string }): Promise<BookingStatusResponse> {
    // We use fetch here for consistency with other functions in this file,
    // though the URL is outside /api/platform.
    const paymentsBase = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL).replace('/platform', '') : '/api';
    const response = await fetch(`${paymentsBase}/payments/admin/bookings/${encodeURIComponent(bookingId)}/status`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': String(user.id),
            'X-User-Roles': user.role,
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        }
    });
    
    let body: any = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }
    if (!response.ok) {
        throw new Error(body?.msg || body?.message || `Failed to fetch booking status: ${response.statusText || response.status}`);
    }
    
    return body;
}
