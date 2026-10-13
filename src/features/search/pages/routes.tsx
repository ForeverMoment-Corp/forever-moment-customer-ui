import { lazyPage } from '@/router/lazyPage';

export const searchRoutes = [
    // Navbar search "See all results" / Enter: /search?q=...
    { path: 'search', lazy: lazyPage(() => import('./Search')) },
];
