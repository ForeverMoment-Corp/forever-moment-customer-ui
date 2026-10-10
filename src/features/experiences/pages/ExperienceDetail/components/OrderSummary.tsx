import type { AddOn } from '../types';
import { FONT_SANS, formatINR } from '../normalize';

interface Props {
  basePrice: number;
  originalPrice: number;
  addons: AddOn[];
  couponDiscount?: number;
}

export default function OrderSummary({ basePrice, originalPrice, addons, couponDiscount = 0 }: Props) {
  // `addons` already holds only what the guest ticked, from the panel or the catalogue section.
  const selected = addons.filter((a) => a.added);
  const addonsTotal = selected.reduce((sum, a) => sum + a.price, 0);
  const total = Math.max(0, basePrice + addonsTotal - couponDiscount);

  return (
    <dl style={{ fontFamily: FONT_SANS }} className="pt-3 border-t border-[var(--border-light)] text-[0.86rem] space-y-1.5">
      <div className="flex justify-between text-[var(--charcoal)]">
        <dt>Package</dt>
        <dd className="tabular-nums">{formatINR(basePrice)}</dd>
      </div>
      {selected.map((a) => (
        <div key={a.id} className="flex justify-between gap-3 text-[var(--charcoal)]">
          <dt className="truncate capitalize">{a.name}</dt>
          <dd className="shrink-0 tabular-nums">{a.isFree ? 'Free' : formatINR(a.price)}</dd>
        </div>
      ))}
      {couponDiscount > 0 && (
        <div className="flex justify-between text-leaf">
          <dt>Coupon discount</dt>
          <dd className="tabular-nums">− {formatINR(couponDiscount)}</dd>
        </div>
      )}
      <div className="pt-2.5 border-t border-[var(--border-light)] flex items-baseline justify-between font-semibold">
        <dt>
          Total <span className="ml-1.5 text-[0.74rem] font-normal text-[var(--mid)]">incl. taxes</span>
        </dt>
        <dd style={{ fontFamily: FONT_SANS }} className="text-[1.2rem] font-semibold text-[var(--charcoal)] tabular-nums">
          {formatINR(total)}
        </dd>
      </div>
    </dl>
  );
}
