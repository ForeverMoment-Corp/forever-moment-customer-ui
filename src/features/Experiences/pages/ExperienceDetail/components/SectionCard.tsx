import type { ReactNode } from 'react';
import { FONT_SANS, FONT_SERIF } from '../normalize';

interface Props {
  id: string;
  eyebrow: string;
  title: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  /** Set when the section's own content is the surface (e.g. the dark inclusions block). */
  bare?: boolean;
}

/** Editorial section: eyebrow + serif heading, hairline divider below. */
export default function SectionCard({ id, eyebrow, title, aside, children, bare = false }: Props) {
  return (
    <section id={id} className="scroll-mt-[120px] md:scroll-mt-[168px] py-6 sm:py-7 border-b border-[var(--border-light)] last:border-b-0">
      {!bare && (
        <header className="flex items-end justify-between gap-4 mb-4">
          <div className="min-w-0">
            <p style={{ fontFamily: FONT_SANS }} className="text-[0.64rem] uppercase tracking-[0.2em] font-medium text-[#A8853F]">
              {eyebrow}
            </p>
            <h2 style={{ fontFamily: FONT_SERIF }} className="mt-1 text-[1.45rem] sm:text-[1.7rem] leading-[1.1] font-semibold text-[var(--charcoal)] text-balance">
              {title}
            </h2>
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export function Accent({ children }: { children: ReactNode }) {
  return <em className="font-medium italic text-[var(--burgundy)]">{children}</em>;
}
