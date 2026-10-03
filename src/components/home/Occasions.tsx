import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import FadeIn from '@/components/animations/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer'
import SmartImage from '@/components/common/SmartImage';

const occasions = [
  { title: 'Weddings', image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500', to: '/services?category=Wedding' },
  { title: 'Birthdays', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500', to: '/services?category=Birthday' },
  { title: 'Proposals', image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500', to: '/experiences?category=Romantic Dinners' },
  { title: 'Anniversaries', image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500', to: '/services?category=Wedding' },
]

const Occasions = () => {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-[1380px] mx-auto px-6">

        <FadeIn>
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[2rem] md:text-[2.6rem] text-[#1A1208] font-semibold mb-2">
              Celebration Occasions
            </h2>
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-[#9E8A6A] tracking-[0.25em] uppercase">
              Discover Curated Themes
            </p>
            <div className="w-10 h-[1px] bg-[#C9A84C] mx-auto mt-4" />
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {occasions.map((item) => (
            <StaggerItem key={item.title}>
              <Link to={item.to} className="group relative h-[220px] md:h-[280px] rounded-2xl overflow-hidden cursor-pointer shadow-[0_4px_16px_rgba(26,18,8,0.06)] hover:shadow-[0_16px_40px_rgba(201,168,76,0.25)] hover:-translate-y-2 transition-all duration-300 block">
                <SmartImage
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)' }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 pb-5">
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-white text-[1.1rem] md:text-[1.4rem] font-semibold mb-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[#F5E6B8] text-[0.68rem] tracking-[0.15em] uppercase font-medium">
                      View All
                    </span>
                    <FiArrowRight size={12} color="#F5E6B8" />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

export default Occasions
