import HelpCenter from './HelpCenter';
import Contact from './Contact';

export const helpRoutes = [
    { path: 'help', element: <HelpCenter /> },
    // The navbar and guest menu already link here; both land on the same page.
    { path: 'faqs', element: <HelpCenter /> },
    { path: 'contact', element: <Contact /> },
];
