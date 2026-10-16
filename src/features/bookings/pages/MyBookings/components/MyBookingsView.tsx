import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CalendarHeart, ChevronDown, Clock, Loader2, LogIn, MapPin, RefreshCw, Sparkles, Star, Users } from 'lucide-react';
import type { RootState } from '@/store/store';
import { experiencePath } from '@/features/experiences/utils/slug';
import { waitForPaymentLink } from '@/features/experiences/store/api';
import { BookingsUnavailableError, cancelMyBooking, fetchMyBookings, UnauthorizedError, type Booking, type BookingQuery } from '@/features/bookings/api';
import { getLoginSession } from '@/utils/storage';
import { openLoginModal } from '@/features/auth/store/authSlice';
import { savePendingPayment } from '@/features/bookings/pendingPayment';
import { closePaymentTab, goToCheckout, openPaymentTab, paymentStatusPath } from '@/features/bookings/paymentTab';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";
const PAGE_SIZE = 10;
const DAY_MS = 86_400_000;

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

type Group = 'upcoming' | 'past' | 'cancelled';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'signed-out' }
  | { kind: 'unavailable' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' };

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const bookingTime = (b: Booking) => {
  const t = new Date(b.bookingDate).getTime();
  return Number.isNaN(t) ? 0 : t;
};

const groupOf = (b: Booking, today: number): Group => {
  if (b.status === 'CANCELLED' || b.status === 'FAILED') return 'cancelled';
  return bookingTime(b) >= today ? 'upcoming' : 'past';
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** "18:00" / "18:00:00" → "6 pm" / "6:30 pm". */
const formatTime = (value?: string | null) => {
  if (!value) return '';
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h)) return value;
  const suffix = h % 24 < 12 ? 'am' : 'pm';
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
};

const slotText = (b: Booking) => {
  const range = [formatTime(b.startTime), formatTime(b.endTime)].filter(Boolean).join(' – ');
  return range || b.timeSlotLabel || '';
};

/** "Today" / "Tomorrow" / "In 5 days" for upcoming bookings. */
const countdown = (b: Booking, today: number) => {
  const days = Math.round((bookingTime(b) - today) / DAY_MS);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
};

const STATUS: Record<string, { label: string; className: string }> = {
  CONFIRMED: { label: 'Confirmed', className: 'bg-leaf-light text-leaf' },
  COMPLETED: { label: 'Completed', className: 'bg-[var(--linen)] text-[var(--taupe)]' },
  PENDING: { label: 'Awaiting payment', className: 'bg-gold-pale text-gold-dark' },
  NOT_PAID: { label: 'Not paid', className: 'bg-[var(--linen)] text-[var(--mid)]' },
  CANCELLED: { label: 'Cancelled', className: 'bg-[var(--linen)] text-[var(--mid)]' },
  FAILED: { label: 'Failed', className: 'bg-[var(--rose-light)] text-[var(--burgundy)]' },
};

const statusKey = (b: Booking, isPast: boolean) => {
  if (isPast && b.status === 'CONFIRMED') return 'COMPLETED';
  if (isPast && b.status === 'PENDING') return 'NOT_PAID';
  return STATUS[b.status] ? b.status : 'PENDING';
};

