export function CardSkeleton() {
  return (
    <div className="bg-white overflow-hidden">
      <div className="aspect-[4/3] shimmer-bg" />
      <div className="p-4 space-y-2">
        <div className="h-4 shimmer-bg rounded w-3/4" />
        <div className="h-3 shimmer-bg rounded w-1/2" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CarouselSkeleton() {
  return (
    <div className="w-full h-[55vh] md:h-[75vh] shimmer-bg" />
  );
}
