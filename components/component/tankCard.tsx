"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Urgency = "today" | "soon" | "upcoming" | "passed" | "none";

/** Визуальный тон + иконка для каждого состояния обслуживания.
 *  Иконка обязательна: одним цветом статус передавать нельзя. */
const URGENCY_STYLES: Record<
  Urgency,
  { chip: string; icon: typeof CalendarClock }
> = {
  today: {
    chip: "bg-maintenance-today/15 text-maintenance-today border-maintenance-today/30",
    icon: AlertTriangle,
  },
  soon: {
    chip:
      "bg-maintenance-tomorrow/15 text-maintenance-tomorrow border-maintenance-tomorrow/30",
    icon: Clock,
  },
  upcoming: {
    chip:
      "bg-maintenance-upcoming/15 text-maintenance-upcoming border-maintenance-upcoming/30",
    icon: CheckCircle2,
  },
  passed: {
    chip: "bg-maintenance-passed/15 text-maintenance-passed border-maintenance-passed/30",
    icon: AlertTriangle,
  },
  none: {
    chip: "bg-muted text-muted-foreground border-border",
    icon: CalendarClock,
  },
};

export default function TankCard({
  aquarium,
  notAssignedText,
}: {
  aquarium: any;
  notAssignedText?: string;
}) {
  const t = useTranslations("AquariumForm");
  const locale = useLocale();
  const [imgError, setImgError] = useState(false);

  const imageUrl = aquarium.images?.[0]?.url || aquarium.image || "/app-logo.svg";
  const hasPhoto = Boolean(aquarium.images?.length) && !imgError;

  // Раньше это состояние держалось в useState и пересчитывалось в useEffect.
  // Оно целиком выводится из пропсов, поэтому считаем прямо при отрисовке —
  // на один лишний рендер каждой карточки меньше.
  const { urgency, dateLabel, relativeLabel } = useMemo(() => {
    const pending = aquarium.maintenance
      ?.filter((m: any) => m.status === "PENDING")
      .sort(
        (a: any, b: any) =>
          new Date(a.performedAt).getTime() - new Date(b.performedAt).getTime()
      );
    const next = pending?.length ? pending[0] : null;

    if (!next) {
      return {
        urgency: "none" as Urgency,
        dateLabel: notAssignedText ?? "—",
        relativeLabel: null as string | null,
      };
    }

    const serviceDate = new Date(next.performedAt);
    // Дата форматируется по текущей локали интерфейса; прежде здесь было
    // жёстко зашито "ru-RU" независимо от выбранного языка
    const formatted = serviceDate.toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const diffDays = Math.ceil(
      (serviceDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0)
      return {
        urgency: "passed" as Urgency,
        dateLabel: formatted,
        relativeLabel: t("passed"),
      };
    if (diffDays === 0)
      return {
        urgency: "today" as Urgency,
        dateLabel: formatted,
        relativeLabel: t("today"),
      };
    if (diffDays === 1)
      return {
        urgency: "soon" as Urgency,
        dateLabel: formatted,
        relativeLabel: t("tomorrow"),
      };
    if (diffDays === 2)
      return {
        urgency: "soon" as Urgency,
        dateLabel: formatted,
        relativeLabel: t("afterTomorrow"),
      };
    if (diffDays === 3)
      return {
        urgency: "soon" as Urgency,
        dateLabel: formatted,
        relativeLabel: t("in3Days"),
      };
    return {
      urgency: "upcoming" as Urgency,
      dateLabel: formatted,
      relativeLabel: `${t("inDays")} ${diffDays} ${t("days")}`,
    };
  }, [aquarium.maintenance, notAssignedText, locale, t]);

  const { chip, icon: StatusIcon } = URGENCY_STYLES[urgency];

  return (
    <Link
      href={`/myTanks/${aquarium.id}`}
      className="surface-panel surface-interactive group flex h-full flex-col overflow-hidden"
    >
      {/* Фиксированное соотношение сторон вместо жёсткой высоты карточки:
          картинка не растягивается и не даёт сдвига при загрузке */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <Image
          src={imgError ? "/app-logo.svg" : imageUrl}
          alt={aquarium.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className={cn(
            "transition-transform duration-slow ease-out-soft group-hover:scale-[1.04]",
            hasPhoto ? "object-cover" : "object-contain p-8 opacity-60"
          )}
          onError={() => setImgError(true)}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug sm:text-lg">
          {aquarium.name}
        </h3>

        <div
          className={cn(
            "mt-auto flex items-start gap-2.5 rounded-lg border px-3 py-2.5",
            chip
          )}
        >
          <StatusIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-[0.6875rem] font-semibold uppercase tracking-wide opacity-80">
              {t("nextService")}
            </span>
            <span
              data-numeric
              className="block truncate text-sm font-bold text-foreground"
            >
              {dateLabel}
            </span>
            {relativeLabel && (
              <span className="block truncate text-xs font-medium">
                {relativeLabel}
              </span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
