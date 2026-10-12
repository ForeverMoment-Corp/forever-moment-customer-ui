import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { categoryPath, subCategoryPath, type NavCategory } from "./navTypes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getData } from "@/features/experiences/store/actions";
import { experiencePath } from "@/features/experiences/utils/slug";
import type { ExperienceListItem } from "@/features/experiences/store/types";

const sans = { fontFamily: "'Jost', sans-serif" } as const;
const formatINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const MAX_EXPERIENCES = 5;
const MAX_PLACES = 4;

type Result =
  | { kind: "experience"; key: string; label: string; meta: string; to: string; image?: string; price: number }
  | { kind: "place"; key: string; label: string; meta: string; to: string };

/** 0 = name starts with the query, 1 = a word starts with it, 2 = contains it, -1 = no match. */
const matchRank = (text: string | null | undefined, q: string) => {
  const t = (text ?? "").toLowerCase();
  if (!t) return -1;
  if (t.startsWith(q)) return 0;
  if (t.split(/[\s\-&,/]+/).some((w) => w.startsWith(q))) return 1;
  return t.includes(q) ? 2 : -1;
};

interface NavSearchProps {
  categories: NavCategory[];
  variant: "desktop" | "mobile";
  onFocus?: () => void;
  onNavigate?: () => void;
}

/**
 * Header search with instant suggestions: the picked city's experiences plus categories and
 * collections, all from data the app already loads (no search endpoint needed).
 */
