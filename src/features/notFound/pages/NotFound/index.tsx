import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass, Home } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

const primaryBtn =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--burgundy)] px-6 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--burgundy-dark)]';
const secondaryBtn =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold-light)] bg-white px-6 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-[var(--burgundy)] transition-colors hover:border-[var(--burgundy)]';

/** Catch-all for URLs no route matches (registered last, as `*`). */
export default function NotFound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Vercel answers unknown URLs with 200, so tell search engines not to index this page.
  useDocumentTitle('Page not found', { noindex: true });

  return (
    <section className="flex min-h-[70vh] items-center bg-[var(--cream)] px-4 py-14" style={{ fontFamily: SANS }}>
      <div className="mx-auto w-full max-w-lg text-center">
        <p style={{ fontFamily: SERIF }} className="text-[4rem] font-semibold leading-none text-[var(--gold)] sm:text-[5rem]" aria-hidden="true">
          404
        </p>
        <h1 style={{ fontFamily: SERIF }} className="mt-2 text-[1.7rem] font-semibold leading-tight text-[var(--charcoal)] sm:text-[2.1rem]">
          This page took a <em className="text-[var(--burgundy)]">detour</em>
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[0.9rem] leading-relaxed text-[var(--mid)]">
          We couldn't find <span className="break-all font-medium text-[var(--charcoal)]">{pathname}</span>. The link may be old or mistyped.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className={primaryBtn}>
            <Home size={15} /> Back to home
          </Link>
          <Link to="/categories" className={secondaryBtn}>
            <Compass size={15} /> Explore celebrations
          </Link>
        </div>

        {window.history.length > 1 && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-[var(--mid)] transition-colors hover:text-[var(--burgundy)]"
          >
            <ArrowLeft size={14} /> Go back
          </button>
        )}

        <p className="mt-8 text-[0.76rem] text-[var(--mid)]">
          Looking for something specific?{' '}
          <Link to="/contact" className="font-medium text-[var(--burgundy)] hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </section>
  );
}
