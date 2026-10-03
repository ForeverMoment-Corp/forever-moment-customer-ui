import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SmartImage from '@/components/common/SmartImage';
import type { CategoryImage } from '@/features/category/utils/categoryImage';

interface Props {
  images: CategoryImage[];
  name: string;
  /** Rendered over the slider: the icon, price pill and title. */
  children?: React.ReactNode;
}

/** Dots are capped so a category with many photos keeps a tidy strip. */
const MAX_DOTS = 8;

/**
 * Image slider for a category card. It sits inside a card that is itself a link,
 * so every control stops its event rather than navigating away.
 */
export default function CategoryCover({ images, name, children }: Props) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  const go = (dir: number) => (ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    setIndex((prev) => (prev + dir + count) % count);
  };

  const jump = (i: number) => (ev: React.MouseEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    setIndex(i);
  };

  const safeIndex = count > 0 ? Math.min(index, count - 1) : 0;
  const current = images[safeIndex];
  const dots = images.slice(0, MAX_DOTS);

  return (
    <div className="relative h-48 overflow-hidden">
      {current ? (
        <SmartImage
          key={current.hero}
          src={current.hero}
          placeholderSrc={current.thumbnail !== current.hero ? current.thumbnail : undefined}
          alt={current.alt}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
      ) : (
        <div role="img" aria-label={`${name} (no photo yet)`} className="h-full w-full bg-[var(--rose-light)]" />
      )}

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to top, color-mix(in srgb, var(--ink) 75%, transparent) 0%, color-mix(in srgb, var(--ink) 15%, transparent) 55%, transparent 100%)' }}
      />

      {children}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={go(-1)}
            aria-label={`Previous ${name} photo`}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[var(--charcoal)] opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={go(1)}
            aria-label={`Next ${name} photo`}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[var(--charcoal)] opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-white focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ChevronRight size={16} />
          </button>

          <div className="absolute inset-x-0 top-3 flex items-center justify-center gap-1.5 px-12">
            {dots.map((img, i) => (
              <button
                key={img.hero}
                type="button"
                onClick={jump(i)}
                aria-label={`Show ${name} photo ${i + 1} of ${count}`}
                aria-current={i === safeIndex}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === safeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/85'
                }`}
              />
            ))}
            {count > MAX_DOTS && (
              <span className="ml-1 text-[0.62rem] font-medium text-white/80">+{count - MAX_DOTS}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
