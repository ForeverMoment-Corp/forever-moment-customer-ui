import { useCallback, useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { subCategoryPath, type NavCategory } from '@/components/navbar/navTypes';

type SubRef = { id: number | string; name?: string | null; slug?: string | null };

/**
 * subCategoryPath for places that only know a collection's id and name (experience breadcrumbs,
 * related links): fills in the slug from the menu data already loaded, so links go straight to
 * `/collection/<slug>` instead of the name-id URL and a redirect.
 */
export function useCollectionPath() {
    const categories = useAppSelector((s) => s.header?.categories ?? []) as NavCategory[];
    const subCategories = useAppSelector((s) => s.header?.subCategories ?? []) as SubRef[];
    const slugs = useMemo(() => {
        const map = new Map<string, string>();
        for (const sub of [...categories.flatMap((c) => c.subCategories ?? []), ...subCategories]) {
            if (sub?.slug) map.set(String(sub.id), sub.slug);
        }
        return map;
    }, [categories, subCategories]);
    return useCallback((sub: SubRef) => subCategoryPath({ ...sub, slug: sub.slug ?? slugs.get(String(sub.id)) }), [slugs]);
}
