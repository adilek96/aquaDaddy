"use client";

import { Pencil, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Заголовок секции на странице аквариума. Раньше эта разметка была скопирована
 * 13 раз подряд, причём с классами flex-col sm:flex-row: на телефоне кнопка
 * редактирования уезжала под заголовок отдельной строкой слева. Здесь она
 * всегда стоит справа и имеет тач-цель 44×44.
 */
export function SectionHeading({
  title,
  onEdit,
  loading = false,
  editLabel,
  className,
  as: Tag = "h2",
}: {
  title: React.ReactNode;
  onEdit?: () => void;
  loading?: boolean;
  editLabel?: string;
  className?: string;
  as?: "h2" | "h3" | "div";
}) {
  return (
    <Tag
      className={cn(
        "mb-4 flex min-h-[44px] items-center justify-between gap-3 border-b border-surface-border pb-2.5",
        "font-display text-sm font-bold uppercase tracking-wider text-muted-foreground sm:mb-5 sm:text-base",
        className
      )}
    >
      <span className="min-w-0 truncate text-foreground">{title}</span>

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={loading}
          aria-label={editLabel}
          aria-busy={loading}
          title={editLabel}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Pencil className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
    </Tag>
  );
}
