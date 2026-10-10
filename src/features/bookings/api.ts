import { getLoginSession, storage } from '@/utils/storage';
import { MOCK_BOOKINGS } from './mockBookings';

/** Base for the booking service behind the gateway (`/api/booking/**`). */
const BOOKING_BASE = import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace('/platform', '/booking')
    : '/api/booking';

/**
 * TEMPORARY: there is no customer-facing `/user/bookings` endpoint yet, so the list is read from
 * the admin endpoint `GET /admin/bookings/user/{userId}` with the signed-in user's id.
 * Set to false once the booking service exposes `/user/bookings`.
 */
const USE_ADMIN_BOOKINGS_ENDPOINT = true;

/** TEMPORARY: serve sample bookings (mockBookings.ts) instead of calling the API, to preview the screen. */
const USE_MOCK_BOOKINGS = true;

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED' | (string & {});

export interface BookingAddon {
    id?: number;
    addonMapperId?: number;
    addonName: string;
    effectivePrice: number;
    free?: boolean;
}

/** A booking as returned by forever-moment-booking (the `Booking` entity). */
export interface Booking {
    bookingId: string;
    /** ISO date-time of the celebration. */
    bookingDate: string;
    experienceId: number;
    experienceName: string;
    experienceSlug?: string | null;
    locationName?: string | null;
    timeSlotLabel?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    guestCount: number;
    status: BookingStatus;
    resolvedPricePerPerson?: number;
    totalAmount?: number;
    addonsTotal?: number;
    grandTotal: number;
    pincode?: string | null;
    failureReason?: string | null;
    confirmedAt?: string | null;
    createdAt?: string | null;
    addons: BookingAddon[];
}

export interface BookingPage {
    items: Booking[];
    page: number;
    totalPages: number;
    totalElements: number;
    last: boolean;
}

/** Thrown when there is no session or it has expired. */
export class UnauthorizedError extends Error {
    constructor() {
        super('Please sign in to see your bookings');
        this.name = 'UnauthorizedError';
    }
}

/** Thrown when the gateway has no `/user/bookings` route yet (404). */
export class BookingsUnavailableError extends Error {
    constructor() {
        super('Bookings are not available right now');
        this.name = 'BookingsUnavailableError';
    }
}

/**
 * Jackson writes LocalDateTime either as an ISO string or, without the JavaTime
 * module's string setting, as `[yyyy, M, d, H, m, s?]`. Both become an ISO string.
 */
const toIso = (value: unknown): string | null => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.length >= 3) {
        const [y, mo, d, h = 0, mi = 0, s = 0] = value.map(Number);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:${pad(s)}`;
    }
    return null;
};

const toNumber = (value: unknown) => Number(value) || 0;

type Json = Record<string, unknown>;
const asObject = (value: unknown): Json => (value && typeof value === 'object' ? (value as Json) : {});

function normalizeBooking(value: unknown): Booking {
    const raw = asObject(value);
    return {
        ...(raw as unknown as Booking),
        bookingId: String(raw.bookingId ?? ''),
        bookingDate: toIso(raw.bookingDate) ?? '',
        experienceId: toNumber(raw.experienceId),
        experienceName: String(raw.experienceName || 'Experience'),
        guestCount: toNumber(raw.guestCount),
        status: String(raw.status || 'PENDING').toUpperCase(),
        resolvedPricePerPerson: toNumber(raw.resolvedPricePerPerson),
        totalAmount: toNumber(raw.totalAmount),
        addonsTotal: toNumber(raw.addonsTotal),
        grandTotal: toNumber(raw.grandTotal),
        confirmedAt: toIso(raw.confirmedAt),
        createdAt: toIso(raw.createdAt),
        addons: Array.isArray(raw.addons)
            ? raw.addons.map((item) => {
                  const a = asObject(item);
                  return {
                      ...(a as unknown as BookingAddon),
                      addonName: String(a.addonName || 'Add-on'),
                      effectivePrice: toNumber(a.effectivePrice),
                  };
              })
            : [],
    };
}

/**
 * Accepts a Spring `Page` (`content`, `number`, `last`), the Spring Data 3.3+ `PagedModel`
 * (`content` + `page: {...}`), either wrapped in the platform envelope (`response`), or a bare array.
 */
function normalizePage(body: unknown, requestedPage: number): BookingPage {
    const envelope = asObject(body);
    const data = 'response' in envelope ? envelope.response : body;
    if (Array.isArray(data)) {
        return { items: data.map(normalizeBooking), page: 0, totalPages: 1, totalElements: data.length, last: true };
    }
    const obj = asObject(data);
    const content: unknown[] = Array.isArray(obj.content) ? obj.content : [];
    const meta = obj.page && typeof obj.page === 'object' ? asObject(obj.page) : obj;
    const page = Number(meta.number ?? requestedPage) || 0;
    const totalPages = Number(meta.totalPages ?? 1) || 0;
    return {
        items: content.map(normalizeBooking),
        page,
        totalPages,
        totalElements: Number(meta.totalElements ?? content.length) || 0,
        last: typeof obj.last === 'boolean' ? obj.last : page + 1 >= totalPages,
    };
}

/**
 * GET /api/booking/user/bookings?page&size — the signed-in user's bookings, newest first.
 * The booking service scopes the list to the `X-User-Id` the gateway derives from the JWT.
 */
export async function fetchMyBookings(page = 0, size = 10): Promise<BookingPage> {
    const token = getLoginSession('access_token');
    if (!token) throw new UnauthorizedError();

    if (USE_MOCK_BOOKINGS) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const items = MOCK_BOOKINGS.slice(page * size, (page + 1) * size);
        const totalPages = Math.max(1, Math.ceil(MOCK_BOOKINGS.length / size));
        return { items, page, totalPages, totalElements: MOCK_BOOKINGS.length, last: page + 1 >= totalPages };
    }

    const userId = storage.getUser()?.id;
    if (USE_ADMIN_BOOKINGS_ENDPOINT && (userId === undefined || userId === null || userId === '')) throw new UnauthorizedError();
    const path = USE_ADMIN_BOOKINGS_ENDPOINT
        ? `/admin/bookings/user/${encodeURIComponent(String(userId))}`
        : '/user/bookings';

    const response = await fetch(`${BOOKING_BASE}${path}?page=${page}&size=${size}`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });
    let body: unknown = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError();
    if (response.status === 404) throw new BookingsUnavailableError();
    if (!response.ok) {
        const err = asObject(body);
        throw new Error(String(err.msg || err.message || '') || `Could not load your bookings: ${response.statusText || response.status}`);
    }
    return normalizePage(body, page);
}
