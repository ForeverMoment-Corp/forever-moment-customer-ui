import * as types from './action-types';
import { fetchCategories, fetchSubCategories } from './api';
import { experienceListKey, selectLocationId, selectLocationReady } from '@/features/experiences/store/location';
import type { RootState } from '@/store/store';

export const toggleMenu = () => ({
    type: types.TOGGLE_MENU,
});

export const setSearchQuery = (query: string) => ({
    type: types.SET_SEARCH_QUERY,
    payload: query,
});

/**
 * GET /public/locations/{locationId}/categories. Skipped until the city is known (the navbar
 * dispatches again once it is) and when this city's categories are already loaded or in flight.
 */
export const getCategories = () => {
    return async (dispatch: any, getState: () => RootState) => {
        const state = getState();
        if (!selectLocationReady(state)) return;
        const locationId = selectLocationId(state);
        const key = experienceListKey(locationId, 'categories');
        if (state.header.categoriesKey === key && !state.header.categoriesError) return;
        dispatch({ type: types.GET_CATEGORIES, payload: { key } });
        try {
            const categories = await fetchCategories(locationId);
            dispatch({
                type: types.GET_CATEGORIES_SUCCESS,
                payload: { key, categories },
            });
        } catch (error: any) {
            console.error('Failed to fetch categories:', error);
            dispatch({
                type: types.GET_CATEGORIES_FAILURE,
                payload: { key, error: error.message || 'Failed to fetch categories' },
            });
        }
    };
};

/** GET /public/locations/{locationId}/subcategories — shared by the `/subcategories` page and the home strip. */
export const getSubCategories = () => {
    return async (dispatch: (action: { type: string; payload?: unknown }) => void, getState: () => RootState) => {
        const locationId = selectLocationId(getState());
        const key = experienceListKey(locationId, 'subcategories');
        // Already loaded or in flight for this city (e.g. StrictMode's second mount): don't call again.
        const { subCategoriesKey, subCategoriesError } = getState().header;
        if (subCategoriesKey === key && !subCategoriesError) return;
        dispatch({ type: types.GET_SUBCATEGORIES, payload: { key } });
        try {
            const subCategories = await fetchSubCategories(locationId);
            dispatch({ type: types.GET_SUBCATEGORIES_SUCCESS, payload: { key, subCategories } });
        } catch (error: unknown) {
            console.error('Failed to fetch sub-categories:', error);
            dispatch({
                type: types.GET_SUBCATEGORIES_FAILURE,
                payload: { key, error: error instanceof Error && error.message ? error.message : 'Failed to fetch sub-categories' },
            });
        }
    };
};
