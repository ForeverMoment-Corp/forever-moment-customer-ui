import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { AlertTriangle, Loader2, Star } from 'lucide-react';
import type { AppDispatch } from '@/store/store';
import { deactivateAccount, deleteAccount } from '@/features/auth/store/authSlice';
import { fetchMyReviews, type Review } from '@/features/reviews/api';
import { experiencePath } from '@/features/experiences/utils/slug';

const SERIF = "'Cormorant Garamond', serif";

const card = 'rounded-[22px] border border-[var(--border-light)] bg-white p-5 sm:p-7';

const REVIEW_STATUS: Record<string, { label: string; className: string }> = {
    APPROVED: { label: 'Published', className: 'bg-leaf-light text-leaf' },
    PENDING: { label: 'In review', className: 'bg-gold-pale text-gold-dark' },
    REJECTED: { label: 'Not published', className: 'bg-[var(--linen)] text-[var(--mid)]' },
};

/** GET /user/reviews — what the user has written and whether it is live yet. */
export function MyReviews() {
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        fetchMyReviews()
            .then((list) => alive && setReviews(list))
            .catch((e) => alive && setError(e instanceof Error ? e.message : 'Could not load your reviews'));
        return () => {
            alive = false;
        };
    }, []);

    return (
        <section className={card} aria-labelledby="my-reviews">
            <h2 id="my-reviews" style={{ fontFamily: SERIF }} className="text-[1.45rem] font-semibold leading-tight text-[var(--charcoal)]">
                My reviews
            </h2>
            {reviews === null && !error && (
                <div className="mt-4 h-16 animate-pulse rounded-xl bg-[var(--cream)]" aria-busy="true" aria-label="Loading your reviews" />
            )}
            {error && <p className="mt-2 text-[0.84rem] text-[var(--mid)]">{error}</p>}
            {reviews && reviews.length === 0 && (
                <p className="mt-1 text-[0.84rem] text-[var(--mid)]">
                    You haven't reviewed anything yet. After your celebration, rate it from the experience page.
                </p>
            )}
            {reviews && reviews.length > 0 && (
                <ul className="mt-3 divide-y divide-[var(--border-light)]">
                    {reviews.map((r) => {
                        const status = r.status ? REVIEW_STATUS[r.status] : undefined;
                        return (
                            <li key={r.id} className="py-3.5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        {r.experienceId ? (
                                            <Link
                                                to={experiencePath({ id: r.experienceId })}
                                                className="block truncate text-[0.92rem] font-medium text-[var(--charcoal)] hover:text-[var(--burgundy)]"
                                            >
                                                {r.experienceName || 'Experience'}
                                            </Link>
                                        ) : (
                                            <p className="truncate text-[0.92rem] font-medium text-[var(--charcoal)]">{r.experienceName || 'Experience'}</p>
                                        )}
                                        <span className="mt-0.5 inline-flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Star key={i} size={12} className={i <= r.rating ? 'fill-[var(--gold)] text-[var(--gold)]' : 'fill-linen text-[var(--gold-light)]'} />
                                            ))}
                                        </span>
                                    </div>
                                    {status && (
                                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.66rem] font-semibold ${status.className}`}>{status.label}</span>
                                    )}
                                </div>
                                {(r.title || r.comment) && (
                                    <p className="mt-1.5 line-clamp-3 text-[0.82rem] leading-snug text-[var(--mid)]">
                                        {r.title && <span className="font-medium text-[var(--charcoal)]">{r.title}. </span>}
                                        {r.comment}
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

type Pending = 'deactivate' | 'delete' | null;

/** POST /user/profile/deactivate and DELETE /user/profile, each behind a confirmation. */
export function AccountSettings() {
    const dispatch = useDispatch<AppDispatch>();
    const [confirming, setConfirming] = useState<Pending>(null);
    const [password, setPassword] = useState('');
    const [typed, setTyped] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setConfirming(null);
        setPassword('');
        setTyped('');
        setError(null);
    };

    const run = async () => {
        setBusy(true);
        setError(null);
        try {
            if (confirming === 'deactivate') await dispatch(deactivateAccount()).unwrap();
            else await dispatch(deleteAccount(password)).unwrap();
            // Signed out now: the page switches to its signed-out view.
        } catch (e) {
            setError(typeof e === 'string' ? e : 'Something went wrong. Please try again.');
            setBusy(false);
        }
    };

    const canDelete = typed.trim().toUpperCase() === 'DELETE';

    return (
        <section className={card} aria-labelledby="account-settings">
            <h2 id="account-settings" style={{ fontFamily: SERIF }} className="text-[1.45rem] font-semibold leading-tight text-[var(--charcoal)]">
                Account
            </h2>

            {!confirming && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border-light)] p-4">
                        <p className="text-[0.88rem] font-medium text-[var(--charcoal)]">Deactivate account</p>
                        <p className="mt-0.5 text-[0.76rem] leading-snug text-[var(--mid)]">Switch your account off for now. Contact us to turn it back on.</p>
                        <button
                            type="button"
                            onClick={() => setConfirming('deactivate')}
                            className="mt-3 text-[0.8rem] font-medium text-[var(--burgundy)] underline underline-offset-4"
                        >
                            Deactivate
                        </button>
                    </div>
                    <div className="rounded-xl border border-[var(--border-light)] p-4">
                        <p className="text-[0.88rem] font-medium text-[var(--charcoal)]">Delete account</p>
                        <p className="mt-0.5 text-[0.76rem] leading-snug text-[var(--mid)]">Permanently remove your account and personal details.</p>
                        <button
                            type="button"
                            onClick={() => setConfirming('delete')}
                            className="mt-3 text-[0.8rem] font-medium text-[var(--burgundy)] underline underline-offset-4"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {confirming && (
                <div className="mt-4 rounded-xl border border-[var(--rose-light)] bg-[var(--rose-light)]/40 p-4">
                    <p className="flex items-center gap-2 text-[0.9rem] font-semibold text-[var(--burgundy)]">
                        <AlertTriangle size={16} />
                        {confirming === 'delete' ? 'Delete your account permanently?' : 'Deactivate your account?'}
                    </p>
                    <p className="mt-1 text-[0.8rem] leading-snug text-[var(--mid)]">
                        {confirming === 'delete'
                            ? 'This cannot be undone. Upcoming bookings are not cancelled automatically, so cancel them first if you need to. Enter your password to confirm (signed up with Google? Contact us to delete your account).'
                            : "You'll be signed out and won't be able to sign in until our team reactivates it."}
                    </p>

                    {confirming === 'delete' && (
                        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                            <input
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                aria-label="Your password"
                                className="h-10 rounded-lg border border-[var(--border-light)] bg-white px-3 text-[0.84rem] outline-none focus:border-[var(--burgundy)]"
                            />
                            <input
                                value={typed}
                                onChange={(e) => setTyped(e.target.value)}
                                placeholder='Type "DELETE" to confirm'
                                aria-label='Type "DELETE" to confirm'
                                className="h-10 rounded-lg border border-[var(--border-light)] bg-white px-3 text-[0.84rem] outline-none focus:border-[var(--burgundy)]"
                            />
                        </div>
                    )}

                    {error && (
                        <p role="alert" className="mt-2.5 text-[0.8rem] text-[var(--burgundy)]">
                            {error}
                        </p>
                    )}

                    <div className="mt-3.5 flex flex-wrap justify-end gap-2">
                        <button
                            type="button"
                            onClick={reset}
                            disabled={busy}
                            className="inline-flex h-10 items-center rounded-xl border border-[var(--border-light)] bg-white px-4 text-[0.84rem] font-medium text-[var(--charcoal)] transition-colors hover:border-[var(--charcoal)] disabled:opacity-60"
                        >
                            Keep my account
                        </button>
                        <button
                            type="button"
                            onClick={run}
                            disabled={busy || (confirming === 'delete' && (!canDelete || !password))}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--burgundy)] px-4 text-[0.84rem] font-semibold text-white transition-colors hover:bg-[var(--burgundy-dark)] disabled:opacity-50"
                        >
                            {busy && <Loader2 size={15} className="animate-spin" />}
                            {confirming === 'delete' ? 'Delete account' : 'Deactivate'}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
