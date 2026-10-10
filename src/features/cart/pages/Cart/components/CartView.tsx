import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, MapPin, Minus, Plus, ShieldCheck, ShoppingBag, Tag, Trash2, Undo2, Users, X } from 'lucide-react';
import type { RootState } from '@/store/store';
import { openLoginModal } from '@/features/auth/store/authSlice';
import { experiencePath } from '@/features/experiences/utils/slug';
import { MOCK_CART, MOCK_COUPONS, type CartCoupon, type CartItem } from '@/features/cart/mockCart';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const formatDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

/** "18:00" → "6 pm", "18:30" → "6:30 pm". */
const formatTime = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h)) return value;
  const suffix = h % 24 < 12 ? 'am' : 'pm';
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
};

const extraGuestsCost = (item: CartItem) => Math.max(0, item.guests - item.includedGuests) * item.extraGuestPrice;
const addonsCost = (item: CartItem) => item.addons.reduce((sum, a) => sum + a.price, 0);

const couponDiscount = (coupon: CartCoupon | null, amount: number) =>
  coupon && amount >= coupon.minAmount ? Math.min(coupon.maxDiscount, Math.round((amount * coupon.percent) / 100)) : 0;

const primaryBtn =
  'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--burgundy)] px-6 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--burgundy-dark)]';

function GuestStepper({ item, onChange }: { item: CartItem; onChange: (guests: number) => void }) {
  const btn =
    'flex h-7 w-7 items-center justify-center rounded-full text-[var(--burgundy)] transition-colors hover:bg-[var(--rose-light)] disabled:text-[var(--border-light)] disabled:hover:bg-transparent';
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border-light)] bg-white p-0.5">
      <button type="button" className={btn} onClick={() => onChange(item.guests - 1)} disabled={item.guests <= 1} aria-label="Fewer guests">
        <Minus size={13} />
      </button>
      <span className="min-w-[4.5rem] text-center text-[0.78rem] font-medium tabular-nums text-[var(--charcoal)]" aria-live="polite">
        {item.guests} {item.guests === 1 ? 'guest' : 'guests'}
      </span>
      <button type="button" className={btn} onClick={() => onChange(item.guests + 1)} disabled={item.guests >= item.maxGuests} aria-label="More guests">
        <Plus size={13} />
      </button>
    </div>
  );
}

