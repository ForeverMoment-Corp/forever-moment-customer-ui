import { Link } from 'react-router-dom'
import Slider from '../ui/Slider'
import SmartImage from '@/components/common/SmartImage';

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

const dummyItems = [
  { id: 1, title: 'Romantic Candlelight Dinner', price: 4999, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300', path: '/product/1' },
  { id: 2, title: 'Luxury Car Decoration', price: 2999, image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300', path: '/product/2' },
  { id: 3, title: 'Private Movie Screening', price: 8999, image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300', path: '/product/3' },
]

const RecentlyViewed = () => {
  const items = dummyItems
  if (items.length === 0) return null

  return (
    <section className="py-8 bg-white border-t border-sand">
      <div className="container mx-auto px-6">
        <h3 style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-ink font-semibold tracking-[0.15em] uppercase mb-4">
          Recently Viewed
        </h3>
        <Slider>
          {items.map((item) => (
            <Link key={item.id} to={item.path} className="shrink-0 w-[150px] bg-ivory rounded-xl p-2.5 hover:shadow-[0_4px_16px_color-mix(in_srgb,_var(--ink)_8%,_transparent)] transition-shadow">
              <SmartImage src={item.image} alt={item.title} className="w-full h-[90px] rounded-lg object-cover mb-2" />
              <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-ink font-medium leading-snug mb-0.5 truncate">{item.title}</p>
              <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-gold font-semibold">{formatPrice(item.price)}</p>
            </Link>
          ))}
        </Slider>
      </div>
    </section>
  )
}

export default RecentlyViewed