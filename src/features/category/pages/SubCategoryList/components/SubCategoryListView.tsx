import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SmartImage from "@/components/common/SmartImage";
import CategoryIcon from "@/components/navbar/CategoryIcon";
import FadeIn from "@/components/animations/FadeIn";
import { getSubCategoryImages } from "@/features/category/utils/categoryImage";

const FONT_SANS = "'Jost', sans-serif";
const FONT_SERIF = "'Cormorant Garamond', serif";

interface SubCategory {
  id: number;
  name: string;
  displayOrder?: number;
  isActive?: boolean;
  categoryName?: string | null;
}

export interface SubCategoryListViewProps {
  /** GET /public/subcategories */
  subCategories?: SubCategory[];
  getSubCategories: () => void;
  /** How many to show on the home page before "View all". */
  limit?: number;
}

const DEFAULT_LIMIT = 12;

/** Home strip of collections, linking into each sub-category listing. */
export default function SubCategoryListView({ subCategories, getSubCategories, limit = DEFAULT_LIMIT }: SubCategoryListViewProps) {
  useEffect(() => {
    if (!subCategories || subCategories.length === 0) getSubCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(
    () =>
      (subCategories ?? [])
        .filter((s) => s && s.isActive !== false)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name)),
    [subCategories],
  );

  if (active.length === 0) return null;

  const visible = active.slice(0, limit);

  return (
    <section className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6">
        <FadeIn>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p style={{ fontFamily: FONT_SANS }} className="mb-1.5 text-[0.66rem] uppercase tracking-[0.22em] text-[#9E8A6A]">
                Shop by collection
              </p>
              <h2 style={{ fontFamily: FONT_SERIF }} className="text-[1.7rem] font-semibold leading-tight text-[#1A1208] md:text-[2.1rem]">
                Find your <em className="italic text-[var(--burgundy)]">occasion</em>
              </h2>
            </div>
            <Link
              to="/subcategories"
              style={{ fontFamily: FONT_SANS }}
              className="group inline-flex shrink-0 items-center gap-1.5 text-[0.78rem] font-medium uppercase tracking-[0.1em] text-[#C9A84C] transition-colors hover:text-[#1A1208]"
            >
              View all
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </FadeIn>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {visible.map((sub) => {
            const [image] = getSubCategoryImages(sub);
            return (
              <li key={sub.id}>
                <Link
                  to={`/subcategory/${sub.id}`}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-[var(--border-light)] bg-white p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--gold)] hover:shadow-[0_12px_26px_-14px_rgba(124,45,59,0.35)]"
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--rose-light)]">
                    {image ? (
                      <SmartImage
                        src={image.hero || image.thumbnail}
                        placeholderSrc={image.thumbnail || undefined}
                        alt={sub.name}
                        sizes="48px"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-[var(--burgundy)]">
                        <CategoryIcon name={sub.name} size={18} strokeWidth={1.8} />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0" style={{ fontFamily: FONT_SANS }}>
                    <span className="block truncate text-[0.84rem] font-medium capitalize leading-tight text-[var(--charcoal)] transition-colors group-hover:text-[var(--burgundy)]">
                      {sub.name}
                    </span>
                    {sub.categoryName && (
                      <span className="block truncate text-[0.68rem] capitalize text-[var(--mid)]">{sub.categoryName}</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
