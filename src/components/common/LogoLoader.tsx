import { CUSTOMER_CONFIG } from '@/config/constants';

interface LogoLoaderProps {
  /** Fill the viewport (first load) instead of just the space it is given. */
  fullScreen?: boolean;
  /** Screen-reader text; the loader itself has no visible words. */
  label?: string;
  className?: string;
}

/**
 * Brand loader: the logo mark breathing gently over a slim gold bar.
 * Uses /logo-mark.webp (19 KB; /logo-mark.png is the 102 KB original), the logo cropped to its mark (public/logo.png is the square version with padding).
 */
export default function LogoLoader({ fullScreen = false, label = 'Loading', className = '' }: LogoLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-5 ${fullScreen ? 'min-h-screen' : 'min-h-[50vh]'} ${className}`}
      style={{ background: 'var(--cream)' }}
    >
      <img src="/logo-mark.webp" alt="" aria-hidden="true" width={320} height={162} className="logo-loader-mark h-auto w-28 sm:w-32" />
      <span aria-hidden="true" className="relative block h-[2px] w-24 overflow-hidden rounded-full bg-[var(--gold-light)]/40">
        <span className="logo-loader-bar absolute inset-y-0 left-0 w-2/5 rounded-full bg-[var(--gold)]" />
      </span>
      <span className="sr-only">
        {label} {CUSTOMER_CONFIG.name}
      </span>
    </div>
  );
}
