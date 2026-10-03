import { useState } from 'react';
import { Check, MapPin, X } from 'lucide-react';
import { FONT_SANS } from '../normalize';

// Demo rule until a serviceability endpoint exists.
const SERVICEABLE = new Set(['110001', '110059']);

export default function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<'available' | 'unavailable' | null>(null);

  const check = () => {
    if (pincode.length !== 6) return;
    setResult(SERVICEABLE.has(pincode) ? 'available' : 'unavailable');
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2.5 h-11 rounded-[14px] border bg-white pl-3.5 pr-1.5 transition-colors focus-within:border-[var(--charcoal)] ${
          result === 'unavailable' ? 'border-[var(--rose)]' : result === 'available' ? 'border-[#3F7A3F]' : 'border-[var(--border-light)]'
        }`}
      >
        <MapPin size={16} className="text-[var(--gold)] shrink-0" />
        <input
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ''));
            setResult(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          placeholder="Delivery pincode"
          aria-label="Delivery pincode"
          style={{ fontFamily: FONT_SANS }}
          className="flex-1 min-w-0 bg-transparent text-[0.9rem] text-[var(--charcoal)] placeholder:text-[var(--mid)] outline-none"
        />
        <button
          type="button"
          onClick={check}
          disabled={pincode.length !== 6}
          style={{ fontFamily: FONT_SANS }}
          className="shrink-0 rounded-[10px] px-3 py-2 text-[0.8rem] font-semibold text-[var(--burgundy)] hover:bg-[var(--rose-light)] transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Check
        </button>
      </div>
      {result === 'available' && (
        <p style={{ fontFamily: FONT_SANS }} className="mt-2 flex items-center gap-1.5 text-[0.78rem] font-medium text-[#3F7A3F]">
          <Check size={13} strokeWidth={3} /> We deliver to {pincode}.
        </p>
      )}
      {result === 'unavailable' && (
        <p style={{ fontFamily: FONT_SANS }} className="mt-2 flex items-center gap-1.5 text-[0.78rem] font-medium text-[var(--rose)]">
          <X size={13} strokeWidth={3} /> Not serviceable here yet. Try a nearby pincode.
        </p>
      )}
    </div>
  );
}
