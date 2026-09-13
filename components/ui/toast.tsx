"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  leaving?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

const VISIBLE_MS = 5000;
const EXIT_MS = 180;

/**
 * Тосты. Раньше провайдер тянул motion/AnimatePresence, а так как он живёт в
 * корневом layout, рантайм анимаций попадал в бандл каждой страницы — включая
 * те, где ни одного тоста не показывается. Появление и уход теперь на CSS.
 *
 * Заодно добавлен aria-live: без него сообщение вообще не доходило до
 * скринридера, а таймеры автозакрытия не очищались при размонтировании.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const timers = React.useRef<Map<string, ReturnType<typeof setTimeout>[]>>(
    new Map()
  );

  const clearTimers = React.useCallback((id: string) => {
    timers.current.get(id)?.forEach(clearTimeout);
    timers.current.delete(id);
  }, []);

  const removeToast = React.useCallback(
    (id: string) => {
      clearTimers(id);
      // Сначала помечаем уходящим — CSS проигрывает исчезновение,
      // и только потом убираем из списка
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
      );
      const t = setTimeout(
        () => setToasts((prev) => prev.filter((x) => x.id !== id)),
        EXIT_MS
      );
      timers.current.set(id, [t]);
    },
    [clearTimers]
  );

  const showToast = React.useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      const t = setTimeout(() => removeToast(id), VISIBLE_MS);
      timers.current.set(id, [t]);
    },
    [removeToast]
  );

  // Снимаем все таймеры при размонтировании провайдера
  React.useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((list) => list.forEach(clearTimeout));
      map.clear();
    };
  }, []);

  const value = React.useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        // role=status + aria-live: сообщение зачитывается, но фокус не крадётся
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-toast flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:max-w-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-raised backdrop-blur-xl ${getToastStyles(
              toast.type
            )} ${toast.leaving ? "animate-out fade-out zoom-out-95" : "animate-fade-in-up"}`}
          >
            {getToastIcon(toast.type)}
            <p className="flex-1 text-sm font-semibold text-foreground">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="-m-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg opacity-70 transition-opacity hover:opacity-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function getToastStyles(type: ToastType): string {
  switch (type) {
    // Цвета берём из семантических токенов: они настроены отдельно
    // для светлой и тёмной темы и проходят по контрасту в обеих
    case "success":
      return "border-success/40 bg-success/10 text-success";
    case "error":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    case "warning":
      return "border-warning/40 bg-warning/10 text-warning";
    case "info":
    default:
      return "border-primary/40 bg-primary/10 text-primary";
  }
}

function getToastIcon(type: ToastType) {
  const className = "h-5 w-5 shrink-0";
  switch (type) {
    case "success":
      return <CheckCircle2 className={className} aria-hidden="true" />;
    case "error":
      return <XCircle className={className} aria-hidden="true" />;
    case "warning":
      return <AlertTriangle className={className} aria-hidden="true" />;
    case "info":
    default:
      return <Info className={className} aria-hidden="true" />;
  }
}
