import * as types from './action-types';

export interface HeaderState {
    isMenuOpen: boolean;
    searchQuery: string;
    categories: any[];
    /** City the categories were fetched for (experienceListKey). */
    categoriesKey: string | null;
    categoriesLoading: boolean;
    categoriesError: string | null;
    /** GET /public/locations/{locationId}/subcategories (with media from /public/subcategories) */
    subCategories: any[];
    /** City the sub-categories were fetched for (experienceListKey). */
    subCategoriesKey: string | null;
    subCategoriesLoading: boolean;
    subCategoriesError: string | null;
}

const initialState: HeaderState = {
    isMenuOpen: false,
    searchQuery: '',
    categories: [],
    categoriesKey: null,
    categoriesLoading: false,
    categoriesError: null,
    subCategories: [],
    subCategoriesKey: null,
    subCategoriesLoading: false,
    subCategoriesError: null,
};

export const headerReducer = (state = initialState, action: any): HeaderState => {
    switch (action.type) {
        case types.TOGGLE_MENU:
            return {
                ...state,
                isMenuOpen: !state.isMenuOpen,
            };
        case types.SET_SEARCH_QUERY:
            return {
                ...state,
                searchQuery: action.payload,
            };
        case types.GET_CATEGORIES:
            return {
                ...state,
                categoriesLoading: true,
                categoriesError: null,
                categoriesKey: action.payload?.key ?? null,
            };
        case types.GET_CATEGORIES_SUCCESS:
            // Ignore a late response for a city the user has already switched away from.
            if (action.payload?.key !== state.categoriesKey) return state;
            return {
                ...state,
                categoriesLoading: false,
                categories: action.payload?.categories ?? [],
            };
        case types.GET_CATEGORIES_FAILURE:
            if (action.payload?.key !== state.categoriesKey) return state;
            return {
                ...state,
                categoriesLoading: false,
                categoriesError: action.payload?.error ?? null,
            };
        case types.GET_SUBCATEGORIES:
            return { ...state, subCategoriesLoading: true, subCategoriesError: null, subCategoriesKey: action.payload?.key ?? null };
        case types.GET_SUBCATEGORIES_SUCCESS:
            // Ignore a late response for a city the user has already switched away from.
            if (action.payload?.key !== state.subCategoriesKey) return state;
            return { ...state, subCategoriesLoading: false, subCategories: action.payload?.subCategories ?? [] };
        case types.GET_SUBCATEGORIES_FAILURE:
            if (action.payload?.key !== state.subCategoriesKey) return state;
            return { ...state, subCategoriesLoading: false, subCategoriesError: action.payload?.error ?? null };

        default:
            return state;
    }
};
