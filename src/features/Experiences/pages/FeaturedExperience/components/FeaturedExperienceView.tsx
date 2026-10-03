import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ExperienceTile from "@/components/common/ExperienceTile";
import FadeIn from "@/components/animations/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";
import ExperienceTileSkeleton from "@/components/common/ExperienceTileSkeleton";
import type { ExperienceListItem } from "@/features/experiences/store/types";

export interface FeaturedExperienceProps {
  /** GET /public/experiences/featured */
  experiences?: ExperienceListItem[];
  loading?: boolean;
  getFeaturedExperiences?: () => void;
  limit?: number;
}

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

export default function FeaturedExperienceView({ experiences, loading, getFeaturedExperiences, limit }: FeaturedExperienceProps) {
  const [liked, setLiked] = useState<number[]>([]);

  useEffect(() => {
    // Home already fetches featured experiences; only fetch when the store is empty
    // (e.g. landing directly on /featured-experiences).
    if (getFeaturedExperiences && (!experiences || experiences.length === 0)) {
      getFeaturedExperiences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLike = (id: number) =>
    setLiked((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const all = (experiences ?? []).filter((e) => e && e.isActive !== false);
  const list = limit ? all.slice(0, limit) : all;
  // "View all" only when this is the teaser on the home page.
  const showViewAll = limit !== undefined && all.length > list.length;
  const isLoading = !!loading && list.length === 0;

  return (
    <section className="bg-ivory py-10 md:py-14">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6">
        <FadeIn>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p style={{ fontFamily: SANS }} className="mb-1.5 text-[0.66rem] uppercase tracking-[0.22em] text-umber">
                Handpicked for you
              </p>
              <h2 style={{ fontFamily: SERIF }} className="text-[1.7rem] font-semibold leading-tight text-ink md:text-[2.1rem]">
                Most <em className="italic text-[var(--burgundy)]">loved</em> experiences
              </h2>
            </div>
            {(showViewAll || limit !== undefined) && (
              <Link
                to="/featured-experiences"
                style={{ fontFamily: SANS }}
                className="group inline-flex shrink-0 items-center gap-1.5 text-[0.78rem] font-medium uppercase tracking-[0.1em] text-gold transition-colors hover:text-ink"
              >
                View all
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </FadeIn>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {Array.from({ length: Math.min(limit ?? 8, 8) }, (_, i) => (
              <ExperienceTileSkeleton key={i} />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p style={{ fontFamily: SANS }} className="rounded-2xl border border-dashed border-[var(--border-light)] p-10 text-center text-[0.9rem] text-[var(--mid)]">
            No featured experiences yet. Check back soon.
          </p>
        ) : (
          <StaggerContainer className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
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
