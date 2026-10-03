import { FaWhatsapp } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'

const WhatsAppButton = () => {
  const { pathname } = useLocation()
  // Experience detail pages show a sticky price bar below lg, so lift the bubble above it there.
  const hasBookingBar = pathname.startsWith('/experience/')

  return (
    <a
      href="https://wa.me/919876543210?text=Hi! I have a query about Forever Moment."
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed right-4 md:right-6 z-[95] w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform ${
        hasBookingBar ? 'bottom-[148px] md:bottom-[92px] lg:bottom-6' : 'bottom-[76px] md:bottom-6'
      }`}
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp size={26} color="white" />
    </a>
  )
}

export default WhatsAppButton
