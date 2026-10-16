import { homeRoutes } from '@/features/home/pages/routes';
import { categoryRoutes } from '@/features/category/pages/routes';
import { ExperienceRoutes } from '@/features/experiences/pages/routes';
import { helpRoutes } from '@/features/help/pages/routes';
import { supportRoutes } from '@/features/support/pages/routes';
import { authRoutes } from '@/features/auth/pages/routes';
import { profileRoutes } from '@/features/profile/pages/routes';
import { bookingRoutes } from '@/features/bookings/pages/routes';
import { searchRoutes } from '@/features/search/pages/routes';
import { notFoundRoutes } from '@/features/notFound/pages/routes';

export const customerRoutes = [
    ...homeRoutes,
    ...categoryRoutes,
    ...ExperienceRoutes,
    ...helpRoutes,
    ...supportRoutes,
    ...authRoutes,
    ...profileRoutes,
    ...bookingRoutes,
    ...searchRoutes,
    // Keep last: the 404 page for any unknown URL.
    ...notFoundRoutes,
];
