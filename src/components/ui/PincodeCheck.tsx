import { useState } from 'react'
import { FiMapPin, FiCheck, FiX } from 'react-icons/fi'

const PincodeCheck = () => {
  const [pincode, setPincode] = useState('')
  const [result, setResult] = useState<'available' | 'unavailable' | null>(null)

  const checkAvailability = () => {
    if (pincode.length !== 6) return
    // ============================================
    // DEMO LOGIC — real app mein API call hoga
    // abhi: even last digit = available
    // ============================================
    const lastDigit = Number(pincode[pincode.length - 1])
    setResult(lastDigit % 2 === 0 ? 'available' : 'unavailable')
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_color-mix(in_srgb,_var(--ink)_5%,_transparent)]">
      <h3 style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.72rem] text-ink font-semibold tracking-[0.15em] uppercase mb-3 flex items-center gap-2">
        <FiMapPin size={14} color="var(--gold)" /> Check Delivery Availability
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter pincode"
          value={pincode}
          onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setResult(null) }}
          style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.82rem' }}
          className="flex-1 bg-ivory border border-sand rounded-xl px-4 py-2.5 outline-none focus:border-gold transition-colors text-ink"
        />
        <button
          onClick={checkAvailability}
          style={{ fontFamily: "'Jost', sans-serif" }}
          className="bg-ink text-white rounded-xl px-5 text-[0.72rem] uppercase tracking-wider font-semibold hover:bg-gold transition-colors shrink-0"
        >
          Check
        </button>
      </div>
      {result === 'available' && (
        <p style={{ fontFamily: "'Jost', sans-serif" }} className="flex items-center gap-1.5 text-[0.78rem] text-sage mt-2 font-medium"><FiCheck size={13} /> Available for delivery!</p>
      )}
      {result === 'unavailable' && (
        <p style={{ fontFamily: "'Jost', sans-serif" }} className="flex items-center gap-1.5 text-[0.78rem] text-coral mt-2 font-medium"><FiX size={13} /> Sorry, not serviceable here yet.</p>
      )}
    </div>
  )
}

export default PincodeCheck