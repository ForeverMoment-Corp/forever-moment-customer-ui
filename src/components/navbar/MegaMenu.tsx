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
      className="absolute left-0 right-0 top-full bg-white border-t border-sand animate-in fade-in slide-in-from-top-1 duration-200"
      style={{ boxShadow: "0 24px 48px -12px color-mix(in srgb, var(--ink) 18%, transparent)" }}
    >
      <div className="container mx-auto px-6 py-7">
        <div className="grid grid-cols-[260px_1fr] gap-10">
          {/* ── Intro column ── */}
          <div className="pr-8 border-r border-sand flex flex-col">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-4"
              style={{
                background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)",
                boxShadow: "0 8px 20px color-mix(in srgb, var(--gold) 30%, transparent)",
              }}
            >
              <CategoryIcon name={category.name} size={20} strokeWidth={1.75} />
            </div>

            <h3
              className="text-ink capitalize leading-tight"
              style={{ ...serif, fontSize: "1.7rem", fontWeight: 600 }}
            >
              {category.name}
            </h3>
            <div className="w-10 h-[2px] bg-gold mt-2 mb-3 rounded-full" />

            <p
              className="text-mid leading-relaxed"
              style={{ ...sans, fontSize: "0.8rem" }}
            >
              {category.description ||
                `Curated ${category.name.toLowerCase()} experiences, decor and surprises crafted for your celebration.`}
            </p>

            <Link
              to={categoryPath(category)}
              onClick={onNavigate}
              className="group mt-5 inline-flex items-center gap-2 self-start bg-ink text-white rounded-full pl-5 pr-4 py-2.5 text-[0.66rem] uppercase tracking-[0.14em] font-semibold hover:bg-gold transition-colors"
              style={sans}
            >
              Explore all {category.name}
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <p
              className="mt-auto pt-6 text-umber uppercase tracking-[0.22em]"
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
                  className="group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-sand hover:bg-ivory transition-all duration-200"
                >
                  <span className="w-9 h-9 rounded-[10px] shrink-0 flex items-center justify-center bg-ivory text-gold border border-sand group-hover:bg-gold group-hover:text-white group-hover:border-gold transition-colors">
                    <CategoryIcon name={sub.name} size={16} strokeWidth={1.75} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className="block text-ink font-medium truncate group-hover:text-gold-dark transition-colors"
                      style={{ ...sans, fontSize: "0.82rem" }}
                    >
                      {sub.name}
                    </span>
                    <span
                      className="block text-umber truncate mt-0.5"
                      style={{ ...sans, fontSize: "0.68rem" }}
                    >
                      {sub.description || "Explore the collection"}
                    </span>
                  </span>
                  <ChevronRight
                    size={14}
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
