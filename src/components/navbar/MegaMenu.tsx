import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { categoryPath, subCategoryPath, type NavCategory } from "./navTypes";
import SmartImage from "@/components/common/SmartImage";
import { getCategoryFallbackImage, getCategoryImage, getCategoryImageOrFallback } from "@/features/category/utils/categoryImage";

interface MegaMenuProps {
  category: NavCategory;
  /** Position in the category list; picks the same stock photo as the category cards when there is no artwork. */
  index: number;
  onNavigate?: () => void;
}

const sans = { fontFamily: "'Jost', sans-serif" } as const;

const MegaMenu = ({ category, index, onNavigate }: MegaMenuProps) => {
  const subs = (category.subCategories ?? [])
    .filter((s) => s.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const columns = subs.length <= 4 ? 2 : subs.length <= 9 ? 3 : 4;
  // Artwork comes from /public/categories; the static pool only fills gaps.
  const image = getCategoryImageOrFallback(category, index);
  const thumbnail = getCategoryImage(category, "thumbnail");

  return (
    <div
      role="region"
      aria-label={`${category.name} menu`}
      className="absolute left-0 right-0 top-full bg-white border-t border-sand animate-in fade-in slide-in-from-top-1 duration-200"
      style={{ boxShadow: "0 24px 48px -12px color-mix(in srgb, var(--ink) 18%, transparent)" }}
    >
      {/* Same edge padding as the category bar, so the menu starts under the first pill */}
      <div className="w-full px-4 lg:px-5 py-5">
        <div className="grid grid-cols-[210px_1fr] gap-6">
          {/* ── Intro column ── */}
          <div className="pr-5 border-r border-sand flex flex-col">
            <Link
              to={categoryPath(category)}
              onClick={onNavigate}
              className="group relative block overflow-hidden rounded-xl border border-sand mb-3"
              style={{ height: 118 }}
            >
              <SmartImage
                src={image}
                placeholderSrc={thumbnail && thumbnail !== image ? thumbnail : undefined}
                fallbackSrc={getCategoryFallbackImage(index)}
                alt={category.name}
                sizes="210px"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[0.66rem] text-ink backdrop-blur-sm"
                style={sans}
              >
                <span className="font-semibold text-gold-dark tabular-nums">{subs.length}</span>
                {subs.length === 1 ? "collection" : "collections"}
              </span>
            </Link>

            <p
              className="text-mid leading-snug line-clamp-2"
              style={{ ...sans, fontSize: "0.74rem" }}
            >
              {category.description ||
                `Curated ${category.name.toLowerCase()} experiences, decor and surprises crafted for your celebration.`}
            </p>

            <Link
              to={categoryPath(category)}
              onClick={onNavigate}
              className="group mt-3 inline-flex items-center gap-1.5 self-start bg-ink text-white rounded-full pl-3.5 pr-3 py-1.5 text-[0.62rem] uppercase tracking-[0.12em] font-semibold hover:bg-gold transition-colors"
              style={sans}
            >
              View all
              <ArrowRight
                size={12}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

          </div>

          {/* ── Sub-category grid ── */}
          <div
            className={`grid gap-1 content-start ${columns === 2 ? "max-w-[560px]" : ""}`}
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {subs.map((sub) => (
                <Link
                  key={sub.id}
                  to={subCategoryPath(sub)}
                  onClick={onNavigate}
                  title={sub.description || undefined}
                  className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-ivory transition-colors duration-200"
                >
                  <span className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-ivory text-gold group-hover:bg-gold group-hover:text-white transition-colors">
                    <CategoryIcon name={sub.name} size={14} strokeWidth={1.75} />
                  </span>
                  <span
                    className="flex-1 min-w-0 truncate capitalize text-ink font-medium group-hover:text-gold-dark transition-colors"
                    style={{ ...sans, fontSize: "0.8rem" }}
                  >
                    {sub.name}
                  </span>
                  <ChevronRight
                    size={13}
                    className="text-gold opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0"
                  />
                </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
