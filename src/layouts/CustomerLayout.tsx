import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/navigation/footer';
import FloatingBookingCTA from '@/components/FloatingBookingCTA/FloatingBooking';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import BottomNav from '@/components/layout/BottomNav';
import LoginModal from '@/features/auth/components/LoginModal';
import { formatTitle } from '@/hooks/useDocumentTitle';

/**
 * Tab titles for fixed pages. Pages named from data (category, collection, experience) and the
 * 404 page set their own with useDocumentTitle, so they are deliberately not listed here.
 */
const PAGE_TITLES: Record<string, string | null> = {
  '/': null, // default title
  '/categories': 'All celebrations',
  '/subcategories': 'All collections',
  '/featured-experiences': 'Featured experiences',
  '/help': 'Help centre',
  '/faqs': 'FAQs',
  '/contact': 'Contact us',
  '/support': 'My support queries',
  '/profile': 'My profile',
  '/bookings': 'My bookings',
  '/cart': 'My cart',
  '/payment/status': 'Complete your payment',
  '/payment/success': 'Payment',
  '/payment/cancel': 'Payment not completed',
};

const CustomerLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    if (path in PAGE_TITLES) document.title = formatTitle(PAGE_TITLES[path]);
  }, [pathname]);

  return (
    <div className='min-h-screen bg-ivory text-ink flex flex-col pb-[60px] md:pb-0'>
      {/* Navbar manages its own fixed positioning internally */}
      <Navbar />

      {/* CONTENT */}
      <main className="relative z-0 flex-1">
        <Outlet />
        {/* Experience detail and cart pages ship their own price + action bar; payment results need no upsell */}
        {!pathname.startsWith('/experience/') && pathname !== '/cart' && !pathname.startsWith('/payment/') && <FloatingBookingCTA />}
      </main>

      <WhatsAppButton />
      <BottomNav />
      <Footer />
      
      {/* Global Modals */}
      <LoginModal />

      {/* New pages open at the top; Back / Forward return to where the guest was on the page. */}
      <ScrollRestoration />
    </div>
  );
};

export default CustomerLayout;