export default function NavSearch({ categories, variant, onFocus, onNavigate }: NavSearchProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const experiences = useAppSelector((state) => state.experiences.data) as ExperienceListItem[];
  const experiencesLoading = useAppSelector((state) => state.experiences.loading);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const q = query.trim().toLowerCase();

  const results = useMemo<Result[]>(() => {
    if (!q) return [];
    const exp = experiences
      .filter((e) => e && e.isActive !== false)
      .map((e) => {
        const ranks = [matchRank(e.name, q), matchRank(e.tagName, q), matchRank(e.subCategoryName, q), matchRank(e.categoryName, q)]
          .map((r, i) => (r < 0 ? -1 : r + i * 3))
          .filter((r) => r >= 0);
        return { e, rank: ranks.length ? Math.min(...ranks) : -1 };
      })
      .filter((x) => x.rank >= 0)
      .sort((a, b) => a.rank - b.rank || a.e.name.localeCompare(b.e.name))
      .slice(0, MAX_EXPERIENCES)
      .map<Result>(({ e }) => ({
        kind: "experience",
        key: `e-${e.id}`,
        label: e.name,
        meta: [e.subCategoryName, e.categoryName].filter(Boolean).join(" · "),
        to: experiencePath({ id: e.id, slug: e.slug }),
        image: e.thumbnailUrl || e.heroUrl || undefined,
        price: Number(e.basePrice) || 0,
      }));

    const places: { r: Result; rank: number }[] = [];
    for (const cat of categories) {
      const rank = matchRank(cat.name, q);
      if (rank >= 0) places.push({ rank, r: { kind: "place", key: `c-${cat.id}`, label: cat.name, meta: "Category", to: categoryPath(cat) } });
      for (const sub of cat.subCategories ?? []) {
        if (sub.isActive === false) continue;
        const subRank = matchRank(sub.name, q);
        if (subRank >= 0) places.push({ rank: subRank + 1, r: { kind: "place", key: `s-${sub.id}`, label: sub.name, meta: cat.name, to: subCategoryPath(sub) } });
      }
    }
    const placeResults = places
      .sort((a, b) => a.rank - b.rank || a.r.label.localeCompare(b.r.label))
      .slice(0, MAX_PLACES)
      .map((p) => p.r);

    return [...exp, ...placeResults];
  }, [q, experiences, categories]);

  // Close on an outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    onNavigate?.();
    navigate(to);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[Math.min(highlight, results.length - 1)].to);
    }
  };

  const desktop = variant === "desktop";
  const firstPlace = results.findIndex((r) => r.kind === "place");
  const activeId = open && results.length ? `${listId}-${Math.min(highlight, results.length - 1)}` : undefined;

  return (
    <div ref={boxRef} className={`relative ${desktop ? "w-full max-w-[520px]" : "flex-1 max-w-[220px]"}`}>
      <div
        role="search"
        className={
          desktop
            ? "flex items-center bg-ivory border border-sand rounded-full pl-4 pr-1.5 h-[42px] gap-3 hover:border-gold transition-colors focus-within:border-gold focus-within:bg-white focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,_var(--gold)_12%,_transparent)]"
            : "flex items-center bg-ivory border border-sand rounded-full px-3 h-[36px] gap-2 focus-within:border-gold"
        }
      >
        <Search size={desktop ? 16 : 14} className="text-gold shrink-0" strokeWidth={1.75} />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search experiences and categories"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          placeholder={desktop ? "Search birthdays, dinners, decor…" : "Search…"}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlight(0);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            dispatch(getData()); // city's experiences; skipped when already loaded
            onFocus?.();
          }}
          onKeyDown={onKeyDown}
          className="flex-1 min-w-0 bg-transparent outline-none placeholder-umber text-ink [&::-webkit-search-cancel-button]:hidden"
          style={{ ...sans, fontSize: desktop ? "0.82rem" : "0.75rem" }}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className={`${desktop ? "w-7 h-7" : "w-5 h-5"} shrink-0 rounded-full flex items-center justify-center text-umber hover:text-ink hover:bg-sand/60 transition-colors`}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && (
        <div
          id={listId}
          role="listbox"
          className={`z-30 overflow-hidden rounded-2xl border border-sand bg-white py-2 ${
            desktop ? "absolute left-0 right-0 top-[calc(100%+8px)]" : "fixed inset-x-3 top-[68px]"
          }`}
          style={{ ...sans, boxShadow: "0 18px 40px -12px color-mix(in srgb, var(--ink) 22%, transparent)" }}
        >
          {!q ? (
            <div className="px-4 py-2">
              <p className="uppercase text-umber" style={{ fontSize: "0.56rem", letterSpacing: "0.18em" }}>
                Browse by occasion
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {categories.slice(0, 8).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => go(categoryPath(cat))}
                    className="inline-flex items-center gap-1.5 rounded-full border border-sand px-3 py-1.5 text-[0.74rem] capitalize text-taupe transition-colors hover:border-gold hover:bg-ivory hover:text-ink"
                  >
                    <CategoryIcon name={cat.name} size={13} strokeWidth={1.75} className="text-gold" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <p className="text-[0.82rem] text-ink">
                {experiencesLoading ? "Searching…" : <>No matches for “{query.trim()}”</>}
              </p>
              {!experiencesLoading && (
                <button
                  type="button"
                  onClick={() => go("/categories")}
                  className="mt-2 inline-flex items-center gap-1 text-[0.76rem] font-medium text-gold-dark hover:text-ink"
                >
                  Browse all celebrations <ArrowRight size={13} />
                </button>
              )}
            </div>
          ) : (
            <ul className="max-h-[min(420px,70vh)] overflow-y-auto">
              {results.map((r, i) => {
                const active = i === Math.min(highlight, results.length - 1);
                return (
                  <li key={r.key}>
                    {(i === 0 || i === firstPlace) && (
                      <p
                        className={`px-4 pb-1 uppercase text-umber ${i === 0 ? "pt-1" : "pt-3 mt-1 border-t border-sand"}`}
                        style={{ fontSize: "0.56rem", letterSpacing: "0.18em" }}
                      >
                        {r.kind === "experience" ? "Experiences" : "Categories & collections"}
                      </p>
                    )}
                    <button
                      id={`${listId}-${i}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => go(r.to)}
                      className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${active ? "bg-ivory" : ""}`}
                    >
                      {r.kind === "experience" ? (
                        r.image ? (
                          <img src={r.image} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover bg-ivory" />
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ivory text-gold">
                            <CategoryIcon name={r.meta || r.label} size={16} strokeWidth={1.75} />
                          </span>
                        )
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ivory text-gold">
                          <CategoryIcon name={r.label} size={14} strokeWidth={1.75} />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.82rem] capitalize text-ink">{r.label}</span>
                        {r.meta && <span className="block truncate text-[0.68rem] capitalize text-umber">{r.meta}</span>}
                      </span>
                      {r.kind === "experience" && r.price > 0 && (
                        <span className="shrink-0 text-[0.76rem] font-medium tabular-nums text-ink">{formatINR(r.price)}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
