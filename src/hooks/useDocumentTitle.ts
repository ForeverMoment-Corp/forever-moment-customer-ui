import { useEffect } from 'react';
import { applySeo, setJsonLd, type SeoMeta } from '@/lib/seo';

export { DEFAULT_TITLE, formatTitle } from '@/lib/seo';

/**
 * Page metadata for pages named from data (category, collection, experience, search, 404):
 * title, description, canonical, robots, share tags and optional JSON-LD blocks.
 * Fixed pages get theirs from CustomerLayout's PAGE_SEO instead.
 */
export function useSeo(meta: SeoMeta, jsonLd?: Record<string, object | null>) {
    const key = JSON.stringify(meta);
    const ldKey = JSON.stringify(jsonLd ?? {});
    useEffect(() => {
        applySeo(meta);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
    useEffect(() => {
        const blocks = jsonLd ?? {};
        for (const [id, data] of Object.entries(blocks)) setJsonLd(id, data);
        // Structured data belongs to this page only.
        return () => {
            for (const id of Object.keys(blocks)) setJsonLd(id, null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ldKey]);
}

/** Title only (description, image etc. fall back to the site defaults). */
export function useDocumentTitle(title: string | null | undefined, options: Omit<SeoMeta, 'title'> = {}) {
    useSeo({ ...options, title });
}
