/**
 * Vercel function: index.html with the page's own title, description, image and structured data,
 * for link-preview bots and crawlers that do not run JavaScript (WhatsApp, Facebook, LinkedIn, X,
 * Slack, Bing, Google …). vercel.json routes only bot user-agents here, and only for
 *   /experience/:slugOrId   /category/:slug   /collection/:slug or :name-id   (old /subcategory/:id)
 *   /:city/:category        (city landing pages, e.g. /delhi/birthday-decoration)
 * People get the static index.html as before; the app then sets the same tags itself (src/lib/seo.ts).
 *
 * Anything that fails (API down, unknown slug) falls back to the unchanged index.html, so a bot always
 * gets the normal page with the site-wide defaults.
 *
 *   VITE_SITE_URL  public site address (same variable the app and sitemap use)
 *   SEO_API_URL    platform API base; defaults to the host vercel.json proxies /api to
 */

const SITE = String(process.env.VITE_SITE_URL || '').replace(/\/+$/, '');
const API = String(process.env.SEO_API_URL || 'https://api.15.134.55.225.nip.io/api/platform').replace(/\/+$/, '');
const SITE_NAME = 'Forever Moment';

// ── helpers ────────────────────────────────────────────────────────────────────────────────

const escapeHtml = (s) =>
    String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Same as the app (utils/slug.ts): lower-case, non-alphanumerics collapsed to single dashes. */
const slugify = (s) =>
    String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/** Same as navTypes.subCategoryPath: /collection/<slug> when set, else /collection/pre-wedding-shoot-26 */
const collectionPath = (s) => {
    const slug = slugify(s.slug || '');
    if (slug) return `/collection/${slug}`;
    const name = slugify(s.name || '');
    return `/collection/${name ? `${name}-` : ''}${s.id}`;
};

const SMALL_WORDS = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
/** Title case without capitalising small words: "Birthday Decoration in Delhi" (same as src/lib/seo.ts). */
const capitalise = (s) =>
    String(s).replace(/\p{L}[\p{L}'’]*/gu, (word, offset) =>
        offset > 0 && SMALL_WORDS.has(word.toLowerCase()) ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1),
    );
const formatTitle = (t) => `${capitalise(String(t).trim())} · ${SITE_NAME}`;

/** Plain text, at most `max` characters, cut at a word (same as src/lib/seo.ts toDescription). */
const toDescription = (text, max = 160) => {
    const plain = String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plain.length <= max) return plain;
    const cut = plain.slice(0, max - 1);
    return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 30)).replace(/[\s,.;:–-]+$/, '')}…`;
};

/** Images come back site-relative ("/api/platform/public/images/…", sometimes with spaces). */
const absoluteUrl = (origin, url) => {
    if (!url) return '';
    const full = /^https?:\/\//i.test(url) ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
    return encodeURI(decodeURI(full));
};

/** Primary active media first, then by display order; falls back to the flat image fields. */
const primaryImage = (item) => {
    const media = (Array.isArray(item?.media) ? item.media : [])
        .filter((m) => m && m.isActive !== false && (m.heroUrl || m.url || m.originalUrl))
        .sort((a, b) => Number(!!b.isPrimary) - Number(!!a.isPrimary) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    const m = media[0];
    return (m && (m.heroUrl || m.url || m.originalUrl)) || item?.heroUrl || item?.originalUrl || item?.thumbnailUrl || '';
};

async function getApi(path) {
    const res = await fetch(`${API}${path}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    return body && typeof body === 'object' && 'response' in body ? body.response : body;
}

const breadcrumb = (origin, items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: capitalise(it.name), item: `${origin}${it.path}` })),
});

// ── page metadata per route ────────────────────────────────────────────────────────────────

