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
 * The section's number ("01"), from the `chapter` CSS counter reset on the content column in
 * ExperienceView, so numbering stays in sequence when a section is hidden for lack of data.
 */
export function ChapterNumber({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`tabular-nums before:content-[counter(chapter,decimal-leading-zero)] ${className}`} />;
}

/** A section of the page: a small numbered eyebrow and a serif title, separated by a hairline. */
export default function SectionCard({ id, eyebrow, title, aside, children, bare = false }: Props) {
  return (
    <section
      id={id}
      className="scroll-mt-[120px] border-t border-[var(--sand)] py-8 [counter-increment:chapter] first:border-t-0 first:pt-6 md:scroll-mt-[176px]"
    >
      {!bare && (
        <header className="mb-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p style={{ fontFamily: FONT_SANS }} className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
              <ChapterNumber className="text-[var(--gold)]" />
              <span aria-hidden className="h-px w-4 bg-[var(--gold-light)]" />
              {eyebrow}
            </p>
            <h2 style={{ fontFamily: FONT_SERIF }} className="mt-1.5 text-balance text-[1.45rem] font-semibold leading-[1.15] text-[var(--charcoal)] sm:text-[1.65rem]">
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
