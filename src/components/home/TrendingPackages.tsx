import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import FadeIn from '../animations/FadeIn'
import { StaggerContainer, StaggerItem } from '../animations/StaggerContainer'
import SmartImage from '@/components/common/SmartImage';

const packages = [
  { id: 1, title: 'Royal Rose Terrace', subtitle: 'Wedding Decoration', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500', price: 154999, badge: 'Best Seller' },
  { id: 2, title: 'Golden Candle Vale', subtitle: 'Luxury Candle Theme', image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=500', price: 124999, badge: null },
  { id: 3, title: 'Bohemian Bliss', subtitle: 'Boho Decoration', image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500', price: 89999, badge: null },
  { id: 4, title: 'Whimsical Garden', subtitle: 'Birthday Theme', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500', price: 149999, badge: null },
  { id: 5, title: 'Modern Marble Luxe', subtitle: 'Corporate Setup', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500', price: 184999, badge: 'Premium' },
  { id: 6, title: 'Ethereal Bloom', subtitle: 'Floral Decoration', image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500', price: 118499, badge: null },
]

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

const TrendingPackages = () => {
  return (
    <section className="section-padding bg-[#FDFAF4]">
      <div className="container mx-auto px-6">

        <FadeIn>
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[2rem] md:text-[2.6rem] text-[#1A1208] font-semibold mb-2">
              Trending Packages
            </h2>
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-[#9E8A6A] tracking-[0.25em] uppercase">
              Most Loved By Our Clients
            </p>
            <div className="w-10 h-[1px] bg-[#C9A84C] mx-auto mt-4" />
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {packages.map((pkg) => (
            <StaggerItem key={pkg.id}>

              {/* ============================================
                  POORA CARD EK LINK HAI
                  /package/:id pe navigate karega
              ============================================ */}
              <Link
                to={`/package/${pkg.id}`}
                className="group block bg-white rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(26,18,8,0.06)] hover:shadow-[0_16px_40px_rgba(201,168,76,0.25)] hover:-translate-y-2 transition-all duration-300 h-full"
              >
                <div className="relative h-[220px] overflow-hidden">
                  <SmartImage
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {pkg.badge && (
                    <span
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      className="absolute top-3 left-3 bg-[#D9776B] text-white text-[0.6rem] px-3 py-1.5 rounded-full tracking-[0.15em] uppercase font-semibold"
                    >
                      {pkg.badge}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.65rem] text-[#C9A84C] tracking-[0.2em] uppercase mb-1 font-semibold">
                    {pkg.subtitle}
                  </p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.3rem] text-[#1A1208] font-semibold mb-3">
                    {pkg.title}
                  </h3>

                  <div className="flex items-center justify-between pt-3 border-t border-[#EDE0C4]">
                    <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[1.05rem] text-[#1A1208] font-semibold">
                      {formatPrice(pkg.price)}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-[#FDFAF4] flex items-center justify-center group-hover:bg-[#C9A84C] transition-colors duration-300">
                      <FiArrowRight size={15} className="text-[#C9A84C] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>

            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn>
          <div className="text-center">
            <Link
              to="/services"
              style={{ fontFamily: "'Jost', sans-serif" }}
              className="inline-block bg-[#1A1208] text-white px-8 py-3.5 rounded-full text-[0.75rem] tracking-[0.2em] uppercase font-medium hover:bg-[#C9A84C] transition-colors"
            >
              Explore Full Collection
            </Link>
          </div>
        </FadeIn>

      </div>
    </section>
  )
}

export default TrendingPackages