import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import ExperienceTile from "@/components/common/ExperienceTile";
import ExperienceTileSkeleton from "@/components/common/ExperienceTileSkeleton";
import type { ExperienceListItem } from "@/features/experiences/store/types";
import { slugify } from "@/features/experiences/utils/slug";
import { experienceListKey } from "@/features/experiences/store/location";
import { useSeo } from "@/hooks/useDocumentTitle";
import { collectionIdFromParam, subCategoryPath } from "@/components/navbar/navTypes";
import { breadcrumbJsonLd } from "@/lib/seo";
import { fetchSubCategoryBySlug } from "@/features/experiences/store/api";

interface SubCategoryRef {
  id: number;
  name: string;
  description?: string | null;
  slug?: string | null;
}
interface CategoryRef {
  id: number;
  name: string;
  slug?: string;
  subCategories?: SubCategoryRef[];
}

export interface SubCategoryExperienceViewProps {
  /** GET /public/experiences/subcategory/{subCategoryId} */
  experiences?: ExperienceListItem[];
  /** Sub-category the list in the store belongs to. */
  subCategoryKey?: string | null;
  loading?: boolean;
  error?: string | null;
  /** GET /public/categories — gives the sub-category its name even when it has no experiences. */
  categories?: CategoryRef[];
  locationId?: number;
  /** False until the header's location list has settled. */
  locationReady?: boolean;
  getSubCategoryExperiences: (id: string) => void;
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

export default function SubCategoryExperienceView({
  experiences,
  subCategoryKey,
  loading,
  error,
  categories,
  locationId,
  locationReady,
  getSubCategoryExperiences,
  getCategories,
}: SubCategoryExperienceViewProps) {
  const [sort, setSort] = useState<SortKey>("recommended");
  // /collection/mehandi (slug), /collection/pre-wedding-shoot-26 (name + id) or /subcategory/26 (old links).
  const params = useParams<{ collectionSlug?: string; subCategoryId?: string }>();
  const param = params.collectionSlug ?? params.subCategoryId ?? "";
  const known = useMemo(() => (categories ?? []).flatMap((c) => c.subCategories ?? []), [categories]);
  // 1. a collection whose slug is exactly this; 2. a bare id; 3. name-id whose id we know.
  const localId = useMemo(() => {
    const p = param.toLowerCase();
    const bySlug = known.find((s) => s.slug && s.slug.toLowerCase() === p);
    if (bySlug) return String(bySlug.id);
    if (/^\d+$/.test(p)) return p;
    const trailing = collectionIdFromParam(p);
    if (trailing && known.some((s) => String(s.id) === trailing)) return trailing;
    return undefined;
  }, [param, known]);
  // 4. otherwise ask the API by slug (a slug not in the loaded menu yet), falling back to a trailing id.
  const [remote, setRemote] = useState<{ param: string; id?: string; slug?: string | null } | null>(null);
  useEffect(() => {
    if (localId || !param) return;
    let alive = true;
    fetchSubCategoryBySlug(param)
      .then((sub) => alive && setRemote({ param, id: sub ? String(sub.id) : collectionIdFromParam(param), slug: sub?.slug }))
      .catch(() => alive && setRemote({ param, id: collectionIdFromParam(param) }));
    return () => {
      alive = false;
    };
  }, [param, localId]);
  const subCategoryId = localId ?? (remote?.param === param ? remote.id : undefined);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Location-scoped: wait for the city, refetch when it changes.
  const isCurrentList = !!subCategoryId && subCategoryKey === experienceListKey(locationId, subCategoryId);
  useEffect(() => {
    if (subCategoryId && locationReady && !isCurrentList) getSubCategoryExperiences(subCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subCategoryId, locationReady, locationId]);

  useEffect(() => {
    if (getCategories && (!categories || categories.length === 0)) getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The categories endpoint gives the sub-category its name and parent even when it has no experiences.
  const parent = useMemo(() => {
    for (const cat of categories ?? []) {
      const found = (cat.subCategories ?? []).find((s) => String(s.id) === subCategoryId);
      if (found) return { category: cat, subCategory: found };
    }
    return null;
  }, [categories, subCategoryId]);

  const items = useMemo(() => {
    if (!isCurrentList) return [];
    const active = (experiences ?? []).filter((e) => e && e.isActive !== false);
    const sorted = [...active];
    if (sort === "price-asc") sorted.sort((a, b) => (Number(a.basePrice) || 0) - (Number(b.basePrice) || 0));
    else if (sort === "price-desc") sorted.sort((a, b) => (Number(b.basePrice) || 0) - (Number(a.basePrice) || 0));
    else sorted.sort((a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return sorted;
  }, [experiences, isCurrentList, sort]);


  const isLoading = (!!loading || !isCurrentList) && items.length === 0;
  const name = parent?.subCategory.name || items[0]?.subCategoryName || "Experiences";
  const categoryName = parent?.category.name || items[0]?.categoryName || "";
  const categoryHref = categoryName ? `/category/${parent?.category.slug || slugify(categoryName)}` : null;
  const description = parent?.subCategory.description?.trim();
  // "Name" while loading would be wrong, so the default title shows until the collection is known.
  const isKnown = !(isLoading && !parent);
  const canonicalName = parent?.subCategory.name ?? items[0]?.subCategoryName;
  const canonicalSlug = parent?.subCategory.slug ?? (remote?.param === param ? remote.slug : undefined);
  const seoPath = subCategoryId ? subCategoryPath({ id: subCategoryId, name: canonicalName, slug: canonicalSlug }) : undefined;

  // Old /subcategory/26 or name-id links, or a renamed collection: move to the canonical URL
  // (the slug one when a slug is set) once the collection is known.
  useEffect(() => {
    if (!subCategoryId || !canonicalName) return;
    const canonical = subCategoryPath({ id: subCategoryId, name: canonicalName, slug: canonicalSlug });
    if (decodeURIComponent(pathname) !== canonical) navigate(canonical, { replace: true });
  }, [subCategoryId, canonicalName, canonicalSlug, pathname, navigate]);
  useSeo(
    isKnown
      ? {
          title: categoryName ? `${name} · ${categoryName}` : name,
          description:
            description ||
            `${name}${categoryName ? ` for ${categoryName.toLowerCase()}` : ""}: setups styled and installed at your venue by Forever Moment.`,
          path: seoPath,
          // An id that matches no collection and has nothing in it: keep it out of the index.
          noindex: !parent && !isLoading && items.length === 0,
        }
      : { title: null },
    isKnown && seoPath
      ? {
          "ld-breadcrumb": breadcrumbJsonLd([
            { name: "Home", path: "/" },
            ...(categoryHref ? [{ name: categoryName, path: categoryHref }] : []),
            { name, path: seoPath },
          ]),
        }
      : undefined,
  );

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
            {categoryHref && (
              <li className="flex items-center gap-1">
                <Link to={categoryHref} className="capitalize transition-colors hover:text-[var(--burgundy)]">{categoryName}</Link>
                <ChevronRight size={12} className="text-[var(--gold)]" />
              </li>
            )}
            <li className="capitalize text-[var(--charcoal)]">{name}</li>
          </ol>
        </nav>

        {/* Header + sort */}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-[var(--border-light)] pb-4">
          <div className="min-w-0">
            <h1 style={{ fontFamily: SERIF }} className="text-[1.7rem] font-semibold capitalize leading-tight text-[var(--charcoal)] sm:text-[2.1rem]">
              {name}
            </h1>
            {description && (
              // One line on larger screens only; the breadcrumb already names the parent category.
              <p style={{ fontFamily: SANS }} className="mt-1 hidden max-w-xl truncate text-[0.84rem] text-[var(--mid)] sm:block" title={description}>
                {description}
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

        {/* Grid */}
        <div className="mt-5">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => <ExperienceTileSkeleton key={i} />)}
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {items.map((e, idx) => (
                <ExperienceTile
                  key={e.id}
                  experience={e}
                  priority={idx < 4}
                  compact
                  hideCollection
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-white/60 py-16 text-center">
              <p style={{ fontFamily: SERIF }} className="text-[1.4rem] font-medium text-[var(--charcoal)]">
                {error ? "We couldn't load these experiences" : "Nothing here yet"}
              </p>
              <p style={{ fontFamily: SANS }} className="mx-auto mt-1.5 max-w-sm text-[0.86rem] text-[var(--mid)]">
                {error || `We are adding ${name.toLowerCase()} setups soon. Browse the rest of the collection in the meantime.`}
              </p>
              <Link
                to={categoryHref || "/"}
                style={{ fontFamily: SANS }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--burgundy)] px-5 py-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--burgundy-dark)]"
              >
                {categoryHref ? `All ${categoryName}` : "Back to home"}
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
