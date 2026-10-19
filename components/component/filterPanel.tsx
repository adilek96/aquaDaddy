"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Сворачиваемая панель фильтров и сортировки энциклопедии.
 *
 * По умолчанию раскрыта, если фильтры уже применены (count > 0) — чтобы при
 * выборе значений (а это навигация по ссылкам) панель не захлопывалась. Сами
 * фильтры — серверные ссылки, приходят как children.
 */
export default function FilterPanel({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(count > 0);

  return (
    <div className="mb-6 border-t border-surface-border pt-4 sm:mb-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="tap-fast inline-flex h-9 items-center gap-2 rounded-full border border-surface-border bg-transparent px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        {label}
        {count > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
            {count}
          </span>
        )}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && <div className="mt-4 flex flex-col gap-3">{children}</div>}
    </div>
  );
}
