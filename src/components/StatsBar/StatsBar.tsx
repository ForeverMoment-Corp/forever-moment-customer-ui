import { useEffect, useState, useRef } from 'react'
import {
  FiHeart,
  FiUsers,
  FiMapPin,
  FiStar,
} from 'react-icons/fi'

const stats = [
  {
    value: 10000,
    suffix: '+',
    label: 'Happy Celebrations',
    icon: FiHeart,
  },
  {
    value: 500,
    suffix: '+',
    label: 'Verified Vendors',
    icon: FiUsers,
  },
  {
    value: 50,
    suffix: '+',
    label: 'Cities Covered',
    icon: FiMapPin,
  },
  {
    value: 4.9,
    suffix: '★',
    label: 'Average Rating',
    icon: FiStar,
  },
]

const Counter = ({
  value,
  suffix,
}: {
  value: number
  suffix: string
}) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !hasAnimated.current
        ) {
          hasAnimated.current = true

          const duration = 1500
          const steps = 50
          const increment = value / steps

          let current = 0

          const timer = setInterval(() => {
            current += increment

            if (current >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(current)
            }
          }, duration / steps)
        }
      },
      { threshold: 0.4 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [value])

  const displayValue =
    value % 1 !== 0
      ? count.toFixed(1)
      : Math.floor(count)

  return (
    <div ref={ref}>
      {displayValue}
      {suffix}
    </div>
  )
}

export default function StatsBar() {
  return (
    <section className="py-8 md:py-10 bg-ivory">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                className="
                  group
                  bg-white
                  rounded-[24px]
                  border
                  border-wheat
                  p-4
                  sm:p-5
                  text-center
                  shadow-[0_6px_24px_color-mix(in_srgb,_var(--ink)_4%,_transparent)]
                  hover:shadow-[0_16px_50px_color-mix(in_srgb,_var(--gold)_14%,_transparent)]
                  hover:-translate-y-1
                  transition-all
                  duration-300
                "
              >
                {/* Icon */}
                <div className="mb-3 flex justify-center">
                  <div
                    className="
                      w-11 h-11
                      rounded-full
                      bg-ivory
                      border
                      border-parchment
                      flex
                      items-center
                      justify-center
                      group-hover:scale-110
                      transition-transform
                      duration-300
                    "
                  >
                    <Icon
                      size={18}
                      className="text-gold"
                    />
                  </div>
                </div>

                {/* Counter */}
                <div
                  style={{
                    fontFamily:
                      "'Cormorant Garamond', serif",
                  }}
                  className="
                    text-[1.8rem]
                    sm:text-[2.1rem]
                    lg:text-[2.4rem]
                    text-ink
                    font-semibold
                    leading-none
                    mb-2
                  "
                >
                  <Counter
                    value={stat.value}
                    suffix={stat.suffix}
                  />
                </div>

                {/* Label */}
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                  }}
                  className="
                    text-[10px]
                    sm:text-[11px]
                    md:text-[12px]
                    uppercase
                    tracking-[0.18em]
                    text-umber
                    font-medium
                    leading-relaxed
                  "
                >
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
