import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/navigation/footer';
import FloatingBookingCTA from '@/components/FloatingBookingCTA/FloatingBooking';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import BottomNav from '@/components/layout/BottomNav';
import LoginModal from '@/features/auth/components/LoginModal';

const CustomerLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
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
    </div>
  );
};

export default CustomerLayout;
