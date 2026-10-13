/**
 * Page metadata for search engines and link previews (WhatsApp, Facebook, X, LinkedIn).
 *
 * index.html carries the defaults for crawlers that do not run JavaScript; applySeo() updates the
 * same tags per page once the app is running (Google renders JavaScript and reads them).
 */

const SITE_NAME = 'Forever Moment';

/** Public site address (no trailing slash). Set VITE_SITE_URL per environment; falls back to this origin. */
export const SITE_URL = String(import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '');

export const DEFAULT_TITLE = "Forever Moment | India's #1 Celebration Platform";
export const DEFAULT_DESCRIPTION =
    'Book birthday decorations, anniversary surprises, candlelight dinners and more, set up at your venue by verified vendors. Transparent pricing and 24/7 support.';
/** 1200×630 share image in /public. */
export const DEFAULT_IMAGE = '/og-image.jpg';

export interface SeoMeta {
    /** Page name; becomes "Name · Forever Moment". Empty for the default (home) title. */
    title?: string | null;
    description?: string | null;
    /** Absolute URL or a path on this site. */
    image?: string | null;
    /** Path for the canonical URL; defaults to the current path (query string dropped). */
    path?: string;
    /** Keep the page out of search results (private pages, search results, 404). */
    noindex?: boolean;
    /** og:type: "website" for listings, "product" for an experience. */
    type?: 'website' | 'product';
}

/** API names are often lower-case ("birthday decor"); titles read better capitalised. */
const SMALL_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
const capitalise = (s: string) =>
    s.replace(/\p{L}[\p{L}'’]*/gu, (word, offset: number) =>
        offset > 0 && SMALL_WORDS.has(word.toLowerCase()) ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1),
    );

export const formatTitle = (title?: string | null) => {
    const t = title?.trim();
    return t ? `${capitalise(t)} · ${SITE_NAME}` : DEFAULT_TITLE;
};

export const absoluteUrl = (pathOrUrl: string) =>
    /^https?:\/\//i.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;

/** Plain text of at most `max` characters, cut at a word, for meta descriptions. */
export const toDescription = (text: string | null | undefined, max = 160) => {
    const plain = (text ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plain.length <= max) return plain;
    const cut = plain.slice(0, max - 1);
    return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 30)).replace(/[\s,.;:–-]+$/, '')}…`;
};

function setMeta(attr: 'name' | 'property', key: string, content: string) {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setCanonical(href: string) {
    let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!el) {
        el = document.createElement('link');
        el.rel = 'canonical';
        document.head.appendChild(el);
    }
    el.href = href;
}

/** Title, description, canonical, robots and the Open Graph / Twitter tags, all in one go. */
export function applySeo(meta: SeoMeta = {}) {
    const title = formatTitle(meta.title);
    const description = toDescription(meta.description) || DEFAULT_DESCRIPTION;
    const url = absoluteUrl(meta.path ?? window.location.pathname);
    const image = absoluteUrl(meta.image || DEFAULT_IMAGE);

    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', meta.noindex ? 'noindex, follow' : 'index, follow');
    setCanonical(url);

    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:type', meta.type ?? 'website');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);
}

/** Adds (or replaces) a JSON-LD block by id; null removes it. */
export function setJsonLd(id: string, data: object | null) {
    const existing = document.getElementById(id);
    if (!data) {
        existing?.remove();
        return;
    }
    const el = existing ?? document.createElement('script');
    el.id = id;
    (el as HTMLScriptElement).type = 'application/ld+json';
    el.textContent = JSON.stringify(data);
    if (!existing) document.head.appendChild(el);
}

/** schema.org BreadcrumbList from [{ name, path }]. */
export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: capitalise(item.name),
        item: absoluteUrl(item.path),
    })),
});
