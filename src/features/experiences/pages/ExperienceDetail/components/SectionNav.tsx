import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FONT_SANS } from '../normalize';

export interface SectionNavItem {
  id: string;
  label: string;
  count?: number;
}

/**
 * Sticky section bar for the content column. The active section is tracked by an
 * IntersectionObserver and marked by a pill that slides between the labels.
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
    <nav aria-label="Page sections" className="sticky top-[64px] z-30 -mx-4 px-4 py-2 sm:mx-0 sm:px-0 md:top-[112px]">
      <div className="relative">
        <div
          ref={stripRef}
          className="flex gap-1 overflow-x-auto scrollbar-hide rounded-full border border-[var(--sand)] bg-white/90 p-1 backdrop-blur-md"
        >
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
                className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.76rem] font-medium transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-[var(--mid)] hover:text-[var(--charcoal)]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="section-nav-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    className="absolute inset-0 rounded-full bg-[var(--ink)]"
                  />
                )}
                <span className="relative">{item.label}</span>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`relative inline-flex h-[1.2rem] min-w-[1.2rem] items-center justify-center rounded-full px-1.5 text-[0.6rem] font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[var(--rose-light)] text-[var(--burgundy)]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
