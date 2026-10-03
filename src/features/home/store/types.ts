/** Item from GET /public/promotions/images?key=…&placement=… */
export interface PromotionImage {
    id: number;
    mediaId: number;
    promoKey: string;
    placement: string | null;
    startAt: string | null;
    endAt: string | null;
    priority: number;
    isActive: boolean;
    title: string | null;
    altTextOverride?: string | null;
    url: string;
    heroUrl: string | null;
    thumbnailUrl: string | null;
    originalUrl: string | null;
}

export const promotionSlot = (key: string, placement?: string) => `${key}:${placement ?? ''}`;
