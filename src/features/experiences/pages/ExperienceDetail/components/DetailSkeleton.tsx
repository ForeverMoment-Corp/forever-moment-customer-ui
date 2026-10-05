const Block = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-2xl bg-[var(--rose-light)]/60 ${className}`} />
);

export default function DetailSkeleton() {
  return (
    <div className="bg-[var(--bg-main)] min-h-screen" aria-busy="true" aria-label="Loading experience">
      <div className="max-w-[var(--container-width)] mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
        <Block className="h-3 w-56 rounded-full" />
        <div className="mt-6 flex items-end justify-between gap-6">
          <div className="flex-1 space-y-3">
            <Block className="h-3 w-32 rounded-full" />
            <Block className="h-11 w-3/4 max-w-xl" />
            <Block className="h-4 w-80 max-w-full rounded-full" />
          </div>
          <div className="hidden md:flex gap-2">
            <Block className="h-10 w-24 rounded-full" />
            <Block className="h-10 w-24 rounded-full" />
          </div>
        </div>
        <div className="mt-7 grid lg:grid-cols-12 gap-8 xl:gap-10">
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            <div className="order-2 md:order-1 flex md:flex-col gap-2.5 md:w-[88px] shrink-0">
              {[0, 1, 2, 3].map((i) => (
                <Block key={i} className="w-[72px] h-[72px] md:w-full md:h-[80px] rounded-xl" />
              ))}
            </div>
            <Block className="order-1 md:order-2 flex-1 aspect-[4/3] md:aspect-[5/4] rounded-3xl" />
          </div>
          <div className="lg:col-span-5 rounded-[26px] border border-[var(--border-light)] bg-white p-6 space-y-5">
            <Block className="h-3 w-24 rounded-full" />
            <Block className="h-10 w-44" />
            <Block className="h-24 w-full" />
            <Block className="h-12 w-full" />
            <Block className="h-32 w-full" />
            <Block className="h-14 w-full" />
          </div>
        </div>
        <div className="mt-8 lg:w-[58%] space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Block key={i} className="h-16 w-full" />
            ))}
          </div>
          <Block className="h-40 w-full rounded-3xl" />
          <Block className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
