import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiCompass, FiShoppingBag, FiCalendar, FiUser } from 'react-icons/fi'

const navItems: { label: string; icon: typeof FiHome; to: string; match?: string[] }[] = [
  { label: 'Home', icon: FiHome, to: '/' },
  // Lit on every browsing page, not just /categories.
  { label: 'Explore', icon: FiCompass, to: '/categories', match: ['/categories', '/category/', '/subcategor', '/experience/', '/featured-experiences'] },
  { label: 'Cart', icon: FiShoppingBag, to: '/cart' },
  { label: 'Bookings', icon: FiCalendar, to: '/bookings' },
  { label: 'Account', icon: FiUser, to: '/profile' },
]

const BottomNav = () => {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] md:hidden bg-white border-t border-sand"
      style={{ boxShadow: '0 -4px 20px color-mix(in srgb, var(--ink) 6%, transparent)' }}
    >
      <div className="grid grid-cols-5 h-[60px]">
        {navItems.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : (item.match ?? [item.to]).some((prefix) => location.pathname.startsWith(prefix))

          return (
            <Link
              key={item.label}
              to={item.to}
              className="flex flex-col items-center justify-center gap-1 relative"
            >
              {isActive && <div className="absolute top-0 w-8 h-[2px] bg-gold rounded-full" />}

              <div className="relative">
                <item.icon size={19} color={isActive ? 'var(--gold)' : 'var(--umber)'} />
              </div>

              <span
                style={{ fontFamily: "'Jost', sans-serif" }}
                className={`text-[0.6rem] ${isActive ? 'text-gold font-semibold' : 'text-umber'}`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
