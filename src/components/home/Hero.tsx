import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, Headphones, Pause, Play, ReceiptText } from 'lucide-react'
import SmartImage from '@/components/common/SmartImage';
import { preloadResponsive, shouldPrefetch } from '@/lib/images';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getPromotionImages } from '@/features/home/store/actions';
import { promotionSlot, type PromotionImage } from '@/features/home/store/types';
import CategoryIcon from '@/components/navbar/CategoryIcon';
import { categoryPath, type NavCategory } from '@/components/navbar/navTypes';

const SANS = "'Jost', sans-serif"
const SERIF = "'Cormorant Garamond', serif"

/** Time each slide stays up; the active dot fills over this long. */
const SLIDE_MS = 6000
const SWIPE_PX = 50
const MAX_OCCASIONS = 5

interface Slide {
  image: string
  /** Small rendition, paired with `image` so the browser can pick on narrow screens. */
  thumbnail?: string
  alt: string
  label: string
  heading: string
  accent: string
  description: string
  cta: { label: string; to: string }
}

// Hero banners are managed in the admin as promotion images with key "hero" and placement "home".
const PROMO_KEY = 'hero'
const PROMO_PLACEMENT = 'home'

/** Only banners that are active right now, highest priority first. */
const liveSlides = (images: PromotionImage[] | undefined, now: Date): Slide[] =>
  (images ?? [])
    .filter((p) => p && p.isActive !== false && (p.heroUrl || p.url))
    .filter((p) => (!p.startAt || new Date(p.startAt) <= now) && (!p.endAt || new Date(p.endAt) >= now))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id - b.id)
    .map((p) => {
      const title = (p.title || '').trim()
      const alt = (p.altTextOverride || '').trim()
      return {
        image: p.heroUrl || p.url,
        thumbnail: p.thumbnailUrl || undefined,
        alt: alt || title || 'Forever Moment',
        label: 'Featured',
        heading: title,
        accent: '',
        description: alt && alt.toLowerCase() !== title.toLowerCase() ? alt : '',
        cta: { label: 'Explore experiences', to: '/featured-experiences' },
      }
    })

// ============================================
// FALLBACK SLIDES — used only until the API has banners
// ============================================
const fallbackSlides: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600',
    alt: 'Wedding decor',
    label: 'Forever begins here',
    heading: 'Plan the',
    accent: 'perfect wedding',
    description: 'From intimate ceremonies to grand celebrations, decor curated for your big day.',
    cta: { label: 'Explore weddings', to: '/categories' },
  },
  {
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600',
    alt: 'Birthday balloons',
    label: 'Pure celebration',
    heading: 'Birthdays,',
    accent: 'made magical',
    description: 'Colourful, personalised birthday setups for every age and every theme.',
    cta: { label: 'Browse birthday themes', to: '/categories' },
  },
  {
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600',
    alt: 'Romantic dinner table',
    label: 'No planning needed',
    heading: 'Moments',
    accent: 'worth remembering',
    description: 'Romantic dinners, surprise setups and date nights. Just book and relax.',
    cta: { label: 'See featured experiences', to: '/featured-experiences' },
  },
]

/** Claims the home page already makes in "Why choose us". */
const TRUST = [
  { icon: BadgeCheck, label: 'Verified vendors' },
  { icon: ReceiptText, label: 'Transparent pricing' },
  { icon: Headphones, label: '24/7 support' },
]