async function experienceMeta(origin, slugOrId) {
    const numeric = /^\d+$/.test(slugOrId);
    const e = await getApi(numeric ? `/public/experiences/${slugOrId}` : `/public/experiences/slug/${encodeURIComponent(slugOrId)}`);
    if (!e || e.isActive === false || !e.name) return null;
    const path = `/experience/${e.slug ? encodeURIComponent(e.slug) : e.id}`;
    const short = e.detail?.shortDescription || e.shortDescription || e.detail?.description || '';
    const images = (Array.isArray(e.media) ? e.media : [])
        .filter((m) => m && m.isActive !== false && (m.heroUrl || m.url))
        .sort((a, b) => Number(!!b.isPrimary) - Number(!!a.isPrimary) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .slice(0, 3)
        .map((m) => absoluteUrl(origin, m.heroUrl || m.url));
    const price = Number(e.basePrice) || 0;
    return {
        title: formatTitle(e.name),
        description: toDescription(short) || `Book ${e.name} by ${SITE_NAME}.`,
        image: images[0],
        url: `${origin}${path}`,
        type: 'product',
        jsonLd: [
            {
                // No rating or "original price": the site's are placeholders, and fake review / offer markup is penalised.
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: e.name,
                description: toDescription(short, 500) || undefined,
                image: images.length ? images : undefined,
                url: `${origin}${path}`,
                category: e.subCategoryName || e.categoryName || undefined,
                brand: { '@type': 'Brand', name: SITE_NAME },
                offers:
                    price > 0
                        ? { '@type': 'Offer', price, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: `${origin}${path}` }
                        : undefined,
            },
            breadcrumb(origin, [
                { name: 'Home', path: '/' },
                ...(e.categoryName ? [{ name: e.categoryName, path: `/category/${slugify(e.categoryName)}` }] : []),
                ...(e.subCategoryId && e.subCategoryName
                    ? [{ name: e.subCategoryName, path: collectionPath({ id: e.subCategoryId, name: e.subCategoryName }) }]
                    : []),
                { name: e.name, path },
            ]),
        ],
    };
}

async function categoryMeta(origin, slug) {
    const categories = await getApi('/public/categories');
    const want = slugify(slug);
    const c = (Array.isArray(categories) ? categories : []).find(
        (x) => x && x.isActive !== false && (slugify(x.slug) === want || slugify(x.name) === want),
    );
    if (!c) return null;
    const path = `/category/${slugify(c.slug || c.name)}`;
    return {
        title: formatTitle(c.name),
        description:
            toDescription(c.description) ||
            `${capitalise(c.name.trim())} decor and experiences, set up at your venue by ${SITE_NAME}. Pick a setup, choose a date and book online.`,
        image: absoluteUrl(origin, primaryImage(c)),
        url: `${origin}${path}`,
        type: 'website',
        jsonLd: [breadcrumb(origin, [{ name: 'Home', path: '/' }, { name: c.name.trim(), path }])],
    };
}

async function subCategoryMeta(origin, param) {
    // "mehandi" (admin slug), "pre-wedding-shoot-26" or a bare "26" from an old /subcategory/ link.
    const subs = (await getApi('/public/subcategories')) || [];
    const list = (Array.isArray(subs) ? subs : []).filter((x) => x && x.isActive !== false);
    const want = String(param).toLowerCase();
    const id = want.match(/(\d+)$/)?.[1];
    const s = list.find((x) => x.slug && String(x.slug).toLowerCase() === want) || (id && list.find((x) => String(x.id) === id));
    if (!s) return null;
    const path = collectionPath(s);
    const name = s.categoryName ? `${s.name} · ${s.categoryName.trim()}` : s.name;
    return {
        title: formatTitle(name),
        description:
            toDescription(s.description) ||
            `${s.name}${s.categoryName ? ` for ${s.categoryName.trim().toLowerCase()}` : ''}: setups styled and installed at your venue by ${SITE_NAME}.`,
        image: absoluteUrl(origin, primaryImage(s)),
        url: `${origin}${path}`,
        type: 'website',
        jsonLd: [
            breadcrumb(origin, [
                { name: 'Home', path: '/' },
                ...(s.categoryName ? [{ name: s.categoryName.trim(), path: `/category/${slugify(s.categoryName)}` }] : []),
                { name: s.name, path },
            ]),
        ],
    };
}

async function cityMeta(origin, citySlug, categorySlug) {
    const [cities, categories] = await Promise.all([getApi('/public/locations'), getApi('/public/categories')]);
    const city = (Array.isArray(cities) ? cities : []).find((c) => c && c.isActive !== false && slugify(c.name) === citySlug);
    const want = slugify(categorySlug);
    const c = (Array.isArray(categories) ? categories : []).find(
        (x) => x && x.isActive !== false && (slugify(x.slug) === want || slugify(x.name) === want),
    );
    if (!city || !c) return null;
    const cityName = String(city.name).trim();
    const categoryName = capitalise(String(c.name).trim());
    const path = `/${citySlug}/${slugify(c.slug || c.name)}`;
    return {
        title: formatTitle(`${categoryName} in ${cityName}`),
        description: `${categoryName} in ${cityName}: decor and experiences set up at your venue by ${SITE_NAME}. Pick a setup, choose a date and book online.`,
        image: absoluteUrl(origin, primaryImage(c)),
        url: `${origin}${path}`,
        type: 'website',
        jsonLd: [
            breadcrumb(origin, [
                { name: 'Home', path: '/' },
                { name: categoryName, path: `/category/${slugify(c.slug || c.name)}` },
                { name: `${categoryName} in ${cityName}`, path },
            ]),
        ],
    };
}

// ── HTML ───────────────────────────────────────────────────────────────────────────────────

/** Replaces the default tags index.html ships with (title, description, canonical, og:*, twitter:*). */
export function injectMeta(template, meta) {
    let html = template;
    const set = (attr, key, value) => {
        if (!value) return;
        const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`, 'i');
        html = re.test(html) ? html.replace(re, `$1${escapeHtml(value)}$2`) : html.replace('</head>', `  <meta ${attr}="${key}" content="${escapeHtml(value)}" />\n</head>`);
    };
    html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
    html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/i, `$1${escapeHtml(meta.url)}$2`);
    set('name', 'description', meta.description);
    set('property', 'og:title', meta.title);
    set('property', 'og:description', meta.description);
    set('property', 'og:url', meta.url);
    set('property', 'og:type', meta.type);
    set('property', 'og:image', meta.image);
    set('name', 'twitter:title', meta.title);
    set('name', 'twitter:description', meta.description);
    set('name', 'twitter:image', meta.image);
    if (meta.image) {
        // The default image's size no longer applies.
        html = html.replace(/\s*<meta\s+property="og:image:(width|height)"[^>]*>/gi, '');
    }
    const ld = (meta.jsonLd || [])
        .map((block) => `  <script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`)
        .join('\n');
    if (ld) html = html.replace('</head>', `${ld}\n</head>`);
    return html;
}

/** The meta for one request, or null to serve index.html unchanged. */
export async function metaFor(origin, kind, param, param2) {
    if (!param) return null;
    if (kind === 'city') return param2 ? cityMeta(origin, param, param2) : null;
    if (kind === 'experience') return experienceMeta(origin, param);
    if (kind === 'category') return categoryMeta(origin, param);
    if (kind === 'subcategory') return subCategoryMeta(origin, param);
    return null;
}

export default async function handler(req, res) {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = SITE || `https://${host}`;
    const kind = String(req.query.kind || '');
    const param = String(req.query.param || '');
    const param2 = String(req.query.param2 || '');

    // The built index.html from this deployment (a static file, so no rewrite loop).
    let template;
    try {
        const r = await fetch(`https://${host}/index.html`, { signal: AbortSignal.timeout(4000) });
        template = await r.text();
    } catch {
        res.status(502).send('Could not load the page template.');
        return;
    }

    let html = template;
    try {
        const meta = await metaFor(origin, kind, param, param2);
        if (meta) html = injectMeta(template, meta);
    } catch {
        // API slow or down: the defaults in index.html still make a valid page.
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Cached at the edge for 10 minutes, then refreshed in the background.
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
    res.status(200).send(html);
}
