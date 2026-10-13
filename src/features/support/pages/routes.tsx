import { lazyPage } from '@/router/lazyPage';

export const supportRoutes = [
    // A signed-in customer's own contact/support queries (GET /user/support).
    { path: 'support', lazy: lazyPage(() => import('./MySupport')) },
];
