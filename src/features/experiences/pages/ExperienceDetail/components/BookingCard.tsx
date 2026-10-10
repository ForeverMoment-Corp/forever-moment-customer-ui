import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ArrowRight, BadgeCheck, CalendarDays, CalendarHeart, Check, Clock, Loader2, MapPin, MessageCircle, Moon, ShieldCheck, Sparkles, Star, Sun, Sunrise, Sunset, Tag, Users } from 'lucide-react';

import AddOns from './AddOns';
import OrderSummary from './OrderSummary';
import PincodeChecker, { type PincodeResult } from './PincodeChecker';
import type { AddOn, ExperienceVM } from '../types';
import { FONT_SANS, FONT_SERIF, formatDuration, formatINR } from '../normalize';
import { fetchExperienceCoupons, validateCoupon, createBooking, waitForPaymentLink } from '../../../store/api';
import { whatsappLink } from '@/features/help/contact';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store/store';
import { openLoginModal } from '@/features/auth/store/authSlice';

export interface BookingCardProps {
  experience: ExperienceVM;
  addons: AddOn[];
  toggleAddon: (id: number) => void;
  /** Everything the guest ticked, including extras chosen further down the page. */
  selectedAddons: AddOn[];
  totalPrice: number;
  onViewReviews: () => void;
}

/** Quick picks before the calendar takes over: today and tomorrow. */
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

/** "Fri, 3 Oct" */
const formatDay = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

/** Part of the day a slot starts in, so a row of times reads as "morning / evening" at a glance. */
const daypart = (startTime: string) => {
  const h = toMinutes(startTime) / 60;
  if (h < 12) return { label: 'Morning', Icon: Sunrise };
  if (h < 16) return { label: 'Afternoon', Icon: Sun };
  if (h < 19) return { label: 'Evening', Icon: Sunset };
  return { label: 'Night', Icon: Moon };
};

/** Slots split into part-of-day groups, keeping their original (start time) order. */
const groupByDaypart = <T extends { startTime: string }>(slots: T[]) => {
  const groups: { label: string; Icon: typeof Moon; items: T[] }[] = [];
  for (const slot of slots) {
    const { label, Icon } = daypart(slot.startTime);
    const group = groups.find((g) => g.label === label);
    if (group) group.items.push(slot);
    else groups.push({ label, Icon, items: [slot] });
  }
  return groups;
};

/** Calendar trigger at the end of the date strip. Shows the picked date once one is chosen from it. */
const CalendarChip = forwardRef<HTMLButtonElement, { onClick?: () => void; picked: Date | null }>(({ onClick, picked }, ref) => (
  <button
    type="button"
    ref={ref}
    onClick={onClick}
    aria-pressed={!!picked}
    aria-label={picked ? `Change date, currently ${picked.toDateString()}` : 'Pick a later date from the calendar'}
    style={{ fontFamily: FONT_SANS }}
    className={`relative flex h-[54px] w-full flex-col items-center justify-center rounded-xl border text-center transition-all ${picked
        ? 'border-[var(--ink)] bg-[var(--ink)] text-white shadow-[0_10px_22px_-12px_var(--ink)]'
        : 'border-dashed border-[var(--gold)] bg-[var(--gold-pale)]/40 text-[var(--gold-dark)] hover:bg-[var(--gold-pale)]'
      }`}
  >
    {picked ? (
      <>
        <span className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[var(--gold-bright)]">{picked.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
        <span style={{ fontFamily: FONT_SERIF }} className="mt-0.5 text-[1.02rem] font-semibold leading-none">
          {picked.getDate()} <span className="text-[0.8rem] font-medium opacity-80">{picked.toLocaleDateString('en-IN', { month: 'short' })}</span>
        </span>
      </>
    ) : (
      <>
        <span className="inline-flex items-center gap-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.1em]">
          <CalendarDays size={13} /> Later date
        </span>
      </>
    )}
  </button>
));
CalendarChip.displayName = 'CalendarChip';

