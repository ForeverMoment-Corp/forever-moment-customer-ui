import { Check } from 'lucide-react';
import SectionCard, { ChapterNumber } from './SectionCard';
import type { ListItem } from '../types';
import { FONT_SANS, FONT_SERIF } from '../normalize';

/** The one dark moment on the page: everything in the package, with gold checks. */
export default function Inclusion({ items }: { items: ListItem[] }) {
  const included = items.filter((i) => i.isIncluded);
  const excluded = items.filter((i) => !i.isIncluded);

  return (
    <SectionCard id="included" eyebrow="Package details" title="Everything in this package" bare>
      <div className="relative overflow-hidden rounded-[24px] bg-[var(--ink)] text-white p-5 sm:p-6 grid md:grid-cols-[200px_minmax(0,1fr)] gap-5 md:gap-7">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 w-[260px] h-[260px] rounded-full"
          style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--gold) 28%, transparent), transparent)' }}
        />
        <div className="relative">
          <ChapterNumber className="!text-[var(--gold-bright)]" />
          <p style={{ fontFamily: FONT_SANS }} className="mt-2 text-[0.68rem] uppercase tracking-[0.22em] font-medium text-[var(--gold-bright)]">
            Package details
          </p>
          <h2 style={{ fontFamily: FONT_SERIF }} className="mt-1.5 text-[1.55rem] leading-[1.1] font-semibold text-white text-balance">
            Everything in this package
          </h2>
          <span className="block w-10 h-[2px] bg-[var(--gold)] mt-3" />
          <p style={{ fontFamily: FONT_SANS }} className="mt-3 text-[0.8rem] leading-relaxed text-white/65">
            {included.length} {included.length === 1 ? 'piece' : 'pieces'}, delivered and installed on-site. Nothing here is an extra.
          </p>
        </div>

        <ul className="relative grid sm:grid-cols-2 gap-x-6 gap-y-0 content-start">
          {included.map((item) => (
            <li key={item.id} style={{ fontFamily: FONT_SANS }} className="flex items-start gap-2.5 py-2.5 text-[0.88rem] leading-snug border-b border-white/10">
              <span className="shrink-0 w-[22px] h-[22px] rounded-full border border-[var(--gold)] text-[var(--gold)] flex items-center justify-center mt-px">
                <Check size={12} strokeWidth={3} />
              </span>
              {item.description}
            </li>
          ))}
          {excluded.length > 0 && (
            <li style={{ fontFamily: FONT_SANS }} className="sm:col-span-2 mt-1.5 pt-3 border-t border-dashed border-white/20 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.86rem] text-white/75">
              <span className="font-medium text-white">Not included:</span>
              {excluded.map((item) => (
                <span key={item.id}>{item.description}</span>
              ))}
              <a href="#booking-card" className="text-[var(--gold)] underline underline-offset-4">
                add from the add-ons
              </a>
            </li>
          )}
        </ul>
      </div>
    </SectionCard>
  );
}
