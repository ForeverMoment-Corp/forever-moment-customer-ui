import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, BadgeIndianRupee, CalendarCheck, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import type { NavCategory } from '@/components/navbar/navTypes';
import { useSeo } from '@/hooks/useDocumentTitle';
import { registerVendor } from '@/features/help/partnerApi';
import PhoneInput from '@/components/common/PhoneInput';
import { isValidMobile, withCountryCode } from '@/lib/phone';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

const PERKS = [
    { icon: CalendarCheck, title: 'Steady bookings', desc: 'Customers in your city, booked and paid online.' },
    { icon: BadgeIndianRupee, title: 'Clear payouts', desc: 'Know what you earn on every setup.' },
    { icon: Sparkles, title: 'Showcase your work', desc: 'Your best setups in front of people planning celebrations.' },
];

interface Form {
    businessName: string;
    category: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    password: string;
}

const EMPTY: Form = { businessName: '', category: '', contactName: '', contactEmail: '', contactPhone: '', password: '' };

const inputClass = (invalid: boolean) =>
    `h-11 w-full rounded-xl border bg-white px-3.5 text-[0.9rem] text-[var(--charcoal)] outline-none transition-colors placeholder:text-[var(--mid)]/70 ${
        invalid ? 'border-[var(--rose)]' : 'border-[var(--border-light)] focus:border-[var(--burgundy)]'
    }`;

