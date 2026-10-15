import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

interface SectionHeadingProps {
  /** Small uppercase line above the title, e.g. "Every occasion". */
  eyebrow?: string;
  /** Title text before the accent, e.g. "Browse by" (or any content, using <Accent> mid-title). */
  title: ReactNode;
  /** Last word(s) in italic burgundy, e.g. "category". */
  accent?: string;
  /** "View all" style link on the right (left-aligned headings only). */
  link?: { to: string; label: string };
  align?: 'left' | 'center';
  /** "sm" for a compact strip (e.g. Popular collections) sitting between larger sections. */
  size?: 'md' | 'sm';
}

/** Italic burgundy emphasis inside a title: <>Most <Accent>loved</Accent> experiences</> */
export const Accent = ({ children }: { children: ReactNode }) => <em className="italic text-[var(--burgundy)]">{children}</em>;

/**
 * The one heading style for home page sections: same label, title, accent and link everywhere,
 * so the sections read as one page instead of each having its own typography.
 */
export default function SectionHeading({ eyebrow, title, accent, link, align = 'left', size = 'md' }: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <div
      className={`flex gap-4 ${centered ? 'flex-col items-center text-center' : 'items-end justify-between'} ${size === 'sm' ? 'mb-3' : 'mb-6'}`}
      style={{ fontFamily: SANS }}
    >
      <div className="min-w-0">
        {eyebrow && size === 'md' && (
          <p className="mb-1.5 text-[0.66rem] font-medium uppercase tracking-[0.22em] text-umber">{eyebrow}</p>
        )}
        <h2
          style={{ fontFamily: SERIF }}
          className={`font-semibold leading-tight text-ink ${size === 'sm' ? 'text-[1.2rem] md:text-[1.35rem]' : 'text-[1.6rem] md:text-[1.95rem]'}`}
        >
          {title}
          {accent && (
            <>
              {' '}
              <Accent>{accent}</Accent>
            </>
          )}
        </h2>
      </div>
      {link && !centered && (
        <Link
          to={link.to}
          className="group inline-flex shrink-0 items-center gap-1.5 pb-1 text-[0.74rem] font-medium uppercase tracking-[0.1em] text-gold transition-colors hover:text-ink"
        >
          {link.label}
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
