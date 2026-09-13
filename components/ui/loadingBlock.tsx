import { Loader2 } from "lucide-react";

/**
 * Общий индикатор загрузки. Раньше это был текст «Loading...» размером 2xl
 * в блоке h-[50vh] — половина экрана пустоты, после которой контент резко
 * подставлялся. Теперь компактный спиннер: текст остаётся для скринридеров.
 */
export default function LoadingBlock({ translate }: { translate: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex w-full flex-col items-center justify-center gap-3 py-16 text-muted-foreground"
    >
      <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm font-medium">{translate}</span>
    </div>
  );
}