/** /partner — decorators and vendors apply to join (POST /public/vendors/register). */
export default function PartnerPage() {
    useSeo({ title: 'Become a partner', description: 'Decorators and event vendors: join Forever Moment and get celebration bookings in your city.', path: '/partner' });
    const categories = useAppSelector((s) => (s.header?.categories ?? []) as NavCategory[]);
    const [form, setForm] = useState<Form>(EMPTY);
    const [touched, setTouched] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value });

    const invalid = {
        businessName: form.businessName.trim().length < 2,
        category: !form.category,
        contactName: form.contactName.trim().length < 2,
        contactEmail: !/^\S+@\S+\.\S+$/.test(form.contactEmail.trim()),
        contactPhone: form.contactPhone !== '' && !isValidMobile(form.contactPhone),
        password: form.password.length < 8,
    };
    const valid = !Object.values(invalid).some(Boolean);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);
        if (!valid || sending) return;
        setSending(true);
        setError(null);
        try {
            await registerVendor({ ...form, contactPhone: withCountryCode(form.contactPhone) });
            setDone(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not send your application.');
        } finally {
            setSending(false);
        }
    };

    const field = (key: keyof Form, label: string, input: React.ReactNode, hint?: string) => (
        <label className="block">
            <span className="mb-1.5 block text-[0.8rem] font-semibold text-[var(--charcoal)]">{label}</span>
            {input}
            {touched && invalid[key] ? (
                <span className="mt-1 block text-[0.72rem] text-[var(--burgundy)]">{hint ?? 'Please fill this in.'}</span>
            ) : null}
        </label>
    );

    return (
        <div className="min-h-[70vh] bg-[var(--cream)] px-4 pb-14 pt-8 sm:px-6" style={{ fontFamily: SANS }}>
            <div className="mx-auto grid max-w-[1100px] items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
                <div>
                    <p className="text-[0.66rem] font-medium uppercase tracking-[0.22em] text-umber">For decorators &amp; vendors</p>
                    <h1 style={{ fontFamily: SERIF }} className="mt-1.5 text-[2rem] font-semibold leading-tight text-ink md:text-[2.4rem]">
                        Grow with <em className="italic text-[var(--burgundy)]">Forever Moment</em>
                    </h1>
                    <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-[var(--mid)]">
                        Tell us about your business. Our team reviews every application and gets back to you, usually within two working days.
                    </p>
                    <ul className="mt-6 grid gap-3">
                        {PERKS.map(({ icon: Icon, title, desc }) => (
                            <li key={title} className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--rose-light)] text-[var(--burgundy)]">
                                    <Icon size={18} />
                                </span>
                                <span>
                                    <span className="block text-[0.92rem] font-medium text-ink">{title}</span>
                                    <span className="block text-[0.8rem] text-[var(--mid)]">{desc}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-[22px] border border-[var(--border-light)] bg-white p-5 sm:p-7">
                    {done ? (
                        <div className="py-8 text-center">
                            <CheckCircle2 size={36} className="mx-auto text-leaf" />
                            <h2 style={{ fontFamily: SERIF }} className="mt-3 text-[1.6rem] font-semibold text-ink">
                                Application received
                            </h2>
                            <p className="mx-auto mt-1 max-w-sm text-[0.86rem] text-[var(--mid)]">
                                Thanks, {form.contactName.split(' ')[0]}. We'll review {form.businessName} and email {form.contactEmail} once it's approved.
                            </p>
                            <Link to="/" className="mt-5 inline-block text-[0.84rem] font-medium text-[var(--burgundy)] underline underline-offset-4">
                                Back to home
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={submit} noValidate className="grid gap-4">
                            <h2 style={{ fontFamily: SERIF }} className="text-[1.45rem] font-semibold text-ink">
                                Apply to join
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {field(
                                    'businessName',
                                    'Business name',
                                    <input value={form.businessName} onChange={set('businessName')} maxLength={150} autoComplete="organization" className={inputClass(touched && invalid.businessName)} />,
                                )}
                                {field(
                                    'category',
                                    'What do you offer?',
                                    <select value={form.category} onChange={set('category')} className={inputClass(touched && invalid.category)}>
                                        <option value="">Choose one</option>
                                        {categories
                                            .filter((c) => c && c.isActive !== false)
                                            .map((c) => (
                                                <option key={c.id} value={c.name.trim()}>
                                                    {c.name.trim()}
                                                </option>
                                            ))}
                                        <option value="Other">Other</option>
                                    </select>,
                                    'Please choose one.',
                                )}
                                {field(
                                    'contactName',
                                    'Your name',
                                    <input value={form.contactName} onChange={set('contactName')} maxLength={100} autoComplete="name" className={inputClass(touched && invalid.contactName)} />,
                                )}
                                {field(
                                    'contactPhone',
                                    'Phone (optional)',
                                    <PhoneInput
                                        value={form.contactPhone}
                                        onChange={(digits) => setForm({ ...form, contactPhone: digits })}
                                        placeholder="98765 43210"
                                        invalid={touched && invalid.contactPhone}
                                    />,
                                    'Please enter a valid 10-digit mobile number.',
                                )}
                                {field(
                                    'contactEmail',
                                    'Email',
                                    <input
                                        value={form.contactEmail}
                                        onChange={set('contactEmail')}
                                        maxLength={150}
                                        type="email"
                                        autoComplete="email"
                                        className={inputClass(touched && invalid.contactEmail)}
                                    />,
                                    'Please enter a valid email.',
                                )}
                                {field(
                                    'password',
                                    'Create a password',
                                    <input
                                        value={form.password}
                                        onChange={set('password')}
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="At least 8 characters"
                                        className={inputClass(touched && invalid.password)}
                                    />,
                                    'At least 8 characters.',
                                )}
                            </div>
                            <p className="-mt-1 text-[0.74rem] text-[var(--mid)]">You'll use this email and password to sign in to the partner app once approved.</p>

                            {error && (
                                <p role="alert" className="flex items-center gap-2 rounded-xl bg-[var(--rose-light)] px-3.5 py-2.5 text-[0.84rem] text-[var(--burgundy)]">
                                    <AlertCircle size={16} /> {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={sending}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--burgundy)] px-6 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--burgundy-dark)] disabled:opacity-70"
                            >
                                {sending && <Loader2 size={15} className="animate-spin" />}
                                {sending ? 'Sending' : 'Send application'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
