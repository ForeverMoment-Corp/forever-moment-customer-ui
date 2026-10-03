import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ExperienceTile from '@/components/common/ExperienceTile';
import ExperienceTileSkeleton from '@/components/common/ExperienceTileSkeleton';
import type { ExperienceListItem } from '@/features/experiences/store/types';
import { FONT_SANS, FONT_SERIF } from '../normalize';

/** Shape of an item from the public list endpoints. */
export type ExperienceSummary = ExperienceListItem;

interface Props {
  /** GET /public/experiences/subcategory/{id} — the closest matches. */
  items: ExperienceSummary[];
  /** GET /public/experiences — the pool used to widen to the rest of the category. */
  fallbackItems?: ExperienceSummary[];
  currentId: number;
  categoryId?: number | null;
  categoryName: string;
  categorySlug: string;
  subCategoryId: number | null;
  subCategoryName: string;
  loading?: boolean;
}

const MAX_ITEMS = 4;

const usable = (list: ExperienceSummary[] | undefined, currentId: number) =>
  (list ?? []).filter((e) => e && String(e.id) !== String(currentId) && e.isActive !== false);

/**
 * Experiences close to the one being viewed, most similar first:
 * same sub-category, then the rest of the same category, then anything else.
 */
export default function RelatedExperiences({
  items,
  fallbackItems,
  currentId,
  categoryId,
  categoryName,
  categorySlug,
  subCategoryId,
  subCategoryName,
  loading = false,
}: Props) {
  const sameSubCategory = usable(items, currentId);
  const seen = new Set(sameSubCategory.map((e) => String(e.id)));

  const rest = usable(fallbackItems, currentId).filter((e) => !seen.has(String(e.id)));
  const sameCategory = rest.filter((e) => categoryId != null && e.categoryId === categoryId);
  const others = rest.filter((e) => categoryId == null || e.categoryId !== categoryId);

  const ranked = [
    ...sameSubCategory.map((e) => ({ experience: e, tier: 'collection' as const })),
    ...sameCategory.map((e) => ({ experience: e, tier: 'category' as const })),
    ...others.map((e) => ({ experience: e, tier: 'other' as const })),
  ];
  const list = ranked.slice(0, MAX_ITEMS);

  // A reason only helps when the row actually mixes tiers; otherwise the heading already says it.
  const mixedTiers = new Set(list.map((r) => r.tier)).size > 1;
  const tierNote = (tier: 'collection' | 'category' | 'other') =>
    tier === 'collection' ? 'Same collection' : tier === 'category' ? `More ${categoryName}` : 'Popular pick';

  if (loading && list.length === 0) {
    return (
      <section className="mt-10 border-t border-[var(--border-light)] pt-8">
        <div className="mb-5 h-8 w-64 animate-pulse rounded bg-[var(--rose-light)]/70" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {Array.from({ length: MAX_ITEMS }, (_, i) => (
            <ExperienceTileSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (list.length === 0) return null;

  // The heading names the narrowest group that actually filled the row.
  const inCategory = sameSubCategory.length === 0 && sameCategory.length > 0;
  const heading = sameSubCategory.length > 0 ? subCategoryName : inCategory ? categoryName : 'celebration';
  const seeAllTo = sameSubCategory.length > 0 && subCategoryId ? `/subcategory/${subCategoryId}` : `/category/${categorySlug}`;

  return (
    <section id="related" className="mt-10 border-t border-[var(--border-light)] pt-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p style={{ fontFamily: FONT_SANS }} className="text-[0.64rem] font-medium uppercase tracking-[0.2em] text-[#A8853F]">
            You may also like
          </p>
          <h2
            style={{ fontFamily: FONT_SERIF }}
            className="mt-1 text-[1.45rem] font-semibold leading-tight text-[var(--charcoal)] sm:text-[1.7rem]"
          >
            More <em className="font-normal italic capitalize text-[var(--burgundy)]">{heading}</em> ideas
          </h2>
        </div>
        <Link
          to={seeAllTo}
          style={{ fontFamily: FONT_SANS }}
          className="group inline-flex shrink-0 items-center gap-1.5 text-[0.78rem] font-medium uppercase tracking-[0.1em] text-[var(--gold)] transition-colors hover:text-[var(--charcoal)]"
        >
          See all
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Phones get a snap-scroll row so a secondary section does not add four screens of
          scrolling at the end of an already long page; desktop keeps the grid. */}
      <ul className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 md:gap-4 xl:grid-cols-4">
        {list.map(({ experience, tier }) => (
          <li key={experience.id} className="w-[62vw] max-w-[260px] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <ExperienceTile experience={experience} note={mixedTiers ? tierNote(tier) : undefined} />
          </li>
        ))}
      </ul>
    </section>
  );
}
