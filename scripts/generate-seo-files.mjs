/**
 * Writes dist/robots.txt and dist/sitemap.xml after `vite build`.
 *
 * The sitemap lists the public pages plus every active category, collection (sub-category) and
 * experience from the public API, using the same URL shapes as the app's links. If the API cannot
 * be reached the sitemap still gets the fixed pages and the build carries on.
 *
 *   VITE_SITE_URL  public site address (read from the .env files like Vite does)
 *   SEO_API_URL    platform API base; defaults to the host vercel.json proxies /api to
 *   MODE           Vite mode for the .env files (default: production)
 */
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';

const root = resolve(import.meta.dirname, '..');
const env = { ...loadEnv(process.env.MODE || 'production', root, ''), ...process.env };
const SITE = String(env.VITE_SITE_URL || '').replace(/\/+$/, '');
const API = String(env.SEO_API_URL || 'https://api.15.134.55.225.nip.io/api/platform').replace(/\/+$/, '');

if (!SITE) {
    console.warn('[seo] VITE_SITE_URL is not set; skipping robots.txt and sitemap.xml.');
    process.exit(0);
}

/** Pages only signed-in guests use, plus search results: not for crawling. */
const PRIVATE = ['/bookings', '/profile', '/cart', '/support', '/payment/', '/search'];
const STATIC = ['/', '/categories', '/subcategories', '/featured-experiences', '/help', '/contact', '/partner'];

// Same as the app: navTypes.categoryPath, subCategoryPath and experiencePath.
const slugify = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const categoryPath = (c) => `/category/${slugify(c.slug || c.name)}`;
const subCategoryPath = (s) => {
    const slug = slugify(s.slug || '');
    if (slug) return `/collection/${slug}`;
    const name = slugify(s.name || '');
    return `/collection/${name ? `${name}-` : ''}${s.id}`;
};
const experiencePath = (e) => `/experience/${e.slug && String(e.slug).trim() ? encodeURIComponent(String(e.slug).trim()) : e.id}`;

async function getList(path) {
    const res = await fetch(`${API}${path}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`${path}: ${res.status} ${res.statusText}`);
    const body = await res.json();
    const data = body && typeof body === 'object' && 'response' in body ? body.response : body;
    return Array.isArray(data) ? data : [];
}

const isActive = (x) => x && x.isActive !== false;
const toDate = (v) => {
    if (Array.isArray(v) && v.length >= 3) return new Date(Date.UTC(v[0], v[1] - 1, v[2]));
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? d : null;
};
const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const urls = new Map(); // path -> lastmod (Date | null)
STATIC.forEach((p) => urls.set(p, null));

// Each list on its own, so one failing endpoint does not empty the whole sitemap.
try {
    const categories = await getList('/public/categories');
    for (const c of categories.filter(isActive)) {
        urls.set(categoryPath(c), null);
        for (const s of (c.subCategories ?? []).filter(isActive)) urls.set(subCategoryPath(s), null);
    }
    console.log(`[seo] ${categories.length} categories`);
} catch (err) {
    console.warn(`[seo] Could not load categories (${err.message}).`);
}

/** All experiences; when that endpoint fails, city by city (how the app itself loads them). */
async function getExperiences() {
    try {
        return await getList('/public/experiences');
    } catch (err) {
        console.warn(`[seo] /public/experiences failed (${err.message}); trying each city.`);
        const cities = (await getList('/public/locations')).filter(isActive);
        // /public/experiences/location/{id}, not /public/locations/{id}/experiences (mapper rows, no ids).
        const lists = await Promise.allSettled(cities.map((c) => getList(`/public/experiences/location/${encodeURIComponent(c.id)}`)));
        return lists.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
    }
}

try {
    const experiences = await getExperiences();
    for (const e of experiences.filter(isActive)) urls.set(experiencePath(e), toDate(e.updatedOn) ?? toDate(e.createdOn));
    console.log(`[seo] ${experiences.length} experiences`);
} catch (err) {
    console.warn(`[seo] Could not load experiences (${err.message}).`);
}

// City landing pages (/delhi/birthday-decoration), only where the city has something in the category.
try {
    const [cities, categories] = await Promise.all([getList('/public/locations'), getList('/public/categories')]);
    const categoryById = new Map(categories.filter(isActive).map((c) => [c.id, c]));
    let count = 0;
    for (const city of cities.filter(isActive)) {
        const list = await getList(`/public/experiences/location/${encodeURIComponent(city.id)}`).catch(() => []);
        const ids = new Set(list.filter(isActive).map((e) => e.categoryId).filter((id) => categoryById.has(id)));
        for (const id of ids) {
            urls.set(`/${slugify(city.name)}${categoryPath(categoryById.get(id)).replace('/category', '')}`, null);
            count += 1;
        }
    }
    console.log(`[seo] ${count} city landing pages`);
} catch (err) {
    console.warn(`[seo] Could not build city landing pages (${err.message}).`);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls]
    .map(([path, lastmod]) =>
        `  <url><loc>${xmlEscape(SITE + path)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}</url>`,
    )
    .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
${PRIVATE.map((p) => `Disallow: ${p}`).join('\n')}

Sitemap: ${SITE}/sitemap.xml
`;

const dist = resolve(root, 'dist');
await writeFile(resolve(dist, 'sitemap.xml'), sitemap);
await writeFile(resolve(dist, 'robots.txt'), robots);
console.log(`[seo] wrote dist/robots.txt and dist/sitemap.xml (${urls.size} URLs)`);
