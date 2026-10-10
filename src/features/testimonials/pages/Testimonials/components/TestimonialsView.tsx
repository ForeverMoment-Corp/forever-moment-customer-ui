import { FiStar } from 'react-icons/fi'
import FadeIn from '@/components/animations/FadeIn'
import { StaggerContainer, StaggerItem } from '@/components/animations/StaggerContainer'

const testimonials = [
  { name: 'Ananya Sharma', location: 'Wedding, Delhi', review: 'The proposal setup was beyond what I could have imagined. Truly a once in a lifetime experience.', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
  { name: 'Vikram Mehta', location: 'Birthday, Mumbai', review: 'Professional team, highly aesthetic decor, and perfect execution. The lighting changed the whole mood.', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  { name: 'Sanya Roy', location: 'Anniversary, Bangalore', review: 'Beautiful work! There was a slight delay in setup but the final result was stunning that it did not matter.', rating: 4, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
]

export default function TestimonialsView() {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-[1380px] mx-auto px-6">

        <FadeIn>
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[2rem] md:text-[2.6rem] text-ink font-semibold mb-2">
              Client Whispers
            </h2>
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-umber tracking-[0.25em] uppercase">
              Luxury Experiences Shared
            </p>
            <div className="w-10 h-[1px] bg-gold mx-auto mt-4" />
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <div className="bg-white rounded-2xl p-7 shadow-[0_4px_16px_color-mix(in_srgb,_var(--ink)_6%,_transparent)] hover:shadow-[0_16px_40px_color-mix(in_srgb,_var(--gold)_20%,_transparent)] hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={14} fill={i < t.rating ? 'var(--coral)' : 'none'} color={i < t.rating ? 'var(--coral)' : 'var(--sand)'} />
                  ))}
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.1rem] text-ink italic leading-relaxed mb-6">
                  "{t.review}"
                </p>
                <div className="mt-auto flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-ivory" />
                  <div>
                    <h4 style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.85rem] text-ink font-semibold">{t.name}</h4>
                    <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-umber">{t.location}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
