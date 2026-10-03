import { useState, useRef } from 'react'
import { FiChevronLeft, FiChevronRight, FiHeart } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import SmartImage from '@/components/common/SmartImage';

const tabs = ['Weddings', 'Birthday', 'Corporate', 'Engagement']

const allItems = [
  { id: 1, title: 'Royal Rose Mandap', category: 'Weddings', price: 154999, image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400' },
  { id: 2, title: 'Golden Candle Aisle', category: 'Weddings', price: 124999, image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400' },
  { id: 3, title: 'Floral Entrance Arch', category: 'Weddings', price: 89999, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400' },
  { id: 4, title: 'Vintage Mehendi Setup', category: 'Weddings', price: 64999, image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400' },
  { id: 5, title: 'Balloon Wonderland', category: 'Birthday', price: 24999, image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400' },
  { id: 6, title: 'Neon Glow Party', category: 'Birthday', price: 32999, image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400' },
  { id: 7, title: 'Princess Theme Setup', category: 'Birthday', price: 45999, image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400' },
  { id: 8, title: 'Corporate Stage Backdrop', category: 'Corporate', price: 184999, image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400' },
  { id: 9, title: 'Product Launch Setup', category: 'Corporate', price: 220000, image: 'https://images.unsplash.com/photo-1561128290-006fc5e4ce9b?w=400' },
  { id: 10, title: 'Award Night Theme', category: 'Corporate', price: 175000, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
  { id: 11, title: 'Ring Ceremony Decor', category: 'Engagement', price: 99999, image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400' },
  { id: 12, title: 'Candlelight Proposal', category: 'Engagement', price: 49999, image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400' },
  { id: 13, title: 'Floral Engagement Stage', category: 'Engagement', price: 118499, image: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=400' },
]

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

const CategorySlider = () => {
  const [activeTab, setActiveTab] = useState('Weddings')
  const scrollRef = useRef<HTMLDivElement>(null)
  const filteredItems = allItems.filter((item) => item.category === activeTab)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-[#C9A84C] tracking-[0.25em] uppercase mb-2">
            Curated For You
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[2rem] md:text-[2.6rem] text-[#1A1208] font-semibold">
            Tailored For Your Occasion
          </h2>
        </div>

        <div className="flex gap-8 mb-8 border-b border-[#EDE0C4] overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ fontFamily: "'Jost', sans-serif" }}
              className={`pb-4 px-1 whitespace-nowrap text-[0.8rem] tracking-[0.15em] uppercase font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab ? 'text-[#D9776B] border-[#D9776B]' : 'text-[#9E8A6A] border-transparent hover:text-[#1A1208]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-[0_4px_16px_rgba(26,18,8,0.1)] items-center justify-center hover:bg-[#C9A84C] hover:text-white transition-colors"
          >
            <FiChevronLeft size={18} />
          </button>

          <div ref={scrollRef} className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-hide pb-2">
            {filteredItems.map((item) => (
              <Link
  to={`/services?category=${activeTab}`}
  key={item.id}
  className="group shrink-0 w-[260px] block bg-white rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(26,18,8,0.06)] hover:shadow-[0_16px_40px_rgba(201,168,76,0.25)] hover:-translate-y-2 transition-all duration-300"
>
                <div className="relative h-[200px] overflow-hidden">
                  <SmartImage src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-[#D9776B] hover:text-white transition-colors">
                    <FiHeart size={14} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.05rem] text-[#1A1208] font-semibold mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.95rem] text-[#C9A84C] font-semibold">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-[0_4px_16px_rgba(26,18,8,0.1)] items-center justify-center hover:bg-[#C9A84C] hover:text-white transition-colors"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default CategorySlider