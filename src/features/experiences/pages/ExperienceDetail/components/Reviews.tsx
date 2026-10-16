import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Loader2, PenLine, Star } from 'lucide-react';
import SectionCard, { Accent } from './SectionCard';
import { FONT_SANS, FONT_SERIF } from '../normalize';
import type { RootState } from '@/store/store';
import { openLoginModal } from '@/features/auth/store/authSlice';
import { submitReview, type RatingSummary, type Review } from '@/features/reviews/api';
import { formatRating } from '@/features/reviews/useExperienceReviews';

const AVATARS = [
  'linear-gradient(135deg, var(--burgundy), var(--wine))',
  'linear-gradient(135deg, var(--gold), var(--gold-deep))',
  'linear-gradient(135deg, var(--rose), var(--burgundy))',
  'linear-gradient(135deg, var(--burgundy-dark), var(--burgundy))',
];

/** Reviews shown before "Show all". */
const INITIAL_COUNT = 4;

const initials = (name: string) => name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const monthYear = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${formatRating(value)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-linen text-[var(--gold-light)]'} />
      ))}
    </span>
  );
}

/** Star picker for the review form. */
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div role="radiogroup" aria-label="Your rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
        >
          <Star size={26} className={i <= shown ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-linen text-[var(--gold-light)]'} />
        </button>
      ))}
    </div>
  );
}

const RATING_WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

