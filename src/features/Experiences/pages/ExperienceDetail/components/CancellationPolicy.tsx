import { AlertCircle, Info, ShieldCheck } from 'lucide-react';
import SectionCard, { Accent } from './SectionCard';
import type { ListItem } from '../types';
import { FONT_SANS, FONT_SERIF } from '../normalize';

type Tone = 'ok' | 'half' | 'no';

const TONE = {
  ok: { dot: 'bg-leaf', rail: 'bg-leaf', badge: 'bg-leaf-light text-leaf' },
  half: { dot: 'bg-[var(--gold)]', rail: 'bg-[var(--gold)]', badge: 'bg-linen text-gold-deep' },
  no: { dot: 'bg-rose', rail: 'bg-rose', badge: 'bg-[var(--rose-light)] text-[var(--burgundy)]' },
} satisfies Record<Tone, { dot: string; rail: string; badge: string }>;

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
  const windows = rows.filter((r) => r.title);
  const notes = rows.filter((r) => !r.title);

  return (
    <SectionCard
      id="policy"
      eyebrow="Peace of mind"
      title={<>Cancellation <Accent>policy</Accent></>}
      aside={
        flexible && (
          <span style={{ fontFamily: FONT_SANS }} className="inline-flex items-center gap-1.5 rounded-full bg-leaf-light text-leaf text-[0.68rem] uppercase tracking-[0.1em] font-semibold px-2.5 py-1.5">
            <ShieldCheck size={13} /> Flexible
          </span>
        )
      }
    >
      {/* Windows with a time frame form a refund timeline, most generous first; the rail colour
          shows how much comes back. Free-text rules (e.g. festival dates) are listed as notes. */}
      {windows.length > 0 && (
        <ol className="rounded-[20px] border border-[var(--sand)] bg-white px-4 py-2 sm:px-5">
          {windows.map((row, i) => (
            <li key={row.id} className="relative grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-x-3.5 py-3">
              {i < windows.length - 1 && <span aria-hidden className={`absolute left-[8px] top-[calc(50%+9px)] h-[calc(100%-18px)] w-[2px] rounded-full ${TONE[row.tone].rail} opacity-40`} />}
              <span className={`relative z-[1] h-[18px] w-[18px] rounded-full border-[3px] border-white ${TONE[row.tone].dot} shadow-[0_0_0_1px_var(--sand)]`} />
              <div className="min-w-0">
                <p style={{ fontFamily: FONT_SERIF }} className="text-[1.05rem] font-semibold leading-tight text-[var(--charcoal)]">{row.title}</p>
                <p style={{ fontFamily: FONT_SANS }} className="text-[0.8rem] leading-relaxed text-[var(--mid)]">{row.body}</p>
              </div>
              <span style={{ fontFamily: FONT_SANS }} className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.1em] ${TONE[row.tone].badge}`}>
                {row.badge}
              </span>
            </li>
          ))}
        </ol>
      )}

      {notes.length > 0 && (
        <div className="mt-3 rounded-[18px] border border-dashed border-[var(--rose)] bg-[var(--rose-light)]/60 px-4 py-3">
          <p style={{ fontFamily: FONT_SANS }} className="flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--burgundy)]">
            <AlertCircle size={13} /> Please note
          </p>
          <ul style={{ fontFamily: FONT_SANS }} className="mt-1.5 grid gap-1.5 text-[0.84rem] leading-relaxed text-cocoa">
            {notes.map((row) => <li key={row.id}>{row.body}</li>)}
          </ul>
        </div>
      )}

      <p style={{ fontFamily: FONT_SANS }} className="mt-3 flex items-start gap-2 text-[0.76rem] text-[var(--mid)]">
        <Info size={14} className="text-[var(--gold)] shrink-0 mt-0.5" />
        Timelines count from the start of your selected slot.
      </p>
    </SectionCard>
  );
}
