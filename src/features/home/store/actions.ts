import * as types from './action-types';
import { fetchFeaturedExperiences, fetchLocations, fetchPromotionImages } from './api';
import { promotionSlot } from './types';

export const getFeaturedExperiences = () => {
    return async (dispatch: any) => {
        dispatch({ type: types.GET_FEATURED_EXPERIENCES });
        try {
            const experiences = await fetchFeaturedExperiences();
            dispatch({
                type: types.GET_FEATURED_EXPERIENCES_SUCCESS,
                payload: experiences,
            });
        } catch (error: any) {
            console.error('Failed to fetch featured experiences:', error);
            dispatch({
                type: types.GET_FEATURED_EXPERIENCES_FAILURE,
                payload: error.message || 'Failed to fetch featured experiences',
            });
        }
    };
};

export const getLocations = () => {
    return async (dispatch: any) => {
        dispatch({ type: types.GET_LOCATIONS });
        try {
            const locations = await fetchLocations();
            dispatch({
                type: types.GET_LOCATIONS_SUCCESS,
                payload: locations,
            });
        } catch (error: any) {
            console.error('Failed to fetch locations:', error);
            dispatch({
                type: types.GET_LOCATIONS_FAILURE,
                payload: error.message || 'Failed to fetch locations',
            });
        }
    };
};

export const setSelectedLocation = (location: string) => ({
    type: types.SET_SELECTED_LOCATION,
    payload: location,
});

/** Promotion images for a key + placement, e.g. the home hero: getPromotionImages('hero', 'home'). */
type PromotionDispatch = (action: { type: string; payload?: unknown }) => void;

export const getPromotionImages = (key: string, placement?: string) => {
    const slot = promotionSlot(key, placement);
    return async (dispatch: PromotionDispatch) => {
        dispatch({ type: types.GET_PROMOTION_IMAGES, payload: { slot } });
        try {
            const images = await fetchPromotionImages(key, placement);
            dispatch({
                type: types.GET_PROMOTION_IMAGES_SUCCESS,
                payload: { slot, images },
            });
        } catch (error: unknown) {
            console.error('Failed to fetch promotion images:', error);
            dispatch({
                type: types.GET_PROMOTION_IMAGES_FAILURE,
                payload: { slot, error: error instanceof Error && error.message ? error.message : 'Failed to fetch promotion images' },
            });
        }
    };
};
