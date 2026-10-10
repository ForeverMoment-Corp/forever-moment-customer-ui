import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AlertCircle, CalendarHeart, ChevronDown, Clock, Loader2, LogIn, MapPin, RefreshCw, Users } from 'lucide-react';
import type { RootState } from '@/store/store';
import { experiencePath } from '@/features/experiences/utils/slug';
import { waitForPaymentLink } from '@/features/experiences/store/api';
import { BookingsUnavailableError, fetchMyBookings, UnauthorizedError, type Booking } from '@/features/bookings/api';
import { getLoginSession } from '@/utils/storage';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";
const PAGE_SIZE = 10;
const DAY_MS = 86_400_000;

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

type Tab = 'upcoming' | 'past' | 'cancelled';
const TABS: { key: Tab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

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

const tabOf = (b: Booking, today: number): Tab => {
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

function BookingCard({ booking, today }: { booking: Booking; today: number }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const date = new Date(booking.bookingDate);
  const validDate = !Number.isNaN(date.getTime());
  const isPast = bookingTime(booking) < today;
  const tab = tabOf(booking, today);
  const muted = tab !== 'upcoming';
  const canPay = booking.status === 'PENDING' && !isPast && !!user;
  const status = STATUS[statusKey(booking, isPast)];
  const slot = slotText(booking);
  const detailsId = `booking-${booking.bookingId}-details`;

  const pay = async () => {
    if (!user) return;
    setPaying(true);
    setPayError(null);
    try {
      const url = await waitForPaymentLink(booking.bookingId, { id: user.id, role: user.role }, { timeoutMs: 8_000 });
      if (url) {
        window.location.assign(url);
        return;
      }
      setPayError('Payment link not ready yet. Try again in a minute.');
    } catch (e) {
      setPayError(e instanceof Error ? e.message : 'Could not open the payment page.');
    }
    setPaying(false);
  };

  return (
    <li
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 hover:shadow-[0_14px_34px_-20px_color-mix(in_srgb,_var(--burgundy)_45%,_transparent)] ${
        canPay ? 'border-[var(--gold-light)]' : 'border-[var(--border-light)]'
      }`}
      style={{ fontFamily: SANS }}
    >
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
            <Link to="/contact" className="font-medium text-[var(--burgundy)] hover:underline">
              Get help
            </Link>
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

export default function MyBookingsView() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [state, setState] = useState<LoadState>(() => (getLoginSession('access_token') ? { kind: 'loading' } : { kind: 'signed-out' }));
  const [items, setItems] = useState<Booking[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('upcoming');
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
    fetchMyBookings(0, PAGE_SIZE)
      .then((res) => {
        if (!alive) return;
        setItems(res.items);
        setPage(res.page);
        setLast(res.last);
        setState({ kind: 'ready' });
        // Land on the first tab that has something in it.
        const present = new Set(res.items.map((b) => tabOf(b, today)));
        if (!present.has('upcoming')) setTab(present.has('past') ? 'past' : present.has('cancelled') ? 'cancelled' : 'upcoming');
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
  }, [attempt, isAuthenticated, today]);

  const loadMore = async () => {
    setLoadingMore(true);
    setMoreError(null);
    try {
      const res = await fetchMyBookings(page + 1, PAGE_SIZE);
      setItems((prev) => {
        const seen = new Set(prev.map((b) => b.bookingId));
        return [...prev, ...res.items.filter((b) => !seen.has(b.bookingId))];
      });
      setPage(res.page);
      setLast(res.last);
    } catch (e) {
      setMoreError(e instanceof Error ? e.message : 'Could not load more bookings');
    } finally {
      setLoadingMore(false);
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<Tab, Booking[]> = { upcoming: [], past: [], cancelled: [] };
    for (const b of items) groups[tabOf(b, today)].push(b);
    // Soonest first for upcoming; most recent first otherwise.
    groups.upcoming.sort((a, b) => bookingTime(a) - bookingTime(b));
    groups.past.sort((a, b) => bookingTime(b) - bookingTime(a));
    groups.cancelled.sort((a, b) => bookingTime(b) - bookingTime(a));
    return groups;
  }, [items, today]);

  const visible = grouped[tab];

  return (
    <section className="min-h-[70vh] bg-[var(--cream)] pb-14 pt-6 md:pt-8" style={{ fontFamily: SANS }}>
      <div className="mx-auto max-w-[var(--container-width)] px-4 sm:px-6 lg:px-8">
        {/* Header: title + tabs on one row */}
        <div className="flex flex-col gap-4 border-b border-[var(--border-light)] sm:flex-row sm:items-end sm:justify-between">
          <h1 className="section-title pb-3 text-[2rem] md:text-[2.3rem]">
            My <em>Bookings</em>
          </h1>

          {state.kind === 'ready' && (
            <div role="tablist" aria-label="Filter bookings" className="-mb-px flex gap-6">
              {TABS.map(({ key, label }) => {
                const active = key === tab;
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(key)}
                    className={`border-b-2 pb-3 text-[0.78rem] font-medium uppercase tracking-[0.14em] transition-colors ${
                      active ? 'border-[var(--burgundy)] text-[var(--burgundy)]' : 'border-transparent text-[var(--mid)] hover:text-[var(--charcoal)]'
                    }`}
                  >
                    {label}
                    {grouped[key].length > 0 && <span className="ml-1.5 text-[var(--gold)]">{grouped[key].length}</span>}
                  </button>
                );
              })}
            </div>
          )}
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
                <Link to="/login" className={primaryBtn}>
                  Sign in
                </Link>
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

          {state.kind === 'ready' &&
            (visible.length > 0 ? (
              <ul role="tabpanel" className="grid items-start gap-4 lg:grid-cols-2">
                {visible.map((b) => (
                  <BookingCard key={b.bookingId} booking={b} today={today} />
                ))}
              </ul>
            ) : (
              <StateMessage
                dashed
                icon={CalendarHeart}
                title={tab === 'upcoming' ? 'No upcoming celebrations' : tab === 'past' ? 'No past bookings' : 'Nothing cancelled'}
                action={
                  tab === 'upcoming' && (
                    <Link to="/categories" className={primaryBtn}>
                      Plan a celebration
                    </Link>
                  )
                }
              />
            ))}

          {state.kind === 'ready' && !last && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--gold-light)] bg-white px-5 text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-[var(--burgundy)] transition-colors hover:border-[var(--burgundy)] disabled:opacity-60"
              >
                {loadingMore && <Loader2 size={14} className="animate-spin" />}
                {loadingMore ? 'Loading' : 'Load older bookings'}
              </button>
              {moreError && <p role="alert" className="mt-2 text-[0.78rem] text-[var(--burgundy)]">{moreError}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
