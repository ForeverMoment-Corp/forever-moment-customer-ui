import { useRef } from 'react'
import type { ReactNode } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// ============================================
// REUSABLE SLIDER — kisi bhi cards ko horizontal
// scroll + arrows ke saath dikhata hai
// ============================================
const Slider = ({ children }: { children: ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 280
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-[0_4px_16px_color-mix(in_srgb,_var(--ink)_12%,_transparent)] items-center justify-center hover:bg-gold hover:text-white transition-colors"
      >
        <FiChevronLeft size={16} />
      </button>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-1">
        {children}
      </div>

      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-[0_4px_16px_color-mix(in_srgb,_var(--ink)_12%,_transparent)] items-center justify-center hover:bg-gold hover:text-white transition-colors"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  )
}

export default Slider