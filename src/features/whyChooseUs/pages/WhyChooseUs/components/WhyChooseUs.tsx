import { ShieldCheck, Clock, Star, HeartHandshake } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/animations/StaggerContainer";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Vendors",
    desc: "Every vendor is background-checked and rated by real clients before joining our network.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    desc: "Setup completed well before your event with buffer time for any last-minute changes.",
  },
  {
    icon: Star,
    title: "Transparent Pricing",
    desc: "No hidden charges. What you see in the quote is exactly what you pay.",
  },
  {
    icon: HeartHandshake,
    title: "24/7 Support",
    desc: "Our dedicated event managers are available round the clock for any assistance.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-ivory">
      <div className="max-w-[1380px] mx-auto px-6">

        <FadeIn>
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[2rem] md:text-[2.6rem] text-ink font-semibold mb-2">
              Why Choose Us
            </h2>
            <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.7rem] text-umber tracking-[0.25em] uppercase">
              The Forever Moment Promise
            </p>
            <div className="w-10 h-[1px] bg-gold mx-auto mt-4" />
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const colors = ['var(--gold)', 'var(--coral)', 'var(--gold)', 'var(--coral)']
            const color = colors[i % colors.length]
            const Icon = feature.icon;
            return (
              <StaggerItem key={feature.title}>
                <div className="group text-center p-8 bg-white rounded-2xl shadow-[0_4px_16px_color-mix(in_srgb,_var(--ink)_6%,_transparent)] hover:shadow-[0_16px_40px_color-mix(in_srgb,_var(--gold)_20%,_transparent)] hover:-translate-y-2 transition-all duration-300 h-full">
                  <div
                    className="w-16 h-16 rounded-full bg-ivory flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300"
                    style={{ border: `1.5px solid ${color}40` }}
                  >
                    <Icon size={24} style={{ color }} />
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-[1.2rem] text-ink font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.82rem] text-umber leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}