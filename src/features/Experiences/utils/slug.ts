/** URL-safe slug: lower-case, non-alphanumerics collapsed to single dashes. */
export const slugify = (s: string) =>
    (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** `/experience/:slugOrId` — numeric params resolve via `/{id}`, others via `/slug/{slug}`. */
export const isNumericId = (value: string | number | null | undefined) => /^\d+$/.test(String(value ?? ''));

/**
 * Canonical link to an experience detail page. Prefers the backend slug and
 * falls back to the numeric id for records that have no slug yet.
 */
export const experiencePath = (e: { id: string | number; slug?: string | null }) =>
    `/experience/${e.slug && e.slug.trim() ? encodeURIComponent(e.slug.trim()) : e.id}`;

/**
 * `/category/:categorySlug` links are built from the category name (the categories
 * endpoint has no slug field), so compare slugified names rather than raw strings.
 */
export const matchesCategorySlug = (categoryName: string | null | undefined, categorySlug: string | undefined) =>
    !!categorySlug && slugify(categoryName ?? '') === slugify(categorySlug);
