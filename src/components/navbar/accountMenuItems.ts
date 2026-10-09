import { CircleHelp, MessageSquare, Package, Phone, User } from "lucide-react";

/** Links in the navbar account dropdown and the mobile drawer. */
export interface AccountMenuItem {
  icon: typeof User;
  label: string;
  hint?: string;
  to: string;
  /** Needs a signed-in user; guests get the login popup instead. */
  requiresAuth?: boolean;
}

export const accountMenuItems: AccountMenuItem[] = [
  { icon: Package, label: "My Bookings", hint: "Upcoming and past celebrations", to: "/dashboard", requiresAuth: true },
  { icon: User, label: "My Profile", hint: "Your details and preferences", to: "/profile", requiresAuth: true },
  { icon: MessageSquare, label: "My Queries", hint: "Support requests and replies", to: "/support", requiresAuth: true },
];

export const helpMenuItems: AccountMenuItem[] = [
  { icon: Phone, label: "Contact Us", to: "/contact" },
  { icon: CircleHelp, label: "FAQs", to: "/faqs" },
];
