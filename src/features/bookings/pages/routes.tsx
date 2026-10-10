import MyBookings from './MyBookings';

export const bookingRoutes = [
    // A signed-in customer's own bookings (GET /api/booking/user/bookings).
    { path: 'bookings', element: <MyBookings /> },
];
