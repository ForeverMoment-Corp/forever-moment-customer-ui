import { Link } from "react-router-dom";
import CategoryIcon from "@/components/navbar/CategoryIcon";
import CategoryCover from "@/features/category/pages/Categories/components/CategoryCover";
import { getSubCategoryImages } from "@/features/category/utils/categoryImage";

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

  // Every picture the sub-category carries; an experience photo fills in when it has none.
  const apiImages = getSubCategoryImages(subCategory);
  const images =
    apiImages.length > 0
      ? apiImages
      : stats.image
        ? [{ hero: stats.image, thumbnail: stats.thumbnail || stats.image, alt: subCategory.name }]
        : [];

  const meta = [
    subCategory.categoryName,
    stats.experienceCount > 0 ? `${stats.experienceCount} ${stats.experienceCount === 1 ? "setup" : "setups"}` : null,
  ].filter(Boolean);

  // Image-led: name, parent category, setup count and price all sit on the photo; the whole card is the link.
  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-16px_color-mix(in_srgb,_var(--burgundy)_35%,_transparent)]"
      style={{ fontFamily: FONT_SANS }}
    >
      <CategoryCover
        images={images}
        name={subCategory.name}
        sizeClass="aspect-[4/5] sm:aspect-[4/3]"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
      >
        <Link to={to} className="absolute inset-0" aria-label={`Explore ${subCategory.name}`}>
          <span className="sr-only">Explore {subCategory.name}</span>
        </Link>
        {images.length === 0 && (
          // No photo anywhere: show the collection's icon instead of an empty tile.
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center pb-10 text-[var(--burgundy)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/70">
              <CategoryIcon name={subCategory.name} size={24} strokeWidth={1.6} />
            </span>
          </span>
        )}
        {stats.fromPrice !== null && (
          <div className="pointer-events-none absolute right-2.5 top-2.5 rounded-full bg-white/92 px-2 py-0.5 text-[0.66rem] text-[var(--charcoal)] shadow-sm backdrop-blur">
            From <span className="font-semibold text-[var(--burgundy)]">{formatINR(stats.fromPrice)}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-2 text-[1.08rem] font-semibold capitalize leading-tight text-white drop-shadow sm:text-[1.2rem]" style={{ fontFamily: FONT_SERIF }}>
            {subCategory.name}
          </h3>
          {meta.length > 0 && <p className="mt-0.5 truncate text-[0.68rem] capitalize text-white/80">{meta.join(" · ")}</p>}
        </div>
      </CategoryCover>
    </article>
  );
}
