import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, LogOut } from "lucide-react";
import type { User as AuthUser } from "@/features/auth/store/authSlice";
import { accountMenuItems, helpMenuItems, type AccountMenuItem } from "./accountMenuItems";

/* Colours come from the app palette in src/styles/theme.scss */

const sans = { fontFamily: "'Jost', sans-serif" } as const;
const serif = { fontFamily: "'Cormorant Garamond', serif" } as const;

const initialsOf = (name?: string, email?: string) => {
  const source = (name || "").trim() || (email || "").split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "FM";
};

interface AccountMenuProps {
  isAuthenticated: boolean;
  user: AuthUser | null;
  onClose: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

/** Desktop dropdown under the navbar's Account icon. */
export default function AccountMenu({ isAuthenticated, user, onClose, onLogin, onLogout }: AccountMenuProps) {
  const { pathname } = useLocation();
  const firstName = user?.name?.trim().split(" ")[0];

  const renderItem = (item: AccountMenuItem) => {
    const isActive = pathname === item.to;
    const gated = item.requiresAuth && !isAuthenticated;
    return (
      <Link
        key={item.label}
        to={item.to}
        role="menuitem"
        aria-current={isActive ? "page" : undefined}
        onClick={(e) => {
          if (gated) {
            // Guests sign in first; the page would only bounce them anyway.
            e.preventDefault();
            onLogin();
          }
          onClose();
        }}
        className={`group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors ${
          isActive ? "bg-linen" : "hover:bg-ivory"
        }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isActive ? "bg-gold text-white" : "bg-linen text-gold-dark group-hover:bg-gold-pale"
          }`}
        >
          <item.icon size={15} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.82rem] font-medium leading-tight text-ink" style={sans}>
            {item.label}
          </span>
          {item.hint && (
            <span className="block truncate text-[0.68rem] leading-snug text-umber" style={sans}>
              {item.hint}
            </span>
          )}
        </span>
        <ChevronRight
          size={14}
          className="shrink-0 text-umber opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </Link>
    );
  };

  return (
    <motion.div
      role="menu"
      aria-label="Account"
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      style={{ transformOrigin: "top right", boxShadow: "0 20px 50px -12px color-mix(in srgb, var(--ink) 25%, transparent)" }}
      className="absolute right-0 top-[calc(100%+14px)] z-[200] w-[300px] rounded-2xl border border-sand bg-white"
    >
      {/* Caret */}
      <span className="absolute -top-[7px] right-6 h-3 w-3 rotate-45 border-l border-t border-sand bg-white" aria-hidden="true" />

      {/* Header */}
      {isAuthenticated ? (
        <div className="flex items-center gap-3 border-b border-sand px-4 pb-4 pt-5">
          {user?.profilePictureUrl ? (
            <img src={user.profilePictureUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-gold-light" />
          ) : (
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark text-[0.85rem] font-semibold tracking-wide text-white"
              style={sans}
              aria-hidden="true"
            >
              {initialsOf(user?.name, user?.email)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[1.15rem] font-semibold leading-tight text-ink" style={serif}>
              {firstName ? `Hi, ${firstName}` : "Welcome back"}
            </p>
            {user?.email && (
              <p className="truncate text-[0.72rem] text-umber" style={sans}>
                {user.email}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="border-b border-sand px-4 pb-4 pt-5">
          <p className="text-[1.25rem] font-semibold leading-tight text-ink" style={serif}>
            Welcome to Forever Moment
          </p>
          <p className="mt-1 text-[0.74rem] leading-relaxed text-cocoa" style={sans}>
            Log in to track bookings, save favourites and book faster.
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onLogin();
            }}
            className="mt-3.5 w-full rounded-full bg-ink py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-ink-soft"
            style={sans}
          >
            Log in or sign up
          </button>
        </div>
      )}

      {/* Account */}
      <div className="px-2 pb-1 pt-2.5">
        <p className="px-2.5 pb-1 text-[0.58rem] uppercase tracking-[0.2em] text-umber" style={sans}>
          Your account
        </p>
        {accountMenuItems.map(renderItem)}
      </div>

      {/* Help */}
      <div className="mx-4 border-t border-sand" />
      <div className="px-2 pb-2 pt-2.5">
        <p className="px-2.5 pb-1 text-[0.58rem] uppercase tracking-[0.2em] text-umber" style={sans}>
          Help
        </p>
        {helpMenuItems.map(renderItem)}
      </div>

      {isAuthenticated && (
        <div className="border-t border-sand p-2">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-burgundy transition-colors hover:bg-rose-light"
            style={sans}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-light">
              <LogOut size={15} strokeWidth={1.8} />
            </span>
            <span className="text-[0.82rem] font-medium">Log out</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