function BookingCard({ booking, today, onChange, highlight }: { booking: Booking; today: number; onChange: (b: Booking) => void; highlight?: boolean }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const date = new Date(booking.bookingDate);
  const validDate = !Number.isNaN(date.getTime());
  const isPast = bookingTime(booking) < today;
  const tab = groupOf(booking, today);
  const muted = tab !== 'upcoming';
  const canPay = booking.status === 'PENDING' && !isPast && !!user;
  // The booking service cancels only PENDING or CONFIRMED bookings; past ones are left alone.
  const canCancel = (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && !isPast;
  const status = STATUS[statusKey(booking, isPast)];
  const slot = slotText(booking);
  const detailsId = `booking-${booking.bookingId}-details`;

  /** Stripe Checkout opens in a new tab; this tab moves to /payment/status, which polls until paid or failed. */
  const pay = async () => {
    if (!user) return;
    const tab = openPaymentTab();
    setPaying(true);
    setPayError(null);
    try {
      // An existing booking's link is already there: no initial wait.
      const url = await waitForPaymentLink(booking.bookingId, { id: user.id, role: user.role }, { timeoutMs: 8_000, initialDelayMs: 0 });
      if (url) {
        savePendingPayment({
          bookingId: booking.bookingId,
          experienceName: booking.experienceName,
          experiencePath: experiencePath({ id: booking.experienceId, slug: booking.experienceSlug }),
          checkoutUrl: url,
        });
        // New tab when possible (this tab then waits on /payment/status); otherwise Stripe opens here.
        if (goToCheckout(tab, url) === 'new-tab') navigate(paymentStatusPath(booking.bookingId));
        return;
      }
      closePaymentTab(tab);
      setPayError('Payment link not ready yet. Try again in a minute.');
    } catch (e) {
      closePaymentTab(tab);
      setPayError(e instanceof Error ? e.message : 'Could not open the payment page.');
    }
    setPaying(false);
  };

  const cancel = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await cancelMyBooking(booking.bookingId, cancelReason);
      onChange(
        updated ?? { ...booking, status: 'CANCELLED', cancelReason: cancelReason.trim() || null, cancelledAt: new Date().toISOString() },
      );
    } catch (e) {
      setCancelError(e instanceof Error && e.message ? e.message : 'Could not cancel this booking.');
      setCancelling(false);
    }
  };

  return (
    <li
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 hover:shadow-[0_14px_34px_-20px_color-mix(in_srgb,_var(--burgundy)_45%,_transparent)] ${
        canPay ? 'border-[var(--gold-light)]' : 'border-[var(--border-light)]'
      }`}
      style={{ fontFamily: SANS }}
    >
      {highlight && (
        <p className="flex items-center gap-1.5 bg-[var(--gold-pale)] px-4 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-[var(--burgundy)]">
          <Sparkles size={11} /> Next celebration
        </p>
      )}
      <div className="flex flex-1 gap-4 p-4">
        {/* Date tile */}
        <div
          aria-hidden="true"
          className={`flex w-[60px] shrink-0 flex-col items-center self-start rounded-xl border py-2 ${
            muted ? 'border-[var(--border-light)] bg-[var(--cream)] text-[var(--mid)]' : 'border-[var(--gold-light)] bg-[var(--gold-pale)] text-[var(--burgundy)]'
          }`}
        >
          {validDate ? (
            <>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em]">{date.toLocaleDateString('en-IN', { month: 'short' })}</span>
              <span style={{ fontFamily: SERIF }} className="text-[1.75rem] font-semibold leading-none">
                {date.getDate()}
              </span>
              <span className="mt-0.5 text-[0.6rem] uppercase tracking-[0.1em]">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
            </>
          ) : (
            <CalendarHeart size={20} className="my-2" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 style={{ fontFamily: SERIF }} className="min-w-0 text-[1.22rem] font-semibold leading-snug text-[var(--charcoal)]">
              <Link to={experiencePath({ id: booking.experienceId, slug: booking.experienceSlug })} className="transition-colors hover:text-[var(--burgundy)]">
                {booking.experienceName}
              </Link>
            </h2>
            <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[0.66rem] font-semibold tracking-[0.04em] ${status.className}`}>
              {status.label}
            </span>
          </div>

          <ul className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1 text-[0.78rem] text-[var(--mid)]">
            {slot && (
              <li className="inline-flex items-center gap-1">
                <Clock size={12} className="text-[var(--gold)]" /> {slot}
              </li>
            )}
            {booking.guestCount > 0 && (
              <li className="inline-flex items-center gap-1">
                <Users size={12} className="text-[var(--gold)]" /> {booking.guestCount}
              </li>
            )}
            {booking.locationName && (
              <li className="inline-flex items-center gap-1">
                <MapPin size={12} className="text-[var(--gold)]" /> {booking.locationName}
              </li>
            )}
          </ul>

          {tab === 'upcoming' && validDate && (
            <p className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--gold)]">{countdown(booking, today)}</p>
          )}
          {booking.status === 'FAILED' && booking.failureReason && (
            <p className="mt-2 text-[0.78rem] leading-snug text-[var(--burgundy)]">{booking.failureReason}</p>
          )}
          {booking.status === 'CANCELLED' && (booking.cancelledAt || booking.cancelReason) && (
            <p className="mt-2 text-[0.78rem] leading-snug text-[var(--mid)]">
              {booking.cancelledAt ? `Cancelled ${formatDate(booking.cancelledAt)}` : 'Cancelled'}
              {booking.cancelReason && ` · ${booking.cancelReason}`}
            </p>
          )}
        </div>
      </div>

      {/* Footer: price + actions */}
      <div className="flex items-center justify-between gap-3 border-t border-[var(--border-light)] px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={detailsId}
          className="inline-flex items-center gap-1 text-[0.78rem] font-medium text-[var(--mid)] transition-colors hover:text-[var(--burgundy)]"
        >
          Details <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex items-center gap-3">
          <span className="flex items-baseline gap-1.5">
            <span className="text-[0.68rem] uppercase tracking-[0.12em] text-[var(--mid)]">Total</span>
            <span className={`text-[1rem] font-semibold tabular-nums ${muted ? 'text-[var(--mid)]' : 'text-[var(--charcoal)]'}`}>
              {formatINR(booking.grandTotal)}
            </span>
          </span>
          {isPast && booking.status === 'CONFIRMED' && (
            <Link
              to={`${experiencePath({ id: booking.experienceId, slug: booking.experienceSlug })}#reviews`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--gold-light)] px-3.5 text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[var(--burgundy)] transition-colors hover:border-[var(--burgundy)]"
            >
              <Star size={13} /> Rate it
            </Link>
          )}
          {canPay && (
            <button
              type="button"
              onClick={pay}
              disabled={paying}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--burgundy)] px-4 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[var(--burgundy-dark)] disabled:opacity-70"
            >
              {paying && <Loader2 size={14} className="animate-spin" />}
              {paying ? 'Opening' : 'Pay now'}
            </button>
          )}
        </div>
      </div>
      {payError && (
        <p role="alert" className="px-4 pb-3 text-[0.76rem] text-[var(--burgundy)]">
          {payError}
        </p>
      )}

      {confirmingCancel && (
        <div className="border-t border-[var(--border-light)] bg-[var(--rose-light)]/40 px-4 py-3.5 text-[0.8rem]">
          <p className="font-medium text-[var(--charcoal)]">Cancel this booking?</p>
          <p className="mt-0.5 text-[0.76rem] leading-snug text-[var(--mid)]">
            {booking.status === 'CONFIRMED'
              ? 'Your payment will be refunded by our team. You will get an email once it is processed.'
              : 'Nothing has been charged. The date will be released for others.'}
          </p>
          <label htmlFor={`${detailsId}-reason`} className="sr-only">
            Reason (optional)
          </label>
          <input
            id={`${detailsId}-reason`}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            maxLength={250}
            placeholder="Reason (optional)"
            className="mt-2.5 h-9 w-full rounded-lg border border-[var(--border-light)] bg-white px-3 text-[0.8rem] text-[var(--charcoal)] outline-none focus:border-[var(--burgundy)]"
          />
          {cancelError && (
            <p role="alert" className="mt-2 text-[0.76rem] text-[var(--burgundy)]">
              {cancelError}
            </p>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmingCancel(false);
                setCancelError(null);
              }}
              disabled={cancelling}
              className="inline-flex h-9 items-center rounded-full border border-[var(--border-light)] bg-white px-4 text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-[var(--charcoal)] transition-colors hover:border-[var(--charcoal)] disabled:opacity-60"
            >
              Keep booking
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={cancelling}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--burgundy)] px-4 text-[0.74rem] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[var(--burgundy-dark)] disabled:opacity-70"
            >
              {cancelling && <Loader2 size={14} className="animate-spin" />}
              {cancelling ? 'Cancelling' : 'Cancel booking'}
            </button>
          </div>
        </div>
      )}

      {open && (
        <div id={detailsId} className="border-t border-[var(--border-light)] bg-[var(--cream)] px-4 py-3.5 text-[0.8rem]">
          <dl className="grid gap-1.5">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--mid)]">
                Experience
                {booking.guestCount > 1 && booking.resolvedPricePerPerson ? ` · ${formatINR(booking.resolvedPricePerPerson)} × ${booking.guestCount}` : ''}
              </dt>
              <dd className="tabular-nums text-[var(--charcoal)]">{formatINR(booking.totalAmount ?? 0)}</dd>
            </div>
            {booking.addons.map((a, i) => (
              <div key={a.id ?? `${a.addonName}-${i}`} className="flex justify-between gap-4">
                <dt className="text-[var(--mid)]">{a.addonName}</dt>
                <dd className={`tabular-nums ${a.free || !a.effectivePrice ? 'text-leaf' : 'text-[var(--charcoal)]'}`}>
                  {a.free || !a.effectivePrice ? 'Free' : formatINR(a.effectivePrice)}
                </dd>
              </div>
            ))}
            <div className="mt-1 flex justify-between gap-4 border-t border-[var(--border-light)] pt-2 font-semibold text-[var(--charcoal)]">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatINR(booking.grandTotal)}</dd>
            </div>
          </dl>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.72rem] text-[var(--mid)]">
            <span>
              Ref <span className="font-medium text-[var(--charcoal)]">{booking.bookingId}</span>
              {booking.createdAt && ` · Booked ${formatDate(booking.createdAt)}`}
            </span>
            <span className="flex items-center gap-3">
              {canCancel && !confirmingCancel && (
                <button type="button" onClick={() => setConfirmingCancel(true)} className="font-medium text-[var(--mid)] hover:text-[var(--burgundy)] hover:underline">
                  Cancel booking
                </button>
              )}
              <Link to="/contact" className="font-medium text-[var(--burgundy)] hover:underline">
                Get help
              </Link>
            </span>
          </div>
        </div>
      )}
    </li>
  );
}

