import * as types from './action-types';
import { fetchCategories, fetchSubCategories } from './api';

export const toggleMenu = () => ({
    type: types.TOGGLE_MENU,
});

export const setSearchQuery = (query: string) => ({
    type: types.SET_SEARCH_QUERY,
    payload: query,
});

export const getCategories = () => {
    return async (dispatch: any, getState: any) => {
        dispatch({ type: types.GET_CATEGORIES });
        try {
            const state = getState();
            const locationName = state.home?.selectedLocation;
            const location = state.home?.locations?.find((l: any) => l.name === locationName);
            const locationId = location?.id;

            const categories = await fetchCategories(locationId);
            console.log('API response categories:', categories);
            dispatch({
                type: types.GET_CATEGORIES_SUCCESS,
                payload: categories,
            });
        } catch (error: any) {
            console.error('Failed to fetch categories:', error);
            dispatch({
                type: types.GET_CATEGORIES_FAILURE,
                payload: error.message || 'Failed to fetch categories',
            });
        }
    };
};

/** GET /public/subcategories — shared by the `/subcategories` page and the home strip. */
export const getSubCategories = () => {
    return async (dispatch: (action: { type: string; payload?: unknown }) => void) => {
        dispatch({ type: types.GET_SUBCATEGORIES });
        try {
            const subCategories = await fetchSubCategories();
            dispatch({ type: types.GET_SUBCATEGORIES_SUCCESS, payload: subCategories });
        } catch (error: unknown) {
            console.error('Failed to fetch sub-categories:', error);
            dispatch({
                type: types.GET_SUBCATEGORIES_FAILURE,
                payload: error instanceof Error && error.message ? error.message : 'Failed to fetch sub-categories',
            });
        }
    };
};
