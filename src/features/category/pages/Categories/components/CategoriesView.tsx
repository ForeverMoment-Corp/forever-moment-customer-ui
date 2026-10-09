import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import Breadcrumbs from "@/features/experiences/pages/ExperienceDetail/components/Breadcrumbs";
import { getPrimaryImage, getPrimaryThumbnail } from "@/features/experiences/utils/primaryImage";
import type { ExperienceListItem } from "@/features/experiences/store/types";
import type { NavCategory } from "@/components/navbar/navTypes";
import CategoryCard from "./CategoryCard";
import type { CategoryCardStats } from "./CategoryCard";
import CategoriesSkeleton from "./CategoriesSkeleton";

const FONT_SANS = "'Jost', sans-serif";
const FONT_SERIF = "'Cormorant Garamond', serif";

export interface CategoriesViewProps {
  /** GET /public/categories (shared with the navbar via the header store). */
  categories?: NavCategory[];
  categoriesLoading?: boolean;
  categoriesError?: string | null;
  /** GET /public/experiences — used for per-category counts, prices and cover photos. */
  experiences?: ExperienceListItem[];
  experiencesLoading?: boolean;
  locationId?: number;
  /** False until the header's location list has settled. */
  locationReady?: boolean;
  getCategories: () => void;
  getData: () => void;
}

const EMPTY_STATS: CategoryCardStats = { experienceCount: 0, fromPrice: null, image: "", thumbnail: "" };

export default function CategoriesView({
  categories,
  categoriesLoading,
  categoriesError,
  experiences,
  locationId,
  locationReady,
  getCategories,
  getData,
}: CategoriesViewProps) {
  const [query, setQuery] = useState("");

  // Both are per city and skip duplicate requests (the navbar loads categories too).
  useEffect(() => {
    if (!locationReady) return;
    getCategories();
    // Experiences power the counts / prices / photos.
    getData();
  }, [locationReady, locationId, getCategories, getData]);

  const activeCategories = useMemo(
    () =>
      (categories ?? [])
        .filter((c) => c && c.isActive !== false)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [categories],
  );

  /** Per-category rollup of the experiences list, keyed by category id. */
  const statsById = useMemo(() => {
    const map = new Map<number, CategoryCardStats>();
    for (const e of experiences ?? []) {
      if (!e || e.isActive === false || e.categoryId == null) continue;
      const current = map.get(e.categoryId) ?? { ...EMPTY_STATS };
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
      map.set(e.categoryId, current);
    }
    return map;
  }, [experiences]);

  const totalExperiences = useMemo(
    () => (experiences ?? []).filter((e) => e && e.isActive !== false).length,
    [experiences],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const visibleCategories = useMemo(() => {
    if (!normalizedQuery) return activeCategories;
    return activeCategories.filter(
      (c) =>
        c.name.toLowerCase().includes(normalizedQuery) ||
        (c.description ?? "").toLowerCase().includes(normalizedQuery) ||
        (c.subCategories ?? []).some((s) => s.name.toLowerCase().includes(normalizedQuery)),
    );
  }, [activeCategories, normalizedQuery]);

  const isInitialLoading = !!categoriesLoading && activeCategories.length === 0;
  const hasLoadError = !!categoriesError && activeCategories.length === 0;

  return (
    <section className="py-10 md:py-14 min-h-[70vh]" style={{ background: "var(--cream)", fontFamily: FONT_SANS }}>
      <div className="max-w-[var(--container-width)] mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Categories" }]} />

        {/* Page header */}
        <FadeIn direction="none">
          <div className="mt-6 mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="section-eyebrow">Every Occasion</div>
              <h1 className="section-title text-[2.4rem] md:text-[3rem]">
                Browse all <em>Categories</em>
              </h1>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--mid)]">
                From intimate anniversaries to grand celebrations, every category is a curated set of
                decor, surprises and experiences. Pick an occasion to see what we can set up for you.
              </p>
              {!isInitialLoading && !hasLoadError && (
                <p className="mt-3 text-[0.72rem] tracking-[0.18em] uppercase text-[var(--gold)] font-medium">
                  {activeCategories.length} {activeCategories.length === 1 ? "category" : "categories"}
                  {totalExperiences > 0 && ` · ${totalExperiences} ${totalExperiences === 1 ? "experience" : "experiences"}`}
                </p>
              )}
              <div className="mt-4 h-[2px] w-24 bg-gradient-to-r from-[var(--burgundy)] to-transparent" />
            </div>

            {/* Search */}
            <label className="relative block w-full lg:w-80">
              <span className="sr-only">Search categories</span>
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mid)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search occasions, e.g. birthday"
                disabled={isInitialLoading || hasLoadError}
                className="w-full rounded-full border border-[var(--border-light)] bg-white py-3 pl-11 pr-10 text-[0.9rem] text-[var(--charcoal)] placeholder:text-[var(--mid)]/70 outline-none transition-colors focus:border-[var(--burgundy)] disabled:opacity-60"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--mid)] hover:text-[var(--burgundy)]"
                >
                  <X size={14} />
                </button>
              )}
            </label>
          </div>
        </FadeIn>

        {/* Content */}
        {isInitialLoading ? (
          <CategoriesSkeleton />
        ) : hasLoadError ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-[var(--border-light)]">
            <p className="text-xl font-medium text-[var(--mid)]" style={{ fontFamily: FONT_SERIF }}>
              We couldn't load categories: {categoriesError}
            </p>
            <button
              type="button"
              onClick={getCategories}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[var(--burgundy)] px-6 py-2.5 text-[0.82rem] font-medium uppercase tracking-[0.12em] text-white transition-colors hover:bg-[var(--burgundy-dark)]"
            >
              Try again
            </button>
          </div>
        ) : visibleCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleCategories.map((cat) => (
              <FadeIn key={cat.id} delay={Math.min(activeCategories.indexOf(cat), 5) * 0.05} className="h-full">
                <CategoryCard
                  category={cat}
                  index={activeCategories.indexOf(cat)}
                  stats={statsById.get(cat.id) ?? EMPTY_STATS}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-[var(--border-light)]">
            <p className="text-xl font-medium text-[var(--mid)]" style={{ fontFamily: FONT_SERIF }}>
              {normalizedQuery ? `No categories match "${query.trim()}".` : "No categories available yet."}
            </p>
            {normalizedQuery ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 inline-block text-[var(--burgundy)] font-semibold hover:underline"
              >
                Clear search
              </button>
            ) : (
              <Link to="/" className="mt-4 inline-block text-[var(--burgundy)] font-semibold hover:underline">
                Return to Home →
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
