import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  LogIn,
  LogOut,
  MapPin,
  Handshake,
  Menu,
  User,
  X,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import MegaMenu from "./MegaMenu";
import NavSearch from "./NavSearch";
import PincodeField from "./PincodeField";
import AccountMenu from "./AccountMenu";
import { accountMenuItems, helpMenuItems } from "./accountMenuItems";
import CategoryIcon from "./CategoryIcon";
import { categoryPath, subCategoryPath, type NavCategory } from "./navTypes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCategories } from "@/features/header/store/actions";
import { getLocations, setSelectedLocation, setVenuePincode } from "@/features/home/store/actions";
import { CUSTOMER_CONFIG } from "@/config/constants";
import { openLoginModal, openLogoutConfirm } from "@/features/auth/store/authSlice";

/* ────────────────────────────────────────────────────────────────
   Colours come from the app palette in src/styles/theme.scss
   (text-ink, text-gold, text-taupe, bg-ivory, border-sand, bg-coral, …)
──────────────────────────────────────────────────────────────── */

const sans = { fontFamily: "'Jost', sans-serif" } as const;
const serif = { fontFamily: "'Cormorant Garamond', serif" } as const;

const TOP_BAR_H = 72;
const CAT_BAR_H = 48;
/** Above this scroll position the category bar always shows. */
const CAT_BAR_PIN_Y = 160;
/** Ignore scroll jitter smaller than this before hiding / showing the bar. */
const SCROLL_DELTA = 6;
const catPillClass = (active: boolean) =>
  `relative flex items-center gap-1.5 h-[30px] pl-2.5 pr-3 rounded-full whitespace-nowrap text-[0.8rem] font-medium capitalize transition-colors shrink-0 ${
    active ? "bg-ivory text-ink" : "text-taupe hover:bg-ivory hover:text-ink"
  }`;

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
  // Category row scrolls sideways (hidden scrollbar); arrows appear at whichever edge has more.
  const catBarRef = useRef<HTMLDivElement>(null);
  const [catScroll, setCatScroll] = useState({ left: false, right: false });
  // Desktop: the category bar tucks away while scrolling down and returns on any scroll up.
  const [catHidden, setCatHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<number | null>(null);
  const [guestOpen, setGuestOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const guestRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();


  const apiCategories = useAppSelector((state) => state.header?.categories ?? []) as NavCategory[];
  const locations = useAppSelector((state) => state.home?.locations ?? []) as Location[];
  // Empty until the guest picks a city or the location list loads (no hard-coded default).
  const selectedLocation = useAppSelector((state) => state.home?.selectedLocation ?? "");
  const venuePincode = useAppSelector((state) => state.home?.venuePincode ?? null);
  
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated);
  const user = useAppSelector((state) => state.auth?.user);

  // Both actions skip duplicate requests; categories wait for the city and follow it.
  useEffect(() => {
    dispatch(getLocations());
    dispatch(getCategories());
  }, [dispatch, locations.length, selectedLocation]);

  const categories: NavCategory[] = apiCategories
    .filter((cat) => cat.isActive !== false)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const activeCategory = categories.find((c) => c.id === activeMenu) ?? null;

  // The category the current page belongs to (its own page or one of its sub-categories), kept lit in the bar.
  const subCategoryMatch = pathname.match(/^\/subcategory\/(\d+)/);
  const currentCategoryId =
    categories.find((c) =>
      subCategoryMatch
        ? c.subCategories?.some((sub) => String(sub.id) === subCategoryMatch[1])
        : decodeURIComponent(pathname) === categoryPath(c),
    )?.id ?? null;
  const activeLocations = locations.filter((loc) => loc.isActive !== false);

  // Choosing another city by hand drops a pincode from a different city, so experience pages never
  // check a venue that is not in the city being browsed.
  const chooseCity = (c: Location) => {
    if (venuePincode?.locationId != null && c.id != null && c.id !== venuePincode.locationId) dispatch(setVenuePincode(null));
    dispatch(setSelectedLocation(c.name));
  };

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

  // Sticky things below the navbar (experience page tabs and booking panel, cart summary, help card)
  // sit at var(--nav-h-desktop), so they follow the category bar as it hides and returns.
  const catCollapsed = catHidden && activeMenu === null;
  useEffect(() => {
    document.documentElement.style.setProperty("--nav-h-desktop", `${catCollapsed ? TOP_BAR_H : TOP_BAR_H + CAT_BAR_H}px`);
  }, [catCollapsed]);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const dy = y - lastY;
        if (y < CAT_BAR_PIN_Y) {
          setCatHidden(false);
          lastY = y;
        } else if (Math.abs(dy) > SCROLL_DELTA) {
          setCatHidden(dy > 0);
          lastY = y;
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    setActiveMobileCategory(null);
  };

  /* Show the scroll arrows only when the category row overflows on that side. */
  const categoryKey = categories.map((c) => c.name).join("|");
  const updateCatScroll = useCallback(() => {
    const bar = catBarRef.current;
    if (!bar) return;
    const left = bar.scrollLeft > 2;
    const right = bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 2;
    setCatScroll((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, []);
  useLayoutEffect(() => {
    const bar = catBarRef.current;
    if (!bar) return;
    updateCatScroll();
    const observer = new ResizeObserver(updateCatScroll);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [categoryKey, updateCatScroll]);

  const scrollCategories = (direction: 1 | -1) =>
    catBarRef.current?.scrollBy({ left: direction * Math.max(200, catBarRef.current.clientWidth * 0.6), behavior: "smooth" });

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
          {/* Same edge padding as the category bar. From md up: a 3-column grid (side | search | side).
              The sides share the leftover width equally, so the search is centred when there is room,
              but never get narrower than their contents: on tighter screens the search shrinks
              (down to 220px) instead of the city button sliding under it. */}
          <div
            className="w-full px-4 lg:px-5 flex items-center gap-4 lg:gap-6 md:grid md:grid-cols-[1fr_minmax(220px,520px)_1fr]"
            style={{ height: TOP_BAR_H }}
          >
            {/* LEFT: logo + city */}
            {/* md:w-max: the grid sizes this column from the group's width, and the city label's ellipsis
                would otherwise let the browser think it can squeeze (it then slid under the search). */}
            <div className="flex items-center gap-4 lg:gap-6 shrink-0 md:w-max">
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={closeAll}>
              <img
                src={CUSTOMER_CONFIG.logo}
                alt={CUSTOMER_CONFIG.name}
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
              />
              {/* nowrap: the header grid sizes this column from its contents, so the name must not wrap */}
              <span className="hidden sm:flex flex-col leading-none whitespace-nowrap">
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
                    className="text-ink capitalize mt-[3px] max-w-[170px] truncate"
                    style={{ ...sans, fontSize: "0.78rem", fontWeight: 500 }}
                  >
                    {selectedLocation || "Select city"}
                    {venuePincode && <span className="text-gold-dark"> · {venuePincode.pincode}</span>}
                  </span>
                </span>
                <ChevronDown
                  size={13}
                  className={`text-umber transition-transform ${cityOpen ? "rotate-180" : ""}`}
                />
              </button>

              {cityOpen && (
                <div
                  className="absolute top-[calc(100%+10px)] left-0 w-[280px] bg-white rounded-2xl border border-sand z-20 overflow-hidden py-1.5"
                  style={{ boxShadow: "0 16px 40px color-mix(in srgb, var(--ink) 14%, transparent)" }}
                >
                  {/* Venue pincode: set once, checked automatically on every experience */}
                  <div className="px-4 pt-2.5 pb-2 border-b border-sand">
                    <p
                      className="pb-1.5 uppercase text-umber"
                      style={{ ...sans, fontSize: "0.55rem", letterSpacing: "0.2em" }}
                    >
                      Where's the party?
                    </p>
                    <PincodeField locations={activeLocations} onSaved={() => setCityOpen(false)} />
                  </div>

                  <div role="listbox" aria-label="Choose your city">
                  <p
                    className="px-4 pt-2.5 pb-1.5 uppercase text-umber"
                    style={{ ...sans, fontSize: "0.55rem", letterSpacing: "0.2em" }}
                  >
                    Or choose your city
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
                          chooseCity(c);
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
                </div>
              )}
            </div>

            </div>

            {/* SEARCH (desktop) */}
            <div className="hidden md:flex min-w-0 justify-center">
              <NavSearch variant="desktop" categories={categories} onFocus={() => setActiveMenu(null)} onNavigate={closeAll} />
            </div>

            {/* RIGHT ACTIONS (desktop) */}
            <div className="hidden md:flex justify-end items-center gap-2 lg:gap-3">
              {/* Vendors: a labelled button on laptops, an icon where the bar is tight (tablets). */}
              <Link
                to="/partner"
                className="hidden lg:inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gold/60 px-3.5 py-2 text-gold-dark transition-colors hover:border-gold hover:bg-gold hover:text-white"
                style={{ ...sans, fontSize: "0.68rem", letterSpacing: "0.12em", fontWeight: 600 }}
              >
                <Handshake size={14} strokeWidth={1.8} />
                <span className="uppercase whitespace-nowrap">Join as partner</span>
              </Link>
              <span className="lg:hidden">
                <IconAction icon={Handshake} label="Partner" to="/partner" />
              </span>
              <IconAction icon={CircleHelp} label="Help" to="/faqs" />

              <div className="relative" ref={guestRef}>
                <IconAction
                  icon={User}
                  label="Account"
                  active={guestOpen}
                  avatarUrl={isAuthenticated ? user?.profilePictureUrl : undefined}
                  onClick={() => setGuestOpen((v) => !v)}
                />

                <AnimatePresence>
                  {guestOpen && (
                    <AccountMenu
                      isAuthenticated={!!isAuthenticated}
                      user={user ?? null}
                      onClose={() => setGuestOpen(false)}
                      onLogin={() => dispatch(openLoginModal())}
                      onLogout={() => dispatch(openLogoutConfirm())}
                    />
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* MOBILE RIGHT */}
            <div className="flex md:hidden flex-1 items-center justify-end gap-2">
              <NavSearch variant="mobile" categories={categories} onNavigate={closeAll} />
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
        {/* Collapses (grid rows 1fr → 0fr) while scrolling down; never while a menu is open or it has focus. */}
        <div
          className={`hidden md:grid bg-white border-b transition-[grid-template-rows,border-color] duration-300 ease-out motion-reduce:transition-none ${
            catCollapsed ? "grid-rows-[0fr] border-transparent" : "grid-rows-[1fr] border-sand"
          }`}
          onFocusCapture={() => setCatHidden(false)}
        >
          <div className="min-h-0 overflow-hidden">
          <div className="relative w-full px-4 lg:px-5 flex items-center" style={{ height: CAT_BAR_H }}>
            <div
              ref={catBarRef}
              role="menubar"
              aria-label="Categories"
              onScroll={updateCatScroll}
              className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-hide"
              style={sans}
            >
              {categories.length === 0 &&
                Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="h-[30px] w-[96px] rounded-full bg-ivory animate-pulse shrink-0" />
                ))}

              {categories.map((cat) => {
                const isActive = activeMenu === cat.id;
                const isCurrent = currentCategoryId === cat.id;
                const lit = isActive || isCurrent;
                const hasSubs = cat.subCategories?.some((s) => s.isActive !== false);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="menuitem"
                    aria-current={isCurrent ? "page" : undefined}
                    aria-haspopup={hasSubs ? "true" : undefined}
                    aria-expanded={hasSubs ? isActive : undefined}
                    onMouseEnter={() => scheduleOpen(cat)}
                    onFocus={() => scheduleOpen(cat)}
                    onClick={() => {
                      closeAll();
                      navigate(categoryPath(cat));
                    }}
                    className={catPillClass(lit)}
                  >
                    <CategoryIcon
                      name={cat.name}
                      size={14}
                      strokeWidth={1.75}
                      className={`transition-colors ${lit ? "text-gold-dark" : "text-gold"}`}
                    />
                    {cat.name}
                    {hasSubs && (
                      <ChevronDown
                        size={12}
                        className={`-ml-0.5 text-umber transition-transform ${isActive ? "rotate-180" : ""}`}
                      />
                    )}
                    {/* gold indicator under the hovered pill and the current page's category */}
                    <span
                      className={`absolute left-3 right-3 -bottom-[9px] h-[2px] rounded-full bg-gold transition-opacity ${
                        lit ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Edge arrows: only on the side that has more categories to show */}
            {catScroll.left && (
              <button
                type="button"
                aria-label="Scroll categories left"
                onClick={() => scrollCategories(-1)}
                className="absolute left-0 inset-y-0 flex items-center pl-2 pr-6 bg-gradient-to-r from-white via-white to-transparent text-taupe hover:text-ink"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-sand bg-white shadow-sm">
                  <ChevronLeft size={14} />
                </span>
              </button>
            )}
            {catScroll.right && (
              <button
                type="button"
                aria-label="Scroll categories right"
                onClick={() => scrollCategories(1)}
                className="absolute right-0 inset-y-0 flex items-center pr-2 pl-6 bg-gradient-to-l from-white via-white to-transparent text-taupe hover:text-ink"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-sand bg-white shadow-sm">
                  <ChevronRight size={14} />
                </span>
              </button>
            )}
          </div>
          </div>
        </div>

        {/* ═══════════════════ MEGA MENU ═══════════════════ */}
        {activeCategory && (
          <div className="hidden md:block">
            <MegaMenu category={activeCategory} index={categories.indexOf(activeCategory)} onNavigate={closeAll} />
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
        // Off-screen while closed: keep its links out of the tab order too.
        inert={!mobileOpen}
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
            onChange={(e) => {
              const city = activeLocations.find((c) => c.name === e.target.value);
              if (city) chooseCity(city);
            }}
            className="ml-auto bg-transparent text-ink capitalize outline-none"
            style={{ ...sans, fontSize: "0.8rem", fontWeight: 500 }}
          >
            {!selectedLocation && (
              <option value="" disabled>
                Select city
              </option>
            )}
            {activeLocations.map((c) => (
              <option key={c.id ?? c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Venue pincode (mobile): set once, checked automatically on every experience */}
        <div className="px-5 pt-3 pb-2 border-b border-sand bg-ivory">
          <p className="pb-1.5 uppercase text-umber" style={{ ...sans, fontSize: "0.55rem", letterSpacing: "0.18em" }}>
            Where's the party?
          </p>
          <PincodeField locations={activeLocations} />
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
              {!isAuthenticated && (
                <div className="px-5 pb-3">
                  <button
                    type="button"
                    onClick={() => {
                      closeMobile();
                      dispatch(openLoginModal());
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gold py-3 text-gold-dark transition-colors hover:bg-gold hover:text-white"
                    style={{ ...sans, fontSize: "0.72rem", letterSpacing: "0.14em", fontWeight: 600 }}
                  >
                    <LogIn size={15} />
                    <span className="uppercase">Log in or sign up</span>
                  </button>
                </div>
              )}
              <ul className="mb-4">
                {[...accountMenuItems, ...helpMenuItems].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      onClick={(e) => {
                        closeMobile();
                        // Guests sign in first for account pages
                        if (item.requiresAuth && !isAuthenticated) {
                          e.preventDefault();
                          dispatch(openLoginModal());
                        }
                      }}
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
                        dispatch(openLogoutConfirm());
                      }}
                      className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-rose-light transition-colors text-burgundy"
                      style={{ ...sans, fontSize: "0.8rem" }}
                    >
                      <LogOut size={15} />
                      Log out
                    </button>
                  </li>
                )}
              </ul>

              <div className="grid gap-2.5 px-5 pb-6">
                <Link
                  to="/partner"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 rounded-full border border-gold py-3 text-gold-dark transition-colors hover:bg-gold hover:text-white"
                  style={{ ...sans, fontSize: "0.72rem", letterSpacing: "0.14em", fontWeight: 600 }}
                >
                  <Handshake size={15} />
                  <span className="uppercase">Join as partner</span>
                </Link>
                <Link
                  to="/categories"
                  onClick={closeMobile}
                  className="block bg-ink text-white text-center rounded-full py-3.5 text-xs tracking-[0.16em] uppercase font-semibold hover:bg-gold transition-all"
                  style={sans}
                >
                  Explore celebrations
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
