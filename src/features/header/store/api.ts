const API_BASE = import.meta.env.VITE_API_URL || '/api/platform';

export const fetchCategories = async () => {
    const response = await fetch(`${API_BASE}/public/categories`);
    if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    const data = await response.json();
    return data.response;
};

/** GET /public/subcategories — every sub-category across all categories. */
export const fetchSubCategories = async () => {
    const response = await fetch(`${API_BASE}/public/subcategories`);
    // Nothing to list is an empty result, not a failure.
    if (response.status === 404) return [];
    if (!response.ok) {
        throw new Error(`Failed to fetch sub-categories: ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data.response) ? data.response : [];
};
