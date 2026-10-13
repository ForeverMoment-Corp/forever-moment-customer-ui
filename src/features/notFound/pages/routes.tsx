import { lazyPage } from '@/router/lazyPage';

export const notFoundRoutes = [
    // Must stay last in customerRoutes: matches any URL no other route handles.
    { path: '*', lazy: lazyPage(() => import('./NotFound')) },
];
