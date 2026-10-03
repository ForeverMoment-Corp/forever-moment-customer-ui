import { Info, ShieldCheck } from 'lucide-react';
import SectionCard, { Accent } from './SectionCard';
import type { ListItem } from '../types';
import { FONT_SANS, FONT_SERIF } from '../normalize';

type Tone = 'ok' | 'half' | 'no';

const TONE = {
  ok: { dot: 'bg-[#3F7A3F]', badge: 'bg-[#EAF3EA] text-[#3F7A3F]' },
  half: { dot: 'bg-[var(--gold)]', badge: 'bg-[#F6EEDF] text-[#A8853F]' },
  no: { dot: 'bg-[#D4837A]', badge: 'bg-[var(--rose-light)] text-[var(--burgundy)]' },
} satisfies Record<Tone, { dot: string; badge: string }>;

/** Pull the refund figure and the time window out of a policy line so they can be the badge and heading. */
const parsePolicy = (text: string) => {
  const lower = text.toLowerCase();
  const pct = /(\d{1,3})\s*%/.exec(text)?.[1];
  const noRefund = lower.includes('no refund') || lower.includes('no cancellation') || lower.includes('non-refundable');
  const refund = noRefund ? 0 : pct ? Number(pct) : null;
  const tone: Tone = refund === null ? 'ok' : refund >= 75 ? 'ok' : refund > 0 ? 'half' : 'no';
  const badge = refund === null ? 'Refundable' : refund === 0 ? 'No refund' : `${refund}% refund`;
  const [window, ...rest] = text.split(':');
  const hasWindow = rest.length > 0 && window.length < 60;
  return { tone, badge, title: hasWindow ? window.trim() : null, body: hasWindow ? rest.join(':').trim() : text };
};

export default function CancellationPolicy({ policies }: { policies: ListItem[] }) {
  const flexible = policies.some((p) => /(90|100)\s*%|full refund/i.test(p.description));
  const rows = policies.map((p) => ({ id: p.id, ...parsePolicy(p.description) }));
  // Most generous window first, so the reassuring line is read before the strict ones.
  rows.sort((a, b) => ['ok', 'half', 'no'].indexOf(a.tone) - ['ok', 'half', 'no'].indexOf(b.tone));

  return (
    <SectionCard
      id="policy"
      eyebrow="Peace of mind"
      title={<>Cancellation <Accent>policy</Accent></>}
      aside={
        flexible && (
          <span style={{ fontFamily: FONT_SANS }} className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF3EA] text-[#3F7A3F] text-[0.68rem] uppercase tracking-[0.1em] font-semibold px-2.5 py-1.5">
            <ShieldCheck size={13} /> Flexible
          </span>
        )
      }
    >
      <ul className="grid gap-1.5">
        {rows.map((row) => (
          <li key={row.id} className="grid grid-cols-[10px_minmax(0,1fr)] sm:grid-cols-[10px_minmax(0,1fr)_auto] gap-x-3.5 gap-y-2 items-center rounded-[14px] bg-white border border-[var(--border-light)] px-3.5 py-3">
            <span className={`w-2.5 h-2.5 rounded-full ${TONE[row.tone].dot}`} />
            <div className="min-w-0">
              {row.title && (
                <p style={{ fontFamily: FONT_SERIF }} className="text-[1.05rem] font-semibold leading-tight text-[var(--charcoal)]">
                  {row.title}
                </p>
              )}
              <p style={{ fontFamily: FONT_SANS }} className={`text-[0.84rem] leading-relaxed ${row.title ? 'text-[var(--mid)]' : 'text-[#4A3F35]'}`}>
                {row.body}
              </p>
            </div>
            <span style={{ fontFamily: FONT_SANS }} className={`col-start-2 sm:col-start-3 justify-self-start rounded-full px-2.5 py-1 text-[0.66rem] uppercase tracking-[0.1em] font-semibold whitespace-nowrap ${TONE[row.tone].badge}`}>
              {row.badge}
            </span>
          </li>
        ))}
      </ul>
      <p style={{ fontFamily: FONT_SANS }} className="mt-3 flex items-start gap-2 text-[0.76rem] text-[var(--mid)]">
        <Info size={14} className="text-[var(--gold)] shrink-0 mt-0.5" />
        Timelines count from the start of your selected slot.
      </p>
    </SectionCard>
  );
}
