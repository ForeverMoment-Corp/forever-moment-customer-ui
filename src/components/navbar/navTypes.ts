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

export const categoryPath = (cat: NavCategory) =>
  `/category/${cat.slug || cat.name.toLowerCase().replace(/\s+/g, "-")}`;

export const subCategoryPath = (sub: NavSubCategory) => `/subcategory/${sub.id}`;

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
