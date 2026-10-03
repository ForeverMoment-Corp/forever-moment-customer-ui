/* eslint-disable @typescript-eslint/no-explicit-any -- maps the untyped API payload */

/**
 * Resolve the primary image URL of an experience as returned by the public API.
 *
 * Order of preference:
 *  1. The `media` entry flagged `isPrimary` (active entries only), then the lowest `displayOrder`.
 *  2. Flat `heroUrl` / `thumbnailUrl` / `originalUrl` fields on the list payload.
 *
 * Returns an empty string when the experience has no image at all. Callers must
 * render a neutral empty state in that case — never a stock/dummy photo.
 */
function primaryMedia(experience: any): any | undefined {
  const media = Array.isArray(experience?.media) ? experience.media : [];
  return media
    .filter((m: any) => m && m.isActive !== false && (m.heroUrl || m.url || m.thumbnailUrl || m.originalUrl))
    .sort(
      (a: any, b: any) =>
        Number(!!b.isPrimary) - Number(!!a.isPrimary) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    )[0];
}

export function getPrimaryImage(experience: any): string {
  if (!experience) return '';
  const primary = primaryMedia(experience);
  if (primary) return primary.heroUrl || primary.url || primary.thumbnailUrl || primary.originalUrl || '';
  return experience.heroUrl || experience.thumbnailUrl || experience.originalUrl || '';
}

/**
 * Small (~320px) variant of the primary image. Used as a blur-up placeholder so cards
 * paint instantly while the full-size hero downloads. Empty string when unavailable.
 */
export function getPrimaryThumbnail(experience: any): string {
  if (!experience) return '';
  const primary = primaryMedia(experience);
  if (primary?.thumbnailUrl) return primary.thumbnailUrl;
  return experience.thumbnailUrl || '';
}

/** Every image URL worth warming before the detail page opens: thumbnails first, then the hero. */
export function getPrefetchableImages(experience: any): string[] {
  const media = Array.isArray(experience?.media) ? experience.media : [];
  const thumbs = media.filter((m: any) => m && m.isActive !== false && m.thumbnailUrl).map((m: any) => m.thumbnailUrl as string);
  const hero = getPrimaryImage(experience);
  return Array.from(new Set([...thumbs, hero].filter(Boolean)));
}
