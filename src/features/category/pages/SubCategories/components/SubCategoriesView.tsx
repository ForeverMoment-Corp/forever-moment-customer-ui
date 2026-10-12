import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getPrimaryImage, getPrimaryThumbnail } from "@/features/experiences/utils/primaryImage";
import type { ExperienceListItem } from "@/features/experiences/store/types";
import { experienceListKey } from "@/features/experiences/store/location";
import SubCategoryCard from "./SubCategoryCard";
import type { SubCategoryCardStats, SubCategoryRef } from "./SubCategoryCard";

const FONT_SANS = "'Jost', sans-serif";
const FONT_SERIF = "'Cormorant Garamond', serif";

export interface SubCategoriesViewProps {
  /** GET /public/locations/{locationId}/subcategories */
  subCategories?: SubCategoryRef[];
  subCategoriesLoading?: boolean;
  subCategoriesError?: string | null;
  /** City the list was fetched for; compared with the current one to skip stale lists. */
  subCategoriesKey?: string | null;
  locationId?: number;
  /** False until the header's location list has settled. */
  locationReady?: boolean;
  /** GET /public/experiences — powers per-sub-category counts, prices and cover photos. */
  experiences?: ExperienceListItem[];
  getSubCategories: () => void;
  getData: () => void;
}

const EMPTY_STATS: SubCategoryCardStats = { experienceCount: 0, fromPrice: null, image: "", thumbnail: "" };

function CardSkeleton() {
  return (
    <div
      className="aspect-[4/5] animate-pulse rounded-2xl border border-[var(--border-light)] bg-[var(--rose-light)]/70 sm:aspect-[4/3]"
      aria-hidden="true"
    />
  );
}

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5";

export default function SubCategoriesView({
  subCategories,
  subCategoriesLoading,
  subCategoriesError,
  subCategoriesKey,
  locationId,
  locationReady,
  experiences,
  getSubCategories,
  getData,
}: SubCategoriesViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  // Collections are per city: fetch once the city is known, again when it changes.
  const isCurrentList = subCategoriesKey === experienceListKey(locationId, "subcategories");
  useEffect(() => {
    if (locationReady && !isCurrentList) getSubCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationReady, locationId]);

  // Experiences power the counts, prices and stand-in photos; per city like the collections.
  useEffect(() => {
    if (locationReady) getData();
  }, [locationReady, locationId, getData]);

  const active = useMemo(
    () =>
      (isCurrentList ? subCategories ?? [] : [])
        .filter((s) => s && s.isActive !== false)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name)),
    [subCategories, isCurrentList],
  );

  /** Per-sub-category rollup of the experiences list. */
  const statsById = useMemo(() => {
    const map = new Map<number, SubCategoryCardStats>();
    for (const e of experiences ?? []) {
      if (!e || e.isActive === false || e.subCategoryId == null) continue;
      const current = map.get(e.subCategoryId) ?? { ...EMPTY_STATS };
      current.experienceCount += 1;
      const price = Number(e.basePrice);
      if (price > 0 && (current.fromPrice === null || price < current.fromPrice)) current.fromPrice = price;
      if (!current.image) {
        const img = getPrimaryImage(e);
        if (img) {
          current.image = img;
          current.thumbnail = getPrimaryThumbnail(e);
        }
      }
      map.set(e.subCategoryId, current);
    }
    return map;
  }, [experiences]);

  /** Parent categories that actually have sub-categories, for the filter chips. */
  const parents = useMemo(() => {
    const map = new Map<number, { id: number; name: string; count: number }>();
    active.forEach((s) => {
      if (s.categoryId == null) return;
      const existing = map.get(s.categoryId);
      if (existing) existing.count += 1;
      else map.set(s.categoryId, { id: s.categoryId, name: s.categoryName || "Other", count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [active]);

  const visible = useMemo(
    () => (categoryFilter == null ? active : active.filter((s) => s.categoryId === categoryFilter)),
    [active, categoryFilter],
  );

  const isLoading = (!!subCategoriesLoading || !isCurrentList) && active.length === 0;

  const chipClass = (on: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-[0.78rem] transition-colors ${
      on
        ? "border-[var(--charcoal)] bg-[var(--charcoal)] text-white"
        : "border-[var(--border-light)] bg-white text-[var(--charcoal)] hover:border-[var(--charcoal)]"
    }`;

  return (
    <section className="min-h-[70vh] bg-[var(--cream)] pb-12 pt-5">
      <div className="mx-auto max-w-[var(--container-width)] px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontFamily: FONT_SANS }} className="text-[0.78rem] text-[var(--mid)]">
          <ol className="flex items-center gap-1">
            <li className="flex items-center gap-1">
              <Link to="/" className="transition-colors hover:text-[var(--burgundy)]">Home</Link>
              <ChevronRight size={12} className="text-[var(--gold)]" />
            </li>
            <li className="text-[var(--charcoal)]">Collections</li>
          </ol>
        </nav>

        {/* No visible title or count: the breadcrumb says where you are, and the grid starts right away.
            The heading stays for screen readers and page outline. */}
        <h1 className="sr-only">All collections</h1>

        {/* Parent category filter */}
        {parents.length > 1 && (
          <div style={{ fontFamily: FONT_SANS }} className="scrollbar-hide -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <button type="button" onClick={() => setCategoryFilter(null)} aria-pressed={categoryFilter == null} className={chipClass(categoryFilter == null)}>
              All <span className="opacity-60">{active.length}</span>
            </button>
            {parents.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setCategoryFilter(categoryFilter === p.id ? null : p.id)}
                aria-pressed={categoryFilter === p.id}
                className={chipClass(categoryFilter === p.id)}
              >
                <span className="capitalize">{p.name}</span> <span className="opacity-60">{p.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="mt-5">
          {isLoading ? (
            <div className={GRID}>
              {Array.from({ length: 10 }, (_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : visible.length > 0 ? (
            <div className={GRID}>
              {visible.map((sub) => (
                <SubCategoryCard key={sub.id} subCategory={sub} stats={statsById.get(sub.id) ?? EMPTY_STATS} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-white/60 py-16 text-center">
              <p style={{ fontFamily: FONT_SERIF }} className="text-[1.4rem] font-medium text-[var(--charcoal)]">
                {subCategoriesError ? "We couldn't load collections" : "Nothing here yet"}
              </p>
              <p style={{ fontFamily: FONT_SANS }} className="mx-auto mt-1.5 max-w-sm text-[0.86rem] text-[var(--mid)]">
                {subCategoriesError || "Collections are on their way."}
              </p>
              <Link
                to="/categories"
                style={{ fontFamily: FONT_SANS }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--burgundy)] px-5 py-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--burgundy-dark)]"
              >
                Browse categories
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
