import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import Breadcrumbs from './Breadcrumbs';
import Gallery from './Gallery';
import BookingCard from './BookingCard';
import SectionNav from './SectionNav';
import type { SectionNavItem } from './SectionNav';
import Overview from './Overview';
import Inclusion from './Inclusion';
import HowItWorks from './HowItWorks';
import Reviews from './Reviews';
import CancellationPolicy from './CancellationPolicy';
import FAQ from './FAQ';
import { useFaqs } from '@/features/faq';
import RelatedExperiences from './RelatedExperiences';
import type { ExperienceSummary } from './RelatedExperiences';
import MoreAddOns from './MoreAddOns';
import MobileBookingBar from './MobileBookingBar';
import DetailSkeleton from './DetailSkeleton';
import GiftSlider from '@/features/slider/pages/Slider/components/GiftSlider';

import { normalizeExperience, FONT_SANS, FONT_SERIF } from '../normalize';
import type { AddonCatalogueItem, ExperienceAddon } from '@/features/experiences/store/types';
import type { AddOn, FaqItem } from '../types';
import { experiencePath, isNumericId } from '@/features/experiences/utils/slug';

export interface ExperienceViewProps {
  experience: unknown;
  loading: boolean;
  error: string | null;
  /** GET /public/experiences/subcategory/{id} result for the related section. */
  subCategoryExperiences: ExperienceSummary[];
  subCategoryKey: string | null;
  /** GET /public/experiences — fallback pool for the related section. */
  allExperiences: ExperienceSummary[];
  /** GET /public/experiences/{id}/addons, keyed by experience id. */
  experienceAddons: Record<string, ExperienceAddon[]>;
  addonsLoading: Record<string, boolean>;
  /** GET /public/addons — offered below the page, minus anything already attached. */
  addonCatalogue: AddonCatalogueItem[];
  getExperience: (slugOrId: string) => void;
  getSubCategoryExperiences: (subCategoryId: string | number) => void;
  getExperienceAddons: (experienceId: string | number) => void;
  getAddons: () => void;
  getData: () => void;
}

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const NAV_HEIGHT_DESKTOP = 118;
const STICKY_GAP = 16;

/**
 * Keeps the booking panel pinned while reading. If it is shorter than the viewport it
 * sticks below the navbar; if taller, it sticks by its bottom edge so "Book now" stays reachable.
 */
function useStickyTop(ref: React.RefObject<HTMLElement | null>, deps: unknown[]) {
  const [top, setTop] = useState(NAV_HEIGHT_DESKTOP + STICKY_GAP);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const fits = el.offsetHeight + NAV_HEIGHT_DESKTOP + STICKY_GAP * 2 <= window.innerHeight;
      setTop(fits ? NAV_HEIGHT_DESKTOP + STICKY_GAP : window.innerHeight - el.offsetHeight - STICKY_GAP);
    };
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return top;
}

