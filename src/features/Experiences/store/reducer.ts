import * as types from './action-types';
import type { AddonCatalogueItem, ExperienceAddon, ExperienceDetailResponse, ExperienceListItem } from './types';

export interface ExperiencesState {
    /** GET /public/experiences */
    data: ExperienceListItem[];
    loading: boolean;
    error: string | null;

    /** GET /public/experiences/subcategory/{id} */
    subCategoryData: ExperienceListItem[];
    /** Which sub-category `subCategoryData` belongs to, so stale lists are never shown. */
    subCategoryKey: string | null;
    subCategoryLoading: boolean;
    subCategoryError: string | null;

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
    loading: false,
    error: null,

    subCategoryData: [],
    subCategoryKey: null,
    subCategoryLoading: false,
    subCategoryError: null,

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
        case types.GET_DATA:
            return { ...state, loading: true, error: null };
        case types.GET_DATA_SUCCESS:
            return { ...state, loading: false, data: action.payload ?? [] };
        case types.GET_DATA_FAILURE:
            return { ...state, loading: false, error: action.payload };

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
                subCategoryKey: action.payload?.subCategoryId ?? null,
                subCategoryData: [],
            };
        case types.GET_SUBCATEGORY_EXPERIENCES_SUCCESS:
            return {
                ...state,
                subCategoryLoading: false,
                subCategoryKey: action.payload?.subCategoryId ?? state.subCategoryKey,
                subCategoryData: action.payload?.data ?? [],
            };
        case types.GET_SUBCATEGORY_EXPERIENCES_FAILURE:
            return { ...state, subCategoryLoading: false, subCategoryError: action.payload };

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
