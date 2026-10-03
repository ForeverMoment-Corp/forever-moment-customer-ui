import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Search, X } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import { getPrimaryImage, getPrimaryThumbnail } from "@/features/experiences/utils/primaryImage";
import type { ExperienceListItem } from "@/features/experiences/store/types";
import SubCategoryCard from "./SubCategoryCard";
import type { SubCategoryCardStats, SubCategoryRef } from "./SubCategoryCard";

const FONT_SANS = "'Jost', sans-serif";
const FONT_SERIF = "'Cormorant Garamond', serif";

export interface SubCategoriesViewProps {
  /** GET /public/subcategories */
  subCategories?: SubCategoryRef[];
  subCategoriesLoading?: boolean;
  subCategoriesError?: string | null;
  /** GET /public/experiences — powers per-sub-category counts, prices and cover photos. */
  experiences?: ExperienceListItem[];
  getSubCategories: () => void;
  getData: () => void;
}

const EMPTY_STATS: SubCategoryCardStats = { experienceCount: 0, fromPrice: null, image: "", thumbnail: "" };

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[var(--border-light)] bg-white" aria-hidden="true">
      <div className="h-48 animate-pulse bg-[var(--rose-light)]/70" />
      <div className="space-y-2 p-4">
        <div className="h-2.5 w-24 animate-pulse rounded-full bg-[var(--rose-light)]/70" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-[var(--rose-light)]/70" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--rose-light)]/70" />
      </div>
    </div>
  );
}

export default function SubCategoriesView({
  subCategories,
  subCategoriesLoading,
  subCategoriesError,
  experiences,
  getSubCategories,
  getData,
}: SubCategoriesViewProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  useEffect(() => {
    if (!subCategories || subCategories.length === 0) getSubCategories();
    // Experiences power the counts, prices and stand-in photos.
    if (!experiences || experiences.length === 0) getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(
    () =>
      (subCategories ?? [])
        .filter((s) => s && s.isActive !== false)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name)),
    [subCategories],
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

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return active.filter((s) => {
      if (categoryFilter != null && s.categoryId !== categoryFilter) return false;
      if (!term) return true;
      return `${s.name} ${s.categoryName ?? ""} ${s.description ?? ""}`.toLowerCase().includes(term);
    });
  }, [active, query, categoryFilter]);

  const isLoading = !!subCategoriesLoading && active.length === 0;
  const totalSetups = Array.from(statsById.values()).reduce((sum, s) => sum + s.experienceCount, 0);

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

        {/* Header */}
        <FadeIn>
          <div className="mt-3">
            <p style={{ fontFamily: FONT_SANS }} className="text-[0.64rem] uppercase tracking-[0.2em] text-[#A8853F]">
              Every occasion
            </p>
            <h1 style={{ fontFamily: FONT_SERIF }} className="mt-1 text-[1.7rem] font-semibold leading-tight text-[var(--charcoal)] sm:text-[2.1rem]">
              Browse all <em className="italic text-[var(--burgundy)]">collections</em>
            </h1>
            <p style={{ fontFamily: FONT_SANS }} className="mt-1.5 max-w-xl text-[0.88rem] leading-relaxed text-[var(--mid)]">
              Each collection is a focused set of setups, from first birthdays to proposals. Pick one to see what we can
              bring to your celebration.
            </p>
          </div>
        </FadeIn>

        {/* Count + search */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-light)] pb-4">
          <p style={{ fontFamily: FONT_SANS }} className="text-[0.7rem] uppercase tracking-[0.18em] text-[var(--gold)]">
            {active.length} {active.length === 1 ? "collection" : "collections"}
            {totalSetups > 0 && ` · ${totalSetups} ${totalSetups === 1 ? "setup" : "setups"}`}
          </p>

          <div className="flex h-10 w-full max-w-sm items-center gap-2 rounded-full border border-[var(--border-light)] bg-white pl-3.5 pr-1.5 transition-colors focus-within:border-[var(--charcoal)]">
            <Search size={15} className="shrink-0 text-[var(--gold)]" />
            <input
              id="subcategory-search"
              type="search"
              value={query}
              onChange={(ev) => setQuery(ev.target.value)}
              placeholder="Search collections, e.g. baby shower"
              aria-label="Search collections"
              style={{ fontFamily: FONT_SANS }}
              className="min-w-0 flex-1 bg-transparent text-[0.86rem] text-[var(--charcoal)] outline-none placeholder:text-[var(--mid)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="mr-1 flex h-6 w-6 items-center justify-center rounded-full text-[var(--mid)] transition-colors hover:bg-[var(--cream)] hover:text-[var(--charcoal)]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((sub) => (
                <SubCategoryCard key={sub.id} subCategory={sub} stats={statsById.get(sub.id) ?? EMPTY_STATS} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-white/60 py-16 text-center">
              <p style={{ fontFamily: FONT_SERIF }} className="text-[1.4rem] font-medium text-[var(--charcoal)]">
                {subCategoriesError ? "We couldn't load collections" : query ? "No collection matches that" : "Nothing here yet"}
              </p>
              <p style={{ fontFamily: FONT_SANS }} className="mx-auto mt-1.5 max-w-sm text-[0.86rem] text-[var(--mid)]">
                {subCategoriesError || (query ? "Try a different word, or browse everything below." : "Collections are on their way.")}
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