export default function ExperienceDetails({
  experience,
  loading,
  error,
  subCategoryExperiences,
  subCategoryKey,
  allExperiences,
  experienceAddons,
  addonsLoading,
  addonCatalogue,
  getExperience,
  getSubCategoryExperiences,
  getExperienceAddons,
  getAddons,
  getData,
}: ExperienceViewProps) {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const asideRef = useRef<HTMLElement>(null);

  const vm = useMemo(() => (experience ? normalizeExperience(experience) : null), [experience]);
  const matchesParam = (v: { id: number; slug: string | null } | null) =>
    !!v && !!slugOrId && (String(v.id) === slugOrId || v.slug === slugOrId);
  const isCurrent = matchesParam(vm);

  // Numeric params resolve through /public/experiences/{id}, anything else through /slug/{slug}.
  useEffect(() => {
    if (!slugOrId) return;
    // After the id -> slug redirect the record is already loaded; skip the duplicate request.
    if (!matchesParam(vm)) getExperience(slugOrId);
    setSelectedAddons([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugOrId, getExperience]);

  // Loaded by numeric id but the record has a slug: swap the URL for the canonical slug one.
  useEffect(() => {
    if (isCurrent && vm?.slug && slugOrId && isNumericId(slugOrId)) {
      navigate(experiencePath({ id: vm.id, slug: vm.slug }), { replace: true });
    }
  }, [isCurrent, vm?.id, vm?.slug, slugOrId, navigate]);

  // Related section: same sub-category from the API, whole catalogue as fallback.
  useEffect(() => {
    if (!isCurrent) return;
    if (vm?.subCategoryId != null && String(vm.subCategoryId) !== subCategoryKey) getSubCategoryExperiences(vm.subCategoryId);
    if (allExperiences.length === 0) getData();
    // Add-ons are attached per experience, so fetch them once the record is known.
    const key = vm ? String(vm.id) : null;
    if (key && experienceAddons[key] === undefined && !addonsLoading[key]) getExperienceAddons(key);
    if (addonCatalogue.length === 0) getAddons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrent, vm?.subCategoryId]);

  // The booking panel works from the API list plus whatever the guest has ticked.
  const addonKey = vm ? String(vm.id) : '';
  const addons = useMemo<AddOn[]>(
    () =>
      (experienceAddons[addonKey] ?? [])
        .filter((a) => a && a.isActive !== false)
        .map((a) => {
          const price = a.isFree ? 0 : Number(a.effectivePrice) || 0;
          return {
            id: a.addonId,
            name: a.name,
            description: a.description?.trim() || undefined,
            price,
            basePrice: Number(a.basePrice) || 0,
            // A zero price is free to the guest, whatever the flag says.
            isFree: !!a.isFree || price <= 0,
            thumbnailUrl: a.thumbnailUrl || a.heroUrl || undefined,
            added: selectedAddons.includes(a.addonId),
          };
        }),
    [experienceAddons, addonKey, selectedAddons],
  );

  // The rest of the catalogue, excluding anything already attached to this experience.
  const extraAddons = useMemo<AddOn[]>(() => {
    const attached = new Set(addons.map((a) => a.id));
    return (addonCatalogue ?? [])
      .filter((a) => a && a.isActive !== false && !attached.has(a.id))
      .map((a) => {
        const price = a.isFree ? 0 : Number(a.effectivePrice) || Number(a.basePrice) || 0;
        return {
          id: a.id,
          name: a.name,
          description: a.description?.trim() || undefined,
          price,
          basePrice: Number(a.basePrice) || 0,
          // A zero price is free to the guest, whatever the flag says.
          isFree: !!a.isFree || price <= 0,
          thumbnailUrl: a.thumbnailUrl || a.heroUrl || undefined,
          added: selectedAddons.includes(a.id),
        };
      });
  }, [addonCatalogue, addons, selectedAddons]);

  // Everything ticked, wherever it was ticked, drives the summary and the total.
  const chosenAddons = useMemo(() => [...addons, ...extraAddons].filter((a) => a.added), [addons, extraAddons]);

  // The panel lists this experience's own add-ons plus any extra the guest picked further
  // down the page, so everything being charged can be seen and removed in one place.
  const panelAddons = useMemo(
    () => [...addons, ...extraAddons.filter((a) => a.added)],
    [addons, extraAddons],
  );

  const stickyTop = useStickyTop(asideRef, [vm?.id, addons]);

  // FAQ = this experience's own entries, the global FAQs from the API, then "what to bring"
  // and terms when they exist. With none of these the section and its nav tab are hidden.
  const { faqs: globalFaqs } = useFaqs();
  const faqs = useMemo<FaqItem[]>(() => {
    if (!vm) return [];
    return [
      ...vm.faqs,
      ...globalFaqs.map((f) => ({ q: f.question, a: f.answer })),
      ...(vm.whatToBring ? [{ q: 'What should I bring or arrange?', a: vm.whatToBring }] : []),
      ...(vm.termsConditions ? [{ q: 'Terms and conditions', a: vm.termsConditions }] : []),
    ];
  }, [vm, globalFaqs]);

  const sections = useMemo<SectionNavItem[]>(() => {
    if (!vm) return [];
    return [
      (vm.description || vm.shortDescription) && { id: 'overview', label: 'Overview' },
      vm.inclusions.length > 0 && { id: 'included', label: "What's included" },
      extraAddons.length > 0 && { id: 'addons', label: 'Add-ons' },
      { id: 'how', label: 'How it works' },
      { id: 'reviews', label: 'Reviews' },
      vm.cancellationPolicies.length > 0 && { id: 'policy', label: 'Cancellation' },
      faqs.length > 0 && { id: 'faq', label: 'FAQ' },
    ].filter(Boolean) as SectionNavItem[];
  }, [vm, faqs, extraAddons]);

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[var(--bg-main)] px-4">
        <div className="max-w-md text-center bg-white rounded-3xl border border-[var(--border-light)] p-10 shadow-[var(--shadow-soft)]">
          <p style={{ fontFamily: FONT_SERIF }} className="text-[1.8rem] font-semibold text-[var(--charcoal)]">We couldn't load this experience</p>
          <p style={{ fontFamily: FONT_SANS }} className="mt-2 text-[0.9rem] text-[var(--mid)]">{error}</p>
          <Link to="/" style={{ fontFamily: FONT_SANS }} className="mt-6 inline-flex items-center gap-2 text-[var(--burgundy)] font-semibold hover:underline underline-offset-4">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (loading || !vm || !isCurrent) return <DetailSkeleton />;

  const toggleAddon = (addonId: number) =>
    setSelectedAddons((prev) => (prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]));
  const addonsTotal = chosenAddons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = vm.basePrice + addonsTotal;

  const crumbs = [
    { label: 'Home', to: '/' },
    { label: vm.categoryName, to: `/category/${vm.categorySlug}` },
    ...(vm.subCategoryId ? [{ label: vm.subCategoryName, to: `/subcategory/${vm.subCategoryId}` }] : []),
    { label: vm.name },
  ];

  return (
    <div className="bg-[var(--bg-main)] pb-28 lg:pb-16">
      <div className="max-w-[var(--container-width)] mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-5">
        <Breadcrumbs items={crumbs} />

        {/* Page opens on the gallery and booking panel (which carries the name and price); the panel
            stays pinned on the right. Phones: gallery -> booking -> sections. */}
        <div className="mt-3.5 grid lg:grid-cols-12 gap-x-6 gap-y-5 xl:gap-x-10 items-start">
          <div className="min-w-0 lg:col-span-7 lg:row-start-1">
            <Gallery key={vm.id} media={vm.media} name={vm.name} />
          </div>

          <aside ref={asideRef} style={{ top: stickyTop }} className="min-w-0 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 lg:sticky self-start">
            <BookingCard
              experience={vm}
              addons={panelAddons}
              toggleAddon={toggleAddon}
              selectedAddons={chosenAddons}
              totalPrice={totalPrice}
              onViewReviews={() => scrollToId('reviews')}
            />
          </aside>

          <div className="min-w-0 lg:col-span-7 lg:col-start-1 lg:row-start-2">
            <SectionNav items={sections} />

            {/* Sections number themselves as chapters from this counter (see SectionCard) */}
            <div className="[counter-reset:chapter]">
              <Overview experience={vm} />
              {vm.inclusions.length > 0 && <Inclusion items={vm.inclusions} />}
              <MoreAddOns items={extraAddons} toggleAddon={toggleAddon} onReview={() => scrollToId('booking-card')} />
              <HowItWorks />
              <Reviews rating={vm.rating} reviewCount={vm.reviewCount} />
              {vm.cancellationPolicies.length > 0 && <CancellationPolicy policies={vm.cancellationPolicies} />}
              {faqs.length > 0 && <FAQ items={faqs} />}
            </div>
          </div>
        </div>

        <RelatedExperiences
          items={String(vm.subCategoryId) === subCategoryKey ? subCategoryExperiences : []}
          fallbackItems={allExperiences}
          currentId={vm.id}
          categoryId={vm.categoryId}
          categoryName={vm.categoryName}
          categorySlug={vm.categorySlug}
          subCategoryId={vm.subCategoryId}
          subCategoryName={vm.subCategoryName}
          loading={allExperiences.length === 0}
        />
      </div>

      {/* <GiftSlider /> */}

      <MobileBookingBar totalPrice={totalPrice} originalPrice={vm.originalPrice + addonsTotal} discount={vm.discount} onBook={() => scrollToId('booking-card')} />
    </div>
  );
}
