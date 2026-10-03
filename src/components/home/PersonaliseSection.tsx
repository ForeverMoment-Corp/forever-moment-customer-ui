import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import SmartImage from '@/components/common/SmartImage';

const personalItems = [
  {
    label: 'Jewellery',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    to: '/shop?category=Personalised&type=jewellery',
    tag: 'Bestseller',
  },
  {
    label: 'Photo Frames',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400',
    to: '/shop?category=Personalised&type=frames',
    tag: null,
  },
  {
    label: 'Custom Mugs',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400',
    to: '/shop?category=Personalised&type=mugs',
    tag: 'Trending',
  },
  {
    label: 'Cushions',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    to: '/shop?category=Personalised&type=cushions',
    tag: null,
  },
  {
    label: 'Photo Books',
    image: 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=400',
    to: '/shop?category=Personalised&type=photobooks',
    tag: 'New',
  },
  {
    label: 'Keepsakes',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
    to: '/shop?category=Personalised&type=keepsakes',
    tag: null,
  },
]

const PersonaliseSection = () => {
  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.65rem] text-gold tracking-[0.3em] uppercase mb-1 font-semibold">
              Made Just For Them
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.8rem] md:text-[2.4rem] text-ink font-semibold leading-tight">
              Personalise Your Moments
            </h2>
          </div>
          <Link
            to="/shop?category=Personalised"
            style={{ fontFamily: "'Jost', sans-serif" }}
            className="hidden sm:flex items-center gap-1.5 text-[0.72rem] text-gold hover:text-gold-dark tracking-wider uppercase font-semibold transition-colors"
          >
            View All <FiArrowRight size={13} />
          </Link>
        </div>

        {/* Grid — 3 cols desktop, 2 cols mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {personalItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="group flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-[0_4px_12px_color-mix(in_srgb,_var(--ink)_8%,_transparent)] group-hover:shadow-[0_12px_28px_color-mix(in_srgb,_var(--ink)_14%,_transparent)] group-hover:-translate-y-1.5 transition-all duration-400 bg-ivory">
                <SmartImage
                  src={item.image}
                  alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Tag */}
                {item.tag && (
                  <div className="absolute top-2.5 left-2.5 bg-coral text-white rounded-full px-2.5 py-1">
                    <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.55rem] font-bold tracking-wide">
                      {item.tag}
                    </span>
                  </div>
                )}
              </div>

              {/* Label */}
              <p
                style={{ fontFamily: "'Jost', sans-serif" }}
                className="text-[0.78rem] text-ink font-medium mt-3 text-center group-hover:text-gold transition-colors"
              >
                {item.label}
              </p>
            </Link>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-8 bg-gradient-to-r from-ink to-ink-soft rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.6rem] text-white font-semibold mb-1">
              Can't find what you're looking for?
            </h3>
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.8rem] text-white/60">
              Create a fully custom gift — tell us your idea, we'll make it happen.
            </p>
          </div>
          <Link
            to="/contact"
            style={{ fontFamily: "'Jost', sans-serif" }}
            className="shrink-0 bg-gold text-white rounded-full px-7 py-3.5 text-[0.75rem] tracking-[0.15em] uppercase font-semibold hover:bg-gold-bright hover:text-ink transition-all flex items-center gap-2"
          >
            Customise Now <FiArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PersonaliseSection