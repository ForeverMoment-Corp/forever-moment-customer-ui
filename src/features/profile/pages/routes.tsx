import { Navigate } from 'react-router-dom';
import { lazyPage } from '@/router/lazyPage';

export const profileRoutes = [
    {
        // Old "My Bookings" link; bookings now have their own page.
        path: '/dashboard',
        element: <Navigate to="/bookings" replace />,
    },
    { path: '/profile', lazy: lazyPage(() => import('./ProfilePage')) },
];
