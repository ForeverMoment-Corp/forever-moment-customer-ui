/**
 * analytics.ts
 * ─────────────────────────────────────────────────────────────────
 * Single entry point for all GA4 event calls.
 *
 * Rules:
 *  - No component / slice should call window.gtag directly.
 *  - Every helper is fire-and-forget; errors are swallowed so a
 *    tracking failure never breaks the user experience.
 *  - All monetary values are in INR (integer rupees).
 */

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

/** Safe wrapper — no-ops when GA hasn't loaded (e.g. blocked by ad-blocker). */
function ga(command: string, ...args: unknown[]) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag(command, ...args);
    }
  } catch {
    // swallow
  }
}

// ─── Identity ────────────────────────────────────────────────────

/**
 * Associate subsequent events with a logged-in user.
 * Call on login / page load when the session is already active.
 */
export function identifyUser(userId: string | number) {
  ga('set', 'user_id', String(userId));
  ga('set', 'user_properties', { user_type: 'authenticated' });
}

/**
 * Clear the user identity on logout.
 */
export function clearUser() {
  ga('set', 'user_id', undefined);
  ga('set', 'user_properties', { user_type: 'guest' });
}

// ─── Navigation ──────────────────────────────────────────────────

/**
 * Fire a GA4 page_view for SPA route changes.
 * Should be called on every pathname change.
 */
export function trackPageView(path: string, title?: string) {
  ga('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
  });
}

// ─── Auth events ─────────────────────────────────────────────────

/** GA4 standard: user signed up for the first time. */
export function trackSignUp(method: 'email' | 'google' | 'phone') {
  ga('event', 'sign_up', { method });
}

/** GA4 standard: user logged in. */
export function trackLogin(method: 'email' | 'google' | 'phone') {
  ga('event', 'login', { method });
}

/** GA4 standard: user logged out. */
export function trackLogout() {
  ga('event', 'logout');
}

/** Custom: the login/signup modal was triggered (button click or auth-wall). */
export function trackLoginModalOpen(trigger?: string) {
  ga('event', 'login_modal_open', { trigger: trigger ?? 'unknown' });
}

// ─── Experience detail (product page) ────────────────────────────

export interface ExperienceAnalyticsItem {
  id: number;
  name: string;
  category?: string;
  subcategory?: string;
  price: number;
}

/** GA4 standard: experience detail page loaded. */
export function trackViewItem(experience: ExperienceAnalyticsItem) {
  ga('event', 'view_item', {
    currency: 'INR',
    value: experience.price,
    items: [
      {
        item_id: String(experience.id),
        item_name: experience.name,
        item_category: experience.category ?? '',
        item_category2: experience.subcategory ?? '',
        price: experience.price,
        quantity: 1,
      },
    ],
  });
}

// ─── Booking funnel ──────────────────────────────────────────────

/** Step 1 — guest picks a date; start of the checkout funnel. */
export function trackBeginCheckout(experience: ExperienceAnalyticsItem, totalPrice: number) {
  ga('event', 'begin_checkout', {
    currency: 'INR',
    value: totalPrice,
    items: [
      {
        item_id: String(experience.id),
        item_name: experience.name,
        item_category: experience.category ?? '',
        price: totalPrice,
        quantity: 1,
      },
    ],
  });
}

/** Add-on toggled on. */
export function trackAddToCart(addon: { id: number; name: string; price: number }) {
  ga('event', 'add_to_cart', {
    currency: 'INR',
    value: addon.price,
    items: [
      {
        item_id: String(addon.id),
        item_name: addon.name,
        item_category: 'Add-on',
        price: addon.price,
        quantity: 1,
      },
    ],
  });
}

/** Add-on toggled off. */
export function trackRemoveFromCart(addon: { id: number; name: string; price: number }) {
  ga('event', 'remove_from_cart', {
    currency: 'INR',
    value: addon.price,
    items: [
      {
        item_id: String(addon.id),
        item_name: addon.name,
        item_category: 'Add-on',
        price: addon.price,
        quantity: 1,
      },
    ],
  });
}

/** "Book" button clicked — payment flow is about to begin. */
export function trackAddPaymentInfo(experience: ExperienceAnalyticsItem, totalPrice: number, couponCode?: string) {
  ga('event', 'add_payment_info', {
    currency: 'INR',
    value: totalPrice,
    coupon: couponCode ?? undefined,
    payment_type: 'stripe',
    items: [
      {
        item_id: String(experience.id),
        item_name: experience.name,
        item_category: experience.category ?? '',
        price: totalPrice,
        quantity: 1,
        coupon: couponCode ?? undefined,
      },
    ],
  });
}

/** Booking created + payment link obtained — revenue event. */
export function trackPurchase(
  bookingId: string,
  experience: ExperienceAnalyticsItem,
  totalPrice: number,
  couponCode?: string,
  couponDiscount?: number,
) {
  ga('event', 'purchase', {
    transaction_id: bookingId,
    currency: 'INR',
    value: totalPrice,
    coupon: couponCode ?? undefined,
    discount: couponDiscount ?? 0,
    items: [
      {
        item_id: String(experience.id),
        item_name: experience.name,
        item_category: experience.category ?? '',
        price: totalPrice,
        discount: couponDiscount ?? 0,
        coupon: couponCode ?? undefined,
        quantity: 1,
      },
    ],
  });
}

// ─── Coupon ──────────────────────────────────────────────────────

/** Coupon successfully applied. */
export function trackCouponApplied(code: string, discountAmount: number, experienceId: number) {
  ga('event', 'coupon_applied', {
    coupon_code: code,
    discount_amount: discountAmount,
    experience_id: String(experienceId),
    currency: 'INR',
  });
}

// ─── Pincode / serviceability ─────────────────────────────────────

/** Serviceability check results. */
export function trackPincodeChecked(
  pincode: string,
  result: 'available' | 'not_available' | 'error',
  experienceId?: number,
) {
  ga('event', 'pincode_checked', {
    pincode,
    result,
    experience_id: experienceId ? String(experienceId) : undefined,
  });
}

// ─── Payment errors ───────────────────────────────────────────────

/** Payment link delayed or failed. */
export function trackPaymentError(bookingId: string, reason: string) {
  ga('event', 'payment_error', {
    booking_id: bookingId,
    reason,
  });
}

// ─── Search ───────────────────────────────────────────────────────

/** GA4 standard search event. */
export function trackSearch(query: string, resultCount: number) {
  ga('event', 'search', {
    search_term: query,
    result_count: resultCount,
  });
}

// ─── Engagement ───────────────────────────────────────────────────

/** User clicked "View reviews" on the booking card. */
export function trackViewReviews(experienceId: number, experienceName: string) {
  ga('event', 'view_reviews', {
    experience_id: String(experienceId),
    experience_name: experienceName,
  });
}

/** User clicked the WhatsApp CTA. */
export function trackWhatsAppClick(context: string) {
  ga('event', 'whatsapp_click', { context });
}
