import { useEffect, useRef, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/navigation/footer';
import FloatingBookingCTA from '@/components/FloatingBookingCTA/FloatingBooking';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import BottomNav from '@/components/layout/BottomNav';
import LoginModal from '@/features/auth/components/LoginModal';
import LogoutConfirmModal from '@/features/auth/components/LogoutConfirmModal';
import { applySeo, type SeoMeta } from '@/lib/seo';
import { trackPageView, identifyUser } from '@/lib/analytics';
import type { RootState } from '@/store/store';

/**
 * Metadata for fixed pages. Pages named from data (category, collection, experience), search and
 * the 404 page set their own with useSeo, so they are deliberately not listed here.
 * Account and payment pages are private: kept out of search results.
 */
const PAGE_SEO: Record<string, SeoMeta> = {
  '/': {}, // site defaults
  '/categories': {
    title: 'All celebrations',
    description: 'Browse every occasion we set up: birthdays, anniversaries, candlelight dinners, baby showers and more.',
  },
  '/subcategories': {
    title: 'All collections',
    description: 'Every decor and experience collection in one place. Pick a theme and book a setup at your venue.',
  },
  '/featured-experiences': {
    title: 'Featured experiences',
    description: 'Our most loved celebration setups and experiences, handpicked for you.',
  },
  '/help': { title: 'Help centre', description: 'Answers about booking, payments, setup and cancellations, and how to reach us.' },
  '/faqs': { title: 'FAQs', description: 'Answers about booking, payments, setup and cancellations.', path: '/help' },
  '/contact': {
    title: 'Contact us',
    description: 'Tell us the occasion, the date and your budget. We reply with ideas, photos of past setups and a quote.',
  },
  '/support': { title: 'My support queries', noindex: true },
  '/profile': { title: 'My profile', noindex: true },
  '/bookings': { title: 'My bookings', noindex: true },
  '/payment/status': { title: 'Complete your payment', noindex: true },
  '/payment/success': { title: 'Payment', noindex: true },
  '/payment/cancel': { title: 'Payment not completed', noindex: true },
};

/**
 * Thin gold bar across the top while the next page's code downloads (routes are code-split, and the
 * router keeps the current page up until the next one is ready). Waits 150 ms so fast loads never flash.
 */
function NavigationProgress() {
  const loading = useNavigation().state === 'loading';
  const [visible, setVisible] = useState(false);
  // Hide as soon as the page has arrived (render-time adjustment, no effect).
  if (!loading && visible) setVisible(false);
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setVisible(true), 150);
    return () => window.clearTimeout(t);
  }, [loading]);
  if (!visible) return null;
  return (
    <div role="progressbar" aria-label="Loading page" className="fixed inset-x-0 top-0 z-[1100] h-[3px] overflow-hidden bg-gold/20">
      <div className="nav-progress-bar h-full w-1/3 bg-gold" />
    </div>
  );
}

const CustomerLayout = () => {
  const { pathname } = useLocation();
  const user = useSelector((state: RootState) => state.auth?.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth?.isAuthenticated);

  // Identify the user to GA4 on first render when a session is already active.
  const identified = useRef(false);
  useEffect(() => {
    if (!identified.current && isAuthenticated && user?.id) {
      identifyUser(user.id);
      identified.current = true;
    }
  }, [isAuthenticated, user?.id]);

  // Track every SPA route change as a GA4 page_view.
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    if (path in PAGE_SEO) applySeo({ path, ...PAGE_SEO[path] });
    trackPageView(path);
  }, [pathname]);

  return (
    <div className='min-h-screen bg-ivory text-ink flex flex-col pb-[60px] md:pb-0'>
      <NavigationProgress />
      {/* Navbar manages its own fixed positioning internally */}
      <Navbar />

      {/* CONTENT */}
      <main className="relative z-0 flex-1">
        <Outlet />
        {/* Experience detail pages ship their own price + action bar; payment results need no upsell */}
        {!pathname.startsWith('/experience/') && !pathname.startsWith('/payment/') && <FloatingBookingCTA />}
      </main>

      <WhatsAppButton />
      <BottomNav />
      <Footer />
      
      {/* Global Modals */}
      <LoginModal />
      <LogoutConfirmModal />

      {/* New pages open at the top; Back / Forward return to where the guest was on the page. */}
      <ScrollRestoration />
    </div>
  );
};

export default CustomerLayout;
