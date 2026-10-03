import { FiCheckCircle, FiShield, FiZap, FiHeadphones, FiLock } from 'react-icons/fi'
import FadeIn from '@/components/animations/FadeIn'

const trustItems = [
  { icon: FiCheckCircle, label: 'Verified Setup', color: 'var(--sage)' },
  { icon: FiShield, label: '100% Money Back', color: 'var(--gold)' },
  { icon: FiZap, label: 'Same Day Available', color: 'var(--coral)' },
  { icon: FiHeadphones, label: '24/7 Support', color: 'var(--gold)' },
  { icon: FiLock, label: 'Secure Payment', color: 'var(--sage)' },
]

const TrustBar = () => {
  return (
    <section className="bg-ink py-6">
      <div className="max-w-[1380px] mx-auto px-6">
        <FadeIn>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon size={16} color={item.color} />
                <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.75rem] text-white/80 tracking-wide">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

export default TrustBar
