import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    Edit2,
    Loader2,
    LogOut,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Sparkles,
    User,
} from 'lucide-react';
import type { AppDispatch, RootState } from '@/store/store';
import { fetchProfile, logoutUser, updateProfile } from '@/features/auth/store/authSlice';
import Breadcrumbs from '@/features/experiences/pages/ExperienceDetail/components/Breadcrumbs';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

interface ProfileForm {
    fullName: string;
    phoneNumber: string;
    preferredCity: string;
}

const QUICK_LINKS = [
    { icon: MessageSquare, label: 'My queries', hint: 'Support requests and replies', to: '/support' },
    { icon: Sparkles, label: 'Browse experiences', hint: 'Find your next celebration', to: '/categories' },
    { icon: CircleHelp, label: 'Help centre', hint: 'FAQs, policies and contact', to: '/help' },
];

const initialsOf = (name?: string) =>
    (name || '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || '';

const inputClass =
    'h-11 w-full rounded-xl border border-[var(--border-light)] bg-white px-3.5 text-[0.9rem] text-[var(--charcoal)] placeholder:text-[var(--mid)]/70 outline-none transition-colors focus:border-[var(--burgundy)] disabled:bg-[var(--cream)] disabled:text-[var(--mid)]';

function DetailRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value?: string }) {
    return (
        <div className="flex items-center gap-3.5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--rose-light)] text-[var(--burgundy)]">
                <Icon size={17} />
            </span>
            <div className="min-w-0">
                <dt className="text-[0.66rem] uppercase tracking-[0.16em] text-[var(--mid)]">{label}</dt>
                <dd className={`mt-0.5 truncate text-[0.94rem] ${value ? 'text-[var(--charcoal)]' : 'italic text-[var(--mid)]'}`}>
                    {value || 'Not added yet'}
                </dd>
            </div>
        </div>
    );
}

