import { useState } from 'react';
import { Check, ChevronDown, ImageOff, Plus } from 'lucide-react';
import SectionCard, { Accent } from './SectionCard';
import SmartImage from '@/components/common/SmartImage';
import type { AddOn } from '../types';
import { FONT_SANS, formatINR } from '../normalize';

interface Props {
  /** Catalogue add-ons that are not already part of this experience. */
  items: AddOn[];
  toggleAddon: (id: number) => void;
  /** Scrolls to the booking panel so the guest can review what they picked. */
  onReview: () => void;
}

/** Rows shown before the list collapses, at the widest column (5 per row). */
const COLLAPSED_ROWS = 2;
const PER_ROW = 5;

/**
 * The rest of the add-on catalogue as small tiles, so a long list stays browsable.
 * Anything added here joins the booking total alongside the experience's own add-ons.
 */
export default function MoreAddOns({ items, toggleAddon, onReview }: Props) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const limit = COLLAPSED_ROWS * PER_ROW;
  const hidden = items.length - limit;
  const visible = expanded || hidden <= 0 ? items : items.slice(0, limit);

  const added = items.filter((a) => a.added);
  const addedTotal = added.reduce((sum, a) => sum + a.price, 0);

  return (
    <SectionCard
      id="addons"
      eyebrow="Make it extra special"
      title={<>More add-ons you can <Accent>choose from</Accent></>}
      aside={
        added.length > 0 ? (
          <button
            type="button"
            onClick={onReview}
            style={{ fontFamily: FONT_SANS }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--burgundy)] px-3 py-1.5 text-[0.74rem] font-semibold text-white transition-colors hover:bg-[var(--burgundy-dark)]"
          >
            {added.length} added · {formatINR(addedTotal)}
          </button>
        ) : (
          <span style={{ fontFamily: FONT_SANS }} className="whitespace-nowrap text-[0.74rem] text-[var(--mid)]">
            {items.length} available
          </span>
        )
      }
    >
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {visible.map((addon) => {
          const discounted = !addon.isFree && addon.basePrice > addon.price && addon.price > 0;
          return (
            <li key={addon.id}>
              <button
                type="button"
                onClick={() => toggleAddon(addon.id)}
                aria-pressed={addon.added}
                aria-label={addon.added ? `Remove ${addon.name} from booking` : `Add ${addon.name} to booking`}
                title={addon.description || addon.name}
                className={`group flex h-full w-full flex-col overflow-hidden rounded-xl border bg-white text-left transition-colors ${
                  addon.added ? 'border-[var(--burgundy)] ring-1 ring-[var(--burgundy)]' : 'border-[var(--border-light)] hover:border-[var(--gold)]'
                }`}
              >
                <span className="relative block aspect-square overflow-hidden bg-[var(--rose-light)]">
                  {addon.thumbnailUrl ? (
                    <SmartImage src={addon.thumbnailUrl} alt={addon.name} sizes="140px" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <ImageOff size={16} className="text-[var(--mid)] opacity-60" />
                    </span>
                  )}
                  <span
                    className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full shadow-sm transition-colors ${
                      addon.added ? 'bg-[var(--burgundy)] text-white' : 'bg-white/95 text-[var(--burgundy)] group-hover:bg-white'
                    }`}
                  >
                    {addon.added ? <Check size={13} strokeWidth={3} /> : <Plus size={14} strokeWidth={2.5} />}
                  </span>
                </span>

                <span style={{ fontFamily: FONT_SANS }} className="flex flex-1 flex-col px-2 py-1.5">
                  <span className="block truncate text-[0.76rem] font-medium capitalize leading-tight text-[var(--charcoal)]">
                    {addon.name}
                  </span>
                  <span className="mt-0.5 flex items-baseline gap-1">
                    {addon.isFree ? (
                      <span className="text-[0.72rem] font-semibold text-leaf">Free</span>
                    ) : (
                      <>
                        <span className="text-[0.78rem] font-semibold text-[var(--charcoal)] tabular-nums">{formatINR(addon.price)}</span>
                        {discounted && (
                          <span className="text-[0.66rem] text-[var(--mid)] line-through tabular-nums">{formatINR(addon.basePrice)}</span>
                        )}
                      </>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{ fontFamily: FONT_SANS }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-white px-4 py-1.5 text-[0.76rem] font-semibold text-[var(--burgundy)] transition-colors hover:border-[var(--gold)]"
        >
          {expanded ? 'Show fewer' : `Show all ${items.length}`}
          <ChevronDown size={14} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </SectionCard>
  );
}
