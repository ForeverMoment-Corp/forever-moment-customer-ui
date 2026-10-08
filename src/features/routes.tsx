import { homeRoutes } from '@/features/home/pages/routes';
import { categoryRoutes } from '@/features/category/pages/routes';
import { ExperienceRoutes } from '@/features/experiences/pages/routes';
import { helpRoutes } from '@/features/help/pages/routes';
import { supportRoutes } from '@/features/support/pages/routes';
import { authRoutes } from '@/features/auth/pages/routes';

export const customerRoutes = [
    ...homeRoutes,
    ...categoryRoutes,
    ...ExperienceRoutes,
    ...helpRoutes,
    ...supportRoutes,
    ...authRoutes,
];
