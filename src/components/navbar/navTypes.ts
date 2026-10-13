import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Cake,
  Flame,
  Gem,
  Gift,
  Heart,
  PartyPopper,
  Sparkles,
  Star,
} from "lucide-react";

/* ───────────────── Shared nav types (shape of /public/categories) ───────────────── */

export interface NavSubCategory {
  id: number;
  name: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface NavCategory {
  id: number;
  name: string;
  description?: string | null;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  subCategories: NavSubCategory[];
}


/** Same rule as experiences/utils/slug.ts slugify (kept local so navTypes has no feature imports). */
const slugify = (s: string) =>
  (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** `/category/anniversary-romantic-decoration`: the API slug, or one made from the name ("&", spaces, trailing spaces dropped). */
export const categoryPath = (cat: { slug?: string | null; name: string }) => `/category/${slugify(cat.slug || cat.name)}`;

/**
 * `/collection/pre-wedding-shoot-26`: readable name, then the id (collection names repeat across
 * categories and the API has no collection slugs). Old `/subcategory/26` links redirect here.
 */
export const subCategoryPath = (sub: { id: number | string; name?: string | null }) => {
  const slug = slugify(sub.name ?? "");
  return `/collection/${slug ? `${slug}-` : ""}${sub.id}`;
};

/** The collection id at the end of `pre-wedding-shoot-26` (or a bare `26` from an old link). */
export const collectionIdFromParam = (param: string | undefined) => param?.match(/(\d+)$/)?.[1];

/* ───────────────── Icon resolution ─────────────────
   Keyword → icon, checked in order. Matching is case-insensitive and
   substring-based so API spelling variants ("Festival" / "Festivals",
   the "Anniverary" typo, "Baby and kids") still resolve correctly. */

const ICON_RULES: Array<[RegExp, LucideIcon]> = [
  [/birthday|cake/, Cake],
  [/anniver|love|romance|valentine/, Heart],
  [/wedding|engagement|bride|ring/, Gem],
  [/gift|hamper/, Gift],
  [/candle|dinner|date/, Flame],
  [/baby|kid|child|shower|naming/, Baby],
  [/festiv|diwali|holi|christmas|eid|new year/, PartyPopper],
  [/decor|balloon|flower|theme/, Sparkles],
];

export const getCategoryIcon = (name: string): LucideIcon => {
  const key = name.toLowerCase();
  const match = ICON_RULES.find(([pattern]) => pattern.test(key));
  return match ? match[1] : Star;
};
