import * as types from './action-types';
import type { AddonCatalogueItem, ExperienceAddon, ExperienceDetailResponse, ExperienceListItem } from './types';

export interface ExperiencesState {
    /** GET /public/locations/{locationId}/experiences */
    data: ExperienceListItem[];
    /** City `data` belongs to (experienceListKey). */
    dataKey: string | null;
    loading: boolean;
    error: string | null;

    /** GET /public/experiences/location/{locationId}/subcategory/{id} */
    subCategoryData: ExperienceListItem[];
    /** City + sub-category `subCategoryData` belongs to (experienceListKey), so stale lists are never shown. */
    subCategoryKey: string | null;
    subCategoryLoading: boolean;
    subCategoryError: string | null;

    /** GET /public/experiences/location/{locationId}/category/{id} */
    categoryData: ExperienceListItem[];
    /** City + category `categoryData` belongs to (experienceListKey). */
    categoryKey: string | null;
    categoryLoading: boolean;
    categoryError: string | null;

    /** GET /public/experiences/{id} or /slug/{slug} */
    currentExperience: ExperienceDetailResponse | null;
    /** The id or slug the current detail request was made for. */
    detailKey: string | null;
    detailLoading: boolean;
    detailError: string | null;

    /** GET /public/addons */
    addons: AddonCatalogueItem[];
    addonsLoading: boolean;
    /** GET /public/experiences/{id}/addons, keyed by experience id. */
    experienceAddons: Record<string, ExperienceAddon[]>;
    experienceAddonsLoading: Record<string, boolean>;
}

const initialState: ExperiencesState = {
    data: [],
    dataKey: null,
    loading: false,
    error: null,

    subCategoryData: [],
    subCategoryKey: null,
    subCategoryLoading: false,
    subCategoryError: null,

    categoryData: [],
    categoryKey: null,
    categoryLoading: false,
    categoryError: null,

    currentExperience: null,
    detailKey: null,
    detailLoading: false,
    detailError: null,

    addons: [],
    addonsLoading: false,
    experienceAddons: {},
    experienceAddonsLoading: {},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- legacy action objects are untyped
export const experiencesReducer = (state = initialState, action: any): ExperiencesState => {
    switch (action.type) {
        // ── All experiences ──
        case types.GET_DATA: {
            const key = action.payload?.key ?? null;
            // Another city's list must not show while this one loads.
            return { ...state, loading: true, error: null, dataKey: key, data: key === state.dataKey ? state.data : [] };
        }
        case types.GET_DATA_SUCCESS:
            if (action.payload?.key !== state.dataKey) return state;
            return { ...state, loading: false, data: action.payload?.data ?? [] };
        case types.GET_DATA_FAILURE:
            if (action.payload?.key !== state.dataKey) return state;
            return { ...state, loading: false, error: action.payload?.error ?? null };

        // ── Detail (by id or slug) ──
        case types.GET_EXPERIENCE_DETAIL:
            return {
                ...state,
                detailLoading: true,
                detailError: null,
                detailKey: action.payload?.key ?? null,
                // Drop the previous experience so a navigation between two
                // detail pages never flashes the old one.
                currentExperience: null,
            };
        case types.GET_EXPERIENCE_DETAIL_SUCCESS:
            return { ...state, detailLoading: false, currentExperience: action.payload ?? null };
        case types.GET_EXPERIENCE_DETAIL_FAILURE:
            return { ...state, detailLoading: false, detailError: action.payload };

        // ── Sub-category list ──
        case types.GET_SUBCATEGORY_EXPERIENCES:
            return {
                ...state,
                subCategoryLoading: true,
                subCategoryError: null,
                subCategoryKey: action.payload?.key ?? null,
                subCategoryData: [],
            };
        case types.GET_SUBCATEGORY_EXPERIENCES_SUCCESS:
            // A slower response for an earlier city / sub-category must not overwrite the current one.
            if (action.payload?.key !== state.subCategoryKey) return state;
            return { ...state, subCategoryLoading: false, subCategoryData: action.payload?.data ?? [] };
        case types.GET_SUBCATEGORY_EXPERIENCES_FAILURE:
            if (action.payload?.key !== state.subCategoryKey) return state;
            return { ...state, subCategoryLoading: false, subCategoryError: action.payload?.error ?? null };

        // ── Category list ──
        case types.GET_CATEGORY_EXPERIENCES:
            return {
                ...state,
                categoryLoading: true,
                categoryError: null,
                categoryKey: action.payload?.key ?? null,
                categoryData: [],
            };
        case types.GET_CATEGORY_EXPERIENCES_SUCCESS:
            if (action.payload?.key !== state.categoryKey) return state;
            return { ...state, categoryLoading: false, categoryData: action.payload?.data ?? [] };
        case types.GET_CATEGORY_EXPERIENCES_FAILURE:
            if (action.payload?.key !== state.categoryKey) return state;
            return { ...state, categoryLoading: false, categoryError: action.payload?.error ?? null };

        // ── Add-ons ──
        case types.GET_ADDONS:
            return { ...state, addonsLoading: true };
        case types.GET_ADDONS_SUCCESS:
            return { ...state, addonsLoading: false, addons: action.payload ?? [] };
        case types.GET_ADDONS_FAILURE:
            return { ...state, addonsLoading: false };

        case types.GET_EXPERIENCE_ADDONS:
            return {
                ...state,
                experienceAddonsLoading: { ...state.experienceAddonsLoading, [action.payload.key]: true },
            };
        case types.GET_EXPERIENCE_ADDONS_SUCCESS:
            return {
                ...state,
                experienceAddons: { ...state.experienceAddons, [action.payload.key]: action.payload.addons ?? [] },
                experienceAddonsLoading: { ...state.experienceAddonsLoading, [action.payload.key]: false },
            };
        case types.GET_EXPERIENCE_ADDONS_FAILURE:
            return {
                ...state,
                experienceAddons: { ...state.experienceAddons, [action.payload.key]: [] },
                experienceAddonsLoading: { ...state.experienceAddonsLoading, [action.payload.key]: false },
            };

        default:
            return state;
    }
};
