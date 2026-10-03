const API_BASE = import.meta.env.VITE_API_URL || '/api/platform';

/** One entry of GET /public/faqs, trimmed to what the storefront renders. */
export interface Faq {
    id: number;
    question: string;
    answer: string;
}

interface FaqResponseDto {
    id: number;
    question?: string | null;
    answer?: string | null;
    displayOrder?: number | null;
    isActive?: boolean | null;
}

const normalize = (items: FaqResponseDto[] | null | undefined): Faq[] =>
    (Array.isArray(items) ? items : [])
        .filter((f) => f && f.isActive !== false)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map((f) => ({ id: f.id, question: (f.question ?? '').trim(), answer: (f.answer ?? '').trim() }))
        .filter((f) => f.question && f.answer);

/* FAQs are global and change rarely, so every section on every page shares one request. */
const FAQ_TTL_MS = 5 * 60_000;
let cache: { at: number; promise: Promise<Faq[]> } | null = null;

/**
 * GET /public/faqs — active FAQs in display order.
 * Any failure resolves to an empty list: FAQ sections are optional and simply hide.
 */
export function fetchFaqs(): Promise<Faq[]> {
    if (cache && Date.now() - cache.at < FAQ_TTL_MS) return cache.promise;
    const promise = fetch(`${API_BASE}/public/faqs`)
        .then((res) => (res.ok ? res.json() : null))
        .then((body) => normalize(body?.response))
        .catch(() => {
            cache = null;
            return [] as Faq[];
        });
    cache = { at: Date.now(), promise };
    return promise;
}
