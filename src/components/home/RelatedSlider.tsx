import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi'
import SmartImage from '@/components/common/SmartImage';

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

interface Package {
  id: number
  title: string
  category: string
  price: number
  image: string
  badge: string | null
}

interface Props {
  currentId: number
  category: string
  allPackages: Package[]
  title?: string
}

// ============================================
// RELATED SLIDER — same category ke packages
// currentId wala package exclude karo
// ============================================
const RelatedSlider = ({ currentId, category, allPackages, title = 'You May Also Like' }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const related = allPackages.filter(
    (pkg) => pkg.category === category && pkg.id !== currentId
  )

  if (related.length === 0) return null

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.65rem] text-[#D9776B] tracking-[0.25em] uppercase mb-1 font-semibold">
              {category} Packages
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.8rem] text-[#1A1208] font-semibold">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full bg-white border border-[#EDE0C4] flex items-center justify-center hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors shadow-sm">
              <FiChevronLeft size={17} />
            </button>
            <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full bg-white border border-[#EDE0C4] flex items-center justify-center hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors shadow-sm">
              <FiChevronRight size={17} />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide pb-2">
          {related.map((pkg) => (
            <Link
              key={pkg.id}
              to={`/package/${pkg.id}`}
              className="shrink-0 w-[260px] group bg-white rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(26,18,8,0.06)] hover:shadow-[0_16px_40px_rgba(201,168,76,0.25)] hover:-translate-y-2 transition-all duration-300 block"
            >
              <div className="relative h-[180px] overflow-hidden">
                <SmartImage src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {pkg.badge && (
                  <span style={{ fontFamily: "'Jost', sans-serif" }} className="absolute top-3 left-3 bg-[#D9776B] text-white rounded-full text-[0.58rem] px-3 py-1 tracking-wider uppercase font-semibold">
                    {pkg.badge}
                  </span>
                )}
              </div>
              <div className="p-4">
                <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.6rem] text-[#C9A84C] tracking-[0.2em] uppercase mb-1 font-semibold">
                  {pkg.category}
                </p>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.1rem] text-[#1A1208] font-semibold mb-3 leading-snug">
                  {pkg.title}
                </h3>
                <div className="flex items-center justify-between pt-3 border-t border-[#EDE0C4]">
                  <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.95rem] text-[#1A1208] font-semibold">
                    {formatPrice(pkg.price)}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[#FDFAF4] flex items-center justify-center group-hover:bg-[#C9A84C] transition-colors">
                    <FiArrowRight size={14} className="text-[#C9A84C] group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-8">
          <Link
            to="/services"
            style={{ fontFamily: "'Jost', sans-serif" }}
            className="inline-flex items-center gap-2 text-[0.75rem] text-[#1A1208] tracking-[0.2em] uppercase font-medium hover:text-[#C9A84C] transition-colors"
          >
            View All {category} Packages <FiArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default RelatedSlider