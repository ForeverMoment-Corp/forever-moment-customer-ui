import { Link } from 'react-router-dom'
import FadeIn from '@/components/animations/FadeIn'

const banners = [
  { title: 'Flat 20% Off', subtitle: 'On all Birthday Decorations', to: '/services?category=Birthday', bg: 'var(--gold)', emoji: '🎂' },
  { title: 'Free Add-On', subtitle: 'Book any Experience this week', to: '/experiences', bg: 'var(--coral)', emoji: '✨' },
  { title: 'Combo Savings', subtitle: 'Save up to ₹2,500 on bundles', to: '/#combos', bg: 'var(--sage)', emoji: '🎁' },
]

const PromoBanners = () => {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1380px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {banners.map((b, i) => (
            <FadeIn key={b.title} delay={i * 0.1}>
              <Link
                to={b.to}
                className="block rounded-2xl p-6 h-[140px] flex flex-col justify-between relative overflow-hidden hover:-translate-y-1 transition-transform duration-300"
                style={{ background: b.bg }}
              >
                <span className="text-[2rem] absolute top-3 right-4 opacity-25">{b.emoji}</span>
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-white text-[1.4rem] font-bold">{b.title}</p>
                  <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-white/85 text-[0.78rem] mt-1">{b.subtitle}</p>
                </div>
                <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-white text-[0.68rem] uppercase tracking-[0.15em] font-semibold">Shop Now →</span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PromoBanners