const ProfilePage: React.FC = () => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState<ProfileForm>({ fullName: '', phoneNumber: '', preferredCity: '' });

    // The profile API returns phoneNumber / preferredCity; a profile update stores phone / location.
    const phone: string = user?.phone || user?.phoneNumber || '';
    const city: string = user?.location || user?.preferredCity || '';

    useEffect(() => {
        if (!isAuthenticated) navigate('/');
    }, [isAuthenticated, navigate]);

    // Refresh from the server so the page never shows a stale cached profile.
    useEffect(() => {
        if (isAuthenticated) dispatch(fetchProfile());
    }, [isAuthenticated, dispatch]);

    useEffect(() => {
        if (user && !isEditing) {
            setForm({ fullName: user.name || '', phoneNumber: phone, preferredCity: city });
        }
    }, [user, phone, city, isEditing]);

    useEffect(() => {
        if (!saved) return;
        const t = window.setTimeout(() => setSaved(false), 3500);
        return () => window.clearTimeout(t);
    }, [saved]);

    if (!user) return null;

    const completeness = [user.name, user.email, phone, city, user.profilePictureUrl].filter(Boolean).length;
    const completenessPct = Math.round((completeness / 5) * 100);

    const startEditing = () => {
        setError(null);
        setSaved(false);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setError(null);
        setIsEditing(false);
    };

    const handleSave = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!form.fullName.trim()) {
            setError('Please enter your name.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await dispatch(
                updateProfile({
                    fullName: form.fullName.trim(),
                    email: user.email,
                    phoneNumber: form.phoneNumber.trim(),
                    preferredCity: form.preferredCity.trim(),
                    profilePictureUrl: user.profilePictureUrl || '',
                }),
            ).unwrap();
            setIsEditing(false);
            setSaved(true);
        } catch (e) {
            setError(typeof e === 'string' ? e : 'Could not save your changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-[70vh] bg-[var(--cream)] pb-14 pt-5" style={{ fontFamily: SANS }}>
            <div className="mx-auto max-w-[var(--container-width)] px-4 sm:px-6 lg:px-8">
                <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'My profile' }]} />

                {/* Page header */}
                <div className="mt-3 border-b border-[var(--border-light)] pb-5">
                    <p className="text-[0.64rem] uppercase tracking-[0.2em] text-gold-deep">Account</p>
                    <h1 style={{ fontFamily: SERIF }} className="mt-1 text-[1.7rem] font-semibold leading-tight text-[var(--charcoal)] sm:text-[2.1rem]">
                        Hello, <em className="italic text-[var(--burgundy)]">{user.name?.split(' ')[0] || 'there'}</em>
                    </h1>
                    <p className="mt-1.5 max-w-xl text-[0.88rem] leading-relaxed text-[var(--mid)]">
                        Keep your details up to date so our planners can reach you about your celebrations.
                    </p>
                </div>

                <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
                    {/* Identity + shortcuts */}
                    <aside className="grid gap-6 lg:col-span-4">
                        <section className="overflow-hidden rounded-[22px] border border-[var(--border-light)] bg-white">
                            <div className="h-20 bg-gradient-to-r from-[var(--burgundy)] to-[var(--gold)]" />
                            <div className="-mt-10 px-5 pb-5 text-center">
                                {user.profilePictureUrl ? (
                                    <img
                                        src={user.profilePictureUrl}
                                        alt={user.name}
                                        className="mx-auto h-20 w-20 rounded-full border-4 border-white object-cover shadow-sm"
                                    />
                                ) : (
                                    <div
                                        aria-hidden="true"
                                        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[var(--rose-light)] text-[var(--burgundy)] shadow-sm"
                                    >
                                        {initialsOf(user.name) ? (
                                            <span style={{ fontFamily: SERIF }} className="text-[1.8rem] font-semibold">
                                                {initialsOf(user.name)}
                                            </span>
                                        ) : (
                                            <User size={30} />
                                        )}
                                    </div>
                                )}
                                <h2 style={{ fontFamily: SERIF }} className="mt-3 text-[1.45rem] font-semibold leading-tight text-[var(--charcoal)]">
                                    {user.name || 'Your name'}
                                </h2>
                                <p className="mt-0.5 truncate text-[0.84rem] text-[var(--mid)]">{user.email}</p>

                                {/* Profile completeness */}
                                <div className="mt-5 rounded-2xl bg-[var(--cream)] p-3.5 text-left">
                                    <div className="flex items-center justify-between text-[0.74rem]">
                                        <span className="font-medium text-[var(--charcoal)]">Profile complete</span>
                                        <span className="font-semibold text-[var(--burgundy)]">{completenessPct}%</span>
                                    </div>
                                    <div
                                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--sand)]"
                                        role="progressbar"
                                        aria-valuenow={completenessPct}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-label="Profile completeness"
                                    >
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--gold)] transition-all duration-500"
                                            style={{ width: `${completenessPct}%` }}
                                        />
                                    </div>
                                    {completenessPct < 100 && !isEditing && (
                                        <button
                                            type="button"
                                            onClick={startEditing}
                                            className="mt-2.5 text-[0.76rem] font-medium text-[var(--burgundy)] underline underline-offset-4 hover:text-[var(--charcoal)]"
                                        >
                                            {!phone ? 'Add your phone number' : !city ? 'Add your city' : 'Complete your profile'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>

                        <nav aria-label="Account shortcuts" className="overflow-hidden rounded-[22px] border border-[var(--border-light)] bg-white">
                            <ul className="divide-y divide-[var(--border-light)]">
                                {QUICK_LINKS.map(({ icon: Icon, label, hint, to }) => (
                                    <li key={to}>
                                        <Link to={to} className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-[var(--cream)]">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--rose-light)] text-[var(--burgundy)]">
                                                <Icon size={16} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-[0.9rem] font-medium text-[var(--charcoal)] group-hover:text-[var(--burgundy)]">{label}</span>
                                                <span className="block truncate text-[0.74rem] text-[var(--mid)]">{hint}</span>
                                            </span>
                                            <ChevronRight size={16} className="shrink-0 text-[var(--gold)] transition-transform group-hover:translate-x-0.5" />
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => dispatch(logoutUser())}
                                        className="group flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-[var(--cream)]"
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cream)] text-[var(--mid)] group-hover:text-[var(--burgundy)]">
                                            <LogOut size={16} />
                                        </span>
                                        <span className="text-[0.9rem] font-medium text-[var(--mid)] group-hover:text-[var(--burgundy)]">Log out</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </aside>

                    {/* Personal details */}
                    <section className="rounded-[22px] border border-[var(--border-light)] bg-white p-5 sm:p-7 lg:col-span-8" aria-labelledby="personal-details">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 id="personal-details" style={{ fontFamily: SERIF }} className="text-[1.45rem] font-semibold leading-tight text-[var(--charcoal)]">
                                    Personal details
                                </h2>
                                <p className="mt-0.5 text-[0.82rem] text-[var(--mid)]">Used for booking confirmations and planner calls.</p>
                            </div>
                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={startEditing}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--border-light)] px-4 text-[0.84rem] font-medium text-[var(--charcoal)] transition-colors hover:border-[var(--burgundy)] hover:text-[var(--burgundy)]"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                            )}
                        </div>

                        {saved && (
                            <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-leaf-light px-3.5 py-2.5 text-[0.84rem] text-leaf">
                                <CheckCircle2 size={16} /> Your profile has been updated.
                            </p>
                        )}

                        {isEditing ? (
                            <form onSubmit={handleSave} className="mt-5" noValidate>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block sm:col-span-2">
                                        <span className="mb-1.5 block text-[0.78rem] font-medium text-[var(--charcoal)]">Full name</span>
                                        <input
                                            type="text"
                                            autoComplete="name"
                                            autoFocus
                                            value={form.fullName}
                                            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                            className={inputClass}
                                            placeholder="Your full name"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-[0.78rem] font-medium text-[var(--charcoal)]">Phone number</span>
                                        <input
                                            type="tel"
                                            autoComplete="tel"
                                            inputMode="tel"
                                            value={form.phoneNumber}
                                            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                            className={inputClass}
                                            placeholder="+91 98765 43210"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-[0.78rem] font-medium text-[var(--charcoal)]">City</span>
                                        <input
                                            type="text"
                                            autoComplete="address-level2"
                                            value={form.preferredCity}
                                            onChange={(e) => setForm({ ...form, preferredCity: e.target.value })}
                                            className={inputClass}
                                            placeholder="e.g. Mumbai"
                                        />
                                    </label>
                                    <label className="block sm:col-span-2">
                                        <span className="mb-1.5 block text-[0.78rem] font-medium text-[var(--charcoal)]">Email</span>
                                        <input type="email" value={user.email || ''} disabled className={inputClass} />
                                        <span className="mt-1 block text-[0.72rem] text-[var(--mid)]">Your sign-in email can't be changed here.</span>
                                    </label>
                                </div>

                                {error && (
                                    <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-[var(--rose-light)] px-3.5 py-2.5 text-[0.84rem] text-[var(--burgundy)]">
                                        <AlertCircle size={16} /> {error}
                                    </p>
                                )}

                                <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[var(--border-light)] pt-5">
                                    <button
                                        type="button"
                                        onClick={cancelEditing}
                                        disabled={saving}
                                        className="inline-flex h-11 items-center rounded-xl border border-[var(--border-light)] bg-white px-5 text-[0.86rem] font-medium text-[var(--charcoal)] transition-colors hover:border-[var(--charcoal)] disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--burgundy)] px-6 text-[0.86rem] font-semibold text-white transition-colors hover:bg-[var(--burgundy-dark)] disabled:opacity-70"
                                    >
                                        {saving && <Loader2 size={16} className="animate-spin" />}
                                        {saving ? 'Saving…' : 'Save changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <dl className="mt-3 grid divide-y divide-[var(--border-light)] sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
                                <DetailRow icon={User} label="Full name" value={user.name} />
                                <DetailRow icon={Mail} label="Email" value={user.email} />
                                <DetailRow icon={Phone} label="Phone number" value={phone} />
                                <DetailRow icon={MapPin} label="City" value={city} />
                            </dl>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
