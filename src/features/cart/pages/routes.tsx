import { lazyPage } from '@/router/lazyPage';

export const cartRoutes = [
    // TEMPORARY: reads sample items from mockCart.ts until there is a cart API.
    { path: 'cart', lazy: lazyPage(() => import('./Cart')) },
];
