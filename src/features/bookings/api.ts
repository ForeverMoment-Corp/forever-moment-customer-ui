import { getLoginSession, storage } from '@/utils/storage';

/** Base for the booking service behind the gateway (`/api/booking/**`). */
const BOOKING_BASE = import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace('/platform', '/booking')
    : '/api/booking';

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
    locationId?: number | null;
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
    cancelReason?: string | null;
    requestedAt?: string | null;
    confirmedAt?: string | null;
    cancelledAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
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
        requestedAt: toIso(raw.requestedAt),
        confirmedAt: toIso(raw.confirmedAt),
        cancelledAt: toIso(raw.cancelledAt),
        createdAt: toIso(raw.createdAt),
        updatedAt: toIso(raw.updatedAt),
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
 * Accepts a Spring `Page` (`content`, `number` or `pageable.pageNumber`, `last`), the Spring Data 3.3+ `PagedModel`
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
    const page = Number(meta.number ?? asObject(obj.pageable).pageNumber ?? requestedPage) || 0;
    const totalPages = Number(meta.totalPages ?? 1) || 0;
    return {
        items: content.map(normalizeBooking),
        page,
        totalPages,
        totalElements: Number(meta.totalElements ?? content.length) || 0,
        last: typeof obj.last === 'boolean' ? obj.last : page + 1 >= totalPages,
    };
}

/** The signed-in user's token and id; every `/user/bookings` call needs both. */
function session() {
    const token = getLoginSession('access_token');
    const user = storage.getUser();
    const userId = user?.id;
    if (!token || userId === undefined || userId === null || userId === '') throw new UnauthorizedError();
    return { token, userId: String(userId), role: String(user?.roles || user?.role || 'USER') };
}

/** Calls the booking service as the signed-in user and returns the parsed body (envelope unwrapped). */
async function userRequest(path: string, init: RequestInit = {}, fallbackError: string): Promise<unknown> {
    const { token, userId, role } = session();
    const response = await fetch(`${BOOKING_BASE}${path}`, {
        ...init,
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'X-User-Id': userId,
            'X-User-Roles': role,
        },
    });
    let body: unknown = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError();
    if (!response.ok) {
        const err = asObject(body);
        const error = new Error(String(err.msg || err.message || '') || `${fallbackError}: ${response.statusText || response.status}`);
        (error as Error & { status?: number }).status = response.status;
        throw error;
    }
    return body;
}

const unwrap = (body: unknown) => {
    const envelope = asObject(body);
    return 'response' in envelope ? envelope.response : body;
};

export interface BookingQuery {
    /** Only these statuses (the API takes several). */
    status?: BookingStatus[];
    /** `<field>,<asc|desc>`; fields: createdAt, bookingDate, grandTotal, status. Default newest booked first. */
    sort?: string;
}

/** GET /api/booking/user/bookings?status&page&size&sort — the signed-in user's bookings. */
export async function fetchMyBookings(page = 0, size = 10, { status, sort = 'createdAt,desc' }: BookingQuery = {}): Promise<BookingPage> {
    const params = new URLSearchParams({ page: String(page), size: String(size), sort });
    status?.forEach((s) => params.append('status', s));
    try {
        const body = await userRequest(`/user/bookings?${params}`, {}, 'Could not load your bookings');
        return normalizePage(body, page);
    } catch (e) {
        // The list route itself missing (gateway not updated) rather than an empty list.
        if ((e as { status?: number }).status === 404) throw new BookingsUnavailableError();
        throw e;
    }
}

/** GET /api/booking/user/bookings/{bookingId} — one of the user's bookings, 404 when not theirs. */
export async function fetchMyBooking(bookingId: string): Promise<Booking> {
    const body = await userRequest(`/user/bookings/${encodeURIComponent(bookingId)}`, {}, 'Could not load this booking');
    return normalizeBooking(unwrap(body));
}

/**
 * PUT /api/booking/user/bookings/{bookingId}/cancel?reason= — cancels a PENDING or CONFIRMED booking.
 * A confirmed booking is refunded manually by ops. Returns the updated booking when the service sends one.
 */
export async function cancelMyBooking(bookingId: string, reason?: string): Promise<Booking | null> {
    const query = reason?.trim() ? `?reason=${encodeURIComponent(reason.trim())}` : '';
    const body = await userRequest(`/user/bookings/${encodeURIComponent(bookingId)}/cancel${query}`, { method: 'PUT' }, 'Could not cancel this booking');
    const data = asObject(unwrap(body));
    return data.bookingId ? normalizeBooking(data) : null;
}
