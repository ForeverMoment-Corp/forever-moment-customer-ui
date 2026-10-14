/**
 * Stripe Checkout opens in a new tab while this tab polls the payment status (/payment/status).
 *
 * Browsers only allow `window.open` straight from a click, and the Checkout URL arrives after a
 * few requests, so the tab is opened blank on click and pointed at Stripe once the URL is ready.
 */

import { isInAppBrowser } from '@/lib/inAppBrowser';

/**
 * Call synchronously inside the click handler, before any `await`. Null when the popup is blocked,
 * or in an in-app browser (WhatsApp, Instagram …) where new tabs do not work: goToCheckout then
 * opens Stripe in this tab instead.
 */
export function openPaymentTab(): Window | null {
    if (isInAppBrowser()) return null;
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

/**
 * Send the guest to Stripe Checkout: in the pre-opened tab when there is one, otherwise in this tab
 * (popup blocked, in-app browser). Stripe returns to /payment/success or /payment/cancel, which check
 * the payment status, so the same-tab route needs no extra handling.
 * Returns where Checkout opened; on 'same-tab' this page is about to unload.
 */
export function goToCheckout(tab: Window | null, url: string): 'new-tab' | 'same-tab' {
    if (sendTabToCheckout(tab, url)) return 'new-tab';
    window.location.assign(url);
    return 'same-tab';
}

export function closePaymentTab(tab: Window | null) {
    if (tab && !tab.closed) tab.close();
}

/**
 * Opens Checkout from a click that already has the URL (status page "Open payment page"). A new tab
 * when possible; this tab when the popup is blocked or in an in-app browser.
 */
export function openCheckoutInNewTab(url: string): 'new-tab' | 'same-tab' {
    const tab = isInAppBrowser() ? null : window.open(url, '_blank');
    if (!tab) {
        window.location.assign(url);
        return 'same-tab';
    }
    tab.opener = null;
    return 'new-tab';
}

/** `/payment/status?bookingId=...` — the page that waits for the payment while Stripe is open. */
export const paymentStatusPath = (bookingId: string) => `/payment/status?bookingId=${encodeURIComponent(bookingId)}`;
