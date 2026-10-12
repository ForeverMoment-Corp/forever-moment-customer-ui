import { categoryPath, subCategoryPath, type NavCategory } from '@/components/navbar/navTypes';
import type { ExperienceListItem } from '@/features/experiences/store/types';

/**
 * Client-side search over data the app already loads (no search endpoint). Shared by the navbar
 * suggestions and the /search page so both rank results the same way.
 */

/** 0 = text starts with the query, 1 = a word starts with it, 2 = contains it, -1 = no match. */
export const matchRank = (text: string | null | undefined, q: string) => {
    const t = (text ?? '').toLowerCase();
    if (!t) return -1;
    if (t.startsWith(q)) return 0;
    if (t.split(/[\s\-&,/]+/).some((w) => w.startsWith(q))) return 1;
    return t.includes(q) ? 2 : -1;
};

export const normaliseQuery = (q: string) => q.trim().toLowerCase();

/** Matching experiences, best first: name, then tag, collection, category. */
export function searchExperiences(experiences: ExperienceListItem[], query: string): ExperienceListItem[] {
    const q = normaliseQuery(query);
    if (!q) return [];
    return experiences
        .filter((e) => e && e.isActive !== false)
        .map((e) => {
            const ranks = [matchRank(e.name, q), matchRank(e.tagName, q), matchRank(e.subCategoryName, q), matchRank(e.categoryName, q)]
                .map((r, i) => (r < 0 ? -1 : r + i * 3))
                .filter((r) => r >= 0);
            return { e, rank: ranks.length ? Math.min(...ranks) : -1 };
        })
        .filter((x) => x.rank >= 0)
        .sort((a, b) => a.rank - b.rank || a.e.name.localeCompare(b.e.name))
        .map((x) => x.e);
}

export interface PlaceMatch {
    key: string;
    label: string;
    /** "Category", or the parent category's name for a collection. */
    meta: string;
    to: string;
}

/** Matching categories and collections (sub-categories), best first. */
export function searchPlaces(categories: NavCategory[], query: string): PlaceMatch[] {
    const q = normaliseQuery(query);
    if (!q) return [];
    const places: { rank: number; place: PlaceMatch }[] = [];
    for (const cat of categories) {
        const rank = matchRank(cat.name, q);
        if (rank >= 0) places.push({ rank, place: { key: `c-${cat.id}`, label: cat.name, meta: 'Category', to: categoryPath(cat) } });
        for (const sub of cat.subCategories ?? []) {
            if (sub.isActive === false) continue;
            const subRank = matchRank(sub.name, q);
            if (subRank >= 0) places.push({ rank: subRank + 1, place: { key: `s-${sub.id}`, label: sub.name, meta: cat.name, to: subCategoryPath(sub) } });
        }
    }
    return places.sort((a, b) => a.rank - b.rank || a.place.label.localeCompare(b.place.label)).map((p) => p.place);
}

export const searchPath = (query: string) => `/search?q=${encodeURIComponent(query.trim())}`;
