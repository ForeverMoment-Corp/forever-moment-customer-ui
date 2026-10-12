import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
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

  const isInitialLoading = !!categoriesLoading && activeCategories.length === 0;
  const hasLoadError = !!categoriesError && activeCategories.length === 0;

  return (
    <section className="min-h-[70vh] pb-12 pt-5" style={{ background: "var(--cream)", fontFamily: FONT_SANS }}>
      <div className="max-w-[var(--container-width)] mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Categories" }]} />

        {/* No visible title or count: the breadcrumb says where you are, and the grid starts right away.
            The heading stays for screen readers and page outline. */}
        <h1 className="sr-only">All celebrations</h1>

        {/* Content */}
        {isInitialLoading ? (
          <CategoriesSkeleton />
        ) : hasLoadError ? (
          <div className="mt-5 text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-[var(--border-light)]">
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
        ) : activeCategories.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {activeCategories.map((cat, i) => (
              <FadeIn key={cat.id} delay={Math.min(i, 7) * 0.04} className="h-full">
                <CategoryCard category={cat} index={i} stats={statsById.get(cat.id) ?? EMPTY_STATS} />
              </FadeIn>
            ))}
          </div>
        ) : (
          <div className="mt-5 text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-[var(--border-light)]">
            <p className="text-xl font-medium text-[var(--mid)]" style={{ fontFamily: FONT_SERIF }}>
              No categories available yet.
            </p>
            <Link to="/" className="mt-4 inline-block text-[var(--burgundy)] font-semibold hover:underline">
              Return to Home →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
