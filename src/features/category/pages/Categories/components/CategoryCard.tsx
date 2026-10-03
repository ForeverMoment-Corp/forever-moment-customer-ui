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

const MAX_CHIPS = 4;

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
  const description = category.description?.trim();
  const meta: string[] = [];
  if (subCategories.length > 0) {
    meta.push(`${subCategories.length} ${subCategories.length === 1 ? "sub-category" : "sub-categories"}`);
  }
  if (stats.experienceCount > 0) {
    meta.push(`${stats.experienceCount} ${stats.experienceCount === 1 ? "experience" : "experiences"}`);
  }

  return (
    <article
      className="group relative flex flex-col rounded-[26px] border border-[var(--border-light)] bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(124,45,59,0.12)]"
      style={{ fontFamily: FONT_SANS }}
    >
      {/* Cover: slider over the whole category gallery */}
      <CategoryCover images={images} name={category.name}>
        <Link to={to} className="absolute inset-0" aria-label={`Explore ${category.name}`}>
          <span className="sr-only">Explore {category.name}</span>
        </Link>
        <div className="pointer-events-none absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-[var(--burgundy)] shadow-sm">
          <CategoryIcon name={category.name} size={18} strokeWidth={1.8} />
        </div>
        {stats.fromPrice !== null && (
          <div className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-white/92 backdrop-blur px-3 py-1 text-[0.72rem] text-[var(--charcoal)] shadow-sm">
            From <span className="font-semibold text-[var(--burgundy)]">{formatINR(stats.fromPrice)}</span>
          </div>
        )}
        <h3
          className="pointer-events-none absolute bottom-4 left-4 right-28 text-white text-[1.55rem] leading-tight font-medium drop-shadow"
          style={{ fontFamily: FONT_SERIF }}
        >
          {category.name}
        </h3>
      </CategoryCover>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        {meta.length > 0 && (
          <p className="text-[0.7rem] tracking-[0.18em] uppercase text-[var(--gold)] font-medium">
            {meta.join(" · ")}
          </p>
        )}
        <p className="mt-2 text-[0.88rem] leading-relaxed text-[var(--mid)] line-clamp-2">
          {description || `Curated ${category.name.toLowerCase()} experiences, decor and surprises, set up for you.`}
        </p>

        {visibleChips.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${category.name} sub-categories`}>
            {visibleChips.map((sub) => (
              <li key={sub.id}>
                <Link
                  to={subCategoryPath(sub)}
                  className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--cream)] px-3 py-1 text-[0.76rem] text-[var(--charcoal)] transition-colors hover:border-[var(--burgundy)] hover:text-[var(--burgundy)]"
                >
                  {sub.name}
                </Link>
              </li>
            ))}
            {hiddenChips > 0 && (
              <li>
                <Link
                  to={to}
                  className="inline-flex items-center rounded-full px-3 py-1 text-[0.76rem] text-[var(--mid)] hover:text-[var(--burgundy)]"
                >
                  +{hiddenChips} more
                </Link>
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto pt-5">
          <Link
            to={to}
            className="inline-flex items-center gap-2 text-[0.8rem] font-medium uppercase tracking-[0.12em] text-[var(--burgundy)] transition-colors hover:text-[var(--burgundy-dark)]"
          >
            Explore {category.name}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
