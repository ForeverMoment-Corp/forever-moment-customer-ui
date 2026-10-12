import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { categoryPath, type NavCategory } from "./navTypes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getData } from "@/features/experiences/store/actions";
import { experiencePath } from "@/features/experiences/utils/slug";
import type { ExperienceListItem } from "@/features/experiences/store/types";
import { normaliseQuery, searchExperiences, searchPath, searchPlaces } from "@/features/search/match";

const sans = { fontFamily: "'Jost', sans-serif" } as const;
const formatINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const MAX_EXPERIENCES = 5;
const MAX_PLACES = 4;

/** Rotating hint in the empty box: a new idea every HINT_MS. */
const HINT_MS = 2000;
/** Short, natural search ideas (3–4 words), the kind of thing a guest would actually type. */
const HINTS = [
  "Birthday decor at home",
  "Romantic candlelight dinner",
  "Anniversary surprise for her",
  "Baby shower decoration",
  "Rooftop proposal setup",
  "Balloon decor for kids",
  "Welcome home baby decor",
  "Surprise party for him",
];

type Result =
  | { kind: "experience"; key: string; label: string; meta: string; to: string; image?: string; price: number }
  | { kind: "place"; key: string; label: string; meta: string; to: string };

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
  const [focused, setFocused] = useState(false);
  // The phrase showing and the one leaving, so both can animate at once (ticker-style change).
  const [hintStep, setHintStep] = useState<{ current: number; previous: number | null }>({ current: 0, previous: null });
  // -1 = nothing picked: Enter opens the full results page.
  const [highlight, setHighlight] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const q = normaliseQuery(query);

  const results = useMemo<Result[]>(() => {
    if (!q) return [];
    const exp = searchExperiences(experiences, q)
      .slice(0, MAX_EXPERIENCES)
      .map<Result>((e) => ({
        kind: "experience",
        key: `e-${e.id}`,
        label: e.name,
        meta: [e.subCategoryName, e.categoryName].filter(Boolean).join(" · "),
        to: experiencePath({ id: e.id, slug: e.slug }),
        image: e.thumbnailUrl || e.heroUrl || undefined,
        price: Number(e.basePrice) || 0,
      }));
    const places = searchPlaces(categories, q)
      .slice(0, MAX_PLACES)
      .map<Result>((p) => ({ kind: "place", ...p }));
    return [...exp, ...places];
  }, [q, experiences, categories]);

  // Rotate while the box is empty and not being typed in.
  useEffect(() => {
    if (query || focused) return;
    const timer = window.setInterval(
      () => setHintStep((h) => ({ current: (h.current + 1) % HINTS.length, previous: h.current })),
      HINT_MS,
    );
    return () => window.clearInterval(timer);
  }, [query, focused]);


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
    if (e.key === "Enter") {
      e.preventDefault();
      // A picked suggestion opens directly; otherwise show every match on the results page.
      if (highlight >= 0 && highlight < results.length) go(results[highlight].to);
      else if (q) go(searchPath(query));
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? results.length - 1 : h - 1));
    }
  };

  const desktop = variant === "desktop";
  const firstPlace = results.findIndex((r) => r.kind === "place");
  const activeId = open && highlight >= 0 && highlight < results.length ? `${listId}-${highlight}` : undefined;

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
        <div className="relative flex min-w-0 flex-1 items-center">
        {/* Animated hint over the empty box; screen readers get the input's own label instead. */}
        {!query && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden whitespace-nowrap text-umber"
            style={{ ...sans, fontSize: desktop ? "0.82rem" : "0.75rem" }}
          >
            {/* Old phrase glides up and out while the new one rises in; keys restart both animations. */}
            {hintStep.previous !== null && (
              <span key={`out-${hintStep.previous}-${hintStep.current}`} className="search-hint-out absolute inset-0 flex items-center">
                <span className="min-w-0 truncate">{HINTS[hintStep.previous]}</span>
              </span>
            )}
            <span key={`in-${hintStep.current}`} className="search-hint-in absolute inset-0 flex items-center">
              <span className="min-w-0 truncate">{HINTS[hintStep.current]}</span>
            </span>
          </span>
        )}
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search experiences and categories"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlight(-1);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
            dispatch(getData()); // city's experiences; skipped when already loaded
            onFocus?.();
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          className="relative w-full min-w-0 bg-transparent outline-none text-ink [&::-webkit-search-cancel-button]:hidden"
          style={{ ...sans, fontSize: desktop ? "0.82rem" : "0.75rem" }}
        />
        </div>
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
                const active = i === highlight;
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
              <li className="mt-1 border-t border-sand pt-1">
                <button
                  type="button"
                  onClick={() => go(searchPath(query))}
                  className="group flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-[0.78rem] font-medium text-gold-dark transition-colors hover:bg-ivory hover:text-ink"
                >
                  <span className="truncate">See all results for “{query.trim()}”</span>
                  <ArrowRight size={14} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
