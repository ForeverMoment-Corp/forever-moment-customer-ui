import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronRight, Inbox, LogIn, MessageSquarePlus, RefreshCw } from 'lucide-react';
import { fetchMySupportQueries, getAccessToken, UnauthorizedError, type SupportQuery } from '@/features/support';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

type LoadState =
  | { kind: 'loading' }
  | { kind: 'signed-out' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; items: SupportQuery[] };

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

function StatusBadge({ status }: { status: string }) {
  const resolved = status?.toUpperCase() === 'RESOLVED';
  return (
    <span
      style={{ fontFamily: SANS }}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] ${
        resolved ? 'bg-leaf-light text-leaf' : 'bg-[#FBF3E2] text-gold-dark'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${resolved ? 'bg-leaf' : 'bg-[var(--gold)]'}`} />
      {resolved ? 'Resolved' : 'Open'}
    </span>
  );
}

function QueryCard({ query }: { query: SupportQuery }) {
  const [expanded, setExpanded] = useState(false);
  const long = query.message.length > 220;

  return (
    <li className="rounded-2xl border border-[var(--border-light)] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p style={{ fontFamily: SANS }} className="text-[0.66rem] uppercase tracking-[0.16em] text-gold-deep">
            {query.referenceId}
          </p>
          <h2 style={{ fontFamily: SANS }} className="mt-0.5 text-[0.98rem] font-medium leading-snug text-[var(--charcoal)]">
            {query.subject?.trim() || 'Support query'}
          </h2>
        </div>
        <StatusBadge status={query.status} />
      </div>

      <p
        style={{ fontFamily: SANS }}
        className={`mt-2 whitespace-pre-line text-[0.88rem] leading-relaxed text-cocoa ${long && !expanded ? 'line-clamp-3' : ''}`}
      >
        {query.message}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          style={{ fontFamily: SANS }}
          className="mt-1 text-[0.8rem] font-medium text-[var(--burgundy)] underline underline-offset-4"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      <dl style={{ fontFamily: SANS }} className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-[var(--border-light)] pt-3 text-[0.76rem] text-[var(--mid)]">
        {query.createdOn && (
          <div className="flex gap-1">
            <dt>Sent</dt>
            <dd className="text-[var(--charcoal)]">{formatDate(query.createdOn)}</dd>
          </div>
        )}
        {query.resolvedOn && (
          <div className="flex gap-1">
            <dt>Resolved</dt>
            <dd className="text-[var(--charcoal)]">{formatDate(query.resolvedOn)}</dd>
          </div>
        )}
      </dl>
    </li>
  );
}

export default function MySupportView() {
  const [state, setState] = useState<LoadState>(() => (getAccessToken() ? { kind: 'loading' } : { kind: 'signed-out' }));

  // Bumped by "Try again"; the effect below refetches whenever it changes.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!getAccessToken()) return;
    let alive = true;
    fetchMySupportQueries()
      .then((items) => alive && setState({ kind: 'ready', items }))
      .catch((e) => {
        if (!alive) return;
        if (e instanceof UnauthorizedError) setState({ kind: 'signed-out' });
        else setState({ kind: 'error', message: e instanceof Error ? e.message : 'Could not load your support queries' });
      });
    return () => {
      alive = false;
    };
  }, [attempt]);

  const retry = () => {
    setState(getAccessToken() ? { kind: 'loading' } : { kind: 'signed-out' });
    setAttempt((n) => n + 1);
  };

  const newQueryLink = (
    <Link
      to="/contact"
      style={{ fontFamily: SANS }}
      className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--burgundy)] px-5 text-[0.86rem] font-semibold text-white transition-colors hover:bg-[var(--burgundy-dark)]"
    >
      <MessageSquarePlus size={16} /> Ask a new question
    </Link>
  );

  return (
    <div className="min-h-[70vh] bg-[var(--cream)] pb-12 pt-5">
      <div className="mx-auto max-w-[var(--container-width)] px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" style={{ fontFamily: SANS }} className="text-[0.78rem] text-[var(--mid)]">
          <ol className="flex items-center gap-1">
            <li className="flex items-center gap-1">
              <Link to="/" className="transition-colors hover:text-[var(--burgundy)]">Home</Link>
              <ChevronRight size={12} className="text-[var(--gold)]" />
            </li>
            <li className="flex items-center gap-1">
              <Link to="/help" className="transition-colors hover:text-[var(--burgundy)]">Help centre</Link>
              <ChevronRight size={12} className="text-[var(--gold)]" />
            </li>
            <li className="text-[var(--charcoal)]">My queries</li>
          </ol>
        </nav>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-light)] pb-5">
          <div>
            <p style={{ fontFamily: SANS }} className="text-[0.64rem] uppercase tracking-[0.2em] text-gold-deep">
              Support
            </p>
            <h1 style={{ fontFamily: SERIF }} className="mt-1 text-[1.7rem] font-semibold leading-tight text-[var(--charcoal)] sm:text-[2.1rem]">
              My <em className="italic text-[var(--burgundy)]">queries</em>
            </h1>
            <p style={{ fontFamily: SANS }} className="mt-1.5 max-w-xl text-[0.88rem] leading-relaxed text-[var(--mid)]">
              Everything you have asked us, and where each one stands.
            </p>
          </div>
          {state.kind === 'ready' && state.items.length > 0 && newQueryLink}
        </div>

        <div className="mt-5 max-w-3xl">
          {state.kind === 'loading' && (
            <ul aria-busy="true" aria-label="Loading your queries" className="grid gap-3">
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-[140px] animate-pulse rounded-2xl border border-[var(--border-light)] bg-white/70" />
              ))}
            </ul>
          )}

          {state.kind === 'signed-out' && (
            <div className="rounded-2xl border border-[var(--border-light)] bg-white px-6 py-12 text-center">
              <LogIn size={26} className="mx-auto text-[var(--gold)]" />
              <p style={{ fontFamily: SERIF }} className="mt-2 text-[1.35rem] font-medium text-[var(--charcoal)]">
                Sign in to see your queries
              </p>
              <p style={{ fontFamily: SANS }} className="mx-auto mt-1.5 max-w-sm text-[0.86rem] text-[var(--mid)]">
                You can still reach us without an account. Every message gets a reference number.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  to="/login"
                  style={{ fontFamily: SANS }}
                  className="inline-flex h-11 items-center rounded-xl border border-[var(--border-light)] bg-white px-5 text-[0.86rem] font-medium text-[var(--charcoal)] transition-colors hover:border-[var(--charcoal)]"
                >
                  Sign in
                </Link>
                {newQueryLink}
              </div>
            </div>
          )}

          {state.kind === 'error' && (
            <div role="alert" className="rounded-2xl border border-[var(--border-light)] bg-white px-6 py-12 text-center">
              <AlertCircle size={26} className="mx-auto text-[var(--burgundy)]" />
              <p style={{ fontFamily: SERIF }} className="mt-2 text-[1.35rem] font-medium text-[var(--charcoal)]">
                We could not load your queries
              </p>
              <p style={{ fontFamily: SANS }} className="mx-auto mt-1.5 max-w-sm text-[0.86rem] text-[var(--mid)]">{state.message}</p>
              <button
                type="button"
                onClick={retry}
                style={{ fontFamily: SANS }}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--border-light)] bg-white px-5 text-[0.86rem] font-medium text-[var(--charcoal)] transition-colors hover:border-[var(--charcoal)]"
              >
                <RefreshCw size={15} /> Try again
              </button>
            </div>
          )}

          {state.kind === 'ready' && state.items.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-white/60 px-6 py-14 text-center">
              <Inbox size={26} className="mx-auto text-[var(--gold)]" />
              <p style={{ fontFamily: SERIF }} className="mt-2 text-[1.35rem] font-medium text-[var(--charcoal)]">
                No queries yet
              </p>
              <p style={{ fontFamily: SANS }} className="mx-auto mt-1.5 max-w-sm text-[0.86rem] text-[var(--mid)]">
                When you message us from your account, it shows up here with its status.
              </p>
              <div className="mt-5">{newQueryLink}</div>
            </div>
          )}

          {state.kind === 'ready' && state.items.length > 0 && (
            <ul className="grid gap-3">
              {state.items.map((q) => <QueryCard key={q.id} query={q} />)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
