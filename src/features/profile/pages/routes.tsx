import { Navigate } from 'react-router-dom';
import ProfilePage from './ProfilePage';

export const profileRoutes = [
    {
        // Old "My Bookings" link; bookings now have their own page.
        path: '/dashboard',
        element: <Navigate to="/bookings" replace />,
    },
    {
        path: '/profile',
        element: <ProfilePage />,
    }
];
