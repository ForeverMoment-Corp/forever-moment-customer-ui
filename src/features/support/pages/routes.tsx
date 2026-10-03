import MySupport from './MySupport';

export const supportRoutes = [
    // A signed-in customer's own contact/support queries (GET /user/support).
    { path: 'support', element: <MySupport /> },
];
