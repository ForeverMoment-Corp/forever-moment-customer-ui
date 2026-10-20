import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronRight, Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import ExperienceTile from '@/components/common/ExperienceTile';
import ExperienceTileSkeleton from '@/components/common/ExperienceTileSkeleton';
import CategoryIcon from '@/components/navbar/CategoryIcon';
import { categoryPath, type NavCategory } from '@/components/navbar/navTypes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getData } from '@/features/experiences/store/actions';
import { experienceListKey, selectLocationId, selectLocationReady } from '@/features/experiences/store/location';
import type { ExperienceListItem } from '@/features/experiences/store/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { searchExperiences, searchPlaces } from '@/features/search/match';
import { trackSearch } from '@/lib/analytics';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

type SortKey = 'relevance' | 'price-asc' | 'price-desc';
const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'relevance', label: 'Best match' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
];

const MAX_PLACES = 8;

const chipClass = (active: boolean) =>
  `shrink-0 rounded-full border px-3 py-1.5 text-[0.78rem] transition-colors ${
    active
      ? 'border-[var(--charcoal)] bg-[var(--charcoal)] text-white'
      : 'border-[var(--border-light)] bg-white text-[var(--charcoal)] hover:border-[var(--charcoal)]'
  }`;

/** Occasion chips, used when there is nothing (or nothing yet) to show. */
function OccasionChips({ categories }: { categories: NavCategory[] }) {
  if (categories.length === 0) return null;
  return (
    <ul className="mt-5 flex flex-wrap justify-center gap-2">
      {categories.slice(0, 8).map((cat) => (
        <li key={cat.id}>
          <Link
            to={categoryPath(cat)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-white px-3.5 py-1.5 text-[0.78rem] capitalize text-[var(--taupe)] transition-colors hover:border-[var(--gold)] hover:text-[var(--burgundy)]"
          >
            <CategoryIcon name={cat.name} size={13} strokeWidth={1.75} className="text-[var(--gold)]" />
            {cat.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * /search?q= — every match for a query, searched in the browser over the picked city's
 * experiences plus the category tree (same ranking as the navbar suggestions).
 */
export default function SearchPage() {
  const dispatch = useAppDispatch();
  const [params, setParams] = useSearchParams();
  const query = (params.get('q') ?? '').trim();

  const experiences = useAppSelector((s) => s.experiences.data) as ExperienceListItem[];
  const dataKey = useAppSelector((s) => s.experiences.dataKey);
  const listLoading = useAppSelector((s) => s.experiences.loading);
  const loadError = useAppSelector((s) => s.experiences.error);
  const locationId = useAppSelector(selectLocationId);
  const locationReady = useAppSelector(selectLocationReady);
  const apiCategories = useAppSelector((s) => s.header?.categories ?? []) as NavCategory[];

  const [draft, setDraft] = useState(query);
  const [sort, setSort] = useState<SortKey>('relevance');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [liked, setLiked] = useState<number[]>([]);

  // A new query (from the navbar or Back / Forward) refills the box and clears the filter.
  const [seenQuery, setSeenQuery] = useState(query);
  if (seenQuery !== query) {
    setSeenQuery(query);
    setDraft(query);
    setCategoryFilter(null);
  }

  // Search result pages are thin and endless: keep them out of the index (links are still followed).
  useDocumentTitle(query ? `Search: ${query}` : 'Search', { noindex: true });

  // The picked city's experiences; the action skips the call when they are already loaded.
  useEffect(() => {
    if (locationReady) dispatch(getData());
  }, [dispatch, locationReady, locationId]);

  // dataKey is set when the request starts, so "loading" also counts until the list arrives.
  const isCurrentList = dataKey === experienceListKey(locationId, 'all');
  const isLoading = (!isCurrentList || listLoading) && !loadError;

  // Fire a GA4 search event once the results are ready (not on every keystroke).
  useEffect(() => {
    if (!query || isLoading) return;
    trackSearch(query, items.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, isLoading]);

  const categories = useMemo(
    () => apiCategories.filter((c) => c && c.isActive !== false).sort((a, b) => a.displayOrder - b.displayOrder),
    [apiCategories],
  );

  const matches = useMemo(() => (isCurrentList ? searchExperiences(experiences, query) : []), [experiences, query, isCurrentList]);
  const places = useMemo(() => searchPlaces(categories, query).slice(0, MAX_PLACES), [categories, query]);

  // Narrow by category, counted from the matches themselves.
  const categoryChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of matches) if (e.categoryName) counts.set(e.categoryName, (counts.get(e.categoryName) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, [matches]);

  const items = useMemo(() => {
    const list = categoryFilter ? matches.filter((e) => e.categoryName === categoryFilter) : [...matches];
    if (sort === 'price-asc') list.sort((a, b) => (Number(a.basePrice) || 0) - (Number(b.basePrice) || 0));
    else if (sort === 'price-desc') list.sort((a, b) => (Number(b.basePrice) || 0) - (Number(a.basePrice) || 0));
    return list;
  }, [matches, categoryFilter, sort]);

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const q = draft.trim();
    setParams(q ? { q } : {});
  };

  const toggleLike = (id: number) => setLiked((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  return (
    <section className="min-h-[60vh] bg-[var(--cream)] pb-12 pt-5">
      <div className="mx-auto max-w-[var(--container-width)] px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" style={{ fontFamily: SANS }} className="text-[0.78rem] text-[var(--mid)]">
          <ol className="flex flex-wrap items-center gap-1">
            <li className="flex items-center gap-1">
              <Link to="/" className="transition-colors hover:text-[var(--burgundy)]">Home</Link>
              <ChevronRight size={12} className="text-[var(--gold)]" />
            </li>
            <li className="text-[var(--charcoal)]">Search</li>
          </ol>
        </nav>

        {/* Header: the query, a box to refine it, and sort */}
        <div className="mt-3 border-b border-[var(--border-light)] pb-4">
          <h1 style={{ fontFamily: SERIF }} className="text-[1.7rem] font-semibold leading-tight text-[var(--charcoal)] sm:text-[2.1rem]">
            {query ? (
              <>
                Results for <em className="italic text-[var(--burgundy)]">“{query}”</em>
              </>
            ) : (
              'What are you celebrating?'
            )}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3" style={{ fontFamily: SANS }}>
            <form
              role="search"
              onSubmit={submit}
              className="flex min-w-0 flex-1 basis-[280px] items-center gap-2 rounded-full border border-[var(--border-light)] bg-white py-1.5 pl-4 pr-1.5 focus-within:border-[var(--gold)]"
            >
              <SearchIcon size={16} className="shrink-0 text-[var(--gold)]" />
              <input
                type="search"
                value={draft}
                onChange={(ev) => setDraft(ev.target.value)}
                placeholder="Search birthdays, dinners, decor…"
                aria-label="Search experiences and categories"
                className="min-w-0 flex-1 bg-transparent text-[0.88rem] text-[var(--charcoal)] outline-none placeholder:text-[var(--mid)] [&::-webkit-search-cancel-button]:hidden"
              />
              {draft && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setDraft('')}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--mid)] hover:bg-[var(--linen)] hover:text-[var(--charcoal)]"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[var(--burgundy)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-white hover:bg-[var(--burgundy-dark)]"
              >
                Search
              </button>
            </form>

            {items.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap text-[0.8rem] text-[var(--mid)]">
                  {items.length} {items.length === 1 ? 'experience' : 'experiences'}
                </span>
                <label className="flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-white px-3 py-1.5">
                  <SlidersHorizontal size={13} className="text-[var(--gold)]" />
                  <span className="sr-only">Sort results</span>
                  <select
                    value={sort}
                    onChange={(ev) => setSort(ev.target.value as SortKey)}
                    className="cursor-pointer bg-transparent text-[0.8rem] text-[var(--charcoal)] outline-none"
                  >
                    {SORTS.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>
        </div>

        {!query ? (
          <div className="py-12 text-center" style={{ fontFamily: SANS }}>
            <p className="text-[0.88rem] text-[var(--mid)]">Search by occasion, setup or place, or start from an occasion:</p>
            <OccasionChips categories={categories} />
          </div>
        ) : (
          <>
            {/* Matching categories and collections: a quick jump to the whole listing */}
            {places.length > 0 && (
              <div className="mt-4" style={{ fontFamily: SANS }}>
                <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--mid)]">Categories &amp; collections</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {places.map((p) => (
                    <li key={p.key}>
                      <Link
                        to={p.to}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold-light)] bg-white px-3 py-1.5 text-[0.78rem] capitalize text-[var(--charcoal)] transition-colors hover:border-[var(--burgundy)] hover:text-[var(--burgundy)]"
                      >
                        <CategoryIcon name={p.label} size={13} strokeWidth={1.75} className="text-[var(--gold)]" />
                        {p.label}
                        {p.meta !== 'Category' && <span className="text-[var(--mid)]">· {p.meta}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {categoryChips.length > 1 && (
              <div style={{ fontFamily: SANS }} className="scrollbar-hide -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <button type="button" onClick={() => setCategoryFilter(null)} aria-pressed={categoryFilter == null} className={chipClass(categoryFilter == null)}>
                  All <span className="opacity-60">{matches.length}</span>
                </button>
                {categoryChips.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCategoryFilter(c.name)}
                    aria-pressed={categoryFilter === c.name}
                    className={chipClass(categoryFilter === c.name)}
                  >
                    <span className="capitalize">{c.name}</span> <span className="opacity-60">{c.count}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4" aria-busy="true" aria-label="Searching">
                  {Array.from({ length: 8 }, (_, i) => <ExperienceTileSkeleton key={i} />)}
                </div>
              ) : items.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
                  {items.map((e, idx) => (
                    <ExperienceTile key={e.id} experience={e} priority={idx < 4} isLiked={liked.includes(e.id)} onToggleLike={toggleLike} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-white/60 px-6 py-14 text-center" style={{ fontFamily: SANS }}>
                  <p style={{ fontFamily: SERIF }} className="text-[1.4rem] font-medium text-[var(--charcoal)]">
                    {loadError ? "We couldn't search right now" : places.length > 0 ? 'No experiences by that name' : `No matches for “${query}”`}
                  </p>
                  <p className="mx-auto mt-1.5 max-w-sm text-[0.86rem] text-[var(--mid)]">
                    {loadError
                      ? 'Please try again in a moment.'
                      : places.length > 0
                        ? 'Try one of the categories above, or a shorter word.'
                        : 'Check the spelling, try a shorter word, or start from an occasion.'}
                  </p>
                  {places.length === 0 && <OccasionChips categories={categories} />}
                  <Link
                    to="/categories"
                    className="mt-6 inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-[var(--burgundy)] hover:underline"
                  >
                    Browse all celebrations <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
