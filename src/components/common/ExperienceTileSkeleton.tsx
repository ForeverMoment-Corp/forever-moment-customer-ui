/** Placeholder with the same footprint as an ExperienceTile, for grids that are still loading. */
export default function ExperienceTileSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-light)] bg-white" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-[var(--rose-light)]/70" />
      <div className="space-y-2 p-3.5">
        <div className="h-2.5 w-20 animate-pulse rounded-full bg-[var(--rose-light)]/70" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-[var(--rose-light)]/70" />
        <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-[var(--rose-light)]/70" />
        <div className="h-5 w-24 animate-pulse rounded bg-[var(--rose-light)]/70" />
      </div>
    </div>
  );
}
