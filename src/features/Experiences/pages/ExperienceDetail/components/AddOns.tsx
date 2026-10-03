import { useState } from 'react';
import { Check, ImageOff } from 'lucide-react';
import SmartImage from '@/components/common/SmartImage';
import type { AddOn } from '../types';
import { FONT_SANS, formatINR } from '../normalize';

interface Props {
  addons: AddOn[];
  toggleAddon: (id: number) => void;
}

const COLLAPSED = 3;

/** Add-ons offered with this experience, from GET /public/experiences/{id}/addons. */
export default function AddOns({ addons, toggleAddon }: Props) {
  const [open, setOpen] = useState(false);
  const hidden = addons.length - COLLAPSED;
  const visible = open || hidden <= 0 ? addons : addons.slice(0, COLLAPSED);

  return (
    <div className="divide-y divide-[var(--border-light)] overflow-hidden rounded-[14px] border border-[var(--border-light)] bg-white">
      {visible.map((addon) => {
        // The experience can price an add-on below its catalogue price.
        const discounted = !addon.isFree && addon.basePrice > addon.price && addon.price > 0;
        return (
          <button
            key={addon.id}
            type="button"
            onClick={() => toggleAddon(addon.id)}
            aria-pressed={addon.added}
            className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
              addon.added ? 'bg-[var(--rose-light)]/70' : 'hover:bg-[var(--cream)]'
            }`}
          >
            <span
              className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] border transition-colors ${
                addon.added ? 'border-[var(--burgundy)] bg-[var(--burgundy)] text-white' : 'border-[var(--border-light)] text-transparent'
              }`}
            >
              <Check size={12} strokeWidth={3} />
            </span>

            <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-[var(--cream)]">
              {addon.thumbnailUrl ? (
                <SmartImage src={addon.thumbnailUrl} alt="" sizes="36px" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  <ImageOff size={13} className="text-[var(--mid)] opacity-60" />
                </span>
              )}
            </span>

            <span style={{ fontFamily: FONT_SANS }} className="min-w-0 flex-1">
              <span className="block truncate text-[0.88rem] font-medium capitalize text-[var(--charcoal)]">{addon.name}</span>
              {addon.description && <span className="block truncate text-[0.74rem] text-[var(--mid)]">{addon.description}</span>}
            </span>

            <span style={{ fontFamily: FONT_SANS }} className="shrink-0 text-right">
              {addon.isFree ? (
                <span className="rounded-full bg-[#EAF3EA] px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#3F7A3F]">
                  Free
                </span>
              ) : (
                <>
                  <span className={`block text-[0.84rem] tabular-nums ${addon.added ? 'font-semibold text-[var(--burgundy)]' : 'text-[var(--mid)]'}`}>
                    + {formatINR(addon.price)}
                  </span>
                  {discounted && (
                    <span className="block text-[0.68rem] text-[var(--mid)] line-through tabular-nums">{formatINR(addon.basePrice)}</span>
                  )}
                </>
              )}
            </span>
          </button>
        );
      })}

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{ fontFamily: FONT_SANS }}
          className="w-full bg-[var(--cream)] px-4 py-2.5 text-[0.78rem] font-semibold text-[var(--burgundy)] transition-colors hover:bg-[var(--rose-light)]"
        >
          {open ? 'Show fewer' : `${hidden} more add-on${hidden === 1 ? '' : 's'}`}
        </button>
      )}
    </div>
  );
}