function CartItemCard({
  item,
  onGuests,
  onRemoveAddon,
  onRemove,
}: {
  item: CartItem;
  onGuests: (guests: number) => void;
  onRemoveAddon: (addonId: number) => void;
  onRemove: () => void;
}) {
  const link = experiencePath({ id: item.experienceId, slug: item.slug });
  const extra = extraGuestsCost(item);

  return (
    <li className="overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white">
      <div className="flex gap-4 p-4">
        <Link to={link} className="shrink-0">
          <img src={item.image} alt="" loading="lazy" className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 style={{ fontFamily: SERIF }} className="min-w-0 text-[1.22rem] font-semibold leading-snug text-[var(--charcoal)]">
              <Link to={link} className="transition-colors hover:text-[var(--burgundy)]">
                {item.name}
              </Link>
            </h2>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${item.name}`}
              className="-mr-1 -mt-0.5 shrink-0 rounded-full p-1.5 text-[var(--mid)] transition-colors hover:bg-[var(--rose-light)] hover:text-[var(--burgundy)]"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <ul className="mt-1.5 flex flex-wrap gap-x-3.5 gap-y-1 text-[0.78rem] text-[var(--mid)]">
            <li className="inline-flex items-center gap-1">
              <CalendarDays size={12} className="text-[var(--gold)]" /> {formatDate(item.date)}
            </li>
            <li className="inline-flex items-center gap-1">
              <Clock size={12} className="text-[var(--gold)]" /> {formatTime(item.startTime)} – {formatTime(item.endTime)}
            </li>
            <li className="inline-flex items-center gap-1">
              <MapPin size={12} className="text-[var(--gold)]" /> {item.location}
            </li>
          </ul>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <GuestStepper item={item} onChange={onGuests} />
            <span className="flex items-baseline gap-2">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-[0.76rem] text-[var(--mid)] line-through tabular-nums">{formatINR(item.originalPrice)}</span>
              )}
              <span className="text-[1rem] font-semibold tabular-nums text-[var(--charcoal)]">{formatINR(item.price)}</span>
            </span>
          </div>
        </div>
      </div>

      {(item.addons.length > 0 || extra > 0) && (
        <ul className="grid gap-1.5 border-t border-[var(--border-light)] bg-[var(--cream)] px-4 py-3 text-[0.8rem]">
          {extra > 0 && (
            <li className="flex justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-[var(--mid)]">
                <Users size={12} className="text-[var(--gold)]" />
                {item.guests - item.includedGuests} extra {item.guests - item.includedGuests === 1 ? 'guest' : 'guests'} × {formatINR(item.extraGuestPrice)}
              </span>
              <span className="tabular-nums text-[var(--charcoal)]">{formatINR(extra)}</span>
            </li>
          )}
          {item.addons.map((a) => (
            <li key={a.id} className="group flex items-center justify-between gap-4">
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[var(--mid)]">
                <Plus size={12} className="shrink-0 text-[var(--gold)]" />
                <span className="truncate">{a.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAddon(a.id)}
                  aria-label={`Remove ${a.name}`}
                  className="rounded-full p-0.5 text-[var(--mid)] transition-colors hover:text-[var(--burgundy)] sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                >
                  <X size={12} />
                </button>
              </span>
              <span className="tabular-nums text-[var(--charcoal)]">{formatINR(a.price)}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function SummaryRow({ label, value, className = '' }: { label: React.ReactNode; value: React.ReactNode; className?: string }) {
  return (
    <div className={`flex justify-between gap-4 ${className}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export default function CartView() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [items, setItems] = useState<CartItem[]>(MOCK_CART);
  const [removed, setRemoved] = useState<{ item: CartItem; index: number } | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState<CartCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkoutNote, setCheckoutNote] = useState<string | null>(null);

  const update = (id: string, change: (item: CartItem) => CartItem) => setItems((prev) => prev.map((i) => (i.id === id ? change(i) : i)));

  const removeItem = (id: string) => {
    const index = items.findIndex((i) => i.id === id);
    if (index < 0) return;
    setRemoved({ item: items[index], index });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const undoRemove = () => {
    if (!removed) return;
    setItems((prev) => [...prev.slice(0, removed.index), removed.item, ...prev.slice(removed.index)]);
    setRemoved(null);
  };

  const experiences = items.reduce((sum, i) => sum + i.price + extraGuestsCost(i), 0);
  const addons = items.reduce((sum, i) => sum + addonsCost(i), 0);
  const subtotal = experiences + addons;
  const mrpSavings = items.reduce((sum, i) => sum + Math.max(0, (i.originalPrice ?? i.price) - i.price), 0);
  const discount = couponDiscount(coupon, subtotal);
  const total = Math.max(0, subtotal - discount);
  // A coupon whose minimum is no longer met (after removing items) stays visible but gives nothing.
  const couponShort = coupon && discount === 0 ? coupon.minAmount - subtotal : 0;

  const applyCoupon = () => {
    const match = MOCK_COUPONS.find((c) => c.code === code.trim().toUpperCase());
    if (!match) {
      setCouponError('That code is not valid.');
      return;
    }
    if (subtotal < match.minAmount) {
      setCouponError(`Add ${formatINR(match.minAmount - subtotal)} more to use ${match.code}.`);
      return;
    }
    setCoupon(match);
    setCouponError(null);
  };

  const checkout = () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
      return;
    }
    setCheckoutNote('Cart checkout is coming soon. For now, book each experience from its page.');
  };

  const count = items.length;

  return (
    <section className="min-h-[70vh] bg-[var(--cream)] pb-28 pt-6 md:pt-8 lg:pb-14" style={{ fontFamily: SANS }}>
      <div className="mx-auto max-w-[var(--container-width)] px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 border-b border-[var(--border-light)] pb-3">
          <h1 className="section-title text-[2rem] md:text-[2.3rem]">
            My <em>Cart</em>
          </h1>
          {count > 0 && (
            <span className="pb-1 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[var(--mid)]">
              {count} {count === 1 ? 'experience' : 'experiences'}
            </span>
          )}
        </div>

        {removed && (
          <div role="status" className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--border-light)] bg-white px-4 py-2.5 text-[0.82rem] text-[var(--mid)]">
            <span className="min-w-0 truncate">
              Removed <span className="font-medium text-[var(--charcoal)]">{removed.item.name}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
              <button type="button" onClick={undoRemove} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-[var(--burgundy)] hover:bg-[var(--rose-light)]">
                <Undo2 size={13} /> Undo
              </button>
              <button type="button" onClick={() => setRemoved(null)} aria-label="Dismiss" className="rounded-full p-1 hover:bg-[var(--linen)]">
                <X size={14} />
              </button>
            </span>
          </div>
        )}

        {count === 0 ? (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-white/60 px-6 py-14 text-center">
            <ShoppingBag size={28} className="mx-auto text-[var(--gold)]" />
            <p style={{ fontFamily: SERIF }} className="mt-2 text-[1.45rem] font-medium text-[var(--charcoal)]">
              Your cart is empty
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[0.84rem] text-[var(--mid)]">Pick a date and an experience, and it will wait for you here.</p>
            <Link to="/categories" className={`${primaryBtn} mt-6`}>
              Explore experiences
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <ul className="grid gap-4">
              {items.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onGuests={(guests) => update(item.id, (i) => ({ ...i, guests: Math.min(i.maxGuests, Math.max(1, guests)) }))}
                  onRemoveAddon={(addonId) => update(item.id, (i) => ({ ...i, addons: i.addons.filter((a) => a.id !== addonId) }))}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </ul>

            <aside className="rounded-2xl border border-[var(--border-light)] bg-white p-5 lg:sticky lg:top-28">
              <h2 style={{ fontFamily: SERIF }} className="text-[1.35rem] font-semibold text-[var(--charcoal)]">
                Order summary
              </h2>

              <dl className="mt-4 grid gap-2 text-[0.84rem] text-[var(--mid)]">
                <SummaryRow label={`Experiences (${count})`} value={formatINR(experiences)} />
                {addons > 0 && <SummaryRow label="Add-ons" value={formatINR(addons)} />}
                {discount > 0 && <SummaryRow label={`Coupon ${coupon?.code}`} value={`−${formatINR(discount)}`} className="text-leaf" />}
                <SummaryRow
                  label="Total"
                  value={formatINR(total)}
                  className="mt-1 border-t border-[var(--border-light)] pt-3 text-[1.05rem] font-semibold text-[var(--charcoal)]"
                />
              </dl>
              <p className="mt-1 text-[0.72rem] text-[var(--mid)]">Inclusive of all taxes</p>

              {mrpSavings + discount > 0 && (
                <p className="mt-3 rounded-lg bg-leaf-light px-3 py-2 text-[0.78rem] font-medium text-leaf">You save {formatINR(mrpSavings + discount)} on this order</p>
              )}

              {/* Coupon */}
              <div className="mt-4 border-t border-[var(--border-light)] pt-4">
                {coupon ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--gold-light)] bg-[var(--gold-pale)] px-3 py-2">
                    <span className="min-w-0">
                      <span className="block text-[0.8rem] font-bold uppercase text-[var(--burgundy)]">{coupon.code}</span>
                      <span className="block text-[0.72rem] text-[var(--mid)]">
                        {couponShort > 0 ? `Add ${formatINR(couponShort)} more to use this code` : `${coupon.percent}% off, up to ${formatINR(coupon.maxDiscount)}`}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCoupon(null);
                        setCode('');
                      }}
                      className="shrink-0 text-[0.74rem] font-semibold text-[var(--burgundy)] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : !couponOpen ? (
                  <button type="button" onClick={() => setCouponOpen(true)} className="inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-[var(--burgundy)] underline-offset-4 hover:underline">
                    <Tag size={13} /> Have a coupon code?
                  </button>
                ) : (
                  <form
                    onSubmit={(ev) => {
                      ev.preventDefault();
                      applyCoupon();
                    }}
                  >
                    <div className="flex items-center gap-2 rounded-xl border border-[var(--border-light)] bg-white py-1 pl-3 pr-1 focus-within:border-[var(--gold)]">
                      <Tag size={14} className="shrink-0 text-[var(--gold)]" />
                      <input
                        value={code}
                        onChange={(ev) => {
                          setCode(ev.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        placeholder="Enter code"
                        aria-label="Coupon code"
                        autoFocus
                        className="min-w-0 flex-1 bg-transparent py-1.5 text-[0.84rem] uppercase text-[var(--charcoal)] outline-none placeholder:normal-case placeholder:text-[var(--mid)]"
                      />
                      <button
                        type="submit"
                        disabled={!code.trim()}
                        className="shrink-0 rounded-lg px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--burgundy)] transition-colors hover:bg-[var(--rose-light)] disabled:opacity-40 disabled:hover:bg-transparent"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p role="alert" className="mt-1.5 text-[0.76rem] text-[var(--burgundy)]">
                        {couponError}
                      </p>
                    )}
                    <p className="mt-1.5 text-[0.72rem] text-[var(--mid)]">
                      Try{' '}
                      {MOCK_COUPONS.map((c, i) => (
                        <span key={c.code}>
                          {i > 0 && ' or '}
                          <button type="button" onClick={() => setCode(c.code)} className="font-semibold text-[var(--burgundy)] hover:underline">
                            {c.code}
                          </button>
                        </span>
                      ))}
                    </p>
                  </form>
                )}
              </div>

              <button type="button" onClick={checkout} className={`${primaryBtn} mt-5 hidden w-full lg:inline-flex`}>
                Checkout <ArrowRight size={16} />
              </button>
              {checkoutNote && (
                <p role="status" className="mt-3 text-[0.78rem] leading-snug text-[var(--burgundy)]">
                  {checkoutNote}
                </p>
              )}
              <p className="mt-4 flex items-center gap-1.5 text-[0.74rem] text-[var(--mid)]">
                <ShieldCheck size={14} className="shrink-0 text-[var(--gold)]" /> Secure payment · Free rescheduling up to 48 h before
              </p>
            </aside>
          </div>
        )}
      </div>

      {/* Mobile / tablet: total + checkout pinned above the bottom nav */}
      {count > 0 && (
        <div className="fixed inset-x-0 bottom-[60px] z-[80] border-t border-[var(--border-light)] bg-white px-4 py-3 md:bottom-0 lg:hidden">
          <div className="mx-auto flex max-w-[var(--container-width)] items-center justify-between gap-4">
            <span>
              <span className="block text-[0.66rem] uppercase tracking-[0.14em] text-[var(--mid)]">Total</span>
              <span className="block text-[1.1rem] font-semibold tabular-nums text-[var(--charcoal)]">{formatINR(total)}</span>
            </span>
            <button type="button" onClick={checkout} className={`${primaryBtn} flex-1 sm:max-w-xs sm:flex-none`}>
              Checkout <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
