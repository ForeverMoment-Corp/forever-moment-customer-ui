/**
 * Image loading utilities shared by the whole app.
 *
 * Layers (fastest → slowest):
 *  1. `loadedUrls`   — URLs already decoded in this tab; SmartImage skips the fade for these.
 *  2. `preloadImage` — in-flight/finished decode promises so the same URL is never fetched twice
 *                      by our own code (hover prefetch, gallery neighbours, route prefetch).
 *  3. Service worker — `public/sw.js` keeps image responses in Cache Storage across reloads.
 *  4. HTTP cache     — the API serves images with `cache-control: immutable`; Unsplash likewise.
 */

const UNSPLASH_HOST = 'images.unsplash.com';

/** Candidate widths for responsive `srcset`. Keep this list short so the browser cache hits often. */
export const SRCSET_WIDTHS = [320, 480, 640, 800, 1080, 1400] as const;

export const isUnsplash = (url: string) => url.includes(UNSPLASH_HOST);

/**
 * The platform stores three renditions of every upload under `/public/images/fetch/...`:
 * thumbnail (320px, ~140 KB), hero (1280px, ~1.7 MB) and original (~2100px, ~3.5 MB).
 *
 * These are deliberately NOT combined into a `srcset`. The thumbnail is far too small for
 * a full-bleed banner, and the browser is free to reuse an already-cached smaller candidate,
 * which visibly softened the hero. The thumbnail is used only as a blur-up placeholder; the
 * rendition in `src` is always the one that gets displayed. Real byte savings need properly
 * sized renditions from the backend, not a front-end downgrade.
 */

/**
 * Normalise a remote image URL for a given display width.
 * Unsplash supports on-the-fly resizing and format negotiation; everything else is returned as-is.
 */
export function optimizeUrl(url: string, width?: number): string {
  if (!url || !isUnsplash(url)) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('auto', 'format');
    u.searchParams.set('fit', 'crop');
    if (!u.searchParams.has('q')) u.searchParams.set('q', '75');
    if (width) u.searchParams.set('w', String(width));
    return u.toString();
  } catch {
    return url;
  }
}

/** Build a `srcset` string for hosts that support width params. Returns undefined otherwise. */
export function buildSrcSet(url: string): string | undefined {
  if (!isUnsplash(url)) return undefined;
  return SRCSET_WIDTHS.map((w) => `${optimizeUrl(url, w)} ${w}w`).join(', ');
}

/* ------------------------------------------------------------------ */
/* In-memory decode cache                                               */
/* ------------------------------------------------------------------ */

const loadedUrls = new Set<string>();
const inflight = new Map<string, Promise<void>>();

export const isLoaded = (url: string) => loadedUrls.has(url);
export const markLoaded = (url: string) => {
  loadedUrls.add(url);
};

/** Fetch + decode an image once. Safe to call repeatedly; resolves immediately if already loaded. */
export function preloadImage(url: string): Promise<void> {
  if (!url) return Promise.resolve();
  if (loadedUrls.has(url)) return Promise.resolve();
  const existing = inflight.get(url);
  if (existing) return existing;

  const p = new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    const done = () => {
      inflight.delete(url);
      resolve();
    };
    img.onload = () => {
      loadedUrls.add(url);
      done();
    };
    img.onerror = done;
    img.src = url;
  });
  inflight.set(url, p);
  return p;
}

export const preloadImages = (urls: Array<string | undefined | null>) =>
  Promise.all(urls.filter((u): u is string => !!u).map(preloadImage));

/**
 * Preload a responsive image the same way an <img srcset sizes> would, so the browser
 * picks (and caches) exactly the candidate SmartImage will request for this viewport.
 */
export function preloadResponsive(url: string, sizes = '100vw'): Promise<void> {
  const srcSet = buildSrcSet(url);
  if (!srcSet) return preloadImage(optimizeUrl(url));
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (img.currentSrc) loadedUrls.add(img.currentSrc);
      resolve();
    };
    img.onerror = () => resolve();
    img.sizes = sizes;
    img.srcset = srcSet;
    img.src = optimizeUrl(url);
  });
}

/** Skip speculative prefetching on metered or very slow connections. */
export function shouldPrefetch(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  const c = nav.connection;
  if (!c) return true;
  if (c.saveData) return false;
  return !(c.effectiveType === 'slow-2g' || c.effectiveType === '2g');
}

/**
 * Preload when the browser is idle so it never competes with the current view's own images.
 * Returns a cancel function.
 */
export function preloadWhenIdle(urls: Array<string | undefined | null>): () => void {
  let cancelled = false;
  if (!shouldPrefetch()) return () => undefined;
  const run = () => {
    if (!cancelled) void preloadImages(urls);
  };
  const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (typeof w.requestIdleCallback === 'function') {
    const id = w.requestIdleCallback(run, { timeout: 1500 });
    return () => {
      cancelled = true;
      w.cancelIdleCallback?.(id);
    };
  }
  const id = window.setTimeout(run, 300);
  return () => {
    cancelled = true;
    window.clearTimeout(id);
  };
}

/* ------------------------------------------------------------------ */
/* Service worker registration                                          */
/* ------------------------------------------------------------------ */

/** Register the image-caching service worker. Production only, so dev HMR is never affected. */
export function registerImageServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) {
    // Make sure a worker from an earlier production build on this origin is not lingering in dev.
    void navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => void r.unregister()));
    return;
  }
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      /* Caching is an enhancement; the app works without it. */
    });
  });
}
