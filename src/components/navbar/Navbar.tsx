import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
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
import { openLoginModal, logoutUser } from "@/features/auth/store/authSlice";

/* ────────────────────────────────────────────────────────────────
   Colours come from the app palette in src/styles/theme.scss
   (text-ink, text-gold, text-taupe, bg-ivory, border-sand, bg-coral, …)
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
  { icon: MessageSquare, label: "My Queries", to: "/support" },
  { icon: CircleHelp, label: "FAQs", to: "/faqs" },
];

interface Location {
  id?: number;
  name: string;
  isActive: boolean;
}

const IconAction = ({
  icon: Icon,
  label,
  to,
  onClick,
  badge,
  active,
  avatarUrl,
}: {
  icon: typeof User;
  label: string;
  to?: string;
  onClick?: () => void;
  badge?: number;
  active?: boolean;
  avatarUrl?: string;
}) => {
  const cls = `group flex flex-col items-center gap-1 min-w-[48px] transition-colors ${
    active ? "text-gold" : "text-taupe hover:text-gold"
  }`;
  const inner = (
    <>
      <span className="relative">
        {avatarUrl ? (
          <img src={avatarUrl} alt={label} className="w-[19px] h-[19px] rounded-full object-cover" />
        ) : (
          <Icon size={19} strokeWidth={1.6} />
        )}
        {badge ? (
          <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-coral text-white text-[9px] rounded-full flex items-center justify-center font-bold">
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
  
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const user = useAppSelector((state) => state.auth?.user);

  useEffect(() => {
    if (locations.length === 0) {
      dispatch(getLocations());
    } else {
      dispatch(getCategories());
    }
  }, [dispatch, locations.length, selectedLocation]);

  const categories: NavCategory[] = apiCategories
    .filter((cat) => cat.isActive !== false)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const activeCategory = categories.find((c) => c.id === activeMenu) ?? null;
  const activeLocations = locations.filter((loc) => loc.isActive !== false);

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
    const hasSubs = cat.subCategories?.some((s) => s.isActive !== false);
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
        style={{ boxShadow: "0 2px 20px color-mix(in srgb, var(--ink) 8%, transparent)" }}
        onMouseEnter={clearTimers}
        onMouseLeave={scheduleClose}
      >
        {/* ═══════════════════ TOP BAR ═══════════════════ */}
        <div className="border-b border-sand">
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
                  className="text-ink"
                  style={{ ...serif, fontSize: "1.3rem", fontWeight: 600, letterSpacing: "0.01em" }}
                >
                  {CUSTOMER_CONFIG.name}
                </span>
                <span
                  className="uppercase text-umber mt-1"
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
                    ? "border-gold bg-ivory"
                    : "border-sand hover:border-gold hover:bg-ivory"
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-ivory border border-sand flex items-center justify-center text-gold">
                  <MapPin size={13} strokeWidth={1.75} />
                </span>
                <span className="flex flex-col items-start leading-none">
                  <span
                    className="uppercase text-umber"
                    style={{ ...sans, fontSize: "0.52rem", letterSpacing: "0.16em" }}
                  >
                    Celebrating in
                  </span>
                  <span
                    className="text-ink capitalize mt-[3px] max-w-[120px] truncate"
                    style={{ ...sans, fontSize: "0.78rem", fontWeight: 500 }}
                  >
                    {selectedLocation}
                  </span>
                </span>
                <ChevronDown
                  size={13}
                  className={`text-umber transition-transform ${cityOpen ? "rotate-180" : ""}`}
                />
              </button>

              {cityOpen && (
                <div
                  role="listbox"
                  className="absolute top-[calc(100%+10px)] left-0 w-[200px] bg-white rounded-2xl border border-sand z-20 overflow-hidden py-1.5"
                  style={{ boxShadow: "0 16px 40px color-mix(in srgb, var(--ink) 14%, transparent)" }}
                >
                  <p
                    className="px-4 pt-2 pb-1.5 uppercase text-umber"
                    style={{ ...sans, fontSize: "0.55rem", letterSpacing: "0.2em" }}
                  >
                    Choose your city
                  </p>
                  {activeLocations.length === 0 && (
                    <p className="px-4 py-2 text-umber" style={{ ...sans, fontSize: "0.75rem" }}>
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
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left capitalize transition-colors hover:bg-ivory ${
                          selected ? "text-gold-dark font-medium" : "text-taupe"
                        }`}
                        style={{ ...sans, fontSize: "0.8rem" }}
                      >
                        {c.name}
                        {selected && <Check size={14} className="text-gold" />}
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
                className="w-full max-w-[520px] flex items-center bg-ivory border border-sand rounded-full pl-4 pr-1.5 h-[42px] gap-3 hover:border-gold transition-colors focus-within:border-gold focus-within:bg-white focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,_var(--gold)_12%,_transparent)]"
              >
                <Search size={16} className="text-gold shrink-0" strokeWidth={1.75} />
                <input
                  type="search"
                  aria-label="Search"
                  placeholder="Search events, cakes, gifts, vendors…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                  onFocus={() => setActiveMenu(null)}
                  className="flex-1 min-w-0 bg-transparent outline-none placeholder-umber text-ink [&::-webkit-search-cancel-button]:hidden"
                  style={{ ...sans, fontSize: "0.82rem" }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-umber hover:text-ink hover:bg-sand/60 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Submit search"
                  onClick={submitSearch}
                  className="h-[32px] px-4 rounded-full bg-ink text-white uppercase tracking-[0.12em] hover:bg-gold transition-colors shrink-0"
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
                  avatarUrl={isAuthenticated ? user?.profilePictureUrl : undefined}
                  onClick={() => setGuestOpen((v) => !v)}
                />

                {guestOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+14px)] w-[232px] bg-white rounded-2xl border border-sand z-[200] overflow-hidden"
                    style={{ boxShadow: "0 16px 48px color-mix(in srgb, var(--ink) 14%, transparent)" }}
                  >
                    <div className="absolute -top-1.5 right-5 w-3 h-3 bg-ink rotate-45" />
                    <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-ink to-ink-soft">
                      <p style={{ ...serif, fontSize: "1.15rem", color: "var(--gold)", fontWeight: 600 }}>
                        {isAuthenticated ? `Welcome, ${user?.name?.split(' ')[0] || 'User'}` : "Welcome"}
                      </p>
                      <p
                        className="uppercase mt-1"
                        style={{ ...sans, fontSize: "0.58rem", color: "rgba(255,255,255,0.55)", letterSpacing: "0.14em" }}
                      >
                        {isAuthenticated ? "Manage your account" : "Login to access your account"}
                      </p>
                    </div>
                    {!isAuthenticated ? (
                      <div className="px-4 py-4 flex gap-2 border-b border-sand">
                        <button
                          onClick={() => {
                            setGuestOpen(false);
                            dispatch(openLoginModal());
                          }}
                          style={sans}
                          className="flex-1 text-center py-2.5 rounded-full border border-gold text-gold-dark text-[0.62rem] tracking-[0.14em] uppercase font-semibold hover:bg-gold hover:text-white transition-all"
                        >
                          Login
                        </button>
                        <Link
                          to="/register"
                          onClick={() => setGuestOpen(false)}
                          style={sans}
                          className="flex-1 text-center py-2.5 rounded-full bg-gold text-white text-[0.62rem] tracking-[0.14em] uppercase font-semibold hover:bg-ink transition-all"
                        >
                          Register
                        </Link>
                      </div>
                    ) : (
                      <div className="px-4 py-4 flex flex-col gap-2 border-b border-sand">
                        <button
                          onClick={() => {
                            setGuestOpen(false);
                            dispatch(logoutUser() as any);
                          }}
                          style={sans}
                          className="w-full text-center py-2.5 rounded-full border border-sand text-umber text-[0.62rem] tracking-[0.14em] uppercase font-semibold hover:bg-ivory transition-all"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                    <div className="py-2">
                      {guestMenuItems.slice(2).map((item) => (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setGuestOpen(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-taupe hover:bg-ivory hover:text-gold-dark transition-colors"
                          style={{ ...sans, fontSize: "0.78rem" }}
                        >
                          <item.icon size={14} className="text-gold" />
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
              <div className="flex flex-1 max-w-[220px] items-center bg-ivory border border-sand rounded-full px-3 h-[36px] gap-2 focus-within:border-gold">
                <Search size={14} className="text-gold shrink-0" />
                <input
                  type="search"
                  aria-label="Search"
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                  className="w-full min-w-0 bg-transparent outline-none placeholder-umber text-ink [&::-webkit-search-cancel-button]:hidden"
                  style={{ ...sans, fontSize: "0.75rem" }}
                />
              </div>
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => (mobileOpen ? closeMobile() : setMobileOpen(true))}
                className="w-9 h-9 rounded-full flex items-center justify-center text-ink hover:bg-ivory shrink-0"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════ CATEGORY BAR ═══════════════════ */}
        <div className="hidden md:block bg-white border-b border-sand">
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
                  className="h-[30px] w-[110px] rounded-full bg-ivory border border-sand animate-pulse shrink-0"
                />
              ))}

            {categories.map((cat) => {
              const isActive = activeMenu === cat.id;
              const hasSubs = cat.subCategories?.some((s) => s.isActive !== false);
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
                      ? "bg-ivory border-sand text-ink"
                      : "border-transparent text-taupe hover:bg-ivory hover:text-ink"
                  }`}
                >
                  <CategoryIcon
                    name={cat.name}
                    size={15}
                    strokeWidth={1.75}
                    className={`transition-colors ${isActive ? "text-gold-dark" : "text-gold"}`}
                  />
                  {cat.name}
                  {hasSubs && (
                    <ChevronDown
                      size={12}
                      className={`text-umber transition-transform ${isActive ? "rotate-180" : ""}`}
                    />
                  )}
                  {/* gold indicator under the active pill */}
                  <span
                    className={`absolute left-4 right-4 -bottom-[9px] h-[2px] rounded-full bg-gold transition-opacity ${
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
          className="hidden md:block fixed inset-0 z-[90] bg-ink/25 backdrop-blur-[1.5px] transition-opacity"
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
        style={{ boxShadow: "4px 0 30px color-mix(in srgb, var(--ink) 15%, transparent)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-[64px] shrink-0 bg-gradient-to-r from-ink to-ink-soft">
          <div className="flex items-center gap-2.5">
            <img src={CUSTOMER_CONFIG.logo} alt="" className="w-8 h-8 object-contain rounded-full bg-white/90 p-0.5" />
            <span style={{ ...serif, fontSize: "1.1rem", color: "var(--gold)", fontWeight: 600 }}>
              {CUSTOMER_CONFIG.name}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobile}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-white/20 text-white hover:border-gold hover:text-gold transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* City row (mobile) */}
        <div className="px-5 py-3 border-b border-sand bg-ivory flex items-center gap-2">
          <MapPin size={14} className="text-gold" />
          <span className="uppercase text-umber" style={{ ...sans, fontSize: "0.55rem", letterSpacing: "0.18em" }}>
            Celebrating in
          </span>
          <select
            aria-label="Choose your city"
            value={selectedLocation}
            onChange={(e) => dispatch(setSelectedLocation(e.target.value))}
            className="ml-auto bg-transparent text-ink capitalize outline-none"
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
                className="px-5 pt-4 pb-2 uppercase text-umber"
                style={{ ...sans, fontSize: "0.6rem", letterSpacing: "0.2em" }}
              >
                Categories
              </p>

              <ul className="px-3 pb-3">
                {categories.map((cat) => {
                  const hasSubs = cat.subCategories?.some((s) => s.isActive !== false);
                  return (
                    <li key={cat.id}>
                      {hasSubs ? (
                        <button
                          type="button"
                          onClick={() => setActiveMobileCategory(cat.id)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-ink hover:bg-ivory transition-colors"
                          style={{ ...sans, fontSize: "0.85rem", fontWeight: 500 }}
                        >
                          <span className="w-9 h-9 rounded-[10px] bg-ivory border border-sand flex items-center justify-center text-gold shrink-0">
                            <CategoryIcon name={cat.name} size={16} strokeWidth={1.75} />
                          </span>
                          <span className="flex-1 capitalize truncate">{cat.name}</span>
                          <ChevronRight size={16} className="text-umber" />
                        </button>
                      ) : (
                        <Link
                          to={categoryPath(cat)}
                          onClick={closeMobile}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-ink hover:bg-ivory transition-colors"
                          style={{ ...sans, fontSize: "0.85rem", fontWeight: 500 }}
                        >
                          <span className="w-9 h-9 rounded-[10px] bg-ivory border border-sand flex items-center justify-center text-gold shrink-0">
                            <CategoryIcon name={cat.name} size={16} strokeWidth={1.75} />
                          </span>
                          <span className="flex-1 capitalize truncate">{cat.name}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mx-5 border-t border-sand" />

              <p
                className="px-5 pt-4 pb-2 uppercase text-umber"
                style={{ ...sans, fontSize: "0.6rem", letterSpacing: "0.2em" }}
              >
                Account
              </p>
              <ul className="mb-4">
                {!isAuthenticated && (
                  <>
                    <li>
                      <button
                        onClick={() => {
                          closeMobile();
                          dispatch(openLoginModal());
                        }}
                        className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-ivory hover:text-gold-dark transition-colors text-taupe"
                        style={{ ...sans, fontSize: "0.8rem" }}
                      >
                        <LogIn size={15} className="text-gold" />
                        Login
                      </button>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        onClick={closeMobile}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-ivory hover:text-gold-dark transition-colors text-taupe"
                        style={{ ...sans, fontSize: "0.8rem" }}
                      >
                        <UserPlus size={15} className="text-gold" />
                        Register
                      </Link>
                    </li>
                  </>
                )}
                {guestMenuItems.slice(2).map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-ivory hover:text-gold-dark transition-colors text-taupe"
                      style={{ ...sans, fontSize: "0.8rem" }}
                    >
                      <item.icon size={15} className="text-gold" />
                      {item.label}
                    </Link>
                  </li>
                ))}
                {isAuthenticated && (
                  <li>
                    <button
                      onClick={() => {
                        closeMobile();
                        dispatch(logoutUser() as any);
                      }}
                      className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-ivory hover:text-gold-dark transition-colors text-coral"
                      style={{ ...sans, fontSize: "0.8rem" }}
                    >
                      <LogOut size={15} className="text-coral" />
                      Logout
                    </button>
                  </li>
                )}
              </ul>

              <div className="px-5 pb-6">
                <Link
                  to="/services"
                  onClick={closeMobile}
                  className="block bg-ink text-white text-center rounded-full py-3.5 text-xs tracking-[0.16em] uppercase font-semibold hover:bg-gold transition-all"
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
                className="flex items-center gap-2 px-5 py-3.5 border-b border-sand w-full hover:bg-ivory transition-colors text-taupe"
                style={{ ...sans, fontSize: "0.78rem" }}
              >
                <ArrowLeft size={14} /> All categories
              </button>

              <div className="px-5 py-4 bg-ivory border-b border-sand flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg,var(--gold),var(--gold-dark))" }}>
                  <CategoryIcon name={mobileCategory.name} size={18} strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-ink capitalize leading-tight" style={{ ...serif, fontSize: "1.25rem", fontWeight: 600 }}>
                    {mobileCategory.name}
                  </p>
                  {mobileCategory.description && (
                    <p className="text-umber truncate" style={{ ...sans, fontSize: "0.7rem" }}>
                      {mobileCategory.description}
                    </p>
                  )}
                </div>
              </div>

              <ul className="py-2">
                {(mobileCategory.subCategories ?? [])
                  .filter((s) => s.isActive !== false)
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((sub) => (
                    <li key={sub.id}>
                      <Link
                        to={subCategoryPath(sub)}
                        onClick={closeMobile}
                        className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-ivory transition-colors text-ink"
                        style={{ ...sans, fontSize: "0.82rem" }}
                      >
                        <span className="min-w-0">
                          <span className="block truncate">{sub.name}</span>
                          {sub.description && (
                            <span className="block text-umber truncate" style={{ fontSize: "0.68rem" }}>
                              {sub.description}
                            </span>
                          )}
                        </span>
                        <ChevronRight size={14} className="text-gold shrink-0" />
                      </Link>
                    </li>
                  ))}
              </ul>

              <div className="px-5 py-4">
                <Link
                  to={categoryPath(mobileCategory)}
                  onClick={closeMobile}
                  className="block border border-gold text-gold-dark text-center rounded-full py-3 text-[0.68rem] tracking-[0.16em] uppercase font-semibold hover:bg-gold hover:text-white transition-all capitalize"
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
