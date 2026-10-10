import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, Loader2, RefreshCw, XCircle } from 'lucide-react';
import type { RootState } from '@/store/store';
import { checkBookingStatus, waitForPaymentLink } from '@/features/experiences/store/api';
import { clearPendingPayment, readPendingPayment, savePendingPayment } from '@/features/bookings/pendingPayment';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

/** How long to wait for the Stripe webhook to mark the payment before calling it "processing". */
const VERIFY_TIMEOUT_MS = 20_000;
const VERIFY_INTERVAL_MS = 2_000;

type Outcome = 'success' | 'cancel';
type View = 'checking' | 'paid' | 'processing' | 'failed' | 'cancelled';

/** The payments service answers `{ status: PROCESSED | FAILED | PENDING }`, possibly inside the platform envelope. */
const paymentStatusOf = (body: unknown): string => {
  const b = (body ?? {}) as { status?: unknown; response?: { status?: unknown } };
  return String(b.response?.status ?? b.status ?? 'PENDING').toUpperCase();
};

const COPY: Record<View, { title: string; body: string; icon: typeof CheckCircle2; tone: string }> = {
  checking: {
    title: 'Confirming your payment',
    body: 'This takes a few seconds. Please keep this page open.',
    icon: Loader2,
    tone: 'bg-[var(--gold-pale)] text-[var(--gold-dark)]',
  },
  paid: {
    title: 'Your celebration is booked',
    body: 'Payment received. A confirmation with every detail is on its way to your email.',
    icon: CheckCircle2,
    tone: 'bg-leaf-light text-leaf',
  },
  processing: {
    title: 'Payment is being processed',
    body: 'Stripe has your payment and we are confirming it. Your booking will show as confirmed shortly.',
    icon: Clock,
    tone: 'bg-[var(--gold-pale)] text-[var(--gold-dark)]',
  },
  failed: {
    title: 'Payment did not go through',
    body: 'No money was taken. Your booking is saved, so you can try paying again.',
    icon: XCircle,
    tone: 'bg-[var(--rose-light)] text-[var(--burgundy)]',
  },
  cancelled: {
    title: 'Payment not completed',
    body: 'You left the payment page before paying. Your booking is saved for now, so you can pick up where you left off.',
    icon: AlertCircle,
    tone: 'bg-[var(--rose-light)] text-[var(--burgundy)]',
  },
};

const primaryBtn =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--burgundy)] px-6 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--burgundy-dark)] disabled:opacity-70';
const secondaryBtn =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold-light)] bg-white px-6 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[var(--burgundy)] transition-colors hover:border-[var(--burgundy)]';

/**
 * Where Stripe Checkout sends the guest back to: `/payment/success?session_id&bookingId` or
 * `/payment/cancel?bookingId` (URLs set in the payment service's `payment.gateway.*-url`).
 */
export default function PaymentResult({ outcome }: { outcome: Outcome }) {
  const [params] = useSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const [pending] = useState(readPendingPayment);
  const bookingId = params.get('bookingId') || pending?.bookingId || '';
  // Details saved before the redirect only apply when they are for this booking.
  const saved = pending && pending.bookingId === bookingId ? pending : null;

  const [view, setView] = useState<View>(outcome === 'cancel' ? 'cancelled' : bookingId && user ? 'checking' : 'processing');
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  // Stripe redirects before its webhook reaches us, so poll the payment status for a short while.
  useEffect(() => {
    if (outcome !== 'success' || !bookingId || !user) return;
    let alive = true;
    const deadline = Date.now() + VERIFY_TIMEOUT_MS;
    const poll = async () => {
      while (alive) {
        try {
          const status = paymentStatusOf(await checkBookingStatus(bookingId, { id: user.id, role: user.role }));
          if (!alive) return;
          if (status === 'PROCESSED') {
            clearPendingPayment();
            setView('paid');
            return;
          }
          if (status === 'FAILED') {
            setView('failed');
            return;
          }
        } catch {
          // A failed check is treated like "not confirmed yet"; the deadline still applies.
        }
        if (Date.now() + VERIFY_INTERVAL_MS > deadline) {
          if (alive) setView('processing');
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, VERIFY_INTERVAL_MS));
      }
    };
    poll();
    return () => {
      alive = false;
    };
  }, [outcome, bookingId, user]);

  const retryPayment = async () => {
    if (!user || !bookingId) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const url = await waitForPaymentLink(bookingId, { id: user.id, role: user.role }, { timeoutMs: 15_000 });
      if (url) {
        savePendingPayment(saved ?? { bookingId });
        window.location.assign(url);
        return;
      }
      setRetryError('The payment page is not ready yet. Please try again in a minute.');
    } catch (e) {
      setRetryError(e instanceof Error && e.message ? e.message : 'Could not open the payment page.');
    }
    setRetrying(false);
  };

  const copy = COPY[view];
  const Icon = copy.icon;
  const canRetry = (view === 'cancelled' || view === 'failed') && !!bookingId && !!user;

  return (
    <section className="flex min-h-[70vh] items-center bg-[var(--cream)] px-4 py-12" style={{ fontFamily: SANS }}>
      <div className="mx-auto w-full max-w-md rounded-3xl border border-[var(--border-light)] bg-white px-6 py-10 text-center shadow-[var(--shadow-soft)] sm:px-10">
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${copy.tone}`}>
          <Icon size={30} className={view === 'checking' ? 'animate-spin' : ''} />
        </span>

        <h1 style={{ fontFamily: SERIF }} className="mt-5 text-[1.9rem] font-semibold leading-tight text-[var(--charcoal)]" aria-live="polite">
          {copy.title}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[0.88rem] leading-relaxed text-[var(--mid)]">{copy.body}</p>

        {(bookingId || saved?.experienceName) && (
          <dl className="mt-6 grid gap-1.5 rounded-xl bg-[var(--cream)] px-4 py-3 text-left text-[0.8rem]">
            {saved?.experienceName && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--mid)]">Experience</dt>
                <dd className="text-right font-medium text-[var(--charcoal)]">{saved.experienceName}</dd>
              </div>
            )}
            {bookingId && (
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--mid)]">Booking ref</dt>
                <dd className="break-all text-right font-medium text-[var(--charcoal)]">{bookingId}</dd>
              </div>
            )}
          </dl>
        )}

        {view !== 'checking' && (
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {canRetry ? (
              <button type="button" onClick={retryPayment} disabled={retrying} className={primaryBtn}>
                {retrying ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                {retrying ? 'Opening' : 'Try payment again'}
              </button>
            ) : (
              <Link to="/bookings" className={primaryBtn}>
                View my bookings
              </Link>
            )}
            {canRetry ? (
              <Link to="/bookings" className={secondaryBtn}>
                My bookings
              </Link>
            ) : (
              <Link to={saved?.experiencePath && view !== 'paid' ? saved.experiencePath : '/'} className={secondaryBtn}>
                {saved?.experiencePath && view !== 'paid' ? 'Back to experience' : 'Back to home'}
              </Link>
            )}
          </div>
        )}

        {retryError && (
          <p role="alert" className="mt-3 text-[0.78rem] text-[var(--burgundy)]">
            {retryError}
          </p>
        )}

        <p className="mt-6 text-[0.74rem] text-[var(--mid)]">
          Need help?{' '}
          <Link to="/contact" className="font-medium text-[var(--burgundy)] hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </section>
  );
}