/**
 * One step of the plan. The left rail carries a numbered dot that turns into a check once the
 * step has a value, joined to the next step by a line that fills in as the guest progresses.
 */
function Step({
  n,
  title,
  summary,
  done,
  optional,
  last,
  children,
}: {
  n: number;
  title: string;
  summary?: React.ReactNode;
  done: boolean;
  optional?: boolean;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-3">
      {!last && (
        <span
          aria-hidden
          className={`absolute left-[13px] top-8 bottom-0 w-[2px] rounded-full transition-colors duration-300 ${done ? 'bg-[var(--gold)]' : 'bg-[var(--sand)]'}`}
        />
      )}
      <span
        aria-hidden
        style={{ fontFamily: FONT_SANS }}
        className={`relative z-[1] mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[0.74rem] font-semibold transition-all duration-300 ${done
            ? 'bg-[var(--gold)] text-white shadow-[0_0_0_4px_color-mix(in_srgb,_var(--gold)_18%,_transparent)]'
            : 'border-2 border-[var(--sand)] bg-white text-[var(--umber)]'
          }`}
      >
        {done ? <Check size={14} strokeWidth={3} /> : n}
      </span>
      <div className={`min-w-0 ${last ? '' : 'pb-5'}`}>
        <div style={{ fontFamily: FONT_SANS }} className="mb-2.5 flex min-h-7 items-center justify-between gap-3">
          <h3 style={{ fontFamily: FONT_SERIF }} className="text-[1.08rem] font-semibold leading-tight text-[var(--charcoal)]">
            {title}
            {optional && <span style={{ fontFamily: FONT_SANS }} className="ml-1.5 text-[0.7rem] font-normal text-[var(--mid)]">optional</span>}
          </h3>
          {summary && <span className="truncate text-[0.76rem] font-medium text-[var(--gold-dark)]">{summary}</span>}
        </div>
        {children}
      </div>
    </li>
  );
}

/** A row in the ticket recap. */
function RecapRow({ icon: Icon, label, value, muted }: { icon: typeof Clock; label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="mt-0.5 shrink-0 text-[var(--gold)]" />
      <dt className="sr-only">{label}</dt>
      <dd className={`min-w-0 text-[0.84rem] leading-snug ${muted ? 'italic text-[var(--mid)]' : 'font-medium text-[var(--charcoal)]'}`}>{value}</dd>
    </div>
  );
}

