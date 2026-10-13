import type { ComponentType } from 'react';

/**
 * Route-level code splitting: `{ path: 'cart', lazy: lazyPage(() => import('./Cart')) }`.
 * The page's code is downloaded the first time someone opens it, not with the home page.
 * Pass `props` for routes that render the same page with a fixed prop (e.g. PaymentResult outcome).
 */
export function lazyPage<P extends object>(load: () => Promise<{ default: ComponentType<P> }>, props?: P) {
    return async () => {
        const { default: Page } = await load();
        return { Component: props ? () => <Page {...props} /> : (Page as ComponentType) };
    };
}
