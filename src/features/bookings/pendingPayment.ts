/**
 * The booking the guest is paying for, saved just before the hand-off to Stripe Checkout so the
 * /payment/success and /payment/cancel pages know where the guest came from. The return URL also
 * carries `bookingId`; this is the fallback when it does not, plus the details to link back.
 */
export interface PendingPayment {
    bookingId: string;
    experienceName?: string;
    experiencePath?: string;
    /** Stripe Checkout URL, so the status page can reopen it from a click (no popup blocker). */
    checkoutUrl?: string;
}

const KEY = 'fm_pending_payment';

export function savePendingPayment(value: PendingPayment) {
    try {
        localStorage.setItem(KEY, JSON.stringify(value));
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
