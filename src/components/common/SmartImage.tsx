import { useEffect, useState } from 'react';
import type { ImgHTMLAttributes, SyntheticEvent } from 'react';
import { buildSrcSet, isLoaded, markLoaded, optimizeUrl, preloadImage } from '@/lib/images';

export interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'loading'> {
  src: string;
  /** Above-the-fold / LCP image: eager, high fetch priority, no fade. */
  priority?: boolean;
  /** Low-res version shown immediately and swapped once `src` has decoded (blur-up). */
  placeholderSrc?: string;
  /** Shown if `src` fails to load. */
  fallbackSrc?: string;
  /** `sizes` hint for responsive sources. Defaults to a sensible card width. */
  sizes?: string;
  /** Disable the fade-in (e.g. inside animated containers that handle their own transition). */
  noFade?: boolean;
}

const FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#f5e6e4"/></svg>`,
);

/**
 * Drop-in replacement for <img>.
 *
 *  - lazy + async decoding by default, eager + high priority when `priority` is set
 *  - responsive `srcset` for hosts that support resizing (Unsplash)
 *  - warm cream placeholder background and a short fade-in on first decode
 *  - skips the fade when the URL was already decoded in this session (no flicker on back-nav)
 *  - optional blur-up from a low-res `placeholderSrc`
 *  - graceful fallback on error
 */
export default function SmartImage({
  src,
  priority = false,
  placeholderSrc,
  fallbackSrc = FALLBACK,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  noFade = false,
  className = '',
  style,
  onLoad,
  onError,
  alt = '',
  ...rest
}: SmartImageProps) {
  const optimized = optimizeUrl(src);
  const alreadyLoaded = isLoaded(optimized);
  const usePlaceholder = !!placeholderSrc && !alreadyLoaded;

  const [ready, setReady] = useState(alreadyLoaded || priority);
  const [failed, setFailed] = useState(false);
  const [showFull, setShowFull] = useState(!usePlaceholder);

  // Blur-up: decode the full image in the background, then swap it in.
  useEffect(() => {
    if (!usePlaceholder) return;
    let cancelled = false;
    void preloadImage(optimized).then(() => {
      if (!cancelled) setShowFull(true);
    });
    return () => {
      cancelled = true;
    };
  }, [optimized, usePlaceholder]);

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (e.currentTarget.currentSrc === optimized || e.currentTarget.src === optimized || !usePlaceholder) {
      markLoaded(optimized);
      setReady(true);
    }
    onLoad?.(e);
  };

  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    setFailed(true);
    setReady(true);
    onError?.(e);
  };

  const currentSrc = failed ? fallbackSrc : showFull ? optimized : placeholderSrc!;
  const srcSet = !failed && showFull ? buildSrcSet(src) : undefined;
  const fade = !noFade && !priority;

  return (
    <img
      {...rest}
      alt={alt}
      src={currentSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      loading={priority ? 'eager' : 'lazy'}
      // Priority images decode synchronously so they paint with the first frame (better LCP).
      decoding={priority ? 'sync' : 'async'}
      // React 19 supports the camelCase attribute name.
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={handleLoad}
      onError={handleError}
      className={className}
      style={{
        backgroundColor: 'var(--rose-light, #f5e6e4)',
        ...(fade ? { opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease-out' } : null),
        ...(usePlaceholder && !showFull ? { filter: 'blur(12px)', transform: 'scale(1.04)' } : null),
        ...(usePlaceholder && showFull ? { filter: 'blur(0)', transform: 'scale(1)', transition: 'filter 0.4s ease-out, transform 0.4s ease-out, opacity 0.4s ease-out' } : null),
        ...style,
      }}
    />
  );
}
