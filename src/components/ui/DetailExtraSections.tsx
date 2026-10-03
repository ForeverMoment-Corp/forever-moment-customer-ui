import { FiCheckCircle, FiShield, FiZap, FiHeadphones, FiMapPin } from 'react-icons/fi'

const needToKnowItems = [
  'Booking confirmation within 2 hours of payment',
  'Our team will contact you to finalize details',
  'Setup time may vary based on venue accessibility',
  'Customizations can be requested up to 48 hours before',
]

const locations = ['Delhi NCR', 'Mumbai', 'Bangalore', 'Jaipur', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata']

const whyUs = [
  { icon: FiCheckCircle, text: 'Verified & Professional Team' },
  { icon: FiShield, text: '100% Money Back Guarantee' },
  { icon: FiZap, text: 'Same Day Availability' },
  { icon: FiHeadphones, text: '24/7 Customer Support' },
]

// ============================================
// REUSABLE — Need To Know + Locations + Why Us + Cancellation
// kisi bhi detail page mein ek line se add ho jayega
// ============================================
const DetailExtraSections = () => {
  return (
    <div className="space-y-6 mt-6">

      {/* NEED TO KNOW */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_color-mix(in_srgb,_var(--ink)_5%,_transparent)]">
        <h3 style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-ink font-semibold tracking-[0.15em] uppercase mb-3">Need To Know</h3>
        <ul className="space-y-2">
          {needToKnowItems.map((item) => (
            <li key={item} style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.8rem] text-taupe flex items-start gap-2">
              <span className="text-gold mt-0.5">•</span> {item}
            </li>
          ))}
        </ul>
      </div>

      {/* LOCATIONS */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_color-mix(in_srgb,_var(--ink)_5%,_transparent)]">
        <h3 style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-ink font-semibold tracking-[0.15em] uppercase mb-3 flex items-center gap-2">
          <FiMapPin size={14} color="var(--gold)" /> Available In These Cities
        </h3>
        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => (
            <span key={loc} style={{ fontFamily: "'Jost', sans-serif" }} className="bg-ivory border border-sand rounded-full px-3 py-1.5 text-[0.75rem] text-taupe">{loc}</span>
          ))}
        </div>
      </div>

      {/* WHY TOGETHER MOMENTS */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_color-mix(in_srgb,_var(--ink)_5%,_transparent)]">
        <h3 style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-ink font-semibold tracking-[0.15em] uppercase mb-3">Why Together Moments</h3>
        <div className="grid grid-cols-2 gap-3">
          {whyUs.map((w) => (
            <div key={w.text} className="flex items-center gap-2">
              <w.icon size={15} color="var(--sage)" className="shrink-0" />
              <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.76rem] text-taupe">{w.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CANCELLATION POLICY */}
      <div className="bg-[#FFF8EC] border border-sand rounded-2xl p-5">
        <h3 style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-ink font-semibold tracking-[0.15em] uppercase mb-2">Cancellation Policy</h3>
        <p style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.78rem] text-taupe leading-relaxed">
          Free cancellation up to 48 hours before the scheduled time. Cancellations within 48 hours incur a 25% convenience fee. No refund for cancellations made on the day of the event.
        </p>
      </div>

    </div>
  )
}

export default DetailExtraSections