import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronRight, Clock, Loader2, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { EMAIL, HOURS, OCCASIONS, OFFICE, PHONE, whatsappLink } from '@/features/help/contact';
import { getAccessToken, submitSupportQuery } from '@/features/support';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

interface LocationRef {
  name: string;
  isActive?: boolean;
}

export interface ContactViewProps {
  /** GET /public/locations — the cities we actually serve. */
  locations?: LocationRef[];
  getLocations?: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  city: string;
  occasion: string;
  date: string;
  message: string;
}

/**
 * Turn whatever the guest typed into a number we can store (backend column is 20 chars).
 * Indian mobiles may come as "98765 43210", "098765-43210" or "+91 98765 43210"; they all
 * become the 10 digits. Other countries need a leading "+" and 8–15 digits (E.164).
 * Returns '' when the input is not a usable number.
 */
const normalizePhone =(raw: string): string => {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  const indian = digits.length === 12 && digits.startsWith('91') ? digits.slice(2)
    : digits.length === 11 && digits.startsWith('0') ? digits.slice(1)
    : digits;
  if (/^[6-9]\d{9}$/.test(indian) && (!trimmed.startsWith('+') || digits.startsWith('91'))) return indian;
  if (trimmed.startsWith('+') && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return '';
};

const EMPTY: FormState = { name: '', email: '', phone: '', city: '', occasion: '', date: '', message: '' };

export default function ContactView({ locations, getLocations }: ContactViewProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  /** Reference the backend gave the submitted query; set once it is saved. */
  const [referenceId, setReferenceId] = useState<string | null>(null);

  useEffect(() => {
    if (getLocations && (!locations || locations.length === 0)) getLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cities = useMemo(
    () => (locations ?? []).filter((l) => l && l.isActive !== false).map((l) => l.name).filter(Boolean),
    [locations],
  );

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const errors = {
    name: form.name.trim().length < 2 ? 'Tell us your name' : '',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Enter an email we can reply to',
    phone: normalizePhone(form.phone) ? '' : 'Enter a 10-digit mobile number, or include the country code (e.g. +31 6 1234 5678)',
    message: form.message.trim().length < 10 ? 'A line or two about what you need' : '',
  };
  const isValid = !errors.name && !errors.email && !errors.phone && !errors.message;

  /**
   * A blocked submit must never look like a dead button: field errors can sit off-screen,
   * so jump to the first invalid field and say why nothing was sent.
   */
  const focusFirstInvalid = () => {
    const order: (keyof typeof errors)[] = ['name', 'phone', 'email', 'message'];
    const first = order.find((k) => errors[k]);
    if (!first) return;
    const el = document.getElementById(`contact-${first}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.focus({ preventScroll: true });
    setError('Please fix the highlighted fields before sending.');
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  /** The API has no fields for city, occasion or date, so they ride along in subject and message. */
  const apiSubject = () => (form.occasion ? `Enquiry · ${form.occasion}` : 'General enquiry');
  const apiMessage = () => {
    const details = [
      ...(form.city ? [`City: ${form.city}`] : []),
      ...(form.occasion ? [`Occasion: ${form.occasion}`] : []),
      ...(form.date ? [`Date: ${formatDate(form.date)}`] : []),
    ];
    return details.length ? `${form.message.trim()}\n\n${details.join('\n')}` : form.message.trim();
  };

  /** WhatsApp stays as an instant alternative to the form. */
  const summary = () =>
    [
      'Hi Forever Moment, I would like to enquire.',
      '',
      `Name: ${form.name.trim()}`,
      `Phone: ${normalizePhone(form.phone) || form.phone.trim()}`,
      ...(form.city ? [`City: ${form.city}`] : []),
      ...(form.occasion ? [`Occasion: ${form.occasion}`] : []),
      ...(form.date ? [`Date: ${formatDate(form.date)}`] : []),
      '',
      form.message.trim(),
    ].join('\n');

  const submit = async () => {
    setTouched(true);
    if (sending) return;
    if (!isValid) {
      focusFirstInvalid();
      return;
    }
    setSending(true);
    setError('');
    try {
      const saved = await submitSupportQuery({
        name: form.name,
        email: form.email,
        phone: normalizePhone(form.phone),
        subject: apiSubject(),
        message: apiMessage(),
      });
      setReferenceId(saved?.referenceId || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const openWhatsApp = () => {
    setTouched(true);
    if (!isValid) {
      focusFirstInvalid();
      return;
    }
    window.open(whatsappLink(summary()), '_blank', 'noopener');
  };

  const startOver = () => {
    setForm(EMPTY);
    setTouched(false);
    setError('');
    setReferenceId(null);
  };

  const fieldClass = (invalid: boolean) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.9rem] text-[var(--charcoal)] outline-none transition-colors placeholder:text-[var(--mid)] ${
      invalid ? 'border-[var(--rose)]' : 'border-[var(--border-light)] focus:border-[var(--charcoal)]'
    }`;

  const Label = ({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) => (
    <label htmlFor={htmlFor} style={{ fontFamily: SANS }} className="mb-1.5 block text-[0.8rem] font-semibold text-[var(--charcoal)]">
      {children}
      {optional && <span className="ml-1.5 font-normal text-[0.74rem] text-[var(--mid)]">optional</span>}
    </label>
  );

  const contacts = [
    { icon: MessageCircle, label: 'WhatsApp', value: 'Usually replies in minutes', href: whatsappLink('Hi! I have a query about Forever Moment.'), external: true, tone: 'text-[#25D366]' },
    { icon: Phone, label: 'Call us', value: PHONE, href: `tel:${PHONE.replace(/\s/g, '')}`, external: false, tone: 'text-[var(--burgundy)]' },
    { icon: Mail, label: 'Email', value: EMAIL, href: `mailto:${EMAIL}`, external: false, tone: 'text-[var(--gold)]' },
  ];

  return (
    <div className="min-h-[70vh] bg-[var(--cream)] pb-12 pt-5">
      <div className="mx-auto max-w-[var(--container-width)] px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontFamily: SANS }} className="text-[0.78rem] text-[var(--mid)]">
          <ol className="flex items-center gap-1">
            <li className="flex items-center gap-1">
              <Link to="/" className="transition-colors hover:text-[var(--burgundy)]">Home</Link>
              <ChevronRight size={12} className="text-[var(--gold)]" />
            </li>
            <li className="text-[var(--charcoal)]">Contact</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mt-3 border-b border-[var(--border-light)] pb-5">
          <p style={{ fontFamily: SANS }} className="text-[0.64rem] uppercase tracking-[0.2em] text-[#A8853F]">
            Talk to a real person
          </p>
          <h1 style={{ fontFamily: SERIF }} className="mt-1 text-[1.7rem] font-semibold leading-tight text-[var(--charcoal)] sm:text-[2.1rem]">
            Let us plan it <em className="italic text-[var(--burgundy)]">together</em>
          </h1>
          <p style={{ fontFamily: SANS }} className="mt-1.5 max-w-xl text-[0.88rem] leading-relaxed text-[var(--mid)]">
            Tell us the occasion, the date and the budget you have in mind. We reply with ideas, photos of past setups and a quote.
          </p>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          {/* Form */}
          <div className="min-w-0 lg:col-span-7">
            {referenceId !== null ? (
              <div role="status" className="rounded-2xl border border-[var(--border-light)] bg-white p-6 text-center sm:p-8">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3EA] text-[#3F7A3F]">
                  <CheckCircle2 size={24} />
                </span>
                <p style={{ fontFamily: SERIF }} className="mt-3 text-[1.5rem] font-semibold leading-tight text-[var(--charcoal)]">
                  Thank you, we have your message
                </p>
                <p style={{ fontFamily: SANS }} className="mx-auto mt-1.5 max-w-md text-[0.88rem] leading-relaxed text-[var(--mid)]">
                  Our team will get back to you on {form.email.trim() || 'your email'} or {normalizePhone(form.phone) || form.phone}, usually within a few hours.
                </p>
                {referenceId && (
                  <p style={{ fontFamily: SANS }} className="mx-auto mt-4 inline-flex flex-col rounded-xl bg-[var(--cream)] px-5 py-3 text-[0.78rem] text-[var(--mid)]">
                    Your reference
                    <span className="mt-0.5 text-[1.05rem] font-semibold tracking-[0.06em] text-[var(--charcoal)]">{referenceId}</span>
                  </p>
                )}
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={startOver}
                    style={{ fontFamily: SANS }}
                    className="inline-flex h-11 items-center rounded-xl border border-[var(--border-light)] bg-white px-5 text-[0.86rem] font-medium text-[var(--charcoal)] transition-colors hover:border-[var(--charcoal)]"
                  >
                    Send another message
                  </button>
                  {getAccessToken() && (
                    <Link
                      to="/support"
                      style={{ fontFamily: SANS }}
                      className="inline-flex h-11 items-center rounded-xl bg-[var(--burgundy)] px-5 text-[0.86rem] font-semibold text-white transition-colors hover:bg-[var(--burgundy-dark)]"
                    >
                      View my queries
                    </Link>
                  )}
                </div>
              </div>
            ) : (
            <form
              onSubmit={(ev) => { ev.preventDefault(); void submit(); }}
              noValidate
              className="rounded-2xl border border-[var(--border-light)] bg-white p-5 sm:p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <Label htmlFor="contact-name">Your name</Label>
                  <input
                    id="contact-name"
                    value={form.name}
                    onChange={(ev) => set('name', ev.target.value)}
                    placeholder="Priya Nair"
                    autoComplete="name"
                    aria-invalid={touched && !!errors.name}
                    style={{ fontFamily: SANS }}
                    className={fieldClass(touched && !!errors.name)}
                  />
                  {touched && errors.name && (
                    <p style={{ fontFamily: SANS }} className="mt-1 text-[0.76rem] text-[var(--rose)]">{errors.name}</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <Label htmlFor="contact-phone">Mobile number</Label>
                  <input
                    id="contact-phone"
                    type="tel"
                    inputMode="tel"
                    maxLength={20}
                    value={form.phone}
                    onChange={(ev) => set('phone', ev.target.value.replace(/[^\d+\s()-]/g, ''))}
                    placeholder="98765 43210"
                    autoComplete="tel"
                    aria-invalid={touched && !!errors.phone}
                    style={{ fontFamily: SANS }}
                    className={fieldClass(touched && !!errors.phone)}
                  />
                  {touched && errors.phone && (
                    <p style={{ fontFamily: SANS }} className="mt-1 text-[0.76rem] text-[var(--rose)]">{errors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <input
                    id="contact-email"
                    type="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(ev) => set('email', ev.target.value)}
                    placeholder="priya@example.com"
                    autoComplete="email"
                    aria-invalid={touched && !!errors.email}
                    style={{ fontFamily: SANS }}
                    className={fieldClass(touched && !!errors.email)}
                  />
                  {touched && errors.email && (
                    <p style={{ fontFamily: SANS }} className="mt-1 text-[0.76rem] text-[var(--rose)]">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact-occasion" optional>Occasion</Label>
                  <select
                    id="contact-occasion"
                    value={form.occasion}
                    onChange={(ev) => set('occasion', ev.target.value)}
                    style={{ fontFamily: SANS }}
                    className={`${fieldClass(false)} cursor-pointer`}
                  >
                    <option value="">Select one</option>
                    {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <Label htmlFor="contact-city" optional>City</Label>
                  <select
                    id="contact-city"
                    value={form.city}
                    onChange={(ev) => set('city', ev.target.value)}
                    style={{ fontFamily: SANS }}
                    className={`${fieldClass(false)} cursor-pointer capitalize`}
                  >
                    <option value="">Select one</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="Somewhere else">Somewhere else</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="contact-date" optional>Date you have in mind</Label>
                  <input
                    id="contact-date"
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(ev) => set('date', ev.target.value)}
                    style={{ fontFamily: SANS }}
                    className={`${fieldClass(false)} cursor-pointer`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="contact-message">What are you planning?</Label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={form.message}
                    onChange={(ev) => set('message', ev.target.value)}
                    placeholder="A surprise anniversary setup at home for two, soft lighting and white flowers. Budget around ₹8,000."
                    aria-invalid={touched && !!errors.message}
                    style={{ fontFamily: SANS }}
                    className={`${fieldClass(touched && !!errors.message)} resize-y leading-relaxed`}
                  />
                  {touched && errors.message && (
                    <p style={{ fontFamily: SANS }} className="mt-1 text-[0.76rem] text-[var(--rose)]">{errors.message}</p>
                  )}
                </div>
              </div>

              {error && (
                <p role="alert" style={{ fontFamily: SANS }} className="mt-4 flex items-start gap-2 rounded-xl bg-[var(--rose-light)] px-3.5 py-2.5 text-[0.82rem] font-medium text-[var(--burgundy)]">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  style={{ fontFamily: SANS, background: 'linear-gradient(135deg, var(--burgundy), var(--burgundy-dark))' }}
                  className="inline-flex h-12 items-center gap-2 rounded-xl px-6 text-[0.92rem] font-semibold text-white shadow-[0_12px_28px_-10px_rgba(124,45,59,0.6)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
                >
                  {sending ? <Loader2 size={17} className="animate-spin" /> : <Send size={16} />}
                  {sending ? 'Sending…' : 'Send message'}
                </button>
                <button
                  type="button"
                  onClick={openWhatsApp}
                  disabled={sending}
                  style={{ fontFamily: SANS }}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-[var(--border-light)] bg-white px-5 text-[0.88rem] font-medium text-[var(--charcoal)] transition-colors hover:border-[var(--charcoal)]"
                >
                  <MessageCircle size={16} className="text-[#25D366]" /> Chat on WhatsApp instead
                </button>
              </div>

              <p style={{ fontFamily: SANS }} className="mt-3 text-[0.76rem] leading-relaxed text-[var(--mid)]">
                We use your email and number only to answer this enquiry.
              </p>
            </form>
            )}
          </div>

          {/* Details */}
          <aside className="min-w-0 lg:col-span-5">
            <div className="rounded-2xl border border-[var(--border-light)] bg-white p-5">
              <p style={{ fontFamily: SERIF }} className="text-[1.3rem] font-semibold leading-tight text-[var(--charcoal)]">
                Reach us directly
              </p>
              <ul className="mt-3 grid gap-2">
                {contacts.map(({ icon: Icon, label, value, href, external, tone }) => (
                  <li key={label}>
                    <a
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className="flex items-center gap-3 rounded-xl border border-[var(--border-light)] px-3.5 py-2.5 transition-colors hover:border-[var(--gold)] hover:bg-[var(--cream)]"
                    >
                      <Icon size={17} className={`shrink-0 ${tone}`} />
                      <span className="min-w-0" style={{ fontFamily: SANS }}>
                        <span className="block text-[0.86rem] font-medium text-[var(--charcoal)]">{label}</span>
                        <span className="block truncate text-[0.76rem] text-[var(--mid)]">{value}</span>
                      </span>
                      <ChevronRight size={14} className="ml-auto shrink-0 text-[var(--mid)]" />
                    </a>
                  </li>
                ))}
              </ul>

              <dl style={{ fontFamily: SANS }} className="mt-4 grid gap-3 border-t border-[var(--border-light)] pt-4 text-[0.84rem]">
                <div className="flex items-start gap-2.5">
                  <Clock size={15} className="mt-0.5 shrink-0 text-[var(--gold)]" />
                  <div>
                    <dt className="font-medium text-[var(--charcoal)]">Hours</dt>
                    <dd className="text-[var(--mid)]">{HOURS}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-[var(--gold)]" />
                  <div>
                    <dt className="font-medium text-[var(--charcoal)]">Office</dt>
                    <dd className="text-[var(--mid)]">{OFFICE}</dd>
                  </div>
                </div>
              </dl>

              {cities.length > 0 && (
                <div className="mt-4 border-t border-[var(--border-light)] pt-4">
                  <p style={{ fontFamily: SANS }} className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#A8853F]">
                    Setting up in
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {cities.map((c) => (
                      <li
                        key={c}
                        style={{ fontFamily: SANS }}
                        className="rounded-full bg-[var(--rose-light)] px-2.5 py-1 text-[0.78rem] capitalize text-[var(--burgundy)]"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-3 rounded-2xl border border-[var(--border-light)] bg-white p-5">
              <p style={{ fontFamily: SANS }} className="text-[0.86rem] leading-relaxed text-[var(--mid)]">
                Looking for an answer about an existing booking? The{' '}
                <Link to="/help" className="font-medium text-[var(--burgundy)] underline underline-offset-4">help centre</Link>{' '}
                covers refunds, rescheduling and what happens on the day.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