function ReviewForm({ experienceId, onDone, onCancel }: { experienceId: number; onDone: () => void; onCancel: () => void }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError('Please choose a star rating.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await submitReview({ experienceId, rating, title, comment });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your review.');
      setSending(false);
    }
  };

  return (
    <form onSubmit={send} noValidate style={{ fontFamily: FONT_SANS }} className="mt-4 rounded-[20px] border border-[var(--sand)] bg-white p-5">
      <p className="text-[0.84rem] font-medium text-[var(--charcoal)]">How was your celebration?</p>
      <div className="mt-2 flex items-center gap-3">
        <StarInput value={rating} onChange={setRating} />
        {rating > 0 && <span className="text-[0.8rem] text-[var(--mid)]">{RATING_WORDS[rating]}</span>}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={150}
        placeholder="Headline (optional)"
        aria-label="Headline"
        className="mt-4 h-10 w-full rounded-xl border border-[var(--border-light)] px-3.5 text-[0.86rem] text-[var(--charcoal)] outline-none focus:border-[var(--burgundy)]"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="What did you love? Anything we could do better?"
        aria-label="Your review"
        className="mt-2.5 w-full resize-y rounded-xl border border-[var(--border-light)] px-3.5 py-2.5 text-[0.86rem] leading-relaxed text-[var(--charcoal)] outline-none focus:border-[var(--burgundy)]"
      />
      {error && (
        <p role="alert" className="mt-2 text-[0.8rem] text-[var(--burgundy)]">
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.72rem] text-[var(--mid)]">Reviews appear once our team has checked them.</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={sending}
            className="inline-flex h-10 items-center rounded-full border border-[var(--border-light)] px-4 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-[var(--charcoal)] transition-colors hover:border-[var(--charcoal)] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--burgundy)] px-5 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[var(--burgundy-dark)] disabled:opacity-70"
          >
            {sending && <Loader2 size={14} className="animate-spin" />}
            {sending ? 'Sending' : 'Submit review'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function Reviews({
  experienceId,
  reviews,
  summary,
  loading,
}: {
  experienceId: number;
  reviews: Review[];
  summary: RatingSummary;
  loading: boolean;
}) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [writing, setWriting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const count = summary.reviewCount || reviews.length;
  const visible = showAll ? reviews : reviews.slice(0, INITIAL_COUNT);
  // Breakdown from the reviews we have (the summary only carries the average and count).
  const distribution = [5, 4, 3, 2, 1].map((star) => [star, reviews.filter((r) => Math.round(r.rating) === star).length] as const);

  const startWriting = () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
      return;
    }
    setWriting(true);
  };

  const writeButton = !writing && !submitted && (
    <button
      type="button"
      onClick={startWriting}
      style={{ fontFamily: FONT_SANS }}
      className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-[var(--burgundy)] underline decoration-[var(--gold)] underline-offset-4"
    >
      <PenLine size={13} /> Write a review
    </button>
  );

  return (
    <SectionCard id="reviews" eyebrow="Guest reviews" title={<>What people <Accent>say</Accent></>} aside={count > 0 ? writeButton : undefined}>
      {loading && reviews.length === 0 ? (
        <div className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-label="Loading reviews">
          {[0, 1].map((i) => (
            <div key={i} className="h-[150px] animate-pulse rounded-[20px] border border-[var(--sand)] bg-white/70" />
          ))}
        </div>
      ) : count === 0 ? (
        // No reviews yet: invite the first one.
        !writing &&
        !submitted && (
          <div style={{ fontFamily: FONT_SANS }} className="flex flex-col items-start gap-3 rounded-[20px] border border-dashed border-[var(--sand)] bg-white/60 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p style={{ fontFamily: FONT_SERIF }} className="text-[1.15rem] font-semibold text-[var(--charcoal)]">
                No reviews yet
              </p>
              <p className="text-[0.82rem] text-[var(--mid)]">Booked this one? Tell others how it went.</p>
            </div>
            <button
              type="button"
              onClick={startWriting}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[var(--gold-light)] bg-white px-4 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-[var(--burgundy)] transition-colors hover:border-[var(--burgundy)]"
            >
              <PenLine size={13} /> Write the first review
            </button>
          </div>
        )
      ) : (
        <>
          {/* Summary: average + star breakdown */}
          <div style={{ fontFamily: FONT_SANS }} className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: FONT_SERIF }} className="text-[2.6rem] font-semibold leading-none text-[var(--charcoal)]">
                {formatRating(summary.averageRating)}
              </span>
              <div>
                <Stars value={summary.averageRating} size={15} />
                <p className="mt-0.5 text-[0.78rem] text-[var(--mid)]">
                  {count} review{count === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            {reviews.length > 1 && (
              <ul className="grid min-w-[200px] flex-1 gap-1 sm:max-w-[280px]" aria-label="Rating breakdown">
                {distribution.map(([star, n]) => (
                  <li key={star} className="flex items-center gap-2 text-[0.72rem] text-[var(--mid)]">
                    <span className="w-3 tabular-nums">{star}</span>
                    <Star size={10} className="fill-[var(--gold)] text-[var(--gold)]" />
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--sand)]">
                      <span className="block h-full rounded-full bg-[var(--gold)]" style={{ width: `${(n / reviews.length) * 100}%` }} />
                    </span>
                    <span className="w-5 text-right tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Review feed */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {visible.map((review, i) => (
              <article key={review.id} className="relative flex flex-col overflow-hidden rounded-[20px] border border-[var(--sand)] bg-white p-5">
                <span aria-hidden style={{ fontFamily: FONT_SERIF }} className="pointer-events-none absolute -top-3 right-3 select-none text-[4rem] leading-none text-[var(--gold-pale)]">
                  &rdquo;
                </span>
                <Stars value={review.rating} />
                {review.title && (
                  <p style={{ fontFamily: FONT_SANS }} className="relative mt-2.5 text-[0.9rem] font-semibold text-[var(--charcoal)]">
                    {review.title}
                  </p>
                )}
                {review.comment && (
                  <p style={{ fontFamily: FONT_SERIF }} className="relative mt-1.5 flex-1 whitespace-pre-line text-[1.05rem] italic leading-snug text-[var(--charcoal)]">
                    {review.comment}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-3 border-t border-dashed border-[var(--sand)] pt-3">
                  <span
                    style={{ fontFamily: FONT_SANS, background: AVATARS[i % AVATARS.length] }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-semibold text-white"
                  >
                    {initials(review.reviewerName)}
                  </span>
                  <div className="min-w-0" style={{ fontFamily: FONT_SANS }}>
                    <p className="truncate text-[0.84rem] font-semibold text-[var(--charcoal)]">{review.reviewerName}</p>
                    {monthYear(review.createdAt) && <p className="text-[0.72rem] text-[var(--mid)]">{monthYear(review.createdAt)}</p>}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {reviews.length > INITIAL_COUNT && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              style={{ fontFamily: FONT_SANS }}
              className="mt-4 text-[0.82rem] font-medium text-[var(--burgundy)] underline decoration-[var(--gold)] underline-offset-4"
            >
              {showAll ? 'Show fewer' : `Show all ${reviews.length} reviews`}
            </button>
          )}
        </>
      )}

      {writing && (
        <ReviewForm
          experienceId={experienceId}
          onCancel={() => setWriting(false)}
          onDone={() => {
            setWriting(false);
            setSubmitted(true);
          }}
        />
      )}
      {submitted && (
        <p role="status" style={{ fontFamily: FONT_SANS }} className="mt-4 flex items-center gap-2 rounded-xl bg-leaf-light px-3.5 py-2.5 text-[0.84rem] text-leaf">
          <CheckCircle2 size={16} /> Thank you! Your review will appear once our team has checked it.
        </p>
      )}
    </SectionCard>
  );
}
