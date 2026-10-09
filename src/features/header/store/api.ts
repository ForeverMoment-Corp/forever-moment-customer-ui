const API_BASE = import.meta.env.VITE_API_URL || '/api/platform';

export const fetchCategories = async (locationId?: number) => {
    const endpoint = locationId 
        ? `${API_BASE}/public/locations/${encodeURIComponent(String(locationId))}/categories`
        : `${API_BASE}/public/categories`;
    const response = await fetch(endpoint);
    if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    const data = await response.json();
    return data.response;
};

const getSubCategoryList = async (path: string) => {
    const response = await fetch(`${API_BASE}${path}`);
    // Nothing to list is an empty result, not a failure.
    if (response.status === 404) return [];
    if (!response.ok) {
        throw new Error(`Failed to fetch sub-categories: ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data.response) ? data.response : [];
};

/**
 * GET /public/locations/{locationId}/subcategories — the sub-categories active in the picked city.
 * That endpoint carries no `media` / `description`, so those are filled in from
 * GET /public/subcategories (fetched in parallel; if it fails the cards use stock photos).
 * Without a city, falls back to GET /public/subcategories alone.
 */
export const fetchSubCategories = async (locationId?: number) => {
    if (locationId == null) return getSubCategoryList('/public/subcategories');

    const [inLocation, all] = await Promise.all([
        getSubCategoryList(`/public/locations/${encodeURIComponent(String(locationId))}/subcategories`),
        getSubCategoryList('/public/subcategories').catch(() => []),
    ]);
    const details = new Map(all.map((s: { id: number }) => [s.id, s]));
    return inLocation.map((s: { id: number }) => ({ ...(details.get(s.id) ?? {}), ...s }));
};
