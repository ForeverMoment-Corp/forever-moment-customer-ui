import NotFound from './NotFound';

export const notFoundRoutes = [
    // Must stay last in customerRoutes: matches any URL no other route handles.
    { path: '*', element: <NotFound /> },
];
