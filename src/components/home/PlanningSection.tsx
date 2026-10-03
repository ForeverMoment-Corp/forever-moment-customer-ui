import { FiCalendar, FiUsers, FiCheckCircle } from 'react-icons/fi'
import SmartImage from '@/components/common/SmartImage';

const features = [
  {
    icon: FiCalendar,
    title: 'Choose Your Vibe',
    description: 'Select from curated themes based on Pinterest moodboards or live inspirations.',
  },
  {
    icon: FiUsers,
    title: 'Expert Matchmaking',
    description: 'We pair a vendor or stylist with you who fits your style and budget perfectly.',
  },
  {
    icon: FiCheckCircle,
    title: 'Flawless Execution',
    description: 'Sit back while our team handles everything from setup to teardown.',
  },
]

const PlanningSection = () => {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-[1380px] mx-auto px-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT — Image */}
          <div className="relative">
            <SmartImage
              src="https://images.unsplash.com/photo-1530023367847-a683933f4172?w=700"
              alt="Event Planning"
              className="w-full h-[400px] md:h-[500px] object-cover"
            />

            {/* Floating Quote Card */}
            <div
              className="absolute -bottom-6 -right-6 md:right-6 bg-[#1A1208] text-white p-6 max-w-[260px] hidden sm:block"
            >
              <p style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.1rem] italic leading-relaxed mb-3">
                "We bring your imagination to life with precision."
              </p>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#C9A84C] text-sm">★</span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Content */}
          <div>
            <p
              style={{ fontFamily: "'Jost', sans-serif" }}
              className="text-[0.7rem] text-[#C9A84C] tracking-[0.25em] uppercase mb-3"
            >
              How It Works
            </p>
            <h2
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
              className="text-[2rem] md:text-[2.6rem] text-[#1A1208] font-semibold mb-8 leading-tight"
            >
              Simple Planning for<br />Complex Celebrations
            </h2>

            {/* Features List */}
            <div className="space-y-6 mb-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-[#FDFAF4] border border-[#EDE0C4] shrink-0">
                    <feature.icon size={20} color="#C9A84C" />
                  </div>
                  <div>
                    <h3
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      className="text-[0.95rem] text-[#1A1208] font-semibold mb-1"
                    >
                      {feature.title}
                    </h3>
                    <p
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      className="text-[0.82rem] text-[#9E8A6A] leading-relaxed"
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              style={{ fontFamily: "'Jost', sans-serif" }}
              className="bg-[#1A1208] text-white px-8 py-4 text-[0.75rem] tracking-[0.2em] uppercase font-medium hover:bg-[#C9A84C] transition-colors"
            >
              Get Started
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}

export default PlanningSection
