import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  LogIn,
  MapPin,
  Menu,
  Package,
  Phone,
  Search,
  ShoppingBag,
  User,
  UserPlus,
  X,
} from "lucide-react";
import MegaMenu from "./MegaMenu";
import CategoryIcon from "./CategoryIcon";
import { categoryPath, subCategoryPath, type NavCategory } from "./navTypes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCategories } from "@/features/header/store/actions";
import { getLocations, setSelectedLocation } from "@/features/home/store/actions";
import { CUSTOMER_CONFIG } from "@/config/constants";

/* ────────────────────────────────────────────────────────────────
   Design tokens (new-ux palette)
   ink #1A1208 · gold #C9A84C · gold-dark #9A7A2E · sand #EDE0C4
   cream #FDFAF4 · taupe #5C4A1E · muted #9E8A6A · coral #D9776B
──────────────────────────────────────────────────────────────── */

const sans = { fontFamily: "'Jost', sans-serif" } as const;
const serif = { fontFamily: "'Cormorant Garamond', serif" } as const;

const TOP_BAR_H = 72;
const CAT_BAR_H = 48;

const guestMenuItems = [
  { icon: LogIn, label: "Login", to: "/login" },
  { icon: UserPlus, label: "Register", to: "/register" },
  { icon: Package, label: "My Bookings", to: "/dashboard" },
  { icon: User, label: "My Account", to: "/dashboard" },
  { icon: Phone, label: "Contact Us", to: "/contact" },
  { icon: CircleHelp, label: "FAQs", to: "/faqs" },
];

interface Location {
  id?: number;
  name: string;
  isActive: boolean;
}

