import { ArrowRight } from 'lucide-react';
import { FONT_SANS, FONT_SERIF, formatINR } from '../normalize';

interface Props {
  totalPrice: number;
  originalPrice: number;
  discount: number;
  onBook: () => void;
}

// Sticky price + CTA for phones and tablets; sits above the bottom nav on phones.
export default function MobileBookingBar({ totalPrice, originalPrice, discount, onBook }: Props) {
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-[60px] md:bottom-0 z-[95] bg-white/95 backdrop-blur-md border-t border-[var(--border-light)] shadow-[0_-12px_30px_color-mix(in_srgb,_var(--ink)_8%,_transparent)]">
      <div className="max-w-[var(--container-width)] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p style={{ fontFamily: FONT_SANS }} className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--mid)]">Total</p>
          <p className="flex items-baseline gap-1.5">
            <span style={{ fontFamily: FONT_SERIF }} className="text-[1.5rem] leading-none font-bold text-[var(--charcoal)] tabular-nums">
              {formatINR(totalPrice)}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={onBook}
          style={{ fontFamily: FONT_SANS, background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-dark))' }}
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-2xl pl-5 pr-1.5 text-[0.9rem] font-semibold text-white shadow-[0_10px_24px_-8px_color-mix(in_srgb,_var(--burgundy)_60%,_transparent)] transition active:scale-[0.98]"
        >
          Plan &amp; book
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <ArrowRight size={16} />
          </span>
        </button>
      </div>
    </div>
  );
}