export default function BookingCard({ experience: e, addons, toggleAddon, selectedAddons, totalPrice, onViewReviews }: BookingCardProps) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const showTag = !!e.tag && !(e.isFeatured && e.tag.trim().toLowerCase() === 'bestseller');
  const today = useMemo(() => startOfDay(new Date()), []);
  const quickDays = useMemo(() => Array.from({ length: QUICK_DAYS }, (_, i) => new Date(today.getTime() + i * DAY)), [today]);

  const [date, setDate] = useState<Date | null>(null);
  const [locationId, setLocationId] = useState<number | null>(e.locationOptions[0]?.id ?? null);
  const [slotId, setSlotId] = useState<number | null>(null);
  const [dateError, setDateError] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponNote, setCouponNote] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  // Set once the booking exists: payment retries reuse it instead of booking again.
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const [paymentStage, setPaymentStage] = useState<'idle' | 'preparing' | 'redirecting' | 'delayed'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponsList, setCouponsList] = useState<any[]>([]);

  useEffect(() => {
    fetchExperienceCoupons(e.id).then(setCouponsList).catch(console.error);
  }, [e.id]);

  const [venue, setVenue] = useState<{ pincode: string; result: PincodeResult }>({ pincode: '', result: null });
  const dateRef = useRef<HTMLDivElement>(null);

  const inQuickRow = (d: Date | null) => !!d && quickDays.some((q) => sameDay(d, q));

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
  const showCityStep = e.locationOptions.length > 1;

  // Progress across the required steps (city only when there is a choice to make).
  const dateDone = !!effectiveDate;
  const slotDone = !!selectedSlot || (!hasAnySlots && dateDone);
  const venueDone = venue.result === 'available';
  const required = [dateDone, ...(showCityStep ? [!!location] : []), slotDone, venueDone];
  const doneCount = required.filter(Boolean).length;

  const pick = (d: Date | null) => {
    setDate(d);
    setDateError(false);
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
      return;
    }

    if (!effectiveDate || (hasAnySlots && !selectedSlot)) {
      setDateError(true);
      dateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!venueDone) {
      alert("Please check pincode availability before booking.");
      return;
    }

    // The booking already exists (payment link was slow): only fetch the link again.
    if (pendingBookingId) {
      await goToPayment(pendingBookingId);
      return;
    }

    setIsBooking(true);
    setPaymentError(null);
    try {
      const payload = {
        timeSlotMapperId: selectedSlot?.id || 0,
        bookingDate: toISODate(effectiveDate),
        guestCount: e.minGuests || 2, // minimum guests
        pincode: venue.pincode,
        addonMapperIds: selectedAddons.map(a => a.id),
        requestedAmount: finalPrice,
      };
      const response = await createBooking(payload, { id: user?.id as string, role: user?.role as string });
      const bookingId = String(response.bookingId || response.id || '');
      if (!bookingId) throw new Error('Booking was created but no booking reference came back.');
      setPendingBookingId(bookingId);
      await goToPayment(bookingId);
    } catch (err: any) {
      alert(err.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  /** GET /api/payment/bookings/{id}/payment-link (polled), then hand the browser to Stripe Checkout. */
  const goToPayment = async (bookingId: string) => {
    setIsBooking(true);
    setPaymentError(null);
    setPaymentStage('preparing');
    try {
      const url = await waitForPaymentLink(bookingId, { id: user?.id as string, role: user?.role as string });
      if (!url) {
        setPaymentStage('delayed');
        return;
      }
      setPaymentStage('redirecting');
      window.location.assign(url);
    } catch (err: unknown) {
      setPaymentStage('delayed');
      setPaymentError(err instanceof Error && err.message ? err.message : 'We could not open the payment page.');
    } finally {
      setIsBooking(false);
    }
  };

  const applyCoupon = async (codeToApply = coupon) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) return;

    setCouponLoading(true);
    setCouponNote(null);
    try {
      const res = await validateCoupon({
        code: code,
        experienceId: e.id,
        bookingAmount: totalPrice,
      });
      if (res.isValid || res.discountAmount !== undefined) {
        setAppliedCoupon({
          code: code,
          discountAmount: res.discountAmount || 0,
        });
        setCoupon(code);
        setCouponNote(`Coupon applied successfully!`);
      } else {
        setAppliedCoupon(null);
        setCouponNote(res.message || 'Invalid coupon code.');
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponNote(err.message || 'Failed to apply coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCoupon('');
    setCouponNote(null);
  };

  const finalPrice = appliedCoupon ? Math.max(0, totalPrice - appliedCoupon.discountAmount) : totalPrice;

  let n = 0;
  const next = () => ++n;

  return (
    <div
      id="booking-card"
      className="scroll-mt-[90px] md:scroll-mt-[136px] overflow-hidden rounded-[28px] border border-[var(--border-light)] bg-white shadow-[0_30px_70px_-30px_color-mix(in_srgb,_var(--burgundy)_30%,_transparent)] [&>*]:min-w-0"
    >
      {/* Name and price together: one compact block that tells the guest what and how much
          before the plan starts. */}
      <div className="border-b border-[var(--sand)] px-4 pb-4 pt-5 sm:px-5">
        <h1 style={{ fontFamily: FONT_SERIF }} className="text-balance text-[1.45rem] font-semibold capitalize leading-[1.15] text-[var(--charcoal)] sm:text-[1.6rem]">
          {e.name}
        </h1>
        <ul style={{ fontFamily: FONT_SANS }} className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.78rem] text-[var(--mid)]">
          <li>
            <button type="button" onClick={onViewReviews} className="group inline-flex items-center gap-1">
              <Star size={13} className="fill-[var(--gold)] text-[var(--gold)]" />
              <span className="font-semibold text-[var(--charcoal)]">{e.rating}</span>
              <span className="underline decoration-[var(--sand)] underline-offset-4 transition-colors group-hover:text-[var(--burgundy)]">({e.reviewCount})</span>
            </button>
          </li>
          {e.isFeatured && (
            <li className="inline-flex items-center gap-1 rounded-full bg-[var(--burgundy)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white">
              <Sparkles size={10} /> Bestseller
            </li>
          )}
          {showTag && (
            <li className="rounded-full border border-[var(--sand)] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[var(--burgundy)]">{e.tag}</li>
          )}
          {e.locations.length > 0 && (
            <li className="inline-flex items-center gap-1 capitalize"><MapPin size={12} className="text-[var(--gold)]" /> {e.locations.slice(0, 2).join(', ')}</li>
          )}
          {e.durationMinutes > 0 && (
            <li className="inline-flex items-center gap-1"><Clock size={12} className="text-[var(--gold)]" /> {formatDuration(e.durationMinutes)}</li>
          )}
          {e.maxCapacity > 0 && (
            <li className="inline-flex items-center gap-1"><Users size={12} className="text-[var(--gold)]" /> Up to {e.maxCapacity}</li>
          )}
        </ul>

        <div className="mt-3.5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span style={{ fontFamily: FONT_SANS }} className="text-[1.5rem] font-semibold leading-none text-[var(--charcoal)] tabular-nums">{formatINR(e.basePrice)}</span>
            </div>
            <p style={{ fontFamily: FONT_SANS }} className="mt-1 text-[0.72rem] text-[var(--mid)]">per setup · all taxes included</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 pb-5 pt-5 sm:px-5">
        {/* The plan */}
        <div>
          <div style={{ fontFamily: FONT_SANS }} className="mb-4 flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--gold-deep)]">
              <CalendarHeart size={14} /> Plan your celebration
            </p>
            <p className="text-[0.72rem] text-[var(--mid)] tabular-nums" aria-live="polite">{doneCount} of {required.length} done</p>
          </div>

          <ol>
            <Step n={next()} title="Pick a day" done={dateDone} summary={effectiveDate ? formatDay(effectiveDate) : undefined}>
              <div ref={dateRef} className="grid grid-cols-3 gap-2">
                {quickDays.map((d, i) => {
                  const active = sameDay(effectiveDate, d);
                  const soldOut = hasAnySlots && slotsOn(d).length === 0;
                  const weekend = isWeekend(d);
                  return (
                    <button
                      key={d.getTime()}
                      type="button"
                      onClick={() => pick(d)}
                      disabled={soldOut}
                      aria-pressed={active}
                      aria-label={`${formatDay(d)}${soldOut ? ', fully booked' : ''}`}
                      title={soldOut ? 'Fully booked' : undefined}
                      style={{ fontFamily: FONT_SANS }}
                      className={`relative flex h-[54px] w-full flex-col items-center justify-center rounded-xl border text-center transition-all ${active
                          ? 'border-[var(--ink)] bg-[var(--ink)] text-white shadow-[0_10px_22px_-12px_var(--ink)]'
                          : `bg-white hover:-translate-y-0.5 hover:border-[var(--gold)] ${dateError ? 'border-[var(--rose)]' : 'border-[var(--sand)]'}`
                        } disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-[var(--sand)]`}
                    >
                      <span className={`text-[0.58rem] font-semibold uppercase tracking-[0.12em] ${active ? 'text-[var(--gold-bright)]' : weekend ? 'text-[var(--gold-dark)]' : 'text-[var(--mid)]'}`}>
                        {i === 0 ? 'Today' : 'Tomorrow'}
                      </span>
                      <span style={{ fontFamily: FONT_SERIF }} className={`mt-0.5 text-[1.02rem] font-semibold leading-none ${soldOut ? 'line-through' : ''}`}>
                        {d.getDate()} <span className={`text-[0.8rem] font-medium ${active ? 'text-white/75' : 'text-[var(--mid)]'}`}>{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </span>
                      {/* Availability dot */}
                      {hasAnySlots && (
                        <span className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ${soldOut ? 'bg-[var(--sand)]' : active ? 'bg-[var(--gold-bright)]' : 'bg-leaf'}`} />
                      )}
                    </button>
                  );
                })}
                <DatePicker
                  selected={effectiveDate}
                  onChange={pick}
                  minDate={today}
                  customInput={<CalendarChip picked={effectiveDate && !inQuickRow(effectiveDate) ? effectiveDate : null} />}
                  calendarClassName="fm-datepicker"
                  wrapperClassName="block [&>div]:block"
                  popperPlacement="bottom-end"
                  // Render the calendar outside the card: the card clips its overflow, which hid it.
                  portalId="fm-datepicker-portal"
                  popperClassName="!z-[200]"
                />
              </div>
              {hasAnySlots && (
                <p style={{ fontFamily: FONT_SANS }} className="mt-1.5 flex items-center gap-3 text-[0.68rem] text-[var(--mid)]">
                  <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-leaf" /> Slots open</span>
                  <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[var(--sand)]" /> Fully booked</span>
                </p>
              )}
              {dateError && (
                <p role="alert" style={{ fontFamily: FONT_SANS }} className="mt-1.5 text-[0.78rem] font-medium text-[var(--rose)]">
                  {effectiveDate ? 'Pick a time slot to continue.' : 'Pick a date to continue.'}
                </p>
              )}
            </Step>

            {showCityStep && (
              <Step n={next()} title="Choose the city" done={!!location} summary={location ? <span className="capitalize">{location.name}</span> : undefined}>
                <div role="radiogroup" aria-label="City" className="flex flex-wrap gap-1 rounded-2xl border border-[var(--sand)] bg-[var(--ivory)] p-1">
                  {e.locationOptions.map((l) => {
                    const active = l.id === location?.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setLocationId(l.id)}
                        style={{ fontFamily: FONT_SANS }}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[0.84rem] capitalize transition-all ${active ? 'bg-white font-semibold text-[var(--charcoal)] shadow-[0_4px_12px_-6px_color-mix(in_srgb,_var(--ink)_40%,_transparent)]' : 'text-[var(--mid)] hover:text-[var(--charcoal)]'
                          }`}
                      >
                        <MapPin size={13} className={active ? 'text-[var(--gold)]' : ''} /> {l.name}
                      </button>
                    );
                  })}
                </div>
              </Step>
            )}

            <Step
              n={next()}
              title="Pick a time"
              done={slotDone}
              summary={selectedSlot ? selectedSlot.label : !hasAnySlots ? 'On request' : undefined}
            >
              {slots.length > 0 ? (
                // Grouped by part of day: one short row per group keeps a long list of times compact.
                <div className="grid gap-2.5">
                  {groupByDaypart(slots).map(({ label, Icon, items }) => (
                    <div key={label} className="grid grid-cols-1 items-start gap-1.5 sm:grid-cols-[86px_minmax(0,1fr)] sm:gap-2">
                      <span style={{ fontFamily: FONT_SANS }} className="inline-flex sm:mt-1.5 items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.1em] text-[var(--mid)]">
                        <Icon size={14} className="text-[var(--gold-dark)]" /> {label}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((slot) => {
                          const active = slot.id === effectiveSlotId;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSlotId(slot.id)}
                              aria-pressed={active}
                              title={slot.sublabel || undefined}
                              style={{ fontFamily: FONT_SANS }}
                              className={`rounded-full border px-3 py-1.5 text-[0.78rem] font-medium tabular-nums transition-colors ${active
                                  ? 'border-[var(--burgundy)] bg-[var(--burgundy)] text-white'
                                  : 'border-[var(--sand)] bg-white text-[var(--charcoal)] hover:border-[var(--burgundy)]'
                                }`}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily: FONT_SANS }} className="flex items-start gap-2.5 rounded-2xl border border-dashed border-[var(--sand)] bg-[var(--ivory)] px-3.5 py-3 text-[0.8rem] leading-relaxed text-[var(--mid)]">
                  <MessageCircle size={15} className="mt-0.5 shrink-0 text-whatsapp" />
                  {!hasAnySlots
                    ? 'Our team confirms the exact time with you on WhatsApp right after you book.'
                    : effectiveDate && sameDay(effectiveDate, now)
                      ? "Today's slots have all started. Pick a later date."
                      : 'No time slots on this date. Try another date, or chat with us and we will arrange one.'}
                </p>
              )}
              {selectedSlot?.maxCapacity != null && selectedSlot.maxCapacity <= 3 && (
                <p style={{ fontFamily: FONT_SANS }} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--rose-light)] px-2.5 py-1 text-[0.72rem] font-semibold text-[var(--burgundy)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--burgundy)]" />
                  Only {selectedSlot.maxCapacity} left in this slot
                </p>
              )}
            </Step>

            <Step
              n={next()}
              title="Where's the party?"
              done={venueDone}
              summary={venueDone ? `Setting up at ${venue.pincode}` : undefined}
              last={addons.length === 0}
            >
              <PincodeChecker
                experienceId={e.id}
                onResult={(pincode, result, area) => {
                  setVenue({ pincode, result });
                  // A serviceable pincode in one of this experience's cities picks that city, so its slots show.
                  if (result === 'available' && area && e.locationOptions.some((l) => l.id === area.locationId)) setLocationId(area.locationId);
                }}
              />
            </Step>

            {addons.length > 0 && (
              <Step n={next()} title="Make it extra special" optional done={addedCount > 0} summary={addedCount > 0 ? `${addedCount} added` : undefined} last>
                <AddOns addons={addons} toggleAddon={toggleAddon} />
              </Step>
            )}
          </ol>
        </div>

        {/* Ticket: a recap of the celebration above the perforation, the bill below it */}
        <section aria-label="Your celebration" className="relative rounded-[22px] bg-[var(--ivory)] ring-1 ring-[var(--sand)]">
          <div className="px-4 pb-4 pt-4">
            <p style={{ fontFamily: FONT_SERIF }} className="text-[1.15rem] font-semibold italic text-[var(--charcoal)]">Your celebration</p>
            <dl style={{ fontFamily: FONT_SANS }} className="mt-2.5 grid gap-2">
              <RecapRow icon={CalendarDays} label="Date" value={effectiveDate ? formatDay(effectiveDate) : 'Pick a day'} muted={!effectiveDate} />
              <RecapRow
                icon={Clock}
                label="Time"
                value={selectedSlot ? selectedSlot.label : hasAnySlots ? 'Pick a time' : 'Confirmed on WhatsApp'}
                muted={!selectedSlot}
              />
              <RecapRow
                icon={MapPin}
                label="Venue"
                value={
                  <span className="capitalize">
                    {[location?.name, venueDone ? venue.pincode : null].filter(Boolean).join(' · ') || 'Add your pincode'}
                  </span>
                }
                muted={!location && !venueDone}
              />
              {addedCount > 0 && <RecapRow icon={Sparkles} label="Extras" value={`${addedCount} extra${addedCount === 1 ? '' : 's'} added`} />}
            </dl>
          </div>

          {/* Perforation with notches cut into both edges */}
          <div aria-hidden className="relative h-5">
            <span className="absolute -left-2.5 top-0 h-5 w-5 rounded-full bg-white ring-1 ring-[var(--sand)] [clip-path:inset(0_0_0_50%)]" />
            <span className="absolute -right-2.5 top-0 h-5 w-5 rounded-full bg-white ring-1 ring-[var(--sand)] [clip-path:inset(0_50%_0_0)]" />
            <span className="absolute inset-x-4 top-1/2 border-t-2 border-dashed border-[var(--sand)]" />
          </div>

          {/* The perforation already separates the bill, so drop the summary's own top rule */}
          <div className="px-4 pb-4 pt-1 [&>dl]:border-t-0 [&>dl]:pt-0">
            <OrderSummary basePrice={e.basePrice} originalPrice={e.originalPrice} addons={selectedAddons} couponDiscount={appliedCoupon?.discountAmount} />

            {!couponOpen ? (
              <button type="button" onClick={() => setCouponOpen(true)} style={{ fontFamily: FONT_SANS }} className="mt-3 inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-[var(--burgundy)] underline-offset-4 hover:underline">
                <Tag size={13} /> Have a coupon code?
              </button>
            ) : appliedCoupon ? (
              <div className="mt-3 flex items-center justify-between rounded-[14px] border border-leaf bg-leaf-light/30 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <Tag size={15} className="text-leaf" />
                  <div className="min-w-0">
                    <p style={{ fontFamily: FONT_SANS }} className="text-[0.8rem] font-bold text-leaf uppercase">{appliedCoupon.code}</p>
                    <p style={{ fontFamily: FONT_SANS }} className="text-[0.72rem] font-medium text-leaf">-{formatINR(appliedCoupon.discountAmount)} saved!</p>
                  </div>
                </div>
                <button type="button" onClick={removeCoupon} style={{ fontFamily: FONT_SANS }} className="text-[0.72rem] font-semibold text-[var(--rose)] hover:underline">Remove</button>
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex h-11 items-center gap-2 rounded-[14px] border border-[var(--sand)] bg-white pl-3.5 pr-1.5 transition-colors focus-within:border-[var(--charcoal)]">
                  <Tag size={15} className="shrink-0 text-[var(--gold)]" />
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
                    disabled={couponLoading}
                    style={{ fontFamily: FONT_SANS }}
                    className="min-w-0 flex-1 bg-transparent text-[0.88rem] uppercase tracking-wider text-[var(--charcoal)] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--mid)] disabled:opacity-50"
                  />
                  <button type="button" onClick={() => applyCoupon()} disabled={!coupon.trim() || couponLoading} style={{ fontFamily: FONT_SANS }} className="shrink-0 rounded-[10px] px-3 py-2 text-[0.8rem] font-semibold text-[var(--burgundy)] transition-colors hover:bg-[var(--rose-light)] disabled:opacity-40 disabled:hover:bg-transparent">
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {couponNote && <p style={{ fontFamily: FONT_SANS }} className={`mt-1.5 text-[0.76rem] ${couponNote.includes('success') ? 'text-leaf' : 'text-[var(--rose)]'}`}>{couponNote}</p>}

                {couponsList.length > 0 && (
                  <div className="mt-3.5 flex flex-col gap-2">
                    <p style={{ fontFamily: FONT_SANS }} className="text-[0.72rem] font-semibold uppercase tracking-wider text-[var(--mid)]">Available Offers</p>
                    {couponsList.map((c: any) => (
                      <button
                        key={c.code || c.couponCode}
                        type="button"
                        onClick={() => applyCoupon(c.code || c.couponCode)}
                        disabled={couponLoading}
                        style={{ fontFamily: FONT_SANS }}
                        className="flex items-center justify-between rounded-[12px] border border-dashed border-[var(--gold)] bg-[var(--gold-pale)]/20 p-2.5 transition-colors hover:bg-[var(--gold-pale)]/40 disabled:opacity-50"
                      >
                        <div className="text-left min-w-0 pr-3">
                          <p className="text-[0.8rem] font-bold text-[var(--burgundy)] uppercase truncate">{c.code || c.couponCode}</p>
                          {c.description && <p className="text-[0.72rem] text-[var(--charcoal)] mt-0.5 leading-snug line-clamp-2">{c.description}</p>}
                        </div>
                        <span className="shrink-0 text-[0.76rem] font-semibold text-[var(--gold-dark)]">Apply</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* CTA names the day, so the guest sees exactly what they are booking */}
        <div>
          <button
            type="button"
            onClick={handleBook}
            disabled={isBooking}
            style={{ fontFamily: FONT_SANS, background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-dark))' }}
            className="group flex h-[56px] w-full items-center justify-between gap-3 rounded-2xl pl-5 pr-2 text-white shadow-[0_16px_34px_-12px_color-mix(in_srgb,_var(--burgundy)_60%,_transparent)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-12px_color-mix(in_srgb,_var(--burgundy)_70%,_transparent)] active:translate-y-0 disabled:opacity-75 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
          >
            <span className="min-w-0 text-left leading-tight">
              <span className="flex items-center gap-2 text-[0.95rem] font-semibold">
                {isBooking && <Loader2 size={16} className="animate-spin" />}
                {paymentStage === 'preparing'
                  ? 'Preparing secure payment…'
                  : paymentStage === 'redirecting'
                    ? 'Opening payment…'
                    : isBooking
                      ? 'Booking…'
                      : paymentStage === 'delayed'
                        ? 'Continue to payment'
                        : effectiveDate ? `Book for ${formatDay(effectiveDate)}` : 'Book this setup'}
              </span>
              <span className="block text-[0.7rem] text-white/75">
                {pendingBookingId ? `Booking ref ${pendingBookingId} · pay securely` : 'Instant confirmation · pay securely'}
              </span>
            </span>
            <span className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-white/15 px-3.5 text-[0.95rem] font-semibold tabular-nums transition-colors group-hover:bg-white/25">
              {formatINR(finalPrice)} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>

          {paymentStage === 'delayed' && (
            <p role="status" style={{ fontFamily: FONT_SANS }} className="mt-2.5 rounded-xl bg-[var(--rose-light)] px-3.5 py-2.5 text-[0.78rem] leading-snug text-[var(--burgundy)]">
              {paymentError
                ? `Your booking is saved (ref ${pendingBookingId}), but ${paymentError.charAt(0).toLowerCase() + paymentError.slice(1)}`
                : `Your booking is saved (ref ${pendingBookingId}). The payment page is taking longer than usual.`}{' '}
              Tap “Continue to payment” to try again. You won't be booked twice.
            </p>
          )}
        </div>

        <ul style={{ fontFamily: FONT_SANS }} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[0.72rem] text-[var(--mid)]">
          <li className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-leaf" /> Secure payment</li>
          <li className="inline-flex items-center gap-1.5"><BadgeCheck size={14} className="text-leaf" /> Verified decorators</li>
          <li className="inline-flex items-center gap-1.5"><Clock size={14} className="text-leaf" /> Free cancellation 24h+</li>
        </ul>

        <a
          href={whatsappLink(`Hi! I have a question about "${e.name}".`)}
          target="_blank"
          rel="noreferrer"
          style={{ fontFamily: FONT_SANS }}
          className="-mt-2 inline-flex items-center justify-center gap-2 text-[0.8rem] font-medium text-cocoa transition-colors hover:text-[var(--burgundy)]"
        >
          <MessageCircle size={15} className="text-whatsapp" /> Questions? Chat with us on WhatsApp
        </a>
      </div>
    </div>
  );
}
