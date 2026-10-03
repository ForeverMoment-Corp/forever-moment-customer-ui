import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import ExperienceTile from "@/components/common/ExperienceTile";
import ExperienceTileSkeleton from "@/components/common/ExperienceTileSkeleton";
import { matchesCategorySlug } from "@/features/experiences/utils/slug";
import type { ExperienceListItem } from "@/features/experiences/store/types";

interface SubCategoryRef {
  id: number;
  name: string;
  isActive?: boolean;
  displayOrder?: number;
}
interface CategoryRef {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
  subCategories?: SubCategoryRef[];
}

export interface CategoryExperienceViewProps {
  /** GET /public/experiences — filtered client-side by the category in the URL. */
  experiences?: ExperienceListItem[];
  loading?: boolean;
  error?: string | null;
  /** GET /public/categories — resolves the slug to a display name / id. */
  categories?: CategoryRef[];
  getData: () => void;
  getCategories?: () => void;
}

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

type SortKey = "recommended" | "price-asc" | "price-desc";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "recommended", label: "Recommended" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

const titleFromSlug = (slug: string) =>
  slug.split("-").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function CategoryExperienceView({
  experiences,
  loading,
  error,
  categories,
  getData,
  getCategories,
}: CategoryExperienceViewProps) {
  const [liked, setLiked] = useState<number[]>([]);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [subFilter, setSubFilter] = useState<number | null>(null);
  const { categorySlug } = useParams<{ categorySlug: string }>();

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(() => {
    if (getCategories && (!categories || categories.length === 0)) getCategories();
    // Categories are shared with the navbar; fetch only when nobody has yet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset the collection filter when the URL moves to another category.
  useEffect(() => {
    setSubFilter(null);
  }, [categorySlug]);

  const category = useMemo(
    () =>
      (categories ?? []).find(
        (c) => matchesCategorySlug(c.slug, categorySlug) || matchesCategorySlug(c.name, categorySlug),
      ) ?? null,
    [categories, categorySlug],
  );

  // Everything in this category, before the collection chips narrow it further.
  const inCategory = useMemo(() => {
    const all = (experiences ?? []).filter((e) => e && e.isActive !== false);
    if (!categorySlug) return all;
    return all.filter((e) =>
      category ? e.categoryId === category.id || matchesCategorySlug(e.categoryName, categorySlug) : matchesCategorySlug(e.categoryName, categorySlug),
    );
  }, [experiences, categorySlug, category]);

  // Only offer chips for collections that actually have something to show.
  const chips = useMemo(() => {
    const counts = new Map<number, { id: number; name: string; count: number; order: number }>();
    inCategory.forEach((e) => {
      if (e.subCategoryId == null) return;
      const existing = counts.get(e.subCategoryId);
      if (existing) existing.count += 1;
      else {
        const ref = (category?.subCategories ?? []).find((s) => s.id === e.subCategoryId);
        counts.set(e.subCategoryId, {
          id: e.subCategoryId,
          name: ref?.name || e.subCategoryName || "Other",
          count: 1,
          order: ref?.displayOrder ?? 999,
        });
      }
    });
    return Array.from(counts.values()).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  }, [inCategory, category]);

  const items = useMemo(() => {
    const filtered = subFilter == null ? inCategory : inCategory.filter((e) => e.subCategoryId === subFilter);
    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => (Number(a.basePrice) || 0) - (Number(b.basePrice) || 0));
    else if (sort === "price-desc") sorted.sort((a, b) => (Number(b.basePrice) || 0) - (Number(a.basePrice) || 0));
    else sorted.sort((a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return sorted;
  }, [inCategory, subFilter, sort]);

  const toggleLike = (id: number) =>
    setLiked((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const isLoading = !!loading && inCategory.length === 0;
  const title = category?.name || (categorySlug ? titleFromSlug(categorySlug) : "Our experiences");

  const chipClass = (active: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-[0.78rem] transition-colors ${
      active
        ? "border-[var(--charcoal)] bg-[var(--charcoal)] text-white"
        : "border-[var(--border-light)] bg-white text-[var(--charcoal)] hover:border-[var(--charcoal)]"
    }`;

  return (
    <section className="min-h-[60vh] bg-[var(--cream)] pb-12 pt-5">
      <div className="mx-auto max-w-[var(--container-width)] px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontFamily: SANS }} className="text-[0.78rem] text-[var(--mid)]">
          <ol className="flex flex-wrap items-center gap-1">
            <li className="flex items-center gap-1">
              <Link to="/" className="transition-colors hover:text-[var(--burgundy)]">Home</Link>
              <ChevronRight size={12} className="text-[var(--gold)]" />
            </li>
            <li className="capitalize text-[var(--charcoal)]">{title}</li>
          </ol>
        </nav>

        {/* Header + sort */}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-[var(--border-light)] pb-4">
          <div className="min-w-0">
            <p style={{ fontFamily: SANS }} className="text-[0.64rem] uppercase tracking-[0.2em] text-[#A8853F]">
              Handpicked collection
            </p>
            <h1 style={{ fontFamily: SERIF }} className="mt-1 text-[1.7rem] font-semibold capitalize leading-tight text-[var(--charcoal)] sm:text-[2.1rem]">
              {title}
            </h1>
            {category?.description && (
              <p style={{ fontFamily: SANS }} className="mt-1.5 max-w-xl text-[0.86rem] leading-relaxed text-[var(--mid)]">
                {category.description}
              </p>
            )}
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: SANS }} className="whitespace-nowrap text-[0.8rem] text-[var(--mid)]">
                {items.length} {items.length === 1 ? "setup" : "setups"}
              </span>
              <label className="flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-white px-3 py-1.5">
                <SlidersHorizontal size={13} className="text-[var(--gold)]" />
                <span className="sr-only">Sort experiences</span>
                <select
                  value={sort}
                  onChange={(ev) => setSort(ev.target.value as SortKey)}
                  style={{ fontFamily: SANS }}
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

        {/* Collection filter */}
        {chips.length > 1 && (
          <div style={{ fontFamily: SANS }} className="scrollbar-hide -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <button type="button" onClick={() => setSubFilter(null)} aria-pressed={subFilter == null} className={chipClass(subFilter == null)}>
              All <span className="opacity-60">{inCategory.length}</span>
            </button>
            {chips.map((c) => (
              <button key={c.id} type="button" onClick={() => setSubFilter(c.id)} aria-pressed={subFilter === c.id} className={chipClass(subFilter === c.id)}>
                <span className="capitalize">{c.name}</span> <span className="opacity-60">{c.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="mt-5">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => <ExperienceTileSkeleton key={i} />)}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {items.map((e, idx) => (
                <ExperienceTile key={e.id} experience={e} priority={idx < 4} isLiked={liked.includes(e.id)} onToggleLike={toggleLike} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-white/60 py-16 text-center">
              <p style={{ fontFamily: SERIF }} className="text-[1.4rem] font-medium text-[var(--charcoal)]">
                {error ? "We couldn't load these experiences" : "Nothing here yet"}
              </p>
              <p style={{ fontFamily: SANS }} className="mx-auto mt-1.5 max-w-sm text-[0.86rem] text-[var(--mid)]">
                {error || `We are adding ${title.toLowerCase()} setups soon. Browse the rest of the collection in the meantime.`}
              </p>
              <Link
                to="/featured-experiences"
                style={{ fontFamily: SANS }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--burgundy)] px-5 py-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--burgundy-dark)]"
              >
                Browse all experiences
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
