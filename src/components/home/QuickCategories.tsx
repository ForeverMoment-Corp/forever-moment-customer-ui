import { Link } from 'react-router-dom'

const categories = [
  { label: 'Same Day', emoji: '⚡', bg: 'from-[#FFF3E0] to-[#FFE0B2]', to: '/shop?filter=same-day', badge: 'Today' },
  { label: 'Birthday', emoji: '🎂', bg: 'from-[#FCE4EC] to-[#F8BBD0]', to: '/shop?category=Birthday', badge: null },
  { label: 'Anniversary', emoji: '💍', bg: 'from-[#F3E5F5] to-[#E1BEE7]', to: '/shop?category=Anniversary', badge: null },
  { label: 'Flowers', emoji: '🌸', bg: 'from-[#E8F5E9] to-[#C8E6C9]', to: '/shop?category=Flowers', badge: null },
  { label: 'Experiences', emoji: '✨', bg: 'from-ink to-ink-soft', to: '/experiences', badge: 'New' },
  { label: 'Personalised', emoji: '🎨', bg: 'from-[#E3F2FD] to-[#BBDEFB]', to: '/shop?category=Personalised', badge: null },
  { label: 'Plants', emoji: '🌿', bg: 'from-[#F1F8E9] to-[#DCEDC8]', to: '/shop?category=Plants', badge: null },
  { label: 'Decoration', emoji: '🎊', bg: 'from-[#FFF8E1] to-[#FFECB3]', to: '/services', badge: null },
  { label: 'Cakes', emoji: '🍰', bg: 'from-[#FCE4EC] to-[#F8BBD0]', to: '/shop?category=Cakes', badge: null },
  { label: 'Gifts For Him', emoji: '👔', bg: 'from-[#E8EAF6] to-[#C5CAE9]', to: '/shop?for=him', badge: null },
]

const QuickCategories = () => {
  return (
    <section className="bg-white py-8 md:py-10 border-b border-[#F1E6D3]">
      <div className="w-full px-4 md:px-8 lg:px-12 xl:px-16">

        <div
          className="
            flex items-start
            gap-4 md:gap-6 lg:gap-8
            overflow-x-auto
            lg:overflow-x-visible
            scrollbar-hide
            pb-2
            lg:justify-between
          "
        >
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={cat.to}
              className="
                flex flex-col items-center
                gap-3
                shrink-0
                group
              "
            >
              <div className="relative">
                <div
                  className={`
                    w-[78px] h-[78px]
                    md:w-[90px] md:h-[90px]
                    lg:w-[96px] lg:h-[96px]
                    rounded-[26px]
                    bg-gradient-to-br ${cat.bg}
                    flex items-center justify-center
                    shadow-[0_8px_24px_rgba(0,0,0,0.06)]
                    border border-white/70
                    backdrop-blur-sm
                    transition-all duration-300
                    group-hover:-translate-y-2
                    group-hover:scale-105
                    group-hover:shadow-[0_15px_40px_rgba(0,0,0,0.12)]
                  `}
                >
                  <span className="text-[2rem] md:text-[2.3rem] lg:text-[2.5rem]">
                    {cat.emoji}
                  </span>
                </div>

                {cat.badge && (
                  <div
                    className="
                      absolute
                      -top-2
                      -right-2
                      px-2.5
                      py-1
                      rounded-full
                      bg-coral
                      text-white
                      shadow-lg
                      border border-white
                    "
                  >
                    <span
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      className="text-[10px] font-semibold uppercase tracking-wider"
                    >
                      {cat.badge}
                    </span>
                  </div>
                )}
              </div>

              <span
                style={{ fontFamily: "'Jost', sans-serif" }}
                className="
                  text-[12px]
                  md:text-[13px]
                  lg:text-[14px]
                  font-medium
                  text-center
                  text-ink
                  leading-tight
                  max-w-[90px]
                  transition-colors duration-300
                  group-hover:text-gold
                "
              >
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default QuickCategories
