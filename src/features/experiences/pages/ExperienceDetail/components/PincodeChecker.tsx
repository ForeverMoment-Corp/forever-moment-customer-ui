import { useRef, useState } from 'react';
import { AlertCircle, Check, Loader2, MapPin, X } from 'lucide-react';
import { checkPincodeServiceability, type PincodeArea } from '@/features/experiences/store/api';
import { FONT_SANS } from '../normalize';

export type PincodeResult = 'available' | 'unavailable' | null;

interface Props {
  /** The experience being booked; serviceability is checked for it specifically. */
  experienceId: number;
  /** Reports each finished check (and the reset when the pincode is edited) so the booking panel can react. */
  onResult?: (pincode: string, result: PincodeResult, area: PincodeArea | null) => void;
}

type State =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'done'; result: 'available' | 'unavailable'; area: PincodeArea | null }
  | { kind: 'error' };

const placeOf = (area: PincodeArea | null) => {
  if (!area) return '';
  const city = area.locationCity || area.locationName || '';
  const parts = [area.areaName?.trim(), city.trim()].filter(Boolean);
  return parts.join(', ');
};

/** Venue pincode check against GET /public/experiences/{id}/serviceable. */
export default function PincodeChecker({ experienceId, onResult }: Props) {
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });
  // Only the latest request may update the UI, in case an earlier one answers late.
  const requestId = useRef(0);

  const check = async () => {
    if (pincode.length !== 6 || state.kind === 'checking') return;
    const id = ++requestId.current;
    setState({ kind: 'checking' });
    try {
      const { serviceable, area } = await checkPincodeServiceability(experienceId, pincode);
      if (id !== requestId.current) return;
      const result = serviceable ? 'available' : 'unavailable';
      setState({ kind: 'done', result, area });
      onResult?.(pincode, result, area);
    } catch {
      if (id !== requestId.current) return;
      setState({ kind: 'error' });
    }
  };

  const result = state.kind === 'done' ? state.result : null;
  const place = state.kind === 'done' ? placeOf(state.area) : '';

  return (
    <div>
      <div
        className={`flex h-11 items-center gap-2.5 rounded-[14px] border bg-white pl-3.5 pr-1.5 transition-colors focus-within:border-[var(--charcoal)] ${
          result === 'unavailable' ? 'border-[var(--rose)]' : result === 'available' ? 'border-leaf' : 'border-[var(--border-light)]'
        }`}
      >
        <MapPin size={16} className="shrink-0 text-[var(--gold)]" />
        <input
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            setPincode(value);
            requestId.current++;
            setState({ kind: 'idle' });
            onResult?.(value, null, null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && void check()}
          placeholder="Venue pincode"
          aria-label="Venue pincode"
          aria-describedby="pincode-status"
          style={{ fontFamily: FONT_SANS }}
          className="min-w-0 flex-1 bg-transparent text-[0.9rem] text-[var(--charcoal)] outline-none placeholder:text-[var(--mid)]"
        />
        <button
          type="button"
          onClick={() => void check()}
          disabled={pincode.length !== 6 || state.kind === 'checking'}
          style={{ fontFamily: FONT_SANS }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] px-3 py-2 text-[0.8rem] font-semibold text-[var(--burgundy)] transition-colors hover:bg-[var(--rose-light)] disabled:opacity-40 disabled:hover:bg-transparent"
        >
          {state.kind === 'checking' && <Loader2 size={13} className="animate-spin" />}
          {state.kind === 'checking' ? 'Checking' : 'Check'}
        </button>
      </div>

      <div id="pincode-status" aria-live="polite" style={{ fontFamily: FONT_SANS }}>
        {result === 'available' && (
          <p className="mt-2 flex items-center gap-1.5 text-[0.78rem] font-medium text-leaf">
            <Check size={13} strokeWidth={3} /> We set up at {pincode}{place ? `, ${place}` : ''}.
          </p>
        )}
        {result === 'unavailable' && (
          <p className="mt-2 flex items-start gap-1.5 text-[0.78rem] font-medium text-[var(--rose)]">
            <X size={13} strokeWidth={3} className="mt-0.5 shrink-0" />
            {place
              ? `We cover ${pincode} (${place}), but this setup isn't offered there yet. Try another setup or a nearby pincode.`
              : `We don't set up at ${pincode} yet. Try a nearby pincode.`}
          </p>
        )}
        {state.kind === 'error' && (
          <p className="mt-2 flex items-center gap-1.5 text-[0.78rem] font-medium text-[var(--mid)]">
            <AlertCircle size={13} className="shrink-0" /> Couldn't check right now. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
