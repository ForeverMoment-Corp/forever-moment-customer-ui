import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { categoryPath, subCategoryPath, type NavCategory } from "./navTypes";

interface MegaMenuProps {
  category: NavCategory;
  onNavigate?: () => void;
}

const serif = { fontFamily: "'Cormorant Garamond', serif" } as const;
const sans = { fontFamily: "'Jost', sans-serif" } as const;

const MegaMenu = ({ category, onNavigate }: MegaMenuProps) => {
  const subs = (category.subCategories ?? [])
    .filter((s) => s.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const columns = subs.length <= 4 ? 2 : subs.length <= 9 ? 3 : 4;

  return (
    <div
      role="region"
      aria-label={`${category.name} menu`}
      className="absolute left-0 right-0 top-full bg-white border-t border-[#EDE0C4] animate-in fade-in slide-in-from-top-1 duration-200"
      style={{ boxShadow: "0 24px 48px -12px rgba(26,18,8,0.18)" }}
    >
      <div className="container mx-auto px-6 py-7">
        <div className="grid grid-cols-[260px_1fr] gap-10">
          {/* ── Intro column ── */}
          <div className="pr-8 border-r border-[#EDE0C4] flex flex-col">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-4"
              style={{
                background: "linear-gradient(135deg, #C9A84C 0%, #9A7A2E 100%)",
                boxShadow: "0 8px 20px rgba(201,168,76,0.3)",
              }}
            >
              <CategoryIcon name={category.name} size={20} strokeWidth={1.75} />
            </div>

            <h3
              className="text-[#1A1208] capitalize leading-tight"
              style={{ ...serif, fontSize: "1.7rem", fontWeight: 600 }}
            >
              {category.name}
            </h3>
            <div className="w-10 h-[2px] bg-[#C9A84C] mt-2 mb-3 rounded-full" />

            <p
              className="text-[#7A6A5A] leading-relaxed"
              style={{ ...sans, fontSize: "0.8rem" }}
            >
              {category.description ||
                `Curated ${category.name.toLowerCase()} experiences, decor and surprises crafted for your celebration.`}
            </p>

            <Link
              to={categoryPath(category)}
              onClick={onNavigate}
              className="group mt-5 inline-flex items-center gap-2 self-start bg-[#1A1208] text-white rounded-full pl-5 pr-4 py-2.5 text-[0.66rem] uppercase tracking-[0.14em] font-semibold hover:bg-[#C9A84C] transition-colors"
              style={sans}
            >
              Explore all {category.name}
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <p
              className="mt-auto pt-6 text-[#9E8A6A] uppercase tracking-[0.22em]"
              style={{ ...sans, fontSize: "0.58rem" }}
            >
              {subs.length} {subs.length === 1 ? "collection" : "collections"}
            </p>
          </div>

          {/* ── Sub-category grid ── */}
          <div
            className={`grid gap-1.5 content-start ${columns === 2 ? "max-w-[720px]" : ""}`}
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {subs.map((sub) => (
                <Link
                  key={sub.id}
                  to={subCategoryPath(sub)}
                  onClick={onNavigate}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-[#EDE0C4] hover:bg-[#FDFAF4] transition-all duration-200"
                >
                  <span className="w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center bg-[#FDFAF4] text-[#C9A84C] border border-[#EDE0C4] group-hover:bg-[#C9A84C] group-hover:text-white group-hover:border-[#C9A84C] transition-colors">
                    <CategoryIcon name={sub.name} size={16} strokeWidth={1.75} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className="block text-[#1A1208] font-medium truncate group-hover:text-[#9A7A2E] transition-colors"
                      style={{ ...sans, fontSize: "0.82rem" }}
                    >
                      {sub.name}
                    </span>
                    <span
                      className="block text-[#9E8A6A] truncate mt-0.5"
                      style={{ ...sans, fontSize: "0.68rem" }}
                    >
                      {sub.description || "Explore the collection"}
                    </span>
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-[#C9A84C] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0"
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
