/**
 * The booking the guest is paying for, saved just before the hand-off to Stripe Checkout so the
 * /payment/success and /payment/cancel pages know where the guest came from. The return URL also
 * carries `bookingId`; this is the fallback when it does not, plus the details to link back.
 */
export interface PendingPayment {
    bookingId: string;
    experienceId?: number;
    experienceName?: string;
    experiencePath?: string;
    category?: string;
    totalPrice?: number;
    couponCode?: string;
    discountAmount?: number;
    /** Stripe Checkout URL, so the status page can reopen it from a click (no popup blocker). */
    checkoutUrl?: string;
    /** When checkoutUrl was saved (ms). Stripe Checkout sessions expire after 24 h. */
    savedAt?: number;
}

/** Reuse a saved Checkout URL only while it is surely still valid (Stripe sessions last 24 h). */
const CHECKOUT_URL_MAX_AGE_MS = 20 * 60 * 60 * 1000;

/** The saved Checkout URL if it is recent enough to still open; otherwise undefined (fetch a fresh one). */
export const freshCheckoutUrl = (p: PendingPayment | null | undefined) =>
    p?.checkoutUrl && p.savedAt && Date.now() - p.savedAt < CHECKOUT_URL_MAX_AGE_MS ? p.checkoutUrl : undefined;

const KEY = 'fm_pending_payment';

export function savePendingPayment(value: PendingPayment) {
    try {
        localStorage.setItem(KEY, JSON.stringify(value.checkoutUrl ? { ...value, savedAt: Date.now() } : value));
    } catch {
        // Storage blocked (private mode): the return URL's bookingId is enough.
    }
}

export function readPendingPayment(): PendingPayment | null {
    try {
        const raw = localStorage.getItem(KEY);
        const value = raw ? (JSON.parse(raw) as PendingPayment) : null;
        return value?.bookingId ? value : null;
    } catch {
        return null;
    }
}

export function clearPendingPayment() {
    try {
        localStorage.removeItem(KEY);
    } catch {
        // Nothing to clear.
    }
}
