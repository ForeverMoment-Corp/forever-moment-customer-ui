import { ShieldCheck, Clock, ReceiptText, HeartHandshake } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import SectionHeading from '@/components/home/SectionHeading';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

const features = [
  { icon: ShieldCheck, title: "Verified vendors", desc: "Every decorator is background-checked and rated by clients." },
  { icon: Clock, title: "On-time setup", desc: "Ready well before your event, with time to spare." },
  { icon: ReceiptText, title: "Transparent pricing", desc: "No hidden charges: the price you see is what you pay." },
  { icon: HeartHandshake, title: "24/7 support", desc: "Event managers on call, day and night." },
];

/**
 * The four promises in one white panel: icon, title and one line each, divided by thin rules.
 * A row of four on laptops, 2×2 on tablets, a compact list on phones.
 */
export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-ivory">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
        <FadeIn>
          <SectionHeading align="center" eyebrow="The Forever Moment promise" title="Why choose" accent="us" />
        </FadeIn>

        <FadeIn delay={0.05}>
          <ul
            className="grid grid-cols-1 divide-y divide-[var(--border-light)] overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4"
            style={{ fontFamily: SANS }}
          >
            {features.map(({ icon: Icon, title, desc }, i) => (
              <li
                key={title}
                className={`group flex items-start gap-3.5 p-5 transition-colors hover:bg-[var(--cream)] sm:p-6 ${
                  // Thin dividers between cells: vertical between columns, horizontal between the 2×2 rows.
                  i % 2 === 1 ? 'sm:border-l sm:border-[var(--border-light)]' : ''
                } ${i >= 2 ? 'sm:border-t sm:border-[var(--border-light)] lg:border-t-0' : ''} ${
                  i === 2 ? 'lg:border-l lg:border-[var(--border-light)]' : ''
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--rose-light)] text-[var(--burgundy)] transition-colors duration-300 group-hover:bg-[var(--burgundy)] group-hover:text-white">
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span style={{ fontFamily: SERIF }} className="block text-[1.15rem] font-semibold leading-tight text-ink">
                    {title}
                  </span>
                  <span className="mt-1 block text-[0.8rem] leading-snug text-[var(--mid)]">{desc}</span>
                </span>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  );
}
