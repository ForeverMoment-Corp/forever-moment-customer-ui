import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import SmartImage from '@/components/common/SmartImage';
import { preloadResponsive, shouldPrefetch } from '@/lib/images';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getPromotionImages } from '@/features/home/store/actions';
import { promotionSlot, type PromotionImage } from '@/features/home/store/types';

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
    label: 'Forever Begins Here',
    heading: 'Plan The',
    accent: 'Perfect Wedding',
    description: 'From intimate ceremonies to grand celebrations — premium decor curated for your big day.',
    cta: { label: 'Explore Wedding Packages', to: '/services?category=Wedding' },
  },
  {
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600',
    alt: 'Birthday balloons',
    label: 'Pure Celebration',
    heading: 'Birthdays',
    accent: 'Made Magical',
    description: 'Colorful, fun, and personalized birthday setups for every age, every theme.',
    cta: { label: 'Browse Birthday Themes', to: '/services?category=Birthday' },
  },
  {
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600',
    alt: 'Romantic dinner table',
    label: 'No Planning Needed',
    heading: 'Experiences',
    accent: 'Worth Remembering',
    description: 'Romantic dinners, surprise setups, and curated date nights — just book and relax.',
    cta: { label: 'Discover Experiences', to: '/experiences' },
  },
  {
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1600',
    alt: 'Gift box with flowers',
    label: 'Delivered With Love',
    heading: 'Thoughtful Gifts,',
    accent: 'Delivered Fresh',
    description: 'Flowers, cakes, hampers and personalized gifts — same-day delivery available.',
    cta: { label: 'Shop Gifts & Cakes', to: '/shop' },
  },
  {
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1600',
    alt: 'Corporate event stage',
    label: 'Professional Excellence',
    heading: 'Corporate Events,',
    accent: 'Elevated',
    description: 'Conferences, product launches, and team celebrations — executed flawlessly.',
    cta: { label: 'Corporate Solutions', to: '/services?category=Corporate' },
  },
]

const Hero = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const slot = promotionSlot(PROMO_KEY, PROMO_PLACEMENT)
  const promoImages = useAppSelector((state) => state.home.promotions[slot])
  const promoLoading = useAppSelector((state) => state.home.promotionsLoading[slot])

  useEffect(() => {
    if (promoImages === undefined && !promoLoading) dispatch(getPromotionImages(PROMO_KEY, PROMO_PLACEMENT))
    // Fetch once per session; the store keeps the banners for later visits to the home page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const slides = useMemo(() => {
    const live = liveSlides(promoImages, new Date())
    return live.length > 0 ? live : fallbackSlides
  }, [promoImages])

  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // ============================================
  // AUTO-PLAY — har 5 second mein next slide
  // hover karne par pause
  // ============================================
  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [paused, slides.length])

  // Warm the next slide's background so the crossfade never lands on a blank frame.
  useEffect(() => {
    if (!shouldPrefetch()) return
    const id = window.setTimeout(() => void preloadResponsive(slides[(current + 1) % slides.length].image, '100vw'), 800)
    return () => window.clearTimeout(id)
  }, [current, slides])

  const next = () => setCurrent((prev) => (prev + 1) % slides.length)
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

 const handleSearch = () => {
  if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
}

  const safeIndex = current % slides.length
  const slide = slides[safeIndex]

  return (
    <section
      className="relative h-[560px] md:h-[640px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ============================================
          BACKGROUND — crossfade between slides
      ============================================ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
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
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--ink) 75%, transparent) 0%, transparent 50%)' }} />
        </motion.div>
      </AnimatePresence>

      {/* ============================================
          CONTENT — text changes per slide
      ============================================ */}
      <div className="absolute inset-0 flex items-center z-10 pb-24 md:pb-28">
        <div className="container mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.image}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="max-w-[620px]"
            >
              <div className="inline-flex items-center gap-2 border border-gold-bright/50 rounded-full px-4 py-1.5 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.65rem] text-gold-pale tracking-[0.25em]">
                  {slide.label.toUpperCase()}
                </span>
              </div>

              <h1 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[2.4rem] md:text-[3.6rem] text-white font-semibold leading-[1.15] mb-4">
                {slide.heading}
                {slide.accent && (
                  <>
                    {' '}
                    <span className="italic text-gold-pale">{slide.accent}</span>
                  </>
                )}
              </h1>

              {slide.description && (
                <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.9rem] text-white/80 leading-relaxed mb-7 max-w-[460px]">
                  {slide.description}
                </p>
              )}

              <Link
                to={slide.cta.to}
                style={{ fontFamily: "'Jost', sans-serif" }}
                className="inline-block bg-gold text-white px-8 py-4 text-[0.78rem] tracking-[0.2em] uppercase font-semibold hover:bg-gold-bright hover:text-ink transition-all rounded-full"
              >
                {slide.cta.label}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ============================================
          ARROWS — left/right
      ============================================ */}
      <button
        onClick={prev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 items-center justify-center text-white hover:bg-white/25 transition-colors"
      >
        <FiChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 items-center justify-center text-white hover:bg-white/25 transition-colors"
      >
        <FiChevronRight size={20} />
      </button>

      {/* ============================================
          BOTTOM BAR — Search + Dot indicators
      ============================================ */}
      <div className="absolute bottom-6 left-0 right-0 z-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-4 md:justify-between">

          {/* Compact Search Bar */}
          <div className="w-full md:max-w-[420px] bg-white rounded-full p-1.5 flex items-center gap-2 shadow-2xl">
            <FiSearch size={15} color="var(--gold)" className="ml-3" />
            <input
              type="text"
              placeholder="Search experiences, decor, gifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ fontFamily: "'Jost', sans-serif" }}
              className="flex-1 bg-transparent outline-none text-[0.82rem] text-ink placeholder-umber"
            />
            <button
              onClick={handleSearch}
              style={{ fontFamily: "'Jost', sans-serif" }}
              className="bg-gold text-white rounded-full px-5 py-2.5 text-[0.7rem] tracking-[0.15em] uppercase font-semibold hover:bg-ink transition-colors shrink-0"
            >
              Search
            </button>
          </div>

          {/* Dot Indicators */}
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-[6px] rounded-full transition-all ${i === safeIndex ? 'w-8 bg-gold' : 'w-[6px] bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero