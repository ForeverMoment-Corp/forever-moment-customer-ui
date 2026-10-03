import type { PromotionImage } from './types';

export { fetchFeaturedExperiences } from '@/features/experiences/store/api';

const API_BASE = import.meta.env.VITE_API_URL || '/api/platform';

export const fetchLocations = async () => {
    const response = await fetch(`${API_BASE}/public/locations`);
    if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.statusText}`);
    }
    const data = await response.json();
    return data.response;
};

/** GET /public/promotions/images?key={key}&placement={placement} */
export const fetchPromotionImages = async (key: string, placement?: string): Promise<PromotionImage[]> => {
    const params = new URLSearchParams({ key });
    if (placement) params.set('placement', placement);
    const response = await fetch(`${API_BASE}/public/promotions/images?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch promotion images: ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data.response) ? data.response : [];
};
