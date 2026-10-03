import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/navigation/footer';
import FloatingBookingCTA from '@/components/FloatingBookingCTA/FloatingBooking';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import BottomNav from '@/components/layout/BottomNav';

const CustomerLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className='min-h-screen bg-[#FDFAF4] text-[#1A1208] flex flex-col pb-[60px] md:pb-0'>
      {/* Navbar manages its own fixed positioning internally */}
      <Navbar />

      {/* CONTENT */}
      <main className="relative z-0 flex-1">
        <Outlet />
        {/* Experience detail pages ship their own price + book bar */}
        {!pathname.startsWith('/experience/') && <FloatingBookingCTA />}
      </main>

      <WhatsAppButton />
      <BottomNav />
      <Footer />
    </div>
  );
};

export default CustomerLayout;
