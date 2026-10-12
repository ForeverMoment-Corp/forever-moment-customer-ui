import MyBookings from './MyBookings';
import PaymentResult from './PaymentResult';

export const bookingRoutes = [
    // A signed-in customer's own bookings (GET /api/booking/user/bookings).
    { path: 'bookings', element: <MyBookings /> },
    // Waits for the payment while Stripe Checkout is open in a new tab.
    { path: 'payment/status', element: <PaymentResult outcome="waiting" /> },
    // Stripe Checkout return URLs (payment service `payment.gateway.success-url` / `cancel-url`).
    { path: 'payment/success', element: <PaymentResult outcome="success" /> },
    { path: 'payment/cancel', element: <PaymentResult outcome="cancel" /> },
];
