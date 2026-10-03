import { CalendarCheck, PartyPopper, Truck } from 'lucide-react';
import SectionCard, { Accent } from './SectionCard';
import { FONT_SANS, FONT_SERIF } from '../normalize';

const STEPS = [
  { icon: CalendarCheck, title: 'You book', text: 'Pick a day and slot, pay securely, and get an instant confirmation on WhatsApp.', time: 'Takes 2 minutes' },
  { icon: Truck, title: 'We set up', text: 'Our decorators arrive about two hours before your slot with everything in the package.', time: '2 hrs before' },
  { icon: PartyPopper, title: 'You celebrate', text: 'Walk in, light the candles and enjoy. We come back afterwards to take it all down.', time: 'Your moment' },
];

/**
 * Three steps on a connected rail, the same visual language as the booking plan:
 * horizontal on wider screens, vertical on phones.
 */
export default function HowItWorks() {
  return (
    <SectionCard id="how" eyebrow="What happens next" title={<>How it <Accent>works</Accent></>}>
      <ol className="relative grid gap-0 md:grid-cols-3 md:gap-4">
        {/* Desktop rail through the icon centres */}
        <span aria-hidden className="absolute left-[16.66%] right-[16.66%] top-[27px] hidden border-t-2 border-dashed border-[var(--gold-light)] md:block" />
        {STEPS.map(({ icon: Icon, title, text, time }, i) => (
          <li key={title} className="relative grid grid-cols-[56px_minmax(0,1fr)] gap-x-4 pb-6 last:pb-0 md:flex md:flex-col md:items-center md:pb-0 md:text-center">
            {/* Phone rail between icons */}
            {i < STEPS.length - 1 && (
              <span aria-hidden className="absolute bottom-0 left-[27px] top-14 border-l-2 border-dashed border-[var(--gold-light)] md:hidden" />
            )}
            <span className="relative z-[1] flex h-14 w-14 items-center justify-center rounded-full border border-[var(--sand)] bg-white shadow-[0_8px_20px_-12px_color-mix(in_srgb,_var(--burgundy)_50%,_transparent)]">
              <Icon size={22} strokeWidth={1.7} className="text-[var(--burgundy)]" />
              <span style={{ fontFamily: FONT_SANS }} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-[0.62rem] font-bold text-white">
                {i + 1}
              </span>
            </span>
            <div className="min-w-0 md:mt-3">
              <span style={{ fontFamily: FONT_SANS }} className="inline-block rounded-full bg-[var(--rose-light)] px-2.5 py-0.5 text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-[var(--burgundy)]">
                {time}
              </span>
              <h3 style={{ fontFamily: FONT_SERIF }} className="mt-1.5 text-[1.2rem] font-semibold leading-tight text-[var(--charcoal)]">{title}</h3>
              <p style={{ fontFamily: FONT_SANS }} className="mt-1 text-[0.84rem] leading-relaxed text-[var(--mid)] md:mx-auto md:max-w-[24ch]">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
