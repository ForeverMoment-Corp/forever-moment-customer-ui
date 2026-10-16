import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeLogoutConfirm, logoutUser } from '../store/authSlice';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

/** Account pages that make no sense signed out: leave them for the home page after logging out. */
const PRIVATE_PATHS = ['/profile', '/bookings', '/support', '/payment'];

/** "Are you sure you want to log out?" Opened from every logout button via openLogoutConfirm(). */
export default function LogoutConfirmModal() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector((s) => s.auth.isLogoutConfirmOpen);
  const [busy, setBusy] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Escape closes, page scroll is locked, and focus starts on the safe choice.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) dispatch(closeLogoutConfirm());
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    cancelRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, busy, dispatch]);

  const close = () => {
    if (!busy) dispatch(closeLogoutConfirm());
  };

  const confirm = async () => {
    setBusy(true);
    try {
      await dispatch(logoutUser());
      if (PRIVATE_PATHS.some((p) => window.location.pathname.startsWith(p))) navigate('/', { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="logout-confirm"
          className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/50 px-4 backdrop-blur-[2px]"
          onClick={(e) => e.target === e.currentTarget && close()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            aria-describedby="logout-confirm-body"
            className="w-full max-w-[360px] rounded-3xl border border-[var(--border-light)] bg-white px-6 pb-6 pt-7 text-center shadow-[var(--shadow-soft)]"
            style={{ fontFamily: SANS }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--rose-light)] text-[var(--burgundy)]">
              <LogOut size={20} />
            </span>
            <h2 id="logout-confirm-title" style={{ fontFamily: SERIF }} className="mt-3 text-[1.5rem] font-semibold leading-tight text-[var(--charcoal)]">
              Log out?
            </h2>
            <p id="logout-confirm-body" className="mt-1 text-[0.86rem] text-[var(--mid)]">
              Are you sure you want to log out?
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button
                ref={cancelRef}
                type="button"
                onClick={close}
                disabled={busy}
                className="h-11 rounded-full border border-[var(--border-light)] bg-white text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-[var(--charcoal)] transition-colors hover:border-[var(--charcoal)] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={busy}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--burgundy)] text-[0.76rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--burgundy-dark)] disabled:opacity-70"
              >
                {busy && <Loader2 size={14} className="animate-spin" />}
                {busy ? 'Logging out' : 'Log out'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