const Hero = () => {
  const dispatch = useAppDispatch()
  const reduceMotion = useReducedMotion()
  const slot = promotionSlot(PROMO_KEY, PROMO_PLACEMENT)
  const promoImages = useAppSelector((state) => state.home.promotions[slot])
  const promoLoading = useAppSelector((state) => state.home.promotionsLoading[slot])
  const apiCategories = useAppSelector((state) => state.header?.categories ?? []) as NavCategory[]

  useEffect(() => {
    if (promoImages === undefined && !promoLoading) dispatch(getPromotionImages(PROMO_KEY, PROMO_PLACEMENT))
    // Fetch once per session; the store keeps the banners for later visits to the home page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const slides = useMemo(() => {
    const live = liveSlides(promoImages, new Date())
    return live.length > 0 ? live : fallbackSlides
  }, [promoImages])

  // Quick ways in, straight from the city's categories (same list as the navbar).
  const occasions = useMemo(
    () =>
      apiCategories
        .filter((c) => c && c.isActive !== false)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .slice(0, MAX_OCCASIONS),
    [apiCategories],
  )

  const [current, setCurrent] = useState(0)
  // Hover / keyboard focus pause for a moment; the pause button pauses until pressed again.
  const [hovering, setHovering] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const touchX = useRef<number | null>(null)

  const multiple = slides.length > 1
  // People who ask for reduced motion get no autoplay.
  const playing = multiple && !hovering && !userPaused && !reduceMotion

  const safeIndex = current % slides.length
  const slide = slides[safeIndex]

  const go = (index: number) => setCurrent((index + slides.length) % slides.length)
  const next = () => go(safeIndex + 1)
  const prev = () => go(safeIndex - 1)

  useEffect(() => {
    if (!playing) return
    const timer = window.setTimeout(() => setCurrent((c) => (c + 1) % slides.length), SLIDE_MS)
    return () => window.clearTimeout(timer)
  }, [playing, current, slides.length])

  // Warm the next slide's background so the crossfade never lands on a blank frame.
  useEffect(() => {
    if (!multiple || !shouldPrefetch()) return
    const id = window.setTimeout(() => void preloadResponsive(slides[(safeIndex + 1) % slides.length].image, '100vw'), 800)
    return () => window.clearTimeout(id)
  }, [safeIndex, slides, multiple])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured celebrations"
      className="relative h-[540px] sm:h-[520px] lg:h-[580px] overflow-hidden bg-ink"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovering(false)
      }}
      onKeyDown={(e) => {
        if (!multiple) return
        if (e.key === 'ArrowRight') next()
        if (e.key === 'ArrowLeft') prev()
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || !multiple) return
        const dx = e.changedTouches[0].clientX - touchX.current
        touchX.current = null
        if (Math.abs(dx) > SWIPE_PX) (dx < 0 ? next : prev)()
      }}
    >
      {/* BACKGROUND — slides crossfade (the new one fades in over the old, no blank frame) */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.image}
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.3 : 1, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <SmartImage
            src={slide.image}
            placeholderSrc={slide.thumbnail}
            alt={slide.alt}
            priority
            noFade
            sizes="100vw"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Readability: dark on the text side and along the bottom, the photo stays bright on the right */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, color-mix(in srgb, var(--ink) 82%, transparent) 0%, color-mix(in srgb, var(--ink) 55%, transparent) 45%, color-mix(in srgb, var(--ink) 10%, transparent) 100%), linear-gradient(to top, color-mix(in srgb, var(--ink) 70%, transparent) 0%, transparent 40%)',
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 h-full w-full px-5 sm:px-8 lg:px-14 flex flex-col justify-center pb-20 sm:pb-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.image}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
            transition={{ duration: 0.45 }}
            className="max-w-[600px]"
            aria-live={playing ? 'off' : 'polite'}
          >
            <p style={{ fontFamily: SANS }} className="inline-flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.24em] text-gold-pale">
              <span className="h-px w-6 bg-gold" aria-hidden />
              {slide.label}
            </p>

            <h1 style={{ fontFamily: SERIF }} className="mt-3 text-[2.3rem] sm:text-[3rem] lg:text-[3.5rem] text-white font-semibold leading-[1.08]">
              {slide.heading}
              {slide.accent && (
                <>
                  {' '}
                  <span className="italic text-gold-pale">{slide.accent}</span>
                </>
              )}
            </h1>

            {slide.description && (
              <p style={{ fontFamily: SANS }} className="mt-3 max-w-[460px] text-[0.92rem] leading-relaxed text-white/80">
                {slide.description}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Actions stay put while slides change, so they are never a moving target */}
        <div className="mt-6 flex flex-wrap items-center gap-3" style={{ fontFamily: SANS }}>
          <Link
            to={slide.cta.to}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-gold pl-6 pr-5 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-gold-bright hover:text-ink"
          >
            {slide.cta.label}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/categories"
            className="inline-flex h-12 items-center rounded-full border border-white/40 px-6 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/10"
          >
            All occasions
          </Link>
        </div>

        {occasions.length > 0 && (
          <div className="mt-6" style={{ fontFamily: SANS }}>
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-white/60">Popular occasions</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {occasions.map((cat, i) => (
                // Three on phones so the chips stay on one or two rows
                <li key={cat.id} className={i >= 3 ? 'hidden sm:block' : undefined}>
                  <Link
                    to={categoryPath(cat)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[0.78rem] capitalize text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-ink"
                  >
                    <CategoryIcon name={cat.name} size={13} strokeWidth={1.75} className="text-gold-pale" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* BOTTOM BAR — trust points + slide controls */}
      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-ink/40 backdrop-blur-sm" style={{ fontFamily: SANS }}>
        <div className="flex h-14 w-full items-center justify-between gap-4 px-5 sm:px-8 lg:px-14">
          <ul className="flex min-w-0 items-center gap-x-5 text-[0.72rem] text-white/80">
            {TRUST.map(({ icon: Icon, label }, i) => (
              <li key={label} className={`items-center gap-1.5 whitespace-nowrap ${i === 0 ? 'flex' : 'hidden sm:flex'}`}>
                <Icon size={14} className="text-gold-pale" />
                {label}
              </li>
            ))}
          </ul>

          {multiple && (
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center gap-1.5" role="group" aria-label="Choose slide">
                {slides.map((s, i) => {
                  const active = i === safeIndex
                  return (
                    <button
                      key={`${s.image}-${i}`}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Slide ${i + 1} of ${slides.length}`}
                      aria-current={active ? 'true' : undefined}
                      className={`relative h-1.5 overflow-hidden rounded-full transition-all ${active ? 'w-9 bg-white/30' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
                    >
                      {active && (
                        // Fills over SLIDE_MS while playing, so guests can see when the next slide comes.
                        <span
                          key={`${safeIndex}-${playing}`}
                          className="absolute inset-y-0 left-0 rounded-full bg-gold"
                          style={
                            playing
                              ? { width: '100%', animation: `hero-progress ${SLIDE_MS}ms linear` }
                              : { width: '100%' }
                          }
                        />
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="hidden sm:flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setUserPaused((p) => !p)}
                  aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {userPaused ? <Play size={14} /> : <Pause size={14} />}
                </button>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous slide"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next slide"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes hero-progress { from { width: 0% } to { width: 100% } }`}</style>
    </section>
  )
}

export default Hero
