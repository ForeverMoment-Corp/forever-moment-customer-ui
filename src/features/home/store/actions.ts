import * as types from './action-types';
import { fetchFeaturedExperiences, fetchLocations, fetchPromotionImages } from './api';
import { promotionSlot } from './types';
import { experienceListKey, selectLocationId } from '@/features/experiences/store/location';
import type { RootState } from '@/store/store';

/** GET /public/experiences/location/{locationId}/featured */
export const getFeaturedExperiences = () => {
    return async (dispatch: any, getState: () => RootState) => {
        const locationId = selectLocationId(getState());
        const key = experienceListKey(locationId, 'featured');
        // Already loaded or in flight for this city (e.g. StrictMode's second mount): don't call again.
        const { featuredKey, error } = getState().home;
        if (featuredKey === key && !error) return;
        dispatch({ type: types.GET_FEATURED_EXPERIENCES, payload: { key } });
        try {
            const experiences = await fetchFeaturedExperiences(locationId);
            dispatch({
                type: types.GET_FEATURED_EXPERIENCES_SUCCESS,
                payload: { key, experiences: experiences ?? [] },
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
    return async (dispatch: any, getState: () => RootState) => {
        // Navbar, header, slider, home and contact all ask for this; one request serves them all.
        const { locations, locationsLoading } = getState().home;
        if (locationsLoading || locations.length > 0) return;
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
