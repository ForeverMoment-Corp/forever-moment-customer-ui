/* eslint-disable @typescript-eslint/no-explicit-any -- this file is the boundary that maps the untyped API payload */
import type { ExperienceVM, FaqItem, ListItem, LocationOption, MediaItem, TimeSlot } from './types';
import { slugify } from '@/features/experiences/utils/slug';
import { toPlainText } from '@/lib/html';

export const FONT_SANS = "'Jost', sans-serif";
export const FONT_SERIF = "'Cormorant Garamond', serif";

export const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h} hr${h > 1 ? 's' : ''}`;
};

export { slugify };

/**
 * Rich-text fields from the admin editor (description, short description, what to bring, terms).
 * The markup is kept for `RichText` to render; a value with no visible text, such as the
 * editor's empty `<p><br></p>`, becomes '' so callers can simply test for presence.
 */
const richText = (value: unknown) => (typeof value === 'string' && toPlainText(value) ? value.trim() : '');

const titleCase = (s: string) =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

// Reviews are not served by the API yet; these summary numbers stand in until they are.
const PLACEHOLDER_RATING = 4.8;
const PLACEHOLDER_REVIEW_COUNT = 124;

const to12h = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h)) return hhmm;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return m ? `${hr}:${String(m).padStart(2, '0')} ${suffix}` : `${hr} ${suffix}`;
};

const mapList = (items: any[] | undefined): ListItem[] =>
  (items ?? [])
    .filter((it) => it && (typeof it === 'string' || it.isActive !== false))
    .map((it, i) =>
      typeof it === 'string'
        ? { id: i, description: it, isIncluded: true }
        : { id: it.id ?? i, description: it.description ?? '', isIncluded: it.isIncluded !== false },
    )
    .filter((it) => it.description.trim().length > 0);

const mapMedia = (media: any[] | undefined, name: string): MediaItem[] => {
  const items = (media ?? [])
    .filter((m) => m && m.isActive !== false && (m.heroUrl || m.url))
    .sort((a, b) => Number(!!b.isPrimary) - Number(!!a.isPrimary) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((m, i) => ({
      id: m.mapperId ?? m.mediaId ?? i,
      heroUrl: m.heroUrl || m.url,
      thumbnailUrl: m.thumbnailUrl || m.heroUrl || m.url,
      originalUrl: m.originalUrl || m.heroUrl || m.url,
      alt: m.altText || `${name} photo ${i + 1}`,
      isPrimary: !!m.isPrimary,
      displayOrder: m.displayOrder ?? i,
    }));

  // No stock/dummy photos: an experience without media renders an empty gallery state.
  return items;
};

const isoDate = (v: unknown): string | null => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : null);

const mapSlot = (t: any): TimeSlot | null => {
  if (!t || t.isActive === false || !t.startTime || !t.endTime) return null;
  return {
    id: t.timeSlotId ?? t.mapperId,
    label: `${to12h(t.startTime)} – ${to12h(t.endTime)}`,
    startTime: t.startTime,
    endTime: t.endTime,
    maxCapacity: Number(t.maxCapacity) > 0 ? Number(t.maxCapacity) : null,
    priceOverride: Number(t.priceOverride) > 0 ? Number(t.priceOverride) : null,
    validFrom: isoDate(t.validFrom),
    validTo: isoDate(t.validTo),
  };
};

const byStart = (a: TimeSlot, b: TimeSlot) => a.startTime.localeCompare(b.startTime);

/** Each active location with its own bookable slots, as served by the API. */
const mapLocations = (locations: any[] | undefined): LocationOption[] =>
  (locations ?? [])
    .filter((l) => l && l.isActive !== false)
    .map((l) => ({
      id: l.locationId ?? l.mapperId,
      name: titleCase(l.city || l.locationName || ''),
      priceOverride: Number(l.priceOverride) > 0 ? Number(l.priceOverride) : null,
      validFrom: isoDate(l.validFrom),
      validTo: isoDate(l.validTo),
      timeslots: ((l.timeslots ?? []) as any[]).map(mapSlot).filter((s): s is TimeSlot => s !== null).sort(byStart),
    }))
    .filter((l) => l.name);

/** Every distinct slot across locations, for callers that do not care about the city. */
const unionSlots = (locations: LocationOption[]): TimeSlot[] => {
  const seen = new Map<string, TimeSlot>();
  locations.forEach((l) => l.timeslots.forEach((s) => { const key = `${s.startTime}-${s.endTime}`; if (!seen.has(key)) seen.set(key, s); }));
  return Array.from(seen.values()).sort(byStart);
};

export function normalizeExperience(raw: any): ExperienceVM {
  const name: string = raw?.name || 'Experience';
  const basePrice = Number(raw?.basePrice) || 0;
  const originalPrice = raw?.originalPrice ? Number(raw.originalPrice) : Math.round(basePrice * 1.25);
  const discount = originalPrice > basePrice ? Math.round(((originalPrice - basePrice) / originalPrice) * 100) : 0;
  const detail = raw?.detail ?? {};
  const categoryName: string = raw?.categoryName || 'Experiences';

  const locationOptions = mapLocations(raw?.locations);
  const locations = Array.from(new Set(locationOptions.map((l) => l.name)));

  // Experience-specific FAQs, if the payload ever carries them. The global list from
  // /public/faqs is merged in by the view; there is no hardcoded fallback.
  const faqs: FaqItem[] = (Array.isArray(raw?.faqs) ? raw.faqs : [])
    .map((f: any) => ({ q: f?.q ?? f?.question ?? '', a: f?.a ?? f?.answer ?? '' }))
    .filter((f: FaqItem) => f.q && f.a);

  return {
    id: raw?.id,
    slug: typeof raw?.slug === 'string' && raw.slug.trim() ? raw.slug.trim() : null,
    name,
    tag: raw?.tagName || '',
    isFeatured: !!raw?.isFeatured,
    categoryName,
    categoryId: raw?.categoryId ?? null,
    categorySlug: slugify(categoryName),
    subCategoryId: raw?.subCategoryId ?? null,
    subCategoryName: raw?.subCategoryName || categoryName,
    basePrice,
    originalPrice,
    discount,
    shortDescription: richText(detail.shortDescription),
    description: richText(detail.description),
    whatToBring: richText(detail.whatToBring),
    termsConditions: richText(detail.termsConditions),
    durationMinutes: Number(detail.durationMinutes) || 0,
    maxCapacity: Number(detail.maxCapacity) || 0,
    media: mapMedia(raw?.media, name),
    inclusions: mapList(raw?.inclusions),
    cancellationPolicies: mapList(raw?.cancellationPolicies),
    faqs,
    timeslots: unionSlots(locationOptions),
    locations,
    locationOptions,
    rating: PLACEHOLDER_RATING,
    reviewCount: PLACEHOLDER_REVIEW_COUNT,
  };
}
