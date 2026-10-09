import * as types from './action-types';
import {
    fetchAddons,
    fetchCategoryExperiences,
    fetchData,
    fetchExperienceAddons,
    fetchExperienceBySlug,
    fetchExperienceDetail,
    fetchSubCategoryExperiences,
} from './api';
import { isNumericId } from '../utils/slug';
import { experienceListKey, selectLocationId } from './location';
import type { RootState } from '@/store/store';

type Dispatch = (action: { type: string; payload?: unknown }) => void;

const errorMessage = (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback;

/** GET /public/locations/{locationId}/experiences — every experience in the picked city. */
export const getData = () => {
    return async (dispatch: Dispatch, getState: () => RootState) => {
        const locationId = selectLocationId(getState());
        const key = experienceListKey(locationId, 'all');
        // Already loaded or in flight for this city (e.g. StrictMode's second mount): don't call again.
        const { dataKey, error } = getState().experiences;
        if (dataKey === key && !error) return;
        dispatch({ type: types.GET_DATA, payload: { key } });
        try {
            const data = await fetchData(locationId);
            dispatch({ type: types.GET_DATA_SUCCESS, payload: { key, data: data ?? [] } });
        } catch (error: unknown) {
            dispatch({
                type: types.GET_DATA_FAILURE,
                payload: { key, error: errorMessage(error, 'Failed to fetch data') },
            });
        }
    };
};

/** GET /public/experiences/{id} */
export const getExperienceDetail = (id: string | number) => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: types.GET_EXPERIENCE_DETAIL, payload: { key: String(id) } });
        try {
            const data = await fetchExperienceDetail(id);
            dispatch({ type: types.GET_EXPERIENCE_DETAIL_SUCCESS, payload: data });
        } catch (error: unknown) {
            dispatch({
                type: types.GET_EXPERIENCE_DETAIL_FAILURE,
                payload: errorMessage(error, 'Failed to fetch experience detail'),
            });
        }
    };
};

/** GET /public/experiences/slug/{slug} */
export const getExperienceBySlug = (slug: string) => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: types.GET_EXPERIENCE_DETAIL, payload: { key: slug } });
        try {
            const data = await fetchExperienceBySlug(slug);
            dispatch({ type: types.GET_EXPERIENCE_DETAIL_SUCCESS, payload: data });
        } catch (error: unknown) {
            dispatch({
                type: types.GET_EXPERIENCE_DETAIL_FAILURE,
                payload: errorMessage(error, 'Failed to fetch experience detail'),
            });
        }
    };
};

/**
 * Resolve a `/experience/:slugOrId` route param: numeric values hit `/{id}`,
 * anything else hits `/slug/{slug}`.
 */
export const getExperience = (slugOrId: string) =>
    isNumericId(slugOrId) ? getExperienceDetail(slugOrId) : getExperienceBySlug(slugOrId);

/** GET /public/experiences/location/{locationId}/subcategory/{subCategoryId} */
export const getSubCategoryExperiences = (subCategoryId: string | number) => {
    return async (dispatch: Dispatch, getState: () => RootState) => {
        const locationId = selectLocationId(getState());
        const key = experienceListKey(locationId, subCategoryId);
        // Already loaded or in flight for this city (e.g. StrictMode's second mount): don't call again.
        const { subCategoryKey, subCategoryError } = getState().experiences;
        if (subCategoryKey === key && !subCategoryError) return;
        dispatch({ type: types.GET_SUBCATEGORY_EXPERIENCES, payload: { key } });
        try {
            const data = await fetchSubCategoryExperiences(subCategoryId, locationId);
            dispatch({ type: types.GET_SUBCATEGORY_EXPERIENCES_SUCCESS, payload: { key, data: data ?? [] } });
        } catch (error: unknown) {
            dispatch({
                type: types.GET_SUBCATEGORY_EXPERIENCES_FAILURE,
                payload: { key, error: errorMessage(error, 'Failed to fetch sub-category experiences') },
            });
        }
    };
};

/** GET /public/experiences/location/{locationId}/category/{categoryId} */
export const getCategoryExperiences = (categoryId: string | number) => {
    return async (dispatch: Dispatch, getState: () => RootState) => {
        const locationId = selectLocationId(getState());
        const key = experienceListKey(locationId, categoryId);
        // Already loaded or in flight for this city (e.g. StrictMode's second mount): don't call again.
        const { categoryKey, categoryError } = getState().experiences;
        if (categoryKey === key && !categoryError) return;
        dispatch({ type: types.GET_CATEGORY_EXPERIENCES, payload: { key } });
        try {
            const data = await fetchCategoryExperiences(categoryId, locationId);
            dispatch({ type: types.GET_CATEGORY_EXPERIENCES_SUCCESS, payload: { key, data: data ?? [] } });
        } catch (error: unknown) {
            dispatch({
                type: types.GET_CATEGORY_EXPERIENCES_FAILURE,
                payload: { key, error: errorMessage(error, 'Failed to fetch category experiences') },
            });
        }
    };
};

/** GET /public/addons — the full add-on catalogue, shared across the app. */
export const getAddons = () => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: types.GET_ADDONS });
        try {
            const data = await fetchAddons();
            dispatch({ type: types.GET_ADDONS_SUCCESS, payload: data ?? [] });
        } catch (error: unknown) {
            dispatch({ type: types.GET_ADDONS_FAILURE, payload: errorMessage(error, 'Failed to fetch add-ons') });
        }
    };
};

/** GET /public/experiences/{id}/addons — the add-ons offered with one experience. */
export const getExperienceAddons = (experienceId: string | number) => {
    const key = String(experienceId);
    return async (dispatch: Dispatch) => {
        dispatch({ type: types.GET_EXPERIENCE_ADDONS, payload: { key } });
        try {
            const data = await fetchExperienceAddons(experienceId);
            dispatch({ type: types.GET_EXPERIENCE_ADDONS_SUCCESS, payload: { key, addons: data ?? [] } });
        } catch (error: unknown) {
            dispatch({
                type: types.GET_EXPERIENCE_ADDONS_FAILURE,
                payload: { key, error: errorMessage(error, 'Failed to fetch add-ons for this experience') },
            });
        }
    };
};
