/**
 * Stripe Checkout opens in a new tab while this tab polls the payment status (/payment/status).
 *
 * Browsers only allow `window.open` straight from a click, and the Checkout URL arrives after a
 * few requests, so the tab is opened blank on click and pointed at Stripe once the URL is ready.
 */

/** Call synchronously inside the click handler, before any `await`. Null when the popup is blocked. */
export function openPaymentTab(): Window | null {
    const tab = window.open('', '_blank');
    if (!tab) return null;
    try {
        tab.document.title = 'Opening secure payment…';
        tab.document.body.innerHTML =
            '<p style="font-family: Jost, sans-serif; padding: 32px; text-align: center;">Opening secure payment…</p>';
    } catch {
        // A blank tab is fine too.
    }
    return tab;
}

/** Sends the pre-opened tab to Stripe; false when it was blocked or the guest closed it. */
export function sendTabToCheckout(tab: Window | null, url: string): boolean {
    if (!tab || tab.closed) return false;
    tab.location.href = url;
    // Stripe has no business with this page.
    tab.opener = null;
    return true;
}

export function closePaymentTab(tab: Window | null) {
    if (tab && !tab.closed) tab.close();
}

/** Opens Checkout from a click that already has the URL (status page "Open payment page"). */
export function openCheckoutInNewTab(url: string) {
    window.open(url, '_blank', 'noopener');
}

/** `/payment/status?bookingId=...` — the page that waits for the payment while Stripe is open. */
export const paymentStatusPath = (bookingId: string) => `/payment/status?bookingId=${encodeURIComponent(bookingId)}`;
