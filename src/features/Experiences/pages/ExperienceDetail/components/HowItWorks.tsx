import SectionCard, { Accent } from './SectionCard';
import { FONT_SANS, FONT_SERIF } from '../normalize';

const STEPS = [
  { title: 'Pick a date and slot', text: 'Choose when you want the room ready. Pay securely and get an instant confirmation on WhatsApp.', time: '2 minutes' },
  { title: 'We arrive and set up', text: 'Our decorators arrive about two hours before your slot with everything in the package.', time: '2 hrs before' },
  { title: 'You celebrate', text: 'Walk in, light the candles, and enjoy. We come back afterwards to take it all down.', time: 'Your moment' },
];

export default function HowItWorks() {
  return (
    <SectionCard id="how" eyebrow="What happens next" title={<>How it <Accent>works</Accent></>}>
      <ol className="grid md:grid-cols-3 gap-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="rounded-[16px] bg-white border border-[var(--border-light)] p-4">
            <span style={{ fontFamily: FONT_SERIF }} className="text-[1.15rem] italic text-[var(--gold)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 style={{ fontFamily: FONT_SERIF }} className="mt-1 text-[1.15rem] font-semibold leading-tight text-[var(--charcoal)]">
              {s.title}
            </h3>
            <p style={{ fontFamily: FONT_SANS }} className="mt-1 text-[0.82rem] leading-relaxed text-[var(--mid)]">
              {s.text}
            </p>
            <span style={{ fontFamily: FONT_SANS }} className="mt-2.5 inline-block rounded-full bg-[var(--rose-light)] text-[var(--burgundy)] text-[0.68rem] uppercase tracking-[0.08em] font-semibold px-2.5 py-1">
              {s.time}
            </span>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