function StateMessage({
  icon: Icon,
  title,
  body,
  action,
  dashed,
}: {
  icon: typeof AlertCircle;
  title: string;
  body?: string;
  action?: React.ReactNode;
  dashed?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-6 py-12 text-center ${dashed ? 'border-2 border-dashed border-[var(--border-light)] bg-white/60' : 'border border-[var(--border-light)] bg-white'}`}
      style={{ fontFamily: SANS }}
    >
      <Icon size={26} className="mx-auto text-[var(--gold)]" />
      <p style={{ fontFamily: SERIF }} className="mt-2 text-[1.35rem] font-medium text-[var(--charcoal)]">
        {title}
      </p>
      {body && <p className="mx-auto mt-1 max-w-sm text-[0.84rem] text-[var(--mid)]">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const primaryBtn =
  'inline-flex h-10 items-center gap-2 rounded-full bg-[var(--burgundy)] px-5 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--burgundy-dark)]';

/** Active bookings by celebration date (latest first), so everything upcoming arrives before the past. */
const ACTIVE_QUERY: BookingQuery = { status: ['PENDING', 'CONFIRMED'], sort: 'bookingDate,desc' };
const INACTIVE_QUERY: BookingQuery = { status: ['CANCELLED', 'FAILED'], sort: 'createdAt,desc' };

interface Paged {
  items: Booking[];
  page: number;
  last: boolean;
  total: number;
}
const EMPTY_PAGED: Paged = { items: [], page: 0, last: true, total: 0 };

const mergeUnique = (prev: Booking[], next: Booking[]) => {
  const seen = new Set(prev.map((b) => b.bookingId));
  return [...prev, ...next.filter((b) => !seen.has(b.bookingId))];
};

function SectionHeader({ title, count, children }: { title: string; count?: number; children?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 style={{ fontFamily: SERIF }} className="text-[1.35rem] font-semibold leading-tight text-[var(--charcoal)]">
        {title}
        {!!count && <span className="ml-2 align-middle text-[0.8rem] font-medium text-[var(--gold)]" style={{ fontFamily: SANS }}>{count}</span>}
      </h2>
      {children}
    </div>
  );
}

function LoadMore({ onClick, loading, error, label }: { onClick: () => void; loading: boolean; error: string | null; label: string }) {
  return (
    <div className="mt-4 text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--gold-light)] bg-white px-5 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-[var(--burgundy)] transition-colors hover:border-[var(--burgundy)] disabled:opacity-60"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Loading' : label}
      </button>
      {error && <p role="alert" className="mt-2 text-[0.78rem] text-[var(--burgundy)]">{error}</p>}
    </div>
  );
}

/**
 * My Bookings, one page instead of tabs: what's coming up first (the next one highlighted), then
 * past celebrations, then cancelled / failed bookings folded away. Two server-filtered lists:
 * active (PENDING + CONFIRMED, by celebration date) and inactive (CANCELLED + FAILED).
 */
export default function MyBookingsView() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [state, setState] = useState<LoadState>(() => (getLoginSession('access_token') ? { kind: 'loading' } : { kind: 'signed-out' }));
  const [active, setActive] = useState<Paged>(EMPTY_PAGED);
  const [inactive, setInactive] = useState<Paged>(EMPTY_PAGED);
  const [moreLoading, setMoreLoading] = useState<'active' | 'inactive' | null>(null);
  const [moreError, setMoreError] = useState<{ which: 'active' | 'inactive'; message: string } | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);
  // Bumped by "Try again"; the effect below refetches whenever it changes.
  const [attempt, setAttempt] = useState(0);

  const today = useMemo(startOfToday, []);

  useEffect(() => {
    if (!isAuthenticated || !getLoginSession('access_token')) {
      setState({ kind: 'signed-out' });
      return;
    }
    let alive = true;
    setState({ kind: 'loading' });
    Promise.all([fetchMyBookings(0, PAGE_SIZE, ACTIVE_QUERY), fetchMyBookings(0, PAGE_SIZE, INACTIVE_QUERY)])
      .then(([a, c]) => {
        if (!alive) return;
        setActive({ items: a.items, page: a.page, last: a.last, total: a.totalElements });
        setInactive({ items: c.items, page: c.page, last: c.last, total: c.totalElements });
        setState({ kind: 'ready' });
      })
      .catch((e) => {
        if (!alive) return;
        if (e instanceof UnauthorizedError) setState({ kind: 'signed-out' });
        else if (e instanceof BookingsUnavailableError) setState({ kind: 'unavailable' });
        else setState({ kind: 'error', message: e instanceof Error ? e.message : 'Could not load your bookings' });
      });
    return () => {
      alive = false;
    };
  }, [attempt, isAuthenticated]);

  const loadMore = async (which: 'active' | 'inactive') => {
    const current = which === 'active' ? active : inactive;
    const setter = which === 'active' ? setActive : setInactive;
    setMoreLoading(which);
    setMoreError(null);
    try {
      const res = await fetchMyBookings(current.page + 1, PAGE_SIZE, which === 'active' ? ACTIVE_QUERY : INACTIVE_QUERY);
      setter((prev) => ({ items: mergeUnique(prev.items, res.items), page: res.page, last: res.last, total: res.totalElements }));
    } catch (e) {
      setMoreError({ which, message: e instanceof Error ? e.message : 'Could not load more bookings' });
    } finally {
      setMoreLoading(null);
    }
  };

  /** After a cancel the booking leaves the active list and joins the cancelled ones. */
  const replaceBooking = useCallback((updated: Booking) => {
    if (updated.status === 'CANCELLED' || updated.status === 'FAILED') {
      let moved: Booking | undefined;
      setActive((prev) => {
        moved = prev.items.find((b) => b.bookingId === updated.bookingId);
        return { ...prev, items: prev.items.filter((b) => b.bookingId !== updated.bookingId), total: Math.max(0, prev.total - 1) };
      });
      setInactive((prev) => ({ ...prev, items: [{ ...(moved ?? {}), ...updated } as Booking, ...prev.items], total: prev.total + 1 }));
      return;
    }
    const patch = (prev: Paged) => ({ ...prev, items: prev.items.map((b) => (b.bookingId === updated.bookingId ? { ...b, ...updated } : b)) });
    setActive(patch);
    setInactive(patch);
  }, []);

  const { upcoming, past } = useMemo(() => {
    const up: Booking[] = [];
    const done: Booking[] = [];
    for (const b of active.items) (groupOf(b, today) === 'upcoming' ? up : done).push(b);
    up.sort((a, b) => bookingTime(a) - bookingTime(b)); // soonest first
    done.sort((a, b) => bookingTime(b) - bookingTime(a)); // most recent first
    return { upcoming: up, past: done };
  }, [active.items, today]);

  const [next, ...laterUpcoming] = upcoming;
  const nothingAtAll = state.kind === 'ready' && active.items.length === 0 && inactive.items.length === 0;
  const summary =
    state.kind === 'ready' && !nothingAtAll
      ? [upcoming.length && `${upcoming.length} upcoming`, past.length && `${past.length}${active.last ? '' : '+'} past`].filter(Boolean).join(' · ')
      : '';

  return (
    <section className="min-h-[70vh] bg-[var(--cream)] pb-14 pt-6 md:pt-8" style={{ fontFamily: SANS }}>
      <div className="mx-auto max-w-[var(--container-width)] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-2 border-b border-[var(--border-light)] pb-3">
          <h1 className="section-title text-[1.7rem] md:text-[2.1rem]">
            My <em>Bookings</em>
          </h1>
          {summary && <p className="pb-1 text-[0.8rem] text-[var(--mid)]">{summary}</p>}
        </div>

        <div className="mt-6">
          {state.kind === 'loading' && (
            <ul aria-busy="true" aria-label="Loading your bookings" className="grid gap-4 lg:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="h-[168px] animate-pulse rounded-2xl border border-[var(--border-light)] bg-white/70" />
              ))}
            </ul>
          )}

          {state.kind === 'signed-out' && (
            <StateMessage
              icon={LogIn}
              title="Sign in to see your bookings"
              action={
                <button type="button" onClick={() => dispatch(openLoginModal())} className={primaryBtn}>
                  <LogIn size={14} /> Sign in
                </button>
              }
            />
          )}

          {state.kind === 'unavailable' && (
            <StateMessage icon={CalendarHeart} title="Bookings will appear here soon" body="Your confirmation email has every detail in the meantime." />
          )}

          {state.kind === 'error' && (
            <StateMessage
              icon={AlertCircle}
              title="We couldn't load your bookings"
              body={state.message}
              action={
                <button type="button" onClick={() => setAttempt((n) => n + 1)} className={primaryBtn}>
                  <RefreshCw size={14} /> Try again
                </button>
              }
            />
          )}

          {nothingAtAll && (
            <StateMessage
              dashed
              icon={CalendarHeart}
              title="No bookings yet"
              body="When you book a celebration, it shows up here with its date, details and payment."
              action={
                <Link to="/categories" className={primaryBtn}>
                  Plan a celebration
                </Link>
              }
            />
          )}

          {state.kind === 'ready' && !nothingAtAll && (
            <div className="grid gap-10">
              {/* Coming up */}
              <div>
                <SectionHeader title="Coming up" count={upcoming.length} />
                {next ? (
                  <ul className="grid items-start gap-4 lg:grid-cols-2">
                    <BookingCard key={next.bookingId} booking={next} today={today} onChange={replaceBooking} highlight />
                    {laterUpcoming.map((b) => (
                      <BookingCard key={b.bookingId} booking={b} today={today} onChange={replaceBooking} />
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-white/60 px-5 py-4">
                    <p className="text-[0.86rem] text-[var(--mid)]">Nothing planned right now.</p>
                    <Link to="/categories" className="text-[0.8rem] font-semibold uppercase tracking-[0.08em] text-[var(--burgundy)] hover:underline">
                      Plan a celebration
                    </Link>
                  </div>
                )}
              </div>

              {/* Past */}
              {(past.length > 0 || !active.last) && (
                <div>
                  <SectionHeader title="Past celebrations" count={past.length} />
                  {past.length > 0 && (
                    <ul className="grid items-start gap-4 lg:grid-cols-2">
                      {past.map((b) => (
                        <BookingCard key={b.bookingId} booking={b} today={today} onChange={replaceBooking} />
                      ))}
                    </ul>
                  )}
                  {!active.last && (
                    <LoadMore
                      onClick={() => loadMore('active')}
                      loading={moreLoading === 'active'}
                      error={moreError?.which === 'active' ? moreError.message : null}
                      label="Load older bookings"
                    />
                  )}
                </div>
              )}

              {/* Cancelled & failed, folded away */}
              {inactive.items.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCancelled((v) => !v)}
                    aria-expanded={showCancelled}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--border-light)] bg-white px-5 py-3.5 text-left transition-colors hover:border-[var(--gold-light)]"
                  >
                    <span>
                      <span className="block text-[0.92rem] font-medium text-[var(--charcoal)]">Cancelled &amp; unsuccessful</span>
                      <span className="block text-[0.76rem] text-[var(--mid)]">
                        {inactive.total || inactive.items.length} booking{(inactive.total || inactive.items.length) === 1 ? '' : 's'}
                      </span>
                    </span>
                    <ChevronDown size={18} className={`shrink-0 text-[var(--mid)] transition-transform duration-200 ${showCancelled ? 'rotate-180' : ''}`} />
                  </button>
                  {showCancelled && (
                    <>
                      <ul className="mt-4 grid items-start gap-4 lg:grid-cols-2">
                        {inactive.items.map((b) => (
                          <BookingCard key={b.bookingId} booking={b} today={today} onChange={replaceBooking} />
                        ))}
                      </ul>
                      {!inactive.last && (
                        <LoadMore
                          onClick={() => loadMore('inactive')}
                          loading={moreLoading === 'inactive'}
                          error={moreError?.which === 'inactive' ? moreError.message : null}
                          label="Load more"
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
