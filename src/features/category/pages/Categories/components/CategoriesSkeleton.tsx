const Block = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-2xl bg-[var(--rose-light)]/60 ${className}`} />
);

/** Placeholder grid shown while GET /public/categories is in flight (matches the compact cards). */
export default function CategoriesSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading categories"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white">
          <Block className="aspect-[4/3] w-full rounded-none" />
          <div className="flex h-11 items-center gap-1.5 px-2.5">
            <Block className="h-6 w-16 rounded-full" />
            <Block className="h-6 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
