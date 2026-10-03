import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { HELP_TOPICS, type HelpArticle, type HelpTopic } from '@/features/help/data';

const SANS = "'Jost', sans-serif";
const SERIF = "'Cormorant Garamond', serif";

const ICONS = {
  calendar: CalendarDays,
  truck: Truck,
  refund: RotateCcw,
  sparkles: Sparkles,
  wallet: Wallet,
} as const;

const WHATSAPP = 'https://wa.me/919876543210?text=Hi! I have a query about Forever Moment.';
const PHONE = '+91 65223651230';
const EMAIL = 'support@forevermoment.com';

interface Match extends HelpArticle {
  topicId: string;
  topicLabel: string;
}

const flatten = (topics: HelpTopic[]): Match[] =>
  topics.flatMap((t) => t.articles.map((a) => ({ ...a, topicId: t.id, topicLabel: t.label })));

export default function HelpCenterView() {
  const [query, setQuery] = useState('');
  const [topicId, setTopicId] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const term = query.trim().toLowerCase();

  // Searching looks across every topic; the chips only narrow when nothing is typed.
  const results = useMemo(() => {
    const all = flatten(HELP_TOPICS);
    if (term) return all.filter((a) => `${a.q} ${a.a}`.toLowerCase().includes(term));
    return topicId ? all.filter((a) => a.topicId === topicId) : all;
  }, [term, topicId]);

  const activeTopic = HELP_TOPICS.find((t) => t.id === topicId) ?? null;

  // A flat list of every question is hard to scan, so group it by topic unless the
  // reader has already narrowed to one topic or typed a search.
  const groups = useMemo(() => {
    if (activeTopic) return [{ topic: activeTopic, items: results }];
    const byTopic = HELP_TOPICS.map((t) => ({ topic: t, items: results.filter((a) => a.topicId === t.id) })).filter((g) => g.items.length > 0);
    return byTopic;
  }, [results, activeTopic]);

  const contacts = [
    { icon: MessageCircle, label: 'WhatsApp', value: 'Usually replies in minutes', href: WHATSAPP, external: true, tone: 'text-[#25D366]' },
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
            <li className="text-[var(--charcoal)]">Help centre</li>
          </ol>
        </nav>

        {/* Header + search */}
        <div className="mt-3 border-b border-[var(--border-light)] pb-5">
          <p style={{ fontFamily: SANS }} className="text-[0.64rem] uppercase tracking-[0.2em] text-[#A8853F]">
            We are here to help
          </p>
          <h1 style={{ fontFamily: SERIF }} className="mt-1 text-[1.7rem] font-semibold leading-tight text-[var(--charcoal)] sm:text-[2.1rem]">
            How can we <em className="italic text-[var(--burgundy)]">help</em>?
          </h1>

          <div className="mt-4 flex h-12 max-w-xl items-center gap-2.5 rounded-full border border-[var(--border-light)] bg-white pl-4 pr-1.5 transition-colors focus-within:border-[var(--charcoal)]">
            <Search size={17} className="shrink-0 text-[var(--gold)]" />
            <input
              id="help-search"
              type="search"
              value={query}
              onChange={(ev) => {
                setQuery(ev.target.value);
                setOpen(null);
              }}
              placeholder="Search bookings, setup, refunds…"
              aria-label="Search help articles"
              style={{ fontFamily: SANS }}
              className="min-w-0 flex-1 bg-transparent text-[0.9rem] text-[var(--charcoal)] outline-none placeholder:text-[var(--mid)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="mr-1.5 flex h-7 w-7 items-center justify-center rounded-full text-[var(--mid)] transition-colors hover:bg-[var(--cream)] hover:text-[var(--charcoal)]"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Topics */}
        {!term && (
          <div className="scrollbar-hide -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => { setTopicId(null); setOpen(null); }}
              aria-pressed={topicId == null}
              style={{ fontFamily: SANS }}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[0.8rem] transition-colors ${
                topicId == null
                  ? 'border-[var(--charcoal)] bg-[var(--charcoal)] text-white'
                  : 'border-[var(--border-light)] bg-white text-[var(--charcoal)] hover:border-[var(--charcoal)]'
              }`}
            >
              All topics
            </button>
            {HELP_TOPICS.map((t) => {
              const Icon = ICONS[t.icon];
              const active = topicId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setTopicId(active ? null : t.id); setOpen(null); }}
                  aria-pressed={active}
                  style={{ fontFamily: SANS }}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8rem] transition-colors ${
                    active
                      ? 'border-[var(--charcoal)] bg-[var(--charcoal)] text-white'
                      : 'border-[var(--border-light)] bg-white text-[var(--charcoal)] hover:border-[var(--charcoal)]'
                  }`}
                >
                  <Icon size={13} className={active ? 'text-white/80' : 'text-[var(--gold)]'} />
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 grid gap-6 lg:grid-cols-12">
          {/* Articles */}
          <div className="min-w-0 lg:col-span-8">
            <p style={{ fontFamily: SANS }} className="mb-2 text-[0.8rem] text-[var(--mid)]">
              {term
                ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query.trim()}”`
                : activeTopic?.blurb ?? 'Everything people ask us most often'}
            </p>

            {results.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-white/60 py-14 text-center">
                <p style={{ fontFamily: SERIF }} className="text-[1.35rem] font-medium text-[var(--charcoal)]">
                  No answer for that yet
                </p>
                <p style={{ fontFamily: SANS }} className="mx-auto mt-1.5 max-w-sm text-[0.86rem] text-[var(--mid)]">
                  Message us on WhatsApp and a real person will get back to you, usually within a few minutes.
                </p>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontFamily: SANS }}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--burgundy)] px-5 py-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[var(--burgundy-dark)]"
                >
                  <MessageCircle size={14} /> Ask on WhatsApp
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {(term ? [{ topic: null, items: results }] : groups).map(({ topic, items }) => (
                  <section key={topic?.id ?? 'results'}>
                    {topic && !activeTopic && (
                      <h2 style={{ fontFamily: SANS }} className="mb-1.5 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#A8853F]">
                        {(() => { const Icon = ICONS[topic.icon]; return <Icon size={13} />; })()}
                        {topic.label}
                      </h2>
                    )}
                    <div className="overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white">
                {items.map((a, i) => {
                  const key = `${a.topicId}-${i}`;
                  const isOpen = open === key;
                  return (
                    <div key={key} className="border-b border-[var(--border-light)] last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : key)}
                        aria-expanded={isOpen}
                        style={{ fontFamily: SANS }}
                        className="group flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left sm:px-5"
                      >
                        <span className="min-w-0">
                          {term && (
                            <span className="mb-0.5 block text-[0.62rem] uppercase tracking-[0.14em] text-[#A8853F]">{a.topicLabel}</span>
                          )}
                          <span className={`block text-[0.94rem] font-medium leading-snug transition-colors ${isOpen ? 'text-[var(--burgundy)]' : 'text-[var(--charcoal)] group-hover:text-[var(--burgundy)]'}`}>
                            {a.q}
                          </span>
                        </span>
                        <span
                          className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                            isOpen ? 'rotate-45 border-[var(--burgundy)] bg-[var(--burgundy)] text-white' : 'border-[var(--border-light)] text-[var(--mid)]'
                          }`}
                        >
                          <Plus size={15} />
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p style={{ fontFamily: SANS }} className="px-4 pb-4 pr-12 text-[0.88rem] leading-relaxed text-[#4A3F35] sm:px-5">
                              {a.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          {/* Contact */}
          <aside className="min-w-0 lg:col-span-4">
            <div className="rounded-2xl border border-[var(--border-light)] bg-white p-5 lg:sticky lg:top-[120px]">
              <p style={{ fontFamily: SERIF }} className="text-[1.3rem] font-semibold leading-tight text-[var(--charcoal)]">
                Still stuck?
              </p>
              <p style={{ fontFamily: SANS }} className="mt-1 text-[0.84rem] leading-relaxed text-[var(--mid)]">
                Our team answers seven days a week, 9 AM to 9 PM.
              </p>

              <ul className="mt-4 grid gap-2">
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

              <div className="mt-4 rounded-xl bg-[var(--cream)] px-3.5 py-3">
                <p style={{ fontFamily: SANS }} className="text-[0.76rem] leading-relaxed text-[var(--mid)]">
                  Already booked? Keep your booking reference handy. It is in the confirmation we sent on WhatsApp.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
