import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import type { DecorSlider } from '../../data/decorSliders'
import FadeIn from '../animations/FadeIn'
import Slider from '../ui/Slider'
import SmartImage from '@/components/common/SmartImage';

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

const DecorSliderSection = ({ slider, bg = 'white' }: { slider: DecorSlider; bg?: 'white' | 'cream' }) => {
  return (
    <section className={`py-10 md:py-12 ${bg === 'white' ? 'bg-white' : 'bg-[#FDFAF4]'}`}>
      <div className="container mx-auto px-6">
        <FadeIn>
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="truncate text-[1.3rem] md:text-[2rem] text-[#1A1208] font-semibold">
              {slider.emoji} {slider.heading}
            </h2>
            <Link to={slider.viewAllLink} style={{ fontFamily: "'Jost', sans-serif" }} className="flex items-center gap-1.5 text-[0.7rem] text-[#C9A84C] tracking-[0.15em] uppercase font-semibold hover:text-[#9A7A2E] transition-colors shrink-0">
              View All <FiArrowRight size={12} />
            </Link>
          </div>
        </FadeIn>

        {/* ============================================
            MOBILE — snap-scroll, EK card pura screen le,
            swipe se next dikhe (scroll-snap-type)
        ============================================ */}
        <div className="flex sm:hidden gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory -mx-6 px-6">
          {slider.items.map((card) => (
            <Link
              key={card.id}
              to={`/services?category=${slider.heading.split(' ')[0]}`}
              className="snap-center shrink-0 w-[82vw] max-w-[320px] block"
            >
              <div className="rounded-[24px] bg-white border border-[#F3E7CC] shadow-[0_8px_30px_rgba(26,18,8,0.07)] overflow-hidden">
                <div className="relative h-[200px] overflow-hidden">
                  <SmartImage src={card.image} alt={card.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <span style={{ fontFamily: "'Jost', sans-serif" }} className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[9px] tracking-[0.16em] uppercase text-[#1A1208] font-semibold">
                    Premium
                  </span>
                </div>
                <div className="p-4">
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="truncate text-[1.1rem] text-[#1A1208] font-semibold mb-2">{card.title}</h3>
                  {/* ============================================
                      Price+discount aur Explore — EK LINE mein
                  ============================================ */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5 min-w-0">
                      <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.95rem] text-[#1A1208] font-bold whitespace-nowrap">{formatPrice(card.price)}</span>
                      <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.68rem] text-[#9E8A6A] line-through whitespace-nowrap">{formatPrice(Math.round(card.price * 1.2))}</span>
                    </div>
                    <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[10px] uppercase tracking-[0.15em] text-[#C9A84C] font-semibold shrink-0">Explore</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ============================================
            DESKTOP/TABLET — normal slider, multiple cards visible
        ============================================ */}
        <div className="hidden sm:block">
          <Slider>
            {slider.items.map((card) => (
              <Link key={card.id} to={`/services?category=${slider.heading.split(' ')[0]}`} className="group shrink-0 w-[230px] lg:w-[260px] block">
                <div className="rounded-[22px] bg-white border border-[#F3E7CC] shadow-[0_8px_24px_rgba(26,18,8,0.06)] hover:shadow-[0_20px_50px_rgba(201,168,76,0.18)] transition-all duration-400 hover:-translate-y-2 overflow-hidden">
                  <div className="relative h-[160px] lg:h-[180px] overflow-hidden">
                    <SmartImage src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    <span style={{ fontFamily: "'Jost', sans-serif" }} className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[9px] tracking-[0.16em] uppercase text-[#1A1208] font-semibold">
                      Premium
                    </span>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg">
                        <FiArrowRight size={14} className="text-[#1A1208]" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="truncate text-[1.05rem] text-[#1A1208] font-semibold mb-2">{card.title}</h3>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.92rem] text-[#1A1208] font-bold whitespace-nowrap">{formatPrice(card.price)}</span>
                        <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.66rem] text-[#9E8A6A] line-through whitespace-nowrap">{formatPrice(Math.round(card.price * 1.2))}</span>
                      </div>
                      <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[10px] uppercase tracking-[0.15em] text-[#C9A84C] font-semibold shrink-0">Explore</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  )
}

export default DecorSliderSection