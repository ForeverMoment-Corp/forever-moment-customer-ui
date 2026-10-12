import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Loader2, RefreshCw, XCircle } from 'lucide-react';
import type { RootState } from '@/store/store';
import { checkBookingStatus, waitForPaymentLink } from '@/features/experiences/store/api';
import { clearPendingPayment, readPendingPayment, savePendingPayment } from '@/features/bookings/pendingPayment';
import { closePaymentTab, openCheckoutInNewTab, openPaymentTab, paymentStatusPath, sendTabToCheckout } from '@/features/bookings/paymentTab';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

/**
 * waiting: Checkout is open in another tab; poll until the guest pays (or gives up).
 * success: Stripe sent the guest back after paying; the webhook may still be on its way.
 */
const POLL = {
  waiting: { timeoutMs: 15 * 60_000, intervalMs: 3_000 },
  success: { timeoutMs: 20_000, intervalMs: 2_000 },
};

type Outcome = 'waiting' | 'success' | 'cancel';
type View = 'waiting' | 'checking' | 'paid' | 'processing' | 'timeout' | 'failed' | 'cancelled';

/** The payments service answers `{ status: PROCESSED | FAILED | PENDING }`, possibly inside the platform envelope. */
const paymentStatusOf = (body: unknown): string => {
  const b = (body ?? {}) as { status?: unknown; response?: { status?: unknown } };
  return String(b.response?.status ?? b.status ?? 'PENDING').toUpperCase();
};

const COPY: Record<View, { title: string; body: string; icon: typeof CheckCircle2; tone: string }> = {
  waiting: {
    title: 'Complete your payment',
    body: 'The secure payment page is open in a new tab. This page updates on its own once you have paid.',
    icon: Loader2,
    tone: 'bg-[var(--gold-pale)] text-[var(--gold-dark)]',
  },
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
  timeout: {
    title: "We haven't received your payment yet",
    body: 'Your booking is saved. Open the payment page to finish, or check again if you have just paid.',
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
 * /payment/status?bookingId — this tab, while Stripe Checkout is open in a new one.
 * /payment/success?session_id&bookingId and /payment/cancel?bookingId — where Stripe sends the
 * guest back (URLs set in the payment service's `payment.gateway.*-url`).
 */
export default function PaymentResult({ outcome }: { outcome: Outcome }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const [pending, setPending] = useState(readPendingPayment);
  const bookingId = params.get('bookingId') || pending?.bookingId || '';
  // Details saved before Checkout opened only apply when they are for this booking.
  const saved = pending && pending.bookingId === bookingId ? pending : null;

  // What this tab is doing now; a retry turns any outcome into "waiting". `run` restarts the poll.
  const [mode, setMode] = useState<Outcome>(outcome);
  const [run, setRun] = useState(0);
  const [view, setView] = useState<View>('checking');
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => setMode(outcome), [outcome]);

  useEffect(() => {
    if (mode === 'cancel') {
      setView('cancelled');
      return;
    }
    if (!bookingId || !user) {
      setView('processing');
      return;
    }
    let alive = true;
    const { timeoutMs, intervalMs } = POLL[mode];
    const deadline = Date.now() + timeoutMs;
    setView(mode === 'waiting' ? 'waiting' : 'checking');
    (async () => {
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
        if (Date.now() + intervalMs > deadline) {
          if (alive) setView(mode === 'waiting' ? 'timeout' : 'processing');
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    })();
    return () => {
      alive = false;
    };
  }, [mode, run, bookingId, user]);

  const startWaiting = () => {
    if (outcome !== 'waiting') navigate(paymentStatusPath(bookingId), { replace: true });
    setMode('waiting');
    setRun((n) => n + 1);
  };

  /** Reopen the Checkout URL saved when the booking was made (synchronous, so no popup blocker). */
  const openSavedCheckout = () => {
    if (!saved?.checkoutUrl) return;
    openCheckoutInNewTab(saved.checkoutUrl);
    if (view !== 'waiting') startWaiting();
  };

  /** Fetch the link again (it may have changed after a failure) and open it in a new tab. */
  const retryPayment = async () => {
    if (!user || !bookingId) return;
    const tab = openPaymentTab();
    setRetrying(true);
    setRetryError(null);
    try {
      const url = await waitForPaymentLink(bookingId, { id: user.id, role: user.role }, { timeoutMs: 15_000 });
      if (!url) {
        closePaymentTab(tab);
        setRetryError('The payment page is not ready yet. Please try again in a minute.');
        return;
      }
      const next = { ...(saved ?? { bookingId }), checkoutUrl: url };
      savePendingPayment(next);
      setPending(next);
      if (!sendTabToCheckout(tab, url)) openCheckoutInNewTab(url);
      startWaiting();
    } catch (e) {
      closePaymentTab(tab);
      setRetryError(e instanceof Error && e.message ? e.message : 'Could not open the payment page.');
    } finally {
      setRetrying(false);
    }
  };

  const copy = COPY[view];
  const Icon = copy.icon;
  const spinning = view === 'waiting' || view === 'checking';
  const canPay = (view === 'waiting' || view === 'timeout' || view === 'failed' || view === 'cancelled') && !!bookingId && !!user;
  // Waiting/timeout reuse the open session; after a failure or cancel, ask for the link again.
  const reuseSaved = (view === 'waiting' || view === 'timeout') && !!saved?.checkoutUrl;

  return (
    <section className="flex min-h-[70vh] items-center bg-[var(--cream)] px-4 py-12" style={{ fontFamily: SANS }}>
      <div className="mx-auto w-full max-w-md rounded-3xl border border-[var(--border-light)] bg-white px-6 py-10 text-center shadow-[var(--shadow-soft)] sm:px-10">
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${copy.tone}`}>
          <Icon size={30} className={spinning ? 'animate-spin' : ''} />
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
            {canPay ? (
              <button type="button" onClick={reuseSaved ? openSavedCheckout : retryPayment} disabled={retrying} className={primaryBtn}>
                {retrying ? <Loader2 size={15} className="animate-spin" /> : reuseSaved ? <ExternalLink size={15} /> : <RefreshCw size={15} />}
                {retrying ? 'Opening' : view === 'waiting' ? 'Open payment page' : view === 'timeout' ? 'Pay now' : 'Try payment again'}
              </button>
            ) : (
              <Link to="/bookings" className={primaryBtn}>
                View my bookings
              </Link>
            )}
            {view === 'timeout' ? (
              <button type="button" onClick={startWaiting} className={secondaryBtn}>
                <RefreshCw size={15} /> Check again
              </button>
            ) : canPay ? (
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

        {view === 'waiting' && (
          <p className="mx-auto mt-4 max-w-xs text-[0.74rem] leading-snug text-[var(--mid)]">
            No new tab? Your browser may have blocked it. Use “Open payment page” above.
          </p>
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
