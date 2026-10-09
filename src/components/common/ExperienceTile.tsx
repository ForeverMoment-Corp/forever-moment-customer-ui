import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Heart, ImageOff, Star, Users } from 'lucide-react';
import SmartImage from '@/components/common/SmartImage';
import { getPrimaryImage, getPrimaryThumbnail } from '@/features/experiences/utils/primaryImage';
import { experiencePath } from '@/features/experiences/utils/slug';
import { formatDuration, formatINR } from '@/features/experiences/pages/ExperienceDetail/normalize';
import { toPlainText } from '@/lib/html';
import type { ExperienceListItem } from '@/features/experiences/store/types';
import { useRequireAuth } from '@/features/auth/hooks/useRequireAuth';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

// Reviews are not served by the API yet; mirrors the placeholder used on the detail page.
const PLACEHOLDER_RATING = 4.8;
const PLACEHOLDER_REVIEWS = 124;

export interface ExperienceTileProps {
  experience: ExperienceListItem;
  isLiked?: boolean;
  onToggleLike?: (id: number) => void;
  /** Lazy-loading hint; the first row of a grid should be eager. */
  priority?: boolean;
  /**
   * Short reason this card is being shown, e.g. "Same collection" in the related row.
   * Replaces the collection eyebrow, which would otherwise repeat the section heading.
   */
  note?: string;
}

/**
 * Compact catalogue card: 4:3 photo, collection, name, the facts a guest compares on
 * (rating, setup time, capacity), a one-line description and the price with its saving.
 * The whole tile is the link; there is no per-card button.
 */
export default function ExperienceTile({ experience: e, isLiked = false, onToggleLike, priority = false, note }: ExperienceTileProps) {
  const requireAuth = useRequireAuth();
  const image = getPrimaryImage(e);
  // Pairing the thumbnail with the hero lets the browser fetch the 320px rendition for a card.
  const thumbnail = getPrimaryThumbnail(e);
  const price = Number(e.basePrice) || 0;
  // Same derived launch offer as the detail page until the API serves an original price.
  const original = Math.round(price * 1.25);
  const discount = original > price ? Math.round(((original - price) / original) * 100) : 0;
  // Summaries may carry markup; a card shows one line of readable text.
  const description = toPlainText(e.shortDescription);
  const showDescription = description.length > 12 && description.toLowerCase() !== (e.name || '').toLowerCase();
  const duration = Number(e.durationMinutes) || 0;
  // The badge shows the experience's own tag. No tag means no badge.
  const tag = (e.tagName || '').trim();
  const capacity = Number(e.maxCapacity) || 0;

  return (
    <Link
      to={experiencePath(e)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_color-mix(in_srgb,_var(--burgundy)_35%,_transparent)] hover:border-[var(--gold-light)]"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--rose-light)]">
        {image ? (
          <SmartImage
            src={image}
            placeholderSrc={thumbnail || undefined}
            alt={e.imageAltText || e.name}
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 320px"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div role="img" aria-label={`${e.name} (no photo yet)`} className="flex h-full w-full items-center justify-center">
            <ImageOff size={24} className="text-[var(--mid)] opacity-60" />
          </div>
        )}

        {tag && (
          <span
            style={{ fontFamily: SANS }}
            className="absolute left-2.5 top-2.5 rounded-full bg-[var(--burgundy)] px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white shadow-sm"
          >
            {tag}
          </span>
        )}

        {onToggleLike && (
          <button
            type="button"
            aria-pressed={isLiked}
            aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              requireAuth(() => onToggleLike(e.id));
            }}
            className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition-colors ${isLiked ? 'bg-[var(--burgundy)] text-white' : 'bg-white/90 text-[var(--mid)] hover:text-[var(--burgundy)]'
              }`}
          >
            <Heart size={15} className={isLiked ? 'fill-white' : ''} />
          </button>
        )}

        {discount > 0 && (
          <span
            style={{ fontFamily: SANS }}
            className="absolute bottom-2.5 left-2.5 rounded-full bg-white/95 px-2 py-0.5 text-[0.62rem] font-semibold text-leaf"
          >
            {discount}% off
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3.5">
        <p style={{ fontFamily: SANS }} className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-gold-deep">
          {note && <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--burgundy)]" aria-hidden="true" />}
          <span className="truncate">{note || e.subCategoryName || e.categoryName || 'Experience'}</span>
        </p>
        <h3
          style={{ fontFamily: SERIF }}
          className="mt-1 line-clamp-2 min-h-[2.5em] text-[1.12rem] font-semibold leading-[1.25] text-[var(--charcoal)] transition-colors group-hover:text-[var(--burgundy)]"
        >
          {e.name}
        </h3>

        <ul style={{ fontFamily: SANS }} className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.72rem] text-[var(--mid)]">
          <li className="inline-flex items-center gap-1">
            <Star size={11} className="fill-[var(--gold)] text-[var(--gold)]" />
            <span className="font-semibold text-[var(--charcoal)]">{PLACEHOLDER_RATING}</span>
            <span>({PLACEHOLDER_REVIEWS})</span>
          </li>
          {duration > 0 && (
            <li className="inline-flex items-center gap-1">
              <Clock size={11} className="text-[var(--gold)]" /> {formatDuration(duration)}
            </li>
          )}
          {capacity > 0 && (
            <li className="inline-flex items-center gap-1">
              <Users size={11} className="text-[var(--gold)]" /> Up to {capacity}
            </li>
          )}
        </ul>

        {showDescription && (
          <p style={{ fontFamily: SANS }} className="mt-1.5 line-clamp-1 text-[0.76rem] leading-snug text-[#6B5E52]">
            {description}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p style={{ fontFamily: SANS }} className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--mid)]">From</p>
            <p className="flex items-baseline gap-1.5">
              <span style={{ fontFamily: SERIF }} className="text-[1.25rem] font-bold leading-none text-[var(--charcoal)] tabular-nums">
                {formatINR(price)}
              </span>
              {discount > 0 && (
                <span style={{ fontFamily: SANS }} className="text-[0.7rem] text-[var(--mid)] line-through tabular-nums">
                  {formatINR(original)}
                </span>
              )}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border-light)] text-[var(--burgundy)] transition-colors group-hover:border-[var(--burgundy)] group-hover:bg-[var(--burgundy)] group-hover:text-white"
          >
            <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
