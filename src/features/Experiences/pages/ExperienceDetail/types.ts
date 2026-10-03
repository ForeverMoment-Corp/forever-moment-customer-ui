export interface MediaItem {
  id: number;
  heroUrl: string;
  thumbnailUrl: string;
  originalUrl: string;
  alt: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ListItem {
  id: number;
  description: string;
  isIncluded: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface TimeSlot {
  id: number;
  label: string;
  sublabel?: string;
  startTime: string;
  endTime: string;
  maxCapacity: number | null;
  priceOverride: number | null;
  /** ISO dates (YYYY-MM-DD) the slot can be booked for; null means open-ended. */
  validFrom: string | null;
  validTo: string | null;
}

export interface LocationOption {
  id: number;
  name: string;
  priceOverride: number | null;
  validFrom: string | null;
  validTo: string | null;
  timeslots: TimeSlot[];
}

export interface AddOn {
  id: number;
  name: string;
  description?: string;
  /** What this add-on costs with this experience (priceOverride applied). */
  price: number;
  /** Catalogue price, shown struck through when the experience charges less. */
  basePrice: number;
  isFree: boolean;
  thumbnailUrl?: string;
  added: boolean;
}

export interface ExperienceVM {
  id: number;
  slug: string | null;
  name: string;
  tag: string;
  isFeatured: boolean;
  categoryName: string;
  categoryId: number | null;
  categorySlug: string;
  subCategoryId: number | null;
  subCategoryName: string;
  basePrice: number;
  originalPrice: number;
  discount: number;
  shortDescription: string;
  description: string;
  whatToBring: string;
  termsConditions: string;
  durationMinutes: number;
  maxCapacity: number;
  media: MediaItem[];
  inclusions: ListItem[];
  cancellationPolicies: ListItem[];
  faqs: FaqItem[];
  /** Union of every location's slots, sorted by start time. Use `locationOptions` for per-city availability. */
  timeslots: TimeSlot[];
  locations: string[];
  locationOptions: LocationOption[];
  rating: number;
  reviewCount: number;
}
