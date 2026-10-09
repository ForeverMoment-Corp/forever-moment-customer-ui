import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { closeLoginModal, loginSuccess, fetchProfile } from '../store/authSlice';
import styles from './LoginModal.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { googleLogin } from '../store/api';

const LoginModal: React.FC = () => {
    const dispatch = useDispatch();
    const isModalOpen = useSelector((state: RootState) => state.auth?.isLoginModalOpen);
    const [mobileNumber, setMobileNumber] = useState('');

    if (!isModalOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            dispatch(closeLoginModal());
        }
    };

    const isInputValid = mobileNumber.length === 10;

    return (
        <AnimatePresence>
            <motion.div 
                className={styles.overlay} 
                onClick={handleOverlayClick}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div 
                    className={styles.modalContent}
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                >
                    <button 
                        className={styles.closeBtn} 
                        onClick={() => dispatch(closeLoginModal())}
                    >
                        <X size={24} />
                    </button>
                    
                    <h2 className={styles.title}>
                        Log in or sign up
                    </h2>
                    <p className={styles.subtitle}>
                        Track your decor, book faster and unlock member prices.
                    </p>

                    <div className={styles.inputGroup}>
                        <div className={styles.countryCode}>
                            +91
                        </div>
                        <input
                            type="tel"
                            className={styles.inputField}
                            placeholder="10-digit mobile number"
                            value={mobileNumber}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length <= 10) setMobileNumber(val);
                            }}
                        />
                    </div>

                    <button 
                        className={`${styles.otpBtn} ${isInputValid ? styles.otpBtnActive : ''}`}
                        disabled={!isInputValid}
                        onClick={() => {
                            console.log('Request OTP for', mobileNumber);
                        }}
                    >
                        Get OTP
                    </button>

                    <div className={styles.dividerContainer}>
                        <div className={styles.dividerLine}></div>
                        <div className={styles.dividerText}>or continue with</div>
                        <div className={styles.dividerLine}></div>
                    </div>

                    <div className={styles.socialGrid}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        if (credentialResponse.credential) {
                                            try {
                                                const result = await googleLogin(credentialResponse.credential);
                                                console.log('Login successful', result);
                                                dispatch(loginSuccess(result));
                                                // Fetch full profile info in background
                                                dispatch(fetchProfile() as any);
                                            } catch (e) {
                                                console.error('Google login error', e);
                                            }
                                        }
                                    }}
                                    onError={() => {
                                        console.error('Login Failed');
                                    }}
                                    type="icon"
                                    shape="circle"
                                />
                            </GoogleOAuthProvider>
                        </div>
                        
                        <button type="button" className={styles.socialBtn}>
                            <FaFacebook className={`${styles.socialIcon} text-[#1877F2]`} />
                            <span className={styles.socialText}>Facebook</span>
                        </button>

                        <button type="button" className={styles.socialBtn}>
                            <MdEmail className={`${styles.socialIcon} text-gray-600`} />
                            <span className={styles.socialText}>Email</span>
                        </button>
                    </div>

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
        </AnimatePresence>
    );
};

export default LoginModal;
