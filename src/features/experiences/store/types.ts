/**
 * Shapes returned by the public experiences endpoints.
 *
 *  GET /public/experiences                       -> ExperienceListItem[]
 *  GET /public/experiences/featured              -> ExperienceListItem[]
 *  GET /public/experiences/subcategory/{id}      -> ExperienceListItem[]
 *  GET /public/experiences/{id}                  -> ExperienceDetailResponse
 *  GET /public/experiences/slug/{slug}           -> ExperienceDetailResponse
 */

export interface ExperienceListItem {
    id: number;
    name: string;
    slug?: string | null;
    tagName?: string | null;
    basePrice: number;
    displayOrder?: number;
    isFeatured?: boolean;
    isActive?: boolean;
    subCategoryId?: number | null;
    subCategoryName?: string | null;
    categoryId?: number | null;
    categoryName?: string | null;
    durationMinutes?: number;
    maxCapacity?: number;
    shortDescription?: string | null;
    heroUrl?: string | null;
    thumbnailUrl?: string | null;
    originalUrl?: string | null;
    imageAltText?: string | null;
    createdOn?: string;
    updatedOn?: string;
}

export interface ExperienceDetailResponse extends Omit<ExperienceListItem, 'heroUrl' | 'thumbnailUrl' | 'originalUrl'> {
    detail?: {
        shortDescription?: string;
        description?: string;
        durationMinutes?: number;
        maxCapacity?: number;
        minAge?: number;
        completionTime?: number;
        minHours?: number;
        termsConditions?: string;
        whatToBring?: string;
        isActive?: boolean;
    };
    inclusions?: unknown[];
    cancellationPolicies?: unknown[];
    media?: unknown[];
    locations?: unknown[];
    faqs?: unknown[];
}

/** Envelope every public endpoint wraps its payload in. */
export interface ApiEnvelope<T> {
    code: number;
    status: string;
    msg?: string;
    response: T;
}

/** Item from GET /public/addons — the whole add-on catalogue. */
export interface AddonCatalogueItem {
    id: number;
    name: string;
    description?: string | null;
    icon?: string | null;
    mediaId?: number | null;
    heroUrl?: string | null;
    thumbnailUrl?: string | null;
    originalUrl?: string | null;
    basePrice: number;
    /** Price to charge. Equals basePrice on the catalogue endpoint. */
    effectivePrice: number;
    isFree: boolean;
    isActive: boolean;
}

/**
 * Item from GET /public/experiences/{id}/addons — an add-on attached to one experience.
 * `effectivePrice` already accounts for `priceOverride`, so charge that.
 */
export interface ExperienceAddon extends Omit<AddonCatalogueItem, 'id'> {
    mapperId: number;
    addonId: number;
    priceOverride?: number | null;
}
