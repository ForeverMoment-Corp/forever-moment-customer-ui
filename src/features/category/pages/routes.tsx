import Categories from './Categories';
import SubCategories from './SubCategories';

export const categoryRoutes = [
    {
        path: 'categories',
        element: <Categories />,
    },
    {
        path: 'subcategories',
        element: <SubCategories />,
    },
];
