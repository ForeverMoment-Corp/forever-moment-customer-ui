import { BadgeCheck, Star } from 'lucide-react';
import SectionCard, { Accent } from './SectionCard';
import { FONT_SANS, FONT_SERIF } from '../normalize';

interface Review {
  name: string;
  rating: number;
  date: string;
  occasion: string;
  text: string;
}

// Sample reviews until a reviews endpoint exists.
const SAMPLE_REVIEWS: Review[] = [
  { name: 'Rohit Sharma', rating: 5, date: 'Sep 2026', occasion: 'Anniversary', text: 'The team arrived on time and the setup looked exactly like the photos. My wife was in happy tears.' },
  { name: 'Priya Nair', rating: 5, date: 'Aug 2026', occasion: 'Birthday', text: 'Very professional. They adjusted the colours to match our theme without any fuss.' },
  { name: 'Aman Verma', rating: 4, date: 'Aug 2026', occasion: 'Surprise', text: 'Beautiful decoration. Setup took a little longer than expected, but the result was worth it.' },
  { name: 'Sneha Kulkarni', rating: 5, date: 'Jul 2026', occasion: 'Birthday', text: "Booked for my mom's surprise. Everything from booking to clean-up was smooth." },
];

const DISTRIBUTION: Array<[number, number]> = [[5, 82], [4, 12], [3, 4], [2, 1], [1, 1]];

const AVATARS = [
  'linear-gradient(135deg, var(--burgundy), var(--wine))',
  'linear-gradient(135deg, var(--gold), var(--gold-deep))',
  'linear-gradient(135deg, var(--rose), #B5605A)',
  'linear-gradient(135deg, var(--burgundy-dark), var(--burgundy))',
];

const initials = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-linen text-[var(--gold-light)]'} />
      ))}
    </span>
  );
}

export default function Reviews({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const recommendPct = DISTRIBUTION.filter(([s]) => s >= 4).reduce((sum, [, p]) => sum + p, 0);

  return (
    <SectionCard
      id="reviews"
      eyebrow="Loved by guests"
      title={<>What people <Accent>say</Accent></>}
      aside={
        <a href="#reviews" style={{ fontFamily: FONT_SANS }} className="text-[0.82rem] font-medium text-[var(--burgundy)] underline underline-offset-4 decoration-[var(--gold)]">
          See all {reviewCount}
        </a>
      }
    >
      {/* One line of summary keeps the focus on what guests actually wrote */}
      <div style={{ fontFamily: FONT_SANS }} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.84rem] text-[var(--mid)]">
        <span style={{ fontFamily: FONT_SERIF }} className="text-[2rem] font-semibold leading-none text-[var(--charcoal)]">{rating}</span>
        <Stars value={rating} size={15} />
        <span>{reviewCount} verified reviews</span>
        <span aria-hidden className="text-[var(--sand)]">|</span>
        <span><strong className="font-semibold text-[var(--burgundy)]">{recommendPct}%</strong> would book again</span>
      </div>

      {/* Review feed */}
      <div className="mt-4 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
        {SAMPLE_REVIEWS.map((review, i) => (
          <article
            key={review.name}
            className="relative flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border border-[var(--sand)] bg-white p-5 sm:w-[calc(50%-6px)]"
          >
            {/* Oversized quote mark as the card's signature */}
            <span aria-hidden style={{ fontFamily: FONT_SERIF }} className="pointer-events-none absolute -top-3 right-3 select-none text-[6rem] leading-none text-[var(--gold-pale)]">
              &rdquo;
            </span>
            <div className="relative flex items-center justify-between gap-2">
              <Stars value={review.rating} />
              <span style={{ fontFamily: FONT_SANS }} className="rounded-full bg-[var(--rose-light)] px-2.5 py-0.5 text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-[var(--burgundy)]">
                {review.occasion}
              </span>
            </div>
            <p style={{ fontFamily: FONT_SERIF }} className="relative mt-3 flex-1 text-[1.08rem] italic leading-snug text-[var(--charcoal)]">
              {review.text}
            </p>
            <div className="mt-4 flex items-center gap-3 border-t border-dashed border-[var(--sand)] pt-3">
              <span style={{ fontFamily: FONT_SANS, background: AVATARS[i % AVATARS.length] }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-semibold text-white">
                {initials(review.name)}
              </span>
              <div className="min-w-0">
                <p style={{ fontFamily: FONT_SANS }} className="flex items-center gap-1.5 text-[0.84rem] font-semibold text-[var(--charcoal)]">
                  <span className="truncate">{review.name}</span>
                  <BadgeCheck size={13} className="shrink-0 text-leaf" />
                </p>
                <p style={{ fontFamily: FONT_SANS }} className="text-[0.72rem] text-[var(--mid)]">Verified booking · {review.date}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
