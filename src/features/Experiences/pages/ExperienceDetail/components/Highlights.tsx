import { Fragment } from 'react';
import { CalendarCheck, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react';
import { FONT_SANS } from '../normalize';

const ITEMS = [
  { icon: Sparkles, text: 'Set up by our team' },
  { icon: CalendarCheck, text: 'Free cancellation 24h+' },
  { icon: ShieldCheck, text: 'Verified decorators' },
  { icon: MessageSquareText, text: 'Instant confirmation' },
];

/** Our promises as one dark ribbon under the gallery, separated by small gold diamonds. */
export default function Highlights() {
  return (
    <ul
      style={{ fontFamily: FONT_SANS }}
      className="relative grid grid-cols-2 gap-x-4 gap-y-2.5 overflow-hidden rounded-[20px] bg-[var(--ink)] px-4 py-3.5 text-[0.78rem] font-medium text-white/85 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:px-5"
    >
      {/* Soft accent glow so the ribbon is not a flat block */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full"
        style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--gold) 35%, transparent), transparent)' }}
      />
      {ITEMS.map(({ icon: Icon, text }, i) => (
        <Fragment key={text}>
          {i > 0 && <li aria-hidden className="hidden h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--gold)] sm:block" />}
          <li className="relative flex items-center gap-2 leading-snug">
            <Icon size={16} strokeWidth={1.8} className="shrink-0 text-[var(--gold-bright)]" />
            {text}
          </li>
        </Fragment>
      ))}
    </ul>
  );
}
