import { lazyPage } from '@/router/lazyPage';

export const helpRoutes = [
    { path: 'help', lazy: lazyPage(() => import('./HelpCenter')) },
    // The navbar and guest menu already link here; both land on the same page.
    { path: 'faqs', lazy: lazyPage(() => import('./HelpCenter')) },
    { path: 'contact', lazy: lazyPage(() => import('./Contact')) },
];
