import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ArrowRight, BadgeCheck, Calendar, Clock, MapPin, MessageCircle, ShieldCheck, Star, Tag, Users } from 'lucide-react';

import AddOns from './AddOns';
import OrderSummary from './OrderSummary';
import PincodeChecker from './PincodeChecker';
import type { AddOn, ExperienceVM } from '../types';
import { FONT_SANS, FONT_SERIF, formatDuration, formatINR } from '../normalize';

export interface BookingCardProps {
  experience: ExperienceVM;
  addons: AddOn[];
  toggleAddon: (id: number) => void;
  /** Everything the guest ticked, including extras chosen further down the page. */
  selectedAddons: AddOn[];
  totalPrice: number;
  onViewReviews: () => void;
}

const QUICK_DAYS = 2;
const DAY = 86_400_000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date | null, b: Date) => !!a && startOfDay(a).getTime() === startOfDay(b).getTime();
const toISODate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** A slot (or location) is bookable on a date when the date sits inside its validFrom..validTo window. */
const validOn = (iso: string, from: string | null, to: string | null) => (!from || iso >= from) && (!to || iso <= to);

/** Slots starting less than this many minutes from now are not offered for today. */
const LEAD_MINUTES = 0;
const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
/** True when the slot's start time has already gone by on the given date. */
const isPast = (startTime: string, dateIso: string, now: Date) =>
  dateIso === toISODate(now) && toMinutes(startTime) <= now.getHours() * 60 + now.getMinutes() + LEAD_MINUTES;

/** The "More" chip opens the calendar. It has the same footprint as a date chip and, once a
 *  calendar date is picked, shows that date in the same weekday / day / month format. */
