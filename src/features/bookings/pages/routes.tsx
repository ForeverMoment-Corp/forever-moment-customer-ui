import { lazyPage } from '@/router/lazyPage';

export const bookingRoutes = [
    // A signed-in customer's own bookings (GET /api/booking/user/bookings).
    { path: 'bookings', lazy: lazyPage(() => import('./MyBookings')) },
    // Waits for the payment while Stripe Checkout is open in a new tab.
    { path: 'payment/status', lazy: lazyPage(() => import('./PaymentResult'), { outcome: 'waiting' as const }) },
    // Stripe Checkout return URLs (payment service `payment.gateway.success-url` / `cancel-url`).
    { path: 'payment/success', lazy: lazyPage(() => import('./PaymentResult'), { outcome: 'success' as const }) },
    { path: 'payment/cancel', lazy: lazyPage(() => import('./PaymentResult'), { outcome: 'cancel' as const }) },
];
