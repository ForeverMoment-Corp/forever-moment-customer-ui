const Block = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-2xl bg-[var(--rose-light)]/60 ${className}`} />
);

/** Placeholder grid shown while GET /public/categories is in flight. */
export default function CategoriesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      aria-busy="true"
      aria-label="Loading categories"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-[26px] border border-[var(--border-light)] bg-white overflow-hidden"
        >
          <Block className="h-48 w-full rounded-none" />
          <div className="p-5 space-y-3">
            <Block className="h-3 w-24 rounded-full" />
            <Block className="h-7 w-2/3" />
            <Block className="h-3 w-full rounded-full" />
            <div className="flex gap-2 pt-1">
              <Block className="h-7 w-24 rounded-full" />
              <Block className="h-7 w-20 rounded-full" />
              <Block className="h-7 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
