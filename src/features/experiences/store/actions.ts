import * as types from './action-types';
import {
    fetchAddons,
    fetchData,
    fetchExperienceAddons,
    fetchExperienceBySlug,
    fetchExperienceDetail,
    fetchSubCategoryExperiences,
} from './api';
import { isNumericId } from '../utils/slug';

type Dispatch = (action: { type: string; payload?: unknown }) => void;

const errorMessage = (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback;

/** GET /public/experiences (or location-specific) */
export const getData = () => {
    return async (dispatch: Dispatch, getState: any) => {
        dispatch({ type: types.GET_DATA });
        try {
            const state = getState();
            const locationName = state.home?.selectedLocation;
            const location = state.home?.locations?.find((l: any) => l.name === locationName);
            const locationId = location?.id;
            
            const data = await fetchData(locationId);
            dispatch({ type: types.GET_DATA_SUCCESS, payload: data ?? [] });
        } catch (error: unknown) {
            dispatch({
                type: types.GET_DATA_FAILURE,
                payload: errorMessage(error, 'Failed to fetch data'),
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

/** GET /public/experiences/subcategory/{subCategoryId} */
export const getSubCategoryExperiences = (subCategoryId: string | number) => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: types.GET_SUBCATEGORY_EXPERIENCES, payload: { subCategoryId: String(subCategoryId) } });
        try {
            const data = await fetchSubCategoryExperiences(subCategoryId);
            dispatch({
                type: types.GET_SUBCATEGORY_EXPERIENCES_SUCCESS,
                payload: { subCategoryId: String(subCategoryId), data: data ?? [] },
            });
        } catch (error: unknown) {
            dispatch({
                type: types.GET_SUBCATEGORY_EXPERIENCES_FAILURE,
                payload: errorMessage(error, 'Failed to fetch sub-category experiences'),
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
