import * as types from './action-types';

export interface HeaderState {
    isMenuOpen: boolean;
    searchQuery: string;
    categories: any[];
    categoriesLoading: boolean;
    categoriesError: string | null;
    /** GET /public/subcategories */
    subCategories: any[];
    subCategoriesLoading: boolean;
    subCategoriesError: string | null;
}

const initialState: HeaderState = {
    isMenuOpen: false,
    searchQuery: '',
    categories: [],
    categoriesLoading: false,
    categoriesError: null,
    subCategories: [],
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
            };
        case types.GET_CATEGORIES_SUCCESS:
            return {
                ...state,
                categoriesLoading: false,
                categories: action.payload,
            };
        case types.GET_CATEGORIES_FAILURE:
            return {
                ...state,
                categoriesLoading: false,
                categoriesError: action.payload,
            };
        case types.GET_SUBCATEGORIES:
            return { ...state, subCategoriesLoading: true, subCategoriesError: null };
        case types.GET_SUBCATEGORIES_SUCCESS:
            return { ...state, subCategoriesLoading: false, subCategories: action.payload ?? [] };
        case types.GET_SUBCATEGORIES_FAILURE:
            return { ...state, subCategoriesLoading: false, subCategoriesError: action.payload };

        default:
            return state;
    }
};
