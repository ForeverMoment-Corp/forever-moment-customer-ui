import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUp,
  ChevronDown,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Youtube,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { categoryPath, type NavCategory } from "@/components/navbar/navTypes";
import { EMAIL, HOURS, OFFICE, PHONE, SOCIAL_LINKS, whatsappLink } from "@/features/help/contact";

const sans = { fontFamily: "'Jost', sans-serif" } as const;
const serif = { fontFamily: "'Cormorant Garamond', serif" } as const;

/** How many categories the footer lists before handing off to "All categories". */
const MAX_CATEGORIES = 6;

const SOCIAL_ICONS = { instagram: Instagram, facebook: Facebook, youtube: Youtube } as const;

/* Only routes that exist in the app; the footer never links to a placeholder. */
const HELP_LINKS = [
  { label: "Help centre", to: "/help" },
  { label: "FAQs", to: "/faqs" },
  { label: "Contact us", to: "/contact" },
  { label: "My support queries", to: "/support" },
];

const linkBase =
  "inline-block py-1 text-[0.86rem] transition-colors hover:text-[#E8C97A] focus-visible:text-[#E8C97A] focus-visible:outline-none";
const linkClass = `${linkBase} text-white/65`;

/**
 * A link column. On phones it collapses into an accordion so the footer is not a wall of
 * links above the bottom nav; from `md` up it is always expanded.
 */
function FooterColumn({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <nav aria-labelledby={`${id}-heading`} className="border-b border-white/10 md:border-0">
      <h2 id={`${id}-heading`} className="m-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`${id}-list`}
          style={sans}
          className="flex w-full items-center justify-between py-4 text-left text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#C9A84C] md:pointer-events-none md:py-0 md:pb-4"
        >
          {title}
          <ChevronDown size={16} className={`transition-transform duration-200 md:hidden ${open ? "rotate-180" : ""}`} aria-hidden />
        </button>
      </h2>
      <ul id={`${id}-list`} style={sans} className={`${open ? "block" : "hidden"} space-y-1 pb-4 md:block md:pb-0`}>
        {children}
      </ul>
    </nav>
  );
}

export default function Footer() {
  const apiCategories = useAppSelector((state) => state.header?.categories ?? []) as NavCategory[];
  const categories = apiCategories
    .filter((c) => c?.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, MAX_CATEGORIES);

  const socials = SOCIAL_LINKS.filter((s) => s.url);
  const year = new Date().getFullYear();

  // The page-level CTA (FloatingBookingCTA) sits directly above on the same dark tone, so the
  // top rule marks where the footer starts. The footer carries no CTA band of its own.
  return (
    <footer className="border-t border-white/10 bg-[#1A1208] text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      <div className="mx-auto max-w-[1380px] px-4 sm:px-6">
        <div className="grid gap-0 py-8 md:grid-cols-2 md:gap-10 md:py-14 lg:grid-cols-12">
          {/* Brand */}
          <div className="pb-6 md:pb-0 lg:col-span-4">
            <Link to="/" aria-label="Forever Moment home" className="inline-flex flex-col leading-tight">
              <span style={serif} className="text-[1.5rem] font-bold tracking-[0.2em] text-[#C9A84C]">FOREVER</span>
              <span style={sans} className="text-[0.6rem] tracking-[0.45em] text-white">MOMENT</span>
            </Link>
            <p style={sans} className="mt-4 max-w-sm text-[0.86rem] leading-relaxed text-white/60">
              Decorations, surprises and celebrations set up at your venue, so you can enjoy the moment instead of planning it.
            </p>
            <p style={sans} className="mt-4 inline-flex items-center gap-2 text-[0.78rem] text-white/55">
              <ShieldCheck size={15} className="text-[#C9A84C]" aria-hidden /> Secure payments · Booking confirmed on WhatsApp
            </p>

            {socials.length > 0 && (
              <ul className="mt-5 flex gap-2.5" aria-label="Follow us">
                {socials.map(({ id, label, url }) => {
                  const Icon = SOCIAL_ICONS[id];
                  return (
                    <li key={id}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Forever Moment on ${label}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-[#C9A84C] hover:text-[#C9A84C]"
                      >
                        <Icon size={16} aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Explore: driven by /public/categories; hidden until there is something to list. */}
          {categories.length > 0 && (
            <div className="lg:col-span-3">
              <FooterColumn id="footer-explore" title="Explore">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link to={categoryPath(cat)} className={linkClass}>{cat.name}</Link>
                  </li>
                ))}
                <li>
                  <Link to="/featured-experiences" className={linkClass}>Featured experiences</Link>
                </li>
                <li>
                  <Link to="/categories" className={`${linkBase} font-medium text-[#C9A84C]`}>All categories →</Link>
                </li>
              </FooterColumn>
            </div>
          )}

          <div className="lg:col-span-2">
            <FooterColumn id="footer-help" title="Help">
              {HELP_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkClass}>{l.label}</Link>
                </li>
              ))}
            </FooterColumn>
          </div>

          {/* Contact: always visible, every line actionable. */}
          <address className="pt-6 not-italic md:pt-0 lg:col-span-3">
            <p style={sans} className="pb-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#C9A84C]">
              Get in touch
            </p>
            <ul style={sans} className="space-y-3 text-[0.86rem]">
              <li>
                <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="group flex items-center gap-3 text-white/75 transition-colors hover:text-[#E8C97A]">
                  <Phone size={15} className="shrink-0 text-[#C9A84C]" aria-hidden />
                  {PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 break-all text-white/75 transition-colors hover:text-[#E8C97A]">
                  <Mail size={15} className="shrink-0 text-[#C9A84C]" aria-hidden />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink("Hi! I have a query about Forever Moment.")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-white/75 transition-colors hover:text-[#E8C97A]"
                >
                  <MessageCircle size={15} className="shrink-0 text-[#25D366]" aria-hidden />
                  WhatsApp us
                </a>
              </li>
              <li className="flex items-start gap-3 text-white/55">
                <Clock size={15} className="mt-0.5 shrink-0 text-[#C9A84C]" aria-hidden />
                {HOURS}
              </li>
              <li className="flex items-start gap-3 text-white/55">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#C9A84C]" aria-hidden />
                {OFFICE}
              </li>
            </ul>
          </address>
        </div>

        {/* Bottom bar. Extra room on the right / bottom keeps it clear of the floating WhatsApp button. */}
        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-white/10 pb-20 pt-6 sm:flex-row sm:pb-6 sm:pr-20">
          <p style={sans} className="text-center text-[0.76rem] text-white/45 sm:text-left">
            © {year} Forever Moment. All rights reserved.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={sans}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-[0.74rem] uppercase tracking-[0.14em] text-white/70 transition-colors hover:border-[#C9A84C] hover:text-[#E8C97A]"
          >
            <ArrowUp size={14} aria-hidden /> Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
