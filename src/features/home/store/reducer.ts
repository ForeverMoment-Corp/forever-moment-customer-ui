import * as types from './action-types';
import type { PromotionImage } from './types';

export interface HomeState {
    featuredExperiences: any[];
    locations: any[];
    selectedLocation: string;
    loading: boolean; // Global loading for initial page load
    locationsLoading: boolean;
    experiencesLoading: boolean;
    error: string | null;
    /** Promotion images keyed by `key:placement` (see promotionSlot). */
    promotions: Record<string, PromotionImage[]>;
    promotionsLoading: Record<string, boolean>;
}

const initialState: HomeState = {
    featuredExperiences: [],
    locations: [],
    selectedLocation: 'Vizag',
    loading: true, // Start with page-level loading
    locationsLoading: false,
    experiencesLoading: false,
    error: null,
    promotions: {},
    promotionsLoading: {},
};

export const homeReducer = (state = initialState, action: any): HomeState => {
    switch (action.type) {
        case types.GET_FEATURED_EXPERIENCES:
            return { ...state, experiencesLoading: true, error: null };
        case types.GET_FEATURED_EXPERIENCES_SUCCESS:
            return { ...state, loading: false, experiencesLoading: false, featuredExperiences: action.payload };
        case types.GET_FEATURED_EXPERIENCES_FAILURE:
            return { ...state, loading: false, experiencesLoading: false, error: action.payload };

        case types.GET_LOCATIONS:
            return { ...state, locationsLoading: true, error: null };
        case types.GET_LOCATIONS_SUCCESS:
            const locations = action.payload || [];
            const activeLocations = locations.filter((loc: any) => loc.isActive);
            let nextSelectedLocation = state.selectedLocation;

            // If current selectedLocation is default 'Vizag' or not in active list,
            // default to the first active location name from the API
            const isCurrentValid = activeLocations.some((loc: any) => loc.name === state.selectedLocation);
            if ((state.selectedLocation === 'Vizag' || !isCurrentValid) && activeLocations.length > 0) {
                nextSelectedLocation = activeLocations[0].name;
            }

            return {
                ...state,
                loading: false,
                locationsLoading: false,
                locations: locations,
                selectedLocation: nextSelectedLocation,
            };
        case types.GET_LOCATIONS_FAILURE:
            return { ...state, loading: false, locationsLoading: false, error: action.payload };
        case types.SET_SELECTED_LOCATION:
            return { ...state, selectedLocation: action.payload };

        case types.GET_PROMOTION_IMAGES:
            return { ...state, promotionsLoading: { ...state.promotionsLoading, [action.payload.slot]: true } };
        case types.GET_PROMOTION_IMAGES_SUCCESS:
            return {
                ...state,
                promotions: { ...state.promotions, [action.payload.slot]: action.payload.images ?? [] },
                promotionsLoading: { ...state.promotionsLoading, [action.payload.slot]: false },
            };
        case types.GET_PROMOTION_IMAGES_FAILURE:
            return { ...state, promotionsLoading: { ...state.promotionsLoading, [action.payload.slot]: false } };

        default:
            return state;
    }
};
