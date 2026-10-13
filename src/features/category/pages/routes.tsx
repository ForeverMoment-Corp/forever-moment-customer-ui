import { lazyPage } from '@/router/lazyPage';

export const categoryRoutes = [
    { path: 'categories', lazy: lazyPage(() => import('./Categories')) },
    { path: 'subcategories', lazy: lazyPage(() => import('./SubCategories')) },
];