/* Small labelled icon button used in the top-right cluster */
const IconAction = ({
  icon: Icon,
  label,
  to,
  onClick,
  badge,
  active,
}: {
  icon: typeof User;
  label: string;
  to?: string;
  onClick?: () => void;
  badge?: number;
  active?: boolean;
}) => {
  const cls = `group flex flex-col items-center gap-1 min-w-[48px] transition-colors ${
    active ? "text-[#C9A84C]" : "text-[#5C4A1E] hover:text-[#C9A84C]"
  }`;
  const inner = (
    <>
      <span className="relative">
        <Icon size={19} strokeWidth={1.6} />
        {badge ? (
          <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-[#D9776B] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
            {badge}
          </span>
        ) : null}
      </span>
      <span
        className="uppercase tracking-[0.1em] leading-none"
        style={{ ...sans, fontSize: "0.58rem" }}
      >
        {label}
      </span>
    </>
  );
  return to ? (
    <Link to={to} className={cls} aria-label={label}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls} aria-label={label} aria-expanded={active}>
      {inner}
    </button>
  );
};

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [guestOpen, setGuestOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const guestRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();

  const cartCount = 0;

  const apiCategories = useAppSelector((state) => state.header?.categories ?? []) as NavCategory[];
  const locations = useAppSelector((state) => state.home?.locations ?? []) as Location[];
  const selectedLocation = useAppSelector((state) => state.home?.selectedLocation ?? "Delhi NCR");

  useEffect(() => {
    dispatch(getCategories());
    if (locations.length === 0) {
      dispatch(getLocations());
    }
  }, [dispatch, locations.length]);

  const categories: NavCategory[] = apiCategories
    .filter((cat) => cat.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const activeCategory = categories.find((c) => c.id === activeMenu) ?? null;
  const activeLocations = locations.filter((loc) => loc.isActive);

  /* ── Hover intent: a short delay before opening and a grace period before
        closing stops the mega menu flickering while the cursor travels. ── */
  const clearTimers = useCallback(() => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const scheduleOpen = (cat: NavCategory) => {
    clearTimers();
    const hasSubs = cat.subCategories?.some((s) => s.isActive);
    if (!hasSubs) {
      setActiveMenu(null);
      return;
    }
    // Already browsing a menu → switch instantly; otherwise wait a beat.
    if (activeMenu !== null) {
      setActiveMenu(cat.id);
    } else {
      openTimer.current = window.setTimeout(() => setActiveMenu(cat.id), 110);
    }
  };

  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setActiveMenu(null), 160);
  };

  const closeAll = useCallback(() => {
    clearTimers();
    setActiveMenu(null);
    setGuestOpen(false);
    setCityOpen(false);
    setMobileOpen(false);
    setActiveMobileCategory(null);
  }, [clearTimers]);

  /* Close everything on route change (render-time state adjustment, no effect) */
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setActiveMenu(null);
    setGuestOpen(false);
    setCityOpen(false);
    setMobileOpen(false);
    setActiveMobileCategory(null);
  }

  /* Outside-click for the two small dropdowns, Escape for everything */
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (guestRef.current && !guestRef.current.contains(t)) setGuestOpen(false);
      if (cityRef.current && !cityRef.current.contains(t)) setCityOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [closeAll]);

  /* Lock page scroll while the mobile drawer is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => clearTimers, [clearTimers]);

  const submitSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setActiveMobileCategory(null);
  };

  const mobileCategory = categories.find((c) => c.id === activeMobileCategory) ?? null;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[100] bg-white"
        style={{ boxShadow: "0 2px 20px rgba(26,18,8,0.08)" }}
        onMouseEnter={clearTimers}
        onMouseLeave={scheduleClose}
      >
        {/* ═══════════════════ TOP BAR ═══════════════════ */}
        <div className="border-b border-[#EDE0C4]">
          <div
            className="container mx-auto px-6 flex items-center gap-4 lg:gap-6"
            style={{ height: TOP_BAR_H }}
          >
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={closeAll}>
              <img
                src={CUSTOMER_CONFIG.logo}
                alt={CUSTOMER_CONFIG.name}
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
              />
              <span className="hidden sm:flex flex-col leading-none">
                <span
                  className="text-[#1A1208]"
                  style={{ ...serif, fontSize: "1.3rem", fontWeight: 600, letterSpacing: "0.01em" }}
                >
                  {CUSTOMER_CONFIG.name}
                </span>
                <span
                  className="uppercase text-[#9E8A6A] mt-1"
                  style={{ ...sans, fontSize: "0.56rem", letterSpacing: "0.22em" }}
                >
                  Celebrate Every Moment
                </span>
              </span>
            </Link>

            {/* LOCATION (desktop) */}
            <div className="relative hidden lg:block shrink-0" ref={cityRef}>
              <button
                type="button"
                onClick={() => setCityOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={cityOpen}
                className={`flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1 border transition-colors ${
                  cityOpen
                    ? "border-[#C9A84C] bg-[#FDFAF4]"
                    : "border-[#EDE0C4] hover:border-[#C9A84C] hover:bg-[#FDFAF4]"
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-[#FDFAF4] border border-[#EDE0C4] flex items-center justify-center text-[#C9A84C]">
                  <MapPin size={13} strokeWidth={1.75} />
                </span>
                <span className="flex flex-col items-start leading-none">
                  <span
                    className="uppercase text-[#9E8A6A]"
                    style={{ ...sans, fontSize: "0.52rem", letterSpacing: "0.16em" }}
                  >
                    Celebrating in
                  </span>
                  <span
                    className="text-[#1A1208] capitalize mt-[3px] max-w-[120px] truncate"
                    style={{ ...sans, fontSize: "0.78rem", fontWeight: 500 }}
                  >
                    {selectedLocation}
                  </span>
                </span>
                <ChevronDown
                  size={13}
                  className={`text-[#9E8A6A] transition-transform ${cityOpen ? "rotate-180" : ""}`}
                />
              </button>

              {cityOpen && (
                <div
                  role="listbox"
                  className="absolute top-[calc(100%+10px)] left-0 w-[200px] bg-white rounded-2xl border border-[#EDE0C4] z-20 overflow-hidden py-1.5"
                  style={{ boxShadow: "0 16px 40px rgba(26,18,8,0.14)" }}
                >
                  <p
                    className="px-4 pt-2 pb-1.5 uppercase text-[#9E8A6A]"
                    style={{ ...sans, fontSize: "0.55rem", letterSpacing: "0.2em" }}
                  >
                    Choose your city
                  </p>
                  {activeLocations.length === 0 && (
                    <p className="px-4 py-2 text-[#9E8A6A]" style={{ ...sans, fontSize: "0.75rem" }}>
                      Loading cities…
                    </p>
                  )}
                  {activeLocations.map((c) => {
                    const selected = c.name === selectedLocation;
                    return (
                      <button
                        key={c.id ?? c.name}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          dispatch(setSelectedLocation(c.name));
                          setCityOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left capitalize transition-colors hover:bg-[#FDFAF4] ${
                          selected ? "text-[#9A7A2E] font-medium" : "text-[#5C4A1E]"
                        }`}
                        style={{ ...sans, fontSize: "0.8rem" }}
                      >
                        {c.name}
                        {selected && <Check size={14} className="text-[#C9A84C]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SEARCH (desktop) */}
            <div className="hidden md:flex flex-1 justify-center">
              <div
                role="search"
                className="w-full max-w-[520px] flex items-center bg-[#FDFAF4] border border-[#EDE0C4] rounded-full pl-4 pr-1.5 h-[42px] gap-3 hover:border-[#C9A84C] transition-colors focus-within:border-[#C9A84C] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(201,168,76,0.12)]"
              >
                <Search size={16} className="text-[#C9A84C] shrink-0" strokeWidth={1.75} />
                <input
                  type="search"
                  aria-label="Search"
                  placeholder="Search events, cakes, gifts, vendors…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                  onFocus={() => setActiveMenu(null)}
                  className="flex-1 min-w-0 bg-transparent outline-none placeholder-[#9E8A6A] text-[#1A1208] [&::-webkit-search-cancel-button]:hidden"
                  style={{ ...sans, fontSize: "0.82rem" }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#9E8A6A] hover:text-[#1A1208] hover:bg-[#EDE0C4]/60 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Submit search"
                  onClick={submitSearch}
                  className="h-[32px] px-4 rounded-full bg-[#1A1208] text-white uppercase tracking-[0.12em] hover:bg-[#C9A84C] transition-colors shrink-0"
                  style={{ ...sans, fontSize: "0.6rem", fontWeight: 600 }}
                >
                  Search
                </button>
              </div>
            </div>

            {/* RIGHT ACTIONS (desktop) */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
              <IconAction icon={CircleHelp} label="Help" to="/faqs" />

              <div className="relative" ref={guestRef}>
                <IconAction
                  icon={User}
                  label="Account"
                  active={guestOpen}
                  onClick={() => setGuestOpen((v) => !v)}
                />

                {guestOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+14px)] w-[232px] bg-white rounded-2xl border border-[#EDE0C4] z-[200] overflow-hidden"
                    style={{ boxShadow: "0 16px 48px rgba(26,18,8,0.14)" }}
                  >
                    <div className="absolute -top-1.5 right-5 w-3 h-3 bg-[#1A1208] rotate-45" />
                    <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-[#1A1208] to-[#2D1F0E]">
                      <p style={{ ...serif, fontSize: "1.15rem", color: "#C9A84C", fontWeight: 600 }}>
                        Welcome
                      </p>
                      <p
                        className="uppercase mt-1"
                        style={{ ...sans, fontSize: "0.58rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.14em" }}
                      >
                        Login to access your account
                      </p>
                    </div>
                    <div className="px-4 py-4 flex gap-2 border-b border-[#EDE0C4]">
                      <Link
                        to="/login"
                        onClick={() => setGuestOpen(false)}
                        style={sans}
                        className="flex-1 text-center py-2.5 rounded-full border border-[#C9A84C] text-[#9A7A2E] text-[0.62rem] tracking-[0.14em] uppercase font-semibold hover:bg-[#C9A84C] hover:text-white transition-all"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setGuestOpen(false)}
                        style={sans}
                        className="flex-1 text-center py-2.5 rounded-full bg-[#C9A84C] text-white text-[0.62rem] tracking-[0.14em] uppercase font-semibold hover:bg-[#1A1208] transition-all"
                      >
                        Register
                      </Link>
                    </div>
                    <div className="py-2">
                      {guestMenuItems.slice(2).map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setGuestOpen(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-[#5C4A1E] hover:bg-[#FDFAF4] hover:text-[#9A7A2E] transition-colors"
                          style={{ ...sans, fontSize: "0.78rem" }}
                        >
                          <item.icon size={14} className="text-[#C9A84C]" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <IconAction icon={ShoppingBag} label="Cart" to="/cart" badge={cartCount} />
            </div>

            {/* MOBILE RIGHT */}
            <div className="flex md:hidden flex-1 items-center justify-end gap-2">
              <div className="flex flex-1 max-w-[220px] items-center bg-[#FDFAF4] border border-[#EDE0C4] rounded-full px-3 h-[36px] gap-2 focus-within:border-[#C9A84C]">
                <Search size={14} className="text-[#C9A84C] shrink-0" />
                <input
                  type="search"
                  aria-label="Search"
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                  className="w-full min-w-0 bg-transparent outline-none placeholder-[#9E8A6A] text-[#1A1208] [&::-webkit-search-cancel-button]:hidden"
                  style={{ ...sans, fontSize: "0.75rem" }}
                />
              </div>
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => (mobileOpen ? closeMobile() : setMobileOpen(true))}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#1A1208] hover:bg-[#FDFAF4] shrink-0"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════ CATEGORY BAR ═══════════════════ */}
        <div className="hidden md:block bg-white border-b border-[#EDE0C4]">
          <div
            role="menubar"
            aria-label="Categories"
            className="container mx-auto px-6 flex items-center gap-1 overflow-x-auto scrollbar-hide"
            style={{ height: CAT_BAR_H }}
          >
            {categories.length === 0 &&
              Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="h-[30px] w-[110px] rounded-full bg-[#FDFAF4] border border-[#EDE0C4] animate-pulse shrink-0"
                />
              ))}

            {categories.map((cat) => {
              const isActive = activeMenu === cat.id;
              const hasSubs = cat.subCategories?.some((s) => s.isActive);
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="menuitem"
                  aria-haspopup={hasSubs ? "true" : undefined}
                  aria-expanded={hasSubs ? isActive : undefined}
                  onMouseEnter={() => scheduleOpen(cat)}
                  onFocus={() => scheduleOpen(cat)}
                  onClick={() => {
                    closeAll();
                    navigate(categoryPath(cat));
                  }}
                  style={sans}
                  className={`relative flex items-center gap-2 pl-3 pr-3.5 h-[32px] rounded-full whitespace-nowrap text-[0.76rem] font-medium tracking-wide capitalize transition-all shrink-0 border ${
                    isActive
                      ? "bg-[#FDFAF4] border-[#EDE0C4] text-[#1A1208]"
                      : "border-transparent text-[#5C4A1E] hover:bg-[#FDFAF4] hover:text-[#1A1208]"
                  }`}
                >
                  <CategoryIcon
                    name={cat.name}
                    size={15}
                    strokeWidth={1.75}
                    className={`transition-colors ${isActive ? "text-[#9A7A2E]" : "text-[#C9A84C]"}`}
                  />
                  {cat.name}
                  {hasSubs && (
                    <ChevronDown
                      size={12}
                      className={`text-[#9E8A6A] transition-transform ${isActive ? "rotate-180" : ""}`}
                    />
                  )}
                  {/* gold indicator under the active pill */}
                  <span
                    className={`absolute left-4 right-4 -bottom-[9px] h-[2px] rounded-full bg-[#C9A84C] transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════ MEGA MENU ═══════════════════ */}
        {activeCategory && (
          <div className="hidden md:block">
            <MegaMenu category={activeCategory} onNavigate={closeAll} />
          </div>
        )}
      </nav>

      {/* Dim the page while a mega menu is open; hovering it closes the menu */}
      {activeCategory && (
        <div
          aria-hidden
          className="hidden md:block fixed inset-0 z-[90] bg-[#1A1208]/25 backdrop-blur-[1.5px] transition-opacity"
          onMouseEnter={() => setActiveMenu(null)}
          onClick={() => setActiveMenu(null)}
        />
      )}

      {/* ═══════════════════ MOBILE OVERLAY + DRAWER ═══════════════════ */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-[101] md:hidden" onClick={closeMobile} />
      )}

      <aside
        aria-hidden={!mobileOpen}
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-[340px] bg-white z-[102] md:hidden transition-transform duration-300 ease-in-out flex flex-col ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ boxShadow: "4px 0 30px rgba(26,18,8,0.15)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-[64px] shrink-0 bg-gradient-to-r from-[#1A1208] to-[#2D1F0E]">
          <div className="flex items-center gap-2.5">
            <img src={CUSTOMER_CONFIG.logo} alt="" className="w-8 h-8 object-contain rounded-full bg-white/90 p-0.5" />
            <span style={{ ...serif, fontSize: "1.1rem", color: "#C9A84C", fontWeight: 600 }}>
              {CUSTOMER_CONFIG.name}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobile}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-white/20 text-white hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* City row (mobile) */}
        <div className="px-5 py-3 border-b border-[#EDE0C4] bg-[#FDFAF4] flex items-center gap-2">
          <MapPin size={14} className="text-[#C9A84C]" />
          <span className="uppercase text-[#9E8A6A]" style={{ ...sans, fontSize: "0.55rem", letterSpacing: "0.18em" }}>
            Celebrating in
          </span>
          <select
            aria-label="Choose your city"
            value={selectedLocation}
            onChange={(e) => dispatch(setSelectedLocation(e.target.value))}
            className="ml-auto bg-transparent text-[#1A1208] capitalize outline-none"
            style={{ ...sans, fontSize: "0.8rem", fontWeight: 500 }}
          >
            {activeLocations.map((c) => (
              <option key={c.id ?? c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!mobileCategory ? (
            <div>
              <p
                className="px-5 pt-4 pb-2 uppercase text-[#9E8A6A]"
                style={{ ...sans, fontSize: "0.6rem", letterSpacing: "0.2em" }}
              >
                Categories
              </p>

              <ul className="px-3 pb-3">
                {categories.map((cat) => {
                  const hasSubs = cat.subCategories?.some((s) => s.isActive);
                  return (
                    <li key={cat.id}>
                      {hasSubs ? (
                        <button
                          type="button"
                          onClick={() => setActiveMobileCategory(cat.id)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-[#1A1208] hover:bg-[#FDFAF4] transition-colors"
                          style={{ ...sans, fontSize: "0.85rem", fontWeight: 500 }}
                        >
                          <span className="w-9 h-9 rounded-[10px] bg-[#FDFAF4] border border-[#EDE0C4] flex items-center justify-center text-[#C9A84C] shrink-0">
                            <CategoryIcon name={cat.name} size={16} strokeWidth={1.75} />
                          </span>
                          <span className="flex-1 capitalize truncate">{cat.name}</span>
                          <ChevronRight size={16} className="text-[#9E8A6A]" />
                        </button>
                      ) : (
                        <Link
                          to={categoryPath(cat)}
                          onClick={closeMobile}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#1A1208] hover:bg-[#FDFAF4] transition-colors"
                          style={{ ...sans, fontSize: "0.85rem", fontWeight: 500 }}
                        >
                          <span className="w-9 h-9 rounded-[10px] bg-[#FDFAF4] border border-[#EDE0C4] flex items-center justify-center text-[#C9A84C] shrink-0">
                            <CategoryIcon name={cat.name} size={16} strokeWidth={1.75} />
                          </span>
                          <span className="flex-1 capitalize truncate">{cat.name}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mx-5 border-t border-[#EDE0C4]" />

              <p
                className="px-5 pt-4 pb-2 uppercase text-[#9E8A6A]"
                style={{ ...sans, fontSize: "0.6rem", letterSpacing: "0.2em" }}
              >
                Account
              </p>
              <ul className="mb-4">
                {guestMenuItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-[#FDFAF4] hover:text-[#9A7A2E] transition-colors text-[#5C4A1E]"
                      style={{ ...sans, fontSize: "0.8rem" }}
                    >
                      <item.icon size={15} className="text-[#C9A84C]" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="px-5 pb-6">
                <Link
                  to="/services"
                  onClick={closeMobile}
                  className="block bg-[#1A1208] text-white text-center rounded-full py-3.5 text-xs tracking-[0.16em] uppercase font-semibold hover:bg-[#C9A84C] transition-all"
                  style={sans}
                >
                  Book Now
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setActiveMobileCategory(null)}
                className="flex items-center gap-2 px-5 py-3.5 border-b border-[#EDE0C4] w-full hover:bg-[#FDFAF4] transition-colors text-[#5C4A1E]"
                style={{ ...sans, fontSize: "0.78rem" }}
              >
                <ArrowLeft size={14} /> All categories
              </button>

              <div className="px-5 py-4 bg-[#FDFAF4] border-b border-[#EDE0C4] flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg,#C9A84C,#9A7A2E)" }}>
                  <CategoryIcon name={mobileCategory.name} size={18} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[#1A1208] capitalize leading-tight" style={{ ...serif, fontSize: "1.25rem", fontWeight: 600 }}>
                    {mobileCategory.name}
                  </p>
                  {mobileCategory.description && (
                    <p className="text-[#9E8A6A] truncate" style={{ ...sans, fontSize: "0.7rem" }}>
                      {mobileCategory.description}
                    </p>
                  )}
                </div>
              </div>

              <ul className="py-2">
                {(mobileCategory.subCategories ?? [])
                  .filter((s) => s.isActive)
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((sub) => (
                    <li key={sub.id}>
                      <Link
                        to={subCategoryPath(sub)}
                        onClick={closeMobile}
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[#FDFAF4] transition-colors text-[#1A1208]"
                        style={{ ...sans, fontSize: "0.82rem" }}
                      >
                        <span className="min-w-0">
                          <span className="block truncate">{sub.name}</span>
                          {sub.description && (
                            <span className="block text-[#9E8A6A] truncate" style={{ fontSize: "0.68rem" }}>
                              {sub.description}
                            </span>
                          )}
                        </span>
                        <ChevronRight size={14} className="text-[#C9A84C] shrink-0" />
                      </Link>
                    </li>
                  ))}
              </ul>

              <div className="px-5 py-4">
                <Link
                  to={categoryPath(mobileCategory)}
                  onClick={closeMobile}
                  className="block border border-[#C9A84C] text-[#9A7A2E] text-center rounded-full py-3 text-[0.68rem] tracking-[0.16em] uppercase font-semibold hover:bg-[#C9A84C] hover:text-white transition-all capitalize"
                  style={sans}
                >
                  View all {mobileCategory.name}
                </Link>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* SPACER — keeps page content below the fixed nav */}
      <div style={{ height: TOP_BAR_H }} className="md:hidden" />
      <div style={{ height: TOP_BAR_H + CAT_BAR_H }} className="hidden md:block" />
    </>
  );
};

export default Navbar;
