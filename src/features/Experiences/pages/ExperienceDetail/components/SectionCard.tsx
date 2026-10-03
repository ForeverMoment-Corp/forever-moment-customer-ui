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

/**
 * The large italic number for the current chapter. Sections are numbered with a CSS counter
 * (`chapter`, reset on the content column in ExperienceView), so the numbers stay in sequence
 * when a section is hidden for lack of data.
 */
export function ChapterNumber({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      style={{ fontFamily: FONT_SERIF }}
      className={`select-none text-[2.6rem] font-medium italic leading-none text-[var(--gold)] before:content-[counter(chapter,decimal-leading-zero)] sm:text-[3rem] ${className}`}
    />
  );
}

/** A chapter of the page: big italic number, eyebrow and serif title, then the content. */
export default function SectionCard({ id, eyebrow, title, aside, children, bare = false }: Props) {
  return (
    <section id={id} className="scroll-mt-[120px] py-7 [counter-increment:chapter] sm:py-9 md:scroll-mt-[176px]">
      {!bare && (
        <header className="mb-5 flex items-end justify-between gap-4">
          <div className="flex min-w-0 items-end gap-3.5">
            <ChapterNumber className="-mb-1" />
            <div className="min-w-0 border-l border-[var(--sand)] pl-3.5">
              <p style={{ fontFamily: FONT_SANS }} className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold-deep">
                {eyebrow}
              </p>
              <h2 style={{ fontFamily: FONT_SERIF }} className="mt-0.5 text-balance text-[1.45rem] font-semibold leading-[1.1] text-[var(--charcoal)] sm:text-[1.75rem]">
                {title}
              </h2>
            </div>
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
