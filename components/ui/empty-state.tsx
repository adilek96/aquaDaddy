import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Пустое состояние. Раньше собиралось из пяти вложенных motion.div со
 * ступенчатыми задержками — ради статичного блока это тянуло рантайм анимаций
 * в каждую страницу со списком. Тот же эффект даёт CSS-анимация из конфига,
 * которая вдобавок сама отключается при prefers-reduced-motion.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="surface-panel flex animate-fade-in-up flex-col items-center justify-center px-6 py-14 text-center sm:py-20">
      {icon && (
        <div
          aria-hidden="true"
          className="mb-5 grid h-20 w-20 place-items-center rounded-2xl bg-primary/10 text-primary"
        >
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-xl sm:text-2xl">{title}</h3>
      {description && (
        <p className="measure mb-7 text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
