import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CategoryIcon from "@/components/navbar/CategoryIcon";
import CategoryCover from "@/features/category/pages/Categories/components/CategoryCover";
import { getSubCategoryImages } from "@/features/category/utils/categoryImage";
import { slugify } from "@/features/experiences/utils/slug";

const FONT_SANS = "'Jost', sans-serif";
const FONT_SERIF = "'Cormorant Garamond', serif";
const formatINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Shape of an item from GET /public/subcategories. */
export interface SubCategoryRef {
  id: number;
  name: string;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  categoryId?: number | null;
  categoryName?: string | null;
  media?: unknown[];
  heroUrl?: string | null;
  thumbnailUrl?: string | null;
  icon?: string | null;
}

export interface SubCategoryCardStats {
  /** Active experiences in this sub-category (from GET /public/experiences). */
  experienceCount: number;
  /** Lowest non-zero base price among them, or null when unknown. */
  fromPrice: number | null;
  /** A real experience photo, used when the sub-category has no artwork. */
  image: string;
  thumbnail: string;
}

interface Props {
  subCategory: SubCategoryRef;
  stats: SubCategoryCardStats;
}

export default function SubCategoryCard({ subCategory, stats }: Props) {
  const to = `/subcategory/${subCategory.id}`;
  const categoryTo = subCategory.categoryName ? `/category/${slugify(subCategory.categoryName)}` : null;

  // Every picture the sub-category carries; an experience photo fills in when it has none.
  const apiImages = getSubCategoryImages(subCategory);
  const images =
    apiImages.length > 0
      ? apiImages
      : stats.image
        ? [{ hero: stats.image, thumbnail: stats.thumbnail || stats.image, alt: subCategory.name }]
        : [];

  const description = subCategory.description?.trim();

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-[22px] border border-[var(--border-light)] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(124,45,59,0.3)]"
      style={{ fontFamily: FONT_SANS }}
    >
      <CategoryCover images={images} name={subCategory.name}>
        <Link to={to} className="absolute inset-0" aria-label={`Explore ${subCategory.name}`}>
          <span className="sr-only">Explore {subCategory.name}</span>
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--burgundy)] shadow-sm backdrop-blur">
          <CategoryIcon name={subCategory.name} size={16} strokeWidth={1.8} />
        </div>
        {stats.fromPrice !== null && (
          <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-white/92 px-2.5 py-1 text-[0.68rem] text-[var(--charcoal)] shadow-sm backdrop-blur">
            From <span className="font-semibold text-[var(--burgundy)]">{formatINR(stats.fromPrice)}</span>
          </div>
        )}
        <h3
          className="pointer-events-none absolute bottom-3 left-3 right-24 text-[1.25rem] font-medium capitalize leading-tight text-white drop-shadow"
          style={{ fontFamily: FONT_SERIF }}
        >
          {subCategory.name}
        </h3>
      </CategoryCover>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.66rem] uppercase tracking-[0.16em] text-[var(--gold)]">
          {categoryTo && (
            <Link to={categoryTo} className="capitalize transition-colors hover:text-[var(--burgundy)]">
              {subCategory.categoryName}
            </Link>
          )}
          {stats.experienceCount > 0 && (
            <>
              {categoryTo && <span aria-hidden="true">·</span>}
              <span>
                {stats.experienceCount} {stats.experienceCount === 1 ? "setup" : "setups"}
              </span>
            </>
          )}
        </div>

        <p className="mt-1.5 line-clamp-2 text-[0.84rem] leading-relaxed text-[var(--mid)]">
          {description || `${subCategory.name} setups, styled and installed by our team.`}
        </p>

        <Link
          to={to}
          className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-[var(--burgundy)] transition-colors hover:text-[var(--charcoal)]"
        >
          Explore
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
