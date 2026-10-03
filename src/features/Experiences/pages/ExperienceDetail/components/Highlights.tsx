import { CalendarCheck, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react';
import { FONT_SANS } from '../normalize';

const ITEMS = [
  { icon: Sparkles, text: 'Set up by our team' },
  { icon: CalendarCheck, text: 'Free cancellation 24h+' },
  { icon: ShieldCheck, text: 'Verified decorators' },
  { icon: MessageSquareText, text: 'Instant confirmation' },
];

/** Four trust pills under the gallery. */
export default function Highlights() {
  return (
    <ul style={{ fontFamily: FONT_SANS }} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {ITEMS.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-2 rounded-[14px] bg-white border border-[var(--border-light)] px-3 py-2 text-[0.78rem] leading-snug font-medium text-[#4A3F35]">
          <Icon size={18} strokeWidth={1.8} className="text-[var(--burgundy)] shrink-0" />
          {text}
        </li>
      ))}
    </ul>
  );
}
