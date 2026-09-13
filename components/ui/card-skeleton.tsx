/**
 * Скелетон карточки аквариума. Занимает ровно ту же высоту, что и настоящая
 * карточка, поэтому при подмене контента страница не дёргается (CLS = 0).
 * Раньше на время загрузки показывался текст «Loading...» в блоке h-[50vh] —
 * список после загрузки прыгал.
 */
export function CardSkeleton() {
  return (
    <div className="surface-panel overflow-hidden" aria-hidden="true">
      <div className="skeleton h-40 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-12 w-full" />
      </div>
    </div>
  );
}

export function CardSkeletonGrid({
  count = 8,
  label,
}: {
  count?: number;
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5"
    >
      {label && <span className="sr-only">{label}</span>}
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
