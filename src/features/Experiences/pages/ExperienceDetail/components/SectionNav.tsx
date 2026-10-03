import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FONT_SANS } from '../normalize';

export interface SectionNavItem {
  id: string;
  label: string;
  count?: number;
}

/**
 * Sticky tab strip for the content column. The active tab is tracked by an
 * IntersectionObserver and marked with a sliding gold underline.
 */
export default function SectionNav({ items }: { items: SectionNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const stripRef = useRef<HTMLDivElement>(null);
  // While a click-triggered smooth scroll is in flight, ignore observer updates so
  // the underline does not hop through every section on the way.
  const locked = useRef(false);
  const lockTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(lockTimer.current), []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (locked.current) return;
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  // Keep the active tab visible when the strip scrolls horizontally on phones.
  useEffect(() => {
    const strip = stripRef.current;
    const btn = strip?.querySelector<HTMLButtonElement>(`[data-section="${active}"]`);
    if (!strip || !btn) return;
    const left = btn.offsetLeft - strip.clientWidth / 2 + btn.clientWidth / 2;
    strip.scrollTo({ left, behavior: 'smooth' });
  }, [active]);

  const scrollTo = (id: string) => {
    locked.current = true;
    window.clearTimeout(lockTimer.current);
    lockTimer.current = window.setTimeout(() => {
      locked.current = false;
    }, 800);
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Page sections"
      className="sticky top-[64px] md:top-[112px] z-30 -mx-4 px-4 sm:mx-0 sm:px-0 bg-[var(--bg-main)]/95 backdrop-blur-md mt-3"
    >
      <div className="relative">
      <div ref={stripRef} className="flex gap-0.5 overflow-x-auto scrollbar-hide border-b border-[var(--border-light)]">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-section={item.id}
              onClick={() => scrollTo(item.id)}
              aria-current={isActive ? 'true' : undefined}
              style={{ fontFamily: FONT_SANS }}
              className={`relative shrink-0 flex items-center gap-1.5 px-3 py-3 text-[0.74rem] uppercase tracking-[0.1em] font-medium transition-colors duration-300 ${
                isActive ? 'text-[var(--burgundy)]' : 'text-[var(--mid)] hover:text-[var(--charcoal)]'
              }`}
            >
              {item.label}
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`inline-flex min-w-[1.3rem] h-[1.3rem] items-center justify-center rounded-full px-1.5 text-[0.62rem] font-semibold tracking-normal transition-colors ${
                    isActive ? 'bg-[var(--burgundy)] text-white' : 'bg-[var(--rose-light)] text-[var(--burgundy)]'
                  }`}
                >
                  {item.count}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId="section-nav-underline"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  className="absolute left-3 right-3 -bottom-px h-[2px] rounded-full bg-[var(--burgundy)]"
                />
              )}
            </button>
          );
        })}
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--bg-main)] to-transparent sm:hidden" />
      </div>
    </nav>
  );
}
