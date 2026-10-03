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
  'linear-gradient(135deg, #7C2D3B, #A83A4A)',
  'linear-gradient(135deg, #C9A96E, #A8853F)',
  'linear-gradient(135deg, #D4837A, #B5605A)',
  'linear-gradient(135deg, #5A1E29, #7C2D3B)',
];

const initials = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-[#F6EEDF] text-[var(--gold-light)]'} />
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
      {/* Summary band */}
      <div className="rounded-[16px] bg-white border border-[var(--border-light)] p-4 sm:p-5 grid sm:grid-cols-[auto_minmax(0,1fr)_auto] gap-5 sm:gap-6 items-center">
        <div>
          <p style={{ fontFamily: FONT_SERIF }} className="text-[3rem] leading-[0.9] font-semibold text-[var(--charcoal)]">
            {rating}
            <span className="ml-1 text-[1.25rem] italic font-medium text-[var(--mid)]">/ 5</span>
          </p>
          <div className="mt-2.5">
            <Stars value={rating} size={16} />
          </div>
          <p style={{ fontFamily: FONT_SANS }} className="mt-1.5 text-[0.8rem] text-[var(--mid)] whitespace-nowrap">
            {reviewCount} verified reviews
          </p>
        </div>
        <ul className="grid gap-1.5 max-w-[360px]">
          {DISTRIBUTION.map(([stars, pct]) => (
            <li key={stars} style={{ fontFamily: FONT_SANS }} className="grid grid-cols-[14px_minmax(0,1fr)_36px] gap-2.5 items-center text-[0.74rem] text-[var(--mid)]">
              <span>{stars}</span>
              <span className="block h-1.5 rounded-full bg-[#F6EEDF] overflow-hidden">
                <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--gold), var(--burgundy))' }} />
              </span>
              <span className="text-right tabular-nums">{pct}%</span>
            </li>
          ))}
        </ul>
        <div className="sm:max-w-[170px] sm:pl-6 sm:border-l sm:border-dashed sm:border-[var(--border-light)] pt-4 sm:pt-0 border-t sm:border-t-0 border-dashed border-[var(--border-light)]">
          <p style={{ fontFamily: FONT_SERIF }} className="text-[2rem] leading-none font-semibold text-[var(--burgundy)]">{recommendPct}%</p>
          <p style={{ fontFamily: FONT_SANS }} className="mt-1 text-[0.78rem] leading-snug text-[var(--mid)]">
            would book again or recommend to a friend
          </p>
        </div>
      </div>

      {/* Review feed */}
      <div className="mt-3 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
        {SAMPLE_REVIEWS.map((review, i) => (
          <article
            key={review.name}
            className="snap-start shrink-0 w-[280px] sm:w-[calc(50%-6px)] rounded-[16px] bg-white border border-[var(--border-light)] p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: FONT_SANS, background: AVATARS[i % AVATARS.length] }} className="w-[42px] h-[42px] rounded-full text-white text-[0.72rem] font-semibold flex items-center justify-center shrink-0">
                {initials(review.name)}
              </span>
              <div className="min-w-0">
                <p style={{ fontFamily: FONT_SANS }} className="text-[0.88rem] font-semibold text-[var(--charcoal)] flex items-center gap-1.5">
                  <span className="truncate">{review.name}</span>
                  <BadgeCheck size={14} className="text-[#3F7A3F] shrink-0" />
                </p>
                <p style={{ fontFamily: FONT_SANS }} className="text-[0.74rem] text-[var(--mid)]">
                  {review.occasion} · {review.date}
                </p>
              </div>
            </div>
            <Stars value={review.rating} />
            <p style={{ fontFamily: FONT_SANS }} className="text-[0.88rem] leading-relaxed text-[#4A3F35]">{review.text}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
