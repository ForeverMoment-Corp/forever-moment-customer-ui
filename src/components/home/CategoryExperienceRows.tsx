import { useEffect, useMemo } from 'react';
import ExperienceTile from '@/components/common/ExperienceTile';
import FadeIn from '@/components/animations/FadeIn';
import SectionHeading from '@/components/home/SectionHeading';
import { categoryPath, type NavCategory } from '@/components/navbar/navTypes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getData } from '@/features/experiences/store/actions';
import { experienceListKey, selectLocationId, selectLocationReady } from '@/features/experiences/store/location';
import type { ExperienceListItem } from '@/features/experiences/store/types';

/** Experiences shown per category; the rest are one click away on the category page. */
const MAX_PER_CATEGORY = 8;

/**
 * Home page: one section per category that has experiences in the picked city, in the admin's
 * category order, each with up to 8 experiences (featured first) and "View all" to the category page.
 * Categories with nothing in this city are skipped.
 */
export default function CategoryExperienceRows() {
  const dispatch = useAppDispatch();
  const experiences = useAppSelector((s) => s.experiences.data) as ExperienceListItem[];
  const dataKey = useAppSelector((s) => s.experiences.dataKey);
  const locationId = useAppSelector(selectLocationId);
  const locationReady = useAppSelector(selectLocationReady);
  const categories = useAppSelector((s) => s.header?.categories ?? []) as NavCategory[];

  // The city's experiences; the action skips the call when they are already loaded.
  useEffect(() => {
    if (locationReady) dispatch(getData());
  }, [dispatch, locationReady, locationId]);

  const isCurrentList = dataKey === experienceListKey(locationId, 'all');

  const rows = useMemo(() => {
    if (!isCurrentList) return [];
    const byCategory = new Map<number, ExperienceListItem[]>();
    for (const e of experiences) {
      if (!e || e.isActive === false || e.categoryId == null) continue;
      const list = byCategory.get(e.categoryId) ?? [];
      list.push(e);
      byCategory.set(e.categoryId, list);
    }
    return categories
      .filter((c) => c && c.isActive !== false && (byCategory.get(c.id)?.length ?? 0) > 0)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((c) => {
        const all = byCategory.get(c.id) ?? [];
        // Same "recommended" order as the category page: featured first, then the admin's display order.
        const sorted = [...all].sort(
          (a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
        );
        return { category: c, total: all.length, items: sorted.slice(0, MAX_PER_CATEGORY) };
      });
  }, [experiences, categories, isCurrentList]);

  if (rows.length === 0) return null;

  return (
    <>
      {rows.map(({ category, total, items }) => (
        <section key={category.id} className="bg-ivory py-8 md:py-10">
          <div className="mx-auto max-w-[1380px] px-4 sm:px-6 2xl:max-w-none 2xl:px-5">
            <FadeIn>
              <SectionHeading
                title={category.name.trim()}
                // Only when some experiences are not shown here (more than 8 in the category).
                link={total > items.length ? { to: categoryPath(category), label: `View all ${total}` } : undefined}
              />
            </FadeIn>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 2xl:grid-cols-[repeat(auto-fill,minmax(270px,1fr))]">
              {items.map((e) => (
                <ExperienceTile key={e.id} experience={e} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
