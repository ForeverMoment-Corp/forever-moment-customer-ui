import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import SmartImage from '@/components/common/SmartImage';
import { preloadImages } from '@/lib/images';
import type { MediaItem } from '../types';
import { FONT_SANS } from '../normalize';

interface GalleryProps {
  media: MediaItem[];
  name: string;
}

function RoundButton({
  onClick,
  label,
  className = '',
  children,
}: {
  onClick: () => void;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-11 h-11 rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(26,18,8,0.18)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 bg-white/95 text-[var(--charcoal)] hover:bg-white ${className}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Slider gallery: thumbnail rail + main image with overlays            */
/* ------------------------------------------------------------------ */

export default function Gallery({ media, name }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = media.length;
  const current = media[Math.min(index, count - 1)];

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  // Preload neighbouring images so arrows feel instant.
  useEffect(() => {
    void preloadImages([media[(index - 1 + count) % count]?.heroUrl, media[(index + 1) % count]?.heroUrl]);
  }, [index, media, count]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40 && count > 1) go(dx < 0 ? 1 : -1);
  };

  if (!current) return null;

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4">
      {/* Thumbnail rail: horizontal under the photo on mobile, vertical on the left from md up */}
      {count > 1 && (
        <div className="order-2 md:order-1 flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto scrollbar-hide md:w-[88px] md:max-h-[600px] shrink-0 p-1 -m-1">
          {media.map((item, i) => {
            const isActive = i === index;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`View photo ${i + 1} of ${count}`}
                aria-current={isActive}
                className={`relative shrink-0 w-[72px] h-[72px] md:w-full md:h-[80px] rounded-xl overflow-hidden transition-all duration-300 ${
                  isActive ? 'ring-2 ring-[var(--burgundy)] ring-offset-2 ring-offset-[var(--bg-main)]' : 'opacity-65 hover:opacity-100'
                }`}
              >
                <SmartImage src={item.thumbnailUrl} alt="" sizes="88px" className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}

      {/* Main image */}
      <div className="order-1 md:order-2 relative flex-1 min-w-0">
        <div
          className="relative aspect-[4/3] md:aspect-[5/4] rounded-3xl overflow-hidden bg-[var(--rose-light)] shadow-[0_20px_50px_rgba(124,45,59,0.12)]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              onClick={() => setViewerOpen(true)}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0 cursor-zoom-in"
            >
              {/* Blur-up from the small thumbnail (already cached by the rail) while the large hero arrives */}
              <SmartImage
                src={current.heroUrl}
                placeholderSrc={current.thumbnailUrl !== current.heroUrl ? current.thumbnailUrl : undefined}
                alt={current.alt}
                priority={index === 0}
                noFade
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            </motion.div>
          </AnimatePresence>

          {/* Soft gradients so overlays stay legible on any photo */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/35 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Prev / next */}
          {count > 1 && (
            <>
              <RoundButton onClick={() => go(-1)} label="Previous photo" className="absolute left-4 top-1/2 -translate-y-1/2">
                <ChevronLeft size={22} />
              </RoundButton>
              <RoundButton onClick={() => go(1)} label="Next photo" className="absolute right-4 top-1/2 -translate-y-1/2">
                <ChevronRight size={22} />
              </RoundButton>
            </>
          )}

          {/* View full */}
          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            style={{ fontFamily: FONT_SANS }}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-[rgba(44,36,32,0.72)] backdrop-blur-md text-white px-4 py-2.5 text-[0.82rem] font-medium hover:bg-[var(--charcoal)] transition"
          >
            <Maximize2 size={15} />
            {index + 1}/{count} · View full
          </button>
        </div>
      </div>

      {/* Portal to <body> so the fixed navbar's stacking context can't sit above the viewer */}
      {createPortal(
        <AnimatePresence>
          {viewerOpen && (
            <Viewer media={media} index={index} setIndex={setIndex} onClose={() => setViewerOpen(false)} name={name} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Full-screen viewer: just the photos                                  */
/* ------------------------------------------------------------------ */

interface ViewerProps {
  media: MediaItem[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
  name: string;
}

function Viewer({ media, index, setIndex, onClose, name }: ViewerProps) {
  const count = media.length;
  const current = media[index];
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      setZoom(null);
      setIndex((index + delta + count) % count);
    },
    [index, count, setIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [go, onClose]);

  // Preload neighbours so arrows feel instant.
  useEffect(() => {
    void preloadImages([media[(index - 1 + count) % count]?.originalUrl, media[(index + 1) % count]?.originalUrl]);
  }, [index, media, count]);

  const toggleZoom = (e: React.MouseEvent<HTMLImageElement>) => {
    if (zoom) {
      setZoom(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40 && count > 1) go(dx < 0 ? 1 : -1);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} photos`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[300] bg-[#1a1208] text-white flex flex-col"
    >
      {/* Floating counter + close */}
      <span
        style={{ fontFamily: FONT_SANS }}
        className="absolute top-4 left-4 z-10 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 text-[0.8rem] text-white/85"
      >
        <span className="font-semibold text-white">{index + 1}</span> / {count}
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition"
      >
        <X size={20} />
      </button>

      {/* Stage */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-3 sm:px-16 pt-16 pb-4 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={onClose}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: zoom ? 2 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            className="max-h-full max-w-full flex items-center justify-center"
          >
              {/* Blur-up from the hero size (already cached by the slider) to the original */}
              <SmartImage
                src={current.originalUrl}
                placeholderSrc={current.heroUrl}
                alt={current.alt}
                priority
                sizes="100vw"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleZoom(e);
                }}
                className={`max-h-[calc(100vh-170px)] max-w-full object-contain rounded-2xl shadow-2xl select-none ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                draggable={false}
              />
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Previous photo"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-[var(--cream)] hover:text-[var(--charcoal)] flex items-center justify-center transition"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Next photo"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-[var(--cream)] hover:text-[var(--charcoal)] flex items-center justify-center transition"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {/* Filmstrip */}
      {count > 1 && (
        <div className="shrink-0 flex justify-center gap-2 px-4 pb-5 pt-1 overflow-x-auto scrollbar-hide">
          {media.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setZoom(null);
                setIndex(i);
              }}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === index}
              className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all ${
                i === index ? 'ring-2 ring-[var(--gold)] opacity-100 scale-105' : 'opacity-45 hover:opacity-90'
              }`}
            >
              <SmartImage src={item.thumbnailUrl} alt="" sizes="56px" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
