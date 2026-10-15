import { useState, useEffect } from "react";
import ExperienceTile from "@/components/common/ExperienceTile";
import FadeIn from "@/components/animations/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";
import ExperienceTileSkeleton from "@/components/common/ExperienceTileSkeleton";
import type { ExperienceListItem } from "@/features/experiences/store/types";
import { experienceListKey } from "@/features/experiences/store/location";
import SectionHeading, { Accent } from "@/components/home/SectionHeading";

export interface FeaturedExperienceProps {
  /** GET /public/experiences/location/{locationId}/featured */
  experiences?: ExperienceListItem[];
  /** City the list was fetched for; compared with the current one to skip stale lists. */
  featuredKey?: string | null;
  loading?: boolean;
  locationId?: number;
  /** False until the header's location list has settled. */
  locationReady?: boolean;
  getFeaturedExperiences?: () => void;
  limit?: number;
}

const SANS = "'Jost', sans-serif";

export default function FeaturedExperienceView({ experiences, featuredKey, loading, locationId, locationReady, getFeaturedExperiences, limit }: FeaturedExperienceProps) {
  const [liked, setLiked] = useState<number[]>([]);

  // Featured is per city: fetch once the city is known (home teaser and /featured-experiences
  // share the store, so whichever mounts first fetches) and again when it changes.
  const isCurrentList = featuredKey === experienceListKey(locationId, 'featured');
  useEffect(() => {
    if (getFeaturedExperiences && locationReady && !isCurrentList) getFeaturedExperiences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationReady, locationId]);

  const toggleLike = (id: number) =>
    setLiked((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const all = isCurrentList ? (experiences ?? []).filter((e) => e && e.isActive !== false) : [];
  const list = limit ? all.slice(0, limit) : all;
  // "View all" only when this is the teaser on the home page.
  const showViewAll = limit !== undefined && all.length > list.length;
  const isLoading = (!!loading || !isCurrentList) && list.length === 0;

  return (
    <section className="bg-ivory py-10 md:py-14">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 2xl:max-w-none 2xl:px-5">
        <FadeIn>
          <SectionHeading
            eyebrow="Handpicked for you"
            title={<>Most <Accent>loved</Accent> experiences</>}
            link={showViewAll || limit !== undefined ? { to: "/featured-experiences", label: "View all" } : undefined}
          />
        </FadeIn>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 2xl:grid-cols-[repeat(auto-fill,minmax(270px,1fr))]">
            {Array.from({ length: Math.min(limit ?? 8, 8) }, (_, i) => (
              <ExperienceTileSkeleton key={i} />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p style={{ fontFamily: SANS }} className="rounded-2xl border border-dashed border-[var(--border-light)] p-10 text-center text-[0.9rem] text-[var(--mid)]">
            No featured experiences yet. Check back soon.
          </p>
        ) : (
          <StaggerContainer className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 2xl:grid-cols-[repeat(auto-fill,minmax(270px,1fr))]">
            {list.map((e, idx) => (
              <StaggerItem key={e.id} className="h-full">
                <ExperienceTile experience={e} priority={idx < 4} isLiked={liked.includes(e.id)} onToggleLike={toggleLike} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </section>
  );
}
