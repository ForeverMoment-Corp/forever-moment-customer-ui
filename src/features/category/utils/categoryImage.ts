import service1 from "@/assets/images/services/service1.webp";
import service2 from "@/assets/images/services/service2.webp";
import service3 from "@/assets/images/services/service3.webp";
import service4 from "@/assets/images/services/service4.webp";
import service5 from "@/assets/images/services/service5.webp";
import service6 from "@/assets/images/services/service6.webp";
import service7 from "@/assets/images/services/service7.webp";
import service8 from "@/assets/images/services/service8.webp";
import service9 from "@/assets/images/services/service9.webp";
import service10 from "@/assets/images/services/service10.webp";

/* eslint-disable @typescript-eslint/no-explicit-any -- maps the untyped /public/categories payload */

/** Static pool used only when a category has no artwork in the API yet. */
export const categoryImagePool = [
  service1, service2, service3, service4, service5,
  service6, service7, service8, service9, service10,
];

export const getCategoryFallbackImage = (index: number) =>
  categoryImagePool[((index % categoryImagePool.length) + categoryImagePool.length) % categoryImagePool.length];

type Pick = 'hero' | 'thumbnail';

const fromMediaEntry = (m: any, pick: Pick): string =>
  (pick === 'thumbnail'
    ? m?.thumbnailUrl || m?.heroUrl || m?.url || m?.originalUrl
    : m?.heroUrl || m?.url || m?.originalUrl || m?.thumbnailUrl) || '';

/**
 * Resolve a category's artwork as served by `/public/categories`.
 *
 * Order of preference:
 *  1. The `media` entry flagged `isPrimary` (active entries only), then lowest `displayOrder`.
 *  2. The flat `heroUrl` / `thumbnailUrl` / `originalUrl` / `icon` fields on the category.
 *
 * Returns an empty string when the category has no artwork, so callers can decide
 * between the static pool and an empty state.
 */
export function getCategoryImage(category: any, pick: Pick = 'hero'): string {
  if (!category) return '';

  const media = Array.isArray(category.media) ? category.media : [];
  const best = media
    .filter((m: any) => m && m.isActive !== false && fromMediaEntry(m, pick))
    .sort(
      (a: any, b: any) =>
        Number(!!b.isPrimary) - Number(!!a.isPrimary) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    )[0];

  if (best) return fromMediaEntry(best, pick);
  return fromMediaEntry(category, pick) || category.icon || '';
}

/** The category's own artwork, falling back to the static pool by position. */
export const getCategoryImageOrFallback = (category: any, index: number, pick: Pick = 'hero') =>
  getCategoryImage(category, pick) || getCategoryFallbackImage(index);

export interface CategoryImage {
  hero: string;
  thumbnail: string;
  alt: string;
}

/**
 * Every active image on a category, primary first then by display order.
 * Falls back to the flat image fields so a category with no `media` array
 * still yields its single picture.
 */
export function getCategoryImages(category: any): CategoryImage[] {
  if (!category) return [];
  const name: string = category.name || 'Category';

  const media = (Array.isArray(category.media) ? category.media : [])
    .filter((m: any) => m && m.isActive !== false && fromMediaEntry(m, 'hero'))
    .sort(
      (a: any, b: any) =>
        Number(!!b.isPrimary) - Number(!!a.isPrimary) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    )
    .map((m: any, i: number) => ({
      hero: fromMediaEntry(m, 'hero'),
      thumbnail: fromMediaEntry(m, 'thumbnail'),
      alt: m.altText?.trim() || `${name} photo ${i + 1}`,
    }));

  if (media.length > 0) return media;

  const flat = fromMediaEntry(category, 'hero') || category.icon || '';
  return flat ? [{ hero: flat, thumbnail: fromMediaEntry(category, 'thumbnail') || flat, alt: name }] : [];
}

/**
 * Sub-categories carry the same media shape as categories, so the resolver is shared.
 * Aliased for readability at the call site.
 */
export const getSubCategoryImages = getCategoryImages;