const MoreChip = forwardRef<HTMLButtonElement, { onClick?: () => void; picked: Date | null }>(({ onClick, picked }, ref) => (
  <button
    type="button"
    ref={ref}
    onClick={onClick}
    aria-pressed={!!picked}
    aria-label={picked ? `Change date, currently ${picked.toDateString()}` : 'Pick another date'}
    style={{ fontFamily: FONT_SANS }}
    className={`shrink-0 w-[60px] rounded-[12px] border py-1.5 text-center transition-colors ${
      picked ? 'bg-[var(--charcoal)] border-[var(--charcoal)] text-white' : 'bg-white border-dashed border-[var(--border-light)] text-[var(--burgundy)] hover:border-[var(--charcoal)]'
    }`}
  >
    {picked ? (
      <>
        <span className="block text-[0.64rem] uppercase tracking-[0.1em] text-white/70">{picked.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
        <span style={{ fontFamily: FONT_SERIF }} className="block text-[1.2rem] leading-tight font-semibold">{picked.getDate()}</span>
        <span className="block text-[0.64rem] text-white/70">{picked.toLocaleDateString('en-IN', { month: 'short' })}</span>
      </>
    ) : (
      <>
        <span className="block text-[0.64rem] uppercase tracking-[0.1em]">More</span>
        <span className="flex h-[1.5rem] items-center justify-center"><Calendar size={17} /></span>
        <span className="block text-[0.64rem]">dates</span>
      </>
    )}
  </button>
));
MoreChip.displayName = 'MoreChip';

function Label({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div style={{ fontFamily: FONT_SANS }} className="flex items-baseline justify-between mb-2">
      <p className="text-[0.86rem] font-semibold text-[var(--charcoal)]">{children}</p>
      {hint && <span className="text-[0.74rem] text-[var(--mid)]">{hint}</span>}
    </div>
  );
}

export default function BookingCard({ experience: e, addons, toggleAddon, selectedAddons, totalPrice, onViewReviews }: BookingCardProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const quickDays = useMemo(() => Array.from({ length: QUICK_DAYS }, (_, i) => new Date(today.getTime() + i * DAY)), [today]);

  const [date, setDate] = useState<Date | null>(null);
  const [locationId, setLocationId] = useState<number | null>(e.locationOptions[0]?.id ?? null);
  const [slotId, setSlotId] = useState<number | null>(null);
  const [dateError, setDateError] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponNote, setCouponNote] = useState<string | null>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  const inQuickRowEffective = (d: Date | null) => !!d && quickDays.some((q) => sameDay(d, q));

  // "Now" ticks once a minute so a slot disappears from today's list as soon as its start time passes.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Slots come from the API per location; only those valid on the chosen date and not yet started are offered.
  const location = e.locationOptions.find((l) => l.id === locationId) ?? e.locationOptions[0] ?? null;
  const pool = location ? location.timeslots : e.timeslots;
  const slotsOn = (d: Date) => {
    const iso = toISODate(d);
    if (location && !validOn(iso, location.validFrom, location.validTo)) return [];
    return pool.filter((s) => validOn(iso, s.validFrom, s.validTo) && !isPast(s.startTime, iso, now));
  };
  const hasAnySlots = pool.length > 0;
  // Until the guest picks a day, use the first upcoming day that still has a slot (today when some remain).
  const effectiveDate = date ?? quickDays.find((d) => !hasAnySlots || slotsOn(d).length > 0) ?? null;
  const slots = effectiveDate ? slotsOn(effectiveDate) : pool;
  // The chosen slot stays only while it is offered; otherwise the first available one is used.
  const effectiveSlotId = slots.some((s) => s.id === slotId) ? slotId : slots[0]?.id ?? null;
  const selectedSlot = slots.find((s) => s.id === effectiveSlotId) ?? null;
  const addedCount = selectedAddons.length;

  const pick = (d: Date | null) => {
    setDate(d);
    setDateError(false);
  };

  const handleBook = () => {
    if (!effectiveDate || (hasAnySlots && !selectedSlot)) {
      setDateError(true);
      dateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    // TODO: hand off to checkout once the booking flow exists.
  };

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    setCouponNote(`${code} will be validated at checkout.`);
  };

  return (
    <div
      id="booking-card"
      className="scroll-mt-[90px] md:scroll-mt-[136px] bg-white rounded-[26px] border border-[var(--border-light)] shadow-[0_30px_70px_-30px_rgba(124,45,59,0.3)] p-4 sm:p-5 flex flex-col gap-4 [&>*]:min-w-0"
    >
      {/* Title */}
      <div>
        <div style={{ fontFamily: FONT_SANS }} className="flex items-center gap-2 flex-wrap">
          <span className="text-[0.66rem] uppercase tracking-[0.2em] font-medium text-[#A8853F]">{e.subCategoryName}</span>
          {e.isFeatured && (
            <span className="rounded-full bg-[var(--burgundy)] text-white text-[0.6rem] uppercase tracking-[0.12em] font-semibold px-2 py-0.5">Bestseller</span>
          )}
          {e.tag && (
            <span className="rounded-full border border-[var(--gold)] bg-white text-[var(--burgundy)] text-[0.6rem] uppercase tracking-[0.12em] font-semibold px-2 py-0.5">{e.tag}</span>
          )}
        </div>
        <h1 style={{ fontFamily: FONT_SERIF }} className="mt-1.5 text-[1.6rem] sm:text-[1.8rem] leading-[1.1] font-semibold text-[var(--charcoal)] text-balance">
          {e.name}
        </h1>
        <ul style={{ fontFamily: FONT_SANS }} className="mt-2 flex items-center gap-x-3.5 gap-y-1 flex-wrap text-[0.8rem] text-[var(--mid)]">
          <li>
            <button type="button" onClick={onViewReviews} className="group inline-flex items-center gap-1">
              <Star size={13} className="fill-[var(--gold)] text-[var(--gold)]" />
              <span className="font-medium text-[var(--charcoal)]">{e.rating}</span>
              <span className="underline decoration-[var(--gold)] underline-offset-4 group-hover:text-[var(--burgundy)] transition-colors">{e.reviewCount} reviews</span>
            </button>
          </li>
          {e.locations.length > 0 && (
            <li className="inline-flex items-center gap-1 capitalize"><MapPin size={12} className="text-[var(--gold)]" /> {e.locations.slice(0, 2).join(', ')}</li>
          )}
          {e.durationMinutes > 0 && (
            <li className="inline-flex items-center gap-1"><Clock size={12} className="text-[var(--gold)]" /> {formatDuration(e.durationMinutes)} setup</li>
          )}
          {e.maxCapacity > 0 && (
            <li className="inline-flex items-center gap-1"><Users size={12} className="text-[var(--gold)]" /> Up to {e.maxCapacity} guests</li>
          )}
        </ul>
      </div>

      {/* Price */}
      <div className="pt-4 border-t border-[var(--border-light)]">
        <p style={{ fontFamily: FONT_SANS }} className="text-[0.66rem] uppercase tracking-[0.2em] font-medium text-[#A8853F]">Starting price</p>
        <div className="mt-1.5 flex items-baseline gap-2.5 flex-wrap">
          <span style={{ fontFamily: FONT_SERIF }} className="text-[2.1rem] leading-none font-bold text-[var(--charcoal)] tabular-nums">
            {formatINR(e.basePrice)}
          </span>
          {e.discount > 0 && (
            <>
              <span style={{ fontFamily: FONT_SANS }} className="text-[0.95rem] text-[var(--mid)] line-through tabular-nums">{formatINR(e.originalPrice)}</span>
              <span style={{ fontFamily: FONT_SANS }} className="rounded-full bg-[#EAF3EA] text-[#3F7A3F] text-[0.72rem] font-semibold px-2.5 py-1">Save {e.discount}%</span>
            </>
          )}
        </div>
        <p style={{ fontFamily: FONT_SANS }} className="mt-1 text-[0.78rem] text-[var(--mid)]">per setup · inclusive of all taxes</p>
      </div>

      {/* When */}
      <div ref={dateRef}>
        <Label hint="Or pick a date">When do you need it?</Label>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {quickDays.map((d, i) => {
            const active = sameDay(effectiveDate, d);
            const soldOut = hasAnySlots && slotsOn(d).length === 0;
            return (
              <button
                key={d.getTime()}
                type="button"
                onClick={() => pick(d)}
                disabled={soldOut}
                aria-pressed={active}
                title={soldOut ? 'No slots left on this day' : undefined}
                style={{ fontFamily: FONT_SANS }}
                className={`shrink-0 w-[60px] rounded-[12px] border py-1.5 text-center transition-colors ${
                  active ? 'bg-[var(--charcoal)] border-[var(--charcoal)] text-white' : 'bg-white border-[var(--border-light)] hover:border-[var(--charcoal)]'
                } ${dateError ? 'border-[var(--rose)]' : ''} disabled:opacity-40 disabled:line-through disabled:hover:border-[var(--border-light)] disabled:cursor-not-allowed`}
              >
                <span className={`block text-[0.64rem] uppercase tracking-[0.1em] ${active ? 'text-white/70' : 'text-[var(--mid)]'}`}>
                  {i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-IN', { weekday: 'short' })}
                </span>
                <span style={{ fontFamily: FONT_SERIF }} className="block text-[1.2rem] leading-tight font-semibold">{d.getDate()}</span>
                <span className={`block text-[0.64rem] ${active ? 'text-white/70' : 'text-[var(--mid)]'}`}>{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
              </button>
            );
          })}
          <DatePicker
            selected={effectiveDate}
            onChange={pick}
            minDate={today}
            customInput={<MoreChip picked={effectiveDate && !inQuickRowEffective(effectiveDate) ? effectiveDate : null} />}
            calendarClassName="fm-datepicker"
            wrapperClassName="shrink-0"
            popperPlacement="bottom-end"
          />
        </div>
        {dateError && (
          <p style={{ fontFamily: FONT_SANS }} className="mt-1.5 text-[0.78rem] font-medium text-[var(--rose)]">
            {effectiveDate ? 'Pick a time slot to continue.' : 'Pick a date to continue.'}
          </p>
        )}
      </div>

      {/* Where: pick the city when the experience is offered in more than one */}
      {e.locationOptions.length > 1 && (
        <div>
          <Label hint={`${e.locationOptions.length} cities`}>Which city?</Label>
          <div className="flex flex-wrap gap-2">
            {e.locationOptions.map((l) => {
              const active = l.id === location?.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLocationId(l.id)}
                  aria-pressed={active}
                  style={{ fontFamily: FONT_SANS }}
                  className={`rounded-full border px-3.5 py-2 text-[0.84rem] capitalize transition-colors ${
                    active ? 'bg-[var(--charcoal)] border-[var(--charcoal)] text-white' : 'bg-white border-[var(--border-light)] text-[var(--charcoal)] hover:border-[var(--charcoal)]'
                  }`}
                >
                  {l.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Slot: from the API, filtered by the chosen date */}
      <div>
        <Label hint={slots.length > 0 ? `${slots.length} available` : hasAnySlots ? 'None on this date' : 'On request'}>Time slot</Label>
        {slots.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const active = slot.id === effectiveSlotId;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSlotId(slot.id)}
                  aria-pressed={active}
                  style={{ fontFamily: FONT_SANS }}
                  className={`rounded-full border px-3 py-1.5 text-[0.82rem] transition-colors ${
                    active ? 'bg-[var(--burgundy)] border-[var(--burgundy)] text-white' : 'bg-white border-[var(--border-light)] text-[var(--charcoal)] hover:border-[var(--burgundy)]'
                  }`}
                >
                  {slot.label}
                  {slot.sublabel && <span className={`ml-1.5 text-[0.72rem] ${active ? 'text-white/75' : 'text-[var(--mid)]'}`}>{slot.sublabel}</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <p style={{ fontFamily: FONT_SANS }} className="rounded-[14px] border border-dashed border-[var(--border-light)] bg-[var(--cream)]/60 px-4 py-3 text-[0.82rem] leading-relaxed text-[var(--mid)]">
            {!hasAnySlots
              ? 'Time slots for this setup are confirmed on WhatsApp after you book.'
              : effectiveDate && sameDay(effectiveDate, now)
                ? "Today's slots have all started. Pick a later date."
                : 'No time slots on this date. Try another date, or chat with us and we will arrange one.'}
          </p>
        )}
        {selectedSlot?.maxCapacity != null && selectedSlot.maxCapacity <= 3 && (
          <p style={{ fontFamily: FONT_SANS }} className="mt-1.5 text-[0.76rem] font-medium text-[var(--burgundy)]">
            Only {selectedSlot.maxCapacity} booking{selectedSlot.maxCapacity === 1 ? '' : 's'} left in this slot.
          </p>
        )}
      </div>

      {/* Where */}
      <div>
        <Label hint={location ? <span className="capitalize">{location.name}</span> : 'Check availability'}>Where is the celebration?</Label>
        <PincodeChecker />
      </div>

      {/* Add-ons */}
      {addons.length > 0 && (
        <div>
          <Label hint={addedCount > 0 ? `${addedCount} added` : 'Optional'}>Make it extra special</Label>
          <AddOns addons={addons} toggleAddon={toggleAddon} />
        </div>
      )}

      {/* Coupon */}
      {!couponOpen ? (
        <button type="button" onClick={() => setCouponOpen(true)} style={{ fontFamily: FONT_SANS }} className="self-start inline-flex items-center gap-2 text-[0.84rem] font-medium text-[var(--burgundy)] hover:underline underline-offset-4">
          <Tag size={14} /> Have a coupon code?
        </button>
      ) : (
        <div>
          <div className="flex items-center gap-2 h-12 rounded-[14px] border border-[var(--border-light)] bg-white pl-3.5 pr-1.5 focus-within:border-[var(--charcoal)] transition-colors">
            <Tag size={15} className="text-[var(--gold)] shrink-0" />
            <input
              autoFocus
              value={coupon}
              onChange={(ev) => {
                setCoupon(ev.target.value.toUpperCase());
                setCouponNote(null);
              }}
              onKeyDown={(ev) => ev.key === 'Enter' && applyCoupon()}
              placeholder="Enter code"
              aria-label="Coupon code"
              style={{ fontFamily: FONT_SANS }}
              className="flex-1 min-w-0 bg-transparent text-[0.9rem] uppercase tracking-wider text-[var(--charcoal)] placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--mid)] outline-none"
            />
            <button type="button" onClick={applyCoupon} disabled={!coupon.trim()} style={{ fontFamily: FONT_SANS }} className="shrink-0 rounded-[10px] px-3 py-2 text-[0.8rem] font-semibold text-[var(--burgundy)] hover:bg-[var(--rose-light)] transition-colors disabled:opacity-40 disabled:hover:bg-transparent">
              Apply
            </button>
          </div>
          {couponNote && <p style={{ fontFamily: FONT_SANS }} className="mt-1.5 text-[0.76rem] text-[var(--mid)]">{couponNote}</p>}
        </div>
      )}

      <OrderSummary basePrice={e.basePrice} originalPrice={e.originalPrice} addons={selectedAddons} />

      {/* CTA */}
      <div>
        <button
          type="button"
          onClick={handleBook}
          style={{ fontFamily: FONT_SANS, background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-dark))' }}
          className="w-full h-[52px] rounded-2xl text-white font-semibold text-[0.95rem] flex items-center justify-center gap-2.5 shadow-[0_16px_34px_-12px_rgba(124,45,59,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_rgba(124,45,59,0.7)] active:translate-y-0"
        >
          Book now · <span className="tabular-nums">{formatINR(totalPrice)}</span> <ArrowRight size={18} />
        </button>
        <p style={{ fontFamily: FONT_SANS }} className="mt-2 text-center text-[0.74rem] text-[var(--mid)]">Instant confirmation · Pay securely at checkout</p>
      </div>

      <ul style={{ fontFamily: FONT_SANS }} className="grid grid-cols-3 gap-2 rounded-[14px] bg-[var(--cream)] px-2.5 py-2.5 text-[0.68rem] leading-tight text-[var(--mid)] text-center">
        <li className="flex flex-col items-center gap-1.5"><ShieldCheck size={16} className="text-[#3F7A3F]" /> Secure payment</li>
        <li className="flex flex-col items-center gap-1.5 border-x border-[var(--border-light)]"><BadgeCheck size={16} className="text-[#3F7A3F]" /> Verified decorators</li>
        <li className="flex flex-col items-center gap-1.5"><Clock size={16} className="text-[#3F7A3F]" /> Free cancellation 24h+</li>
      </ul>

      <a href="https://wa.me/" target="_blank" rel="noreferrer" style={{ fontFamily: FONT_SANS }} className="-mt-1.5 inline-flex items-center justify-center gap-2 text-[0.82rem] font-medium text-[#4A3F35] hover:text-[var(--burgundy)] transition-colors">
        <MessageCircle size={15} className="text-[#25D366]" /> Questions? Chat with us on WhatsApp
      </a>
    </div>
  );
}
