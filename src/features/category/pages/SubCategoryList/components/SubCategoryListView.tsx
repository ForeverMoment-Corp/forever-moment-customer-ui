import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import SmartImage from "@/components/common/SmartImage";
import CategoryIcon from "@/components/navbar/CategoryIcon";
import { subCategoryPath } from "@/components/navbar/navTypes";
import SectionHeading from "@/components/home/SectionHeading";
import { getSubCategoryImages } from "@/features/category/utils/categoryImage";
import { experienceListKey } from "@/features/experiences/store/location";
import type { ExperienceListItem } from "@/features/experiences/store/types";

const FONT_SANS = "'Jost', sans-serif";

interface SubCategory {
  id: number;
  name: string;
  displayOrder?: number;
  isActive?: boolean;
  categoryName?: string | null;
}

export interface SubCategoryListViewProps {
  /** GET /public/locations/{locationId}/subcategories */
  subCategories?: SubCategory[];
  /** City the list was fetched for; compared with the current one to skip stale lists. */
  subCategoriesKey?: string | null;
  locationId?: number;
  /** False until the header's location list has settled. */
  locationReady?: boolean;
  getSubCategories: () => void;
  /** The city's experiences (GET /public/experiences/location/{id}), for a stand-in photo. */
  experiences?: ExperienceListItem[];
  getData?: () => void;
  /** How many to show on the home page before "View all". */
  limit?: number;
}

const DEFAULT_LIMIT = 12;

interface Photo {
  src: string;
  placeholder?: string;
}

/**
 * Home strip of collections as round "story" bubbles: a photo whenever one exists (the collection's
 * own image, else a photo from one of its experiences in the city), otherwise its icon on a soft tint.
 * One swipeable row on phones, a grid on larger screens. Collections with a photo lead, so the first
 * row is never a wall of icons; within each group the admin's display order holds.
 */
export default function SubCategoryListView({
  subCategories,
  subCategoriesKey,
  locationId,
  locationReady,
  getSubCategories,
  experiences,
  getData,
  limit = DEFAULT_LIMIT,
}: SubCategoryListViewProps) {
  // Collections are per city: fetch once the city is known, again when it changes.
  const isCurrentList = subCategoriesKey === experienceListKey(locationId, "subcategories");
  useEffect(() => {
    if (locationReady && !isCurrentList) getSubCategories();
    // The action skips the call when this city's experiences are already loaded.
    if (locationReady) getData?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationReady, locationId]);

  // First photo among each collection's experiences in this city.
  const experiencePhoto = useMemo(() => {
    const map = new Map<number, Photo>();
    for (const e of experiences ?? []) {
      if (!e || e.isActive === false || e.subCategoryId == null || map.has(e.subCategoryId)) continue;
      const src = e.thumbnailUrl || e.heroUrl || e.originalUrl;
      if (src) map.set(e.subCategoryId, { src });
    }
    return map;
  }, [experiences]);

  const items = useMemo(() => {
    const list = (isCurrentList ? subCategories ?? [] : [])
      .filter((s) => s && s.isActive !== false)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name))
      .map((sub) => {
        const [own] = getSubCategoryImages(sub);
        const photo: Photo | undefined = own
          ? { src: own.thumbnail || own.hero, placeholder: undefined }
          : experiencePhoto.get(sub.id);
        return { sub, photo };
      });
    // Photos first (stable sort keeps the display order inside each group).
    return [...list].sort((a, b) => Number(!!b.photo) - Number(!!a.photo));
  }, [subCategories, isCurrentList, experiencePhoto]);

  if (items.length === 0) return null;

  const visible = items.slice(0, limit);

  return (
    // Compact strip right under the hero.
    <section className="bg-ivory py-8 md:py-10" style={{ fontFamily: FONT_SANS }}>
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 2xl:max-w-none 2xl:px-5">
        <SectionHeading size="sm" title="Popular" accent="collections" link={{ to: "/subcategories", label: "View all" }} />

        {/* One row on every screen: swipe / scroll sideways when it does not fit (snaps per bubble). */}
        <ul className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:gap-2 sm:px-0">
          {visible.map(({ sub, photo }) => (
            <li key={sub.id} className="w-[76px] shrink-0 snap-start sm:w-[100px]">
              <Link to={subCategoryPath(sub)} title={sub.categoryName ? `${sub.name} · ${sub.categoryName.trim()}` : sub.name} className="group flex flex-col items-center text-center">
                <span
                  className={`relative block h-16 w-16 overflow-hidden rounded-full p-[2px] ring-1 transition-all duration-300 sm:h-[84px] sm:w-[84px] ${
                    photo
                      ? "bg-gradient-to-br from-[var(--gold-light)] via-[var(--rose-light)] to-[var(--gold-light)] ring-transparent group-hover:from-[var(--gold)] group-hover:to-[var(--burgundy)]"
                      : "bg-[var(--rose-light)] ring-[var(--border-light)] group-hover:ring-[var(--gold)]"
                  }`}
                >
                  {photo ? (
                    <span className="block h-full w-full overflow-hidden rounded-full border-2 border-white">
                      <SmartImage
                        src={photo.src}
                        alt=""
                        sizes="(max-width: 640px) 64px, 84px"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </span>
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-white to-[var(--rose-light)] text-[var(--burgundy)] transition-colors group-hover:text-[var(--gold-dark)]">
                      <CategoryIcon name={sub.name} size={22} strokeWidth={1.6} />
                    </span>
                  )}
                </span>
                <span className="mt-1.5 w-full truncate text-[0.72rem] font-medium capitalize leading-tight text-[var(--charcoal)] transition-colors group-hover:text-[var(--burgundy)] sm:text-[0.78rem]">
                  {sub.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
