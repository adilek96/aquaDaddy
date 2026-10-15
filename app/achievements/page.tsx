import type { ComponentType } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Fish, Sprout, Wrench, CheckCircle2, Lock, Trophy, ChevronLeft } from "lucide-react";
import { auth } from "@/auth";
import {
  getAchievementsState,
  type AchievementCategory,
  type AchievementState,
} from "@/lib/achievements";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_ORDER: AchievementCategory[] = [
  "inhabitants",
  "plants",
  "maintenance",
  "checkins",
];

const CATEGORY_ICON: Record<
  AchievementCategory,
  ComponentType<{ className?: string }>
> = {
  inhabitants: Fish,
  plants: Sprout,
  maintenance: Wrench,
  checkins: CheckCircle2,
};

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signIn");
  }

  const locale = await getLocale();
  const t = await getTranslations("Achievements");

  const { items } = await getAchievementsState(session.user.id);

  const earnedCount = items.filter((i) => i.earned).length;
  const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <div className="app-container py-6 sm:py-10">
      <Link
        href="/profile"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        {t("backToProfile")}
      </Link>

      <header className="mb-6 animate-fade-in-up sm:mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-warning" aria-hidden="true" />
          <h1 className="mb-0">{t("title")}</h1>
        </div>
        <p className="measure mt-2 text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
        <p data-numeric className="mt-3 text-sm font-semibold text-primary">
          {t("unlockedCount", { earned: earnedCount, total: items.length })}
        </p>
      </header>

      <div className="space-y-8 sm:space-y-10">
        {CATEGORY_ORDER.map((category) => {
          const list = items.filter((i) => i.category === category);
          if (list.length === 0) return null;
          const Icon = CATEGORY_ICON[category];

          return (
            <section key={category}>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold sm:mb-4 sm:text-xl">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                {t(`categories.${category}` as "categories.inhabitants")}
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
                {list.map((item) => (
                  <li key={item.key}>
                    <AchievementCard
                      item={item}
                      icon={Icon}
                      title={t(`item.${category}.title` as "item.inhabitants.title", {
                        n: item.threshold,
                      })}
                      desc={t(`item.${category}.desc` as "item.inhabitants.desc", {
                        n: item.threshold,
                      })}
                      earnedLabel={
                        item.earnedAt
                          ? t("earnedOn", { date: dateFmt.format(new Date(item.earnedAt)) })
                          : t("locked")
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AchievementCard({
  item,
  icon: Icon,
  title,
  desc,
  earnedLabel,
}: {
  item: AchievementState;
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  earnedLabel: string;
}) {
  const pct = Math.min(100, Math.round((item.progress / item.threshold) * 100));

  return (
    <div
      className={cn(
        "surface-panel flex h-full flex-col gap-3 p-4 transition-colors",
        item.earned ? "border-warning/40 bg-warning/5" : "opacity-90"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
            item.earned ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"
          )}
        >
          {item.earned ? (
            <Icon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Lock className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
        {item.earned && (
          <Trophy className="h-4 w-4 text-warning" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-base font-bold leading-snug">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>

      {/* Прогресс: для закрытых — сколько осталось, для открытых — заполнено */}
      <div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full",
              item.earned ? "bg-warning" : "bg-primary"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span data-numeric>
            {Math.min(item.progress, item.threshold)} / {item.threshold}
          </span>
          <span className={cn(item.earned && "font-semibold text-warning")}>
            {earnedLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
