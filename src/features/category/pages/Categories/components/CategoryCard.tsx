import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import CategoryIcon from "@/components/navbar/CategoryIcon";
import { categoryPath, subCategoryPath } from "@/components/navbar/navTypes";
import type { NavCategory } from "@/components/navbar/navTypes";
import { getCategoryImages, getCategoryImageOrFallback } from "@/features/category/utils/categoryImage";
import type { CategoryImage } from "@/features/category/utils/categoryImage";
import CategoryCover from "./CategoryCover";

const FONT_SANS = "'Jost', sans-serif";
const FONT_SERIF = "'Cormorant Garamond', serif";
const formatINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const MAX_CHIPS = 3;

export interface CategoryCardStats {
  /** Active experiences in this category (from GET /public/experiences). */
  experienceCount: number;
  /** Lowest non-zero base price among them, or null when unknown. */
  fromPrice: number | null;
  /** A real experience photo from the category, when one exists. */
  image: string;
  thumbnail: string;
}

interface CategoryCardProps {
  category: NavCategory;
  /** Position in the sorted list; drives the fallback artwork. */
  index: number;
  stats: CategoryCardStats;
}

export default function CategoryCard({ category, index, stats }: CategoryCardProps) {
  const to = categoryPath(category);
  const subCategories = (category.subCategories ?? [])
    .filter((s) => s.isActive !== false)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const visibleChips = subCategories.slice(0, MAX_CHIPS);
  const hiddenChips = subCategories.length - visibleChips.length;

  // Every picture the category carries, shown as a slider in the card. An experience
  // photo, then the static pool, fill in when the category has no artwork of its own.
  const apiImages = getCategoryImages(category);
  const images: CategoryImage[] =
    apiImages.length > 0
      ? apiImages
      : [
          {
            hero: stats.image || getCategoryImageOrFallback(category, index),
            thumbnail: stats.thumbnail || stats.image || getCategoryImageOrFallback(category, index, 'thumbnail'),
            alt: category.name,
          },
        ];
  const meta: string[] = [];
  if (subCategories.length > 0) {
    meta.push(`${subCategories.length} ${subCategories.length === 1 ? "collection" : "collections"}`);
  }
  if (stats.experienceCount > 0) {
    meta.push(`${stats.experienceCount} ${stats.experienceCount === 1 ? "setup" : "setups"}`);
  }

  // Everything a guest needs to choose sits on the photo; below it, one row of collection shortcuts.
  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-16px_color-mix(in_srgb,_var(--burgundy)_35%,_transparent)]"
      style={{ fontFamily: FONT_SANS }}
    >
      <CategoryCover
        images={images}
        name={category.name}
        sizeClass="aspect-[4/3]"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      >
        <Link to={to} className="absolute inset-0" aria-label={`Explore ${category.name}`}>
          <span className="sr-only">Explore {category.name}</span>
        </Link>
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--burgundy)] shadow-sm backdrop-blur">
          <CategoryIcon name={category.name} size={15} strokeWidth={1.8} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-[1.2rem] font-semibold capitalize leading-tight text-white drop-shadow sm:text-[1.35rem]" style={{ fontFamily: FONT_SERIF }}>
            {category.name}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.7rem] text-white/85">
            {meta.length > 0 && <span>{meta.join(" · ")}</span>}
            {stats.fromPrice !== null && (
              <span>
                From <span className="font-semibold text-white">{formatINR(stats.fromPrice)}</span>
              </span>
            )}
          </p>
        </div>
      </CategoryCover>

      {visibleChips.length > 0 && (
        // One row only: extra chips are clipped rather than wrapping the card taller.
        <ul className="flex h-11 items-center gap-1.5 overflow-hidden px-2.5" aria-label={`${category.name} collections`}>
          {visibleChips.map((sub) => (
            <li key={sub.id} className="shrink-0">
              <Link
                to={subCategoryPath(sub)}
                className="inline-flex max-w-[9.5rem] items-center truncate rounded-full bg-[var(--cream)] px-2.5 py-1 text-[0.72rem] capitalize text-[var(--charcoal)] transition-colors hover:bg-[var(--rose-light)] hover:text-[var(--burgundy)]"
              >
                <span className="truncate">{sub.name}</span>
              </Link>
            </li>
          ))}
          {hiddenChips > 0 && (
            <li className="shrink-0">
              <Link to={to} className="inline-flex items-center gap-0.5 px-1.5 py-1 text-[0.72rem] font-medium text-[var(--burgundy)] hover:underline">
                +{hiddenChips}
                <ArrowRight size={11} />
              </Link>
            </li>
          )}
        </ul>
      )}
    </article>
  );
}
