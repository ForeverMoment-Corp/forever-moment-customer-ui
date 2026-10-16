import { useEffect, useState } from 'react'
import { FiStar } from 'react-icons/fi'
import FadeIn from '@/components/animations/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer'
import SectionHeading from '@/components/home/SectionHeading';
import { fetchRecentReviews, type Review } from '@/features/reviews/api'

/** Cards on the home page. */
const SHOWN = 3

const initials = (name: string) => name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

/**
 * Home page: the newest approved reviews (GET /public/reviews), best-written first. Hidden until
 * there are real reviews to show.
 */
export default function TestimonialsView() {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    let alive = true
    fetchRecentReviews(20)
      .then((list) => {
        if (!alive) return
        // Good ratings with something written, longest first so the cards read well.
        const picked = list
          .filter((r) => r.rating >= 4 && (r.comment || r.title))
          .sort((a, b) => (b.comment?.length ?? 0) - (a.comment?.length ?? 0))
          .slice(0, SHOWN)
        setReviews(picked)
      })
      .catch(() => {
        // No section rather than an error on the home page.
      })
    return () => {
      alive = false
    }
  }, [])

  if (reviews.length === 0) return null

  return (
    <section className="section-padding bg-ivory">
      <div className="max-w-[1380px] mx-auto px-6 2xl:max-w-none 2xl:px-5">

        <FadeIn>
          <SectionHeading align="center" eyebrow="Luxury experiences shared" title="Client" accent="whispers" />
        </FadeIn>

        <StaggerContainer className={`grid grid-cols-1 gap-6 ${reviews.length >= 3 ? 'md:grid-cols-3' : reviews.length === 2 ? 'md:grid-cols-2 md:max-w-[900px] md:mx-auto' : 'max-w-[460px] mx-auto'}`}>
          {reviews.map((t) => (
            <StaggerItem key={t.id}>
              <div className="bg-white rounded-2xl p-7 shadow-[0_4px_16px_color-mix(in_srgb,_var(--ink)_6%,_transparent)] hover:shadow-[0_16px_40px_color-mix(in_srgb,_var(--gold)_20%,_transparent)] hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                <div className="flex gap-1 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={14} fill={i < t.rating ? 'var(--coral)' : 'none'} color={i < t.rating ? 'var(--coral)' : 'var(--sand)'} />
                  ))}
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.1rem] text-ink italic leading-relaxed mb-6 line-clamp-6">
                  "{t.comment || t.title}"
                </p>
                <div className="mt-auto flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    style={{ fontFamily: "'Jost', sans-serif" }}
                    className="w-11 h-11 shrink-0 rounded-full bg-[var(--rose-light)] text-[var(--burgundy)] flex items-center justify-center text-[0.78rem] font-semibold ring-2 ring-ivory"
                  >
                    {initials(t.reviewerName)}
                  </span>
                  <div className="min-w-0">
                    <h4 style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.85rem] text-ink font-semibold truncate">{t.reviewerName}</h4>
                    {t.experienceName && (
                      <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-umber truncate">{t.experienceName}</p>
                    )}
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
