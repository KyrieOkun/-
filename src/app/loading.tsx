export default function Loading() {
  return (
    <div className="pt-14" aria-busy="true" aria-live="polite">
      <div className="container-x py-16">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-mist" />
        <div className="mt-4 h-4 w-96 max-w-full animate-pulse rounded-lg bg-mist" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-3xl bg-mist" />
          ))}
        </div>
      </div>
    </div>
  );
}
