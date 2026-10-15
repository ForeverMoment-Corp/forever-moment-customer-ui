import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdEmail } from 'react-icons/md';
import { ArrowLeft, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store/store';
import { closeLoginModal, loginSuccess, fetchProfile } from '../store/authSlice';
import styles from './LoginModal.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleOAuthProvider, useGoogleOAuth } from '@react-oauth/google';
import { ensureGoogleInitialized, renderGoogleButton, setGoogleCredentialHandler, type GoogleCredential } from '../googleIdentity';
import { emailLogin, googleLogin } from '../store/api';
import { isInAppBrowser } from '@/lib/inAppBrowser';

const GOOGLE_CLIENT_ID = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');

/** Google's button once its script is ready; a same-size placeholder until then, so there is no dead button. */
function GoogleButton({
    width,
    failed,
    onSuccess,
    onError,
}: {
    width: number;
    failed: boolean;
    onSuccess: (response: GoogleCredential) => void;
    onError: () => void;
}) {
    const { scriptLoadedSuccessfully, clientId } = useGoogleOAuth();
    const containerRef = useRef<HTMLDivElement>(null);

    // Fresh handlers on every render; Google's one callback (set up once) forwards to them.
    useEffect(() => {
        setGoogleCredentialHandler((response) => (response.credential ? onSuccess(response) : onError()));
        return () => setGoogleCredentialHandler(null);
    }, [onSuccess, onError]);

    // Initialise Google once per page, then just (re)draw the button each time the popup opens.
    useEffect(() => {
        if (!scriptLoadedSuccessfully || !containerRef.current) return;
        if (ensureGoogleInitialized(clientId)) renderGoogleButton(containerRef.current, width);
    }, [scriptLoadedSuccessfully, clientId, width]);

    if (failed) {
        return <p className={styles.googleNote}>Google sign-in couldn't load (an ad or privacy blocker may be stopping it). Please use email below.</p>;
    }
    if (!scriptLoadedSuccessfully) {
        return (
            <span className={styles.googlePlaceholder} style={{ width }} aria-live="polite">
                <Loader2 size={15} className="animate-spin" /> Loading Google sign-in…
            </span>
        );
    }
    return <div ref={containerRef} style={{ minHeight: 40 }} />;
}

const LoginModal: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isModalOpen = useSelector((state: RootState) => state.auth?.isLoginModalOpen);
    const [mobileNumber, setMobileNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    // 'options' = phone + Google + Email button; 'email' = email/password form
    const [view, setView] = useState<'options' | 'email'>('options');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [googleWidth, setGoogleWidth] = useState<number | null>(null);
    // Google's script loads the first time the popup opens and then stays loaded: one setup per page
    // visit (re-creating it on every open is what left the button unresponsive at times).
    const [googleWanted, setGoogleWanted] = useState(false);
    if (isModalOpen && !googleWanted) setGoogleWanted(true);
    const [googleFailed, setGoogleFailed] = useState(false);
    const [inAppBrowser] = useState(isInAppBrowser);

    // Google's button only accepts a fixed pixel width (200-400), so match it to the modal
    const measureGoogleSlot = useCallback((el: HTMLDivElement | null) => {
        if (el) setGoogleWidth(Math.max(200, Math.min(400, Math.floor(el.offsetWidth))));
    }, []);

    const close = () => dispatch(closeLoginModal());

    // Escape to close and lock page scroll while open
    useEffect(() => {
        if (!isModalOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') dispatch(closeLoginModal());
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKeyDown);
            // Start fresh next time the popup opens
            setError(null);
            setView('options');
            setPassword('');
            setShowPassword(false);
            setSubmitting(false);
        };
    }, [isModalOpen, dispatch]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) close();
    };

    const isInputValid = mobileNumber.length === 10;
    const isEmailFormValid = /^\S+@\S+\.\S+$/.test(email.trim()) && password.length > 0;

    const switchView = (next: 'options' | 'email') => {
        setError(null);
        setView(next);
    };

    // POST /auth/login, then the same session handling as Google sign-in
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEmailFormValid || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            const result = await emailLogin(email.trim(), password);
            dispatch(loginSuccess(result));
            // The login response only carries the email; the profile fills in name / id
            dispatch(fetchProfile());
        } catch (err) {
            setError(err instanceof Error && err.message ? err.message : "We couldn't log you in. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // Portal to <body> so the navbar / bottom nav stacking contexts can't sit on top of it
    const popup = (
        <AnimatePresence>
            {isModalOpen && (
                <motion.div
                    key="login-overlay"
                    className={styles.overlay}
                    onClick={handleOverlayClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={styles.modalContent}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="login-modal-title"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
                    >
                        <span className={styles.accent} aria-hidden="true" />
                        <span className={styles.handle} aria-hidden="true" />

                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={close}
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>

                        {view === 'email' ? (
                            <>
                                <button type="button" className={styles.backBtn} onClick={() => switchView('options')}>
                                    <ArrowLeft size={16} />
                                    All sign-in options
                                </button>

                                <h2 id="login-modal-title" className={`${styles.title} mb-4`}>
                                    Log in with email
                                </h2>

                                {error && <p className={`${styles.error} ${styles.errorInline}`} role="alert">{error}</p>}

                                <form onSubmit={handleEmailLogin} noValidate>
                                    <label htmlFor="login-email" className={styles.label}>
                                        Email
                                    </label>
                                    <div className={`${styles.inputGroup} mb-3`}>
                                        <input
                                            id="login-email"
                                            type="email"
                                            autoComplete="email"
                                            autoFocus
                                            className={styles.inputField}
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>

                                    <label htmlFor="login-password" className={styles.label}>
                                        Password
                                    </label>
                                    <div className={styles.inputGroup}>
                                        <input
                                            id="login-password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            className={styles.inputField}
                                            placeholder="Your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        className={`${styles.otpBtn} ${isEmailFormValid && !submitting ? styles.otpBtnActive : ''}`}
                                        disabled={!isEmailFormValid || submitting}
                                    >
                                        {submitting && <Loader2 size={18} className="animate-spin" />}
                                        {submitting ? 'Logging in…' : 'Log in'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                            <h2 id="login-modal-title" className={styles.title}>
                                Welcome in
                            </h2>
                            <p className={styles.subtitle}>Log in or sign up to book faster.</p>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!isInputValid) return;
                                    console.log('Request OTP for', mobileNumber);
                                }}
                            >
                                <label htmlFor="login-mobile" className={styles.label}>
                                    Mobile number
                                </label>
                                <div className={styles.inputGroup}>
                                    <span className={styles.countryCode}>+91</span>
                                    <input
                                        id="login-mobile"
                                        type="tel"
                                        inputMode="numeric"
                                        autoComplete="tel-national"
                                        autoFocus
                                        className={styles.inputField}
                                        placeholder="98765 43210"
                                        value={mobileNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setMobileNumber(val);
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`${styles.otpBtn} ${isInputValid ? styles.otpBtnActive : ''}`}
                                    disabled={!isInputValid}
                                >
                                    Get OTP
                                </button>
                            </form>

                            <div className={styles.dividerContainer}>
                                <div className={styles.dividerLine}></div>
                                <div className={styles.dividerText}>or continue with</div>
                                <div className={styles.dividerLine}></div>
                            </div>

                            {error && <p className={styles.error} role="alert">{error}</p>}

                            <div ref={measureGoogleSlot} className={styles.googleSlot}>
                                {inAppBrowser ? (
                                    <p className={styles.googleNote}>
                                        Google sign-in doesn't work inside this app's browser. Open this page in Chrome or Safari to use it, or continue with email.
                                    </p>
                                ) : (
                                    GOOGLE_CLIENT_ID &&
                                    googleWidth && (
                                        <GoogleButton
                                            width={googleWidth}
                                            failed={googleFailed}
                                            onSuccess={async (credentialResponse) => {
                                                if (!credentialResponse.credential) return;
                                                try {
                                                    setError(null);
                                                    const result = await googleLogin(credentialResponse.credential);
                                                    dispatch(loginSuccess(result));
                                                    // Fetch full profile info in background
                                                    dispatch(fetchProfile());
                                                } catch (e) {
                                                    console.error('Google login error', e);
                                                    setError(e instanceof Error && e.message ? e.message : "We couldn't sign you in with Google. Please try again.");
                                                }
                                            }}
                                            onError={() => {
                                                setError('Google sign-in was cancelled or failed. Please try again.');
                                            }}
                                        />
                                    )
                                )}
                            </div>

                            <button type="button" className={styles.emailBtn} onClick={() => switchView('email')}>
                                <MdEmail className={styles.socialIcon} />
                                <span className={styles.socialText}>Continue with Email</span>
                            </button>
                            </>
                        )}

                        <p className={styles.footerText}>
                            By continuing, you agree to our{' '}
                            <a href="/terms" className={styles.link}>
                                Terms
                            </a>
                            {' '}&{' '}
                            <a href="/privacy" className={styles.link}>
                                Privacy Policy
                            </a>.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
    return createPortal(
        googleWanted && GOOGLE_CLIENT_ID && !inAppBrowser ? (
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} onScriptLoadError={() => setGoogleFailed(true)}>
                {popup}
            </GoogleOAuthProvider>
        ) : (
            popup
        ),
        document.body
    );
};

export default LoginModal;
